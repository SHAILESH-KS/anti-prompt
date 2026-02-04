"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Sidebar } from "@/src/components/chat/sidebar";
import { ChatInterface } from "@/src/components/chat/chat-interface";

export default function ChatPage() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [key, setKey] = useState(0); // Force re-render of ChatInterface
  const router = useRouter();

  const createNewChat = () => {
    setCurrentChatId(null);
    setKey((prev) => prev + 1); // Force re-render to clear messages
    router.push("/chat");
  };

  const loadChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    setKey((prev) => prev + 1); // Force re-render with new chat
    router.push(`/chat/${chatId}`);
  };

  const handleChatCreated = (chatId: string) => {
    setCurrentChatId(chatId);
    // React Query will automatically refetch chats list
  };

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      {/* Sidebar - Always visible */}
      <div className="w-64 border-r bg-background overflow-hidden">
        <Sidebar
          onChatSelect={loadChat}
          onNewChat={createNewChat}
          currentChatId={currentChatId}
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
            id={currentChatId || undefined}
            onChatCreated={handleChatCreated}
          />
        </div>
      </div>
    </div>
  );
}
