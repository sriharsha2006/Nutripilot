import { Recipe, WeeklyPlan, DailyPlan, MealSlot, SwapOption } from "@/lib/api/planner";
import { getMockProfile } from "./profile";
import { filterAllowedRecipes, recipeViolatesAllergy } from "./constraints";

export const MOCK_RECIPE_CATALOG: Recipe[] = [
  {
    id: "rec-01",
    title: "Avocado & Egg Sourdough Toast",
    description: "Crispy whole-grain sourdough topped with crushed avocado, poached eggs, and chili flakes.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    servings: 1,
    calories: 420,
    proteinGrams: 22,
    carbsGrams: 38,
    fatGrams: 20,
    dietaryTags: ["High-Protein", "Vegetarian"],
    allergens: ["Eggs", "Gluten/Wheat"],
    explanation: "High in healthy fats and quality protein to sustain morning energy.",
    ingredients: [
      { id: "i1", name: "Sourdough Bread", amount: 2, unit: "slices", category: "bakery", inPantry: true },
      { id: "i2", name: "Ripe Avocado", amount: 1, unit: "medium", category: "produce", inPantry: true },
      { id: "i3", name: "Eggs", amount: 2, unit: "large", category: "dairy", inPantry: true },
      { id: "i4", name: "Red Chili Flakes", amount: 0.5, unit: "tsp", category: "spices", inPantry: true },
    ],
    instructions: [
      "Toast sourdough slices until golden brown.",
      "Mash avocado in a bowl with lemon juice, salt, and pepper.",
      "Poach or fry eggs to your desired runniness.",
      "Spread avocado over toast, top with eggs, and sprinkle chili flakes.",
    ],
  },
  {
    id: "rec-02",
    title: "Greek Yogurt Berry Protein Bowl",
    description: "Thick Greek yogurt layered with wild blueberries, chia seeds, almonds, and raw honey.",
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 360,
    proteinGrams: 28,
    carbsGrams: 42,
    fatGrams: 10,
    dietaryTags: ["High-Protein", "Gluten-Free", "Vegetarian"],
    allergens: ["Milk/Dairy", "Tree Nuts"],
    explanation: "Packed with probiotics and high protein for cellular repair.",
    ingredients: [
      { id: "i5", name: "Non-Fat Greek Yogurt", amount: 200, unit: "g", category: "dairy", inPantry: true },
      { id: "i6", name: "Wild Blueberries", amount: 100, unit: "g", category: "produce", inPantry: false },
      { id: "i7", name: "Chia Seeds", amount: 1, unit: "tbsp", category: "pantry", inPantry: true },
      { id: "i8", name: "Sliced Almonds", amount: 15, unit: "g", category: "pantry", inPantry: true },
    ],
    instructions: [
      "Spoon Greek yogurt into a serving bowl.",
      "Top with fresh blueberries, chia seeds, and sliced almonds.",
      "Drizzle honey if desired and serve fresh.",
    ],
  },
  {
    id: "rec-03",
    title: "Grilled Lemon Herb Chicken & Quinoa",
    description: "Marinated chicken breast served with fluffy herb quinoa and roasted asparagus.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 1,
    calories: 540,
    proteinGrams: 48,
    carbsGrams: 45,
    fatGrams: 18,
    dietaryTags: ["High-Protein", "Gluten-Free", "Dairy-Free"],
    allergens: [],
    explanation: "Optimal macro balance with lean protein and slow-digesting complex carbs.",
    ingredients: [
      { id: "i9", name: "Chicken Breast", amount: 180, unit: "g", category: "protein", inPantry: true },
      { id: "i10", name: "Quinoa", amount: 70, unit: "g dry", category: "pantry", inPantry: true },
      { id: "i11", name: "Asparagus Spears", amount: 100, unit: "g", category: "produce", inPantry: false },
      { id: "i12", name: "Olive Oil & Lemon Juice", amount: 1.5, unit: "tbsp", category: "pantry", inPantry: true },
    ],
    instructions: [
      "Marinate chicken breast in lemon juice, garlic, olive oil, and herbs.",
      "Cook quinoa in water according to package instructions.",
      "Grill chicken for 6-7 mins per side. Roast asparagus on the side.",
      "Slice chicken and serve over warm quinoa.",
    ],
  },
  {
    id: "rec-04",
    title: "Pan-Seared Salmon with Sweet Potato Mash",
    description: "Crispy skin salmon fillet over garlic sweet potato mash with steamed broccoli.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 1,
    calories: 580,
    proteinGrams: 42,
    carbsGrams: 46,
    fatGrams: 24,
    dietaryTags: ["High-Protein", "Gluten-Free", "Dairy-Free", "Halal"],
    allergens: ["Fish"],
    explanation: "Rich in Omega-3 fatty acids for heart and brain health.",
    ingredients: [
      { id: "i13", name: "Atlantic Salmon Fillet", amount: 170, unit: "g", category: "protein", inPantry: true },
      { id: "i14", name: "Sweet Potato", amount: 200, unit: "g", category: "produce", inPantry: true },
      { id: "i15", name: "Broccoli Florets", amount: 120, unit: "g", category: "produce", inPantry: true },
      { id: "i16", name: "Olive Oil", amount: 1, unit: "tbsp", category: "pantry", inPantry: true },
    ],
    instructions: [
      "Boil sweet potato chunks until tender, then mash with olive oil and sea salt.",
      "Sear salmon skin-side down in a hot skillet for 4 mins, flip and cook 3 mins.",
      "Steam broccoli florets for 4 mins until bright green.",
      "Plate sweet potato mash, place salmon on top, and serve with broccoli.",
    ],
  },
  {
    id: "rec-05",
    title: "Mediterranean Chickpea & Feta Salad",
    description: "Crisp cucumbers, cherry tomatoes, Kalamata olives, and chickpeas tossed in oregano vinaigrette.",
    prepTimeMinutes: 12,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 450,
    proteinGrams: 18,
    carbsGrams: 52,
    fatGrams: 20,
    dietaryTags: ["Mediterranean", "Vegetarian", "Gluten-Free"],
    allergens: ["Milk/Dairy"],
    explanation: "High in dietary fiber and heart-healthy antioxidants.",
    ingredients: [
      { id: "i17", name: "Canned Chickpeas", amount: 200, unit: "g", category: "pantry", inPantry: true },
      { id: "i18", name: "Crumbled Feta", amount: 40, unit: "g", category: "dairy", inPantry: true },
      { id: "i19", name: "Cherry Tomatoes", amount: 100, unit: "g", category: "produce", inPantry: true },
      { id: "i20", name: "Kalamata Olives", amount: 30, unit: "g", category: "pantry", inPantry: true },
    ],
    instructions: [
      "Rinse and drain chickpeas thoroughly.",
      "Combine diced cucumber, cherry tomatoes, chickpeas, and olives in a bowl.",
      "Toss with olive oil, red wine vinegar, dried oregano, salt, and pepper.",
      "Top with crumbled feta cheese.",
    ],
  },
  {
    id: "rec-06",
    title: "Turkey & Veggie Rice Power Bowl",
    description: "Lean ground turkey, sautéed bell peppers, zucchini, and brown rice with tamari glaze.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    calories: 510,
    proteinGrams: 44,
    carbsGrams: 48,
    fatGrams: 16,
    dietaryTags: ["High-Protein", "Gluten-Free", "Dairy-Free", "Halal"],
    allergens: ["Soy"],
    explanation: "High protein meal prep favorite under 30 minutes total time.",
    ingredients: [
      { id: "i21", name: "Lean Ground Turkey (93%)", amount: 170, unit: "g", category: "protein", inPantry: true },
      { id: "i22", name: "Cooked Brown Rice", amount: 150, unit: "g", category: "pantry", inPantry: true },
      { id: "i23", name: "Bell Pepper & Zucchini", amount: 150, unit: "g", category: "produce", inPantry: true },
    ],
    instructions: [
      "Brown turkey in a skillet with garlic and minced ginger.",
      "Add sliced bell peppers and zucchini, cooking until tender-crisp.",
      "Stir in low-sodium tamari soy sauce and sesame oil.",
      "Serve hot over fluffy brown rice.",
    ],
  },
  {
    id: "rec-07",
    title: "Tofu Veggie Stir-Fry with Peanut Sauce",
    description: "Crispy cubed tofu sautéed with snap peas, carrots, and broccoli in a savory peanut sauce.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    servings: 1,
    calories: 470,
    proteinGrams: 24,
    carbsGrams: 36,
    fatGrams: 26,
    dietaryTags: ["Vegan", "Vegetarian", "Dairy-Free"],
    allergens: ["Soy", "Peanuts"],
    explanation: "Plant-based protein meal rich in micronutrients and healthy fats.",
    ingredients: [
      { id: "i24", name: "Extra Firm Tofu", amount: 180, unit: "g", category: "protein", inPantry: true },
      { id: "i25", name: "Peanut Butter", amount: 2, unit: "tbsp", category: "pantry", inPantry: true },
      { id: "i26", name: "Mixed Vegetables", amount: 200, unit: "g", category: "produce", inPantry: true },
    ],
    instructions: [
      "Press tofu and cut into 1-inch cubes. Pan fry until crisp on all sides.",
      "Whisk peanut butter, soy sauce, lime juice, and warm water for sauce.",
      "Sauté snap peas, carrots, and broccoli florets.",
      "Toss tofu and veggies in peanut sauce and serve.",
    ],
  },
  {
    id: "rec-08",
    title: "Almond Butter & Apple Slices",
    description: "Crispy Honeycrisp apple slices paired with creamy natural almond butter.",
    prepTimeMinutes: 3,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 220,
    proteinGrams: 5,
    carbsGrams: 24,
    fatGrams: 12,
    dietaryTags: ["Vegan", "Vegetarian", "Gluten-Free", "Dairy-Free"],
    allergens: ["Tree Nuts"],
    explanation: "Quick nutrient-dense afternoon snack balancing natural sugars and healthy fats.",
    ingredients: [
      { id: "i27", name: "Honeycrisp Apple", amount: 1, unit: "medium", category: "produce", inPantry: true },
      { id: "i28", name: "Almond Butter", amount: 1.5, unit: "tbsp", category: "pantry", inPantry: true },
    ],
    instructions: [
      "Core and slice apple into wedges.",
      "Serve immediately alongside almond butter for dipping.",
    ],
  },
  {
    id: "rec-09",
    title: "Cottage Cheese & Honey Walnut Dip",
    description: "Protein-packed whipped cottage cheese topped with crushed walnuts and raw honey.",
    prepTimeMinutes: 4,
    cookTimeMinutes: 0,
    servings: 1,
    calories: 250,
    proteinGrams: 20,
    carbsGrams: 16,
    fatGrams: 11,
    dietaryTags: ["High-Protein", "Gluten-Free", "Vegetarian"],
    allergens: ["Milk/Dairy", "Tree Nuts"],
    explanation: "Casein protein snack supporting muscle maintenance.",
    ingredients: [
      { id: "i29", name: "Low-Fat Cottage Cheese", amount: 150, unit: "g", category: "dairy", inPantry: true },
      { id: "i30", name: "Walnuts", amount: 15, unit: "g", category: "pantry", inPantry: true },
      { id: "i31", name: "Raw Honey", amount: 1, unit: "tsp", category: "pantry", inPantry: true },
    ],
    instructions: [
      "Blend cottage cheese until smooth and velvety.",
      "Top with crushed walnuts and drizzle with raw honey.",
    ],
  },
];

