import { setStatus, showError } from './mobile.js?v=20261114-iphone-1';

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
    setStatus('Đang tải dữ liệu game. Lần đầu có thể mất vài phút…');
    await import('./nostalgist.js?v=20261114-iphone-1');
  }
} catch (error) {
  console.error('Game startup failed', error);
  showError(['isolation', 'unsupported'].includes(error.message)
    ? 'Hãy mở link trực tiếp bằng Safari và cập nhật iOS nếu cần. Trình duyệt trong Zalo/Facebook có thể không chạy được game.'
    : 'Chưa tải được game. Hãy kiểm tra mạng, đóng bớt tab rồi bấm Thử lại. Trên iPhone, mở link trực tiếp bằng Safari.');
}
