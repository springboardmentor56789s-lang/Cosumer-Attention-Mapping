import React, { useState } from 'react';
import { Flame, Eye, Footprints, Hand, Sparkles, Play, RefreshCw, CheckCircle2, ArrowRight, Layers, Cpu, BarChart2, ShieldCheck, Zap } from 'lucide-react';

export default function HeatmapWorkflowEngine({ onWorkflowComplete }) {
  const [activeMode, setActiveMode] = useState('gaze'); // 'gaze', 'trajectory', 'touch'
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generationResults, setGenerationResults] = useState(null);

  const workflows = {
    gaze: {
      id: 'gaze',
      title: 'Visual Gaze & Attention Fixation Heatmap Workflow',
      icon: Eye,
      color: '#A855F7',
      accentBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
      objective: 'Quantify exact visual focus and eye gaze fixations across store shelves to measure planogram visibility, high-value shelf attraction, and product dwell time.',
      pipelineSteps: [
        { name: '1. Frame Ingestion', desc: 'Calibrated CCTV video frames (1080p @ 30 FPS)' },
        { name: '2. Head Pose & Vector Estimation', desc: '6DRepNet head orientation + Gaze ML raycasting' },
        { name: '3. Shelf Surface Homography', desc: 'Coordinate projection from 3D camera to 2D shelf plane' },
        { name: '4. Gaussian KDE Accumulation', desc: 'Kernel Density Estimation of gaze fixation clusters' },
        { name: '5. Heatmap Layer Render', desc: 'Normalized color gradient overlay (Low ➔ High)' }
      ],
      metrics: {
        focalPoints: 8,
        peakIntensity: '94.2% Gaze Fixation',
        topZone: 'Row 1: Eye-Level Shelf 3 (150cm)',
        confidence: '96.4%'
      }
    },
    trajectory: {
      id: 'trajectory',
      title: 'Shopper Footfall & Movement Spatial Heatmap Workflow',
      icon: Footprints,
      color: '#F59E0B',
      accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      objective: 'Track physical shopper movement paths and dwell durations across store aisles to identify traffic bottlenecks, dead zones, and optimal checkout flow.',
      pipelineSteps: [
        { name: '1. Person Bounding Detection', desc: 'YOLOv8x spatial detection at 30 FPS' },
        { name: '2. Multi-Object Tracking', desc: 'ByteTrack persistent Re-ID assignment per shopper' },
        { name: '3. Footprint Coordinate Mapping', desc: 'Bounding box centroid projection to 2D floor blueprint' },
        { name: '4. Spatial Velocity & Dwell Filter', desc: 'Filter stationary vs moving trajectories' },
        { name: '5. Density Map Generation', desc: 'Spatial footfall intensity matrix rendering' }
      ],
      metrics: {
        focalPoints: 15,
        peakIntensity: '98.5% Movement Density',
        topZone: 'Aisle 2 (Snack & Beverage Bottleneck)',
        confidence: '98.1%'
      }
    },
    touch: {
      id: 'touch',
      title: 'Shelf Reach & Interaction Touchpoint Heatmap Workflow',
      icon: Hand,
      color: '#10B981',
      accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      objective: 'Measure physical hand interaction hotspots and product touch-to-pick conversion rates to evaluate shelf packaging attraction versus item rejection.',
      pipelineSteps: [
        { name: '1. Hand Keypoint Detection', desc: 'MediaPipe 21-point hand skeleton tracking' },
        { name: '2. Shelf Bounding Volume Collision', desc: '3D Bounding box overlap detection with shelf items' },
        { name: '3. Pick / Touch Classification', desc: 'Distinguish product reach vs actual item pick' },
        { name: '4. Duration & Reach Frequency', desc: 'Accumulate touch duration per product SKU' },
        { name: '5. Touchpoint Hotspot Synthesis', desc: 'Generates product interaction intensity map' }
      ],
      metrics: {
        focalPoints: 12,
        peakIntensity: '89.7% Touch Interaction',
        topZone: 'Shelf 2: Premium Organic Chips',
        confidence: '94.8%'
      }
    }
  };

  const currentWorkflow = workflows[activeMode];
  const IconComponent = currentWorkflow.icon;

  const handleRunWorkflow = () => {
    setIsGenerating(true);
    setCurrentStep(0);
    setGenerationResults(null);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < currentWorkflow.pipelineSteps.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setGenerationResults(currentWorkflow.metrics);
        if (onWorkflowComplete) onWorkflowComplete(activeMode);
      }
    }, 600);
  };

  return (
    <div className="bg-[#0D121F] border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold rounded-full text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Automated Heatmap Generation Engine
            </span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleRunWorkflow}
          disabled={isGenerating}
          className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 font-mono shrink-0 ${
            isGenerating
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-700'
              : 'bg-purple-500 hover:bg-purple-400 text-black shadow-purple-500/20'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>Synthesizing Heatmap Pipeline...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate {activeMode.toUpperCase()} Heatmap</span>
            </>
          )}
        </button>
      </div>

      {/* Workflow Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(workflows).map((wf) => {
          const WfIcon = wf.icon;
          const isSelected = activeMode === wf.id;
          return (
            <button
              key={wf.id}
              onClick={() => {
                setActiveMode(wf.id);
                setGenerationResults(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-zinc-900 border-purple-500/60 ring-2 ring-purple-500/20 shadow-xl'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-zinc-800 text-white">
                    <WfIcon className="w-4 h-4" style={{ color: wf.color }} />
                  </div>
                  <span className="font-bold text-xs text-white">{wf.id === 'gaze' ? 'Visual Attention' : (wf.id === 'trajectory' ? 'Footfall Movement' : 'Shelf Reach Touch')}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{wf.objective}</p>
            </button>
          );
        })}
      </div>

      {/* Active Workflow Objective & Pipeline Breakdown */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-5">
        {/* Clear Objective Callout Banner */}
        <div className={`p-3.5 rounded-xl border ${currentWorkflow.accentBg} flex items-start gap-3`}>
          <IconComponent className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider">Workflow Objective</h4>
            <p className="text-xs leading-relaxed font-sans">{currentWorkflow.objective}</p>
          </div>
        </div>

        {/* Pipeline Generation Steps */}
        <div className="space-y-3">
          <h4 className="font-mono font-bold text-white text-xs flex items-center justify-between">
            <span>Algorithmic Processing Pipeline ({currentWorkflow.pipelineSteps.length} Stages)</span>
            <span className="text-zinc-500 text-[10px]">FPS: 30 • Homography: Calibrated</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono">
            {currentWorkflow.pipelineSteps.map((step, idx) => {
              const isCurrent = isGenerating && currentStep === idx;
              const isDone = isGenerating ? currentStep > idx : generationResults !== null;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                    isCurrent
                      ? 'bg-purple-950/40 border-purple-500 text-purple-200 ring-2 ring-purple-500/30 animate-pulse'
                      : isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span>Step {idx + 1}</span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="font-bold text-white text-[11px] leading-tight">{step.name.split('. ')[1]}</div>
                  <div className="text-[10px] text-zinc-400 leading-normal">{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generation Results Summary Banner */}
        {generationResults && (
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {currentWorkflow.title} Generated Successfully!
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Confidence: {generationResults.confidence}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-zinc-300">
              <div>
                <span className="text-zinc-500 block text-[10px]">ACCUMULATED HOTSPOTS</span>
                <strong className="text-white text-sm">{generationResults.focalPoints} Focal Nodes</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">PEAK DENSITY / FOCUS</span>
                <strong className="text-emerald-400 text-sm">{generationResults.peakIntensity}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">PRIMARY CONCENTRATION ZONE</span>
                <strong className="text-amber-400 text-xs">{generationResults.topZone}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">GENERATION TIMESTAMP</span>
                <strong className="text-purple-300 text-xs">{new Date().toLocaleTimeString()}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
