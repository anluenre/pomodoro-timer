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
let presets     = [5, 10, 20, 30];   // minutes per preset slot
let selectedIdx = 0;
let secsLeft    = presets[0] * 60;
/** @type {'idle'|'running'|'paused'|'finished'} */
let timerState  = 'idle';
let intervalId  = null;
let startedAt   = 0;
let startedWith = 0;
let curImgIdx   = -1;
let alarmVol    = 0.8;
let autoMute    = true;
let muteTimer   = null;

const alarm = new Audio(SOUND_URL);
alarm.preload = 'auto';

/* ── DOM refs ────────────────────────────────── */
const $ = id => document.getElementById(id);

const card            = $('card');
const heroImg         = $('heroImg');
const timerEl         = $('timer');
const settingsBtn     = $('settingsBtn');
const durToggle       = $('durToggle');
const durLabel        = $('durLabel');
const durMenu         = $('durMenu');
const overlay         = $('overlay');
const volSlider       = $('volSlider');
const autoMuteToggle  = $('autoMuteToggle');
const presetInputs    = document.querySelectorAll('.preset-input');
const durOpts         = document.querySelectorAll('.dur-opt');
const shuffleBtns     = document.querySelectorAll('.btn-shuffle');
const actionBtns      = document.querySelectorAll('.btn-action');

/* ── Utilities ───────────────────────────────── */
const pad     = n => String(n).padStart(2, '0');
const fmtTime = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

function pickOther(len, notIdx) {
  if (len <= 1) return 0;
  let i;
  do { i = Math.floor(Math.random() * len); } while (i === notIdx);
  return i;
}

/* ── Image ───────────────────────────────────── */
function showImage(idx) {
  heroImg.style.opacity = '0';
  heroImg.src = IMG_BASE + encodeURIComponent(IMAGES[idx]);
  heroImg.onload  = () => { heroImg.style.opacity = '1'; };
  heroImg.onerror = () => { heroImg.style.opacity = '0'; };
  curImgIdx = idx;
}

function shuffle() {
  showImage(pickOther(IMAGES.length, curImgIdx));
}

/* ── Timer ───────────────────────────────────── */
function renderTimer() {
  timerEl.textContent = fmtTime(secsLeft);
}

function setCardState(s) {
  timerState = s;
  card.dataset.state = s;
  const labels = { idle: 'Start', running: 'Pause', paused: 'Resume', finished: 'Start' };
  actionBtns.forEach(btn => { btn.textContent = labels[s]; });
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
  if (timerState === 'idle' || timerState === 'finished') {
    secsLeft = presets[selectedIdx] * 60;
    renderTimer();
  }
  startedAt   = Date.now();
  startedWith = secsLeft;
  setCardState('running');
  intervalId = setInterval(tick, 250);
}

function pauseTimer() {
  clearInterval(intervalId);
  intervalId = null;
  setCardState('paused');
}

function handleAction() {
  if (timerState === 'running') pauseTimer();
  else startTimer();
}

function playAlarm() {
  if (muteTimer) clearTimeout(muteTimer);
  alarm.volume      = alarmVol;
  alarm.currentTime = 0;
  alarm.play().catch(() => {});
  if (autoMute) {
    muteTimer = setTimeout(() => {
      alarm.pause();
      alarm.currentTime = 0;
    }, 5000);
  }
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
  if (timerState === 'idle' || timerState === 'finished') {
    secsLeft = presets[idx] * 60;
    renderTimer();
  }
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
  // Sync inputs with current state
  presetInputs.forEach((input, i) => { input.value = presets[i]; });
  volSlider.value = alarmVol * 100;
  autoMuteToggle.setAttribute('aria-checked', String(autoMute));
  autoMuteToggle.classList.toggle('on', autoMute);
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeSettings() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

/* ── Bootstrap ───────────────────────────────── */
function init() {
  shuffle();
  renderTimer();
  refreshDurUI();
  setCardState('idle');

  /* Action buttons (desktop + mobile) */
  shuffleBtns.forEach(btn => btn.addEventListener('click', shuffle));
  actionBtns .forEach(btn => btn.addEventListener('click', handleAction));

  /* Settings open/close */
  settingsBtn.addEventListener('click', openSettings);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSettings(); });
  $('doneBtn').addEventListener('click', closeSettings);

  /* Preset number inputs */
  presetInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      const v = Math.max(1, Math.min(99, parseInt(input.value) || 1));
      input.value = v;
      presets[i] = v;
      refreshDurUI();
      if (i === selectedIdx && (timerState === 'idle' || timerState === 'finished')) {
        secsLeft = v * 60;
        renderTimer();
      }
    });
  });

  /* Duration dropdown */
  durToggle.addEventListener('click', e => {
    e.stopPropagation();
    durMenu.classList.contains('open') ? closeDurMenu() : openDurMenu();
  });

  durOpts.forEach(opt =>
    opt.addEventListener('click', () => selectPreset(parseInt(opt.dataset.idx, 10)))
  );

  document.addEventListener('click', e => {
    if (!durMenu.contains(e.target) && !durToggle.contains(e.target)) closeDurMenu();
  });

  /* Volume */
  volSlider.addEventListener('input', () => {
    alarmVol     = volSlider.value / 100;
    alarm.volume = alarmVol;
  });

  /* Auto-mute toggle */
  function toggleAutoMute() {
    autoMute = !autoMute;
    autoMuteToggle.setAttribute('aria-checked', String(autoMute));
    autoMuteToggle.classList.toggle('on', autoMute);
  }

  autoMuteToggle.addEventListener('click', toggleAutoMute);
  autoMuteToggle.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAutoMute(); }
  });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space')  { e.preventDefault(); handleAction(); }
    if (e.code === 'Escape') closeSettings();
  });
}

document.addEventListener('DOMContentLoaded', init);
