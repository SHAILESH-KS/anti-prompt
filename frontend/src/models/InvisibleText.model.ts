import mongoose, { Schema, Model, Document } from "mongoose";

export interface IInvisibleEntity {
  type: string;
  start: number;
  end: number;
  original_value: string;
  redacted_value: string;
}

export interface IScannerInfo {
  name: string;
  description: string;
  available: boolean;
  type: string;
}

export interface IInvisibleText extends Document {
  _id: mongoose.Types.ObjectId;
  prompt: string;
  scanner_type: string;
  sanitized_prompt?: string;
  is_valid?: boolean;
  risk_score?: number;
  detected_entities?: IInvisibleEntity[];
  scanner_info?: IScannerInfo;
  timestamp?: Date;
}

const InvisibleEntitySchema = new Schema<IInvisibleEntity>({
  type: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  original_value: { type: String, required: true },
  redacted_value: { type: String, required: true },
});

const ScannerInfoSchema = new Schema<IScannerInfo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  available: { type: Boolean, required: true },
  type: { type: String, required: true },
});

const InvisibleTextSchema = new Schema<IInvisibleText>(
  {
    prompt: { type: String, required: true },
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String },
    is_valid: { type: Boolean },
    risk_score: { type: Number },
    detected_entities: [InvisibleEntitySchema],
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date },
  },
  {
    collection: "invisibletexts",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const InvisibleText: Model<IInvisibleText> =
  mongoose.models.InvisibleText ||
  mongoose.model<IInvisibleText>("InvisibleText", InvisibleTextSchema);

export default InvisibleText;
