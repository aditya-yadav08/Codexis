const repoController = require("./repos.controller");
const authMiddleware = require("../../middleware/auth");

module.exports = async function (fastify) {

  // Repos routes
  fastify.get(
    "/repos",
    {
      preHandler: authMiddleware,
    },
    repoController.getUserRepos,
  );

  // Files routes
  fastify.get(
    "/repos/files",
    {
      preHandler: authMiddleware,
    },
    repoController.getRepoFiles,
  );

  // File content route
  fastify.get(
    "/repos/file",
    {
      preHandler: authMiddleware,
    },
    repoController.getFileContent,
  );

  // Indexing route
  fastify.post(
  "/repos/index",
  { preHandler: authMiddleware },
  repoController.indexRepo
);
};
