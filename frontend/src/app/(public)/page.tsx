import React from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full px-4 py-16">
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

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Prompt Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analyze prompts for injection vulnerabilities using advanced AI
                scanners.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Real-time Scanning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Scan prompts in real-time to detect and prevent malicious
                inputs.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Multiple Scanners
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use various scanners including toxicity, secrets, regex, and
                more.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Input Prompt
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enter your prompt or use the chat interface to test.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Scan & Analyze
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI scanners analyze the prompt for vulnerabilities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Get Results
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive detailed reports on detected issues and risks.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Secure Your AI?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Start testing your prompts today.
          </p>
          <Link href="/signin">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
