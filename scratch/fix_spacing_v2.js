
const fs = require('fs');
const path = 'c:\\Users\\T14s\\Desktop\\ai-website\\src\\components\\ChatWindow.jsx';
let content = fs.readFileSync(path, 'utf8');

// Increase spacing between messages
content = content.replace(
  /className=\{`w-full flex flex-col gap-3 mb-12 group\/msg \$\{msg\.role === 'ai' \? 'mt-4' : ''\}`\}/,
  "className={`w-full flex flex-col gap-5 mb-16 group/msg ${msg.role === 'ai' ? 'mt-10' : ''}`}"
);

fs.writeFileSync(path, content);
console.log('Message spacing increased successfully');
