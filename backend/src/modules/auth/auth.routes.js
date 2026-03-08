const { githubCallback } = require("./auth.controller");

module.exports = async function (fastify) {

  fastify.get("/auth/github", async (request, reply) => {

    const githubAuthURL =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&scope=repo read:user`;

    reply.redirect(githubAuthURL);
  });

  fastify.get("/auth/github/callback", githubCallback);
};