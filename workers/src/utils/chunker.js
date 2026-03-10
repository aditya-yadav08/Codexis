function chunkCode(code, size = 20) {
  const lines = code.split("\n");

  const chunks = [];

  for (let i = 0; i < lines.length; i += size) {
    const chunkLines = lines.slice(i, i + size);

    chunks.push({
      chunk: chunkLines.join("\n"),
      start_line: i + 1,
      end_line: i + chunkLines.length,
    });
  }

  return chunks;
}

module.exports = chunkCode;
