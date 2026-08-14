"use client";
import React, { useState, useEffect, useMemo } from "react";

// ==========================================
// DESIGN TOKENS — matches the Login page palette
// (dark navy background, warm gold accent)
// ==========================================
const TOKENS = {
  bg: "#0B0F17",
  sidebarBg: "#131A27",
  cardBg: "#131A27",
  cardBorder: "#232C40",
  text: "#EDEFF3",
  muted: "#8A93A6",
  accent: "#E8A33D",
  accentHover: "#D4922F",
  success: "#5FAE86",
  warning: "#F2994A",
  danger: "#E8654F",
  info: "#5B8DEF",
};

const COLORS = {
  bg: TOKENS.bg,
  surface: TOKENS.cardBg,
  border: TOKENS.cardBorder,
  textPrimary: TOKENS.text,
  textSecondary: TOKENS.muted,
  primary: TOKENS.info,
  green: TOKENS.success,
  orange: TOKENS.warning,
  accent: TOKENS.accent,
  danger: TOKENS.danger,
};

const cardStyle = {
  backgroundColor: TOKENS.cardBg,
  borderRadius: "12px",
  border: `1px solid ${TOKENS.cardBorder}`,
  padding: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
};

const selectStyle = {
  backgroundColor: TOKENS.bg,
  border: `1px solid ${TOKENS.cardBorder}`,
  borderRadius: "8px",
  padding: "8px 12px",
  color: TOKENS.text,
  fontSize: "12px",
  outline: "none",
};

const inputStyle = {
  width: "100%",
  backgroundColor: TOKENS.bg,
  border: `1px solid ${TOKENS.cardBorder}`,
  borderRadius: "8px",
  padding: "10px 12px",
  color: TOKENS.text,
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: "11px",
  color: TOKENS.muted,
  fontWeight: "600",
  marginBottom: "6px",
  display: "block",
};

const smallBtn = (bg, extra = {}) => ({
  padding: "4px 9px",
  fontSize: "10.5px",
  fontWeight: "600",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  color: "#fff",
  backgroundColor: bg,
  ...extra,
});

// ==========================================
// MOCK DATA
// ==========================================
const STORES = [
  "All Stores",
  "Downtown Flagship",
  "Metro Shopping Mall",
  "Westside Plaza",
  "Airport Duty Free",
];
const STORES_REAL = STORES.filter((s) => s !== "All Stores");

const DATE_RANGES = [
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 Days" },
  { id: "month", label: "Last 30 Days" },
];

const BASE_RANGE_DATA = {
  today: { attention: 81, attentionTrend: 3, dwellSec: 200, dwellTrend: 8, engagement: 64.5, engagementTrend: 2.4, returning: 27.8, returningTrend: 1.1, trafficBase: 1.6, peakHour: "1 – 2 PM" },
  week: { attention: 84, attentionTrend: 5, dwellSec: 225, dwellTrend: 12, engagement: 68.2, engagementTrend: 4.1, returning: 31.4, returningTrend: 1.8, trafficBase: 1.8, peakHour: "2 – 4 PM" },
  month: { attention: 87, attentionTrend: 7, dwellSec: 245, dwellTrend: 18, engagement: 71.6, engagementTrend: 6.3, returning: 35.2, returningTrend: 3.0, trafficBase: 2.1, peakHour: "5 – 7 PM" },
};

const STORE_MODIFIERS = {
  "All Stores": 1.0,
  "Downtown Flagship": 1.05,
  "Metro Shopping Mall": 1.12,
  "Westside Plaza": 0.82,
  "Airport Duty Free": 1.18,
};

const STORE_PROFILES = {
  "Downtown Flagship": { manager: "Ritika Sharma", floorSqft: "8,200 sqft", cameras: 18 },
  "Metro Shopping Mall": { manager: "Arjun Verma", floorSqft: "11,400 sqft", cameras: 24 },
  "Westside Plaza": { manager: "Neha Kapoor", floorSqft: "6,100 sqft", cameras: 12 },
  "Airport Duty Free": { manager: "Sameer Iyer", floorSqft: "4,300 sqft", cameras: 15 },
};

