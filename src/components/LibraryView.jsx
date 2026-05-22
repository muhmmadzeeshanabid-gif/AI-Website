'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, LayoutGrid, List, File, FileText, Trash2, Download, X, Eye, ArrowDown, ArrowUp, MoreHorizontal, SquarePen, Plus, Mic } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useAppContext } from '@/context/AppContext';

// Pre-defined SVG data URLs for high-fidelity seeding
const SEED_SUNSET_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ff7e5f;stop-opacity:1" /><stop offset="100%" style="stop-color:%23feb47b;stop-opacity:1" /></linearGradient></defs><rect width="100" height="100" fill="url(%23g1)"/><circle cx="50" cy="50" r="20" fill="%23fff" opacity="0.3"/><path d="M 0,70 L 30,50 L 60,75 L 80,60 L 100,80 L 100,100 L 0,100 Z" fill="%23ffffff" opacity="0.15"/></svg>`;

const SEED_SYNTH_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%232c3e50;stop-opacity:1" /><stop offset="100%" style="stop-color:%23000000;stop-opacity:1" /></linearGradient></defs><rect width="100" height="100" fill="url(%23g2)"/><path d="M 10,0 L 10,100 M 30,0 L 30,100 M 50,0 L 50,100 M 70,0 L 70,100 M 90,0 L 90,100 M 0,10 L 100,10 M 0,30 L 100,30 M 0,50 L 100,50 M 0,70 L 100,70 M 0,90 L 100,90" stroke="%233498db" stroke-width="0.5" opacity="0.4"/><circle cx="50" cy="40" r="15" fill="%23e74c3c" opacity="0.7"/></svg>`;

const SEED_DOC_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231a1a1a"/><rect x="10" y="10" width="80" height="15" rx="2" fill="%23333"/><rect x="10" y="35" width="35" height="40" rx="2" fill="%232c3e50"/><rect x="55" y="35" width="35" height="10" rx="2" fill="%236366f1"/><rect x="55" y="50" width="35" height="5" rx="1" fill="%23444"/><rect x="55" y="60" width="35" height="5" rx="1" fill="%23444"/><rect x="55" y="70" width="20" height="5" rx="1" fill="%23444"/></svg>`;

const defaultFiles = [
  {
    id: 'seed-1',
    name: 'f770b1e4-62b0-4e0l-a8f5-c97aca853736.jpeg',
    type: 'image/jpeg',
    size: 33382, // 32.6 KB
    modified: 'Today',
    timestamp: Date.now() - 3600000,
    thumbnailUrl: SEED_SUNSET_SVG,
    isSeed: true
  },
  {
    id: 'seed-2',
    name: 'b6925b61-4155-4e25-a450-88ec7158eb59.jpeg',
    type: 'image/jpeg',
    size: 33382, // 32.6 KB
    modified: 'Today',
    timestamp: Date.now() - 7200000,
    thumbnailUrl: SEED_SYNTH_SVG,
    isSeed: true
  },
  {
    id: 'seed-3',
    name: 'screencapture-themewagon-github-io-VillaAgency-pro...',
    type: 'application/pdf',
    size: 1205862, // 1.15 MB
    modified: 'Tuesday',
    timestamp: Date.now() - 86400000 * 2,
    thumbnailUrl: SEED_DOC_SVG,
    isSeed: true
  },
  {
    id: 'seed-4',
    name: 'screencapture-themewagon-github-io-VillaAgency-ind...',
    type: 'application/pdf',
    size: 1018880, // 995 KB
    modified: 'Tuesday',
    timestamp: Date.now() - 86400000 * 2 - 3600000,
    thumbnailUrl: SEED_DOC_SVG,
    isSeed: true
  }
];

// IndexedDB setup for persisting raw original files
const dbName = 'aura-library-db';
const storeName = 'files-data';
const dbVersion = 3;

const openAuraDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error("IndexedDB is not available on server-side"));
      return;
    }
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = (e) => {
      resolve(e.target.result);
    };
    request.onerror = (e) => {
      reject(e.target.error || new Error("Failed to open IndexedDB"));
    };
  });
};

const getFileFromIndexedDB = async (id) => {
  try {
    const db = await openAuraDB();
    return new Promise((resolve) => {
      let resolved = false;
      const done = (val) => {
        if (!resolved) {
          resolved = true;
          resolve(val);
          try { db.close(); } catch (e) {}
        }
      };
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getReq = store.get(id);
      getReq.onsuccess = () => done(getReq.result || null);
      getReq.onerror = () => done(null);
      transaction.oncomplete = () => done(null);
      transaction.onerror = () => done(null);
    });
  } catch (err) {
    console.error("IndexedDB get error:", err);
    return null;
  }
};

