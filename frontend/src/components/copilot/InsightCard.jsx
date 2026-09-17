import React from 'react';
import { Activity, Eye, ShoppingBag, Clock } from 'lucide-react';

export default function InsightCard({ type, data }) {
  if (!data) return null;

  if (type === 'live_status') {
    return (
      <div className="mt-2.5 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-400" /> Active Shoppers
          </div>
          <div className="text-base font-extrabold text-white mt-0.5">{data.total_shoppers ?? '--'}</div>
        </div>
        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-purple-400" /> Busiest Zone
          </div>
          <div className="text-xs font-bold text-emerald-400 mt-1 truncate">{data.busiest_zone ?? '--'}</div>
        </div>
      </div>
    );
  }

  if (type === 'shelf_insight') {
    return (
      <div className="mt-2.5 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-indigo-400" /> Fixations
          </div>
          <div className="text-base font-extrabold text-white mt-0.5">{data.attention_events ?? '--'}</div>
        </div>
        <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Total Dwell
          </div>
          <div className="text-base font-extrabold text-white mt-0.5">{data.dwell_sec ? `${data.dwell_sec}s` : '--'}</div>
        </div>
      </div>
    );
  }

  if (type === 'product_rank') {
    return (
      <div className="mt-2.5 p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-emerald-400" /> Top Product
          </span>
          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 font-bold rounded">
            Score: {data.attractiveness_score ?? '--'}/100
          </span>
        </div>
        <div className="font-bold text-slate-100 text-xs truncate">{data.product_name}</div>
      </div>
    );
  }

  return null;
}
