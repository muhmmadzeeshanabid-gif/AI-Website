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

  const isSettingsOpen = pathname?.includes('/settings');
  const isProfileOpen = pathname?.includes('/profile');
  const isSearchOpen = pathname?.includes('/search');
  const isLogoutOpen = pathname?.includes('/logout');
  const isUpgradeOpen = pathname?.includes('/upgrade') || isUpgradeModalOpen;

  return (
    <>
      {isSettingsOpen && <SettingsModal isOpen={true} onClose={() => window.history.back()} initialTab={activeTab} />}
      {isProfileOpen && <ProfileModal isOpen={true} onClose={() => window.history.back()} />}
      {isSearchOpen && <SearchModal isOpen={true} onClose={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          router.push('/');
        }
      }} />}
      {isLogoutOpen && <LogoutModal isOpen={true} onClose={() => router.push('/')} />}
    </>
  );
}

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isUpgradeModalOpen, setIsUpgradeModalOpen } = useAppContext();
  const isHelpPage = pathname?.includes('/help');
  const isUpgradeOpen = pathname?.includes('upgrade') || isUpgradeModalOpen;

  // Navigation is handled via routing, no need for manual state sync here

  if (isHelpPage || pathname?.includes('/upgrade') || pathname?.startsWith('/g/')) {
    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 999999, 
        background: 'var(--bg-primary)', 
        overflowY: 'auto',
        width: '100vw',
        height: '100vh'
      }}>
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-primary overflow-hidden">
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

