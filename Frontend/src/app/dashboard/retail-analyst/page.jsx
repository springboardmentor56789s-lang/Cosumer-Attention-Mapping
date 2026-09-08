"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

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
  const [storeList, setStoreList] = useState(STORES);
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [selectedRange, setSelectedRange] = useState("week");
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts] = useState(INITIAL_ALERTS);
  const [time, setTime] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [userName, setUserName] = useState("Kushalini");

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
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const saved = localStorage.getItem("user_name");
      if (saved && saved.trim()) setUserName(saved.trim());
    } catch (e) {}

    axios
      .get("http://localhost:8000/stores", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data.map((s) => s.name);
          setStoreList(["All Stores", ...names]);
        }
      })
      .catch(() => {});
  }, []);

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
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
    } catch (e) {}
    if (!window.confirm("Log out of Retail Analyst?")) return;
    setIsAlertsOpen(false);
    setIsLoggedOut(true);
    window.location.href = "/login";
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
    <div style={{ backgroundColor: TOKENS.bg, color: TOKENS.text, height: "100vh", width: "100vw", overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
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
              {storeList.map((s) => (
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

      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 64px)", overflow: "hidden", width: "100%" }}>
        {/* SIDEBAR */}
        <aside style={{ width: "240px", backgroundColor: TOKENS.sidebarBg, borderRight: `1px solid ${TOKENS.cardBorder}`, padding: "20px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", flexShrink: 0, boxSizing: "border-box" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
            {[
              { id: "overview", label: "Analytics Overview", icon: "📊" },
              { id: "funnel", label: "Purchase Funnel", icon: "🔻" },
              { id: "persona", label: "Shopper Personas", icon: "🧬" },
              { id: "heatmap", label: "Zone Heatmaps & Peak", icon: "🔥" },
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
                  fontWeight: activeTab === tab.id ? "700" : "500",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ borderTop: `1px solid ${TOKENS.cardBorder}`, paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(232,163,61,0.2)", border: `1px solid ${TOKENS.accent}`, color: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800 }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.text, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {userName}
                </div>
                <div style={{ fontSize: "10px", color: TOKENS.success, fontWeight: 600 }}>
                  ● Retail Analyst
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                try {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user_name");
                  localStorage.removeItem("user_email");
                } catch (e) {}
                window.location.href = "/login";
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(232,101,79,0.35)",
                backgroundColor: "rgba(232,101,79,0.12)",
                color: TOKENS.danger,
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 700,
                transition: "all 0.2s",
              }}
            >
              <span>🚪</span>
              <span>Log out</span>
            </button>

            <button
              onClick={handleResetDemoData}
              style={{ background: "none", border: "none", color: TOKENS.muted, fontSize: "10px", cursor: "pointer", textDecoration: "underline", textAlign: "center", marginTop: "2px" }}
            >
              Reset demo data
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, height: "100%", padding: "24px 28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
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

          {/* ================= TAB: PURCHASE FUNNEL ================= */}
          {activeTab === "funnel" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <StatCard label="Entry-to-Sale Conversion" value="10.9%" trend="1.2%" isPositive subtext="162 of 1,480 shoppers" />
                <StatCard label="Critical Friction Drop" value="-38.0%" accentColor={TOKENS.danger} subtext="Gaze to Physical Touch" />
                <StatCard label="Touch-to-Cart Rate" value="51.9%" trend="3.4%" isPositive subtext="High physical intent" />
                <StatCard label="Cart Abandonment" value="9.0%" trend="-0.8%" isPositive subtext="Industry low" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
                <Card title="🔻 5-Stage Shopper Conversion Funnel" subtitle="Sequential progression from store walk-by to completed register purchase">
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                    {[
                      { stage: "1. Passersby & Footfall", count: 1480, pct: "100%", width: "100%", color: TOKENS.accent, drop: "-577 shoppers (-39.0%)" },
                      { stage: "2. Gaze Fixation (>2s)", count: 903, pct: "61.0%", width: "78%", color: "#E8A33D", drop: "-560 shoppers (-38.0%)" },
                      { stage: "3. Physical Touch & Handling", count: 343, pct: "23.2%", width: "55%", color: TOKENS.info, drop: "-165 shoppers (-11.2%)" },
                      { stage: "4. Cart / Basket Placement", count: 178, pct: "12.0%", width: "38%", color: "#5FAE86", drop: "-16 shoppers (-1.1%)" },
                      { stage: "5. Checkout & POS Purchase", count: 162, pct: "10.9%", width: "26%", color: TOKENS.success, drop: "Final Sale Completed" },
                    ].map((step, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                          <span style={{ fontWeight: 700 }}>{step.stage}</span>
                          <span style={{ fontFamily: "monospace", color: TOKENS.muted }}>{step.count.toLocaleString()} shoppers ({step.pct})</span>
                        </div>
                        <div style={{ width: "100%", backgroundColor: TOKENS.cardBorder, height: "24px", borderRadius: "6px", overflow: "hidden" }}>
                          <div style={{ width: step.width, height: "100%", backgroundColor: step.color, borderRadius: "6px", transition: "width 0.5s ease" }} />
                        </div>
                        {idx < 4 && (
                          <div style={{ fontSize: "10px", color: TOKENS.danger, fontFamily: "monospace", alignSelf: "flex-end" }}>
                            ▼ Drop-off: {step.drop}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="💡 Funnel Conversion Insights" subtitle="AI-driven merchandising friction diagnostics">
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    {[
                      { icon: "🚨", title: "High Gaze to Low Touch Drop-off", desc: "61% look at Eye-Level displays but only 23.2% touch products. Primary cause: Price label opacity and lack of bundle signage." },
                      { icon: "⚡", title: "Touch-to-Cart Efficiency is Strong", desc: "Over 51.9% of shoppers who physically handle items place them into their basket. Merchandising tactile samples will yield immediate +14% lift." },
                      { icon: "🛒", title: "Low Checkout Abandonment", desc: "91% of customers who add items to cart finalize checkout, confirming minimal checkout queue frustration." },
                    ].map((ins, i) => (
                      <div key={i} style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${TOKENS.cardBorder}` }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.accent, display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{ins.icon}</span>
                          <span>{ins.title}</span>
                        </div>
                        <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: TOKENS.muted, lineHeight: 1.5 }}>
                          {ins.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ================= TAB: SHOPPER PERSONAS ================= */}
          {activeTab === "persona" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>🧬 Shopper DNA Behavioral Profile Engine</h2>
                <p style={{ color: TOKENS.muted, margin: "4px 0 0 0", fontSize: "12px" }}>
                  Automated computer vision clustering of customer pathway speeds, interaction frequencies, and dwell patterns.
                </p>
              </div>

              {/* 5 Consumer Segments (Page 5 Specification) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {[
                  { title: "🧭 Explorers", share: "26%", dwell: "9.4m", conv: "28%", count: "385", color: TOKENS.info, desc: "Broad browsing across multiple categories. High curiosity, discovers new products. Highest exposure to promotional endcaps and new SKUs." },
                  { title: "⚡ Quick Buyers", share: "31%", dwell: "2.8m", conv: "82%", count: "459", color: TOKENS.success, desc: "Direct path to target shelf with immediate pickup. High movement velocity and swift checkout. Highest revenue efficiency per minute." },
                  { title: "🔍 Comparison Shoppers", share: "21%", dwell: "13.2m", conv: "74%", count: "311", color: TOKENS.accent, desc: "Extended dwell inspecting packages, price tags, and shelf tiers. Multiple pickup and return events before purchase." },
                  { title: "🛒 Impulse Buyers", share: "14%", dwell: "5.6m", conv: "64%", count: "207", color: "#A78BFA", desc: "High attention capture by Eye-Level Golden Zone displays. Easily converts with visible promotional signage and bundled discounts." },
                  { title: "💎 Brand Loyal Customers", share: "8%", dwell: "4.1m", conv: "91%", count: "118", color: "#38BDF8", desc: "Direct, habitual navigation to known product positions. Minimal deliberation. Highest repeat engagement and brand retention." },
                ].map((p, idx) => (
                  <div key={idx} style={{ padding: "18px", borderRadius: "12px", border: `1.5px solid ${p.color}`, backgroundColor: TOKENS.sidebarBg, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: TOKENS.text }}>{p.title}</span>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.08)", color: p.color }}>{p.share}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "11.5px", color: TOKENS.muted, lineHeight: 1.5 }}>
                      {p.desc}
                    </p>
                    <div style={{ display: "flex", gap: "14px", borderTop: `1px solid ${TOKENS.cardBorder}`, paddingTop: "8px", marginTop: "4px", fontSize: "11px" }}>
                      <div>Dwell: <strong style={{ color: TOKENS.text }}>{p.dwell}</strong></div>
                      <div>Conv: <strong style={{ color: p.color }}>{p.conv}</strong></div>
                      <div>Shoppers: <strong style={{ color: TOKENS.text }}>{p.count}</strong></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weighted Attractiveness Scoring Table */}
              <Card title="📊 Weighted Product Attractiveness Scoring (Page 6 Standard)" subtitle="Formula: Score = 35%(Attention) + 25%(Interaction) + 20%(Pickup) + 15%(Conversion) + 5%(Repeat)">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginTop: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted, textAlign: "left", fontSize: "11px" }}>
                      <th style={{ padding: "10px 8px" }}>SKU Code</th>
                      <th style={{ padding: "10px 8px" }}>Product Name</th>
                      <th style={{ padding: "10px 8px" }}>Tier</th>
                      <th style={{ padding: "10px 8px" }}>Attn (35%)</th>
                      <th style={{ padding: "10px 8px" }}>Touch (25%)</th>
                      <th style={{ padding: "10px 8px" }}>Pickup (20%)</th>
                      <th style={{ padding: "10px 8px" }}>Conv (15%)</th>
                      <th style={{ padding: "10px 8px" }}>Score</th>
                      <th style={{ padding: "10px 8px" }}>Status Badge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: "SKU-BEV-001", name: "Sparkling Citrus Energy Drink", tier: "Golden Zone", attn: 94, touch: 88, pick: 72, conv: 68, score: 86.6, badge: "Star Product", color: TOKENS.success },
                      { code: "SKU-ELE-042", name: "Wireless Noise-Cancel Headphones", tier: "Golden Zone", attn: 88, touch: 76, pick: 55, conv: 72, score: 74.6, badge: "Steady Performer", color: TOKENS.accent },
                      { code: "SKU-SNK-108", name: "Roasted Almonds Mix 500g", tier: "Golden Zone", attn: 80, touch: 74, pick: 60, conv: 58, score: 72.3, badge: "Steady Performer", color: TOKENS.accent },
                      { code: "SKU-TEA-003", name: "Organic Green Tea 200g", tier: "Top Shelf", attn: 58, touch: 42, pick: 38, conv: 30, score: 47.9, badge: "Underperforming", color: TOKENS.danger },
                      { code: "SKU-BAR-021", name: "Gluten-Free Granola Bar", tier: "Bottom Shelf", attn: 32, touch: 28, pick: 22, conv: 18, score: 27.1, badge: "Underperforming", color: TOKENS.danger },
                    ].map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                        <td style={{ padding: "10px 8px", fontFamily: "monospace", color: TOKENS.muted }}>{item.code}</td>
                        <td style={{ padding: "10px 8px", fontWeight: 700 }}>{item.name}</td>
                        <td style={{ padding: "10px 8px", color: item.tier.includes("Golden") ? TOKENS.accent : TOKENS.muted }}>{item.tier}</td>
                        <td style={{ padding: "10px 8px" }}>{item.attn}</td>
                        <td style={{ padding: "10px 8px" }}>{item.touch}</td>
                        <td style={{ padding: "10px 8px" }}>{item.pick}</td>
                        <td style={{ padding: "10px 8px" }}>{item.conv}</td>
                        <td style={{ padding: "10px 8px", fontWeight: 800, color: item.color }}>{item.score}</td>
                        <td style={{ padding: "10px 8px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${item.color}`, color: item.color, fontSize: "10px", fontWeight: 700 }}>
                            {item.badge}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ================= TAB: REPORTS & EXPORT ================= */}
          {activeTab === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>📑 Intelligence Reports & Data Export Center</h2>
                  <p style={{ color: TOKENS.muted, margin: "4px 0 0 0", fontSize: "12px" }}>
                    Export formatted analytical reports as CSV or print/save as Executive PDF dossier.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", backgroundColor: "rgba(232,163,61,0.15)", border: `1px solid ${TOKENS.accent}`, color: TOKENS.accent, borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                >
                  📄 Export / Print as PDF
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <Card title="📊 Full Analytics Report" subtitle="KPIs, Zone Scores & Product Rankings">
                  <p style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "16px" }}>
                    Export high-level store performance for <strong>{selectedStore}</strong>.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      onClick={handleExportReport}
                      style={{ padding: "10px 14px", backgroundColor: TOKENS.accent, color: "#1A1200", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", width: "100%" }}
                    >
                      ⬇ Export Analytics CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{ padding: "8px 14px", backgroundColor: "transparent", border: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.text, borderRadius: "8px", fontWeight: "600", fontSize: "11px", cursor: "pointer", width: "100%" }}
                    >
                      📄 Save as PDF
                    </button>
                  </div>
                </Card>

                <Card title="🔻 Purchase Funnel Report" subtitle="Drop-off data across all 5 stages">
                  <p style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "16px" }}>
                    Detailed conversion drop-off counts from Entrance to Checkout.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      onClick={() => {
                        const csvContent = "Stage,Visitors,Percentage,DropOff\nPassersby,1480,100%,0\nGaze Fixation,903,61.0%,-577\nTouch & Handling,343,23.2%,-560\nCart Addition,178,12.0%,-165\nCheckout Sale,162,10.9%,-16";
                        const blob = new Blob([csvContent], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `funnel_conversion_${Date.now()}.csv`;
                        a.click();
                        setToast("Funnel report downloaded");
                      }}
                      style={{ padding: "10px 14px", backgroundColor: TOKENS.info, color: "#FFF", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", width: "100%" }}
                    >
                      ⬇ Export Funnel CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{ padding: "8px 14px", backgroundColor: "transparent", border: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.text, borderRadius: "8px", fontWeight: "600", fontSize: "11px", cursor: "pointer", width: "100%" }}
                    >
                      📄 Save as PDF
                    </button>
                  </div>
                </Card>

                <Card title="🧬 Shopper Persona Report" subtitle="Clustered behavioral archetypes">
                  <p style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "16px" }}>
                    Dwell time and conversion metrics grouped by behavioral segment.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      onClick={() => {
                        const csvContent = "Persona,SharePct,AvgDwell,Conversion,EstimatedShoppers\nExplorers,26%,9.4m,28%,385\nQuick Buyers,31%,2.8m,82%,459\nComparison Shoppers,21%,13.2m,74%,311\nImpulse Buyers,14%,5.6m,64%,207\nBrand Loyal Customers,8%,4.1m,91%,118";
                        const blob = new Blob([csvContent], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `shopper_personas_${Date.now()}.csv`;
                        a.click();
                        setToast("Persona report downloaded");
                      }}
                      style={{ padding: "10px 14px", backgroundColor: TOKENS.success, color: "#1A1200", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", width: "100%" }}
                    >
                      ⬇ Export Persona CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{ padding: "8px 14px", backgroundColor: "transparent", border: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.text, borderRadius: "8px", fontWeight: "600", fontSize: "11px", cursor: "pointer", width: "100%" }}
                    >
                      📄 Save as PDF
                    </button>
                  </div>
                </Card>
              </div>
            </div>
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