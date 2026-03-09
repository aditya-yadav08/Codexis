function chunkCode(code, size = 800) {
  const chunks = [];

  for (let i = 0; i < code.length; i += size) {
    chunks.push(code.slice(i, i + size));
  }

  return chunks;
}

module.exports = chunkCode;