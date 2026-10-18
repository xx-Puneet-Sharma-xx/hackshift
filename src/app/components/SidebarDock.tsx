"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function SidebarDock() {
  const {
    unreadCount,
    setSearchModalOpen,
    setNotificationsDrawerOpen,
    triggerVoyage,
    activePath,
    navigate,
  } = useApp();

  const navItems = [
    { label: "Profile", route: "/myspace", target: "profile" },
    { label: "Opportunities", route: "/opportunities", target: "leaderboard" },
    { label: "Mentors", route: "/mentors", target: "mentor" },
    { label: "Projects", route: "/projects", target: "projects" },
    { label: "Communities", route: "/communities", target: "community" },
  ];

  const handleNav = (route: string, label: string) => {
    triggerVoyage(label, () => {
      navigate(route);
    });
  };

  return (
    <>
      {/* Desktop Left Floating Pill Dock */}
      <nav className="left-dock" aria-label="Main Navigation Dock">
        {/* Search Action */}
        <button
          type="button"
          className="dock-action-btn"
          onClick={() => setSearchModalOpen(true)}
          aria-label="Search all projects, mentors, and opportunities"
          title="Search Aetheria (Cmd+K)"
        >
          <Search size={18} />
        </button>

        {/* Notifications Action with Unread Badge */}
        <button
          type="button"
          className="dock-action-btn"
          onClick={() => setNotificationsDrawerOpen(true)}
          aria-label={`Notifications: ${unreadCount} new updates`}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-dot" aria-hidden="true" />}
        </button>

        <div className="dock-divider" aria-hidden="true" />

        {/* Vertical Destination List matching Stitch layout */}
        <div className="dock-vertical-text">
          {navItems.map((item, index) => {
            const isActive = activePath === item.target;
            return (
              <React.Fragment key={item.route}>
                {index > 0 && <span>•</span>}
                <span
                  role="button"
                  tabIndex={0}
                  className={`dock-nav-item ${isActive ? "active-nav-link" : ""}`}
                  style={{
                    color: isActive ? "#765935" : undefined,
                    fontWeight: isActive ? 800 : undefined,
                  }}
                  onClick={() => handleNav(item.route, item.label)}
                  onKeyDown={(e) => e.key === "Enter" && handleNav(item.route, item.label)}
                >
                  {item.label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Dock */}
      <nav className="mobile-bottom-dock" aria-label="Mobile Navigation Dock">
        <button
          type="button"
          className={`dock-action-btn ${activePath === "community" ? "active-mobile" : ""}`}
          onClick={() => handleNav("/communities", "Collaboration Pavilion")}
          title="Communities"
        >
          🏰
        </button>
        <button
          type="button"
          className={`dock-action-btn ${activePath === "projects" ? "active-mobile" : ""}`}
          onClick={() => handleNav("/projects", "Makerspace Lab")}
          title="Projects"
        >
          🛠️
        </button>
        <button
          type="button"
          className={`dock-action-btn ${activePath === "home" ? "active-mobile" : ""}`}
          onClick={() => handleNav("/", "Floating Island")}
          title="Island View"
        >
          🏝️
        </button>
        <button
          type="button"
          className={`dock-action-btn ${activePath === "mentor" ? "active-mobile" : ""}`}
          onClick={() => handleNav("/mentors", "Mentors & Alumni")}
          title="Mentors"
        >
          🎓
        </button>
        <button
          type="button"
          className={`dock-action-btn ${activePath === "leaderboard" ? "active-mobile" : ""}`}
          onClick={() => handleNav("/opportunities", "Opportunities")}
          title="Opportunities"
        >
          🏆
        </button>
        <button
          type="button"
          className={`dock-action-btn ${activePath === "profile" ? "active-mobile" : ""}`}
          onClick={() => handleNav("/myspace", "Scholar Sanctuary")}
          title="My Space"
        >
          🌿
        </button>
      </nav>
    </>
  );
}
