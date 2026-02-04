"use client";

import { useState, useEffect } from "react";
import { Send, Bot, User, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
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
  PromptInputAction,
  PromptInputAttachments,
  usePromptInput,
  type Attachment,
} from "@/src/components/prompt-kit/prompt-input";
import { Button } from "@/src/components/ui/button";
import { ScrollButton } from "@/src/components/prompt-kit/scroll-button";
import { Markdown } from "@/src/components/prompt-kit/markdown";
import { Loader } from "@/src/components/prompt-kit/loader";


interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
}

interface ChatInterfaceProps {
    id?: string;
    initialMessages?: ChatMessage[];
}

export function ChatInterface({ id, initialMessages = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialMessages) {
        setMessages(initialMessages);
    }
  }, [initialMessages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input, attachments: attachments.length > 0 ? attachments : undefined };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // If we are in a new chat (no ID), we might need to create it first OR api handles it.
      // API handles it if we send chatId null, but returns chatId?
      // Our API design: POST /api/gemini accepts chatId.
      
      let currentChatId = id;
      
      // If no ID, create chat first via POST /api/chats
      if (!currentChatId) {
          const createRes = await fetch("/api/chats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: input.substring(0, 30) || "New Chat" })
          });
          const createData = await createRes.json();
          if (createData.chat) {
              currentChatId = createData.chat._id;
              // We should probably redirect to the new chat URL to avoid state issues
              // But we want to send the message immediately.
              // We can push user state, but let's send message effectively.
              router.push(`/chat/${currentChatId}`);
          }
      }

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          data: attachments,
          chatId: currentChatId 
        }),
      });
      
      setAttachments([]);

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
                  {m.attachments && m.attachments.length > 0 && (
                      <div className="flex gap-2 flex-wrap justify-end mb-1">
                          {m.attachments.map((att, i) => (
                              <div key={i} className="relative group rounded-lg overflow-hidden border bg-muted w-32 h-32">
                                  {att.type.startsWith("image/") ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <a href={att.data} download={att.name || `attachment-${i}.png`} className="cursor-pointer">
                                        <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                                      </a>
                                  ) : (
                                      <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground p-2 break-all">
                                          {att.name}
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}
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
      <div className={`mx-auto px-4 w-full md:w-[calc(100%-16rem)] md:ml-64 transition-all duration-300`}>
          <div className="max-w-3xl mx-auto">
          <PromptInput
            value={input}
            onValueChange={setInput}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            onSubmit={sendMessage}
            isLoading={isLoading}
            maxHeight={200}
            className="bg-background border shadow-md"
          >
            <PromptInputAttachments />
            <PromptInputTextarea
              placeholder="Message Gemini..."
              className="min-h-[32px] py-2"
            />
            <PromptInputActions className="justify-end py-2 px-2">
              <AttachmentTrigger />
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
    </div>
  );
}

function AttachmentTrigger() {
  const { triggerFileSelect } = usePromptInput();

  return (
    <PromptInputAction tooltip="Attach files">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:bg-muted rounded-full size-8"
        onClick={triggerFileSelect}
      >
        <Paperclip size={16} />
        <span className="sr-only">Attach files</span>
      </Button>
    </PromptInputAction>
  );
}
