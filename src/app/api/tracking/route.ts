import { NextResponse } from "next/server";
import { getMockDailyTracking, logMockWater, logMockWeight } from "@/lib/mock/tracking";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || undefined;
    const tracking = getMockDailyTracking(date);
    return NextResponse.json(tracking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch daily tracking" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "water") {
      const { amountMl } = body;
      const updated = logMockWater(amountMl || 250);
      return NextResponse.json(updated);
    } else if (type === "weight") {
      const { weightKg, notes } = body;
      if (!weightKg) return NextResponse.json({ error: "Missing weightKg" }, { status: 400 });
      const updated = logMockWeight(weightKg, notes);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid log type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log tracking entry" }, { status: 500 });
  }
}
