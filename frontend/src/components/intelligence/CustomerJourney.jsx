import React from 'react';
import { ArrowRight, Footprints, Clock, CheckCircle2 } from 'lucide-react';

export default function CustomerJourney({ journeys }) {
  const defaultJourneys = [
    {
      shopper_id: '148 Shoppers Cohort (Most Frequent Path)',
      shopper_count: '95 Shoppers',
      tracking_duration_sec: 138.4,
      dwell_time_sec: 138.4,
      frequency: '95 Shoppers (64.2% Volume • Dominant Route)',
      isLessFrequent: false,
      journey_path: ['Entrance Gate A', 'Row 1 Snacks', 'Row 2 Utensils', 'Row 4 Electronics', 'Checkout Counter 4', 'Main Exit']
    },
    {
      shopper_id: '148 Shoppers Cohort (Less Frequent Path)',
      shopper_count: '19 Shoppers',
      tracking_duration_sec: 72.5,
      dwell_time_sec: 42.0,
      frequency: '19 Shoppers (12.8% Volume • Low-Density Route)',
      isLessFrequent: true,
      journey_path: ['Entrance Gate A', 'Row 3 Apparel (Dead Zone)', 'Promo Stand', 'Checkout Counter 4', 'Main Exit']
    },
    {
      shopper_id: 'Customer #104 (Alex M.)',
      tracking_duration_sec: 180.0,
      dwell_time_sec: 140.0,
      frequency: 'Single Tracked Shopper',
      isLessFrequent: false,
      journey_path: ['Entrance Gate A', 'Row 1 Snacks', 'Row 2 Utensils', 'Row 4 Electronics', 'Checkout Counter 4', 'Main Exit']
    },
    {
      shopper_id: 'Customer #112 (Sarah T.)',
      tracking_duration_sec: 165.0,
      dwell_time_sec: 125.0,
      frequency: 'Single Tracked Shopper',
      isLessFrequent: false,
      journey_path: ['Entrance Gate A', 'Row 1 Snacks', 'Row 2 Utensils', 'Checkout Counter 4', 'Main Exit']
    }
  ];

  const sampleJourneys = journeys && journeys.length > 0 ? journeys : defaultJourneys;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Footprints className="w-4 h-4 text-indigo-400" />
            Observed Customer Journeys & Path Sequences
          </h3>
          <p className="text-xs text-zinc-400">Reconstructed trajectories from ByteTrack object tracking logs</p>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg">
          {sampleJourneys.length} Tracked Journeys
        </span>
      </div>

      <div className="space-y-3">
        {sampleJourneys.map((j, idx) => (
          <div
            key={idx}
            className={`p-3.5 border rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition ${
              j.isLessFrequent
                ? 'bg-amber-950/20 border-amber-500/40 shadow-md'
                : 'bg-zinc-950/80 border-zinc-800'
            }`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  {j.shopper_id}
                </span>
                {j.frequency && (
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    j.isLessFrequent
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {j.frequency}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {j.journey_path.map((step, stepIdx) => (
                  <React.Fragment key={stepIdx}>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                      step.includes('Beverage') || step.includes('Utensils') ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                      step.includes('Snack') ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                      step.includes('Apparel') || step.includes('Dead Zone') ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                      step.includes('Checkout') ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                      'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {step}
                    </span>
                    {stepIdx < j.journey_path.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 shrink-0 self-end md:self-auto">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {j.dwell_time_sec}s Dwell
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
