"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SwapOption, MealSlot, plannerApi } from "@/lib/api/planner";
import { RefreshCw, Search, Check, Sparkles, Clock, Flame, Utensils } from "lucide-react";

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: MealSlot | null;
  onSwapCompleted: (updatedMeal: MealSlot) => void;
}

export function SwapModal({ isOpen, onClose, meal, onSwapCompleted }: SwapModalProps) {
  const [options, setOptions] = useState<SwapOption[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && meal) {
      fetchOptions();
    }
  }, [isOpen, meal]);

  const fetchOptions = async () => {
    if (!meal) return;
    setIsLoading(true);
    try {
      const data = await plannerApi.getSwapOptions(meal.id);
      setOptions(data);
    } catch (err) {
      console.error("Failed to fetch swap options:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSwap = async () => {
    if (!meal || !selectedRecipeId) return;
    setIsSwapping(true);
    try {
      const updated = await plannerApi.swapMeal(meal.id, selectedRecipeId);
      onSwapCompleted(updated);
      onClose();
    } catch (err) {
      console.error("Failed to execute swap:", err);
    } finally {
      setIsSwapping(false);
    }
  };

  const filteredOptions = options.filter(
    (opt) =>
      opt.recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.recipe.dietaryTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" /> Swap {meal?.mealType ? meal.mealType.toUpperCase() : "Meal"}
          </DialogTitle>
          <DialogDescription>
            Choose an alternative recipe matched to your calorie and macro targets.
          </DialogDescription>
        </DialogHeader>

        {/* Current Recipe Preview */}
        {meal && (
          <div className="bg-muted/40 p-3 rounded-xl border flex justify-between items-center text-xs">
            <div>
              <span className="text-muted-foreground">Current: </span>
              <span className="font-semibold text-foreground">{meal.recipe.title}</span>
            </div>
            <Badge variant="outline">{meal.recipe.calories} kcal</Badge>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes or dietary tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Recipe Cards List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground animate-pulse">
              Finding macro-matched alternatives...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No matching alternative recipes found.
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = selectedRecipeId === opt.recipe.id;
              return (
                <div
                  key={opt.recipe.id}
                  onClick={() => setSelectedRecipeId(opt.recipe.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row justify-between gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "hover:border-muted-foreground/30 bg-card"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{opt.recipe.title}</span>
                      {opt.macroMatchScore >= 85 && (
                        <Badge variant="accent" className="text-[10px] py-0 px-1.5">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" /> {opt.macroMatchScore}% Macro Match
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{opt.recipe.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {opt.recipe.dietaryTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between items-end gap-1 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="font-bold text-sm">{opt.recipe.calories} kcal</div>
                    <div className="text-[11px] text-muted-foreground">
                      P: {opt.recipe.proteinGrams}g | C: {opt.recipe.carbsGrams}g | F: {opt.recipe.fatGrams}g
                    </div>
                    <div className="text-[11px] flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {opt.recipe.prepTimeMinutes + opt.recipe.cookTimeMinutes}m
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="border-t pt-3 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSwapping}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSwap} disabled={!selectedRecipeId || isSwapping} className="gap-2">
            {isSwapping ? "Swapping..." : "Confirm Swap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
