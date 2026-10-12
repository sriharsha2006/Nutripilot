import { client } from "./client";

export interface NutritionParams {
  age: number;
  gender: "male" | "female" | "other";
  weightKg: number;
  heightCm: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
  targetPace?: number; // kg per week (e.g. 0.25, 0.5, 0.75)
}

export interface MacroTarget {
  carbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
  carbsPct: number;
  proteinPct: number;
  fatPct: number;
}

export interface CalculatedNutrition {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: MacroTarget;
}

export interface OnboardingData extends NutritionParams {
  dietaryPreferences: string[];
  allergies: string[];
  dislikedIngredients: string[];
  weeklyBudget: number; // in USD
  householdSize: number;
  cookingSkill: "beginner" | "intermediate" | "advanced";
  maxPrepTimeMinutes: number;
  mealsPerDay?: 3 | 4;
  targetWeightKg?: number;
  customMacros?: MacroTarget;
}

export interface UserProfile extends OnboardingData {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  calculatedNutrition: CalculatedNutrition;
  updatedAt: string;
}

export const onboardingApi = {
  calculateNutrition: async (params: NutritionParams): Promise<CalculatedNutrition> => {
    return client.post<CalculatedNutrition>("/api/nutrition/calculate", params);
  },

  submitOnboarding: async (data: OnboardingData): Promise<{ success: boolean; profile: UserProfile }> => {
    return client.post<{ success: boolean; profile: UserProfile }>("/api/onboarding", data);
  },

  getProfile: async (): Promise<UserProfile> => {
    return client.get<UserProfile>("/api/profile");
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return client.put<UserProfile>("/api/profile", data);
  },
};
