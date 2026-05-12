'use client';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { 
  Send, Bot, User, Sparkles, Languages, Moon, Sun, Palette, Edit2, 
  Check, Copy, ThumbsUp, ThumbsDown, Share, Share2, RefreshCcw, MoreHorizontal, 
  AlertTriangle, ChevronDown, Mic, Square, ArrowUp, Plus, AudioLines, X,
  ChevronRight, Paperclip, Image, Lightbulb, Monitor, BookOpen, PenTool, Telescope, Cpu, Zap, Brain,
  ArrowDown, MessageSquareDashed, PenLine, Globe, RotateCw, UserPlus, Pin, Archive, Trash2, Volume2, VolumeX, GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGeminiResponse } from '@/utils/gemini';
import AuthModal from './AuthModal';

const AttachmentMenu = ({ isOpen, onClose, position = 'bottom' }) => {
  const [hoveredMore, setHoveredMore] = useState(false);
  
  const menuItems = [
    { icon: <Paperclip size={18} strokeWidth={2.2} />, text: 'Add photos & files' },
    { icon: <Image size={18} strokeWidth={2.2} />, text: 'Create image' },
    { icon: <Lightbulb size={18} strokeWidth={2.2} />, text: 'Thinking' },
    { icon: <Telescope size={18} strokeWidth={2.2} />, text: 'Deep research' },
    { icon: <MoreHorizontal size={18} strokeWidth={2.2} />, text: 'More' },
  ];

  const subMenuItems = [
    { icon: <PenTool size={16} strokeWidth={2.5} />, text: 'Canvas', color: '#ec4899' },
    { icon: <img src="https://github.githubassets.com/favicons/favicon.svg" className="w-4 h-4 object-contain invert" />, text: 'GitHub' },
    { icon: <img src="https://openai.com/favicon.ico" className="w-4 h-4 object-contain invert" />, text: 'OpenAI Platform' },
    { icon: <img src="https://www.scdn.co/mirror/static/icons/apple-touch-icon-57x57.png" className="w-4 h-4 object-contain rounded-full" />, text: 'Spotify' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: position === 'bottom' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: position === 'bottom' ? 10 : -10 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            style={{ 
              position: 'absolute',
              bottom: position === 'top' ? '100%' : 'auto',
              top: position === 'bottom' ? '100%' : 'auto',
              left: 0,
              marginTop: position === 'bottom' ? '14px' : 0,
              marginBottom: position === 'top' ? '14px' : 0,
              width: '264px',
              backgroundColor: 'var(--surface-1)',
              backdropFilter: 'blur(25px) saturate(1.8)',
              border: '1px solid var(--divider)',
              borderRadius: '22px',
              padding: '6px',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.2)',
              zIndex: 70
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, i) => (
              <div 
                key={i} 
                className="relative"
                onMouseEnter={() => item.text === 'More' && setHoveredMore(true)}
                onMouseLeave={() => item.text === 'More' && setHoveredMore(false)}
              >
                <button
                  onClick={(e) => {
                    if (!item.hasSubmenu) {
                      e.stopPropagation();
                      onClose();
                    }
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 14px',
                    color: 'var(--on-surface)',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--hover-overlay)';
                    e.currentTarget.style.color = 'var(--on-surface)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--on-surface-muted)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--on-surface-muted)', display: 'flex', transition: 'color 0.1s ease' }}>{item.icon}</span>
                    <span style={{ fontSize: '14.5px', fontWeight: '500', letterSpacing: '-0.1px' }}>{item.text}</span>
                  </div>
                </button>
                {i === 0 && <div style={{ height: '1px', background: 'var(--divider)', margin: '4px 10px' }} />}
              </div>
            ))}
          </motion.div>
      )}
    </AnimatePresence>
  );
};

const ActionButton = ({ icon, label, onClick, className = "" }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div className="relative group/tooltip flex items-center justify-center">
      <button 
        onClick={onClick} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`p-2 rounded-lg transition-all ${className}`}
        style={{ 
          background: isHovered ? 'var(--hover-overlay)' : 'transparent',
          color: isHovered ? 'var(--on-surface)' : 'var(--on-surface-muted)'
        }}
      >
        {icon}
      </button>
      <div 
        className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0"
      >
        {label}
      </div>
    </div>
  );
};

