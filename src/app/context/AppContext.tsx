"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import initialCommunities from "../../data/communitiesData.json";
import initialProjects from "../../data/projectsData.json";
import initialMentors from "../../data/mentorsData.json";
import initialOpportunities from "../../data/opportunitiesData.json";
import initialUserData from "../../data/userData.json";
import landmarksData from "../../data/islandLandmarksData.json";

export interface AppContextType {
  // User & Karma State
  profile: typeof initialUserData.profile;
  karma: number;
  setKarma: React.Dispatch<React.SetStateAction<number>>;
  karmaLedger: typeof initialUserData.karmaLedger;
  setKarmaLedger: React.Dispatch<React.SetStateAction<typeof initialUserData.karmaLedger>>;
  notifications: typeof initialUserData.notifications;
  unreadCount: number;

  // Communities State
  communities: typeof initialCommunities;
  setCommunities: React.Dispatch<React.SetStateAction<typeof initialCommunities>>;

  // Projects State
  projects: typeof initialProjects;
  setProjects: React.Dispatch<React.SetStateAction<typeof initialProjects>>;
  activeProjectInspectorId: string;
  setActiveProjectInspectorId: (id: string) => void;
  appliedProjects: any[];

  // Mentors State
  mentors: typeof initialMentors;
  bookedSessions: any[];

  // Opportunities State
  opportunities: typeof initialOpportunities;
  appliedOpportunities: any[];

  // Bookmarks
  bookmarks: Set<string>;

  // UI States & Modals
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  notificationsDrawerOpen: boolean;
  setNotificationsDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  karmaLedgerModalOpen: boolean;
  setKarmaLedgerModalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  directNavModalOpen: boolean;
  setDirectNavModalOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toastMessage: string | null;

  // Diorama Environment States
  goldenHour: boolean;
  setGoldenHour: React.Dispatch<React.SetStateAction<boolean>>;
  dioramaZoom: number;
  setDioramaZoom: React.Dispatch<React.SetStateAction<number>>;
  soundEnabled: boolean;
  toggleSound: () => void;
  cinematicVoyageActive: boolean;
  voyageTargetTitle: string;
  triggerVoyage: (targetTitle: string, callback?: () => void) => void;

  // Landmarks
  landmarksData: typeof landmarksData;

  // Navigation Callback
  activePath: string;
  navigate: (route: string) => void;
  setActivePath: (path: any) => void;

  // Actions
  addKarma: (amount: number, reason: string) => void;
  toggleJoinCommunity: (id: string) => void;
  toggleBoMItem: (projectId: string, bomId: string) => void;
  applyToProject: (projectId: string, role: string, pitch: string) => void;
  bookMentorSession: (mentorId: string, slot: string, topic: string) => void;
  applyToOpportunity: (oppId: string, teamName: string, pitch: string) => void;
  toggleBookmark: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export interface AppProviderProps {
  children: ReactNode;
  activePath?: string;
  onNavigate?: (path: any) => void;
}

export function AppProvider({ children, activePath = "home", onNavigate }: AppProviderProps) {
  // User & Karma State
  const [profile] = useState(initialUserData.profile);
  const [karma, setKarma] = useState(initialUserData.profile.karma);
  const [karmaLedger, setKarmaLedger] = useState(initialUserData.karmaLedger);
  const [notifications, setNotifications] = useState(initialUserData.notifications);

  // Communities State
  const [communities, setCommunities] = useState(initialCommunities);

  // Projects State
  const [projects, setProjects] = useState(initialProjects);
  const [activeProjectInspectorId, setActiveProjectInspectorId] = useState("aerobloom");
  const [appliedProjects, setAppliedProjects] = useState<any[]>([]);

  // Mentors State
  const [mentors] = useState(initialMentors);
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);

