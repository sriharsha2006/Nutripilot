"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CookingModeModal } from "@/components/recipes/CookingModeModal";
import { Recipe } from "@/lib/api/planner";
import { recipesApi } from "@/lib/api/recipes";
import {
  ChefHat,
  Search,
  Plus,
  Clock,
  Flame,
  Utensils,
  Play,
  Sparkles,
  ShieldAlert,
  Trash2,
} from "lucide-react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cooking Mode Modal
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [isCookingOpen, setIsCookingOpen] = useState<boolean>(false);

  // Create Recipe Modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [newRecipe, setNewRecipe] = useState<{
    title: string;
    description: string;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    servings: number;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    dietaryTags: string[];
    ingredients: { name: string; amount: number; unit: string; category: any }[];
    instructions: string[];
  }>({
    title: "",
    description: "",
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 2,
    calories: 450,
    proteinGrams: 30,
    carbsGrams: 40,
    fatGrams: 15,
    dietaryTags: ["High-Protein"],
    ingredients: [
      { name: "Chicken Breast", amount: 200, unit: "g", category: "protein" },
      { name: "Olive Oil", amount: 1, unit: "tbsp", category: "pantry" },
    ],
    instructions: ["Prep ingredients and cook in skillet for 15 mins until done."],
  });

  const [newIngName, setNewIngName] = useState("");
  const [newIngAmount, setNewIngAmount] = useState(100);
  const [newIngUnit, setNewIngUnit] = useState("g");
  const [newInstruction, setNewInstruction] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const data = await recipesApi.getRecipes();
      setRecipes(data);
    } catch (err) {
      console.error("Failed to load recipes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCooking = (recipe: Recipe) => {
    setCookingRecipe(recipe);
    setIsCookingOpen(true);
  };

  const handleAddIngredient = () => {
    if (!newIngName.trim()) return;
    setNewRecipe({
      ...newRecipe,
      ingredients: [
        ...newRecipe.ingredients,
        { name: newIngName.trim(), amount: newIngAmount, unit: newIngUnit, category: "pantry" },
      ],
    });
    setNewIngName("");
  };

  const handleAddInstruction = () => {
    if (!newInstruction.trim()) return;
    setNewRecipe({
      ...newRecipe,
      instructions: [...newRecipe.instructions, newInstruction.trim()],
    });
    setNewInstruction("");
  };

  const handleCreateRecipe = async () => {
    if (!newRecipe.title.trim()) return;
    try {
      const created = await recipesApi.createCustomRecipe({
        ...newRecipe,
        allergens: [],
        ingredients: newRecipe.ingredients.map((ing, idx) => ({
          id: `ing-c-${idx}`,
          ...ing,
        })),
      });
      setRecipes([created, ...recipes]);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create recipe:", err);
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || r.dietaryTags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  const availableTags = ["all", "High-Protein", "Gluten-Free", "Vegetarian", "Vegan", "Mediterranean", "Dairy-Free", "Halal"];

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading recipe catalogue...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <ChefHat className="h-3.5 w-3.5" /> Culinary Library & Custom Recipes
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Recipe Catalog & Cooking Mode</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explore nutrient-dense recipes, launch step-by-step Cooking Mode, or design your own custom meals.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Custom Recipe
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted text-foreground border-border"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="border shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="p-5 pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg font-bold leading-tight">{recipe.title}</CardTitle>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {recipe.calories} kcal
                </Badge>
              </div>
              <CardDescription className="text-xs line-clamp-2 mt-1">{recipe.description}</CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4 flex-1">
              <div className="flex flex-wrap gap-1">
                {recipe.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] py-0">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Macros Row */}
              <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-muted/40 text-center text-xs">
                <div>
                  <div className="text-[10px] text-muted-foreground">Protein</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{recipe.proteinGrams}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Carbs</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">{recipe.carbsGrams}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Fat</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">{recipe.fatGrams}g</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                </span>
                <span>{recipe.servings} serving(s)</span>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 border-t mt-auto pt-3">
              <Button onClick={() => handleStartCooking(recipe)} className="w-full gap-2">
                <Play className="h-4 w-4" /> Start Cooking Mode
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Cooking Mode Modal */}
      <CookingModeModal
        isOpen={isCookingOpen}
        onClose={() => setIsCookingOpen(false)}
        recipe={cookingRecipe}
      />

      {/* Create Custom Recipe Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Custom Recipe</DialogTitle>
            <DialogDescription>Add your own recipe and calculate custom macros per serving.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="recTitle">Recipe Title</Label>
              <Input
                id="recTitle"
                placeholder="e.g. High-Protein Power Oatmeal"
                value={newRecipe.title}
                onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recDesc">Description</Label>
              <Input
                id="recDesc"
                placeholder="Brief recipe summary..."
                value={newRecipe.description}
                onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label>Calories</Label>
                <Input
                  type="number"
                  value={newRecipe.calories}
                  onChange={(e) => setNewRecipe({ ...newRecipe, calories: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={newRecipe.proteinGrams}
                  onChange={(e) => setNewRecipe({ ...newRecipe, proteinGrams: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  value={newRecipe.carbsGrams}
                  onChange={(e) => setNewRecipe({ ...newRecipe, carbsGrams: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  value={newRecipe.fatGrams}
                  onChange={(e) => setNewRecipe({ ...newRecipe, fatGrams: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <Label className="font-semibold">Add Ingredients</Label>
              <div className="flex gap-2">
                <Input placeholder="Ingredient..." value={newIngName} onChange={(e) => setNewIngName(e.target.value)} />
                <Input type="number" className="w-20" value={newIngAmount} onChange={(e) => setNewIngAmount(Number(e.target.value))} />
                <Input className="w-20" value={newIngUnit} onChange={(e) => setNewIngUnit(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleAddIngredient}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {newRecipe.ingredients.map((ing, idx) => (
                  <Badge key={idx} variant="outline">
                    {ing.name} ({ing.amount}{ing.unit})
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <Label className="font-semibold">Add Step Instructions</Label>
              <div className="flex gap-2">
                <Input placeholder="Step instruction..." value={newInstruction} onChange={(e) => setNewInstruction(e.target.value)} />
                <Button type="button" variant="secondary" onClick={handleAddInstruction}>
                  Add Step
                </Button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground pt-1">
                {newRecipe.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRecipe} disabled={!newRecipe.title.trim()}>
              Save Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
