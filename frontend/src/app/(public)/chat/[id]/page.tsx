export const dynamic = 'force-dynamic';

import { ChatInterface } from "@/src/components/chat/chat-interface";
import { Message } from "@/src/lib/models";
import connectToDatabase from "@/src/lib/db";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getChatMessages(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return null; // Handle auth redirect in component
    }

    try {
        await connectToDatabase();
        const messages = await Message.find({ chatId: id }).sort({ createdAt: 1 }).lean();
        
        return messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments ? m.attachments.map((a: any) => ({
                name: a.name,
                type: a.type,
                data: a.data
            })) : []
        }));
    } catch (e) {
        console.error("Error fetching messages", e);
        return [];
    }
}

export default async function ChatIdPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const messages = await getChatMessages(id);

    if (messages === null) {
        redirect("/signin");
    }

    return <ChatInterface id={id} initialMessages={messages} />;
}
