import { NutritionReport, ReportStatus } from "@/lib/api/reports";
import { getMockProfile } from "./profile";
import { getMockWeeklyPlan } from "./planner";
import { getMockProgressMetrics } from "./tracking";
import { buildReportPdf } from "@/lib/pdf/reportPdf";

const reportPdfs = new Map<string, Uint8Array>();

let mockReportsStore: NutritionReport[] = [
  {
    id: "rep-001",
    title: "Weekly Performance Report (Aug 25 - Aug 31)",
    type: "weekly",
    startDate: "2026-08-25",
    endDate: "2026-08-31",
    createdAt: "2026-09-01T09:00:00Z",
    userName: "Alex Morgan",
    userEmail: "demo@nutripilot.app",
    status: "ready",
    metrics: {
      totalCaloriesConsumed: 11445,
      averageDailyCalories: 1635,
      targetCalories: 1635,
      adherenceScore: 95,
      proteinPctAvg: 26,
      carbsPctAvg: 48,
      fatPctAvg: 26,
      startingWeightKg: 65.8,
      endingWeightKg: 65.1,
      weightChangeKg: -0.7,
      totalGrocerySpent: 115,
      mealsLoggedCount: 27,
    },
    aiExecutiveSummary:
      "Excellent compliance over the 7-day period. Calorie deficit was maintained within target tolerances with steady progress towards your 62.0 kg target.",
    topRecipes: [
      "Grilled Lemon Herb Chicken & Quinoa",
      "Avocado & Egg Sourdough Toast",
      "Mediterranean Chickpea & Feta Salad",
    ],
    recommendations: [
      "Maintain hydration target of 2,000 ml daily.",
      "Consider increasing pre-workout protein by 5g.",
      "Pantry inventory saved $24 on weekly grocery purchases.",
    ],
  },
];

function reportLines(report: NutritionReport): string[] {
  return [
    `NutriPilot ${report.type} nutrition report`,
    `Prepared for: ${report.userName} <${report.userEmail}>`,
    `Period: ${report.startDate} to ${report.endDate}`,
    `Status: ${report.status}`,
    "",
    `Target calories: ${report.metrics.targetCalories} kcal/day`,
    `Average intake: ${report.metrics.averageDailyCalories} kcal/day`,
    `Adherence: ${report.metrics.adherenceScore}%`,
    `Macros P/C/F: ${report.metrics.proteinPctAvg}% / ${report.metrics.carbsPctAvg}% / ${report.metrics.fatPctAvg}%`,
    `Weight: ${report.metrics.startingWeightKg}kg -> ${report.metrics.endingWeightKg}kg (${report.metrics.weightChangeKg}kg)`,
    `Grocery spend: $${report.metrics.totalGrocerySpent}`,
    `Meals logged: ${report.metrics.mealsLoggedCount}`,
    "",
    "Executive summary:",
    report.aiExecutiveSummary,
    "",
    "Top recipes:",
    ...report.topRecipes.map((title) => `- ${title}`),
    "",
    "Recommendations:",
    ...report.recommendations.map((item) => `- ${item}`),
    "",
    "Estimates only. NutriPilot does not diagnose, treat, or prescribe.",
  ];
}

function ensurePdf(report: NutritionReport): Uint8Array {
  const existing = reportPdfs.get(report.id);
  if (existing) return existing;
  const pdf = buildReportPdf(report.title, reportLines(report));
  reportPdfs.set(report.id, pdf);
  return pdf;
}

ensurePdf(mockReportsStore[0]);

export const getMockReports = (): NutritionReport[] => mockReportsStore;

export const getMockReportById = (id: string): NutritionReport | undefined =>
  mockReportsStore.find((report) => report.id === id);

export const getMockReportPdf = (id: string): Uint8Array | undefined => {
  const report = getMockReportById(id);
  if (!report) return undefined;
  return ensurePdf(report);
};

export const generateMockReport = (type: "weekly" | "monthly"): NutritionReport => {
  const profile = getMockProfile();
  const plan = getMockWeeklyPlan();
  const progress = getMockProgressMetrics(type === "weekly" ? "7d" : "30d");
  const targetCalories = profile.calculatedNutrition.targetCalories;
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - (type === "weekly" ? 7 : 30));

  const recipeCounts = new Map<string, number>();
  plan.days.forEach((day) => {
    day.meals.forEach((meal) => {
      recipeCounts.set(meal.recipe.title, (recipeCounts.get(meal.recipe.title) || 0) + 1);
    });
  });
  const topRecipes = [...recipeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([title]) => title);

  const newReport: NutritionReport = {
    id: `rep-${Date.now()}`,
    title:
      type === "weekly"
        ? `Weekly Report (${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - Today)`
        : `30-Day Monthly Digest (${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - Today)`,
    type,
    startDate: startDate.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    userName: profile.name || "Alex Morgan",
    userEmail: profile.email || "demo@nutripilot.app",
    status: "ready",
    metrics: {
      totalCaloriesConsumed: progress.averageCalories * (type === "weekly" ? 7 : 30),
      averageDailyCalories: progress.averageCalories,
      targetCalories,
      adherenceScore: progress.adherencePercentage,
      proteinPctAvg: profile.calculatedNutrition.macros.proteinPct,
      carbsPctAvg: profile.calculatedNutrition.macros.carbsPct,
      fatPctAvg: profile.calculatedNutrition.macros.fatPct,
      startingWeightKg: progress.dataPoints[0]?.weightKg || 66.5,
      endingWeightKg: progress.currentWeightKg,
      weightChangeKg: progress.weightChangeKg,
      totalGrocerySpent: profile.weeklyBudget || 120,
      mealsLoggedCount: type === "weekly" ? 28 : 115,
    },
    aiExecutiveSummary: `You averaged ${progress.averageCalories} kcal/day against a ${targetCalories} kcal target (${progress.adherencePercentage}% adherence) for your ${profile.goal} goal. This is an estimate, not medical advice.`,
    topRecipes: topRecipes.length ? topRecipes : ["Personalized meal mix from this week's plan"],
    recommendations: [
      "Continue logging meals as eaten so planned vs actual calories stay accurate.",
      "Keep locking favorite meals before regenerating the week.",
      "Rebuild the grocery list after pantry updates to avoid duplicate purchases.",
    ],
  };

  ensurePdf(newReport);
  mockReportsStore.unshift(newReport);
  return newReport;
};

export const updateMockReport = (id: string, updates: Partial<NutritionReport>): NutritionReport => {
  const index = mockReportsStore.findIndex((report) => report.id === id);
  if (index === -1) throw new Error("Report not found");
  mockReportsStore[index] = { ...mockReportsStore[index], ...updates };
  return mockReportsStore[index];
};

export const setReportStatus = (id: string, status: ReportStatus, extra: Partial<NutritionReport> = {}): NutritionReport =>
  updateMockReport(id, { status, ...extra });
