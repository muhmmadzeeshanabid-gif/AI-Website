'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Loader2, AlertTriangle, LogIn, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutoJoinGroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const { joinGroup, showLoggedIn, setAuthOpen } = useAppContext();
  const [status, setStatus] = useState('loading'); // loading, joining, error, success, waiting-auth
  const [error, setError] = useState(null);
  const joiningStarted = useRef(false);

  useEffect(() => {
    if (!id) return;

    const performAutoJoin = async () => {
      // If we are not logged in, we must wait for auth
      if (!showLoggedIn) {
        setStatus('waiting-auth');
        return;
      }

      if (joiningStarted.current) return;
      
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
  }, [id, showLoggedIn, joinGroup, router]);

  const handleSignIn = () => {
    setAuthOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0b] p-6 text-center font-sans overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {status === 'waiting-auth' && (
          <motion.div 
            key="auth-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative z-10 max-w-sm w-full bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[40px] border border-white/10 shadow-2xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-8 border border-indigo-500/20">
              <LogIn size={36} className="text-indigo-500" />
            </div>
            
            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Sign in to join</h1>
            <p className="text-white/40 text-[15px] mb-10 leading-relaxed">
              Authentication is required to participate in this collaborative AI session.
            </p>

            <button 
              onClick={handleSignIn}
              className="group relative w-full py-5 rounded-[20px] bg-white text-black font-black text-lg transition-all active:scale-[0.97] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden"
            >
              <span className="relative z-10">Sign In Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </motion.div>
        )}

        {(status === 'loading' || status === 'joining' || status === 'success') && (
          <motion.div 
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="relative">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" strokeWidth={1.5} />
              <div className="absolute inset-0 blur-xl bg-indigo-500/20 rounded-full" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {status === 'success' ? 'Joined successfully' : 'Joining session...'}
              </h1>
              <p className="text-white/40 text-[15px] max-w-[320px] mx-auto leading-relaxed">
                {status === 'success' 
                  ? 'Redirecting you to the chat interface' 
                  : 'Setting up your collaborative AI workspace'}
              </p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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

      <div className="fixed bottom-12 left-0 right-0 text-center opacity-10 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
          Aura AI Ecosystem
        </p>
      </div>
    </div>
  );
}
