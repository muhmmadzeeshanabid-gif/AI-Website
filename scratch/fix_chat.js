
const fs = require('fs');
const path = 'c:\\Users\\T14s\\Desktop\\ai-website\\src\\components\\ChatWindow.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix More menu direction
content = content.replace(
  /className="absolute right-0 bottom-full mb-3 z-\[100\]"/,
  'className="absolute right-0 z-[100]" style={{ bottom: "calc(100% + 12px)", top: "auto" }}'
);

// Fix date/time
content = content.replace(
  /\{new Date\(msg\.id\)\.toLocaleString\('en-US', \{ month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' \}\)\}/,
  "{new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}"
);

fs.writeFileSync(path, content);
console.log('Fixed successfully');
