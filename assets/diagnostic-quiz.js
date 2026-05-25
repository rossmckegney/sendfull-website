/* =================================================================
   The Automation Readiness Diagnostic — vanilla-JS port of the
   React app under app/src/ (Diagnostic.jsx + diagnostic/* + lib/*).
   No framework, no build step.
   ================================================================= */
(function () {
  'use strict';

  /* ============================================================
     DATA — questions.js
     ============================================================ */
  var SECTIONS = {
    1: { id: 1, name: 'Strategy Gap Risk Signals' },
    2: { id: 2, name: 'Could You Automate?' },
    3: { id: 3, name: 'Should You Automate?' },
  };

  var QUESTIONS = [
    {
      id: 'q1', section: 1,
      text: 'When your leadership talks about AI or automation strategy, the conversation most often starts with:',
      options: [
        { points: 4, label: "A specific business problem we're trying to solve" },
        { points: 3, label: 'A user need we’ve validated through research' },
        { points: 2, label: 'A capability we want to add to our product' },
        { points: 1, label: 'Fear of falling behind / “we need an AI strategy”' },
        { points: 0, label: 'A top-down directive to “use AI more”' },
      ],
    },
    {
      id: 'q2', section: 1,
      text: 'The primary metrics used to declare this initiative successful are:',
      options: [
        { points: 4, label: 'Effectiveness and efficiency: both whether the work succeeded and how efficiently it was done' },
        { points: 3, label: 'Effectiveness alone: whether the work succeeded, without tracking efficiency' },
        { points: 2, label: 'Efficiency alone: speed, throughput, or cycle time, without tracking whether the work succeeded' },
        { points: 1, label: 'Cost or headcount reduction: money saved or roles eliminated' },
        { points: 0, label: 'Use of the AI: feature adoption or usage value' },
      ],
    },
    {
      id: 'q3', section: 1,
      text: "How well does your team's hands-on understanding of generative AI match leadership's expectations of it?",
      options: [
        { points: 4, label: 'Closely matched: shared, realistic sense of what the tools can and cannot do' },
        { points: 3, label: 'Mostly matched: agreement on the basics, differences on specifics' },
        { points: 2, label: 'Noticeable gap: agree on the goal, disagree on what is realistic' },
        { points: 1, label: 'Large gap: disagree on what the tools should be used for' },
        { points: 0, label: 'Gap unknown: expectations have not been discussed' },
      ],
    },
    {
      id: 'q4', section: 1,
      text: 'If you introduced a major AI capability into your workflow tomorrow, the surrounding workflows, training, and team structures would be:',
      options: [
        { points: 4, label: 'Mostly ready: redesign is underway and early pieces are in place' },
        { points: 3, label: 'Partly ready: redesign has started in some areas, not others' },
        { points: 2, label: 'Planned but not started: we know what to change, work has not begun' },
        { points: 1, label: 'Not planned: we would ship and adapt afterward' },
        { points: 0, label: 'Unsure' },
      ],
    },
    {
      id: 'q5', section: 1,
      text: 'When did your team last do structured, hands-on experimentation with a new AI capability as a group (not individually)?',
      options: [
        { points: 4, label: 'Within the last month' },
        { points: 3, label: 'Within the last quarter' },
        { points: 2, label: 'Within the last year' },
        { points: 1, label: 'Never as a structured activity' },
        { points: 0, label: 'Don’t know' },
      ],
    },
    {
      id: 'q6', section: 2,
      text: 'How confident are you that the technology can reliably deliver the outcomes you need at your required quality bar?',
      options: [
        { points: 4, label: 'Highly confident, backed by piloted evidence on our own data' },
        { points: 3, label: 'Confident, based on benchmarks and external case studies' },
        { points: 2, label: 'Moderately confident, based on demos and vendor claims' },
        { points: 1, label: 'Skeptical but hopeful' },
        { points: 0, label: 'Don’t know' },
      ],
    },
    {
      id: 'q7', section: 2,
      text: 'Have you piloted or benchmarked the specific capability on your own data and workflows?',
      options: [
        { points: 4, label: 'Yes, with documented results across multiple scenarios' },
        { points: 3, label: 'Yes, with a single pilot' },
        { points: 2, label: 'Informally, individual team members have experimented' },
        { points: 1, label: 'No, but we’ve seen demos' },
        { points: 0, label: 'No, we’re going on the vendor\'s word or vibes' },
      ],
    },
    {
      id: 'q8', section: 2,
      text: 'Do you have the in-house expertise (or vetted partners) to build, deploy, monitor, and maintain this automation?',
      options: [
        { points: 4, label: 'Strong across all four phases' },
        { points: 3, label: 'Gaps exist, but we know where they are and have a plan to fill them' },
        { points: 2, label: 'Gaps exist, and we are still working out how to fill them' },
        { points: 1, label: 'Significant gaps, no plans on how to fill them yet' },
        { points: 0, label: 'No expertise, in-house or sourced' },
      ],
    },
    {
      id: 'q9', section: 2,
      text: 'How closely has the team looked at how this work gets done, step by step?',
      options: [
        { points: 4, label: 'Very closely: we have mapped what we plan to automate and are aligned on what to automate versus keep human' },
        { points: 3, label: 'Somewhat closely: we have identified the main pieces of the work, not the individual steps' },
        { points: 2, label: 'At a high level: we have thought about the work as a whole, not broken into pieces' },
        { points: 1, label: 'In passing: the topic has come up but we have not worked through it' },
        { points: 0, label: 'Not at all' },
      ],
    },
    {
      id: 'q10', section: 2,
      text: 'Have you mapped the technical, data, and organizational dependencies this automation will touch (integrations, permissions, oversight, downstream consumers)?',
      options: [
        { points: 4, label: 'Fully: the connections across systems, people, and downstream teams are well understood' },
        { points: 3, label: 'Mostly: the main connections are understood, with some still to work through' },
        { points: 2, label: 'In parts: some areas are well understood, others are not' },
        { points: 1, label: 'Roughly: there is a general sense of the connections, but they have not been worked through' },
        { points: 0, label: 'Not at all' },
      ],
    },
    {
      id: 'q11', section: 3,
      text: 'How clearly defined are the user needs this automation would serve?',
      options: [
        { points: 4, label: 'Grounded in direct evidence: user needs are defined based on customer interviews, observation, or usage data' },
        { points: 3, label: 'Grounded in indirect evidence: user needs are defined based on support tickets, sales conversations, or other secondhand sources' },
        { points: 2, label: 'Grounded in team judgment: user needs are defined based on the team\'s experience and working knowledge' },
        { points: 1, label: 'Not yet defined: user needs have come up in conversation but have not been worked through' },
        { points: 0, label: 'Not applicable: this project is based on a technical capability, not on user needs' },
      ],
    },
    {
      id: 'q12', section: 3,
      text: 'Compared to how users perform this task today, the proposed automation would be:',
      options: [
        { points: 4, label: 'A meaningful step-change improvement, validated with users' },
        { points: 3, label: 'A meaningful improvement, hypothesized but not yet validated' },
        { points: 2, label: 'Roughly equivalent, just faster or cheaper' },
        { points: 1, label: 'Unclear without seeing it built' },
        { points: 0, label: 'We haven’t compared' },
      ],
    },
    {
      id: 'q13', section: 3,
      text: 'How well do you understand the broader ecosystem this automation will sit inside (stakeholders, handoffs, downstream effects)?',
      options: [
        { points: 4, label: 'Mapped: we’ve identified bottlenecks it removes and creates' },
        { points: 3, label: 'Partially mapped' },
        { points: 2, label: 'Discussed informally' },
        { points: 1, label: 'Haven’t really examined it' },
        { points: 0, label: 'Don’t know' },
      ],
    },
    {
      id: 'q14', section: 3,
      text: 'If this initiative ships and “succeeds” by your current metrics, are there second-order effects you’re worried about (skill atrophy, trust erosion, regulatory exposure, desynchronization with adjacent workflows)?',
      options: [
        { points: 4, label: 'Examined rigorously: second-order effects have been identified and stress-tested (e.g., through a premortem)' },
        { points: 3, label: 'Examined informally: second-order effects have been discussed and named, but not stress-tested' },
        { points: 2, label: 'Acknowledged: second-order effects have come up in passing, without being worked through' },
        { points: 1, label: 'Not examined: second-order effects have not been considered' },
        { points: 0, label: 'Not on the radar: the team has been focused on shipping, not on what happens after' },
      ],
    },
    {
      id: 'q15', section: 3,
      text: 'Are the people whose work this automation will change involved in shaping it?',
      options: [
        { points: 4, label: 'Yes, from the start (e.g., co-designing)' },
        { points: 3, label: 'Yes, but starting later in the process' },
        { points: 2, label: 'They will be consulted before launch' },
        { points: 1, label: 'They will be informed at launch' },
        { points: 0, label: 'No, we don\'t plan to involve them' },
      ],
    },
  ];
  var TOTAL_QUESTIONS = QUESTIONS.length;

  /* ============================================================
     DATA — content.js
     ============================================================ */
  var QUADRANTS = {
    hold: {
      key: 'hold', name: 'Hold', cell: 'bl', color: 'var(--q-hold)',
      glow: 'oklch(66% 0.04 280 / 0.28)',
      headline: 'Neither the value nor the capability case is established yet.',
      summary: "You can't responsibly invest further until one of them shifts. That's not a failure — it's the diagnostic doing its job before you spend.",
    },
    question: {
      key: 'question', name: 'Question', cell: 'br', color: 'var(--q-question)',
      glow: 'oklch(78% 0.135 78 / 0.26)',
      headline: 'You could automate — but the value case isn’t there.',
      summary: 'Your capability is real. It just isn’t reinforcing how you’ve chosen to win. The opportunity is to repurpose it against a higher-value problem.',
    },
    assist: {
      key: 'assist', name: 'Assist', cell: 'tl', color: 'var(--q-assist)',
      glow: 'oklch(74% 0.12 215 / 0.28)',
      headline: 'High value, capability still maturing.',
      summary: 'This is worth doing — and the responsible path is a Human-in-the-Loop system you build toward full automation as the technology proves out.',
    },
    automate: {
      key: 'automate', name: 'Automate', cell: 'tr', color: 'var(--q-automate)',
      glow: 'oklch(67% 0.2 291 / 0.4)',
      headline: 'High value, high capability.',
      summary: 'You can responsibly move toward Human-on-the-Loop — provided your strategy and oversight are as mature as your technology.',
    },
  };

  var RISK_BANDS = {
    intentional: {
      key: 'intentional', label: 'Intentional', range: '15–20', color: 'var(--risk-good)',
      summary: 'You’re approaching automation as a deliberate strategic choice, with shared language between leadership and teams.',
    },
    atrisk: {
      key: 'atrisk', label: 'At risk', range: '8–14', color: 'var(--risk-mid)',
      summary: 'You have pockets of intentionality, but enough reactive signals that you’re vulnerable to the Strategy Gap pattern. Drift compounds.',
    },
    deepgap: {
      key: 'deepgap', label: 'Deep in the Strategy Gap', range: '0–7', color: 'var(--risk-deep)',
      summary: 'The conditions for project failure are present: reactive vision, vague metrics, disconnected execution. Slow down before you spend more.',
    },
  };

  var RECOMMENDATIONS = {
    hold: {
      chapter: 'Chapter 5', title: 'Revisit system purpose before you invest',
      body: 'Read Chapter 5 of Designing Automated Futures on system purpose. There’s no capability or value signal strong enough to act on yet — watch this space and re-take the diagnostic in 90 days.',
      workshopFit: 'low',
    },
    question: {
      chapter: 'Chapter 6', title: 'Run an Automation Choice Check',
      body: 'Your capability is real — it’s just not reinforcing your strategy. Run an Automation Choice Check (Chapter 6) to point that capability at a problem that actually moves how you win.',
      workshopFit: 'medium',
    },
    'assist-high': {
      chapter: 'Intuition Building Sprint', title: 'Build shared intuition before you add capability',
      body: 'The value is there, but your Strategy Gap signals are loud. Run an Intuition Building Sprint with your team, then sequence the rollout using the matrix before adding more capability.',
      workshopFit: 'high',
    },
    'assist-low': {
      chapter: 'Chapter 9', title: 'Design your Human-in-the-Loop handoffs',
      body: 'You’re intentional enough to move forward with HITL design. Use the Cognitive Allocation Model (Chapter 9) to design the handoffs between human judgment and automated steps.',
      workshopFit: 'medium',
    },
    'automate-high': {
      chapter: 'Strategy-First AI Workshop', title: 'Pause and run a Pre-Mortem before you scale',
      body: 'Your capability is ahead of your intentionality — the most dangerous place to be. Pause and run a Pre-Mortem and the Strategy-First AI Workshop before you scale this initiative.',
      workshopFit: 'critical',
    },
    'automate-low': {
      chapter: 'Chapter 10', title: 'Build your evaluation framework before launch',
      body: 'You’re both capable and intentional. Before launch, build your evaluation framework — define the operating envelope, success criteria, and tolerance bands (Chapter 10).',
      workshopFit: 'medium',
    },
  };

  var THROUGHLINE = {
    hold: {
      nowState: 'An initiative without a proven value or capability case.',
      goalState: 'A portfolio of AI bets that each reinforce how you win.',
      bridge: 'The climb runs through validating value or capability first. The Strategy-First AI Workshop gives you the Choice Cascade and matrix to know which one to chase — and which initiatives to stop funding now.',
    },
    question: {
      nowState: 'A capability that works, aimed at a problem that doesn’t matter enough.',
      goalState: 'That same capability redeployed against a strategy-critical problem.',
      bridge: 'The Strategy-First AI Workshop runs an Automation Choice Check across every live initiative, so your capability gets pointed where it compounds your advantage instead of your busywork.',
    },
    assist: {
      nowState: 'A high-value initiative running ahead of proven capability.',
      goalState: 'A sequenced path from Human-in-the-Loop to responsible full automation.',
      bridge: 'The Strategy-First AI Workshop sequences that climb — “climb high, sleep low” — so you add autonomy in the right order, with the situational-awareness handoffs designed before, not after.',
    },
    automate: {
      nowState: 'Capability and value both real — and scaling pressure building.',
      goalState: 'A scaled automation your board, your team, and your customers all trust.',
      bridge: 'The Strategy-First AI Workshop pressure-tests that scale-up: a pre-mortem, a risk register with named owners, and a one-page executive narrative — before the initiative is too big to slow down.',
    },
  };

  var FIT_COPY = {
    critical: {
      badge: 'Your recommended next step',
      title: 'This is the exact result the Strategy-First AI Workshop exists for.',
      body: 'Your capability is running ahead of your strategy. The workshop pauses the initiative, runs the pre-mortem, and rebuilds the throughline before you scale something you can’t easily slow down.',
    },
    high: {
      badge: 'Strongly recommended',
      title: 'Close the Strategy Gap before you add capability.',
      body: 'The value is real — your risk signals are loud. The Strategy-First AI Workshop builds the shared language and sequenced rollout your team is missing.',
    },
    medium: {
      badge: 'A strong next move',
      title: 'Bring the matrix to your leadership team.',
      body: 'The Strategy-First AI Workshop plots every live initiative on this matrix together — so the call you just made for one initiative becomes a portfolio strategy.',
    },
    low: {
      badge: 'When you’re ready',
      title: 'Keep the Strategy-First AI Workshop on your radar.',
      body: 'You’re early. When a real value or capability case emerges, the workshop is how you turn it into a sequenced, board-ready plan.',
    },
  };

  /* ============================================================
     SCORING — scoring.js (ported exactly)
     ============================================================ */
  function sectionQuestionIds(section) {
    return QUESTIONS.filter(function (q) { return q.section === section; })
      .map(function (q) { return q.id; });
  }
  function sumSection(answers, section) {
    return sectionQuestionIds(section).reduce(function (total, id) {
      return total + (answers[id] != null ? answers[id] : 0);
    }, 0);
  }
  function getQuadrant(could, should) {
    var highCould = could > 0.5;
    var highShould = should > 0.5;
    if (highShould && highCould) return 'automate';
    if (highShould && !highCould) return 'assist';
    if (!highShould && highCould) return 'question';
    return 'hold';
  }
  function getRiskBand(score) {
    if (score >= 15) return 'intentional';
    if (score >= 8) return 'atrisk';
    return 'deepgap';
  }
  function getRecommendationKey(quadrant, riskScore) {
    var highRisk = riskScore >= 8;
    if (quadrant === 'hold') return 'hold';
    if (quadrant === 'question') return 'question';
    if (quadrant === 'assist') return highRisk ? 'assist-high' : 'assist-low';
    return highRisk ? 'automate-high' : 'automate-low';
  }
  function computeResult(answers) {
    var section1 = sumSection(answers, 1);
    var section2 = sumSection(answers, 2);
    var section3 = sumSection(answers, 3);
    var could = section2 / 20;
    var should = section3 / 20;
    var quadrant = getQuadrant(could, should);
    var riskScore = section1;
    var riskBand = getRiskBand(riskScore);
    var recommendationKey = getRecommendationKey(quadrant, riskScore);
    return {
      section1: section1, section2: section2, section3: section3,
      could: could, should: should, quadrant: quadrant,
      riskScore: riskScore, riskBand: riskBand, recommendationKey: recommendationKey,
    };
  }
  function answeredCount(answers) {
    return QUESTIONS.filter(function (q) {
      return answers[q.id] !== undefined;
    }).length;
  }
  function isComplete(answers) {
    return answeredCount(answers) === QUESTIONS.length;
  }

  /* ============================================================
     STORAGE — storage.js (ported exactly, same localStorage keys)
     ============================================================ */
  var DRAFT_KEY = 'ard:draft:v1';
  var SUBMISSIONS_KEY = 'ard:submissions:v1';

  function canStore() {
    try {
      return typeof window !== 'undefined' && !!window.localStorage;
    } catch (e) {
      return false;
    }
  }
  function readLS(key, fallback) {
    if (!canStore()) return fallback;
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeLS(key, value) {
    if (!canStore()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* quota / private mode */ }
  }
  function loadDraft() {
    return readLS(DRAFT_KEY, { lead: null, answers: {}, updatedAt: null });
  }
  function saveDraft(draft) {
    var copy = { lead: draft.lead, answers: draft.answers, updatedAt: new Date().toISOString() };
    writeLS(DRAFT_KEY, copy);
  }
  function clearDraft() {
    if (!canStore()) return;
    try { window.localStorage.removeItem(DRAFT_KEY); } catch (e) {}
  }
  function listSubmissions() {
    return readLS(SUBMISSIONS_KEY, []);
  }
  function saveSubmission(payload) {
    var id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    var record = {
      id: id,
      createdAt: new Date().toISOString(),
      lead: payload.lead,
      answers: payload.answers,
      result: payload.result,
    };
    var all = listSubmissions();
    all.push(record);
    writeLS(SUBMISSIONS_KEY, all);
    return record;
  }

  /* ============================================================
     ICON SVG snippets
     ============================================================ */
  var ICON = {
    arrowRight: function (w) {
      return '<svg class="btn-arrow" width="' + (w || 20) + '" height="' + (w || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
    },
    arrowLeft: function (w) {
      return '<svg width="' + (w || 16) + '" height="' + (w || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>';
    },
    check: function (w) {
      return '<svg width="' + (w || 15) + '" height="' + (w || 15) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
    },
    compass: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 5-5 2.2 2.2-5 5-2.2Z"/></svg>',
    gauge: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 14 4-4"/><circle cx="12" cy="18" r="1.4"/></svg>',
    route: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/></svg>',
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ============================================================
     APP STATE  (mirrors Diagnostic.jsx)
     ============================================================ */
  var COMPUTE_MS = 1900;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var state = {
    phase: 'intro', // intro | lead | questions | computing | results
    lead: null,
    answers: {},
    qIndex: 0,
    result: null,
    emailStatus: null, // null | sending | sent | failed
  };
  var savedSubmission = false;

  var panelEl, stageEl, barExtraEl;

  /* ============================================================
     ANALYTICS + RESULTS EMAIL
     ============================================================ */
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mykdjprq';
  var SENDFULL_EMAIL = 'hello@sendfull.com';

  /* Fire a Google Analytics (gtag) event; no-op if GA is unavailable. */
  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (e) {
      /* analytics must never break the quiz */
    }
  }

  function emailStatusText(status) {
    if (status === 'sent') {
      return 'Your results have been sent to the Sendfull team — we’ll be in touch.';
    }
    if (status === 'failed') {
      return 'We couldn’t send your results automatically — reach us at ' + SENDFULL_EMAIL + '.';
    }
    return 'Sending your results to the Sendfull team…';
  }

  function setEmailStatus(status) {
    state.emailStatus = status;
    var el = document.getElementById('diag-email-status');
    if (el) {
      el.textContent = emailStatusText(status);
      el.setAttribute('data-email-status', status);
    }
  }

  /* Plain-text body for the results email. */
  function buildResultsBody(lead, result) {
    var quad = QUADRANTS[result.quadrant];
    var band = RISK_BANDS[result.riskBand];
    var rec = RECOMMENDATIONS[result.recommendationKey];
    var lines = [
      'AUTOMATION READINESS DIAGNOSTIC — RESULTS',
      '',
      'Name: ' + (lead.name || '—'),
      'Email: ' + (lead.email || '—'),
      'Company: ' + (lead.company || '—'),
      'Role: ' + (lead.role || '—'),
      'Initiative assessed: ' + (lead.initiative || '—'),
    ];
    if (lead.context) lines.push('What it does: ' + lead.context);
    lines.push('');
    lines.push('QUADRANT: ' + quad.name);
    lines.push(quad.headline + ' ' + quad.summary);
    lines.push('');
    lines.push(
      'Could you automate? (capability): ' +
        Math.round(result.could * 100) + '%  —  ' + result.section2 + '/20'
    );
    lines.push(
      'Should you automate? (value): ' +
        Math.round(result.should * 100) + '%  —  ' + result.section3 + '/20'
    );
    lines.push(
      'Strategy Gap Risk: ' + band.label + '  —  ' + result.riskScore +
        '/20 (band ' + band.range + ')'
    );
    lines.push('');
    lines.push('RECOMMENDED NEXT STEP — ' + rec.chapter);
    lines.push(rec.title);
    lines.push(rec.body);
    return lines.join('\n');
  }

  /* POST the completed result to Formspree. Only the form's recipient
     (hello@sendfull.com) receives it — the respondent is NOT copied.
     Fire-and-forget — never blocks the results UI. */
  function sendResultsEmail(lead, result) {
    if (!lead || !lead.email) {
      setEmailStatus('failed');
      return;
    }
    setEmailStatus('sending');

    var quad = QUADRANTS[result.quadrant];
    var fd = new FormData();
    fd.append('email', lead.email); // reply-to
    fd.append(
      '_subject',
      'Automation Readiness Diagnostic — ' + (lead.name || lead.email) +
        ' (' + quad.name + ')'
    );
    fd.append('name', lead.name || '');
    fd.append('company', lead.company || '');
    fd.append('role', lead.role || '');
    fd.append('initiative', lead.initiative || '');
    fd.append('quadrant', quad.name);
    fd.append(
      'strategy_gap_risk',
      RISK_BANDS[result.riskBand].label + ' (' + result.riskScore + '/20)'
    );
    fd.append('message', buildResultsBody(lead, result));

    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: fd,
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        track('diagnostic_results_email_sent');
        setEmailStatus('sent');
      })
      .catch(function () {
        track('diagnostic_results_email_failed');
        setEmailStatus('failed');
      });
  }

  function firstUnanswered() {
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (state.answers[QUESTIONS[i].id] === undefined) return i;
    }
    return 0;
  }
  function hasProgress() {
    return answeredCount(state.answers) > 0 || !!state.lead;
  }

  /* ---------- top bar ---------- */
  function renderBar() {
    var answered = answeredCount(state.answers);
    var pct =
      state.phase === 'questions'
        ? Math.round((answered / TOTAL_QUESTIONS) * 100)
        : state.phase === 'computing' || state.phase === 'results'
        ? 100
        : 0;

    if (state.phase === 'questions') {
      barExtraEl.innerHTML =
        '<div class="progress" aria-hidden="true"><div class="progress-fill"></div></div>' +
        '<span class="progress-label">' + (state.qIndex + 1) + ' / ' + TOTAL_QUESTIONS + '</span>';
      /* let the width transition run */
      var fill = barExtraEl.querySelector('.progress-fill');
      requestAnimationFrame(function () {
        fill.style.width = pct + '%';
      });
    } else if (state.phase === 'intro' || state.phase === 'lead') {
      barExtraEl.innerHTML = '<a href="/diagnostic" class="nav-link">Exit</a>';
    } else if (state.phase === 'results') {
      barExtraEl.innerHTML = '<button type="button" class="nav-link" id="bar-retake">Re-take</button>';
      barExtraEl.querySelector('#bar-retake').addEventListener('click', handleRetake);
    } else {
      barExtraEl.innerHTML = '';
    }
  }

  /* ---------- phase render dispatch ---------- */
  function render() {
    window.scrollTo({ top: 0, behavior: 'auto' });
    renderBar();

    var isWide = state.phase === 'results';
    panelEl.className = 'diag-panel' + (isWide ? ' diag-panel-wide' : '');

    var wrapClass = '';
    var wrapStyle = '';
    if (state.phase === 'questions') {
      wrapClass = 'card';
      wrapStyle = 'padding: var(--sp-7)';
    } else if (state.phase === 'computing') {
      wrapClass = 'card card-glass';
      wrapStyle = 'padding: var(--sp-9) var(--sp-7)';
    }

    var inner = document.createElement('div');
    inner.className = 'step-enter' + (wrapClass ? ' ' + wrapClass : '');
    if (wrapStyle) inner.setAttribute('style', wrapStyle);

    if (state.phase === 'intro') renderIntro(inner);
    else if (state.phase === 'lead') renderLead(inner);
    else if (state.phase === 'questions') renderQuestion(inner);
    else if (state.phase === 'computing') renderComputing(inner);
    else if (state.phase === 'results') renderResults(inner);

    panelEl.innerHTML = '';
    panelEl.appendChild(inner);
  }

  /* ---------- INTRO ---------- */
  function renderIntro(host) {
    host.className = 'card card-glass intro-card step-enter';
    host.setAttribute('style', 'padding: var(--sp-7)');
    var learn = [
      { icon: ICON.compass, title: 'Your quadrant', text: 'Where this initiative sits on the Autonomy Decision Matrix — Hold, Question, Assist, or Automate.' },
      { icon: ICON.gauge, title: 'Your Strategy Gap Risk Score', text: 'How reactive vs. intentional your current approach is — scored 0–20.' },
      { icon: ICON.route, title: 'Your next step', text: 'One recommended move, scaled precisely to where you are right now.' },
    ];
    var items = learn.map(function (l, i) {
      return (
        '<div class="intro-list-item">' +
        '<span class="ico">' + l.icon + '</span>' +
        '<div><strong style="color:var(--text);display:block">' + (i + 1) + '. ' + esc(l.title) + '</strong>' +
        '<span class="muted" style="font-size:0.96rem">' + esc(l.text) + '</span></div>' +
        '</div>'
      );
    }).join('');

    host.innerHTML =
      '<span class="pill" style="margin:0 auto">8 minutes · 15 questions</span>' +
      '<h1 class="h1" style="margin-top:var(--sp-5)">Let’s pressure-test one initiative.</h1>' +
      '<p class="lead measure mx-auto" style="margin-top:var(--sp-4)">' +
      'Answer for a <strong style="color:var(--text)">specific</strong> AI or automation initiative ' +
      'you’re considering or already building — not your organization in the abstract. ' +
      'If you’re weighing several, pick the one your leadership is most invested in.</p>' +
      '<div class="intro-list" style="margin:var(--sp-6) 0">' + items + '</div>' +
      '<div class="stack gap-3" style="align-items:center">' +
      '<button class="btn btn-primary btn-lg" id="intro-begin">Begin the diagnostic ' + ICON.arrowRight(20) + '</button>' +
      (hasProgress()
        ? '<button class="q-back" id="intro-resume">or resume your saved run</button>'
        : '') +
      '<p class="muted" style="font-size:0.86rem;max-width:38ch">Your answers stay on this device. Re-take quarterly to track drift.</p>' +
      '</div>';

    host.querySelector('#intro-begin').addEventListener('click', handleBegin);
    var resume = host.querySelector('#intro-resume');
    if (resume) resume.addEventListener('click', handleResume);
  }

  /* ---------- LEAD FORM ---------- */
  function renderLead(host) {
    host.className = 'card step-enter';
    host.setAttribute('style', 'padding: var(--sp-7)');
    var f = state.lead || { name: '', email: '', company: '', role: '', initiative: '', context: '' };

    host.innerHTML =
      '<span class="q-section-tag">Before we begin</span>' +
      '<h2 class="h2" style="margin-top:var(--sp-3)">Who’s taking this, and on what?</h2>' +
      '<p class="muted" style="margin-top:var(--sp-2)">We’ll tie your results to this initiative so the recommendation lands where it matters.</p>' +
      '<form class="stack gap-4" style="margin-top:var(--sp-6)" novalidate id="lead-form">' +
      '<div class="form-grid">' +
      field('lf-name', 'Your name', 'input', f.name, 'Jane Rivera', 'name') +
      field('lf-email', 'Work email', 'input', f.email, 'jane@company.com', 'email', 'email') +
      '</div>' +
      '<div class="form-grid">' +
      field('lf-company', 'Company <span class="opt">· optional</span>', 'input', f.company, 'Northwind Inc.', 'company') +
      field('lf-role', 'Your role <span class="opt">· optional</span>', 'input', f.role, 'VP Product', 'role') +
      '</div>' +
      field('lf-init', 'The initiative you’re assessing', 'input', f.initiative, 'e.g. Automated claims triage agent', 'initiative') +
      field('lf-ctx', 'In a sentence, what is it meant to do? <span class="opt">· optional</span>', 'textarea', f.context, 'Route incoming claims to the right adjuster and pre-fill the first response.', 'context') +
      '<div class="checkbox-row">' +
      '<input type="checkbox" id="lf-agree" />' +
      '<label for="lf-agree">' +
      'I understand this is informational, not professional advice. I agree to the ' +
      '<a class="textlink" href="/terms" target="_blank" rel="noopener">Terms of Use</a>' +
      ' and ' +
      '<a class="textlink" href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.' +
      '</label>' +
      '</div>' +
      '<div class="q-nav" style="margin-top:var(--sp-2)">' +
      '<button type="button" class="q-back" id="lead-back">' + ICON.arrowLeft(16) + ' Back</button>' +
      '<button type="submit" class="btn btn-primary" id="lead-submit" disabled>Start question 1 ' + ICON.arrowRight(20) + '</button>' +
      '</div>' +
      '</form>';

    host.querySelector('#lead-back').addEventListener('click', handleBack);
    host.querySelector('#lead-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submitLead(host);
    });

    /* keep the Start button disabled until required fields are filled
       AND the agreement checkbox is checked. We don't validate format
       here (that happens on submit) — just non-empty + email-shape +
       checkbox. */
    function refreshSubmitState() {
      var get = function (id) {
        var el = host.querySelector('#' + id);
        return el ? el.value.trim() : '';
      };
      var ok =
        !!get('lf-name') &&
        EMAIL_RE.test(get('lf-email')) &&
        !!get('lf-init') &&
        host.querySelector('#lf-agree').checked;
      host.querySelector('#lead-submit').disabled = !ok;
    }
    /* clear error on input + recheck submit state */
    host.querySelectorAll('.input, .textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        el.classList.remove('error');
        var err = el.parentNode.querySelector('.field-error');
        if (err) err.remove();
        refreshSubmitState();
      });
    });
    host.querySelector('#lf-agree').addEventListener('change', refreshSubmitState);
    refreshSubmitState();

    function field(id, label, kind, value, placeholder, key, type, hint) {
      var control =
        kind === 'textarea'
          ? '<textarea id="' + id + '" class="textarea" data-key="' + key + '" placeholder="' + esc(placeholder) + '">' + esc(value) + '</textarea>'
          : '<input id="' + id + '" class="input" data-key="' + key + '"' +
            (type ? ' type="' + type + '"' : '') +
            ' value="' + esc(value) + '" placeholder="' + esc(placeholder) + '"' +
            autoComplete(key) + '/>';
      return (
        '<div class="field"><label for="' + id + '">' + label + '</label>' +
        control +
        (hint ? '<span class="field-hint">' + hint + '</span>' : '') +
        '</div>'
      );
    }
    function autoComplete(key) {
      var map = { name: 'name', email: 'email', company: 'organization', role: 'organization-title' };
      return map[key] ? ' autocomplete="' + map[key] + '"' : '';
    }
  }

  function submitLead(host) {
    /* defense in depth: the Start button is also disabled until the
       agreement checkbox is checked, but block the submit path too in
       case the disabled state was bypassed. */
    var agree = host.querySelector('#lf-agree');
    if (agree && !agree.checked) return;

    var get = function (key) {
      var el = host.querySelector('[data-key="' + key + '"]');
      return el ? el.value : '';
    };
    var form = {
      name: get('name'), email: get('email'), company: get('company'),
      role: get('role'), initiative: get('initiative'), context: get('context'),
    };
    var errors = {};
    if (!form.name.trim()) errors.name = 'Please add your name.';
    if (!form.email.trim()) errors.email = 'Please add your email.';
    else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'That email doesn’t look right.';
    if (!form.initiative.trim()) errors.initiative = 'Name the initiative you’re assessing.';

    /* show errors */
    var keyToId = { name: 'lf-name', email: 'lf-email', initiative: 'lf-init' };
    Object.keys(keyToId).forEach(function (key) {
      var el = host.querySelector('#' + keyToId[key]);
      if (!el) return;
      var existing = el.parentNode.querySelector('.field-error');
      if (existing) existing.remove();
      el.classList.remove('error');
      if (errors[key]) {
        el.classList.add('error');
        var span = document.createElement('span');
        span.className = 'field-error';
        span.textContent = errors[key];
        el.parentNode.appendChild(span);
      }
    });

    if (Object.keys(errors).length === 0) {
      handleLeadSubmit({
        name: form.name.trim(), email: form.email.trim(), company: form.company.trim(),
        role: form.role.trim(), initiative: form.initiative.trim(), context: form.context.trim(),
      });
    }
  }

  /* ---------- QUESTION ---------- */
  function renderQuestion(host) {
    var q = QUESTIONS[state.qIndex];
    var section = SECTIONS[q.section];
    var value = state.answers[q.id];

    var opts = q.options.map(function (opt) {
      var selected = value === opt.points;
      return (
        '<button type="button" role="radio" aria-checked="' + selected + '" class="q-option" ' +
        'data-selected="' + selected + '" data-points="' + opt.points + '">' +
        '<span class="q-radio" aria-hidden="true"><i></i></span>' +
        '<span>' + esc(opt.label) + '</span>' +
        '</button>'
      );
    }).join('');

    var isLast = state.qIndex >= TOTAL_QUESTIONS - 1;
    var nextLabel = isLast ? 'See results' : 'Next';

    host.innerHTML =
      '<div class="stack gap-2" style="margin-bottom:var(--sp-5)">' +
      '<span class="q-section-tag">Section ' + q.section + ' · ' + esc(section.name) + '</span>' +
      '<span class="muted" style="font-size:0.9rem">Question ' + (state.qIndex + 1) + ' of ' + TOTAL_QUESTIONS + '</span>' +
      '</div>' +
      '<h2 class="q-text">' + esc(q.text) + '</h2>' +
      '<div class="q-options" role="radiogroup" aria-label="' + esc(q.text) + '" style="margin-top:var(--sp-6)">' +
      opts +
      '</div>' +
      '<div class="q-nav" style="margin-top:var(--sp-6)">' +
      '<button type="button" class="q-back" id="q-back">' + ICON.arrowLeft(16) + ' Back</button>' +
      '<button type="button" class="btn btn-primary" id="q-next"' +
      (value === undefined ? ' disabled' : '') + '>' +
      nextLabel + ' ' + ICON.arrowRight(20) +
      '</button>' +
      '</div>';

    host.querySelector('#q-back').addEventListener('click', handleBack);
    host.querySelector('#q-next').addEventListener('click', handleNext);
    host.querySelectorAll('.q-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleSelect(parseInt(btn.getAttribute('data-points'), 10));
      });
    });
  }

  /* ---------- COMPUTING ---------- */
  function renderComputing(host) {
    host.innerHTML =
      '<div class="computing">' +
      '<div class="computing-ring"></div>' +
      '<div class="stack gap-2">' +
      '<h2 class="h2">Plotting your position…</h2>' +
      '<p class="muted">Scoring capability, value, and Strategy Gap signals.</p>' +
      '</div></div>';
  }

  /* ---------- RESULTS ---------- */
  function renderResults(host) {
    host.className = 'step-enter';
    host.removeAttribute('style');
    var r = state.result;
    var quad = QUADRANTS[r.quadrant];
    var band = RISK_BANDS[r.riskBand];
    var rec = RECOMMENDATIONS[r.recommendationKey];
    var tl = THROUGHLINE[r.quadrant];
    var fit = FIT_COPY[rec.workshopFit];

    var couldPct = Math.round(r.could * 100);
    var shouldPct = Math.round(r.should * 100);
    var initiative = (state.lead && state.lead.initiative) || 'your initiative';
    var firstName = state.lead && state.lead.name ? state.lead.name.split(' ')[0] : null;

    host.innerHTML =
      '<div class="results">' +
      /* verdict */
      '<div class="verdict enter" style="--verdict-color:' + quad.color + ';--verdict-glow:' + quad.glow + '">' +
      '<div class="verdict-inner stack gap-4">' +
      '<span class="verdict-eyebrow">' +
      (firstName ? esc(firstName) + ', your ' : 'Your ') +
      'diagnostic result · “' + esc(initiative) + '”</span>' +
      '<div><div class="muted" style="font-size:1rem;margin-bottom:6px">This initiative belongs in</div>' +
      '<h1 class="verdict-quad"><em>' + esc(quad.name) + '</em></h1></div>' +
      '<p class="lead" style="max-width:52ch"><strong style="color:var(--text)">' +
      esc(quad.headline) + '</strong> ' + esc(quad.summary) + '</p>' +
      /* short disclaimer — lives inside the verdict block so it travels
         with any screenshot of the quadrant recommendation */
      '<p class="results-disclaimer-short">Informational only, not professional advice. ' +
      'See <a class="textlink" href="/terms" target="_blank" rel="noopener">full Terms</a>.</p>' +
      '</div></div>' +

      /* matrix */
      '<div class="reveal card" style="padding:var(--sp-7)">' +
      '<div class="stack gap-2" style="margin-bottom:var(--sp-6)">' +
      '<span class="eyebrow">The Autonomy Decision Matrix</span>' +
      '<h2 class="h2">Where you are — and where strong initiatives head.</h2>' +
      '<p class="muted measure">Your position is plotted from two scores: whether you <em>could</em> ' +
      'automate (capability) and whether you <em>should</em> (value). The dashed line points to your ' +
      'North Star — the Automate quadrant.</p></div>' +
      '<div class="report-grid">' +
      '<div id="results-matrix"></div>' +
      '<div class="stack gap-5">' +
      '<div class="matrix-readout">' +
      readoutRow('Could you automate? (capability)', couldPct + '%') +
      readoutRow('Should you automate? (value)', shouldPct + '%') +
      readoutRow('Quadrant', '<span style="color:' + quad.color + '">' + esc(quad.name) + '</span>') +
      '</div>' +
      '<div class="card-glass" style="padding:var(--sp-5);border-radius:var(--r-m)">' +
      '<p class="muted" style="font-size:0.96rem">' +
      (r.quadrant === 'automate'
        ? 'You’re already in the North Star quadrant. The work now is proving your strategy and oversight are as mature as your technology.'
        : 'The gap between your marker and the North Star is the work ahead — and the order you close it in matters as much as whether you do.') +
      '</p></div></div></div></div>' +

      /* subscores */
      '<div class="reveal subscores" id="results-subscores">' +
      subscore('Section 1 · Strategy Gap signals', r.section1, band.color, 0) +
      subscore('Section 2 · Could you automate?', r.section2, 'var(--accent-bright)', 1) +
      subscore('Section 3 · Should you automate?', r.section3, 'var(--q-assist)', 2) +
      '</div>' +

      /* risk gauge */
      '<div class="reveal card" style="padding:var(--sp-7)">' +
      '<div class="report-grid" style="align-items:center">' +
      '<div class="stack gap-3">' +
      '<span class="eyebrow">Strategy Gap Risk Score</span>' +
      '<h2 class="h2">You’re <span style="color:' + band.color + '">' + esc(band.label.toLowerCase()) + '</span>.</h2>' +
      '<p class="muted measure">' + esc(band.summary) + '</p>' +
      '<p class="muted" style="font-size:0.92rem">Scored from Section 1 — how reactive vs. intentional ' +
      'your approach is. The Strategy Gap is the distance between automation aspiration and execution reality.</p>' +
      '</div>' +
      '<div id="results-gauge"></div>' +
      '</div></div>' +

      /* recommendation */
      '<div class="reveal rec"><div class="stack gap-4">' +
      '<div class="stack gap-3">' +
      '<span class="rec-chapter">Recommended · ' + esc(rec.chapter) + '</span>' +
      '<h2 class="h2">' + esc(rec.title) + '</h2></div>' +
      '<p class="lead" style="max-width:58ch">' + esc(rec.body) + '</p>' +
      '</div></div>' +

      /* throughline */
      '<div class="reveal card" style="padding:var(--sp-7)">' +
      '<div class="stack gap-2" style="margin-bottom:var(--sp-6)">' +
      '<span class="eyebrow">Your throughline</span>' +
      '<h2 class="h2">Where you are → where you want to go.</h2></div>' +
      '<div class="throughline">' +
      '<div class="tl-node"><span class="tl-tag">Today</span>' +
      '<p style="margin-top:8px;color:var(--text-body)">' + esc(tl.nowState) + '</p></div>' +
      '<div class="throughline-arrow">' + ICON.arrowRight(28) + '</div>' +
      '<div class="tl-node dest"><span class="tl-tag">North Star</span>' +
      '<p style="margin-top:8px;color:var(--text)">' + esc(tl.goalState) + '</p></div>' +
      '</div>' +
      '<p class="muted" style="margin-top:var(--sp-5);max-width:64ch;font-size:1rem">' + esc(tl.bridge) + '</p>' +
      '</div>' +

      /* workshop upsell */
      '<div class="reveal"><div class="cta-band">' +
      '<div class="cta-band-inner stack gap-4" style="max-width:58ch">' +
      '<span class="pill" style="margin:0 auto">' + esc(fit.badge) + '</span>' +
      '<h2 class="h2">' + esc(fit.title) + '</h2>' +
      '<p class="lead">' + esc(fit.body) + '</p>' +
      '<div class="stack gap-3" style="align-items:center;margin-top:var(--sp-3)">' +
      '<a href="/workshop" class="btn btn-primary btn-lg">Explore the Strategy-First AI Workshop ' + ICON.arrowRight(20) + '</a>' +
      '<div class="stack gap-2" style="align-items:center;color:var(--text-light);font-size:0.92rem">' +
      '<span class="stack gap-2" style="flex-direction:row"><span class="accent-text">' + ICON.check(15) + '</span> Two-day executive engagement</span>' +
      '</div></div></div></div></div>' +

      /* full disclaimer — closing-note pair with the "responses are saved" line */
      '<p class="results-disclaimer-full center">' +
      'These results are a starting point for discussion, not a recommendation to act. ' +
      'Decisions about whether and how to automate should involve your team, your context, ' +
      'and qualified advisors where appropriate. Sendfull LLC is not responsible for actions ' +
      'taken based on these results.' +
      '</p>' +

      /* secondary actions */
      '<div class="reveal center stack gap-3" style="align-items:center">' +
      '<div class="hr full" style="max-width:280px;margin:0 auto var(--sp-2)"></div>' +
      '<p class="muted" style="font-size:0.92rem">Your responses are saved on this device. Re-take quarterly to track drift.</p>' +
      '<p class="muted" id="diag-email-status" data-email-status="' + (state.emailStatus || 'sending') + '" style="font-size:0.92rem">' +
      esc(emailStatusText(state.emailStatus)) + '</p>' +
      '<div class="stack gap-3" style="flex-direction:row;flex-wrap:wrap;justify-content:center">' +
      '<button class="btn btn-ghost btn-sm" id="results-retake">Re-take the diagnostic</button>' +
      '<a class="btn btn-ghost btn-sm" href="https://bit.ly/3VfGaTB" target="_blank" rel="noreferrer">Try the Autonomy Matrix with your team</a>' +
      '</div></div>' +
      '</div>';

    /* matrix */
    window.SendfullMatrix.render(host.querySelector('#results-matrix'), r, 'You are here');
    /* risk gauge */
    renderGauge(host.querySelector('#results-gauge'), r.riskScore, r.riskBand);

    /* subscore bars + countups: trigger when subscores in view */
    var subEl = host.querySelector('#results-subscores');
    observeOnce(subEl, 0.3, function () {
      subEl.classList.add('in');
    });
    /* countups inside results */
    initCountUps(host);

    /* reveal-on-scroll for the report blocks (no reveal.js on this page) */
    Array.prototype.slice
      .call(host.querySelectorAll('.reveal'))
      .forEach(function (el) {
        observeOnce(el, 0.3, function () {
          el.classList.add('in');
        });
      });

    host.querySelector('#results-retake').addEventListener('click', handleRetake);

    function readoutRow(k, v) {
      return (
        '<div class="readout-row"><span class="readout-k">' + esc(k) + '</span>' +
        '<span class="readout-v">' + v + '</span></div>'
      );
    }
    function subscore(label, score, color, i) {
      var pct = (score / 20) * 100;
      return (
        '<div class="subscore">' +
        '<div class="subscore-label">' + esc(label) + '</div>' +
        '<div class="subscore-val" style="margin-top:6px">' +
        '<span data-countup="' + score + '" data-duration="1.2">0</span> <small>/ 20</small></div>' +
        '<div class="subscore-track">' +
        '<div class="subscore-bar" style="background:' + color + ';--bar-w:' + pct + '%;--bar-delay:' + (0.15 * i) + 's"></div>' +
        '</div></div>'
      );
    }
  }

  /* ---------- RISK GAUGE (port of RiskGauge.jsx) ---------- */
  function renderGauge(host, score, bandKey) {
    var CX = 100, CY = 104, R = 82, MAX = 20;
    function pt(v) {
      var theta = Math.PI - (v / MAX) * Math.PI;
      return [CX + R * Math.cos(theta), CY - R * Math.sin(theta)];
    }
    function arc(v0, v1) {
      var a = pt(v0), b = pt(v1);
      return 'M ' + a[0] + ' ' + a[1] + ' A ' + R + ' ' + R + ' 0 0 1 ' + b[0] + ' ' + b[1];
    }
    var meta = RISK_BANDS[bandKey];
    var BANDS = [
      { from: 0, to: 7, color: 'var(--risk-deep)' },
      { from: 7, to: 14, color: 'var(--risk-mid)' },
      { from: 14, to: 20, color: 'var(--risk-good)' },
    ];
    var end = pt(score);
    /* arc length of the score fill — for stroke-dash draw-in.
       full 180deg arc length = pi*R; fraction = score/MAX */
    var fillLen = Math.PI * R; /* dasharray length covers the whole semicircle */

    var bandPaths = BANDS.map(function (b) {
      return (
        '<path d="' + arc(b.from, b.to) + '" fill="none" stroke="' + b.color +
        '" stroke-width="13" stroke-linecap="butt" opacity="0.22"/>'
      );
    }).join('');

    var ticks = [0, 10, 20].map(function (v) {
      var t = pt(v);
      return (
        '<text x="' + t[0] + '" y="' + (t[1] + (v === 10 ? -14 : 20)) + '" text-anchor="middle" ' +
        'fill="var(--text-faint)" font-size="9" font-family="var(--font-display)" font-weight="600">' + v + '</text>'
      );
    }).join('');

    host.className = 'gauge';
    host.innerHTML =
      '<svg class="gauge-svg" viewBox="0 0 200 128">' +
      '<path d="' + arc(0, 20) + '" fill="none" stroke="oklch(100% 0 0 / 0.07)" stroke-width="13" stroke-linecap="round"/>' +
      bandPaths +
      '<path class="gauge-fill" d="' + arc(0, Math.max(score, 0.01)) + '" fill="none" stroke="' + meta.color +
      '" stroke-width="13" stroke-linecap="round" style="--gauge-len:' + fillLen + '"/>' +
      '<circle class="gauge-end" cx="' + end[0] + '" cy="' + end[1] + '" r="9" fill="var(--bg)" stroke="' + meta.color + '" stroke-width="4"/>' +
      ticks +
      '</svg>' +
      '<div class="center" style="margin-top:-28px">' +
      '<div class="gauge-score" style="color:' + meta.color + '">' +
      '<span data-countup="' + score + '" data-duration="1.5">0</span>' +
      '<span style="font-size:1.1rem;color:var(--text-faint)">/20</span></div>' +
      '<div class="gauge-band" style="color:' + meta.color + '">' + esc(meta.label) + '</div>' +
      '</div>';

    observeOnce(host, 0.5, function () {
      host.classList.add('in');
    });
  }

  /* ---------- shared helpers ---------- */
  /* in-view detection — scroll-based, reliable in every browser
     (no IntersectionObserver dependency). */
  var _watch = [];
  function _watchCheck() {
    var vh = window.innerHeight;
    _watch = _watch.filter(function (w) {
      var r = w.el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 0.9 && (r.width || r.height)) {
        w.cb();
        return false;
      }
      return true;
    });
    if (!_watch.length) {
      document.removeEventListener('scroll', _watchCheck, { capture: true });
    }
  }
  function whenInView(el, cb) {
    if (!el) {
      cb();
      return;
    }
    var reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      cb();
      return;
    }
    if (!_watch.length) {
      /* capture-phase on document catches scroll from <body> too */
      document.addEventListener('scroll', _watchCheck, { capture: true, passive: true });
    }
    _watch.push({ el: el, cb: cb });
    _watchCheck();
  }

  /* signature kept (threshold arg ignored) so callers need no change */
  function observeOnce(el, threshold, cb) {
    whenInView(el, cb);
  }

  function initCountUps(scope) {
    var reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function run(el) {
      var to = parseFloat(el.getAttribute('data-countup')) || 0;
      var dur = (parseFloat(el.getAttribute('data-duration')) || 1.4) * 1000;
      if (reduce) {
        el.textContent = String(to);
        return;
      }
      var start = performance.now();
      function tick(now) {
        var t = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(eased * to));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    Array.prototype.slice
      .call(scope.querySelectorAll('[data-countup]'))
      .forEach(function (el) {
        whenInView(el, function () {
          run(el);
        });
      });
  }

  /* ============================================================
     HANDLERS (mirror Diagnostic.jsx)
     ============================================================ */
  function handleBegin() {
    clearDraft();
    savedSubmission = false;
    state.answers = {};
    state.lead = null;
    state.qIndex = 0;
    state.result = null;
    state.emailStatus = null;
    state.phase = 'lead';
    track('diagnostic_start');
    render();
  }

  function handleResume() {
    track('diagnostic_resume');
    if (isComplete(state.answers)) {
      goComputing();
    } else if (state.lead) {
      state.qIndex = firstUnanswered();
      state.phase = 'questions';
      render();
    } else {
      state.phase = 'lead';
      render();
    }
  }

  function handleLeadSubmit(data) {
    state.lead = data;
    track('diagnostic_lead_submit');
    saveDraft({ lead: data, answers: state.answers });
    state.qIndex = firstUnanswered();
    state.phase = 'questions';
    render();
  }

  function handleSelect(points) {
    var q = QUESTIONS[state.qIndex];
    var prev = state.answers[q.id];
    if (prev !== points) {
      state.answers[q.id] = points;
      track('diagnostic_question_answered', {
        question_index: state.qIndex + 1,
        question_id: q.id,
      });
      saveDraft({ lead: state.lead, answers: state.answers });
    }

    /* reflect the selection in-place so the step-enter animation
       does not replay on every click */
    var opts = panelEl.querySelectorAll('.q-option');
    Array.prototype.slice.call(opts).forEach(function (btn) {
      var sel = parseInt(btn.getAttribute('data-points'), 10) === points;
      btn.setAttribute('data-selected', String(sel));
      btn.setAttribute('aria-checked', String(sel));
    });

    /* enable Next now that an answer is picked */
    var next = panelEl.querySelector('#q-next');
    if (next) next.disabled = false;

    /* advance the progress bar in place */
    var fill = barExtraEl.querySelector('.progress-fill');
    if (fill) {
      fill.style.width =
        Math.round((answeredCount(state.answers) / TOTAL_QUESTIONS) * 100) + '%';
    }
  }

  function handleNext() {
    var q = QUESTIONS[state.qIndex];
    if (state.answers[q.id] === undefined) return;
    if (state.qIndex >= TOTAL_QUESTIONS - 1) {
      goComputing();
    } else {
      state.qIndex += 1;
      render();
    }
  }

  function handleBack() {
    if (state.phase === 'lead') {
      state.phase = 'intro';
      render();
    } else if (state.phase === 'questions') {
      if (state.qIndex === 0) {
        state.phase = 'lead';
      } else {
        state.qIndex -= 1;
      }
      render();
    }
  }

  function handleRetake() {
    track('diagnostic_retake');
    clearDraft();
    savedSubmission = false;
    state.answers = {};
    state.lead = null;
    state.qIndex = 0;
    state.result = null;
    state.emailStatus = null;
    state.phase = 'intro';
    render();
  }

  function goComputing() {
    state.phase = 'computing';
    render();
    setTimeout(function () {
      var r = computeResult(state.answers);
      state.result = r;
      if (!savedSubmission) {
        savedSubmission = true;
        saveSubmission({ lead: state.lead, answers: state.answers, result: r });
        clearDraft();
        track('diagnostic_complete', {
          quadrant: r.quadrant,
          risk_band: r.riskBand,
          recommendation: r.recommendationKey,
          could_score: r.section2,
          should_score: r.section3,
          risk_score: r.riskScore,
        });
        sendResultsEmail(state.lead, r);
      }
      state.phase = 'results';
      render();
    }, COMPUTE_MS);
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function init() {
    panelEl = document.getElementById('diag-panel');
    barExtraEl = document.getElementById('diag-bar-extra');
    if (!panelEl || !barExtraEl) return;

    /* hydrate any saved draft */
    var draft = loadDraft();
    if (draft.lead) state.lead = draft.lead;
    if (draft.answers) state.answers = draft.answers;

    state.phase = 'intro';
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
