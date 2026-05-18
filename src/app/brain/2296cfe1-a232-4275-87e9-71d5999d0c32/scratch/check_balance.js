const fs = require('fs');
const content = fs.readFileSync('c:/Users/T14s/Desktop/ai-website/src/components/ChatWindow.jsx', 'utf8');
const lines = content.split('\n');

const startLine = 1847;
const endLine = 2320;

let braceCount = 0;
let parenCount = 0;

for (let i = startLine - 1; i < endLine; i++) {
    const line = lines[i];
    if (!line) continue;
    
    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
    }
    console.log(`${i + 1}: B:${braceCount} P:${parenCount} | ${line.trim()}`);
}
