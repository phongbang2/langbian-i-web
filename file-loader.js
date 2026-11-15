// The public mirror is pinned to the commit containing these exact asset bytes.
const assetMirror = 'https://raw.githubusercontent.com/phongbang2/langbian-i-web/dd908d5fdbd629bb09bfc3e48378bd997c4490ed/';

export async function downloadAsset(path, expectedSize) {
  const failures = [];
  for (const [source, url] of [['GitHub Pages', './' + path], ['GitHub', assetMirror + path]]) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const blob = await response.blob();
      if (blob.size !== expectedSize) {
        throw new Error(blob.size + ' / ' + expectedSize + ' bytes');
      }
      return blob;
    } catch (error) {
      failures.push(source + ': ' + (controller.signal.aborted ? 'timeout' : error.message));
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(path + ' — ' + failures.join(' | '));
}

// Write large assets once, without a temporary file or full-size readback.
// WasmFS copies JS writes into a temporary WASM buffer; keep that buffer small.
export async function writeBlobToFS(fs, path, blob) {
  const stream = fs.open(path, 'w');
  try {
    // Grow the file to its final size once, avoiding repeated vector reallocations.
    if (blob.size && fs.write(stream, new Uint8Array(1), 0, 1, blob.size - 1) !== 1) {
      throw new Error('Cannot reserve game file: ' + path);
    }
    const chunkSize = 1024 * 1024;
    for (let offset = 0; offset < blob.size; offset += chunkSize) {
      const bytes = new Uint8Array(await blob.slice(offset, offset + chunkSize).arrayBuffer());
      if (fs.write(stream, bytes, 0, bytes.length, offset) !== bytes.length) {
        throw new Error('Incomplete game file write: ' + path);
      }
    }
  } finally {
    fs.close(stream);
  }
}
