'use client';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { 
  Send, Bot, User, Sparkles, Languages, Moon, Sun, Palette, Edit2, 
  Check, Copy, ThumbsUp, ThumbsDown, Share2, RefreshCcw, MoreHorizontal, 
  AlertTriangle, ChevronDown, Mic, Square, ArrowUp, Plus, AudioLines,
  ChevronRight, Paperclip, Image, Lightbulb, Monitor, BookOpen, PenTool,
  ArrowDown, MessageSquareDashed
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
    { icon: <Monitor size={18} strokeWidth={2.2} />, text: 'Deep research' },
    { icon: <MoreHorizontal size={18} strokeWidth={2.2} />, text: 'More', hasSubmenu: true },
    { icon: <BookOpen size={18} strokeWidth={2.2} />, text: 'Projects', hasSubmenu: true },
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
              backgroundColor: 'rgba(23, 23, 23, 0.96)',
              backdropFilter: 'blur(25px) saturate(1.8)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: '22px',
              padding: '6px',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
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
                    padding: '10px 12px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.55)', display: 'flex', transition: 'color 0.1s ease' }}>{item.icon}</span>
                    <span style={{ fontSize: '14.5px', fontWeight: '500', letterSpacing: '-0.1px' }}>{item.text}</span>
                  </div>
                  {item.hasSubmenu && <ChevronRight size={14} style={{ opacity: 0.25 }} />}
                </button>
                
                {item.text === 'More' && hoveredMore && (
                  <motion.div
                    initial={{ opacity: 0, x: -8, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    style={{
                      position: 'absolute',
                      left: '100%',
                      top: '-6px', 
                      marginLeft: '12px',
                      width: '210px',
                      backgroundColor: 'rgba(23, 23, 23, 0.96)',
                      backdropFilter: 'blur(25px) saturate(1.8)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '20px',
                      padding: '6px',
                      boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
                      zIndex: 80
                    }}
                  >
                    {subMenuItems.map((sub, si) => (
                      <button
                        key={si}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          color: 'rgba(255, 255, 255, 0.85)',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                          textAlign: 'left'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                        }}
                      >
                        <span style={{ color: sub.color || 'rgba(255, 255, 255, 0.5)', display: 'flex', width: '20px', justifyContent: 'center' }}>{sub.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{sub.text}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
                {i === 0 && <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '4px 10px' }} />}
                {item.text === 'More' && <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '4px 10px' }} />}
              </div>
            ))}
          </motion.div>
      )}
    </AnimatePresence>
  );
};

