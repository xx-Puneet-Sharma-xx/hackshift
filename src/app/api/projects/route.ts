import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "projects.json");

function readProjects(): any[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

function writeProjects(projects: any[]) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(projects, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing projects:", error);
  }
}

export async function GET() {
  const projects = readProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      desc,
      detailDescription,
      requirements,
      stack,
      campuses,
      tag,
      filterKey,
      needsInvestment,
      expectedInvestment,
      investmentGoal,
      author,
      authorCampus,
    } = body;

    if (!title || !detailDescription || !requirements) {
      return NextResponse.json(
        {
          error:
            "Project title, detailed description, and requirements are required",
        },
        { status: 400 }
      );
    }

    const projects = readProjects();
    const projectNumber = (projects.length + 1).toString().padStart(3, "0");
    const id = `PRJ-${projectNumber}`;

    const expNum = Number(String(expectedInvestment || investmentGoal || "").replace(/[^0-9.]/g, "")) || 0;
    const finalExpected = expNum > 0 ? expNum : (Boolean(needsInvestment) ? 50000 : 0);
    const finalGoal = investmentGoal ? investmentGoal.trim() : (finalExpected > 0 ? `₹${finalExpected.toLocaleString()}` : "");

    const newProject = {
      id,
      title: title.trim(),
      desc: desc ? desc.trim() : detailDescription.trim().slice(0, 140) + "...",
      detailDescription: detailDescription.trim(),
      requirements: requirements.trim(),
      campuses: campuses ? campuses.trim().toUpperCase() : "SYSTEMS + VERIFIED NODES",
      tag: tag ? tag.trim().toUpperCase() : "ALPHA 0.1",
      filterKey: filterKey || "alpha",
      stack: stack ? stack.trim() : "TypeScript • Next.js • Python",
      author: body.author ? String(body.author).trim() : "Collegiate Creator",
      authorCampus: body.authorCampus ? String(body.authorCampus).trim() : "Verified Member",
      isCreatedByMe: true,
      needsInvestment: Boolean(needsInvestment),
      expectedInvestment: finalExpected,
      investmentGoal: finalGoal,
      createdAt: new Date().toISOString(),
    };

    projects.unshift(newProject);
    writeProjects(projects);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const projects = readProjects();
    const initialLen = projects.length;
    const updated = projects.filter((p: any) => p.id !== id);

    if (updated.length === initialLen) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    writeProjects(updated);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/projects error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
