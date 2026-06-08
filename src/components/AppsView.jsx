'use client';

import React, { useState } from 'react';
import { Search, ChevronRight, ChevronLeft, LayoutGrid, Compass, Briefcase, Database, Heart, Palette, Globe, ExternalLink, Play, Pause, ChevronDown } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

// Detail data for all apps (rendered on the separate details page)
const appDetailsData = {
  canva: {
    category: 'Design',
    capabilities: 'Interactive, Creative',
    developer: 'Canva Pty Ltd',
    website: 'https://www.canva.com',
    version: '2.14.0',
    privacyPolicy: 'https://www.canva.com/policies/privacy-policy/',
    termsOfService: 'https://www.canva.com/policies/terms-of-use/',
    customerSupport: 'https://www.canva.com/help/',
    description: 'Canva for ChatGPT makes professional design and layout creation accessible to everyone directly inside your conversations. Access millions of beautiful templates for social media, presentations, flyers, banners, and resumes in seconds. Simply type to customize content, swap layouts, apply brand kits, and get beautiful design mockups. Kyra integrates with Canva\'s API to offer a seamless bridge from prompts to print-ready assets.',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400&q=80',
    promptText: 'create designs & flyers'
  },
  photoshop: {
    category: 'Design',
    capabilities: 'Interactive, Writes, Image-edit',
    developer: 'Adobe Inc',
    website: 'https://www.adobe.com/photoshop',
    version: '3.0.0',
    privacyPolicy: 'https://www.adobe.com/privacy.html',
    termsOfService: 'https://www.adobe.com/legal/terms.html',
    customerSupport: 'https://helpx.adobe.com/support/photoshop.html',
    cardBackground: 'linear-gradient(135deg, #ffedd5 0%, #cffafe 50%, #e0e7ff 100%)',
    description: 'Adobe Photoshop for ChatGPT makes powerful photo editing simple and free for everyone. Just upload a photo and transform it in seconds. Simply type to change backgrounds, add or remove objects, apply creative effects, or fine-tune lighting and color. Intuitive tools help you bring your vision to life with no editing experience required. From profile pictures to social posts to favorite snapshots, edit your images exactly how you want, just by chatting.',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    promptText: 'edit & enhance images'
  },
  figma: {
    category: 'Design',
    capabilities: 'Interactive, Writes, Wireframing',
    developer: 'Figma Inc',
    website: 'https://www.figma.com',
    version: '4.2.1',
    privacyPolicy: 'https://www.figma.com/privacy/',
    termsOfService: 'https://www.figma.com/terms/',
    customerSupport: 'https://help.figma.com',
    description: 'Figma for ChatGPT allows teams and individual creators to lay out vector flowcharts, design responsive wireframes, design mockups, and outline dynamic landing page mockups directly in a chat interface. Kyra connects with Figma API endpoints to fetch, organize, modify, or auto-generate wireframes and prototype structures. Whether brainstorming ideas or editing design variables, the Figma assistant translates prompts into structured artboard layers.',
    imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=400&q=80',
    promptText: 'generate wireframes & designs'
  },
  airtable: {
    category: 'Productivity',
    capabilities: 'Interactive, Writes, Databases',
    developer: 'Airtable Inc',
    website: 'https://www.airtable.com',
    version: '3.12.0',
    privacyPolicy: 'https://www.airtable.com/privacy',
    termsOfService: 'https://www.airtable.com/tos',
    customerSupport: 'https://support.airtable.com',
    description: 'Airtable for ChatGPT provides robust database modeling and workflow tracking in a natural language environment. Perfect for structuring sales pipelines, project boards, customer lists, and product inventories. Write formulas, generate custom automation scripts, view data fields, and perform queries directly through the Kyra interface. Connect with Airtable API schemas to update tables, sync items, and organize relational tables.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    promptText: 'manage databases & spreadsheets'
  },
  booking: {
    category: 'Lifestyle',
    capabilities: 'Interactive, Web-search, Travel-plans',
    developer: 'Booking.com',
    website: 'https://www.booking.com',
    version: '5.1.0',
    privacyPolicy: 'https://www.booking.com/content/privacy.html',
    termsOfService: 'https://www.booking.com/content/terms.html',
    customerSupport: 'https://www.booking.com/content/cs.html',
    description: 'Booking.com travel assistant helps you plan, search, and reserve accommodation, flights, and car rentals directly from ChatGPT. Type your travel dates, budget limits, destination preferences, or group sizes to get curated, real-time hotel options. Filter by customer reviews, amenities (like spa, breakfast, pool), proximity to local landmarks, and pricing. Let Kyra assist in structuring complete daily travel itineraries.',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
    promptText: 'find stays & hotels'
  },
  lovable: {
    category: 'Productivity',
    capabilities: 'Interactive, Writes, Full-code',
    developer: 'Lovable Inc',
    website: 'https://lovable.dev',
    version: '1.4.0',
    privacyPolicy: 'https://lovable.dev/privacy',
    termsOfService: 'https://lovable.dev/terms',
    customerSupport: 'https://lovable.dev/support',
    description: 'Lovable assistant builds full-stack React applications, static landing pages, and interactive dashboards from text prompts. Kyra links directly to the Lovable engine to compile, build, and deploy components on the fly. View React components, write styling variables, inspect mock tables, and ship live preview links. Drag and drop UI elements or edit code variables with ease.',
    imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=400&q=80',
    promptText: 'build React apps & pages'
  }
};

