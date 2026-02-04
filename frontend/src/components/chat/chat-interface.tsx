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
import {
  useChat,
  useCreateChat,
  useSendMessage,
} from "@/src/hooks/use-chat-queries";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
}

interface ChatInterfaceProps {
  id?: string;
  initialMessages?: ChatMessage[];
  onChatCreated?: (chatId: string) => void;
}

export function ChatInterface({
  id,
  initialMessages = [],
  onChatCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const router = useRouter();

  const { data: chatData, isLoading: isLoadingMessages } = useChat(id);
  const createChat = useCreateChat();
  const sendMessageMutation = useSendMessage();

  // Update messages when chat data changes
  useEffect(() => {
    if (chatData?.messages) {
      setMessages(chatData.messages as ChatMessage[]);
    } else if (!id) {
      setMessages([]);
    }
  }, [chatData, id]);

  const sendMessage = async () => {
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setAttachments([]);

    try {
      let currentChatId = id;

      // If no ID, create chat first
      if (!currentChatId) {
        const newChat = await createChat.mutateAsync(
          currentInput.substring(0, 30) || "New Chat",
        );
        currentChatId = newChat._id;

        if (onChatCreated && currentChatId) {
          onChatCreated(currentChatId);
        }
        if (currentChatId) {
          router.push(`/chat/${currentChatId}`);
        }
      }

      // Send message to AI
      const data = await sendMessageMutation.mutateAsync({
        messages: [...messages, userMessage],
        data: attachments,
        chatId: currentChatId,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      let errorMessage: ChatMessage;

      if (error instanceof Error && (error as any).type === "blocked") {
        // Handle blocked prompts with detailed information
        const blockedError = error as any;

        errorMessage = {
          role: "assistant",
          content: `🚫 **Prompt Blocked**\n\n${blockedError.message}\n\n**Risk Score:** ${blockedError.scanResult?.max_risk_score || "N/A"}\n**Scanners Run:** ${blockedError.scanResult?.scanners_run || "N/A"}\n\n*Your prompt was flagged by our security scanners and cannot be processed.*`,
        };
      } else {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        errorMessage = {
          role: "assistant",
          content: `❌ **Error:** ${message}`,
        };
      }

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full relative scrollbar-hide">
      <ChatContainerRoot className="flex-1 overflow-hidden scrollbar-hide">
        <ChatContainerContent className="flex-1 space-y-6 pb-40 scrollbar-hide">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-4 pt-20">
              <Loader variant="typing" size="lg" />
              <p className="text-lg font-medium">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-4 pt-20">
              <Bot size={64} strokeWidth={1.5} />
              <p className="text-lg font-medium">
                Start a conversation with Gemini
              </p>
            </div>
          ) : null}

          {!isLoadingMessages &&
            messages.map((m, index) => (
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
                          <div
                            key={i}
                            className="relative group rounded-lg overflow-hidden border bg-muted w-32 h-32"
                          >
                            {att.type.startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <a
                                href={att.data}
                                download={att.name || `attachment-${i}.png`}
                                className="cursor-pointer"
                              >
                                <img
                                  src={att.data}
                                  alt={att.name}
                                  className="w-full h-full object-cover"
                                />
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

          {sendMessageMutation.isPending && (
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
        <div
          className={`mx-auto px-4 w-full md:w-[calc(100%-16rem)] md:ml-64 transition-all duration-300`}
        >
          <div className="max-w-3xl mx-auto">
            <PromptInput
              value={input}
              onValueChange={setInput}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              onSubmit={sendMessage}
              isLoading={sendMessageMutation.isPending}
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
                  disabled={sendMessageMutation.isPending || !input.trim()}
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
