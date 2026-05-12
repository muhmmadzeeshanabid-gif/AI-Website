'use client';
import React from 'react';
import ReactDOM from 'react-dom';
import { useAppContext } from '@/context/AppContext';

export default function LogoutModal({ onClose }) {
  const { profile, logout } = useAppContext();

  if (typeof document === 'undefined') return null;

  // CSS vars shortcuts
  const bg     = 'var(--bg-primary)';
  const text   = 'var(--on-surface)';
  const muted  = 'var(--on-surface-muted)';
  const border = 'var(--divider)';
  const hover  = 'var(--hover-overlay)';

  const handleLogout = () => {
    logout();
    onClose();
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 380, maxWidth: '90vw',
          background: 'var(--surface-1)',
          borderRadius: 24,
          padding: '40px 32px 32px',
          boxShadow: 'none',
          border: `1px solid ${border}`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        className="shadow-modal"
      >
        {/* Title */}
        <h2 style={{ 
          fontSize: 24, 
          fontWeight: 600, 
          color: text, 
          marginBottom: 16,
          lineHeight: 1.2,
          letterSpacing: '-0.5px'
        }}>
          Are you sure you want to log out?
        </h2>

        {/* Description */}
        <p style={{ 
          fontSize: 16, 
          color: muted, 
          marginBottom: 32,
          lineHeight: 1.5,
          maxWidth: '85%'
        }}>
          Log out of Kyra as <span style={{ color: text }}>{profile.email}</span>?
        </p>

        {/* Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '14px', 
              borderRadius: 999,
              background: 'var(--on-surface)', 
              border: 'none',
              color: 'var(--bg-primary)', 
              fontSize: 16, 
              fontWeight: 700, 
              cursor: 'pointer', 
              fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Log out
          </button>
          
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px', 
              borderRadius: 999,
              background: 'transparent', 
              border: `1px solid ${border}`,
              color: text, 
              fontSize: 16, 
              fontWeight: 600, 
              cursor: 'pointer', 
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = hover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
