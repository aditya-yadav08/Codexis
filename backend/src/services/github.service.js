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