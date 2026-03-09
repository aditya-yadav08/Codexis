const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../backend/.env"),
});
const { Worker } = require("bullmq");
const axios = require("axios");
const connection = require("../workers/src/lib/redis");
const chunkCode = require("./src/utils/chunker");
const supabase = require("../backend/src/lib/supabase");

console.log("🚀 Repo Index Worker Started");

// Files we want to ignore completely (even if they are small)
const ignoredFiles = [".gitignore", ".env.example", "README.md", "LICENSE"];

// Files we DO NOT want to index
const ignoredExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".mp4",
  ".mp3",
  ".zip",
  ".tar",
  ".gz",
  ".pdf",
  ".woff",
  ".woff2",
  ".lock",
];

// Folders we should ignore
const ignoredFolders = [
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".git",
];

const worker = new Worker(
  "repo-index",
  async (job) => {
    const { owner, repo, latestCommit, branch } = job.data;

    console.log("Starting indexing:", owner, repo);

    // ✅ DELETE PREVIOUS CHUNKS
    // console.log("Deleting previous chunks...");

    // const { error } = await supabase
    //   .from("code_chunks")
    //   .delete()
    //   .eq("repo", repo);

    // if (error) {
    //   console.error("Delete failed:", error);
    // }

    // console.log("Previous chunks deleted.");

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${job.data.branch}?recursive=1`,
    );

    const files = response.data.tree;

    console.log("Total files in repo:", files.length);

    const codeFiles = files.filter((file) => {
      if (file.type !== "blob") return false;

      const lowerPath = file.path.toLowerCase();
      const fileName = lowerPath.split("/").pop();

      // Ignore specific files
      if (ignoredFiles.includes(fileName)) {
        return false;
      }

      // Ignore folders
      if (ignoredFolders.some((folder) => lowerPath.startsWith(folder + "/"))) {
        return false;
      }

      // Ignore extensions
      if (ignoredExtensions.some((ext) => lowerPath.endsWith(ext))) {
        return false;
      }

      // Ignore large files
      if (file.size && file.size > 200000) {
        return false;
      }

      return true;
    });

    console.log("Code files found:", codeFiles.length);

    // LOOP THROUGH FILES
    for (const file of codeFiles) {
      // CHECK IF FILE CHANGED
      const { data: existingFile } = await supabase
        .from("code_chunks")
        .select("file_sha")
        .eq("owner", owner)
        .eq("repo", repo)
        .eq("file_path", file.path)
        .limit(1)
        .maybeSingle();

      if (existingFile && existingFile.file_sha === file.sha) {
        console.log("Skipping unchanged file:", file.path);
        continue;
      }

      // DELETE OLD CHUNKS FOR THIS FILE
      await supabase
        .from("code_chunks")
        .delete()
        .eq("owner", owner)
        .eq("repo", repo)
        .eq("file_path", file.path);

      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;

      try {
        const fileResponse = await axios.get(rawUrl);

        const code = String(fileResponse.data);

        console.log("Downloaded:", file.path);

        // Skip empty files
        if (!code || code.trim().length === 0) {
          console.log("Skipping empty file:", file.path);
          continue;
        }

        // CHUNK THE CODE
        const chunks = chunkCode(code);

        console.log("Chunks created:", chunks.length);

        // SAVE EACH CHUNK
        const rows = chunks.map((chunk) => ({
          owner,
          repo,
          file_path: file.path,
          file_sha: file.sha,
          chunk,
        }));

        await supabase.from("code_chunks").insert(rows);

        console.log("Saved chunks for:", file.path);
      } catch (error) {
        console.log("Failed:", file.path);
      }
    }

    // ✅ MARK REPO AS INDEXED
    await supabase.from("repos").upsert(
      {
        owner,
        repo,
        indexed: true,
        indexed_at: new Date(),
        last_commit_sha: latestCommit,
      },
      {
        onConflict: "owner,repo",
      },
    );

    console.log("Repo indexing completed:", repo);
  },
  { connection },
);
