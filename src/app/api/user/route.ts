import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "user.json");
const registryFilePath = path.join(process.cwd(), "data", "users_registry.json");

interface UserData {
  user: any;
  isLoggedIn: boolean;
}

function readUserData(): UserData | null {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return null;
    }
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading user data:", error);
    return null;
  }
}

function writeUserData(data: UserData) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing user data:", error);
  }
}

function readRegistry(): Record<string, any> {
  try {
    if (!fs.existsSync(registryFilePath)) {
      return {};
    }
    const data = fs.readFileSync(registryFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users registry:", error);
    return {};
  }
}

function writeRegistry(registry: Record<string, any>) {
  try {
    const dir = path.dirname(registryFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(registryFilePath, JSON.stringify(registry, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing users registry:", error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const registry = readRegistry();

  if (email) {
    const matched = registry[email.toLowerCase().trim()];
    if (matched) {
      return NextResponse.json({ user: matched, isLoggedIn: true });
    }
  }

  const data = readUserData();
  if (!data) {
    return NextResponse.json({ user: null, isLoggedIn: false, registry });
  }
  return NextResponse.json({ ...data, registry });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, isLoggedIn } = body;

    const data: UserData = {
      user: user || null,
      isLoggedIn: typeof isLoggedIn === "boolean" ? isLoggedIn : true,
    };

    writeUserData(data);

    // Save/update specific profile in user registry by email
    if (user && user.email) {
      const registry = readRegistry();
      const emailKey = String(user.email).toLowerCase().trim();
      registry[emailKey] = {
        ...registry[emailKey],
        ...user,
        updatedAt: new Date().toISOString(),
      };
      writeRegistry(registry);
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const existing = readUserData() || { user: null, isLoggedIn: false };

    if (typeof body.isLoggedIn === "boolean") {
      existing.isLoggedIn = body.isLoggedIn;
    }
    if (body.user) {
      existing.user = { ...existing.user, ...body.user };

      if (existing.user.email) {
        const registry = readRegistry();
        const emailKey = String(existing.user.email).toLowerCase().trim();
        registry[emailKey] = {
          ...registry[emailKey],
          ...existing.user,
          updatedAt: new Date().toISOString(),
        };
        writeRegistry(registry);
      }
    }

    writeUserData(existing);
    return NextResponse.json({ success: true, ...existing });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
