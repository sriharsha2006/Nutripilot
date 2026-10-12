import { NextResponse } from "next/server";
import { getMockProfile, updateMockProfile } from "@/lib/mock/profile";
import type { UserProfile } from "@/lib/api/onboarding";

export async function GET() {
  try {
    const profile = getMockProfile();
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updates: Partial<UserProfile> = await request.json();
    const updatedProfile = updateMockProfile(updates);
    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
