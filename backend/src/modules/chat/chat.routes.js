const chatController = require("./chat.controller");

module.exports = async function (fastify) {
  fastify.post("/chat/ask", chatController.askRepo);
};
