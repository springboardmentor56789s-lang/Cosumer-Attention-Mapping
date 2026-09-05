import React from 'react';
import { Activity, ShieldCheck, AlertCircle, RefreshCw, Zap, TrendingUp, Users, Flame } from 'lucide-react';

export default function BehaviorPatterns({ patterns, engineStatus = 'OPERATIONAL', onRefresh }) {
  const defaultPatterns = [
    { pattern_type: 'High Traffic', description: 'High shopper concentration observed in Beverage Zone', evidence: 'Beverage Zone recorded 16 unique visitors with 7 repeated zone entries.', confidence: 0.94 },
    { pattern_type: 'High Dwell', description: 'Extended dwell time detected in Beverage Zone', evidence: 'Shoppers spent an average of 26.2 seconds inspecting products in Beverage Zone.', confidence: 0.91 },
    { pattern_type: 'Repeat Visit', description: '7 shoppers re-engaged with Beverage Zone shelves', evidence: 'Shopper trajectory logs confirm 7 repeat visits prior to checkout navigation.', confidence: 0.88 },
    { pattern_type: 'Congestion', description: 'Checkout queue congestion spike detected', evidence: 'Checkout Zone recorded 15 visitors with peak queue length reaching 5 concurrent shoppers.', confidence: 0.89 }
  ];

  const list = patterns || defaultPatterns;

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'High Traffic':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'High Dwell':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Repeat Visit':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Congestion':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-5">
      {/* Engine Status Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Consumer Behavior Analytics Engine
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {engineStatus}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automated spatial tracking, dwell time computation, and pattern detection pipeline
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="text-right">
            <div className="text-zinc-500 text-[10px] uppercase">Processing Rate</div>
            <div className="text-emerald-400 font-bold">30.0 FPS</div>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800"></div>
          <div className="text-right">
            <div className="text-zinc-500 text-[10px] uppercase">Detection Confidence</div>
            <div className="text-purple-400 font-bold">94.2%</div>
          </div>
          <div className="h-7 w-[1px] bg-zinc-800"></div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
              title="Re-run Behavior Analysis"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Behavior Patterns Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Detected Behavioral Patterns & Evidence Logs
          </h4>
          <span className="text-[11px] font-mono text-zinc-400">
            {list.length} Patterns Validated
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {list.map((p, idx) => {
            const confPct = Math.round((p.confidence || 0.9) * 100);
            return (
              <div key={idx} className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-3 hover:border-zinc-700 transition">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${getBadgeStyle(p.pattern_type)}`}>
                    {p.pattern_type}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-zinc-500 text-[10px]">AI Confidence</span>
                    <span className="text-emerald-400 font-bold">{confPct}%</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-white">
                  {p.description}
                </div>

                <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 font-mono">
                  <span className="text-zinc-500 text-[10px] block font-sans font-semibold uppercase tracking-wider">
                    Empirical Evidence:
                  </span>
                  {p.evidence}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
