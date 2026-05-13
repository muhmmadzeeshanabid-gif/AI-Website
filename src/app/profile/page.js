'use client';
import { useEffect } from 'react';

export default function ProfilePage() {
  useEffect(() => {
    document.title = 'Profile | Kyra';
  }, []);
  
  return null;
}
