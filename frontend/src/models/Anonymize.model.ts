import mongoose, { Schema, Model, Document } from "mongoose";

export interface IDetectedEntity {
  type: string;
  original_value: string;
  placeholder: string;
  start: number;
  end: number;
}

export interface IScannerInfo {
  name: string;
  description: string;
  available: boolean;
  type: string;
}

export interface IAnonymize extends Document {
  _id: mongoose.Types.ObjectId;
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: IDetectedEntity[];
  scanner_info: IScannerInfo;
  timestamp: Date;
}

const DetectedEntitySchema = new Schema<IDetectedEntity>({
  type: { type: String, required: true },
  original_value: { type: String, required: true },
  placeholder: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
});

const ScannerInfoSchema = new Schema<IScannerInfo>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  available: { type: Boolean, required: true },
  type: { type: String, required: true },
});

const AnonymizeSchema = new Schema<IAnonymize>(
  {
    scanner_type: { type: String, required: true },
    sanitized_prompt: { type: String, required: true },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    detected_entities: [DetectedEntitySchema],
    scanner_info: ScannerInfoSchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "anonymizes",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const Anonymize: Model<IAnonymize> =
  mongoose.models.Anonymize ||
  mongoose.model<IAnonymize>("Anonymize", AnonymizeSchema);

export default Anonymize;
