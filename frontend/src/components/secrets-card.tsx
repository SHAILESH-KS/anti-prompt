"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { ISecretEntity, IScannerInfo } from "@/src/models/Secrets.model";

interface SecretsResult {
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: ISecretEntity[];
  scanner_info: IScannerInfo;
}

interface SecretsCardProps {
  data: SecretsResult;
}

export function SecretsCard({ data }: SecretsCardProps) {
  const {
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
            {is_valid ? "Safe" : "Secrets Found"}
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
            <p className="text-muted-foreground">Secrets Detected</p>
            <p className="font-medium">{detected_entities.length}</p>
          </div>
        </div>

        {/* Detected Secrets */}
        {detected_entities.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Detected Secrets</p>
              <div className="space-y-2">
                {detected_entities.map((entity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{entity.type}</Badge>
                      <span className="text-muted-foreground">
                        {entity.start}–{entity.end}
                      </span>
                    </div>

                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {entity.redacted_value}
                    </code>
                  </div>
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
