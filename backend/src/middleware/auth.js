const supabase = require("../../src/lib/supabase");

module.exports = async function (request, reply) {
  const authHeader = request.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : request.cookies.session;

  if (!token) {
    return reply.code(401).send({ error: "Unauthorized" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error("Invalid token");
    }

    request.user = {
      user_id: user.id,
      github_id: user.identities?.[0]?.identity_data?.sub || user.id,
      username: user.user_metadata?.user_name || user.email,
    };
  } catch (err) {
    return reply.code(401).send({ error: "Invalid token" });
  }
};
