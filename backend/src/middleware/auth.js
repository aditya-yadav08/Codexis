const jwt = require("jsonwebtoken");

module.exports = async function auth(request, reply) {
  const token = request.cookies.session;

  if (!token) {
    return reply.code(401).send({
      error: "Unauthorized",
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // attach user to request
    request.user = user;

  } catch (error) {
    return reply.code(401).send({
      error: "Invalid session",
    });
  }
};