"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MealSlot, plannerApi } from "@/lib/api/planner";
import {
  Lock,
  Unlock,
  RefreshCw,
  ArrowRightLeft,
  Clock,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Sparkles,
  Utensils,
} from "lucide-react";

interface MealCardProps {
  meal: MealSlot;
  onUpdate: (updatedMeal: MealSlot) => void;
  onOpenSwap: (meal: MealSlot) => void;
}

export function MealCard({ meal, onUpdate, onOpenSwap }: MealCardProps) {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const { recipe, servings, isLocked, eaten } = meal;
  const calories = Math.round(recipe.calories * servings);
  const protein = Math.round(recipe.proteinGrams * servings);
  const carbs = Math.round(recipe.carbsGrams * servings);
  const fat = Math.round(recipe.fatGrams * servings);

  const handleToggleLock = async () => {
    setIsLocking(true);
    try {
      const res = await plannerApi.toggleMealLock(meal.id);
      onUpdate({ ...meal, isLocked: res.isLocked });
    } catch (err) {
      console.error("Failed to lock/unlock meal:", err);
    } finally {
      setIsLocking(false);
    }
  };

  const handleRefresh = async () => {
    if (isLocked) return;
    setIsRefreshing(true);
    try {
      const updated = await plannerApi.refreshMeal(meal.id);
      onUpdate(updated);
    } catch (err) {
      console.error("Failed to refresh meal:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleServingChange = async (delta: number) => {
    const newServings = Math.max(0.5, Math.min(5, Math.round((servings + delta) * 10) / 10));
    try {
      const updated = await plannerApi.updateServingSize(meal.id, newServings);
      onUpdate(updated);
    } catch (err) {
      console.error("Failed to update servings:", err);
    }
  };

  const handleToggleEaten = async () => {
    try {
      const updated = await plannerApi.toggleMealEaten(meal.id, !eaten);
      onUpdate(updated);
    } catch (err) {
      console.error("Failed to toggle eaten status:", err);
    }
  };

  const mealTypeLabels: Record<string, { label: string; bg: string }> = {
    breakfast: { label: "Breakfast", bg: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    lunch: { label: "Lunch", bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    dinner: { label: "Dinner", bg: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    snack: { label: "Snack", bg: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  };

  const typeConfig = mealTypeLabels[meal.mealType] || { label: meal.mealType, bg: "bg-muted text-foreground" };

  return (
    <Card className={`border shadow-sm transition-all ${eaten ? "opacity-75 bg-muted/20" : "bg-card hover:shadow-md"}`}>
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`capitalize font-semibold text-xs py-0.5 ${typeConfig.bg}`}>
              {typeConfig.label}
            </Badge>
            {isLocked && (
              <Badge variant="secondary" className="gap-1 text-[10px] py-0">
                <Lock className="h-2.5 w-2.5" /> Locked
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleToggleLock}
              disabled={isLocking}
              title={isLocked ? "Unlock meal (allows full plan regeneration)" : "Lock meal (prevents overwrite)"}
            >
              {isLocked ? <Lock className="h-3.5 w-3.5 text-primary" /> : <Unlock className="h-3.5 w-3.5 text-muted-foreground" />}
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleRefresh}
              disabled={isLocked || isRefreshing}
              title="Refresh with new AI recommendation"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onOpenSwap(meal)}
              title="Swap recipe"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <CardTitle className="text-base font-bold pt-2 leading-tight flex items-start justify-between gap-2">
          <span className={eaten ? "line-through text-muted-foreground" : ""}>{recipe.title}</span>
          <button
            onClick={handleToggleEaten}
            className={`shrink-0 rounded-full p-0.5 transition-colors ${
              eaten ? "text-emerald-500" : "text-muted-foreground/40 hover:text-emerald-500"
            }`}
            title={eaten ? "Mark as eaten" : "Mark eaten"}
          >
            <CheckCircle2 className="h-5 w-5" />
          </button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-1 space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{recipe.description}</p>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-muted/40 text-center text-xs">
          <div>
            <div className="text-[10px] text-muted-foreground">Calories</div>
            <div className="font-bold text-orange-600 dark:text-orange-400">{calories}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Protein</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">{protein}g</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Carbs</div>
            <div className="font-bold text-blue-600 dark:text-blue-400">{carbs}g</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Fat</div>
            <div className="font-bold text-amber-600 dark:text-amber-400">{fat}g</div>
          </div>
        </div>

        {/* Serving Adjustment & Time */}
        <div className="flex justify-between items-center text-xs pt-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-lg">
            <span className="text-[11px] text-muted-foreground">Servings:</span>
            <Button variant="ghost" size="icon-xs" onClick={() => handleServingChange(-0.5)}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-semibold text-xs px-1">{servings}</span>
            <Button variant="ghost" size="icon-xs" onClick={() => handleServingChange(0.5)}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Collapsible Recipe Details & AI Explanation */}
        <div className="border-t pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-primary font-medium flex items-center justify-between w-full hover:underline"
          >
            <span>{showDetails ? "Hide Ingredients & Recipe" : "View Ingredients & AI Rationale"}</span>
            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-2 space-y-3 text-xs animate-in fade-in">
              {recipe.explanation && (
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 text-primary">
                  <div className="font-semibold flex items-center gap-1 text-[11px]">
                    <Sparkles className="h-3 w-3" /> NutriPilot AI Recommendation
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">{recipe.explanation}</p>
                </div>
              )}

              <div>
                <div className="font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                  <Utensils className="h-3 w-3" /> Ingredients ({recipe.ingredients.length})
                </div>
                <ul className="space-y-1 pl-1">
                  {recipe.ingredients.map((ing) => (
                    <li key={ing.id} className="flex justify-between items-center text-[11px]">
                      <span>{ing.name}</span>
                      <span className="text-muted-foreground">
                        {(ing.amount * servings).toFixed(1)} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold text-muted-foreground mb-1">Preparation Steps</div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-muted-foreground">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
