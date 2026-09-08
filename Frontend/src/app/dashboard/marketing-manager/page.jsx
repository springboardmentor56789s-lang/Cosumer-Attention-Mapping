"use client";
import React, { useState, useEffect } from "react";

// ==========================================
// DESIGN TOKENS — matched to Login.jsx
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
  dangerDim: "rgba(232,101,79,0.10)",
  success: "#5FBF77",
  successDim: "rgba(95,191,119,0.12)",
};

const fontHead = "'Space Grotesk', sans-serif";
const fontBody = "'Inter', system-ui, sans-serif";
const fontMono = "'JetBrains Mono', monospace";

const card = {
  background: TOKENS.surface,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: "14px",
  padding: "22px",
};

const eyebrow = {
  fontFamily: fontMono,
  fontSize: "11px",
  letterSpacing: "0.08em",
  color: TOKENS.muted,
  textTransform: "uppercase",
  marginBottom: "4px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: TOKENS.surface2,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: "8px",
  padding: "10px 12px",
  color: TOKENS.text,
  fontSize: "13px",
  fontFamily: fontBody,
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: TOKENS.muted,
  marginBottom: "6px",
};

const btnPrimary = {
  background: TOKENS.accent,
  color: "#1A1200",
  border: "none",
  borderRadius: "8px",
  padding: "10px 18px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: fontBody,
};

const btnGhost = {
  background: "transparent",
  color: TOKENS.text,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: "8px",
  padding: "10px 18px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: fontBody,
};

// ==========================================
// MOCK DATA
// ==========================================
const INITIAL_CAMPAIGNS = [
  { id: "C-01", name: "Summer Sale", type: "Campaign", store: "All Stores", status: "Live", budget: 120000, spend: 74000, reach: "24.1K", roi: "3.8x" },
  { id: "C-02", name: "Festival Offer", type: "Campaign", store: "Hyderabad Central", status: "Live", budget: 90000, spend: 61000, reach: "18.6K", roi: "4.6x" },
  { id: "C-03", name: "Weekend Discount", type: "Promotion", store: "Chennai Flagship", status: "Ended", budget: 40000, spend: 40000, reach: "9.4K", roi: "2.1x" },
  { id: "C-04", name: "Diwali Mega Sale", type: "Campaign", store: "All Stores", status: "Scheduled", budget: 150000, spend: 0, reach: "—", roi: "—" },
];

const STORE_LEADERBOARD = [
  { store: "Hyderabad Central", visibility: 92, attention: 88, engagement: "64%", status: "Optimal" },
  { store: "Chennai Flagship", visibility: 88, attention: 84, engagement: "59%", status: "Optimal" },
  { store: "Bangalore Hub", visibility: 85, attention: 79, engagement: "55%", status: "Optimal" },
  { store: "Westside Plaza", visibility: 71, attention: 63, engagement: "41%", status: "Needs Attention" },
];

const TOP_ATTENTION_ITEMS = [
  { item: "Beverage End-Cap Display", store: "Hyderabad Central", attentionScore: 94, avgDwell: "8.2s" },
  { item: "Festival Gift Hampers", store: "Chennai Flagship", attentionScore: 90, avgDwell: "7.4s" },
  { item: "Snack Aisle Signage", store: "Bangalore Hub", attentionScore: 82, avgDwell: "5.9s" },
  { item: "Personal Care Endcap", store: "Westside Plaza", attentionScore: 58, avgDwell: "3.1s" },
];

const AI_SUGGESTIONS = [
  "Increase signage height on beverage aisles for better eye-level attraction.",
  "Move Product A into high-traffic entrance zones during peak weekend hours.",
  "Bundle Product B and Product C to maximize impulse-purchase conversion.",
  "Westside Plaza is underperforming on attention score — consider refreshing shelf signage there.",
];

