import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY is not set" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
