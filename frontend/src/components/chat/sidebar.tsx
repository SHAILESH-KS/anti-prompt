"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface Chat {
    _id: string;
    title: string;
    createdAt: string;
}

export function Sidebar({ className }: { className?: string }) {
    const [chats, setChats] = useState<Chat[]>([]);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        fetchChats();
    }, [pathname]); // Refetch when path changes (e.g. new chat created)

    const fetchChats = async () => {
        try {
            const res = await fetch("/api/chats");
            if (res.ok) {
                const data = await res.json();
                setChats(data.chats);
            }
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    const deleteChat = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this chat?")) return;

        try {
            const res = await fetch(`/api/chats/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setChats((prev) => prev.filter((c) => c._id !== id));
                if (pathname.includes(id)) {
                    router.push("/chat");
                }
            }
        } catch (error) {
            console.error("Failed to delete chat", error);
        }
    };

    return (
        <div className={cn("w-64 border-r h-full flex flex-col bg-muted/20", className)}>
            <div className="p-4 border-b">
                <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2" 
                    onClick={() => router.push("/chat")}
                >
                    <Plus size={16} />
                    New Chat
                </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {chats.map((chat) => (
                    <Link
                        key={chat._id}
                        href={`/chat/${chat._id}`}
                        className={cn(
                            "flex items-center justify-between p-2 rounded-lg text-sm hover:bg-muted transition-colors group",
                            pathname === `/chat/${chat._id}` ? "bg-muted font-medium" : "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                            <MessageSquare size={16} className="shrink-0" />
                            <span className="truncate">{chat.title}</span>
                        </div>
                        <button
                            onClick={(e) => deleteChat(e, chat._id)}
                            className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
}
