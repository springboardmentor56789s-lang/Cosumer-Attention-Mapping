import React, { useState } from 'react';
import { ShoppingBag, Navigation, MapPin, Eye, Clock, ShoppingCart, ArrowRight, UserCheck, Sparkles, CheckCircle, Tag } from 'lucide-react';

export default function CustomerShoppingJourneyPanel({ customerJourneys }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!customerJourneys || customerJourneys.length === 0) return null;

  const currentJourney = customerJourneys[selectedIdx] || customerJourneys[0];

  return (
    <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-6 shadow-xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-400" />
            Customer Shopping Behavior & Pathway Journey Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracks exact in-store navigation routes, hand-reach pick events, gaze focus, and shopping style personas
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            ByteTrack Pathway Mesh Active
          </span>
        </div>
      </div>

      {/* Customer Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {customerJourneys.map((cj, idx) => (
          <button
            key={cj.customerId}
            onClick={() => setSelectedIdx(idx)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono transition flex items-center gap-2 shrink-0 border ${
              selectedIdx === idx
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{cj.customerId}</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full border ${cj.personaColor}`}>
              {cj.persona}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Customer Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Total In-Store Dwell
          </span>
          <div className="text-xl font-extrabold text-white">{currentJourney.totalDwellSec}s</div>
          <span className="text-[10px] text-emerald-400 font-semibold">{currentJourney.avgSpeed}</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-purple-400" /> Primary Gaze Target
          </span>
          <div className="text-sm font-bold text-purple-300 truncate">{currentJourney.gazeFocusZone}</div>
          <span className="text-[10px] text-slate-400">Eye-Level Fixation</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-slate-400 flex items-center gap-1">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" /> Basket Items Carted
          </span>
          <div className="text-xl font-extrabold text-emerald-400">{currentJourney.basketItems.length} Products</div>
          <span className="text-[10px] text-slate-400">Inspected & Picked</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-slate-400 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" /> Estimated Basket Value
          </span>
          <div className="text-xl font-extrabold text-amber-400">{currentJourney.estimatedValue}</div>
          <span className="text-[10px] text-emerald-400">Conversion Complete</span>
        </div>
      </div>

      {/* Shopping Pathway Timeline */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-indigo-400" />
          Step-by-Step Shopping Navigation Pathway
        </h3>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/30">
          {currentJourney.pathwayNodes.map((node, i) => (
            <div key={i} className="relative flex items-start gap-4 text-xs font-mono">
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 shadow-sm" />
              <div className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px] font-bold shrink-0">
                {node.time}
              </div>
              <div className="flex-1 bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {node.location}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] rounded-full font-bold">
                      🧭 Direction: {node.badge}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 text-[11px] font-medium">{node.action}</p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Basket Picked Items Table */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          Captured Hand-Reach & Basket Product Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-2">Product Name</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Price</th>
                <th className="pb-2 text-right">Shopping Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentJourney.basketItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {item.name}
                  </td>
                  <td className="py-2.5 text-slate-300">{item.category}</td>
                  <td className="py-2.5 text-amber-400 font-bold">{item.price}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.status.includes('Picked') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
