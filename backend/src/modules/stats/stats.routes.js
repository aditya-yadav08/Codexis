const statsController = require("./stats.controller");
const authMiddleware = require("../../middleware/auth");

module.exports = async function (fastify) {
  fastify.get(
    "/stats/overview",
    { preHandler: [authMiddleware] },
    statsController.getOverviewStats
  );

  fastify.get(
    "/stats/activity",
    { preHandler: [authMiddleware] },
    statsController.getRecentActivity
  );
};
