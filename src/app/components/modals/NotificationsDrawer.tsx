"use client";

import React from "react";
import { X, CheckCheck, Bell } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function NotificationsDrawer() {
  const {
    notificationsDrawerOpen,
    setNotificationsDrawerOpen,
    notifications,
    markAllNotificationsRead,
    dismissNotification,
    navigate,
  } = useApp();

  if (!notificationsDrawerOpen) return null;

  const handleNotificationClick = (n: any) => {
    setNotificationsDrawerOpen(false);
    if (n.route) {
      navigate(n.route);
    }
  };

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true" aria-label="Notifications panel">
      <div className="modal-backdrop" onClick={() => setNotificationsDrawerOpen(false)} />
      <div className="notifications-drawer-card">
        <div className="drawer-header">
          <div className="drawer-title-row">
            <Bell size={20} color="#765935" />
            <h3 className="drawer-title">Notifications</h3>
          </div>
          <div className="drawer-actions">
            <button
              type="button"
              className="mark-all-read-btn"
              onClick={markAllNotificationsRead}
              title="Mark all as read"
            >
              <CheckCheck size={16} />
              <span>Mark all read</span>
            </button>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setNotificationsDrawerOpen(false)}
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {(!notifications || notifications.length === 0) ? (
            <div className="drawer-empty-state">
              <p>You have no new notifications.</p>
            </div>
          ) : (
            <ul className="notification-items-list">
              {notifications.map((n: any) => (
                <li
                  key={n.id}
                  className={`notification-item ${!n.read ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notification-unread-indicator" />
                  <div className="notification-content">
                    <div className="notification-title-row">
                      <span className="notification-item-title">{n.title}</span>
                      <span className="notification-time">{n.time}</span>
                    </div>
                    <p className="notification-desc">{n.desc}</p>
                  </div>
                  <button
                    type="button"
                    className="notification-dismiss-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(n.id);
                    }}
                    title="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
