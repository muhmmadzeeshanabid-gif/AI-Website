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
          const MAX_WIDTH = 120;
          const MAX_HEIGHT = 120;
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
          resolve(canvas.toDataURL('image/jpeg', 0.7));
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

  const handleBatchDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedFileIds.length} files?`)) {
      // Use for...of to ensure sequential deletion and correct local state updates
      for (const id of selectedFileIds) {
        await handleDeleteFile(id);
      }
      setSelectedFileIds([]);
    }
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
        contentToSend = `![${activeFile.name}](${displayUrl})\n\nAsk about this image: ${chatInput}`;
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
          position: 'relative'
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
          {/* Left: Close/Back button & File Details */}
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => handleSelectFile(null)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate text-white">{activeFile.name}</h2>
              <p className="text-xs text-white/50">{formatSize(activeFile.size)} • {activeFile.type}</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const msg = isImage && displayUrl 
                  ? `![${activeFile.name}](${displayUrl})\n\nAsk about this image:` 
                  : `📄 **${activeFile.name}**\n\nAsk about this file:`;
                localStorage.setItem('aura-pending-message', msg);
                createNewChat();
                handleSelectFile(null);
                setAppView('chat');
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-black hover:bg-white/90 transition-colors flex items-center gap-1.5 shadow-md"
            >
              <SquarePen size={14} />
              <span>Start chat</span>
            </button>
            
            <button
              onClick={() => handleDownloadFile(activeFile)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white flex items-center justify-center"
              title="Download"
            >
              <Download size={18} />
            </button>

            <button
              onClick={async () => {
                if (confirm('Are you sure you want to delete this file?')) {
                  await handleDeleteFile(activeFile.id);
                  handleSelectFile(null);
                }
              }}
              className="p-2 rounded-full hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Centered Media Content */}
        <div 
          className="flex-1 flex items-center justify-center p-8 overflow-hidden relative"
          style={{ backgroundColor: '#0c0c0d' }}
        >
          {isImage && displayUrl ? (
            <img 
              src={displayUrl} 
              alt={activeFile.name} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-fade-in"
              style={{ 
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

        {/* Bottom Capsule Input Bar */}
        <div 
          className="w-full pb-8 pt-4 px-6 flex justify-center"
          style={{
            background: 'linear-gradient(to top, #0c0c0d 80%, transparent)',
            zIndex: 10
          }}
        >
          <form 
            onSubmit={handleSendPreviewMessage}
            style={{
              width: '100%',
              maxWidth: '400px',
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
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontSize: '32px' }}>Library</h1>
          
          {/* Search & Upload */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4" style={{ color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Search library" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-transparent rounded-full text-sm outline-none"
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
            
            <button 
              onClick={handleUploadClick}
              className="font-bold rounded-full flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-md"
              style={{ 
                fontWeight: 600,
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                padding: '10px 24px'
              }}
            >
              <Upload size={16} strokeWidth={2.5} />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories / Filters row */}
      <div className="w-full" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {selectedFileIds.length > 0 ? (
            <div className="flex items-center justify-between w-full">
              {/* Left: Buttons styled as "Start chat", "Download", "Delete" */}
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-4">
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
          ) : (
            <>
              {/* Left Tabs */}
              <div className="flex items-center gap-2">
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
            </>
          )}

          {/* Right sorting and layout */}
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>

      {/* Main Files Display Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '24px 32px 40px 32px', backgroundColor: 'var(--bg-primary)' }}>
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
                className="list-header flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ 
                  color: 'var(--text-tertiary)',
                  borderBottom: '1px solid var(--border-color)'
                }}
              >
                {/* Checkbox Header */}
                <div style={{ width: '40px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
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
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                  />
                </div>
                <div style={{ width: '40px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, paddingLeft: '16px' }}>Name</div>
                <div style={{ width: '150px', flexShrink: 0, paddingLeft: '16px' }}>Modified</div>
                <div style={{ width: '100px', flexShrink: 0, textAlign: 'right', paddingRight: '24px' }}>Size</div>
                <div style={{ width: '120px', flexShrink: 0 }} />
              </div>

              {/* Table Rows */}
              <div className="flex flex-col" style={{ gap: '8px' }}>
                {filteredFiles.map((file) => {
                  const isImage = file.type.startsWith('image/');
                  const displayUrl = localBlobUrls[file.id] || file.thumbnailUrl;
                  
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleSelectFile(file)}
                      className="group list-row flex items-center px-4 py-3.5 rounded-xl transition-all cursor-pointer border border-transparent"
                      style={{
                        backgroundColor: 'transparent',
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
                        style={{ width: '40px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
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
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
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
                      <div className="text-sm" style={{ width: '150px', flexShrink: 0, color: 'var(--text-secondary)', paddingLeft: '16px' }}>
                        {getRelativeDate(file.timestamp)}
                      </div>

                      {/* Size */}
                      <div className="text-sm" style={{ width: '100px', flexShrink: 0, color: 'var(--text-secondary)', textAlign: 'right', paddingRight: '24px' }}>
                        {formatSize(file.size)}
                      </div>

                      {/* Actions Menu Trigger */}
                      <div 
                        className="relative dropdown-container"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '120px', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownFileId(activeDropdownFileId === file.id ? null : file.id);
                          }}
                          className="list-actions-trigger p-2 rounded-lg transition-colors"
                          style={{ 
                            color: 'var(--text-secondary)', 
                            backgroundColor: 'transparent',
                            opacity: activeDropdownFileId === file.id ? 1 : undefined
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
                            className="absolute right-0 top-full mt-1 z-50 rounded-xl border shadow-xl flex flex-col overflow-hidden animate-fade-in"
                            style={{
                              backgroundColor: 'var(--bg-secondary)',
                              borderColor: 'var(--border-color)',
                              minWidth: '130px',
                              backdropFilter: 'blur(10px)',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            <button
                              onClick={(e) => {
                                handleDownloadFile(file, e);
                                setActiveDropdownFileId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors w-full text-left"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <Download size={14} />
                              <span>Download</span>
                            </button>
                            <button
                              onClick={(e) => {
                                handleDeleteFile(file.id, e);
                                setActiveDropdownFileId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-rose-500/10 transition-colors w-full text-left"
                              style={{ color: '#f43f5e', borderTop: '1px solid var(--border-color)' }}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Grid Layout */
            <div 
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
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
                      className="absolute top-3 left-3 z-10" 
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

    </div>
  );
}
