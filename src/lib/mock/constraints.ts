import { Recipe } from "@/lib/api/planner";
import { UserProfile } from "@/lib/api/onboarding";
import { historicalPreferenceScore } from "./interactions";

const HARD_DIETS = ["vegan", "vegetarian", "gluten-free", "dairy-free", "halal", "kosher", "keto"] as const;

export function recipeViolatesAllergy(recipe: Recipe, allergies: string[]): boolean {
  const blocked = allergies.map((a) => a.toLowerCase().trim()).filter(Boolean);
  if (!blocked.length) return false;
  const haystack = [
    ...recipe.allergens,
    ...recipe.ingredients.map((ing) => ing.name),
    recipe.title,
  ].map((value) => value.toLowerCase());
  return haystack.some((value) => blocked.some((allergy) => value.includes(allergy) || allergy.includes(value)));
}

export function recipeMatchesHardDiet(recipe: Recipe, dietaryPreferences: string[]): boolean {
  const prefs = dietaryPreferences.map((p) => p.toLowerCase());
  const tags = recipe.dietaryTags.map((t) => t.toLowerCase());
  const allergens = recipe.allergens.map((a) => a.toLowerCase());

  for (const pref of prefs) {
    if (!HARD_DIETS.includes(pref as (typeof HARD_DIETS)[number])) continue;
    if (pref === "vegan" && !tags.includes("vegan")) return false;
    if (pref === "vegetarian" && !tags.includes("vegetarian") && !tags.includes("vegan")) return false;
    if (pref === "gluten-free" && (allergens.some((a) => a.includes("gluten")) || !tags.includes("gluten-free"))) {
      return false;
    }
    if (pref === "dairy-free" && (allergens.some((a) => a.includes("milk") || a.includes("dairy")) || !tags.includes("dairy-free"))) {
      return false;
    }
    if (pref === "halal" && !tags.includes("halal") && !tags.includes("vegetarian") && !tags.includes("vegan")) {
      return false;
    }
    if (pref === "kosher" && (allergens.some((a) => a.includes("shellfish")) || tags.includes("high-protein") && !tags.includes("halal") && !tags.includes("vegetarian") && !tags.includes("vegan") && recipe.title.toLowerCase().includes("pork"))) {
      return false;
    }
    if (pref === "keto" && recipe.carbsGrams > 30) return false;
  }
  return true;
}

export function isRecipeAllowed(
  recipe: Recipe,
  profile: Pick<UserProfile, "allergies" | "dietaryPreferences" | "dislikedIngredients">
): boolean {
  if (recipeViolatesAllergy(recipe, profile.allergies)) return false;
  const disliked = profile.dislikedIngredients.map((d) => d.toLowerCase());
  if (disliked.length && recipe.ingredients.some((ing) => disliked.some((d) => ing.name.toLowerCase().includes(d)))) {
    return false;
  }
  return recipeMatchesHardDiet(recipe, profile.dietaryPreferences);
}

export function filterAllowedRecipes(
  catalog: Recipe[],
  profile: Pick<UserProfile, "allergies" | "dietaryPreferences" | "dislikedIngredients">
): Recipe[] {
  return catalog.filter((recipe) => isRecipeAllowed(recipe, profile));
}

export function scoreRecipe(recipe: Recipe, profile: UserProfile, pantryNames: string[] = []): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const slotTarget = profile.calculatedNutrition.targetCalories / Math.max(3, profile.mealsPerDay || 4);
  let nutritionFit = 1 - Math.min(1, Math.abs(recipe.calories - slotTarget) / 400);
  nutritionFit = Math.max(0, nutritionFit);
  reasons.push(`Nutrition fit ${Math.round(nutritionFit * 100)}% vs meal-slot calorie target`);

  const prefTags = profile.dietaryPreferences.map((p) => p.toLowerCase());
  const tagHits = recipe.dietaryTags.filter((t) => prefTags.includes(t.toLowerCase())).length;
  const preferenceMatch = prefTags.length ? Math.min(1, tagHits / Math.min(prefTags.length, 3)) : 0.5;
  if (tagHits) reasons.push(`Matches ${tagHits} declared diet tag(s)`);

  const goalAlignment =
    profile.goal === "lose"
      ? Math.max(0, 1 - recipe.calories / 800)
      : profile.goal === "gain"
        ? Math.min(1, recipe.proteinGrams / 45)
        : 0.7;
  reasons.push(
    profile.goal === "lose"
      ? "Aligned with calorie-deficit planning"
      : profile.goal === "gain"
        ? "Supports higher protein intake"
        : "Maintains balanced macros"
  );

  const cuisineMatch = preferenceMatch;
  const estimatedCost = recipe.ingredients.length * 3.5;
  const dailyBudget = (profile.weeklyBudget || 100) / 7;
  const budgetFit = estimatedCost <= dailyBudget / (profile.mealsPerDay || 4) + 4 ? 0.9 : 0.55;
  if (budgetFit >= 0.9) reasons.push("Fits configured weekly grocery budget");

  const cookingTimeFit = recipe.prepTimeMinutes + recipe.cookTimeMinutes <= profile.maxPrepTimeMinutes ? 1 : 0.4;
  if (cookingTimeFit === 1) reasons.push(`Fits ${profile.maxPrepTimeMinutes} min cooking ceiling`);

  const pantryHits = recipe.ingredients.filter((ing) =>
    pantryNames.some((name) => name.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(name))
  ).length;
  const pantryMatch = recipe.ingredients.length ? pantryHits / recipe.ingredients.length : 0;
  if (pantryHits) reasons.push(`Uses ${pantryHits} pantry ingredient(s)`);

  const historicalPreference = historicalPreferenceScore(recipe.id);
  if (historicalPreference !== 0.5) reasons.push("Adjusted from your recent meal actions");

  const score =
    0.3 * nutritionFit +
    0.2 * preferenceMatch +
    0.15 * goalAlignment +
    0.1 * cuisineMatch +
    0.1 * budgetFit +
    0.05 * cookingTimeFit +
    0.1 * historicalPreference +
    0.08 * pantryMatch;

  return { score: Math.round(Math.min(1, score) * 100) / 100, reasons: reasons.slice(0, 4) };
}
