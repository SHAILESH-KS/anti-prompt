import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { NextResponse } from "next/server";
import connectToDatabase from "@/src/lib/db";
import { Chat, Message, PromptTest, IAttachment } from "@/src/models";
import PromptOutput from "@/src/models/PromptOutput.model";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FileData {
  name: string;
  type: string;
  data: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, data, chatId } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is not set" },
        { status: 500 },
      );
    }

    await connectToDatabase();

    // Verify chat ownership if chatId provided
    if (chatId) {
      const chat = await Chat.findOne({ _id: chatId, userId: session.user.id });
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Separate history from the latest message
    const lastMessage = messages[messages.length - 1] as ChatMessage;
    const history = messages.slice(0, -1).map((m: ChatMessage) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Save User Message to DB
    let userMessage;
    if (chatId) {
      userMessage = await Message.create({
        chatId,
        role: "user",
        content: lastMessage.content,
        attachments: [], // Will be updated after processing attachments
      });

      await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });
    }

    // Call the scan-all API before sending to Gemini
    let scanResult;
    try {
      const scanResponse = await fetch("http://localhost:8000/scan-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: lastMessage.content,
        }),
      });

      if (scanResponse.ok) {
        scanResult = await scanResponse.json();
        console.log("Scan result:", scanResult);

        // Always save PromptTest result linked to the message
        if (userMessage) {
          await PromptTest.create({
            ...scanResult,
            linkedMessage: userMessage._id,
          });
        }

        // If overall_valid is false, block the prompt and return scan result
        if (!scanResult.overall_valid) {
          return NextResponse.json(
            {
              error: "Prompt blocked due to security scan",
              scanResult,
              blocked: true,
            },
            { status: 400 },
          );
        }
      } else {
        console.error(
          "Scan API failed:",
          scanResponse.status,
          scanResponse.statusText,
        );
        // If scan fails, still allow the request to proceed (or block? For now, proceed)
      }
    } catch (error) {
      console.error("Error calling scan API:", error);
      // If scan fails, still allow the request to proceed (or block? For now, proceed)
    }

    const chatSession = model.startChat({
      history: history,
    });

    const parts: Part[] = [{ text: lastMessage.content }];
    const attachmentsToSave: IAttachment[] = [];

    if (data && Array.isArray(data)) {
      data.forEach((file: FileData) => {
        // file.data is expected to be base64 data url
        const match = file.data.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64 = match[2];
          parts.push({
            inlineData: {
              mimeType,
              data: base64,
            },
          });
          attachmentsToSave.push({
            name: file.name,
            type: file.type,
            data: file.data, // Save full base64 data URI to DB
          });
        }
      });
    }

    // Update user message with attachments if any
    if (chatId && userMessage && attachmentsToSave.length > 0) {
      await Message.findByIdAndUpdate(userMessage._id, {
        attachments: attachmentsToSave,
      });
    }

    const result = await chatSession.sendMessage(parts);
    const response = await result.response;
    const text = response.text();

    // Scan the model output after getting Gemini response
    let outputScanResult;
    try {
      const outputScanResponse = await fetch(
        "http://localhost:8000/scan-all-output",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: lastMessage.content,
            model_output: text,
          }),
        },
      );

      if (outputScanResponse.ok) {
        outputScanResult = await outputScanResponse.json();
        console.log("Output scan result:", outputScanResult);

        // Store output scan results in database
        try {
          const promptOutputData = {
            original_prompt: outputScanResult.original_prompt,
            original_model_output: outputScanResult.original_model_output,
            final_model_output: outputScanResult.final_model_output,
            overall_valid: outputScanResult.overall_valid,
            max_risk_score: outputScanResult.max_risk_score,
            scanners_run: outputScanResult.scanners_run,
            scanner_results: outputScanResult.scanner_results,
            all_detected_entities: outputScanResult.all_detected_entities,
            summary: outputScanResult.summary,
            timestamp: new Date(outputScanResult.timestamp),
          };

          const savedPromptOutput = await PromptOutput.create(promptOutputData);
          console.log(
            "Output scan results saved to database:",
            savedPromptOutput._id,
          );

          // Link the output scan to the assistant message if we have chatId
          if (chatId) {
            // We'll update this after creating the assistant message
          }
        } catch (dbError) {
          console.error(
            "Error saving output scan results to database:",
            dbError,
          );
        }

        // If output scan detects issues, you might want to handle this differently
        // For now, we'll still return the response but log the issues
        if (!outputScanResult.overall_valid) {
          console.warn(
            "Output scan detected issues:",
            outputScanResult.summary,
          );
        }
      } else {
        console.error(
          "Output scan API failed:",
          outputScanResponse.status,
          outputScanResponse.statusText,
        );
      }
    } catch (error) {
      console.error("Error calling output scan API:", error);
    }

    // Save Assistant Message to DB
    let assistantMessage;
    if (chatId) {
      assistantMessage = await Message.create({
        chatId,
        role: "assistant",
        content: text,
      });
    }

    return NextResponse.json({
      role: "assistant",
      content: text,
      outputScanResult: outputScanResult || null, // Include output scan results in response
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 500;
    const message =
      error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status });
  }
}
