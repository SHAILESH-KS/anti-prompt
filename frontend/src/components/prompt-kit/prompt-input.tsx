"use client";

import { Textarea } from "@/src/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";
import { Paperclip, X, File as FileIcon } from "lucide-react";
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type Attachment = {
  name: string;
  type: string;
  data: string;
};

type PromptInputContextType = {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  attachments: Attachment[];
  addAttachments: (files: FileList | null) => void;
  removeAttachment: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  triggerFileSelect: () => void;
};

const PromptInputContext = createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
  textareaRef: React.createRef<HTMLTextAreaElement>(),
  attachments: [],
  addAttachments: () => {},
  removeAttachment: () => {},
  fileInputRef: React.createRef<HTMLInputElement>(),
  triggerFileSelect: () => {},
});

function usePromptInput() {
  return useContext(PromptInputContext);
}

export type PromptInputProps = {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;

  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
} & React.ComponentProps<"div">;

function PromptInput({
  className,
  isLoading = false,
  maxHeight = 240,
  value,
  onValueChange,
  onSubmit,
  children,
  disabled = false,
  onClick,
  accept = "image/*",
  multiple = true,
  attachments: controlledAttachments,
  onAttachmentsChange,
  ...props
}: PromptInputProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  const [internalAttachments, setInternalAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachments = controlledAttachments ?? internalAttachments;
  const isControlled = controlledAttachments !== undefined;

  const addAttachments = async (files: FileList | null) => {
    if (!files) return;
    
    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const promise = new Promise<Attachment>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    type: file.type,
                    data: e.target?.result as string,
                });
            };
            reader.readAsDataURL(file);
        });
        newAttachments.push(await promise);
    }
    
    if (isControlled) {
        onAttachmentsChange?.([...attachments, ...newAttachments]);
    } else {
        setInternalAttachments((prev) => [...prev, ...newAttachments]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    if (isControlled) {
        onAttachmentsChange?.(attachments.filter((_: Attachment, i: number) => i !== index));
    } else {
        setInternalAttachments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!disabled) textareaRef.current?.focus();
    onClick?.(e);
  };

  return (
    <TooltipProvider>
      <PromptInputContext.Provider
        value={{
          isLoading,
          value: value ?? internalValue,
          setValue: onValueChange ?? handleChange,
          maxHeight,
          onSubmit,
          disabled,
          textareaRef,
          attachments,
          addAttachments,
          removeAttachment,
          fileInputRef,
          triggerFileSelect,
        }}
      >
        <div
          onClick={handleClick}
          className={cn(
            "border-input bg-background cursor-text rounded-3xl border p-2 shadow-xs scrollbar-hide",
            disabled && "cursor-not-allowed opacity-60",
            className,
          )}
          {...props}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={(e) => addAttachments(e.target.files)}
          />
          {children}
        </div>
      </PromptInputContext.Provider>
    </TooltipProvider>
  );
}

export type PromptInputTextareaProps = {
  disableAutosize?: boolean;
} & React.ComponentProps<typeof Textarea>;

function PromptInputTextarea({
  className,
  onKeyDown,
  disableAutosize = false,
  ...props
}: PromptInputTextareaProps) {
  const { value, setValue, maxHeight, onSubmit, disabled, textareaRef } =
    usePromptInput();

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (!el || disableAutosize) return;

    el.style.height = "auto";

    if (typeof maxHeight === "number") {
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    } else {
      el.style.height = `min(${el.scrollHeight}px, ${maxHeight})`;
    }
  };

  const handleRef = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    adjustHeight(el);
  };

  useLayoutEffect(() => {
    if (!textareaRef.current || disableAutosize) return;

    const el = textareaRef.current;
    el.style.height = "auto";

    if (typeof maxHeight === "number") {
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    } else {
      el.style.height = `min(${el.scrollHeight}px, ${maxHeight})`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, maxHeight, disableAutosize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight(e.target);
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={handleRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={cn(
        "text-primary min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-hide",
        className,
      )}
      rows={1}
      disabled={disabled}
      {...props}
    />
  );
}

export type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

function PromptInputActions({
  children,
  className,
  ...props
}: PromptInputActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export type PromptInputActionProps = {
  className?: string;
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
} & React.ComponentProps<typeof Tooltip>;

function PromptInputAction({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: PromptInputActionProps) {
  const { disabled } = usePromptInput();

  return (
    <Tooltip {...props}>
      <TooltipTrigger
        asChild
        disabled={disabled}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function PromptInputAttachments() {
  const { attachments, removeAttachment } = usePromptInput();

  if (attachments.length === 0) return null;

  return (
    <div className="flex gap-2 p-2 overflow-x-auto scrollbar-hide">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="relative group flex-shrink-0 size-16 rounded-lg border bg-muted overflow-hidden"
        >
          {attachment.type.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.data}
              alt={attachment.name}
              className="size-full object-cover"
            />
          ) : (
             <div className="size-full flex items-center justify-center text-muted-foreground">
               <FileIcon size={24} />
             </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeAttachment(index);
            }}
            className="absolute top-0.5 right-0.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-foreground rounded-full p-0.5 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
  usePromptInput,
};
