'use client';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { safeSetLocalStorageItem } from '@/utils/storage';
import { 
  Send, Bot, User, Sparkles, Languages, Moon, Sun, Palette, Edit2, 
  Check, Copy, ThumbsUp, ThumbsDown, Share, Share2, RefreshCcw, MoreHorizontal, MoreVertical,
  AlertTriangle, ChevronDown, Mic, Square, ArrowUp, Plus, AudioLines, X, Menu, SquarePen,
  ChevronRight, Paperclip, Image, Lightbulb, Monitor, BookOpen, PenTool, Telescope, Cpu, Zap, Brain,
  ArrowDown, MessageSquareDashed, PenLine, Globe, RotateCw, UserPlus, Users, Pin, Archive, Trash2, Volume2, VolumeX, GitBranch, Settings, SmilePlus, Reply, Flag, ChevronLeft, LogOut,
  Code, Compass, FileText, LayoutGrid, Download, Library, Folder, Link2, Crop, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGeminiResponse } from '@/utils/gemini';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, onSnapshot, getDoc, setDoc, collection } from 'firebase/firestore';
import AuthModal from './AuthModal';
import LibraryView from './LibraryView';
import { handleImgError, generateImageClientSide } from '@/utils/image';
import AppsView from './AppsView';
import ResearchView from './ResearchView';
import ImagesView from './ImagesView';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const APP_SYSTEM_PROMPTS = {
  canva: "You are Canva Assistant, a creative design companion. You help users create visually stunning flyers, social media posts, logos, and layouts. Give guidance on canvas sizes, typography, visual hierarchy, modern color palettes, and step-by-step design layout ideas. Do not write generic programming code unless specifically requested; keep replies highly focused on aesthetics, copy layouts, visual elements, and creative design suggestions.",
  photoshop: "You are Adobe Photoshop Assistant, an expert image editor and graphic design companion. Help the user with photo manipulations, layer styling, blend modes, pen tool selections, masking, color grading, and filter adjustments. Provide clear, step-by-step instructions on how to use specific Photoshop tools and panels to achieve their editing goals.",
  figma: "You are Figma Assistant, a UI/UX layout and wireframing expert. Assist the user in designing clean interfaces, organizing design systems, utilizing Auto Layout, components, variants, variables, interactive prototyping, and framing systems. Focus on UI best practices, usability, modern design patterns, and clean organization.",
  airtable: "You are Airtable Assistant, a relational database modeler. Help the user structure relational database tables, design schemas, write complex Airtable formulas, set up trigger-based automations, and compose scripts to interface with the Airtable API. Focus on clean data structures, relational fields, and optimal database organization.",
  booking: "You are Booking.com Travel Assistant, an expert travel planner. Help the user discover beautiful destinations, recommend optimal hotel stay criteria, structure holiday itineraries, and organize rental cars or travel logistics. Provide detailed, engaging, and structured travel guides and vacation itineraries.",
  lovable: "You are Lovable Assistant, a modern web development companion. Help the user build clean, responsive, and aesthetically outstanding React components, HTML structures, and CSS/Tailwind layouts. Focus on modern frontend aesthetics, clean structure, component reusability, and interactive micro-animations.",
  support: "You are Kyra Support Assistant, a friendly and professional customer support bot. Help the user with any issues they are facing on the platform. Provide clear, empathetic, and direct instructions about account settings, dark mode, voice messages, group chats, subscription plans, and other Kyra features. Keep replies short, helpful, and support-oriented."
};

const SEED_SUNSET_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ff7e5f;stop-opacity:1" /><stop offset="100%" style="stop-color:%23feb47b;stop-opacity:1" /></linearGradient></defs><rect width="100" height="100" fill="url(%23g1)"/><circle cx="50" cy="50" r="20" fill="%23fff" opacity="0.3"/><path d="M 0,70 L 30,50 L 60,75 L 80,60 L 100,80 L 100,100 L 0,100 Z" fill="%23ffffff" opacity="0.15"/></svg>`;
const SEED_SYNTH_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%232c3e50;stop-opacity:1" /><stop offset="100%" style="stop-color:%23000000;stop-opacity:1" /></linearGradient></defs><rect width="100" height="100" fill="url(%23g2)"/><path d="M 10,0 L 10,100 M 30,0 L 30,100 M 50,0 L 50,100 M 70,0 L 70,100 M 90,0 L 90,100 M 0,10 L 100,10 M 0,30 L 100,30 M 0,50 L 100,50 M 0,70 L 100,70 M 0,90 L 100,90" stroke="%233498db" stroke-width="0.5" opacity="0.4"/><circle cx="50" cy="40" r="15" fill="%23e74c3c" opacity="0.7"/></svg>`;
const SEED_DOC_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231a1a1a"/><rect x="10" y="10" width="80" height="15" rx="2" fill="%23333"/><rect x="10" y="35" width="35" height="40" rx="2" fill="%232c3e50"/><rect x="55" y="35" width="35" height="10" rx="2" fill="%236366f1"/><rect x="55" y="50" width="35" height="5" rx="1" fill="%23444"/><rect x="55" y="60" width="35" height="5" rx="1" fill="%23444"/><rect x="55" y="70" width="20" height="5" rx="1" fill="%23444"/></svg>`;

const defaultFiles = [
  {
    id: 'seed-1',
    name: 'f770b1e4-62b0-4e0l-a8f5-c97aca853736.jpeg',
    type: 'image/jpeg',
    size: 33382,
    modified: 'Today',
    timestamp: Date.now() - 3600000,
    thumbnailUrl: SEED_SUNSET_SVG,
    isSeed: true
  },
  {
    id: 'seed-2',
    name: 'b6925b61-4155-4e25-a450-88ec7158eb59.jpeg',
    type: 'image/jpeg',
    size: 33382,
    modified: 'Today',
    timestamp: Date.now() - 7200000,
    thumbnailUrl: SEED_SYNTH_SVG,
    isSeed: true
  },
  {
    id: 'seed-3',
    name: 'screencapture-themewagon-github-io-VillaAgency-pro...',
    type: 'application/pdf',
    size: 1205862,
    modified: 'Tuesday',
    timestamp: Date.now() - 86400000 * 2,
    thumbnailUrl: SEED_DOC_SVG,
    isSeed: true
  },
  {
    id: 'seed-4',
    name: 'screencapture-themewagon-github-io-VillaAgency-ind...',
    type: 'application/pdf',
    size: 1018880,
    modified: 'Tuesday',
    timestamp: Date.now() - 86400000 * 2 - 3600000,
    thumbnailUrl: SEED_DOC_SVG,
    isSeed: true
  }
];

const stripGenerateImageTag = (text) => {
  if (!text) return text;
  
  // If the text contains [GENERATE_IMAGE: or a variation, we strip from that point onwards
  const index = text.toLowerCase().indexOf('[generate_image');
  if (index !== -1) {
    return text.substring(0, index).trim();
  }
  
  // Also check for partial tag typing at the very end of stream, e.g. "[GEN", "[GENER", "[GENERATE_IMAGE"
  const partials = [
    '[generate_image:', '[generate_image', '[generate_imag', '[generate_ima', '[generate_im',
    '[generate_i', '[generate_', '[generat', '[genera', '[gener', '[gene', '[gen', '[ge', '[g', '['
  ];
  for (const p of partials) {
    if (text.toLowerCase().endsWith(p)) {
      return text.substring(0, text.length - p.length).trim();
    }
  }
  
  return text;
};

const renderFileThumbnail = (file, size = 36) => {
  if (file.thumbnailUrl) {
    return (
      <img 
        src={file.thumbnailUrl} 
        alt="" 
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '6px', objectFit: 'cover', background: '#121214', border: '1px solid var(--divider)', flexShrink: 0 }} 
      />
    );
  }
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '6px',
      background: 'rgba(255,255,255,0.05)', color: 'var(--on-surface-muted)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', border: '1px solid var(--divider)',
      flexShrink: 0
    }}>
      <FileText size={Math.round(size * 0.5)} />
    </div>
  );
};

