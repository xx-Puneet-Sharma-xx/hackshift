import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "project_requests.json");

function readRequests(): any[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading project requests:", error);
    return [];
  }
}

function writeRequests(requests: any[]) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(requests, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing project requests:", error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const allRequests = readRequests();
  if (projectId) {
    return NextResponse.json(allRequests.filter((r) => r.projectId === projectId));
  }

  return NextResponse.json(allRequests);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      projectTitle,
      applicantName,
      applicantCampus,
      applicantAvatar,
      role,
      bio,
      github,
      linkedin,
    } = body;

    if (!projectId || !applicantName || !bio || !github || !linkedin) {
      return NextResponse.json(
        {
          error:
            "Project ID, applicant name, student biodata, GitHub link, and LinkedIn profile link are required",
        },
        { status: 400 }
      );
    }

    const requests = readRequests();
    const newRequest = {
      id: `req-${Date.now()}`,
      projectId,
      projectTitle: projectTitle || "ALCON Project",
      applicantName: applicantName.trim(),
      applicantCampus: applicantCampus ? applicantCampus.trim() : "Fellow '26",
      applicantAvatar: applicantAvatar || applicantName.trim().slice(0, 2).toUpperCase(),
      role: role ? role.trim() : "Core Contributor / Co-Founder",
      bio: bio.trim(),
      github: github.trim(),
      linkedin: linkedin.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    requests.unshift(newRequest);
    writeRequests(requests);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/requests error:", error);
    return NextResponse.json(
      { error: "Failed to submit project join request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Request ID and status are required" }, { status: 400 });
    }

    const requests = readRequests();
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    requests[index].status = status;
    writeRequests(requests);

    return NextResponse.json(requests[index]);
  } catch (error) {
    console.error("PATCH /api/projects/requests error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
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
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const requests = readRequests();
    const updated = requests.filter((r) => r.id !== id);
    writeRequests(updated);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/projects/requests error:", error);
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
  }
}
