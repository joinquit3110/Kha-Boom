// =============================================================================
// Stewie AI Utilities (RAG + Provider Fallbacks)
// (c) Kha-Boom!
// =============================================================================


import type express from 'express';
import fetch from 'node-fetch';
import {FilterXSS} from 'xss';
import {search, SEARCH_DOCS} from '../search';
import type {APIResponse, Course} from '../interfaces';
import {Progress} from '../models/progress';


const sanitize = new FilterXSS({whiteList: {a: ['href'], strong: [], b: [], em: [], i: [], u: []}});


function getSectionFromReferer(req: express.Request): string|undefined {
  const ref = req.get('referer') || req.get('referrer') || '';
  const m = ref.match(/\/course\/([^/]+)\/([^/?#]+)/i);
  return m?.[2];
}

function getRagContext(query: string, max = 4): string {
  try {
    const results = ((search(query) || []) as unknown as string[]).slice(0, max);
    if (!results.length) return '';
    return results.map((r: string, i: number) => `[#${i + 1}] ${r}`).join('\n\n');
  } catch {
    return '';
  }
}

function buildSystemPrompt(course: Course, learnerName?: string) {
  const name = learnerName || 'Learner';
  return [
    'You are Stewie, the friendly AI tutor for Kha-Boom! (khaboom).',
    'Style: concise, encouraging, step-by-step. Use simple language.',
    `Address the student by name when appropriate (Name: ${name}).`,
    'Focus on the current course context. If unsure, say so briefly and suggest next steps.',
    'Prefer using examples from the course. Keep answers under ~6 sentences unless asked to elaborate.'
  ].join(' ');
}

function buildUserPrompt(query: string, course: Course, sectionId?: string, rag = '', learningState = '') {
  const header = [`Course: ${course.title} (${course.id})`, sectionId ? `Section: ${sectionId}` : undefined]
      .filter(Boolean).join('\n');
  const ragBlock = rag ? `\n\nRelevant Notes from Course/Glossary:\n${rag}` : '';
  const stateBlock = learningState ? `\n\nLearner State:\n${learningState}` : '';
  return `${header}${stateBlock}${ragBlock}\n\nUser Question: ${query}`;
}

async function callOllama(prompt: string, system: string) {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3:instruct';
  const res = await fetch(`${host}/api/generate`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      model,
      prompt,
      system,
      stream: false,
      options: {temperature: 0.6}
    })
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}`);
  const data = await res.json() as {response?: string};
  return data.response?.trim() || '';
}

async function callGroq(prompt: string, system: string) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('Missing GROQ_API_KEY');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      temperature: 0.6,
      messages: [
        {role: 'system', content: system},
        {role: 'user', content: prompt}
      ]
    })
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json() as any;
  return (data.choices?.[0]?.message?.content || '').trim();
}

async function callOpenAI(prompt: string, system: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Missing OPENAI_API_KEY');
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        {role: 'system', content: system},
        {role: 'user', content: prompt}
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json() as any;
  return (data.choices?.[0]?.message?.content || '').trim();
}

async function callProvider(prompt: string, system: string) {
  // Priority: OpenAI -> Groq -> Ollama
  if (process.env.OPENAI_API_KEY) return callOpenAI(prompt, system);
  if (process.env.GROQ_API_KEY) return callGroq(prompt, system);
  return callOllama(prompt, system);
}

export async function askStewie(req: express.Request, course: Course): Promise<APIResponse<{content: string, kind: string}[]>> {
  try {
    const query = (req.body?.query || '').toString().slice(0, 2000).trim();
    if (!query) return {status: 400, message: 'Empty query.'};

    const sectionId = getSectionFromReferer(req);
    const learnerName = req.user?.shortName || undefined;
    const system = buildSystemPrompt(course, learnerName);
    const rag = getRagContext(query, 5);

    // Summarise learner state from progress (best-effort, capped for brevity)
    let learningState = '';
    try {
      const progress = await Progress.lookup(req, course.id);
      if (progress) {
        const sectionData = sectionId ? await progress.getSectionData(sectionId) : undefined;
        const completed = sectionData?.completed ? 'yes' : 'no';
        const active = sectionData?.activeStep || 'unknown';
        const scoredSteps = Object.entries(sectionData?.steps || {})
          .map(([k, v]) => `${k}:${(v.scores || []).length}`)
          .slice(0, 6)
          .join(', ');
        learningState = `completed_section=${completed}; active_step=${active}; scores_per_step={${scoredSteps}}`;
      }
    } catch {}

    const prompt = buildUserPrompt(query, course, sectionId, rag, learningState);

    let answer = '';
    try {
      answer = await callProvider(prompt, system);
    } catch (e) {
      // Soft fallback: suggest glossary hits if model not available
      const alt = rag ? `Tôi chưa thể dùng AI lúc này. Dưới đây là vài mục liên quan:\n\n${rag}` : 'Xin lỗi, Stewie hiện không thể trả lời. Hãy thử lại sau.';
      answer = alt;
    }

    const safe = sanitize.process(answer).trim();

    // Persist last exchanges (optional, capped)
    try {
      const progress = await Progress.lookup(req, course.id, true);
      if (progress) {
        const msgs = progress.messages || [];
        msgs.push({content: query, kind: 'question'});
        msgs.push({content: safe, kind: 'hint'});
        while (msgs.length > 40) msgs.shift();
        progress.messages = msgs as any;
        await progress.save();
      }
    } catch {}

    return {status: 200, data: [
      {content: safe, kind: 'hint'}
    ]};
  } catch (error) {
    return {status: 500, message: (error as Error).message};
  }
}


