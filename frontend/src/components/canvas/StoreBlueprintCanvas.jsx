import React, { useRef, useEffect, useState } from 'react';
import { Layers, Camera, Eye, MapPin, Sliders, ShieldCheck, Compass, Sparkles, Navigation } from 'lucide-react';

export default function StoreBlueprintCanvas({ showCameras = true, showHeatmap = true, showPaths = true }) {
  const canvasRef = useRef(null);

  const [drawGrid, setDrawGrid] = useState(true);
  const [drawCameras, setDrawCameras] = useState(showCameras);
  const [drawPaths, setDrawPaths] = useState(showPaths);
  const [drawHeatmap, setDrawHeatmap] = useState(showHeatmap);
  const [activeAisle, setActiveAisle] = useState('All Aisles');

  // D-Mart Blueprint Camera Positions & Field of View Cones
  const dmartCameras = [
    { id: 'CAM-01', name: 'Entrance Gate A', x: 80, y: 540, angle: -Math.PI / 4, color: '#3B82F6' },
    { id: 'CAM-02', name: 'Row 1 - Dairy & Snacks', x: 190, y: 120, angle: Math.PI / 3, color: '#10B981' },
    { id: 'CAM-03', name: 'Row 2 - Staples & Utensils', x: 380, y: 120, angle: Math.PI / 3, color: '#F59E0B' },
    { id: 'CAM-04', name: 'Row 3 - Books & Personal Care', x: 570, y: 120, angle: Math.PI / 3, color: '#A855F7' },
    { id: 'CAM-05', name: 'Row 4 - Electronics (Both Sides)', x: 760, y: 120, angle: Math.PI / 3, color: '#EC4899' },
    { id: 'CAM-06', name: 'Checkout Counters 1-8', x: 450, y: 480, angle: -Math.PI / 3, color: '#6366F1' },
  ];

  // D-Mart 4-Row Bilateral Blueprint Layout
  const dmartRows = [
    {
      rowId: 'Row 1',
      title: 'ROW 1',
      x: 130, y: 140, w: 140, h: 260,
      sideA: { title: 'SIDE A: MILK & DAIRY', items: 'Milk, Curd, Butter, Paneer, Ghee', color: '#10B981' },
      sideB: { title: 'SIDE B: SNACKS', items: 'Biscuits, Chips, Namkeen, Cookies', color: '#F59E0B' }
    },
    {
      rowId: 'Row 2',
      title: 'ROW 2',
      x: 320, y: 140, w: 140, h: 260,
      sideA: { title: 'SIDE A: COOKING ITEMS', items: 'Rice, Rice Flour, Atta, Pulses', color: '#EAB308' },
      sideB: { title: 'SIDE B: UTENSILES', items: 'Knives, Gas Lighters, Boards, Tools', color: '#EF4444' }
    },
    {
      rowId: 'Row 3',
      title: 'ROW 3',
      x: 510, y: 140, w: 140, h: 260,
      sideA: { title: 'SIDE A: BOOKS & STATIONERY', items: 'Notebooks, Pens, Pencils, Registers', color: '#3B82F6' },
      sideB: { title: 'SIDE B: HYGIENE & SOAPS', items: 'Face Wash, Soaps, Detergents, Cleaners', color: '#A855F7' }
    },
    {
      rowId: 'Row 4',
      title: 'ROW 4',
      x: 700, y: 140, w: 140, h: 260,
      sideA: { title: 'SIDE A: ELECTRONICS', items: 'Earphones, Speakers, Powerbanks', color: '#EC4899' },
      sideB: { title: 'SIDE B: GADGET ACCESSORIES', items: 'Chargers, USB Cables, Accessories', color: '#06B6D4' }
    }
  ];


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    let animId;
    let step = 0;

    const renderBlueprint = () => {
      step += 0.015; // Slow realistic browsing pace (0.4 m/s)


      // 1. Technical CAD Navy Background
      ctx.fillStyle = '#060B18';
      ctx.fillRect(0, 0, w, h);

      // 2. Blueprint Architectural Grid & Scale Markers
      if (drawGrid) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.lineWidth = 1;
        const gridSpacing = 40;

        for (let x = 0; x < w; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Outer Architectural Border Double Line
        ctx.strokeStyle = '#1E3A8A';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 1;
        ctx.strokeRect(26, 26, w - 52, h - 52);

        // Blueprint Header Title in Top-Right
        ctx.fillStyle = '#60A5FA';
        ctx.font = 'bold 11px font-mono system-ui';
        ctx.fillText('D-MART ARCHITECTURAL BLUEPRINT • CAD DRAWING REV 4.2', w - 370, 48);
        ctx.fillStyle = '#93C5FD';
        ctx.font = '10px font-mono system-ui';
        ctx.fillText('SCALE 1:100 • POWAI SUPERSTORE MAIN FLOORPLAN', w - 370, 62);
      }

      // 3. Main Entrance & Exit Gates Blueprint Markings
      // Main Entrance Gate
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.fillRect(40, h - 100, 140, 60);
      ctx.strokeRect(40, h - 100, 140, 60);

      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 11px font-mono system-ui';
      ctx.fillText('MAIN ENTRANCE (GATE A)', 50, h - 65);

      // Exit Security Gate
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.fillRect(w - 180, h - 100, 140, 60);
      ctx.strokeRect(w - 180, h - 100, 140, 60);

      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 11px font-mono system-ui';
      ctx.fillText('MAIN EXIT (GATE B)', w - 170, h - 65);

      // 4. Draw D-Mart 4 Double-Sided Blueprint Rows (Sides A & B)
      dmartRows.forEach((row) => {
        const isSelected = activeAisle === 'All Aisles' || activeAisle === row.rowId;
        const opacity = isSelected ? 1 : 0.35;

        // Main Row Outer Frame
        ctx.fillStyle = `rgba(15, 23, 42, ${0.85 * opacity})`;
        ctx.strokeStyle = isSelected ? '#38BDF8' : '#1E293B';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.fillRect(row.x, row.y, row.w, row.h);
        ctx.strokeRect(row.x, row.y, row.w, row.h);

        // Header Row Title
        ctx.fillStyle = isSelected ? '#F8FAFC' : '#64748B';
        ctx.font = 'bold 11px font-mono system-ui';
        ctx.fillText(row.title, row.x + 8, row.y + 18);

        // Center Divider Line separating Side A and Side B
        const halfWidth = (row.w - 12) / 2;
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.4 * opacity})`;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(row.x + halfWidth + 6, row.y + 26);
        ctx.lineTo(row.x + halfWidth + 6, row.y + row.h - 8);
        ctx.stroke();
        ctx.setLineDash([]);

        // --- SIDE A (LEFT SIDE) ---
        const sideAX = row.x + 4;
        const sideAY = row.y + 26;
        const sideAH = row.h - 32;

        ctx.fillStyle = `${row.sideA.color}15`;
        ctx.strokeStyle = `${row.sideA.color}88`;
        ctx.lineWidth = 1;
        ctx.fillRect(sideAX, sideAY, halfWidth, sideAH);
        ctx.strokeRect(sideAX, sideAY, halfWidth, sideAH);

        ctx.fillStyle = row.sideA.color;
        ctx.font = 'bold 8.5px font-mono system-ui';
        ctx.fillText(row.sideA.title, sideAX + 3, sideAY + 14);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '7.5px font-mono system-ui';
        const itemsA = row.sideA.items.split(', ');
        itemsA.forEach((itm, i) => {
          if (sideAY + 30 + i * 16 < sideAY + sideAH - 5) {
            ctx.fillText(`• ${itm}`, sideAX + 3, sideAY + 30 + i * 16);
          }
        });

        // --- SIDE B (RIGHT SIDE) ---
        const sideBX = row.x + halfWidth + 8;
        const sideBY = row.y + 26;
        const sideBH = row.h - 32;

        ctx.fillStyle = `${row.sideB.color}15`;
        ctx.strokeStyle = `${row.sideB.color}88`;
        ctx.lineWidth = 1;
        ctx.fillRect(sideBX, sideBY, halfWidth, sideBH);
        ctx.strokeRect(sideBX, sideBY, halfWidth, sideBH);

        ctx.fillStyle = row.sideB.color;
        ctx.font = 'bold 8.5px font-mono system-ui';
        ctx.fillText(row.sideB.title, sideBX + 3, sideBY + 14);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '7.5px font-mono system-ui';
        const itemsB = row.sideB.items.split(', ');
        itemsB.forEach((itm, i) => {
          if (sideBY + 30 + i * 16 < sideBY + sideBH - 5) {
            ctx.fillText(`• ${itm}`, sideBX + 3, sideBY + 30 + i * 16);
          }
        });
      });

      // 5. Checkout Counters 1 - 8

      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 2;
      ctx.fillRect(220, 440, 520, 70);
      ctx.strokeRect(220, 440, 520, 70);

      ctx.fillStyle = '#A5B4FC';
      ctx.font = 'bold 11px font-mono system-ui';
      ctx.fillText('EXPRESS CHECKOUT REGISTERS (COUNTERS 1 – 8)', 240, 480);

      // 6. Optional Heatmap Density Gradient Layer
      if (drawHeatmap) {
        const heatmapHotspots = [
          { x: 205, y: 220, r: 50, val: 0.85 }, // Beverages
          { x: 365, y: 280, r: 60, val: 0.92 }, // Snacks
          { x: 525, y: 200, r: 45, val: 0.65 }, // Cosmetics
          { x: 685, y: 320, r: 55, val: 0.78 }, // Grains
          { x: 480, y: 475, r: 70, val: 0.95 }, // Checkout line
        ];

        heatmapHotspots.forEach((pt) => {
          const pulseR = pt.r + Math.sin(step + pt.x) * 4;
          const grad = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, pulseR);
          grad.addColorStop(0, `rgba(239, 68, 68, ${0.60 * pt.val})`);
          grad.addColorStop(0.5, `rgba(245, 158, 11, ${0.35 * pt.val})`);
          grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pulseR, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 7. Shopper Trajectory Paths
      if (drawPaths) {
        const shopperPaths = [
          [
            { x: 100, y: 520 },
            { x: 205, y: 380 },
            { x: 205, y: 220 },
            { x: 365, y: 280 },
            { x: 480, y: 460 }
          ],
          [
            { x: 110, y: 530 },
            { x: 525, y: 320 },
            { x: 685, y: 240 },
            { x: 800, y: 200 },
            { x: 540, y: 460 }
          ]
        ];

        shopperPaths.forEach((path, pIdx) => {
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
          }
          ctx.strokeStyle = pIdx === 0 ? '#22C55E' : '#3B82F6';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated Customer Indicator Dot
          const pathProgress = (step * 0.4 + pIdx * 1.5) % (path.length - 1);
          const segIdx = Math.floor(pathProgress);
          const frac = pathProgress - segIdx;

          const currX = path[segIdx].x + (path[segIdx + 1].x - path[segIdx].x) * frac;
          const currY = path[segIdx].y + (path[segIdx + 1].y - path[segIdx].y) * frac;

          ctx.beginPath();
          ctx.arc(currX, currY, 6, 0, Math.PI * 2);
          ctx.fillStyle = pIdx === 0 ? '#22C55E' : '#3B82F6';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();
        });
      }

      // 8. Camera Vision Cones & Camera Nodes
      if (drawCameras) {
        dmartCameras.forEach((cam) => {
          const coneLength = 110;
          const coneFov = Math.PI / 4; // 45-degree FOV cone

          const x1 = cam.x + coneLength * Math.cos(cam.angle - coneFov / 2);
          const y1 = cam.y + coneLength * Math.sin(cam.angle - coneFov / 2);
          const x2 = cam.x + coneLength * Math.cos(cam.angle + coneFov / 2);
          const y2 = cam.y + coneLength * Math.sin(cam.angle + coneFov / 2);

          // Draw Vision Cone Coverage Gradient
          ctx.beginPath();
          ctx.moveTo(cam.x, cam.y);
          ctx.lineTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.closePath();

          const coneGrad = ctx.createRadialGradient(cam.x, cam.y, 5, cam.x, cam.y, coneLength);
          coneGrad.addColorStop(0, `${cam.color}55`);
          coneGrad.addColorStop(1, `${cam.color}05`);
          ctx.fillStyle = coneGrad;
          ctx.fill();

          ctx.strokeStyle = `${cam.color}AA`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Camera Node Circle Icon
          ctx.beginPath();
          ctx.arc(cam.x, cam.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = cam.color;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#0F172A';
          ctx.stroke();

          // Camera Tag Label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px font-mono system-ui';
          ctx.fillText(cam.id, cam.x - 14, cam.y - 12);
        });
      }

      animId = requestAnimationFrame(renderBlueprint);
    };

    renderBlueprint();

    return () => cancelAnimationFrame(animId);
  }, [drawGrid, drawCameras, drawPaths, drawHeatmap, activeAisle]);

  return (
    <div className="space-y-4 font-sans">
      {/* Blueprint Control Toolbar */}
      <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold text-white">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>D-Mart Architectural Blueprint View:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={drawGrid}
              onChange={(e) => setDrawGrid(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0"
            />
            <span>CAD Grid</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={drawCameras}
              onChange={(e) => setDrawCameras(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-0"
            />
            <span className="text-purple-300 font-semibold">Camera Vision Cones</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={drawPaths}
              onChange={(e) => setDrawPaths(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
            />
            <span className="text-emerald-300 font-semibold">Shopper Pathways</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={drawHeatmap}
              onChange={(e) => setDrawHeatmap(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
            />
            <span className="text-amber-300 font-semibold">Heatmap Density</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Row Filter:</span>
            <select
              value={activeAisle}
              onChange={(e) => setActiveAisle(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded-lg focus:outline-none font-bold"
            >
              <option value="All Aisles">All D-Mart Rows (1 – 4)</option>
              <option value="Row 1">Row 1: Dairy (Side A) & Snacks (Side B)</option>
              <option value="Row 2">Row 2: Cooking Items (Side A) & Utensils (Side B)</option>
              <option value="Row 3">Row 3: Books/Stationery (Side A) & Soaps/Hygiene (Side B)</option>
              <option value="Row 4">Row 4: Electronics & Gadgets (Both Sides)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Blueprint Canvas Container */}
      <div className="relative bg-[#060B18] border border-blue-900/50 rounded-3xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="w-full h-auto block"
        />

        {/* Blueprint Footer Stamp Badge */}
        <div className="absolute bottom-4 left-4 p-3 bg-slate-900/90 backdrop-blur-md border border-blue-900/60 rounded-2xl flex items-center gap-3 text-xs font-mono">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">D-Mart Flagship Superstore Blueprint</div>
            <div className="text-[10px] text-slate-400">28,500 sq ft • 24 Cameras • 48 Shelves</div>
          </div>
        </div>
      </div>
    </div>
  );
}
