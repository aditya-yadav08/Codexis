const axios = require("axios");
const supabase = require("../../lib/supabase");
const githubService = require("../../services/github.service");

exports.handleGithubOAuth = async (code) => {
  // Exchange code for access token
  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    {
      headers: { Accept: "application/json" },
    },
  );

  const accessToken = tokenRes.data.access_token;

  if (!accessToken) {
    throw new Error("Failed to get GitHub access token");
  }

  // Fetch GitHub user
  const githubUser = await githubService.getGithubUser(accessToken);

  const github_id = githubUser.id.toString();
  const username = githubUser.login;
  const avatar = githubUser.avatar_url;

  // Check if user exists
  const { data: existingUser, error } = await supabase
    .from("users")
    .select("*")
    .eq("github_id", github_id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  let userId;

  // Insert user if new
  if (!existingUser) {
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        github_id,
        username,
        avatar,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    userId = newUser.id;
  } else {
    userId = existingUser.id;
  }

  // Store GitHub token
  const { error: tokenError } = await supabase.from("github_tokens").upsert({
    user_id: userId,
    access_token: accessToken,
  });

  if (tokenError) {
    throw tokenError;
  }

  return {
    github_id,
    username,
    avatar,
    access_token: accessToken,
  };
};
