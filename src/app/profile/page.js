'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Pencil, Camera, Smile, Layers, LayoutGrid, 
  Briefcase, Sparkles, ShieldCheck, Users, Mail, Palette,
  Sun, Paintbrush, ChevronDown, ChevronUp, Settings, AudioLines,
  Database, Shield, Bug, Info, Check, LogOut, HelpCircle, 
  FileText, Glasses, Circle, RefreshCw, Trash, Plus, X, Lock, ChevronRight, Globe, Search
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const ACCENT_COLORS = [
  { name: 'Default', hex: '#6366f1', bullet: '#71717a' },
  { name: 'Blue', hex: '#2563eb', bullet: '#2563eb' },
  { name: 'Green', hex: '#16a34a', bullet: '#16a34a' },
  { name: 'Yellow', hex: '#ca8a04', bullet: '#ca8a04' },
  { name: 'Pink', hex: '#db2777', bullet: '#db2777' },
  { name: 'Orange', hex: '#ea580c', bullet: '#ea580c' }
];

const THEMES = ['System (Default)', 'Light', 'Dark'];
const VOICES = ['Sol', 'Breeze', 'Cove', 'Ember', 'Juniper'];
const INTELLIGENCE_OPTIONS = ['Advanced', 'Standard'];
const LANGUAGES = ['Auto-Detect', 'English', 'Urdu', 'Spanish', 'French', 'German'];
const BASE_STYLES = ['Default', 'Professional', 'Casual', 'Friendly', 'Direct & Concise'];
const APP_LANGUAGES = [
  { name: 'System default', native: 'System Default', code: 'system' },
  { name: 'Afrikaans', native: 'Afrikaans', code: 'af' },
  { name: 'Amharic', native: 'አማርኛ', code: 'am' },
  { name: 'Arabic', native: 'العربية', code: 'ar' },
  { name: 'Azerbaijani', native: 'Azərbaycanca', code: 'az' },
  { name: 'Belarusian', native: 'беларуская', code: 'be' },
  { name: 'Bulgarian', native: 'български', code: 'bg' },
  { name: 'Bengali', native: 'বাংলা', code: 'bn' },
  { name: 'Bosnian', native: 'bosanski', code: 'bs' },
  { name: 'Catalan', native: 'català', code: 'ca' },
  { name: 'Czech', native: 'čeština', code: 'cs' },
  { name: 'Danish', native: 'dansk', code: 'da' },
  { name: 'German', native: 'Deutsch', code: 'de' },
  { name: 'Greek', native: 'Ελληνικά', code: 'el' },
  { name: 'English (UK)', native: 'English (United Kingdom)', code: 'en-GB' },
  { name: 'English (US)', native: 'English (United States)', code: 'en-US' },
  { name: 'Spanish', native: 'Español', code: 'es' },
  { name: 'Estonian', native: 'eesti', code: 'et' },
  { name: 'Basque', native: 'euskara', code: 'eu' },
  { name: 'Persian', native: 'فارسی', code: 'fa' },
  { name: 'Finnish', native: 'suomi', code: 'fi' },
  { name: 'French', native: 'Français', code: 'fr' },
  { name: 'Galician', native: 'galego', code: 'gl' },
  { name: 'Gujarati', native: 'ગુજરાતી', code: 'gu' },
  { name: 'Hebrew', native: 'עברית', code: 'he' },
  { name: 'Hindi', native: 'हिन्दी', code: 'hi' },
  { name: 'Croatian', native: 'hrvatski', code: 'hr' },
  { name: 'Hungarian', native: 'magyar', code: 'hu' },
  { name: 'Armenian', native: 'հայերեն', code: 'hy' },
  { name: 'Indonesian', native: 'Bahasa Indonesia', code: 'id' },
  { name: 'Icelandic', native: 'íslenska', code: 'is' },
  { name: 'Italian', native: 'Italiano', code: 'it' },
  { name: 'Japanese', native: '日本語', code: 'ja' },
  { name: 'Georgian', native: 'ქართული', code: 'ka' },
  { name: 'Kazakh', native: 'қазақ тілі', code: 'kk' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', code: 'kn' },
  { name: 'Korean', native: '한국어', code: 'ko' },
  { name: 'Kyrgyz', native: 'кыргызча', code: 'ky' },
  { name: 'Lithuanian', native: 'lietuvių', code: 'lt' },
  { name: 'Latvian', native: 'latviešu', code: 'lv' },
  { name: 'Macedonian', native: 'македонски', code: 'mk' },
  { name: 'Malayalam', native: 'മലയാളം', code: 'ml' },
  { name: 'Mongolian', native: 'монгол', code: 'mn' },
  { name: 'Marathi', native: 'मраठी', code: 'mr' },
  { name: 'Malay', native: 'Bahasa Melayu', code: 'ms' },
  { name: 'Burmese', native: 'မြန်မာ', code: 'my' },
  { name: 'Nepali', native: 'नेपाली', code: 'ne' },
  { name: 'Dutch', native: 'Nederlands', code: 'nl' },
  { name: 'Norwegian', native: 'Norsk', code: 'no' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', code: 'pa' },
  { name: 'Polish', native: 'polski', code: 'pl' },
  { name: 'Portuguese (Brazil)', native: 'Português (Brasil)', code: 'pt-BR' },
  { name: 'Portuguese (Portugal)', native: 'Português (Portugal)', code: 'pt-PT' },
  { name: 'Romanian', native: 'română', code: 'ro' },
  { name: 'Russian', native: 'Русский', code: 'ru' },
  { name: 'Sinhala', native: 'සිංහල', code: 'si' },
  { name: 'Slovak', native: 'slovenčina', code: 'sk' },
  { name: 'Slovenian', native: 'slovenščina', code: 'sl' },
  { name: 'Albanian', native: 'shqip', code: 'sq' },
  { name: 'Serbian', native: 'српски', code: 'sr' },
  { name: 'Swedish', native: 'svenska', code: 'sv' },
  { name: 'Swahili', native: 'Kiswahili', code: 'sw' },
  { name: 'Tamil', native: 'தமிழ்', code: 'ta' },
  { name: 'Telugu', native: 'తెలుగు', code: 'te' },
  { name: 'Thai', native: 'ไทย', code: 'th' },
  { name: 'Filipino', native: 'Filipino', code: 'tl' },
  { name: 'Turkish', native: 'Türkçe', code: 'tr' },
  { name: 'Ukrainian', native: 'українська', code: 'uk' },
  { name: 'Urdu', native: 'اردو', code: 'ur' },
  { name: 'Uzbek', native: 'o‘zbekcha', code: 'uz' },
  { name: 'Vietnamese', native: 'Tiếng Việt', code: 'vi' },
  { name: 'Chinese (Simplified)', native: '简体中文', code: 'zh-CN' },
  { name: 'Chinese (Traditional)', native: '繁體中文', code: 'zh-TW' },
  { name: 'Zulu', native: 'isiZulu', code: 'zu' }
];

// App Integrations Mock Registry
const BROWSE_REGISTRY = [
  { 
    id: 'notion', 
    name: 'Notion', 
    connected: false,
    color: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M4.6 2.3h14.8c1.3 0 2.3 1 2.3 2.3v14.8c0 1.3-1 2.3-2.3 2.3H4.6c-1.3 0-2.3-1-2.3-2.3V4.6c0-1.3 1-2.3 2.3-2.3zm1.7 4.1v11.3h2.1V9.9L14.7 17.7h3.1V6.4h-2.1v6.5L9.4 6.4H6.3z" />
      </svg>
    )
  },
  { 
    id: 'gdrive', 
    name: 'Google Drive', 
    connected: false,
    color: '#34A853',
    icon: (
      <svg viewBox="0 0 64 64" width="20" height="20">
        <path fill="#4285F4" d="M28.7 40.5L18 59h35.3L64 40.5H28.7z" />
        <path fill="#FBBC05" d="M61 35.3L42.7 3.6H21.3l18.3 31.7H61z" />
        <path fill="#34A853" d="M18.3 8.8L0 40.5 10.7 59 29 27.3 18.3 8.8z" />
      </svg>
    )
  },
  { 
    id: 'slack', 
    name: 'Slack', 
    connected: false,
    color: '#4A154B',
    icon: (
      <svg viewBox="0 0 54 54" width="20" height="20">
        <g fill="none" fillRule="evenodd">
          <path d="M19.712 28.992a3.552 3.552 0 1 1-3.552 3.552h3.552v-3.552zm1.776 0a3.552 3.552 0 0 1 3.552-3.552h7.104a3.552 3.552 0 0 1 3.552 3.552v7.104a3.552 3.552 0 0 1-3.552 3.552h-7.104a3.552 3.552 0 0 1-3.552-3.552v-7.104z" fill="#36C5F0" />
          <path d="M25.04 14.784a3.552 3.552 0 1 1 3.552-3.552v3.552h-3.552zm0 1.776a3.552 3.552 0 0 1 3.552 3.552v7.104a3.552 3.552 0 0 1-3.552 3.552h-7.104a3.552 3.552 0 0 1-3.552-3.552v-7.104a3.552 3.552 0 0 1 3.552-3.552h7.104z" fill="#2EB67D" />
          <path d="M39.264 20.112a3.552 3.552 0 1 1 3.552-3.552h-3.552v3.552zm-1.776 0a3.552 3.552 0 0 1-3.552 3.552h-7.104a3.552 3.552 0 0 1-3.552-3.552v-7.104a3.552 3.552 0 0 1 3.552-3.552h7.104a3.552 3.552 0 0 1 3.552 3.552v7.104z" fill="#ECB22E" />
          <path d="M33.936 34.32a3.552 3.552 0 1 1-3.552 3.552v-3.552h3.552zm0-1.776a3.552 3.552 0 0 1-3.552-3.552v-7.104a3.552 3.552 0 0 1 3.552-3.552h7.104a3.552 3.552 0 0 1 3.552 3.552v7.104a3.552 3.552 0 0 1-3.552 3.552h-7.104z" fill="#E01E5A" />
        </g>
      </svg>
    )
  }
];

export default function ProfilePage() {
  const router = useRouter();
  const { 
    profile, setProfile, user, logout,
    theme, resolvedTheme, setAppTheme, accentColor, setAccentColor 
  } = useAppContext();
  const fileInputRef = useRef(null);

  // Responsive device check & desktop redirect
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return true; // Default to true for SSR/mobile-first rendering
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // View state: 'main' | 'about' | 'voice' | 'personalization' | 'apps'
  const [currentView, _setCurrentView] = useState('main');
  const [mainViewScrollPos, setMainViewScrollPos] = useState(0);

  // Sync initial view from query parameter dynamically to allow deep linking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view) {
        _setCurrentView(view);
      }
    }
  }, []);

  // Helper to query the actual scrollable layout element
  const getScrollContainer = () => {
    return document.getElementById('profile-scroll-container') || document.documentElement || document.body;
  };

  const setCurrentView = (view) => {
    if (view === 'main') {
      _setCurrentView('main');
    } else {
      if (currentView === 'main') {
        const container = getScrollContainer();
        setMainViewScrollPos(container.scrollTop);
      }
      _setCurrentView(view);
    }
  };

  // Scroll manager effect
  useEffect(() => {
    const scrollTarget = currentView === 'main' ? mainViewScrollPos : 0;
    let attempts = 0;
    
    const performScroll = () => {
      const container = getScrollContainer();
      if (!container) return;
      
      container.scrollTop = scrollTarget;
      
      // If returning to main view and the container hasn't expanded fully yet,
      // wait a tiny bit and retry (up to 10 attempts / 300ms total)
      if (
        currentView === 'main' && 
        scrollTarget > 0 && 
        container.scrollTop < scrollTarget && 
        attempts < 10
      ) {
        attempts++;
        setTimeout(performScroll, 30);
      }
    };

    const timer = setTimeout(performScroll, 20);
    return () => clearTimeout(timer);
  }, [currentView, mainViewScrollPos]);

  // Profile data fallbacks
  const displayName = profile?.displayName || 'zeeshan';
  const username = profile?.username || 'muhmmadzeeshanabid';
  const avatar = profile?.avatar || null;
  const userEmail = user?.email || profile?.email || 'muhmmadzeeshanabid@gmail.com';

  // Initials from display name
  const initials = displayName
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  // Local/Global customizations
  const selectedAccent = ACCENT_COLORS.find(c => c.hex.toLowerCase() === accentColor?.toLowerCase()) || ACCENT_COLORS[0];
  const themeMap = {
    system: 'System (Default)',
    light: 'Light',
    dark: 'Dark'
  };
  const selectedTheme = themeMap[theme] || 'System (Default)';
  const [isAccentDropdownOpen, setIsAccentDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Voice Interactive Sub-States
  const [selectedVoice, setSelectedVoice] = useState('Sol');
  const [selectedIntelligence, setSelectedIntelligence] = useState('Advanced');
  const [selectedLanguage, setSelectedLanguage] = useState('Auto-Detect');
  const [openInSeparateMode, setOpenInSeparateMode] = useState(false);
  const [backgroundConversations, setBackgroundConversations] = useState(false);
  const [useAsDefaultAssistant, setUseAsDefaultAssistant] = useState(false);

  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isIntelligenceDropdownOpen, setIsIntelligenceDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Personalization Interactive Sub-States
  const [selectedBaseStyle, setSelectedBaseStyle] = useState('Default');
  const [isBaseStyleDropdownOpen, setIsBaseStyleDropdownOpen] = useState(false);
  const [characteristics, setCharacteristics] = useState('');
  const [fastAnswers, setFastAnswers] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isCharacteristicsInputOpen, setIsCharacteristicsInputOpen] = useState(false);
  
  // Advanced variables
  const [temperature, setTemperature] = useState(0.7);
  const [memoryWeight, setMemoryWeight] = useState(0.8);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Apps Interactive Sub-States
  const [enabledApps, setEnabledApps] = useState(['github', 'spotify']);
  const [isBrowseSheetOpen, setIsBrowseSheetOpen] = useState(false);
  const [appToDisconnect, setAppToDisconnect] = useState(null);
  const [connectingAppId, setConnectingAppId] = useState(null);

  // Report Bug Sub-States
  const [isBugSheetOpen, setIsBugSheetOpen] = useState(false);
  const [bugDescription, setBugDescription] = useState('');
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [showBugToast, setShowBugToast] = useState(false);

  // Bug reporting submission action
  const handleBugSubmit = () => {
    if (!bugDescription.trim()) return;
    setIsSubmittingBug(true);
    setTimeout(() => {
      setIsSubmittingBug(false);
      setShowBugToast(true);
      setBugDescription('');
      setIsBugSheetOpen(false);
      setTimeout(() => {
        setShowBugToast(false);
      }, 2500);
    }, 1200);
  };

  // Trusted Contact Sub-States
  const [trustedContact, setTrustedContact] = useState(null);
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [draftContactName, setDraftContactName] = useState('');
  const [draftContactRelation, setDraftContactRelation] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [draftContactPhone, setDraftContactPhone] = useState('');
  const [draftContactEmail, setDraftContactEmail] = useState('');
  const [showContactToast, setShowContactToast] = useState(false);
  const [contactToastMessage, setContactToastMessage] = useState('');
  const [isContactConfirmed, setIsContactConfirmed] = useState(false);

  const openContactDrawer = (isEdit = false) => {
    setIsContactConfirmed(false);
    if (isEdit && trustedContact) {
      setDraftContactName(trustedContact.name);
      setDraftContactRelation(trustedContact.relationship);
      setCountryCode(trustedContact.countryCode || '+1');
      setDraftContactPhone(trustedContact.phone || '');
      setDraftContactEmail(trustedContact.email || '');
    } else {
      setDraftContactName('');
      setDraftContactRelation('');
      setCountryCode('+1');
      setDraftContactPhone('');
      setDraftContactEmail('');
    }
    setIsContactSheetOpen(true);
  };

  const handleContactSubmit = () => {
    if (!draftContactName.trim() || (!draftContactEmail.trim() && !draftContactPhone.trim())) return;
    const isEditing = !!trustedContact;
    setTrustedContact({
      name: draftContactName,
      relationship: 'Friend',
      countryCode: countryCode,
      phone: draftContactPhone,
      email: draftContactEmail
    });
    setIsContactSheetOpen(false);
    setContactToastMessage(isEditing ? 'Trusted contact updated' : 'Trusted contact added');
    setShowContactToast(true);
    setTimeout(() => setShowContactToast(false), 2500);
  };

  const handleRemoveContact = () => {
    setTrustedContact(null);
    setContactToastMessage('Trusted contact removed');
    setShowContactToast(true);
    setTimeout(() => setShowContactToast(false), 2500);
  };

  // Memories Sub-States
  const [referenceMemories, setReferenceMemories] = useState(true);
  const [referenceChatHistory, setReferenceChatHistory] = useState(true);
  const [nickname, setNickname] = useState('');
  const [occupation, setOccupation] = useState('');
  const [moreAboutYou, setMoreAboutYou] = useState('');
  const [isManageMemoriesOpen, setIsManageMemoriesOpen] = useState(false);
  const [savedMemories, setSavedMemories] = useState([
    'Prefers code examples in Next.js & Javascript',
    'Owns a web development agency',
    'Wants premium and rich UX design aesthetics'
  ]);
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [showMemoriesToast, setShowMemoriesToast] = useState(false);
  const [memoriesToastMessage, setMemoriesToastMessage] = useState('');

  const handleMemoriesSave = () => {
    setMemoriesToastMessage('Memories and preferences saved');
    setShowMemoriesToast(true);
    setTimeout(() => setShowMemoriesToast(false), 2500);
    setCurrentView('main');
  };

  const handleAddMemory = () => {
    if (!newMemoryInput.trim()) return;
    setSavedMemories([...savedMemories, newMemoryInput.trim()]);
    setNewMemoryInput('');
  };

  const handleDeleteMemory = (indexToDelete) => {
    setSavedMemories(savedMemories.filter((_, idx) => idx !== indexToDelete));
  };

  const handleClearAllMemories = () => {
    setSavedMemories([]);
  };

  const [showEmailToast, setShowEmailToast] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(userEmail);
    setShowEmailToast(true);
    setTimeout(() => setShowEmailToast(false), 2000);
  };

  // Security Sub-States
  const [passkeys, setPasskeys] = useState([]);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isAdvancedSecurityEnabled, setIsAdvancedSecurityEnabled] = useState(false);
  
  const [isPasskeySheetOpen, setIsPasskeySheetOpen] = useState(false);
  const [isMfaSheetOpen, setIsMfaSheetOpen] = useState(false);
  const [isAdvancedInfoSheetOpen, setIsAdvancedInfoSheetOpen] = useState(false);
  
  const [newPasskeyName, setNewPasskeyName] = useState('');
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  
  const [showSecurityToast, setShowSecurityToast] = useState(false);
  const [securityToastMessage, setSecurityToastMessage] = useState('');

  const triggerSecurityToast = (msg) => {
    setSecurityToastMessage(msg);
    setShowSecurityToast(true);
    setTimeout(() => setShowSecurityToast(false), 2500);
  };

  const handleAddPasskey = () => {
    if (!newPasskeyName.trim()) return;
    setIsRegisteringPasskey(true);
    setTimeout(() => {
      setPasskeys([...passkeys, { name: newPasskeyName.trim(), date: new Date().toLocaleDateString() }]);
      setNewPasskeyName('');
      setIsRegisteringPasskey(false);
      setIsPasskeySheetOpen(false);
      triggerSecurityToast('Passkey registered successfully');
    }, 1500);
  };

  const handleRemovePasskey = (indexToRemove) => {
    setPasskeys(passkeys.filter((_, idx) => idx !== indexToRemove));
    triggerSecurityToast('Passkey removed successfully');
  };

  const handleToggleMfa = () => {
    if (isMfaEnabled) {
      setIsMfaEnabled(false);
      triggerSecurityToast('Authenticator app disabled');
    } else {
      setMfaCodeInput('');
      setMfaError('');
      setIsMfaSheetOpen(true);
    }
  };

  const handleVerifyMfa = () => {
    if (mfaCodeInput.length !== 6 || isNaN(mfaCodeInput)) {
      setMfaError('Please enter a valid 6-digit code');
      return;
    }
    setIsMfaEnabled(true);
    setIsMfaSheetOpen(false);
    triggerSecurityToast('Two-factor authentication enabled');
  };

  const handleToggleAdvancedSecurity = () => {
    const nextState = !isAdvancedSecurityEnabled;
    setIsAdvancedSecurityEnabled(nextState);
    triggerSecurityToast(nextState ? 'Advanced security enabled' : 'Advanced security disabled');
  };

  // General Sub-States
  const [selectedAppLanguage, setSelectedAppLanguage] = useState({ name: 'System default', native: 'System Default', code: 'system' });
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState({ name: 'System default', native: 'System Default', code: 'system' });
  const [isLanguagePopupOpen, setIsLanguagePopupOpen] = useState(false);
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [showLanguageToast, setShowLanguageToast] = useState(false);
  const [languageToastMessage, setLanguageToastMessage] = useState('');

  const triggerLanguageToast = (msg) => {
    setLanguageToastMessage(msg);
    setShowLanguageToast(true);
    setTimeout(() => setShowLanguageToast(false), 2500);
  };

  // Parental Controls Sub-States
  const [isParentalLearnMoreOpen, setIsParentalLearnMoreOpen] = useState(false);
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberType, setMemberType] = useState('Parent'); // 'Parent' | 'Child'
  const [inviteMethod, setInviteMethod] = useState('Email'); // 'Email' | 'Phone'
  const [familyMembers, setFamilyMembers] = useState([
    { email: 'sarah.teen@example.com', role: 'Teen', status: 'Pending' }
  ]);
  const [showParentalToast, setShowParentalToast] = useState(false);
  const [parentalToastMessage, setParentalToastMessage] = useState('');

  const triggerParentalToast = (msg) => {
    setParentalToastMessage(msg);
    setShowParentalToast(true);
    setTimeout(() => setShowParentalToast(false), 2500);
  };

  // Data Controls Sub-States
  const [improveModel, setImproveModel] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [showDataToast, setShowDataToast] = useState(false);
  const [dataToastMessage, setDataToastMessage] = useState('');
  const [isClearHistoryOpen, setIsClearHistoryOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const triggerDataToast = (msg) => {
    setDataToastMessage(msg);
    setShowDataToast(true);
    setTimeout(() => setShowDataToast(false), 2500);
  };

  // Theme resolution helper state
  const isDark = resolvedTheme === 'dark';

  // Color Mapping Styles
  const themeStyles = {
    background: isDark ? '#000000' : '#f2f2f7',
    text: isDark ? '#ffffff' : '#000000',
    subtext: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.5)',
    sectionHeader: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.45)',
    cardBg: isDark ? '#1c1c1e' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.05)',
    divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    backBtnBg: isDark ? '#1c1c1e' : '#ffffff',
    backBtnHover: isDark ? '#2c2c2e' : '#e5e5ea',
    drawerBg: isDark ? '#222222' : '#ffffff',
    drawerBorder: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
    inputLabelBg: isDark ? '#222222' : '#ffffff',
    saveBtnBg: isDark ? '#ffffff' : '#000000',
    saveBtnText: isDark ? '#000000' : '#ffffff',
    cancelBtnText: isDark ? '#ffffff' : '#000000',
    logoutBg: isDark ? '#1c1c1e' : '#ffffff',
    modalBg: isDark ? '#1c1c1e' : '#ffffff',
    modalBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    hoverOverlay: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
    toggleTrack: isDark ? '#3a3a3c' : '#e5e5ea',
    toggleKnob: isDark ? '#e5e5ea' : '#ffffff'
  };

  // Drawer local states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftUsername, setDraftUsername] = useState('');
  const [draftAvatar, setDraftAvatar] = useState(null);

  // Initialize draft when drawer opens
  const openDrawer = () => {
    setDraftName(displayName);
    setDraftUsername(username);
    setDraftAvatar(avatar);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setDraftAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (setProfile && profile) {
      setProfile({
        ...profile,
        displayName: draftName.trim(),
        username: draftUsername.trim(),
        avatar: draftAvatar
      });
    }
    setIsDrawerOpen(false);
  };

  const handleConfirmLogout = () => {
    if (logout) {
      logout();
    }
    router.push('/');
  };

  // Save personalization flow
  const handleSavePersonalization = () => {
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
      setCurrentView('main');
    }, 1200);
  };

  // Dynamic Connect Action
  const connectNewApp = (id) => {
    setConnectingAppId(id);
    setTimeout(() => {
      setEnabledApps([...enabledApps, id]);
      setConnectingAppId(null);
    }, 1000);
  };

  // Dynamic Disconnect Action
  const confirmDisconnectApp = () => {
    if (appToDisconnect) {
      setEnabledApps(enabledApps.filter(app => app !== appToDisconnect));
      setAppToDisconnect(null);
    }
  };

  // Close dropdowns on outside click helper
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsAccentDropdownOpen(false);
      setIsThemeDropdownOpen(false);
      setIsVoiceDropdownOpen(false);
      setIsIntelligenceDropdownOpen(false);
      setIsLanguageDropdownOpen(false);
      setIsBaseStyleDropdownOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    document.title = 'Profile | Kyra';
  }, []);

  if (isMobile === null || !isMobile) {
    return <div />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: themeStyles.background, 
      color: themeStyles.text, 
      fontFamily: 'Inter, -apple-system, sans-serif',
      position: 'relative',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      transition: 'background 0.3s ease, color 0.3s ease',
      '--accent-theme': selectedAccent.hex 
    }}>

      {/* Floating Dynamic Save Confirmation Toast */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '32px',
              left: '50%',
              background: 'var(--accent-theme)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} strokeWidth={3} />
            Personalization Saved
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dynamic Bug Submission Toast */}
      <AnimatePresence>
        {showBugToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '32px',
              left: '50%',
              background: 'var(--accent-theme)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} strokeWidth={3} />
            Bug report submitted. Thank you!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dynamic Trusted Contact Confirmation Toast */}
      <AnimatePresence>
        {showContactToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '32px',
              left: '50%',
              background: 'var(--accent-theme)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} strokeWidth={3} />
            {contactToastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dynamic Memories Save Confirmation Toast */}
      <AnimatePresence>
        {showMemoriesToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '32px',
              left: '50%',
              background: 'var(--accent-theme)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} strokeWidth={3} />
            {memoriesToastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dynamic Email Copied Confirmation Toast */}
      <AnimatePresence>
        {showEmailToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '32px',
              left: '50%',
              background: 'var(--accent-theme)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} strokeWidth={3} />
            Email copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dynamic Security Confirmation Toast */}
      <AnimatePresence>
        {showSecurityToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '32px',
              left: '50%',
              background: 'var(--accent-theme)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} strokeWidth={3} />
            {securityToastMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {currentView === 'main' ? (
          <motion.div
            key="main-settings-view"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Floating Back Button (36x36) */}
            <button 
              onClick={() => router.push('/')}
              style={{
                position: 'absolute', top: '0px', left: '0px', zIndex: 100,
                width: '36px', height: '36px', borderRadius: '50%', 
                background: themeStyles.backBtnBg,
                border: 'none', 
                color: themeStyles.text,
                cursor: 'pointer',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s, background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = themeStyles.backBtnHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = themeStyles.backBtnBg;
              }}
            >
              <ArrowLeft size={18} />
            </button>

            {/* Main Profile Page Body */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              paddingTop: '0px', 
              paddingBottom: '48px',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative'
            }}>
              
              {/* Profile Info Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                
                {/* Avatar Container with Edit Pencil Overlay */}
                <div 
                  onClick={openDrawer}
                  style={{ 
                    position: 'relative', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {/* Avatar Circle (90x90) */}
                  <div style={{
                    width: 90, 
                    height: 90, 
                    borderRadius: '50%',
                    background: avatar ? 'transparent' : 'var(--accent-theme)', 
                    border: `3px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden', 
                    position: 'relative',
                    boxShadow: isDark ? '0 8px 20px rgba(0,0,0,0.3)' : '0 8px 20px rgba(0,0,0,0.1)'
                  }}>
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="User Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }}>
                        {initials || 'U'}
                      </span>
                    )}
                  </div>

                  {/* Pencil Badge Overlay (26x26) */}
                  <div style={{
                    position: 'absolute', 
                    bottom: '2px', 
                    right: '2px',
                    width: '26px', 
                    height: '26px', 
                    borderRadius: '50%',
                    background: isDark ? '#555555' : '#e5e5ea', 
                    border: `2.5px solid ${themeStyles.background}`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    color: themeStyles.text
                  }}>
                    <Pencil size={11} fill={isDark ? '#ffffff' : '#000000'} stroke="none" />
                  </div>
                </div>

                {/* User Display Name */}
                <h2 style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontSize: '20px', 
                  fontWeight: 700, 
                  color: themeStyles.text,
                  marginTop: '4px',
                  textAlign: 'center'
                }}>
                  {displayName}
                </h2>
              </div>

              {/* ── SECTION 1: MY KYRA ────────────────────────────────────────── */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: themeStyles.sectionHeader, 
                  paddingLeft: '16px',
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                  marginBottom: '4px'
                }}>
                  My Kyra
                </h3>

                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  transition: 'background 0.3s ease'
                }}>
                  
                  {/* Personalization Option Row */}
                  <div 
                    onClick={() => setCurrentView('personalization')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',  
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Smile size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Personalization
                    </span>
                  </div>

                  {/* Memories Option Row */}
                  <div 
                    onClick={() => setCurrentView('memories')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Layers size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Memories
                    </span>
                  </div>

                  {/* Apps Option Row */}
                  <div 
                    onClick={() => setCurrentView('apps')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LayoutGrid size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Apps
                    </span>
                  </div>

                </div>
              </div>

              {/* ── SECTION 2: ACCOUNT ────────────────────────────────────────── */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: themeStyles.sectionHeader, 
                  paddingLeft: '16px',
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                  marginBottom: '4px'
                }}>
                  Account
                </h3>

                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  transition: 'background 0.3s ease'
                }}>
                  
                  {/* Workspace Option Row */}
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Briefcase size={20} style={{ color: themeStyles.text }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                        Workspace
                      </span>
                      <span style={{ fontSize: '12.5px', color: themeStyles.subtext, marginTop: '1px' }}>
                        Personal
                      </span>
                    </div>
                  </div>

                  {/* Upgrade to Plus Option Row */}
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Sparkles size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Upgrade to Plus
                    </span>
                  </div>

                  {/* Trusted Contact Option Row */}
                  <div 
                    onClick={() => setCurrentView('trusted_contact')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <ShieldCheck size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Trusted contact
                    </span>
                  </div>

                  {/* Parental Controls Option Row */}
                  <div 
                    onClick={() => setCurrentView('parental_controls')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Users size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Parental controls
                    </span>
                  </div>



                  {/* Email Option Row */}
                  <div 
                    onClick={handleCopyEmail}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Mail size={20} style={{ color: themeStyles.text }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                        Email
                      </span>
                      <span style={{ fontSize: '12.5px', color: themeStyles.subtext, marginTop: '1px' }}>
                        {userEmail}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── SECTION 3: APPEARANCE ─────────────────────────────────────── */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', position: 'relative' }}>
                <h3 style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: themeStyles.sectionHeader, 
                  paddingLeft: '16px',
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                  marginBottom: '4px'
                }}>
                  Appearance
                </h3>

                <div style={{
                  background: themeStyles.cardBg, 
                  borderRadius: '20px',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  position: 'relative',
                  zIndex: 10,
                  transition: 'background 0.3s ease'
                }}>
                  
                  {/* Appearance Option Row */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsThemeDropdownOpen(!isThemeDropdownOpen);
                      setIsAccentDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Sun size={20} style={{ color: themeStyles.text }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                          Appearance
                        </span>
                        <span style={{ fontSize: '12.5px', color: themeStyles.subtext, marginTop: '1px' }}>
                          {selectedTheme}
                        </span>
                      </div>
                    </div>
                    <ChevronDown size={18} style={{ color: themeStyles.subtext, transform: isThemeDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {/* Accent Color Option Row */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAccentDropdownOpen(!isAccentDropdownOpen);
                      setIsThemeDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Paintbrush size={20} style={{ color: themeStyles.text }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                          Accent color
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedAccent.hex }} />
                          <span style={{ fontSize: '12.5px', color: themeStyles.subtext }}>
                            {selectedAccent.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isAccentDropdownOpen ? (
                      <ChevronUp size={18} style={{ color: themeStyles.subtext }} />
                    ) : (
                      <ChevronDown size={18} style={{ color: themeStyles.subtext }} />
                    )}
                  </div>

                  {/* Floating Dropdown for Accent Color */}
                  <AnimatePresence>
                    {isAccentDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '105%',
                          right: '12px',
                          width: '180px',
                          background: themeStyles.cardBg,
                          borderRadius: '20px',
                          padding: '8px',
                          border: `1px solid ${themeStyles.modalBorder}`,
                          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.12)',
                          zIndex: 9999
                        }}
                      >
                        {ACCENT_COLORS.map(color => (
                          <div
                            key={color.name}
                            onClick={() => {
                              setAccentColor(color.hex);
                              setIsAccentDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color.bullet }} />
                              <span style={{ fontSize: '14px', fontWeight: 500, color: themeStyles.text }}>
                                {color.name}
                              </span>
                            </div>
                            {selectedAccent.name === color.name && (
                              <Check size={14} style={{ color: themeStyles.text }} />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Dropdown for Theme Selection */}
                  <AnimatePresence>
                    {isThemeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '55%',
                          right: '12px',
                          width: '180px',
                          background: themeStyles.cardBg,
                          borderRadius: '20px',
                          padding: '8px',
                          border: `1px solid ${themeStyles.modalBorder}`,
                          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.12)',
                          zIndex: 9999
                        }}
                      >
                        {THEMES.map(themeItem => (
                          <div
                            key={themeItem}
                            onClick={() => {
                              const modeMap = {
                                'System (Default)': 'system',
                                'Light': 'light',
                                'Dark': 'dark'
                              };
                              setAppTheme(modeMap[themeItem]);
                              setIsThemeDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: '14px', fontWeight: 500, color: themeStyles.text }}>
                              {themeItem}
                            </span>
                            {selectedTheme === themeItem && (
                              <Check size={14} style={{ color: themeStyles.text }} />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              {/* ── SECTION 4: GENERAL & OTHERS ───────────────────────────────── */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <div style={{
                  background: themeStyles.cardBg, 
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  transition: 'background 0.3s ease'
                }}>
                  
                  {/* General */}
                  <div 
                    onClick={() => setCurrentView('general')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      General
                    </span>
                  </div>

                  {/* Voice Option Row to switch sub-view */}
                  <div 
                    onClick={() => setCurrentView('voice')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <AudioLines size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Voice
                    </span>
                  </div>

                  {/* Data controls */}
                  <div 
                    onClick={() => setCurrentView('data_controls')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Database size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Data controls
                    </span>
                  </div>

                  {/* Security */}
                  <div 
                    onClick={() => setCurrentView('security')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Shield size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Security
                    </span>
                  </div>

                  {/* Report bug */}
                  <div 
                    onClick={() => setIsBugSheetOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Bug size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Report bug
                    </span>
                  </div>

                  {/* About option to navigate to subview */}
                  <div 
                    onClick={() => setCurrentView('about')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Info size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      About
                    </span>
                  </div>

                </div>
              </div>

              {/* ── SECTION 5: LOG OUT ─────────────────────────────────────────── */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  background: themeStyles.logoutBg, 
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  transition: 'background 0.3s ease'
                }}>
                  
                  {/* Log out Row */}
                  <div 
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={20} style={{ color: '#ff453a' }} />
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#ff453a' }}>
                      Log out
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        ) : currentView === 'about' ? (
          /* ── SUB-VIEW: ABOUT VIEW ─────────────────────────────────────── */
          <motion.div
            key="about-settings-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title & Left Back Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('main')}
                style={{
                  position: 'absolute', left: '0px', top: '50%', transform: 'translateY(-50%)',
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: themeStyles.backBtnBg,
                  border: 'none', 
                  color: themeStyles.text,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnBg;
                }}
              >
                <ArrowLeft size={18} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: 0
              }}>
                About
              </h2>
            </div>

            {/* About Menu Options container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              background: themeStyles.cardBg,
              borderRadius: '20px',
              overflow: 'hidden',
              border: `1px solid ${themeStyles.cardBorder}`,
              transition: 'background 0.3s ease'
            }}>
              
              {/* Help Center */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  borderBottom: `1px solid ${themeStyles.divider}`
                }}
                onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <HelpCircle size={20} style={{ color: themeStyles.text }} />
                <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                  Help center
                </span>
              </div>

              {/* Terms of Use */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  borderBottom: `1px solid ${themeStyles.divider}`
                }}
                onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FileText size={20} style={{ color: themeStyles.text }} />
                <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                  Terms of use
                </span>
              </div>

              {/* Privacy Policy */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  borderBottom: `1px solid ${themeStyles.divider}`
                }}
                onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Glasses size={20} style={{ color: themeStyles.text }} />
                <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                  Privacy policy
                </span>
              </div>

              {/* Licenses */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  borderBottom: `1px solid ${themeStyles.divider}`
                }}
                onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FileText size={20} style={{ color: themeStyles.text }} />
                <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                  Licenses
                </span>
              </div>

              {/* Kyra for Web Version details */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 20px',
                  cursor: 'default',
                  transition: 'background 0.2s'
                }}
              >
                <Circle size={20} style={{ color: themeStyles.text }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                    Kyra for Web
                  </span>
                  <span style={{ fontSize: '12.5px', color: themeStyles.subtext, marginTop: '1px' }}>
                    1.2026.125 (19)
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        ) : currentView === 'voice' ? (
          /* ── SUB-VIEW: VOICE VIEW ─────────────────────────────────────── */
          <motion.div
            key="voice-settings-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title & Left Back Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => {
                  setCurrentView('main');
                  setIsVoiceDropdownOpen(false);
                  setIsIntelligenceDropdownOpen(false);
                  setIsLanguageDropdownOpen(false);
                }}
                style={{
                  position: 'absolute', left: '0px', top: '50%', transform: 'translateY(-50%)',
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: themeStyles.backBtnBg,
                  border: 'none', 
                  color: themeStyles.text,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnBg;
                }}
              >
                <ArrowLeft size={18} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: 0
              }}>
                Voice
              </h2>
            </div>

            {/* Main Content Loop */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>

              {/* CARD 1: Voice & Intelligence */}
              <div style={{
                background: themeStyles.cardBg,
                borderRadius: '20px',
                border: `1px solid ${themeStyles.cardBorder}`,
                position: 'relative',
                zIndex: 50,
                transition: 'background 0.3s ease'
              }}>
                
                {/* Voice Selection */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVoiceDropdownOpen(!isVoiceDropdownOpen);
                    setIsIntelligenceDropdownOpen(false);
                    setIsLanguageDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderBottom: `1px solid ${themeStyles.divider}`
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Voice
                    </span>
                    <span style={{ fontSize: '12.5px', color: themeStyles.subtext, marginTop: '2px' }}>
                      {selectedVoice}
                    </span>
                  </div>
                  <ChevronDown size={18} style={{ color: themeStyles.subtext, transform: isVoiceDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {/* Intelligence Selection */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsIntelligenceDropdownOpen(!isIntelligenceDropdownOpen);
                    setIsVoiceDropdownOpen(false);
                    setIsLanguageDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Intelligence
                    </span>
                    <span style={{ fontSize: '12.5px', color: themeStyles.subtext, marginTop: '2px' }}>
                      {selectedIntelligence}
                    </span>
                  </div>
                  <ChevronDown size={18} style={{ color: themeStyles.subtext, transform: isIntelligenceDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {/* Floating Voice list */}
                <AnimatePresence>
                  {isVoiceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '48%',
                        right: '12px',
                        width: '180px',
                        background: themeStyles.cardBg,
                        borderRadius: '20px',
                        padding: '8px',
                        border: `1px solid ${themeStyles.modalBorder}`,
                        boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.12)',
                        zIndex: 9999
                      }}
                    >
                      {VOICES.map(voice => (
                        <div
                          key={voice}
                          onClick={() => {
                            setSelectedVoice(voice);
                            setIsVoiceDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '14px', fontWeight: 500, color: themeStyles.text }}>
                            {voice}
                          </span>
                          {selectedVoice === voice && (
                            <Check size={14} style={{ color: themeStyles.text }} />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating Intelligence list */}
                <AnimatePresence>
                  {isIntelligenceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '95%',
                        right: '12px',
                        width: '180px',
                        background: themeStyles.cardBg,
                        borderRadius: '20px',
                        padding: '8px',
                        border: `1px solid ${themeStyles.modalBorder}`,
                        boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.12)',
                        zIndex: 9999
                      }}
                    >
                      {INTELLIGENCE_OPTIONS.map(option => (
                        <div
                          key={option}
                          onClick={() => {
                            setSelectedIntelligence(option);
                            setIsIntelligenceDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '14px', fontWeight: 500, color: themeStyles.text }}>
                            {option}
                          </span>
                          {selectedIntelligence === option && (
                            <Check size={14} style={{ color: themeStyles.text }} />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* CARD 2: Input Language */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 40, position: 'relative' }}>
                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  position: 'relative',
                  transition: 'background 0.3s ease'
                }}>
                  
                  {/* Language Selector */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                      setIsVoiceDropdownOpen(false);
                      setIsIntelligenceDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                        Input language
                      </span>
                      <span style={{ fontSize: '12.5px', color: themeStyles.subtext, marginTop: '2px' }}>
                        {selectedLanguage}
                      </span>
                    </div>
                    <ChevronDown size={18} style={{ color: themeStyles.subtext, transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {/* Floating Language Dropdown */}
                  <AnimatePresence>
                    {isLanguageDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '105%',
                          right: '12px',
                          width: '180px',
                          background: themeStyles.cardBg,
                          borderRadius: '20px',
                          padding: '8px',
                          border: `1px solid ${themeStyles.modalBorder}`,
                          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.12)',
                          zIndex: 9999
                        }}
                      >
                        {LANGUAGES.map(lang => (
                          <div
                            key={lang}
                            onClick={() => {
                              setSelectedLanguage(lang);
                              setIsLanguageDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: '14px', fontWeight: 500, color: themeStyles.text }}>
                              {lang}
                            </span>
                            {selectedLanguage === lang && (
                              <Check size={14} style={{ color: themeStyles.text }} />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Subtext below language */}
                <p style={{
                  fontSize: '12.5px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: 0
                }}>
                  For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.
                </p>
              </div>

              {/* CARD 3: Open in separate mode Toggle */}
              <div style={{
                background: themeStyles.cardBg,
                borderRadius: '20px',
                border: `1px solid ${themeStyles.cardBorder}`,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.3s ease'
              }}>
                <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                  Open in separate mode
                </span>
                
                {/* Switch Toggle */}
                <div 
                  onClick={() => setOpenInSeparateMode(!openInSeparateMode)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '999px',
                    background: openInSeparateMode ? 'var(--accent-theme)' : themeStyles.toggleTrack,
                    padding: '3px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background 0.2s ease-in-out'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: themeStyles.toggleKnob,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                    transform: openInSeparateMode ? 'translateX(20px)' : 'translateX(0px)',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>

              {/* CARD 4: Background Conversations Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.3s ease'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                    Background conversations
                  </span>
                  
                  {/* Switch Toggle */}
                  <div 
                    onClick={() => setBackgroundConversations(!backgroundConversations)}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '999px',
                      background: backgroundConversations ? 'var(--accent-theme)' : themeStyles.toggleTrack,
                      padding: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.2s ease-in-out'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: themeStyles.toggleKnob,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                      transform: backgroundConversations ? 'translateX(20px)' : 'translateX(0px)',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                </div>

                {/* Subtext with dynamic Accent Link */}
                <p style={{
                  fontSize: '12.5px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: 0
                }}>
                  Keep the conversation going in other apps or while your screen is off.{' '}
                  <span style={{
                    color: 'var(--accent-theme)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                     onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    Learn more
                  </span>
                </p>
              </div>

              {/* CARD 5: Use as Default Assistant Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.3s ease'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                    Use as default assistant
                  </span>
                  
                  {/* Switch Toggle */}
                  <div 
                    onClick={() => setUseAsDefaultAssistant(!useAsDefaultAssistant)}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '999px',
                      background: useAsDefaultAssistant ? 'var(--accent-theme)' : themeStyles.toggleTrack,
                      padding: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.2s ease-in-out'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: themeStyles.toggleKnob,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                      transform: useAsDefaultAssistant ? 'translateX(20px)' : 'translateX(0px)',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                </div>

                {/* Subtext */}
                <p style={{
                  fontSize: '12.5px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: 0
                }}>
                  Set Kyra as your default digital assistant in Android settings.
                </p>
              </div>

            </div>
          </motion.div>
        ) : currentView === 'personalization' ? (
          /* ── SUB-VIEW: PERSONALIZATION VIEW ──────────────────────────────── */
          <motion.div
            key="personalization-settings-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title, Left Back & Right Save Check */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => {
                  setCurrentView('main');
                  setIsBaseStyleDropdownOpen(false);
                  setIsCharacteristicsInputOpen(false);
                }}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: themeStyles.backBtnBg,
                  border: 'none', 
                  color: themeStyles.text,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnBg;
                }}
              >
                <ArrowLeft size={18} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: 0,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
                Personalization
              </h2>

              {/* Right Save Checkmark Button */}
              <button 
                onClick={handleSavePersonalization}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: 'var(--accent-theme)',
                  border: 'none', 
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s, opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Check size={18} strokeWidth={3} />
              </button>
            </div>

            {/* Scrollable Layout Container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              
              {/* CARD 1: Base style and tone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 100, position: 'relative' }}>
                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  position: 'relative',
                  transition: 'background 0.3s ease'
                }}>
                  
                  {/* Selector Dropdown trigger */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBaseStyleDropdownOpen(!isBaseStyleDropdownOpen);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                        Base style and tone
                      </span>
                      <span style={{ fontSize: '12.5px', color: themeStyles.subtext, marginTop: '2px' }}>
                        {selectedBaseStyle}
                      </span>
                    </div>
                    <ChevronDown size={18} style={{ color: themeStyles.subtext, transform: isBaseStyleDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {/* Floating Base Styles Dropdown */}
                  <AnimatePresence>
                    {isBaseStyleDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: '105%',
                          right: '12px',
                          width: '180px',
                          background: themeStyles.cardBg,
                          borderRadius: '20px',
                          padding: '8px',
                          border: `1px solid ${themeStyles.modalBorder}`,
                          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.12)',
                          zIndex: 9999
                        }}
                      >
                        {BASE_STYLES.map(style => (
                          <div
                            key={style}
                            onClick={() => {
                              setSelectedBaseStyle(style);
                              setIsBaseStyleDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: '14px', fontWeight: 500, color: themeStyles.text }}>
                              {style}
                            </span>
                            {selectedBaseStyle === style && (
                              <Check size={14} style={{ color: themeStyles.text }} />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Subtext */}
                <p style={{
                  fontSize: '12.5px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: 0
                }}>
                  This is the main voice and tone Kyra uses in your conversations. This doesn't impact Kyra's capabilities.
                </p>
              </div>

              {/* CARD 2: Add Characteristics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 90, position: 'relative' }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: themeStyles.sectionHeader, 
                  paddingLeft: '16px',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}>
                  Characteristics
                </span>

                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  padding: isCharacteristicsInputOpen ? '16px 20px' : '16px 20px',
                  cursor: isCharacteristicsInputOpen ? 'default' : 'pointer',
                  transition: 'background 0.3s ease, padding 0.2s'
                }}
                  onClick={() => {
                    if (!isCharacteristicsInputOpen) {
                      setIsCharacteristicsInputOpen(true);
                    }
                  }}
                  onMouseEnter={e => {
                    if (!isCharacteristicsInputOpen) e.currentTarget.style.background = themeStyles.hoverOverlay;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = themeStyles.cardBg;
                  }}
                >
                  {isCharacteristicsInputOpen ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: themeStyles.text }}>
                        Add characteristics
                      </span>
                      <input
                        type="text"
                        value={characteristics}
                        placeholder="e.g. Coding focused, concise, funny"
                        onChange={e => setCharacteristics(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          border: `1px solid ${themeStyles.divider}`,
                          borderRadius: '12px',
                          padding: '10px 14px',
                          color: themeStyles.text,
                          fontSize: '14px',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCharacteristicsInputOpen(false);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: themeStyles.text,
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCharacteristicsInputOpen(false);
                          }}
                          style={{
                            background: 'var(--accent-theme)',
                            border: 'none',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '6px 12px'
                          }}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '15px', fontWeight: 500, color: characteristics ? themeStyles.text : themeStyles.text }}>
                      {characteristics || 'Add characteristics'}
                    </span>
                  )}
                </div>

                {/* Subtext */}
                <p style={{
                  fontSize: '12.5px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: 0
                }}>
                  Choose some additional customizations on top of your base style and tone.
                </p>
              </div>

              {/* CARD 3: Fast Answers Toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.3s ease'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                    Fast answers
                  </span>
                  
                  {/* Switch Toggle */}
                  <div 
                    onClick={() => setFastAnswers(!fastAnswers)}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '999px',
                      background: fastAnswers ? 'var(--accent-theme)' : themeStyles.toggleTrack,
                      padding: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background 0.2s ease-in-out'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: themeStyles.toggleKnob,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                      transform: fastAnswers ? 'translateX(20px)' : 'translateX(0px)',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                </div>

                {/* Subtext */}
                <p style={{
                  fontSize: '12.5px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: 0
                }}>
                  Kyra can sometimes use its general knowledge to give fast, in-depth answers. These aren't personalized and don't use your memory.
                </p>
              </div>

              {/* CARD 4: Custom Instructions Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: themeStyles.sectionHeader, 
                  paddingLeft: '16px',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}>
                  Custom instructions
                </span>

                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  padding: '16px 20px',
                  transition: 'background 0.3s ease'
                }}>
                  <textarea
                    value={customInstructions}
                    onChange={e => setCustomInstructions(e.target.value)}
                    placeholder="Share anything else you'd like Kyra to consider in its response."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: themeStyles.text,
                      fontSize: '14.5px',
                      fontFamily: 'inherit',
                      resize: 'none',
                      lineHeight: '1.5',
                      padding: 0
                    }}
                  />
                </div>
              </div>

              {/* Advanced Expandable Row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '32px' }}>
                <div 
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    width: 'fit-content'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 600, color: themeStyles.subtext }}>
                    Advanced
                  </span>
                  <ChevronDown size={16} style={{ color: themeStyles.subtext, transform: isAdvancedOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                <AnimatePresence>
                  {isAdvancedOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        background: themeStyles.cardBg,
                        borderRadius: '20px',
                        border: `1px solid ${themeStyles.cardBorder}`,
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        marginTop: '4px'
                      }}>
                        {/* Temperature Slider */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: themeStyles.text }}>Temperature</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-theme)' }}>{temperature}</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1.5"
                            step="0.1"
                            value={temperature}
                            onChange={e => setTemperature(parseFloat(e.target.value))}
                            style={{
                              width: '100%',
                              accentColor: 'var(--accent-theme)',
                              cursor: 'pointer'
                            }}
                          />
                        </div>

                        {/* Memory Weight Slider */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: themeStyles.text }}>Memory weight</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-theme)' }}>{memoryWeight}</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={memoryWeight}
                            onChange={e => setMemoryWeight(parseFloat(e.target.value))}
                            style={{
                              width: '100%',
                              accentColor: 'var(--accent-theme)',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        ) : currentView === 'apps' ? (
          /* ── SUB-VIEW: APPS INTEGRATION VIEW ────────────────────────────── */
          <motion.div
            key="apps-settings-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title & Left Back Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('main')}
                style={{
                  position: 'absolute', left: '0px', top: '50%', transform: 'translateY(-50%)',
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: themeStyles.backBtnBg,
                  border: 'none', 
                  color: themeStyles.text,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnBg;
                }}
              >
                <ArrowLeft size={18} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: 0
              }}>
                Apps
              </h2>
            </div>

            {/* Apps Menu Layout Container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>

              {/* SECTION: Enabled apps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: themeStyles.sectionHeader, 
                  paddingLeft: '16px',
                  letterSpacing: '0.01em'
                }}>
                  Enabled apps
                </span>

                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  transition: 'background 0.3s ease'
                }}>
                  
                  {enabledApps.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: themeStyles.subtext, fontSize: '14px' }}>
                      No connected apps
                    </div>
                  ) : (
                    enabledApps.map((appId, index) => {
                      const isLast = index === enabledApps.length - 1;
                      
                      if (appId === 'github') {
                        return (
                          <div 
                            key="github"
                            onClick={() => setAppToDisconnect('github')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              padding: '16px 20px',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              borderBottom: isLast ? 'none' : `1px solid ${themeStyles.divider}`
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ color: themeStyles.text, display: 'flex', alignItems: 'center' }}>
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                              GitHub
                            </span>
                          </div>
                        );
                      }
                      
                      if (appId === 'spotify') {
                        return (
                          <div 
                            key="spotify"
                            onClick={() => setAppToDisconnect('spotify')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              padding: '16px 20px',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              borderBottom: isLast ? 'none' : `1px solid ${themeStyles.divider}`
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1DB954">
                                <circle cx="12" cy="12" r="12" />
                                <path d="M17.9 10.9C14.7 9 9.3 8.8 6.2 9.8c-.5.1-1-.1-1.2-.6s.1-1 .6-1.2C9 6.9 15 7.1 18.7 9.3c.4.2.6.8.3 1.2-.2.4-.7.6-1.1.4zm-.1 2.3c-.2.4-.7.5-1.1.3-2.6-1.6-6.6-2.1-9.7-1.2-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3.5-1.1 7.9-.5 10.9 1.3.4.2.5.8.3 1.2zM15.2 16c-.2.3-.6.4-.9.2-2.3-1.4-5.2-1.7-8.6-.9-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 3.7-.8 6.9-.5 9.5 1.1.3.2.4.6.2.8z" fill="#ffffff"/>
                              </svg>
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                              Spotify
                            </span>
                          </div>
                        );
                      }

                      // Dynamic Browse Apps mapping
                      const appMeta = BROWSE_REGISTRY.find(item => item.id === appId);
                      if (appMeta) {
                        return (
                          <div 
                            key={appMeta.id}
                            onClick={() => setAppToDisconnect(appMeta.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              padding: '16px 20px',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              borderBottom: isLast ? 'none' : `1px solid ${themeStyles.divider}`
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ color: appMeta.color, display: 'flex', alignItems: 'center' }}>
                              {appMeta.icon}
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                              {appMeta.name}
                            </span>
                          </div>
                        );
                      }
                      
                      return null;
                    })
                  )}

                </div>

                {/* Enabled apps details subtext */}
                <p style={{
                  fontSize: '12.5px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: '4px 0 0 0'
                }}>
                  Kyra can access information from connected apps, based on what you're authorized to view.{' '}
                  <span style={{
                    color: 'var(--accent-theme)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                     onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                    Learn more
                  </span>
                </p>
              </div>

              {/* SECTION: Browse apps trigger */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: themeStyles.sectionHeader, 
                  paddingLeft: '16px',
                  letterSpacing: '0.01em'
                }}>
                  Apps
                </span>

                <div style={{
                  background: themeStyles.cardBg,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: `1px solid ${themeStyles.cardBorder}`,
                  transition: 'background 0.3s ease'
                }}>
                  
                  {/* Browse apps action row */}
                  <div 
                    onClick={() => setIsBrowseSheetOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = themeStyles.hoverOverlay}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LayoutGrid size={20} style={{ color: themeStyles.text }} />
                    <span style={{ fontSize: '15px', fontWeight: 500, color: themeStyles.text }}>
                      Browse apps
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        ) : currentView === 'trusted_contact' ? (
          /* ── SUB-VIEW: TRUSTED CONTACT VIEW ────────────────────────────── */
          <motion.div
            key="trusted-contact-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title & Left Back Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('main')}
                style={{
                  position: 'absolute', left: '0px', top: '50%', transform: 'translateY(-50%)',
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: themeStyles.backBtnBg,
                  border: 'none', 
                  color: themeStyles.text,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnBg;
                }}
              >
                <ArrowLeft size={18} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: 0
              }}>
                Trusted contact
              </h2>
            </div>

            {/* Content Container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Informative Paragraphs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: themeStyles.text, textAlign: 'left', lineHeight: '1.6' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: 400,
                  margin: 0,
                  opacity: 0.9
                }}>
                  Having a trusted contact can make it easier to get support from someone who knows you well.
                </p>

                <p style={{
                  fontSize: '15px',
                  fontWeight: 400,
                  margin: 0,
                  opacity: 0.9
                }}>
                  In the future, if you discuss suicide with Kyra in a way that indicates a serious safety concern, we may automatically notify your trusted contact so they can check in with you. They must be 18+ to participate.{' '}
                  <span style={{
                    color: 'var(--accent-theme)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-theme)'}>
                    Learn more
                  </span>
                </p>
              </div>

              {/* Contact Card or Add Contact Trigger */}
              {!trustedContact ? (
                /* Add Contact button exactly matching the screenshot style */
                <div 
                  onClick={() => openContactDrawer()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '18px 24px',
                    background: isDark ? '#2c2c2e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, background-color 0.2s',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = isDark ? '#3a3a3c' : '#f2f2f7';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = isDark ? '#2c2c2e' : '#ffffff';
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: themeStyles.text
                  }}>
                    Add contact
                  </span>
                </div>
              ) : (
                /* Saved Contact Presentation Card */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  background: themeStyles.cardBg,
                  border: `1px solid ${themeStyles.cardBorder}`,
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                  gap: '20px'
                }}>
                  {/* Identity Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--accent-theme)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 700
                    }}>
                      {trustedContact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: themeStyles.text }}>
                        {trustedContact.name}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-theme)' }}>
                        {trustedContact.relationship}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: themeStyles.divider }} />

                  {/* Info Details Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    {trustedContact.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', color: themeStyles.subtext, width: '60px', fontWeight: 600 }}>Phone</span>
                        <span style={{ fontSize: '14.5px', color: themeStyles.text, fontWeight: 500 }}>{trustedContact.phone}</span>
                      </div>
                    )}
                    {trustedContact.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', color: themeStyles.subtext, width: '60px', fontWeight: 600 }}>Email</span>
                        <span style={{ fontSize: '14.5px', color: themeStyles.text, fontWeight: 500 }}>{trustedContact.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <button
                      onClick={() => openContactDrawer(true)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '999px',
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        color: themeStyles.text,
                        border: 'none',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                      onMouseLeave={e => e.currentTarget.style.opacity = 1}
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleRemoveContact}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '999px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: 'none',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                      onMouseLeave={e => e.currentTarget.style.opacity = 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : currentView === 'memories' ? (
          /* ── SUB-VIEW: MEMORIES VIEW ─────────────────────────────────────── */
          <motion.div
            key="memories-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title, Left Back, and Right Save (Check) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('main')}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: themeStyles.backBtnBg,
                  border: 'none', 
                  color: themeStyles.text,
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnBg;
                }}
              >
                <ArrowLeft size={18} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: 0,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
                Memories
              </h2>

              {/* Right Save (Check) Button */}
              <button 
                onClick={handleMemoriesSave}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: 'var(--accent-theme)',
                  border: 'none', 
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s, opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.opacity = 0.9;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = 1;
                }}
              >
                <Check size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content Container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              
              {/* Manage Memories Action Card Button */}
              <div 
                onClick={() => setIsManageMemoriesOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '18px 24px',
                  background: isDark ? '#2c2c2e' : '#ffffff',
                  border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background-color 0.2s',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                  textAlign: 'left'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = isDark ? '#3a3a3c' : '#f2f2f7';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = isDark ? '#2c2c2e' : '#ffffff';
                }}
              >
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: themeStyles.text
                }}>
                  Manage memories
                </span>
                {savedMemories.length > 0 && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: 'var(--accent-theme)',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {savedMemories.length} saved
                  </span>
                )}
              </div>

              {/* Reference Saved Memories Toggle block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div 
                  onClick={() => setReferenceMemories(!referenceMemories)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '18px 24px',
                    background: isDark ? '#2c2c2e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#3a3a3c' : '#f2f2f7'}
                  onMouseLeave={e => e.currentTarget.style.background = isDark ? '#2c2c2e' : '#ffffff'}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: themeStyles.text
                  }}>
                    Reference saved memories
                  </span>
                  
                  {/* Styled switch toggle */}
                  <div style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: '999px',
                    background: referenceMemories ? 'var(--accent-theme)' : (isDark ? '#48484a' : '#d1d1d6'),
                    position: 'relative',
                    transition: 'background-color 0.2s'
                  }}>
                    <motion.div 
                      layout
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        position: 'absolute',
                        top: '3px',
                        left: referenceMemories ? '23px' : '3px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>
                
                <p style={{
                  fontSize: '13px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: '4px 0 0 0',
                  textAlign: 'left'
                }}>
                  Lets Kyra save and use memories when responding.{' '}
                  <span style={{
                    color: 'var(--accent-theme)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}>
                    Learn more
                  </span>
                </p>
              </div>

              {/* Reference Chat History Toggle block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div 
                  onClick={() => setReferenceChatHistory(!referenceChatHistory)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '18px 24px',
                    background: isDark ? '#2c2c2e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#3a3a3c' : '#f2f2f7'}
                  onMouseLeave={e => e.currentTarget.style.background = isDark ? '#2c2c2e' : '#ffffff'}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: themeStyles.text
                  }}>
                    Reference Chat History
                  </span>
                  
                  {/* Styled switch toggle */}
                  <div style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: '999px',
                    background: referenceChatHistory ? 'var(--accent-theme)' : (isDark ? '#48484a' : '#d1d1d6'),
                    position: 'relative',
                    transition: 'background-color 0.2s'
                  }}>
                    <motion.div 
                      layout
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        position: 'absolute',
                        top: '3px',
                        left: referenceChatHistory ? '23px' : '3px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>
                
                <p style={{
                  fontSize: '13px',
                  color: themeStyles.subtext,
                  padding: '0 20px',
                  lineHeight: '1.45',
                  margin: '4px 0 0 0',
                  textAlign: 'left'
                }}>
                  Lets Kyra reference recent conversations when responding.{' '}
                  <span style={{
                    color: 'var(--accent-theme)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}>
                    Learn more
                  </span>
                </p>
              </div>

              {/* Input: Nickname */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: themeStyles.subtext, 
                  paddingLeft: '16px'
                }}>
                  Your nickname
                </span>
                
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Nickname"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '20px',
                    background: isDark ? '#2c2c2e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    color: themeStyles.text,
                    fontSize: '15px',
                    fontWeight: 500,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-theme)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)';
                  }}
                />
              </div>

              {/* Input: Occupation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: themeStyles.subtext, 
                  paddingLeft: '16px'
                }}>
                  Your occupation
                </span>
                
                <input
                  type="text"
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  placeholder="Engineer, student, etc."
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '20px',
                    background: isDark ? '#2c2c2e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    color: themeStyles.text,
                    fontSize: '15px',
                    fontWeight: 500,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-theme)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)';
                  }}
                />
              </div>

              {/* Textarea: More about you */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: themeStyles.subtext, 
                  paddingLeft: '16px'
                }}>
                  More about you
                </span>
                
                <textarea
                  value={moreAboutYou}
                  onChange={e => setMoreAboutYou(e.target.value)}
                  placeholder="Interests, values, or preferences to keep in mind"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '20px',
                    background: isDark ? '#2c2c2e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    color: themeStyles.text,
                    fontSize: '15px',
                    fontWeight: 500,
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'none',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                    lineHeight: '1.5'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent-theme)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)';
                  }}
                />
              </div>

            </div>
          </motion.div>
        ) : currentView === 'security' ? (
          /* ── SUB-VIEW: SECURITY VIEW ─────────────────────────────────────── */
          <motion.div
            key="security-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title & Left Back Arrow */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('main')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: themeStyles.backBtnBg,
                  color: themeStyles.text,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s, background-color 0.2s',
                  position: 'absolute',
                  left: 0
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = themeStyles.backBtnBg}
              >
                <ArrowLeft size={20} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: '0 auto',
                textAlign: 'center'
              }}>
                Security
              </h2>
              
              {/* Invisible spacer to maintain center alignment */}
              <div style={{ width: '36px' }} />
            </div>

            {/* Content Container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>

              {/* ── SECTION 1: LOG IN ────────────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: themeStyles.subtext, 
                  paddingLeft: '16px'
                }}>
                  Log in
                </span>

                <div 
                  onClick={() => setIsPasskeySheetOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '18px 24px',
                    background: isDark ? '#1c1c1e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, background-color 0.2s',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = isDark ? '#2c2c2e' : '#f2f2f7';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = isDark ? '#1c1c1e' : '#ffffff';
                  }}
                >
                  <span style={{ fontSize: '15.5px', fontWeight: 600, color: themeStyles.text }}>
                    Security keys & passkeys
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: themeStyles.subtext }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 500 }}>
                      {passkeys.length > 0 ? `${passkeys.length} active` : 'Add'}
                    </span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: themeStyles.subtext,
                  padding: '0 16px',
                  lineHeight: '1.45',
                  margin: '4px 0 0 0'
                }}>
                  Use passkeys or hardware security keys to sign in. These phishing-resistant methods provide stronger protection than passwords.
                </p>
              </div>

              {/* ── SECTION 2: MULTI FACTOR AUTHENTICATION ─────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: themeStyles.subtext, 
                  paddingLeft: '16px'
                }}>
                  Multi Factor Authentication
                </span>

                <div 
                  onClick={handleToggleMfa}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '18px 24px',
                    background: isDark ? '#1c1c1e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, background-color 0.2s',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = isDark ? '#2c2c2e' : '#f2f2f7';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = isDark ? '#1c1c1e' : '#ffffff';
                  }}
                >
                  <span style={{ fontSize: '15.5px', fontWeight: 600, color: themeStyles.text }}>
                    Authenticator app
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: themeStyles.subtext }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 500 }}>
                      {isMfaEnabled ? 'On' : 'Off'}
                    </span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: themeStyles.subtext,
                  padding: '0 16px',
                  lineHeight: '1.45',
                  margin: '4px 0 0 0'
                }}>
                  Require an extra security challenge when logging in. If you are unable to pass this challenge, you will have the option to recover your account.
                </p>
              </div>

              {/* ── SECTION 3: ADVANCED SECURITY ─────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: themeStyles.subtext, 
                  paddingLeft: '16px'
                }}>
                  Advanced security
                </span>

                <div style={{
                  background: isDark ? '#1c1c1e' : '#ffffff',
                  border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)'
                }}>
                  {/* Row 1: Advanced Account Security Toggle */}
                  <div 
                    onClick={handleToggleAdvancedSecurity}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '18px 24px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#2c2c2e' : '#f2f2f7'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '15.5px', fontWeight: 600, color: themeStyles.text }}>
                      Advanced account security
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: themeStyles.subtext }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 500 }}>
                        {isAdvancedSecurityEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  {/* Row 2: Learn More Info Button */}
                  <div 
                    onClick={() => setIsAdvancedInfoSheetOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '18px 24px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#2c2c2e' : '#f2f2f7'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-theme)' }}>
                      Learn more about advanced security
                    </span>
                  </div>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: themeStyles.subtext,
                  padding: '0 16px',
                  lineHeight: '1.45',
                  margin: '4px 0 0 0'
                }}>
                  Adds the highest level of account security by requiring strong sign-in methods and applying stricter protections to help prevent unauthorized access.
                </p>
              </div>

            </div>
          </motion.div>
        ) : currentView === 'data_controls' ? (
          /* ── SUB-VIEW: DATA CONTROLS VIEW ───────────────────────────────── */
          <motion.div
            key="data-controls-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title & Left Back Arrow */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('main')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: themeStyles.backBtnBg,
                  color: themeStyles.text,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s, background-color 0.2s',
                  position: 'absolute',
                  left: 0
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = themeStyles.backBtnBg}
              >
                <ArrowLeft size={20} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: '0 auto',
                textAlign: 'center'
              }}>
                Data controls
              </h2>
              
              {/* Invisible spacer to maintain center alignment */}
              <div style={{ width: '36px' }} />
            </div>

            {/* Content Container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>

              {/* SECTION 1: Improve the model for everyone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '18px 24px',
                  background: isDark ? '#1c1c1e' : '#ffffff',
                  border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '20px',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)'
                }}>
                  <span style={{ fontSize: '15.5px', fontWeight: 600, color: themeStyles.text, maxWidth: '75%' }}>
                    Improve the model for everyone
                  </span>
                  
                  {/* Switch */}
                  <div
                    onClick={() => {
                      const nextState = !improveModel;
                      setImproveModel(nextState);
                      triggerDataToast(nextState ? 'Model improvement enabled' : 'Model improvement disabled');
                    }}
                    style={{
                      width: '52px',
                      height: '32px',
                      borderRadius: '16px',
                      backgroundColor: improveModel ? '#ffffff' : '#3c3c3e',
                      padding: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: improveModel ? 'flex-end' : 'flex-start',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <motion.div
                      layout
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: improveModel ? '#000000' : '#a1a1aa',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: themeStyles.subtext,
                  padding: '0 16px',
                  lineHeight: '1.45',
                  margin: '4px 0 0 0'
                }}>
                  Allow your content to be used to improve our models for you and other users. We take steps to protect your privacy. <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent-theme)' }}>Learn more</span>
                </p>
              </div>

              {/* SECTION 2: Export Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <div 
                  onClick={() => triggerDataToast('Data export requested. You will receive an email shortly.')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '18px 24px',
                    background: isDark ? '#1c1c1e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, background-color 0.2s',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = isDark ? '#2c2c2e' : '#f2f2f7';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = isDark ? '#1c1c1e' : '#ffffff';
                  }}
                >
                  <span style={{ fontSize: '15.5px', fontWeight: 600, color: themeStyles.text }}>
                    Export Data
                  </span>
                  <ChevronRight size={16} style={{ color: themeStyles.subtext }} />
                </div>
              </div>

              {/* SECTION 3: Delete OpenAI account */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <div 
                  onClick={() => setIsDeleteAccountOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '18px 24px',
                    background: isDark ? '#1c1c1e' : '#ffffff',
                    border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, background-color 0.2s',
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = isDark ? '#1c1c1e' : '#ffffff';
                  }}
                >
                  <span style={{ fontSize: '15.5px', fontWeight: 600, color: '#ef4444' }}>
                    Delete Kyra account
                  </span>
                  <ChevronRight size={16} style={{ color: '#ef4444' }} />
                </div>
              </div>

              {/* SECTION 4: Voice */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: themeStyles.subtext, 
                  paddingLeft: '16px'
                }}>
                  Voice
                </span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '18px 24px',
                  background: isDark ? '#1c1c1e' : '#ffffff',
                  border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '20px',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)'
                }}>
                  <span style={{ fontSize: '15.5px', fontWeight: 600, color: themeStyles.text, maxWidth: '75%' }}>
                    Include your audio recordings
                  </span>
                  
                  {/* Switch */}
                  <div
                    onClick={() => {
                      const nextState = !includeAudio;
                      setIncludeAudio(nextState);
                      triggerDataToast(nextState ? 'Audio recording inclusion enabled' : 'Audio recording inclusion disabled');
                    }}
                    style={{
                      width: '52px',
                      height: '32px',
                      borderRadius: '16px',
                      backgroundColor: includeAudio ? '#ffffff' : '#3c3c3e',
                      padding: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: includeAudio ? 'flex-end' : 'flex-start',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <motion.div
                      layout
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: includeAudio ? '#000000' : '#a1a1aa',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: themeStyles.subtext,
                  padding: '0 16px',
                  lineHeight: '1.45',
                  margin: '4px 0 0 0'
                }}>
                  Include your audio recordings from Voice to train our models. Transcripts and other files are covered by Improve the model for everyone. <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent-theme)' }}>Learn more</span>
                </p>
              </div>

              {/* SECTION 5: Chat history */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: themeStyles.subtext, 
                  paddingLeft: '16px'
                }}>
                  Chat history
                </span>

                <div style={{
                  background: isDark ? '#1c1c1e' : '#ffffff',
                  border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)'
                }}>
                  {/* Row 1: View archived chats */}
                  <div 
                    onClick={() => triggerDataToast('Opening archived chats...')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '18px 24px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#2c2c2e' : '#f2f2f7'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '15.5px', fontWeight: 600, color: themeStyles.text }}>
                      View archived chats
                    </span>
                    <ChevronRight size={16} style={{ color: themeStyles.subtext }} />
                  </div>

                  {/* Row 2: Archive chat history */}
                  <div 
                    onClick={() => triggerDataToast('All chat history has been archived.')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '18px 24px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: `1px solid ${themeStyles.divider}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#2c2c2e' : '#f2f2f7'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '15.5px', fontWeight: 600, color: themeStyles.text }}>
                      Archive chat history
                    </span>
                    <ChevronRight size={16} style={{ color: themeStyles.subtext }} />
                  </div>

                  {/* Row 3: Clear chat history */}
                  <div 
                    onClick={() => setIsClearHistoryOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '18px 24px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '15.5px', fontWeight: 600, color: '#ef4444' }}>
                      Clear chat history
                    </span>
                    <ChevronRight size={16} style={{ color: '#ef4444' }} />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : currentView === 'general' ? (
          /* ── SUB-VIEW: GENERAL VIEW ──────────────────────────────────────── */
          <motion.div
            key="general-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title & Left Back Arrow */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('main')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: themeStyles.backBtnBg,
                  color: themeStyles.text,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s, background-color 0.2s',
                  position: 'absolute',
                  left: 0
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = themeStyles.backBtnBg}
              >
                <ArrowLeft size={20} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: '0 auto',
                textAlign: 'center'
              }}>
                General
              </h2>
              
              {/* Invisible spacer to maintain center alignment */}
              <div style={{ width: '36px' }} />
            </div>

            {/* Content Container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Language Card Container */}
              <div style={{
                background: isDark ? '#1c1c1e' : '#ffffff',
                border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'transform 0.2s, background-color 0.2s'
              }}
              onClick={() => {
                setTempSelectedLanguage(selectedAppLanguage);
                setIsLanguagePopupOpen(true);
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.background = isDark ? '#2c2c2e' : '#f2f2f7';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = isDark ? '#1c1c1e' : '#ffffff';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px 24px'
                }}>
                  {/* Globe Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeStyles.text
                  }}>
                    <Globe size={22} />
                  </div>

                  {/* Text Container */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px'
                  }}>
                    <span style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      color: themeStyles.text 
                    }}>
                      Language
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      color: themeStyles.subtext 
                    }}>
                      {selectedAppLanguage.name === 'System default' 
                        ? selectedAppLanguage.name 
                        : `${selectedAppLanguage.native} (${selectedAppLanguage.name})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : currentView === 'parental_controls' ? (
          /* ── SUB-VIEW: PARENTAL CONTROLS VIEW ─────────────────────────────────────── */
          <motion.div
            key="parental-controls-view"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', position: 'relative' }}
          >
            {/* Header with Centered Title, Left Back & Right Help */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              position: 'relative',
              height: '40px',
              marginBottom: '32px'
            }}>
              {/* Back Button */}
              <button 
                onClick={() => setCurrentView('main')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: themeStyles.backBtnBg,
                  color: themeStyles.text,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s, background-color 0.2s',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = themeStyles.backBtnBg;
                }}
              >
                <ArrowLeft size={18} />
              </button>

              {/* Centered Title */}
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: themeStyles.text,
                margin: 0,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
                Parental controls
              </h2>

              {/* Right Help Button */}
              <button 
                onClick={() => setIsParentalLearnMoreOpen(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'transparent',
                  color: themeStyles.text,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: 0.8,
                  zIndex: 10
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
              >
                <HelpCircle size={22} />
              </button>
            </div>

            {/* Content Container */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              
              {/* Informative Paragraph Text */}
              <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: 400,
                  margin: 0,
                  opacity: 0.95,
                  color: themeStyles.text
                }}>
                  Parents and teens can link accounts, giving parents tools to adjust certain features, set limits, and add safeguards that work for their family.{' '}
                  <span 
                    onClick={() => setIsParentalLearnMoreOpen(true)}
                    style={{
                      color: 'var(--accent-theme)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Learn more
                  </span>
                </p>
              </div>

              {/* Linked Family Members List */}
              {familyMembers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: themeStyles.sectionHeader, 
                    paddingLeft: '16px',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    textAlign: 'left'
                  }}>
                    Linked Members
                  </span>
                  <div style={{
                    background: themeStyles.cardBg,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: `1px solid ${themeStyles.cardBorder}`,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {familyMembers.map((member, index) => {
                      const isLast = index === familyMembers.length - 1;
                      return (
                        <div 
                          key={member.email}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            borderBottom: isLast ? 'none' : `1px solid ${themeStyles.divider}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', minWidth: 0, flex: 1 }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: 'var(--accent-theme)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                              flexShrink: 0
                            }}>
                              {member.role === 'Teen' ? 'T' : 'P'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                              <span style={{ 
                                fontSize: '15px', 
                                fontWeight: 600, 
                                color: themeStyles.text,
                                wordBreak: 'break-all',
                                overflowWrap: 'anywhere'
                              }}>
                                {member.email}
                              </span>
                              <span style={{ fontSize: '12px', color: themeStyles.subtext, marginTop: '2px' }}>
                                {member.role} • {member.status}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setFamilyMembers(familyMembers.filter(m => m.email !== member.email));
                              triggerParentalToast(`Removed ${member.email} from family group`);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ff453a',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 69, 58, 0.1)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Family Member Card Button */}
              <div 
                onClick={() => {
                  setMemberEmail('');
                  setMemberPhone('');
                  setMemberType('Parent');
                  setInviteMethod('Email');
                  setIsAddFamilyOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '18px 24px',
                  background: isDark ? '#2c2c2e' : '#ffffff',
                  border: isDark ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                  textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? '#3a3a3c' : '#f2f2f7'}
                onMouseLeave={e => e.currentTarget.style.background = isDark ? '#2c2c2e' : '#ffffff'}
              >
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: themeStyles.text
                }}>
                  Add family member
                </span>
                
                <Plus size={20} style={{ color: 'var(--accent-theme)' }} />
              </div>

            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Dynamic Slide-Up Sheet for "Browse Apps" Store */}
      <AnimatePresence>
        {isBrowseSheetOpen && (
          <>
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBrowseSheetOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 999
              }}
            />

            {/* Sheet content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: themeStyles.drawerBg,
                borderRadius: '24px 24px 0 0',
                padding: '12px 24px 32px',
                zIndex: 1000,
                maxWidth: '480px',
                margin: '0 auto',
                boxShadow: isDark ? '0 -8px 30px rgba(0,0,0,0.5)' : '0 -8px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                color: themeStyles.text
              }}
            >
              {/* Drag Handle */}
              <div style={{
                width: '36px',
                height: '4.5px',
                borderRadius: '999px',
                background: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                alignSelf: 'center',
                marginBottom: '24px',
                cursor: 'pointer'
              }} onClick={() => setIsBrowseSheetOpen(false)} />

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
                Browse Integrations
              </h3>

              {/* Grid of app elements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                {BROWSE_REGISTRY.map(app => {
                  const isConnected = enabledApps.includes(app.id);
                  const isConnecting = connectingAppId === app.id;
                  
                  return (
                    <div 
                      key={app.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                        borderRadius: '16px',
                        border: `1px solid ${themeStyles.divider}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ color: app.color, display: 'flex', alignItems: 'center' }}>
                          {app.icon}
                        </div>
                        <span style={{ fontSize: '14.5px', fontWeight: 600 }}>{app.name}</span>
                      </div>

                      {/* Connect Button controls */}
                      <button
                        disabled={isConnected || isConnecting}
                        onClick={() => connectNewApp(app.id)}
                        style={{
                          background: isConnected ? 'rgba(255,255,255,0.08)' : 'var(--accent-theme)',
                          color: isConnected ? themeStyles.subtext : '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '6px 14px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: isConnected ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isConnecting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <RefreshCw size={12} />
                          </motion.div>
                        ) : isConnected ? (
                          'Connected'
                        ) : (
                          'Connect'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Disconnect App Confirmation Dialog */}
      <AnimatePresence>
        {appToDisconnect && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAppToDisconnect(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99999
              }}
            />

            {/* Confirm modal box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
                width: '320px',
                background: themeStyles.modalBg,
                borderRadius: '24px',
                padding: '24px',
                border: `1px solid ${themeStyles.modalBorder}`,
                boxShadow: isDark ? '0 20px 48px rgba(0,0,0,0.6)' : '0 20px 48px rgba(0,0,0,0.15)',
                zIndex: 100000,
                textAlign: 'center',
                color: themeStyles.text
              }}
            >
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: themeStyles.text, marginBottom: '10px', textTransform: 'capitalize' }}>
                Disconnect {appToDisconnect}
              </h4>
              <p style={{ fontSize: '14px', color: themeStyles.subtext, lineHeight: '1.5', marginBottom: '24px' }}>
                Are you sure you want to disconnect this app integration from your Kyra workspace?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={confirmDisconnectApp}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '999px',
                    background: '#ff453a',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Disconnect
                </button>
                <button
                  onClick={() => setAppToDisconnect(null)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '999px',
                    background: 'transparent',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: themeStyles.text,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Logout Confirmation Alert Dialog */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutConfirmOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99999
              }}
            />

            {/* Confirmation Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
                width: '320px',
                background: themeStyles.modalBg,
                borderRadius: '24px',
                padding: '24px',
                border: `1px solid ${themeStyles.modalBorder}`,
                boxShadow: isDark ? '0 20px 48px rgba(0,0,0,0.6)' : '0 20px 48px rgba(0,0,0,0.15)',
                zIndex: 100000,
                textAlign: 'center',
                color: themeStyles.text
              }}
            >
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: themeStyles.text, marginBottom: '10px' }}>
                Log out
              </h4>
              <p style={{ fontSize: '14px', color: themeStyles.subtext, lineHeight: '1.5', marginBottom: '24px' }}>
                Are you sure you want to log out of your account?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleConfirmLogout}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '999px',
                    background: '#ff453a',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Log out
                </button>
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '999px',
                    background: 'transparent',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    color: themeStyles.text,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-Up Bottom Drawer Sheet */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay backdrop with high-fidelity blur filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 999
              }}
            />

            {/* Bottom Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: themeStyles.drawerBg,
                borderRadius: '24px 24px 0 0',
                padding: '12px 24px 32px',
                zIndex: 1000,
                maxWidth: '480px',
                margin: '0 auto',
                boxShadow: isDark ? '0 -8px 30px rgba(0,0,0,0.5)' : '0 -8px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: themeStyles.text
              }}
            >
              {/* Top Drag Handle Bar */}
              <div style={{
                width: '36px',
                height: '4.5px',
                borderRadius: '999px',
                background: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                marginBottom: '24px',
                cursor: 'pointer'
              }} onClick={closeDrawer} />

              {/* Drawer Content: Avatar Edit layout */}
              <div 
                onClick={handleAvatarClick}
                style={{ 
                  position: 'relative', 
                  cursor: 'pointer',
                  marginBottom: '28px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Drawer Avatar Circle (100x100) */}
                <div style={{
                  width: 100, 
                  height: 100, 
                  borderRadius: '50%',
                  background: draftAvatar ? 'transparent' : 'var(--accent-theme)',
                  border: `3px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden', 
                  position: 'relative'
                }}>
                  {draftAvatar ? (
                    <img
                      src={draftAvatar}
                      alt="Avatar Draft"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: 32, fontWeight: 700, color: '#ffffff' }}>
                      {initials || 'U'}
                    </span>
                  )}
                </div>

                {/* Camera Overlay Icon Badge */}
                <div style={{
                  position: 'absolute', 
                  bottom: '2px', 
                  right: '2px',
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%',
                  background: isDark ? '#000000' : '#ffffff', 
                  border: `2px solid ${themeStyles.drawerBg}`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  color: themeStyles.text
                }}>
                  <Camera size={15} strokeWidth={2.5} color={isDark ? '#ffffff' : '#000000'} />
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                >
                </input>
              </div>

              {/* Name Input Box */}
              <div style={{ width: '100%', marginBottom: '18px', position: 'relative' }}>
                <div style={{
                  border: `1px solid ${themeStyles.drawerBorder}`,
                  borderRadius: '16px',
                  padding: '12px 18px',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '16px',
                    background: themeStyles.inputLabelBg,
                    padding: '0 4px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: themeStyles.subtext
                  }}>
                    Name
                  </span>
                  <input
                    type="text"
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: themeStyles.text,
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      padding: 0
                    }}
                  />
                </div>
              </div>

              {/* Username Input Box */}
              <div style={{ width: '100%', marginBottom: '24px', position: 'relative' }}>
                <div style={{
                  border: `1px solid ${themeStyles.drawerBorder}`,
                  borderRadius: '16px',
                  padding: '12px 18px',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '16px',
                    background: themeStyles.inputLabelBg,
                    padding: '0 4px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: themeStyles.subtext
                  }}>
                    Username
                  </span>
                  <input
                    type="text"
                    value={draftUsername}
                    onChange={e => setDraftUsername(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: themeStyles.text,
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      padding: 0
                    }}
                  />
                </div>
              </div>

              {/* Helper text */}
              <p style={{
                fontSize: '13px',
                color: themeStyles.subtext,
                textAlign: 'center',
                marginBottom: '28px',
                fontWeight: 400
              }}>
                Your profile helps people recognize you.
              </p>

              {/* Action Buttons */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Save Profile Pill Button */}
                <button
                  onClick={handleSave}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '999px',
                    background: themeStyles.saveBtnBg,
                    border: 'none',
                    color: themeStyles.saveBtnText,
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Save profile
                </button>

                {/* Cancel Button */}
                <button
                  onClick={closeDrawer}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: themeStyles.cancelBtnText,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Cancel
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Report Bug Bottom Drawer Sheet */}
      <AnimatePresence>
        {isBugSheetOpen && (
          <>
            {/* Overlay backdrop with high-fidelity blur filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBugSheetOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 999
              }}
            />

            {/* Bottom Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: themeStyles.drawerBg,
                borderRadius: '24px 24px 0 0',
                padding: '12px 24px 32px',
                zIndex: 1000,
                maxWidth: '480px',
                margin: '0 auto',
                boxShadow: isDark ? '0 -8px 30px rgba(0,0,0,0.5)' : '0 -8px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                color: themeStyles.text
              }}
            >
              {/* Top Drag Handle Bar */}
              <div style={{
                width: '36px',
                height: '4.5px',
                borderRadius: '999px',
                background: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                alignSelf: 'center',
                marginBottom: '24px',
                cursor: 'pointer'
              }} onClick={() => setIsBugSheetOpen(false)} />

              {/* Title Header */}
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                marginBottom: '20px',
                color: themeStyles.text,
                textAlign: 'left'
              }}>
                Report bug
              </h3>

              {/* Description Section Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <span style={{
                  fontSize: '14.5px',
                  fontWeight: 600,
                  color: themeStyles.text,
                  textAlign: 'left'
                }}>
                  What happened?
                </span>

                {/* Textarea Container */}
                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${themeStyles.drawerBorder}`,
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <textarea
                    value={bugDescription}
                    onChange={e => {
                      if (e.target.value.length <= 2000) {
                        setBugDescription(e.target.value);
                      }
                    }}
                    placeholder="Tell us about the issue you encountered"
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: themeStyles.text,
                      fontSize: '14.5px',
                      fontFamily: 'inherit',
                      resize: 'none',
                      lineHeight: '1.5',
                      padding: 0
                    }}
                  />
                  
                  {/* Character Counter */}
                  <span style={{
                    alignSelf: 'flex-end',
                    fontSize: '12px',
                    color: themeStyles.subtext,
                    fontWeight: 500
                  }}>
                    {bugDescription.length} / 2000
                  </span>
                </div>
              </div>

              {/* Info Note */}
              <p style={{
                fontSize: '12.5px',
                color: themeStyles.subtext,
                lineHeight: '1.5',
                textAlign: 'left',
                margin: '0 0 24px 0'
              }}>
                Your feedback can be used to improve Kyra.{' '}
                <span style={{
                  color: 'var(--accent-theme)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none'
                }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                   onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  Learn more
                </span>.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  disabled={!bugDescription.trim() || isSubmittingBug}
                  onClick={handleBugSubmit}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '999px',
                    background: !bugDescription.trim() ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') : 'var(--accent-theme)',
                    color: !bugDescription.trim() ? themeStyles.subtext : '#ffffff',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: !bugDescription.trim() || isSubmittingBug ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isSubmittingBug ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <RefreshCw size={16} />
                      </motion.div>
                      Submitting...
                    </>
                  ) : (
                    'Submit report'
                  )}
                </button>

                <button
                  disabled={isSubmittingBug}
                  onClick={() => {
                    setIsBugSheetOpen(false);
                    setBugDescription('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: themeStyles.cancelBtnText,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Cancel
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic Full-Screen Modal for "Add/Edit Trusted Contact" */}
      <AnimatePresence>
        {isContactSheetOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#000000',
              zIndex: 100000,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 20px',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', marginTop: '8px' }}>
              <button
                onClick={() => setIsContactSheetOpen(false)}
                style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <ArrowLeft size={22} />
              </button>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Invite a trusted contact</h3>
              <button
                disabled={!draftContactName.trim() || (!draftContactEmail.trim() && !draftContactPhone.trim()) || !isContactConfirmed}
                onClick={handleContactSubmit}
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  background: (!draftContactName.trim() || (!draftContactEmail.trim() && !draftContactPhone.trim()) || !isContactConfirmed) ? '#1c1c1e' : 'rgba(255,255,255,0.15)',
                  color: (!draftContactName.trim() || (!draftContactEmail.trim() && !draftContactPhone.trim()) || !isContactConfirmed) ? 'rgba(255,255,255,0.4)' : '#fff',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: (!draftContactName.trim() || (!draftContactEmail.trim() && !draftContactPhone.trim()) || !isContactConfirmed) ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Save
              </button>
            </div>

            {/* Paragraph */}
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.5', marginBottom: '32px' }}>
              Choose a friend, family member, or another trusted adult who is readily available to offer support. We'll invite them to be your trusted contact, and they can choose whether to participate. <span style={{ textDecoration: 'underline', color: '#fff', cursor: 'pointer' }}>Learn more</span>
            </p>

            {/* Add from your contacts button */}
            <button style={{ width: '100%', padding: '20px 24px', borderRadius: '24px', background: '#333333', color: '#fff', fontSize: '16px', fontWeight: 500, textAlign: 'left', border: 'none', marginBottom: '32px', cursor: 'pointer' }}>
              Add from your contacts
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '15px', color: '#fff', paddingLeft: '4px' }}>Name</label>
                <input
                  type="text"
                  value={draftContactName}
                  onChange={e => setDraftContactName(e.target.value)}
                  placeholder="Full name"
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '24px', background: '#333333', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' }}
                />
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '15px', color: '#fff', paddingLeft: '4px' }}>Email</label>
                <input
                  type="email"
                  value={draftContactEmail}
                  onChange={e => setDraftContactEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '24px', background: '#333333', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' }}
                />
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '15px', color: '#fff', paddingLeft: '4px' }}>Phone number</label>
                <div style={{ display: 'flex', background: '#333333', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
                  {/* Country Code Picker */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        appearance: 'none',
                        zIndex: 10
                      }}
                    >
                      <option value="+1">United States (+1)</option>
                      <option value="+44">United Kingdom (+44)</option>
                      <option value="+91">India (+91)</option>
                      <option value="+92">Pakistan (+92)</option>
                      <option value="+61">Australia (+61)</option>
                      <option value="+81">Japan (+81)</option>
                      <option value="+49">Germany (+49)</option>
                      <option value="+33">France (+33)</option>
                      <option value="+86">China (+86)</option>
                      <option value="+55">Brazil (+55)</option>
                      <option value="+971">UAE (+971)</option>
                      <option value="+966">Saudi Arabia (+966)</option>
                      <option value="+1">Canada (+1)</option>
                    </select>
                    <div style={{ padding: '20px 8px 20px 24px', color: '#fff', fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {countryCode}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginTop: '2px' }}><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  
                  {/* Phone Input */}
                  <input
                    type="tel"
                    value={draftContactPhone}
                    onChange={e => setDraftContactPhone(e.target.value)}
                    placeholder="(201) 555-0123"
                    style={{ flex: 1, padding: '20px', paddingLeft: '8px', background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div 
              onClick={() => setIsContactConfirmed(!isContactConfirmed)}
              style={{ background: '#333333', borderRadius: '24px', padding: '24px', marginTop: '32px', marginBottom: '40px', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
            >
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                border: isContactConfirmed ? 'none' : '2px solid rgba(255,255,255,0.3)', 
                background: isContactConfirmed ? '#fff' : 'transparent', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {isContactConfirmed && <Check size={14} color="#000" strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.5', margin: 0 }}>
                  I confirm this person and I are 18 or older. If this person agrees to be my trusted contact, I understand and agree that OpenAI may notify them in the future if I discuss suicide with Kyra in a way that indicates a serious safety concern.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Memories Bottom Drawer Sheet */}
      <AnimatePresence>
        {isManageMemoriesOpen && (
          <>
            {/* Overlay backdrop with high-fidelity blur filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageMemoriesOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 999
              }}
            />

            {/* Bottom Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: themeStyles.drawerBg,
                borderRadius: '24px 24px 0 0',
                padding: '12px 24px 32px',
                zIndex: 1000,
                maxWidth: '480px',
                margin: '0 auto',
                boxShadow: isDark ? '0 -8px 30px rgba(0,0,0,0.5)' : '0 -8px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                color: themeStyles.text
              }}
            >
              {/* Top Drag Handle Bar */}
              <div style={{
                width: '36px',
                height: '4.5px',
                borderRadius: '999px',
                background: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                alignSelf: 'center',
                marginBottom: '20px',
                cursor: 'pointer'
              }} onClick={() => setIsManageMemoriesOpen(false)} />

              {/* Title & Clear All Header Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: 0
                }}>
                  Kyra's memories
                </h3>

                {savedMemories.length > 0 && (
                  <button
                    onClick={handleClearAllMemories}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Add Custom Fact/Memory Row */}
              <div style={{
                display: 'flex',
                gap: '10px',
                width: '100%',
                marginBottom: '20px'
              }}>
                <input
                  type="text"
                  value={newMemoryInput}
                  onChange={e => setNewMemoryInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddMemory();
                  }}
                  placeholder="Add custom preference or fact..."
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '14px',
                    background: isDark ? '#1c1c1e' : '#f2f2f7',
                    border: 'none',
                    color: themeStyles.text,
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                
                <button
                  onClick={handleAddMemory}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: 'var(--accent-theme)',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Memory List Container with custom scrollbar */}
              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '4px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                {savedMemories.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    gap: '12px',
                    color: themeStyles.subtext
                  }}>
                    <Layers size={36} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                    <p style={{
                      fontSize: '13.5px',
                      textAlign: 'center',
                      lineHeight: '1.45',
                      margin: 0
                    }}>
                      No memories saved yet. Kyra will remember details from your conversations here.
                    </p>
                  </div>
                ) : (
                  savedMemories.map((memory, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: isDark ? '#1c1c1e' : '#f2f2f7',
                        borderRadius: '12px',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-theme)'
                        }} />
                        <span style={{
                          fontSize: '13.5px',
                          fontWeight: 500,
                          color: themeStyles.text,
                          lineHeight: '1.45'
                        }}>
                          {memory}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteMemory(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: themeStyles.subtext,
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.2s, background-color 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = themeStyles.subtext;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Close Bottom Button */}
              <button
                onClick={() => setIsManageMemoriesOpen(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: themeStyles.text,
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SECURITY DRAWER SHEET 1: PASSKEYS MANAGEMENT ────────────────────── */}
      <AnimatePresence>
        {isPasskeySheetOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasskeySheetOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99999
              }}
            />

            {/* Bottom Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: themeStyles.drawerBg,
                borderTop: `1px solid ${themeStyles.drawerBorder}`,
                borderRadius: '24px 24px 0 0',
                padding: '12px 24px 32px',
                zIndex: 100000,
                maxWidth: '480px',
                margin: '0 auto',
                boxShadow: isDark ? '0 -8px 30px rgba(0,0,0,0.5)' : '0 -8px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                color: themeStyles.text
              }}
            >
              {/* Top Drag Handle */}
              <div style={{
                width: '36px',
                height: '4.5px',
                borderRadius: '999px',
                background: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                alignSelf: 'center',
                marginBottom: '20px',
                cursor: 'pointer'
              }} onClick={() => setIsPasskeySheetOpen(false)} />

              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '19px',
                fontWeight: 700,
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                Security keys & passkeys
              </h3>

              {/* Passkeys List */}
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                {passkeys.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 16px',
                    gap: '10px',
                    color: themeStyles.subtext,
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '16px',
                    border: `1px dashed ${themeStyles.drawerBorder}`
                  }}>
                    <Lock size={28} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                    <p style={{
                      fontSize: '13px',
                      textAlign: 'center',
                      lineHeight: '1.45',
                      margin: 0
                    }}>
                      No passkeys added yet. Add a security key or passkey below to enable secure, passwordless log in.
                    </p>
                  </div>
                ) : (
                  passkeys.map((pk, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: isDark ? '#1c1c1e' : '#f2f2f7',
                        borderRadius: '14px',
                        border: `1px solid ${themeStyles.drawerBorder}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={20} style={{ color: 'var(--accent-theme)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{pk.name}</span>
                          <span style={{ fontSize: '11.5px', color: themeStyles.subtext }}>Created {pk.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemovePasskey(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: themeStyles.subtext,
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = themeStyles.subtext;
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Passkey Action Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: themeStyles.subtext, paddingLeft: '8px' }}>
                  New passkey name
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newPasskeyName}
                    onChange={e => setNewPasskeyName(e.target.value)}
                    placeholder="e.g. MacBook Passkey, YubiKey"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: isDark ? '#1c1c1e' : '#f2f2f7',
                      border: `1px solid ${themeStyles.drawerBorder}`,
                      color: themeStyles.text,
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    disabled={!newPasskeyName.trim() || isRegisteringPasskey}
                    onClick={handleAddPasskey}
                    style={{
                      background: !newPasskeyName.trim() ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') : 'var(--accent-theme)',
                      color: !newPasskeyName.trim() ? themeStyles.subtext : '#ffffff',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '0 18px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: !newPasskeyName.trim() || isRegisteringPasskey ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isRegisteringPasskey ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <RefreshCw size={14} />
                      </motion.div>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsPasskeySheetOpen(false);
                  setNewPasskeyName('');
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: themeStyles.text,
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SECURITY DRAWER SHEET 2: MFA/AUTHENTICATOR SETUP ───────────────── */}
      <AnimatePresence>
        {isMfaSheetOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMfaSheetOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99999
              }}
            />

            {/* Bottom Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: themeStyles.drawerBg,
                borderTop: `1px solid ${themeStyles.drawerBorder}`,
                borderRadius: '24px 24px 0 0',
                padding: '12px 24px 32px',
                zIndex: 100000,
                maxWidth: '480px',
                margin: '0 auto',
                boxShadow: isDark ? '0 -8px 30px rgba(0,0,0,0.5)' : '0 -8px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                color: themeStyles.text
              }}
            >
              {/* Drag Handle */}
              <div style={{
                width: '36px',
                height: '4.5px',
                borderRadius: '999px',
                background: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                alignSelf: 'center',
                marginBottom: '20px',
                cursor: 'pointer'
              }} onClick={() => setIsMfaSheetOpen(false)} />

              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '19px',
                fontWeight: 700,
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                Set up Authenticator app
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                textAlign: 'left',
                maxHeight: '340px',
                overflowY: 'auto',
                paddingRight: '4px',
                marginBottom: '24px'
              }}>
                {/* Step 1 text */}
                <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.5', opacity: 0.9 }}>
                  1. Scan the QR code or copy the secret key in your authenticator app (like Google Authenticator, Duo, or 1Password).
                </p>

                {/* QR Code Graphic container */}
                <div style={{
                  width: '130px',
                  height: '130px',
                  background: '#ffffff',
                  alignSelf: 'center',
                  padding: '8px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {/* High-tech mock QR code matrix patterns */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    border: '3px solid #000000',
                    position: 'relative',
                    background: 'repeating-conic-gradient(from 0deg, #000 0deg 90deg, #fff 90deg 180deg) 0 0/14px 14px'
                  }}>
                    {/* QR Code Anchor Blocks */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '32px', height: '32px', border: '6px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '12px', height: '12px', background: '#000' }} />
                    </div>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '32px', height: '32px', border: '6px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '12px', height: '12px', background: '#000' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '32px', border: '6px solid #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '12px', height: '12px', background: '#000' }} />
                    </div>
                  </div>
                </div>

                {/* Secret Key copy field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: themeStyles.subtext }}>Secret Key</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderRadius: '10px',
                    border: `1px solid ${themeStyles.drawerBorder}`
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>
                      JBSWY3DPEHPK3PXP
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
                        triggerSecurityToast('Secret key copied');
                      }}
                      style={{
                        background: 'var(--accent-theme)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Verification code input field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: themeStyles.subtext }}>
                    2. Enter the 6-digit code from your app
                  </span>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCodeInput}
                    onChange={e => {
                      setMfaCodeInput(e.target.value.replace(/\D/g, ''));
                      setMfaError('');
                    }}
                    placeholder="000 000"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: isDark ? '#1c1c1e' : '#f2f2f7',
                      border: `1px solid ${mfaError ? '#ef4444' : themeStyles.drawerBorder}`,
                      color: themeStyles.text,
                      fontSize: '16px',
                      fontWeight: 700,
                      letterSpacing: '4px',
                      textAlign: 'center',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  {mfaError && (
                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                      {mfaError}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  disabled={mfaCodeInput.length !== 6}
                  onClick={handleVerifyMfa}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '999px',
                    background: mfaCodeInput.length !== 6 ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') : 'var(--accent-theme)',
                    color: mfaCodeInput.length !== 6 ? themeStyles.subtext : '#ffffff',
                    border: 'none',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: mfaCodeInput.length !== 6 ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                >
                  Verify and enable
                </button>

                <button
                  onClick={() => {
                    setIsMfaSheetOpen(false);
                    setMfaCodeInput('');
                    setMfaError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: themeStyles.cancelBtnText,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SECURITY DRAWER SHEET 3: ADVANCED SECURITY INFO ────────────────── */}
      <AnimatePresence>
        {isAdvancedInfoSheetOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdvancedInfoSheetOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99999
              }}
            />

            {/* Bottom Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: themeStyles.drawerBg,
                borderTop: `1px solid ${themeStyles.drawerBorder}`,
                borderRadius: '24px 24px 0 0',
                padding: '12px 24px 32px',
                zIndex: 100000,
                maxWidth: '480px',
                margin: '0 auto',
                boxShadow: isDark ? '0 -8px 30px rgba(0,0,0,0.5)' : '0 -8px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                color: themeStyles.text
              }}
            >
              {/* Drag Handle */}
              <div style={{
                width: '36px',
                height: '4.5px',
                borderRadius: '999px',
                background: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)',
                alignSelf: 'center',
                marginBottom: '20px',
                cursor: 'pointer'
              }} onClick={() => setIsAdvancedInfoSheetOpen(false)} />

              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '19px',
                fontWeight: 700,
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                Advanced account security
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'left',
                marginBottom: '28px',
                lineHeight: '1.5'
              }}>
                {/* Info Card 1 */}
                <div style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px 16px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  borderRadius: '16px',
                  border: `1px solid ${themeStyles.drawerBorder}`
                }}>
                  <div style={{ fontSize: '20px' }}>🛡️</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Strong sign-in methods required</span>
                    <span style={{ fontSize: '12px', color: themeStyles.subtext }}>
                      Only phishing-resistant passkeys or security keys can be used to access your account.
                    </span>
                  </div>
                </div>

                {/* Info Card 2 */}
                <div style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px 16px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  borderRadius: '16px',
                  border: `1px solid ${themeStyles.drawerBorder}`
                }}>
                  <div style={{ fontSize: '20px' }}>🚫</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Strict device validation</span>
                    <span style={{ fontSize: '12px', color: themeStyles.subtext }}>
                      Kyra will block new login attempts from unknown locations or unrecognized web browsers.
                    </span>
                  </div>
                </div>

                {/* Info Card 3 */}
                <div style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px 16px',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  borderRadius: '16px',
                  border: `1px solid ${themeStyles.drawerBorder}`
                }}>
                  <div style={{ fontSize: '20px' }}>⚠️</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Strict recovery protocols</span>
                    <span style={{ fontSize: '12px', color: themeStyles.subtext }}>
                      Account recovery requires offline validation or verified trusted contact check-in.
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Action Button */}
              <button
                onClick={() => setIsAdvancedInfoSheetOpen(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  background: 'var(--accent-theme)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                Got it
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── GENERAL: APP LANGUAGE OVERLAY DIALOG ───────────────────────────── */}
      <AnimatePresence>
        {isLanguagePopupOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsLanguagePopupOpen(false);
                setLanguageSearchQuery('');
              }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 99999
              }}
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '400px',
                background: isDark ? '#1c1c1e' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: '24px',
                padding: '24px',
                zIndex: 100000,
                boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.12)',
                color: themeStyles.text,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Title */}
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
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
                  color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <Search size={18} />
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
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                    color: themeStyles.text,
                    fontSize: '14.5px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s, background-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-theme)';
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.01)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
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
                      color: themeStyles.subtext,
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
              }}>
                {(() => {
                  const filtered = APP_LANGUAGES.filter(lang => 
                    lang.name.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||
                    lang.native.toLowerCase().includes(languageSearchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div style={{
                        padding: '24px 0',
                        textAlign: 'center',
                        color: themeStyles.subtext,
                        fontSize: '14.5px'
                      }}>
                        No languages found
                      </div>
                    );
                  }

                  return filtered.map((lang) => {
                    const isSelected = tempSelectedLanguage.code === lang.code;
                    return (
                      <div
                        key={lang.code}
                        onClick={() => setTempSelectedLanguage(lang)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: isSelected ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)') : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {/* Radio Circle */}
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--accent-theme)' : (isDark ? '#48484a' : '#c7c7cc')}`,
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
                              background: 'var(--accent-theme)'
                            }} />
                          )}
                        </div>

                        {/* Language Label */}
                        <span style={{
                          fontSize: '14.5px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? themeStyles.text : themeStyles.subtext,
                          transition: 'color 0.2s',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {lang.name === 'System default' 
                            ? lang.native 
                            : `${lang.native} (${lang.name})`}
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
                    color: themeStyles.subtext,
                    fontSize: '14.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Cancel
                </button>

                {/* OK Button */}
                <button
                  onClick={() => {
                    setSelectedAppLanguage(tempSelectedLanguage);
                    setIsLanguagePopupOpen(false);
                    setLanguageSearchQuery('');
                    triggerLanguageToast(`Language changed to ${tempSelectedLanguage.native}`);
                  }}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '999px',
                    background: 'var(--accent-theme)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── GENERAL: LANGUAGE TOAST NOTIFICATION ────────────────────────── */}
      <AnimatePresence>
        {showLanguageToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              background: '#323232',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} style={{ color: '#4ade80' }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {languageToastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PARENTAL CONTROLS: LEARN MORE MODAL ─────────────────────────── */}
      <AnimatePresence>
        {isParentalLearnMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsParentalLearnMoreOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 99999
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '440px',
                background: isDark ? '#1c1c1e' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: '24px',
                padding: '24px',
                zIndex: 100000,
                boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.12)',
                color: themeStyles.text,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '85vh',
                overflowY: 'auto'
              }}
            >
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                margin: 0,
                textAlign: 'left'
              }}>
                Parental controls linking
              </h3>

              <div style={{
                fontSize: '14.5px',
                lineHeight: '1.6',
                color: themeStyles.subtext,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <p>
                  Linking accounts lets parents and teens customize their Kyra experience together. When linked, parents get tools to:
                </p>
                <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Adjust content filters and set maturity ratings.</li>
                  <li>Track weekly usage statistics and conversation topics overview.</li>
                  <li>Apply default safeguards to guide assistant interactions safely.</li>
                </ul>
                <p>
                  To respect teen privacy, conversation contents remain confidential, and teens are notified of all supervisor settings.
                </p>
              </div>

              <button
                onClick={() => setIsParentalLearnMoreOpen(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'var(--accent-theme)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginTop: '8px'
                }}
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── PARENTAL CONTROLS: ADD FAMILY MEMBER MODAL ────────────────── */}
      <AnimatePresence>
        {isAddFamilyOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#000000',
              zIndex: 100000,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 20px',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', marginTop: '8px' }}>
              <button
                onClick={() => setIsAddFamilyOpen(false)}
                style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1c1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <ArrowLeft size={22} />
              </button>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Invite family member</h3>
              <button
                disabled={inviteMethod === 'Email' ? !memberEmail.trim() : !memberPhone.trim()}
                onClick={() => {
                  const contactInfo = inviteMethod === 'Email' ? memberEmail.trim() : memberPhone.trim();
                  if (!contactInfo) return;
                  if (inviteMethod === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo)) {
                    triggerParentalToast('Please enter a valid email address');
                    return;
                  }
                  if (familyMembers.some(m => m.email.toLowerCase() === contactInfo.toLowerCase())) {
                    triggerParentalToast('This person is already in your family group');
                    return;
                  }
                  setFamilyMembers([...familyMembers, { email: contactInfo, role: memberType === 'Parent' ? 'Parent' : 'Teen', status: 'Pending' }]);
                  setIsAddFamilyOpen(false);
                  triggerParentalToast(`Invitation sent to ${contactInfo}`);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  background: 'transparent',
                  color: (inviteMethod === 'Email' ? !memberEmail.trim() : !memberPhone.trim()) ? 'rgba(255,255,255,0.3)' : '#fff',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: (inviteMethod === 'Email' ? !memberEmail.trim() : !memberPhone.trim()) ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Send
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Invite By */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>Invite by</span>
                <div style={{ background: '#333333', borderRadius: '24px', overflow: 'hidden' }}>
                  {/* Email option */}
                  <div 
                    onClick={() => setInviteMethod('Email')}
                    style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span style={{ fontSize: '16px', color: '#fff' }}>Email</span>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: inviteMethod === 'Email' ? '6px solid #fff' : '2px solid rgba(255,255,255,0.5)', background: 'transparent' }} />
                  </div>
                  {/* Phone option */}
                  <div 
                    onClick={() => setInviteMethod('Phone')}
                    style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '16px', color: '#fff' }}>Phone</span>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: inviteMethod === 'Phone' ? '6px solid #fff' : '2px solid rgba(255,255,255,0.5)', background: 'transparent' }} />
                  </div>
                </div>
              </div>

              {/* Email / Phone Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>{inviteMethod}</span>
                <input
                  type={inviteMethod === 'Email' ? 'email' : 'tel'}
                  placeholder={inviteMethod === 'Email' ? 'name@email.com' : 'Phone number'}
                  value={inviteMethod === 'Email' ? memberEmail : memberPhone}
                  onChange={(e) => inviteMethod === 'Email' ? setMemberEmail(e.target.value) : setMemberPhone(e.target.value)}
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '24px', background: '#333333', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' }}
                />
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', padding: '0 4px' }}>
                  If your family member is new to ChatGPT, they will be asked to create an account.
                </span>
              </div>

              {/* This person is */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>This person is</span>
                <div style={{ background: '#333333', borderRadius: '24px', overflow: 'hidden' }}>
                  {/* Parent option */}
                  <div 
                    onClick={() => setMemberType('Parent')}
                    style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span style={{ fontSize: '16px', color: '#fff' }}>My parent or guardian</span>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: memberType === 'Parent' ? '6px solid #fff' : '2px solid rgba(255,255,255,0.5)', background: 'transparent' }} />
                  </div>
                  {/* Child option */}
                  <div 
                    onClick={() => setMemberType('Child')}
                    style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '16px', color: '#fff' }}>My child</span>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: memberType === 'Child' ? '6px solid #fff' : '2px solid rgba(255,255,255,0.5)', background: 'transparent' }} />
                  </div>
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', padding: '0 4px' }}>
                  Your parent or guardian will be able to adjust certain features, set time limits, and add safeguards to help guide your experience. We won't share details of your conversations with ChatGPT, except in certain rare safety circumstances. You can unlink accounts anytime. <span style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}>Learn more</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PARENTAL CONTROLS: TOAST NOTIFICATION ───────────────────────── */}
      <AnimatePresence>
        {showParentalToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              background: '#323232',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} style={{ color: '#4ade80' }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {parentalToastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA CONTROLS: TOAST NOTIFICATION ───────────────────────── */}
      <AnimatePresence>
        {showDataToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              background: '#323232',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} style={{ color: '#4ade80' }} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {dataToastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DATA CONTROLS: CLEAR HISTORY CONFIRMATION DIALOG ───────────────── */}
      <AnimatePresence>
        {isClearHistoryOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClearHistoryOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 99999
              }}
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: '90%',
                maxWidth: '400px',
                background: isDark ? '#1c1c1e' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: '24px',
                padding: '24px',
                zIndex: 100000,
                boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.12)',
                color: themeStyles.text,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'left'
              }}
            >
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '19px',
                fontWeight: 700,
                margin: 0
              }}>
                Clear chat history
              </h3>

              <p style={{
                fontSize: '14.5px',
                color: themeStyles.subtext,
                lineHeight: '1.5',
                margin: 0
              }}>
                Are you sure you want to clear all your chat history? This will permanently erase your chat sessions on all devices. This action cannot be undone.
              </p>

              {/* Action Buttons Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                gap: '12px',
                marginTop: '8px'
              }}>
                {/* Cancel Button */}
                <button
                  onClick={() => setIsClearHistoryOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '999px',
                    background: 'transparent',
                    border: 'none',
                    color: themeStyles.subtext,
                    fontSize: '14.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Cancel
                </button>

                {/* Confirm Button */}
                <button
                  onClick={() => {
                    setIsClearHistoryOpen(false);
                    triggerDataToast('Chat history cleared successfully');
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '999px',
                    background: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DATA CONTROLS: DELETE ACCOUNT CONFIRMATION DIALOG ───────────────── */}
      <AnimatePresence>
        {isDeleteAccountOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteAccountOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 99999
              }}
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-40%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: '90%',
                maxWidth: '400px',
                background: isDark ? '#1c1c1e' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                borderRadius: '24px',
                padding: '24px',
                zIndex: 100000,
                boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(0,0,0,0.12)',
                color: themeStyles.text,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'left'
              }}
            >
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '19px',
                fontWeight: 700,
                margin: 0
              }}>
                Delete Kyra Account
              </h3>

              <p style={{
                fontSize: '14.5px',
                color: themeStyles.subtext,
                lineHeight: '1.5',
                margin: 0
              }}>
                Are you sure you want to delete your account? This will permanently delete your profile, subscription plans, custom instructions, and all conversations. This action is irreversible.
              </p>

              {/* Action Buttons Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                gap: '12px',
                marginTop: '8px'
              }}>
                {/* Cancel Button */}
                <button
                  onClick={() => setIsDeleteAccountOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '999px',
                    background: 'transparent',
                    border: 'none',
                    color: themeStyles.subtext,
                    fontSize: '14.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Cancel
                </button>

                {/* Confirm Button */}
                <button
                  onClick={() => {
                    setIsDeleteAccountOpen(false);
                    triggerDataToast('Account deletion request queued');
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '999px',
                    background: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
