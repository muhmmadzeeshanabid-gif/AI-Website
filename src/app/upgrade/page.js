'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Sparkles, Zap, Brain, Cpu, ZapOff, Shield, Users, Clock, Globe, ArrowRight, Zap as ZapIcon, Info, ChevronRight, ArrowLeft, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AudioLines = ({ size }) => (
  <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', gap: 2 }}>
    {[0.4, 0.8, 0.5, 0.9].map((s, i) => (
      <div key={i} style={{ width: 2, height: size * s, background: 'currentColor', borderRadius: 1 }} />
    ))}
  </div>
);

export default function UpgradePage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState('Personal');

  useEffect(() => {
    document.title = 'Upgrade Plan | Kyra';
  }, []);

  const personalCards = [
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
      themeColor: '#4f46e5',
      cardBg: '#1e1e3f',
      buttonVariant: 'purple',
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
      themeColor: '#ffffff',
      cardBg: '#0d0d0d',
      buttonVariant: 'white',
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

  const businessCards = [
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
      title: 'Team',
      price: '7,500',
      description: 'For teams of all sizes',
      buttonText: 'Upgrade to Team',
      features: [
        { text: 'Everything in Plus and:', isHeader: true },
        { icon: <Users size={16} />, text: 'Collaborative workspace with shared folders' },
        { icon: <Shield size={16} />, text: 'Admin console for user management' },
        { icon: <Globe size={16} />, text: 'Shareable custom GPTs with your workspace' },
        { icon: <Sparkles size={16} />, text: 'Higher usage limits for frontier models' },
        { icon: <Clock size={16} />, text: 'Priority support and early access' },
        { icon: <Brain size={16} />, text: 'Team-wide memory synchronization' },
      ]
    },
    {
      title: 'Enterprise',
      price: 'Contact Us',
      description: 'Custom solutions for your business',
      buttonText: 'Contact Sales',
      isPopular: true,
      features: [
        { text: 'Enterprise-grade features:', isHeader: true },
        { icon: <Shield size={16} />, text: 'SOC2, GDPR, and HIPAA compliance' },
        { icon: <Users size={16} />, text: 'Unlimited usage of frontier models' },
        { icon: <Cpu size={16} />, text: 'Custom model fine-tuning & training' },
        { icon: <Brain size={16} />, text: 'Dedicated account manager & 24/7 help' },
        { icon: <Globe size={16} />, text: 'SSO, SAML, and SCIM provisioning' },
        { icon: <Zap size={16} />, text: 'Maximum performance & 2M+ context window' },
        { icon: <FileText size={16} />, text: 'Advanced data analytics & insights' },
      ]
    }
  ];

  const activeCards = billingPeriod === 'Personal' ? personalCards : businessCards;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)', 
      color: 'var(--on-surface)',
      fontFamily: 'Inter, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Floating Close Button */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1000 }}>
        <button 
          onClick={() => router.push('/')}
          style={{
            width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-1)',
            border: '1px solid var(--divider)', color: 'var(--on-surface)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            transition: '0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '64px 24px' }}>
        <div className="w-full flex flex-col items-center mb-24" style={{ marginBottom: '100px' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '48px', fontWeight: 700, textAlign: 'center', marginBottom: '32px', letterSpacing: '-0.02em' }}>
            {billingPeriod === 'Personal' ? 'Try Plus free for 1 month' : 'Empower your business with AI'}
          </h1>
          <div style={{ backgroundColor: 'var(--surface-1)', borderRadius: '999px', border: '1px solid var(--divider)', display: 'flex', padding: '4px' }}>
            {['Personal', 'Business'].map((t) => (
              <button
                key={t}
                onClick={() => setBillingPeriod(t)}
                style={{ 
                  padding: '10px 32px', 
                  borderRadius: '999px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  transition: '0.2s',
                  backgroundColor: billingPeriod === t ? 'var(--hover-overlay)' : 'transparent',
                  color: billingPeriod === t ? 'var(--on-surface)' : 'var(--on-surface-subtle)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ 
          maxWidth: 1600, 
          margin: '0 auto',
          display: 'grid', 
          gridTemplateColumns: `repeat(${activeCards.length}, 1fr)`, 
          gap: '12px',
          padding: '0 20px'
        }}>
          <AnimatePresence mode='wait'>
            {activeCards.map((card, idx) => {
              const cardBg = card.cardBg || 'var(--surface-1)';
              const isSpecial = card.buttonVariant === 'purple' || card.buttonVariant === 'white';
              const buttonBg = card.buttonVariant === 'purple' ? '#5c5ce0' : 
                               card.buttonVariant === 'white' ? '#ffffff' : 
                               card.isCurrent ? 'var(--surface-2)' : 'var(--on-surface)';
              const buttonTextCol = card.buttonVariant === 'white' ? '#000000' : 
                                    card.buttonVariant === 'purple' ? '#ffffff' :
                                    card.isCurrent ? 'var(--on-surface-subtle)' : 'var(--bg-primary)';

              return (
                <motion.div 
                  key={`${billingPeriod}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 20px',
                    borderRadius: '24px',
                    border: card.cardBg ? 'none' : '1px solid var(--divider)',
                    background: cardBg,
                    position: 'relative',
                    boxShadow: card.cardBg ? '0 20px 40px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.2)',
                    minHeight: '440px',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>{card.title}</h3>
                      {card.badge && (
                        <div style={{ 
                          padding: '4px 10px', 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <Clock size={12} style={{ color: 'rgba(255,255,255,0.7)' }} />
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>{card.badge}</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ marginBottom: '28px' }}>
                      {card.prefix && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '4px' }}>{card.prefix}</div>}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Rs</span>
                        {card.oldPrice && (
                          <span style={{ fontSize: '32px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>{card.oldPrice}</span>
                        )}
                        <span style={{ fontSize: '48px', fontWeight: 800, color: '#fff' }}>{card.price}</span>
                        {card.priceSubtext && (
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', maxWidth: '100px', lineHeight: '1.2', marginLeft: '4px' }}>{card.priceSubtext}</span>
                        )}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.5', marginTop: '10px', fontWeight: 500 }}>{card.description}</p>
                    </div>

                    <button 
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '999px',
                        fontSize: '15px',
                        fontWeight: 700,
                        marginBottom: '32px',
                        cursor: card.isCurrent ? 'default' : 'pointer',
                        backgroundColor: buttonBg,
                        color: buttonTextCol,
                        border: isSpecial ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        transition: '0.2s'
                      }}
                      onMouseEnter={e => { if(!card.isCurrent) e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={e => { if(!card.isCurrent) e.currentTarget.style.opacity = '1'; }}
                    >
                      {card.buttonText}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {card.features.map((feature, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          {feature.isHeader ? (
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '4px', marginBottom: '-4px' }}>{feature.text}</div>
                          ) : (
                            <>
                              <div style={{ marginTop: '3px', flexShrink: 0, color: card.themeColor || 'rgba(255,255,255,0.4)' }}>
                                {feature.icon || <Check size={16} />}
                              </div>
                              <span style={{ 
                                fontSize: '14px', 
                                lineHeight: '1.4', 
                                color: 'rgba(255,255,255,0.85)',
                                fontWeight: 400
                              }}>
                                {feature.text}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {(card.title === 'Plus' || card.title === 'Pro') && (
                    <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', fontWeight: 500 }}>
                        {card.title === 'Plus' ? (
                          <>
                            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Promo terms apply</span>. Promo pricing applies for 1 month. Starting Jun 13, 2026. ChatGPT Plus will continue at PKR 5,700/month.
                          </>
                        ) : (
                          <>
                            Unlimited subject to abuse guardrails. <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn about limits and promos on both tiers</span>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
           <button style={{ color: 'var(--on-surface-muted)', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
             Have an existing plan? See billing help <ChevronRight size={16} />
           </button>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '64px 24px', opacity: 0.5, fontSize: 13 }}>
        © 2026 Kyra Advanced Intelligence
      </footer>
    </div>
  );
}
