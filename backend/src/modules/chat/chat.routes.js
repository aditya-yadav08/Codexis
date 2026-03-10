const chatController = require("./chat.controller");

async function chatRoutes(fastify) {
  fastify.post("/chat/context", chatController.retrieveContext);
}

module.exports = chatRoutes;
