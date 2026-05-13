'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('aura-theme') || 'dark';
  });
  const [chatTheme, setChatTheme] = useState(() => {
    if (typeof window === 'undefined') return 'classic';
    return localStorage.getItem('aura-chat-theme') || 'classic';
  });
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'Auto-detect';
    return localStorage.getItem('aura-language') || 'Auto-detect';
  });
  const [accentColor, setAccentColorState] = useState(() => {
    if (typeof window === 'undefined') return '#6366f1';
    return localStorage.getItem('aura-accent') || '#6366f1';
  });
  const [isSidebarOpen, setIsSidebarOpenState] = useState(true);
  const [isSidebarInitializing, setIsSidebarInitializing] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura-sidebar-open');
      if (saved !== null) {
        setIsSidebarOpenState(JSON.parse(saved));
      }
      setIsSidebarInitializing(false);
    }
  }, []);

  const setIsSidebarOpen = (val) => {
    setIsSidebarOpenState(val);
    localStorage.setItem('aura-sidebar-open', JSON.stringify(val));
  };
  const [appView, setAppView] = useState('chat');
  const [resolvedTheme, setResolvedTheme] = useState('dark');

  const [chats, setChats] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('aura-chats') || '[]'); }
    catch { return []; }
  });

  // ── Archived Chats ─────────────────────────────────────────────────────────
  const [archivedChats, setArchivedChatsState] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('aura-archived-chats') || '[]'); }
    catch { return []; }
  });

  const [archivePassword, setArchivePasswordState] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('aura-archive-password') || '';
  });

  const setArchivePassword = (pwd) => {
    setArchivePasswordState(pwd);
    if (pwd) localStorage.setItem('aura-archive-password', pwd);
    else localStorage.removeItem('aura-archive-password');
  };

  const archiveChat = useCallback((id) => {
    setChats(prev => {
      const chat = prev.find(c => c.id === id);
      if (!chat) return prev;
      // Already archived? skip
      setArchivedChatsState(a => {
        if (a.find(c => c.id === id)) return a;
        const updated = [{ ...chat, archivedAt: Date.now() }, ...a];
        localStorage.setItem('aura-archived-chats', JSON.stringify(updated));
        return updated;
      });
      const filtered = prev.filter(c => c.id !== id);
      localStorage.setItem('aura-chats', JSON.stringify(filtered));
      return filtered;
    });
  }, []);

  const unarchiveChat = useCallback((id) => {
    setArchivedChatsState(prev => {
      const chat = prev.find(c => c.id === id);
      if (chat) {
        const { archivedAt, ...rest } = chat;
        setChats(c => {
          if (c.find(x => x.id === id)) return c; // Avoid duplicate
          const updatedChats = [rest, ...c];
          localStorage.setItem('aura-chats', JSON.stringify(updatedChats));
          return updatedChats;
        });
        
        // If we are currently viewing this archived chat, close the archive view
        setViewingArchivedChat(currentView => {
          if (currentView && currentView.id === id) {
            setActiveChatId(id); // Switch to it as a normal chat
            return null; // Close archive view
          }
          return currentView;
        });
      }
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('aura-archived-chats', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── View Archived Chat (read-only, no recent save) ──────────────────────
  const [viewingArchivedChat, setViewingArchivedChat] = useState(null);

  const openArchivedChat = useCallback((chat) => {
    setViewingArchivedChat(chat);
  }, []);

  const closeArchivedChat = useCallback(() => {
    setViewingArchivedChat(null);
  }, []);
  // ──────────────────────────────────────────────────────────────────────────

  const [activeChatId, setActiveChatId] = useState(null);

  const [messages, setMessages] = useState([]);

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  
  const [fontSize, setFontSizeState] = useState(() => {
    if (typeof window === 'undefined') return 'Medium';
    return localStorage.getItem('aura-font-size') || 'Medium';
  });
  const [chatWidth, setChatWidthState] = useState(() => {
    if (typeof window === 'undefined') return 'Standard';
    return localStorage.getItem('aura-chat-width') || 'Standard';
  });
  const [lineHeight, setLineHeightState] = useState(() => {
    if (typeof window === 'undefined') return 'Normal';
    return localStorage.getItem('aura-line-height') || 'Normal';
  });
  const [aiModel, setAiModelState] = useState(() => {
    if (typeof window === 'undefined') return 'Gemini';
    return localStorage.getItem('aura-ai-model') || 'Gemini';
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareChatId, setShareChatId] = useState(null);
  const [isGroupLinkModalOpen, setIsGroupLinkModalOpen] = useState(false);
  const [groupLinkChatId, setGroupLinkChatId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);


  const [personalization, setPersonalizationState] = useState(() => {
    const defaults = {
      baseStyle: 'Default', warm: 'Default', enthusiastic: 'Default',
      headers: 'Default', emoji: 'Default', fastAnswers: true,
      customInstructions: '', aboutYou: '', voice: 'Kyra',
    };
    if (typeof window === 'undefined') return defaults;
    try {
      const saved = localStorage.getItem('aura-personalization');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch { return defaults; }
  });

  const [profile, setProfileState] = useState(() => {
    const defaults = {
      displayName: '',
      username: '',
      email: '',
      avatar: null,
    };
    if (typeof window === 'undefined') return defaults;
    try {
      const saved = localStorage.getItem('aura-profile');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch { return defaults; }
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--chat-bubble-user', accentColor);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-chat-theme', chatTheme);
    setIsInitializing(false);

    let isFirstCall = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const savedProfile = localStorage.getItem('aura-profile');
        let currentProfile = savedProfile ? JSON.parse(savedProfile) : null;
        
        // Always try to get the best avatar available
        const photoURL = firebaseUser.photoURL || firebaseUser.providerData?.[0]?.photoURL;
        const avatarUrl = photoURL || currentProfile?.avatar || null;
        
        const updatedProfile = {
          displayName: firebaseUser.displayName || currentProfile?.displayName || 'User',
          username: firebaseUser.email?.split('@')[0] || currentProfile?.username || 'user',
          email: firebaseUser.email || currentProfile?.email || '',
          avatar: avatarUrl,
        };
        
        setProfileState(updatedProfile);
        localStorage.setItem('aura-profile', JSON.stringify(updatedProfile));
        setIsAuthLoading(false);
      } else {
        const hasLocalProfile = !!localStorage.getItem('aura-profile');
        if (isFirstCall && hasLocalProfile) {
          setTimeout(() => {
            if (!auth.currentUser) { setUser(null); setIsAuthLoading(false); }
          }, 1000);
        } else {
          setUser(null);
          setIsAuthLoading(false);
        }
      }
      isFirstCall = false;
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, [theme]);


  useEffect(() => {
    if (!isInitializing) localStorage.setItem('aura-chats', JSON.stringify(chats));
  }, [chats, isInitializing]);

  useEffect(() => {
    if (!isInitializing) {
      if (activeChatId) {
        localStorage.setItem('aura-active-chat-id', activeChatId);
        if (typeof window !== 'undefined') {
          const targetPath = `/c/${activeChatId}`;
          if (window.location.pathname !== targetPath) window.history.pushState(null, '', targetPath);
        }
      } else {
        localStorage.removeItem('aura-active-chat-id');
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/c/')) {
          window.history.pushState(null, '', '/');
        }
      }
    }
  }, [activeChatId, isInitializing]);

  const setAccentColor = (color) => {
    setAccentColorState(color);
    localStorage.setItem('aura-accent', color);
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--chat-bubble-user', color);
  };
  const setLanguage = (lang) => { setLanguageState(lang); localStorage.setItem('aura-language', lang); };
  const setFontSize = (size) => { setFontSizeState(size); localStorage.setItem('aura-font-size', size); };
  const setChatWidth = (width) => { setChatWidthState(width); localStorage.setItem('aura-chat-width', width); };
  const setLineHeight = (lh) => { setLineHeightState(lh); localStorage.setItem('aura-line-height', lh); };
  const setAiModel = (model) => { setAiModelState(model); localStorage.setItem('aura-ai-model', model); };
  const setPersonalization = (data) => {
    const updated = { ...personalization, ...data };
    setPersonalizationState(updated);
    localStorage.setItem('aura-personalization', JSON.stringify(updated));
  };
  const setProfile = (data) => {
    const updated = { ...profile, ...data };
    setProfileState(updated);
    localStorage.setItem('aura-profile', JSON.stringify(updated));
  };
  const setAppTheme = (mode) => {
    let resolved = mode;
    if (mode === 'system') resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(mode);
    localStorage.setItem('aura-theme', mode);
    document.documentElement.setAttribute('data-theme', resolved);
  };
  const toggleTheme = () => setAppTheme(theme === 'light' ? 'dark' : 'light');
  const updateChatTheme = (newChatTheme) => {
    setChatTheme(newChatTheme);
    localStorage.setItem('aura-chat-theme', newChatTheme);
    document.documentElement.setAttribute('data-chat-theme', newChatTheme);
  };
  const login = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account consent' });
      await signInWithPopup(auth, googleProvider);
      setMessages([]);
      setActiveChatId(null);
      localStorage.removeItem('aura-active-chat-id');
    } catch (error) {
      console.error("Login failed:", error);
      if (error.code === 'auth/configuration-not-found') alert("Firebase Error: Google Auth is not enabled.");
      else alert("Login failed: " + error.message);
    }
  };
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('aura-active-chat-id');
      setMessages([]);
      setActiveChatId(null);
    } catch (error) { console.error("Logout failed:", error); }
  };
  const deleteAccount = async () => {
    try {
      localStorage.clear();
      setChats([]);
      setMessages([]);
      setActiveChatId(null);
      setUser(null);
      await signOut(auth);
      window.location.reload();
    } catch (error) { console.error("Delete account failed:", error); }
  };
  const createNewChat = useCallback(() => {
    if (activeChatId && messages.length === 0) return;
    const newId = Date.now().toString();
    setChats(prev => [{ id: newId, title: 'New Chat', messages: [], timestamp: Date.now() }, ...prev]);
    setActiveChatId(newId);
    setMessages([]);
  }, [activeChatId, messages, setActiveChatId, setMessages]);

  const deleteChat = useCallback((id) => {
    setChats(prev => {
      const updatedChats = prev.filter(chat => chat.id !== id);
      if (activeChatId === id) {
        // Reset to landing page (New Chat) instead of switching to an old chat
        setActiveChatId(null);
        setMessages([]);
      }
      return updatedChats;
    });
  }, [activeChatId, setActiveChatId, setMessages]);

  const switchChat = useCallback((id) => {
    setChats(prev => {
      const chat = prev.find(c => c.id === id);
      if (chat) { setActiveChatId(id); setMessages(chat.messages || []); }
      return prev;
    });
  }, [setActiveChatId, setMessages]);

  const renameChat = useCallback((id, newTitle) => {
    setChats(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, title: newTitle } : c);
      localStorage.setItem('aura-chats', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const convertToGroupChat = useCallback((id) => {
    setChats(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isGroup: true, creator: profile } : c);
      localStorage.setItem('aura-chats', JSON.stringify(updated));
      return updated;
    });
  }, [profile]);

  return (
    <AppContext.Provider value={{
      theme, resolvedTheme, toggleTheme, setAppTheme,
      accentColor, setAccentColor,
      chatTheme, updateChatTheme,
      isSidebarOpen, setIsSidebarOpen,
      appView, setAppView,
      messages, setMessages,
      chats, setChats,
      activeChatId, setActiveChatId,
      createNewChat, deleteChat, switchChat, renameChat,
      archivedChats, archiveChat, unarchiveChat,
      archivePassword, setArchivePassword,
      viewingArchivedChat, openArchivedChat, closeArchivedChat,
      user, login, logout,
      authOpen, setAuthOpen,
      profile, setProfile,
      language, setLanguage,
      fontSize, setFontSize,
      chatWidth, setChatWidth,
      lineHeight, setLineHeight,
      aiModel, setAiModel,
      personalization, setPersonalization,
      deleteAccount,
      isInitializing,
      isSidebarInitializing,
      isAuthLoading,
      isShareModalOpen, setIsShareModalOpen,
      shareChatId, setShareChatId,
      isGroupLinkModalOpen, setIsGroupLinkModalOpen,
      groupLinkChatId, setGroupLinkChatId,
      isReportModalOpen, setIsReportModalOpen,
      isGroupChatModalOpen, setIsGroupChatModalOpen,
      isUpgradeModalOpen, setIsUpgradeModalOpen,
      convertToGroupChat,
      showLoggedIn: user || (isAuthLoading && typeof window !== 'undefined' && localStorage.getItem('aura-profile')),
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
