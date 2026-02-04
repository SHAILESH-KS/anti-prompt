import mongoose, { Schema, Model, Document } from "mongoose";

export interface IAttachment {
  name?: string;
  type: string;
  data: string; // Base64 encoded data
}

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: IAttachment[];
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    [key: string]: unknown;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    name: { type: String },
    type: { type: String, required: true },
    data: { type: String, required: true },
  },
  { _id: false },
);

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant", "system"],
      default: "user",
    },
    content: {
      type: String,
      required: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "messages",
  },
);

// Indexes for better query performance
MessageSchema.index({ chatId: 1, createdAt: 1 });
MessageSchema.index({ chatId: 1, role: 1 });

// Check if model exists before defining to prevent overwrite error in dev mode
const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
