/* ============================================================
   CONFIG — change these values to customize
============================================================ */

// BACKEND HOOK: Move to a server-side environment variable.
// Never expose real passwords in client JS for production use.
const CORRECT_PASSWORD = 'FXWc8bG0&xmsNm(n=cAG1F#%&=r$WVP9*CS2%zB^r?E(#XD^yFR&9';

// Path to the gated file.
// BACKEND HOOK: Replace with a server-generated signed URL (e.g. AWS S3
// presigned URL or a Netlify Function that returns a one-time token).
const FILE_PATH = 'files/secret.txt';
const FILE_NAME = 'secret.txt';

/* ============================================================
   PUZZLE BANK — 8 types, add more entries freely
============================================================ */
const PUZZLE_BANK = [
  // 1. Math
  { type: 'Math Problem',    question: 'What is 15 × 3?',                          answer: '45'       },
  { type: 'Math Problem',    question: 'What is 256 ÷ 16?',                         answer: '16'       },
  { type: 'Math Problem',    question: 'What is 7² + 1?',                           answer: '50'       },
  { type: 'Math Problem',    question: 'What is 8 × 8 − 4?',                        answer: '60'       },

  // 2. Word Scramble
  { type: 'Word Scramble',   question: 'Unscramble: "act" (3-letter animal)',       answer: 'cat'      },
  { type: 'Word Scramble',   question: 'Unscramble: "elapp"',                       answer: 'apple'    },
  { type: 'Word Scramble',   question: 'Unscramble: "rcilce"',                      answer: 'circle'   },
  { type: 'Word Scramble',   question: 'Unscramble: "tgnhi"',                       answer: 'night'    },

  // 3. Number Sequence
  { type: 'Number Sequence', question: 'What comes next? 1, 3, 5, 7, ?',           answer: '9'        },
  { type: 'Number Sequence', question: 'What comes next? 2, 4, 8, 16, ?',          answer: '32'       },
  { type: 'Number Sequence', question: 'What comes next? 0, 1, 1, 2, 3, 5, ?',     answer: '8'        },
  { type: 'Number Sequence', question: 'What comes next? 100, 90, 81, 73, ?',      answer: '66'       },

  // 4. Riddle
  { type: 'Riddle',          question: 'What has keys but no locks?',               answer: 'piano'    },
  { type: 'Riddle',          question: 'I have hands but cannot clap. What am I?',  answer: 'clock'    },
  { type: 'Riddle',          question: 'What gets wetter the more it dries?',       answer: 'towel'    },
  { type: 'Riddle',          question: 'I am always in front of you but cannot be seen. What am I?', answer: 'future' },

  // 5. Reverse Word
  { type: 'Reverse Word',    question: 'Spell "pots" backwards.',                   answer: 'stop'     },
  { type: 'Reverse Word',    question: 'Spell "evil" backwards.',                   answer: 'live'     },
  { type: 'Reverse Word',    question: 'Spell "desserts" backwards.',               answer: 'stressed' },
  { type: 'Reverse Word',    question: 'Spell "noon" backwards.',                   answer: 'noon'     },

  // 6. Missing Letter
  { type: 'Missing Letter',  question: 'W _ T E R  (fill the blank)',               answer: 'a'        },
  { type: 'Missing Letter',  question: 'P _ Z Z L E  (fill the blank)',             answer: 'u'        },
  { type: 'Missing Letter',  question: 'S _ C R E T  (fill the blank)',             answer: 'e'        },
  { type: 'Missing Letter',  question: 'B _ T T L E  (fill the blank)',             answer: 'a'        },

  // 7. Roman Numerals
  { type: 'Roman Numerals',  question: 'What number is X?',                         answer: '10'       },
  { type: 'Roman Numerals',  question: 'What number is XIV?',                       answer: '14'       },
  { type: 'Roman Numerals',  question: 'What number is XL?',                        answer: '40'       },
  { type: 'Roman Numerals',  question: 'What number is LXIX?',                      answer: '69'       },

  // 8. Color Code
  { type: 'Color Code',      question: 'What is the hex code for pure red?',        answer: '#ff0000'  },
  { type: 'Color Code',      question: 'What is the hex code for pure blue?',       answer: '#0000ff'  },
  { type: 'Color Code',      question: 'What is the hex code for pure green?',      answer: '#00ff00'  },
  { type: 'Color Code',      question: 'What is the hex code for pure white?',      answer: '#ffffff'  },
];

