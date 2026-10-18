import { UserProfileState } from "../page";
import { FriendInvite, ProjectJoinRequest, ProjectItem } from "../page";
import { InboxItem } from "../components/InboxModal";

const SEED_INBOX_KEY_PREFIX = "alcon_inbox_items_v2_";

export function loadUserInboxItems(userName: string): InboxItem[] | null {
  if (typeof window === "undefined" || !userName) return null;
  try {
    const raw = localStorage.getItem(`${SEED_INBOX_KEY_PREFIX}${userName.toLowerCase().trim()}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading user inbox items:", err);
  }
  return null;
}

export function saveUserInboxItems(userName: string, items: InboxItem[]): void {
  if (typeof window === "undefined" || !userName) return;
  try {
    localStorage.setItem(
      `${SEED_INBOX_KEY_PREFIX}${userName.toLowerCase().trim()}`,
      JSON.stringify(items)
    );
  } catch (err) {
    console.error("Error saving user inbox items:", err);
  }
}

/**
 * Returns account-tailored inbox items for the current user.
 * Combines persisted custom items + system-generated items from friend invites,
 * project requests, karma points, and venture funds.
 */
export function getAccountInboxNotifications(
  user: UserProfileState,
  friendInvites: FriendInvite[],
  projectRequests: ProjectJoinRequest[],
  projects: ProjectItem[]
): InboxItem[] {
  if (!user || !user.name) return [];

  const stored = loadUserInboxItems(user.name);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  const items: InboxItem[] = [];
  const userNameLower = user.name.toLowerCase();
  const isAarav = userNameLower.includes("aarav");
  const isAlok = userNameLower.includes("alok") || user.role === "faculty";
  const isRohan = userNameLower.includes("rohan");
  const isPuneet = userNameLower.includes("puneet");

  // ==========================================
  // 1. FRIEND REQUESTS (Incoming to this user)
  // ==========================================
  const incomingInvites = friendInvites.filter(
    (inv) =>
      inv.recipientName?.toLowerCase() === userNameLower ||
      (isAarav && inv.recipientId === "AC")
  );

  if (incomingInvites.length > 0) {
    incomingInvites.forEach((inv) => {
      items.push({
        id: `friend-${inv.id}`,
        type: "friend_request",
        title: `Friend Request from ${inv.senderName}`,
        subtitle: `${inv.senderCampus} • ${inv.senderHeadline || "Research Peer"}`,
        timestamp: inv.createdAt || "Just now",
        read: inv.status !== "pending",
        friendInviteId: inv.id,
        senderName: inv.senderName,
        senderAvatar: inv.senderAvatar,
        senderCampus: inv.senderCampus,
        senderHeadline: inv.senderHeadline,
        friendMessage: inv.message,
        friendStatus: inv.status,
      });
    });
  } else if (isAarav) {
    // Default tailored friend requests for Aarav Sharma
    items.push(
      {
        id: "friend-aarav-1",
        type: "friend_request",
        title: "Friend Request from Sneha Patel",
        subtitle: "IGDTU '25 • Computational Bio & Molecular Dynamics ML",
        timestamp: "10 mins ago",
        read: false,
        friendInviteId: "inv-01",
        senderName: "Sneha Patel",
        senderAvatar: "SP",
        senderCampus: "IGDTU '25",
        senderHeadline: "Computational Bio & Molecular Dynamics ML",
        friendMessage:
          "Hey Aarav! Loved your Synapse Core microkernel architecture presentation. Would love to connect and chat about deterministic scheduling for molecular simulations!",
        friendStatus: "pending",
      },
      {
        id: "friend-aarav-2",
        type: "friend_request",
        title: "Friend Request from Rohan Nair",
        subtitle: "IIITD '26 • Zero-Knowledge Proofs & Cryptographic Circuits",
        timestamp: "2 hours ago",
        read: false,
        friendInviteId: "inv-02",
        senderName: "Rohan Nair",
        senderAvatar: "RN",
        senderCampus: "IIITD '26",
        senderHeadline: "Zero-Knowledge Proofs & Cryptographic Circuits",
        friendMessage:
          "Hi Aarav, our team at IIITD is exploring recursive ZK folding schemes. We'd love to connect and see if we can collaborate on verifiable edge runtimes.",
        friendStatus: "pending",
      }
    );
  } else if (isAlok) {
    // Default tailored friend requests for Prof. Alok Mathur
    items.push(
      {
        id: "friend-alok-1",
        type: "friend_request",
        title: "Friend Request from Dr. Ramesh Gupta",
        subtitle: "IISc Bangalore • Autonomous Robotics Lab Lead & Co-PI",
        timestamp: "1 hour ago",
        read: false,
        friendInviteId: "inv-alok-01",
        senderName: "Dr. Ramesh Gupta",
        senderAvatar: "RG",
        senderCampus: "IISc Bangalore",
        senderHeadline: "Autonomous Robotics Lab Lead & Co-PI",
        friendMessage:
          "Greetings Prof. Mathur. Looking forward to co-organizing the upcoming Indo-Pacific Robotic Autonomy Colloquium with your IITD lab.",
        friendStatus: "pending",
      },
      {
        id: "friend-alok-2",
        type: "friend_request",
        title: "Friend Request from Aarav Sharma",
        subtitle: "NSUT '26 • Systems Fellow & Microkernel Researcher",
        timestamp: "Yesterday",
        read: false,
        friendInviteId: "inv-alok-02",
        senderName: "Aarav Sharma",
        senderAvatar: "AS",
        senderCampus: "NSUT '26",
        senderHeadline: "Systems Fellow & Microkernel Researcher",
        friendMessage:
          "Prof. Mathur, I've been studying your lab's papers on deterministic preemptive kernels and would be honored to connect.",
        friendStatus: "pending",
      }
    );
  } else if (isRohan) {
    items.push(
      {
        id: "friend-rohan-1",
        type: "friend_request",
        title: "Friend Request from Aarav Sharma",
        subtitle: "NSUT '26 • Synapse Core Founder",
        timestamp: "30 mins ago",
        read: false,
        friendInviteId: "inv-rohan-01",
        senderName: "Aarav Sharma",
        senderAvatar: "AS",
        senderCampus: "NSUT '26",
        senderHeadline: "Synapse Core Founder",
        friendMessage:
          "Thanks for backing Synapse Core OS! Let's connect directly on upcoming sprint milestones.",
        friendStatus: "pending",
      },
      {
        id: "friend-rohan-2",
        type: "friend_request",
        title: "Friend Request from Kabir Verma",
        subtitle: "IIITD '25 • Embedded Systems & P2P Lead",
        timestamp: "3 hours ago",
        read: false,
        friendInviteId: "inv-rohan-02",
        senderName: "Kabir Verma",
        senderAvatar: "KV",
        senderCampus: "IIITD '25",
        senderHeadline: "Embedded Systems & P2P Lead",
        friendMessage:
          "Hey Rohan, fellow systems researcher here. Let's sync on P2P gossip networks.",
        friendStatus: "pending",
      }
    );
  } else if (isPuneet) {
    items.push(
      {
        id: "friend-puneet-1",
        type: "friend_request",
        title: "Friend Request from Aarav Sharma",
        subtitle: "NSUT '26 • Systems Fellow",
        timestamp: "1 hour ago",
        read: false,
        friendInviteId: "inv-pun-01",
        senderName: "Aarav Sharma",
        senderAvatar: "AS",
        senderCampus: "NSUT '26",
        senderHeadline: "Systems Fellow",
        friendMessage:
          "Welcome to ALCON Network! Excited to collaborate on Symbolic Systems & AI nodes.",
        friendStatus: "pending",
      },
      {
        id: "friend-puneet-2",
        type: "friend_request",
        title: "Friend Request from Priya Sundaram",
        subtitle: "DTU '26 • Computational Bio Researcher",
        timestamp: "5 hours ago",
        read: false,
        friendInviteId: "inv-pun-02",
        senderName: "Priya Sundaram",
        senderAvatar: "PS",
        senderCampus: "DTU '26",
        senderHeadline: "Computational Bio Researcher",
        friendMessage:
          "Hey puneet, fellow DTU researcher! Would love to connect and share notes on algorithmic simulation.",
        friendStatus: "pending",
      }
    );
  } else {
    // New signup peer welcome
    items.push({
      id: "friend-gen-1",
      type: "friend_request",
      title: "Friend Request from Aarav Sharma",
      subtitle: "NSUT '26 • ALCON Network Fellow",
      timestamp: "Just now",
      read: false,
      friendInviteId: "inv-gen-01",
      senderName: "Aarav Sharma",
      senderAvatar: "AS",
      senderCampus: "NSUT '26",
      senderHeadline: "ALCON Network Fellow",
      friendMessage: `Welcome to ALCON Network, ${user.name}! Let's connect and build across nodes.`,
      friendStatus: "pending",
    });
  }

  // ========================================================
  // 2. PROJECT ENROLLMENT REQUESTS (Applications to user's projects)
  // ========================================================
  // Identify projects led by this user
  const userProjects = projects.filter(
    (p) => p.author?.toLowerCase() === userNameLower || (isAarav && p.id === "PRJ-082")
  );

  const userProjectIds = new Set(userProjects.map((p) => p.id));
  if (isAarav) userProjectIds.add("PRJ-082");

  const matchingProjectRequests = projectRequests.filter((r) =>
    userProjectIds.has(r.projectId)
  );

  if (matchingProjectRequests.length > 0) {
    matchingProjectRequests.forEach((req) => {
      items.push({
        id: `enroll-${req.id}`,
        type: "project_enrollment",
        title: `Enrollment Application: ${req.applicantName}`,
        subtitle: `Applied for ${req.role} on ${req.projectTitle}`,
        timestamp: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Recent",
        read: req.status !== "pending",
        projectRequestId: req.id,
        projectId: req.projectId,
        projectTitle: req.projectTitle,
        applicantName: req.applicantName,
        applicantAvatar: req.applicantAvatar,
        applicantCampus: req.applicantCampus,
        applicantRole: req.role,
        applicantBio: req.bio,
        applicantGithub: req.github,
        applicantLinkedin: req.linkedin,
        enrollmentStatus: req.status,
      });
    });
  } else if (isAarav) {
    // Default applicants for Synapse Core OS (Aarav's venture)
    items.push(
      {
        id: "enroll-aarav-1",
        type: "project_enrollment",
        title: "Enrollment Application: Kabir Verma",
        subtitle: "Applied for Embedded RF & LoRa Engineer on Synapse Core OS",
        timestamp: "Yesterday",
        read: false,
        projectRequestId: "req-101",
        projectId: "PRJ-082",
        projectTitle: "Synapse Core OS",
        applicantName: "Kabir Verma",
        applicantAvatar: "KV",
        applicantCampus: "IIITD '25 • EECS & Aerospace",
        applicantRole: "Embedded RF & LoRa Engineer",
        applicantBio:
          "Senior hardware engineer working on autonomous space systems at IIITD. Previously engineered telemetry transmitters for student satellite missions. Proficient in bare-metal C on STM32, radio packet fragmentation, and antenna impedance matching.",
        applicantGithub: "https://github.com/kabirverma-systems",
        applicantLinkedin: "https://linkedin.com/in/kabir-verma-systems",
        enrollmentStatus: "pending",
      },
      {
        id: "enroll-aarav-2",
        type: "project_enrollment",
        title: "Enrollment Application: Ananya Iyer",
        subtitle: "Applied for Flight Simulation & Distributed Mesh Lead on Synapse Core OS",
        timestamp: "2 days ago",
        read: false,
        projectRequestId: "req-102",
        projectId: "PRJ-082",
        projectTitle: "Synapse Core OS",
        applicantName: "Ananya Iyer",
        applicantAvatar: "AI",
        applicantCampus: "IGDTU '26 • Computer Science",
        applicantRole: "Flight Simulation & Distributed Mesh Lead",
        applicantBio:
          "Distributed systems researcher at IGDTU focused on gossip mesh networks and ad-hoc packet routing in intermittent connectivity environments. Built real-time physical telemetry simulators in Rust and WebAssembly.",
        applicantGithub: "https://github.com/ananya-iyer-mesh",
        applicantLinkedin: "https://linkedin.com/in/ananya-iyer-zk",
        enrollmentStatus: "pending",
      }
    );
  } else if (isAlok) {
    items.push({
      id: "enroll-alok-1",
      type: "project_enrollment",
      title: "Lab Allocation Enrollment: Manav Sharma",
      subtitle: "Applied for ROS2 Drone Autonomy Fellow • Robotics & Autonomy Lab",
      timestamp: "Yesterday",
      read: false,
      projectRequestId: "req-fac-01",
      projectId: "PRJ-FAC-01",
      projectTitle: "Robotics & Autonomy Lab Node",
      applicantName: "Manav Sharma",
      applicantAvatar: "MS",
      applicantCampus: "NSUT '25 • Hardware & Embedded",
      applicantRole: "ROS2 Drone Autonomy Fellow",
      applicantBio:
        "Student hardware developer leading NSUT drone telemetry team. Experience in PX4 flight controller firmware, optical flow odometry, and RTK-GPS integration.",
      applicantGithub: "https://github.com/manav-drone-systems",
      applicantLinkedin: "https://linkedin.com/in/manav-sharma-uas",
      enrollmentStatus: "pending",
    });
  }

  // ==========================================
  // 3. KARMA EARNED (Accruals for this user)
  // ==========================================
  // If user has shares owned from investing:
  if (user.sharesOwned && user.sharesOwned.length > 0) {
    user.sharesOwned.forEach((share) => {
      items.push({
        id: `karma-share-${share.id}`,
        type: "karma_earned",
        title: `+${share.karmaEarned.toLocaleString()} KP Earned`,
        subtitle: `Syndicate Equity Pledge in ${share.projectTitle}`,
        timestamp: share.investedAt || "Recent",
        read: true,
        karmaPoints: share.karmaEarned,
        karmaSource: `Venture Investment • ${share.projectTitle}`,
        karmaDetail: `Acquired ${share.sharePercentage}% syndicate equity for ₹${share.amountInvested.toLocaleString("en-IN")}. Reputation protocol accrued.`,
      });
    });
  }

  // Account-specific karma achievements
  if (isAarav) {
    items.push(
      {
        id: "karma-aarav-1",
        type: "karma_earned",
        title: "+2,500 KP Earned",
        subtitle: "Synapse Core OS Microkernel Alpha 0.4 Milestone Attestation",
        timestamp: "Yesterday",
        read: false,
        karmaPoints: 2500,
        karmaSource: "Venture Milestone Verification",
        karmaDetail:
          "Deterministic scheduler latency benchmark verified below 8.4µs on RISC-V edge NPU test rig.",
      },
      {
        id: "karma-aarav-2",
        type: "karma_earned",
        title: "+1,200 KP Earned",
        subtitle: "10 Collegiate Research Peer Endorsements in Distributed Systems",
        timestamp: "3 days ago",
        read: false,
        karmaPoints: 1200,
        karmaSource: "Peer Reputation Protocol",
        karmaDetail:
          "Endorsed by research fellows from NSUT, IIITD, and IITD for low-level systems engineering.",
      },
      {
        id: "karma-aarav-3",
        type: "karma_earned",
        title: "+500 KP Earned",
        subtitle: "Campus Genesis Node Key Attestation",
        timestamp: "Oct 14, 2026",
        read: true,
        karmaPoints: 500,
        karmaSource: "Passport Genesis",
        karmaDetail: "On-chain verification completed for NSUT campus node #AS-8291.",
      }
    );
  } else if (isAlok) {
    items.push(
      {
        id: "karma-alok-1",
        type: "karma_earned",
        title: "+5,000 KP Earned",
        subtitle: "Faculty Lab Research Supervision & Student Mentorship Allocation",
        timestamp: "Yesterday",
        read: false,
        karmaPoints: 5000,
        karmaSource: "Academic Lab Mentorship",
        karmaDetail:
          "Supervising 14 student research thesis teams across IITD Robotics & Autonomy Lab.",
      },
      {
        id: "karma-alok-2",
        type: "karma_earned",
        title: "+3,200 KP Earned",
        subtitle: "Lab Bench Allocation Open Call Published for Collegiate Fellows",
        timestamp: "4 days ago",
        read: true,
        karmaPoints: 3200,
        karmaSource: "Resource Provisioning",
        karmaDetail:
          "15 test hours/week testbed allocated for edge robotics and hardware bench testing.",
      }
    );
  } else if (isRohan) {
    items.push(
      {
        id: "karma-rohan-1",
        type: "karma_earned",
        title: "+2,500 KP Earned",
        subtitle: "Frontier Syndicate Investment in Synapse Core OS",
        timestamp: "Oct 18, 2026",
        read: false,
        karmaPoints: 2500,
        karmaSource: "Syndicate Equity Investment",
        karmaDetail: "Backed PRJ-082 with ₹2,50,000 (10% round share).",
      },
      {
        id: "karma-rohan-2",
        type: "karma_earned",
        title: "+500 KP Earned",
        subtitle: "Research Fellow Node Activation",
        timestamp: "Oct 17, 2026",
        read: true,
        karmaPoints: 500,
        karmaSource: "Node Genesis",
        karmaDetail: "Activated verified student researcher passport node #STU-5821.",
      }
    );
  } else if (isPuneet) {
    items.push(
      {
        id: "karma-puneet-1",
        type: "karma_earned",
        title: "+1,000 KP Earned",
        subtitle: "DTU Campus Node Passport Attestation",
        timestamp: "Oct 17, 2026",
        read: false,
        karmaPoints: 1000,
        karmaSource: "Node Genesis",
        karmaDetail: "Verified .edu credential on DTU campus node #STU-8188.",
      },
      {
        id: "karma-puneet-2",
        type: "karma_earned",
        title: "+500 KP Earned",
        subtitle: "Symbolic Systems & AI Laboratory Onboarding",
        timestamp: "Oct 18, 2026",
        read: false,
        karmaPoints: 500,
        karmaSource: "Lab Onboarding",
        karmaDetail: "Joined Autonomous Intelligence Systems Laboratory cluster.",
      }
    );
  } else {
    items.push({
      id: "karma-new-1",
      type: "karma_earned",
      title: "+1,000 KP Earned",
      subtitle: "ALCON Passport Node Genesis Allocation",
      timestamp: "Just now",
      read: false,
      karmaPoints: 1000,
      karmaSource: "Genesis Activation",
      karmaDetail: `Node genesis key issued for ${user.name} (${user.campusShort || user.campus}).`,
    });
  }

  // ==========================================
  // 4. FUNDS RECEIVED (Capital for user's projects/nodes)
  // ==========================================
  if (isAarav) {
    items.push(
      {
        id: "fund-aarav-1",
        type: "fund_received",
        title: "₹2,50,000 Seed Capital Received",
        subtitle: "Syndicate Equity Investment Tranche for Synapse Core OS",
        timestamp: "Yesterday",
        read: false,
        fundAmount: 250000,
        fundProjectTitle: "Synapse Core OS",
        fundFunderName: "Rohan Verma • Frontier Syndicate",
        fundType: "Syndicate Equity Pledge (10% Round)",
        fundEscrowStatus: "Escrow Settled in Node Vault",
      },
      {
        id: "fund-aarav-2",
        type: "fund_received",
        title: "₹5,00,000 Catalyst Grant Received",
        subtitle: "Micro-Seed Prototyping Allocation from Innovation Hub",
        timestamp: "3 days ago",
        read: false,
        fundAmount: 500000,
        fundProjectTitle: "Synapse Core OS",
        fundFunderName: "Delhi Innovation Hub & Technology Incubation Pool",
        fundType: "Micro-Seed Catalyst Grant",
        fundEscrowStatus: "Disbursed to Project Vault",
      }
    );
  } else if (isAlok) {
    items.push(
      {
        id: "fund-alok-1",
        type: "fund_received",
        title: "₹15,00,000 Equipment Grant Received",
        subtitle: "Autonomous Systems Laboratory Bench Allocation",
        timestamp: "2 days ago",
        read: false,
        fundAmount: 1500000,
        fundProjectTitle: "Robotics & Autonomy Lab Node",
        fundFunderName: "IITD Autonomous Systems Endowment",
        fundType: "Research Equipment Grant Allocation",
        fundEscrowStatus: "Allocated to Lab Benches",
      },
      {
        id: "fund-alok-2",
        type: "fund_received",
        title: "₹3,50,000 Industry Fellowship Received",
        subtitle: "Collaborative Microkernel Research Sponsorship",
        timestamp: "1 week ago",
        read: true,
        fundAmount: 350000,
        fundProjectTitle: "Autonomous Systems Laboratory",
        fundFunderName: "Vector Research Syndicate",
        fundType: "Industry Research Fellowship Grant",
        fundEscrowStatus: "Vault Disbursed",
      }
    );
  } else if (isRohan) {
    items.push({
      id: "fund-rohan-1",
      type: "fund_received",
      title: "₹1,00,000 Research Fellowship Received",
      subtitle: "Delhi Innovation Systems Fellow Stipend & Compute Credits",
      timestamp: "Oct 16, 2026",
      read: false,
      fundAmount: 100000,
      fundProjectTitle: "Autonomous Systems Research Node",
      fundFunderName: "Delhi Innovation Hub",
      fundType: "Research Fellow Grant",
      fundEscrowStatus: "Credited to Wallet",
    });
  } else if (isPuneet) {
    items.push({
      id: "fund-puneet-1",
      type: "fund_received",
      title: "₹75,000 Sandbox Prototyping Grant Received",
      subtitle: "DTU Student Innovation Sandbox Seed Allocation",
      timestamp: "Oct 17, 2026",
      read: false,
      fundAmount: 75000,
      fundProjectTitle: "Symbolic Systems & AI Research",
      fundFunderName: "DTU Student Venture Cell",
      fundType: "Prototyping Catalyst Seed",
      fundEscrowStatus: "Allocated to Node",
    });
  }

  // Save initial seeded set to localStorage so modifications stay persistent
  saveUserInboxItems(user.name, items);

  return items;
}
