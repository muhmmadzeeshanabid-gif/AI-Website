'use client';
import React, { Suspense, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import SettingsModal from './SettingsModal';
import ProfileModal from './ProfileModal';
import SearchModal from './SearchModal';
import LogoutModal from './LogoutModal';
import AuthModal from './AuthModal';

function ModalContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isUpgradeModalOpen, setIsUpgradeModalOpen, authOpen, setAuthOpen, isLogoutModalOpen, setIsLogoutModalOpen } = useAppContext();
  const activeTab = searchParams.get('tab') || 'general';

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isSettingsOpen = pathname?.includes('/settings');
  const isSearchOpen = pathname?.includes('/search');
  const isLogoutOpen = pathname?.includes('/logout') || isLogoutModalOpen;
  const isProfileOpen = pathname?.includes('/profile') && !isMobile;

  return (
    <>
      {isSettingsOpen && <SettingsModal isOpen={true} onClose={() => window.history.back()} initialTab={activeTab} />}
      {isSearchOpen && <SearchModal isOpen={true} onClose={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          router.push('/');
        }
      }} />}
      {isLogoutOpen && <LogoutModal isOpen={true} onClose={() => { 
        setIsLogoutModalOpen(false); 
        if (pathname?.includes('/logout')) {
          if (window.history.length > 1) window.history.back();
          else router.push('/');
        }
      }} />}
      {isProfileOpen && <ProfileModal onClose={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          router.push('/');
        }
      }} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isUpgradeModalOpen, setIsUpgradeModalOpen } = useAppContext();
  const isHelpPage = pathname?.includes('/help');
  const isUpgradeOpen = pathname?.includes('upgrade') || isUpgradeModalOpen;

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show full page layout on mobile for /profile, but render standard chat container + overlay on desktop
  const isFullPage = isHelpPage || pathname?.includes('/upgrade') || (pathname?.includes('/profile') && isMobile) || pathname?.startsWith('/g/');

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <div 
        className="flex w-full bg-primary overflow-hidden" 
        style={{ 
          position: 'absolute',
          inset: 0,
          visibility: isFullPage ? 'hidden' : 'visible',
          pointerEvents: isFullPage ? 'none' : 'auto'
        }}
      >
        <Sidebar />
        <ChatWindow />
        
        <Suspense fallback={null}>
          <ModalContainer />
        </Suspense>
      </div>

      <div 
        id="profile-scroll-container"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 999999, 
          background: 'var(--bg-primary)', 
          overflowY: 'auto',
          visibility: isFullPage ? 'visible' : 'hidden',
          pointerEvents: isFullPage ? 'auto' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
}

