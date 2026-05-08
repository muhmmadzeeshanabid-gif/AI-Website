import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";

export const getGeminiResponse = async (prompt, history = [], personalization = {}, signal = null) => {
  // 1. Try DeepSeek via OpenRouter (Better Quota)
  if (OPENROUTER_API_KEY) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal,
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Aura AI",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat:free",
          messages: [
            { 
              role: "system", 
              content: `You are Aura AI, a lightning-fast premium AI concierge. Base style: ${personalization.baseStyle || 'Default'}. Be concise and direct.` 
            },
            ...history.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      }
      console.warn("OpenRouter API returned no choices, falling back to Gemini...");
    } catch (error) {
      console.error("OpenRouter Error:", error);
    }
  }

  // 2. Fallback to Gemini
  if (!GEMINI_API_KEY) {
    return "API Key is missing. Please add your API Key to the environment variables.";
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      systemInstruction: `You are Aura AI, a lightning-fast premium AI concierge. Base style: ${personalization.baseStyle || 'Default'}. Be concise.`
    });

    const chat = model.startChat({
      history: history.filter(msg => msg.role === 'user' || msg.role === 'ai').map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I'm having trouble connecting. Please check your API keys.";
  }
};
