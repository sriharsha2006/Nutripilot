"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { onboardingApi, UserProfile, MacroTarget } from "@/lib/api/onboarding";
import {
  User,
  Flame,
  Utensils,
  ShieldAlert,
  DollarSign,
  Users,
  Save,
  CheckCircle2,
  Sparkles,
  Sliders,
  Scale,
  Activity,
  Clock,
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

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"nutrition" | "biometrics" | "diet" | "household">("nutrition");

  const [dislikedInput, setDislikedInput] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await onboardingApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await onboardingApi.updateProfile(profile);
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile updates:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = (pref: string) => {
    if (!profile) return;
    const exists = profile.dietaryPreferences.includes(pref);
    setProfile({
      ...profile,
      dietaryPreferences: exists
        ? profile.dietaryPreferences.filter((p) => p !== pref)
        : [...profile.dietaryPreferences, pref],
    });
  };

  const toggleAllergy = (allergy: string) => {
    if (!profile) return;
    const exists = profile.allergies.includes(allergy);
    setProfile({
      ...profile,
      allergies: exists ? profile.allergies.filter((a) => a !== allergy) : [...profile.allergies, allergy],
    });
  };

  const addDislikedIngredient = () => {
    if (!dislikedInput.trim() || !profile) return;
    setProfile({
      ...profile,
      dislikedIngredients: [...profile.dislikedIngredients, dislikedInput.trim()],
    });
    setDislikedInput("");
  };

  const removeDislikedIngredient = (tag: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      dislikedIngredients: profile.dislikedIngredients.filter((i) => i !== tag),
    });
  };

  const updateMacroPct = (carbsPct: number, proteinPct: number, fatPct: number) => {
    if (!profile) return;
    const calories = profile.calculatedNutrition.targetCalories;
    const carbsGrams = Math.round((calories * (carbsPct / 100)) / 4);
    const proteinGrams = Math.round((calories * (proteinPct / 100)) / 4);
    const fatGrams = Math.round((calories * (fatPct / 100)) / 9);

    setProfile({
      ...profile,
      calculatedNutrition: {
        ...profile.calculatedNutrition,
        macros: {
          carbsPct,
          proteinPct,
          fatPct,
          carbsGrams,
          proteinGrams,
          fatGrams,
        },
      },
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  const { calculatedNutrition } = profile;

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl border border-primary/30">
            {profile.name ? profile.name.charAt(0) : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.name || "NutriPilot User"}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="accent" className="capitalize">
                {profile.goal} weight goal
              </Badge>
              <span className="text-xs text-muted-foreground">• Updated {new Date(profile.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button variant="outline" onClick={() => router.push("/onboarding")}>
            Re-run Onboarding
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Profile settings saved successfully!
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex gap-2 border-b overflow-x-auto pb-1">
        {[
          { id: "nutrition", label: "Nutrition & Macros", icon: Flame },
          { id: "biometrics", label: "Biometrics & Goals", icon: Scale },
          { id: "diet", label: "Diet & Allergies", icon: Utensils },
          { id: "household", label: "Budget & Prep", icon: DollarSign },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: NUTRITION & MACROS */}
      {activeTab === "nutrition" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" /> Energy Baseline
              </CardTitle>
              <CardDescription>Estimated daily expenditure and target calories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border space-y-1">
                <div className="text-xs text-muted-foreground">Basal Metabolic Rate (BMR)</div>
                <div className="text-xl font-bold">{calculatedNutrition.bmr} kcal</div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border space-y-1">
                <div className="text-xs text-muted-foreground">Total Daily Energy Expenditure (TDEE)</div>
                <div className="text-xl font-bold">{calculatedNutrition.tdee} kcal</div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                <div className="text-xs font-semibold text-primary">Daily Calorie Target</div>
                <div className="text-2xl font-black text-primary">{calculatedNutrition.targetCalories} kcal</div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" /> Macronutrient Ratios
              </CardTitle>
              <CardDescription>Adjust your Carbs, Protein, and Fats target distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl border bg-blue-500/5">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {calculatedNutrition.macros.carbsGrams}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">{calculatedNutrition.macros.carbsPct}%</div>
                </div>

                <div className="p-3 rounded-xl border bg-emerald-500/5">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {calculatedNutrition.macros.proteinGrams}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">{calculatedNutrition.macros.proteinPct}%</div>
                </div>

                <div className="p-3 rounded-xl border bg-amber-500/5">
                  <div className="text-xs text-muted-foreground">Fats</div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {calculatedNutrition.macros.fatGrams}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">{calculatedNutrition.macros.fatPct}%</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Carbohydrates ({calculatedNutrition.macros.carbsPct}%)</span>
                    <span>{calculatedNutrition.macros.carbsGrams}g</span>
                  </div>
                  <Slider
                    value={calculatedNutrition.macros.carbsPct}
                    min={10}
                    max={70}
                    step={5}
                    onChange={(val) => {
                      const rem = 100 - val;
                      const pPct = Math.round(rem * 0.5);
                      const fPct = rem - pPct;
                      updateMacroPct(val, pPct, fPct);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Protein ({calculatedNutrition.macros.proteinPct}%)</span>
                    <span>{calculatedNutrition.macros.proteinGrams}g</span>
                  </div>
                  <Slider
                    value={calculatedNutrition.macros.proteinPct}
                    min={15}
                    max={60}
                    step={5}
                    onChange={(val) => {
                      const rem = 100 - val;
                      const cPct = Math.round(rem * 0.6);
                      const fPct = rem - cPct;
                      updateMacroPct(cPct, val, fPct);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Fats ({calculatedNutrition.macros.fatPct}%)</span>
                    <span>{calculatedNutrition.macros.fatGrams}g</span>
                  </div>
                  <Slider
                    value={calculatedNutrition.macros.fatPct}
                    min={10}
                    max={65}
                    step={5}
                    onChange={(val) => {
                      const rem = 100 - val;
                      const pPct = Math.round(rem * 0.5);
                      const cPct = rem - pPct;
                      updateMacroPct(cPct, pPct, val);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: BIOMETRICS & GOALS */}
      {activeTab === "biometrics" && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg">Physical Biometrics & Health Goals</CardTitle>
            <CardDescription>Update your personal metrics to recalibrate metabolic formulas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Biological Sex</Label>
                <Select
                  id="gender"
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                  options={[
                    { label: "Female", value: "female" },
                    { label: "Male", value: "male" },
                    { label: "Other", value: "other" },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.heightCm}
                  onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weightKg}
                  onChange={(e) => setProfile({ ...profile, weightKg: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  id="activity"
                  value={profile.activityLevel}
                  onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as any })}
                  options={[
                    { label: "Sedentary (Desk job)", value: "sedentary" },
                    { label: "Lightly Active (1-3 days/wk)", value: "light" },
                    { label: "Moderately Active (3-5 days/wk)", value: "moderate" },
                    { label: "Very Active (6-7 days/wk)", value: "active" },
                    { label: "Extra Active (2x/day training)", value: "very_active" },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Primary Objective</Label>
                <Select
                  id="goal"
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
                  options={[
                    { label: "Lose Weight", value: "lose" },
                    { label: "Maintain Weight", value: "maintain" },
                    { label: "Build Muscle / Weight Gain", value: "gain" },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: DIET & ALLERGIES */}
      {activeTab === "diet" && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg">Dietary Preferences & Exclusion Rules</CardTitle>
            <CardDescription>Manage dietary styles, active allergies, and disliked ingredients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="font-semibold">Dietary Tags</Label>
              <div className="flex flex-wrap gap-2">
                {DIET_OPTIONS.map((opt) => {
                  const isSelected = profile.dietaryPreferences.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => togglePreference(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
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

            <div className="space-y-3 border-t pt-4">
              <Label className="font-semibold text-destructive flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Allergies & Intolerances
              </Label>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map((allergy) => {
                  const isSelected = profile.allergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-destructive text-destructive-foreground border-destructive"
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

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="disliked">Disliked Ingredients</Label>
              <div className="flex gap-2">
                <Input
                  id="disliked"
                  placeholder="Add ingredient..."
                  value={dislikedInput}
                  onChange={(e) => setDislikedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDislikedIngredient())}
                />
                <Button type="button" variant="secondary" onClick={addDislikedIngredient}>
                  Add
                </Button>
              </div>
              {profile.dislikedIngredients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.dislikedIngredients.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1 cursor-pointer" onClick={() => removeDislikedIngredient(tag)}>
                      {tag} <span className="text-xs font-bold text-muted-foreground">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: HOUSEHOLD & PREP */}
      {activeTab === "household" && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg">Budget & Cooking Logistics</CardTitle>
            <CardDescription>Manage family scaling, prep times, and weekly food spend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Weekly Grocery Budget ($ USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={profile.weeklyBudget}
                  onChange={(e) => setProfile({ ...profile, weeklyBudget: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="household">Household Size</Label>
                <Input
                  id="household"
                  type="number"
                  min={1}
                  value={profile.householdSize}
                  onChange={(e) => setProfile({ ...profile, householdSize: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill">Cooking Skill</Label>
                <Select
                  id="skill"
                  value={profile.cookingSkill}
                  onChange={(e) => setProfile({ ...profile, cookingSkill: e.target.value as any })}
                  options={[
                    { label: "Beginner", value: "beginner" },
                    { label: "Intermediate", value: "intermediate" },
                    { label: "Advanced", value: "advanced" },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prep">Max Desired Prep Time (Minutes)</Label>
                <Select
                  id="prep"
                  value={profile.maxPrepTimeMinutes.toString()}
                  onChange={(e) => setProfile({ ...profile, maxPrepTimeMinutes: Number(e.target.value) })}
                  options={[
                    { label: "15 Minutes", value: "15" },
                    { label: "30 Minutes", value: "30" },
                    { label: "45 Minutes", value: "45" },
                    { label: "60+ Minutes", value: "60" },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
