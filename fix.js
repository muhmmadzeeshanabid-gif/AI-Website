const fs = require('fs');
const path = 'c:/Users/T14s/Desktop/ai-website/src/components/ChatWindow.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Customized Kyra
content = content.replace(
  /<button className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-white\/5 transition-colors text-left">[\s\S]*?Customized Kyra[\s\S]*?<\/button>/,
  `<button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                    <Settings size={18} className="text-on-surface-muted" />
                    <span className="text-[14px] font-medium text-on-surface">Customized Kyra</span>
                  </button>`
);

// Replace Delete group
content = content.replace(
  /<button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white\/5 transition-colors text-left">\s*<Trash2 size=\{18\} style=\{\{ color: '#ef4444' \}\} \/>\s*<span className="text-\[14px\] font-medium" style=\{\{ color: '#ef4444' \}\} onClick=\{\(\) => \{ setIsDeleteConfirmOpen\(true\); setIsGroupChatMenuOpen\(false\); \}\}>Delete group<\/span>\s*<\/button>/,
  `<button 
                    className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                    onClick={() => { setIsDeleteConfirmOpen(true); setIsGroupChatMenuOpen(false); }}
                  >
                    <Trash2 size={18} style={{ color: '#ef4444' }} />
                    <span className="text-[14px] font-medium" style={{ color: '#ef4444' }}>Delete group</span>
                  </button>`
);

fs.writeFileSync(path, content);
console.log('Done');
