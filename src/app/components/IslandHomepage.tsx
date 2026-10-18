"use client";

import React, { useState } from "react";
import { PuffyCloud, MiniWalker, SoaringGlider } from "./MiniatureAssets";
import { useApp } from "../context/AppContext";

export type NavTargetView = "home" | "leaderboard" | "community" | "projects" | "investment" | "mentor" | "friends" | "profile";

export interface IslandNavButton {
  id: string;
  name: string;
  viewTarget: NavTargetView;
  subtitle: string;
  icon: string;
  position: {
    top: string;
    left: string;
  };
}

// Backward compatibility
export type LandmarkData = IslandNavButton;

export const ISLAND_NAV_BUTTONS: IslandNavButton[] = [
  {
    id: "mentor",
    name: "Mentor",
    viewTarget: "mentor",
    subtitle: "Alumni & Intent Guidance",
    icon: "school",
    position: {
      top: "28%",
      left: "30%",
    },
  },
  {
    id: "leaderboard",
    name: "Leaderboard",
    viewTarget: "leaderboard",
    subtitle: "Karma Rankings & Grants",
    icon: "leaderboard",
    position: {
      top: "27%",
      left: "74%",
    },
  },
  {
    id: "community",
    name: "Community",
    viewTarget: "community",
    subtitle: "Domain & Campus Hubs",
    icon: "forum",
    position: {
      top: "56%",
      left: "27%",
    },
  },
  {
    id: "projects",
    name: "Projects",
    viewTarget: "projects",
    subtitle: "Prototypes & Open Builds",
    icon: "rocket_launch",
    position: {
      top: "58%",
      left: "70%",
    },
  },
  {
    id: "resources",
    name: "Resources",
    viewTarget: "investment",
    subtitle: "Faculty Archives & Tools",
    icon: "auto_stories",
    position: {
      top: "43%",
      left: "84%",
    },
  },
  {
    id: "friends",
    name: "Friends",
    viewTarget: "friends",
    subtitle: "Collaborators & Network",
    icon: "diversity_3",
    position: {
      top: "76%",
      left: "48%",
    },
  },
];

export interface IslandHomepageProps {
  onNavigate: (view: NavTargetView) => void;
}

export default function IslandHomepage({ onNavigate }: IslandHomepageProps) {
  let appState: any = null;
  try {
    appState = useApp();
  } catch {
    // outside provider fallback
  }

  const [localZoom, setLocalZoom] = useState<number>(1);
  const [localGolden, setLocalGolden] = useState<boolean>(false);
  const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null);

  const dioramaZoom = appState ? appState.dioramaZoom : localZoom;
  const goldenHour = appState ? appState.goldenHour : localGolden;
  const triggerVoyage = appState
    ? appState.triggerVoyage
    : (t: string, cb?: () => void) => {
        if (cb) cb();
      };

  const handleNavClick = (btn: IslandNavButton) => {
    onNavigate(btn.viewTarget);
  };

  return (
    <div
      className={`island-stage ${goldenHour ? "golden-hour-mode" : ""}`}
      role="region"
      aria-label="Aetheria Floating Island Interactive Campus"
    >
      {/* Sky Drifting Clouds */}
      <div className="sky-clouds-container" aria-hidden="true">
        <PuffyCloud className="cloud-1" scale={1.2} />
        <PuffyCloud className="cloud-2" scale={0.85} />
        <PuffyCloud className="cloud-3" scale={0.7} />
        <PuffyCloud className="cloud-foreground" scale={1.35} />
        <SoaringGlider />
      </div>

      {/* Main Diorama Interactive Viewport */}
      <div
        className="island-float-wrapper"
        style={{
          transform: `scale(${dioramaZoom})`,
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Soft breathing shadow underneath island rock base */}
        <div className="island-ambient-shadow" aria-hidden="true" />

        {/* Clean High-Resolution Island Artwork */}
        <img
          src="/island-clean.png"
          alt="Aetheria miniature floating island campus diorama"
          className="clean-island-image"
          draggable="false"
        />

        {/* Living Environment Motion Overlays */}
        <div className="island-life-layer" aria-hidden="true">
          <div className="rotunda-shimmer-zone" title="Innovation Rotunda" />
          <div className="swaying-tree-overlay" />

          {/* Bustling Animated Miniature Figures across Campus */}
          <div className="mini-walker-1" title="Scholar near Central Quadrangle">
            <MiniWalker variant={1} width={18} height={28} />
          </div>
          <div className="mini-walker-2" title="Student exploring Pavilion Commons">
            <MiniWalker variant={2} width={18} height={28} />
          </div>
          <div className="mini-walker-3" title="Inventor approaching Rotunda steps">
            <MiniWalker variant={3} width={18} height={28} />
          </div>
          <div className="mini-walker-4" title="Maker carrying prototype near Workshop">
            <MiniWalker variant={4} width={18} height={28} />
          </div>
          <div className="mini-walker-5" title="Fellow strolling by Sandstone Colonnade">
            <MiniWalker variant={5} width={18} height={28} />
          </div>
          <div className="mini-walker-6" title="Researcher walking towards Sanctuary terrace">
            <MiniWalker variant={6} width={18} height={28} />
          </div>
          <div className="mini-walker-7" title="Student on main diagonal walkway">
            <MiniWalker variant={7} width={18} height={28} />
          </div>
        </div>

        {/* Physical Hotspot Button Pins redirecting to designated pages */}
        {ISLAND_NAV_BUTTONS.map((btn) => {
          const isHovered = hoveredButtonId === btn.id;
          return (
            <div
              key={btn.id}
              className="hotspot-pin-container"
              style={{
                top: btn.position.top,
                left: btn.position.left,
              }}
            >
              <button
                type="button"
                className="hotspot-pin-btn group"
                onClick={() => handleNavClick(btn)}
                onMouseEnter={() => setHoveredButtonId(btn.id)}
                onMouseLeave={() => setHoveredButtonId(null)}
                aria-label={`Go to ${btn.name}: ${btn.subtitle}`}
              >
                {/* Hotspot Card Button */}
                <div
                  className="hotspot-pin-badge"
                  style={{
                    transform: isHovered ? "scale(1.08) translateY(-4px)" : "scale(1)",
                  }}
                >
                  <div className="hotspot-pin-icon-wrap">
                    <span className="material-symbols-outlined text-[18px]">{btn.icon}</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1">
                      <span className="hotspot-pin-title">{btn.name}</span>
                      <span className="material-symbols-outlined text-[13px] text-[#1e3a5f] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        arrow_forward
                      </span>
                    </div>
                    <span className="hotspot-pin-sub">{btn.subtitle}</span>
                  </div>
                  <div className="hotspot-pointer-tip" aria-hidden="true" />
                </div>
              </button>
            </div>
          );
        })}
      </div>


    </div>
  );
}
