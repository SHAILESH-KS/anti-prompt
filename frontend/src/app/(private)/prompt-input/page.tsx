"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface PromptInput {
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
  data: PromptInput[];
  pagination: Pagination;
}

async function getPromptInputs(): Promise<ApiResponse> {
  const response = await fetch("/api/prompt-inputs");
  if (!response.ok) {
    throw new Error("Failed to fetch prompt inputs");
  }
  const result: ApiResponse = await response.json();
  return result;
}

const PromptInputPage = () => {
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["promptInputs"],
    queryFn: getPromptInputs,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const promptInputs = apiResponse?.data || [];
  const pagination = apiResponse?.pagination;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Prompt Inputs</h1>
      {pagination && (
        <div className="mb-4">
          <p>
            Page: {pagination.page} of {pagination.totalPages}
          </p>
          <p>Total: {pagination.totalCount}</p>
        </div>
      )}
      {promptInputs.length > 0 ? (
        <div className="grid gap-4">
          {promptInputs.map((input) => (
            <div key={input.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <Link
                  href={`/prompt-input/${input.id}`}
                  className="text-lg font-semibold hover:underline"
                >
                  Prompt Input
                </Link>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    input.overall_valid
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {input.overall_valid ? "Valid" : "Invalid"}
                </span>
              </div>
              <p className="text-gray-600 mb-2 line-clamp-2">
                {input.prompt.length > 100
                  ? input.prompt.slice(0, 100) + "..."
                  : input.prompt}
              </p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Risk Score: {input.max_risk_score}</span>
                <span>Scanners: {input.scanners_run}</span>
                <span>Entities: {input.total_entities_detected}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Created: {new Date(input.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No prompt inputs found.</p>
      )}
    </div>
  );
};

export default PromptInputPage;
