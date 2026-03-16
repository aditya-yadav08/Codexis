const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../backend/.env"),
});
const { Worker } = require("bullmq");
const axios = require("axios");
const connection = require("../workers/src/lib/redis");
const chunkCode = require("./src/utils/chunker");
const supabase = require("../backend/src/lib/supabase");
const { decrypt } = require("../backend/src/utils/crypto");

console.log("🚀 Repo Index Worker Started 🚀 ");

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
    const { owner, repo, latestCommit, branch, userId } = job.data;

    console.log("Starting indexing:", owner, repo);

    try {
      // 1. Get User Token
      console.log(`[Worker] Fetching token for user: ${userId}`);
      const { data: tokenData, error: tokenError } = await supabase
        .from("github_tokens")
        .select("access_token")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (tokenError) {
        console.error("[Worker] Supabase error fetching token:", tokenError);
        throw new Error(`Database error fetching token: ${tokenError.message}`);
      }

      if (!tokenData || !tokenData.access_token) {
        console.error(`[Worker] No token found in DB for user: ${userId}`);
        throw new Error(
          "GitHub token not found. Please re-authenticate on the profile page.",
        );
      }

      const token = decrypt(tokenData.access_token);
      if (!token) {
        console.error(`[Worker] Decryption failed for user: ${userId}`);
        throw new Error(
          "Failed to decrypt GitHub token. Please re-authenticate.",
        );
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Codexis-Worker",
      };

      // 2. Fetch Tree
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      console.log(`[Worker] Fetching tree from: ${treeUrl}`);

      const response = await axios.get(treeUrl, { headers });
      console.log(
        `[Worker] Successfully fetched tree. Files found: ${response.data.tree?.length}`,
      );

      const files = response.data.tree;

      console.log("Total files in repo:", files.length);

      const codeFiles = files.filter((file) => {
        if (file.type !== "blob") return false;

        const lowerPath = file.path.toLowerCase();
        const fileName = lowerPath.split("/").pop();

        // Ignore specific files
        if (ignoredFiles.includes(fileName)) return false;

        // Ignore folders
        if (ignoredFolders.some((folder) => lowerPath.startsWith(folder + "/")))
          return false;

        // Ignore extensions
        if (ignoredExtensions.some((ext) => lowerPath.endsWith(ext)))
          return false;

        // Ignore large files
        if (file.size && file.size > 200000) return false;

        return true;
      });

      console.log("Code files found:", codeFiles.length);

      // 4. Update total files count for progress tracking
      await supabase
        .from("repos")
        .update({
          status: "indexing",
          total_files: codeFiles.length,
          processed_files: 0,
        })
        .eq("owner", owner)
        .eq("repo", repo);

      // LOOP THROUGH FILES
      let processedCount = 0;
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

        // RETRY LOGIC FOR DOWNLOAD
        let fileResponse;
        let retries = 3;
        while (retries > 0) {
          try {
            // Use authenticated API instead of unauthenticated raw URL
            fileResponse = await axios.get(
              `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`,
              { headers },
            );
            break;
          } catch (err) {
            retries--;
            if (retries === 0) throw err;
            console.log(`Retrying ${file.path} (${3 - retries})...`);
            await new Promise((res) => setTimeout(res, 2000 * (3 - retries)));
          }
        }

        // GitHub API returns base64 content
        const code = Buffer.from(fileResponse.data.content, "base64").toString(
          "utf-8",
        );

        // Skip empty files
        if (!code || code.trim().length === 0) continue;

        // CHUNK THE CODE
        const chunks = chunkCode(code);

        // SAVE EACH CHUNK
        const rows = chunks.map((c) => ({
          owner,
          repo,
          file_path: file.path,
          file_sha: file.sha,
          chunk: c.chunk,
          start_line: c.start_line,
          end_line: c.end_line,
        }));

        const { data: insertedRows } = await supabase
          .from("code_chunks")
          .insert(rows)
          .select();

        const embedQueue = require("../backend/src/queues/embed.queue");

        for (const row of insertedRows) {
          await embedQueue.add("generate-embedding", {
            id: row.id,
            chunk: row.chunk,
          });
        }

        console.log("Saved chunks for:", file.path);

        // Update progress in DB every 5 files to avoid excessive DB calls
        processedCount++;
        if (processedCount % 5 === 0 || processedCount === codeFiles.length) {
          await supabase
            .from("repos")
            .update({ processed_files: processedCount })
            .eq("owner", owner)
            .eq("repo", repo);
        }
      }

      // ✅ MARK REPO AS COMPLETED
      await supabase
        .from("repos")
        .update({
          indexed: true,
          status: "completed",
          indexed_at: new Date().toISOString(),
          last_commit_sha: latestCommit,
          indexing_error: null,
          processed_files: codeFiles.length,
        })
        .eq("owner", owner)
        .eq("repo", repo);

      console.log("Repo indexing completed:", repo);
    } catch (error) {
      console.error("Worker Error:", error.message);
      // MARK REPO AS FAILED
      await supabase
        .from("repos")
        .update({
          status: "failed",
          indexing_error: error.message,
        })
        .eq("owner", owner)
        .eq("repo", repo);
    }
  },
  { connection },
);
