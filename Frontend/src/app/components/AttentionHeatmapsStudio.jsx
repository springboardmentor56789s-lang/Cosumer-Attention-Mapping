"use client";
import React, { useState } from "react";

const TOKENS = {
  bg: "#0B0F17",
  cardBg: "#131A27",
  cardBorder: "#232C40",
  text: "#EDEFF3",
  muted: "#8A93A6",
  accent: "#E8A33D",
  success: "#5FAE86",
  danger: "#E8654F",
  info: "#5B8DEF",
  purple: "#9B72E8",
};

const cardStyle = {
  backgroundColor: TOKENS.cardBg,
  borderRadius: "12px",
  border: `1px solid ${TOKENS.cardBorder}`,
  padding: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
};

const ZONES_DATA = [
  { id: "entrance", name: "Entrance Foyer", x: 230, y: 25, w: 260, h: 70, intensity: 62, dwellAvg: "45s", shoppers: 520, color: "#5FAE86", tier: "Pass-through 🚪" },
  { id: "grocery", name: "Grocery & Snacks", x: 45, y: 115, w: 295, h: 155, intensity: 92, dwellAvg: "4.8m", shoppers: 342, color: "#E8654F", tier: "Hotspot 🔥" },
  { id: "apparel", name: "Apparel & Fitting", x: 380, y: 115, w: 295, h: 155, intensity: 48, dwellAvg: "3.2m", shoppers: 164, color: "#5B8DEF", tier: "Moderate 🟢" },
  { id: "electronics", name: "Electronics Showcase", x: 45, y: 290, w: 295, h: 155, intensity: 84, dwellAvg: "8.2m", shoppers: 285, color: "#E8A33D", tier: "High Dwell ⚡" },
  { id: "checkout", name: "Checkout POS Queues", x: 380, y: 290, w: 295, h: 155, intensity: 78, dwellAvg: "2.5m", shoppers: 410, color: "#E8A33D", tier: "High Traffic 🏃" },
];

const SHELF_TIERS_HEATMAP = [
  { tier: "Top Shelf (Reach)", height: "180 - 210 cm", share: 18.4, fixations: 142, avgDwell: "1.2s", temp: "Cool Blue", color: "#5B8DEF", bgGrad: "linear-gradient(90deg, rgba(91,141,239,0.35) 0%, rgba(91,141,239,0.08) 100%)" },
  { tier: "Eye-Level (Golden Zone)", height: "140 - 180 cm", share: 54.2, fixations: 418, avgDwell: "5.8s", temp: "Thermal Red Hot", color: "#E8654F", bgGrad: "linear-gradient(90deg, rgba(232,101,79,0.45) 0%, rgba(232,163,61,0.25) 50%, rgba(95,174,134,0.1) 100%)", highlight: true },
  { tier: "Touch & Reach Level", height: "90 - 140 cm", share: 21.0, fixations: 162, avgDwell: "2.4s", temp: "Warm Amber", color: "#E8A33D", bgGrad: "linear-gradient(90deg, rgba(232,163,61,0.35) 0%, rgba(232,163,61,0.08) 100%)" },
  { tier: "Bottom Shelf (Base)", height: "0 - 90 cm", share: 6.4, fixations: 49, avgDwell: "0.6s", temp: "Cold Zone", color: "#8A93A6", bgGrad: "linear-gradient(90deg, rgba(138,147,166,0.2) 0%, rgba(138,147,166,0.05) 100%)" },
];

const PRODUCT_HOTSPOTS = [
  { sku: "SKU-BEV-001", name: "Sparkling Citrus Energy Drink", zone: "Grocery Shelf B", fixations: 248, dwellScore: 94, gazeIntensity: "Critical Hot 🔥", tempColor: "#E8654F" },
  { sku: "SKU-ELE-042", name: "Noise-Cancelling Headphones", zone: "Electronics Display A", fixations: 196, dwellScore: 88, gazeIntensity: "High Warm ⚡", tempColor: "#E8A33D" },
  { sku: "SKU-BEV-008", name: "Cold Brew Espresso Can", zone: "Grocery Shelf B", fixations: 182, dwellScore: 82, gazeIntensity: "High Warm ⚡", tempColor: "#E8A33D" },
  { sku: "SKU-SNK-109", name: "Roasted Almonds Sea Salt", zone: "Snack Endcap", fixations: 134, dwellScore: 68, gazeIntensity: "Moderate 🟢", tempColor: "#5FAE86" },
  { sku: "SKU-APP-201", name: "Cotton Oxford Shirt", zone: "Apparel Rack 2", fixations: 58, dwellScore: 42, gazeIntensity: "Cool 🔵", tempColor: "#5B8DEF" },
  { sku: "SKU-SNK-055", name: "Gluten-Free Granola Bar", zone: "Grocery Bottom Shelf", fixations: 24, dwellScore: 18, gazeIntensity: "Cold Dead Zone ❄️", tempColor: "#8A93A6" },
];

