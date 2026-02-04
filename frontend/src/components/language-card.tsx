"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { ILanguageEntity, IScannerInfo } from "@/src/models/Language.model";

interface LanguageResult {
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: ILanguageEntity[];
  scanner_info: IScannerInfo;
}

interface LanguageCardProps {
  data: LanguageResult;
}

export function LanguageCard({ data }: LanguageCardProps) {
  const {
    sanitized_prompt,
    is_valid,
    risk_score,
    detected_entities,
    scanner_info,
  } = data;

  const validLanguages = detected_entities.filter((l) => l.is_valid);
  const invalidLanguages = detected_entities.filter((l) => !l.is_valid);

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {scanner_info.name}
          </CardTitle>

          <Badge variant={is_valid ? "default" : "destructive"}>
            {is_valid ? "Allowed" : "Disallowed"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Type: {scanner_info.type}</span>
          <span>•</span>
          <Badge
            variant={scanner_info.available ? "secondary" : "outline"}
            className="text-xs"
          >
            {scanner_info.available ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 text-sm">
        {/* Prompt */}
        <div>
          <p className="text-muted-foreground mb-1">Sanitized Prompt</p>
          <p className="line-clamp-4">{sanitized_prompt}</p>
        </div>

        <Separator />

        {/* Risk & Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Risk Score</p>
            <p
              className={
                risk_score > 0.7
                  ? "font-semibold text-destructive"
                  : "font-medium"
              }
            >
              {risk_score}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Languages Detected</p>
            <p className="font-medium">{detected_entities.length}</p>
          </div>
        </div>

        {/* Valid Languages */}
        {validLanguages.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Valid Languages</p>
              <div className="flex flex-wrap gap-2">
                {validLanguages.map((lang, index) => (
                  <Badge key={index} variant="secondary">
                    {lang.language_name} • {(lang.confidence * 100).toFixed(0)}%
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Invalid Languages */}
        {invalidLanguages.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Disallowed Languages</p>
              <div className="flex flex-wrap gap-2">
                {invalidLanguages.map((lang, index) => (
                  <Badge key={index} variant="destructive">
                    {lang.language_name} • {(lang.confidence * 100).toFixed(0)}%
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Scanner Description */}
        <p className="text-xs text-muted-foreground">
          {scanner_info.description}
        </p>

        {/* Footer */}
        {/* Timestamp not available in scanner results */}
      </CardContent>
    </Card>
  );
}
