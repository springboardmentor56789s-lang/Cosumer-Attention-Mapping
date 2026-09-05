import React from 'react';
import { CheckCircle2, Loader2, Sparkles, Cpu, Layers, Activity } from 'lucide-react';

export default function ProcessingPipelineProgress({ currentStep, progressPercent }) {
  const steps = [
    { id: 1, name: 'Video Validation', desc: 'Validating MP4 container & codec' },
    { id: 2, name: 'Frame Extraction', desc: 'Extracting 60 FPS frames via OpenCV' },
    { id: 3, name: 'YOLOv8 Detection', desc: 'Detecting shoppers & shopping carts' },
    { id: 4, name: 'ByteTrack Multi-Person', desc: 'Assigning unique IDs (ID #1, ID #2)' },
    { id: 5, name: 'Movement Trajectories', desc: 'Calculating walking paths & zone dwell' },
    { id: 6, name: 'Retail Analytics', desc: 'Computing traffic & queue metrics' },
    { id: 7, name: 'AI Recommendations', desc: 'Generating planogram suggestions' },
    { id: 8, name: 'Completed', desc: 'Analysis ready for dashboard view' },
  ];

  return (
    <div className="p-6 bg-[#111827] border border-slate-800 rounded-3xl space-y-4 shadow-xl font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white">AI Video Processing Pipeline Execution</h3>
        </div>
        <span className="text-xs font-mono text-blue-400 font-bold">{progressPercent}% Completed</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* 8-Stage Tracker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 text-xs">
        {steps.map((st) => {
          const isDone = currentStep > st.id;
          const isCurrent = currentStep === st.id;
          return (
            <div
              key={st.id}
              className={`p-2.5 rounded-xl border text-center space-y-1 transition ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isCurrent
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                ) : (
                  <span>Stage {st.id}</span>
                )}
              </div>
              <div className="font-bold text-[11px] truncate">{st.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
