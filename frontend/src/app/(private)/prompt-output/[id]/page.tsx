"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { IPromptOutput } from "@/src/models/PromptOutput.model";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { Markdown } from "@/src/components/prompt-kit/markdown";

async function getPromptOutput(id: string): Promise<IPromptOutput> {
  const response = await fetch(`/api/prompt-outputs/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch prompt output");
  }
  const result = await response.json();
  return result.data;
}

const PromptDetailsPage = () => {
  const params = useParams();
  const id = params.id as string;

  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [showFullOriginalOutput, setShowFullOriginalOutput] = useState(false);
  const [showFullFinalOutput, setShowFullFinalOutput] = useState(false);

  const {
    data: promptOutput,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["promptOutput", id],
    queryFn: () => getPromptOutput(id),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!promptOutput) return <div>Prompt output not found.</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Prompt Output Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>ID:</strong> {promptOutput._id.toString()}
          </div>
          <div>
            <strong>Overall Valid:</strong>{" "}
            <Badge
              variant={promptOutput.overall_valid ? "default" : "destructive"}
            >
              {promptOutput.overall_valid ? "Valid" : "Invalid"}
            </Badge>
          </div>
          <div>
            <strong>Max Risk Score:</strong> {promptOutput.max_risk_score}
          </div>
          <div>
            <strong>Scanners Run:</strong> {promptOutput.scanners_run}
          </div>
          <div>
            <strong>Timestamp:</strong>{" "}
            {new Date(promptOutput.timestamp).toLocaleString()}
          </div>
          <div>
            <strong>Created At:</strong>{" "}
            {new Date(promptOutput.createdAt!).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Original Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Original Prompt:</strong>
            <div className="mt-2 p-4 bg-muted rounded">
              <Markdown>
                {showFullPrompt
                  ? promptOutput.original_prompt
                  : promptOutput.original_prompt.length > 200
                    ? promptOutput.original_prompt.slice(0, 200) + "..."
                    : promptOutput.original_prompt}
              </Markdown>
            </div>
            {promptOutput.original_prompt.length > 200 && (
              <Button
                variant="link"
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="mt-2 p-0"
              >
                {showFullPrompt ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
          <div>
            <strong>Original Model Output:</strong>
            <div className="mt-2 p-4 bg-muted rounded">
              <Markdown>
                {showFullOriginalOutput
                  ? promptOutput.original_model_output
                  : promptOutput.original_model_output.length > 200
                    ? promptOutput.original_model_output.slice(0, 200) + "..."
                    : promptOutput.original_model_output}
              </Markdown>
            </div>
            {promptOutput.original_model_output.length > 200 && (
              <Button
                variant="link"
                onClick={() =>
                  setShowFullOriginalOutput(!showFullOriginalOutput)
                }
                className="mt-2 p-0"
              >
                {showFullOriginalOutput ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
          <div>
            <strong>Final Model Output:</strong>
            <div className="mt-2 p-4 bg-muted rounded">
              <Markdown>
                {showFullFinalOutput
                  ? promptOutput.final_model_output
                  : promptOutput.final_model_output.length > 200
                    ? promptOutput.final_model_output.slice(0, 200) + "..."
                    : promptOutput.final_model_output}
              </Markdown>
            </div>
            {promptOutput.final_model_output.length > 200 && (
              <Button
                variant="link"
                onClick={() => setShowFullFinalOutput(!showFullFinalOutput)}
                className="mt-2 p-0"
              >
                {showFullFinalOutput ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {promptOutput.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Total Scanners:</strong>{" "}
              {promptOutput.summary.total_scanners}
            </div>
            <div>
              <strong>Failed Scanners:</strong>{" "}
              {promptOutput.summary.failed_scanners}
            </div>
            <div>
              <strong>Invalid Results:</strong>{" "}
              {promptOutput.summary.invalid_results}
            </div>
            <div>
              <strong>Total Entities Detected:</strong>{" "}
              {promptOutput.summary.total_entities_detected}
            </div>
          </CardContent>
        </Card>
      )}

      {promptOutput.scanner_results &&
        promptOutput.scanner_results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Scanner Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {promptOutput.scanner_results.map((result, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <strong>{result.scanner_info.name}</strong>
                    <Badge
                      variant={result.is_valid ? "default" : "destructive"}
                    >
                      {result.is_valid ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  <div>
                    <strong>Type:</strong> {result.scanner_type}
                  </div>
                  <div>
                    <strong>Risk Score:</strong> {result.risk_score}
                  </div>
                  <div>
                    <strong>Description:</strong>{" "}
                    {result.scanner_info.description}
                  </div>
                  {result.error && (
                    <div>
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  {result.detected_entities &&
                    result.detected_entities.length > 0 && (
                      <div className="mt-4">
                        <strong>Detected Entities:</strong>
                        <ul className="list-disc list-inside mt-2">
                          {result.detected_entities.map((entity, idx) => (
                            <li key={idx}>
                              {entity.entity || entity.url} - Score:{" "}
                              {entity.score} - Type: {entity.type}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  <Separator className="my-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      {promptOutput.all_detected_entities &&
        promptOutput.all_detected_entities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Detected Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                {promptOutput.all_detected_entities.map((entity, index) => (
                  <li key={index}>
                    {entity.entity || entity.url} - Score: {entity.score} -
                    Type: {entity.type}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default PromptDetailsPage;
