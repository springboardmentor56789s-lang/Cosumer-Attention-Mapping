import React, { useState } from 'react';
import { Camera, Grid, List, Maximize2, ShieldCheck, Activity, RefreshCw, X, Play } from 'lucide-react';

export default function CamerasPage() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [fullscreenCam, setFullscreenCam] = useState(null);

  const cameras = [
    { id: 'cam-1', name: 'Cam #01 - Main Foyer & Entrance', fps: '60 FPS', res: '4K UltraHD', status: 'Active', health: '100% Optimal', gazeTracks: 142 },
    { id: 'cam-2', name: 'Cam #02 - Beverages Aisle 1', fps: '60 FPS', res: '1080p FullHD', status: 'Active', health: '98% Optimal', gazeTracks: 88 },
    { id: 'cam-3', name: 'Cam #03 - Snacks & Confectionery', fps: '60 FPS', res: '1080p FullHD', status: 'Active', health: '99% Optimal', gazeTracks: 94 },
    { id: 'cam-4', name: 'Cam #04 - Premium Cosmetics B2', fps: '58 FPS', res: '4K UltraHD', status: 'Active', health: '96% Optimal', gazeTracks: 65 },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Camera className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Live Spatial Camera Streams</h1>
          </div>
          <p className="text-xs text-slate-400">
            60 FPS Edge AI Camera Cluster with Real-Time TensorRT Gaze Model Overlays
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Grid className="w-3.5 h-3.5" /> Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <List className="w-3.5 h-3.5" /> List View
          </button>
        </div>
      </div>

      {/* Grid or List View */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
        {cameras.map((cam) => (
          <div
            key={cam.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition space-y-3 p-4"
          >
            {/* Feed Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-white">{cam.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono rounded">
                  {cam.fps}
                </span>
                <button
                  onClick={() => setFullscreenCam(cam)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                  title="Fullscreen Inspection"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Live Stream Screen */}
            <div className="relative h-56 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/40 to-slate-950 pointer-events-none"></div>

              {/* Bounding box simulation overlay */}
              <div className="absolute top-12 left-16 w-28 h-24 border-2 border-emerald-400/80 rounded-lg p-1 animate-pulse">
                <span className="bg-emerald-500 text-slate-950 font-bold text-[9px] px-1 rounded absolute -top-3 left-0">
                  Gaze Track: 94.2%
                </span>
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400">{cam.res}</span>
                <span className="font-mono text-[10px] text-emerald-400">{cam.health}</span>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Gaze Fixations: <strong className="text-white">{cam.gazeTracks}</strong></span>
                <span className="font-mono text-[10px]">Latency: 14.2ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Inspection Modal */}
      {fullscreenCam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl bg-[#111827] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="text-sm font-bold text-white">{fullscreenCam.name} (Fullscreen Gaze Feed)</h3>
              </div>
              <button onClick={() => setFullscreenCam(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-6">
              <div className="absolute top-1/3 left-1/4 w-48 h-36 border-2 border-emerald-400 rounded-xl p-2 animate-pulse">
                <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded absolute -top-4 left-2">
                  Eye Fixation: 98.4%
                </span>
              </div>

              <div className="text-center text-xs text-slate-400 space-y-2">
                <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                <p>Live 60 FPS Video Feed with Real-Time TensorRT Spatial Attention Bounding Overlay</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
