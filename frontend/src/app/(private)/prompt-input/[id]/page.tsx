"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { IPromptTest } from "@/src/models/PromptTest.model";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/src/components/ui/button";

import { Markdown } from "@/src/components/prompt-kit/markdown";

import { AnonymizeCard } from "@/src/components/anonymize-card";
import { PromptInjectionCard } from "@/src/components/prompt-injection-card";
import { BanTopicsCard } from "@/src/components/ban-topics-card";
import { ToxicityCard } from "@/src/components/toxicity-card";
import { GibberishCard } from "@/src/components/gibberish-card";
import { SecretsCard } from "@/src/components/secrets-card";
import { RegexCard } from "@/src/components/regex-card";
import { LanguageCard } from "@/src/components/language-card";
import { CodeCard } from "@/src/components/code-card";
import { useState } from "react";

async function getPromptInput(id: string): Promise<IPromptTest> {
  const response = await fetch(`/api/prompt-inputs/${id}`);
  if (!response.ok) throw new Error("Failed to fetch prompt input");
  return (await response.json()).data;
}

export default function PromptInputDetailsPage() {
  const { id } = useParams() as { id: string };

  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [showFullFinalPrompt, setShowFullFinalPrompt] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["promptInput", id],
    queryFn: () => getPromptInput(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-destructive">Failed to load</div>;
  if (!data) return null;

  return (
    <div className="w-full space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Prompt Input Details
        </h1>
        <p className="text-sm text-muted-foreground">
          Full analysis and scanner results
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge variant={data.overall_valid ? "default" : "destructive"}>
              {data.overall_valid ? "Valid" : "Invalid"}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Max Risk</p>
            <p className="font-medium">{data.max_risk_score}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Scanners Run</p>
            <p className="font-medium">{data.scanners_run}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">
              {data.createdAt
                ? new Date(data.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-muted-foreground">ID</p>
            <p className="truncate font-mono text-xs">{data._id.toString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Original */}
        <Card>
          <CardHeader>
            <CardTitle>Original Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md bg-muted p-4 text-sm">
              <Markdown>
                {showFullPrompt
                  ? data.original_prompt
                  : data.original_prompt.slice(0, 300)}
              </Markdown>
            </div>
            {data.original_prompt.length > 300 && (
              <Button
                variant="link"
                className="px-0"
                onClick={() => setShowFullPrompt(!showFullPrompt)}
              >
                {showFullPrompt ? "Show less" : "Show more"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Final */}
        <Card>
          <CardHeader>
            <CardTitle>Final Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md bg-muted p-4 text-sm">
              <Markdown>
                {showFullFinalPrompt
                  ? data.final_prompt
                  : data.final_prompt.slice(0, 300)}
              </Markdown>
            </div>
            {data.final_prompt.length > 300 && (
              <Button
                variant="link"
                className="px-0"
                onClick={() => setShowFullFinalPrompt(!showFullFinalPrompt)}
              >
                {showFullFinalPrompt ? "Show less" : "Show more"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {data.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Total Scanners</p>
              <p className="font-medium">{data.summary.total_scanners}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Failed</p>
              <p className="font-medium">{data.summary.failed_scanners}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Invalid Results</p>
              <p className="font-medium">{data.summary.invalid_results}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Entities</p>
              <p className="font-medium">
                {data.summary.total_entities_detected}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Scanner Results</h2>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {data.scanner_results.map((result, idx) => {
            switch (result.scanner_type) {
              case "anonymize":
                return <AnonymizeCard key={idx} data={result} />;
              case "prompt_injection":
                return <PromptInjectionCard key={idx} data={result} />;
              case "ban_topics":
                return <BanTopicsCard key={idx} data={result} />;
              case "toxicity":
                return <ToxicityCard key={idx} data={result} />;
              case "gibberish":
                return <GibberishCard key={idx} data={result} />;
              case "secrets":
                return <SecretsCard key={idx} data={result} />;
              case "regex":
                return <RegexCard key={idx} data={result} />;
              case "language":
                return <LanguageCard key={idx} data={result} />;
              case "code":
                return <CodeCard key={idx} data={result} />;
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
