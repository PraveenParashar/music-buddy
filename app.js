/* Tune Quest — a Duolingo-style music game for kids. Plain JS, no build step. */

const $ = (s) => document.querySelector(s);
const app = $('#app');

const QUESTIONS_PER_LESSON = 5;
const LIVES = 3;

// ---------- Music data ----------
const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BASE_FREQ = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 };
const NOTE_COLORS = { C: '#ff6b6b', D: '#ffa94d', E: '#fcc419', F: '#69db7c', G: '#38d9a9', A: '#4dabf7', B: '#9775fa' };
const PIANO_KEYS = [...NOTES, ...NOTES.map((n) => n + '5')];
const freqOf = (name) => BASE_FREQ[name[0]] * (name.endsWith('5') ? 2 : 1);
const ICONS = { identify: '🎵', compare: '↕️', beats: '🥁', climb: '🪜', theory: '📖', song: '🎶' };

const SONGS = {
  twinkle: {
    id: 'twinkle',
    name: 'Twinkle Twinkle Little Star',
    notes: ['C', 'C', 'G', 'A', 'G', 'F', 'E', 'D', 'C'],
    description: 'A classic lullaby loved by children worldwide',
  },
  happy: {
    id: 'happy',
    name: 'Happy Birthday',
    notes: ['C', 'C', 'D', 'C', 'F', 'E'],
    description: 'The most famous birthday song ever',
  },
  mary: {
    id: 'mary',
    name: 'Mary Had A Little Lamb',
    notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E'],
    description: 'A beloved nursery rhyme',
  },
  jingle: {
    id: 'jingle',
    name: 'Jingle Bells',
    notes: ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'G', 'C', 'D', 'E'],
    description: 'A holiday favorite',
  },
};

const UNITS = [
  {
    id: 'u1', title: 'Meet the notes', desc: 'Learn to recognise each note by ear.', color: '#58cc02',
    lessons: NOTES.slice(1).map((_, i) => ({
      id: `u1-${i + 1}`, title: `Notes ${NOTES.slice(0, i + 2).join(', ')}`,
      kind: 'identify', pool: NOTES.slice(0, i + 2),
    })),
  },
  {
    id: 'u2', title: 'Higher or lower', desc: 'Which sound is higher? Start close, then jump further.', color: '#1cb0f6',
    lessons: [
      { id: 'u2-1', title: 'Close neighbours', kind: 'compare', gap: 1 },
      { id: 'u2-2', title: 'Skip a note', kind: 'compare', gap: 2 },
      { id: 'u2-3', title: 'Bigger jumps', kind: 'compare', gap: 3 },
      { id: 'u2-4', title: 'Big leaps', kind: 'compare', gap: 4 },
    ],
  },
  {
    id: 'u3', title: 'Count the beats', desc: 'Listen to the drum and count the beats.', color: '#ff9600',
    lessons: [
      { id: 'u3-1', title: 'Two or three', kind: 'beats', min: 2, max: 3 },
      { id: 'u3-2', title: 'Up to four', kind: 'beats', min: 2, max: 4 },
      { id: 'u3-3', title: 'Up to five', kind: 'beats', min: 3, max: 5 },
    ],
  },
  {
    id: 'u4', title: 'Climb the scale', desc: 'Hear the start of the scale and guess the next note.', color: '#ce82ff',
    lessons: [
      { id: 'u4-1', title: 'First steps', kind: 'climb', min: 2, max: 3 },
      { id: 'u4-2', title: 'Keep climbing', kind: 'climb', min: 3, max: 5 },
      { id: 'u4-3', title: 'Almost home', kind: 'climb', min: 4, max: 6 },
    ],
  },
  {
    id: 'u5', title: 'Music theory 101', desc: 'Learn the basics of music notation and theory.', color: '#d946ef',
    lessons: [
      { id: 'u5-1', title: 'What are notes?', kind: 'theory', topic: 'notes', level: 1 },
      { id: 'u5-2', title: 'Intervals explained', kind: 'theory', topic: 'intervals', level: 1 },
      { id: 'u5-3', title: 'Major scale', kind: 'theory', topic: 'scale', level: 1 },
      { id: 'u5-4', title: 'Time signatures', kind: 'theory', topic: 'time', level: 1 },
    ],
  },
  {
    id: 'u6', title: 'Learn songs', desc: 'Master the melodies of famous songs.', color: '#f59e0b',
    lessons: [
      { id: 'u6-1', title: SONGS.twinkle.name, kind: 'song', song: 'twinkle' },
      { id: 'u6-2', title: SONGS.happy.name, kind: 'song', song: 'happy' },
      { id: 'u6-3', title: SONGS.mary.name, kind: 'song', song: 'mary' },
      { id: 'u6-4', title: SONGS.jingle.name, kind: 'song', song: 'jingle' },
    ],
  },
];
const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unitId: u.id })));
const findLesson = (id) => ALL_LESSONS.find((l) => l.id === id);

