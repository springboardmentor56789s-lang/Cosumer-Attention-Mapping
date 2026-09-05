import React, { useState } from 'react';
import { Sparkles, Activity, Filter, Info, Download } from 'lucide-react';

export default function MatrixGridHeatmap({ data }) {
  const [palette, setPalette] = useState('magma'); // 'magma', 'rocket', 'viridis', 'plasma'
  const [hoveredCell, setHoveredCell] = useState(null);

  // Vertical Y-axis Metrics (Rows)
  const rows = [
    { id: 'gaze', label: 'Gaze' },
    { id: 'attention', label: 'Attention' },
    { id: 'dwell', label: 'Dwell Time' },
    { id: 'footfall', label: 'Footfall' },
    { id: 'interaction', label: 'Interaction' }
  ];

  // Horizontal X-axis Zones/Shelves (Columns)
  const columns = [
    { id: 'z1', label: 'Row 1 Snacks' },
    { id: 'z2', label: 'Row 2 Utensils' },
    { id: 'z3', label: 'Row 3 Apparel' },
    { id: 'z4', label: 'Row 4 Electronics' },
    { id: 'z5', label: 'Checkout 4' },
    { id: 'z6', label: 'Gate A Entry' },
    { id: 'z7', label: 'Promo Stand' },
    { id: 'z8', label: 'Bakery Aisle' }
  ];

  // 2D Heatmap Matrix Values (0 to 100)
  const matrixValues = {
    gaze: { z1: 88, z2: 94, z3: 65, z4: 98, z5: 72, z6: 45, z7: 91, z8: 82 },
    attention: { z1: 95, z2: 85, z3: 58, z4: 92, z5: 64, z6: 38, z7: 89, z8: 76 },
    dwell: { z1: 74, z2: 98, z3: 42, z4: 88, z5: 92, z6: 28, z7: 75, z8: 68 },
    footfall: { z1: 85, z2: 90, z3: 62, z4: 88, z5: 95, z6: 98, z7: 82, z8: 70 },
    interaction: { z1: 90, z2: 68, z3: 35, z4: 94, z5: 52, z6: 18, z7: 84, z8: 62 }
  };

  // Color Mapping Function based on Selected Palette
  const getColorForValue = (val) => {
    const norm = Math.max(0, Math.min(1, val / 100));

    if (palette === 'magma' || palette === 'rocket') {
      // Magma palette: Dark Purple/Black (0) -> Dark Red (35) -> Red-Orange (65) -> Bright Warm Yellow (90+)
      if (norm < 0.25) {
        const t = norm / 0.25;
        return `rgb(${Math.round(20 + t * 40)}, ${Math.round(10 + t * 15)}, ${Math.round(35 + t * 40)})`; // Dark purple
      } else if (norm < 0.55) {
        const t = (norm - 0.25) / 0.30;
        return `rgb(${Math.round(115 + t * 80)}, ${Math.round(25 + t * 30)}, ${Math.round(70 - t * 30)})`; // Red-Purple to Bright Crimson Red
      } else if (norm < 0.82) {
        const t = (norm - 0.55) / 0.27;
        return `rgb(${Math.round(195 + t * 50)}, ${Math.round(55 + t * 90)}, ${Math.round(40 + t * 20)})`; // Crimson to Orange-Yellow
      } else {
        const t = (norm - 0.82) / 0.18;
        return `rgb(${Math.round(245 + t * 10)}, ${Math.round(145 + t * 95)}, ${Math.round(60 + t * 150)})`; // Bright Yellow-White
      }
    } else if (palette === 'viridis') {
      // Viridis palette: Dark Purple (0) -> Teal (50) -> Yellow (100)
      if (norm < 0.5) {
        const t = norm / 0.5;
        return `rgb(${Math.round(68 - t * 30)}, ${Math.round(1 + t * 140)}, ${Math.round(84 + t * 60)})`;
      } else {
        const t = (norm - 0.5) / 0.5;
        return `rgb(${Math.round(38 + t * 215)}, ${Math.round(141 + t * 90)}, ${Math.round(144 - t * 110)})`;
      }
    } else {
      // Plasma palette: Blue-Purple (0) -> Magenta (50) -> Yellow (100)
      if (norm < 0.5) {
        const t = norm / 0.5;
        return `rgb(${Math.round(13 + t * 180)}, ${Math.round(8 + t * 30)}, ${Math.round(135 + t * 50)})`;
      } else {
        const t = (norm - 0.5) / 0.5;
        return `rgb(${Math.round(193 + t * 60)}, ${Math.round(38 + t * 210)}, ${Math.round(185 - t * 140)})`;
      }
    }
  };

  // Contrast Text Color Determination (White on dark cells, Black on light yellow cells)
  const getTextColorForValue = (val) => {
    return val > 78 ? '#0F172A' : '#FFFFFF';
  };

  return (
    <div className="bg-[#090D16] border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl font-sans text-xs">
      {/* Matrix Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold rounded-full text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Consumer Behavior Heatmap Matrix
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono text-[10px] font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Spatial Multi-Metric Density Matrix Grid
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Evaluating Gaze, Attention, Dwell Time, Footfall, and Interaction scores across all store shelves and zones.
          </p>
        </div>
      </div>

      {/* Seaborn Style Heatmap Matrix Layout */}
      <div className="flex flex-col lg:flex-row items-center gap-6 overflow-x-auto p-2 bg-[#05080E] border border-zinc-800/80 rounded-2xl">
        {/* Left Y-axis Title Label */}
        <div className="hidden lg:flex items-center justify-center font-mono font-bold text-zinc-400 text-sm tracking-widest uppercase -rotate-90 select-none py-12">
          Metric Modalities
        </div>

        {/* Matrix Grid Container */}
        <div className="flex-1 w-full space-y-2">
          {/* Main Grid Table */}
          <div className="w-full border-collapse">
            {/* Grid Rows */}
            {rows.map((row) => (
              <div key={row.id} className="flex items-center">
                {/* Vertical Y-axis Metric Name Label */}
                <div className="w-28 sm:w-36 shrink-0 font-mono font-bold text-zinc-200 text-right pr-4 text-xs sm:text-sm tracking-tight truncate">
                  {row.label}
                </div>

                {/* Horizontal Cells in Row */}
                <div className="flex-1 grid grid-cols-8 gap-1 py-0.5">
                  {columns.map((col) => {
                    const val = matrixValues[row.id]?.[col.id] || 0;
                    const bgColor = getColorForValue(val);
                    const textColor = getTextColorForValue(val);
                    const isHovered = hoveredCell?.rowId === row.id && hoveredCell?.colId === col.id;

                    return (
                      <div
                        key={col.id}
                        onMouseEnter={() => setHoveredCell({ rowId: row.id, rowLabel: row.label, colId: col.id, colLabel: col.label, val })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{ backgroundColor: bgColor }}
                        className={`h-12 sm:h-14 flex items-center justify-center font-mono font-bold text-xs sm:text-sm rounded transition-all transform cursor-pointer select-none relative ${isHovered
                            ? 'scale-105 z-20 ring-2 ring-white shadow-2xl'
                            : 'hover:opacity-90'
                          }`}
                      >
                        <span style={{ color: textColor }}>{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Horizontal X-axis Labels Below Grid */}
            <div className="flex items-center pt-2">
              {/* Spacer matching Y-axis width */}
              <div className="w-28 sm:w-36 shrink-0" />

              {/* Column Headings Below Grid */}
              <div className="flex-1 grid grid-cols-8 gap-1 text-center font-mono text-[10px] sm:text-[11px] font-bold text-zinc-400">
                {columns.map((col) => (
                  <div key={col.id} className="truncate px-0.5 py-1">
                    {col.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom X-axis Title */}
          <div className="text-center font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest pt-2">
            Store Zones / Planogram Shelves
          </div>
        </div>

        {/* Right Seaborn Scale Colorbar */}
        <div className="flex lg:flex-col items-center gap-2 pl-2 lg:border-l border-zinc-800/80 shrink-0">
          <span className="font-mono text-[10px] font-bold text-zinc-400">100</span>

          {/* Color Gradient Bar */}
          <div className="w-24 lg:w-5 h-5 lg:h-56 rounded border border-zinc-700 bg-gradient-to-t from-[#14082B] via-[#C82A4B] to-[#F5D061] shadow-inner" />

          <span className="font-mono text-[10px] font-bold text-zinc-400">0</span>
        </div>
      </div>

      {/* Cell Hover Telemetry Detail Banner */}
      {hoveredCell ? (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-purple-500/40 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Metric Focus: <strong className="text-purple-300">{hoveredCell.rowLabel}</strong> in Zone <strong className="text-purple-300">{hoveredCell.colLabel}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400">Density Score:</span>
            <span className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-md">
              {hoveredCell.val}%
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 font-mono text-xs text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-600" />
            Hover over any cell in the 2D matrix grid to inspect precise metric values and store zone telemetry.
          </span>
          <span className="text-[10px] text-zinc-600">8 x 5 Data Points</span>
        </div>
      )}
    </div>
  );
}
