import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, MapPin, Eye, ShoppingBag, ShoppingCart, Clock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Navigation, UserCheck, CreditCard, ChevronRight } from 'lucide-react';

export default function ShopperJourneyVideoGenerator({ onApplyToReport }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // 0 to 150 seconds (2m 30s)
  const [selectedTab, setSelectedTab] = useState('timeline'); // timeline, stops, gaze, picks, cart

  // Total journey duration: 150s (02:30)
  const DURATION = 150;

  // Path coordinates on D-Mart Blueprint canvas (1280x720 scaled)
  // Entrance Gate A (120, 640) -> Row 1 Snacks (290, 240) -> Row 2 Utensils (450, 480) -> Row 4 Electronics (810, 210) -> Checkout Counter 4 (600, 580) -> Exit Gate B (1140, 640)
  const pathWaypoints = [
    { time: 0, x: 120, y: 640, label: 'Main Entrance (Gate A)', action: 'Entered Store', zone: 'Entrance' },
    { time: 15, x: 290, y: 240, label: 'Row 1 Side B (Snacks)', action: 'Stopped & Browsing Snacks', zone: 'Row 1: Snacks' },
    { time: 45, x: 450, y: 480, label: 'Row 2 Side B (Utensils)', action: 'Inspecting Cooking Knives', zone: 'Row 2: Utensils' },
    { time: 80, x: 810, y: 210, label: 'Row 4 Side A (Electronics)', action: 'Examining Earphones Shelf', zone: 'Row 4: Electronics' },
    { time: 125, x: 600, y: 580, label: 'Express Checkout Counter 4', action: 'Scanning Basket & Paying', zone: 'Checkout' },
    { time: 150, x: 1140, y: 640, label: 'Main Exit (Gate B)', action: 'Exited Store', zone: 'Exit' }
  ];

  // Stop / Dwell Locations
  const stopLocations = [
    { id: 1, location: 'Row 1 Side B: Packaged Snacks', arrival: '00:15', dwell: '28s', gazeTarget: 'Potato Chips 150g', score: '94.2%', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
    { id: 2, location: 'Row 2 Side B: Cooking Utensils', arrival: '00:45', dwell: '42s', gazeTarget: 'Stainless Steel Chef Knife Set', score: '91.5%', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
    { id: 3, location: 'Row 4 Side A: Electronics & Audio', arrival: '01:20', dwell: '35s', gazeTarget: 'boAt Rockerz 255 Wireless Earphones', score: '96.8%', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
    { id: 4, location: 'Express Checkout Counter 4', arrival: '02:05', dwell: '25s', gazeTarget: 'POS Scanner & Display', score: '99.0%', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' }
  ];

  // Gaze Fixation Analysis
  const gazeFixations = [
    { item: 'Crispy Potato Chips 150g', shelf: 'Row 1 Side B (Eye Level)', gazeSecs: '4.8s', confidence: '94.2%', vector: 'Angle +18.5° East', gazeRay: '[0.65, -0.20]' },
    { item: 'Stainless Steel Chef Knife Set', shelf: 'Row 2 Side B (Eye Level)', gazeSecs: '8.4s', confidence: '91.5%', vector: 'Angle -42.0° South', gazeRay: '[0.80, 0.15]' },
    { item: 'boAt Rockerz 255 Wireless Earphones', shelf: 'Row 4 Side A (Eye Level)', gazeSecs: '12.1s', confidence: '96.8%', vector: 'Angle +64.2° North', gazeRay: '[-0.45, -0.10]' }
  ];

  // Hand-Reach Product Pickups
  const pickedProducts = [
    { timestamp: '00:22', item: 'Crispy Potato Chips 150g', qty: 2, unitPrice: '₹35', total: '₹70', confidence: '98.2%', status: 'Picked & Placed in Cart' },
    { timestamp: '00:52', item: 'Stainless Steel Chef Knife Set', qty: 1, unitPrice: '₹349', total: '₹349', confidence: '96.5%', status: 'Picked & Placed in Cart' },
    { timestamp: '01:30', item: 'boAt Rockerz 255 Wireless Earphones', qty: 1, unitPrice: '₹999', total: '₹999', confidence: '99.1%', status: 'Picked & Placed in Cart' }
  ];

  // Carted Basket Summary
  const cartedReceipt = {
    shopperId: 'Customer #104 (Alex M.)',
    entryTime: '10:14:02 AM',
    exitTime: '10:16:32 AM',
    totalDwell: '02m 30s',
    checkoutCounter: 'Counter #4 (Express)',
    paymentMethod: 'UPI / Contactless Phone Pay',
    items: [
      { name: 'Crispy Potato Chips 150g', qty: 2, price: '₹35', subtotal: '₹70' },
      { name: 'Stainless Steel Chef Knife Set', qty: 1, price: '₹349', subtotal: '₹349' },
      { name: 'boAt Rockerz 255 Wireless Earphones', qty: 1, price: '₹999', subtotal: '₹999' }
    ],
    totalAmount: '₹1,418.00'
  };

  // Timer loop for video simulation playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= DURATION ? 0 : prev + 1));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute Current Position along Blueprint path based on currentTime
  const getCurrentShopperPosition = () => {
    for (let i = 0; i < pathWaypoints.length - 1; i++) {
      const w1 = pathWaypoints[i];
      const w2 = pathWaypoints[i + 1];
      if (currentTime >= w1.time && currentTime <= w2.time) {
        const ratio = (currentTime - w1.time) / (w2.time - w1.time || 1);
        return {
          x: w1.x + (w2.x - w1.x) * ratio,
          y: w1.y + (w2.y - w1.y) * ratio,
          currentZone: w1.zone,
          currentAction: w1.action,
          waypoint: w1
        };
      }
    }
    const last = pathWaypoints[pathWaypoints.length - 1];
    return { x: last.x, y: last.y, currentZone: last.zone, currentAction: last.action, waypoint: last };
  };

  const currentPos = getCurrentShopperPosition();

  // Render Canvas Simulation Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background store grid layout
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Retail Shelves (Rows 1 to 4)
    const shelves = [
      { name: 'ROW 1: MILK & SNACKS', x: 180, y: 100, w: 180, h: 320, color: '#06B6D4' },
      { name: 'ROW 2: STAPLES & UTENSILS', x: 400, y: 100, w: 180, h: 320, color: '#F59E0B' },
      { name: 'ROW 3: BOOKS & HYGIENE', x: 620, y: 100, w: 180, h: 320, color: '#A855F7' },
      { name: 'ROW 4: ELECTRONICS', x: 840, y: 100, w: 180, h: 320, color: '#EC4899' },
      { name: 'EXPRESS CHECKOUT REGISTERS (1-8)', x: 300, y: 520, w: 580, h: 100, color: '#3B82F6' },
      { name: 'MAIN ENTRANCE (GATE A)', x: 60, y: 580, w: 180, h: 100, color: '#10B981' },
      { name: 'MAIN EXIT (GATE B)', x: 960, y: 580, w: 180, h: 100, color: '#EF4444' }
    ];

    shelves.forEach((s) => {
      ctx.fillStyle = s.color + '15';
      ctx.strokeStyle = s.color + '80';
      ctx.lineWidth = 2;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeRect(s.x, s.y, s.w, s.h);

      ctx.fillStyle = s.color;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(s.name, s.x + 10, s.y + 24);
    });

    // Trajectory Path Line (Dashed Green/Purple)
    ctx.strokeStyle = '#818CF8';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    pathWaypoints.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw Waypoint Stop Pins
    stopLocations.forEach((st) => {
      const wp = pathWaypoints.find((w) => w.label.includes(st.location.split(':')[0]));
      if (wp) {
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw Animated Customer Bounding Box & Vector
    const cx = currentPos.x;
    const cy = currentPos.y;

    // Shopper Bounding Box
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 24, cy - 40, 48, 80);

    // Bounding Box Label Tag
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(cx - 30, cy - 62, 120, 20);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Person #104 (99.2%)', cx - 26, cy - 48);

    // Gaze Fixation Cone (Ray Vector)
    ctx.beginPath();
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx + 60, cy - 70);
    ctx.lineTo(cx + 90, cy - 30);
    ctx.closePath();
    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Active Pick Toast Popup on Canvas if timestamp matches pick
    const activePick = pickedProducts.find((p) => {
      const pSec = parseInt(p.timestamp.split(':')[0]) * 60 + parseInt(p.timestamp.split(':')[1]);
      return Math.abs(currentTime - pSec) <= 6;
    });

    if (activePick) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
      ctx.fillRect(cx - 60, cy + 48, 200, 32);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`✋ PICKED: ${activePick.item}`, cx - 52, cy + 68);
    }
  }, [currentTime, currentPos]);

  // Format Seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6 bg-[#0E131F] border border-indigo-500/40 rounded-3xl space-y-6 shadow-2xl font-sans text-xs">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold rounded-full text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Generated Video Analysis Active
            </span>
            <span className="text-slate-400 font-mono">D-Mart Flagship Superstore Blueprint</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-400" />
            Shopper Journey Video Simulation: Entrance to Exit (Customer #104 - Alex M.)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full AI analysis tracking where he stopped, what he seen, what he picked, and what he carted from Entrance Gate A to Exit Gate B
          </p>
        </div>

        {onApplyToReport && (
          <button
            onClick={() => onApplyToReport(cartedReceipt)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Apply Analysis to AI Video Report</span>
          </button>
        )}
      </div>

      {/* Main Grid: Live Simulated Canvas Feed & Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Player (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
            <canvas ref={canvasRef} width={1280} height={720} className="w-full h-auto aspect-video block" />

            {/* Video Player Live Overlay Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 font-mono">
              <span className="px-3 py-1 bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-[11px] font-bold rounded-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE REC • CAM-01 Entrance & CAM-06 Checkout
              </span>
              <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-slate-300 border border-slate-700 text-[11px] rounded-lg">
                FPS: 60 • YOLOv8 + ByteTrack
              </span>
            </div>

            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-right font-mono">
              <div className="text-[10px] text-slate-400">Current Zone</div>
              <div className="text-xs font-bold text-indigo-300">{currentPos.currentZone}</div>
            </div>

            {/* Bottom Playhead Controls */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={() => setCurrentTime(0)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition shrink-0"
                title="Restart Video"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="flex-1 space-y-1">
                <input
                  type="range"
                  min="0"
                  max={DURATION}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-emerald-400 font-bold">{currentPos.currentAction}</span>
                  <span>02:30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Timeline Markers */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 font-mono text-[11px]">
            <button onClick={() => setCurrentTime(0)} className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 shrink-0">
              00:00 Entrance Gate A
            </button>
            <button onClick={() => setCurrentTime(22)} className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 rounded-lg border border-amber-500/30 shrink-0">
              00:22 Pick #1 Chips
            </button>
            <button onClick={() => setCurrentTime(52)} className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 rounded-lg border border-emerald-500/30 shrink-0">
              00:52 Pick #2 Knives
            </button>
            <button onClick={() => setCurrentTime(90)} className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900/80 text-purple-300 rounded-lg border border-purple-500/30 shrink-0">
              01:30 Pick #3 Earphones
            </button>
            <button onClick={() => setCurrentTime(125)} className="px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900/80 text-blue-300 rounded-lg border border-blue-500/30 shrink-0">
              02:05 Checkout #4
            </button>
          </div>
        </div>

        {/* Breakdown Analytics Side Panel (1 col) */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-2xl font-mono text-[11px]">
            <button
              onClick={() => setSelectedTab('timeline')}
              className={`flex-1 py-1.5 text-center rounded-xl font-bold transition ${selectedTab === 'timeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Route
            </button>
            <button
              onClick={() => setSelectedTab('stops')}
              className={`flex-1 py-1.5 text-center rounded-xl font-bold transition ${selectedTab === 'stops' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Stops
            </button>
            <button
              onClick={() => setSelectedTab('gaze')}
              className={`flex-1 py-1.5 text-center rounded-xl font-bold transition ${selectedTab === 'gaze' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Seen
            </button>
            <button
              onClick={() => setSelectedTab('picks')}
              className={`flex-1 py-1.5 text-center rounded-xl font-bold transition ${selectedTab === 'picks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Picked
            </button>
            <button
              onClick={() => setSelectedTab('cart')}
              className={`flex-1 py-1.5 text-center rounded-xl font-bold transition ${selectedTab === 'cart' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Carted
            </button>
          </div>

          {/* TAB 1: Route Timeline */}
          {selectedTab === 'timeline' && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 font-mono">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" /> Entrance to Exit Pathway Nodes
              </h3>
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {pathWaypoints.map((wp, i) => (
                  <div key={i} className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">{formatTime(wp.time)}</span>
                      <span className="text-[10px] text-slate-400">{wp.zone}</span>
                    </div>
                    <div className="font-bold text-white text-xs">{wp.label}</div>
                    <div className="text-[11px] text-emerald-400">{wp.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Stopped Locations */}
          {selectedTab === 'stops' && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 font-mono">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Where He Stopped (Dwell Locations)
              </h3>
              <div className="space-y-2.5">
                {stopLocations.map((st) => (
                  <div key={st.id} className={`p-3 border rounded-xl space-y-1 ${st.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{st.location}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80">{st.dwell} Dwell</span>
                    </div>
                    <div className="text-[11px] text-slate-300">Arrival: {st.arrival} • Primary Focus: <strong>{st.gazeTarget}</strong></div>
                    <div className="text-[10px] text-purple-300">Fixation Attention Score: {st.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: What He Seen (Gaze Fixation) */}
          {selectedTab === 'gaze' && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 font-mono">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" /> What He Seen (Eye-Gaze Fixation)
              </h3>
              <div className="space-y-2.5">
                {gazeFixations.map((gz, i) => (
                  <div key={i} className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-1 text-slate-200">
                    <div className="font-bold text-purple-300 flex items-center justify-between">
                      <span>{gz.item}</span>
                      <span className="text-emerald-400 text-[10px]">{gz.gazeSecs} Gaze</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{gz.shelf}</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                      <span>Ray: {gz.gazeRay}</span>
                      <span className="text-purple-400">Confidence: {gz.confidence}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: What He Picked */}
          {selectedTab === 'picks' && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 font-mono">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> What He Picked (Hand Reach Picks)
              </h3>
              <div className="space-y-2.5">
                {pickedProducts.map((pk, i) => (
                  <div key={i} className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-300">
                      <span>✋ {pk.item}</span>
                      <span>{pk.total}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Time: {pk.timestamp} (Qty: {pk.qty})</span>
                      <span className="text-blue-400">Confidence: {pk.confidence}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold">{pk.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: What He Carted & Receipt */}
          {selectedTab === 'cart' && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 font-mono">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" /> What He Carted & Checkout Receipt
              </h3>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Shopper: <strong className="text-white">{cartedReceipt.shopperId}</strong></span>
                  <span>Payment: <strong className="text-emerald-400">{cartedReceipt.paymentMethod}</strong></span>
                </div>

                <div className="divide-y divide-slate-800 pt-1">
                  {cartedReceipt.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-200">{it.qty}x {it.name}</span>
                      <span className="font-bold text-amber-400">{it.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Total Cart Amount Paid</span>
                  <span className="text-emerald-400 text-sm">{cartedReceipt.totalAmount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
