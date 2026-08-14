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
  surface: "#131A27",
  surface2: "#1B2333",
  border: "#232C40",
  accent: "#E8A33D",
  accentDim: "rgba(232,163,61,0.14)",
  text: "#EDEFF3",
  muted: "#8A93A6",
  danger: "#E8654F",
  success: "#3FBF7F",
};

const fontDisplay = "'Space Grotesk', sans-serif";
const fontBody = "'Inter', system-ui, sans-serif";
const fontMono = "'JetBrains Mono', monospace";

const cardStyle = {
  background: TOKENS.surface,
  borderRadius: "16px",
  border: `1px solid ${TOKENS.border}`,
  padding: "24px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: TOKENS.surface2,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: "8px",
  padding: "11px 14px",
  color: TOKENS.text,
  fontFamily: fontBody,
  fontSize: "14px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  color: TOKENS.muted,
  marginBottom: "6px",
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
  border: variant === "solid" ? "none" : `1px solid ${TOKENS.border}`,
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
    <div style={{ ...cardStyle, padding: "18px" }}>
      <div style={{ ...eyebrowStyle }}>{label}</div>
      <div style={{ fontFamily: fontDisplay, fontSize: "24px", fontWeight: 700, marginTop: "8px", color: TOKENS.text }}>
        {value}
      </div>
      {trend && (
        <div style={{ fontFamily: fontMono, fontSize: "11px", marginTop: "6px", color: isPositive ? TOKENS.success : TOKENS.danger }}>
          {isPositive ? "▲" : "▼"} {trend}
        </div>
      )}
    </div>
  );
}

