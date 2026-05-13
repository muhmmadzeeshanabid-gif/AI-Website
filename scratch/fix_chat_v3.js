
const fs = require('fs');
const path = 'c:\\Users\\T14s\\Desktop\\ai-website\\src\\components\\ChatWindow.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix spacing: 12px -> 6px
content = content.replace(
  /bottom: "calc\(100% \+ 12px\)"/,
  'bottom: "calc(100% + 6px)"'
);

// 2. Fix click outside dependency
content = content.replace(
  /\}, \[isHeaderMoreOpen\]\);/,
  '}, [isHeaderMoreOpen, activeMsgMoreId]);'
);

fs.writeFileSync(path, content);
console.log('Fixed spacing and click-outside dependency successfully');
