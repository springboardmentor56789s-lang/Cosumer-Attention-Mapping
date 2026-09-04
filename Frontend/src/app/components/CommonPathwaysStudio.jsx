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

const ZONE_NODES = {
  "Entrance":         { x: 100, y: 80,  label: "Entrance Foyer",      color: TOKENS.info },
  "Grocery & Snacks": { x: 300, y: 80,  label: "Grocery & Snacks",    color: TOKENS.success },
  "Apparel":          { x: 500, y: 80,  label: "Apparel & Fitting",   color: TOKENS.purple },
  "Electronics":      { x: 300, y: 220, label: "Electronics Hub",     color: TOKENS.accent },
  "Checkout":         { x: 300, y: 340, label: "Checkout POS",        color: TOKENS.danger },
  "Exit":             { x: 500, y: 340, label: "Exit Turnstiles",     color: TOKENS.muted },
};

const PATHWAYS = [
  {
    id: "PATH-01",
    rank: 1,
    name: "The Quick Grocery & Essentials Loop",
    badge: "🥇 #1 Dominant Route",
    sequence: ["Entrance", "Grocery & Snacks", "Checkout", "Exit"],
    shopper_count: 622,
    share_pct: 42.0,
    avg_duration_min: 8.5,
    conversion_rate: 84.2,
    traffic_level: "Heavy Traffic",
    color: TOKENS.success,
    recommendation: "42% of all store visitors take this rapid loop. Place high-margin grab-and-go impulse snacks directly along the aisle transition between Grocery and Checkout."
  },
  {
    id: "PATH-02",
    rank: 2,
    name: "High-Value Tech & Snack Explorer",
    badge: "🥈 #2 High-Basket Route",
    sequence: ["Entrance", "Electronics", "Grocery & Snacks", "Checkout", "Exit"],
    shopper_count: 414,
    share_pct: 28.0,
    avg_duration_min: 17.2,
    conversion_rate: 76.5,
    traffic_level: "Moderate Traffic",
    color: TOKENS.accent,
    recommendation: "Shoppers who evaluate Electronics spend 17+ minutes in store. Cross-merchandise premium beverages and energy snacks at the Electronics exit corridor."
  },
  {
    id: "PATH-03",
    rank: 3,
    name: "The Full Department Grand Tour",
    badge: "🥉 #3 Longest Dwell Route",
    sequence: ["Entrance", "Grocery & Snacks", "Apparel", "Electronics", "Checkout", "Exit"],
    shopper_count: 266,
    share_pct: 18.0,
    avg_duration_min: 24.8,
    conversion_rate: 88.0,
    traffic_level: "Steady Traffic",
    color: TOKENS.purple,
    recommendation: "Highest basket conversion rate (88.0%). Ensure fitting rooms and customer service stations are fully staffed during peak afternoon hours."
  },
  {
    id: "PATH-04",
    rank: 4,
    name: "The Apparel & Quick Exit Loop",
    badge: "⚡ Targeted Fashion Loop",
    sequence: ["Entrance", "Apparel", "Checkout", "Exit"],
    shopper_count: 178,
    share_pct: 12.0,
    avg_duration_min: 11.4,
    conversion_rate: 58.4,
    traffic_level: "Light Traffic",
    color: TOKENS.info,
    recommendation: "Fashion shoppers rarely cross over to Grocery. Add directional signage or promotional vouchers to encourage exploration of grocery aisles."
  },
];

