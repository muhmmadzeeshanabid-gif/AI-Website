'use client';
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { Camera, X } from 'lucide-react';

export default function ProfileModal({ onClose }) {
  const { profile, setProfile } = useAppContext();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername]       = useState(profile.username);
  const [avatar, setAvatar]           = useState(profile.avatar); // base64 or null
  const [preview, setPreview]         = useState(profile.avatar);
  const fileRef = useRef(null);

  // Initials from display name
  const initials = displayName
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setProfile({ displayName: displayName.trim(), username: username.trim(), avatar });
    onClose();
  };

  if (typeof document === 'undefined') return null;

  // CSS vars shortcuts
  const bg     = 'var(--bg-primary)';
  const text   = 'var(--on-surface)';
  const muted  = 'var(--on-surface-muted)';
  const subtle = 'var(--on-surface-subtle)';
  const border = 'var(--divider)';
  const hover  = 'var(--hover-overlay)';
  const surf2  = 'var(--surface-2)';

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480, maxWidth: '95vw',
          background: bg,
          borderRadius: 20,
          padding: '28px 32px 24px',
          boxShadow: 'none',
          border: `1px solid ${border}`,
          position: 'relative',
        }}
        className="shadow-modal"
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 28, height: 28, borderRadius: '50%',
            background: surf2, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: muted,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
          onMouseLeave={e => e.currentTarget.style.background = surf2}
        >
          <X size={14} />
        </button>

        {/* Title */}
        <h2 style={{ fontSize: 17, fontWeight: 700, color: text, marginBottom: 24 }}>
          Edit profile
        </h2>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
            {/* Circle */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: preview ? 'transparent' : '#a855f7',
              border: `3px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative',
            }}>
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
                  {initials || 'U'}
                </span>
              )}
            </div>

            {/* Camera badge */}
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 28, height: 28, borderRadius: '50%',
              background: bg, border: `2px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              <Camera size={14} style={{ color: text }} />
            </div>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Display Name */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            border: `1px solid ${border}`,
            borderRadius: 10, padding: '12px 16px',
            background: surf2, position: 'relative',
          }}>
            <label style={{ fontSize: 11, color: subtle, display: 'block', marginBottom: 4 }}>
              Display name
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: text, fontSize: 15, fontFamily: 'inherit',
              }}
              placeholder="Your display name"
            />
          </div>
        </div>

        {/* Username */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            border: `1px solid ${border}`,
            borderRadius: 10, padding: '12px 16px',
            background: surf2,
          }}>
            <label style={{ fontSize: 11, color: subtle, display: 'block', marginBottom: 4 }}>
              Username
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: text, fontSize: 15, fontFamily: 'inherit',
              }}
              placeholder="username"
            />
          </div>
        </div>

        {/* Helper */}
        <p style={{ fontSize: 12, color: subtle, textAlign: 'center', marginBottom: 24 }}>
          Your profile helps people recognize you in group chats.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px', borderRadius: 999,
              background: 'transparent', border: `1px solid ${border}`,
              color: text, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = hover}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 24px', borderRadius: 999,
              background: text, border: 'none',
              color: bg, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
