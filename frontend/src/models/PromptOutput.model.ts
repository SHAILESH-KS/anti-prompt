import mongoose, { Document, Schema } from "mongoose";

// Interface for detected entities from different scanners
export interface DetectedEntity {
  // For factual consistency and relevance scanners
  entity?: string;
  score?: number;
  type?: string;

  // For malicious URLs scanner
  url?: string;
  domain?: string;
  classifications?: Array<{
    type: string;
    score: number;
    severity: "low" | "medium" | "high";
    is_malicious: boolean;
  }>;
}

// Interface for individual scanner results
export interface ScannerResult {
  scanner_type: string;
  prompt?: string;
  model_output?: string;
  sanitized_output?: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: DetectedEntity[];
  scanner_info: {
    name: string;
    description: string;
    available: boolean;
    type: string;
  };
  error?: string; // For failed scanners
}

// Interface for scan summary
export interface ScanSummary {
  total_scanners: number;
  failed_scanners: number;
  invalid_results: number;
  total_entities_detected: number;
}

// Main interface for PromptOutput document
export interface IPromptOutput extends Document {
  original_prompt: string;
  original_model_output: string;
  final_model_output: string;
  overall_valid: boolean;
  max_risk_score: number;
  scanners_run: number;
  scanner_results: ScannerResult[];
  all_detected_entities: DetectedEntity[];
  summary: ScanSummary;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose schema for detected entities
const DetectedEntitySchema = new Schema(
  {
    // For factual consistency and relevance scanners
    entity: { type: String },
    score: { type: Number },
    type: { type: String },

    // For malicious URLs scanner
    url: { type: String },
    domain: { type: String },
    classifications: [
      {
        type: { type: String, required: true },
        score: { type: Number, required: true },
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
          required: true,
        },
        is_malicious: { type: Boolean, required: true },
      },
    ],
  },
  { _id: false },
);

// Mongoose schema for scanner results
const ScannerResultSchema = new Schema(
  {
    scanner_type: { type: String, required: true },
    prompt: { type: String },
    model_output: { type: String },
    sanitized_output: { type: String },
    is_valid: { type: Boolean, required: true },
    risk_score: { type: Number, required: true },
    detected_entities: [DetectedEntitySchema],
    scanner_info: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      available: { type: Boolean, required: true },
      type: { type: String, required: true },
    },
    error: { type: String },
  },
  { _id: false },
);

// Mongoose schema for scan summary
const ScanSummarySchema = new Schema(
  {
    total_scanners: { type: Number, required: true },
    failed_scanners: { type: Number, required: true },
    invalid_results: { type: Number, required: true },
    total_entities_detected: { type: Number, required: true },
  },
  { _id: false },
);

// Main Mongoose schema for PromptOutput
const PromptOutputSchema = new Schema<IPromptOutput>(
  {
    original_prompt: { type: String, required: true },
    original_model_output: { type: String, required: true },
    final_model_output: { type: String, required: true },
    overall_valid: { type: Boolean, required: true },
    max_risk_score: { type: Number, required: true },
    scanners_run: { type: Number, required: true },
    scanner_results: [ScannerResultSchema],
    all_detected_entities: [DetectedEntitySchema],
    summary: { type: ScanSummarySchema, required: true },
    timestamp: { type: Date, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "prompt_outputs",
  },
);

// Create and export the model
const PromptOutput =
  mongoose.models.PromptOutput ||
  mongoose.model<IPromptOutput>("PromptOutput", PromptOutputSchema);

export default PromptOutput;


