'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Loader2, AlertTriangle, Smartphone, Apple, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutoJoinGroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const { joinGroup, showLoggedIn, login } = useAppContext();
  const [status, setStatus] = useState('loading'); // loading, joining, error, success, waiting-auth
  const [error, setError] = useState(null);
  const joiningStarted = useRef(false);
  const [email, setEmail] = useState('');

  // Styles from AuthModal
  const text   = 'var(--on-surface)';
  const muted  = 'var(--on-surface-muted)';
  const border = 'var(--divider)';
  const hover  = 'var(--hover-overlay)';

  useEffect(() => {
    if (!id) return;

    const performAutoJoin = async () => {
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
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: '#0a0a0b',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <AnimatePresence mode="wait">
        {status === 'waiting-auth' && (
          <motion.div 
            key="login-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              width: 440,
              maxWidth: '100%',
              background: 'var(--surface-1)',
              borderRadius: 32,
              padding: '48px 40px 40px',
              border: `1px solid ${border}`,
              textAlign: 'center',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
              position: 'relative'
            }}
          >
            <h2 style={{ fontSize: 32, fontWeight: 700, color: text, marginBottom: 12, letterSpacing: '-0.02em' }}>
              Log in or sign up
            </h2>
            <p style={{ fontSize: 16, color: muted, marginBottom: 32, lineHeight: 1.5 }}>
              You'll get smarter responses and can upload files, images, and more.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <button
                onClick={async () => { try { await login(); } catch (e) {} }}
                style={{
                  width: '100%', padding: '14px', borderRadius: 999,
                  background: 'transparent', border: `1px solid ${border}`,
                  color: text, fontSize: 16, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  fontFamily: 'inherit', transition: 'background 0.15s',
                }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
              
              <button style={{ width: '100%', padding: '14px', borderRadius: 999, background: 'transparent', border: `1px solid ${border}`, color: text, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'inherit' }}>
                <Apple size={18} fill="currentColor" />
                Continue with Apple
              </button>

              <button style={{ width: '100%', padding: '14px', borderRadius: 999, background: 'transparent', border: `1px solid ${border}`, color: text, fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'inherit' }}>
                <Smartphone size={18} />
                Continue with phone
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: border }}></div>
              <span style={{ fontSize: 12, color: muted, fontWeight: 700 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: border }}></div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); login(); }}>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 20px', borderRadius: 16,
                    background: 'transparent', border: `2px solid ${border}`,
                    color: text, fontSize: 16, fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '15px', borderRadius: 999,
                  background: 'var(--on-surface)', color: 'var(--bg-primary)',
                  fontSize: 16, fontWeight: 800, cursor: 'pointer',
                  border: 'none',
                }}
              >
                Continue
              </button>
            </form>
          </motion.div>
        )}

        {(status === 'loading' || status === 'joining' || status === 'success') && (
          <motion.div 
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-10"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" strokeWidth={1.5} />
              <div className="absolute inset-0 blur-2xl bg-indigo-500/30 rounded-full" />
            </div>
            <div className="space-y-4 text-center">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {status === 'success' ? 'Welcome!' : 'Entering Session...'}
              </h1>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              maxWidth: 440,
              width: '100%',
              background: '#111113',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '48px',
              borderRadius: 32,
              textAlign: 'center',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
            }}
          >
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4">Join Failed</h2>
            <p className="text-white/40 mb-10 text-[16px]">
              {error || "The link might be invalid or expired."}
            </p>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-5 rounded-full bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10"
            >
              Return Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
