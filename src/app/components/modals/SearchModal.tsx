"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, X, ArrowRight, Wrench, Users, GraduationCap, Award } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function SearchModal() {
  const {
    searchModalOpen,
    setSearchModalOpen,
    projects,
    communities,
    mentors,
    opportunities,
    triggerVoyage,
    navigate,
  } = useApp();

  const [query, setQuery] = useState("");

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev: boolean) => !prev);
      } else if (e.key === "Escape" && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedProjects = (projects || [])
      .filter((p: any) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.domain && p.domain.toLowerCase().includes(q))
      )
      .map((p: any) => ({ ...p, type: "Project", icon: Wrench, route: "/projects" }));

    const matchedCommunities = (communities || [])
      .filter((c: any) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
      )
      .map((c: any) => ({ ...c, title: c.name, type: "Community", icon: Users, route: "/communities" }));

    const matchedMentors = (mentors || [])
      .filter((m: any) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.tags && m.tags.some((t: string) => t.toLowerCase().includes(q)))
      )
      .map((m: any) => ({ ...m, title: `${m.name} (${m.role})`, type: "Mentor", icon: GraduationCap, route: "/mentors" }));

    const matchedOpps = (opportunities || [])
      .filter((o: any) =>
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.category && o.category.toLowerCase().includes(q))
      )
      .map((o: any) => ({ ...o, type: "Opportunity", icon: Award, route: "/opportunities" }));

    return [...matchedProjects, ...matchedCommunities, ...matchedMentors, ...matchedOpps].slice(0, 8);
  }, [query, projects, communities, mentors, opportunities]);

  if (!searchModalOpen) return null;

  const handleSelect = (item: any) => {
    setSearchModalOpen(false);
    setQuery("");
    triggerVoyage(item.title, () => {
      navigate(item.route);
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Search platform">
      <div className="modal-backdrop" onClick={() => setSearchModalOpen(false)} />
      <div className="search-modal-card">
        <div className="search-modal-input-wrap">
          <Search size={20} color="#765935" />
          <input
            type="text"
            className="search-modal-input"
            placeholder="Search projects, communities, mentors, grants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="search-modal-results">
          {query.trim() === "" ? (
            <div className="search-modal-empty">
              <p className="search-hint-title">Quick Searches</p>
              <div className="quick-tags-wrap">
                {["Robotics", "SolidWorks", "Dr. Anya Sharma", "Seed Grant", "Autonomous AI", "Clean Energy"].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="quick-search-tag"
                      onClick={() => setQuery(tag)}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="search-modal-empty">
              <p>No results found for "{query}". Try a different term or domain.</p>
            </div>
          ) : (
            <ul className="search-results-list">
              {results.map((item: any) => {
                const Icon = item.icon;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      className="search-result-item"
                      onClick={() => handleSelect(item)}
                    >
                      <div className="search-item-icon-badge">
                        <Icon size={18} />
                      </div>
                      <div className="search-item-info">
                        <div className="search-item-title-row">
                          <span className="search-item-title">{item.title}</span>
                          <span className="search-item-type-badge">{item.type}</span>
                        </div>
                        <p className="search-item-desc">{item.description || item.bio || item.category}</p>
                      </div>
                      <ArrowRight size={16} className="search-item-arrow" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="search-modal-footer">
          <span>Press <strong>Esc</strong> to close</span>
          <span><strong>↑↓</strong> to navigate</span>
        </div>
      </div>
    </div>
  );
}
