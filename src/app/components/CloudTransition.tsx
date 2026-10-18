"use client";

import React, { useEffect, useState } from "react";
import { TransitionPuff } from "./MiniatureAssets";

export interface CloudTransitionProps {
  isTransitioning: boolean;
  destinationName?: string;
  onMidpoint?: () => void;
  onComplete?: () => void;
}

export default function CloudTransition({
  isTransitioning,
  destinationName,
  onMidpoint,
  onComplete,
}: CloudTransitionProps) {
  const [phase, setPhase] = useState<"idle" | "entering" | "midpoint" | "exiting">("idle");

  useEffect(() => {
    if (isTransitioning) {
      setPhase("entering");

      const midTimer = setTimeout(() => {
        setPhase("midpoint");
        if (onMidpoint) onMidpoint();

        const exitTimer = setTimeout(() => {
          setPhase("exiting");

          const finishTimer = setTimeout(() => {
            setPhase("idle");
            if (onComplete) onComplete();
          }, 450);

          return () => clearTimeout(finishTimer);
        }, 250);

        return () => clearTimeout(exitTimer);
      }, 450);

      return () => clearTimeout(midTimer);
    } else {
      setPhase("idle");
    }
  }, [isTransitioning, onMidpoint, onComplete]);

  if (phase === "idle") return null;

  const isCloudCovered = phase === "entering" || phase === "midpoint";

  return (
    <div
      className={`cloud-transition-overlay active ${isCloudCovered ? "in" : "out"}`}
      role="status"
      aria-live="polite"
    >
      <TransitionPuff className="puff-left" />
      <TransitionPuff className="puff-right" />
      <TransitionPuff className="puff-center" />

      {destinationName && (
        <div className="transition-message">
          Traveling to {destinationName}...
        </div>
      )}
    </div>
  );
}
