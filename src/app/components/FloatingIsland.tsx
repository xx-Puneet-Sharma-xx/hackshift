"use client";

import React, { useState } from "react";
import { PuffyCloud, MiniWalker, SoaringGlider } from "./MiniatureAssets";
import { Users, Wrench, GraduationCap, Award, Compass, Sparkles, ArrowRight } from "lucide-react";

export interface DestinationItem {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  description: string;
  icon: any;
  targetView: "mentor" | "leaderboard" | "community" | "projects" | "profile";
  region: {
    left: string;
    top: string;
    width: string;
    height: string;
    cardClass: string;
  };
  beacon: { left: string; top: string };
}

export const DESTINATIONS: DestinationItem[] = [
  {
    id: "mentors",
    name: "Mentors & Alumni",
    tag: "Guidance",
    subtitle: "Get intent-based guidance",
    description: "Connect with alumni mentors, schedule 1-on-1 office hours, and gain career insights.",
    icon: GraduationCap,
    targetView: "mentor",
    region: {
      left: "19%",
      top: "20%",
      width: "26%",
      height: "26%",
      cardClass: "card-mentors",
    },
    beacon: { left: "33%", top: "34%" },
  },
  {
    id: "opportunities",
    name: "Opportunities",
    tag: "Exchange",
    subtitle: "Discover funding, grants & roles",
    description: "Explore research fellowships, $10k+ innovation grants, and campus venture competitions.",
    icon: Award,
    targetView: "leaderboard",
    region: {
      left: "54%",
      top: "18%",
      width: "33%",
      height: "28%",
      cardClass: "card-opportunities",
    },
    beacon: { left: "74%", top: "32%" },
  },
  {
    id: "communities",
    name: "Communities",
    tag: "Hubs",
    subtitle: "Join domain & campus hubs",
    description: "Find your tribe across AI, Robotics, Biotech, Design, and inter-college chapters.",
    icon: Users,
    targetView: "community",
    region: {
      left: "17%",
      top: "51%",
      width: "26%",
      height: "24%",
      cardClass: "card-communities",
    },
    beacon: { left: "31%", top: "63%" },
  },
  {
    id: "projects",
    name: "Projects",
    tag: "Makerspace",
    subtitle: "Build ideas & find collaborators",
    description: "Showcase hardware & software prototypes, find missing team roles, and launch MVPs.",
    icon: Wrench,
    targetView: "projects",
    region: {
      left: "60%",
      top: "52%",
      width: "25%",
      height: "24%",
      cardClass: "card-projects",
    },
    beacon: { left: "70%", top: "64%" },
  },
  {
    id: "myspace",
    name: "My Space",
    tag: "Portfolio",
    subtitle: "Your portable Karma ledger",
    description: "View your verified contributions, peer endorsements, skills badges, and 140 Karma score.",
    icon: Compass,
    targetView: "profile",
    region: {
      left: "75%",
      top: "44%",
      width: "18%",
      height: "19%",
      cardClass: "card-myspace",
    },
    beacon: { left: "85%", top: "53%" },
  },
];

export interface FloatingIslandProps {
  onSelectDestination?: (destId: string) => void;
  onNavigate?: (view: "home" | "leaderboard" | "community" | "projects" | "investment" | "mentor" | "friends" | "profile") => void;
}

export default function FloatingIsland({ onSelectDestination, onNavigate }: FloatingIslandProps) {
  const [hoveredDest, setHoveredDest] = useState<string | null>(null);

  const handleClick = (dest: DestinationItem) => {
    if (onSelectDestination) {
      onSelectDestination(dest.id);
    }
    if (onNavigate) {
      onNavigate(dest.targetView);
    }
  };

  return (
    <div className="island-stage" role="region" aria-label="Aetheria Floating Island Navigation">
      {/* Sky Drifting Clouds */}
      <div className="sky-clouds-container" aria-hidden="true">
        <PuffyCloud className="cloud-1" scale={1.2} />
        <PuffyCloud className="cloud-2" scale={0.85} />
        <PuffyCloud className="cloud-3" scale={0.7} />
        <PuffyCloud className="cloud-foreground" scale={1.35} />
        <SoaringGlider />
      </div>

      {/* Main Floating Island Diorama */}
      <div className="island-float-wrapper">
        {/* Soft breathing shadow underneath island rock base */}
        <div className="island-ambient-shadow" aria-hidden="true" />

        {/* Clean High-Resolution Island Artwork */}
        <img
          src="/island-clean.png"
          alt="Aetheria miniature floating island campus"
          className="clean-island-image"
          draggable="false"
        />

        {/* Living Environment Motion Overlays */}
        <div className="island-life-layer" aria-hidden="true">
          <div className="rotunda-shimmer-zone" title="Innovation Rotunda" />
          <div className="swaying-tree-overlay" />

          {/* Animated walking students on stone plazas */}
          <div className="mini-walker-1">
            <MiniWalker variant={1} />
          </div>
          <div className="mini-walker-2">
            <MiniWalker variant={2} />
          </div>

          <div className="mini-maker-action" title="Active Prototype Testing" />
          <div className="mini-shuttle-bus" />
        </div>

        {/* 5 Physical Interactive Destination Hotspots */}
        {DESTINATIONS.map((dest) => {
          const isHovered = hoveredDest === dest.id;

          return (
            <div
              key={dest.id}
              className="hotspot-wrapper"
              style={{
                position: "absolute",
                left: dest.region.left,
                top: dest.region.top,
                width: dest.region.width,
                height: dest.region.height,
              }}
            >
              <button
                type="button"
                className="hotspot-region"
                style={{ width: "100%", height: "100%" }}
                onClick={() => handleClick(dest)}
                onMouseEnter={() => setHoveredDest(dest.id)}
                onMouseLeave={() => setHoveredDest(null)}
                onFocus={() => setHoveredDest(dest.id)}
                onBlur={() => setHoveredDest(null)}
                aria-label={`${dest.name}: ${dest.subtitle}. Click to open.`}
              >
                {/* Visual pulsating beacon inside the building */}
                <div
                  className="hotspot-beacon"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                  aria-hidden="true"
                />

                {/* Destination card matching Stitch diorama mockup */}
                <div
                  className={`destination-card ${dest.region.cardClass}`}
                  style={{
                    opacity: isHovered ? 1 : 0.95,
                    transform: isHovered
                      ? "translateX(-50%) translateY(-6px) scale(1.04)"
                      : "translateX(-50%) translateY(0) scale(1)",
                  }}
                >
                  <div className="card-title">
                    <span>{dest.name}</span>
                    <span className="card-badge-tag">{dest.tag}</span>
                  </div>
                  <div className="card-subtitle">{dest.subtitle}</div>
                  <div className="card-action-hint">
                    <span>Explore section</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Decorative Stitch Sparkle Accent */}
      <div className="bottom-sparkle" aria-hidden="true">
        <Sparkles size={24} color="#ffffff" />
      </div>
    </div>
  );
}
