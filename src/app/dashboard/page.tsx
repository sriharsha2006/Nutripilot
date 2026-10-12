"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { onboardingApi, UserProfile } from "@/lib/api/onboarding";
import { plannerApi, WeeklyPlan, MealSlot } from "@/lib/api/planner";
import {
  Flame,
  Utensils,
  ShoppingCart,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  PackageCheck,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profData, planData] = await Promise.all([
        onboardingApi.getProfile(),
        plannerApi.getWeeklyPlan(),
      ]);
      setProfile(profData);
      setWeeklyPlan(planData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEaten = async (mealId: string, currentEaten?: boolean) => {
    try {
      const updated = await plannerApi.toggleMealEaten(mealId, !currentEaten);
      if (weeklyPlan) {
        const updatedDays = weeklyPlan.days.map((day) => ({
          ...day,
          meals: day.meals.map((m) => (m.id === mealId ? updated : m)),
        }));
        setWeeklyPlan({ ...weeklyPlan, days: updatedDays });
      }
    } catch (err) {
      console.error("Failed to update eaten state:", err);
    }
  };

  if (isLoading || !profile || !weeklyPlan) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Pick Monday or current day as today's plan
  const todayPlan = weeklyPlan.days[0];
  const eatenMealsCount = todayPlan.meals.filter((m) => m.eaten).length;

  const totalPlannedCal = todayPlan.totalCalories;
  const eatenCalories = todayPlan.meals
    .filter((m) => m.eaten)
    .reduce((sum, m) => sum + Math.round(m.recipe.calories * m.servings), 0);

  const calProgress = Math.round((eatenCalories / profile.calculatedNutrition.targetCalories) * 100);

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-emerald-700 text-primary-foreground p-6 sm:p-8 shadow-md">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Welcome back, {profile.name || "Alex"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Your Nutrition Dashboard
          </h1>
          <p className="text-sm text-white/90 leading-relaxed">
            Targeting <span className="font-bold">{profile.calculatedNutrition.targetCalories} kcal/day</span> for your{" "}
            <span className="capitalize font-semibold">{profile.goal}</span> weight goal.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              onClick={() => router.push("/planner")}
              variant="secondary"
              className="gap-2 bg-white text-primary hover:bg-white/90 font-semibold"
            >
              Open 7-Day Planner <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => router.push("/profile")}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Adjust Targets
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Calories Card */}
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between items-center">
              <span>Energy Intake</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {eatenCalories} <span className="text-xs font-normal text-muted-foreground">/ {profile.calculatedNutrition.targetCalories} kcal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <Progress value={calProgress} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              {eatenMealsCount} of 4 meals logged today
            </p>
          </CardContent>
        </Card>

        {/* Protein Card */}
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between items-center">
              <span>Protein</span>
              <span className="text-xs font-semibold text-emerald-600">Goal: {profile.calculatedNutrition.macros.proteinGrams}g</span>
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {todayPlan.totalProtein}g
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">
              {profile.calculatedNutrition.macros.proteinPct}% of total daily calories
            </p>
          </CardContent>
        </Card>

        {/* Carbs Card */}
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between items-center">
              <span>Carbohydrates</span>
              <span className="text-xs font-semibold text-blue-600">Goal: {profile.calculatedNutrition.macros.carbsGrams}g</span>
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todayPlan.totalCarbs}g
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">
              {profile.calculatedNutrition.macros.carbsPct}% of total daily calories
            </p>
          </CardContent>
        </Card>

        {/* Fat Card */}
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between items-center">
              <span>Healthy Fats</span>
              <span className="text-xs font-semibold text-amber-600">Goal: {profile.calculatedNutrition.macros.fatGrams}g</span>
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {todayPlan.totalFat}g
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">
              {profile.calculatedNutrition.macros.fatPct}% of total daily calories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Today's Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Meals */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Today's Meal Schedule
              </CardTitle>
              <CardDescription>Click checkmark to log meals eaten</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/planner")}>
              View Full Week
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {todayPlan.meals.map((meal) => {
              const calories = Math.round(meal.recipe.calories * meal.servings);
              return (
                <div
                  key={meal.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    meal.eaten ? "bg-muted/40 border-muted text-muted-foreground" : "bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleEaten(meal.id, meal.eaten)}
                      className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                        meal.eaten
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-muted-foreground/40 hover:border-emerald-500"
                      }`}
                    >
                      {meal.eaten && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] capitalize py-0">
                          {meal.mealType}
                        </Badge>
                        <span className={`font-semibold text-sm ${meal.eaten ? "line-through" : ""}`}>
                          {meal.recipe.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        P: {Math.round(meal.recipe.proteinGrams * meal.servings)}g | C: {Math.round(meal.recipe.carbsGrams * meal.servings)}g | F: {Math.round(meal.recipe.fatGrams * meal.servings)}g
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm">{calories} kcal</div>
                    <div className="text-[10px] text-muted-foreground">{meal.servings} serving(s)</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Navigation & Stats */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" /> Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/planner" className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" /> 7-Day Meal Planner
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link href="/pantry" className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <PackageCheck className="h-4 w-4 text-primary" /> Pantry Inventory
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link href="/grocery" className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShoppingCart className="h-4 w-4 text-primary" /> Smart Grocery List
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link href="/profile" className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sliders className="h-4 w-4 text-primary" /> Profile & Macro Targets
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <DollarSign className="h-4 w-4" /> Weekly Budget Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-black">${profile.weeklyBudget} USD</div>
              <p className="text-xs text-muted-foreground">
                Configured weekly budget for {profile.householdSize} person household. Pantry items are auto-subtracted during grocery list generation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
