(function() {
  try {
    let theme = localStorage.getItem('aura-theme') || 'dark';
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    const accent = localStorage.getItem('aura-accent') || '#6366f1';
    document.documentElement.style.setProperty('--accent-color', accent);
  } catch (e) {}
})()
