'use client';
import React from 'react';
import ReactDOM from 'react-dom';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings, Bell, Palette, Grid, Database, Shield,
  Users, User, ChevronDown, Lock, Check, LogOut, Sparkles, Plus,
  HelpCircle, Info, ChevronRight, Smartphone, Key, History, Type,
  Maximize, Image as ImageIcon, Trash2, Moon, Sun, Monitor, Bot, 
  Search as SearchIcon, AlertTriangle, Archive, Eye, EyeOff, MessageSquare, ChevronUp, Play, Pause,
  ArrowLeft, LayoutGrid, Globe, FileText, Glasses, Circle
} from 'lucide-react';

const VOICES = [
  { id: 'Kyra', name: 'Kyra', desc: 'Premium, smooth female voice', gender: 'female' },
  { id: 'Echo', name: 'Echo', desc: 'Mature, professional male voice', gender: 'male' },
  { id: 'Alloy', name: 'Alloy', desc: 'Neutral, robotic balance', gender: 'neutral' },
  { id: 'Shimmer', name: 'Shimmer', desc: 'Bright, energetic female voice', gender: 'female' },
  { id: 'Onyx', name: 'Onyx', desc: 'Deep, resonant male voice', gender: 'male' },
];

const ACCENT_COLORS = [
  { label: 'Default', color: '#6366f1' },
  { label: 'Blue',    color: '#3b82f6' },
  { label: 'Green',   color: '#22c55e' },
  { label: 'Yellow',  color: '#eab308' },
  { label: 'Pink',    color: '#ec4899' },
  { label: 'Orange',  color: '#f97316' },
  { label: 'Purple',  color: '#a855f7' },
  { label: 'Black',   color: '#111111' },
];

const navItems = [
  { id: 'general',         icon: <Settings size={15} />,  label: 'General' },
  { id: 'notifications',   icon: <Bell size={15} />,       label: 'Notifications' },
  { id: 'personalization', icon: <Palette size={15} />,    label: 'Personalization' },
  { id: 'apps',            icon: <Grid size={15} />,       label: 'Apps' },
  { id: 'data',            icon: <Database size={15} />,   label: 'Data controls' },
  { id: 'security',        icon: <Shield size={15} />,     label: 'Security' },
  { id: 'parental',        icon: <Users size={15} />,      label: 'Parental controls' },
  { id: 'account',         icon: <User size={15} />,       label: 'Account' },
];

const LANGUAGES = [
  { label: 'Auto-detect', value: 'Auto-detect' },
  { label: 'English (US)', value: 'English (US)' },
  { divider: true },
  { label: 'አማርኛ', value: 'Amharic' },
  { label: 'العربية', value: 'Arabic' },
  { label: 'български', value: 'Bulgarian' },
  { label: 'বাংলা', value: 'Bengali' },
  { label: 'bosanski', value: 'Bosnian' },
  { label: 'català', value: 'Catalan' },
  { label: 'čeština', value: 'Czech' },
  { label: 'dansk', value: 'Danish' },
  { label: 'Deutsch', value: 'German' },
  { label: 'Español', value: 'Spanish' },
  { label: 'Français', value: 'French' },
  { label: 'Italiano', value: 'Italian' },
  { label: '日本語', value: 'Japanese' },
  { label: '한국어', value: 'Korean' },
  { label: 'Português', value: 'Portuguese' },
  { label: 'Русский', value: 'Russian' },
  { label: 'اردو', value: 'Urdu' },
  { label: '中文', value: 'Chinese' },
];

