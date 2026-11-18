/* Tune Quest — a Duolingo-style music game for kids. Plain JS, no build step. */

const $ = (s) => document.querySelector(s);
const app = $('#app');

const QUESTIONS_PER_LESSON = 5;
const LIVES = 3;

// ---------- Music data ----------
const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BASE_FREQ = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88 };
const NOTE_COLORS = { C: '#ff6b6b', D: '#ffa94d', E: '#fcc419', F: '#69db7c', G: '#38d9a9', A: '#4dabf7', B: '#9775fa' };
// Extended piano range: 3 octaves (C3 to C6)
const PIANO_KEYS = [
  ...NOTES.map((n) => n + '3'),
  ...NOTES.map((n) => n + '4'),
  ...NOTES.map((n) => n + '5'),
  ...NOTES.map((n) => n + '6'),
  'C6'
];
const freqOf = (name) => {
  const baseNote = name[0];
  const octave = parseInt(name.slice(1)) || 4;
  const baseFreq = BASE_FREQ[baseNote];
  return baseFreq * Math.pow(2, octave - 4);
};
const ICONS = { identify: '🎵', compare: '↕️', beats: '🥁', climb: '🪜', theory: '📖', song: '🎶' };

const SONGS = {
  twinkle: {
    id: 'twinkle',
    name: 'Twinkle Twinkle Little Star',
    notes: ['C', 'C', 'G', 'A', 'G', 'F', 'E', 'D', 'C'],
    lyrics: ['Twin', 'kle', 'Twin', 'kle', 'Lit', 'tle', 'Star', 'Up', 'High'],
    description: 'A classic lullaby loved by children worldwide',
    difficulty: 'Easy',
    key: 'C Major',
    bpm: 120,
    noteCount: 9,
    icon: '⭐',
    tags: ['Lullaby', 'Classic'],
    noteGap: 0.6,
  },
  happy: {
    id: 'happy',
    name: 'Happy Birthday',
    notes: ['C', 'C', 'D', 'C', 'F', 'E'],
    lyrics: ['Hap', 'py', 'Birth', 'day', 'to', 'you'],
    description: 'The most famous birthday song ever',
    difficulty: 'Easy',
    key: 'C Major',
    bpm: 110,
    noteCount: 6,
    icon: '🎂',
    tags: ['Celebration', 'Classic'],
    noteGap: 0.5,
  },
  mary: {
    id: 'mary',
    name: 'Mary Had A Little Lamb',
    notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E'],
    lyrics: ['Ma', 'ry', 'had', 'a', 'lamb', 'lamb', 'lamb'],
    description: 'A beloved nursery rhyme',
    difficulty: 'Easy',
    key: 'C Major',
    bpm: 100,
    noteCount: 7,
    icon: '🐑',
    tags: ['Nursery', 'Classic'],
    noteGap: 0.6,
  },
  jingle: {
    id: 'jingle',
    name: 'Jingle Bells',
    notes: ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'G', 'C', 'D', 'E'],
    lyrics: ['Jin', 'gle', 'Bells', 'Jin', 'gle', 'Bells', 'All', 'the', 'way', 'Ho', 'Hoo'],
    description: 'A holiday favorite with a catchy melody',
    difficulty: 'Medium',
    key: 'C Major',
    bpm: 130,
    noteCount: 11,
    icon: '🔔',
    tags: ['Holiday', 'Fun'],
    noteGap: 0.45,
  },
  chandamama: {
    id: 'chandamama',
    name: 'Chanda Mama (Hindi)',
    notes: ['G', 'C5', 'C5', 'B', 'A', 'G', 'F', 'E', 'D', 'C'],
    lyrics: ['Chan', 'da', 'Ma', 'ma', 'Aa', 'ree', 'aa', 'ree', 'Ho', 'Ho'],
    description: 'Popular Hindi nursery rhyme - "Moon Uncle" - gentle and soothing',
    difficulty: 'Easy',
    key: 'C Major',
    bpm: 90,
    noteCount: 10,
    icon: '🌙',
    tags: ['Hindi', 'Lullaby', 'Cultural'],
    noteGap: 0.7,
  },
  baabaa: {
    id: 'baabaa',
    name: 'Baa Baa Black Sheep (Hindi)',
    notes: ['C', 'C', 'G', 'A', 'G', 'F', 'E', 'D', 'C'],
    lyrics: ['Baa', 'Baa', 'Baa', 'Baa', 'Black', 'Sheep', 'Have', 'You', 'Wool'],
    description: 'Hindi version of famous nursery rhyme - playful and fun',
    difficulty: 'Easy',
    key: 'C Major',
    bpm: 110,
    noteCount: 9,
    icon: '🐑',
    tags: ['Hindi', 'Nursery', 'Cultural'],
    noteGap: 0.6,
  },
  mehendi: {
    id: 'mehendi',
    name: 'Mehendi Laga Ke (Bollywood)',
    notes: ['D', 'E', 'F', 'G', 'A', 'G', 'F', 'E', 'D'],
    lyrics: ['Me', 'hen', 'di', 'La', 'ga', 'Ke', 'Ra', 'ha', 'Hoon'],
    description: 'Popular Bollywood song - intermediate level - wedding favorite',
    difficulty: 'Medium',
    key: 'D Major',
    bpm: 140,
    noteCount: 9,
    icon: '💃',
    tags: ['Bollywood', 'Wedding', 'Hindi'],
    noteGap: 0.43,
  },
  raga: {
    id: 'raga',
    name: 'Raag Yaman (Indian Classical)',
    notes: ['G', 'A', 'B', 'C5', 'D5', 'C5', 'B', 'A', 'G'],
    lyrics: ['Raa', 'gaa', 'Ya', 'maan', 'Shu', 'ddha', 'Raa', 'gaa', 'Om'],
    description: 'Indian classical raga - beautiful and meditative - advanced techniques',
    difficulty: 'Hard',
    key: 'G Major',
    bpm: 80,
    noteCount: 9,
    icon: '🎼',
    tags: ['Classical', 'Indian', 'Advanced'],
    noteGap: 0.8,
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
  {
    id: 'u7', title: 'Hindi Songs', desc: 'Learn popular Hindi melodies and Bollywood songs.', color: '#ec4899',
    lessons: [
      { id: 'u7-1', title: SONGS.chandamama.name, kind: 'song', song: 'chandamama' },
      { id: 'u7-2', title: SONGS.baabaa.name, kind: 'song', song: 'baabaa' },
      { id: 'u7-3', title: SONGS.mehendi.name, kind: 'song', song: 'mehendi' },
      { id: 'u7-4', title: SONGS.raga.name, kind: 'song', song: 'raga' },
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
  { id: 'unit7', icon: '🇮🇳', title: 'Hindi Melody Master', desc: 'Finish "Hindi Songs"', test: (s) => unitDone(s, 'u7') },
  { id: 'twinkle', icon: '⭐', title: 'Twinkle Master', desc: 'Perfect "Twinkle Twinkle Little Star"', test: (s) => s.done['u6-1'] === 3 },
  { id: 'happy', icon: '🎂', title: 'Birthday Champ', desc: 'Perfect "Happy Birthday"', test: (s) => s.done['u6-2'] === 3 },
  { id: 'daily7', icon: '📅', title: 'Week Warrior', desc: 'Complete 7 daily challenges', test: (s) => (s.dailyChallengeCount || 0) >= 7 },
];

// ---------- State (saved in this browser) ----------
const STORAGE_KEY = 'tunequest-v1';
let state = Object.assign(
  { xp: 0, streak: 0, lastDay: null, done: {}, badges: [], dailyChallenge: null, dailyChallengeDate: null, dailyChallengeDone: false, dailyChallengeCount: 0 },
  (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } })() || {}
);
const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

