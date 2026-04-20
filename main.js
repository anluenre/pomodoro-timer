'use strict';

/* ── Image manifest ──────────────────────────── */
const IMG_BASE = "/images/";

const IMAGES = [
  "Image 1 - Tomato.webp",
  "Image 2 - Fig.webp",
  "Image 3 - Broccoli.webp",
  "Image 4 - cherries.webp",
  "Image 5 - egg.webp",
  "Image 6 - huichol.webp",
  "Image 7 - oyster.webp",
  "Image 8 - chanterelle.webp",
  "Image 9 - guac.webp",
  "Image 10 - blueberry.webp",
  "Image 11 - blackberry.webp",
  "Image 12 - sardine.webp",
  "Image 13 - habanero.webp",
  "Image 14 - banana.webp",
  "Image 15 - Orange.webp",
  "Image 16 - cheese.webp",
  "Image 17 - pen.webp",
  "Image 18 - coffee.webp",
  "Image 19 - Ice cream.webp",
  "Image 20 - matcha latte.webp",
  "Image 21 - Paint.webp",
  "Image 22 - croissant.webp",
  "Imsge 23 - candy.webp",
];

const SOUND_URL = "/sounds/timer-finished.mp3";

/* ── State ───────────────────────────────────── */
let presets     = [5, 10, 20, 30];
let selectedIdx = 0;
let secsLeft    = presets[0] * 60;
/** @type {'idle'|'running'|'paused'|'finished'} */
let timerState  = 'idle';
let intervalId  = null;
let startedAt   = 0;
let startedWith = 0;
let curImgIdx   = -1;
let alarmVol    = 0.8;
let shuffledQueue = [];
let queueIndex = 0;

const alarm = new Audio(SOUND_URL);
alarm.preload = 'auto';
alarm.addEventListener('ended', resetTimer);

/* ────── alarm activation ─────────────────────────────────────*/
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  const previousVolume = alarmVol;

  alarm.volume = 0;
  alarm.currentTime = 0;

  alarm.play()
    .then(() => {
      alarm.pause();
      alarm.currentTime = 0;
      alarm.volume = previousVolume;
      audioUnlocked = true;
    })
    .catch(() => {
      alarm.volume = previousVolume;
    });
}

/* ── DOM refs ────────────────────────────────── */
const $ = id => document.getElementById(id);

const card         = $('card');
const heroImg      = $('heroImg');
const timerEl      = $('timer');
const settingsBtn  = $('settingsBtn');
const durToggle    = $('durToggle');
const durLabel     = $('durLabel');
const durMenu      = $('durMenu');
const overlay      = $('overlay');
const volSlider    = $('volSlider');
const presetInputs = document.querySelectorAll('.preset-input');
const durOpts      = document.querySelectorAll('.dur-opt');
const shuffleBtns  = document.querySelectorAll('.btn-shuffle');
const actionBtns   = document.querySelectorAll('.btn-action');

/* ── Utilities ───────────────────────────────── */
const pad = n => String(n).padStart(2, '0');
const fmtTime = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

function pickOther(len, notIdx) {
  if (len <= 1) return 0;
  let i;
  do {
    i = Math.floor(Math.random() * len);
  } while (i === notIdx);
  return i;
}

function reshuffleImages() {
  shuffledQueue = [...IMAGES];

  for (let i = shuffledQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
  }

  queueIndex = 0;
}

/* ── Image ───────────────────────────────────── */
function showImage(idx) {
  const nextSrc = IMG_BASE + encodeURIComponent(IMAGES[idx]);

  heroImg.style.opacity = '0';

  setTimeout(() => {
    heroImg.src = nextSrc;
    heroImg.style.opacity = '1';
  }, 180);

  curImgIdx = idx;
}

function shuffle() {
  if (shuffledQueue.length === 0 || queueIndex >= shuffledQueue.length) {
    reshuffleImages();
  }

  const nextImage = shuffledQueue[queueIndex];
  queueIndex++;

  const idx = IMAGES.indexOf(nextImage);
  showImage(idx);
}

/* ── Timer ───────────────────────────────────── */
function renderTimer() {
  timerEl.textContent = fmtTime(secsLeft);
}

