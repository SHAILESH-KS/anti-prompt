import mongoose, { Schema, Model, Document } from "mongoose";

export interface IGibberishEntity {
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

export interface IGibberish extends Document {
  _id: mongoose.Types.ObjectId;
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: IGibberishEntity[];
  scanner_info: IScannerInfo;
  timestamp: Date;
}

const GibberishEntitySchema = new Schema<IGibberishEntity>({
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

const GibberishSchema = new Schema<IGibberish>(
  {
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String, required: true },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    detected_entities: [GibberishEntitySchema],
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "gibberishes",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const Gibberish: Model<IGibberish> =
  mongoose.models.Gibberish ||
  mongoose.model<IGibberish>("Gibberish", GibberishSchema);

export default Gibberish;