function formatDwell(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

const JOURNEY_STEPS = [
  { name: "Entrance", pct: "100%" },
  { name: "Electronics", pct: "64%" },
  { name: "Offers Aisle", pct: "42%" },
  { name: "Checkout", pct: "28%" },
];

const INITIAL_ZONES = [
  { id: "Z-01", name: "Entrance", store: "Downtown Flagship", intensity: 30 },
  { id: "Z-02", name: "Electronics", store: "Downtown Flagship", intensity: 78 },
  { id: "Z-03", name: "Offers Aisle", store: "Metro Shopping Mall", intensity: 92 },
  { id: "Z-04", name: "Wearables", store: "Metro Shopping Mall", intensity: 65 },
  { id: "Z-05", name: "Groceries", store: "Westside Plaza", intensity: 54 },
  { id: "Z-06", name: "Furniture", store: "Westside Plaza", intensity: 40 },
  { id: "Z-07", name: "Checkout", store: "Airport Duty Free", intensity: 35 },
  { id: "Z-08", name: "Middle Aisle", store: "Airport Duty Free", intensity: 58 },
];

const INITIAL_PRODUCTS = [
  { id: "P-01", name: "Wireless Headphones X", store: "Downtown Flagship", category: "Electronics", score: 96 },
  { id: "P-02", name: "Smart Fitness Watch", store: "Metro Shopping Mall", category: "Wearables", score: 91 },
  { id: "P-03", name: "Organic Coffee Beans", store: "Westside Plaza", category: "Groceries", score: 82 },
  { id: "P-04", name: "Ergonomic Desk Chair", store: "Airport Duty Free", category: "Furniture", score: 71 },
];

const SEGMENTATION = [
  { label: "Explorers", value: 35, color: COLORS.primary },
  { label: "Quick Buyers", value: 25, color: COLORS.green },
  { label: "Impulse", value: 20, color: COLORS.orange },
  { label: "Loyalists", value: 20, color: COLORS.primary },
];

const HOUR_LABELS = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM"];
const HOURLY_SHAPE = [20, 35, 50, 65, 80, 95, 100, 90, 75, 60, 40, 25];

const INITIAL_ALERTS = [
  { id: 1, title: "Attention spike detected — Offers Aisle (+18%)", time: "10 minutes ago", type: "success" },
  { id: 2, title: "Dwell time dropped — Checkout Zone (-9%)", time: "1 hour ago", type: "warning" },
  { id: 3, title: "New high-traffic pattern forming — Electronics", time: "3 hours ago", type: "info" },
];

function getHeatColor(intensity) {
  const pct = Math.max(0, Math.min(100, intensity));
  const hue = 210 - (210 * pct) / 100; // 210=blue -> 0=red
  const lightness = 46 - (pct / 100) * 10;
  return `hsl(${hue}, 75%, ${lightness}%)`;
}

function hashFloorPosition(id) {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < id.length; i++) {
    const code = id.charCodeAt(i);
    h1 = (h1 * 31 + code) % 997;
    h2 = (h2 * 17 + code * 7) % 991;
  }
  return { x: 18 + (h1 % 64), y: 22 + (h2 % 56) };
}

function estimateZoneStats(intensity) {
  return {
    visits: Math.round(45 + intensity * 6.2),
    dwellSec: Math.round(18 + intensity * 2.4),
  };
}

// ==========================================
// REUSABLE UI PRIMITIVES
// ==========================================
function StatCard({ label, value, trend, isPositive, accentColor, subtext }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "11px", color: TOKENS.muted, fontWeight: 600, marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 800, color: accentColor || TOKENS.text }}>{value}</div>
      {trend && (
        <div style={{ fontSize: "11px", marginTop: "6px", color: isPositive ? TOKENS.success : TOKENS.danger, fontWeight: 600 }}>
          {isPositive ? "▲" : "▼"} {trend}
        </div>
      )}
      {subtext && <div style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "6px" }}>{subtext}</div>}
    </div>
  );
}

