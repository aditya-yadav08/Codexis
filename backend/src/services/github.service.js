const axios = require("axios");

const githubClient = axios.create({
  baseURL: "https://api.github.com",
});

/**
 * Get authenticated GitHub user
 */
exports.getGithubUser = async (token) => {
  const res = await githubClient.get("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

/**
 * Get user repositories
 */
exports.getUserRepos = async (token) => {
  const res = await githubClient.get("/user/repos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

/**
 * Get repository tree
 */
exports.getRepoTree = async (token, owner, repo) => {
  const res = await githubClient.get(
    `/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

/**
 * Get repository pull requests
 */
exports.getRepoPulls = async (token, owner, repo) => {
  const res = await githubClient.get(`/repos/${owner}/${repo}/pulls?state=open`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

/**
 * Get pull request diff
 */
exports.getPullDiff = async (token, owner, repo, pullNumber) => {
  const res = await githubClient.get(
    `/repos/${owner}/${repo}/pulls/${pullNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.diff",
      },
    }
  );

  return res.data;
};