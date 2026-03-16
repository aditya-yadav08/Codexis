const supabase = require("../../lib/supabase");

exports.getOverviewStats = async (request, reply) => {
  try {
    const userId = request.user.user_id;

    // 1. Repo count
    const { count: repoCount, error: repoError } = await supabase
      .from("repos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("indexed", true);

    if (repoError) throw repoError;

    // 2. Indexed files count
    // This is a bit tricky with code_chunks, we need unique file_paths
    // For now, let's count distinct file_path where owner/repo are owned by user
    // A more efficient way would be a view or a separate table, but let's try direct count first
    
    // First get user's repo owner/repo list
    const { data: userRepos } = await supabase
      .from("repos")
      .select("owner, repo")
      .eq("user_id", userId)
      .eq("indexed", true);

    let totalFiles = 0;
    if (userRepos && userRepos.length > 0) {
        // We can't easily do "distinct" across all repos in one simple query with Supabase JS easily for massive data
        // but for now, we'll sum up counts per repo or use a clever RPC if needed.
        // Let's just estimate or get exact if possible.
        
        // Exact unique files count per user (requires a slightly complex query)
        // For simplicity in this v1, let's count chunks as "indexed snippets" or just count files in repos table if we had that column.
        // Let's use the number of unique file_paths in code_chunks.
        
        const { data: fileCounts, error: fileError } = await supabase
            .from("code_chunks")
            .select("file_path, owner, repo")
            .in("owner", userRepos.map(r => r.owner)); 
            // This is an approximation. Ideally we filter by (owner, repo) pairs.
            
        // Filter precisely in JS for now (not ideal for huge datasets)
        const uniqueFiles = new Set();
        fileCounts?.forEach(fc => {
            const isOwned = userRepos.some(ur => ur.owner === fc.owner && ur.repo === fc.repo);
            if (isOwned) uniqueFiles.add(`${fc.owner}/${fc.repo}/${fc.file_path}`);
        });
        totalFiles = uniqueFiles.size;
    }

    // 3. Questions asked
    const redis = require("../../lib/redis");
    const questionsCount = await redis.get(`stats:questions:${userId}`).then(val => val || 0).catch(() => 0);
    const responseTime = "1.2s";

    return {
      repos: repoCount || 0,
      files: totalFiles,
      questions: parseInt(questionsCount),
      responseTime
    };
  } catch (error) {
    console.error("Stats Error:", error);
    reply.code(500).send({ error: error.message });
  }
};

exports.getRecentActivity = async (request, reply) => {
  try {
    const userId = request.user.user_id;

    // Get recently indexed repos or status changes
    const { data: recentRepos, error } = await supabase
      .from("repos")
      .select("owner, repo, status, indexed_at, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    const activity = recentRepos.map(r => {
        let label = "";
        if (r.status === "completed") label = `Indexed ${r.owner}/${r.repo}`;
        else if (r.status === "indexing") label = `Indexing ${r.owner}/${r.repo}`;
        else if (r.status === "failed") label = `Failed to index ${r.owner}/${r.repo}`;
        else label = `Connected ${r.owner}/${r.repo}`;

        return {
            label,
            timestamp: r.updated_at || r.indexed_at || r.created_at,
            status: r.status
        };
    });

    return activity;
  } catch (error) {
    console.error("Activity Error:", error);
    reply.code(500).send({ error: error.message });
  }
};

exports.getUsageStats = async (request, reply) => {
  try {
    const userId = request.user.user_id;
    const redis = require("../../lib/redis");
    const usage = [];

    // Get last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = await redis.get(`stats:questions:${userId}:${dateStr}`).then(val => parseInt(val || 0)).catch(() => 0);
      
      usage.push({
        date: displayDate,
        count
      });
    }

    return usage;
  } catch (error) {
    console.error("Usage Stats Error:", error);
    reply.code(500).send({ error: error.message });
  }
};
