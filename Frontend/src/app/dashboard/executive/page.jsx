"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const TOKENS = {
  bg: "#0B0F17",
  sidebarBg: "#131A27",
  cardBg: "#131A27",
  cardBorder: "#232C40",
  surface2: "#1B2333",
  accent: "#E8A33D",
  text: "#EDEFF3",
  muted: "#8A93A6",
  danger: "#E8654F",
  success: "#5FAE86",
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

const eyebrowStyle = {
  fontFamily: fontMono,
  fontSize: "11px",
  letterSpacing: "0.08em",
  color: TOKENS.accent,
  textTransform: "uppercase",
};

function StatCard({ label, value, trend, isPositive, subtext, accentColor }) {
  return (
    <div style={{ ...cardStyle, padding: "16px 20px" }}>
      <div style={{ ...eyebrowStyle, color: accentColor || TOKENS.accent }}>{label}</div>
      <div style={{ fontFamily: fontDisplay, fontSize: "24px", fontWeight: 700, marginTop: "6px", color: TOKENS.text }}>
        {value}
      </div>
      {trend && (
        <div style={{ fontFamily: fontMono, fontSize: "11px", marginTop: "6px", color: isPositive ? TOKENS.success : TOKENS.danger, fontWeight: 600 }}>
          {isPositive ? "▲" : "▼"} {trend} {subtext && <span style={{ color: TOKENS.muted, fontWeight: 400 }}>· {subtext}</span>}
        </div>
      )}
      {!trend && subtext && (
        <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "6px" }}>{subtext}</div>
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

const CHAIN_STORES = [
  { id: 1, name: "Vizag Central Mall Store", location: "Visakhapatnam", footfall: "18,420", attentionScore: 92, conversion: "24.8%", revenue: "₹14.2L", leakage: "₹18,400", status: "Leader" },
  { id: 2, name: "Beach Road Outlet", location: "Visakhapatnam", footfall: "14,890", attentionScore: 88, conversion: "21.4%", revenue: "₹10.8L", leakage: "₹24,100", status: "Optimal" },
  { id: 3, name: "Downtown Flagship Store", location: "Hyderabad", footfall: "22,400", attentionScore: 94, conversion: "26.2%", revenue: "₹19.6L", leakage: "₹15,200", status: "Leader" },
  { id: 4, name: "Westside Hub", location: "Chennai", footfall: "11,200", attentionScore: 74, conversion: "17.1%", revenue: "₹7.4L", leakage: "₹38,500", status: "Needs Support" },
];

export default function ExecutiveDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // overview | benchmarking | golden_zone | strategic | reports
  const [toast, setToast] = useState(null);
  const [userName, setUserName] = useState("Kushalini");
  const [chainStores, setChainStores] = useState(CHAIN_STORES);

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
          // Merge API stores with benchmark metrics
          const merged = res.data.map((dbStore, idx) => {
            const fallback = CHAIN_STORES[idx % CHAIN_STORES.length];
            return {
              id: dbStore.id,
              name: dbStore.name,
              location: dbStore.location || fallback.location,
              footfall: fallback.footfall,
              attentionScore: fallback.attentionScore,
              conversion: fallback.conversion,
              revenue: fallback.revenue,
              leakage: fallback.leakage,
              status: fallback.status,
            };
          });
          setChainStores(merged);
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

  const handleDownloadReport = (name, rows) => {
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}_${Date.now()}.csv`;
    a.click();
    setToast(`${name} exported`);
  };

  return (
    <div style={{ backgroundColor: TOKENS.bg, height: "100vh", width: "100vw", overflow: "hidden", color: TOKENS.text, fontFamily: fontBody, display: "flex", flexDirection: "column" }}>
      
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", backgroundColor: TOKENS.cardBg, border: `1px solid ${TOKENS.success}`, color: TOKENS.text, padding: "12px 20px", borderRadius: "8px", zIndex: 9999, boxShadow: "0 4px 14px rgba(0,0,0,0.6)", fontSize: "13px" }}>
          ✅ {toast}
        </div>
      )}

      {/* HEADER BAR */}
      <header style={{ height: "64px", flexShrink: 0, width: "100%", backgroundColor: TOKENS.sidebarBg, borderBottom: `1px solid ${TOKENS.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", zIndex: 100, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: TOKENS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#1A1200", fontSize: "16px" }}>
            🏛️
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>Executive Leadership Dashboard</div>
            <div style={{ fontSize: "11px", color: TOKENS.muted, fontFamily: fontMono }}>MILESTONE 4 · C-SUITE RETAIL INTELLIGENCE</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontFamily: fontMono, fontSize: "11px", color: TOKENS.accent, border: `1px solid ${TOKENS.cardBorder}`, padding: "6px 14px", borderRadius: "999px" }}>
            PORTFOLIO SCOPE: 4 STORES ACTIVE
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 64px)", overflow: "hidden", width: "100%" }}>
        
        {/* SIDEBAR NAVIGATION */}
        <aside style={{ width: "240px", backgroundColor: TOKENS.sidebarBg, borderRight: `1px solid ${TOKENS.cardBorder}`, padding: "20px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", flexShrink: 0, boxSizing: "border-box" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
            {[
              { id: "overview", label: "Network Overview", icon: "🏛️" },
              { id: "benchmarking", label: "Store Benchmarking", icon: "🏢" },
              { id: "golden_zone", label: "Golden Zone Monetization", icon: "👁️" },
              { id: "strategic", label: "Strategic AI Directives", icon: "🎯" },
              { id: "reports", label: "Board Reports & Export", icon: "📄" },
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

          {/* USER FOOTER & LOG OUT */}
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
                  ● Chief Executive / Leadership
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
            >
              <span>🚪</span>
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* SCROLLABLE MAIN CONTENT */}
        <main style={{ flex: 1, height: "100%", padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>
          
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <StatCard label="Total Network Footfall" value="66,910" trend="12.4%" isPositive subtext="Across 4 Regional Outlets" />
                <StatCard label="Portfolio Attention Index" value="88.2 / 100" trend="3.2 pts" isPositive subtext="Benchmark High" />
                <StatCard label="Chain Conversion Rate" value="23.8%" trend="1.8%" isPositive subtext="Industry Avg: 19.5%" />
                <StatCard label="Systemic Revenue Leakage" value="₹96,200" trend="-8.4%" isPositive={false} accentColor={TOKENS.danger} subtext="Daily OOS & Pricing Friction" />
              </div>

              {/* Chain Revenue Summary & Store Comparison */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
                <Card title="Chain-Wide Revenue vs. Attention Matrix" subtitle="Mapping store revenue generation against consumer gaze density">
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
                    {chainStores.map((st) => (
                      <div key={st.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                          <span style={{ fontWeight: 700 }}>{st.name} ({st.location})</span>
                          <span style={{ fontFamily: fontMono, color: TOKENS.accent, fontWeight: 700 }}>{st.revenue} · Attn: {st.attentionScore}%</span>
                        </div>
                        <div style={{ width: "100%", backgroundColor: TOKENS.surface2, height: "12px", borderRadius: "6px", overflow: "hidden" }}>
                          <div style={{ width: `${st.attentionScore}%`, height: "100%", background: st.status === "Leader" ? "linear-gradient(90deg, #5FAE86, #E8A33D)" : TOKENS.info, borderRadius: "6px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="🏛️ C-Suite Executive Summary" subtitle="Automated leadership briefing">
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                    {[
                      { icon: "📈", title: "Flagship Stores Outperforming", text: "Hyderabad and Vizag Central Mall show +18% higher basket sizes due to optimal Golden Zone eye-level compliance." },
                      { icon: "⚠️", title: "Chennai Westside Action Required", text: "High traffic (11.2K) but lagging conversion (17.1%) points to aisle bottleneck in Apparel zone." },
                      { icon: "💡", title: "FMCG Brand Sponsorship Revenue", text: "Brand eye-level impression share increased by 28%, opening ₹18L/quarter incremental vendor fee opportunity." },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: "12px", borderRadius: "8px", backgroundColor: TOKENS.surface2, border: `1px solid ${TOKENS.cardBorder}` }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.accent, display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{item.icon}</span>
                          <span>{item.title}</span>
                        </div>
                        <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: TOKENS.muted, lineHeight: 1.5 }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ================= TAB 2: STORE BENCHMARKING ================= */}
          {activeTab === "benchmarking" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Card title="🏢 Comprehensive Regional Store Performance Leaderboard" subtitle="Cross-outlet operational benchmarking across traffic, attention, revenue and leakage">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted, fontSize: "11px", fontFamily: fontMono, textAlign: "left" }}>
                      <th style={{ padding: "10px 8px" }}>Store Name</th>
                      <th style={{ padding: "10px 8px" }}>City / Location</th>
                      <th style={{ padding: "10px 8px" }}>Footfall</th>
                      <th style={{ padding: "10px 8px" }}>Attention Score</th>
                      <th style={{ padding: "10px 8px" }}>Conversion</th>
                      <th style={{ padding: "10px 8px" }}>Daily Revenue</th>
                      <th style={{ padding: "10px 8px" }}>Revenue at Risk</th>
                      <th style={{ padding: "10px 8px" }}>Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chainStores.map((st) => (
                      <tr key={st.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                        <td style={{ padding: "14px 8px", fontWeight: 700 }}>{st.name}</td>
                        <td style={{ padding: "14px 8px", color: TOKENS.muted }}>{st.location}</td>
                        <td style={{ padding: "14px 8px", fontFamily: fontMono }}>{st.footfall}</td>
                        <td style={{ padding: "14px 8px", fontWeight: 800, color: st.attentionScore >= 90 ? TOKENS.success : TOKENS.accent }}>{st.attentionScore}/100</td>
                        <td style={{ padding: "14px 8px", fontWeight: 700 }}>{st.conversion}</td>
                        <td style={{ padding: "14px 8px", color: TOKENS.accent, fontWeight: 700 }}>{st.revenue}</td>
                        <td style={{ padding: "14px 8px", color: TOKENS.danger, fontWeight: 700 }}>{st.leakage}</td>
                        <td style={{ padding: "14px 8px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "4px", backgroundColor: st.status === "Leader" ? "rgba(95,174,134,0.2)" : st.status === "Optimal" ? "rgba(232,163,61,0.2)" : "rgba(232,101,79,0.2)", color: st.status === "Leader" ? TOKENS.success : st.status === "Optimal" ? TOKENS.accent : TOKENS.danger }}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ================= TAB 3: GOLDEN ZONE MONETIZATION ================= */}
          {activeTab === "golden_zone" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <StatCard label="Network Eye-Level Share" value="58.4%" trend="6.2%" isPositive subtext="Golden Zone (140-180cm)" />
                <StatCard label="Brand Fee Monetization" value="₹24.8 Lakhs" trend="18.2%" isPositive subtext="Quarterly Sponsor Revenue" />
                <StatCard label="Empty Void Gap Impact" value="₹1.4 Lakhs" accentColor={TOKENS.danger} subtext="Chain OOS Revenue Lost" />
              </div>

              <Card title="👁️ Chain-Wide Eye-Level Shelf Real Estate Monetization" subtitle="Evaluating how efficiently high-conversion shelf tiers are allocated to high-margin SKUs">
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                  {[
                    { category: "Beverages & Energy Drinks", goldenShare: 78, margin: "High (38%)", revenueUplift: "+24.2%", color: TOKENS.success },
                    { category: "Packaged Snacks & Confectionery", goldenShare: 64, margin: "High (32%)", revenueUplift: "+18.6%", color: TOKENS.accent },
                    { category: "Electronics & Accessories", goldenShare: 82, margin: "Premium (44%)", revenueUplift: "+31.0%", color: TOKENS.info },
                    { category: "Personal Care & Grooming", goldenShare: 42, margin: "Medium (22%)", revenueUplift: "+8.4%", color: TOKENS.danger },
                  ].map((cat, i) => (
                    <div key={i} style={{ padding: "14px", borderRadius: "8px", backgroundColor: TOKENS.surface2, border: `1px solid ${TOKENS.cardBorder}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>{cat.category}</span>
                        <span style={{ fontSize: "12px", color: TOKENS.accent, fontWeight: 700 }}>Margin: {cat.margin}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                        <div style={{ flex: 1, height: "10px", backgroundColor: TOKENS.bg, borderRadius: "5px", overflow: "hidden" }}>
                          <div style={{ width: `${cat.goldenShare}%`, height: "100%", backgroundColor: cat.color, borderRadius: "5px" }} />
                        </div>
                        <span style={{ fontFamily: fontMono, fontSize: "12px", fontWeight: 700 }}>{cat.goldenShare}% Eye-Level Allocation</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ================= TAB 4: STRATEGIC DIRECTIVES ================= */}
          {activeTab === "strategic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Card title="🎯 Strategic Capital & Floor Layout Directives" subtitle="High-level corporate initiatives prioritized by projected ROI and revenue impact">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginTop: "14px" }}>
                  {[
                    { priority: "CRITICAL", title: "Aisle Reconfiguration — Westside Hub", desc: "Apparel section dwell-to-cart ratio has fallen below 12%. Reconfigure aisle headers to wide-pathway layout to alleviate crowd friction.", roi: "Estimated +₹4.2L Monthly Lift" },
                    { priority: "HIGH", title: "Automated Planogram Audits via Ceiling Cams", desc: "Deploy YOLOv8 + ByteTrack multi-camera homography sync across Beach Road store to reduce out-of-stock lag time from 42 mins to under 6 mins.", roi: "Saves ₹88,000/week Stockout Loss" },
                    { priority: "MEDIUM", title: "Sponsor Brand Tier Re-negotiation", desc: "Leverage eye-level attention fixation data (5.8s avg dwell) to pitch 15% increase in quarterly end-cap sponsorship contracts.", roi: "+₹6.5L Incremental Margin" },
                  ].map((dir, i) => (
                    <div key={i} style={{ padding: "18px", borderRadius: "10px", backgroundColor: TOKENS.surface2, border: `1px solid ${dir.priority === "CRITICAL" ? TOKENS.danger : dir.priority === "HIGH" ? TOKENS.accent : TOKENS.info}` }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.06)", color: dir.priority === "CRITICAL" ? TOKENS.danger : dir.priority === "HIGH" ? TOKENS.accent : TOKENS.info }}>
                        {dir.priority} PRIORITY
                      </span>
                      <h4 style={{ margin: "10px 0 6px 0", fontSize: "15px", fontWeight: 700 }}>{dir.title}</h4>
                      <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: TOKENS.muted, lineHeight: 1.5 }}>{dir.desc}</p>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: TOKENS.success, borderTop: `1px solid ${TOKENS.cardBorder}`, paddingTop: "8px" }}>
                        💰 {dir.roi}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ================= TAB 5: REPORTS ================= */}
          {activeTab === "reports" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>📑 C-Suite Board Reports & Dossiers</h2>
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

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <Card title="📊 Board of Directors Summary CSV" subtitle="Consolidated chain-wide KPIs and quarterly revenue performance">
                  <p style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "16px" }}>
                    Includes footfall, attention scores, conversion percentages, and systemic leakage across all outlets.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      onClick={() =>
                        handleDownloadReport("board_executive_summary", [
                          ["Store", "City", "Footfall", "AttentionScore", "Conversion", "DailyRevenue", "RevenueAtRisk"],
                          ...CHAIN_STORES.map((s) => [s.name, s.location, s.footfall, s.attentionScore, s.conversion, s.revenue, s.leakage]),
                        ])
                      }
                      style={{ padding: "10px 14px", backgroundColor: TOKENS.accent, color: "#1A1200", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "12px", cursor: "pointer", width: "100%" }}
                    >
                      ⬇ Export Board Summary CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{ padding: "8px 14px", backgroundColor: "transparent", border: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.text, borderRadius: "8px", fontWeight: 600, fontSize: "11px", cursor: "pointer", width: "100%" }}
                    >
                      📄 Save as PDF
                    </button>
                  </div>
                </Card>

                <Card title="👁️ Golden Zone Monetization Report" subtitle="Brand visibility and eye-level shelf share analytics">
                  <p style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "16px" }}>
                    Eye-level fixation share and brand sponsor visibility data for merchant negotiations.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      onClick={() =>
                        handleDownloadReport("golden_zone_monetization", [
                          ["Category", "GoldenZoneShare", "MarginTier", "RevenueUplift"],
                          ["Beverages and Energy Drinks", "78%", "38%", "+24.2%"],
                          ["Packaged Snacks and Confectionery", "64%", "32%", "+18.6%"],
                          ["Electronics and Accessories", "82%", "44%", "+31.0%"],
                          ["Personal Care and Grooming", "42%", "22%", "+8.4%"],
                        ])
                      }
                      style={{ padding: "10px 14px", backgroundColor: TOKENS.info, color: "#FFF", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "12px", cursor: "pointer", width: "100%" }}
                    >
                      ⬇ Export Monetization CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      style={{ padding: "8px 14px", backgroundColor: "transparent", border: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.text, borderRadius: "8px", fontWeight: 600, fontSize: "11px", cursor: "pointer", width: "100%" }}
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
    </div>
  );
}