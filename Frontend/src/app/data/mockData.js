export const mockDashboardData = {
  // 1. KPI Statistics & Chart Analytics
stats: {
  total_users: 124,
  users_trend: "+12.4%",
  users_trend_type: "positive",

  total_stores: 18,
  stores_trend: "+2 this month",
  stores_trend_type: "positive",

  active_cameras: 240,
  cameras_trend: "97.5% operational",
  cameras_trend_type: "positive",

  system_uptime: "99.94%",
  uptime_trend: "↑ 0.02%",
  uptime_trend_type: "positive",
},

  // 2. User Directory Data (Handles both string and object role formats safely)
  users: [
    { id: 1, name: "Alexander Wright", email: "a.wright@retail.com", role: { id: 1, name: "Admin" }, status: "Active" },
    { id: 2, name: "Elena Rostova", email: "e.rostova@retail.com", role: { id: 2, name: "Store Manager" }, status: "Active" },
    { id: 3, name: "Marcus Chen", email: "m.chen@analytics.com", role: "Retail Analyst", status: "Active" },
    { id: 4, name: "Sarah Jenkins", email: "s.jenkins@store.com", role: "Store Manager", status: "Active" },
    { id: 5, name: "David Kalu", email: "d.kalu@marketing.com", role: "Marketing Manager", status: "Active" },
    { id: 6, name: "Rachel Adams", email: "r.adams@retail.com", role: { id: 3, name: "Retail Analyst" }, status: "Active" },
  ],

  // 3. Store Branches & Camera Fleet Status
  stores: [
    { id: 101, name: "Store #101 - Downtown Flagship", region: "North", cameras: 16, status: "Optimal", warning: false },
    { id: 102, name: "Store #102 - Westside Mall", region: "West", cameras: 12, status: "2 Feeds Offline", warning: true },
    { id: 103, name: "Store #103 - Metro Center", region: "Central", cameras: 20, status: "Optimal", warning: false },
    { id: 104, name: "Store #104 - Harbor Outlet", region: "East", cameras: 8, status: "Optimal", warning: false },
  ],

  // 4. Audit Trail Activity Feed
  activity: [
    { id: 1, time: "10:42 AM", title: "New Camera Provisioned", desc: "CAM-102-B added to Store #102 by Admin" },
    { id: 2, time: "09:15 AM", title: "User Access Granted", desc: "Assigned Retail Analyst permissions to Rachel Adams" },
    { id: 3, time: "08:30 AM", title: "System Maintenance Completed", desc: "API Gateway latency optimized to 42ms" },
    { id: 4, time: "07:05 AM", title: "Camera Offline Warning", desc: "CAM-102-D lost connectivity (Store #102)" },
  ],

  // 5. System Infrastructure Alerts
  alerts: [
    { id: 101, title: "Connectivity Loss", message: "2 cameras offline at Store #102 - Westside Mall.", level: "critical" },
    { id: 102, title: "Storage Warning", message: "Primary video storage buffer reached 70% capacity.", level: "warning" },
    { id: 103, title: "High Latency Alert", message: "Stream processing latency exceeded 120ms in Region East.", level: "warning" },
  ],
};