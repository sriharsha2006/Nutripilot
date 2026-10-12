import { NextResponse } from "next/server";
import { getMockProgressMetrics } from "@/lib/mock/tracking";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get("timeframe") as any) || "14d";
    const metrics = getMockProgressMetrics(timeframe);
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch progress metrics" }, { status: 500 });
  }
}
