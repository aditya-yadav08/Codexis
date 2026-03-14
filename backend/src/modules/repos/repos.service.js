const axios = require("axios");
const supabase = require("../../lib/supabase");
const { decrypt } = require("../../utils/crypto");

exports.fetchRepos = async (userId) => {
  console.log(`[RepoService] Fetching repos for user: ${userId}`);

  const { data, error } = await supabase
    .from("github_tokens")
    .select("access_token")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[RepoService] Supabase error fetching token:", error);
    throw new Error("Database error while fetching GitHub token");
  }

  if (!data || !data.access_token) {
    console.warn(`[RepoService] No GitHub token found for user: ${userId}`);
    throw new Error("GITHUB_TOKEN_NOT_FOUND");
  }

  let token;
  try {
      token = decrypt(data.access_token);
  } catch (err) {
      console.error(`[RepoService] Decryption failed for user ${userId}:`, err.message);
      throw new Error("GITHUB_TOKEN_DECRYPTION_FAILED");
  }

  try {
      console.log(`[RepoService] Calling GitHub API for user: ${userId}`);
      const response = await axios.get("https://api.github.com/user/repos?per_page=100&sort=pushed", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/vnd.github.v3+json"
        },
      });

      console.log(`[RepoService] Successfully fetched ${response.data.length} repos for user ${userId}`);
      return response.data;
  } catch (err) {
      console.error(`[RepoService] GitHub API Error for user ${userId}:`, err.response?.status, err.response?.data || err.message);
      if (err.response?.status === 401) {
          throw new Error("GITHUB_TOKEN_EXPIRED");
      }
      throw new Error(`GitHub API Error: ${err.message}`);
  }
};

exports.fetchRepoFiles = async (owner, repo, branch, userId) => {
    // ... (rest remains same but with similar logging if needed)
    const { data } = await supabase.from("github_tokens").select("access_token").eq("user_id", userId).limit(1).maybeSingle();
    const token = decrypt(data.access_token);
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.tree.filter((item) => item.type === "blob").map((file) => ({ path: file.path, size: file.size }));
};

exports.fetchFileContent = async (owner, repo, path, userId) => {
    const { data } = await supabase.from("github_tokens").select("access_token").eq("user_id", userId).limit(1).maybeSingle();
    const token = decrypt(data.access_token);
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const content = Buffer.from(response.data.content, "base64").toString("utf8");
    return { path, content };
};

exports.decrypt = decrypt;
