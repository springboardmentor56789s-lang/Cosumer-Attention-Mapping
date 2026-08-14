"use client";
import React, { useState } from "react";

const TOKENS = {
  surface: "#131A27",
  surface2: "#1B2333",
  border: "#232C40",
  accent: "#E8A33D",
  text: "#EDEFF3",
  muted: "#8A93A6",
  success: "#5FAE86",
};

const ZONES = [
  { name: "Entrance", x: 10, y: 12, w: 24, h: 20, color: "rgba(91,141,239,0.18)", border: "#5B8DEF" },
  { name: "Grocery & Snacks", x: 10, y: 36, w: 32, h: 26, color: "rgba(95,174,134,0.18)", border: "#5FAE86" },
  { name: "Electronics", x: 46, y: 44, w: 28, h: 30, color: "rgba(232,163,61,0.18)", border: "#E8A33D" },
  { name: "Apparel", x: 46, y: 12, w: 28, h: 28, color: "rgba(155,81,224,0.18)", border: "#9B51E0" },
  { name: "Checkout", x: 76, y: 70, w: 20, h: 24, color: "rgba(242,153,74,0.18)", border: "#F2994A" },
  { name: "Exit", x: 76, y: 12, w: 20, h: 20, color: "rgba(232,101,79,0.18)", border: "#E8654F" },
];

export default function LiveFloorplanRadar({ shoppers = [] }) {
  const [hoveredZone, setHoveredZone] = useState(null);

  const defaultShoppers = shoppers.length > 0 ? shoppers : [
    { id: "SHOPPER-01", x: 26, y: 48, zone: "Grocery & Snacks" },
    { id: "SHOPPER-02", x: 60, y: 56, zone: "Electronics" },
    { id: "SHOPPER-03", x: 18, y: 22, zone: "Entrance" },
  ];

  return (
    <div style={{ background: TOKENS.surface, borderRadius: "16px", border: `1px solid ${TOKENS.border}`, padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: TOKENS.text }}>
            2D Real-Time Store Floorplan Radar
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
            Homography-mapped live customer coordinates and zone occupancy.
          </p>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "360px",
          background: "#080C14",
          borderRadius: "12px",
          border: `1px solid ${TOKENS.border}`,
          overflow: "hidden",
        }}
      >
        {/* Render Store Zones */}
        {ZONES.map((zone) => (
          <div
            key={zone.name}
            onMouseEnter={() => setHoveredZone(zone.name)}
            onMouseLeave={() => setHoveredZone(null)}
            style={{
              position: "absolute",
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.w}%`,
              height: `${zone.h}%`,
              background: hoveredZone === zone.name ? "rgba(232,163,61,0.25)" : zone.color,
              border: `1.5px dashed ${zone.border}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: TOKENS.text, textAlign: "center", padding: "4px" }}>
              {zone.name}
            </span>
          </div>
        ))}

        {/* Render Moving Shoppers */}
        {defaultShoppers.map((shopper) => (
          <div
            key={shopper.id}
            style={{
              position: "absolute",
              left: `${shopper.x}%`,
              top: `${shopper.y}%`,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: TOKENS.accent,
                boxShadow: `0 0 10px ${TOKENS.accent}`,
                border: "2px solid #fff",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#1A1200",
                background: TOKENS.accent,
                padding: "1px 5px",
                borderRadius: "4px",
                marginTop: "3px",
                whiteSpace: "nowrap",
              }}
            >
              {shopper.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}