const ActionButton = ({ icon, label, onClick, className = "" }) => (
  <div className="relative group/tooltip flex items-center justify-center">
    <button 
      onClick={onClick} 
      className={`p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all ${className}`}
    >
      {icon}
    </button>
    <div 
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-2 bg-[#000000] text-white opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-white/10 shadow-2xl translate-y-1 group-hover/tooltip:translate-y-0 rounded-none"
      style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.02em' }}
    >
      {label}
    </div>
  </div>
);

const MessageContent = ({ content, isUser }) => {
  // Regex to detect markdown images: ![alt](url)
  const parts = content.split(/(```[\s\S]*?```|!\[.*?\]\(.*?\))/g);
  
  return (
    <div className="space-y-2 overflow-hidden">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          const lang = match?.[1] || '';
          const code = match?.[2] || '';
          return (
            <div key={i} className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg">
              {lang && (
                <div className="bg-[#1e1e1e] px-4 py-1.5 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{lang}</span>
                </div>
              )}
              <pre className="p-4 bg-[#0d0d0d] overflow-x-auto custom-scrollbar">
                <code className="text-[13px] font-mono text-zinc-300 leading-relaxed block">
                  {code.trim()}
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
    messages, setMessages, theme, toggleTheme, updateChatTheme, 
    chatTheme, chats, setChats, activeChatId, setActiveChatId, 
    createNewChat, user, login, authOpen, setAuthOpen,
    fontSize, chatWidth, lineHeight, isSidebarOpen, isAuthLoading,
    profile, showLoggedIn, personalization, accentColor
  } = useAppContext();

  const [mounted, setMounted] = useState(false);
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
  const [hoveredPlus, setHoveredPlus] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const footerInputRef = useRef(null);
  const exploreScrollRef = useRef(null);

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
        document.title = `${activeChat.title} | Aura AI`;
      }
    } else if (!activeChatId) {
      document.title = 'New Chat | Aura AI';
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

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, id: Date.now() };
    const isFirstMessage = messages.length === 0;

    if (isFirstMessage && !isTemporary) {
      const newChatId = Date.now().toString();
      // Set a generic initial title to avoid "hello" etc. showing up
      const initialTitle = input.trim().length > 30 
        ? input.trim().slice(0, 30) + '...' 
        : "New Chat";
      
      const newChat = { id: newChatId, title: initialTitle, messages: [userMessage], timestamp: new Date().toISOString() };
      setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0)]);
      setActiveChatId(newChatId);
      localStorage.setItem('aura-active-chat-id', newChatId);
      if (typeof window !== 'undefined') window.history.pushState(null, '', `/c/${newChatId}`);
    }

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    // 1. Generate a smart title in parallel if it's the first message
    if (isFirstMessage && !isTemporary) {
      (async () => {
        try {
          const titlePrompt = `Analyze this user's first message and generate a highly descriptive, professional, and meaningful title (2-4 words) for the conversation. 
          First Message: "${currentInput}"
          
          Guidelines:
          - If it's a greeting like "hello", "hi", "hey", use "Greeting Exchange" or "Initial Contact".
          - If it's a question, summarize the topic (e.g., "Coding Help", "Health Advice").
          - Avoid just repeating the user's words unless they are already descriptive.
          - Return ONLY the title text without any quotes or punctuation.`;
          
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

      const response = await getGeminiResponse(finalPrompt, messages, personalization, abortControllerRef.current.signal);
      const aiMessage = { role: 'ai', content: response, id: Date.now() + 1 };
      setMessages(prev => [...prev, aiMessage]);
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
    <div className="flex-1 flex flex-col relative h-screen overflow-hidden bg-primary transition-colors duration-500">
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56, position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-primary)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--divider)',
      }}>
        <div style={{ flex: 1, display: 'flex' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '6px 10px', borderRadius: 10, color: 'var(--on-surface)',
            visibility: isSidebarOpen && isMobile ? 'hidden' : 'visible'
          }}>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>Aura AI</span>
            <ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', marginTop: 1 }} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {messages.length === 0 ? (
            <div className="flex items-center gap-2">
              {isTemporary && (
                <button 
                  onClick={() => setIsTemporary(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[12px] font-medium transition-all mr-2"
                >
                  Turn off temporary chat
                </button>
              )}
              <ActionButton 
                onClick={() => setIsTemporary(!isTemporary)}
                label={isTemporary ? "Turn off" : "Temporary"}
                className={isTemporary ? 'text-white bg-white/10' : ''}
                icon={<MessageSquareDashed size={20} />}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <ActionButton 
                onClick={() => {}}
                label="Share"
                icon={<Share2 size={16} />}
              />
              <ActionButton 
                onClick={() => {}}
                label="More"
                icon={<MoreHorizontal size={18} />}
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 relative bg-primary overflow-hidden flex flex-col">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-16"
        >
          <div className="flex-1 mx-auto w-full flex flex-col items-center justify-center py-20 px-4" style={{ maxWidth: chatWidth === 'Wide' ? '1000px' : chatWidth === 'Full' ? '100%' : '768px' }}>
            {messages.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center text-center animate-fade-in px-4 space-y-12">
                {isTemporary ? (
                  <div className="flex flex-col items-center text-center space-y-3">
                    <h1 className="text-[40px] md:text-[52px] font-semibold tracking-tight text-white leading-tight">Temporary Chat</h1>
                    <p className="text-white/40 text-lg max-w-2xl">This chat won't appear in your chat history, and won't be used to train our models.</p>
                  </div>
                ) : (
                  <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight text-white leading-tight">{greeting}</h1>
                )}
                <div className="w-full max-w-[840px] relative group px-4">
                  <div className="w-full relative flex items-center p-2 border border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]" style={{ background: '#212121', borderRadius: '32px' }}>
                    <div className="flex items-center gap-1 pl-2">
                      <button className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"><Plus size={20} strokeWidth={2.5} /></button>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-all">
                        <Image size={18} strokeWidth={2.2} />
                        <span className="text-[14px] font-medium">Image</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all">
                        <Monitor size={16} />
                        <span className="text-[14px] font-medium">Auto</span>
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSend} className="flex-1 flex items-center">
                      <input 
                        ref={inputRef}
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder={isLoading ? "Aura is thinking..." : "Describe or edit an image"} 
                        className="w-full bg-transparent border-none outline-none text-white px-4 text-[17px] py-5 placeholder:text-white/20"
                        style={{ background: 'transparent', border: 'none', outline: 'none' }}
                      />
                      <div className="flex items-center gap-2 pr-1">
                        <button type="button" className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors"><Mic size={20} /></button>
                        
                        {isLoading ? (
                          <button onClick={handleStop} type="button" className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white"><Square size={16} fill="white" /></button>
                        ) : (
                          <button 
                            type="submit" 
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                            style={{ 
                              background: '#f15a24',
                              color: '#fff',
                              boxShadow: '0 8px 16px rgba(241, 90, 36, 0.2)'
                            }}
                          >
                            <AudioLines size={24} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6 mt-12 w-full max-w-5xl">
                  <div className="w-full flex items-center justify-between px-6">
                    <h2 className="text-white text-[17px] font-bold tracking-tight">Explore ideas</h2>
                    <div className="flex items-center gap-4">
                       <span className="text-[13px] text-white/40 font-bold hover:text-white/60 cursor-pointer transition-colors border-b border-white/5 pb-0.5">What's new</span>
                       <div className="flex gap-2">
                          <button onClick={() => scrollExplore('left')} className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white/60 transition-all bg-white/5"><ChevronRight size={16} className="rotate-180" /></button>
                          <button onClick={() => scrollExplore('right')} className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white/60 transition-all bg-white/5"><ChevronRight size={16} /></button>
                       </div>
                    </div>
                  </div>
                  
                  <div 
                    ref={exploreScrollRef}
                    className="w-full flex items-center gap-4 px-6 overflow-x-auto pb-4 no-scrollbar custom-scrollbar"
                  >
                    {/* Upload Card */}
                    <button className="group/card relative min-w-[180px] h-[220px] rounded-[32px] overflow-hidden bg-[#1a1a1a] border border-white/5 transition-all hover:border-white/10 flex flex-col items-center justify-center gap-3">
                       <div className="w-12 h-12 rounded-full flex items-center justify-center text-white/40 group-hover/card:text-white transition-colors">
                          <Plus size={32} strokeWidth={1.5} />
                       </div>
                       <span className="absolute bottom-6 left-6 text-white/40 text-xs font-bold">Upload a photo</span>
                    </button>

                    {/* Scribble Card */}
                    <button onClick={() => handleActionClick('Scribble')} className="group/card relative min-w-[180px] h-[220px] rounded-[32px] overflow-hidden border border-white/5 transition-all hover:border-white/10 shadow-2xl">
                       <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400" className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                       <span className="absolute bottom-6 left-6 text-white text-[13px] font-bold">Scribble</span>
                    </button>

                    {/* Chibi Card */}
                    <button onClick={() => handleActionClick('Chibi stickers')} className="group/card relative min-w-[180px] h-[220px] rounded-[32px] overflow-hidden border border-white/5 transition-all hover:border-white/10 shadow-2xl">
                       <img src="https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=400" className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                       <span className="absolute bottom-6 left-6 text-white text-[13px] font-bold">Chibi stickers</span>
                    </button>

                    {/* Makeup Card */}
                    <button onClick={() => handleActionClick('Makeup guide')} className="group/card relative min-w-[180px] h-[220px] rounded-[32px] overflow-hidden border border-white/5 transition-all hover:border-white/10 shadow-2xl">
                       <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400" className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                       <span className="absolute bottom-6 left-6 text-white text-[13px] font-bold">Makeup guide</span>
                    </button>

                    {/* Cross-section Card */}
                    <button onClick={() => handleActionClick('Cross-section')} className="group/card relative min-w-[180px] h-[220px] rounded-[32px] overflow-hidden border border-white/5 transition-all hover:border-white/10 shadow-2xl">
                       <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400" className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                       <span className="absolute bottom-6 left-6 text-white text-[13px] font-bold">Cross-section</span>
                    </button>
                    
                    {/* Additional Card for scrolling */}
                    <button onClick={() => handleActionClick('Game design')} className="group/card relative min-w-[180px] h-[220px] rounded-[32px] overflow-hidden border border-white/5 transition-all hover:border-white/10 shadow-2xl">
                       <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400" className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                       <span className="absolute bottom-6 left-6 text-white text-[13px] font-bold">Game design</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="w-full flex flex-col gap-2 mb-8 group/msg">
                {editingId === msg.id ? (
                  <div className="w-full max-w-[85%] ml-auto flex flex-col p-5 bg-[#2f2f2f] rounded-[32px] border border-white/5 animate-fade-in shadow-2xl relative">
                    <textarea
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-white text-[16px] leading-relaxed resize-none min-h-[100px] custom-scrollbar"
                      placeholder="Edit message..."
                    />
                    <div className="flex justify-end items-center gap-2 mt-2">
                      <button 
                        onClick={() => { setEditingId(null); setEditValue(''); }}
                        className="px-4 py-2 text-white/60 hover:text-white text-sm font-semibold transition-all rounded-full hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSaveEdit(msg.id)}
                        className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-all shadow-md active:scale-95"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`w-full flex items-start ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        className={`max-w-[85%] px-6 py-3 rounded-[24px] relative transition-all duration-300 ${
                          msg.role === 'user' 
                            ? 'ml-12 font-medium shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] border border-white/10' 
                            : 'text-zinc-100 mr-12 shadow-lg'
                        }`} 
                        style={{ 
                          background: msg.role === 'user' ? accentColor : '#212121',
                          color: msg.role === 'user' ? '#ffffff' : undefined,
                          border: msg.role === 'user' ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                          fontSize: fontSize === 'Small' ? '12.5px' : fontSize === 'Large' ? '16px' : '14px', 
                          lineHeight: '1.5',
                          boxShadow: msg.role === 'user' ? '0 10px 20px -5px rgba(0,0,0,0.2)' : '0 10px 20px -5px rgba(0,0,0,0.1)'
                        }}
                      >
                        <MessageContent content={msg.content} isUser={msg.role === 'user'} />
                      </motion.div>
                    </div>
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
                                label="Regenerate" 
                                icon={<RefreshCcw size={14} />} 
                              />
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
                  </>
                )}
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-[#212121] p-4 rounded-2xl rounded-tl-none flex gap-1"><span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-200"></span><span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-400"></span></div></div>}
            <div ref={messagesEndRef} />
          </div>
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
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-3">
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', background: '#212121', borderRadius: '26px', padding: '4px 6px 4px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="relative">
                <button onMouseEnter={() => setHoveredPlus(true)} onMouseLeave={() => setHoveredPlus(false)} onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"><Plus size={20} /></button>
                <AttachmentMenu isOpen={showAttachmentMenu} onClose={() => setShowAttachmentMenu(false)} position="top" />
              </div>
              <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <input 
                  ref={footerInputRef}
                  type="text" 
                  value={input} 
                  onChange={(e) => { setInput(e.target.value); if(e.target.value.endsWith('/')) setShowAttachmentMenu(true); }} 
                  placeholder={isLoading ? "Aura is thinking..." : "Ask anything..."} 
                  style={{ 
                    flex: 1, background: 'transparent', border: 'none', outline: 'none', 
                    color: '#fff', fontSize: 16, padding: '12px 14px'
                  }} 
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 2 }}>
                  {!isLoading && <button type="button" className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors"><Mic size={20} /></button>}
                  
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
                    <button type="submit" style={{ 
                      width: 40, height: 40, borderRadius: '50%', 
                      background: input.trim() ? accentColor : '#1e1e1e', 
                      color: input.trim() ? '#fff' : 'rgba(255,255,255,0.6)', 
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      transition: 'all 0.3s ease', cursor: 'pointer' 
                    }}>
                      {input.trim() ? <ArrowUp size={20} strokeWidth={2.5} /> : <AudioLines size={20} strokeWidth={2.5} />}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </footer>
      )}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
};

export default ChatWindow;
