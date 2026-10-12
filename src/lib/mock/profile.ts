import { UserProfile, OnboardingData } from "@/lib/api/onboarding";
import { calculateNutritionTargets } from "@/lib/nutrition/config";

// In-memory persistent mock profile state
let mockProfileStore: UserProfile = {
  id: "user-123",
  email: "demo@nutripilot.app",
  name: "Alex Morgan",
  age: 28,
  gender: "female",
  weightKg: 65,
  heightCm: 168,
  activityLevel: "moderate",
  goal: "lose",
  targetPace: 0.5,
  targetWeightKg: 60,
  dietaryPreferences: ["High-Protein", "Gluten-Free"],
  allergies: ["Peanuts"],
  dislikedIngredients: ["Coriander", "Anchovies"],
  weeklyBudget: 120,
  householdSize: 2,
  cookingSkill: "intermediate",
  maxPrepTimeMinutes: 35,
  mealsPerDay: 4,
  calculatedNutrition: {
    bmr: 1410,
    tdee: 2185,
    targetCalories: 1635,
    macros: {
      carbsGrams: 204,
      proteinGrams: 102,
      fatGrams: 45,
      carbsPct: 50,
      proteinPct: 25,
      fatPct: 25,
    },
  },
  updatedAt: new Date().toISOString(),
};

export const getMockProfile = (): UserProfile => {
  return mockProfileStore;
};

// Called by login/register to sync the real user's name & email into the profile store
export const seedMockProfileUser = (name: string, email: string) => {
  mockProfileStore = {
    ...mockProfileStore,
    name,
    email,
    updatedAt: new Date().toISOString(),
  };
};

export const saveMockProfile = (data: OnboardingData): UserProfile => {
  const calculated = calculateNutritionTargets(data);
  const macros = data.customMacros || calculated.macros;

  mockProfileStore = {
    ...data,
    mealsPerDay: data.mealsPerDay || 4,
    id: mockProfileStore.id,
    email: mockProfileStore.email,
    name: mockProfileStore.name,
    calculatedNutrition: {
      ...calculated,
      macros,
    },
    updatedAt: new Date().toISOString(),
  };

  return mockProfileStore;
};

export const updateMockProfile = (updates: Partial<UserProfile>): UserProfile => {
  mockProfileStore = {
    ...mockProfileStore,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockProfileStore;
};

export const resetMockProfile = () => {
  mockProfileStore = {
    ...mockProfileStore,
    email: "demo@nutripilot.app",
    name: "Alex Morgan",
    updatedAt: new Date().toISOString(),
  };
};