// ==========================================
// SMALL BUILDING BLOCKS
// ==========================================
function StatCard({ label, value, trend, positive }) {
  return (
    <div style={card}>
      <div style={eyebrow}>{label}</div>
      <div style={{ fontFamily: fontHead, fontSize: "26px", fontWeight: 700, marginTop: "6px" }}>{value}</div>
      {trend && (
        <div style={{ fontSize: "12px", color: positive ? TOKENS.success : TOKENS.danger, marginTop: "6px", fontFamily: fontMono }}>
          {positive ? "▲" : "▼"} {trend}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Live: { color: TOKENS.success, bg: TOKENS.successDim },
    Scheduled: { color: TOKENS.accent, bg: TOKENS.accentDim },
    Ended: { color: TOKENS.muted, bg: "rgba(138,147,166,0.12)" },
    Optimal: { color: TOKENS.success, bg: TOKENS.successDim },
    "Needs Attention": { color: TOKENS.danger, bg: TOKENS.dangerDim },
  };
  const s = map[status] || map.Ended;
  return (
    <span style={{ color: s.color, backgroundColor: s.bg, fontSize: "11px", fontFamily: fontMono, padding: "3px 9px", borderRadius: "999px", letterSpacing: "0.03em" }}>
      {status}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...card, width: "400px", maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ margin: 0, fontFamily: fontHead, fontSize: "17px", fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: TOKENS.muted, cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function MarketingManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [activeModal, setActiveModal] = useState(null); // "campaign" | "promotion" | null
  const [toast, setToast] = useState(null);
  const [userName, setUserName] = useState("Kushalini");
  const [storeOptions, setStoreOptions] = useState(["All Stores", ...STORE_LEADERBOARD.map((s) => s.store)]);

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

    fetch("http://localhost:8000/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCampaigns(data);
        }
      })
      .catch(() => {});

    fetch("http://localhost:8000/stores")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStoreOptions(["All Stores", ...data.map((s) => s.name)]);
        }
      })
      .catch(() => {});
  }, []);

  const [campaignForm, setCampaignForm] = useState({ name: "", store: "All Stores", budget: "", start: "" });
  const [promoForm, setPromoForm] = useState({ name: "", store: "All Stores", discount: "", start: "", end: "" });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!campaignForm.name.trim()) return;
    const entry = {
      id: `C-${String(campaigns.length + 1).padStart(2, "0")}`,
      name: campaignForm.name,
      type: "Campaign",
      store: campaignForm.store,
      status: "Scheduled",
      budget: Number(campaignForm.budget) || 0,
      spend: 0,
      reach: "—",
      roi: "—",
    };
    setCampaigns((prev) => [entry, ...prev]);
    
    // Save to Database
    fetch("http://localhost:8000/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: campaignForm.name,
        type: "Campaign",
        store: campaignForm.store,
        status: "Scheduled",
        budget: Number(campaignForm.budget) || 0,
        spend: 0,
        reach: "—",
        roi: "—",
        start_date: campaignForm.start,
      }),
    }).catch(() => {});

    setToast(`Campaign "${entry.name}" saved to database`);
    setCampaignForm({ name: "", store: "All Stores", budget: "", start: "" });
    setActiveModal(null);
  };

  const handleSchedulePromotion = (e) => {
    e.preventDefault();
    if (!promoForm.name.trim()) return;
    const entry = {
      id: `C-${String(campaigns.length + 1).padStart(2, "0")}`,
      name: `${promoForm.name} (${promoForm.discount || 0}% off)`,
      type: "Promotion",
      store: promoForm.store,
      status: "Scheduled",
      budget: 0,
      spend: 0,
      reach: "—",
      roi: "—",
    };
    setCampaigns((prev) => [entry, ...prev]);

    // Save to Database
    fetch("http://localhost:8000/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${promoForm.name} (${promoForm.discount || 0}% off)`,
        type: "Promotion",
        store: promoForm.store,
        status: "Scheduled",
        discount_pct: Number(promoForm.discount) || 0,
        start_date: promoForm.start,
        end_date: promoForm.end,
      }),
    }).catch(() => {});

    setToast(`Promotion "${promoForm.name}" saved to database`);
    setPromoForm({ name: "", store: "All Stores", discount: "", start: "", end: "" });
    setActiveModal(null);
  };

  const handleExportPerformanceReport = () => {
    const rows = [
      ["Campaign Performance & Store Attention Report"],
      [],
      ["Store", "Visibility Score", "Attention Score", "Engagement", "Status"],
      ...STORE_LEADERBOARD.map((s) => [s.store, s.visibility, s.attention, s.engagement, s.status]),
      [],
      ["Campaign", "Type", "Store", "Status", "Budget", "Spend", "Reach", "ROI"],
      ...campaigns.map((c) => [c.name, c.type, c.store, c.status, c.budget, c.spend, c.reach, c.roi]),
    ];
    downloadCSV(`marketing_performance_report_${Date.now()}.csv`, rows);
    setToast("Performance report exported");
  };

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", background: TOKENS.bg, color: TOKENS.text, fontFamily: fontBody, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${TOKENS.border}; border-radius: 8px; }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: TOKENS.surface, border: `1px solid ${TOKENS.success}`, color: TOKENS.text, padding: "12px 18px", borderRadius: "8px", fontSize: "13px", zIndex: 3000, boxShadow: "0 10px 25px rgba(0,0,0,0.4)" }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ width: "240px", backgroundColor: TOKENS.surface, borderRight: `1px solid ${TOKENS.border}`, padding: "24px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", flexShrink: 0, boxSizing: "border-box" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px", marginBottom: "32px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: TOKENS.accent }} />
            <div>
              <div style={{ fontFamily: fontHead, fontSize: "14px", fontWeight: 700, lineHeight: 1.1 }}>Marketing Manager</div>
              <div style={{ fontSize: "11px", color: TOKENS.muted }}>Attention Mapping Studio</div>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { id: "overview", label: "📊 Overview" },
              { id: "campaigns", label: "🎯 Campaigns" },
              { id: "stores", label: "🏪 Store Performance" },
              { id: "leakage", label: "📉 Revenue Leakage" },
              { id: "impression", label: "👁️ Impression Share" },
              { id: "reports", label: "📄 Reports & Export" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontFamily: fontBody,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: "pointer",
                  color: activeTab === tab.id ? "#1A1200" : TOKENS.muted,
                  background: activeTab === tab.id ? TOKENS.accent : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: `1px solid ${TOKENS.border}`, paddingTop: "14px", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: fontMono,
              fontSize: "10px",
              color: TOKENS.muted,
              letterSpacing: "0.06em",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: "6px",
              padding: "6px 10px",
              textAlign: "center",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: TOKENS.success }} />
              SYSTEM_ONLINE
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(232,163,61,0.2)", border: `1px solid ${TOKENS.accent}`, color: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.text, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {userName}
              </div>
              <div style={{ fontSize: "10px", color: TOKENS.success, fontWeight: 600 }}>
                ● Marketing Manager
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
              setToast("Logged out successfully");
              setTimeout(() => { window.location.href = "/login"; }, 400);
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
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* TOP BAR */}
        <header style={{ borderBottom: `1px solid ${TOKENS.border}`, padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, backgroundColor: TOKENS.surface }}>
          <div>
            <h1 style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 700, margin: 0 }}>Campaign Performance & Visibility Dashboard</h1>
            <p style={{ color: TOKENS.muted, fontSize: "12px", margin: "3px 0 0 0" }}>
              Evaluate campaign reach, product display effectiveness, and promotional ROI.
            </p>
          </div>
          <div
            style={{
              fontFamily: fontMono,
              fontSize: "11px",
              letterSpacing: "0.06em",
              color: TOKENS.accent,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: "999px",
              padding: "6px 14px",
            }}
          >
            MARKETING_MANAGER
          </div>
        </header>

        <main style={{ flex: 1, padding: "24px 32px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto", boxSizing: "border-box" }}>

          {/* ================= OVERVIEW ================= */}
          {activeTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px" }}>
                <StatCard label="Campaign Reach" value="48.5K" trend="18%" positive />
                <StatCard label="Engagement" value="64.2%" trend="6%" positive />
                <StatCard label="CTR" value="12.4%" trend="1.2%" positive />
                <StatCard label="Product Visibility" value="91/100" trend="4 pts" positive />
                <StatCard label="Attention Score" value="86/100" trend="2 pts" positive />
                <StatCard label="Marketing ROI" value="4.2x" trend="0.4x" positive />
              </div>

              {/* Quick actions */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={btnPrimary} onClick={() => setActiveModal("campaign")}>+ New Campaign</button>
                <button style={btnGhost} onClick={() => setActiveModal("promotion")}>+ Schedule Promotion</button>
                <button style={btnGhost} onClick={handleExportPerformanceReport}>⬇ Export Performance Report</button>
              </div>

              {/* Campaign ROI & Budget Burn Gauge */}
              <div style={card}>
                <div style={eyebrow}>Active Campaigns — ROI & Budget Utilization</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "14px" }}>
                  {[
                    { name: "Summer Sale 2026", roi: "3.8x", spend: "₹74,000", budget: "₹120,000", pct: 61.7, status: "Live", color: TOKENS.success },
                    { name: "Festival Festive Offer", roi: "4.6x", spend: "₹61,000", budget: "₹90,000", pct: 67.8, status: "Live", color: TOKENS.accent },
                    { name: "Weekend Flash Signage", roi: "2.1x", spend: "₹40,000", budget: "₹40,000", pct: 100, status: "Completed", color: TOKENS.info },
                  ].map((c, i) => (
                    <div key={i} style={{ padding: "14px", borderRadius: "8px", backgroundColor: TOKENS.surface2, border: `1px solid ${TOKENS.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700 }}>{c.name}</span>
                        <StatusPill status={c.status} />
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", margin: "6px 0" }}>
                        <span style={{ fontFamily: fontHead, fontSize: "22px", fontWeight: 800, color: c.color }}>{c.roi}</span>
                        <span style={{ fontSize: "11px", color: TOKENS.muted }}>ROI Multiplier</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", backgroundColor: TOKENS.bg, borderRadius: "4px", overflow: "hidden", margin: "6px 0" }}>
                        <div style={{ width: `${c.pct}%`, height: "100%", backgroundColor: c.color, borderRadius: "4px" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: TOKENS.muted, fontFamily: fontMono }}>
                        <span>Spent: {c.spend}</span>
                        <span>Budget: {c.budget} ({c.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={card}>
                  <div style={eyebrow}>Campaign Engagement Comparison</div>
                  <div style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "18px" }}>Total visual impressions generated</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "24px", height: "140px" }}>
                    {[
                      { label: "Summer Sale", value: 85 },
                      { label: "Festival Offer", value: 98 },
                      { label: "Weekend Discount", value: 62 },
                    ].map((b, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: TOKENS.muted, fontFamily: fontMono }}>{b.value}</span>
                        <div style={{ width: "100%", height: `${b.value}%`, background: TOKENS.accent, borderRadius: "6px 6px 0 0", opacity: 0.9 }} />
                        <span style={{ fontSize: "11px", color: TOKENS.muted, textAlign: "center" }}>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={card}>
                  <div style={eyebrow}>Promotion Effectiveness</div>
                  <div style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "18px" }}>Impact of digital signage installation</div>
                  <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: "100px" }}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "11px", color: TOKENS.muted }}>Before</span>
                      <div style={{ fontFamily: fontHead, fontSize: "32px", fontWeight: 700, color: TOKENS.muted }}>38%</div>
                    </div>
                    <span style={{ fontSize: "22px", color: TOKENS.success }}>→</span>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ fontSize: "11px", color: TOKENS.success }}>After</span>
                      <div style={{ fontFamily: fontHead, fontSize: "32px", fontWeight: 700, color: TOKENS.success }}>66%</div>
                      <span style={{ fontSize: "11px", color: TOKENS.success }}>+28% uplift</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                <div style={card}>
                  <div style={eyebrow}>Best Performing Stores</div>
                  <div style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "14px" }}>Campaign execution efficiency rank</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${TOKENS.border}`, color: TOKENS.muted, fontSize: "11px", fontFamily: fontMono }}>
                        <th style={{ textAlign: "left", padding: "8px 6px" }}>Store</th>
                        <th style={{ textAlign: "left", padding: "8px 6px" }}>Visibility</th>
                        <th style={{ textAlign: "left", padding: "8px 6px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STORE_LEADERBOARD.slice(0, 3).map((s, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                          <td style={{ padding: "10px 6px", fontWeight: 600 }}>#{i + 1} {s.store}</td>
                          <td style={{ padding: "10px 6px" }}>{s.visibility}%</td>
                          <td style={{ padding: "10px 6px" }}><StatusPill status={s.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={card}>
                  <div style={eyebrow}>Marketing Optimization Suggestions</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {AI_SUGGESTIONS.map((s, i) => (
                      <div key={i} style={{ fontSize: "12px", color: TOKENS.text, background: TOKENS.surface2, padding: "10px 12px", borderRadius: "8px", lineHeight: 1.5 }}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={card}>
                <div style={eyebrow}>Top Attention Zones</div>
                <div style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "14px" }}>Highest-engagement shelves and displays this week</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.border}`, color: TOKENS.muted, fontSize: "11px", fontFamily: fontMono }}>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Shelf / Display</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Store</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Attention Score</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Avg Dwell Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_ATTENTION_ITEMS.map((it, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                        <td style={{ padding: "10px 6px", fontWeight: 600 }}>{it.item}</td>
                        <td style={{ padding: "10px 6px", color: TOKENS.muted }}>{it.store}</td>
                        <td style={{ padding: "10px 6px", color: it.attentionScore >= 80 ? TOKENS.success : it.attentionScore >= 65 ? TOKENS.accent : TOKENS.danger }}>{it.attentionScore}/100</td>
                        <td style={{ padding: "10px 6px", color: TOKENS.muted }}>{it.avgDwell}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= CAMPAIGNS ================= */}
          {activeTab === "campaigns" && (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button style={btnPrimary} onClick={() => setActiveModal("campaign")}>+ New Campaign</button>
                <button style={btnGhost} onClick={() => setActiveModal("promotion")}>+ Schedule Promotion</button>
              </div>
              <div style={card}>
                <div style={eyebrow}>All Campaigns & Promotions</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.border}`, color: TOKENS.muted, fontSize: "11px", fontFamily: fontMono }}>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Name</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Type</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Store</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Budget</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Spend</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>Reach</th>
                      <th style={{ textAlign: "left", padding: "8px 6px" }}>ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                        <td style={{ padding: "10px 6px", fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: "10px 6px", color: TOKENS.muted }}>{c.type}</td>
                        <td style={{ padding: "10px 6px", color: TOKENS.muted }}>{c.store}</td>
                        <td style={{ padding: "10px 6px" }}><StatusPill status={c.status} /></td>
                        <td style={{ padding: "10px 6px" }}>₹{c.budget.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "10px 6px" }}>₹{c.spend.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "10px 6px" }}>{c.reach}</td>
                        <td style={{ padding: "10px 6px" }}>{c.roi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= STORE PERFORMANCE ================= */}
          {activeTab === "stores" && (
            <div style={card}>
              <div style={eyebrow}>Store Performance & Attention Ranking</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${TOKENS.border}`, color: TOKENS.muted, fontSize: "11px", fontFamily: fontMono }}>
                    <th style={{ textAlign: "left", padding: "8px 6px" }}>Store</th>
                    <th style={{ textAlign: "left", padding: "8px 6px" }}>Visibility Score</th>
                    <th style={{ textAlign: "left", padding: "8px 6px" }}>Attention Score</th>
                    <th style={{ textAlign: "left", padding: "8px 6px" }}>Engagement</th>
                    <th style={{ textAlign: "left", padding: "8px 6px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {STORE_LEADERBOARD.map((s, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                      <td style={{ padding: "10px 6px", fontWeight: 600 }}>#{i + 1} {s.store}</td>
                      <td style={{ padding: "10px 6px" }}>{s.visibility}%</td>
                      <td style={{ padding: "10px 6px" }}>{s.attention}%</td>
                      <td style={{ padding: "10px 6px" }}>{s.engagement}</td>
                      <td style={{ padding: "10px 6px" }}><StatusPill status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= REVENUE LEAKAGE ================= */}
          {activeTab === "leakage" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <StatCard label="Daily Revenue Leakage" value="₹21,500" trend="12%" positive={false} />
                <StatCard label="High Gaze / Low Touch" value="8 SKUs" trend="Pricing resistance" positive={false} />
                <StatCard label="Touch & Return Rate" value="34.2%" trend="3.1%" positive={false} />
                <StatCard label="Recoverable Opportunity" value="₹14,800" trend="High recovery" positive={true} />
              </div>

              <div style={card}>
                <div style={eyebrow}>Friction Point Analysis — Shelf & Display Leakage</div>
                <p style={{ color: TOKENS.muted, fontSize: "12px", margin: "4px 0 14px 0" }}>
                  Discrepancy between visual attraction and transactional conversion indicating packaging or pricing friction.
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.border}`, color: TOKENS.muted, fontSize: "11px", fontFamily: fontMono, textAlign: "left" }}>
                      <th style={{ padding: "10px 8px" }}>SKU / Display</th>
                      <th style={{ padding: "10px 8px" }}>Friction Type</th>
                      <th style={{ padding: "10px 8px" }}>Gaze Count</th>
                      <th style={{ padding: "10px 8px" }}>Touch Rate</th>
                      <th style={{ padding: "10px 8px" }}>Conversion</th>
                      <th style={{ padding: "10px 8px" }}>Est. Daily Loss</th>
                      <th style={{ padding: "10px 8px" }}>Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { item: "Premium Headphones Endcap", type: "High Gaze / Low Touch", gaze: 284, touch: "12%", conv: "4%", loss: "₹5,400", action: "Reduce Price Point by 8% or offer EMI", color: TOKENS.accent },
                      { item: "Organic Beverages Shelf B", type: "High Gaze / Low Touch", gaze: 198, touch: "18%", conv: "6%", loss: "₹3,800", action: "Add Price Tag Visibility & Health Badges", color: TOKENS.accent },
                      { item: "Festival Gift Hamper Stack", type: "Touch & Return (No Buy)", gaze: 312, touch: "45%", conv: "8%", loss: "₹4,200", action: "Bundle with Discount Ribbon & Gift Wrap", color: TOKENS.info },
                      { item: "Snack Rack A End Section", type: "Low Dwell Dead Zone", gaze: 48, touch: "6%", conv: "2%", loss: "₹2,100", action: "Relocate to Eye-Level Golden Zone", color: TOKENS.danger },
                      { item: "Personal Care Aisle 4", type: "Touch & Return (No Buy)", gaze: 156, touch: "38%", conv: "11%", loss: "₹2,000", action: "Deploy Staff Demo / Sample Testers", color: TOKENS.info },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                        <td style={{ padding: "12px 8px", fontWeight: 700 }}>{row.item}</td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${row.color}`, color: row.color, fontSize: "10px", fontWeight: 700 }}>
                            {row.type}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px", fontFamily: fontMono }}>{row.gaze}</td>
                        <td style={{ padding: "12px 8px" }}>{row.touch}</td>
                        <td style={{ padding: "12px 8px" }}>{row.conv}</td>
                        <td style={{ padding: "12px 8px", fontWeight: 800, color: TOKENS.danger }}>{row.loss}</td>
                        <td style={{ padding: "12px 8px", color: TOKENS.accent }}>{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= IMPRESSION SHARE ================= */}
          {activeTab === "impression" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <StatCard label="Golden Zone Utilization" value="54.2%" trend="4.8%" positive={true} />
                <StatCard label="Total Eye-Level Impressions" value="14,820" trend="18%" positive={true} />
                <StatCard label="Avg Fixation Duration" value="5.8s" trend="0.6s" positive={true} />
                <StatCard label="Top Sponsor Share" value="24.1%" trend="Sparkling Energy" positive={true} />
              </div>

              <div style={card}>
                <div style={eyebrow}>Brand Share of Eye-Level Golden Zone Shelf (140-180cm)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
                  {[
                    { brand: "Sparkling Citrus Energy", share: "24.1%", impressions: "3,576", width: "24.1%", color: TOKENS.danger },
                    { brand: "Nature Valley Organics", share: "18.3%", impressions: "2,714", width: "18.3%", color: TOKENS.accent },
                    { brand: "CrunchPro Snacks", share: "15.7%", impressions: "2,327", width: "15.7%", color: TOKENS.info },
                    { brand: "Dairy Fresh Pro", share: "12.9%", impressions: "1,914", width: "12.9%", color: TOKENS.success },
                    { brand: "Other Store Brands", share: "29.0%", impressions: "4,300", width: "29.0%", color: TOKENS.muted },
                  ].map((b, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ fontWeight: 700 }}>{b.brand}</span>
                        <span style={{ fontFamily: fontMono, color: TOKENS.muted }}>{b.share} ({b.impressions} visual impressions)</span>
                      </div>
                      <div style={{ width: "100%", height: "12px", backgroundColor: TOKENS.surface2, borderRadius: "6px", overflow: "hidden" }}>
                        <div style={{ width: b.width, height: "100%", backgroundColor: b.color, borderRadius: "6px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={card}>
                <div style={eyebrow}>Campaign Endcap Visibility at Eye-Level</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginTop: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.border}`, color: TOKENS.muted, fontSize: "11px", fontFamily: fontMono, textAlign: "left" }}>
                      <th style={{ padding: "10px 8px" }}>Campaign Display</th>
                      <th style={{ padding: "10px 8px" }}>Shelf Location</th>
                      <th style={{ padding: "10px 8px" }}>Visibility Score</th>
                      <th style={{ padding: "10px 8px" }}>Avg Dwell</th>
                      <th style={{ padding: "10px 8px" }}>Total Impressions</th>
                      <th style={{ padding: "10px 8px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { campaign: "Summer Sale Endcap", location: "Grocery Aisle 3 — Eye Level", score: 92, dwell: "6.2s", imp: "2,840", status: "Optimal" },
                      { campaign: "Festival Gift Display", location: "Entrance End-Cap — Eye Level", score: 88, dwell: "7.4s", imp: "2,450", status: "Optimal" },
                      { campaign: "Weekend Flash Signage", location: "Checkout Counter — Eye Level", score: 71, dwell: "3.8s", imp: "1,820", status: "Needs Improvement" },
                      { campaign: "Diwali Mega Sale Banner", location: "Electronics Showcase — Overhead", score: 56, dwell: "2.1s", imp: "980", status: "Poor Placement" },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                        <td style={{ padding: "12px 8px", fontWeight: 700 }}>{row.campaign}</td>
                        <td style={{ padding: "12px 8px", color: TOKENS.muted }}>{row.location}</td>
                        <td style={{ padding: "12px 8px", fontWeight: 800, color: row.score >= 80 ? TOKENS.success : row.score >= 70 ? TOKENS.accent : TOKENS.danger }}>{row.score}/100</td>
                        <td style={{ padding: "12px 8px", fontFamily: fontMono }}>{row.dwell}</td>
                        <td style={{ padding: "12px 8px", fontFamily: fontMono }}>{row.imp}</td>
                        <td style={{ padding: "12px 8px" }}><StatusPill status={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= REPORTS ================= */}
          {activeTab === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 700, margin: 0 }}>📑 Marketing Intelligence Reports & Exports</h2>
                  <p style={{ color: TOKENS.muted, margin: "4px 0 0 0", fontSize: "12px" }}>
                    Export campaigns, store visibility, and golden zone share as CSV or print as PDF.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", backgroundColor: "rgba(232,163,61,0.15)", border: `1px solid ${TOKENS.accent}`, color: TOKENS.accent, borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                >
                  📄 Export / Print as PDF
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {[
                  {
                    title: "Campaign Performance Report",
                    desc: "Budget, spend, reach and ROI across all campaigns and promotions.",
                    action: () =>
                      downloadCSV(`campaign_report_${Date.now()}.csv`, [
                        ["Campaign", "Type", "Store", "Status", "Budget", "Spend", "Reach", "ROI"],
                        ...campaigns.map((c) => [c.name, c.type, c.store, c.status, c.budget, c.spend, c.reach, c.roi]),
                      ]),
                  },
                  {
                    title: "Store Visibility Report",
                    desc: "Visibility, engagement and attention ranking by store.",
                    action: () =>
                      downloadCSV(`store_visibility_report_${Date.now()}.csv`, [
                        ["Store", "Visibility Score", "Attention Score", "Engagement", "Status"],
                        ...STORE_LEADERBOARD.map((s) => [s.store, s.visibility, s.attention, s.engagement, s.status]),
                      ]),
                  },
                  {
                    title: "Attention Analytics Report",
                    desc: "Highest-engagement shelves and displays with dwell time.",
                    action: () =>
                      downloadCSV(`attention_analytics_report_${Date.now()}.csv`, [
                        ["Shelf / Display", "Store", "Attention Score", "Avg Dwell Time"],
                        ...TOP_ATTENTION_ITEMS.map((it) => [it.item, it.store, it.attentionScore, it.avgDwell]),
                      ]),
                  },
                  {
                    title: "Revenue Leakage Analysis CSV",
                    desc: "Catalog of merchandising friction points with estimated daily loss.",
                    action: () =>
                      downloadCSV(`revenue_leakage_${Date.now()}.csv`, [
                        ["SKU / Display", "Friction Type", "Gaze Count", "Touch Rate", "Conversion", "Daily Loss", "Action"],
                        ["Premium Headphones Endcap", "High Gaze / Low Touch", "284", "12%", "4%", "5400", "Reduce Price Point"],
                        ["Organic Beverages Shelf B", "High Gaze / Low Touch", "198", "18%", "6%", "3800", "Add Price Tag Visibility"],
                        ["Festival Gift Hamper Stack", "Touch & Return", "312", "45%", "8%", "4200", "Bundle with Discount Tag"],
                      ]),
                  },
                  {
                    title: "Golden Zone Impression Share CSV",
                    desc: "Brand visibility share at the eye-level shelf tier (140-180cm).",
                    action: () =>
                      downloadCSV(`impression_share_${Date.now()}.csv`, [
                        ["Brand", "SharePct", "VisualImpressions"],
                        ["Sparkling Citrus Energy", "24.1%", "3576"],
                        ["Nature Valley Organics", "18.3%", "2714"],
                        ["CrunchPro Snacks", "15.7%", "2327"],
                        ["Dairy Fresh Pro", "12.9%", "1914"],
                        ["Other Store Brands", "29.0%", "4300"],
                      ]),
                  },
                ].map((r, i) => (
                  <div key={i} style={card}>
                    <div style={{ fontFamily: fontHead, fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>{r.title}</div>
                    <div style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "18px", lineHeight: 1.5 }}>{r.desc}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        style={btnGhost}
                        onClick={() => {
                          r.action();
                          setToast(`${r.title} downloaded`);
                        }}
                      >
                        ⬇ Download CSV
                      </button>
                      <button
                        onClick={() => window.print()}
                        style={{ padding: "8px 14px", backgroundColor: "transparent", border: `1px solid ${TOKENS.border}`, color: TOKENS.text, borderRadius: "8px", fontWeight: 600, fontSize: "11px", cursor: "pointer", width: "100%" }}
                      >
                        📄 Save as PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}
      {activeModal === "campaign" && (
        <Modal title="New Campaign" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleCreateCampaign}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Campaign Name</label>
              <input style={inputStyle} value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="e.g. New Year Bonanza" autoFocus />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store Scope</label>
              <select style={inputStyle} value={campaignForm.store} onChange={(e) => setCampaignForm({ ...campaignForm, store: e.target.value })}>
                {storeOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Budget (₹)</label>
                <input type="number" min="0" style={inputStyle} value={campaignForm.budget} onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })} placeholder="100000" />
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" style={inputStyle} value={campaignForm.start} onChange={(e) => setCampaignForm({ ...campaignForm, start: e.target.value })} />
              </div>
            </div>
            <button type="submit" style={{ ...btnPrimary, width: "100%" }}>Create Campaign</button>
          </form>
        </Modal>
      )}

      {activeModal === "promotion" && (
        <Modal title="Schedule Promotion" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSchedulePromotion}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Promotion Name</label>
              <input style={inputStyle} value={promoForm.name} onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })} placeholder="e.g. Weekend Flash Sale" autoFocus />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store Scope</label>
              <select style={inputStyle} value={promoForm.store} onChange={(e) => setPromoForm({ ...promoForm, store: e.target.value })}>
                {storeOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Discount %</label>
                <input type="number" min="0" max="100" style={inputStyle} value={promoForm.discount} onChange={(e) => setPromoForm({ ...promoForm, discount: e.target.value })} placeholder="20" />
              </div>
              <div>
                <label style={labelStyle}>Start</label>
                <input type="date" style={inputStyle} value={promoForm.start} onChange={(e) => setPromoForm({ ...promoForm, start: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>End</label>
                <input type="date" style={inputStyle} value={promoForm.end} onChange={(e) => setPromoForm({ ...promoForm, end: e.target.value })} />
              </div>
            </div>
            <button type="submit" style={{ ...btnPrimary, width: "100%" }}>Schedule Promotion</button>
          </form>
        </Modal>
      )}
    </div>
  );
}