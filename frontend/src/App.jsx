import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Stores from "./pages/Stores";
import Shelves from "./pages/Shelves";
import Products from "./pages/Products";
import Cameras from "./pages/Cameras";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Heatmaps from "./pages/Heatmaps";
import Notifications from "./pages/Notifications";

import "./App.css";


/* =====================================================
   PROTECTED LAYOUT
===================================================== */

function ProtectedLayout({ children }) {

  /*
    Support both token names.

    Your application may use:
    access_token

    OR:
    token
  */

  const accessToken =
    localStorage.getItem("access_token");

  const token =
    localStorage.getItem("token");


  const authToken =
    accessToken || token;


  /* =====================================================
     CHECK LOGIN
  ===================================================== */

  if (!authToken) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  /* =====================================================
     PROTECTED PAGE LAYOUT
  ===================================================== */

  return (

    <div className="app-shell">

      <Sidebar />

      <main className="app-main">

        <div className="page-container">

          {children}

        </div>

      </main>

    </div>

  );

}


/* =====================================================
   APP
===================================================== */

function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={

            <ProtectedLayout>

              <Dashboard />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            STORES
        ================================================= */}

        <Route
          path="/stores"
          element={

            <ProtectedLayout>

              <Stores />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            SHELVES
        ================================================= */}

        <Route
          path="/shelves"
          element={

            <ProtectedLayout>

              <Shelves />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            PRODUCTS
        ================================================= */}

        <Route
          path="/products"
          element={

            <ProtectedLayout>

              <Products />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            CAMERAS
        ================================================= */}

        <Route
          path="/cameras"
          element={

            <ProtectedLayout>

              <Cameras />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            ANALYTICS
        ================================================= */}

        <Route
          path="/analytics"
          element={

            <ProtectedLayout>

              <Analytics />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            HEATMAPS
        ================================================= */}

        <Route
          path="/heatmaps"
          element={

            <ProtectedLayout>

              <Heatmaps />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Route
          path="/notifications"
          element={

            <ProtectedLayout>

              <Notifications />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="/settings"
          element={

            <ProtectedLayout>

              <Settings />

            </ProtectedLayout>

          }
        />


        {/* =================================================
            ROOT
        ================================================= */}

        <Route
          path="/"
          element={

            <Navigate
              to="/dashboard"
              replace
            />

          }
        />


        {/* =================================================
            UNKNOWN ROUTES
        ================================================= */}

        <Route
          path="*"
          element={

            <Navigate
              to="/dashboard"
              replace
            />

          }
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;