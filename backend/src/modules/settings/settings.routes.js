const settingsController = require("./settings.controller");
const authMiddleware = require("../../middleware/auth");

module.exports = async function (fastify) {
  fastify.get(
    "/settings",
    { preHandler: authMiddleware },
    settingsController.getSettings
  );

  fastify.patch(
    "/settings",
    { preHandler: authMiddleware },
    settingsController.updateSettings
  );

  fastify.delete(
    "/settings",
    { preHandler: authMiddleware },
    settingsController.deleteAccount
  );
};
