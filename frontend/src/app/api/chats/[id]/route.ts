import { NextResponse } from "next/server";
import connectToDatabase from "@/src/lib/db";
import { Chat, Message } from "@/src/models";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Verify ownership
    const chat = await Chat.findOne({ _id: id, userId: session.user.id });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const messages = await Message.find({ chatId: id }).sort({ createdAt: 1 });

    return NextResponse.json({ chat, messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch chat messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Verify ownership and delete
    const result = await Chat.deleteOne({ _id: id, userId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 },
      );
    }

    // Also delete messages
    await Message.deleteMany({ chatId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete chat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
