const { syncGithubToken } = require("./auth.controller");
const authMiddleware = require("../../middleware/auth");

module.exports = async function (fastify) {
  fastify.post(
    "/auth/sync-token",
    { preHandler: authMiddleware },
    syncGithubToken
  );
};