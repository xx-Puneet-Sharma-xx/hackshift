"use client";

import React, { useState } from "react";
import { UserProfileState, AccountRole } from "../page";

export type InboxCategory =
  | "all"
  | "friend_request"
  | "project_enrollment"
  | "karma_earned"
  | "fund_received";

export interface InboxItem {
  id: string;
  type: "friend_request" | "project_enrollment" | "karma_earned" | "fund_received";
  recipientEmail?: string;
  recipientName?: string;
  recipientRole?: AccountRole;
  title: string;
  subtitle: string;
  timestamp: string;
  read: boolean;

  // Friend Request Details
  friendInviteId?: string;
  senderName?: string;
  senderAvatar?: string;
  senderCampus?: string;
  senderHeadline?: string;
  friendMessage?: string;
  friendStatus?: "pending" | "accepted" | "declined";

  // Project Enrollment Request Details
  projectRequestId?: string;
  projectId?: string;
  projectTitle?: string;
  applicantName?: string;
  applicantAvatar?: string;
  applicantCampus?: string;
  applicantRole?: string;
  applicantBio?: string;
  applicantGithub?: string;
  applicantLinkedin?: string;
  enrollmentStatus?: "pending" | "accepted" | "declined";

  // Karma Earned Details
  karmaPoints?: number;
  karmaSource?: string;
  karmaDetail?: string;

  // Fund Received Details
  fundAmount?: number;
  fundProjectTitle?: string;
  fundFunderName?: string;
  fundType?: string;
  fundEscrowStatus?: string;
}

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfileState;
  items: InboxItem[];
  onAcceptFriend: (inviteId: string, itemId: string) => void;
  onDeclineFriend: (inviteId: string, itemId: string) => void;
  onAcceptEnrollment: (requestId: string, itemId: string) => void;
  onDeclineEnrollment: (requestId: string, itemId: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToProfile: () => void;
  onNavigateToProjects: () => void;
  onNavigateToFriends: () => void;
}

