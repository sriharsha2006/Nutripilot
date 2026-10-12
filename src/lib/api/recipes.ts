import { client } from "./client";
import { Recipe } from "./planner";

export interface FoodBankLocation {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  phone: string;
  hours: string;
  services: string[];
  eligibility: string;
}

export interface SmartRecommendation {
  id: string;
  title: string;
  category: "budget" | "leftovers" | "nutrition" | "food_bank";
  description: string;
  actionText: string;
  actionLink?: string;
  impact: string;
}

export const recipesApi = {
  getRecipes: async (): Promise<Recipe[]> => {
    return client.get<Recipe[]>("/api/recipes");
  },

  createCustomRecipe: async (recipeData: Omit<Recipe, "id">): Promise<Recipe> => {
    return client.post<Recipe>("/api/recipes", recipeData);
  },

  getRecommendations: async (): Promise<{ recommendations: SmartRecommendation[]; foodBanks: FoodBankLocation[] }> => {
    return client.get<{ recommendations: SmartRecommendation[]; foodBanks: FoodBankLocation[] }>("/api/recommendations");
  },
};
