"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import LiveCameraStream from "../../components/LiveCameraStream";
import LiveFloorplanRadar from "../../components/LiveFloorplanRadar";
import ShelfGazeHeatmap from "../../components/ShelfGazeHeatmap";

// ==========================================
// DESIGN TOKENS & STYLES
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
  warning: "#E8A33D",
  danger: "#E8654F",
  info: "#5B8DEF",
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
  padding: "6px 12px",
  fontSize: "11px",
  fontWeight: "600",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  color: "#fff",
  backgroundColor: bg,
  ...extra,
});

// ==========================================
// INITIAL MOCK DATA
// ==========================================
const INITIAL_STORES = [
  { id: 1, name: "Downtown Flagship", location: "Central Avenue, Hyderabad", camerasCount: 9 },
  { id: 2, name: "Metro Shopping Mall", location: "Jubilee Hills, Hyderabad", camerasCount: 6 },
  { id: 3, name: "Westside Plaza", location: "Banjara Hills, Hyderabad", camerasCount: 4 },
  { id: 4, name: "Airport Duty Free", location: "RGIA Airport Terminal 1", camerasCount: 3 },
];

const INITIAL_CAMERAS = [
  { id: "CAM-01", name: "Entrance Overhead PTZ", store: "Downtown Flagship", zone: "Entrance", resolution: "4K (3840x2160)", fps: 30, ip: "192.168.1.101", status: "Online" },
  { id: "CAM-02", name: "Aisle 1 Beverage Wall", store: "Downtown Flagship", zone: "Grocery & Snacks", resolution: "4K (3840x2160)", fps: 30, ip: "192.168.1.102", status: "Online" },
  { id: "CAM-03", name: "Aisle 2 Snacks Endcap", store: "Downtown Flagship", zone: "Grocery & Snacks", resolution: "1080p (1920x1080)", fps: 25, ip: "192.168.1.103", status: "Degraded" },
  { id: "CAM-04", name: "Electronics Display A", store: "Downtown Flagship", zone: "Electronics", resolution: "4K (3840x2160)", fps: 30, ip: "192.168.1.104", status: "Online" },
  { id: "CAM-05", name: "Checkout 1-4 Overheads", store: "Downtown Flagship", zone: "Checkout", resolution: "4K (3840x2160)", fps: 30, ip: "192.168.1.108", status: "Online" },
  { id: "CAM-06", name: "Main East Gate", store: "Metro Shopping Mall", zone: "Entrance", resolution: "4K (3840x2160)", fps: 30, ip: "192.168.2.101", status: "Online" },
];

const INITIAL_USERS = [
  { id: "USR-001", name: "Sarah Jenkins", email: "sarah.j@retailai.corp", role: "Store Manager", store: "Downtown Flagship", status: "Active" },
  { id: "USR-002", name: "Raj Patel", email: "raj.p@retailai.corp", role: "Retail Analyst", store: "All Stores", status: "Active" },
  { id: "USR-003", name: "Elena Rostova", email: "elena.r@retailai.corp", role: "Marketing Manager", store: "All Stores", status: "Active" },
  { id: "USR-004", name: "Marcus Chen", email: "marcus.c@retailai.corp", role: "Administrator", store: "System-Wide", status: "Active" },
];

