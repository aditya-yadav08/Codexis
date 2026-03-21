const githubService = require("../../services/github.service");
const generateAnswer = require("../ai/llm");
const supabase = require("../../lib/supabase");
const { decrypt } = require("../../utils/crypto");

exports.analyzePullRequest = async (userId, owner, repo, pullNumber) => {
  // 1. Get User Token
  const { data: tokenData, error: tokenError } = await supabase
    .from("github_tokens")
    .select("access_token")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (tokenError || !tokenData) {
    throw new Error("GitHub token not found. Please re-authenticate.");
  }

  const token = decrypt(tokenData.access_token);

  // 2. Fetch PR Diff
  console.log(`[PR Service] Fetching diff for ${owner}/${repo} PR #${pullNumber}`);
  const diff = await githubService.getPullDiff(token, owner, repo, pullNumber);

  // 3. Prepare AI Prompt
  const systemPrompt = `
    You are a Senior Software Engineer performing a code review.
    Your goal is to analyze the following Git diff and provide a constructive review.
    Focus on:
    1. Potential bugs or edge cases.
    2. Performance improvements.
    3. Security vulnerabilities.
    4. Code quality and best practices.

    Format your response in Markdown with clear headings.
    Be concise but thorough.
  `;

  const userPrompt = `
    Please analyze the following PR diff for the repository ${owner}/${repo}:

    ${diff}
  `;

  // 4. Call LLM
  // We reuse generateAnswer but customize context
  console.log(`[PR Service] Analyzing diff with AI...`);
  const analysis = await generateAnswer(userPrompt, systemPrompt);

  return analysis;
};

exports.getRepoPulls = async (userId, owner, repo) => {
  const { data: tokenData } = await supabase
    .from("github_tokens")
    .select("access_token")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (!tokenData) {
    throw new Error("GitHub token not found.");
  }

  const token = decrypt(tokenData.access_token);
  return await githubService.getRepoPulls(token, owner, repo);
};
