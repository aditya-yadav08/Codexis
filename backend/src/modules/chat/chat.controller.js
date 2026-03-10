const generateEmbedding = require("../ai/embedder");
const supabase = require("../../lib/supabase");

exports.retrieveContext = async (request, reply) => {
  try {
    const { question } = request.body;

    if (!question) {
      return reply.code(400).send({
        error: "Question is required",
      });
    }

    console.log("Question:", question);

    // 1️⃣ Generate question embedding
    const embedding = await generateEmbedding(question);

    // 2️⃣ Vector search in Supabase
    const { data, error } = await supabase.rpc("match_code_chunks", {
      query_embedding: embedding,
      match_count: 5,
    });

    if (error) throw error;

    console.log("Relevant chunks:", data.length);

    // 3️⃣ Build context
    const context = data.map((chunk) => chunk.chunk).join("\n\n");

    return {
      context,
      chunks: data,
    };
  } catch (error) {
    console.error(error);

    return reply.code(500).send({
      error: error.message,
    });
  }
};
