import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/src/lib/db";
import PromptTest from "@/src/models/PromptTest.model";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

// GET /api/prompt-inputs - Fetch all prompt inputs with basic info
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

    // Fetch prompt inputs with pagination
    const promptInputs = await PromptTest.find({})
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
    const totalCount = await PromptTest.countDocuments();

    // Transform the data to include only essential fields
    const transformedInputs = promptInputs.map((input) => ({
      id: input._id,
      prompt: input.original_prompt,
      overall_valid: input.overall_valid,
      max_risk_score: input.max_risk_score,
      scanners_run: input.scanners_run,
      total_entities_detected: input.summary?.total_entities_detected || 0,
      timestamp: input.timestamp,
      createdAt: input.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedInputs,
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
    console.error("Error fetching prompt inputs:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt inputs" },
      { status: 500 },
    );
  }
}
