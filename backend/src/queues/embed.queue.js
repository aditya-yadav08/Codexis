const { Queue } = require("bullmq");
const connection = require("../lib/redis");

const embedQueue = new Queue("generate-embeddings", { connection });

module.exports = embedQueue;