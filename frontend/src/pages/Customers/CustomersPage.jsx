import React, { useState } from 'react';
import { Users, Clock, MapPin, Flame, ArrowRight, ShieldCheck, Search, Filter } from 'lucide-react';

export default function CustomersPage() {
  const [customers] = useState([
    {
      id: 'Cust #4092',
      visitDuration: '14m 20s',
      currentZone: 'Beverages Aisle 1',
      attentionScore: 94,
      behaviourType: 'Decisive Purchaser',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      timeline: ['Entrance (12:40 PM)', 'Beverages Aisle 1', 'Shelf B3 Fixation (4.2s)', 'Cart Addition', 'Checkout Desk'],
    },
    {
      id: 'Cust #4095',
      visitDuration: '08m 15s',
      currentZone: 'Snacks & Confectionery',
      attentionScore: 82,
      behaviourType: 'Examiner',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      timeline: ['Entrance (12:45 PM)', 'Snacks Aisle', 'Shelf A2 Dwell (3.1s)', 'Product Inspection'],
    },
    {
      id: 'Cust #4098',
      visitDuration: '22m 10s',
      currentZone: 'Personal Care B2',
      attentionScore: 65,
      behaviourType: 'Browser',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      timeline: ['Entrance (12:30 PM)', 'Cosmetics Aisle', 'Top Shelf Gaze', 'Walking to Aisle 4'],
    },
  ]);

  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.currentZone.toLowerCase().includes(search.toLowerCase()) ||
      c.behaviourType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Customer Journey Analytics</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time anonymized gaze trajectories and spatial dwell duration timelines
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Active Live Tracks: <strong className="text-emerald-400">142 In-Store</strong>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Customer ID or Zone..."
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Customer Journey Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 backdrop-blur-xl shadow-xl hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-extrabold text-white font-mono">{c.id}</span>
                <span className={`block px-2 py-0.5 mt-1 text-[10px] font-semibold border rounded-full ${c.badgeColor}`}>
                  {c.behaviourType}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-blue-400 font-bold block">{c.attentionScore} Score</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 justify-end">
                  <Clock className="w-3 h-3" /> {c.visitDuration}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-mono">Current Zone</span>
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {c.currentZone}
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Spatial Journey Timeline
              </span>
              <div className="space-y-1.5">
                {c.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
