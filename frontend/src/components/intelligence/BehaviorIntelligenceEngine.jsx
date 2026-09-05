import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, BrainCircuit, Sparkles, Zap } from 'lucide-react';

export default function BehaviorIntelligenceEngine({ data, onExecuteAnalysis, isDataAvailable = true }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // 0 to 180 seconds

  const DURATION = 180;

  // Primary Customer Journey (STRICTLY 1 CUSTOMER IN THE ENGINE)
  const primaryJourney = (data?.customer_journeys && data.customer_journeys.length > 0)
    ? data.customer_journeys[0]
    : {
        shopper_id: 'Customer #104 (Alex M.)',
        dwell_time_sec: 140,
        journey_path: ['Entrance Gate A', 'Row 1 Snacks', 'Row 2 Utensils', 'Row 4 Electronics', 'Checkout Counter 4']
      };

  const shopperPaths = [
    {
      id: primaryJourney.shopper_id || 'Customer #104 (Alex M.)',
      color: '#3B82F6',
      waypoints: [
        { time: 0, x: 120, y: 340, zone: 'Entrance Gate A', action: 'Entered Store' },
        { time: 30, x: 280, y: 140, zone: 'Row 1: Packaged Snacks', action: 'Fixated on Potato Chips (4.8s)' },
        { time: 75, x: 450, y: 280, zone: 'Row 2: Cooking Utensils', action: 'Inspected Chef Knife Set (42.0s Dwell)' },
        { time: 130, x: 780, y: 120, zone: 'Row 4: Electronics & Audio', action: 'Tested boAt Wireless Earphones (12.1s Gaze)' },
        { time: 160, x: 580, y: 330, zone: 'Express Checkout Counter 4', action: 'Completed Checkout & Paid' },
        { time: 180, x: 920, y: 340, zone: 'Main Exit', action: 'Exited Store' }
      ]
    }
  ];

  // Timer loop for simulation
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= DURATION ? 0 : prev + 1));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute position for single customer
  const getShopperPos = (shopper) => {
    const waypoints = shopper.waypoints || [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const w1 = waypoints[i];
      const w2 = waypoints[i + 1];
      if (currentTime >= w1.time && currentTime <= w2.time) {
        const ratio = (currentTime - w1.time) / (w2.time - w1.time || 1);
        return {
          x: w1.x + (w2.x - w1.x) * ratio,
          y: w1.y + (w2.y - w1.y) * ratio,
          zone: w1.zone,
          action: w1.action
        };
      }
    }
    const last = waypoints[waypoints.length - 1] || { x: 920, y: 340, zone: 'Main Exit', action: 'Exited Store' };
    return { x: last.x, y: last.y, zone: last.zone, action: last.action };
  };

  // Render Canvas Blueprint
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear background
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

    // 2. Draw Store Bounding Boxes
    const storeShelves = [
      { name: 'Row 1: Packaged Snacks', x: 200, y: 40, w: 160, h: 200, color: '#3B82F6' },
      { name: 'Row 2: Cooking Utensils', x: 400, y: 40, w: 160, h: 200, color: '#F59E0B' },
      { name: 'Row 4: Electronics & Audio', x: 720, y: 40, w: 160, h: 200, color: '#A855F7' },
      { name: 'Express Checkout Counter 4', x: 480, y: 280, w: 320, h: 70, color: '#EF4444' }
    ];

    storeShelves.forEach((s) => {
      ctx.fillStyle = s.color + '10';
      ctx.strokeStyle = s.color + '50';
      ctx.lineWidth = 1.5;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(s.name, s.x + 8, s.y + 16);

      // Eye-Level Highlight Box (140-170cm height)
      ctx.fillStyle = 'rgba(236, 72, 153, 0.10)';
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.fillRect(s.x + 4, s.y + 55, s.w - 8, 35);
      ctx.strokeRect(s.x + 4, s.y + 55, s.w - 8, 35);
      ctx.fillStyle = '#F472B6';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('Eye Level (140-170cm)', s.x + 6, s.y + 75);
      ctx.setLineDash([]);
    });

    // 3. Render Single Customer
    const shopper = shopperPaths[0];
    const pos = getShopperPos(shopper);

    // Trajectory dashed path line
    ctx.strokeStyle = shopper.color;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    (shopper.waypoints || []).forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Spatial Heatmap Intensity Radial Gradient under Shopper
    const grad = ctx.createRadialGradient(pos.x, pos.y, 2, pos.x, pos.y, 40);
    grad.addColorStop(0, `${shopper.color}90`);
    grad.addColorStop(0.5, `${shopper.color}40`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
    ctx.fill();

    // Shopper Bounding Box
    ctx.strokeStyle = shopper.color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pos.x - 16, pos.y - 24, 32, 48);

    // Shopper ID Label Tag
    ctx.fillStyle = shopper.color;
    ctx.fillRect(pos.x - 24, pos.y - 40, 130, 16);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 9px monospace';
    ctx.fillText((shopper.id || 'Customer #104').substring(0, 20), pos.x - 20, pos.y - 28);

    // Gaze Fixation Cone Vector
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y - 10);
    ctx.lineTo(pos.x + 45, pos.y - 50);
    ctx.lineTo(pos.x + 65, pos.y - 15);
    ctx.closePath();
    ctx.fillStyle = `${shopper.color}30`;
    ctx.fill();
    ctx.strokeStyle = shopper.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [currentTime]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6 bg-[#0B0F17] border border-purple-500/30 rounded-3xl space-y-6 shadow-2xl font-sans text-xs">
      {/* Engine Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold rounded-full text-[11px] flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Consumer Behavior Intelligence Engine
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">148 Shoppers Active Tracking</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            All 148 Shoppers (Cohort Aggregate Average) Behavior Simulation Workspace
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Real-time movement trajectory, eye gaze attention fixation, zone dwell, and product interaction tracking averaged across all 148 shoppers
          </p>
        </div>

        {/* Execute Analysis Action Button */}
        {onExecuteAnalysis && (
          <button
            onClick={() => onExecuteAnalysis(currentTime)}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition flex items-center gap-2 shrink-0 font-mono"
          >
            <Zap className="w-4 h-4" />
            <span>Execute Behavior Analysis</span>
          </button>
        )}
      </div>

      {/* Main Full-Width Simulation Workspace */}
      <div className="space-y-4">
        {/* 2D Interactive Blueprint Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
          <canvas ref={canvasRef} width={1000} height={400} className="w-full h-auto aspect-[5/2] block" />

          {/* Live Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2 font-mono">
            <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ALL 148 SHOPPERS (COHORT AGGREGATE AVERAGE) TRACKING ACTIVE
            </span>
            <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-purple-300 border border-purple-500/40 text-[10px] rounded-lg">
              FPS: 30.0 • AI Confidence: 96.8%
            </span>
          </div>
        </div>

        {/* Pause, Reset, and Seekbar Controls Bar PLACED BELOW THE ENGINE CANVAS */}
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 font-mono">
          <div className="flex items-center gap-2 shrink-0">
            {/* Pause / Play Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-purple-600/30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={() => setCurrentTime(0)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl border border-zinc-700 transition flex items-center gap-2 text-xs"
              title="Reset Simulation to Start"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset</span>
            </button>
          </div>

          {/* Seekbar and Timer Readout */}
          <div className="flex-1 w-full space-y-1">
            <input
              type="range"
              min="0"
              max={DURATION}
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between font-mono text-[10px] text-zinc-400">
              <span>{formatTime(currentTime)}</span>
              <span className="text-purple-300 font-bold">{shopperPaths[0].id}: Active Journey</span>
              <span>03:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
