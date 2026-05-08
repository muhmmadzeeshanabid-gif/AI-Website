const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const API_KEY = "AIzaSyD6cgkCXRRdWx-inUNzRNw6wumK4joAezI";
  const genAI = new GoogleGenerativeAI(API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    console.log("Testing gemini-flash-latest...");
    const result = await models.generateContent("Hi, are you working?");
    console.log("Response:", await result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

listModels();
