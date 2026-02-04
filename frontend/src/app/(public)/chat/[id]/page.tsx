"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Sidebar } from "@/src/components/chat/sidebar";
import { ChatInterface } from "@/src/components/chat/chat-interface";

export default function ChatIdPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [key, setKey] = useState(0);
  const router = useRouter();

  const createNewChat = () => {
    setKey((prev) => prev + 1);
    router.push("/chat");
  };

  const loadChat = async (id: string) => {
    setKey((prev) => prev + 1);
    router.push(`/chat/${id}`);
  };

  const handleChatCreated = (newChatId: string) => {
    // React Query will automatically refetch chats list
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar - Always visible */}
      <div className="w-64 border-r bg-background overflow-hidden">
        <Sidebar
          onChatSelect={loadChat}
          onNewChat={createNewChat}
          currentChatId={chatId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 relative">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={createNewChat}
            className="gap-2"
          >
            <Plus size={16} />
            New Chat
          </Button>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            key={key}
            id={chatId}
            onChatCreated={handleChatCreated}
          />
        </div>
      </div>
    </div>
  );
}
