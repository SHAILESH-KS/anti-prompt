import mongoose, { Schema, Model, Document } from "mongoose";

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "New Chat",
    },
  },
  {
    timestamps: true,
    collection: "chats",
  },
);

// Indexes for better query performance
ChatSchema.index({ userId: 1, updatedAt: -1 });

// Check if model exists before defining to prevent overwrite error in dev mode
const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;
