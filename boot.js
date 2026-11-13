import { setStatus, showError } from './mobile.js?v=20261114-iphone-1';
import { reserveGameMemory } from './memory.js?v=20261114-ios-memory-1';

// Keep diagnostics on this device only; nothing is sent to a server.
const startup = window.langbianStartup = { stage: 'isolation', notes: [] };
const originalError = console.error.bind(console);
console.error = (...args) => {
  startup.notes.push(args.map(value => value instanceof Error ? value.name + ': ' + value.message : String(value)).join(' ').slice(0, 700));
  if (startup.notes.length > 6) startup.notes.shift();
  originalError(...args);
};

function describeError(error) {
  const code = (error?.name || 'Error') + ': ' + (error?.message || String(error));
  const details = document.createElement('details');
  details.id = 'startup-error-details';
  details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = 'Chi tiết lỗi — gửi lại phần này để được sửa';
  const text = document.createElement('pre');
  text.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;max-height:180px;overflow:auto;text-align:left;font-size:12px;user-select:text';
  text.textContent = ['Bản: ios-memory-1', 'Bước: ' + startup.stage, code, 'Bộ nhớ: ' + (startup.memory || 'mặc định'), 'Trình duyệt: ' + navigator.userAgent, ...startup.notes].join('\n');
  details.append(summary, text);
  document.querySelector('.loading-card').append(details);
}

const reloadKey = 'langbian-pages-isolation:' + location.pathname;
const storage = {
  get() { try { return sessionStorage.getItem(reloadKey); } catch { return null; } },
  set(value) { try { sessionStorage.setItem(reloadKey, value); } catch { /* Storage may be restricted. */ } },
  clear() { try { sessionStorage.removeItem(reloadKey); } catch { /* Keep the game usable. */ } },
};

async function enableIsolation() {
  if (window.crossOriginIsolated) { storage.clear(); return true; }
  if (!window.isSecureContext || !navigator.serviceWorker || storage.get()) {
    storage.clear();
    throw new Error('isolation');
  }
  setStatus('Đang chuẩn bị trình chạy. Trang sẽ tự tải lại một lần…');
  let timer;
  let changed;
  try {
    await Promise.race([
      (async () => {
        await navigator.serviceWorker.register('./coi-serviceworker.min.js');
        if (!navigator.serviceWorker.controller) {
          await new Promise(resolve => {
            changed = () => { if (navigator.serviceWorker.controller) resolve(); };
            navigator.serviceWorker.addEventListener('controllerchange', changed);
            changed();
          });
        }
      })(),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('isolation')), 20000); }),
    ]);
    storage.set('1');
    location.reload();
    return false;
  } finally {
    clearTimeout(timer);
    if (changed) navigator.serviceWorker.removeEventListener('controllerchange', changed);
  }
}

try {
  if (await enableIsolation()) {
    if (typeof WebAssembly === 'undefined' || typeof SharedArrayBuffer === 'undefined') throw new Error('unsupported');
    startup.stage = 'reserve-memory';
    const memory = reserveGameMemory();
    startup.memory = memory.wasmMemory ? '128 MiB ban đầu / tối đa 512 MiB' : '128 MiB ban đầu / tối đa 2048 MiB';
    startup.stage = 'import-launcher';
    setStatus('Đang tải dữ liệu game. Lần đầu có thể mất vài phút…');
    await import('./nostalgist.js?v=20261114-ios-memory-1');
  }
} catch (error) {
  console.error('Game startup failed', error);
  showError(['isolation', 'unsupported'].includes(error.message)
    ? 'Hãy mở link trực tiếp bằng Safari và cập nhật iOS nếu cần. Trình duyệt trong Zalo/Facebook có thể không chạy được game.'
    : /out of memory|memory access|allocation|failed to grow/i.test(error.message || '') || startup.stage === 'reserve-memory'
      ? 'Safari chưa cấp đủ bộ nhớ cho game. Hãy đóng các tab game, thoát hẳn Safari trong màn hình đa nhiệm, rồi mở lại link. Nếu vẫn lỗi, gửi phần Chi tiết lỗi bên dưới.'
      : 'Chưa tải được game. Hãy kiểm tra mạng, đóng bớt tab rồi bấm Thử lại. Trên iPhone, mở link trực tiếp bằng Safari.');
  describeError(error);
}
