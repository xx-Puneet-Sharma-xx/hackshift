"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import InboxModal, { InboxItem } from "./components/InboxModal";
import IslandHomepage from "./components/IslandHomepage";
import { AppProvider } from "./context/AppContext";
import SidebarDock from "./components/SidebarDock";
import CloudVoyageOverlay from "./components/modals/CloudVoyageOverlay";
import SearchModal from "./components/modals/SearchModal";
import NotificationsDrawer from "./components/modals/NotificationsDrawer";
import KarmaLedgerModal from "./components/modals/KarmaLedgerModal";
import QuickDirectoryModal from "./components/modals/QuickDirectoryModal";
import Toast from "./components/Toast";
import {
  getAccountInboxNotifications,
  saveUserInboxItems,
  loadUserInboxItems,
} from "./utils/inboxData";

type ViewPath =
  | "home"
  | "leaderboard"
  | "community"
  | "projects"
  | "investment"
  | "mentor"
  | "friends"
  | "profile";

type ProfileTab = "profile" | "signin" | "signup";

export type AccountRole = "student" | "alumni" | "faculty";

export interface ProjectShare {
  id: string;
  projectId: string;
  projectTitle: string;
  amountInvested: number;
  expectedInvestment: number;
  percentageInvested: number;
  sharePercentage: number;
  karmaEarned: number;
  investedAt: string;
}

export function parseInvestmentAmount(goal?: string | number): number {
  if (typeof goal === "number") return goal;
  if (!goal) return 0;
  const cleaned = String(goal).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseKpNumber(kpStr?: string): number {
  if (!kpStr) return 0;
  const cleaned = String(kpStr).replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

export interface UserProfileState {
  role: AccountRole;
  name: string;
  avatar: string;
  campus: string;
  campusShort: string;
  email: string;
  headline: string;
  degreeOrTitle: string;
  departmentOrLab: string;
  classYearOrRank: string;
  kp: string;
  nodeId: string;
  sharesOwned?: ProjectShare[];
}

export const DEFAULT_USER_PROFILES: Record<AccountRole, UserProfileState> = {
  student: {
    role: "student",
    name: "Aarav Sharma",
    avatar: "AS",
    campus: "NSUT • Delhi Innovation Hub",
    campusShort: "NSUT '26",
    email: "aarav.sharma@nsut.ac.in",
    headline: "B.Tech Computer Science & AI • Research & Systems Fellow",
    degreeOrTitle: "B.Tech in Computer Science & Engineering",
    departmentOrLab: "Autonomous Intelligence Systems Laboratory (AISL)",
    classYearOrRank: "Class of 2026",
    kp: "24,850 KP",
    nodeId: "#AS-8291",
  },
  faculty: {
    role: "faculty",
    name: "Prof. Alok Mathur",
    avatar: "AM",
    campus: "IITD • Systems & AI Node",
    campusShort: "IITD Faculty",
    email: "a.mathur@iitd.ac.in",
    headline: "Professor of Computer Science & Robotics • Autonomous Systems Laboratory PI",
    degreeOrTitle: "Tenured Professor & Faculty Research Advisor",
    departmentOrLab: "Autonomous Systems Laboratory • Systems Research",
    classYearOrRank: "Tenured Faculty • Lab PI",
    kp: "96,400 KP",
    nodeId: "#FAC-9102",
  },
  alumni: {
    role: "alumni",
    name: "Manish Sharma",
    avatar: "MS",
    campus: "DTU • Founders Syndicate Node",
    campusShort: "DTU Alumni '19",
    email: "manish.sharma@dtu.ac.in",
    headline: "Alumni Fellow '19 • Partner & Co-Founder @ Frontier Syndicate",
    degreeOrTitle: "B.Tech in Electrical Engineering ('19)",
    departmentOrLab: "Frontier Syndicate • Delhi Node",
    classYearOrRank: "Class of 2019 Alumni Fellow",
    kp: "68,200 KP",
    nodeId: "#ALUM-4821",
  },
};

export interface CommunityItem {
  id: string;
  code: string;
  name: string;
  category: string;
  desc: string;
  members: number;
  online: number;
  campus: string;
  icon: string;
  avatarColor: string;
  joined: boolean;
  isCreatedByMe?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatAttachment {
  name: string;
  size: string;
  type: "code" | "document" | "archive" | "diagram" | "other";
  url?: string;
  projectId?: string;
  projectTitle?: string;
  projectAdmin?: string;
  isContribution?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  campus: string;
  text: string;
  time: string;
  isSelf: boolean;
  reactions?: string[];
  attachment?: ChatAttachment | null;
  adminStarred?: boolean;
  starredBy?: string | null;
  karmaAwarded?: number;
}

export interface ProjectItem {
  id: string;
  campuses: string;
  tag: string;
  filterKey: string;
  title: string;
  desc: string;
  detailDescription?: string;
  requirements: string;
  stack: string;
  author?: string;
  authorCampus?: string;
  isCreatedByMe?: boolean;
  needsInvestment?: boolean;
  expectedInvestment?: number;
  investmentGoal?: string;
  createdAt?: string;
}

export interface CampusClass {
  id: string;
  title: string;
  instructorName: string;
  instructorRole: "faculty" | "alumni";
  instructorAvatar: string;
  instructorTitle: string;
  campus: string;
  departmentOrLab: string;
  category: string;
  schedule: string;
  location: string;
  description: string;
  enrolledCount: number;
  capacity: number;
  tags: string[];
  createdAt?: string;
}

export const DEFAULT_CAMPUS_CLASSES: CampusClass[] = [
  {
    id: "cls-1",
    title: "Distributed GPU Systems & Triton Kernel Optimization",
    instructorName: "Prof. Alok Mathur",
    instructorRole: "faculty",
    instructorAvatar: "AM",
    instructorTitle: "Professor of Computer Science & Lab PI",
    campus: "IITD • Systems & AI Node",
    departmentOrLab: "Robotics & Autonomy Lab • Autonomous Systems",
    category: "Distributed Systems & AI",
    schedule: "Thursdays • 4:00 PM IST (Bi-weekly)",
    location: "Live IITD Stream Node #04 • Virtual Room",
    description: "Deep-dive masterclass covering GPU memory hierarchies, Triton compiler internals, CUDA block scheduling, and distributed ZeRO-3 collective communication across multi-node clusters.",
    enrolledCount: 38,
    capacity: 50,
    tags: ["Triton", "CUDA", "PyTorch", "Distributed Systems"],
    createdAt: "Cycle S26",
  },
  {
    id: "cls-2",
    title: "Zero-to-One Technical Venture & Angel Syndicate Pitching",
    instructorName: "Manish Sharma",
    instructorRole: "alumni",
    instructorAvatar: "MS",
    instructorTitle: "Partner @ Frontier Syndicate • NSUT '19",
    campus: "NSUT • Founders Syndicate Node",
    departmentOrLab: "Incubation & Venture Cell • NSUT Campus",
    category: "Startups & Venture",
    schedule: "Saturdays • 11:00 AM IST",
    location: "NSUT Incubation Center • Seminar Hall",
    description: "Practical engineering playbook for student founders: structuring SAFE agreements, intellectual property carve-outs from research, cap table math, and pitching angel syndicates.",
    enrolledCount: 47,
    capacity: 60,
    tags: ["Startups", "SAFE", "Fundraising", "Angel Syndicate"],
    createdAt: "Cycle S26",
  },
  {
    id: "cls-3",
    title: "Generative World Models & Neural Physics Simulators",
    instructorName: "Prof. Priya Sengupta",
    instructorRole: "faculty",
    instructorAvatar: "PS",
    instructorTitle: "Adjunct Professor & AI Lab PI",
    campus: "DTU • Robotics & Perception Node",
    departmentOrLab: "Robotics & Perception Research Group",
    category: "AI & Machine Learning",
    schedule: "Wednesdays • 5:30 PM IST",
    location: "DTU Science Block • Auditorium 2",
    description: "Explore continuous diffusion in physical 3D spaces, geometric deep learning, and tactile sensor integration for autonomous humanoid manipulation and embodied agent planning.",
    enrolledCount: 29,
    capacity: 40,
    tags: ["World Models", "Robotics", "Diffusion", "Perception"],
    createdAt: "Cycle S26",
  },
  {
    id: "cls-4",
    title: "Silicon Architecture: Custom ASICs for Edge Inference",
    instructorName: "Dhruv Kapoor",
    instructorRole: "alumni",
    instructorAvatar: "DK",
    instructorTitle: "Senior Silicon Architect • IIITD '17",
    campus: "IIITD • Hardware & Silicon Node",
    departmentOrLab: "RISC-V Fellow • Edge Compute Consortium",
    category: "Hardware & Silicon",
    schedule: "Tuesdays • 6:00 PM IST",
    location: "IIITD R&D Building • VLSI Lab",
    description: "Hands-on guide to RISC-V vector extensions, Chisel hardware construction, tape-out budgeting with multi-project wafers, and memory bandwidth bottleneck mitigations.",
    enrolledCount: 22,
    capacity: 35,
    tags: ["RISC-V", "ASIC", "Hardware", "Semiconductors"],
    createdAt: "Cycle S26",
  },
];

export interface FacultyResource {
  id: string;
  title: string;
  facultyLead: string;
  facultyEmail?: string;
  campus: string;
  branch: string;
  branchLabel: string;
  category: string;
  icon: string;
  iconGlass: string;
  desc: string;
  allocation: string;
  eligibility: string;
  status: string;
  statusColor: string;
  createdAt?: string;
}

export function getFacultyEmail(res: { facultyEmail?: string; facultyLead: string; campus?: string }): string {
  if (res.facultyEmail && res.facultyEmail.includes("@")) {
    return res.facultyEmail.trim();
  }

  const lead = (res.facultyLead || "").toLowerCase();
  const campus = (res.campus || "").toLowerCase();

  // Known leads mapping
  if (lead.includes("alok") || (lead.includes("mathur") && (campus.includes("iitd") || !lead.includes("anjali")))) {
    return "a.mathur@iitd.ac.in";
  }
  if (lead.includes("anjali")) return "anjali.mathur@igdtu.ac.in";
  if (lead.includes("devendra") || lead.includes("gupta")) return "devendra.gupta@dtu.ac.in";
  if (lead.includes("kuldeep") || lead.includes("sharma")) return "kuldeep.sharma@nsut.ac.in";
  if (lead.includes("mukesh") || lead.includes("rawat")) return "mukesh.rawat@iiitd.ac.in";
  if (lead.includes("swati") || lead.includes("verma")) return "swati.verma@iitd.ac.in";
  if (lead.includes("sanjay") || lead.includes("saxena")) return "sanjay.saxena@dtu.ac.in";
  if (lead.includes("maya") || lead.includes("patel")) return "maya.patel@igdtu.ac.in";
  if (lead.includes("mohan") || lead.includes("tiwari")) return "mohan.tiwari@nsut.ac.in";
  if (lead.includes("lalit") || lead.includes("harsh")) return "lalit.harsh@desu.ac.in";
  if (lead.includes("sengupta")) return "priya.sengupta@dtu.ac.in";
  if (lead.includes("sundaram")) return "priya.sundaram@iitd.ac.in";

  // Institutional domain derivation by campus
  let domain = "alcon.network";
  if (campus.includes("iitd") || (!campus.includes("delhi technological") && campus.includes("iit"))) {
    domain = "iitd.ac.in";
  } else if (campus.includes("dtu")) {
    domain = "dtu.ac.in";
  } else if (campus.includes("nsut")) {
    domain = "nsut.ac.in";
  } else if (campus.includes("iiitd") || campus.includes("iiit")) {
    domain = "iiitd.ac.in";
  } else if (campus.includes("igdtu")) {
    domain = "igdtu.ac.in";
  } else if (campus.includes("desu")) {
    domain = "desu.ac.in";
  }

  const cleanLead = (res.facultyLead || "")
    .replace(/^(prof\.|dr\.|mr\.|mrs\.|ms\.)/i, "")
    .replace(/&.*/, "")
    .replace(/\b(and|et|al|fellows|scientists|researchers|lab|group|team)\b/gi, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(".");

  return `${cleanLead || "faculty.lead"}@${domain}`;
}

export const BRANCH_FILTERS = [
  {
    id: "all",
    label: "All Disciplines",
    sublabel: "All campus faculty labs & infrastructure",
    icon: "grid_view",
    color: "emerald",
  },
  {
    id: "electrical",
    label: "Electrical & Instruments",
    sublabel: "Cleanrooms, RF scopes, Smart Grid & Cryo",
    icon: "electrical_services",
    color: "primary",
  },
  {
    id: "cs",
    label: "Computer Science & AI",
    sublabel: "H100 clusters, NPUs & Triton nodes",
    icon: "memory",
    color: "emerald",
  },
  {
    id: "robotics",
    label: "Robotics & Mechatronics",
    sublabel: "Flight arena, Cobots & Tactile sensors",
    icon: "smart_toy",
    color: "primary",
  },
  {
    id: "mechanical",
    label: "Mechanical & Aerospace",
    sublabel: "TVAC chambers, Wind tunnels & Propulsion",
    icon: "rocket_launch",
    color: "rose",
  },
  {
    id: "biotech",
    label: "Biotech & Biomedical",
    sublabel: "CRISPR wet-labs & Cryo-EM suites",
    icon: "biotech",
    color: "secondary",
  },
];

export const DEFAULT_FACULTY_RESOURCES: FacultyResource[] = [
  {
    id: "FAC-RES-02",
    title: "Micro-Nano Fabrication Cleanroom",
    facultyLead: "Prof. Devendra Gupta & Staff Scientists",
    facultyEmail: "devendra.gupta@dtu.ac.in",
    campus: "DTU • Nano Fabrication Center",
    branch: "electrical",
    branchLabel: "Electrical & Instruments",
    category: "HARDWARE & FAB",
    icon: "precision_manufacturing",
    iconGlass: "apple-liquid-glass-primary",
    desc: "Class 100 photolithography bay, maskless aligner, plasma etchers, and atomic layer deposition (ALD) chambers.",
    allocation: "3 subsidized silicon wafer runs + packaging support",
    eligibility: "RISC-V coprocessors, MEMS sensors & quantum photonic circuits",
    status: "4 BENCHES OPEN",
    statusColor: "primary",
  },
  {
    id: "FAC-RES-07",
    title: "RF Anechoic Chamber & High-Frequency Instrumentation",
    facultyLead: "Prof. Kuldeep Sharma & Systems Group",
    facultyEmail: "kuldeep.sharma@nsut.ac.in",
    campus: "NSUT • Electromagnetics & RF Lab",
    branch: "electrical",
    branchLabel: "Electrical & Instruments",
    category: "RF & INSTRUMENTATION",
    icon: "electrical_services",
    iconGlass: "apple-liquid-glass-primary",
    desc: "Fully shielded RF anechoic chamber operating from 100MHz to 67GHz, Keysight 50GHz real-time scopes, 4-port VNAs, and automated antenna pattern scanner.",
    allocation: "15 test hours/week with automated S-parameter logging",
    eligibility: "mmWave radar, satellite RF front-ends & high-speed PCB signal integrity",
    status: "BOOKING ACTIVE",
    statusColor: "emerald",
  },
  {
    id: "FAC-RES-05",
    title: "Quantum Cryo Dilution Refrigerator",
    facultyLead: "Prof. Mukesh Rawat & Researchers",
    facultyEmail: "mukesh.rawat@iiitd.ac.in",
    campus: "IIITD • Quantum Computing Facility",
    branch: "electrical",
    branchLabel: "Electrical & Instruments",
    category: "QUANTUM HARDWARE",
    icon: "all_inclusive",
    iconGlass: "apple-liquid-glass-primary",
    desc: "BlueFors dilution refrigerator operating at 7 milliKelvin with 24 high-frequency RF coaxial lines and cryo-CMOS instrumentation.",
    allocation: "Superconducting qubit test characterization & RF cavity analysis",
    eligibility: "Quantum computing, neutral atom arrays & topological physics",
    status: "FACULTY REVIEW",
    statusColor: "primary",
  },
  {
    id: "FAC-RES-08",
    title: "Smart Grid Power Electronics & Inverter Testbed",
    facultyLead: "Prof. Anjali Mathur",
    facultyEmail: "anjali.mathur@igdtu.ac.in",
    campus: "IGDTU • Energy & Power Systems Lab",
    branch: "electrical",
    branchLabel: "Electrical & Instruments",
    category: "POWER ELECTRONICS",
    icon: "bolt",
    iconGlass: "apple-liquid-glass-emerald",
    desc: "Hardware-in-the-Loop (HIL) simulators, 100kVA regenerative grid simulators, silicon carbide (SiC) test benches, and microgrid PMU network.",
    allocation: "Full-power inverter closed-loop certification & grid sync runs",
    eligibility: "Solid-state transformers, renewable inverters & battery management systems",
    status: "2 TESTBEDS FREE",
    statusColor: "emerald",
  },
  {
    id: "FAC-RES-01",
    title: "Neural Accelerator H100 Cluster",
    facultyLead: "Prof. Swati Verma & Senior Fellows",
    facultyEmail: "swati.verma@iitd.ac.in",
    campus: "IITD • Supercomputing Hall",
    branch: "cs",
    branchLabel: "Computer Science & AI",
    category: "SUPERCOMPUTING",
    icon: "memory",
    iconGlass: "apple-liquid-glass-emerald",
    desc: "Dedicated 8x NVIDIA H100 SXM5 node partition with NVLink 4.0 and 3.2Tbps InfiniBand fabrics. Direct NFS mount to fast scratch NVMe storage.",
    allocation: "Up to 500 GPU-hours per accepted research team",
    eligibility: "Foundational LLMs, vision-language robotics & world model projects across NSUT, DTU, IIITD, IITD",
    status: "AVAILABLE FOR S26",
    statusColor: "emerald",
  },
  {
    id: "FAC-RES-09",
    title: "Distributed Triton & RISC-V Verification Cluster",
    facultyLead: "Prof. Alok Mathur & Lab Fellows",
    facultyEmail: "a.mathur@iitd.ac.in",
    campus: "IITD • Systems Architecture HPC #3",
    branch: "cs",
    branchLabel: "Computer Science & AI",
    category: "ACCELERATOR HARDWARE",
    icon: "terminal",
    iconGlass: "apple-liquid-glass-emerald",
    desc: "Heterogeneous cluster featuring AMD MI300X nodes, PCIe accelerator cards, and FPGA-emulated RISC-V compute fabrics.",
    allocation: "Cluster partition reservation with bare-metal root debugger link",
    eligibility: "Custom AI compiler pipelines & novel tensor microarchitectures",
    status: "ACCEPTED TEAMS",
    statusColor: "emerald",
  },
  {
    id: "FAC-RES-06",
    title: "Robotics Autonomy Flight Arena",
    facultyLead: "Prof. Sanjay Saxena",
    facultyEmail: "sanjay.saxena@dtu.ac.in",
    campus: "DTU • Robotics Flight Bay",
    branch: "robotics",
    branchLabel: "Robotics & Mechatronics",
    category: "ROBOTICS & AUTONOMY",
    icon: "smart_toy",
    iconGlass: "apple-liquid-glass-emerald",
    desc: "12-meter indoor high-bay flight arena equipped with 32x millimeter-precision motion capture cameras, safety netting, and ROS2 telemetry rigs.",
    allocation: "Full flight test days with motion-capture ground truth logging",
    eligibility: "Autonomous UAVs, legged quadrupeds & multi-agent swarms",
    status: "ACTIVE BOOKING",
    statusColor: "emerald",
  },
  {
    id: "FAC-RES-10",
    title: "Bimanual Manipulation & Cobot Bay",
    facultyLead: "Prof. Maya Patel & Robotics Lab",
    facultyEmail: "maya.patel@igdtu.ac.in",
    campus: "IGDTU • Autonomous Manipulation Wing",
    branch: "robotics",
    branchLabel: "Robotics & Mechatronics",
    category: "MECHATRONICS & SENSORS",
    icon: "precision_manufacturing",
    iconGlass: "apple-liquid-glass-primary",
    desc: "Dual 7-DOF arms, high-resolution tactile finger sensors, depth arrays, and adaptive grippers.",
    allocation: "Dedicated laboratory bench with daily sensor calibration cycles",
    eligibility: "Dexterous manipulation & reinforcement learning for contact-rich tasks",
    status: "3 WORKSTATIONS",
    statusColor: "primary",
  },
  {
    id: "FAC-RES-03",
    title: "Aerospace TVAC Thermal Vacuum Chamber",
    facultyLead: "Prof. Mohan Tiwari",
    facultyEmail: "mohan.tiwari@nsut.ac.in",
    campus: "NSUT • Aerospace Propulsion Bay",
    branch: "mechanical",
    branchLabel: "Mechanical & Aerospace",
    category: "AEROSPACE & PROPULSION",
    icon: "rocket_launch",
    iconGlass: "apple-liquid-glass-rose",
    desc: "2-meter thermal vacuum chamber (TVAC) capable of reaching 10^-7 Torr, solar radiation simulation lamps, and precision thruster thrust balances.",
    allocation: "Weekend hot-fire and avionics bake-out testing windows",
    eligibility: "CubeSat systems, cold-gas micro-thrusters & orbital relays",
    status: "SLOTS OPEN FOR SPRINT",
    statusColor: "rose",
  },
  {
    id: "FAC-RES-11",
    title: "Supersonic Wind Tunnel & Laser PIV Bay",
    facultyLead: "Prof. Lalit Harsh",
    facultyEmail: "lalit.harsh@desu.ac.in",
    campus: "DESU • Gas Dynamics Tunnel Bay 4",
    branch: "mechanical",
    branchLabel: "Mechanical & Aerospace",
    category: "AERODYNAMICS & FLUIDS",
    icon: "air",
    iconGlass: "apple-liquid-glass-rose",
    desc: "Continuous-flow supersonic blowdown wind tunnel (Mach 0.8 to 2.5), Nd:YAG dual-pulsed laser sheet for PIV, and Schlieren optics.",
    allocation: "4 wind tunnel runs per test cycle with optical engineer assistance",
    eligibility: "High-speed aerodynamics, boundary layer shock interaction & hypersonic gliders",
    status: "SPRING SLOTS",
    statusColor: "rose",
  },
  {
    id: "FAC-RES-04",
    title: "Bio-Design Molecular Foundry & Wet Lab",
    facultyLead: "Prof. Priya Sengupta",
    facultyEmail: "priya.sengupta@dtu.ac.in",
    campus: "DTU • Computational Biology Wet Labs",
    branch: "biotech",
    branchLabel: "Biotech & Biomedical",
    category: "SYNTHETIC BIOLOGY",
    icon: "biotech",
    iconGlass: "apple-liquid-glass-secondary",
    desc: "Automated acoustic liquid handlers, Illumina NextSeq 2000 sequencer, and biological safety cabinet (BSL-2) benches.",
    allocation: "Reagent sponsorship & high-throughput assay screening runs",
    eligibility: "Protein folding models, enzyme engineering & viral vector design",
    status: "ACCEPTING PROPOSALS",
    statusColor: "secondary",
  },
  {
    id: "FAC-RES-12",
    title: "Cryo-EM Molecular Imaging Suite",
    facultyLead: "Prof. Priya Sundaram",
    facultyEmail: "priya.sundaram@iitd.ac.in",
    campus: "IITD • Structural Biology Core",
    branch: "biotech",
    branchLabel: "Biotech & Biomedical",
    category: "BIOMEDICAL IMAGING",
    icon: "microbiology",
    iconGlass: "apple-liquid-glass-secondary",
    desc: "Cryo-TEM with direct electron detector, automated vitrification Vitrobot, and single-particle reconstruction pipeline.",
    allocation: "Grid preparation + 24-hour continuous automated imaging sessions",
    eligibility: "Structural biology, macromolecular complexes & targeted therapeutics",
    status: "FACULTY ACCESS",
    statusColor: "secondary",
  },
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "PRJ-082",
    campuses: "NSUT • SYSTEMS + NEURAL NPU",
    tag: "ALPHA 0.4",
    filterKey: "alpha",
    title: "Synapse Core OS",
    desc: "Microkernel OS crafted for local neural coprocessors on lightweight portable rigs. Real-time deterministic scheduling.",
    detailDescription: "Synapse Core OS is an ultra-lightweight microkernel engineered specifically to interface directly with onboard edge neural accelerators (NPU/TPU). Designed for zero-latency kernel preemption, lock-free memory mapping for KV caching, and fault-tolerant hardware sandboxing for embedded autonomous agents.",
    requirements: "Looking for: Rust low-level systems engineer with experience in RISC-V or ARM64 assembly; familiarity with hardware interrupt controllers, POSIX compatibility layers, and WebAssembly embedded runtimes.",
    stack: "Rust • WebAssembly • C++",
    author: "Aarav Sharma",
    authorCampus: "NSUT '26",
    needsInvestment: true,
    expectedInvestment: 2500000,
    investmentGoal: "₹25,00,000 Micro-Seed",
  },
  {
    id: "PRJ-104",
    campuses: "DTU • BIOMEDICAL + GNN",
    tag: "PRE-SEED BACKED",
    filterKey: "pre-seed",
    title: "ChronoGraph Bio",
    desc: "Algorithmic simulation engine predicting protein fold transitions under varying thermal and chemical gradients.",
    detailDescription: "ChronoGraph Bio models structural transitions in multi-subunit protein complexes across non-equilibrium biological conditions. By fusing accelerated molecular dynamics with geometric graph neural networks (GNNs), it reduces multi-microsecond simulation times down from weeks to hours.",
    requirements: "Need: Computational biophysicist or ML researcher with PyTorch Geometric experience. Compute sponsors with cluster access (H100/A100 nodes) for large-scale antibody binder validation.",
    stack: "PyTorch • CUDA • Next.js",
    author: "Priya Sundaram",
    authorCampus: "DTU '26",
    needsInvestment: true,
    expectedInvestment: 5000000,
    investmentGoal: "₹50,00,000 Catalyst Round",
  },
  {
    id: "PRJ-119",
    campuses: "IIITD • DISTRIBUTED + TRITON",
    tag: "GRANT FUNDED",
    filterKey: "grant",
    title: "VectorTriton Training Node",
    desc: "P2P distributed gradient aggregation protocol for student clusters training 7B parameter reasoning foundations.",
    detailDescription: "VectorTriton coordinates heterogeneous consumer GPUs and university HPC nodes using gradient quantization, adaptive compression, and Ring-AllReduce over consumer fiber connections. Enables research syndicates to co-train frontier open models collectively.",
    requirements: "Looking for: Distributed systems engineer familiar with NCCL, custom Triton GPU kernels, and asynchronous peer-to-peer gossip network architectures with latency tolerance.",
    stack: "Python • Triton • ROCm",
    author: "Kabir Verma",
    authorCampus: "IIITD '25",
    needsInvestment: true,
    expectedInvestment: 3500000,
    investmentGoal: "₹35,00,000 Research Grant",
  },
  {
    id: "PRJ-140",
    campuses: "IGDTU • ZK CRYPTO + NOVA",
    tag: "ALPHA 0.2",
    filterKey: "alpha",
    title: "ZeroGrid Proof Engine",
    desc: "Hardware-accelerated Zero-Knowledge rollups verifying smart grid electrical load without revealing residential locations.",
    detailDescription: "ZeroGrid leverages Nova-based recursive folding schemes to compress thousands of micro-grid smart meter attestations into a single succinct proof. Guarantees grid stability verification while mathematically preserving consumer physical anonymity and privacy.",
    requirements: "Looking for: ZK cryptographer familiar with Circom / Halo2 / Plonky3, plus smart contract security auditor for on-chain proof verification contracts.",
    stack: "Circom • Solidity • Go",
    author: "Ananya Iyer",
    authorCampus: "IGDTU '26",
    needsInvestment: true,
    expectedInvestment: 4000000,
    investmentGoal: "₹40,00,000 Innovation Grant",
  },
];

export interface ProjectJoinRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantName: string;
  applicantCampus: string;
  applicantAvatar: string;
  role: string;
  bio: string;
  github: string;
  linkedin: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

const DEFAULT_PROJECT_REQUESTS: ProjectJoinRequest[] = [
  {
    id: "req-101",
    projectId: "PRJ-005",
    projectTitle: "AeroMesh Protocol",
    applicantName: "Kabir Verma",
    applicantCampus: "IIITD '25 • EECS & Aerospace",
    applicantAvatar: "KV",
    role: "Embedded RF & LoRa Engineer",
    bio: "Senior EECS student at IIITD working with the Space Systems Lab. Previously engineered telemetry transmitters for student satellite missions. Proficient in bare-metal C on STM32, radio packet fragmentation, and antenna impedance matching. Looking to build decentralized telemetry relays.",
    github: "https://github.com/kabirverma-iiitd",
    linkedin: "https://linkedin.com/in/kabir-verma-systems",
    status: "pending",
    createdAt: "2026-10-17T13:20:00.000Z",
  },
  {
    id: "req-102",
    projectId: "PRJ-005",
    projectTitle: "AeroMesh Protocol",
    applicantName: "Ananya Iyer",
    applicantCampus: "IGDTU '26 • Computer Science",
    applicantAvatar: "AI",
    role: "Flight Simulation & Distributed Mesh Lead",
    bio: "CS researcher at IGDTU focused on gossip mesh networks and ad-hoc packet routing in intermittent connectivity environments. Built real-time physical telemetry simulators in Rust and WebAssembly. Interested in testing mesh propagation across orbital planes.",
    github: "https://github.com/ananya-iyer-igdtu",
    linkedin: "https://linkedin.com/in/ananya-iyer-zk",
    status: "pending",
    createdAt: "2026-10-17T14:05:00.000Z",
  },
];

export interface PeerItem {
  id: string;
  name: string;
  campus: string;
  filterCampus: string;
  avatar: string;
  headline: string;
  bio: string;
  match: string;
  skills: string[];
  github: string;
  linkedin: string;
  kp: string;
  major: string;
  activeProjects: string[];
  onlineStatus: "online" | "building" | "in lab";
  role: string;
}

export interface FriendInvite {
  id: string;
  senderId: string;
  senderName: string;
  senderCampus: string;
  senderAvatar: string;
  senderHeadline: string;
  recipientId: string;
  recipientName: string;
  recipientCampus: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  message?: string;
}

const DEFAULT_PEERS: PeerItem[] = [
  {
    id: "AC",
    name: "Aarav Sharma",
    campus: "NSUT '26",
    filterCampus: "nsut",
    avatar: "AS",
    headline: "Symbolic Systems & Distributed Kernel Engineering",
    bio: "Junior Systems Engineer & Researcher at NSUT. Working on microkernel isolation, typed capability systems, and formal verification of concurrent distributed primitives.",
    match: "100% Match",
    skills: ["Rust", "Distributed Systems", "Wasm", "TypeScript", "Formal Verification"],
    github: "https://github.com/aaravsharma",
    linkedin: "https://linkedin.com/in/aarav-sharma-ai",
    kp: "42,850 KP",
    major: "B.Tech in Computer Science & Engineering (NSUT)",
    activeProjects: ["Synapse Core OS", "AeroMesh Protocol"],
    onlineStatus: "building",
    role: "Lead Systems Architect",
  },
  {
    id: "AL",
    name: "Aditya Verma",
    campus: "DTU '26",
    filterCampus: "dtu",
    avatar: "AV",
    headline: "Systems & Low-level Kernel • Distributed Systems",
    bio: "Junior Systems Engineer at DTU. Focused on RISC-V microkernel preemption, deterministic scheduling, and eBPF network telemetry. Core contributor to the Synapse Core OS project and AeroMesh RF transceiver.",
    match: "98% Match",
    skills: ["Rust", "Zig", "eBPF", "Linux Kernel", "QEMU"],
    github: "https://github.com/aditya-verma-kernel",
    linkedin: "https://linkedin.com/in/aditya-verma-systems",
    kp: "18,420 KP",
    major: "B.Tech in Information Technology (DTU)",
    activeProjects: ["Synapse Core OS", "AeroMesh Protocol"],
    onlineStatus: "online",
    role: "Low-level Systems Engineer",
  },
  {
    id: "ZT",
    name: "Sneha Patel",
    campus: "IGDTU '25",
    filterCampus: "igdtu",
    avatar: "SP",
    headline: "Computational Bio & Molecular Dynamics ML",
    bio: "Senior Bioengineering Researcher at IGDTU. Combining geometric graph neural networks with accelerated molecular mechanics for non-equilibrium protein conformation prediction and therapeutic antibody design.",
    match: "95% Match",
    skills: ["PyTorch", "CUDA", "Geometric GNNs", "Next.js", "BioPython"],
    github: "https://github.com/sneha-patel-bio",
    linkedin: "https://linkedin.com/in/sneha-patel-bio",
    kp: "22,150 KP",
    major: "B.Tech in Computer Science & Bioscience (IGDTU)",
    activeProjects: ["ChronoGraph Bio"],
    onlineStatus: "building",
    role: "ML Biophysics Researcher",
  },
  {
    id: "RN",
    name: "Rohan Nair",
    campus: "IIITD '26",
    filterCampus: "iiitd",
    avatar: "RN",
    headline: "Zero-Knowledge Proofs & Cryptographic Primitives",
    bio: "Cryptographic Researcher at IIITD. Authoring Circom and Halo2 circuits for private smart meter load attestations without disclosing residential locations.",
    match: "92% Match",
    skills: ["ZK-SNARKs", "Solidity", "Circom", "Halo2", "Go"],
    github: "https://github.com/rohan-nair-zk",
    linkedin: "https://linkedin.com/in/rohan-nair-crypto",
    kp: "16,900 KP",
    major: "B.Tech in Computer Science & Applied Mathematics (IIITD)",
    activeProjects: ["ZeroGrid Proof Engine"],
    onlineStatus: "online",
    role: "Cryptographic Engineer",
  },
  {
    id: "ER",
    name: "Esha Rawat",
    campus: "IITD '25",
    filterCampus: "iitd",
    avatar: "ER",
    headline: "Autonomous UAV Flight Control & Multi-Agent Swarms",
    bio: "Autonomous Robotics Researcher at IITD. Developing decentralized visual-inertial odometry (VIO) algorithms and real-time state estimation for micro-drone swarms in GPS-denied test tunnels.",
    match: "90% Match",
    skills: ["ROS 2", "C++", "Simulink", "Gazebo", "VIO"],
    github: "https://github.com/esha-rawat-robotics",
    linkedin: "https://linkedin.com/in/esha-rawat-robotics",
    kp: "19,300 KP",
    major: "M.Tech in Robotics & Automation (IITD)",
    activeProjects: ["AeroMesh Protocol", "Robotics Arena"],
    onlineStatus: "in lab",
    role: "Autonomous Robotics Engineer",
  },
  {
    id: "KV",
    name: "Kabir Verma",
    campus: "DTU '25",
    filterCampus: "dtu",
    avatar: "KV",
    headline: "Distributed Gradient Aggregation & P2P Protocols",
    bio: "Distributed Systems Architect at DTU. Architected VectorTriton's peer-to-peer gradient exchange protocol coordinating heterogeneous consumer GPUs and HPC nodes with adaptive FP8 quantization.",
    match: "94% Match",
    skills: ["Python", "Triton", "ROCm", "NCCL", "C++"],
    github: "https://github.com/kabirverma-systems",
    linkedin: "https://linkedin.com/in/kabir-verma-systems",
    kp: "38,420 KP",
    major: "B.Tech in Computer Engineering (DTU)",
    activeProjects: ["VectorTriton Training Node"],
    onlineStatus: "online",
    role: "Distributed Systems Architect",
  },
  {
    id: "PS",
    name: "Priya Sundaram",
    campus: "IGDTU '26",
    filterCampus: "igdtu",
    avatar: "PS",
    headline: "Quantum Simulation & Accelerated CUDA Kernels",
    bio: "High-Performance ML Engineer at IGDTU. Optimizing custom CUDA matrix-multiplication kernels for Hamiltonian evolution simulation and accelerated molecular folding dynamics on multi-GPU A100/H100 clusters.",
    match: "93% Match",
    skills: ["CUDA", "C++", "PyTorch", "Qiskit", "Triton"],
    github: "https://github.com/priya-sundaram-ai",
    linkedin: "https://linkedin.com/in/priya-sundaram-ai",
    kp: "32,150 KP",
    major: "B.Tech in Artificial Intelligence (IGDTU)",
    activeProjects: ["ChronoGraph Bio"],
    onlineStatus: "online",
    role: "High-Performance ML Engineer",
  },
  {
    id: "LG",
    name: "Lakshya Gupta",
    campus: "DESU '25",
    filterCampus: "desu",
    avatar: "LG",
    headline: "Synthetic Biology Models & CRISPR Off-Target Predictors",
    bio: "Computational Biochemistry Researcher at DESU. Designing transformer encoders for predicting Cas9/Cas12 off-target cleavage efficiency on human genome sequences, with automated validation on Echo 525 liquid handlers.",
    match: "91% Match",
    skills: ["Python", "TensorFlow", "Nextflow", "BioPython", "R"],
    github: "https://github.com/lakshya-gupta-bio",
    linkedin: "https://linkedin.com/in/lakshya-gupta-bio",
    kp: "28,900 KP",
    major: "M.Tech in Computational Biotechnology (DESU)",
    activeProjects: ["ChronoGraph Bio"],
    onlineStatus: "building",
    role: "Bioinformatics Researcher",
  },
  {
    id: "MS",
    name: "Manav Sharma",
    campus: "NSUT '25",
    filterCampus: "nsut",
    avatar: "MS",
    headline: "Robotics Firmware & Brushless Actuator Drivers",
    bio: "Embedded Hardware Engineer at NSUT. Designed custom field-oriented control (FOC) motor driver boards for quadruped robotic legs with high-bandwidth CAN-FD bus telemetry.",
    match: "89% Match",
    skills: ["KiCAD", "Embedded C", "STM32", "CAN-bus", "SolidWorks"],
    github: "https://github.com/manav-sharma-hardware",
    linkedin: "https://linkedin.com/in/manav-sharma-hardware",
    kp: "12,400 KP",
    major: "B.Tech in Mechanical Engineering (NSUT)",
    activeProjects: ["Synapse Core OS"],
    onlineStatus: "in lab",
    role: "Embedded Hardware Engineer",
  },
];

const DEFAULT_FRIEND_INVITES: FriendInvite[] = [
  {
    id: "inv-01",
    senderId: "ZT",
    senderName: "Sneha Patel",
    senderCampus: "IGDTU '25",
    senderAvatar: "SP",
    senderHeadline: "Computational Bio & Molecular Dynamics ML",
    recipientId: "AC",
    recipientName: "Aarav Sharma",
    recipientCampus: "NSUT '26",
    status: "pending",
    createdAt: "10 mins ago",
    message: "Hey Aarav! Loved your Synapse Core microkernel architecture presentation. Would love to connect and chat about deterministic scheduling for molecular simulations!",
  },
  {
    id: "inv-02",
    senderId: "RN",
    senderName: "Rohan Nair",
    senderCampus: "IIITD '26",
    senderAvatar: "RN",
    senderHeadline: "Zero-Knowledge Proofs & Cryptographic Circuits",
    recipientId: "AC",
    recipientName: "Aarav Sharma",
    recipientCampus: "NSUT '26",
    status: "pending",
    createdAt: "2 hours ago",
    message: "Hi Aarav, our team at IIITD is exploring recursive ZK folding schemes. We'd love to connect and see if we can collaborate on verifiable edge runtimes.",
  },
];

const DEFAULT_COMMUNITIES: CommunityItem[] = [
  {
    id: "g-01",
    code: "[G.01] AI SYSTEMS",
    name: "Distributed AI Inference",
    category: "AI & Machine Learning",
    desc: "Optimizing multi-node model execution across student GPU clusters, vLLM forks, and local rigs.",
    members: 1420,
    online: 84,
    campus: "AI Systems & Acceleration",
    icon: "memory",
    avatarColor: "from-cyan-500/30 to-blue-600/30",
    joined: true,
    lastMessage: "PR #42 merged: added FP8 quantized KV cache support for multi-GPU inference.",
    lastMessageTime: "10:42 AM",
    unreadCount: 3,
  },
  {
    id: "g-02",
    code: "[G.02] HARDWARE",
    name: "Robotics & Silicon Lab",
    category: "Robotics & Silicon",
    desc: "Custom ASIC tape-outs, quadcopter flight controllers, and dorm fabrication schematics.",
    members: 920,
    online: 46,
    campus: "Robotics & Silicon Collective",
    icon: "precision_manufacturing",
    avatarColor: "from-amber-500/30 to-orange-600/30",
    joined: true,
    lastMessage: "PCB revision 2.1 schematics uploaded to repo. Checking thermal traces.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "g-03",
    code: "[G.03] CRYPTO & ZK",
    name: "Zero-Knowledge Cryptography",
    category: "Cryptography & ZK",
    desc: "Peer-audited proof circuits, verifiable credentials, and decentralized consensus research.",
    members: 640,
    online: 32,
    campus: "ZK & Applied Cryptography",
    icon: "lock",
    avatarColor: "from-emerald-500/30 to-teal-600/30",
    joined: true,
    lastMessage: "Halo2 folding scheme benchmark results look promising on M3 chips.",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
  },
  {
    id: "g-04",
    code: "[G.04] BIO & COMP",
    name: "Synthetic Biology Models",
    category: "Bioengineering",
    desc: "Deep learning applied to CRISPR targets, enzyme synthesis, and folding dynamics.",
    members: 510,
    online: 19,
    campus: "Biotech & Molecular Modeling",
    icon: "biotech",
    avatarColor: "from-[#e0eaf3] to-[#d0e0ed]",
    joined: false,
    lastMessage: "AlphaFold 3 pipeline reproduction notes published.",
    lastMessageTime: "3 days ago",
    unreadCount: 0,
  },
  {
    id: "g-05",
    code: "[G.05] AEROSPACE",
    name: "SmallSat & Propulsion",
    category: "Aerospace & Satellites",
    desc: "CubeSat avionics, high-altitude telemetry links, and cold gas thruster simulations.",
    members: 380,
    online: 14,
    campus: "SmallSat & Space Avionics",
    icon: "rocket_launch",
    avatarColor: "from-rose-500/30 to-orange-600/30",
    joined: false,
    lastMessage: "Ground station VHF transceiver test scheduled for Saturday evening.",
    lastMessageTime: "Oct 14",
    unreadCount: 0,
  },
  {
    id: "g-06",
    code: "[G.06] NEURO",
    name: "Brain-Computer Interfaces",
    category: "NeuroTech",
    desc: "Open EEG signal processing, neural decoding pipelines, and sensory feedback loops.",
    members: 430,
    online: 21,
    campus: "NeuroTech & Sensory Systems",
    icon: "psychology",
    avatarColor: "from-blue-500/30 to-indigo-600/30",
    joined: false,
    lastMessage: "Motor imagery classification pipeline achieved 91% accuracy on 8-channel rig.",
    lastMessageTime: "Oct 12",
    unreadCount: 0,
  },
];

const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  "g-01": [
    {
      id: "m-1",
      sender: "Kabir Verma",
      avatar: "KV",
      campus: "IIITD '25",
      text: "Hey everyone! Just spun up the 4x A100 test cluster in the ALCON node lab. We're benchmarking FlashAttention-3 kernels on Llama 3 70B.",
      time: "10:14 AM",
      isSelf: false,
      reactions: ["🔥 5"],
    },
    {
      id: "m-2",
      sender: "Priya Sundaram",
      avatar: "PS",
      campus: "DTU '26",
      text: "Awesome Kabir! Did you see the new Triton kernel PR? We reduced memory footprint by 28% for sequence lengths > 16k.",
      time: "10:28 AM",
      isSelf: false,
      reactions: ["🚀 4"],
    },
    {
      id: "m-3",
      sender: "Aarav Sharma",
      avatar: "AS",
      campus: "NSUT '26",
      text: "Tested that kernel on our ALCON node last night. KV cache hit rate jumped significantly. Pushing the benchmark graphs to the guild repo now!",
      time: "10:35 AM",
      isSelf: true,
      reactions: ["❤️ 6"],
    },
    {
      id: "m-4",
      sender: "Kabir Verma",
      avatar: "KV",
      campus: "IIITD '25",
      text: "PR #42 merged: added FP8 quantized KV cache support for multi-GPU inference. Ready for review!",
      time: "10:42 AM",
      isSelf: false,
      reactions: ["🎉 8"],
      attachment: {
        name: "fp8_quantized_kv_cache.py",
        size: "18.4 KB",
        type: "code",
        projectId: "PRJ-082",
        projectTitle: "Synapse Core OS",
        projectAdmin: "Aarav Sharma",
        isContribution: true,
      },
      adminStarred: false,
    },
  ],
  "g-02": [
    {
      id: "m-201",
      sender: "Manav Sharma",
      avatar: "MS",
      campus: "NSUT '25",
      text: "Just received the Oshpark custom quadcopter motor ESC boards. Soldering the MOSFETs today in the NSUT hardware lab.",
      time: "Yesterday",
      isSelf: false,
      reactions: ["🛠️ 3"],
    },
    {
      id: "m-202",
      sender: "Aditya Verma",
      avatar: "AV",
      campus: "DTU '26",
      text: "PCB revision 2.1 schematics uploaded to repo. Checking thermal traces on the high-side drivers.",
      time: "Yesterday",
      isSelf: false,
      reactions: [],
    },
  ],
  "g-03": [
    {
      id: "m-301",
      sender: "Esha Rawat",
      avatar: "ER",
      campus: "IGDTU '26",
      text: "Halo2 folding scheme benchmark results look promising on M3 chips. Under 40ms per constraint batch.",
      time: "2 days ago",
      isSelf: false,
      reactions: ["🔐 7"],
    },
  ],
  "dm-MS": [
    {
      id: "dm-ms-1",
      sender: "Manav Sharma",
      avatar: "MS",
      campus: "NSUT '25",
      text: "Hey Aarav! Saw your update on Synapse Core OS. The RISC-V interrupt preemption logic is super slick. Are you free to review our CAN-FD brushless actuator driver schematics this week?",
      time: "11:20 AM",
      isSelf: false,
      reactions: ["👍 1"],
    },
    {
      id: "dm-ms-2",
      sender: "Aarav Sharma",
      avatar: "AS",
      campus: "NSUT '26",
      text: "Hey Manav! Yes, absolutely! I'm in the NSUT systems lab this afternoon. Send over the KiCAD schematics or drop by whenever you're around.",
      time: "11:24 AM",
      isSelf: true,
      reactions: ["🚀 2"],
    },
    {
      id: "dm-ms-3",
      sender: "Manav Sharma",
      avatar: "MS",
      campus: "NSUT '25",
      text: "Awesome, just pushed the KiCAD revision to GitHub. Looking forward to your feedback on the high-side MOSFET layout!",
      time: "11:30 AM",
      isSelf: false,
      reactions: ["🔥 1"],
    },
  ],
  "dm-AL": [
    {
      id: "dm-al-1",
      sender: "Aditya Verma",
      avatar: "AV",
      campus: "DTU '26",
      text: "Hey Aarav! Glad to connect on ALCON. We're running eBPF tracepoints on the RISC-V QEMU microkernel. Would love to collaborate on the Synapse Core OS deterministic scheduling module.",
      time: "Yesterday",
      isSelf: false,
      reactions: ["🤝 1"],
    },
  ],
  "dm-ZT": [
    {
      id: "dm-zt-1",
      sender: "Sneha Patel",
      avatar: "SP",
      campus: "IGDTU '25",
      text: "Hi Aarav! Thanks for connecting. Are you attending the Bio-X ML workshop this Thursday? We're presenting ChronoGraph Bio non-equilibrium protein conformation results.",
      time: "2 days ago",
      isSelf: false,
      reactions: ["🧬 2"],
    },
  ],
};

const PATH_TITLES: Record<ViewPath, string> = {
  home: "INTER-COLLEGIATE HUB",
  leaderboard: "CAMPUS STANDINGS",
  community: "COLLEGIATE GUILDS",
  projects: "VENTURE ARCHIVE",
  investment: "FACULTY RESEARCH & LAB RESOURCES",
  mentor: "CAMPUS MASTERCLASSES",
  friends: "RESEARCH PEERS",
  profile: "NODE PASSPORT",
};

export default function Home() {
  const [activePath, setActivePathState] = useState<ViewPath>("home");
  const [fromPath, setFromPath] = useState<ViewPath>("home");
  const [targetPath, setTargetPath] = useState<ViewPath>("home");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "sliding">("idle");

  const setActivePath = (newPath: ViewPath) => {
    if (newPath === activePath || transitionPhase !== "idle") return;

    const pathOrder: ViewPath[] = [
      "home",
      "leaderboard",
      "community",
      "projects",
      "investment",
      "mentor",
      "friends",
      "profile",
    ];
    const fromIdx = pathOrder.indexOf(activePath);
    const toIdx = pathOrder.indexOf(newPath);
    const dir = toIdx >= fromIdx ? "left" : "right";

    window.scrollTo({ top: 0, behavior: "instant" });
    setFromPath(activePath);
    setTargetPath(newPath);
    setSlideDirection(dir);
    setTransitionPhase("sliding");

    setTimeout(() => {
      setActivePathState(newPath);
      setTransitionPhase("idle");
    }, 520);
  };

  const [profileTab, setProfileTab] = useState<ProfileTab>("signin");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfileState>(DEFAULT_USER_PROFILES.student);
  const [signinRole, setSigninRole] = useState<AccountRole>("student");
  const [signinEmail, setSigninEmail] = useState<string>("ariachen@alcon.network");
  const [signupRole, setSignupRole] = useState<AccountRole>("student");
  const [signupCampus, setSignupCampus] = useState<string>("Global Innovation Node");
  const [signupName, setSignupName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupTitle, setSignupTitle] = useState<string>("");
  const [signupDept, setSignupDept] = useState<string>("");
  const [signupClassYear, setSignupClassYear] = useState<string>("Class of 2026");
  const [signupMajor, setSignupMajor] = useState<string>("Symbolic Systems & AI");

  // Filter state for leaderboards
  const [leaderboardFilter, setLeaderboardFilter] = useState("all");
  const [leaderboardCategory, setLeaderboardCategory] = useState<"all" | "contributors" | "mentors" | "funds">("all");

  // Filter for faculty resources by branch
  const [resourceBranch, setResourceBranch] = useState<string>("all");
  const [resourceSearch, setResourceSearch] = useState<string>("");
  const [resourcesList, setResourcesList] = useState<FacultyResource[]>(DEFAULT_FACULTY_RESOURCES);
  const [isCreateResourceOpen, setIsCreateResourceOpen] = useState<boolean>(false);
  const [isSubmittingResource, setIsSubmittingResource] = useState<boolean>(false);
  const [newResourceForm, setNewResourceForm] = useState({
    title: "",
    branch: "electrical",
    category: "LAB ALLOCATION",
    desc: "",
    allocation: "15 test hours/week with lab technician support",
    eligibility: "Open to student project teams & research fellows",
    status: "BENCHES OPEN",
    icon: "electrical_services",
  });

  // Filter for projects
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectTab, setProjectTab] = useState<"created" | "discover" | "all">("all");
  const [isMyProjectsDropdownOpen, setIsMyProjectsDropdownOpen] = useState<boolean>(false);
  const [isDiscoverDropdownOpen, setIsDiscoverDropdownOpen] = useState<boolean>(false);
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState<boolean>(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<ProjectItem | null>(null);
  const [isSubmittingProject, setIsSubmittingProject] = useState<boolean>(false);
  const [newProjectForm, setNewProjectForm] = useState({
    title: "",
    campuses: "SYSTEMS + NEURAL NPU",
    tag: "ALPHA 0.1",
    filterKey: "alpha",
    detailDescription: "",
    requirements: "",
    stack: "Rust • WebAssembly • Next.js",
    needsInvestment: false,
    expectedInvestment: "",
    investmentGoal: "",
  });

  // Project Investment Modal State
  const [investingProject, setInvestingProject] = useState<ProjectItem | null>(null);
  const [investPledgeAmount, setInvestPledgeAmount] = useState<string>("2500");

  // Project Joining Requests & Applications State
  const [projectRequests, setProjectRequests] = useState<ProjectJoinRequest[]>(DEFAULT_PROJECT_REQUESTS);
  const [applyingProject, setApplyingProject] = useState<ProjectItem | null>(null);
  const [reviewingProjectRequests, setReviewingProjectRequests] = useState<ProjectItem | null>(null);
  const [isSubmittingJoinRequest, setIsSubmittingJoinRequest] = useState<boolean>(false);
  const [joinForm, setJoinForm] = useState({
    applicantName: "Aarav Sharma",
    applicantCampus: "NSUT '26 • CS & Systems",
    role: "Core Contributor / Systems Engineer",
    bio: "",
    github: "https://github.com/aaravsharma",
    linkedin: "https://linkedin.com/in/aarav-sharma-ai",
  });

  // Booking modal for mentors
  const [bookedMentor, setBookedMentor] = useState<string | null>(null);

  // Campus Classes & Masterclasses State
  const [classesList, setClassesList] = useState<CampusClass[]>(DEFAULT_CAMPUS_CLASSES);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState<boolean>(false);
  const [isSubmittingClass, setIsSubmittingClass] = useState<boolean>(false);
  const [joinedClasses, setJoinedClasses] = useState<Record<string, boolean>>({
    "cls-1": true,
  });
  const [classFilter, setClassFilter] = useState<string>("all");
  const [activeMentorView, setActiveMentorView] = useState<"classes" | "advisors">("classes");
  const [newClassForm, setNewClassForm] = useState({
    title: "",
    category: "Distributed Systems & AI",
    schedule: "Thursdays • 4:00 PM IST",
    location: "Live ALCON Stream Node #04 • Virtual Room",
    description: "",
    capacity: "50",
    tags: "GPU • Triton • CUDA • Distributed",
  });

  // Connected state for peers
  const [peersList, setPeersList] = useState<PeerItem[]>(DEFAULT_PEERS);
  const [peerSearchQuery, setPeerSearchQuery] = useState<string>("");
  const [peerCampusFilter, setPeerCampusFilter] = useState<string>("all");
  const [activeFriendTab, setActiveFriendTab] = useState<"discover" | "incoming" | "sent" | "connected">("discover");
  const [selectedPeerForProfile, setSelectedPeerForProfile] = useState<PeerItem | null>(null);
  const [friendInvites, setFriendInvites] = useState<FriendInvite[]>(DEFAULT_FRIEND_INVITES);
  const [activeViewerPersona, setActiveViewerPersona] = useState<string>("AC");
  const [connectedPeers, setConnectedPeers] = useState<Record<string, boolean>>({
    MS: true,
  });

  // Account Node Inbox State
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);

  // COMMUNITY & CHAT DATABASE STATE
  const [communities, setCommunities] = useState<CommunityItem[]>(DEFAULT_COMMUNITIES);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("g-01");
  const [communitySearch, setCommunitySearch] = useState<string>("");
  const [communityCategoryFilter, setCommunityCategoryFilter] = useState<string>("all");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dms: false,
    joined: false,
    created: false,
    suggested: false,
  });
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(DEFAULT_MESSAGES);
  const [newMessageText, setNewMessageText] = useState<string>("");
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState<boolean>(false);
  const [isCommunityDetailsOpen, setIsCommunityDetailsOpen] = useState<boolean>(false);
  const [isSubmittingCommunity, setIsSubmittingCommunity] = useState<boolean>(false);
  const [newCommunityForm, setNewCommunityForm] = useState({
    name: "",
    category: "AI & Machine Learning",
    desc: "",
    campus: "Global Syndicate • 120+ Nodes",
    icon: "memory",
  });

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const chatFileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<ChatAttachment | null>(null);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false);
  const [attachForm, setAttachForm] = useState({
    fileName: "",
    fileSize: "14.2 KB",
    fileType: "code" as "code" | "document" | "archive" | "diagram" | "other",
    projectId: "PRJ-082",
    projectTitle: "Synapse Core OS",
    projectAdmin: "Aarav Sharma",
    customNote: "",
  });

  useEffect(() => {
    // 1. Immediately restore user profile and auth session from localStorage
    try {
      const storedUser = localStorage.getItem("alcon_user_profile");
      const storedAuth = localStorage.getItem("alcon_is_logged_in");
      if (storedUser && storedAuth === "true") {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.name) {
          setCurrentUser(parsed);
          setIsLoggedIn(true);
          setProfileTab("profile");
          setJoinForm((prev) => ({
            ...prev,
            applicantName: parsed.name,
            applicantCampus: `${parsed.campusShort || parsed.campus} • ${(parsed.role || "student").toUpperCase()}`,
          }));
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("LocalStorage restore error:", err);
    }

    // 2. Sync user profile from server Database API
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user && data.user.name && data.isLoggedIn === true) {
          setCurrentUser(data.user);
          setIsLoggedIn(true);
          setProfileTab("profile");
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("alcon_user_profile", JSON.stringify(data.user));
              localStorage.setItem("alcon_is_logged_in", "true");
            } catch (e) { }
          }
          setJoinForm((prev) => ({
            ...prev,
            applicantName: data.user.name,
            applicantCampus: `${data.user.campusShort || data.user.campus} • ${(data.user.role || "student").toUpperCase()}`,
          }));
        } else if (data && data.isLoggedIn === false) {
          const localAuth = typeof window !== "undefined" ? localStorage.getItem("alcon_is_logged_in") : null;
          if (localAuth !== "true") {
            setIsLoggedIn(false);
          }
        }
      })
      .catch((err) => console.log("User API fetch fallback", err));

    // Sync communities from Database API
    fetch("/api/communities")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCommunities(data);
        }
      })
      .catch((err) => console.log("Using cached communities", err));

    // Sync chat messages from Database API
    fetch("/api/messages")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === "object") {
          setAllMessages((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.log("Using cached messages", err));

    // Sync projects from Database API
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch((err) => console.log("Using cached projects", err));

    // Sync project requests from Database API
    fetch("/api/projects/requests")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjectRequests(data);
        }
      })
      .catch((err) => console.log("Using cached project requests", err));

    // Sync campus classes from Database API
    fetch("/api/classes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setClassesList(data);
        }
      })
      .catch((err) => console.log("Using cached classes", err));

    // Sync faculty resources from Database API
    fetch("/api/resources")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setResourcesList(data);
        }
      })
      .catch((err) => console.log("Using cached resources", err));
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [allMessages, selectedCommunityId]);

  // Synchronize account-specific communications / inbox notifications
  useEffect(() => {
    if (currentUser && currentUser.name) {
      const accountItems = getAccountInboxNotifications(
        currentUser,
        friendInvites,
        projectRequests,
        projects
      );
      setInboxItems(accountItems);
    }
  }, [currentUser, friendInvites, projectRequests, projects]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() && !pendingAttachment) return;

    const attachmentToSend = pendingAttachment;
    const text = newMessageText.trim() || (attachmentToSend ? `Shared project contribution: ${attachmentToSend.name}` : "");
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const currentSender =
      activeViewerPersona === "AC" || activeViewerPersona === "AS"
        ? {
          id: currentUser.avatar || "AS",
          name: currentUser.name,
          campus: currentUser.campusShort || currentUser.campus,
          avatar: currentUser.avatar,
        }
        : peersList.find((p) => p.id === activeViewerPersona) || {
          id: activeViewerPersona,
          name: "Collegiate Builder",
          campus: "Campus Peer",
          avatar: activeViewerPersona,
        };

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentSender.name,
      avatar: currentSender.avatar,
      campus: currentSender.campus,
      text,
      time,
      isSelf: true,
      reactions: [],
      attachment: attachmentToSend || null,
      adminStarred: false,
    };

    // Optimistic UI update
    setAllMessages((prev) => ({
      ...prev,
      [selectedCommunityId]: [...(prev[selectedCommunityId] || []), newMsg],
    }));

    // Update community card preview
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === selectedCommunityId
          ? { ...c, lastMessage: text, lastMessageTime: "Just now" }
          : c
      )
    );

    setNewMessageText("");
    setPendingAttachment(null);

    // Persist to database API
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: selectedCommunityId,
          text,
          sender: currentSender.name,
          campus: currentSender.campus,
          avatar: currentSender.avatar,
          attachment: attachmentToSend || null,
        }),
      });
    } catch (err) {
      console.error("Failed to save message to database API:", err);
    }

    // Interactive reply simulation for personal DMs
    if (selectedCommunityId.startsWith("dm-")) {
      const recipientPeerId = selectedCommunityId.replace("dm-", "");
      const recipient = peersList.find((p) => p.id === recipientPeerId);
      if (recipient && recipient.id !== activeViewerPersona) {
        setTimeout(() => {
          const autoReplies: Record<string, string[]> = {
            MS: [
              "Awesome! I'm reviewing the KiCAD motor driver schematics now.",
              "Sounds good! Let's benchmark the high-side MOSFETs on the lab bench tomorrow.",
              "Got your message! Pushing the CAN-FD firmware update to the Synapse Core repo.",
            ],
            AL: [
              "Great point! I'll run this through our QEMU RISC-V test harness.",
              "Let's sync up on the kernel preemption logic after my CS systems lecture.",
              "Got it! Pulling your latest branch now to check deterministic scheduler telemetry.",
            ],
            ZT: [
              "Fascinating! Let's test that against our ChronoGraph Bio non-equilibrium folding cluster.",
              "Thanks for the update! I'll upload the latest antibody binding loss curves.",
              "Great suggestion! I'll add that to our PyTorch geometric GNN training loop.",
            ],
            RN: [
              "Verified! Generating the Circom and Halo2 constraint proof for that.",
              "Understood! Let's ensure the zero-knowledge attestations keep latency under 40ms.",
            ],
            ER: [
              "Good catch! Recalibrating visual-inertial odometry on the micro-swarm testbed.",
              "Sounds like a plan! Let's sync up during the robotics tunnel trials tomorrow.",
            ],
          };
          const pool = autoReplies[recipient.id] || [
            `Thanks for reaching out! Looking forward to collaborating on our research.`,
            `Sounds great! Let's connect on GitHub and push the updates.`,
            `Got your note! I'll check this and reply once I finish my lab run.`,
          ];
          const replyText = pool[Math.floor(Math.random() * pool.length)];
          const replyMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: recipient.name,
            avatar: recipient.avatar,
            campus: recipient.campus,
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isSelf: false,
            reactions: ["✨ 1"],
          };
          setAllMessages((prev) => ({
            ...prev,
            [selectedCommunityId]: [...(prev[selectedCommunityId] || []), replyMsg],
          }));
        }, 1200);
      }
    }
  };

  const openDirectMessageWithPeer = (peer: PeerItem) => {
    setConnectedPeers((prev) => ({
      ...prev,
      [peer.id]: true,
    }));
    setSelectedCommunityId(`dm-${peer.id}`);
    setActivePath("community");
    showToast(`Opening personal 1-on-1 direct message with ${peer.name}...`);
  };

  const handleDeleteMessage = async (
    communityId: string,
    messageId: string,
    isOthersMessage: boolean
  ) => {
    const confirmPrompt = isOthersMessage
      ? "Delete this member's message as community owner?"
      : "Are you sure you want to delete your message?";

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(confirmPrompt);
      if (!confirmed) return;
    }

    // Optimistically update allMessages state
    setAllMessages((prev) => {
      const updatedList = (prev[communityId] || []).filter((m) => m.id !== messageId);
      return {
        ...prev,
        [communityId]: updatedList,
      };
    });

    // Update community last message preview if needed
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === communityId) {
          const remaining = (allMessages[communityId] || []).filter((m) => m.id !== messageId);
          const lastMsg = remaining[remaining.length - 1];
          return {
            ...c,
            lastMessage: lastMsg ? lastMsg.text : "No messages yet",
            lastMessageTime: lastMsg ? lastMsg.time : "Active",
          };
        }
        return c;
      })
    );

    showToast(isOthersMessage ? "Member message deleted (Owner Moderation)" : "Your message was deleted");

    // Persist deletion to API
    try {
      await fetch(
        `/api/messages?communityId=${encodeURIComponent(communityId)}&messageId=${encodeURIComponent(messageId)}`,
        {
          method: "DELETE",
        }
      );
    } catch (err) {
      console.error("Failed to delete message via API:", err);
    }
  };

  const getProjectForChat = useCallback(
    (chatId: string) => {
      if (!projects || projects.length === 0) {
        return { id: "PRJ-082", title: "Synapse Core OS", author: "Aarav Sharma" };
      }

      // 1. Direct Messages (dm-ID)
      if (chatId.startsWith("dm-")) {
        const dmPeerId = chatId.replace("dm-", "");
        const peer =
          peersList.find((p) => p.id === dmPeerId) ||
          DEFAULT_PEERS.find((p) => p.id === dmPeerId);
        if (peer) {
          if (peer.activeProjects && peer.activeProjects.length > 0) {
            const matchByActive = projects.find((p) =>
              peer.activeProjects?.some(
                (ap) =>
                  ap.toLowerCase().includes(p.title.toLowerCase()) ||
                  p.title.toLowerCase().includes(ap.toLowerCase())
              )
            );
            if (matchByActive) return matchByActive;
          }

          const matchByAuthor = projects.find(
            (p) => p.author?.toLowerCase() === peer.name.toLowerCase()
          );
          if (matchByAuthor) return matchByAuthor;

          const matchByKeyword = projects.find((p) =>
            peer.skills?.some(
              (skill) =>
                p.title.toLowerCase().includes(skill.toLowerCase()) ||
                p.stack?.toLowerCase().includes(skill.toLowerCase())
            )
          );
          if (matchByKeyword) return matchByKeyword;
        }
      }

      // 2. Channel / Community Chats
      const comm = communities.find((c) => c.id === chatId);
      if (comm) {
        const matchByName = projects.find(
          (p) =>
            comm.name.toLowerCase().includes(p.title.toLowerCase()) ||
            p.title.toLowerCase().includes(comm.name.toLowerCase())
        );
        if (matchByName) return matchByName;

        const commText = `${comm.name} ${comm.desc || ""} ${comm.code || ""} ${comm.category || ""}`.toLowerCase();

        if (
          commText.includes("zero knowledge") ||
          commText.includes("crypto") ||
          commText.includes("zk") ||
          commText.includes("nova")
        ) {
          const zkPrj = projects.find(
            (p) => p.id === "PRJ-140" || p.title.toLowerCase().includes("zerogrid")
          );
          if (zkPrj) return zkPrj;
        }
        if (
          commText.includes("bio") ||
          commText.includes("protein") ||
          commText.includes("fold") ||
          commText.includes("molecular") ||
          commText.includes("crispr")
        ) {
          const bioPrj = projects.find(
            (p) => p.id === "PRJ-104" || p.title.toLowerCase().includes("chrono")
          );
          if (bioPrj) return bioPrj;
        }
        if (
          commText.includes("triton") ||
          commText.includes("gradient") ||
          commText.includes("distributed ai") ||
          commText.includes("inference")
        ) {
          const tritonPrj = projects.find(
            (p) => p.id === "PRJ-119" || p.title.toLowerCase().includes("vectortriton")
          );
          if (tritonPrj) return tritonPrj;
        }
        if (
          commText.includes("synapse") ||
          commText.includes("microkernel") ||
          commText.includes("npu") ||
          commText.includes("robotics") ||
          commText.includes("silicon")
        ) {
          const synPrj = projects.find(
            (p) => p.id === "PRJ-082" || p.title.toLowerCase().includes("synapse")
          );
          if (synPrj) return synPrj;
        }
      }

      // 3. Existing message attachments in this chat
      const chatMsgs = allMessages[chatId];
      if (chatMsgs && chatMsgs.length > 0) {
        const msgWithProject = chatMsgs
          .slice()
          .reverse()
          .find((m) => m.attachment?.projectId);
        if (msgWithProject?.attachment?.projectId) {
          const prj = projects.find((p) => p.id === msgWithProject.attachment?.projectId);
          if (prj) return prj;
        }
      }

      return projects[0];
    },
    [projects, peersList, communities, allMessages]
  );

  useEffect(() => {
    if (selectedCommunityId && projects.length > 0) {
      const autoPrj = getProjectForChat(selectedCommunityId);
      if (autoPrj) {
        setAttachForm((prev) => ({
          ...prev,
          projectId: autoPrj.id,
          projectTitle: autoPrj.title,
          projectAdmin: autoPrj.author || "Aarav Sharma",
        }));
      }
    }
  }, [selectedCommunityId, projects, getProjectForChat]);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
    if (file.size > 1024 * 1024) {
      sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let fileType: "code" | "document" | "archive" | "diagram" | "other" = "other";
    if (["py", "rs", "ts", "js", "cpp", "c", "h", "go", "java", "json", "yaml", "diff", "patch", "circom", "sol"].includes(ext)) {
      fileType = "code";
    } else if (["zip", "tar", "gz", "7z", "rar", "bin", "safetensors"].includes(ext)) {
      fileType = "archive";
    } else if (["pdf", "md", "txt", "doc", "docx", "csv"].includes(ext)) {
      fileType = "document";
    } else if (["png", "jpg", "jpeg", "svg", "sch", "kicad_pcb", "brd"].includes(ext)) {
      fileType = "diagram";
    }

    const currentPrj = getProjectForChat(selectedCommunityId);

    setAttachForm({
      fileName: file.name,
      fileSize: sizeStr,
      fileType,
      projectId: currentPrj.id,
      projectTitle: currentPrj.title,
      projectAdmin: currentPrj.author || "Aarav Sharma",
      customNote: "",
    });

    setIsAttachModalOpen(true);
    e.target.value = "";
  };

  const handleConfirmAttachContribution = () => {
    const selectedPrj = projects.find((p) => p.id === attachForm.projectId) || projects[0];
    const attachment: ChatAttachment = {
      name: attachForm.fileName || "project_contribution_artifact.zip",
      size: attachForm.fileSize || "14.2 KB",
      type: attachForm.fileType || "code",
      projectId: selectedPrj?.id || "PRJ-082",
      projectTitle: selectedPrj?.title || "Synapse Core OS",
      projectAdmin: selectedPrj?.author || "Aarav Sharma",
      isContribution: true,
    };

    setPendingAttachment(attachment);
    setIsAttachModalOpen(false);
    if (!newMessageText.trim()) {
      setNewMessageText(
        attachForm.customNote
          ? attachForm.customNote
          : `Sharing project contribution for ${attachment.projectTitle}: ${attachment.name}`
      );
    }
    showToast(`✓ Attached ${attachment.name} for ${attachment.projectTitle}. Ready to send!`);
  };

  const handleStarReaction = async (communityId: string, msg: ChatMessage) => {
    const projectAdminName =
      msg.attachment?.projectAdmin ||
      (msg.attachment?.projectId && projects.find((p) => p.id === msg.attachment?.projectId)?.author) ||
      (communities.find((c) => c.id === communityId)?.isCreatedByMe ? currentUser.name : "");

    const isProjectAdmin = Boolean(
      isLoggedIn &&
      projectAdminName &&
      (currentUser.name.toLowerCase().trim() === projectAdminName.toLowerCase().trim() ||
        (currentUser.role === "faculty" && projectAdminName.includes("Faculty")) ||
        (communities.find((c) => c.id === communityId)?.isCreatedByMe && currentUser.name))
    );

    if (isProjectAdmin) {
      if (msg.adminStarred) {
        showToast(`This project contribution has already been verified and starred with +${msg.karmaAwarded || 100} KP.`);
        return;
      }

      const reward = 100;

      setAllMessages((prev) => {
        const list = prev[communityId] || [];
        return {
          ...prev,
          [communityId]: list.map((m) => {
            if (m.id !== msg.id) return m;
            const rx = Array.isArray(m.reactions) ? [...m.reactions] : [];
            const starIdx = rx.findIndex((r) => r.startsWith("⭐"));
            if (starIdx >= 0) {
              const curCount = parseInt(rx[starIdx].replace(/[^0-9]/g, "") || "1", 10);
              rx[starIdx] = `⭐ ${curCount + 1}`;
            } else {
              rx.push("⭐ 1");
            }
            return {
              ...m,
              adminStarred: true,
              starredBy: currentUser.name,
              karmaAwarded: reward,
              reactions: rx,
            };
          }),
        };
      });

      // Award Karma to contributor if matching currentUser
      if (currentUser.name && msg.sender.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) {
        const curKpNum = parseKpNumber(currentUser.kp);
        const newKp = curKpNum + reward;
        const updated = {
          ...currentUser,
          kp: `${newKp.toLocaleString()} KP`,
        };
        setCurrentUser(updated);
        try {
          localStorage.setItem("alcon_user_profile", JSON.stringify(updated));
          if (updated.email) {
            const regRaw = localStorage.getItem("alcon_users_registry");
            const reg = regRaw ? JSON.parse(regRaw) : {};
            reg[updated.email.toLowerCase()] = updated;
            localStorage.setItem("alcon_users_registry", JSON.stringify(reg));
          }
        } catch (e) { }
      } else {
        // Update contributor in registry if present
        try {
          const regRaw = localStorage.getItem("alcon_users_registry");
          if (regRaw) {
            const reg = JSON.parse(regRaw);
            for (const em of Object.keys(reg)) {
              if (reg[em].name && reg[em].name.toLowerCase().trim() === msg.sender.toLowerCase().trim()) {
                const cur = parseKpNumber(reg[em].kp);
                reg[em].kp = `${(cur + reward).toLocaleString()} KP`;
              }
            }
            localStorage.setItem("alcon_users_registry", JSON.stringify(reg));
          }
        } catch (e) { }
      }

      // Persist star & karma to server API
      try {
        await fetch("/api/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            communityId,
            messageId: msg.id,
            action: "star_admin",
            adminName: currentUser.name,
            karmaAmount: reward,
          }),
        });
      } catch (err) {
        console.error("Failed to star message on server:", err);
      }

      showToast(`⭐ Project Admin Star verified! +${reward} KP awarded to ${msg.sender} for contribution to ${msg.attachment?.projectTitle || "this project"}!`);
    } else {
      // Non-admin regular star reaction
      setAllMessages((prev) => {
        const list = prev[communityId] || [];
        return {
          ...prev,
          [communityId]: list.map((m) => {
            if (m.id !== msg.id) return m;
            const rx = Array.isArray(m.reactions) ? [...m.reactions] : [];
            const starIdx = rx.findIndex((r) => r.startsWith("⭐"));
            if (starIdx >= 0) {
              const curCount = parseInt(rx[starIdx].replace(/[^0-9]/g, "") || "1", 10);
              rx[starIdx] = `⭐ ${curCount + 1}`;
            } else {
              rx.push("⭐ 1");
            }
            return { ...m, reactions: rx };
          }),
        };
      });

      try {
        await fetch("/api/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            communityId,
            messageId: msg.id,
            action: "react",
            emoji: "⭐",
          }),
        });
      } catch (e) { }

      showToast(`⭐ Reacted! (Note: Only verified stars from the Project Admin [${projectAdminName || "Project Lead"}] grant +100 KP contribution karma)`);
    }
  };

  const handleAddReaction = async (communityId: string, messageId: string, emoji: string) => {
    setAllMessages((prev) => {
      const list = prev[communityId] || [];
      return {
        ...prev,
        [communityId]: list.map((m) => {
          if (m.id !== messageId) return m;
          const rx = Array.isArray(m.reactions) ? [...m.reactions] : [];
          const idx = rx.findIndex((r) => r.startsWith(emoji));
          if (idx >= 0) {
            const count = parseInt(rx[idx].replace(/[^0-9]/g, "") || "1", 10);
            rx[idx] = `${emoji} ${count + 1}`;
          } else {
            rx.push(`${emoji} 1`);
          }
          return { ...m, reactions: rx };
        }),
      };
    });

    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          messageId,
          action: "react",
          emoji,
        }),
      });
    } catch (e) { }
    showToast(`Reacted with ${emoji}`);
  };

  const handleJoinCommunity = async (id: string, name: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: true, members: c.members + 1 } : c))
    );
    setSelectedCommunityId(id);
    showToast(`Joined ${name}! Welcome to the channel.`);

    try {
      await fetch("/api/communities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, joined: true }),
      });
    } catch (err) {
      console.error("Failed to persist join in database:", err);
    }
  };

  const handleLeaveCommunity = async (id: string, name: string) => {
    // Determine next community to select among remaining joined communities
    const remainingJoined = communities.filter((c) => c.joined && c.id !== id);
    if (remainingJoined.length > 0) {
      setSelectedCommunityId(remainingJoined[0].id);
    }

    setCommunities((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, joined: false, members: Math.max(0, c.members - 1) } : c
      )
    );

    setIsCommunityDetailsOpen(false);
    showToast(`Left ${name}. Community moved to suggestions.`);

    try {
      await fetch("/api/communities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, joined: false }),
      });
    } catch (err) {
      console.error("Failed to persist leave in database:", err);
    }
  };

  const handleDeleteCommunity = async (id: string, name: string) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete "${name}"?\n\nThis will remove the community and all of its chat history from the database.`
      );
      if (!confirmed) return;
    }

    // Determine next community to select among remaining joined communities
    const remainingJoined = communities.filter((c) => c.joined && c.id !== id);
    if (remainingJoined.length > 0) {
      setSelectedCommunityId(remainingJoined[0].id);
    } else {
      const remainingAny = communities.filter((c) => c.id !== id);
      if (remainingAny.length > 0) {
        setSelectedCommunityId(remainingAny[0].id);
      }
    }

    // Optimistically remove from state
    setCommunities((prev) => prev.filter((c) => c.id !== id));
    setAllMessages((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setIsCommunityDetailsOpen(false);
    showToast(`Deleted "${name}". Channel removed from database.`);

    try {
      await fetch(`/api/communities?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete community from database:", err);
    }
  };


  const handleCreateCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityForm.name.trim()) {
      showToast("Please enter a community name");
      return;
    }

    setIsSubmittingCommunity(true);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCommunityForm),
      });

      if (res.ok) {
        const createdCommunity: CommunityItem = await res.json();
        setCommunities((prev) => [createdCommunity, ...prev]);
        setSelectedCommunityId(createdCommunity.id);

        // Initialize welcome channel message
        const welcomeMsg: ChatMessage = {
          id: `welcome-${Date.now()}`,
          sender: "System Bot",
          avatar: "SY",
          campus: "ALCON Protocol",
          text: `Welcome to ${createdCommunity.name}! Community registered and stored into the network database. Start chatting below to invite fellow researchers.`,
          time: "Just now",
          isSelf: false,
          reactions: ["🎉 Early Builder"],
        };

        setAllMessages((prev) => ({
          ...prev,
          [createdCommunity.id]: [welcomeMsg],
        }));

        setIsCreateCommunityOpen(false);
        setNewCommunityForm({
          name: "",
          category: "AI & Machine Learning",
          desc: "",
          campus: "Global Syndicate • 120+ Nodes",
          icon: "memory",
        });
        showToast(`Community "${createdCommunity.name}" created and saved to database!`);
      } else {
        showToast("Failed to create community in database");
      }
    } catch (err) {
      console.error("Create community error:", err);
      showToast("Error creating community in database");
    } finally {
      setIsSubmittingCommunity(false);
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.title.trim()) {
      showToast("Please enter a project title");
      return;
    }
    if (!newProjectForm.detailDescription.trim()) {
      showToast("Please enter a detailed description of the project");
      return;
    }
    if (!newProjectForm.requirements.trim()) {
      showToast("Please specify the requirements of the project");
      return;
    }

    if (newProjectForm.needsInvestment) {
      const expNum = Number(String(newProjectForm.expectedInvestment || newProjectForm.investmentGoal || "").replace(/[^0-9.]/g, "")) || 0;
      if (expNum <= 0) {
        showToast("Please enter the expected investment amount (e.g. 50000) for this project.");
        return;
      }
    }

    setIsSubmittingProject(true);
    try {
      const expNum = Number(String(newProjectForm.expectedInvestment || newProjectForm.investmentGoal || "").replace(/[^0-9.]/g, "")) || 0;
      const payload = {
        ...newProjectForm,
        expectedInvestment: expNum,
        investmentGoal: expNum > 0 ? `₹${expNum.toLocaleString('en-IN')}` : newProjectForm.investmentGoal,
        author: currentUser.name || "Collegiate Creator",
        authorCampus: currentUser.campusShort || currentUser.campus || "Verified Member",
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created: ProjectItem = await res.json();
        setProjects((prev) => [created, ...prev]);
        setIsCreateProjectOpen(false);
        setNewProjectForm({
          title: "",
          campuses: "SYSTEMS + NEURAL NPU",
          tag: "ALPHA 0.1",
          filterKey: "alpha",
          detailDescription: "",
          requirements: "",
          stack: "Rust • WebAssembly • Next.js",
          needsInvestment: false,
          expectedInvestment: "",
          investmentGoal: "",
        });
        showToast(`Project "${created.title}" published with expected investment of ${created.investmentGoal || `₹${created.expectedInvestment?.toLocaleString('en-IN')}`}!`);
      } else {
        showToast("Failed to save project to database");
      }
    } catch (err) {
      console.error("Create project error:", err);
      showToast("Error creating project in database");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Are you sure you want to permanently delete project "${title}"?\n\nThis will remove it from the syndicate directory.`
      );
      if (!confirmed) return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast(`Project "${title}" deleted`);

    try {
      await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleDownloadAttachment = (attachment: ChatAttachment) => {
    try {
      const fileName = attachment.name || "artifact.txt";
      const ext = fileName.split(".").pop()?.toLowerCase() || "txt";
      let mimeType = "text/plain";
      let content = "";

      if (ext === "py") {
        mimeType = "text/x-python";
        content = `"""
ALCON Syndicate Contribution Artifact
File: ${fileName}
Project: ${attachment.projectTitle} (ID: ${attachment.projectId})
Lead / Admin: ${attachment.projectAdmin || "Aarav Sharma"}
Timestamp: ${new Date().toLocaleString("en-IN")}
Verified Node: ALCON-DELHI-CORE
"""

import sys
import os

def init_node():
    print("[ALCON] Loading artifact: ${fileName}")
    print("[ALCON] Project: ${attachment.projectTitle}")
    print("[ALCON] Status: Verified by Project Lead (${attachment.projectAdmin || "Aarav Sharma"})")

class ${fileName.replace(/[^a-zA-Z0-9]/g, "_")}:
    def __init__(self):
        self.project_id = "${attachment.projectId}"
        self.title = "${attachment.projectTitle}"
        self.verified = True

    def execute(self):
        print(f"Running verified kernel for {self.title}...")
        return {"status": "success", "artifact": "${fileName}"}

if __name__ == "__main__":
    init_node()
    runner = ${fileName.replace(/[^a-zA-Z0-9]/g, "_")}()
    runner.execute()
`;
      } else if (ext === "rs") {
        mimeType = "text/rust";
        content = `// ALCON Syndicate Contribution Artifact: ${fileName}
// Project: ${attachment.projectTitle} (${attachment.projectId})
// Lead: ${attachment.projectAdmin || "Aarav Sharma"}

pub struct ProjectArtifact {
    pub name: &'static str,
    pub project: &'static str,
    pub verified: bool,
}

impl ProjectArtifact {
    pub fn new() -> Self {
        Self {
            name: "${fileName}",
            project: "${attachment.projectTitle}",
            verified: true,
        }
    }
}
`;
      } else if (ext === "json") {
        mimeType = "application/json";
        content = JSON.stringify(
          {
            artifactName: fileName,
            projectId: attachment.projectId,
            projectTitle: attachment.projectTitle,
            projectAdmin: attachment.projectAdmin,
            fileType: attachment.type,
            size: attachment.size,
            downloadedAt: new Date().toISOString(),
            status: "Verified Collegiate Artifact",
          },
          null,
          2
        );
      } else {
        mimeType = "text/markdown";
        content = `# ${fileName}

**Project:** ${attachment.projectTitle} (${attachment.projectId})
**Author / Admin:** ${attachment.projectAdmin || "Aarav Sharma"}
**Artifact Type:** ${attachment.type}
**Verified File Size:** ${attachment.size}
**Exported From:** ALCON Inter-Collegiate Syndicate Network

---

### Artifact Overview
This file was contributed and shared on the ALCON research network for **${attachment.projectTitle}**.

\`\`\`
Node Attestation: Verified [0x7f4a...e12d]
Network: Delhi Collegiate Syndicate Hub
Campus Affiliation: NSUT • DTU • IIITD • IITD • IGDTU • DESU
\`\`\`
`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`✓ Downloaded file: ${fileName} (${attachment.size})`);
    } catch (err) {
      console.error("Failed to download attachment:", err);
      showToast(`Error downloading ${attachment.name}`);
    }
  };

  const handleDownloadProject = (target: ProjectItem | string | null | undefined) => {
    if (!target) return;
    try {
      const project: ProjectItem =
        typeof target === "string"
          ? projects.find((p) => p.id === target || p.title.toLowerCase() === target.toLowerCase()) || {
            id: "PRJ-082",
            title: target,
            desc: "Distributed systems and collegiate venture on the ALCON network.",
            author: "Aarav Sharma",
            authorCampus: "NSUT '26",
            campuses: "SYSTEMS + NEURAL NPU",
            stack: "Rust • WebAssembly • Next.js",
            investmentGoal: "₹25,00,000 Micro-Seed",
            expectedInvestment: 2500000,
            detailDescription: "Distributed microkernel operating system and high-throughput communication primitives.",
            requirements: "Rust, Systems Programming, Microkernels",
            tag: "ALPHA 0.1",
            filterKey: "alpha",
          }
          : target;

      const slug = (project.title || "project").toLowerCase().replace(/[^a-z0-9]/g, "_");
      const fileName = `${slug}_project_dossier.md`;

      const markdownContent = `# ${project.title}
**Project ID:** ${project.id}  
**Lead Architect:** ${project.author || "Collegiate Creator"} (${project.authorCampus || "Delhi Innovation Hub"})  
**Status Tag:** ${project.tag || "ALPHA"}  
**Target Institutes:** ${project.campuses || "NSUT • DTU • IIITD • IITD • IGDTU • DESU"}  
**Tech Stack:** ${project.stack || "General Tech Stack"}  
**Investment Target:** ${project.investmentGoal || (project.expectedInvestment ? `₹${Number(project.expectedInvestment).toLocaleString('en-IN')}` : "₹25,00,000")}  
**Export Date:** ${new Date().toLocaleString("en-IN")}  

---

## 1. Project Overview & Architecture
${project.detailDescription || project.desc || "Collegiate research and venture initiative on the ALCON network."}

## 2. Technical Stack & Primitives
- **Core Technologies:** ${project.stack || "Rust, WebAssembly, TypeScript, Distributed Nodes"}
- **Cluster Deployment:** 4x A100 / Edge Nodes
- **Verification Level:** Cryptographically Attested Collegiate SAFE

## 3. Contributor Requirements & Milestones
${project.requirements || "Open to systems programmers, ML researchers, and collegiate contributors from NSUT, DTU, IIITD, IITD, IGDTU, and DESU."}

---
*Exported from ALCON Inter-Collegiate Syndicate Network*
`;

      const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`✓ Downloaded project dossier: ${project.title}`);
    } catch (err) {
      console.error("Failed to download project:", err);
      showToast(`Error downloading project`);
    }
  };

  const handleJoinProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingProject) return;

    if (!joinForm.applicantName.trim()) {
      showToast("Please enter your name");
      return;
    }
    if (!joinForm.bio.trim()) {
      showToast("Please provide your student biodata and background");
      return;
    }
    if (!joinForm.github.trim()) {
      showToast("Please provide your GitHub profile link");
      return;
    }
    if (!joinForm.linkedin.trim()) {
      showToast("Please provide your LinkedIn profile link");
      return;
    }

    setIsSubmittingJoinRequest(true);
    try {
      const payload = {
        projectId: applyingProject.id,
        projectTitle: applyingProject.title,
        applicantName: joinForm.applicantName,
        applicantCampus: joinForm.applicantCampus,
        applicantAvatar: joinForm.applicantName.slice(0, 2).toUpperCase(),
        role: joinForm.role || "Co-Founder / Contributor",
        bio: joinForm.bio,
        github: joinForm.github,
        linkedin: joinForm.linkedin,
      };

      const res = await fetch("/api/projects/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdReq: ProjectJoinRequest = await res.json();
        setProjectRequests((prev) => [createdReq, ...prev]);

        // Award +500 KP Contribution Karma for contributing/applying to project
        const currentKpNum = parseKpNumber(currentUser.kp);
        const newKpTotal = currentKpNum + 500;
        const updatedUser: UserProfileState = {
          ...currentUser,
          kp: `${newKpTotal.toLocaleString()} KP`,
        };
        setCurrentUser(updatedUser);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("alcon_user_profile", JSON.stringify(updatedUser));
            localStorage.setItem("alcon_is_logged_in", "true");
            if (updatedUser.email) {
              const regRaw = localStorage.getItem("alcon_users_registry");
              const reg = regRaw ? JSON.parse(regRaw) : {};
              reg[updatedUser.email.toLowerCase()] = updatedUser;
              localStorage.setItem("alcon_users_registry", JSON.stringify(reg));
            }
          } catch (e) { }
        }
        try {
          await fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: updatedUser, isLoggedIn: true }),
          });
        } catch (e) { }

        showToast(
          `✓ Application submitted for ${applyingProject.title}! Earned +500 KP Contribution Karma.`
        );
        setApplyingProject(null);
        setJoinForm({
          applicantName: currentUser.name,
          applicantCampus: `${currentUser.campusShort || currentUser.campus} • ${currentUser.role.toUpperCase()}`,
          role: "Core Contributor / Systems Engineer",
          bio: "",
          github: "https://github.com/aaravsharma",
          linkedin: "https://linkedin.com/in/aarav-sharma-ai",
        });
      } else {
        showToast("Failed to submit application");
      }
    } catch (err) {
      console.error("Error submitting join request:", err);
      showToast("Error submitting application");
    } finally {
      setIsSubmittingJoinRequest(false);
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    setProjectRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
    showToast(
      status === "accepted"
        ? "Applicant accepted into venture team!"
        : "Applicant request declined"
    );

    try {
      await fetch("/api/projects/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status }),
      });
    } catch (err) {
      console.error("Error updating request status:", err);
    }
  };

  const handlePledgeInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investingProject) return;

    if (!isLoggedIn) {
      showToast("Please sign in or register an ALCON Passport to invest in projects.");
      setActivePath("profile");
      setProfileTab("signin");
      return;
    }

    const pledgeNum = Number(investPledgeAmount) || 0;
    if (pledgeNum <= 0) {
      showToast("Please enter a valid investment pledge amount (minimum ₹5,000)");
      return;
    }

    const targetGoal =
      investingProject.expectedInvestment ||
      parseInvestmentAmount(investingProject.investmentGoal) ||
      2500000;

    const percentageInvested = targetGoal > 0 ? (pledgeNum / targetGoal) * 100 : 0;
    // User earns 0.001 * percentage invested share
    const sharePercentage = Number((0.001 * percentageInvested).toFixed(4));
    // User earns karma from investing (1 KP per ₹100 invested)
    const karmaEarned = Math.max(50, Math.round(pledgeNum / 100));

    const newShare: ProjectShare = {
      id: `share-${Date.now()}`,
      projectId: investingProject.id,
      projectTitle: investingProject.title,
      amountInvested: pledgeNum,
      expectedInvestment: targetGoal,
      percentageInvested: Number(percentageInvested.toFixed(2)),
      sharePercentage: sharePercentage,
      karmaEarned: karmaEarned,
      investedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const currentKpNum = parseKpNumber(currentUser.kp);
    const newKpTotal = currentKpNum + karmaEarned;
    const newKpFormatted = `${newKpTotal.toLocaleString()} KP`;

    const existingShares = currentUser.sharesOwned || [];
    const updatedShares = [newShare, ...existingShares];

    const updatedUser: UserProfileState = {
      ...currentUser,
      kp: newKpFormatted,
      sharesOwned: updatedShares,
    };

    setCurrentUser(updatedUser);
    setInvestingProject(null);

    // Record Karma Earned notification in Inbox for the investor
    const karmaNotif: InboxItem = {
      id: `karma-${Date.now()}`,
      type: "karma_earned",
      title: `+${karmaEarned.toLocaleString()} KP Earned`,
      subtitle: `Venture Syndicate Investment in ${investingProject.title}`,
      timestamp: "Just now",
      read: false,
      karmaPoints: karmaEarned,
      karmaSource: `Syndicate Equity Pledge • ${investingProject.title}`,
      karmaDetail: `Acquired ${sharePercentage}% syndicate equity for ₹${pledgeNum.toLocaleString("en-IN")}. Reputation protocol accrued.`,
    };

    // Record Fund Received notification for the project's founder/author
    const fundNotif: InboxItem = {
      id: `fund-${Date.now()}`,
      type: "fund_received",
      title: `₹${pledgeNum.toLocaleString("en-IN")} Received for ${investingProject.title}`,
      subtitle: `Syndicate Equity Pledge from ${currentUser.name}`,
      timestamp: "Just now",
      read: false,
      fundAmount: pledgeNum,
      fundProjectTitle: investingProject.title,
      fundFunderName: `${currentUser.name} (${currentUser.campusShort || currentUser.campus})`,
      fundType: "Syndicate Equity Round",
      fundEscrowStatus: "Escrow Deposited to Project Vault",
    };

    setInboxItems((prev) => {
      const next = [karmaNotif];
      if (investingProject.author?.toLowerCase() === currentUser.name.toLowerCase()) {
        next.push(fundNotif);
      }
      const combined = [...next, ...prev];
      saveUserInboxItems(currentUser.name, combined);
      return combined;
    });

    if (investingProject.author && investingProject.author.toLowerCase() !== currentUser.name.toLowerCase()) {
      const authorItems = loadUserInboxItems(investingProject.author) || [];
      saveUserInboxItems(investingProject.author, [fundNotif, ...authorItems]);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alcon_user_profile", JSON.stringify(updatedUser));
        localStorage.setItem("alcon_is_logged_in", "true");
        if (updatedUser.email) {
          const regRaw = localStorage.getItem("alcon_users_registry");
          const reg = regRaw ? JSON.parse(regRaw) : {};
          reg[updatedUser.email.toLowerCase()] = updatedUser;
          localStorage.setItem("alcon_users_registry", JSON.stringify(reg));
        }
      } catch (err) {
        console.error("Failed to save investment to localStorage", err);
      }
    }

    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: updatedUser, isLoggedIn: true }),
      });
    } catch (err) {
      console.log("User investment persistence fallback", err);
    }

    showToast(
      `✓ Pledged ₹${pledgeNum.toLocaleString('en-IN')} in ${investingProject.title}! Earned +${karmaEarned.toLocaleString()} KP & ${sharePercentage.toFixed(4)}% Share reflected under Shares Owned in Profile.`
    );
  };


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleConnectPeer = (id: string, name: string) => {
    setConnectedPeers((prev) => {
      const next = !prev[id];
      showToast(next ? `Connected with ${name}!` : `Disconnected from ${name}`);
      return { ...prev, [id]: next };
    });
  };

  const handleSendInvite = (recipient: PeerItem) => {
    const alreadySent = friendInvites.some(
      (inv) =>
        inv.senderId === activeViewerPersona &&
        inv.recipientId === recipient.id &&
        inv.status === "pending"
    );
    if (alreadySent) {
      showToast(`Invite already pending for ${recipient.name}`);
      return;
    }

    const currentSender =
      activeViewerPersona === "AC" || activeViewerPersona === "AS"
        ? {
          id: currentUser.avatar || "AS",
          name: currentUser.name,
          campus: currentUser.campusShort || currentUser.campus,
          avatar: currentUser.avatar,
          headline: currentUser.headline,
        }
        : peersList.find((p) => p.id === activeViewerPersona) || {
          id: activeViewerPersona,
          name: "Collegiate Builder",
          campus: "Campus Peer",
          avatar: activeViewerPersona,
          headline: "Researcher",
        };

    const newInvite: FriendInvite = {
      id: `inv-${Date.now()}`,
      senderId: currentSender.id,
      senderName: currentSender.name,
      senderCampus: currentSender.campus,
      senderAvatar: currentSender.avatar,
      senderHeadline: currentSender.headline,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientCampus: recipient.campus,
      status: "pending",
      createdAt: "Just now",
      message: `Hi ${recipient.name}! I would like to connect on the ALCON Network.`,
    };

    setFriendInvites((prev) => [newInvite, ...prev]);
    showToast(`Invite dispatched to ${recipient.name}! They will receive it in their Incoming Invites tray.`);
  };

  const handleAcceptInvite = (inviteId: string) => {
    const invite = friendInvites.find((i) => i.id === inviteId);
    if (!invite) return;

    setFriendInvites((prev) =>
      prev.map((i) => (i.id === inviteId ? { ...i, status: "accepted" as const } : i))
    );

    setConnectedPeers((prev) => ({
      ...prev,
      [invite.senderId]: true,
      [invite.recipientId]: true,
    }));

    showToast(`Invitation accepted! You and ${invite.senderName} are now connected peers.`);
  };

  const handleDeclineInvite = (inviteId: string) => {
    const invite = friendInvites.find((i) => i.id === inviteId);
    setFriendInvites((prev) =>
      prev.map((i) => (i.id === inviteId ? { ...i, status: "declined" as const } : i))
    );
    showToast(`Invitation from ${invite?.senderName || "peer"} declined.`);
  };

  // Node Inbox notification interactive action handlers
  const handleAcceptInboxFriend = (inviteId: string, itemId: string) => {
    handleAcceptInvite(inviteId);
    setInboxItems((prev) => {
      const next = prev.map((item) =>
        item.id === itemId || item.friendInviteId === inviteId
          ? { ...item, friendStatus: "accepted" as const, read: true }
          : item
      );
      saveUserInboxItems(currentUser.name, next);
      return next;
    });
  };

  const handleDeclineInboxFriend = (inviteId: string, itemId: string) => {
    handleDeclineInvite(inviteId);
    setInboxItems((prev) => {
      const next = prev.map((item) =>
        item.id === itemId || item.friendInviteId === inviteId
          ? { ...item, friendStatus: "declined" as const, read: true }
          : item
      );
      saveUserInboxItems(currentUser.name, next);
      return next;
    });
  };

  const handleAcceptInboxEnrollment = (requestId: string, itemId: string) => {
    handleUpdateRequestStatus(requestId, "accepted");
    setInboxItems((prev) => {
      const next = prev.map((item) =>
        item.id === itemId || item.projectRequestId === requestId
          ? { ...item, enrollmentStatus: "accepted" as const, read: true }
          : item
      );
      saveUserInboxItems(currentUser.name, next);
      return next;
    });
  };

  const handleDeclineInboxEnrollment = (requestId: string, itemId: string) => {
    handleUpdateRequestStatus(requestId, "declined");
    setInboxItems((prev) => {
      const next = prev.map((item) =>
        item.id === itemId || item.projectRequestId === requestId
          ? { ...item, enrollmentStatus: "declined" as const, read: true }
          : item
      );
      saveUserInboxItems(currentUser.name, next);
      return next;
    });
  };

  const handleMarkAllInboxRead = () => {
    setInboxItems((prev) => {
      const next = prev.map((item) => ({ ...item, read: true }));
      saveUserInboxItems(currentUser.name, next);
      return next;
    });
    showToast("All inbox updates marked as read");
  };

  const handleBookSlot = (name: string) => {
    setBookedMentor(name);
    showToast(`Office hours confirmed with ${name} (25 min slot booked)`);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassForm.title.trim()) {
      showToast("Please provide a class title.");
      return;
    }
    setIsSubmittingClass(true);

    const initials = (currentUser.name || "Host")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CL";

    const classPayload: CampusClass = {
      id: `cls-${Date.now()}`,
      title: newClassForm.title.trim(),
      instructorName: currentUser.name,
      instructorRole: currentUser.role === "faculty" ? "faculty" : "alumni",
      instructorAvatar: currentUser.avatar || initials,
      instructorTitle: currentUser.degreeOrTitle || (currentUser.role === "faculty" ? "Faculty PI & Professor" : "Alumni Angel Mentor"),
      campus: currentUser.campus,
      departmentOrLab: currentUser.departmentOrLab || `${currentUser.campus} Academic Chapter`,
      category: newClassForm.category,
      schedule: newClassForm.schedule.trim() || "Thursdays • 4:00 PM PST",
      location: newClassForm.location.trim() || `${currentUser.campus} Virtual Lab Node`,
      description: newClassForm.description.trim() || "Masterclass and interactive seminar hosted on ALCON.",
      enrolledCount: 1,
      capacity: parseInt(newClassForm.capacity) || 50,
      tags: newClassForm.tags.split("•").map((t) => t.trim()).filter(Boolean),
      createdAt: "Cycle S26",
    };

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classPayload),
      });
      if (res.ok) {
        const saved = await res.json();
        setClassesList((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
      } else {
        setClassesList((prev) => [classPayload, ...prev]);
      }
    } catch (err) {
      console.log("Local fallback for class creation", err);
      setClassesList((prev) => [classPayload, ...prev]);
    }

    setJoinedClasses((prev) => ({ ...prev, [classPayload.id]: true }));
    setIsCreateClassOpen(false);
    setIsSubmittingClass(false);
    setNewClassForm({
      title: "",
      category: "Distributed Systems & AI",
      schedule: "Thursdays • 4:00 PM PST",
      location: "Live ALCON Stream Node #04 • Virtual Room",
      description: "",
      capacity: "50",
      tags: "GPU • Triton • CUDA • Distributed",
    });
    showToast(`✓ Class "${classPayload.title}" published! Available across all research nodes.`);
  };

  const handleCreateResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceForm.title.trim()) {
      showToast("Please provide a title for the resource opening.");
      return;
    }
    setIsSubmittingResource(true);

    const facultyLeadName = currentUser.name || "Prof. Faculty Fellow";
    const facultyCampus = currentUser.campus || currentUser.departmentOrLab || "Global Research Node";
    const facultyEmail =
      currentUser.email ||
      getFacultyEmail({ facultyLead: facultyLeadName, campus: facultyCampus });
    const branchObj = BRANCH_FILTERS.find((b) => b.id === newResourceForm.branch) || BRANCH_FILTERS[1];

    const iconGlass =
      branchObj.color === "emerald"
        ? "apple-liquid-glass-emerald"
        : branchObj.color === "rose"
          ? "apple-liquid-glass-rose"
          : branchObj.color === "secondary"
            ? "apple-liquid-glass-secondary"
            : "apple-liquid-glass-primary";

    const payload = {
      title: newResourceForm.title.trim(),
      facultyLead: facultyLeadName,
      facultyEmail,
      campus: facultyCampus,
      branch: newResourceForm.branch,
      branchLabel: branchObj.label,
      category: newResourceForm.category.trim() || "LAB ALLOCATION",
      icon: newResourceForm.icon || branchObj.icon,
      desc: newResourceForm.desc.trim() || "Direct access to laboratory hardware, benches, and faculty mentoring.",
      allocation: newResourceForm.allocation.trim() || "15 test hours/week with lab technician support",
      eligibility: newResourceForm.eligibility.trim() || "Open to all enrolled collegiate researchers",
      status: newResourceForm.status.trim().toUpperCase() || "BENCHES OPEN",
    };

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setResourcesList((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
        showToast(`✓ Resource "${saved.title}" published! Visible under ${branchObj.label}.`);
      } else {
        const fallbackRes: FacultyResource = {
          id: `FAC-RES-${Date.now().toString().slice(-4)}`,
          ...payload,
          facultyEmail,
          iconGlass,
          statusColor: branchObj.color,
          createdAt: new Date().toISOString(),
        };
        setResourcesList((prev) => [fallbackRes, ...prev]);
        showToast(`✓ Resource "${payload.title}" published locally!`);
      }
    } catch (err) {
      console.log("Local fallback for resource creation", err);
      const fallbackRes: FacultyResource = {
        id: `FAC-RES-${Date.now().toString().slice(-4)}`,
        ...payload,
        facultyEmail,
        iconGlass,
        statusColor: branchObj.color,
        createdAt: new Date().toISOString(),
      };
      setResourcesList((prev) => [fallbackRes, ...prev]);
      showToast(`✓ Resource "${payload.title}" published locally!`);
    }

    setResourceBranch(newResourceForm.branch);
    setIsCreateResourceOpen(false);
    setIsSubmittingResource(false);
    setNewResourceForm({
      title: "",
      branch: "electrical",
      category: "LAB ALLOCATION",
      desc: "",
      allocation: "15 test hours/week with lab technician support",
      eligibility: "Open to student project teams & research fellows",
      status: "BENCHES OPEN",
      icon: "electrical_services",
    });
  };

  const handleToggleJoinClass = async (cls: CampusClass) => {
    if (!isLoggedIn) {
      showToast("Please sign in with your ALCON passport to join this class.");
      setActivePath("profile");
      setProfileTab("signin");
      return;
    }

    const isEnrolled = !!joinedClasses[cls.id];
    const willEnroll = !isEnrolled;

    setJoinedClasses((prev) => ({ ...prev, [cls.id]: willEnroll }));
    setClassesList((current) =>
      current.map((c) =>
        c.id === cls.id
          ? { ...c, enrolledCount: willEnroll ? Math.min(c.capacity, c.enrolledCount + 1) : Math.max(0, c.enrolledCount - 1) }
          : c
      )
    );

    try {
      await fetch("/api/classes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: cls.id, action: willEnroll ? "join" : "leave" }),
      });
    } catch (err) {
      console.log("Using cached enrollment state", err);
    }

    showToast(
      willEnroll
        ? `✓ Enrolled in "${cls.title}"! Cryptographic room pass generated.`
        : `Unenrolled from "${cls.title}".`
    );
  };

  const handleLogin = async (e?: React.FormEvent, role?: AccountRole, nodeName?: string, overrideEmail?: string) => {
    if (e) e.preventDefault();
    const targetRole = role || signinRole;
    const emailToUse = (overrideEmail || signinEmail || "").trim().toLowerCase();

    // Check if user has an existing registered profile under this email
    let existingProfile: UserProfileState | null = null;
    if (typeof window !== "undefined") {
      try {
        const regRaw = localStorage.getItem("alcon_users_registry");
        if (regRaw) {
          const reg = JSON.parse(regRaw);
          if (emailToUse && reg[emailToUse]) {
            existingProfile = reg[emailToUse];
          }
        }
      } catch (err) { }
    }

    // Try server registry lookup if not in localStorage
    if (!existingProfile && emailToUse) {
      try {
        const serverLookup = await fetch(`/api/user?email=${encodeURIComponent(emailToUse)}`);
        if (serverLookup.ok) {
          const resJson = await serverLookup.json();
          if (resJson && resJson.user) {
            existingProfile = resJson.user;
          }
        }
      } catch (err) { }
    }

    const base = existingProfile || DEFAULT_USER_PROFILES[targetRole];
    const updated = { ...base };
    if (!existingProfile) {
      if (nodeName) {
        updated.campus = nodeName;
        updated.campusShort = `${targetRole === "faculty" ? "Faculty Fellow" : targetRole === "alumni" ? "Alumni Fellow" : "Fellow '26"}`;
        updated.email = `${targetRole === "faculty" ? "prof.vance" : targetRole === "alumni" ? "marcus.thorne" : "ariachen"}@alcon.network`;
        updated.departmentOrLab = `${targetRole === "faculty" ? "Autonomous Systems Laboratory" : targetRole === "alumni" ? "Frontier Syndicate Node" : "Autonomous Intelligence Systems Laboratory"}`;
      } else if (emailToUse) {
        updated.email = emailToUse;
      }
    }

    setCurrentUser(updated);
    setIsLoggedIn(true);
    setProfileTab("profile");

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alcon_user_profile", JSON.stringify(updated));
        localStorage.setItem("alcon_is_logged_in", "true");
        if (updated.email) {
          const regRaw = localStorage.getItem("alcon_users_registry");
          const reg = regRaw ? JSON.parse(regRaw) : {};
          reg[updated.email.toLowerCase()] = updated;
          localStorage.setItem("alcon_users_registry", JSON.stringify(reg));
        }
      } catch (err) {
        console.error("Failed to save profile to localStorage", err);
      }
    }

    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: updated, isLoggedIn: true }),
      });
    } catch (err) {
      console.log("User persistence fallback", err);
    }

    setJoinForm((prev) => ({
      ...prev,
      applicantName: updated.name,
      applicantCampus: `${updated.campusShort || updated.campus} • ${updated.role.toUpperCase()}`,
    }));

    showToast(`Signed in as Verified ${updated.campusShort} (${updated.role.toUpperCase()})`);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = signupName.trim();
    const initials = (cleanName || "ALCON User")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AL";

    const cleanEmail = signupEmail.trim().toLowerCase() || `${initials.toLowerCase()}@alcon.network`;

    const newProfile: UserProfileState = {
      role: signupRole,
      name: cleanName || (signupRole === "faculty" ? "Prof. Faculty Member" : signupRole === "alumni" ? "Alumni Fellow" : "Research Fellow"),
      avatar: initials,
      campus: signupCampus || "Global Innovation Node",
      campusShort: `${signupRole === "faculty" ? "Faculty Fellow" : signupRole === "alumni" ? "Alumni Fellow" : signupClassYear || "Fellow '26"}`,
      email: cleanEmail,
      headline: signupRole === "faculty"
        ? `${signupTitle || "Professor"} • ${signupDept || "Research Group PI"}`
        : signupRole === "alumni"
          ? `${signupClassYear || "Alumni Fellow"} • ${signupTitle || "Industry Fellow & Syndicate Mentor"}`
          : `${signupMajor || "B.S. Candidate"} • Research Fellow`,
      degreeOrTitle: signupTitle || (signupRole === "faculty" ? "Faculty Advisor & PI" : signupRole === "alumni" ? "Alumni Fellow" : signupMajor || "Undergraduate Candidate"),
      departmentOrLab: signupDept || (signupRole === "faculty" ? "Advanced Research Group" : signupRole === "alumni" ? "Founders Syndicate" : "Autonomous Intelligence Systems Laboratory"),
      classYearOrRank: signupRole === "faculty" ? (signupTitle || "Faculty PI") : (signupClassYear || (signupRole === "alumni" ? "Alumni Fellow" : "Class of 2026")),
      kp: "0 KP", // Initial karma points strictly 0 for first signups
      sharesOwned: [],
      nodeId: signupRole === "faculty" ? `#FAC-${Math.floor(1000 + Math.random() * 9000)}` : signupRole === "alumni" ? `#ALUM-${Math.floor(1000 + Math.random() * 9000)}` : `#STU-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setCurrentUser(newProfile);
    setIsLoggedIn(true);
    setProfileTab("profile");

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alcon_user_profile", JSON.stringify(newProfile));
        localStorage.setItem("alcon_is_logged_in", "true");
        const regRaw = localStorage.getItem("alcon_users_registry");
        const reg = regRaw ? JSON.parse(regRaw) : {};
        reg[cleanEmail] = newProfile;
        localStorage.setItem("alcon_users_registry", JSON.stringify(reg));
      } catch (err) {
        console.error("Failed to save profile to localStorage", err);
      }
    }

    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: newProfile, isLoggedIn: true }),
      });
    } catch (err) {
      console.log("User persistence fallback", err);
    }

    setJoinForm((prev) => ({
      ...prev,
      applicantName: newProfile.name,
      applicantCampus: `${newProfile.campusShort || newProfile.campus} • ${newProfile.role.toUpperCase()}`,
    }));

    showToast(`Passport Registered & Verified as ${signupRole.toUpperCase()} (0 KP) • Welcome ${newProfile.name}!`);
  };

  const handleSignOut = async () => {
    setIsLoggedIn(false);
    setProfileTab("signin");
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alcon_is_logged_in", "false");
      } catch (err) {
        console.error("Failed to save signout state", err);
      }
    }
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLoggedIn: false }),
      });
    } catch (err) {
      console.log("Signout API fallback", err);
    }
    showToast("Signed out of ALCON Passport");
  };

  const renderViewContent = (viewPath: ViewPath) => {
    return (
      <>
        {/* VIEW 1: HOME (LMAO FLOATING ISLAND DIORAMA) */}
        {viewPath === "home" && (
          <div className="flex flex-col w-full h-[100vh] animate-in fade-in duration-500 overflow-hidden relative">
            <IslandHomepage onNavigate={(targetView) => setActivePath(targetView)} />
          </div>
        )}

        {/* VIEW 2: LEADERBOARD */}
        {viewPath === "leaderboard" && (
          <div className="w-full px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-8">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-primary mb-2">
                  <span>// NODE ARCHIVE: 01</span>
                  <span>•</span>
                  <span>120+ RESEARCH NODES ONLINE</span>
                  <span>•</span>
                  <span>VERIFIED ON-CHAIN KARMA</span>
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-on-surface tracking-tight">
                  Global Leaderboards
                </h1>
                <p className="text-on-surface-variant text-base mt-2 max-w-2xl font-light">
                  Real-time engineering metrics tracking verified open-source output and high-conviction venture capital.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setActivePath("home")}
                  className="px-4 py-2 bg-surface-container-high border border-outline-variant/40 rounded-lg text-xs font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to Overview</span>
                </button>
                <div className="px-3.5 py-2 bg-primary/10 border border-primary/30 rounded-lg font-mono text-xs text-primary flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span>LIVE CYCLE S26 • VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Metrics Ticker */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                <span className="font-mono text-[11px] text-on-surface-variant uppercase">Total KP Minted (Term)</span>
                <span className="font-display text-2xl text-primary font-bold">1,248,930 KP</span>
                <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">trending_up</span>
                  +18.4% this week
                </span>
              </div>
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                <span className="font-mono text-[11px] text-on-surface-variant uppercase">Active Contributors</span>
                <span className="font-display text-2xl text-secondary font-bold">3,892 Engineers</span>
                <span className="text-on-surface-variant font-mono text-[11px]">Across 120 Research Nodes</span>
              </div>
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                <span className="font-mono text-[11px] text-on-surface-variant uppercase">Merged PRs Verified</span>
                <span className="font-display text-2xl text-on-surface font-bold">8,412 PRs</span>
                <span className="text-emerald-400 font-mono text-[11px]">GitHub Proofs Validated</span>
              </div>
              <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
                <span className="font-mono text-[11px] text-on-surface-variant uppercase">Mentors & Sprint Reviews</span>
                <span className="font-display text-2xl text-emerald-400 font-bold">340 Mentors</span>
                <span className="text-primary font-mono text-[11px]">4,120 Sprints Reviewed</span>
              </div>
            </div>

            {/* Filter Tabs & Category Selector */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-3 border-b border-outline-variant/20">
              {/* Category Selector */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 sm:pb-0 flex-nowrap sm:flex-wrap">
                {[
                  { key: "all", label: "All Standings", count: "3 Rankings" },
                  { key: "contributors", label: "Code Contributors", count: "Code KP" },
                  { key: "mentors", label: "Faculty Mentors", count: "Advisory KP" },
                  { key: "funds", label: "Venture Funders", count: "Funding KP" },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setLeaderboardCategory(cat.key as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap flex-shrink-0 shrink-0 min-w-max ${leaderboardCategory === cat.key
                        ? cat.key === "mentors"
                          ? "apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-bold shadow-md"
                          : cat.key === "funds"
                            ? "apple-liquid-glass apple-liquid-glass-secondary text-secondary font-bold shadow-md"
                            : "apple-liquid-glass apple-liquid-glass-primary text-primary font-bold shadow-md"
                        : "bg-surface-container-low border border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    <span className="shrink-0">{cat.label}</span>
                    <span className="text-[10px] opacity-75 font-mono shrink-0">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LEADERBOARD SECTIONS (CONTRIBUTORS -> MENTORS IN BETWEEN -> FUNDERS) */}
            <div className="flex flex-col gap-10">
              {/* BOX 1: CONTRIBUTION RANKING */}
              {(leaderboardCategory === "all" || leaderboardCategory === "contributors") && (
                <div className="rounded-2xl border border-primary/40 bg-surface-container-lowest/90 overflow-hidden shadow-[0_4px_20px_rgba(30,58,95,0.06)] flex flex-col justify-between">
                  {/* Box Header */}
                  <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs text-primary font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        [RANKING 01] // CONTRIBUTION STANDINGS
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] font-bold">
                        CRITERIA: CODE KARMA
                      </span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
                      Contribution Ranking
                    </h2>
                    <p className="text-on-surface-variant text-xs sm:text-sm mt-1 font-light leading-relaxed">
                      Ranked by verified GitHub merged pull requests, neural coprocessor commits, and peer code review Karma Points.
                    </p>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-outline-variant/20 font-mono text-[11px] text-on-surface-variant">
                      <span className="text-primary font-bold">Top Score: 38,420 KP</span>
                      <span>•</span>
                      <span>8,412 PRs Verified</span>
                      <span>•</span>
                      <span className="text-emerald-400">On-Chain Synced</span>
                    </div>
                  </div>

                  {/* Box Table / List */}
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/30 font-mono text-[10px] text-on-surface-variant uppercase bg-surface-container-low/30">
                          <th className="py-3 px-4 sm:px-6">Rank</th>
                          <th className="py-3 px-4 sm:px-6">Contributor</th>
                          <th className="py-3 px-3 sm:px-4">Cohort</th>
                          <th className="py-3 px-3 sm:px-4">PRs</th>
                          <th className="py-3 px-4 sm:px-6 text-right">Contribution Karma</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 font-body-md text-xs sm:text-sm">
                        {[
                          {
                            rank: "#01",
                            name: "Kabir Verma",
                            initials: "KV",
                            campus: "DTU '25",
                            filterKey: "dtu",
                            role: "DTU '25",
                            focus: "Distributed Consensus",
                            prs: "284 PRs",
                            kp: "38,420 KP",
                            badge: "Lead Contributor",
                          },
                          {
                            rank: "#02",
                            name: "Priya Sundaram",
                            initials: "PS",
                            campus: "IGDTU '26",
                            filterKey: "igdtu",
                            role: "IGDTU '26",
                            focus: "Quantum Sim & CUDA",
                            prs: "241 PRs",
                            kp: "32,150 KP",
                            badge: "Top 1%",
                          },
                          {
                            rank: "#03",
                            name: "Lakshya Gupta",
                            initials: "LG",
                            campus: "DESU '25",
                            filterKey: "desu",
                            role: "DESU '25",
                            focus: "Synthetic Bio Models",
                            prs: "198 PRs",
                            kp: "28,900 KP",
                            badge: "Bio Lead",
                          },
                          {
                            rank: "#04",
                            name: `${currentUser.name} (You)`,
                            initials: currentUser.avatar,
                            campus: currentUser.campusShort,
                            filterKey: "nsut",
                            role: "NSUT '26",
                            focus: "Symbolic Systems",
                            prs: "182 PRs",
                            kp: "14,200 KP",
                            badge: "Top 1% Contributor",
                            highlight: true,
                          },
                          {
                            rank: "#05",
                            name: "Manav Sharma",
                            initials: "MS",
                            campus: "NSUT '25",
                            filterKey: "nsut",
                            role: "NSUT '25",
                            focus: "Robotics Firmware",
                            prs: "165 PRs",
                            kp: "12,400 KP",
                            badge: "Firmware Lead",
                          },
                          {
                            rank: "#06",
                            name: "Esha Rawat",
                            initials: "ER",
                            campus: "IITD '26",
                            filterKey: "iitd",
                            role: "IITD '26",
                            focus: "ZK Rollup Circuits",
                            prs: "142 PRs",
                            kp: "11,850 KP",
                            badge: "ZK Auditor",
                          },
                        ]
                          .map((row) => (
                            <tr
                              key={row.rank}
                              className={`hover:bg-surface-container-high/40 transition-colors ${row.highlight ? "bg-primary/10 border-l-4 border-l-primary" : ""
                                }`}
                            >
                              <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-primary text-xs sm:text-sm">
                                {row.rank}
                              </td>
                              <td className="py-3.5 px-4 sm:px-6">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-display font-bold text-xs text-primary flex-shrink-0">
                                    {row.initials}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-on-surface block text-xs sm:text-sm truncate">
                                      {row.name}
                                    </span>
                                    <span className="font-mono text-[10px] text-on-surface-variant block truncate">
                                      {row.focus}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                                {row.campus}
                              </td>
                              <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] text-on-surface whitespace-nowrap">
                                {row.prs}
                              </td>
                              <td className="py-3.5 px-4 sm:px-6 text-right font-display font-bold text-primary text-xs sm:text-sm whitespace-nowrap">
                                {row.kp}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Box Footer */}
                  <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex items-center justify-between text-xs font-mono text-on-surface-variant">
                    <span>Earn +50 to +250 KP per merged PR</span>
                    <button
                      onClick={() => setActivePath("projects")}
                      className="text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>Find Open PRs</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION IN BETWEEN: MENTOR LEADERBOARD */}
              {(leaderboardCategory === "all" || leaderboardCategory === "mentors") && (
                <div className="rounded-2xl border border-emerald-500/40 bg-surface-container-lowest/90 overflow-hidden shadow-[0_4px_20px_rgba(30,58,95,0.06)] flex flex-col justify-between">
                  {/* Box Header */}
                  <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        [RANKING 02] // FACULTY & MENTOR ADVISORY STANDINGS
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <span className="material-symbols-outlined text-[12px]">school</span>
                        CRITERIA: MENTORSHIP & SPRINT KARMA
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
                          Mentor Leaderboard
                        </h2>
                        <p className="text-on-surface-variant text-xs sm:text-sm mt-1 font-light leading-relaxed max-w-3xl">
                          Ranked by verified sprint review hours, peer feedback ratings, paper advising, and student venture mentorship Karma Points.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActivePath("mentor")}
                        className="px-4 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs shadow-sm hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5 self-start md:self-auto flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                        <span>Book 25m Sprint Review</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-outline-variant/20 font-mono text-[11px] text-on-surface-variant flex-wrap">
                      <span className="text-emerald-400 font-bold">Top Mentor: 31,450 KP</span>
                      <span>•</span>
                      <span>1,040+ Sprint Reviews</span>
                      <span>•</span>
                      <span>4.98 Avg Rating</span>
                      <span>•</span>
                      <span className="text-primary">Verified by Student Feedback</span>
                    </div>
                  </div>

                  {/* Top 3 Mentor Highlight Podium */}
                  <div className="p-6 bg-surface-container-low/20 border-b border-outline-variant/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          rank: "#01",
                          name: "Dr. Sunita Sen",
                          initials: "SS",
                          role: "IITD Research Chair • AI Fellow",
                          domain: "Diffusion & Distributed Clusters",
                          campus: "IITD Fellow",
                          sprints: "218 Sprints (112h)",
                          rating: "5.0 ★",
                          kp: "31,450 KP",
                          glassBadge: "apple-liquid-glass-emerald",
                          textColor: "text-emerald-300",
                          borderColor: "border-emerald-500/40",
                        },
                        {
                          rank: "#02",
                          name: "Prof. Priya Sengupta",
                          initials: "PS",
                          role: "DTU Robotics Chair",
                          domain: "Foundation Models & Robotics Swarms",
                          campus: "DTU Chair",
                          sprints: "194 Sprints (97h)",
                          rating: "4.99 ★",
                          kp: "27,800 KP",
                          glassBadge: "apple-liquid-glass-primary",
                          textColor: "text-primary",
                          borderColor: "border-primary/40",
                        },
                        {
                          rank: "#03",
                          name: "Manish Sharma",
                          initials: "MS",
                          role: "Founder, Lattice Logic • NSUT '19",
                          domain: "Zero-to-One Sales & Seed Pitching",
                          campus: "NSUT '19",
                          sprints: "172 Sprints (86h)",
                          rating: "4.97 ★",
                          kp: "23,200 KP",
                          glassBadge: "apple-liquid-glass-secondary",
                          textColor: "text-secondary",
                          borderColor: "border-secondary/40",
                        },
                      ].map((top) => (
                        <div
                          key={top.name}
                          className={`p-4 rounded-xl bg-surface-container-low border ${top.borderColor} flex flex-col justify-between gap-3 shadow-md hover:scale-[1.01] transition-transform`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-mono text-xs font-bold ${top.textColor}`}>
                              {top.rank} PODIUM
                            </span>
                            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-bold">
                              {top.rating}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl apple-liquid-glass ${top.glassBadge} flex items-center justify-center font-display font-bold text-sm ${top.textColor} flex-shrink-0 shadow-sm`}>
                              {top.initials}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-display text-sm font-bold text-on-surface truncate">
                                {top.name}
                              </h4>
                              <p className="font-mono text-[10px] text-on-surface-variant truncate">
                                {top.role}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 font-mono text-xs">
                            <span className="text-on-surface-variant text-[11px]">{top.sprints}</span>
                            <span className={`font-display font-bold ${top.textColor}`}>{top.kp}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleBookSlot(top.name)}
                            className="w-full py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-mono text-on-surface hover:text-emerald-400 transition-colors cursor-pointer text-center"
                          >
                            {bookedMentor === top.name ? "✓ Slot Reserved" : "Book 25m Slot"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Box Table / List */}
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/30 font-mono text-[10px] text-on-surface-variant uppercase bg-surface-container-low/30">
                          <th className="py-3 px-4 sm:px-6">Rank</th>
                          <th className="py-3 px-4 sm:px-6">Faculty Mentor & Advisor</th>
                          <th className="py-3 px-3 sm:px-4">Affiliation</th>
                          <th className="py-3 px-3 sm:px-4">Sprint Reviews</th>
                          <th className="py-3 px-3 sm:px-4">Student Rating</th>
                          <th className="py-3 px-4 sm:px-6 text-right">Mentorship Karma</th>
                          <th className="py-3 px-4 sm:px-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 font-body-md text-xs sm:text-sm">
                        {[
                          {
                            rank: "#01",
                            name: "Dr. Sunita Sen",
                            initials: "SS",
                            campus: "IITD Fellow",
                            filterKey: "ai",
                            role: "AI Fellow • IITD",
                            focus: "Diffusion Architectures & Distributed Systems",
                            sprints: "218 Sprints (112 hrs)",
                            rating: "5.0 ★",
                            reviewsCount: "98 reviews",
                            kp: "31,450 KP",
                            badge: "Master Fellow",
                          },
                          {
                            rank: "#02",
                            name: "Prof. Priya Sengupta",
                            initials: "PS",
                            campus: "DTU Chair",
                            filterKey: "robotics",
                            role: "AI & Robotics Research Chair • DTU",
                            focus: "Foundation Models & Robotics Swarms",
                            sprints: "194 Sprints (97 hrs)",
                            rating: "4.99 ★",
                            reviewsCount: "84 reviews",
                            kp: "27,800 KP",
                            badge: "Faculty Chair",
                          },
                          {
                            rank: "#03",
                            name: "Manish Sharma",
                            initials: "MS",
                            campus: "NSUT '19",
                            filterKey: "venture",
                            role: "Founder, Lattice Logic • NSUT '19",
                            focus: "Zero-to-One Sales & Seed Pitching",
                            sprints: "172 Sprints (86 hrs)",
                            rating: "4.97 ★",
                            reviewsCount: "76 reviews",
                            kp: "23,200 KP",
                            badge: "Guild Mentor",
                          },
                          {
                            rank: "#04",
                            name: "Prof. Devendra Gupta",
                            initials: "DG",
                            campus: "NSUT Bio Lead",
                            filterKey: "bio",
                            role: "Bio-Design Lead • NSUT",
                            focus: "CRISPR Modeling & Cryo-EM Assays",
                            sprints: "146 Sprints (73 hrs)",
                            rating: "4.98 ★",
                            reviewsCount: "62 reviews",
                            kp: "19,650 KP",
                            badge: "Bio Fellow",
                          },
                          {
                            rank: "#05",
                            name: "Sneha Patel",
                            initials: "SP",
                            campus: "IIITD Velocity",
                            filterKey: "venture",
                            role: "Partner, Delhi Tech Ventures • IIITD",
                            focus: "Cap Table Strategy & Venture Licensing",
                            sprints: "138 Sprints (69 hrs)",
                            rating: "4.96 ★",
                            reviewsCount: "59 reviews",
                            kp: "17,400 KP",
                            badge: "Venture Partner",
                          },
                          {
                            rank: "#06",
                            name: "Esha Rawat",
                            initials: "ER",
                            campus: "IGDTU Senior Fellow",
                            filterKey: "crypto",
                            role: "Senior ZK Fellow • Cryptography • IGDTU",
                            focus: "Halo2 Constraint Circuits & Cryptography Audits",
                            sprints: "124 Sprints (62 hrs)",
                            rating: "4.95 ★",
                            reviewsCount: "51 reviews",
                            kp: "15,100 KP",
                            badge: "ZK Auditor",
                          },
                        ]
                          .filter((s) => leaderboardFilter === "all" || s.filterKey === leaderboardFilter)
                          .map((row) => (
                            <tr
                              key={row.rank}
                              className="hover:bg-surface-container-high/40 transition-colors"
                            >
                              <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                                {row.rank}
                              </td>
                              <td className="py-3.5 px-4 sm:px-6">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center font-display font-bold text-xs text-emerald-300 flex-shrink-0 shadow-xs">
                                    {row.initials}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-on-surface block text-xs sm:text-sm truncate">
                                      {row.name}
                                    </span>
                                    <span className="font-mono text-[10px] text-on-surface-variant block truncate">
                                      {row.focus}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                                {row.campus}
                              </td>
                              <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] text-on-surface whitespace-nowrap">
                                {row.sprints}
                              </td>
                              <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] text-emerald-400 whitespace-nowrap">
                                <span className="font-bold">{row.rating}</span>{" "}
                                <span className="text-on-surface-variant text-[10px]">({row.reviewsCount})</span>
                              </td>
                              <td className="py-3.5 px-4 sm:px-6 text-right font-display font-bold text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
                                {row.kp}
                              </td>
                              <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleBookSlot(row.name)}
                                  className="px-3 py-1 rounded-lg border border-outline-variant/40 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-xs font-mono text-on-surface hover:text-emerald-300 transition-colors cursor-pointer"
                                >
                                  {bookedMentor === row.name ? "✓ Reserved" : "Book 25m"}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Box Footer */}
                  <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex items-center justify-between text-xs font-mono text-on-surface-variant flex-wrap gap-2">
                    <span>Mentors earn +100 to +300 KP per verified sprint critique</span>
                    <button
                      type="button"
                      onClick={() => setActivePath("mentor")}
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>Explore All Mentors</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* BOX 3: FUND RANKING */}
              {(leaderboardCategory === "all" || leaderboardCategory === "funds") && (
                <div className="rounded-2xl border border-secondary/40 bg-surface-container-lowest/90 overflow-hidden shadow-[0_4px_20px_rgba(30,58,95,0.06)] flex flex-col justify-between">
                  {/* Box Header */}
                  <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs text-secondary font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        [RANKING 03] // FUNDING STANDINGS
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-mono text-[10px] font-bold">
                        CRITERIA: FUNDING KARMA
                      </span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
                      Fund Ranking
                    </h2>
                    <p className="text-on-surface-variant text-xs sm:text-sm mt-1 font-light leading-relaxed">
                      Ranked by collegiate micro-grant deployment, student angel pool allocations, and successful incubation Karma Points.
                    </p>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-outline-variant/20 font-mono text-[11px] text-on-surface-variant">
                      <span className="text-secondary font-bold">Top Backer: 7,150 KP</span>
                      <span>•</span>
                      <span>₹25 Cr Deployed</span>
                      <span>•</span>
                      <span className="text-emerald-400">Zero-Equity SAFE</span>
                    </div>
                  </div>

                  {/* Box Table / List */}
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/30 font-mono text-[10px] text-on-surface-variant uppercase bg-surface-container-low/30">
                          <th className="py-3 px-4 sm:px-6">Rank</th>
                          <th className="py-3 px-4 sm:px-6">Angel Backer / Allocator</th>
                          <th className="py-3 px-3 sm:px-4">Affiliation / Node</th>
                          <th className="py-3 px-3 sm:px-4">Backed</th>
                          <th className="py-3 px-4 sm:px-6 text-right">Funding Karma</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 font-body-md text-xs sm:text-sm">
                        {[
                          {
                            rank: "#01",
                            name: `${currentUser.name} (You)`,
                            initials: currentUser.avatar,
                            campus: currentUser.campusShort,
                            filterKey: "nsut",
                            role: "NSUT '26",
                            focus: "Edge Systems Angel Pool",
                            deployed: "₹35 Lakh Backed",
                            kp: "7,150 KP",
                            badge: "Guild Anchor",
                            highlight: true,
                          },
                          {
                            rank: "#02",
                            name: "Divyansh Verma",
                            initials: "DV",
                            campus: "DTU Node",
                            filterKey: "dtu",
                            role: "DTU '25",
                            focus: "Neural Micro-Grant Pool",
                            deployed: "₹50 Lakh Backed",
                            kp: "6,800 KP",
                            badge: "Lead Backer",
                          },
                          {
                            rank: "#03",
                            name: "Meera Sharma",
                            initials: "MS",
                            campus: "IITD Compute Node",
                            filterKey: "iitd",
                            role: "IITD '26",
                            focus: "Decentralized Compute Pool",
                            deployed: "₹45 Lakh Backed",
                            kp: "5,950 KP",
                            badge: "Venture Fellow",
                          },
                          {
                            rank: "#04",
                            name: "Tarun Mathur",
                            initials: "TM",
                            campus: "NSUT Hardware Node",
                            filterKey: "nsut",
                            role: "NSUT '25",
                            focus: "Hardware & Silicon Micro-Fund",
                            deployed: "₹40 Lakh Backed",
                            kp: "5,200 KP",
                            badge: "Syndicate Anchor",
                          },
                          {
                            rank: "#05",
                            name: "Sneha Deshmukh",
                            initials: "SD",
                            campus: "IGDTU Quantum Node",
                            filterKey: "igdtu",
                            role: "IGDTU '25",
                            focus: "Frontier Foundry Grants",
                            deployed: "₹30 Lakh Backed",
                            kp: "4,600 KP",
                            badge: "Grant Allocator",
                          },
                          {
                            rank: "#06",
                            name: "Lakshya Gupta",
                            initials: "LG",
                            campus: "DESU Bio Node",
                            filterKey: "desu",
                            role: "DESU '26",
                            focus: "Autonomous Systems Syndicate",
                            deployed: "₹25 Lakh Backed",
                            kp: "3,900 KP",
                            badge: "Angel Scout",
                          },
                        ]
                          .filter((s) => leaderboardFilter === "all" || s.filterKey === leaderboardFilter)
                          .map((row) => (
                            <tr
                              key={row.rank}
                              className={`hover:bg-surface-container-high/40 transition-colors ${row.highlight ? "bg-secondary/10 border-l-4 border-l-secondary" : ""
                                }`}
                            >
                              <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-secondary text-xs sm:text-sm">
                                {row.rank}
                              </td>
                              <td className="py-3.5 px-4 sm:px-6">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-display font-bold text-xs text-secondary flex-shrink-0">
                                    {row.initials}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-on-surface block text-xs sm:text-sm truncate">
                                      {row.name}
                                    </span>
                                    <span className="font-mono text-[10px] text-on-surface-variant block truncate">
                                      {row.focus}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                                {row.campus}
                              </td>
                              <td className="py-3.5 px-3 sm:px-4 font-mono text-[11px] text-emerald-400 whitespace-nowrap font-medium">
                                {row.deployed}
                              </td>
                              <td className="py-3.5 px-4 sm:px-6 text-right font-display font-bold text-secondary text-xs sm:text-sm whitespace-nowrap">
                                {row.kp}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Box Footer */}
                  <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex items-center justify-between text-xs font-mono text-on-surface-variant">
                    <span>Earn +100 to +500 KP per grant sponsored</span>
                    <button
                      onClick={() => setActivePath("investment")}
                      className="text-secondary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>Deploy Micro-Grant</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: COMMUNITY GUILDS (INSTAGRAM DM TYPE FORMAT) */}
        {viewPath === "community" && (() => {
          const isUserCreated = (c: any) => Boolean(c.isCreatedByMe || c.id?.startsWith("comm-"));

          // Personal DMs resolution
          const isDm = selectedCommunityId.startsWith("dm-");
          const dmPeerId = isDm ? selectedCommunityId.replace("dm-", "") : null;
          const activeDmPeer = dmPeerId
            ? peersList.find((p) => p.id === dmPeerId) ||
            DEFAULT_PEERS.find((p) => p.id === dmPeerId) ||
            null
            : null;

          // Connected friends available for personal DMs
          const connectedPeersList = peersList.filter((p) => {
            if (p.id === activeViewerPersona) return false;
            return (
              !!connectedPeers[p.id] ||
              friendInvites.some(
                (inv) =>
                  inv.status === "accepted" &&
                  ((inv.senderId === activeViewerPersona && inv.recipientId === p.id) ||
                    (inv.senderId === p.id && inv.recipientId === activeViewerPersona))
              )
            );
          });

          const matchesDmFilter = (p: PeerItem) => {
            if (!communitySearch.trim()) return true;
            const q = communitySearch.toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              p.campus.toLowerCase().includes(q) ||
              p.headline.toLowerCase().includes(q) ||
              p.skills.some((s) => s.toLowerCase().includes(q))
            );
          };

          const filteredConnectedPeers = connectedPeersList.filter(matchesDmFilter);

          const createdCommunities = communities.filter((c) => isUserCreated(c));
          const joinedCommunities = communities.filter((c) => c.joined && !isUserCreated(c));
          const suggestedCommunities = communities.filter((c) => !c.joined && !isUserCreated(c));

          const matchesFilter = (c: any) => {
            const matchesSearch =
              c.name.toLowerCase().includes(communitySearch.toLowerCase()) ||
              c.category.toLowerCase().includes(communitySearch.toLowerCase()) ||
              c.desc.toLowerCase().includes(communitySearch.toLowerCase());
            const matchesCat =
              communityCategoryFilter === "all" ||
              communityCategoryFilter === "guilds" ||
              c.category.toLowerCase().includes(communityCategoryFilter.toLowerCase());
            return matchesSearch && matchesCat;
          };

          const filteredCreated = createdCommunities.filter(matchesFilter);
          const filteredJoined = joinedCommunities.filter(matchesFilter);
          const filteredSuggested = suggestedCommunities.filter(matchesFilter);

          const activeCommunity = isDm && activeDmPeer
            ? {
              id: selectedCommunityId,
              code: `@${activeDmPeer.name.toLowerCase().replace(/\s+/g, "")}`,
              name: activeDmPeer.name,
              category: "Personal Direct Message",
              desc: activeDmPeer.headline,
              members: 2,
              online: activeDmPeer.onlineStatus === "online" ? 2 : 1,
              campus: `${activeDmPeer.campus} • ${activeDmPeer.major}`,
              icon: "person",
              avatarColor: "from-primary/30 to-secondary/30",
              joined: true,
              isDm: true,
              isCreatedByMe: false,
            }
            : communities.find((c) => c.id === selectedCommunityId) ||
            createdCommunities[0] ||
            joinedCommunities[0] ||
            communities[0];

          const currentChatMessages =
            allMessages[selectedCommunityId] ||
            (activeCommunity && allMessages[activeCommunity.id]) ||
            [];

          return (
            <div className="w-full px-2 sm:px-4 lg:px-6 py-2 max-w-[1920px] mx-auto flex flex-col flex-1 h-[calc(100vh-5.25rem)] animate-in fade-in duration-300 overflow-hidden">
              {/* INSTAGRAM DM FORMAT MAIN CONTAINER (EXPANDED FULL SIZE) */}
              <div className="w-full h-full flex-1 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* ================= LEFT SIDE: COMMUNITIES & SUGGESTIONS ================= */}
                <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[440px] border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest/95 flex-shrink-0">
                  {/* Top Bar on Left: Header & Unread Counter */}
                  <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-on-surface">
                        Direct Channels & DMs
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] font-bold">
                        {connectedPeersList.length + communities.filter((c) => c.joined || isUserCreated(c)).length} Active
                      </span>
                    </div>

                    <button
                      onClick={() => setIsCreateCommunityOpen(true)}
                      className="p-1.5 rounded-lg bg-surface-container-high hover:bg-primary/20 hover:text-primary text-on-surface-variant transition-all cursor-pointer"
                      title="Create Community"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_square</span>
                    </button>
                  </div>

                  {/* PROMINENT OPTION TO CREATE COMMUNITY ON TOP OF JOINED COMMUNITIES */}
                  <div className="p-3 bg-surface-container-low/40 border-b border-outline-variant/20">
                    <button
                      onClick={() => setIsCreateCommunityOpen(true)}
                      className="w-full py-2.5 px-3.5 bg-gradient-to-r from-primary/15 via-primary/10 to-secondary/15 hover:from-primary/25 hover:to-secondary/25 text-primary hover:text-on-surface border border-primary/40 rounded-xl font-display font-semibold text-xs flex items-center justify-between transition-all group shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </div>
                        <div className="text-left">
                          <span className="block font-bold text-on-surface text-xs leading-none">
                            + Create Community
                          </span>
                          <span className="font-mono text-[10px] text-primary/80">
                            Save to database & launch
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-primary group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>

                  {/* TOP SEARCH BAR TO FILTER & SEARCH COMMUNITIES & SUGGESTIONS */}
                  <div className="p-3 border-b border-outline-variant/20 flex flex-col gap-2">
                    <div className="relative w-full">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70 absolute left-3 top-1/2 -translate-y-1/2">
                        search
                      </span>
                      <input
                        type="text"
                        value={communitySearch}
                        onChange={(e) => setCommunitySearch(e.target.value)}
                        placeholder="Search DMs & communities..."
                        className="w-full bg-surface-container-high/40 border border-outline-variant/30 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                      />
                      {communitySearch && (
                        <button
                          onClick={() => setCommunitySearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono scrollbar-none">
                      {["all", "dms", "AI", "Robotics", "Crypto", "Bio"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCommunityCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${communityCategoryFilter === cat
                              ? "bg-primary text-on-primary font-bold shadow-xs"
                              : "bg-surface-container-high/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                            }`}
                        >
                          {cat === "dms" ? "Personal DMs" : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SCROLLABLE LIST OF JOINED COMMUNITIES & SUGGESTIONS */}
                  <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
                    {/* SECTION 0: PERSONAL DIRECT MESSAGES (1-ON-1 CHATS) */}
                    {(communityCategoryFilter === "all" || communityCategoryFilter === "dms") && (
                      <div className="py-1 bg-primary/[0.03]">
                        <button
                          type="button"
                          onClick={() => setOpenGroups((prev) => ({ ...prev, dms: !prev.dms }))}
                          className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-mono text-primary font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-200 ${openGroups.dms ? "rotate-0" : "-rotate-90"
                              }`}>
                              arrow_drop_down
                            </span>
                            <span className="material-symbols-outlined text-[15px] text-primary">forum</span>
                            <span>Personal Direct Messages ({filteredConnectedPeers.length})</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-primary text-primary font-mono text-[9px] font-bold">
                            1-ON-1
                          </span>
                        </button>

                        {openGroups.dms && (
                          <div className="animate-in fade-in duration-200">
                            {filteredConnectedPeers.length === 0 ? (
                              <div className="p-4 mx-3 my-1 rounded-xl bg-surface-container-high/40 border border-outline-variant/30 text-center">
                                <p className="text-xs font-mono text-on-surface-variant">
                                  {communitySearch
                                    ? `No personal DMs match "${communitySearch}"`
                                    : "No connected friends in DMs yet."}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setActivePath("friends")}
                                  className="mt-2 text-xs font-mono text-primary hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                >
                                  <span>Open Friends Tab & Connect</span>
                                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                </button>
                              </div>
                            ) : (
                              filteredConnectedPeers.map((peer) => {
                                const dmId = `dm-${peer.id}`;
                                const isSelected = selectedCommunityId === dmId;
                                const peerMessages = allMessages[dmId] || [];
                                const lastMsg = peerMessages[peerMessages.length - 1];

                                return (
                                  <button
                                    key={peer.id}
                                    type="button"
                                    onClick={() => setSelectedCommunityId(dmId)}
                                    className={`w-full px-3.5 py-3 flex items-center gap-3 text-left transition-all cursor-pointer relative ${isSelected
                                        ? "bg-surface-container-high/90 border-l-4 border-l-primary shadow-[inset_0_0_20px_rgba(56,189,248,0.12)]"
                                        : "hover:bg-surface-container-high/40"
                                      }`}
                                  >
                                    {/* Avatar with Status */}
                                    <div className="relative flex-shrink-0">
                                      <div
                                        className={`w-11 h-11 rounded-2xl apple-liquid-glass ${isSelected
                                            ? "apple-liquid-glass-primary text-primary"
                                            : "apple-liquid-glass-neutral text-on-surface"
                                          } flex items-center justify-center font-display font-bold text-sm shadow-md`}
                                      >
                                        <span>{peer.avatar}</span>
                                      </div>
                                      <span
                                        className={`w-2.5 h-2.5 rounded-full border-2 border-surface-container-lowest absolute -bottom-0.5 -right-0.5 ${peer.onlineStatus === "online"
                                            ? "bg-emerald-400"
                                            : peer.onlineStatus === "building"
                                              ? "bg-cyan-400"
                                              : "bg-amber-400"
                                          }`}
                                      />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="font-display font-semibold text-xs sm:text-sm text-on-surface truncate">
                                            {peer.name}
                                          </span>
                                          <span className="px-1.5 py-0.2 rounded bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 font-mono text-[8px] font-bold tracking-wider flex-shrink-0">
                                            FRIEND
                                          </span>
                                        </div>
                                        <span className="font-mono text-[10px] text-on-surface-variant whitespace-nowrap">
                                          {lastMsg ? lastMsg.time : "Connected"}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-mono text-[11px] text-on-surface-variant truncate">
                                          {lastMsg ? lastMsg.text : "Tap to send a direct message..."}
                                        </p>
                                        <span className="font-mono text-[9px] text-primary/80 flex-shrink-0">
                                          {peer.campus}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 1: JOINED COMMUNITIES */}
                    {(communityCategoryFilter === "all" || communityCategoryFilter !== "dms") && (
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => setOpenGroups((prev) => ({ ...prev, joined: !prev.joined }))}
                          className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-mono text-on-surface-variant hover:text-on-surface font-bold uppercase tracking-wider hover:bg-surface-container-high/50 transition-colors cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 ${openGroups.joined ? "rotate-0" : "-rotate-90"
                              }`}>
                              arrow_drop_down
                            </span>
                            <span>Joined Communities ({filteredJoined.length})</span>
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </button>

                        {openGroups.joined && (
                          <div className="animate-in fade-in duration-200">
                            {filteredJoined.length === 0 ? (
                              <div className="p-4 text-center text-xs font-mono text-on-surface-variant/80">
                                No joined communities match &quot;{communitySearch}&quot;
                              </div>
                            ) : (
                              filteredJoined.map((c) => {
                                const isSelected = activeCommunity?.id === c.id;
                                return (
                                  <button
                                    key={c.id}
                                    onClick={() => setSelectedCommunityId(c.id)}
                                    className={`w-full px-3.5 py-3 flex items-center gap-3 text-left transition-all cursor-pointer relative ${isSelected
                                        ? "bg-surface-container-high/80 border-l-4 border-l-primary shadow-[inset_0_0_20px_rgba(56,189,248,0.08)]"
                                        : "hover:bg-surface-container-high/40"
                                      }`}
                                  >
                                    {/* Avatar with Live Indicator */}
                                    <div className="relative flex-shrink-0">
                                      <div
                                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.avatarColor} border border-outline-variant/40 flex items-center justify-center text-on-surface shadow-md`}
                                      >
                                        <span className="material-symbols-outlined text-[20px] text-primary">
                                          {c.icon || "hub"}
                                        </span>
                                      </div>
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface absolute -bottom-0.5 -right-0.5"></span>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <span className="font-display font-semibold text-xs sm:text-sm text-on-surface truncate">
                                          {c.name}
                                        </span>
                                        <span className="font-mono text-[10px] text-on-surface-variant whitespace-nowrap">
                                          {c.lastMessageTime || "Active"}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-mono text-[11px] text-on-surface-variant truncate">
                                          {c.lastMessage || c.desc}
                                        </p>
                                        {c.unreadCount ? (
                                          <span className="w-4 h-4 rounded-full bg-primary text-on-primary font-mono text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                                            {c.unreadCount}
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 2: COMMUNITIES YOU CREATED (BETWEEN JOINED AND SUGGESTED) */}
                    {(communityCategoryFilter === "all" || communityCategoryFilter !== "dms") && (
                      <div className="py-1 bg-primary/[0.03] border-t border-outline-variant/15">
                        <button
                          type="button"
                          onClick={() => setOpenGroups((prev) => ({ ...prev, created: !prev.created }))}
                          className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-mono text-primary font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-200 ${openGroups.created ? "rotate-0" : "-rotate-90"
                              }`}>
                              arrow_drop_down
                            </span>
                            <span className="material-symbols-outlined text-[15px] text-primary">verified_user</span>
                            <span>Communities Created ({filteredCreated.length})</span>
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-primary/15 border border-primary/30 text-primary font-mono text-[9px] font-bold">
                            Admin
                          </span>
                        </button>

                        {openGroups.created && (
                          <div className="animate-in fade-in duration-200">
                            {filteredCreated.length === 0 ? (
                              <div className="p-3 text-center text-xs font-mono text-on-surface-variant/70">
                                {communitySearch
                                  ? `No created communities match "${communitySearch}"`
                                  : 'No communities created yet. Click "+ Create Community" above.'}
                              </div>
                            ) : (
                              filteredCreated.map((c) => {
                                const isSelected = activeCommunity?.id === c.id;
                                return (
                                  <button
                                    key={c.id}
                                    onClick={() => setSelectedCommunityId(c.id)}
                                    className={`w-full px-3.5 py-3 flex items-center gap-3 text-left transition-all cursor-pointer relative ${isSelected
                                        ? "bg-surface-container-high/90 border-l-4 border-l-primary shadow-[inset_0_0_20px_rgba(56,189,248,0.1)]"
                                        : "hover:bg-surface-container-high/40"
                                      }`}
                                  >
                                    {/* Avatar with Creator Indicator */}
                                    <div className="relative flex-shrink-0">
                                      <div
                                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.avatarColor} border border-primary/40 flex items-center justify-center text-on-surface shadow-md`}
                                      >
                                        <span className="material-symbols-outlined text-[20px] text-primary">
                                          {c.icon || "hub"}
                                        </span>
                                      </div>
                                      <span className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface absolute -bottom-0.5 -right-0.5 shadow-none"></span>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="font-display font-semibold text-xs sm:text-sm text-on-surface truncate">
                                            {c.name}
                                          </span>
                                          <span className="px-1.5 py-0.2 rounded bg-primary/15 border border-primary/30 text-primary font-mono text-[8px] font-bold tracking-wider flex-shrink-0">
                                            OWNER
                                          </span>
                                        </div>
                                        <span className="font-mono text-[10px] text-on-surface-variant whitespace-nowrap">
                                          {c.lastMessageTime || "Just now"}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-mono text-[11px] text-on-surface-variant truncate">
                                          {c.lastMessage || c.desc}
                                        </p>
                                        <span className="font-mono text-[10px] text-primary/80 flex-shrink-0">
                                          {c.members} {c.members === 1 ? "member" : "members"}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 3: COMMUNITIES SUGGESTIONS (INSTA DM STYLE) */}
                    {(communityCategoryFilter === "all" || communityCategoryFilter !== "dms") && (
                      <div className="py-1 bg-surface-container-lowest/60 border-t border-outline-variant/15">
                        <button
                          type="button"
                          onClick={() => setOpenGroups((prev) => ({ ...prev, suggested: !prev.suggested }))}
                          className="w-full px-4 py-2 flex items-center justify-between text-[11px] font-mono text-secondary font-bold uppercase tracking-wider hover:bg-secondary/10 transition-colors cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`material-symbols-outlined text-[18px] text-secondary transition-transform duration-200 ${openGroups.suggested ? "rotate-0" : "-rotate-90"
                              }`}>
                              arrow_drop_down
                            </span>
                            <span className="material-symbols-outlined text-[14px]">explore</span>
                            <span>Suggested For You ({filteredSuggested.length})</span>
                          </span>
                        </button>

                        {openGroups.suggested && (
                          <div className="animate-in fade-in duration-200">
                            {filteredSuggested.length === 0 ? (
                              <div className="p-4 text-center text-xs font-mono text-on-surface-variant/80">
                                {communitySearch ? "No suggestions matching filter" : "You have joined all available communities!"}
                              </div>
                            ) : (
                              filteredSuggested.map((c) => (
                                <div
                                  key={c.id}
                                  className="px-3.5 py-3 flex items-center justify-between gap-2.5 hover:bg-surface-container-high/30 transition-all border-b border-outline-variant/10 last:border-0"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.avatarColor} border border-outline-variant/30 flex items-center justify-center text-secondary flex-shrink-0`}
                                    >
                                      <span className="material-symbols-outlined text-[17px]">
                                        {c.icon || "group"}
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-display font-medium text-xs text-on-surface block truncate">
                                        {c.name}
                                      </span>
                                      <span className="font-mono text-[10px] text-on-surface-variant block truncate">
                                        {c.members} members • {c.campus.split("•")[0]}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleJoinCommunity(c.id, c.name)}
                                    className="px-3 py-1 bg-primary/15 hover:bg-primary text-primary hover:text-on-primary border border-primary/40 rounded-lg font-mono text-[11px] font-semibold transition-all flex-shrink-0 cursor-pointer shadow-xs"
                                  >
                                    + Join
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= RIGHT SIDE: CHAT BOX ================= */}
                <div className="flex-1 flex flex-col bg-surface-container-low/30 min-w-0">
                  {/* Chat Top Header */}
                  {activeCommunity ? (
                    <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {isDm && activeDmPeer ? (
                          <div className="relative flex-shrink-0">
                            <div
                              onClick={() => setSelectedPeerForProfile(activeDmPeer)}
                              className="w-11 h-11 rounded-2xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary font-bold font-display text-base shadow-md cursor-pointer hover:scale-105 transition-transform"
                              title="Click to view full student profile"
                            >
                              <span>{activeDmPeer.avatar}</span>
                            </div>
                            <span
                              className={`w-3.5 h-3.5 rounded-full border-2 border-surface-container-lowest absolute -bottom-0.5 -right-0.5 shadow-xs z-10 ${activeDmPeer.onlineStatus === "online"
                                  ? "bg-emerald-400"
                                  : activeDmPeer.onlineStatus === "building"
                                    ? "bg-cyan-400"
                                    : "bg-amber-400"
                                }`}
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeCommunity.avatarColor} border border-primary/40 flex items-center justify-center text-primary flex-shrink-0 shadow-xs`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {activeCommunity.icon || "hub"}
                            </span>
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              onClick={() => isDm && activeDmPeer && setSelectedPeerForProfile(activeDmPeer)}
                              className={`font-display font-bold text-sm sm:text-base text-on-surface truncate ${isDm && activeDmPeer ? "cursor-pointer hover:text-primary transition-colors" : ""
                                }`}
                            >
                              {activeCommunity.name}
                            </h3>
                            {!isDm && (
                              <span className="px-2 py-0.2 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[9px] font-bold hidden sm:inline">
                                {activeCommunity.code}
                              </span>
                            )}
                            {(activeCommunity.isCreatedByMe || activeCommunity.id?.startsWith("comm-")) && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-mono text-[9px] font-bold flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-[12px]">shield_person</span>
                                OWNER MODERATOR
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant flex-wrap">
                            <span className="text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              {isDm && activeDmPeer ? `${activeDmPeer.onlineStatus} • 1-on-1 Encrypted` : `${activeCommunity.online} online`}
                            </span>
                            <span>•</span>
                            <span>{isDm && activeDmPeer ? activeDmPeer.match : `${activeCommunity.members} members`}</span>
                            <span className="hidden lg:inline">•</span>
                            <span className="hidden lg:inline text-on-surface-variant/80 truncate">
                              {activeCommunity.campus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Header Channel Tools */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isDm && activeDmPeer ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPeerForProfile(activeDmPeer)}
                            className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-primary/50 text-xs font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="View Researcher Profile Dossier"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            <span className="hidden sm:inline">Profile</span>
                          </button>
                        ) : null}


                        <button
                          onClick={() => showToast(isDm && activeDmPeer ? `Starting encrypted audio pod with ${activeDmPeer.name}...` : "Voice channel live audio pod connected")}
                          className="p-2 rounded-xl bg-surface-container-high hover:bg-primary/20 hover:text-primary text-on-surface-variant transition-colors cursor-pointer"
                          title="Join Audio Pod"
                        >
                          <span className="material-symbols-outlined text-[18px]">call</span>
                        </button>
                        <button
                          onClick={() => showToast(isDm && activeDmPeer ? `Starting peer video session with ${activeDmPeer.name}...` : "Channel video stream connected")}
                          className="p-2 rounded-xl bg-surface-container-high hover:bg-secondary/20 hover:text-secondary text-on-surface-variant transition-colors cursor-pointer"
                          title="Video Call"
                        >
                          <span className="material-symbols-outlined text-[18px]">videocam</span>
                        </button>
                        {!isDm && (
                          <button
                            onClick={() => setIsCommunityDetailsOpen(true)}
                            className="p-2 rounded-xl bg-surface-container-high hover:bg-secondary/20 hover:text-secondary text-on-surface-variant transition-colors cursor-pointer"
                            title="Channel Information & Settings"
                          >
                            <span className="material-symbols-outlined text-[18px]">info</span>
                          </button>
                        )}
                        {(activeCommunity.isCreatedByMe || activeCommunity.id?.startsWith("comm-")) && (
                          <button
                            onClick={() => handleDeleteCommunity(activeCommunity.id, activeCommunity.name)}
                            className="p-2 rounded-xl bg-error/15 hover:bg-error/30 text-error border border-error/40 transition-colors cursor-pointer"
                            title="Delete Community (Created by you)"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Chat Message Stream */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 scroll-smooth"
                  >

                    {/* Date Divider */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-[1px] bg-outline-variant/20"></div>
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                        Today • Verified Stream
                      </span>
                      <div className="flex-1 h-[1px] bg-outline-variant/20"></div>
                    </div>

                    {/* Chat Messages */}
                    {currentChatMessages.map((msg) => {
                      const isOwnerOfActiveCommunity = Boolean(
                        activeCommunity &&
                        (activeCommunity.isCreatedByMe || activeCommunity.id?.startsWith("comm-"))
                      );
                      const isOthersMessage = !msg.isSelf;
                      const canDelete = isOwnerOfActiveCommunity || msg.isSelf;

                      return (
                        <div
                          key={msg.id}
                          className={`group relative flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.isSelf ? "self-end flex-row-reverse" : "self-start"
                            }`}
                        >
                          {/* Avatar */}
                          {!msg.isSelf && (
                            <div className="w-8 h-8 rounded-xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-display font-bold text-xs text-primary flex-shrink-0 mt-0.5 shadow-sm">
                              {msg.avatar}
                            </div>
                          )}

                          <div className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"} min-w-0`}>
                            {/* Sender Info & Mod/Delete Bar */}
                            <div className="flex items-center gap-2 mb-1 px-1 flex-wrap">
                              <span className="font-display font-semibold text-xs text-on-surface">
                                {msg.sender}
                              </span>
                              <span className="font-mono text-[10px] text-on-surface-variant">
                                {msg.campus}
                              </span>
                              <span className="font-mono text-[10px] text-on-surface-variant/70">
                                • {msg.time}
                              </span>

                              {/* Owner Delete indicator for others' messages */}
                              {isOwnerOfActiveCommunity && isOthersMessage && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                                  Member Msg
                                </span>
                              )}
                            </div>

                            {/* Message Bubble + Delete Action */}
                            <div
                              className={`flex items-center gap-2 ${msg.isSelf ? "flex-row-reverse" : "flex-row"
                                }`}
                            >
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.isSelf
                                    ? "bg-[#1e3a5f] hover:bg-[#152a45] text-white shadow-sm font-medium rounded-tr-none shadow-xs"
                                    : "bg-surface-container-high/90 border border-outline-variant/40 text-on-surface rounded-tl-none"
                                  }`}
                              >
                                {msg.text && <p className="break-words">{msg.text}</p>}

                                {/* ATTACHED FILE & PROJECT CONTRIBUTION CARD */}
                                {msg.attachment && (
                                  <div className={`mt-2.5 p-3 rounded-xl border flex flex-col gap-2 text-left ${msg.isSelf
                                      ? "bg-surface-container-lowest/90 text-on-surface border-white/20 shadow-sm"
                                      : "bg-surface-container-low/90 text-on-surface border-outline-variant/40 shadow-xs"
                                    }`}>
                                    <div className="flex items-start justify-between gap-2.5">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-xs">
                                          <span className="material-symbols-outlined text-[18px]">
                                            {msg.attachment.type === "code"
                                              ? "terminal"
                                              : msg.attachment.type === "archive"
                                                ? "folder_zip"
                                                : msg.attachment.type === "diagram"
                                                  ? "schema"
                                                  : "description"}
                                          </span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-mono text-xs font-bold text-on-surface truncate">
                                            {msg.attachment.name}
                                          </span>
                                          <span className="font-mono text-[10px] text-on-surface-variant">
                                            {msg.attachment.size} • {msg.attachment.type.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleDownloadAttachment(msg.attachment!)}
                                        className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary border border-outline-variant/40 text-[10px] font-mono font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
                                        title="Download Artifact File"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">download</span>
                                        <span>Download File</span>
                                      </button>
                                    </div>

                                    {/* Project link badge */}
                                    <div className="p-2 rounded-lg bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-between text-[10px] font-mono flex-wrap gap-2">
                                      <div className="flex items-center gap-1.5 text-primary">
                                        <span className="material-symbols-outlined text-[13px]">source</span>
                                        <span>Project: <strong className="text-on-surface">{msg.attachment.projectTitle}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-on-surface-variant">
                                          Admin: <strong className="text-amber-400">{msg.attachment.projectAdmin}</strong>
                                        </span>
                                        {Boolean(
                                          (msg.attachment.projectAdmin &&
                                            currentUser?.name &&
                                            currentUser.name.toLowerCase().trim() === msg.attachment.projectAdmin.toLowerCase().trim()) ||
                                          (currentUser?.role === "faculty" && msg.attachment.projectAdmin?.includes("Faculty")) ||
                                          activeCommunity?.isCreatedByMe
                                        ) && (
                                            <button
                                              type="button"
                                              onClick={() => handleDownloadProject(msg.attachment?.projectId || msg.attachment?.projectTitle)}
                                              className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[9px] font-mono font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                                              title={`Download ${msg.attachment.projectTitle} project dossier (Admin Only)`}
                                            >
                                              <span className="material-symbols-outlined text-[11px]">download</span>
                                              <span>Download Project</span>
                                            </button>
                                          )}
                                      </div>
                                    </div>

                                    {/* Admin Star status on card */}
                                    {msg.adminStarred ? (
                                      <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-between gap-1 shadow-xs">
                                        <div className="flex items-center gap-1">
                                          <span className="material-symbols-outlined text-[14px] text-amber-400">star</span>
                                          <span>Admin Starred by {msg.starredBy}</span>
                                        </div>
                                        <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px]">
                                          +{msg.karmaAwarded || 100} KP Awarded
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant px-1">
                                        <span>Awaiting Project Admin review</span>
                                        <span className="text-amber-400 font-medium">Earn +100 KP on ⭐ star</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Delete Action Button */}
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteMessage(
                                      activeCommunity.id,
                                      msg.id,
                                      isOthersMessage
                                    )
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-surface-container-high/90 hover:bg-error/20 text-on-surface-variant hover:text-error border border-outline-variant/30 hover:border-error/40 cursor-pointer shadow-sm flex items-center gap-1 flex-shrink-0"
                                  title={
                                    isOthersMessage
                                      ? "Delete member message (Owner moderation)"
                                      : "Delete your message"
                                  }
                                >
                                  <span className="material-symbols-outlined text-[15px]">delete</span>
                                  {isOthersMessage && isOwnerOfActiveCommunity && (
                                    <span className="hidden md:inline font-mono text-[9px] text-error font-bold uppercase tracking-wider">
                                      Delete
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Reactions */}
                            <div className="flex items-center gap-1.5 mt-1.5 px-1 flex-wrap">
                              {msg.reactions && msg.reactions.map((r, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    if (r.startsWith("⭐")) {
                                      handleStarReaction(activeCommunity.id, msg);
                                    } else {
                                      const emoji = r.split(" ")[0];
                                      handleAddReaction(activeCommunity.id, msg.id, emoji);
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded-full border text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${r.startsWith("⭐") && msg.adminStarred
                                      ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm"
                                      : "bg-surface-container-high border-outline-variant/30 text-on-surface hover:border-primary/50"
                                    }`}
                                >
                                  {r}
                                </button>
                              ))}

                              {/* Dedicated Project Admin Star Button */}
                              {(() => {
                                const projectAdminName =
                                  msg.attachment?.projectAdmin ||
                                  (msg.attachment?.projectId && projects.find((p) => p.id === msg.attachment?.projectId)?.author) ||
                                  (activeCommunity?.isCreatedByMe ? currentUser.name : "");

                                const isProjectAdmin = Boolean(
                                  isLoggedIn &&
                                  projectAdminName &&
                                  (currentUser.name.toLowerCase().trim() === projectAdminName.toLowerCase().trim() ||
                                    (currentUser.role === "faculty" && projectAdminName.includes("Faculty")) ||
                                    (activeCommunity?.isCreatedByMe && currentUser.name))
                                );

                                if (isProjectAdmin) {
                                  if (msg.adminStarred) {
                                    return (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                        <span className="material-symbols-outlined text-[13px] text-amber-400">verified</span>
                                        <span>⭐ Starred (+100 KP)</span>
                                      </span>
                                    );
                                  }
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => handleStarReaction(activeCommunity.id, msg)}
                                      className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/20 hover:from-amber-500/35 hover:to-yellow-500/30 border border-amber-400 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-md shadow-amber-500/10 hover:scale-105 transition-all cursor-pointer"
                                      title={`You are Project Admin (${projectAdminName}). Click to award +100 KP to ${msg.sender}`}
                                    >
                                      <span className="material-symbols-outlined text-[13px] text-amber-400 animate-pulse">star</span>
                                      <span>⭐ Star Contribution (+100 KP)</span>
                                    </button>
                                  );
                                }

                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleStarReaction(activeCommunity.id, msg)}
                                    className="px-2 py-0.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/30 hover:border-amber-400/40 text-[10px] font-mono text-on-surface-variant hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                                    title="React with ⭐ (Admin stars grant +100 KP)"
                                  >
                                    <span>⭐</span>
                                  </button>
                                );
                              })()}

                              {/* Quick Emoji Reaction Buttons: 🔥 and 🚀 */}
                              <button
                                type="button"
                                onClick={() => handleAddReaction(activeCommunity.id, msg.id, "🔥")}
                                className="px-1.5 py-0.5 rounded-full bg-surface-container-high/40 hover:bg-surface-container-high border border-outline-variant/20 hover:border-outline-variant/50 text-[10px] font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                                title="React 🔥"
                              >
                                🔥
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddReaction(activeCommunity.id, msg.id, "🚀")}
                                className="px-1.5 py-0.5 rounded-full bg-surface-container-high/40 hover:bg-surface-container-high border border-outline-variant/20 hover:border-outline-variant/50 text-[10px] font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                                title="React 🚀"
                              >
                                🚀
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat Bottom Input Bar */}
                  <div className="p-3 sm:p-4 border-t border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur-md">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={chatFileInputRef}
                      onChange={handleFileSelected}
                      className="hidden"
                    />

                    {/* Pending Attachment Preview Pill */}
                    {pendingAttachment && (
                      <div className="flex items-center justify-between p-2.5 mb-2.5 rounded-xl bg-surface-container-high/80 border border-primary/40 text-xs font-mono shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-primary/20 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[15px]">attach_file</span>
                          </div>
                          <span className="font-bold text-on-surface truncate">{pendingAttachment.name}</span>
                          <span className="text-on-surface-variant text-[10px] shrink-0">({pendingAttachment.size})</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-semibold truncate shrink-0">
                            ⚡ {pendingAttachment.projectTitle} (Admin: {pendingAttachment.projectAdmin})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingAttachment(null)}
                          className="w-6 h-6 rounded-md bg-surface-container-highest hover:bg-error/20 hover:text-error text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                          title="Remove attachment"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => chatFileInputRef.current?.click()}
                        className={`p-2 rounded-xl transition-all cursor-pointer flex-shrink-0 flex items-center justify-center ${pendingAttachment
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                          }`}
                        title="Upload File from Device"
                      >
                        <span className="material-symbols-outlined text-[18px]">attach_file</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currentPrj = getProjectForChat(selectedCommunityId);
                          let defaultFileName = "project_contribution_patch.diff";
                          let defaultFileSize = "14.2 KB";
                          let defaultFileType: ChatAttachment["type"] = "code";

                          if (currentPrj.id === "PRJ-082") {
                            defaultFileName = "synapse_core_microkernel_patch.diff";
                            defaultFileSize = "18.4 KB";
                            defaultFileType = "code";
                          } else if (currentPrj.id === "PRJ-104") {
                            defaultFileName = "chronograph_gnn_weights.safetensors";
                            defaultFileSize = "12.8 MB";
                            defaultFileType = "archive";
                          } else if (currentPrj.id === "PRJ-140") {
                            defaultFileName = "zerogrid_recursive_circuit.circom";
                            defaultFileSize = "9.4 KB";
                            defaultFileType = "code";
                          } else if (currentPrj.id === "PRJ-119") {
                            defaultFileName = "vectortriton_training_patch.py";
                            defaultFileSize = "14.2 KB";
                            defaultFileType = "code";
                          } else {
                            defaultFileName = `${currentPrj.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_artifact.diff`;
                          }

                          setAttachForm({
                            fileName: defaultFileName,
                            fileSize: defaultFileSize,
                            fileType: defaultFileType,
                            projectId: currentPrj.id,
                            projectTitle: currentPrj.title,
                            projectAdmin: currentPrj.author || "Aarav Sharma",
                            customNote: "",
                          });
                          setIsAttachModalOpen(true);
                        }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-primary border border-outline-variant/30 text-xs font-mono transition-colors cursor-pointer shrink-0"
                        title="Share Project Contribution"
                      >
                        <span className="material-symbols-outlined text-[15px]">source</span>
                        <span>Share Project</span>
                      </button>

                      <div className="flex-1 relative flex items-center">
                        <input
                          type="text"
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          placeholder={
                            pendingAttachment
                              ? `Add a comment for ${pendingAttachment.name}...`
                              : isDm && activeDmPeer
                                ? `Message @${activeDmPeer.name} (Direct Message)...`
                                : `Message #${activeCommunity ? activeCommunity.name : "community"}...`
                          }
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setNewMessageText((prev) => prev + " 🚀 ")}
                          className="absolute right-3 text-on-surface-variant hover:text-primary transition-colors"
                          title="Insert Emoji"
                        >
                          <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={!newMessageText.trim() && !pendingAttachment}
                        className="p-2.5 rounded-xl bg-primary text-on-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-fixed transition-all flex items-center justify-center cursor-pointer shadow-xs flex-shrink-0"
                        title="Send Message"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW 4: PROJECTS */}
        {viewPath === "projects" && (() => {
          const myProjects = projects.filter((p) => p.isCreatedByMe);
          const otherProjects = projects.filter((p) => !p.isCreatedByMe);

          const displayedProjects = projects
            .filter((p) => {
              if (projectTab === "created") return Boolean(p.isCreatedByMe);
              if (projectTab === "discover") return !p.isCreatedByMe;
              return true;
            })
            .filter((p) => projectFilter === "all" || p.filterKey === projectFilter);

          return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-[1700px] mx-auto flex flex-col gap-8 animate-in fade-in duration-300">
              {/* Top Banner */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-6">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-primary mb-2">
                    <span>// STREAM ARCHIVE</span>
                    <span>•</span>
                    <span>{projects.length} PROTOTYPES LIVE</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{myProjects.length} Created by You</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-5xl font-semibold text-on-surface">
                    Venture & Projects Directory
                  </h1>
                  <p className="text-on-surface-variant text-sm sm:text-base mt-2 max-w-2xl font-light">
                    Peer-built open-source repositories and collegiate ventures actively onboarding co-founders.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="px-5 py-2.5 bg-[#1e3a5f] hover:bg-[#152a45] text-white shadow-sm rounded-xl font-display font-bold text-xs flex items-center gap-2 shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>+ Add New Project</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePath("home")}
                    className="px-4 py-2 bg-surface-container-high border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Overview</span>
                  </button>
                </div>
              </div>

              {/* Main 2-Column Layout */}
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* ================= LEFT SIDEBAR (TWO HEADINGS) ================= */}
                <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 flex-shrink-0 lg:sticky lg:top-24">
                  {/* HEADING 1: PROJECTS WE CREATED */}
                  <div
                    className={`rounded-2xl border transition-all shadow-xl overflow-hidden ${projectTab === "created"
                        ? "bg-surface-container-low border-primary/60 shadow-xs border-[#1e3a5f]"
                        : "bg-surface-container-lowest/80 border-outline-variant/30 hover:border-outline-variant/60"
                      }`}
                  >
                    {/* Heading Bar with Dropdown Toggle */}
                    <div
                      onClick={() => {
                        setProjectTab("created");
                        setProjectFilter("all");
                        setIsMyProjectsDropdownOpen((prev) => !prev);
                      }}
                      className="p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer hover:bg-surface-container-high/30 select-none group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary flex-shrink-0 shadow-lg">
                          <span className="material-symbols-outlined text-[20px]">folder_managed</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest block truncate">
                            [01] // PORTFOLIO
                          </span>
                          <h2 className="font-display font-bold text-base text-on-surface truncate">
                            My Created Projects
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-mono text-[11px] font-bold">
                          {myProjects.length}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMyProjectsDropdownOpen((prev) => !prev);
                          }}
                          className="w-8 h-8 rounded-xl apple-liquid-glass apple-liquid-glass-neutral hover:apple-liquid-glass-primary flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer shadow-sm"
                          title={isMyProjectsDropdownOpen ? "Collapse details" : "Expand details"}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isMyProjectsDropdownOpen ? "rotate-180" : ""
                              }`}
                          >
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Dropdown Menu for Details */}
                    {isMyProjectsDropdownOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-outline-variant/20 flex flex-col gap-3 animate-in fade-in duration-200">
                        <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                          Ventures, protocols, and repositories published and owned by you. Manage team requirements and view applicants.
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setProjectTab("created");
                            setProjectFilter("all");
                          }}
                          className={`w-full py-2.5 px-3.5 rounded-xl font-mono text-xs flex items-center justify-between transition-all cursor-pointer ${projectTab === "created"
                              ? "bg-primary text-on-primary font-bold shadow-md"
                              : "bg-surface-container-high/70 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            <span>View My Projects ({myProjects.length})</span>
                          </div>
                          <span className="material-symbols-outlined text-[16px]">
                            {projectTab === "created" ? "check_circle" : "arrow_forward"}
                          </span>
                        </button>

                        {/* Quick List of Created Projects if any */}
                        {myProjects.length > 0 && (
                          <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/20">
                            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                              Your Active Ventures:
                            </span>
                            {myProjects.map((mp) => (
                              <div
                                key={mp.id}
                                onClick={() => {
                                  setProjectTab("created");
                                  setSelectedProjectForDetail(mp);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-surface-container-high/40 hover:bg-surface-container-high border border-outline-variant/20 flex items-center justify-between text-xs font-mono text-on-surface transition-colors cursor-pointer group"
                              >
                                <span className="truncate group-hover:text-primary font-medium">
                                  {mp.title}
                                </span>
                                <span className="text-[10px] text-primary font-bold flex-shrink-0">
                                  {mp.id}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setIsCreateProjectOpen(true)}
                          className="mt-1 w-full py-2 px-3 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-primary/10 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          <span>+ Add Another Project</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* HEADING 2: DISCOVERING OTHERS' PROJECTS */}
                  <div
                    className={`rounded-2xl border transition-all shadow-xl overflow-hidden ${projectTab === "discover"
                        ? "bg-surface-container-low border-secondary/60 shadow-xs border-[#bc9970]"
                        : "bg-surface-container-lowest/80 border-outline-variant/30 hover:border-outline-variant/60"
                      }`}
                  >
                    {/* Heading Bar with Dropdown Toggle */}
                    <div
                      onClick={() => {
                        setProjectTab("discover");
                        setProjectFilter("all");
                        setIsDiscoverDropdownOpen((prev) => !prev);
                      }}
                      className="p-4 sm:p-5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer hover:bg-surface-container-high/30 select-none group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl apple-liquid-glass apple-liquid-glass-secondary flex items-center justify-center text-secondary flex-shrink-0 shadow-lg">
                          <span className="material-symbols-outlined text-[20px]">travel_explore</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] text-secondary font-bold uppercase tracking-widest block truncate">
                            [02] // NETWORK
                          </span>
                          <h2 className="font-display font-bold text-base text-on-surface truncate">
                            Discover Others' Projects
                          </h2>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary/20 border border-secondary/40 text-secondary font-mono text-[11px] font-bold">
                          {otherProjects.length} Live
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDiscoverDropdownOpen((prev) => !prev);
                          }}
                          className="w-8 h-8 rounded-xl apple-liquid-glass apple-liquid-glass-neutral hover:apple-liquid-glass-secondary flex items-center justify-center text-on-surface-variant hover:text-secondary transition-all cursor-pointer shadow-sm"
                          title={isDiscoverDropdownOpen ? "Collapse details" : "Expand details"}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isDiscoverDropdownOpen ? "rotate-180" : ""
                              }`}
                          >
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Dropdown Menu for Details */}
                    {isDiscoverDropdownOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-outline-variant/20 flex flex-col gap-3 animate-in fade-in duration-200">
                        <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                          Explore peer repositories, hardware schematics, and startups across global research nodes seeking co-founders.
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setProjectTab("discover");
                            setProjectFilter("all");
                          }}
                          className={`w-full py-2.5 px-3.5 rounded-xl font-mono text-xs flex items-center justify-between transition-all cursor-pointer ${projectTab === "discover" && projectFilter === "all"
                              ? "bg-secondary text-on-secondary font-bold shadow-md"
                              : "bg-surface-container-high/70 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">public</span>
                            <span>All Network Projects ({otherProjects.length})</span>
                          </div>
                          <span className="material-symbols-outlined text-[16px]">
                            {projectTab === "discover" && projectFilter === "all" ? "check_circle" : "arrow_forward"}
                          </span>
                        </button>

                        {/* Stage Categories Under Discover */}
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/20 font-mono text-xs">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                            Filter by Stage:
                          </span>
                          {[
                            { id: "alpha", label: "Alpha Prototypes", icon: "terminal" },
                            { id: "pre-seed", label: "Pre-Seed Backed", icon: "payments" },
                            { id: "grant", label: "Grant Funded", icon: "military_tech" },
                            { id: "ideation", label: "Ideation Stage", icon: "lightbulb" },
                          ].map((stg) => {
                            const count = otherProjects.filter((p) => p.filterKey === stg.id).length;
                            const isSelected = projectTab === "discover" && projectFilter === stg.id;
                            return (
                              <button
                                key={stg.id}
                                type="button"
                                onClick={() => {
                                  setProjectTab("discover");
                                  setProjectFilter(stg.id);
                                }}
                                className={`py-2 px-3 rounded-xl text-left text-xs flex items-center justify-between transition-all cursor-pointer ${isSelected
                                    ? "bg-secondary/20 border border-secondary/50 text-secondary font-bold"
                                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                                  }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-6 h-6 rounded-lg apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center text-on-surface shadow-xs">
                                    <span className="material-symbols-outlined text-[13px]">{stg.icon}</span>
                                  </div>
                                  <span>{stg.label}</span>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container-highest">
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* View All Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setProjectTab("all");
                            setProjectFilter("all");
                          }}
                          className={`w-full mt-1 py-2 px-3 rounded-xl text-xs font-mono transition-colors cursor-pointer text-center ${projectTab === "all"
                              ? "bg-surface-container-highest text-primary font-bold border border-primary/30"
                              : "text-on-surface-variant hover:text-on-surface bg-surface-container-high/40"
                            }`}
                        >
                          View All Combined ({projects.length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= RIGHT MAIN AREA: PROJECT CARDS STREAM ================= */}
                <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
                  {/* Tab Switcher & Active Filter Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-lg text-on-surface">
                        {projectTab === "created"
                          ? "📁 My Created Projects"
                          : projectTab === "discover"
                            ? "🌐 Discover Others' Projects"
                            : "⚡ All Collegiate Projects"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[11px] font-bold">
                        {displayedProjects.length}
                      </span>
                    </div>

                    {/* Quick View Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setProjectTab("created")}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${projectTab === "created"
                            ? "bg-primary text-on-primary font-bold shadow-sm"
                            : "bg-surface-container-high/50 text-on-surface-variant hover:text-on-surface"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">folder_managed</span>
                        <span>Created by Me ({myProjects.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProjectTab("discover")}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${projectTab === "discover"
                            ? "bg-secondary text-on-secondary font-bold shadow-sm"
                            : "bg-surface-container-high/50 text-on-surface-variant hover:text-on-surface"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">travel_explore</span>
                        <span>Discover ({otherProjects.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProjectTab("all");
                          setProjectFilter("all");
                        }}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${projectTab === "all"
                            ? "bg-surface-container-highest text-primary font-bold border border-primary/40"
                            : "bg-surface-container-high/50 text-on-surface-variant hover:text-on-surface"
                          }`}
                      >
                        All ({projects.length})
                      </button>
                    </div>
                  </div>

                  {/* Projects Grid or Empty State */}
                  {displayedProjects.length === 0 ? (
                    <div className="p-12 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/40 text-center flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[32px]">
                          {projectTab === "created" ? "add_business" : "search_off"}
                        </span>
                      </div>
                      <div className="max-w-md">
                        <h3 className="font-display font-bold text-lg text-on-surface">
                          {projectTab === "created"
                            ? "No Projects Created Yet"
                            : "No Discoveries Match Your Filter"}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                          {projectTab === "created"
                            ? "Publish your venture, prototype, or research repository to begin recruiting co-founders and contributors across verified campuses."
                            : "Try selecting 'All Stages' or browse other categories."}
                        </p>
                      </div>
                      {projectTab === "created" && (
                        <button
                          type="button"
                          onClick={() => setIsCreateProjectOpen(true)}
                          className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs shadow-xs hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          <span>+ Create Your First Project</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayedProjects.map((prj) => (
                        <div
                          key={prj.id}
                          className={`p-7 rounded-2xl border flex flex-col justify-between gap-6 transition-all shadow-xl group relative overflow-hidden ${prj.isCreatedByMe
                              ? "bg-surface-container-low border-primary/40 hover:border-primary shadow-[0_4px_20px_rgba(30,58,95,0.06)]"
                              : "bg-surface-container-low border-outline-variant/40 hover:border-secondary/50"
                            }`}
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-mono text-xs text-primary font-medium">
                                [{prj.id}] • {prj.campuses}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                                  {prj.tag}
                                </span>
                                {prj.isCreatedByMe ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-mono text-[9px] font-bold flex items-center gap-1 shadow-sm">
                                    <span className="material-symbols-outlined text-[11px]">star</span>
                                    CREATED BY YOU
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary font-mono text-[9px] font-bold">
                                    DISCOVERY
                                  </span>
                                )}
                                {prj.needsInvestment && (
                                  <span className="px-2.5 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-mono text-[9px] font-bold flex items-center gap-1 shadow-xs">
                                    <span className="material-symbols-outlined text-[11px]">payments</span>
                                    <span>INVESTMENT OPEN</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-display text-2xl font-bold text-on-surface group-hover:text-primary transition-colors">
                                {prj.title}
                              </h3>
                              {prj.author && (
                                <span className="font-mono text-[11px] text-on-surface-variant/80">
                                  Founder: {prj.author} ({prj.authorCampus || "Verified Member"})
                                </span>
                              )}
                            </div>

                            {/* Prominent Expected Investment Banner on Card */}
                            {prj.needsInvestment && (
                              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/35 flex items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-emerald-300 shadow-xs">
                                    <span className="material-symbols-outlined text-[16px]">payments</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 tracking-wider">
                                      Expected Investment
                                    </span>
                                    <span className="font-display text-sm font-bold text-emerald-200">
                                      {prj.investmentGoal || (prj.expectedInvestment ? `$${Number(prj.expectedInvestment).toLocaleString()}` : "$50,000")}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right font-mono text-[10px]">
                                  <span className="text-on-surface-variant block text-[9px]">Investor Share</span>
                                  <span className="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                                    0.001 × % Share
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Detailed Description */}
                            <p className="text-on-surface-variant text-sm leading-relaxed">
                              {prj.detailDescription || prj.desc}
                            </p>

                            {/* Requirements of Project */}
                            <div className="p-4 rounded-xl bg-surface-container-highest/60 border border-primary/25 flex flex-col gap-1.5 shadow-inner">
                              <div className="flex items-center gap-2 text-primary font-mono text-[11px] font-bold uppercase tracking-wider">
                                <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-[12px] shadow-xs">
                                  <span className="material-symbols-outlined text-[13px]">fact_check</span>
                                </div>
                                <span>Project Requirements & Needs</span>
                              </div>
                              <p className="text-on-surface text-xs leading-relaxed font-mono whitespace-pre-wrap">
                                {prj.requirements}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/20">
                            <div className="flex items-center justify-between font-mono text-xs flex-wrap gap-2">
                              <span className="text-on-surface-variant">Stack: {prj.stack}</span>
                              {prj.isCreatedByMe && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProject(prj.id, prj.title)}
                                  className="text-error hover:bg-error/15 px-2 py-1 rounded-lg transition-colors text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
                                  title="Delete this project"
                                >
                                  <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-rose flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[13px]">delete</span>
                                  </div>
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-2">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setSelectedProjectForDetail(prj)}
                                  className="text-xs font-mono text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[13px]">visibility</span>
                                  </div>
                                  <span>Overview</span>
                                </button>
                                {(prj.isCreatedByMe ||
                                  (prj.author && currentUser?.name && prj.author.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) ||
                                  currentUser?.role === "faculty") && (
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadProject(prj)}
                                      className="text-xs font-mono text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                                      title="Download project specification & assets (Admin Only)"
                                    >
                                      <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-[13px]">download</span>
                                      </div>
                                      <span>Download</span>
                                    </button>
                                  )}
                              </div>

                              {prj.isCreatedByMe ? (
                                <button
                                  type="button"
                                  onClick={() => setReviewingProjectRequests(prj)}
                                  className="px-3.5 py-1.5 rounded-xl border font-display font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] bg-primary/20 hover:bg-primary/30 border-primary/50 text-primary shadow-sm"
                                  title="View applicants, student biodata, GitHub & LinkedIn profiles"
                                >
                                  <div className="w-6 h-6 rounded-lg apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center shadow-xs">
                                    <span className="material-symbols-outlined text-[14px]">group</span>
                                  </div>
                                  <span>Joining Requests</span>
                                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-mono text-[10px] font-bold">
                                    {projectRequests.filter((r) => r.projectId === prj.id).length}
                                  </span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => setApplyingProject(prj)}
                                    className="px-3.5 py-1.5 rounded-xl border font-display font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] bg-secondary/20 hover:bg-secondary/30 border-secondary/40 text-secondary shadow-sm"
                                    title="Apply to join this project with your biodata, GitHub, and LinkedIn"
                                  >
                                    <div className="w-6 h-6 rounded-lg apple-liquid-glass apple-liquid-glass-secondary flex items-center justify-center shadow-xs">
                                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                                    </div>
                                    <span>Join Project</span>
                                  </button>

                                  {prj.needsInvestment && (
                                    <button
                                      type="button"
                                      onClick={() => setInvestingProject(prj)}
                                      className="px-3.5 py-1.5 rounded-xl border font-display font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300 shadow-sm"
                                      title="Pledge investment in this project"
                                    >
                                      <div className="w-6 h-6 rounded-lg apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center shadow-xs">
                                        <span className="material-symbols-outlined text-[14px]">payments</span>
                                      </div>
                                      <span>Invest</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW 5: RESOURCES BY FACULTY */}
        {viewPath === "investment" && (
          <div className="w-full px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-8">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-2 flex-wrap">
                  <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-[11px] shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">auto_stories</span>
                  </div>
                  <span>// ACADEMIC & RESEARCH INFRASTRUCTURE</span>
                  <span>•</span>
                  <span>{resourcesList.length} FACULTY LABS ALLOCATED</span>
                  {isLoggedIn && currentUser.role === "faculty" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">school</span>
                      FACULTY PI PRIVILEGES
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-on-surface tracking-tight">
                  Resources by Faculty
                </h1>
                <p className="text-on-surface-variant text-base mt-2 max-w-2xl font-light">
                  Direct access to faculty-sponsored supercomputing clusters, nanofabrication cleanrooms, biotechnology wet labs, and collegiate research allocations.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
                {isLoggedIn && currentUser.role === "faculty" && (
                  <button
                    type="button"
                    onClick={() => setIsCreateResourceOpen(true)}
                    className="px-4 py-2.5 bg-[#c2593f] hover:bg-[#a94a32] text-white rounded-xl text-xs font-medium transition-all flex items-center gap-2 shadow-sm border border-[#a94a32]/20 hover:scale-[1.01] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Post Resource Opening</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActivePath("home")}
                  className="px-4 py-2 bg-surface-container-high border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface hover:text-emerald-400 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center">
                    <span className="material-symbols-outlined text-[13px]">arrow_back</span>
                  </div>
                  <span>Back to Overview</span>
                </button>
              </div>
            </div>

            {(() => {
              const filteredResources = resourcesList.filter((res) => {
                const matchesBranch = resourceBranch === "all" || res.branch === resourceBranch;
                if (!matchesBranch) return false;
                if (!resourceSearch.trim()) return true;
                const query = resourceSearch.toLowerCase().trim();
                return (
                  res.title.toLowerCase().includes(query) ||
                  res.desc.toLowerCase().includes(query) ||
                  res.category.toLowerCase().includes(query) ||
                  (res.branchLabel && res.branchLabel.toLowerCase().includes(query)) ||
                  (res.facultyLead && res.facultyLead.toLowerCase().includes(query))
                );
              });

              const activeBranchObj = BRANCH_FILTERS.find((b) => b.id === resourceBranch) || BRANCH_FILTERS[0];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* LEFT COLUMN: Branch Filter Buttons */}
                  <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-4 lg:sticky lg:top-24">
                    <div className="flex items-center justify-between pb-1 border-b border-outline-variant/30">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-emerald-400">filter_alt</span>
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
                          Filter by Branch
                        </span>
                      </div>
                      {(resourceBranch !== "all" || resourceSearch.trim()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setResourceBranch("all");
                            setResourceSearch("");
                          }}
                          className="font-mono text-[10px] text-emerald-400 hover:underline cursor-pointer font-semibold"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>

                    {/* Search Input Box */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60">
                        search
                      </span>
                      <input
                        type="text"
                        value={resourceSearch}
                        onChange={(e) => setResourceSearch(e.target.value)}
                        placeholder="Search equipment, labs, instruments..."
                        className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl pl-9 pr-8 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                      {resourceSearch && (
                        <button
                          type="button"
                          onClick={() => setResourceSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs font-mono"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Branch Filter Buttons List */}
                    <div className="flex flex-col gap-2.5">
                      {BRANCH_FILTERS.map((b) => {
                        const count = b.id === "all"
                          ? resourcesList.length
                          : resourcesList.filter((r) => r.branch === b.id).length;
                        const isSelected = resourceBranch === b.id;

                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setResourceBranch(b.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group relative overflow-hidden ${isSelected
                                ? "bg-emerald-500/15 border-emerald-400 text-on-surface shadow-xs"
                                : "bg-surface-container-low border-outline-variant/40 hover:border-outline-variant/70 hover:bg-surface-container-high/50 text-on-surface-variant hover:text-on-surface"
                              }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm ${isSelected
                                  ? "apple-liquid-glass apple-liquid-glass-emerald text-emerald-300"
                                  : "bg-surface-container-high text-on-surface-variant border border-outline-variant/30"
                                }`}>
                                <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className={`font-display text-sm font-bold truncate transition-colors ${isSelected ? "text-emerald-300" : "text-on-surface group-hover:text-primary"
                                  }`}>
                                  {b.label}
                                </div>
                                <div className="font-mono text-[10px] text-on-surface-variant truncate">
                                  {b.sublabel}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${isSelected
                                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/40"
                                  : "bg-surface-container-high text-on-surface-variant"
                                }`}>
                                {count}
                              </span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                                  check_circle
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Faculty Lab PI Action Card */}
                    {isLoggedIn && currentUser.role === "faculty" && (
                      <div className="p-4 rounded-2xl bg-white border border-[#e2eaf2] flex flex-col gap-2.5 mt-1 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[#1e3a5f] font-mono text-xs font-bold uppercase">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                            <span>Faculty Lab PI</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]">
                            VERIFIED PI
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          Open your benches, supercomputing clusters, or instruments to student research teams.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsCreateResourceOpen(true)}
                          className="w-full py-2 bg-[#c2593f] hover:bg-[#a94a32] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-[#a94a32]/20"
                        >
                          <span className="material-symbols-outlined text-[15px]">add_circle</span>
                          <span>+ Post Resource Opening</span>
                        </button>
                      </div>
                    )}

                    {/* Infrastructure Info Note */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-surface-container-high/40 to-transparent border border-emerald-500/20 flex flex-col gap-2 mt-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                        <span className="material-symbols-outlined text-[15px]">verified_user</span>
                        Allocation Protocol
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        Departmental facilities and instrumentation benches are apportioned on a rolling sprint cycle based on project milestone verification and lab capacity.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Filtered Resources Directory Grid */}
                  <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-5">
                    {/* Active Filter Header Bar */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-mono text-xs text-on-surface">
                          Showing <span className="font-bold text-emerald-300">{filteredResources.length}</span> {filteredResources.length === 1 ? "facility" : "facilities"} in{" "}
                          <span className="font-bold text-on-surface underline decoration-emerald-400/60">{activeBranchObj.label}</span>
                        </span>
                      </div>
                      {resourceBranch !== "all" && (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-emerald font-mono text-[10px] text-emerald-300 font-bold flex items-center gap-1.5">
                            <span>{activeBranchObj.label}</span>
                            <button
                              type="button"
                              onClick={() => setResourceBranch("all")}
                              className="hover:text-white cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Resources Grid or Empty State */}
                    {filteredResources.length === 0 ? (
                      <div className="p-12 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-14 h-14 rounded-2xl apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-[30px]">search_off</span>
                        </div>
                        <div className="flex flex-col gap-1 max-w-md">
                          <h4 className="font-display text-lg font-bold text-on-surface">No Facilities Found</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed">
                            No faculty facilities or instruments match your current branch or search query. Try clearing the search or selecting another branch.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setResourceBranch("all");
                            setResourceSearch("");
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold hover:bg-emerald-500/30 transition-all cursor-pointer"
                        >
                          Show All Facilities
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredResources.map((res) => (
                          <div
                            key={res.id}
                            className="p-7 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col justify-between gap-6 shadow-xl hover:border-emerald-500/50 transition-all group animate-in fade-in duration-200"
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-mono text-xs text-emerald-400 font-medium">
                                  [{res.id}] • {res.branchLabel.toUpperCase()}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold apple-liquid-glass ${res.statusColor === "emerald"
                                    ? "apple-liquid-glass-emerald text-emerald-300"
                                    : res.statusColor === "rose"
                                      ? "apple-liquid-glass-rose text-rose-300"
                                      : res.statusColor === "secondary"
                                        ? "apple-liquid-glass-secondary text-secondary"
                                        : "apple-liquid-glass-primary text-primary"
                                  }`}>
                                  {res.status}
                                </span>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl apple-liquid-glass ${res.iconGlass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                  <span className="material-symbols-outlined text-[20px]">{res.icon}</span>
                                </div>
                                <div>
                                  <h3 className="font-display text-xl font-bold text-on-surface group-hover:text-emerald-400 transition-colors">
                                    {res.title}
                                  </h3>
                                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant mt-0.5 flex-wrap">
                                    <span className="font-medium">{res.facultyLead}</span>
                                    <span className="text-[10px] opacity-40">•</span>
                                    <a
                                      href={`mailto:${getFacultyEmail(res)}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[11px] text-emerald-400/90 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors"
                                      title={`Email ${res.facultyLead}`}
                                    >
                                      <span className="material-symbols-outlined text-[12px]">mail</span>
                                      <span>{getFacultyEmail(res)}</span>
                                    </a>
                                  </div>
                                  <p className="font-mono text-[10px] text-on-surface-variant/70">
                                    {res.campus}
                                  </p>
                                </div>
                              </div>

                              <p className="text-on-surface-variant text-xs leading-relaxed">
                                {res.desc}
                              </p>

                              <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex flex-col gap-1 text-xs">
                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-semibold uppercase">
                                  <span className="material-symbols-outlined text-[12px]">dataset</span>
                                  <span>Allocation Specs</span>
                                </div>
                                <span className="text-on-surface font-mono text-[11px]">
                                  {res.allocation}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/30">
                              <span className="font-mono text-[10px] text-on-surface-variant">
                                Eligibility: {res.eligibility}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const facultyEmail = getFacultyEmail(res);
                                  const subject = encodeURIComponent(
                                    `[ALCON Allocation Request] ${res.title} (${res.id})`
                                  );
                                  const body = encodeURIComponent(
                                    `Respected ${res.facultyLead},\n\nI am writing to formally request a collegiate laboratory and equipment allocation for "${res.title}" at ${res.campus}.\n\nApplicant Details:\n- Name: ${currentUser.name}\n- Campus / Affiliation: ${currentUser.campus}\n- Degree / Role: ${currentUser.degreeOrTitle} (${currentUser.classYearOrRank})\n- Verified Karma Score: ${currentUser.kp}\n- Student / Research Node ID: ${currentUser.nodeId}\n\nProject Scope & Proposed Use:\n- Resource ID: ${res.id}\n- Facility / Equipment: ${res.title}\n- Allocation Requested: ${res.allocation}\n- Discipline Category: ${res.category}\n- Collegiate Eligibility: ${res.eligibility}\n\nLooking forward to your review and collegiate lab coordination.\n\nSincerely,\n${currentUser.name}\n${currentUser.email ? `Email: ${currentUser.email}\n` : ""}`
                                  );
                                  showToast(
                                    `Redirecting to email ${facultyEmail}... Request draft prepared for ${res.facultyLead}.`
                                  );
                                  window.location.href = `mailto:${facultyEmail}?subject=${subject}&body=${body}`;
                                }}
                                className="w-full py-2.5 apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold rounded-xl hover:scale-[1.01] transition-all text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[15px]">mail</span>
                                <span>Request Faculty Allocation</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* MODAL: CREATE FACULTY RESOURCE OPENING */}
            {isCreateResourceOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-surface-container-lowest/95 border border-outline-variant/50 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec] shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">
                          precision_manufacturing
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#1e3a5f]">
                          FACULTY LAB & INFRASTRUCTURE ALLOCATION
                        </span>
                        <h2 className="font-display text-xl font-bold text-on-surface">
                          Post New Resource Opening
                        </h2>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreateResourceOpen(false)}
                      className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  {/* Faculty Host Identity Pill */}
                  <div className="p-3.5 rounded-xl bg-[#f8fafd] border border-[#d2dfec] flex flex-col gap-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[#1e3a5f] font-semibold">Faculty PI Host:</span>
                        <span className="text-on-surface font-bold">{currentUser.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]">
                          {currentUser.role}
                        </span>
                      </div>
                      <span className="text-on-surface-variant text-[11px]">
                        {currentUser.departmentOrLab || currentUser.campus}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#1e3a5f]/80 pt-1 border-t border-[#d2dfec] flex-wrap">
                      <span className="material-symbols-outlined text-[13px]">mail</span>
                      <span>Applicants will be redirected to email you at:</span>
                      <span className="text-[#1e3a5f] font-bold">{currentUser.email || getFacultyEmail({ facultyLead: currentUser.name, campus: currentUser.campus })}</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleCreateResourceSubmit} className="flex flex-col gap-4">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-on-surface-variant uppercase flex items-center justify-between">
                        <span>Facility / Instrument Opening Title</span>
                        <span className="text-[10px] text-[#1e3a5f]">Required</span>
                      </label>
                      <input
                        className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-[#1e3a5f] transition-colors"
                        placeholder="e.g. High-Density FPGA Emulation & Neuromorphic Testbed"
                        value={newResourceForm.title}
                        onChange={(e) => setNewResourceForm({ ...newResourceForm, title: e.target.value })}
                        required
                        type="text"
                      />
                    </div>

                    {/* Branch & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Academic Discipline / Branch
                        </label>
                        <select
                          className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:border-[#1e3a5f] transition-colors cursor-pointer"
                          value={newResourceForm.branch}
                          onChange={(e) => {
                            const selectedBranch = e.target.value;
                            const defIcons: Record<string, string> = {
                              electrical: "electrical_services",
                              cs: "memory",
                              robotics: "smart_toy",
                              mechanical: "rocket_launch",
                              biotech: "biotech",
                            };
                            setNewResourceForm({
                              ...newResourceForm,
                              branch: selectedBranch,
                              icon: defIcons[selectedBranch] || "dataset",
                            });
                          }}
                        >
                          <option value="electrical">Electrical & Instruments</option>
                          <option value="cs">Computer Science & AI</option>
                          <option value="robotics">Robotics & Mechatronics</option>
                          <option value="mechanical">Mechanical & Aerospace</option>
                          <option value="biotech">Biotech & Biomedical</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Category / Equipment Type
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-[#1e3a5f] transition-colors"
                          placeholder="e.g. ACCELERATOR HARDWARE, RF & INSTRUMENTATION"
                          value={newResourceForm.category}
                          onChange={(e) => setNewResourceForm({ ...newResourceForm, category: e.target.value })}
                          type="text"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-on-surface-variant uppercase">
                        Facility Equipment & Capabilities Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg p-3 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-[#1e3a5f] transition-colors resize-none"
                        placeholder="Detail the hardware specs, lab setup, laser/optics gear, cleanroom level, or supercomputing accelerators available..."
                        value={newResourceForm.desc}
                        onChange={(e) => setNewResourceForm({ ...newResourceForm, desc: e.target.value })}
                        required
                      />
                    </div>

                    {/* Allocation Specs & Bench Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Allocation Specs / Time Apportioned
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-[#1e3a5f] transition-colors"
                          placeholder="e.g. 15 test hours/week + automated data logging"
                          value={newResourceForm.allocation}
                          onChange={(e) => setNewResourceForm({ ...newResourceForm, allocation: e.target.value })}
                          required
                          type="text"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Status / Capacity Badge
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-[#1e3a5f] transition-colors"
                          placeholder="e.g. 3 BENCHES OPEN, BOOKING ACTIVE"
                          value={newResourceForm.status}
                          onChange={(e) => setNewResourceForm({ ...newResourceForm, status: e.target.value })}
                          required
                          type="text"
                        />
                      </div>
                    </div>

                    {/* Eligibility & Icon */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Eligibility Criteria
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-[#1e3a5f] transition-colors"
                          placeholder="e.g. Open to enrolled students & research teams"
                          value={newResourceForm.eligibility}
                          onChange={(e) => setNewResourceForm({ ...newResourceForm, eligibility: e.target.value })}
                          type="text"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Display Icon
                        </label>
                        <select
                          className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:border-[#1e3a5f] transition-colors cursor-pointer"
                          value={newResourceForm.icon}
                          onChange={(e) => setNewResourceForm({ ...newResourceForm, icon: e.target.value })}
                        >
                          <option value="electrical_services">electrical_services (Electrical / Instruments)</option>
                          <option value="precision_manufacturing">precision_manufacturing (Cleanroom / Mechatronics)</option>
                          <option value="memory">memory (Supercomputing / H100)</option>
                          <option value="all_inclusive">all_inclusive (Quantum / Physics)</option>
                          <option value="bolt">bolt (Power Electronics / Energy)</option>
                          <option value="smart_toy">smart_toy (Robotics / UAVs)</option>
                          <option value="rocket_launch">rocket_launch (Aerospace / TVAC)</option>
                          <option value="air">air (Wind Tunnel / Fluidics)</option>
                          <option value="biotech">biotech (Bio-Design / Wet Lab)</option>
                          <option value="microbiology">microbiology (Cryo-EM / Imaging)</option>
                          <option value="terminal">terminal (RISC-V / Software Clusters)</option>
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreateResourceOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-mono transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingResource}
                        className="px-6 py-2.5 rounded-xl bg-[#c2593f] hover:bg-[#a94a32] text-white font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingResource ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">add_circle</span>
                            <span>Publish Resource Opening</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: MENTOR */}
        {viewPath === "mentor" && (() => {
          const isMentor = isLoggedIn && (currentUser.role === "faculty" || currentUser.role === "alumni" || classesList.some((c) => c.instructorName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()));
          const canCreateClass = isMentor;
          const enrolledClassesList = classesList.filter((c) => !!joinedClasses[c.id]);
          const myTeachingClasses = classesList.filter((c) => {
            const instr = (c.instructorName || "").toLowerCase().trim();
            const curr = (currentUser.name || "").toLowerCase().trim();
            if (instr === curr) return true;
            if (currentUser.role === "faculty" && (instr.includes("mathur") || instr.includes("alok") || curr.includes("mathur"))) return true;
            if (currentUser.role === "alumni" && (instr.includes("manish") || instr.includes("sharma") || curr.includes("manish"))) return true;
            return false;
          });
          const filteredClasses = classFilter === "all"
            ? classesList
            : classFilter === "enrolled"
              ? enrolledClassesList
              : classFilter === "teaching"
                ? myTeachingClasses
                : classesList.filter((c) => c.category === classFilter);

          return (
            <div className="w-full px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-8">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-primary mb-2 flex-wrap">
                    <span>// CAMPUS FACULTY & ALUMNI ROSTER</span>
                    <span>•</span>
                    <span>CAMPUS MASTERCLASSES</span>
                    {canCreateClass && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${currentUser.role === "faculty"
                          ? "bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]"
                          : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        }`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {currentUser.role === "faculty" ? "school" : "workspace_premium"}
                        </span>
                        CREATOR PRIVILEGES ({currentUser.role.toUpperCase()})
                      </span>
                    )}
                  </div>
                  <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-on-surface tracking-tight">
                    Masterclasses & Research Seminars
                  </h1>
                  <p className="text-on-surface-variant text-base mt-2 max-w-2xl font-light">
                    Join live interactive masterclasses and research seminars hosted by verified Faculty fellows and Alumni.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
                  <button
                    onClick={() => setActivePath("home")}
                    className="px-4 py-2 bg-surface-container-high border border-outline-variant/40 rounded-lg text-xs font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Back to Overview</span>
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT: FILTERS & CREATE BUTTON ON LEFT, CLASSES ON RIGHT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                {/* LEFT COLUMN: FILTERS & CREATE ACTION */}
                <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
                  {/* Host / Create Class Action Box */}
                  {canCreateClass ? (
                    <div className="p-5 rounded-2xl bg-white border border-[#e2eaf2] flex flex-col gap-4 shadow-sm relative overflow-hidden group">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${currentUser.role === "faculty"
                            ? "bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]"
                            : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                          }`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {currentUser.role === "faculty" ? "school" : "workspace_premium"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-display text-sm font-bold text-on-surface">
                            Host Open Class
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${currentUser.role === "faculty" ? "text-[#1e3a5f] bg-[#f0f4f9]" : "text-amber-300 bg-amber-500/20"
                            }`}>
                            {currentUser.role} Access
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        As verified {currentUser.role} of {currentUser.campus}, host live seminars, code labs, and research deep-dives for peers to discover.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setNewClassForm({
                              title: "",
                              category: "Distributed Systems & AI",
                              schedule: "Thursdays • 4:00 PM PST",
                              location: `${currentUser.campus} Node • Live Virtual Stream`,
                              description: "",
                              capacity: "50",
                              tags: "GPU • Triton • Systems",
                            });
                            setIsCreateClassOpen(true);
                          }}
                          className="flex-1 py-3 px-4 rounded-xl bg-[#c2593f] hover:bg-[#a94a32] text-white font-display text-xs font-semibold flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">add_circle</span>
                          <span>Create Class</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setClassFilter(classFilter === "teaching" ? "all" : "teaching")}
                          className={`py-3 px-3.5 rounded-xl font-display text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${classFilter === "teaching"
                              ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-xs"
                              : "bg-surface-container-high/80 hover:bg-surface-container-high border-outline-variant/40 text-on-surface"
                            }`}
                          title="Show your scheduled classes to give"
                        >
                          <span className="material-symbols-outlined text-[18px]">co_present</span>
                          <span>Your Classes</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-white/20 text-white">
                            {myTeachingClasses.length}
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col gap-2.5 text-xs font-mono text-on-surface-variant backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Faculty & Alumni Roster</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-on-surface-variant/80 font-sans">
                        Collegiate classes are hosted by verified Faculty and Alumni fellows. Select any topic and click Join Class to enroll.
                      </p>
                    </div>
                  )}

                  {/* Topic Filters Box */}
                  <div className="p-5 rounded-2xl bg-surface-container-lowest/90 border border-outline-variant/40 flex flex-col gap-4 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface">
                          Filter by Topic
                        </span>
                      </div>
                      {classFilter !== "all" && (
                        <button
                          type="button"
                          onClick={() => setClassFilter("all")}
                          className="text-[11px] font-mono text-primary hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {[
                        { key: "all", label: "All Topics", icon: "apps" },
                        ...(isMentor
                          ? [{ key: "teaching", label: "Your Classes (Teaching)", icon: "co_present" }]
                          : []),
                        { key: "enrolled", label: "My Enrollments", icon: "how_to_reg" },
                        { key: "Distributed Systems & AI", label: "Systems & AI", icon: "dns" },
                        { key: "Startups & Venture", label: "Startups & Venture", icon: "rocket_launch" },
                        { key: "AI & Machine Learning", label: "AI & ML", icon: "psychology" },
                        { key: "Hardware & Silicon", label: "Hardware", icon: "developer_board" },
                      ].map((tab) => {
                        const isActive = classFilter === tab.key;
                        const count = tab.key === "all"
                          ? classesList.length
                          : tab.key === "enrolled"
                            ? enrolledClassesList.length
                            : tab.key === "teaching"
                              ? myTeachingClasses.length
                              : classesList.filter((c) => c.category === tab.key).length;

                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setClassFilter(tab.key)}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer text-left ${isActive
                                ? tab.key === "enrolled"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 font-semibold shadow-sm"
                                  : tab.key === "teaching"
                                    ? "bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec] font-semibold shadow-xs"
                                    : "bg-primary/15 text-primary border border-primary/40 font-semibold shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 border border-transparent"
                              }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className={`material-symbols-outlined text-[16px] ${isActive
                                  ? tab.key === "enrolled"
                                    ? "text-emerald-400"
                                    : tab.key === "teaching"
                                      ? "text-[#1e3a5f]"
                                      : "text-primary"
                                  : "text-on-surface-variant/70"
                                }`}>
                                {tab.icon}
                              </span>
                              <span className="truncate">{tab.label}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isActive
                                ? tab.key === "enrolled"
                                  ? "bg-emerald-400 text-black font-bold"
                                  : tab.key === "teaching"
                                    ? "bg-[#1e3a5f] text-white font-bold"
                                    : "bg-primary text-on-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                              }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mentor Teaching Classes Status Card - Interactive Filter */}
                  {isMentor && (
                    <button
                      type="button"
                      onClick={() => setClassFilter(classFilter === "teaching" ? "all" : "teaching")}
                      className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono transition-all cursor-pointer text-left w-full group ${classFilter === "teaching"
                          ? "bg-white border-[#1e3a5f] shadow-xs"
                          : "bg-surface-container-low/40 border-outline-variant/30 hover:border-[#cbd7e4] hover:bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${classFilter === "teaching"
                            ? "bg-[#1e3a5f] text-white shadow-xs"
                            : "bg-[#f0f4f9] text-[#1e3a5f] group-hover:bg-[#e2edf8]"
                          }`}>
                          <span className="material-symbols-outlined text-[18px]">co_present</span>
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-semibold transition-colors flex items-center gap-1.5 ${classFilter === "teaching" ? "text-[#1e3a5f]" : "text-on-surface group-hover:text-[#1e3a5f]"
                            }`}>
                            <span>Your Classes to Give</span>
                            {classFilter === "teaching" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f] animate-pulse"></span>
                            )}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/70">
                            {classFilter === "teaching" ? "Viewing scheduled sessions • Click to reset" : "Click to view scheduled classes to give"}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all ${classFilter === "teaching"
                          ? "bg-[#1e3a5f] text-white shadow-xs"
                          : "bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]"
                        }`}>
                        {myTeachingClasses.length} Scheduled
                      </span>
                    </button>
                  )}

                  {/* User Enrollment Status Card - Interactive Filter */}
                  <button
                    type="button"
                    onClick={() => setClassFilter(classFilter === "enrolled" ? "all" : "enrolled")}
                    className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono transition-all cursor-pointer text-left w-full group ${classFilter === "enrolled"
                        ? "bg-emerald-500/15 border-emerald-400/50 shadow-lg shadow-emerald-500/10"
                        : "bg-surface-container-low/40 border-outline-variant/30 hover:border-emerald-400/40 hover:bg-emerald-500/5"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${classFilter === "enrolled"
                          ? "bg-emerald-400 text-black shadow-md shadow-emerald-400/30"
                          : "bg-emerald-400/10 text-emerald-400 group-hover:bg-emerald-400/20"
                        }`}>
                        <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-semibold transition-colors flex items-center gap-1.5 ${classFilter === "enrolled" ? "text-emerald-300" : "text-on-surface group-hover:text-emerald-300"
                          }`}>
                          <span>Your Enrollments</span>
                          {classFilter === "enrolled" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          )}
                        </span>
                        <span className="text-[10px] text-on-surface-variant/70">
                          {classFilter === "enrolled" ? "Viewing active cohorts • Click to reset" : "Click to view registered cohorts"}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all ${classFilter === "enrolled"
                        ? "bg-emerald-400 text-black shadow-sm"
                        : "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                      }`}>
                      {enrolledClassesList.length} Active
                    </span>
                  </button>
                </div>

                {/* RIGHT COLUMN: CLASS DETAILS & LIST */}
                <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-6">
                  {/* Right Column Header */}
                  <div className={`flex items-center justify-between gap-4 p-4 rounded-xl border backdrop-blur-md transition-all ${classFilter === "enrolled"
                      ? "bg-emerald-500/10 border-emerald-400/30"
                      : classFilter === "teaching"
                        ? "bg-[#f0f4f9] border-[#d2dfec]"
                        : "bg-surface-container-low/40 border-outline-variant/20"
                    }`}>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`material-symbols-outlined text-[20px] ${classFilter === "enrolled"
                          ? "text-emerald-400"
                          : classFilter === "teaching"
                            ? "text-[#1e3a5f]"
                            : "text-primary"
                        }`}>
                        {classFilter === "enrolled"
                          ? "how_to_reg"
                          : classFilter === "teaching"
                            ? "co_present"
                            : "school"}
                      </span>
                      <span className="font-mono text-xs text-on-surface font-semibold uppercase tracking-wider">
                        {classFilter === "all"
                          ? "All Masterclasses & Seminars"
                          : classFilter === "enrolled"
                            ? "Your Enrolled Masterclasses"
                            : classFilter === "teaching"
                              ? "Your Scheduled Classes to Give"
                              : classFilter}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${classFilter === "enrolled"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                          : classFilter === "teaching"
                            ? "bg-[#f0f4f9] text-[#1e3a5f] border-[#d2dfec]"
                            : "bg-surface-container-high text-primary border-outline-variant/30"
                        }`}>
                        {filteredClasses.length} {filteredClasses.length === 1 ? "Class" : "Classes"}
                      </span>
                    </div>

                    {classFilter !== "all" && (
                      <button
                        type="button"
                        onClick={() => setClassFilter("all")}
                        className={`text-xs font-mono hover:underline flex items-center gap-1 cursor-pointer ${classFilter === "enrolled"
                            ? "text-emerald-400"
                            : classFilter === "teaching"
                              ? "text-[#1e3a5f]"
                              : "text-primary"
                          }`}
                      >
                        <span>Show all</span>
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>

                  {/* Classes Grid or Empty State */}
                  {filteredClasses.length === 0 ? (
                    <div className="p-12 rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${classFilter === "enrolled"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-400/30"
                          : classFilter === "teaching"
                            ? "bg-[#f0f4f9] text-[#1e3a5f] border-[#d2dfec]"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}>
                        <span className="material-symbols-outlined text-3xl">
                          {classFilter === "enrolled"
                            ? "event_available"
                            : classFilter === "teaching"
                              ? "co_present"
                              : "search_off"}
                        </span>
                      </div>
                      <div className="font-display text-lg font-bold text-on-surface">
                        {classFilter === "enrolled"
                          ? "No Active Enrollments Yet"
                          : classFilter === "teaching"
                            ? "No Scheduled Classes to Give Yet"
                            : "No classes found in this topic"}
                      </div>
                      <p className="text-xs text-on-surface-variant max-w-md leading-relaxed">
                        {classFilter === "enrolled"
                          ? "You are not currently enrolled in any masterclasses. Browse through the available faculty and alumni sessions and click 'Join Class' to reserve your virtual or in-person seat."
                          : classFilter === "teaching"
                            ? "You do not have any scheduled masterclasses to give yet. Click 'Create Class' on the left to schedule a new seminar for students to join."
                            : `There are currently no active masterclasses matching "${classFilter}".`}
                      </p>
                      {classFilter === "teaching" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setNewClassForm({
                              title: "",
                              category: "Distributed Systems & AI",
                              schedule: "Thursdays • 4:00 PM PST",
                              location: `${currentUser.campus} Node • Live Virtual Stream`,
                              description: "",
                              capacity: "50",
                              tags: "GPU • Triton • Systems",
                            });
                            setIsCreateClassOpen(true);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-[#c2593f] hover:bg-[#a94a32] text-white font-display font-semibold text-xs cursor-pointer shadow-sm transition-all hover:scale-[1.01]"
                        >
                          Schedule New Class
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setClassFilter("all")}
                          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-display font-semibold text-xs cursor-pointer shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                        >
                          Browse All Masterclasses
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {filteredClasses.map((cls) => {
                        const isEnrolled = !!joinedClasses[cls.id];
                        const isMyTeachingClass =
                          cls.instructorName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
                          (currentUser.role === "faculty" && (cls.instructorName.toLowerCase().includes("mathur") || cls.instructorName.toLowerCase().includes("alok") || currentUser.name.toLowerCase().includes("mathur"))) ||
                          (currentUser.role === "alumni" && (cls.instructorName.toLowerCase().includes("manish") || cls.instructorName.toLowerCase().includes("sharma") || currentUser.name.toLowerCase().includes("manish")));
                        const capacityPercent = Math.min(100, Math.round((cls.enrolledCount / cls.capacity) * 100));

                        return (
                          <div
                            key={cls.id}
                            className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest/90 border border-outline-variant/40 hover:border-primary/40 transition-all flex flex-col justify-between gap-6 shadow-xl backdrop-blur-xl relative overflow-hidden group"
                          >
                            {/* Top Badges */}
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/40 font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
                                    {cls.category}
                                  </span>
                                  {isMyTeachingClass && (
                                    <span className="px-2.5 py-1 rounded-full bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec] font-mono text-[10px] font-bold flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">co_present</span>
                                      <span>YOUR SCHEDULED CLASS</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                                  <span>{cls.schedule}</span>
                                </div>
                              </div>

                              {/* Class Title */}
                              <h3 className="font-display text-xl sm:text-2xl font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                                {cls.title}
                              </h3>

                              {/* Instructor Identity Card */}
                              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/30">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-sm shadow-md shrink-0 border ${cls.instructorRole === "faculty"
                                    ? "bg-[#f0f4f9] border-[#d2dfec] text-[#1e3a5f]"
                                    : "bg-[#fbf4eb] border-[#eeddc8] text-[#8a5726]"
                                  }`}>
                                  {cls.instructorAvatar}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-display font-semibold text-sm text-on-surface truncate">
                                      {cls.instructorName}
                                    </span>
                                    {cls.instructorRole === "faculty" ? (
                                      <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec] flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[11px]">school</span>
                                        FACULTY
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[11px]">workspace_premium</span>
                                        ALUMNI
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs font-mono text-on-surface-variant truncate">
                                    {cls.campus} • {cls.departmentOrLab}
                                  </span>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-sm text-on-surface-variant/90 leading-relaxed font-light">
                                {cls.description}
                              </p>

                              {/* Virtual Room / Location link */}
                              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-high/40 border border-outline-variant/30 text-xs font-mono text-on-surface-variant">
                                <span className="material-symbols-outlined text-primary text-[16px] shrink-0">videocam</span>
                                <span className="truncate">{cls.location}</span>
                              </div>

                              {/* Tags */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {cls.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded bg-surface-container-low border border-outline-variant/30 font-mono text-[10px] text-on-surface-variant"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Footer with Enrollment Progress & Join Class CTA */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/30">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-on-surface-variant flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px] text-primary">groups</span>
                                  Enrolled: <strong className="text-on-surface font-semibold">{cls.enrolledCount}</strong> / {cls.capacity} seats
                                </span>
                                <span className="text-primary font-bold">{capacityPercent}% Full</span>
                              </div>

                              <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${isEnrolled ? "bg-emerald-400" : "bg-primary"
                                    }`}
                                  style={{ width: `${capacityPercent}%` }}
                                ></div>
                              </div>

                              {isMyTeachingClass ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    showToast(
                                      `You are scheduled to give "${cls.title}". Session time: ${cls.schedule} at ${cls.location}.`
                                    )
                                  }
                                  className="w-full py-3 rounded-xl font-display text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md bg-[#f0f4f9] hover:bg-[#f0f4f9] border border-[#d2dfec] text-[#1e3a5f] shadow-xs"
                                >
                                  <span className="material-symbols-outlined text-[18px]">co_present</span>
                                  <span>Scheduled to Give • {cls.enrolledCount} Enrolled</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleJoinClass(cls)}
                                  className={`w-full py-3 rounded-xl font-display text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${isEnrolled
                                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 shadow-xs"
                                      : "bg-primary text-on-primary hover:bg-primary-fixed shadow-xs hover:scale-[1.01]"
                                    }`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isEnrolled ? "check_circle" : "how_to_reg"}
                                  </span>
                                  <span>
                                    {isEnrolled ? "✓ Enrolled in Class (Click to Leave)" : "Join Class"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* MODAL: HOST A NEW CAMPUS CLASS (FACULTY & ALUMNI ONLY) */}
              {isCreateClassOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="w-full max-w-xl bg-surface-container-lowest/95 border border-outline-variant/50 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentUser.role === "faculty"
                            ? "bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]"
                            : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                          }`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {currentUser.role === "faculty" ? "school" : "workspace_premium"}
                          </span>
                        </div>
                        <div>
                          <span className={`font-mono text-[10px] uppercase font-bold tracking-widest ${currentUser.role === "faculty" ? "text-[#1e3a5f]" : "text-amber-400"
                            }`}>
                            CAMPUS {currentUser.role.toUpperCase()} MASTERCLASS
                          </span>
                          <h2 className="font-display text-xl font-bold text-on-surface">
                            Host a New Class
                          </h2>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreateClassOpen(false)}
                        className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>

                    {/* Host identity pill */}
                    <div className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between text-xs font-mono">
                      <span className="text-on-surface-variant">Instructor / Host:</span>
                      <span className="text-on-surface font-semibold flex items-center gap-1.5">
                        <span className="text-primary">{currentUser.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${currentUser.role === "faculty" ? "bg-[#f0f4f9] text-[#1e3a5f]" : "bg-amber-500/20 text-amber-300"
                          }`}>
                          {currentUser.role}
                        </span>
                        <span>•</span>
                        <span className="text-on-surface-variant">{currentUser.campus}</span>
                      </span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Class / Seminar Title
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                          placeholder="e.g. Distributed GPU Systems & Triton Kernel Optimization"
                          value={newClassForm.title}
                          onChange={(e) => setNewClassForm({ ...newClassForm, title: e.target.value })}
                          required
                          type="text"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-xs text-on-surface-variant uppercase">
                            Category / Topic
                          </label>
                          <select
                            className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
                            value={newClassForm.category}
                            onChange={(e) => setNewClassForm({ ...newClassForm, category: e.target.value })}
                          >
                            <option value="Distributed Systems & AI">Distributed Systems & AI</option>
                            <option value="AI & Machine Learning">AI & Machine Learning</option>
                            <option value="Startups & Venture">Startups & Venture</option>
                            <option value="Hardware & Silicon">Hardware & Silicon</option>
                            <option value="Biotech & Computational Bio">Biotech & Computational Bio</option>
                            <option value="Cryptographic Systems">Cryptographic Systems</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-xs text-on-surface-variant uppercase">
                            Maximum Capacity (Seats)
                          </label>
                          <input
                            className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                            placeholder="50"
                            value={newClassForm.capacity}
                            onChange={(e) => setNewClassForm({ ...newClassForm, capacity: e.target.value })}
                            required
                            type="number"
                            min="5"
                            max="500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-xs text-on-surface-variant uppercase">
                            Schedule / Frequency
                          </label>
                          <input
                            className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Thursdays • 4:00 PM PST"
                            value={newClassForm.schedule}
                            onChange={(e) => setNewClassForm({ ...newClassForm, schedule: e.target.value })}
                            required
                            type="text"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-mono text-xs text-on-surface-variant uppercase">
                            Location / Virtual Room Link
                          </label>
                          <input
                            className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. Building 4 • Live ALCON Stream Node #04"
                            value={newClassForm.location}
                            onChange={(e) => setNewClassForm({ ...newClassForm, location: e.target.value })}
                            required
                            type="text"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Syllabus / Class Overview
                        </label>
                        <textarea
                          rows={3}
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors resize-none"
                          placeholder="Outline the core concepts, prerequisites, and learning objectives for students..."
                          value={newClassForm.description}
                          onChange={(e) => setNewClassForm({ ...newClassForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Topic Keywords (separated by •)
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                          placeholder="e.g. GPU • CUDA • Triton • Systems"
                          value={newClassForm.tags}
                          onChange={(e) => setNewClassForm({ ...newClassForm, tags: e.target.value })}
                          type="text"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
                        <button
                          type="button"
                          onClick={() => setIsCreateClassOpen(false)}
                          className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingClass}
                          className="px-5 py-2.5 rounded-xl bg-[#c2593f] hover:bg-[#a94a32] text-white font-display text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">publish</span>
                          <span>{isSubmittingClass ? "Publishing..." : "Publish Class to Campus Network"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* VIEW 7: FRIENDS / PEER DISCOVERY */}
        {viewPath === "friends" && (() => {
          // Current active viewer object
          const currentViewer =
            activeViewerPersona === "AC" || activeViewerPersona === "AS"
              ? {
                id: "AC",
                name: currentUser.name,
                campus: currentUser.campusShort || currentUser.campus,
                avatar: currentUser.avatar,
                headline: currentUser.headline,
              }
              : peersList.find((p) => p.id === activeViewerPersona) || {
                id: activeViewerPersona,
                name: "Researcher",
                campus: "Campus Peer",
                avatar: activeViewerPersona,
                headline: "Collegiate Builder",
              };

          // Filtered peers based on search and campus filter
          const filteredPeers = peersList.filter((p) => {
            // Don't show yourself in discovery if switched to that persona
            if (p.id === activeViewerPersona) return false;

            const q = peerSearchQuery.toLowerCase().trim();
            const matchesSearch =
              !q ||
              p.name.toLowerCase().includes(q) ||
              p.campus.toLowerCase().includes(q) ||
              p.headline.toLowerCase().includes(q) ||
              p.bio.toLowerCase().includes(q) ||
              p.skills.some((s) => s.toLowerCase().includes(q));

            const matchesCampus =
              peerCampusFilter === "all" || p.filterCampus === peerCampusFilter;

            return matchesSearch && matchesCampus;
          });

          // Incoming invites for active viewer persona
          const incomingInvites = friendInvites.filter(
            (inv) => inv.recipientId === activeViewerPersona && inv.status === "pending"
          );

          // Sent invites by active viewer persona
          const sentInvites = friendInvites.filter(
            (inv) => inv.senderId === activeViewerPersona
          );

          // Connected friends for active viewer persona
          const connectedFriends = peersList.filter((p) => {
            if (p.id === activeViewerPersona) return false;
            const isConn =
              !!connectedPeers[p.id] ||
              friendInvites.some(
                (inv) =>
                  inv.status === "accepted" &&
                  ((inv.senderId === activeViewerPersona && inv.recipientId === p.id) ||
                    (inv.senderId === p.id && inv.recipientId === activeViewerPersona))
              );
            return isConn;
          });

          return (
            <div className="w-full px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-8">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-secondary mb-2">
                    <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-secondary flex items-center justify-center text-[11px] shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">diversity_3</span>
                    </div>
                    <span>// GLOBAL PEER NETWORK</span>
                    <span>•</span>
                    <span>120+ RESEARCH NODES</span>
                  </div>
                  <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-on-surface tracking-tight">
                    Peer Discovery & Friends
                  </h1>
                  <p className="text-on-surface-variant text-base mt-2 max-w-2xl font-light">
                    Search and connect with founders, systems engineers, and research partners across global nodes.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <button
                    onClick={() => setActivePath("home")}
                    className="px-4 py-2.5 bg-surface-container-high border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface hover:text-secondary transition-colors flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
                  >
                    <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center">
                      <span className="material-symbols-outlined text-[13px]">arrow_back</span>
                    </div>
                    <span>Overview</span>
                  </button>
                </div>
              </div>

              {/* MAIN 2-COLUMN LAYOUT: FILTERS & NAVIGATION ON LEFT, DETAILS ON RIGHT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                {/* LEFT COLUMN: FILTERS, NAVIGATION & ACTIONS */}
                <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
                  {/* Search Filter Card */}
                  <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/40 flex flex-col gap-3 shadow-md backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-primary">search</span>
                        Search Filter
                      </span>
                      {peerSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPeerSearchQuery("")}
                          className="text-[10px] font-mono text-primary hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="relative w-full">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-on-surface-variant/70">
                        <span className="material-symbols-outlined text-[17px]">search</span>
                      </div>
                      <input
                        type="text"
                        value={peerSearchQuery}
                        onChange={(e) => setPeerSearchQuery(e.target.value)}
                        placeholder="Search peers, skills, nodes..."
                        className="w-full bg-surface-container border border-outline-variant/40 rounded-xl pl-9 pr-8 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                      />
                      {peerSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setPeerSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer p-0.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Navigation Card */}
                  <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/40 flex flex-col gap-2 shadow-md backdrop-blur-xl">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-secondary">alt_route</span>
                      Views & Connections
                    </span>
                    {[
                      { key: "discover", label: "Discover Peers", count: filteredPeers.length, icon: "explore", desc: "Browse research talent" },
                      {
                        key: "incoming",
                        label: "Incoming Invites",
                        count: incomingInvites.length,
                        icon: "mail",
                        desc: "Requests to review",
                        highlight: incomingInvites.length > 0,
                      },
                      { key: "sent", label: "Sent Invites", count: sentInvites.length, icon: "send", desc: "Outgoing connection invites" },
                      { key: "connected", label: "Connected Friends", count: connectedFriends.length, icon: "handshake", desc: "Collaborators & direct chat" },
                    ].map((tab) => {
                      const isActive = activeFriendTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveFriendTab(tab.key as any)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-mono transition-all cursor-pointer flex items-center justify-between group ${isActive
                              ? "apple-liquid-glass apple-liquid-glass-primary text-primary font-bold shadow-md scale-[1.01]"
                              : "hover:bg-surface-container-high/80 text-on-surface-variant hover:text-on-surface border border-transparent hover:border-outline-variant/30"
                            }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-primary/20 text-primary" : "bg-surface-container text-on-surface-variant group-hover:text-on-surface"
                              }`}>
                              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="truncate">{tab.label}</span>
                              <span className="text-[10px] text-on-surface-variant/70 font-sans truncate font-normal">
                                {tab.desc}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono shrink-0 ml-2 ${tab.highlight && !isActive
                                ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 animate-pulse"
                                : isActive
                                  ? "bg-primary/20 text-primary font-bold"
                                  : "bg-white/10 text-on-surface-variant"
                              }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Skill & Domain Filters Card */}
                  <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/40 flex flex-col gap-3 shadow-md backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-amber-400">filter_alt</span>
                        Quick Skill Filters
                      </span>
                      {peerSearchQuery && (
                        <span className="text-[10px] font-mono text-primary font-semibold">Filtered</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "All",
                        "Rust",
                        "CUDA",
                        "PyTorch",
                        "Kernel",
                        "ZK",
                        "Robotics",
                        "Bio",
                        "Distributed",
                        "Hardware",
                      ].map((skill) => {
                        const isAll = skill === "All";
                        const isSelected = isAll
                          ? !peerSearchQuery
                          : peerSearchQuery.toLowerCase() === skill.toLowerCase();
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                              if (isAll) {
                                setPeerSearchQuery("");
                              } else {
                                setPeerSearchQuery(isSelected ? "" : skill);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${isSelected
                                ? "apple-liquid-glass apple-liquid-glass-secondary text-secondary font-bold shadow-xs border border-secondary/40 scale-[1.02]"
                                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                              }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Persona Switcher & DM Action Card */}
                  <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/40 flex flex-col gap-3 shadow-md backdrop-blur-xl">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-emerald-400">badge</span>
                      Session Persona
                    </span>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-container border border-outline-variant/40">
                      <div className="w-8 h-8 rounded-lg apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center font-bold text-xs text-primary shrink-0">
                        {currentViewer.avatar}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[9px] font-mono uppercase text-on-surface-variant/80 truncate">
                          Active Persona (Test Mode):
                        </span>
                        <select
                          value={activeViewerPersona}
                          onChange={(e) => {
                            const newId = e.target.value;
                            setActiveViewerPersona(newId);
                            const pName = newId === "AC" ? currentUser.name : peersList.find((p) => p.id === newId)?.name;
                            showToast(`Switched active persona to ${pName}. Check "Incoming Invites" to review received connection requests!`);
                          }}
                          className="bg-transparent text-xs font-display font-bold text-primary focus:outline-none cursor-pointer truncate"
                        >
                          <option value="AC" className="bg-surface-container-high text-on-surface">
                            {currentUser.name} (You • {currentUser.campusShort || currentUser.campus})
                          </option>
                          {peersList.map((p) => (
                            <option key={p.id} value={p.id} className="bg-surface-container-high text-on-surface">
                              {p.name} ({p.campus})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const firstConnected = connectedFriends[0] || peersList.find((p) => p.id === "MS");
                        if (firstConnected) {
                          openDirectMessageWithPeer(firstConnected);
                        } else {
                          setActivePath("community");
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl apple-liquid-glass apple-liquid-glass-primary text-primary font-display font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] transition-all"
                      title="Open 1-on-1 Personal Direct Messages"
                    >
                      <span className="material-symbols-outlined text-[16px]">forum</span>
                      <span>Personal DMs ({connectedFriends.length} Connected)</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: DETAILS CONTENT */}
                <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-6">
                  {/* Section Breadcrumb & Status Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold text-on-surface">
                        {activeFriendTab === "discover" && "Discover Global Researchers"}
                        {activeFriendTab === "incoming" && "Incoming Connection Invites"}
                        {activeFriendTab === "sent" && "Pending Sent Requests"}
                        {activeFriendTab === "connected" && "Connected Research Network"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                        {activeFriendTab === "discover" && `${filteredPeers.length} available`}
                        {activeFriendTab === "incoming" && `${incomingInvites.length} pending`}
                        {activeFriendTab === "sent" && `${sentInvites.length} sent`}
                        {activeFriendTab === "connected" && `${connectedFriends.length} friends`}
                      </span>
                    </div>

                    {peerSearchQuery && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary text-[11px] font-mono">
                        <span>Filter: &quot;{peerSearchQuery}&quot;</span>
                        <button
                          type="button"
                          onClick={() => setPeerSearchQuery("")}
                          className="hover:text-on-surface cursor-pointer flex items-center"
                        >
                          <span className="material-symbols-outlined text-[13px]">close</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* TAB 1: DISCOVER PEERS */}
                  {activeFriendTab === "discover" && (
                    <div>
                      {filteredPeers.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[24px]">person_search</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-on-surface">No matching researchers found</h3>
                          <p className="font-mono text-xs text-on-surface-variant max-w-md">
                            Try searching for different skills (e.g. &quot;Rust&quot;, &quot;CUDA&quot;, &quot;PyTorch&quot;, &quot;ZK&quot;) or resetting the search query.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setPeerSearchQuery("");
                              setPeerCampusFilter("all");
                            }}
                            className="mt-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-mono text-primary hover:underline cursor-pointer"
                          >
                            Reset Search Filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {filteredPeers.map((p) => {
                            const isConnected =
                              !!connectedPeers[p.id] ||
                              friendInvites.some(
                                (inv) =>
                                  inv.status === "accepted" &&
                                  ((inv.senderId === activeViewerPersona && inv.recipientId === p.id) ||
                                    (inv.senderId === p.id && inv.recipientId === activeViewerPersona))
                              );

                            const hasSentInvite = friendInvites.some(
                              (inv) =>
                                inv.senderId === activeViewerPersona &&
                                inv.recipientId === p.id &&
                                inv.status === "pending"
                            );

                            const hasReceivedInvite = friendInvites.some(
                              (inv) =>
                                inv.senderId === p.id &&
                                inv.recipientId === activeViewerPersona &&
                                inv.status === "pending"
                            );

                            return (
                              <div
                                key={p.id}
                                className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col justify-between gap-5 shadow-xl hover:border-primary/40 transition-all group"
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3.5">
                                      <div className="relative flex-shrink-0">
                                        <div
                                          onClick={() => setSelectedPeerForProfile(p)}
                                          className="w-14 h-14 rounded-2xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary font-bold font-display text-lg shadow-md cursor-pointer group-hover:scale-105 transition-transform"
                                          title="Click to view full student profile"
                                        >
                                          <span>{p.avatar}</span>
                                        </div>
                                        <span
                                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface-container-low shadow-xs z-10 ${p.onlineStatus === "online"
                                              ? "bg-emerald-400"
                                              : p.onlineStatus === "building"
                                                ? "bg-cyan-400"
                                                : "bg-amber-400"
                                            }`}
                                        />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4
                                            onClick={() => setSelectedPeerForProfile(p)}
                                            className="font-display text-lg font-bold text-on-surface hover:text-primary cursor-pointer transition-colors"
                                          >
                                            {p.name}
                                          </h4>
                                          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-bold">
                                            {p.match}
                                          </span>
                                        </div>
                                        <p className="text-xs font-mono text-on-surface-variant mt-0.5">{p.campus}</p>
                                        <p className="text-[11px] font-mono text-primary/90 mt-0.5 line-clamp-1">
                                          {p.headline}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="font-mono text-[11px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg flex-shrink-0">
                                      {p.kp}
                                    </div>
                                  </div>

                                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                                    {p.bio}
                                  </p>

                                  {/* Skills Pills */}
                                  <div className="flex gap-1.5 flex-wrap">
                                    {p.skills.slice(0, 4).map((s) => (
                                      <span
                                        key={s}
                                        className="px-2 py-0.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface-variant text-[10px] font-mono"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                    {p.skills.length > 4 && (
                                      <span className="text-[10px] font-mono text-on-surface-variant/70 self-center">
                                        +{p.skills.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPeerForProfile(p)}
                                    className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-primary/50 text-xs font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center">
                                      <span className="material-symbols-outlined text-[13px]">visibility</span>
                                    </div>
                                    <span>View Profile</span>
                                  </button>

                                  {isConnected ? (
                                    <span className="px-3.5 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-display font-semibold text-xs flex items-center gap-1.5 shadow-xs">
                                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                                      <span>Connected ✓</span>
                                    </span>
                                  ) : hasSentInvite ? (
                                    <span className="px-3.5 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/50 text-on-surface-variant font-mono text-xs flex items-center gap-1.5">
                                      <span className="material-symbols-outlined text-[14px] text-amber-400">schedule</span>
                                      <span>Invite Sent • Pending</span>
                                    </span>
                                  ) : hasReceivedInvite ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const inv = friendInvites.find(
                                          (i) => i.senderId === p.id && i.recipientId === activeViewerPersona
                                        );
                                        if (inv) handleAcceptInvite(inv.id);
                                      }}
                                      className="px-3.5 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">check</span>
                                      <span>Accept Invite</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSendInvite(p)}
                                      className="px-3.5 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-primary text-primary font-display font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
                                      title={`Send connection invite to ${p.name}`}
                                    >
                                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                                      <span>Send Invite</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: INCOMING INVITES (The Person Receiving Receives It!) */}
                  {activeFriendTab === "incoming" && (
                    <div className="flex flex-col gap-6">
                      <div className="p-4 rounded-xl bg-surface-container-low border border-primary/30 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">inbox</span>
                          </div>
                          <div>
                            <span className="font-display text-sm font-bold text-on-surface">
                              Incoming Invites for {currentViewer.name} ({currentViewer.campus})
                            </span>
                            <p className="font-mono text-[11px] text-on-surface-variant">
                              Peer connection invitations sent to this persona. Accept or decline below.
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-primary font-bold">
                          {incomingInvites.length} Pending
                        </span>
                      </div>

                      {incomingInvites.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[24px]">drafts</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-on-surface">No pending incoming invitations</h3>
                          <p className="font-mono text-xs text-on-surface-variant max-w-md">
                            There are no connection invites waiting for {currentViewer.name}.
                            Try switching active personas above (e.g. to Aditya Verma or Sneha Patel) to test sending and receiving invitations across personas!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {incomingInvites.map((inv) => {
                            const senderPeer = peersList.find((p) => p.id === inv.senderId);
                            return (
                              <div
                                key={inv.id}
                                className="p-6 rounded-2xl bg-surface-container-low border border-primary/40 flex flex-col justify-between gap-5 shadow-xl relative overflow-hidden"
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-2xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary font-bold font-display text-base shadow-sm">
                                        {inv.senderAvatar}
                                      </div>
                                      <div>
                                        <h4 className="font-display text-base font-bold text-on-surface">
                                          {inv.senderName}
                                        </h4>
                                        <span className="font-mono text-xs text-on-surface-variant block">
                                          {inv.senderCampus}
                                        </span>
                                        <span className="font-mono text-[10px] text-primary/90 block line-clamp-1">
                                          {inv.senderHeadline}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="font-mono text-[10px] text-on-surface-variant/70">
                                      {inv.createdAt}
                                    </span>
                                  </div>

                                  {inv.message && (
                                    <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-xs font-mono text-on-surface leading-relaxed">
                                      &quot;{inv.message}&quot;
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
                                  {senderPeer && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPeerForProfile(senderPeer)}
                                      className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-primary/50 text-xs font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[13px]">visibility</span>
                                      <span>View Profile</span>
                                    </button>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleDeclineInvite(inv.id)}
                                      className="px-3.5 py-1.5 rounded-xl border border-outline-variant/40 hover:border-rose-500/50 hover:bg-rose-500/10 text-xs font-mono text-on-surface-variant hover:text-rose-400 transition-colors cursor-pointer"
                                    >
                                      Decline
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptInvite(inv.id)}
                                      className="px-4 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] transition-all"
                                    >
                                      <span className="material-symbols-outlined text-[15px]">done_all</span>
                                      <span>Accept Invite</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: SENT INVITES */}
                  {activeFriendTab === "sent" && (
                    <div className="flex flex-col gap-6">
                      {sentInvites.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[24px]">send</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-on-surface">No sent invites from {currentViewer.name}</h3>
                          <p className="font-mono text-xs text-on-surface-variant max-w-md">
                            Switch to the Discover Peers tab to search and dispatch connection invites to researchers across campuses!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {sentInvites.map((inv) => {
                            const recipientPeer = peersList.find((p) => p.id === inv.recipientId);
                            return (
                              <div
                                key={inv.id}
                                className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-4 shadow-xl"
                              >
                                <div className="flex items-center gap-3.5">
                                  <div
                                    onClick={() => recipientPeer && setSelectedPeerForProfile(recipientPeer)}
                                    className={`w-12 h-12 rounded-2xl apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center font-bold text-sm text-on-surface ${recipientPeer ? "cursor-pointer hover:scale-105 transition-transform" : ""
                                      }`}
                                    title={recipientPeer ? "View Profile" : undefined}
                                  >
                                    {inv.recipientName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4
                                      onClick={() => recipientPeer && setSelectedPeerForProfile(recipientPeer)}
                                      className={`font-display text-base font-bold text-on-surface ${recipientPeer ? "cursor-pointer hover:text-primary transition-colors" : ""
                                        }`}
                                    >
                                      {inv.recipientName}
                                    </h4>
                                    <span className="font-mono text-xs text-on-surface-variant block">
                                      {inv.recipientCampus}
                                    </span>
                                    <span className="font-mono text-[10px] text-on-surface-variant/70 block mt-0.5">
                                      Dispatched {inv.createdAt}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {recipientPeer && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPeerForProfile(recipientPeer)}
                                      className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-primary/50 text-xs font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[13px]">visibility</span>
                                      <span>Profile</span>
                                    </button>
                                  )}
                                  {inv.status === "accepted" ? (
                                    <span className="px-3 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-display font-semibold text-xs flex items-center gap-1 shadow-xs">
                                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                      Accepted
                                    </span>
                                  ) : inv.status === "declined" ? (
                                    <span className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-rose-400 font-mono text-xs">
                                      Declined
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-secondary text-amber-200 font-mono text-xs flex items-center gap-1 shadow-xs">
                                      <span className="material-symbols-outlined text-[13px] animate-spin">sync</span>
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: CONNECTED FRIENDS */}
                  {activeFriendTab === "connected" && (
                    <div className="flex flex-col gap-6">
                      {connectedFriends.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[24px]">group</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-on-surface">No connected friends yet</h3>
                          <p className="font-mono text-xs text-on-surface-variant max-w-md">
                            Send invites to peers or accept incoming invitations to build your collegiate co-founder network!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {connectedFriends.map((p) => (
                            <div
                              key={p.id}
                              className="p-6 rounded-2xl bg-surface-container-low border border-emerald-500/40 flex items-center justify-between gap-4 shadow-xl"
                            >
                              <div className="flex items-center gap-3.5">
                                <div
                                  onClick={() => setSelectedPeerForProfile(p)}
                                  className="w-14 h-14 rounded-2xl apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-emerald-300 font-bold font-display text-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                                >
                                  {p.avatar}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4
                                      onClick={() => setSelectedPeerForProfile(p)}
                                      className="font-display text-lg font-bold text-on-surface hover:text-emerald-400 cursor-pointer transition-colors"
                                    >
                                      {p.name}
                                    </h4>
                                    <span className="px-2 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-mono text-[9px] font-bold">
                                      FRIEND
                                    </span>
                                  </div>
                                  <p className="text-xs font-mono text-on-surface-variant mt-0.5">{p.campus}</p>
                                  <p className="text-[11px] font-mono text-emerald-400/90 mt-0.5 line-clamp-1">
                                    {p.headline}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPeerForProfile(p)}
                                  className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-emerald-500/50 text-xs font-mono text-on-surface hover:text-emerald-300 transition-colors cursor-pointer"
                                >
                                  Profile
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDirectMessageWithPeer(p)}
                                  className="px-3.5 py-1.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
                                  title={`Open personal 1-on-1 direct message with ${p.name}`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">chat</span>
                                  <span>Chat</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW 8: PROFILE / AUTH GATEWAY */}
        {viewPath === "profile" && (
          <div className="w-full px-4 sm:px-8 lg:px-12 py-12 max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-8">
              <div>
                {isLoggedIn ? (
                  <div className="flex items-center gap-2 font-mono text-xs text-primary mb-2 flex-wrap">
                    <span className={
                      currentUser.role === "faculty"
                        ? "text-[#1e3a5f] font-bold"
                        : currentUser.role === "alumni"
                          ? "text-amber-400 font-bold"
                          : "text-emerald-400 font-bold"
                    }>
                      // VERIFIED {currentUser.role.toUpperCase()} PASSPORT
                    </span>
                    <span>•</span>
                    <span>NODE ID: {currentUser.nodeId}</span>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span> ACTIVE SESSION
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-400 mb-2">
                    <span>// COLLEGIATE PASSPORT</span>
                    <span>•</span>
                    <span className="text-on-surface-variant">GUEST SESSION</span>
                    <span>•</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span> NOT SIGNED IN
                    </span>
                  </div>
                )}
                <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-on-surface tracking-tight">
                  Collegiate Identity
                </h1>
                <p className="text-on-surface-variant text-base mt-2 max-w-2xl font-light">
                  Multi-campus cryptographic identity, engineering karma, and syndicate credentials for students, faculty, and alumni.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Tabs switcher */}
                <div className="inline-flex items-center p-1 bg-surface-container-high/70 border border-outline-variant/40 rounded-xl">
                  <button
                    onClick={() => setProfileTab("profile")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${profileTab === "profile"
                        ? "bg-primary text-on-primary font-bold shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    {!isLoggedIn && <span className="material-symbols-outlined text-[13px]">lock</span>}
                    <span>Profile Dashboard</span>
                  </button>
                  <button
                    onClick={() => setProfileTab("signin")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${profileTab === "signin"
                        ? "bg-primary text-on-primary font-bold shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setProfileTab("signup")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${profileTab === "signup"
                        ? "bg-primary text-on-primary font-bold shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    Sign Up
                  </button>
                </div>

                <button
                  onClick={() => setActivePath("home")}
                  className="px-4 py-2 bg-surface-container-high border border-outline-variant/40 rounded-lg text-xs font-mono text-on-surface hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to Overview</span>
                </button>
              </div>
            </div>

            {/* TAB: PROFILE DASHBOARD */}
            {profileTab === "profile" && (
              isLoggedIn ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
                  {/* LEFT COLUMN: IDENTITY & CREDENTIALS */}
                  <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
                    {/* User Identity Card (Top Part) */}
                    <div className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest/90 border border-outline-variant/40 relative overflow-hidden backdrop-blur-xl shadow-xl flex flex-col gap-5">
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center font-display font-bold text-2xl shadow-xl transition-all ${currentUser.role === "faculty"
                              ? "bg-gradient-to-br from-[#f0f4f9] to-white border-[#d2dfec] text-[#1e3a5f] shadow-xs"
                              : currentUser.role === "alumni"
                                ? "bg-gradient-to-br from-amber-500/30 to-surface-container-high border-amber-400/60 text-amber-300 shadow-xs"
                                : "bg-gradient-to-br from-primary/30 to-surface-container-high border-primary/60 text-primary shadow-xs"
                            }`}>
                            {currentUser.avatar}
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center text-surface text-[12px] font-bold ${currentUser.role === "faculty"
                              ? "bg-[#1e3a5f]"
                              : currentUser.role === "alumni"
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            }`}>
                            ✓
                          </span>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h2 className="font-display text-2xl font-bold text-on-surface truncate">
                            {currentUser.name}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {currentUser.role === "faculty" && (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#f0f4f9] border border-[#d2dfec] text-[#1e3a5f] font-mono text-[10px] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">school</span>
                                FACULTY
                              </span>
                            )}
                            {currentUser.role === "alumni" && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
                                ALUMNI
                              </span>
                            )}
                            {currentUser.role === "student" && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">verified</span>
                                STUDENT
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-mono text-[10px] font-semibold">
                              {currentUser.classYearOrRank}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
                        <p className="text-on-surface-variant text-xs leading-relaxed">
                          {currentUser.headline}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant/80 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-on-surface">
                            {currentUser.campus}
                          </span>
                          <span className={
                            currentUser.role === "faculty"
                              ? "text-[#1e3a5f] font-semibold"
                              : currentUser.role === "alumni"
                                ? "text-amber-300 font-semibold"
                                : "text-primary font-semibold"
                          }>
                            {currentUser.departmentOrLab}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Verified Status & Sign Out) */}
                      <div className="flex items-center gap-2.5 pt-3 border-t border-outline-variant/20">
                        <button
                          type="button"
                          onClick={() => showToast(`Profile active as ${currentUser.role.toUpperCase()} (${currentUser.campus})`)}
                          className="flex-1 py-2 px-3 bg-surface-container-high border border-outline-variant/50 text-on-surface hover:text-primary rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">badge</span>
                          <span>Verified Status</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="py-2 px-3.5 bg-error/10 border border-error/30 text-error hover:bg-error hover:text-on-error rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">logout</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>

                    {/* Verified Credentials & Contact Card (Bottom Part on Left) */}
                    <div className="p-6 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/40 flex flex-col gap-4 shadow-xl backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-[18px] ${currentUser.role === "faculty" ? "text-[#1e3a5f]" : currentUser.role === "alumni" ? "text-amber-400" : "text-primary"
                            }`}>badge</span>
                          <h3 className="font-display text-sm text-on-surface font-semibold">
                            Verified Credentials & Contact
                          </h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${currentUser.role === "faculty"
                            ? "bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]"
                            : currentUser.role === "alumni"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                              : "bg-primary/10 text-primary border border-primary/30"
                          }`}>
                          {currentUser.role.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3.5 font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-on-surface-variant uppercase text-[10px]">
                            {currentUser.role === "faculty" ? "Academic .edu Email (Faculty SSO)" : currentUser.role === "alumni" ? "Alumni Verified Email" : "University Email (.edu SSO)"}
                          </span>
                          <div className="flex items-center gap-2 text-on-surface font-medium flex-wrap">
                            <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
                            <span className="break-all text-[11px]">{currentUser.email}</span>
                            <span className="text-emerald-400 text-[9px] bg-emerald-400/10 px-1.5 py-0.5 rounded shrink-0">
                              VERIFIED
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-on-surface-variant uppercase text-[10px]">
                            {currentUser.role === "faculty" ? "Academic Department / Lab" : currentUser.role === "alumni" ? "Alumni Syndicate / Venture" : "Research Node / Lab"}
                          </span>
                          <div className="flex items-center gap-2 text-on-surface font-medium text-[11px]">
                            <span className="material-symbols-outlined text-[15px] text-secondary">domain</span>
                            <span>{currentUser.departmentOrLab}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-on-surface-variant uppercase text-[10px]">
                            Collegiate Degree / Title
                          </span>
                          <div className="flex items-center gap-2 text-on-surface font-medium text-[11px]">
                            <span className="material-symbols-outlined text-[15px] text-primary">school</span>
                            <span>{currentUser.degreeOrTitle}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-on-surface-variant uppercase text-[10px]">
                            Passport Cryptographic Node
                          </span>
                          <div className="flex items-center gap-2 text-on-surface font-medium text-[11px]">
                            <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                              vpn_key
                            </span>
                            <span>{currentUser.nodeId} • SHA-256 Validated</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: METRICS & STANDINGS */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                    {/* Karma Points Matrix Card */}
                    <div className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest/80 border border-primary/40 flex flex-col gap-5 relative overflow-hidden shadow-xs backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                          <h3 className="font-display text-lg text-on-surface font-semibold">
                            Karma Points Matrix
                          </h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-primary/20 text-primary font-mono text-[10px] font-bold">
                          {parseKpNumber(currentUser.kp) === 0
                            ? "NEW PASSPORT • 0 KP"
                            : currentUser.role === "faculty"
                              ? "SENIOR FACULTY PI"
                              : currentUser.role === "alumni"
                                ? "ANGEL FELLOW"
                                : "VERIFIED CONTRIBUTOR"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="font-display text-4xl text-primary font-bold">{currentUser.kp}</span>
                        <span className="text-xs font-mono text-on-surface-variant">
                          Total verified collegiate reputation and contribution score
                        </span>
                      </div>

                      {(() => {
                        const totalKp = parseKpNumber(currentUser.kp);
                        const sharesList = currentUser.sharesOwned || [];
                        const ventureKp = sharesList.reduce((acc, s) => acc + (s.karmaEarned || 0), 0);
                        const nonVentureKp = Math.max(0, totalKp - ventureKp);

                        if (totalKp === 0) {
                          return (
                            <div className="flex flex-col gap-3 pt-1">
                              <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[22px]">info</span>
                                <div className="text-xs text-on-surface-variant leading-relaxed">
                                  Initial verified reputation is <span className="text-primary font-bold">0 KP</span>. Earn verified Karma by applying to contribute to open projects (<span className="text-primary font-bold">+500 KP</span>) or pledging venture investment (<span className="text-emerald-300 font-bold">+1 KP per ₹100 pledged</span>).
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 opacity-60">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-on-surface">Venture Investment Karma</span>
                                  <span className="text-emerald-400 font-semibold">0 KP</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                  <div className="h-full bg-emerald-400 rounded-full w-0"></div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 opacity-60">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-on-surface">Project Contribution Karma</span>
                                  <span className="text-primary font-semibold">0 KP</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                  <div className="h-full bg-primary rounded-full w-0"></div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (ventureKp > 0 || totalKp < 20000) {
                          const venturePct = Math.min(100, Math.round((ventureKp / totalKp) * 100));
                          const nonVenturePct = Math.max(0, 100 - venturePct);
                          return (
                            <div className="flex flex-col gap-3.5 pt-2">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-on-surface">Venture Investments & Pledges</span>
                                  <span className="text-emerald-400 font-semibold">+{ventureKp.toLocaleString()} KP</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${venturePct}%` }}></div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-on-surface">Project Contributions & Applications</span>
                                  <span className="text-primary font-semibold">+{nonVentureKp.toLocaleString()} KP</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${nonVenturePct}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col gap-3.5 pt-2">
                            {currentUser.role === "faculty" ? (
                              <>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Research Grants Advised</span>
                                    <span className="text-primary font-semibold">54,000 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-[#1e3a5f] rounded-full w-[56%]"></div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Lab Mentorship & Fellowships</span>
                                    <span className="text-secondary font-semibold">28,400 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full w-[29%]"></div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Peer Architecture Reviews</span>
                                    <span className="text-on-surface font-semibold">14,000 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-on-surface-variant rounded-full w-[15%]"></div>
                                  </div>
                                </div>
                              </>
                            ) : currentUser.role === "alumni" ? (
                              <>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Syndicate Micro-Grants Deployed</span>
                                    <span className="text-amber-400 font-semibold">38,200 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full w-[56%]"></div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Founder Angel Mentorship</span>
                                    <span className="text-secondary font-semibold">20,500 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full w-[30%]"></div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Venture Committee Audits</span>
                                    <span className="text-on-surface font-semibold">9,500 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-on-surface-variant rounded-full w-[14%]"></div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Merged Repos & PRs</span>
                                    <span className="text-primary font-semibold">14,200 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-primary rounded-full w-[57%]"></div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Micro-Grants & Syndicate</span>
                                    <span className="text-secondary font-semibold">7,150 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-secondary rounded-full w-[29%]"></div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-xs font-mono">
                                    <span className="text-on-surface">Peer Audits & Reviews</span>
                                    <span className="text-on-surface font-semibold">3,500 KP</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                                    <div className="h-full bg-on-surface-variant rounded-full w-[14%]"></div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Collegiate Standings Card */}
                    <div className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest/80 border border-secondary/40 flex flex-col gap-5 relative overflow-hidden shadow-xs backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]">
                            military_tech
                          </span>
                          <h3 className="font-display text-lg text-on-surface font-semibold">
                            {currentUser.role === "faculty" ? "Faculty Standings" : currentUser.role === "alumni" ? "Alumni Syndicate Standings" : "Collegiate Standings"}
                          </h3>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-secondary/20 text-secondary font-mono text-[10px] font-bold">
                          CYCLE S26
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col gap-1">
                          <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                            {currentUser.role === "faculty" ? "advisory rank" : currentUser.role === "alumni" ? "angel rank" : "contribution rank"}
                          </span>
                          <span className="font-display text-3xl font-bold text-secondary">
                            {currentUser.role === "faculty" ? "#02" : currentUser.role === "alumni" ? "#03" : "#04"}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400">
                            {currentUser.role === "faculty" ? "14 Grants Advised" : currentUser.role === "alumni" ? "Top Syndicate Backer" : "+2 spots this term"}
                          </span>
                        </div>
                        <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col gap-1">
                          <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                            {currentUser.role === "faculty" ? "grant alloc rank" : currentUser.role === "alumni" ? "mentorship rank" : "funding rank"}
                          </span>
                          <span className="font-display text-3xl font-bold text-primary">#01</span>
                          <span className="text-[11px] font-mono text-primary">
                            {currentUser.role === "faculty" ? "Lead Lab PI" : currentUser.role === "alumni" ? "Senior Angel" : "Guild Anchor"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 flex flex-col gap-1 mt-auto">
                        <span className="font-mono text-[11px] text-on-surface font-medium">
                          {currentUser.role === "faculty" ? "Principal Laboratory Focus" : currentUser.role === "alumni" ? "Active Syndicate Portfolio" : "Active Project Lead"}
                        </span>
                        <p className="text-xs text-on-surface-variant">
                          {currentUser.role === "faculty"
                            ? `${currentUser.departmentOrLab} • ₹1.4 Cr Lab Research Grants Supervised`
                            : currentUser.role === "alumni"
                              ? `Frontier Syndicate Angel Fund • ₹2.4 Cr Micro-Grants Cleared across Campuses`
                              : `VectorTriton Distributed Training Node • ₹35 Lakh Micro-Grant Cleared`}
                        </p>
                      </div>
                    </div>

                    {/* SHARES OWNED & SYNDICATE EQUITY PORTFOLIO CARD */}
                    <div className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest/80 border border-emerald-500/40 flex flex-col gap-5 relative overflow-hidden shadow-[0_4px_20px_rgba(30,58,95,0.06)] backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-emerald-300 shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                          </div>
                          <div>
                            <h3 className="font-display text-lg text-on-surface font-semibold">
                              Shares Owned & Syndicate Equity
                            </h3>
                            <span className="font-mono text-[10px] text-on-surface-variant">
                              Calculated at 0.001 × % of Required Investment Funded
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-mono text-[10px] font-bold">
                          {(currentUser.sharesOwned || []).length} VENTURES BACKED
                        </span>
                      </div>

                      {/* Summary metrics row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col gap-0.5">
                          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Total Shares Owned</span>
                          <span className="font-display text-2xl font-bold text-emerald-300">
                            {(currentUser.sharesOwned || []).reduce((acc, s) => acc + (s.sharePercentage || 0), 0).toFixed(4)}%
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400">Syndicate Portfolio Equity</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col gap-0.5">
                          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Capital Invested</span>
                          <span className="font-display text-2xl font-bold text-on-surface">
                            ₹{(currentUser.sharesOwned || []).reduce((acc, s) => acc + (s.amountInvested || 0), 0).toLocaleString('en-IN')}
                          </span>
                          <span className="font-mono text-[10px] text-on-surface-variant">Pledged across Ventures</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col gap-0.5">
                          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Karma Earned</span>
                          <span className="font-display text-2xl font-bold text-primary">
                            +{(currentUser.sharesOwned || []).reduce((acc, s) => acc + (s.karmaEarned || 0), 0).toLocaleString()} KP
                          </span>
                          <span className="font-mono text-[10px] text-primary">Reputation Accrued</span>
                        </div>
                      </div>

                      {/* List of shares owned */}
                      {(currentUser.sharesOwned && currentUser.sharesOwned.length > 0) ? (
                        <div className="flex flex-col gap-3 pt-2">
                          <span className="font-mono text-xs uppercase text-on-surface-variant font-medium">
                            Holding Breakdown per Project
                          </span>
                          <div className="divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-high/30">
                            {currentUser.sharesOwned.map((share) => (
                              <div key={share.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-high/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-emerald-300 font-mono font-bold text-xs">
                                    {share.projectTitle.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-display text-sm font-bold text-on-surface">
                                      {share.projectTitle}
                                    </div>
                                    <div className="font-mono text-[11px] text-on-surface-variant flex items-center gap-2 flex-wrap">
                                      <span>Goal: ₹{share.expectedInvestment.toLocaleString('en-IN')}</span>
                                      <span>•</span>
                                      <span>Invested: ₹{share.amountInvested.toLocaleString('en-IN')}</span>
                                      <span>•</span>
                                      <span className="text-secondary font-semibold">{share.percentageInvested.toFixed(2)}% of Goal</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 sm:text-right shrink-0">
                                  <div className="flex flex-col sm:items-end">
                                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">Share Owned</span>
                                    <span className="font-display text-base font-bold text-emerald-300">
                                      {share.sharePercentage.toFixed(4)}% Share
                                    </span>
                                    <span className="font-mono text-[10px] text-primary">
                                      +{share.karmaEarned.toLocaleString()} KP Earned
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl bg-surface-container-high/20 border border-outline-variant/30 flex flex-col items-center justify-center text-center gap-3">
                          <div className="w-12 h-12 rounded-xl apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                          </div>
                          <div>
                            <div className="font-display text-sm font-bold text-on-surface">No Venture Shares Owned Yet</div>
                            <p className="text-xs text-on-surface-variant max-w-sm mt-0.5 font-light">
                              Pledge investment in student or faculty ventures with open funding to earn collegiate shares (0.001 × % invested) and reputation karma points.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActivePath("projects")}
                            className="px-4 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 text-xs font-mono font-bold hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[15px]">rocket_launch</span>
                            <span>Explore Open Projects & Invest</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 sm:p-12 rounded-3xl bg-surface-container-lowest/90 border border-outline-variant/40 flex flex-col items-center justify-center text-center gap-6 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300 max-w-2xl mx-auto my-4 relative overflow-hidden">
                  <div className="w-20 h-20 rounded-3xl apple-liquid-glass apple-liquid-glass-secondary flex items-center justify-center text-secondary shadow-lg">
                    <span className="material-symbols-outlined text-[36px]">lock</span>
                  </div>

                  <div className="max-w-md flex flex-col gap-2">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
                      Authentication Required
                    </h2>
                    <p className="text-on-surface-variant text-sm font-light leading-relaxed">
                      You are currently browsing ALCON as a guest. Sign in or register as a Student, Faculty member, or Alumni to view your verified passport and karma metrics.
                    </p>
                  </div>

                  {/* Feature preview list */}
                  <div className="w-full max-w-md p-4 rounded-2xl bg-surface-container-high/30 border border-outline-variant/30 flex flex-col gap-2.5 text-left text-xs font-mono">
                    <div className="flex items-center gap-2.5 text-on-surface">
                      <span className="material-symbols-outlined text-[#1e3a5f] text-[16px]">school</span>
                      <span>Faculty Verification: Lab Research Grants & Advisory Roles</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-on-surface">
                      <span className="material-symbols-outlined text-amber-400 text-[16px]">workspace_premium</span>
                      <span>Alumni Verification: Angel Syndicate & Micro-Grant Allocations</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[16px]">verified_user</span>
                      <span>Student Verification: Cryptographic Passport Node ID & KP</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 flex-wrap justify-center pt-2">
                    <button
                      onClick={() => setProfileTab("signin")}
                      className="px-6 py-2.5 rounded-xl apple-liquid-glass apple-liquid-glass-primary text-primary font-display font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Sign In with ALCON SSO</span>
                    </button>
                    <button
                      onClick={() => setProfileTab("signup")}
                      className="px-5 py-2.5 rounded-xl border border-outline-variant/50 hover:border-primary/50 text-on-surface hover:text-primary font-mono text-xs transition-colors cursor-pointer"
                    >
                      Register New Passport
                    </button>
                  </div>
                </div>
              )
            )}

            {/* TAB: SIGN IN */}
            {profileTab === "signin" && (
              <div className="max-w-xl mx-auto w-full p-8 rounded-2xl bg-surface-container-lowest/90 border border-outline-variant/40 shadow-2xl animate-in fade-in duration-300 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">lock_open</span>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-widest">
                        ALCON GATEWAY
                      </span>
                      <h2 className="font-display text-xl font-bold text-on-surface">Sign In to Passport</h2>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[11px]">
                    VERIFIED SSO
                  </span>
                </div>

                {/* CALLOUT BANNER: Direct Option to Signup as Alumni or Faculty */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-outline-variant/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]">workspace_premium</span>
                      <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                        New Research Faculty or Alumni?
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container-high text-on-surface-variant">
                      OFFICIAL CREDENTIALS
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Register your verified credentials to claim verified <span className="text-[#1e3a5f] font-semibold">Faculty</span> or <span className="text-amber-300 font-semibold">Alumni</span> status. Your account will be marked accordingly on your profile with dedicated badges and syndicate privileges.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSignupRole("faculty");
                        setSignupName("Prof. Alok Mathur");
                        setSignupEmail("a.mathur@alcon.network");
                        setSignupTitle("Professor & Lab PI");
                        setSignupDept("Robotics & Autonomy Lab (IITD)");
                        setProfileTab("signup");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#f0f4f9] hover:bg-[#f0f4f9] border border-[#d2dfec] text-[#1e3a5f] font-display font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#1e3a5f]">school</span>
                      <span>Sign Up as Faculty</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignupRole("alumni");
                        setSignupName("Manish Sharma");
                        setSignupEmail("manish.sharma@alcon.network");
                        setSignupTitle("Partner @ Frontier Syndicate");
                        setSignupClassYear("Class of 2019 (NSUT)");
                        setProfileTab("signup");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-display font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-300">workspace_premium</span>
                      <span>Sign Up as Alumni</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Role Selector for Sign In */}
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                      Select Sign-In Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSigninRole("student");
                          setSigninEmail("aarav.sharma@alcon.network");
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${signinRole === "student"
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-xs"
                            : "bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">school</span>
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSigninRole("faculty");
                          setSigninEmail("a.mathur@alcon.network");
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${signinRole === "faculty"
                            ? "bg-[#f0f4f9] border-[#d2dfec] text-[#1e3a5f] font-bold shadow-xs"
                            : "bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        <span>Faculty</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSigninRole("alumni");
                          setSigninEmail("manish.sharma@alcon.network");
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${signinRole === "alumni"
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-xs"
                            : "bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                        <span>Alumni</span>
                      </button>
                    </div>
                  </div>


                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-on-surface-variant uppercase">
                        Institutional / Node Email
                      </label>
                      <input
                        className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        placeholder="you@alcon.network"
                        required
                        type="email"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-on-surface-variant uppercase">
                        Password / Passkey
                      </label>
                      <input
                        className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                        defaultValue="••••••••••••"
                        required
                        type="password"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-2 w-full py-3 bg-primary text-on-primary font-display text-sm font-semibold rounded-xl hover:bg-primary-fixed transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Sign In as Verified {signinRole.toUpperCase()}</span>
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setProfileTab("signup")}
                      className="text-xs font-mono text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      Need a new collegiate passport? <span className="text-primary underline">Sign up here</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SIGN UP */}
            {profileTab === "signup" && (
              <div className="max-w-2xl mx-auto w-full p-8 rounded-2xl bg-surface-container-lowest/90 border border-outline-variant/40 shadow-2xl animate-in fade-in duration-300 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${signupRole === "faculty"
                        ? "bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]"
                        : signupRole === "alumni"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                          : "bg-secondary/10 text-secondary border border-secondary/30"
                      }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {signupRole === "faculty" ? "school" : signupRole === "alumni" ? "workspace_premium" : "person_add"}
                      </span>
                    </div>
                    <div>
                      <span className={`font-mono text-[10px] uppercase font-bold tracking-widest ${signupRole === "faculty" ? "text-[#1e3a5f]" : signupRole === "alumni" ? "text-amber-400" : "text-secondary"
                        }`}>
                        CAMPUS CREDENTIAL ONBOARDING
                      </span>
                      <h2 className="font-display text-xl font-bold text-on-surface">
                        Register as {signupRole === "faculty" ? "Faculty Member" : signupRole === "alumni" ? "Campus Alumni" : "Collegiate Student"}
                      </h2>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold ${signupRole === "faculty"
                      ? "bg-[#f0f4f9] text-[#1e3a5f] border border-[#d2dfec]"
                      : signupRole === "alumni"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        : "bg-surface-container-high text-secondary"
                    }`}>
                    {signupRole.toUpperCase()} NODE
                  </span>
                </div>

                {/* 3-WAY ROLE SELECTION */}
                <div className="flex flex-col gap-2.5">
                  <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                    Select Your Role & Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Student card */}
                    <button
                      type="button"
                      onClick={() => {
                        setSignupRole("student");
                        if (!signupClassYear) setSignupClassYear("Class of 2026");
                        if (!signupMajor) setSignupMajor("Symbolic Systems & AI");
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${signupRole === "student"
                          ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-xs"
                          : "bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[20px]">school</span>
                        {signupRole === "student" && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                      </div>
                      <div>
                        <div className="font-display text-sm font-bold text-on-surface">Student</div>
                        <div className="text-[11px] font-mono opacity-80">Builder & Researcher</div>
                      </div>
                    </button>

                    {/* Faculty card */}
                    <button
                      type="button"
                      onClick={() => {
                        setSignupRole("faculty");
                        if (!signupTitle) setSignupTitle("Professor & Lab PI");
                        if (!signupDept) setSignupDept("Robotics & Autonomy Lab");
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${signupRole === "faculty"
                          ? "bg-[#f0f4f9] border-[#d2dfec] text-[#1e3a5f] shadow-xs"
                          : "bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                        {signupRole === "faculty" && <span className="w-2 h-2 rounded-full bg-[#1e3a5f]"></span>}
                      </div>
                      <div>
                        <div className="font-display text-sm font-bold text-on-surface">Faculty</div>
                        <div className="text-[11px] font-mono opacity-80">Professor, PI & Advisor</div>
                      </div>
                    </button>

                    {/* Alumni card */}
                    <button
                      type="button"
                      onClick={() => {
                        setSignupRole("alumni");
                        if (!signupTitle) setSignupTitle("Partner @ Frontier Syndicate");
                        if (!signupClassYear) setSignupClassYear("Class of 2019");
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${signupRole === "alumni"
                          ? "bg-amber-500/15 border-amber-400 text-amber-300 shadow-xs"
                          : "bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                        {signupRole === "alumni" && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                      </div>
                      <div>
                        <div className="font-display text-sm font-bold text-on-surface">Alumni</div>
                        <div className="text-[11px] font-mono opacity-80">Angel Syndicate & Mentor</div>
                      </div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  {/* Research Domain / Node Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-on-surface-variant uppercase">
                      Research Domain / Node Affiliation
                    </label>
                    <select
                      value={signupCampus}
                      onChange={(e) => setSignupCampus(e.target.value)}
                      className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      <option value="Node Alpha (Autonomous Systems & AI)">Node Alpha (Autonomous Systems & AI)</option>
                      <option value="Node Beta (Distributed ML & Accelerators)">Node Beta (Distributed ML & Accelerators)</option>
                      <option value="Node Gamma (Quantum Computing & ZK)">Node Gamma (Quantum Computing & ZK)</option>
                      <option value="Node Delta (Robotics & Embedded Hardware)">Node Delta (Robotics & Embedded Hardware)</option>
                      <option value="Node Epsilon (Frontier Syndicate & Ventures)">Node Epsilon (Frontier Syndicate & Ventures)</option>
                      <option value="Node Zeta (Applied Bio & Molecular GNN)">Node Zeta (Applied Bio & Molecular GNN)</option>
                      <option value="Global Engineering Node">Global Engineering Node (Open Research)</option>
                    </select>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-on-surface-variant uppercase">
                        {signupRole === "faculty" ? "Full Name & Honorific" : "Full Name"}
                      </label>
                      <input
                        className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-secondary transition-colors"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder={signupRole === "faculty" ? "Prof. Alok Mathur" : signupRole === "alumni" ? "Manish Sharma" : "Aarav Sharma"}
                        required
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-on-surface-variant uppercase">
                        {signupRole === "faculty" ? "Official Faculty Email" : signupRole === "alumni" ? "Alumni / Professional Email" : "Institutional Email"}
                      </label>
                      <input
                        className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-secondary transition-colors"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@alcon.network"
                        required
                        type="email"
                      />
                    </div>
                  </div>

                  {/* Role-Specific Fields */}
                  {signupRole === "faculty" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Faculty Academic Title / Rank
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-[#1e3a5f] transition-colors"
                          value={signupTitle}
                          onChange={(e) => setSignupTitle(e.target.value)}
                          placeholder="Professor of Computer Science & Lab PI"
                          required
                          type="text"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Academic Department / Lab
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-[#1e3a5f] transition-colors"
                          value={signupDept}
                          onChange={(e) => setSignupDept(e.target.value)}
                          placeholder="Robotics & Autonomy Laboratory"
                          required
                          type="text"
                        />
                      </div>
                    </div>
                  )}

                  {signupRole === "alumni" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Graduation Year
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-amber-400 transition-colors"
                          value={signupClassYear}
                          onChange={(e) => setSignupClassYear(e.target.value)}
                          placeholder="Class of 2018"
                          required
                          type="text"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Current Role / Angel Syndicate
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-amber-400 transition-colors"
                          value={signupTitle}
                          onChange={(e) => setSignupTitle(e.target.value)}
                          placeholder="Partner @ Frontier Syndicate & Angel Mentor"
                          required
                          type="text"
                        />
                      </div>
                    </div>
                  )}

                  {signupRole === "student" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Degree & Major
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-secondary transition-colors"
                          value={signupMajor}
                          onChange={(e) => setSignupMajor(e.target.value)}
                          placeholder="Symbolic Systems & AI"
                          required
                          type="text"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-xs text-on-surface-variant uppercase">
                          Graduation Year
                        </label>
                        <input
                          className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-secondary transition-colors"
                          value={signupClassYear}
                          onChange={(e) => setSignupClassYear(e.target.value)}
                          placeholder="Class of 2026"
                          required
                          type="text"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`mt-2 w-full py-3.5 font-display text-sm font-semibold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${signupRole === "faculty"
                        ? "bg-[#1e3a5f] hover:bg-[#152a45] text-white shadow-xs"
                        : signupRole === "alumni"
                          ? "bg-amber-600 hover:bg-amber-500 text-white shadow-xs"
                          : "bg-secondary text-on-secondary hover:bg-secondary-fixed shadow-xs"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    <span>Complete Registration as Verified {signupRole.toUpperCase()}</span>
                  </button>
                </form>

                <div className="text-center pt-1 border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setProfileTab("signin")}
                    className="text-xs font-mono text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                  >
                    Already have a verified passport? <span className="text-primary underline">Sign in to your account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </>
    );
  };

  const isHomeView = (transitionPhase !== "idle" ? targetPath : activePath) === "home";

  return (
    <AppProvider activePath={activePath} onNavigate={(path) => setActivePath(path)}>
      <div
        className="font-body-md antialiased selection:bg-[#1e3a5f] selection:text-white min-h-screen flex flex-col justify-between relative overflow-x-hidden transition-colors duration-300 bg-transparent text-[#111c2d]"
      >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-xs backdrop-blur-xl shadow-xs animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header
        className={`fixed top-0 w-full z-50 transition-colors duration-300 pointer-events-none ${
          isHomeView
            ? "bg-transparent border-b-0 shadow-none"
            : "bg-white/20 backdrop-blur-xl border-b border-white/25 pointer-events-auto"
        }`}
      >
        <div className={`h-16 sm:h-20 w-full max-w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 ${
          isHomeView ? "pointer-events-none" : "pointer-events-auto"
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-4 xl:gap-6 shrink-0 pointer-events-auto">
            <button
              onClick={() => setActivePath("home")}
              className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer shrink-0"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 bg-[#1e3a5f]/85 text-white border border-white/30 backdrop-blur-md shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">hub</span>
              </div>
              <div className="flex flex-col">
                <span
                  className="font-display text-base sm:text-lg font-bold tracking-tight transition-colors text-[#111c2d] group-hover:text-[#1e3a5f]"
                >
                  ALCON
                </span>
                <span
                  className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest hidden sm:inline text-[#1e3a5f] font-semibold"
                >
                  Global Engineering Network
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links (hidden on home page, visible on designated subpages) */}
          {!isHomeView && (
            <nav
              className="pointer-events-auto hidden md:flex items-center gap-1 xl:gap-1.5 px-2 py-1.5 rounded-2xl backdrop-blur-xl shrink min-w-0 transition-colors bg-white/25 border border-white/30 shadow-none"
            >
            {(
              [
                { path: "home", label: "Home", icon: "home" },
                { path: "leaderboard", label: "Leaderboard", icon: "leaderboard" },
                { path: "community", label: "Community", icon: "forum" },
                { path: "projects", label: "Projects", icon: "rocket_launch" },
                { path: "investment", label: "Resources", icon: "auto_stories" },
                { path: "mentor", label: "Mentor", icon: "school" },
                { path: "friends", label: "Friends", icon: "diversity_3" },
              ] as const
            ).map((item) => {
              const isActive = (transitionPhase !== "idle" ? targetPath : activePath) === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => setActivePath(item.path)}
                  title={item.label}
                  className={`group px-2 xl:px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-medium flex items-center gap-1.5 xl:gap-2 shrink-0 ${
                    isActive
                      ? "bg-[#1e3a5f]/85 text-white shadow-sm border border-[#1e3a5f]/80"
                      : "text-[#111c2d] hover:text-[#0f172a] hover:bg-white/35 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isActive
                        ? isHomeView
                          ? "bg-white/20 text-white"
                          : "apple-liquid-glass apple-liquid-glass-primary text-primary shadow-xs"
                        : isHomeView
                        ? "text-[#475569] group-hover:text-[#1e3a5f]"
                        : "apple-liquid-glass apple-liquid-glass-neutral text-on-surface-variant group-hover:text-primary group-hover:apple-liquid-glass-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                  </div>
                  <span className="font-display tracking-tight font-semibold hidden lg:inline whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
          )}

          {/* User Auth Profile & Inbox Icons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 pointer-events-auto">
            {/* Account Node Inbox Button */}
            <button
              type="button"
              onClick={() => setIsInboxOpen(true)}
              title={`Node Communications Tray (${inboxItems.filter((i) => !i.read).length} unread updates) • Friend Requests, Project Enrollments, Karma & Funds for ${currentUser.name}`}
              className={`group relative p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isInboxOpen
                  ? isHomeView
                    ? "bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-md scale-105"
                    : "bg-primary/20 border-primary text-primary shadow-xs ring-1 ring-[#1e3a5f]/30 scale-105"
                  : isHomeView
                  ? "bg-white/20 border-white/25 text-[#1e293b] hover:text-[#1e3a5f] hover:bg-white/35 backdrop-blur-md hover:scale-105"
                  : "bg-surface-container-low/70 border-outline-variant/40 text-on-surface hover:text-primary hover:border-primary/50 hover:shadow-xs hover:scale-105"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] sm:text-[22px] transition-transform group-hover:rotate-6">
                  {inboxItems.some((i) => !i.read) ? "notifications_active" : "inbox"}
                </span>
                {inboxItems.filter((i) => !i.read).length > 0 && (
                  <span className="absolute -top-2 -right-2 px-1.5 min-w-[18px] h-[18px] text-[10px] font-mono font-bold rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs animate-pulse">
                    {inboxItems.filter((i) => !i.read).length > 99
                      ? "99+"
                      : inboxItems.filter((i) => !i.read).length}
                  </span>
                )}
              </div>
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => {
                  setActivePath("profile");
                  setProfileTab("profile");
                }}
                title={`${currentUser.name} (${currentUser.role.toUpperCase()}) • ${currentUser.campus}`}
                className={`group relative p-1 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  (transitionPhase !== "idle" ? targetPath : activePath) === "profile"
                    ? "bg-surface-container-high border-primary/50 shadow-xs ring-1 ring-[#1e3a5f]/20"
                    : isHomeView
                    ? "bg-white/20 border-white/25 backdrop-blur-md hover:bg-white/35 hover:scale-105"
                    : "bg-surface-container-low/70 border-outline-variant/40 hover:border-primary/50 hover:shadow-xs hover:scale-105"
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${
                      isHomeView
                        ? "bg-white/30 text-[#1e3a5f] border border-white/30 shadow-none"
                        : `apple-liquid-glass ${
                            currentUser.role === "faculty"
                              ? "apple-liquid-glass-secondary text-[#1e3a5f] border-[#d2dfec]"
                              : currentUser.role === "alumni"
                              ? "apple-liquid-glass-secondary text-amber-300 border-amber-400/40"
                              : "apple-liquid-glass-primary text-primary border-primary/40"
                          }`
                    } flex items-center justify-center font-display font-bold text-xs sm:text-sm shadow-md`}
                  >
                    {currentUser.avatar}
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 animate-pulse ${
                      currentUser.role === "faculty"
                        ? "bg-[#1e3a5f]"
                        : currentUser.role === "alumni"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  ></span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActivePath("profile");
                  setProfileTab("signin");
                }}
                title="Sign In / Passport"
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                  isHomeView
                    ? "bg-white/20 border-white/25 text-[#1e3a5f] hover:bg-white/35 backdrop-blur-md shadow-none"
                    : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:scale-105"
                }`}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">account_circle</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BORDER-ONLY BLUR (CENTER IS 100% CLEAR - ZERO WHOLE-SCREEN BLUR) */}
      <div
        className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-500 select-none ${transitionPhase === "sliding" ? "opacity-100" : "opacity-0"
          }`}
      >
        {/* Top edge border blur */}
        <div className="absolute top-0 left-0 right-0 h-10 backdrop-blur-md bg-gradient-to-b from-white/30 to-transparent"></div>
        {/* Bottom edge border blur */}
        <div className="absolute bottom-0 left-0 right-0 h-10 backdrop-blur-md bg-gradient-to-t from-white/30 to-transparent"></div>
        {/* Left edge border blur */}
        <div className="absolute top-0 bottom-0 left-0 w-10 backdrop-blur-md bg-gradient-to-r from-white/30 to-transparent"></div>
        {/* Right edge border blur */}
        <div className="absolute top-0 bottom-0 right-0 w-10 backdrop-blur-md bg-gradient-to-l from-white/30 to-transparent"></div>
      </div>

      {/* MAIN VIEW CONTAINER WITH SIMULTANEOUS DUAL-SLIDE */}
      <main
        className={`w-full flex-1 overflow-x-hidden ${
          (transitionPhase === "idle" ? activePath : targetPath) === "home"
            ? "h-screen overflow-hidden flex flex-col pt-0"
            : (transitionPhase === "idle" ? activePath : targetPath) === "community"
            ? "h-screen overflow-hidden flex flex-col pt-20"
            : "pt-20 min-h-screen"
        }`}
      >
        <div className="relative w-full flex-1 overflow-x-hidden">
          {/* OUTGOING PAGE (SLIDING OUT ON TOP WITHOUT DISRUPTING FLOW) */}
          {transitionPhase === "sliding" && (
            <div
              className={`w-full absolute top-0 left-0 pointer-events-none z-10 ${slideDirection === "left"
                  ? "animate-slide-out-left"
                  : "animate-slide-out-right"
                }`}
            >
              {renderViewContent(fromPath)}
            </div>
          )}

          {/* INCOMING PAGE (ALWAYS IN NORMAL DOCUMENT FLOW - ZERO LAYOUT SHIFT OR FONT TWITCH) */}
          <div
            className={`w-full ${transitionPhase === "sliding"
                ? slideDirection === "left"
                  ? "animate-slide-in-right"
                  : "animate-slide-in-left"
                : ""
              }`}
          >
            {renderViewContent(transitionPhase === "sliding" ? targetPath : activePath)}
          </div>
        </div>
      </main>

      {/* FOOTER - Hidden in Community & Home views */}
      {activePath !== "community" && activePath !== "home" && (
        <footer className="w-full bg-white/20 backdrop-blur-xl border-t border-white/25 mt-20">
          <div className="w-full px-4 sm:px-8 lg:px-12 pt-16 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-12">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">hub</span>
                  </div>
                  <span className="font-display text-lg font-bold text-on-surface">ALCON</span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant max-w-sm leading-relaxed">
                  The global engineering network uniting founders, creators, and researchers across advanced technology nodes.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-primary uppercase tracking-wider">[N.01] // Network</span>
                <nav className="flex flex-col gap-2 font-mono text-xs text-on-surface-variant">
                  <button onClick={() => setActivePath("home")} className="text-left hover:text-primary cursor-pointer">
                    Home
                  </button>
                  <button onClick={() => setActivePath("leaderboard")} className="text-left hover:text-primary cursor-pointer">
                    Leaderboard
                  </button>
                  <button onClick={() => setActivePath("community")} className="text-left hover:text-primary cursor-pointer">
                    Community
                  </button>
                </nav>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-primary uppercase tracking-wider">[N.02] // Venture</span>
                <nav className="flex flex-col gap-2 font-mono text-xs text-on-surface-variant">
                  <button onClick={() => setActivePath("projects")} className="text-left hover:text-primary cursor-pointer">
                    Projects
                  </button>
                  <button onClick={() => setActivePath("investment")} className="text-left hover:text-primary cursor-pointer">
                    Resources by Faculty
                  </button>
                </nav>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-primary uppercase tracking-wider">[N.03] // Synergy</span>
                <nav className="flex flex-col gap-2 font-mono text-xs text-on-surface-variant">
                  <button onClick={() => setActivePath("mentor")} className="text-left hover:text-primary cursor-pointer">
                    Mentor
                  </button>
                  <button onClick={() => setActivePath("friends")} className="text-left hover:text-primary cursor-pointer">
                    Friends
                  </button>
                </nav>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-secondary uppercase tracking-wider">[N.04] // Nodes</span>
                <div className="flex flex-col gap-1 font-mono text-xs text-on-surface-variant">
                  <span>Systems • AI Acceleration</span>
                  <span>Robotics • Cryptography</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-on-surface-variant">
              <span>© 2026 ALCON Global Engineering Network. All rights reserved.</span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-on-surface transition-colors">
                  Terms of Protocol
                </a>
                <a href="#" className="hover:text-on-surface transition-colors">
                  Student Privacy Policy
                </a>
                <a href="#" className="hover:text-on-surface transition-colors">
                  Security & Trust
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
      {/* CREATE COMMUNITY DIALOG MODAL (SAVES TO DATABASE) */}
      {isCreateCommunityOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-primary/40 shadow-[0_8px_30px_rgba(30,58,95,0.08)] flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-primary/10 blur-[80px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">group_add</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-on-surface">
                    Create New Community
                  </h3>
                  <span className="font-mono text-[11px] text-primary">
                    Saved directly to Collegiate Database
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateCommunityOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCommunitySubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                  Community Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Drone Swarms Lab"
                  value={newCommunityForm.name}
                  onChange={(e) =>
                    setNewCommunityForm({ ...newCommunityForm, name: e.target.value })
                  }
                  className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Technical Domain *
                  </label>
                  <select
                    value={newCommunityForm.category}
                    onChange={(e) =>
                      setNewCommunityForm({ ...newCommunityForm, category: e.target.value })
                    }
                    className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl px-3 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Robotics & Silicon">Robotics & Silicon</option>
                    <option value="Cryptography & ZK">Cryptography & ZK</option>
                    <option value="Bioengineering">Bioengineering</option>
                    <option value="Aerospace & Satellites">Aerospace & Satellites</option>
                    <option value="NeuroTech">NeuroTech</option>
                    <option value="Quantum Computing">Quantum Computing</option>
                    <option value="Fintech & Quant">Fintech & Quant</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Node Scope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Global Syndicate • 120+ Nodes"
                    value={newCommunityForm.campus}
                    onChange={(e) =>
                      setNewCommunityForm({ ...newCommunityForm, campus: e.target.value })
                    }
                    className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                  Mission & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your research roadmap, paper targets, or hardware build goals..."
                  value={newCommunityForm.desc}
                  onChange={(e) =>
                    setNewCommunityForm({ ...newCommunityForm, desc: e.target.value })
                  }
                  className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Icon Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                  Avatar Icon Symbol
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "memory",
                    "precision_manufacturing",
                    "lock",
                    "biotech",
                    "rocket_launch",
                    "psychology",
                    "code",
                    "hub",
                    "terminal",
                    "bolt",
                    "science",
                    "radar",
                  ].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewCommunityForm({ ...newCommunityForm, icon: ic })}
                      className={`h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${newCommunityForm.icon === ic
                          ? "bg-primary/20 border-primary text-primary shadow-xs"
                          : "bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCommunityOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCommunity}
                  className="px-6 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] text-white shadow-sm font-display font-semibold text-xs shadow-xs hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCommunity ? (
                    <span>Saving to Database...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                      <span>Create & Add to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATTACH FILE & SHARE PROJECT CONTRIBUTION */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-primary/40 shadow-[0_8px_30px_rgba(30,58,95,0.08)] flex flex-col gap-5 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-primary/10 blur-[80px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">source</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-primary">
                    PROJECT CONTRIBUTION & ATTACHMENT
                  </span>
                  <h3 className="font-display text-xl font-bold text-on-surface">
                    Share Project File
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Karma Incentive Callout Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-primary/10 border border-amber-400/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">star</span>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-mono font-bold text-amber-300">
                  Earn +100 KP Project Contribution Karma
                </span>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  When you attach code, schematics, or documentation to this project and the <strong>Project Admin</strong> gives it a <span className="text-amber-300 font-semibold">⭐ reaction</span>, you are immediately awarded verified reputation Karma.
                </p>
              </div>
            </div>

            {/* Target Project Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-on-surface-variant uppercase font-medium flex items-center justify-between">
                <span>Target Project *</span>
                <span className="text-[10px] text-primary flex items-center gap-1 font-semibold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                  Auto-selected for current chat
                </span>
              </label>
              <select
                className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
                value={attachForm.projectId}
                onChange={(e) => {
                  const sel = projects.find((p) => p.id === e.target.value) || projects[0];
                  setAttachForm({
                    ...attachForm,
                    projectId: sel.id,
                    projectTitle: sel.title,
                    projectAdmin: sel.author || "Aarav Sharma",
                  });
                }}
              >
                {projects.map((p) => {
                  const isCurrentChatTarget = p.id === getProjectForChat(selectedCommunityId).id;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.title} (Admin: {p.author}) {isCurrentChatTarget ? "★ [Current Chat Target]" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* File Info & Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-on-surface-variant uppercase font-medium flex items-center justify-between">
                <span>File to Attach *</span>
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[13px]">folder_open</span>
                  <span>Browse Device</span>
                </button>
              </label>
              <div className="p-3 rounded-xl bg-surface-container-high/50 border border-outline-variant/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      {attachForm.fileType === "code"
                        ? "terminal"
                        : attachForm.fileType === "archive"
                          ? "folder_zip"
                          : attachForm.fileType === "diagram"
                            ? "schema"
                            : "description"}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs font-bold text-on-surface truncate">
                      {attachForm.fileName || "No file chosen yet"}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      {attachForm.fileSize} • {attachForm.fileType.toUpperCase()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-primary/20 hover:text-primary text-xs font-mono text-on-surface transition-colors cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Custom Contribution Note */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                Contribution Note / Message (Optional)
              </label>
              <textarea
                rows={2}
                value={attachForm.customNote}
                onChange={(e) => setAttachForm({ ...attachForm, customNote: e.target.value })}
                placeholder="e.g. Added FP8 quantization kernels with 28% memory reduction for sequence lengths > 16k..."
                className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl p-3 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAttachContribution}
                className="px-6 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] text-white shadow-sm font-display font-semibold text-xs shadow-xs hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">attach_file</span>
                <span>Attach to Message</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* COMMUNITY DETAILS & LEAVE/DELETE DIALOG MODAL (UPDATES DATABASE) */}
      {isCommunityDetailsOpen && (() => {
        const activeComm = communities.find((c) => c.id === selectedCommunityId) || communities[0];
        if (!activeComm) return null;
        const isOwner = Boolean(activeComm.isCreatedByMe || activeComm.id?.startsWith("comm-"));

        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-secondary/40 shadow-xs flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-secondary/10 blur-[80px] pointer-events-none"></div>

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeComm.avatarColor} border border-secondary/40 flex items-center justify-center text-secondary shadow-xs`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {activeComm.icon || "hub"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-xl font-bold text-on-surface">
                        {activeComm.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary font-mono text-[9px] font-bold">
                        {activeComm.code}
                      </span>
                      {isOwner && (
                        <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary/40 text-primary font-mono text-[9px] font-bold">
                          OWNER
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      Collegiate Channel Profile & Settings
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCommunityDetailsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Details Body */}
              <div className="flex flex-col gap-5">
                {/* Overview & Description */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Mission & Focus
                  </span>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface bg-surface-container-low/70 border border-outline-variant/30 rounded-xl p-3.5 leading-relaxed">
                    {activeComm.desc}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30 flex flex-col gap-0.5">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                      Active Members
                    </span>
                    <span className="font-display text-lg font-bold text-on-surface">
                      {activeComm.members} Researchers
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {activeComm.online} online now
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30 flex flex-col gap-0.5">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                      Domain Category
                    </span>
                    <span className="font-display text-sm font-bold text-secondary truncate">
                      {activeComm.category}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      Verified Peer Review
                    </span>
                  </div>
                </div>

                {/* Campus Scope */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Campus Network Scope
                  </span>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 font-mono text-xs text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[16px]">school</span>
                    <span>{activeComm.campus}</span>
                  </div>
                </div>

                {/* Connected Repositories / Pinned Docs */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Pinned Channels & Monorepos
                  </span>
                  <div className="flex flex-col gap-2 font-mono text-xs">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container-low/40 border border-outline-variant/20 text-on-surface">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">terminal</span>
                        <span>github.com/alcon-network/{activeComm.id}</span>
                      </span>
                      <span className="text-primary text-[10px] hover:underline cursor-pointer">Open ↗</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Leave Community OR Delete Community */}
              <div className="pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                  {isOwner ? (
                    <span className="text-secondary font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-secondary">admin_panel_settings</span>
                      Role: Founder / Creator (Superadmin)
                    </span>
                  ) : (
                    <span>Membership: Verified Contributor</span>
                  )}
                  <span className="text-emerald-400">Karma Earn Rate: Active</span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCommunityDetailsOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteCommunity(activeComm.id, activeComm.name)}
                      className="px-5 py-2.5 rounded-xl bg-error/20 border border-error/50 text-error hover:bg-error hover:text-on-error font-display font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                      title="Permanently erase this community from the database"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                      <span>Delete Community & Erase Database</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLeaveCommunity(activeComm.id, activeComm.name)}
                      className="px-5 py-2.5 rounded-xl bg-error/15 border border-error/40 text-error hover:bg-error hover:text-on-error font-display font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Leave Community & Update Database</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CREATE NEW PROJECT MODAL */}
      {isCreateProjectOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-primary/40 shadow-xs flex flex-col gap-6 relative">
            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-primary/10 blur-[80px] pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-on-surface">
                    Add New Project
                  </h3>
                  <span className="font-mono text-[11px] text-primary">
                    Publish venture details & co-founder requirements to network
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateProjectOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProjectSubmit} className="flex flex-col gap-4">
              {/* Title & Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Synapse Neural OS"
                    value={newProjectForm.title}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, title: e.target.value })
                    }
                    className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Development Stage *
                  </label>
                  <select
                    value={newProjectForm.filterKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      const tagMap: Record<string, string> = {
                        alpha: "ALPHA 0.1",
                        "pre-seed": "PRE-SEED BACKED",
                        grant: "GRANT FUNDED",
                        ideation: "IDEATION STAGE",
                      };
                      setNewProjectForm({
                        ...newProjectForm,
                        filterKey: val,
                        tag: tagMap[val] || "ALPHA 0.1",
                      });
                    }}
                    className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3 py-2.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary cursor-pointer transition-colors"
                  >
                    <option value="alpha">Alpha</option>
                    <option value="pre-seed">Pre-Seed</option>
                    <option value="grant">Grant Funded</option>
                    <option value="ideation">Ideation</option>
                  </select>
                </div>
              </div>

              {/* Campuses & Tech Stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Research Domains / Nodes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SYSTEMS + NEURAL NPU"
                    value={newProjectForm.campuses}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, campuses: e.target.value })
                    }
                    className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Tech Stack & Tools
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rust • WebAssembly • PyTorch"
                    value={newProjectForm.stack}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, stack: e.target.value })
                    }
                    className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Detailed Description *
                  </label>
                  <span className="font-mono text-[10px] text-primary">
                    Core problem, architecture & milestones
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter a thorough description of your project: What is the core problem? How does your system architecture solve it? What benchmarks or milestones have been achieved?"
                  value={newProjectForm.detailDescription}
                  onChange={(e) =>
                    setNewProjectForm({ ...newProjectForm, detailDescription: e.target.value })
                  }
                  className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Project Requirements */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Project Requirements & Needs *
                  </label>
                  <span className="font-mono text-[10px] text-primary">
                    Roles needed, tech skills & resources
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Specify all requirements: Which co-founder roles are you looking for? What technical skills (languages, math, hardware) are required? What compute, lab access, or time commitments are expected?"
                  value={newProjectForm.requirements}
                  onChange={(e) =>
                    setNewProjectForm({ ...newProjectForm, requirements: e.target.value })
                  }
                  className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Investment Needed Checkbox */}
              <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 flex flex-col gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newProjectForm.needsInvestment}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, needsInvestment: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 rounded border-outline-variant text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-[11px] shadow-xs">
                        <span className="material-symbols-outlined text-[13px]">payments</span>
                      </div>
                      <span>Investment Needed for Project</span>
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      Check this box if your collegiate venture is seeking angel capital, compute grants, or seed funding. Adds an &quot;Invest&quot; button next to Join.
                    </span>
                  </div>
                </label>

                {newProjectForm.needsInvestment && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs text-emerald-400 uppercase font-bold tracking-wider">
                        Expected Investment Amount (INR) *
                      </label>
                      <span className="font-mono text-[10px] text-emerald-300 font-semibold">
                        Required • Displays on project card & info
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-emerald-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="10000"
                        step="10000"
                        required={newProjectForm.needsInvestment}
                        placeholder="e.g. 5000000"
                        value={newProjectForm.expectedInvestment}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewProjectForm({
                            ...newProjectForm,
                            expectedInvestment: val,
                            investmentGoal: val ? `₹${Number(val).toLocaleString('en-IN')}` : "",
                          });
                        }}
                        className="w-full bg-surface-container-high/40 border border-emerald-500/50 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      Backers of this project will receive 0.001 × % invested share reflected under Shares Owned in their Profile.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-on-primary font-display font-semibold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmittingProject ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      <span>Publishing to Database...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">publish</span>
                      <span>Publish Project to Network</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT FULL OVERVIEW MODAL */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-primary/40 shadow-xs flex flex-col gap-6 relative">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs text-primary font-medium">
                    [{selectedProjectForDetail.id}] • {selectedProjectForDetail.campuses}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                    {selectedProjectForDetail.tag}
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
                  {selectedProjectForDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectForDetail(null)}
                className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Expected Investment Banner */}
              {selectedProjectForDetail.needsInvestment && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 flex items-center justify-between flex-wrap gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-emerald-300">
                      <span className="material-symbols-outlined text-[20px]">payments</span>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                        Investment Open • Target Funding
                      </div>
                      <div className="font-display text-lg font-bold text-on-surface">
                        Expected Investment:{" "}
                        <span className="text-emerald-300 font-extrabold">
                          {selectedProjectForDetail.investmentGoal || (selectedProjectForDetail.expectedInvestment ? `₹${Number(selectedProjectForDetail.expectedInvestment).toLocaleString('en-IN')}` : "₹50,00,000")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/40 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                    <span>Investors Receive 0.001 × % Invested Share + Karma</span>
                  </div>
                </div>
              )}

              {/* Detailed Description */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-primary uppercase font-bold tracking-wider">
                  // Detailed Project Dossier
                </span>
                <p className="text-on-surface text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {selectedProjectForDetail.detailDescription || selectedProjectForDetail.desc}
                </p>
              </div>

              {/* Requirements */}
              <div className="p-5 rounded-xl bg-surface-container-high/80 border border-primary/30 flex flex-col gap-2 shadow-inner">
                <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                  <span>Requirements & Co-Founder Roles Needed</span>
                </div>
                <p className="text-on-surface text-xs sm:text-sm leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedProjectForDetail.requirements}
                </p>
              </div>

              {/* Tech Stack */}
              <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant pt-2">
                <span className="text-primary font-semibold">Tech Stack:</span>
                <span>{selectedProjectForDetail.stack}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30 flex-wrap gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForDetail(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Close
                </button>
                {(selectedProjectForDetail.isCreatedByMe ||
                  (selectedProjectForDetail.author &&
                    currentUser?.name &&
                    selectedProjectForDetail.author.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) ||
                  currentUser?.role === "faculty") && (
                    <button
                      type="button"
                      onClick={() => handleDownloadProject(selectedProjectForDetail)}
                      className="px-4 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-primary text-primary font-mono text-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-all shadow-xs"
                      title="Download full project dossier and specification (Admin Only)"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Download Project</span>
                    </button>
                  )}
              </div>
              {selectedProjectForDetail.isCreatedByMe ? (
                <button
                  type="button"
                  onClick={() => {
                    const prj = selectedProjectForDetail;
                    setSelectedProjectForDetail(null);
                    setReviewingProjectRequests(prj);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  <span>
                    See Joining Requests ({projectRequests.filter((r) => r.projectId === selectedProjectForDetail.id).length})
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5 flex-wrap">
                  {selectedProjectForDetail.needsInvestment && (
                    <button
                      type="button"
                      onClick={() => {
                        const prj = selectedProjectForDetail;
                        setSelectedProjectForDetail(null);
                        setInvestingProject(prj);
                      }}
                      className="px-5 py-2.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs shadow-xs hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                      title="Pledge investment in this project"
                    >
                      <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[14px]">payments</span>
                      </div>
                      <span>Invest in Venture</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const prj = selectedProjectForDetail;
                      setSelectedProjectForDetail(null);
                      setApplyingProject(prj);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-amber-400 text-on-secondary font-display font-semibold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Join Project</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JOIN PROJECT APPLICATION MODAL */}
      {applyingProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-secondary/50 shadow-xs flex flex-col gap-6 relative">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 border border-secondary/30 text-secondary font-mono text-[10px] font-bold">
                    COLLEGIATE APPLICATION
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    [{applyingProject.id}]
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-on-surface">
                  Join {applyingProject.title}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Founder: <span className="text-secondary font-mono font-medium">{applyingProject.author || "Collegiate Founder"}</span> • {applyingProject.campuses}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyingProject(null)}
                className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Target project requirements preview */}
            {applyingProject.requirements && (
              <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-xs">
                <span className="text-secondary font-mono font-bold uppercase tracking-wider block mb-1">
                  Founder's Stated Requirements:
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  {applyingProject.requirements}
                </p>
              </div>
            )}

            <form onSubmit={handleJoinProjectSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant font-medium">
                    Your Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={joinForm.applicantName}
                    onChange={(e) => setJoinForm({ ...joinForm, applicantName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant font-medium">
                    Affiliation & Focus
                  </label>
                  <input
                    type="text"
                    value={joinForm.applicantCampus}
                    onChange={(e) => setJoinForm({ ...joinForm, applicantCampus: e.target.value })}
                    placeholder="e.g. Fellow '26 • CS & Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-on-surface-variant font-medium">
                  Applying Role / Specialization
                </label>
                <input
                  type="text"
                  value={joinForm.role}
                  onChange={(e) => setJoinForm({ ...joinForm, role: e.target.value })}
                  placeholder="e.g. Core Contributor / Systems Engineer / ML Lead"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Student Biodata & Academic Background */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs text-secondary font-semibold">
                    Student Biodata & Academic Background <span className="text-error">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    Coursework, experience, projects
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={joinForm.bio}
                  onChange={(e) => setJoinForm({ ...joinForm, bio: e.target.value })}
                  placeholder="Share your student biodata: year, technical skills, previous projects/hackathons, relevant coursework (e.g. Distributed Systems, ML), and how you can contribute..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors leading-relaxed"
                />
              </div>

              {/* GitHub Profile Link */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-on-surface" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub Profile Link <span className="text-error">*</span></span>
                </label>
                <input
                  type="url"
                  required
                  value={joinForm.github}
                  onChange={(e) => setJoinForm({ ...joinForm, github: e.target.value })}
                  placeholder="https://github.com/your-username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors font-mono"
                />
              </div>

              {/* LinkedIn Profile Link */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>LinkedIn Profile Link <span className="text-error">*</span></span>
                </label>
                <input
                  type="url"
                  required
                  value={joinForm.linkedin}
                  onChange={(e) => setJoinForm({ ...joinForm, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30 mt-2">
                <button
                  type="button"
                  onClick={() => setApplyingProject(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-high text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJoinRequest}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-amber-400 text-on-secondary font-display font-bold text-xs shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingJoinRequest ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Submit Application to Founder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OWNER: REVIEW JOINING REQUESTS MODAL */}
      {reviewingProjectRequests && (() => {
        const matchingRequests = projectRequests.filter(
          (r) => r.projectId === reviewingProjectRequests.id
        );
        const pendingCount = matchingRequests.filter((r) => r.status === "pending").length;

        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-primary/50 shadow-xs flex flex-col gap-6 relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary font-mono text-[10px] font-bold">
                      VENTURE OWNER CONSOLE
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">
                      [{reviewingProjectRequests.id}]
                    </span>
                    {pendingCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold animate-pulse">
                        {pendingCount} Pending Review
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-on-surface">
                    Joining Requests • {reviewingProjectRequests.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Review student credentials, biodata background, and verified GitHub & LinkedIn profiles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewingProjectRequests(null)}
                  className="w-8 h-8 rounded-xl apple-liquid-glass apple-liquid-glass-neutral hover:apple-liquid-glass-rose text-on-surface-variant hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Request List or Empty State */}
              {matchingRequests.length === 0 ? (
                <div className="p-12 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/40 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-3xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary shadow-xl">
                    <span className="material-symbols-outlined text-[28px]">group_off</span>
                  </div>
                  <div className="max-w-md">
                    <h4 className="font-display font-bold text-base text-on-surface">
                      No Joining Requests Received Yet
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      When collegiate engineers and researchers apply to join {reviewingProjectRequests.title}, their biodata, GitHub repos, and LinkedIn links will be listed here for your review and approval.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {matchingRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 ${req.status === "accepted"
                          ? "bg-emerald-950/20 border-emerald-500/40"
                          : req.status === "declined"
                            ? "bg-rose-950/20 border-rose-500/30 opacity-70"
                            : "bg-surface-container-low border-outline-variant/50 shadow-md"
                        }`}
                    >
                      {/* Top Candidate Row */}
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center font-display font-bold text-primary text-sm shadow-md">
                            {req.applicantAvatar || req.applicantName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-bold text-base text-on-surface">
                                {req.applicantName}
                              </h4>
                              {req.status === "accepted" && (
                                <span className="px-2.5 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                  Accepted
                                </span>
                              )}
                              {req.status === "declined" && (
                                <span className="px-2.5 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-rose text-rose-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                  <span className="material-symbols-outlined text-[12px]">cancel</span>
                                  Declined
                                </span>
                              )}
                              {req.status === "pending" && (
                                <span className="px-2.5 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-secondary text-amber-200 font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                                  Pending Review
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono text-on-surface-variant">
                              {req.applicantCampus} • <span className="text-primary font-medium">{req.role}</span>
                            </span>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <span className="text-[11px] font-mono text-on-surface-variant/70">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Biodata Section */}
                      <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex flex-col gap-1.5 shadow-inner">
                        <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-[12px]">
                            <span className="material-symbols-outlined text-[13px]">badge</span>
                          </div>
                          <span>Student Biodata & Academic Background:</span>
                        </span>
                        <p className="text-on-surface text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {req.bio}
                        </p>
                      </div>

                      {/* Social & Code Profiles (GitHub and LinkedIn) */}
                      <div className="flex items-center gap-3 flex-wrap pt-1">
                        <span className="font-mono text-xs text-on-surface-variant font-medium">
                          Profiles:
                        </span>

                        {/* GitHub Link */}
                        <a
                          href={req.github.startsWith("http") ? req.github : `https://${req.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-neutral hover:apple-liquid-glass-primary text-on-surface hover:text-primary transition-all text-xs font-mono flex items-center gap-2 group shadow-sm"
                          title="Open applicant's GitHub profile"
                        >
                          <svg className="w-4 h-4 text-on-surface group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                          <span className="font-semibold">GitHub Profile</span>
                          <span className="material-symbols-outlined text-[13px] opacity-70 group-hover:opacity-100">open_in_new</span>
                        </a>

                        {/* LinkedIn Link */}
                        <a
                          href={req.linkedin.startsWith("http") ? req.linkedin : `https://${req.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-neutral hover:apple-liquid-glass-secondary text-on-surface hover:text-[#0A66C2] transition-all text-xs font-mono flex items-center gap-2 group shadow-sm"
                          title="Open applicant's LinkedIn profile"
                        >
                          <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                          <span className="font-semibold">LinkedIn Profile</span>
                          <span className="material-symbols-outlined text-[13px] opacity-70 group-hover:opacity-100">open_in_new</span>
                        </a>
                      </div>

                      {/* Decisions Controls */}
                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/20">
                        {req.status !== "declined" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateRequestStatus(req.id, "declined")}
                            className="px-3.5 py-1.5 rounded-xl border border-outline-variant/40 hover:border-rose-500/50 hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-400 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                            <span>Decline</span>
                          </button>
                        )}

                        {req.status !== "accepted" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateRequestStatus(req.id, "accepted")}
                            className="px-4 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">done_all</span>
                            <span>Accept into Team</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                <span className="font-mono text-xs text-on-surface-variant">
                  Total Applicants: {matchingRequests.length}
                </span>
                <button
                  type="button"
                  onClick={() => setReviewingProjectRequests(null)}
                  className="px-5 py-2 rounded-xl bg-surface-container-high text-xs font-mono text-on-surface hover:text-primary transition-colors cursor-pointer"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* INVEST IN PROJECT MODAL */}
      {investingProject && (() => {
        const targetGoal =
          investingProject.expectedInvestment ||
          parseInvestmentAmount(investingProject.investmentGoal) ||
          25000;
        const pledgeNum = Number(investPledgeAmount) || 0;
        const pctInvested = targetGoal > 0 ? (pledgeNum / targetGoal) * 100 : 0;
        const shareEarned = 0.001 * pctInvested;
        const karmaEarned = pledgeNum;

        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-emerald-500/40 shadow-xs flex flex-col gap-6 relative">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">payments</span>
                      COLLEGIATE VENTURE SYNDICATE
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">
                      [{investingProject.id}]
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-on-surface">
                    Pledge Investment in {investingProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInvestingProject(null)}
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Founder & Project Overview banner with Expected Investment */}
              <div className="p-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-emerald-300 shadow-sm font-bold text-sm">
                    {investingProject.author ? investingProject.author.slice(0, 2).toUpperCase() : "PR"}
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-on-surface">
                      Founder: {investingProject.author || "Collegiate Creator"}
                    </div>
                    <div className="font-mono text-[11px] text-on-surface-variant">
                      {investingProject.campuses} • {investingProject.authorCampus || "Verified Member"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] text-emerald-400 uppercase font-semibold">Expected Investment</div>
                  <div className="font-mono text-xs text-on-surface font-bold">
                    ${targetGoal.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Real-time Dynamic Share & Karma Calculation Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 via-surface-container-high/40 to-surface-container-high/20 border border-emerald-500/40 flex flex-col gap-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-300 text-[18px]">pie_chart</span>
                    <span className="font-mono text-xs font-bold text-on-surface uppercase">
                      Investment Return & Equity Share
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                    Formula: 0.001 × % Invested
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex flex-col">
                    <span className="font-mono text-[10px] text-on-surface-variant">% of Expected Goal</span>
                    <span className="font-display text-base font-bold text-secondary">
                      {pctInvested.toFixed(2)}%
                    </span>
                    <span className="font-mono text-[9px] text-on-surface-variant/80">
                      ${pledgeNum.toLocaleString()} / ${targetGoal.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">Share You Get</span>
                    <span className="font-display text-base font-bold text-emerald-300">
                      {shareEarned.toFixed(4)}%
                    </span>
                    <span className="font-mono text-[9px] text-emerald-400">
                      In Shares Owned
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex flex-col">
                    <span className="font-mono text-[10px] text-primary font-bold uppercase">Karma Earned</span>
                    <span className="font-display text-base font-bold text-primary">
                      +{karmaEarned.toLocaleString()} KP
                    </span>
                    <span className="font-mono text-[9px] text-primary">
                      Reputation Boost
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePledgeInvestmentSubmit} className="flex flex-col gap-5">
                {/* Select Investment Pledge Tier */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Select Investment Pledge Amount *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {["25000", "50000", "100000", "250000"].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setInvestPledgeAmount(amt)}
                        className={`py-2.5 px-3 rounded-xl border text-center font-display font-bold text-sm transition-all cursor-pointer ${investPledgeAmount === amt
                            ? "apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 border-emerald-400/50 shadow-md scale-[1.02]"
                            : "bg-surface-container-high/60 border-outline-variant/40 text-on-surface hover:border-emerald-500/40"
                          }`}
                      >
                        ₹{Number(amt).toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-on-surface-variant uppercase font-medium">
                    Or Custom Investment Pledge (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-emerald-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      value={investPledgeAmount}
                      onChange={(e) => setInvestPledgeAmount(e.target.value)}
                      className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl pl-8 pr-3.5 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Investor Note */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-on-surface-variant uppercase font-medium">
                    Note to Founder / Syndicate Terms (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Introduce yourself, your campus angel network, or value-add (GPU credits, lab access, mentorship)..."
                    className="w-full bg-surface-container-high/40 border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Disclaimer */}
                <div className="p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 flex items-start gap-2.5 text-[11px] font-mono text-on-surface-variant/80">
                  <span className="material-symbols-outlined text-[15px] text-emerald-400 mt-0.5">verified_user</span>
                  <span>
                    Collegiate pledges allocate syndicate shares to your verified identity at 0.001 × % funded, immediately reflected under Shares Owned in your profile.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setInvestingProject(null)}
                    className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs shadow-[0_4px_20px_rgba(30,58,95,0.06)] hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    <span>Confirm Pledge (${Number(investPledgeAmount).toLocaleString()}) • Get {shareEarned.toFixed(4)}% Share</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* PEER PROFILE DOSSIER MODAL */}
      {selectedPeerForProfile && (() => {
        const p = selectedPeerForProfile;
        const isMe = p.id === activeViewerPersona;
        const isConnected =
          !isMe &&
          (!!connectedPeers[p.id] ||
            friendInvites.some(
              (inv) =>
                inv.status === "accepted" &&
                ((inv.senderId === activeViewerPersona && inv.recipientId === p.id) ||
                  (inv.senderId === p.id && inv.recipientId === activeViewerPersona))
            ));

        const pendingSentInvite =
          !isMe &&
          friendInvites.find(
            (inv) =>
              inv.senderId === activeViewerPersona &&
              inv.recipientId === p.id &&
              inv.status === "pending"
          );

        const pendingReceivedInvite =
          !isMe &&
          friendInvites.find(
            (inv) =>
              inv.senderId === p.id &&
              inv.recipientId === activeViewerPersona &&
              inv.status === "pending"
          );

        return (
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedPeerForProfile(null)}
          >
            <div
              className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-primary/40 shadow-xs flex flex-col gap-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full apple-liquid-glass apple-liquid-glass-primary text-primary font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[13px]">verified_user</span>
                    <span>Collegiate Researcher Dossier</span>
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    [{p.id}]
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPeerForProfile(null)}
                  className="w-8 h-8 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Hero Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 relative shadow-sm">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Avatar with Status Badge outside apple-liquid-glass to prevent clipping */}
                  <div className="relative flex-shrink-0 shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl apple-liquid-glass apple-liquid-glass-primary flex items-center justify-center text-primary font-bold font-display text-2xl sm:text-3xl shadow-lg">
                      <span>{p.avatar}</span>
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-container-low shadow-sm z-10 ${p.onlineStatus === "online"
                          ? "bg-emerald-400"
                          : p.onlineStatus === "building"
                            ? "bg-cyan-400"
                            : "bg-amber-400"
                        }`}
                      title={`Status: ${p.onlineStatus}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-on-surface leading-snug">
                        {p.name}
                      </h3>
                      <span className="font-mono text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                        {p.match}
                      </span>
                    </div>
                    <p className="font-mono text-xs sm:text-sm text-primary font-medium leading-normal">
                      {p.major}
                    </p>
                    <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant flex-wrap leading-normal">
                      <span>{p.campus}</span>
                      <span>•</span>
                      <span className="capitalize text-emerald-400 font-semibold">{p.onlineStatus}</span>
                      <span>•</span>
                      <span>{p.role}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:self-center flex-shrink-0 shrink-0 flex flex-col items-start sm:items-end gap-1.5">
                  <div className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                    <span className="material-symbols-outlined text-[15px]">trophy</span>
                    <span>{p.kp}</span>
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant/80 tracking-wide leading-normal">
                    Verified Research KP
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30 text-xs font-mono text-on-surface flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
                <span className="font-medium">{p.headline}</span>
              </div>

              {/* Bio / Research Dossier */}
              <div className="flex flex-col gap-2">
                <h4 className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-secondary">menu_book</span>
                  <span>Academic Research Bio & Focus</span>
                </h4>
                <div className="p-4 rounded-xl bg-surface-container-high/30 border border-outline-variant/30 text-xs sm:text-sm text-on-surface leading-relaxed">
                  {p.bio}
                </div>
              </div>

              {/* Competencies & Skills */}
              <div className="flex flex-col gap-2">
                <h4 className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">psychology</span>
                  <span>Technical Competencies & Systems</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {p.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-xs font-mono text-on-surface flex items-center gap-1.5 hover:border-primary/50 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Projects */}
              {p.activeProjects && p.activeProjects.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-emerald-400">rocket_launch</span>
                    <span>Active Research & Co-Founding Projects</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {p.activeProjects.map((proj) => (
                      <div
                        key={proj}
                        className="p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/30 flex items-center gap-2.5 text-xs font-mono text-on-surface"
                      >
                        <div className="w-7 h-7 rounded-lg apple-liquid-glass apple-liquid-glass-emerald flex items-center justify-center text-emerald-300">
                          <span className="material-symbols-outlined text-[15px]">deployed_code</span>
                        </div>
                        <span className="font-semibold">{proj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Profiles: GitHub & LinkedIn */}
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
                <h4 className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                  Verified External Profiles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 hover:border-primary/60 text-xs font-mono text-on-surface hover:text-primary transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg apple-liquid-glass apple-liquid-glass-neutral flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[16px]">code</span>
                      </div>
                      <div>
                        <span className="block font-bold">GitHub Profile</span>
                        <span className="block text-[10px] text-on-surface-variant group-hover:text-primary/80 transition-colors">
                          {p.github.replace("https://", "")}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">
                      open_in_new
                    </span>
                  </a>

                  <a
                    href={p.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 hover:border-secondary/60 text-xs font-mono text-on-surface hover:text-secondary transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg apple-liquid-glass apple-liquid-glass-secondary flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[16px]">link</span>
                      </div>
                      <div>
                        <span className="block font-bold">LinkedIn Profile</span>
                        <span className="block text-[10px] text-on-surface-variant group-hover:text-secondary/80 transition-colors">
                          {p.linkedin.replace("https://", "")}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-secondary transition-colors">
                      open_in_new
                    </span>
                  </a>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-outline-variant/30 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedPeerForProfile(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {isMe ? (
                    <span className="px-4 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-primary text-primary font-mono text-xs font-bold">
                      Your Active Persona Profile
                    </span>
                  ) : isConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-300 font-display font-semibold text-xs flex items-center gap-1.5 shadow-xs">
                        <span className="material-symbols-outlined text-[16px]">done_all</span>
                        <span>Connected Peer ✓</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPeerForProfile(null);
                          openDirectMessageWithPeer(p);
                        }}
                        className="px-4 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-primary text-primary font-display font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] transition-all"
                      >
                        <span className="material-symbols-outlined text-[15px]">chat</span>
                        <span>Direct Message</span>
                      </button>
                    </div>
                  ) : pendingReceivedInvite ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleDeclineInvite(pendingReceivedInvite.id);
                          setSelectedPeerForProfile(null);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-outline-variant/40 hover:border-rose-500/50 hover:bg-rose-500/10 text-xs font-mono text-on-surface-variant hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAcceptInvite(pendingReceivedInvite.id);
                          setSelectedPeerForProfile(null);
                        }}
                        className="px-5 py-2 rounded-xl apple-liquid-glass apple-liquid-glass-emerald text-emerald-200 font-display font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">done_all</span>
                        <span>Accept Invite</span>
                      </button>
                    </div>
                  ) : pendingSentInvite ? (
                    <span className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/50 text-amber-300 font-mono text-xs flex items-center gap-1.5 shadow-xs">
                      <span className="material-symbols-outlined text-[16px] animate-spin text-amber-400">sync</span>
                      <span>Invite Sent • Pending Acceptance</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleSendInvite(p);
                      }}
                      className="px-5 py-2.5 rounded-xl apple-liquid-glass apple-liquid-glass-primary text-primary font-display font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_add</span>
                      <span>Send Connection Invite</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* NODE COMMUNICATIONS INBOX MODAL */}
      <InboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        currentUser={currentUser}
        items={inboxItems}
        onAcceptFriend={handleAcceptInboxFriend}
        onDeclineFriend={handleDeclineInboxFriend}
        onAcceptEnrollment={handleAcceptInboxEnrollment}
        onDeclineEnrollment={handleDeclineInboxEnrollment}
        onMarkAllAsRead={handleMarkAllInboxRead}
        onNavigateToProfile={() => {
          setActivePath("profile");
          setProfileTab("profile");
        }}
        onNavigateToProjects={() => setActivePath("projects")}
        onNavigateToFriends={() => setActivePath("friends")}
      />

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-2 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 flex items-center justify-around shadow-2xl">
        {(
          [
            { path: "home", label: "Home", icon: "home" },
            { path: "leaderboard", label: "Rank", icon: "leaderboard" },
            { path: "community", label: "Guilds", icon: "forum" },
            { path: "projects", label: "Projects", icon: "rocket_launch" },
            { path: "investment", label: "Resources", icon: "auto_stories" },
            { path: "mentor", label: "Mentor", icon: "school" },
            { path: "friends", label: "Peers", icon: "diversity_3" },
          ] as const
        ).map((item) => {
          const isActive = (transitionPhase !== "idle" ? targetPath : activePath) === item.path;
          return (
            <button
              key={item.path}
              onClick={() => setActivePath(item.path)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer ${isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive
                    ? "apple-liquid-glass apple-liquid-glass-primary text-primary shadow-xs"
                    : "apple-liquid-glass apple-liquid-glass-neutral text-on-surface-variant"
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              </div>
              <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* LMAO Cinematic Cloud Voyage, Global Modals & Drawers */}
      <CloudVoyageOverlay />
      <SearchModal />
      <NotificationsDrawer />
      <KarmaLedgerModal />
      <QuickDirectoryModal />
      <Toast />
    </div>
  </AppProvider>
  );
}

