"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Chat {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Array<{
    name?: string;
    type: string;
    data: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ChatWithMessages {
  chat: Chat;
  messages: Message[];
}

// Fetch all chats
export function useChats() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await fetch("/api/chats");
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      return data.chats as Chat[];
    },
  });
}

// Fetch specific chat with messages
export function useChat(chatId: string | undefined) {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!chatId) return null;
      const res = await fetch(`/api/chats/${chatId}`);
      if (!res.ok) throw new Error("Failed to fetch chat");
      const data = await res.json();
      return data as ChatWithMessages;
    },
    enabled: !!chatId,
  });
}

// Create new chat
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      const data = await res.json();
      return data.chat as Chat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

// Delete chat
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete chat");
      return chatId;
    },
    onSuccess: (deletedChatId) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.removeQueries({ queryKey: ["chat", deletedChatId] });
    },
  });
}

// Send message to Gemini
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messages,
      data,
      chatId,
    }: {
      messages: Array<{
        role: "user" | "assistant";
        content: string;
        attachments?: Array<{
          name?: string;
          type: string;
          data: string;
        }>;
      }>;
      data?: Array<{
        name: string;
        type: string;
        data: string;
      }>;
      chatId?: string;
    }) => {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, data, chatId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send message");
      }
      const responseData = await res.json();
      return responseData;
    },
    onSuccess: (_data, variables) => {
      if (variables.chatId) {
        queryClient.invalidateQueries({ queryKey: ["chat", variables.chatId] });
      }
    },
  });
}
