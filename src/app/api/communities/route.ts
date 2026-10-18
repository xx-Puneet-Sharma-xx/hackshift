import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "communities.json");

function readCommunities() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading communities:", error);
    return [];
  }
}

function writeCommunities(communities: any[]) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(communities, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing communities:", error);
  }
}

export async function GET() {
  const communities = readCommunities();
  return NextResponse.json(communities);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, desc, campus, icon } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Community name and category are required" },
        { status: 400 }
      );
    }

    const communities = readCommunities();
    const id = `comm-${Date.now()}`;
    const code = `[G.${(communities.length + 1).toString().padStart(2, "0")}] ${category.toUpperCase().slice(0, 10)}`;

    const newCommunity = {
      id,
      code,
      name: name.trim(),
      category: category.trim(),
      desc: desc ? desc.trim() : "Research and development collective on ALCON.",
      members: 1,
      online: 1,
      campus: campus ? campus.trim() : "ALCON Global Network • Verified Node",
      icon: icon || "groups",
      avatarColor: "from-cyan-500/30 to-sky-600/30",
      joined: true,
      isCreatedByMe: true,
      lastMessage: "Community created. Welcome early builders!",
      lastMessageTime: "Just now",
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };

    communities.unshift(newCommunity);
    writeCommunities(communities);

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error("POST /api/communities error:", error);
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, joined } = body;

    const communities = readCommunities();
    const index = communities.findIndex((c: any) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    communities[index].joined = joined;
    if (joined) {
      communities[index].members += 1;
    } else {
      communities[index].members = Math.max(0, (communities[index].members || 1) - 1);
    }
    writeCommunities(communities);

    return NextResponse.json(communities[index]);
  } catch (error) {
    console.error("PATCH /api/communities error:", error);
    return NextResponse.json({ error: "Failed to update community" }, { status: 500 });
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
        // no body provided
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Community ID is required" }, { status: 400 });
    }

    const communities = readCommunities();
    const initialLen = communities.length;
    const updated = communities.filter((c: any) => c.id !== id);

    if (updated.length === initialLen) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    writeCommunities(updated);

    // Clean up messages associated with this community if present
    try {
      const messagesFilePath = path.join(process.cwd(), "data", "messages.json");
      if (fs.existsSync(messagesFilePath)) {
        const msgs = JSON.parse(fs.readFileSync(messagesFilePath, "utf-8"));
        if (msgs[id]) {
          delete msgs[id];
          fs.writeFileSync(messagesFilePath, JSON.stringify(msgs, null, 2), "utf-8");
        }
      }
    } catch (msgErr) {
      console.error("Error removing messages for deleted community:", msgErr);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/communities error:", error);
    return NextResponse.json({ error: "Failed to delete community" }, { status: 500 });
  }
}

