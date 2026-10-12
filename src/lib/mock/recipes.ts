import { Recipe } from "@/lib/api/planner";
import { FoodBankLocation, SmartRecommendation } from "@/lib/api/recipes";
import { MOCK_RECIPE_CATALOG } from "./planner";

let customRecipesStore: Recipe[] = [...MOCK_RECIPE_CATALOG];

let mockFoodBanksStore: FoodBankLocation[] = [
  {
    id: "fb-1",
    name: "Metropolitan Community Food Bank",
    address: "742 Evergreen Terrace, Central District",
    distanceKm: 1.8,
    phone: "(555) 234-5678",
    hours: "Mon - Fri: 9:00 AM - 4:00 PM, Sat: 10:00 AM - 1:00 PM",
    services: ["Fresh Produce Boxes", "Pantry Staples", "Hot Meal Service"],
    eligibility: "Open to all residents in need. No ID required.",
  },
  {
    id: "fb-2",
    name: "Hope Haven Emergency Food Pantry",
    address: "1098 Commerce Way, Eastside",
    distanceKm: 3.4,
    phone: "(555) 876-5432",
    hours: "Tue & Thu: 10:00 AM - 6:00 PM",
    services: ["Emergency Food Packs", "Infant Formula & Diapers", "Dietary Specific Boxes"],
    eligibility: "Self-declaration of income constraint.",
  },
  {
    id: "fb-3",
    name: "St. Jude Neighborhood Nutrition Network",
    address: "450 Church Street, South District",
    distanceKm: 4.2,
    phone: "(555) 345-6789",
    hours: "Wed & Sat: 8:30 AM - 12:30 PM",
    services: ["Community Garden Surplus", "Protein Supplements", "Nutrition Counseling"],
    eligibility: "Walk-in welcome.",
  },
];

let mockRecommendationsStore: SmartRecommendation[] = [
  {
    id: "rec-101",
    title: "Incorporate Expiring Sourdough Bread",
    category: "leftovers",
    description: "Your Sourdough Bread in the pantry expires in 2 days. Swap tomorrow's breakfast to Avocado & Egg Sourdough Toast to prevent food waste.",
    actionText: "Swap Meal in Planner",
    actionLink: "/planner",
    impact: "Saves ~$4.50 in food waste",
  },
  {
    id: "rec-102",
    title: "Batch Cook Quinoa & Chicken",
    category: "budget",
    description: "Cooking 3x servings of Lemon Herb Chicken simultaneously reduces prep time by 40 minutes and leverages bulk ingredient pricing.",
    actionText: "View Prep Guide",
    impact: "Saves 40 mins prep time",
  },
  {
    id: "rec-103",
    title: "Community Food Assistance Available",
    category: "food_bank",
    description: "Metropolitan Community Food Bank (1.8 km away) provides free fresh produce boxes every Saturday morning with no appointment needed.",
    actionText: "View Food Banks",
    actionLink: "/recommendations#foodbanks",
    impact: "Free fresh groceries",
  },
];

export const getMockRecipesCatalog = (): Recipe[] => {
  return customRecipesStore;
};

export const addMockCustomRecipe = (data: Omit<Recipe, "id">): Recipe => {
  const newRecipe: Recipe = {
    ...data,
    id: `custom-rec-${Date.now()}`,
  };
  customRecipesStore.unshift(newRecipe);
  return newRecipe;
};

export const getMockRecommendationsData = () => {
  return {
    recommendations: mockRecommendationsStore,
    foodBanks: mockFoodBanksStore,
  };
};