export default function InboxModal({
  isOpen,
  onClose,
  currentUser,
  items,
  onAcceptFriend,
  onDeclineFriend,
  onAcceptEnrollment,
  onDeclineEnrollment,
  onMarkAllAsRead,
  onNavigateToProfile,
  onNavigateToProjects,
  onNavigateToFriends,
}: InboxModalProps) {
  const [activeTab, setActiveTab] = useState<InboxCategory>("all");
  const [expandedBioId, setExpandedBioId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter items matching active tab
  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  // Calculate badge counts
  const totalUnread = items.filter((i) => !i.read).length;
  const friendCount = items.filter((i) => i.type === "friend_request" && i.friendStatus === "pending").length;
  const enrollCount = items.filter((i) => i.type === "project_enrollment" && i.enrollmentStatus === "pending").length;
  const karmaCount = items.filter((i) => i.type === "karma_earned" && !i.read).length;
  const fundCount = items.filter((i) => i.type === "fund_received" && !i.read).length;

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-5 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-surface-container-lowest border border-outline-variant/50 shadow-[0_20px_60px_rgba(30,58,95,0.14)] overflow-hidden relative">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-secondary/10 blur-[90px] pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/60 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary shadow-md shrink-0">
              <span className="material-symbols-outlined text-[24px]">inbox</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                  Node Communications Tray
                </h2>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-primary/15 border border-primary/30 text-primary">
                  {currentUser.nodeId || `#${currentUser.role.toUpperCase()}`}
                </span>
                {totalUnread > 0 && (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse">
                    {totalUnread} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>Account:</span>
                <span className="text-on-surface font-semibold">{currentUser.name}</span>
                <span>•</span>
                <span className="text-primary font-medium">{currentUser.campusShort || currentUser.campus}</span>
                <span>•</span>
                <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant font-mono">
                  {currentUser.role}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            {totalUnread > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-primary/50 bg-surface-container-high/40 hover:bg-surface-container-high text-xs font-mono text-on-surface-variant hover:text-primary transition-all cursor-pointer flex items-center gap-1.5"
                title="Mark all notifications as read"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>Mark all read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl apple-liquid-glass apple-liquid-glass-neutral hover:apple-liquid-glass-rose text-on-surface-variant hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Close Inbox"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-5 py-3 border-b border-outline-variant/20 bg-surface-container-lowest/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-primary text-on-primary shadow-xs"
                : "bg-surface-container-low/70 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">all_inbox</span>
            <span>All Updates</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === "all" ? "bg-on-primary/20 text-on-primary" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {items.length}
            </span>
          </button>

          {/* Friend Requests Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("friend_request")}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "friend_request"
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-surface-container-low/70 border border-outline-variant/30 text-on-surface-variant hover:text-sky-400 hover:border-sky-500/40"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>Friend Requests</span>
            {friendCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-sky-400 text-slate-950 animate-pulse">
                {friendCount}
              </span>
            )}
          </button>

          {/* Enrollment Requests Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("project_enrollment")}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "project_enrollment"
                ? "bg-[#c2593f] text-white shadow-xs"
                : "bg-surface-container-low/70 border border-outline-variant/30 text-on-surface-variant hover:text-[#c2593f] hover:border-[#c2593f]/40"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">hub</span>
            <span>Project Enrollments</span>
            {enrollCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#c2593f] text-white animate-pulse">
                {enrollCount}
              </span>
            )}
          </button>

          {/* Karma Earned Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("karma_earned")}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "karma_earned"
                ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                : "bg-surface-container-low/70 border border-outline-variant/30 text-on-surface-variant hover:text-amber-400 hover:border-amber-500/40"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span>Karma Earned</span>
            {karmaCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                {karmaCount}
              </span>
            )}
          </button>

          {/* Funds Received Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("fund_received")}
            className={`px-3.5 py-2 rounded-xl font-display text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "fund_received"
                ? "bg-emerald-500 text-white shadow-xs"
                : "bg-surface-container-low/70 border border-outline-variant/30 text-on-surface-variant hover:text-emerald-400 hover:border-emerald-500/40"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">payments</span>
            <span>Funds Received</span>
            {fundCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-400 text-slate-950 animate-pulse">
                {fundCount}
              </span>
            )}
          </button>
        </div>

        {/* Items List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-outline-variant/20 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl apple-liquid-glass apple-liquid-glass-neutral text-on-surface-variant/70 flex items-center justify-center mb-4 shadow-inner">
                <span className="material-symbols-outlined text-[32px]">
                  {activeTab === "friend_request"
                    ? "person_search"
                    : activeTab === "project_enrollment"
                    ? "developer_board"
                    : activeTab === "karma_earned"
                    ? "auto_awesome"
                    : activeTab === "fund_received"
                    ? "account_balance"
                    : "drafts"}
                </span>
              </div>
              <h4 className="font-display text-lg font-bold text-on-surface">
                No notifications in this tray
              </h4>
              <p className="text-xs text-on-surface-variant max-w-sm mt-1.5 leading-relaxed font-mono">
                {activeTab === "friend_request"
                  ? "You have no pending friend or peer connection requests for this node account."
                  : activeTab === "project_enrollment"
                  ? "No incoming student enrollment applications for projects under your lead."
                  : activeTab === "karma_earned"
                  ? "Participate in venture investments, class reviews, or project milestones to earn Karma points."
                  : activeTab === "fund_received"
                  ? "No external venture funding or grant disbursements received yet for this account."
                  : "All clear! Incoming invitations, project enrollments, karma allocations, and funds will populate here."}
              </p>
              <div className="mt-5 flex items-center gap-3">
                {activeTab === "friend_request" && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToFriends();
                    }}
                    className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/40 text-primary font-display font-semibold text-xs hover:bg-primary/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    <span>Discover Research Peers</span>
                  </button>
                )}
                {activeTab === "project_enrollment" && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToProjects();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#fdf3ec] border border-[#f0ded0] text-[#97472e] font-display font-semibold text-xs hover:bg-[#faebd7] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                    <span>Browse Ventures & Projects</span>
                  </button>
                )}
                {activeTab === "karma_earned" && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToProfile();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-display font-semibold text-xs hover:bg-amber-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">history_edu</span>
                    <span>View Karma Breakdown</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`pt-4 first:pt-0 transition-all ${
                  !item.read ? "bg-primary/[0.02]" : ""
                }`}
              >
                {/* 1. FRIEND REQUEST ITEM */}
                {item.type === "friend_request" && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-sky-500/20 hover:border-sky-500/40 transition-all flex flex-col gap-3.5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center font-display font-bold text-xs text-sky-300 shadow-sm shrink-0">
                          {item.senderAvatar || "PR"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-sm text-on-surface">
                              {item.senderName}
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono text-[10px] font-semibold">
                              {item.senderCampus}
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface-variant font-mono text-[10px]">
                              Friend Request
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant font-mono mt-0.5 line-clamp-1">
                            {item.senderHeadline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-[11px] font-mono text-on-surface-variant/70 whitespace-nowrap">
                          {item.timestamp}
                        </span>
                        {item.friendStatus === "accepted" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">check</span>
                            <span>Connected</span>
                          </span>
                        )}
                        {item.friendStatus === "declined" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">close</span>
                            <span>Declined</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Friend Request Note */}
                    {item.friendMessage && (
                      <div className="p-3 rounded-xl bg-surface-container-high/50 border border-outline-variant/30 text-xs text-on-surface italic leading-relaxed flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-sky-400 shrink-0 mt-0.5">
                          chat_bubble
                        </span>
                        <span>"{item.friendMessage}"</span>
                      </div>
                    )}

                    {/* Action buttons if still pending */}
                    {item.friendStatus === "pending" && (
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/20">
                        <button
                          type="button"
                          onClick={() => onDeclineFriend(item.friendInviteId || item.id, item.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-outline-variant/40 hover:border-rose-500/40 hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 font-mono text-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          <span>Decline</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onAcceptFriend(item.friendInviteId || item.id, item.id)}
                          className="px-4 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs transition-all hover:scale-[1.02] shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[15px]">person_check</span>
                          <span>Accept Connection</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. PROJECT ENROLLMENT REQUEST ITEM */}
                {item.type === "project_enrollment" && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-[#e2eaf2] hover:border-[#c2593f]/50 transition-all flex flex-col gap-3.5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl apple-liquid-glass apple-liquid-glass-secondary flex items-center justify-center font-display font-bold text-xs text-[#97472e] shadow-sm shrink-0">
                          {item.applicantAvatar || "AP"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-sm text-on-surface">
                              {item.applicantName}
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-[#fdf3ec] border border-[#f0ded0] text-[#97472e] font-mono text-[10px] font-semibold">
                              {item.applicantCampus}
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
                              Applied Role: {item.applicantRole}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant font-mono mt-0.5 flex items-center gap-1.5">
                            <span>Venture Target:</span>
                            <span className="text-primary font-semibold">
                              [{item.projectId}] {item.projectTitle}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-[11px] font-mono text-on-surface-variant/70 whitespace-nowrap">
                          {item.timestamp}
                        </span>
                        {item.enrollmentStatus === "accepted" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">done_all</span>
                            <span>Enrolled in Team</span>
                          </span>
                        )}
                        {item.enrollmentStatus === "declined" && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">close</span>
                            <span>Declined</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Applicant Biodata */}
                    {item.applicantBio && (
                      <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase font-bold text-[#97472e] tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[13px]">badge</span>
                            <span>Student Applicant Biodata:</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBioId(expandedBioId === item.id ? null : item.id)
                            }
                            className="text-[10px] font-mono text-primary hover:underline cursor-pointer"
                          >
                            {expandedBioId === item.id ? "Show Less" : "Full Bio"}
                          </button>
                        </div>
                        <p
                          className={`text-xs text-on-surface leading-relaxed whitespace-pre-wrap ${
                            expandedBioId === item.id ? "" : "line-clamp-2"
                          }`}
                        >
                          {item.applicantBio}
                        </p>
                      </div>
                    )}

                    {/* External profile links & action buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-outline-variant/20">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.applicantGithub && (
                          <a
                            href={
                              item.applicantGithub.startsWith("http")
                                ? item.applicantGithub
                                : `https://${item.applicantGithub}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg apple-liquid-glass apple-liquid-glass-neutral text-on-surface hover:text-primary text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                              />
                            </svg>
                            <span>GitHub</span>
                            <span className="material-symbols-outlined text-[11px] opacity-70">open_in_new</span>
                          </a>
                        )}
                        {item.applicantLinkedin && (
                          <a
                            href={
                              item.applicantLinkedin.startsWith("http")
                                ? item.applicantLinkedin
                                : `https://${item.applicantLinkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg apple-liquid-glass apple-liquid-glass-neutral text-on-surface hover:text-[#0A66C2] text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <svg className="w-3.5 h-3.5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                            </svg>
                            <span>LinkedIn</span>
                            <span className="material-symbols-outlined text-[11px] opacity-70">open_in_new</span>
                          </a>
                        )}
                      </div>

                      {item.enrollmentStatus === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onDeclineEnrollment(item.projectRequestId || item.id, item.id)
                            }
                            className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-rose-500/40 hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 font-mono text-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                            <span>Decline</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onAcceptEnrollment(item.projectRequestId || item.id, item.id)
                            }
                            className="px-4 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs transition-all hover:scale-[1.02] shadow-sm cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[15px]">done_all</span>
                            <span>Accept into Team</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. KARMA EARNED ITEM */}
                {item.type === "karma_earned" && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-amber-500/25 hover:border-amber-500/45 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/30 to-amber-600/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-display font-bold shadow-xs shrink-0">
                        <span className="material-symbols-outlined text-[22px]">bolt</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-base text-on-surface">
                            {item.title}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-xs">
                            +{item.karmaPoints?.toLocaleString()} KP
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                          {item.subtitle}
                        </p>
                        {item.karmaDetail && (
                          <p className="text-[11px] text-amber-300/80 font-mono mt-1">
                            {item.karmaDetail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span className="text-[11px] font-mono text-on-surface-variant/70 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToProfile();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-display font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Ledger</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. FUNDS RECEIVED ITEM */}
                {item.type === "fund_received" && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-teal-600/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-display font-bold shadow-xs shrink-0">
                        <span className="material-symbols-outlined text-[22px]">payments</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-base text-on-surface">
                            {item.title}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-xs">
                            +₹{item.fundAmount?.toLocaleString("en-IN")}
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-surface-container-high border border-outline-variant/30 text-emerald-400 font-mono text-[10px] font-semibold">
                            {item.fundType || "Syndicate Equity Pledge"}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                          {item.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[11px] font-mono text-on-surface-variant">
                            Backer / Angel:{" "}
                            <span className="text-on-surface font-semibold">{item.fundFunderName}</span>
                          </span>
                          <span>•</span>
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            <span>{item.fundEscrowStatus || "Escrow Deposited to Vault"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <span className="text-[11px] font-mono text-on-surface-variant/70 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToProjects();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-display font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Project Node</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/30 bg-surface-container-low/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">security</span>
            <span>Cryptographically attested node communications • Filtered for {currentUser.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-surface-container-high text-xs font-mono text-on-surface hover:text-primary transition-colors cursor-pointer"
            >
              Close Tray
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
