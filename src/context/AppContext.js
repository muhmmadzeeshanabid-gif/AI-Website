'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth, googleProvider, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, collection, query, where, orderBy, limit, enableNetwork } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';


const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
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

  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  
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

  // Strict enforcement: No messages allowed if no active chat
  useEffect(() => {
    if (!activeChatId && messages.length > 0) {
      setMessages([]);
    }
  }, [activeChatId, messages.length]);

  // Firestore listeners cleanup
  const unsubscribeRef = useRef(null);

  const activeChatIsGroup = chats.find(c => c.id === activeChatId)?.isGroup;
  
  useEffect(() => {
    // 1. Sidebar/Chats Listener (sync all groups user belongs to)
    let chatsUnsubscribe = () => {};
    if (profile?.uid) {
      const q = query(
        collection(db, 'chats'),
        where('participantIds', 'array-contains', profile.uid)
      );
      
      chatsUnsubscribe = onSnapshot(q, (querySnapshot) => {
        const remoteGroups = [];
        querySnapshot.forEach((doc) => {
          remoteGroups.push({ id: doc.id, ...doc.data() });
        });

        setChats(prev => {
          // Merge remote groups into local chats list
          const localOnly = prev.filter(lc => !lc.isGroup);
          // Combine local personal chats with remote group chats
          const combined = [...localOnly];
          
          remoteGroups.forEach(rg => {
            const existingIdx = combined.findIndex(c => c.id === rg.id);
            if (existingIdx === -1) {
              combined.push(rg);
            } else {
              combined[existingIdx] = rg;
            }
          });
          
          // Sort by timestamp if available
          combined.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.createdAt || 0);
            const timeB = new Date(b.timestamp || b.createdAt || 0);
            return timeB - timeA;
          });

          localStorage.setItem('aura-chats', JSON.stringify(combined));
          return combined;
        });
      });
    }

    // 2. Active Chat Messages Listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (activeChatId) {
      const currentChat = chats.find(c => c.id === activeChatId);
      if (currentChat?.isGroup) {
        try {
          const chatDocRef = doc(db, 'chats', activeChatId);
        
        // Use a persistent reference for the listener to prevent overlaps
        const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
          if (!docSnap.exists()) return;
          
          const data = docSnap.data();
          // If it's not a group, we just don't process it here
          if (!data || !data.isGroup) return;

          const remoteMessages = data.messages || [];
          const streamContent = data.streamContent || {};

          // Overlay streaming content onto placeholder AI messages for remote viewers
          // This gives other group members the live "typewriter" effect as the generator streams
          const messagesWithStream = remoteMessages.map(msg => {
            if (msg.role === 'ai' && msg.isPlaceholder && streamContent[msg.id]) {
              return { ...msg, content: streamContent[msg.id] };
            }
            return msg;
          });

          setMessages(prev => {
            // If the local user is generating, keep their local AI message visible (still streaming)
            const localAiMsg = prev.find(m => m.role === 'ai' && !messagesWithStream.some(rm => rm.id === m.id));
            
            if (localAiMsg) {
              return [...messagesWithStream, localAiMsg];
            }

            // Tag brand-new messages from OTHER users with _typewriter so ChatWindow animates them
            const prevIds = new Set(prev.map(m => m.id));
            const merged = messagesWithStream.map(rm => {
              if (!prevIds.has(rm.id) && rm.role === 'user' && rm.sender?.email !== profile?.email) {
                return { ...rm, _typewriter: true };
              }
              return rm;
            });

            // Always return merged (don't skip on equality) while streamContent is active
            // so remote users see every streaming update from Firestore
            const hasActiveStream = Object.keys(streamContent).length > 0;
            if (!hasActiveStream && JSON.stringify(prev) === JSON.stringify(merged)) return prev;

            return merged;
          });
          
          setChats(prev => {
            const idx = prev.findIndex(c => c.id === activeChatId);
            if (idx === -1) return prev;
            
            const existing = prev[idx];
            
            // Check if typing status or generation status changed to ensure we propagate updates
            const typingChanged = JSON.stringify(existing?.typing) !== JSON.stringify(data?.typing);
            const generatingChanged = existing?.isGenerating !== data?.isGenerating;

            // Only update if metadata, message count, typing state, or generation status changed
            if (existing.messages?.length === remoteMessages.length && 
                existing.title === data.title &&
                !typingChanged &&
                !generatingChanged &&
                (remoteMessages.length === 0 || existing.messages[existing.messages.length-1]?.id === remoteMessages[remoteMessages.length-1]?.id)) {
              return prev;
            }

            const updated = [...prev];
            updated[idx] = { 
              ...existing, 
              ...data,
              messages: remoteMessages, 
              title: data.title || existing.title 
            };

            // Sync Group Theme Settings
            if (data.accentColor && data.accentColor !== accentColor) {
              setAccentColorState(data.accentColor);
              localStorage.setItem('aura-accent', data.accentColor);
              document.documentElement.style.setProperty('--accent-color', data.accentColor);
              document.documentElement.style.setProperty('--chat-bubble-user', data.accentColor);
            }
            if (data.chatTheme && data.chatTheme !== chatTheme) {
              setChatTheme(data.chatTheme);
              localStorage.setItem('aura-chat-theme', data.chatTheme);
              document.documentElement.setAttribute('data-chat-theme', data.chatTheme);
            }

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
    }

    return () => {
      chatsUnsubscribe();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [activeChatId, profile, activeChatIsGroup]);


  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--chat-bubble-user', accentColor);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-chat-theme', chatTheme);

    // Initialize activeChatId from pathname or localStorage on client mount
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/c/')) {
        const pathId = path.split('/c/')[1];
        if (pathId) {
          setActiveChatId(pathId);
          const savedChats = localStorage.getItem('aura-chats');
          if (savedChats) {
            try {
              const parsed = JSON.parse(savedChats);
              const chat = parsed.find(c => c.id === pathId);
              if (chat) setMessages(chat.messages || []);
            } catch (e) {}
          }
        }
      } else {
        const savedId = localStorage.getItem('aura-active-chat-id');
        if (savedId) {
          setActiveChatId(savedId);
          const savedChats = localStorage.getItem('aura-chats');
          if (savedChats) {
            try {
              const parsed = JSON.parse(savedChats);
              const chat = parsed.find(c => c.id === savedId);
              if (chat) setMessages(chat.messages || []);
            } catch (e) {}
          }
        }
      }
    }

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
          uid: firebaseUser.uid,
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
        const chatExists = chats.some(c => c.id === activeChatId);

        if (chatExists) {
          if (pathname === '/') {
            router.push(`/c/${activeChatId}`);
          } else if (pathname.startsWith('/c/')) {
            const pathId = pathname.split('/c/')[1];
            if (pathId !== activeChatId) {
              router.push(`/c/${activeChatId}`);
            }
          }
        } else {
          if (pathname.startsWith('/c/')) {
            router.push('/');
          }
        }
      } else {
        localStorage.removeItem('aura-active-chat-id');
        if (pathname.startsWith('/c/')) {
          router.push('/');
        }
      }
    }
  }, [activeChatId, isInitializing, chats, pathname, router]);

  const setAccentColor = (color) => {
    setAccentColorState(color);
    localStorage.setItem('aura-accent', color);
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--chat-bubble-user', color);

    // Sync to Group Chat if active
    if (activeChatIsGroup) {
      updateDoc(doc(db, 'chats', activeChatId), { accentColor: color }).catch(console.error);
    }
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

    // Sync to Group Chat if active
    if (activeChatIsGroup) {
      updateDoc(doc(db, 'chats', activeChatId), { chatTheme: newChatTheme }).catch(console.error);
    }
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
    router.push('/');
  }, [setActiveChatId, setMessages, router]);

  const lastPathnameRef = useRef(pathname);

  useEffect(() => {
    if (isInitializing) {
      lastPathnameRef.current = pathname;
      return;
    }

    if (pathname !== lastPathnameRef.current) {
      lastPathnameRef.current = pathname;

      if (pathname === '/') {
        // If pathname is '/' but activeChatId points to an existing chat, reset to a new chat
        const isExistingChat = chats.some(c => c.id === activeChatId);
        if (isExistingChat) {
          createNewChat();
        }
      } else if (pathname.startsWith('/c/')) {
        const pathId = pathname.split('/c/')[1];
        if (pathId && pathId !== activeChatId) {
          setActiveChatId(pathId);
          const foundChat = chats.find(c => c.id === pathId);
          setMessages(foundChat ? (foundChat.messages || []) : []);
        }
      }
    }
  }, [pathname, chats, activeChatId, isInitializing, createNewChat, setActiveChatId, setMessages]);

  const deleteChat = useCallback(async (id) => {
    const chatToDelete = chats.find(c => c.id === id);
    
    // 1. Handle Firestore removal if it's a group
    if (chatToDelete?.isGroup) {
      try {
        const chatRef = doc(db, 'chats', id);
        // If owner, delete the whole doc. If member, just remove self.
        if (chatToDelete.creator?.uid === profile?.uid) {
          await deleteDoc(chatRef);
        } else {
          await updateDoc(chatRef, {
            participantIds: arrayRemove(profile.uid),
            // We also need to remove the participant object. 
            // Since arrayRemove needs exact object match, we find it first.
            participants: arrayRemove(chatToDelete.participants?.find(p => p.uid === profile.uid))
          });
        }
      } catch (err) {
        console.error("Error deleting/leaving group:", err);
      }
    }

    // 2. Local state cleanup
    setChats(prev => {
      const updatedChats = prev.filter(chat => chat.id !== id);
      if (activeChatId === id) {
        setActiveChatId(null);
        setMessages([]);
      }
      return updatedChats;
    });
  }, [activeChatId, chats, profile]);

  const leaveGroup = useCallback(async (id) => {
    const chatToLeave = chats.find(c => c.id === id);
    if (!chatToLeave || !profile) return;

    try {
      const chatRef = doc(db, 'chats', id);
      
      // 1. Add System Message: [Name] left the group
      const leaveMsgId = `leave-${profile.uid}-${Date.now()}`;
      const leaveMessage = {
        id: leaveMsgId,
        content: `${profile.displayName} left the group`,
        role: 'system',
        timestamp: new Date().toISOString(),
        type: 'leave'
      };

      // 2. Remove from Firestore and add system message
      await updateDoc(chatRef, {
        participantIds: arrayRemove(profile.uid),
        participants: arrayRemove(chatToLeave.participants?.find(p => p.uid === profile.uid)),
        messages: arrayUnion(leaveMessage)
      });

      // 3. Local cleanup
      setChats(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem('aura-chats', JSON.stringify(updated));
        if (activeChatId === id) {
          setActiveChatId(null);
          setMessages([]);
        }
        return updated;
      });
      
    } catch (err) {
      console.error("Error leaving group:", err);
    }
  }, [chats, profile, activeChatId]);

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
        await setDoc(doc(db, 'chats', id), { title: newTitle }, { merge: true });
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
      participantIds: [profile.uid],
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      chatTheme: chatTheme,
      accentColor: accentColor
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
        console.log("Group found, checking membership...");
        
        // Prevent duplicate join messages and participant entries
        if (chatData.participantIds?.includes(profile.uid)) {
          console.log("User already a member, switching to chat.");
          setChats(prev => {
            if (prev.find(c => c.id === id)) return prev;
            const updated = [chatData, ...prev];
            localStorage.setItem('aura-chats', JSON.stringify(updated));
            return updated;
          });
          setActiveChatId(id);
          return { success: true };
        }

        console.log("New user joining, updating participants...");
        
        // Add current user to participants
        const newParticipant = {
          uid: profile.uid || '',
          displayName: profile.displayName || 'User',
          avatar: profile.avatar || '',
          email: profile.email || ''
        };

        // Add a system message for the join event with a deterministic ID
        const joinMessage = {
          id: `join-${profile.uid}-${Date.now()}`,
          role: 'system',
          content: `${profile.displayName || 'A user'} joined the group`,
          timestamp: new Date().toISOString()
        };

        await updateDoc(chatDocRef, {
          participants: arrayUnion(newParticipant),
          participantIds: arrayUnion(profile.uid),
          messages: arrayUnion(joinMessage)
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
      leaveGroup,
      showLoggedIn: user || (isAuthLoading && typeof window !== 'undefined' && localStorage.getItem('aura-profile')),
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
