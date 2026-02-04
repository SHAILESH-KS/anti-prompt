import mongoose, { Schema, Model, Document } from "mongoose";

export interface IBanTopicEntity {
  topic: string;
  confidence: number;
  is_banned: boolean;
}

export interface IScannerInfo {
  name: string;
  description: string;
  available: boolean;
  type: string;
}

export interface IBanTopics extends Document {
  _id: mongoose.Types.ObjectId;
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: IBanTopicEntity[];
  scanner_info: IScannerInfo;
  timestamp: Date;
}

const BanTopicEntitySchema = new Schema<IBanTopicEntity>({
  topic: { type: String, required: true },
  confidence: { type: Number, required: true },
  is_banned: { type: Boolean, required: true },
});

const ScannerInfoSchema = new Schema<IScannerInfo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  available: { type: Boolean, required: true },
  type: { type: String, required: true },
});

const BanTopicsSchema = new Schema<IBanTopics>(
  {
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String, required: true },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    detected_entities: [BanTopicEntitySchema],
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "bantopics",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const BanTopics: Model<IBanTopics> =
  mongoose.models.BanTopics ||
  mongoose.model<IBanTopics>("BanTopics", BanTopicsSchema);

export default BanTopics;
