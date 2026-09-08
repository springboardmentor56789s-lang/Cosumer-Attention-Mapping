"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
  success: "#5FAE86",
  info: "#5B8DEF",
};

const fontMono = "'JetBrains Mono', monospace";

function AttentionGrid() {
  const rows = 8;
  const cols = 10;
  const [cells, setCells] = useState([]);

  useEffect(() => {
    setCells(
      Array.from({ length: rows * cols }, (_, i) => ({
        id: i,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 3,
        peak: 0.25 + Math.random() * 0.75,
      }))
    );
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "18px",
        width: "100%",
        maxWidth: "420px",
      }}
    >
      {cells.map((c) => (
        <div
          key={c.id}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "9999px",
            background: TOKENS.accent,
            opacity: 0.15,
            animation: `pulseDot ${c.duration}s ease-in-out ${c.delay}s infinite`,
            "--peak": c.peak,
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("retail_analyst");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const router = useRouter();

  // Smart role detector based on email keywords
  const detectRoleFromEmail = (inputEmail) => {
    const e = (inputEmail || "").toLowerCase();
    if (e.includes("admin")) return "admin";
    if (e.includes("analyst")) return "retail_analyst";
    if (e.includes("marketing") || e.includes("mktg")) return "marketing_manager";
    if (e.includes("store") || e.includes("manager")) return "store_manager";
    if (e.includes("exec") || e.includes("ceo") || e.includes("leadership")) return "executive";
    return "retail_analyst";
  };

  // Auto-sync role dropdown when typing email
  useEffect(() => {
    if (email.trim()) {
      const detected = detectRoleFromEmail(email);
      setRole(detected);
    }
  }, [email]);

  const roleLabels = {
    admin: { label: "Administrator Dashboard", badge: "Admin Full Access", color: TOKENS.accent, route: "/dashboard/admin" },
    retail_analyst: { label: "Retail Analyst Dashboard", badge: "Shopper Intelligence & Funnel", color: TOKENS.info, route: "/dashboard/retail-analyst" },
    marketing_manager: { label: "Marketing Manager Dashboard", badge: "Campaigns & Golden Zone", color: TOKENS.success, route: "/dashboard/marketing-manager" },
    store_manager: { label: "Store Manager Dashboard", badge: "Live Floor & Restock Tasks", color: TOKENS.accent, route: "/dashboard/store-manager" },
    executive: { label: "Executive Leadership Dashboard", badge: "C-Suite Portfolio Benchmarks", color: "#A78BFA", route: "/dashboard/executive" },
  };

  const currentRoleConfig = roleLabels[role] || roleLabels.retail_analyst;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const inferredRole = detectRoleFromEmail(email);
    const targetRole = role || inferredRole;

    try {
      if (mode === "register") {
        // CREATE ACCOUNT
        const res = await axios.post("http://localhost:8000/register", {
          name: name.trim() || "Retail User",
          email: email.trim(),
          password,
          role_name: targetRole,
        });

        setSuccessMsg(`Account created for ${res.data.role || targetRole}! Launching dashboard...`);
        
        if (res.data.access_token) {
          localStorage.setItem("token", res.data.access_token);
        }
        if (res.data.name || name) {
          localStorage.setItem("user_name", res.data.name || name.trim());
        }
        if (res.data.email || email) {
          localStorage.setItem("user_email", res.data.email || email.trim());
        }

        const roleRoutes = {
          admin: "/dashboard/admin",
          store_manager: "/dashboard/store-manager",
          retail_analyst: "/dashboard/retail-analyst",
          marketing_manager: "/dashboard/marketing-manager",
          executive: "/dashboard/executive",
        };

        const targetRoute = roleRoutes[res.data.role] || roleRoutes[targetRole] || "/dashboard/retail-analyst";

        setTimeout(() => {
          router.push(targetRoute);
        }, 800);
      } else {
        // SIGN IN
        const response = await axios.post("http://localhost:8000/login", { email, password });
        const token = response.data.access_token;
        localStorage.setItem("token", token);
        if (response.data.name) {
          localStorage.setItem("user_name", response.data.name);
        } else {
          // fallback: derive friendly name from email username if name not returned
          const emailPrefix = email.split("@")[0].replace(/[._-]/g, " ");
          const formattedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          localStorage.setItem("user_name", formattedName);
        }
        if (response.data.email || email) {
          localStorage.setItem("user_email", response.data.email || email);
        }

        let decodedRole = response.data.role;
        if (!decodedRole && token) {
          try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            decodedRole = decoded.role;
          } catch (err) {}
        }

        // Check if email keyword overrides
        const finalRole = inferredRole !== "retail_analyst" ? inferredRole : (decodedRole || "retail_analyst");

        const roleRoutes = {
          admin: "/dashboard/admin",
          store_manager: "/dashboard/store-manager",
          retail_analyst: "/dashboard/retail-analyst",
          marketing_manager: "/dashboard/marketing-manager",
          executive: "/dashboard/executive",
        };

        const targetRoute = roleRoutes[finalRole] || roleRoutes[decodedRole] || "/dashboard/admin";
        router.push(targetRoute);
      }
    } catch (err) {
      setError(err.response?.data?.detail || (mode === "register" ? "Registration failed. Try a different email." : "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TOKENS.bg,
        color: TOKENS.text,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes pulseDot {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: var(--peak); transform: scale(2.4); box-shadow: 0 0 12px ${TOKENS.accent}; }
        }
        .cam-input:focus {
          outline: none;
          border-color: ${TOKENS.accent} !important;
          box-shadow: 0 0 0 3px ${TOKENS.accentDim};
        }
        .cam-btn:focus-visible {
          outline: 2px solid ${TOKENS.accent};
          outline-offset: 2px;
        }
        @media (max-width: 860px) {
          .cam-left { display: none !important; }
        }
      `}</style>

      {/* LEFT — Brand & Attention Heatmap visual */}
      <div
        className="cam-left"
        style={{
          flex: "1 1 50%",
          background: `radial-gradient(circle at 30% 20%, ${TOKENS.surface2} 0%, ${TOKENS.bg} 65%)`,
          borderRight: `1px solid ${TOKENS.border}`,
          padding: "56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: TOKENS.accent,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: "9999px",
              padding: "6px 14px",
              marginBottom: "40px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: TOKENS.accent }} />
            SYSTEM_ONLINE
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "36px",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: 0,
              maxWidth: "460px",
            }}
          >
            Consumer Attention Mapping System
          </h1>

          <p
            style={{
              color: TOKENS.muted,
              fontSize: "15px",
              lineHeight: 1.6,
              marginTop: "16px",
              maxWidth: "420px",
            }}
          >
            Role-based retail computer vision platform: Track consumer pathways, analyze gaze fixation on shelf planograms, and maximize in-store conversion.
          </p>
        </div>

        <div style={{ margin: "40px 0" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: TOKENS.muted,
              letterSpacing: "0.06em",
              marginBottom: "14px",
              textTransform: "uppercase",
            }}
          >
            Real-Time Attention Grid · 80 Aisle Sensors
          </div>
          <AttentionGrid />
        </div>

        <div style={{ display: "flex", gap: "24px", color: TOKENS.muted, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>
          <span>YOLOv8 + ByteTrack</span>
          <span>·</span>
          <span>Homography 3D</span>
          <span>·</span>
          <span>PostgreSQL Active</span>
        </div>
      </div>

      {/* RIGHT — AUTH FORM */}
      <div
        style={{
          flex: "1 1 50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          background: TOKENS.bg,
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          
          {/* TAB TOGGLE: SIGN IN vs CREATE ACCOUNT */}
          <div style={{ display: "flex", gap: "8px", padding: "4px", backgroundColor: TOKENS.surface, borderRadius: "10px", border: `1px solid ${TOKENS.border}`, marginBottom: "28px" }}>
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              style={{
                flex: 1,
                padding: "9px",
                border: "none",
                borderRadius: "7px",
                backgroundColor: mode === "login" ? TOKENS.accent : "transparent",
                color: mode === "login" ? "#1A1200" : TOKENS.muted,
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              style={{
                flex: 1,
                padding: "9px",
                border: "none",
                borderRadius: "7px",
                backgroundColor: mode === "register" ? TOKENS.accent : "transparent",
                color: mode === "register" ? "#1A1200" : TOKENS.muted,
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Create Account
            </button>
          </div>

          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {mode === "login" ? "Welcome back" : "Create New Account"}
          </h2>

          <p style={{ color: TOKENS.muted, fontSize: "13px", marginTop: "6px", marginBottom: "24px" }}>
            {mode === "login"
              ? "Sign in to access your designated role dashboard"
              : "Account role will be automatically inferred from your email"}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", color: TOKENS.muted, marginBottom: "6px", fontWeight: 600 }}>
                  Full Name
                </label>
                <input
                  className="cam-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kushalini"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: TOKENS.surface2,
                    border: `1px solid ${TOKENS.border}`,
                    borderRadius: "8px",
                    padding: "11px 14px",
                    color: TOKENS.text,
                    fontSize: "13px",
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", color: TOKENS.muted, marginBottom: "6px", fontWeight: 600 }}>
                Email Address
              </label>
              <input
                className="cam-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@retail.com or analyst@retail.com"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: TOKENS.surface2,
                  border: `1px solid ${TOKENS.border}`,
                  borderRadius: "8px",
                  padding: "11px 14px",
                  color: TOKENS.text,
                  fontSize: "13px",
                }}
              />

              {/* DYNAMIC ROLE HINT BADGE */}
              {email.trim().length > 0 && (
                <div style={{ marginTop: "8px", padding: "6px 10px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${currentRoleConfig.color}44`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: currentRoleConfig.color }}>
                    ● DETECTED ROLE:
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: TOKENS.text }}>
                    {currentRoleConfig.label}
                  </span>
                </div>
              )}
            </div>

            {mode === "register" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", color: TOKENS.muted, marginBottom: "6px", fontWeight: 600 }}>
                  Assigned Dashboard Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: TOKENS.surface2,
                    border: `1px solid ${TOKENS.border}`,
                    borderRadius: "8px",
                    padding: "11px 14px",
                    color: TOKENS.text,
                    fontSize: "13px",
                    outline: "none",
                  }}
                >
                  <option value="admin">👑 Administrator Dashboard (/dashboard/admin)</option>
                  <option value="retail_analyst">📈 Retail Analyst Dashboard (/dashboard/retail-analyst)</option>
                  <option value="marketing_manager">🎯 Marketing Manager Dashboard (/dashboard/marketing-manager)</option>
                  <option value="store_manager">🏪 Store Manager Dashboard (/dashboard/store-manager)</option>
                  <option value="executive">🏛️ Executive Leadership Dashboard (/dashboard/executive)</option>
                </select>
                <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: TOKENS.muted }}>
                  Hint: Emails containing "admin", "analyst", "marketing", "store", or "exec" auto-route.
                </p>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: TOKENS.muted, marginBottom: "6px", fontWeight: 600 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="cam-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: TOKENS.surface2,
                    border: `1px solid ${TOKENS.border}`,
                    borderRadius: "8px",
                    padding: "11px 44px 11px 14px",
                    color: TOKENS.text,
                    fontSize: "13px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: TOKENS.muted,
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(232,101,79,0.12)",
                  border: `1px solid ${TOKENS.danger}`,
                  color: TOKENS.danger,
                  fontSize: "12px",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "16px",
                  lineHeight: 1.4,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  background: "rgba(95,174,134,0.15)",
                  border: `1px solid ${TOKENS.success}`,
                  color: TOKENS.success,
                  fontSize: "12px",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "16px",
                }}
              >
                ✅ {successMsg}
              </div>
            )}

            <button
              className="cam-btn"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? TOKENS.surface2 : TOKENS.accent,
                color: loading ? TOKENS.muted : "#1A1200",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: loading ? "default" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loading
                ? mode === "register" ? "Creating Account…" : "Signing in…"
                : mode === "register" ? "Create Account & Launch Dashboard" : "Sign in to Dashboard"}
            </button>
          </form>

          {/* Quick Email Guide */}
          <div style={{ marginTop: "28px", borderTop: `1px solid ${TOKENS.border}`, paddingTop: "16px", fontSize: "11px", color: TOKENS.muted, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: TOKENS.text }}>Email Keyword Routing Rule:</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "6px", fontFamily: fontMono }}>
              <span>• "admin" ➔ Admin</span>
              <span>• "analyst" ➔ Analyst</span>
              <span>• "store" ➔ Store Mgr</span>
              <span>• "marketing" ➔ Marketing</span>
              <span>• "exec" ➔ Executive</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}