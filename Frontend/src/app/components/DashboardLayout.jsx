"use client";
import React, { useState } from "react";
import { COLORS } from "./UI";

export default function DashboardLayout({ children, activeTab = "Dashboard", role = "Administrator" }) {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("Today");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sidebarItems = [
    { label: "Dashboard", icon: "🏠", path: "#" },
    { label: "Stores", icon: "🏪", path: "#" },
    { label: "Cameras", icon: "📹", path: "#" },
    { label: "Analytics", icon: "📊", path: "#" },
    { label: "Heatmaps", icon: "🔥", path: "#" },
    { label: "Reports", icon: "📈", path: "#" },
    { label: "Settings", icon: "⚙", path: "#" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: isDarkMode ? "#0F172A" : COLORS.bg, display: "flex", fontFamily: "'Inter', sans-serif" }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside
        style={{
          width: "240px",
          backgroundColor: isDarkMode ? "#1E293B" : COLORS.cardBg,
          borderRight: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
          position: "fixed",
          height: "100vh",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 8px 24px 8px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontWeight: "bold" }}>
            C
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px", color: isDarkMode ? "#FFF" : COLORS.textPrimary }}>CAMS AI</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {sidebarItems.map((item) => {
            const isActive = activeTab.toLowerCase() === item.label.toLowerCase();
            return (
              <a
                key={item.label}
                href={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? COLORS.primary : "transparent",
                  color: isActive ? "#FFFFFF" : isDarkMode ? "#94A3B8" : COLORS.textSecondary,
                  transition: "all 0.15s ease",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div style={{ padding: "12px", backgroundColor: isDarkMode ? "#334155" : COLORS.bg, borderRadius: "12px", fontSize: "12px" }}>
          <p style={{ margin: 0, fontWeight: 600, color: isDarkMode ? "#FFF" : COLORS.textPrimary }}>Active Role</p>
          <p style={{ margin: "2px 0 0 0", color: COLORS.primary, textTransform: "capitalize" }}>{role}</p>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOP NAVIGATION BAR */}
        <header
          style={{
            height: "64px",
            backgroundColor: isDarkMode ? "#1E293B" : COLORS.cardBg,
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifySpaceBetween: "space-between",
            padding: "0 32px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          {/* Global Search Bar */}
          <div style={{ position: "relative", width: "320px" }}>
            <input
              type="text"
              placeholder="Search stores, users, or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.bg,
                fontSize: "13px",
                outline: "none",
              }}
            />
            <span style={{ position: "absolute", left: "12px", top: "8px", color: COLORS.textSecondary }}>🔍</span>
          </div>

          {/* Action Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "13px", backgroundColor: COLORS.cardBg }}
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>

            {/* Export Actions */}
            <button style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.cardBg, fontSize: "13px", cursor: "pointer" }}>
              📥 Export Excel
            </button>
            <button style={{ padding: "6px 12px", borderRadius: "8px", backgroundColor: COLORS.primary, color: "#FFF", border: "none", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>
              📄 Export PDF
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}
              title="Toggle Theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* Notification Bell */}
            <div style={{ position: "relative", cursor: "pointer" }}>
              <span style={{ fontSize: "20px" }}>🔔</span>
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  backgroundColor: COLORS.red,
                  color: "#FFF",
                  fontSize: "10px",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                4
              </span>
            </div>

            {/* User Profile Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "12px", borderLeft: `1px solid ${COLORS.border}` }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#DBEAFE", color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                S
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: isDarkMode ? "#FFF" : COLORS.textPrimary }}>Sreeja User</span>
                <span style={{ fontSize: "11px", color: COLORS.textSecondary }}>{role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}