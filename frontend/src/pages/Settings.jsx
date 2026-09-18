import React, { useState } from "react";
import "../styles/Settings.css";

function Settings() {
  // =========================================================
  // PROFILE SETTINGS
  // =========================================================

  const [profile, setProfile] = useState({
    name: "User",
    email: "user@example.com",
  });

  // =========================================================
  // AI SETTINGS
  // =========================================================

  const [aiSettings, setAiSettings] = useState({
    personDetection: true,
    productDetection: true,
    movementTracking: true,
    dwellAnalysis: true,
    gazeAnalysis: false,
  });

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [notifications, setNotifications] = useState({
    analysisCompleted: true,
    weeklyReport: true,
    systemUpdates: false,
    importantAlerts: true,
  });

  // =========================================================
  // DASHBOARD SETTINGS
  // =========================================================

  const [dashboard, setDashboard] = useState({
    darkMode: true,
    autoRefresh: true,
    refreshInterval: "30",
  });

  // =========================================================
  // STORE SETTINGS
  // =========================================================

  const [storeSettings, setStoreSettings] = useState({
    defaultStore: "",
    defaultCamera: "",
    timezone: "Asia/Kolkata",
  });

  const [message, setMessage] = useState("");

  // =========================================================
  // PROFILE HANDLER
  // =========================================================

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================================
  // TOGGLE HANDLER
  // =========================================================

  const toggleSetting = (section, key) => {
    if (section === "ai") {
      setAiSettings({
        ...aiSettings,
        [key]: !aiSettings[key],
      });
    }

    if (section === "notifications") {
      setNotifications({
        ...notifications,
        [key]: !notifications[key],
      });
    }

    if (section === "dashboard") {
      setDashboard({
        ...dashboard,
        [key]: !dashboard[key],
      });
    }
  };

  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  const handleSave = () => {
    console.log({
      profile,
      aiSettings,
      notifications,
      dashboard,
      storeSettings,
    });

    setMessage("Settings saved successfully!");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="settings-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="settings-header">

        <div>

          <span className="page-label">
            SYSTEM PREFERENCES
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your account, AI analysis and dashboard preferences
          </p>

        </div>

        <button
          className="save-all-btn"
          onClick={handleSave}
        >
          Save Settings
        </button>

      </div>


      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="settings-message">
          ✓ {message}
        </div>
      )}


      {/* =====================================================
          PROFILE SETTINGS
      ====================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="section-label">
              ACCOUNT
            </span>

            <h2>
              👤 Profile Settings
            </h2>

            <p>
              Manage your account information
            </p>

          </div>

        </div>


        <div className="settings-form-grid">

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              placeholder="Enter your name"
            />

          </div>


          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              placeholder="Enter your email"
            />

          </div>

        </div>

      </div>


      {/* =====================================================
          STORE SETTINGS
      ====================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="section-label">
              RETAIL SYSTEM
            </span>

            <h2>
              🏪 Store Preferences
            </h2>

            <p>
              Configure your default retail environment
            </p>

          </div>

        </div>


        <div className="settings-form-grid">

          <div className="form-group">

            <label>
              Default Store
            </label>

            <select
              value={storeSettings.defaultStore}
              onChange={(e) =>
                setStoreSettings({
                  ...storeSettings,
                  defaultStore: e.target.value,
                })
              }
            >

              <option value="">
                Select Store
              </option>

              <option value="Store 1">
                Store 1
              </option>

              <option value="Store 2">
                Store 2
              </option>

              <option value="Store 3">
                Store 3
              </option>

            </select>

          </div>


          <div className="form-group">

            <label>
              Default Camera
            </label>

            <select
              value={storeSettings.defaultCamera}
              onChange={(e) =>
                setStoreSettings({
                  ...storeSettings,
                  defaultCamera: e.target.value,
                })
              }
            >

              <option value="">
                Select Camera
              </option>

              <option value="Camera 01">
                Camera 01
              </option>

              <option value="Camera 02">
                Camera 02
              </option>

              <option value="Camera 03">
                Camera 03
              </option>

            </select>

          </div>


          <div className="form-group">

            <label>
              Timezone
            </label>

            <select
              value={storeSettings.timezone}
              onChange={(e) =>
                setStoreSettings({
                  ...storeSettings,
                  timezone: e.target.value,
                })
              }
            >

              <option value="Asia/Kolkata">
                Asia/Kolkata
              </option>

              <option value="UTC">
                UTC
              </option>

              <option value="America/New_York">
                America/New_York
              </option>

            </select>

          </div>

        </div>

      </div>


      {/* =====================================================
          AI ANALYSIS SETTINGS
      ====================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="section-label">
              ARTIFICIAL INTELLIGENCE
            </span>

            <h2>
              🤖 AI Analysis Settings
            </h2>

            <p>
              Control which AI features are used during video analysis
            </p>

          </div>

        </div>


        <div className="settings-options">


          <SettingToggle
            icon="👥"
            title="Person Detection"
            description="Detect and track shoppers in the video"
            enabled={aiSettings.personDetection}
            onChange={() =>
              toggleSetting(
                "ai",
                "personDetection"
              )
            }
          />


          <SettingToggle
            icon="📦"
            title="Product Detection"
            description="Detect products and retail items"
            enabled={aiSettings.productDetection}
            onChange={() =>
              toggleSetting(
                "ai",
                "productDetection"
              )
            }
          />


          <SettingToggle
            icon="🚶"
            title="Movement Tracking"
            description="Track shopper movement and journey paths"
            enabled={aiSettings.movementTracking}
            onChange={() =>
              toggleSetting(
                "ai",
                "movementTracking"
              )
            }
          />


          <SettingToggle
            icon="⏱"
            title="Dwell Time Analysis"
            description="Measure how long shoppers stay in areas"
            enabled={aiSettings.dwellAnalysis}
            onChange={() =>
              toggleSetting(
                "ai",
                "dwellAnalysis"
              )
            }
          />


          <SettingToggle
            icon="👁"
            title="Attention Analysis"
            description="Analyze shopper attention and gaze information"
            enabled={aiSettings.gazeAnalysis}
            onChange={() =>
              toggleSetting(
                "ai",
                "gazeAnalysis"
              )
            }
          />


        </div>

      </div>


      {/* =====================================================
          NOTIFICATIONS
      ====================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="section-label">
              ALERTS
            </span>

            <h2>
              🔔 Notifications
            </h2>

            <p>
              Choose when you want to receive notifications
            </p>

          </div>

        </div>


        <div className="settings-options">


          <SettingToggle
            icon="✓"
            title="Analysis Completed"
            description="Notify when video analysis is finished"
            enabled={notifications.analysisCompleted}
            onChange={() =>
              toggleSetting(
                "notifications",
                "analysisCompleted"
              )
            }
          />


          <SettingToggle
            icon="📊"
            title="Weekly Reports"
            description="Receive weekly consumer analytics summaries"
            enabled={notifications.weeklyReport}
            onChange={() =>
              toggleSetting(
                "notifications",
                "weeklyReport"
              )
            }
          />


          <SettingToggle
            icon="⚙"
            title="System Updates"
            description="Receive information about new system updates"
            enabled={notifications.systemUpdates}
            onChange={() =>
              toggleSetting(
                "notifications",
                "systemUpdates"
              )
            }
          />


          <SettingToggle
            icon="⚠"
            title="Important Alerts"
            description="Receive important system and analysis alerts"
            enabled={notifications.importantAlerts}
            onChange={() =>
              toggleSetting(
                "notifications",
                "importantAlerts"
              )
            }
          />


        </div>

      </div>


      {/* =====================================================
          DASHBOARD SETTINGS
      ====================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="section-label">
              INTERFACE
            </span>

            <h2>
              🎨 Dashboard Preferences
            </h2>

            <p>
              Customize your analytics dashboard experience
            </p>

          </div>

        </div>


        <div className="settings-options">


          <SettingToggle
            icon="🌙"
            title="Dark Mode"
            description="Use the NexSight AI dark interface"
            enabled={dashboard.darkMode}
            onChange={() =>
              toggleSetting(
                "dashboard",
                "darkMode"
              )
            }
          />


          <SettingToggle
            icon="↻"
            title="Auto Refresh"
            description="Automatically refresh analytics data"
            enabled={dashboard.autoRefresh}
            onChange={() =>
              toggleSetting(
                "dashboard",
                "autoRefresh"
              )
            }
          />


        </div>


        <div className="refresh-interval">

          <label>
            Auto Refresh Interval
          </label>

          <select
            value={dashboard.refreshInterval}
            onChange={(e) =>
              setDashboard({
                ...dashboard,
                refreshInterval: e.target.value,
              })
            }
          >

            <option value="15">
              15 seconds
            </option>

            <option value="30">
              30 seconds
            </option>

            <option value="60">
              1 minute
            </option>

            <option value="300">
              5 minutes
            </option>

          </select>

        </div>

      </div>


      {/* =====================================================
          SECURITY
      ====================================================== */}

      <div className="settings-card">

        <div className="settings-card-header">

          <div>

            <span className="section-label">
              SECURITY
            </span>

            <h2>
              🔐 Change Password
            </h2>

            <p>
              Update your account password securely
            </p>

          </div>

        </div>


        <div className="password-grid">

          <div className="form-group">

            <label>
              Current Password
            </label>

            <input
              type="password"
              placeholder="Enter current password"
            />

          </div>


          <div className="form-group">

            <label>
              New Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
            />

          </div>


          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm new password"
            />

          </div>

        </div>


        <button className="secondary-btn">
          Update Password
        </button>

      </div>


      {/* =====================================================
          DANGER ZONE
      ====================================================== */}

      <div className="settings-card danger-card">

        <div className="settings-card-header">

          <div>

            <span className="danger-label">
              DANGER ZONE
            </span>

            <h2>
              ⚠ Account Management
            </h2>

            <p>
              These actions require extra caution
            </p>

          </div>

        </div>


        <div className="danger-row">

          <div>

            <strong>
              Delete Account
            </strong>

            <p>
              Permanently remove your account and stored preferences.
            </p>

          </div>


          <button className="delete-btn">
            Delete Account
          </button>

        </div>

      </div>


    </div>
  );
}


// =========================================================
// SETTING TOGGLE COMPONENT
// =========================================================

function SettingToggle({
  icon,
  title,
  description,
  enabled,
  onChange,
}) {

  return (

    <div className="setting-option">

      <div className="setting-left">

        <div className="setting-icon">
          {icon}
        </div>


        <div>

          <h3>
            {title}
          </h3>

          <p>
            {description}
          </p>

        </div>

      </div>


      <button
        type="button"
        className={`toggle-switch ${
          enabled ? "active" : ""
        }`}
        onClick={onChange}
      >

        <span
          className="toggle-circle"
        />

      </button>

    </div>

  );
}


export default Settings;