"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Dumbbell, Wheat, Droplet, CheckCircle, AlertCircle } from "lucide-react";

interface MacroSummaryBarProps {
  currentCalories: number;
  targetCalories: number;
  currentProtein: number;
  targetProtein: number;
  currentCarbs: number;
  targetCarbs: number;
  currentFat: number;
  targetFat: number;
  dayName?: string;
}

export function MacroSummaryBar({
  currentCalories,
  targetCalories,
  currentProtein,
  targetProtein,
  currentCarbs,
  targetCarbs,
  currentFat,
  targetFat,
  dayName,
}: MacroSummaryBarProps) {
  const calPct = Math.round((currentCalories / (targetCalories || 1)) * 100);
  const proteinPct = Math.round((currentProtein / (targetProtein || 1)) * 100);
  const carbsPct = Math.round((currentCarbs / (targetCarbs || 1)) * 100);
  const fatPct = Math.round((currentFat / (targetFat || 1)) * 100);

  const calDiff = currentCalories - targetCalories;
  const isOptimalCal = Math.abs(calDiff) <= 100;

  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span>{dayName ? `${dayName} Macro Target Summary` : "Daily Nutrition Target"}</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Planned vs. personalized metabolic target breakdown
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOptimalCal ? (
            <Badge variant="accent" className="gap-1 py-1 px-3">
              <CheckCircle className="h-3.5 w-3.5" /> Optimal Target Compliance ({calPct}%)
            </Badge>
          ) : calDiff > 0 ? (
            <Badge variant="destructive" className="gap-1 py-1 px-3">
              <AlertCircle className="h-3.5 w-3.5" /> +{calDiff} kcal over target
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 py-1 px-3">
              {Math.abs(calDiff)} kcal under target
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
              <Flame className="h-4 w-4" /> Energy
            </span>
            <span className="text-muted-foreground font-mono">{calPct}%</span>
          </div>
          <div className="text-xl font-bold tracking-tight">
            {currentCalories} <span className="text-xs font-normal text-muted-foreground">/ {targetCalories} kcal</span>
          </div>
          <Progress value={calPct} className="h-1.5 bg-orange-500/20" indicatorClassName="bg-orange-500" />
        </div>

        {/* Protein */}
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4" /> Protein
            </span>
            <span className="text-muted-foreground font-mono">{proteinPct}%</span>
          </div>
          <div className="text-xl font-bold tracking-tight">
            {currentProtein}g <span className="text-xs font-normal text-muted-foreground">/ {targetProtein}g</span>
          </div>
          <Progress value={proteinPct} className="h-1.5 bg-emerald-500/20" indicatorClassName="bg-emerald-500" />
        </div>

        {/* Carbs */}
        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Wheat className="h-4 w-4" /> Carbs
            </span>
            <span className="text-muted-foreground font-mono">{carbsPct}%</span>
          </div>
          <div className="text-xl font-bold tracking-tight">
            {currentCarbs}g <span className="text-xs font-normal text-muted-foreground">/ {targetCarbs}g</span>
          </div>
          <Progress value={carbsPct} className="h-1.5 bg-blue-500/20" indicatorClassName="bg-blue-500" />
        </div>

        {/* Fat */}
        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Droplet className="h-4 w-4" /> Fats
            </span>
            <span className="text-muted-foreground font-mono">{fatPct}%</span>
          </div>
          <div className="text-xl font-bold tracking-tight">
            {currentFat}g <span className="text-xs font-normal text-muted-foreground">/ {targetFat}g</span>
          </div>
          <Progress value={fatPct} className="h-1.5 bg-amber-500/20" indicatorClassName="bg-amber-500" />
        </div>
      </div>
    </div>
  );
}
