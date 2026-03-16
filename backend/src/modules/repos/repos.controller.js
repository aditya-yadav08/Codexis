const repoService = require("./repos.service");
const repoQueue = require("../../queues/repo.queue");
const supabase = require("../../lib/supabase");
const axios = require("axios");

exports.getUserRepos = async (request, reply) => {
  try {
    const userId = request.user.user_id;

    console.log("User ID from JWT:", userId);

    const repos = await repoService.fetchRepos(userId);

    return repos;
  } catch (error) {
    console.error("[RepoController] getUserRepos Error:", error.message);

    if (error.message === "GITHUB_TOKEN_NOT_FOUND") {
        return reply.code(404).send({ error: "GitHub token not found. Please re-authenticate.", code: "TOKEN_MISSING" });
    }
    if (error.message === "GITHUB_TOKEN_EXPIRED") {
        return reply.code(401).send({ error: "GitHub token expired. Please re-authenticate.", code: "TOKEN_EXPIRED" });
    }
    if (error.message === "GITHUB_TOKEN_DECRYPTION_FAILED") {
        return reply.code(500).send({ error: "System error: token decryption failed.", code: "DECRYPTION_FAILED" });
    }

    reply.code(500).send({
      error: error.message,
    });
  }
};

exports.getRepoFiles = async (request, reply) => {
  try {
    const { owner, repo, branch = "main" } = request.query;

    const userId = request.user.user_id;

    const files = await repoService.fetchRepoFiles(owner, repo, branch, userId);

    return files;
  } catch (error) {
    console.error(error);

    reply.code(500).send({
      error: error.message,
    });
  }
};

exports.getFileContent = async (request, reply) => {
  try {
    const { owner, repo, path } = request.query;

    const userId = request.user.user_id;

    const file = await repoService.fetchFileContent(owner, repo, path, userId);

    return file;
  } catch (error) {
    console.error(error);

    reply.code(500).send({
      error: error.message,
    });
  }
};

exports.indexRepo = async (request, reply) => {
  try {
    const { owner, repo } = request.body;
    const userId = request.user.user_id;

    console.log("Index request received:", owner, repo, "from user:", userId);

    const { data: tokenData } = await supabase
      .from("github_tokens")
      .select("access_token")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (!tokenData) {
      return reply.code(400).send({ error: "GitHub token not found. Please re-authenticate." });
    }

    const token = repoService.decrypt(tokenData.access_token);
    const headers = { Authorization: `Bearer ${token}` };

    // Get repo info
    const repoInfo = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    const branch = repoInfo.data.default_branch;

    // Get latest commit
    const commitRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
      { headers }
    );

    const latestCommit = commitRes.data.sha;

    console.log("Latest commit:", latestCommit);

    const { data } = await supabase
      .from("repos")
      .select("last_commit_sha")
      .eq("owner", owner)
      .eq("repo", repo)
      .maybeSingle();

    console.log("Stored commit:", data?.last_commit_sha);

    // check if chunks exist
    const { count } = await supabase
      .from("code_chunks")
      .select("*", { count: "exact", head: true })
      .eq("owner", owner)
      .eq("repo", repo);

    // skip only if commit same AND chunks exist
    if (data && data.last_commit_sha === latestCommit && count > 0) {
      console.log("Skipping indexing - repo already up to date");

      return {
        message: "Repo already indexed and up to date",
      };
    }

    console.log("Queueing repo indexing job...");

    const jobId = `${owner}-${repo}`;

    const existingJob = await repoQueue.getJob(jobId);

    if (existingJob) {
      await existingJob.remove();
    }

    // Set initial status to 'pending' before adding to queue
    const { error: indexError } = await supabase.from("repos").upsert(
      {
        owner,
        repo,
        user_id: userId,
        indexed: false,
        status: "pending"
      },
      { onConflict: "owner,repo" } // Use comma-separated string for onConflict columns
    );

    if (indexError) {
      console.error("Error upserting repo status:", indexError);
      throw indexError;
    }

    await repoQueue.add(
      "index-repo",
      {
        owner,
        repo,
        latestCommit,
        branch,
        userId,
      },
      {
        jobId,
      },
    );

    return {
      message: "Repo indexing started",
    };
  } catch (error) {
    console.error(error);

    reply.code(500).send({
      error: error.message,
    });
  }
};

exports.getIndexedRepos = async (request, reply) => {
  try {
    const userId = request.user.user_id;
    const { data, error } = await supabase
      .from("repos")
      .select("id, owner, repo, indexed_at")
      .eq("indexed", true)
      .eq("user_id", userId)
      .order("indexed_at", { ascending: false });

    if (error) throw error;

    reply.send(data);
  } catch (error) {
    console.error(error);
    reply.code(500).send({ error: error.message });
  }
};

exports.deleteRepo = async (request, reply) => {
  try {
    const { owner, repo } = request.params;
    const userId = request.user.user_id;

    console.log(`Deletion request received for: ${owner}/${repo} from user ${userId}`);

    // 0. Verify ownership first
    const { data: repoRecord, error: fetchError } = await supabase
      .from("repos")
      .select("id")
      .eq("owner", owner)
      .eq("repo", repo)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!repoRecord) {
      return reply.code(403).send({ error: "Forbidden: You do not own this repository" });
    }

    // 1. Delete code chunks
    const { error: chunkError } = await supabase
      .from("code_chunks")
      .delete()
      .eq("owner", owner)
      .eq("repo", repo);

    if (chunkError) throw chunkError;

    // 2. Delete repo record
    const { error: repoError } = await supabase
      .from("repos")
      .delete()
      .eq("id", repoRecord.id);

    if (repoError) throw repoError;

    return { message: "Repository and all indexed data deleted successfully" };
  } catch (error) {
    console.error("Delete Repo Error:", error);
    reply.code(500).send({ error: error.message });
  }
};

exports.getRepoStatus = async (request, reply) => {
  try {
    const { owner, repo } = request.query;
    const userId = request.user.user_id;

    const { data, error } = await supabase
      .from("repos")
      .select("status, indexing_error, total_files, processed_files")
      .eq("owner", owner)
      .eq("repo", repo)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return reply.code(404).send({ error: "Repository not found" });

    return data;
  } catch (error) {
    console.error("Get Repo Status Error:", error);
    reply.code(500).send({ error: error.message });
  }
};
