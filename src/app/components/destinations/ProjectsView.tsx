"use client";

import React, { useState } from 'react';
import { ArrowLeft, Wrench, Users, Plus, CheckCircle2, Cpu, Sparkles, Send, X } from 'lucide-react';

const INITIAL_PROJECTS = [
  {
    id: 'ocean-harvester',
    title: 'Autonomous Ocean Micro-Plastic Harvester',
    category: 'Hardware & Robotics',
    progress: 68,
    lead: 'Rohan Verma (NSUT)',
    description: 'Solar-powered autonomous catamaran utilizing high-speed edge computer vision to detect, scoop, and compact floating debris in inland waterways.',
    stack: ['ESP32', 'PyTorch Mobile', 'SolidWorks', 'LoRaWAN'],
    openRoles: ['Embedded C++ Firmware', 'Edge Computer Vision Specialist'],
    stars: 124,
  },
  {
    id: 'synapse-bci',
    title: 'Synapse: Open Non-Invasive BCI Headset',
    category: 'Biomedical & NeuroTech',
    progress: 45,
    lead: 'Maya Sen (IIT Delhi)',
    description: 'Low-cost 8-channel EEG headband designed for paralyzed patients to control speech synthesizers and wheelchairs with intent-based neural decoding.',
    stack: ['ADS1299', 'Python DSP', 'React 19', 'TensorFlow Lite'],
    openRoles: ['DSP Signal Filtering', 'Hardware PCB Layout'],
    stars: 210,
  },
  {
    id: 'mesh-emergency',
    title: 'Aetheria Distributed LoRa Emergency Mesh',
    category: 'Networks & Systems',
    progress: 82,
    lead: 'Kavita Nair (BITS Pilani)',
    description: 'Decentralized disaster communication backbone providing zero-cellular encrypted messaging and geolocation tracking over 15km line-of-sight.',
    stack: ['SX1262', 'C++ FreeRTOS', 'MapLibre GL', 'Rust'],
    openRoles: ['Cryptographic Protocol Auditor'],
    stars: 88,
  },
  {
    id: 'somatic-haptic',
    title: 'Somatic Force-Feedback Haptic Exoskeleton',
    category: 'Virtual Reality & Robotics',
    progress: 55,
    lead: 'Devansh Saxena (DTU)',
    description: 'Tendon-driven mechanical glove generating realistic resistance when interacting with virtual CAD assemblies in engineering simulations.',
    stack: ['BLDC Servos', 'Unity 3D', 'STM32', 'CAN Bus'],
    openRoles: ['Mechanical Kinematics Engineer', 'Unity XR Developer'],
    stars: 147,
  },
];

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  progress: number;
  lead: string;
  description: string;
  stack: string[];
  openRoles: string[];
  stars: number;
}

export default function ProjectsView({ onBackToIsland }: { onBackToIsland?: () => void }) {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [applicationPitch, setApplicationPitch] = useState("");
  const [appliedProjects, setAppliedProjects] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !activeModalProject) return;
    setAppliedProjects((prev) => [...prev, activeModalProject.id]);
    setToastMessage(`Application submitted for ${selectedRole} on ${activeModalProject.title}! (+10 Karma earned)`);
    setActiveModalProject(null);
    setSelectedRole("");
    setApplicationPitch("");
    setTimeout(() => setToastMessage(null), 4000);
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
            Makerspace Workshop
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {projects.length} Active Prototypes
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="portal-hero">
        <h1 className="portal-title">Projects &amp; Makerspace Lab</h1>
        <p className="portal-tagline">
          The practical engineering workshop. Explore open-source prototypes, join multidisciplinary teams, or recruit talent for your idea.
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
          <Sparkles size={16} color="#fbbf24" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Projects Grid */}
      <div className="portal-content-grid">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {projects.map((proj) => {
            const hasApplied = appliedProjects.includes(proj.id);

            return (
              <div
                key={proj.id}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#d97706',
                        background: 'rgba(245, 158, 11, 0.12)',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                      }}
                    >
                      {proj.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      Lead: {proj.lead}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.6rem' }}>
                    {proj.title}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {proj.description}
                  </p>

                  {/* Progress Milestone Bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                      <span>Prototype Milestone</span>
                      <span>{proj.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${proj.progress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Tech Stack Pills */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {proj.stack.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Open Roles Required */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                      Open Roles Looking for Talent:
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {proj.openRoles.map((role) => (
                        <span
                          key={role}
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#2563eb',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          + {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Join / Action button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!hasApplied) {
                      setActiveModalProject(proj);
                      setSelectedRole(proj.openRoles[0]);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: hasApplied ? '#dcfce7' : '#1e3a5f',
                    color: hasApplied ? '#166534' : '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: hasApplied ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.16s ease',
                  }}
                >
                  {hasApplied ? (
                    <>
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>Application Pending Review</span>
                    </>
                  ) : (
                    <>
                      <Wrench size={16} />
                      <span>Apply to Collaborate</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collaboration Application Modal */}
      {activeModalProject && (
        <div className="modal-backdrop" onClick={() => setActiveModalProject(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="card-badge-tag">Collaborator Application</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
                  {activeModalProject.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalProject(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApply}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Select the role you're applying for:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#1e293b',
                    background: '#ffffff',
                  }}
                >
                  {activeModalProject.openRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Your contribution pitch &amp; relevant experience:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your background with this stack and how you plan to contribute..."
                  value={applicationPitch}
                  onChange={(e) => setApplicationPitch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#1e293b',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setActiveModalProject(null)}
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
                  <Send size={16} />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
