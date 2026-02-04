import mongoose, { Schema, Model, Document } from "mongoose";

export interface IScannerInfo {
  name: string;
  description: string;
  available: boolean;
  type: string;
}

export interface IRegex extends Document {
  _id: mongoose.Types.ObjectId;
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  scanner_info: IScannerInfo;
  timestamp: Date;
}

const ScannerInfoSchema = new Schema<IScannerInfo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  available: { type: Boolean, required: true },
  type: { type: String, required: true },
});

const RegexSchema = new Schema<IRegex>(
  {
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String, required: true },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "regexes",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const Regex: Model<IRegex> =
  mongoose.models.Regex || mongoose.model<IRegex>("Regex", RegexSchema);

export default Regex;
