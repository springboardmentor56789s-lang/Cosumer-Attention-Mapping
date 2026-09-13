import React, { useState, useEffect, useRef } from 'react';
import { Flame, Eye, Play, Pause, RotateCcw, Footprints, Target, Sparkles, Activity, Layers } from 'lucide-react';

export default function BehaviorDrivenHeatmap({ data }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // 0 to 180 seconds
  const [heatmapMode, setHeatmapMode] = useState('gaze'); // 'gaze', 'footfall', 'combined'
  const [activeZone, setActiveZone] = useState('Entrance Gate A');

  const DURATION = 180;

  // Single Customer #104 Behavior Trajectory Telemetry
  const shopper = {
    id: 'Customer #104 (Alex M.)',
    waypoints: [
      { time: 0, x: 120, y: 340, zone: 'Entrance Gate A', action: 'Entered Store Gate A', gazeTarget: 'Entrance Signboard' },
      { time: 30, x: 280, y: 140, zone: 'Row 1: Packaged Snacks', action: 'Fixated on Potato Chips (4.8s Gaze)', gazeTarget: 'Potato Chips 150g (Shelf 3)' },
      { time: 75, x: 450, y: 280, zone: 'Row 2: Cooking Utensils', action: 'Inspected Chef Knife Set (42.0s Dwell)', gazeTarget: 'Chef Knife Display (Shelf 2)' },
      { time: 130, x: 780, y: 120, zone: 'Row 4: Electronics & Audio', action: 'Tested boAt Wireless Earphones (12.1s Gaze)', gazeTarget: 'boAt Earphones Display' },
      { time: 160, x: 580, y: 330, zone: 'Express Checkout Counter 4', action: 'Completed Checkout & Paid', gazeTarget: 'Checkout POS Terminal' },
      { time: 180, x: 920, y: 340, zone: 'Main Exit Gate B', action: 'Exited Store', gazeTarget: 'Exit Door' }
    ]
  };

  // Playback timer loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= DURATION ? 0 : prev + 1));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute Customer #104's exact interpolated position at currentTime
  const getShopperState = (timeSec) => {
    const waypoints = shopper.waypoints;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const w1 = waypoints[i];
      const w2 = waypoints[i + 1];
      if (timeSec >= w1.time && timeSec <= w2.time) {
        const ratio = (timeSec - w1.time) / (w2.time - w1.time || 1);
        return {
          x: w1.x + (w2.x - w1.x) * ratio,
          y: w1.y + (w2.y - w1.y) * ratio,
          zone: w1.zone,
          action: w1.action,
          gazeTarget: w1.gazeTarget,
          angle: Math.atan2(w2.y - w1.y, w2.x - w1.x)
        };
      }
    }
    const last = waypoints[waypoints.length - 1];
    return { x: last.x, y: last.y, zone: last.zone, action: last.action, gazeTarget: last.gazeTarget, angle: 0 };
  };

  // Render HTML5 Behavior-Driven Dynamic Heatmap Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Dark Blueprint Background
    ctx.fillStyle = '#06090F';
    ctx.fillRect(0, 0, width, height);

    // Architectural Grid
    ctx.strokeStyle = '#151D2A';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // 2. Retail Store Shelf Bounding Boxes
    const storeShelves = [
      { name: 'Row 1: Packaged Snacks', x: 200, y: 40, w: 160, h: 200, color: '#3B82F6', label: 'Packaged Snacks' },
      { name: 'Row 2: Cooking Utensils', x: 400, y: 180, w: 160, h: 180, color: '#F59E0B', label: 'Chef Knives & Utensils' },
      { name: 'Row 4: Electronics & Audio', x: 720, y: 40, w: 160, h: 200, color: '#A855F7', label: 'boAt Audio Stand' },
      { name: 'Express Checkout Counter 4', x: 480, y: 300, w: 220, h: 70, color: '#EF4444', label: 'Checkout Register 4' }
    ];

    storeShelves.forEach((s) => {
      ctx.fillStyle = s.color + '12';
      ctx.strokeStyle = s.color + '50';
      ctx.lineWidth = 1.5;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(s.name, s.x + 8, s.y + 16);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px monospace';
      ctx.fillText(s.label, s.x + 8, s.y + 30);
    });

    // 3. Draw Trajectory Trail up to currentTime
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let t = 0; t <= currentTime; t += 2) {
      const pos = getShopperState(t);
      if (t === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Offscreen Heatmap Accumulation Canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d');

    // Accumulate heat samples from t=0 to currentTime based on Customer #104's position & dwell
    for (let t = 0; t <= currentTime; t += 1.5) {
      const pos = getShopperState(t);
      const isDwellZone = pos.zone.includes('Utensils') || pos.zone.includes('Electronics') || pos.zone.includes('Snacks');
      const radius = heatmapMode === 'gaze' ? (isDwellZone ? 45 : 25) : 35;
      const alphaVal = isDwellZone ? 0.08 : 0.04;

      const grad = offCtx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
      grad.addColorStop(0, `rgba(0, 0, 0, ${alphaVal})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      offCtx.fillStyle = grad;
      offCtx.beginPath();
      offCtx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      offCtx.fill();
    }

    // Colorize Offscreen Alpha Buffer into Thermal Gradient Map
    const imgData = offCtx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3];
      if (alpha > 0) {
        const val = alpha / 255;
        let r = 0, g = 0, b = 0;

        if (heatmapMode === 'gaze') {
          // Purple ➔ Blue ➔ Amber ➔ Crimson Red
          if (val < 0.25) { r = 140; g = 50; b = 255; }
          else if (val < 0.5) { r = 59; g = 130; b = 246; }
          else if (val < 0.75) { r = 245; g = 158; b = 11; }
          else { r = 239; g = 68; b = 68; }
        } else if (heatmapMode === 'footfall') {
          // Dark Blue ➔ Cyan ➔ Yellow ➔ Bright Red
          if (val < 0.3) { r = 16; g = 185; b = 129; }
          else if (val < 0.6) { r = 245; g = 158; b = 11; }
          else { r = 239; g = 68; b = 68; }
        } else {
          // Combined Multi-Spectral
          r = Math.floor(val * 255);
          g = Math.floor(Math.sin(val * Math.PI) * 220);
          b = Math.floor((1 - val) * 200);
        }

        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = Math.min(190, Math.floor(val * 240));
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // 5. Current Position Marker for Customer #104
    const currentPos = getShopperState(currentTime);
    setActiveZone(currentPos.zone);

    // Draw Gaze Vector Cone
    if (heatmapMode === 'gaze' || heatmapMode === 'combined') {
      const coneAngle = currentPos.angle || 0;
      const coneDist = 65;
      const fov = Math.PI / 4;

      const gazeGrad = ctx.createRadialGradient(currentPos.x, currentPos.y, 5, currentPos.x, currentPos.y, coneDist);
      gazeGrad.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
      gazeGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.fillStyle = gazeGrad;
      ctx.beginPath();
      ctx.moveTo(currentPos.x, currentPos.y);
      ctx.arc(currentPos.x, currentPos.y, coneDist, coneAngle - fov / 2, coneAngle + fov / 2);
      ctx.closePath();
      ctx.fill();
    }

    // Customer Node Marker
    ctx.shadowColor = '#3B82F6';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(currentPos.x, currentPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(currentPos.x, currentPos.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Customer Tag Callout Badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 1;
    ctx.fillRect(currentPos.x + 12, currentPos.y - 18, 140, 32);
    ctx.strokeRect(currentPos.x + 12, currentPos.y - 18, 140, 32);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Customer #104 (Alex M.)', currentPos.x + 18, currentPos.y - 4);
    ctx.fillStyle = '#A855F7';
    ctx.font = '9px monospace';
    ctx.fillText(currentPos.action, currentPos.x + 18, currentPos.y + 8);

  }, [currentTime, heatmapMode]);

  const currentPos = getShopperState(currentTime);

  return (
    <div className="bg-[#0B0F17] border border-purple-500/30 rounded-3xl p-6 space-y-5 shadow-2xl font-sans text-xs">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold rounded-full text-[11px] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Consumer Behavior Heatmap Engine
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
              Single Customer Sync: Customer #104
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Behavior-Driven Dynamic Thermal Heatmap Generator
          </h2>
          <p className="text-xs text-zinc-400">
            OBJECTIVE: Dynamically aggregate visual gaze attention, shelf fixations, and spatial movement density synchronized with live customer trajectory telemetry.
          </p>
        </div>

        {/* Heatmap Mode Selectors */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 border border-zinc-800 rounded-2xl font-mono text-[11px] shrink-0">
          <button
            onClick={() => setHeatmapMode('gaze')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              heatmapMode === 'gaze' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Gaze Focus Heat
          </button>
          <button
            onClick={() => setHeatmapMode('footfall')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              heatmapMode === 'footfall' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" /> Footfall Trajectory
          </button>
          <button
            onClick={() => setHeatmapMode('combined')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              heatmapMode === 'combined' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Combined Matrix
          </button>
        </div>
      </div>

      {/* Real-time Behavior Heatmap Canvas Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
        <canvas
          ref={canvasRef}
          width={960}
          height={400}
          className="w-full h-auto aspect-[16/9] block"
        />

        {/* Live Active Telemetry Floating Overlay */}
        <div className="absolute top-4 left-4 bg-zinc-950/90 border border-purple-500/40 p-3 rounded-xl backdrop-blur-md font-mono text-xs space-y-1 shadow-2xl">
          <div className="flex items-center gap-2 text-white font-bold">
            <Target className="w-4 h-4 text-purple-400" />
            <span>Active Zone: <strong className="text-purple-300">{currentPos.zone}</strong></span>
          </div>
          <div className="text-[11px] text-zinc-300">
            Target Fixation: <span className="text-amber-300 font-semibold">{currentPos.gazeTarget}</span>
          </div>
          <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800 flex items-center justify-between gap-4">
            <span>Simulation Time: {currentTime}s / 180s</span>
            <span className="text-emerald-400 font-bold">Gaze Sync Active</span>
          </div>
        </div>
      </div>

      {/* Synchronized Playback Controls & Timeline Seekbar Bar */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        {/* Play/Pause/Reset Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-lg"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Heatmap' : 'Play Heatmap'}</span>
          </button>

          <button
            onClick={() => { setCurrentTime(0); setIsPlaying(true); }}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition"
            title="Reset Heatmap Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex items-center gap-3 flex-1 w-full">
          <span className="text-zinc-400 text-[11px] shrink-0">0s</span>
          <input
            type="range"
            min="0"
            max={DURATION}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full accent-purple-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <span className="text-purple-300 font-bold text-[11px] shrink-0">{currentTime}s / {DURATION}s</span>
        </div>
      </div>
    </div>
  );
}
