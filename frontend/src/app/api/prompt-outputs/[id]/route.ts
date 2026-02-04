import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/src/lib/db";
import PromptOutput from "@/src/models/PromptOutput.model";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

// GET /api/prompt-outputs/[id] - Fetch a specific prompt output by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt output ID" },
        { status: 400 },
      );
    }

    // Fetch the specific prompt output
    const promptOutput = await PromptOutput.findById(id).lean();

    if (!promptOutput) {
      return NextResponse.json(
        { error: "Prompt output not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: promptOutput,
    });
  } catch (error) {
    console.error("Error fetching prompt output:", error);

    // Handle invalid ObjectId format
    if (
      error instanceof Error &&
      error.message.includes("Cast to ObjectId failed")
    ) {
      return NextResponse.json(
        { error: "Invalid prompt output ID format" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch prompt output" },
      { status: 500 },
    );
  }
}
