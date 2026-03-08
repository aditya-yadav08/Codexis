const Fastify = require("fastify");
const mercurius = require("mercurius");

const app = Fastify();

const schema = `
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "AI Dev Assistant Backend Running 🚀"
  }
};

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
});

app.listen({ port: 4000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server running at ${address}`);
});