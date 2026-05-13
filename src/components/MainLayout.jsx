'use client';
import React, { Suspense } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import SettingsModal from './SettingsModal';
import ProfileModal from './ProfileModal';
import SearchModal from './SearchModal';
import LogoutModal from './LogoutModal';

function ModalContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'general';

  const isSettingsOpen = pathname === '/settings';
  const isProfileOpen = pathname === '/profile';
  const isSearchOpen = pathname === '/search';
  const isLogoutOpen = pathname === '/logout';

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
      {isLogoutOpen && <LogoutModal isOpen={true} onClose={() => window.history.back()} />}
    </>
  );
}

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-primary overflow-hidden">
      <Sidebar />
      <ChatWindow />
      
      <Suspense fallback={null}>
        <ModalContainer />
      </Suspense>
      
      {children}
    </div>
  );
}

