const jwt = require("jsonwebtoken");
const authService = require("./auth.service");

exports.githubCallback = async (request, reply) => {
  try {
    const code = request.query.code;

    if (!code) {
      return reply.code(400).send({ error: "Missing GitHub code" });
    }

    // Call service
    const user = await authService.handleGithubOAuth(code);

    request.log.info({ user }, "Authenticated user");

    // Create session token
    const sessionToken = jwt.sign(
      {
        github_id: user.github_id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Send cookie
    reply
      .setCookie("session", sessionToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      })
      .redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error("GitHub OAuth Error:", error.message);

    reply.code(500).send({
      error: "Authentication failed",
    });
  }
};
