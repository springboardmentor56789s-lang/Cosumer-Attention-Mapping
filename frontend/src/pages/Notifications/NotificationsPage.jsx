import React, { useState } from 'react';
import { Bell, Camera, AlertTriangle, TrendingUp, Sparkles, ShieldCheck, CheckCircle2, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Camera Alerts', 'Product Alerts', 'Traffic Alerts', 'AI Recommendations', 'System Notifications'];

  const filtered = notifications.filter(
    (n) => activeCategory === 'All' || n.category === activeCategory
  );

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Camera Alerts':
        return <Camera className="w-4 h-4 text-amber-400" />;
      case 'Product Alerts':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'Traffic Alerts':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'AI Recommendations':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Notification Center</h1>
            <p className="text-xs text-slate-400">Live Spatial Camera Alerts & System Events</p>
          </div>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/60 border border-slate-800 rounded-2xl">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer group ${item.read ? 'bg-slate-900/40 border-slate-800/60 opacity-80' : 'bg-slate-900 border-slate-700 shadow-lg'}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-950 rounded-xl shrink-0 mt-0.5 border border-slate-800">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-blue-400 uppercase tracking-wider text-[10px]">
                      {item.category}
                    </span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">{item.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">{item.timestamp}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
