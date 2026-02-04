"use client";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import React from "react";

const PromptOutputLayout = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  return (
    <div>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
};

export default PromptOutputLayout;
