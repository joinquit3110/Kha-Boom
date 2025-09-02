#!/usr/bin/env -S ts-node --script-mode

// A simple node server that can be used in development using mgon-serve.

import {MathigonStudioApp} from './app';
import {COURSES} from './utilities/utilities';
import {askStewie} from './utilities/ai';

new MathigonStudioApp()
    .secure()
    .setup({sessionSecret: 'hypatia-khaboom-secret-key-2025'})
    .accounts()  // Enable accounts system
    // Use exact static pages for Kha-Boom landing and marketing pages
    .redirects({
      '/': '/khaboom/index.html',
      '/about': '/khaboom/about.html'
    })
    // Dashboard now requires authentication, so remove static redirect
    .get('/home', (req, res) => res.render('home.pug', {courses: COURSES}))
    .course({
      askTutor: (req, course) => askStewie(req, course)
    })
    .errors()
    .listen(5000);
