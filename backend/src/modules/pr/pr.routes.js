const prController = require("./pr.controller");

async function prRoutes(fastify, options) {
  fastify.get("/:owner/:repo/pr/pulls", prController.getRepoPulls);
  fastify.post("/:owner/:repo/pr/pulls/:pullNumber/analyze", prController.analyzePull);
}

module.exports = prRoutes;
