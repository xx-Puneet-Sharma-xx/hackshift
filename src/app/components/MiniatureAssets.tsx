"use client";

import React from "react";

/* Stylized Fluffy Cloud matching the diorama sky */
export function PuffyCloud({
  className = "",
  style = {},
  scale = 1,
}: {
  className?: string;
  style?: React.CSSProperties;
  scale?: number;
}) {
  return (
    <svg
      className={`drifting-cloud ${className}`}
      style={style}
      width={220 * scale}
      height={90 * scale}
      viewBox="0 0 220 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`cloudGrad-${scale}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#dbe8f0" stopOpacity="0.85" />
        </linearGradient>
        <filter id={`cloudShadow-${scale}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#8fadcc" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#cloudShadow-${scale})`}>
        <ellipse cx="60" cy="55" rx="42" ry="26" fill={`url(#cloudGrad-${scale})`} />
        <ellipse cx="110" cy="45" rx="50" ry="34" fill={`url(#cloudGrad-${scale})`} />
        <ellipse cx="160" cy="55" rx="38" ry="24" fill={`url(#cloudGrad-${scale})`} />
        <ellipse cx="85" cy="35" rx="35" ry="25" fill={`url(#cloudGrad-${scale})`} />
        <ellipse cx="135" cy="36" rx="36" ry="25" fill={`url(#cloudGrad-${scale})`} />
        <rect x="30" y="50" width="155" height="28" rx="14" fill={`url(#cloudGrad-${scale})`} />
      </g>
    </svg>
  );
}

/* Transition Cloud Shape for the immersive cloud wipe */
export function TransitionPuff({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={`transition-cloud-puff ${className}`}
      style={style}
      viewBox="0 0 800 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="transPuffGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#f4f9fd" />
          <stop offset="100%" stopColor="#b0cbd2" />
        </radialGradient>
      </defs>
      <path
        d="M 100,350 A 80,80 0 0,1 180,210 A 120,120 0 0,1 360,130 A 140,140 0 0,1 580,160 A 100,100 0 0,1 720,280 A 80,80 0 0,1 700,380 L 120,380 Z"
        fill="url(#transPuffGrad)"
        filter="drop-shadow(0 25px 35px rgba(30,58,95,0.15))"
      />
    </svg>
  );
}

/* Animated Miniature Diorama Figure (Isometric Style) with Active Stepping Legs */
export function MiniWalker({
  variant = 1,
  width = 16,
  height = 26,
}: {
  variant?: number;
  width?: number;
  height?: number;
}) {
  const themes: Record<number, { coat: string; backpack: string; hair: string }> = {
    1: { coat: "#2563eb", backpack: "#f59e0b", hair: "#1e293b" }, // Royal Blue
    2: { coat: "#e11d48", backpack: "#0d9488", hair: "#475569" }, // Crimson
    3: { coat: "#059669", backpack: "#ea580c", hair: "#78350f" }, // Emerald
    4: { coat: "#d97706", backpack: "#4338ca", hair: "#1f2937" }, // Amber/Terracotta
    5: { coat: "#7c3aed", backpack: "#ec4899", hair: "#334155" }, // Purple
    6: { coat: "#0284c7", backpack: "#eab308", hair: "#0f172a" }, // Cyan
    7: { coat: "#be185d", backpack: "#65a30d", hair: "#374151" }, // Magenta
  };

  const theme = themes[variant] || themes[1];

  return (
    <svg
      viewBox="0 0 24 36"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mini-person-svg"
      style={{ overflow: "visible" }}
    >
      {/* Dynamic contact ground shadow */}
      <ellipse cx="12" cy="33" rx="7.5" ry="3.2" fill="rgba(30, 48, 70, 0.45)" />

      {/* Stepping Left Leg */}
      <g className="walker-leg-left" style={{ transformOrigin: "10px 22px" }}>
        <line
          x1="10"
          y1="22"
          x2="8"
          y2="31"
          stroke="#1e293b"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx="8" cy="31" r="1.5" fill="#0f172a" />
      </g>

      {/* Stepping Right Leg */}
      <g className="walker-leg-right" style={{ transformOrigin: "14px 22px" }}>
        <line
          x1="14"
          y1="22"
          x2="16"
          y2="31"
          stroke="#1e293b"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx="16" cy="31" r="1.5" fill="#0f172a" />
      </g>

      {/* Torso & Head (Bobbing with walking gait) */}
      <g className="walker-torso-bob">
        {/* Jacket / Hoodie */}
        <path
          d="M7.5,13 L16.5,13 L17.5,23.5 L6.5,23.5 Z"
          fill={theme.coat}
          stroke="#0f172a"
          strokeWidth="0.8"
        />

        {/* Backpack */}
        <rect
          x="5"
          y="14"
          width="3.5"
          height="7"
          rx="1.5"
          fill={theme.backpack}
          stroke="#0f172a"
          strokeWidth="0.6"
        />

        {/* Head */}
        <circle cx="12" cy="8" r="4.5" fill="#fde047" stroke="#0f172a" strokeWidth="0.6" />

        {/* Hair */}
        <path
          d="M7.5,7.5 C8,3.5 16,3.5 16.5,7.5 C16.5,4 12,3 7.5,7.5 Z"
          fill={theme.hair}
        />
      </g>
    </svg>
  );
}

/* Ambient Glider in upper sky */
export function SoaringGlider() {
  return (
    <div className="ambient-glider">
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
        <path
          d="M2,14 L22,2 L14,14 L12,9 Z"
          fill="#ffffff"
          opacity="0.9"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
        />
        <path d="M12,9 L22,2 L14,14 Z" fill="#cbd5e1" opacity="0.7" />
      </svg>
    </div>
  );
}
