const auth = require("../../middleware/auth");

module.exports = async function (fastify) {

  // Apply auth middleware to all routes in this module
  fastify.addHook("preHandler", auth);

  // GET /repos
  fastify.get("/", async (request, reply) => {

    return {
      message: "Authorized request",
      user: request.user,
    };

  });

  // POST /repos/index
  fastify.post("/index", async (request, reply) => {

    const { repoUrl } = request.body;

    return {
      message: "Repo indexing started",
      repo: repoUrl,
      user: request.user,
    };

  });

};