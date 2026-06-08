'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Settings, 
  Shield, 
  Users, 
  Mail
} from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();
  const { resolvedTheme } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Help & Support | Kyra';
  }, []);

  const helpCategories = [
    {
      title: 'Getting Started',
      icon: <HelpCircle size={20} />,
      items: [
        { q: 'What is Kyra?', a: 'Kyra is a next-generation AI platform for creative and technical tasks.' },
        { q: 'How to start a chat?', a: 'Just type in the input box at the bottom of any chat window.' },
        { q: 'Using Voice', a: 'Click the microphone icon to record and send voice messages instantly.' }
      ]
    },
    {
      title: 'Group Chats',
      icon: <Users size={20} />,
      items: [
        { q: 'Invite Link', a: 'Use the "Invite with link" button to share access to your group.' },
        { q: 'Managing Members', a: 'Click on the group name in the header to manage settings.' },
        { q: 'Group Privacy', a: 'Conversations are siloed to the group and not shared with personal bots.' }
      ]
    },
    {
      title: 'Security',
      icon: <Shield size={20} />,
      items: [
        { q: 'Data Encryption', a: 'All communications are protected with enterprise-grade encryption.' },
        { q: 'Delete Account', a: 'You can permanently remove your data from the settings menu.' },
        { q: 'Privacy Policy', a: 'We value your privacy and never sell your personal conversations.' }
      ]
    },
    {
      title: 'System & UI',
      icon: <Settings size={20} />,
      items: [
        { q: 'Dark Mode', a: 'Kyra automatically follows your system preference for light or dark mode.' },
        { q: 'Settings', a: 'Access settings via the profile menu at the bottom of the sidebar.' },
        { q: 'Shortcuts', a: 'Press Ctrl+K to quickly search through your recent conversations.' }
      ]
    }
  ];

  const popularTopics = [
    { label: 'Voice Messages', query: 'Voice' },
    { label: 'Group Privacy', query: 'Privacy' },
    { label: 'Dark Mode', query: 'Dark Mode' },
    { label: 'Delete Account', query: 'Delete' }
  ];

  const getCategoryStyles = (catIdx) => {
    // Symmetrical gradient theme:
    // Card 1 and Card 4 (indices 0 and 3) are Indigo
    // Card 2 and Card 3 (indices 1 and 2) are Emerald
    const isIndigo = catIdx === 0 || catIdx === 3;

    if (isIndigo) {
      return {
        gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        cardGradient: 'linear-gradient(135deg, var(--surface-1) 40%, rgba(99, 102, 241, 0.08) 100%)',
        shadow: 'rgba(99, 102, 241, 0.18)',
        accentColor: '#6366f1',
        bgTint: 'rgba(99, 102, 241, 0.04)'
      };
    } else {
      return {
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        cardGradient: 'linear-gradient(135deg, var(--surface-1) 40%, rgba(16, 185, 129, 0.08) 100%)',
        shadow: 'rgba(16, 185, 129, 0.18)',
        accentColor: '#10b981',
        bgTint: 'rgba(16, 185, 129, 0.04)'
      };
    }
  };

  const handleTopicClick = (query) => {
    setSearchQuery(query);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Filter categories and FAQ items based on search query
  const filteredCategories = helpCategories.map((cat, catIdx) => {
    const matchingItems = cat.items.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      items: matchingItems,
      catIdx
    };
  }).filter(cat => cat.items.length > 0);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      color: 'var(--on-surface)',
      fontFamily: 'Inter, -apple-system, sans-serif',
      paddingBottom: '80px',
      overflowX: 'hidden'
    }}>
      {/* Top Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            style={{
              padding: '8px 16px', 
              borderRadius: 10, 
              background: 'var(--surface-1)',
              border: '1px solid var(--border-color)', 
              color: 'var(--on-surface)',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              fontSize: 14, 
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              transition: 'border-color 0.2s ease, background 0.2s ease'
            }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Help Center</div>
        </div>

        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            width: 28, 
            height: 28, 
            borderRadius: 8, 
            background: 'var(--surface-2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
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
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--on-surface)' }}>
            Kyra Support
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        
        {/* Search Section */}
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              marginBottom: 16, 
              letterSpacing: '-0.02em',
              fontFamily: 'Outfit, sans-serif',
              background: 'linear-gradient(135deg, var(--on-surface) 30%, var(--accent-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            How can we help?
          </motion.h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 28, maxWidth: 480, margin: '0 auto 24px' }}>
            Find answers to frequently asked questions or explore user guides for all features.
          </p>

          <div style={{ 
            maxWidth: 540, 
            margin: '0 auto', 
            position: 'relative',
            background: 'var(--surface-1)', 
            borderRadius: 14, 
            border: isSearchFocused ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
            boxShadow: isSearchFocused ? '0 0 0 3px rgba(99, 102, 241, 0.12), var(--shadow-md)' : 'var(--shadow-sm)',
            display: 'flex', 
            alignItems: 'center', 
            padding: '0 18px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <Search size={18} style={{ 
              color: isSearchFocused ? 'var(--accent-color)' : 'var(--on-surface-subtle)',
              transition: 'color 0.2s ease'
            }} />
            <input 
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search help articles..."
              style={{
                width: '100%', 
                padding: '16px 12px', 
                background: 'transparent',
                border: 'none', 
                outline: 'none', 
                color: 'var(--on-surface)',
                fontSize: 15, 
                fontFamily: 'inherit'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => handleTopicClick('')}
                style={{ 
                  fontSize: 12, 
                  background: 'var(--surface-2)', 
                  border: 'none',
                  color: 'var(--text-secondary)',
                  padding: '4px 8px', 
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Popular Topics Pills */}
          <div style={{ 
            marginTop: 18, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            gap: 10 
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)', marginRight: 4 }}>Popular:</span>
            {popularTopics.map((topic, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTopicClick(topic.query)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 20,
                  background: searchQuery === topic.query ? 'var(--accent-color)' : 'var(--surface-1)',
                  color: searchQuery === topic.query ? '#ffffff' : 'var(--text-secondary)',
                  border: searchQuery === topic.query ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease'
                }}
              >
                {topic.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
          gap: 28 
        }}>
          {filteredCategories.map((cat) => {
            const styles = getCategoryStyles(cat.catIdx);
            return (
              <motion.div 
                layout
                key={cat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '28px 28px 32px', 
                  borderRadius: 22, 
                  background: styles.cardGradient,
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                {/* Decorative background accent blob */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '120px',
                  height: '120px',
                  background: styles.bgTint,
                  borderRadius: '0 0 0 120px',
                  filter: 'blur(12px)',
                  pointerEvents: 'none'
                }} />

                {/* Card Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 14, 
                  borderBottom: '1px solid var(--border-color)', 
                  paddingBottom: 18 
                }}>
                  <div style={{ 
                    background: styles.gradient,
                    borderRadius: 12,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: `0 4px 12px ${styles.shadow}`
                  }}>
                    {cat.icon}
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                    {cat.title}
                  </h2>
                </div>

                {/* FAQ List (Clean Static style, no dots) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {cat.items.map((item, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}
                    >
                      <div style={{ 
                        fontSize: '15px', 
                        fontWeight: 700, 
                        color: 'var(--on-surface)',
                        lineHeight: 1.4
                      }}>
                        {item.q}
                      </div>
                      
                      <div style={{ 
                        fontSize: '13.5px', 
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.6
                      }}>
                        {item.a}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredCategories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              textAlign: 'center', 
              padding: '64px 24px', 
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-1)',
              borderRadius: 20,
              maxWidth: 500,
              margin: '32px auto 0'
            }}
          >
            <Search size={40} style={{ margin: '0 auto 16px', opacity: 0.4, color: 'var(--accent-color)' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--on-surface)' }}>No results found</h3>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>We couldn't find any articles matching "{searchQuery}". Try using different keywords.</p>
          </motion.div>
        )}

        {/* Contact Footer Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ 
            marginTop: 64, 
            padding: '48px 32px', 
            borderRadius: 24, 
            background: 'var(--surface-1)', 
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-premium)'
          }}
        >
          {/* Radial ambient glow in bottom card */}
          <div style={{
            position: 'absolute',
            bottom: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 70%)',
            pointerEvents: 'none'
          }} />

          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>
            Didn't find what you need?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14.5, marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
            Our support experts are available to help resolve any issues or answer specific questions.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '14px 28px', 
                borderRadius: 999, 
                background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)',
                color: '#ffffff', 
                fontWeight: 700, 
                fontSize: 14,
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
                border: 'none'
              }}
            >
              <MessageCircle size={16} />
              Live Support
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02, background: 'var(--surface-2)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '14px 28px', 
                borderRadius: 999, 
                background: 'var(--surface-1)',
                border: '1px solid var(--border-color)', 
                color: 'var(--on-surface)', 
                fontWeight: 700, 
                fontSize: 14, 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                boxShadow: 'var(--shadow-sm)',
                transition: 'background 0.2s ease, border-color 0.2s ease'
              }}
            >
              <Mail size={16} />
              Email Us
            </motion.button>
          </div>
        </motion.div>
      </main>

      <footer style={{ textAlign: 'center', padding: '40px 24px 0', opacity: 0.5, fontSize: 12, borderTop: '1px solid var(--border-color)', maxWidth: 1100, margin: '0 auto' }}>
        © 2026 Kyra Advanced Intelligence. All rights reserved.
      </footer>
    </div>
  );
}
