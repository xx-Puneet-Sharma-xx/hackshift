"use client";

import React, { useState } from 'react';
import { ArrowLeft, Users, MessageSquare, Plus, Check, Sparkles, Filter } from 'lucide-react';

const INITIAL_COMMUNITIES = [
  {
    id: 'ai-agents',
    name: 'Autonomous AI & Multi-Agent Reasoning',
    category: 'AI & Machine Learning',
    members: 1420,
    discussions: 86,
    color: '#3b82f6',
    description: 'Exploring tool-use architectures, self-correcting agent chains, and multi-modal embodied perception.',
    latestTopic: 'Evaluating reasoning latency in hierarchical agent swarms',
    joined: true,
  },
  {
    id: 'aerospace-rocketry',
    name: 'Aerospace & Sub-Orbital Telemetry',
    category: 'Robotics & Hardware',
    members: 890,
    discussions: 42,
    color: '#f59e0b',
    description: 'High-altitude balloon flights, solid rocket motor thrust curves, and long-range LoRa ground stations.',
    latestTopic: 'Live telemetry demodulation on 433 MHz band with ESP32',
    joined: false,
  },
  {
    id: 'clean-energy',
    name: 'NextGen Clean Energy & Microgrids',
    category: 'Climate Tech',
    members: 670,
    discussions: 31,
    color: '#10b981',
    description: 'Decentralized peer-to-peer solar trading, flow batteries, and ultra-capacitors for off-grid communities.',
    latestTopic: 'Solid-state electrolyte degradation testing after 500 cycles',
    joined: false,
  },
  {
    id: 'nsut-iit-alliance',
    name: 'Inter-College Innovation Alliance',
    category: 'Campus Chapters',
    members: 3180,
    discussions: 194,
    color: '#8b5cf6',
    description: 'Connecting student researchers and founders across Delhi-NCR colleges for team formation and hackathons.',
    latestTopic: 'HackShift 2026 team matchmaking and idea pitches',
    joined: true,
  },
];

export default function CommunitiesView({ onBackToIsland }: { onBackToIsland?: () => void }) {
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showToast, setShowToast] = useState<string | null>(null);

  const categories = ["All", "AI & Machine Learning", "Robotics & Hardware", "Climate Tech", "Campus Chapters"];

  const handleToggleJoin = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.joined;
          setShowToast(nextState ? `Joined ${c.name}!` : `Left ${c.name}`);
          setTimeout(() => setShowToast(null), 3000);
          return {
            ...c,
            joined: nextState,
            members: nextState ? c.members + 1 : c.members - 1,
          };
        }
        return c;
      })
    );
  };

  const filtered =
    selectedCategory === 'All'
      ? communities
      : communities.filter((c) => c.category === selectedCategory);

  return (
    <div className="destination-portal-view" role="main">
      {/* Sticky Top Bar */}
      <div className="portal-top-bar">
        <button
          type="button"
          className="back-to-island-btn"
          onClick={onBackToIsland}
          aria-label="Return to the 3D Island"
        >
          <ArrowLeft size={18} />
          <span>Back to Island</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="card-badge-tag" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
            Open-Air Pavilion
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {communities.filter((c) => c.joined).length} Hubs Joined
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="portal-hero">
        <h1 className="portal-title">Communities &amp; Campus Hubs</h1>
        <p className="portal-tagline">
          The collaborative open-air pavilion. Meet passionate domain peers, join research clubs, and collaborate across collegiate boundaries.
        </p>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#1e3a5f' : 'rgba(203, 213, 225, 0.8)',
                background: selectedCategory === cat ? '#1e3a5f' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.16s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2.5rem',
            background: '#1e3a5f',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 100,
            animation: 'fadeIn 200ms ease',
          }}
        >
          <Sparkles size={16} color="#60a5fa" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Grid of Community Cards */}
      <div className="portal-content-grid">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map((hub) => (
            <div
              key={hub.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 8px 24px rgba(27, 43, 65, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: hub.color,
                      background: `${hub.color}18`,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                    }}
                  >
                    {hub.category}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Users size={14} />
                    <span>{hub.members.toLocaleString()} members</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  {hub.name}
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {hub.description}
                </p>

                {/* Active Discussion Snippet */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                >
                  <MessageSquare size={16} color="#3b82f6" />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>ACTIVE TOPIC</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {hub.latestTopic}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleToggleJoin(hub.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: hub.joined ? '1px solid #cbd5e1' : 'none',
                  background: hub.joined ? '#f1f5f9' : '#1e3a5f',
                  color: hub.joined ? '#475569' : '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.16s ease',
                }}
              >
                {hub.joined ? (
                  <>
                    <Check size={16} color="#10b981" />
                    <span>Joined • View Hub</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Join Community</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
