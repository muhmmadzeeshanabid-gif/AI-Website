'use client';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { 
  Send, Bot, User, Sparkles, Languages, Moon, Sun, Palette, Edit2, 
  Check, Copy, ThumbsUp, ThumbsDown, Share, Share2, RefreshCcw, MoreHorizontal, MoreVertical,
  AlertTriangle, ChevronDown, Mic, Square, ArrowUp, Plus, AudioLines, X, Menu, SquarePen,
  ChevronRight, Paperclip, Image, Lightbulb, Monitor, BookOpen, PenTool, Telescope, Cpu, Zap, Brain,
  ArrowDown, MessageSquareDashed, PenLine, Globe, RotateCw, UserPlus, Users, Pin, Archive, Trash2, Volume2, VolumeX, GitBranch, Settings, SmilePlus, Reply, Flag, ChevronLeft, LogOut,
  Code, Compass, FileText, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGeminiResponse } from '@/utils/gemini';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, onSnapshot, getDoc } from 'firebase/firestore';
import AuthModal from './AuthModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const CodeCopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${copied ? '#4ade80' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#4ade80' : '#ffffff', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.borderColor = copied ? '#4ade80' : 'rgba(255,255,255,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = copied ? '#4ade80' : 'rgba(255,255,255,0.1)';
      }}
      title="Copy code"
    >
      {copied ? <Check size={13} style={{ color: '#4ade80' }} /> : <Copy size={13} style={{ color: '#ffffff' }} />}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
};

const TypewriterMessage = ({ content, isUser = false, onDone }) => {
  const { resolvedTheme } = useAppContext();
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);
  const rafRef = useRef(null);
  // User messages type faster — feel more like real-time chat
  const CHARS_PER_FRAME = isUser ? 5 : 3;

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed('');
    const animate = () => {
      idxRef.current = Math.min(idxRef.current + CHARS_PER_FRAME, content.length);
      setDisplayed(content.slice(0, idxRef.current));
      if (idxRef.current < content.length) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [content]);

  if (isUser) {
    return <p className="leading-relaxed whitespace-pre-wrap font-medium">{displayed}</p>;
  }

  return (
    <div className="markdown-content w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');
            return !inline ? (
              <div style={{ margin: '20px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: resolvedTheme === 'dark' ? '0 8px 32px rgba(0,0,0,0.25)' : 'none', maxWidth: '100%', width: '100%' }}>
                <div style={{ background: '#1a1a1a', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 8 }}>{lang || 'Code'}</span>
                  </div>
                  <CodeCopyButton code={codeContent} />
                </div>
                <SyntaxHighlighter style={vscDarkPlus} language={lang || 'javascript'} PreTag="div" customStyle={{ margin: 0, padding: '20px 24px', background: '#0d0d0d', fontSize: '13.5px', lineHeight: '1.7' }} showLineNumbers={false} {...props}>{codeContent}</SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[0.9em] border border-white/5" {...props}>{children}</code>
            );
          },
          p({ node, children }) { return <div className="mb-4 last:mb-0 leading-relaxed text-on-surface/90">{children}</div>; },
          h1({ children }) { return <h1 className="text-2xl font-bold mb-4 mt-6 text-on-surface">{children}</h1>; },
          h2({ children }) { return <h2 className="text-xl font-bold mb-3 mt-5 text-on-surface">{children}</h2>; },
          h3({ children }) { return <h3 className="text-lg font-bold mb-2 mt-4 text-on-surface">{children}</h3>; },
          ul({ children }) { return <ul>{children}</ul>; },
          ol({ children }) { return <ol>{children}</ol>; },
          li({ children }) { return <li>{children}</li>; },
          blockquote({ children }) { return <blockquote className="border-l-4 border-accent-color/40 bg-accent-color/5 px-4 py-2 my-4 rounded-r-lg italic text-on-surface/80">{children}</blockquote>; },
          hr() { return <hr className="my-8 border-t border-white/5" />; },
          table({ children }) { return <div className="overflow-x-auto my-6 rounded-xl border border-divider"><table className="w-full text-left border-collapse">{children}</table></div>; },
          th({ children }) { return <th className="px-4 py-3 bg-surface-2 font-bold border-b border-divider">{children}</th>; },
          td({ children }) { return <td className="px-4 py-3 border-b border-divider last:border-b-0">{children}</td>; },
          a({ children, href }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-color hover:underline font-medium">{children}</a>; }
        }}
      >
        {displayed}
      </ReactMarkdown>
    </div>
  );
};