function Card({ title, subtitle, headerRight, children, style }) {
  return (
    <div style={{ ...cardStyle, ...style }}>
      {(title || headerRight) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            {title && <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>{title}</h3>}
            {subtitle && <p style={{ margin: "4px 0 0", fontSize: "11px", color: TOKENS.muted }}>{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}

function BarChartVisual({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "8px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ width: "100px", fontSize: "12px", color: TOKENS.muted }}>{d.label}</span>
          <div style={{ flex: 1, backgroundColor: TOKENS.bg, borderRadius: "6px", height: "18px", overflow: "hidden" }}>
            <div
              style={{
                width: `${(d.value / max) * 100}%`,
                height: "100%",
                backgroundColor: d.color || TOKENS.accent,
                borderRadius: "6px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <span style={{ width: "34px", fontSize: "12px", fontWeight: 700, textAlign: "right" }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function AIInsightCard({ title, recommendations }) {
  return (
    <div style={{ ...cardStyle, borderColor: TOKENS.accent }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "16px" }}>🧠</span>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>{title}</h3>
      </div>
      <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {recommendations.map((r, i) => (
          <li key={i} style={{ fontSize: "12px", color: TOKENS.muted, lineHeight: 1.5 }}>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Table({ headers, children }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted, textAlign: "left" }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: "8px", fontWeight: 600, fontSize: "11px" }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
function Row({ children }) {
  return <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>{children}</tr>;
}
function Cell({ children }) {
  return <td style={{ padding: "12px 8px" }}>{children}</td>;
}

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: "380px", maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer", fontSize: "16px" }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function RetailAnalystDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [selectedRange, setSelectedRange] = useState("week");
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts] = useState(INITIAL_ALERTS);
  const [time, setTime] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Login Form state
  const [loginEmail, setLoginEmail] = useState("analyst@retail.com");
  const [loginPassword, setLoginPassword] = useState("••••••••");

  // ---- CRUD-backed data ----
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  const [activeModal, setActiveModal] = useState(null);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [zoneForm, setZoneForm] = useState({ name: "", store: STORES_REAL[0], intensity: "" });
  const [productForm, setProductForm] = useState({ name: "", store: STORES_REAL[0], category: "", score: "" });

  const [hoveredZoneId, setHoveredZoneId] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const STORAGE_KEYS = { zones: "retail_zones", products: "retail_products" };

  useEffect(() => {
    try {
      const savedZones = localStorage.getItem(STORAGE_KEYS.zones);
      if (savedZones) setZones(JSON.parse(savedZones));
      const savedProducts = localStorage.getItem(STORAGE_KEYS.products);
      if (savedProducts) setProducts(JSON.parse(savedProducts));
    } catch (err) {
      console.error("Failed to load saved retail analytics data:", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.zones, JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  const handleResetDemoData = () => {
    if (!window.confirm("Reset zones and products back to demo defaults?")) return;
    setZones(INITIAL_ZONES);
    setProducts(INITIAL_PRODUCTS);
    setToast("Demo data restored");
  };

  const handleLogout = () => {
    if (!window.confirm("Log out of Retail Analyst?")) return;
    setIsAlertsOpen(false);
    setIsLoggedOut(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedOut(false);
    setToast("Successfully logged in");
  };

  const range = useMemo(() => {
    const base = BASE_RANGE_DATA[selectedRange];
    const mod = STORE_MODIFIERS[selectedStore] ?? 1;
    const clamp100 = (n) => Math.min(100, Math.round(n));
    return {
      avgAttention: clamp100(base.attention * mod),
      attentionTrend: `${(base.attentionTrend * mod).toFixed(1)}%`,
      avgDwell: formatDwell(base.dwellSec * mod),
      dwellTrend: `${Math.round(base.dwellTrend * mod)}s`,
      engagement: `${Math.min(100, base.engagement * mod).toFixed(1)}%`,
      engagementTrend: `${(base.engagementTrend * mod).toFixed(1)}%`,
      returning: `${Math.min(100, base.returning * mod).toFixed(1)}%`,
      returningTrend: `${(base.returningTrend * mod).toFixed(1)}%`,
      traffic: `${(base.trafficBase * mod).toFixed(1)} p/m²`,
      peakHour: base.peakHour,
    };
  }, [selectedRange, selectedStore]);

  const filteredZones = useMemo(
    () => zones.filter((z) => selectedStore === "All Stores" || z.store === selectedStore),
    [zones, selectedStore]
  );
  const filteredProducts = useMemo(
    () => products.filter((p) => selectedStore === "All Stores" || p.store === selectedStore),
    [products, selectedStore]
  );
  const sortedZones = useMemo(() => [...filteredZones].sort((a, b) => b.intensity - a.intensity), [filteredZones]);
  const sortedProducts = useMemo(() => [...filteredProducts].sort((a, b) => b.score - a.score), [filteredProducts]);

  const storeSnapshot = useMemo(() => {
    const avgScore = sortedProducts.length
      ? Math.round(sortedProducts.reduce((sum, p) => sum + p.score, 0) / sortedProducts.length)
      : 0;
    return {
      activeZones: filteredZones.length,
      topZone: sortedZones[0]?.name ?? "—",
      needsAttention: filteredZones.filter((z) => z.intensity < 50).length,
      productsTracked: filteredProducts.length,
      avgProductScore: avgScore,
      profile: STORE_PROFILES[selectedStore] || null,
    };
  }, [filteredZones, filteredProducts, sortedZones, sortedProducts, selectedStore]);

  const zoneAttentionChart = useMemo(
    () =>
      sortedZones.slice(0, 6).map((z) => ({
        label: z.name,
        value: z.intensity,
        color: getHeatColor(z.intensity),
      })),
    [sortedZones]
  );

  const peakHourChart = useMemo(() => {
    const mod = STORE_MODIFIERS[selectedStore] ?? 1;
    return HOUR_LABELS.map((label, i) => ({ label, value: Math.min(100, Math.round(HOURLY_SHAPE[i] * mod)) }));
  }, [selectedStore]);
  const peakHourIndex = peakHourChart.reduce((best, cur, i) => (cur.value > peakHourChart[best].value ? i : best), 0);

  const hoveredZone = useMemo(() => sortedZones.find((z) => z.id === hoveredZoneId) || null, [sortedZones, hoveredZoneId]);
  const displayedZone = hoveredZone || sortedZones[0] || null;
  const displayedZoneStats = displayedZone ? estimateZoneStats(displayedZone.intensity) : null;

  // ================= ZONES: CRUD =================
  const openAddZone = () => {
    setEditingZoneId(null);
    setZoneForm({ name: "", store: selectedStore !== "All Stores" ? selectedStore : STORES_REAL[0], intensity: "" });
    setActiveModal("zone");
  };
  const openEditZone = (zone) => {
    setEditingZoneId(zone.id);
    setZoneForm({ name: zone.name, store: zone.store, intensity: String(zone.intensity) });
    setActiveModal("editZone");
  };
  const handleAddZone = (e) => {
    e.preventDefault();
    if (!zoneForm.name.trim()) return;
    const intensity = Math.max(0, Math.min(100, Number(zoneForm.intensity) || 0));
    const newZone = { id: `Z-${Date.now()}`, name: zoneForm.name.trim(), store: zoneForm.store, intensity };
    setZones((prev) => [...prev, newZone]);
    setToast(`Zone "${newZone.name}" added`);
    setActiveModal(null);
  };
  const handleUpdateZone = (e) => {
    e.preventDefault();
    if (!zoneForm.name.trim() || !editingZoneId) return;
    const intensity = Math.max(0, Math.min(100, Number(zoneForm.intensity) || 0));
    setZones((prev) =>
      prev.map((z) => (z.id === editingZoneId ? { ...z, name: zoneForm.name.trim(), store: zoneForm.store, intensity } : z))
    );
    setToast(`Zone "${zoneForm.name}" updated`);
    setEditingZoneId(null);
    setActiveModal(null);
  };
  const handleDeleteZone = (zone) => {
    if (!window.confirm(`Delete zone "${zone.name}"?`)) return;
    setZones((prev) => prev.filter((z) => z.id !== zone.id));
    if (hoveredZoneId === zone.id) setHoveredZoneId(null);
    setToast(`Zone "${zone.name}" deleted`);
  };

  // ================= PRODUCTS: CRUD =================
  const openAddProduct = () => {
    setEditingProductId(null);
    setProductForm({ name: "", store: selectedStore !== "All Stores" ? selectedStore : STORES_REAL[0], category: "", score: "" });
    setActiveModal("product");
  };
  const openEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({ name: product.name, store: product.store, category: product.category, score: String(product.score) });
    setActiveModal("editProduct");
  };
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;
    const score = Math.max(0, Math.min(100, Number(productForm.score) || 0));
    const newProduct = {
      id: `P-${Date.now()}`,
      name: productForm.name.trim(),
      store: productForm.store,
      category: productForm.category.trim() || "Uncategorized",
      score,
    };
    setProducts((prev) => [...prev, newProduct]);
    setToast(`Product "${newProduct.name}" added`);
    setActiveModal(null);
  };
  const handleUpdateProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !editingProductId) return;
    const score = Math.max(0, Math.min(100, Number(productForm.score) || 0));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProductId
          ? { ...p, name: productForm.name.trim(), store: productForm.store, category: productForm.category.trim() || "Uncategorized", score }
          : p
      )
    );
    setToast(`Product "${productForm.name}" updated`);
    setEditingProductId(null);
    setActiveModal(null);
  };
  const handleDeleteProduct = (product) => {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setToast(`Product "${product.name}" deleted`);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingZoneId(null);
    setEditingProductId(null);
  };

  const handleExportReport = () => {
    const rows = [
      [`Retail Analytics Report — ${selectedStore}`],
      [`Date Range,${DATE_RANGES.find((r) => r.id === selectedRange)?.label}`],
      [],
      ["Metric", "Value"],
      ["Avg Attention Score", `${range.avgAttention}/100`],
      ["Avg Dwell Time", range.avgDwell],
      ["Product Engagement", range.engagement],
      ["Returning Visitors", range.returning],
      ["Traffic Density", range.traffic],
      ["Peak Hour", range.peakHour],
      [],
      ["Zone", "Store", "Attention Intensity"],
      ...sortedZones.map((z) => [z.name, z.store, z.intensity]),
      [],
      ["Product", "Store", "Category", "Attractiveness Score"],
      ...filteredProducts.map((p) => [p.name, p.store, p.category, p.score]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `retail_analytics_${selectedRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast("Analytics report exported as CSV");
  };

  // ================= LOGGED-OUT SCREEN / LOGIN PAGE =================
  if (isLoggedOut) {
    return (
      <div
        style={{
          backgroundColor: TOKENS.bg,
          color: TOKENS.text,
          minHeight: "100vh",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ ...cardStyle, width: "100%", maxWidth: "380px", padding: "32px", border: `1px solid ${TOKENS.cardBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                backgroundColor: TOKENS.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              👁️
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", margin: 0, color: TOKENS.text }}>Retail Analyst</h1>
          </div>

          <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 6px 0", textAlign: "center", color: TOKENS.text }}>Welcome Back</h2>
          <p style={{ fontSize: "12px", color: TOKENS.muted, margin: "0 0 24px 0", textAlign: "center" }}>
            Sign in to access store analytics and heatmaps
          </p>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={inputStyle}
                placeholder="analyst@retail.com"
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: TOKENS.accent,
                color: "#1A1200",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s",
              }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: TOKENS.bg, color: TOKENS.text, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes heatPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
          50% { transform: translate(-50%, -50%) scale(1.18); opacity: 1; }
        }
      `}</style>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: TOKENS.cardBg,
            border: `1px solid ${TOKENS.success}`,
            color: TOKENS.text,
            padding: "12px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
            zIndex: 3000,
          }}
        >
          ✅ {toast}
        </div>
      )}

      {/* HEADER */}
      <header
        style={{
          backgroundColor: TOKENS.sidebarBg,
          borderBottom: `1px solid ${TOKENS.cardBorder}`,
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px" }}>
            👁️
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "700", margin: 0, lineHeight: 1.2 }}>Retail Analyst</h1>
            <span style={{ fontSize: "11px", color: TOKENS.muted }}>Consumer Attention & Behavior Intelligence</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", color: TOKENS.muted }}>🏬</span>
            <select style={selectStyle} value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
              {STORES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <select style={selectStyle} value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
            {DATE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <div style={{ textAlign: "right", borderLeft: `1px solid ${TOKENS.cardBorder}`, paddingLeft: "12px" }}>
            <div suppressHydrationWarning style={{ fontSize: "13px", fontWeight: "600", fontFamily: "monospace" }}>
              {time.toLocaleTimeString()}
            </div>
            <div suppressHydrationWarning style={{ fontSize: "10px", color: TOKENS.muted }}>
              {time.toLocaleDateString()}
            </div>
          </div>

          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: TOKENS.text }}
          >
            🔔
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                backgroundColor: TOKENS.danger,
                color: "#fff",
                fontSize: "9px",
                borderRadius: "50%",
                width: "14px",
                height: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {alerts.length}
            </span>
          </button>

          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              borderRadius: "8px",
              border: `1px solid ${TOKENS.cardBorder}`,
              backgroundColor: "transparent",
              color: TOKENS.muted,
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {isAlertsOpen && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            right: "20px",
            width: "320px",
            backgroundColor: TOKENS.sidebarBg,
            border: `1px solid ${TOKENS.cardBorder}`,
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: `1px solid ${TOKENS.cardBorder}`, paddingBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Analytics Alerts</h3>
            <button onClick={() => setIsAlertsOpen(false)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer" }}>
              ✕
            </button>
          </div>
          {alerts.map((a) => (
            <div key={a.id} style={{ padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
              <div style={{ fontSize: "12px", fontWeight: "600" }}>{a.title}</div>
              <div style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "2px" }}>{a.time}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flex: 1 }}>
        {/* SIDEBAR */}
        <aside style={{ width: "220px", backgroundColor: TOKENS.sidebarBg, borderRight: `1px solid ${TOKENS.cardBorder}`, padding: "20px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { id: "overview", label: "Analytics Overview", icon: "📊" },
              { id: "heatmap", label: "Zone Heatmaps & Peak Hours", icon: "🔥" },
              { id: "reports", label: "Reports & Export", icon: "📄" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: activeTab === tab.id ? TOKENS.accent : "transparent",
                  color: activeTab === tab.id ? "#1A1200" : TOKENS.muted,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleResetDemoData}
            style={{ background: "none", border: "none", color: TOKENS.muted, fontSize: "11px", cursor: "pointer", textDecoration: "underline", textAlign: "left" }}
          >
            Reset demo data
          </button>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: COLORS.textPrimary }}>Consumer Behavior & Attention Intelligence</h1>
            <p style={{ color: COLORS.textSecondary, margin: "4px 0 0 0", fontSize: "13px" }}>
              Showing <strong style={{ color: TOKENS.text }}>{selectedStore}</strong> · {DATE_RANGES.find((r) => r.id === selectedRange)?.label}
              {storeSnapshot.profile && (
                <>
                  {" "}
                  · Manager: <strong style={{ color: TOKENS.text }}>{storeSnapshot.profile.manager}</strong> · {storeSnapshot.profile.floorSqft} ·{" "}
                  {storeSnapshot.profile.cameras} cameras
                </>
              )}
            </p>
          </div>

          {/* ================= TAB: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px" }}>
                <StatCard label="Avg Attention Score" value={`${range.avgAttention}/100`} trend={range.attentionTrend} isPositive />
                <StatCard label="Avg Dwell Time" value={range.avgDwell} trend={range.dwellTrend} isPositive />
                <StatCard label="Product Engagement" value={range.engagement} trend={range.engagementTrend} isPositive />
                <StatCard label="Returning Visitors" value={range.returning} trend={range.returningTrend} isPositive />
                <StatCard label="Traffic Density" value={range.traffic} subtext="Optimal range" />
                <StatCard label="Peak Hour" value={range.peakHour} accentColor={TOKENS.accent} subtext="Busiest window today" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
                <StatCard label="Active Zones" value={storeSnapshot.activeZones} subtext={selectedStore} />
                <StatCard label="Top Zone" value={storeSnapshot.topZone} accentColor={TOKENS.accent} />
                <StatCard
                  label="Zones Needing Attention"
                  value={storeSnapshot.needsAttention}
                  accentColor={storeSnapshot.needsAttention > 0 ? TOKENS.danger : TOKENS.success}
                  subtext="Intensity below 50"
                />
                <StatCard label="Products Tracked" value={storeSnapshot.productsTracked} />
                <StatCard label="Avg Product Score" value={`${storeSnapshot.avgProductScore}/100`} accentColor={TOKENS.success} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <Card title="Customer Journey Flow Diagram" subtitle="Sequential traffic drop-off per zone">
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px" }}>
                    {JOURNEY_STEPS.map((step, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ width: "110px", fontSize: "13px", fontWeight: 600 }}>{step.name}</span>
                        <div style={{ flex: 1, backgroundColor: COLORS.bg, borderRadius: "6px", height: "24px", overflow: "hidden" }}>
                          <div style={{ width: step.pct, backgroundColor: COLORS.primary, height: "100%", borderRadius: "6px", transition: "width 0.5s ease" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, width: "40px" }}>{step.pct}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Attention by Zone" subtitle={`Top zones for ${selectedStore} — pulled from the live zone list`}>
                  {zoneAttentionChart.length > 0 ? (
                    <BarChartVisual data={zoneAttentionChart} />
                  ) : (
                    <p style={{ fontSize: "12px", color: TOKENS.muted }}>No zones for this store yet — add one from the Zone Heatmaps tab.</p>
                  )}
                </Card>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                <Card
                  title="Product Attractiveness Ranking"
                  subtitle="Based on attention vs interaction conversion index"
                  headerRight={
                    <button onClick={openAddProduct} style={smallBtn(TOKENS.accent, { color: "#1A1200", padding: "6px 12px" })}>
                      + Add Product
                    </button>
                  }
                >
                  <Table headers={["Product Name", "Store", "Category", "Attractiveness Score", "Actions"]}>
                    {filteredProducts.length === 0 ? (
                      <Row>
                        <Cell>
                          <span style={{ color: TOKENS.muted }}>No products tracked for this store yet.</span>
                        </Cell>
                        <Cell />
                        <Cell />
                        <Cell />
                        <Cell />
                      </Row>
                    ) : (
                      filteredProducts.map((p) => (
                        <Row key={p.id}>
                          <Cell>
                            <strong>{p.name}</strong>
                          </Cell>
                          <Cell>
                            <span style={{ color: TOKENS.muted, fontSize: "12px" }}>{p.store}</span>
                          </Cell>
                          <Cell>{p.category}</Cell>
                          <Cell>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ flex: 1, backgroundColor: COLORS.bg, height: "8px", borderRadius: "4px" }}>
                                <div style={{ width: `${p.score}%`, backgroundColor: COLORS.green, height: "100%", borderRadius: "4px" }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: "12px" }}>{p.score}</span>
                            </div>
                          </Cell>
                          <Cell>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button onClick={() => openEditProduct(p)} style={smallBtn(TOKENS.accent)}>
                                Edit
                              </button>
                              <button onClick={() => handleDeleteProduct(p)} style={smallBtn(TOKENS.danger)}>
                                Delete
                              </button>
                            </div>
                          </Cell>
                        </Row>
                      ))
                    )}
                  </Table>
                </Card>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <AIInsightCard
                    title="Analyst Behavioral Insights"
                    recommendations={[
                      "Shoppers spend 42% more time near Shelf C when endcap displays are active.",
                      "Promotional placement increased overall store engagement by 28%.",
                      `Traffic peaks around ${range.peakHour} — consider aligning staffing and promotions to this window.`,
                    ]}
                  />
                  <Card title="Consumer Segmentation">
                    <BarChartVisual data={SEGMENTATION} />
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* ================= TAB: ZONE HEATMAPS & PEAK HOURS ================= */}
          {activeTab === "heatmap" && (
            <>
              <Card
                title="🔥 Store Floorplan Attention Heatmap"
                subtitle={`${sortedZones.length} zone(s) displayed for ${selectedStore} — Clear intensity markings with high-contrast cards`}
                headerRight={
                  <button onClick={openAddZone} style={smallBtn(TOKENS.accent, { color: "#1A1200", padding: "6px 12px" })}>
                    + Add Zone
                  </button>
                }
              >
                {sortedZones.length === 0 ? (
                  <p style={{ fontSize: "12px", color: TOKENS.muted }}>No zones tracked for this store yet — add one to get started.</p>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "380px",
                      borderRadius: "12px",
                      border: `1px solid ${TOKENS.cardBorder}`,
                      backgroundColor: "#070A10",
                      overflow: "hidden",
                    }}
                  >
                    {/* Floor Plan Structural Grid */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `linear-gradient(${TOKENS.cardBorder} 1px, transparent 1px), linear-gradient(90deg, ${TOKENS.cardBorder} 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                        opacity: 0.25,
                      }}
                    />

                    {/* Entrance / Exit Indicators */}
                    <div style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 8px", backgroundColor: "rgba(35, 44, 64, 0.7)", borderRadius: "4px", border: `1px solid ${TOKENS.cardBorder}`, fontSize: "10px", color: TOKENS.muted }}>
                      🚪 Main Entrance
                    </div>
                    <div style={{ position: "absolute", bottom: "12px", right: "12px", padding: "4px 8px", backgroundColor: "rgba(35, 44, 64, 0.7)", borderRadius: "4px", border: `1px solid ${TOKENS.cardBorder}`, fontSize: "10px", color: TOKENS.muted }}>
                      🧾 Checkout & Exit
                    </div>

                    {/* Heat Radiance Glow Blobs */}
                    {sortedZones.map((z) => {
                      const { x, y } = hashFloorPosition(z.id);
                      const size = 90 + (z.intensity / 100) * 120;
                      const color = getHeatColor(z.intensity);
                      const isHot = z.intensity >= 80;
                      return (
                        <div
                          key={`${z.id}-glow`}
                          style={{
                            position: "absolute",
                            left: `${x}%`,
                            top: `${y}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            transform: "translate(-50%, -50%)",
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${color} 0%, ${color}88 35%, ${color}22 65%, transparent 80%)`,
                            filter: "blur(8px)",
                            animation: isHot ? "heatPulse 2s ease-in-out infinite" : "none",
                            pointerEvents: "none",
                          }}
                        />
                      );
                    })}

                    {/* Zone Cards over Floor map with high contrast */}
                    {sortedZones.map((z, i) => {
                      const { x, y } = hashFloorPosition(z.id);
                      const heatColor = getHeatColor(z.intensity);
                      const isHovered = hoveredZoneId === z.id;

                      return (
                        <div
                          key={z.id}
                          onMouseEnter={() => setHoveredZoneId(z.id)}
                          onMouseLeave={() => setHoveredZoneId((cur) => (cur === z.id ? null : cur))}
                          style={{
                            position: "absolute",
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: "translate(-50%, -50%)",
                            zIndex: isHovered ? 10 : 2,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "rgba(19, 26, 39, 0.92)",
                              backdropFilter: "blur(6px)",
                              border: `1.5px solid ${isHovered ? TOKENS.accent : heatColor}`,
                              borderRadius: "10px",
                              padding: "8px 12px",
                              boxShadow: isHovered ? `0 0 15px ${heatColor}` : "0 4px 12px rgba(0,0,0,0.6)",
                              minWidth: "110px",
                              textAlign: "center",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "4px" }}>
                              <span style={{ fontSize: "9px", fontWeight: 700, color: TOKENS.muted, backgroundColor: TOKENS.bg, padding: "1px 5px", borderRadius: "4px" }}>
                                #{i + 1}
                              </span>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  color: heatColor,
                                }}
                              >
                                {z.intensity}%
                              </span>
                            </div>

                            <div style={{ fontSize: "12px", color: "#FFF", fontWeight: 700, whiteSpace: "nowrap" }}>
                              {z.name}
                            </div>

                            {selectedStore === "All Stores" && (
                              <div style={{ fontSize: "9px", color: TOKENS.muted, marginTop: "2px", whiteSpace: "nowrap" }}>
                                {z.store}
                              </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginTop: "6px" }}>
                              <button onClick={(e) => { e.stopPropagation(); openEditZone(z); }} style={smallBtn("rgba(255,255,255,0.1)")}>
                                Edit
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteZone(z); }} style={smallBtn("rgba(232, 101, 79, 0.2)", { color: TOKENS.danger })}>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Gradient Legend */}
                <div style={{ marginTop: "16px" }}>
                  <div
                    style={{
                      height: "8px",
                      borderRadius: "999px",
                      background: `linear-gradient(to right, ${getHeatColor(0)}, ${getHeatColor(25)}, ${getHeatColor(50)}, ${getHeatColor(75)}, ${getHeatColor(100)})`,
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: TOKENS.muted, marginTop: "6px" }}>
                    <span>🔵 Low Traffic (0 - 30%)</span>
                    <span>🟢 Moderate (31 - 60%)</span>
                    <span>🟠 High Activity (61 - 84%)</span>
                    <span>🔴 Peak Hotspot (85 - 100%)</span>
                  </div>
                </div>

                {/* Live Zone Stats Summary Panel */}
                {displayedZone && (
                  <div
                    style={{
                      marginTop: "16px",
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "12px",
                      padding: "14px 18px",
                      borderRadius: "10px",
                      backgroundColor: TOKENS.bg,
                      border: `1px solid ${TOKENS.cardBorder}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "10px", color: TOKENS.muted, fontWeight: 600 }}>SELECTED ZONE</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: TOKENS.text }}>{displayedZone.name}</div>
                      <div style={{ fontSize: "11px", color: TOKENS.muted }}>{displayedZone.store}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: TOKENS.muted, fontWeight: 600 }}>ATTENTION INTENSITY</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: getHeatColor(displayedZone.intensity) }}>
                        {displayedZone.intensity}/100
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: TOKENS.muted, fontWeight: 600 }}>ESTIMATED VISITS</div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>{displayedZoneStats.visits} visitors</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: TOKENS.muted, fontWeight: 600 }}>AVG DWELL TIME</div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>{formatDwell(displayedZoneStats.dwellSec)}</div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Enhanced Peak Hours Visual */}
              <Card title="⏱ Peak Traffic Hours" subtitle={`Busiest hourly window for ${selectedStore}: ${peakHourChart[peakHourIndex].label}`}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "160px", padding: "16px 8px 8px", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                  {peakHourChart.map((h, i) => {
                    const isPeak = i === peakHourIndex;
                    return (
                      <div key={h.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "10px", fontWeight: isPeak ? 800 : 500, color: isPeak ? TOKENS.accent : TOKENS.muted }}>
                          {h.value}%
                        </span>
                        <div
                          style={{
                            width: "100%",
                            height: `${h.value}%`,
                            backgroundColor: isPeak ? TOKENS.accent : TOKENS.info,
                            borderRadius: "4px 4px 0 0",
                            boxShadow: isPeak ? `0 0 10px ${TOKENS.accent}` : "none",
                            transition: "height 0.4s ease",
                          }}
                        />
                        <span style={{ fontSize: "10px", fontWeight: isPeak ? 700 : 500, color: isPeak ? TOKENS.text : TOKENS.muted }}>
                          {h.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          {/* ================= TAB: REPORTS & EXPORT ================= */}
          {activeTab === "reports" && (
            <Card title="📄 Reports & Export" subtitle="Download the current analytics view as a CSV report">
              <p style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "16px" }}>
                Exports KPIs, zone attention scores, and product rankings for{" "}
                <strong style={{ color: TOKENS.text }}>{selectedStore}</strong> over{" "}
                <strong style={{ color: TOKENS.text }}>{DATE_RANGES.find((r) => r.id === selectedRange)?.label.toLowerCase()}</strong>. Changing the
                store or date range at the top updates exactly what gets exported.
              </p>
              <button
                onClick={handleExportReport}
                style={{ padding: "10px 18px", backgroundColor: TOKENS.accent, color: "#1A1200", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
              >
                ⬇ Export Analytics Report (CSV)
              </button>
            </Card>
          )}
        </main>
      </div>

      {/* ================= ZONE MODALS ================= */}
      {activeModal === "zone" && (
        <Modal title="Add Zone" onClose={closeModal}>
          <form onSubmit={handleAddZone}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Zone Name</label>
              <input style={inputStyle} value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} placeholder="e.g. Snacks Aisle" autoFocus />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store</label>
              <select style={inputStyle} value={zoneForm.store} onChange={(e) => setZoneForm({ ...zoneForm, store: e.target.value })}>
                {STORES_REAL.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Attention Intensity (0-100)</label>
              <input type="number" min="0" max="100" style={inputStyle} value={zoneForm.intensity} onChange={(e) => setZoneForm({ ...zoneForm, intensity: e.target.value })} placeholder="e.g. 65" />
            </div>
            <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: TOKENS.accent, color: "#1A1200", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
              Create Zone
            </button>
          </form>
        </Modal>
      )}

      {activeModal === "editZone" && (
        <Modal title="Edit Zone" onClose={closeModal}>
          <form onSubmit={handleUpdateZone}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Zone Name</label>
              <input style={inputStyle} value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} autoFocus />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store</label>
              <select style={inputStyle} value={zoneForm.store} onChange={(e) => setZoneForm({ ...zoneForm, store: e.target.value })}>
                {STORES_REAL.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Attention Intensity (0-100)</label>
              <input type="number" min="0" max="100" style={inputStyle} value={zoneForm.intensity} onChange={(e) => setZoneForm({ ...zoneForm, intensity: e.target.value })} />
            </div>
            <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: TOKENS.accent, color: "#1A1200", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
              Save Changes
            </button>
          </form>
        </Modal>
      )}

      {/* ================= PRODUCT MODALS ================= */}
      {activeModal === "product" && (
        <Modal title="Add Product" onClose={closeModal}>
          <form onSubmit={handleAddProduct}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Product Name</label>
              <input style={inputStyle} value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Noise-Cancelling Earbuds" autoFocus />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store</label>
              <select style={inputStyle} value={productForm.store} onChange={(e) => setProductForm({ ...productForm, store: e.target.value })}>
                {STORES_REAL.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Category</label>
              <input style={inputStyle} value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="e.g. Electronics" />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Attractiveness Score (0-100)</label>
              <input type="number" min="0" max="100" style={inputStyle} value={productForm.score} onChange={(e) => setProductForm({ ...productForm, score: e.target.value })} placeholder="e.g. 88" />
            </div>
            <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: TOKENS.accent, color: "#1A1200", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
              Create Product
            </button>
          </form>
        </Modal>
      )}

      {activeModal === "editProduct" && (
        <Modal title="Edit Product" onClose={closeModal}>
          <form onSubmit={handleUpdateProduct}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Product Name</label>
              <input style={inputStyle} value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} autoFocus />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store</label>
              <select style={inputStyle} value={productForm.store} onChange={(e) => setProductForm({ ...productForm, store: e.target.value })}>
                {STORES_REAL.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Category</label>
              <input style={inputStyle} value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Attractiveness Score (0-100)</label>
              <input type="number" min="0" max="100" style={inputStyle} value={productForm.score} onChange={(e) => setProductForm({ ...productForm, score: e.target.value })} />
            </div>
            <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: TOKENS.accent, color: "#1A1200", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}