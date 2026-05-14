'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth, googleProvider, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc, arrayUnion, collection, query, orderBy, limit, enableNetwork } from 'firebase/firestore';

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

  // Strict enforcement: No messages allowed if no active chat
  useEffect(() => {
    if (!activeChatId && messages.length > 0) {
      setMessages([]);
    }
  }, [activeChatId, messages.length]);

  // Firestore listeners cleanup
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // 1. Immediate and absolute cleanup of any previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (activeChatId) {
      try {
        const chatDocRef = doc(db, 'chats', activeChatId);
        
        // Use a persistent reference for the listener to prevent overlaps
        const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
          if (!docSnap.exists()) return;
          
          const data = docSnap.data();
          // If it's not a group, we just don't process it here
          if (!data || !data.isGroup) return;

          const remoteMessages = data.messages || [];
          
          setMessages(prev => {
            // If remote messages are fewer than local, it's likely we just sent one 
            // and the listener is seeing an old state. Let's wait for Firestore to catch up.
            if (remoteMessages.length < prev.length) {
              // Only keep local if the last few messages match
              const match = remoteMessages.every((m, i) => m.id === prev[i]?.id);
              if (match) return prev;
            }

            // Standard deep comparison to avoid unnecessary re-renders
            if (JSON.stringify(prev) === JSON.stringify(remoteMessages)) return prev;
            return remoteMessages;
          });
          
          setChats(prev => {
            const idx = prev.findIndex(c => c.id === activeChatId);
            if (idx === -1) return prev;
            
            const existing = prev[idx];
            // Only update if metadata or message count changed
            if (existing.messages?.length === remoteMessages.length && 
                existing.title === data.title &&
                (remoteMessages.length === 0 || existing.messages[existing.messages.length-1]?.id === remoteMessages[remoteMessages.length-1]?.id)) {
              return prev;
            }

            const updated = [...prev];
            updated[idx] = { ...existing, messages: remoteMessages, title: data.title || existing.title };
            return updated;
          });
        }, (error) => {
          console.error("Group Listener Error:", error);
        });

        unsubscribeRef.current = unsubscribe;
      } catch (err) {
        console.error("Listener Setup Failed:", err);
      }
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [activeChatId]);

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
  const [groupChatTargetId, setGroupChatTargetId] = useState(null);
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
      
      // 1. Wipe ALL guest data from memory
      setMessages([]);
      setChats([]);
      setActiveChatId(null);
      
      // 2. Wipe ALL guest data from browser storage
      localStorage.removeItem('aura-chats');
      localStorage.removeItem('aura-active-chat-id');
      localStorage.removeItem('aura-messages');
      
    } catch (error) {
      console.error("Login failed:", error);
      if (error.code === 'auth/configuration-not-found') alert("Firebase Error: Google Auth is not enabled.");
      else alert("Login failed: " + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      
      // Clear states
      setUser(null);
      setProfileState({ displayName: '', username: '', email: '', avatar: null });
      setMessages([]);
      setChats([]);
      setActiveChatId(null);
      
      // Clear storage
      localStorage.removeItem('aura-profile');
      localStorage.removeItem('aura-active-chat-id');
      localStorage.removeItem('aura-chats');
      localStorage.removeItem('aura-messages');
      
      window.location.href = '/';
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
    const newId = Date.now().toString();
    setActiveChatId(newId);
    setMessages([]);
    if (typeof window !== 'undefined') window.history.pushState(null, '', `/`);
  }, [setActiveChatId, setMessages]);

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

  const renameChat = useCallback(async (id, newTitle) => {
    setChats(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, title: newTitle } : c);
      localStorage.setItem('aura-chats', JSON.stringify(updated));
      return updated;
    });

    const chat = chats.find(c => c.id === id);
    if (chat?.isGroup) {
      try {
        await updateDoc(doc(db, 'chats', id), { title: newTitle });
      } catch (err) {
        console.error("Failed to sync group rename:", err);
      }
    }
  }, [chats]);

  const convertToGroupChat = useCallback(async (id) => {
    const chatToConvert = chats.find(c => c.id === id);
    if (!chatToConvert) return;

    const groupData = {
      ...chatToConvert,
      isGroup: true,
      creator: profile,
      participants: [profile],
      createdAt: new Date().toISOString()
    };

    setChats(prev => {
      const updated = prev.map(c => c.id === id ? groupData : c);
      localStorage.setItem('aura-chats', JSON.stringify(updated));
      return updated;
    });

    // Save to Firestore for multi-user access
    try {
      await setDoc(doc(db, 'chats', id), groupData);
    } catch (error) {
      console.error("Failed to save group chat to Firestore:", error);
    }
  }, [profile, chats]);

  const joinGroup = useCallback(async (id) => {
    if (!profile) return { success: false, error: "Please log in to join the group" };
    
    console.log("Attempting to join group:", id);
    
    try {
      const chatDocRef = doc(db, 'chats', id);
      
      // Force connection recovery
      try {
        await enableNetwork(db);
      } catch (e) {
        console.warn("Could not force enable network:", e);
      }
      
      // Add a timeout to the fetch operation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout. Please check your internet.")), 10000)
      );
      
      let docSnap;
      try {
        docSnap = await Promise.race([
          getDoc(chatDocRef),
          timeoutPromise
        ]);
      } catch (err) {
        console.error("Fetch failed:", err);
        if (err.message.includes('timeout') || err.code === 'unavailable' || err.message.includes('offline')) {
          return { success: false, error: "Network connection issue. Please check your internet and try again." };
        }
        throw err;
      }
      
      if (docSnap.exists()) {
        const chatData = { id: docSnap.id, ...docSnap.data() };
        console.log("Group found, updating participants...");
        
        // Add current user to participants
        await updateDoc(chatDocRef, {
          participants: arrayUnion({
            uid: profile.uid || '',
            displayName: profile.displayName || 'User',
            avatar: profile.avatar || '',
            email: profile.email || ''
          })
        });

        setChats(prev => {
          if (prev.find(c => c.id === id)) return prev;
          const updated = [chatData, ...prev];
          localStorage.setItem('aura-chats', JSON.stringify(updated));
          return updated;
        });

        setActiveChatId(id);
        return { success: true };
      } else {
        return { success: false, error: "Group chat not found. The link might be invalid or expired." };
      }
    } catch (error) {
      console.error("Error joining group:", error);
      return { success: false, error: error.message };
    }
  }, [profile, setActiveChatId, setChats]);

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
      groupChatTargetId, setGroupChatTargetId,
      isUpgradeModalOpen, setIsUpgradeModalOpen,
      convertToGroupChat,
      joinGroup,
      showLoggedIn: user || (isAuthLoading && typeof window !== 'undefined' && localStorage.getItem('aura-profile')),
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