const MessageContent = ({ content, isUser }) => {
  const { resolvedTheme } = useAppContext();
  
  if (isUser) {
    return <p className="leading-relaxed whitespace-pre-wrap font-medium">{content}</p>;
  }

  return (
    <div className="markdown-content w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');
            
            return !inline ? (
              <div style={{ margin: '20px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: resolvedTheme === 'dark' ? '0 8px 32px rgba(0,0,0,0.25)' : 'none', maxWidth: '100%', width: '100%' }}>
                <div style={{ background: '#1a1a1a', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 8 }}>{lang || 'Code'}</span>
                  </div>
                  <CodeCopyButton code={codeContent} />
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={lang || 'javascript'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '20px 24px',
                    background: '#0d0d0d',
                    fontSize: '13.5px',
                    lineHeight: '1.7',
                  }}
                  showLineNumbers={false}
                  {...props}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[0.9em] border border-white/5" {...props}>
                {children}
              </code>
            );
          },
          img({ node, ...props }) {
            return (
              <div className="my-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 group">
                <img 
                  {...props} 
                  className="w-full h-auto max-h-[600px] object-cover transition-all duration-500 hover:scale-[1.02]" 
                  loading="lazy"
                />
                <div className="px-4 py-2 bg-white/5 flex justify-between items-center">
                  <span className="text-[11px] text-white/40 font-medium">{props.alt || 'Generated Content'}</span>
                  <button 
                    onClick={() => window.open(props.src, '_blank')}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Share2 size={12} className="text-white/40" />
                  </button>
                </div>
              </div>
            );
          },
          p({ node, children }) {
            return <div className="mb-4 last:mb-0 leading-relaxed text-on-surface/90">{children}</div>;
          },
          hr({ node, ...props }) {
            return <hr style={{ border: 'none', borderTop: '1px solid var(--divider)', margin: '24px 0', opacity: 0.4 }} {...props} />;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6 text-on-surface">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5 text-on-surface">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-4 text-on-surface">{children}</h3>;
          },
          ul({ children }) {
            return <ul>{children}</ul>;
          },
          ol({ children }) {
            return <ol>{children}</ol>;
          },
          li({ children }) {
            return <li>{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-accent-color/40 bg-accent-color/5 px-4 py-2 my-4 rounded-r-lg italic text-on-surface/80">
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="my-8 border-t border-white/5" />;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6 rounded-xl border border-divider">
                <table className="w-full text-left border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-4 py-3 bg-surface-2 font-bold border-b border-divider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3 border-b border-divider last:border-b-0">{children}</td>;
          },
          a({ children, href }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent-color hover:underline font-medium"
              >
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const ChatWindow = () => {
  const { 
    isSidebarOpen, appView, resolvedTheme, activeChatId, chats, 
    isShareModalOpen, setIsShareModalOpen, shareChatId, setShareChatId,
    isReportModalOpen, setIsReportModalOpen,
    isGroupChatModalOpen, setIsGroupChatModalOpen, 
    groupChatTargetId, setGroupChatTargetId,
    isUpgradeModalOpen, setIsUpgradeModalOpen,
    messages, setMessages, theme, 
    toggleTheme, updateChatTheme, chatTheme, setChats, setActiveChatId, 
    createNewChat, user, login, authOpen, setAuthOpen,
    fontSize, chatWidth, lineHeight, setIsSidebarOpen, isAuthLoading,
    profile, showLoggedIn, personalization, accentColor,
    deleteChat, archiveChat, aiModel, setAiModel, renameChat,
    isGroupLinkModalOpen, setIsGroupLinkModalOpen, groupLinkChatId, setGroupLinkChatId,
    leaveGroup
  } = useAppContext();

  const [mounted, setMounted] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [input, setInput] = useState('');
  const [greeting, setGreeting] = useState("What's on your mind?");
  const [hoveredChip, setHoveredChip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const currentResponseRef = useRef("");
  const [isTemporary, setIsTemporary] = useState(false);
  
  const currentChatForSend = chats.find(c => c.id === activeChatId);
  const isGroupForSend = currentChatForSend?.isGroup;
  
  // Calculate if AI is generating with a 30-second stuck-safety window
  let isGeneratingRemote = false;
  if (isGroupForSend && currentChatForSend?.isGenerating) {
    const chatMessages = currentChatForSend?.messages || [];
    const lastMsg = chatMessages[chatMessages.length - 1];
    const lastMsgTime = lastMsg ? new Date(lastMsg.timestamp).getTime() : 0;
    
    const genTime = currentChatForSend?.generatingTimestamp 
      ? new Date(currentChatForSend.generatingTimestamp).getTime() 
      : lastMsgTime;
      
    if (!genTime || (Date.now() - genTime) < 30000) {
      isGeneratingRemote = true;
    }
  }
  
  const isSendDisabled = isLoading || isGeneratingRemote;
  const getGreeting = () => {
    const hour = new Date().getHours();
    let welcome = "";
    if (hour < 12) welcome = "Good morning";
    else if (hour < 17) welcome = "Good afternoon";
    else welcome = "Good evening";

    const userName = (user && profile?.displayName) ? profile.displayName.split(' ')[0] : '';
    const personalizedWelcome = userName ? `${welcome}, ${userName}.` : `${welcome}.`;

    const options = [
      personalizedWelcome,
      "Where should we begin?",
      "What's on the agenda today?",
      "Ready when you are.",
      "What's on your mind today?",

      "Share your vision with me.",
      "How can I assist you today?"
    ];
    return options[Math.floor(Math.random() * options.length)];
  };

  useEffect(() => {
    setGreeting(getGreeting());
  }, [activeChatId, user, profile]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [copyingId, setCopyingId] = useState(null);
  const [ratings, setRatings] = useState({});
  const [msgReactions, setMsgReactions] = useState({});
  const [hoveredReactionMsgId, setHoveredReactionMsgId] = useState(null);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState(null);
  const [msgDeleteConfirm, setMsgDeleteConfirm] = useState({ open: false, id: null });
  const [replyingToMsg, setReplyingToMsg] = useState(null);

  // Reaction Persistence
  useEffect(() => {
    const saved = localStorage.getItem('msgReactions');
    if (saved) {
      try {
        setMsgReactions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse reactions:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('msgReactions', JSON.stringify(msgReactions));
    }
  }, [msgReactions, mounted]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
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
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
  const [isGroupChatMenuOpen, setIsGroupChatMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tempGroupName, setTempGroupName] = useState('');
  const headerMoreRef = useRef(null);
  const groupChatMenuRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMessageMode, setIsVoiceMessageMode] = useState(false);
  const voiceModeRef = useRef(false);
  const recognitionRef = useRef(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [activeMsgMoreId, setActiveMsgMoreId] = useState(null);
  const msgMoreRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryRef = useRef(null);
  const attachmentRefLanding = useRef(null);
  const attachmentRefFooter = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setActiveCategory(null);
      }
      if (attachmentRefLanding.current && !attachmentRefLanding.current.contains(e.target)) {
        setShowAttachmentMenuLanding(false);
      }
      if (attachmentRefFooter.current && !attachmentRefFooter.current.contains(e.target)) {
        setShowAttachmentMenu(false);
      }
      if (groupChatMenuRef.current && !groupChatMenuRef.current.contains(e.target)) {
        setIsGroupChatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle real-time typing status in Firestore for group chats
  const typingTimeoutRef = useRef(null);
  const lastTypingStateRef = useRef(false);

  const stopUserTyping = (chatId = activeChatId) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (lastTypingStateRef.current && chatId && profile?.uid) {
      lastTypingStateRef.current = false;
      const chatRef = doc(db, 'chats', chatId);
      updateDoc(chatRef, {
        [`typing.${profile.uid}`]: {
          isTyping: false,
          timestamp: new Date().toISOString()
        }
      }).catch(console.error);
    }
  };

  const handleUserTyping = () => {
    const currentChat = chats.find(c => c.id === activeChatId);
    const isGroup = currentChat?.isGroup;
    if (!isGroup || !profile?.uid || !activeChatId) return;

    const updateTypingStatus = async (isTyping) => {
      try {
        const chatRef = doc(db, 'chats', activeChatId);
        await updateDoc(chatRef, {
          [`typing.${profile.uid}`]: isTyping ? {
            displayName: profile.displayName || 'User',
            avatar: profile.avatar || null,
            isTyping: true,
            timestamp: new Date().toISOString()
          } : {
            isTyping: false,
            timestamp: new Date().toISOString()
          }
        });
      } catch (err) {
        console.error("Failed to update typing status:", err);
      }
    };

    if (!lastTypingStateRef.current) {
      lastTypingStateRef.current = true;
      updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      lastTypingStateRef.current = false;
      updateTypingStatus(false);
    }, 3000);
  };

  useEffect(() => {
    const chatToClean = activeChatId;
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (lastTypingStateRef.current && chatToClean && profile?.uid) {
        const chatRef = doc(db, 'chats', chatToClean);
        updateDoc(chatRef, {
          [`typing.${profile.uid}`]: {
            isTyping: false,
            timestamp: new Date().toISOString()
          }
        }).catch(console.error);
      }
    };
  }, [activeChatId, profile]);

  const WRITE_SUGGESTIONS = [
    { text: 'Improve my tone', prompt: 'Improve the tone of this text: ' },
    { text: 'Strengthen an argument', prompt: 'Help me strengthen this argument: ' },
    { text: 'Rewrite to be friendlier', prompt: 'Rewrite this to sound more friendly: ' },
    { text: 'Turn notes into an email', prompt: 'Turn these notes into a professional email: ' },
  ];

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const preventScrollRef = useRef(false);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioBarsRef = useRef([]);
  const isAtBottomRef = useRef(true);

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

  // Modular message rendering to resolve JSX parsing complexity
  const renderMessageView = (msg, index) => {
    if (msg.isGroupCreation) {
      const chat = chats.find(c => c.id === activeChatId);
      const creator = chat?.creator;

      return (
        <div style={{
          width: '100%',
          textAlign: 'center',
          padding: '0 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            {creator?.avatar && (
              <img 
                src={creator.avatar} 
                alt="" 
                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--divider)' }} 
              />
            )}
            <p style={{ fontSize: '13.5px', color: 'var(--on-surface)', margin: 0, opacity: 0.9 }}>
              <span style={{ fontWeight: 600 }}>{creator?.displayName || profile?.displayName || 'User'}</span> created the group chat.
            </p>
          </div>
        </div>
      );
    }

    // Calculate context first
    const isMe = msg.role === 'user' && (msg.sender?.email === profile?.email || !msg.sender?.email);
    const isOtherUser = msg.role === 'user' && !isMe;
    const isGroup = chats.find(c => c.id === activeChatId)?.isGroup;

    // 1. Handle Deletion State
    const isDeletedForMe = msg.deletedBy?.includes(user?.uid);
    const isDeletedForEveryone = msg.isDeleted;
    
    if (isDeletedForMe || isDeletedForEveryone) {
      return (
        <div className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in my-10`}>
          <div className="px-6 py-3 flex items-center gap-2.5 transition-all" 
            style={{ 
              background: isMe ? `${accentColor}15` : 'var(--surface-2)', 
              border: `1px dashed ${isMe ? accentColor : 'var(--divider)'}`,
              color: 'var(--on-surface-subtle)',
              fontSize: '13px',
              opacity: 0.6,
              borderRadius: isMe ? '24px 24px 4px 24px' : '4px 24px 24px 24px',
              marginLeft: !isMe && isOtherUser ? '44px' : '0'
            }}>
            <Trash2 size={13} className="opacity-30" />
            <span className="italic tracking-tight">
              {isDeletedForMe ? 'You deleted this message' : 'This message was deleted'}
            </span>
          </div>
        </div>
      );
    }

    // 2. Handle Editing State
    if (editingId === msg.id) {
      return (
        <div className="w-full max-w-full flex flex-col p-5 animate-fade-in relative transition-all duration-300" 
          style={{ background: '#2f2f2f', borderRadius: '26px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', margin: '20px 0' }}>
          <textarea
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[16.5px] leading-relaxed min-h-[85px] p-0 text-white placeholder:text-white/20"
            style={{ resize: 'none' }}
            placeholder="Edit your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSaveEdit(msg.id);
              }
              if (e.key === 'Escape') {
                setEditingId(null);
              }
            }}
          />
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/10" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button 
              onClick={() => { setEditingId(null); setEditValue(''); }}
              className="rounded-full text-[15px] font-semibold transition-all shadow-sm hover:bg-white/90 hover:-translate-y-[1px] active:translate-y-0"
              style={{ background: '#ffffff', color: '#000000', padding: '10px 24px' }}
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSaveEdit(msg.id)}
              className="rounded-full text-[15px] font-semibold text-white transition-all shadow-md hover:opacity-90 hover:-translate-y-[1px] active:translate-y-0"
              style={{ background: accentColor || '#3b82f6', padding: '10px 28px' }}
            >
              Send
            </button>
          </div>
        </div>
      );
    }

    // 3. Handle Normal Rendering

    if (msg.role === 'system') {
      let displayContent = msg.content;
      if (msg.id.startsWith('join-')) {
        const joinedUid = msg.id.split('join-')[1];
        if (joinedUid === profile?.uid) {
          displayContent = 'You joined the group';
        }
      } else if (msg.id.startsWith('leave-')) {
        if (profile?.displayName && msg.content.includes(profile.displayName)) {
          displayContent = msg.content.replace(profile.displayName, 'You');
        }
      } else if (profile?.displayName && msg.content.startsWith(profile.displayName)) {
        displayContent = msg.content.replace(profile.displayName, 'You');
      }

      return (
        <div className="w-full flex justify-center mt-8 mb-20 animate-fade-in">
          <p className="text-[13px] font-normal text-on-surface-muted m-0 opacity-40 text-center tracking-tight">
            {displayContent}
          </p>
        </div>
      );
    }

    return (
      <div className={`w-full flex flex-col ${isMe ? 'items-end' : msg.isVoice ? 'items-center' : 'items-start'}`}>

        
        <div className={`w-full flex ${isMe ? 'items-start flex-row-reverse' : msg.isVoice ? 'items-center justify-center' : 'items-start flex-row'}`}>
          {isGroup && !isMe && msg.role !== 'ai' && (
            <div title={msg.sender?.displayName || 'User'} style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', marginRight: '12px', flexShrink: 0, marginTop: '2px', border: '1px solid var(--divider)' }}>
              {msg.sender?.avatar ? (
                <img src={msg.sender.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                  {(msg.sender?.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
          )}

          <motion.div 
             layout={msg.role === 'ai' && generatingId === msg.id ? false : "position"}
             initial={{ opacity: 0, scale: 0.98, y: 10 }} 
             animate={{ opacity: 1, scale: 1, y: 0 }} 
             transition={{ duration: 0.2, ease: "easeOut" }}
           className={`relative transition-all duration-300 min-w-0 ${
              isMe 
                ? 'px-6 py-3 rounded-[24px] font-medium shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] border border-white/5' 
                : isOtherUser
                  ? 'px-6 py-3 rounded-[24px] bg-surface-2 border border-divider'
                  : 'px-0 py-2'
            }`}
           style={{ 
             maxWidth: msg.isVoice ? '340px' : isMe ? '78%' : isOtherUser ? '78%' : '100%',
             overflow: 'hidden',
             wordBreak: 'break-word',
             background: isMe ? accentColor : isOtherUser ? 'var(--surface-2)' : 'transparent',
             color: isMe ? '#ffffff' : 'var(--on-surface)',
             border: isMe ? `1px solid ${accentColor}` : isOtherUser ? '1px solid var(--divider)' : 'none',
             borderRadius: msg.isVoice ? '20px' : isMe ? '24px 24px 4px 24px' : isOtherUser ? '4px 24px 24px 24px' : '0',
             fontSize: fontSize === 'Small' ? '12.5px' : fontSize === 'Large' ? '16px' : '14px', 
             lineHeight: '1.7',
             boxShadow: (isMe || isOtherUser) && resolvedTheme === 'dark' ? '0 10px 20px -5px rgba(0,0,0,0.2)' : 'none',
             overflowWrap: 'anywhere',
             padding: msg.isVoice ? '12px 16px' : (isMe || isOtherUser ? undefined : '0px')
           }}
          >
       {msg.isVoice ? 
        <div className="flex items-center gap-3 min-w-[240px] max-w-full">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 shrink-0">
            <AudioLines size={18} className="text-white" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[14px] font-semibold text-white tracking-tight">Voice chat ended</span>
            <span className="text-[12px] text-white/70">{msg.duration || '0s'}</span>
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            {ratings[msg.id] !== 'bad' && 
              <button 
                onClick={() => handleRate(msg.id, ratings[msg.id] === 'good' ? undefined : 'good')}
                className={`p-1.5 rounded-lg transition-all ${ratings[msg.id] === 'good' ? 'text-green-400 bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
              >
                <ThumbsUp size={13} fill={ratings[msg.id] === 'good' ? 'currentColor' : 'none'} />
              </button>
            }
            {ratings[msg.id] !== 'good' && 
              <button 
                onClick={() => handleRate(msg.id, ratings[msg.id] === 'bad' ? undefined : 'bad')}
                className={`p-1.5 rounded-lg transition-all ${ratings[msg.id] === 'bad' ? 'text-red-400 bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
              >
                <ThumbsDown size={13} fill={ratings[msg.id] === 'bad' ? 'currentColor' : 'none'} />
              </button>
            }
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button 
              onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-red-500/20 transition-all"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
       : 
        <>
          {msg.replyTo && 
            <div 
              className="mb-2 p-2.5 px-3.5 rounded-xl text-[13px] opacity-80"
              style={{ 
                 background: isMe ? 'rgba(0,0,0,0.12)' : 'var(--hover-overlay)',
                 borderLeft: `2px solid ${isMe ? 'rgba(255,255,255,0.4)' : accentColor}`,
                 color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--on-surface-muted)',
               }}
             >
               <p className="line-clamp-2 leading-relaxed">
                 <span className="opacity-40 mr-1 font-serif text-[15px]">"</span>
                 {msg.replyTo.content}
                 <span className="opacity-40 ml-1 font-serif text-[15px]">"</span>
               </p>
            </div>
          }
          {msg._typewriter && !msg.isPlaceholder
            ? <TypewriterMessage content={msg.content} isUser={msg.role === 'user'} onDone={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, _typewriter: false } : m))} />
            : <MessageContent content={msg.content} isUser={msg.role === 'user'} />
          }
        </>
      }
      </motion.div>
      {isMe && msg.versions && msg.versions.length > 1 && (
         <div className="flex items-center gap-1.5 mt-1.5 px-1 select-none opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200">
           <button 
             onClick={() => handleVersionChange(msg.id, -1)}
             disabled={msg.currentVersionIndex === 0}
             className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-hover-overlay disabled:opacity-10 transition-all text-on-surface/60 hover:text-on-surface"
             title="Previous version"
           >
             <ChevronLeft size={14} strokeWidth={3} />
           </button>
           <span className="text-[11px] font-bold text-on-surface/40 tracking-tight min-w-[30px] text-center">
             {msg.currentVersionIndex + 1} / {msg.versions.length}
           </span>
           <button 
             onClick={() => handleVersionChange(msg.id, 1)}
             disabled={msg.currentVersionIndex === msg.versions.length - 1}
             className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-hover-overlay disabled:opacity-10 transition-all text-on-surface/60 hover:text-on-surface"
             title="Next version"
           >
             <ChevronRight size={14} strokeWidth={3} />
           </button>
         </div>
      )}
    </div>

      {!msg.isVoice && (
        <div className={`w-full flex ${isMe ? 'flex-row-reverse' : 'flex-row'} px-1 mt-1 ${msg.role === 'ai' ? ((generatingId === msg.id || msg.isPlaceholder) ? 'opacity-0 pointer-events-none' : 'opacity-100') : 'opacity-0 group-hover/msg:opacity-100'} transition-opacity relative`}>
         <div className={`flex gap-1 ${!isMe && isOtherUser ? 'ml-[44px]' : ''}`}>
          {chats.find(c => c.id === activeChatId)?.isGroup ? (
            msg.role === 'ai' ? (
            <>
              <div className="relative">
                {((chats.find(c => c.id === activeChatId)?.isGroup ? msg.reactions : null) || msgReactions[msg.id]) && (
                  <div 
                    className="absolute flex items-center gap-1"
                    style={{
                      bottom: 'calc(100% + 4px)',
                      left: '0',
                      background: resolvedTheme === 'dark' ? '#2a2a2c' : '#ffffff',
                      border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: '999px', padding: '2px 6px', fontSize: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'default', zIndex: 5,
                    }}
                  >
                    {chats.find(c => c.id === activeChatId)?.isGroup ? (
                      Object.entries(msg.reactions || {}).map(([email, r]) => (
                        <span key={email} title={r.user}>{r.emoji}</span>
                      ))
                    ) : (
                      <span>{msgReactions[msg.id]?.emoji || msgReactions[msg.id]}</span>
                    )}
                  </div>
                )}
                {hoveredReactionMsgId === msg.id && (
                  <div 
                    className="fixed inset-0" 
                    style={{ zIndex: 15 }}
                    onClick={(e) => { e.stopPropagation(); setHoveredReactionMsgId(null); }}
                  />
                )}
                <AnimatePresence>
                  {hoveredReactionMsgId === msg.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute"
                      style={{ 
                        bottom: 'calc(100% + 4px)', 
                        left: isMe ? 'auto' : '0',
                        right: isMe ? '0' : 'auto',
                        zIndex: 20
                      }}
                    >
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '2px',
                        background: resolvedTheme === 'dark' ? '#1c1c1e' : '#f2f2f2',
                        border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        borderRadius: '999px', padding: '5px 8px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                      }}>
                        {['👍','👎','❤️','🎉','🔥','🤔','😂','😮'].map(emoji => {
                          const isGroup = chats.find(c => c.id === activeChatId)?.isGroup;
                          const reacted = isGroup 
                            ? msg.reactions?.[profile?.email || 'guest']?.emoji === emoji
                            : (msgReactions[msg.id]?.emoji === emoji || msgReactions[msg.id] === emoji);
                          return (
                            <button
                              key={emoji}
                              onClick={async () => {
                                const userName = profile?.displayName || 'User';
                                const currentChat = chats.find(c => c.id === activeChatId);
                                
                                if (currentChat?.isGroup) {
                                  try {
                                    const chatRef = doc(db, 'chats', activeChatId);
                                    const updatedMessages = messages.map(m => {
                                      if (m.id === msg.id) {
                                        const existingReaction = m.reactions?.[profile?.email || 'guest'];
                                        const newReactions = { ...(m.reactions || {}) };
                                        if (existingReaction?.emoji === emoji) {
                                          delete newReactions[profile?.email || 'guest'];
                                        } else {
                                          newReactions[profile?.email || 'guest'] = { emoji, user: userName };
                                        }
                                        return { ...m, reactions: newReactions };
                                      }
                                      return m;
                                    });
                                    await updateDoc(chatRef, { messages: updatedMessages });
                                  } catch (err) {
                                    console.error("Failed to sync reaction:", err);
                                  }
                                } else {
                                  setMsgReactions(prev => ({ ...prev, [msg.id]: reacted ? null : { emoji, user: userName } }));
                                }
                                setHoveredReactionMsgId(null);
                              }}
                              style={{
                                width: '34px', height: '34px', borderRadius: '50%', border: 'none',
                                background: reacted ? (accentColor ? `${accentColor}30` : 'rgba(255,255,255,0.15)') : 'transparent',
                                cursor: 'pointer', fontSize: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s', transform: reacted ? 'scale(1.2)' : 'scale(1)'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = reacted ? (accentColor ? `${accentColor}30` : 'rgba(255,255,255,0.15)') : 'transparent'; e.currentTarget.style.transform = reacted ? 'scale(1.2)' : 'scale(1)'; }}
                            >{emoji}</button>
                          );
                        })}
                        <div style={{ width: '1px', height: '20px', background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
                        <button style={{
                          width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer',
                          fontSize: '18px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontWeight: 300
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => { setActiveReactionPickerMsgId(msg.id); setHoveredReactionMsgId(null); }}
                        >+</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <ActionButton 
                  onClick={() => setHoveredReactionMsgId(prev => prev === msg.id ? null : msg.id)}
                  label="React" 
                  icon={<SmilePlus size={14} />} 
                />
              </div>
              <ActionButton 
                onClick={() => { setReplyingToMsg(msg.role === 'ai' ? (messages[index - 1] || msg) : msg); setTimeout(() => footerInputRef.current?.focus(), 100); }} 
                label="Reply" 
                icon={<Reply size={14} />} 
              />
              <ActionButton 
                onClick={() => setMsgDeleteConfirm({ open: true, id: msg.id })} 
                label="Delete" 
                icon={<Trash2 size={14} />} 
              />
              {isMe && (
                <ActionButton 
                  onClick={() => { setEditingId(msg.id); setEditValue(msg.content); }} 
                  label="Edit" 
                  icon={<Edit2 size={14} />} 
                />
              )}
              {!isMe && (
                <ActionButton 
                  onClick={() => setIsReportModalOpen(true)} 
                  label="Report" 
                  icon={<Flag size={14} />} 
                />
              )}
            </>
            ) : null
          ) : (
            <>
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
                    onClick={() => setIsShareModalOpen(true)} 
                    label="Share" 
                    icon={<Share size={14} />} 
                  />
                  <ActionButton 
                    onClick={() => {}} 
                    label="Regenerate" 
                    icon={<RefreshCcw size={14} />} 
                  />
                </>
              )}
              {msg.role === 'ai' ? (
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
                      className="absolute right-0"
                      style={{
                        bottom: "calc(100% + 6px)",
                        top: "auto", 
                        minWidth: '210px',
                        background: 'var(--surface-1)',
                        border: '1px solid var(--divider)',
                        borderRadius: '16px',
                        padding: '6px',
                        boxShadow: resolvedTheme === 'dark' ? '0 20px 40px rgba(0,0,0,0.2)' : 'none',
                        display: 'flex',
                        zIndex: 100,
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
                        onClick={() => { handleBranchChat(msg.id); setActiveMsgMoreId(null); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--on-surface)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <GitBranch size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                        <span>Branch in new chat</span>
                      </button>
                      
                      <button 
                        onClick={() => { speak(msg.content, msg.id); setActiveMsgMoreId(null); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--on-surface)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Volume2 size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                        <span style={{ color: 'var(--on-surface-muted)' }}>{currentlySpeakingId === msg.id ? "Stop Reading" : "Read aloud"}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              ) : (
                <ActionButton 
                  onClick={() => { setEditingId(msg.id); setEditValue(msg.content); }} 
                  label="Edit" 
                  icon={<Edit2 size={14} />} 
                />
              )}
            </>
          )}
         </div>
        </div>
     )}
      </div>
    );
  };

  const scrollExplore = (direction) => {
    if (exploreScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      exploreScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Lower threshold (30px) makes it much easier to scroll up and read history
      const isNearBottom = scrollTop >= scrollHeight - clientHeight - 30;
      isAtBottomRef.current = isNearBottom;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsSmallMobile(width < 400);
    };
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


  const handleDeleteGroup = () => {
    deleteChat(activeChatId);
    setIsDeleteConfirmOpen(false);
  };

  const handleRenameGroup = (newName) => {
    if (newName.trim()) {
      renameChat(activeChatId, newName.trim());
    }
    setIsRenameModalOpen(false);
  };

  const scrollToBottom = (force = false) => {
    if (preventScrollRef.current && !force) return;
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    
    if (isAtBottomRef.current || force) {
      if (force) {
        // Use smooth scroll only for manual button clicks or new messages
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        isAtBottomRef.current = true;
        setShowScrollButton(false);
      } else {
        // Use instant scroll for high-frequency streaming updates
        // This prevents the "shaking/shrinking" effect by not triggering complex animations
        container.scrollTop = container.scrollHeight;
      }
    }
  };
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    isAtBottomRef.current = true;
    scrollToBottom(true);
    const timer = setTimeout(() => scrollToBottom(true), 50);
    return () => clearTimeout(timer);
  }, [activeChatId]);

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

  const formatDateLabel = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

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
    
    const currentChat = chats.find(c => c.id === activeChatId);
    const isGroup = currentChat?.isGroup;
    const isGeneratingRemote = isGroup && currentChat?.isGenerating;
    if (!textToSend.trim() || isLoading || isGeneratingRemote) return;

    // Snapshot history immediately to isolate this request from parallel messages
    const historySnapshot = [...messages]; 
    
    setIsLoading(true);
    
    // Sync generating status with timestamp for group chats and reset typing status
    if (isGroup) {
      updateDoc(doc(db, 'chats', activeChatId), { 
        isGenerating: true,
        generatingTimestamp: new Date().toISOString(),
        [`typing.${profile?.uid || 'unknown'}`]: {
          isTyping: false,
          timestamp: new Date().toISOString()
        }
      }).catch(console.error);
      lastTypingStateRef.current = false;
    }

    const words = textToSend.split(' ').length;
    const duration = Math.max(1, Math.floor(words * 0.4)) + 's';

    const userMessage = { 
      role: 'user', 
      content: textToSend, 
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      isVoice, 
      duration,
      replyTo: replyingToMsg ? {
        id: replyingToMsg.id,
        role: replyingToMsg.role,
        content: replyingToMsg.content
      } : null,
      sender: profile || { displayName: 'Guest', avatar: null },
      timestamp: new Date().toISOString()
    };
    const isFirstMessage = messages.length === 0;
    const aiMessageId = Date.now() + 1;
    const aiPlaceholder = { 
      role: 'ai', 
      content: '', 
      id: aiMessageId, 
      isPlaceholder: true,
      respondingTo: userMessage.id,
      timestamp: new Date().toISOString()
    };

    // Clear reply state
    if (replyingToMsg) setReplyingToMsg(null);

    // If it's a voice message, just show the bubble — don't call AI
    if (isVoice) {
      if (isFirstMessage && !isTemporary) {
        const newChatId = Date.now().toString();
        const newChat = { id: newChatId, title: 'Voice Message', messages: [userMessage], timestamp: new Date().toISOString() };
        setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0)]);
        setActiveChatId(newChatId);
        localStorage.setItem('aura-active-chat-id', newChatId);
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
    }

    if (!overrideInput) setInput('');
    const currentInput = textToSend;
    
    // Optimistically update local state for better UX
    setMessages(prev => [...prev, userMessage]);

    if (isGroup) {
      try {
        await updateDoc(doc(db, 'chats', activeChatId), {
          messages: arrayUnion(userMessage, aiPlaceholder)
        });
      } catch (err) {
        console.error("Failed to sync group message:", err);
      }
    }
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

      setGeneratingId(aiMessageId);
      setMessages(prev => [...prev, aiPlaceholder]);
      
      currentResponseRef.current = "";
      let lastStreamSync = 0;
      const STREAM_INTERVAL = 250; // ms between Firestore streaming writes

      const onUpdate = (text) => {
        currentResponseRef.current = text;
        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: text } : m));

        // Throttle-stream the growing content to Firestore so other group members see it live
        if (isGroup) {
          const now = Date.now();
          if (now - lastStreamSync > STREAM_INTERVAL) {
            lastStreamSync = now;
            updateDoc(doc(db, 'chats', activeChatId), {
              [`streamContent.${aiMessageId}`]: text
            }).catch(console.error);
          }
        }
      };

      const aiResponse = await getGeminiResponse(finalPrompt, historySnapshot, personalization, abortControllerRef.current.signal, onUpdate, aiModel);
      
      // Always update local state with final response to clear placeholder status
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId ? { ...m, content: aiResponse, isPlaceholder: false, _typewriter: false } : m
      ));

      if (isGroup) {
        try {
          const chatRef = doc(db, 'chats', activeChatId);
          const docSnap = await getDoc(chatRef);
          if (docSnap.exists()) {
            const currentMsgs = docSnap.data().messages || [];
            const updatedMsgs = currentMsgs.map(m => 
              m.id === aiMessageId ? { ...m, content: aiResponse, isPlaceholder: false } : m
            );
            // Save final message + clear the streaming temp field
            await updateDoc(chatRef, { 
              messages: updatedMsgs,
              [`streamContent.${aiMessageId}`]: null
            });
          }
        } catch (err) {
          console.error("Failed to sync AI response to group:", err);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
        const partialText = currentResponseRef.current || "Response stopped.";
        
        // Always update local state
        setMessages(prev => prev.map(m => 
          m.id === aiMessageId ? { ...m, content: partialText, isPlaceholder: false, isStopped: true } : m
        ));

        if (isGroup) {
          try {
            const chatRef = doc(db, 'chats', activeChatId);
            const docSnap = await getDoc(chatRef);
            if (docSnap.exists()) {
              const currentMsgs = docSnap.data().messages || [];
              const updatedMsgs = currentMsgs.map(m => 
                m.id === aiMessageId ? { ...m, content: partialText, isPlaceholder: false, isStopped: true } : m
              );
              await updateDoc(chatRef, { messages: updatedMsgs });
            }
          } catch (err) {
            console.error("Failed to sync partial AI response:", err);
          }
        }
      } else {
        console.error(error);
      }
    } finally {
      currentResponseRef.current = "";
      setIsLoading(false);
      setGeneratingId(null);
      abortControllerRef.current = null;
      
      // Clear generating status
      if (chats.find(c => c.id === activeChatId)?.isGroup) {
        updateDoc(doc(db, 'chats', activeChatId), { isGenerating: false }).catch(console.error);
      }
    }
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.trim() || isLoading) return;
    
    preventScrollRef.current = true;
    let userMsgIdx = -1;
    let currentMsgs = [];

    setMessages(prev => {
      userMsgIdx = prev.findIndex(m => m.id === id);
      if (userMsgIdx === -1) return prev;
      
      const newMsgs = [...prev];
      const m = newMsgs[userMsgIdx];
      if (m.content === editValue) return prev;

      // 1. Archive User Content
      const oldUserContent = m.content;
      const userVersions = m.versions || [oldUserContent];
      const newUserVersions = [...userVersions, editValue];
      const newVerIdx = newUserVersions.length - 1;
      
      newMsgs[userMsgIdx] = { 
        ...m, 
        content: editValue, 
        versions: newUserVersions, 
        currentVersionIndex: newVerIdx 
      };

      // 2. Archive AI Content (if it exists)
      const nextIdx = userMsgIdx + 1;
      if (newMsgs[nextIdx] && newMsgs[nextIdx].role === 'ai') {
        const aiMsg = newMsgs[nextIdx];
        const oldAiContent = aiMsg.content;
        const aiVersions = aiMsg.versions || [oldAiContent];
        
        const newAiVersions = [...aiVersions];
        // We'll fill newAiVersions[newVerIdx] after generation, but we must keep old ones intact
        
        newMsgs[nextIdx] = {
          ...aiMsg,
          content: '', // Clear for new streaming
          versions: newAiVersions,
          currentVersionIndex: newVerIdx
        };
      }
      
      currentMsgs = newMsgs;
      return newMsgs;
    });

    setEditingId(null);
    setEditValue('');
    setIsLoading(true);
    isAtBottomRef.current = true; // Focus on the regenerated response
    scrollToBottom(true);
    abortControllerRef.current = new AbortController();

    try {
      const history = currentMsgs.slice(0, userMsgIdx + 1);
      const aiMessageId = Date.now() + 1;
      setGeneratingId(aiMessageId);
      
      const nextMsg = currentMsgs[userMsgIdx + 1];
      const isNextAI = nextMsg && nextMsg.role === 'ai';

      if (!isNextAI) {
        setMessages(prev => {
          const updated = [...prev];
          updated.splice(userMsgIdx + 1, 0, { role: 'ai', content: '', id: aiMessageId, timestamp: new Date().toISOString() });
          return updated;
        });
      }

      const onUpdate = (text) => {
        setMessages(prev => {
          const updated = [...prev];
          const targetIdx = userMsgIdx + 1;
          if (updated[targetIdx] && updated[targetIdx].role === 'ai') {
            updated[targetIdx] = { ...updated[targetIdx], content: text };
          }
          return updated;
        });
      };

      const aiResponse = await getGeminiResponse(editValue, history, personalization, abortControllerRef.current.signal, onUpdate, aiModel);
      
      setMessages(prev => {
        const updated = [...prev];
        const targetIdx = userMsgIdx + 1;
        if (updated[targetIdx] && updated[targetIdx].role === 'ai') {
          const aiMsg = updated[targetIdx];
          const userMsg = updated[userMsgIdx];
          const targetVerIdx = userMsg.currentVersionIndex;
          
          const newAiVersions = [...(aiMsg.versions || [])];
          newAiVersions[targetVerIdx] = aiResponse;

          updated[targetIdx] = { 
            ...aiMsg, 
            content: aiResponse, 
            versions: newAiVersions, 
            currentVersionIndex: targetVerIdx 
          };
        }
        return updated;
      });

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("AI generation for edit was stopped by user.");
      } else {
        console.error("Failed to generate AI response for edit:", error);
      }
    } finally {
      setIsLoading(false);
      setGeneratingId(null);
      setTimeout(() => { preventScrollRef.current = false; }, 500);
    }
  };

  const handleVersionChange = (msgId, delta) => {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      
      const m = prev[idx];
      const newIndex = Math.max(0, Math.min(m.versions.length - 1, m.currentVersionIndex + delta));
      if (newIndex === m.currentVersionIndex) return prev;

      preventScrollRef.current = true;
      const updated = [...prev];
      updated[idx] = { ...m, currentVersionIndex: newIndex, content: m.versions[newIndex] };
      
      // Synchronize AI response version
      const nextIdx = idx + 1;
      if (updated[nextIdx] && updated[nextIdx].role === 'ai' && updated[nextIdx].versions) {
        const aiMsg = updated[nextIdx];
        if (aiMsg.versions[newIndex] !== undefined) {
          updated[nextIdx] = { 
            ...aiMsg, 
            currentVersionIndex: newIndex, 
            content: aiMsg.versions[newIndex] 
          };
        }
      }
      
      setTimeout(() => { preventScrollRef.current = false; }, 500);
      return updated;
    });
  };

  const handleDeleteMsg = async () => {
    if (!msgDeleteConfirm.id) return;
    
    const userId = user?.uid;
    if (!userId) return;

    const currentChat = chats.find(c => c.id === activeChatId);
    if (currentChat?.isGroup) {
      try {
        const chatRef = doc(db, 'chats', activeChatId);
        const docSnap = await getDoc(chatRef);
        if (docSnap.exists()) {
          const currentMsgs = docSnap.data().messages || [];
          const updatedMsgs = currentMsgs.map(m => {
            if (m.id === msgDeleteConfirm.id) {
              const deletedBy = m.deletedBy || [];
              if (!deletedBy.includes(userId)) {
                return { ...m, deletedBy: [...deletedBy, userId] };
              }
            }
            return m;
          });
          await updateDoc(chatRef, { messages: updatedMsgs });
        }
      } catch (err) {
        console.error("Failed to delete group message:", err);
      }
    } else {
      setMessages(prev => prev.filter(m => m.id !== msgDeleteConfirm.id));
    }
    setMsgDeleteConfirm({ open: false, id: null });
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 min-w-0 flex flex-col relative h-screen bg-primary transition-colors duration-500" style={{ overflow: 'hidden' }}>
      <PeopleModal 
        isOpen={isPeopleModalOpen} 
        onClose={() => setIsPeopleModalOpen(false)} 
        onAddPeople={() => { setGroupLinkChatId(activeChatId); setIsGroupLinkModalOpen(true); setIsPeopleModalOpen(false); }}
        activeChat={chats.find(c => c.id === activeChatId)}
      />
      <DeleteGroupModal 
        isOpen={isDeleteConfirmOpen} 
        onClose={() => setIsDeleteConfirmOpen(false)} 
        onConfirm={handleDeleteGroup} 
        groupName={chats.find(c => c.id === activeChatId)?.title}
      />
      <RenameGroupModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onConfirm={handleRenameGroup}
        initialValue={tempGroupName}
      />
      <GroupLinkModal 
        isOpen={isGroupLinkModalOpen} 
        onClose={() => setIsGroupLinkModalOpen(false)} 
        chatId={groupLinkChatId} 
      />
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
      <MsgDeleteModal 
        isOpen={msgDeleteConfirm.open}
        onClose={() => setMsgDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDeleteMsg}
      />
      <style>{`
        .temp-placeholder::placeholder {
          color: ${isTemporary ? (resolvedTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)') : 'var(--on-surface-subtle)'} !important;
          opacity: 1 !important;
        }
      `}</style>
      {isMobile && !chats.find(c => c.id === activeChatId)?.isGroup ? (
        !showLoggedIn ? (
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: 60, position: 'sticky', top: 0, zIndex: 80,
            background: 'var(--bg-primary)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--divider)',
          }}>
            {/* Left: Hamburger menu */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
                border: 'none', cursor: 'pointer',
                width: '44px', height: '44px', color: 'var(--on-surface)',
              }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="13" y2="16" />
              </svg>
            </button>

            {/* Center: App Title */}
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--on-surface)',
              fontFamily: 'inherit'
            }}>
              Kyra
            </div>

            {/* Right: Log In Button */}
            <button 
              onClick={() => setAuthOpen(true)}
              style={{
                background: 'var(--on-surface)',
                color: 'var(--bg-primary)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Log in
            </button>
          </header>
        ) : (
          <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 60, position: 'sticky', top: 0, zIndex: 80,
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--divider)',
        }}>
          {/* Left: Stylish staggered hamburger icon */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              border: 'none', cursor: 'pointer',
              width: '44px', height: '44px', borderRadius: '50%', color: 'var(--on-surface)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
          >
            {isSidebarOpen ? (
              <X size={20} strokeWidth={2.5} />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="13" y2="16" />
              </svg>
            )}
          </button>

          {/* Right side buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!activeChatId || !chats.some(c => c.id === activeChatId && c.messages && c.messages.length > 0) ? (
              /* Temporary Chat Toggle Icon for new/empty chats */
              <button 
                onClick={() => setIsTemporary(!isTemporary)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isTemporary 
                    ? 'var(--on-surface)' 
                    : (resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'),
                  border: 'none', cursor: 'pointer',
                  width: '44px', height: '44px', borderRadius: '50%',
                  color: isTemporary ? 'var(--bg-primary)' : 'var(--on-surface)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if(!isTemporary) e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'; }}
                onMouseLeave={e => { if(!isTemporary) e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'; }}
              >
                <MessageSquareDashed size={20} strokeWidth={2.2} />
              </button>
            ) : (
              /* Original icons for existing chats inside a pill/capsule background container */
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '999px',
                padding: '0 8px',
                height: '44px',
                gap: '4px'
              }}>
                {/* New Chat Icon */}
                <button 
                  onClick={() => {
                    createNewChat();
                    if (isSidebarOpen) setIsSidebarOpen(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    width: '36px', height: '36px', borderRadius: '50%', color: 'var(--on-surface)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <SquarePen size={20} strokeWidth={2.2} />
                </button>

                {/* Options Vertical Kebab Icon */}
                <div className="relative" ref={headerMoreRef} style={{ display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => setIsHeaderMoreOpen(!isHeaderMoreOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      width: '36px', height: '36px', borderRadius: '50%', color: 'var(--on-surface)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <MoreVertical size={20} strokeWidth={2.2} />
                  </button>

                  <AnimatePresence>
                    {isHeaderMoreOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute"
                        style={{ 
                          right: -8,
                          top: '100%',
                          marginTop: '12px',
                          minWidth: '230px',
                          background: 'var(--surface-1)',
                          border: '1px solid var(--divider)',
                          borderRadius: '22px',
                          padding: '6px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                          transformOrigin: 'top right',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          zIndex: 100,
                        }}
                      >
                        <button 
                          onClick={() => { setIsShareModalOpen(true); setIsHeaderMoreOpen(false); }}
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
                          <Share2 size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Share chat</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (!showLoggedIn) {
                              setAuthOpen(true);
                            } else {
                              setGroupChatTargetId(activeChatId);
                              setIsGroupChatModalOpen(true); 
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
      )) : (
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 56, position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--bg-primary)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--divider)',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <button 
                className="hamburger-button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  display: 'none', // CSS will show this on mobile/narrow screens
                  alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '8px', borderRadius: 10, color: 'var(--on-surface)',
                  transition: 'background 0.15s',
                  marginRight: 4
                }}
              >
                {isSidebarOpen ? (
                  <X size={22} strokeWidth={2.5} />
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                    <line x1="4" y1="8" x2="20" y2="8" />
                    <line x1="4" y1="16" x2="13" y2="16" />
                  </svg>
                )}
              </button>
            <div className="relative" ref={groupChatMenuRef}>
              <button 
                onClick={() => setIsGroupChatMenuOpen(!isGroupChatMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '8px 4px', borderRadius: 12, color: 'var(--on-surface)',
                  visibility: isSidebarOpen && isMobile ? 'hidden' : 'visible',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {chats.find(c => c.id === activeChatId)?.isGroup ? (
                  <>
                    <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.2px' }}>
                      {chats.find(c => c.id === activeChatId)?.title || 'Group Chat'}
                    </span>
                    <ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', marginTop: 1 }} />
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>Kyra</span>
                    <ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', marginTop: 1 }} />
                  </>
                )}
              </button>

              <AnimatePresence>
                {isGroupChatMenuOpen && chats.find(c => c.id === activeChatId)?.isGroup && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute', top: '100%', left: 0, marginTop: 8,
                      width: 240, background: 'var(--surface-1)', borderRadius: 18,
                      border: '1px solid var(--divider)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      padding: 6, zIndex: 100, overflow: 'hidden'
                    }}
                  >
                    <button 
                      onClick={() => { setIsPeopleModalOpen(true); setIsGroupChatMenuOpen(false); }}
                      className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <UserPlus size={18} className="text-on-surface-muted" />
                      <span className="text-[14px] font-medium text-on-surface">People</span>
                    </button>
                    {chats.find(c => c.id === activeChatId)?.creator?.uid === profile?.uid && (
                      <button 
                        onClick={() => { setGroupLinkChatId(activeChatId); setIsGroupLinkModalOpen(true); setIsGroupChatMenuOpen(false); }}
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                      >
                        <Paperclip size={18} className="text-on-surface-muted" />
                        <span className="text-[14px] font-medium text-on-surface">Manage group link</span>
                      </button>
                    )}
                    <button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                      <Edit2 size={18} className="text-on-surface-muted" />
                      <span className="text-[14px] font-medium text-on-surface" onClick={() => { 
                        const chat = chats.find(c => c.id === activeChatId);
                        setTempGroupName(chat?.title || '');
                        setIsRenameModalOpen(true); 
                        setIsGroupChatMenuOpen(false); 
                      }}>Rename group</span>
                    </button>
                    <button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                      <Settings size={18} className="text-on-surface-muted" />
                      <span className="text-[14px] font-medium text-on-surface">Customized Kyra</span>
                    </button>
                    <button 
                      className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                      onClick={() => { setIsReportModalOpen(true); setIsGroupChatMenuOpen(false); }}
                    >
                      <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                      <span className="text-[14px] font-medium" style={{ color: '#ef4444' }}>Report</span>
                    </button>
                    {chats.find(c => c.id === activeChatId)?.creator?.uid === profile?.uid ? (
                      <button 
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                        onClick={() => { setIsDeleteConfirmOpen(true); setIsGroupChatMenuOpen(false); }}
                      >
                        <Trash2 size={18} style={{ color: '#ef4444' }} />
                        <span className="text-[14px] font-medium" style={{ color: '#ef4444' }}>Delete group</span>
                      </button>
                    ) : (
                      <button 
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                        onClick={() => { setIsExitConfirmOpen(true); setIsGroupChatMenuOpen(false); }}
                      >
                        <LogOut size={18} style={{ color: '#ef4444' }} />
                        <span className="text-[14px] font-medium" style={{ color: '#ef4444' }}>Exit group</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {chats.find(c => c.id === activeChatId)?.isGroup ? (
              <div 
                onClick={() => setIsPeopleModalOpen(true)}
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: 'var(--hover-overlay-2)', overflow: 'hidden',
                  border: '1px solid var(--divider)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={18} style={{ color: 'var(--on-surface-subtle)' }} />
                )}
              </div>
            ) : (
              messages.length === 0 ? (
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
                  {!isMobile && <span>Temporary chat</span>}
                  {isTemporary && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bg-primary)', marginLeft: 2 }} />}
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
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
                          className="absolute top-full mt-2"
                          style={{ 
                            right: 0,
                            minWidth: '230px',
                            background: 'var(--surface-1)',
                            borderRadius: '20px',
                            padding: '6px',
                            boxShadow: resolvedTheme === 'dark' ? '0 30px 60px -12px rgba(0,0,0,0.3)' : 'none',
                            border: '1px solid var(--divider)',
                            transformOrigin: 'top right',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            zIndex: 100,
                          }}
                        >
                        <button 
                          onClick={() => { setIsShareModalOpen(true); setIsHeaderMoreOpen(false); }}
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
                          <Share2 size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Share chat</span>
                        </button>
                        <button 
                          onClick={() => { 
                            if (!showLoggedIn) {
                              setAuthOpen(true);
                            } else {
                              setGroupChatTargetId(activeChatId);
                              setIsGroupChatModalOpen(true); 
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
              )
            )}
          </div>
        </header>
      )}

      <main className="flex-1 relative bg-primary flex flex-col" style={{ overflow: 'hidden' }}>
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 custom-scrollbar flex flex-col"
          style={{ overflowY: 'auto', overflowX: 'hidden' }}
        >
          {/* Landing Page - Empty Chat (Only for non-group chats) */}
          {messages.length === 0 && !chats.find(c => c.id === activeChatId)?.isGroup && (
            <div className={`flex-1 mx-auto w-full flex flex-col ${isMobile ? 'justify-between py-6' : 'items-center justify-center py-20'} px-4`} style={{ maxWidth: chatWidth === 'Wide' ? 'min(1000px, 100%)' : chatWidth === 'Full' ? '100%' : 'min(768px, 100%)' }}>
              <div className={`w-full flex flex-col ${isMobile ? 'items-start text-left flex-1' : 'items-center justify-center text-center'} animate-fade-in px-4`}>
                {isTemporary ? (
                  <div className={`flex flex-col ${isMobile ? 'items-start text-left' : 'items-center text-center'} space-y-3`} style={{ marginBottom: isMobile ? '32px' : '60px' }}>
                    <h1 className="text-[32px] md:text-[52px] font-bold tracking-tight leading-tight" style={{ color: 'var(--on-surface)' }}>Temporary Chat</h1>
                    <p className="text-base max-w-2xl" style={{ color: 'var(--on-surface-muted)' }}>This chat won't appear in your chat history, and won't be used to train our models.</p>
                  </div>
                ) : (
                  !isMobile && <h1 className="text-[32px] md:text-[56px] font-bold tracking-tight leading-tight" style={{ color: 'var(--on-surface)', marginBottom: '60px' }}>{greeting}</h1>
                )}


                {isMobile && showLoggedIn && <div className="flex-1" />}
                
                {isMobile && !showLoggedIn && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    width: '100%',
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    paddingBottom: '24px'
                  }} className="animate-fade-in">
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '600',
                      color: 'var(--on-surface)',
                      textAlign: 'center',
                      marginBottom: '28px',
                      fontFamily: 'inherit'
                    }}>
                      What can I help with?
                    </h1>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      justifyContent: 'center',
                      width: '100%',
                      maxWidth: '360px'
                    }}>
                      {/* Code chip */}
                      <button
                        onClick={() => setInput("Write code to ")}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '999px',
                          border: '1px solid var(--divider)',
                          background: 'var(--surface-1)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <Code size={16} style={{ color: 'var(--on-surface-muted)' }} />
                        <span>Code</span>
                      </button>

                      {/* Surprise me chip */}
                      <button
                        onClick={() => {
                          const surprises = [
                            "Tell me a fun random fact",
                            "Suggest a cool programming project idea",
                            "Write a short haiku about coding",
                            "Give me a daily motivational quote"
                          ];
                          setInput(surprises[Math.floor(Math.random() * surprises.length)]);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '999px',
                          border: '1px solid var(--divider)',
                          background: 'var(--surface-1)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <Compass size={16} style={{ color: 'var(--on-surface-muted)' }} />
                        <span>Surprise me</span>
                      </button>

                      {/* Summarize text chip */}
                      <button
                        onClick={() => setInput("Summarize the following text: ")}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '999px',
                          border: '1px solid var(--divider)',
                          background: 'var(--surface-1)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={16} style={{ color: 'var(--on-surface-muted)' }} />
                        <span>Summarize text</span>
                      </button>

                      {/* More chip */}
                      <button
                        onClick={() => setActiveCategory('write')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '999px',
                          border: '1px solid var(--divider)',
                          background: 'var(--surface-1)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <LayoutGrid size={16} style={{ color: 'var(--on-surface-muted)' }} />
                        <span>More</span>
                      </button>
                    </div>
                  </div>
                )}

                {isMobile && showLoggedIn && (
                  <div className={`flex flex-col items-start gap-2 mt-0 w-full max-w-3xl mx-auto px-2 mb-4`}>
                    {activeCategory !== 'write' && (
                      <button 
                        onClick={() => setInput("Create an image of ")} 
                        className="w-full py-3 flex items-center gap-4 text-[15px] font-medium active:scale-95 transition-all text-left"
                        style={{ color: 'var(--on-surface)', backgroundColor: 'transparent' }}
                      >
                        <Image size={22} style={{ color: accentColor }} />
                        <span>Create an image</span>
                      </button>
                    )}

                    <div className={`w-full flex flex-col`} ref={activeCategory === 'write' ? categoryRef : null}>
                      {activeCategory === 'write' ? (
                        <div className="w-full flex flex-col animate-fade-in pb-2 gap-2">
                          {WRITE_SUGGESTIONS.map((s, idx) => (
                            <button 
                              key={idx}
                              onClick={() => { setInput(s.prompt); setActiveCategory(null); }}
                              className="flex items-center gap-4 py-3 text-[15px] font-medium text-left bg-transparent w-full"
                              style={{ color: 'var(--on-surface)' }}
                            >
                              <PenLine size={20} style={{ color: accentColor }} />
                              <span>{s.text}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button 
                          onClick={() => setActiveCategory('write')}
                          className="w-full py-3 flex items-center gap-4 text-[15px] font-medium active:scale-95 transition-all text-left"
                          style={{ color: 'var(--on-surface)', backgroundColor: 'transparent' }}
                        >
                          <PenTool size={22} style={{ color: accentColor }} />
                          <span>Write or edit</span>
                        </button>
                      )}
                    </div>

                    {activeCategory !== 'write' && (
                      <button 
                        onClick={() => setInput("Search for ")}
                        className="w-full py-3 flex items-center gap-4 text-[15px] font-medium active:scale-95 transition-all text-left"
                        style={{ color: 'var(--on-surface)', backgroundColor: 'transparent' }}
                      >
                        <Globe size={22} style={{ color: accentColor }} />
                        <span>Look something up</span>
                      </button>
                    )}

                  </div>
                )}

                {isMobile && !showLoggedIn ? (
                  <div className="w-full px-0 mt-auto">
                    <div className="w-full relative flex items-center border border-divider shadow-2xl transition-all duration-300" 
                      style={{ 
                        background: 'var(--surface-1)', 
                        borderRadius: '999px', 
                        padding: '6px 6px 6px 14px',
                        borderColor: 'var(--divider)',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                      {/* Left: Plus button */}
                      <button 
                        type="button"
                        className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
                        style={{ 
                          color: 'var(--on-surface-muted)',
                          backgroundColor: 'var(--hover-overlay)',
                          border: 'none',
                          flexShrink: 0
                        }}
                        onClick={() => setAuthOpen(true)}
                      >
                        <Plus size={20} />
                      </button>

                      {/* Center: Input field */}
                      <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
                        <input 
                          ref={inputRef}
                          type="text" 
                          value={input} 
                          onChange={(e) => setInput(e.target.value)} 
                          placeholder="Ask Kyra" 
                          style={{ 
                            background: 'transparent',
                            border: 'none',
                            outline: 'none', 
                            color: 'var(--on-surface)',
                            fontSize: '16px',
                            padding: '8px 4px',
                            width: '100%'
                          }}
                          className="temp-placeholder"
                        />
                      </form>

                      {/* Right: Mic and Send buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button 
                          type="button" 
                          onClick={() => setAuthOpen(true)} 
                          className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
                          style={{ 
                            color: 'var(--on-surface-muted)',
                            background: 'transparent',
                            border: 'none'
                          }}
                        >
                          <Mic size={20} />
                        </button>

                        <button 
                          onClick={(e) => {
                            if (!input.trim()) return;
                            handleSend(e);
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{ 
                            background: input.trim() ? accentColor : 'var(--hover-overlay-2)',
                            color: input.trim() ? '#ffffff' : 'var(--on-surface-subtle)',
                            cursor: input.trim() ? 'pointer' : 'not-allowed',
                            border: 'none'
                          }}
                        >
                          <ArrowUp size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full ${isMobile ? 'mt-auto' : 'max-w-[840px] relative group'} px-0`}>
                  <div className={`w-full relative flex ${isMobile ? 'flex-col gap-2' : 'items-center'} border border-divider shadow-2xl transition-all duration-300`} 
                    style={{ 
                      background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
                      borderRadius: isMobile ? '24px' : '32px', 
                      padding: isMobile ? '8px 8px' : '4px 6px 4px 16px',
                      borderColor: isTemporary ? 'transparent' : 'var(--divider)'
                    }}>
                    
                    {!isMobile && (
                      <div className="relative group/tooltip flex items-center justify-center" ref={attachmentRefLanding}>
                        <button 
                          type="button"
                          className="w-10 h-10 flex items-center justify-center rounded-full transition-all"
                          style={{ 
                            color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)') : 'var(--hover-overlay)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          onClick={(e) => { e.stopPropagation(); setShowAttachmentMenuLanding(!showAttachmentMenuLanding); }}
                        >
                          <Plus size={22} />
                        </button>
                        <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                          Attach
                        </div>
                        <AttachmentMenu isOpen={showAttachmentMenuLanding} onClose={() => setShowAttachmentMenuLanding(false)} position="top" />
                      </div>
                    )}
                    
                    <form onSubmit={handleSend} className={`w-full flex ${isMobile ? 'flex-col gap-2' : 'flex-1 items-center gap-3'}`}>
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
                          <div className={`w-full ${isMobile ? 'pt-1 px-3' : 'flex-1'}`}>
                            <input 
                              ref={inputRef}
                              type="text" 
                              value={input} 
                              onChange={(e) => { const val = e.target.value; setInput(val); if(val.trim()) { handleUserTyping(); } else { stopUserTyping(); } }} 
                              placeholder={isSendDisabled ? "Please wait for response to complete..." : (isLoading ? "Kyra is thinking..." : "Ask anything...")} 
                              style={{ 
                                background: 'transparent', border: 'none', outline: 'none', 
                                color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)' 
                              }}
                              className={`w-full bg-transparent border-none outline-none ${isMobile ? 'text-[16px] py-2' : 'px-4 text-[16px] py-3'} temp-placeholder`}
                            />
                          </div>
                          
                          <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'gap-3 ml-auto flex-shrink-0'}`}>
                            
                            {isMobile && (
                              <div className="relative group/tooltip flex items-center justify-center pl-1" ref={attachmentRefLanding}>
                                <button 
                                  type="button"
                                  className="w-10 h-10 flex items-center justify-center rounded-full transition-all bg-hover-overlay"
                                  style={{ 
                                    color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                                  }}
                                  onClick={(e) => { e.stopPropagation(); setShowAttachmentMenuLanding(!showAttachmentMenuLanding); }}
                                >
                                  <Plus size={22} />
                                </button>
                                <AttachmentMenu isOpen={showAttachmentMenuLanding} onClose={() => setShowAttachmentMenuLanding(false)} position="top" />
                              </div>
                            )}

                            <div className={`relative ${isMobile ? 'absolute left-1/2 -translate-x-1/2' : 'ml-4'}`}>
                              <button 
                                type="button"
                                onClick={() => setShowModelSwitcherLanding(!showModelSwitcherLanding)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border"
                                style={{
                                  backgroundColor: isTemporary ? 'transparent' : 'var(--hover-overlay)',
                                  borderColor: isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)') : 'var(--divider)',
                                  color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)'
                                }}
                              >
                                {aiModel === 'GPT-4' && <Zap size={16} className="text-amber-500" />}
                                {aiModel === 'DeepSeek' && <Brain size={16} className="text-blue-500" />}
                                {aiModel === 'Llama' && <Cpu size={16} className="text-emerald-500" />}
                                {aiModel === 'Gemini' && <Sparkles size={16} className="text-indigo-500" />}
                                {!isSmallMobile && <span className="text-[13px] font-semibold">{aiModel}</span>}
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
                                      boxShadow: resolvedTheme === 'dark' ? '0 20px 40px rgba(0,0,0,0.2)' : 'none'
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
                            
                            <div className="flex items-center gap-2 pr-1 ml-auto flex-shrink-0">
                              <div className="relative group/tooltip flex items-center justify-center">
                                <button type="button" onClick={() => { setIsVoiceMessageMode(false); voiceModeRef.current = false; toggleListening(); }} className={`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full bg-hover-overlay ${isListening && !isVoiceMessageMode ? 'animate-pulse bg-red-500/20 text-red-500' : ''}`}
                                  style={{ 
                                    color: isListening 
                                      ? '#ef4444' 
                                      : (isTemporary ? (resolvedTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)') : 'var(--on-surface-muted)') 
                                  }}
                                >
                                  <Mic size={20} className={isListening && !isVoiceMessageMode ? 'scale-110' : ''} />
                                </button>
                                <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                                  Voice
                                </div>
                              </div>
                              
                              {isLoading ? (
                                <button onClick={handleStop} type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-hover-overlay text-on-surface"><Square size={16} fill="currentColor" /></button>
                              ) : (
                                <button 
                                  type={input.trim() ? "submit" : "button"}
                                  disabled={isSendDisabled}
                                  onClick={(e) => {
                                    if (isSendDisabled) {
                                      e.preventDefault();
                                      return;
                                    }
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
                                     background: isSendDisabled ? 'var(--hover-overlay-2)' : accentColor,
                                     color: isSendDisabled ? 'var(--on-surface-subtle)' : '#ffffff',
                                     cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                                     opacity: isSendDisabled ? 0.6 : 1
                                   }}
                                  title={isSendDisabled ? "Please wait for current response to complete" : ""}
                                >
                                  {input.trim() ? <ArrowUp size={20} strokeWidth={2.5} /> : <AudioLines size={20} strokeWidth={2.5} />}
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                </div>
              )}

                {!isMobile && (
                  <div className={`flex flex-wrap items-center justify-center gap-2 w-full max-w-3xl mx-auto px-4`} style={{ marginTop: '40px' }}>
                    {activeCategory !== 'write' && (
                      <button 
                        onClick={() => setInput("Create an image of ")} 
                        className={`px-6 py-3 rounded-full border text-[14px] font-semibold active:scale-95 transition-all ${input.startsWith("Create an image of ") ? 'bg-surface-3 border-divider' : 'bg-surface-1 border-divider'}`}
                        style={{ 
                          borderColor: input.startsWith("Create an image of ") ? accentColor : '',
                          backgroundColor: input.startsWith("Create an image of ") ? `${accentColor}15` : 'transparent'
                        }}
                        onMouseEnter={(e) => { if(!input.startsWith("Create an image of ")) e.currentTarget.style.backgroundColor = `${accentColor}10`; }}
                        onMouseLeave={(e) => { if(!input.startsWith("Create an image of ")) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div className="flex items-center gap-2">
                          <Image size={18} style={{ color: accentColor }} />
                          <span>Create an image</span>
                        </div>
                      </button>
                    )}
                    
                    <div className={`relative ${activeCategory === 'write' ? 'w-full' : ''}`} style={{ minHeight: 48 }} ref={activeCategory === 'write' ? categoryRef : null}>
                      {activeCategory === 'write' ? (
                        <div className="absolute top-0 left-0 w-full flex flex-col animate-fade-in z-[20]" style={{ background: 'var(--bg-primary)', zIndex: 20 }}>
                          {WRITE_SUGGESTIONS.map((s, idx) => (
                            <button 
                              key={idx}
                              onClick={() => { setInput(s.prompt); setActiveCategory(null); }}
                              className="flex items-center gap-4 px-2 py-4 border-b border-divider hover:bg-hover-overlay transition-all text-[15px] font-medium text-left bg-transparent w-full first:border-t"
                              style={{ color: 'var(--on-surface)' }}
                            >
                              <PenLine size={18} style={{ color: accentColor }} />
                              <span>{s.text}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setInput("Help me write or edit "); setActiveCategory('write'); }} 
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
                      )}
                    </div>

                    {activeCategory !== 'write' && (
                      <button 
                        onClick={() => setInput("Search for ")}
                        className="px-6 py-3 rounded-full border bg-surface-1 border-divider text-[14px] font-semibold active:scale-95 transition-all"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${accentColor}10`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div className="flex items-center gap-2">
                          <Globe size={18} style={{ color: accentColor }} />
                          <span>Look something up</span>
                        </div>
                      </button>
                    )}

                  </div>
                )}


              </div>
            </div>
          )}

          {/* Messages View */}
          {(messages.length > 0 || chats.find(c => c.id === activeChatId)?.isGroup) && (
            <div
              className="mx-auto w-full flex flex-col"
              style={{
                maxWidth: chatWidth === 'Wide' ? 'min(1000px, 100%)' : chatWidth === 'Full' ? '100%' : 'min(768px, 100%)',
                padding: '55px 20px 20px',
              }}
            >
            {(() => {
              const getTime = (m) => {
                if (m.timestamp) {
                  if (typeof m.timestamp === 'object' && m.timestamp.seconds) return m.timestamp.seconds * 1000;
                  const d = new Date(m.timestamp);
                  if (!isNaN(d.getTime())) return d.getTime();
                }
                if (typeof m.id === 'string') {
                  const match = m.id.match(/\d+/);
                  if (match) return parseInt(match[0]);
                }
                if (typeof m.id === 'number') return m.id;
                return 0;
              };

              const chat = chats.find(c => c.id === activeChatId);
              const allMessages = [...messages];
              
              if (chat?.isGroup) {
                const groupCreationTime = chat.createdAt || chat.timestamp || Date.now();
                allMessages.push({
                  id: 'group-creation-header',
                  role: 'system',
                  timestamp: groupCreationTime,
                  isGroupCreation: true
                });
              }

              const sortedMessages = allMessages.sort((a, b) => getTime(a) - getTime(b));

              return sortedMessages.map((msg, index) => {
                return (
                  <React.Fragment key={msg.id}>
                    <div className={`w-full flex flex-col gap-4 mb-16 group/msg ${msg.role === 'ai' ? 'mt-8' : ''}`}>
                      {renderMessageView(msg, index)}
                    </div>
                  </React.Fragment>
                );
              })
            })()}

            {/* User typing indicators (Aligned inside messages container) */}
            {chats.find(c => c.id === activeChatId)?.isGroup && (() => {
              const currentChat = chats.find(c => c.id === activeChatId);
              const typingData = currentChat?.typing || {};
              const typingUsers = Object.entries(typingData)
                .filter(([uid, val]) => {
                  if (uid === profile?.uid) return false;
                  if (!val.isTyping) return false;
                  const lastActive = new Date(val.timestamp).getTime();
                  return (Date.now() - lastActive) < 8000;
                })
                .map(([uid, val]) => val);

              if (typingUsers.length === 0) return null;

              return (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginTop: '12px', marginBottom: '16px', paddingLeft: '4px' }} className="animate-fade-in">
                  {/* Avatars stack on bottom-left of the bubble */}
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0px' }}>
                    {typingUsers.slice(0, 3).map((u, i) => (
                      <div key={i} style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--surface-1)',
                        background: 'var(--surface-3)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: i > 0 ? '-8px' : '0px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        flexShrink: 0
                      }}>
                        {u.avatar ? (
                          <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 750, color: 'var(--on-surface-muted)' }}>
                            {(u.displayName || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Content Column (Name on top, Chat bubble underneath) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-subtle)', fontWeight: 550, opacity: 0.7, paddingLeft: '4px' }}>
                      {typingUsers.map(u => u.displayName?.split(' ')[0] || 'Someone').join(', ')} 
                      {typingUsers.length === 1 ? ' is typing' : ' are typing'}
                    </span>
                    
                    {/* Bouncing dots bubble */}
                    <div style={{
                      padding: '10px 16px',
                      borderRadius: '16px 16px 16px 4px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--divider)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ display: 'flex', gap: '4.5px', alignItems: 'center' }}>
                        <span className="typing-dot" style={{ width: '5.5px', height: '5.5px', backgroundColor: 'var(--accent-color, #a855f7)', borderRadius: '50%', animationDelay: '0s' }}></span>
                        <span className="typing-dot" style={{ width: '5.5px', height: '5.5px', backgroundColor: 'var(--accent-color, #a855f7)', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                        <span className="typing-dot" style={{ width: '5.5px', height: '5.5px', backgroundColor: 'var(--accent-color, #a855f7)', borderRadius: '50%', animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* AI thinking indicators — hide if streaming content is already visible in a bubble */}
            {(() => {
              const currentChat = chats.find(c => c.id === activeChatId);
              const isRemoteGenerating = !isLoading && currentChat?.isGenerating;
              // If remote streaming has already started, an AI placeholder will have content — don't show dots
              const streamingAlreadyVisible = isRemoteGenerating && messages.some(m => m.role === 'ai' && m.isPlaceholder && m.content);
              if (!isLoading && !currentChat?.isGenerating) return null;
              if (streamingAlreadyVisible) return null;
              return (
                <div className="flex justify-start animate-fade-in" style={{ paddingLeft: '4px', marginTop: '12px', marginBottom: '16px' }}>
                  <div className="px-0 py-2 flex flex-col gap-2">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full typing-dot" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full typing-dot" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full typing-dot" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    {currentChat?.isGroup && !isLoading && (
                      <span className="text-[10.5px] text-on-surface-subtle/50 tracking-wider thinking-shimmer">Kyra is thinking...</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}



        <div ref={messagesEndRef} className="h-4" />
      </div>
    </main>


      {messages.length > 0 && (
        <footer style={{ padding: '16px 20px', background: 'var(--bg-primary)', position: 'relative' }}>
          <AnimatePresence>
            {showScrollButton && (
              <button
                onClick={() => scrollToBottom(true)}
                className="absolute left-1/2 -translate-x-1/2"
                style={{ 
                  bottom: 'calc(100% + 24px)', 
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
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                  zIndex: 100
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
<ArrowDown size={22} strokeWidth={3} />
              </button>
            )}
          </AnimatePresence>
          <div className={`max-w-3xl mx-auto w-full flex flex-col items-center ${replyingToMsg ? 'gap-0' : 'gap-3'} px-4`}>
            <AnimatePresence>
              {replyingToMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="w-full p-2.5 flex items-center justify-between"
                  style={{
                    background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    borderRadius: '20px 20px 0 0',
                    border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    borderBottom: 'none',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: `${accentColor}15` }}>
                      <Reply size={16} style={{ color: accentColor }} />
                    </div>
                    <p className="text-[14.5px] font-medium truncate" style={{ color: 'var(--on-surface)' }}>
                      <span className="opacity-40 font-normal mr-1.5 font-serif">“</span>
                      {replyingToMsg.content}
                      <span className="opacity-40 font-normal ml-1.5 font-serif">”</span>
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setReplyingToMsg(null)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-on-surface/10 transition-colors ml-2"
                  >
                    <X size={16} className="opacity-60" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className={`w-full relative flex ${isMobile ? 'flex-col gap-2' : 'items-center'} transition-all duration-300`}
              style={{ 
              width: '100%', 
              background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
              borderRadius: replyingToMsg ? (isMobile ? '0 0 24px 24px' : '0 0 26px 26px') : (isMobile ? '24px' : '26px'), 
              padding: isMobile ? '8px 8px' : '4px 6px 4px 16px', border: '1px solid var(--divider)',
              borderTop: replyingToMsg ? 'none' : '1px solid var(--divider)',
              transition: 'all 0.3s ease'
            }}>                
                {!isMobile && (
                  <div className="relative group/tooltip flex items-center justify-center" ref={attachmentRefFooter}>
                    <button 
                      type="button"
                      onMouseEnter={() => setHoveredPlus(true)} 
                      onMouseLeave={() => setHoveredPlus(false)} 
                      onClick={(e) => { e.stopPropagation(); setShowAttachmentMenu(!showAttachmentMenu); }} 
                      className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
                      style={{
                        color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                        backgroundColor: hoveredPlus ? (isTemporary ? (resolvedTheme === 'dark' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)') : 'var(--hover-overlay)') : 'transparent'
                      }}
                    >
                      <Plus size={20} />
                    </button>
                    <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                      Attach
                    </div>
                    <AttachmentMenu isOpen={showAttachmentMenu} onClose={() => setShowAttachmentMenu(false)} position="top" />
                  </div>
                )}

              <form onSubmit={handleSend} className={`w-full flex ${isMobile ? 'flex-col gap-2' : 'flex-1 items-center gap-3'}`} style={{ flex: isMobile ? 'none' : 1 }}>
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
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' } }
                        >
                          <Check size={18} strokeWidth={3} />
                        </button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className={`w-full ${isMobile ? 'pt-1 px-3' : 'flex-1'}`}>
                      <input 
                        ref={footerInputRef}
                        type="text" 
                        value={input} 
                        onChange={(e) => { const val = e.target.value; setInput(val); if(val.endsWith('/')) setShowAttachmentMenu(true); if(val.trim()) { handleUserTyping(); } else { stopUserTyping(); } }} 
                        placeholder={isSendDisabled ? "Please wait for response to complete..." : (isLoading ? "Kyra is thinking..." : "Ask anything...")} 
                        className={`w-full bg-transparent border-none outline-none ${isMobile ? 'text-[16px] py-2' : 'temp-placeholder'}`}
                        style={{ 
                          background: 'transparent', border: 'none', outline: 'none', 
                          color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)', fontSize: 16, padding: isMobile ? '0' : (isSmallMobile ? '12px 8px' : '12px 14px')
                        }} 
                      />
                    </div>
                    
                    <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'gap-3 ml-auto flex-shrink-0'}`}>
                      
                      {isMobile && (
                        <div className="relative group/tooltip flex items-center justify-center pl-1" ref={attachmentRefFooter}>
                          <button 
                            type="button"
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-all bg-hover-overlay"
                            style={{ 
                              color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                            }}
                            onClick={(e) => { e.stopPropagation(); setShowAttachmentMenu(!showAttachmentMenu); }}
                          >
                            <Plus size={22} />
                          </button>
                          <AttachmentMenu isOpen={showAttachmentMenu} onClose={() => setShowAttachmentMenu(false)} position="top" />
                        </div>
                      )}

                      <div className={`relative ${isMobile ? 'absolute left-1/2 -translate-x-1/2' : 'ml-4'}`}>
                        <button 
                          type="button"
                          onClick={() => setShowModelSwitcher(!showModelSwitcher)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border"
                          style={{
                            backgroundColor: isTemporary ? 'transparent' : 'var(--hover-overlay)',
                            borderColor: isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)') : 'var(--divider)',
                            color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)'
                          }}
                        >
                          {aiModel === 'GPT-4' && <Zap size={16} className="text-amber-500" />}
                          {aiModel === 'DeepSeek' && <Brain size={16} className="text-blue-500" />}
                          {aiModel === 'Llama' && <Cpu size={16} className="text-emerald-500" />}
                          {aiModel === 'Gemini' && <Sparkles size={16} className="text-indigo-500" />}
                          {!isSmallMobile && <span className="text-[13px] font-semibold">{aiModel}</span>}
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
                                boxShadow: resolvedTheme === 'dark' ? '0 20px 40px rgba(0,0,0,0.2)' : 'none'
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

                      <div className="flex items-center gap-2 pr-1 ml-auto flex-shrink-0">
                           {!isLoading && (
                             <div className="relative group/tooltip flex items-center justify-center">
                               <button 
                                 type="button" 
                                 onClick={() => { setIsVoiceMessageMode(false); voiceModeRef.current = false; toggleListening(); }}
                                 className={`w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full ${isListening && !isVoiceMessageMode ? 'animate-pulse bg-red-500/10' : 'bg-hover-overlay'}`}
                                 style={{ 
                                   color: isListening && !isVoiceMessageMode
                                     ? '#ef4444' 
                                     : (isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)') : 'var(--on-surface-muted)') 
                                 }}
                               >
                                 <Mic size={20} className={isListening && !isVoiceMessageMode ? 'scale-110' : ''} />
                               </button>
                               <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                                 Voice
                               </div>
                             </div>
                           )}

                           {isLoading ? (
                              <div className="relative group/tooltip flex items-center justify-center">
                                <button 
                                  type="button"
                                  onClick={handleStop}
                                  className="group/stop relative flex items-center justify-center transition-all duration-300 active:scale-90"
                                  style={{ 
                                    width: 40, height: 40, borderRadius: '50%', 
                                    background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', 
                                    color: accentColor, 
                                    border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                    cursor: 'pointer' 
                                  }}
                                >
                                  <Square size={14} fill={accentColor} className="group-hover/stop:scale-110 transition-transform" />
                                </button>
                                <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                                  Stop answering
                                </div>
                              </div>
                            ) : (
                            <button 
                              type={input.trim() ? "submit" : "button"}
                              disabled={isSendDisabled}
                              onClick={(e) => {
                                if (isSendDisabled) {
                                  e.preventDefault();
                                  return;
                                }
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
                                background: isSendDisabled ? 'var(--hover-overlay-2)' : accentColor, 
                                color: isSendDisabled ? 'var(--on-surface-subtle)' : '#ffffff', 
                                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                transition: 'all 0.3s ease', cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                                opacity: isSendDisabled ? 0.6 : 1
                              }}
                              title={isSendDisabled ? "Please wait for current response to complete" : ""}
                            >
                              {input.trim() ? <ArrowUp size={20} strokeWidth={2.5} /> : <AudioLines size={20} strokeWidth={2.5} />}
                            </button>
                          )}
                        </div>
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
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        chatId={shareChatId}
      />
      <GroupChatModal
        isOpen={isGroupChatModalOpen}
        onClose={() => setIsGroupChatModalOpen(false)}
      />

      <AnimatePresence>
        {activeReactionPickerMsgId && (
          <EmojiReactionModal
            isOpen={!!activeReactionPickerMsgId}
            onClose={() => setActiveReactionPickerMsgId(null)}
            resolvedTheme={resolvedTheme}
            onSelectEmoji={(emoji) => {
              const userName = profile?.displayName || 'User';
              setMsgReactions(prev => ({ ...prev, [activeReactionPickerMsgId]: { emoji, user: userName } }));
              setActiveReactionPickerMsgId(null);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {msgDeleteConfirm.open && (
          <MessageDeleteModal
            isOpen={msgDeleteConfirm.open}
            onClose={() => setMsgDeleteConfirm({ open: false, id: null })}
            onConfirm={async () => {
              const msgId = msgDeleteConfirm.id;
              const currentChat = chats.find(c => c.id === activeChatId);
              
              if (currentChat?.isGroup) {
                try {
                  const chatRef = doc(db, 'chats', activeChatId);
                  const docSnap = await getDoc(chatRef);
                  if (docSnap.exists()) {
                    const currentMsgs = docSnap.data().messages || [];
                    const updatedMsgs = currentMsgs.map(m => 
                      m.id === msgId ? { ...m, isDeleted: true } : m
                    );
                    await updateDoc(chatRef, { messages: updatedMsgs });
                  }
                } catch (err) {
                  console.error("Failed to delete message for everyone:", err);
                }
              } else {
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeleted: true } : m));
              }
              setMsgDeleteConfirm({ open: false, id: null });
            }}
            resolvedTheme={resolvedTheme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExitConfirmOpen && (
          <ExitConfirmModal
            isOpen={isExitConfirmOpen}
            onClose={() => setIsExitConfirmOpen(false)}
            onConfirm={() => {
              leaveGroup(activeChatId);
              setIsExitConfirmOpen(false);
              createNewChat();
            }}
            resolvedTheme={resolvedTheme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EmojiReactionModal = ({ isOpen, onClose, onSelectEmoji, resolvedTheme }) => {
  if (!isOpen) return null;
  
  const smileys = [
    'ðŸ˜€', 'ðŸ˜ƒ', 'ðŸ˜„', 'ðŸ˜', 'ðŸ˜†', 'ðŸ˜…', 'ðŸ˜‚', 'ðŸ¤£',
    'ðŸ¥²', 'â˜ºï¸', 'ðŸ˜Š', 'ðŸ˜‡', 'ðŸ™‚', 'ðŸ™ƒ', 'ðŸ˜‰', 'ðŸ˜Œ',
    'ðŸ˜', 'ðŸ¥°', 'ðŸ˜˜', 'ðŸ˜—', 'ðŸ˜™', 'ðŸ˜š', 'ðŸ˜‹', 'ðŸ˜›',
    'ðŸ˜', 'ðŸ˜œ', 'ðŸ¤ª', 'ðŸ¤¨', 'ðŸ§', 'ðŸ¤“', 'ðŸ˜Ž', 'ðŸ¥¸',
    'ðŸ¤©', 'ðŸ¥³', 'ðŸ˜', 'ðŸ˜’', 'ðŸ˜ž', 'ðŸ˜”', 'ðŸ˜Ÿ', 'ðŸ˜•',
    'ðŸ™', 'â˜¹ï¸', 'ðŸ˜£', 'ðŸ˜–', 'ðŸ˜«', 'ðŸ˜©', 'ðŸ¥º', 'ðŸ˜¢',
    'ðŸ˜­', 'ðŸ˜¤', 'ðŸ˜ ', 'ðŸ˜¡', 'ðŸ¤¬', 'ðŸ¤¯', 'ðŸ˜³', 'ðŸ¥µ',
    'ðŸ¥¶', 'ðŸ˜±', 'ðŸ˜¨', 'ðŸ˜°', 'ðŸ˜¥', 'ðŸ˜“', 'ðŸ¤—', 'ðŸ¤”',
    'ðŸ«£', 'ðŸ¤­', 'ðŸ¤«', 'ðŸ¤¥', 'ðŸ˜¶', 'ðŸ˜', 'ðŸ˜‘', 'ðŸ˜¬',
    'ðŸ™„', 'ðŸ˜¯', 'ðŸ˜¦', 'ðŸ˜§', 'ðŸ˜®', 'ðŸ˜²', 'ðŸ¥±', 'ðŸ˜´',
    'ðŸ¤¤', 'ðŸ˜ª', 'ðŸ˜µ', 'ðŸ¤', 'ðŸ¥´', 'ðŸ¤¢', 'ðŸ¤®', 'ðŸ¤§',
    'ðŸ˜·', 'ðŸ¤’', 'ðŸ¤•', 'ðŸ¤‘', 'ðŸ¤ ', 'ðŸ˜ˆ', 'ðŸ‘¿', 'ðŸ‘¹',
    'ðŸ‘º', 'ðŸ¤¡', 'ðŸ’©', 'ðŸ‘»', 'ðŸ’€', 'â˜ ï¸', 'ðŸ‘½', 'ðŸ‘¾',
    'ðŸ¤–', 'ðŸŽƒ', 'ðŸ˜º', 'ðŸ˜¸', 'ðŸ˜¹', 'ðŸ˜»', 'ðŸ˜¼', 'ðŸ˜½',
    'ðŸ™€', 'ðŸ˜¿', 'ðŸ˜¾', 'ðŸ«¶', 'ðŸ‘', 'ðŸ¤²', 'ðŸ™Œ', 'ðŸ‘',
    'ðŸ’›', 'ðŸ’š', 'ðŸ’™', 'ðŸ’œ', 'ðŸ–¤', 'ðŸ¤', 'ðŸ¤Ž', 'ðŸ’”'
  ];

  return createPortal(
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '380px',
          height: '420px',
          background: resolvedTheme === 'dark' ? '#212121' : '#fff',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: resolvedTheme === 'dark' ? '#fff' : '#000' }}>Choose a Reaction</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)', 
              borderRadius: '8px', color: resolvedTheme === 'dark' ? '#fff' : '#000', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px'
            }}
          >
            <X size={16} />
          </button>
        </div>
        
        <div style={{ padding: '0 16px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: resolvedTheme === 'dark' ? '#aaa' : '#666', letterSpacing: '0.05em' }}>SMILEYS & EMOTION</span>
          <div style={{ flex: 1, height: '1px', background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px 16px',
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px',
          alignContent: 'start'
        }} className="custom-scrollbar">
          {smileys.map((emoji, i) => (
            <button
              key={i}
              onClick={() => onSelectEmoji(emoji)}
              style={{
                background: 'transparent', border: 'none', fontSize: '22px', 
                cursor: 'pointer', borderRadius: '8px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {emoji}
            </button>
          ))}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const MessageDeleteModal = ({ isOpen, onClose, onConfirm, resolvedTheme }) => {
  if (!isOpen) return null;
  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '400px', background: resolvedTheme === 'dark' ? 'var(--surface-1)' : '#fff',
          borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        <h3 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, marginBottom: '14px', fontFamily: 'inherit' }}>Delete message?</h3>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '14.5px', lineHeight: 1.55, marginBottom: '24px' }}>
          Are you sure you want to delete this message? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: '999px', background: 'transparent', color: 'var(--on-surface)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--divider)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '8px 20px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const GroupChatModal = ({ isOpen, onClose }) => {
  const { resolvedTheme, convertToGroupChat, activeChatId, groupChatTargetId, showLoggedIn, setAuthOpen } = useAppContext();
  
  if (!isOpen) return null;

  const handleStartGroup = () => {
    if (!showLoggedIn) {
      setAuthOpen(true);
      onClose();
      return;
    }
    convertToGroupChat(groupChatTargetId || activeChatId);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 9999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '480px',
            padding: '32px',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.45)',
            border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            position: 'relative'
          }}
        >
          <h2 style={{ 
            fontSize: '20px', fontWeight: 700, color: resolvedTheme === 'dark' ? '#fff' : '#000', 
            marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: '1.3'
          }}>
            Start group chat from this conversation
          </h2>
          
          <p style={{ 
            fontSize: '15px', lineHeight: '1.6', 
            color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            marginBottom: '32px'
          }}>
            Only this conversation will be shared. Your personal Kyra memory is always private.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              style={{ 
                background: 'none', border: 'none', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0,
                textDecoration: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.color = resolvedTheme === 'dark' ? '#fff' : '#000'}
              onMouseLeave={e => e.currentTarget.style.color = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}
            >
              Learn more
            </button>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '11px 24px', borderRadius: '999px',
                  background: resolvedTheme === 'dark' ? '#2c2c2e' : '#f2f2f2',
                  border: 'none', color: resolvedTheme === 'dark' ? '#fff' : '#000',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? '#3a3a3c' : '#e5e5e5'}
                onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? '#2c2c2e' : '#f2f2f2'}
              >
                Cancel
              </button>
              <button
                onClick={handleStartGroup}
                style={{
                  padding: '11px 24px', borderRadius: '999px',
                  background: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
                  color: resolvedTheme === 'dark' ? '#000000' : '#ffffff',
                  border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Start group chat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const ShareModal = ({ isOpen, onClose, chatId }) => {
  const { chats, activeChatId, aiModel, resolvedTheme } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return null;

  const targetChat = chats.find(c => c.id === (chatId || activeChatId));
  const messages = targetChat?.messages || [];
  const chatTitle = targetChat?.title || 'New Chat';
  const displayTitle = chatTitle || 'Aura AI Chat';
  const accentColor = 'var(--accent-color)'; 

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ 
              opacity: 0, 
              y: 200, 
              x: -100, 
              rotate: -15,
              transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } 
            }}
            style={{ 
              position: 'relative', width: '100%', maxWidth: '540px', 
              background: resolvedTheme === 'dark' ? '#1a1a1c' : '#ffffff', 
              border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
              borderRadius: '32px', overflow: 'hidden', 
              boxShadow: resolvedTheme === 'dark' ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)', 
              zIndex: 1000001 
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button 
                onClick={onClose}
                style={{ 
                  position: 'absolute', top: '24px', right: '24px', width: '40px', height: '40px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', 
                  background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
                  border: 'none', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', 
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; 
                  e.currentTarget.style.color = resolvedTheme === 'dark' ? '#fff' : '#000'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; 
                  e.currentTarget.style.color = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'; 
                }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '22px', fontWeight: '700', color: resolvedTheme === 'dark' ? '#fff' : '#111', marginBottom: '32px', textAlign: 'center', width: '100%', paddingRight: '32px' }}>
                {displayTitle}
              </h2>

              {/* Preview Card */}
              <div style={{ 
                width: '100%', background: resolvedTheme === 'dark' ? '#2a2a2c' : '#f8f8f8', 
                borderRadius: '20px', padding: '24px', 
                marginBottom: '40px', border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.8, transform: 'scale(0.98)', transformOrigin: 'top center' }}>
                  {messages.slice(0, 2).map((msg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        background: msg.role === 'user' ? '#f97316' : '#10b981' 
                      }}>
                        {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
                      </div>
                      <div style={{ 
                        padding: '12px', borderRadius: '16px', fontSize: '13px', 
                        background: msg.role === 'user' ? 'rgba(249,115,22,0.15)' : (resolvedTheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)'), 
                        color: msg.role === 'user' ? (resolvedTheme === 'dark' ? '#fed7aa' : '#c2410c') : (resolvedTheme === 'dark' ? '#fff' : '#000'),
                        maxWidth: '85%',
                        fontWeight: 500,
                        lineHeight: '1.4'
                      }}>
                        {msg.content.slice(0, 150)}{msg.content.length > 150 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px',
                  background: `linear-gradient(to top, ${resolvedTheme === 'dark' ? '#2a2a2c' : '#f8f8f8'}, transparent)`, 
                  pointerEvents: 'none',
                  opacity: 0.8
                }} />
                <div style={{ 
                  position: 'absolute', bottom: '16px', right: '24px', fontSize: '13px', fontWeight: '800', 
                  color: resolvedTheme === 'dark' ? '#ffffff' : '#000000', 
                  letterSpacing: '0.05em', zIndex: 1,
                  opacity: resolvedTheme === 'dark' ? 0.6 : 0.7,
                  textTransform: 'uppercase'
                }}>Kyra</div>
              </div>

              {/* Social Share Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={handleCopyLink}
                    style={{ 
                      width: '56px', height: '56px', borderRadius: '50%', background: accentColor, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', 
                      border: 'none', cursor: 'pointer', transition: 'transform 0.2s',
                      boxShadow: `0 10px 20px ${accentColor}33` 
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {copied ? <Check size={22} strokeWidth={2.5} color="white" /> : <Copy size={20} strokeWidth={2.5} color="white" />}
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>{copied ? 'Copied!' : 'Copy link'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <button style={{ 
                    width: '56px', height: '56px', borderRadius: '50%', background: accentColor, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', 
                    border: 'none', cursor: 'pointer', transition: 'transform 0.2s',
                    boxShadow: `0 10px 20px ${accentColor}33` 
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>X</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <button style={{ 
                    width: '56px', height: '56px', borderRadius: '50%', background: accentColor, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', 
                    border: 'none', cursor: 'pointer', transition: 'transform 0.2s',
                    boxShadow: `0 10px 20px ${accentColor}33` 
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>LinkedIn</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <button style={{ 
                    width: '56px', height: '56px', borderRadius: '50%', background: accentColor, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', 
                    border: 'none', cursor: 'pointer', transition: 'transform 0.2s',
                    boxShadow: `0 10px 20px ${accentColor}33` 
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.04.21.06.42.06.63 0 2.656-2.936 4.808-6.54 4.808-3.604 0-6.54-2.152-6.54-4.808 0-.21.02-.42.06-.63A1.748 1.748 0 0 1 4.75 11.95c0-.968.786-1.754 1.754-1.754.463 0 .875.18 1.185.47 1.2-.833 2.83-1.389 4.63-1.47 l.884-4.14a.25.25 0 0 1 .311-.19l2.76.581c.143-.45.565-.774 1.066-.774zM9.36 12.388c-.68 0-1.233.553-1.233 1.233s.553 1.233 1.233 1.233 1.233-.553 1.233-1.233-.553-1.233-1.233-1.233zm5.28 0c-.68 0-1.233.553-1.233 1.233s.553 1.233 1.233 1.233 1.233-.553 1.233-1.233-.553-1.233-1.233-1.233zm-5.32 3.193s.34.42 1.68.42c1.34 0 1.68-.42 1.68-.42a.125.125 0 0 0-.197-.154c-.233.15-.71.304-1.483.304-.773 0-1.25-.154-1.483-.304a.125.125 0 0 0-.197.154z" />
                    </svg>
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>Reddit</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const PeopleModal = ({ isOpen, onClose, onAddPeople, activeChat }) => {
  const { resolvedTheme, profile } = useAppContext();
  const isAdmin = activeChat?.creator?.uid === profile?.uid;
  
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 9999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '420px',
            padding: '20px',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.45)',
            border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ 
              fontSize: '18px', fontWeight: 600, color: resolvedTheme === 'dark' ? '#fff' : '#000', 
              letterSpacing: '-0.01em', margin: 0
            }}>
              People
            </h2>
            <button 
              onClick={onClose}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                background: 'transparent', color: resolvedTheme === 'dark' ? '#fff' : '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ height: '1px', background: 'var(--divider)', margin: '0 -20px 18px -20px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
              background: 'var(--hover-overlay-2)', border: '1px solid var(--divider)'
            }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} style={{ color: 'var(--on-surface-subtle)' }} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: resolvedTheme === 'dark' ? '#fff' : '#000', fontSize: '14.5px' }}>
                {profile?.displayName || 'User'}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--on-surface-muted)', marginTop: '0px' }}>
                You · {profile?.email || 'user@example.com'} · {isAdmin ? 'admin' : 'member'}
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--divider)', margin: '0 -20px 18px -20px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 600, color: resolvedTheme === 'dark' ? '#fff' : '#000' }}>
              Add people
            </span>
            <button
              onClick={onAddPeople}
              style={{
                padding: '7px 18px', borderRadius: '999px',
                background: resolvedTheme === 'dark' ? '#2c2c2e' : '#f2f2f2',
                color: resolvedTheme === 'dark' ? '#fff' : '#000',
                border: 'none', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? '#3a3a3c' : '#e5e5e5'}
              onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? '#2c2c2e' : '#f2f2f2'}
            >
              Add
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const DeleteGroupModal = ({ isOpen, onClose, onConfirm, groupName }) => {
  const { resolvedTheme } = useAppContext();
  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '24px',
          border: '1px solid var(--divider)',
          padding: '28px',
          width: '420px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        <h3 style={{
          color: 'var(--on-surface)',
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '14px'
        }}>
          Delete group?
        </h3>

        <p style={{
          color: 'var(--on-surface-muted)',
          fontSize: '14.5px',
          lineHeight: 1.55,
          marginBottom: '24px'
        }}>
          This will delete <strong style={{ color: 'var(--on-surface)' }}>{groupName || 'this group'}</strong>. All messages and media in this chat will be lost.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 22px',
              borderRadius: '999px',
              background: 'var(--hover-overlay-2)',
              color: 'var(--on-surface-muted)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--divider)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 22px',
              borderRadius: '999px',
              background: '#e53e3e',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const RenameGroupModal = ({ isOpen, onClose, onConfirm, initialValue }) => {
  const [value, setValue] = useState(initialValue);
  const { resolvedTheme, accentColor } = useAppContext();

  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '24px',
          border: '1px solid var(--divider)',
          padding: '24px',
          width: '420px',
          boxShadow: resolvedTheme === 'dark' ? '0 30px 60px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <h3 style={{
          color: 'var(--on-surface)',
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          Rename group chat
        </h3>

        <div style={{
          background: 'var(--hover-overlay)',
          border: '1px solid var(--divider)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '24px'
        }}>
          <input
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onConfirm(value); }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--on-surface)',
              fontSize: '16px',
              outline: 'none',
              fontWeight: 500
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              background: 'var(--hover-overlay-2)',
              color: 'var(--on-surface-muted)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--divider)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(value)}
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              background: accentColor || 'var(--on-surface)',
              color: accentColor ? '#fff' : 'var(--bg-primary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Rename
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const GroupLinkModal = ({ isOpen, onClose, chatId }) => {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme, accentColor } = useAppContext();
  const [baseUrl, setBaseUrl] = useState('https://aura-ai.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const groupUrl = `${baseUrl}/g/${chatId || 'new'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(groupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '28px',
          border: '1px solid var(--divider)',
          padding: '28px',
          width: 'calc(100% - 40px)',
          maxWidth: '460px',
          boxShadow: resolvedTheme === 'dark' ? '0 40px 80px rgba(0,0,0,0.6)' : '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <h3 style={{
          color: 'var(--on-surface)',
          fontSize: '22px',
          fontWeight: 600,
          marginBottom: '20px',
          letterSpacing: '-0.4px'
        }}>
          Group link
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: accentColor ? `${accentColor}15` : 'var(--hover-overlay)',
          border: `1px solid ${accentColor ? `${accentColor}40` : 'var(--divider)'}`,
          borderRadius: '14px',
          padding: '12px 16px',
          marginBottom: '20px'
        }}>
          <div style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--on-surface)',
            fontSize: '15px',
            fontFamily: 'monospace'
          }}>
            {groupUrl}
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--on-surface-muted)', cursor: 'pointer' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        <p style={{
          color: 'var(--on-surface-muted)',
          fontSize: '14px',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          Use a group link to invite others to join your group chat. Anyone can join your group chat with this link, and they'll be able to see the previous messages in this group chat.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: 'var(--hover-overlay-2)',
              color: 'var(--on-surface)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--divider)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-overlay-2)'}
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: accentColor || 'var(--on-surface)',
              color: accentColor ? '#fff' : 'var(--bg-primary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              transform: copied ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const ReportModal = ({ isOpen, onClose }) => {
  const { resolvedTheme, accentColor } = useAppContext();
  const [selectedOption, setSelectedOption] = useState(null);

  if (!isOpen) return null;

  const options = [
    "Violence & self-harm",
    "Sexual exploitation & abuse",
    "Child/teen exploitation",
    "Bullying & harassment",
    "Spam, fraud & deception",
    "Privacy violation",
    "Intellectual property",
    "Age-inappropriate content",
    "Something else"
  ];

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 999999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '24px',
          width: 'calc(100% - 40px)',
          maxWidth: '440px',
          padding: '24px',
          position: 'relative',
          boxShadow: resolvedTheme === 'dark' ? '0 40px 80px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid var(--divider)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0' }}>Report group chat</h2>
            <p style={{ color: 'var(--on-surface)', fontSize: '15px', fontWeight: 500, margin: 0 }}>Why are you reporting this conversation?</p>
          </div>
          <button 
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--divider)',
              background: 'transparent', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {options.map((option, idx) => (
            <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--on-surface)', fontSize: '14.5px' }}>
              <div 
                onClick={() => setSelectedOption(option)}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedOption === option ? (accentColor || 'var(--on-surface)') : (resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}
              >
                {selectedOption === option && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: accentColor || 'var(--on-surface)' }} />}
              </div>
              <span>{option}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            disabled={!selectedOption}
            style={{
              padding: '10px 24px', borderRadius: '999px',
              background: selectedOption ? (accentColor || 'var(--on-surface)') : 'var(--hover-overlay)',
              color: selectedOption ? (accentColor ? '#fff' : 'var(--bg-primary)') : 'var(--on-surface-subtle)',
              fontSize: '14px', fontWeight: 600, border: 'none', cursor: selectedOption ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const MsgDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '24px',
          border: '1px solid var(--divider)',
          padding: '28px',
          width: '380px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        <h3 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, marginBottom: '14px' }}>
          Delete message?
        </h3>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '14.5px', lineHeight: 1.5, marginBottom: '24px' }}>
          This will remove the message from your view. Other participants will still be able to see it.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: '999px',
              background: 'var(--hover-overlay-2)', color: 'var(--on-surface-muted)',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--divider)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px', borderRadius: '999px',
              background: '#e53e3e', color: '#fff',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none'
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const ExitConfirmModal = ({ isOpen, onClose, onConfirm, resolvedTheme }) => {
  if (!isOpen) return null;
  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 100000000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '400px', background: resolvedTheme === 'dark' ? 'var(--surface-1)' : '#fff',
          borderRadius: '24px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid var(--divider)'
        }}
      >
        <h3 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, marginBottom: '14px', fontFamily: 'inherit' }}>Exit group?</h3>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '14.5px', lineHeight: 1.55, marginBottom: '24px' }}>
          Are you sure you want to leave this group? You will no longer be able to see or send messages in this chat.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 22px', borderRadius: '999px', background: 'var(--hover-overlay-2)', color: 'var(--on-surface-muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--divider)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '9px 22px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
          >
            Exit
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default ChatWindow;
