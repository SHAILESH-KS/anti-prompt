import mongoose, { Schema, Model, Document } from "mongoose";

export interface IToxicityEntity {
  type: string;
  score: number;
  severity: string;
  exceeds_threshold: boolean;
}

export interface IScannerInfo {
  name: string;
  description: string;
  available: boolean;
  type: string;
}

export interface IToxicity extends Document {
  _id: mongoose.Types.ObjectId;
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: IToxicityEntity[];
  scanner_info: IScannerInfo;
  timestamp: Date;
}

const ToxicityEntitySchema = new Schema<IToxicityEntity>({
  type: { type: String, required: true },
  score: { type: Number, required: true },
  severity: { type: String, required: true },
  exceeds_threshold: { type: Boolean, required: true },
});

const ScannerInfoSchema = new Schema<IScannerInfo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  available: { type: Boolean, required: true },
  type: { type: String, required: true },
});

const ToxicitySchema = new Schema<IToxicity>(
  {
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String, required: true },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    detected_entities: [ToxicityEntitySchema],
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "toxicities",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const Toxicity: Model<IToxicity> =
  mongoose.models.Toxicity ||
  mongoose.model<IToxicity>("Toxicity", ToxicitySchema);

export default Toxicity;
