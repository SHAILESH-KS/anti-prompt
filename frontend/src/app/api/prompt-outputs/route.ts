import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/src/lib/db";
import PromptOutput from "@/src/models/PromptOutput.model";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

// GET /api/prompt-outputs - Fetch all prompt outputs with basic info
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: { [key: string]: 1 | -1 } = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Fetch prompt outputs with pagination
    const promptOutputs = await PromptOutput.find({})
      .select({
        _id: 1,
        original_prompt: 1,
        overall_valid: 1,
        max_risk_score: 1,
        scanners_run: 1,
        summary: 1,
        timestamp: 1,
        createdAt: 1,
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await PromptOutput.countDocuments();

    // Transform the data to include only essential fields
    const transformedOutputs = promptOutputs.map((output) => ({
      id: output._id,
      prompt: output.original_prompt,
      overall_valid: output.overall_valid,
      max_risk_score: output.max_risk_score,
      scanners_run: output.scanners_run,
      total_entities_detected: output.summary?.total_entities_detected || 0,
      timestamp: output.timestamp,
      createdAt: output.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedOutputs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching prompt outputs:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt outputs" },
      { status: 500 },
    );
  }
}
