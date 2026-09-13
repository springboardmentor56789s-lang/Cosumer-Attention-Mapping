import React, { useState } from 'react';
import { X, Bell, Camera, AlertTriangle, TrendingUp, Sparkles, Check, Trash2, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [filterCategory, setFilterCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Camera Alerts', 'Product Alerts', 'Traffic Alerts', 'AI Recommendations', 'System Notifications'];

  const filteredNotifications = notifications.filter(
    (n) => filterCategory === 'All' || n.category === filterCategory
  );

  const getCategoryIcon = (category) => {
    switch (category) {
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111622] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">Live Attention Stream Events</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold hover:bg-slate-800 rounded-lg transition"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="p-3 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${filterCategory === cat ? 'bg-blue-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No notifications found in this category.
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-4 rounded-xl border transition relative cursor-pointer group ${item.read ? 'bg-slate-900/40 border-slate-800/60 opacity-75' : 'bg-slate-900 border-slate-700/80 shadow-md'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-950 rounded-lg shrink-0 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 mt-0.5">{item.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.message}</p>
                        <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
