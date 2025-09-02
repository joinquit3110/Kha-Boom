// =============================================================================
// Course Scripts
// (c) Kha-Boom!
// =============================================================================


// BUILD SENTINELS (placed first to avoid any elimination) -------------------------------------------------
// Unique literal to search for in final bundle and raw bundle. Should never be removed.
// eslint-disable-next-line no-console
console.log('[KB DEBUG] COURSE_TS_INIT_SENTINEL', 'KB_SENTINEL_UNIQUE_V1');
// Direct global writes (observable side-effects) so minifier cannot DCE them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any)['__KB_COURSE_BUILD_MARK'] = 'KB_MARK_V2';
// Additional marker to broaden search surface.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any)['__KB_COURSE_UNIQUE_STR'] = 'KB_SENTINEL_UNIQUE_V1';
// ----------------------------------------------------------------------------------------------------------

import {last, total} from '@mathigon/core';
import {$body, Browser, CustomElementView, deferredPost, ElementView, register} from '@mathigon/boost';

// Force load progress component early (side-effect import) so it can't be tree-shaken.
import './components/progress/progress';
import {Progress, FORCE_PROGRESS_INCLUDED as __KB_PROGRESS_TOKEN} from './components/progress/progress';
// Runtime reference to Progress to ensure esbuild cannot tree-shake the module (beyond type-only usage).
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-console
const __KB_PROGRESS_CLASS_REF = (window as any).__KB_PROGRESS_CLASS_REF = Progress;
// eslint-disable-next-line no-console
console.log('[KB DEBUG] course.ts Progress class ref', typeof __KB_PROGRESS_CLASS_REF);
// eslint-disable-next-line no-console
console.log('[KB DEBUG] course.ts imported progress component', __KB_PROGRESS_TOKEN);
// Legacy sentinel logging kept (now emits updated mark value).
// eslint-disable-next-line no-console
console.log('[KB DEBUG] __KB_COURSE_BUILD_MARK set (post-import region)', (window as any)['__KB_COURSE_BUILD_MARK']);
// Minimal runtime assertion to confirm progress module sentinel object exists.
// eslint-disable-next-line no-console
console.log('[KB DEBUG] progress runtime assertion', (window as any).__KB_PROGRESS_SENTINEL?.tag, (window as any).__KB_PROGRESS_SENTINEL?.palette?.length);
import {AudioSegment} from './components/step/narration';
import {Step} from './components/step/step';
import {Tutor} from './components/tutor/tutor';

import './main';

import './components/blank/blank';
import './components/blank/blank-mc';
import './components/free-text/free-text';
import './components/gallery/gallery';
import './components/gesture/gesture';
import './components/gloss/gloss';
import './components/image/image';
import './components/picker/picker';
import './components/slider/slider';
import './components/slideshow/slideshow';
import './components/sidebar/sidebar';
import './components/sortable/sortable';
import './components/step/step';
import './components/tabbox/tabbox';
import './components/target/target';
import './components/tutor/tutor';
import './components/variable/variable';
import './components/video/play-btn';
import './components/video/video';


@register('x-course')
export class Course extends CustomElementView {
  isCompleted = false;
  isReady = false;
  $steps!: Step[];
  $activeStep?: Step;

  userData?: any;
  $tutor?: Tutor;
  audio?: AudioSegment;

  private $footer!: ElementView;
  private $skipStep!: ElementView;
  private $progress!: Progress;
  private $stepsWrap!: ElementView;

  created() {
    this.userData = window.progressData || JSON.parse(this.$('#userdata')!.text) || {};

    this.$steps = this.$$('x-step') as Step[];
    for (const $s of this.$steps) $s.on('score', () => this.trigger('score'));

    // TODO Only load audio when clicking play the first time.
    if (this.data.audio) this.audio = new AudioSegment(this.data.audio);
  }

