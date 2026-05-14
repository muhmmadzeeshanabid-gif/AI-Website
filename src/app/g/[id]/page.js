'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutoJoinGroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const { joinGroup, showLoggedIn, setAuthOpen } = useAppContext();
  const [status, setStatus] = useState('loading'); // loading, joining, error, success
  const [error, setError] = useState(null);
  const joiningStarted = useRef(false);

  useEffect(() => {
    if (!id) return;

    const performAutoJoin = async () => {
      if (joiningStarted.current) return;
      
      if (!showLoggedIn) {
        setAuthOpen(true);
        setStatus('waiting-auth');
        return;
      }

      joiningStarted.current = true;
      setStatus('joining');
      
      try {
        const result = await joinGroup(id);
        if (result.success) {
          setStatus('success');
          setTimeout(() => {
            router.push(`/c/${id}`);
          }, 800);
        } else {
          setStatus('error');
          setError(result.error);
          joiningStarted.current = false;
        }
      } catch (err) {
        setStatus('error');
        setError("Failed to connect to the server.");
        joiningStarted.current = false;
      }
    };

    performAutoJoin();
  }, [id, showLoggedIn, joinGroup, setAuthOpen, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0b] p-6 text-center font-sans">
      <AnimatePresence mode="wait">
        {(status === 'loading' || status === 'joining' || status === 'success' || status === 'waiting-auth') && (
          <motion.div 
            key="joining-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Minimal & Clean Spinner */}
            <div className="relative">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" strokeWidth={1.5} />
              <div className="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                {status === 'success' ? 'Joined successfully' : status === 'waiting-auth' ? 'Sign in to join' : 'Joining session...'}
              </h1>
              <p className="text-white/40 text-[15px] max-w-[320px] mx-auto leading-relaxed">
                {status === 'success' 
                  ? 'Redirecting you to the chat interface' 
                  : status === 'waiting-auth'
                    ? 'Authentication is required for this collaborative session'
                    : 'Setting up your collaborative AI workspace'}
              </p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[40px] border border-white/5 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Unable to join</h2>
            <p className="text-white/50 mb-10 leading-relaxed text-sm">
              {error || "The link might be invalid, expired, or you don't have permission to join this group."}
            </p>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-4.5 rounded-2xl bg-white text-black font-bold hover:bg-white/90 transition-all active:scale-[0.97]"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle bottom brand info */}
      <div className="fixed bottom-12 left-0 right-0 text-center opacity-10 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
          Aura AI Ecosystem
        </p>
      </div>
    </div>
  );
}
