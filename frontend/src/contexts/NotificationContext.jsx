import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    category: 'Camera Alerts',
    title: 'Camera #04 (Aisle 3 Eye-Level) Motion Spike',
    message: 'Sudden 65% surge in customer gaze fixation detected on Shelf B3 (Premium Organic Juices).',
    timestamp: '2 mins ago',
    read: false,
    severity: 'warning',
  },
  {
    id: 'notif-2',
    category: 'AI Recommendations',
    title: 'Shelf Re-alignment Opportunity',
    message: 'Moving "Sparkling Water 6-pack" from bottom to eye-level could boost conversion by +28.4%.',
    timestamp: '15 mins ago',
    read: false,
    severity: 'success',
  },
  {
    id: 'notif-3',
    category: 'Traffic Alerts',
    title: 'Peak Hourly Footfall Threshold Exceeded',
    message: 'Main Entrance camera recorded 142 visitors/10 mins (+45% above Friday baseline).',
    timestamp: '42 mins ago',
    read: false,
    severity: 'info',
  },
  {
    id: 'notif-4',
    category: 'Product Alerts',
    title: 'Low Dwell-to-Touch Ratio on Shelf A2',
    message: 'High eye-fixation (4.2s avg) but zero cart additions for Product ID #9042.',
    timestamp: '1 hour ago',
    read: true,
    severity: 'warning',
  },
  {
    id: 'notif-5',
    category: 'System Notifications',
    title: 'Edge AI Camera Cluster Synchronized',
    message: 'All 12 spatial cameras running TensorRT model v2.4 with 60 FPS gaze tracking.',
    timestamp: '3 hours ago',
    read: true,
    severity: 'info',
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      read: false,
      severity: 'info',
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
