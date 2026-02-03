import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "This is a public API route 1",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    message: "POST request to public API 1 successful",
    data: body,
  });
}
