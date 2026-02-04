import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISecretEntity {
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

export interface ISecrets extends Document {
  _id: mongoose.Types.ObjectId;
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: ISecretEntity[];
  scanner_info: IScannerInfo;
  timestamp: Date;
}

const SecretEntitySchema = new Schema<ISecretEntity>({
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

const SecretsSchema = new Schema<ISecrets>(
  {
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String, required: true },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    detected_entities: [SecretEntitySchema],
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "secrets",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const Secrets: Model<ISecrets> =
  mongoose.models.Secrets || mongoose.model<ISecrets>("Secrets", SecretsSchema);

export default Secrets;
