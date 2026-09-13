import React, { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, Sun, Moon, Laptop, ShieldCheck, ChevronDown, User, LogOut, Settings, Grid, Command } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, ACCENT_COLORS } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDrawer from './NotificationDrawer';
import AIAssistantDrawer from './AIAssistantDrawer';
import CommandPaletteModal from '../navigation/CommandPaletteModal';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode, accent, setAccent, density, setDensity, accentConfig } = useTheme();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [selectedStore, setSelectedStore] = useState('D-Mart Flagship Superstore');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const stores = [
    'D-Mart Flagship Superstore',
    'D-Mart Express Counter 1',
  ];


  const roleColors = {
    'Admin': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Store Manager': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Retail Analyst': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Marketing Manager': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-xl px-6 py-3 flex items-center justify-between gap-4 font-sans shrink-0">

        {/* Left Search Bar & Store Switcher */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          {/* Store Switcher Selector */}
          <div className="relative">
            <button
              onClick={() => setShowStoreDropdown(!showStoreDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="truncate max-w-[160px] sm:max-w-xs">{selectedStore}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showStoreDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl z-50 p-1 space-y-1 text-xs">
                {stores.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStore(st);
                      setShowStoreDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${selectedStore === st ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <span>{st}</span>
                    {selectedStore === st && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box Trigger for Ctrl + K */}
          <div
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative flex-1 hidden md:flex items-center cursor-pointer group"
          >
            <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-400 absolute left-3 transition" />
            <input
              type="text"
              readOnly
              placeholder="Search stores, products, cameras, reports..."
              className="w-full pl-9 pr-14 py-2 bg-slate-900 border border-slate-800 group-hover:border-slate-700 rounded-xl text-xs text-slate-200 cursor-pointer transition placeholder:text-slate-500"
            />
            <span className="absolute right-2 px-1.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[10px] font-mono flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </div>
        </div>

        {/* Right Tools & Profile Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Copilot Trigger */}
          <button
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Notifications Drawer Trigger */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
            title="Notifications Drawer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Accent Quick Picker */}
          <div className="relative">
            <button
              onClick={() => setShowAccentPicker(!showAccentPicker)}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition flex items-center gap-1"
              title="Theme Accent Colors"
            >
              <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: accentConfig.primary }}></span>
            </button>

            {showAccentPicker && (
              <div className="absolute top-full right-0 mt-1 p-2 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl z-50 flex items-center gap-2">
                {Object.entries(ACCENT_COLORS).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setAccent(key);
                      setShowAccentPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 ${accent === key ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: cfg.primary }}
                    title={cfg.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Layout Density Switcher */}
          <button
            onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
            className={`p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs transition ${density === 'compact' ? 'text-blue-400 border-blue-500/40 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
            title={`Density: ${density}`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Theme Mode Button */}
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition"
            title="Toggle Dark / Light Theme"
          >
            {themeMode === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">{user?.full_name || 'User'}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{user?.role || 'Admin'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-2 text-xs">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="font-bold text-white">{user?.full_name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  <span className={`inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold border rounded ${roleColors[user?.role] || 'bg-slate-800 text-slate-300'}`}>
                    {user?.role || 'Admin'}
                  </span>
                </div>

                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-white transition"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-900 hover:text-white transition"
                  >
                    <Settings className="w-4 h-4 text-indigo-400" />
                    <span>Settings & Preferences</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/landing');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawers & Modals */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <AIAssistantDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </>
  );
}
