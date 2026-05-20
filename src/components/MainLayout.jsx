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
import UpgradeModal from './UpgradeModal';

function ModalContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isUpgradeModalOpen, setIsUpgradeModalOpen } = useAppContext();
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
  const isLogoutOpen = pathname?.includes('/logout');
  const isProfileOpen = pathname?.includes('/profile') && !isMobile;
  const isUpgradeOpen = pathname?.includes('/upgrade') || isUpgradeModalOpen;

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
      {isLogoutOpen && <LogoutModal isOpen={true} onClose={() => router.push('/')} />}
      {isProfileOpen && <ProfileModal onClose={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          router.push('/');
        }
      }} />}
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

  if (isFullPage) {
    return (
      <div 
        id="profile-scroll-container"
        style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 999999, 
          background: 'var(--bg-primary)', 
          overflowY: 'auto',
          width: '100vw',
          height: '100vh'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="flex w-full bg-primary overflow-hidden" style={{ height: '100dvh' }}>
      <Sidebar />
      <ChatWindow />
      
      <Suspense fallback={null}>
        <ModalContainer />
      </Suspense>

      {isUpgradeModalOpen && !pathname?.includes('/upgrade') && (
        <UpgradeModal 
          isOpen={true} 
          onClose={() => setIsUpgradeModalOpen(false)} 
        />
      )}
      
      {children}
    </div>
  );
}

