"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { IToxicityEntity, IScannerInfo } from "@/src/models/Toxicity.model";

interface ToxicityResult {
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: IToxicityEntity[];
  scanner_info: IScannerInfo;
}

interface ToxicityCardProps {
  data: ToxicityResult;
}

export function ToxicityCard({ data }: ToxicityCardProps) {
  const {
    scanner_type,
    sanitized_prompt,
    is_valid,
    risk_score,
    detected_entities,
    scanner_info,
  } = data;

  const exceeded = detected_entities.filter((e) => e.exceeds_threshold);
  const withinLimit = detected_entities.filter((e) => !e.exceeds_threshold);

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {scanner_info.name}
          </CardTitle>

          <Badge variant={is_valid ? "default" : "destructive"}>
            {is_valid ? "Safe" : "Toxic"}
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
            <p className="text-muted-foreground">Signals Found</p>
            <p className="font-medium">{detected_entities.length}</p>
          </div>
        </div>

        {/* Exceeded Toxicity */}
        {exceeded.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Exceeded Threshold</p>
              <div className="flex flex-wrap gap-2">
                {exceeded.map((entity, index) => (
                  <Badge key={index} variant="destructive">
                    {entity.type} • {entity.severity} •{" "}
                    {(entity.score * 100).toFixed(0)}%
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Within Limit */}
        {withinLimit.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Within Limit</p>
              <div className="flex flex-wrap gap-2">
                {withinLimit.map((entity, index) => (
                  <Badge key={index} variant="secondary">
                    {entity.type} • {entity.severity} •{" "}
                    {(entity.score * 100).toFixed(0)}%
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
