(function() {
  try {
    const theme = localStorage.getItem('aura-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const accent = localStorage.getItem('aura-accent') || '#6366f1';
    document.documentElement.style.setProperty('--accent-color', accent);
  } catch (e) {}
})()
