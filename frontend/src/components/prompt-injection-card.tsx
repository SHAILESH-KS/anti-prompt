"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { IScannerInfo } from "@/src/models/PromptInjection.model";

interface PromptInjectionResult {
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: [];
  scanner_info: IScannerInfo;
}

interface PromptInjectionCardProps {
  data: PromptInjectionResult;
}

export function PromptInjectionCard({ data }: PromptInjectionCardProps) {
  const { scanner_type, sanitized_prompt, is_valid, risk_score, scanner_info } =
    data;

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {scanner_info.name}
          </CardTitle>

          <Badge variant={is_valid ? "default" : "destructive"}>
            {is_valid ? "Safe" : "Injected"}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          Scanner Type: {scanner_type}
        </p>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 text-sm">
        {/* Prompt */}
        <div>
          <p className="text-muted-foreground mb-1">Sanitized Prompt</p>
          <p className="line-clamp-4">{sanitized_prompt}</p>
        </div>

        <Separator />

        {/* Risk & Availability */}
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
            <p className="text-muted-foreground">Scanner Status</p>
            <Badge variant={scanner_info.available ? "secondary" : "outline"}>
              {scanner_info.available ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {scanner_info.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
