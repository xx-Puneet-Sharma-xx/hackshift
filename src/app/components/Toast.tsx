"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="global-toast-container" role="alert" aria-live="polite">
      <div className="global-toast-card">
        <Sparkles size={16} color="#765935" />
        <span className="toast-message-text">{toastMessage}</span>
      </div>
    </div>
  );
}
