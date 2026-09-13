import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ACCENT_COLORS = {
  blue: {
    name: 'Electric Blue',
    primary: '#3B82F6',
    gradient: 'from-blue-600 to-indigo-600',
    ring: 'focus:ring-blue-500',
    border: 'border-blue-500/30',
    glow: 'rgba(59, 130, 246, 0.25)',
    text: 'text-blue-400',
    bg: 'bg-blue-600',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  purple: {
    name: 'Purple Obsidian',
    primary: '#8B5CF6',
    gradient: 'from-purple-600 to-indigo-600',
    ring: 'focus:ring-purple-500',
    border: 'border-purple-500/30',
    glow: 'rgba(139, 92, 246, 0.25)',
    text: 'text-purple-400',
    bg: 'bg-purple-600',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  emerald: {
    name: 'Emerald Mint',
    primary: '#22C55E',
    gradient: 'from-emerald-600 to-teal-600',
    ring: 'focus:ring-emerald-500',
    border: 'border-emerald-500/30',
    glow: 'rgba(34, 197, 94, 0.25)',
    text: 'text-emerald-400',
    bg: 'bg-emerald-600',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  amber: {
    name: 'Amber Solar',
    primary: '#F59E0B',
    gradient: 'from-amber-600 to-orange-600',
    ring: 'focus:ring-amber-500',
    border: 'border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.25)',
    text: 'text-amber-400',
    bg: 'bg-amber-600',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('app_theme_mode') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('app_accent') || 'blue');
  const [density, setDensity] = useState(() => localStorage.getItem('app_density') || 'comfortable');
  const [motion, setMotion] = useState(() => localStorage.getItem('app_motion') !== 'false');

  useEffect(() => {
    localStorage.setItem('app_theme_mode', themeMode);
    const root = document.documentElement;
    if (themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('app_accent', accent);
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  useEffect(() => {
    localStorage.setItem('app_density', density);
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem('app_motion', motion);
  }, [motion]);

  const activeAccent = ACCENT_COLORS[accent] || ACCENT_COLORS.blue;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        accent,
        setAccent,
        accentConfig: activeAccent,
        density,
        setDensity,
        motion,
        setMotion,
      }}
    >
      <div className={`theme-${themeMode} density-${density} min-h-screen text-slate-100 bg-[#0F172A] transition-colors duration-300 font-sans`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
