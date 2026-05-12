'use client';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function ChatPage() {
  const { id } = useParams();
  const { switchChat, chats } = useAppContext();

  useEffect(() => {
    if (id) {
      switchChat(id);
    }
  }, [id, switchChat]);

  // Handle Metadata Title update
  useEffect(() => {
    const activeChat = chats.find(c => c.id === id);
    if (activeChat) {
      document.title = `${activeChat.title} | Aether`;
    } else {
      document.title = 'New Chat | Aether';
    }
  }, [id, chats]);

  return (
    <div className="flex h-screen w-full bg-primary overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
