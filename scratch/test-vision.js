const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const match = envContent.match(/NEXT_PUBLIC_OPENROUTER_API_KEY\s*=\s*(.*)/);
const apiKey = match ? match[1].trim() : null;

// Tiny 1x1 transparent PNG
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function testVision(modelId) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              },
              {
                type: "text",
                text: "What color is this image?"
              }
            ]
          }
        ]
      })
    });
    console.log(`Model: ${modelId} -> Status: ${response.status}`);
    const data = await response.json();
    console.log(`Response choice:`, JSON.stringify(data.choices?.[0]?.message || data));
  } catch (err) {
    console.error(`Error for ${modelId}:`, err);
  }
}

async function run() {
  await testVision("google/gemini-2.5-flash");
  console.log('---');
  await testVision("openai/gpt-4o-mini");
}

run();