function generateDailyChallenge() {
  const today = dayString();
  if (state.dailyChallengeDate === today && state.dailyChallenge) return state.dailyChallenge;

  const allLessons = ALL_LESSONS;
  const randomLesson = pick(allLessons);

  state.dailyChallenge = randomLesson.id;
  state.dailyChallengeDate = today;
  state.dailyChallengeDone = false;
  saveState();
  return randomLesson.id;
}

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
let currentInstrument = 'piano';
const INSTRUMENTS = {
  piano: { name: '🎹 Piano', attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.5 },
  violin: { name: '🎻 Violin', attack: 0.1, decay: 0.1, sustain: 0.9, release: 0.3 },
  flute: { name: '🪈 Flute', attack: 0.08, decay: 0.05, sustain: 0.8, release: 0.2 },
  bell: { name: '🔔 Bell', attack: 0.05, decay: 0.6, sustain: 0.4, release: 0.8 },
  synth: { name: '⚡ Synth', attack: 0.03, decay: 0.1, sustain: 0.9, release: 0.3 },
};

function tone(freq, when = 0, dur = 0.9, vol = 0.3, instrument = currentInstrument) {
  const ctx = getCtx();
  const t = ctx.currentTime + when;
  const master = ctx.createGain();
  master.connect(ctx.destination);

  const inst = INSTRUMENTS[instrument] || INSTRUMENTS.piano;

  // ADSR envelope
  const attack = inst.attack;
  const decay = inst.decay;
  const sustain = inst.sustain;
  const release = inst.release;

  master.gain.setValueAtTime(0.0001, t);
  master.gain.linearRampToValueAtTime(vol, t + attack);
  master.gain.linearRampToValueAtTime(vol * sustain, t + attack + decay);
  master.gain.setValueAtTime(vol * sustain, t + dur);
  master.gain.linearRampToValueAtTime(0.0001, t + dur + release);

  // Different waveforms for different instruments
  const waves = {
    piano: [[1, 'triangle', 1], [2, 'sine', 0.3]],
    violin: [[1, 'sine', 1], [2, 'sine', 0.4], [3, 'sine', 0.2]],
    flute: [[1, 'sine', 1], [2, 'sine', 0.1]],
    bell: [[1, 'sine', 1], [2, 'sine', 0.6], [3, 'sine', 0.3], [4, 'sine', 0.1]],
    synth: [[1, 'square', 0.8], [2, 'sine', 0.3]],
  };

  const waveList = waves[instrument] || waves.piano;
  waveList.forEach(([mult, type, amp]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq * mult;
    g.gain.value = amp;
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + release);
  });
}
const playNote = (name, when = 0, instrument = currentInstrument) => tone(freqOf(name), when, 1.0, 0.3, instrument);
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
    showSongModeSelect();
  } else {
    showQuestion();
  }
}

