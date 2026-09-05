import React, { useState, useRef } from 'react';
import { Eye, Sparkles, MapPin, Layers, Grid, Target, Activity } from 'lucide-react';

export default function AttentionHeatmap({ coordinates }) {
  const [activePoint, setActivePoint] = useState(null);
  const [viewMode, setViewMode] = useState('gradient'); // 'gradient', 'contour', 'nodes'
  const [hoverCoords, setHoverCoords] = useState(null);
  const containerRef = useRef(null);

  const defaultPoints = [
    { x: 20, y: 25, intensity: 0.55, zone: 'Entrance Gate A', shelf: 'Promo Stand E' },
    { x: 30, y: 35, intensity: 0.78, zone: 'Row 1: Packaged Snacks', shelf: 'Shelf 3 (Eye Level)' },
    { x: 45, y: 55, intensity: 0.92, zone: 'Row 2: Cooking Utensils', shelf: 'Chef Knife Display' },
    { x: 60, y: 30, intensity: 0.68, zone: 'Row 3: Hygiene & Personal', shelf: 'Organic Soaps Shelf 2' },
    { x: 78, y: 25, intensity: 0.96, zone: 'Row 4: Electronics & Audio', shelf: 'boAt Wireless Earphones Stand' },
    { x: 58, y: 75, intensity: 0.84, zone: 'Express Checkout Counter 4', shelf: 'Impulse Candy Rack' }
  ];

  const points = (coordinates && coordinates.length > 0) ? coordinates : defaultPoints;

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setHoverCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const getIntensityColor = (val) => {
    if (val >= 0.88) return { label: 'Extreme Focus', bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/40' };
    if (val >= 0.70) return { label: 'High Focus', bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/40' };
    if (val >= 0.50) return { label: 'Moderate Focus', bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/40' };
    return { label: 'Low Focus', bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/40' };
  };

  return (
    <div className="bg-[#0B0F17] border border-purple-500/30 rounded-2xl p-5 space-y-4 font-sans text-xs shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold rounded-full text-[10px] flex items-center gap-1">
              <Eye className="w-3 h-3 text-purple-400 animate-pulse" /> Gaze Focus Matrix
            </span>
            <span className="text-zinc-500 font-mono text-[10px]">3D Homography Projection</span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            Visual Attention & Focal Point Heatmap
          </h3>
          <p className="text-[11px] text-zinc-400">
            OBJECTIVE: Analyze eye-gaze fixations and shelf engagement density to optimize product placement.
          </p>
        </div>

        {/* View Mode Mode Toggles */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-xl font-mono text-[10px] shrink-0">
          <button
            onClick={() => setViewMode('gradient')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${viewMode === 'gradient' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Layers className="w-3 h-3" /> Gradient
          </button>
          <button
            onClick={() => setViewMode('contour')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${viewMode === 'contour' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Grid className="w-3 h-3" /> Contour Grid
          </button>
          <button
            onClick={() => setViewMode('nodes')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${viewMode === 'nodes' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Target className="w-3 h-3" /> Pinpoints
          </button>
        </div>
      </div>

      {/* Interactive Floorplan Heatmap Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverCoords(null)}
        className="relative w-full h-80 bg-black border border-zinc-800 rounded-xl overflow-hidden cursor-crosshair flex items-center justify-center shadow-2xl"
      >
        {/* Floorplan Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-40"></div>

        {/* Store Shelf Layout Outlines */}
        <div className="absolute top-4 left-6 w-36 h-28 border border-purple-500/30 bg-purple-500/5 rounded-lg p-2 font-mono text-[9px] text-purple-400 pointer-events-none">
          Row 1: Packaged Snacks
        </div>
        <div className="absolute top-4 left-48 w-36 h-28 border border-amber-500/30 bg-amber-500/5 rounded-lg p-2 font-mono text-[9px] text-amber-400 pointer-events-none">
          Row 2: Cooking Utensils
        </div>
        <div className="absolute top-4 right-6 w-36 h-28 border border-purple-500/30 bg-purple-500/5 rounded-lg p-2 font-mono text-[9px] text-purple-400 pointer-events-none">
          Row 4: Electronics
        </div>
        <div className="absolute bottom-4 left-48 w-64 h-16 border border-rose-500/30 bg-rose-500/5 rounded-lg p-2 font-mono text-[9px] text-rose-400 pointer-events-none">
          Express Checkout Counter 4
        </div>

        {/* Contour Grid Overlay Mode */}
        {viewMode === 'contour' && (
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,#a855f7_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
        )}

        {/* Render Focal Heatmap Points */}
        {points.map((p, idx) => {
          const intensity = p.intensity || 0.5;
          const size = Math.max(36, intensity * 80);
          const meta = getIntensityColor(intensity);
          const isSelected = activePoint === idx;

          return (
            <div key={idx}>
              {/* Radial Heat Gradient Layer */}
              {(viewMode === 'gradient' || viewMode === 'contour') && (
                <div
                  onMouseEnter={() => setActivePoint(idx)}
                  onMouseLeave={() => setActivePoint(null)}
                  className={`absolute rounded-full transition-all duration-300 cursor-pointer ${meta.bg} ${isSelected ? 'scale-125 z-30 blur-sm ring-2 ring-white' : 'blur-lg'
                    }`}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    opacity: isSelected ? 0.95 : Math.min(0.85, Math.max(0.4, intensity)),
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}

              {/* Pinpoint Vector Nodes Mode */}
              <div
                onMouseEnter={() => setActivePoint(idx)}
                onMouseLeave={() => setActivePoint(null)}
                className={`absolute z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'
                  }`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className={`w-4 h-4 rounded-full ${meta.bg} border-2 border-white shadow-lg flex items-center justify-center`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Hover Coordinate Radar Tooltip */}
        {hoverCoords && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-300 pointer-events-none flex items-center gap-2">
            <Activity className="w-3 h-3 text-purple-400" />
            <span>X: {hoverCoords.x}% • Y: {hoverCoords.y}%</span>
          </div>
        )}

        {/* Selected Focal Node Detail Popup */}
        {activePoint !== null && points[activePoint] && (
          <div
            className="absolute z-40 pointer-events-none bg-zinc-950/95 border border-purple-500/50 p-3 rounded-xl shadow-2xl space-y-1.5 font-mono text-xs"
            style={{
              left: `${Math.min(Math.max(points[activePoint].x, 20), 80)}%`,
              top: `${Math.min(Math.max(points[activePoint].y - 25, 15), 75)}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex items-center gap-2 text-white font-bold">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>{points[activePoint].zone || 'Attention Hotspot'}</span>
            </div>
            <div className="text-[11px] text-zinc-300">
              Display Target: <strong className="text-purple-300">{points[activePoint].shelf || 'Configured Display'}</strong>
            </div>
            <div className="flex items-center justify-between gap-4 text-[10px] pt-1 border-t border-zinc-800">
              <span className="text-zinc-400">Coords: ({points[activePoint].x}%, {points[activePoint].y}%)</span>
              <span className="text-purple-400 font-bold">{(points[activePoint].intensity * 100).toFixed(1)}% Gaze</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Hotspot Bottom Summary Card */}
      {activePoint !== null && points[activePoint] && (
        <div className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${getIntensityColor(points[activePoint].intensity).border} bg-purple-950/20`}>
          <div className="flex items-center gap-2 text-purple-200">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Focal Spot #{activePoint + 1}: <strong>{points[activePoint].zone}</strong> ({points[activePoint].shelf})</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getIntensityColor(points[activePoint].intensity).bg} text-white`}>
            {getIntensityColor(points[activePoint].intensity).label} ({(points[activePoint].intensity * 100).toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  );
}