function Card({ title, subtitle, children, headerRight }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: "16px", fontWeight: 600, color: TOKENS.text }}>{title}</h3>
          {subtitle && <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: TOKENS.muted }}>{subtitle}</p>}
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function Badge({ status }) {
  const online = status === "Online" || status === "Active";
  const color = online ? TOKENS.success : status === "Reported" ? TOKENS.accent : TOKENS.danger;
  return (
    <span style={{ fontFamily: fontMono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", color }}>
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
    <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "160px", padding: "10px 0", borderBottom: `1px solid ${TOKENS.border}` }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", height: "100%", justifyContent: "flex-end" }}>
          <span style={{ fontFamily: fontMono, fontSize: "10px", color: TOKENS.muted }}>{d.value}</span>
          <div
            style={{
              width: "100%",
              height: `${(d.value / max) * 100}%`,
              background: d.color || TOKENS.accent,
              borderRadius: "3px 3px 0 0",
              minHeight: "4px",
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
      style={{ position: "fixed", inset: 0, background: "rgba(11,15,23,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: "380px", maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: "16px", fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Shell matching the login page: same background, border, font stack, and the
// SYSTEM_ONLINE pill treatment reused as a page-level status indicator.
function DashboardLayout({ role, notifications, isNotifyOpen, setIsNotifyOpen, children }) {
  return (
    <div style={{ background: TOKENS.bg, color: TOKENS.text, minHeight: "100vh", fontFamily: fontBody, display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>
      <header
        style={{
          background: TOKENS.surface,
          borderBottom: `1px solid ${TOKENS.border}`,
          padding: "16px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: fontDisplay, fontSize: "18px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              Consumer Attention Mapping System
            </h1>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", ...eyebrowStyle, marginTop: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: TOKENS.accent }} />
              {role.toUpperCase()}_DASHBOARD
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsNotifyOpen(!isNotifyOpen)}
          style={{ position: "relative", background: "none", border: `1px solid ${TOKENS.border}`, borderRadius: "8px", cursor: "pointer", fontSize: "16px", color: TOKENS.text, padding: "8px 12px" }}
        >
          Alerts
          {notifications.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: TOKENS.danger,
                color: "#fff",
                fontFamily: fontMono,
                fontSize: "10px",
                borderRadius: "9999px",
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
              }}
            >
              {notifications.length}
            </span>
          )}
        </button>
      </header>
      <main style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>{children}</main>
    </div>
  );
}

// ==========================================
// FALLBACK DATA — used only if /stores fails so the page is never blank
// ==========================================
const FALLBACK_STORES = [
  { id: 101, name: "Store #101", location: "Downtown Hyderabad" },
  { id: 102, name: "Store #102", location: "Jubilee Hills" },
];

const INITIAL_CAMERAS = [
  { id: "CAM-01", name: "Entrance", status: "Online", health: "98%" },
  { id: "CAM-02", name: "Aisle 1", status: "Online", health: "95%" },
  { id: "CAM-03", name: "Checkout", status: "Offline", health: "0%" },
];

export default function StoreManagerDashboard() {
  const [stores, setStores] = useState(FALLBACK_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState(FALLBACK_STORES[0].id);
  const [authError, setAuthError] = useState("");
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError("Not signed in — showing sample data. Sign in to see your real stores.");
      return;
    }
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

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Camera offline: CAM-03 (Checkout)" },
    { id: 2, title: "Crowded zone: Entrance aisle density exceeded threshold" },
  ]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const pushNotification = (title) => setNotifications((prev) => [{ id: Date.now(), title }, ...prev]);
  const dismissNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

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
    <DashboardLayout role="Store Manager" notifications={notifications} isNotifyOpen={isNotifyOpen} setIsNotifyOpen={setIsNotifyOpen}>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: TOKENS.surface,
            border: `1px solid ${TOKENS.success}`,
            color: TOKENS.text,
            padding: "12px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            zIndex: 3000,
          }}
        >
          {toast}
        </div>
      )}

      {isNotifyOpen && (
        <div
          style={{
            position: "fixed",
            top: "68px",
            right: "24px",
            width: "320px",
            background: TOKENS.surface,
            border: `1px solid ${TOKENS.border}`,
            borderRadius: "12px",
            padding: "18px",
            zIndex: 1000,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: `1px solid ${TOKENS.border}`, paddingBottom: "10px" }}>
            <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: "14px", fontWeight: 600 }}>Notifications</h3>
            <button onClick={() => setIsNotifyOpen(false)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer" }}>✕</button>
          </div>
          {notifications.length === 0 ? (
            <div style={{ fontSize: "13px", color: TOKENS.muted }}>You're all caught up.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", padding: "10px 0", borderBottom: `1px solid ${TOKENS.border}` }}>
                <div style={{ fontSize: "13px" }}>{n.title}</div>
                <button onClick={() => dismissNotification(n.id)} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer", fontSize: "11px", flexShrink: 0 }}>
                  Dismiss
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: fontDisplay, fontSize: "26px", fontWeight: 700, margin: 0 }}>Store Command Center</h1>
          <p style={{ color: TOKENS.muted, margin: "6px 0 0 0", fontSize: "14px" }}>
            Live camera feeds, floor traffic, and shelf attention for your store.
          </p>
        </div>
        <select
          style={{ ...inputStyle, width: "auto", fontWeight: 600 }}
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(Number(e.target.value) || e.target.value)}
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.location ? ` — ${s.location}` : ""}
            </option>
          ))}
        </select>
      </div>

      {usingFallback && authError && (
        <div
          style={{
            fontSize: "13px",
            color: TOKENS.accent,
            background: TOKENS.accentDim,
            border: `1px solid ${TOKENS.border}`,
            borderRadius: "8px",
            padding: "12px 16px",
          }}
        >
          {authError}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
        <StatCard label="Visitors Today" value="1,420" trend="14%" isPositive />
        <StatCard label="Avg Dwell Time" value="4m 12s" trend="5%" isPositive />
        <StatCard label="Conversion Rate" value="24.8%" trend="2.1%" isPositive />
        <StatCard label="Active Cameras" value={`${activeCameraCount}/${cameras.length}`} />
        <StatCard label="Attention Score" value="88/100" trend="3 pts" isPositive />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <Card title="Hourly Store Traffic" subtitle="Footfall trends across operating hours">
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
        <Card title="Shelf Performance" subtitle="Attention vs interaction density">
          <BarChartVisual
            data={[
              { label: "Shelf A", value: 92, color: TOKENS.success },
              { label: "Shelf B", value: 45, color: TOKENS.danger },
              { label: "Shelf C", value: 78, color: TOKENS.accent },
              { label: "Shelf D", value: 64 },
            ]}
          />
        </Card>
      </div>

      {/* Live cameras + detection */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card title="Live Attention Heatmap" subtitle="Overlay of consumer focal points">
            <div
              style={{
                height: "220px",
                borderRadius: "12px",
                background: `radial-gradient(circle at 30% 40%, ${TOKENS.accentDim} 0%, rgba(232,163,61,0.06) 45%, transparent 70%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${TOKENS.border}`,
              }}
            >
              <span
                style={{
                  fontFamily: fontMono,
                  fontSize: "12px",
                  letterSpacing: "0.06em",
                  background: TOKENS.surface2,
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  border: `1px solid ${TOKENS.border}`,
                  color: TOKENS.accent,
                }}
              >
                LIVE_THERMAL_STREAM
              </span>
            </div>
          </Card>

          <Card title="Shelf Attention Detection" subtitle={`Upload footage from ${selectedStore?.name || "your store"} and run detection`}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
              <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={isProcessing} style={{ ...inputStyle, width: "auto", padding: "9px 10px" }} />
              <button
                onClick={handleRunDetection}
                disabled={!videoFile || isProcessing}
                style={{
                  padding: "11px 18px",
                  background: !videoFile || isProcessing ? TOKENS.surface2 : TOKENS.accent,
                  color: !videoFile || isProcessing ? TOKENS.muted : "#1A1200",
                  border: "none",
                  borderRadius: "8px",
                  fontFamily: fontBody,
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: !videoFile || isProcessing ? "not-allowed" : "pointer",
                }}
              >
                {isProcessing ? `Detecting… ${progress}%` : "Run detection"}
              </button>
            </div>
            {detectionSummary && (
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ background: TOKENS.surface2, padding: "12px 18px", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontFamily: fontDisplay, fontSize: "20px", fontWeight: 700, color: TOKENS.accent }}>{detectionSummary.peak}</div>
                  <div style={{ fontSize: "11px", color: TOKENS.muted }}>Peak Count</div>
                </div>
                <div style={{ background: TOKENS.surface2, padding: "12px 18px", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontFamily: fontDisplay, fontSize: "20px", fontWeight: 700 }}>{detectionSummary.avg}</div>
                  <div style={{ fontSize: "11px", color: TOKENS.muted }}>Average Count</div>
                </div>
              </div>
            )}
          </Card>

          <Card title="Live Camera Status">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {cameras.map((c) => (
                <div key={c.id} style={{ padding: "14px", borderRadius: "10px", border: `1px solid ${TOKENS.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{c.name}</span>
                    <Badge status={c.status} />
                  </div>
                  <span style={{ fontFamily: fontMono, fontSize: "11px", color: TOKENS.muted }}>SIGNAL {c.health}</span>
                  {c.status !== "Reported" && (
                    <button onClick={() => setReportModalCam(c)} style={{ ...smallBtn("ghost"), alignSelf: "flex-start", marginTop: "2px" }}>
                      Report issue
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AIInsightCard title="Recommendations for your store" recommendations={recommendations} />
        </div>
      </div>

      {reportModalCam && (
        <Modal title={`Report issue — ${reportModalCam.name}`} onClose={() => setReportModalCam(null)}>
          <form onSubmit={handleSubmitReport}>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>What's wrong?</label>
              <textarea
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical", fontFamily: fontBody }}
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder="e.g. Feed frozen since 2:15 PM"
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
                fontFamily: fontBody,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Submit report
            </button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}