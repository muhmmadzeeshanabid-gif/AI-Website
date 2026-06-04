'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Sparkles, Zap, Brain, Cpu, ZapOff, Shield, Users, Clock, Globe, ArrowRight, Zap as ZapIcon, Info, ChevronRight, ArrowLeft, FileText, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const AudioLines = ({ size }) => (
  <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', gap: 2 }}>
    {[0.4, 0.8, 0.5, 0.9].map((s, i) => (
      <div key={i} style={{ width: 2, height: size * s, background: 'currentColor', borderRadius: 1 }} />
    ))}
  </div>
);

const renderDotIcon = (isRound) => (
  <div 
    style={{ 
      width: 16, 
      height: 16, 
      borderRadius: isRound ? '50%' : '4px', 
      border: '1px solid currentColor', 
      opacity: 0.4, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}
  >
    <div 
      style={{ 
        width: isRound ? 4 : 6, 
        height: isRound ? 4 : 6, 
        borderRadius: isRound ? '50%' : '1px', 
        background: 'currentColor' 
      }} 
    />
  </div>
);

function CheckoutForm({ selectedPlan, onCancel, isSuccess, setIsSuccess, isSubmitting, setIsSubmitting, isSetupIntent }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const { resolvedTheme } = useAppContext();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    let result;
    if (isSetupIntent) {
      result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/upgrade?success=true`,
        },
        redirect: 'if_required',
      });
    } else {
      result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/upgrade?success=true`,
        },
        redirect: 'if_required',
      });
    }

    const { error, setupIntent, paymentIntent } = result;

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    } else if (
      (paymentIntent && paymentIntent.status === 'succeeded') ||
      (setupIntent && setupIntent.status === 'succeeded') ||
      setupIntent
    ) {
      setIsSubmitting(false);
      setIsSuccess(true);
    } else {
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Payment method</h2>
        <PaymentElement options={{ wallets: { applePay: 'never', googlePay: 'never' } }} />
      </div>

      {errorMessage && (
        <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px', fontWeight: 500 }}>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '999px',
          backgroundColor: resolvedTheme === 'dark'
            ? (isSubmitting ? 'rgba(255, 255, 255, 0.08)' : '#ffffff')
            : (isSubmitting ? 'rgba(0, 0, 0, 0.05)' : '#000000'),
          color: resolvedTheme === 'dark'
            ? (isSubmitting ? 'rgba(255, 255, 255, 0.4)' : '#000000')
            : (isSubmitting ? 'rgba(0, 0, 0, 0.4)' : '#ffffff'),
          fontWeight: 700,
          fontSize: '16px',
          border: resolvedTheme === 'dark' ? 'none' : '1px solid rgba(0,0,0,0.1)',
          cursor: isSubmitting ? 'default' : 'pointer',
          transition: '0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '12px'
        }}
      >
        {isSubmitting ? 'Processing...' : 'Subscribe'}
      </button>
    </form>
  );
}

