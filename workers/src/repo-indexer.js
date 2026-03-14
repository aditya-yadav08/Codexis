const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../backend/.env"),
});
const { Worker } = require("bullmq");
const axios = require("axios");
const connection = require("./lib/redis");
const chunkCode = require("./utils/chunker");
const supabase = require("./lib/supabase");
const { decrypt } = require("./utils/crypto");

console.log("🚀 Custom Repo Index Worker Starting... 🚀");

const ignoredFiles = [".gitignore", ".env.example", "README.md", "LICENSE"];
const ignoredExtensions = [
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".mp4", ".mp3", 
  ".zip", ".tar", ".gz", ".pdf", ".woff", ".woff2", ".lock",
];
const ignoredFolders = [
  "node_modules", "dist", "build", "coverage", ".next", ".git",
];

const worker = new Worker(
  "repo-index",
  async (job) => {
    const { owner, repo, latestCommit, branch, userId } = job.data;

    console.log(`[Worker] Started indexing: ${owner}/${repo} for user: ${userId}`);

    try {
      // 1. Get user's GitHub token
      const { data: tokenData, error: tokenError } = await supabase
        .from("github_tokens")
        .select("access_token")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (tokenError || !tokenData) {
        throw new Error("GitHub token not found for user");
      }

      const token = decrypt(tokenData.access_token);
      const headers = { 
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json"
      };

      // 2. Set status to indexing
      await supabase
        .from("repos")
        .update({ status: "indexing", indexing_error: null })
        .eq("owner", owner)
        .eq("repo", repo);

      // 3. Fetch file list
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers }
      );

      const files = response.data.tree;
      console.log(`[Worker] Found ${files.length} total files`);

      const codeFiles = files.filter((file) => {
        if (file.type !== "blob") return false;
        const lowerPath = file.path.toLowerCase();
        const fileName = lowerPath.split("/").pop();
        if (ignoredFiles.includes(fileName)) return false;
        if (ignoredFolders.some((folder) => lowerPath.startsWith(folder + "/"))) return false;
        if (ignoredExtensions.some((ext) => lowerPath.endsWith(ext))) return false;
        if (file.size && file.size > 200000) return false;
        return true;
      });

      console.log(`[Worker] Processing ${codeFiles.length} code files`);

      // 4. Index files (basic loop for now)
      for (const file of codeFiles) {
        const { data: existingFile } = await supabase
          .from("code_chunks")
          .select("file_sha")
          .eq("owner", owner)
          .eq("repo", repo)
          .eq("file_path", file.path)
          .limit(1)
          .maybeSingle();

        if (existingFile && existingFile.file_sha === file.sha) continue;

        // Delete old chunks
        await supabase
          .from("code_chunks")
          .delete()
          .eq("owner", owner)
          .eq("repo", repo)
          .eq("file_path", file.path);

        // Fetch content via API (works for private)
        const fileContentRes = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`,
            { headers }
        );
        
        const code = Buffer.from(fileContentRes.data.content, 'base64').toString('utf8');
        if (!code || !code.trim()) continue;

        const chunks = chunkCode(code);
        const rows = chunks.map((c) => ({
          owner,
          repo,
          file_path: file.path,
          file_sha: file.sha,
          chunk: c.chunk,
          start_line: c.start_line,
          end_line: c.end_line,
        }));

        await supabase.from("code_chunks").insert(rows);
        // Embedding generation would go here or via another queue
      }

      // 5. Finalize
      await supabase.from("repos").update({
        indexed: true,
        status: "completed",
        indexed_at: new Date().toISOString(),
        last_commit_sha: latestCommit,
        indexing_error: null
      }).eq("owner", owner).eq("repo", repo);

      console.log(`[Worker] Completed: ${owner}/${repo}`);
    } catch (error) {
      console.error(`[Worker] Error indexing ${owner}/${repo}:`, error.message);
      await supabase.from("repos").update({
        status: "failed",
        indexing_error: error.message
      }).eq("owner", owner).eq("repo", repo);
    }
  },
  { connection }
);

module.exports = worker;
