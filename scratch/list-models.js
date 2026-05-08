

async function listModels() {
  const API_KEY = "AIzaSyD6cgkCXRRdWx-inUNzRNw6wumK4joAezI";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

listModels();
