'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Loader2, AlertTriangle, Smartphone, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutoJoinGroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const { joinGroup, showLoggedIn, login, db } = useAppContext();
  const [status, setStatus] = useState('loading'); // loading, joining, error, success, waiting-auth
  const [error, setError] = useState(null);
  const joiningStarted = useRef(false);

  useEffect(() => {
    if (!id) return;

    const performAutoJoin = async () => {
      // If we are not logged in, show the login card immediately
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

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0b] p-6 text-center font-sans overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <AnimatePresence mode="wait">
        {status === 'waiting-auth' && (
          <motion.div 
            key="login-card"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="relative z-10 w-full max-w-[440px]"
          >
            <div className="bg-[#111113] border border-white/10 p-10 rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
              <h2 className="text-[32px] font-black text-white leading-tight mb-3">
                Log in or sign up
              </h2>
              <p className="text-white/40 text-[16px] mb-10 leading-relaxed">
                Join the collaborative AI space. Get smarter responses and real-time updates.
              </p>

              <div className="space-y-3 mb-8">
                <button
                  onClick={async () => {
                    try { await login(); } catch (e) {}
                  }}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-full border border-white/10 bg-transparent hover:bg-white/5 transition-all text-white font-semibold text-[16px]"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                
                <button className="w-full flex items-center justify-center gap-3 py-4 rounded-full border border-white/10 bg-transparent hover:bg-white/5 transition-all text-white font-semibold text-[16px]">
                  <Apple size={20} fill="currentColor" />
                  Continue with Apple
                </button>

                <button className="w-full flex items-center justify-center gap-3 py-4 rounded-full border border-white/10 bg-transparent hover:bg-white/5 transition-all text-white font-semibold text-[16px]">
                  <Smartphone size={20} />
                  Continue with phone
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="relative mb-6">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full py-4.5 px-6 rounded-2xl bg-transparent border-2 border-white/5 focus:border-indigo-500 transition-all outline-none text-white text-[16px]"
                />
              </div>

              <button className="w-full py-4.5 rounded-full bg-white text-black font-black text-[16px] hover:opacity-90 transition-all active:scale-[0.98]">
                Continue
              </button>
            </div>
            
            <p className="mt-8 text-white/20 text-[11px] font-medium tracking-wide uppercase">
              By joining, you agree to our Terms and Privacy Policy.
            </p>
          </motion.div>
        )}

        {(status === 'loading' || status === 'joining' || status === 'success') && (
          <motion.div 
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-10"
          >
            <div className="relative">
              <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" strokeWidth={1.5} />
              <div className="absolute inset-0 blur-2xl bg-indigo-500/30 rounded-full" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {status === 'success' ? 'Welcome Aboard!' : 'Entering Session...'}
              </h1>
              <p className="text-white/40 text-[16px] max-w-[320px] mx-auto leading-relaxed">
                {status === 'success' 
                  ? 'Your workspace is ready. Redirecting...' 
                  : 'Authenticating your collaborative session'}
              </p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-[420px] w-full bg-[#111113] border border-white/5 p-12 rounded-[48px] shadow-2xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase tracking-wider">Join Failed</h2>
            <p className="text-white/40 mb-10 leading-relaxed text-[16px]">
              {error || "The link might be invalid, expired, or you don't have permission to join this session."}
            </p>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-5 rounded-full bg-white/5 text-white font-bold hover:bg-white/10 transition-all active:scale-[0.97] border border-white/10"
            >
              Return Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
