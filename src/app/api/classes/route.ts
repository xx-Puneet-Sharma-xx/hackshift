import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "classes.json");

function readClasses(): any[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading classes:", error);
    return [];
  }
}

function writeClasses(classes: any[]) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(classes, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing classes:", error);
  }
}

export async function GET() {
  const classes = readClasses();
  return NextResponse.json(classes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      instructorName,
      instructorRole,
      instructorAvatar,
      instructorTitle,
      campus,
      departmentOrLab,
      category,
      schedule,
      location,
      description,
      capacity,
      tags,
    } = body;

    if (!title || !instructorName || !instructorRole) {
      return NextResponse.json(
        { error: "Title, instructor name, and instructor role are required" },
        { status: 400 }
      );
    }

    const classes = readClasses();
    const newClass = {
      id: `cls-${Date.now()}`,
      title,
      instructorName,
      instructorRole: instructorRole === "faculty" ? "faculty" : "alumni",
      instructorAvatar: instructorAvatar || "CL",
      instructorTitle: instructorTitle || (instructorRole === "faculty" ? "Faculty PI" : "Alumni Fellow"),
      campus: campus || "ALCON Engineering Network",
      departmentOrLab: departmentOrLab || "Research Node",
      category: category || "General Masterclass",
      schedule: schedule || "Thursdays • 4:00 PM PST",
      location: location || "Virtual Lab Node • Live Stream",
      description: description || "Masterclass on ALCON.",
      enrolledCount: 1,
      capacity: Number(capacity) || 50,
      tags: Array.isArray(tags) ? tags : ["Masterclass"],
      createdAt: "Cycle S26",
    };

    classes.unshift(newClass);
    writeClasses(classes);

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Failed to create class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { classId, action } = body;

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    const classes = readClasses();
    const idx = classes.findIndex((c: any) => c.id === classId);
    if (idx === -1) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (action === "join") {
      classes[idx].enrolledCount = Math.min(
        classes[idx].capacity,
        classes[idx].enrolledCount + 1
      );
    } else if (action === "leave") {
      classes[idx].enrolledCount = Math.max(0, classes[idx].enrolledCount - 1);
    }

    writeClasses(classes);
    return NextResponse.json(classes[idx]);
  } catch (error) {
    console.error("Failed to update class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}
