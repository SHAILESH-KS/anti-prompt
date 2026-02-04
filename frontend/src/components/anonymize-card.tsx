"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { IDetectedEntity, IScannerInfo } from "@/src/models/Anonymize.model";

interface AnonymizeResult {
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: IDetectedEntity[];
  scanner_info: IScannerInfo;
}

interface AnonymizeCardProps {
  data: AnonymizeResult;
}

export function AnonymizeCard({ data }: AnonymizeCardProps) {
  const {
    scanner_type,
    sanitized_prompt,
    is_valid,
    risk_score,
    detected_entities,
    scanner_info,
  } = data;

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {scanner_info.name}
          </CardTitle>

          <Badge variant={is_valid ? "default" : "destructive"}>
            {is_valid ? "Valid" : "Invalid"}
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

        {/* Stats */}
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
            <p className="text-muted-foreground">Entities</p>
            <p className="font-medium">{detected_entities.length}</p>
          </div>
        </div>

        {/* Detected Entities */}
        {detected_entities.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Detected Entities</p>
              <div className="flex flex-wrap gap-2">
                {detected_entities.map((entity, index) => (
                  <Badge key={index} variant="secondary">
                    {entity.type}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Scanner Description */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {scanner_info.description}
          </p>
        </div>

        {/* Footer */}
        {/* Timestamp not available in scanner results */}
      </CardContent>
    </Card>
  );
}
