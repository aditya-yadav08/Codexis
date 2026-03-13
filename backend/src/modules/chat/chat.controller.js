const embed = require("../ai/embedder");
const generateAnswer = require("../ai/llm");
const rewriteQuery = require("../ai/queryRewriter");
const supabase = require("../../lib/supabase");

exports.askRepo = async (request, reply) => {
  try {
    const { question, owner, repo } = request.body;

    // rewrite query
    const improvedQuery = await rewriteQuery(question);

    // embed improved query
    const embedding = await embed(improvedQuery);

    console.log("Original Query:", question);
    console.log("Rewritten Query:", improvedQuery);

    // Step 2 — Vector search
    const { data: chunks, error } = await supabase.rpc("match_code_chunks", {
      query_embedding: embedding,
      match_count: 4,
      p_owner: owner,
      p_repo: repo,
    });

    if (!chunks || chunks.length === 0) {
      return {
        answer: "I couldn't find relevant code in this repository.",
        sources: [],
      };
    }

    // Step 3 — Build context
    const context = chunks.map((c) => c.chunk).join("\n\n");

    // Step 4 - Sources of context (file and snippet)
    const sources = chunks.map((c) => ({
      file: c.file_path,
      start_line: c.start_line,
      end_line: c.end_line,
      snippet: c.chunk,
    }));

    // Step 4 — Ask LLM
    const answer = await generateAnswer(question, context);

    return {
      answer,
      sources,
    };
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};