// ---------- Badges ----------
const countDone = (s) => Object.keys(s.done).length;
const unitDone = (s, uid) => UNITS.find((u) => u.id === uid).lessons.every((l) => s.done[l.id]);
const BADGES = [
  { id: 'first', icon: '🎵', title: 'First Note', desc: 'Finish your first lesson', test: (s) => countDone(s) >= 1 },
  { id: 'five', icon: '🎼', title: 'Getting Going', desc: 'Finish 5 lessons', test: (s) => countDone(s) >= 5 },
  { id: 'perfect', icon: '💯', title: 'Perfect Ear', desc: 'Get 3 stars in a lesson', test: (s) => Object.values(s.done).includes(3) },
  { id: 'streak3', icon: '🔥', title: 'On Fire', desc: 'Practise 3 days in a row', test: (s) => s.streak >= 3 },
  { id: 'xp100', icon: '⭐', title: '100 XP Club', desc: 'Earn 100 XP', test: (s) => s.xp >= 100 },
  { id: 'unit1', icon: '🎹', title: 'Note Master', desc: 'Finish "Meet the notes"', test: (s) => unitDone(s, 'u1') },
  { id: 'unit4', icon: '🚀', title: 'Scale Climber', desc: 'Finish "Climb the scale"', test: (s) => unitDone(s, 'u4') },
  { id: 'unit5', icon: '📖', title: 'Theory Master', desc: 'Finish "Music theory 101"', test: (s) => unitDone(s, 'u5') },
  { id: 'unit6', icon: '🎶', title: 'Song Learner', desc: 'Finish "Learn songs"', test: (s) => unitDone(s, 'u6') },
  { id: 'twinkle', icon: '⭐', title: 'Twinkle Master', desc: 'Perfect "Twinkle Twinkle Little Star"', test: (s) => s.done['u6-1'] === 3 },
  { id: 'happy', icon: '🎂', title: 'Birthday Champ', desc: 'Perfect "Happy Birthday"', test: (s) => s.done['u6-2'] === 3 },
];

// ---------- State (saved in this browser) ----------
const STORAGE_KEY = 'tunequest-v1';
let state = Object.assign(
  { xp: 0, streak: 0, lastDay: null, done: {}, badges: [] },
  (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } })() || {}
);
const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const dayString = (d = new Date()) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
function touchStreak() {
  const today = dayString();
  if (state.lastDay === today) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  state.streak = state.lastDay === dayString(yesterday) ? state.streak + 1 : 1;
  state.lastDay = today;
}
function checkBadges() {
  const unlocked = [];
  BADGES.forEach((b) => {
    if (!state.badges.includes(b.id) && b.test(state)) {
      state.badges.push(b.id);
      unlocked.push(b);
    }
  });
  return unlocked;
}
function updateStats() {
  $('#streak').textContent = `🔥 ${state.streak}`;
  $('#xp').textContent = `⭐ ${state.xp} XP`;
}

