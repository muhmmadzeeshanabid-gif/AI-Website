
const fs = require('fs');
const path = 'c:\\Users\\T14s\\Desktop\\ai-website\\src\\components\\ChatWindow.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix double style prop and merge them
content = content.replace(
  /className="absolute right-0 z-\[100\]" style=\{\{ bottom: "calc\(100% \+ 12px\)", top: "auto" \}\}\s+style=\{\{/,
  'className="absolute right-0 z-[100]"\n                                      style={{\n                                        bottom: "calc(100% + 12px)",\n                                        top: "auto",'
);

// Fix exit animation y value
content = content.replace(
  /exit=\{\{ opacity: 0, scale: 0.95, y: 15 \}\}/,
  'exit={{ opacity: 0, scale: 0.95, y: 10 }}'
);

fs.writeFileSync(path, content);
console.log('Fixed double style and animation successfully');