// Persistent Mock Weekly Plan State
let activeWeeklyPlan: WeeklyPlan | null = null;

const DAYS: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const generateMockWeeklyPlan = (forceRegenerateAll = false): WeeklyPlan => {
  const profile = getMockProfile();
  const targetCalories = profile.calculatedNutrition.targetCalories;
  const targetProtein = profile.calculatedNutrition.macros.proteinGrams;
  const targetCarbs = profile.calculatedNutrition.macros.carbsGrams;
  const targetFat = profile.calculatedNutrition.macros.fatGrams;

  if (activeWeeklyPlan && !forceRegenerateAll) {
    return activeWeeklyPlan;
  }

  // Preserve locked meals if active plan exists
  const existingLockedMeals: Record<string, MealSlot> = {};
  if (activeWeeklyPlan) {
    activeWeeklyPlan.days.forEach((d) => {
      d.meals.forEach((m) => {
        if (m.isLocked) {
          existingLockedMeals[`${d.day}-${m.mealType}`] = m;
        }
      });
    });
  }

  const allowed = filterAllowedRecipes(MOCK_RECIPE_CATALOG, profile);
  const breakfastPool = allowed.filter((r) => ["rec-01", "rec-02"].includes(r.id));
  const lunchPool = allowed.filter((r) => ["rec-03", "rec-05", "rec-06"].includes(r.id));
  const dinnerPool = allowed.filter((r) => ["rec-04", "rec-05", "rec-06", "rec-07"].includes(r.id));
  const snackPool = allowed.filter((r) => ["rec-08", "rec-09"].includes(r.id));
  const pick = (pool: Recipe[], fallbackIndex: number) =>
    pool[fallbackIndex % Math.max(pool.length, 1)] || allowed[fallbackIndex % allowed.length] || MOCK_RECIPE_CATALOG[fallbackIndex % MOCK_RECIPE_CATALOG.length];

  const dailyPlans: DailyPlan[] = DAYS.map((day, idx) => {
    const keyBreakfast = `${day}-breakfast`;
    const keyLunch = `${day}-lunch`;
    const keyDinner = `${day}-dinner`;
    const keySnack = `${day}-snack`;

    const breakfastRecipe = existingLockedMeals[keyBreakfast]?.recipe || pick(breakfastPool.length ? breakfastPool : allowed, idx);
    const lunchRecipe = existingLockedMeals[keyLunch]?.recipe || pick(lunchPool.length ? lunchPool : allowed, idx + 2);
    const dinnerRecipe = existingLockedMeals[keyDinner]?.recipe || pick(dinnerPool.length ? dinnerPool : allowed, idx + 4);
    const snackRecipe = existingLockedMeals[keySnack]?.recipe || pick(snackPool.length ? snackPool : allowed, idx + 7);

    const meals: MealSlot[] = [
      {
        id: `meal-${day.toLowerCase()}-1`,
        day,
        mealType: "breakfast",
        recipe: breakfastRecipe,
        servings: existingLockedMeals[keyBreakfast]?.servings || 1,
        isLocked: existingLockedMeals[keyBreakfast]?.isLocked || false,
        eaten: existingLockedMeals[keyBreakfast]?.eaten || false,
      },
      {
        id: `meal-${day.toLowerCase()}-2`,
        day,
        mealType: "lunch",
        recipe: lunchRecipe,
        servings: existingLockedMeals[keyLunch]?.servings || 1,
        isLocked: existingLockedMeals[keyLunch]?.isLocked || false,
        eaten: existingLockedMeals[keyLunch]?.eaten || false,
      },
      {
        id: `meal-${day.toLowerCase()}-3`,
        day,
        mealType: "dinner",
        recipe: dinnerRecipe,
        servings: existingLockedMeals[keyDinner]?.servings || 1,
        isLocked: existingLockedMeals[keyDinner]?.isLocked || false,
        eaten: existingLockedMeals[keyDinner]?.eaten || false,
      },
      {
        id: `meal-${day.toLowerCase()}-4`,
        day,
        mealType: "snack",
        recipe: snackRecipe,
        servings: existingLockedMeals[keySnack]?.servings || 1,
        isLocked: existingLockedMeals[keySnack]?.isLocked || false,
        eaten: existingLockedMeals[keySnack]?.eaten || false,
      },
    ];

    const totalCalories = meals.reduce((sum, m) => sum + Math.round(m.recipe.calories * m.servings), 0);
    const totalProtein = meals.reduce((sum, m) => sum + Math.round(m.recipe.proteinGrams * m.servings), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + Math.round(m.recipe.carbsGrams * m.servings), 0);
    const totalFat = meals.reduce((sum, m) => sum + Math.round(m.recipe.fatGrams * m.servings), 0);

    return {
      day,
      meals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };
  });

  activeWeeklyPlan = {
    id: "plan-week-1",
    userId: profile.id,
    days: dailyPlans,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    createdAt: new Date().toISOString(),
  };

  return activeWeeklyPlan;
};

