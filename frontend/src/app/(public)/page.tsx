"use client";

import React from "react";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ShieldCheck,
  ScanSearch,
  Lock,
  Terminal,
  FileSearch,
} from "lucide-react";

const HomePage = () => {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Secure Your AI Prompts
            </h1>

            <p className="text-lg text-muted-foreground">
              PromptGuard helps developers and teams detect prompt injection,
              policy violations, and unsafe inputs before they reach production
              AI systems.
            </p>

            <p className="text-muted-foreground">
              Built for security-conscious AI applications that require
              visibility, auditability, and control over user-supplied prompts.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row pt-4">
              <Link href="/chat">
                <Button size="lg">Try Live Scanner</Button>
              </Link>

              {!isPending && !session && (
                <Link href="/signin">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              )}

              {!isPending && session && (
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-10 text-2xl font-semibold">What PromptGuard Does</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <InfoCard
            icon={<ScanSearch />}
            title="Analyze Prompts"
            description="Every prompt is analyzed using multiple scanners to detect manipulation, unsafe intent, and policy violations."
          />
          <InfoCard
            icon={<ShieldCheck />}
            title="Prevent Attacks"
            description="Block prompt injection attempts, jailbreaks, and malicious instructions before execution."
          />
          <InfoCard
            icon={<FileSearch />}
            title="Explain Results"
            description="Get structured scan results with risk scores, entities, and scanner-level explanations."
          />
        </div>
      </section>

      {/* SCANNERS */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="mb-10 text-2xl font-semibold">
            Built-in Security Scanners
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ScannerItem title="Prompt Injection Detection" />
            <ScannerItem title="Secrets & Credential Leakage" />
            <ScannerItem title="Toxicity & Abuse Detection" />
            <ScannerItem title="Code Execution Risk" />
            <ScannerItem title="Language & Policy Enforcement" />
            <ScannerItem title="Regex & Pattern Matching" />
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-10 text-2xl font-semibold">Who It’s For</h2>

        <div className="grid gap-8 md:grid-cols-3">
          <Audience
            title="AI Developers"
            description="Secure prompt pipelines and reduce the risk of unexpected model behavior."
          />
          <Audience
            title="Security Teams"
            description="Gain visibility into prompt abuse, leakage, and injection attempts."
          />
          <Audience
            title="Product Teams"
            description="Ship AI features confidently with guardrails in place."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                Start Securing Your Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Whether you are testing locally or running AI in production,
                PromptGuard helps you understand and control prompt risk.
              </p>

              <div className="flex gap-4">
                <Link href="/chat">
                  <Button size="lg">Run a Test Prompt</Button>
                </Link>

                {!isPending && !session && (
                  <Link href="/signin">
                    <Button size="lg" variant="outline">
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

/* ---------- Components ---------- */

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}

function ScannerItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Terminal className="h-4 w-4 text-muted-foreground" />
      <span>{title}</span>
    </div>
  );
}

function Audience({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
