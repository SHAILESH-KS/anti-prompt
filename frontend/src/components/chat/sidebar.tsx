"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useChats, useDeleteChat } from "@/src/hooks/use-chat-queries";

interface SidebarProps {
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
}

export function Sidebar({
  onChatSelect,
  onNewChat,
  currentChatId,
}: SidebarProps) {
  const { data: chats = [], isLoading } = useChats();
  const deleteChat = useDeleteChat();

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      await deleteChat.mutateAsync(id);
      if (currentChatId === id) {
        onNewChat();
      }
    } catch (error) {
      console.error("Failed to delete chat", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 border-b">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground p-4">
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground p-4">
            No chats yet. Start a conversation!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => onChatSelect(chat._id)}
              className={cn(
                "group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors",
                currentChatId === chat._id && "bg-muted",
              )}
            >
              <MessageSquare
                size={16}
                className="shrink-0 text-muted-foreground"
              />
              <span className="flex-1 text-sm truncate">{chat.title}</span>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => handleDeleteChat(e, chat._id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
