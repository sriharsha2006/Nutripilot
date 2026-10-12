import { client } from "./client";

export type ReportStatus = "queued" | "generating" | "ready" | "sent" | "failed";

export interface NutritionReport {
  id: string;
  title: string;
  type: "weekly" | "monthly";
  startDate: string;
  endDate: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  status: ReportStatus;
  emailedTo?: string;
  emailPreviewUrl?: string;
  failureReason?: string;
  metrics: {
    totalCaloriesConsumed: number;
    averageDailyCalories: number;
    targetCalories: number;
    adherenceScore: number;
    proteinPctAvg: number;
    carbsPctAvg: number;
    fatPctAvg: number;
    startingWeightKg: number;
    endingWeightKg: number;
    weightChangeKg: number;
    totalGrocerySpent: number;
    mealsLoggedCount: number;
  };
  aiExecutiveSummary: string;
  topRecipes: string[];
  recommendations: string[];
}

export const reportsApi = {
  getReports: async (): Promise<NutritionReport[]> => {
    return client.get<NutritionReport[]>("/api/reports");
  },

  getReport: async (reportId: string): Promise<NutritionReport> => {
    return client.get<NutritionReport>(`/api/reports/${reportId}`);
  },

  generateReport: async (type: "weekly" | "monthly"): Promise<NutritionReport> => {
    return client.post<NutritionReport>("/api/reports/generate", { type });
  },

  emailReport: async (
    reportId: string,
    email: string
  ): Promise<{ success: boolean; message: string; report: NutritionReport }> => {
    return client.post<{ success: boolean; message: string; report: NutritionReport }>(
      `/api/reports/${reportId}/email`,
      { email }
    );
  },

  downloadUrl: (reportId: string) => `/api/reports/${reportId}/pdf`,
};
