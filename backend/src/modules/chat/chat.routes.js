const chatController = require("./chat.controller");
const authMiddleware = require("../../middleware/auth");

module.exports = async function (fastify) {
  fastify.post("/chat/ask", { preHandler: [authMiddleware] }, chatController.askRepo);
};