const COUNTRIES = [
  { name: 'Pakistan', code: 'PK', currency: 'PKR', symbol: 'Rs', personal: { Free: '0', Go: '1,400', Plus: '5,700', Pro: '27,999' }, business: { Free: '0', Team: '7,500', Enterprise: 'Contact Us' } },
  { name: 'United States', code: 'US', currency: 'USD', symbol: '$', personal: { Free: '0', Go: '5', Plus: '20', Pro: '100' }, business: { Free: '0', Team: '25', Enterprise: 'Contact Us' } },
  { name: 'Saudi Arabia', code: 'SA', currency: 'SAR', symbol: 'SR', personal: { Free: '0', Go: '19', Plus: '75', Pro: '375' }, business: { Free: '0', Team: '94', Enterprise: 'Contact Us' } },
  { name: 'United Arab Emirates', code: 'AE', currency: 'AED', symbol: 'DH', personal: { Free: '0', Go: '18', Plus: '73', Pro: '367' }, business: { Free: '0', Team: '92', Enterprise: 'Contact Us' } },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£', personal: { Free: '0', Go: '4', Plus: '16', Pro: '80' }, business: { Free: '0', Team: '20', Enterprise: 'Contact Us' } },
  { name: 'Germany', code: 'DE', currency: 'EUR', symbol: '€', personal: { Free: '0', Go: '5', Plus: '18', Pro: '90' }, business: { Free: '0', Team: '23', Enterprise: 'Contact Us' } },
  { name: 'Canada', code: 'CA', currency: 'CAD', symbol: '$', personal: { Free: '0', Go: '6', Plus: '27', Pro: '135' }, business: { Free: '0', Team: '34', Enterprise: 'Contact Us' } },
  { name: 'Australia', code: 'AU', currency: 'AUD', symbol: '$', personal: { Free: '0', Go: '7', Plus: '30', Pro: '150' }, business: { Free: '0', Team: '38', Enterprise: 'Contact Us' } },
  { name: 'India', code: 'IN', currency: 'INR', symbol: '₹', personal: { Free: '0', Go: '400', Plus: '1,650', Pro: '8,200' }, business: { Free: '0', Team: '2,100', Enterprise: 'Contact Us' } },
  { name: 'Afghanistan', code: 'AF', currency: 'AFN', symbol: 'Af', personal: { Free: '0', Go: '350', Plus: '1,400', Pro: '7,000' }, business: { Free: '0', Team: '1,750', Enterprise: 'Contact Us' } },
  { name: 'Albania', code: 'AL', currency: 'ALL', symbol: 'Lek', personal: { Free: '0', Go: '470', Plus: '1,900', Pro: '9,500' }, business: { Free: '0', Team: '2,350', Enterprise: 'Contact Us' } },
  { name: 'Algeria', code: 'DZ', currency: 'DZD', symbol: 'DA', personal: { Free: '0', Go: '670', Plus: '2,700', Pro: '13,500' }, business: { Free: '0', Team: '3,350', Enterprise: 'Contact Us' } },
  { name: 'Andorra', code: 'AD', currency: 'EUR', symbol: '€', personal: { Free: '0', Go: '5', Plus: '18', Pro: '90' }, business: { Free: '0', Team: '23', Enterprise: 'Contact Us' } },
  { name: 'Angola', code: 'AO', currency: 'AOA', symbol: 'Kz', personal: { Free: '0', Go: '4,100', Plus: '16,500', Pro: '82,500' }, business: { Free: '0', Team: '20,600', Enterprise: 'Contact Us' } },
  { name: 'Anguilla', code: 'AI', currency: 'XCD', symbol: '$', personal: { Free: '0', Go: '13', Plus: '54', Pro: '270' }, business: { Free: '0', Team: '67', Enterprise: 'Contact Us' } },
  { name: 'Antarctica', code: 'AQ', currency: 'USD', symbol: '$', personal: { Free: '0', Go: '5', Plus: '20', Pro: '100' }, business: { Free: '0', Team: '25', Enterprise: 'Contact Us' } }
];

