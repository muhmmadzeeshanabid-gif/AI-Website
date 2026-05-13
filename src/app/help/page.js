'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, HelpCircle, MessageCircle, FileText, Settings, Shield, Users, Mail, ExternalLink } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      color: 'var(--on-surface)',
      fontFamily: 'Inter, -apple-system, sans-serif',
      paddingBottom: '80px'
    }}>
      {/* Top Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--divider)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-primary)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={() => router.back()}
            style={{
              padding: '8px 12px', borderRadius: 8, background: 'var(--surface-1)',
              border: '1px solid var(--divider)', color: 'var(--on-surface)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 14, fontWeight: 600
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Help Center</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--on-surface-muted)' }}>Kyra Support</div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        
        {/* Search Section */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>How can we help?</h1>
          <div style={{ 
            maxWidth: 500, margin: '0 auto', position: 'relative',
            background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--divider)',
            display: 'flex', alignItems: 'center', padding: '0 16px'
          }}>
            <Search size={18} style={{ color: 'var(--on-surface-subtle)' }} />
            <input 
              placeholder="Search help articles..."
              style={{
                width: '100%', padding: '14px 12px', background: 'transparent',
                border: 'none', outline: 'none', color: 'var(--on-surface)',
                fontSize: 15, fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: 24 
        }}>
          {helpCategories.map((cat, idx) => (
            <div 
              key={idx}
              style={{
                padding: 24, borderRadius: 16, background: 'var(--bg-primary)',
                border: '1px solid var(--divider)',
                display: 'flex', flexDirection: 'column', gap: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--divider)', paddingBottom: 16 }}>
                <div style={{ color: 'var(--on-surface-subtle)' }}>{cat.icon}</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{cat.title}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {cat.items.map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.q}</div>
                    <div style={{ fontSize: 14, color: 'var(--on-surface-muted)', lineHeight: 1.5 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Footer */}
        <div style={{ 
          marginTop: 64, padding: 40, borderRadius: 20, 
          background: 'var(--surface-1)', border: '1px solid var(--divider)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Didn't find what you need?</h3>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: 14, marginBottom: 24 }}>Our team is available to help with any specific issues.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={{
              padding: '12px 24px', borderRadius: 999, background: 'var(--on-surface)',
              color: 'var(--bg-primary)', border: 'none', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <MessageCircle size={16} />
              Live Support
            </button>
            <button style={{
              padding: '12px 24px', borderRadius: 999, background: 'transparent',
              border: '1px solid var(--divider)', color: 'var(--on-surface)', 
              fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Mail size={16} />
              Email Us
            </button>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: 40, opacity: 0.5, fontSize: 12 }}>
        © 2026 Kyra Advanced Intelligence
      </footer>
    </div>
  );
}
