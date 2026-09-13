import React, { useState, useEffect } from 'react';
import { Search, Store, Layers, ShoppingBag, Users, Camera, BarChart3, Flame, Sparkles, FileText, Bell, Settings, User, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommandPaletteModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigationItems = [
    { label: 'Dashboard Overview', path: '/', category: 'Navigation', icon: BarChart3 },
    { label: 'Store #101 Flagship Seattle', path: '/stores', category: 'Stores', icon: Store },
    { label: 'Store #102 Downtown Austin', path: '/stores', category: 'Stores', icon: Store },
    { label: 'Shelf B3 - Beverages & Energy Drinks', path: '/shelves', category: 'Shelves', icon: Layers },
    { label: 'Organic Cold-Pressed Juice 1L', path: '/products', category: 'Products', icon: ShoppingBag },
    { label: 'Hydrating Face Serum 50ml', path: '/products', category: 'Products', icon: ShoppingBag },
    { label: 'RedBull Energy Drink 250ml', path: '/products', category: 'Products', icon: ShoppingBag },
    { label: 'Customer #9042 Journey Track', path: '/customers', category: 'Customers', icon: Users },
    { label: 'Cam #03 - Snacks Aisle Gaze', path: '/cameras', category: 'Cameras', icon: Camera },
    { label: 'Hourly Gaze Fixation Heatmap', path: '/heatmaps', category: 'Heatmaps', icon: Flame },
    { label: 'AI Placement Recommendations', path: '/recommendations', category: 'Recommendations', icon: Sparkles },
    { label: 'Weekly Footfall PDF & CSV Export', path: '/reports', category: 'Reports', icon: FileText },
    { label: 'Notification Settings & Alerts', path: '/notifications', category: 'Settings', icon: Bell },
    { label: 'Theme & Accent Customization', path: '/settings', category: 'Settings', icon: Settings },
    { label: 'User Profile & Security', path: '/profile', category: 'Profile', icon: User },
  ];

  const filteredItems = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        navigate(filteredItems[selectedIndex].path);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search stores, products, cameras, reports... (Esc to close)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 text-xs">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No results found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.label + idx}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-blue-600/20 border border-blue-500/40 text-white font-semibold' : 'text-slate-300 hover:bg-slate-900/60'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-100">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Jump</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 border-t border-slate-800 bg-[#0F172A] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>RetaiLVision Command Palette</span>
        </div>
      </div>
    </div>
  );
}
