import { describe, it, expect, beforeEach } from "vitest";
import { saveMockProfile, getMockProfile } from "../profile";

describe("Nutrition Calculator (BMR/TDEE/Macros)", () => {
  describe("BMR – Mifflin-St Jeor formula", () => {
    it("calculates female BMR correctly", () => {
      saveMockProfile({
        age: 28,
        gender: "female",
        weightKg: 65,
        heightCm: 168,
        activityLevel: "moderate",
        goal: "maintain",
        targetPace: 0,
        dietaryPreferences: [],
        allergies: [],
        dislikedIngredients: [],
        weeklyBudget: 100,
        householdSize: 1,
        cookingSkill: "beginner",
        maxPrepTimeMinutes: 30,
      });
      const profile = getMockProfile();
      // Female: 10*65 + 6.25*168 - 5*28 - 161 = 650+1050-140-161 = 1399
      expect(profile.calculatedNutrition.bmr).toBe(1399);
    });

    it("calculates male BMR correctly", () => {
      saveMockProfile({
        age: 30,
        gender: "male",
        weightKg: 80,
        heightCm: 180,
        activityLevel: "sedentary",
        goal: "maintain",
        targetPace: 0,
        dietaryPreferences: [],
        allergies: [],
        dislikedIngredients: [],
        weeklyBudget: 100,
        householdSize: 1,
        cookingSkill: "beginner",
        maxPrepTimeMinutes: 30,
      });
      const profile = getMockProfile();
      // Male: 10*80 + 6.25*180 - 5*30 + 5 = 800+1125-150+5 = 1780
      expect(profile.calculatedNutrition.bmr).toBe(1780);
    });
  });

  describe("TDEE – Activity Multipliers", () => {
    it("applies sedentary multiplier (1.2)", () => {
      saveMockProfile({
        age: 30, gender: "male", weightKg: 80, heightCm: 180,
        activityLevel: "sedentary", goal: "maintain", targetPace: 0,
        dietaryPreferences: [], allergies: [], dislikedIngredients: [],
        weeklyBudget: 100, householdSize: 1, cookingSkill: "beginner", maxPrepTimeMinutes: 30,
      });
      const { bmr, tdee } = getMockProfile().calculatedNutrition;
      expect(tdee).toBe(Math.round(bmr * 1.2));
    });

    it("applies moderate multiplier (1.55)", () => {
      saveMockProfile({
        age: 28, gender: "female", weightKg: 65, heightCm: 168,
        activityLevel: "moderate", goal: "maintain", targetPace: 0,
        dietaryPreferences: [], allergies: [], dislikedIngredients: [],
        weeklyBudget: 100, householdSize: 1, cookingSkill: "beginner", maxPrepTimeMinutes: 30,
      });
      const { bmr, tdee } = getMockProfile().calculatedNutrition;
      expect(tdee).toBe(Math.round(bmr * 1.55));
    });
  });

  describe("Calorie Target – Goal Adjustments", () => {
    it("reduces calories for weight loss goal (0.5 kg/week = ~550 kcal deficit)", () => {
      saveMockProfile({
        age: 28, gender: "female", weightKg: 65, heightCm: 168,
        activityLevel: "moderate", goal: "lose", targetPace: 0.5,
        dietaryPreferences: [], allergies: [], dislikedIngredients: [],
        weeklyBudget: 100, householdSize: 1, cookingSkill: "beginner", maxPrepTimeMinutes: 30,
      });
      const { tdee, targetCalories } = getMockProfile().calculatedNutrition;
      expect(targetCalories).toBeLessThan(tdee);
    });

    it("increases calories for weight gain goal", () => {
      saveMockProfile({
        age: 25, gender: "male", weightKg: 70, heightCm: 175,
        activityLevel: "active", goal: "gain", targetPace: 0.5,
        dietaryPreferences: [], allergies: [], dislikedIngredients: [],
        weeklyBudget: 100, householdSize: 1, cookingSkill: "beginner", maxPrepTimeMinutes: 30,
      });
      const { tdee, targetCalories } = getMockProfile().calculatedNutrition;
      expect(targetCalories).toBeGreaterThan(tdee);
    });

    it("clamps weight loss calories to a minimum of 1200 kcal", () => {
      saveMockProfile({
        age: 50, gender: "female", weightKg: 45, heightCm: 145,
        activityLevel: "sedentary", goal: "lose", targetPace: 1.5,
        dietaryPreferences: [], allergies: [], dislikedIngredients: [],
        weeklyBudget: 100, householdSize: 1, cookingSkill: "beginner", maxPrepTimeMinutes: 30,
      });
      const { targetCalories } = getMockProfile().calculatedNutrition;
      expect(targetCalories).toBeGreaterThanOrEqual(1200);
    });
  });

  describe("Macronutrient gram splits (50/25/25 default)", () => {
    it("computes protein grams at 25% of target calories / 4", () => {
      saveMockProfile({
        age: 28, gender: "female", weightKg: 65, heightCm: 168,
        activityLevel: "moderate", goal: "maintain", targetPace: 0,
        dietaryPreferences: [], allergies: [], dislikedIngredients: [],
        weeklyBudget: 100, householdSize: 1, cookingSkill: "beginner", maxPrepTimeMinutes: 30,
      });
      const { targetCalories, macros } = getMockProfile().calculatedNutrition;
      expect(macros.proteinGrams).toBe(Math.round((targetCalories * 0.25) / 4));
    });

    it("computes carbs grams at 50% of target calories / 4", () => {
      saveMockProfile({
        age: 28, gender: "female", weightKg: 65, heightCm: 168,
        activityLevel: "moderate", goal: "maintain", targetPace: 0,
        dietaryPreferences: [], allergies: [], dislikedIngredients: [],
        weeklyBudget: 100, householdSize: 1, cookingSkill: "beginner", maxPrepTimeMinutes: 30,
      });
      const { targetCalories, macros } = getMockProfile().calculatedNutrition;
      expect(macros.carbsGrams).toBe(Math.round((targetCalories * 0.5) / 4));
    });
  });
});