/* ============================================================
   STATE
============================================================ */
let currentPuzzle = null;

/* ============================================================
   STEP NAVIGATION
============================================================ */
function showStep(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  const map = { 'step-password': 1, 'step-puzzle': 2, 'step-download': 3 };
  const active = map[id];

  for (let i = 1; i <= 3; i++) {
    const dot  = document.getElementById('dot' + i);
    const line = document.getElementById('line' + i);
    dot.parentElement.classList.remove('active', 'done');
    if (line) line.classList.remove('done');

    if (i < active)  { dot.parentElement.classList.add('done'); dot.textContent = '✓'; }
    if (i === active) { dot.parentElement.classList.add('active'); dot.textContent = i; }
    if (i > active)   { dot.textContent = i; }

    if (line && i < active) line.classList.add('done');
  }
}

/* ============================================================
   STEP 1 — PASSWORD
   BACKEND HOOK: Replace the check below with:
     const res = await fetch('/api/verify-password', {
       method: 'POST',
       body: JSON.stringify({ password: val })
     });
     if ((await res.json()).ok) { ... }
============================================================ */
function checkPassword() {
  const val   = document.getElementById('passwordInput').value;
  const input = document.getElementById('passwordInput');
  const msg   = document.getElementById('passMsg');

  if (!val.trim()) {
    showMsg(msg, 'error', 'Please enter the access password.');
    return;
  }

  // ── CLIENT-SIDE CHECK (swap for server call in production) ──
  if (val === CORRECT_PASSWORD) {
    setInputState(input, 'ok');
    showMsg(msg, 'success', 'Password accepted — loading your challenge…');
    setTimeout(() => { loadPuzzle(); showStep('step-puzzle'); }, 650);
  } else {
    setInputState(input, 'err');
    showMsg(msg, 'error', 'Incorrect password. Try again.');
    shake(input);
  }
}

/* ============================================================
   STEP 2 — PUZZLE
   BACKEND HOOK: For each type you can validate server-side:
     const res = await fetch('/api/verify-puzzle', {
       method: 'POST',
       body: JSON.stringify({ puzzleId: currentPuzzle.id, answer: val })
     });
============================================================ */
function loadPuzzle() {
  currentPuzzle = PUZZLE_BANK[Math.floor(Math.random() * PUZZLE_BANK.length)];
  document.getElementById('puzzleType').textContent     = currentPuzzle.type.toUpperCase();
  document.getElementById('puzzleQuestion').textContent = currentPuzzle.question;
  const input = document.getElementById('puzzleInput');
  input.value = '';
  input.placeholder = currentPuzzle.type === 'Color Code' ? '#rrggbb' : 'Your answer…';
  setInputState(input, '');
  clearMsg(document.getElementById('puzzleMsg'));
}

function checkPuzzle() {
  const raw   = document.getElementById('puzzleInput').value.trim();
  const val   = raw.toLowerCase();
  const input = document.getElementById('puzzleInput');
  const msg   = document.getElementById('puzzleMsg');

  if (!raw) {
    showMsg(msg, 'error', 'Please enter an answer.');
    return;
  }

  // ── CLIENT-SIDE CHECK (swap for server call in production) ──
  const expected = currentPuzzle.answer.toLowerCase();
  if (val === expected) {
    setInputState(input, 'ok');
    showMsg(msg, 'success', 'Correct! Unlocking your file…');
    setTimeout(() => showStep('step-download'), 700);
  } else {
    setInputState(input, 'err');
    showMsg(msg, 'error', 'Not quite — check your answer and try again.');
    shake(input);
  }
}

/* ============================================================
   HELPERS
============================================================ */
function showMsg(el, type, text) {
  el.className = 'msg ' + type;
  el.textContent = text;
}

function clearMsg(el) {
  el.className = 'msg';
  el.textContent = '';
}

function setInputState(input, state) {
  input.classList.remove('ok', 'err');
  if (state) input.classList.add(state);
}

function shake(el) {
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-7px)' },
    { transform: 'translateX(7px)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' },
  ], { duration: 380, easing: 'ease-out' });
}

/* ============================================================
   KEYBOARD SHORTCUTS
============================================================ */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const active = document.querySelector('.section.active');
  if (!active) return;
  if (active.id === 'step-password') checkPassword();
  if (active.id === 'step-puzzle')   checkPuzzle();
});
