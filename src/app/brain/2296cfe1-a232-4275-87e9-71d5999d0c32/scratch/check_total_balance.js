const fs = require('fs');
const content = fs.readFileSync('c:/Users/T14s/Desktop/ai-website/src/components/ChatWindow.jsx', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
let parenCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
    }
}
console.log(`Final Balance: B:${braceCount} P:${parenCount}`);
