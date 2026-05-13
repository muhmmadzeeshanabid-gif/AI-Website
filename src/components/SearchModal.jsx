'use client';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { Search, X, MessageSquare, SquarePen, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const SearchModal = ({ onClose }) => {
  const router = useRouter();
  const { chats, switchChat, setMessages, user } = useAppContext();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.messages && chat.messages.length > 0 && chat.title.toLowerCase().includes(query.toLowerCase())
  );

  // Grouping logic (simplified)
  const groupChats = (list) => {
    const today = [];
    const yesterday = [];
    const earlier = [];
    
    const now = new Date();
    list.forEach(chat => {
      const chatDate = new Date(chat.timestamp || Date.now());
      const diffDays = Math.floor((now - chatDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) today.push(chat);
      else if (diffDays === 1) yesterday.push(chat);
      else earlier.push(chat);
    });
    
    return { today, yesterday, earlier };
  };

  const groups = groupChats(filteredChats);

  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.2)', // Much lighter overlay
        }}
      />
      
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="shadow-modal"
        style={{
          position: 'relative', // Ensures it stays above absolute backdrop
          width: 640, maxWidth: '95vw',
          background: 'var(--surface-1)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: 'none',
          border: '1px solid var(--divider)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '80vh',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--divider)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <Search size={20} style={{ color: 'var(--on-surface-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search chats..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--on-surface)', fontSize: 17, fontFamily: 'inherit',
            }}
          />
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--on-surface-muted)',
              cursor: 'pointer', padding: 4, borderRadius: '50%',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Container */}
        <div 
          className="custom-scrollbar"
          style={{ flex: 1, overflowY: 'auto' }}
        >
          {/* Internal Padding Wrapper to keep scrollbar at edges */}
          <div style={{ padding: '12px 0' }}>
            {/* New Chat Option */}
            {!query && (
              <button
                onClick={() => { router.push('/'); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 24px', background: 'transparent', border: 'none',
                  color: 'var(--on-surface)', cursor: 'pointer', transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <SquarePen size={18} style={{ color: 'var(--on-surface-muted)' }} />
                <span style={{ fontSize: 15, fontWeight: 500 }}>New chat</span>
              </button>
            )}

            {/* Grouped Results */}
            <div style={{ marginTop: query ? 0 : 8 }}>
              {[
                { label: 'Today', items: groups.today },
                { label: 'Yesterday', items: groups.yesterday },
                { label: 'Earlier', items: groups.earlier },
              ].map(group => group.items.length > 0 && (
                <div key={group.label} style={{ marginBottom: 12 }}>
                  <div style={{
                    padding: '4px 10px', fontSize: 10, fontWeight: 800,
                    color: 'var(--bg-primary)', background: 'var(--on-surface)',
                    borderRadius: 4, textTransform: 'uppercase',
                    letterSpacing: '0.08em', width: 'fit-content',
                    margin: '16px 24px 8px',
                  }}>
                    {group.label}
                  </div>
                  {group.items.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => { 
                        switchChat(chat.id);
                        router.push(`/c/${chat.id}`); 
                      }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                        padding: '12px 24px', background: 'transparent', border: 'none',
                        color: 'var(--on-surface)', cursor: 'pointer', transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <MessageSquare size={18} style={{ color: 'var(--on-surface-muted)' }} />
                      <span className="truncate" style={{ fontSize: 15 }}>{chat.title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {filteredChats.length === 0 && query && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--on-surface-muted)' }}>
                No chats found for "{query}"
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default SearchModal;
