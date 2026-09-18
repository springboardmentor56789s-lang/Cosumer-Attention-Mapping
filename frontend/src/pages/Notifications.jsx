import React, {
  useEffect,
  useState,
} from "react";

import {
  FaBell,
  FaSyncAlt,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaExclamationTriangle,
  FaTrafficLight,
  FaVideo,
  FaEye,
  FaClock,
} from "react-icons/fa";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/api";

import "../styles/Notifications.css";


function Notifications() {

  // =====================================================
  // STATES
  // =====================================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);


  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await getNotifications();

      const data =
        response?.data;

      setNotifications(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Notifications loading error:",
        err
      );

      setError(

        err?.response?.data?.detail ||

        err?.message ||

        "Unable to load notifications."

      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {

    loadNotifications();

  }, []);


  // =====================================================
  // MARK SINGLE AS READ
  // =====================================================

  const handleMarkAsRead = async (
    notificationId
  ) => {

    try {

      setActionLoading(true);

      await markNotificationAsRead(
        notificationId
      );


      setNotifications(
        (previousNotifications) =>

          previousNotifications.map(
            (notification) =>

              notification._id ===
              notificationId

                ? {
                    ...notification,

                    is_read: true,
                  }

                : notification

          )

      );

    } catch (err) {

      console.error(
        "Mark notification error:",
        err
      );

      alert(
        err?.response?.data?.detail ||

        "Unable to mark notification as read."
      );

    } finally {

      setActionLoading(false);

    }

  };


  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const handleMarkAllAsRead =
    async () => {

      try {

        setActionLoading(true);

        await markAllNotificationsAsRead();


        setNotifications(
          (
            previousNotifications
          ) =>

            previousNotifications.map(
              (
                notification
              ) => ({

                ...notification,

                is_read: true,

              })

            )

        );

      } catch (err) {

        console.error(
          "Mark all notifications error:",
          err
        );

        alert(
          err?.response?.data?.detail ||

          "Unable to mark all notifications as read."
        );

      } finally {

        setActionLoading(false);

      }

    };


  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const handleDelete =
    async (
      notificationId
    ) => {

      try {

        setActionLoading(true);

        await deleteNotification(
          notificationId
        );


        setNotifications(
          (
            previousNotifications
          ) =>

            previousNotifications.filter(
              (
                notification
              ) =>

                notification._id !==
                notificationId

            )

        );

      } catch (err) {

        console.error(
          "Delete notification error:",
          err
        );

        alert(
          err?.response?.data?.detail ||

          "Unable to delete notification."
        );

      } finally {

        setActionLoading(false);

      }

    };


  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount =
    notifications.filter(
      (
        notification
      ) =>

        !notification.is_read

    ).length;


  // =====================================================
  // GET NOTIFICATION ICON
  // =====================================================

  const getNotificationIcon =
    (
      type
    ) => {

      const notificationType =
        String(
          type || ""
        )
          .toLowerCase();


      if (
        notificationType.includes(
          "traffic"
        )
      ) {

        return (
          <FaTrafficLight />
        );

      }


      if (
        notificationType.includes(
          "camera"
        )
      ) {

        return (
          <FaVideo />
        );

      }


      if (
        notificationType.includes(
          "attention"
        )
      ) {

        return (
          <FaEye />
        );

      }


      return (
        <FaBell />
      );

    };


  // =====================================================
  // GET SEVERITY CLASS
  // =====================================================

  const getSeverityClass =
    (
      severity
    ) => {

      const value =
        String(
          severity || "low"
        )
          .toLowerCase();


      if (
        value === "high"
      ) {

        return "high";

      }


      if (
        value === "medium"
      ) {

        return "medium";

      }


      return "low";

    };


  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime =
    (
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return (
          "Unknown time"
        );

      }


      try {

        const date =
          new Date(
            dateValue
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return (
            "Unknown time"
          );

        }


        return (
          date.toLocaleString(
            "en-IN",
            {

              dateStyle:
                "medium",

              timeStyle:
                "short",

            }
          )
        );

      } catch {

        return (
          "Unknown time"
        );

      }

    };


  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading
  ) {

    return (

      <div
        className="
        notifications-page
        "
      >

        <div
          className="
          notifications-loading
          "
        >

          <div
            className="
            notifications-spinner
            "
          ></div>

          <p>
            Loading notifications...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className="
      notifications-page
      "
    >


      {/* ===============================================
          HEADER
      =============================================== */}

      <header
        className="
        notifications-header
        "
      >

        <div>

          <span
            className="
            notifications-eyebrow
            "
          >

            SYSTEM ALERT CENTER

          </span>


          <h1>

            Notifications

          </h1>


          <p>

            Monitor important store activity,
            shopper attention insights,
            traffic alerts and camera health.

          </p>

        </div>


        <div
          className="
          notifications-header-actions
          "
        >


          <button
            className="
            notifications-refresh
            "
            onClick={
              loadNotifications
            }
            disabled={
              actionLoading
            }
          >

            <FaSyncAlt />

            Refresh

          </button>


          {

            unreadCount > 0 && (

              <button
                className="
                notifications-mark-all
                "
                onClick={
                  handleMarkAllAsRead
                }
                disabled={
                  actionLoading
                }
              >

                <FaCheckDouble />

                Mark All Read

              </button>

            )

          }

        </div>

      </header>


      {/* ===============================================
          ERROR
      =============================================== */}

      {

        error && (

          <div
            className="
            notifications-error
            "
          >

            <FaExclamationTriangle />

            <span>

              {error}

            </span>

          </div>

        )

      }


      {/* ===============================================
          SUMMARY
      =============================================== */}

      <section
        className="
        notifications-summary
        "
      >


        <div
          className="
          notification-summary-card
          "
        >

          <div
            className="
            notification-summary-icon
            "
          >

            <FaBell />

          </div>


          <div>

            <span>

              Total Notifications

            </span>


            <strong>

              {
                notifications.length
              }

            </strong>

          </div>

        </div>


        <div
          className="
          notification-summary-card unread-card
          "
        >

          <div
            className="
            notification-summary-icon
            "
          >

            <FaExclamationTriangle />

          </div>


          <div>

            <span>

              Unread Alerts

            </span>


            <strong>

              {unreadCount}

            </strong>

          </div>

        </div>


        <div
          className="
          notification-summary-card read-card
          "
        >

          <div
            className="
            notification-summary-icon
            "
          >

            <FaCheckDouble />

          </div>


          <div>

            <span>

              Read Notifications

            </span>


            <strong>

              {
                notifications.length -
                unreadCount
              }

            </strong>

          </div>

        </div>

      </section>


      {/* ===============================================
          NOTIFICATIONS LIST
      =============================================== */}

      <section
        className="
        notifications-container
        "
      >


        <div
          className="
          notifications-list-header
          "
        >

          <div>

            <span
              className="
              notifications-section-eyebrow
              "
            >

              RECENT ACTIVITY

            </span>


            <h2>

              All Notifications

            </h2>

          </div>


          <span
            className="
            notification-count
            "
          >

            {
              notifications.length
            }

            &nbsp; Notifications

          </span>

        </div>


        {/* =============================================
            EMPTY STATE
        ============================================= */}

        {

          !notifications.length && (

            <div
              className="
              notifications-empty
              "
            >

              <FaBell />


              <h2>

                No Notifications Yet

              </h2>


              <p>

                System alerts,
                traffic notifications,
                attention alerts and camera
                health updates will appear here.

              </p>

            </div>

          )

        }


        {/* =============================================
            NOTIFICATION ITEMS
        ============================================= */}

        <div
          className="
          notifications-list
          "
        >

          {

            notifications.map(
              (
                notification
              ) => {

                const severity =
                  getSeverityClass(
                    notification.severity
                  );


                return (

                  <div
                    key={
                      notification._id
                    }
                    className={
                      `notification-item
                      ${!notification.is_read
                        ? "unread"
                        : ""
                      }`
                    }
                  >


                    {/* ICON */}

                    <div
                      className={
                        `notification-icon
                        ${severity}`
                      }
                    >

                      {
                        getNotificationIcon(
                          notification.type
                        )
                      }

                    </div>


                    {/* CONTENT */}

                    <div
                      className="
                      notification-content
                      "
                    >


                      <div
                        className="
                        notification-top
                        "
                      >

                        <h3>

                          {
                            notification.title ||
                            "Notification"
                          }

                        </h3>


                        <span
                          className={
                            `severity-badge
                            ${severity}`
                          }
                        >

                          {severity}

                        </span>

                      </div>


                      <p>

                        {
                          notification.message ||
                          "No message available."
                        }

                      </p>


                      <div
                        className="
                        notification-meta
                        "
                      >

                        <FaClock />


                        <span>

                          {
                            formatTime(
                              notification.created_at
                            )
                          }

                        </span>


                        {

                          !notification.is_read && (

                            <span
                              className="
                              unread-label
                              "
                            >

                              Unread

                            </span>

                          )

                        }

                      </div>

                    </div>


                    {/* ACTIONS */}

                    <div
                      className="
                      notification-actions
                      "
                    >


                      {

                        !notification.is_read && (

                          <button
                            className="
                            notification-read-button
                            "
                            onClick={
                              () =>
                                handleMarkAsRead(
                                  notification._id
                                )
                            }
                            disabled={
                              actionLoading
                            }
                            title="
                            Mark as read
                            "
                          >

                            <FaCheck />

                          </button>

                        )

                      }


                      <button
                        className="
                        notification-delete-button
                        "
                        onClick={
                          () =>
                            handleDelete(
                              notification._id
                            )
                        }
                        disabled={
                          actionLoading
                        }
                        title="
                        Delete notification
                        "
                      >

                        <FaTrash />

                      </button>

                    </div>


                  </div>

                );

              }

            )

          }

        </div>

      </section>


      {/* ===============================================
          STATUS
      =============================================== */}

      <div
        className="
        notifications-status
        "
      >

        <span
          className="
          notifications-status-dot
          "
        ></span>


        Notification system active

      </div>


    </div>

  );

}


export default Notifications;