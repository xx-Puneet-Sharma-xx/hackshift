import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "messages.json");

function readMessages(): Record<string, any[]> {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return {};
    }
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading messages:", error);
    return {};
  }
}

function writeMessages(messages: Record<string, any[]>) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(messages, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing messages:", error);
  }
}

function parseKpNumber(kpStr?: string): number {
  if (!kpStr) return 0;
  const cleaned = String(kpStr).replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

function awardKarmaToUser(senderName: string, amount: number) {
  try {
    const registryPath = path.join(process.cwd(), "data", "users_registry.json");
    if (fs.existsSync(registryPath)) {
      const reg = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
      let updated = false;
      for (const email of Object.keys(reg)) {
        const u = reg[email];
        if (u.name && u.name.toLowerCase().trim() === senderName.toLowerCase().trim()) {
          const currentKp = parseKpNumber(u.kp);
          const newKp = currentKp + amount;
          u.kp = `${newKp.toLocaleString()} KP`;
          updated = true;
        }
      }
      if (updated) {
        fs.writeFileSync(registryPath, JSON.stringify(reg, null, 2), "utf-8");
      }
    }

    const userPath = path.join(process.cwd(), "data", "user.json");
    if (fs.existsSync(userPath)) {
      const uData = JSON.parse(fs.readFileSync(userPath, "utf-8"));
      if (uData.user && uData.user.name && uData.user.name.toLowerCase().trim() === senderName.toLowerCase().trim()) {
        const currentKp = parseKpNumber(uData.user.kp);
        const newKp = currentKp + amount;
        uData.user.kp = `${newKp.toLocaleString()} KP`;
        fs.writeFileSync(userPath, JSON.stringify(uData, null, 2), "utf-8");
      }
    }
  } catch (err) {
    console.error("Error awarding karma to user:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId");

  const allMessages = readMessages();

  if (communityId) {
    return NextResponse.json(allMessages[communityId] || []);
  }

  return NextResponse.json(allMessages);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { communityId, text, sender, campus, avatar, attachment } = body;

    if (!communityId || (!text && !attachment)) {
      return NextResponse.json(
        { error: "communityId and either text or attachment are required" },
        { status: 400 }
      );
    }

    const allMessages = readMessages();
    if (!allMessages[communityId]) {
      allMessages[communityId] = [];
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: sender || "Aarav Sharma",
      avatar: avatar || "AS",
      campus: campus || "NSUT '26",
      text: (text || "").trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
      reactions: [],
      attachment: attachment || null,
      adminStarred: false,
      starredBy: null,
      karmaAwarded: 0,
    };

    allMessages[communityId].push(newMessage);
    writeMessages(allMessages);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { communityId, messageId, action, adminName, emoji, karmaAmount } = body;

    if (!communityId || !messageId) {
      return NextResponse.json(
        { error: "communityId and messageId are required" },
        { status: 400 }
      );
    }

    const allMessages = readMessages();
    const msgList = allMessages[communityId];
    if (!msgList) {
      return NextResponse.json({ error: "Community messages not found" }, { status: 404 });
    }

    const targetMsg = msgList.find((m: any) => m.id === messageId);
    if (!targetMsg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (action === "star_admin") {
      if (targetMsg.adminStarred) {
        return NextResponse.json({
          message: targetMsg,
          alreadyStarred: true,
        });
      }

      const reward = karmaAmount || 100;
      targetMsg.adminStarred = true;
      targetMsg.starredBy = adminName || "Project Admin";
      targetMsg.karmaAwarded = reward;

      // Update or add star reaction in reactions array
      const reactions = Array.isArray(targetMsg.reactions) ? targetMsg.reactions : [];
      const starIdx = reactions.findIndex((r: string) => r.startsWith("⭐"));
      if (starIdx >= 0) {
        const curCount = parseInt(reactions[starIdx].replace(/[^0-9]/g, "") || "1", 10);
        reactions[starIdx] = `⭐ ${curCount + 1}`;
      } else {
        reactions.push("⭐ 1");
      }
      targetMsg.reactions = reactions;

      // Award Karma to contributor
      if (targetMsg.sender) {
        awardKarmaToUser(targetMsg.sender, reward);
      }

      writeMessages(allMessages);

      return NextResponse.json({
        success: true,
        message: targetMsg,
        karmaAwarded: reward,
        contributor: targetMsg.sender,
      });
    }

    if (action === "react") {
      const rxEmoji = emoji || "⭐";
      const reactions = Array.isArray(targetMsg.reactions) ? targetMsg.reactions : [];
      const existingIdx = reactions.findIndex((r: string) => r.startsWith(rxEmoji));

      if (existingIdx >= 0) {
        const curCount = parseInt(reactions[existingIdx].replace(/[^0-9]/g, "") || "1", 10);
        reactions[existingIdx] = `${rxEmoji} ${curCount + 1}`;
      } else {
        reactions.push(`${rxEmoji} 1`);
      }
      targetMsg.reactions = reactions;

      writeMessages(allMessages);

      return NextResponse.json({
        success: true,
        message: targetMsg,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/messages error:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let communityId = searchParams.get("communityId");
    let messageId = searchParams.get("messageId") || searchParams.get("id");

    if (!communityId || !messageId) {
      try {
        const body = await request.json();
        communityId = communityId || body?.communityId;
        messageId = messageId || body?.messageId || body?.id;
      } catch {
        // no body provided
      }
    }

    if (!communityId || !messageId) {
      return NextResponse.json(
        { error: "communityId and messageId are required" },
        { status: 400 }
      );
    }

    const allMessages = readMessages();
    if (!allMessages[communityId]) {
      return NextResponse.json({ error: "Community messages not found" }, { status: 404 });
    }

    const initialLen = allMessages[communityId].length;
    allMessages[communityId] = allMessages[communityId].filter(
      (m: any) => m.id !== messageId
    );

    if (allMessages[communityId].length === initialLen) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    writeMessages(allMessages);

    return NextResponse.json({ success: true, communityId, messageId });
  } catch (error) {
    console.error("DELETE /api/messages error:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
