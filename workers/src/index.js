const { Worker } = require("bullmq");

const worker = new Worker("repo-index", async job => {
  console.log("Processing repo:", job.data);
});