const root = document.documentElement;
const stage = document.getElementById('stage');
const canvas = document.getElementById('nostalgist-canvas');
const startButton = document.getElementById('user-activation-prompt');
const overlay = document.getElementById('spinner-target');
const status = document.getElementById('load-status');
const controlsToggle = document.getElementById('toggle-controls');
const extraToggle = document.getElementById('toggle-extra');
const extraKeys = document.getElementById('extra-keys');
const guide = document.getElementById('guide');
const buttons = [...document.querySelectorAll('[data-game-button]')];
const pointers = new Map();
const pressedAt = new Map();
const releaseTimers = new Map();
let emulator;
let ready = false;
let pausedByVisibility = false;

export function setStatus(message) { status.textContent = message; }

export function showError(message) {
  releaseAll();
  ready = false;
  buttons.forEach(button => { button.disabled = true; });
  overlay.hidden = false;
  overlay.querySelectorAll('.spinner').forEach(spinner => spinner.remove());
  document.getElementById('progressbar-target').hidden = true;
  startButton.hidden = true;
  document.getElementById('retry-game').hidden = false;
  setStatus(message);
  root.dataset.gameState = 'error';
}

// An explicit tap works even on Safari versions without navigator.userActivation.
export function waitForStart() {
  document.getElementById('progressbar-target').hidden = true;
  startButton.disabled = false;
  startButton.textContent = 'Chơi LangBiAn I';
  root.dataset.gameState = 'ready';
  setStatus('Đã tải xong. Bấm nút bên dưới để vào game.');
  return new Promise(resolve => startButton.addEventListener('click', () => {
    startButton.disabled = true;
    setStatus('Đang mở game…');
    resolve();
  }, { once: true }));
}

export function attachGame(instance) {
  emulator = instance;
  ready = true;
  buttons.forEach(button => { button.disabled = false; });
  overlay.hidden = true;
  root.dataset.gameState = 'running';
  canvas.focus({ preventScroll: true });
  fitCanvas();
}

function isHeld(key) { return [...pointers.values()].some(button => button?.dataset.gameButton === key); }

function releaseKey(key) {
  clearTimeout(releaseTimers.get(key));
  releaseTimers.delete(key);
  pressedAt.delete(key);
  emulator?.pressUp({ button: key });
  buttons.filter(button => button.dataset.gameButton === key).forEach(button => button.classList.remove('is-pressed'));
}

function releasePointer(id, immediate = true) {
  const button = pointers.get(id);
  pointers.delete(id);
  if (!button) return;
  const key = button.dataset.gameButton;
  if (!isHeld(key)) {
    // A quick tap must survive at least one game frame on a slower phone.
    const delay = immediate ? 0 : Math.max(0, 80 - (performance.now() - pressedAt.get(key)));
    if (delay > 0) releaseTimers.set(key, setTimeout(() => releaseKey(key), delay));
    else releaseKey(key);
  }
}

export function releaseAll() {
  pointers.clear();
  for (const key of [...pressedAt.keys()]) releaseKey(key);
}

function pressPointer(id, button) {
  if (!ready || guide.open || button.disabled) return;
  const key = button.dataset.gameButton;
  const alreadyHeld = pressedAt.has(key);
  clearTimeout(releaseTimers.get(key));
  releaseTimers.delete(key);
  pointers.set(id, button);
  button.classList.add('is-pressed');
  if (!alreadyHeld) {
    pressedAt.set(key, performance.now());
    emulator.pressDown({ button: key });
  }
}

for (const button of buttons) {
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    event.stopPropagation();
    if (!ready || guide.open) return;
    canvas.focus({ preventScroll: true });
    button.setPointerCapture(event.pointerId);
    pressPointer(event.pointerId, button);
  });
  button.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId) || !button.closest('#dpad')) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('#dpad [data-game-button]');
    if (target === pointers.get(event.pointerId)) return;
    releasePointer(event.pointerId);
    pointers.set(event.pointerId, null);
    if (target) pressPointer(event.pointerId, target);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(name, event => {
      event.preventDefault();
      releasePointer(event.pointerId, name !== 'pointerup');
    });
  }
  button.addEventListener('contextmenu', event => event.preventDefault());
  // Also support VoiceOver/keyboard activation without duplicating a touch tap.
  button.addEventListener('click', event => {
    if (event.detail !== 0 || !ready || guide.open) return;
    const id = 'accessible-' + button.dataset.gameButton;
    pressPointer(id, button);
    setTimeout(() => releasePointer(id), 100);
  });
}

function setControls(visible) {
  releaseAll();
  root.classList.toggle('touch-controls-on', visible);
  controlsToggle.setAttribute('aria-pressed', String(visible));
  controlsToggle.textContent = visible ? 'Ẩn phím' : 'Hiện phím';
  extraToggle.hidden = !visible;
  extraKeys.hidden = true;
  extraToggle.setAttribute('aria-expanded', 'false');
  requestAnimationFrame(fitCanvas);
}
setControls(navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches);
controlsToggle.addEventListener('click', () => setControls(!root.classList.contains('touch-controls-on')));
extraToggle.addEventListener('click', () => {
  releaseAll();
  extraKeys.hidden = !extraKeys.hidden;
  extraToggle.setAttribute('aria-expanded', String(!extraKeys.hidden));
});
document.getElementById('open-guide').addEventListener('pointerdown', releaseAll);
document.getElementById('open-guide').addEventListener('click', () => {
  releaseAll();
  extraKeys.hidden = true;
  extraToggle.setAttribute('aria-expanded', 'false');
});
new MutationObserver(() => { if (guide.open) releaseAll(); }).observe(guide, { attributes: true, attributeFilter: ['open'] });
window.addEventListener('blur', releaseAll);
window.addEventListener('pagehide', releaseAll);
window.addEventListener('orientationchange', releaseAll);
document.addEventListener('visibilitychange', () => {
  releaseAll();
  if (!ready) return;
  if (document.hidden && emulator.getStatus() === 'running') {
    emulator.pause();
    pausedByVisibility = true;
  } else if (!document.hidden && pausedByVisibility) {
    emulator.resume();
    pausedByVisibility = false;
  }
});

function fitCanvas() {
  const width = Math.min(stage.clientWidth, stage.clientHeight * 4 / 3);
  canvas.style.setProperty('--game-width', width + 'px');
  canvas.style.setProperty('--game-height', width * 3 / 4 + 'px');
}
function updateViewport() {
  root.style.setProperty('--viewport-height', (window.visualViewport?.height ?? window.innerHeight) + 'px');
  fitCanvas();
}
new ResizeObserver(fitCanvas).observe(stage);
window.addEventListener('resize', updateViewport);
window.visualViewport?.addEventListener('resize', updateViewport);
updateViewport();
document.getElementById('retry-game').addEventListener('click', () => location.reload());
