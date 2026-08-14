"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";

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
  padding: "5px 10px",
  fontSize: "11px",
  fontWeight: "600",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  color: "#fff",
  backgroundColor: bg,
  marginRight: "6px",
  ...extra,
});

function formatDwellTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

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

const INITIAL_USERS = [
  { id: "U-01", name: "John Doe", email: "john.doe@cams.io", role: "Store Manager", status: "Active" },
  { id: "U-02", name: "Alice Kumar", email: "alice.kumar@cams.io", role: "Retail Analyst", status: "Active" },
  { id: "U-03", name: "Admin User", email: "admin@cams.io", role: "Admin", status: "Active" },
];

const INITIAL_ACTIVE_SHOPPERS = [
  { id: "SHOPPER-101", entryTime: "10:32 AM", currentZone: "Electronics", zonesVisited: ["Entrance", "Main Aisle", "Electronics"], dwellSec: 720, store: "Downtown Flagship", posX: 48, posY: 52, color: TOKENS.accent },
  { id: "SHOPPER-102", entryTime: "10:38 AM", currentZone: "Grocery & Snacks", zonesVisited: ["Entrance", "Grocery & Snacks"], dwellSec: 360, store: "Downtown Flagship", posX: 28, posY: 38, color: TOKENS.info },
  { id: "SHOPPER-103", entryTime: "10:41 AM", currentZone: "Checkout", zonesVisited: ["Entrance", "Apparel", "Checkout"], dwellSec: 180, store: "Downtown Flagship", posX: 78, posY: 82, color: TOKENS.success },
];

const INITIAL_COMPLETED_JOURNEYS = [
  { id: "SHOPPER-098", store: "Downtown Flagship", entryTime: "10:05 AM", exitTime: "10:28 AM", totalDwellSec: 1380, path: ["Entrance", "Electronics", "Checkout", "Exit"] },
  { id: "SHOPPER-099", store: "Metro Shopping Mall", entryTime: "10:12 AM", exitTime: "10:35 AM", totalDwellSec: 1380, path: ["Entrance", "Grocery", "Checkout", "Exit"] },
  { id: "SHOPPER-100", store: "Downtown Flagship", entryTime: "10:15 AM", exitTime: "10:39 AM", totalDwellSec: 1440, path: ["Entrance", "Apparel", "Checkout", "Exit"] },
];

