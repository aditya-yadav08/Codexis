const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function generateAnswer(question, context) {
  const completion = await client.chat.completions.create({
    model: "qwen/qwen-2.5-7b-instruct",
    temperature: 0.2,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content:
          "You are a senior software engineer helping understand a GitHub repository.",
      },
      {
        role: "user",
        content: `
Answer the question using ONLY the provided code context.

If the answer is not present in the code context say:
"I could not find this in the repository."

Question:
${question}

Code Context:
${context}
`,
      },
    ],
  });

  return completion.choices[0].message.content;
}

module.exports = generateAnswer;
