"use client";
import { TOKENS } from "@/app/theme";

export function StatCard({ label, value, accent = false }) {
  return (
    <div
      className="cam-card"
      style={{
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: "12px",
        padding: "20px 22px",
      }}
    >
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: TOKENS.muted, letterSpacing: "0.05em", marginBottom: "10px" }}>
        {label.toUpperCase()}
      </p>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "30px", fontWeight: 700, color: accent ? TOKENS.accent : TOKENS.text, margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

export function Card({ title, children }) {
  return (
    <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: "12px", padding: "22px", marginBottom: "22px" }}>
      {title && (
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>{title}</h2>
      )}
      {children}
    </div>
  );
}

export function Badge({ status }) {
  const isActive = status === "active";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "11px",
        padding: "4px 10px",
        borderRadius: "9999px",
        background: isActive ? TOKENS.successDim : TOKENS.dangerDim,
        color: isActive ? TOKENS.success : TOKENS.danger,
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: isActive ? TOKENS.success : TOKENS.danger }} />
      {status?.toUpperCase()}
    </span>
  );
}

export function Table({ headers, children }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  color: TOKENS.muted,
                  letterSpacing: "0.04em",
                  borderBottom: `1px solid ${TOKENS.border}`,
                }}
              >
                {h.toUpperCase()}
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
  return (
    <tr style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
      {children.map ? children : children}
    </tr>
  );
}

export function Cell({ children }) {
  return <td style={{ padding: "12px 14px", color: TOKENS.text }}>{children}</td>;
}

export function EmptyState({ message }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: TOKENS.muted, fontSize: "14px" }}>
      {message}
    </div>
  );
}