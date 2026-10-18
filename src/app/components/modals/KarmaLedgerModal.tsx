"use client";

import React from "react";
import { X, ShieldCheck, Sparkles, History, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function KarmaLedgerModal() {
  const {
    karmaLedgerModalOpen,
    setKarmaLedgerModalOpen,
    karma,
    profile,
    karmaLedger,
    triggerVoyage,
    navigate,
  } = useApp();

  if (!karmaLedgerModalOpen) return null;

  const handleOpenMySpace = () => {
    setKarmaLedgerModalOpen(false);
    triggerVoyage("Scholar Sanctuary", () => {
      navigate("/myspace");
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Karma ledger and profile">
      <div className="modal-backdrop" onClick={() => setKarmaLedgerModalOpen(false)} />
      <div className="karma-ledger-modal-card">
        {/* Header */}
        <div className="karma-modal-header">
          <div className="karma-user-profile-summary">
            <div className="karma-modal-avatar">
              <img src={profile.avatar} alt={profile.name} />
              <div className="karma-verified-check">
                <ShieldCheck size={12} color="#ffffff" />
              </div>
            </div>
            <div>
              <h3 className="karma-user-name">{profile.name}</h3>
              <p className="karma-user-role">{profile.role}</p>
              <span className="karma-tier-badge">{profile.reputationTier}</span>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setKarmaLedgerModalOpen(false)}
            aria-label="Close Karma ledger"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Banner */}
        <div className="karma-score-banner">
          <div className="karma-score-left">
            <span className="karma-banner-val">{karma}</span>
            <div className="karma-banner-meta">
              <span className="karma-banner-title">Portable Karma Score</span>
              <span className="karma-banner-sub">Verified across 14 Alliance Universities</span>
            </div>
          </div>
          <div className="karma-score-right">
            <Sparkles size={24} color="#765935" />
          </div>
        </div>

        {/* Verified Badges */}
        <div className="karma-badges-section">
          <h4 className="karma-section-title">Verified Badges &amp; Credentials</h4>
          <div className="karma-badges-grid">
            {(profile.badges || []).map((b: any) => (
              <div key={b.id} className="karma-badge-chip" style={{ borderColor: `${b.color}40` }}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: b.color }}>
                  {b.icon}
                </span>
                <span>{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ledger Transactions */}
        <div className="karma-ledger-list-section">
          <div className="karma-ledger-title-row">
            <h4 className="karma-section-title">
              <History size={15} />
              <span>Contribution History</span>
            </h4>
            <span className="karma-ledger-count">{(karmaLedger || []).length} events logged</span>
          </div>

          <div className="karma-ledger-scroll">
            {(karmaLedger || []).map((entry: any) => (
              <div key={entry.id} className="karma-ledger-row">
                <div className="karma-entry-date">{entry.date}</div>
                <div className="karma-entry-event">{entry.event}</div>
                <div className="karma-entry-points">{entry.points}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="karma-modal-footer">
          <button
            type="button"
            className="view-full-myspace-btn"
            onClick={handleOpenMySpace}
          >
            <span>Open Complete Sanctuary Profile</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
