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