// ---------- Sound (Web Audio, no sound files needed) ----------
let audioCtx;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function tone(freq, when = 0, dur = 0.9, vol = 0.3) {
  const ctx = getCtx();
  const t = ctx.currentTime + when;
  const master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  // Triangle + soft sine overtone gives a warmer, piano-ish tone.
  [[1, 'triangle', 1], [2, 'sine', 0.3]].forEach(([mult, type, amp]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq * mult;
    g.gain.value = amp;
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  });
}
const playNote = (name, when = 0) => tone(freqOf(name), when, 1.0, 0.3);
const playClick = (when = 0) => tone(900, when, 0.08, 0.3);
function playSequence(names, gap = 0.6) {
  names.forEach((n, i) => playNote(n, i * gap));
}
function playBeats(n, gap = 0.5) {
  for (let i = 0; i < n; i++) playClick(i * gap);
}
const playCorrect = () => { tone(523.25, 0, 0.3, 0.25); tone(659.25, 0.15, 0.5, 0.25); };
const playWrong = () => tone(180, 0, 0.35, 0.25);

// ---------- Random helpers ----------
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Question generators ----------
function makeQuestion(lesson) {
  switch (lesson.kind) {
    case 'identify': {
      const target = pick(lesson.pool);
      const others = shuffle(lesson.pool.filter((n) => n !== target)).slice(0, 3);
      return {
        prompt: 'Which note did you hear?',
        play: () => playNote(target),
        answer: target,
        options: shuffle([target, ...others]).map((v) => ({ label: v, value: v })),
      };
    }
    case 'compare': {
      const a = randInt(0, 6 - lesson.gap);
      const b = a + lesson.gap;
      const flip = Math.random() < 0.5;
      const firstIdx = flip ? b : a;
      const secondIdx = flip ? a : b;
      return {
        prompt: 'Which sound was higher?',
        play: () => playSequence([NOTES[firstIdx], NOTES[secondIdx]], 0.9),
        answer: secondIdx > firstIdx ? 'second' : 'first',
        options: [
          { label: 'First sound', value: 'first' },
          { label: 'Second sound', value: 'second' },
        ],
      };
    }
    case 'beats': {
      const n = randInt(lesson.min, lesson.max);
      const others = shuffle([...Array(lesson.max + 1)].map((_, i) => i + 1).filter((x) => x !== n)).slice(0, 3);
      return {
        prompt: 'How many beats did you hear?',
        play: () => playBeats(n),
        answer: n,
        options: shuffle([n, ...others]).map((v) => ({ label: String(v), value: v })),
      };
    }
    case 'climb': {
      const k = randInt(lesson.min, lesson.max);
      const target = NOTES[k];
      const others = shuffle(NOTES.filter((n) => n !== target)).slice(0, 3);
      return {
        prompt: 'What note comes next?',
        play: () => playSequence(NOTES.slice(0, k), 0.5),
        answer: target,
        reveal: () => playNote(target),
        options: shuffle([target, ...others]).map((v) => ({ label: v, value: v })),
      };
    }
    case 'theory': {
      const theories = [
        { q: 'What is the interval between C and E?', a: 'Third', opts: ['Second', 'Third', 'Fourth', 'Fifth'] },
        { q: 'How many notes are in a major scale?', a: '8', opts: ['5', '7', '8', '12'] },
        { q: 'What does 4/4 time mean?', a: '4 beats per measure', opts: ['3 beats per measure', '4 beats per measure', '8 beats per measure', '2 beats per measure'] },
        { q: 'What is the lowest note on a standard piano?', a: 'A0', opts: ['C0', 'A0', 'C1', 'E1'] },
        { q: 'How many semitones are in an octave?', a: '12', opts: ['8', '10', '12', '14'] },
        { q: 'What is the relative minor of C major?', a: 'A minor', opts: ['A minor', 'D minor', 'E minor', 'G minor'] },
        { q: 'Which note is one octave above middle C?', a: 'C5', opts: ['C4', 'C5', 'C6', 'D5'] },
        { q: 'What are the 12 chromatic notes called?', a: 'Semitones', opts: ['Tones', 'Octaves', 'Semitones', 'Intervals'] },
        { q: 'How many white keys are on a standard piano?', a: '52', opts: ['49', '52', '56', '60'] },
      ];
      const t = pick(theories);
      return {
        prompt: t.q,
        play: () => {},
        answer: t.a,
        options: shuffle(t.opts).map((v) => ({ label: v, value: v })),
      };
    }
    case 'song': {
      const song = SONGS[lesson.song];
      const idx = randInt(0, song.notes.length - 2);
      const playedNotes = song.notes.slice(0, idx + 1);
      const target = song.notes[idx + 1];
      const others = shuffle(NOTES.filter((n) => n !== target)).slice(0, 3);
      return {
        prompt: `Next note in "${song.name}"?`,
        play: () => playSequence(playedNotes, 0.5),
        answer: target,
        reveal: () => playNote(target),
        options: shuffle([target, ...others]).map((v) => ({ label: v, value: v })),
        songId: lesson.song,
        playedNotes: playedNotes,
      };
    }
  }
}

