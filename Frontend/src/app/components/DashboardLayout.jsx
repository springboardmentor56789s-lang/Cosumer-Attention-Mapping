"use client";
import { useRouter, usePathname } from "next/navigation";
import { TOKENS, FONT_IMPORT } from "@/app/theme";

const NAV_BY_ROLE = {
  admin: [{ label: "Overview", href: "/dashboard/admin" }],
  store_manager: [{ label: "Overview", href: "/dashboard/store-manager" }],
  retail_analyst: [{ label: "Overview", href: "/dashboard/retail-analyst" }],
  marketing_manager: [{ label: "Overview", href: "/dashboard/marketing-manager" }],
};

const ROLE_LABELS = {
  admin: "Administrator",
  store_manager: "Store Manager",
  retail_analyst: "Retail Analyst",
  marketing_manager: "Marketing Manager",
};

export default function DashboardLayout({ title, subtitle, role, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role] || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: TOKENS.bg, color: TOKENS.text, display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        ${FONT_IMPORT}
        .nav-item { transition: background 0.15s, color 0.15s; }
        .nav-item:hover { background: ${TOKENS.surface2}; }
        .nav-item.active { background: ${TOKENS.accentDim}; color: ${TOKENS.accent}; }
        .cam-card { transition: border-color 0.15s, transform 0.15s; }
        .cam-card:hover { border-color: ${TOKENS.accent}; transform: translateY(-1px); }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width: "260px", background: TOKENS.surface, borderRight: `1px solid ${TOKENS.border}`, padding: "28px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "36px", paddingLeft: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: TOKENS.accent }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "15px" }}>
              Attention<span style={{ color: TOKENS.accent }}>Map</span>
            </span>
          </div>

          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: TOKENS.muted, letterSpacing: "0.08em", marginBottom: "10px", paddingLeft: "6px" }}>
            NAVIGATION
          </p>

          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? "active" : ""}`}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: pathname === item.href ? TOKENS.accent : TOKENS.text,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div style={{ borderTop: `1px solid ${TOKENS.border}`, paddingTop: "18px" }}>
          <p style={{ fontSize: "11px", color: TOKENS.muted, marginBottom: "4px", paddingLeft: "6px" }}>Signed in as</p>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "14px", paddingLeft: "6px" }}>{ROLE_LABELS[role] || role}</p>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "transparent",
              border: `1px solid ${TOKENS.border}`,
              color: TOKENS.muted,
              borderRadius: "8px",
              padding: "9px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "40px 48px", maxWidth: "1200px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "26px", fontWeight: 700, margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ color: TOKENS.muted, fontSize: "14px", marginTop: "6px" }}>{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}