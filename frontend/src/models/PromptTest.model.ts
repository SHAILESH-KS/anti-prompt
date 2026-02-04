import mongoose, { Schema, Model, Document } from "mongoose";
import {
  IDetectedEntity,
  IScannerInfo,
  ISecretEntity,
  ILanguageEntity,
  IToxicityEntity,
  IGibberishEntity,
  IBanTopicEntity,
  ICodeEntity,
  IInvisibleEntity,
} from "./index";

export interface IPromptTestSummary {
  total_scanners: number;
  failed_scanners: number;
  invalid_results: number;
  total_entities_detected: number;
}

interface BaseScannerResult {
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  scanner_info: IScannerInfo;
}

interface AnonymizeResult extends BaseScannerResult {
  scanner_type: "anonymize";
  detected_entities: IDetectedEntity[];
}

interface PromptInjectionResult extends BaseScannerResult {
  scanner_type: "prompt_injection";
  detected_entities: [];
}

interface RegexResult extends BaseScannerResult {
  scanner_type: "regex";
  detected_entities: [];
}

interface SecretsResult extends BaseScannerResult {
  scanner_type: "secrets";
  detected_entities: ISecretEntity[];
}

interface InvisibleTextResult extends BaseScannerResult {
  scanner_type: "invisible_text";
  detected_entities: IInvisibleEntity[];
}

interface LanguageResult extends BaseScannerResult {
  scanner_type: "language";
  detected_entities: ILanguageEntity[];
}

interface ToxicityResult extends BaseScannerResult {
  scanner_type: "toxicity";
  detected_entities: IToxicityEntity[];
}

interface GibberishResult extends BaseScannerResult {
  scanner_type: "gibberish";
  detected_entities: IGibberishEntity[];
}

interface BanTopicsResult extends BaseScannerResult {
  scanner_type: "ban_topics";
  detected_entities: IBanTopicEntity[];
}

interface CodeResult extends BaseScannerResult {
  scanner_type: "code";
  detected_entities: ICodeEntity[];
}

type ScannerResult =
  | AnonymizeResult
  | PromptInjectionResult
  | RegexResult
  | SecretsResult
  | InvisibleTextResult
  | LanguageResult
  | ToxicityResult
  | GibberishResult
  | BanTopicsResult
  | CodeResult;

type DetectedEntity =
  | IDetectedEntity
  | ISecretEntity
  | IInvisibleEntity
  | ILanguageEntity
  | IToxicityEntity
  | IGibberishEntity
  | IBanTopicEntity
  | ICodeEntity;

export interface IPromptTest extends Document {
  _id: mongoose.Types.ObjectId;
  original_prompt: string;
  final_prompt: string;
  overall_valid: boolean;
  max_risk_score: number;
  scanners_run: number;
  scanner_results: ScannerResult[];
  all_detected_entities: DetectedEntity[];
  summary: IPromptTestSummary;
  timestamp: Date;
}

const PromptTestSummarySchema = new Schema<IPromptTestSummary>({
  total_scanners: { type: Number, required: true },
  failed_scanners: { type: Number, required: true },
  invalid_results: { type: Number, required: true },
  total_entities_detected: { type: Number, required: true },
});

const PromptTestSchema = new Schema<IPromptTest>(
  {
    original_prompt: { type: String, required: true },
    final_prompt: { type: String, required: true },
    overall_valid: { type: Boolean, required: true },
    max_risk_score: { type: Number, required: true },
    scanners_run: { type: Number, required: true },
    scanner_results: [{ type: Schema.Types.Mixed }],
    all_detected_entities: [{ type: Schema.Types.Mixed }],
    summary: PromptTestSummarySchema,
    timestamp: { type: Date, required: true },
  },
  {
    collection: "prompttests",
  },
);

// Check if model exists before defining to prevent overwrite error in dev mode
const PromptTest: Model<IPromptTest> =
  mongoose.models.PromptTest ||
  mongoose.model<IPromptTest>("PromptTest", PromptTestSchema);

export default PromptTest;
