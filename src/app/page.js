'use client';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-primary overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