const saveFileToIndexedDB = async (id, fileObj) => {
  try {
    const db = await openAuraDB();
    return new Promise((resolve) => {
      let resolved = false;
      const done = (val) => {
        if (!resolved) {
          resolved = true;
          resolve(val);
          try { db.close(); } catch (e) {}
        }
      };
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const putReq = store.put(fileObj, id);
      putReq.onsuccess = () => done(true);
      putReq.onerror = () => done(false);
      transaction.oncomplete = () => done(true);
      transaction.onerror = () => done(false);
    });
  } catch (err) {
    console.error("IndexedDB save error:", err);
    return false;
  }
};

const deleteFileFromIndexedDB = async (id) => {
  try {
    const db = await openAuraDB();
    return new Promise((resolve) => {
      let resolved = false;
      const done = (val) => {
        if (!resolved) {
          resolved = true;
          resolve(val);
          try { db.close(); } catch (e) {}
        }
      };
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const delReq = store.delete(id);
      delReq.onsuccess = () => done(true);
      delReq.onerror = () => done(false);
      transaction.oncomplete = () => done(true);
      transaction.onerror = () => done(false);
    });
  } catch (err) {
    console.error("IndexedDB delete error:", err);
    return false;
  }
};

export default function LibraryView() {
  const { user, isSidebarOpen, setIsSidebarOpen, createNewChat, setAppView } = useAppContext();
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All' | 'Images' | 'Files'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [activeFile, setActiveFile] = useState(null);
  const [localBlobUrls, setLocalBlobUrls] = useState({});
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [activeDropdownFileId, setActiveDropdownFileId] = useState(null);
  const [sidebarWasOpen, setSidebarWasOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: 'single', // 'single' | 'batch'
    targetId: null,
    fileName: ''
  });
  const fileInputRef = useRef(null);

  // Helper to format file size
  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to get relative date
  const getRelativeDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if same day
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Check if within 7 days
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }

    // Otherwise show date
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Load and Listen to data
  useEffect(() => {
    let unsubscribe = () => {};

    if (user?.uid) {
      // Sync from Firestore for logged-in user
      const filesColRef = collection(db, 'users', user.uid, 'library_files');
      unsubscribe = onSnapshot(filesColRef, (snapshot) => {
        const fetchedFiles = [];
        snapshot.forEach((doc) => {
          fetchedFiles.push(doc.data());
        });

        if (fetchedFiles.length === 0) {
          // If Firestore is empty, seed it
          defaultFiles.forEach(async (f) => {
            const docRef = doc(db, 'users', user.uid, 'library_files', f.id);
            await setDoc(docRef, f);
          });
          setFiles(defaultFiles);
        } else {
          setFiles(fetchedFiles);
        }
      }, (error) => {
        console.error("Firestore loading error, falling back to LocalStorage:", error);
        loadFromLocalStorage();
      });
    } else {
      // Guest mode - LocalStorage
      loadFromLocalStorage();
    }

    return () => unsubscribe();
  }, [user]);

  // Load raw files from IndexedDB to restore local high-res blob URLs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadFromIDB = async () => {
      const newBlobUrls = {};
      let updated = false;

      for (const file of files) {
        if (file.isSeed) continue;
        if (!localBlobUrls[file.id]) {
          const rawFile = await getFileFromIndexedDB(file.id);
          if (rawFile) {
            try {
              const url = URL.createObjectURL(rawFile);
              newBlobUrls[file.id] = url;
              updated = true;
            } catch (err) {
              console.error("Failed to create object URL for cached file:", err);
            }
          }
        }
      }

      if (updated) {
        setLocalBlobUrls(prev => ({ ...prev, ...newBlobUrls }));
      }
    };

    if (files.length > 0) {
      loadFromIDB();
    }
  }, [files]);

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('aura-library-files');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length === 0) {
          setFiles(defaultFiles);
          localStorage.setItem('aura-library-files', JSON.stringify(defaultFiles));
        } else {
          setFiles(parsed);
        }
      } else {
        setFiles(defaultFiles);
        localStorage.setItem('aura-library-files', JSON.stringify(defaultFiles));
      }
    } catch (e) {
      setFiles(defaultFiles);
    }
  };

  const saveToLocalStorage = (updatedFiles) => {
    if (!user?.uid) {
      try {
        localStorage.setItem('aura-library-files', JSON.stringify(updatedFiles));
      } catch (e) {
        console.error("Failed to save to local storage", e);
      }
    }
  };

  // Generate a compressed base64 thumbnail for persistence
  const generateThumbnail = (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload handler
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    const id = 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const blobUrl = URL.createObjectURL(uploadedFile);

    // Save full blobUrl to local cache for session-based high-res preview
    setLocalBlobUrls(prev => ({ ...prev, [id]: blobUrl }));

    // Persist raw file to IndexedDB for device-local reload recovery
    await saveFileToIndexedDB(id, uploadedFile);

    let thumbnailUrl = null;
    if (uploadedFile.type.startsWith('image/')) {
      thumbnailUrl = await generateThumbnail(uploadedFile);
    } else {
      thumbnailUrl = SEED_DOC_SVG;
    }

    const newFile = {
      id,
      name: uploadedFile.name,
      type: uploadedFile.type,
      size: uploadedFile.size,
      modified: 'Today',
      timestamp: Date.now(),
      thumbnailUrl
    };

    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    saveToLocalStorage(updatedFiles);

    // Firestore Sync
    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'library_files', id);
        await setDoc(docRef, newFile);
      } catch (err) {
        console.error("Failed to sync new file to Firestore:", err);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete handler
  const handleDeleteFile = async (id, e) => {
    if (e) e.stopPropagation();
    
    if (activeFile?.id === id) {
      setActiveFile(null);
    }

    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    saveToLocalStorage(updatedFiles);

    // Clean up local blob URL and IndexedDB
    if (localBlobUrls[id]) {
      try {
        URL.revokeObjectURL(localBlobUrls[id]);
      } catch (err) {
        console.error("Failed to revoke blob URL:", err);
      }
      setLocalBlobUrls(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    await deleteFileFromIndexedDB(id);

    // Firestore deletion
    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid, 'library_files', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Failed to delete file from Firestore:", err);
      }
    }
  };

  // Download handler
  const handleDownloadFile = (fileItem, e) => {
    if (e) e.stopPropagation();
    
    const url = localBlobUrls[fileItem.id] || fileItem.thumbnailUrl;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileItem.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Sorting Order
  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // Media preview selection with sidebar state saving
  const handleSelectFile = (file) => {
    if (file) {
      setSidebarWasOpen(isSidebarOpen);
      setIsSidebarOpen(false);
      setActiveFile(file);
    } else {
      setIsSidebarOpen(sidebarWasOpen);
      setActiveFile(null);
    }
  };

  // Close active dropdown menu when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (activeDropdownFileId && !e.target.closest('.dropdown-container')) {
        setActiveDropdownFileId(null);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [activeDropdownFileId]);

  // Batch action handlers
  const handleBatchStartChat = () => {
    if (createNewChat) {
      createNewChat();
      if (setAppView) setAppView('chat');
      setSelectedFileIds([]);
    }
  };

  const handleBatchDownload = () => {
    selectedFileIds.forEach(id => {
      const file = files.find(f => f.id === id);
      if (file) {
        handleDownloadFile(file);
      }
    });
    setSelectedFileIds([]);
  };

  const handleBatchDelete = () => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'batch',
      targetId: null,
      fileName: ''
    });
  };

  const executeDelete = async () => {
    if (deleteConfirmation.type === 'single') {
      const id = deleteConfirmation.targetId;
      await handleDeleteFile(id);
      if (activeFile?.id === id) {
        handleSelectFile(null);
      }
    } else if (deleteConfirmation.type === 'batch') {
      for (const id of selectedFileIds) {
        await handleDeleteFile(id);
      }
      setSelectedFileIds([]);
    }
    setDeleteConfirmation({ isOpen: false, type: 'single', targetId: null, fileName: '' });
  };

  // Filter and Search logic
  const filteredFiles = files.filter(f => {
    // 1. Tab Filter
    if (filter === 'Images') {
      if (!f.type.startsWith('image/')) return false;
    } else if (filter === 'Files') {
      if (f.type.startsWith('image/')) return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  }).sort((a, b) => {
    // Sort by timestamp
    return sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
  });

  if (activeFile) {
    const isImage = activeFile.type.startsWith('image/');
    const displayUrl = localBlobUrls[activeFile.id] || activeFile.thumbnailUrl;

    const handleSendPreviewMessage = (e) => {
      if (e) e.preventDefault();
      if (!chatInput.trim()) return;

      let contentToSend = '';
      if (isImage && displayUrl) {
        contentToSend = `![${activeFile.name}|${activeFile.id}](${displayUrl})\n\nAsk about this image: ${chatInput}`;
      } else {
        contentToSend = `📄 **${activeFile.name}**\n\nAsk about this file: ${chatInput}`;
      }

      localStorage.setItem('aura-pending-message', contentToSend);
      createNewChat();
      setChatInput('');
      handleSelectFile(null);
      setAppView('chat');
    };

    return (
      <div 
        className="w-full flex flex-col select-none" 
        style={{ 
          height: '100dvh', 
          backgroundColor: '#0c0c0d', 
          color: '#ffffff', 
          fontFamily: "'Outfit', sans-serif",
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 0.6; }
          }
          .mic-recording {
            animation: pulse 1.5s infinite ease-in-out;
            color: #ef4444 !important;
          }
        `}</style>

        {/* Top Header */}
        <div 
          className="preview-header"
          style={{ 
            height: '64px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0 24px',
            backgroundColor: 'rgba(12, 12, 13, 0.8)',
            backdropFilter: 'blur(20px)',
            zIndex: 10
          }}
        >
          {/* Left: Close/Back button */}
          <div className="preview-header-left flex items-center gap-4">
            <button 
              onClick={() => handleSelectFile(null)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-white/70 hover:text-white shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="preview-header-actions flex items-center gap-2">
            <button
              onClick={() => {
                const msg = isImage && displayUrl 
                  ? `![${activeFile.name}|${activeFile.id}](${displayUrl})\n\nAsk about this image:` 
                  : `📄 **${activeFile.name}**\n\nAsk about this file:`;
                localStorage.setItem('aura-pending-message', msg);
                createNewChat();
                handleSelectFile(null);
                setAppView('chat');
              }}
              className="preview-action-button px-4 py-2 rounded-full text-xs font-semibold bg-white text-black hover:bg-white/90 transition-colors flex items-center gap-1.5 shadow-md"
            >
              <SquarePen size={14} className="shrink-0" />
              <span className="preview-action-text">Start chat</span>
            </button>
            
            <button
              onClick={() => handleDownloadFile(activeFile)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white flex items-center justify-center shrink-0"
              title="Download"
            >
              <Download size={18} />
            </button>

            <button
              onClick={() => {
                setDeleteConfirmation({
                  isOpen: true,
                  type: 'single',
                  targetId: activeFile.id,
                  fileName: activeFile.name
                });
              }}
              className="p-2 rounded-full hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center shrink-0"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Centered Media Content */}
        <div 
          className="preview-media-content flex-1 flex items-center justify-center p-8 overflow-hidden relative"
          style={{ 
            backgroundColor: '#0c0c0d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '32px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {isImage && displayUrl ? (
            <img 
              src={displayUrl} 
              alt={activeFile.name} 
              className="preview-image animate-fade-in"
              style={{ 
                width: '100%',
                height: '100%',
                maxWidth: '90%',
                maxHeight: '65vh',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/40 animate-fade-in">
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center border"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <FileText size={48} />
              </div>
              <p className="text-sm font-medium">Preview not available for this file type</p>
            </div>
          )}
        </div>

        {/* Centered File Info */}
        <div 
          className="preview-file-info text-center px-6 py-2.5 shrink-0 select-text animate-fade-in"
          style={{ 
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '-8px',
            marginBottom: '8px'
          }}
        >
          <h2 
            className="text-base font-semibold text-white truncate max-w-[85vw] sm:max-w-md md:max-w-lg"
            style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: '#ffffff',
              lineHeight: '1.4'
            }}
            title={activeFile.name}
          >
            {activeFile.name}
          </h2>
          <p 
            className="text-xs text-white/40 mt-1 font-medium"
            style={{ 
              color: 'rgba(255, 255, 255, 0.4)', 
              fontSize: '12px' 
            }}
          >
            {formatSize(activeFile.size)} • {activeFile.type}
          </p>
        </div>

        {/* Bottom Capsule Input Bar */}
        <div 
          className="preview-input-container w-full pb-12 pt-4 px-6 flex justify-center"
          style={{
            background: 'linear-gradient(to top, #0c0c0d 80%, transparent)',
            zIndex: 10,
            paddingBottom: '48px'
          }}
        >
          <form 
            onSubmit={handleSendPreviewMessage}
            style={{
              width: '100%',
              maxWidth: '560px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1c1c1e',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '4px 6px 4px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                marginRight: '8px',
                cursor: 'pointer',
                opacity: 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
            >
              <Plus size={18} />
            </button>

            <input 
              type="text" 
              placeholder={`Ask about this ${isImage ? 'image' : 'file'}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ 
                flex: 1,
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                height: '38px',
                paddingRight: '80px'
              }}
            />
            
            <div 
              style={{ 
                position: 'absolute',
                right: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <button 
                type="button"
                onClick={() => {
                  if (isRecording) {
                    setIsRecording(false);
                  } else {
                    setIsRecording(true);
                    setTimeout(() => {
                      setChatInput("Describe this in detail and summarize it.");
                      setIsRecording(false);
                    }, 2000);
                  }
                }}
                className={isRecording ? 'mic-recording' : ''}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: isRecording ? '#ef4444' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isRecording) e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  if (!isRecording) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                <Mic size={18} />
              </button>
              
              <button 
                type="submit"
                disabled={!chatInput.trim() || isRecording}
                style={{ 
                  backgroundColor: chatInput.trim() ? '#f15a24' : 'rgba(255, 255, 255, 0.04)',
                  color: chatInput.trim() ? '#ffffff' : 'rgba(255, 255, 255, 0.2)', 
                  border: 'none',
                  outline: 'none',
                  cursor: chatInput.trim() ? 'pointer' : 'default',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col select-none" style={{ height: '100%', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Custom styled checkboxes looking like circular radio buttons */
        .grid-card-checkbox,
        .list-row-checkbox,
        .list-header-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 50% !important;
          outline: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          background-color: rgba(0, 0, 0, 0.45);
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .grid-card-checkbox:checked,
        .list-row-checkbox:checked,
        .list-header-checkbox:checked {
          background-color: var(--accent-color, #f15a24) !important;
          border-color: var(--accent-color, #f15a24) !important;
        }

        .grid-card-checkbox:checked::after,
        .list-row-checkbox:checked::after,
        .list-header-checkbox:checked::after {
          content: '';
          position: absolute;
          width: 9px;
          height: 5px;
          border-left: 2px solid #fff;
          border-bottom: 2px solid #fff;
          transform: rotate(-45deg) translate(0.5px, -0.5px);
        }

        /* Hover effect on desktop */
        @media (min-width: 769px) {
          .grid-card-checkbox,
          .card-actions-trigger {
            opacity: 0;
            transition: opacity 0.15s ease-in-out;
          }
          .grid-card:hover .grid-card-checkbox,
          .grid-card:hover .card-actions-trigger,
          .grid-card-checkbox:checked {
            opacity: 1 !important;
          }
          .list-row-checkbox,
          .list-actions-trigger {
            opacity: 0;
            transition: opacity 0.15s ease-in-out;
          }
          .list-row:hover .list-row-checkbox,
          .list-row:hover .list-actions-trigger,
          .list-row-checkbox:checked {
            opacity: 1 !important;
          }
          .list-header-checkbox {
            opacity: 0;
            transition: opacity 0.15s ease-in-out;
          }
          .list-header:hover .list-header-checkbox,
          .list-header-checkbox:checked {
            opacity: 1 !important;
          }
        }

        .mobile-batch-actions-bar {
          display: none !important;
        }

        /* Hide scrollbars for categories filter bar */
        .library-filters-left::-webkit-scrollbar {
          display: none;
        }
        .library-filters-left {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Responsive Styles for Library Page */
        @media (max-width: 768px) {
          .grid-card-checkbox,
          .list-row-checkbox {
            opacity: 1 !important;
          }
          .desktop-batch-actions-wrapper {
            display: none !important;
          }
          .filters-default-wrapper {
            display: flex !important;
          }
          .mobile-batch-actions-bar {
            display: flex !important;
          }
          .library-header-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .library-header-actions {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .library-search-wrapper {
            width: 100% !important;
          }
          .library-search-input {
            width: 100% !important;
          }
          .library-header-buttons {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
          }
          .library-upload-button {
            flex: 1 !important;
            justify-content: center !important;
          }
          .library-col-modified,
          .library-col-size {
            display: none !important;
          }
          .library-col-actions {
            width: 60px !important;
          }
          
          /* Preview Mode Responsive */
          .preview-header {
            padding: 0 12px !important;
            gap: 12px !important;
          }
          .preview-header-left {
            gap: 8px !important;
            flex: 1 !important;
            min-width: 0 !important;
          }
          .preview-header-actions {
            flex-shrink: 0 !important;
          }
          .preview-action-text {
            display: none !important;
          }
          .preview-action-button {
            padding: 8px !important;
            border-radius: 50% !important;
            width: 34px !important;
            height: 34px !important;
            justify-content: center !important;
          }
          .preview-file-meta {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .library-main-content {
            padding: 16px 16px 30px 16px !important;
          }
          .library-grid {
            --grid-item-min-width: 130px !important;
            gap: 16px !important;
          }
          /* Preview Mode Responsive */
          .preview-media-content {
            padding: 16px !important;
          }
          .preview-input-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .preview-image {
            width: 100% !important;
            height: 100% !important;
            max-height: 55vh !important;
            max-width: 95% !important;
            object-fit: contain !important;
          }
        }
        @media (max-height: 700px) {
          .preview-image {
            max-height: 48vh !important;
          }
        }
      `}</style>
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Header Container */}
      <div className="w-full" style={{ borderBottom: '1px solid var(--border-color)', paddingTop: '48px', paddingBottom: '20px' }}>
        <div className="library-header-inner" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontSize: '32px' }}>Library</h1>
          
          {/* Search & Actions */}
          <div className="library-header-actions flex items-center gap-4">
            {/* Search Input Wrapper */}
            <div className="relative flex items-center library-search-wrapper">
              <Search size={18} className="absolute left-4" style={{ color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Search library" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="library-search-input border border-transparent rounded-full text-sm outline-none"
                style={{
                  width: '260px',
                  padding: '10px 20px 10px 44px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease',
                  fontSize: '14px'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-color)'}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
            </div>
            
            {/* Action Buttons: Layout Switcher & Upload */}
            <div className="flex items-center gap-4 library-header-buttons">
              {/* Grid/List toggles */}
              <div className="flex items-center rounded-lg border" style={{ padding: '4px', gap: '4px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <button 
                  onClick={() => setViewMode('grid')}
                  className="rounded-md transition-all"
                  style={{
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: viewMode === 'grid' ? 'var(--bg-tertiary)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== 'grid') e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== 'grid') e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className="rounded-md transition-all"
                  style={{
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: viewMode === 'list' ? 'var(--bg-tertiary)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== 'list') e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== 'list') e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Upload Button */}
              <button 
                onClick={handleUploadClick}
                className="library-upload-button font-bold rounded-full flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-md"
                style={{ 
                  fontWeight: 600,
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Upload size={16} strokeWidth={2.5} />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories / Filters row */}
      <div className="w-full" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
        <div className="library-filters-inner" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Desktop-only Batch Actions wrapper */}
          <div 
            className="desktop-batch-actions-wrapper w-full" 
            style={{ display: selectedFileIds.length > 0 ? 'block' : 'none' }}
          >
            <div className="library-batch-actions flex items-center justify-between w-full">
              {/* Left: Buttons styled as "Start chat", "Download", "Delete" */}
              <div className="library-batch-actions-left flex items-center gap-3">
                {/* Start Chat Button */}
                <button
                  onClick={handleBatchStartChat}
                  className="font-bold rounded-full flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-md"
                  style={{
                    fontWeight: 600,
                    backgroundColor: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    padding: '8px 20px'
                  }}
                >
                  <SquarePen size={16} />
                  <span>Start chat</span>
                </button>

                {/* Download Button */}
                <button
                  onClick={handleBatchDownload}
                  className="font-bold rounded-full flex items-center gap-2 hover:bg-white/10 transition-all text-sm border"
                  style={{
                    fontWeight: 600,
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent',
                    padding: '8px 20px'
                  }}
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={handleBatchDelete}
                  className="font-bold rounded-full flex items-center gap-2 hover:bg-rose-500/10 transition-all text-sm border"
                  style={{
                    fontWeight: 600,
                    borderColor: '#f43f5e',
                    color: '#f43f5e',
                    backgroundColor: 'transparent',
                    padding: '8px 20px'
                  }}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>

              {/* Right: Selected count and Clear selection */}
              <div className="library-batch-actions-right flex items-center gap-4">
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'} selected
                </span>
                <button
                  onClick={() => setSelectedFileIds([])}
                  className="text-sm font-medium hover:opacity-80 transition-all"
                  style={{ color: 'var(--accent-color)' }}
                >
                  Clear selection
                </button>
              </div>
            </div>
          </div>

          {/* Default Filters and Sorting wrapper */}
          <div 
            className="filters-default-wrapper w-full flex items-center justify-between"
            style={{ display: selectedFileIds.length > 0 ? 'none' : 'flex' }}
          >
            {/* Left Tabs */}
            <div className="library-filters-left flex items-center gap-2">
              {['All', 'Images', 'Files'].map((tab) => {
                const isActive = filter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className="rounded-full text-sm font-medium transition-all"
                    style={{
                      padding: '6px 16px',
                      backgroundColor: isActive ? 'var(--text-primary)' : 'transparent',
                      color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      border: isActive ? 'none' : '1px solid var(--border-color)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Right sorting */}
            <div className="library-filters-right flex items-center">
              {/* Sorting */}
              <button 
                onClick={handleSortToggle}
                className="flex items-center gap-1.5 px-3 rounded-lg text-sm transition-all"
                style={{
                  padding: '6px 12px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>Modified</span>
                {sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Files Display Area */}
      <div className="library-main-content flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '24px 32px 40px 32px', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          {filteredFiles.length === 0 ? (
            <div className="w-full h-80 flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-secondary)' }}>
              <File size={48} strokeWidth={1.5} className="opacity-40" />
              <p className="text-sm">No items found in your library</p>
            </div>
          ) : viewMode === 'list' ? (
            /* List Layout */
            <div className="w-full flex flex-col">
              {/* Table Header */}
              <div 
                className="list-header flex items-center px-6 text-xs font-semibold uppercase tracking-wider"
                style={{ 
                  color: 'var(--text-tertiary)',
                  borderBottom: '1px solid var(--border-color)',
                  paddingTop: '20px',
                  paddingBottom: '20px',
                  marginBottom: '24px'
                }}
              >
                {/* Checkbox Header */}
                <div style={{ width: '48px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox"
                    checked={filteredFiles.length > 0 && filteredFiles.every(f => selectedFileIds.includes(f.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = filteredFiles.map(f => f.id);
                        setSelectedFileIds(prev => {
                          const unique = new Set([...prev, ...allIds]);
                          return Array.from(unique);
                        });
                      } else {
                        const filteredIds = new Set(filteredFiles.map(f => f.id));
                        setSelectedFileIds(prev => prev.filter(id => !filteredIds.has(id)));
                      }
                    }}
                    className="list-header-checkbox rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                  />
                </div>
                <div style={{ width: '40px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, paddingLeft: '16px' }}>Name</div>
                <div className="library-col-modified" style={{ width: '150px', flexShrink: 0, paddingLeft: '16px' }}>Modified</div>
                <div className="library-col-size" style={{ width: '100px', flexShrink: 0, textAlign: 'right', paddingRight: '24px' }}>Size</div>
                <div className="library-col-actions" style={{ width: '120px', flexShrink: 0 }} />
              </div>

              {/* Table Rows */}
              <div className="flex flex-col" style={{ gap: '14px' }}>
                {filteredFiles.map((file) => {
                  const isImage = file.type.startsWith('image/');
                  const displayUrl = localBlobUrls[file.id] || file.thumbnailUrl;
                  
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleSelectFile(file)}
                      className="group list-row flex items-center px-6 rounded-xl transition-all cursor-pointer border border-transparent"
                      style={{
                        backgroundColor: 'transparent',
                        paddingTop: '16px',
                        paddingBottom: '16px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      {/* Checkbox Column */}
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        style={{ width: '48px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedFileIds.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFileIds(prev => [...prev, file.id]);
                            } else {
                              setSelectedFileIds(prev => prev.filter(id => id !== file.id));
                            }
                          }}
                          className="list-row-checkbox rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                        />
                      </div>

                      {/* Icon/Thumbnail */}
                      <div 
                        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          borderColor: 'var(--border-color)',
                          width: '40px',
                          height: '40px'
                        }}
                      >
                        {isImage && displayUrl ? (
                          <img 
                            src={displayUrl} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
                        )}
                      </div>

                      {/* File Name */}
                      <div style={{ flex: 1, minWidth: 0, paddingLeft: '16px', paddingRight: '16px' }}>
                        <p 
                          className="text-sm font-medium truncate transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {file.name}
                        </p>
                      </div>

                      {/* Modified Date */}
                      <div className="library-col-modified text-sm" style={{ width: '150px', flexShrink: 0, color: 'var(--text-secondary)', paddingLeft: '16px' }}>
                        {getRelativeDate(file.timestamp)}
                      </div>

                      {/* Size */}
                      <div className="library-col-size text-sm" style={{ width: '100px', flexShrink: 0, color: 'var(--text-secondary)', textAlign: 'right', paddingRight: '24px' }}>
                        {formatSize(file.size)}
                      </div>

                      {/* Actions Menu Trigger */}
                      <div 
                        className="library-col-actions dropdown-container"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '120px', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
                      >
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownFileId(activeDropdownFileId === file.id ? null : file.id);
                            }}
                            className="list-actions-trigger p-2 rounded-lg transition-colors"
                            style={{ 
                              color: activeDropdownFileId === file.id ? 'var(--text-primary)' : 'var(--text-secondary)', 
                              backgroundColor: activeDropdownFileId === file.id ? 'var(--bg-tertiary)' : 'transparent',
                              opacity: activeDropdownFileId === file.id ? 1 : undefined,
                              outline: 'none',
                              border: 'none',
                              boxShadow: 'none'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--text-primary)';
                              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                            }}
                            onMouseLeave={(e) => {
                              if (activeDropdownFileId !== file.id) {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {activeDropdownFileId === file.id && (
                            <div 
                              className="absolute right-0 top-full mt-2 z-50 rounded-2xl border shadow-2xl flex flex-col animate-fade-in"
                              style={{
                                backgroundColor: 'var(--bg-secondary)',
                                borderColor: 'var(--border-color)',
                                minWidth: '170px',
                                padding: '6px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(255, 255, 255, 0.05) inset',
                                gap: '4px'
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  handleDownloadFile(file, e);
                                  setActiveDropdownFileId(null);
                                }}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all w-full text-left"
                                style={{ color: 'var(--text-primary)', outline: 'none', border: 'none' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-overlay)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <Download size={16} style={{ color: 'var(--text-secondary)' }} />
                                <span>Download</span>
                              </button>

                              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '2px 6px' }} />

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmation({
                                    isOpen: true,
                                    type: 'single',
                                    targetId: file.id,
                                    fileName: file.name
                                  });
                                  setActiveDropdownFileId(null);
                                }}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all w-full text-left"
                                style={{ color: '#ef4444', outline: 'none', border: 'none' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <Trash2 size={16} style={{ color: '#ef4444' }} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Grid Layout */
            <div 
              className="library-grid grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(var(--grid-item-min-width, 220px), 1fr))',
                gap: '24px'
              }}
            >
              {filteredFiles.map((file) => {
                const isImage = file.type.startsWith('image/');
                const displayUrl = localBlobUrls[file.id] || file.thumbnailUrl;
                
                return (
                  <div
                    key={file.id}
                    title={file.name}
                    onClick={() => handleSelectFile(file)}
                    className="group grid-card rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col border relative"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Checkbox overlay (top-left) */}
                    <div 
                      className="absolute z-10" 
                      style={{ top: '16px', left: '16px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFileIds(prev => [...prev, file.id]);
                          } else {
                            setSelectedFileIds(prev => prev.filter(id => id !== file.id));
                          }
                        }}
                        className="grid-card-checkbox rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          cursor: 'pointer',
                          accentColor: 'var(--accent-color)'
                        }}
                      />
                    </div>


                    {/* Aspect Card Wrapper */}
                    <div 
                      className="relative flex items-center justify-center overflow-hidden"
                      style={{
                        aspectRatio: '1/1',
                        backgroundColor: 'var(--bg-tertiary)'
                      }}
                    >
                      {isImage && displayUrl ? (
                        <img 
                          src={displayUrl} 
                          alt={file.name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <FileText size={40} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Batch Actions Bar */}
      {selectedFileIds.length > 0 && (
        <div 
          className="mobile-batch-actions-bar"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(28, 28, 30, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            zIndex: 999,
            maxWidth: 'calc(100% - 32px)',
            width: 'max-content'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)', whiteSpace: 'nowrap' }}>
            {selectedFileIds.length} Selected
          </span>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
          <button
            onClick={handleBatchDelete}
            style={{
              backgroundColor: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
          <button
            onClick={() => setSelectedFileIds([])}
            style={{
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            className="rounded-3xl border shadow-2xl flex flex-col p-6 max-w-sm w-full animate-scale-up"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-overlay)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={16} />
            </button>

            {/* Warning Icon Banner */}
            <div className="flex flex-col items-center text-center mt-2">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444'
                }}
              >
                <Trash2 size={24} />
              </div>

              {/* Title */}
              <h3 
                className="text-lg font-bold mb-2"
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  fontWeight: '700',
                  lineHeight: '1.2'
                }}
              >
                {deleteConfirmation.type === 'single' ? 'Delete File?' : 'Delete Selected Files?'}
              </h3>

              {/* Description */}
              <p 
                className="text-sm mb-6"
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginTop: '6px'
                }}
              >
                {deleteConfirmation.type === 'single' ? (
                  <>
                    Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{deleteConfirmation.fileName}</strong>? This action cannot be undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete <strong>{selectedFileIds.length}</strong> selected files? This action cannot be undone.
                  </>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-overlay)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
