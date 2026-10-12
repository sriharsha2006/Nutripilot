export const NUTRITION_CONFIG = {
  mifflin: {
    weightKg: 10,
    heightCm: 6.25,
    age: 5,
    maleOffset: 5,
    femaleOffset: -161,
    otherOffset: -78,
  },
  activityMultipliers: {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  } as Record<string, number>,
  kcalPerKg: 7700,
  minDailyCalories: 1200,
  defaultMacroRatios: {
    carbs: 0.5,
    protein: 0.25,
    fat: 0.25,
  },
  slotCalorieShares: {
    breakfast: 0.25,
    lunch: 0.3,
    dinner: 0.35,
    snack: 0.1,
  } as Record<"breakfast" | "lunch" | "dinner" | "snack", number>,
};

export type NutritionInput = {
  age: number;
  gender: "male" | "female" | "other" | string;
  weightKg: number;
  heightCm: number;
  activityLevel: string;
  goal: "lose" | "maintain" | "gain" | string;
  targetPace?: number;
};

export function calculateNutritionTargets(input: NutritionInput) {
  const { mifflin, activityMultipliers, kcalPerKg, minDailyCalories, defaultMacroRatios } = NUTRITION_CONFIG;
  let bmr =
    mifflin.weightKg * input.weightKg +
    mifflin.heightCm * input.heightCm -
    mifflin.age * input.age;
  if (input.gender === "male") bmr += mifflin.maleOffset;
  else if (input.gender === "female") bmr += mifflin.femaleOffset;
  else bmr += mifflin.otherOffset;

  const multiplier = activityMultipliers[input.activityLevel] || activityMultipliers.light;
  const tdee = Math.round(bmr * multiplier);
  const dailyDelta = Math.round(((input.targetPace || 0.5) * kcalPerKg) / 7);
  let targetCalories = tdee;
  if (input.goal === "lose") targetCalories = Math.max(minDailyCalories, tdee - dailyDelta);
  else if (input.goal === "gain") targetCalories = tdee + dailyDelta;

  const macros = {
    carbsGrams: Math.round((targetCalories * defaultMacroRatios.carbs) / 4),
    proteinGrams: Math.round((targetCalories * defaultMacroRatios.protein) / 4),
    fatGrams: Math.round((targetCalories * defaultMacroRatios.fat) / 9),
    carbsPct: Math.round(defaultMacroRatios.carbs * 100),
    proteinPct: Math.round(defaultMacroRatios.protein * 100),
    fatPct: Math.round(defaultMacroRatios.fat * 100),
  };

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    macros,
  };
}
