const { pipeline } = require("@xenova/transformers");

let embedder;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

async function generateEmbedding(text) {
  const model = await getEmbedder();

  const result = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(result.data);
}

module.exports = generateEmbedding;