const { Queue } = require("bullmq");
const connection = require("../../../workers/src/lib/redis");

const embedQueue = new Queue("generate-embeddings", { connection });

module.exports = embedQueue;