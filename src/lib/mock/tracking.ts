import { DailyTrackingEntry, WeightLog, WaterLog, ProgressMetrics, ProgressDataPoint } from "@/lib/api/tracking";
import { getMockProfile } from "./profile";

let currentWaterLog: WaterLog = {
  amountMl: 1250,
  targetMl: 2000,
};

let mockWeightLogs: WeightLog[] = [
  { id: "w-1", date: "2026-08-25", weightKg: 66.2 },
  { id: "w-2", date: "2026-08-28", weightKg: 65.8 },
  { id: "w-3", date: "2026-09-01", weightKg: 65.4 },
  { id: "w-4", date: "2026-09-04", weightKg: 65.1 },
  { id: "w-5", date: "2026-09-08", weightKg: 64.8 },
];

export const getMockDailyTracking = (dateStr?: string): DailyTrackingEntry => {
  const today = dateStr || new Date().toISOString().split("T")[0];
  const latestWeight = mockWeightLogs[mockWeightLogs.length - 1];

  return {
    date: today,
    water: currentWaterLog,
    weight: latestWeight,
    eatenMealIds: ["meal-monday-1", "meal-monday-2"],
  };
};

export const logMockWater = (deltaMl: number): WaterLog => {
  currentWaterLog.amountMl = Math.max(0, currentWaterLog.amountMl + deltaMl);
  return currentWaterLog;
};

export const logMockWeight = (weightKg: number, notes?: string): WeightLog => {
  const newLog: WeightLog = {
    id: `w-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    weightKg,
    notes,
  };
  mockWeightLogs.push(newLog);
  return newLog;
};

export const getMockProgressMetrics = (timeframe: "7d" | "14d" | "30d" = "14d"): ProgressMetrics => {
  const profile = getMockProfile();
  const targetCalories = profile.calculatedNutrition.targetCalories;
  const targetProtein = profile.calculatedNutrition.macros.proteinGrams;
  const targetCarbs = profile.calculatedNutrition.macros.carbsGrams;
  const targetFat = profile.calculatedNutrition.macros.fatGrams;

  const daysCount = timeframe === "7d" ? 7 : timeframe === "14d" ? 14 : 30;
  const dataPoints: ProgressDataPoint[] = [];

  const now = new Date();
  let totalCaloriesSum = 0;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Slight realistic fluctuation (+/- 80 kcal)
    const variance = (Math.sin(i * 1.5) * 75) + ((i % 3 === 0 ? 1 : -1) * 30);
    const actualCal = Math.round(targetCalories + variance);
    totalCaloriesSum += actualCal;

    // Weight steady gradual decrease
    const weightVariance = 66.5 - (daysCount - i) * 0.08 + Math.cos(i) * 0.2;

    dataPoints.push({
      date: dateStr,
      dateLabel,
      calories: actualCal,
      targetCalories,
      protein: Math.round(targetProtein + (variance * 0.1)),
      targetProtein,
      carbs: Math.round(targetCarbs + (variance * 0.15)),
      targetCarbs,
      fat: Math.round(targetFat + (variance * 0.05)),
      targetFat,
      weightKg: Math.round(weightVariance * 10) / 10,
      waterMl: 1750 + Math.round(Math.sin(i) * 350),
    });
  }

  const averageCalories = Math.round(totalCaloriesSum / daysCount);
  const startWeight = dataPoints[0].weightKg || 66.5;
  const endWeight = dataPoints[dataPoints.length - 1].weightKg || 64.8;
  const weightChangeKg = Math.round((endWeight - startWeight) * 10) / 10;

  return {
    timeframe,
    dataPoints,
    averageCalories,
    adherencePercentage: 94,
    weightChangeKg,
    currentWeightKg: endWeight,
    targetWeightKg: profile.targetWeightKg || 62,
  };
};
