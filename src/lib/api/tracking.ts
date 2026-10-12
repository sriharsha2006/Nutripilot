import { client } from "./client";

export interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
}

export interface WaterLog {
  amountMl: number;
  targetMl: number;
}

export interface DailyTrackingEntry {
  date: string; // YYYY-MM-DD
  water: WaterLog;
  weight?: WeightLog;
  eatenMealIds: string[];
  notes?: string;
}

export interface ProgressDataPoint {
  date: string;
  dateLabel: string;
  calories: number;
  targetCalories: number;
  protein: number;
  targetProtein: number;
  carbs: number;
  targetCarbs: number;
  fat: number;
  targetFat: number;
  weightKg?: number;
  waterMl: number;
}

export interface ProgressMetrics {
  timeframe: "7d" | "14d" | "30d";
  dataPoints: ProgressDataPoint[];
  averageCalories: number;
  adherencePercentage: number;
  weightChangeKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
}

export const trackingApi = {
  getDailyTracking: async (date?: string): Promise<DailyTrackingEntry> => {
    const query = date ? `?date=${date}` : "";
    return client.get<DailyTrackingEntry>(`/api/tracking${query}`);
  },

  logWater: async (amountMl: number): Promise<WaterLog> => {
    return client.post<WaterLog>("/api/tracking", { type: "water", amountMl });
  },

  logWeight: async (weightKg: number, notes?: string): Promise<WeightLog> => {
    return client.post<WeightLog>("/api/tracking", { type: "weight", weightKg, notes });
  },

  getProgressMetrics: async (timeframe: "7d" | "14d" | "30d" = "14d"): Promise<ProgressMetrics> => {
    return client.get<ProgressMetrics>(`/api/progress?timeframe=${timeframe}`);
  },
};