export default function AttentionHeatmapsStudio() {
  const [activeTab, setActiveTab] = useState("floorplan"); // floorplan | shelf | product
  const [timeFilter, setTimeFilter] = useState("all-day");
  const [heatIntensity, setHeatIntensity] = useState(85);
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* HEADER BANNER & CONTROLS */}
      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
            🔥 Attention Heatmaps
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
            2D floor traffic density, vertical shelf gaze fixation heatmaps, and SKU visual engagement hotspots.
          </p>
        </div>

        {/* TIME & RESOLUTION FILTER */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              backgroundColor: TOKENS.bg,
              border: `1px solid ${TOKENS.cardBorder}`,
              borderRadius: "8px",
              padding: "8px 12px",
              color: TOKENS.text,
              fontSize: "12px",
              outline: "none",
            }}
          >
            <option value="all-day">🕒 All-Day Cumulative (09:00 - 21:00)</option>
            <option value="morning">🌅 Morning Rush (09:00 - 11:30)</option>
            <option value="peak">🔥 Peak Traffic Window (12:30 - 15:00)</option>
            <option value="evening">🌆 Evening Prime (17:30 - 20:30)</option>
          </select>

          <span style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", background: "rgba(232,163,61,0.15)", color: TOKENS.accent, fontWeight: 700 }}>
            ● Gaussian Kernel Density v2.0
          </span>
        </div>
      </div>

      {/* HEATMAP MODE SELECTOR TABS */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {[
          { id: "floorplan", label: "2D Store Floorplan Traffic Heatmap", icon: "🗺️" },
          { id: "shelf",     label: "Vertical Shelf Gaze & Golden Zone Heatmap", icon: "🏬" },
          { id: "product",   label: "SKU Product Attention Hotspot Map", icon: "📦" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: activeTab === tab.id ? `1px solid ${TOKENS.accent}` : `1px solid ${TOKENS.cardBorder}`,
              backgroundColor: activeTab === tab.id ? TOKENS.accent : TOKENS.cardBg,
              color: activeTab === tab.id ? "#1A1200" : TOKENS.muted,
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* THERMAL COLOR GRADIENT LEGEND & INTENSITY SLIDER */}
      <div style={{ ...cardStyle, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: TOKENS.muted, textTransform: "uppercase" }}>Thermal Scale:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "10px", color: TOKENS.muted }}>0% (Cold)</span>
            <div style={{ width: "160px", height: "10px", borderRadius: "5px", background: "linear-gradient(90deg, #131A27 0%, #5B8DEF 25%, #5FAE86 50%, #E8A33D 75%, #E8654F 100%)" }} />
            <span style={{ fontSize: "10px", color: TOKENS.danger, fontWeight: 700 }}>100% (Hot Spot)</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: TOKENS.muted }}>Thermal Intensity: <strong style={{ color: TOKENS.accent }}>{heatIntensity}%</strong></span>
          <input
            type="range"
            min="30"
            max="100"
            value={heatIntensity}
            onChange={(e) => setHeatIntensity(Number(e.target.value))}
            style={{ accentColor: TOKENS.accent, cursor: "pointer" }}
          />
        </div>
      </div>

      {/* ================= MODE 1: 2D FLOORPLAN TRAFFIC DENSITY ================= */}
      {activeTab === "floorplan" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
          {/* VISUAL SVG THERMAL MAP */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                🏬 Store Layout Thermal Traffic Density
              </h3>
              <span style={{ fontSize: "11px", color: TOKENS.muted }}>
                Click any zone box to inspect dwell telemetry
              </span>
            </div>

            <div style={{ width: "100%", background: "#06090F", borderRadius: "10px", padding: "14px", border: `1px solid ${TOKENS.cardBorder}`, position: "relative" }}>
              <svg viewBox="0 0 720 480" style={{ width: "100%", height: "auto", display: "block" }}>
                <defs>
                  {/* Gaussian Heat Glow Gradients */}
                  <radialGradient id="heatHot" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E8654F" stopOpacity={0.75 * (heatIntensity / 100)} />
                    <stop offset="50%" stopColor="#E8A33D" stopOpacity={0.45 * (heatIntensity / 100)} />
                    <stop offset="100%" stopColor="#E8A33D" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="heatWarm" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E8A33D" stopOpacity={0.65 * (heatIntensity / 100)} />
                    <stop offset="60%" stopColor="#5FAE86" stopOpacity={0.35 * (heatIntensity / 100)} />
                    <stop offset="100%" stopColor="#5FAE86" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="heatCool" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.55 * (heatIntensity / 100)} />
                    <stop offset="100%" stopColor="#5B8DEF" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Background Store Footprint */}
                <rect x="20" y="10" width="680" height="455" rx="16" fill="#0B0F17" stroke={TOKENS.cardBorder} strokeWidth="2" />

                {/* THERMAL GLOW BLOBS UNDER ZONES */}
                <circle cx="360" cy="60" r="60" fill="url(#heatWarm)" />
                <circle cx="192" cy="192" r="110" fill="url(#heatHot)" />
                <circle cx="527" cy="192" r="85" fill="url(#heatCool)" />
                <circle cx="192" cy="367" r="105" fill="url(#heatWarm)" />
                <circle cx="527" cy="367" r="100" fill="url(#heatWarm)" />

                {/* ZONE TILES OVERLAY */}
                {ZONES_DATA.map((z) => {
                  const isSel = selectedZone?.id === z.id;
                  return (
                    <g
                      key={z.id}
                      onClick={() => setSelectedZone(z)}
                      style={{ cursor: "pointer", transition: "all 0.3s" }}
                    >
                      <rect
                        x={z.x}
                        y={z.y}
                        width={z.w}
                        height={z.h}
                        rx="12"
                        fill={isSel ? "rgba(232,163,61,0.22)" : "rgba(19, 26, 39, 0.85)"}
                        stroke={isSel ? TOKENS.accent : z.color}
                        strokeWidth={isSel ? "2.5" : "1.5"}
                        strokeDasharray={isSel ? "none" : "4 2"}
                      />
                      
                      {/* Department Title */}
                      <text x={z.x + 16} y={z.y + 26} fill={TOKENS.text} fontSize="13" fontWeight="700">
                        {z.name}
                      </text>

                      {/* Department Tier & Heat */}
                      <text x={z.x + 16} y={z.y + 50} fill={z.color} fontSize="11" fontWeight="700">
                        {z.tier} · {z.intensity}% Heat Density
                      </text>

                      {/* Dwell & Footfall */}
                      <text x={z.x + 16} y={z.y + 74} fill={TOKENS.text} fontSize="11" fontWeight="500">
                        ⏱ Dwell: {z.dwellAvg} | 👥 {z.shoppers} Shoppers
                      </text>

                      {/* Selection Hint / Indicator */}
                      {z.h > 80 && (
                        <text x={z.x + 16} y={z.y + 132} fill={isSel ? TOKENS.accent : TOKENS.muted} fontSize="10" fontWeight={isSel ? "700" : "400"}>
                          {isSel ? "● ACTIVE SELECTION (Inspecting)" : "Click to view analytics ➔"}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ZONE TELEMETRY & HOTSPOT METRICS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* ACTIVE ZONE INSPECTION CARD */}
            <div style={{ ...cardStyle, borderLeft: `4px solid ${selectedZone ? selectedZone.color : TOKENS.accent}` }}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700 }}>
                {selectedZone ? "Selected Zone Analysis" : "Store Hotspot Summary"}
              </div>
              <h3 style={{ margin: "4px 0 10px 0", fontSize: "16px", fontWeight: 700, color: TOKENS.text }}>
                {selectedZone ? selectedZone.name : "Grocery & Snacks (Primary Store Hotspot)"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                <div style={{ background: TOKENS.bg, padding: "10px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", color: TOKENS.muted }}>Thermal Density</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: TOKENS.danger, marginTop: "2px" }}>
                    {selectedZone ? `${selectedZone.intensity}%` : "92% (High)"}
                  </div>
                </div>
                <div style={{ background: TOKENS.bg, padding: "10px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", color: TOKENS.muted }}>Avg Dwell Time</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: TOKENS.accent, marginTop: "2px" }}>
                    {selectedZone ? selectedZone.dwellAvg : "4.8 mins"}
                  </div>
                </div>
                <div style={{ background: TOKENS.bg, padding: "10px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", color: TOKENS.muted }}>Shoppers Tracked</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: TOKENS.info, marginTop: "2px" }}>
                    {selectedZone ? selectedZone.shoppers : "342 Visitors"}
                  </div>
                </div>
                <div style={{ background: TOKENS.bg, padding: "10px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", color: TOKENS.muted }}>Status Tier</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: TOKENS.success, marginTop: "4px" }}>
                    {selectedZone ? selectedZone.tier : "Hotspot 🔥"}
                  </div>
                </div>
              </div>
            </div>

            {/* KEY HEATMAP OBSERVATIONS */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 700 }}>💡 Key Thermal Findings</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: TOKENS.muted }}>
                <div style={{ padding: "8px", background: TOKENS.bg, borderRadius: "6px", borderLeft: `3px solid ${TOKENS.danger}` }}>
                  🔥 <strong>Grocery & Snacks</strong> is capturing 46% of all store dwell time today.
                </div>
                <div style={{ padding: "8px", background: TOKENS.bg, borderRadius: "6px", borderLeft: `3px solid ${TOKENS.accent}` }}>
                  ⚡ <strong>Electronics</strong> has highest dwell-per-shopper (8.2m average).
                </div>
                <div style={{ padding: "8px", background: TOKENS.bg, borderRadius: "6px", borderLeft: `3px solid ${TOKENS.info}` }}>
                  ❄️ <strong>Apparel</strong> is under-indexed in dwell (3.2m). Recommend adding central feature mannequin display.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODE 2: VERTICAL SHELF GAZE & GOLDEN ZONE ================= */}
      {activeTab === "shelf" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
          {/* SHELF THERMAL ELEVATION VIEW */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                  🏬 Vertical Shelf Gaze Heatmap & Eye Elevation Tiers
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
                  Visual fixation density measured from 3D head pose and gaze vector raycasting.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {SHELF_TIERS_HEATMAP.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: item.bgGrad,
                    border: `1px solid ${item.highlight ? TOKENS.danger : TOKENS.cardBorder}`,
                    borderRadius: "10px",
                    padding: "16px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: item.highlight ? TOKENS.accent : TOKENS.text, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{item.tier}</span>
                      {item.highlight && (
                        <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", background: TOKENS.danger, color: "#fff", fontWeight: 800 }}>
                          🔥 GOLDEN ZONE (54.2% SHARE)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "4px" }}>
                      Height Elevation: <strong style={{ color: TOKENS.text }}>{item.height}</strong> | Avg Dwell: <strong style={{ color: TOKENS.accent }}>{item.avgDwell}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: item.color }}>{item.share}%</div>
                    <div style={{ fontSize: "11px", color: TOKENS.muted }}>{item.fixations} Eye Fixations</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MERCHANDISING OPTIMIZATION INSIGHTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "15px", fontWeight: 700 }}>
                🎯 Golden Zone Elevation Rules
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: TOKENS.muted, lineHeight: "1.5" }}>
                Products placed between <strong>140 cm and 180 cm</strong> receive over <strong>3.2x more visual fixations</strong> than bottom tiers and <strong>2.8x higher purchase conversion</strong>.
              </p>
              <div style={{ marginTop: "14px", padding: "12px", background: "rgba(95,174,134,0.12)", border: `1px solid ${TOKENS.success}`, borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.success }}>
                  ✓ Optimal Layout Rule Applied:
                </div>
                <div style={{ fontSize: "11px", color: TOKENS.text, marginTop: "4px" }}>
                  High-margin private label drinks and featured electronics are correctly placed at 160 cm eye height.
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "15px", fontWeight: 700 }}>
                ⚠️ Bottom Shelf Dead Tier Alert
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: TOKENS.muted, lineHeight: "1.5" }}>
                Bottom shelf (0 - 90 cm) captures only <strong>6.4% of customer visual attention</strong>. Avoid placing high-margin or promotional hero items in this tier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODE 3: SKU PRODUCT ATTENTION HOTSPOTS ================= */}
      {activeTab === "product" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                📦 SKU-Level Visual Attention & Fixation Hotspot Matrix
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
                Individual product facing gaze density rankings and customer dwell scores.
              </p>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                <th style={{ padding: "10px 8px" }}>Rank & SKU</th>
                <th style={{ padding: "10px 8px" }}>Product Name</th>
                <th style={{ padding: "10px 8px" }}>Display Location</th>
                <th style={{ padding: "10px 8px" }}>Gaze Fixations</th>
                <th style={{ padding: "10px 8px" }}>Dwell Intensity</th>
                <th style={{ padding: "10px 8px" }}>Thermal Status</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCT_HOTSPOTS.map((p, idx) => (
                <tr key={p.sku} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                  <td style={{ padding: "12px 8px", fontWeight: 700, color: idx === 0 ? TOKENS.accent : TOKENS.text }}>
                    #{idx + 1} <span style={{ fontSize: "10px", color: TOKENS.muted }}>({p.sku})</span>
                  </td>
                  <td style={{ padding: "12px 8px", fontWeight: 600, color: TOKENS.text }}>{p.name}</td>
                  <td style={{ padding: "12px 8px", color: TOKENS.muted }}>{p.zone}</td>
                  <td style={{ padding: "12px 8px", fontWeight: 700, color: TOKENS.text }}>{p.fixations} views</td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "80px", height: "6px", background: TOKENS.bg, borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${p.dwellScore}%`, height: "100%", background: p.tempColor, borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontWeight: 700, color: p.tempColor }}>{p.dwellScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 700, background: `${p.tempColor}22`, color: p.tempColor, border: `1px solid ${p.tempColor}44` }}>
                      {p.gazeIntensity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
