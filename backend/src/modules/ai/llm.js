const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function generateAnswer(question, context) {
  const completion = await client.chat.completions.create({
    model: "qwen/qwen-2.5-7b-instruct",
    temperature: 0.2,
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content: `
            You are a senior software engineer helping a developer understand a codebase.

            The developer may be new to this repository.

            Your job is to explain code clearly and reference the exact files and functions.

            Rules:

            1. Explain the flow of the system step by step
            2. Mention the exact file where each step happens
            3. Mention important functions or methods
            4. Explain why that code exists
            5. Avoid vague explanations
            6. Only reference file paths that appear in the provided context.
            7. Never invent file paths.
            8. If the exact file path is not present, say "File path not found in retrieved context".
            9. Base your answer strictly on the provided code snippets.

            Format your answer like this:

            Overview
            Explain what the system does.

            Code Flow
            Step-by-step explanation referencing files.

            Example:

            1. User login starts in \`backend/src/modules/auth/auth.routes.js\`
              Function: \`fastify.get("/auth/github")\`

            2. GitHub OAuth callback is handled in
              \`backend/src/modules/auth/auth.controller.js\`
              Function: \`githubCallback\`

            3. GitHub API requests are created in
              \`backend/src/services/github.service.js\`

            Always tie explanations to the repository code.
            `,
      },
      {
        role: "user",
        content: `
          A developer asked the following question about this repository.

          Question:
          ${question}

          Code context from the repository:
          ${context}

          Explain the answer like you are helping a new developer understand this repository.

          Reference the files and functions where the logic exists.
          `,
      },
    ],
  });

  return completion.choices[0].message.content;
}

module.exports = generateAnswer;
