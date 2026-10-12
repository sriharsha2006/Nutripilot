import { NextResponse } from "next/server";
import { getMockProfile } from "@/lib/mock/profile";

let mockSettingsStore = {
  email: "demo@nutripilot.app",
  name: "Alex Morgan",
  unitSystem: "metric" as const,
  currencySymbol: "$",
  theme: "system" as const,
  notifications: {
    mealReminders: true,
    pantryExpiryAlerts: true,
    weeklyReportDigest: true,
    marketingEmails: false,
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("export") === "true") {
      const profile = getMockProfile();
      return NextResponse.json({
        exportDate: new Date().toISOString(),
        profile,
        settings: mockSettingsStore,
      });
    }
    return NextResponse.json(mockSettingsStore);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    mockSettingsStore = { ...mockSettingsStore, ...updates };
    return NextResponse.json(mockSettingsStore);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "change_password") {
      return NextResponse.json({
        success: true,
        message: "Password updated successfully",
      });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process security request" }, { status: 500 });
  }
}