export const getMockWeeklyPlan = (): WeeklyPlan => {
  if (!activeWeeklyPlan) {
    return generateMockWeeklyPlan(false);
  }
  return activeWeeklyPlan;
};

export const refreshMockMeal = (mealId: string): MealSlot => {
  const plan = getMockWeeklyPlan();
  for (const d of plan.days) {
    for (const m of d.meals) {
      if (m.id === mealId) {
        if (m.isLocked) {
          throw new Error("Cannot refresh a locked meal");
        }
        const profile = getMockProfile();
        const alternatives = filterAllowedRecipes(MOCK_RECIPE_CATALOG, profile).filter((r) => r.id !== m.recipe.id);
        const pool = alternatives.length ? alternatives : MOCK_RECIPE_CATALOG.filter((r) => r.id !== m.recipe.id);
        const newRecipe = pool[Math.floor(Math.random() * pool.length)];
        m.recipe = newRecipe;
        recalculateDayTotals(d);
        return m;
      }
    }
  }
  throw new Error("Meal not found");
};

export const toggleMockMealLock = (mealId: string): { mealId: string; isLocked: boolean } => {
  const plan = getMockWeeklyPlan();
  for (const d of plan.days) {
    for (const m of d.meals) {
      if (m.id === mealId) {
        m.isLocked = !m.isLocked;
        return { mealId: m.id, isLocked: m.isLocked };
      }
    }
  }
  throw new Error("Meal not found");
};

