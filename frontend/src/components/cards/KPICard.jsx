import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, change, isPositive, icon: Icon, badgeText, accentColor = 'blue' }) {
  const getAccentGlow = () => {
    switch (accentColor) {
      case 'emerald': return 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/20';
      case 'amber': return 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/20';
      case 'purple': return 'from-purple-500/20 to-indigo-500/5 text-purple-400 border-purple-500/20';
      default: return 'from-blue-500/20 to-indigo-500/5 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">{value}</h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${getAccentGlow()} border shadow-md`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {change && (
          <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}

        {badgeText && (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
