
const fs = require('fs');
const path = 'c:\\Users\\T14s\\Desktop\\ai-website\\src\\components\\ChatWindow.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update Landing Page Mic Button
const landingMicRegex = /<button\s+type="button"\s+onClick=\{toggleListening\}\s+className=\{`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full \$\{isListening \? 'animate-pulse bg-red-500\/20 text-red-500' : ''\}`\}/;
content = content.replace(landingMicRegex, 
  '<button type="button" onClick={() => { setIsVoiceMessageMode(false); toggleListening(); }} className={`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full ${isListening && !isVoiceMessageMode ? \'animate-pulse bg-red-500/20 text-red-500\' : \'\'}`}'
);

// Update Landing Page Mic icon scale
content = content.replace(
  /<Mic size=\{20\} className=\{isListening \? 'scale-110' : ''\} \/>/,
  "<Mic size={20} className={isListening && !isVoiceMessageMode ? 'scale-110' : ''} />"
);

// Update Landing Page Submit Button (when empty)
const landingSubmitRegex = /<button\s+type="submit"\s+className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"\s+style=\{\{\s+background: isTemporary \? \(theme === 'dark' \? '#1c1c1e' : '#ffffff'\) : accentColor,\s+color: isTemporary \? \(theme === 'dark' \? '#ffffff' : '#000000'\) : '#ffffff',\s+\}\}\s+>\s+\{input\.trim\(\) \? <ArrowUp size=\{20\} strokeWidth=\{2\.5\} \/> : <AudioLines size=\{20\} strokeWidth=\{2\.5\} \/>\}\s+<\/button>/;

const landingSubmitReplacement = `<button 
                                type={input.trim() ? "submit" : "button"}
                                onClick={(e) => {
                                  if (!input.trim()) {
                                    e.preventDefault();
                                    if (isListening && isVoiceMessageMode) {
                                      recognitionRef.current?.stop();
                                    } else {
                                      setInput('');
                                      setIsVoiceMessageMode(true);
                                      toggleListening();
                                    }
                                  }
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                                style={{ 
                                  background: isTemporary ? (theme === 'dark' ? '#1c1c1e' : '#ffffff') : accentColor,
                                  color: isTemporary ? (theme === 'dark' ? '#ffffff' : '#000000') : '#ffffff',
                                }}
                              >
                                {input.trim() ? <ArrowUp size={20} strokeWidth={2.5} /> : <AudioLines size={20} strokeWidth={2.5} />}
                              </button>`;

content = content.replace(landingSubmitRegex, landingSubmitReplacement);

fs.writeFileSync(path, content);
console.log('Landing Page buttons updated successfully');
