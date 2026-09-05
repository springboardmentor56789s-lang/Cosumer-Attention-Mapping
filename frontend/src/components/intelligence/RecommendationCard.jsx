import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Layers, Users, ShoppingCart, Store, Eye, Tag, ShieldAlert, ArrowRightLeft } from 'lucide-react';

export default function RecommendationCard({ recommendations }) {
  const recs = recommendations || [
    { id: 1, category: 'Planogram Realignment', condition: 'Row 1 Packaged Snacks (Eye-Level Fixation)', evidence: 'High visual gaze dwell (3.42s avg) concentrated on Shelf 3 snacks across 126 unique shoppers.', recommendation: 'Relocate high-margin premium snacks to Shelf 3 (Eye Level: 140-170cm height) where 68.4% gaze dwell occurs for a projected +24.5% attractiveness lift.', confidence: 'High', status: 'Active' },
    { id: 2, category: 'Workforce Allocation', condition: 'Row 2 Cooking Utensils (Extended Dwell Bottleneck)', evidence: 'Extended 38.2s average dwell duration recorded across 133 shoppers inspecting Chef Knife Sets.', recommendation: 'Assign dedicated staff coverage to Row 2 Utensils during afternoon traffic spikes to assist customers and accelerate restock.', confidence: 'High', status: 'Active' },
    { id: 3, category: 'Register Flow Normalization', condition: 'Express Checkout Counter 4 (Queue Surge)', evidence: 'Express Checkout experienced queue spikes averaging 24.1s wait time with peak queue length reaching 5 concurrent shoppers.', recommendation: 'Review checkout staffing allocations and automatically trigger auxiliary register opening when express queue length reaches 4 shoppers.', confidence: 'High', status: 'Active' },
    { id: 4, category: 'Store Layout & Lighting', condition: 'Row 3 Dairy & Cold Zone (Low Attractiveness Ratio)', evidence: 'Dairy Zone received 42% lower visual attention frequency compared to adjacent Beverage Zone despite equal foot traffic velocity.', recommendation: 'Upgrade overhead spotlighting and high-contrast navigational signage around Row 3 to improve product visibility and visual engagement.', confidence: 'Medium', status: 'Active' },
    { id: 5, category: 'Cross-Merchandising Strategy', condition: 'Electronics & Packaged Snacks (High Co-Visitation)', evidence: '64% of shoppers who spent >30s in Row 4 (Electronics) proceeded directly to Row 1 (Packaged Snacks) within 45 seconds.', recommendation: 'Position impulse snack displays and promotional beverage clips adjacent to the Row 4 Electronics endcap to capture cross-category impulse buys.', confidence: 'High', status: 'Active' },
    { id: 6, category: 'Promotional Signage Optimization', condition: 'Entrance Gate A (Low Banner Conversion)', evidence: 'Only 12% of 148 entering shoppers directed visual gaze toward overhead promotional banner A (avg fixation: 0.4s).', recommendation: 'Lower promotional signage to primary focal line (1.6m-1.8m eye height) near entrance slowing points to increase promotional viewability by 35%.', confidence: 'High', status: 'Active' },
    { id: 7, category: 'Endcap Traffic Slowing', condition: 'Main Aisle Endcap 2 (High Velocity Pass-Through)', evidence: '118 shoppers passed Endcap 2 at high movement speeds (>1.2 m/s) with average dwell duration under 4.1s.', recommendation: 'Deploy high-contrast pricing callouts and featured bundle displays on Endcap 2 to reduce foot traffic velocity and stimulate impulse stops.', confidence: 'Medium', status: 'Active' },
    { id: 8, category: 'Loss Prevention & Blindspot Monitoring', condition: 'Rear Storage Access Corridor (Unusual Loitering)', evidence: '3 shoppers exhibited prolonged loitering (>85s dwell) in Rear Storage Access corridor with low visual engagement on merchandise.', recommendation: 'Re-orient overhead security coverage toward Rear Access corridor and enhance lighting to eliminate blindspots and discourage product tampering.', confidence: 'Medium', status: 'Active' }
  ];

  const getIcon = (cat) => {
    switch (cat) {
      case 'Planogram Realignment':
      case 'Shelf Optimization': return Layers;
      case 'Workforce Allocation':
      case 'Workforce Optimization': return Users;
      case 'Register Flow Normalization':
      case 'Checkout Optimization': return ShoppingCart;
      case 'Store Layout & Lighting':
      case 'Store Layout': return Store;
      case 'Cross-Merchandising Strategy': return ArrowRightLeft;
      case 'Promotional Signage Optimization': return Eye;
      case 'Endcap Traffic Slowing': return Tag;
      case 'Loss Prevention & Blindspot Monitoring': return ShieldAlert;
      default: return Sparkles;
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Evidence-Based Optimization Recommendations
          </h3>
          <p className="text-xs text-zinc-400">Actionable operational insights generated from verified computer vision behavior data</p>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">
          {recs.length} Active Insights
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {recs.map((r) => {
          const Icon = getIcon(r.category);
          return (
            <div key={r.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between hover:border-zinc-700 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {r.category}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    r.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {r.confidence} Confidence
                  </span>
                </div>

                <div className="text-xs font-semibold text-white font-sans">
                  {r.recommendation}
                </div>
              </div>

              {/* Supporting Evidence Traceability Block */}
              <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/80 rounded-lg text-[11px] space-y-1">
                <div className="font-mono text-zinc-400 font-semibold uppercase text-[9px] tracking-wider">
                  Supporting Evidence & Condition
                </div>
                <div className="text-zinc-300 font-sans">{r.evidence}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