const SAMPLE_JOURNEYS = [
  {
    id: "SHOPPER-4821",
    store: "Downtown Flagship",
    entryTime: "10:14 AM",
    exitTime: "10:27 AM",
    totalDwellSec: 780,
    path: ["Entrance", "Grocery & Snacks", "Electronics", "Checkout", "Exit"],
    zoneDwell: [
      { zone: "Entrance", sec: 45 },
      { zone: "Grocery & Snacks", sec: 240 },
      { zone: "Electronics", sec: 320 },
      { zone: "Checkout", sec: 145 },
      { zone: "Exit", sec: 30 },
    ],
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStore, setSelectedStore] = useState("All Stores");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // NOTIFICATIONS
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Camera CAM-03 (Snacks) Degraded FPS", time: "10m ago" },
    { id: 2, title: "High Congestion in Entrance Zone", time: "25m ago" },
  ]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  // CRUD DATA STATES
  const [stores, setStores] = useState(INITIAL_STORES);
  const [cameras, setCameras] = useState(INITIAL_CAMERAS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [completedJourneys, setCompletedJourneys] = useState(SAMPLE_JOURNEYS);
  const [selectedJourney, setSelectedJourney] = useState(SAMPLE_JOURNEYS[0]);

  // MODAL STATES FOR CRUD
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [storeForm, setStoreForm] = useState({ name: "", location: "" });

  const [isCamModalOpen, setIsCamModalOpen] = useState(false);
  const [editingCam, setEditingCam] = useState(null);
  const [camForm, setCamForm] = useState({ id: "", name: "", store: "Downtown Flagship", zone: "Entrance", resolution: "4K (3840x2160)", ip: "", status: "Online" });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Store Manager", store: "Downtown Flagship", status: "Active" });

  // ==========================================
  // STORE CRUD HANDLERS
  // ==========================================
  const handleOpenStoreModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setStoreForm({ name: store.name, location: store.location });
    } else {
      setEditingStore(null);
      setStoreForm({ name: "", location: "" });
    }
    setIsStoreModalOpen(true);
  };

  const handleSaveStore = (e) => {
    e.preventDefault();
    if (!storeForm.name.trim()) return;

    if (editingStore) {
      setStores(prev => prev.map(s => s.id === editingStore.id ? { ...s, name: storeForm.name, location: storeForm.location } : s));
      showToast(`Store "${storeForm.name}" updated successfully!`);
    } else {
      const newStore = { id: Date.now(), name: storeForm.name, location: storeForm.location || "Hyderabad", camerasCount: 0 };
      setStores(prev => [...prev, newStore]);
      showToast(`New store "${storeForm.name}" created!`);
    }
    setIsStoreModalOpen(false);
  };

  const handleDeleteStore = (storeId, storeName) => {
    if (confirm(`Are you sure you want to delete store "${storeName}"?`)) {
      setStores(prev => prev.filter(s => s.id !== storeId));
      showToast(`Store "${storeName}" removed.`);
    }
  };

  // ==========================================
  // CAMERA CRUD HANDLERS
  // ==========================================
  const handleOpenCamModal = (cam = null) => {
    if (cam) {
      setEditingCam(cam);
      setCamForm({ ...cam });
    } else {
      setEditingCam(null);
      setCamForm({ id: `CAM-${Math.floor(10 + Math.random() * 90)}`, name: "", store: stores[0]?.name || "Downtown Flagship", zone: "Entrance", resolution: "4K (3840x2160)", ip: "192.168.1.100", status: "Online" });
    }
    setIsCamModalOpen(true);
  };

  const handleSaveCamera = (e) => {
    e.preventDefault();
    if (!camForm.name.trim()) return;

    if (editingCam) {
      setCameras(prev => prev.map(c => c.id === editingCam.id ? { ...camForm } : c));
      showToast(`Camera ${camForm.id} updated!`);
    } else {
      setCameras(prev => [...prev, { ...camForm, fps: 30 }]);
      showToast(`Camera ${camForm.id} added!`);
    }
    setIsCamModalOpen(false);
  };

  const handleDeleteCamera = (camId) => {
    if (confirm(`Delete camera ${camId}?`)) {
      setCameras(prev => prev.filter(c => c.id !== camId));
      showToast(`Camera ${camId} deleted.`);
    }
  };

  // ==========================================
  // USER CRUD HANDLERS
  // ==========================================
  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({ ...user });
    } else {
      setEditingUser(null);
      setUserForm({ name: "", email: "", role: "Store Manager", store: stores[0]?.name || "Downtown Flagship", status: "Active" });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) return;

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...userForm } : u));
      showToast(`User ${userForm.name} updated!`);
    } else {
      const newUser = { id: `USR-00${users.length + 1}`, ...userForm };
      setUsers(prev => [...prev, newUser]);
      showToast(`User ${userForm.name} created!`);
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (userId, userName) => {
    if (confirm(`Remove user ${userName}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`User ${userName} removed.`);
    }
  };

  return (
    <div style={{ backgroundColor: TOKENS.bg, minHeight: "100vh", color: TOKENS.text, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", backgroundColor: TOKENS.cardBg, border: `1px solid ${TOKENS.success}`, color: TOKENS.text, padding: "12px 20px", borderRadius: "8px", zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}

      {/* HEADER BAR */}
      <header style={{ height: "64px", backgroundColor: TOKENS.sidebarBg, borderBottom: `1px solid ${TOKENS.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1A1200" }}>
            AI
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "15px" }}>Consumer Attention Mapping System</div>
            <div style={{ fontSize: "11px", color: TOKENS.muted }}>ADMINISTRATOR CONTROL CONSOLE</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} style={selectStyle}>
            <option value="All Stores">All Stores</option>
            {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>

          <button
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            style={{ position: "relative", background: "none", border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "8px", padding: "8px 12px", color: TOKENS.text, cursor: "pointer" }}
          >
            🔔
            {notifications.length > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "-4px", backgroundColor: TOKENS.danger, color: "#fff", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* NOTIFICATION DRAWER */}
      {isNotifyOpen && (
        <div style={{ position: "fixed", top: "64px", right: "24px", width: "300px", backgroundColor: TOKENS.cardBg, border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "8px", padding: "16px", zIndex: 1000 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontWeight: "700" }}>
            <span>System Alerts</span>
            <button onClick={() => setIsNotifyOpen(false)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer" }}>✕</button>
          </div>
          <div>
            {notifications.map(n => (
              <div key={n.id} style={{ padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                <div style={{ fontSize: "12px", fontWeight: "600" }}>{n.title}</div>
                <div style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "2px" }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT LAYOUT ================= */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* SIDEBAR NAVIGATION */}
        <aside style={{ width: "240px", backgroundColor: TOKENS.sidebarBg, borderRight: `1px solid ${TOKENS.cardBorder}`, padding: "20px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { id: "overview", label: "Dashboard Overview", icon: "📊" },
              { id: "live-ai", label: "Live AI Video & Gaze HUD", icon: "🔴" },
              { id: "journeys", label: "Customer Journey Tracking", icon: "🛣️" },
              { id: "infrastructure", label: "Stores & Cameras (CRUD)", icon: "📹" },
              { id: "users", label: "User Management (CRUD)", icon: "👤" },
              { id: "system", label: "System & API Health", icon: "⚡" },
              { id: "security", label: "Security & Permissions", icon: "🛡️" },
            ].map(tab => (
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
                  transition: "all 0.2s"
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* BODY DASHBOARD PANEL */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* ================= VIEW 1: COMPREHENSIVE ENTERPRISE OVERVIEW ================= */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* TOP EXECUTIVE KPI RIBBON */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: "700" }}>Total Footfall Today</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "4px", color: TOKENS.text }}>1,480</div>
                  <div style={{ fontSize: "11px", color: TOKENS.success, marginTop: "4px", fontWeight: "600" }}>▲ +14.2% vs yesterday</div>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: "700" }}>Live In-Store Shoppers</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "4px", color: TOKENS.accent, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: TOKENS.success, display: "inline-block", boxShadow: "0 0 8px #5FAE86" }}></span>
                    18 Persons
                  </div>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "4px" }}>Across 4 active zones</div>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: "700" }}>Avg In-Store Dwell Time</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "4px", color: TOKENS.info }}>14.8 min</div>
                  <div style={{ fontSize: "11px", color: TOKENS.success, marginTop: "4px", fontWeight: "600" }}>▲ +1.2 min vs avg</div>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: "700" }}>Golden Zone Gaze Focus</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "4px", color: TOKENS.success }}>68.4%</div>
                  <div style={{ fontSize: "11px", color: TOKENS.success, marginTop: "4px", fontWeight: "600" }}>▲ +4.1% Eye-Level Share</div>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: "700" }}>AI Camera Uptime</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "4px", color: TOKENS.text }}>
                    {cameras.filter(c => c.status === "Online").length} / {cameras.length}
                  </div>
                  <div style={{ fontSize: "11px", color: TOKENS.success, marginTop: "4px", fontWeight: "600" }}>● 99.4% Network Health</div>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: "700" }}>Conversion Efficiency</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "4px", color: TOKENS.accent }}>72.6%</div>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "4px" }}>Gaze to engagement</div>
                </div>
              </div>

              {/* HOURLY FOOT-TRAFFIC & ATTENTION CHART */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>📊 Hourly Customer Traffic & Attention Intensity</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>Shopper traffic distribution and peak attention hours across today.</p>
                  </div>
                  <span style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(232,163,61,0.15)", color: TOKENS.accent, fontSize: "12px", fontWeight: 700 }}>
                    🔥 Peak Traffic Window: 01:00 PM – 02:30 PM (240 Shoppers/hr)
                  </span>
                </div>

                {/* Visual Bar Graph */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "160px", padding: "10px 0 24px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                  {[
                    { time: "09 AM", count: 42, gaze: "54%", height: "25%" },
                    { time: "10 AM", count: 85, gaze: "62%", height: "45%" },
                    { time: "11 AM", count: 140, gaze: "71%", height: "65%" },
                    { time: "12 PM", count: 195, gaze: "78%", height: "82%" },
                    { time: "01 PM", count: 240, gaze: "86%", height: "100%", peak: true },
                    { time: "02 PM", count: 215, gaze: "82%", height: "90%" },
                    { time: "03 PM", count: 160, gaze: "74%", height: "70%" },
                    { time: "04 PM", count: 130, gaze: "68%", height: "58%" },
                    { time: "05 PM", count: 180, gaze: "75%", height: "78%" },
                    { time: "06 PM", count: 210, gaze: "80%", height: "88%" },
                    { time: "07 PM", count: 175, gaze: "72%", height: "74%" },
                    { time: "08 PM", count: 95, gaze: "58%", height: "48%" },
                  ].map((item, idx) => (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "10px", color: item.peak ? TOKENS.accent : TOKENS.muted, fontWeight: item.peak ? 700 : 500 }}>
                        {item.count}
                      </span>
                      <div
                        style={{
                          width: "100%",
                          height: item.height,
                          backgroundColor: item.peak ? TOKENS.accent : "rgba(91,141,239,0.5)",
                          borderRadius: "4px 4px 0 0",
                          transition: "all 0.3s ease",
                        }}
                      />
                      <span style={{ fontSize: "10px", color: TOKENS.muted, whiteSpace: "nowrap" }}>{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE ZONE HEAT & CONGESTION STATUS (6 STORE ZONES) */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>📍 Real-Time Zone Occupancy & Gaze Health</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>Live in-store congestion and eye attention intensity by department.</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                  {[
                    { zone: "Entrance & Lobby", people: 4, avgDwell: "45s", gaze: "48%", status: "Optimal", color: TOKENS.success },
                    { zone: "Grocery & Snacks", people: 9, avgDwell: "4.5 min", gaze: "78%", status: "⚠️ High Traffic", color: TOKENS.warning },
                    { zone: "Electronics Hub", people: 7, avgDwell: "8.2 min", gaze: "86%", status: "🔥 High Attention", color: TOKENS.accent },
                    { zone: "Apparel & Fitting", people: 5, avgDwell: "6.0 min", gaze: "64%", status: "Steady", color: TOKENS.success },
                    { zone: "Checkout POS Queues", people: 3, avgDwell: "2.1 min", gaze: "32%", status: "2 POS Active", color: TOKENS.success },
                    { zone: "Exit & Loss Prev", people: 1, avgDwell: "25s", gaze: "18%", status: "Clear", color: TOKENS.success },
                  ].map((z, idx) => (
                    <div key={idx} style={{ background: TOKENS.bg, padding: "14px", borderRadius: "8px", border: `1px solid ${TOKENS.cardBorder}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: 700, fontSize: "13px" }}>{z.zone}</div>
                        <span style={{ fontSize: "11px", color: z.color, fontWeight: 700 }}>{z.status}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "11px", color: TOKENS.muted }}>
                        <span>Shoppers: <strong style={{ color: TOKENS.text }}>{z.people}</strong></span>
                        <span>Avg Dwell: <strong style={{ color: TOKENS.text }}>{z.avgDwell}</strong></span>
                        <span>Gaze: <strong style={{ color: TOKENS.accent }}>{z.gaze}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STORE LEADERBOARD & AI INSIGHTS */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                
                {/* BRANCH LEADERBOARD TABLE */}
                <div style={cardStyle}>
                  <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 700 }}>🏪 Store Branch Performance Leaderboard</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                        <th style={{ padding: "8px" }}>Store Branch</th>
                        <th style={{ padding: "8px" }}>Today Footfall</th>
                        <th style={{ padding: "8px" }}>Avg Dwell</th>
                        <th style={{ padding: "8px" }}>Golden Zone %</th>
                        <th style={{ padding: "8px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map(s => (
                        <tr key={s.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                          <td style={{ padding: "10px 8px", fontWeight: 700, color: TOKENS.text }}>{s.name}</td>
                          <td style={{ padding: "10px 8px" }}>480 visitors</td>
                          <td style={{ padding: "10px 8px" }}>15.2 min</td>
                          <td style={{ padding: "10px 8px", color: TOKENS.success, fontWeight: 700 }}>71.4%</td>
                          <td style={{ padding: "10px 8px", color: TOKENS.success }}>● Operational</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* AI MERCHANDISING INSIGHTS */}
                <div style={cardStyle}>
                  <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 700 }}>💡 AI Merchandising Recommendations</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ background: TOKENS.bg, padding: "12px", borderRadius: "8px", borderLeft: `3px solid ${TOKENS.success}` }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.success }}>Golden Zone Optimization</div>
                      <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "3px" }}>
                        Eye-level beverage shelves capture 74% of all aisle attention. Move high-margin promotional SKUs to Shelf 2 for immediate +18% basket lift.
                      </div>
                    </div>

                    <div style={{ background: TOKENS.bg, padding: "12px", borderRadius: "8px", borderLeft: `3px solid ${TOKENS.accent}` }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.accent }}>High Attention / Low Conversion Anomaly</div>
                      <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "3px" }}>
                        Electronics Showcase has 86% visual fixation duration but only 12% touch rate. Recommend testing a 15% promotional discount tag.
                      </div>
                    </div>

                    <div style={{ background: TOKENS.bg, padding: "12px", borderRadius: "8px", borderLeft: `3px solid ${TOKENS.info}` }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.info }}>Queue Wait-Time Prediction</div>
                      <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "3px" }}>
                        Peak traffic surge anticipated between 1:00 PM – 2:30 PM. Recommend pre-opening POS Counter 3 to maintain checkout wait times under 2 minutes.
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RECENT REAL-TIME ACTIVITY STREAM */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: 700 }}>⚡ Recent Live AI Telemetry & Events</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                    <span style={{ color: TOKENS.accent, fontWeight: 700 }}>[10:14 AM]</span> Shopper <strong style={{ color: TOKENS.text }}>SHOPPER-01</strong> completed entrance-to-exit journey (Total Dwell: 13.0 mins).
                  </div>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                    <span style={{ color: TOKENS.success, fontWeight: 700 }}>[10:11 AM]</span> 3D Gaze Raycasting registered <strong style={{ color: TOKENS.text }}>5.2s fixation</strong> on Eye-Level Golden Zone at Grocery Shelf B.
                  </div>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                    <span style={{ color: TOKENS.info, fontWeight: 700 }}>[10:04 AM]</span> Video frame analysis completed for <strong style={{ color: TOKENS.text }}>store_video.mp4</strong> — Excel report generated.
                  </div>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, padding: "8px 0" }}>
                    <span style={{ color: TOKENS.success, fontWeight: 700 }}>[09:55 AM]</span> Camera <strong style={{ color: TOKENS.text }}>CAM-01 (Entrance)</strong> calibrated and streaming at 30 FPS.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= VIEW: LIVE AI VIDEO & GAZE HUD ================= */}
          {activeTab === "live-ai" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <LiveCameraStream />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <LiveFloorplanRadar />
                <ShelfGazeHeatmap />
              </div>
            </div>
          )}

          {/* ================= VIEW 2: CUSTOMER JOURNEY TRACKING ================= */}
          {activeTab === "journeys" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>🚶 Customer Journey Tracking</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "14px" }}>Completed Shopper Journeys</h3>
                  {completedJourneys.map(j => (
                    <div key={j.id} style={{ padding: "12px", borderRadius: "8px", backgroundColor: TOKENS.bg, border: `1px solid ${TOKENS.cardBorder}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "13px" }}>
                        <span>{j.id}</span>
                        <span style={{ color: TOKENS.accent }}>{Math.round(j.totalDwellSec / 60)} min dwell</span>
                      </div>
                      <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "4px" }}>
                        {j.entryTime} → {j.exitTime} · {j.store}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "14px" }}>Shopper Pathway Timeline</h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {selectedJourney?.path.map((zone, idx) => (
                      <span key={idx} style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: TOKENS.bg, border: `1px solid ${TOKENS.cardBorder}`, fontSize: "12px", fontWeight: "600" }}>
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 3: INFRASTRUCTURE (STORE & CAMERA CRUD) ================= */}
          {activeTab === "infrastructure" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* STORES SECTION CRUD */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>🏪 Store Locations (CRUD)</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>Manage store branches and location configurations.</p>
                  </div>
                  <button onClick={() => handleOpenStoreModal()} style={smallBtn(TOKENS.accent, { color: "#1A1200", padding: "8px 16px" })}>
                    ➕ Add New Store
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                  {stores.map(s => (
                    <div key={s.id} style={{ background: TOKENS.bg, padding: "16px", borderRadius: "8px", border: `1px solid ${TOKENS.cardBorder}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: TOKENS.text }}>{s.name}</div>
                        <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "4px" }}>📍 {s.location}</div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "14px", borderTop: `1px solid ${TOKENS.cardBorder}`, paddingTop: "10px" }}>
                        <button onClick={() => handleOpenStoreModal(s)} style={smallBtn(TOKENS.info)}>✏️ Edit</button>
                        <button onClick={() => handleDeleteStore(s.id, s.name)} style={smallBtn(TOKENS.danger)}>🗑️ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CAMERAS SECTION CRUD */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>📹 Camera Hardware Registry (CRUD)</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>Register IP cameras, configure stream endpoints, and monitor status.</p>
                  </div>
                  <button onClick={() => handleOpenCamModal()} style={smallBtn(TOKENS.accent, { color: "#1A1200", padding: "8px 16px" })}>
                    ➕ Register New Camera
                  </button>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                      <th style={{ padding: "10px" }}>Camera ID</th>
                      <th style={{ padding: "10px" }}>Name & Zone</th>
                      <th style={{ padding: "10px" }}>Store</th>
                      <th style={{ padding: "10px" }}>IP Address</th>
                      <th style={{ padding: "10px" }}>Status</th>
                      <th style={{ padding: "10px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameras.map(c => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                        <td style={{ padding: "10px", fontWeight: "700" }}>{c.id}</td>
                        <td style={{ padding: "10px" }}>
                          <div>{c.name}</div>
                          <div style={{ fontSize: "10px", color: TOKENS.muted }}>{c.zone}</div>
                        </td>
                        <td style={{ padding: "10px" }}>{c.store}</td>
                        <td style={{ padding: "10px", fontFamily: "monospace" }}>{c.ip}</td>
                        <td style={{ padding: "10px" }}>
                          <span style={{ color: c.status === "Online" ? TOKENS.success : TOKENS.danger, fontWeight: "600" }}>
                            ● {c.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => handleOpenCamModal(c)} style={smallBtn(TOKENS.info)}>Edit</button>
                            <button onClick={() => handleDeleteCamera(c.id)} style={smallBtn(TOKENS.danger)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 4: USERS (USER CRUD) ================= */}
          {activeTab === "users" && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>👤 User Accounts & Role Permissions (CRUD)</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>Create staff accounts, assign store roles, and manage permissions.</p>
                </div>
                <button onClick={() => handleOpenUserModal()} style={smallBtn(TOKENS.accent, { color: "#1A1200", padding: "8px 16px" })}>
                  ➕ Create New User
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                    <th style={{ padding: "10px" }}>User</th>
                    <th style={{ padding: "10px" }}>Role</th>
                    <th style={{ padding: "10px" }}>Store</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                      <td style={{ padding: "10px", fontWeight: "600" }}>
                        <div>{u.name}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>{u.email}</div>
                      </td>
                      <td style={{ padding: "10px" }}>{u.role}</td>
                      <td style={{ padding: "10px" }}>{u.store}</td>
                      <td style={{ padding: "10px", color: TOKENS.success, fontWeight: "600" }}>● {u.status}</td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => handleOpenUserModal(u)} style={smallBtn(TOKENS.info)}>Edit</button>
                          <button onClick={() => handleDeleteUser(u.id, u.name)} style={smallBtn(TOKENS.danger)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= VIEW 5: SYSTEM HEALTH ================= */}
          {activeTab === "system" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={cardStyle}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>FastAPI Backend Services</h3>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}`, fontSize: "12px" }}>
                  <span>Video Frame Analysis API</span>
                  <span style={{ color: TOKENS.success }}>Operational</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}`, fontSize: "12px" }}>
                  <span>Excel Export Service</span>
                  <span style={{ color: TOKENS.success }}>Operational</span>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>AI Model Compute Status</h3>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}`, fontSize: "12px" }}>
                  <span>YOLOv8-Pose (Gaze Engine)</span>
                  <span style={{ color: TOKENS.success }}>Loaded</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}`, fontSize: "12px" }}>
                  <span>ByteTrack Multi-Tracker</span>
                  <span style={{ color: TOKENS.success }}>Active</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 6: SECURITY ================= */}
          {activeTab === "security" && (
            <div style={cardStyle}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 14px 0" }}>🛡️ Audit Trail & Permissions</h2>
              <div style={{ fontSize: "12px", color: TOKENS.muted, padding: "8px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                [Today] Administrator performed video analysis with Excel export.
              </div>
              <div style={{ fontSize: "12px", color: TOKENS.muted, padding: "8px 0" }}>
                [Today] Automated security integrity check PASSED.
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= STORE CRUD MODAL ================= */}
      {isStoreModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,15,23,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ ...cardStyle, width: "420px", maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{editingStore ? "Edit Store" : "Add New Store"}</h3>
              <button onClick={() => setIsStoreModalOpen(false)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleSaveStore} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Store Name</label>
                <input style={inputStyle} value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} placeholder="e.g. Inorbit Mall Branch" required />
              </div>
              <div>
                <label style={labelStyle}>Location / Address</label>
                <input style={inputStyle} value={storeForm.location} onChange={e => setStoreForm({ ...storeForm, location: e.target.value })} placeholder="e.g. Madhapur, Hyderabad" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsStoreModalOpen(false)} style={smallBtn(TOKENS.surface2, { color: TOKENS.text })}>Cancel</button>
                <button type="submit" style={smallBtn(TOKENS.accent, { color: "#1A1200" })}>Save Store</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CAMERA CRUD MODAL ================= */}
      {isCamModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,15,23,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ ...cardStyle, width: "450px", maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{editingCam ? `Edit Camera ${editingCam.id}` : "Register New Camera"}</h3>
              <button onClick={() => setIsCamModalOpen(false)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleSaveCamera} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Camera Name / Description</label>
                <input style={inputStyle} value={camForm.name} onChange={e => setCamForm({ ...camForm, name: e.target.value })} placeholder="e.g. Front Entrance Overhead" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>Assigned Store</label>
                  <select style={inputStyle} value={camForm.store} onChange={e => setCamForm({ ...camForm, store: e.target.value })}>
                    {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Store Zone</label>
                  <select style={inputStyle} value={camForm.zone} onChange={e => setCamForm({ ...camForm, zone: e.target.value })}>
                    <option value="Entrance">Entrance</option>
                    <option value="Grocery & Snacks">Grocery & Snacks</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Checkout">Checkout</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>IP Address</label>
                  <input style={inputStyle} value={camForm.ip} onChange={e => setCamForm({ ...camForm, ip: e.target.value })} placeholder="192.168.1.100" />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={camForm.status} onChange={e => setCamForm({ ...camForm, status: e.target.value })}>
                    <option value="Online">Online</option>
                    <option value="Degraded">Degraded</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsCamModalOpen(false)} style={smallBtn(TOKENS.surface2, { color: TOKENS.text })}>Cancel</button>
                <button type="submit" style={smallBtn(TOKENS.accent, { color: "#1A1200" })}>Save Camera</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= USER CRUD MODAL ================= */}
      {isUserModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,15,23,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ ...cardStyle, width: "450px", maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{editingUser ? "Edit User Account" : "Create New User"}</h3>
              <button onClick={() => setIsUserModalOpen(false)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleSaveUser} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="e.g. John Doe" required />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input style={inputStyle} type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="john@retailai.corp" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select style={inputStyle} value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Retail Analyst">Retail Analyst</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Assigned Store</label>
                  <select style={inputStyle} value={userForm.store} onChange={e => setUserForm({ ...userForm, store: e.target.value })}>
                    <option value="All Stores">All Stores</option>
                    {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsUserModalOpen(false)} style={smallBtn(TOKENS.surface2, { color: TOKENS.text })}>Cancel</button>
                <button type="submit" style={smallBtn(TOKENS.accent, { color: "#1A1200" })}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}