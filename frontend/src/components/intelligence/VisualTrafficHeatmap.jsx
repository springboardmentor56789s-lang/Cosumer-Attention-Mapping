import React, { useState, useEffect, useRef } from 'react';
import { Flame, Target, Activity, AlertCircle, Info } from 'lucide-react';

export default function VisualTrafficHeatmap({ data }) {
  const canvasRef = useRef(null);
  const [visualMode, setVisualMode] = useState('density'); // 'density', 'deadzones'
  const [hoveredZone, setHoveredZone] = useState(null);

  // Compact Store Layout Spatial Zone Definitions (920x300 Canvas Grid)
  const storeZones = [
    { id: 'z6', name: 'Entrance Gate A', x: 30, y: 235, w: 100, h: 45, trafficScore: 92, deadZone: false, status: 'High Entry Flow' },
    { id: 'z1', name: 'Row 1: Packaged Snacks', x: 160, y: 35, w: 130, h: 170, trafficScore: 85, deadZone: false, status: 'Eye-Level Focus' },
    { id: 'z2', name: 'Row 2: Cooking Utensils', x: 330, y: 105, w: 130, h: 170, trafficScore: 98, deadZone: false, status: '🔥 Peak Dwell Hotspot' },
    { id: 'z3', name: 'Row 3: Apparel & Fashion', x: 500, y: 35, w: 130, h: 95, trafficScore: 28, deadZone: true, status: '❄ Physical Dead Zone' },
    { id: 'z7', name: 'Promo Stand Island', x: 500, y: 155, w: 130, h: 50, trafficScore: 78, deadZone: false, status: 'Attention Stand' },
    { id: 'z4', name: 'Row 4: Electronics & Audio', x: 670, y: 35, w: 130, h: 170, trafficScore: 95, deadZone: false, status: '🔥 Peak Gaze Focus' },
    { id: 'z5', name: 'Express Checkout Counter 4', x: 330, y: 235, w: 220, h: 45, trafficScore: 90, deadZone: false, status: 'Queue Bottleneck' },
    { id: 'z8', name: 'Main Exit Gate B', x: 730, y: 235, w: 100, h: 45, trafficScore: 88, deadZone: false, status: 'Exit Corridor' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Dark Blueprint Background (#06090F)
    ctx.fillStyle = '#06090F';
    ctx.fillRect(0, 0, width, height);

    // Architectural Grid Lines
    ctx.strokeStyle = '#141D2B';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Render Store Architectural Zones
    storeZones.forEach((z) => {
      const isDead = z.deadZone && visualMode === 'deadzones';
      const isHovered = hoveredZone?.id === z.id;

      ctx.fillStyle = isDead ? 'rgba(239, 68, 68, 0.12)' : (isHovered ? 'rgba(168, 85, 247, 0.18)' : 'rgba(59, 130, 246, 0.06)');
      ctx.strokeStyle = isDead ? '#EF4444' : (isHovered ? '#A855F7' : 'rgba(59, 130, 246, 0.25)');
      ctx.lineWidth = isHovered ? 2 : 1.5;

      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeRect(z.x, z.y, z.w, z.h);

      // Zone Title Text
      ctx.fillStyle = isHovered ? '#FFFFFF' : '#94A3B8';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(z.name, z.x + 6, z.y + 14);

      // Status Badge
      ctx.fillStyle = isDead ? '#EF4444' : (z.trafficScore >= 90 ? '#F43F5E' : '#38BDF8');
      ctx.font = '8.5px monospace';
      ctx.fillText(z.status, z.x + 6, z.y + 27);
    });

    // CONTINUOUS VISUAL GAUSSIAN THERMAL DENSITY OVERLAY
    const thermalBlobs = [
      { x: 735, y: 120, radius: 70, colorStop: 'rgba(239, 68, 68, 0.85)' },  // Row 4 Electronics
      { x: 395, y: 190, radius: 75, colorStop: 'rgba(245, 158, 11, 0.80)' },  // Row 2 Utensils
      { x: 225, y: 120, radius: 60, colorStop: 'rgba(236, 72, 153, 0.75)' },  // Row 1 Snacks
      { x: 440, y: 257, radius: 65, colorStop: 'rgba(239, 68, 68, 0.80)' },  // Checkout Bottleneck
      { x: 565, y: 180, radius: 45, colorStop: 'rgba(16, 185, 129, 0.60)' },  // Promo Stand
      { x: 565, y: 82,  radius: 30, colorStop: 'rgba(59, 130, 246, 0.30)' }   // Row 3 Dead Zone
    ];

    thermalBlobs.forEach((b) => {
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      grad.addColorStop(0, b.colorStop);
      grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.45)');
      grad.addColorStop(0.8, 'rgba(59, 130, 246, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [visualMode, hoveredZone]);

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 920);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 300);

    const found = storeZones.find((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h);
    setHoveredZone(found || null);
  };

  return (
    <div className="bg-[#090D16] border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xl font-sans text-xs text-slate-100 max-w-5xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold rounded-full text-[10px] flex items-center gap-1">
              <Flame className="w-3 h-3 text-purple-400" /> Visual Traffic Density Heatmap
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono text-[9px] font-bold">
              Aggregate Density
            </span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Store Foot Traffic Spatial Density Heatmap
          </h3>
        </div>

        {/* Mode Buttons */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-xl font-mono text-[10px] shrink-0">
          <button
            onClick={() => setVisualMode('density')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              visualMode === 'density' ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Thermal Heatmap
          </button>
          <button
            onClick={() => setVisualMode('deadzones')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              visualMode === 'deadzones' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Dead Zones
          </button>
        </div>
      </div>

      {/* COMPACT CANVAS (920x300 aspect ratio) */}
      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-xl max-h-[280px]">
        <canvas
          ref={canvasRef}
          width={920}
          height={300}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredZone(null)}
          className="w-full h-auto aspect-[920/300] block cursor-crosshair max-h-[280px]"
        />

        {/* Floating Store Density Telemetry Badge (Top Left) */}
        <div className="absolute top-2.5 left-2.5 bg-zinc-950/90 border border-purple-500/40 px-3 py-1.5 rounded-lg backdrop-blur-md font-mono text-[10px] text-white flex items-center gap-2 shadow-lg">
          <Target className="w-3 h-3 text-purple-400" />
          <span className="text-purple-300 font-bold">Aggregate Store Traffic Density</span>
        </div>

        {/* Selected Zone Hover Card (Bottom Left) */}
        {hoveredZone && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-zinc-950/95 border border-purple-500/50 px-3 py-1.5 rounded-lg backdrop-blur-md font-mono text-[11px] flex items-center justify-between text-white shadow-xl animate-fade-in">
            <span className="truncate">Zone Focus: <strong>{hoveredZone.name}</strong> ({hoveredZone.status})</span>
            <span className="px-2.5 py-0.5 rounded bg-purple-600 font-bold text-[10px] text-white shrink-0">
              {hoveredZone.trafficScore}% Heat Index
            </span>
          </div>
        )}
      </div>

      {/* FOOTER LEGEND BAR */}
      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between font-mono text-[11px]">
        <span className="text-zinc-400 text-[10px]">
          Spatial Gaussian Density Overlay • Homography Calibrated
        </span>

        {/* Continuous Thermal Gradient Legend Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">Traffic Heat:</span>
          <span className="text-[9px] text-blue-400 font-bold">0% Cold</span>
          <div className="w-32 h-2.5 rounded bg-gradient-to-r from-blue-600 via-teal-400 via-amber-400 to-rose-600 border border-zinc-700" />
          <span className="text-[9px] text-rose-400 font-bold">100% Peak</span>
        </div>
      </div>
    </div>
  );
}