  // Opportunities State
  const [opportunities] = useState(initialOpportunities);
  const [appliedOpportunities, setAppliedOpportunities] = useState<any[]>([]);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(["aerobloom", "gen-ai-salon"]));

  // UI States & Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [karmaLedgerModalOpen, setKarmaLedgerModalOpen] = useState(false);
  const [directNavModalOpen, setDirectNavModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Diorama Environment States
  const [goldenHour, setGoldenHour] = useState(false);
  const [dioramaZoom, setDioramaZoom] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [cinematicVoyageActive, setCinematicVoyageActive] = useState(false);
  const [voyageTargetTitle, setVoyageTargetTitle] = useState("Isle Quadrangle");

  // Audio Context Ref
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Show Toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((cur) => (cur === message ? null : cur));
    }, 4000);
  };

  // Add Karma
  const addKarma = (amount: number, reason: string) => {
    setKarma((prev) => prev + amount);
    const newEntry = {
      id: `k-${Date.now()}`,
      date: "Just now",
      event: reason,
      points: `+${amount}`,
      type: "gain",
    };
    setKarmaLedger((prev) => [newEntry, ...prev]);
    showToast(`🌟 +${amount} Karma Earned: ${reason}`);
  };

  // Navigation mapper
  const navigate = (route: string) => {
    const routeMap: Record<string, string> = {
      "/": "home",
      "/island": "home",
      "/mentors": "mentor",
      "/opportunities": "leaderboard",
      "/projects": "projects",
      "/communities": "community",
      "/myspace": "profile",
    };

    const targetView = routeMap[route] || routeMap[route.toLowerCase()] || "home";
    if (onNavigate) {
      onNavigate(targetView);
    }
  };

  const setActivePath = (path: any) => {
    if (onNavigate) onNavigate(path);
  };

  // Toggle Join Community
  const toggleJoinCommunity = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const willJoin = !c.joined;
          if (willJoin) {
            addKarma(10, `Joined ${c.name}`);
          } else {
            showToast(`Left ${c.name}`);
          }
          return {
            ...c,
            joined: willJoin,
            memberCount: willJoin ? c.memberCount + 1 : c.memberCount - 1,
          };
        }
        return c;
      })
    );
  };

  // Toggle BoM Item
  const toggleBoMItem = (projectId: string, bomId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedItems = p.bomItems.map((item) => {
            if (item.id === bomId) {
              const newStatus = item.status === "procured" ? "pending" : "procured";
              return { ...item, status: newStatus };
            }
            return item;
          });
          const procuredTotal = updatedItems
            .filter((item) => item.status === "procured")
            .reduce((sum, item) => sum + item.cost, 0);
          const procuredCount = updatedItems.filter((item) => item.status === "procured").length;
          return {
            ...p,
            bomItems: updatedItems,
            bomBudget: {
              ...p.bomBudget,
              sourced: procuredTotal,
              count: `${procuredCount} of ${updatedItems.length} Sourced`,
            },
          };
        }
        return p;
      })
    );
  };

  const applyToProject = (projectId: string, role: string, pitch: string) => {
    const project = projects.find((p) => p.id === projectId);
    setAppliedProjects((prev) => [...prev, { projectId, role, pitch, date: new Date().toLocaleDateString() }]);
    addKarma(15, `Applied as ${role} on ${project ? project.title : "Project"}`);
  };

  const bookMentorSession = (mentorId: string, slot: string, topic: string) => {
    const mentor = mentors.find((m) => m.id === mentorId);
    setBookedSessions((prev) => [
      ...prev,
      { mentorId, mentorName: mentor ? mentor.name : "", slot, topic, bookedAt: new Date().toLocaleDateString() },
    ]);
    addKarma(20, `Scheduled intent session with ${mentor ? mentor.name : "Mentor"}`);
  };

  const applyToOpportunity = (oppId: string, teamName: string, pitch: string) => {
    const opp = opportunities.find((o) => o.id === oppId);
    setAppliedOpportunities((prev) => [
      ...prev,
      { oppId, teamName, pitch, appliedAt: new Date().toLocaleDateString() },
    ]);
    addKarma(25, `Submitted proposal for ${opp ? opp.title : "Grant Opportunity"}`);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from saved bookmarks");
      } else {
        next.add(id);
        showToast("Saved to bookmarks in My Space");
      }
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 420;
        filter.Q.value = 1.2;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start();

        setAudioCtx(ctx);
        setSoundEnabled(true);
        showToast("🍃 Soft ambient breeze enabled");
      } catch (err) {
        console.warn("Web Audio not allowed without user interaction", err);
      }
    } else {
      if (audioCtx) {
        audioCtx.close();
        setAudioCtx(null);
      }
      setSoundEnabled(false);
      showToast("Ambient audio muted");
    }
  };

  const triggerVoyage = (targetTitle: string, callback?: () => void) => {
    if (callback) callback();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        profile,
        karma,
        setKarma,
        karmaLedger,
        setKarmaLedger,
        notifications,
        unreadCount,
        communities,
        setCommunities,
        projects,
        setProjects,
        activeProjectInspectorId,
        setActiveProjectInspectorId,
        appliedProjects,
        mentors,
        bookedSessions,
        opportunities,
        appliedOpportunities,
        landmarksData,
        bookmarks,

        addKarma,
        toggleJoinCommunity,
        toggleBoMItem,
        applyToProject,
        bookMentorSession,
        applyToOpportunity,
        toggleBookmark,
        markAllNotificationsRead,
        dismissNotification,
        showToast,

        searchModalOpen,
        setSearchModalOpen,
        notificationsDrawerOpen,
        setNotificationsDrawerOpen,
        karmaLedgerModalOpen,
        setKarmaLedgerModalOpen,
        directNavModalOpen,
        setDirectNavModalOpen,
        toastMessage,

        goldenHour,
        setGoldenHour,
        dioramaZoom,
        setDioramaZoom,
        soundEnabled,
        toggleSound,
        cinematicVoyageActive,
        voyageTargetTitle,
        triggerVoyage,

        activePath,
        navigate,
        setActivePath,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
