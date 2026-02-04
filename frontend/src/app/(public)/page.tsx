import React from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Anti-Prompt Injection
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Test and analyze AI prompt injection vulnerabilities. Secure your AI
            applications from malicious prompts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="w-full sm:w-auto">
                Try Chat Interface
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
