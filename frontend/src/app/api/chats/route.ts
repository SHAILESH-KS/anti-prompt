import { NextResponse } from "next/server";
import connectToDatabase from "@/src/lib/db";
import { Chat } from "@/src/models";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    // Assuming session.user.id is the user identifier from likely provider
    // If better-auth structure is different, we verify this.
    // Based on typical better-auth user object:
    const userId = session.user.id;

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt");

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch chats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();
    const userId = session.user.id;

    await connectToDatabase();

    // Explicitly create with title or default
    const chat = await Chat.create({
      userId,
      title: title || "New Chat",
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create chat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
