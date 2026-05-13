'use client';
import React from 'react';
import ReactDOM from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { MessageSquare, Plus, Settings, LogOut, User, Menu, X, ChevronDown, ChevronUp, Search, Bot, PanelLeftClose, PanelLeftOpen, Edit, SquarePen, MoreHorizontal, Share2, Users, Pencil, Pin, Archive, Trash2, Sparkles, Palette, UserCircle, HelpCircle, ChevronRight, Lock, Image, Telescope, LayoutGrid, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';
import ProfileModal from './ProfileModal';
import LogoutModal from './LogoutModal';
import SearchModal from './SearchModal';


import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

const Sidebar = () => {
  const router = useRouter();
  const { 
    theme, resolvedTheme, isSidebarOpen, setIsSidebarOpen, setMessages, chats, setChats, 
    deleteChat, switchChat, createNewChat, activeChatId, setActiveChatId, profile, user, 
    setAuthOpen, isAuthLoading, showLoggedIn, archivedChats, archiveChat, unarchiveChat, 
    archivePassword, setArchivePassword, closeArchivedChat, appView, setAppView, 
    isShareModalOpen, setIsShareModalOpen, shareChatId, setShareChatId,
    isGroupChatModalOpen, setIsGroupChatModalOpen,
    isUpgradeModalOpen, setIsUpgradeModalOpen,
    isGroupLinkModalOpen, setIsGroupLinkModalOpen, groupLinkChatId, setGroupLinkChatId
  } = useAppContext();
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
  const [settingsInitialTab, setSettingsInitialTab] = React.useState('general');
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
    if (!chat) return;
    setOpenMenuIndex(null);
    setDeleteConfirm({ open: true, id: chat.id, name: chat.title });
  };

  const confirmDelete = () => {
    deleteChat(deleteConfirm.id);
    setDeleteConfirm({ open: false, id: null, name: '' });
  };


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
      return [...updated.filter(c => c.pinned), ...updated.filter(c => !c.pinned)];
    });
    setOpenMenuIndex(null);
  };

  const displayChats = (chats || []).filter(c => c && c.messages && Array.isArray(c.messages) && c.messages.length > 0);
  const sortedChats = [...displayChats.filter(c => c.pinned), ...displayChats.filter(c => !c.pinned)];

  return (
    <>
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ 
          width: isMobile ? (isSidebarOpen ? 'min(80vw, 300px)' : '0px') : (isSidebarOpen ? '280px' : '68px'),
          x: isMobile && !isSidebarOpen ? '-100%' : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className={`sidebar-root ${isSidebarOpen ? 'is-open' : ''} relative h-screen bg-sidebar-bg border-r border-divider flex flex-col z-40 shadow-2xl ${isMobile ? 'fixed left-0 top-0 h-full z-[100] border-none' : ''}`}
        style={{
          boxShadow: isMobile && isSidebarOpen ? '0 0 50px rgba(0,0,0,0.5)' : 'none',
          pointerEvents: isMobile && !isSidebarOpen ? 'none' : 'auto',
          overflow: 'visible'
        }}
      >
        {/* Top Header / Logo Area */}
        <div className={`px-3 py-4 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`} style={{ minHeight: 56 }}>
          <div className="flex items-center gap-3 w-full justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group/logo">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              className={`h-10 rounded-xl flex items-center ${isSidebarOpen ? 'justify-start w-auto' : 'justify-center w-10'} transition-all duration-200 ${!isSidebarOpen ? 'hover:bg-white/10 cursor-pointer' : ''}`}
              style={{ paddingLeft: isSidebarOpen ? '12px' : '0px' }}
            >
              {!isSidebarOpen ? (
                <div className="relative w-10 h-10 flex items-center justify-center">
                  {!isLogoHovered ? (
                    <div style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 10, 
                      background: isLogoHovered ? 'var(--hover-overlay)' : 'transparent', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden',
                      transition: 'background 0.2s ease'
                    }}>
                      <img 
                        src="/logo.png" 
                        alt="Kyra" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          mixBlendMode: resolvedTheme === 'dark' ? 'screen' : 'multiply',
                          filter: resolvedTheme === 'dark' ? 'none' : 'invert(1)'
                        }} 
                      />
                    </div>
                  ) : (
                    <PanelLeftOpen size={24} style={{ color: 'var(--on-surface)' }} />
                  )
                }
                  {isLogoHovered && (
                    <div 
                      style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                      className="tooltip-label absolute z-50"
                    >
                      Open sidebar
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 10, 
                  background: isLogoHovered ? 'var(--hover-overlay)' : 'transparent', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0, 
                  overflow: 'hidden',
                  transition: 'background 0.2s ease'
                }}>
                  <img 
                    src="/logo.png" 
                    alt="Kyra" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      mixBlendMode: resolvedTheme === 'dark' ? 'screen' : 'multiply',
                      filter: resolvedTheme === 'dark' ? 'none' : 'invert(1)'
                    }} 
                  />
                </div>
              )}
            </button>
          </div>
          </div>
          {isSidebarOpen && isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg text-on-surface"
            >
              <X size={20} />
            </button>
          )}

          {isSidebarOpen && !isMobile && (
            <div className="relative group/tooltip">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                style={{ padding: 8, borderRadius: 8, color: 'var(--on-surface)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <PanelLeftClose size={20} />
              </button>
              <div 
                style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                className="tooltip-label absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50"
              >
                Close sidebar
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Action Buttons */}
        <div className={`px-3 mt-4 ${!isSidebarOpen ? 'flex flex-col items-center gap-1' : 'flex flex-col gap-1'}`}>
          <div className="relative group/tooltip w-full flex justify-center">
            <button 
              onClick={() => { 
                setActiveChatId(null); 
                setMessages([]); 
                closeArchivedChat(); 
                setAppView('chat'); 
                router.push('/'); 
              }}
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
                <SquarePen size={20} style={{ color: 'var(--on-surface)' }} />
                {isSidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>New chat</span>}
              </div>
            </button>
            {!isSidebarOpen && (
              <div 
                style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                className="tooltip-label absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50"
              >
                New chat
              </div>
            )}
          </div>
          
          <div className="relative group/tooltip w-full flex justify-center">
            <button
              onClick={() => { router.push('/search'); }}
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
              <Search size={20} style={{ color: 'var(--on-surface)' }} />
              {isSidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>Search chats</span>}
            </button>
            {!isSidebarOpen && (
              <div 
                style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                className="tooltip-label absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50"
              >
                Search chats
              </div>
            )}
          </div>
          
          {/* More Menu */}
            <div className="relative group/tooltip w-full flex justify-center">
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
                <MoreHorizontal size={20} style={{ color: 'var(--on-surface)' }} />
                {isSidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>More</span>}
              </button>
              {!isSidebarOpen && (
                <div 
                  style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                  className="tooltip-label absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50"
                >
                  More
                </div>
              )}
            </div>
            
            {/* Hover Menu Card - Fixed outside sidebar */}
            <AnimatePresence>
              {isMoreMenuOpen && (
                <motion.div 
                  ref={moreMenuRef}
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed z-[9999] shadow-2xl"
                  style={{
                    top: moreMenuPos.top,
                    left: moreMenuPos.left,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--divider)',
                    borderRadius: 20,
                    minWidth: 220,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button 
                    onClick={() => { setAppView('images'); setIsMoreMenuOpen(false); }}
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
                     <Image size={16} style={{ color: 'var(--on-surface-muted)' }} strokeWidth={1.5} />
                     <span>Images</span>
                  </button>
                  <button 
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
                     <Telescope size={16} style={{ color: 'var(--on-surface-muted)' }} strokeWidth={1.5} />
                     <span>Deep research</span>
                  </button>
                  <button 
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
                     <LayoutGrid size={16} style={{ color: 'var(--on-surface-muted)' }} strokeWidth={1.5} />
                     <span>Apps</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          
          {!isSidebarOpen && (
            <div className="relative group/tooltip w-full flex justify-center" ref={recentsButtonRef}>
              <button 
                onClick={() => setIsRecentsCardOpen(!isRecentsCardOpen)}
                style={{
                  padding: 10, borderRadius: 12, background: isRecentsCardOpen ? 'var(--hover-overlay)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s', color: 'var(--on-surface)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                onMouseLeave={e => { if(!isRecentsCardOpen) { e.currentTarget.style.background = 'transparent'; } }}
              >
                <MessageSquare size={20} />
              </button>
              {!isRecentsCardOpen && (
                <div 
                  style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                  className="tooltip-label absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50"
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
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', textTransform: 'none', letterSpacing: '0.04em' }}>Recents</span>
                <ChevronDown size={15} className="transition-all duration-200" style={{ color: 'var(--on-surface)', opacity: isRecentHeaderHovered ? 1 : 0, transform: isRecentOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
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
                        className="w-full flex items-center justify-between rounded-xl text-left transition-all duration-150"
                        style={{
                          paddingTop: '11px',
                          paddingBottom: '11px',
                          paddingLeft: '14px',
                          paddingRight: '12px',
                          marginBottom: '3px',
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
                          <div 
                            className="flex-1 flex items-center gap-3 overflow-hidden"
                            onClick={() => { router.push(`/c/${chat.id}`); closeArchivedChat(); }}
                          >
                            <span
                              className="truncate text-[14.5px] block text-left leading-snug flex-1 cursor-pointer"
                              style={{ color: 'var(--on-surface)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              {chat.pinned && <Pin size={11} style={{ color: 'var(--on-surface-subtle)', flexShrink: 0 }} />}
                              <span className="truncate">{chat.title}</span>
                            </span>
                          </div>
                        )}
                        <span
                          className="transition-all ml-2 shrink-0 cursor-pointer flex items-center justify-center"
                          style={{ 
                            width: '28px', height: '28px',
                            opacity: (chat.isGroup || hoveredChat === i || openMenuIndex === i) ? 1 : 0 
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const menuHeight = 220;
                            
                            if (isMobile) {
                              const leftPos = isSidebarOpen ? 16 : 60;
                              const width = isSidebarOpen ? window.innerWidth - 32 : 220;
                              setMenuPos({ 
                                top: spaceBelow < menuHeight ? 'auto' : rect.top,
                                bottom: spaceBelow < menuHeight ? window.innerHeight - rect.bottom : 'auto',
                                left: leftPos,
                                width: width,
                                isBottom: spaceBelow < menuHeight 
                              });
                            } else {
                              if (spaceBelow < menuHeight) {
                                setMenuPos({ bottom: window.innerHeight - rect.bottom, left: rect.right + 8, isBottom: true });
                              } else {
                                setMenuPos({ top: rect.top, left: rect.right + 8, isBottom: false });
                              }
                            }
                            setOpenMenuIndex(openMenuIndex === i ? null : i);
                          }}
                        >
                          {chat.isGroup && hoveredChat !== i && openMenuIndex !== i ? (
                            <div style={{ 
                              width: '24px', height: '24px', borderRadius: '50%', 
                              background: 'var(--hover-overlay-2)', overflow: 'hidden',
                              border: '1px solid var(--divider)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {profile?.avatar ? (
                                <img src={profile.avatar} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <User size={12} style={{ color: 'var(--on-surface-subtle)' }} />
                              )}
                            </div>
                          ) : (
                            <MoreHorizontal size={15} style={{ color: 'var(--on-surface)' }} />
                          )}
                        </span>
                      </div>
                      
                      <AnimatePresence>
                        {openMenuIndex === i && (
                          <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, y: menuPos.isBottom ? 4 : -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: menuPos.isBottom ? 4 : -4 }}
                            transition={{ duration: 0.12 }}
                            className="fixed z-[999999] shadow-2xl"
                            style={{
                              background: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
                              border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              borderRadius: '20px',
                              padding: '6px',
                              minWidth: '220px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                              top: menuPos.isBottom ? 'auto' : menuPos.top,
                              bottom: menuPos.isBottom ? menuPos.bottom : 'auto',
                              left: menuPos.left,
                              width: isMobile && isSidebarOpen ? 'calc(100vw - 32px)' : 'auto'
                            }}
                          >
                            {(chat.isGroup ? [
                              { icon: <Pencil size={16} />, label: 'Rename', action: () => handleRename(i) },
                              { icon: <Pin size={16} />, label: chat.pinned ? 'Unpin chat' : 'Pin chat', action: () => handlePin(chat) },
                              { icon: <Link size={16} />, label: isMobile ? 'Group link' : 'Add people via link', action: () => { setGroupLinkChatId(chat.id); setIsGroupLinkModalOpen(true); setOpenMenuIndex(null); } },
                            ] : [
                              { icon: <Share2 size={16} />, label: 'Share', action: () => { setShareChatId(chat.id); setIsShareModalOpen(true); setOpenMenuIndex(null); } },
                              { icon: <Users size={16} />, label: 'Start a group chat', action: () => { setShareChatId(chat.id); setIsGroupChatModalOpen(true); setOpenMenuIndex(null); } },
                              { icon: <Pencil size={16} />, label: 'Rename', action: () => handleRename(i) },
                              { icon: <Pin size={16} />, label: chat.pinned ? 'Unpin chat' : 'Pin chat', action: () => handlePin(chat) },
                              { icon: <Archive size={16} />, label: 'Archive', action: () => { archiveChat(chat.id); setOpenMenuIndex(null); } },
                            ]).map((item, j) => (
                              <button
                                key={j}
                                onClick={(e) => { e.stopPropagation(); item.action(); }}
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
                                <span style={{ color: 'var(--on-surface-muted)', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                                {item.label}
                              </button>
                            ))}
                            <div style={{ height: 1, background: 'var(--divider)', margin: '2px 4px' }} />
                             <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(chat); }}
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
                                <Trash2 size={16} style={{ color: '#ef4444' }} />
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
        <div className="px-3 mt-auto mb-2" ref={profileRef}>
          {mounted && showLoggedIn ? (
            <div
              style={{ display: 'flex', alignItems: 'center', borderRadius: 20, transition: 'background 0.15s', cursor: 'pointer' }}
              className={isSidebarOpen ? 'justify-between p-3' : 'relative group/tooltip justify-center p-2.5'}
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
                    ? <img src={profile.avatar} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (profile.displayName || 'U').trim().split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('')
                  }
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col">
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', maxWidth: 100 }} className="truncate">{(profile?.displayName || 'User').slice(0,14)}{(profile?.displayName || 'User').length>14?'...':''}</span>
                    <div style={{ 
                      padding: '2px 8px', fontSize: 9, fontWeight: 800,
                      color: 'var(--bg-primary)', background: 'var(--on-surface)',
                      borderRadius: 3, textTransform: 'uppercase',
                      letterSpacing: '0.06em', width: 'fit-content',
                      marginTop: 2
                    }}>Free</div>
                  </div>
                )}
              </div>
                {isSidebarOpen && (
                  <button 
                    onClick={() => { router.push('/upgrade'); }}
                    style={{
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
              {!isSidebarOpen && (
                <div 
                  style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                  className="tooltip-label absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50"
                >
                  {profile?.displayName || 'Profile'}
                </div>
              )}
            </div>
          ) : isSidebarOpen ? (
            <div className="flex flex-col gap-1">
              {[
                { icon: <Sparkles size={18} />, label: 'See plans and pricing', action: () => { router.push('/upgrade'); } },
                { icon: <Settings size={18} />, label: 'Settings', action: () => router.push('/settings') },
                { icon: <HelpCircle size={18} />, label: 'Help', action: () => router.push('/help') },
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
                  <span style={{ color: 'var(--on-surface-muted)' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              
              <div style={{ padding: '8px 12px 16px' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>Get responses tailored to you</h4>
                <p style={{ fontSize: 13, color: 'var(--on-surface-muted)', lineHeight: 1.5, marginBottom: 20 }}>
                  Log in to get answers based on saved chats, plus create images and upload files.
                </p>
                <button
                  onClick={() => setAuthOpen(true)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 999,
                    background: 'var(--on-surface)', color: 'var(--bg-primary)', border: '1px solid var(--divider)',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Log in
                </button>
              </div>
            </div>
          ) : (
                 <div className="relative group/tooltip flex flex-col items-center gap-4">
                    <button 
                      onClick={() => setAuthOpen(true)}
                      className="w-10 h-10 rounded-xl bg-hover-overlay flex items-center justify-center text-on-surface shadow-sm"
                    >
                      <User size={20} />
                    </button>
                    <div 
                      style={{ left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)' }}
                      className="tooltip-label absolute opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50"
                    >
                      Log in
                    </div>
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
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 60px)',
            border: '1px solid var(--divider)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
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
                  ? <img src={profile.avatar} alt="avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            { icon: <Sparkles size={15} />, label: 'Upgrade plan', action: () => { setProfileMenuOpen(false); router.push('/upgrade'); } },
            { icon: <Palette size={15} />, label: 'Personalization', action: () => { setProfileMenuOpen(false); router.push('/settings?tab=personalization'); } },
            { icon: <UserCircle size={15} />, label: 'Profile', action: () => { setProfileMenuOpen(false); router.push('/profile'); } },
            { icon: <Settings size={15} />, label: 'Settings', action: () => { setProfileMenuOpen(false); router.push('/settings?tab=general'); } },
          ].map((item, j) => (
            <button
              key={j}
              onClick={() => item.action ? item.action() : setProfileMenuOpen(false)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 16px', background: 'transparent', border: 'none',
                color: 'var(--on-surface)', fontSize: 13.5, cursor: 'pointer',
                textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--on-surface-subtle)', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--divider)', margin: '4px 0' }} />

          {/* Help */}
          <NextLink
            href="/help"
            onClick={() => setProfileMenuOpen(false)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 16px', background: 'transparent', border: 'none',
              color: 'var(--on-surface)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
              textDecoration: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <HelpCircle size={15} style={{ color: 'var(--on-surface-subtle)' }} />
              Help
            </div>
            <ChevronRight size={14} style={{ color: 'var(--on-surface-subtle)' }} />
          </NextLink>

          {/* Log out */}
          <button
            onClick={() => { setProfileMenuOpen(false); router.push('/logout'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 16px', background: 'transparent', border: 'none',
              color: 'var(--on-surface)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
              marginBottom: 4, transition: 'background 0.15s'
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
            zIndex: 99999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface-1)',
              borderRadius: '24px',
              border: '1px solid var(--divider)',
              padding: '28px 28px 22px 28px',
              width: '420px',
            }}
            className="shadow-modal"
          >
            {/* Title */}
            <h3 style={{
              color: 'var(--on-surface)',
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '14px',
              fontFamily: 'inherit',
            }}>
              Delete chat?
            </h3>

            {/* Body text */}
            <p style={{
              color: 'var(--on-surface-muted)',
              fontSize: '14.5px',
              lineHeight: 1.55,
              marginBottom: '6px',
            }}>
              This will delete <strong style={{ color: 'var(--on-surface)', fontWeight: 700 }}>{deleteConfirm.name}</strong>.
            </p>

            <p style={{
              color: 'var(--on-surface-subtle)',
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
                  background: 'var(--hover-overlay-2)',
                  color: 'var(--on-surface-muted)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--divider)',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-overlay-2)'}
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
            borderRadius: 20,
            boxShadow: 'none',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '6px',
          }}
          className="shadow-premium"
          onMouseLeave={() => setIsRecentsCardOpen(false)}
        >
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--divider)' }}>
            <div style={{ 
              padding: '4px 10px', fontSize: 10, fontWeight: 800,
              color: 'var(--bg-primary)', background: 'var(--on-surface)',
              borderRadius: 4, textTransform: 'uppercase',
              letterSpacing: '0.08em', width: 'fit-content'
            }}>Recents</div>
          </div>
          <div style={{ overflowY: 'auto', padding: '4px' }} className="custom-scrollbar">
            {sortedChats.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--on-surface-subtle)' }}>No recent chats</div>
            ) : (
              sortedChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => {
                    switchChat(chat.id);
                    setIsRecentsCardOpen(false);
                    setAppView('chat');
                  }}
                  style={{
                    width: '100%', padding: '10px 14px', textAlign: 'left', borderRadius: 12,
                    background: activeChatId === chat.id ? 'var(--hover-overlay)' : 'transparent',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
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
