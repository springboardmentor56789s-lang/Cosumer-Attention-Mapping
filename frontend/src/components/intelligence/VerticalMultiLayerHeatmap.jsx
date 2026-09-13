import React, { useState, useEffect, useRef } from 'react';
import { Eye, Sparkles, Clock, Footprints, Hand, CheckCircle2, Activity, MapPin, Zap, ChevronRight, Layers, Sliders } from 'lucide-react';

export default function VerticalMultiLayerHeatmap({ data }) {
  const [activeLayer, setActiveLayer] = useState('gaze'); // 'gaze', 'attention', 'dwell', 'footfall', 'interaction', 'all'
  const [hoverCoords, setHoverCoords] = useState(null);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const canvasRef = useRef(null);

  const layers = [
    {
      id: 'gaze',
      name: 'Gaze Vectors',
      subtitle: 'Eye Projection & Head Orientation',
      icon: Eye,
      color: '#A855F7',
      borderColor: 'border-purple-500/40',
      bgGlow: 'bg-purple-500/10',
      badgeBg: 'bg-purple-600 text-white',
      whatItTracks: 'Eye gaze projection vectors, head orientation angles, and line-of-sight target intersections.',
      telemetry: 'Primary Gaze Vector: 12.1s Fixation on boAt Earphones Display (Row 4 Electronics)',
      hotspots: [
        { x: 28, y: 14, intensity: 0.88, label: 'Gaze Vector: Potato Chips (4.8s)', zone: 'Row 1: Packaged Snacks' },
        { x: 45, y: 28, intensity: 0.94, label: 'Gaze Vector: Chef Knife Set (8.4s)', zone: 'Row 2: Cooking Utensils' },
        { x: 78, y: 12, intensity: 0.98, label: 'Gaze Vector: boAt Wireless (12.1s)', zone: 'Row 4: Electronics & Audio' }
      ]
    },
    {
      id: 'attention',
      name: 'Attention Focus',
      subtitle: 'Visual Shelf Engagement Density',
      icon: Sparkles,
      color: '#EC4899',
      borderColor: 'border-pink-500/40',
      bgGlow: 'bg-pink-500/10',
      badgeBg: 'bg-pink-600 text-white',
      whatItTracks: 'Visual shelf attention density, eye-level focus zones (140-170cm height), and planogram attraction.',
      telemetry: 'Shelf Focus Density: 48.2% Concentration on Eye-Level Shelf 3 (Row 1 Snacks)',
      hotspots: [
        { x: 28, y: 14, intensity: 0.95, label: 'Eye-Level Focus (140-170cm): Shelf 3 Snacks', zone: 'Row 1: Packaged Snacks' },
        { x: 45, y: 28, intensity: 0.85, label: 'Mid-Shelf Focus: Cooking Utensils', zone: 'Row 2: Cooking Utensils' },
        { x: 78, y: 12, intensity: 0.92, label: 'Display Stand Focus: boAt Electronics', zone: 'Row 4: Electronics & Audio' }
      ]
    },
    {
      id: 'dwell',
      name: 'Dwell Time',
      subtitle: 'Stationary Duration & Hesitation Hotspots',
      icon: Clock,
      color: '#F59E0B',
      borderColor: 'border-amber-500/40',
      bgGlow: 'bg-amber-500/10',
      badgeBg: 'bg-amber-500 text-black',
      whatItTracks: 'Shopper stationary dwell duration per shelf zone, product hesitation intervals, and queue bottlenecks.',
      telemetry: 'Peak Dwell Duration: 42.0s Stationary Dwell in Row 2 Cooking Utensils',
      hotspots: [
        { x: 45, y: 28, intensity: 0.98, label: 'Extended Dwell Hotspot: Row 2 Utensils (42.0s)', zone: 'Row 2: Cooking Utensils' },
        { x: 58, y: 33, intensity: 0.88, label: 'Queue Dwell Bottleneck: Checkout Counter 4 (25.0s)', zone: 'Express Checkout Counter 4' }
      ]
    },
    {
      id: 'footfall',
      name: 'Footfall Trajectory',
      subtitle: 'Movement Paths & Aisle Congestion Flow',
      icon: Footprints,
      color: '#3B82F6',
      borderColor: 'border-blue-500/40',
      bgGlow: 'bg-blue-500/10',
      badgeBg: 'bg-blue-600 text-white',
      whatItTracks: 'Shopper physical movement trajectories, centroid tracking, aisle traffic flow, and dead zones.',
      telemetry: 'Dominant Trajectory: Entrance Gate A ➔ Row 1 ➔ Row 2 ➔ Row 4 ➔ Checkout Counter 4',
      hotspots: [
        { x: 12, y: 34, intensity: 0.50, label: 'Entrance Gate A Entry Centroid', zone: 'Entrance Gate A' },
        { x: 28, y: 14, intensity: 0.85, label: 'Row 1 Packaged Snacks Footfall', zone: 'Row 1: Packaged Snacks' },
        { x: 45, y: 28, intensity: 0.90, label: 'Row 2 Cooking Utensils Trajectory', zone: 'Row 2: Cooking Utensils' },
        { x: 78, y: 12, intensity: 0.88, label: 'Row 4 Electronics Trajectory', zone: 'Row 4: Electronics & Audio' },
        { x: 58, y: 33, intensity: 0.92, label: 'Express Checkout Counter 4 Queue', zone: 'Express Checkout Counter 4' }
      ]
    },
    {
      id: 'interaction',
      name: 'Interaction & Reach',
      subtitle: 'Touch, Pick & Physical Handling Gestures',
      icon: Hand,
      color: '#10B981',
      borderColor: 'border-emerald-500/40',
      bgGlow: 'bg-emerald-500/10',
      badgeBg: 'bg-emerald-600 text-white',
      whatItTracks: 'Physical touch gestures, shelf pick-and-place handling, conversion intent vs product bounce.',
      telemetry: 'Physical Touch Events: 7 Shelf Pick-and-Place Interactions Recorded (71.4% Conversion)',
      hotspots: [
        { x: 28, y: 14, intensity: 0.90, label: 'Shelf Touch Pick: Potato Chips 150g (5 Picks)', zone: 'Row 1: Packaged Snacks' },
        { x: 78, y: 12, intensity: 0.94, label: 'Display Touch Pick: boAt Wireless (4 Picks)', zone: 'Row 4: Electronics & Audio' }
      ]
    }
  ];

  const currentLayer = layers.find((l) => l.id === activeLayer) || layers[0];

  // Mouse movement on Canvas
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setHoverCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });

    // Check collision with current hotspots
    let found = null;
    const renderLayers = activeLayer === 'all' ? layers : [currentLayer];
    renderLayers.forEach((layer) => {
      layer.hotspots.forEach((h) => {
        const dist = Math.hypot(h.x - x, h.y - y);
        if (dist < 8) found = { ...h, color: layer.color, layerName: layer.name };
      });
    });
    setActiveHotspot(found);
  };

  // Render HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#06090F';
    ctx.fillRect(0, 0, width, height);

    // Architectural Grid
    ctx.strokeStyle = '#141D2B';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 35) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 35) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Store Aisle Shelves Bounding Boxes
    const storeShelves = [
      { name: 'Row 1: Packaged Snacks', x: width * 0.20, y: height * 0.10, w: width * 0.16, h: height * 0.50, color: '#3B82F6' },
      { name: 'Row 2: Cooking Utensils', x: width * 0.40, y: height * 0.10, w: width * 0.16, h: height * 0.50, color: '#F59E0B' },
      { name: 'Row 4: Electronics', x: width * 0.72, y: height * 0.10, w: width * 0.16, h: height * 0.50, color: '#A855F7' },
      { name: 'Express Checkout 4', x: width * 0.48, y: height * 0.70, w: width * 0.32, h: height * 0.18, color: '#EF4444' }
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

      // Eye-Level Highlight Box (140-170cm)
      if (activeLayer === 'attention' || activeLayer === 'gaze' || activeLayer === 'all') {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.12)';
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
        ctx.setLineDash([2, 2]);
        ctx.fillRect(s.x + 4, s.y + 55, s.w - 8, 35);
        ctx.strokeRect(s.x + 4, s.y + 55, s.w - 8, 35);
        ctx.fillStyle = '#F472B6';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('Eye Level (140-170cm)', s.x + 6, s.y + 75);
        ctx.setLineDash([]);
      }
    });

    // Render Layers
    const renderLayers = activeLayer === 'all' ? layers : [currentLayer];
    renderLayers.forEach((layer) => {
      // Draw Footfall Trajectory Line if Footfall
      if (layer.id === 'footfall') {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        layer.hotspots.forEach((h, i) => {
          const px = (h.x / 100) * width;
          const py = (h.y / 100) * height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Render Thermal Hotspots
      layer.hotspots.forEach((h) => {
        const px = (h.x / 100) * width;
        const py = (h.y / 100) * height;
        const rad = 45 * h.intensity;
        const isHovered = activeHotspot && activeHotspot.x === h.x && activeHotspot.y === h.y;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, isHovered ? rad * 1.25 : rad);
        grad.addColorStop(0, layer.color + (isHovered ? 'FF' : 'E0'));
        grad.addColorStop(0.5, layer.color + '60');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, isHovered ? rad * 1.25 : rad, 0, Math.PI * 2);
        ctx.fill();

        // Node Pin Marker
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, isHovered ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Callout Badge
        ctx.fillStyle = 'rgba(6, 9, 15, 0.94)';
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1;
        ctx.fillRect(px - 85, py - rad - 20, 170, 22);
        ctx.strokeRect(px - 85, py - rad - 20, 170, 22);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(h.label, px - 78, py - rad - 6);
      });
    });

  }, [activeLayer, activeHotspot]);

  return (
    <div className="bg-[#090D16] border border-purple-500/30 rounded-3xl p-6 space-y-6 shadow-2xl font-sans text-xs">
      {/* 1. Main Heatmap Canvas Workspace (Top) */}
      <div className="space-y-3">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] flex items-center gap-1 ${activeLayer === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : currentLayer.badgeBg}`}>
                <Layers className="w-3 h-3" /> Mode: {activeLayer === 'all' ? 'All Multi-Layers Combined' : currentLayer.name}
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">Real-Time Store Spatial Matrix</span>
            </div>
            <p className="text-xs text-zinc-300 font-mono">
              {activeLayer === 'all' ? 'Multi-Layer Overlay Active: Combining Gaze, Attention, Dwell, Footfall, and Interaction density' : currentLayer.telemetry}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveLayer(activeLayer === 'all' ? 'gaze' : 'all')}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition border flex items-center gap-1.5 ${
                activeLayer === 'all'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {activeLayer === 'all' ? 'Single Layer View' : 'Combine All Layers'}
            </button>
          </div>
        </div>

        {/* HTML5 Canvas Thermal Renderer */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={850}
            height={380}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => { setHoverCoords(null); setActiveHotspot(null); }}
            className="w-full h-auto aspect-[16/9] block"
          />

          {/* Floating Live Radar Cursor */}
          {hoverCoords && (
            <div className="absolute top-3 left-3 bg-black/80 border border-purple-500/40 px-3 py-1.5 rounded-xl font-mono text-[10px] text-purple-300 backdrop-blur-md flex items-center gap-2 shadow-2xl">
              <Activity className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>Spatial Radar: ({hoverCoords.x}%, {hoverCoords.y}%)</span>
            </div>
          )}

          {/* Selected Hotspot Detail Card */}
          {activeHotspot && (
            <div className="absolute bottom-3 left-3 right-3 bg-zinc-950/95 border border-purple-500/50 p-3 rounded-xl backdrop-blur-md font-mono text-xs flex items-center justify-between text-white shadow-2xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Node Focus: <strong>{activeHotspot.label}</strong> ({activeHotspot.zone})</span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white">
                {(activeHotspot.intensity * 100).toFixed(1)}% Heat Intensity
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Heatmap Metric Rows Stacked Vertically Below Canvas */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-white tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Multi-Metric Heatmap Layers (Select a vertical row below to switch canvas mode)
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">5 Metric Modalities Configured</span>
        </div>

        {/* Vertical Rows Stack */}
        <div className="space-y-2.5">
          {layers.map((layer, index) => {
            const IconComp = layer.icon;
            const isSelected = activeLayer === layer.id;

            return (
              <div
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs ${
                  isSelected
                    ? `${layer.borderColor} ${layer.bgGlow} bg-zinc-900 ring-2 ring-purple-500/20 shadow-xl`
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 text-zinc-400'
                }`}
              >
                {/* Left Info Column */}
                <div className="flex items-center gap-3.5">
                  <div className="text-zinc-600 font-bold text-sm min-w-[20px]">
                    0{index + 1}
                  </div>
                  <div className={`p-2.5 rounded-xl border ${layer.borderColor} bg-zinc-900 shrink-0`}>
                    <IconComp className="w-4 h-4" style={{ color: layer.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{layer.name}</h4>
                      <span className="text-[10px] text-zinc-400">({layer.subtitle})</span>
                      {isSelected && (
                        <span className="px-2 py-0.2 bg-purple-600 text-white rounded text-[9px] font-bold">
                          ACTIVE CANVAS
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                      {layer.whatItTracks}
                    </p>
                  </div>
                </div>

                {/* Right Telemetry Column */}
                <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60 justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 block">LIVE TELEMETRY READOUT</span>
                    <span className="text-[11px] font-bold text-white" style={{ color: isSelected ? layer.color : '#E2E8F0' }}>
                      {layer.telemetry.split(':')[1] || layer.telemetry}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-purple-400' : 'text-zinc-600'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
