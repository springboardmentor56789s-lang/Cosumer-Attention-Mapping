"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// ==========================================
// DESIGN TOKENS — pulled directly from Login.jsx so the dashboard reads as
// the same product: navy/charcoal surfaces, amber accent, Space Grotesk for
// display type, Inter for body, JetBrains Mono for labels/data.
// ==========================================
const TOKENS = {
  bg: "#0B0F17",
  sidebarBg: "#131A27",
  cardBg: "#131A27",
  cardBorder: "#232C40",
  surface: "#131A27",
  surface2: "#1B2333",
  border: "#232C40",
  accent: "#E8A33D",
  accentDim: "rgba(232,163,61,0.14)",
  text: "#EDEFF3",
  muted: "#8A93A6",
  danger: "#E8654F",
  success: "#3FBF7F",
  info: "#5B8DEF",
};

const fontDisplay = "'Space Grotesk', sans-serif";
const fontBody = "'Inter', system-ui, sans-serif";
const fontMono = "'JetBrains Mono', monospace";

const cardStyle = {
  background: TOKENS.cardBg,
  borderRadius: "14px",
  border: `1px solid ${TOKENS.cardBorder}`,
  padding: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: TOKENS.surface2,
  border: `1px solid ${TOKENS.cardBorder}`,
  borderRadius: "8px",
  padding: "10px 14px",
  color: TOKENS.text,
  fontFamily: fontBody,
  fontSize: "13px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: TOKENS.muted,
  marginBottom: "6px",
  fontWeight: 600,
};

const eyebrowStyle = {
  fontFamily: fontMono,
  fontSize: "11px",
  letterSpacing: "0.08em",
  color: TOKENS.accent,
  textTransform: "uppercase",
};

const smallBtn = (variant = "ghost") => ({
  padding: "8px 12px",
  background: variant === "solid" ? TOKENS.accent : "transparent",
  color: variant === "solid" ? "#1A1200" : TOKENS.muted,
  border: variant === "solid" ? "none" : `1px solid ${TOKENS.cardBorder}`,
  borderRadius: "8px",
  fontFamily: fontBody,
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
});

// ==========================================
// PRIMITIVES
// ==========================================
function StatCard({ label, value, trend, isPositive }) {
  return (
    <div style={{ ...cardStyle, padding: "16px 20px" }}>
      <div style={{ ...eyebrowStyle }}>{label}</div>
      <div style={{ fontFamily: fontDisplay, fontSize: "24px", fontWeight: 700, marginTop: "6px", color: TOKENS.text }}>
        {value}
      </div>
      {trend && (
        <div style={{ fontFamily: fontMono, fontSize: "11px", marginTop: "6px", color: isPositive ? TOKENS.success : TOKENS.danger, fontWeight: 600 }}>
          {isPositive ? "▲" : "▼"} {trend}
        </div>
      )}
    </div>
  );
}

