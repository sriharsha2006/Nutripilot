import { client } from "./client";

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: "produce" | "protein" | "dairy" | "pantry" | "bakery" | "spices" | "other";
  inPantry?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  calories: number; // per serving
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  dietaryTags: string[];
  allergens: string[];
  ingredients: Ingredient[];
  instructions: string[];
  explanation?: string; // AI justification for why this meal fits user profile
}

export interface MealSlot {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  recipe: Recipe;
  servings: number;
  isLocked: boolean;
  eaten?: boolean;
}

export interface DailyPlan {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  dateStr?: string;
  meals: MealSlot[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  days: DailyPlan[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  createdAt: string;
}

export interface SwapOption {
  recipe: Recipe;
  calorieDifference: number;
  macroMatchScore: number; // 0 - 100%
}

export const plannerApi = {
  getWeeklyPlan: async (): Promise<WeeklyPlan> => {
    return client.get<WeeklyPlan>("/api/meal-plans/generate");
  },

  generateWeeklyPlan: async (forceRegenerateAll = false): Promise<WeeklyPlan> => {
    return client.post<WeeklyPlan>("/api/meal-plans/generate", { forceRegenerateAll });
  },

  refreshMeal: async (mealId: string): Promise<MealSlot> => {
    return client.post<MealSlot>(`/api/meals/${mealId}/refresh`);
  },

  toggleMealLock: async (mealId: string): Promise<{ mealId: string; isLocked: boolean }> => {
    return client.post<{ mealId: string; isLocked: boolean }>(`/api/meals/${mealId}/lock`);
  },

  getSwapOptions: async (mealId: string): Promise<SwapOption[]> => {
    return client.get<SwapOption[]>(`/api/meals/${mealId}/swap`);
  },

  swapMeal: async (mealId: string, recipeId: string): Promise<MealSlot> => {
    return client.post<MealSlot>(`/api/meals/${mealId}/swap`, { recipeId });
  },

  updateServingSize: async (mealId: string, servings: number): Promise<MealSlot> => {
    return client.put<MealSlot>(`/api/meal-items/${mealId}`, { servings });
  },

  toggleMealEaten: async (mealId: string, eaten: boolean): Promise<MealSlot> => {
    return client.put<MealSlot>(`/api/meal-items/${mealId}`, { eaten });
  },
};
