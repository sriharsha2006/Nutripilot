import { NextResponse } from "next/server";
import { saveMockProfile } from "@/lib/mock/profile";
import type { OnboardingData } from "@/lib/api/onboarding";

export async function POST(request: Request) {
  try {
    const data: OnboardingData = await request.json();
    const updatedProfile = saveMockProfile(data);

    // Set onboarding completed cookie
    const response = NextResponse.json({ success: true, profile: updatedProfile });
    response.cookies.set("onboarding_completed", "true", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit onboarding" }, { status: 500 });
  }
}