const STORE_ZONES = [
  { name: "Entrance", x: 12, y: 15, width: 22, height: 18, color: "#2B3B5C" },
  { name: "Grocery & Snacks", x: 12, y: 38, width: 30, height: 25, color: "#1C3332" },
  { name: "Electronics", x: 45, y: 45, width: 28, height: 28, color: "#3B2D4A" },
  { name: "Apparel", x: 45, y: 15, width: 28, height: 25, color: "#3B382A" },
  { name: "Checkout", x: 78, y: 72, width: 18, height: 22, color: "#1E3B2B" },
  { name: "Exit", x: 78, y: 15, width: 18, height: 18, color: "#4A2222" },
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

  const [stores, setStores] = useState(INITIAL_STORES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [shelves, setShelves] = useState(INITIAL_SHELVES);
  const [users, setUsers] = useState(INITIAL_USERS);

  const [activeShoppers, setActiveShoppers] = useState(INITIAL_ACTIVE_SHOPPERS);
  const [completedJourneys, setCompletedJourneys] = useState(INITIAL_COMPLETED_JOURNEYS);
  const [selectedTrackingStore, setSelectedTrackingStore] = useState(INITIAL_STORES[0].name);

  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState(null);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingStoreId, setEditingStoreId] = useState(null);

  const [userForm, setUserForm] = useState({ name: "", role: "Store Manager" });
  const [storeForm, setStoreForm] = useState({ name: "", cameras: "" });
  const [cameraForm, setCameraForm] = useState({ storeId: stores[0]?.id || "", count: "" });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const dwellTimer = setInterval(() => {
      setActiveShoppers((prev) =>
        prev.map((s) => {
          let targetX = s.posX;
          let targetY = s.posY;
          let updatedZone = s.currentZone;
          let updatedVisited = [...s.zonesVisited];

          if (s.dwellSec < 12) {
            targetX = 28;
            targetY = 38;
            updatedZone = "Grocery & Snacks";
          } else if (s.dwellSec < 28) {
            targetX = 58;
            targetY = 55;
            updatedZone = "Electronics";
          } else if (s.dwellSec < 45) {
            targetX = 82;
            targetY = 78;
            updatedZone = "Checkout";
          }

          if (!updatedVisited.includes(updatedZone)) {
            updatedVisited.push(updatedZone);
          }

          const stepX = (targetX - s.posX) * 0.15 + (Math.random() - 0.5) * 0.5;
          const stepY = (targetY - s.posY) * 0.15 + (Math.random() - 0.5) * 0.5;

          return {
            ...s,
            dwellSec: s.dwellSec + 1,
            currentZone: updatedZone,
            zonesVisited: updatedVisited,
            posX: Math.max(10, Math.min(90, s.posX + stepX)),
            posY: Math.max(10, Math.min(90, s.posY + stepY)),
          };
        })
      );
    }, 1000);

    return () => clearInterval(dwellTimer);
  }, []);

  const STORAGE_KEYS = {
    stores: "cams_stores",
    users: "cams_users",
    shelves: "cams_shelves",
    notifications: "cams_notifications",
    activeShoppers: "cams_active_shoppers",
    completedJourneys: "cams_completed_journeys",
  };

  useEffect(() => {
    try {
      const savedStores = localStorage.getItem(STORAGE_KEYS.stores);
      if (savedStores) setStores(JSON.parse(savedStores));

      const savedUsers = localStorage.getItem(STORAGE_KEYS.users);
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedShelves = localStorage.getItem(STORAGE_KEYS.shelves);
      if (savedShelves) setShelves(JSON.parse(savedShelves));

      const savedNotifications = localStorage.getItem(STORAGE_KEYS.notifications);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

      const savedShoppers = localStorage.getItem(STORAGE_KEYS.activeShoppers);
      if (savedShoppers) setActiveShoppers(JSON.parse(savedShoppers));

      const savedJourneys = localStorage.getItem(STORAGE_KEYS.completedJourneys);
      if (savedJourneys) setCompletedJourneys(JSON.parse(savedJourneys));
    } catch (err) {
      console.error("Failed to load saved CAMS data from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.stores, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.shelves, JSON.stringify(shelves));
  }, [shelves]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activeShoppers, JSON.stringify(activeShoppers));
  }, [activeShoppers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.completedJourneys, JSON.stringify(completedJourneys));
  }, [completedJourneys]);

  const handleResetDemoData = () => {
    if (!window.confirm("Reset all stores, users, shelves, tracking data, and notifications back to demo defaults?")) return;
    setStores(INITIAL_STORES);
    setUsers(INITIAL_USERS);
    setShelves(INITIAL_SHELVES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveShoppers(INITIAL_ACTIVE_SHOPPERS);
    setCompletedJourneys(INITIAL_COMPLETED_JOURNEYS);
    setToast("Demo data restored");
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const totalPeopleNearShelves = shelves.reduce((sum, s) => sum + s.people, 0);
  const busiestShelf = shelves.reduce((a, b) => (b.people > a.people ? b : a), shelves[0]);

  // ================= CUSTOMER JOURNEY TRACKING HANDLERS =================
  const handleSimulateNewShopper = () => {
    const nextNum = Math.floor(104 + Math.random() * 900);
    const newShopper = {
      id: `SHOPPER-${nextNum}`,
      entryTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      currentZone: "Entrance",
      zonesVisited: ["Entrance"],
      dwellSec: 0,
      store: selectedTrackingStore,
      posX: 18 + Math.random() * 8,
      posY: 20 + Math.random() * 8,
      color: [TOKENS.accent, TOKENS.info, TOKENS.success, TOKENS.warning][Math.floor(Math.random() * 4)],
    };
    setActiveShoppers((prev) => [newShopper, ...prev]);
    pushNotification(`Shopper ${newShopper.id} entered ${selectedTrackingStore}`, "info");
    setToast(`Shopper ${newShopper.id} tracked at ${selectedTrackingStore}`);
  };

  const handleSimulateShopperExit = (shopper) => {
    const exitTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const journeyRecord = {
      id: shopper.id,
      store: shopper.store,
      entryTime: shopper.entryTime,
      exitTime: exitTime,
      totalDwellSec: shopper.dwellSec,
      path: [...shopper.zonesVisited, "Exit"],
    };
    setCompletedJourneys((prev) => [journeyRecord, ...prev]);
    setActiveShoppers((prev) => prev.filter((s) => s.id !== shopper.id));
    pushNotification(`Shopper ${shopper.id} completed journey (${formatDwellTime(shopper.dwellSec)})`, "success");
    setToast(`Customer ${shopper.id} exited store`);
  };

  const handleExportJourneyLogsCSV = () => {
    const rows = [
      ["Customer Journey Logs"],
      ["Store Filter", selectedTrackingStore],
      [],
      ["Shopper ID", "Store", "Entry Time", "Exit Time", "Total Dwell", "Path Journey"],
      ...completedJourneys.map((j) => [
        j.id,
        j.store,
        j.entryTime,
        j.exitTime,
        formatDwellTime(j.totalDwellSec),
        j.path.join(" -> "),
      ]),
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `customer_journeys_${selectedTrackingStore.replace(/\s+/g, "_")}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushNotification("Customer Journey Report Exported", "success");
    setToast("Journey report downloaded as CSV");
  };

  // ================= VIDEO-BASED CUSTOMER JOURNEY TRACKING =================
  // Upload an actual store video (entrance/aisle camera footage) directly —
  // no file-path/link needed — and generate that customer's full journey.
  const journeyVideoRef = useRef(null);
  const [journeyVideoFile, setJourneyVideoFile] = useState(null);
  const [journeyVideoURL, setJourneyVideoURL] = useState(null);
  const [journeyVideoDuration, setJourneyVideoDuration] = useState(0);
  const [isTrackingVideo, setIsTrackingVideo] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [trackedJourney, setTrackedJourney] = useState(null);

  const handleJourneyVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (journeyVideoURL) URL.revokeObjectURL(journeyVideoURL);
    setJourneyVideoFile(file);
    setJourneyVideoURL(URL.createObjectURL(file));
    setJourneyVideoDuration(0);
    setTrackedJourney(null);
  };

  const handleJourneyVideoLoadedMetadata = () => {
    if (journeyVideoRef.current) setJourneyVideoDuration(journeyVideoRef.current.duration || 0);
  };

  // REAL HTTP API CUSTOMER JOURNEY TRACKING (POST /track-video)
  // Sends the uploaded video file itself (multipart/form-data) — the backend
  // runs person detection + re-identification across the footage and returns
  // that customer's entrance-to-exit journey.
  const handleRunJourneyTracking = async () => {
    if (!journeyVideoFile || isTrackingVideo) return;

    setIsTrackingVideo(true);
    setTrackingProgress(15);
    setTrackedJourney(null);

    const formData = new FormData();
    formData.append("file", journeyVideoFile);
    formData.append("store", selectedTrackingStore);

    try {
      const response = await fetch("http://127.0.0.1:8000/track-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new Error(
          `Backend responded ${response.status} ${response.statusText}${bodyText ? ` — ${bodyText.slice(0, 200)}` : ""}`
        );
      }

      setTrackingProgress(75);
      const data = await response.json();

      // Expected backend shape:
      // { shopperId, entryTime, exitTime, totalDwellSec, path: ["Entrance","Electronics",...], zoneDwell: [{zone, sec}] }
      const journeyRecord = {
        id: data.shopperId || `SHOPPER-${Math.floor(100 + Math.random() * 900)}`,
        store: selectedTrackingStore,
        entryTime: data.entryTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        exitTime: data.exitTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        totalDwellSec: data.totalDwellSec ?? 0,
        path: data.path && data.path.length ? data.path : ["Entrance", "Exit"],
        zoneDwell: data.zoneDwell || [],
        sourceVideo: journeyVideoFile.name,
      };

      setTrackedJourney(journeyRecord);
      setCompletedJourneys((prev) => [journeyRecord, ...prev]);

      pushNotification(
        `Customer journey tracked from video: ${journeyRecord.id} (${formatDwellTime(journeyRecord.totalDwellSec)})`,
        "success"
      );
      setToast(`Journey generated for ${journeyRecord.id} at ${selectedTrackingStore}`);
    } catch (error) {
      console.error("Journey tracking error:", error);
      const isNetworkError = error instanceof TypeError;
      setToast(
        isNetworkError
          ? "Can't reach the tracking backend at 127.0.0.1:8000. Is it running?"
          : `Tracking failed: ${error.message}`
      );
    } finally {
      setIsTrackingVideo(false);
      setTrackingProgress(100);
    }
  };

  // DEMO / SIMULATE MODE — no backend needed. Lets you test the full
  // upload -> track -> journey UI flow before /track-video exists on the
  // FastAPI server, or whenever the server isn't running locally.
  const handleSimulateJourneyTracking = () => {
    if (!journeyVideoFile || isTrackingVideo) return;

    setIsTrackingVideo(true);
    setTrackingProgress(20);
    setTrackedJourney(null);

    const zonePool = ["Entrance", "Grocery & Snacks", "Electronics", "Apparel", "Checkout", "Exit"];
    const visitCount = 2 + Math.floor(Math.random() * 3); // 2-4 zones between entrance/exit
    const middleZones = [];
    while (middleZones.length < visitCount) {
      const z = zonePool[1 + Math.floor(Math.random() * (zonePool.length - 2))];
      if (!middleZones.includes(z)) middleZones.push(z);
    }
    const simulatedPath = ["Entrance", ...middleZones, "Checkout", "Exit"];
    const simulatedDwellSec = Math.round(journeyVideoDuration > 0 ? journeyVideoDuration * (8 + Math.random() * 4) : 300 + Math.random() * 600);

    setTimeout(() => {
      const now = new Date();
      const entry = new Date(now.getTime() - simulatedDwellSec * 1000);
      const journeyRecord = {
        id: `SHOPPER-${Math.floor(100 + Math.random() * 900)}`,
        store: selectedTrackingStore,
        entryTime: entry.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        exitTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        totalDwellSec: simulatedDwellSec,
        path: simulatedPath,
        zoneDwell: [],
        sourceVideo: journeyVideoFile.name,
        simulated: true,
      };

      setTrackedJourney(journeyRecord);
      setCompletedJourneys((prev) => [journeyRecord, ...prev]);
      pushNotification(`(Demo) Journey simulated for ${journeyRecord.id} — ${formatDwellTime(journeyRecord.totalDwellSec)}`, "info");
      setToast(`Demo journey generated for ${journeyRecord.id} — no backend used`);
      setIsTrackingVideo(false);
      setTrackingProgress(100);
    }, 900);
  };

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

  // REAL HTTP API VIDEO ANALYSIS (POST /detect-video)
  const handleRunDetection = async () => {
    if (!videoFile || isProcessing) return;
    const shelf = shelves.find((s) => s.id === selectedShelfId);
    if (!shelf) return;

    setIsProcessing(true);
    setProgress(15);
    setFrameResults([]);
    setDetectionSummary(null);

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/detect-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process video on server");
      }

      const data = await response.json();

      const summary = {
        shelfName: shelf.name,
        store: shelf.store,
        fileName: data.fileName,
        duration: data.duration,
        totalFrames: data.totalFrames,
        avg: data.avg,
        peak: data.peak,
        peakTime: data.peakTime,
        uniqueCount: data.uniqueCount,
      };

      setDetectionSummary(summary);
      setFrameResults(data.frameResults);

      setShelves((prev) =>
        prev.map((s) => (s.id === shelf.id ? { ...s, people: data.peak } : s))
      );

      pushNotification(
        `Video analysis complete for ${shelf.name}: ${data.uniqueCount} unique individuals detected`,
        "success"
      );
      setToast(`Detected ${data.uniqueCount} unique individuals in ${data.fileName}`);
    } catch (error) {
      console.error("Video detection error:", error);
      setToast("Error analyzing video file. Ensure FastAPI backend is running.");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
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
      `Unique Individuals Detected,${detectionSummary.uniqueCount}`,
      `Average Concurrent People,${detectionSummary.avg}`,
      `Peak Concurrent People,${detectionSummary.peak}`,
      `Peak Timestamp,${formatTime(detectionSummary.peakTime)}`,
      ``,
      `Timestamp,Concurrent People`,
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

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ================= USERS: CRUD =================
  const openAddUser = () => {
    setEditingUserId(null);
    setUserForm({ name: "", role: "Store Manager" });
    setActiveModal("user");
  };

  const openEditUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({ name: user.name, role: user.role });
    setActiveModal("editUser");
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!userForm.name.trim()) return;
    const newUser = {
      id: `U-${String(users.length + 1).padStart(2, "0")}`,
      name: userForm.name,
      email: `${userForm.name.trim().toLowerCase().replace(/\s+/g, ".")}@cams.io`,
      role: userForm.role,
      status: "Active",
    };
    setUsers((prev) => [...prev, newUser]);
    pushNotification(`New ${userForm.role} Created: ${userForm.name}`, "success");
    setToast(`User "${userForm.name}" added as ${userForm.role}`);
    setUserForm({ name: "", role: "Store Manager" });
    setActiveModal(null);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!userForm.name.trim() || !editingUserId) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUserId ? { ...u, name: userForm.name, role: userForm.role } : u
      )
    );
    pushNotification(`User Updated: ${userForm.name}`, "info");
    setToast(`User "${userForm.name}" updated`);
    setUserForm({ name: "", role: "Store Manager" });
    setEditingUserId(null);
    setActiveModal(null);
  };

  const handleDeleteUser = (user) => {
    if (!window.confirm(`Remove user "${user.name}"? This cannot be undone.`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    pushNotification(`User Removed: ${user.name}`, "danger");
    setToast(`User "${user.name}" removed`);
  };

  const handleToggleUserStatus = (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u
      )
    );
    setToast(`${user.name} is now ${user.status === "Active" ? "Suspended" : "Active"}`);
  };

  // ================= STORES: CRUD =================
  const openAddStore = () => {
    setEditingStoreId(null);
    setStoreForm({ name: "", cameras: "" });
    setActiveModal("store");
  };

  const openEditStore = (store) => {
    setEditingStoreId(store.id);
    setStoreForm({ name: store.name, cameras: String(store.cameras) });
    setActiveModal("editStore");
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

  const handleUpdateStore = (e) => {
    e.preventDefault();
    if (!storeForm.name.trim() || !editingStoreId) return;
    setStores((prev) =>
      prev.map((s) =>
        s.id === editingStoreId
          ? { ...s, name: storeForm.name, cameras: Number(storeForm.cameras) || 0 }
          : s
      )
    );
    pushNotification(`Store Updated: ${storeForm.name}`, "info");
    setToast(`Store "${storeForm.name}" updated`);
    setStoreForm({ name: "", cameras: "" });
    setEditingStoreId(null);
    setActiveModal(null);
  };

  const handleDeleteStore = (store) => {
    if (!window.confirm(`Delete store "${store.name}"? This cannot be undone.`)) return;
    setStores((prev) => prev.filter((s) => s.id !== store.id));
    pushNotification(`Store Removed: ${store.name}`, "danger");
    setToast(`Store "${store.name}" deleted`);
  };

  // ================= CAMERAS: CRUD =================
  const openAddCamera = () => {
    setCameraForm({ storeId: stores[0]?.id || "", count: "" });
    setActiveModal("camera");
  };

  const openEditCamera = (store) => {
    setCameraForm({ storeId: store.id, count: String(store.cameras) });
    setActiveModal("editCamera");
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

  const handleUpdateCameraCount = (e) => {
    e.preventDefault();
    const count = Number(cameraForm.count);
    if (!cameraForm.storeId || Number.isNaN(count) || count < 0) return;
    setStores((prev) =>
      prev.map((s) => (s.id === cameraForm.storeId ? { ...s, cameras: count } : s))
    );
    const store = stores.find((s) => s.id === cameraForm.storeId);
    pushNotification(`Camera Count Updated for ${store?.name}: ${count}`, "info");
    setToast(`${store?.name} now has ${count} camera(s)`);
    setCameraForm({ storeId: stores[0]?.id || "", count: "" });
    setActiveModal(null);
  };

  const handleRemoveAllCameras = (store) => {
    if (store.cameras <= 0) return;
    if (!window.confirm(`Remove all ${store.cameras} camera(s) from "${store.name}"?`)) return;
    setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, cameras: 0 } : s)));
    pushNotification(`All Cameras Removed from ${store.name}`, "danger");
    setToast(`Cameras removed from ${store.name}`);
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

  const closeModal = () => {
    setActiveModal(null);
    setEditingUserId(null);
    setEditingStoreId(null);
  };

  const filteredActiveShoppers = useMemo(
    () => activeShoppers.filter((s) => s.store === selectedTrackingStore),
    [activeShoppers, selectedTrackingStore]
  );

  const filteredCompletedJourneys = useMemo(
    () => completedJourneys.filter((j) => j.store === selectedTrackingStore),
    [completedJourneys, selectedTrackingStore]
  );

  const avgStoreDwell = useMemo(() => {
    if (filteredCompletedJourneys.length === 0) return "22m 30s";
    const sum = filteredCompletedJourneys.reduce((acc, j) => acc + j.totalDwellSec, 0);
    return formatDwellTime(sum / filteredCompletedJourneys.length);
  }, [filteredCompletedJourneys]);

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
            <h1 style={{ fontSize: "16px", fontWeight: "700", margin: 0, lineHeight: 1.2 }}>Admin Dashboard</h1>
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
              { id: "journeys", label: "Customer Journey Tracking", icon: "🛣️" },
              { id: "infrastructure", label: "Infrastructure & Cameras", icon: "📹" },
              { id: "users", label: "User Management", icon: "👤" },
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
              {/* TOP HERO */}
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

              {/* Quick Action Cards */}
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
                      onClick={() => {
                        if (act.id === "report") handleGenerateReport();
                        else if (act.id === "user") openAddUser();
                        else if (act.id === "store") openAddStore();
                        else if (act.id === "camera") openAddCamera();
                      }}
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

                {detectionSummary && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "8px" }}>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: TOKENS.accent }}>{detectionSummary.uniqueCount}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Unique Individuals</div>
                      </div>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: TOKENS.text }}>{detectionSummary.peak}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Peak Concurrent</div>
                      </div>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: TOKENS.text }}>{detectionSummary.avg}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Avg Concurrent</div>
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
                    <p style={{ margin: "0 0 16px", fontSize: "10.5px", color: TOKENS.muted, fontStyle: "italic" }}>
                      "Unique Individuals" counts each detected person once, no matter how many frames they appeared in.
                    </p>

                    <div style={{ maxHeight: "160px", overflowY: "auto", border: `1px solid ${TOKENS.cardBorder}`, borderRadius: "8px", marginBottom: "16px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                          <tr style={{ position: "sticky", top: 0, backgroundColor: TOKENS.cardBg }}>
                            <th style={{ padding: "8px", textAlign: "left", color: TOKENS.muted, borderBottom: `1px solid ${TOKENS.cardBorder}` }}>Timestamp</th>
                            <th style={{ padding: "8px", textAlign: "left", color: TOKENS.muted, borderBottom: `1px solid ${TOKENS.cardBorder}` }}>Concurrent People</th>
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
            </>
          )}

          {/* ================= VIEW 2: CUSTOMER JOURNEY TRACKING ================= */}
          {activeTab === "journeys" && (
            <>
              {/* Header bar controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>🚶 Entrance-to-Exit Customer Tracking</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
                    Real-time multi-camera path trajectories & zone lifecycle tracking
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <select
                    style={{ ...inputStyle, width: "auto" }}
                    value={selectedTrackingStore}
                    onChange={(e) => setSelectedTrackingStore(e.target.value)}
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleSimulateNewShopper}
                    style={{ padding: "8px 14px", backgroundColor: TOKENS.cardBg, border: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.text, borderRadius: "8px", fontWeight: "600", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    + Simulate Entrance
                  </button>
                  <button
                    onClick={handleExportJourneyLogsCSV}
                    style={{ padding: "8px 14px", backgroundColor: TOKENS.cardBg, border: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.text, borderRadius: "8px", fontWeight: "600", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    ⬇ Export CSV
                  </button>
                </div>
              </div>

              {/* Video-Based Customer Journey Tracking */}
              <div style={cardStyle}>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>🎥 Track Customer Journey from Video</h3>
                  <p style={{ margin: 0, fontSize: "11px", color: TOKENS.muted }}>
                    Upload entrance/aisle footage directly — no file path needed — to detect a customer entering the store and generate their full entrance-to-exit journey
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Store</label>
                    <select
                      style={inputStyle}
                      value={selectedTrackingStore}
                      onChange={(e) => setSelectedTrackingStore(e.target.value)}
                      disabled={isTrackingVideo}
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Upload Store Video</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleJourneyVideoUpload}
                      disabled={isTrackingVideo}
                      style={{ ...inputStyle, padding: "8px 10px" }}
                    />
                  </div>
                </div>

                {journeyVideoURL && (
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap" }}>
                    <video
                      ref={journeyVideoRef}
                      src={journeyVideoURL}
                      onLoadedMetadata={handleJourneyVideoLoadedMetadata}
                      controls
                      muted
                      style={{ width: "260px", borderRadius: "8px", backgroundColor: "#000" }}
                    />
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontSize: "12px", color: TOKENS.muted, marginBottom: "4px" }}>
                        {journeyVideoFile?.name} {journeyVideoDuration ? `· ${formatDwellTime(journeyVideoDuration)}` : ""}
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={handleRunJourneyTracking}
                          disabled={isTrackingVideo}
                          style={{
                            padding: "10px 18px",
                            backgroundColor: isTrackingVideo ? TOKENS.cardBorder : TOKENS.accent,
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: isTrackingVideo ? "not-allowed" : "pointer",
                          }}
                        >
                          {isTrackingVideo ? `Tracking… ${trackingProgress}%` : "▶ Track Customer Journey"}
                        </button>
                        <button
                          onClick={handleSimulateJourneyTracking}
                          disabled={isTrackingVideo}
                          title="Generates a journey client-side, without calling the backend — useful for testing the UI before /track-video exists"
                          style={{
                            padding: "10px 18px",
                            backgroundColor: "transparent",
                            color: isTrackingVideo ? TOKENS.muted : TOKENS.text,
                            border: `1px solid ${TOKENS.cardBorder}`,
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: isTrackingVideo ? "not-allowed" : "pointer",
                          }}
                        >
                          🧪 Simulate (Demo — no backend)
                        </button>
                      </div>

                      {isTrackingVideo && (
                        <div style={{ width: "100%", height: "6px", backgroundColor: TOKENS.bg, borderRadius: "4px", overflow: "hidden", marginTop: "10px" }}>
                          <div style={{ width: `${trackingProgress}%`, height: "100%", backgroundColor: TOKENS.accent, transition: "width 0.15s linear" }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {trackedJourney && (
                  <>
                    {trackedJourney.simulated && (
                      <div style={{ display: "inline-block", padding: "3px 8px", borderRadius: "999px", backgroundColor: TOKENS.info, color: "#fff", fontSize: "10px", fontWeight: "700", marginBottom: "10px" }}>
                        🧪 DEMO — generated client-side, no backend call
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: TOKENS.accent }}>{trackedJourney.id}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Customer ID</div>
                      </div>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: TOKENS.text }}>{trackedJourney.entryTime} → {trackedJourney.exitTime}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Entry → Exit</div>
                      </div>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: TOKENS.info }}>{formatDwellTime(trackedJourney.totalDwellSec)}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Total Dwell Time</div>
                      </div>
                      <div style={{ backgroundColor: TOKENS.bg, padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: TOKENS.success }}>{trackedJourney.path.length}</div>
                        <div style={{ fontSize: "10px", color: TOKENS.muted }}>Zones Visited</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "11px", color: TOKENS.muted, fontWeight: 600, marginBottom: "8px" }}>JOURNEY PATH</div>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                        {trackedJourney.path.map((zone, i) => (
                          <React.Fragment key={i}>
                            <span
                              style={{
                                padding: "6px 10px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "600",
                                backgroundColor: i === 0 ? TOKENS.info : i === trackedJourney.path.length - 1 ? TOKENS.danger : TOKENS.cardBg,
                                border: `1px solid ${TOKENS.cardBorder}`,
                                color: TOKENS.text,
                              }}
                            >
                              {zone}
                            </span>
                            {i < trackedJourney.path.length - 1 && (
                              <span style={{ color: TOKENS.muted, fontSize: "12px" }}>→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {!journeyVideoURL && (
                  <div style={{ fontSize: "12px", color: TOKENS.muted }}>
                    Select a store and upload a video clip to detect and track a customer's in-store journey.
                  </div>
                )}
              </div>

              {/* Top Stats Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, fontWeight: 600 }}>ACTIVE IN-STORE SHOPPERS</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: TOKENS.accent, marginTop: "6px" }}>{filteredActiveShoppers.length}</div>
                  <div style={{ fontSize: "10px", color: TOKENS.success, marginTop: "4px" }}>● Live Trajectories Active</div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, fontWeight: 600 }}>COMPLETED JOURNEYS (TODAY)</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: TOKENS.text, marginTop: "6px" }}>{filteredCompletedJourneys.length}</div>
                  <div style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "4px" }}>Entrance to Exit</div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, fontWeight: 600 }}>AVG STORE DWELL TIME</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: TOKENS.info, marginTop: "6px" }}>{avgStoreDwell}</div>
                  <div style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "4px" }}>Across completed journeys</div>
                </div>
                <div style={cardStyle}>
                  <div style={{ fontSize: "11px", color: TOKENS.muted, fontWeight: 600 }}>FULL JOURNEY COMPLETION</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: TOKENS.success, marginTop: "6px" }}>94.2%</div>
                  <div style={{ fontSize: "10px", color: TOKENS.muted, marginTop: "4px" }}>Checkout & Exit Verified</div>
                </div>
              </div>

              {/* Interactive Floorplan Trajectory Map */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>🗺 Live Store Floorplan Trajectories</h3>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: TOKENS.muted }}>
                      Visualizing active shopper paths from entrance (left) to checkout and exit (right)
                    </p>
                  </div>
                  <span style={{ fontSize: "11px", color: TOKENS.muted, backgroundColor: TOKENS.bg, padding: "4px 8px", borderRadius: "6px" }}>
                    Showing: {selectedTrackingStore}
                  </span>
                </div>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "360px",
                    backgroundColor: "#070A10",
                    borderRadius: "10px",
                    border: `1px solid ${TOKENS.cardBorder}`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `linear-gradient(${TOKENS.cardBorder} 1px, transparent 1px), linear-gradient(90deg, ${TOKENS.cardBorder} 1px, transparent 1px)`,
                      backgroundSize: "36px 36px",
                      opacity: 0.25,
                    }}
                  />

                  {STORE_ZONES.map((zone) => (
                    <div
                      key={zone.name}
                      style={{
                        position: "absolute",
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                        backgroundColor: zone.color,
                        border: `1px dashed ${TOKENS.cardBorder}`,
                        borderRadius: "8px",
                        padding: "6px",
                        boxSizing: "border-box",
                        opacity: 0.85,
                      }}
                    >
                      <span style={{ fontSize: "10px", fontWeight: "700", color: TOKENS.muted }}>{zone.name}</span>
                    </div>
                  ))}

                  {filteredActiveShoppers.map((shopper) => (
                    <div
                      key={shopper.id}
                      style={{
                        position: "absolute",
                        left: `${shopper.posX}%`,
                        top: `${shopper.posY}%`,
                        transform: "translate(-50%, -50%)",
                        transition: "all 0.8s ease",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: shopper.color,
                          border: "2px solid #fff",
                          boxShadow: `0 0 12px ${shopper.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "9px",
                          fontWeight: "800",
                          color: "#1A1200",
                        }}
                      >
                        🚶
                      </div>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: "700",
                          color: "#fff",
                          backgroundColor: "rgba(0,0,0,0.75)",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          marginTop: "2px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {shopper.id} ({formatDwellTime(shopper.dwellSec)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Shoppers Live Sessions Table */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "700" }}>🟢 Active In-Store Shopper Sessions</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                      <th style={{ padding: "8px" }}>Shopper ID</th>
                      <th style={{ padding: "8px" }}>Store</th>
                      <th style={{ padding: "8px" }}>Entry Time</th>
                      <th style={{ padding: "8px" }}>Current Zone</th>
                      <th style={{ padding: "8px" }}>Visited Path</th>
                      <th style={{ padding: "8px" }}>Live Dwell</th>
                      <th style={{ padding: "8px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActiveShoppers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: "16px", color: TOKENS.muted, textAlign: "center" }}>
                          No active shoppers being tracked in this store right now. Click "+ Simulate Entrance" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredActiveShoppers.map((s) => (
                        <tr key={s.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                          <td style={{ padding: "12px 8px", fontWeight: "700", color: s.color }}>{s.id}</td>
                          <td style={{ padding: "12px 8px" }}>{s.store}</td>
                          <td style={{ padding: "12px 8px", fontFamily: "monospace" }}>{s.entryTime}</td>
                          <td style={{ padding: "12px 8px" }}>
                            <span style={{ backgroundColor: TOKENS.bg, padding: "3px 8px", borderRadius: "4px", fontSize: "11px", border: `1px solid ${TOKENS.cardBorder}` }}>
                              📍 {s.currentZone}
                            </span>
                          </td>
                          <td style={{ padding: "12px 8px", fontSize: "11px", color: TOKENS.muted }}>
                            {s.zonesVisited.join(" → ")}
                          </td>
                          <td style={{ padding: "12px 8px", fontWeight: "700", color: TOKENS.accent, fontFamily: "monospace" }}>
                            ⏱ {formatDwellTime(s.dwellSec)}
                          </td>
                          <td style={{ padding: "12px 8px" }}>
                            <button
                              onClick={() => handleSimulateShopperExit(s)}
                              style={smallBtn(TOKENS.danger)}
                            >
                              Trigger Exit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Completed Journey Lifecycle Logs */}
              <div style={cardStyle}>
                <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "700" }}>📜 Completed Customer Journeys Log</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                      <th style={{ padding: "8px" }}>Shopper ID</th>
                      <th style={{ padding: "8px" }}>Store</th>
                      <th style={{ padding: "8px" }}>Entry Time</th>
                      <th style={{ padding: "8px" }}>Exit Time</th>
                      <th style={{ padding: "8px" }}>Total Dwell</th>
                      <th style={{ padding: "8px" }}>Full Trajectory Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompletedJourneys.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "16px", color: TOKENS.muted, textAlign: "center" }}>
                          No completed journeys recorded yet for this store.
                        </td>
                      </tr>
                    ) : (
                      filteredCompletedJourneys.map((j) => (
                        <tr key={j.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                          <td style={{ padding: "12px 8px", fontWeight: "600" }}>{j.id}</td>
                          <td style={{ padding: "12px 8px" }}>{j.store}</td>
                          <td style={{ padding: "12px 8px", fontFamily: "monospace" }}>{j.entryTime}</td>
                          <td style={{ padding: "12px 8px", fontFamily: "monospace" }}>{j.exitTime}</td>
                          <td style={{ padding: "12px 8px", fontWeight: "700", color: TOKENS.success }}>{formatDwellTime(j.totalDwellSec)}</td>
                          <td style={{ padding: "12px 8px", fontSize: "11px", color: TOKENS.muted }}>
                            {j.path.join(" ➔ ")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= VIEW 3: INFRASTRUCTURE & CAMERAS ================= */}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>Live Infrastructure Stores & Node Status</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={openAddStore} style={smallBtn(TOKENS.accent)}>+ Add Store</button>
                    <button onClick={openAddCamera} style={smallBtn(TOKENS.info)}>+ Add Camera</button>
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                      <th style={{ padding: "8px" }}>Store Name</th>
                      <th style={{ padding: "8px" }}>Cameras</th>
                      <th style={{ padding: "8px" }}>Active Users</th>
                      <th style={{ padding: "8px" }}>AI Engine Status</th>
                      <th style={{ padding: "8px" }}>Last Sync</th>
                      <th style={{ padding: "8px" }}>Actions</th>
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
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            <button onClick={() => openEditStore(s)} style={smallBtn(TOKENS.accent, { marginRight: 0 })}>Edit</button>
                            <button onClick={() => handleDeleteStore(s)} style={smallBtn(TOKENS.danger, { marginRight: 0 })}>Delete</button>
                            <button onClick={() => openEditCamera(s)} style={smallBtn(TOKENS.info, { marginRight: 0 })}>Edit Cams</button>
                            <button onClick={() => handleRemoveAllCameras(s)} style={smallBtn(TOKENS.warning, { marginRight: 0 })}>Clear Cams</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= VIEW 4: USER MANAGEMENT (CRUD) ================= */}
          {activeTab === "users" && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>👤 User Management</h3>
                  <p style={{ margin: 0, fontSize: "11px", color: TOKENS.muted }}>Create, update, suspend, or remove platform users</p>
                </div>
                <button onClick={openAddUser} style={smallBtn(TOKENS.accent, { padding: "8px 14px", fontSize: "12px" })}>+ Add User</button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                    <th style={{ padding: "8px" }}>Name</th>
                    <th style={{ padding: "8px" }}>Email</th>
                    <th style={{ padding: "8px" }}>Role</th>
                    <th style={{ padding: "8px" }}>Status</th>
                    <th style={{ padding: "8px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "16px 8px", color: TOKENS.muted, textAlign: "center" }}>
                        No users yet — add one to get started.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                        <td style={{ padding: "12px 8px", fontWeight: "600" }}>{u.name}</td>
                        <td style={{ padding: "12px 8px", color: TOKENS.muted }}>{u.email}</td>
                        <td style={{ padding: "12px 8px" }}>{u.role}</td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ color: u.status === "Active" ? TOKENS.success : TOKENS.danger, fontWeight: "bold" }}>
                            ● {u.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            <button onClick={() => openEditUser(u)} style={smallBtn(TOKENS.accent, { marginRight: 0 })}>Edit</button>
                            <button onClick={() => handleToggleUserStatus(u)} style={smallBtn(TOKENS.warning, { marginRight: 0 })}>
                              {u.status === "Active" ? "Suspend" : "Activate"}
                            </button>
                            <button onClick={() => handleDeleteUser(u)} style={smallBtn(TOKENS.danger, { marginRight: 0 })}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= VIEW 5: SYSTEM & API HEALTH ================= */}
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

          {/* ================= VIEW 6: SECURITY & PERMISSIONS ================= */}
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
                    {users.slice(0, 4).map((u, i) => (
                      <div key={u.id} style={{ padding: "8px", backgroundColor: TOKENS.bg, borderRadius: "4px" }}>
                        <strong>{u.name}</strong> — <span style={{ color: TOKENS.muted }}>{u.role}</span> ({(i + 1) * 3} min ago)
                      </div>
                    ))}
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
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={handleResetDemoData}
            style={{ background: "none", border: "none", color: TOKENS.muted, fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}
          >
            Reset demo data
          </button>
          <span>Version 2.5.0 | Build 260 | Updated Today</span>
        </div>
      </footer>

      {/* ================= QUICK ACTION / CRUD MODALS ================= */}

      {/* Add User */}
      {activeModal === "user" && (
        <Modal title="Add New User" onClose={closeModal}>
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

      {/* Edit User */}
      {activeModal === "editUser" && (
        <Modal title="Edit User" onClose={closeModal}>
          <form onSubmit={handleUpdateUser}>
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
              Save Changes
            </button>
          </form>
        </Modal>
      )}

      {/* Add Store */}
      {activeModal === "store" && (
        <Modal title="Register New Store" onClose={closeModal}>
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

      {/* Edit Store */}
      {activeModal === "editStore" && (
        <Modal title="Edit Store" onClose={closeModal}>
          <form onSubmit={handleUpdateStore}>
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
              <label style={labelStyle}>Camera Count</label>
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
              Save Changes
            </button>
          </form>
        </Modal>
      )}

      {/* Add Camera(s) */}
      {activeModal === "camera" && (
        <Modal title="Add Camera" onClose={closeModal}>
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

      {/* Edit Camera Count */}
      {activeModal === "editCamera" && (
        <Modal title="Edit Camera Count" onClose={closeModal}>
          <form onSubmit={handleUpdateCameraCount}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Store</label>
              <select style={{ ...inputStyle, opacity: 0.7 }} value={cameraForm.storeId} disabled>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Exact Camera Count</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                value={cameraForm.count}
                onChange={(e) => setCameraForm({ ...cameraForm, count: e.target.value })}
                placeholder="e.g. 12"
                autoFocus
              />
            </div>
            <button
              type="submit"
              style={{ width: "100%", padding: "10px", backgroundColor: TOKENS.accent, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
            >
              Update Count
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}