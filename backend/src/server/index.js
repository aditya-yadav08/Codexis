require("dotenv").config();

const Fastify = require("fastify");
const mercurius = require("mercurius");
const cookie = require("@fastify/cookie");

const authRoutes = require("../modules/auth/auth.routes");
const repoRoutes = require("../modules/repos/repos.routes");

const app = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

// Register cookie plugin
app.register(cookie, {
  secret: process.env.JWT_SECRET,
});


// GraphQL schema
const schema = `
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Codexis backend running 🚀",
  },
};

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true,
});


// Register routes
app.register(authRoutes);
app.register(repoRoutes, { prefix: "/repos" });


// Global error handler
app.setErrorHandler((error, request, reply) => {

  request.log.error(error);

  reply.code(500).send({
    error: "Internal Server Error",
  });

});


// Start server
const start = async () => {

  try {

    await app.listen({ port: 4000 });

    app.log.info("🚀 Codexis backend running on http://localhost:4000");

  } catch (err) {

    app.log.error(err);
    process.exit(1);

  }

};

start();