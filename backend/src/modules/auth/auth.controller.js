const axios = require("axios");
const jwt = require("jsonwebtoken");
const supabase = require("../../lib/supabase");

exports.githubCallback = async (request, reply) => {

  try {

    const code = request.query.code;

    // 1️⃣ Get GitHub access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;

    // 2️⃣ Fetch GitHub user
    const userRes = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const githubUser = userRes.data;

    // 3️⃣ Find user
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("github_id", githubUser.id)
      .maybeSingle();

    // 4️⃣ Create user if not exists
    if (!user) {

      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          github_id: githubUser.id,
          username: githubUser.login,
          avatar: githubUser.avatar_url
        })
        .select()
        .single();

      if (error) throw error;

      user = newUser;
    }

    // 5️⃣ Save GitHub token
    const { error: tokenError } = await supabase
      .from("github_tokens")
      .upsert(
        {
          user_id: user.id,
          access_token: accessToken
        },
        { onConflict: "user_id" }
      );

    if (tokenError) throw tokenError;

    // 6️⃣ Create JWT session
    const sessionToken = jwt.sign(
      {
        user_id: user.id,
        github_id: user.github_id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    reply
      .setCookie("session", sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/"
      })
      .redirect(`${process.env.FRONTEND_URL}/dashboard`);

  } catch (error) {

    console.error("OAuth Error:", error);

    reply.code(500).send({
      error: error.message
    });

  }
};