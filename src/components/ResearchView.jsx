'use client';

import React, { useState, useEffect } from 'react';
import { Telescope, Plus, ChevronDown, Mic, ArrowUpRight, ArrowUp, Send, Check, AudioLines, LayoutGrid, Globe, CornerDownRight, MoreHorizontal, X, Copy, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function ResearchView({ onStartResearch }) {
  const { accentColor, resolvedTheme } = useAppContext();
  const [inputValue, setInputValue] = useState('');

  const isDark = resolvedTheme === 'dark';
  const bgColor = isDark ? '#0a0a0c' : 'var(--bg-primary)';
  const textColor = isDark ? '#f3f4f6' : 'var(--on-surface)';
  const headingColorStyle = isDark 
    ? { background: 'linear-gradient(180deg, #ffffff 0%, #e5e7eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
    : { color: 'var(--on-surface)' };
  const subtextColor = isDark ? '#9ca3af' : 'var(--on-surface-muted)';
  const cardBg = isDark ? 'rgba(24, 24, 27, 0.8)' : 'var(--surface-1)';
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--divider)';
  const cardShadow = isDark ? '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)' : 'var(--shadow-md)';
  const inputTextColor = isDark ? '#f9fafb' : 'var(--on-surface)';
  const pillBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay-2)';
  const dropdownBg = isDark ? '#232325' : 'var(--surface-1)';
  const modalBg = isDark ? '#232325' : 'var(--surface-1)';
  const inputBg = isDark ? '#121214' : 'var(--surface-2)';
  const [isAppsDropdownOpen, setIsAppsDropdownOpen] = useState(false);
  const [isSitesDropdownOpen, setIsSitesDropdownOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState('All Apps');
  const [selectedSiteOption, setSelectedSiteOption] = useState('Search the web');
  const [isSpecificSitesOpen, setIsSpecificSitesOpen] = useState(false);
  const [isDotsMenuOpen, setIsDotsMenuOpen] = useState(false);
  const [specificSites, setSpecificSites] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('aura-specific-sites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [siteInput, setSiteInput] = useState('');
  const [prioritizeSites, setPrioritizeSites] = useState(true);
  const [faviconErrors, setFaviconErrors] = useState({});

  const appsDropdownRef = React.useRef(null);
  const sitesDropdownRef = React.useRef(null);
  const dotsMenuRef = React.useRef(null);

  const getCleanDomain = (url) => {
    let clean = url.trim();
    if (!clean) return '';
    // Strip protocol
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Strip path and query parameters
    clean = clean.split('/')[0].split('?')[0];
    return clean.toLowerCase();
  };

  const handleAddSites = () => {
    if (!siteInput.trim()) return;
    const newSites = siteInput
      .split(',')
      .map(s => getCleanDomain(s))
      .filter(s => s && !specificSites.includes(s));
    
    if (newSites.length > 0) {
      const updated = [...specificSites, ...newSites];
      setSpecificSites(updated);
      try { localStorage.setItem('aura-specific-sites', JSON.stringify(updated)); } catch {}
    }
    setSiteInput('');
  };

  const handleCopyList = () => {
    if (specificSites.length > 0) {
      navigator.clipboard.writeText(specificSites.join(', '));
    }
    setIsDotsMenuOpen(false);
  };

  const handleClearList = () => {
    setSpecificSites([]);
    try { localStorage.removeItem('aura-specific-sites'); } catch {}
    setIsDotsMenuOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (appsDropdownRef.current && !appsDropdownRef.current.contains(event.target)) {
        setIsAppsDropdownOpen(false);
      }
      if (sitesDropdownRef.current && !sitesDropdownRef.current.contains(event.target)) {
        setIsSitesDropdownOpen(false);
      }
      if (dotsMenuRef.current && !dotsMenuRef.current.contains(event.target)) {
        setIsDotsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Persist specificSites whenever they change (individual removals via the delete button)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (specificSites.length > 0) {
        localStorage.setItem('aura-specific-sites', JSON.stringify(specificSites));
      } else {
        localStorage.removeItem('aura-specific-sites');
      }
    } catch {}
  }, [specificSites]);

  const suggestions = [
    {
      title: 'Compare Mobile Plans',
      description: 'Analyze pricing, data limits, and coverage across mobile carriers. Identify where consumers save most.',
      prompt: 'Compare Mobile Plans: Analyze pricing, data limits, and coverage across mobile carriers. Identify where consumers save most.'
    },
    {
      title: 'Compare Housing Options',
      description: 'Analyze renting versus buying across major regions using price trends, interest rates, and long-term costs.',
      prompt: 'Compare Housing Options: Analyze renting versus buying across major regions using price trends, interest rates, and long-term costs.'
    },
    {
      title: 'Compare Music Trends',
      description: 'Analyze streaming data, live shows, and genre popularity to understand how music taste evolves globally.',
      prompt: 'Compare Music Trends: Analyze streaming data, live shows, and genre popularity to understand how music taste evolves globally.'
    },
    {
      title: 'Track Climate Impacts',
      description: 'Analyze recent climate, energy, and environmental data to identify the regions and industries most affected.',
      prompt: 'Track Climate Impacts: Analyze recent climate, energy, and environmental data to identify the regions and industries most affected.'
    }
  ];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    onStartResearch(inputValue);
  };

  const handleSuggestionClick = (prompt) => {
    setInputValue(prompt);
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        width: '100%',
        background: bgColor,
        color: textColor,
        fontFamily: "'Inter', sans-serif",
        padding: '40px 24px',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Top Header */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '32px',
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        {/* Blue Circle Icon */}
        <div 
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
            marginBottom: '24px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            transition: 'transform 0.3s ease'
          }}
          className="hover:scale-105"
        >
          <Telescope size={28} color="#ffffff" strokeWidth={1.5} />
        </div>

        {/* Headings */}
        <h1 
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '32px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            marginBottom: '10px',
            ...headingColorStyle
          }}
        >
          Ready when you are.
        </h1>
        <p 
          style={{
            fontSize: '15px',
            color: subtextColor,
            fontWeight: 400,
            maxWidth: '480px'
          }}
        >
          Ask a complex question. Get a full report, with sources.
        </p>
      </div>

      {/* Search Input Card */}
      <form 
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '760px',
          background: cardBg,
          backdropFilter: 'blur(20px)',
          border: cardBorder,
          borderRadius: '28px',
          padding: '16px 20px',
          boxShadow: cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '36px',
          transition: 'all 0.3s ease'
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.2)';
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
        }}
      >
        {/* Row 1: Text Area */}
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Get a detailed report"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: inputTextColor,
            fontSize: '16px',
            width: '100%',
            fontWeight: 400,
            padding: '4px 0'
          }}
        />

        {/* Row 2: Control Toolbar */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            width: '100%',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          {/* Left Side Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Attachment Button */}
            <button
              type="button"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: pillBg,
                color: 'var(--on-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--hover-overlay)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = pillBg;
              }}
            >
              <Plus size={16} />
            </button>

            {/* Deep Research Pill */}
            <div
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
                cursor: 'default',
                userSelect: 'none'
              }}
            >
              <Telescope size={14} color="#60a5fa" strokeWidth={2} />
              <span>Deep research</span>
            </div>

            {/* Apps Dropdown */}
            <div ref={appsDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setIsAppsDropdownOpen(!isAppsDropdownOpen);
                  setIsSitesDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: isAppsDropdownOpen ? pillBg : 'transparent',
                  color: isAppsDropdownOpen ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = pillBg;
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
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 50,
                    width: '160px',
                    background: dropdownBg,
                    border: cardBorder,
                    borderRadius: '12px',
                    padding: '6px',
                    boxShadow: isDark ? '0 10px 25px rgba(0, 0, 0, 0.5)' : 'var(--shadow-md)'
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
                        color: selectedApp === app ? (isDark ? '#60a5fa' : 'var(--accent-color)') : 'var(--on-surface)',
                        background: selectedApp === app ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'var(--hover-overlay-2)') : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                      onMouseLeave={e => e.currentTarget.style.background = selectedApp === app ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'var(--hover-overlay-2)') : 'transparent'}
                    >
                      <span>{app}</span>
                      {selectedApp === app && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sites Dropdown */}
            <div ref={sitesDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setIsSitesDropdownOpen(!isSitesDropdownOpen);
                  setIsAppsDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: isSitesDropdownOpen ? pillBg : 'transparent',
                  color: isSitesDropdownOpen ? 'var(--on-surface)' : 'var(--on-surface-muted)',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = pillBg;
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
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 50,
                    width: '230px',
                    background: dropdownBg,
                    border: cardBorder,
                    borderRadius: '14px',
                    padding: '6px',
                    boxShadow: isDark ? '0 12px 30px rgba(0, 0, 0, 0.5)' : 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  {/* Item 1: Search the web */}
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
                      transition: 'background 0.2s ease',
                      border: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Globe size={15} style={{ color: 'var(--on-surface-muted)' }} />
                    <span style={{ flex: 1 }}>Search the web</span>
                    {selectedSiteOption === 'Search the web' && <Check size={15} style={{ color: 'var(--on-surface)' }} />}
                  </button>

                  {/* Separator line */}
                  <div style={{ height: '1px', background: 'var(--divider)', margin: '4px 6px' }} />

                  {/* Item 2: Specific sites */}
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
                      transition: 'background 0.2s ease',
                      border: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Globe size={15} style={{ color: 'var(--on-surface-muted)' }} />
                    <span style={{ flex: 1 }}>Specific sites ({specificSites.length})</span>
                    {selectedSiteOption === 'Specific sites' && <Check size={15} style={{ color: 'var(--on-surface)' }} />}
                  </button>

                  {/* Item 3: Manage sites */}
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
                      transition: 'background 0.2s ease',
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
          </div>

          {/* Right Side Buttons (Microphone and Send) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <button
              type="button"
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

            {/* Send button matching the standard chat style */}
            <button
              type={inputValue.trim() ? "submit" : "button"}
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all animate-fade-in"
              style={{ 
                background: !inputValue.trim() ? 'var(--hover-overlay-2)' : accentColor,
                color: !inputValue.trim() ? 'var(--on-surface-subtle)' : '#ffffff',
                cursor: !inputValue.trim() ? 'not-allowed' : 'pointer',
                opacity: !inputValue.trim() ? 0.6 : 1,
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: inputValue.trim() ? `0 4px 12px ${accentColor}40` : 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                if (inputValue.trim()) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={e => {
                if (inputValue.trim()) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <ArrowUp size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>

      {/* Suggestion list */}
      <div 
        style={{
          width: '100%',
          maxWidth: '760px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {suggestions.map((item, index) => (
          <div
            key={index}
            onClick={() => handleSuggestionClick(item.prompt)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'transparent', // No default background card
              border: 'none', // No border
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              width: '100%',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'; // Subtle hover pill background
              const arrow = e.currentTarget.querySelector('.arrow-icon');
              if (arrow) arrow.style.transform = 'translate(2px, -2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              const arrow = e.currentTarget.querySelector('.arrow-icon');
              if (arrow) arrow.style.transform = 'translate(0, 0)';
            }}
          >
            {/* Arrow icon */}
            <div 
              className="arrow-icon"
              style={{
                color: isDark ? '#9ca3af' : 'var(--on-surface-muted)',
                transition: 'transform 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <ArrowUpRight size={16} strokeWidth={2} />
            </div>

            {/* Suggestion text content on a single line */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                width: '100%',
                fontSize: '14px'
              }}
            >
              <span 
                style={{
                  fontWeight: 600,
                  color: textColor,
                  flexShrink: 0
                }}
              >
                {item.title}
              </span>
              <span 
                style={{
                  color: subtextColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Search Specific Sites Modal */}
      {isSpecificSitesOpen && (
        <div 
          onClick={() => {
            setIsSpecificSitesOpen(false);
            setIsDotsMenuOpen(false);
          }} // Close modal and dots menu when clicking outside (on the backdrop)
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.4)', // Muted backdrop
            backdropFilter: 'none'
          }}
        >
          <div 
            onClick={(e) => {
              e.stopPropagation();
              // Close dots menu if clicking inside the card but outside the dots menu
              if (dotsMenuRef.current && !dotsMenuRef.current.contains(e.target)) {
                setIsDotsMenuOpen(false);
              }
            }} // Prevent closing modal when clicking inside the card
            style={{
              width: '480px', // Slightly wider for a premium layout
              background: modalBg, // High fidelity slate color matching screenshot
              border: cardBorder,
              borderRadius: '16px',
              padding: '22px 24px', // Taller padding for increased height
              boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.5)' : 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: textColor, fontFamily: "'Outfit', sans-serif" }}>
                Search specific sites
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: subtextColor }}>
                {/* Dots Dropdown Wrapper */}
                <div style={{ position: 'relative' }}>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDotsMenuOpen(!isDotsMenuOpen);
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: subtextColor, background: 'none', border: 'none', padding: 0 }}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {isDotsMenuOpen && (
                    <div 
                      ref={dotsMenuRef}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        zIndex: 110,
                        width: '140px',
                        background: isDark ? '#2a2a2c' : 'var(--surface-2)', // Matches card dropdown
                        border: cardBorder,
                        borderRadius: '12px',
                        padding: '6px',
                        boxShadow: isDark ? '0 10px 25px rgba(0, 0, 0, 0.5)' : 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      {/* Copy List Option */}
                      <button
                        type="button"
                        onClick={handleCopyList}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: textColor,
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: 'none'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-overlay)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Copy size={14} style={{ color: subtextColor }} />
                        <span>Copy list</span>
                      </button>

                      {/* Clear List Option */}
                      <button
                        type="button"
                        onClick={handleClearList}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#f87171', // Coral/red color text matching mockup
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: 'none'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(248, 113, 113, 0.08)' : 'rgba(248, 113, 113, 0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 size={14} style={{ color: '#f87171' }} />
                        <span>Clear list</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsSpecificSitesOpen(false);
                    setIsDotsMenuOpen(false);
                  }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: textColor, background: 'none', border: 'none', padding: 0 }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Added Sites List */}
            {specificSites.length > 0 && (
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}
              >
                {specificSites.map((site) => (
                  <div 
                    key={site} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: inputBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: subtextColor,
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid var(--divider)',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        {faviconErrors[site] ? (
                          'www'
                        ) : (
                          <img 
                            src={`https://www.google.com/s2/favicons?sz=64&domain=${site}`}
                            alt=""
                            onError={() => {
                              setFaviconErrors(prev => ({ ...prev, [site]: true }));
                            }}
                            style={{ width: '16px', height: '16px' }}
                          />
                        )}
                      </div>
                      <span style={{ fontSize: '14.5px', color: textColor, fontWeight: 500 }}>
                        {site}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSpecificSites(specificSites.filter(s => s !== site));
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: subtextColor,
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--hover-overlay)';
                        e.currentTarget.style.color = '#f87171';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = subtextColor;
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
              <input 
                type="text"
                value={siteInput}
                onChange={(e) => setSiteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSites();
                  }
                }}
                placeholder="Add site URLs, separated by commas"
                style={{
                  flex: 1,
                  background: inputBg,
                  border: isDark ? 'none' : '1px solid var(--divider)',
                  outline: 'none',
                  color: textColor,
                  fontSize: '14px', // Taller font size
                  padding: '12px 20px', // Taller padding for input capsule height
                  borderRadius: '999px',
                  fontWeight: 400
                }}
              />
              <button
                type="button"
                onClick={handleAddSites}
                style={{
                  padding: '10px 22px', // Taller padding for button height
                  borderRadius: '999px',
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--hover-overlay-2)',
                  color: textColor,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: isDark ? 'none' : '1px solid var(--divider)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.15)' : 'var(--hover-overlay)'}
                onMouseLeave={e => e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--hover-overlay-2)'}
              >
                Add
              </button>
            </div>

            {/* Prioritize sites toggle */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid var(--divider)',
                paddingTop: '16px',
                marginTop: '4px'
              }}
            >
              <span style={{ fontSize: '13.5px', color: subtextColor, fontWeight: 400 }}>
                Prioritize these sites, but allow full-web search
              </span>
              <button
                type="button"
                onClick={() => setPrioritizeSites(!prioritizeSites)}
                style={{
                  width: '38px',
                  height: '22px',
                  borderRadius: '999px',
                  background: prioritizeSites ? (accentColor || '#3b82f6') : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--hover-overlay-2)'),
                  position: 'relative',
                  cursor: 'pointer',
                  border: prioritizeSites ? `1px solid ${accentColor || '#3b82f6'}` : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--divider)'),
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  outline: 'none'
                }}
              >
                <div 
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: prioritizeSites ? '18px' : '2px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
