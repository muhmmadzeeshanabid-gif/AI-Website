'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Image, Mic, ArrowUp, ChevronLeft, ChevronRight, Download, Maximize2, X, Sparkles, Upload, Link2, Crop, ChevronDown, MoreHorizontal, Palette, Paintbrush, Undo, Redo } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { safeSetLocalStorageItem } from '@/utils/storage';

export default function ImagesView() {
  const { 
    accentColor, 
    editingImage, 
    setEditingImage, 
    activeEditImage, 
    setActiveEditImage, 
    setAppView, 
    setMessages, 
    setActiveChatId, 
    setChats 
  } = useAppContext();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [activeShareImage, setActiveShareImage] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  // States for the newly added interactive Editor view
  const [editPrompt, setEditPrompt] = useState('');
  const [isApplyingEdits, setIsApplyingEdits] = useState(false);
  const [shareModalState, setShareModalState] = useState('closed'); // 'closed', 'open', 'closing'
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#e25c1d');
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawHistory, setDrawHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const drawCanvasRef = useRef(null);

  const [isCroppingMode, setIsCroppingMode] = useState(false);
  const [cropBox, setCropBox] = useState({ left: 10, top: 10, width: 80, height: 80 });
  const [dragStart, setDragStart] = useState(null);
  const cropImageRef = useRef(null);

  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
  const aspectDropdownRef = useRef(null);

  const [activeAspectRatio, setActiveAspectRatio] = useState('free');
  const [selectedEditorImage, setSelectedEditorImage] = useState(null);
  const editorFileInputRef = useRef(null);

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (aspectDropdownRef.current && !aspectDropdownRef.current.contains(e.target)) {
        setShowAspectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Global mousemove/mouseup window event listener for resizing/dragging the crop box
  React.useEffect(() => {
    if (!dragStart) return;

    const handleMouseMove = (e) => {
      if (!cropImageRef.current) return;
      const img = cropImageRef.current;
      const rect = img.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((clientY - dragStart.y) / rect.height) * 100;

      const { type, startBox } = dragStart;

      if (type === 'center') {
        const left = Math.max(0, Math.min(100 - startBox.width, startBox.left + deltaX));
        const top = Math.max(0, Math.min(100 - startBox.height, startBox.top + deltaY));
        setCropBox({ ...startBox, left, top });
      } else if (type === 'top-left') {
        const left = Math.max(0, Math.min(startBox.left + startBox.width - 10, startBox.left + deltaX));
        const top = Math.max(0, Math.min(startBox.top + startBox.height - 10, startBox.top + deltaY));
        const width = startBox.left + startBox.width - left;
        const height = startBox.top + startBox.height - top;
        setCropBox({ left, top, width, height });
      } else if (type === 'top-right') {
        const top = Math.max(0, Math.min(startBox.top + startBox.height - 10, startBox.top + deltaY));
        const width = Math.max(10, Math.min(100 - startBox.left, startBox.width + deltaX));
        const height = startBox.top + startBox.height - top;
        setCropBox({ left: startBox.left, top, width, height });
      } else if (type === 'bottom-left') {
        const left = Math.max(0, Math.min(startBox.left + startBox.width - 10, startBox.left + deltaX));
        const width = startBox.left + startBox.width - left;
        const height = Math.max(10, Math.min(100 - startBox.top, startBox.height + deltaY));
        setCropBox({ left, top: startBox.top, width, height });
      } else if (type === 'bottom-right') {
        const width = Math.max(10, Math.min(100 - startBox.left, startBox.width + deltaX));
        const height = Math.max(10, Math.min(100 - startBox.top, startBox.height + deltaY));
        setCropBox({ ...startBox, width, height });
      }
    };

    const handleMouseUp = () => {
      setDragStart(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragStart]);

  const executeCrop = () => {
    if (!cropImageRef.current) return;
    
    // Create a new canvas to draw the cropped image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const sourceImg = new window.Image();
    sourceImg.src = activeEditImage.url;
    sourceImg.onload = () => {
      const naturalW = sourceImg.naturalWidth;
      const naturalH = sourceImg.naturalHeight;
      
      const cropX = (cropBox.left / 100) * naturalW;
      const cropY = (cropBox.top / 100) * naturalH;
      const cropW = (cropBox.width / 100) * naturalW;
      const cropH = (cropBox.height / 100) * naturalH;
      
      // Limit resolution to a max dimension of 800px for space efficiency in localStorage
      const maxDimension = 800;
      let targetW = cropW;
      let targetH = cropH;
      if (cropW > maxDimension || cropH > maxDimension) {
        if (cropW > cropH) {
          targetW = maxDimension;
          targetH = (cropH / cropW) * maxDimension;
        } else {
          targetH = maxDimension;
          targetW = (cropW / cropH) * maxDimension;
        }
      }
      
      canvas.width = targetW;
      canvas.height = targetH;
      
      ctx.drawImage(sourceImg, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
      
      // Export as JPEG at 0.85 quality to save massive local storage space
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      // Update active image URL
      const updatedImage = {
        ...activeEditImage,
        url: dataUrl
      };
      
      setActiveEditImage(updatedImage);
      
      // Update the image list myImages
      setMyImages(prev => prev.map(img => img.id === activeEditImage.id ? updatedImage : img));
      
      setIsCroppingMode(false);
      exitSelectionMode(); // Exit selection mode too when cropped successfully
      showToast("Image cropped and saved successfully!");
    };
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setDrawHistory([]);
    setRedoHistory([]);
    setShowColorPopover(false);
  };

  const handlePlusClick = () => {
    if (editorFileInputRef.current) {
      editorFileInputRef.current.click();
    }
  };

  const handleEditorFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedEditorImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Initialize canvas size when selection mode opens or active image changes
  React.useEffect(() => {
    if (isSelectionMode && drawCanvasRef.current) {
      const canvas = drawCanvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Re-draw last history state if it exists
      if (drawHistory.length > 0) {
        ctx.putImageData(drawHistory[drawHistory.length - 1], 0, 0);
      }
    }
  }, [isSelectionMode, activeEditImage, brushColor, drawHistory, activeAspectRatio]);

  const startDrawing = (e) => {
    if (!drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Prevent scrolling while drawing
    if (e.cancelable) e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (e.cancelable) e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && drawCanvasRef.current) {
      setIsDrawing(false);
      const canvas = drawCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawHistory(prev => [...prev, state]);
      setRedoHistory([]);
    }
  };

  const handleUndo = () => {
    if (!drawCanvasRef.current || drawHistory.length === 0) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const newHistory = [...drawHistory];
    const poppedState = newHistory.pop();
    setRedoHistory(prev => [...prev, poppedState]);
    setDrawHistory(newHistory);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (newHistory.length > 0) {
      ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
    }
  };

  const handleRedo = () => {
    if (!drawCanvasRef.current || redoHistory.length === 0) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const newRedo = [...redoHistory];
    const stateToRestore = newRedo.pop();
    setRedoHistory(newRedo);
    setDrawHistory(prev => [...prev, stateToRestore]);
    
    ctx.putImageData(stateToRestore, 0, 0);
  };

  // List of initial grid images matching the mockup
  const [myImages, setMyImages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura-my-images');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse aura-my-images:", e);
        }
      }
    }
    return [
      { id: 'img-1', url: '/my_ai_assistant.png', prompt: 'Futuristic dark blue cybernetic AI robot assistant logo layout' },
      { id: 'img-2', url: '/my_couple_heart.png', prompt: 'Romantic portrait of a couple inside a decorated golden heart frame' },
      { id: 'img-3', url: '/app_design.png', prompt: 'Sleek colorful mobile UI app dashboard layout mockup' },
      { id: 'img-4', url: '/my_pizza.png', prompt: 'Delicious gourmet Italian pizza with melting mozzarella cheese' },
      { id: 'img-5', url: '/wanderlust.png', prompt: 'Wanderlust explorer mountain landscape painting' },
      { id: 'img-6', url: '/my_zypher_logo.png', prompt: 'Modern futuristic brand logo with a glowing purple and cyan Z' },
      { id: 'img-7', url: '/chibi_stickers.png', prompt: 'Cute chibi style sticker pack designs' },
      { id: 'img-8', url: '/makeup_guide.png', prompt: 'High-fashion beauty makeup guide eyeshadow palette details' }
    ];
  });

  useEffect(() => {
    const result = safeSetLocalStorageItem('aura-my-images', myImages);
    if (result && JSON.stringify(result) !== JSON.stringify(myImages)) {
      setMyImages(result);
    }
  }, [myImages]);

  // Carousel card styles
  const styles = [
    { id: 'makeup', label: 'Makeup guide', image: '/makeup_guide.png', prompt: 'Create a high-fashion cosmetic makeup guide showing eyeshadow, blush details, soft warm lighting' },
    { id: 'cross', label: 'Cross-section', image: '/cross_section.png', prompt: 'Create a technical cross-section schematic drawing of a modern wireless earbud earphone' },
    { id: 'app', label: 'App design', image: '/app_design.png', prompt: 'Create a sleek dark UI mobile dashboard application layout design mockup' },
    { id: 'anime', label: 'Anime comic', image: '/anime_comic.png', prompt: 'Create an anime manga style comic book page panel with a boy and a black cat' },
    { id: 'mini', label: 'Mini me', image: '/mini_me.png', prompt: 'Create a 3D claymation miniature model figurine of a person holding a coffee cup' },
    { id: 'ai-assistant', label: 'AI Assistant', image: '/my_ai_assistant.png', prompt: 'Create a futuristic dark blue cybernetic AI robot assistant logo layout' },
    { id: 'couple-heart', label: 'Gold portrait', image: '/my_couple_heart.png', prompt: 'Create a romantic portrait of a couple inside a decorated golden heart frame' },
    { id: 'pizza-style', label: 'Food promo', image: '/my_pizza.png', prompt: 'Create a delicious gourmet Italian pizza with melting mozzarella cheese' },
    { id: 'zypher-logo', label: 'Logo design', image: '/my_zypher_logo.png', prompt: 'Create a modern futuristic brand logo with a glowing purple and cyan letter Z' },
    { id: 'wanderlust-style', label: 'Landscape art', image: '/wanderlust.png', prompt: 'Create a wanderlust explorer mountain landscape digital painting' },
    { id: 'chibi-stickers', label: 'Chibi stickers', image: '/chibi_stickers.png', prompt: 'Create a sheet of cute chibi style sticker designs' },
    { id: 'desk-setup', label: 'Desk setup', image: '/explore/desk.jpg', prompt: 'Create a sleek minimal workspace desk setup with a mechanical keyboard, warm ambient light, clean aesthetic' },
    { id: 'disco-lights', label: 'Disco theme', image: '/explore/disco.jpg', prompt: 'Create a vibrant disco dance floor with neon colorful lights, retro 80s synthwave vibe' },
    { id: 'scribble-art', label: 'Scribble art', image: '/explore/scribble.jpg', prompt: 'Create an expressive colorful scribble art portrait with chaotic abstract lines' },
    { id: 'wanderlust-photo', label: 'Scenic travel', image: '/explore/wanderlust.jpg', prompt: 'Create a breathtaking scenic view of misty mountains during sunrise, travel adventure photography' },
    { id: 'scribble-sketch', label: 'Scribble sketch', image: '/scribble.png', prompt: 'Create a detailed hand-drawn pencil scribble sketch of an old town alleyway' }
  ];

  const carouselRef = useRef(null);

  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const openShare = (image) => {
    setActiveShareImage(image);
    setShareModalState('open');
  };

  const closeShare = () => {
    setShareModalState('closing');
    setTimeout(() => {
      setActiveShareImage(null);
      setShareModalState('closed');
    }, 750); // 750ms transition time
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const userPrompt = prompt.trim();

    // After 2.5 seconds, append a matching simulated image based on keywords
    setTimeout(() => {
      let finalUrl = '/wanderlust.png'; // default fallback
      const lowerPrompt = userPrompt.toLowerCase();

      if (lowerPrompt.includes('pizza') || lowerPrompt.includes('food')) {
        finalUrl = '/my_pizza.png';
      } else if (lowerPrompt.includes('makeup') || lowerPrompt.includes('cosmetic') || lowerPrompt.includes('beauty')) {
        finalUrl = '/makeup_guide.png';
      } else if (lowerPrompt.includes('earbud') || lowerPrompt.includes('earphone') || lowerPrompt.includes('cross')) {
        finalUrl = '/cross_section.png';
      } else if (lowerPrompt.includes('app') || lowerPrompt.includes('dashboard') || lowerPrompt.includes('ui')) {
        finalUrl = '/app_design.png';
      } else if (lowerPrompt.includes('anime') || lowerPrompt.includes('manga') || lowerPrompt.includes('cat')) {
        finalUrl = '/anime_comic.png';
      } else if (lowerPrompt.includes('mini') || lowerPrompt.includes('clay')) {
        finalUrl = '/mini_me.png';
      } else if (lowerPrompt.includes('logo') || lowerPrompt.includes('zypher') || lowerPrompt.includes('brand')) {
        finalUrl = '/my_zypher_logo.png';
      } else if (lowerPrompt.includes('couple') || lowerPrompt.includes('heart') || lowerPrompt.includes('gold')) {
        finalUrl = '/my_couple_heart.png';
      } else if (lowerPrompt.includes('sticker') || lowerPrompt.includes('chibi')) {
        finalUrl = '/chibi_stickers.png';
      } else {
        // Randomly pick one of the generated style images
        const assets = ['/makeup_guide.png', '/cross_section.png', '/app_design.png', '/anime_comic.png', '/mini_me.png', '/my_ai_assistant.png', '/my_couple_heart.png', '/my_pizza.png', '/my_zypher_logo.png'];
        finalUrl = assets[Math.floor(Math.random() * assets.length)];
      }

      const newImage = {
        id: `img-gen-${Date.now()}`,
        url: finalUrl,
        prompt: userPrompt
      };

      setMyImages(prev => [newImage, ...prev]);
      setIsGenerating(false);
      setPrompt('');
    }, 2200);
  };

  const handleDownload = (e, url, filename) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'generated_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper component to render the custom, animated share modal
  const renderShareModal = () => {
    if (!activeShareImage) return null;
    return (
      <div
        onClick={closeShare}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)', // Lighter overlay backdrop color
          backdropFilter: 'blur(3px)', // Lighter blur as requested
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.25s ease-out',
          padding: '24px'
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            // Applies bottom-enter slide-up and left-exit slide/tilt animations
            animation: shareModalState === 'closing' 
              ? 'shareExitLeft 0.75s cubic-bezier(0.32, 0, 0.67, 0) forwards' 
              : 'shareSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Header Title / Close bar */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 32px 16px 32px',
              gap: '16px'
            }}
          >
            <h3 
              style={{ 
                margin: 0, 
                fontSize: '22px', 
                fontWeight: 600, 
                color: '#ffffff',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: '1.2'
              }}
            >
              {activeShareImage.prompt}
            </h3>
            
            <button
              type="button"
              onClick={closeShare}
              style={{
                background: 'none',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '10px',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#ffffff';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.background = 'none';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 32px' }} />

          {/* Framed Image Container */}
          <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center', background: 'transparent' }}>
            <div 
              style={{
                background: '#ffffff',
                padding: '8px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                width: 'fit-content'
              }}
            >
              <div 
                style={{
                  background: '#000000',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <img 
                  src={activeShareImage.url} 
                  alt={activeShareImage.prompt}
                  style={{ 
                    maxHeight: '260px', 
                    maxWidth: '100%', 
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '16px 32px 32px 32px',
              gap: '12px'
            }}
          >
            {/* Button 1: Copy link */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + activeShareImage.url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#e25c1d',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background 0.2s',
                  boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)',
                  margin: '0 auto'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Link2 size={22} />
              </button>
              <span style={{ fontSize: '12.5px', color: '#9ca3af', fontWeight: 500, textAlign: 'center' }}>
                {copied ? 'Copied!' : 'Copy link'}
              </span>
            </div>

            {/* Button 2: X */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this AI generated image: ' + activeShareImage.prompt)}&url=${encodeURIComponent(window.location.origin + activeShareImage.url)}`, '_blank');
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#e25c1d',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background 0.2s',
                  boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)',
                  margin: '0 auto'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <span style={{ fontSize: '12.5px', color: '#9ca3af', fontWeight: 500, textAlign: 'center' }}>X</span>
            </div>

            {/* Button 3: LinkedIn */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + activeShareImage.url)}`, '_blank');
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#e25c1d',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background 0.2s',
                  boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)',
                  margin: '0 auto'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <span style={{ fontSize: '12.5px', color: '#9ca3af', fontWeight: 500, textAlign: 'center' }}>LinkedIn</span>
            </div>

            {/* Button 4: Reddit */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={() => {
                  window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.origin + activeShareImage.url)}&title=${encodeURIComponent(activeShareImage.prompt)}`, '_blank');
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#e25c1d',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background 0.2s',
                  boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)',
                  margin: '0 auto'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.68-6.24-1.78l1.3-4.1 4.26 1c.06 1.12.98 2 2.12 2 1.24 0 2.25-1.01 2.25-2.25S19.24 3 18 3c-1 0-1.84.66-2.13 1.58l-4.72-1.1c-.26-.06-.52.1-.59.36l-1.44 4.54C6.67 7.42 4.4 8.08 2.74 9.1 2.18 8.34 1.27 7.86.3 7.86a3 3 0 0 0-3 3c0 1.22.74 2.28 1.8 2.74a4.42 4.42 0 0 0-.08.6c0 3.65 4.57 6.63 10.2 6.63s10.2-2.98 10.2-6.63c0-.2-.03-.4-.08-.6 1.06-.46 1.8-1.52 1.8-2.74zm-18.75 1a1.25 1.25 0 1 1 1.25 1.25c-.69 0-1.25-.56-1.25-1.25zm10.75 3.3c-1.34 1.34-3.88 1.34-5.22 0a.49.49 0 0 1 0-.7.49.49 0 0 1 .7 0c.93.93 2.87.93 3.8 0a.49.49 0 0 1 .7.7zM16.72 12.5a1.25 1.25 0 1 1 1.25-1.25 1.25 1.25 0 0 1-1.25 1.25z"/>
                </svg>
              </button>
              <span style={{ fontSize: '12.5px', color: '#9ca3af', fontWeight: 500, textAlign: 'center' }}>Reddit</span>
            </div>

            {/* Button 5: Download */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <button
                type="button"
                onClick={(e) => handleDownload(e, activeShareImage.url, `${activeShareImage.id}.png`)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#e25c1d',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background 0.2s',
                  boxShadow: '0 4px 12px rgba(226, 92, 29, 0.3)',
                  margin: '0 auto'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Download size={22} />
              </button>
              <span style={{ fontSize: '12.5px', color: '#9ca3af', fontWeight: 500, textAlign: 'center' }}>Download</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (editingImage) {
    return (
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: '#121214',
          color: '#f3f4f6',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Top bar */}
        <div 
          style={{
            height: '60px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'transparent',
            flexShrink: 0
          }}
        >
          {isSelectionMode ? (
            <>
              {/* Left section: Close and Title for Selection Mode, plus Crop/Color sub-options */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  onClick={exitSelectionMode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  <X size={20} />
                </button>
                <span style={{ fontSize: '15px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: '#ffffff' }}>
                  Edit selection
                </span>

                {/* Sub-toolbar inside selection mode: Color selection */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '12px' }}>
                  {/* Color picker */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setShowColorPopover(!showColorPopover)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '16px',
                        padding: '5px 12px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    >
                      <span 
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          background: brushColor,
                          border: '1px solid rgba(255, 255, 255, 0.3)' 
                        }} 
                      />
                      <span>Color</span>
                      <ChevronDown size={12} style={{ opacity: 0.7 }} />
                    </button>

                    {showColorPopover && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '32px',
                          left: 0,
                          background: '#1c1c1e',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '12px',
                          padding: '8px',
                          display: 'flex',
                          gap: '6px',
                          zIndex: 600,
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        {['#e25c1d', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ffffff'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setBrushColor(c);
                              setShowColorPopover(false);
                            }}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: c,
                              border: brushColor === c ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                              cursor: 'pointer',
                              padding: 0,
                              boxSizing: 'border-box',
                              transition: 'transform 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right section: Undo, Redo, Cancel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={drawHistory.length === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: drawHistory.length === 0 ? 'rgba(255, 255, 255, 0.25)' : '#9ca3af',
                    cursor: drawHistory.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => { if (drawHistory.length > 0) e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={e => { if (drawHistory.length > 0) e.currentTarget.style.color = '#9ca3af'; }}
                >
                  <Undo size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoHistory.length === 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: redoHistory.length === 0 ? 'rgba(255, 255, 255, 0.25)' : '#9ca3af',
                    cursor: redoHistory.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => { if (redoHistory.length > 0) e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={e => { if (redoHistory.length > 0) e.currentTarget.style.color = '#9ca3af'; }}
                >
                  <Redo size={18} />
                </button>

                <button
                  type="button"
                  onClick={exitSelectionMode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Left section: Close */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => { setEditingImage(null); exitSelectionMode(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Right section: Select, Aspect ratio, Share, Download, Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsSelectionMode(true)}
                  style={{
                    background: '#000000',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    borderRadius: '18px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#000000';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  {/* Edit Pencil icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  <span>Edit</span>
                </button>

                <div ref={aspectDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowAspectDropdown(!showAspectDropdown)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '18px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                  >
                    {/* Rectangle outline style icon for Aspect Ratio */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    </svg>
                    <span>Aspect ratio</span>
                    <ChevronDown size={12} style={{ opacity: 0.7 }} />
                  </button>

                  {showAspectDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '38px',
                        left: 0,
                        width: '290px',
                        background: '#232325',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '18px',
                        padding: '20px',
                        zIndex: 600,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.55)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ color: '#ffffff', fontSize: '13.5px', fontWeight: 500, lineHeight: '1.45', opacity: 0.9 }}>
                        Generate this image with a different aspect ratio
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                          { label: 'Square', ratio: '1:1', icon: (
                            <div style={{ width: '15px', height: '15px', borderRadius: '3px', border: '1.8px solid currentColor', opacity: 0.8 }} />
                          )},
                          { label: 'Portrait', ratio: '3:4', icon: (
                            <div style={{ width: '12px', height: '16px', borderRadius: '3px', border: '1.8px solid currentColor', opacity: 0.8 }} />
                          )},
                          { label: 'Story', ratio: '9:16', icon: (
                            <div style={{ width: '10px', height: '18px', borderRadius: '3px', border: '1.8px solid currentColor', opacity: 0.8 }} />
                          )},
                          { label: 'Landscape', ratio: '4:3', icon: (
                            <div style={{ width: '16px', height: '12px', borderRadius: '3px', border: '1.8px solid currentColor', opacity: 0.8 }} />
                          )},
                          { label: 'Widescreen', ratio: '16:9', icon: (
                            <div style={{ width: '18px', height: '10px', borderRadius: '3px', border: '1.8px solid currentColor', opacity: 0.8 }} />
                          )}
                        ].map(r => (
                          <div
                            key={r.ratio}
                            onClick={() => {
                              const newChatId = `aspect-${Date.now()}`;
                              const userMessage = { 
                                role: 'user', 
                                content: `![${activeEditImage.prompt || 'source_image.png'}|${activeEditImage.id}](${activeEditImage.url}) Make the aspect ratio ${r.ratio}`, 
                                id: `user-${Date.now()}`, 
                                sender: { displayName: 'Guest', avatar: null },
                                timestamp: new Date().toISOString()
                              };
                               const aiMessage = {
                                role: 'ai',
                                id: `ai-aspect-${Date.now()}`,
                                content: `Here is the image cropped to ${r.ratio} aspect ratio.`,
                                isAspectGeneration: true,
                                ratio: r.ratio,
                                imageUrl: activeEditImage.url || '',
                                prompt: activeEditImage.prompt || null,
                                imageId: activeEditImage.id || '',
                                timestamp: new Date().toISOString()
                              };
                              const newChat = { 
                                id: newChatId, 
                                title: `Aspect Ratio ${r.ratio}`, 
                                messages: [userMessage, aiMessage], 
                                timestamp: new Date().toISOString() 
                              };
                              
                              setEditingImage(null);
                              setShowAspectDropdown(false);
                              setAppView('chat');
                              setChats(prev => [newChat, ...prev.filter(c => c.messages.length > 0)]);
                              setActiveChatId(newChatId);
                              setMessages([userMessage, aiMessage]);
                              localStorage.setItem('aura-active-chat-id', newChatId);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              color: '#e5e7eb'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#e5e7eb';
                            }}
                          >
                            <div style={{ width: '22px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', color: '#9ca3af' }}>
                              {r.icon}
                            </div>
                            <span style={{ fontSize: '13.5px', fontWeight: 500 }}>
                              {r.label} <span style={{ color: '#71717a', marginLeft: '4px' }}>{r.ratio}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openShare(activeEditImage)}
                  style={{
                    background: '#ffffff',
                    border: 'none',
                    color: '#18181b',
                    borderRadius: '18px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownload(e, activeEditImage.url, `${activeEditImage.id}.png`)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                >
                  <Download size={15} />
                </button>

                <button
                  type="button"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                >
                  <MoreHorizontal size={15} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Main Work Area */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
          {/* Left Thumbnail stack */}
          <div 
            style={{
              width: '80px',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 0',
              flexShrink: 0,
              justifyContent: 'flex-end',
              height: '100%'
            }}
          >
            {/* Scrollable container showing max 4 thumbnails at the bottom */}
            <div 
              style={{
                width: '100%',
                maxHeight: '228px', // Shows exactly 4 thumbnails (4 * 48px + 3 * 12px gap = 228px)
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '4px 0',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              className="hide-scrollbar"
            >
              {myImages.map((img) => {
                const isSelected = img.id === activeEditImage.id;
                return (
                  <div
                    key={img.id}
                    onClick={() => setActiveEditImage(img)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.15)',
                      transition: 'border-color 0.2s',
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Canvas */}
          <div 
            style={{
              flex: 1,
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {toastMessage && (
              <div 
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(30, 30, 32, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  zIndex: 1000,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                {toastMessage}
              </div>
            )}

            {isApplyingEdits ? (
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#9ca3af'
                }}
              >
                <div 
                  className="shimmer-bg" 
                  style={{ 
                    width: '280px', 
                    aspectRatio: '1.3', 
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)' 
                  }} 
                />
                <span style={{ fontSize: '13px', fontWeight: 500 }} className="animate-pulse">Applying edits...</span>
              </div>
            ) : (
              <div 
                style={{
                  background: 'transparent',
                  padding: '0',
                  borderRadius: '0',
                  boxShadow: 'none',
                  maxWidth: '90%',
                  maxHeight: '80%'
                }}
              >
                <div 
                  style={{
                    background: 'transparent',
                    padding: '0',
                    borderRadius: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <img 
                    src={activeEditImage.url} 
                    alt={activeEditImage.prompt}
                    style={{ 
                      maxHeight: '60vh', 
                      maxWidth: '100%', 
                      aspectRatio: activeAspectRatio !== 'free' ? activeAspectRatio.replace(':', '/') : 'auto',
                      objectFit: activeAspectRatio !== 'free' ? 'cover' : 'contain',
                      borderRadius: '0',
                      transition: 'all 0.3s ease',
                      display: 'block'
                    }}
                  />
                  {isSelectionMode && (
                    <canvas
                      ref={drawCanvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        cursor: 'crosshair',
                        borderRadius: '0',
                        zIndex: 10
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Bottom edit console wrapper */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 48px)',
                maxWidth: '640px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                alignItems: 'stretch',
                zIndex: 100
              }}
            >
              {/* Selected image preview above the input */}
              {selectedEditorImage && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    position: 'relative',
                    background: 'rgba(30, 30, 32, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}
                >
                  <img
                    src={selectedEditorImage}
                    alt="Attachment preview"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedEditorImage(null)}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={editorFileInputRef}
                onChange={handleEditorFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if ((!editPrompt.trim() && !selectedEditorImage) || isApplyingEdits) return;
                  setIsApplyingEdits(true);
                  setTimeout(() => {
                    setIsApplyingEdits(false);
                    setEditPrompt('');
                    setSelectedEditorImage(null);
                  }, 2000);
                }}
                style={{
                  background: 'rgba(30, 30, 32, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '6px 6px 6px 16px',
                  height: '54px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  width: '100%'
                }}
              >
                <button
                  type="button"
                  onClick={handlePlusClick}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    transition: 'all 0.2s',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#9ca3af';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
                <input 
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Describe edits"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    width: '100%'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
                  <button
                    type="button"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'transparent',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Mic size={15} />
                  </button>
                  <button
                    type="submit"
                    disabled={(!editPrompt.trim() && !selectedEditorImage) || isApplyingEdits}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: (!editPrompt.trim() && !selectedEditorImage) ? 'rgba(255, 255, 255, 0.05)' : (accentColor || '#3b82f6'),
                      border: 'none',
                      color: '#ffffff',
                      cursor: (!editPrompt.trim() && !selectedEditorImage) || isApplyingEdits ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <ArrowUp size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Share modal rendered within Editor */}
        {renderShareModal()}
      </div>
    );
  }

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100%',
        width: '100%',
        background: '#0a0a0c', // Dark slate background matching mockup
        color: '#f3f4f6',
        fontFamily: "'Inter', sans-serif",
        padding: '40px 24px',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shareSlideUp {
          0% { transform: translateY(100vh); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes shareExitLeft {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(-30px, 100vh) rotate(-12deg); opacity: 0; }
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .shimmer-bg {
          background: linear-gradient(110deg, #161618 8%, #252528 18%, #161618 33%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* Page Title Header */}
      <div 
        style={{
          width: '100%',
          maxWidth: '760px',
          textAlign: 'left',
          marginBottom: '20px',
          animation: 'fadeIn 0.5s ease-out',
          flexShrink: 0
        }}
      >
        <h1 
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '32px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(180deg, #ffffff 0%, #e5e7eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px'
          }}
        >
          Images
        </h1>
      </div>

      {/* Input console form */}
      <form 
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '760px',
          background: 'rgba(24, 24, 27, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '28px',
          padding: '6px 6px 6px 18px',
          height: '52px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '36px',
          transition: 'all 0.3s ease',
          flexShrink: 0
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.2)';
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
        }}
      >
        <Image size={20} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input 
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a new image"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f9fafb',
            fontSize: '16px',
            width: '100%',
            fontWeight: 400,
            height: '100%'
          }}
        />
        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
          <button
            type="button"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              color: 'var(--on-surface-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--hover-overlay)';
              e.currentTarget.style.color = 'var(--on-surface)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--on-surface-muted)';
            }}
          >
            <Mic size={16} />
          </button>
          
          <button
            type={prompt.trim() ? "submit" : "button"}
            disabled={!prompt.trim() || isGenerating}
            style={{ 
              background: !prompt.trim() ? 'var(--hover-overlay-2)' : (accentColor || '#3b82f6'),
              color: !prompt.trim() ? 'var(--on-surface-subtle)' : '#ffffff',
              cursor: !prompt.trim() || isGenerating ? 'not-allowed' : 'pointer',
              opacity: !prompt.trim() ? 0.6 : 1,
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: prompt.trim() ? `0 4px 12px ${(accentColor || '#3b82f6')}40` : 'none'
            }}
            onMouseEnter={e => {
              if (prompt.trim() && !isGenerating) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={e => {
              if (prompt.trim() && !isGenerating) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <ArrowUp size={14} strokeWidth={2.5} />
          </button>
        </div>
      </form>

      {/* Style Suggestions Section */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          width: '100%', 
          maxWidth: '760px', 
          marginBottom: '16px',
          flexShrink: 0
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', fontFamily: "'Outfit', sans-serif" }}>
          Create an image
        </h2>
        
        {/* Navigation Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => handleScroll('left')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            type="button"
            onClick={() => handleScroll('right')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div 
        ref={carouselRef}
        style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          width: '100%',
          maxWidth: '760px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '4px',
          marginBottom: '36px',
          flexShrink: 0
        }}
        className="hide-scrollbar"
      >
        {styles.map((style) => (
          <div
            key={style.id}
            onClick={() => setPrompt(style.prompt)}
            style={{
              flexShrink: 0,
              width: '172px',
              height: '200px',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              transition: 'transform 0.2s, border-color 0.2s',
              background: '#121214'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            {/* Style Image */}
            <img 
              src={style.image} 
              alt={style.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Bottom shadow gradient and Label text overlay */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '12px 14px'
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff', lineHeight: '1.25' }}>
                {style.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* My Images Section */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '760px', 
          textAlign: 'left',
          marginBottom: '12px',
          flexShrink: 0
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6', fontFamily: "'Outfit', sans-serif" }}>
          My images
        </h2>
      </div>

      {/* Grid List */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '2px',
          width: 'calc(100% + 48px)',
          marginLeft: '-24px',
          marginRight: '-24px',
          maxWidth: 'none',
          animation: 'fadeIn 0.6s ease-out',
          flexShrink: 0
        }}
      >
        {/* Shimmer loading box */}
        {isGenerating && (
          <div 
            className="shimmer-bg"
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '0px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '8px'
            }}
          >
            <Sparkles size={16} className="text-blue-400 animate-pulse" style={{ color: accentColor || '#3b82f6' }} />
            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Generating...</span>
          </div>
        )}

        {/* User generated items */}
        {myImages.map((image) => (
          <div
            key={image.id}
            onClick={() => {
              setEditingImage(image);
              setActiveEditImage(image);
              setActiveAspectRatio('free');
              setSelectedEditorImage(null);
            }}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '0px',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              background: '#121214',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.25s ease'
            }}
            className="group"
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.4)';
              const overlay = e.currentTarget.querySelector('.image-hover-overlay');
              if (overlay) overlay.style.opacity = '1';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.boxShadow = 'none';
              const overlay = e.currentTarget.querySelector('.image-hover-overlay');
              if (overlay) overlay.style.opacity = '0';
            }}
          >
            <img 
              src={image.url} 
              alt={image.prompt}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

             {/* Hover Actions Overlay */}
             <div 
               className="image-hover-overlay"
               style={{
                 position: 'absolute',
                 inset: 0,
                 background: 'rgba(0, 0, 0, 0.4)',
                 opacity: 0,
                 transition: 'opacity 0.2s ease',
                 zIndex: 10
               }}
             >
               {/* Bottom-left Edit pill */}
               <button
                 type="button"
                 onClick={(e) => {
                   e.stopPropagation();
                   setEditingImage(image);
                   setActiveEditImage(image);
                   setActiveAspectRatio('free');
                   setSelectedEditorImage(null);
                 }}
                 style={{
                   position: 'absolute',
                   bottom: '8px',
                   left: '8px',
                   background: 'rgba(10, 10, 12, 0.85)',
                   border: '1px solid rgba(255, 255, 255, 0.1)',
                   borderRadius: '20px',
                   padding: '5px 14px',
                   color: '#ffffff',
                   fontSize: '13px',
                   fontWeight: '700',
                   cursor: 'pointer',
                   transition: 'all 0.2s ease',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontFamily: "'Inter', sans-serif"
                 }}
                 onMouseEnter={e => {
                   e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                   e.currentTarget.style.transform = 'scale(1.05)';
                 }}
                 onMouseLeave={e => {
                   e.currentTarget.style.background = 'rgba(10, 10, 12, 0.85)';
                   e.currentTarget.style.transform = 'scale(1)';
                 }}
               >
                 Edit
               </button>

               {/* Bottom-right Share circular button */}
               <button
                 type="button"
                 onClick={(e) => {
                   e.stopPropagation();
                   openShare(image);
                 }}
                 style={{
                   position: 'absolute',
                   bottom: '8px',
                   right: '8px',
                   width: '34px',
                   height: '34px',
                   borderRadius: '50%',
                   background: 'rgba(10, 10, 12, 0.85)',
                   border: '1px solid rgba(255, 255, 255, 0.1)',
                   color: '#ffffff',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseEnter={e => {
                   e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                   e.currentTarget.style.transform = 'scale(1.05)';
                 }}
                 onMouseLeave={e => {
                   e.currentTarget.style.background = 'rgba(10, 10, 12, 0.85)';
                   e.currentTarget.style.transform = 'scale(1)';
                 }}
               >
                 <Upload size={15} />
               </button>
             </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
            padding: '24px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header Close/Download bar */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                padding: '12px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                gap: '14px'
              }}
            >
              <button
                type="button"
                onClick={(e) => handleDownload(e, activeLightboxImage.url, `${activeLightboxImage.id}.png`)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                <Download size={14} />
                <span>Download</span>
              </button>
              
              <button
                type="button"
                onClick={() => setActiveLightboxImage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Full-Size Image Container */}
            <div style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', background: '#09090b' }}>
              <img 
                src={activeLightboxImage.url} 
                alt={activeLightboxImage.prompt}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '60vh', 
                  objectFit: 'contain' 
                }}
              />
            </div>

            {/* Bottom Prompt details */}
            <div 
              style={{
                padding: '20px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                background: '#18181b',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: accentColor || '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Prompt Description
              </span>
              <p style={{ fontSize: '14.5px', color: '#e5e7eb', lineHeight: '1.45', margin: 0, fontWeight: 400 }}>
                {activeLightboxImage.prompt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Share Modal */}
      {renderShareModal()}
    </div>
  );
}
