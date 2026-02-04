"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface PromptOutput {
  id: string;
  prompt: string;
  overall_valid: boolean;
  max_risk_score: number;
  scanners_run: number;
  total_entities_detected: number;
  timestamp: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  success: boolean;
  data: PromptOutput[];
  pagination: Pagination;
}

async function getPromptOutputs(): Promise<ApiResponse> {
  const response = await fetch("/api/prompt-outputs");
  if (!response.ok) {
    throw new Error("Failed to fetch prompt outputs");
  }
  return response.json();
}

export default function PromptOutputPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["promptOutputs"],
    queryFn: getPromptOutputs,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-destructive">
        Failed to load prompt outputs.
      </div>
    );
  }

  const promptOutputs = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Prompt Outputs
        </h1>
        <p className="text-sm text-muted-foreground">
          AI prompt scan results and risk analysis
        </p>
      </div>

      {/* Pagination Summary */}
      {pagination && (
        <Card>
          <CardContent className="flex flex-wrap gap-6 py-4 text-sm">
            <div>
              <span className="text-muted-foreground">Page</span>{" "}
              <strong>
                {pagination.page} / {pagination.totalPages}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Total</span>{" "}
              <strong>{pagination.totalCount}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Next</span>{" "}
              <strong>{pagination.hasNext ? "Yes" : "No"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Prev</span>{" "}
              <strong>{pagination.hasPrev ? "Yes" : "No"}</strong>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {promptOutputs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No prompt outputs found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {promptOutputs.map((output) => (
            <Link href={`/prompt-output/${output.id}`} key={output.id}>
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Prompt ID
                    </CardTitle>
                    <Badge
                      variant={output.overall_valid ? "default" : "destructive"}
                    >
                      {output.overall_valid ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                  <CardDescription className="truncate">
                    {output.id}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Prompt</p>
                    <p className="line-clamp-4">{output.prompt}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground">Risk Score</p>
                      <p
                        className={
                          output.max_risk_score > 0.7
                            ? "text-destructive font-semibold"
                            : "font-medium"
                        }
                      >
                        {output.max_risk_score}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Scanners</p>
                      <p className="font-medium">{output.scanners_run}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Entities</p>
                      <p className="font-medium">
                        {output.total_entities_detected}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(output.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
