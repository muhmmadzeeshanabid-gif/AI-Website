async function test(url) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are Kyra." },
          { role: "user", content: "Hello" }
        ]
      })
    });
    const text = await response.text();
    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Body: ${text.substring(0, 500)}`);
    console.log('---');
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  await test("https://text.pollinations.ai/");
}

main();