  ready() {
    this.$footer = this.$('footer')!;
    this.$skipStep = this.$footer.$('.skip-step')!;
    this.$progress = this.$('.sidebar-row.active x-progress') as Progress;
    this.$tutor = this.$('x-tutor') as Tutor|undefined;
    this.$stepsWrap = this.$('.steps')!;

    const stepFromHash = this.findStep(Browser.getHash());
    const stepFromDb = this.findStep(this.userData.activeStep);

    this.$activeStep = stepFromDb || this.$steps[0];
    for (const $step of this.$steps) {
      $step.show();
      if ($step === this.$activeStep) break;
      $step.complete();
    }

    if (this.userData.completed || Browser.getHash() === 'full' || this.data.reveal) {
      // Reveal the entire course content at once, without progressive reveal.
      this.complete();
    } else {
      while (this.$activeStep && this.$activeStep.isReady && !this.isCompleted) {
        this.nextStep();
      }
    }

    if (stepFromHash || (stepFromDb && !this.userData.completed)) {
      this.goToStep(stepFromHash || stepFromDb!, false);
    }

    if (this.$('.section-dev')) this.complete();  // "Under development" warning

    const $reveal = this.$('.reveal-banner')!;
    setTimeout(() => {
      if (this.isCompleted) return;
      $reveal.removeClass('off');
      this.on('score complete', () => $reveal.addClass('off'));
    }, 1500);
    $reveal.$('.complete')!.one('click', () => this.complete());

    $body.onKey('Space', e => {
      e.preventDefault();
      this.nextStep();
      $reveal.addClass('off');
    });

    this.$footer.$('.skip')!.on('click', () => this.nextStep());
    this.$footer.$('.show-all')!.on('click', () => this.complete());
    this.$footer.show();  // We hide the footer initially, to prevent CLS.

    this.isReady = true;
    setTimeout(() => this.addClass('ready'));
    // Ensure the root always reserves space for the scrollbar to avoid width jank
    try {
      document.documentElement.style.scrollbarGutter = 'stable both-edges';
    } catch {}

    // DEV: Diagnose extra scrollbars and progress attribute issues.
    if ((window as any).KB_DEBUG_SCROLL !== false) {
      setTimeout(() => {
        const scrollables: any[] = [];
        document.querySelectorAll('*').forEach(el => {
          const st = getComputedStyle(el as HTMLElement);
          if ((st.overflowY === 'auto' || st.overflowY === 'scroll') && (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight + 4) {
            scrollables.push({el, h: (el as HTMLElement).clientHeight, sh: (el as HTMLElement).scrollHeight, cls: (el as HTMLElement).className});
          }
        });
        // eslint-disable-next-line no-console
        console.log('[KB DEBUG] Scrollable elements:', scrollables.map(s => ({h:s.h, sh:s.sh, cls:s.cls, tag:(s.el as HTMLElement).tagName})));
        // Progress colour sanity
        const $p = this.$('.sidebar-row.active x-progress') as Progress;
        if ($p) {
          // eslint-disable-next-line no-console
          console.log('[KB DEBUG] Progress element dasharray:', ($p as any).$progress?.attr?.('stroke-dasharray'));
        }
      }, 800);
    }
  }


  // ---------------------------------------------------------------------------
  // Step Navigation

  nextStep() {
    if (this.isCompleted) return;
    let $step = this.$activeStep!;

    do {
      $step.complete();
      $step = this.$steps[this.$steps.indexOf($step) + 1];
      if (!$step) return this.complete(true);
      $step.show();
    } while ($step.isReady);

    this.$activeStep = $step;
    this.saveProgress({activeStep: $step.id});
  }

  goToStep($step: Step, animated = true) {
    for (const $s of this.$steps) {
      if (!$s.isShown) this.$activeStep = $s;
      $s.show();
      if ($step.isShown && !$s.isReady) break;
      $s.complete();
    }

    const targetScroll = $step.positionTop - Math.max(50, (Browser.height - $step.height) / 2);
    if (animated) {
      $body.scrollTo(targetScroll);
    } else {
      $body.scrollTop = targetScroll;
    }

    const $last = last(this.$steps);
    if ($last.isShown && $last.isReady) return this.complete();
    if (this.$activeStep) this.saveProgress({activeStep: this.$activeStep.id});
  }

  complete(animated = false) {
    if (this.isCompleted) return;
    this.isCompleted = true;

    this.$steps.forEach($step => $step.complete());
    this.$activeStep = undefined;

    const $nextSection = this.$footer.$('.next-section');

    if (animated) {
      this.$skipStep.exit('fade', 200);
      // eslint-disable-next-line no-console
      console.log('[KB DEBUG] Course.ready start');
      if ($nextSection) $nextSection.enter('pop');
    } else {
      this.$skipStep.hide();
      if ($nextSection) $nextSection.show();
    }

    this.trigger('complete');
    this.saveProgress({completed: true});
    this.log('Course', 'complete');
  }


  // ---------------------------------------------------------------------------
  // Utilities

  findStep(id: string) {
    for (const $s of this.$steps) {
      if ($s.id === id) return $s;
    }
  }

  saveProgress(data: Record<string, any>) {
    if (!this.isReady) return;

    const scores = total(this.$steps.map(s => s.scores.size));
    const progress = scores / (+this.data.goals!) || 0;

    // Always reflect UI progress immediately, regardless of platform.
    if (this.$progress) this.$progress.setProgress(progress);

    if (ENV === 'MOBILE' && window.ReactNativeWebView) {
      data.progress = progress;
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    } else if (ENV === 'WEB') {
      deferredPost(`/course/${this.id}/${this.data.section}`, data);
    }
  }

  log(category: string, action: string, value?: string) {
    if (ENV === 'WEB' && window.ga && this.isReady) {
      const actionStr = action + (value ? ':' + value : '');
      window.ga('send', 'event', category, actionStr, this.id);
    }
  }
}
