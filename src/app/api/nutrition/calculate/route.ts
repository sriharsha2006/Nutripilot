import { NextResponse } from "next/server";
import type { NutritionParams } from "@/lib/api/onboarding";
import { calculateNutritionTargets } from "@/lib/nutrition/config";

export async function POST(request: Request) {
  try {
    const body: NutritionParams = await request.json();
    const { age, gender, weightKg, heightCm, activityLevel, goal, targetPace = 0.5 } = body;

    if (!age || !weightKg || !heightCm) {
      return NextResponse.json({ error: "Missing required biometrics" }, { status: 400 });
    }
    if (age < 14 || age > 100 || weightKg < 30 || weightKg > 250 || heightCm < 120 || heightCm > 230) {
      return NextResponse.json({ error: "Biometrics are outside a safe planning range" }, { status: 400 });
    }

    const result = calculateNutritionTargets({
      age,
      gender,
      weightKg,
      heightCm,
      activityLevel,
      goal,
      targetPace,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate nutrition" }, { status: 500 });
  }
}
