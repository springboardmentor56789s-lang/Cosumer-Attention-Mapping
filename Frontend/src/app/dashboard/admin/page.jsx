"use client";
import React, { useState, useEffect, useRef } from "react";

// ==========================================
// DESIGN TOKENS & STYLES
// ==========================================
const TOKENS = {
  bg: "#0B0F17",
  sidebarBg: "#111827",
  cardBg: "#1F2937",
  cardBorder: "#374151",
  text: "#F9FAFB",
  muted: "#9CA3AF",
  accent: "#6366F1",
  accentHover: "#4F46E5",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

const cardStyle = {
  backgroundColor: TOKENS.cardBg,
  borderRadius: "12px",
  border: `1px solid ${TOKENS.cardBorder}`,
  padding: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
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

// ==========================================
// MOCK DATA STORES
// ==========================================
const INITIAL_STORES = [
  { id: "S-01", name: "Downtown Flagship", cameras: 12, activeUsers: 8, aiStatus: "Active", lastSync: "Just now", health: 98 },
  { id: "S-02", name: "Metro Shopping Mall", cameras: 18, activeUsers: 14, aiStatus: "Active", lastSync: "2m ago", health: 95 },
  { id: "S-03", name: "Westside Plaza", cameras: 8, activeUsers: 3, aiStatus: "Degraded", lastSync: "12m ago", health: 78 },
  { id: "S-04", name: "Airport Duty Free", cameras: 24, activeUsers: 19, aiStatus: "Active", lastSync: "1m ago", health: 91 },
];

const INITIAL_LOGS = [
  { id: "L1", time: "10:44 AM", device: "Camera CAM-07", event: "Reconnected", status: "success" },
  { id: "L2", time: "10:40 AM", device: "Camera CAM-07", event: "Disconnected", status: "danger" },
  { id: "L3", time: "10:20 AM", device: "Camera CAM-02", event: "Connected", status: "success" },
  { id: "L4", time: "09:15 AM", device: "YOLO Engine v4", event: "Model Retrained", status: "info" },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: "New Store Added", time: "15 minutes ago", type: "info" },
  { id: 2, title: "Camera CAM-04 Offline", time: "23 minutes ago", type: "danger" },
  { id: 3, title: "New Marketing Manager Created", time: "1 hour ago", type: "success" },
  { id: 4, title: "Database Auto-Backup Finished", time: "2 hours ago", type: "info" },
];

const INITIAL_SHELVES = [
  { id: "SH-01", name: "Snacks & Beverages", store: "Downtown Flagship", camera: "CAM-02", people: 3 },
  { id: "SH-02", name: "Personal Care", store: "Downtown Flagship", camera: "CAM-05", people: 1 },
  { id: "SH-03", name: "Electronics Accessories", store: "Metro Shopping Mall", camera: "CAM-11", people: 5 },
  { id: "SH-04", name: "Apparel — Men's", store: "Metro Shopping Mall", camera: "CAM-14", people: 2 },
  { id: "SH-05", name: "Home & Kitchen", store: "Westside Plaza", camera: "CAM-03", people: 0 },
  { id: "SH-06", name: "Duty Free — Perfumes", store: "Airport Duty Free", camera: "CAM-19", people: 4 },
];

// ==========================================
// MODAL WRAPPER
// ==========================================
function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...cardStyle,
          width: "380px",
          maxWidth: "90vw",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CAMSAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [time, setTime] = useState(new Date());

  // Mutable data (was const before — now stateful so Quick Actions can affect it)
  const [stores, setStores] = useState(INITIAL_STORES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [shelves, setShelves] = useState(INITIAL_SHELVES);

  // Quick Action modal state
  const [activeModal, setActiveModal] = useState(null); // "user" | "store" | "camera" | null
  const [toast, setToast] = useState(null);

  // Form states
  const [userForm, setUserForm] = useState({ name: "", role: "Store Manager" });
  const [storeForm, setStoreForm] = useState({ name: "", cameras: "" });
  const [cameraForm, setCameraForm] = useState({ storeId: stores[0]?.id || "", count: "" });

  // Real-time System Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const totalPeopleNearShelves = shelves.reduce((sum, s) => sum + s.people, 0);
  const busiestShelf = shelves.reduce((a, b) => (b.people > a.people ? b : a), shelves[0]);

  // ================= VIDEO-BASED SHELF DETECTION =================
  const videoRef = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedShelfId, setSelectedShelfId] = useState(shelves[0]?.id || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frameResults, setFrameResults] = useState([]);
  const [detectionSummary, setDetectionSummary] = useState(null);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoFile(file);
    setVideoURL(URL.createObjectURL(file));
    setVideoDuration(0);
    setFrameResults([]);
    setDetectionSummary(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setVideoDuration(videoRef.current.duration || 0);
  };

  // Runs a frame-sampling people-detection pass over the uploaded video.
  // NOTE: this front-end demo simulates the per-frame headcount so the UI/report
  // flow can be built and tested end-to-end. In production, frames (or the video
  // file) would be sent to the FastAPI backend, run through the YOLO detection +
  // tracking engine per the CAMS architecture, and the real per-frame counts
  // returned to populate this exact same table/report.
  const handleRunDetection = () => {
    if (!videoFile || isProcessing) return;
    const shelf = shelves.find((s) => s.id === selectedShelfId);
    if (!shelf) return;

    setIsProcessing(true);
    setProgress(0);
    setFrameResults([]);
    setDetectionSummary(null);

    const duration = videoDuration && videoDuration > 0 ? videoDuration : 20;
    const sampleCount = Math.min(24, Math.max(6, Math.round(duration)));
    const interval = duration / sampleCount;

    let frame = 0;
    let lastCount = shelf.people;
    const results = [];

    const tick = setInterval(() => {
      frame += 1;
      const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1 — smooth random walk
      lastCount = Math.max(0, Math.min(9, lastCount + delta));
      results.push({ timeSec: Math.min(duration, frame * interval), count: lastCount });
      setFrameResults([...results]);
      setProgress(Math.round((frame / sampleCount) * 100));

      if (frame >= sampleCount) {
        clearInterval(tick);
        const counts = results.map((r) => r.count);
        const peak = Math.max(...counts);
        const peakFrame = results.find((r) => r.count === peak);
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

        const summary = {
          shelfName: shelf.name,
          store: shelf.store,
          fileName: videoFile.name,
          duration,
          totalFrames: sampleCount,
          avg: Math.round(avg * 10) / 10,
          peak,
          peakTime: peakFrame ? peakFrame.timeSec : 0,
        };
        setDetectionSummary(summary);
        setShelves((prev) =>
          prev.map((s) => (s.id === shelf.id ? { ...s, people: peak } : s))
        );
        pushNotification(
          `Detection complete for ${shelf.name}: peak ${peak} people`,
          "success"
        );
        setToast(`Detection finished — peak ${peak} people at ${shelf.name}`);
        setIsProcessing(false);
      }
    }, 120);
  };

  const handleDownloadDetectionReport = () => {
    if (!detectionSummary || frameResults.length === 0) return;
    const lines = [
      `CAMS Shelf Attention Detection Report`,
      `Shelf,${detectionSummary.shelfName}`,
      `Store,${detectionSummary.store}`,
      `Source Video,${detectionSummary.fileName}`,
      `Video Duration (s),${detectionSummary.duration.toFixed(1)}`,
      `Frames Analyzed,${detectionSummary.totalFrames}`,
      `Average People Count,${detectionSummary.avg}`,
      `Peak People Count,${detectionSummary.peak}`,
      `Peak Timestamp,${formatTime(detectionSummary.peakTime)}`,
      ``,
      `Timestamp,People Count`,
      ...frameResults.map((r) => `${formatTime(r.timeSec)},${r.count}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `shelf_detection_report_${detectionSummary.shelfName.replace(/\s+/g, "_")}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pushNotification = (title, type = "info") => {
    setNotifications((prev) => [
      { id: Date.now(), title, time: "Just now", type },
      ...prev,
    ]);
  };

  // Filtered Items for "Search Everything"
  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ================= QUICK ACTION HANDLERS =================
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!userForm.name.trim()) return;
    pushNotification(`New ${userForm.role} Created: ${userForm.name}`, "success");
    setToast(`User "${userForm.name}" added as ${userForm.role}`);
    setUserForm({ name: "", role: "Store Manager" });
    setActiveModal(null);
  };

  const handleRegisterStore = (e) => {
    e.preventDefault();
    if (!storeForm.name.trim()) return;
    const newStore = {
      id: `S-${String(stores.length + 1).padStart(2, "0")}`,
      name: storeForm.name,
      cameras: Number(storeForm.cameras) || 0,
      activeUsers: 0,
      aiStatus: "Active",
      lastSync: "Just now",
      health: 100,
    };
    setStores((prev) => [...prev, newStore]);
    pushNotification(`New Store Registered: ${newStore.name}`, "info");
    setToast(`Store "${newStore.name}" registered`);
    setStoreForm({ name: "", cameras: "" });
    setActiveModal(null);
  };

  const handleAddCamera = (e) => {
    e.preventDefault();
    const count = Number(cameraForm.count) || 0;
    if (!cameraForm.storeId || count <= 0) return;
    setStores((prev) =>
      prev.map((s) =>
        s.id === cameraForm.storeId ? { ...s, cameras: s.cameras + count } : s
      )
    );
    const store = stores.find((s) => s.id === cameraForm.storeId);
    pushNotification(`${count} Camera(s) Paired to ${store?.name || cameraForm.storeId}`, "success");
    setToast(`${count} camera(s) added to ${store?.name || cameraForm.storeId}`);
    setCameraForm({ storeId: stores[0]?.id || "", count: "" });
    setActiveModal(null);
  };

  const handleGenerateReport = () => {
    const rows = [
      ["Store ID", "Store Name", "Cameras", "Active Users", "AI Status", "Last Sync"],
      ...stores.map((s) => [s.id, s.name, s.cameras, s.activeUsers, s.aiStatus, s.lastSync]),
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cams_analytics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushNotification("Analytics Report Generated & Downloaded", "success");
    setToast("Report exported as CSV");
  };

  return (
    <div style={{ backgroundColor: TOKENS.bg, color: TOKENS.text, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ================= TOAST ================= */}
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

      {/* ================= HEADER BAR ================= */}
      <header style={{ backgroundColor: TOKENS.sidebarBg, borderBottom: `1px solid ${TOKENS.cardBorder}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px" }}>
            👁️
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "700", margin: 0, lineHeight: 1.2 }}>CAMS AI Admin</h1>
            <span style={{ fontSize: "11px", color: TOKENS.muted }}>Consumer Attention Mapping System</span>
          </div>
        </div>

        {/* Search Everything */}
        <div style={{ position: "relative", width: "360px" }}>
          <input
            type="text"
            placeholder="Search everything (Users, Stores, Cameras, Logs)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: TOKENS.bg,
              border: `1px solid ${TOKENS.cardBorder}`,
              borderRadius: "8px",
              padding: "8px 12px 8px 36px",
              color: TOKENS.text,
              fontSize: "13px",
              outline: "none"
            }}
          />
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: TOKENS.muted, fontSize: "14px" }}>🔍</span>

          {searchQuery && (
            <div style={{ position: "absolute", top: "42px", left: 0, right: 0, backgroundColor: TOKENS.cardBg, border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "8px", padding: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)", zIndex: 100 }}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, marginBottom: "8px", fontWeight: "600" }}>STORES & INFRASTRUCTURE MATCHES</div>
              {filteredStores.length === 0 ? (
                <div style={{ fontSize: "12px", color: TOKENS.muted }}>No matching entities found.</div>
              ) : (
                filteredStores.map(s => (
                  <div key={s.id} style={{ padding: "6px", borderRadius: "4px", backgroundColor: TOKENS.bg, marginBottom: "4px", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                    <span><strong>{s.name}</strong> ({s.id})</span>
                    <span style={{ color: TOKENS.success }}>{s.cameras} Cameras</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Header Items */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

          <div style={{ textAlign: "right", borderRight: `1px solid ${TOKENS.cardBorder}`, paddingRight: "16px" }}>
            <div suppressHydrationWarning style={{ fontSize: "13px", fontWeight: "600", fontFamily: "monospace" }}>
              {time.toLocaleTimeString()}
            </div>
            <div suppressHydrationWarning style={{ fontSize: "10px", color: TOKENS.muted }}>
              {time.toLocaleDateString()}
            </div>
          </div>

          <button
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: TOKENS.text }}
          >
            🔔
            <span style={{ position: "absolute", top: "-2px", right: "-2px", backgroundColor: TOKENS.danger, color: "#fff", fontSize: "9px", borderRadius: "50%", width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {notifications.length}
            </span>
          </button>
        </div>
      </header>

      {/* ================= NOTIFICATION DRAWER ================= */}
      {isNotifyOpen && (
        <div style={{ position: "fixed", top: "60px", right: "20px", width: "320px", backgroundColor: TOKENS.sidebarBg, border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "12px", padding: "16px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", zIndex: 1000, maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: `1px solid ${TOKENS.cardBorder}`, paddingBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Notifications Center</h3>
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
              { id: "infrastructure", label: "Infrastructure & Cameras", icon: "📹" },
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
                  color: activeTab === tab.id ? "#fff" : TOKENS.muted,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ ...cardStyle, padding: "12px", backgroundColor: TOKENS.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                AD
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "600" }}>Administrator</div>
                <div style={{ fontSize: "10px", color: TOKENS.success, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: TOKENS.success }}></span> Online
                </div>
              </div>
            </div>
            <div style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${TOKENS.cardBorder}` }}>
              Last Login: Today at 10:14 AM
            </div>
          </div>
        </aside>

        {/* BODY DASHBOARD PANEL */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* ================= VIEW 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <>
              {/* TOP HERO — Platform Health Score only (AI Pipeline + Storage panels removed) */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ ...cardStyle, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "320px" }}>
                  <span style={{ fontSize: "12px", color: TOKENS.muted, fontWeight: "600" }}>PLATFORM HEALTH SCORE</span>
                  <div style={{ fontSize: "48px", fontWeight: "800", color: TOKENS.success, margin: "10px 0" }}>98%</div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: TOKENS.bg, borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: "98%", height: "100%", backgroundColor: TOKENS.success }}></div>
                  </div>
                  <span style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "8px" }}>Based on Cameras, API, DB & AI Engines</span>
                </div>
              </div>

              {/* Quick Action Cards — now functional */}
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: TOKENS.muted, marginBottom: "12px" }}>QUICK ACTIONS</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                  {[
                    { id: "user", title: "+ Add User", desc: "Provision new team member" },
                    { id: "store", title: "+ Register Store", desc: "Set up new physical location" },
                    { id: "camera", title: "+ Add Camera", desc: "Pair new IP attention camera" },
                    { id: "report", title: "+ Generate Report", desc: "Export analytics summary CSV" }
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() => (act.id === "report" ? handleGenerateReport() : setActiveModal(act.id))}
                      style={{ ...cardStyle, border: `1px solid ${TOKENS.cardBorder}`, cursor: "pointer", textAlign: "left", transition: "transform 0.1s", background: TOKENS.cardBg }}
                      onMouseOver={e => e.currentTarget.style.borderColor = TOKENS.accent}
                      onMouseOut={e => e.currentTarget.style.borderColor = TOKENS.cardBorder}
                    >
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: TOKENS.accent }}>{act.title}</div>
                      <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "4px" }}>{act.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video-Based Shelf Attention Detection */}
              <div style={cardStyle}>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>🎥 Shelf Attention Detection from Video</h3>
                  <p style={{ margin: 0, fontSize: "11px", color: TOKENS.muted }}>
                    Upload footage of a shelf, run detection, then download the people-count report
                  </p>
                </div>

                {/* Upload + config row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Shelf / Camera</label>
                    <select
                      style={inputStyle}
                      value={selectedShelfId}
                      onChange={(e) => setSelectedShelfId(e.target.value)}
                      disabled={isProcessing}
                    >
                      {shelves.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} — {s.store} ({s.camera})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Upload Shelf Video</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={isProcessing}
                      style={{ ...inputStyle, padding: "8px 10px" }}
                    />
                  </div>
                </div>

                {/* Preview + run button */}
                {videoURL && (
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap" }}>
                    <video
                      ref={videoRef}
                      src={videoURL}
                      onLoadedMetadata={handleLoadedMetadata}
                      controls
                      muted
                      style={{ width: "260px", borderRadius: "8px", backgroundColor: "#000" }}
                    />
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "4px" }}>
                        {videoFile?.name} {videoDuration ? `· ${formatTime(videoDuration)}` : ""}
                      </div>
                      <button
                        onClick={handleRunDetection}
                        disabled={isProcessing}
                        style={{
                          padding: "10px 18px",
                          backgroundColor: isProcessing ? TOKENS.cardBorder : TOKENS.accent,
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: isProcessing ? "not-allowed" : "pointer",
                        }}
                      >
                        {isProcessing ? `Detecting… ${progress}%` : "▶ Run People Detection"}
                      </button>

                      {isProcessing && (
                        <div style={{ width: "100%", height: "6px", backgroundColor: TOKENS.bg, borderRadius: "4px", overflow: "hidden", marginTop: "10px" }}>
                          <div style={{ width: `${progress}%`, height: "100%", backgroundColor: TOKENS.accent, transition: "width 0.15s linear" }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Results */}
                {detectionSummary && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: TOKENS.accent }}>{detectionSummary.peak}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Peak People Count</div>
                      </div>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: TOKENS.text }}>{detectionSummary.avg}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Average Count</div>
                      </div>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: TOKENS.text }}>{formatTime(detectionSummary.peakTime)}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Time of Peak</div>
                      </div>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: TOKENS.text }}>{detectionSummary.totalFrames}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Frames Analyzed</div>
                      </div>
                    </div>

                    <div style={{ maxHeight: "160px", overflowY: "auto", border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "8px", marginBottom: "16px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                          <tr style={{ position: "sticky", top: 0, backgroundColor: TOKENS.cardBg }}>
                            <th style={{ padding: "8px", textAlign: "left", color: TOKENS.muted, borderBottom: `1px solid ${TOKENS.cardBorder}` }}>Timestamp</th>
                            <th style={{ padding: "8px", textAlign: "left", color: TOKENS.muted, borderBottom: `1px solid ${TOKENS.cardBorder}` }}>People Detected</th>
                          </tr>
                        </thead>
                        <tbody>
                          {frameResults.map((r, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                              <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{formatTime(r.timeSec)}</td>
                              <td style={{ padding: "6px 8px" }}>{r.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      onClick={handleDownloadDetectionReport}
                      style={{
                        padding: "10px 18px",
                        backgroundColor: TOKENS.success,
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ⬇ Download Detection Report (CSV)
                    </button>
                  </>
                )}

                {!videoURL && (
                  <div style={{ fontSize: "12px", color: TOKENS.muted }}>
                    Select a shelf and upload a video clip to run detection.
                  </div>
                )}
              </div>

              {/* Last Detected Count per Shelf */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>🧍 Shelves — Last Detected Count</h3>
                    <p style={{ margin: 0, fontSize: "11px", color: TOKENS.muted }}>Most recent people count recorded per shelf</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: TOKENS.accent }}>{totalPeopleNearShelves}</div>
                    <div style={{ fontSize: "10px", color: TOKENS.muted }}>Total Across Shelves</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {shelves.map((s) => {
                    const busy = s.people >= 4;
                    const idle = s.people === 0;
                    return (
                      <div
                        key={s.id}
                        style={{
                          backgroundColor: TOKENS.bg,
                          padding: "14px",
                          borderRadius: "8px",
                          border: `1px solid ${busy ? TOKENS.warning : TOKENS.cardBorder}`,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: "600" }}>{s.name}</div>
                            <div style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "2px" }}>{s.store} · {s.camera}</div>
                          </div>
                          <span style={{ fontSize: "10px" }}>
                            {idle ? "⚪" : busy ? "🟡" : "🟢"}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "10px" }}>
                          <span style={{ fontSize: "24px", fontWeight: "800", color: idle ? TOKENS.muted : TOKENS.text }}>{s.people}</span>
                          <span style={{ fontSize: "11px", color: TOKENS.muted }}>{s.people === 1 ? "person" : "people"} nearby</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: "14px", fontSize: "11px", color: TOKENS.muted, borderTop: `1px solid ${TOKENS.cardBorder}`, paddingTop: "10px" }}>
                  Busiest right now: <strong style={{ color: TOKENS.text }}>{busiestShelf.name}</strong> ({busiestShelf.store}) with {busiestShelf.people} {busiestShelf.people === 1 ? "person" : "people"}
                </div>
              </div>

              {/* UNIQUE FEATURE: AI READINESS DASHBOARD */}
              <div style={{ ...cardStyle, borderColor: TOKENS.accent }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>🧠 AI Readiness Dashboard</h3>
                    <p style={{ margin: 0, fontSize: "11px", color: TOKENS.muted }}>Architectural readiness and accuracy metrics across CAMS modules</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: TOKENS.success }}>95%</div>
                    <div style={{ fontSize: "10px", color: TOKENS.muted }}>Overall Readiness</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
                  {[
                    { name: "Detection Engine", score: 98 },
                    { name: "Tracking Engine", score: 96 },
                    { name: "Attention Analysis", score: 95 },
                    { name: "Heatmap Generation", score: 94 },
                    { name: "Recommendation Engine", score: 91 },
                  ].map((m, i) => (
                    <div key={i} style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: TOKENS.muted, marginBottom: "6px" }}>{m.name}</div>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: TOKENS.text }}>✔ {m.score}%</div>
                      <div style={{ width: "100%", height: "4px", backgroundColor: TOKENS.cardBorder, marginTop: "8px", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${m.score}%`, height: "100%", backgroundColor: TOKENS.success }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI ANALYTICS SUMMARY & TOP STORES */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0 }}>Today's AI Processing Summary</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "16px" }}>
                    {[
                      { label: "People Detected", val: "12,463", icon: "👥" },
                      { label: "Heatmaps Generated", val: "41", icon: "🔥" },
                      { label: "Product Interactions", val: "8,941", icon: "🛒" },
                      { label: "Recommendations", val: "17", icon: "💡" },
                    ].map((stat, i) => (
                      <div key={i} style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "18px" }}>{stat.icon}</div>
                        <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px" }}>{stat.val}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: TOKENS.muted, marginBottom: "8px" }}>MONTHLY AI PREDICTIONS TREND</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "100px", padding: "10px 0", borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                      {[
                        { label: "Week 1", val: 42 },
                        { label: "Week 2", val: 58 },
                        { label: "Week 3", val: 65 },
                        { label: "Week 4", val: 81 },
                      ].map((bar, idx) => (
                        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}>
                          <span style={{ fontSize: "10px", color: TOKENS.muted }}>{bar.val}k</span>
                          <div style={{ width: "100%", height: `${bar.val}%`, backgroundColor: TOKENS.accent, borderRadius: "4px 4px 0 0" }}></div>
                          <span style={{ fontSize: "10px", color: TOKENS.muted }}>{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0 }}>Top Active Stores</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    {stores.slice(0, 3).map((st, idx) => (
                      <div key={st.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: TOKENS.bg, borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontWeight: "bold", color: TOKENS.accent }}>#{idx + 1}</span>
                          <span style={{ fontSize: "12px" }}>{st.name}</span>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "bold", color: TOKENS.success }}>{st.health}%</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ================= VIEW 2: INFRASTRUCTURE & CAMERAS ================= */}
          {activeTab === "infrastructure" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0 }}>Camera Connectivity</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "20px" }}>
                    <div style={{ position: "relative", width: "100px", height: "100px" }}>
                      <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={TOKENS.danger} strokeWidth="3.8" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={TOKENS.success} strokeWidth="3.8" strokeDasharray="96, 100" />
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "12px", fontWeight: "bold" }}>96%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", marginBottom: "6px" }}><span style={{ color: TOKENS.success }}>🟢 96%</span> Online (240)</div>
                      <div style={{ fontSize: "13px" }}><span style={{ color: TOKENS.danger }}>🔴 4%</span> Offline (10)</div>
                    </div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0 }}>Camera Connectivity Event Timeline</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {INITIAL_LOGS.map(log => (
                      <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: TOKENS.bg, borderRadius: "6px", fontSize: "12px" }}>
                        <div>
                          <strong style={{ color: TOKENS.accent }}>{log.time}</strong> — {log.device}
                        </div>
                        <span style={{ color: log.status === "danger" ? TOKENS.danger : TOKENS.success, fontWeight: "600" }}>{log.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0, marginBottom: "16px" }}>Live Infrastructure Stores & Node Status</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                      <th style={{ padding: "8px" }}>Store Name</th>
                      <th style={{ padding: "8px" }}>Cameras</th>
                      <th style={{ padding: "8px" }}>Active Users</th>
                      <th style={{ padding: "8px" }}>AI Engine Status</th>
                      <th style={{ padding: "8px" }}>Last Sync</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((s) => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                        <td style={{ padding: "12px 8px", fontWeight: "600" }}>{s.name}</td>
                        <td style={{ padding: "12px 8px" }}>{s.cameras} online</td>
                        <td style={{ padding: "12px 8px" }}>{s.activeUsers} active</td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ color: s.aiStatus === "Active" ? TOKENS.success : TOKENS.warning, fontWeight: "bold" }}>● {s.aiStatus}</span>
                        </td>
                        <td style={{ padding: "12px 8px", color: TOKENS.muted }}>{s.lastSync}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= VIEW 3: SYSTEM & API HEALTH ================= */}
          {activeTab === "system" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              <div style={cardStyle}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0 }}>API Performance Monitor</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                  {[
                    { endpoint: "GET /users", latency: "85 ms", status: "green" },
                    { endpoint: "GET /stores", latency: "74 ms", status: "green" },
                    { endpoint: "GET /alerts", latency: "240 ms", status: "yellow" },
                    { endpoint: "POST /ai/infer", latency: "112 ms", status: "green" },
                  ].map((api, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: TOKENS.bg, borderRadius: "6px", fontFamily: "monospace", fontSize: "12px" }}>
                      <span>{api.endpoint}</span>
                      <div>
                        <span style={{ marginRight: "10px", color: TOKENS.muted }}>{api.latency}</span>
                        <span>{api.status === "green" ? "🟢" : "🟡"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0 }}>Operational Backup Status</h3>
                <div style={{ marginTop: "16px", backgroundColor: TOKENS.bg, padding: "16px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12px", color: TOKENS.muted }}>Database Backup Status</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: TOKENS.success, marginTop: "4px" }}>Completed</div>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "8px" }}>Last completed: 2 hours ago</div>
                  <div style={{ fontSize: "11px", color: TOKENS.accent, marginTop: "4px" }}>Next scheduled: 11:00 PM UTC</div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 4: SECURITY & PERMISSIONS ================= */}
          {activeTab === "security" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0 }}>Security Panel</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", fontSize: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Failed Login Attempts:</span> <strong style={{ color: TOKENS.warning }}>3</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Locked Accounts:</span> <strong style={{ color: TOKENS.danger }}>1</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>JWT Status:</span> <strong style={{ color: TOKENS.success }}>Healthy</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>SSL Encryption:</span> <strong style={{ color: TOKENS.success }}>Enabled</strong></div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0 }}>Recent User Login Activity</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", fontSize: "12px" }}>
                    <div style={{ padding: "8px", backgroundColor: TOKENS.bg, borderRadius: "4px" }}>
                      <strong>John</strong> — <span style={{ color: TOKENS.muted }}>Store Manager</span> (2 min ago)
                    </div>
                    <div style={{ padding: "8px", backgroundColor: TOKENS.bg, borderRadius: "4px" }}>
                      <strong>Alice</strong> — <span style={{ color: TOKENS.muted }}>Retail Analyst</span> (7 min ago)
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", marginTop: 0, marginBottom: "16px" }}>Role Permissions Matrix</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                      <th style={{ padding: "8px" }}>Role</th>
                      <th style={{ padding: "8px" }}>Create</th>
                      <th style={{ padding: "8px" }}>Update</th>
                      <th style={{ padding: "8px" }}>Delete</th>
                      <th style={{ padding: "8px" }}>Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { role: "Admin", create: true, update: true, delete: true, export: true },
                      { role: "Store Manager", create: true, update: true, delete: false, export: true },
                      { role: "Retail Analyst", create: false, update: false, delete: false, export: true },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                        <td style={{ padding: "12px 8px", fontWeight: "600" }}>{row.role}</td>
                        <td style={{ padding: "12px 8px", color: row.create ? TOKENS.success : TOKENS.danger }}>{row.create ? "✔" : "✖"}</td>
                        <td style={{ padding: "12px 8px", color: row.update ? TOKENS.success : TOKENS.danger }}>{row.update ? "✔" : "✖"}</td>
                        <td style={{ padding: "12px 8px", color: row.delete ? TOKENS.success : TOKENS.danger }}>{row.delete ? "✔" : "✖"}</td>
                        <td style={{ padding: "12px 8px", color: row.export ? TOKENS.success : TOKENS.danger }}>{row.export ? "✔" : "✖"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ================= SYSTEM VERSION FOOTER ================= */}
      <footer style={{ backgroundColor: TOKENS.sidebarBg, borderTop: `1px solid ${TOKENS.cardBorder}`, padding: "8px 24px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: TOKENS.muted }}>
        <div>CAMS — Consumer Attention Mapping System</div>
        <div>Version 2.4.1 | Build 235 | Updated Today</div>
      </footer>

      {/* ================= QUICK ACTION MODALS ================= */}
      {activeModal === "user" && (
        <Modal title="Add New User" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddUser}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Full Name</label>
              <input
                style={inputStyle}
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="e.g. Priya Nair"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Role</label>
              <select
                style={inputStyle}
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option>Store Manager</option>
                <option>Retail Analyst</option>
                <option>Admin</option>
              </select>
            </div>
            <button
              type="submit"
              style={{ width: "100%", padding: "10px", backgroundColor: TOKENS.accent, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
            >
              Create User
            </button>
          </form>
        </Modal>
      )}

      {activeModal === "store" && (
        <Modal title="Register New Store" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleRegisterStore}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store Name</label>
              <input
                style={inputStyle}
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                placeholder="e.g. Riverside Outlet"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Initial Camera Count</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                value={storeForm.cameras}
                onChange={(e) => setStoreForm({ ...storeForm, cameras: e.target.value })}
                placeholder="e.g. 10"
              />
            </div>
            <button
              type="submit"
              style={{ width: "100%", padding: "10px", backgroundColor: TOKENS.accent, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
            >
              Register Store
            </button>
          </form>
        </Modal>
      )}

      {activeModal === "camera" && (
        <Modal title="Add Camera" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddCamera}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store</label>
              <select
                style={inputStyle}
                value={cameraForm.storeId}
                onChange={(e) => setCameraForm({ ...cameraForm, storeId: e.target.value })}
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Number of Cameras to Add</label>
              <input
                type="number"
                min="1"
                style={inputStyle}
                value={cameraForm.count}
                onChange={(e) => setCameraForm({ ...cameraForm, count: e.target.value })}
                placeholder="e.g. 2"
                autoFocus
              />
            </div>
            <button
              type="submit"
              style={{ width: "100%", padding: "10px", backgroundColor: TOKENS.accent, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
            >
              Pair Camera(s)
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}