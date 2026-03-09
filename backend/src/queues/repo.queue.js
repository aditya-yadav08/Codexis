const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis();

const repoQueue = new Queue("repo-index", {
  connection
});

module.exports = repoQueue;