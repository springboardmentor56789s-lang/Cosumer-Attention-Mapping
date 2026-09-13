import React from 'react';
import { Eye, Users, TrendingUp, Sparkles, Camera, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AttentionHeatmapChart from '../../components/charts/AttentionHeatmapChart';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      {/* Top Welcome Banner - Black Obsidian Theme */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-black to-zinc-950 border border-zinc-800 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-zinc-700/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold rounded-full">
                Role: {user?.role || 'Admin'}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Live Spatial Model v2.4</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Welcome back, {user?.full_name || 'Eleanor Vance'} 👋
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Consumer attention fixation across Store #101 (Flagship) is operating at <strong className="text-emerald-400">89.4 / 100 Gaze Index</strong> today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/recommendations"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl border border-zinc-700 shadow-lg transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>View AI Recommendations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Executive KPI Cards Grid (PRD Section 3 Compliance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Shoppers */}
        <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Total Shoppers</span>
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">324</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">Verified unique video tracks</p>
        </div>

        {/* KPI 2: Average Dwell Time */}
        <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Average Dwell Time</span>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-400">38 sec</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +5.4%
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">Calculated (Exit - Entry Time)</p>
        </div>

        {/* KPI 3: Total Attention Events */}
        <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Total Attention Events</span>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400">682</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.7%
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">Gaze fixations &gt;2.0 seconds</p>
        </div>

        {/* KPI 4: Top Performing Shelf */}
        <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Top Performing Shelf</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-emerald-400 truncate">Shelf B (Beverages)</span>
          </div>
          <p className="text-[11px] text-zinc-500">94.2% engagement score</p>
        </div>

        {/* KPI 5: Top Attention Product */}
        <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Top Attention Product</span>
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-cyan-300 truncate">Sparkling Lemonade 6-Pack</span>
          </div>
          <p className="text-[11px] text-zinc-500">Attractiveness Score: 92.4/100</p>
        </div>

        {/* KPI 6: Peak Traffic Period */}
        <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Peak Traffic Period</span>
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-rose-400">17:00 - 19:00</span>
          </div>
          <p className="text-[11px] text-zinc-500">Peak footfall concentration</p>
        </div>

        {/* KPI 7: Most Visited Zone */}
        <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Most Visited Zone</span>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-indigo-300">Beverage Zone</span>
          </div>
          <p className="text-[11px] text-zinc-500">248 unique zone visits</p>
        </div>

        {/* KPI 8: Overall Store Engagement */}
        <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">Overall Store Engagement</span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">89.4 / 100</span>
          </div>
          <p className="text-[11px] text-zinc-500">Weighted store intelligence score</p>
        </div>
      </div>

      {/* SINGLE VISUALIZATION: Hourly Shelf Position Gaze Intensity Bar Graph (Full Width) */}
      <div className="w-full p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Hourly Shelf Position Gaze Intensity Bar Graph
            </h2>
            <p className="text-xs text-zinc-400">Eye fixation score distribution per shelf position across operating hours</p>
          </div>
          <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] rounded-lg">
            ECharts Bar Graph
          </span>
        </div>
        <AttentionHeatmapChart height="400px" />
      </div>

      {/* AI RECOMMENDATIONS SECTION */}
      <div className="w-full p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Top AI Placement Recommendations
          </h2>
          <Link to="/recommendations" className="text-xs text-zinc-300 hover:underline font-semibold">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-black border border-purple-500/30 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-purple-300 font-bold">
              <span>1. Promote "Sparkling Lemonade 6-Pack" to Eye-Level</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px]">+28.4% Lift</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Currently placed on bottom shelf (Shelf 1). Gaze score is 14.6%, but has a 78% purchase intent once touched.
            </p>
          </div>

          <div className="p-4 bg-black border border-emerald-500/30 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-emerald-300 font-bold">
              <span>2. Expand Endcap Promo A Display Width</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">High Impact</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Endcap Promo A receives 3.2x higher gaze concentration during 5:00 PM - 7:00 PM peak hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
