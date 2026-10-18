"use client";

import React from "react";
import { X, ArrowRight, Compass } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function QuickDirectoryModal() {
  const {
    directNavModalOpen,
    setDirectNavModalOpen,
    landmarksData,
    triggerVoyage,
    navigate,
  } = useApp();

  if (!directNavModalOpen) return null;

  const handleSelectLandmark = (lm: any) => {
    setDirectNavModalOpen(false);
    triggerVoyage(lm.title, () => {
      navigate(lm.route);
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Campus quick directory">
      <div className="modal-backdrop" onClick={() => setDirectNavModalOpen(false)} />
      <div className="quick-directory-modal-card">
        <div className="drawer-header">
          <div className="drawer-title-row">
            <Compass size={22} color="#765935" />
            <div>
              <h3 className="drawer-title">Campus Directory</h3>
              <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                Instant access to diorama sectors &amp; innovation pavilions
              </p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setDirectNavModalOpen(false)}
            aria-label="Close directory"
          >
            <X size={18} />
          </button>
        </div>

        <div className="quick-directory-grid">
          {(landmarksData || []).map((lm: any) => (
            <button
              key={lm.id}
              type="button"
              className="quick-directory-tile"
              onClick={() => handleSelectLandmark(lm)}
            >
              <div className="quick-tile-header">
                <span className="quick-tile-badge" style={{ backgroundColor: `${lm.badgeColor}20`, color: lm.badgeColor }}>
                  {lm.tag}
                </span>
                <span className="material-symbols-outlined text-[20px]" style={{ color: lm.badgeColor }}>
                  {lm.icon}
                </span>
              </div>
              <h4 className="quick-tile-title">{lm.name}</h4>
              <p className="quick-tile-subtitle">{lm.subtitle}</p>
              <div className="quick-tile-action">
                <span>Enter Sector</span>
                <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
