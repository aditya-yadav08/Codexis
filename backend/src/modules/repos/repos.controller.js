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
    console.error(error);

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

    console.log("Index request received:", owner, repo);

    // Get repo info
    const repoInfo = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
    );

    const branch = repoInfo.data.default_branch;

    // Get latest commit
    const commitRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits/${branch}`,
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

    // Skip indexing if repo unchanged
    if (data && data.last_commit_sha === latestCommit) {
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

    await repoQueue.add(
      "index-repo",
      {
        owner,
        repo,
        latestCommit,
        branch,
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
