"use client";

import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/src/components/prompt-kit/chat-container";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/src/components/prompt-kit/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from "@/src/components/prompt-kit/prompt-input";
import { Button } from "@/src/components/ui/button";
import { ScrollButton } from "@/src/components/prompt-kit/scroll-button";
import { Markdown } from "@/src/components/prompt-kit/markdown";
import { Loader } from "@/src/components/prompt-kit/loader";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Error: ${error.message || "Something went wrong"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] py-4 relative scrollbar-hide">
      <ChatContainerRoot className="flex-1 overflow-hidden scrollbar-hide">
        <ChatContainerContent className="flex-1 space-y-6 pt-4 pb-40 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-4 pt-20">
              <Bot size={64} strokeWidth={1.5} />
              <p className="text-lg font-medium">
                Start a conversation with Gemini
              </p>
            </div>
          )}

          {messages.map((m, index) => (
            <Message
              key={index}
              className={
                m.role === "user" ? "ml-auto max-w-2xl" : "mr-auto max-w-3xl"
              }
            >
              <div
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <MessageAvatar className="size-8 shrink-0 border">
                  {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </MessageAvatar>
                <div
                  className={`flex flex-col gap-1 min-w-0 ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <MessageContent
                    className={`text-sm px-4 py-3 rounded-2xl shadow-sm border ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground border-primary/20 rounded-tr-sm"
                        : "bg-muted/50 border-border rounded-tl-sm dark:bg-muted/30"
                    }`}
                  >
                    {m.role === "user" ? (
                      <div className="whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    ) : (
                      <Markdown className="prose dark:prose-invert prose-sm max-w-none break-words">
                        {m.content}
                      </Markdown>
                    )}
                  </MessageContent>
                </div>
              </div>
            </Message>
          ))}

          {isLoading && (
            <Message className="mr-auto w-fit">
              <div className="flex gap-3">
                <MessageAvatar className="size-8 shrink-0 border">
                  <Bot size={16} />
                </MessageAvatar>
                <MessageContent className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border">
                  <Loader variant="typing" size="sm" className="opacity-50" />
                </MessageContent>
              </div>
            </Message>
          )}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>

        <div className="absolute right-4 bottom-24 z-10">
          <ScrollButton className="shadow-lg border bg-background/80 backdrop-blur" />
        </div>
      </ChatContainerRoot>

      <div className="fixed bottom-6 left-0 right-0 z-20">
        <div className="max-w-3xl mx-auto px-4">
          <PromptInput
            value={input}
            onValueChange={setInput}
            onSubmit={sendMessage}
            isLoading={isLoading}
            maxHeight={200}
            className="bg-background border shadow-md"
          >
            <PromptInputTextarea
              placeholder="Message Gemini..."
              className="min-h-[32px] py-2"
            />
            <PromptInputActions className="justify-end py-2 px-2">
              <Button
                size="icon"
                variant={input.trim() ? "default" : "ghost"}
                className={`transition-all duration-200 rounded-full size-8 ${!input.trim() && "text-muted-foreground hover:bg-muted"}`}
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
              >
                <Send size={16} />
                <span className="sr-only">Send</span>
              </Button>
            </PromptInputActions>
          </PromptInput>
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              Gemini can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
