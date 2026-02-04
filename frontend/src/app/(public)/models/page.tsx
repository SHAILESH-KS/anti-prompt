import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export default function ModelsPage() {
  const comparisonData = [
    {
      capability: "Reasoning",
      pro: "Advanced (Academic/PhD)",
      flash: "Strong (Everyday/Logic)",
      gemma: "Moderate (Local tasks)",
    },
    {
      capability: "Context Window",
      pro: "1M - 2M Tokens",
      flash: "1M Tokens",
      gemma: "128K Tokens",
    },
    {
      capability: "Multimodal",
      pro: "Text, Image, Audio, Video",
      flash: "Text, Image, Audio, Video",
      gemma: "Text, Image",
    },
    {
      capability: "Best For",
      pro: "Coding, Data Analysis",
      flash: "Speed, Chatbots, Agents",
      gemma: "Local/Private Apps",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Model Comparison
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose the right model for your needs
          </p>
        </div>

        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-white dark:bg-gray-950 border-b dark:border-gray-800 pb-0 mb-0">
            {/* Header content if needed, but the table title is cleaner */}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <th className="p-4 border-b dark:border-gray-800 font-bold">
                      Capability
                    </th>
                    <th className="p-4 border-b dark:border-gray-800 font-bold text-blue-600 dark:text-blue-400">
                      Pro Tier (3/2.5)
                    </th>
                    <th className="p-4 border-b dark:border-gray-800 font-bold text-amber-600 dark:text-amber-400">
                      Flash Tier (3/2.5)
                    </th>
                    <th className="p-4 border-b dark:border-gray-800 font-bold text-emerald-600 dark:text-emerald-400">
                      Gemma 3
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr
                      key={row.capability}
                      className={`
                        border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors
                        ${index % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50/50 dark:bg-gray-900/50"}
                      `}
                    >
                      <td className="p-4 font-semibold text-gray-900 dark:text-gray-200">
                        {row.capability}
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        {row.pro}
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        {row.flash}
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        {row.gemma}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
