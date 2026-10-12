"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { onboardingApi, CalculatedNutrition, OnboardingData, MacroTarget } from "@/lib/api/onboarding";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Scale,
  Flame,
  Utensils,
  DollarSign,
  Users,
  Activity,
  Apple,
  ShieldAlert,
  Sliders,
  CheckCircle2,
} from "lucide-react";

const DIET_OPTIONS = [
  "Standard",
  "High-Protein",
  "Low-Carb",
  "Keto",
  "Vegetarian",
  "Vegan",
  "Mediterranean",
  "Paleo",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
];

const ALLERGY_OPTIONS = [
  "Peanuts",
  "Tree Nuts",
  "Milk/Dairy",
  "Eggs",
  "Gluten/Wheat",
  "Soy",
  "Shellfish",
  "Fish",
  "Sesame",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<OnboardingData>({
    age: 28,
    gender: "female",
    weightKg: 68,
    heightCm: 168,
    activityLevel: "moderate",
    goal: "lose",
    targetPace: 0.5,
    targetWeightKg: 62,
    dietaryPreferences: ["High-Protein", "Gluten-Free"],
    allergies: ["Peanuts"],
    dislikedIngredients: [],
    weeklyBudget: 120,
    householdSize: 2,
    cookingSkill: "intermediate",
    maxPrepTimeMinutes: 30,
  });

  const [dislikedInput, setDislikedInput] = useState<string>("");

  // Calculated State
  const [nutrition, setNutrition] = useState<CalculatedNutrition | null>(null);
  const [customMacros, setCustomMacros] = useState<MacroTarget>({
    carbsPct: 50,
    proteinPct: 25,
    fatPct: 25,
    carbsGrams: 200,
    proteinGrams: 100,
    fatGrams: 45,
  });

  // Calculate live nutrition baseline on Step 1 & 2 changes or step 5 mount
  const fetchNutrition = async () => {
    setIsCalculating(true);
    try {
      const result = await onboardingApi.calculateNutrition({
        age: formData.age,
        gender: formData.gender,
        weightKg: formData.weightKg,
        heightCm: formData.heightCm,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        targetPace: formData.targetPace,
      });
      setNutrition(result);
      setCustomMacros(result.macros);
    } catch (err) {
      console.error("Failed to calculate nutrition baseline:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, [formData.age, formData.gender, formData.weightKg, formData.heightCm, formData.activityLevel, formData.goal, formData.targetPace]);

  // Adjust grams when custom macro slider percentage changes
  const updateMacroPercentages = (carbsPct: number, proteinPct: number, fatPct: number) => {
    if (!nutrition) return;
    const calories = nutrition.targetCalories;
    const carbsGrams = Math.round((calories * (carbsPct / 100)) / 4);
    const proteinGrams = Math.round((calories * (proteinPct / 100)) / 4);
    const fatGrams = Math.round((calories * (fatPct / 100)) / 9);

    setCustomMacros({
      carbsPct,
      proteinPct,
      fatPct,
      carbsGrams,
      proteinGrams,
      fatGrams,
    });
  };

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const togglePreference = (pref: string) => {
    setFormData((prev) => {
      const exists = prev.dietaryPreferences.includes(pref);
      return {
        ...prev,
        dietaryPreferences: exists
          ? prev.dietaryPreferences.filter((p) => p !== pref)
          : [...prev.dietaryPreferences, pref],
      };
    });
  };

  const toggleAllergy = (allergy: string) => {
    setFormData((prev) => {
      const exists = prev.allergies.includes(allergy);
      return {
        ...prev,
        allergies: exists ? prev.allergies.filter((a) => a !== allergy) : [...prev.allergies, allergy],
      };
    });
  };

  const addDislikedIngredient = () => {
    if (!dislikedInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      dislikedIngredients: [...prev.dislikedIngredients, dislikedInput.trim()],
    }));
    setDislikedInput("");
  };

  const removeDislikedIngredient = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      dislikedIngredients: prev.dislikedIngredients.filter((i) => i !== tag),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onboardingApi.submitOnboarding({
        ...formData,
        customMacros,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save onboarding:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/30 py-10 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" /> Personalized Setup
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome to NutriPilot
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Let's configure your metabolic baseline, dietary guidelines, and tailored nutrition plan.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground px-1">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && "Biometrics & Activity"}
              {step === 2 && "Goals & Targets"}
              {step === 3 && "Diet & Allergies"}
              {step === 4 && "Budget & Prep"}
              {step === 5 && "Nutrition Target Review"}
            </span>
          </div>
          <Progress value={(step / 5) * 100} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="border shadow-lg backdrop-blur-sm bg-card/80">
          <CardContent className="pt-6">
            {/* STEP 1: Biometrics & Activity */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" /> Personal Metrics & Baseline
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    We use the Mifflin-St Jeor equation to estimate your basal metabolic rate.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      min={14}
                      max={100}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Biological Sex</Label>
                    <Select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      options={[
                        { label: "Female", value: "female" },
                        { label: "Male", value: "male" },
                        { label: "Other / Prefer not to say", value: "other" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min={100}
                      max={250}
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Current Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min={30}
                      max={250}
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Daily Activity Level</Label>
                  <Select
                    id="activity"
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                    options={[
                      { label: "Sedentary (Desk job, little/no exercise)", value: "sedentary" },
                      { label: "Lightly Active (1-3 days/week exercise)", value: "light" },
                      { label: "Moderately Active (3-5 days/week exercise)", value: "moderate" },
                      { label: "Very Active (6-7 days/week intense exercise)", value: "active" },
                      { label: "Extra Active (Physical labor or 2x/day training)", value: "very_active" },
                    ]}
                  />
                </div>

                {nutrition && (
                  <div className="p-4 rounded-xl bg-muted/50 border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="h-6 w-6 text-orange-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Estimated TDEE</div>
                        <div className="font-semibold text-lg">{nutrition.tdee} kcal / day</div>
                      </div>
                    </div>
                    <Badge variant="outline">BMR: {nutrition.bmr} kcal</Badge>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Goals & Target Pace */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Primary Health & Weight Goal
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select your primary objective to calculate calorie deficit or surplus.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "lose", title: "Lose Weight", desc: "Sustainable fat loss deficit" },
                    { id: "maintain", title: "Maintain Weight", desc: "Energy & macro balance" },
                    { id: "gain", title: "Build Muscle", desc: "Lean surplus for growth" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: g.id as any })}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        formData.goal === g.id
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "hover:border-muted-foreground/30 bg-background"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-base flex justify-between items-center">
                          {g.title}
                          {formData.goal === g.id && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{g.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {formData.goal !== "maintain" && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                        <Input
                          id="targetWeight"
                          type="number"
                          value={formData.targetWeightKg || formData.weightKg}
                          onChange={(e) =>
                            setFormData({ ...formData, targetWeightKg: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pace (kg per week)</Label>
                        <Select
                          value={formData.targetPace?.toString()}
                          onChange={(e) =>
                            setFormData({ ...formData, targetPace: Number(e.target.value) })
                          }
                          options={[
                            { label: "Slow & Steady (0.25 kg/wk)", value: "0.25" },
                            { label: "Recommended (0.5 kg/wk)", value: "0.5" },
                            { label: "Aggressive (0.75 kg/wk)", value: "0.75" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {nutrition && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                    <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Target Energy Recommendation
                    </div>
                    <div className="text-2xl font-bold">{nutrition.targetCalories} kcal / day</div>
                    <p className="text-xs text-muted-foreground">
                      {formData.goal === "lose" && `Daily deficit of ${nutrition.tdee - nutrition.targetCalories} kcal for fat loss.`}
                      {formData.goal === "gain" && `Daily surplus of ${nutrition.targetCalories - nutrition.tdee} kcal for muscle growth.`}
                      {formData.goal === "maintain" && "Maintenance intake matching your daily expenditure."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Diet & Allergies */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" /> Dietary Preferences & Restrictions
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Customize recipes and meal swaps to align with your diet and avoid allergens.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Dietary Guidelines</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIET_OPTIONS.map((opt) => {
                      const isSelected = formData.dietaryPreferences.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => togglePreference(opt)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-muted/40 hover:bg-muted text-foreground border-transparent"
                          }`}
                        >
                          {isSelected && "✓ "}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-destructive" /> Allergies & Intolerances
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGY_OPTIONS.map((allergy) => {
                      const isSelected = formData.allergies.includes(allergy);
                      return (
                        <button
                          key={allergy}
                          type="button"
                          onClick={() => toggleAllergy(allergy)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
                              : "bg-muted/40 hover:bg-muted text-foreground border-transparent"
                          }`}
                        >
                          {isSelected && "⚠ "}
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="disliked">Disliked Ingredients (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="disliked"
                      placeholder="e.g. Mushrooms, Olives"
                      value={dislikedInput}
                      onChange={(e) => setDislikedInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDislikedIngredient())}
                    />
                    <Button type="button" variant="secondary" onClick={addDislikedIngredient}>
                      Add
                    </Button>
                  </div>
                  {formData.dislikedIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.dislikedIngredients.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1 cursor-pointer" onClick={() => removeDislikedIngredient(tag)}>
                          {tag} <span className="text-xs font-bold text-muted-foreground">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Budget & Prep */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" /> Budget & Meal Prep Logistics
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Ensure generated grocery lists and meal plans fit your lifestyle and wallet.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Weekly Food Budget ($ USD)</Label>
                    <div className="relative">
                      <Input
                        id="budget"
                        type="number"
                        min={30}
                        max={1000}
                        value={formData.weeklyBudget}
                        onChange={(e) => setFormData({ ...formData, weeklyBudget: Number(e.target.value) })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Approx. ${(formData.weeklyBudget / 7).toFixed(1)}/day</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="household" className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> Household Size
                    </Label>
                    <Input
                      id="household"
                      type="number"
                      min={1}
                      max={12}
                      value={formData.householdSize}
                      onChange={(e) => setFormData({ ...formData, householdSize: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Quantities will scale per meal</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="skill">Cooking Skill Level</Label>
                    <Select
                      id="skill"
                      value={formData.cookingSkill}
                      onChange={(e) => setFormData({ ...formData, cookingSkill: e.target.value as any })}
                      options={[
                        { label: "Beginner (Simple 15-min recipes)", value: "beginner" },
                        { label: "Intermediate (Standard home cooking)", value: "intermediate" },
                        { label: "Advanced (Complex techniques)", value: "advanced" },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preptime">Target Max Prep Time (Minutes)</Label>
                    <Select
                      id="preptime"
                      value={formData.maxPrepTimeMinutes.toString()}
                      onChange={(e) => setFormData({ ...formData, maxPrepTimeMinutes: Number(e.target.value) })}
                      options={[
                        { label: "15 Minutes (Quick & Easy)", value: "15" },
                        { label: "30 Minutes (Standard)", value: "30" },
                        { label: "45 Minutes (Gourmet Batching)", value: "45" },
                        { label: "60+ Minutes", value: "60" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Nutrition Target Review & Fine-Tuning */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" /> Target Review & Macro Fine-Tuning
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Review your baseline target calories and adjust your macronutrient distribution.
                  </p>
                </div>

                {nutrition && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl border bg-card">
                      <div className="text-xs text-muted-foreground">Daily Calories</div>
                      <div className="text-2xl font-black text-primary">{nutrition.targetCalories} kcal</div>
                    </div>
                    <div className="p-3 rounded-xl border bg-card">
                      <div className="text-xs text-muted-foreground">Protein Target</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{customMacros.proteinGrams}g</div>
                      <div className="text-[10px] text-muted-foreground">{customMacros.proteinPct}% calories</div>
                    </div>
                    <div className="p-3 rounded-xl border bg-card">
                      <div className="text-xs text-muted-foreground">Carbs Target</div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{customMacros.carbsGrams}g</div>
                      <div className="text-[10px] text-muted-foreground">{customMacros.carbsPct}% calories</div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-blue-600 dark:text-blue-400">Carbohydrates ({customMacros.carbsPct}%)</span>
                      <span>{customMacros.carbsGrams} grams</span>
                    </div>
                    <Slider
                      value={customMacros.carbsPct}
                      min={10}
                      max={70}
                      step={5}
                      onChange={(val) => {
                        const rem = 100 - val;
                        const pPct = Math.round(rem * 0.5);
                        const fPct = rem - pPct;
                        updateMacroPercentages(val, pPct, fPct);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400">Protein ({customMacros.proteinPct}%)</span>
                      <span>{customMacros.proteinGrams} grams</span>
                    </div>
                    <Slider
                      value={customMacros.proteinPct}
                      min={15}
                      max={60}
                      step={5}
                      onChange={(val) => {
                        const rem = 100 - val;
                        const cPct = Math.round(rem * 0.6);
                        const fPct = rem - cPct;
                        updateMacroPercentages(cPct, val, fPct);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-amber-600 dark:text-amber-400">Fats ({customMacros.fatPct}%)</span>
                      <span>{customMacros.fatGrams} grams</span>
                    </div>
                    <Slider
                      value={customMacros.fatPct}
                      min={10}
                      max={65}
                      step={5}
                      onChange={(val) => {
                        const rem = 100 - val;
                        const pPct = Math.round(rem * 0.5);
                        const cPct = rem - pPct;
                        updateMacroPercentages(cPct, pPct, val);
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    Your personalized nutrition parameters are configured! Click Complete to start generating your custom meal plan.
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation Controls */}
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || isCalculating}
              className="gap-2"
            >
              {step === 5 ? (
                isSubmitting ? (
                  "Saving Profile..."
                ) : (
                  <>
                    Complete Setup <Check className="h-4 w-4" />
                  </>
                )
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
