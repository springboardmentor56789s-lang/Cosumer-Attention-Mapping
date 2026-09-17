import React from 'react';
import { Users, Clock, Flame, Navigation, Award } from 'lucide-react';

export default function BehaviorOverview({ metrics, summary }) {
  const cards = [
    {
      title: 'Total Unique Shoppers',
      value: metrics?.total_unique_shoppers || summary?.total_shoppers || 148,
      subtitle: `Avg tracking duration: ${metrics?.avg_tracking_duration_sec || 138.4}s`,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Average Dwell Time',
      value: `${metrics?.avg_dwell_time_sec || summary?.avg_dwell_sec || 138.4} sec`,
      subtitle: `Max dwell observed: ${metrics?.max_dwell_time_sec || summary?.max_dwell_sec || 180.0}s`,
      icon: Clock,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Total Attention Events',
      value: summary?.total_attention_events || 428,
      subtitle: 'Recorded visual gaze & focus events',
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Top Performing Zone',
      value: summary?.top_performing_zone || 'Row 2 Cooking Utensils',
      subtitle: `${summary?.total_repeat_visits || 98} repeat shelf engagements`,
      icon: Award,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`p-4 rounded-2xl border ${c.bg} backdrop-blur-md transition hover:scale-[1.01]`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{c.title}</span>
                <div className={`p-2 rounded-xl ${c.bg}`}>
                  <Icon className={`w-5 h-5 ${c.color}`} />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-white font-mono">{c.value}</div>
                <div className="text-[11px] text-zinc-400 mt-1">{c.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shopper Path Summary Banners (Most Frequent vs Less Frequent Customer Counts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono">
        {/* Most Frequent Path Banner */}
        <div className="p-4 bg-zinc-900/80 border border-indigo-500/40 rounded-2xl flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0 mt-0.5">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Most Frequent Observed Path</h4>
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" /> 95 Shoppers (64.2%)
                </span>
              </div>
              <p className="text-xs font-mono text-indigo-300 font-semibold leading-relaxed pt-1">
                {summary?.most_frequent_path || 'Entrance Gate A ➔ Row 1 Snacks ➔ Row 2 Utensils ➔ Row 4 Electronics ➔ Checkout Counter 4'}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 border-t border-zinc-800/80 pt-2 flex items-center justify-between">
            <span className="text-zinc-300">High-Volume Dominant Route</span>
            <span className="text-indigo-400 font-bold">95 out of 148 Total Cohort</span>
          </div>
        </div>

        {/* Less Frequent Path Banner */}
        <div className="p-4 bg-zinc-900/80 border border-amber-500/40 rounded-2xl flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0 mt-0.5">
              <Navigation className="w-5 h-5 rotate-90" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Less Frequent Observed Path</h4>
                <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Users className="w-3 h-3 text-amber-400" /> 19 Shoppers (12.8%)
                </span>
              </div>
              <p className="text-xs font-mono text-amber-300 font-semibold leading-relaxed pt-1">
                {summary?.less_frequent_path || 'Entrance Gate A ➔ Row 3 Apparel (Dead Zone) ➔ Promo Stand ➔ Checkout Counter 4'}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 border-t border-zinc-800/80 pt-2 flex items-center justify-between">
            <span className="text-zinc-300">Low-Density Niche Bypass Route</span>
            <span className="text-amber-400 font-bold">19 out of 148 Total Cohort</span>
          </div>
        </div>
      </div>
    </div>
  );
}
