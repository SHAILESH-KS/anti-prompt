"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { ICodeEntity, IScannerInfo } from "@/src/models/Code.model";

interface CodeResult {
  scanner_type: string;
  sanitized_prompt: string;
  is_valid: boolean;
  risk_score: number;
  detected_entities: ICodeEntity[];
  scanner_info: IScannerInfo;
}

interface CodeCardProps {
  data: CodeResult;
}

export function CodeCard({ data }: CodeCardProps) {
  const {
    sanitized_prompt,
    is_valid,
    risk_score,
    detected_entities,
    scanner_info,
  } = data;

  const blockedSnippets = detected_entities.filter((e) => e.is_blocked);
  const allowedSnippets = detected_entities.filter((e) => !e.is_blocked);

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {scanner_info.name}
          </CardTitle>

          <Badge variant={is_valid ? "default" : "destructive"}>
            {is_valid ? "Allowed" : "Blocked"}
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
            <p className="text-muted-foreground">Code Snippets</p>
            <p className="font-medium">{detected_entities.length}</p>
          </div>
        </div>

        {/* Blocked Code */}
        {blockedSnippets.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Blocked Code</p>
              <div className="space-y-2">
                {blockedSnippets.map((snippet, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-destructive/30 bg-destructive/5 p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="destructive">{snippet.language}</Badge>
                      {snippet.type && (
                        <Badge variant="outline">{snippet.type}</Badge>
                      )}
                      <span className="text-muted-foreground">
                        {snippet.length} chars
                      </span>
                    </div>

                    <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                      <code>{snippet.code_snippet}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Allowed Code */}
        {allowedSnippets.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Allowed Code</p>
              <div className="space-y-2">
                {allowedSnippets.map((snippet, index) => (
                  <div key={index} className="rounded-md border p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="secondary">{snippet.language}</Badge>
                      {snippet.type && (
                        <Badge variant="outline">{snippet.type}</Badge>
                      )}
                      <span className="text-muted-foreground">
                        {snippet.length} chars
                      </span>
                    </div>

                    <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                      <code>{snippet.code_snippet}</code>
                    </pre>
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
