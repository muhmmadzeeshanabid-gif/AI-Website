'use client';
import React from 'react';
import ReactDOM from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { MessageSquare, Plus, Settings, LogOut, User, Menu, X, ChevronDown, ChevronUp, Search, Bot, PanelLeftClose, PanelLeftOpen, Edit, SquarePen, MoreHorizontal, Share2, Users, Pencil, Pin, Archive, Trash2, Sparkles, Palette, UserCircle, HelpCircle, ChevronRight, Lock, Image, Telescope, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';
import ProfileModal from './ProfileModal';
import LogoutModal from './LogoutModal';
import SearchModal from './SearchModal';

const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen, setMessages, chats, setChats, deleteChat, switchChat, createNewChat, activeChatId, profile, user, setAuthOpen, isAuthLoading, showLoggedIn, archivedChats, archiveChat, unarchiveChat, archivePassword, setArchivePassword, closeArchivedChat } = useAppContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [isRecentOpen, setIsRecentOpen] = React.useState(true);
  const [hoveredChat, setHoveredChat] = React.useState(null);
  const [openMenuIndex, setOpenMenuIndex] = React.useState(null);
  const [menuPos, setMenuPos] = React.useState({ top: 0, left: 0 });
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [isRecentHeaderHovered, setIsRecentHeaderHovered] = React.useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState(false);
  const [moreMenuPos, setMoreMenuPos] = React.useState({ top: 0, left: 0 });
  const moreMenuRef = React.useRef(null);
  const [profileMenuPos, setProfileMenuPos] = React.useState({ bottom: 0, left: 0, width: 0 });

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreMenuOpen]);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = React.useState('general');
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const profileRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isRecentsCardOpen, setIsRecentsCardOpen] = React.useState(false);
  const recentsButtonRef = React.useRef(null);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isLogoHovered, setIsLogoHovered] = React.useState(false);
  const [renamingIndex, setRenamingIndex] = React.useState(null);
  const [renameValue, setRenameValue] = React.useState('');
  const renameInputRef = React.useRef(null);

  const [deleteConfirm, setDeleteConfirm] = React.useState({ open: false, id: null, name: '' });

  // ── Archived Chats State ──────────────────────────────────────────────────
  const [showArchived, setShowArchived] = React.useState(false);
  const [archiveUnlocked, setArchiveUnlocked] = React.useState(false);
  const [archivePwdInput, setArchivePwdInput] = React.useState('');
  const [archivePwdError, setArchivePwdError] = React.useState(false);
  const [showSetPwd, setShowSetPwd] = React.useState(false);
  const [newPwd, setNewPwd] = React.useState('');
  const [newPwdConfirm, setNewPwdConfirm] = React.useState('');
  const [pwdSetError, setPwdSetError] = React.useState('');
  // ─────────────────────────────────────────────────────────────────────────

  const handleDelete = (chat) => {
    console.log('handleDelete called:', chat);
    if (!chat) return;
    setOpenMenuIndex(null);
    setDeleteConfirm({ open: true, id: chat.id, name: chat.title });
  };

  const confirmDelete = () => {
    deleteChat(deleteConfirm.id);
    setDeleteConfirm({ open: false, id: null, name: '' });
  };

  const [searchModalOpen, setSearchModalOpen] = React.useState(false);

  const handleRename = (i) => {
    setRenameValue(chats[i].title);
    setRenamingIndex(i);
    setOpenMenuIndex(null);
    setTimeout(() => {
      if (renameInputRef.current) {
        renameInputRef.current.focus();
        renameInputRef.current.select();
      }
    }, 50);
  };

  const saveRename = (i) => {
    if (renameValue.trim()) {
      setChats(prev => prev.map((c, idx) => idx === i ? { ...c, title: renameValue.trim() } : c));
    }
    setRenamingIndex(null);
  };

  const handlePin = (chat) => {
    setChats(prev => {
      const updated = prev.map(c => c.id === chat.id ? { ...c, pinned: !c.pinned } : c);
      // Move pinned to top
      return [...updated.filter(c => c.pinned), ...updated.filter(c => !c.pinned)];
    });
    setOpenMenuIndex(null);
  };

  // Sorted: pinned first, then rest
  // Filter out empty chats and then sort: pinned first, then the rest
  const displayChats = chats.filter(c => c.messages.length > 0);
  const sortedChats = [...displayChats.filter(c => c.pinned), ...displayChats.filter(c => !c.pinned)];

  return (
    <>
      <motion.div
        initial={false}
        animate={{ 
          width: isSidebarOpen ? '280px' : '68px',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="relative h-screen bg-sidebar-bg border-r border-white/5 flex flex-col z-40 shadow-2xl"
      >
        {/* Top Header / Logo Area */}
        <div className={`p-4 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className="relative group/logo">
            <button 
              onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${!isSidebarOpen ? 'hover:bg-white/10 cursor-pointer' : ''}`}
            >
              {!isSidebarOpen ? (
                <div className="relative w-10 h-10 flex items-center justify-center">
                  {!isLogoHovered ? (
                    <Bot size={24} style={{ color: '#fff' }} />
                  ) : (
                    <PanelLeftOpen size={24} style={{ color: '#fff' }} />
                  )}
                  
                  {/* Tooltip for Open Sidebar */}
                  {isLogoHovered && (
                    <div 
                      style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                      className="absolute px-2 py-1 bg-black text-white text-[11px] font-bold rounded whitespace-nowrap z-50 border border-white/10 shadow-2xl"
                    >
                      Open sidebar
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--hover-overlay-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface)', flexShrink: 0 }}>
                  <Bot size={20} />
                </div>
              )}
            </button>
          </div>
          
          {isSidebarOpen && (
            <div className="relative group/tooltip">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                style={{ padding: 8, borderRadius: 8, color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <PanelLeftClose size={20} />
              </button>
              <div 
                style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                className="absolute px-2 py-1 bg-black text-white text-[11px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10 shadow-2xl"
              >
                Close sidebar
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`px-3 space-y-2 mt-4 ${!isSidebarOpen && 'flex flex-col items-center'}`}>
          <div className="relative group/tooltip w-full flex justify-center">
            <button 
              onClick={() => { createNewChat(); closeArchivedChat(); }}
              style={{
                display: 'flex', alignItems: 'center', background: 'transparent', border: 'none',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s', color: 'var(--on-surface)',
                width: isSidebarOpen ? '100%' : 'auto',
                padding: '10px 12px',
                justifyContent: isSidebarOpen ? 'space-between' : 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SquarePen size={20} style={{ color: '#fff' }} />
                {isSidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>New chat</span>}
              </div>
            </button>
            {!isSidebarOpen && (
              <div 
                style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                className="absolute px-2 py-1 bg-black text-white text-[11px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10 shadow-2xl"
              >
                New chat
              </div>
            )}
          </div>
          
          <div className="relative group/tooltip w-full flex justify-center">
            <button
              onClick={() => setSearchModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', background: 'transparent', border: 'none',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s', color: 'var(--on-surface)',
                width: isSidebarOpen ? '100%' : 'auto',
                padding: '10px 12px', gap: 12,
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Search size={20} style={{ color: '#fff' }} />
              {isSidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>Search chats</span>}
            </button>
            {!isSidebarOpen && (
              <div 
                style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                className="absolute px-2 py-1 bg-black text-white text-[11px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10 shadow-2xl"
              >
                Search chats
              </div>
            )}
          </div>
          
          {/* More Menu */}
          <div className="relative w-full flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setMoreMenuPos({ top: rect.top, left: rect.right + 12 });
                setIsMoreMenuOpen(!isMoreMenuOpen);
              }}
              style={{
                display: 'flex', alignItems: 'center', background: 'transparent', border: 'none',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s', color: 'var(--on-surface)',
                width: isSidebarOpen ? '100%' : 'auto',
                padding: '10px 12px', gap: 12,
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                backgroundColor: isMoreMenuOpen ? 'var(--hover-overlay)' : 'transparent',
              }}
              onMouseEnter={e => { if(!isMoreMenuOpen) e.currentTarget.style.background = 'var(--hover-overlay)'; }}
              onMouseLeave={e => { if(!isMoreMenuOpen) e.currentTarget.style.background = 'transparent'; }}
            >
              <MoreHorizontal size={20} style={{ color: '#fff' }} />
              {isSidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>More</span>}
            </button>
            
            {/* Hover Menu Card - Fixed outside sidebar */}
            <AnimatePresence>
              {isMoreMenuOpen && (
                <motion.div 
                  ref={moreMenuRef}
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed z-[9999]"
                  style={{
                    top: moreMenuPos.top,
                    left: moreMenuPos.left,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div 
                    className="border border-white/10 shadow-2xl backdrop-blur-xl"
                    style={{ 
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--divider)',
                      borderRadius: 18,
                      width: 220,
                      padding: 10,
                    }}
                  >
                     <button className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 text-white text-[14.5px] font-medium transition-all text-left">
                        <Image size={20} className="shrink-0" />
                        <span>Images</span>
                     </button>
                     <button className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 text-white text-[14.5px] font-medium transition-all text-left">
                        <Telescope size={20} className="shrink-0" />
                        <span>Deep research</span>
                     </button>
                     <button className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 text-white text-[14.5px] font-medium transition-all text-left">
                        <LayoutGrid size={20} className="shrink-0" />
                        <span>Apps</span>
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isSidebarOpen && (
            <div className="relative group/tooltip w-full flex justify-center" ref={recentsButtonRef}>
              <button 
                onClick={() => setIsRecentsCardOpen(!isRecentsCardOpen)}
                style={{
                  padding: 10, borderRadius: 12, background: isRecentsCardOpen ? 'var(--hover-overlay)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s', color: '#fff'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                onMouseLeave={e => { if(!isRecentsCardOpen) { e.currentTarget.style.background = 'transparent'; } }}
              >
                <MessageSquare size={20} />
              </button>
              {!isRecentsCardOpen && (
                <div 
                  style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                  className="absolute px-2 py-1 bg-black text-white text-[11px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10 shadow-2xl"
                >
                  Recents
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-hidden flex flex-col mt-6">
          {isSidebarOpen && mounted && showLoggedIn && (
            <div className="px-4 mb-1">
              <button 
                onClick={() => setIsRecentOpen(!isRecentOpen)}
                className="flex items-center gap-2 py-1 rounded-lg transition-all"
                style={{ background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; setIsRecentHeaderHovered(true); }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; setIsRecentHeaderHovered(false); }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', textTransform: 'none', letterSpacing: '0.04em' }}>Recents</span>
                <ChevronDown size={15} className="transition-all duration-200" style={{ color: '#fff', opacity: isRecentHeaderHovered ? 1 : 0, transform: isRecentOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar py-1 px-3">
            <AnimatePresence initial={false}>
              {isRecentOpen && isSidebarOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex flex-col w-full"
                >
                  {mounted && showLoggedIn && sortedChats.map((chat, i) => (
                    <div
                      key={i}
                      className="relative"
                      ref={openMenuIndex === i ? menuRef : null}
                      onMouseEnter={() => setHoveredChat(i)}
                      onMouseLeave={() => setHoveredChat(null)}
                    >
                      <div
                        className="w-full flex items-center justify-between rounded-lg text-left transition-all duration-150"
                        style={{
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          paddingLeft: '12px',
                          paddingRight: '12px',
                          marginBottom: '2px',
                          backgroundColor: hoveredChat === i || openMenuIndex === i || activeChatId === chat.id ? 'var(--chat-item-active)' : 'transparent',
                        }}
                        onClick={() => { switchChat(chat.id); closeArchivedChat(); }}
                      >
                        {renamingIndex === i ? (
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onBlur={() => saveRename(i)}
                            onKeyDown={e => { if (e.key === 'Enter') saveRename(i); if (e.key === 'Escape') setRenamingIndex(null); }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              flex: 1,
                              background: 'transparent',
                              outline: 'none',
                              border: 'none',
                              color: 'var(--on-surface)',
                              caretColor: 'var(--on-surface)',
                              fontSize: '14.5px',
                              fontWeight: 400,
                              width: '100%',
                              padding: '0',
                              fontFamily: 'inherit',
                            }}
                          />
                        ) : (
                          <span
                            className="truncate text-[14.5px] block text-left leading-snug flex-1 cursor-pointer"
                            style={{ color: 'var(--on-surface)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            {chat.pinned && <Pin size={11} style={{ color: 'var(--on-surface-subtle)', flexShrink: 0 }} />}
                            <span className="truncate">{chat.title}</span>
                          </span>
                        )}
                        <span
                          className="transition-opacity ml-2 shrink-0 cursor-pointer"
                          style={{ opacity: hoveredChat === i || openMenuIndex === i ? 1 : 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: rect.top, left: rect.right + 8 });
                            setOpenMenuIndex(openMenuIndex === i ? null : i);
                          }}
                        >
                          <MoreHorizontal size={15} style={{ color: '#fff' }} />
                        </span>
                      </div>

                      {/* Context Menu Dropdown - Fixed outside sidebar */}
                      <AnimatePresence>
                        {openMenuIndex === i && (
                          <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="fixed z-[9999] w-56 rounded-2xl overflow-hidden"
                            style={{
                              background: 'var(--surface-1)',
                              border: '1px solid var(--divider)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                              top: menuPos.top,
                              left: menuPos.left,
                            }}
                          >
                            {[
                              { icon: <Share2 size={15} />, label: 'Share', action: () => setOpenMenuIndex(null) },
                              { icon: <Users size={15} />, label: 'Start a group chat', action: () => setOpenMenuIndex(null) },
                              { icon: <Pencil size={15} />, label: 'Rename', action: () => handleRename(i) },
                              { icon: <Pin size={15} />, label: chat.pinned ? 'Unpin chat' : 'Pin chat', action: () => handlePin(chat) },
                              { icon: <Archive size={15} />, label: 'Archive', action: () => { archiveChat(chat.id); setOpenMenuIndex(null); } },
                            ].map((item, j) => (
                              <button
                                key={j}
                                onClick={item.action}
                                className="w-full flex items-center gap-3 px-4 text-sm transition-all text-left"
                                style={{
                                  paddingTop: '9px',
                                  paddingBottom: '9px',
                                  color: 'var(--on-surface)',
                                  borderBottom: j === 2 ? '1px solid var(--divider)' : 'none',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <span style={{ color: 'var(--on-surface-subtle)' }}>{item.icon}</span>
                                {item.label}
                              </button>
                            ))}
                            <button
                              onClick={() => handleDelete(chat)}
                              className="w-full flex items-center gap-3 px-4 text-sm transition-all text-left"
                              style={{
                              color: '#ef4444',
                                paddingTop: '9px',
                                paddingBottom: '9px',
                                borderTop: '1px solid var(--divider)',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 size={15} style={{ color: '#ef4444' }} />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>


        </div>

        {/* Bottom Profile Area */}
        <div className="p-3 mt-auto" ref={profileRef}>
          {mounted && showLoggedIn ? (
            <div
              style={{ display: 'flex', alignItems: 'center', borderRadius: 16, transition: 'background 0.15s', cursor: 'pointer' }}
              className={isSidebarOpen ? 'justify-between p-3' : 'justify-center p-2'}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProfileMenuPos({ bottom: window.innerHeight - rect.top + 8, left: rect.left, width: rect.width });
                setProfileMenuOpen(prev => !prev);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0" style={{ overflow: 'hidden' }}>
                  {profile.avatar
                    ? <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (profile.displayName || 'U').trim().split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('')
                  }
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col">
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', maxWidth: 100 }} className="truncate">{profile.displayName.slice(0,14)}{profile.displayName.length>14?'...':''}</span>
                    <span style={{ fontSize: 10, color: 'var(--on-surface-muted)' }}>Free</span>
                  </div>
                )}
              </div>
              {isSidebarOpen && (
                <button style={{
                  padding: '5px 14px', borderRadius: 999,
                  background: 'var(--hover-overlay-2)', border: '1px solid var(--divider)',
                  color: 'var(--on-surface)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-overlay-2)'}
                >
                  Upgrade
                </button>
              )}
            </div>
          ) : isSidebarOpen ? (
            <div className="flex flex-col gap-1">
              {[
                { icon: <Sparkles size={18} />, label: 'See plans and pricing' },
                { icon: <Settings size={18} />, label: 'Settings', action: () => setSettingsOpen(true) },
                { icon: <HelpCircle size={18} />, label: 'Help' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', background: 'transparent', border: 'none',
                    color: 'var(--on-surface)', fontSize: 14, cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit', borderRadius: 12,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: 'var(--on-surface-subtle)' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              
              <div style={{ height: 1, background: 'var(--divider)', margin: '12px 0' }}></div>
              
              <div style={{
                padding: '0 8px', marginTop: 8
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>Get responses tailored to you</h4>
                <p style={{ fontSize: 13, color: 'var(--on-surface-muted)', lineHeight: 1.5, marginBottom: 20 }}>
                  Log in to get answers based on saved chats, plus create images and upload files.
                </p>
                <button
                  onClick={() => setAuthOpen(true)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 999,
                    background: 'white', color: 'black', border: '1px solid #ddd',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Log in
                </button>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => setAuthOpen(true)}
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-lg"
                >
                  <User size={20} />
                </button>
             </div>
          )}
        </div>
      </motion.div>

      {/* Profile Popup Menu - Portal */}
      {profileMenuOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: profileMenuPos.bottom,
            left: profileMenuPos.left,
            width: Math.max(profileMenuPos.width, 260),
            zIndex: 999998,
            background: 'var(--surface-1)',
            borderRadius: '16px',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            border: '1px solid var(--divider)',
          }}
          ref={profileRef}
        >
          {/* User Row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', cursor: 'pointer',
            borderBottom: '1px solid var(--divider)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0, overflow: 'hidden' }}>
                {profile.avatar
                  ? <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (profile.displayName || 'U').trim().split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('')
                }
              </div>
              <div>
                <div style={{ color: 'var(--on-surface)', fontSize: 13, fontWeight: 600 }}>{profile.displayName}</div>
                <div style={{ color: 'var(--on-surface-muted)', fontSize: 11 }}>Free</div>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--on-surface-subtle)' }} />
          </div>

          {/* Menu Items Group 1 */}
          {[
            { icon: <Sparkles size={15} />, label: 'Upgrade plan' },
            { icon: <Palette size={15} />, label: 'Personalization', action: () => { setProfileMenuOpen(false); setSettingsInitialTab('personalization'); setSettingsOpen(true); } },
            { icon: <UserCircle size={15} />, label: 'Profile', action: () => { setProfileMenuOpen(false); setProfileOpen(true); } },
            { icon: <Settings size={15} />, label: 'Settings', action: () => { setProfileMenuOpen(false); setSettingsInitialTab('general'); setSettingsOpen(true); } },
          ].map((item, j) => (
            <button
              key={j}
              onClick={() => item.action ? item.action() : setProfileMenuOpen(false)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 16px', background: 'transparent', border: 'none',
                color: 'var(--on-surface)', fontSize: 13.5, cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--on-surface-subtle)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--divider)', margin: '2px 0' }} />

          {/* Help */}
          <button
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 16px', background: 'transparent', border: 'none',
              color: 'var(--on-surface)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <HelpCircle size={15} style={{ color: 'var(--on-surface-subtle)' }} />
              Help
            </div>
            <ChevronRight size={14} style={{ color: 'var(--on-surface-subtle)' }} />
          </button>

          {/* Log out */}
          <button
            onClick={() => { setProfileMenuOpen(false); setLogoutOpen(true); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 16px', background: 'transparent', border: 'none',
              color: 'var(--on-surface)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
              marginBottom: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={15} style={{ color: 'var(--on-surface-subtle)' }} />
            Log out
          </button>
        </div>,
        document.body
      )}
      {/* Delete Confirmation Modal - Portal to body */}
      {deleteConfirm.open && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)',
          }}
          onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#2a2a2a',
              borderRadius: '18px',
              padding: '28px 28px 22px 28px',
              width: '420px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Title */}
            <h3 style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '14px',
              fontFamily: 'inherit',
            }}>
              Delete chat?
            </h3>

            {/* Body text */}
            <p style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '14.5px',
              lineHeight: 1.55,
              marginBottom: '6px',
            }}>
              This will delete <strong style={{ color: '#fff', fontWeight: 700 }}>{deleteConfirm.name}</strong>.
            </p>

            {/* Subtitle */}
            <p style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '13.5px',
              lineHeight: 1.5,
              marginBottom: '24px',
            }}>
              Visit <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>settings</span> to delete any memories saved during this chat.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                style={{
                  padding: '9px 22px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.13)',
                  color: 'rgba(255,255,255,0.90)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.20)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '9px 22px',
                  borderRadius: '999px',
                  background: '#e53e3e',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#c53030'}
                onMouseLeave={e => e.currentTarget.style.background = '#e53e3e'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {searchModalOpen && <SearchModal onClose={() => setSearchModalOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} initialTab={settingsInitialTab} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      {logoutOpen && <LogoutModal onClose={() => setLogoutOpen(false)} />}

      {/* Floating Recents Card */}
      {isRecentsCardOpen && !isSidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            left: 76,
            top: recentsButtonRef.current?.getBoundingClientRect().top || 100,
            width: 260,
            maxHeight: '70vh',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--divider)',
            borderRadius: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onMouseLeave={() => setIsRecentsCardOpen(false)}
        >
          <div style={{ padding: '16px 16px 10px', fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', borderBottom: '1px solid var(--divider)' }}>
            Recents
          </div>
          <div style={{ overflowY: 'auto', padding: 8 }} className="custom-scrollbar">
            {sortedChats.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--on-surface-subtle)' }}>No recent chats</div>
            ) : (
              sortedChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => {
                    switchChat(chat.id);
                    setIsRecentsCardOpen(false);
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', textAlign: 'left', borderRadius: 8,
                    background: activeChatId === chat.id ? 'var(--hover-overlay)' : 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    transition: '0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                  onMouseLeave={e => { if(activeChatId !== chat.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <MessageSquare size={14} style={{ color: 'var(--on-surface-subtle)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.title}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
