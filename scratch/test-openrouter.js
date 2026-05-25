const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const match = envContent.match(/NEXT_PUBLIC_OPENROUTER_API_KEY\s*=\s*(.*)/);
const apiKey = match ? match[1].trim() : null;

async function testModel(modelId, maxTokens) {
  try {
    const body = {
      model: modelId,
      messages: [
        { role: "user", content: "Say hello!" }
      ]
    };
    if (maxTokens) {
      body.max_tokens = maxTokens;
    }
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    console.log(`Model: ${modelId} -> Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response snippet:`, text.substring(0, 200));
  } catch (err) {
    console.error(`Error for ${modelId}:`, err);
  }
}

async function run() {
  const models = [
    { id: "deepseek/deepseek-chat", maxTokens: 1000 },
    { id: "meta-llama/llama-3.1-405b-instruct:free", maxTokens: null },
    { id: "meta-llama/llama-3.1-8b-instruct:free", maxTokens: null },
    { id: "mistralai/mistral-7b-instruct:free", maxTokens: null },
    { id: "google/gemma-2-9b-it:free", maxTokens: null }
  ];
  for (const m of models) {
    await testModel(m.id, m.maxTokens);
    console.log('---');
  }
}

run();
