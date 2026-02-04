import mongoose, { Schema, Model, Document } from "mongoose";

export interface ICodeEntity {
  language: string;
  code_snippet: string;
  is_blocked: boolean;
  length: number;
  type?: string;
}

export interface IScannerInfo {
  name: string;
  description: string;
  available: boolean;
  type: string;
}

export interface ICode extends Document {
  _id: mongoose.Types.ObjectId;
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: ICodeEntity[];
  scanner_info: IScannerInfo;
  timestamp: Date;
}

const CodeEntitySchema = new Schema<ICodeEntity>({
  language: { type: String, required: true },
  code_snippet: { type: String, required: true },
  is_blocked: { type: Boolean, required: true },
  length: { type: Number, required: true },
  type: { type: String },
});

const ScannerInfoSchema = new Schema<IScannerInfo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  available: { type: Boolean, required: true },
  type: { type: String, required: true },
});

const CodeSchema = new Schema<ICode>(
  {
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String, required: true },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    detected_entities: [CodeEntitySchema],
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "codes",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const Code: Model<ICode> =
  mongoose.models.Code || mongoose.model<ICode>("Code", CodeSchema);

export default Code;