function setCardState(s) {
  timerState = s;
  card.dataset.state = s;
  const labels = {
    idle: 'Start',
    running: 'Pause',
    paused: 'Resume',
    finished: 'Start',
  };
  actionBtns.forEach(btn => {
    btn.textContent = labels[s];
  });
}

function tick() {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  secsLeft = Math.max(0, startedWith - elapsed);
  renderTimer();

  if (secsLeft === 0) {
    clearInterval(intervalId);
    intervalId = null;
    setCardState('finished');
    playAlarm();
  }
}

function startTimer() {
  if (timerState === 'idle') {
    secsLeft = presets[selectedIdx] * 60;
    renderTimer();
  }

  startedAt = Date.now();
  startedWith = secsLeft;
  setCardState('running');
  intervalId = setInterval(tick, 250);
}

function pauseTimer() {
  clearInterval(intervalId);
  intervalId = null;
  setCardState('paused');
}

function resetTimer() {
  clearInterval(intervalId);
  intervalId = null;

  secsLeft = presets[selectedIdx] * 60;
  renderTimer();

  alarm.pause();
  alarm.currentTime = 0;

  setCardState('idle');
}

function handleAction() {
  if (timerState === 'running') {
    pauseTimer();
  } else {
    startTimer();
  }
}

function playAlarm() {
  alarm.pause();
  alarm.currentTime = 0;
  alarm.volume = alarmVol;
  alarm.play().catch(() => {});
}

/* ── Duration selector ───────────────────────── */
function refreshDurUI() {
  durLabel.textContent = `${presets[selectedIdx]}m`;
  durOpts.forEach((opt, i) => {
    opt.textContent = `${presets[i]}m`;
    opt.classList.toggle('active', i === selectedIdx);
  });
}

function selectPreset(idx) {
  selectedIdx = idx;

  clearInterval(intervalId);
  intervalId = null;

  alarm.pause();
  alarm.currentTime = 0;

  secsLeft = presets[idx] * 60;
  renderTimer();

  setCardState('idle');
  refreshDurUI();
  closeDurMenu();
}

function openDurMenu() {
  durMenu.classList.add('open');
  durToggle.setAttribute('aria-expanded', 'true');
}

function closeDurMenu() {
  durMenu.classList.remove('open');
  durToggle.setAttribute('aria-expanded', 'false');
}

/* ── Settings panel ──────────────────────────── */
function openSettings() {
  presetInputs.forEach((input, i) => {
    input.value = presets[i];
  });

  volSlider.value = String(alarmVol * 100);
  volSlider.style.setProperty('--value', volSlider.value + '%');

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeSettings() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

/* ── Bootstrap ───────────────────────────────── */
function init() {
  reshuffleImages();
  shuffle();
  renderTimer();
  refreshDurUI();
  setCardState('idle');

  shuffleBtns.forEach(btn =>
  btn.addEventListener('click', () => {
    unlockAudio();
    shuffle();
  })
);

actionBtns.forEach(btn =>
  btn.addEventListener('click', () => {
    unlockAudio();
    handleAction();
  })
);

  settingsBtn.addEventListener('click', () => {
  unlockAudio();
  openSettings();
});
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeSettings();
  });
  $('doneBtn').addEventListener('click', closeSettings);

  presetInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      const v = Math.max(1, Math.min(99, parseInt(input.value, 10) || 1));
      input.value = v;
      presets[i] = v;
      refreshDurUI();

      if (i === selectedIdx && (timerState === 'idle' || timerState === 'finished')) {
        secsLeft = v * 60;
        renderTimer();
      }
    });
  });

  durToggle.addEventListener('click', e => {
    e.stopPropagation();
    if (durMenu.classList.contains('open')) {
      closeDurMenu();
    } else {
      openDurMenu();
    }
  });

  durOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      selectPreset(parseInt(opt.dataset.idx, 10));
    });
  });

  document.addEventListener('click', e => {
    if (!durMenu.contains(e.target) && !durToggle.contains(e.target)) {
      closeDurMenu();
    }
  });

  volSlider.addEventListener('input', () => {
    alarmVol = volSlider.value / 100;
    alarm.volume = alarmVol;

    const value = volSlider.value;
    volSlider.style.setProperty('--value', value + '%');
  });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      handleAction();
    }
    if (e.code === 'Escape') {
      closeSettings();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);