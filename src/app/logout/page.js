'use client';
import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    document.title = 'Logout | Kyra';
  }, []);
  
  return null;
}
