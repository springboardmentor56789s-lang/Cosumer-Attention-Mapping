"use client";
import React from "react";

const TOKENS = {
  surface: "#131A27",
  surface2: "#1B2333",
  border: "#232C40",
  accent: "#E8A33D",
  text: "#EDEFF3",
  muted: "#8A93A6",
  success: "#5FAE86",
  danger: "#E8654F",
};

const SHELF_TIERS = [
  { tier: "Top Shelf", height: "180 - 210 cm", share: "18.4%", fixations: "142 views", color: "#5B8DEF" },
  { tier: "Eye-Level (Golden Zone)", height: "140 - 180 cm", share: "54.2%", fixations: "418 views", color: TOKENS.success, highlight: true },
  { tier: "Reach Level", height: "90 - 140 cm", share: "21.0%", fixations: "162 views", color: TOKENS.accent },
  { tier: "Bottom Shelf", height: "0 - 90 cm", share: "6.4%", fixations: "49 views", color: TOKENS.danger },
];

export default function ShelfGazeHeatmap() {
  return (
    <div style={{ background: TOKENS.surface, borderRadius: "16px", border: `1px solid ${TOKENS.border}`, padding: "20px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: TOKENS.text }}>
          Vertical Shelf Gaze Attention & Golden Zone Distribution
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
          Eye fixation concentrations measured via 3D pitch/yaw raycasting.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {SHELF_TIERS.map((item) => (
          <div
            key={item.tier}
            style={{
              background: item.highlight ? "rgba(95,174,134,0.12)" : TOKENS.surface2,
              border: `1px solid ${item.highlight ? TOKENS.success : TOKENS.border}`,
              borderRadius: "10px",
              padding: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: item.highlight ? TOKENS.success : TOKENS.text }}>
                {item.tier} {item.highlight && "★ HIGHEST CONVERSION"}
              </div>
              <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "2px" }}>
                Shelf Elevation: {item.height}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: item.color }}>{item.share}</div>
              <div style={{ fontSize: "11px", color: TOKENS.muted }}>{item.fixations}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}