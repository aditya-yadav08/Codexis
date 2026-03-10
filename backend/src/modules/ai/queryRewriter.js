const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function rewriteQuery(question) {
  const completion = await client.chat.completions.create({
    model: "qwen/qwen-2.5-7b-instruct",
    temperature: 0,
    max_tokens: 80,
    messages: [
      {
        role: "system",
        content:
          "Rewrite the question to improve semantic code search in a GitHub repository. Return only the improved query.",
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = rewriteQuery;
