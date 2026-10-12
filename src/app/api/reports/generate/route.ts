import { NextResponse } from "next/server";
import { getMockReports, generateMockReport } from "@/lib/mock/reports";

export async function GET() {
  try {
    const reports = getMockReports();
    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({ type: "weekly" }));
    const { type = "weekly" } = body;
    const report = generateMockReport(type);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 });
  }
}
