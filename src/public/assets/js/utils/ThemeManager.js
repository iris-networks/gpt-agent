// Theme Manager for DaisyUI theme switching
export class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.themes = [
      { name: 'light', label: '🌞 Light', isDark: false },
      { name: 'dark', label: '🌙 Dark', isDark: true },
      { name: 'cyberpunk', label: '🌈 Cyberpunk', isDark: true },
      { name: 'retro', label: '🎨 Retro', isDark: false },
      { name: 'synthwave', label: '🔮 Synthwave', isDark: true },
      { name: 'forest', label: '🌲 Forest', isDark: true },
      { name: 'aqua', label: '🌊 Aqua', isDark: true },
      { name: 'lofi', label: '🎵 Lo-Fi', isDark: false },
      { name: 'pastel', label: '🎀 Pastel', isDark: false },
      { name: 'fantasy', label: '🦄 Fantasy', isDark: false },
      { name: 'wireframe', label: '📐 Wireframe', isDark: false },
      { name: 'black', label: '⚫ Black', isDark: true },
      { name: 'luxury', label: '💎 Luxury', isDark: true },
      { name: 'dracula', label: '🧛 Dracula', isDark: true },
      { name: 'business', label: '👔 Business', isDark: true },
      { name: 'acid', label: '🍋 Acid', isDark: false },
      { name: 'lemonade', label: '🍋 Lemonade', isDark: false },
      { name: 'night', label: '🌃 Night', isDark: true },
      { name: 'coffee', label: '☕ Coffee', isDark: true },
      { name: 'winter', label: '❄️ Winter', isDark: false }
    ];
  }
  
  init() {
    this.loadSavedTheme();
    this.setupThemeSelector();
    this.detectSystemTheme();
    
    console.log('ThemeManager initialized with theme:', this.currentTheme);
  }
  
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('zenobia-theme');
    if (savedTheme && this.themes.find(t => t.name === savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Default to system preference
      this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    this.applyTheme(this.currentTheme);
  }
  
  setupThemeSelector() {
    const themeDropdown = document.querySelector('.dropdown-content');
    if (!themeDropdown) return;
    
    // Clear existing themes and add new ones
    themeDropdown.innerHTML = '';
    
    this.themes.forEach(theme => {
      const themeOption = document.createElement('li');
      themeOption.innerHTML = `<a data-theme="${theme.name}">${theme.label}</a>`;
      
      const link = themeOption.querySelector('a');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTheme(theme.name);
      });
      
      themeDropdown.appendChild(themeOption);
    });
  }
  
  switchTheme(themeName) {
    if (!this.themes.find(t => t.name === themeName)) {
      console.error('Theme not found:', themeName);
      return;
    }
    
    this.currentTheme = themeName;
    this.applyTheme(themeName);
    this.saveTheme(themeName);
    
    // Emit theme change event
    this.emitThemeChange(themeName);
  }
  
  applyTheme(themeName) {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', themeName);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(themeName);
    
    // Update body class for theme-specific styles
    this.updateBodyClass(themeName);
    
    console.log('Applied theme:', themeName);
  }
  
  updateMetaThemeColor(themeName) {
    const theme = this.themes.find(t => t.name === themeName);
    if (!theme) return;
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Set color based on theme
    const color = theme.isDark ? '#1d232a' : '#ffffff';
    metaThemeColor.content = color;
  }
  
  updateBodyClass(themeName) {
    const theme = this.themes.find(t => t.name === themeName);
    if (!theme) return;
    
    document.body.classList.toggle('theme-dark', theme.isDark);
    document.body.classList.toggle('theme-light', !theme.isDark);
    document.body.setAttribute('data-theme', themeName);
  }
  
  saveTheme(themeName) {
    localStorage.setItem('zenobia-theme', themeName);
  }
  
  detectSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually selected a theme
      const savedTheme = localStorage.getItem('zenobia-theme');
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        this.switchTheme(systemTheme);
      }
    });
  }
  
  emitThemeChange(themeName) {
    const event = new CustomEvent('themeChanged', {
      detail: {
        theme: themeName,
        isDark: this.themes.find(t => t.name === themeName)?.isDark || false
      }
    });
    
    document.dispatchEvent(event);
  }
  
  // Public methods
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  getThemes() {
    return this.themes;
  }
  
  isDarkTheme(themeName = this.currentTheme) {
    const theme = this.themes.find(t => t.name === themeName);
    return theme?.isDark || false;
  }
  
  getThemeLabel(themeName) {
    const theme = this.themes.find(t => t.name === themeName);
    return theme?.label || themeName;
  }
  
  toggleTheme() {
    const currentTheme = this.themes.find(t => t.name === this.currentTheme);
    if (!currentTheme) return;
    
    // Toggle between light and dark variants
    const newTheme = currentTheme.isDark ? 'light' : 'dark';
    this.switchTheme(newTheme);
  }
  
  cycleTheme() {
    const currentIndex = this.themes.findIndex(t => t.name === this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.switchTheme(this.themes[nextIndex].name);
  }
  
  // Theme utilities
  getThemeColors(themeName = this.currentTheme) {
    // This would need to be implemented based on actual CSS custom properties
    // For now, return some default colors
    const theme = this.themes.find(t => t.name === themeName);
    if (!theme) return null;
    
    // These would be extracted from the actual CSS
    const colors = {
      primary: theme.isDark ? '#6366f1' : '#3b82f6',
      secondary: theme.isDark ? '#8b5cf6' : '#6366f1',
      accent: theme.isDark ? '#06b6d4' : '#0ea5e9',
      neutral: theme.isDark ? '#1f2937' : '#f3f4f6',
      base: theme.isDark ? '#1d232a' : '#ffffff',
      info: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    
    return colors;
  }
  
  // Advanced theme features
  createCustomTheme(name, colors) {
    // This would allow users to create custom themes
    // Implementation would depend on how DaisyUI themes are structured
    console.log('Custom theme creation not implemented yet');
  }
  
  exportTheme(themeName = this.currentTheme) {
    const theme = this.themes.find(t => t.name === themeName);
    if (!theme) return null;
    
    return {
      name: theme.name,
      label: theme.label,
      isDark: theme.isDark,
      colors: this.getThemeColors(themeName)
    };
  }
  
  importTheme(themeData) {
    // This would allow importing custom themes
    console.log('Theme import not implemented yet');
  }
}