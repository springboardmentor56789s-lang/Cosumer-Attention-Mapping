import React, {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  FaChartLine,
  FaStore,
  FaLayerGroup,
  FaBoxOpen,
  FaVideo,
  FaChartBar,
  FaFire,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaFileAlt,
} from "react-icons/fa";

import {
  getUnreadNotificationCount,
} from "../services/api";

import "./Sidebar.css";


function Sidebar() {

  const navigate = useNavigate();


  /* =====================================================
     NOTIFICATION COUNT
  ===================================================== */

  const [unreadCount, setUnreadCount] =
    useState(0);


  /* =====================================================
     LOAD UNREAD NOTIFICATIONS
  ===================================================== */

  const loadUnreadNotifications =
    async () => {

      try {

        const response =
          await getUnreadNotificationCount();

        const count =
          response?.data?.unread_count || 0;

        setUnreadCount(count);

      } catch (error) {

        console.warn(
          "Unable to load notification count:",
          error
        );

        setUnreadCount(0);

      }

    };


  /* =====================================================
     LOAD ON SIDEBAR START
  ===================================================== */

  useEffect(() => {

    loadUnreadNotifications();


    /*
      Refresh notification count every 30 seconds.
      Existing application functionality is unchanged.
    */

    const interval =
      setInterval(
        loadUnreadNotifications,
        30000
      );


    return () => {

      clearInterval(interval);

    };

  }, []);


  /* =====================================================
     MENU ITEMS
  ===================================================== */

  const menuItems = [

    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <FaChartLine />,
    },

    {
      label: "Stores",
      path: "/stores",
      icon: <FaStore />,
    },

    {
      label: "Shelves",
      path: "/shelves",
      icon: <FaLayerGroup />,
    },

    {
      label: "Products",
      path: "/products",
      icon: <FaBoxOpen />,
    },

    {
      label: "Cameras",
      path: "/cameras",
      icon: <FaVideo />,
    },

    {
      label: "Analytics",
      path: "/analytics",
      icon: <FaChartBar />,
    },

    {
      label: "Heatmaps",
      path: "/heatmaps",
      icon: <FaFire />,
    },

    /*
      NEW:
      Notifications
    */

    {
      label: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
      notification: true,
    },

    /*
      NEW:
      Reports
    */

    {
      label: "Reports",
      path: "/reports",
      icon: <FaFileAlt />,
    },

  ];


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user_email"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "latest_analysis"
    );


    navigate(
      "/login",
      {
        replace: true
      }
    );

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <aside className="sidebar">


      {/* =================================================
          BRAND
      ================================================= */}

      <div className="sidebar-brand">

        <div className="brand-logo">
          CA
        </div>


        <div className="brand-text">

          <strong>
            NexSight AI
          </strong>

          <span>
            Consumer Analytics
          </span>

        </div>

      </div>


      <div className="sidebar-divider"></div>


      {/* =================================================
          MAIN MENU
      ================================================= */}

      <div className="sidebar-section-title">

        MAIN MENU

      </div>


      <nav className="sidebar-nav">


        {menuItems.map((item) => (

          <NavLink

            key={item.path}

            to={item.path}

            className={({ isActive }) =>
              `sidebar-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }

          >


            {/* ICON */}

            <span className="sidebar-icon">

              {item.icon}

            </span>


            {/* LABEL */}

            <span className="sidebar-label">

              {item.label}

            </span>


            {/* =================================================
                NOTIFICATION BADGE
            ================================================= */}

            {item.notification &&
              unreadCount > 0 && (

                <span className="notification-badge">

                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}

                </span>

              )}

          </NavLink>

        ))}


      </nav>


      {/* =================================================
          SYSTEM
      ================================================= */}

      <div className="sidebar-system">


        <div className="sidebar-section-title">

          SYSTEM

        </div>


        <NavLink

          to="/settings"

          className={({ isActive }) =>
            `sidebar-link ${
              isActive
                ? "active"
                : ""
            }`
          }

        >

          <span className="sidebar-icon">

            <FaCog />

          </span>


          <span className="sidebar-label">

            Settings

          </span>


        </NavLink>


      </div>


      {/* =================================================
          LOGOUT
      ================================================= */}

      <div className="sidebar-bottom">


        <button

          className="sidebar-logout"

          onClick={handleLogout}

        >

          <FaSignOutAlt />


          <span>

            Logout

          </span>


        </button>


      </div>


    </aside>

  );

}


export default Sidebar;