export default function UpgradePage() {
  const router = useRouter();
  const { resolvedTheme } = useAppContext();
  const [billingPeriod, setBillingPeriod] = useState('Personal');
  
  // State for country and currency selection
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // States for 3-day countdown trial
  const [offerExpired, setOfferExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    document.title = 'Upgrade Plan | Kyra';
    
    // Auto-detect country via GeoIP API
    const detectCountry = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.country_code) {
            const matched = COUNTRIES.find(c => c.code === data.country_code);
            if (matched) {
              setSelectedCountry(matched);
            }
          }
        }
      } catch (err) {
        console.warn('GeoIP country detection bypassed or failed:', err.message || err);
      }
    };
    detectCountry();
  }, []);

  useEffect(() => {
    // Check countdown for 3-day promotional trial
    let startTime = localStorage.getItem('kyra_trial_countdown_start');
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem('kyra_trial_countdown_start', startTime);
    }

    const checkExpiry = () => {
      const elapsed = Date.now() - parseInt(startTime, 10);
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (elapsed >= threeDaysMs) {
        setOfferExpired(true);
      } else {
        setOfferExpired(false);
        setRemainingTime(threeDaysMs - elapsed);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, []);

  const personalCards = [
    {
      title: 'Free',
      price: selectedCountry.personal.Free,
      description: 'See what AI can do',
      buttonText: 'Your current plan',
      isCurrent: true,
      features: [
        { icon: <Sparkles size={16} />, text: 'Core model' },
        { icon: renderDotIcon(true), text: 'Limited messages and uploads' },
        { icon: renderDotIcon(false), text: 'Limited image creation' },
        { icon: renderDotIcon(true), text: 'Limited memory' },
      ]
    },
    {
      title: 'Go',
      price: selectedCountry.personal.Go,
      description: 'Keep chatting with expanded access',
      buttonText: 'Upgrade to Go',
      features: [
        { icon: <Sparkles size={16} />, text: 'Core model' },
        { icon: <Users size={16} />, text: 'More messages and uploads' },
        { icon: renderDotIcon(false), text: 'More image creation' },
        { icon: renderDotIcon(true), text: 'Longer memory' },
        { icon: <AudioLines size={16} />, text: 'Expanded voice mode' },
      ]
    },
    {
      title: 'Plus',
      price: !offerExpired ? '0' : selectedCountry.personal.Plus,
      oldPrice: !offerExpired ? selectedCountry.personal.Plus : null,
      priceSubtext: !offerExpired ? 'Free trial, then regular pricing' : null,
      description: 'More access to advanced intelligence',
      buttonText: !offerExpired ? 'Claim free offer' : 'Upgrade to Plus',
      isPopular: true,
      badge: !offerExpired ? 'LIMITED TIME' : null,
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
      price: selectedCountry.personal.Pro,
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
        { icon: renderDotIcon(false), text: 'Unlimited and faster image creation' },
        { icon: renderDotIcon(true), text: 'Maximum memory and context' },
        { icon: <Zap size={16} />, text: 'Early access to experimental features' },
      ]
    }
  ];

  const businessCards = [
    {
      title: 'Free',
      price: selectedCountry.business.Free,
      description: 'See what AI can do',
      buttonText: 'Your current plan',
      isCurrent: true,
      features: [
        { icon: <Sparkles size={16} />, text: 'Core model' },
        { icon: renderDotIcon(true), text: 'Limited messages and uploads' },
        { icon: renderDotIcon(false), text: 'Limited image creation' },
        { icon: renderDotIcon(true), text: 'Limited memory' },
      ]
    },
    {
      title: 'Team',
      price: selectedCountry.business.Team,
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
      price: selectedCountry.business.Enterprise,
      description: 'Custom solutions for your business',
      buttonText: 'Contact Sales',
      isPopular: true,
      themeColor: '#a78bfa',
      cardBg: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%)',
      buttonVariant: 'purple',
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

  const [selectedPlan, setSelectedPlan] = useState(null);
  const hasLoadedFromUrl = useRef(false);

  useEffect(() => {
    if (hasLoadedFromUrl.current) return;

    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const periodParam = params.get('period');

    if (periodParam && (periodParam === 'Personal' || periodParam === 'Business')) {
      setBillingPeriod(periodParam);
    }

    if (planParam) {
      const cards = (periodParam || billingPeriod) === 'Personal' ? personalCards : businessCards;
      const matched = cards.find(c => c.title.toLowerCase() === planParam.toLowerCase());
      if (matched) {
        setSelectedPlan(matched);
        hasLoadedFromUrl.current = true;
      }
    } else {
      hasLoadedFromUrl.current = true;
    }
  }, [selectedCountry, offerExpired, billingPeriod]);

  useEffect(() => {
    if (!hasLoadedFromUrl.current) return;
    const currentParams = new URLSearchParams(window.location.search);
    let isDifferent = false;
    
    const newPlan = selectedPlan ? selectedPlan.title : null;
    if (currentParams.get('plan') !== newPlan) isDifferent = true;
    if (currentParams.get('period') !== billingPeriod) isDifferent = true;

    if (isDifferent) {
      if (selectedPlan) {
        currentParams.set('plan', selectedPlan.title);
      } else {
        currentParams.delete('plan');
      }
      currentParams.set('period', billingPeriod);
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedPlan, billingPeriod, router]);

  // States for checkout
  const [clientSecret, setClientSecret] = useState('');
  const [errorCreatingIntent, setErrorCreatingIntent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSetupIntent, setIsSetupIntent] = useState(false);

  useEffect(() => {
    if (!selectedPlan) {
      setClientSecret('');
      setErrorCreatingIntent('');
      setIsSetupIntent(false);
      return;
    }

    // Completely free plan (like 'Free' tier) bypasses Stripe
    if (selectedPlan.title === 'Free') {
      return;
    }

    const isClaimFreeOffer = selectedPlan.buttonText === 'Claim free offer';
    const priceVal = isClaimFreeOffer ? 0 : (parseInt(selectedPlan.price.replace(/,/g, ''), 10) || 0);

    const fetchIntent = async () => {
      try {
        setErrorCreatingIntent('');
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: isClaimFreeOffer ? 0 : Math.round((priceVal + priceVal * 0.2) * 100), // 0 for free offer, otherwise price + 20% VAT
            planName: selectedPlan.title,
            currency: selectedCountry.currency.toLowerCase()
          })
        });
        const data = await res.json();
        if (data.error) {
          setErrorCreatingIntent(data.error);
        } else {
          setClientSecret(data.clientSecret);
          setIsSetupIntent(data.isSetupIntent || false);
        }
      } catch (err) {
        setErrorCreatingIntent(err.message || 'Error creating payment session');
      }
    };

    fetchIntent();
  }, [selectedPlan]);

  // Handle free subscription bypass confirmation (only for Free tier)
  const handleFreeConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        // Reset states and go home
        setSelectedPlan(null);
        setIsSuccess(false);
        router.push('/');
      }, 2000);
    }, 1500);
  };

  const formatRemainingTime = (ms) => {
    if (ms <= 0) return 'Expired';
    const totalSecs = Math.floor(ms / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const totalHours = Math.floor(totalMins / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  // Calculate billing values (fallbacks to avoid errors when selectedPlan is null)
  const isClaimFreeOffer = selectedPlan?.buttonText === 'Claim free offer';
  const basePriceNum = selectedPlan ? (isClaimFreeOffer ? 0 : (parseInt(selectedPlan.price.replace(/,/g, ''), 10) || 0)) : 0;
  const vatNum = Math.round(basePriceNum * 0.2);
  const totalNum = basePriceNum + vatNum;

  const basePriceStr = basePriceNum === 0 ? '0' : (selectedPlan ? selectedPlan.price : '0');
  const vatStr = basePriceNum === 0 ? '0' : vatNum.toLocaleString();
  const totalStr = basePriceNum === 0 ? '0' : totalNum.toLocaleString();

  // If a plan is selected, render the checkout page instead of the card selection grid
  if (selectedPlan) {
    const isFree = selectedPlan.title === 'Free';

    // Options for Stripe Elements appearance styling
    const options = {
      clientSecret,
      appearance: {
        theme: resolvedTheme === 'dark' ? 'night' : 'stripe',
        variables: {
          colorPrimary: resolvedTheme === 'dark' ? '#5c5ce0' : '#000000',
          colorBackground: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
          colorText: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
          colorDanger: '#df1b41',
          fontFamily: 'Inter, sans-serif',
          spacingUnit: '4px',
          borderRadius: '12px',
        },
        rules: {
          '.Input': {
            border: resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #d1d5db',
            boxShadow: 'none',
            padding: '12px 14px',
            backgroundColor: resolvedTheme === 'dark' ? '#1c1c1e' : '#ffffff',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          },
          '.Input:focus': {
            borderColor: resolvedTheme === 'dark' ? '#5c5ce0' : '#000000',
            boxShadow: `0 0 0 1px ${resolvedTheme === 'dark' ? '#5c5ce0' : '#000000'}`,
          },
          '.Label': {
            fontSize: '13.5px',
            fontWeight: '600',
            marginBottom: '6px',
            color: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#1f2937',
          }
        }
      },
    };

    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: resolvedTheme === 'dark' ? '#000000' : '#ffffff',
        color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
        fontFamily: 'Inter, -apple-system, sans-serif',
        padding: '64px 24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          maxWidth: '1200px', 
          width: '100%', 
          margin: '0 auto 48px auto', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button 
            onClick={() => {
              setSelectedPlan(null);
              setClientSecret('');
              setErrorCreatingIntent('');
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              padding: 0
            }}
          >
            <ArrowLeft size={20} />
            <span>Configure your plan</span>
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '24px'
          }}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <Check size={40} strokeWidth={3} />
            </motion.div>
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>Subscription Confirmed!</h2>
            <p style={{ color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '16px' }}>Welcome to Kyra {selectedPlan.title}. Redirecting you to chat...</p>
          </div>
        ) : (
          <div style={{ 
            maxWidth: '1200px', 
            width: '100%', 
            margin: '0 auto', 
            gap: '64px',
            flex: 1
          }} className="checkout-container">
            {/* Left side: Payment Method */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '40px' }}>
              {isFree ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Confirm free subscription</h2>
                  <p style={{ color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '15px' }}>
                    You are claiming a free subscription. No payment method is required at this time.
                  </p>
                  <button
                    onClick={handleFreeConfirm}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '999px',
                      backgroundColor: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
                      color: resolvedTheme === 'dark' ? '#000000' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '16px',
                      border: 'none',
                      cursor: isSubmitting ? 'default' : 'pointer',
                      transition: '0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '12px'
                    }}
                  >
                    {isSubmitting ? 'Confirming...' : 'Claim free offer'}
                  </button>
                </div>
              ) : (
                <>
                  {errorCreatingIntent ? (
                    <div style={{ color: '#ef4444', fontWeight: 500, fontSize: '15px' }}>
                      Failed to load checkout details: {errorCreatingIntent}
                    </div>
                  ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={options}>
                      <CheckoutForm 
                        selectedPlan={selectedPlan}
                        isSuccess={isSuccess}
                        setIsSuccess={setIsSuccess}
                        isSubmitting={isSubmitting}
                        setIsSubmitting={setIsSubmitting}
                        isSetupIntent={isSetupIntent}
                      />
                    </Elements>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      <span className="animate-pulse">Loading Stripe secure form...</span>
                    </div>
                  )}
                </>
              )}
            </div>
 
            {/* Right side: Plan Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                backgroundColor: resolvedTheme === 'dark' ? '#111111' : '#25252b', // Soften black card color on white screen
                color: '#ffffff', // Force text inside plain card to be white
                borderRadius: '28px',
                padding: '32px 24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', fontFamily: 'Outfit, sans-serif' }}>
                  {selectedPlan.title} plan
                </h3>
 
                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Top features</div>
                  {selectedPlan.features.filter(f => !f.isHeader).slice(0, 4).map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: selectedPlan.themeColor || 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                        {f.icon || <Check size={16} />}
                      </div>
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
 
                {isClaimFreeOffer && (
                  <div style={{ fontSize: '12.5px', color: '#818cf8', fontWeight: 600, marginTop: '-16px', marginBottom: '24px' }}>
                    ✨ 1-month free trial included
                  </div>
                )}
 
                {/* Price Breakdown */}
                <div style={{ 
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                  paddingTop: '20px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                    <span>Monthly subscription</span>
                    <span>{selectedCountry.symbol} {basePriceStr}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                    <span>VAT (20%)</span>
                    <span>{selectedCountry.symbol} {vatStr}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#ffffff', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                    <span>Due today</span>
                    <span>{selectedCountry.symbol} {totalStr}</span>
                  </div>
                </div>
              </div>
 
              {/* Legal Terms */}
              <p style={{ fontSize: '11px', color: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', lineHeight: '1.6', padding: '0 8px' }}>
                {isClaimFreeOffer ? (
                  <>
                    First month free. Renews monthly starting next month. {selectedCountry.symbol} {selectedPlan.price}/month will be charged. Cancel anytime in Settings. By subscribing, you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Use</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Service Credit Terms</span>, have read our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>, and authorize Kyra to store and charge your payment method.
                  </>
                ) : (
                  <>
                    Renews monthly until cancelled. {selectedCountry.symbol} {totalStr}/month will be charged. Cancel anytime in Settings. By subscribing, you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Use</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Service Credit Terms</span>, have read our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>, and authorize Kyra to store and charge your payment method.
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

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
      <main className="upgrade-main-container">
        <div className="w-full flex flex-col items-center" style={{ marginBottom: '40px' }}>
          <h1 className="upgrade-title">
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

        <div 
          className={`upgrade-grid ${billingPeriod === 'Personal' ? 'personal' : 'business'}`}
        >
          <AnimatePresence mode='wait'>
            {activeCards.map((card, idx) => {
              // Plain cards use #2a2a2a (dark charcoal gray) to look premium and visible on both white and black screens
              const cardBg = card.cardBg || '#2a2a2a';
              const isSpecial = card.buttonVariant === 'purple' || card.buttonVariant === 'white';
              
              // Custom button styles to match the dark card background
              let buttonBg;
              let buttonTextCol;
              if (card.buttonVariant === 'purple') {
                buttonBg = '#5c5ce0';
                buttonTextCol = '#ffffff';
              } else if (card.buttonVariant === 'white') {
                buttonBg = '#ffffff';
                buttonTextCol = '#000000';
              } else if (card.isCurrent) {
                buttonBg = 'rgba(255, 255, 255, 0.08)';
                buttonTextCol = 'rgba(255, 255, 255, 0.4)';
              } else {
                // Active button on a plain dark card gets clean high-contrast white background with black text
                buttonBg = '#ffffff';
                buttonTextCol = '#000000';
              }

              // Border and Shadow adjustments suitable for dark cards on both dark & light layouts
              const cardBorder = card.cardBg 
                ? 'none' 
                : '1px solid rgba(255, 255, 255, 0.08)';
              
              const cardShadow = card.cardBg
                ? '0 20px 40px rgba(0,0,0,0.4)'
                : '0 12px 32px rgba(0,0,0,0.15)';

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
                    padding: '32px 24px',
                    borderRadius: '28px',
                    border: cardBorder,
                    background: cardBg,
                    position: 'relative',
                    boxShadow: cardShadow,
                    minHeight: '400px', // Reduced gap and card size
                    justifyContent: 'space-between',
                    width: '100%'
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>{card.title}</h3>
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
                      {card.prefix && (
                        <div style={{ 
                          color: 'rgba(255,255,255,0.5)', 
                          fontSize: '13px', 
                          marginBottom: '4px',
                          fontWeight: 500
                        }}>
                          {card.prefix}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                        {card.price !== 'Contact Us' && card.price !== '0' && (
                          <span style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                            {selectedCountry.symbol}
                          </span>
                        )}
                        
                        {card.oldPrice && (
                          <>
                            <span style={{ 
                              fontSize: '30px', 
                              fontWeight: 700, 
                              color: 'rgba(255,255,255,0.25)', 
                              textDecoration: 'line-through',
                              marginRight: '2px'
                            }}>
                              {card.oldPrice}
                            </span>
                            <span style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginRight: '2px' }}>
                              {selectedCountry.symbol}
                            </span>
                          </>
                        )}
                        
                        <span style={{ fontSize: card.price === 'Contact Us' ? '32px' : '44px', fontWeight: 800, color: '#ffffff' }}>
                          {card.price === '0' ? 'Free' : card.price}
                        </span>
                        
                        {card.price !== 'Contact Us' && (
                          <span style={{ 
                            fontSize: '11px', 
                            color: 'rgba(255,255,255,0.5)', 
                            marginLeft: '4px',
                            whiteSpace: 'nowrap'
                          }}>
                            {card.priceSubtext || `${selectedCountry.currency} / month`}
                          </span>
                        )}
                      </div>
                      
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.5', marginTop: '10px', fontWeight: 500 }}>{card.description}</p>
                    </div>

                    <button 
                      onClick={() => {
                        if (!card.isCurrent) {
                          setSelectedPlan(card);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '999px',
                        fontSize: '15px',
                        fontWeight: 700,
                        marginBottom: '20px', // Reduced gap
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
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginTop: '4px', marginBottom: '-4px' }}>{feature.text}</div>
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {billingPeriod === 'Personal' ? (
          <div style={{ 
            marginTop: '32px', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: '12px',
            textAlign: 'center'
          }}>
            <Users size={24} style={{ color: 'var(--on-surface-muted)' }} />
            <span style={{ fontSize: '15px', color: 'var(--on-surface-muted)', fontWeight: 500 }}>
              Need more capabilities for your business?
            </span>
            <button 
              onClick={() => setBillingPeriod('Business')}
              style={{ 
                color: 'var(--on-surface)', 
                fontSize: '15px', 
                fontWeight: 600, 
                textDecoration: 'underline',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              See Kyra Enterprise
            </button>
          </div>
        ) : (
          <div style={{ 
            marginTop: '32px', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: '12px',
            textAlign: 'center'
          }}>
            <Users size={24} style={{ color: 'var(--on-surface-muted)' }} />
            <span style={{ fontSize: '15px', color: 'var(--on-surface-muted)', fontWeight: 500 }}>
              Looking for personal plans?
            </span>
            <button 
              onClick={() => setBillingPeriod('Personal')}
              style={{ 
                color: 'var(--on-surface)', 
                fontSize: '15px', 
                fontWeight: 600, 
                textDecoration: 'underline',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              See Kyra Personal
            </button>
          </div>
        )}

        {/* Country Dropdown Selector */}
        {!isSuccess && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100000 }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: resolvedTheme === 'dark' ? '#2a2a2a' : '#ffffff',
                color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
                padding: '10px 18px',
                borderRadius: '999px',
                border: resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: resolvedTheme === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: '0.2s'
              }}
            >
              <span>{selectedCountry.name}</span>
              <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                bottom: '48px',
                right: 0,
                width: '200px',
                maxHeight: '260px',
                overflowY: 'auto',
                backgroundColor: resolvedTheme === 'dark' ? '#1e1e1e' : '#ffffff',
                border: resolvedTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                boxShadow: resolvedTheme === 'dark' ? '0 12px 32px rgba(0,0,0,0.4)' : '0 12px 32px rgba(0,0,0,0.1)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: selectedCountry.code === c.code 
                        ? (resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)') 
                        : 'transparent',
                      color: selectedCountry.code === c.code 
                        ? (resolvedTheme === 'dark' ? '#ffffff' : '#000000') 
                        : (resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'),
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: '0.2s'
                    }}
                  >
                    <span>{c.name}</span>
                    {selectedCountry.code === c.code && <Check size={14} style={{ color: '#5c5ce0' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '20px 24px', opacity: 0.5, fontSize: 13, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span>© 2026 Kyra Advanced Intelligence</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => {
              const now = Date.now().toString();
              localStorage.setItem('kyra_trial_countdown_start', now);
              window.location.reload();
            }}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', fontSize: '11px' }}
          >
            Reset 3-Day Timer (Show Free Offer)
          </button>
          <button 
            onClick={() => {
              const expiredTime = (Date.now() - 3 * 24 * 60 * 60 * 1000 - 1000).toString();
              localStorage.setItem('kyra_trial_countdown_start', expiredTime);
              window.location.reload();
            }}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', fontSize: '11px' }}
          >
            Force Expire Timer (Show Regular Prices)
          </button>
        </div>
      </footer>
    </div>
  );
}
