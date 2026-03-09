const jwt = require("jsonwebtoken");

module.exports = async function (request, reply) {

  const token = request.cookies.session;

  if (!token) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    request.user = decoded;

  } catch (err) {

    return reply.code(401).send({ error: "Invalid token" });

  }

};