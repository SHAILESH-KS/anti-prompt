import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { NextResponse } from "next/server";
import connectToDatabase from "@/src/lib/db";
import { Chat, Message, IAttachment } from "@/src/models";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FileData {
  name: string;
  type: string;
  data: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, data, chatId } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is not set" },
        { status: 500 },
      );
    }

    await connectToDatabase();

    // Verify chat ownership if chatId provided
    if (chatId) {
      const chat = await Chat.findOne({ _id: chatId, userId: session.user.id });
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Separate history from the latest message
    const lastMessage = messages[messages.length - 1] as ChatMessage;
    const history = messages.slice(0, -1).map((m: ChatMessage) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chatSession = model.startChat({
      history: history,
    });

    const parts: Part[] = [{ text: lastMessage.content }];
    const attachmentsToSave: IAttachment[] = [];

    if (data && Array.isArray(data)) {
      data.forEach((file: FileData) => {
        // file.data is expected to be base64 data url
        const match = file.data.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64 = match[2];
          parts.push({
            inlineData: {
              mimeType,
              data: base64,
            },
          });
          attachmentsToSave.push({
            name: file.name,
            type: file.type,
            data: file.data, // Save full base64 data URI to DB
          });
        }
      });
    }

    // Save User Message to DB
    if (chatId) {
      await Message.create({
        chatId,
        role: "user",
        content: lastMessage.content,
        attachments: attachmentsToSave,
      });

      await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });
    }

    const result = await chatSession.sendMessage(parts);
    const response = await result.response;
    const text = response.text();

    // Save Assistant Message to DB
    if (chatId) {
      await Message.create({
        chatId,
        role: "assistant",
        content: text,
      });
    }

    return NextResponse.json({
      role: "assistant",
      content: text,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 500;
    const message =
      error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status });
  }
}
