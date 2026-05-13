'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Sparkles, Zap, Brain, Cpu, ZapOff, Shield, Users, Clock, Globe, ArrowRight, Zap as ZapIcon, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AudioLines = ({ size }) => (
  <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', gap: 2 }}>
    {[0.4, 0.8, 0.5, 0.9].map((s, i) => (
      <div key={i} style={{ width: 2, height: size * s, background: 'currentColor', borderRadius: 1 }} />
    ))}
  </div>
);

export default function UpgradeModal({ isOpen, onClose }) {
  const [billingPeriod, setBillingPeriod] = useState('Personal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const cards = [
    {
      title: 'Free',
      price: '0',
      description: 'See what AI can do',
      buttonText: 'Your current plan',
      isCurrent: true,
      features: [
        { icon: <Sparkles size={16} />, text: 'Core model' },
        { icon: <div className="w-[16px] h-[16px] rounded-full border border-white/30 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-white/30" /></div>, text: 'Limited messages and uploads' },
        { icon: <div className="w-[16px] h-[16px] rounded-sm border border-white/30 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-sm bg-white/30" /></div>, text: 'Limited image creation' },
        { icon: <div className="w-[16px] h-[16px] rounded-full border border-white/30 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-white/30" /></div>, text: 'Limited memory' },
      ]
    },
    {
      title: 'Go',
      price: '1,400',
      description: 'Keep chatting with expanded access',
      buttonText: 'Upgrade to Go',
      features: [
        { icon: <Sparkles size={16} />, text: 'Core model' },
        { icon: <Users size={16} />, text: 'More messages and uploads' },
        { icon: <div className="w-[16px] h-[16px] rounded-sm border border-white/30 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-sm bg-white/30" /></div>, text: 'More image creation' },
        { icon: <div className="w-[16px] h-[16px] rounded-full border border-white/30 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-white/30" /></div>, text: 'Longer memory' },
        { icon: <AudioLines size={16} />, text: 'Expanded voice mode' },
      ]
    },
    {
      title: 'Plus',
      price: '0',
      oldPrice: '5,700',
      description: 'More access to advanced intelligence',
      buttonText: 'Claim free offer',
      isPopular: true,
      badge: 'LIMITED TIME',
      priceSubtext: 'PKR for the first month',
      features: [
        { icon: <Sparkles size={16} />, text: 'Advanced models' },
        { icon: <Users size={16} />, text: 'Even more messages and uploads' },
        { icon: <div className="w-[16px] h-[16px] rounded-sm border border-indigo-400/50 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-sm bg-indigo-400/50" /></div>, text: 'Advanced image creation with Thinking' },
        { icon: <div className="w-[16px] h-[16px] rounded-full border border-indigo-400/50 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-indigo-400/50" /></div>, text: 'Expanded memory across chats' },
        { icon: <Brain size={16} />, text: 'Codex coding agent' },
        { icon: <Sparkles size={16} />, text: 'Expanded deep research' },
        { icon: <Users size={16} />, text: 'Projects and custom GPTs' },
      ]
    },
    {
      title: 'Pro',
      price: '27,999',
      prefix: 'From',
      description: 'Maximize your productivity',
      buttonText: 'Upgrade to Pro',
      features: [
        { text: 'Everything in Plus and:', isHeader: true },
        { icon: <Zap size={16} />, text: '5x or 20x more usage than Plus' },
        { icon: <Sparkles size={16} />, text: 'Frontier Pro model' },
        { icon: <Cpu size={16} />, text: 'Maximum access to Codex' },
        { icon: <Brain size={16} />, text: 'Maximum deep research' },
        { icon: <Users size={16} />, text: 'Unlimited core chat' },
        { icon: <div className="w-[16px] h-[16px] rounded-sm border border-white/30 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-sm bg-white/30" /></div>, text: 'Unlimited and faster image creation' },
        { icon: <div className="w-[16px] h-[16px] rounded-full border border-white/30 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-white/30" /></div>, text: 'Maximum memory and context' },
        { icon: <Zap size={16} />, text: 'Early access to experimental features' },
      ]
    }
  ];

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-3xl z-[99999999]"
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(40px)', zIndex: 99999999 }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-[1400px] h-full md:h-[92vh] overflow-y-auto bg-[#050505] md:rounded-[48px] border border-white/10 shadow-[0_0_120px_rgba(0,0,0,1)] relative custom-scrollbar flex flex-col"
        style={{ 
          scrollbarWidth: 'none', 
          backgroundColor: '#050505', 
          width: '100%', 
          maxWidth: '1360px', 
          maxHeight: '92vh',
          borderRadius: '40px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header section with sticky background if needed, but here simple */}
        <div className="w-full flex flex-col items-center pt-16 pb-12 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-8 right-10 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white z-50"
            style={{ position: 'absolute', top: '32px', right: '40px', padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>

          <h2 className="text-3xl md:text-5xl font-bold text-white text-center tracking-tight mb-8" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '42px', fontWeight: 600, color: '#fff', marginBottom: '32px' }}>Try Plus free for 1 month</h2>
          
          <div className="flex p-1 bg-white/5 rounded-full border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', padding: '4px' }}>
            {['Personal', 'Business'].map((t) => (
              <button
                key={t}
                onClick={() => setBillingPeriod(t)}
                className="px-8 py-2 rounded-full text-sm font-semibold transition-all"
                style={{ 
                  padding: '8px 32px', 
                  borderRadius: '999px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  transition: '0.2s',
                  backgroundColor: billingPeriod === t ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: billingPeriod === t ? '#fff' : 'rgba(255,255,255,0.4)',
                  boxShadow: billingPeriod === t ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Cards container */}
        <div 
          className="flex-1 px-6 md:px-10 pb-12 overflow-y-auto"
          style={{ padding: '0 40px 40px 40px', flex: 1 }}
        >
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '16px', 
              alignItems: 'stretch',
              maxWidth: '100%',
              margin: '0 auto'
            }}
          >
            {cards.map((card, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -4 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '36px',
                  borderRadius: '32px',
                  border: card.isPopular ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: card.isPopular ? '#151522' : '#141414',
                  position: 'relative',
                  transition: '0.3s',
                  boxShadow: card.isPopular ? '0 0 60px rgba(99,102,241,0.1)' : '0 8px 32px rgba(0,0,0,0.2)'
                }}
              >
                {card.badge && (
                  <div style={{ position: 'absolute', top: '24px', right: '24px', padding: '4px 10px', backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} style={{ color: '#818cf8' }} />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#818cf8', letterSpacing: '0.05em' }}>{card.badge}</span>
                  </div>
                )}
                
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{card.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.4', height: '40px' }}>{card.description}</p>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    {card.prefix && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 500 }}>{card.prefix}</span>}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', marginBottom: '1px' }}>Rs</span>
                        <span style={{ fontSize: '42px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{card.price}</span>
                      </div>
                      {card.oldPrice && (
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '20px', fontWeight: 500, textDecoration: 'line-through', marginLeft: '4px' }}>Rs {card.oldPrice}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 800, marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.priceSubtext || 'PKR / month'}</div>
                </div>

                <button 
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    fontSize: '15px',
                    fontWeight: 700,
                    marginBottom: '40px',
                    transition: '0.2s',
                    cursor: card.isCurrent ? 'default' : 'pointer',
                    backgroundColor: card.isCurrent ? 'rgba(255,255,255,0.05)' : card.isPopular ? '#4f46e5' : '#ffffff',
                    color: card.isCurrent ? 'rgba(255,255,255,0.3)' : card.isPopular ? '#ffffff' : '#000000',
                    border: card.isCurrent ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    boxShadow: !card.isCurrent ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {card.buttonText}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {card.features.map((feature, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      {feature.icon && <div style={{ marginTop: '2px', flexShrink: 0, color: card.isPopular ? '#818cf8' : 'rgba(255,255,255,0.4)' }}>{feature.icon}</div>}
                      <span style={{ 
                        fontSize: '13px', 
                        lineHeight: '1.3', 
                        color: feature.isHeader ? '#fff' : 'rgba(255,255,255,0.7)',
                        fontWeight: feature.isHeader ? 700 : 400
                      }}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {card.isPopular && (
                  <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.5', fontWeight: 500 }}>
                      <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Promo terms apply</span>. Promo pricing applies for 1 month. Starting Jun 13, 2026. ChatGPT Plus will continue at PKR 5,700/month.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
             <button style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               Have an existing plan? See billing help <ChevronRight size={14} />
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
