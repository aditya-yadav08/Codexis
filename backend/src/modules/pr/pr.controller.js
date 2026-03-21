const prService = require("./pr.service");

exports.getRepoPulls = async (request, reply) => {
  try {
    const { owner, repo } = request.params;
    const userId = request.user.user_id;

    const pulls = await prService.getRepoPulls(userId, owner, repo);
    return pulls;
  } catch (error) {
    console.error("[PRController] getRepoPulls Error:", error.message);
    reply.code(500).send({ error: error.message });
  }
};

exports.analyzePull = async (request, reply) => {
  try {
    const { owner, repo, pullNumber } = request.params;
    const userId = request.user.user_id;

    const analysis = await prService.analyzePullRequest(userId, owner, repo, pullNumber);
    return { analysis };
  } catch (error) {
    console.error("[PRController] analyzePull Error:", error.message);
    reply.code(500).send({ error: error.message });
  }
};
