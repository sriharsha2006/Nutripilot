"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DailyTrackingEntry, trackingApi } from "@/lib/api/tracking";
import { plannerApi, WeeklyPlan } from "@/lib/api/planner";
import {
  Droplet,
  Scale,
  CheckCircle2,
  Calendar,
  Plus,
  Minus,
  TrendingDown,
  Sparkles,
  Flame,
  Utensils,
  Notebook,
} from "lucide-react";

export default function TrackingPage() {
  const [tracking, setTracking] = useState<DailyTrackingEntry | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Weight Input state
  const [weightInput, setWeightInput] = useState<string>("");
  const [isLoggingWeight, setIsLoggingWeight] = useState<boolean>(false);
  const [notesInput, setNotesInput] = useState<string>("");

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    setIsLoading(true);
    try {
      const [trackData, planData] = await Promise.all([
        trackingApi.getDailyTracking(),
        plannerApi.getWeeklyPlan(),
      ]);
      setTracking(trackData);
      setWeeklyPlan(planData);
      if (trackData.weight) {
        setWeightInput(trackData.weight.weightKg.toString());
      }
    } catch (err) {
      console.error("Failed to load tracking data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWaterDelta = async (deltaMl: number) => {
    if (!tracking) return;
    try {
      const updatedWater = await trackingApi.logWater(deltaMl);
      setTracking({ ...tracking, water: updatedWater });
    } catch (err) {
      console.error("Failed to log water:", err);
    }
  };

  const handleLogWeight = async () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0 || !tracking) return;
    setIsLoggingWeight(true);
    try {
      const updatedWeight = await trackingApi.logWeight(val, notesInput);
      setTracking({ ...tracking, weight: updatedWeight });
    } catch (err) {
      console.error("Failed to log weight:", err);
    } finally {
      setIsLoggingWeight(false);
    }
  };

  const handleToggleMealEaten = async (mealId: string, currentEaten?: boolean) => {
    if (!weeklyPlan) return;
    try {
      const updatedMeal = await plannerApi.toggleMealEaten(mealId, !currentEaten);
      const updatedDays = weeklyPlan.days.map((day) => ({
        ...day,
        meals: day.meals.map((m) => (m.id === mealId ? updatedMeal : m)),
      }));
      setWeeklyPlan({ ...weeklyPlan, days: updatedDays });
    } catch (err) {
      console.error("Failed to toggle meal eaten state:", err);
    }
  };

  if (isLoading || !tracking || !weeklyPlan) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading daily tracking dashboard...</p>
      </div>
    );
  }

  const { water, weight } = tracking;
  const waterPct = Math.min(100, Math.round((water.amountMl / (water.targetMl || 2000)) * 100));

  const todayMeals = weeklyPlan.days[0].meals;
  const eatenCount = todayMeals.filter((m) => m.eaten).length;

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <Calendar className="h-3.5 w-3.5" /> Daily Tracking Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Daily Habit & Food Tracker</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log water intake, body weight, and confirm meals eaten for accuracy analytics.
          </p>
        </div>

        <Badge variant="outline" className="text-xs py-1 px-3 gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Today's Log: {eatenCount}/4 Meals
        </Badge>
      </div>

      {/* Grid: Hydration & Weight Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HYDRATION TRACKER WIDGET */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-500" /> Hydration Tracker
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">
                {water.amountMl} / {water.targetMl} ml
              </Badge>
            </div>
            <CardDescription>Target: 8 glasses (2,000 ml) daily water intake</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-blue-600 dark:text-blue-400">{waterPct}% Achieved</span>
                <span>{water.targetMl - water.amountMl > 0 ? `${water.targetMl - water.amountMl} ml remaining` : "Target Achieved! 🎉"}</span>
              </div>
              <Progress value={waterPct} className="h-3 bg-blue-500/20" indicatorClassName="bg-blue-500" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWaterDelta(250)}
                className="gap-1.5 flex-1 hover:border-blue-500 hover:text-blue-600"
              >
                <Plus className="h-3.5 w-3.5 text-blue-500" /> +250 ml (1 Glass)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWaterDelta(500)}
                className="gap-1.5 flex-1 hover:border-blue-500 hover:text-blue-600"
              >
                <Plus className="h-3.5 w-3.5 text-blue-500" /> +500 ml (1 Bottle)
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleWaterDelta(-250)}
                className="gap-1 text-muted-foreground"
              >
                <Minus className="h-3.5 w-3.5" /> -250 ml
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WEIGHT LOGGER WIDGET */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-500" /> Body Weight Logger
              </CardTitle>
              {weight && (
                <Badge variant="accent" className="font-mono text-xs">
                  Latest: {weight.weightKg} kg
                </Badge>
              )}
            </div>
            <CardDescription>Track daily weigh-ins to monitor progress trajectory</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="weightInput" className="text-xs">
                  Weigh-In (kg)
                </Label>
                <Input
                  id="weightInput"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 65.4"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={handleLogWeight} disabled={isLoggingWeight || !weightInput} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {isLoggingWeight ? "Logging..." : "Log Weight"}
                </Button>
              </div>
            </div>

            {weight && (
              <div className="p-3 rounded-xl bg-muted/40 border text-xs flex justify-between items-center">
                <span className="text-muted-foreground">Recorded: {new Date(weight.date).toLocaleDateString()}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" /> Progressing towards target
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Meal Logging Checklist */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" /> Today's Meal Intake Confirmation
          </CardTitle>
          <CardDescription>Mark meals eaten to calculate daily macro compliance</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {todayMeals.map((meal) => {
            const calories = Math.round(meal.recipe.calories * meal.servings);
            return (
              <div
                key={meal.id}
                onClick={() => handleToggleMealEaten(meal.id, meal.eaten)}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  meal.eaten
                    ? "bg-muted/40 border-muted text-muted-foreground"
                    : "bg-card hover:border-muted-foreground/30 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                      meal.eaten
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-muted-foreground/40 hover:border-emerald-500"
                    }`}
                  >
                    {meal.eaten && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize py-0">
                        {meal.mealType}
                      </Badge>
                      <span className={`font-bold text-sm ${meal.eaten ? "line-through" : ""}`}>
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
    </div>
  );
}
