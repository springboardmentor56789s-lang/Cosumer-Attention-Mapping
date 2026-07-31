"use client";
import React from "react";

// Color Token Constants
export const COLORS = {
  primary: "#2563EB",
  green: "#16A34A",
  orange: "#F59E0B",
  red: "#DC2626",
  bg: "#F8FAFC",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
};

// Card Wrapper (16px Radius, 24px Padding)
export function Card({ title, subtitle, action, children, style = {} }) {
  return (
    <div
      style={{
        backgroundColor: COLORS.cardBg,
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        border: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        ...style,
      }}
    >
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {title && <h3 style={{ fontSize: "16px", fontWeight: 600, color: COLORS.textPrimary, margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: "12px", color: COLORS.textSecondary, margin: "4px 0 0 0" }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// KPI Metric Stat Card with Trend
export function StatCard({ label, value, trend, isPositive = true, subtext, accentColor = COLORS.primary }) {
  return (
    <div
      style={{
        backgroundColor: COLORS.cardBg,
        borderRadius: "16px",
        padding: "20px 24px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
        borderLeft: `4px solid ${accentColor}`,
        display: "flex",
        flexDirection: "column",
        justify: "space-between",
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: 500, color: COLORS.textSecondary }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
        <span style={{ fontSize: "28px", fontWeight: 700, color: COLORS.textPrimary }}>{value}</span>
        {trend && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: isPositive ? COLORS.green : COLORS.red,
              backgroundColor: isPositive ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            {isPositive ? "▲" : "▼"} {trend}
          </span>
        )}
      </div>
      {subtext && <span style={{ fontSize: "11px", color: COLORS.textSecondary, marginTop: "6px" }}>{subtext}</span>}
    </div>
  );
}

// Safe Status Chip Component
export function Badge({ status }) {
  const safeStatus = String(status ?? "N/A");
  const normalized = safeStatus.toLowerCase();

  let bg = "#F1F5F9";
  let color = COLORS.textSecondary;

  if (["active", "online", "optimal", "high", "good"].includes(normalized)) {
    bg = "rgba(22, 163, 74, 0.12)";
    color = COLORS.green;
  } else if (["warning", "maintenance", "medium", "delayed"].includes(normalized)) {
    bg = "rgba(245, 158, 11, 0.12)";
    color = COLORS.orange;
  } else if (["offline", "down", "critical", "low", "error"].includes(normalized)) {
    bg = "rgba(220, 38, 38, 0.12)";
    color = COLORS.red;
  } else if (["admin", "store manager", "primary"].includes(normalized)) {
    bg = "rgba(37, 99, 235, 0.12)";
    color = COLORS.primary;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: color }} />
      {safeStatus}
    </span>
  );
}

// AI Recommendation Card
export function AIInsightCard({ title, recommendations = [] }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid #BFDBFE",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>✨</span>
        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: COLORS.primary }}>
          {title || "AI Behavioral Recommendations"}
        </h4>
      </div>
      <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {recommendations.map((rec, idx) => (
          <li key={idx} style={{ fontSize: "13px", color: COLORS.textPrimary, lineHeight: "1.4" }}>
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Activity Timeline
export function Timeline({ events = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {events.map((event, idx) => (
        <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: COLORS.textSecondary, minWidth: "45px" }}>{event.time}</span>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: event.color || COLORS.primary, marginTop: "4px" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: COLORS.textPrimary }}>{event.title}</span>
            {event.desc && <span style={{ fontSize: "12px", color: COLORS.textSecondary }}>{event.desc}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Data Table
export function Table({ headers = [], children }) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: COLORS.textSecondary }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }) {
  return <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>{children}</tr>;
}

export function Cell({ children }) {
  return <td style={{ padding: "12px 16px", fontSize: "13px", color: COLORS.textPrimary }}>{children}</td>;
}

// Visual Chart Primitives (Standardized pure React SVG charts)
export function BarChartVisual({ data = [], height = 180, color = COLORS.primary }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: `${height}px`, paddingTop: "20px" }}>
      {data.map((item, idx) => {
        const barHeight = (item.value / maxVal) * (height - 30);
        return (
          <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: COLORS.textSecondary }}>{item.value}</span>
            <div
              style={{
                width: "100%",
                maxWidth: "36px",
                height: `${barHeight}px`,
                backgroundColor: item.color || color,
                borderRadius: "6px 6px 0 0",
                transition: "height 0.3s ease",
              }}
            />
            <span style={{ fontSize: "11px", color: COLORS.textSecondary, whiteSpace: "nowrap" }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}