export default function AppsView() {
  const { setAppView, setChats, setActiveChatId, setMessages, chats, showLoggedIn, setAuthOpen } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Featured');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const totalSlides = 6;
  const timerRef = React.useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (isAutoplay) {
      timerRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }, 3000);
    }
  };

  React.useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoplay]);

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % totalSlides);
    resetTimer();
  };

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
    resetTimer();
  };

  const slides = [
    {
      appId: 'canva',
      appName: 'Canva',
      mentionPrefix: '@Canva',
      mentionText: 'create social posts',
      text: "Coming right up! Here are some social media posts with the Chopify Burgers' look and feel. Need me to resize them...",
      gradient: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #f59e0b 100%)',
      accentColor: '#00ffff',
      tagline: 'Make designs and flyers',
      logo: (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00c4cc, #7d2ae8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '28px',
          fontFamily: 'Georgia, serif',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          C
        </div>
      ),
      cards: [
        {
          element: (
            <div key="burger" style={{
              height: '150px',
              width: '150px',
              aspectRatio: '1',
              flexShrink: 0,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '10px',
              color: '#000000',
              fontFamily: 'system-ui',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundImage: 'repeating-linear-gradient(90deg, #dc2626 0px, #dc2626 4px, #ffffff 4px, #ffffff 8px)'
              }} />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                margin: '8px 0'
              }}>
                <span style={{ fontSize: '8px', fontWeight: 800, color: '#dc2626' }}>FLIPPIN'</span>
                <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '-0.3px' }}>DELICIOUS</span>
                <span style={{ fontSize: '8px', fontWeight: 800, color: '#dc2626' }}>BURGERS</span>
              </div>
              <div style={{
                width: '32px',
                height: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '1.5px',
                position: 'relative'
              }}>
                <div style={{ height: '7px', background: '#f59e0b', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }} />
                <div style={{ height: '2px', background: '#10b981' }} />
                <div style={{ height: '3px', background: '#dc2626' }} />
                <div style={{ height: '3px', background: '#facc15', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                <div style={{ height: '4px', background: '#78350f', borderRadius: '2px' }} />
                <div style={{ height: '4px', background: '#f59e0b', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '5px', color: '#737373', marginTop: '6px' }}>Order Online Now</span>
            </div>
          )
        },
        {
          element: (
            <div key="ice-cream" style={{
              height: '150px',
              width: '150px',
              aspectRatio: '1',
              flexShrink: 0,
              backgroundColor: '#dc2626',
              borderRadius: '12px',
              padding: '10px',
              color: '#ffffff',
              fontFamily: 'system-ui',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)'
              }} />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2
              }}>
                <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '-0.3px' }}>THE BIG</span>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#facc15' }}>CHOPPY</span>
              </div>
              <div style={{
                width: '18px',
                height: '32px',
                background: '#facc15',
                borderRadius: '8px 8px 2px 2px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                zIndex: 2,
                boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#dc2626'
                }} />
                <div style={{
                  width: '4px',
                  height: '10px',
                  background: '#d97706',
                  borderRadius: '2px',
                  transform: 'translateY(10px)'
                }} />
              </div>
              <span style={{ fontSize: '5px', color: '#facc15', zIndex: 2 }}>Crispy & Delicious</span>
            </div>
          )
        }
      ]
    },
    {
      appId: 'photoshop',
      appName: 'Adobe Photoshop',
      mentionPrefix: '@Adobe Photoshop',
      mentionText: 'add lens blur',
      text: "Applying professional lens blur to the background scene. The human subject is auto-detected and kept in sharp, crisp focus.",
      gradient: 'linear-gradient(135deg, #0f1e36 0%, #1e3a8a 50%, #3b82f6 100%)',
      accentColor: '#00c8ff',
      tagline: 'Edit and enhance images',
      logo: (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '12px',
          backgroundColor: '#001e36',
          border: '2.5px solid #00c8ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00c8ff',
          fontWeight: 'bold',
          fontSize: '22px',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          Ps
        </div>
      ),
      cards: [
        {
          element: (
            <div key="photoshop-main" style={{
              height: '180px',
              width: '234px',
              aspectRatio: '1.3',
              flexShrink: 0,
              backgroundImage: 'url("https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '12px',
              position: 'relative',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}>
              {/* Download Icon (Top Left) */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333',
                fontSize: '11px',
                cursor: 'pointer'
              }}>
                📥
              </div>
              {/* Settings Icon (Top Right) */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333',
                fontSize: '11px',
                cursor: 'pointer'
              }}>
                ⚙️
              </div>
            </div>
          )
        }
      ]
    },
    {
      appId: 'figma',
      appName: 'Figma',
      mentionPrefix: '@Figma',
      mentionText: 'generate wireframe',
      text: "Layout generated! I've loaded the structured navbar, hero banner, product grid and footer elements into your active frame.",
      gradient: 'linear-gradient(135deg, #2b1f1d 0%, #442621 50%, #b83b1d 100%)',
      accentColor: '#FF7262',
      tagline: 'Make diagrams and slides',
      logo: (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '12px',
          backgroundColor: '#1e1e1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <svg width="28" height="28" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 0C1.34315 0 0 1.34315 0 3C0 4.65685 1.34315 6 3 6H6V0H3Z" fill="#F24E1E" />
            <path d="M9 0C7.34315 0 6 1.34315 6 3C6 4.65685 7.34315 6 9 6C10.6569 6 12 4.65685 12 3C12 1.34315 10.6569 0 9 0Z" fill="#FF7262" />
            <path d="M3 6C1.34315 6 0 7.34315 0 9C0 10.6569 1.34315 12 3 12H6V6H3Z" fill="#A259FF" />
            <path d="M9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6Z" fill="#1ABCFE" />
            <path d="M3 12C1.34315 12 0 13.3431 0 15C0 16.6569 1.34315 18 3 18C4.65685 18 6 16.6569 6 15V12H3Z" fill="#0ACF83" />
          </svg>
        </div>
      ),
      cards: [
        {
          element: (
            <div key="figma-wire" style={{
              height: '180px',
              width: '234px',
              aspectRatio: '1.3',
              flexShrink: 0,
              backgroundColor: '#1e1e1e',
              borderRadius: '12px',
              padding: '10px',
              color: '#ffffff',
              fontFamily: 'system-ui',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '4px', fontSize: '7px', color: '#888' }}>
                <span>Desktop - 1440px</span>
                <span>100%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'center' }}>
                <div style={{ height: '6px', border: '1px dashed #555', borderRadius: '2px', display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                  <div style={{ width: '12px', height: '2px', background: '#555' }} />
                </div>
                <div style={{ height: '20px', border: '1px dashed #FF7262', borderRadius: '2px', backgroundColor: 'rgba(255,114,98,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2px' }}>
                  <div style={{ width: '20px', height: '3px', background: '#FF7262' }} />
                  <div style={{ width: '30px', height: '2px', background: '#555' }} />
                </div>
              </div>
              {/* cursor */}
              <div style={{ position: 'absolute', top: '25px', left: '40px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '10px' }}>🖱️</span>
                <span style={{ fontSize: '6px', background: '#FF7262', color: '#fff', padding: '1px 3px', borderRadius: '2px', fontWeight: 600 }}>Sarah</span>
              </div>
            </div>
          )
        }
      ]
    },
    {
      appId: 'airtable',
      appName: 'Airtable',
      mentionPrefix: '@Airtable',
      mentionText: 'create CRM table',
      text: "Relational database grid initialized. I've populated initial columns for Client Name, Deal Value, and Pipeline Status.",
      gradient: 'linear-gradient(135deg, #182238 0%, #1e1b4b 50%, #4338ca 100%)',
      accentColor: '#f82858',
      tagline: 'Add structured data to ChatGPT',
      logo: (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '12px',
          backgroundColor: '#fff0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f82858',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <Database size={26} />
        </div>
      ),
      cards: [
        {
          element: (
            <div key="airtable-grid" style={{
              height: '180px',
              width: '234px',
              aspectRatio: '1.3',
              flexShrink: 0,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '8px',
              color: '#333333',
              fontFamily: 'system-ui',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontSize: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', fontWeight: 'bold', color: '#64748b' }}>
                <div style={{ width: '40%' }}>Company</div>
                <div style={{ width: '30%' }}>Status</div>
                <div style={{ width: '30%', textAlign: 'right' }}>Value</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '40%', fontWeight: 600 }}>Acme Corp</div>
                  <div style={{ width: '30%' }}><span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', fontSize: '6px' }}>Negotiation</span></div>
                  <div style={{ width: '30%', textAlign: 'right', fontWeight: 600 }}>$24,000</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '2px' }}>
                  <div style={{ width: '40%', fontWeight: 600 }}>Globex Inc</div>
                  <div style={{ width: '30%' }}><span style={{ backgroundColor: '#dcfce7', color: '#22c55e', padding: '1px 4px', borderRadius: '4px', fontSize: '6px' }}>Won</span></div>
                  <div style={{ width: '30%', textAlign: 'right', fontWeight: 600 }}>$85,000</div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      appId: 'booking',
      appName: 'Booking.com',
      mentionPrefix: '@Booking.com',
      mentionText: 'find stays in Paris',
      text: "Found top recommended hotels. Stays are sorted by review score (9.0+) with options for free cancellation and breakfast included.",
      gradient: 'linear-gradient(135deg, #001b3d 0%, #003580 50%, #005bbf 100%)',
      accentColor: '#00ffff',
      tagline: 'Find stays and rental cars',
      logo: (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#003580',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '24px',
          fontFamily: 'Georgia, serif',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          B.
        </div>
      ),
      cards: [
        {
          element: (
            <div key="booking-card" style={{
              height: '180px',
              width: '234px',
              aspectRatio: '1.3',
              flexShrink: 0,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              color: '#333333',
              fontFamily: 'system-ui',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                height: '68%',
                backgroundImage: 'url("https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <span style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: '#003580', color: '#fff', fontSize: '7px', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>9.2 Superb</span>
              </div>
              <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#1a1a1a' }}>Hotel Ritz Paris</div>
                  <div style={{ fontSize: '7px', color: '#737373' }}>Paris • 0.5 km from center</div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      appId: 'lovable',
      appName: 'Lovable',
      mentionPrefix: '@Lovable',
      mentionText: 'build landing page',
      text: "React template successfully packaged and deployed. Live preview links and styling properties have been generated.",
      gradient: 'linear-gradient(135deg, #1e0b36 0%, #3b0764 50%, #701a75 100%)',
      accentColor: '#d946ef',
      tagline: 'Build apps and websites',
      logo: (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ff007f, #7f00ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <Heart size={24} fill="#ffffff" stroke="none" />
        </div>
      ),
      cards: [
        {
          element: (
            <div key="lovable-card" style={{
              height: '180px',
              width: '234px',
              aspectRatio: '1.3',
              flexShrink: 0,
              backgroundColor: '#180828',
              borderRadius: '12px',
              padding: '10px',
              color: '#f43f5e',
              fontFamily: 'system-ui',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid #d946ef33',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '8px', color: '#a78bfa', fontWeight: 600 }}>Lovable Engine</span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '25px', paddingBottom: '2px', borderBottom: '1px solid #d946ef33' }}>
                <div style={{ flex: 1, height: '40%', background: '#ec4899', borderRadius: '1px' }} />
                <div style={{ flex: 1, height: '70%', background: '#8b5cf6', borderRadius: '1px' }} />
                <div style={{ flex: 1, height: '90%', background: '#ff007f', borderRadius: '1px' }} />
              </div>
            </div>
          )
        }
      ]
    }
  ];

  const apps = [
    {
      id: 'canva',
      name: 'Canva',
      description: 'Search, create, edit designs',
      category: 'Featured',
      tagline: 'Search over 100M+ templates and design anything you need with Canva\'s premium assistant.',
      welcomeMessage: 'Hi! I\'m Canva. I can help you create designs, flyers, social posts, and templates. What are we designing today?',
      logo: (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00c4cc, #7d2ae8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '20px',
          fontFamily: 'Georgia, serif',
          flexShrink: 0
        }}>
          C
        </div>
      )
    },
    {
      id: 'photoshop',
      name: 'Adobe Photoshop',
      description: 'Edit & transform your images',
      category: 'Featured',
      tagline: 'Remove backgrounds, recolor images, resize canvas, and generate assets with Photoshop.',
      welcomeMessage: 'Welcome to Adobe Photoshop Assistant. I can help you with layer blending, mask selections, filter adjustments, and photo manipulations. How can I assist you with your image editing today?',
      logo: (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          backgroundColor: '#001e36',
          border: '2px solid #00c8ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00c8ff',
          fontWeight: 'bold',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif',
          flexShrink: 0
        }}>
          Ps
        </div>
      )
    },
    {
      id: 'figma',
      name: 'Figma',
      description: 'Make diagrams and slides',
      category: 'Featured',
      tagline: 'Convert UI designs to layouts, brainstorm, and create wireframes and slide decks.',
      welcomeMessage: 'Hi, I\'m Figma. Let\'s build design systems, align elements with Auto Layout, create components, or make wireframes together. What project are we designing?',
      logo: (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          backgroundColor: '#1e1e1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}>
          <svg width="22" height="22" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 0C1.34315 0 0 1.34315 0 3C0 4.65685 1.34315 6 3 6H6V0H3Z" fill="#F24E1E" />
            <path d="M9 0C7.34315 0 6 1.34315 6 3C6 4.65685 7.34315 6 9 6C10.6569 6 12 4.65685 12 3C12 1.34315 10.6569 0 9 0Z" fill="#FF7262" />
            <path d="M3 6C1.34315 6 0 7.34315 0 9C0 10.6569 1.34315 12 3 12H6V6H3Z" fill="#A259FF" />
            <path d="M9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6Z" fill="#1ABCFE" />
            <path d="M3 12C1.34315 12 0 13.3431 0 15C0 16.6569 1.34315 18 3 18C4.65685 18 6 16.6569 6 15V12H3Z" fill="#0ACF83" />
          </svg>
        </div>
      )
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Add structured data to ChatGPT',
      category: 'Productivity',
      tagline: 'Model relational databases, organize projects, build calendars, and generate API scripts.',
      welcomeMessage: 'Airtable database configured. I can help you design relational schemas, write formula fields, draft automation scripts, or query records. Let me know what data we are modeling.',
      logo: (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          backgroundColor: '#fff0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f82858',
          flexShrink: 0
        }}>
          <Database size={22} />
        </div>
      )
    },
    {
      id: 'booking',
      name: 'Booking.com',
      description: 'Find stays and rental cars',
      category: 'Lifestyle',
      tagline: 'Discover hotels, book homes, search rental cars, and plan customized travel itineraries.',
      welcomeMessage: 'Hi, I\'m your Booking.com travel assistant. I can search destinations, recommend hotel bookings, plan vacations, and structure travel plans. Where are you heading next?',
      logo: (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: '#003580',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '20px',
          fontFamily: 'Georgia, serif',
          flexShrink: 0
        }}>
          B.
        </div>
      )
    },
    {
      id: 'lovable',
      name: 'Lovable',
      description: 'Build apps and websites',
      category: 'Productivity',
      tagline: 'Ship clean React prototypes, UI designs, and production-ready static pages.',
      welcomeMessage: 'Hi! I\'m Lovable. I\'m ready to help you write elegant React components, design Tailwind layouts, and construct static sites. What type of web application are we building?',
      logo: (
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ff007f, #7f00ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}>
          <Heart size={20} fill="#ffffff" stroke="none" />
        </div>
      )
    }
  ];

  const handleStartAppChat = (app) => {
    const newId = `app-${app.id}-${Date.now()}`;
    const newChat = {
      id: newId,
      title: app.name,
      messages: [],
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      appId: app.id,
      isAppChat: true,
      needsIntro: true
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setMessages([]);
    setAppView('chat');
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Featured' ? true : app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: 'var(--bg-primary, #0d0d0d)',
      color: 'var(--on-surface, #ffffff)',
      overflowY: 'auto',
      padding: !showLoggedIn ? '80px 24px 40px' : '40px 24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {!showLoggedIn && (
        <>
          <div style={{ position: 'absolute', top: '16px', left: '20px', zIndex: 100 }}>
            <button 
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '8px 4px', borderRadius: 12, color: 'var(--on-surface)',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-overlay)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px', color: 'var(--on-surface)' }}>Kyra</span>
              <ChevronDown size={15} style={{ color: 'var(--on-surface-muted)', marginTop: 1 }} />
            </button>
          </div>
          <div style={{ position: 'absolute', top: '16px', right: '20px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setAuthOpen(true)}
              style={{ 
                padding: '8px 18px', borderRadius: '999px', fontSize: '15px', fontWeight: 500, 
                background: '#ffffff', color: '#000000', border: 'none', cursor: 'pointer', transition: 'all 0.2s' 
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              Log in
            </button>
            <button 
              onClick={() => setAuthOpen(true)}
              style={{ 
                padding: '8px 18px', borderRadius: '999px', fontSize: '15px', fontWeight: 500, 
                background: '#2a2a2a', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' 
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              Sign up for free
            </button>
          </div>
        </>
      )}
      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto 24px auto',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-0.5px'
          }}>Apps</h1>
          <p style={{
            color: 'var(--on-surface-muted, #a3a3a3)',
            fontSize: '15px',
            marginTop: '6px',
            marginBottom: 0
          }}>Chat with your favorite apps in Kyra</p>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '300px'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--on-surface-subtle, #737373)'
          }} />
          <input
            type="text"
            placeholder="Search apps"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-2, #1c1c1e)',
              border: '1px solid var(--divider, rgba(255, 255, 255, 0.1))',
              borderRadius: '24px',
              padding: '10px 16px 10px 42px',
              color: 'var(--on-surface, #ffffff)',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color, #6366f1)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--divider, rgba(255, 255, 255, 0.1))'}
          />
        </div>
      </div>

      {/* Featured App Slider Hero Card */}
      <div style={{
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto 36px auto',
        borderRadius: '28px',
        height: '400px',
        flexShrink: 0,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Gradients cross-fade */}
        {slides.map((slide, idx) => (
          <div
            key={`bg-${slide.appId}`}
            style={{
              position: 'absolute',
              inset: 0,
              background: slide.gradient,
              opacity: currentSlide === idx ? 1 : 0,
              transition: 'opacity 1.2s ease-in-out',
              zIndex: 0
            }}
          />
        ))}

        {/* Slides Content cross-fade */}
        {slides.map((slide, idx) => {
          const isActive = currentSlide === idx;
          return (
            <div
              key={`content-${slide.appId}`}
              style={{
                position: 'absolute',
                inset: 0,
                padding: '24px 36px',
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '32px',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1) translateY(0px)' : 'scale(0.98) translateY(5px)',
                transition: 'opacity 1.2s ease-in-out, transform 1.2s ease-in-out',
                pointerEvents: isActive ? 'auto' : 'none',
                zIndex: isActive ? 2 : 1
              }}
            >
              {/* Left Side Info */}
              <div style={{
                flex: '1 1 0%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                {slide.logo}

                <div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.5px'
                  }}>{`Create with ${slide.appName}`}</h2>
                  <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '16px',
                    margin: '8px 0 0 0',
                    fontWeight: 500
                  }}>{slide.tagline}</p>
                </div>

                <button
                  onClick={() => {
                    const activeApp = apps.find(a => a.id === slide.appId);
                    if (activeApp) handleStartAppChat(activeApp);
                  }}
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 28px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s, opacity 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  View
                </button>

                {/* Autoplay play/pause and indicator dots */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '4px'
                }}>
                  <button
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'}
                  >
                    {isAutoplay ? <Pause size={12} /> : <Play size={12} fill="#ffffff" />}
                  </button>
                  <div style={{
                    display: 'flex',
                    gap: '6px'
                  }}>
                    {Array.from({ length: totalSlides }).map((_, idx) => {
                      const isDotActive = currentSlide === idx;
                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlide(idx);
                            resetTimer();
                          }}
                          style={{
                            width: isDotActive ? '14px' : '6px',
                            height: '6px',
                            borderRadius: '3px',
                            backgroundColor: isDotActive ? (slide.accentColor || '#ffffff') : 'rgba(255, 255, 255, 0.3)',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Side Mockup Canvas */}
              <div style={{
                flex: '0 0 360px',
                maxWidth: '360px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}>
                {/* Top mention tag */}
                <div style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '6px 14px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ color: slide.accentColor || '#00ffff' }}>{slide.mentionPrefix}</span> {slide.mentionText}
                </div>

                {/* Cards preview block */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '180px'
                }}>
                  {slide.cards.map((card, idx) => (
                    <React.Fragment key={idx}>
                      {card.element}
                    </React.Fragment>
                  ))}
                </div>

                {/* Bottom response text */}
                <div style={{
                  fontSize: '13.5px',
                  color: '#e5e5e5',
                  lineHeight: '1.5',
                  fontWeight: 400,
                  minHeight: '40px'
                }}>
                  {slide.text}
                </div>

                {/* Next/Prev Arrow Controls overlayed on top of image */}
                <button
                  onClick={handlePrevSlide}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.55)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={handleNextSlide}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.55)';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Pills Navigation */}
      <div style={{
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto 24px auto',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--divider, rgba(255,255,255,0.1))',
        paddingBottom: '12px'
      }}>
        {['Featured', 'Lifestyle', 'Productivity'].map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                backgroundColor: isActive ? 'var(--surface-3, rgba(255,255,255,0.15))' : 'transparent',
                color: isActive ? 'var(--on-surface)' : 'var(--on-surface-muted, #a3a3a3)',
                border: 'none',
                borderRadius: '16px',
                padding: '6px 16px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                if(!isActive) e.currentTarget.style.color = 'var(--on-surface)';
              }}
              onMouseLeave={e => {
                if(!isActive) e.currentTarget.style.color = 'var(--on-surface-muted, #a3a3a3)';
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid List of Apps */}
      <div style={{
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '16px'
      }}>
        {filteredApps.map(app => (
          <div
            key={app.id}
            onClick={() => handleStartAppChat(app)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '20px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s'
            }}
            className="app-list-item"
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--surface-1, #171717)';
              e.currentTarget.style.borderColor = 'var(--divider, rgba(255, 255, 255, 0.08))';
              const chevron = e.currentTarget.querySelector('.app-chevron');
              if (chevron) {
                chevron.style.transform = 'translateX(3px)';
                chevron.style.color = 'var(--on-surface)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              const chevron = e.currentTarget.querySelector('.app-chevron');
              if (chevron) {
                chevron.style.transform = 'translateX(0px)';
                chevron.style.color = 'var(--on-surface-subtle, #737373)';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flex: 1,
              minWidth: 0
            }}>
              {app.logo}

              <div style={{
                flex: 1,
                minWidth: 0
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--on-surface)'
                }}>{app.name}</h3>
                <p style={{
                  fontSize: '13.5px',
                  color: 'var(--on-surface-muted, #a3a3a3)',
                  margin: '4px 0 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{app.description}</p>
              </div>
            </div>

            <ChevronRight
              size={18}
              className="app-chevron"
              style={{
                color: 'var(--on-surface-subtle, #737373)',
                transition: 'transform 0.2s, color 0.2s',
                marginLeft: '12px',
                flexShrink: 0
              }}
            />
          </div>
        ))}
      </div>

      {/* Styled Responsive overrides using CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .app-list-item {
            padding: 16px 20px !important;
          }
        }
        @media (max-width: 550px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
