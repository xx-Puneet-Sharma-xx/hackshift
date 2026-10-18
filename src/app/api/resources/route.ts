import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "resources.json");

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
  createdAt: string;
}

const BRANCH_LABELS: Record<string, string> = {
  electrical: "Electrical & Instruments",
  cs: "Computer Science & AI",
  robotics: "Robotics & Mechatronics",
  mechanical: "Mechanical & Aerospace",
  biotech: "Biotech & Biomedical",
};

const BRANCH_ICONS: Record<string, { icon: string; iconGlass: string; statusColor: string }> = {
  electrical: {
    icon: "electrical_services",
    iconGlass: "apple-liquid-glass-primary",
    statusColor: "primary",
  },
  cs: {
    icon: "memory",
    iconGlass: "apple-liquid-glass-emerald",
    statusColor: "emerald",
  },
  robotics: {
    icon: "smart_toy",
    iconGlass: "apple-liquid-glass-primary",
    statusColor: "primary",
  },
  mechanical: {
    icon: "rocket_launch",
    iconGlass: "apple-liquid-glass-rose",
    statusColor: "rose",
  },
  biotech: {
    icon: "biotech",
    iconGlass: "apple-liquid-glass-secondary",
    statusColor: "secondary",
  },
};

function readResources(): FacultyResource[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading resources:", error);
    return [];
  }
}

function writeResources(resources: FacultyResource[]) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(resources, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing resources:", error);
  }
}

export async function GET() {
  const resources = readResources();
  return NextResponse.json(resources);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      facultyLead,
      facultyEmail,
      campus,
      branch,
      category,
      desc,
      allocation,
      eligibility,
      status,
      icon,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Resource title is required" },
        { status: 400 }
      );
    }

    const branchKey = branch && BRANCH_LABELS[branch] ? branch : "electrical";
    const branchMeta = BRANCH_ICONS[branchKey] || BRANCH_ICONS.electrical;

    const resources = readResources();
    const newId = `FAC-RES-${String(resources.length + 1).padStart(2, "0")}`;

    const newResource: FacultyResource = {
      id: newId,
      title: title.trim(),
      facultyLead: (facultyLead && facultyLead.trim()) || "Faculty Research Fellow",
      facultyEmail: (facultyEmail && facultyEmail.trim()) || undefined,
      campus: (campus && campus.trim()) || "Autonomous Systems & Engineering Node",
      branch: branchKey,
      branchLabel: BRANCH_LABELS[branchKey],
      category: (category && category.trim().toUpperCase()) || "LAB INFRASTRUCTURE",
      icon: (icon && icon.trim()) || branchMeta.icon,
      iconGlass: branchMeta.iconGlass,
      desc: (desc && desc.trim()) || "Direct access to lab hardware, testing benches, and faculty mentorship.",
      allocation: (allocation && allocation.trim()) || "Weekly bench hours + instrumentation certification",
      eligibility: (eligibility && eligibility.trim()) || "Open to all enrolled students and research fellows",
      status: (status && status.trim().toUpperCase()) || "BENCHES OPEN",
      statusColor: branchMeta.statusColor,
      createdAt: new Date().toISOString(),
    };

    resources.unshift(newResource);
    writeResources(resources);

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("Failed to create resource opening:", error);
    return NextResponse.json(
      { error: "Failed to create resource opening" },
      { status: 500 }
    );
  }
}
