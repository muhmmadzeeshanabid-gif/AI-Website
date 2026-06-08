'use client';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { X, Smartphone, Apple, Mail } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const { login, resolvedTheme } = useAppContext();
  const [email, setEmail] = useState('');

  if (typeof document === 'undefined') return null;

  // CSS vars
  const isDark = resolvedTheme === 'dark';
  const text = 'var(--on-surface)';
  const muted = 'var(--on-surface-muted)';
  const border = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const hover = 'var(--hover-overlay)';

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',

      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxWidth: '95vw',
          background: 'var(--surface-1)',
          borderRadius: 28,
          padding: '48px 40px 40px',
          boxShadow: 'none',
          border: `1px solid ${border}`,
          position: 'relative',
          textAlign: 'center',
          transition: 'all 0.3s ease',
        }}
        className="shadow-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 24, right: 24,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: muted,
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 32, fontWeight: 700, color: text, marginBottom: 12 }}>
          Log in or sign up
        </h2>
        <p style={{ fontSize: 16, color: muted, marginBottom: 32, lineHeight: 1.5 }}>
          You'll get smarter responses and can upload files, images, and more.
        </p>


        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button
            onClick={async () => {
              try {
                await login();
                onClose();
              } catch (e) { }
            }}
            style={{
              width: '100%', padding: '14px', borderRadius: 999,
              background: 'transparent', border: `1px solid ${border}`,
              color: text, fontSize: 16, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = hover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            style={{
              width: '100%', padding: '14px', borderRadius: 999,
              background: 'transparent', border: `1px solid ${border}`,
              color: text, fontSize: 16, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = hover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Apple size={18} fill="currentColor" />
            Continue with Apple
          </button>

          <button
            style={{
              width: '100%', padding: '14px', borderRadius: 999,
              background: 'transparent', border: `1px solid ${border}`,
              color: text, fontSize: 16, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = hover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Smartphone size={18} />
            Continue with phone
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: border }}></div>
          <span style={{ fontSize: 12, color: muted, fontWeight: 700 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: border }}></div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); login(); onClose(); }}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '16px 20px', borderRadius: 16,
                background: 'transparent', border: `2px solid ${border}`,
                color: text, fontSize: 16, fontFamily: 'inherit',
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
              onBlur={e => e.currentTarget.style.borderColor = border}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%', padding: '15px', borderRadius: 999,
              background: 'var(--on-surface)', color: 'var(--bg-primary)',
              fontSize: 16, fontWeight: 800, cursor: 'pointer',
              border: 'none', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Continue
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}




