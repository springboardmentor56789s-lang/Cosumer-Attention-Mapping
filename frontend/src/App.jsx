import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Breadcrumbs from './components/layout/Breadcrumbs';
import DashboardPage from './pages/Dashboard/DashboardPage';
import WorkerDashboardPage from './pages/Dashboard/WorkerDashboardPage';

// Auth Pages (PRD V2.0 Compliance)
import LandingPage from './pages/Landing/LandingPage';
import ManagerLogin from './auth/manager/ManagerLogin';
import ManagerRegister from './auth/manager/ManagerRegister';
import WorkerLogin from './auth/worker/WorkerLogin';
import WorkerRegister from './auth/worker/WorkerRegister';

// Core Analytics Pages
import StoresPage from './pages/Stores/StoresPage';
import ShelvesPage from './pages/Shelves/ShelvesPage';
import VideoAnalysisPage from './pages/VideoAnalysis/VideoAnalysisPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import AIRecommendationsPage from './pages/Recommendations/AIRecommendationsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import RetailIntelligencePage from './pages/Intelligence/RetailIntelligencePage';


import { useAuth } from './contexts/AuthContext';

// Protected Layout Wrapper for Manager Routes
const ProtectedManagerLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (user.role === 'Worker') {
    return <Navigate to="/worker-dashboard" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F172A] text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {children}
        </main>
      </div>
    </div>
  );

};

// Protected Layout for Worker Workspace
const ProtectedWorkerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Unauthenticated Entry Point */}
      <Route path="/auth" element={<LandingPage />} />
      <Route path="/auth/manager/login" element={<ManagerLogin />} />
      <Route path="/auth/manager/register" element={<ManagerRegister />} />
      <Route path="/auth/worker/login" element={<WorkerLogin />} />
      <Route path="/auth/worker/register" element={<WorkerRegister />} />

      {/* Worker Dashboard */}
      <Route
        path="/worker-dashboard"
        element={
          <ProtectedWorkerRoute>
            <WorkerDashboardPage />
          </ProtectedWorkerRoute>
        }
      />

      {/* Root Redirect based on user role */}
      <Route
        path="/"
        element={
          user ? (
            user.role === 'Worker' ? (
              <Navigate to="/worker-dashboard" replace />
            ) : (
              <Navigate to="/manager-dashboard" replace />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      {/* Manager Protected Workspace Routes */}
      <Route
        path="/manager-dashboard"
        element={
          <ProtectedManagerLayout>
            <DashboardPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/stores"
        element={
          <ProtectedManagerLayout>
            <StoresPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/shelves"
        element={
          <ProtectedManagerLayout>
            <ShelvesPage />
          </ProtectedManagerLayout>
        }
      />

      {/* Video Analysis AI Workspace */}
      <Route
        path="/cameras"
        element={
          <ProtectedManagerLayout>
            <VideoAnalysisPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/video-analysis"
        element={
          <ProtectedManagerLayout>
            <VideoAnalysisPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedManagerLayout>
            <AnalyticsPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/intelligence"
        element={
          <ProtectedManagerLayout>
            <RetailIntelligencePage />
          </ProtectedManagerLayout>
        }
      />


      <Route
        path="/recommendations"
        element={
          <ProtectedManagerLayout>
            <AIRecommendationsPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedManagerLayout>
            <ReportsPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedManagerLayout>
            <NotificationsPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedManagerLayout>
            <SettingsPage />
          </ProtectedManagerLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedManagerLayout>
            <ProfilePage />
          </ProtectedManagerLayout>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
