import React, { useState, useEffect, useRef } from 'react';
import { Eye, Clock, Footprints, Hand, Sparkles, CheckCircle2, Award, Zap, Activity } from 'lucide-react';

export default function HeatmapMatrixDashboard({ data }) {
  const [activeType, setActiveType] = useState('gaze'); // 'gaze', 'dwell', 'traffic', 'interaction'
  const canvasRef = useRef(null);

  const heatmapTypes = [
    {
      id: 'gaze',
      name: 'Gaze & Attention',
      isRecommended: true,
      icon: Eye,
      color: '#A855F7',
      bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      badgeColor: 'bg-purple-500 text-white',
      whatItTracks: 'Eye fixations, head pose vectors, visual shelf focus duration',
      primaryUseCase: 'Evaluating shelf height (Eye-Level 140–170cm), planograms, SKU attractiveness',
      fitForSystem: 'Highest (Matches Attractiveness Index & Gaze events)',
      fitBadge: 'HIGHEST FIT',
      metrics: {
        primaryMetric: '48.2% Eye-Level Gaze Dwell',
        leaderSKU: 'boAt Rockerz 255 (28 Gaze Events)',
        shelfOptimization: 'Shelf 3 (Eye Level 140-170cm)'
      }
    },
    {
      id: 'dwell',
      name: 'Dwell Time',
      isRecommended: false,
      icon: Clock,
      color: '#F59E0B',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      badgeColor: 'bg-amber-500 text-black',
      whatItTracks: 'Stationary duration per zone, shelf hesitation periods',
      primaryUseCase: 'Identifying customer hesitation, high interest products, and queue bottlenecks',
      fitForSystem: 'High (Directly supports Dwell & Queue detection)',
      fitBadge: 'HIGH FIT',
      metrics: {
        primaryMetric: '42.0s Avg Dwell (Row 2 Utensils)',
        leaderSKU: 'Chef Knife Set (8.4s Dwell Fixation)',
        shelfOptimization: 'Row 2 Customer Hesitation Alert'
      }
    },
    {
      id: 'traffic',
      name: 'Traffic / Footfall',
      isRecommended: false,
      icon: Footprints,
      color: '#3B82F6',
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      badgeColor: 'bg-blue-500 text-white',
      whatItTracks: 'Movement trajectories, aisle physical congestion & footfall density',
      primaryUseCase: 'Measuring dominant store navigation paths, aisle flow, and dead zones',
      fitForSystem: 'Medium (Good for macro navigation, lacks product depth)',
      fitBadge: 'MEDIUM FIT',
      metrics: {
        primaryMetric: '18 Shoppers (Entrance ➔ Checkout 4)',
        leaderSKU: 'Row 1 Snacks (High Traffic 16 Visitors)',
        shelfOptimization: 'Main Aisle Congestion Normalization'
      }
    },
    {
      id: 'interaction',
      name: 'Interaction / Reach',
      isRecommended: false,
      icon: Hand,
      color: '#10B981',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      badgeColor: 'bg-emerald-500 text-white',
      whatItTracks: 'Touch, shelf pick-and-place physical gestures',
      primaryUseCase: 'Conversion intent, physical product handling vs. bounce rate',
      fitForSystem: 'High (Useful complementary layer for touch detection)',
      fitBadge: 'HIGH FIT',
      metrics: {
        primaryMetric: '7 Physical Touch Pick Events',
        leaderSKU: 'Potato Chips 150g (5 Pick-to-Cart)',
        shelfOptimization: 'Shelf 3 Touch-to-Cart Conversion 71.4%'
      }
    }
  ];

  const currentType = heatmapTypes.find((t) => t.id === activeType) || heatmapTypes[0];

  // Render Interactive Canvas tailored to activeType
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#06090F';
    ctx.fillRect(0, 0, width, height);

    // Grid Mesh
    ctx.strokeStyle = '#141C2B';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 35) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 35) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Shelves Bounding Box Outlines
    const shelves = [
      { name: 'Row 1: Packaged Snacks', x: 180, y: 50, w: 150, h: 220, color: '#3B82F6' },
      { name: 'Row 2: Cooking Utensils', x: 390, y: 50, w: 150, h: 220, color: '#F59E0B' },
      { name: 'Row 4: Electronics', x: 600, y: 50, w: 150, h: 220, color: '#A855F7' },
      { name: 'Express Checkout 4', x: 300, y: 310, w: 320, h: 65, color: '#EF4444' }
    ];

    shelves.forEach((s) => {
      ctx.fillStyle = s.color + '0E';
      ctx.strokeStyle = s.color + '40';
      ctx.lineWidth = 1.5;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(s.name, s.x + 8, s.y + 16);

      // Draw Eye-Level Shelf Zone (140-170cm) if Gaze mode
      if (activeType === 'gaze') {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.setLineDash([2, 2]);
        ctx.fillRect(s.x + 4, s.y + 70, s.w - 8, 40);
        ctx.strokeRect(s.x + 4, s.y + 70, s.w - 8, 40);
        ctx.fillStyle = '#E9D5FF';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('Eye Level (140-170cm)', s.x + 8, s.y + 92);
        ctx.setLineDash([]);
      }
    });

    // Render Mode Specific Hotspots
    const hotspots = activeType === 'gaze' ? [
      { x: 255, y: 130, r: 45, intensity: 0.92, label: 'Gaze Fixation: Potato Chips (4.8s)' },
      { x: 465, y: 130, r: 50, intensity: 0.96, label: 'Gaze Fixation: Chef Knife Set (8.4s)' },
      { x: 675, y: 130, r: 55, intensity: 0.98, label: 'Gaze Fixation: boAt Earphones (12.1s)' }
    ] : activeType === 'dwell' ? [
      { x: 465, y: 160, r: 60, intensity: 0.98, label: 'Extended Dwell: Row 2 Utensils (42s)' },
      { x: 460, y: 345, r: 45, intensity: 0.88, label: 'Queue Dwell: Express Checkout (25s)' }
    ] : activeType === 'traffic' ? [
      { x: 100, y: 340, r: 35, intensity: 0.50, label: 'Gate A Entrance' },
      { x: 255, y: 160, r: 50, intensity: 0.85, label: 'High Traffic: Row 1 Snacks' },
      { x: 465, y: 160, r: 45, intensity: 0.80, label: 'Row 2 Utensils Flow' },
      { x: 675, y: 160, r: 50, intensity: 0.90, label: 'Row 4 Electronics Flow' },
      { x: 460, y: 345, r: 55, intensity: 0.95, label: 'Express Checkout Queue' }
    ] : [
      { x: 255, y: 130, r: 40, intensity: 0.88, label: 'Touch Pick: Potato Chips (5 Picks)' },
      { x: 675, y: 130, r: 45, intensity: 0.94, label: 'Touch Pick: boAt Wireless (4 Picks)' }
    ];

    hotspots.forEach((h) => {
      const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
      grad.addColorStop(0, currentType.color + 'E0');
      grad.addColorStop(0.5, currentType.color + '50');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fill();

      // Node Marker
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(h.x, h.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label Badge
      ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
      ctx.strokeStyle = currentType.color;
      ctx.lineWidth = 1;
      ctx.fillRect(h.x - 70, h.y - h.r - 18, 140, 20);
      ctx.strokeRect(h.x - 70, h.y - h.r - 18, 140, 20);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(h.label, h.x - 64, h.y - h.r - 5);
    });

  }, [activeType]);

  return (
    <div className="bg-[#0B0F17] border border-purple-500/30 rounded-3xl p-6 space-y-6 shadow-2xl font-sans text-xs">
      {/* Top Title & Recommended Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold rounded-full text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Multi-Modal Spatial Heatmap Intelligence Matrix
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> System Calibrated
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Compare computer vision heatmap modalities tailored to your store planogram, eye-level shelf focus (140-170cm), and dwell duration telemetry.
          </p>
        </div>
      </div>

      {/* Heatmap Type Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {heatmapTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = activeType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-zinc-900 border-purple-500 ring-2 ring-purple-500/30 shadow-xl'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
            >
              {type.isRecommended && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-600 text-white font-mono font-bold text-[9px] rounded-full flex items-center gap-1 shadow-md">
                  <Award className="w-3 h-3" /> Recommended
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${type.bg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{type.name}</h3>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${type.badgeColor}`}>
                    {type.fitBadge}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {type.whatItTracks}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Heatmap Mode Live Simulation Canvas & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* HTML5 Dynamic Canvas Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-white font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Live {currentType.name} Heatmap Telemetry Canvas
            </span>
            <span className="text-zinc-400 text-[11px]">800 x 380 Real-Time Grid</span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
            <canvas
              ref={canvasRef}
              width={800}
              height={380}
              className="w-full h-auto aspect-[16/9] block"
            />
          </div>
        </div>

        {/* Selected Heatmap Metrics & System Fit Card */}
        <div className="space-y-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between font-mono text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {currentType.name} Specifications
              </h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentType.bg}`}>
                {currentType.fitBadge}
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-zinc-500 block">WHAT IT TRACKS:</span>
                <span className="text-zinc-200 font-semibold">{currentType.whatItTracks}</span>
              </div>

              <div>
                <span className="text-zinc-500 block">PRIMARY USE CASE:</span>
                <span className="text-purple-300 font-semibold">{currentType.primaryUseCase}</span>
              </div>

              <div>
                <span className="text-zinc-500 block">FIT FOR YOUR SYSTEM:</span>
                <span className="text-emerald-400 font-semibold">{currentType.fitForSystem}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2 text-[11px]">
            <div className="text-purple-200 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> System Real-Time Readout:
            </div>
            <div className="text-zinc-300 space-y-1 text-[10px]">
              <div>• {currentType.metrics.primaryMetric}</div>
              <div>• Leader SKU: <strong className="text-white">{currentType.metrics.leaderSKU}</strong></div>
              <div>• Planogram Rec: <strong className="text-purple-300">{currentType.metrics.shelfOptimization}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Comparison Matrix Reference Table */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <h3 className="text-xs font-bold font-mono text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
          Heatmap Modality System Comparison Matrix
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-3 font-bold text-purple-400">Heatmap Type</th>
                <th className="p-3 font-bold text-white">What It Tracks</th>
                <th className="p-3 font-bold text-white">Primary Use Case</th>
                <th className="p-3 font-bold text-emerald-400">Fit for Your System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {heatmapTypes.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setActiveType(t.id)}
                  className={`hover:bg-zinc-900/50 cursor-pointer transition ${
                    activeType === t.id ? 'bg-purple-950/20' : ''
                  }`}
                >
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <t.icon className={`w-3.5 h-3.5 ${activeType === t.id ? 'text-purple-400' : 'text-zinc-500'}`} />
                    <span>{t.name}</span>
                    {t.isRecommended && (
                      <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Rec
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-zinc-400">{t.whatItTracks}</td>
                  <td className="p-3 text-zinc-300">{t.primaryUseCase}</td>
                  <td className="p-3 font-bold text-emerald-400">{t.fitForSystem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