function showSongModeSelect() {
  app.innerHTML = `
    <div class="quiz-top">
      <button class="icon-btn" id="quit" aria-label="Quit lesson">✕</button>
      <div style="flex:1">Choose Mode</div>
      <div class="lives" style="visibility:hidden">❤️ 3</div>
    </div>

    <div class="mode-select">
      <div class="mode-select-content">
        <h2>How to Learn This Song?</h2>

        <div class="mode-card" id="notation-mode">
          <div class="mode-icon">📖</div>
          <div class="mode-info">
            <h3>Sheet Music Mode</h3>
            <p>Learn at your own pace with sheet music notation</p>
            <ul class="mode-features">
              <li>✓ View full notation</li>
              <li>✓ Click notes to hear</li>
              <li>✓ Take interactive quiz</li>
              <li>✓ No time pressure</li>
            </ul>
          </div>
        </div>

        <div class="mode-card" id="rhythm-mode">
          <div class="mode-icon">🎮</div>
          <div class="mode-info">
            <h3>Rhythm Game Mode</h3>
            <p>Play as a rhythm game with falling notes & lyrics</p>
            <ul class="mode-features">
              <li>✓ Tap notes with timing</li>
              <li>✓ Follow lyrics</li>
              <li>✓ Score & combo system</li>
              <li>✓ Fun & challenging!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  $('#quit').onclick = () => { if (confirm('Quit this lesson? Progress in it will be lost.')) exitLesson(); };
  $('#notation-mode').onclick = () => showSongNotation();
  $('#rhythm-mode').onclick = () => showTempoSelect();
}

let rhythmGameState = null;

function showTempoSelect() {
  app.innerHTML = `
    <div class="quiz-top">
      <button class="icon-btn" id="quit" aria-label="Quit lesson">✕</button>
      <div style="flex:1">Select Speed</div>
      <div class="lives" style="visibility:hidden">❤️ 3</div>
    </div>

    <div class="tempo-select">
      <h2>Choose Game Speed</h2>
      <p class="tempo-desc">Select a comfortable speed to start with</p>

      <div class="tempo-buttons">
        <button class="tempo-btn" data-tempo="0.5">🐢 Slow (50%)</button>
        <button class="tempo-btn" data-tempo="0.75">🚶 Slower (75%)</button>
        <button class="tempo-btn active" data-tempo="1">⚡ Normal (100%)</button>
        <button class="tempo-btn" data-tempo="1.25">🏃 Fast (125%)</button>
        <button class="tempo-btn" data-tempo="1.5">🚀 Faster (150%)</button>
      </div>

      <div class="tempo-info">
        <p>💡 <strong>Tip:</strong> Start slow and increase as you get better!</p>
      </div>
    </div>
  `;

  $('#quit').onclick = () => { if (confirm('Quit? Progress will be lost.')) exitLesson(); };

  document.querySelectorAll('.tempo-btn').forEach((btn) => {
    btn.onclick = () => {
      const tempo = parseFloat(btn.dataset.tempo);
      startRhythmGame(tempo);
    };
  });
}

function startRhythmGame(tempo = 1) {
  const song = SONGS[session.lesson.song];
  const noteGap = (song.noteGap || 0.5) / tempo;

  rhythmGameState = {
    song: song,
    notes: song.notes.map((n, i) => ({
      note: n,
      lyric: song.lyrics[i] || n,
      time: i * noteGap,
      hit: false,
      feedback: null,
    })),
    score: 0,
    combo: 0,
    maxCombo: 0,
    hitCount: 0,
    missCount: 0,
    startTime: null,
    gameActive: true,
    tempo: tempo,
    fallSpeed: 150 / tempo,
  };

  app.innerHTML = `
    <div class="rhythm-game">
      <div class="rhythm-top">
        <div class="rhythm-score">
          <div class="score-label">SCORE</div>
          <div class="score-value" id="score">0</div>
        </div>
        <div class="rhythm-info">
          <div>${session.lesson.song.toUpperCase()}</div>
        </div>
        <div class="rhythm-combo">
          <div class="combo-label">COMBO</div>
          <div class="combo-value" id="combo">0</div>
        </div>
      </div>

      <div class="rhythm-container">
        <div class="rhythm-track">
          <div id="notes-container"></div>
          <div class="tap-zone"></div>
        </div>
      </div>

      <div class="rhythm-lyrics">
        <div class="lyric-current" id="lyric-current">Get Ready...</div>
        <div class="lyric-next" id="lyric-next"></div>
      </div>

      <button class="icon-btn" id="quit-rhythm" aria-label="Quit">✕</button>
    </div>
  `;

  $('#quit-rhythm').onclick = () => { if (confirm('Quit? Progress will be lost.')) exitLesson(); };

  renderRhythmNotes();
  startRhythmTiming();
}

function renderRhythmNotes() {
  const container = $('#notes-container');
  rhythmGameState.notes.forEach((noteData, idx) => {
    const noteEl = document.createElement('div');
    noteEl.className = 'rhythm-note';
    noteEl.dataset.idx = idx;
    noteEl.style.setProperty('--k', NOTE_COLORS[noteData.note[0]]);
    noteEl.textContent = noteData.note[0];
    noteEl.dataset.noteTime = noteData.time;
    container.appendChild(noteEl);
  });
}

function startRhythmTiming() {
  rhythmGameState.startTime = Date.now();

  const NOTE_LEAD_TIME = 3;
  const FALL_HEIGHT = 350;

  const updateGame = () => {
    if (!rhythmGameState.gameActive) return;

    const elapsed = (Date.now() - rhythmGameState.startTime) / 1000;
    const container = $('#notes-container');

    let closestNoteIdx = -1;
    let closestTime = Infinity;

    rhythmGameState.notes.forEach((noteData, idx) => {
      const noteEl = container.querySelector(`[data-idx="${idx}"]`);
      if (!noteEl) return;

      const timeUntilHit = noteData.time - elapsed;

      // Find closest upcoming note for lyrics display
      if (timeUntilHit > -0.5 && timeUntilHit < closestTime) {
        closestTime = timeUntilHit;
        closestNoteIdx = idx;
      }

      if (timeUntilHit > NOTE_LEAD_TIME) {
        noteEl.style.opacity = '0';
        noteEl.style.transform = `translateY(-400px)`;
      } else if (timeUntilHit < -0.8) {
        noteEl.style.opacity = '0';
      } else {
        const normalizedTime = (NOTE_LEAD_TIME - timeUntilHit) / NOTE_LEAD_TIME;
        const offset = -FALL_HEIGHT + (normalizedTime * FALL_HEIGHT);
        noteEl.style.opacity = '1';
        noteEl.style.transform = `translateY(${offset}px)`;
      }

      if (timeUntilHit < -0.8 && !noteData.hit && !noteData.feedback) {
        noteData.feedback = 'miss';
        rhythmGameState.combo = 0;
        rhythmGameState.missCount++;
        updateDisplay();
      }
    });

    // Update lyrics display with current note and next lyric
    if (closestNoteIdx >= 0) {
      const current = rhythmGameState.notes[closestNoteIdx];
      const next = closestNoteIdx + 1 < rhythmGameState.notes.length ? rhythmGameState.notes[closestNoteIdx + 1] : null;

      const lyricCurrent = $('#lyric-current');
      const lyricNext = $('#lyric-next');

      if (lyricCurrent) {
        lyricCurrent.innerHTML = `<strong>${current.note}</strong> <em>${current.lyric}</em>`;
      }
      if (lyricNext && next) {
        lyricNext.textContent = `Next: ${next.lyric}`;
      }
    }

    const lastNoteTime = rhythmGameState.notes[rhythmGameState.notes.length - 1].time;
    if (elapsed < lastNoteTime + 1.5) {
      requestAnimationFrame(updateGame);
    } else {
      finishRhythmGame();
    }
  };

  document.addEventListener('click', (e) => handleRhythmTap(e));
  updateGame();
}

function handleRhythmTap(e) {
  if (!rhythmGameState?.gameActive) return;
  if (e.target.closest('.rhythm-note')) {
    const noteEl = e.target.closest('.rhythm-note');
    const idx = parseInt(noteEl.dataset.idx);
    const noteData = rhythmGameState.notes[idx];

    if (noteData.hit || noteData.feedback) return;

    const elapsed = (Date.now() - rhythmGameState.startTime) / 1000;
    const timeDiff = Math.abs(noteData.time - elapsed);

    let feedback = 'miss';
    let points = 0;

    if (timeDiff < 0.1) {
      feedback = 'perfect';
      points = 100;
      playCorrect();
    } else if (timeDiff < 0.2) {
      feedback = 'good';
      points = 50;
      playNote(noteData.note, 0, currentInstrument);
    } else if (timeDiff < 0.4) {
      feedback = 'ok';
      points = 25;
    } else {
      feedback = 'miss';
      points = 0;
      playWrong();
    }

    noteData.hit = true;
    noteData.feedback = feedback;
    rhythmGameState.score += points;

    if (feedback !== 'miss') {
      rhythmGameState.combo++;
      rhythmGameState.hitCount++;
      rhythmGameState.maxCombo = Math.max(rhythmGameState.maxCombo, rhythmGameState.combo);
    } else {
      rhythmGameState.combo = 0;
      rhythmGameState.missCount++;
    }

    noteEl.classList.add(`feedback-${feedback}`);
    updateDisplay();
  }
}

function updateDisplay() {
  $('#score').textContent = rhythmGameState.score;
  $('#combo').textContent = rhythmGameState.combo;
}

function finishRhythmGame() {
  rhythmGameState.gameActive = false;

  const accuracy = rhythmGameState.hitCount / rhythmGameState.notes.length;
  const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.8 ? 2 : accuracy >= 0.6 ? 1 : 0;

  session.correct = rhythmGameState.hitCount;
  session.mistakes = rhythmGameState.missCount;

  const accuracyPct = Math.round(accuracy * 100);

  app.innerHTML = `
    <section class="results">
      <div class="big">🎮</div>
      <h2>Game Over!</h2>
      <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
      <div class="result-stats">
        <div class="stat">
          <div class="stat-label">Score</div>
          <div class="stat-value">${rhythmGameState.score}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Accuracy</div>
          <div class="stat-value">${accuracyPct}%</div>
        </div>
        <div class="stat">
          <div class="stat-label">Max Combo</div>
          <div class="stat-value">${rhythmGameState.maxCombo}x</div>
        </div>
      </div>
      <p class="result-detail">${rhythmGameState.hitCount}/${rhythmGameState.notes.length} notes hit correctly</p>
      <div class="result-buttons">
        <button class="btn secondary" id="retry">🔄 Retry Game</button>
        <button class="btn" id="done">Continue Learning</button>
      </div>
    </section>`;

  $('#retry').onclick = () => showTempoSelect();
  $('#done').onclick = () => finishLesson();
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
      <div class="song-header">
        <div class="song-title-large">${song.icon} ${song.name}</div>
        <div class="song-info-line">
          <span class="info-badge" style="--c:var(--${song.difficulty === 'Easy' ? 'green' : song.difficulty === 'Medium' ? 'orange' : 'red'})">
            ${song.difficulty}
          </span>
          <span class="info-detail">🎼 ${song.key}</span>
          <span class="info-detail">♪ ${song.bpm} BPM</span>
        </div>
        <p class="song-description">${song.description}</p>
      </div>

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

      <div class="notation-tips">
        <p>✨ <strong>Tips:</strong> Click any note to hear it individually. Watch the colors!</p>
      </div>

      <div class="notation-controls">
        <button class="btn secondary" id="play-all">▶ Listen to full song</button>
        <button class="btn" id="start-lesson">Begin learning →</button>
      </div>
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

  const song = SONGS[q.songId];
  const playedNotes = q.playedNotes;

  // Map western notes to Indian classical notation
  const indianNotation = {
    'C': 'Sa', 'D': 'Re', 'E': 'Ga', 'F': 'Ma', 'G': 'Pa', 'A': 'Dha', 'B': 'Ni', 'C5': 'Sa'
  };

  return `
    <div class="song-sheet-improved">
      <div class="notation-container">
        <div class="notation-header">
          <h3>${song.name}</h3>
          <p class="notation-hint">Click any note to hear it 🔊</p>
        </div>

        <div class="notation-table">
          <div class="notation-row">
            <div class="notation-label">Lyrics:</div>
            <div class="notation-content">
              ${playedNotes.map((note, i) => `
                <div class="notation-cell lyric-cell">
                  ${song.lyrics[i] || ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="notation-row">
            <div class="notation-label">Western:</div>
            <div class="notation-content">
              ${playedNotes.map((note, i) => `
                <div class="notation-cell western-cell" data-note="${note}" title="Click to play">
                  <strong>${note[0]}</strong>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="notation-row">
            <div class="notation-label">Indian:</div>
            <div class="notation-content">
              ${playedNotes.map((note, i) => `
                <div class="notation-cell indian-cell">
                  <em>${indianNotation[note] || note}</em>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
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
  let dailyBonus = 0;
  let unlocked = [];
  if (passed) {
    const firstTime = !state.done[lesson.id];
    const full = correct * 10 + 20 + (perfect ? 20 : 0);
    xpGained = firstTime ? full : 5;

    // Daily challenge bonus
    if (state.dailyChallenge === lesson.id && !state.dailyChallengeDone) {
      dailyBonus = 50;
      state.dailyChallengeDone = true;
      state.dailyChallengeCount = (state.dailyChallengeCount || 0) + 1;
    }

    state.done[lesson.id] = Math.max(state.done[lesson.id] || 0, stars);
    state.xp += xpGained + dailyBonus;
    touchStreak();
    unlocked = checkBadges();
    saveState();
    playCorrect();
  }
  updateStats();

  const dailyBonusText = dailyBonus > 0 ? `<p class="daily-bonus">🎯 Daily Challenge Complete! +${dailyBonus} XP bonus</p>` : '';
  app.innerHTML = `
    <section class="results">
      <div class="big">${passed ? '🏆' : '💔'}</div>
      <h2>${passed ? 'Lesson complete!' : 'Out of hearts'}</h2>
      <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <p>${correct}/${QUESTIONS_PER_LESSON} correct · +${xpGained + dailyBonus} XP</p>
      ${dailyBonusText}
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
        <h2>${ICONS[u.lessons[0]?.kind] || '📚'} Unit ${ui + 1}: ${u.title}</h2>
        <p>${u.desc}</p>
      </div>`;

    // Check if this is a song unit
    if (u.lessons[0]?.kind === 'song') {
      html += '<div class="songs-grid">';
      u.lessons.forEach((l) => {
        const song = SONGS[l.song];
        const done = state.done[l.id];
        const stars = done || 0;
        const difficulty = song.difficulty || 'Medium';
        const diffColor = difficulty === 'Easy' ? 'var(--green)' : difficulty === 'Medium' ? 'var(--orange)' : 'var(--red)';

        html += `
          <div class="song-card ${done ? 'completed' : ''}" data-id="${l.id}">
            <div class="song-icon">${song.icon}</div>
            <div class="song-content">
              <h3>${song.name}</h3>
              <p class="song-desc">${song.description}</p>
              <div class="song-meta">
                <span class="meta-item">🎵 ${song.noteCount} notes</span>
                <span class="meta-item">🎼 ${song.key}</span>
                <span class="meta-item">♪ ${song.bpm} BPM</span>
              </div>
              <div class="song-difficulty" style="--diff:${diffColor}">
                ${difficulty}
              </div>
            </div>
            <div class="song-progress">
              ${done ? `<div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>` : '<div class="not-started">Not Started</div>'}
            </div>
          </div>
        `;
      });
      html += '</div>';
    } else {
      html += '<div class="path">';
      u.lessons.forEach((l) => {
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
    }
  });

  app.innerHTML = `<h1 class="page-title">Your Learning Path</h1><p class="muted">Complete lessons to earn XP and unlock badges!</p>${html}`;

  // Regular lesson nodes
  document.querySelectorAll('.node:not(.locked)').forEach((btn) => {
    btn.onclick = () => startLesson(findLesson(btn.dataset.id));
  });

  // Song cards
  document.querySelectorAll('.song-card').forEach((card) => {
    card.onclick = () => startLesson(findLesson(card.dataset.id));
  });
}

let pianoOctave = 0;
function renderPiano() {
  app.innerHTML = `
    <h1 class="page-title">🎹 Piano Keyboard</h1>

    <div class="piano-header">
      <div class="instrument-selector">
        <label>Instrument:</label>
        <div class="instrument-buttons">
          ${Object.entries(INSTRUMENTS).map(([id, inst]) =>
            `<button class="instrument-btn ${currentInstrument === id ? 'active' : ''}" data-inst="${id}">${inst.name}</button>`
          ).join('')}
        </div>
      </div>
    </div>

    <p class="piano-note">🎵 Tap any key to play • 3-octave range • Play songs!</p>

    <div class="full-keyboard-container">
      <div class="keyboard-wrapper">
        <div class="full-keyboard">
          ${PIANO_KEYS.map((n, idx) => {
            const baseNote = n[0];
            const octaveNum = parseInt(n.slice(1)) || 4;
            const isC = baseNote === 'C' && idx > 0;
            const octaveLabel = isC ? `<div class="octave-label">Octave ${octaveNum}</div>` : '';
            return octaveLabel + `
              <button class="full-key" data-n="${n}" style="--k:${NOTE_COLORS[baseNote]}" title="${n}">
                <span class="key-label">${baseNote}<sub>${octaveNum}</sub></span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="scale-reference">
      <div class="scale-info">
        <h3>📊 Available Range</h3>
        <p class="range-text">3 Octaves: C3 to C6 (22 keys)</p>
        <div class="scale-notes">
          ${NOTES.map(n =>
            `<span class="scale-note-ref" style="--k:${NOTE_COLORS[n]}">${n}</span>`
          ).join('')}
        </div>
      </div>
    </div>

    <div class="piano-controls">
      <button class="btn secondary" id="scale">▶ Play Full Scale (C4)</button>
      <button class="btn secondary" id="arpeggio">▶ Play Chord</button>
      <button class="btn secondary" id="tune">🎵 Tuning (A)</button>
    </div>

    <div class="tips-section">
      <h3>💡 Tips</h3>
      <ul>
        <li>Try different <strong>instruments</strong> for unique sounds</li>
        <li>Scroll left/right to see all notes</li>
        <li>Experiment with <strong>high notes</strong> (octave 5-6)</li>
        <li>Learn melodies from your <strong>lessons</strong>!</li>
      </ul>
    </div>
  `;

  // Instrument selector
  document.querySelectorAll('.instrument-btn').forEach((btn) => {
    btn.onclick = () => {
      currentInstrument = btn.dataset.inst;
      document.querySelectorAll('.instrument-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });

  // Piano keys
  document.querySelectorAll('.full-key').forEach((el) => {
    el.addEventListener('pointerdown', () => {
      playNote(el.dataset.n, 0, currentInstrument);
      el.classList.add('lit');
      setTimeout(() => el.classList.remove('lit'), 150);
    });
  });

  // Control buttons
  $('#scale').onclick = () => playSequence(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], 0.3);
  $('#arpeggio').onclick = () => playSequence(['C4', 'E4', 'G4', 'C5'], 0.4);
  $('#tune').onclick = () => playNote('A4', 0, currentInstrument);
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

function renderDashboard() {
  generateDailyChallenge();
  const dailyLesson = findLesson(state.dailyChallenge);
  const totalLessons = countDone(state);
  const totalLessonsAvailable = ALL_LESSONS.length;
  const progressPct = Math.round((totalLessons / totalLessonsAvailable) * 100);

  // Calculate accuracy (average stars)
  const allStars = Object.values(state.done);
  const avgAccuracy = allStars.length > 0 ? Math.round((allStars.reduce((a, b) => a + b, 0) / (allStars.length * 3)) * 100) : 0;

  // Weak areas (lessons with 1 star or not done)
  const weakAreas = ALL_LESSONS.filter(l => !state.done[l.id] || state.done[l.id] < 2).slice(0, 3);

  app.innerHTML = `
    <h1 class="page-title">Your Progress</h1>

    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-value">${totalLessons}</div>
        <div class="stat-label">Lessons Done</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${state.xp}</div>
        <div class="stat-label">Total XP</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${state.streak}</div>
        <div class="stat-label">Day Streak 🔥</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${avgAccuracy}%</div>
        <div class="stat-label">Accuracy</div>
      </div>
    </div>

    <div class="dashboard-section">
      <h3>📈 Overall Progress</h3>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progressPct}%"></div>
      </div>
      <p class="progress-text">${totalLessons}/${totalLessonsAvailable} lessons completed (${progressPct}%)</p>
    </div>

    <div class="dashboard-section">
      <h3>🎯 Daily Challenge</h3>
      ${dailyLesson ? `
        <div class="daily-challenge-card ${state.dailyChallengeDone ? 'completed' : ''}">
          <div class="challenge-status">${state.dailyChallengeDone ? '✅ Done' : '📌 Today'}</div>
          <div class="challenge-content">
            <p class="challenge-title">${dailyLesson.title}</p>
            <p class="challenge-reward">${state.dailyChallengeDone ? '+ 50 XP earned' : '+ 50 XP bonus'}</p>
          </div>
        </div>
      ` : ''}
    </div>

    <div class="dashboard-section">
      <h3>📚 Progress by Unit</h3>
      ${UNITS.map(u => {
        const unitLessons = u.lessons.filter(l => !!state.done[l.id]);
        const unitProgress = Math.round((unitLessons.length / u.lessons.length) * 100);
        return `
          <div class="unit-progress">
            <div class="unit-name">${u.title}</div>
            <div class="unit-bar"><div style="width: ${unitProgress}%"></div></div>
            <div class="unit-pct">${unitLessons.length}/${u.lessons.length}</div>
          </div>
        `;
      }).join('')}
    </div>

    ${weakAreas.length > 0 ? `
      <div class="dashboard-section">
        <h3>💪 Areas to Practice</h3>
        ${weakAreas.map(l => `
          <div class="weak-area">
            <span>${l.title}</span>
            <span class="weak-status">${state.done[l.id] ? '1 ⭐' : 'Not started'}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="dashboard-section muted">
      <p>Last activity: ${state.lastDay || 'Never'}</p>
    </div>
  `;
}

// ---------- Navigation ----------
function go(tab) {
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'learn') renderLearn();
  if (tab === 'piano') renderPiano();
  if (tab === 'dashboard') renderDashboard();
  if (tab === 'badges') renderBadges();
  window.scrollTo(0, 0);
}

document.querySelectorAll('.tabbar button').forEach((btn) => {
  btn.onclick = () => go(btn.dataset.tab);
});

// Click handler for notation cells (song sheet)
document.addEventListener('click', (e) => {
  if (e.target.closest('.western-cell')) {
    const cell = e.target.closest('.western-cell');
    const note = cell.dataset.note;
    if (note) playNote(note, 0, currentInstrument);
  }
});

updateStats();
go('learn');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
