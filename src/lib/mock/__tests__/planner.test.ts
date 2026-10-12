import { describe, it, expect } from "vitest";
import { getMockWeeklyPlan, refreshMockMeal, toggleMockMealLock, generateMockWeeklyPlan } from "../planner";

describe("Weekly Meal Planner Mock Engine", () => {
  describe("Plan Generation", () => {
    it("generates a weekly plan with exactly 7 days", () => {
      const plan = generateMockWeeklyPlan(false);
      expect(plan.days).toHaveLength(7);
    });

    it("each day has exactly 4 meal slots (breakfast, lunch, dinner, snack)", () => {
      const plan = generateMockWeeklyPlan(false);
      plan.days.forEach((day) => {
        expect(day.meals).toHaveLength(4);
      });
    });

    it("each meal has a valid recipe with a title and positive calories", () => {
      const plan = generateMockWeeklyPlan(false);
      plan.days.forEach((day) => {
        day.meals.forEach((meal) => {
          expect(meal.recipe.title.length).toBeGreaterThan(0);
          expect(meal.recipe.calories).toBeGreaterThan(0);
        });
      });
    });

    it("each meal has a positive serving size (default ≥ 1)", () => {
      const plan = generateMockWeeklyPlan(false);
      plan.days.forEach((day) => {
        day.meals.forEach((meal) => {
          expect(meal.servings).toBeGreaterThanOrEqual(1);
        });
      });
    });

    it("plan has positive calorie targets set from user profile", () => {
      const plan = generateMockWeeklyPlan(false);
      expect(plan.targetCalories).toBeGreaterThan(0);
    });
  });

  describe("Meal Locking (toggle)", () => {
    it("toggles a meal from unlocked to locked", () => {
      const plan = getMockWeeklyPlan();
      const meal = plan.days[0].meals[0];
      // Ensure it's unlocked first
      if (meal.isLocked) toggleMockMealLock(meal.id);
      const result = toggleMockMealLock(meal.id);
      expect(result.isLocked).toBe(true);
    });

    it("toggles a locked meal back to unlocked", () => {
      const plan = getMockWeeklyPlan();
      const meal = plan.days[0].meals[0];
      // Lock it
      if (!meal.isLocked) toggleMockMealLock(meal.id);
      // Now toggle again to unlock
      const result = toggleMockMealLock(meal.id);
      expect(result.isLocked).toBe(false);
    });

    it("throws when toggling a non-existent meal ID", () => {
      expect(() => toggleMockMealLock("non-existent-id")).toThrow("Meal not found");
    });
  });

  describe("Meal Refresh", () => {
    it("refreshes an unlocked meal and returns a meal with a recipe title", () => {
      const plan = getMockWeeklyPlan();
      const meal = plan.days[0].meals[1];
      // Ensure it's unlocked
      if (meal.isLocked) toggleMockMealLock(meal.id);
      const refreshed = refreshMockMeal(meal.id);
      expect(refreshed.recipe.title.length).toBeGreaterThan(0);
    });

    it("throws when trying to refresh a locked meal", () => {
      const plan = getMockWeeklyPlan();
      const meal = plan.days[0].meals[2];
      // Lock the meal
      if (!meal.isLocked) toggleMockMealLock(meal.id);
      expect(() => refreshMockMeal(meal.id)).toThrow("Cannot refresh a locked meal");
    });

    it("throws when refreshing a non-existent meal ID", () => {
      expect(() => refreshMockMeal("fake-id")).toThrow("Meal not found");
    });
  });

  describe("Day Macro Totals", () => {
    it("day total calories equal sum of its meal recipe calories × servings", () => {
      const plan = generateMockWeeklyPlan(false);
      plan.days.forEach((day) => {
        const expectedTotal = day.meals.reduce(
          (sum, m) => sum + Math.round(m.recipe.calories * m.servings),
          0
        );
        expect(day.totalCalories).toBe(expectedTotal);
      });
    });
  });
});
