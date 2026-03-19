const { Queue } = require("bullmq");
const connection = require("../lib/redis");

const repoQueue = new Queue("repo-index", {
  connection
});

module.exports = repoQueue;