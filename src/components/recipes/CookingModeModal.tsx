"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Recipe } from "@/lib/api/planner";
import {
  ChefHat,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Flame,
  Utensils,
  Check,
} from "lucide-react";

interface CookingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}

export function CookingModeModal({ isOpen, onClose, recipe }: CookingModeModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCheckedIngredients({});
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [isOpen, recipe]);

  // Timer Interval Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!recipe) return null;

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const instructions = recipe.instructions;
  const isLastStep = currentStep === instructions.length - 1;
  const progressPct = Math.round(((currentStep + 1) / instructions.length) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        {/* Full-Screen Header */}
        <div className="flex justify-between items-center p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  Cooking Mode
                </Badge>
                <span className="text-xs text-muted-foreground">• Prep {recipe.prepTimeMinutes}m | Cook {recipe.cookTimeMinutes}m</span>
              </div>
              <h2 className="text-lg font-bold">{recipe.title}</h2>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Line */}
        <Progress value={progressPct} className="h-1 rounded-none" />

        {/* Split Body: Ingredients Checklist Left & Active Step Right */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* LEFT: Ingredients Checklist */}
          <div className="p-4 border-r bg-muted/20 overflow-y-auto space-y-4">
            <div className="font-bold text-sm flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-1.5">
                <Utensils className="h-4 w-4 text-primary" /> Prep Ingredients
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                {Object.values(checkedIngredients).filter(Boolean).length}/{recipe.ingredients.length}
              </span>
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map((ing) => {
                const isChecked = !!checkedIngredients[ing.id];
                return (
                  <div
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isChecked ? "bg-muted text-muted-foreground line-through opacity-70" : "bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                      <span className="font-medium">{ing.name}</span>
                    </div>

                    <span className="font-bold text-[11px]">
                      {ing.amount} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Built-In Step Timer Widget */}
            <div className="p-4 rounded-2xl border bg-card space-y-3 mt-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" /> Kitchen Timer
                </span>
                <span className="font-mono text-base font-black text-primary">{formatTime(timerSeconds)}</span>
              </div>

              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant={isTimerRunning ? "secondary" : "default"}
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  disabled={timerSeconds === 0}
                  className="flex-1 gap-1 text-xs"
                >
                  {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {isTimerRunning ? "Pause" : "Start"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTimerSeconds(0);
                    setIsTimerRunning(false);
                  }}
                  className="text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex gap-1 pt-1">
                {[1, 3, 5, 10].map((m) => (
                  <button
                    key={m}
                    onClick={() => startTimer(m)}
                    className="flex-1 py-1 rounded bg-muted/60 hover:bg-muted text-[10px] font-semibold"
                  >
                    +{m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Active Step Instructions */}
          <div className="md:col-span-2 p-6 overflow-y-auto flex flex-col justify-between space-y-6 bg-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="accent" className="text-xs py-1 px-3">
                  Step {currentStep + 1} of {instructions.length}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{progressPct}% Complete</span>
              </div>

              <div className="text-xl sm:text-2xl font-bold leading-relaxed text-foreground border-l-4 border-primary pl-4 py-1">
                {instructions[currentStep]}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Step
              </Button>

              {isLastStep ? (
                <Button onClick={onClose} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  Finish Cooking <CheckCircle2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setCurrentStep((prev) => Math.min(instructions.length - 1, prev + 1))} className="gap-2">
                  Next Step <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
