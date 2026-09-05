import React, { useState } from 'react';
import { Layers, Clock, Eye, RotateCcw, Users, Sparkles, TrendingUp } from 'lucide-react';

export default function ShelfEngagement({ shelves }) {
  const [selectedShelf, setSelectedShelf] = useState(null);

  const defaultShelves = [
    { shelf_code: 'Shelf A (Beverages)', visitors: 28, attention_events: 34, avg_attention_sec: 8.4, dwell_sec: 420.0, repeat_visits: 7, intensity: 0.95, engagement_score: 94.5 },
    { shelf_code: 'Shelf B (Snacks)', visitors: 19, attention_events: 21, avg_attention_sec: 6.2, dwell_sec: 230.0, repeat_visits: 4, intensity: 0.78, engagement_score: 78.2 },
    { shelf_code: 'Shelf C (Endcap Promo)', visitors: 24, attention_events: 28, avg_attention_sec: 7.9, dwell_sec: 310.0, repeat_visits: 5, intensity: 0.88, engagement_score: 88.9 },
    { shelf_code: 'Shelf D (Dairy & Cold)', visitors: 12, attention_events: 14, avg_attention_sec: 4.8, dwell_sec: 140.0, repeat_visits: 2, intensity: 0.52, engagement_score: 52.0 }
  ];

  const list = (shelves && shelves.length > 0) ? shelves : defaultShelves;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Shelf Performance & Engagement Heatmap (PRD Section 6)
          </h3>
          <p className="text-xs text-zinc-400">Relative attention frequency, aggregate dwell time, and repeat visit breakdown per configured shelf</p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          {list.length} Shelves Analyzed
        </span>
      </div>

      {/* Shelf List */}
      <div className="space-y-3">
        {list.map((s, idx) => {
          const pct = Math.min(100, Math.round((s.attention_events / 35.0) * 100));
          const isSelected = selectedShelf === idx;

          return (
            <div
              key={idx}
              onClick={() => setSelectedShelf(isSelected ? null : idx)}
              className={`p-3 bg-zinc-950 border rounded-xl space-y-2 cursor-pointer transition ${
                isSelected ? 'border-emerald-500/60 bg-zinc-900/90 shadow-lg' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {s.shelf_code}
                </span>
                <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-blue-300">
                    <Users className="w-3.5 h-3.5" /> {s.visitors || 20} Visitors
                  </span>
                  <span className="flex items-center gap-1 text-purple-300">
                    <Eye className="w-3.5 h-3.5" /> {s.attention_events} Attn Events
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3.5 h-3.5" /> {s.dwell_sec}s Dwell
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Expanded Detailed Metrics Drawer */}
              {isSelected && (
                <div className="pt-2 mt-2 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="text-zinc-500 block text-[9px] uppercase">Avg Attention Duration</span>
                    <span className="text-emerald-400 font-bold">{s.avg_attention_sec || 7.2}s / visitor</span>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="text-zinc-500 block text-[9px] uppercase">Repeat Shelf Visits</span>
                    <span className="text-purple-400 font-bold">{s.repeat_visits || 4} repeat engagements</span>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="text-zinc-500 block text-[9px] uppercase">Engagement Score</span>
                    <span className="text-amber-400 font-bold">{s.engagement_score || 85.0} / 100</span>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="text-zinc-500 block text-[9px] uppercase">Total Dwell Time</span>
                    <span className="text-blue-400 font-bold">{s.dwell_sec}s total</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