const MessageContent = ({ content, isUser }) => {
  // Regex to detect markdown images: ![alt](url)
  const parts = content.split(/(```[\s\S]*?```|!\[.*?\]\(.*?\))/g);
  
  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          const lang = match?.[1] || '';
          const code = match?.[2] || '';
          return (
            <div key={i} style={{ margin: '20px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', maxWidth: '100%', width: '100%' }}>
              <div style={{ background: '#1a1a1a', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 8 }}>{lang || 'Code'}</span>
                </div>
                <button 
                  onClick={(e) => {
                    navigator.clipboard.writeText(code.trim());
                    const span = e.currentTarget.querySelector('span');
                    const originalText = span.textContent;
                    span.textContent = 'Copied!';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
                    setTimeout(() => { 
                      if(span) span.textContent = originalText;
                      if(e.currentTarget) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }, 2000);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)',
                    border: 'none', color: '#ffffff', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                  onMouseLeave={e => { if(!e.currentTarget.querySelector('span')?.textContent?.includes('Copied')) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  title="Copy code"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>
              <pre style={{ padding: '20px 24px', background: '#0d0d0d', overflowX: 'auto', overflowY: 'hidden', maxWidth: '100%', margin: 0 }} className="custom-scrollbar">
                <code style={{ color: '#e4e4e7', fontSize: '13.5px', fontFamily: 'monospace', lineHeight: '1.7', whiteSpace: 'pre', display: 'block' }}>
                  {code.trim().split('\n').map((line, li) => {
                    // 1. Escape HTML first
                    const escapedLine = line
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;");

                    // 2. Single-pass syntax highlighting to avoid mangling
                    const highlightedLine = escapedLine.replace(
                      /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/.*$|\b(const|let|var|function|return|if|else|for|while|import|export|from|await|async|class|new|try|catch|finally|throw|default|interface|type|public|private|protected|static|readonly)\b|\b(true|false|null|undefined)\b|\b(\d+)\b)/g,
                      (match) => {
                        if (match.startsWith('"') || match.startsWith("'") || match.startsWith('`')) {
                          return `<span style="color:#98c379">${match}</span>`; // Green for strings
                        }
                        if (match.startsWith('//')) {
                          return `<span style="color:#5c6370;font-style:italic">${match}</span>`; // Gray for comments
                        }
                        if (['true', 'false', 'null', 'undefined'].includes(match) || /^\d+$/.test(match)) {
                          return `<span style="color:#d19a66">${match}</span>`; // Orange for literals/numbers
                        }
                        return `<span style="color:#c678dd">${match}</span>`; // Purple for keywords
                      }
                    );

                    return (
                      <div key={li} className="flex gap-4 min-w-0">
                        <span className="text-white/15 select-none text-right w-6 shrink-0 font-mono text-[12px]">{li + 1}</span>
                        <span className="min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }} />
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          );
        }
        
        // Handle Markdown Images
        if (part.startsWith('![')) {
          const match = part.match(/!\[(.*?)\]\((.*?)\)/);
          if (match) {
            const alt = match[1];
            const url = match[2];
            return (
              <div key={i} className="my-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20">
                <img 
                  src={url} 
                  alt={alt} 
                  className="w-full h-auto max-h-[500px] object-cover transition-all hover:scale-[1.01]" 
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="px-4 py-2 bg-white/5 flex justify-between items-center">
                  <span className="text-[11px] text-white/40 font-medium">{alt || 'Generated Image'}</span>
                  <button 
                    onClick={() => window.open(url, '_blank')}
                    className="p-1 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Share2 size={12} className="text-white/40" />
                  </button>
                </div>
              </div>
            );
          }
        }

        return (
          <p key={i} className={`leading-relaxed whitespace-pre-wrap ${isUser ? 'font-medium' : 'font-normal'}`}>
            {part}
          </p>
        );
      })}
    </div>
  );
};

const ChatWindow = () => {
  const { 
    messages, setMessages, theme, resolvedTheme, toggleTheme, updateChatTheme, 
    chatTheme, chats, setChats, activeChatId, setActiveChatId, 
    createNewChat, user, login, authOpen, setAuthOpen,
    fontSize, chatWidth, lineHeight, isSidebarOpen, isAuthLoading,
    profile, showLoggedIn, personalization, accentColor,
    deleteChat, archiveChat, aiModel, setAiModel
  } = useAppContext();

  const [mounted, setMounted] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [input, setInput] = useState('');
  const [greeting, setGreeting] = useState("What's on your mind?");
  const [hoveredChip, setHoveredChip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const getGreeting = () => {
    const hour = new Date().getHours();
    let welcome = "";
    if (hour < 12) welcome = "Good morning";
    else if (hour < 17) welcome = "Good afternoon";
    else welcome = "Good evening";

    const userName = profile?.displayName?.split(' ')[0] || '';
    const personalizedWelcome = userName ? `${welcome}, ${userName}.` : `${welcome}.`;

    const options = [
      personalizedWelcome,
      "Where should we begin?",
      "What's on the agenda today?",
      "Ready when you are.",
      "Share your vision with me.",
      "How can I assist you today?"
    ];
    return options[Math.floor(Math.random() * options.length)];
  };

  useEffect(() => {
    setGreeting(getGreeting());
  }, [activeChatId]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [copyingId, setCopyingId] = useState(null);
  const [ratings, setRatings] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showAttachmentMenuLanding, setShowAttachmentMenuLanding] = useState(false);
  const [showModelSwitcher, setShowModelSwitcher] = useState(false);
  const [showModelSwitcherLanding, setShowModelSwitcherLanding] = useState(false);
  const [hoveredPlus, setHoveredPlus] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const footerInputRef = useRef(null);
  const exploreScrollRef = useRef(null);
  const [isHeaderMoreOpen, setIsHeaderMoreOpen] = useState(false);
  const headerMoreRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMessageMode, setIsVoiceMessageMode] = useState(false);
  const voiceModeRef = useRef(false);
  const recognitionRef = useRef(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [activeMsgMoreId, setActiveMsgMoreId] = useState(null);
  const msgMoreRef = useRef(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioBarsRef = useRef([]);

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
    animationFrameRef.current = null;
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    if (audioBarsRef.current) {
      audioBarsRef.current.forEach(bar => { if (bar) bar.style.height = '4px'; });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInput(transcript);
        
        if (event.results[0].isFinal) {
          setIsListening(false);
          stopAudioVisualizer();
          
          // If we were in Voice Message mode, send it automatically
          if (voiceModeRef.current) {
            handleSend(null, transcript, true);
            setIsVoiceMessageMode(false);
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        stopAudioVisualizer();
      };
    }
    return () => stopAudioVisualizer();
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopAudioVisualizer();
      setIsListening(false);
    } else {
      if (voiceModeRef.current) setInput('');
      setIsListening(true);
      recognitionRef.current?.start();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        
        const updateVisualizer = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          
          if (audioBarsRef.current && audioBarsRef.current.length > 0) {
            for (let i = 0; i < audioBarsRef.current.length; i++) {
              const value = dataArray[i % dataArray.length] || 0; 
              // When silent (value is small), height should be very low (straight line look)
              const height = value < 10 ? 3 : 3 + (value / 255) * 28;
              if (audioBarsRef.current[i]) {
                audioBarsRef.current[i].style.height = `${height}px`;
                audioBarsRef.current[i].style.opacity = value < 10 ? '0.3' : '1';
              }
            }
          }
          animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();
      } catch (err) {
        console.error("Microphone access denied or error:", err);
      }
    }
  };

  const speak = (text, id = null) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (currentlySpeakingId === id && id !== null) {
        window.speechSynthesis.cancel();
        setCurrentlySpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Voice profile mapping
      const voiceId = personalization.voice || 'Kyra';
      let pitch = 1.0;
      let rate = 1.1;

      if (voiceId === 'Echo') { pitch = 0.85; rate = 1.0; }
      else if (voiceId === 'Onyx') { pitch = 0.75; rate = 0.95; }
      else if (voiceId === 'Shimmer') { pitch = 1.2; rate = 1.15; }
      else if (voiceId === 'Alloy') { pitch = 1.0; rate = 1.0; }
      else { pitch = 1.1; rate = 1.1; } // Kyra (Default)

      utterance.pitch = pitch;
      utterance.rate = rate;
      
      utterance.onstart = () => setCurrentlySpeakingId(id);
      utterance.onend = () => setCurrentlySpeakingId(null);
      utterance.onerror = () => setCurrentlySpeakingId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerMoreRef.current && !headerMoreRef.current.contains(e.target)) {
        setIsHeaderMoreOpen(false);
      }
      if (msgMoreRef.current && !msgMoreRef.current.contains(e.target)) {
        setActiveMsgMoreId(null);
      }
    };
    if (isHeaderMoreOpen || activeMsgMoreId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHeaderMoreOpen, activeMsgMoreId]);

  const scrollExplore = (direction) => {
    if (exploreScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      exploreScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Show button if we are not at the bottom (more than 100px away)
      setShowScrollButton(scrollTop < scrollHeight - clientHeight - 100);
    }
  };

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (showAttachmentMenu) setShowAttachmentMenu(false);
    };
    if (showAttachmentMenu) {
      window.addEventListener('click', handleGlobalClick);
    }
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [showAttachmentMenu]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (activeChatId && messages.length > 0 && !isTemporary) {
      setChats(prev => prev.map(chat =>
        chat.id === activeChatId ? { ...chat, messages } : chat
      ));
    }
  }, [messages, activeChatId, isTemporary]);

  useEffect(() => {
    if (activeChatId && chats.length > 0) {
      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat) {
        document.title = `${activeChat.title} | Kyra`;
      }
    } else if (!activeChatId) {
      document.title = 'New Chat | Kyra';
    }
  }, [activeChatId, chats]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const handleRate = (id, rating) => {
    setRatings(prev => prev[id] === rating ? { ...prev, [id]: undefined } : { ...prev, [id]: rating });
  };

  const abortControllerRef = useRef(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleActionClick = (action) => {
    let promptText = "";
    if (action.includes('image')) promptText = "Generate a professional image of ";
    else if (action.includes('Write')) promptText = "Help me write a ";
    else if (action.includes('Look')) promptText = "Search for ";
    else promptText = `Tell me about ${action} `;

    setInput(promptText);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
      if (footerInputRef.current) footerInputRef.current.focus();
    }, 50);
  };

  const handleSend = async (e, overrideInput, isVoice = false) => {
    if (e) e.preventDefault();
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const words = textToSend.split(' ').length;
    const duration = Math.max(1, Math.floor(words * 0.4)) + 's';

    const userMessage = { role: 'user', content: textToSend, id: Date.now(), isVoice, duration };
    const isFirstMessage = messages.length === 0;

    // If it's a voice message, just show the bubble — don't call AI
    if (isVoice) {
      if (isFirstMessage && !isTemporary) {
        const newChatId = Date.now().toString();
        const newChat = { id: newChatId, title: 'Voice Message', messages: [userMessage], timestamp: new Date().toISOString() };
        setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0)]);
        setActiveChatId(newChatId);
        localStorage.setItem('aura-active-chat-id', newChatId);
        if (typeof window !== 'undefined') window.history.pushState(null, '', `/c/${newChatId}`);
      }
      setMessages(prev => [...prev, userMessage]);
      if (!overrideInput) setInput('');
      return;
    }

    if (isFirstMessage && !isTemporary) {
      const newChatId = Date.now().toString();
      // Set a generic initial title to avoid "hello" etc. showing up
      const initialTitle = textToSend.trim().length > 30 
        ? textToSend.trim().slice(0, 30) + '...' 
        : "New Chat";
      
      const newChat = { id: newChatId, title: initialTitle, messages: [userMessage], timestamp: new Date().toISOString() };
      setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0)]);
      setActiveChatId(newChatId);
      localStorage.setItem('aura-active-chat-id', newChatId);
      if (typeof window !== 'undefined') window.history.pushState(null, '', `/c/${newChatId}`);
    }

    setMessages(prev => [...prev, userMessage]);
    const currentInput = textToSend;
    if (!overrideInput) setInput('');
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    // 1. Generate a smart title in parallel if it's the first message
    if (isFirstMessage && !isTemporary) {
      (async () => {
        try {
          const titlePrompt = `Analyze this user's first message and generate a highly descriptive, professional, and concise title (2-5 words) for the conversation. 
          First Message: "${currentInput}"
          
          Guidelines:
          - Identify the core topic, task, or intent of the message.
          - Format as a proper Title Case phrase (e.g., "Node.js Express API", "React Hooks Explanation", "Cart Page Issue").
          - If the message is a casual greeting ("hello", "hi", "hey"), return exactly "Greeting Exchange".
          - If the user's message is in Roman Urdu/Hindi (e.g., "message likh do"), return a professional title representing that (e.g., "Message Likhne Ki Request").
          - NEVER include quotes, markdown, or punctuation marks at the end. Return ONLY the title text.
          - Be specific, concise, and professional.`;
          
          const smartTitle = await getGeminiResponse(titlePrompt, []);
          const finalTitle = smartTitle.trim().replace(/["']/g, '');
          
          if (finalTitle && finalTitle.length < 50 && !finalTitle.includes("trouble connecting") && !finalTitle.includes("API Key") && finalTitle.toLowerCase() !== "new chat") {
            setChats(prev => prev.map(chat => {
              if (chat.messages && chat.messages.length > 0 && chat.messages[0].content === currentInput) {
                return { ...chat, title: finalTitle };
              }
              return chat;
            }));
          }
        } catch (titleError) {
          console.error("Failed to generate smart title:", titleError);
        }
      })();
    }

    try {
      let finalPrompt = currentInput;
      
      // Check if it's an image request and force Gemini to use the specific image format
      if (currentInput.toLowerCase().includes('generate an image') || currentInput.toLowerCase().includes('create an image') || currentInput.toLowerCase().includes('draw')) {
        finalPrompt = `${currentInput}. 
        IMPORTANT: To generate an image, you MUST return a markdown image link in this EXACT format: ![description](https://image.pollinations.ai/prompt/YOUR_PROMPT_HERE?width=1024&height=1024&nologo=true). 
        Replace YOUR_PROMPT_HERE with a highly detailed, descriptive, and artistic prompt based on the user's request. 
        The prompt in the URL must be URL-encoded (use %20 for spaces). 
        Do NOT add any other text unless necessary.`;
      }

      const aiMessageId = Date.now() + 1;
      setMessages(prev => [...prev, { role: 'ai', content: '', id: aiMessageId }]);
      
      const onUpdate = (text) => {
        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: text } : m));
      };

      const aiResponse = await getGeminiResponse(finalPrompt, messages, personalization, abortControllerRef.current.signal, onUpdate, aiModel);
      
      // Auto-speech removed: Voice only plays on user click now
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error(error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSaveEdit = (id) => {
    if (!editValue.trim()) return;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editValue } : m));
    setEditingId(null);
    setEditValue('');
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 min-w-0 flex flex-col relative h-screen bg-primary transition-colors duration-500" style={{ overflow: 'hidden' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-primary)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--divider)',
      }}>
        <div style={{ flex: 1, display: 'flex' }}>
          <button 
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '8px 12px', borderRadius: 12, color: 'var(--on-surface)',
              visibility: isSidebarOpen && isMobile ? 'hidden' : 'visible',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>Kyra</span>
            <ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', marginTop: 1 }} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {messages.length === 0 ? (
            <button 
              onClick={() => setIsTemporary(!isTemporary)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 12,
                background: isTemporary ? 'var(--on-surface)' : 'transparent',
                color: isTemporary ? 'var(--bg-primary)' : 'var(--on-surface-muted)',
                border: isTemporary ? 'none' : '1px solid var(--divider)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { if(!isTemporary) e.currentTarget.style.background = 'var(--hover-overlay)'; }}
              onMouseLeave={e => { if(!isTemporary) e.currentTarget.style.background = 'transparent'; }}
            >
              <MessageSquareDashed size={18} />
              <span>Temporary chat</span>
              {isTemporary && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bg-primary)', marginLeft: 2 }} />}
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {}}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-hover-overlay transition-colors text-[14px] font-medium text-on-surface"
              >
                <Share size={16} />
                <span>Share</span>
              </button>
              <div className="relative" ref={headerMoreRef}>
                <button 
                  onClick={() => setIsHeaderMoreOpen(!isHeaderMoreOpen)}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isHeaderMoreOpen ? 'bg-hover-overlay text-on-surface' : 'text-on-surface-muted hover:text-on-surface hover:bg-hover-overlay'}`}
                >
                  <MoreHorizontal size={18} />
                </button>
                
                <AnimatePresence>
                  {isHeaderMoreOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute top-full mt-2 z-[100]"
                      style={{ 
                        right: 0,
                        minWidth: '230px',
                        background: 'var(--surface-1)',
                        borderRadius: '20px',
                        padding: '6px',
                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
                        border: '1px solid var(--divider)',
                        transformOrigin: 'top right',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <button 
                        onClick={() => setIsHeaderMoreOpen(false)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 12, background: 'transparent',
                          border: 'none', color: 'var(--on-surface)', fontSize: 13.5,
                          fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <UserPlus size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                        <span style={{ whiteSpace: 'nowrap' }}>Start a group chat</span>
                      </button>
                      <button 
                        onClick={() => {
                          const chat = chats.find(c => c.id === activeChatId);
                          if (chat) {
                            setChats(prev => {
                              const updated = prev.map(c => c.id === chat.id ? { ...c, pinned: !c.pinned } : c);
                              return [...updated.filter(c => c.pinned), ...updated.filter(c => !c.pinned)];
                            });
                          }
                          setIsHeaderMoreOpen(false);
                        }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 12, background: 'transparent',
                          border: 'none', color: 'var(--on-surface)', fontSize: 13.5,
                          fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Pin size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                        <span style={{ whiteSpace: 'nowrap' }}>{chats.find(c => c.id === activeChatId)?.pinned ? 'Unpin chat' : 'Pin chat'}</span>
                      </button>
                      <button 
                        onClick={() => {
                          const chat = chats.find(c => c.id === activeChatId);
                          if (chat) { archiveChat(chat.id); createNewChat(); }
                          setIsHeaderMoreOpen(false);
                        }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 12, background: 'transparent',
                          border: 'none', color: 'var(--on-surface)', fontSize: 13.5,
                          fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Archive size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                        <span style={{ whiteSpace: 'nowrap' }}>Archive</span>
                      </button>
                      <div style={{ height: 1, background: 'var(--divider)', margin: '2px 4px' }} />
                      <button 
                        onClick={() => {
                          const chat = chats.find(c => c.id === activeChatId);
                          setDeleteConfirm({ open: true, id: activeChatId, name: chat?.title || 'this chat' });
                          setIsHeaderMoreOpen(false);
                        }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 12, background: 'transparent',
                          border: 'none', color: '#ef4444', fontSize: 13.5,
                          fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 size={16} style={{ color: '#ef4444', flexShrink: 0 }} strokeWidth={1.5} />
                        <span style={{ whiteSpace: 'nowrap' }}>Delete</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 relative bg-primary flex flex-col" style={{ overflow: 'hidden' }}>
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 custom-scrollbar flex flex-col"
          style={{ overflowY: 'auto', overflowX: 'hidden' }}
        >
          {/* Landing Page - Empty Chat */}
          {messages.length === 0 && (
            <div className="flex-1 mx-auto w-full flex flex-col items-center justify-center py-20 px-4" style={{ maxWidth: chatWidth === 'Wide' ? 'min(1000px, 100%)' : chatWidth === 'Full' ? '100%' : 'min(768px, 100%)' }}>
              <div className="w-full flex flex-col items-center justify-center text-center animate-fade-in px-4 space-y-12">
                {isTemporary ? (
                  <div className="flex flex-col items-center text-center space-y-3">
                    <h1 className="text-[40px] md:text-[52px] font-semibold tracking-tight leading-tight" style={{ color: 'var(--on-surface)' }}>Temporary Chat</h1>
                    <p className="text-lg max-w-2xl" style={{ color: 'var(--on-surface-muted)' }}>This chat won't appear in your chat history, and won't be used to train our models.</p>
                  </div>
                ) : (
                  <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-tight" style={{ color: 'var(--on-surface)' }}>{greeting}</h1>
                )}
                <div className="w-full max-w-[840px] relative group px-4">
                  <div className="w-full max-w-3xl relative flex items-center p-2 border border-divider shadow-2xl transition-all duration-300" 
                    style={{ 
                      background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
                      borderRadius: '32px', padding: '4px 6px 4px 16px',
                      borderColor: isTemporary ? 'transparent' : 'var(--divider)'
                    }}>
                    <div className="relative">
                      <button 
                        onMouseEnter={() => setHoveredPlus(true)} 
                        onMouseLeave={() => setHoveredPlus(false)} 
                        onClick={(e) => { e.stopPropagation(); setShowAttachmentMenuLanding(!showAttachmentMenuLanding); }} 
                        className="w-10 h-10 flex items-center justify-center rounded-full transition-all"
                        style={{ color: isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)') : 'var(--on-surface-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.background = isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)') : 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Plus size={22} />
                      </button>
                      <AttachmentMenu isOpen={showAttachmentMenuLanding} onClose={() => setShowAttachmentMenuLanding(false)} position="top" />
                    </div>
                    
                    <form onSubmit={handleSend} className="flex-1 flex items-center">
                      {isListening && isVoiceMessageMode ? (
                        <div className="flex-1 flex items-center pr-1 pl-4 h-12 animate-in fade-in duration-200">
                          <div className="flex-1 flex items-center h-full" style={{ gap: 3, padding: '0 8px' }}>
                            {Array(28).fill(0).map((_, i) => (
                              <div 
                                key={i} 
                                ref={el => { if(el) audioBarsRef.current[i] = el; }}
                                style={{
                                  width: 3,
                                  borderRadius: 4,
                                  background: 'var(--on-surface)',
                                  height: '3px',
                                  flexShrink: 0,
                                  transition: 'height 0.08s ease',
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => { toggleListening(); setInput(''); }}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                              style={{ background: 'var(--hover-overlay)', color: 'var(--on-surface-muted)' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.background = 'var(--hover-overlay-2)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-muted)'; e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                            >
                              <X size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                              type="button" 
                              onClick={(e) => { const currentInput = input; toggleListening(); handleSend(e, currentInput || "Voice message", true); }}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-all border-2"
                              style={{ 
                                borderColor: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                background: 'transparent'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Check size={18} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <input 
                            ref={inputRef}
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder={isLoading ? "Kyra is thinking..." : "Ask anything..."} 
                            className="w-full bg-transparent border-none outline-none px-4 text-[16px] py-3"
                            style={{ 
                              background: 'transparent', border: 'none', outline: 'none', 
                              color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)' 
                            }}
                          />
                          <div className="relative ml-1">
                            <button 
                              type="button"
                              onClick={() => setShowModelSwitcherLanding(!showModelSwitcherLanding)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-hover-overlay transition-all text-on-surface-muted hover:text-on-surface border border-divider/50"
                            >
                              {aiModel === 'GPT-4' && <Zap size={16} className="text-amber-500" />}
                              {aiModel === 'DeepSeek' && <Brain size={16} className="text-blue-500" />}
                              {aiModel === 'Llama' && <Cpu size={16} className="text-emerald-500" />}
                              {aiModel === 'Gemini' && <Sparkles size={16} className="text-indigo-500" />}
                              <span className="text-[13px] font-semibold">{aiModel}</span>
                              <ChevronDown size={14} className={showModelSwitcherLanding ? 'rotate-180 transition-transform' : 'transition-transform'} />
                            </button>
                            
                            <AnimatePresence>
                              {showModelSwitcherLanding && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  style={{
                                    position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                                    width: '180px', background: 'var(--surface-1)', borderRadius: '16px',
                                    border: '1px solid var(--divider)', padding: '6px', zIndex: 100,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                  }}
                                >
                                  {['Gemini', 'GPT-4', 'DeepSeek', 'Llama'].map(m => (
                                    <button
                                      key={m}
                                      onClick={() => { setAiModel(m); setShowModelSwitcherLanding(false); }}
                                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-hover-overlay transition-all text-left group"
                                    >
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-hover-overlay group-hover:bg-primary transition-colors">
                                        {m === 'GPT-4' && <Zap size={16} className="text-amber-500" />}
                                        {m === 'DeepSeek' && <Brain size={16} className="text-blue-500" />}
                                        {m === 'Llama' && <Cpu size={16} className="text-emerald-500" />}
                                        {m === 'Gemini' && <Sparkles size={16} className="text-indigo-500" />}
                                      </div>
                                      <span className={`text-[14px] font-medium ${aiModel === m ? 'text-on-surface' : 'text-on-surface-muted'}`}>{m}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          <div className="flex items-center gap-2 pr-1 ml-auto">
                            <button type="button" onClick={() => { setIsVoiceMessageMode(false); voiceModeRef.current = false; toggleListening(); }} className={`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full ${isListening && !isVoiceMessageMode ? 'animate-pulse bg-red-500/20 text-red-500' : ''}`}
                              style={{ 
                                color: isListening 
                                  ? '#ef4444' 
                                  : (isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)') : 'var(--on-surface-muted)') 
                              }}
                            >
                              <Mic size={20} className={isListening && !isVoiceMessageMode ? 'scale-110' : ''} />
                            </button>
                            
                            {isLoading ? (
                              <button onClick={handleStop} type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-hover-overlay text-on-surface"><Square size={16} fill="currentColor" /></button>
                            ) : (
                              <button 
                                type={input.trim() ? "submit" : "button"}
                                onClick={(e) => {
                                  if (!input.trim()) {
                                    e.preventDefault();
                                    if (isListening && isVoiceMessageMode) {
                                      recognitionRef.current?.stop();
                                    } else {
                                      setInput('');
                                      setIsVoiceMessageMode(true); voiceModeRef.current = true;
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
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                </div>


                <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                  <button 
                    onClick={() => setInput("Create an image of ")} 
                    className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all text-[14px] font-semibold shadow-lg active:scale-95 group/btn ${
                      input.startsWith("Create an image of ") 
                      ? 'bg-surface-3 border-divider' 
                      : 'bg-surface-1 border-divider'
                    }`}
                    style={{ 
                      borderColor: input.startsWith("Create an image of ") ? accentColor : '',
                      backgroundColor: input.startsWith("Create an image of ") ? `${accentColor}15` : ''
                    }}
                    onMouseEnter={(e) => { if(!input.startsWith("Create an image of ")) e.currentTarget.style.backgroundColor = `${accentColor}10`; }}
                    onMouseLeave={(e) => { if(!input.startsWith("Create an image of ")) e.currentTarget.style.backgroundColor = ''; }}
                  >
                    <Image size={18} style={{ color: accentColor }} />
                    <span>Create an image</span>
                  </button>

                  <button 
                    onClick={() => setInput("Help me write or edit ")} 
                    className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all text-[14px] font-semibold active:scale-95 group/btn ${
                      input.startsWith("Help me write or edit ") 
                      ? 'bg-surface-3 border-divider' 
                      : 'bg-transparent border-divider'
                    }`}
                    style={{ 
                      borderColor: input.startsWith("Help me write or edit ") ? accentColor : '',
                      backgroundColor: input.startsWith("Help me write or edit ") ? `${accentColor}15` : ''
                    }}
                    onMouseEnter={(e) => { if(!input.startsWith("Help me write or edit ")) e.currentTarget.style.backgroundColor = `${accentColor}10`; }}
                    onMouseLeave={(e) => { if(!input.startsWith("Help me write or edit ")) e.currentTarget.style.backgroundColor = ''; }}
                  >
                    <PenLine size={18} style={{ color: accentColor }} />
                    <span>Write or edit</span>
                  </button>

                  <button 
                    onClick={() => setInput("Look something up about ")} 
                    className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all text-[14px] font-semibold active:scale-95 group/btn ${
                      input.startsWith("Look something up about ") 
                      ? 'bg-surface-3 border-divider' 
                      : 'bg-transparent border-divider'
                    }`}
                    style={{ 
                      borderColor: input.startsWith("Look something up about ") ? accentColor : '',
                      backgroundColor: input.startsWith("Look something up about ") ? `${accentColor}15` : ''
                    }}
                    onMouseEnter={(e) => { if(!input.startsWith("Look something up about ")) e.currentTarget.style.backgroundColor = `${accentColor}10`; }}
                    onMouseLeave={(e) => { if(!input.startsWith("Look something up about ")) e.currentTarget.style.backgroundColor = ''; }}
                  >
                    <Globe size={18} style={{ color: accentColor }} />
                    <span>Look something up</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages View */}
          {messages.length > 0 && (
            <div
              className="mx-auto w-full flex flex-col"
              style={{
                maxWidth: chatWidth === 'Wide' ? 'min(1000px, 100%)' : chatWidth === 'Full' ? '100%' : 'min(768px, 100%)',
                padding: '80px 20px 20px',
              }}
            >
            {messages.map((msg) => (
              <div key={msg.id} className={`w-full flex flex-col gap-3 mb-12 group/msg ${msg.role === 'ai' ? 'mt-4' : ''}`}>
                {editingId === msg.id ? (
                  <div className="w-full max-w-[90%] ml-auto flex flex-col p-4 rounded-[28px] animate-fade-in shadow-2xl relative" 
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--divider)' }}>
                    <textarea
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-[15px] leading-relaxed resize-none min-h-[90px] px-2 py-1 custom-scrollbar"
                      style={{ color: 'var(--on-surface)' }}
                      placeholder="Edit message..."
                    />
                    <div className="flex justify-end items-center gap-3 mt-4 w-full">
                      <button 
                        onClick={() => { setEditingId(null); setEditValue(''); }}
                        className="px-7 py-2.5 text-sm font-bold transition-all rounded-full active:scale-95 border"
                        style={{ 
                          background: resolvedTheme === 'dark' ? 'transparent' : '#f5f5f7', 
                          color: 'var(--on-surface-muted)',
                          borderColor: 'var(--divider)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'transparent' : '#f5f5f7'}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveEdit(msg.id)}
                        className="px-8 py-2.5 text-sm font-bold rounded-full transition-all shadow-xl active:scale-95"
                        style={{ 
                          background: resolvedTheme === 'dark' ? '#ffffff' : '#000000', 
                          color: resolvedTheme === 'dark' ? '#000000' : '#ffffff',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`w-full flex ${msg.role === 'user' ? 'items-start flex-row-reverse' : msg.isVoice ? 'items-center justify-center' : 'items-start flex-row'}`}>
                      <motion.div 
                         initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                         animate={{ opacity: 1, scale: 1, y: 0 }} 
                         className={`relative transition-all duration-300 min-w-0 ${
                            msg.role === 'user' 
                              ? 'px-6 py-3 rounded-[24px] font-medium shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] border border-white/10' 
                              : 'px-0 py-2'
                          }`}
                         style={{ 
                           maxWidth: msg.isVoice ? '340px' : msg.role === 'user' ? '78%' : '100%',
                           overflow: 'hidden',
                           wordBreak: 'break-word',
                           background: msg.role === 'user' ? accentColor : 'transparent',
                           color: msg.role === 'user' ? '#ffffff' : 'var(--on-surface)',
                           border: msg.role === 'user' ? `1px solid ${accentColor}` : 'none',
                           borderRadius: msg.isVoice ? '20px' : msg.role === 'user' ? '24px 24px 4px 24px' : '0',
                           fontSize: fontSize === 'Small' ? '12.5px' : fontSize === 'Large' ? '16px' : '14px', 
                              lineHeight: '1.7',
                           boxShadow: msg.role === 'user' ? '0 10px 20px -5px rgba(0,0,0,0.2)' : 'none',
                           overflowWrap: 'anywhere',
                           padding: msg.isVoice ? '12px 16px' : (msg.role === 'user' ? undefined : '0px')
                         }}
                       >
                         {msg.isVoice ? (
                            <div className="flex items-center gap-3 min-w-[240px] max-w-full">
                              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 shrink-0">
                                <AudioLines size={18} className="text-white" />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[14px] font-semibold text-white tracking-tight">Voice chat ended</span>
                                <span className="text-[12px] text-white/70">{msg.duration || '0s'}</span>
                              </div>
                              <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                                {ratings[msg.id] !== 'bad' && (
                                  <button 
                                    onClick={() => handleRate(msg.id, ratings[msg.id] === 'good' ? undefined : 'good')}
                                    className={`p-1.5 rounded-lg transition-all ${ratings[msg.id] === 'good' ? 'text-green-400 bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                                  >
                                    <ThumbsUp size={13} fill={ratings[msg.id] === 'good' ? 'currentColor' : 'none'} />
                                  </button>
                                )}
                                {ratings[msg.id] !== 'good' && (
                                  <button 
                                    onClick={() => handleRate(msg.id, ratings[msg.id] === 'bad' ? undefined : 'bad')}
                                    className={`p-1.5 rounded-lg transition-all ${ratings[msg.id] === 'bad' ? 'text-red-400 bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                                  >
                                    <ThumbsDown size={13} fill={ratings[msg.id] === 'bad' ? 'currentColor' : 'none'} />
                                  </button>
                                )}
                                <div className="w-px h-4 bg-white/20 mx-1"></div>
                                <button 
                                  onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-red-500/20 transition-all"
                                >
                                  <X size={13} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <MessageContent content={msg.content} isUser={msg.role === 'user'} />
                          )}
                       </motion.div>
                    </div>
                    {!msg.isVoice && (
                       <div className={`w-full flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} px-1 mt-1 ${msg.role === 'ai' ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'} transition-opacity`}>
                         <div className="flex gap-1">
                          <ActionButton 
                            onClick={() => handleCopy(msg.content, msg.id)} 
                            label={copyingId === msg.id ? "Copied" : "Copy"} 
                            icon={copyingId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                          />
                          {msg.role === 'ai' && (
                            <>
                              {(ratings[msg.id] === 'good' || !ratings[msg.id]) && (
                                <ActionButton 
                                  onClick={() => handleRate(msg.id, 'good')} 
                                  label="Good Response" 
                                  className={ratings[msg.id] === 'good' ? 'text-green-500' : ''} 
                                  icon={<ThumbsUp size={14} fill={ratings[msg.id] === 'good' ? "currentColor" : "none"} />} 
                                />
                              )}
                              {(ratings[msg.id] === 'bad' || !ratings[msg.id]) && (
                                <ActionButton 
                                  onClick={() => handleRate(msg.id, 'bad')} 
                                  label="Bad Response" 
                                  className={ratings[msg.id] === 'bad' ? 'text-red-500' : ''} 
                                  icon={<ThumbsDown size={14} fill={ratings[msg.id] === 'bad' ? "currentColor" : "none"} />} 
                                />
                              )}
                              <ActionButton 
                                onClick={() => {}} 
                                label="Share" 
                                icon={<Share size={14} />} 
                              />
                              <ActionButton 
                                onClick={() => {}} 
                                label="Regenerate" 
                                icon={<RefreshCcw size={14} />} 
                              />
                              
                              <div className="relative" ref={activeMsgMoreId === msg.id ? msgMoreRef : null}>
                                <ActionButton 
                                  onClick={() => setActiveMsgMoreId(activeMsgMoreId === msg.id ? null : msg.id)} 
                                  label="More" 
                                  icon={<MoreHorizontal size={14} />} 
                                  className={activeMsgMoreId === msg.id ? 'bg-hover-overlay text-on-surface' : ''}
                                />
                                
                                <AnimatePresence>
                                  {activeMsgMoreId === msg.id && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                      className="absolute right-0 z-[100]"
                                      style={{
                                        bottom: "calc(100% + 6px)",
                                        top: "auto", 
                                        minWidth: '210px',
                                        background: 'var(--surface-1)',
                                        border: '1px solid var(--divider)',
                                        borderRadius: '16px',
                                        padding: '6px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                      }}
                                    >
                                      <div style={{ padding: '8px 14px 6px', fontSize: '11px', color: 'var(--on-surface-subtle)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                        {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                      </div>
                                      
                                      <button
                                        style={{
                                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                          padding: '9px 14px', borderRadius: 10, background: 'transparent',
                                          border: 'none', color: 'var(--on-surface)', fontSize: 13.5,
                                          fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                                          fontFamily: 'inherit', transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                      >
                                        <BookOpen size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                                        <span>View sources</span>
                                      </button>
                                      
                                      <button
                                        style={{
                                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                          padding: '9px 14px', borderRadius: 10, background: 'transparent',
                                          border: 'none', color: 'var(--on-surface)', fontSize: 13.5,
                                          fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                                          fontFamily: 'inherit', transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                      >
                                        <GitBranch size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                                        <span>Branch in new chat</span>
                                      </button>
                                      
                                      <button 
                                        onClick={() => { speak(msg.content, msg.id); setActiveMsgMoreId(null); }}
                                        style={{
                                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                          padding: '9px 14px', borderRadius: 10, background: 'transparent',
                                          border: 'none', color: 'var(--on-surface)', fontSize: 13.5,
                                          fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                                          fontFamily: 'inherit', transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                      >
                                        <Volume2 size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                                        <span>{currentlySpeakingId === msg.id ? "Stop Reading" : "Read aloud"}</span>
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </>
                          )}
                          {msg.role === 'user' && (
                            <ActionButton 
                              onClick={() => { setEditingId(msg.id); setEditValue(msg.content); }} 
                              label="Edit" 
                              icon={<Edit2 size={14} />} 
                            />
                          )}
                       </div>
                    </div>
                   )}
                  </>
                )}
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="px-0 py-4 flex gap-1.5 items-center"><span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span><span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span></div></div>}
            <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </main>


      {messages.length > 0 && (
        <footer style={{ padding: '16px 20px', background: 'var(--bg-primary)', position: 'relative' }}>
          <AnimatePresence>
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute left-1/2 -translate-x-1/2 z-[100]"
                style={{ 
                  bottom: 'calc(100% + 140px)', 
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: accentColor,
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: `0 8px 24px ${accentColor}55`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, opacity 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ArrowDown size={22} strokeWidth={3} />
              </button>
            )}
          </AnimatePresence>
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center gap-3 px-4">
            <div style={{ 
              width: '100%', display: 'flex', alignItems: 'center', 
              background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
              borderRadius: '26px', padding: '4px 6px 4px 16px', border: '1px solid var(--divider)',
              transition: 'all 0.3s ease'
            }}>
              <div className="relative">
                <button 
                  type="button"
                  onMouseEnter={() => setHoveredPlus(true)} 
                  onMouseLeave={() => setHoveredPlus(false)} 
                  onClick={(e) => { e.stopPropagation(); setShowAttachmentMenu(!showAttachmentMenu); }} 
                  className="w-9 h-9 flex items-center justify-center text-on-surface-muted hover:text-on-surface hover:bg-hover-overlay rounded-full transition-all"
                >
                  <Plus size={20} />
                </button>
                <AttachmentMenu isOpen={showAttachmentMenu} onClose={() => setShowAttachmentMenu(false)} position="top" />
              </div>
              <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                {isListening && isVoiceMessageMode ? (
                  <div className="flex-1 flex items-center pr-1 pl-4 h-[48px] animate-in fade-in duration-200">
                     <div className="flex-1 flex items-center h-full mr-4 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center pr-[120px] z-10 pointer-events-none">
                          <span className="text-[15px] font-medium truncate" style={{ color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)' }}>
                            {input || "Listening..."}
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-[200%] h-[2px] opacity-40 animate-slide-left" style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--on-surface-muted) 0, var(--on-surface-muted) 4px, transparent 4px, transparent 8px)' }}></div>
                        </div>
                        <div className="absolute right-0 flex items-center gap-[3px] pl-4 pr-2 h-full" style={{ background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)' }}>
                          {Array(15).fill(0).map((_, i) => (
                            <div 
                              key={i} 
                              ref={el => { if(el) audioBarsRef.current[i] = el; }}
                              className="w-[3px] rounded-full transition-all duration-75" 
                              style={{ background: 'var(--on-surface)', height: '4px' }}
                            ></div>
                          ))}
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => { toggleListening(); setInput(''); }}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                          style={{ background: 'var(--hover-overlay)', color: 'var(--on-surface-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.background = 'var(--hover-overlay-2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-muted)'; e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                        >
                          <X size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { const currentInput = input; toggleListening(); handleSend(e, currentInput || "Voice message", true); }}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all border-2"
                          style={{ 
                            borderColor: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                            color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                            background: 'transparent'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Check size={18} strokeWidth={3} />
                        </button>
                     </div>
                  </div>
                ) : (
                  <>
                    <input 
                      ref={footerInputRef}
                      type="text" 
                      value={input} 
                      onChange={(e) => { setInput(e.target.value); if(e.target.value.endsWith('/')) setShowAttachmentMenu(true); }} 
                      placeholder={isLoading ? "Kyra is thinking..." : "Ask anything..."} 
                      style={{ 
                        flex: 1, background: 'transparent', border: 'none', outline: 'none', 
                        color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)', fontSize: 16, padding: '12px 14px'
                      }} 
                    />
                    <div className="relative ml-1">
                      <button 
                        type="button"
                        onClick={() => setShowModelSwitcher(!showModelSwitcher)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-hover-overlay transition-all text-on-surface-muted hover:text-on-surface border border-divider/50"
                      >
                        {aiModel === 'GPT-4' && <Zap size={16} className="text-amber-500" />}
                        {aiModel === 'DeepSeek' && <Brain size={16} className="text-blue-500" />}
                        {aiModel === 'Llama' && <Cpu size={16} className="text-emerald-500" />}
                        {aiModel === 'Gemini' && <Sparkles size={16} className="text-indigo-500" />}
                        <span className="text-[13px] font-semibold">{aiModel}</span>
                        <ChevronDown size={14} className={showModelSwitcher ? 'rotate-180 transition-transform' : 'transition-transform'} />
                      </button>
                      
                      <AnimatePresence>
                        {showModelSwitcher && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            style={{
                              position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px',
                              width: '180px', background: 'var(--surface-1)', borderRadius: '16px',
                              border: '1px solid var(--divider)', padding: '6px', zIndex: 100,
                              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                            }}
                          >
                            {['Gemini', 'GPT-4', 'DeepSeek', 'Llama'].map(m => (
                              <button
                                key={m}
                                onClick={() => { setAiModel(m); setShowModelSwitcher(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-hover-overlay transition-all text-left group"
                              >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-hover-overlay group-hover:bg-primary transition-colors">
                                  {m === 'GPT-4' && <Zap size={16} className="text-amber-500" />}
                                  {m === 'DeepSeek' && <Brain size={16} className="text-blue-500" />}
                                  {m === 'Llama' && <Cpu size={16} className="text-emerald-500" />}
                                  {m === 'Gemini' && <Sparkles size={16} className="text-indigo-500" />}
                                </div>
                                <span className={`text-[14px] font-medium ${aiModel === m ? 'text-on-surface' : 'text-on-surface-muted'}`}>{m}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 2, marginLeft: 'auto' }}>
                         {!isLoading && (
                          <button 
                            type="button" 
                            onClick={() => { setIsVoiceMessageMode(false); voiceModeRef.current = false; toggleListening(); }}
                            className={`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full ${isListening && !isVoiceMessageMode ? 'animate-pulse bg-red-500/10' : ''}`}
                            style={{ 
                              color: isListening && !isVoiceMessageMode
                                ? '#ef4444' 
                                : (isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)') : 'var(--on-surface-muted)') 
                            }}
                          >
                            <Mic size={20} className={isListening && !isVoiceMessageMode ? 'scale-110' : ''} />
                          </button>
                        )}
                        
                         {isLoading ? (
                          <button 
                            type="button"
                            onClick={handleStop}
                            style={{ 
                              width: 40, height: 40, borderRadius: '50%', 
                              background: 'rgba(255,255,255,0.1)', 
                              color: '#fff', 
                              border: 'none', display: 'flex', alignItems: 'center', justifyItems: 'center', 
                              justifyContent: 'center',
                              transition: 'all 0.3s ease', cursor: 'pointer' 
                            }}
                          >
                            <Square size={16} fill="white" />
                          </button>
                        ) : (
                          <button 
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
                            style={{ 
                              width: 40, height: 40, borderRadius: '50%', 
                              background: isTemporary ? (theme === 'dark' ? '#1c1c1e' : '#ffffff') : accentColor, 
                              color: isTemporary ? (theme === 'dark' ? '#ffffff' : '#000000') : '#ffffff', 
                              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              transition: 'all 0.3s ease', cursor: 'pointer' 
                            }}
                          >
                            {input.trim() ? <ArrowUp size={20} strokeWidth={2.5} /> : <AudioLines size={20} strokeWidth={2.5} />}
                          </button>
                        )}
                      </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </footer>
      )}
      {deleteConfirm.open && typeof document !== 'undefined' && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface-1)', borderRadius: '24px', border: '1px solid var(--divider)', padding: '28px 28px 22px 28px', width: '420px' }}
            className="shadow-modal"
          >
            <h3 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, marginBottom: '14px', fontFamily: 'inherit' }}>Delete chat?</h3>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '14.5px', lineHeight: 1.55, marginBottom: '6px' }}>
              This will delete <strong style={{ color: 'var(--on-surface)', fontWeight: 700 }}>{deleteConfirm.name}</strong>.
            </p>
            <p style={{ color: 'var(--on-surface-subtle)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '24px' }}>
              Visit <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>settings</span> to delete any memories saved during this chat.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                style={{ padding: '6px 22px', borderRadius: '999px', background: 'var(--hover-overlay-2)', color: 'var(--on-surface-muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--divider)', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-overlay-2)'}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteChat(deleteConfirm.id);
                  setDeleteConfirm({ open: false, id: null, name: '' });
                  if (activeChatId === deleteConfirm.id) createNewChat();
                }}
                style={{ padding: '9px 22px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
};

export default ChatWindow;
