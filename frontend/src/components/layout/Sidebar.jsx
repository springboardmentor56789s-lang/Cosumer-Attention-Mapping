import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Layers,
  Film,
  BarChart3,
  Sparkles,
  FileText,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  BrainCircuit
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useNotifications();
  const { accentConfig } = useTheme();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/stores', label: 'Stores', icon: Store },
    { path: '/shelves', label: 'Shelves', icon: Layers },
    { path: '/video-analysis', label: 'Video Analysis AI', icon: Film, badge: 'YOLOv8' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/intelligence', label: 'Retail Intelligence', icon: BrainCircuit, highlight: true },
    { path: '/recommendations', label: 'Recommendations', icon: Sparkles },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'User Profile', icon: User },
  ];


  return (
    <aside
      className={`bg-black border-r border-zinc-800 h-screen shrink-0 flex flex-col transition-all duration-300 relative z-20 font-sans ${collapsed ? 'w-20' : 'w-64'}`}
    >

      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shrink-0 shadow-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">RetaiLVision</h1>
              <p className="text-[10px] text-zinc-400 font-mono">Attention AI v2.0</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden sm:flex p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto font-sans text-xs scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-md font-semibold'
                    : item.highlight
                    ? 'text-purple-300 hover:bg-purple-950/40 border border-purple-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${item.highlight ? 'text-purple-400' : ''}`} />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {!collapsed && item.count > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full">
                  {item.count}
                </span>
              )}

              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono rounded">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info pill */}
      {!collapsed && (
        <div className="p-3 m-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>EDGE GPU</span>
            <span className="text-emerald-400 font-bold">98.4% RUNNING</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-zinc-200 h-full w-[98%]"></div>
          </div>
        </div>
      )}
    </aside>
  );
}
