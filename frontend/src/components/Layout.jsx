import { useNavigate, useLocation, Link } from "react-router-dom";
import { parseJwt } from "./ProtectedRoute";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  let userName = "User";
  let userRole = "Staff";

  if (token) {
    const payload = parseJwt(token);
    if (payload) {
      userName = payload.sub || "User";
      userRole = payload.role || "Staff";
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const role = userRole.toLowerCase();

  // ── Role-based navigation: each role sees only their relevant pages ──
  const allNavItems = [
    // ── DASHBOARDS (always first)
    { path: "/dashboard", label: "📊 Live Operations", section: "Dashboards",
      roles: ["store manager", "admin"] },
    { path: "/executive", label: "👔 Executive Hub", section: "Dashboards",
      roles: ["store manager", "retail analyst", "marketing manager", "admin"] },

    // ── STORE MANAGEMENT
    { path: "/stores", label: "🏪 Stores", section: "Store Management",
      roles: ["store manager", "admin"] },
    { path: "/shelves", label: "🗄️ Shelves", section: "Store Management",
      roles: ["store manager", "retail analyst", "admin"] },
    { path: "/cameras", label: "🎥 Cameras", section: "Store Management",
      roles: ["admin"] },
    { path: "/products", label: "📦 Products", section: "Store Management",
      roles: ["store manager", "marketing manager", "admin"] },

    // ── ANALYTICS & INTELLIGENCE
    { path: "/behavior", label: "🧠 Behavior", section: "Analytics",
      roles: ["retail analyst", "admin"] },
    { path: "/analytics/products", label: "⭐ Product Scores", section: "Analytics",
      roles: ["retail analyst", "marketing manager", "admin"] },
  ];

  // Filter nav items by user role
  const visibleNavItems = allNavItems.filter(item =>
    item.roles.includes(role)
  );

  // Group by section
  const groupedNav = {};
  visibleNavItems.forEach(item => {
    if (!groupedNav[item.section]) groupedNav[item.section] = [];
    groupedNav[item.section].push(item);
  });

  // Role badge colors
  const roleBadgeStyle = {
    'store manager':     { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)', icon: '🏪' },
    'retail analyst':    { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)', icon: '🔬' },
    'marketing manager': { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)', icon: '📢' },
    'admin':             { bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.3)', icon: '⚙️' },
  };

  const badge = roleBadgeStyle[role] || roleBadgeStyle['store manager'];

  // Section label styles
  const sectionLabelStyle = {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    color: '#475569',
    padding: '16px 20px 6px',
    marginTop: '4px',
  };

  const dividerStyle = {
    borderTop: '1px solid rgba(51, 65, 85, 0.3)',
    margin: '8px 16px 0',
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Brand */}
        <div className="sidebar-brand">
          <h2>🛒 RetailEye AI</h2>
          <span className="brand-subtitle">Attention Mapping</span>
        </div>

        {/* Role Welcome Card */}
        <div style={{
          margin: '0 12px 8px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: badge.bg,
          border: `1px solid ${badge.border}`,
        }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '2px' }}>Logged in as</div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: badge.color }}>
            {badge.icon} {userRole}
          </div>
          <div style={{
            fontSize: '0.68rem', color: '#64748b', marginTop: '2px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {userName}
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
          {Object.entries(groupedNav).map(([section, items], sIdx) => (
            <div key={section}>
              {sIdx > 0 && <div style={dividerStyle} />}
              <div style={sectionLabelStyle}>{section}</div>
              <ul style={{ margin: 0, padding: 0 }}>
                {items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path} style={{ listStyle: 'none' }}>
                      <Link
                        to={item.path}
                        className={`nav-link ${isActive ? "active" : ""}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-title">
            <h1>{visibleNavItems.find(n => n.path === location.pathname)?.label.substring(3) || "Overview"}</h1>
          </div>
          <div className="user-profile">
            <span style={{
              background: badge.bg,
              color: badge.color,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: '700',
              border: `1px solid ${badge.border}`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {userRole}
            </span>
            <span className="user-name">{userName}</span>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