export const getMockSwapOptions = (mealId: string): SwapOption[] => {
  const plan = getMockWeeklyPlan();
  let targetMeal: MealSlot | null = null;
  for (const d of plan.days) {
    const found = d.meals.find((m) => m.id === mealId);
    if (found) {
      targetMeal = found;
      break;
    }
  }

  if (!targetMeal) return [];

  const currentRecipe = targetMeal.recipe;
  const profile = getMockProfile();
  return filterAllowedRecipes(MOCK_RECIPE_CATALOG, profile)
    .filter((r) => r.id !== currentRecipe.id)
    .map((r) => {
    const calDiff = r.calories - currentRecipe.calories;
    const proteinMatch = 100 - Math.min(100, Math.abs(r.proteinGrams - currentRecipe.proteinGrams) * 3);
    return {
      recipe: r,
      calorieDifference: calDiff,
      macroMatchScore: Math.round(proteinMatch),
    };
  });
};

export const swapMockMeal = (mealId: string, recipeId: string): MealSlot => {
  const plan = getMockWeeklyPlan();
  const newRecipe = MOCK_RECIPE_CATALOG.find((r) => r.id === recipeId);
  if (!newRecipe) throw new Error("Recipe not found");

  for (const d of plan.days) {
    for (const m of d.meals) {
      if (m.id === mealId) {
        if (m.isLocked) throw new Error("Cannot swap a locked meal");
        const profile = getMockProfile();
        if (recipeViolatesAllergy(newRecipe, profile.allergies)) {
          throw new Error("Recipe violates allergy constraints");
        }
        m.recipe = newRecipe;
        recalculateDayTotals(d);
        return m;
      }
    }
  }
  throw new Error("Meal not found");
};

export const updateMockMealItem = (mealId: string, updates: { servings?: number; eaten?: boolean }): MealSlot => {
  const plan = getMockWeeklyPlan();
  for (const d of plan.days) {
    for (const m of d.meals) {
      if (m.id === mealId) {
        if (updates.servings !== undefined) m.servings = updates.servings;
        if (updates.eaten !== undefined) m.eaten = updates.eaten;
        recalculateDayTotals(d);
        return m;
      }
    }
  }
  throw new Error("Meal not found");
};

function recalculateDayTotals(day: DailyPlan) {
  day.totalCalories = day.meals.reduce((sum, m) => sum + Math.round(m.recipe.calories * m.servings), 0);
  day.totalProtein = day.meals.reduce((sum, m) => sum + Math.round(m.recipe.proteinGrams * m.servings), 0);
  day.totalCarbs = day.meals.reduce((sum, m) => sum + Math.round(m.recipe.carbsGrams * m.servings), 0);
  day.totalFat = day.meals.reduce((sum, m) => sum + Math.round(m.recipe.fatGrams * m.servings), 0);
}