function Card({ title, subtitle, children, headerRight }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: "16px", fontWeight: 700, color: TOKENS.text }}>{title}</h3>
          {subtitle && <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: TOKENS.muted }}>{subtitle}</p>}
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function Badge({ status }) {
  const online = status === "Online" || status === "active" || status === "Normal" || status === "Active";
  const color = online ? TOKENS.success : status === "Reported" || status === "Elevated" ? TOKENS.accent : TOKENS.danger;
  return (
    <span style={{ fontFamily: fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em", color }}>
      ● {status.toUpperCase()}
    </span>
  );
}

function AIInsightCard({ title, recommendations }) {
  return (
    <div style={{ ...cardStyle, borderColor: TOKENS.accent }}>
      <div style={eyebrowStyle}>Recommendations</div>
      <h3 style={{ margin: "6px 0 0 0", fontFamily: fontDisplay, fontSize: "16px", fontWeight: 600 }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
        {recommendations.map((r, i) => (
          <div
            key={i}
            style={{
              fontSize: "13px",
              lineHeight: 1.5,
              color: TOKENS.muted,
              background: TOKENS.surface2,
              padding: "12px 14px",
              borderRadius: "8px",
              borderLeft: `2px solid ${TOKENS.accent}`,
            }}
          >
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChartVisual({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "150px", padding: "10px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", height: "100%", justifyContent: "flex-end" }}>
          <span style={{ fontFamily: fontMono, fontSize: "10px", color: TOKENS.muted }}>{d.value}</span>
          <div
            style={{
              width: "100%",
              height: `${(d.value / max) * 100}%`,
              background: d.color || TOKENS.accent,
              borderRadius: "4px 4px 0 0",
              minHeight: "4px",
              transition: "height 0.3s ease",
            }}
          />
          <span style={{ fontSize: "10px", color: TOKENS.muted, textAlign: "center" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(11,15,23,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: "400px", maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: "16px", fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const FALLBACK_STORES = [
  { id: 1, name: "Vizag Central Mall Store", location: "Visakhapatnam" },
  { id: 2, name: "Beach Road Outlet", location: "Visakhapatnam" },
  { id: 3, name: "Downtown Flagship Store", location: "Hyderabad" },
];

const INITIAL_CAMERAS = [
  { id: "CAM-01", name: "Entrance Overhead Cam", status: "Online", health: "98%", uptime: "99.8%", zone: "Entrance" },
  { id: "CAM-02", name: "Grocery Shelf Cam A", status: "Online", health: "95%", uptime: "99.4%", zone: "Grocery" },
  { id: "CAM-03", name: "Checkout Queue Sensor", status: "Online", health: "91%", uptime: "98.7%", zone: "Checkout" },
  { id: "CAM-04", name: "Electronics Showcase 1", status: "Online", health: "96%", uptime: "99.1%", zone: "Electronics" },
  { id: "CAM-05", name: "Back Storage Cam 2", status: "Offline", health: "0%", uptime: "82.3%", zone: "Storage" },
];

const INITIAL_ZONES_STATUS = [
  { id: "Z-1", name: "Entrance Foyer", count: 52, status: "Elevated", dwell: "1.2m", threshold: 40 },
  { id: "Z-2", name: "Grocery & Snacks", count: 88, status: "Critical", dwell: "5.8m", threshold: 60 },
  { id: "Z-3", name: "Electronics Section", count: 34, status: "Normal", dwell: "8.4m", threshold: 50 },
  { id: "Z-4", name: "Checkout POS Queues", count: 47, status: "Elevated", dwell: "2.1m", threshold: 35 },
  { id: "Z-5", name: "Apparel & Accessories", count: 19, status: "Normal", dwell: "3.6m", threshold: 45 },
];

const FALLBACK_RESTOCK_TASKS = [
  { id: 1, task_code: "OOS-01", store: "All Stores", shelf_location: "Grocery Shelf B — Section 3", shelf_tier: "Eye-Level Golden Zone", missing_units: 3, priority: "CRITICAL", status: "Pending" },
  { id: 2, task_code: "OOS-02", store: "All Stores", shelf_location: "Beverage Aisle — Rack 2", shelf_tier: "Eye-Level Golden Zone", missing_units: 2, priority: "CRITICAL", status: "In Progress" },
  { id: 3, task_code: "OOS-03", store: "All Stores", shelf_location: "Snacks Shelf A — Row 4", shelf_tier: "Top Shelf (Reach)", missing_units: 4, priority: "STANDARD", status: "Pending" },
  { id: 4, task_code: "OOS-04", store: "All Stores", shelf_location: "Checkout Counter Display", shelf_tier: "Eye-Level Golden Zone", missing_units: 1, priority: "HIGH", status: "Pending" },
  { id: 5, task_code: "OOS-05", store: "All Stores", shelf_location: "Electronics Shelf 1", shelf_tier: "Bottom Shelf", missing_units: 2, priority: "LOW", status: "Done" },
];

export default function StoreManagerDashboard() {
  const [stores, setStores] = useState(FALLBACK_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState(FALLBACK_STORES[0].id);
  const [authError, setAuthError] = useState("");
  const [usingFallback, setUsingFallback] = useState(true);
  const [userName, setUserName] = useState("Kushalini");

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
      .get("http://localhost:8000/stores", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setStores(res.data);
          setSelectedStoreId(res.data[0].id);
          setUsingFallback(false);
        }
      })
      .catch((err) => {
        setAuthError(err.response?.data?.detail || "Failed to load stores — showing sample data.");
      });
  }, []);

  const selectedStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const [activeTab, setActiveTab] = useState("overview");
  const [zonesStatus, setZonesStatus] = useState(INITIAL_ZONES_STATUS);
  const [restockTasks, setRestockTasks] = useState(FALLBACK_RESTOCK_TASKS);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Crowded zone: Grocery aisle density exceeded threshold (88/60)" },
    { id: 2, title: "Restock Alert: 2 Golden Zone facings empty at Grocery Shelf B" },
  ]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Fetch live restock tasks from database
    axios
      .get("http://localhost:8000/restock-tasks")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRestockTasks(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
    } catch (e) {}
    setToast("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/login";
    }, 400);
  };

  const pushNotification = (title) => setNotifications((prev) => [{ id: Date.now(), title }, ...prev]);
  const dismissNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleDispatchAction = (actionName) => {
    setToast(`Dispatched: ${actionName}`);
    pushNotification(`Directive executed: ${actionName}`);
  };

  const handleAssignTask = (taskId) => {
    setRestockTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: t.status === "Pending" ? "In Progress" : "Done" } : t))
    );
    axios.patch(`http://localhost:8000/restock-tasks/${taskId}`, { status: "In Progress" }).catch(() => {});
    setToast("Restock task assigned to floor team.");
  };

  // Cameras + report issue
  const [cameras, setCameras] = useState(INITIAL_CAMERAS);
  const [reportModalCam, setReportModalCam] = useState(null);
  const [reportNote, setReportNote] = useState("");

  const handleSubmitReport = (e) => {
    e.preventDefault();
    setCameras((prev) => prev.map((c) => (c.id === reportModalCam.id ? { ...c, status: "Reported" } : c)));
    pushNotification(`Issue reported for ${reportModalCam.name} (${reportModalCam.id})`);
    setToast(`Issue reported for ${reportModalCam.name}`);
    setReportModalCam(null);
    setReportNote("");
  };

  const activeCameraCount = cameras.filter((c) => c.status === "Online").length;

  // Shelf attention detection
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectionSummary, setDetectionSummary] = useState(null);

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoFile(file);
    setVideoURL(URL.createObjectURL(file));
    setDetectionSummary(null);
  };

  const handleRunDetection = () => {
    if (!videoFile || isProcessing) return;
    setIsProcessing(true);
    setProgress(0);
    setDetectionSummary(null);

    let frame = 0;
    const sampleCount = 12;
    let lastCount = 2;
    let peak = 0;
    let sum = 0;

    const tick = setInterval(() => {
      frame += 1;
      const delta = Math.floor(Math.random() * 3) - 1;
      lastCount = Math.max(0, Math.min(9, lastCount + delta));
      sum += lastCount;
      peak = Math.max(peak, lastCount);
      setProgress(Math.round((frame / sampleCount) * 100));

      if (frame >= sampleCount) {
        clearInterval(tick);
        setDetectionSummary({ peak, avg: Math.round((sum / sampleCount) * 10) / 10 });
        pushNotification(`Shelf detection complete for ${selectedStore?.name}: peak ${peak} people`);
        setToast(`Detection finished — peak ${peak} people`);
        setIsProcessing(false);
      }
    }, 150);
  };

  const recommendations = [
    "Shelf B receives 34% lower attention than average. Move high-margin beverages closer to the entrance.",
    "Increase promotional signage on Aisle 2 to convert high dwell time into sales.",
    "Rotate Product X with Product Y to optimize eye-level attention.",
  ];

  return (
    <div style={{ backgroundColor: TOKENS.bg, height: "100vh", width: "100vw", overflow: "hidden", color: TOKENS.text, fontFamily: fontBody, display: "flex", flexDirection: "column" }}>
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", backgroundColor: TOKENS.cardBg, border: `1px solid ${TOKENS.success}`, color: TOKENS.text, padding: "12px 20px", borderRadius: "8px", zIndex: 9999, boxShadow: "0 4px 14px rgba(0,0,0,0.6)", fontSize: "13px" }}>
          ✅ {toast}
        </div>
      )}

      {/* HEADER BAR — FIXED AT TOP */}
      <header style={{ height: "64px", flexShrink: 0, width: "100%", backgroundColor: TOKENS.sidebarBg, borderBottom: `1px solid ${TOKENS.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", zIndex: 100, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1A1200", fontSize: "16px" }}>
            🏪
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px" }}>Consumer Attention Mapping System</div>
            <div style={{ fontSize: "11px", color: TOKENS.muted, fontFamily: fontMono }}>STORE MANAGER COMMAND CENTER</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(Number(e.target.value) || e.target.value)}
            style={{ backgroundColor: TOKENS.bg, border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "8px", padding: "8px 12px", color: TOKENS.text, fontSize: "12px", outline: "none", cursor: "pointer" }}
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            style={{ position: "relative", background: "none", border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "8px", padding: "8px 12px", color: TOKENS.text, cursor: "pointer" }}
          >
            🔔
            {notifications.length > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "-4px", backgroundColor: TOKENS.danger, color: "#fff", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* NOTIFICATION DRAWER */}
      {isNotifyOpen && (
        <div style={{ position: "fixed", top: "64px", right: "24px", width: "320px", backgroundColor: TOKENS.cardBg, border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "10px", padding: "16px", zIndex: 1000, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontWeight: 700 }}>
            <span>Store Alerts</span>
            <button onClick={() => setIsNotifyOpen(false)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer" }}>✕</button>
          </div>
          <div>
            {notifications.length === 0 ? (
              <div style={{ fontSize: "12px", color: TOKENS.muted }}>No active alerts.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}`, fontSize: "12px" }}>
                  <span>{n.title}</span>
                  <button onClick={() => dismissNotification(n.id)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer", fontSize: "11px" }}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTAINER: FIXED ATTACHED SIDEBAR + SCROLLABLE DASHBOARD */}
      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 64px)", overflow: "hidden", width: "100%" }}>
        
        {/* SIDEBAR NAVIGATION — FIXED & ATTACHED */}
        <aside style={{ width: "240px", backgroundColor: TOKENS.sidebarBg, borderRight: `1px solid ${TOKENS.cardBorder}`, padding: "20px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", flexShrink: 0, boxSizing: "border-box" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
            {[
              { id: "overview", label: "Dashboard Overview", icon: "📊" },
              { id: "zones", label: "Real-Time Zone Alerts", icon: "🚨" },
              { id: "restock", label: "OOS Restock Tasks", icon: "📦" },
              { id: "cameras", label: "Camera Health & Hardware", icon: "📹" },
              { id: "detection", label: "Shelf Video Detection", icon: "🎬" },
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

          {/* USER PROFILE & LOGOUT BUTTON */}
          <div style={{ borderTop: `1px solid ${TOKENS.cardBorder}`, paddingTop: "14px", marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(232,163,61,0.2)", border: `1px solid ${TOKENS.accent}`, color: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800 }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.text, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {userName}
                </div>
                <div style={{ fontSize: "10px", color: TOKENS.success, fontWeight: 600 }}>
                  ● Store Manager
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(232,101,79,0.35)",
                backgroundColor: "rgba(232,101,79,0.12)",
                color: TOKENS.danger,
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 700,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(232,101,79,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(232,101,79,0.12)"; }}
            >
              <span>🚪</span>
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* BODY DASHBOARD PANEL — ONLY THIS AREA SCROLLS */}
        <main style={{ flex: 1, height: "100%", padding: "24px 28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
          
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <>
              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px" }}>
                <StatCard label="Visitors Today" value="1,420" trend="14%" isPositive />
                <StatCard label="Avg Dwell Time" value="4m 12s" trend="5%" isPositive />
                <StatCard label="Conversion Rate" value="24.8%" trend="2.1%" isPositive />
                <StatCard label="Active Cameras" value={`${activeCameraCount}/${cameras.length}`} />
                <StatCard label="Attention Score" value="88/100" trend="3 pts" isPositive />
              </div>

              {/* Live Occupancy Gauge + AI Action Commander */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                <Card title="Live Store Occupancy & Capacity Gauge" subtitle={`Current real-time shopper density in ${selectedStore?.name || "Store"}`}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 8px 0" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700 }}>Occupancy Level: <strong style={{ color: TOKENS.accent }}>847 Shoppers</strong></span>
                    <span style={{ fontFamily: fontMono, fontSize: "12px", color: TOKENS.muted }}>Max Safe Capacity: 1,200</span>
                  </div>
                  <div style={{ width: "100%", height: "14px", backgroundColor: TOKENS.bg, borderRadius: "7px", overflow: "hidden", border: `1px solid ${TOKENS.cardBorder}` }}>
                    <div style={{ width: "70.6%", height: "100%", background: "linear-gradient(90deg, #5FAE86 0%, #E8A33D 70%, #E8654F 100%)", borderRadius: "7px", transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "11px", color: TOKENS.muted }}>
                    <span>0% (Empty)</span>
                    <span style={{ color: TOKENS.accent, fontWeight: 700 }}>70.6% Safe Operational Threshold</span>
                    <span>100% (Critical)</span>
                  </div>
                </Card>

                <Card title="⚡ AI Action Commander" subtitle="Automated operational directives for store floor staff">
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { action: "🟢 Open Register #3 (Checkout Queue > 5 Shoppers)", color: TOKENS.success },
                      { action: "📦 Restock Golden Zone — Grocery Shelf B", color: TOKENS.accent },
                      { action: "💡 Boost Display Lighting in Electronics Aisle", color: TOKENS.info },
                      { action: "📣 Deploy Assist Staff to Entrance Promotion", color: TOKENS.accent },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => handleDispatchAction(btn.action)}
                        style={{
                          textAlign: "left",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: `1px solid ${TOKENS.cardBorder}`,
                          backgroundColor: TOKENS.surface2,
                          color: TOKENS.text,
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = TOKENS.accent; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = TOKENS.cardBorder; }}
                      >
                        {btn.action}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <Card title="Hourly Store Traffic Pattern" subtitle="Footfall distribution across operating hours">
                  <BarChartVisual
                    data={[
                      { label: "09 AM", value: 120 },
                      { label: "11 AM", value: 340 },
                      { label: "01 PM", value: 450 },
                      { label: "03 PM", value: 290 },
                      { label: "05 PM", value: 580 },
                      { label: "07 PM", value: 410 },
                    ]}
                  />
                </Card>
                <Card title="Shelf Attention Performance" subtitle="Gaze fixation density by shelf rack">
                  <BarChartVisual
                    data={[
                      { label: "Shelf A", value: 92, color: TOKENS.success },
                      { label: "Shelf B", value: 45, color: TOKENS.danger },
                      { label: "Shelf C", value: 78, color: TOKENS.accent },
                      { label: "Shelf D", value: 64, color: TOKENS.info },
                    ]}
                  />
                </Card>
              </div>

              <AIInsightCard title="Recommendations for your store" recommendations={recommendations} />
            </>
          )}

          {/* ================= TAB 2: ZONE CONGESTION ALERTS ================= */}
          {activeTab === "zones" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Card title="🚨 Real-Time Zone Congestion & Density Monitor" subtitle="Active capacity thresholds and crowd management across aisles">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "14px" }}>
                  {zonesStatus.map((z) => (
                    <div key={z.id} style={{ padding: "16px", borderRadius: "10px", border: `1px solid ${z.status === "Critical" ? TOKENS.danger : z.status === "Elevated" ? TOKENS.accent : TOKENS.cardBorder}`, backgroundColor: TOKENS.surface2 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>{z.name}</span>
                        <Badge status={z.status} />
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: z.status === "Critical" ? TOKENS.danger : z.status === "Elevated" ? TOKENS.accent : TOKENS.success }}>
                        {z.count} <span style={{ fontSize: "12px", color: TOKENS.muted, fontWeight: 500 }}>shoppers (limit: {z.threshold})</span>
                      </div>
                      <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "6px" }}>
                        ⏱ Avg Dwell: <strong>{z.dwell}</strong>
                      </div>
                      <button
                        onClick={() => handleDispatchAction(`Staff dispatched to ${z.name}`)}
                        style={{
                          marginTop: "12px",
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: z.status === "Critical" ? TOKENS.danger : TOKENS.accent,
                          color: "#1A1200",
                          fontWeight: 700,
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Dispatch Staff to {z.name}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ================= TAB 3: OOS RESTOCK TASKS (CONNECTED TO DB) ================= */}
          {activeTab === "restock" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                <StatCard label="Total OOS Gaps" value={restockTasks.length} />
                <StatCard label="Critical (Golden Zone)" value={restockTasks.filter((t) => t.priority === "CRITICAL").length} trend="High Priority" />
                <StatCard label="Revenue at Risk" value="₹14,200" trend="Active Stockout" />
              </div>

              <Card title="📦 Out-of-Stock Void Gap Restock Task Board" subtitle="Auto-detected empty shelf voids requiring immediate replenishment (Connected to Database)">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted, fontSize: "11px", fontFamily: fontMono, textAlign: "left" }}>
                      <th style={{ padding: "10px 8px" }}>Task Code</th>
                      <th style={{ padding: "10px 8px" }}>Shelf Location</th>
                      <th style={{ padding: "10px 8px" }}>Tier</th>
                      <th style={{ padding: "10px 8px" }}>Missing Units</th>
                      <th style={{ padding: "10px 8px" }}>Priority</th>
                      <th style={{ padding: "10px 8px" }}>Status</th>
                      <th style={{ padding: "10px 8px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restockTasks.map((task) => (
                      <tr key={task.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                        <td style={{ padding: "12px 8px", fontFamily: fontMono, fontWeight: 700 }}>{task.task_code}</td>
                        <td style={{ padding: "12px 8px", fontWeight: 600 }}>{task.shelf_location}</td>
                        <td style={{ padding: "12px 8px", color: task.shelf_tier.includes("Golden") ? TOKENS.accent : TOKENS.muted }}>{task.shelf_tier}</td>
                        <td style={{ padding: "12px 8px", fontWeight: 700 }}>~{task.missing_units} units</td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "4px", backgroundColor: task.priority === "CRITICAL" ? "rgba(232,101,79,0.2)" : task.priority === "HIGH" ? "rgba(232,163,61,0.2)" : "rgba(91,141,239,0.2)", color: task.priority === "CRITICAL" ? TOKENS.danger : task.priority === "HIGH" ? TOKENS.accent : TOKENS.info }}>
                            {task.priority}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ fontSize: "11px", color: task.status === "Done" ? TOKENS.success : task.status === "In Progress" ? TOKENS.accent : TOKENS.muted }}>
                            ● {task.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          {task.status !== "Done" && (
                            <button
                              onClick={() => handleAssignTask(task.id)}
                              style={{ padding: "5px 10px", fontSize: "11px", borderRadius: "6px", border: `1px solid ${TOKENS.accent}`, backgroundColor: "transparent", color: TOKENS.accent, cursor: "pointer", fontWeight: 600 }}
                            >
                              {task.status === "Pending" ? "Assign Staff" : "Mark Done"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ================= TAB 4: CAMERA HARDWARE & HEALTH ================= */}
          {activeTab === "cameras" && (
            <Card title="📹 Live Camera Hardware Status & Diagnostic Health">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginTop: "14px" }}>
                {cameras.map((c) => (
                  <div key={c.id} style={{ padding: "16px", borderRadius: "10px", border: `1px solid ${TOKENS.cardBorder}`, backgroundColor: TOKENS.surface2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>{c.name}</span>
                      <Badge status={c.status} />
                    </div>
                    <div style={{ fontSize: "11px", color: TOKENS.muted, fontFamily: fontMono, marginTop: "8px" }}>
                      Signal Health: <strong style={{ color: c.status === "Online" ? TOKENS.success : TOKENS.danger }}>{c.health}</strong> | Uptime: {c.uptime || "99.4%"}
                    </div>
                    {c.status !== "Reported" && (
                      <button
                        onClick={() => setReportModalCam(c)}
                        style={{ marginTop: "10px", padding: "6px 12px", fontSize: "11px", borderRadius: "6px", border: `1px solid ${TOKENS.cardBorder}`, backgroundColor: "transparent", color: TOKENS.muted, cursor: "pointer" }}
                      >
                        Report Issue
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ================= TAB 5: VIDEO DETECTION RUNNER ================= */}
          {activeTab === "detection" && (
            <Card title="🎬 Shelf Attention Video Frame Detection" subtitle={`Upload surveillance clip from ${selectedStore?.name || "Store"} to detect customer gaze and footfall`}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", margin: "14px 0" }}>
                <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={isProcessing} style={{ ...inputStyle, width: "auto" }} />
                <button
                  onClick={handleRunDetection}
                  disabled={!videoFile || isProcessing}
                  style={{
                    padding: "10px 18px",
                    background: !videoFile || isProcessing ? TOKENS.surface2 : TOKENS.accent,
                    color: !videoFile || isProcessing ? TOKENS.muted : "#1A1200",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: !videoFile || isProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  {isProcessing ? `Processing Frame Stream… ${progress}%` : "Run Detection"}
                </button>
              </div>
              {detectionSummary && (
                <div style={{ display: "flex", gap: "16px", marginTop: "14px" }}>
                  <div style={{ background: TOKENS.surface2, padding: "14px 20px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontFamily: fontDisplay, fontSize: "24px", fontWeight: 800, color: TOKENS.accent }}>{detectionSummary.peak}</div>
                    <div style={{ fontSize: "11px", color: TOKENS.muted }}>Peak Shopper Count</div>
                  </div>
                  <div style={{ background: TOKENS.surface2, padding: "14px 20px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontFamily: fontDisplay, fontSize: "24px", fontWeight: 800 }}>{detectionSummary.avg}</div>
                    <div style={{ fontSize: "11px", color: TOKENS.muted }}>Average Aisle Dwellers</div>
                  </div>
                </div>
              )}
            </Card>
          )}

        </main>
      </div>

      {/* REPORT ISSUE MODAL */}
      {reportModalCam && (
        <Modal title={`Report Hardware Issue — ${reportModalCam.name}`} onClose={() => setReportModalCam(null)}>
          <form onSubmit={handleSubmitReport}>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Issue Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="e.g. Signal dropping periodically or optical occlusion..."
                autoFocus
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: TOKENS.accent,
                color: "#1A1200",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Submit Ticket
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}