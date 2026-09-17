import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Radio, Eye } from 'lucide-react';

export default function CameraBoundingBoxCanvas({ cameraName = "Cam-Aisle-01", cameraLocation = "Aisle 1 - Beverages" }) {
  const canvasRef = useRef(null);
  const [fps, setFps] = useState(29.8);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let tick = 0;

    const render = () => {
      tick += 1;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Simulated Store CCTV Background Frame
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Shelf lines
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 60, width - 80, height - 120);

      ctx.fillStyle = '#334155';
      ctx.fillRect(50, 120, width - 100, 10);
      ctx.fillRect(50, 220, width - 100, 10);

      // Simulated Product Bottles on shelf
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#3B82F6' : '#10B981';
        ctx.fillRect(70 + i * 55, 75, 25, 45);
        ctx.fillRect(70 + i * 55, 175, 25, 45);
      }

      // 2. Animate Person Bounding Box #102 (Customer Browsing Shelf)
      const person1X = 140 + Math.sin(tick * 0.03) * 20;
      const person1Y = 110 + Math.cos(tick * 0.02) * 8;

      ctx.strokeStyle = '#10B981'; // Emerald Box
      ctx.lineWidth = 2;
      ctx.strokeRect(person1X, person1Y, 110, 190);

      // Person Bounding Box Label
      ctx.fillStyle = '#10B981';
      ctx.fillRect(person1X, person1Y - 22, 120, 20);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('Person #102 [0.96]', person1X + 6, person1Y - 8);

      // Gaze Vector Line (Eye attention pointing toward SKU bottle)
      ctx.strokeStyle = '#EF4444'; // Red Gaze Line
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(person1X + 55, person1Y + 30);
      ctx.lineTo(235, 195);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Target Gaze Point Indicator
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(235, 195, 4, 0, Math.PI * 2);
      ctx.fill();

      // Attention Duration Tag
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.fillRect(245, 185, 110, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('Gaze Fixation: 4.8s', 250, 197);

      // 3. Animate Product SKU Bounding Box #883
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(225, 170, 45, 55);

      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(225, 150, 130, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('SKU: Cold Brew [0.98]', 230, 162);

      // 4. Animate Person Bounding Box #104 (Passing Customer)
      const person2X = 420 + Math.cos(tick * 0.04) * 30;
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(person2X, 130, 95, 175);

      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(person2X, 108, 110, 20);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('Person #104 [0.91]', person2X + 6, 122);

      // 5. Overlay CCTV Metadata Header
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 0, width, 32);

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`LIVE STREAM • ${cameraName.toUpperCase()} (${cameraLocation})`, 28, 20);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`YOLOv8x • DeepSORT • FPS: 29.8 • 1080p`, width - 210, 20);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraName, cameraLocation]);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col">
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A]">
        <canvas
          ref={canvasRef}
          width={640}
          height={340}
          className="w-full h-auto block"
        />

        {/* Live Radar Tag */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-200">2 Detections Active</span>
        </div>
      </div>
    </div>
  );
}
