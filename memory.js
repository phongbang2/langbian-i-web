// iPad Safari can advertise a desktop Mac user agent.
export function isAppleMobile(device = navigator) {
  return /iPhone|iPad|iPod/.test(device.userAgent || '') ||
    (/Mac/.test(device.platform || device.userAgent || '') && device.maxTouchPoints > 1);
}

export let gameMemory = {};

export function reserveGameMemory(device = navigator) {
  if (!isAppleMobile(device) || gameMemory.wasmMemory) return gameMemory;
  // The existing WASM binary imports a minimum of 2048 pages (128 MiB).
  // Keep that minimum, but avoid Safari reserving the desktop 2 GiB maximum.
  // Allocate before downloading/decoding the large game and core assets.
  const INITIAL_MEMORY = 128 * 1024 * 1024;
  const MAXIMUM_MEMORY = 512 * 1024 * 1024;
  const wasmMemory = new WebAssembly.Memory({
    initial: INITIAL_MEMORY / 65536,
    maximum: MAXIMUM_MEMORY / 65536,
    shared: true,
  });
  gameMemory = { wasmMemory, INITIAL_MEMORY, MAXIMUM_MEMORY };
  return gameMemory;
}