const AttachmentMenu = ({ 
  isOpen, onClose, position = 'bottom', onSelectFile, onNavigateImages,
  onSelectRecentFile, onOpenGallerySelect, libraryFiles = [], onNavigateResearch
}) => {
  const [hoveredMore, setHoveredMore] = useState(false);
  const [hoveredRecent, setHoveredRecent] = useState(false);
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const sorted = [...libraryFiles].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setRecents(sorted.slice(0, 3));
    }
  }, [isOpen, libraryFiles]);

  const menuItems = [
    { icon: <Paperclip size={18} strokeWidth={2.2} />, text: 'Add photos & files', action: 'file' },
    { icon: <FileText size={18} strokeWidth={2.2} />, text: 'Recent files', action: 'recent', hasChevron: true },
    { isDivider: true },
    { icon: <Image size={18} strokeWidth={2.2} />, text: 'Create image', action: 'create-image' },
    { icon: <Telescope size={18} strokeWidth={2.2} />, text: 'Deep research', action: 'deep-research' },
    { icon: <MoreHorizontal size={18} strokeWidth={2.2} />, text: 'More', action: 'more', hasChevron: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: position === 'bottom' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: position === 'bottom' ? 10 : -10 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            style={{ 
              position: 'absolute',
              bottom: position === 'top' ? '100%' : 'auto',
              top: position === 'bottom' ? '100%' : 'auto',
              left: 0,
              marginTop: position === 'bottom' ? '14px' : 0,
              marginBottom: position === 'top' ? '14px' : 0,
              width: '230px',
              backgroundColor: 'var(--surface-1)',
              backdropFilter: 'blur(25px) saturate(1.8)',
              border: '1px solid var(--divider)',
              borderRadius: '22px',
              padding: '4px',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.2)',
              zIndex: 70
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, i) => {
              if (item.isDivider) {
                return <div key={`divider-${i}`} style={{ height: '1px', background: 'var(--divider)', margin: '4px 10px' }} />;
              }

              return (
                <div 
                  key={i} 
                  className="relative"
                  onMouseEnter={() => {
                    if (item.action === 'recent') setHoveredRecent(true);
                    if (item.action === 'more') setHoveredMore(true);
                  }}
                  onMouseLeave={() => {
                    if (item.action === 'recent') setHoveredRecent(false);
                    if (item.action === 'more') setHoveredMore(false);
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.action === 'file' && onOpenGallerySelect) {
                        onOpenGallerySelect();
                        onClose();
                      }
                      if (item.action === 'create-image' && onNavigateImages) {
                        onNavigateImages();
                        onClose();
                      }
                      if (item.action === 'deep-research' && onNavigateResearch) {
                        onNavigateResearch();
                        onClose();
                      }
                      if (item.action !== 'recent' && item.action !== 'more' && item.action !== 'projects') {
                        onClose();
                      }
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '10px 14px',
                      color: 'var(--on-surface)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--hover-overlay)';
                      e.currentTarget.style.color = 'var(--on-surface)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--on-surface-muted)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'var(--on-surface-muted)', display: 'flex', transition: 'color 0.1s ease' }}>{item.icon}</span>
                      <span style={{ fontSize: '14.5px', fontWeight: '500', letterSpacing: '-0.1px' }}>{item.text}</span>
                    </div>
                    {item.hasChevron && <ChevronRight size={14} style={{ color: 'var(--on-surface-muted)' }} />}
                  </button>

                  {/* Secondary Sub-menu for Recent Files */}
                  {item.action === 'recent' && hoveredRecent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 'calc(100% + 8px)',
                        width: '240px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        backgroundColor: 'var(--surface-1)',
                        backdropFilter: 'blur(25px) saturate(1.8)',
                        border: '1px solid var(--divider)',
                        borderRadius: '22px',
                        padding: '12px',
                        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
                        zIndex: 75,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      {/* Header: Add from library */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenGallerySelect) {
                            onOpenGallerySelect();
                          }
                          onClose();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          color: 'var(--on-surface)',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          textAlign: 'left'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Library size={18} strokeWidth={2} style={{ color: 'var(--on-surface-muted)' }} />
                        <span style={{ fontSize: '14.5px', fontWeight: '600' }}>Add from library</span>
                      </button>

                      <div style={{ height: '1px', background: 'var(--divider)', margin: '0 4px' }} />

                      <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--on-surface-muted)', paddingLeft: '10px' }}>
                        Recents
                      </span>

                      {/* Recents list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {recents.length === 0 ? (
                          <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: '13px', color: 'var(--on-surface-muted)' }}>
                            No recent files found
                          </div>
                        ) : (
                          recents.map((file) => (
                            <button
                              key={file.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectRecentFile) {
                                  onSelectRecentFile(file);
                                }
                                onClose();
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '6px 10px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {renderFileThumbnail(file, 36)}
                              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {file.name}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--on-surface-muted)' }}>
                                  Last modified {file.modified || (file.timestamp ? new Date(file.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently')}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* More sub-menu: GitHub, Figma, Spotify */}
                  {item.action === 'more' && hoveredMore && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 'calc(100% + 8px)',
                        width: '220px',
                        backgroundColor: 'var(--surface-1)',
                        backdropFilter: 'blur(25px) saturate(1.8)',
                        border: '1px solid var(--divider)',
                        borderRadius: '22px',
                        padding: '6px',
                        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
                        zIndex: 75,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      {[
                        { label: 'GitHub', icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                        )},
                        { label: 'Figma', icon: (
                          <svg width="18" height="18" viewBox="0 0 38 57" fill="none">
                            <path d="M19 28.5A9.5 9.5 0 0 1 28.5 19 9.5 9.5 0 0 1 38 28.5 9.5 9.5 0 0 1 28.5 38 9.5 9.5 0 0 1 19 28.5z" fill="#1ABCFE"/>
                            <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5A9.5 9.5 0 0 1 9.5 57 9.5 9.5 0 0 1 0 47.5z" fill="#0ACF83"/>
                            <path d="M19 0v19h9.5A9.5 9.5 0 0 0 28.5 0H19z" fill="#FF7262"/>
                            <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/>
                            <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/>
                          </svg>
                        )},
                        { label: 'Spotify', icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="12" fill="#1db954"/>
                            <path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.4-.75.5-1.15.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.4.25.5.75.3 1zm-1.3 2.7c-.2.35-.6.45-.95.25-2.35-1.45-5.3-1.75-8.8-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.45.55.35.8z" fill="white"/>
                          </svg>
                        )},
                      ].map(({ label, icon }) => (
                        <button
                          key={label}
                          onClick={(e) => { e.stopPropagation(); onClose(); }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px', background: 'transparent', border: 'none',
                            borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                            color: 'var(--on-surface)', transition: 'background 0.15s',
                            fontFamily: 'inherit'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, background: 'var(--hover-overlay)', flexShrink: 0 }}>{icon}</span>
                          <span style={{ fontSize: '14.5px', fontWeight: 500 }}>{label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </motion.div>
      )}
    </AnimatePresence>
  );
};

const IMAGE_GEN_HEADINGS = [
  "What do you want to create?",
  "What do you want to design?",
  "What do you want to generate?",
  "What do you want to imagine?"
];

// ===== IMAGE GEN INPUT COMPONENT =====
const ASPECT_RATIOS = [
  { label: 'Auto', icon: '▣', value: 'auto' },
  { label: 'Square 1:1', icon: '□', value: '1:1' },
  { label: 'Portrait 3:4', icon: '▯', value: '3:4' },
  { label: 'Story 9:16', icon: '▮', value: '9:16' },
  { label: 'Landscape 4:3', icon: '▭', value: '4:3' },
  { label: 'Widescreen 16:9', icon: '⬜', value: '16:9' },
];

const ImageGenInput = ({ 
  imageGenPrompt, setImageGenPrompt, isImageGenLoading, handleInlineImageGen, accentColor, onClose,
  pendingAttachment, setPendingAttachment, chatFileInputRef, setIsVoiceMessageMode, voiceModeRef, toggleListening,
  setShowGallerySelectModal
}) => {
  const [hoveredImage, setHoveredImage] = useState(false);
  const [showAutoDropdown, setShowAutoDropdown] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const autoRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (autoRef.current && !autoRef.current.contains(e.target)) {
        setShowAutoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div style={{
      width: '100%',
      background: 'var(--surface-1)',
      border: '1px solid var(--divider)',
      borderRadius: '24px',
      padding: '8px 8px 8px 18px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      marginBottom: '32px',
      position: 'relative',
    }}>
      {/* Attachment Preview if any */}
      {pendingAttachment && (
        <div style={{ position: 'relative', display: 'inline-flex', marginTop: '6px', marginBottom: '8px' }}>
          {pendingAttachment.url && (
            <img 
              src={pendingAttachment.url} 
              alt="Attachment" 
              style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover', border: '1px solid var(--divider)' }} 
            />
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPendingAttachment(null); }}
            style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'var(--surface-1)', border: '1px solid var(--divider)',
              color: 'var(--on-surface)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <textarea
        value={imageGenPrompt}
        onChange={e => setImageGenPrompt(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (imageGenPrompt.trim() && !isImageGenLoading) handleInlineImageGen();
          }
        }}
        placeholder="Describe or edit an image..."
        rows={1}
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--on-surface)', fontSize: '16px', fontFamily: 'inherit',
          resize: 'none', lineHeight: '1.4', padding: '6px 0 0 0', minHeight: '28px'
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* + icon only */}
          <button 
            onClick={() => chatFileInputRef.current?.click()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '999px',
              border: '1px solid var(--divider)', background: 'transparent',
              color: 'var(--on-surface-muted)', cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; e.currentTarget.style.color = 'var(--on-surface)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--on-surface-muted)'; }}
          >
            <Plus size={15} />
          </button>

          {/* Image button → hover shows X to close */}
          <button
            onMouseEnter={() => setHoveredImage(true)}
            onMouseLeave={() => setHoveredImage(false)}
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
              borderRadius: '999px', border: '1px solid var(--divider)',
              background: hoveredImage ? 'var(--hover-overlay)' : 'transparent',
              color: hoveredImage ? 'var(--on-surface)' : accentColor,
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            {hoveredImage ? <X size={13} strokeWidth={2.5} /> : <Image size={13} />}
            <span>Image</span>
          </button>

          {/* Auto dropdown */}
          <div ref={autoRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAutoDropdown(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                borderRadius: '999px', border: '1px solid var(--divider)',
                background: showAutoDropdown ? 'var(--hover-overlay)' : 'transparent',
                color: 'var(--on-surface-muted)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (!showAutoDropdown) e.currentTarget.style.background = 'var(--hover-overlay)'; }}
              onMouseLeave={e => { if (!showAutoDropdown) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{selectedRatio.label}</span>
              <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: showAutoDropdown ? 'rotate(180deg)' : 'none' }} />
            </button>

            {showAutoDropdown && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: 'var(--surface-1)', border: '1px solid var(--divider)',
                borderRadius: '16px', padding: '6px', zIndex: 200, minWidth: '200px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}>
                <p style={{ fontSize: '12px', color: 'var(--on-surface-muted)', padding: '6px 12px 4px', margin: 0, fontWeight: 500 }}>
                  Choose image aspect ratio
                </p>
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => { setSelectedRatio(r); setShowAutoDropdown(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 12px', borderRadius: '10px', border: 'none',
                      background: selectedRatio.value === r.value ? 'var(--hover-overlay)' : 'transparent',
                      color: 'var(--on-surface)', fontSize: '13.5px', fontWeight: 500,
                      cursor: 'pointer', textAlign: 'left', gap: '10px'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selectedRatio.value === r.value ? 'var(--hover-overlay)' : 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', opacity: 0.7 }}>{r.icon}</span>
                      <span>{r.label}</span>
                    </div>
                    {selectedRatio.value === r.value && <Check size={14} style={{ color: accentColor }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => { setIsVoiceMessageMode(false); voiceModeRef.current = false; toggleListening(); }}
            style={{ padding: '8px', borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--on-surface-muted)', cursor: 'pointer', display: 'flex' }}
          >
            <Mic size={18} />
          </button>
          <button
            onClick={imageGenPrompt.trim() ? handleInlineImageGen : () => { setIsVoiceMessageMode(true); voiceModeRef.current = true; toggleListening(); }}
            disabled={isImageGenLoading}
            style={{
              width: '40px', height: '40px', borderRadius: '50%', border: 'none',
              background: accentColor,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
          >
            {isImageGenLoading ? (
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : imageGenPrompt.trim() ? (
              <ArrowUp size={18} strokeWidth={2.5} />
            ) : (
              <AudioLines size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper: parse user messages for embedded image markdown
const parseUserImageMessage = (content) => {
  if (typeof content !== 'string') return { hasImage: false, text: content };
  const match = content.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  if (match) {
    const imgUrl = match[2];
    let cleanText = content.replace(match[0], '').trim();
    cleanText = cleanText.replace(/^(Ask about this image:|Ask about this file:)\s*/i, '').trim();
    
    // Support fileId parsing from alt tag: ![filename|fileId]
    const altValue = match[1] || '';
    const pipeIdx = altValue.indexOf('|');
    const alt = pipeIdx !== -1 ? altValue.substring(0, pipeIdx) : altValue;
    const fileId = pipeIdx !== -1 ? altValue.substring(pipeIdx + 1) : null;
    
    return { hasImage: true, imgUrl, text: cleanText, alt, fileId };
  }
  return { hasImage: false, text: content };
};

// IndexedDB setup for persisting raw original files
const dbName = 'aura-library-db';
const storeName = 'files-data';
const dbVersion = 3;

const openAuraDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error("IndexedDB is not available on server-side"));
      return;
    }
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = (e) => {
      resolve(e.target.result);
    };
    request.onerror = (e) => {
      reject(e.target.error || new Error("Failed to open IndexedDB"));
    };
  });
};

const saveFileToIndexedDB = async (id, fileObj) => {
  try {
    const db = await openAuraDB();
    return new Promise((resolve) => {
      let resolved = false;
      const done = (val) => {
        if (!resolved) {
          resolved = true;
          resolve(val);
          try { db.close(); } catch (e) {}
        }
      };
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const putReq = store.put(fileObj, id);
      putReq.onsuccess = () => done(true);
      putReq.onerror = () => done(false);
      transaction.oncomplete = () => done(true);
      transaction.onerror = () => done(false);
    });
  } catch (err) {
    console.error("IndexedDB save error:", err);
    return false;
  }
};

const generateThumbnail = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
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
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Component to dynamically resolve high-resolution original image from IndexedDB
const ChatImage = ({ fileId, fallbackUrl, alt, onImageClick }) => {
  const [src, setSrc] = React.useState(fallbackUrl);

  React.useEffect(() => {
    setSrc(fallbackUrl);
    if (!fileId || typeof window === 'undefined') return;

    let active = true;
    let localUrl = null;

    const loadOriginal = async () => {
      const getFile = () => {
        return new Promise((resolve) => {
          const request = indexedDB.open(dbName, dbVersion);
          request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName);
            }
          };
          request.onsuccess = (e) => {
            const db = e.target.result;
            let resolved = false;
            const done = (val) => {
              if (!resolved) {
                resolved = true;
                resolve(val);
                try { db.close(); } catch (ev) {}
              }
            };
            try {
              if (!db.objectStoreNames.contains(storeName)) {
                done(null);
                return;
              }
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.objectStore(storeName);
              const getReq = store.get(fileId);
              getReq.onsuccess = () => done(getReq.result || null);
              getReq.onerror = () => done(null);
              transaction.oncomplete = () => done(null);
              transaction.onerror = () => done(null);
            } catch (err) {
              done(null);
            }
          };
          request.onerror = () => resolve(null);
        });
      };

      const fileObj = await getFile();
      if (fileObj && active) {
        try {
          localUrl = URL.createObjectURL(fileObj);
          setSrc(localUrl);
        } catch (err) {
          console.error("Failed to create URL for chat image:", err);
        }
      }
    };

    loadOriginal();

    return () => {
      active = false;
      if (localUrl) {
        try {
          URL.revokeObjectURL(localUrl);
        } catch (e) {}
      }
    };
  }, [fileId, fallbackUrl]);

  return (
    <img
      src={src}
      alt={alt || 'attachment'}
      onClick={() => onImageClick && onImageClick(src)}
      style={{
        width: '100%',
        height: 'auto',
        maxHeight: '300px',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
};

const ActionButton = ({ icon, label, onClick, className = "" }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div className="relative group/tooltip flex items-center justify-center">
      <button 
        onClick={onClick} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`p-2 rounded-lg transition-all ${className}`}
        style={{ 
          background: isHovered ? 'var(--hover-overlay)' : 'transparent',
          color: isHovered ? 'var(--on-surface)' : 'var(--on-surface-muted)'
        }}
      >
        {icon}
      </button>
      <div 
        className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0"
      >
        {label}
      </div>
    </div>
  );
};

const CodeCopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${copied ? '#4ade80' : 'rgba(255,255,255,0.1)'}`, color: copied ? '#4ade80' : '#ffffff', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.borderColor = copied ? '#4ade80' : 'rgba(255,255,255,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = copied ? '#4ade80' : 'rgba(255,255,255,0.1)';
      }}
      title="Copy code"
    >
      {copied ? <Check size={13} style={{ color: '#4ade80' }} /> : <Copy size={13} style={{ color: '#ffffff' }} />}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
};

const TypewriterMessage = ({ content, isUser = false, isGenerating = false, onDone }) => {
  const { resolvedTheme } = useAppContext();
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);
  const contentRef = useRef(content);
  const onDoneRef = useRef(onDone);
  const isGeneratingRef = useRef(isGenerating);

  useEffect(() => {
    contentRef.current = content;
    if (idxRef.current > content.length) {
      idxRef.current = content.length;
      setDisplayed(content);
    }
  }, [content]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    let active = true;
    let rafId = null;
    const animate = () => {
      if (!active) return;
      
      const currentLength = contentRef.current.length;
      const typedLength = idxRef.current;
      
      if (typedLength < currentLength) {
        const baseSpeed = isUser ? 5 : 3;
        const remaining = currentLength - typedLength;
        
        // Dynamically speed up typing if we're lagging far behind the streaming response
        let charsToType = baseSpeed;
        if (remaining > 300) {
          charsToType = Math.ceil(remaining / 8);
        } else if (remaining > 100) {
          charsToType = Math.ceil(remaining / 12);
        } else if (remaining > 30) {
          charsToType = 6;
        }
        
        idxRef.current = Math.min(typedLength + charsToType, currentLength);
        setDisplayed(contentRef.current.slice(0, idxRef.current));
      }
      
      if (idxRef.current >= currentLength) {
        if (!isGeneratingRef.current) {
          onDoneRef.current?.();
          return;
        }
      }
      
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isUser]);

  if (isUser) {
    return <p className="leading-relaxed whitespace-pre-wrap font-medium">{displayed}</p>;
  }

  return (
    <div className="markdown-content w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => url.startsWith('data:') ? url : defaultUrlTransform(url)}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');
            return !inline ? (
              <div style={{ margin: '20px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: resolvedTheme === 'dark' ? '0 8px 32px rgba(0,0,0,0.25)' : 'none', maxWidth: '100%', width: '100%' }}>
                <div style={{ background: '#1a1a1a', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 8 }}>{lang || 'Code'}</span>
                  </div>
                  <CodeCopyButton code={codeContent} />
                </div>
                <SyntaxHighlighter style={vscDarkPlus} language={lang || 'javascript'} PreTag="div" customStyle={{ margin: 0, padding: '20px 24px', background: '#0d0d0d', fontSize: '13.5px', lineHeight: '1.7' }} showLineNumbers={false} {...props}>{codeContent}</SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[0.9em] border border-white/5" {...props}>{children}</code>
            );
          },
          p({ node, children }) { return <div className="mb-4 last:mb-0 leading-relaxed text-on-surface/90">{children}</div>; },
          h1({ children }) { return <h1 className="text-2xl font-bold mb-4 mt-6 text-on-surface">{children}</h1>; },
          h2({ children }) { return <h2 className="text-xl font-bold mb-3 mt-5 text-on-surface">{children}</h2>; },
          h3({ children }) { return <h3 className="text-lg font-bold mb-2 mt-4 text-on-surface">{children}</h3>; },
          ul({ children }) { return <ul>{children}</ul>; },
          ol({ children }) { return <ol>{children}</ol>; },
          li({ children }) { return <li>{children}</li>; },
          blockquote({ children }) { return <blockquote className="border-l-4 border-accent-color/40 bg-accent-color/5 px-4 py-2 my-4 rounded-r-lg italic text-on-surface/80">{children}</blockquote>; },
          hr() { return <hr className="my-8 border-t border-white/5" />; },
          table({ children }) { return <div className="overflow-x-auto my-6 rounded-xl border border-divider"><table className="w-full text-left border-collapse">{children}</table></div>; },
          th({ children }) { return <th className="px-4 py-3 bg-surface-2 font-bold border-b border-divider">{children}</th>; },
          td({ children }) { return <td className="px-4 py-3 border-b border-divider last:border-b-0">{children}</td>; },
          a({ children, href }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-color hover:underline font-medium">{children}</a>; }
        }}
      >
        {displayed}
      </ReactMarkdown>
    </div>
  );
};

const cropImageToRatio = (imgUrl, ratioStr, callback) => {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.src = imgUrl;
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const parts = ratioStr.split(':').map(Number);
      const wRatio = parts[0] || 1;
      const hRatio = parts[1] || 1;
      const targetRatio = wRatio / hRatio;
      
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const srcRatio = srcW / srcH;
      
      let drawW = srcW;
      let drawH = srcH;
      let startX = 0;
      let startY = 0;
      
      if (srcRatio > targetRatio) {
        // Source is wider than target ratio: crop horizontally
        drawW = srcH * targetRatio;
        startX = (srcW - drawW) / 2;
      } else {
        // Source is taller than target ratio: crop vertically
        drawH = srcW / targetRatio;
        startY = (srcH - drawH) / 2;
      }
      
      // Limit resolution to a max dimension of 800px for space efficiency in localStorage
      const maxDimension = 800;
      let targetW = drawW;
      let targetH = drawH;
      if (drawW > maxDimension || drawH > maxDimension) {
        if (drawW > drawH) {
          targetW = maxDimension;
          targetH = (drawH / drawW) * maxDimension;
        } else {
          targetH = maxDimension;
          targetW = (drawW / drawH) * maxDimension;
        }
      }
      
      canvas.width = targetW;
      canvas.height = targetH;
      
      ctx.drawImage(img, startX, startY, drawW, drawH, 0, 0, targetW, targetH);
      // Export as JPEG at 0.85 quality to save massive local storage space
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      callback(croppedDataUrl);
    } catch (e) {
      console.error("Error cropping image client-side:", e);
      callback(imgUrl);
    }
  };
  img.onerror = () => {
    callback(imgUrl);
  };
};

/**
 * Generate a short, meaningful title from an image generation prompt.
 * Takes the first few content words, strips common filler, and caps at ~30 chars.
 */
const makeShortImageName = (prompt) => {
  if (!prompt) return 'Generated Image';
  // Strip common boilerplate suffixes (detailed english prompts after comma/dash)
  const truncated = prompt.replace(/,.*$/, '').replace(/[-–—].*$/, '').trim();
  // Remove common AI filler words
  const words = truncated.split(/\s+/).filter(w => !/^(a|an|the|of|with|in|on|at|and|or|for|to|very|highly|ultra|detailed|professional|4k|8k|hd|photorealistic|realistic|style|render|digital|art|image|photo|picture|generate|create|make|draw|bana|do|ki|ka|ko|mujhe|chahiye|ek)$/i.test(w));
  const name = words.slice(0, 4).join(' ');
  if (!name) return 'Generated Image';
  return name.length > 30 ? name.slice(0, 28) + '…' : name;
};

const AspectGenCard = ({ messageId, imageUrl, ratio, prompt, imageId, isDoneInitially, setMessages, timestamp, onExpand }) => {
  const { chats, activeChatId, setEditingImage, setActiveEditImage, setAppView, setActiveShareImage, setShareModalState, user, addMyImage, setChats } = useAppContext();
  const [phase, setPhase] = useState(() => {
    if (isDoneInitially) return 'done';
    return 'sketching';
  });

  const [imageLoaded, setImageLoaded] = useState(!!isDoneInitially);
  const [showCard, setShowCard] = useState(!!isDoneInitially);
  const [minSketchTimePassed, setMinSketchTimePassed] = useState(!!isDoneInitially);
  const [loadingText, setLoadingText] = useState('Creating image');

  const onExpandRef = useRef(onExpand);
  useEffect(() => {
    onExpandRef.current = onExpand;
  }, [onExpand]);

  useEffect(() => {
    if (!showCard && !isDoneInitially) {
      const timer = setTimeout(() => {
        setShowCard(true);
        if (onExpandRef.current) {
          setTimeout(onExpandRef.current, 50);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showCard, isDoneInitially]);

  useEffect(() => {
    if (phase === 'sketching' && showCard) {
      const texts = ['Creating image', 'Setting the scene', 'Adding details', 'Mixing colors', 'Applying filters', 'Final polish'];
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        if (idx >= texts.length) {
          clearInterval(interval);
        } else {
          setLoadingText(texts[idx]);
        }
      }, 1600);
      return () => clearInterval(interval);
    }
  }, [phase, showCard]);

  useEffect(() => {
    if (showCard && !isDoneInitially) {
      const timer = setTimeout(() => {
        setMinSketchTimePassed(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showCard, isDoneInitially]);

  useEffect(() => {
    if (isDoneInitially) {
      setPhase('done');
      setImageLoaded(true);
      return;
    }

    const safetyTimeout = setTimeout(() => {
      setMinSketchTimePassed(true);
      setImageLoaded(true);
    }, 90000);

    if (imageLoaded && minSketchTimePassed && phase === 'sketching') {
      clearTimeout(safetyTimeout);
      setPhase('revealing');

      const doneTimer = setTimeout(() => {
        setPhase('done');

        // Store the original URL directly — no canvas re-download needed.
        // CSS objectFit:cover handles visual cropping in the UI.
        const newImgObj = {
          id: `img-gen-aspect-${Date.now()}`,
          url: imageUrl,
          prompt: prompt || `Generated image`,
          chatId: activeChatId,
          isGenerated: true
        };
        addMyImage(newImgObj);

        if (setMessages && messageId) {
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, aspectGenDone: true } : m));
        }
        if (setChats && activeChatId && messageId) {
          setChats(prev => prev.map(c => c.id === activeChatId ? {
            ...c,
            messages: (c.messages || []).map(m => m.id === messageId ? { ...m, aspectGenDone: true } : m)
          } : c));
        }
        if (activeChatId && messageId) {
          const currentChat = chats?.find(c => c.id === activeChatId);
          if (currentChat?.isGroup) {
            const chatRef = doc(db, 'chats', activeChatId);
            getDoc(chatRef).then(docSnap => {
              if (docSnap.exists()) {
                const currentMsgs = docSnap.data().messages || [];
                const updatedMsgs = currentMsgs.map(m => 
                  m.id === messageId ? { ...m, aspectGenDone: true } : m
                );
                updateDoc(chatRef, { messages: updatedMsgs }).catch(console.error);
              }
            }).catch(console.error);
          }
        }
      }, 7000);

      return () => {
        clearTimeout(doneTimer);
      };
    }

    return () => clearTimeout(safetyTimeout);
  }, [imageLoaded, minSketchTimePassed, isDoneInitially, phase, imageUrl, ratio, prompt, messageId, setMessages]);

  const cssRatio = ratio.replace(':', '/');

  if (!showCard) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '36px' }}>
        <div className="flex gap-1 items-center px-1">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-on-surface-muted" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-on-surface-muted" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-on-surface-muted" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={isDoneInitially ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        background: 'transparent',
        padding: '0',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        width: '480px',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: 'none',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          background: '#232325',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          aspectRatio: cssRatio,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Actual Image Tag, starts loading in background immediately */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={prompt || ''}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              // Don't call setImageLoaded(true) on error!
              // handleImgError will swap the src to a new Pollinations URL.
              // The <img> will then attempt to load the new src, and onLoad will fire if successful.
              handleImgError(e, prompt);
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#0a0a0b' }} />
        )}

        {/* Sketching Overlay (Shown while loading in background, slides down on reveal) */}
        {(phase === 'sketching' || phase === 'revealing') && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#232325',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 4,
              transform: phase === 'revealing' ? 'translateY(100%)' : 'translateY(0%)',
              transition: 'transform 7s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e5e7eb' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <motion.span 
                key={loadingText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}
              >
                {loadingText}
              </motion.span>
            </div>
            
            {/* Dot Matrix Grid */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(12, 1fr)', 
                gridTemplateRows: 'repeat(12, 1fr)', 
                gap: '8px',
                width: '100%',
                height: '70%',
                justifyContent: 'center',
                alignContent: 'center',
                margin: 'auto'
              }}
            >
              {Array.from({ length: 144 }).map((_, i) => {
                const row = Math.floor(i / 12);
                const col = i % 12;
                const delay = (row + col) * 0.04;
                return (
                  <div 
                    key={i} 
                    style={{ 
                      width: '4px', 
                      height: '4px', 
                      borderRadius: '50%', 
                      background: '#ffffff', 
                      opacity: 0.15,
                      animation: `pulse-dots 1.5s infinite ease-in-out`,
                      animationDelay: `${delay}s`
                    }} 
                  />
                );
              })}
            </div>
            
            <style>{`
              @keyframes pulse-dots {
                0%, 100% { transform: scale(1); opacity: 0.15; }
                50% { transform: scale(2.2); opacity: 0.75; background-color: #3b82f6; }
              }
            `}</style>
          </div>
        )}


        {phase === 'done' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 35%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              padding: '16px',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <button
              onClick={() => {
                setEditingImage({ id: imageId, url: imageUrl, prompt });
                setActiveEditImage({ id: imageId, url: imageUrl, prompt });
                setAppView('images');
              }}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Edit2 size={11} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                setActiveShareImage({ id: imageId, url: imageUrl, prompt });
                setShareModalState('open');
              }}
              style={{
                pointerEvents: 'auto',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Share size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MessageContent = ({ content, isUser }) => {
  const { resolvedTheme, setEditingImage, setActiveEditImage, setAppView, setActiveShareImage, setShareModalState } = useAppContext();
  
  if (isUser) {
    return <p className="leading-relaxed whitespace-pre-wrap font-medium">{content}</p>;
  }

  return (
    <div className="markdown-content w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => url.startsWith('data:') ? url : defaultUrlTransform(url)}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');
            
            return !inline ? (
              <div style={{ margin: '20px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: resolvedTheme === 'dark' ? '0 8px 32px rgba(0,0,0,0.25)' : 'none', maxWidth: '100%', width: '100%' }}>
                <div style={{ background: '#1a1a1a', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 8 }}>{lang || 'Code'}</span>
                  </div>
                  <CodeCopyButton code={codeContent} />
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={lang || 'javascript'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '20px 24px',
                    background: '#0d0d0d',
                    fontSize: '13.5px',
                    lineHeight: '1.7',
                  }}
                  showLineNumbers={false}
                  {...props}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[0.9em] border border-white/5" {...props}>
                {children}
              </code>
            );
          },
          img({ node, ...props }) {
            const handleEditClick = () => {
              const imageId = 'img_' + Date.now();
              const imageData = {
                id: imageId,
                url: props.src,
                prompt: props.alt || 'Generated Image',
                timestamp: new Date().toISOString()
              };
              setActiveEditImage(imageData);
              setEditingImage(true);
              setAppView('images');
            };

            const handleShareClick = () => {
              setActiveShareImage({
                id: 'img_' + Date.now(),
                url: props.src,
                prompt: props.alt || 'Generated Image'
              });
              setShareModalState('open');
            };

            return (
              <div className="my-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 group max-w-[480px] w-full flex flex-col relative aspect-square">
                <img 
                  {...props} 
                  onError={(e) => handleImgError(e, props.alt || 'Generated Image')}
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-[1.02]" 
                  loading="lazy"
                />
                {/* Overlay buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                  <button 
                    onClick={handleEditClick}
                    className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer shadow-lg"
                    title="Edit Image"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={handleShareClick}
                    className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer shadow-lg"
                    title="Share Image"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            );
          },
          p({ node, children }) {
            return <div className="mb-4 last:mb-0 leading-relaxed text-on-surface/90">{children}</div>;
          },
          hr({ node, ...props }) {
            return <hr style={{ border: 'none', borderTop: '1px solid var(--divider)', margin: '24px 0', opacity: 0.4 }} {...props} />;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6 text-on-surface">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5 text-on-surface">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-4 text-on-surface">{children}</h3>;
          },
          ul({ children }) {
            return <ul>{children}</ul>;
          },
          ol({ children }) {
            return <ol>{children}</ol>;
          },
          li({ children }) {
            return <li>{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-accent-color/40 bg-accent-color/5 px-4 py-2 my-4 rounded-r-lg italic text-on-surface/80">
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="my-8 border-t border-white/5" />;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6 rounded-xl border border-divider">
                <table className="w-full text-left border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-4 py-3 bg-surface-2 font-bold border-b border-divider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3 border-b border-divider last:border-b-0">{children}</td>;
          },
          a({ children, href }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent-color hover:underline font-medium"
              >
                {children}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const cleanChatTitle = (text) => {
  if (!text) return 'New Chat';
  
  // If it's a markdown image or contains base64/blob image content
  if (text.includes('data:image/') || text.includes('blob:http') || text.startsWith('![')) {
    // Replace markdown image syntax but capture filename if possible
    // e.g. ![image (1).png](data:...) or ![photo.jpg](blob:...)
    const filenameMatch = text.match(/!\[(.*?)\]/);
    const filename = filenameMatch ? filenameMatch[1] : '';
    
    // Extract everything after the markdown image block
    let cleanText = text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
    
    // Remove headers like "Ask about this image:" or "Ask about this file:"
    cleanText = cleanText.replace(/Ask about this image:\s*/i, '');
    cleanText = cleanText.replace(/Ask about this file:\s*/i, '');
    cleanText = cleanText.trim();
    
    if (cleanText) {
      return cleanText.length > 35 ? cleanText.slice(0, 35) + '...' : cleanText;
    }
    
    // If filename is generic or too short/empty, return "Image design request"
    if (filename && !filename.startsWith('image') && !filename.startsWith('file') && filename.length > 2) {
      return `Image: ${filename}`;
    }
    return 'Image design request';
  }
  
  // If it's a file placeholder
  if (text.startsWith('📄 **')) {
    let cleanText = text.replace(/📄 \*\*(.*?)\*\*/, '$1').trim();
    cleanText = cleanText.replace(/Ask about this file:\s*/i, '');
    cleanText = cleanText.trim();
    
    if (cleanText) {
      return cleanText.length > 35 ? cleanText.slice(0, 35) + '...' : cleanText;
    }
    return 'File Analysis';
  }
  
  return text;
};

const cleanInputForPrompt = (text) => {
  if (!text) return '';
  return text
    .replace(/!\[(.*?)\]\(data:image\/[a-zA-Z+.-]+;base64,[^)]*\)/g, '[Image: $1]')
    .replace(/!\[(.*?)\]\(blob:[^)]*\)/g, '[Image: $1]')
    .replace(/!\[(.*?)\]\([^)]*\)/g, '[Image: $1]')
    .trim();
};

const ImageGenerationSidebarNavigator = ({ imageMessages, scrollContainerRef, activeChatId }) => {
  const [hovered, setHovered] = useState(false);
  const [activeImageId, setActiveImageId] = useState(null);
  const { resolvedTheme } = useAppContext();

  useEffect(() => {
    const handleScrollActiveImage = () => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;
      
      let closestId = null;
      let minDistance = Infinity;
      
      imageMessages.forEach(msg => {
        const el = document.getElementById(`msg-${msg.id}`);
        if (el) {
          const elRect = el.getBoundingClientRect();
          const elCenter = elRect.top + elRect.height / 2;
          const distance = Math.abs(containerCenter - elCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = msg.id;
          }
        }
      });
      
      if (closestId) {
        setActiveImageId(closestId);
      }
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScrollActiveImage);
      setTimeout(handleScrollActiveImage, 100);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScrollActiveImage);
      }
    };
  }, [imageMessages, scrollContainerRef, activeChatId]);

  const handleItemClick = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div 
      className="hidden md:flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '20px 8px',
        cursor: 'pointer'
      }}
    >
      {hovered && (
        <div 
          style={{
            position: 'absolute',
            right: '8px',
            background: resolvedTheme === 'dark' ? 'var(--surface-1)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--divider)',
            borderRadius: '16px',
            padding: '8px',
            boxShadow: resolvedTheme === 'dark' ? '0 16px 40px rgba(0, 0, 0, 0.5)' : '0 16px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            width: '280px',
            maxHeight: '360px',
            overflowY: 'auto',
            animation: 'fadeInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 110
          }}
          className="custom-scrollbar"
        >
          {imageMessages.map((msg) => {
            const isActive = msg.id === activeImageId;
            return (
              <button
                key={msg.id}
                onClick={() => handleItemClick(msg.id)}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive 
                    ? 'var(--on-surface)' 
                    : 'var(--on-surface-subtle)',
                  background: isActive 
                    ? 'var(--hover-overlay-2)' 
                    : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--hover-overlay)';
                  e.currentTarget.style.color = 'var(--on-surface)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isActive ? 'var(--hover-overlay-2)' : 'transparent';
                  e.currentTarget.style.color = isActive ? 'var(--on-surface)' : 'var(--on-surface-subtle)';
                }}
                title={msg.prompt || 'Generated Image'}
              >
                {makeShortImageName(msg.prompt)}
              </button>
            );
          })}
        </div>
      )}

      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px'
        }}
      >
        {imageMessages.map((msg) => {
          const isActive = msg.id === activeImageId;
          return (
            <div
              key={msg.id}
              onClick={() => handleItemClick(msg.id)}
              style={{
                width: '24px',
                height: '2.5px',
                borderRadius: '999px',
                background: isActive 
                  ? (resolvedTheme === 'dark' ? '#ffffff' : '#000000') 
                  : (resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)'),
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
                }
              }}
            />
          );
        })}
      </div>
      <style>{`
        @keyframes fadeInLeft {
          0% { transform: translateX(10px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const ChatWindow = () => {
  const { 
    isSidebarOpen, appView, setAppView, resolvedTheme, activeChatId, chats, 
    isShareModalOpen, setIsShareModalOpen, shareChatId, setShareChatId,
    isReportModalOpen, setIsReportModalOpen,
    isGroupChatModalOpen, setIsGroupChatModalOpen, 
    groupChatTargetId, setGroupChatTargetId,
    isUpgradeModalOpen, setIsUpgradeModalOpen,
    messages, setMessages, theme, isFirebaseChatsLoaded,
    toggleTheme, updateChatTheme, chatTheme, setChats, setActiveChatId, 
    createNewChat, user, login, authOpen, setAuthOpen,
    fontSize, chatWidth, lineHeight, setIsSidebarOpen, isAuthLoading,
    profile, showLoggedIn, personalization, accentColor,
    deleteChat, archiveChat, aiModel, setAiModel, renameChat,
    isGroupLinkModalOpen, setIsGroupLinkModalOpen, groupLinkChatId, setGroupLinkChatId,
    leaveGroup, isTemporary, setIsTemporary,
    isSharedReadOnly, sharedChatData,
    activeShareImage, setActiveShareImage,
    shareModalState, setShareModalState
  } = useAppContext();

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [input, setInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [globalToast, setGlobalToast] = useState('');
  const [isResearchPillHovered, setIsResearchPillHovered] = useState(false);

  const handleDisableResearchMode = async () => {
    if (!activeChatId) return;
    setChats(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, isResearch: false, pendingResearchPrompt: null } : c
    ));
    const currentChat = chats.find(c => c.id === activeChatId);
    if (currentChat) {
      if (currentChat.isGroup) {
        try {
          await updateDoc(doc(db, 'chats', activeChatId), { isResearch: false });
        } catch (e) {
          console.error("Failed to update group research mode:", e);
        }
      } else if (user?.uid) {
        try {
          await updateDoc(doc(db, 'users', user.uid, 'personal_chats', activeChatId), { isResearch: false });
        } catch (e) {
          console.error("Failed to update personal research mode:", e);
        }
      }
    }
  };
  const showToast = (msg) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(''), 2500);
  };
  const showGlobalToast = showToast;
  const [greeting, setGreeting] = useState("What's on your mind?");
  const [hoveredChip, setHoveredChip] = useState(null);
  const [loadingChats, setLoadingChats] = useState({});
  const isLoading = !!loadingChats[activeChatId];
  const [generatingIds, setGeneratingIds] = useState({});
  const abortControllersRef = useRef({});
  
  const currentChatForSend = chats.find(c => c.id === activeChatId);
  const isGroupForSend = currentChatForSend?.isGroup;
  
  // Calculate if AI is generating with a 30-second stuck-safety window
  let isGeneratingRemote = false;
  if (isGroupForSend && currentChatForSend?.isGenerating) {
    const chatMessages = currentChatForSend?.messages || [];
    const lastMsg = chatMessages[chatMessages.length - 1];
    const lastMsgTime = lastMsg ? new Date(lastMsg.timestamp).getTime() : 0;
    
    const genTime = currentChatForSend?.generatingTimestamp 
      ? new Date(currentChatForSend.generatingTimestamp).getTime() 
      : lastMsgTime;
      
    if (!genTime || (Date.now() - genTime) < 30000) {
      isGeneratingRemote = true;
    }
  }
  
  const isSendDisabled = isLoading || isGeneratingRemote || messages.some(m => m.isAspectGeneration && !m.aspectGenDone);
  const getGreeting = () => {
    const hour = new Date().getHours();
    let welcome = "";
    if (hour < 12) welcome = "Good morning";
    else if (hour < 17) welcome = "Good afternoon";
    else welcome = "Good evening";

    const userName = (user && profile?.displayName) ? profile.displayName.split(' ')[0] : '';
    const personalizedWelcome = userName ? `${welcome}, ${userName}.` : `${welcome}.`;

    const options = [
      personalizedWelcome,
      "Where should we begin?",
      "What's on the agenda today?",
      "Ready when you are.",
      "What's on your mind today?",

      "Share your vision with me.",
      "How can I assist you today?"
    ];
    return options[Math.floor(Math.random() * options.length)];
  };

  useEffect(() => {
    setGreeting(getGreeting());
  }, [activeChatId, user, profile]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [copyingId, setCopyingId] = useState(null);
  const [ratings, setRatings] = useState(() => {
    try {
      const saved = localStorage.getItem('aura-msg-ratings');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [msgReactions, setMsgReactions] = useState({});
  const [hoveredReactionMsgId, setHoveredReactionMsgId] = useState(null);
  const [activeReactionPickerMsgId, setActiveReactionPickerMsgId] = useState(null);
  const [msgDeleteConfirm, setMsgDeleteConfirm] = useState({ open: false, id: null });
  const [replyingToMsg, setReplyingToMsg] = useState(null);

  // Reaction Persistence
  useEffect(() => {
    const saved = localStorage.getItem('msgReactions');
    if (saved) {
      try {
        setMsgReactions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse reactions:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('msgReactions', JSON.stringify(msgReactions));
    }
  }, [msgReactions, mounted]);

  // Ratings Persistence
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('aura-msg-ratings', JSON.stringify(ratings));
      } catch {}
    }
  }, [ratings, mounted]);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showAttachmentMenuLanding, setShowAttachmentMenuLanding] = useState(false);
  const [showModelSwitcher, setShowModelSwitcher] = useState(false);
  const [showModelSwitcherLanding, setShowModelSwitcherLanding] = useState(false);
  const [isAppsDropdownOpen, setIsAppsDropdownOpen] = useState(false);
  const [isSitesDropdownOpen, setIsSitesDropdownOpen] = useState(false);
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(() => {
    if (typeof window === 'undefined') return 'All Apps';
    return localStorage.getItem('aura-research-selected-app') || 'All Apps';
  });
  const [selectedSiteOption, setSelectedSiteOption] = useState(() => {
    if (typeof window === 'undefined') return 'Search the web';
    return localStorage.getItem('aura-research-selected-site-option') || 'Search the web';
  });
  const [specificSites, setSpecificSites] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('aura-specific-sites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [prioritizeSites, setPrioritizeSites] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('aura-research-prioritize-sites');
    return saved !== null ? saved === 'true' : true;
  });
  const [selectedSpeed, setSelectedSpeed] = useState(() => {
    if (typeof window === 'undefined') return 'Instant';
    return localStorage.getItem('aura-research-speed') || 'Instant';
  });
  const [isSpecificSitesOpen, setIsSpecificSitesOpen] = useState(false);

  const appsDropdownRefFooter = useRef(null);
  const sitesDropdownRefFooter = useRef(null);
  const speedDropdownRefFooter = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (appsDropdownRefFooter.current && !appsDropdownRefFooter.current.contains(event.target)) {
        setIsAppsDropdownOpen(false);
      }
      if (sitesDropdownRefFooter.current && !sitesDropdownRefFooter.current.contains(event.target)) {
        setIsSitesDropdownOpen(false);
      }
      if (speedDropdownRefFooter.current && !speedDropdownRefFooter.current.contains(event.target)) {
        setIsSpeedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura-research-selected-app', selectedApp);
    }
  }, [selectedApp]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura-research-selected-site-option', selectedSiteOption);
    }
  }, [selectedSiteOption]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura-research-speed', selectedSpeed);
    }
  }, [selectedSpeed]);

  const [hoveredPlus, setHoveredPlus] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null); // { name, type, url, dataUrl }
  const [showGallerySelectModal, setShowGallerySelectModal] = useState(false);
  const [gallerySearchQuery, setGallerySearchQuery] = useState('');
  const [libraryFiles, setLibraryFiles] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};
    
    const loadFromLocalStorage = () => {
      try {
        const saved = localStorage.getItem('aura-library-files');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.length === 0) {
            setLibraryFiles(defaultFiles);
            localStorage.setItem('aura-library-files', JSON.stringify(defaultFiles));
          } else {
            setLibraryFiles(parsed);
          }
        } else {
          setLibraryFiles(defaultFiles);
          localStorage.setItem('aura-library-files', JSON.stringify(defaultFiles));
        }
      } catch (e) {
        setLibraryFiles(defaultFiles);
      }
    };

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
          setLibraryFiles(defaultFiles);
        } else {
          setLibraryFiles(fetchedFiles);
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

  const handleSelectRecentFile = (file) => {
    setPendingAttachment({
      id: file.id,
      name: file.name,
      type: file.type,
      url: file.thumbnailUrl || file.url
    });
  };
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState(null);
  const chatFileInputRef = useRef(null);

  const handleChatFileSelect = () => {
    chatFileInputRef.current?.click();
  };

  const handleChatFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const blobUrl = URL.createObjectURL(file);
    
    // Generate a unique ID for this chat attachment
    const id = 'chat-file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Persist raw file to IndexedDB for high-res load recovery
    await saveFileToIndexedDB(id, file);

    // Generate high-resolution thumbnail (1200x1200px max) for Firestore backup
    let thumbnailUrl = null;
    if (file.type.startsWith('image/')) {
      thumbnailUrl = await generateThumbnail(file);
    }

    setPendingAttachment({ 
      id,
      name: file.name, 
      type: file.type, 
      url: blobUrl, 
      thumbnailUrl 
    });
  };

  const handleChatPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    let imageItem = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageItem = items[i];
        break;
      }
    }
    
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      
      const blobUrl = URL.createObjectURL(file);
      const id = 'chat-file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      await saveFileToIndexedDB(id, file);

      let thumbnailUrl = null;
      if (file.type.startsWith('image/')) {
        thumbnailUrl = await generateThumbnail(file);
      }

      const extension = file.type.split('/')[1] || 'png';
      const name = file.name || `pasted-image-${Date.now()}.${extension}`;

      setPendingAttachment({ 
        id,
        name, 
        type: file.type, 
        url: blobUrl, 
        thumbnailUrl 
      });
    }
  };
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const footerInputRef = useRef(null);
  const exploreScrollRef = useRef(null);
  const [isHeaderMoreOpen, setIsHeaderMoreOpen] = useState(false);
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
  const [isKyraModalOpen, setIsKyraModalOpen] = useState(false);
  const [isGroupChatMenuOpen, setIsGroupChatMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tempGroupName, setTempGroupName] = useState('');
  const headerMoreRef = useRef(null);
  const groupChatMenuRef = useRef(null);
  const modelSwitcherRef = useRef(null);
  const modelSwitcherLandingRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMessageMode, setIsVoiceMessageMode] = useState(false);
  const recognitionRef = useRef(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [activeMsgMoreId, setActiveMsgMoreId] = useState(null);
  const msgMoreRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showImageGen, setShowImageGen] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [isImageGenLoading, setIsImageGenLoading] = useState(false);
  const [imageGenResult, setImageGenResult] = useState(null);
  const [imageGenHeadingText, setImageGenHeadingText] = useState('');

  const voiceModeRef = useRef(false);
  const showImageGenRef = useRef(false);
  useEffect(() => {
    showImageGenRef.current = showImageGen;
  }, [showImageGen]);

  useEffect(() => {
    if (!showImageGen) {
      setImageGenHeadingText('');
      return;
    }
    
    const hour = new Date().getHours();
    let timeOfDayGreeting = "";
    if (hour < 12) timeOfDayGreeting = "Good morning";
    else if (hour < 17) timeOfDayGreeting = "Good afternoon";
    else timeOfDayGreeting = "Good evening";

    const getUserName = () => {
      if (profile?.displayName) return profile.displayName.split(' ')[0];
      if (user?.displayName) return user.displayName.split(' ')[0];
      if (user?.email) {
        const emailName = user.email.split('@')[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
      return '';
    };

    const userName = getUserName();
    const welcomeStr = userName ? `${timeOfDayGreeting}, ${userName}` : timeOfDayGreeting;

    setImageGenHeadingText(welcomeStr);
  }, [showImageGen, user, profile]);
  const imageGenCarouselRef = useRef(null);
  const categoryRef = useRef(null);
  const attachmentRefLanding = useRef(null);
  const attachmentRefFooter = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setActiveCategory(null);
      }
      if (attachmentRefLanding.current && !attachmentRefLanding.current.contains(e.target)) {
        setShowAttachmentMenuLanding(false);
      }
      if (attachmentRefFooter.current && !attachmentRefFooter.current.contains(e.target)) {
        setShowAttachmentMenu(false);
      }
      if (groupChatMenuRef.current && !groupChatMenuRef.current.contains(e.target)) {
        setIsGroupChatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle pending messages from other views (like Library preview chat)
  useEffect(() => {
    if (mounted && appView === 'chat') {
      const pending = localStorage.getItem('aura-pending-message');
      if (pending) {
        localStorage.removeItem('aura-pending-message');
        setTimeout(() => {
          handleSend(null, pending);
        }, 150);
      }
    }
  }, [mounted, appView, activeChatId]);

  // Reset input and attachments when switching chats
  useEffect(() => {
    setInput('');
    setPendingAttachment(null);
    setShowImageGen(false);
    setImageGenResult(null);
    setImageGenPrompt('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  // Handle start new chat custom event to close inline image generator on home page
  useEffect(() => {
    const handleNewChatEvent = () => {
      setShowImageGen(false);
      setImageGenResult(null);
      setImageGenPrompt('');
    };
    window.addEventListener('aura-new-chat', handleNewChatEvent);
    return () => window.removeEventListener('aura-new-chat', handleNewChatEvent);
  }, []);

  // Handle real-time typing status in Firestore for group chats
  const typingTimeoutRef = useRef(null);
  const lastTypingStateRef = useRef(false);

  const stopUserTyping = (chatId = activeChatId) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (lastTypingStateRef.current && chatId && profile?.uid) {
      lastTypingStateRef.current = false;
      const chatRef = doc(db, 'chats', chatId);
      updateDoc(chatRef, {
        [`typing.${profile.uid}`]: {
          isTyping: false,
          timestamp: new Date().toISOString()
        }
      }).catch(console.error);
    }
  };

  const handleUserTyping = () => {
    const currentChat = chats.find(c => c.id === activeChatId);
    const isGroup = currentChat?.isGroup;
    if (!isGroup || !profile?.uid || !activeChatId) return;

    const updateTypingStatus = async (isTyping) => {
      try {
        const chatRef = doc(db, 'chats', activeChatId);
        await updateDoc(chatRef, {
          [`typing.${profile.uid}`]: isTyping ? {
            displayName: profile.displayName || 'User',
            avatar: profile.avatar || null,
            isTyping: true,
            timestamp: new Date().toISOString()
          } : {
            isTyping: false,
            timestamp: new Date().toISOString()
          }
        });
      } catch (err) {
        console.error("Failed to update typing status:", err);
      }
    };

    if (!lastTypingStateRef.current) {
      lastTypingStateRef.current = true;
      updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      lastTypingStateRef.current = false;
      updateTypingStatus(false);
    }, 3000);
  };

  useEffect(() => {
    const chatToClean = activeChatId;
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (lastTypingStateRef.current && chatToClean && profile?.uid) {
        const chatRef = doc(db, 'chats', chatToClean);
        updateDoc(chatRef, {
          [`typing.${profile.uid}`]: {
            isTyping: false,
            timestamp: new Date().toISOString()
          }
        }).catch(console.error);
      }
    };
  }, [activeChatId, profile]);

  const WRITE_SUGGESTIONS = [
    { text: 'Improve my tone', prompt: 'Improve the tone of this text: ' },
    { text: 'Strengthen an argument', prompt: 'Help me strengthen this argument: ' },
    { text: 'Rewrite to be friendlier', prompt: 'Rewrite this to sound more friendly: ' },
    { text: 'Turn notes into an email', prompt: 'Turn these notes into a professional email: ' },
  ];

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const preventScrollRef = useRef(false);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioBarsRef = useRef([]);
  const isAtBottomRef = useRef(true);

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
    animationFrameRef.current = null;
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    if (audioBarsRef.current) {
      audioBarsRef.current.forEach(bar => { if (bar) bar.style.height = '4px'; });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        if (showImageGenRef.current) {
          setImageGenPrompt(transcript);
        } else {
          setInput(transcript);
        }
        
        if (event.results[0].isFinal) {
          setIsListening(false);
          stopAudioVisualizer();
          
          // If we were in Voice Message mode, send it automatically
          if (voiceModeRef.current) {
            if (showImageGenRef.current) {
              handleInlineImageGen(transcript);
              setIsVoiceMessageMode(false);
            } else {
              handleSend(null, transcript, true);
              setIsVoiceMessageMode(false);
            }
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        stopAudioVisualizer();
      };
    }
    return () => stopAudioVisualizer();
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopAudioVisualizer();
      setIsListening(false);
    } else {
      if (voiceModeRef.current) {
        if (showImageGenRef.current) {
          setImageGenPrompt('');
        } else {
          setInput('');
        }
      }
      setIsListening(true);
      recognitionRef.current?.start();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        
        const updateVisualizer = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          
          if (audioBarsRef.current && audioBarsRef.current.length > 0) {
            for (let i = 0; i < audioBarsRef.current.length; i++) {
              const value = dataArray[i % dataArray.length] || 0; 
              // When silent (value is small), height should be very low (straight line look)
              const height = value < 10 ? 3 : 3 + (value / 255) * 28;
              if (audioBarsRef.current[i]) {
                audioBarsRef.current[i].style.height = `${height}px`;
                audioBarsRef.current[i].style.opacity = value < 10 ? '0.3' : '1';
              }
            }
          }
          animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();
      } catch (err) {
        console.error("Microphone access denied or error:", err);
      }
    }
  };

  const cancelListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopAudioVisualizer();
      setIsListening(false);
    }
    setInput('');
    setIsVoiceMessageMode(false);
    if (voiceModeRef) {
      voiceModeRef.current = false;
    }
  };

  const speak = (text, id = null) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (currentlySpeakingId === id && id !== null) {
        window.speechSynthesis.cancel();
        setCurrentlySpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Voice profile mapping
      const voiceId = personalization.voice || 'Kyra';
      let pitch = 1.0;
      let rate = 1.1;

      if (voiceId === 'Echo') { pitch = 0.85; rate = 1.0; }
      else if (voiceId === 'Onyx') { pitch = 0.75; rate = 0.95; }
      else if (voiceId === 'Shimmer') { pitch = 1.2; rate = 1.15; }
      else if (voiceId === 'Alloy') { pitch = 1.0; rate = 1.0; }
      else { pitch = 1.1; rate = 1.1; } // Kyra (Default)

      utterance.pitch = pitch;
      utterance.rate = rate;
      
      utterance.onstart = () => setCurrentlySpeakingId(id);
      utterance.onend = () => setCurrentlySpeakingId(null);
      utterance.onerror = () => setCurrentlySpeakingId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerMoreRef.current && !headerMoreRef.current.contains(e.target)) {
        setIsHeaderMoreOpen(false);
      }
      if (msgMoreRef.current && !msgMoreRef.current.contains(e.target)) {
        setActiveMsgMoreId(null);
      }
      if (modelSwitcherRef.current && !modelSwitcherRef.current.contains(e.target)) {
        setShowModelSwitcher(false);
      }
      if (modelSwitcherLandingRef.current && !modelSwitcherLandingRef.current.contains(e.target)) {
        setShowModelSwitcherLanding(false);
      }
    };
    if (isHeaderMoreOpen || activeMsgMoreId || showModelSwitcher || showModelSwitcherLanding) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHeaderMoreOpen, activeMsgMoreId, showModelSwitcher, showModelSwitcherLanding]);

  // Modular message rendering to resolve JSX parsing complexity
  const renderMessageView = (msg, index) => {
    if (msg.isGroupCreation) {
      const chat = chats.find(c => c.id === activeChatId);
      const creator = chat?.creator;

      return (
        <div style={{
          width: '100%',
          textAlign: 'center',
          padding: '0 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            {creator?.avatar && (
              <img 
                src={creator.avatar} 
                alt="" 
                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--divider)' }} 
              />
            )}
            <p style={{ fontSize: '13.5px', color: 'var(--on-surface)', margin: 0, opacity: 0.9 }}>
              <span style={{ fontWeight: 600 }}>{creator?.displayName || profile?.displayName || 'User'}</span> created the group chat.
            </p>
          </div>
        </div>
      );
    }

    // Calculate context first
    const isMe = msg.role === 'user' && (msg.sender?.email === profile?.email || !msg.sender?.email || isSharedReadOnly);
    const isOtherUser = msg.role === 'user' && !isMe;
    const isGroup = chats.find(c => c.id === activeChatId)?.isGroup;
    const parsedImage = msg.role === 'user' ? parseUserImageMessage(msg.content) : { hasImage: false };

    // 1. Handle Deletion State
    const isDeletedForMe = msg.deletedBy?.includes(user?.uid);
    const isDeletedForEveryone = msg.isDeleted;
    
    if (isDeletedForMe || isDeletedForEveryone) {
      return (
        <div className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in my-10`}>
          <div className="px-6 py-3 flex items-center gap-2.5 transition-all" 
            style={{ 
              background: isMe ? `${accentColor}15` : 'var(--surface-2)', 
              border: `1px dashed ${isMe ? accentColor : 'var(--divider)'}`,
              color: 'var(--on-surface-subtle)',
              fontSize: '13px',
              opacity: 0.6,
              borderRadius: isMe ? '24px 24px 4px 24px' : '4px 24px 24px 24px',
              marginLeft: !isMe && isOtherUser ? '44px' : '0'
            }}>
            <Trash2 size={13} className="opacity-30" />
            <span className="italic tracking-tight">
              {isDeletedForMe ? 'You deleted this message' : 'This message was deleted'}
            </span>
          </div>
        </div>
      );
    }

    // 2. Handle Editing State
    if (editingId === msg.id) {
      return (
        <div className="w-full max-w-full flex flex-col p-5 animate-fade-in relative transition-all duration-300" 
          style={{ background: '#2f2f2f', borderRadius: '26px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)', margin: '20px 0' }}>
          <textarea
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[16.5px] leading-relaxed min-h-[85px] p-0 text-white placeholder:text-white/20"
            style={{ resize: 'none' }}
            placeholder="Edit your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSaveEdit(msg.id);
              }
              if (e.key === 'Escape') {
                setEditingId(null);
              }
            }}
          />
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/10" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button 
              onClick={() => { setEditingId(null); setEditValue(''); }}
              className="rounded-full text-[15px] font-semibold transition-all shadow-sm hover:bg-white/90 hover:-translate-y-[1px] active:translate-y-0"
              style={{ background: '#ffffff', color: '#000000', padding: '10px 24px' }}
            >
              Cancel
            </button>
            <button 
              onClick={() => handleSaveEdit(msg.id)}
              className="rounded-full text-[15px] font-semibold text-white transition-all shadow-md hover:opacity-90 hover:-translate-y-[1px] active:translate-y-0"
              style={{ background: accentColor || '#3b82f6', padding: '10px 28px' }}
            >
              Send
            </button>
          </div>
        </div>
      );
    }

    // 3. Handle Normal Rendering

    if (msg.role === 'system') {
      let displayContent = msg.content;
      if (msg.id.startsWith('join-')) {
        const joinedUid = msg.id.split('join-')[1];
        if (joinedUid === profile?.uid) {
          displayContent = 'You joined the group';
        }
      } else if (msg.id.startsWith('leave-')) {
        if (profile?.displayName && msg.content.includes(profile.displayName)) {
          displayContent = msg.content.replace(profile.displayName, 'You');
        }
      } else if (profile?.displayName && msg.content.startsWith(profile.displayName)) {
        displayContent = msg.content.replace(profile.displayName, 'You');
      }

      return (
        <div className="w-full flex justify-center mt-8 mb-20 animate-fade-in">
          <p className="text-[13px] font-normal text-on-surface-muted m-0 opacity-40 text-center tracking-tight">
            {displayContent}
          </p>
        </div>
      );
    }

    return (
      <div className={`w-full flex flex-col ${isMe ? 'items-end' : msg.isVoice ? 'items-center' : 'items-start'}`}>
        {/* Reply preview if it contains an image */}
        {msg.replyTo && (() => {
          const parsedReply = parseUserImageMessage(msg.replyTo.content);
          if (parsedReply.hasImage) {
            return (
              <div 
                className="mb-1 flex items-center gap-1.5 p-1 px-2 rounded-md text-[11px] opacity-80"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--on-surface-muted)',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  marginRight: isMe ? '4px' : '0px',
                  marginLeft: !isMe && isOtherUser ? '44px' : '0px',
                  width: 'fit-content'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                  <polyline points="15 10 20 15 15 20" />
                  <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                </svg>
                <img 
                  src={parsedReply.imgUrl} 
                  alt="Thumbnail" 
                  style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                />
              </div>
            );
          }
          return null;
        })()}

        {/* Own prompt image preview displayed above the bubble */}
        {msg.role === 'user' && (() => {
          const parsed = parseUserImageMessage(msg.content);
          if (parsed.hasImage) {
            const imgSrc = msg.attachment?.thumbnailUrl || parsed.imgUrl || msg.attachment?.url;
            return (
              <div 
                className="flex items-center gap-2 p-1 text-[13px] opacity-90"
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  marginRight: isMe ? '12px' : '0px',
                  marginLeft: !isMe && isOtherUser ? '56px' : '0px',
                  width: 'fit-content',
                  marginBottom: '10px'
                }}
              >
                {/* Curved Arrow ↳ */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, color: 'var(--on-surface-muted)' }}>
                  <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                  <polyline points="15 10 20 15 15 20" />
                </svg>
                {/* Thumbnail Image */}
                <div 
                  onClick={() => setFullscreenImageUrl(imgSrc)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    background: 'var(--surface-3)'
                  }}
                  title="Click to view full size"
                >
                  <img 
                    src={imgSrc} 
                    alt="Prompt Thumbnail" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div className={`w-full flex ${isMe ? 'items-start flex-row-reverse' : msg.isVoice ? 'items-center justify-center' : 'items-start flex-row'}`}>
          {isGroup && !isMe && msg.role !== 'ai' && (
            <div title={msg.sender?.displayName || 'User'} onClick={() => setSelectedUserForProfile(msg.sender)} style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', marginRight: '12px', flexShrink: 0, marginTop: '2px', border: '1px solid var(--divider)', cursor: 'pointer' }}>
              {msg.sender?.avatar ? (
                <img src={msg.sender.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                  {(msg.sender?.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
          )}

          <motion.div 
             layout={msg.role === 'ai' && generatingIds[activeChatId] === msg.id ? false : "position"}
             initial={{ opacity: 0, scale: 0.98, y: 10 }} 
             animate={{ opacity: 1, scale: 1, y: 0 }} 
             transition={{ duration: 0.2, ease: "easeOut" }}
           className={`relative transition-all duration-300 min-w-0 ${
              isMe 
                ? 'px-6 py-3 rounded-[24px] font-medium shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] border border-white/5' 
                : isOtherUser
                  ? 'px-6 py-3 rounded-[24px] bg-surface-2 border border-divider'
                  : msg.isAspectGeneration ? '' : 'px-0 py-2'
           }`}
           style={{ 
             maxWidth: msg.isVoice ? '340px' : isMe ? '78%' : isOtherUser ? '78%' : '100%',
             overflow: msg.isAspectGeneration ? 'visible' : 'hidden',
             wordBreak: 'break-word',
             background: isMe ? accentColor : isOtherUser ? 'var(--surface-2)' : 'transparent',
             color: isMe ? '#ffffff' : 'var(--on-surface)',
             border: isMe ? `1px solid ${accentColor}` : isOtherUser ? '1px solid var(--divider)' : 'none',
             borderRadius: msg.isVoice ? '20px' : isMe ? '24px 24px 4px 24px' : isOtherUser ? '4px 24px 24px 24px' : '0',
             fontSize: fontSize === 'Small' ? '12.5px' : fontSize === 'Large' ? '16px' : '14px', 
             lineHeight: '1.7',
             boxShadow: (isMe || isOtherUser) && resolvedTheme === 'dark' ? '0 10px 20px -5px rgba(0,0,0,0.2)' : 'none',
             overflowWrap: 'anywhere',
             padding: msg.isAspectGeneration ? '0' : msg.isVoice ? '12px 16px' : (isMe || isOtherUser ? undefined : '0px')
           }}
          >
       {msg.isVoice ? 
        <div className="flex items-center gap-3 min-w-[240px] max-w-full">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 shrink-0">
            <AudioLines size={18} className="text-white" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[14px] font-semibold text-white tracking-tight">Voice chat ended</span>
            <span className="text-[12px] text-white/70">{msg.duration || '0s'}</span>
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            {ratings[msg.id] !== 'bad' && 
              <button 
                onClick={() => handleRate(msg.id, ratings[msg.id] === 'good' ? undefined : 'good')}
                className={`p-1.5 rounded-lg transition-all ${ratings[msg.id] === 'good' ? 'text-green-400 bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
              >
                <ThumbsUp size={13} fill={ratings[msg.id] === 'good' ? 'currentColor' : 'none'} />
              </button>
            }
            {ratings[msg.id] !== 'good' && 
              <button 
                onClick={() => handleRate(msg.id, ratings[msg.id] === 'bad' ? undefined : 'bad')}
                className={`p-1.5 rounded-lg transition-all ${ratings[msg.id] === 'bad' ? 'text-red-400 bg-white/10' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
              >
                <ThumbsDown size={13} fill={ratings[msg.id] === 'bad' ? 'currentColor' : 'none'} />
              </button>
            }
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button 
              onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-red-500/20 transition-all"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
       : 
        <>
          {msg.replyTo && (() => {
            const parsedReply = parseUserImageMessage(msg.replyTo.content);
            if (parsedReply.hasImage) {
              return null; // Rendered outside
            }
            return (
              <div 
                className="mb-2 p-2.5 px-3.5 rounded-xl text-[13px] opacity-80"
                style={{ 
                  background: isMe ? 'rgba(0,0,0,0.12)' : 'var(--hover-overlay)',
                  borderLeft: `2px solid ${isMe ? 'rgba(255,255,255,0.4)' : accentColor}`,
                  color: isMe ? 'rgba(255, 255, 255, 0.9)' : 'var(--on-surface-muted)',
                }}
              >
                <p className="line-clamp-2 leading-relaxed">
                  <span className="opacity-40 mr-1 font-serif text-[15px]">"</span>
                  {msg.replyTo.content}
                  <span className="opacity-40 ml-1 font-serif text-[15px]">"</span>
                </p>
              </div>
            );
          })()}
          {/* Render embedded image card for user messages */}
          {msg.role === 'user' && (() => {
            const parsed = parseUserImageMessage(msg.content);
            if (parsed.hasImage) {
              return (
                <p className="leading-relaxed whitespace-pre-wrap font-medium" style={{ margin: 0 }}>
                  {parsed.text || 'Cropped Image'}
                </p>
              );
            }
            return (
              <>
                {msg._typewriter && msg.content
                  ? <TypewriterMessage content={msg.content} isUser={true} isGenerating={msg.isPlaceholder} onDone={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, _typewriter: false } : m))} />
                  : <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                }
              </>
            );
          })()}
          {msg.role !== 'user' && (
            <>
              {msg.content && (
                msg._typewriter && !msg.content.startsWith('![image](') ? (
                  <TypewriterMessage content={msg.content} isUser={false} isGenerating={msg.isPlaceholder} onDone={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, _typewriter: false } : m))} />
                ) : (
                  <MessageContent content={msg.content} isUser={false} />
                )
              )}
              {msg.isAspectGeneration && (
                <div className="mt-3">
                  <AspectGenCard 
                    messageId={msg.id}
                    imageUrl={msg.imageUrl} 
                    ratio={msg.ratio} 
                    prompt={msg.prompt} 
                    imageId={msg.imageId}
                    isDoneInitially={!!msg.aspectGenDone}
                    setMessages={setMessages}
                    timestamp={msg.timestamp}
                    onExpand={() => scrollToBottom(true)}
                  />
                </div>
              )}
            </>
          )}
        </>
      }
      </motion.div>
      {isMe && msg.versions && msg.versions.length > 1 && (
         <div className="flex items-center gap-1.5 mt-1.5 px-1 select-none opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200">
           <button 
             onClick={() => handleVersionChange(msg.id, -1)}
             disabled={msg.currentVersionIndex === 0}
             className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-hover-overlay disabled:opacity-10 transition-all text-on-surface/60 hover:text-on-surface"
             title="Previous version"
           >
             <ChevronLeft size={14} strokeWidth={3} />
           </button>
           <span className="text-[11px] font-bold text-on-surface/40 tracking-tight min-w-[30px] text-center">
             {msg.currentVersionIndex + 1} / {msg.versions.length}
           </span>
           <button 
             onClick={() => handleVersionChange(msg.id, 1)}
             disabled={msg.currentVersionIndex === msg.versions.length - 1}
             className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-hover-overlay disabled:opacity-10 transition-all text-on-surface/60 hover:text-on-surface"
             title="Next version"
           >
             <ChevronRight size={14} strokeWidth={3} />
           </button>
         </div>
      )}
    </div>

      {!msg.isVoice && (
        <div className={`w-full flex ${isMe ? 'flex-row-reverse' : 'flex-row'} px-1 mt-1 ${msg.role === 'ai' ? ((generatingIds[activeChatId] === msg.id || msg.isPlaceholder || (msg.isAspectGeneration && !msg.imageUrl)) ? 'opacity-0 pointer-events-none' : 'opacity-100') : 'opacity-0 group-hover/msg:opacity-100'} transition-opacity relative`}>
         <div className={`flex flex-wrap gap-1 ${!isMe && isOtherUser ? 'ml-[44px]' : ''}`}>
          {isSharedReadOnly ? (
            <ActionButton 
              onClick={() => handleCopy(msg.content, msg.id)} 
              label={copyingId === msg.id ? "Copied" : "Copy"} 
              icon={copyingId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
            />
          ) : chats.find(c => c.id === activeChatId)?.isGroup ? (
            msg.role === 'ai' ? (
            <>
              <div className="relative">
                {((chats.find(c => c.id === activeChatId)?.isGroup ? msg.reactions : null) || msgReactions[msg.id]) && (
                  <div 
                    className="absolute flex items-center gap-1"
                    style={{
                      bottom: 'calc(100% + 4px)',
                      left: '0',
                      background: resolvedTheme === 'dark' ? '#2a2a2c' : '#ffffff',
                      border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: '999px', padding: '2px 6px', fontSize: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'default', zIndex: 5,
                    }}
                  >
                    {chats.find(c => c.id === activeChatId)?.isGroup ? (
                      Object.entries(msg.reactions || {}).map(([email, r]) => (
                        <span key={email} title={r.user}>{r.emoji}</span>
                      ))
                    ) : (
                      <span>{msgReactions[msg.id]?.emoji || msgReactions[msg.id]}</span>
                    )}
                  </div>
                )}
                {hoveredReactionMsgId === msg.id && (
                  <div 
                    className="fixed inset-0" 
                    style={{ zIndex: 15 }}
                    onClick={(e) => { e.stopPropagation(); setHoveredReactionMsgId(null); }}
                  />
                )}
                <AnimatePresence>
                  {hoveredReactionMsgId === msg.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute"
                      style={{ 
                        bottom: 'calc(100% + 4px)', 
                        left: isMe ? 'auto' : '0',
                        right: isMe ? '0' : 'auto',
                        zIndex: 20
                      }}
                    >
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '2px',
                        background: resolvedTheme === 'dark' ? '#1c1c1e' : '#f2f2f2',
                        border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        borderRadius: '999px', padding: '5px 8px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                      }}>
                        {['👍','👎','❤️','🎉','🔥','🤔','😂','😮'].map(emoji => {
                          const isGroup = chats.find(c => c.id === activeChatId)?.isGroup;
                          const reacted = isGroup 
                            ? msg.reactions?.[profile?.email || 'guest']?.emoji === emoji
                            : (msgReactions[msg.id]?.emoji === emoji || msgReactions[msg.id] === emoji);
                          return (
                            <button
                              key={emoji}
                              onClick={async () => {
                                const userName = profile?.displayName || 'User';
                                const currentChat = chats.find(c => c.id === activeChatId);
                                
                                if (currentChat?.isGroup) {
                                  try {
                                    const chatRef = doc(db, 'chats', activeChatId);
                                    const updatedMessages = messages.map(m => {
                                      if (m.id === msg.id) {
                                        const existingReaction = m.reactions?.[profile?.email || 'guest'];
                                        const newReactions = { ...(m.reactions || {}) };
                                        if (existingReaction?.emoji === emoji) {
                                          delete newReactions[profile?.email || 'guest'];
                                        } else {
                                          newReactions[profile?.email || 'guest'] = { emoji, user: userName };
                                        }
                                        return { ...m, reactions: newReactions };
                                      }
                                      return m;
                                    });
                                    await updateDoc(chatRef, { messages: updatedMessages });
                                  } catch (err) {
                                    console.error("Failed to sync reaction:", err);
                                  }
                                } else {
                                  setMsgReactions(prev => ({ ...prev, [msg.id]: reacted ? null : { emoji, user: userName } }));
                                }
                                setHoveredReactionMsgId(null);
                              }}
                              style={{
                                width: '34px', height: '34px', borderRadius: '50%', border: 'none',
                                background: reacted ? (accentColor ? `${accentColor}30` : 'rgba(255,255,255,0.15)') : 'transparent',
                                cursor: 'pointer', fontSize: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s', transform: reacted ? 'scale(1.2)' : 'scale(1)'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = reacted ? (accentColor ? `${accentColor}30` : 'rgba(255,255,255,0.15)') : 'transparent'; e.currentTarget.style.transform = reacted ? 'scale(1.2)' : 'scale(1)'; }}
                            >{emoji}</button>
                          );
                        })}
                        <div style={{ width: '1px', height: '20px', background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
                        <button style={{
                          width: '34px', height: '34px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer',
                          fontSize: '18px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', fontWeight: 300
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => { setActiveReactionPickerMsgId(msg.id); setHoveredReactionMsgId(null); }}
                        >+</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <ActionButton 
                  onClick={() => setHoveredReactionMsgId(prev => prev === msg.id ? null : msg.id)}
                  label="React" 
                  icon={<SmilePlus size={14} />} 
                />
              </div>
              <ActionButton 
                onClick={() => { setReplyingToMsg(msg.role === 'ai' ? (messages[index - 1] || msg) : msg); setTimeout(() => footerInputRef.current?.focus(), 100); }} 
                label="Reply" 
                icon={<Reply size={14} />} 
              />
              <ActionButton 
                onClick={() => setMsgDeleteConfirm({ open: true, id: msg.id })} 
                label="Delete" 
                icon={<Trash2 size={14} />} 
              />
              {isMe && (
                <ActionButton 
                  onClick={() => { setEditingId(msg.id); setEditValue(msg.content); }} 
                  label="Edit" 
                  icon={<Edit2 size={14} />} 
                />
              )}
              {!isMe && (
                <ActionButton 
                  onClick={() => setIsReportModalOpen(true)} 
                  label="Report" 
                  icon={<Flag size={14} />} 
                />
              )}
            </>
            ) : null
          ) : (
            <>
              {msg.isAspectGeneration ? (
                <>
                  <ActionButton 
                    onClick={() => {
                      navigator.clipboard.writeText(msg.imageUrl);
                      handleCopy(msg.imageUrl, msg.id + '-copylink');
                    }} 
                    label={copyingId === msg.id + '-copylink' ? "Copied" : "Copy"} 
                    icon={copyingId === msg.id + '-copylink' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                  />
                  {(ratings[msg.id] === 'good' || !ratings[msg.id]) && (
                    <ActionButton 
                      onClick={() => handleRate(msg.id, 'good')} 
                      label="Like" 
                      className={ratings[msg.id] === 'good' ? 'text-green-500' : ''} 
                      icon={<ThumbsUp size={14} fill={ratings[msg.id] === 'good' ? "currentColor" : "none"} />} 
                    />
                  )}
                  {(ratings[msg.id] === 'bad' || !ratings[msg.id]) && (
                    <ActionButton 
                      onClick={() => handleRate(msg.id, 'bad')} 
                      label="Dislike" 
                      className={ratings[msg.id] === 'bad' ? 'text-red-500' : ''} 
                      icon={<ThumbsDown size={14} fill={ratings[msg.id] === 'bad' ? "currentColor" : "none"} />} 
                    />
                  )}
                  <div className="relative" ref={activeMsgMoreId === msg.id ? msgMoreRef : null}>
                    <ActionButton 
                      onClick={() => setActiveMsgMoreId(activeMsgMoreId === msg.id ? null : msg.id)} 
                      label="More" 
                      icon={<MoreHorizontal size={14} />} 
                      className={activeMsgMoreId === msg.id ? 'bg-hover-overlay text-on-surface' : ''}
                    />
                    
                    <AnimatePresence>
                      {activeMsgMoreId === msg.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute"
                          style={{
                            bottom: "calc(100% + 6px)",
                            top: "auto", 
                            right: isMobile ? '8px' : '0',
                            minWidth: '210px',
                            background: 'var(--surface-1)',
                            border: '1px solid var(--divider)',
                            borderRadius: '16px',
                            padding: '6px',
                            boxShadow: resolvedTheme === 'dark' ? '0 20px 40px rgba(0,0,0,0.2)' : 'none',
                            display: 'flex',
                            zIndex: 100,
                            flexDirection: 'column',
                            gap: 2,
                          }}
                        >
                          <div style={{ padding: '8px 14px 6px', fontSize: '11px', color: 'var(--on-surface-subtle)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </div>
                          
                          <button
                            onClick={() => { handleBranchChat(msg.id); setActiveMsgMoreId(null); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--on-surface)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <GitBranch size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                            <span>Branch in new chat</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <ActionButton 
                    onClick={() => handleCopy(msg.content, msg.id)} 
                    label={copyingId === msg.id ? "Copied" : "Copy"} 
                    icon={copyingId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                  />
                  {msg.role === 'ai' && (
                    <>
                      {(ratings[msg.id] === 'good' || !ratings[msg.id]) && (
                        <ActionButton 
                          onClick={() => handleRate(msg.id, 'good')} 
                          label="Good Response" 
                          className={ratings[msg.id] === 'good' ? 'text-green-500' : ''} 
                          icon={<ThumbsUp size={14} fill={ratings[msg.id] === 'good' ? "currentColor" : "none"} />} 
                        />
                      )}
                      {(ratings[msg.id] === 'bad' || !ratings[msg.id]) && (
                        <ActionButton 
                          onClick={() => handleRate(msg.id, 'bad')} 
                          label="Bad Response" 
                          className={ratings[msg.id] === 'bad' ? 'text-red-500' : ''} 
                          icon={<ThumbsDown size={14} fill={ratings[msg.id] === 'bad' ? "currentColor" : "none"} />} 
                        />
                      )}
                      <ActionButton 
                        onClick={() => setIsShareModalOpen(true)} 
                        label="Share" 
                        icon={<Share size={14} />} 
                      />
                      <ActionButton 
                        onClick={() => {}} 
                        label="Regenerate" 
                        icon={<RefreshCcw size={14} />} 
                      />
                    </>
                  )}
                  {msg.role === 'ai' ? (
                      <div className="relative" ref={activeMsgMoreId === msg.id ? msgMoreRef : null}>
                        <ActionButton 
                          onClick={() => setActiveMsgMoreId(activeMsgMoreId === msg.id ? null : msg.id)} 
                          label="More" 
                          icon={<MoreHorizontal size={14} />} 
                          className={activeMsgMoreId === msg.id ? 'bg-hover-overlay text-on-surface' : ''}
                        />
                    
                    <AnimatePresence>
                      {activeMsgMoreId === msg.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute"
                          style={{
                            bottom: "calc(100% + 6px)",
                            top: "auto", 
                            right: isMobile ? '8px' : '0',
                            minWidth: '210px',
                            background: 'var(--surface-1)',
                            border: '1px solid var(--divider)',
                            borderRadius: '16px',
                            padding: '6px',
                            boxShadow: resolvedTheme === 'dark' ? '0 20px 40px rgba(0,0,0,0.2)' : 'none',
                            display: 'flex',
                            zIndex: 100,
                            flexDirection: 'column',
                            gap: 2,
                          }}
                        >
                          <div style={{ padding: '8px 14px 6px', fontSize: '11px', color: 'var(--on-surface-subtle)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </div>
                          
                          <button
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '9px 14px', borderRadius: 10, background: 'transparent',
                              border: 'none', color: 'var(--on-surface)', fontSize: 13.5,
                              fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                              fontFamily: 'inherit', transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <BookOpen size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} strokeWidth={1.5} />
                            <span>View sources</span>
                          </button>
                          
                          <button
                            onClick={() => { handleBranchChat(msg.id); setActiveMsgMoreId(null); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--on-surface)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <GitBranch size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                            <span>Branch in new chat</span>
                          </button>
                          
                          <button 
                            onClick={() => { speak(msg.content, msg.id); setActiveMsgMoreId(null); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--on-surface)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <Volume2 size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                            <span style={{ color: 'var(--on-surface-muted)' }}>{currentlySpeakingId === msg.id ? "Stop Reading" : "Read aloud"}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>
                  ) : (
                    <ActionButton 
                      onClick={() => { setEditingId(msg.id); setEditValue(msg.content); }} 
                      label="Edit" 
                      icon={<Edit2 size={14} />} 
                    />
                  )}
                </>
              )}
            </>
          )}
         </div>
        </div>
     )}
      </div>
    );
  };

  const scrollExplore = (direction) => {
    if (exploreScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      exploreScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Lower threshold (30px) makes it much easier to scroll up and read history
      const isNearBottom = scrollTop >= scrollHeight - clientHeight - 30;
      isAtBottomRef.current = isNearBottom;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsSmallMobile(width < 400);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (showAttachmentMenu) setShowAttachmentMenu(false);
    };
    if (showAttachmentMenu) {
      window.addEventListener('click', handleGlobalClick);
    }
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [showAttachmentMenu]);


  const handleDeleteGroup = () => {
    deleteChat(activeChatId);
    setIsDeleteConfirmOpen(false);
  };

  const handleRenameGroup = (newName) => {
    if (newName.trim()) {
      renameChat(activeChatId, newName.trim());
    }
    setIsRenameModalOpen(false);
  };

  const scrollToBottom = (force = false) => {
    if (preventScrollRef.current && !force) return;
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    
    if (isAtBottomRef.current || force) {
      if (force) {
        // Use smooth scroll only for manual button clicks or new messages
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        isAtBottomRef.current = true;
        setShowScrollButton(false);
      } else {
        // Use instant scroll for high-frequency streaming updates
        // This prevents the "shaking/shrinking" effect by not triggering complex animations
        container.scrollTop = container.scrollHeight;
      }
    }
  };
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    isAtBottomRef.current = true;
    scrollToBottom(true);
    const timer = setTimeout(() => scrollToBottom(true), 50);
    return () => clearTimeout(timer);
  }, [activeChatId]);

  useEffect(() => {
    if (activeChatId && messages.length > 0 && !isTemporary) {
      setChats(prev => prev.map(chat =>
        chat.id === activeChatId ? { ...chat, messages } : chat
      ));
    }
  }, [messages, activeChatId, isTemporary]);

  useEffect(() => {
    if (isTemporary) {
      document.title = 'Temporary Chat | Kyra';
    } else if (activeChatId && chats.length > 0) {
      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat) {
        document.title = `${activeChat.title} | Kyra`;
      }
    } else if (!activeChatId) {
      document.title = 'New Chat | Kyra';
    }
  }, [activeChatId, chats, isTemporary]);

  const formatDateLabel = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const handleRate = (id, rating) => {
    setRatings(prev => prev[id] === rating ? { ...prev, [id]: undefined } : { ...prev, [id]: rating });
  };

  const handleBranchChat = (msgId) => {
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex === -1) return;
    
    // Slice messages up to the clicked message (inclusive)
    const branchedMessages = messages.slice(0, msgIndex + 1);
    
    // Create new chat ID
    const newChatId = Date.now().toString();
    
    const newChatObj = {
      id: newChatId,
      title: (currentChatForSend?.title || 'Branched Chat') + ' (Branch)',
      messages: branchedMessages,
      createdAt: new Date().toISOString(),
      accentColor: accentColor || 'var(--accent-color)',
      chatTheme: chatTheme || 'classic'
    };
    
    setChats(prev => [newChatObj, ...prev]);
    setActiveChatId(newChatId);
    setMessages(branchedMessages);
    setIsTemporary(false);
  };


  const handleStop = () => {
    if (abortControllersRef.current[activeChatId]) {
      abortControllersRef.current[activeChatId].abort();
      delete abortControllersRef.current[activeChatId];
    }
  };

  const handleActionClick = (action) => {
    let promptText = "";
    if (action.includes('image')) promptText = "Generate a professional image of ";
    else if (action.includes('Write')) promptText = "Help me write a ";
    else if (action.includes('Look')) promptText = "Search for ";
    else promptText = `Tell me about ${action} `;

    setInput(promptText);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
      if (footerInputRef.current) footerInputRef.current.focus();
    }, 50);
  };

  const handleInlineImageGen = async (overridePrompt) => {
    const promptText = (typeof overridePrompt === 'string') ? overridePrompt : (imageGenPrompt || '');
    const prompt = promptText.trim();
    if (!prompt || isImageGenLoading) return;
    setIsImageGenLoading(true);
    setImageGenResult(null);
    try {
      const hfToken = process.env.NEXT_PUBLIC_HF_ACCESS_TOKEN || '';
      const result = await generateImageClientSide(prompt, hfToken);
      setImageGenResult({ url: result.url, prompt });
    } catch (err) {
      console.error('Inline image gen error:', err);
    } finally {
      setIsImageGenLoading(false);
    }
  };

  const handleGenerateImageForMessage = async (messageId, promptText) => {
    setMessages(prev => prev.map(m => m.id === messageId ? {
      ...m,
      isAspectGeneration: true,
      aspectGenDone: false,
      ratio: '1:1',
      prompt: promptText,
      imageUrl: null,
      imageId: 'img_' + Date.now(),
      pendingImagePrompt: null
    } : m));

    setChats(prevChats => prevChats.map(c => 
      c.id === activeChatId ? {
        ...c,
        messages: c.messages.map(m => m.id === messageId ? {
          ...m,
          isAspectGeneration: true,
          aspectGenDone: false,
          ratio: '1:1',
          prompt: promptText,
          imageUrl: null,
          imageId: 'img_' + Date.now(),
          pendingImagePrompt: null
        } : m)
      } : c
    ));

    try {
      let imageUrl = null;
      let genProvider = '';
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText }),
        });
        const data = await response.json();
        if (response.ok && !data.error && data.imageUrl) {
          imageUrl = data.imageUrl;
          genProvider = data.provider || 'API';
        } else {
          console.warn("Backend image gen API failed, falling back to client-side generation:", data?.error);
        }
      } catch (apiErr) {
        console.warn("Backend image gen API error, falling back to client-side generation:", apiErr);
      }

      if (!imageUrl) {
        const hfToken = process.env.NEXT_PUBLIC_HF_ACCESS_TOKEN || '';
        const clientResult = await generateImageClientSide(promptText, hfToken);
        if (clientResult && clientResult.url) {
          imageUrl = clientResult.url;
          genProvider = clientResult.provider || 'Client-side fallback';
        } else {
          throw new Error('All image generation strategies failed');
        }
      }

      setMessages(prev => prev.map(m => m.id === messageId ? {
        ...m,
        imageUrl: imageUrl,
        aspectGenDone: false
      } : m));

      setChats(prevChats => prevChats.map(c => 
        c.id === activeChatId ? {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? {
            ...m,
            imageUrl: imageUrl,
            aspectGenDone: false
          } : m)
        } : c
      ));

      const currentChat = chats.find(c => c.id === activeChatId);
      if (currentChat?.isGroup) {
        try {
          const chatRef = doc(db, 'chats', activeChatId);
          const docSnap = await getDoc(chatRef);
          if (docSnap.exists()) {
            const currentMsgs = docSnap.data().messages || [];
            const updatedMsgs = currentMsgs.map(m => 
              m.id === messageId ? { 
                ...m, 
                isAspectGeneration: true,
                aspectGenDone: false,
                ratio: '1:1',
                prompt: promptText,
                imageUrl: imageUrl,
                imageId: 'img_' + Date.now(),
                pendingImagePrompt: null
              } : m
            );
            await updateDoc(chatRef, { 
              messages: updatedMsgs
            });
          }
        } catch (err) {
          console.error("Failed to sync generated image to group:", err);
        }
      }
    } catch (err) {
      console.error("Failed to generate image for message:", err);
      const errorMsg = err.message ? `*(Failed to generate image: ${err.message})*` : "*(Failed to generate image)*";
      
      setMessages(prev => prev.map(m => m.id === messageId ? {
        ...m,
        isAspectGeneration: false,
        content: m.content + `\n\n${errorMsg}`
      } : m));

      setChats(prevChats => prevChats.map(c => 
        c.id === activeChatId ? {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? {
            ...m,
            isAspectGeneration: false,
            content: m.content + `\n\n${errorMsg}`
          } : m)
        } : c
      ));
    }
  };

  const handleImageGenSubmit = (promptToSubmit) => {
    const promptText = (promptToSubmit && typeof promptToSubmit === 'string') 
      ? promptToSubmit 
      : (imageGenPrompt || '');
    const prompt = promptText.trim();
    if (!prompt) return;
    
    setShowImageGen(false);
    setImageGenResult(null);
    setImageGenPrompt('');
    
    handleSend(null, prompt, false, true);
  };

  const isImagePrompt = (text) => {
    if (!text) return false;
    const clean = text.toLowerCase().trim();
    
    // Direct phrases indicating image generation requests
    const directPhrases = [
      'generate an image', 'create an image', 'generate image', 'create image', 
      'generate a photo', 'create a photo', 'generate photo', 'create photo',
      'draw a', 'draw an', 'paint a', 'paint an', 'sketch a', 'sketch an',
      'make a photo', 'make an image', 'make a picture', 'show me a photo',
      'show me an image', 'photo of', 'image of', 'picture of', 'painting of',
      'drawing of', 'sketch of', 'portrait of', 'illustration of', 'render of',
      '3d render of', 'artwork of', 'vector art of', 'clipart of'
    ];
    
    if (directPhrases.some(phrase => clean.includes(phrase))) {
      return true;
    }

    // Keywords indicating image requests at the beginning
    const startKeywords = ['generate', 'create', 'draw', 'paint', 'sketch', 'illustrate', 'render', 'depict', 'design', 'make'];
    const imageNouns = ['image', 'photo', 'picture', 'painting', 'drawing', 'sketch', 'portrait', 'illustration', 'artwork', 'graphic', 'render', 'wallpaper', 'logo', 'scene', 'visual'];
    
    for (const kw of startKeywords) {
      if (clean.startsWith(kw)) {
        if (['draw', 'paint', 'sketch', 'illustrate'].includes(kw)) {
          return true;
        }
        if (imageNouns.some(noun => clean.includes(noun))) {
          return true;
        }
        const textExclusions = ['code', 'text', 'website', 'app', 'script', 'function', 'story', 'poem', 'email', 'essay', 'html', 'css', 'react', 'javascript', 'python', 'java', 'sql', 'writing'];
        if (!textExclusions.some(word => clean.includes(word))) {
          return true;
        }
      }
    }

    // Common style keywords
    const styleKeywords = [
      'realistic photo', 'photorealistic', 'hyperrealistic', '3d render', 
      'anime style', 'cartoon style', 'oil painting', 'watercolor painting', 
      'concept art', 'digital art', 'pencil sketch', 'cyberpunk portrait',
      'cinematic lighting', 'unreal engine', 'octane render'
    ];
    
    if (styleKeywords.some(style => clean.includes(style))) {
      const textExclusions = ['code', 'text', 'write', 'explain', 'how to'];
      if (!textExclusions.some(word => clean.includes(word))) {
        return true;
      }
    }

    // Roman Urdu / Hindi patterns support
    const romanUrduVerbs = ['bana', 'banao', 'banaye', 'chahiye', 'chahye', 'chahie', 'dikhao', 'dikhaye'];
    const romanUrduNouns = ['image', 'photo', 'pic', 'picture', 'tasveer', 'tasweer', 'tasvir', 'drawing', 'painting', 'sketch', 'logo', 'design'];
    
    const hasRomanUrduVerb = romanUrduVerbs.some(verb => new RegExp(`\\\\b${verb}\\\\b`, 'i').test(clean));
    const hasRomanUrduNoun = romanUrduNouns.some(noun => new RegExp(`\\\\b${noun}\\\\b`, 'i').test(clean));
    if (hasRomanUrduVerb && hasRomanUrduNoun) {
      return true;
    }

    const suffixPatterns = [
      'ki image', 'ki photo', 'ki pic', 'ki tasveer', 'ki tasweer', 'ki tasvir',
      'ka image', 'ka photo', 'ka pic', 'ka tasveer', 'ka tasweer',
      'ko image', 'ko photo', 'ko pic',
      'image bana', 'photo bana', 'tasveer bana', 'tasweer bana', 'tasvir bana'
    ];
    if (suffixPatterns.some(pattern => clean.includes(pattern))) {
      return true;
    }

    return false;
  };

  const isConfirmationMessage = (text) => {
    if (!text) return false;
    // Strip punctuation and normalize spacing
    const clean = text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
    // Negation check
    const negations = ['no', 'dont', 'don\'t', 'nahi', 'mat', 'stop', 'cancel', 'not', 'na banao', 'na karo', 'na bana', 'na krna', 'na karna'];
    if (negations.some(neg => {
      return clean === neg || 
             clean.startsWith(neg + ' ') || 
             clean.endsWith(' ' + neg) || 
             clean.includes(' ' + neg + ' ');
    })) {
      return false;
    }

    const confirmationPhrases = [
      'bana do', 'banao', 'bana de', 'bana o', 'banaen', 'bana dain',
      'bna do', 'bnao', 'bna de', 'bna o', 'bnaen', 'bna dain',
      'baan o', 'baan do', 'banado', 'bnado',
      'make it', 'generate', 'create it', 'yes', 'haan', 'han', 'sure', 
      'please do', 'bana do image', 'bna do image', 'banao image', 'bnao image',
      'baan o image', 'baan do image',
      'image bana do', 'generate image',
      'kardo', 'kar do', 'ha', 'haa', 'ok', 'okay', 'bana',
      'ok ha', 'ok hay', 'done', 'yes please', 'do it'
    ];
    return confirmationPhrases.some(phrase => {
      return clean === phrase || 
             clean.startsWith(phrase + ' ') || 
             clean.endsWith(' ' + phrase) || 
             clean.includes(' ' + phrase + ' ');
    });
  };

  const handleSend = async (e, overrideInput, isVoice = false, forceImageGen = false) => {
    if (e) e.preventDefault();
    const rawTextToSend = overrideInput || input;
    const existingChat = chats.find(c => c.id === activeChatId);
    const isResearchChat = existingChat?.isResearch || existingChat?.pendingResearchPrompt;

    // Check if it's a confirmation for a pending image generation
    const isConfirm = isConfirmationMessage(rawTextToSend);
    if (isConfirm) {
      const lastAiMsgWithPrompt = [...messages].reverse().find(m => m.role === 'ai' && m.pendingImagePrompt);
      if (lastAiMsgWithPrompt) {
        if (replyingToMsg) setReplyingToMsg(null);
        
        const userMessage = { 
          role: 'user', 
          content: rawTextToSend, 
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          sender: profile || { displayName: 'Guest', avatar: null },
          timestamp: new Date().toISOString()
        };
        
        const newAiMessageId = Date.now() + 2;
        const newAiMessage = { 
          role: 'ai', 
          content: '', 
          id: newAiMessageId, 
          isPlaceholder: true,
          respondingTo: userMessage.id,
          timestamp: new Date().toISOString(),
          _typewriter: false
        };
        
        // Append user confirmation and the new AI placeholder, and clear pendingImagePrompt on the old AI message
        setMessages(prev => prev.map(m => m.id === lastAiMsgWithPrompt.id ? { ...m, pendingImagePrompt: null } : m).concat(userMessage, newAiMessage));
        
        setChats(prev => prev.map(c => 
          c.id === activeChatId ? { 
            ...c, 
            messages: (c.messages || [])
              .map(m => m.id === lastAiMsgWithPrompt.id ? { ...m, pendingImagePrompt: null } : m)
              .concat(userMessage, newAiMessage) 
          } : c
        ));
        
        const currentChat = chats.find(c => c.id === activeChatId);
        if (currentChat?.isGroup) {
          try {
            const chatRef = doc(db, 'chats', activeChatId);
            const docSnap = await getDoc(chatRef);
            if (docSnap.exists()) {
              const currentMsgs = docSnap.data().messages || [];
              const updatedMsgs = currentMsgs
                .map(m => m.id === lastAiMsgWithPrompt.id ? { ...m, pendingImagePrompt: null } : m)
                .concat(userMessage, newAiMessage);
              await updateDoc(chatRef, { messages: updatedMsgs });
            }
          } catch (err) {
            console.error("Failed to sync group confirmation:", err);
          }
        }
        
        if (!overrideInput) setInput('');
        
        handleGenerateImageForMessage(newAiMessageId, lastAiMsgWithPrompt.pendingImagePrompt);
        return;
      }
    }
    
    // If there's a pending attachment, embed it into the message
    let textToSend = rawTextToSend;
    let attachmentForMessage = null;
    if (pendingAttachment && !overrideInput) {
      const isImage = pendingAttachment.type?.startsWith('image/');
      if (isImage) {
        const imgMarkdown = `![${pendingAttachment.name}|${pendingAttachment.id}](${pendingAttachment.thumbnailUrl || pendingAttachment.url})`;
        textToSend = `${imgMarkdown}\n\nAsk about this image: ${rawTextToSend}`.trim();
      } else {
        textToSend = `📄 **${pendingAttachment.name}**\n\nAsk about this file: ${rawTextToSend}`.trim();
      }
      attachmentForMessage = { ...pendingAttachment };
      setPendingAttachment(null);
    }

    const currentChat = chats.find(c => c.id === activeChatId);
    const isGroup = currentChat?.isGroup;
    const isGeneratingRemote = isGroup && currentChat?.isGenerating;
    if ((!textToSend.trim() && !attachmentForMessage) || loadingChats[activeChatId] || isGeneratingRemote) return;

    const isFirstMessage = messages.length === 0;
    const targetChatId = (isFirstMessage && !isTemporary) ? (activeChatId || Date.now().toString()) : activeChatId;

    // Snapshot history immediately to isolate this request from parallel messages
    const historySnapshot = [...messages]; 
    
    setLoadingChats(prev => ({ ...prev, [targetChatId]: true }));
    
    // Sync generating status with timestamp for group chats and reset typing status
    if (isGroup) {
      updateDoc(doc(db, 'chats', targetChatId), { 
        isGenerating: true,
        generatingTimestamp: new Date().toISOString(),
        [`typing.${profile?.uid || 'unknown'}`]: {
          isTyping: false,
          timestamp: new Date().toISOString()
        }
      }).catch(console.error);
      lastTypingStateRef.current = false;
    }

    const words = textToSend.split(' ').length;
    const duration = Math.max(1, Math.floor(words * 0.4)) + 's';

    const userMessage = { 
      role: 'user', 
      content: textToSend, 
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      isVoice, 
      duration,
      replyTo: replyingToMsg ? {
        id: replyingToMsg.id,
        role: replyingToMsg.role,
        content: replyingToMsg.content
      } : null,
      attachment: attachmentForMessage ? {
        id: attachmentForMessage.id,
        name: attachmentForMessage.name,
        type: attachmentForMessage.type,
        url: attachmentForMessage.url,
        thumbnailUrl: attachmentForMessage.thumbnailUrl
      } : null,
      sender: profile || { displayName: 'Guest', avatar: null },
      timestamp: new Date().toISOString()
    };
    const aiMessageId = Date.now() + 1;
    const aiPlaceholder = { 
      role: 'ai', 
      content: '', 
      id: aiMessageId, 
      isPlaceholder: true,
      respondingTo: userMessage.id,
      timestamp: new Date().toISOString(),
      _typewriter: true
    };

    // Clear reply state
    if (replyingToMsg) setReplyingToMsg(null);

    // If it's a voice message, just show the bubble — don't call AI
    if (isVoice) {
      if (isFirstMessage && !isTemporary) {
        const newChatId = activeChatId || Date.now().toString();
        const newChat = { id: newChatId, title: 'Voice Message', messages: [userMessage], timestamp: new Date().toISOString() };
        setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0 || c.pendingResearchPrompt || c.pendingImagePrompt)]);
        setActiveChatId(newChatId);
        localStorage.setItem('aura-active-chat-id', newChatId);
      }
      setMessages(prev => [...prev, userMessage]);
      if (!overrideInput) setInput('');
      return;
    }

    if (isFirstMessage && !isTemporary) {
      // Set a generic initial title to avoid "hello" etc. showing up
      // Use raw text (not image content) for title generation
      const cleanTitleText = cleanChatTitle(rawTextToSend.trim());
      const initialTitle = cleanTitleText.length > 30 
        ? cleanTitleText.slice(0, 30) + '...' 
        : cleanTitleText.length > 0 ? cleanTitleText : (attachmentForMessage ? 'Image design request' : 'New Chat');
      
      const newChat = { 
        id: targetChatId, 
        title: initialTitle, 
        messages: [userMessage, aiPlaceholder], 
        timestamp: new Date().toISOString(),
        isResearch: isResearchChat
      };
      setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0 || c.pendingResearchPrompt || c.pendingImagePrompt)]);
      setActiveChatId(targetChatId);
      localStorage.setItem('aura-active-chat-id', targetChatId);
      if (user?.uid) {
        const personalChatRef = doc(db, 'users', user.uid, 'personal_chats', targetChatId);
        setDoc(personalChatRef, {
          id: targetChatId,
          title: initialTitle,
          messages: [userMessage, aiPlaceholder],
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isArchived: false,
          isResearch: !!isResearchChat
        }).catch(err => console.error("Error saving new chat to Firestore:", err));
      }
    } else {
      setChats(prev => prev.map(c => 
        c.id === targetChatId ? { ...c, messages: [...(c.messages || []), userMessage, aiPlaceholder] } : c
      ));
    }

    if (!overrideInput) setInput('');
    const currentInput = textToSend;
    
    // Optimistically update local state for better UX ONLY if this chat is active
    if (activeChatId === targetChatId) {
      setMessages(prev => [...prev, userMessage, aiPlaceholder]);
    }

    if (isGroup) {
      try {
        await updateDoc(doc(db, 'chats', targetChatId), {
          messages: arrayUnion(userMessage, aiPlaceholder)
        });
      } catch (err) {
        console.error("Failed to sync group message:", err);
      }
    }
    abortControllersRef.current[targetChatId] = new AbortController();

    // 1. Generate a smart title in parallel if it's the first message
    if (isFirstMessage && !isTemporary) {
      (async () => {
        try {
          const cleanedInputForPrompt = cleanInputForPrompt(currentInput);
          const titlePrompt = `Analyze this user's first message and generate a highly descriptive, professional, and concise title (2-5 words) for the conversation. 
          First Message: "${attachmentForMessage ? `[Image: ${attachmentForMessage.name}] ${rawTextToSend}` : cleanedInputForPrompt}"
          
          
          Guidelines:
          - Identify the core topic, task, or intent of the message.
          - Format as a proper Title Case phrase (e.g., "Node.js Express API", "React Hooks Explanation", "Cart Page Issue").
          - If the message is a casual greeting ("hello", "hi", "hey"), return exactly "Greeting Exchange".
          - If the user's message is in Roman Urdu/Hindi (e.g., "message likh do"), return a professional title representing that (e.g., "Message Likhne Ki Request").
          - NEVER include quotes, markdown, or punctuation marks at the end. Return ONLY the title text.
          - Be specific, concise, and professional.`;
          
          const smartTitle = await getGeminiResponse(titlePrompt, []);
          const finalTitle = smartTitle.trim().replace(/["']/g, '');
          
          if (finalTitle && finalTitle.length < 50 && !finalTitle.includes("trouble connecting") && !finalTitle.includes("API Key") && finalTitle.toLowerCase() !== "new chat") {
            setChats(prev => prev.map(chat => {
              if (chat.messages && chat.messages.length > 0 && chat.messages[0].content === currentInput) {
                return { ...chat, title: finalTitle };
              }
              return chat;
            }));
          }
        } catch (titleError) {
          console.error("Failed to generate smart title:", titleError);
        }
      })();
    }

    try {
      let finalPrompt = textToSend;
      
      // Check if it's an image GENERATION request (either forceImageGen is true OR it's detected as an image prompt)
      const hasImageInHistory = messages.some(m => 
        m.attachment?.type?.startsWith('image/') || 
        m.imageUrl || 
        m.isAspectGeneration || 
        m.pendingImagePrompt
      );
      
      const romanUrduPatterns = [
        'ki image', 'ki photo', 'ki pic', 'ki tasveer', 'ki tasweer', 'ki tasvir',
        'ka image', 'ka photo', 'ka pic', 'ka tasveer', 'ka tasweer',
        'ko image', 'ko photo', 'ko pic',
        'image bana', 'photo bana', 'tasveer bana', 'tasweer bana', 'tasvir bana',
        'bana do', 'banao', 'bana de', 'kardo', 'kar do'
      ];
      const isRomanUrdu = romanUrduPatterns.some(pattern => rawTextToSend.toLowerCase().includes(pattern));

      const isImgReq = forceImageGen || (!attachmentForMessage && isImagePrompt(rawTextToSend) && !hasImageInHistory && !isRomanUrdu);
      if (isImgReq) {
        setGeneratingIds(prev => ({ ...prev, [targetChatId]: aiMessageId }));
        
        const generatingImageMessage = { 
          ...aiPlaceholder, 
          content: '', 
          isPlaceholder: false, 
          isAspectGeneration: true, 
          aspectGenDone: false, 
          ratio: '1:1', 
          prompt: rawTextToSend.trim(), 
          imageId: 'img_' + Date.now(), 
          imageUrl: null, 
          timestamp: new Date().toISOString() 
        };
        
        // Optimistically show the empty card
        if (activeChatId === targetChatId) {
          setMessages(prev => prev.map(m => m.id === aiMessageId ? generatingImageMessage : m));
        }
        setChats(prevChats => prevChats.map(c => 
          c.id === targetChatId ? {
            ...c,
            messages: c.messages.map(m => m.id === aiMessageId ? generatingImageMessage : m)
          } : c
        ));

        try {
          const hfToken = process.env.NEXT_PUBLIC_HF_ACCESS_TOKEN || '';
          const result = await generateImageClientSide(rawTextToSend.trim(), hfToken);
          const data = { imageUrl: result.url };
          if (!result.url) throw new Error('Failed to generate image');
          
          const aiResponse = `![image](${data.imageUrl})`;
          
          const updatedImageMessage = { 
            ...aiPlaceholder, 
            content: '', 
            isPlaceholder: false, 
            isAspectGeneration: true, 
            aspectGenDone: false, 
            ratio: '1:1', 
            prompt: rawTextToSend.trim(), 
            imageId: 'img_' + Date.now(), 
            imageUrl: data.imageUrl, 
            timestamp: new Date().toISOString() 
          };
          
          setMessages(prev => prev.map(m => m.id === aiMessageId ? updatedImageMessage : m));
          setChats(prevChats => prevChats.map(c => 
            c.id === targetChatId ? {
              ...c,
              messages: c.messages.map(m => m.id === aiMessageId ? updatedImageMessage : m)
            } : c
          ));
          
          if (isGroup) {
            try {
              const chatRef = doc(db, 'chats', activeChatId);
              const docSnap = await getDoc(chatRef);
              if (docSnap.exists()) {
                const currentMsgs = docSnap.data().messages || [];
                const updatedMsgs = currentMsgs.map(m => 
                  m.id === aiMessageId ? { 
                    ...m, 
                    content: '', 
                    isPlaceholder: false, 
                    isAspectGeneration: true, 
                    aspectGenDone: false, 
                    ratio: '1:1', 
                    prompt: rawTextToSend.trim(), 
                    imageId: 'img_' + Date.now(), 
                    imageUrl: data.imageUrl, 
                    timestamp: new Date().toISOString() 
                  } : m
                );
                await updateDoc(chatRef, { 
                  messages: updatedMsgs,
                  [`streamContent.${aiMessageId}`]: null
                });
              }
            } catch (err) {
              console.error("Failed to sync direct AI image response to group:", err);
            }
          }
        } catch (err) {
          console.error('Image generation error:', err);
          const errorMsg = err.message || "I'm sorry, I encountered an error while trying to generate the image. Please try again.";
          setMessages(prev => prev.map(m => 
            m.id === aiMessageId ? { ...m, content: errorMsg, isPlaceholder: false } : m
          ));
          setChats(prevChats => prevChats.map(c => 
            c.id === targetChatId ? {
              ...c,
              messages: c.messages.map(m => m.id === aiMessageId ? { ...m, content: errorMsg, isPlaceholder: false } : m)
            } : c
          ));
        } finally {
          delete abortControllersRef.current[targetChatId];
          setLoadingChats(prev => ({ ...prev, [targetChatId]: false }));
          setGeneratingIds(prev => { const next = {...prev}; delete next[targetChatId]; return next; });
        }
        return;
      }
      
      let currentResponse = "";
      let lastStreamSync = 0;
      const STREAM_INTERVAL = 250; // ms between Firestore streaming writes

      const onUpdate = (text) => {
        currentResponse = text;
        const cleanText = stripGenerateImageTag(text);
        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: cleanText } : m));
        
        // Update global state directly so background generations aren't lost when switching chats
        setChats(prevChats => prevChats.map(c => 
          c.id === targetChatId ? {
            ...c,
            messages: c.messages.map(m => m.id === aiMessageId ? { ...m, content: cleanText } : m)
          } : c
        ));

        // Throttle-stream the growing content to Firestore so other group members see it live
        if (isGroup) {
          const now = Date.now();
          if (now - lastStreamSync > STREAM_INTERVAL) {
            lastStreamSync = now;
            updateDoc(doc(db, 'chats', targetChatId), {
              [`streamContent.${aiMessageId}`]: text
            }).catch(console.error);
          }
        }
      };

      let activePersonalization = { ...personalization };
      if (currentChat?.isAppChat && currentChat?.appId) {
        const appSystemPrompt = APP_SYSTEM_PROMPTS[currentChat.appId];
        if (appSystemPrompt) {
          activePersonalization.systemPrompt = appSystemPrompt;
        }
      }

      const aiResponse = await getGeminiResponse(finalPrompt, historySnapshot, activePersonalization, abortControllersRef.current[targetChatId].signal, onUpdate, aiModel);
      
      let finalResponseContent = aiResponse;
      const genImageMatch = aiResponse.match(/\[GENERATE_IMAGE:\s*([^\]]+)\]/i);
      let imagePrompt = null;
      
      if (genImageMatch) {
        imagePrompt = genImageMatch[1].trim();
        // Remove the GENERATE_IMAGE tag from the displayed text
        finalResponseContent = aiResponse.replace(/\[GENERATE_IMAGE:\s*([^\]]+)\]/gi, '').trim();
      }

      // Always update local state with final response to clear placeholder status and store the pending prompt
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId ? { ...m, content: finalResponseContent, isPlaceholder: false, pendingImagePrompt: imagePrompt } : m
      ));
      setChats(prevChats => prevChats.map(c => 
        c.id === targetChatId ? {
          ...c,
          messages: c.messages.map(m => m.id === aiMessageId ? { ...m, content: finalResponseContent, isPlaceholder: false, pendingImagePrompt: imagePrompt } : m)
        } : c
      ));

      if (isGroup) {
        try {
          const chatRef = doc(db, 'chats', targetChatId);
          const docSnap = await getDoc(chatRef);
          if (docSnap.exists()) {
            const currentMsgs = docSnap.data().messages || [];
            const updatedMsgs = currentMsgs.map(m => 
              m.id === aiMessageId ? { ...m, content: finalResponseContent, isPlaceholder: false, _typewriter: false, pendingImagePrompt: imagePrompt } : m
            );
            // Save final message + clear the streaming temp field
            await updateDoc(chatRef, { 
              messages: updatedMsgs,
              [`streamContent.${aiMessageId}`]: null
            });
          }
        } catch (err) {
          console.error("Failed to sync AI response to group:", err);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
        const partialText = currentResponse || "Response stopped.";
        
        // Always update local state
        setMessages(prev => prev.map(m => 
          m.id === aiMessageId ? { ...m, content: partialText, isPlaceholder: false, isStopped: true, _typewriter: false } : m
        ));
        setChats(prevChats => prevChats.map(c => 
          c.id === targetChatId ? {
            ...c,
            messages: c.messages.map(m => m.id === aiMessageId ? { ...m, content: partialText, isPlaceholder: false, isStopped: true, _typewriter: false } : m)
          } : c
        ));

        if (isGroup) {
          try {
            const chatRef = doc(db, 'chats', targetChatId);
            const docSnap = await getDoc(chatRef);
            if (docSnap.exists()) {
              const currentMsgs = docSnap.data().messages || [];
              const updatedMsgs = currentMsgs.map(m => 
                m.id === aiMessageId ? { ...m, content: partialText, isPlaceholder: false, isStopped: true, _typewriter: false } : m
              );
              await updateDoc(chatRef, { messages: updatedMsgs });
            }
          } catch (err) {
            console.error("Failed to sync partial AI response:", err);
          }
        }
      } else {
        console.error(error);
      }
    } finally {
      delete abortControllersRef.current[targetChatId];
      
      // Clear generating status
      setLoadingChats(prev => ({ ...prev, [targetChatId]: false }));
      if (chats.find(c => c.id === targetChatId)?.isGroup) {
        updateDoc(doc(db, 'chats', targetChatId), { isGenerating: false }).catch(console.error);
      }
    }
  };

  useEffect(() => {
    if (!activeChatId || isLoading) return;
    const currentChat = chats.find(c => c.id === activeChatId);
    if (currentChat?.isAppChat && currentChat?.needsIntro) {
      // 1. Remove the flag immediately to prevent duplicate triggers
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, needsIntro: false } : chat
      ));
      
      // 2. Trigger direct send
      const prompt = `Introduce ${currentChat.title} assistant: what is it, what does it do, and how can I use it?`;
      handleSend(null, prompt);
    }
  }, [activeChatId, chats, isLoading]);

  useEffect(() => {
    if (!activeChatId || isLoading) return;
    const currentChat = chats.find(c => c.id === activeChatId);
    if (currentChat?.pendingResearchPrompt) {
      const prompt = currentChat.pendingResearchPrompt;
      // 1. Remove the flag immediately to prevent duplicate triggers
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, pendingResearchPrompt: null } : chat
      ));
      
      // 2. Trigger direct send
      handleSend(null, prompt);
    } else if (currentChat?.pendingImagePrompt) {
      const prompt = currentChat.pendingImagePrompt;
      const attachment = currentChat.pendingImageAttachment;
      // 1. Remove the flag immediately to prevent duplicate triggers
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId ? { ...chat, pendingImagePrompt: null, pendingImageAttachment: null } : chat
      ));
      
      // 2. Set attachment if present
      if (attachment) {
        setPendingAttachment(attachment);
      }
      
      // 3. Trigger direct image send (forceImageGen = true)
      handleSend(null, prompt, false, true);
    }
  }, [activeChatId, chats, isLoading]);

  const handleSaveEdit = async (id) => {
    if (!editValue.trim() || isLoading) return;
    
    preventScrollRef.current = true;
    let userMsgIdx = -1;
    let currentMsgs = [];

    setMessages(prev => {
      userMsgIdx = prev.findIndex(m => m.id === id);
      if (userMsgIdx === -1) return prev;
      
      const newMsgs = [...prev];
      const m = newMsgs[userMsgIdx];
      if (m.content === editValue) return prev;

      // 1. Archive User Content
      const oldUserContent = m.content;
      const userVersions = m.versions || [oldUserContent];
      const newUserVersions = [...userVersions, editValue];
      const newVerIdx = newUserVersions.length - 1;
      
      newMsgs[userMsgIdx] = { 
        ...m, 
        content: editValue, 
        versions: newUserVersions, 
        currentVersionIndex: newVerIdx 
      };

      // 2. Archive AI Content (if it exists)
      const nextIdx = userMsgIdx + 1;
      if (newMsgs[nextIdx] && newMsgs[nextIdx].role === 'ai') {
        const aiMsg = newMsgs[nextIdx];
        const oldAiContent = aiMsg.content;
        const aiVersions = aiMsg.versions || [oldAiContent];
        
        const newAiVersions = [...aiVersions];
        // We'll fill newAiVersions[newVerIdx] after generation, but we must keep old ones intact
        
        newMsgs[nextIdx] = {
          ...aiMsg,
          content: '', // Clear for new streaming
          versions: newAiVersions,
          currentVersionIndex: newVerIdx,
          isPlaceholder: true,
          _typewriter: true
        };
      }
      
      currentMsgs = newMsgs;
      return newMsgs;
    });

    setEditingId(null);
    setEditValue('');
    setLoadingChats(prev => ({ ...prev, [activeChatId]: true }));
    isAtBottomRef.current = true; // Focus on the regenerated response
    scrollToBottom(true);
    abortControllerRef.current = new AbortController();

    try {
      const history = currentMsgs.slice(0, userMsgIdx + 1);
      const aiMessageId = Date.now() + 1;
      setGeneratingId(aiMessageId);
      
      const nextMsg = currentMsgs[userMsgIdx + 1];
      const isNextAI = nextMsg && nextMsg.role === 'ai';

      if (!isNextAI) {
        setMessages(prev => {
          const updated = [...prev];
          updated.splice(userMsgIdx + 1, 0, { 
            role: 'ai', 
            content: '', 
            id: aiMessageId, 
            timestamp: new Date().toISOString(),
            isPlaceholder: true,
            _typewriter: true
          });
          return updated;
        });
      }

      const onUpdate = (text) => {
        setMessages(prev => {
          const updated = [...prev];
          const targetIdx = userMsgIdx + 1;
          if (updated[targetIdx] && updated[targetIdx].role === 'ai') {
            updated[targetIdx] = { ...updated[targetIdx], content: stripGenerateImageTag(text) };
          }
          return updated;
        });
      };

      let activePersonalization = { ...personalization };
      const currentChat = chats.find(c => c.id === activeChatId);
      if (currentChat?.isAppChat && currentChat?.appId) {
        const appSystemPrompt = APP_SYSTEM_PROMPTS[currentChat.appId];
        if (appSystemPrompt) {
          activePersonalization.systemPrompt = appSystemPrompt;
        }
      }

      const aiResponse = await getGeminiResponse(editValue, history, activePersonalization, abortControllerRef.current.signal, onUpdate, aiModel);
      
      setMessages(prev => {
        const updated = [...prev];
        const targetIdx = userMsgIdx + 1;
        if (updated[targetIdx] && updated[targetIdx].role === 'ai') {
          const aiMsg = updated[targetIdx];
          const userMsg = updated[userMsgIdx];
          const targetVerIdx = userMsg.currentVersionIndex;
          
          const newAiVersions = [...(aiMsg.versions || [])];
          newAiVersions[targetVerIdx] = aiResponse;

          updated[targetIdx] = { 
            ...aiMsg, 
            content: aiResponse, 
            versions: newAiVersions, 
            currentVersionIndex: targetVerIdx,
            isPlaceholder: false
          };
        }
        return updated;
      });

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("AI generation for edit was stopped by user.");
        setMessages(prev => {
          const updated = [...prev];
          const targetIdx = userMsgIdx + 1;
          if (updated[targetIdx] && updated[targetIdx].role === 'ai') {
            updated[targetIdx] = {
              ...updated[targetIdx],
              isPlaceholder: false,
              _typewriter: false
            };
          }
          return updated;
        });
      } else {
        console.error("Failed to generate AI response for edit:", error);
      }
    } finally {
      setLoadingChats(prev => ({ ...prev, [activeChatId]: false }));
      setGeneratingId(null);
      setTimeout(() => { preventScrollRef.current = false; }, 500);
    }
  };

  const handleVersionChange = (msgId, delta) => {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msgId);
      if (idx === -1) return prev;
      
      const m = prev[idx];
      const newIndex = Math.max(0, Math.min(m.versions.length - 1, m.currentVersionIndex + delta));
      if (newIndex === m.currentVersionIndex) return prev;

      preventScrollRef.current = true;
      const updated = [...prev];
      updated[idx] = { ...m, currentVersionIndex: newIndex, content: m.versions[newIndex] };
      
      // Synchronize AI response version
      const nextIdx = idx + 1;
      if (updated[nextIdx] && updated[nextIdx].role === 'ai' && updated[nextIdx].versions) {
        const aiMsg = updated[nextIdx];
        if (aiMsg.versions[newIndex] !== undefined) {
          updated[nextIdx] = { 
            ...aiMsg, 
            currentVersionIndex: newIndex, 
            content: aiMsg.versions[newIndex] 
          };
        }
      }
      
      setTimeout(() => { preventScrollRef.current = false; }, 500);
      return updated;
    });
  };

  const handleDeleteMsg = async () => {
    if (!msgDeleteConfirm.id) return;
    
    const userId = user?.uid;
    if (!userId) return;

    const currentChat = chats.find(c => c.id === activeChatId);
    if (currentChat?.isGroup) {
      try {
        const chatRef = doc(db, 'chats', activeChatId);
        const docSnap = await getDoc(chatRef);
        if (docSnap.exists()) {
          const currentMsgs = docSnap.data().messages || [];
          const updatedMsgs = currentMsgs.map(m => {
            if (m.id === msgDeleteConfirm.id) {
              const deletedBy = m.deletedBy || [];
              if (!deletedBy.includes(userId)) {
                return { ...m, deletedBy: [...deletedBy, userId] };
              }
            }
            return m;
          });
          await updateDoc(chatRef, { messages: updatedMsgs });
        }
      } catch (err) {
        console.error("Failed to delete group message:", err);
      }
    } else {
      setMessages(prev => prev.filter(m => m.id !== msgDeleteConfirm.id));
    }
    setMsgDeleteConfirm({ open: false, id: null });
  };

  const [copied, setCopied] = useState(false);

  const handleDownload = (e, url, filename) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'generated_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderShareModal = () => {
    if (!activeShareImage) return null;
    const modalBg = resolvedTheme === 'dark' ? '#232325' : '#ffffff';
    const cardBorder = resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)';
    const textColor = resolvedTheme === 'dark' ? '#ffffff' : '#000000';
    const subtextColor = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';

    const closeShare = () => {
      setShareModalState('closing');
      setTimeout(() => {
        setActiveShareImage(null);
        setShareModalState('closed');
      }, 750);
    };

    return (
      <div
        onClick={closeShare}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.25s ease-out',
          padding: '24px'
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            background: modalBg,
            border: cardBorder,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: resolvedTheme === 'dark' ? '0 25px 50px rgba(0, 0, 0, 0.5)' : 'var(--shadow-lg)',
            animation: shareModalState === 'closing' 
              ? 'shareExitLeft 0.75s cubic-bezier(0.32, 0, 0.67, 0) forwards' 
              : 'shareSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Header Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px 16px 32px', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: textColor, fontFamily: "'Outfit', sans-serif", lineHeight: '1.2' }}>
              {makeShortImageName(activeShareImage.prompt)}
            </h3>
            <button
              type="button"
              onClick={closeShare}
              style={{
                background: 'none',
                border: resolvedTheme === 'dark' ? '1.5px solid rgba(255, 255, 255, 0.4)' : '1.5px solid var(--divider)',
                borderRadius: '10px',
                color: textColor,
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = textColor;
                e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'var(--divider)';
                e.currentTarget.style.background = 'none';
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ height: '1px', background: 'var(--divider)', margin: '0 32px' }} />

          {/* Framed Image Container */}
          <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center', background: 'transparent' }}>
            <div style={{ background: '#ffffff', padding: '8px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)', width: 'fit-content' }}>
              <div style={{ background: '#000000', padding: '12px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={activeShareImage.url || null} 
                  alt={activeShareImage.prompt}
                  onError={(e) => handleImgError(e, activeShareImage.prompt)}
                  style={{ maxHeight: '260px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 32px 32px 32px', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + activeShareImage.url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e25c1d', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s', boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)', margin: '0 auto' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Link2 size={22} />
              </button>
              <span style={{ fontSize: '12.5px', color: subtextColor, fontWeight: 500, textAlign: 'center' }}>{copied ? 'Copied!' : 'Copy link'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this AI generated image: ' + activeShareImage.prompt)}&url=${encodeURIComponent(window.location.origin + activeShareImage.url)}`, '_blank');
                }}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e25c1d', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s', boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)', margin: '0 auto' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <span style={{ fontSize: '12.5px', color: subtextColor, fontWeight: 500, textAlign: 'center' }}>X</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + activeShareImage.url)}`, '_blank');
                }}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e25c1d', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s', boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)', margin: '0 auto' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <span style={{ fontSize: '12.5px', color: subtextColor, fontWeight: 500, textAlign: 'center' }}>LinkedIn</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.origin + activeShareImage.url)}&title=${encodeURIComponent(activeShareImage.prompt)}`, '_blank');
                }}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e25c1d', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s', boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)', margin: '0 auto' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.68-6.24-1.78l1.3-4.1 4.26 1c.06 1.12.98 2 2.12 2 1.24 0 2.25-1.01 2.25-2.25S19.24 3 18 3c-1 0-1.84.66-2.13 1.58l-4.72-1.1c-.26-.06-.52.1-.59.36l-1.44 4.54C6.67 7.42 4.4 8.08 2.74 9.1 2.18 8.34 1.27 7.86.3 7.86a3 3 0 0 0-3 3c0 1.22.74 2.28 1.8 2.74a4.42 4.42 0 0 0-.08.6c0 3.65 4.57 6.63 10.2 6.63s10.2-2.98 10.2-6.63c0-.2-.03-.4-.08-.6 1.06-.46 1.8-1.52 1.8-2.74zm-18.75 1a1.25 1.25 0 1 1 1.25 1.25c-.69 0-1.25-.56-1.25-1.25zm10.75 3.3c-1.34 1.34-3.88 1.34-5.22 0a.49.49 0 0 1 0-.7.49.49 0 0 1 .7 0c.93.93 2.87.93 3.8 0a.49.49 0 0 1 .7.7zM16.72 12.5a1.25 1.25 0 1 1 1.25-1.25 1.25 1.25 0 0 1-1.25 1.25z"/>
                </svg>
              </button>
              <span style={{ fontSize: '12.5px', color: subtextColor, fontWeight: 500, textAlign: 'center' }}>Reddit</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={(e) => handleDownload(e, activeShareImage.url, `${activeShareImage.id}.png`)}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e25c1d', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s', boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)', margin: '0 auto' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Download size={22} />
              </button>
              <span style={{ fontSize: '12.5px', color: subtextColor, fontWeight: 500, textAlign: 'center' }}>Download</span>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes shareSlideUp {
            0% { transform: translateY(100vh); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes shareExitLeft {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(-30px, 100vh) rotate(-12deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  };

  const renderGallerySelectModal = () => {
    if (!showGallerySelectModal || typeof document === 'undefined') return null;
    return createPortal(
      <div
        onClick={() => setShowGallerySelectModal(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1000000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
        className="animate-fade-in"
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            height: '520px',
            background: resolvedTheme === 'dark' ? '#202022' : 'var(--surface-1)',
            border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'var(--divider)'}`,
            borderRadius: '24px',
            boxShadow: resolvedTheme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '24px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: resolvedTheme === 'dark' ? '#ffffff' : 'var(--on-surface)', fontFamily: 'inherit' }}>
              Add from library
            </span>
            <button
              onClick={() => setShowGallerySelectModal(false)}
              style={{
                background: 'none', border: 'none', color: resolvedTheme === 'dark' ? '#ffffff' : 'var(--on-surface)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '6px', borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input Bar */}
          <div style={{
            background: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--surface-2)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '10px',
            marginBottom: '16px',
            border: resolvedTheme === 'dark' ? 'none' : '1px solid var(--divider)'
          }}>
            <input
              type="text"
              placeholder="Search library"
              value={gallerySearchQuery}
              onChange={e => setGallerySearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: resolvedTheme === 'dark' ? '#ffffff' : 'var(--on-surface)',
                fontSize: '15px',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Scrollable List Content */}
          <div 
            style={{ 
              overflowY: 'auto', 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingRight: '4px'
            }}
            className="custom-scrollbar"
          >
            {libraryFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--on-surface-muted)', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <FileText size={40} style={{ opacity: 0.5 }} />
                <span>No files in your library yet.</span>
              </div>
            ) : (() => {
              const filtered = libraryFiles.filter(file => {
                const filename = (file.name || '').toLowerCase();
                const query = gallerySearchQuery.toLowerCase();
                return filename.includes(query);
              });

              if (filtered.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--on-surface-muted)' }}>
                    No matches found
                  </div>
                );
              }

              return filtered.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    setPendingAttachment({
                      id: file.id,
                      name: file.name,
                      type: file.type,
                      url: file.thumbnailUrl || file.url
                    });
                    setShowGallerySelectModal(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {renderFileThumbnail(file, 40)}
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: resolvedTheme === 'dark' ? '#ffffff' : 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: '11.5px', color: resolvedTheme === 'dark' ? '#8b8b8f' : 'var(--on-surface-muted)', marginTop: '2px' }}>
                      Last modified {file.modified || (file.timestamp ? new Date(file.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently')}
                    </span>
                  </div>
                </button>
              ));
            })()}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (!mounted) return null;

  const currentChat = chats.find(c => c.id === activeChatId);
  const isResearchChat = currentChat?.isResearch || currentChat?.pendingResearchPrompt;

  if (appView === 'library') {
    return (
      <div className="flex-1 min-w-0 flex flex-col relative bg-primary transition-colors duration-500" style={{ overflow: 'hidden', height: '100dvh' }}>
        <LibraryView />
      </div>
    );
  }

  if (appView === 'apps') {
    return (
      <div className="flex-1 min-w-0 flex flex-col relative bg-primary transition-colors duration-500" style={{ overflow: 'hidden', height: '100dvh' }}>
        <AppsView />
      </div>
    );
  }

  if (appView === 'research') {
    return (
      <div className="flex-1 min-w-0 flex flex-col relative bg-primary transition-colors duration-500" style={{ overflow: 'hidden', height: '100dvh' }}>
        <ResearchView 
          onStartResearch={(promptText) => {
            const newId = Date.now().toString();
            const newChat = {
              id: newId,
              title: promptText.length > 30 ? promptText.slice(0, 30) + '...' : promptText,
              messages: [],
              timestamp: new Date().toISOString(),
              pendingResearchPrompt: promptText,
              isResearch: true
            };
            setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0 || c.pendingResearchPrompt)]);
            setActiveChatId(newId);
            setMessages([]);
            setAppView('chat');
          }}
        />
      </div>
    );
  }

  if (appView === 'images') {
    return (
      <div className="flex-1 min-w-0 flex flex-col relative bg-primary transition-colors duration-500" style={{ overflow: 'hidden', height: '100dvh' }}>
        <ImagesView 
          onStartImageChat={(promptText, attachment) => {
            const newId = Date.now().toString();
            const newChat = {
              id: newId,
              title: promptText.length > 30 ? promptText.slice(0, 30) + '...' : promptText,
              messages: [],
              timestamp: new Date().toISOString(),
              pendingImagePrompt: promptText,
              pendingImageAttachment: attachment
            };
            setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0 || c.pendingResearchPrompt || c.pendingImagePrompt)]);
            setActiveChatId(newId);
            setMessages([]);
            setAppView('chat');
          }}
          onOpenGallerySelect={() => chatFileInputRef.current?.click()}
        />
        {renderGallerySelectModal()}
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col relative bg-primary transition-colors duration-500" style={{ overflow: 'hidden', height: '100dvh' }}>
      <PeopleModal 
        isOpen={isPeopleModalOpen} 
        onClose={() => setIsPeopleModalOpen(false)} 
        onAddPeople={() => { setGroupLinkChatId(activeChatId); setIsGroupLinkModalOpen(true); setIsPeopleModalOpen(false); }}
        activeChat={chats.find(c => c.id === activeChatId)}
      />
      <DeleteGroupModal 
        isOpen={isDeleteConfirmOpen} 
        onClose={() => setIsDeleteConfirmOpen(false)} 
        onConfirm={handleDeleteGroup} 
        groupName={chats.find(c => c.id === activeChatId)?.title}
      />
      <RenameGroupModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onConfirm={handleRenameGroup}
        initialValue={tempGroupName}
      />
      <GroupLinkModal 
        isOpen={isGroupLinkModalOpen} 
        onClose={() => setIsGroupLinkModalOpen(false)} 
        chatId={groupLinkChatId} 
        showGlobalToast={showGlobalToast}
      />
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSubmit={() => {
          setIsReportModalOpen(false);
          showGlobalToast("Report sent successfully");
        }}
      />
      <CustomizedKyraModal 
        isOpen={isKyraModalOpen}
        onClose={() => setIsKyraModalOpen(false)}
        activeChat={chats.find(c => c.id === activeChatId)}
        onUserClick={(user) => setSelectedUserForProfile(user)}
      />
      <UserProfileModal 
        user={selectedUserForProfile}
        onClose={() => setSelectedUserForProfile(null)}
      />
      <MsgDeleteModal 
        isOpen={msgDeleteConfirm.open}
        onClose={() => setMsgDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDeleteMsg}
      />
      <style>{`
        .temp-placeholder::placeholder {
          color: ${isTemporary ? (resolvedTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)') : 'var(--on-surface-subtle)'} !important;
          opacity: 1 !important;
        }
      `}</style>
      {isMobile && !chats.find(c => c.id === activeChatId)?.isGroup ? (
        !showLoggedIn ? (
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: 60, position: 'sticky', top: 0, zIndex: 80,
            background: 'var(--bg-primary)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--divider)',
          }}>
            {/* Left: Hamburger menu */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                border: 'none', cursor: 'pointer',
                width: '44px', height: '44px', borderRadius: '50%', color: 'var(--on-surface)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
            >
              {isSidebarOpen ? (
                <X size={20} strokeWidth={2.5} />
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="13" y2="16" />
                </svg>
              )}
            </button>

            {/* Center: App Title */}
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--on-surface)',
              fontFamily: 'inherit',
              textAlign: 'center'
            }}>
              {isSharedReadOnly ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Shared Chat</span>
                </div>
              ) : (
                "Kyra"
              )}
            </div>

            {/* Right: Log In Button */}
            <button 
              onClick={() => setAuthOpen(true)}
              style={{
                background: 'var(--on-surface)',
                color: 'var(--bg-primary)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Log in
            </button>
          </header>
        ) : (
          <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 60, position: 'sticky', top: 0, zIndex: 80,
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--divider)',
        }}>
          {/* Left: Stylish staggered hamburger icon */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              border: 'none', cursor: 'pointer',
              width: '44px', height: '44px', borderRadius: '50%', color: 'var(--on-surface)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
          >
            {isSidebarOpen ? (
              <X size={20} strokeWidth={2.5} />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="13" y2="16" />
              </svg>
            )}
          </button>

          {isSharedReadOnly && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', flex: 1, textAlign: 'center', margin: '0 8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'Outfit, sans-serif' }}>Shared Chat</span>
            </div>
          )}

          {/* Right side buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!activeChatId || !chats.some(c => c.id === activeChatId && c.messages && c.messages.length > 0) ? (
              /* Temporary Chat Toggle Icon for new/empty chats */
              <button 
                onClick={() => {
                  if (isTemporary) {
                    setMessages([]);
                    setIsTemporary(false);
                  } else {
                    setIsTemporary(true);
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isTemporary 
                    ? 'var(--on-surface)' 
                    : (resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'),
                  border: 'none', cursor: 'pointer',
                  width: '44px', height: '44px', borderRadius: '50%',
                  color: isTemporary ? 'var(--bg-primary)' : 'var(--on-surface)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if(!isTemporary) e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'; }}
                onMouseLeave={e => { if(!isTemporary) e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'; }}
              >
                <MessageSquareDashed size={20} strokeWidth={2.2} />
              </button>
            ) : (
              /* Original icons for existing chats inside a pill/capsule background container */
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '999px',
                padding: '0 8px',
                height: '44px',
                gap: '4px'
              }}>
                {/* New Chat Icon */}
                <button 
                  onClick={() => {
                    createNewChat();
                    if (isMobile && isSidebarOpen) setIsSidebarOpen(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    width: '36px', height: '36px', borderRadius: '50%', color: 'var(--on-surface)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <SquarePen size={20} strokeWidth={2.2} />
                </button>

                {/* Options Vertical Kebab Icon */}
                <div className="relative" ref={headerMoreRef} style={{ display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => setIsHeaderMoreOpen(!isHeaderMoreOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      width: '36px', height: '36px', borderRadius: '50%', color: 'var(--on-surface)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <MoreVertical size={20} strokeWidth={2.2} />
                  </button>

                  <AnimatePresence>
                    {isHeaderMoreOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute"
                        style={{ 
                          right: -8,
                          top: '100%',
                          marginTop: '12px',
                          minWidth: '230px',
                          background: 'var(--surface-1)',
                          border: '1px solid var(--divider)',
                          borderRadius: '22px',
                          padding: '6px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                          transformOrigin: 'top right',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          zIndex: 100,
                        }}
                      >
                        <button 
                          onClick={() => { setIsShareModalOpen(true); setIsHeaderMoreOpen(false); }}
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
                          <Share2 size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Share chat</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (!showLoggedIn) {
                              setAuthOpen(true);
                            } else {
                              setGroupChatTargetId(activeChatId);
                              setIsGroupChatModalOpen(true); 
                            }
                            setIsHeaderMoreOpen(false); 
                          }}
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
                          <UserPlus size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Start a group chat</span>
                        </button>
                        <button 
                          onClick={() => {
                            const chat = chats.find(c => c.id === activeChatId);
                            if (chat) {
                              setChats(prev => {
                                const updated = prev.map(c => c.id === chat.id ? { ...c, pinned: !c.pinned } : c);
                                return [...updated.filter(c => c.pinned), ...updated.filter(c => !c.pinned)];
                              });
                            }
                            setIsHeaderMoreOpen(false);
                          }}
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
                          <Pin size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>{chats.find(c => c.id === activeChatId)?.pinned ? 'Unpin chat' : 'Pin chat'}</span>
                        </button>
                        <button 
                          onClick={() => {
                            const chat = chats.find(c => c.id === activeChatId);
                            if (chat) { archiveChat(chat.id); createNewChat(); }
                            setIsHeaderMoreOpen(false);
                          }}
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
                          <Archive size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Archive</span>
                        </button>
                        <div style={{ height: 1, background: 'var(--divider)', margin: '2px 4px' }} />
                        <button 
                          onClick={() => {
                            const chat = chats.find(c => c.id === activeChatId);
                            setDeleteConfirm({ open: true, id: activeChatId, name: chat?.title || 'this chat' });
                            setIsHeaderMoreOpen(false);
                          }}
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
                          <Trash2 size={16} style={{ color: '#ef4444', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Delete</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </header>
      )) : (
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 56, position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--bg-primary)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--divider)',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <button 
                className="hamburger-button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  display: 'none', // CSS will show this on mobile/narrow screens
                  alignItems: 'center', justifyContent: 'center',
                  background: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  border: 'none', cursor: 'pointer',
                  width: '44px', height: '44px', borderRadius: '50%', color: 'var(--on-surface)',
                  transition: 'background 0.2s',
                  marginRight: 8
                }}
                onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}
              >
                {isSidebarOpen ? (
                  <X size={20} strokeWidth={2.5} />
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                    <line x1="4" y1="8" x2="20" y2="8" />
                    <line x1="4" y1="16" x2="13" y2="16" />
                  </svg>
                )}
              </button>
            {isSharedReadOnly ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '4px 8px' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Outfit, sans-serif' }}>
                  <Globe size={16} className="text-on-surface-subtle" /> Shared Conversation
                </span>
              </div>
            ) : (
              <div className="relative" ref={groupChatMenuRef}>
                <button 
                  onClick={() => setIsGroupChatMenuOpen(!isGroupChatMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '8px 4px', borderRadius: 12, color: 'var(--on-surface)',
                    visibility: isSidebarOpen && isMobile ? 'hidden' : 'visible',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {isTemporary ? (
                    <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', color: 'var(--on-surface)' }}>Temporary Chat</span>
                  ) : chats.find(c => c.id === activeChatId)?.isGroup ? (
                    <>
                      <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.2px' }}>
                        {chats.find(c => c.id === activeChatId)?.title || 'Group Chat'}
                      </span>
                      <ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', marginTop: 1 }} />
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>Kyra</span>
                      <ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', marginTop: 1 }} />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {isGroupChatMenuOpen && chats.find(c => c.id === activeChatId)?.isGroup && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: 8,
                        width: 240, background: 'var(--surface-1)', borderRadius: 18,
                        border: '1px solid var(--divider)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        padding: 6, zIndex: 100, overflow: 'hidden'
                      }}
                    >
                      <button 
                        onClick={() => { setIsPeopleModalOpen(true); setIsGroupChatMenuOpen(false); }}
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                      >
                        <UserPlus size={18} className="text-on-surface-muted" />
                        <span className="text-[14px] font-medium text-on-surface">People</span>
                      </button>
                      {chats.find(c => c.id === activeChatId)?.creator?.uid === profile?.uid && (
                        <button 
                          onClick={() => { setGroupLinkChatId(activeChatId); setIsGroupLinkModalOpen(true); setIsGroupChatMenuOpen(false); }}
                          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                        >
                          <Paperclip size={18} className="text-on-surface-muted" />
                          <span className="text-[14px] font-medium text-on-surface">Manage group link</span>
                        </button>
                      )}
                      <button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                        <Edit2 size={18} className="text-on-surface-muted" />
                        <span className="text-[14px] font-medium text-on-surface" onClick={() => { 
                          const chat = chats.find(c => c.id === activeChatId);
                          setTempGroupName(chat?.title || '');
                          setIsRenameModalOpen(true); 
                          setIsGroupChatMenuOpen(false); 
                        }}>Rename group</span>
                      </button>
                      <button 
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                        onClick={() => { setIsKyraModalOpen(true); setIsGroupChatMenuOpen(false); }}
                      >
                        <Settings size={18} className="text-on-surface-muted" />
                        <span className="text-[14px] font-medium text-on-surface">Customized Kyra</span>
                      </button>
                      <button 
                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                        onClick={() => { setIsReportModalOpen(true); setIsGroupChatMenuOpen(false); }}
                      >
                        <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                        <span className="text-[14px] font-medium" style={{ color: '#ef4444' }}>Report</span>
                      </button>
                      {chats.find(c => c.id === activeChatId)?.creator?.uid === profile?.uid ? (
                        <button 
                          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                          onClick={() => { setIsDeleteConfirmOpen(true); setIsGroupChatMenuOpen(false); }}
                        >
                          <Trash2 size={18} style={{ color: '#ef4444' }} />
                          <span className="text-[14px] font-medium" style={{ color: '#ef4444' }}>Delete group</span>
                        </button>
                      ) : (
                        <button 
                          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                          onClick={() => { setIsExitConfirmOpen(true); setIsGroupChatMenuOpen(false); }}
                        >
                          <LogOut size={18} style={{ color: '#ef4444' }} />
                          <span className="text-[14px] font-medium" style={{ color: '#ef4444' }}>Exit group</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {chats.find(c => c.id === activeChatId)?.isGroup ? (
              <div 
                onClick={() => setIsPeopleModalOpen(true)}
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: 'var(--hover-overlay-2)', overflow: 'hidden',
                  border: '1px solid var(--divider)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={18} style={{ color: 'var(--on-surface-subtle)' }} />
                )}
              </div>
            ) : (
              (!showLoggedIn && (isTemporary || messages.length === 0)) ? (
                <div className="flex items-center gap-2 mr-2">
                  <button 
                    onClick={() => setAuthOpen(true)}
                    className="rounded-full font-medium transition-colors hover:opacity-90"
                    style={{ background: '#ffffff', color: '#000000', padding: '8px 18px', fontSize: '15px' }}
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => setAuthOpen(true)}
                    className="rounded-full font-medium transition-colors hover:opacity-90"
                    style={{ background: '#2a2a2a', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 18px', fontSize: '15px' }}
                  >
                    Sign up for free
                  </button>
                </div>
              ) : (isTemporary || messages.length === 0) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Free offer badge linking to Upgrade plan */}
                  <button
                    onClick={() => router.push('/upgrade')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      background: 'transparent',
                      color: 'var(--on-surface)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 0.85; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 1; }}
                  >
                    <Gift size={16} style={{ color: 'var(--on-surface-muted)' }} />
                    <span style={{
                      color: '#60a5fa',
                      textShadow: '0 0 10px rgba(96,165,250,0.3)',
                    }}>Free offer</span>
                  </button>

                  <button 
                    onClick={() => {
                      if (isTemporary) {
                        setMessages([]);
                        setIsTemporary(false);
                      } else {
                        setIsTemporary(true);
                      }
                    }}
                    title="Temporary Chat"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: isTemporary ? 'var(--on-surface)' : 'transparent',
                      color: isTemporary ? 'var(--bg-primary)' : 'var(--on-surface-muted)',
                      border: isTemporary ? 'none' : '1px solid var(--divider)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={e => { if(!isTemporary) e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                    onMouseLeave={e => { if(!isTemporary) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <MessageSquareDashed size={18} />
                    {isTemporary && (
                      <div style={{ 
                        position: 'absolute', bottom: '2px', right: '2px',
                        width: 6, height: 6, borderRadius: '50%', 
                        background: 'var(--bg-primary)' 
                      }} />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '999px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--on-surface)',
                      transition: 'background 0.15s',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Share size={16} />
                    <span>Share</span>
                  </button>
                  <div className="relative" ref={headerMoreRef}>
                    <button 
                      onClick={() => setIsHeaderMoreOpen(!isHeaderMoreOpen)}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isHeaderMoreOpen ? 'bg-hover-overlay text-on-surface' : 'text-on-surface-muted hover:text-on-surface hover:bg-hover-overlay'}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {isHeaderMoreOpen && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute top-full mt-2"
                          style={{ 
                            right: 0,
                            minWidth: '230px',
                            background: 'var(--surface-1)',
                            borderRadius: '20px',
                            padding: '6px',
                            boxShadow: resolvedTheme === 'dark' ? '0 30px 60px -12px rgba(0,0,0,0.3)' : 'none',
                            border: '1px solid var(--divider)',
                            transformOrigin: 'top right',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            zIndex: 100,
                          }}
                        >
                        <button 
                          onClick={() => { setIsShareModalOpen(true); setIsHeaderMoreOpen(false); }}
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
                          <Share2 size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Share chat</span>
                        </button>
                        <button 
                          onClick={() => { 
                            if (!showLoggedIn) {
                              setAuthOpen(true);
                            } else {
                              setGroupChatTargetId(activeChatId);
                              setIsGroupChatModalOpen(true); 
                            }
                            setIsHeaderMoreOpen(false); 
                          }}
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
                          <UserPlus size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Start a group chat</span>
                        </button>
                        <button 
                          onClick={() => {
                            const chat = chats.find(c => c.id === activeChatId);
                            if (chat) {
                              setChats(prev => {
                                const updated = prev.map(c => c.id === chat.id ? { ...c, pinned: !c.pinned } : c);
                                return [...updated.filter(c => c.pinned), ...updated.filter(c => !c.pinned)];
                              });
                            }
                            setIsHeaderMoreOpen(false);
                          }}
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
                          <Pin size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>{chats.find(c => c.id === activeChatId)?.pinned ? 'Unpin chat' : 'Pin chat'}</span>
                        </button>
                        <button 
                          onClick={() => {
                            const chat = chats.find(c => c.id === activeChatId);
                            if (chat) { archiveChat(chat.id); createNewChat(); }
                            setIsHeaderMoreOpen(false);
                          }}
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
                          <Archive size={16} style={{ color: 'var(--on-surface-muted)', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Archive</span>
                        </button>
                        <div style={{ height: 1, background: 'var(--divider)', margin: '2px 4px' }} />
                        <button 
                          onClick={() => {
                            const chat = chats.find(c => c.id === activeChatId);
                            setDeleteConfirm({ open: true, id: activeChatId, name: chat?.title || 'this chat' });
                            setIsHeaderMoreOpen(false);
                          }}
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
                          <Trash2 size={16} style={{ color: '#ef4444', flexShrink: 0 }} strokeWidth={1.5} />
                          <span style={{ whiteSpace: 'nowrap' }}>Delete</span>
                        </button>

                        {/* List generated images below if any exist in the chat */}
                        {(() => {
                          const imageMessages = messages.filter(m => m.isAspectGeneration || (m.content && m.content.startsWith('![image](')));
                          if (imageMessages.length === 0) return null;

                          return (
                            <>
                              <div style={{ height: 1, background: 'var(--divider)', margin: '6px 4px 4px 4px' }} />
                              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, padding: '2px' }} className="custom-scrollbar">
                                {imageMessages.map(msg => {
                                  let imageUrl = msg.imageUrl;
                                  if (!imageUrl && msg.content) {
                                    const match = msg.content.match(/\!\[image\]\((.*?)\)/);
                                    if (match && match[1]) imageUrl = match[1];
                                  }
                                  if (!imageUrl) return null;
                                  
                                  const promptText = makeShortImageName(msg.prompt);
                                  
                                  return (
                                    <button
                                      key={msg.id}
                                      onClick={() => {
                                        const el = document.getElementById(`msg-${msg.id}`);
                                        if (el) {
                                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }
                                        setIsHeaderMoreOpen(false);
                                      }}
                                      style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '6px 10px',
                                        borderRadius: 12,
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--on-surface)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontFamily: 'inherit',
                                        transition: 'background 0.15s',
                                        minWidth: 0,
                                        maxWidth: '220px',
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <img 
                                        src={imageUrl} 
                                        alt="" 
                                        onError={(e) => handleImgError(e, promptText)}
                                        style={{
                                          width: '36px',
                                          height: '36px',
                                          borderRadius: '8px',
                                          objectFit: 'cover',
                                          border: '1px solid var(--divider)',
                                          flexShrink: 0
                                        }} 
                                      />
                                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                        <span style={{ 
                                          fontSize: '13px', 
                                          fontWeight: 500, 
                                          color: 'var(--on-surface)', 
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {promptText}
                                        </span>
                                        <span style={{ 
                                          fontSize: '11px', 
                                          color: 'var(--on-surface-muted)',
                                          marginTop: '1px'
                                        }}>
                                          Image created
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                </div>
              )
            )}
          </div>
        </header>
      )}

      <main className="flex-1 relative bg-primary flex flex-col" style={{ overflow: 'hidden' }}>
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 custom-scrollbar flex flex-col"
          style={{ overflowY: 'auto', overflowX: 'hidden' }}
        >
          {/* Landing Page - Empty Chat (Only for non-group chats) */}
          {messages.length === 0 && !chats.find(c => c.id === activeChatId)?.isGroup && (isFirebaseChatsLoaded || !activeChatId || chats.some(c => c.id === activeChatId)) && (
            <div className={`flex-1 mx-auto w-full flex flex-col ${isMobile ? (isTemporary ? 'justify-center items-center py-6' : 'justify-between py-6') : 'items-center justify-center py-20'} px-2 md:px-4`} style={{ maxWidth: chatWidth === 'Wide' ? 'min(1000px, 100%)' : chatWidth === 'Full' ? '100%' : 'min(768px, 100%)' }}>
              <div className={`w-full flex flex-col ${isMobile ? (isTemporary ? 'items-center text-center' : 'items-start text-left flex-1') : 'items-center justify-center text-center'} animate-fade-in px-2 md:px-4`}>
                {showImageGen ? (
                  /* ===== INLINE IMAGE GENERATOR UI ===== */
                  <div className="w-full flex flex-col items-center animate-fade-in" style={{ maxWidth: '920px', margin: '0 auto' }}>
                    {/* Title */}
                    <h1 className="text-[32px] md:text-[56px] font-bold tracking-tight leading-tight" style={{
                      color: 'var(--on-surface)',
                      marginBottom: '32px',
                      textAlign: 'center',
                      fontFamily: "'Outfit', sans-serif",
                      letterSpacing: '-0.02em'
                    }}>
                      {imageGenHeadingText}
                    </h1>

                    {/* Image result display */}
                    {imageGenResult && (
                      <div className="animate-fade-in" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '480px', width: '100%' }}>
                          <img 
                            src={imageGenResult.url} 
                            alt={imageGenResult.prompt} 
                            onError={(e) => handleImgError(e, imageGenResult.prompt)}
                            style={{ width: '100%', display: 'block', borderRadius: '20px' }} 
                            referrerPolicy="no-referrer" 
                          />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '24px 16px 14px', borderRadius: '0 0 20px 20px' }}>
                            <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, margin: 0 }}>{imageGenResult.prompt}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => { const link = document.createElement('a'); link.href = imageGenResult.url; link.download = 'ai-image.jpg'; link.target = '_blank'; link.rel = 'noopener'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '999px', background: accentColor, color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                          >
                            <Download size={14} /> Download
                          </button>
                          <button
                            onClick={() => { setImageGenResult(null); setImageGenPrompt(''); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '999px', background: 'var(--hover-overlay)', color: 'var(--on-surface)', border: '1px solid var(--divider)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                          >
                            <Sparkles size={14} /> Create another
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Prompt Input Box */}
                    <ImageGenInput
                      imageGenPrompt={imageGenPrompt}
                      setImageGenPrompt={setImageGenPrompt}
                      isImageGenLoading={isImageGenLoading}
                      handleInlineImageGen={handleImageGenSubmit}
                      accentColor={accentColor}
                      onClose={() => { setShowImageGen(false); setImageGenResult(null); setImageGenPrompt(''); }}
                      pendingAttachment={pendingAttachment}
                      setPendingAttachment={setPendingAttachment}
                      chatFileInputRef={chatFileInputRef}
                      setIsVoiceMessageMode={setIsVoiceMessageMode}
                      voiceModeRef={voiceModeRef}
                      toggleListening={toggleListening}
                      setShowGallerySelectModal={setShowGallerySelectModal}
                    />

                    {/* Explore Ideas Section */}
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--on-surface)', fontFamily: "'Outfit', sans-serif" }}>Explore ideas</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => imageGenCarouselRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--divider)', background: 'var(--surface-1)', color: 'var(--on-surface-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => imageGenCarouselRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--divider)', background: 'var(--surface-1)', color: 'var(--on-surface-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Carousel */}
                      <div
                        ref={imageGenCarouselRef}
                        style={{
                          display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px',
                          scrollbarWidth: 'none', msOverflowStyle: 'none'
                        }}
                      >
                        {/* Upload a photo card */}
                        <div
                          onClick={() => chatFileInputRef.current?.click()}
                          style={{
                            flexShrink: 0, width: '160px', height: '190px', borderRadius: '20px',
                            background: 'var(--surface-1)', border: '1px solid var(--divider)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: '8px', cursor: 'pointer', transition: 'all 0.2s',
                            color: accentColor
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.transform = 'scale(1.02)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--divider)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: `2px dashed ${accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={20} style={{ color: accentColor }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: accentColor }}>Add a photo</span>
                        </div>

                        {/* Style cards */}
                        {[
                          { label: 'Disco mode', image: '/explore/disco.jpg', prompt: 'Create a vibrant disco dance floor with neon colorful lights, retro 80s synthwave vibe' },
                          { label: 'Improve Desk Setup', image: '/explore/desk.jpg', prompt: 'Create a sleek minimal workspace desk setup with a mechanical keyboard, warm ambient light, clean aesthetic' },
                          { label: 'Wanderlust', image: '/explore/wanderlust.jpg', prompt: 'Create a breathtaking scenic view of misty mountains during sunrise, travel adventure photography' },
                          { label: 'Scribble', image: '/explore/scribble.jpg', prompt: 'Create an expressive colorful scribble art portrait with chaotic abstract lines' },
                          { label: 'Anime comic', image: '/anime_comic.png', prompt: 'Create an anime manga style comic book page panel with a boy and a black cat' },
                          { label: 'App design', image: '/app_design.png', prompt: 'Create a sleek dark UI mobile dashboard application layout design mockup' },
                          { label: 'Food promo', image: '/my_pizza.png', prompt: 'Create a delicious gourmet Italian pizza with melting mozzarella cheese close-up' },
                          { label: 'Makeup guide', image: '/makeup_guide.png', prompt: 'Create a high-fashion cosmetic makeup guide showing eyeshadow, blush details, soft warm lighting' },
                          { label: 'Logo design', image: '/my_zypher_logo.png', prompt: 'Create a modern futuristic brand logo with a glowing purple and cyan letter Z' },
                          { label: 'Chibi stickers', image: '/chibi_stickers.png', prompt: 'Create a sheet of cute chibi style sticker designs' },
                          { label: 'AI Assistant', image: '/my_ai_assistant.png', prompt: 'Create a futuristic dark blue cybernetic AI robot assistant logo layout' },
                          { label: 'Landscape art', image: '/wanderlust.png', prompt: 'Create a wanderlust explorer mountain landscape digital painting' },
                        ].map((card, idx) => (
                          <div
                            key={idx}
                            onClick={() => setImageGenPrompt(card.prompt)}
                            style={{
                              flexShrink: 0, width: '160px', height: '190px', borderRadius: '20px',
                              position: 'relative', overflow: 'hidden', cursor: 'pointer',
                              transition: 'all 0.2s', border: '2px solid transparent'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            <img src={card.image} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '28px 10px 10px', borderRadius: '0 0 18px 18px' }}>
                              <span style={{ color: '#ffffff', fontSize: '12.5px', fontWeight: 600 }}>{card.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : isTemporary ? (
                  <div className="flex flex-col items-center text-center space-y-3 w-full" style={{ marginBottom: isMobile ? '32px' : '60px' }}>
                    <h1 className="text-[32px] md:text-[52px] font-bold tracking-tight leading-tight" style={{ color: 'var(--on-surface)' }}>Temporary Chat</h1>
                    <p className="text-base max-w-2xl mx-auto text-center" style={{ color: 'var(--on-surface-muted)' }}>This chat won't appear in your chat history, and won't be used to train our models.</p>
                  </div>
                ) : (
                  !isMobile && <h1 className="text-[32px] md:text-[56px] font-bold tracking-tight leading-tight" style={{ color: 'var(--on-surface)', marginBottom: '60px' }}>{greeting}</h1>
                )}


                {isMobile && showLoggedIn && !isTemporary && <div className="flex-1" />}
                
                {isMobile && !showLoggedIn && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    width: '100%',
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    paddingBottom: '24px'
                  }} className="animate-fade-in">
                    <h1 style={{
                      fontSize: '28px',
                      fontWeight: '600',
                      color: 'var(--on-surface)',
                      textAlign: 'center',
                      marginBottom: '28px',
                      fontFamily: 'inherit'
                    }}>
                      What can I help with?
                    </h1>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      justifyContent: 'center',
                      width: '100%',
                      maxWidth: '360px'
                    }}>
                      {/* Code chip */}
                      <button
                        onClick={() => setInput("Write code to ")}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '999px',
                          border: '1px solid var(--divider)',
                          background: 'var(--surface-1)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <Code size={16} style={{ color: 'var(--on-surface-muted)' }} />
                        <span>Code</span>
                      </button>

                      {/* Surprise me chip */}
                      <button
                        onClick={() => {
                          const surprises = [
                            "Tell me a fun random fact",
                            "Suggest a cool programming project idea",
                            "Write a short haiku about coding",
                            "Give me a daily motivational quote"
                          ];
                          setInput(surprises[Math.floor(Math.random() * surprises.length)]);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '999px',
                          border: '1px solid var(--divider)',
                          background: 'var(--surface-1)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <Compass size={16} style={{ color: 'var(--on-surface-muted)' }} />
                        <span>Surprise me</span>
                      </button>

                      {/* Summarize text chip */}
                      <button
                        onClick={() => setInput("Summarize the following text: ")}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '999px',
                          border: '1px solid var(--divider)',
                          background: 'var(--surface-1)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={16} style={{ color: 'var(--on-surface-muted)' }} />
                        <span>Summarize text</span>
                      </button>

                      {/* More chip */}
                      <button
                        onClick={() => setActiveCategory('write')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 18px',
                          borderRadius: '999px',
                          border: '1px solid var(--divider)',
                          background: 'var(--surface-1)',
                          color: 'var(--on-surface)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <LayoutGrid size={16} style={{ color: 'var(--on-surface-muted)' }} />
                        <span>More</span>
                      </button>
                    </div>
                  </div>
                )}

                {isMobile && showLoggedIn && !isTemporary && messages.length === 0 && (
                  <div className={`flex flex-col items-start gap-2 mt-0 w-full max-w-3xl mx-auto px-2 mb-4`}>
                    {activeCategory !== 'write' && (
                      <button 
                        onClick={() => { setShowImageGen(true); setImageGenResult(null); setImageGenPrompt(''); }} 
                        className="w-full py-3 flex items-center gap-4 text-[15px] font-medium active:scale-95 transition-all text-left"
                        style={{ color: 'var(--on-surface)', backgroundColor: 'transparent' }}
                      >
                        <Image size={22} style={{ color: accentColor }} />
                        <span>Create an image</span>
                      </button>
                    )}

                    {activeCategory !== 'write' && (
                      <button 
                        onClick={() => setInput("Search for ")}
                        className="w-full py-3 flex items-center gap-4 text-[15px] font-medium active:scale-95 transition-all text-left"
                        style={{ color: 'var(--on-surface)', backgroundColor: 'transparent' }}
                      >
                        <Globe size={22} style={{ color: accentColor }} />
                        <span>Look something up</span>
                      </button>
                    )}

                    <div className={`w-full flex flex-col`} ref={activeCategory === 'write' ? categoryRef : null}>
                      {activeCategory === 'write' ? (
                        <div className="w-full flex flex-col animate-fade-in pb-2 gap-2">
                          {WRITE_SUGGESTIONS.map((s, idx) => (
                            <button 
                              key={idx}
                              onClick={() => { setInput(s.prompt); setActiveCategory(null); }}
                              className="flex items-center gap-4 py-3 text-[15px] font-medium text-left bg-transparent w-full"
                              style={{ color: 'var(--on-surface)' }}
                            >
                              <PenLine size={20} style={{ color: accentColor }} />
                              <span>{s.text}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button 
                          onClick={() => setActiveCategory('write')}
                          className="w-full py-3 flex items-center gap-4 text-[15px] font-medium active:scale-95 transition-all text-left"
                          style={{ color: 'var(--on-surface)', backgroundColor: 'transparent' }}
                        >
                          <PenTool size={22} style={{ color: accentColor }} />
                          <span>Write or edit</span>
                        </button>
                      )}
                    </div>



                  </div>
                )}

                {isMobile && !showLoggedIn ? (
                  <div className="w-full flex items-center gap-2 transition-all duration-300" style={{ padding: '0 4px' }}>
                    <div className="flex-shrink-0">
                      <button 
                        type="button"
                        className="w-10 h-10 flex items-center justify-center rounded-full transition-all border border-divider shadow-md"
                        style={{ 
                          color: 'var(--on-surface)',
                          background: 'var(--surface-1)',
                          borderColor: 'var(--divider)'
                        }}
                        onClick={() => setAuthOpen(true)}
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center border border-divider shadow-md transition-all duration-300"
                      style={{
                        background: 'var(--surface-1)', 
                        borderRadius: '24px', 
                        padding: '4px 4px 4px 14px',
                        height: '48px',
                        minHeight: '48px',
                        borderColor: 'var(--divider)'
                      }}
                    >
                      <form onSubmit={(e) => { e.preventDefault(); setAuthOpen(true); }} className="w-full flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <input 
                            ref={inputRef}
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onPaste={handleChatPaste}
                            placeholder="Ask anything..." 
                            className="w-full bg-transparent border-none outline-none text-[16px] temp-placeholder"
                            style={{ 
                              background: 'transparent', border: 'none', outline: 'none', 
                              color: 'var(--on-surface)', fontSize: 16,
                              padding: 0,
                              margin: 0,
                              height: '40px',
                              lineHeight: '40px'
                            }} 
                          />
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!input.trim() && (
                            <button 
                              type="button" 
                              onClick={() => setAuthOpen(true)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                              style={{ 
                                color: 'var(--on-surface-muted)',
                                backgroundColor: 'transparent',
                                border: 'none',
                              }}
                            >
                              <Mic size={16} />
                            </button>
                          )}

                          <button 
                            type="button"
                            onClick={() => setAuthOpen(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            style={{ 
                              background: input.trim() ? accentColor : 'var(--hover-overlay-2)',
                              color: input.trim() ? '#ffffff' : 'var(--on-surface-subtle)',
                              cursor: 'pointer',
                              border: 'none',
                            }}
                          >
                            <ArrowUp size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : !showImageGen ? (
                  <div className={`w-full ${isMobile ? 'mt-auto' : 'max-w-[840px] relative group'} px-0`}>


                    {isMobile ? (
                      <div className="w-full flex items-center gap-2 transition-all duration-300" style={{ padding: '0 4px' }}>
                        <div className="flex-shrink-0 relative" ref={attachmentRefLanding} style={{ position: 'relative' }}>
                          <button 
                            type="button"
                            className="w-10 h-10 flex items-center justify-center rounded-full transition-all border border-divider shadow-md"
                            style={{ 
                              color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                              background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
                              borderColor: 'var(--divider)'
                            }}
                            onClick={(e) => { e.stopPropagation(); setShowAttachmentMenuLanding(!showAttachmentMenuLanding); }}
                          >
                            <Plus size={16} strokeWidth={2.5} />
                          </button>
                          <AttachmentMenu 
                            isOpen={showAttachmentMenuLanding} 
                            onClose={() => setShowAttachmentMenuLanding(false)} 
                            position="bottom" 
                            onNavigateImages={() => { setShowAttachmentMenuLanding(false); setShowImageGen(true); setImageGenResult(null); setImageGenPrompt(''); }} 
                            onSelectRecentFile={handleSelectRecentFile}
                            onOpenGallerySelect={() => chatFileInputRef.current?.click()}
                            onNavigateResearch={() => { setShowAttachmentMenuLanding(false); setAppView('research'); }}
                            libraryFiles={libraryFiles}
                          />
                        </div>

                        <div className="flex-1 flex flex-col items-stretch border border-divider shadow-md transition-all duration-300"
                          style={{
                            background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
                            borderRadius: '24px', 
                            padding: pendingAttachment ? '10px 4px 4px 14px' : '4px 4px 4px 14px',
                            height: 'auto',
                            minHeight: '48px',
                            borderColor: 'var(--divider)'
                          }}
                        >
                          {pendingAttachment && (
                            <div className="flex px-1 pb-2">
                              <div className="relative rounded-xl border border-divider bg-surface-2 flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                                {pendingAttachment.url && (
                                  <img 
                                    src={pendingAttachment.url} 
                                    alt="attachment" 
                                    className="w-full h-full object-cover rounded-xl"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                )}
                                <button 
                                  type="button" 
                                  onClick={(e) => { e.stopPropagation(); setPendingAttachment(null); }}
                                  className="absolute rounded-full flex items-center justify-center shadow-md transition-all"
                                  style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    width: '20px',
                                    height: '20px',
                                    zIndex: 10
                                  }}
                                >
                                  <X size={11} strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          )}
                          <form onSubmit={handleSend} className="w-full flex items-center gap-2">
                            {isListening && isVoiceMessageMode ? (
                              <div className="flex-1 flex items-center pr-1 h-10 animate-in fade-in duration-200">
                                <div className="flex-1 flex items-center h-full mr-2 relative overflow-hidden">
                                  <div className="absolute inset-0 flex items-center pr-[60px] z-10 pointer-events-none">
                                    <span className="text-[14px] font-medium truncate animate-pulse" style={{ color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)' }}>
                                      {input || "Listening..."}
                                    </span>
                                  </div>
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-[200%] h-[2px] opacity-40 animate-slide-left" style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--on-surface-muted) 0, var(--on-surface-muted) 4px, transparent 4px, transparent 8px)' }}></div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button 
                                    type="button" 
                                    onClick={cancelListening}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                    style={{ color: 'var(--on-surface-muted)' }}
                                  >
                                    <X size={16} strokeWidth={2.5} />
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={(e) => { const currentInput = input; toggleListening(); handleSend(e, currentInput || "Voice message", true); }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all border-2"
                                    style={{ 
                                      borderColor: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                      color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                      background: 'transparent'
                                    }}
                                  >
                                    <Check size={16} strokeWidth={3} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 min-w-0">
                                  <input 
                                    ref={inputRef}
                                    type="text" 
                                    value={input} 
                                    onChange={(e) => { const val = e.target.value; setInput(val); if(val.trim()) { handleUserTyping(); } else { stopUserTyping(); } }} 
                                    onPaste={handleChatPaste}
                                    onFocus={() => setIsInputFocused(true)}
                                    onBlur={() => setIsInputFocused(false)}
                                    placeholder={isSendDisabled ? "Please wait..." : (isLoading ? "Thinking..." : "Ask anything...")} 
                                    className="w-full bg-transparent border-none outline-none text-[16px] temp-placeholder"
                                    style={{ 
                                      background: 'transparent', border: 'none', outline: 'none', 
                                      color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)', fontSize: 16,
                                      padding: 0,
                                      margin: 0,
                                      height: '40px',
                                      lineHeight: '40px'
                                    }}
                                  />
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!input.trim() && (
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setInput('');
                                        setIsVoiceMessageMode(true);
                                        toggleListening();
                                      }}
                                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                      style={{ 
                                        color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                      }}
                                    >
                                      {isListening ? <Square size={12} fill="currentColor" /> : <Mic size={16} />}
                                    </button>
                                  )}

                                  {isLoading ? (
                                    <button 
                                      onClick={handleStop} 
                                      type="button" 
                                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                      style={{
                                        backgroundColor: 'var(--hover-overlay-2)',
                                        color: 'var(--on-surface)',
                                        border: 'none',
                                      }}
                                    >
                                      <Square size={12} fill="currentColor" />
                                    </button>
                                  ) : (
                                    <button 
                                      type={(input.trim() || pendingAttachment) ? "submit" : "button"}
                                      disabled={isSendDisabled}
                                      onClick={(e) => {
                                        if (isSendDisabled) {
                                          e.preventDefault();
                                          return;
                                        }
                                        if (!input.trim()) {
                                          e.preventDefault();
                                          if (isListening && isVoiceMessageMode) {
                                            recognitionRef.current?.stop();
                                          } else {
                                            setInput('');
                                            setIsVoiceMessageMode(true);
                                            toggleListening();
                                          }
                                        }
                                      }}
                                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                      style={{ 
                                        background: isSendDisabled ? 'var(--hover-overlay-2)' : accentColor,
                                        color: isSendDisabled ? 'var(--on-surface-subtle)' : '#ffffff',
                                        cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                                        opacity: isSendDisabled ? 0.6 : 1,
                                        border: 'none',
                                      }}
                                    >
                                      {(input.trim() || pendingAttachment) ? <ArrowUp size={14} strokeWidth={2.5} /> : <AudioLines size={14} strokeWidth={2.5} />}
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full relative flex flex-col items-stretch border border-divider shadow-2xl transition-all duration-300" 
                        style={{ 
                          background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
                          borderRadius: '32px', 
                          padding: pendingAttachment ? '12px 12px 6px 16px' : '4px 6px 4px 16px',
                          borderColor: isTemporary ? 'transparent' : 'var(--divider)'
                        }}>
                        {pendingAttachment && (
                          <div className="flex px-1 pb-2">
                            <div className="relative rounded-xl border border-divider bg-surface-2 flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                              {pendingAttachment.url && (
                                <img 
                                  src={pendingAttachment.url} 
                                  alt="attachment" 
                                  className="w-full h-full object-cover rounded-xl"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              )}
                              <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setPendingAttachment(null); }}
                                className="absolute rounded-full flex items-center justify-center shadow-md transition-all"
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  right: '6px',
                                  backgroundColor: '#ffffff',
                                  color: '#000000',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                  width: '20px',
                                  height: '20px',
                                  zIndex: 10
                                }}
                              >
                                <X size={11} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="w-full flex items-center gap-3">
                          <div className="relative group/tooltip flex items-center justify-center" ref={attachmentRefLanding}>
                            <button 
                              type="button"
                              className="w-10 h-10 flex items-center justify-center rounded-full transition-all"
                              style={{ 
                                color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)') : 'var(--hover-overlay)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              onClick={(e) => { e.stopPropagation(); setShowAttachmentMenuLanding(!showAttachmentMenuLanding); }}
                            >
                              <Plus size={22} />
                            </button>
                            <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                              Attach
                            </div>
                            <AttachmentMenu 
                              isOpen={showAttachmentMenuLanding} 
                              onClose={() => setShowAttachmentMenuLanding(false)} 
                              position="bottom" 
                              onNavigateImages={() => { setShowAttachmentMenuLanding(false); setShowImageGen(true); setImageGenResult(null); setImageGenPrompt(''); }} 
                              onSelectRecentFile={handleSelectRecentFile}
                              onOpenGallerySelect={() => chatFileInputRef.current?.click()}
                              onNavigateResearch={() => { setShowAttachmentMenuLanding(false); setAppView('research'); }}
                              libraryFiles={libraryFiles}
                            />
                          </div>
                          
                          <form onSubmit={handleSend} className="w-full flex flex-1 items-center gap-3">
                          {isListening && isVoiceMessageMode ? (
                            <div className="flex-1 flex items-center pr-1 pl-4 h-12 animate-in fade-in duration-200">
                              <div className="flex-1 flex items-center h-full" style={{ gap: 3, padding: '0 8px' }}>
                                {Array(28).fill(0).map((_, i) => (
                                  <div 
                                    key={i} 
                                    ref={el => { if(el) audioBarsRef.current[i] = el; }}
                                    style={{
                                      width: 3,
                                      borderRadius: 4,
                                      background: 'var(--on-surface)',
                                      height: '3px',
                                      flexShrink: 0,
                                      transition: 'height 0.08s ease',
                                    }}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  type="button" 
                                  onClick={() => { toggleListening(); setInput(''); }}
                                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                  style={{ background: 'var(--hover-overlay)', color: 'var(--on-surface-muted)' }}
                                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.background = 'var(--hover-overlay-2)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-muted)'; e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                                >
                                  <X size={18} strokeWidth={2.5} />
                                </button>
                                <button 
                                  type="button" 
                                  onClick={(e) => { const currentInput = input; toggleListening(); handleSend(e, currentInput || "Voice message", true); }}
                                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all border-2"
                                  style={{ 
                                    borderColor: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                    color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                    background: 'transparent'
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <Check size={18} strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-full flex-1">
                                <input 
                                  ref={inputRef}
                                  type="text" 
                                  value={input} 
                                  onChange={(e) => { const val = e.target.value; setInput(val); if(val.trim()) { handleUserTyping(); } else { stopUserTyping(); } }} 
                                  onPaste={handleChatPaste}
                                  placeholder={isSendDisabled ? "Please wait for response to complete..." : (isLoading ? "Kyra is thinking..." : "Ask anything...")} 
                                  style={{ 
                                    background: 'transparent', border: 'none', outline: 'none', 
                                    color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)' 
                                  }}
                                  className="w-full bg-transparent border-none outline-none px-4 text-[16px] py-3 temp-placeholder"
                                />
                              </div>
                              
                              <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                                <div className="relative ml-4" ref={modelSwitcherLandingRef}>
                                  <button 
                                    type="button"
                                    onClick={() => setShowModelSwitcherLanding(!showModelSwitcherLanding)}
                                    className="flex items-center gap-2 rounded-full transition-all border"
                                    style={{
                                      padding: '6px 14px',
                                      backgroundColor: isTemporary ? 'transparent' : 'var(--hover-overlay)',
                                      borderColor: isTemporary ? (theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)') : 'var(--divider)',
                                      color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)'
                                    }}
                                  >
                                    {aiModel === 'GPT-4' && <Zap size={16} className="text-amber-500" />}
                                    {aiModel === 'DeepSeek' && <Brain size={16} className="text-blue-500" />}
                                    {aiModel === 'Llama' && <Cpu size={16} className="text-emerald-500" />}
                                    {aiModel === 'Gemini' && <Sparkles size={16} className="text-indigo-500" />}
                                    {!isSmallMobile && <span className="text-[13px] font-semibold">{aiModel}</span>}
                                    <ChevronDown size={14} className={showModelSwitcherLanding ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                  </button>
                                  
                                  <AnimatePresence>
                                    {showModelSwitcherLanding && (
                                      <motion.div
                                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        style={{
                                          position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                                          width: '200px', background: 'var(--surface-1)', borderRadius: '16px',
                                          border: '1px solid var(--divider)', padding: '6px', zIndex: 100,
                                          boxShadow: resolvedTheme === 'dark' ? '0 20px 40px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.1)'
                                        }}
                                      >
                                        {['Gemini', 'GPT-4', 'DeepSeek', 'Llama'].map(m => (
                                          <button
                                            key={m}
                                            onClick={() => { setAiModel(m); setShowModelSwitcherLanding(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-hover-overlay transition-all text-left group"
                                          >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-hover-overlay group-hover:bg-primary transition-colors">
                                              {m === 'GPT-4' && <Zap size={16} className="text-amber-500" />}
                                              {m === 'DeepSeek' && <Brain size={16} className="text-blue-500" />}
                                              {m === 'Llama' && <Cpu size={16} className="text-emerald-500" />}
                                              {m === 'Gemini' && <Sparkles size={16} className="text-indigo-500" />}
                                            </div>
                                            <span className={`text-[14px] font-medium ${aiModel === m ? 'text-on-surface' : 'text-on-surface-muted'}`}>{m}</span>
                                          </button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                                
                                <div className="flex items-center gap-2 pr-1 ml-auto flex-shrink-0">
                                  <div className="relative group/tooltip flex items-center justify-center">
                                    <button 
                                      type="button" 
                                      onClick={() => { setIsVoiceMessageMode(false); voiceModeRef.current = false; toggleListening(); }} 
                                      className="w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full"
                                      style={{ 
                                        color: 'var(--on-surface-muted)',
                                        backgroundColor: 'transparent',
                                        border: 'none'
                                      }}
                                    >
                                      <Mic size={18} />
                                    </button>
                                    <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                                      Voice
                                    </div>
                                  </div>
                                  
                                  {isLoading ? (
                                    <button onClick={handleStop} type="button" className="w-10 h-10 rounded-full flex items-center justify-center bg-hover-overlay text-on-surface"><Square size={16} fill="currentColor" /></button>
                                  ) : (
                                    <button 
                                      type={(input.trim() || pendingAttachment) ? "submit" : "button"}
                                      disabled={isSendDisabled}
                                      onClick={(e) => {
                                        if (isSendDisabled) {
                                          e.preventDefault();
                                          return;
                                        }
                                        if (!input.trim()) {
                                          e.preventDefault();
                                          if (isListening && isVoiceMessageMode) {
                                            recognitionRef.current?.stop();
                                          } else {
                                            setInput('');
                                            setIsVoiceMessageMode(true); voiceModeRef.current = true;
                                            toggleListening();
                                          }
                                        }
                                      }}
                                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                                      style={{ 
                                         background: isSendDisabled ? 'var(--hover-overlay-2)' : accentColor,
                                         color: isSendDisabled ? 'var(--on-surface-subtle)' : '#ffffff',
                                         cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                                         opacity: isSendDisabled ? 0.6 : 1
                                       }}
                                      title={isSendDisabled ? "Please wait for current response to complete" : ""}
                                    >
                                      {(input.trim() || pendingAttachment) ? <ArrowUp size={20} strokeWidth={2.5} /> : <AudioLines size={20} strokeWidth={2.5} />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </form>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}


                {!isMobile && !isTemporary && !showImageGen && (
                  <div className={`flex flex-wrap items-center justify-center gap-2 w-full max-w-3xl mx-auto px-4`} style={{ marginTop: '40px' }}>
                    {activeCategory !== 'write' && (
                      <button 
                        onClick={() => { setShowImageGen(true); setImageGenResult(null); setImageGenPrompt(''); }} 
                        className="px-6 py-3 rounded-full border text-[14px] font-semibold active:scale-95 transition-all bg-transparent border-divider"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${accentColor}10`; e.currentTarget.style.borderColor = accentColor; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = ''; }}
                      >
                        <div className="flex items-center gap-2">
                          <Image size={18} style={{ color: accentColor }} />
                          <span>Create an image</span>
                        </div>
                      </button>
                    )}

                    {activeCategory !== 'write' && (
                      <button 
                        onClick={() => setInput("Search for ")}
                        className="px-6 py-3 rounded-full border bg-surface-1 border-divider text-[14px] font-semibold active:scale-95 transition-all"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${accentColor}10`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div className="flex items-center gap-2">
                          <Globe size={18} style={{ color: accentColor }} />
                          <span>Look something up</span>
                        </div>
                      </button>
                    )}
                    
                    <div className={`relative ${activeCategory === 'write' ? 'w-full' : ''}`} style={{ minHeight: 48 }} ref={activeCategory === 'write' ? categoryRef : null}>
                      {activeCategory === 'write' ? (
                        <div className="absolute top-0 left-0 w-full flex flex-col animate-fade-in z-[20]" style={{ background: 'var(--bg-primary)', zIndex: 20 }}>
                          {WRITE_SUGGESTIONS.map((s, idx) => (
                            <button 
                              key={idx}
                              onClick={() => { setInput(s.prompt); setActiveCategory(null); }}
                              className="flex items-center gap-4 px-2 py-4 border-b border-divider hover:bg-hover-overlay transition-all text-[15px] font-medium text-left bg-transparent w-full first:border-t"
                              style={{ color: 'var(--on-surface)' }}
                            >
                              <PenLine size={18} style={{ color: accentColor }} />
                              <span>{s.text}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setInput("Help me write or edit "); setActiveCategory('write'); }} 
                          className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all text-[14px] font-semibold active:scale-95 group/btn ${
                            input.startsWith("Help me write or edit ") 
                            ? 'bg-surface-3 border-divider' 
                            : 'bg-transparent border-divider'
                          }`}
                          style={{ 
                            borderColor: input.startsWith("Help me write or edit ") ? accentColor : '',
                            backgroundColor: input.startsWith("Help me write or edit ") ? `${accentColor}15` : ''
                          }}
                          onMouseEnter={(e) => { if(!input.startsWith("Help me write or edit ")) e.currentTarget.style.backgroundColor = `${accentColor}10`; }}
                          onMouseLeave={(e) => { if(!input.startsWith("Help me write or edit ")) e.currentTarget.style.backgroundColor = ''; }}
                        >
                          <PenLine size={18} style={{ color: accentColor }} />
                          <span>Write or edit</span>
                        </button>
                      )}
                    </div>



                  </div>
                )}


              </div>
            </div>
          )}

          {/* Messages View */}
          {(messages.length > 0 || chats.find(c => c.id === activeChatId)?.isGroup) && (
            <div
              className="mx-auto w-full flex flex-col"
              style={{
                maxWidth: chatWidth === 'Wide' ? 'min(1000px, 100%)' : chatWidth === 'Full' ? '100%' : 'min(768px, 100%)',
                padding: '55px 20px 20px',
              }}
            >
            {(() => {
              const getTime = (m) => {
                if (m.timestamp) {
                  if (typeof m.timestamp === 'object' && m.timestamp.seconds) return m.timestamp.seconds * 1000;
                  const d = new Date(m.timestamp);
                  if (!isNaN(d.getTime())) return d.getTime();
                }
                if (typeof m.id === 'string') {
                  const match = m.id.match(/\d+/);
                  if (match) return parseInt(match[0]);
                }
                if (typeof m.id === 'number') return m.id;
                return 0;
              };

              const chat = chats.find(c => c.id === activeChatId);
              const allMessages = [...messages];
              
              if (chat?.isGroup) {
                const groupCreationTime = chat.createdAt || chat.timestamp || Date.now();
                allMessages.push({
                  id: 'group-creation-header',
                  role: 'system',
                  timestamp: groupCreationTime,
                  isGroupCreation: true
                });
              }

              const sortedMessages = allMessages.sort((a, b) => getTime(a) - getTime(b));

              return (
                <>


                  {sortedMessages.map((msg, index) => {
                    return (
                      <React.Fragment key={msg.id}>
                        <div id={`msg-${msg.id}`} className={`w-full flex flex-col gap-4 mb-16 group/msg ${msg.role === 'ai' ? 'mt-8' : ''}`}>
                          {renderMessageView(msg, index)}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </>
              );
            })()}

            {/* User typing indicators (Aligned inside messages container) */}
            {chats.find(c => c.id === activeChatId)?.isGroup && (() => {
              const currentChat = chats.find(c => c.id === activeChatId);
              const typingData = currentChat?.typing || {};
              const typingUsers = Object.entries(typingData)
                .filter(([uid, val]) => {
                  if (uid === profile?.uid) return false;
                  if (!val.isTyping) return false;
                  const lastActive = new Date(val.timestamp).getTime();
                  return (Date.now() - lastActive) < 8000;
                })
                .map(([uid, val]) => val);

              if (typingUsers.length === 0) return null;

              return (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginTop: '12px', marginBottom: '16px', paddingLeft: '4px' }} className="animate-fade-in">
                  {/* Avatars stack on bottom-left of the bubble */}
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0px' }}>
                    {typingUsers.slice(0, 3).map((u, i) => (
                      <div key={i} style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1.5px solid var(--surface-1)',
                        background: 'var(--surface-3)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: i > 0 ? '-8px' : '0px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        flexShrink: 0
                      }}>
                        {u.avatar ? (
                          <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 750, color: 'var(--on-surface-muted)' }}>
                            {(u.displayName || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Content Column (Name on top, Chat bubble underneath) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-subtle)', fontWeight: 550, opacity: 0.7, paddingLeft: '4px' }}>
                      {typingUsers.map(u => u.displayName?.split(' ')[0] || 'Someone').join(', ')} 
                      {typingUsers.length === 1 ? ' is typing' : ' are typing'}
                    </span>
                    
                    {/* Bouncing dots bubble */}
                    <div style={{
                      padding: '10px 16px',
                      borderRadius: '16px 16px 16px 4px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--divider)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ display: 'flex', gap: '4.5px', alignItems: 'center' }}>
                        <span className="typing-dot" style={{ width: '5.5px', height: '5.5px', backgroundColor: 'var(--accent-color, #a855f7)', borderRadius: '50%', animationDelay: '0s' }}></span>
                        <span className="typing-dot" style={{ width: '5.5px', height: '5.5px', backgroundColor: 'var(--accent-color, #a855f7)', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                        <span className="typing-dot" style={{ width: '5.5px', height: '5.5px', backgroundColor: 'var(--accent-color, #a855f7)', borderRadius: '50%', animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* AI thinking indicators — hide if streaming content is already visible in a bubble */}
            {(() => {
              const currentChat = chats.find(c => c.id === activeChatId);
              const isRemoteGenerating = !isLoading && currentChat?.isGenerating;
              // If remote streaming has already started, an AI placeholder will have content — don't show dots
              const streamingAlreadyVisible = isRemoteGenerating && messages.some(m => m.role === 'ai' && m.isPlaceholder && m.content);
              if (!isLoading && !currentChat?.isGenerating) return null;
              if (streamingAlreadyVisible) return null;
              return (
                <div className="flex justify-start animate-fade-in" style={{ paddingLeft: '4px', marginTop: '12px', marginBottom: '16px' }}>
                  <div className="px-0 py-2 flex flex-col gap-2">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full typing-dot" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full typing-dot" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-on-surface-subtle rounded-full typing-dot" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                    {currentChat?.isGroup && !isLoading && (
                      <span className="text-[10.5px] text-on-surface-subtle/50 tracking-wider thinking-shimmer">Kyra is thinking...</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}



        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Floating Scroll-prompts Navigation Bar */}
      {(() => {
        const imageMessages = messages.filter(m => m.isAspectGeneration || (m.content && m.content.startsWith('![image](')));
        if (imageMessages.length > 0) {
          return (
            <ImageGenerationSidebarNavigator 
              imageMessages={imageMessages}
              scrollContainerRef={scrollContainerRef}
              activeChatId={activeChatId}
            />
          );
        }
        return null;
      })()}
    </main>


      {/* Hidden file input for chat image attachment */}
      <input
        ref={chatFileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChatFileChange}
      />

      {/* Fullscreen image lightbox */}
      <AnimatePresence>
        {fullscreenImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999999,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-out',
            }}
            onClick={() => setFullscreenImageUrl(null)}
          >
            <motion.img
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              src={fullscreenImageUrl}
              alt="Fullscreen preview"
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '90vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)'
              }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setFullscreenImageUrl(null)}
              style={{
                position: 'fixed', top: 20, right: 20, width: 44, height: 44,
                borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 20, zIndex: 1000000,
              }}
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length > 0 && (
        <footer style={{ padding: '16px 20px', background: 'var(--bg-primary)', position: 'relative' }}>
          <AnimatePresence>
            {showScrollButton && (
              <button
                onClick={() => scrollToBottom(true)}
                className="absolute left-1/2 -translate-x-1/2"
                style={{ 
                  bottom: 'calc(100% + 24px)', 
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: accentColor,
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: `0 8px 24px ${accentColor}55`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                  zIndex: 100
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
<ArrowDown size={22} strokeWidth={3} />
              </button>
            )}
          </AnimatePresence>
          <div className={`max-w-3xl mx-auto w-full flex flex-col items-center ${replyingToMsg ? 'gap-0' : 'gap-3'} px-2 md:px-4`}>

            <AnimatePresence>
              {replyingToMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="w-full p-2.5 flex items-center justify-between"
                  style={{
                    background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    borderRadius: '20px 20px 0 0',
                    border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    borderBottom: 'none',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: `${accentColor}15` }}>
                      <Reply size={16} style={{ color: accentColor }} />
                    </div>
                    <p className="text-[14.5px] font-medium truncate" style={{ color: 'var(--on-surface)' }}>
                      <span className="opacity-40 font-normal mr-1.5 font-serif">“</span>
                      {replyingToMsg.content}
                      <span className="opacity-40 font-normal ml-1.5 font-serif">”</span>
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setReplyingToMsg(null)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-on-surface/10 transition-colors ml-2"
                  >
                    <X size={16} className="opacity-60" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {isSharedReadOnly ? (
              <div className="w-full flex flex-col items-center justify-center gap-4 py-8 px-4 text-center animate-fade-in">
                <p 
                  style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: 'var(--on-surface-muted)',
                    lineHeight: 1.5,
                    maxWidth: '520px',
                    fontFamily: 'Outfit, sans-serif',
                    textAlign: 'center'
                  }}
                >
                  This conversation was shared by{' '}
                  <span style={{ fontWeight: '600', color: accentColor || 'var(--accent-color)' }}>
                    {sharedChatData?.sharedByName || 'a user'}
                  </span>
                  {sharedChatData?.sharedByEmail ? ` (${sharedChatData.sharedByEmail})` : ''}.
                  <br />
                  You are exploring this chat in <span style={{ fontWeight: '600', color: accentColor || 'var(--accent-color)' }}>read-only mode</span>.
                </p>
                
                <button
                  type="button"
                  onClick={() => createNewChat()}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '999px',
                    background: `linear-gradient(135deg, ${accentColor || '#6366f1'} 0%, #a855f7 100%)`,
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif',
                    boxShadow: `0 4px 14px -4px ${(accentColor || '#6366f1')}77`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <SquarePen size={16} strokeWidth={2.5} />
                  <span>Start New Chat</span>
                </button>
              </div>
            ) : (
              isResearchChat ? (
                <div className="w-full relative flex flex-col items-stretch transition-all duration-300"
                  style={{ 
                    width: '100%', 
                    background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
                    borderRadius: replyingToMsg ? '0 0 28px 28px' : '28px', 
                    padding: '16px 20px', 
                    border: '1px solid var(--divider)',
                    borderTop: replyingToMsg ? 'none' : '1px solid var(--divider)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <form onSubmit={handleSend} className="w-full flex flex-col gap-4">
                    {/* Row 1: Text Area */}
                    <div className="w-full flex-1">
                      <input 
                        ref={footerInputRef}
                        type="text" 
                        value={input} 
                        onChange={(e) => { const val = e.target.value; setInput(val); if(val.endsWith('/')) setShowAttachmentMenu(true); if(val.trim()) { handleUserTyping(); } else { stopUserTyping(); } }} 
                        onPaste={handleChatPaste}
                        placeholder={isSendDisabled ? "Please wait..." : (isLoading ? "Thinking..." : "Get a detailed report")} 
                        className="w-full bg-transparent border-none outline-none text-[16px] temp-placeholder"
                        style={{ 
                          background: 'transparent', border: 'none', outline: 'none', 
                          color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)', fontSize: 16,
                          padding: '4px 0',
                          margin: 0,
                          height: '40px',
                          lineHeight: '40px'
                        }} 
                      />
                    </div>

                    {/* Row 2: Control Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                      {/* Left Side Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Attachment Button */}
                        <div className="relative" ref={attachmentRefFooter}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setShowAttachmentMenu(!showAttachmentMenu); }}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)',
                              color: 'var(--on-surface)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              border: 'none'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                            onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)'}
                          >
                            <Plus size={16} />
                          </button>
                          <AttachmentMenu 
                            isOpen={showAttachmentMenu} 
                            onClose={() => setShowAttachmentMenu(false)} 
                            position="top" 
                            onSelectFile={handleChatFileSelect} 
                            onNavigateImages={() => { setShowAttachmentMenu(false); setAppView('images'); }} 
                            onSelectRecentFile={handleSelectRecentFile}
                            onOpenGallerySelect={() => chatFileInputRef.current?.click()}
                            onNavigateResearch={() => { setShowAttachmentMenu(false); setAppView('research'); }}
                            libraryFiles={libraryFiles}
                          />
                        </div>

                        {/* Deep Research Pill */}
                        <button
                          type="button"
                          onMouseEnter={() => setIsResearchPillHovered(true)}
                          onMouseLeave={() => setIsResearchPillHovered(false)}
                          onClick={handleDisableResearchMode}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '999px',
                            background: 'rgba(59, 130, 246, 0.12)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                        >
                          {isResearchPillHovered ? (
                            <X size={14} color="#60a5fa" strokeWidth={2} />
                          ) : (
                            <Telescope size={14} color="#60a5fa" strokeWidth={2} />
                          )}
                          <span>Deep research</span>
                        </button>

                        {/* Apps Dropdown */}
                        <div ref={appsDropdownRefFooter} style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAppsDropdownOpen(!isAppsDropdownOpen);
                              setIsSitesDropdownOpen(false);
                              setIsSpeedDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '999px',
                              background: isAppsDropdownOpen ? (resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)') : 'transparent',
                              color: isAppsDropdownOpen ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)';
                              e.currentTarget.style.color = 'var(--on-surface)';
                            }}
                            onMouseLeave={e => {
                              if (!isAppsDropdownOpen) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--on-surface-muted)';
                              }
                            }}
                          >
                            <LayoutGrid size={14} />
                            <span>Apps</span>
                            <ChevronDown size={14} />
                          </button>

                          {isAppsDropdownOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 6px)',
                                left: 0,
                                zIndex: 150,
                                width: '160px',
                                background: resolvedTheme === 'dark' ? '#232325' : 'var(--surface-1)',
                                border: resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--divider)',
                                borderRadius: '12px',
                                padding: '6px',
                                boxShadow: resolvedTheme === 'dark' ? '0 -10px 25px rgba(0, 0, 0, 0.5)' : 'var(--shadow-md)'
                              }}
                            >
                              {['All Apps', 'Canva', 'Figma', 'Photoshop', 'Airtable'].map((app) => (
                                <button
                                  key={app}
                                  type="button"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setIsAppsDropdownOpen(false);
                                  }}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: selectedApp === app ? (resolvedTheme === 'dark' ? '#60a5fa' : 'var(--accent-color)') : 'var(--on-surface)',
                                    background: selectedApp === app ? (resolvedTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'var(--hover-overlay-2)') : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: 'none'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                  onMouseLeave={e => e.currentTarget.style.background = selectedApp === app ? (resolvedTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'var(--hover-overlay-2)') : 'transparent'}
                                >
                                  <span>{app}</span>
                                  {selectedApp === app && <Check size={14} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Sites Dropdown */}
                        <div ref={sitesDropdownRefFooter} style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSitesDropdownOpen(!isSitesDropdownOpen);
                              setIsAppsDropdownOpen(false);
                              setIsSpeedDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '999px',
                              background: isSitesDropdownOpen ? (resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)') : 'transparent',
                              color: isSitesDropdownOpen ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)';
                              e.currentTarget.style.color = 'var(--on-surface)';
                            }}
                            onMouseLeave={e => {
                              if (!isSitesDropdownOpen) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--on-surface-muted)';
                              }
                            }}
                          >
                            <Globe size={14} />
                            <span>Sites</span>
                            <ChevronDown size={14} />
                          </button>

                          {isSitesDropdownOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 6px)',
                                left: 0,
                                zIndex: 150,
                                width: '230px',
                                background: resolvedTheme === 'dark' ? '#232325' : 'var(--surface-1)',
                                border: resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--divider)',
                                borderRadius: '14px',
                                padding: '6px',
                                boxShadow: resolvedTheme === 'dark' ? '0 -12px 30px rgba(0, 0, 0, 0.5)' : 'var(--shadow-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSiteOption('Search the web');
                                  setIsSitesDropdownOpen(false);
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  fontSize: '13.5px',
                                  color: 'var(--on-surface)',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  border: 'none'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <Globe size={15} style={{ color: 'var(--on-surface-muted)' }} />
                                <span style={{ flex: 1 }}>Search the web</span>
                                {selectedSiteOption === 'Search the web' && <Check size={15} style={{ color: 'var(--on-surface)' }} />}
                              </button>
                              <div style={{ height: '1px', background: 'var(--divider)', margin: '4px 6px' }} />
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSiteOption('Specific sites');
                                  setIsSitesDropdownOpen(false);
                                  setIsSpecificSitesOpen(true);
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  fontSize: '13.5px',
                                  color: 'var(--on-surface)',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  border: 'none'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <Globe size={15} style={{ color: 'var(--on-surface-muted)' }} />
                                <span style={{ flex: 1 }}>Specific sites ({specificSites.length})</span>
                                {selectedSiteOption === 'Specific sites' && <Check size={15} style={{ color: 'var(--on-surface)' }} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSitesDropdownOpen(false);
                                  setIsSpecificSitesOpen(true);
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  fontSize: '13.5px',
                                  color: 'var(--on-surface)',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  border: 'none'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <CornerDownRight size={15} style={{ color: 'var(--on-surface-muted)' }} />
                                <span style={{ flex: 1 }}>Manage sites</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Speed/Instant Dropdown */}
                        <div ref={speedDropdownRefFooter} style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSpeedDropdownOpen(!isSpeedDropdownOpen);
                              setIsAppsDropdownOpen(false);
                              setIsSitesDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '999px',
                              background: isSpeedDropdownOpen ? (resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)') : 'transparent',
                              color: isSpeedDropdownOpen ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)';
                              e.currentTarget.style.color = 'var(--on-surface)';
                            }}
                            onMouseLeave={e => {
                              if (!isSpeedDropdownOpen) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--on-surface-muted)';
                              }
                            }}
                          >
                            <span>{selectedSpeed}</span>
                            <ChevronDown size={14} />
                          </button>

                          {isSpeedDropdownOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 6px)',
                                left: 0,
                                zIndex: 150,
                                width: '140px',
                                background: resolvedTheme === 'dark' ? '#232325' : 'var(--surface-1)',
                                border: resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--divider)',
                                borderRadius: '12px',
                                padding: '6px',
                                boxShadow: resolvedTheme === 'dark' ? '0 -10px 25px rgba(0, 0, 0, 0.5)' : 'var(--shadow-md)'
                              }}
                            >
                              {['Instant', 'Detailed', 'Expert'].map((speed) => (
                                <button
                                  key={speed}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSpeed(speed);
                                    setIsSpeedDropdownOpen(false);
                                  }}
                                  style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: selectedSpeed === speed ? (resolvedTheme === 'dark' ? '#60a5fa' : 'var(--accent-color)') : 'var(--on-surface)',
                                    background: selectedSpeed === speed ? (resolvedTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'var(--hover-overlay-2)') : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: 'none'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                                  onMouseLeave={e => e.currentTarget.style.background = selectedSpeed === speed ? (resolvedTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'var(--hover-overlay-2)') : 'transparent'}
                                >
                                  <span>{speed}</span>
                                  {selectedSpeed === speed && <Check size={14} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side Buttons (Microphone and Send/Stop) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setInput('');
                            setIsVoiceMessageMode(true);
                            toggleListening();
                          }}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--on-surface-muted)',
                            background: 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: 'none'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--hover-overlay)';
                            e.currentTarget.style.color = 'var(--on-surface)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--on-surface-muted)';
                          }}
                        >
                          <Mic size={18} />
                        </button>

                        {isLoading ? (
                          <button 
                            onClick={handleStop} 
                            type="button" 
                            style={{
                              background: '#ea580c',
                              color: '#ffffff',
                              border: 'none',
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <Square size={12} fill="currentColor" />
                          </button>
                        ) : (
                          <button
                            type={(input.trim() || pendingAttachment) ? "submit" : "button"}
                            disabled={isSendDisabled}
                            style={{ 
                              background: !input.trim() ? 'var(--hover-overlay-2)' : (accentColor || '#3b82f6'),
                              color: !input.trim() ? 'var(--on-surface-subtle)' : '#ffffff',
                              cursor: !input.trim() ? 'not-allowed' : 'pointer',
                              opacity: !input.trim() ? 0.6 : 1,
                              border: 'none',
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: input.trim() ? `0 4px 12px ${accentColor || '#3b82f6'}40` : 'none',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              if (input.trim()) {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (input.trim()) {
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                          >
                            <ArrowUp size={14} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              ) : isMobile ? (
                <div className="w-full flex items-center gap-2 transition-all duration-300" style={{ padding: '0 4px' }}>
                  <div className="flex-shrink-0 relative" ref={attachmentRefFooter} style={{ position: 'relative' }}>
                    <button 
                      type="button"
                      className="w-10 h-10 flex items-center justify-center rounded-full transition-all border border-divider shadow-md"
                      style={{ 
                        color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                        background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)',
                        borderColor: 'var(--divider)'
                      }}
                      onClick={(e) => { e.stopPropagation(); setShowAttachmentMenu(!showAttachmentMenu); }}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                    <AttachmentMenu 
                      isOpen={showAttachmentMenu} 
                      onClose={() => setShowAttachmentMenu(false)} 
                      position="top" 
                      onSelectFile={handleChatFileSelect} 
                      onNavigateImages={() => { setShowAttachmentMenu(false); setAppView('images'); }} 
                      onSelectRecentFile={handleSelectRecentFile}
                      onOpenGallerySelect={() => chatFileInputRef.current?.click()}
                      onNavigateResearch={() => { setShowAttachmentMenu(false); setAppView('research'); }}
                      libraryFiles={libraryFiles}
                    />
                  </div>

                  <div className="flex-1 flex flex-col items-stretch border border-divider shadow-md transition-all duration-300"
                    style={{
                      background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
                      borderRadius: replyingToMsg ? '0 0 24px 24px' : '24px', 
                      padding: pendingAttachment ? '10px 4px 4px 14px' : '4px 4px 4px 14px',
                      height: 'auto',
                      minHeight: '48px',
                      borderColor: 'var(--divider)'
                    }}
                  >
                    {pendingAttachment && (
                      <div className="flex px-1 pb-2">
                        <div className="relative rounded-xl border border-divider bg-surface-2 flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                          {pendingAttachment.url && (
                            <img 
                              src={pendingAttachment.url} 
                              alt="attachment" 
                              className="w-full h-full object-cover rounded-xl"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setPendingAttachment(null); }}
                            className="absolute rounded-full flex items-center justify-center shadow-md transition-all"
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              width: '20px',
                              height: '20px',
                              zIndex: 10
                            }}
                          >
                            <X size={11} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    )}
                    <form onSubmit={handleSend} className="w-full flex items-center gap-2">
                      {isListening && isVoiceMessageMode ? (
                        <div className="flex-1 flex items-center pr-1 h-10 animate-in fade-in duration-200">
                          <div className="flex-1 flex items-center h-full mr-2 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center pr-[60px] z-10 pointer-events-none">
                              <span className="text-[14px] font-medium truncate animate-pulse" style={{ color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)' }}>
                                {input || "Listening..."}
                              </span>
                            </div>
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-[200%] h-[2px] opacity-40 animate-slide-left" style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--on-surface-muted) 0, var(--on-surface-muted) 4px, transparent 4px, transparent 8px)' }}></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              type="button" 
                              onClick={cancelListening}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                              style={{ color: 'var(--on-surface-muted)' }}
                            >
                              <X size={16} strokeWidth={2.5} />
                            </button>
                            <button 
                              type="button" 
                              onClick={(e) => { const currentInput = input; toggleListening(); handleSend(e, currentInput || "Voice message", true); }}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-all border-2"
                              style={{ 
                                borderColor: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                background: 'transparent'
                              }}
                            >
                              <Check size={16} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <input 
                              ref={footerInputRef}
                              type="text" 
                              value={input} 
                              onChange={(e) => { const val = e.target.value; setInput(val); if(val.endsWith('/')) setShowAttachmentMenu(true); if(val.trim()) { handleUserTyping(); } else { stopUserTyping(); } }} 
                              onPaste={handleChatPaste}
                              onFocus={() => setIsInputFocused(true)}
                              onBlur={() => setIsInputFocused(false)}
                              placeholder={isSendDisabled ? "Please wait..." : (isLoading ? "Thinking..." : "Ask anything...")} 
                              className="w-full bg-transparent border-none outline-none text-[16px] temp-placeholder"
                              style={{ 
                                background: 'transparent', border: 'none', outline: 'none', 
                                color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)', fontSize: 16,
                                padding: 0,
                                margin: 0,
                                height: '40px',
                                lineHeight: '40px'
                              }} 
                            />
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isLoading ? (
                              <button 
                                onClick={handleStop} 
                                type="button" 
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                style={{
                                  backgroundColor: 'var(--hover-overlay-2)',
                                  color: 'var(--on-surface)',
                                  border: 'none',
                                }}
                              >
                                <Square size={12} fill="currentColor" />
                              </button>
                            ) : (
                              <>
                                {!input.trim() && (
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      if (isListening) {
                                        recognitionRef.current?.stop();
                                      } else {
                                        setInput('');
                                        setIsVoiceMessageMode(true);
                                        toggleListening();
                                      }
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                    style={{ 
                                      color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                    }}
                                  >
                                    {isListening ? <Square size={12} fill="currentColor" /> : <Mic size={16} />}
                                  </button>
                                )}

                                <button 
                                  type={(input.trim() || pendingAttachment) ? "submit" : "button"}
                                  disabled={isSendDisabled}
                                  onClick={(e) => {
                                    if (isSendDisabled) {
                                      e.preventDefault();
                                      return;
                                    }
                                    if (!input.trim()) {
                                      e.preventDefault();
                                      if (isListening && isVoiceMessageMode) {
                                        recognitionRef.current?.stop();
                                      } else {
                                        setInput('');
                                        setIsVoiceMessageMode(true);
                                        toggleListening();
                                      }
                                    }
                                  }}
                                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                  style={{ 
                                    background: isSendDisabled ? 'var(--hover-overlay-2)' : accentColor,
                                    color: isSendDisabled ? 'var(--on-surface-subtle)' : '#ffffff',
                                    cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isSendDisabled ? 0.6 : 1,
                                    border: 'none',
                                  }}
                                >
                                  {(input.trim() || pendingAttachment) ? <ArrowUp size={14} strokeWidth={2.5} /> : <AudioLines size={14} strokeWidth={2.5} />}
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </form>
                  </div>
                </div>
              ) : (
                <div className="w-full relative flex flex-col items-stretch transition-all duration-300"
                  style={{ 
                    width: '100%', 
                    background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)', 
                    borderRadius: replyingToMsg ? '0 0 26px 26px' : '26px', 
                    padding: pendingAttachment ? '12px 12px 6px 16px' : '4px 6px 4px 16px', border: '1px solid var(--divider)',
                    borderTop: replyingToMsg ? 'none' : '1px solid var(--divider)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {pendingAttachment && (
                    <div className="flex px-1 pb-2">
                      <div className="relative rounded-xl border border-divider bg-surface-2 flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                        {pendingAttachment.url && (
                          <img 
                            src={pendingAttachment.url} 
                            alt="attachment" 
                            className="w-full h-full object-cover rounded-xl"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setPendingAttachment(null); }}
                          className="absolute rounded-full flex items-center justify-center shadow-md transition-all"
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            width: '20px',
                            height: '20px',
                            zIndex: 10
                          }}
                        >
                          <X size={11} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="w-full flex items-center gap-3">
                    <div className="relative group/tooltip flex items-center justify-center" ref={attachmentRefFooter}>
                      <button 
                        type="button"
                        onMouseEnter={() => setHoveredPlus(true)} 
                        onMouseLeave={() => setHoveredPlus(false)} 
                        onClick={(e) => { e.stopPropagation(); setShowAttachmentMenu(!showAttachmentMenu); }} 
                        className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
                        style={{
                          color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                          backgroundColor: hoveredPlus ? (isTemporary ? (resolvedTheme === 'dark' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)') : 'var(--hover-overlay)') : 'transparent'
                        }}
                      >
                        <Plus size={20} />
                      </button>
                      <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                        Attach
                      </div>
                      <AttachmentMenu 
                        isOpen={showAttachmentMenu} 
                        onClose={() => setShowAttachmentMenu(false)} 
                        position="top" 
                        onSelectFile={handleChatFileSelect} 
                        onNavigateImages={() => { setShowAttachmentMenu(false); setShowImageGen(true); setImageGenResult(null); setImageGenPrompt(''); }} 
                        onSelectRecentFile={handleSelectRecentFile}
                        onOpenGallerySelect={() => chatFileInputRef.current?.click()}
                        onNavigateResearch={() => { setShowAttachmentMenu(false); setAppView('research'); }}
                        libraryFiles={libraryFiles}
                      />
                    </div>

                    <form onSubmit={handleSend} className="w-full flex flex-1 items-center gap-3" style={{ flex: 1 }}>
                    {isListening && isVoiceMessageMode ? (
                      <div className="flex-1 flex items-center pr-1 pl-4 h-[48px] animate-in fade-in duration-200">
                         <div className="flex-1 flex items-center h-full mr-4 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center pr-[120px] z-10 pointer-events-none">
                              <span className="text-[15px] font-medium truncate" style={{ color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)' }}>
                                {input || "Listening..."}
                              </span>
                            </div>
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-[200%] h-[2px] opacity-40 animate-slide-left" style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--on-surface-muted) 0, var(--on-surface-muted) 4px, transparent 4px, transparent 8px)' }}></div>
                            </div>
                            <div className="absolute right-0 flex items-center gap-[3px] pl-4 pr-2 h-full" style={{ background: isTemporary ? (theme === 'dark' ? '#ffffff' : '#1c1c1e') : 'var(--surface-1)' }}>
                              {Array(15).fill(0).map((_, i) => (
                                <div 
                                  key={i} 
                                  ref={el => { if(el) audioBarsRef.current[i] = el; }}
                                  className="w-[3px] rounded-full transition-all duration-75" 
                                  style={{ background: 'var(--on-surface)', height: '4px' }}
                                ></div>
                              ))}
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              onClick={cancelListening}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                              style={{ color: 'var(--on-surface-muted)' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--on-surface)'; e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--on-surface-muted)'; e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                            >
                              <X size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                              type="button" 
                              onClick={(e) => { const currentInput = input; toggleListening(); handleSend(e, currentInput || "Voice message", true); }}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-all border-2"
                              style={{ 
                                borderColor: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                color: isTemporary ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)',
                                background: 'transparent'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Check size={18} strokeWidth={3} />
                            </button>
                         </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-full flex-1">
                          <input 
                            ref={footerInputRef}
                            type="text" 
                            value={input} 
                            onChange={(e) => { const val = e.target.value; setInput(val); if(val.endsWith('/')) setShowAttachmentMenu(true); if(val.trim()) { handleUserTyping(); } else { stopUserTyping(); } }} 
                            onPaste={handleChatPaste}
                            placeholder={isSendDisabled ? "Please wait for response to complete..." : (isLoading ? "Kyra is thinking..." : "Ask anything...")} 
                            className="w-full bg-transparent border-none outline-none temp-placeholder"
                            style={{ 
                              background: 'transparent', border: 'none', outline: 'none', 
                              color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface)', fontSize: 16, padding: (isSmallMobile ? '12px 8px' : '12px 14px')
                            }} 
                          />
                        </div>

                        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                          <div className="relative ml-4" ref={modelSwitcherRef}>
                            <button 
                              type="button" 
                              onClick={() => setShowModelSwitcher(!showModelSwitcher)}
                              className="flex items-center gap-2 rounded-full transition-all border"
                              style={{
                                padding: '6px 14px',
                                borderColor: 'var(--divider)',
                                background: 'transparent',
                                color: 'var(--on-surface-muted)',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-overlay)'; e.currentTarget.style.color = 'var(--on-surface)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--on-surface-muted)'; }}
                            >
                              {aiModel === 'GPT-4' && <Zap size={14} className="text-amber-500" />}
                              {aiModel === 'DeepSeek' && <Brain size={14} className="text-blue-500" />}
                              {aiModel === 'Llama' && <Cpu size={14} className="text-emerald-500" />}
                              {(aiModel === 'gemini' || aiModel === 'Gemini' || aiModel === 'aura') && <Sparkles size={14} style={{ color: '#6366f1' }} />}
                              <span className="capitalize">{aiModel}</span>
                              <ChevronDown size={12} />
                            </button>
                            
                            <AnimatePresence>
                              {showModelSwitcher && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                  style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    marginBottom: '8px',
                                    background: 'var(--surface-1)',
                                    borderColor: 'var(--divider)',
                                    border: '1px solid var(--divider)',
                                    borderRadius: '18px',
                                    padding: '6px',
                                    minWidth: '190px',
                                    zIndex: 200,
                                    boxShadow: '0 -8px 32px rgba(0,0,0,0.18)'
                                  }}
                                >
                                  {[
                                    { id: 'Gemini', label: 'Gemini', icon: <Sparkles size={15} style={{ color: '#6366f1' }} /> },
                                    { id: 'GPT-4', label: 'GPT-4', icon: <Zap size={15} className="text-amber-500" /> },
                                    { id: 'DeepSeek', label: 'DeepSeek', icon: <Brain size={15} className="text-blue-500" /> },
                                    { id: 'Llama', label: 'Llama', icon: <Cpu size={15} className="text-emerald-500" /> },
                                  ].map(({ id, label, icon }) => (
                                    <button
                                      key={id}
                                      type="button"
                                      onClick={() => { setAiModel(id); setShowModelSwitcher(false); }}
                                      style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '9px 12px', borderRadius: '12px', border: 'none',
                                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                        fontSize: '13.5px', fontWeight: 500,
                                        color: aiModel === id ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                                        background: aiModel === id ? 'var(--hover-overlay-2)' : 'transparent',
                                        transition: 'background 0.15s'
                                      }}
                                      onMouseEnter={e => { if(aiModel !== id) e.currentTarget.style.background = 'var(--hover-overlay)'; }}
                                      onMouseLeave={e => { if(aiModel !== id) e.currentTarget.style.background = aiModel === id ? 'var(--hover-overlay-2)' : 'transparent'; }}
                                    >
                                      <span style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
                                      <span style={{ flex: 1 }}>{label}</span>
                                      {aiModel === id && <Check size={13} style={{ color: accentColor, flexShrink: 0 }} />}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="flex items-center gap-1.5 ml-auto">
                            <div className="relative group/tooltip flex items-center justify-center">
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (isListening) {
                                    recognitionRef.current?.stop();
                                  } else {
                                    setInput('');
                                    setIsVoiceMessageMode(true);
                                    toggleListening();
                                  }
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                style={{ 
                                  color: isTemporary ? (resolvedTheme === 'dark' ? '#000000' : '#ffffff') : 'var(--on-surface-muted)',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                }}
                              >
                                {isListening ? <Square size={14} fill="currentColor" /> : <Mic size={18} />}
                              </button>
                              <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                                Voice
                              </div>
                            </div>

                            {isLoading ? (
                               <div className="relative group/tooltip flex items-center justify-center">
                                 <button 
                                   type="button"
                                   onClick={handleStop}
                                   className="group/stop relative flex items-center justify-center transition-all duration-300 active:scale-90"
                                   style={{ 
                                     width: 40, height: 40, borderRadius: '50%', 
                                     background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', 
                                     color: accentColor, 
                                     border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                     cursor: 'pointer' 
                                   }}
                                 >
                                   <Square size={14} fill={accentColor} className="group-hover/stop:scale-110 transition-transform" />
                                 </button>
                                 <div className="tooltip-label absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 -translate-y-1 group-hover/tooltip:translate-y-0 z-50">
                                   Stop answering
                                 </div>
                               </div>
                             ) : (
                               <button 
                                 type={(input.trim() || pendingAttachment) ? "submit" : "button"}
                                 disabled={isSendDisabled}
                                 onClick={(e) => {
                                   if (isSendDisabled) {
                                     e.preventDefault();
                                     return;
                                   }
                                   if (!input.trim()) {
                                     e.preventDefault();
                                     if (isListening && isVoiceMessageMode) {
                                       recognitionRef.current?.stop();
                                     } else {
                                       setInput('');
                                       setIsVoiceMessageMode(true);
                                       toggleListening();
                                     }
                                   }
                                 }}
                                 style={{ 
                                   width: 40, height: 40, borderRadius: '50%', 
                                   background: isSendDisabled ? 'var(--hover-overlay-2)' : accentColor, 
                                   color: isSendDisabled ? 'var(--on-surface-subtle)' : '#ffffff', 
                                   border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                   transition: 'all 0.3s ease', cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                                   opacity: isSendDisabled ? 0.6 : 1
                                 }}
                                 title={isSendDisabled ? "Please wait for current response to complete" : ""}
                               >
                                 {(input.trim() || pendingAttachment) ? <ArrowUp size={20} strokeWidth={2.5} /> : <AudioLines size={20} strokeWidth={2.5} />}
                               </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </form>
                  </div>
                </div>
              )
            )}
          </div>
        </footer>
      )}
      {renderGallerySelectModal()}
      {deleteConfirm.open && typeof document !== 'undefined' && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface-1)', borderRadius: '24px', border: '1px solid var(--divider)', padding: '28px 28px 22px 28px', width: 'calc(100% - 48px)', maxWidth: '420px', boxSizing: 'border-box' }}
            className="shadow-modal"
          >
            <h3 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, marginBottom: '14px', fontFamily: 'inherit' }}>Delete chat?</h3>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '14.5px', lineHeight: 1.55, marginBottom: '6px' }}>
              This will delete <strong style={{ color: 'var(--on-surface)', fontWeight: 700 }}>{deleteConfirm.name}</strong>.
            </p>
            <p style={{ color: 'var(--on-surface-subtle)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '24px' }}>
              Visit <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>settings</span> to delete any memories saved during this chat.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
                style={{ padding: '6px 22px', borderRadius: '999px', background: 'var(--hover-overlay-2)', color: 'var(--on-surface-muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--divider)', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-overlay-2)'}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteChat(deleteConfirm.id);
                  setDeleteConfirm({ open: false, id: null, name: '' });
                  if (activeChatId === deleteConfirm.id) createNewChat();
                }}
                style={{ padding: '9px 22px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {renderShareModal()}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        chatId={shareChatId}
        showGlobalToast={showGlobalToast}
      />
      <GroupChatModal
        isOpen={isGroupChatModalOpen}
        onClose={() => setIsGroupChatModalOpen(false)}
      />

      <AnimatePresence>
        {activeReactionPickerMsgId && (
          <EmojiReactionModal
            isOpen={!!activeReactionPickerMsgId}
            onClose={() => setActiveReactionPickerMsgId(null)}
            resolvedTheme={resolvedTheme}
            onSelectEmoji={(emoji) => {
              const userName = profile?.displayName || 'User';
              setMsgReactions(prev => ({ ...prev, [activeReactionPickerMsgId]: { emoji, user: userName } }));
              setActiveReactionPickerMsgId(null);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {msgDeleteConfirm.open && (
          <MessageDeleteModal
            isOpen={msgDeleteConfirm.open}
            onClose={() => setMsgDeleteConfirm({ open: false, id: null })}
            onConfirm={async () => {
              const msgId = msgDeleteConfirm.id;
              const currentChat = chats.find(c => c.id === activeChatId);
              
              if (currentChat?.isGroup) {
                try {
                  const chatRef = doc(db, 'chats', activeChatId);
                  const docSnap = await getDoc(chatRef);
                  if (docSnap.exists()) {
                    const currentMsgs = docSnap.data().messages || [];
                    const updatedMsgs = currentMsgs.map(m => 
                      m.id === msgId ? { ...m, isDeleted: true } : m
                    );
                    await updateDoc(chatRef, { messages: updatedMsgs });
                  }
                } catch (err) {
                  console.error("Failed to delete message for everyone:", err);
                }
              } else {
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeleted: true } : m));
              }
              setMsgDeleteConfirm({ open: false, id: null });
            }}
            resolvedTheme={resolvedTheme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExitConfirmOpen && (
          <ExitConfirmModal
            isOpen={isExitConfirmOpen}
            onClose={() => setIsExitConfirmOpen(false)}
            onConfirm={() => {
              leaveGroup(activeChatId);
              setIsExitConfirmOpen(false);
              createNewChat();
            }}
            resolvedTheme={resolvedTheme}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {globalToast && (
          <motion.div
            initial={{ opacity: 0, y: -70, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -70, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              background: accentColor || 'var(--accent-color)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: `0 12px 30px ${(accentColor || 'rgba(99, 102, 241, 0.4)')}40`,
              zIndex: 9999999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              padding: '3px',
              color: '#ffffff'
            }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{globalToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmojiReactionModal = ({ isOpen, onClose, onSelectEmoji, resolvedTheme }) => {
  if (!isOpen) return null;
  
  const smileys = [
    'ðŸ˜€', 'ðŸ˜ƒ', 'ðŸ˜„', 'ðŸ˜', 'ðŸ˜†', 'ðŸ˜…', 'ðŸ˜‚', 'ðŸ¤£',
    'ðŸ¥²', 'â˜ºï¸', 'ðŸ˜Š', 'ðŸ˜‡', 'ðŸ™‚', 'ðŸ™ƒ', 'ðŸ˜‰', 'ðŸ˜Œ',
    'ðŸ˜', 'ðŸ¥°', 'ðŸ˜˜', 'ðŸ˜—', 'ðŸ˜™', 'ðŸ˜š', 'ðŸ˜‹', 'ðŸ˜›',
    'ðŸ˜', 'ðŸ˜œ', 'ðŸ¤ª', 'ðŸ¤¨', 'ðŸ§', 'ðŸ¤“', 'ðŸ˜Ž', 'ðŸ¥¸',
    'ðŸ¤©', 'ðŸ¥³', 'ðŸ˜', 'ðŸ˜’', 'ðŸ˜ž', 'ðŸ˜”', 'ðŸ˜Ÿ', 'ðŸ˜•',
    'ðŸ™', 'â˜¹ï¸', 'ðŸ˜£', 'ðŸ˜–', 'ðŸ˜«', 'ðŸ˜©', 'ðŸ¥º', 'ðŸ˜¢',
    'ðŸ˜­', 'ðŸ˜¤', 'ðŸ˜ ', 'ðŸ˜¡', 'ðŸ¤¬', 'ðŸ¤¯', 'ðŸ˜³', 'ðŸ¥µ',
    'ðŸ¥¶', 'ðŸ˜±', 'ðŸ˜¨', 'ðŸ˜°', 'ðŸ˜¥', 'ðŸ˜“', 'ðŸ¤—', 'ðŸ¤”',
    'ðŸ«£', 'ðŸ¤­', 'ðŸ¤«', 'ðŸ¤¥', 'ðŸ˜¶', 'ðŸ˜', 'ðŸ˜‘', 'ðŸ˜¬',
    'ðŸ™„', 'ðŸ˜¯', 'ðŸ˜¦', 'ðŸ˜§', 'ðŸ˜®', 'ðŸ˜²', 'ðŸ¥±', 'ðŸ˜´',
    'ðŸ¤¤', 'ðŸ˜ª', 'ðŸ˜µ', 'ðŸ¤', 'ðŸ¥´', 'ðŸ¤¢', 'ðŸ¤®', 'ðŸ¤§',
    'ðŸ˜·', 'ðŸ¤’', 'ðŸ¤•', 'ðŸ¤‘', 'ðŸ¤ ', 'ðŸ˜ˆ', 'ðŸ‘¿', 'ðŸ‘¹',
    'ðŸ‘º', 'ðŸ¤¡', 'ðŸ’©', 'ðŸ‘»', 'ðŸ’€', 'â˜ ï¸', 'ðŸ‘½', 'ðŸ‘¾',
    'ðŸ¤–', 'ðŸŽƒ', 'ðŸ˜º', 'ðŸ˜¸', 'ðŸ˜¹', 'ðŸ˜»', 'ðŸ˜¼', 'ðŸ˜½',
    'ðŸ™€', 'ðŸ˜¿', 'ðŸ˜¾', 'ðŸ«¶', 'ðŸ‘', 'ðŸ¤²', 'ðŸ™Œ', 'ðŸ‘',
    'ðŸ’›', 'ðŸ’š', 'ðŸ’™', 'ðŸ’œ', 'ðŸ–¤', 'ðŸ¤', 'ðŸ¤Ž', 'ðŸ’”'
  ];

  return createPortal(
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '380px',
          height: '420px',
          background: resolvedTheme === 'dark' ? '#212121' : '#fff',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: resolvedTheme === 'dark' ? '#fff' : '#000' }}>Choose a Reaction</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)', 
              borderRadius: '8px', color: resolvedTheme === 'dark' ? '#fff' : '#000', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px'
            }}
          >
            <X size={16} />
          </button>
        </div>
        
        <div style={{ padding: '0 16px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: resolvedTheme === 'dark' ? '#aaa' : '#666', letterSpacing: '0.05em' }}>SMILEYS & EMOTION</span>
          <div style={{ flex: 1, height: '1px', background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
        </div>

        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px 16px',
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px',
          alignContent: 'start'
        }} className="custom-scrollbar">
          {smileys.map((emoji, i) => (
            <button
              key={i}
              onClick={() => onSelectEmoji(emoji)}
              style={{
                background: 'transparent', border: 'none', fontSize: '22px', 
                cursor: 'pointer', borderRadius: '8px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {emoji}
            </button>
          ))}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const MessageDeleteModal = ({ isOpen, onClose, onConfirm, resolvedTheme }) => {
  if (!isOpen) return null;
  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 'calc(100% - 48px)', maxWidth: '400px', background: resolvedTheme === 'dark' ? 'var(--surface-1)' : '#fff',
          borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', boxSizing: 'border-box'
        }}
      >
        <h3 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, marginBottom: '14px', fontFamily: 'inherit' }}>Delete message?</h3>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '14.5px', lineHeight: 1.55, marginBottom: '24px' }}>
          Are you sure you want to delete this message? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: '999px', background: 'transparent', color: 'var(--on-surface)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--divider)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '8px 20px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const GroupChatModal = ({ isOpen, onClose }) => {
  const { resolvedTheme, convertToGroupChat, activeChatId, groupChatTargetId, showLoggedIn, setAuthOpen } = useAppContext();
  
  if (!isOpen) return null;

  const handleStartGroup = () => {
    if (!showLoggedIn) {
      setAuthOpen(true);
      onClose();
      return;
    }
    convertToGroupChat(groupChatTargetId || activeChatId);
    onClose();
  };
  return createPortal(
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 9999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <style>{`
          .gchat-modal-card {
            background: ${resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff'};
            border-radius: 28px;
            width: 100%;
            max-width: 480px;
            padding: 32px;
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.45);
            border: 1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
            position: relative;
            box-sizing: border-box;
          }
          .gchat-modal-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            gap: 16px;
            box-sizing: border-box;
          }
          .gchat-btn {
            white-space: nowrap;
            box-sizing: border-box;
            flex-shrink: 0;
          }
          .gchat-modal-actions {
            display: flex;
            gap: 12px;
            box-sizing: border-box;
            flex-shrink: 0;
          }
          @media (max-width: 600px) {
            .gchat-modal-card {
              padding: 24px;
              border-radius: 24px;
            }
            .gchat-modal-footer {
              flex-direction: column-reverse;
              align-items: stretch;
              gap: 16px;
            }
            .gchat-modal-actions {
              flex-direction: column-reverse;
              gap: 10px;
              width: 100%;
            }
            .gchat-btn-learn-more {
              text-align: center;
              padding: 8px 0 !important;
              width: 100%;
            }
            .gchat-btn-action {
              width: 100% !important;
              text-align: center !important;
              padding: 12px 24px !important;
              font-size: 15px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              box-sizing: border-box;
            }
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="gchat-modal-card"
        >
          <h2 style={{ 
            fontSize: '20px', fontWeight: 700, color: resolvedTheme === 'dark' ? '#fff' : '#000', 
            marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: '1.3'
          }}>
            Start group chat from this conversation
          </h2>
          
          <p style={{ 
            fontSize: '15px', lineHeight: '1.6', 
            color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            marginBottom: '32px'
          }}>
            Only this conversation will be shared. Your personal Kyra memory is always private.
          </p>

          <div className="gchat-modal-footer">
            <button
              className="gchat-btn-learn-more"
              style={{ 
                background: 'none', border: 'none', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0,
                textDecoration: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.color = resolvedTheme === 'dark' ? '#fff' : '#000'}
              onMouseLeave={e => e.currentTarget.style.color = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}
            >
              Learn more
            </button>
            
            <div className="gchat-modal-actions">
              <button
                onClick={onClose}
                className="gchat-btn gchat-btn-action"
                style={{
                  padding: '11px 24px', borderRadius: '999px',
                  background: resolvedTheme === 'dark' ? '#2c2c2e' : '#f2f2f2',
                  border: 'none', color: resolvedTheme === 'dark' ? '#fff' : '#000',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? '#3a3a3c' : '#e5e5e5'}
                onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? '#2c2c2e' : '#f2f2f2'}
              >
                Cancel
              </button>
              <button
                onClick={handleStartGroup}
                className="gchat-btn gchat-btn-action"
                style={{
                  padding: '11px 24px', borderRadius: '999px',
                  background: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
                  color: resolvedTheme === 'dark' ? '#000000' : '#ffffff',
                  border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Start group chat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const ShareModal = ({ isOpen, onClose, chatId, showGlobalToast }) => {
  const { chats, activeChatId, aiModel, resolvedTheme, profile } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return null;

  const targetChat = chats.find(c => c.id === (chatId || activeChatId));
  const messages = targetChat?.messages || [];
  const chatTitle = targetChat?.title || 'New Chat';
  const displayTitle = chatTitle || 'Aura AI Chat';
  const accentColor = 'var(--accent-color)'; 

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/c/${chatId || activeChatId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (showGlobalToast) {
      showGlobalToast("Link copied to clipboard!");
    }

    try {
      if (targetChat) {
        await setDoc(doc(db, 'shared_chats', chatId || activeChatId), {
          id: chatId || activeChatId,
          title: targetChat.title || 'Shared Chat',
          messages: targetChat.messages || [],
          createdAt: targetChat.createdAt || new Date().toISOString(),
          sharedAt: new Date().toISOString(),
          accentColor: targetChat.accentColor || 'var(--accent-color)',
          chatTheme: targetChat.chatTheme || 'classic',
          sharedByName: profile?.displayName || 'Anonymous User',
          sharedByEmail: profile?.email || ''
        });
      }
    } catch (err) {
      console.error("Failed to save shared chat to Firestore:", err);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ 
              opacity: 0, 
              y: 200, 
              x: -100, 
              rotate: -15,
              transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } 
            }}
            style={{ 
              position: 'relative', width: 'calc(100% - 32px)', maxWidth: '540px', 
              background: resolvedTheme === 'dark' ? '#1a1a1c' : '#ffffff', 
              border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
              borderRadius: '32px', overflow: 'hidden', 
              boxShadow: resolvedTheme === 'dark' ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)', 
              zIndex: 1000001,
              boxSizing: 'border-box'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="share-modal-container">
              <style>{`
                .share-modal-container {
                  padding: 32px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  box-sizing: border-box;
                  width: 100%;
                }
                .share-grid {
                  display: flex;
                  justify-content: space-around;
                  align-items: center;
                  width: 100%;
                  box-sizing: border-box;
                }
                .share-item {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 12px;
                  flex: 1;
                  min-width: 0;
                  box-sizing: border-box;
                }
                .share-btn {
                  width: 56px;
                  height: 56px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: none;
                  cursor: pointer;
                  transition: transform 0.2s;
                  box-sizing: border-box;
                }
                .share-label {
                  font-size: 12px;
                  font-weight: 500;
                  box-sizing: border-box;
                  text-align: center;
                  max-width: 100%;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                .share-close-btn {
                  position: absolute;
                  top: 24px;
                  right: 24px;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                  border: none;
                  cursor: pointer;
                  transition: all 0.2s;
                }
                @media (max-width: 500px) {
                  .share-modal-container {
                    padding: 24px 16px;
                  }
                  .share-item {
                    gap: 8px;
                  }
                  .share-btn {
                    width: 48px;
                    height: 48px;
                  }
                  .share-btn svg {
                    width: 18px !important;
                    height: 18px !important;
                  }
                  .share-label {
                    font-size: 11px;
                  }
                  .share-close-btn {
                    top: 16px !important;
                    right: 16px !important;
                    width: 32px !important;
                    height: 32px !important;
                  }
                }
                @media (max-width: 360px) {
                  .share-btn {
                    width: 40px;
                    height: 40px;
                  }
                  .share-btn svg {
                    width: 16px !important;
                    height: 16px !important;
                  }
                }
              `}</style>
              <button 
                onClick={onClose}
                className="share-close-btn"
                style={{ 
                  background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
                  color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', 
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; 
                  e.currentTarget.style.color = resolvedTheme === 'dark' ? '#fff' : '#000'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; 
                  e.currentTarget.style.color = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'; 
                }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '22px', fontWeight: '700', color: resolvedTheme === 'dark' ? '#fff' : '#111', marginBottom: '32px', textAlign: 'center', paddingRight: '32px', boxSizing: 'border-box' }}>
                {displayTitle}
              </h2>

              {/* Preview Card */}
              <div style={{ 
                width: '100%', background: resolvedTheme === 'dark' ? '#2a2a2c' : '#f8f8f8', 
                borderRadius: '20px', padding: '24px', 
                marginBottom: '40px', border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, 
                position: 'relative', 
                overflow: 'hidden' 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.8, transform: 'scale(0.98)', transformOrigin: 'top center' }}>
                  {messages.slice(0, 2).map((msg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        background: msg.role === 'user' ? '#f97316' : '#10b981' 
                      }}>
                        {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
                      </div>
                      <div style={{ 
                        padding: '12px', borderRadius: '16px', fontSize: '13px', 
                        background: msg.role === 'user' ? 'rgba(249,115,22,0.15)' : (resolvedTheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)'), 
                        color: msg.role === 'user' ? (resolvedTheme === 'dark' ? '#fed7aa' : '#c2410c') : (resolvedTheme === 'dark' ? '#fff' : '#000'),
                        maxWidth: '85%',
                        fontWeight: 500,
                        lineHeight: '1.4'
                      }}>
                        {msg.content.slice(0, 150)}{msg.content.length > 150 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px',
                  background: `linear-gradient(to top, ${resolvedTheme === 'dark' ? '#2a2a2c' : '#f8f8f8'}, transparent)`, 
                  pointerEvents: 'none',
                  opacity: 0.8
                }} />
                <div style={{ 
                  position: 'absolute', bottom: '16px', right: '24px', fontSize: '13px', fontWeight: '800', 
                  color: resolvedTheme === 'dark' ? '#ffffff' : '#000000', 
                  letterSpacing: '0.05em', zIndex: 1,
                  opacity: resolvedTheme === 'dark' ? 0.6 : 0.7,
                  textTransform: 'uppercase'
                }}>Kyra</div>
              </div>

              {/* Social Share Grid */}
              <div className="share-grid">
                <div className="share-item">
                  <button 
                    onClick={handleCopyLink}
                    className="share-btn"
                    style={{ 
                      background: accentColor, 
                      boxShadow: `0 10px 20px ${accentColor}33`,
                      color: '#fff'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {copied ? <Check size={22} strokeWidth={2.5} color="white" /> : <Copy size={20} strokeWidth={2.5} color="white" />}
                  </button>
                  <span className="share-label" style={{ color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>{copied ? 'Copied!' : 'Copy link'}</span>
                </div>

                <div className="share-item">
                  <button 
                    className="share-btn"
                    style={{ 
                      background: accentColor, 
                      boxShadow: `0 10px 20px ${accentColor}33`,
                      color: '#fff'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <span className="share-label" style={{ color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>X</span>
                </div>

                <div className="share-item">
                  <button 
                    className="share-btn"
                    style={{ 
                      background: accentColor, 
                      boxShadow: `0 10px 20px ${accentColor}33`,
                      color: '#fff'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                  <span className="share-label" style={{ color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>LinkedIn</span>
                </div>

                <div className="share-item">
                  <button 
                    className="share-btn"
                    style={{ 
                      background: accentColor, 
                      boxShadow: `0 10px 20px ${accentColor}33`,
                      color: '#fff'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.04.21.06.42.06.63 0 2.656-2.936 4.808-6.54 4.808-3.604 0-6.54-2.152-6.54-4.808 0-.21.02-.42.06-.63A1.748 1.748 0 0 1 4.75 11.95c0-.968.786-1.754 1.754-1.754.463 0 .875.18 1.185.47 1.2-.833 2.83-1.389 4.63-1.47 l.884-4.14a.25.25 0 0 1 .311-.19l2.76.581c.143-.45.565-.774 1.066-.774zM9.36 12.388c-.68 0-1.233.553-1.233 1.233s.553 1.233 1.233 1.233 1.233-.553 1.233-1.233-.553-1.233-1.233-1.233zm5.28 0c-.68 0-1.233.553-1.233 1.233s.553 1.233 1.233 1.233 1.233-.553 1.233-1.233-.553-1.233-1.233-1.233zm-5.32 3.193s.34.42 1.68.42c1.34 0 1.68-.42 1.68-.42a.125.125 0 0 0-.197-.154c-.233.15-.71.304-1.483.304-.773 0-1.25-.154-1.483-.304a.125.125 0 0 0-.197.154z" />
                    </svg>
                  </button>
                  <span className="share-label" style={{ color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>Reddit</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const PeopleModal = ({ isOpen, onClose, onAddPeople, activeChat }) => {
  const { resolvedTheme, profile } = useAppContext();
  const isAdmin = activeChat?.creator?.uid === profile?.uid;
  
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 9999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '420px',
            padding: '20px',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.45)',
            border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ 
              fontSize: '18px', fontWeight: 600, color: resolvedTheme === 'dark' ? '#fff' : '#000', 
              letterSpacing: '-0.01em', margin: 0
            }}>
              People
            </h2>
            <button 
              onClick={onClose}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                background: 'transparent', color: resolvedTheme === 'dark' ? '#fff' : '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ height: '1px', background: 'var(--divider)', margin: '0 -20px 18px -20px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
              background: 'var(--hover-overlay-2)', border: '1px solid var(--divider)'
            }}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} style={{ color: 'var(--on-surface-subtle)' }} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: resolvedTheme === 'dark' ? '#fff' : '#000', fontSize: '14.5px' }}>
                {profile?.displayName || 'User'}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--on-surface-muted)', marginTop: '0px' }}>
                You · {profile?.email || 'user@example.com'} · {isAdmin ? 'admin' : 'member'}
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--divider)', margin: '0 -20px 18px -20px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 600, color: resolvedTheme === 'dark' ? '#fff' : '#000' }}>
              Add people
            </span>
            <button
              onClick={onAddPeople}
              style={{
                padding: '7px 18px', borderRadius: '999px',
                background: resolvedTheme === 'dark' ? '#2c2c2e' : '#f2f2f2',
                color: resolvedTheme === 'dark' ? '#fff' : '#000',
                border: 'none', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? '#3a3a3c' : '#e5e5e5'}
              onMouseLeave={e => e.currentTarget.style.background = resolvedTheme === 'dark' ? '#2c2c2e' : '#f2f2f2'}
            >
              Add
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const DeleteGroupModal = ({ isOpen, onClose, onConfirm, groupName }) => {
  const { resolvedTheme } = useAppContext();
  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '24px',
          border: '1px solid var(--divider)',
          padding: '28px',
          width: 'calc(100% - 48px)',
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          boxSizing: 'border-box'
        }}
      >
        <h3 style={{
          color: 'var(--on-surface)',
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '14px'
        }}>
          Delete group?
        </h3>

        <p style={{
          color: 'var(--on-surface-muted)',
          fontSize: '14.5px',
          lineHeight: 1.55,
          marginBottom: '24px'
        }}>
          This will delete <strong style={{ color: 'var(--on-surface)' }}>{groupName || 'this group'}</strong>. All messages and media in this chat will be lost.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 22px',
              borderRadius: '999px',
              background: 'var(--hover-overlay-2)',
              color: 'var(--on-surface-muted)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--divider)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 22px',
              borderRadius: '999px',
              background: '#e53e3e',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const RenameGroupModal = ({ isOpen, onClose, onConfirm, initialValue }) => {
  const [value, setValue] = useState(initialValue);
  const { resolvedTheme, accentColor } = useAppContext();

  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '24px',
          border: '1px solid var(--divider)',
          padding: '24px',
          width: '420px',
          boxShadow: resolvedTheme === 'dark' ? '0 30px 60px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <h3 style={{
          color: 'var(--on-surface)',
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          Rename group chat
        </h3>

        <div style={{
          background: 'var(--hover-overlay)',
          border: '1px solid var(--divider)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '24px'
        }}>
          <input
            autoFocus
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onConfirm(value); }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--on-surface)',
              fontSize: '16px',
              outline: 'none',
              fontWeight: 500
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              background: 'var(--hover-overlay-2)',
              color: 'var(--on-surface-muted)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--divider)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(value)}
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              background: accentColor || 'var(--on-surface)',
              color: accentColor ? '#fff' : 'var(--bg-primary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Rename
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
const GroupLinkModal = ({ isOpen, onClose, chatId, showGlobalToast }) => {
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [linkActive, setLinkActive] = useState(true);
  const [regeneratedSuffix, setRegeneratedSuffix] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const { resolvedTheme, accentColor } = useAppContext();
  const [baseUrl, setBaseUrl] = useState('https://aura-ai.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const finalChatId = chatId || 'new';
  const groupUrl = linkActive 
    ? `${baseUrl}/g/${finalChatId}${regeneratedSuffix}` 
    : 'Link deactivated';

  const handleCopy = () => {
    if (!linkActive) return;
    navigator.clipboard.writeText(groupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (msg) => {
    if (showGlobalToast) {
      showGlobalToast(msg);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  return createPortal(
    <>
      {/* Viewport-level Toast (Push Notification Style) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -70, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -70, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              background: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
              color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
              padding: '12px 20px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: resolvedTheme === 'dark' ? '0 12px 35px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.1)',
              zIndex: 9999999999, // Float way above modal backdrop
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#10b981',
              borderRadius: '50%',
              padding: '3px',
              color: '#ffffff'
            }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 99999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={e => {
            e.stopPropagation();
            setIsMenuOpen(false);
          }}
          style={{
            background: 'var(--surface-1)',
            borderRadius: '28px',
            border: '1px solid var(--divider)',
            padding: '28px',
            width: 'calc(100% - 48px)',
            maxWidth: '460px',
            boxShadow: resolvedTheme === 'dark' ? '0 40px 80px rgba(0,0,0,0.6)' : '0 20px 40px rgba(0,0,0,0.1)',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
        <h3 style={{
          color: 'var(--on-surface)',
          fontSize: '22px',
          fontWeight: 600,
          marginBottom: '20px',
          letterSpacing: '-0.4px'
        }}>
          Group link
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: accentColor ? `${accentColor}15` : 'var(--hover-overlay)',
          border: `1px solid ${accentColor ? `${accentColor}40` : 'var(--divider)'}`,
          borderRadius: '14px',
          padding: '12px 16px',
          marginBottom: '20px',
          position: 'relative'
        }}>
          <div style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: linkActive ? 'var(--on-surface)' : 'var(--on-surface-muted)',
            fontSize: '15px',
            fontFamily: 'monospace',
            textDecoration: linkActive ? 'none' : 'line-through'
          }}>
            {groupUrl}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--on-surface-muted)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <MoreHorizontal size={18} />
          </button>

          {/* Context Popover Dropdown Card */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '16px',
                  marginTop: '8px',
                  background: resolvedTheme === 'dark' ? '#1e1e1e' : '#ffffff',
                  border: '1px solid var(--divider)',
                  borderRadius: '16px',
                  boxShadow: resolvedTheme === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.08)',
                  padding: '6px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '170px'
                }}
              >
                {linkActive && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy();
                        setIsMenuOpen(false);
                        showToast('Copied to clipboard');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--on-surface)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Copy size={14} /> Copy link
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const randomSuffix = `?ref=${Math.floor(Math.random() * 1000000)}`;
                        setRegeneratedSuffix(randomSuffix);
                        setIsMenuOpen(false);
                        showToast('Link regenerated');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--on-surface)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <RotateCw size={14} /> Regenerate link
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextState = !linkActive;
                    setLinkActive(nextState);
                    setIsMenuOpen(false);
                    showToast(nextState ? 'Link activated' : 'Link deactivated');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    color: linkActive ? '#ef4444' : '#10b981',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {linkActive ? (
                    <>
                      <Trash2 size={14} style={{ color: '#ef4444' }} /> Deactivate link
                    </>
                  ) : (
                    <>
                      <Check size={14} style={{ color: '#10b981' }} /> Activate link
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p style={{
          color: 'var(--on-surface-muted)',
          fontSize: '14px',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          Use a group link to invite others to join your group chat. Anyone can join your group chat with this link, and they'll be able to see the previous messages in this group chat.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: 'var(--hover-overlay-2)',
              color: 'var(--on-surface)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--divider)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-overlay-2)'}
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={!linkActive}
            style={{
              padding: '12px 28px',
              borderRadius: '999px',
              background: linkActive ? (accentColor || 'var(--on-surface)') : 'var(--hover-overlay-2)',
              color: linkActive ? (accentColor ? '#fff' : 'var(--bg-primary)') : 'var(--on-surface-muted)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: linkActive ? 'pointer' : 'not-allowed',
              border: 'none',
              transition: 'all 0.2s',
              transform: copied ? 'scale(0.98)' : 'scale(1)',
              opacity: linkActive ? 1 : 0.6
            }}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </motion.div>
      </div>
    </>,
    document.body
  );
};


const CustomizedKyraModal = ({ isOpen, onClose, activeChat, onUserClick }) => {
  const { resolvedTheme, profile, removeMember } = useAppContext();
  const isAdmin = activeChat?.creator?.uid === profile?.uid;
  
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 9999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '420px',
            padding: '20px',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.45)',
            border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ 
              fontSize: '18px', fontWeight: 600, color: resolvedTheme === 'dark' ? '#fff' : '#000', 
              letterSpacing: '-0.01em', margin: 0
            }}>
              Customized Kyra
            </h2>
            <button 
              onClick={onClose}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                background: 'transparent', color: resolvedTheme === 'dark' ? '#fff' : '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ height: '1px', background: 'var(--divider)', margin: '0 -20px 18px -20px' }} />

          {isAdmin ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
              <p style={{ fontSize: '14px', color: 'var(--on-surface-muted)', margin: '0 0 8px 0' }}>Group Members Details</p>
              {(() => {
                if (!activeChat?.participants?.length) {
                  return <div style={{ fontSize: '14px', color: 'var(--on-surface-muted)', textAlign: 'center', padding: '20px 0' }}>No members yet.</div>;
                }

                const admins = activeChat.participants.filter(p => activeChat.creator?.uid === p.uid);
                const members = activeChat.participants.filter(p => activeChat.creator?.uid !== p.uid);

                const renderUser = (p, isMemberAdmin) => (
                  <div key={p.uid} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      onClick={() => onUserClick && onUserClick(p)}
                      style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
                        background: 'var(--hover-overlay-2)', border: '1px solid var(--divider)',
                        flexShrink: 0, cursor: 'pointer'
                      }}
                    >
                      {p.avatar ? (
                        <img src={p.avatar} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={18} style={{ color: 'var(--on-surface-subtle)' }} />
                        </div>
                      )}
                    </div>
                    <div 
                      onClick={() => onUserClick && onUserClick(p)}
                      style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontWeight: 600, color: resolvedTheme === 'dark' ? '#fff' : '#000', fontSize: '14.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.displayName || 'User'} {p.uid === profile?.uid && '(You)'}
                        </div>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                          background: isMemberAdmin ? 'rgba(52, 199, 89, 0.15)' : 'var(--hover-overlay)',
                          color: isMemberAdmin ? '#34c759' : 'var(--on-surface-muted)'
                        }}>
                          {isMemberAdmin ? 'ADMIN' : 'MEMBER'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--on-surface-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.email || 'No email provided'}
                      </div>
                    </div>
                    
                    {!isMemberAdmin && (
                      <button
                        onClick={() => removeMember(activeChat.id, p)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', border: 'none',
                          background: 'rgba(255, 69, 58, 0.1)', color: '#ff453a',
                          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          transition: 'background 0.2s', flexShrink: 0
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 69, 58, 0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 69, 58, 0.1)'}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );

                return (
                  <>
                    {admins.map(p => renderUser(p, true))}
                    {members.length > 0 && (
                      <div style={{ height: '1px', background: 'var(--divider)', margin: '4px 0' }} />
                    )}
                    {members.map(p => renderUser(p, false))}
                  </>
                );
              })()}
            </div>
          ) : (
             <div style={{ padding: '20px 0', textAlign: 'center' }}>
               <div style={{ 
                 width: '48px', height: '48px', borderRadius: '50%', 
                 background: 'rgba(255, 69, 58, 0.1)', color: '#ff453a',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 margin: '0 auto 16px auto'
               }}>
                 <AlertTriangle size={24} />
               </div>
               <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>Admin Access Required</h3>
               <p style={{ fontSize: '14px', color: 'var(--on-surface-muted)', lineHeight: 1.5, margin: 0 }}>
                 Customized Kyra options are restricted to group admins. You are a member.
               </p>
             </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const UserProfileModal = ({ user, onClose }) => {
  const { resolvedTheme } = useAppContext();
  
  if (!user) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 99999999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '360px',
            padding: '32px 24px',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.45)',
            border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              width: '30px', height: '30px', borderRadius: '8px',
              border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              background: 'transparent', color: resolvedTheme === 'dark' ? '#fff' : '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={16} />
          </button>
          
          <div style={{ 
            width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
            background: 'var(--hover-overlay-2)', border: '2px solid var(--divider)',
            marginBottom: '16px', marginTop: '10px'
          }}>
            {user.avatar ? (
              <img src={user.avatar} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={36} style={{ color: 'var(--on-surface-subtle)' }} />
              </div>
            )}
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--on-surface)', margin: '0 0 6px 0', textAlign: 'center', fontFamily: 'inherit' }}>
            {user.displayName || 'User'}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--on-surface-muted)', margin: 0, textAlign: 'center' }}>
            {user.email || 'No email provided'}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const { resolvedTheme, accentColor } = useAppContext();
  const [selectedOption, setSelectedOption] = useState(null);

  if (!isOpen) return null;

  const options = [
    "Violence & self-harm",
    "Sexual exploitation & abuse",
    "Child/teen exploitation",
    "Bullying & harassment",
    "Spam, fraud & deception",
    "Privacy violation",
    "Intellectual property",
    "Age-inappropriate content",
    "Something else"
  ];

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 999999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '24px',
          width: 'calc(100% - 48px)',
          maxWidth: '440px',
          padding: '24px',
          position: 'relative',
          boxShadow: resolvedTheme === 'dark' ? '0 40px 80px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid var(--divider)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0' }}>Report group chat</h2>
            <p style={{ color: 'var(--on-surface)', fontSize: '15px', fontWeight: 500, margin: 0 }}>Why are you reporting this conversation?</p>
          </div>
          <button 
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--divider)',
              background: 'transparent', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {options.map((option, idx) => (
            <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'var(--on-surface)', fontSize: '14.5px' }}>
              <div 
                onClick={() => setSelectedOption(option)}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedOption === option ? (accentColor || 'var(--on-surface)') : (resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}
              >
                {selectedOption === option && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: accentColor || 'var(--on-surface)' }} />}
              </div>
              <span>{option}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            disabled={!selectedOption}
            onClick={() => {
              if (onSubmit) {
                onSubmit(selectedOption);
              } else {
                onClose();
              }
            }}
            style={{
              padding: '10px 24px', borderRadius: '999px',
              background: selectedOption ? (accentColor || 'var(--on-surface)') : 'var(--hover-overlay)',
              color: selectedOption ? (accentColor ? '#fff' : 'var(--bg-primary)') : 'var(--on-surface-subtle)',
              fontSize: '14px', fontWeight: 600, border: 'none', cursor: selectedOption ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const MsgDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-1)',
          borderRadius: '24px',
          border: '1px solid var(--divider)',
          padding: '28px',
          width: '380px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        <h3 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, marginBottom: '14px' }}>
          Delete message?
        </h3>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '14.5px', lineHeight: 1.5, marginBottom: '24px' }}>
          This will remove the message from your view. Other participants will still be able to see it.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: '999px',
              background: 'var(--hover-overlay-2)', color: 'var(--on-surface-muted)',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--divider)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px', borderRadius: '999px',
              background: '#e53e3e', color: '#fff',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none'
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

const ExitConfirmModal = ({ isOpen, onClose, onConfirm, resolvedTheme }) => {
  if (!isOpen) return null;
  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 100000000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '400px', background: resolvedTheme === 'dark' ? 'var(--surface-1)' : '#fff',
          borderRadius: '24px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid var(--divider)'
        }}
      >
        <h3 style={{ color: 'var(--on-surface)', fontSize: '18px', fontWeight: 600, marginBottom: '14px', fontFamily: 'inherit' }}>Exit group?</h3>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '14.5px', lineHeight: 1.55, marginBottom: '24px' }}>
          Are you sure you want to leave this group? You will no longer be able to see or send messages in this chat.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 22px', borderRadius: '999px', background: 'var(--hover-overlay-2)', color: 'var(--on-surface-muted)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--divider)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '9px 22px', borderRadius: '999px', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
          >
            Exit
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default ChatWindow;