export default function SettingsModal({ onClose, initialTab = 'general' }) {
  const { 
    theme, resolvedTheme, setAppTheme, accentColor, setAccentColor, user, 
    language, setLanguage, logout, fontSize, setFontSize, 
    chatWidth, setChatWidth, lineHeight, setLineHeight,
    chats, deleteAccount, personalization, setPersonalization,
    archivedChats, unarchiveChat, archivePassword, setArchivePassword,
    openArchivedChat
  } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [connectedApps, setConnectedApps] = React.useState(['github', 'spotify']);
  const [isBrowsingApps, setIsBrowsingApps] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [improveModel, setImproveModel] = React.useState(true);
  const [currentMobileView, setCurrentMobileView] = React.useState('main');
  const [isLanguagePopupOpen, setIsLanguagePopupOpen] = React.useState(false);
  const [languageSearchQuery, setLanguageSearchQuery] = React.useState('');
  const [tempSelectedLanguage, setTempSelectedLanguage] = React.useState('English (US)');
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  React.useEffect(() => {
    setIsBrowsingApps(false);
  }, [activeTab]);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [mfaEnabled, setMfaEnabled] = React.useState(false);
  const [notifications, setNotifications] = React.useState({
    push: true, email: false, marketing: true
  });

  // ── Archive states ──
  const [archiveUnlocked, setArchiveUnlocked] = React.useState(!archivePassword);
  const [archivePwdInput, setArchivePwdInput] = React.useState('');
  const [archivePwdError, setArchivePwdError] = React.useState(false);
  const [showSetPwd, setShowSetPwd] = React.useState(false);
  const [newPwd, setNewPwd] = React.useState('');
  const [newPwdConfirm, setNewPwdConfirm] = React.useState('');
  const [pwdSetError, setPwdSetError] = React.useState('');
  // Eye toggles
  const [showPwdInput, setShowPwdInput] = React.useState(false);
  const [showNewPwdInput, setShowNewPwdInput] = React.useState(false);
  const [showNewPwdConfirm, setShowNewPwdConfirm] = React.useState(false);
  // Expanded chat reader
  const [expandedChatId, setExpandedChatId] = React.useState(null);
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState(false);
  const voiceRef = React.useRef(null);
  // ─────────────────────

  if (typeof document === 'undefined') return null;

  if (isMobile && !user) {
    if (currentMobileView === 'about') {
      return ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'var(--bg-primary, #000000)',
            display: 'flex',
            flexDirection: 'column',
            color: 'var(--on-surface, #ffffff)',
            padding: '16px 20px',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, height: 44, marginTop: 12 }}>
            <button
              onClick={() => setCurrentMobileView('main')}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--surface-2, rgba(255,255,255,0.08))',
                border: 'none',
                color: 'var(--on-surface, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: 18, fontWeight: 600, flex: 1, textAlign: 'center', marginRight: 40 }}>About</span>
          </div>

          {/* About List Card */}
          <div style={{ 
            background: 'var(--surface-1, #1e1e20)', 
            borderRadius: 16, 
            overflow: 'hidden'
          }}>
            {/* Help center */}
            <div 
              onClick={() => { router.push('/help'); onClose(); }}
              style={{ 
                padding: 16, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                cursor: 'pointer',
                borderBottom: '1px solid var(--divider, #3a3a3c)'
              }}
            >
              <div style={{ color: 'var(--on-surface-muted, rgba(255,255,255,0.7))' }}>
                <HelpCircle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface, #ffffff)' }}>Help center</div>
              </div>
              <div style={{ color: 'var(--on-surface-subtle, rgba(255,255,255,0.4))' }}>
                <ChevronRight size={18} />
              </div>
            </div>

            {/* Terms of use */}
            <div 
              onClick={() => alert('Terms of use')}
              style={{ 
                padding: 16, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                cursor: 'pointer',
                borderBottom: '1px solid var(--divider, #3a3a3c)'
              }}
            >
              <div style={{ color: 'var(--on-surface-muted, rgba(255,255,255,0.7))' }}>
                <FileText size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface, #ffffff)' }}>Terms of use</div>
              </div>
              <div style={{ color: 'var(--on-surface-subtle, rgba(255,255,255,0.4))' }}>
                <ChevronRight size={18} />
              </div>
            </div>

            {/* Privacy policy */}
            <div 
              onClick={() => alert('Privacy policy')}
              style={{ 
                padding: 16, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                cursor: 'pointer',
                borderBottom: '1px solid var(--divider, #3a3a3c)'
              }}
            >
              <div style={{ color: 'var(--on-surface-muted, rgba(255,255,255,0.7))' }}>
                <Glasses size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface, #ffffff)' }}>Privacy policy</div>
              </div>
              <div style={{ color: 'var(--on-surface-subtle, rgba(255,255,255,0.4))' }}>
                <ChevronRight size={18} />
              </div>
            </div>

            {/* Licenses */}
            <div 
              onClick={() => alert('Licenses')}
              style={{ 
                padding: 16, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                cursor: 'pointer',
                borderBottom: '1px solid var(--divider, #3a3a3c)'
              }}
            >
              <div style={{ color: 'var(--on-surface-muted, rgba(255,255,255,0.7))' }}>
                <FileText size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface, #ffffff)' }}>Licenses</div>
              </div>
              <div style={{ color: 'var(--on-surface-subtle, rgba(255,255,255,0.4))' }}>
                <ChevronRight size={18} />
              </div>
            </div>

            {/* Kyra for Web details */}
            <div 
              style={{ 
                padding: 16, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                cursor: 'default'
              }}
            >
              <div style={{ color: 'var(--on-surface-muted, rgba(255,255,255,0.7))' }}>
                <Circle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface, #ffffff)' }}>Kyra for Web</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-subtle, rgba(255,255,255,0.5))', marginTop: 2 }}>1.2026.125 (19)</div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      );
    }

    return ReactDOM.createPortal(
      <>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            background: 'var(--bg-primary, #000000)',
            display: 'flex',
            flexDirection: 'column',
            color: 'var(--on-surface, #ffffff)',
            padding: '16px 20px',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, height: 44, marginTop: 12 }}>
            <button
              onClick={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--surface-2, rgba(255,255,255,0.08))',
                border: 'none',
                color: 'var(--on-surface, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: 18, fontWeight: 600, flex: 1, textAlign: 'center', marginRight: 40 }}>Settings</span>
          </div>

          {/* Data controls */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: 'var(--on-surface-subtle, rgba(255,255,255,0.6))', fontSize: 13, fontWeight: 500, marginBottom: 8, paddingLeft: 4 }}>
              Data controls
            </div>
            <div style={{ 
              background: 'var(--surface-1, #1e1e20)', 
              borderRadius: 16, 
              padding: 16, 
              display: 'flex', 
              gap: 12,
              alignItems: 'flex-start'
            }}>
              <div style={{ color: 'var(--on-surface-muted, rgba(255,255,255,0.7))', paddingTop: 2 }}>
                <Database size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface, #ffffff)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Improve the model for everyone</span>
                  <div
                    onClick={() => setImproveModel(!improveModel)}
                    style={{
                      width: 50,
                      height: 28,
                      borderRadius: 99,
                      background: improveModel ? 'var(--on-surface, #ffffff)' : 'var(--divider, #3a3a3c)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: '0.3s',
                      flexShrink: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: improveModel ? 25 : 3,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: improveModel ? 'var(--bg-primary, #000000)' : '#ffffff',
                      transition: '0.3s'
                    }} />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--on-surface-subtle, rgba(255,255,255,0.5))', lineHeight: 1.5, marginTop: 4, marginRight: 8 }}>
                  Allow your content to be used to improve our models for you and other users. We take steps to protect your privacy. <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
                </p>
              </div>
            </div>
          </div>

          {/* App */}
          <div>
            <div style={{ color: 'var(--on-surface-subtle, rgba(255,255,255,0.6))', fontSize: 13, fontWeight: 500, marginBottom: 8, paddingLeft: 4 }}>
              App
            </div>
            <div style={{ 
              background: 'var(--surface-1, #1e1e20)', 
              borderRadius: 16, 
              overflow: 'hidden'
            }}>
              {/* Language */}
              <div 
                onClick={() => {
                  setTempSelectedLanguage(language || 'English (US)');
                  setIsLanguagePopupOpen(true);
                }}
                style={{ 
                  padding: 16, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--divider, #3a3a3c)'
                }}
              >
                <div style={{ color: 'var(--on-surface-muted, rgba(255,255,255,0.7))' }}>
                  <Globe size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface, #ffffff)' }}>Language</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-subtle, rgba(255,255,255,0.5))', marginTop: 2 }}>{language || 'English (US)'}</div>
                </div>
                <div style={{ color: 'var(--on-surface-subtle, rgba(255,255,255,0.4))' }}>
                  <ChevronRight size={18} />
                </div>
              </div>

              {/* About */}
              <div 
                onClick={() => setCurrentMobileView('about')}
                style={{ 
                  padding: 16, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  cursor: 'pointer'
                }}
              >
                <div style={{ color: 'var(--on-surface-muted, rgba(255,255,255,0.7))' }}>
                  <Info size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--on-surface, #ffffff)' }}>About</div>
                </div>
                <div style={{ color: 'var(--on-surface-subtle, rgba(255,255,255,0.4))' }}>
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLanguagePopupOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 10000000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => {
              setIsLanguagePopupOpen(false);
              setLanguageSearchQuery('');
            }}
          >
            {/* Dialog Container */}
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '380px',
                background: '#1c1c1e',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                color: '#ffffff'
              }}
            >
              {/* Title */}
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                margin: '0 0 16px 0',
                textAlign: 'left'
              }}>
                App language
              </h3>

              {/* Search Bar Container */}
              <div style={{
                position: 'relative',
                marginBottom: '16px',
                width: '100%'
              }}>
                {/* Search Icon */}
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <SearchIcon size={18} />
                </div>

                {/* Input Field */}
                <input
                  type="text"
                  placeholder="Search language..."
                  value={languageSearchQuery}
                  onChange={(e) => setLanguageSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 38px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />

                {/* Clear Input Button */}
                {languageSearchQuery && (
                  <button
                    onClick={() => setLanguageSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Scrollable Languages List Container */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                marginBottom: '20px',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '4px'
              }} className="custom-scrollbar">
                {(() => {
                  const filtered = LANGUAGES.filter(l => !l.divider && (
                    l.label.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||
                    l.value.toLowerCase().includes(languageSearchQuery.toLowerCase())
                  ));

                  if (filtered.length === 0) {
                    return (
                      <div style={{
                        padding: '24px 0',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '14.5px'
                      }}>
                        No languages found
                      </div>
                    );
                  }

                  return filtered.map((lang) => {
                    const isSelected = tempSelectedLanguage === lang.value || tempSelectedLanguage === lang.label;
                    return (
                      <div
                        key={lang.value}
                        onClick={() => setTempSelectedLanguage(lang.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {/* Radio Circle */}
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--accent-color, #6366f1)' : '#48484a'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                          transition: 'border-color 0.2s',
                          flexShrink: 0
                        }}>
                          {isSelected && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--accent-color, #6366f1)'
                            }} />
                          )}
                        </div>

                        {/* Language Label */}
                        <span style={{
                          fontSize: '14.5px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)',
                          transition: 'color 0.2s',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {lang.label}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Action Buttons Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                gap: '12px'
              }}>
                {/* Cancel Button */}
                <button
                  onClick={() => {
                    setIsLanguagePopupOpen(false);
                    setLanguageSearchQuery('');
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s'
                  }}
                >
                  Cancel
                </button>

                {/* OK Button */}
                <button
                  onClick={() => {
                    setLanguage(tempSelectedLanguage);
                    setIsLanguagePopupOpen(false);
                    setLanguageSearchQuery('');
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    background: 'var(--accent-color, #6366f1)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </>,
      document.body
    );
  }

  const isDark = resolvedTheme === 'dark'; 
  const modalBg = 'var(--bg-primary)';
  const sidebarBg = 'var(--bg-secondary)';
  const textColor = 'var(--on-surface)';
  const mutedColor = 'var(--on-surface-muted)';
  const subtleColor = 'var(--on-surface-subtle)';
  const borderColor = 'var(--divider)';
  const itemActiveBg = 'var(--surface-3)';
  const hoverOverlay = 'var(--hover-overlay)';

  const currentLanguageLabel = LANGUAGES.find(l => l.value === language)?.label || language;

  const navItems = user ? [
    { id: 'general',         icon: <Settings size={16} />,  label: 'General' },
    { id: 'notifications',   icon: <Bell size={16} />,       label: 'Notifications' },
    { id: 'personalization', icon: <Palette size={16} />,    label: 'Personalization' },
    { id: 'apps',            icon: <Grid size={16} />,       label: 'Apps' },
    { id: 'data',            icon: <Database size={16} />,   label: 'Data controls' },
    { id: 'security',        icon: <Shield size={16} />,     label: 'Security' },
    { id: 'parental',        icon: <Users size={16} />,      label: 'Parental controls' },
    { id: 'account',         icon: <User size={16} />,       label: 'Account' },
  ] : [
    { id: 'general',         icon: <Settings size={16} />,  label: 'General' },
    { id: 'data',            icon: <Database size={16} />,   label: 'Data controls' },
  ];

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '880px', maxWidth: '95vw',
          height: '620px', maxHeight: '90vh',
          background: modalBg,
          borderRadius: '24px',
          display: 'flex', overflow: 'hidden',
          boxShadow: 'none',
          border: `1px solid ${borderColor}`,
        }}
        className="shadow-modal"
      >
        <div style={{
          width: 240, flexShrink: 0,
          background: sidebarBg,
          padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: 4,
          borderRight: `1px solid ${borderColor}`,
        }}>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'transparent', border: 'none',
              color: textColor, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}
            onMouseEnter={e => e.currentTarget.style.background = hoverOverlay}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>

          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                background: activeTab === item.id ? itemActiveBg : 'transparent',
                border: 'none', color: textColor,
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', width: '100%',
                fontWeight: activeTab === item.id ? 500 : 400,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }} className="custom-scrollbar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
             <h2 style={{ fontSize: 24, fontWeight: 600, color: textColor, margin: 0 }}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            {activeTab === 'personalization' && <Sparkles size={20} style={{ color: accentColor }} />}
          </div>

          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: textColor, fontSize: 15, fontWeight: 600 }}>Theme</div>
                  <div style={{ color: subtleColor, fontSize: 13, marginTop: 2 }}>Choose how Kyra looks to you.</div>
                </div>
                <div style={{ display: 'flex', gap: 4, background: isDark ? 'rgba(255,255,255,0.05)' : '#eee', padding: 4, borderRadius: 12 }}>
                  {[
                    { id: 'light', icon: <Sun size={15} />, label: 'Light' },
                    { id: 'dark', icon: <Moon size={15} />, label: 'Dark' },
                    { id: 'system', icon: <Monitor size={15} />, label: 'System' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setAppTheme(t.id)}
                      style={{
                        padding: '6px 16px', borderRadius: 10, border: 'none',
                        background: theme === t.id ? 'var(--surface-3)' : 'transparent',
                        color: textColor, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: '0.2s',
                        display: 'flex', alignItems: 'center', gap: 8
                      }}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: textColor, fontSize: 15, fontWeight: 600 }}>Accent Color</div>
                  <div style={{ color: subtleColor, fontSize: 13, marginTop: 2 }}>Personalize your UI highlights.</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ACCENT_COLORS.slice(0, 5).map(c => (
                    <button
                      key={c.color}
                      onClick={() => setAccentColor(c.color)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', background: c.color,
                        border: `2px solid ${accentColor === c.color ? (isDark ? '#fff' : '#000') : 'transparent'}`,
                        cursor: 'pointer', transition: '0.2s', padding: 0
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: textColor, fontSize: 15, fontWeight: 600 }}>Language</div>
                    <div style={{ color: subtleColor, fontSize: 13, marginTop: 2 }}>Select your primary language for the UI.</div>
                  </div>
                  <button
                    onClick={() => setLanguageOpen(!languageOpen)}
                    style={{
                      padding: '8px 16px', borderRadius: 12, border: `1px solid ${borderColor}`,
                      background: 'transparent', color: textColor,
                      fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                    }}
                  >
                    {currentLanguageLabel}
                    <ChevronDown size={14} />
                  </button>
                </div>
                {languageOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    width: 220, background: modalBg, borderRadius: 16, border: `1px solid ${borderColor}`,
                    boxShadow: '0 15px 40px rgba(0,0,0,0.25)', zIndex: 10, maxHeight: 280, overflowY: 'auto'
                  }} className="custom-scrollbar">
                    {LANGUAGES.filter(l => !l.divider).map(l => (
                      <button
                        key={l.value}
                        onClick={() => { setLanguage(l.value); setLanguageOpen(false); }}
                        style={{
                          width: '100%', padding: '12px 20px', textAlign: 'left', background: 'transparent',
                          border: 'none', color: textColor, fontSize: 14, cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = hoverOverlay}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Voice Selection - Redesigned to Row with Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 16, border: `1px solid ${borderColor}`, background: 'var(--surface-1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.05)' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img 
                      src="/logo.png" 
                      alt="Kyra" 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        objectFit: 'cover', 
                        mixBlendMode: isDark ? 'screen' : 'multiply',
                        filter: isDark ? 'none' : 'invert(1)'
                      }} 
                    />
                  </div>
                  <div>
                    <div style={{ color: textColor, fontSize: 14, fontWeight: 600 }}>AI Voice</div>
                    <div style={{ color: subtleColor, fontSize: 12 }}>Choose your assistant's voice personality.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.speechSynthesis) {
                        if (isPreviewPlaying) {
                          window.speechSynthesis.cancel();
                          setIsPreviewPlaying(false);
                          return;
                        }
                        
                        window.speechSynthesis.cancel();
                        const v = VOICES.find(x => x.id === (personalization.voice || 'Kyra'));
                        const utterance = new SpeechSynthesisUtterance(`Hello, I am ${v.name}. How can I help you?`);
                        utterance.pitch = v.gender === 'male' ? 0.9 : 1.1;
                        utterance.onstart = () => setIsPreviewPlaying(true);
                        utterance.onend = () => setIsPreviewPlaying(false);
                        utterance.onerror = () => setIsPreviewPlaying(false);
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    style={{ 
                      width: 36, height: 36, borderRadius: '50%', background: isPreviewPlaying ? `${accentColor}20` : 'var(--surface-3)', border: 'none',
                      color: isPreviewPlaying ? accentColor : textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s', border: isPreviewPlaying ? `1px solid ${accentColor}40` : 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isPreviewPlaying ? `${accentColor}30` : hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = isPreviewPlaying ? `${accentColor}20` : 'var(--surface-3)'}
                  >
                    {isPreviewPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  </button>

                  <div style={{ position: 'relative' }} ref={voiceRef}>
                    <button
                      onClick={() => setVoiceOpen(!voiceOpen)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: `1px solid ${borderColor}`,
                        background: 'transparent', color: textColor,
                        fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        minWidth: 120, justifyContent: 'space-between'
                      }}
                    >
                      {personalization.voice || 'Kyra'}
                      <ChevronDown size={14} style={{ opacity: 0.6, transform: voiceOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </button>

                    <AnimatePresence>
                      {voiceOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          style={{
                            position: 'absolute', right: 0, bottom: '100%', marginBottom: 12,
                            width: 180, background: modalBg, borderRadius: 16, border: `1px solid ${borderColor}`,
                            boxShadow: '0 15px 40px rgba(0,0,0,0.3)', zIndex: 100, overflow: 'hidden', padding: 4
                          }}
                        >
                          {VOICES.map(v => (
                            <button
                              key={v.id}
                              onClick={() => { setPersonalization({ voice: v.id }); setVoiceOpen(false); }}
                              style={{
                                width: '100%', padding: '10px 14px', textAlign: 'left', background: personalization.voice === v.id ? hoverOverlay : 'transparent',
                                border: 'none', color: textColor, fontSize: 13, cursor: 'pointer', borderRadius: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = hoverOverlay}
                              onMouseLeave={e => e.currentTarget.style.background = personalization.voice === v.id ? hoverOverlay : 'transparent'}
                            >
                              <span>{v.name}</span>
                              {personalization.voice === v.id && <Check size={14} style={{ color: accentColor }} />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { id: 'push', title: 'Push Notifications', desc: 'Get instant alerts on your desktop/mobile.' },
                { id: 'email', title: 'Email Updates', desc: 'Receive daily summaries and project updates.' },
                { id: 'marketing', title: 'Marketing Emails', desc: 'Stay updated on new features and product tips.' },
              ].map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: 16, border: `1px solid ${borderColor}`,
                  background: notifications[item.id] ? 'var(--surface-1)' : 'transparent'
                }}>
                  <div style={{ flex: 1, paddingRight: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: subtleColor, marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <div
                    onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    style={{
                      width: 40, height: 22, borderRadius: 99, background: notifications[item.id] ? accentColor : borderColor,
                      position: 'relative', cursor: 'pointer', transition: '0.2s'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3, left: notifications[item.id] ? 21 : 3,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: '0.2s'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'personalization' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 20 }}>
              {/* Base style and tone */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>Base style and tone</div>
                  <p style={{ fontSize: 12, color: subtleColor, marginTop: 4, maxWidth: '80%' }}>Set the style and tone of how Kyra responds to you.</p>
                </div>
                <select 
                  value={personalization.baseStyle}
                  onChange={(e) => setPersonalization({ baseStyle: e.target.value })}
                  style={{ background: isDark ? '#2c2c2e' : '#f0f0f0', border: 'none', padding: '8px 16px', borderRadius: 10, color: textColor, fontSize: 13, outline: 'none', fontWeight: 500 }}
                >
                  <option>Default</option>
                  <option>Formal</option>
                  <option>Casual</option>
                  <option>Academic</option>
                </select>
              </div>

              {/* ── Archived Chats Box ── */}
              <div style={{ 
                padding: '4px 10px', fontSize: 10, fontWeight: 800,
                color: 'var(--bg-primary)', background: 'var(--on-surface)',
                borderRadius: 4, textTransform: 'uppercase',
                letterSpacing: '0.08em', width: 'fit-content'
              }}>Archived Chats</div>
              <div style={{ borderRadius: 18, border: `1px solid ${borderColor}`, background: 'var(--surface-2)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${borderColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Archive size={17} style={{ color: accentColor }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>Archived Chats</div>
                      <div style={{ fontSize: 12, color: subtleColor }}>
                        {!archivePassword ? 'Set a password to access archive' : archiveUnlocked ? `${archivedChats.length} chat${archivedChats.length !== 1 ? 's' : ''} • Unlocked` : 'Password protected'}
                      </div>
                    </div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={14} style={{ color: archiveUnlocked && archivePassword ? '#22c55e' : subtleColor }} />
                  </div>
                </div>

                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* CASE 1: No password set → force setup */}
                  {!archivePassword && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ fontSize: 13, color: subtleColor, lineHeight: 1.6 }}>
                        You must set a password to use Archived Chats. Your password will be saved securely.
                      </div>
                      {showSetPwd ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {/* New pwd with eye */}
                          <div style={{ position: 'relative' }}>
                            <input type={showNewPwdInput ? 'text' : 'password'} value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdSetError(''); }} placeholder="New password" autoFocus style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: isDark ? '#2c2c2e' : '#fff', color: textColor, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                            <button onClick={() => setShowNewPwdInput(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: subtleColor, display: 'flex' }}>{showNewPwdInput ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                          </div>
                          {/* Confirm pwd with eye */}
                          <div style={{ position: 'relative' }}>
                            <input type={showNewPwdConfirm ? 'text' : 'password'} value={newPwdConfirm} onChange={e => { setNewPwdConfirm(e.target.value); setPwdSetError(''); }} placeholder="Confirm password" onKeyDown={e => { if (e.key === 'Enter') { if (!newPwd.trim()) { setPwdSetError('Enter a password'); return; } if (newPwd !== newPwdConfirm) { setPwdSetError('Passwords do not match'); return; } setArchivePassword(newPwd); setShowSetPwd(false); setNewPwd(''); setNewPwdConfirm(''); setArchiveUnlocked(true); } }} style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: isDark ? '#2c2c2e' : '#fff', color: textColor, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                            <button onClick={() => setShowNewPwdConfirm(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: subtleColor, display: 'flex' }}>{showNewPwdConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                          </div>
                          {pwdSetError && <span style={{ fontSize: 12, color: '#ef4444' }}>{pwdSetError}</span>}
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setShowSetPwd(false); setNewPwd(''); setNewPwdConfirm(''); setPwdSetError(''); }} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'transparent', border: `1px solid ${borderColor}`, color: textColor, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => { if (!newPwd.trim()) { setPwdSetError('Enter a password'); return; } if (newPwd !== newPwdConfirm) { setPwdSetError('Passwords do not match'); return; } setArchivePassword(newPwd); setShowSetPwd(false); setNewPwd(''); setNewPwdConfirm(''); setArchiveUnlocked(true); }} style={{ flex: 1, padding: '10px', borderRadius: 10, background: accentColor, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Password</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowSetPwd(true)} style={{ padding: '11px 20px', borderRadius: 12, background: accentColor, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <Lock size={15} /> Set Archive Password
                        </button>
                      )}
                    </div>
                  )}

                  {/* CASE 2: Password set, not unlocked → unlock form */}
                  {archivePassword && !archiveUnlocked && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 13, color: subtleColor }}>Enter your password to view archived chats.</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type={showPwdInput ? 'text' : 'password'} value={archivePwdInput} autoFocus
                            onChange={e => { setArchivePwdInput(e.target.value); setArchivePwdError(false); }}
                            onKeyDown={e => { if (e.key === 'Enter') { if (archivePwdInput === archivePassword) { setArchiveUnlocked(true); setArchivePwdInput(''); } else setArchivePwdError(true); } }}
                            placeholder="Enter password..."
                            style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: 10, border: `1px solid ${archivePwdError ? '#ef4444' : borderColor}`, background: isDark ? '#2c2c2e' : '#f0f0f0', color: textColor, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                          />
                          <button onClick={() => setShowPwdInput(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: subtleColor, display: 'flex' }}>{showPwdInput ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                        </div>
                        <button onClick={() => { if (archivePwdInput === archivePassword) { setArchiveUnlocked(true); setArchivePwdInput(''); } else setArchivePwdError(true); }} style={{ padding: '10px 18px', borderRadius: 10, background: accentColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Unlock</button>
                      </div>
                      {archivePwdError && <span style={{ fontSize: 12, color: '#ef4444' }}>Wrong password. Try again.</span>}
                    </div>
                  )}

                  {/* CASE 3: Unlocked → show chats + change password */}
                  {archivePassword && archiveUnlocked && (
                    <>
                      {/* Change password toggle */}
                      {!showSetPwd ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: 13, color: subtleColor }}>Archive is password-protected.</div>
                          <button onClick={() => setShowSetPwd(true)} style={{ padding: '6px 14px', borderRadius: 99, border: `1px solid ${borderColor}`, background: 'transparent', color: textColor, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Lock size={12} /> Change
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.04)' : '#f0f0f0', border: `1px solid ${borderColor}` }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>Change archive password</div>
                          <div style={{ position: 'relative' }}>
                            <input type={showNewPwdInput ? 'text' : 'password'} value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdSetError(''); }} placeholder="New password" style={{ width: '100%', padding: '9px 42px 9px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: 'var(--surface-3)', color: textColor, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                            <button onClick={() => setShowNewPwdInput(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: subtleColor, display: 'flex' }}>{showNewPwdInput ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <input type={showNewPwdConfirm ? 'text' : 'password'} value={newPwdConfirm} onChange={e => { setNewPwdConfirm(e.target.value); setPwdSetError(''); }} placeholder="Confirm password" style={{ width: '100%', padding: '9px 42px 9px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: 'var(--surface-3)', color: textColor, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                            <button onClick={() => setShowNewPwdConfirm(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: subtleColor, display: 'flex' }}>{showNewPwdConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                          </div>
                          {pwdSetError && <span style={{ fontSize: 12, color: '#ef4444' }}>{pwdSetError}</span>}
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setShowSetPwd(false); setNewPwd(''); setNewPwdConfirm(''); setPwdSetError(''); }} style={{ flex: 1, padding: '8px', borderRadius: 10, background: 'transparent', border: `1px solid ${borderColor}`, color: textColor, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => { if (!newPwd.trim()) { setPwdSetError('Enter a password'); return; } if (newPwd !== newPwdConfirm) { setPwdSetError('Passwords do not match'); return; } setArchivePassword(newPwd); setShowSetPwd(false); setNewPwd(''); setNewPwdConfirm(''); }} style={{ flex: 1, padding: '8px', borderRadius: 10, background: accentColor, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                          </div>
                        </div>
                      )}

                      {/* Archived chat list with reader */}
                      {archivedChats.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }} className="custom-scrollbar">
                          {archivedChats.map(chat => (
                            <div key={chat.id} style={{ borderRadius: 12, border: `1px solid ${borderColor}`, background: 'var(--surface-1)', overflow: 'hidden' }}>
                              {/* Chat header row - click to open */}
                              <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', cursor: 'pointer' }} onClick={() => { openArchivedChat(chat); onClose(); }}>
                                <Archive size={13} style={{ color: subtleColor, flexShrink: 0, marginRight: 10 }} />
                                <span style={{ fontSize: 13, color: textColor, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{chat.title}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 11, color: subtleColor }}>{(chat.messages || []).length} msgs</span>
                                  <button onClick={e => { e.stopPropagation(); unarchiveChat(chat.id); }} style={{ padding: '4px 10px', borderRadius: 7, background: isDark ? 'rgba(255,255,255,0.07)' : '#eee', border: 'none', color: textColor, fontSize: 11, fontWeight: 600, cursor: 'pointer', marginLeft: 4 }} onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.13)' : '#ddd'} onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : '#eee'}>Unarchive</button>
                                </div>
                              </div>
                              {/* Expanded messages reader */}
                              {expandedChatId === chat.id && (
                                <div style={{ borderTop: `1px solid ${borderColor}`, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto', background: isDark ? 'rgba(0,0,0,0.15)' : '#fafafa' }} className="custom-scrollbar">
                                  {(chat.messages || []).length === 0 ? (
                                    <div style={{ fontSize: 12, color: subtleColor, textAlign: 'center', padding: '12px 0' }}>No messages in this chat.</div>
                                  ) : (chat.messages || []).map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                      <span style={{ fontSize: 10, fontWeight: 700, color: subtleColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{msg.role === 'user' ? 'You' : 'Kyra'}</span>
                                      <div style={{ maxWidth: '85%', padding: '9px 13px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? accentColor : (isDark ? 'rgba(255,255,255,0.06)' : '#efefef'), color: msg.role === 'user' ? '#fff' : textColor, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content || msg.text || ''}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: subtleColor }}>No archived chats yet. Archive chats from the sidebar menu.</div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Fast Answers Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>Fast answers</div>
                  <p style={{ fontSize: 12, color: subtleColor, marginTop: 4, maxWidth: '85%' }}>Kyra can sometimes use its general knowledge to give fast, in-depth answers.</p>
                </div>
                <div
                  onClick={() => setPersonalization({ fastAnswers: !personalization.fastAnswers })}
                  style={{
                    width: 44, height: 24, borderRadius: 99, background: personalization.fastAnswers ? accentColor : borderColor,
                    position: 'relative', cursor: 'pointer', transition: '0.3s'
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: personalization.fastAnswers ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: '0.3s'
                  }} />
                </div>
              </div>

              {/* Custom Instructions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>Custom instructions</div>
                <p style={{ fontSize: 12, color: subtleColor, marginTop: -8 }}>How would you like Kyra to respond?</p>
                <textarea 
                  value={personalization.customInstructions}
                  onChange={(e) => setPersonalization({ customInstructions: e.target.value })}
                  placeholder="e.g. 'Always be concise', 'Explain like I'm five', 'Use professional tone'..."
                  style={{ 
                    width: '100%', height: 100, borderRadius: 12, background: isDark ? '#2c2c2e' : '#f0f0f0', 
                    border: 'none', padding: '12px', fontSize: 13, color: textColor, resize: 'none', outline: 'none'
                  }}
                />
              </div>

              {/* About You */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>About you</div>
                <p style={{ fontSize: 12, color: subtleColor, marginTop: -8 }}>What would you like Kyra to know about you to provide better responses?</p>
                <textarea 
                  value={personalization.aboutYou || ''}
                  onChange={(e) => setPersonalization({ aboutYou: e.target.value })}
                  placeholder="e.g. 'I'm a software engineer', 'I live in Lahore', 'I'm learning Spanish'..."
                  style={{ 
                    width: '100%', height: 100, borderRadius: 12, background: isDark ? '#2c2c2e' : '#f0f0f0', 
                    border: 'none', padding: '12px', fontSize: 13, color: textColor, resize: 'none', outline: 'none'
                  }}
                />
              </div>

            </div>
          )}

          {activeTab === 'apps' && (() => {
            const INTEGRATIONS = [
              { 
                id: 'notion', 
                name: 'Notion', 
                icon: (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M4.6 2.3h14.8c1.3 0 2.3 1 2.3 2.3v14.8c0 1.3-1 2.3-2.3 2.3H4.6c-1.3 0-2.3-1-2.3-2.3V4.6c0-1.3 1-2.3 2.3-2.3zm1.7 4.1v11.3h2.1V9.9L14.7 17.7h3.1V6.4h-2.1v6.5L9.4 6.4H6.3z" />
                  </svg>
                ), 
                desc: 'Sync notes, databases, and workspace documents.',
                color: isDark ? '#ffffff' : '#000000'
              },
              { 
                id: 'gdrive', 
                name: 'Google Drive', 
                icon: (
                  <svg viewBox="0 0 64 64" width="20" height="20">
                    <path fill="#4285F4" d="M28.7 40.5L18 59h35.3L64 40.5H28.7z" />
                    <path fill="#FBBC05" d="M61 35.3L42.7 3.6H21.3l18.3 31.7H61z" />
                    <path fill="#34A853" d="M18.3 8.8L0 40.5 10.7 59 29 27.3 18.3 8.8z" />
                  </svg>
                ), 
                desc: 'Read and analyze your documents.',
                color: '#34A853'
              },
              { 
                id: 'slack', 
                name: 'Slack', 
                icon: (
                  <svg viewBox="0 0 54 54" width="20" height="20">
                    <g fill="none" fillRule="evenodd">
                      <path d="M19.712 28.992a3.552 3.552 0 1 1-3.552 3.552h3.552v-3.552zm1.776 0a3.552 3.552 0 0 1 3.552-3.552h7.104a3.552 3.552 0 0 1 3.552 3.552v7.104a3.552 3.552 0 0 1-3.552 3.552h-7.104a3.552 3.552 0 0 1-3.552-3.552v-7.104z" fill="#36C5F0" />
                      <path d="M25.04 14.784a3.552 3.552 0 1 1 3.552-3.552v3.552h-3.552zm0 1.776a3.552 3.552 0 0 1 3.552 3.552v7.104a3.552 3.552 0 0 1-3.552 3.552h-7.104a3.552 3.552 0 0 1-3.552-3.552v-7.104a3.552 3.552 0 0 1 3.552-3.552h7.104z" fill="#2EB67D" />
                      <path d="M39.264 20.112a3.552 3.552 0 1 1 3.552-3.552h-3.552v3.552zm-1.776 0a3.552 3.552 0 0 1-3.552 3.552h-7.104a3.552 3.552 0 0 1-3.552-3.552v-7.104a3.552 3.552 0 0 1 3.552-3.552h7.104a3.552 3.552 0 0 1 3.552 3.552v7.104z" fill="#ECB22E" />
                      <path d="M33.936 34.32a3.552 3.552 0 1 1-3.552 3.552v-3.552h3.552zm0-1.776a3.552 3.552 0 0 1-3.552-3.552v-7.104a3.552 3.552 0 0 1 3.552-3.552h7.104a3.552 3.552 0 0 1 3.552 3.552v7.104a3.552 3.552 0 0 1-3.552 3.552h-7.104z" fill="#E01E5A" />
                    </g>
                  </svg>
                ), 
                desc: 'Connect your channels and search chat logs.',
                color: '#4A154B'
              },
              { 
                id: 'github', 
                name: 'GitHub', 
                icon: (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                ), 
                desc: 'Search and read code from your repositories.',
                color: isDark ? '#ffffff' : '#000000'
              },
              { 
                id: 'spotify', 
                name: 'Spotify', 
                icon: (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#1DB954">
                    <circle cx="12" cy="12" r="12" />
                    <path d="M17.9 10.9C14.7 9 9.3 8.8 6.2 9.8c-.5.1-1-.1-1.2-.6s.1-1 .6-1.2C9 6.9 15 7.1 18.7 9.3c.4.2.6.8.3 1.2-.2.4-.7.6-1.1.4zm-.1 2.3c-.2.4-.7.5-1.1.3-2.6-1.6-6.6-2.1-9.7-1.2-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3.5-1.1 7.9-.5 10.9 1.3.4.2.5.8.3 1.2zM15.2 16c-.2.3-.6.4-.9.2-2.3-1.4-5.2-1.7-8.6-.9-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 3.7-.8 6.9-.5 9.5 1.1.3.2.4.6.2.8z" fill="#ffffff"/>
                  </svg>
                ), 
                desc: 'Control playback and search for music.',
                color: '#1DB954'
              }
            ];

            if (isBrowsingApps) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <button 
                      onClick={() => setIsBrowsingApps(false)}
                      style={{
                        background: 'transparent', border: 'none', color: textColor,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 8, borderRadius: '50%', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 600, color: textColor }}>Browse Integrations</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {INTEGRATIONS.map(app => {
                      const isConnected = connectedApps.includes(app.id);
                      return (
                        <div key={app.id} style={{
                          display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 20,
                          border: `1px solid ${borderColor}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
                        }}>
                          <div style={{ 
                            width: 44, 
                            height: 44, 
                            borderRadius: 12, 
                            background: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: app.color 
                          }}>
                            {app.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: textColor }}>{app.name}</div>
                            <div style={{ fontSize: 12, color: subtleColor, marginTop: 2 }}>{app.desc}</div>
                          </div>
                          <button 
                            onClick={() => {
                              setConnectedApps(prev => 
                                prev.includes(app.id) ? prev.filter(id => id !== app.id) : [...prev, app.id]
                              );
                            }}
                            style={{
                              padding: '8px 16px', borderRadius: 99, 
                              background: isConnected ? 'rgba(239, 68, 68, 0.1)' : accentColor,
                              border: isConnected ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                              color: isConnected ? '#ef4444' : '#fff', 
                              fontSize: 13, fontWeight: 600, cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {isConnected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Intro Card */}
                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', borderRadius: 20, padding: 20, 
                  border: `1px solid ${borderColor}`
                }}>
                  <p style={{ margin: 0, fontSize: 13.5, color: subtleColor, lineHeight: 1.5 }}>
                    Kyra can access information from connected apps, based on what you're authorized to view.{' '}
                    <span style={{ color: accentColor, fontWeight: 600, cursor: 'pointer' }}>
                      Learn more
                    </span>
                  </p>
                </div>

                {/* Connected Apps List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: subtleColor, paddingLeft: 8 }}>
                    Connected Apps
                  </span>
                  <div style={{
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', borderRadius: 20, 
                    border: `1px solid ${borderColor}`, overflow: 'hidden'
                  }}>
                    {connectedApps.length === 0 ? (
                      <div style={{ padding: '24px 20px', textAlign: 'center', color: subtleColor, fontSize: 13.5 }}>
                        No connected integrations. Click "Browse apps" to connect one.
                      </div>
                    ) : (
                      connectedApps.map((appId, index) => {
                        const app = INTEGRATIONS.find(a => a.id === appId);
                        if (!app) return null;
                        const isLast = index === connectedApps.length - 1;
                        return (
                          <div key={app.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px', borderBottom: isLast ? 'none' : `1px solid ${borderColor}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <div style={{ display: 'flex', color: app.color }}>{app.icon}</div>
                              <span style={{ fontSize: 15, fontWeight: 500, color: textColor }}>{app.name}</span>
                            </div>
                            <button 
                              onClick={() => setConnectedApps(prev => prev.filter(id => id !== app.id))}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                                color: '#ef4444', padding: '6px 12px', borderRadius: 8, fontSize: 13, 
                                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                              Disconnect
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Available integrations row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: subtleColor, paddingLeft: 8 }}>
                    Available Integrations
                  </span>
                  <div style={{
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', borderRadius: 20, 
                    border: `1px solid ${borderColor}`, overflow: 'hidden'
                  }}>
                    <div 
                      onClick={() => setIsBrowsingApps(true)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px', cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <LayoutGrid size={18} style={{ color: textColor }} />
                        <span style={{ fontSize: 15, fontWeight: 500, color: textColor }}>Browse apps</span>
                      </div>
                      <ChevronRight size={18} style={{ color: subtleColor }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8f8f8', borderRadius: 16,
                padding: '20px', border: `1px solid ${borderColor}`,
              }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: textColor, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Database size={18} style={{ color: accentColor }} />
                  Chat History & Training
                </div>
                <p style={{ fontSize: 13.5, color: subtleColor, lineHeight: 1.6, marginBottom: 18 }}>
                  Save new chats to this browser history and allow them to be used to improve our models.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                   <button style={{
                    padding: '10px 20px', borderRadius: 99, background: accentColor, color: '#fff',
                    border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s',
                   }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    Manage History
                  </button>
                  <button style={{
                    padding: '10px 20px', borderRadius: 99, background: 'transparent', color: textColor,
                    border: `1px solid ${borderColor}`, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { id: 'push', title: 'Push Notifications', desc: 'Get instant alerts on your desktop/mobile.' },
                  { id: 'email', title: 'Email Updates', desc: 'Receive daily summaries and project updates.' },
                  { id: 'marketing', title: 'Marketing Emails', desc: 'Stay updated on new features and product tips.' },
                ].map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderRadius: 16, border: `1px solid ${borderColor}`,
                    background: notifications[item.id] ? (isDark ? 'rgba(255,255,255,0.02)' : '#fff') : 'transparent'
                  }}>
                    <div style={{ flex: 1, paddingRight: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: subtleColor, marginTop: 2 }}>{item.desc}</div>
                    </div>
                    <div
                      onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      style={{
                        width: 40, height: 22, borderRadius: 99, background: notifications[item.id] ? accentColor : borderColor,
                        position: 'relative', cursor: 'pointer', transition: '0.2s'
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 3, left: notifications[item.id] ? 21 : 3,
                        width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: '0.2s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '20px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9', border: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 12 }}>Notification Preview</div>
                <div style={{ padding: '12px 16px', background: isDark ? '#111' : '#fff', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                   <div style={{ width: 32, height: 32, borderRadius: 8, background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src="/logo.png" 
                      alt="Kyra" 
                      style={{ 
                        width: 18, 
                        height: 18, 
                        objectFit: 'cover', 
                        mixBlendMode: isDark ? 'screen' : 'multiply',
                        filter: isDark ? 'none' : 'invert(1)'
                      }} 
                    />
                   </div>
                   <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>Kyra</div>
                    <div style={{ fontSize: 12, color: subtleColor }}>I've completed the analysis of your file.</div>
                   </div>
                   <div style={{ fontSize: 10, color: subtleColor }}>Just now</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                padding: '20px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9',
                border: `1px solid ${borderColor}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Smartphone size={24} style={{ color: accentColor }} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: textColor }}>Two-factor authentication</div>
                      <div style={{ fontSize: 13, color: subtleColor, marginTop: 4, lineHeight: 1.5 }}>
                        Add an extra layer of security to your account. We'll ask for a code when you log in.
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => setMfaEnabled(!mfaEnabled)}
                    style={{
                      width: 44, height: 24, borderRadius: 99, background: mfaEnabled ? accentColor : borderColor,
                      position: 'relative', cursor: 'pointer', transition: '0.3s'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3, left: mfaEnabled ? 23 : 3,
                      width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: '0.3s'
                    }} />
                  </div>
                </div>
                {mfaEnabled && (
                  <div style={{ padding: '12px', background: isDark ? 'rgba(0,0,0,0.2)' : '#fff', borderRadius: 12, fontSize: 12, color: accentColor, fontWeight: 600 }}>
                    MFA is currently active via Authenticator App.
                  </div>
                )}
              </div>

              <button style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 16, background: 'transparent',
                border: `1px solid ${borderColor}`, color: textColor, cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Key size={18} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Change Password</span>
                </div>
                <ChevronRight size={16} style={{ opacity: 0.5 }} />
              </button>

              <button style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 16, background: 'transparent',
                border: `1px solid ${borderColor}`, color: textColor, cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <History size={18} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Active Sessions</span>
                </div>
                <span style={{ fontSize: 12, color: subtleColor }}>1 active</span>
              </button>
            </div>
          )}

          {activeTab === 'parental' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ padding: '24px', borderRadius: 24, background: isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9', border: `1px solid ${borderColor}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Users size={24} style={{ color: accentColor }} />
                  <div style={{ fontSize: 18, fontWeight: 700, color: textColor }}>Family Management</div>
                </div>
                <p style={{ fontSize: 14, color: subtleColor, lineHeight: 1.6, marginBottom: 24 }}>
                  Add family members to share your Pro subscription and manage safety settings for younger users.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 16, background: isDark ? 'rgba(0,0,0,0.2)' : '#fff', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 12 }}>{user?.displayName?.[0] || 'U'}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{user?.displayName} (You)</div>
                    </div>
                    <span style={{ fontSize: 12, color: accentColor, fontWeight: 700 }}>OWNER</span>
                  </div>
                  <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px', borderRadius: 16, border: `2px dashed ${borderColor}`,
                    background: 'transparent', color: subtleColor, cursor: 'pointer', transition: '0.2s'
                  }} onMouseEnter={e => e.currentTarget.style.borderColor = accentColor} onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}>
                    <Plus size={18} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Add Family Member</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9', borderRadius: 24, border: `1px solid ${borderColor}` }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                  {user?.photoURL ? <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.displayName?.[0].toUpperCase() || 'U')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: textColor }}>{user?.displayName || 'User Name'}</div>
                  <div style={{ fontSize: 13, color: subtleColor, marginTop: 2 }}>{user?.email}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: 11, fontWeight: 700, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Sparkles size={12} />
                    Pro Plan
                  </div>
                </div>
                <button style={{ padding: '8px 16px', borderRadius: 10, background: 'transparent', border: `1px solid ${borderColor}`, color: textColor, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: '16px', borderRadius: 16, border: `1px solid ${borderColor}` }}>
                   <div style={{ fontSize: 12, color: subtleColor, marginBottom: 4 }}>Member since</div>
                   <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>May 2026</div>
                </div>
                <div style={{ padding: '16px', borderRadius: 16, border: `1px solid ${borderColor}` }}>
                   <div style={{ fontSize: 12, color: subtleColor, marginBottom: 4 }}>Total Chats</div>
                   <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{chats.length}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'transparent', border: `1px solid ${borderColor}`, color: textColor, cursor: 'pointer', fontSize: 14 }}>
                  <span>Download all data</span>
                  <ChevronRight size={16} />
                </button>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'transparent', border: `1px solid ${borderColor}`, color: textColor, cursor: 'pointer', fontSize: 14 }}>
                  <span>Privacy Policy</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 24, marginTop: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>Danger Zone</div>
                <p style={{ fontSize: 13, color: subtleColor, lineHeight: 1.5, marginBottom: 16 }}>
                  Permanently delete your account and all associated data. This action is irreversible.
                </p>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 20px', borderRadius: 14, background: '#ef444415', color: '#ef4444',
                    border: '1px solid #ef444430', fontWeight: 600, cursor: 'pointer', transition: '0.2s'
                  }} onMouseEnter={e => e.currentTarget.style.background = '#ef444425'} onMouseLeave={e => e.currentTarget.style.background = '#ef444415'}>
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'general' && activeTab !== 'notifications' && activeTab !== 'data' && activeTab !== 'account' && activeTab !== 'parental' && activeTab !== 'apps' && activeTab !== 'personalization' && activeTab !== 'security' && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subtleColor }}>
              <div style={{ textAlign: 'center' }}>
                <Sparkles size={44} style={{ marginBottom: 16, opacity: 0.1 }} />
                <div style={{ fontSize: 16, fontWeight: 500 }}>Advanced Feature</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>This module is coming in the next update.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%', maxWidth: 400, background: isDark ? '#1c1c1e' : '#fff',
              borderRadius: 24, padding: 32, textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: `1px solid ${borderColor}`
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ef444415', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertTriangle size={32} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: textColor, marginBottom: 12 }}>Delete Account?</h3>
            <p style={{ fontSize: 14, color: subtleColor, lineHeight: 1.6, marginBottom: 32 }}>
              This will permanently delete your profile, messages, and all data. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={deleteAccount}
                style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Delete Permanently
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'transparent', color: textColor, border: `1px solid ${borderColor}`, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>,
    document.body
  );
}
