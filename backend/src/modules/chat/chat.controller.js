const embed = require("../ai/embedder");
const generateAnswer = require("../ai/llm");
const rewriteQuery = require("../ai/queryRewriter");
const supabase = require("../../lib/supabase");
const redis = require("../../lib/redis");
const crypto = require("crypto");

exports.askRepo = async (request, reply) => {
  try {
    const { question, owner, repo } = request.body;
    const userId = request.user.user_id;

    // 0. Verify repository ownership
    const { data: repoRecord, error: repoError } = await supabase
      .from("repos")
      .select("id")
      .eq("owner", owner)
      .eq("repo", repo)
      .eq("user_id", userId)
      .maybeSingle();

    if (repoError) throw repoError;
    if (!repoRecord) {
      return reply.code(403).send({ error: "Forbidden: You do not have access to this repository" });
    }

    // 1. Check Cache
    const queryHash = crypto.createHash("md5").update(question.trim().toLowerCase()).digest("hex");
    const cacheKey = `chat_cache:${owner}:${repo}:${queryHash}`;
    
    // Increment question count for analytics
    await redis.incr(`stats:questions:${userId}`).catch(e => console.error("Redis incr error:", e));
    
    // Increment daily question count for chart
    const today = new Date().toISOString().split('T')[0];
    await redis.incr(`stats:questions:${userId}:${today}`).catch(e => console.error("Redis daily incr error:", e));

    try {
      const cachedResponse = await redis.get(cacheKey);
      if (cachedResponse) {
        console.log("Cache HIT for query:", question);
        return JSON.parse(cachedResponse);
      }
    } catch (cacheErr) {
      console.error("Redis cache read error:", cacheErr);
    }

    // rewrite query
    console.log("[Chat] Rewriting query...");
    const improvedQuery = await rewriteQuery(question);
    console.log("[Chat] Improved Query:", improvedQuery);

    // embed improved query
    console.log("[Chat] Generating embedding...");
    const embedding = await embed(improvedQuery);
    console.log("[Chat] Embedding generated, length:", embedding.length);

    // Step 2 — Vector search
    console.log("[Chat] Calling match_code_chunks RPC...");
    const { data: chunks, error: rpcError } = await supabase.rpc("match_code_chunks", {
      query_embedding: embedding,
      match_count: 5,
      p_owner: owner,
      p_repo: repo,
    });

    if (rpcError) {
      console.error("[Chat] Match Code Chunks RPC Error:", rpcError);
      throw rpcError;
    }

    console.log(`[Chat] Retrieved ${chunks?.length || 0} chunks`);
    
    if (chunks) {
      console.log(
        "Retrieved chunks summary:",
        chunks.map((c) => ({
          file: c.file_path,
          similarity: c.similarity
        })),
      );
    }

    if (!chunks || chunks.length === 0) {
      return {
        answer: "I couldn't find relevant code in this repository.",
        sources: [],
      };
    }

    // Step 3 — Build context
    const context = chunks
      .map(
        (c, i) => `
          [Source ${i + 1}]
          File: ${c.file_path}
          Lines: ${c.start_line}-${c.end_line}

    ${c.chunk}
    `,
      )
      .join("\n");

    // Step 4 - Sources of context (file and snippet)
    const sources = chunks.map((c) => ({
      file: c.file_path,
      start_line: c.start_line,
      end_line: c.end_line,
      snippet: c.chunk,
    }));

    // Step 4 — Ask LLM
    console.log("[Chat] Generating answer from LLM...");
    const answer = await generateAnswer(question, context);
    console.log("[Chat] Answer generated successfully");

    const result = {
      answer,
      sources,
    };

    // 2. Store in Cache
    try {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);
      console.log("Cache MISS - Answer saved to Redis");
    } catch (cacheErr) {
      console.error("Redis cache write error:", cacheErr);
    }

    return result;
  } catch (error) {
    console.error("[Chat] ERROR in askRepo:", error);
    if (error.response) {
       console.error("[Chat] API Response Error Data:", error.response.data);
    }
    reply.code(500).send({ 
      error: error.message,
      details: error.details || error.hint || null
    });
  }
};
