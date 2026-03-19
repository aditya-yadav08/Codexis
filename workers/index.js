"use strict";

/**
 * Unified Worker Entry Point
 * Starts both the Repo Indexer and the Embedder workers in a single process.
 */

console.log("🛠️  Codexis Workers: Initializing... 🛠️");

// Import and start the Repo Indexer worker
require("./repoIndexer.worker.js");

// Import and start the Embedder worker
require("./embedder.worker.js");

console.log("✅ All workers are now active and listening for jobs.");

// Handle process termination gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down workers...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down workers...");
  process.exit(0);
});
