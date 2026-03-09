const axios = require("axios");
const supabase = require("../../lib/supabase");

exports.fetchRepos = async (userId) => {
  console.log("User ID:", userId);

  const { data, error } = await supabase
    .from("github_tokens")
    .select("access_token")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  if (!data) {
    throw new Error("GitHub token not found");
  }

  const token = data.access_token;

  console.log("Using token:", token);

  const response = await axios.get("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("Repos fetched:", response.data.length);

  return response.data;
};

exports.fetchRepoFiles = async (owner, repo, branch, userId) => {
  const { data, error } = await supabase
    .from("github_tokens")
    .select("access_token")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("GitHub token not found");

  const token = data.access_token;

  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const files = response.data.tree
    .filter((item) => item.type === "blob")
    .map((file) => ({
      path: file.path,
      size: file.size,
    }));

  return files;
};

exports.fetchFileContent = async (owner, repo, path, userId) => {
  const { data, error } = await supabase
    .from("github_tokens")
    .select("access_token")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("GitHub token not found");

  const token = data.access_token;

  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const content = Buffer.from(response.data.content, "base64").toString("utf8");

  return {
    path,
    content,
  };
};
