'use client';
import { useEffect } from 'react';

export default function SettingsPage() {
  useEffect(() => {
    document.title = 'Settings | Kyra';
  }, []);
  
  return <div />;
}
