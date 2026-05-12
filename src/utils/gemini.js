import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";

/**
 * Smart Multi-Model Fallback System (Kyra Engine)
 * This function tries multiple models and failover strategies to ensure the user always gets a response.
 */
export const getGeminiResponse = async (prompt, history = [], personalization = {}, signal = null, onUpdate = null, preferredModel = 'Gemini') => {
  const isCodingTask = /code|javascript|python|html|css|debug|function|api|react|next|node/i.test(prompt);
  const isShortChat = prompt.length < 50;

  // Define the hierarchy of models
  const modelChain = [
    // User Preferred Models
    { id: "openai/gpt-4o", type: "openrouter", priority: preferredModel === 'GPT-4' ? -1 : 1 },
    { id: "deepseek/deepseek-chat", type: "openrouter", priority: preferredModel === 'DeepSeek' ? -1 : 2 },
    { id: "meta-llama/llama-3.1-405b-instruct:free", type: "openrouter", priority: preferredModel === 'Llama' ? -1 : 3 },
    { id: "gemini-pro", type: "gemini", priority: preferredModel === 'Gemini' ? -1 : 4 },
    
    // Fallbacks
    { id: "meta-llama/llama-3.1-8b-instruct:free", type: "openrouter", priority: 10 },
    { id: "mistralai/mistral-7b-instruct:free", type: "openrouter", priority: 11 },
    { id: "google/gemma-7b-it:free", type: "openrouter", priority: 12 },
    { id: "pollinations", type: "pollinations", priority: 20 }
  ];

  // Sort by priority
  const sortedChain = modelChain.sort((a, b) => a.priority - b.priority);

  for (const model of sortedChain) {
    try {
      let result = null;

      if (model.type === "openrouter" && OPENROUTER_API_KEY) {
        result = await tryOpenRouter(model.id, prompt, history, signal, onUpdate);
      } else if (model.type === "gemini" && GEMINI_API_KEY) {
        result = await tryGeminiSDK(prompt, history, onUpdate);
      } else if (model.type === "ollama") {
        result = await tryOllama(model.id, prompt, history, onUpdate);
      } else if (model.type === "pollinations") {
        result = await tryPollinations(prompt, history, onUpdate);
      }

      if (result) return result;
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn(`Model ${model.id} failed, trying next...`, err);
      continue; // Silent failover
    }
  }

  return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
};

// --- Strategy Implementations ---

async function tryOpenRouter(modelId, prompt, history, signal, onUpdate) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://Kyra-intelligence.app",
      "X-Title": "Kyra",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: "You are Kyra, a professional and helpful intelligence assistant." },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      stream: true
    })
  });

  if (!response.ok) return null;

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(l => l.trim() !== "");
    
    for (const line of lines) {
      if (line.startsWith("data: ") && !line.includes("[DONE]")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.choices?.[0]?.delta?.content) {
            fullText += data.choices[0].delta.content;
            if (onUpdate) onUpdate(fullText);
          }
        } catch (e) {}
      }
    }
  }
  return fullText || null;
}

async function tryGeminiSDK(prompt, history, onUpdate) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: history.filter(msg => msg.role === 'user' || msg.role === 'ai').map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessageStream(prompt);
  let fullText = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    if (onUpdate) onUpdate(fullText);
  }
  return fullText || null;
}

async function tryOllama(modelId, prompt, history, onUpdate) {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelId,
        messages: [
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: "user", content: prompt }
        ],
        stream: true
      })
    });

    if (!response.ok) return null;

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      try {
        const data = JSON.parse(chunk);
        if (data.message?.content) {
          fullText += data.message.content;
          if (onUpdate) onUpdate(fullText);
        }
      } catch (e) {}
    }
    return fullText || null;
  } catch (e) { return null; }
}

async function tryPollinations(prompt, history, onUpdate) {
  const response = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "You are Kyra." },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: prompt }
      ]
    })
  });
  
  const text = await response.text();
  if (text && onUpdate) {
    // Fake streaming for smoother UI
    let current = "";
    const chars = text.split('');
    for (let i = 0; i < chars.length; i += 5) {
      current += chars.slice(i, i + 5).join('');
      onUpdate(current);
      await new Promise(r => setTimeout(r, 10));
    }
  }
  return text || null;
}
