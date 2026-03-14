require("dotenv").config();

const Fastify = require("fastify");
const mercurius = require("mercurius");
const cookie = require("@fastify/cookie");
const cors = require("@fastify/cors");

const authRoutes = require("../modules/auth/auth.routes");
const repoRoutes = require("../modules/repos/repos.routes");
const chatRoutes = require("../modules/chat/chat.routes");
const statsRoutes = require("../modules/stats/stats.routes");

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

// Register CORS plugin
app.register(cors, {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
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
app.register(repoRoutes);
app.register(statsRoutes);
app.register(require("../modules/chat/chat.routes"), { prefix: "/api" });

// app.register(repoRoutes, { prefix: "/repos" });

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
    await app.listen({ port: 4000, host: "0.0.0.0" });

    app.log.info("🚀 Codexis backend running on http://localhost:4000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
