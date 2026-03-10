const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const supabase = require("../src/lib/supabase");
const generateEmbedding = require("../src/modules/ai/embedder");

async function backfill() {
  console.log("Fetching rows without embeddings...");

  const { data: rows, error } = await supabase
    .from("code_chunks")
    .select("id, chunk")
    .is("embedding", null)
    .limit(500);

  if (error) throw error;

  console.log(`Rows to process: ${rows.length}`);

  for (const row of rows) {
    const embedding = await generateEmbedding(row.chunk);

    await supabase.from("code_chunks").update({ embedding }).eq("id", row.id);

    console.log("Embedding stored:", row.id);
  }

  console.log("Backfill complete.");
}

backfill();