export default function CommonPathwaysStudio() {
  const [selectedPath, setSelectedPath] = useState(PATHWAYS[0]);

  // Generate SVG path coordinate strings for the selected sequence
  const getSvgPathData = (sequence) => {
    return sequence.map((zoneName, idx) => {
      const node = ZONE_NODES[zoneName] || { x: 0, y: 0 };
      return `${idx === 0 ? "M" : "L"} ${node.x} ${node.y}`;
    }).join(" ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* HEADER BANNER */}
      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
            🛣️ Common Customer Pathways & Navigation Flow
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
            Aggregated traffic routing analysis. Understand dominant shopping corridors and eliminate store dead zones.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", background: "rgba(95,174,134,0.15)", color: TOKENS.success, fontWeight: 700 }}>
            ● 1,480 Journeys Analyzed
          </span>
          <span style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", background: "rgba(232,163,61,0.15)", color: TOKENS.accent, fontWeight: 700 }}>
            Top Route: 42% Share
          </span>
        </div>
      </div>

      {/* TWO-COLUMN SPACIOUS LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: "24px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: CLEAN PATHWAY CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: TOKENS.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Dominant Store Pathways (Ranked)
          </div>

          {PATHWAYS.map((p) => {
            const isSelected = selectedPath.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPath(p)}
                style={{
                  ...cardStyle,
                  cursor: "pointer",
                  borderLeft: `4px solid ${p.color}`,
                  border: isSelected ? `2px solid ${p.color}` : `1px solid ${TOKENS.cardBorder}`,
                  background: isSelected ? "rgba(19, 26, 39, 0.95)" : TOKENS.cardBg,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: p.color, fontWeight: 700 }}>{p.badge}</span>
                    <div style={{ fontWeight: 700, fontSize: "15px", marginTop: "2px", color: TOKENS.text }}>
                      {p.name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: p.color }}>
                      {p.share_pct}%
                    </div>
                    <div style={{ fontSize: "10px", color: TOKENS.muted }}>TRAFFIC SHARE</div>
                  </div>
                </div>

                {/* BREADCRUMB SEQUENCE STEPPER */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", margin: "12px 0" }}>
                  {p.sequence.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: TOKENS.bg,
                          border: `1px solid ${TOKENS.cardBorder}`,
                          color: TOKENS.text,
                          fontWeight: 600,
                        }}
                      >
                        {step}
                      </span>
                      {idx < p.sequence.length - 1 && (
                        <span style={{ color: p.color, fontSize: "11px", fontWeight: 700 }}>➔</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* METRICS PILL ROW */}
                <div style={{ display: "flex", gap: "14px", fontSize: "11px", color: TOKENS.muted, paddingTop: "8px", borderTop: `1px solid ${TOKENS.cardBorder}` }}>
                  <span>👥 <strong style={{ color: TOKENS.text }}>{p.shopper_count}</strong> shoppers</span>
                  <span>⏱ <strong style={{ color: TOKENS.text }}>{p.avg_duration_min} min</strong> avg dwell</span>
                  <span>🛍 <strong style={{ color: TOKENS.success }}>{p.conversion_rate}%</strong> conversion</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE BLUEPRINT MAP & AI TIP */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* 2D STORE BLUEPRINT CANVAS */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                🗺️ Store Blueprint Flow Visualizer
              </h3>
              <span style={{ fontSize: "11px", color: selectedPath.color, fontWeight: 700 }}>
                Viewing: {selectedPath.name}
              </span>
            </div>

            {/* SVG STORE MAP */}
            <div style={{ width: "100%", background: TOKENS.bg, borderRadius: "10px", padding: "10px", border: `1px solid ${TOKENS.cardBorder}` }}>
              <svg viewBox="0 0 600 420" style={{ width: "100%", height: "auto", display: "block" }}>
                
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  </pattern>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill={selectedPath.color} />
                  </marker>
                </defs>
                <rect width="600" height="420" fill="url(#grid)" />

                {/* ACTIVE PATHWAY GLOWING LINE */}
                <path
                  d={getSvgPathData(selectedPath.sequence)}
                  fill="none"
                  stroke={selectedPath.color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd="url(#arrow)"
                  style={{
                    filter: `drop-shadow(0 0 8px ${selectedPath.color})`,
                    transition: "all 0.4s ease",
                  }}
                />

                {/* ZONE NODES */}
                {Object.entries(ZONE_NODES).map(([name, node]) => {
                  const isInSelectedPath = selectedPath.sequence.includes(name);
                  return (
                    <g key={name} transform={`translate(${node.x}, ${node.y})`}>
                      {/* Node Box */}
                      <rect
                        x="-70"
                        y="-22"
                        width="140"
                        height="44"
                        rx="8"
                        fill={isInSelectedPath ? TOKENS.cardBg : "rgba(19, 26, 39, 0.6)"}
                        stroke={isInSelectedPath ? selectedPath.color : TOKENS.cardBorder}
                        strokeWidth={isInSelectedPath ? "2" : "1"}
                        style={{ transition: "all 0.3s ease" }}
                      />
                      
                      {/* Status Indicator Dot */}
                      <circle
                        cx="-52"
                        cy="0"
                        r="4"
                        fill={node.color}
                      />

                      {/* Zone Label */}
                      <text
                        x="-40"
                        y="4"
                        fill={isInSelectedPath ? TOKENS.text : TOKENS.muted}
                        fontSize="11"
                        fontWeight={isInSelectedPath ? "700" : "500"}
                        fontFamily="system-ui, sans-serif"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* AI LAYOUT OPTIMIZATION RECOMMENDATION */}
          <div style={{ ...cardStyle, borderLeft: `4px solid ${selectedPath.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "16px" }}>💡</span>
              <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: selectedPath.color }}>
                AI Merchandising & Layout Recommendation
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: TOKENS.text, lineHeight: "1.5" }}>
              {selectedPath.recommendation}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
