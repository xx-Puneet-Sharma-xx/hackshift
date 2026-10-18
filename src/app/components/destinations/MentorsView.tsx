"use client";

import React, { useState } from 'react';
import { ArrowLeft, GraduationCap, Star, Calendar, MessageSquare, Clock, Check, X, Sparkles } from 'lucide-react';

const MENTORS_DATA = [
  {
    id: 'anya-sharma',
    name: 'Dr. Anya Sharma',
    role: 'Senior Research Scientist',
    org: 'Google DeepMind',
    college: 'Stanford / IIT Alum',
    rating: 4.98,
    reviews: 64,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    tags: ['Multi-Agent Reasoning', 'Frontier LLM Alignment', 'PhD Applications'],
    bio: 'Mentoring graduate and undergraduate students on scalable alignment, mathematical foundations of deep learning, and publishing in NeurIPS/ICLR.',
    availableSlot: 'Tomorrow, 4:30 PM IST',
  },
  {
    id: 'arjun-mehta',
    name: 'Arjun Mehta',
    role: 'Lead Hardware Architect',
    org: 'Rivian',
    college: 'BITS Pilani / MIT Alum',
    rating: 5.0,
    reviews: 42,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    tags: ['Automotive Embedded Systems', 'High-Speed PCB Design', 'Battery Management'],
    bio: 'Passionate about guiding hardware builders through manufacturability (DFM), rapid silicon prototyping, and early-stage hardware startup roadmaps.',
    availableSlot: 'Thursday, 6:00 PM IST',
  },
  {
    id: 'priya-rao',
    name: 'Priya Rao',
    role: 'Venture Partner & Ex-Founder',
    org: 'Sequoia Surge',
    college: 'NSUT / Harvard MBA',
    rating: 4.95,
    reviews: 88,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
    tags: ['Student Startup Pitching', 'Pre-Seed Fundraising', 'Product Market Fit'],
    bio: 'Helping college innovators transform lab prototypes into commercially viable venture-backed technology companies.',
    availableSlot: 'Friday, 3:00 PM IST',
  },
  {
    id: 'david-chen',
    name: 'David Chen',
    role: 'Flight Systems Engineer',
    org: 'NASA Jet Propulsion Lab',
    college: 'Caltech Alum',
    rating: 4.92,
    reviews: 35,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    tags: ['Autonomous Rover Navigation', 'Real-Time Telemetry', 'Aerospace Careers'],
    bio: 'Guiding collegiate rocketry and robotics teams on fault-tolerant systems design and space mission avionics.',
    availableSlot: 'Saturday, 11:00 AM IST',
  },
];

export interface MentorItem {
  id: string;
  name: string;
  role: string;
  org: string;
  college: string;
  rating: number;
  reviews: number;
  avatar: string;
  tags: string[];
  bio: string;
  availableSlot: string;
}

export default function MentorsView({ onBackToIsland }: { onBackToIsland?: () => void }) {
  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);
  const [sessionTopic, setSessionTopic] = useState("");
  const [bookedSessions, setBookedSessions] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    setBookedSessions((prev) => [...prev, selectedMentor.id]);
    setToastMessage(`1-on-1 Office Hours booked with ${selectedMentor.name}! Check your email for calendar invite.`);
    setSelectedMentor(null);
    setSessionTopic("");
    setTimeout(() => setToastMessage(null), 4500);
  };

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
            Alumni Commons &amp; Library
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {bookedSessions.length} Sessions Scheduled
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="portal-hero">
        <h1 className="portal-title">Mentors &amp; Alumni Commons</h1>
        <p className="portal-tagline">
          The quiet study hall and discussion commons. Receive 1-on-1 career direction, technical architecture feedback, and graduate school insights from verified college alumni.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2.5rem',
            background: '#1e3a5f',
            color: '#ffffff',
            padding: '0.85rem 1.75rem',
            borderRadius: '9999px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 110,
            animation: 'fadeIn 200ms ease',
          }}
        >
          <Sparkles size={16} color="#60a5fa" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mentors Grid */}
      <div className="portal-content-grid">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {MENTORS_DATA.map((mentor) => {
            const isBooked = bookedSessions.includes(mentor.id);

            return (
              <div
                key={mentor.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 8px 24px rgba(27, 43, 65, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #e2e8f0',
                      }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                        {mentor.name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
                        {mentor.role} • {mentor.org}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {mentor.college}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Reviews */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Star size={15} fill="#f59e0b" />
                      <span>{mentor.rating}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      ({mentor.reviews} mentorship sessions completed)
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                    {mentor.bio}
                  </p>

                  {/* Expertise Tags */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {mentor.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.73rem',
                          fontWeight: 600,
                          background: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Next Available Slot */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '10px',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '1.25rem',
                      fontSize: '0.82rem',
                      color: '#166534',
                      fontWeight: 600,
                    }}
                  >
                    <Clock size={15} color="#16a34a" />
                    <span>Next slot: {mentor.availableSlot}</span>
                  </div>
                </div>

                {/* Booking Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isBooked) {
                      setSelectedMentor(mentor);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: isBooked ? '#dcfce7' : '#1e3a5f',
                    color: isBooked ? '#166534' : '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: isBooked ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.16s ease',
                  }}
                >
                  {isBooked ? (
                    <>
                      <Check size={16} color="#16a34a" />
                      <span>Session Scheduled</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={16} />
                      <span>Book 1-on-1 Guidance</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="modal-backdrop" onClick={() => setSelectedMentor(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="card-badge-tag">Office Hours Booking</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
                  Session with {selectedMentor.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedMentor.role} @ {selectedMentor.org}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBooking}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Session Time:
                </label>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  {selectedMentor.availableSlot}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  What would you like guidance on? (Questions or project link)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Preparing for research fellowships, reviewing system architecture for our drone prototype..."
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#1e293b',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#1e3a5f',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Calendar size={16} />
                  <span>Confirm Office Hours</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