// ---------- Lesson flow ----------
let session = null; // { lesson, qs, i, correct, mistakes, lives, locked }

function startLesson(lesson) {
  session = {
    lesson,
    qs: Array.from({ length: QUESTIONS_PER_LESSON }, () => makeQuestion(lesson)),
    i: 0, correct: 0, mistakes: 0, lives: LIVES, locked: false,
  };
  document.body.classList.add('in-lesson');

  if (lesson.kind === 'song') {
    showSongNotation();
  } else {
    showQuestion();
  }
}

function showSongNotation() {
  const song = SONGS[session.lesson.song];
  app.innerHTML = `
    <div class="quiz-top">
      <button class="icon-btn" id="quit" aria-label="Quit lesson">✕</button>
      <div style="flex:1">Learn the notes</div>
      <div class="lives">❤️ ${session.lives}</div>
    </div>

    <div class="notation-view">
      <h2>${song.name}</h2>
      <div class="full-staff">
        <div class="staff">
          <div class="staff-line"></div>
          <div class="staff-line"></div>
          <div class="staff-line"></div>
          <div class="staff-line"></div>
          <div class="staff-line"></div>
          <div class="notes-container">
            ${song.notes.map((note, i) => {
              const pos = NOTES.indexOf(note);
              const top = (4 - pos) * 12;
              return `<div class="notation-note" data-note="${note}" style="left: ${i * 60 + 30}px; top: ${top}px;" title="${note}">
                <div class="note-head">●</div>
                <div class="note-label">${note}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="notation-controls">
        <button class="btn secondary" id="play-all">▶ Play all notes</button>
        <button class="btn" id="start-lesson">Start lesson →</button>
      </div>

      <p class="notation-hint">Click any note to hear it. Then click "Start lesson" to begin!</p>
    </div>`;

  $('#quit').onclick = () => { if (confirm('Quit this lesson? Progress in it will be lost.')) exitLesson(); };
  $('#play-all').onclick = () => playSequence(song.notes, 0.5);
  $('#start-lesson').onclick = () => showQuestion();

  document.querySelectorAll('.notation-note').forEach((el) => {
    el.onclick = (e) => { e.stopPropagation(); playNote(el.dataset.note); };
  });
}

function exitLesson() {
  session = null;
  document.body.classList.remove('in-lesson');
  go('learn');
}

function showQuestion() {
  const q = session.qs[session.i];
  const pct = (session.i / session.qs.length) * 100;
  const isSong = session.lesson.kind === 'song';
  const songSheet = isSong ? renderSongSheet(session.lesson.song, q) : '';

  app.innerHTML = `
    <div class="quiz-top">
      <button class="icon-btn" id="quit" aria-label="Quit lesson">✕</button>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="lives">❤️ ${session.lives}</div>
    </div>
    ${songSheet}
    <div class="question">
      <h3>${q.prompt}</h3>
      <button class="listen" id="listen" aria-label="Play sound">🔊</button>
    </div>
    <div class="options">
      ${q.options.map((o, idx) => `<button class="opt" data-idx="${idx}">${o.label}</button>`).join('')}
    </div>
    <div id="fb"></div>`;

  $('#quit').onclick = () => { if (confirm('Quit this lesson? Progress in it will be lost.')) exitLesson(); };
  $('#listen').onclick = () => q.play();
  document.querySelectorAll('.opt').forEach((b) => {
    b.onclick = () => answer(Number(b.dataset.idx));
  });
  document.querySelectorAll('.note-dot').forEach((el) => {
    el.onclick = (e) => { e.stopPropagation(); playNote(el.dataset.note); };
  });
  q.play();
}

function renderSongSheet(songId, q) {
  if (!q.playedNotes || !q.songId) return '';

  const playedNotes = q.playedNotes;

  return `
    <div class="song-sheet">
      <p class="song-title">${SONGS[q.songId].name}</p>
      <div class="staff">
        <div class="staff-line"></div>
        <div class="staff-line"></div>
        <div class="staff-line"></div>
        <div class="staff-line"></div>
        <div class="staff-line"></div>
        <div class="notes-container">
          ${playedNotes.map((note, i) => {
            const pos = NOTES.indexOf(note);
            const top = (4 - pos) * 12;
            return `<div class="note-dot" data-note="${note}" style="left: ${i * 48 + 20}px; top: ${top}px;" title="${note}">●</div>`;
          }).join('')}
        </div>
      </div>
      <p class="sheet-hint">Click any note to hear it 🔊</p>
    </div>`;
}

function answer(idx) {
  if (session.locked) return;
  session.locked = true;
  const q = session.qs[session.i];
  const ok = q.options[idx].value === q.answer;

  document.querySelectorAll('.opt').forEach((b) => {
    b.disabled = true;
    const value = q.options[Number(b.dataset.idx)].value;
    if (value === q.answer) b.classList.add('correct');
    else if (Number(b.dataset.idx) === idx) b.classList.add('wrong');
  });

  if (ok) { session.correct++; playCorrect(); }
  else { session.lives--; session.mistakes++; playWrong(); }
  if (q.reveal) setTimeout(q.reveal, 450);

  const answerLabel = q.options.find((o) => o.value === q.answer).label;
  const outOfLives = session.lives === 0;
  const last = session.i === session.qs.length - 1;
  const btnText = outOfLives ? 'See results' : last ? 'Finish' : 'Continue';
  const cheer = ['Nice!', 'Great ear!', 'You got it!', 'Awesome!'][randInt(0, 3)];

  $('#fb').innerHTML = `
    <div class="feedback ${ok ? 'good' : 'bad'}">
      <p>${ok ? '🎉 ' + cheer : '😬 Not quite — the answer was ' + answerLabel}</p>
      <button class="btn" id="next">${btnText}</button>
    </div>`;
  $('#next').onclick = nextQuestion;
}

function nextQuestion() {
  session.locked = false;
  session.i++;
  if (session.lives === 0 || session.i >= session.qs.length) finishLesson();
  else showQuestion();
}

function finishLesson() {
  const { lesson, correct, mistakes, lives } = session;
  const passed = lives > 0;
  const perfect = passed && mistakes === 0;
  const stars = passed ? (perfect ? 3 : mistakes === 1 ? 2 : 1) : 0;

  let xpGained = 0;
  let unlocked = [];
  if (passed) {
    const firstTime = !state.done[lesson.id];
    const full = correct * 10 + 20 + (perfect ? 20 : 0);
    xpGained = firstTime ? full : 5; // replays give a little XP, so farming isn't worth it
    state.done[lesson.id] = Math.max(state.done[lesson.id] || 0, stars);
    state.xp += xpGained;
    touchStreak();
    unlocked = checkBadges();
    saveState();
    playCorrect();
  }
  updateStats();

  app.innerHTML = `
    <section class="results">
      <div class="big">${passed ? '🏆' : '💔'}</div>
      <h2>${passed ? 'Lesson complete!' : 'Out of hearts'}</h2>
      <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <p>${correct}/${QUESTIONS_PER_LESSON} correct · +${xpGained} XP</p>
      ${unlocked.map((b) => `
        <div class="card">${b.icon} <strong>Badge unlocked: ${b.title}</strong><br><span class="muted">${b.desc}</span></div>`).join('')}
      ${passed ? '' : '<p class="muted">No worries, you can try again any time.</p>'}
      <button class="btn" id="done">${passed ? 'Continue' : 'Try again'}</button>
    </section>`;

  $('#done').onclick = () => {
    if (passed) exitLesson();
    else { document.body.classList.remove('in-lesson'); startLesson(lesson); }
  };
}

// ---------- Screens ----------
function renderLearn() {
  let html = '';
  let flatIndex = 0;
  UNITS.forEach((u, ui) => {
    html += `
      <div class="unit-head" style="--c:${u.color}">
        <h2>Unit ${ui + 1}: ${u.title}</h2>
        <p>${u.desc}</p>
      </div>
      <div class="path">`;
    u.lessons.forEach((l) => {
      const prev = ALL_LESSONS[flatIndex - 1];
      const unlocked = true;
      const done = !!state.done[l.id];
      html += `
        <button class="node ${done ? 'done' : ''} ${unlocked ? '' : 'locked'}"
                style="--c:${u.color}" data-id="${l.id}" aria-label="${l.title}">
          ${unlocked ? ICONS[l.kind] : '🔒'}
        </button>
        <div class="node-label">${l.title}</div>`;
      flatIndex++;
    });
    html += '</div>';
  });

  app.innerHTML = `<h1 class="page-title">Your path</h1><p class="muted">Finish a lesson to unlock the next one.</p>${html}`;
  document.querySelectorAll('.node:not(.locked)').forEach((btn) => {
    btn.onclick = () => startLesson(findLesson(btn.dataset.id));
  });
}

function renderPiano() {
  app.innerHTML = `
    <h1 class="page-title">Free piano</h1>
    <p class="piano-note">Tap any key to hear it. Slide your finger across for a fun glissando!</p>
    <div class="keys">
      ${PIANO_KEYS.map((n) => `<button class="key" data-n="${n}" style="--k:${NOTE_COLORS[n[0]]}">${n[0]}</button>`).join('')}
    </div>
    <button class="btn secondary scale-btn" id="scale">▶ Play the scale</button>`;

  document.querySelectorAll('.key').forEach((el) => {
    el.addEventListener('pointerdown', () => {
      playNote(el.dataset.n);
      el.classList.add('lit');
      setTimeout(() => el.classList.remove('lit'), 150);
    });
  });
  $('#scale').onclick = () => playSequence([...NOTES, 'C5'], 0.35);
}

function renderBadges() {
  app.innerHTML = `
    <h1 class="page-title">Badges</h1>
    <p class="muted">${state.badges.length} of ${BADGES.length} unlocked</p>
    ${BADGES.map((b) => {
      const got = state.badges.includes(b.id);
      return `<div class="badge ${got ? '' : 'locked'}">
        <div class="icon">${got ? b.icon : '🔒'}</div>
        <div><h4>${b.title}</h4><p>${b.desc}</p></div>
      </div>`;
    }).join('')}`;
}

// ---------- Navigation ----------
function go(tab) {
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'learn') renderLearn();
  if (tab === 'piano') renderPiano();
  if (tab === 'badges') renderBadges();
  window.scrollTo(0, 0);
}

document.querySelectorAll('.tabbar button').forEach((btn) => {
  btn.onclick = () => go(btn.dataset.tab);
});

updateStats();
go('learn');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
