import React, { useEffect, useRef, useState } from 'react';
import { Eye, MapPin, Sparkles } from 'lucide-react';

export default function Store2DHeatmapCanvas({ points = [] }) {
  const canvasRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas background
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(0, 0, width, height);

    // Draw Store Architectural Layout Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Architectural Store Structural Outlines
    // Entrance Gate
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, height - 80, 120, 60);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(20, height - 80, 120, 60);
    ctx.fillStyle = '#93C5FD';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('MAIN ENTRANCE', 30, height - 45);

    // Shelves / Rows
    const storeShelves = [
      { x: 130, y: 100, w: 120, h: 220, label: 'ROW 1: DAIRY (A) / SNACKS (B)' },
      { x: 280, y: 100, w: 120, h: 220, label: 'ROW 2: COOKING (A) / UTENSILS (B)' },
      { x: 430, y: 100, w: 120, h: 220, label: 'ROW 3: BOOKS (A) / HYGIENE (B)' },
      { x: 580, y: 100, w: 120, h: 220, label: 'ROW 4: ELECTRONICS (BOTH SIDES)' },
      { x: 280, y: height - 100, w: 420, h: 60, label: 'D-MART EXPRESS CHECKOUT COUNTERS 1-8' },
    ];

    storeShelves.forEach((s) => {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(s.label, s.x + 8, s.y + 20);
    });

    // Render Heatmap Spatial Intensity Radial Gradients
    const activePoints = selectedZone === 'All Zones'
      ? points
      : points.filter((p) => p.zone_name?.toLowerCase().includes(selectedZone.toLowerCase()));

    activePoints.forEach((p) => {
      const px = (p.x_coord / 100) * width;
      const py = (p.y_coord / 100) * height;
      const radius = Math.max(25, 45 * p.intensity);

      const grad = ctx.createRadialGradient(px, py, 2, px, py, radius);
      grad.addColorStop(0, `rgba(239, 68, 68, ${0.85 * p.intensity})`);   // Core Hot Red
      grad.addColorStop(0.4, `rgba(245, 158, 11, ${0.55 * p.intensity})`); // Warm Amber
      grad.addColorStop(0.7, `rgba(16, 185, 129, ${0.3 * p.intensity})`); // Emerald Outer
      grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [points, selectedZone]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = ((x / canvas.width) * 100).toFixed(1);
    const pctY = ((y / canvas.height) * 100).toFixed(1);

    // Collision detection for closest spatial point
    let closest = null;
    let minDistance = 50;

    points.forEach((p) => {
      const px = (p.x_coord / 100) * canvas.width;
      const py = (p.y_coord / 100) * canvas.height;
      const dist = Math.hypot(x - px, y - py);
      if (dist < minDistance) {
        minDistance = dist;
        closest = p;
      }
    });

    setHoverInfo({ x, y, pctX, pctY, point: closest });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 font-sans space-y-4">
      {/* Heatmap Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            2D Spatial Attention Heatmap Canvas
          </h3>
          <p className="text-xs text-slate-400">Real-time eye gaze & customer dwell intensity mapping</p>
        </div>

        {/* Zone Filter Toggles */}
        <div className="flex items-center gap-2">
          {['All Zones', 'Aisle 1', 'Promotional', 'Checkout'].map((z) => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedZone === z
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0B0F17]">
        <canvas
          ref={canvasRef}
          width={760}
          height={420}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          className="w-full h-auto cursor-crosshair block"
        />

        {/* Hover Coordinate Overlay */}
        {hoverInfo && (
          <div
            className="absolute pointer-events-none bg-slate-900/95 border border-purple-500/50 text-[11px] text-slate-100 p-2.5 rounded-lg shadow-2xl space-y-1 font-mono z-40"
            style={{ left: Math.min(hoverInfo.x + 12, 540), top: Math.min(hoverInfo.y + 12, 340) }}
          >
            <div className="font-bold text-purple-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-400" />
              {hoverInfo.point?.zone_name || 'Spatial Coordinate'}
            </div>
            <div>Position: ({hoverInfo.pctX}%, {hoverInfo.pctY}%)</div>
            {hoverInfo.point && (
              <div className="text-emerald-400 font-bold">
                Gaze Intensity: {(hoverInfo.point.intensity * 100).toFixed(1)}%
              </div>
            )}
          </div>
        )}

        {/* Color Scale Bar */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-800 p-2 rounded-lg flex items-center gap-3">
          <span className="text-[10px] font-semibold text-slate-400 font-mono">Low Density</span>
          <div className="w-28 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"></div>
          <span className="text-[10px] font-semibold text-slate-400 font-mono">High Density</span>
        </div>
      </div>
    </div>
  );
}
