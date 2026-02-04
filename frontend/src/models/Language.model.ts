import mongoose, { Schema, Model, Document } from "mongoose";

export interface ILanguageEntity {
  language: string;
  language_name: string;
  confidence: number;
  is_valid: boolean;
}

export interface IScannerInfo {
  name: string;
  description: string;
  available: boolean;
  type: string;
}

export interface ILanguage extends Document {
  _id: mongoose.Types.ObjectId;
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: ILanguageEntity[];
  scanner_info: IScannerInfo;
  timestamp: Date;
}

const LanguageEntitySchema = new Schema<ILanguageEntity>({
  language: { type: String, required: true },
  language_name: { type: String, required: true },
  confidence: { type: Number, required: true },
  is_valid: { type: Boolean, required: true },
});

const ScannerInfoSchema = new Schema<IScannerInfo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  available: { type: Boolean, required: true },
  type: { type: String, required: true },
});

const LanguageSchema = new Schema<ILanguage>(
  {
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String, required: true },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    detected_entities: [LanguageEntitySchema],
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "languages",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const Language: Model<ILanguage> =
  mongoose.models.Language ||
  mongoose.model<ILanguage>("Language", LanguageSchema);

export default Language;
