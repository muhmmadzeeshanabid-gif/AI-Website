'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth, googleProvider, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, collection, query, where, orderBy, limit, enableNetwork } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import { safeSetLocalStorageItem } from '@/utils/storage';



const cropImageToRatio = (imgUrl, ratioStr, callback) => {
  if (typeof window === 'undefined') {
    callback(imgUrl);
    return;
  }
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.src = imgUrl;
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const parts = ratioStr.split(':').map(Number);
      const wRatio = parts[0] || 1;
      const hRatio = parts[1] || 1;
      const targetRatio = wRatio / hRatio;
      
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const srcRatio = srcW / srcH;
      
      let drawW = srcW;
      let drawH = srcH;
      let startX = 0;
      let startY = 0;
      
      if (srcRatio > targetRatio) {
        // Source is wider than target ratio: crop horizontally
        drawW = srcH * targetRatio;
        startX = (srcW - drawW) / 2;
      } else {
        // Source is taller than target ratio: crop vertically
        drawH = srcW / targetRatio;
        startY = (srcH - drawH) / 2;
      }
      
      // Limit resolution to a max dimension of 800px for space efficiency in localStorage
      const maxDimension = 800;
      let targetW = drawW;
      let targetH = drawH;
      if (drawW > maxDimension || drawH > maxDimension) {
        if (drawW > drawH) {
          targetW = maxDimension;
          targetH = (drawH / drawW) * maxDimension;
        } else {
          targetH = maxDimension;
          targetW = (drawW / drawH) * maxDimension;
        }
      }
      
      canvas.width = targetW;
      canvas.height = targetH;
      
      ctx.drawImage(img, startX, startY, drawW, drawH, 0, 0, targetW, targetH);
      // Export as JPEG at 0.85 quality to save massive local storage space
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      callback(croppedDataUrl);
    } catch (e) {
      console.error("Error cropping image client-side:", e);
      callback(imgUrl);
    }
  };
  img.onerror = () => {
    callback(imgUrl);
  };
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [chatTheme, setChatTheme] = useState('classic');
  const [language, setLanguageState] = useState('Auto-detect');
  const [accentColor, setAccentColorState] = useState('#6366f1');
  const [isSidebarOpen, setIsSidebarOpenState] = useState(true);
  const [isSidebarInitializing, setIsSidebarInitializing] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [appView, setAppView] = useState(() => {
    if (typeof window === 'undefined') return 'chat';
    const path = window.location.pathname;
    if (path === '/library') return 'library';
    if (path === '/research') return 'research';
    if (path === '/apps') return 'apps';
    if (path === '/images') return 'images';
    return localStorage.getItem('aura-app-view') || 'chat';
  });
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const [chats, setChats] = useState([]);
  const [archivedChats, setArchivedChatsState] = useState([]);
  const [archivePassword, setArchivePasswordState] = useState('');
  const [viewingArchivedChat, setViewingArchivedChat] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(() => {
    if (pathname && pathname.startsWith('/c/')) {
      return pathname.split('/c/')[1] || null;
    }
    return null;
  });
  const [messages, setMessages] = useState([]);
  const [isTemporary, setIsTemporary] = useState(false);
  const [fontSize, setFontSizeState] = useState('Medium');
  const [chatWidth, setChatWidthState] = useState('Standard');
  const [lineHeight, setLineHeightState] = useState('Normal');
  const [aiModel, setAiModelState] = useState('Gemini');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareChatId, setShareChatId] = useState(null);
  const [isGroupLinkModalOpen, setIsGroupLinkModalOpen] = useState(false);
  const [groupLinkChatId, setGroupLinkChatId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);
  const [groupChatTargetId, setGroupChatTargetId] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [personalization, setPersonalizationState] = useState({
    baseStyle: 'Default', warm: 'Default', enthusiastic: 'Default',
    headers: 'Default', emoji: 'Default', fastAnswers: true,
    customInstructions: '', aboutYou: '', voice: 'Kyra',
  });
  const [profile, setProfileState] = useState({
    displayName: '',
    username: '',
    email: '',
    avatar: null,
  });
  const [isSharedReadOnly, setIsSharedReadOnly] = useState(false);
  const [sharedChatData, setSharedChatData] = useState(null);

  const [editingImage, setEditingImage] = useState(null);
  const [activeEditImage, setActiveEditImage] = useState(null);

  const lastSyncedChatsRef = useRef({});
  const unsubscribeRef = useRef(null);

  const setIsSidebarOpen = (val) => {
    setIsSidebarOpenState(val);
    localStorage.setItem('aura-sidebar-open', JSON.stringify(val));
  };

  const setArchivePassword = (pwd) => {
    setArchivePasswordState(pwd);
    if (pwd) localStorage.setItem('aura-archive-password', pwd);
    else localStorage.removeItem('aura-archive-password');
  };

  const archiveChat = useCallback((id) => {
    setChats(prev => {
      const chat = prev.find(c => c.id === id);
      if (!chat) return prev;

      // Sync to Firestore if logged in
      if (user?.uid && !chat.isGroup) {
        const personalChatRef = doc(db, 'users', user.uid, 'personal_chats', id);
        setDoc(personalChatRef, { isArchived: true, archivedAt: Date.now() }, { merge: true })
          .catch(err => console.error("Error archiving chat in Firestore:", err));
      }

      // Already archived? skip
      setArchivedChatsState(a => {
        if (a.find(c => c.id === id)) return a;
        const updated = [{ ...chat, archivedAt: Date.now() }, ...a];
        const result = safeSetLocalStorageItem('aura-archived-chats', updated);
        return result || updated;
      });
      const filtered = prev.filter(c => c.id !== id);
      const resultChats = safeSetLocalStorageItem('aura-chats', filtered);
      return resultChats || filtered;
    });
  }, [user]);

  const unarchiveChat = useCallback((id) => {
    setArchivedChatsState(prev => {
      const chat = prev.find(c => c.id === id);
      if (chat) {
        const { archivedAt, ...rest } = chat;

        // Sync to Firestore if logged in
        if (user?.uid && !chat.isGroup) {
          const personalChatRef = doc(db, 'users', user.uid, 'personal_chats', id);
          setDoc(personalChatRef, { isArchived: false, archivedAt: null }, { merge: true })
            .catch(err => console.error("Error unarchiving chat in Firestore:", err));
        }

        setChats(c => {
          if (c.find(x => x.id === id)) return c; // Avoid duplicate
          const updatedChats = [rest, ...c];
          const resultChats = safeSetLocalStorageItem('aura-chats', updatedChats);
          return resultChats || updatedChats;
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
      const resultArchived = safeSetLocalStorageItem('aura-archived-chats', updated);
      return resultArchived || updated;
    });
  }, [user]);

  // ── View Archived Chat (read-only, no recent save) ──────────────────────
  const openArchivedChat = useCallback((chat) => {
    setViewingArchivedChat(chat);
  }, []);

  const closeArchivedChat = useCallback(() => {
    setViewingArchivedChat(null);
  }, []);
  // ──────────────────────────────────────────────────────────────────────────

  const fetchSharedChat = useCallback(async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'shared_chats', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages || []);
        setIsSharedReadOnly(true);
        setSharedChatData(data);
        
        // Temporarily put it in chats so the UI doesn't redirect
        setChats(prev => {
          if (prev.some(c => c.id === id)) return prev;
          return [{ id, ...data, isSharedReadOnly: true }, ...prev];
        });
      } else {
        console.log("Shared chat not found in Firestore.");
        router.replace('/');
      }
    } catch (err) {
      console.error("Failed to fetch shared chat:", err);
      router.replace('/');
    }
  }, [router]);


  // Strict enforcement: No messages allowed if no active chat (except for temporary chats)
  useEffect(() => {
    if (!activeChatId && messages.length > 0 && !isTemporary) {
      setMessages([]);
    }
  }, [activeChatId, messages.length, isTemporary]);

  // Reset temporary chat state when switching/exiting chats
  useEffect(() => {
    setIsTemporary(false);
  }, [activeChatId]);

  // Reset appView to chat when switching active chats (not on initial load)
  const prevActiveChatIdRef = useRef(activeChatId);
  useEffect(() => {
    // Only reset if previous chat was also non-null (genuine switch, not initial load)
    if (activeChatId && prevActiveChatIdRef.current && prevActiveChatIdRef.current !== activeChatId) {
      setAppView('chat');
    }
    prevActiveChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Reset shared read-only states when starting/switching to a non-shared chat
  useEffect(() => {
    if (!activeChatId) {
      setIsSharedReadOnly(false);
      setSharedChatData(null);
    }
  }, [activeChatId]);

  // Force sidebar to be open by default on desktop when opening a shared chat
  useEffect(() => {
    if (pathname && pathname.startsWith('/c/') && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, [pathname]);

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

          const result = safeSetLocalStorageItem('aura-chats', combined);
          return result || combined;
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
    // Initialize all states from localStorage on client mount
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('aura-theme') || 'dark';
      setTheme(savedTheme);
      
      let resolved = savedTheme;
      if (savedTheme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      setResolvedTheme(resolved);

      const savedChatTheme = localStorage.getItem('aura-chat-theme') || 'classic';
      setChatTheme(savedChatTheme);

      const savedLanguage = localStorage.getItem('aura-language') || 'Auto-detect';
      setLanguageState(savedLanguage);

      const savedAccent = localStorage.getItem('aura-accent') || '#6366f1';
      setAccentColorState(savedAccent);

      const savedSidebar = localStorage.getItem('aura-sidebar-open');
      if (window.location.pathname.startsWith('/c/') && window.innerWidth >= 768) {
        setIsSidebarOpenState(true);
        localStorage.setItem('aura-sidebar-open', 'true');
      } else if (savedSidebar !== null) {
        setIsSidebarOpenState(JSON.parse(savedSidebar));
      }

      let loadedChats = [];
      try {
        const savedChats = localStorage.getItem('aura-chats');
        if (savedChats) {
          loadedChats = JSON.parse(savedChats);
          setChats(loadedChats);
        }
      } catch (e) {}

      try {
        const savedArchivedChats = localStorage.getItem('aura-archived-chats');
        if (savedArchivedChats) setArchivedChatsState(JSON.parse(savedArchivedChats));
      } catch (e) {}

      const savedArchivePwd = localStorage.getItem('aura-archive-password') || '';
      setArchivePasswordState(savedArchivePwd);

      const savedFontSize = localStorage.getItem('aura-font-size') || 'Medium';
      setFontSizeState(savedFontSize);

      const savedChatWidth = localStorage.getItem('aura-chat-width') || 'Standard';
      setChatWidthState(savedChatWidth);

      const savedLineHeight = localStorage.getItem('aura-line-height') || 'Normal';
      setLineHeightState(savedLineHeight);

      const savedAiModel = localStorage.getItem('aura-ai-model') || 'Gemini';
      setAiModelState(savedAiModel);

      try {
        const savedPers = localStorage.getItem('aura-personalization');
        if (savedPers) {
          setPersonalizationState(prev => ({ ...prev, ...JSON.parse(savedPers) }));
        }
      } catch (e) {}

      try {
        const savedProfile = localStorage.getItem('aura-profile');
        if (savedProfile) {
          setProfileState(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
        }
      } catch (e) {}

      // Initialize appView based on pathname first, fallback to saved local storage
      const path = window.location.pathname;
      let initialView = 'chat';
      if (path === '/library') {
        initialView = 'library';
      } else if (path === '/research') {
        initialView = 'research';
      } else if (path === '/apps') {
        initialView = 'apps';
      } else if (path === '/images') {
        initialView = 'images';
      } else {
        initialView = localStorage.getItem('aura-app-view') || 'chat';
      }
      setAppView(initialView);

      // Initialize activeChatId from pathname or localStorage
      sessionStorage.setItem('aura-session-active', 'true');
      
      if (path.startsWith('/c/')) {
        const pathId = path.split('/c/')[1];
        if (pathId) {
          setActiveChatId(pathId);
          const chat = loadedChats.find(c => c.id === pathId);
          if (chat) {
            setMessages(chat.messages || []);
            setIsSharedReadOnly(!!chat.isSharedReadOnly);
            setSharedChatData(chat.isSharedReadOnly ? chat : null);
          } else {
            fetchSharedChat(pathId);
          }
        }
      } else {
        setActiveChatId(null);
        setMessages([]);
      }
    }

    setIsSidebarInitializing(false);
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
    document.documentElement.setAttribute('data-chat-theme', chatTheme);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--chat-bubble-user', accentColor);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        document.documentElement.setAttribute('data-theme', newResolved);
      };
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [theme, chatTheme, accentColor]);


  // Fetch personal chats from Firestore upon login using onSnapshot for safe loading
  useEffect(() => {
    if (user?.uid) {
      const personalChatsColRef = collection(db, 'users', user.uid, 'personal_chats');
      const unsubscribe = onSnapshot(personalChatsColRef, (querySnapshot) => {
        const fetchedChats = [];
        querySnapshot.forEach((doc) => {
          fetchedChats.push(doc.data());
        });

        // Populate lastSyncedRef to avoid redundant writes on load
        fetchedChats.forEach(chat => {
          lastSyncedChatsRef.current[chat.id] = {
            messageCount: chat.messages?.length || 0,
            title: chat.title || ''
          };
        });

        const activePersonalChats = fetchedChats.filter(c => !c.isArchived);
        const archivedPersonalChats = fetchedChats.filter(c => c.isArchived);

        // Update active chats in state
        setChats(prev => {
          // Keep remote groups from Firestore
          const groupChats = prev.filter(c => c.isGroup);
          const combined = [...groupChats];

          activePersonalChats.forEach(fc => {
            const existingIdx = combined.findIndex(c => c.id === fc.id);
            if (existingIdx === -1) {
              combined.push(fc);
            } else {
              combined[existingIdx] = fc;
            }
          });

          combined.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.createdAt || 0);
            const timeB = new Date(b.timestamp || b.createdAt || 0);
            return timeB - timeA;
          });

          const result = safeSetLocalStorageItem('aura-chats', combined);
          return result || combined;
        });

        // Update archived chats in state
        setArchivedChatsState(prev => {
          const combined = [...prev];
          archivedPersonalChats.forEach(apc => {
            const existingIdx = combined.findIndex(c => c.id === apc.id);
            if (existingIdx === -1) {
              combined.push(apc);
            } else {
              combined[existingIdx] = apc;
            }
          });
          const resultArchived = safeSetLocalStorageItem('aura-archived-chats', combined);
          return resultArchived || combined;
        });

        // Unsubscribe immediately so it behaves like a one-time fetch
        unsubscribe();
      }, (err) => {
        console.error("Error loading personal chats from Firestore:", err);
      });
      return () => unsubscribe();
    } else {
      lastSyncedChatsRef.current = {};
    }
  }, [user]);

  useEffect(() => {
    if (!isInitializing) {
      const savedChats = safeSetLocalStorageItem('aura-chats', chats);
      if (savedChats && JSON.stringify(savedChats) !== JSON.stringify(chats)) {
        setChats(savedChats);
      }

      if (user?.uid) {
        chats.forEach(chat => {
          if (chat.isGroup || isTemporary || chat.isSharedReadOnly) return;

          const lastSynced = lastSyncedChatsRef.current[chat.id];
          const currentMessageCount = chat.messages?.length || 0;
          const currentTitle = chat.title || '';

          if (!lastSynced || lastSynced.messageCount !== currentMessageCount || lastSynced.title !== currentTitle) {
            lastSyncedChatsRef.current[chat.id] = {
              messageCount: currentMessageCount,
              title: currentTitle
            };

            const personalChatRef = doc(db, 'users', user.uid, 'personal_chats', chat.id);
            setDoc(personalChatRef, {
              id: chat.id,
              title: chat.title || 'New Chat',
              messages: chat.messages || [],
              timestamp: chat.timestamp || new Date().toISOString(),
              createdAt: chat.createdAt || new Date().toISOString(),
              isArchived: false
            }, { merge: true }).catch(err => console.error("Error autosaving personal chat to Firestore:", err));
          }
        });
      }
    }
  }, [chats, isInitializing, user, isTemporary]);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem('aura-app-view', appView);
    }
  }, [appView, isInitializing]);

  const autoCompleteGeneration = useCallback((chatId, msg) => {
    cropImageToRatio(msg.imageUrl, msg.ratio, (croppedDataUrl) => {
      // 1. Save to My Images list in localStorage
      try {
        const saved = localStorage.getItem('aura-my-images');
        let currentImages = [];
        if (saved) {
          try {
            currentImages = JSON.parse(saved);
          } catch (e) {
            console.error(e);
          }
        }
        if (currentImages.length === 0) {
          currentImages = [
            { id: 'img-1', url: '/my_ai_assistant.png', prompt: 'Futuristic dark blue cybernetic AI robot assistant logo layout' },
            { id: 'img-2', url: '/my_couple_heart.png', prompt: 'Romantic portrait of a couple inside a decorated golden heart frame' },
            { id: 'img-3', url: '/app_design.png', prompt: 'Sleek colorful mobile UI app dashboard layout mockup' },
            { id: 'img-4', url: '/my_pizza.png', prompt: 'Delicious gourmet Italian pizza with melting mozzarella cheese' },
            { id: 'img-5', url: '/wanderlust.png', prompt: 'Wanderlust explorer mountain landscape painting' },
            { id: 'img-6', url: '/my_zypher_logo.png', prompt: 'Modern futuristic brand logo with a glowing purple and cyan Z' },
            { id: 'img-7', url: '/chibi_stickers.png', prompt: 'Cute chibi style sticker pack designs' },
            { id: 'img-8', url: '/makeup_guide.png', prompt: 'High-fashion beauty makeup guide eyeshadow palette details' }
          ];
        }

        if (!currentImages.some(img => img.url === croppedDataUrl)) {
          const newImgObj = {
            id: `img-gen-aspect-${Date.now()}`,
            url: croppedDataUrl,
            prompt: msg.prompt || `Cropped to aspect ratio ${msg.ratio}`
          };
          const updated = [newImgObj, ...currentImages];
          safeSetLocalStorageItem('aura-my-images', updated);
        }
      } catch (err) {
        console.error("Error saving image to my images in background:", err);
      }

      // 2. Update the message in the chats list
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = chat.messages?.map(m => 
            m.id === msg.id ? { ...m, aspectGenDone: true, imageUrl: croppedDataUrl } : m
          ) || [];
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      }));

      // 3. Update the active messages state if this is the active chat
      if (activeChatId === chatId) {
        setMessages(prev => prev.map(m => 
          m.id === msg.id ? { ...m, aspectGenDone: true, imageUrl: croppedDataUrl } : m
        ));
      }
    });
  }, [activeChatId, setMessages]);

  // Background aspect ratio generation manager
  useEffect(() => {
    if (isInitializing || !chats) return;

    const inProgressGenerations = [];
    chats.forEach(chat => {
      if (chat.isGroup || chat.isSharedReadOnly) return;
      chat.messages?.forEach(msg => {
        if (msg.isAspectGeneration && !msg.aspectGenDone) {
          const elapsed = Date.now() - new Date(msg.timestamp || new Date()).getTime();
          if (elapsed < 40000) {
            inProgressGenerations.push({
              chatId: chat.id,
              msgId: msg.id,
              imageUrl: msg.imageUrl,
              ratio: msg.ratio,
              prompt: msg.prompt,
              timestamp: msg.timestamp,
              remainingTime: 40000 - elapsed
            });
          } else {
            // Already should be done! Let's auto-complete it in the background if we haven't yet
            autoCompleteGeneration(chat.id, msg);
          }
        }
      });
    });

    // Schedule timeouts for in-progress ones
    const timers = inProgressGenerations.map(gen => {
      return setTimeout(() => {
        autoCompleteGeneration(gen.chatId, {
          id: gen.msgId,
          imageUrl: gen.imageUrl,
          ratio: gen.ratio,
          prompt: gen.prompt
        });
      }, gen.remainingTime);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [chats, isInitializing, autoCompleteGeneration]);

  useEffect(() => {
    if (isInitializing) return;

    if (appView === 'library') {
      if (pathname !== '/library') {
        router.push('/library');
      }
    } else if (appView === 'research') {
      if (pathname !== '/research') {
        router.push('/research');
      }
    } else if (appView === 'apps') {
      if (pathname !== '/apps') {
        router.push('/apps');
      }
    } else if (appView === 'images') {
      if (pathname !== '/images') {
        router.push('/images');
      }
    } else if (appView === 'chat') {
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
          const isCurrentChatPath = pathname === `/c/${activeChatId}`;
          if (pathname.startsWith('/c/') && !isCurrentChatPath) {
            router.push('/');
          }
        }
      } else {
        localStorage.removeItem('aura-active-chat-id');
        if (pathname.startsWith('/c/') || pathname === '/library' || pathname === '/research' || pathname === '/apps' || pathname === '/images') {
          router.push('/');
        }
      }
    }
  }, [appView, activeChatId, isInitializing, chats, pathname, router]);

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
    setResolvedTheme(resolved);
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
      setArchivedChatsState([]);
      setActiveChatId(null);
      lastSyncedChatsRef.current = {};
      
      // 2. Wipe ALL guest data from browser storage
      localStorage.removeItem('aura-chats');
      localStorage.removeItem('aura-archived-chats');
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
      setArchivedChatsState([]);
      setActiveChatId(null);
      setAppView('chat');
      lastSyncedChatsRef.current = {};
      
      // Clear storage
      localStorage.removeItem('aura-profile');
      localStorage.removeItem('aura-active-chat-id');
      localStorage.removeItem('aura-chats');
      localStorage.removeItem('aura-archived-chats');
      localStorage.removeItem('aura-messages');
      
      window.location.href = '/';
    } catch (error) { console.error("Logout failed:", error); }
  };
  const deleteAccount = async () => {
    try {
      localStorage.clear();
      setChats([]);
      setArchivedChatsState([]);
      setMessages([]);
      setActiveChatId(null);
      setAppView('chat');
      setUser(null);
      lastSyncedChatsRef.current = {};
      await signOut(auth);
      window.location.reload();
    } catch (error) { console.error("Delete account failed:", error); }
  };
  const createNewChat = useCallback(() => {
    const newId = Date.now().toString();
    setActiveChatId(newId);
    setMessages([]);
    setIsSharedReadOnly(false);
    setSharedChatData(null);
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
        setIsSharedReadOnly(false);
        setSharedChatData(null);
        // If pathname is '/' but activeChatId points to an existing chat, reset to a new chat
        const isExistingChat = chats.some(c => c.id === activeChatId);
        if (isExistingChat) {
          createNewChat();
        }
        setAppView('chat');
      } else if (pathname === '/library') {
        setAppView('library');
      } else if (pathname === '/research') {
        setAppView('research');
      } else if (pathname === '/apps') {
        setAppView('apps');
      } else if (pathname.startsWith('/c/')) {
        const pathId = pathname.split('/c/')[1];
        if (pathId && pathId !== activeChatId) {
          setActiveChatId(pathId);
          const foundChat = chats.find(c => c.id === pathId);
          if (foundChat) {
            setMessages(foundChat.messages || []);
            setIsSharedReadOnly(!!foundChat.isSharedReadOnly);
            setSharedChatData(foundChat.isSharedReadOnly ? foundChat : null);
          } else {
            fetchSharedChat(pathId);
          }
        }
        setAppView('chat');
      }
    }
  }, [pathname, chats, activeChatId, isInitializing, createNewChat, setActiveChatId, setMessages, fetchSharedChat]);

  const deleteChat = useCallback(async (id) => {
    const chatToDelete = chats.find(c => c.id === id) || archivedChats.find(c => c.id === id);
    
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
    } else if (chatToDelete && user?.uid) {
      // 1.b Handle Firestore removal if it's a personal chat and user is logged in
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'personal_chats', id));
      } catch (err) {
        console.error("Error deleting personal chat from Firestore:", err);
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

    setArchivedChatsState(prev => {
      const updated = prev.filter(chat => chat.id !== id);
      const result = safeSetLocalStorageItem('aura-archived-chats', updated);
      return result || updated;
    });
  }, [activeChatId, chats, archivedChats, profile, user]);

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
        const result = safeSetLocalStorageItem('aura-chats', updated);
        if (activeChatId === id) {
          setActiveChatId(null);
          setMessages([]);
        }
        return result || updated;
      });
      
    } catch (err) {
      console.error("Error leaving group:", err);
    }
  }, [chats, profile, activeChatId]);

  const switchChat = useCallback((id) => {
    setChats(prev => {
      const chat = prev.find(c => c.id === id);
      if (chat) { 
        setActiveChatId(id); 
        setMessages(chat.messages || []); 
        setIsSharedReadOnly(!!chat.isSharedReadOnly);
        setSharedChatData(chat.isSharedReadOnly ? chat : null);
        setAppView('chat');
      }
      return prev;
    });
  }, [setActiveChatId, setMessages]);

  const renameChat = useCallback(async (id, newTitle) => {
    setChats(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, title: newTitle } : c);
      const result = safeSetLocalStorageItem('aura-chats', updated);
      return result || updated;
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
      const result = safeSetLocalStorageItem('aura-chats', updated);
      return result || updated;
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
            const result = safeSetLocalStorageItem('aura-chats', updated);
            return result || updated;
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
          const result = safeSetLocalStorageItem('aura-chats', updated);
          return result || updated;
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
      editingImage, setEditingImage,
      activeEditImage, setActiveEditImage,
      messages, setMessages,
      chats, setChats,
      activeChatId, setActiveChatId,
      isTemporary, setIsTemporary,
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
      isSharedReadOnly, setIsSharedReadOnly,
      sharedChatData, setSharedChatData,
      showLoggedIn: user || (isAuthLoading && typeof window !== 'undefined' && localStorage.getItem('aura-profile')),
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
