"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MacroSummaryBar } from "@/components/planner/MacroSummaryBar";
import { MealCard } from "@/components/planner/MealCard";
import { SwapModal } from "@/components/planner/SwapModal";
import { WeeklyPlan, DailyPlan, MealSlot, plannerApi } from "@/lib/api/planner";
import {
  Calendar,
  Sparkles,
  RefreshCw,
  Lock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export default function PlannerPage() {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [activeDay, setActiveDay] = useState<(typeof DAYS)[number]>("Monday");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Swap Modal state
  const [swapModalOpen, setSwapModalOpen] = useState<boolean>(false);
  const [swapTargetMeal, setSwapTargetMeal] = useState<MealSlot | null>(null);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setIsLoading(true);
    try {
      const data = await plannerApi.getWeeklyPlan();
      setWeeklyPlan(data);
    } catch (err) {
      console.error("Failed to load meal plan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePlan = async () => {
    setIsRegenerating(true);
    try {
      const updatedPlan = await plannerApi.generateWeeklyPlan(true);
      setWeeklyPlan(updatedPlan);
    } catch (err) {
      console.error("Failed to regenerate plan:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleMealUpdate = (updatedMeal: MealSlot) => {
    if (!weeklyPlan) return;
    const updatedDays = weeklyPlan.days.map((day) => {
      if (day.day === updatedMeal.day) {
        const updatedMeals = day.meals.map((m) => (m.id === updatedMeal.id ? updatedMeal : m));
        const totalCalories = updatedMeals.reduce((s, m) => s + Math.round(m.recipe.calories * m.servings), 0);
        const totalProtein = updatedMeals.reduce((s, m) => s + Math.round(m.recipe.proteinGrams * m.servings), 0);
        const totalCarbs = updatedMeals.reduce((s, m) => s + Math.round(m.recipe.carbsGrams * m.servings), 0);
        const totalFat = updatedMeals.reduce((s, m) => s + Math.round(m.recipe.fatGrams * m.servings), 0);
        return {
          ...day,
          meals: updatedMeals,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
        };
      }
      return day;
    });

    setWeeklyPlan({ ...weeklyPlan, days: updatedDays });
  };

  const handleOpenSwap = (meal: MealSlot) => {
    setSwapTargetMeal(meal);
    setSwapModalOpen(true);
  };

  if (isLoading || !weeklyPlan) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Generating your personalized AI 7-day meal plan...</p>
      </div>
    );
  }

  const currentDayPlan = weeklyPlan.days.find((d) => d.day === activeDay) || weeklyPlan.days[0];
  const lockedCount = weeklyPlan.days.reduce(
    (acc, d) => acc + d.meals.filter((m) => m.isLocked).length,
    0
  );

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" /> AI Personalized Meal Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">7-Day Meal Schedule</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lockedCount > 0
              ? `${lockedCount} meal(s) locked. Locked meals will be preserved during full plan regeneration.`
              : "Lock favorite meals or refresh individual slots at any time."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            onClick={handleRegeneratePlan}
            disabled={isRegenerating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Regenerating..." : "Regenerate Unlocked Meals"}
          </Button>

          <Button variant="secondary" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print Plan
          </Button>
        </div>
      </div>

      {/* Days Calendar Ribbon */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((day) => {
          const dayData = weeklyPlan.days.find((d) => d.day === day);
          const isActive = activeDay === day;
          const calDiff = (dayData?.totalCalories || 0) - weeklyPlan.targetCalories;
          const isOk = Math.abs(calDiff) <= 100;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 min-w-[120px] p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "bg-card hover:bg-muted/50 text-foreground"
              }`}
            >
              <div className="text-xs opacity-80 font-medium">{day}</div>
              <div className="text-base font-bold mt-0.5">{dayData?.totalCalories || 0} kcal</div>
              <div className="text-[10px] opacity-75 mt-1 flex items-center justify-between">
                <span>P: {dayData?.totalProtein || 0}g</span>
                {isOk && <span className="font-semibold">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Target Progress Bar */}
      <MacroSummaryBar
        dayName={activeDay}
        currentCalories={currentDayPlan.totalCalories}
        targetCalories={weeklyPlan.targetCalories}
        currentProtein={currentDayPlan.totalProtein}
        targetProtein={weeklyPlan.targetProtein}
        currentCarbs={currentDayPlan.totalCarbs}
        targetCarbs={weeklyPlan.targetCarbs}
        currentFat={currentDayPlan.totalFat}
        targetFat={weeklyPlan.targetFat}
      />

      {/* Meal Slots Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> {activeDay}'s Planned Meals
          </h2>
          <span className="text-xs text-muted-foreground">4 Meal Slots</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentDayPlan.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onUpdate={handleMealUpdate}
              onOpenSwap={handleOpenSwap}
            />
          ))}
        </div>
      </div>

      {/* Swap Modal */}
      <SwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        meal={swapTargetMeal}
        onSwapCompleted={handleMealUpdate}
      />
    </div>
  );
}
