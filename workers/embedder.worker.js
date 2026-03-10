const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../backend/.env"),
});

const { Worker } = require("bullmq");
const connection = require("./src/lib/redis");
const supabase = require("../backend/src/lib/supabase");
const generateEmbedding = require("../backend/src/modules/ai/embedder");

console.log("🚀 Embedding Worker Started");

const worker = new Worker(
  "generate-embeddings",
  async (job) => {
    const { id, chunk } = job.data;

    const embedding = await generateEmbedding(chunk);

    await supabase.from("code_chunks").update({ embedding }).eq("id", id);

    console.log("Embedding stored:", id);
  },
  { connection },
);
