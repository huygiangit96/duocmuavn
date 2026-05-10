import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Chỉ cho phép proxy từ backend server
  if (!url.startsWith(ALLOWED_ORIGIN)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse("File not found", { status: response.status });
    }

    const pdf = await response.arrayBuffer();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch PDF", { status: 500 });
  }
}
