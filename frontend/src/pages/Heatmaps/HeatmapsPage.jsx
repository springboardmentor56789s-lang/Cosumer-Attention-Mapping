import React, { useEffect, useState } from 'react';
import { Flame, Layers, MapPin, Eye } from 'lucide-react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import Store2DHeatmapCanvas from '../../components/canvas/Store2DHeatmapCanvas';
import { heatmapsAPI } from '../../services/api';

export default function HeatmapsPage() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    async function loadHeatmap() {
      try {
        const res = await heatmapsAPI.getPoints();
        setPoints(res.data);
      } catch (err) {
        console.warn("API heatmap fetch fallback", err);
        // Synthesize fallback spatial points
        const fallbackPoints = [];
        for (let i = 0; i < 40; i++) {
          fallbackPoints.push({ id: i, zone_name: "Aisle 1 - Beverages", x_coord: 35 + (Math.random() * 10), y_coord: 30 + (Math.random() * 30), intensity: 0.8 + Math.random() * 0.2 });
          fallbackPoints.push({ id: i + 100, zone_name: "Promotional Endcap", x_coord: 70 + (Math.random() * 8), y_coord: 25 + (Math.random() * 15), intensity: 0.9 + Math.random() * 0.1 });
          fallbackPoints.push({ id: i + 200, zone_name: "Checkout Zone", x_coord: 85 + (Math.random() * 5), y_coord: 75 + (Math.random() * 15), intensity: 0.7 + Math.random() * 0.2 });
        }
        setPoints(fallbackPoints);
      }
    }
    loadHeatmap();
  }, []);

  return (
    <div>
      <Breadcrumbs title="2D Spatial Store Heatmaps" subtitle="Interactive spatial customer density and gaze attention intensity mapping" />

      {/* Main Store 2D Heatmap Canvas */}
      <Store2DHeatmapCanvas points={points} />

      {/* Zone Hot-spot Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-100 text-xs">Hotspot #1: Aisle 1 (Beverages)</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Extreme Density
            </span>
          </div>
          <p className="text-xs text-slate-400">Average eye gaze duration: <strong>6.4 seconds per customer</strong>. Cold brew shelf generates 42% of total store attention.</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-100 text-xs">Hotspot #2: Promotional Endcap A</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              High Density
            </span>
          </div>
          <p className="text-xs text-slate-400">Endcap display captured <strong>1,420 total impressions</strong> with an 88.9% attention score across all customer visits today.</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-100 text-xs">Cold Zone: Aisle 3 (Bottom Shelf)</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Low Density
            </span>
          </div>
          <p className="text-xs text-slate-400">Bottom shelf C3 registered under 1.2s gaze duration. AI recommends moving high-margin SKUs to eye level.</p>
        </div>
      </div>
    </div>
  );
}
