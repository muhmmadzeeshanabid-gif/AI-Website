
const fs = require('fs');
const path = 'c:\\Users\\T14s\\Desktop\\ai-website\\src\\components\\ChatWindow.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Use a ref for isVoiceMessageMode to avoid stale closures in useEffect
content = content.replace(
  /const \[isVoiceMessageMode, setIsVoiceMessageMode\] = useState\(false\);/,
  'const [isVoiceMessageMode, setIsVoiceMessageMode] = useState(false);\n  const voiceModeRef = useRef(false);'
);

// 2. Update voiceModeRef whenever state changes (or just use it directly)
// Actually, I'll update the onClick handlers to update both state and ref.

// 3. Fix onresult to use the ref
content = content.replace(
  /\/\/ If we were in Voice Message mode, send it automatically\s+if \(isVoiceMessageMode\) \{/,
  '// If we were in Voice Message mode, send it automatically\n          if (voiceModeRef.current) {'
);

// 4. Update onClick handlers to set voiceModeRef
// For main Chat footer
content = content.replace(
  /onClick=\{\(\) => \{ setIsVoiceMessageMode\(false\); toggleListening\(\); \}\}/g,
  'onClick={() => { setIsVoiceMessageMode(false); voiceModeRef.current = false; toggleListening(); }}'
);

// For AudioLines button
content = content.replace(
  /setIsVoiceMessageMode\(true\);/,
  'setIsVoiceMessageMode(true); voiceModeRef.current = true;'
);

// 5. Fix Overlay visibility: Only show when isVoiceMessageMode is true
content = content.replace(
  /\{isListening \? \(/g,
  '{isListening && isVoiceMessageMode ? ('
);

// 6. Fix toggleListening to NOT clear input if it's Dictate mode
content = content.replace(
  /const toggleListening = async \(\) => \{\s+if \(isListening\) \{/,
  'const toggleListening = async () => {\n    if (isListening) {'
);

// Remove the setInput('') if it's not voice message mode
// Wait, I see line 390: setInput('');
// I'll make it conditional.
content = content.replace(
  /\} else \{\s+setInput\(''\);/,
  '} else {\n      if (voiceModeRef.current) setInput(\'\');'
);

fs.writeFileSync(path, content);
console.log('Voice logic fixed with refs and conditional overlay successfully');
