"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { GroceryList, GroceryItem, pantryApi } from "@/lib/api/pantry";
import {
  ShoppingCart,
  CheckCircle2,
  PackageCheck,
  Plus,
  Printer,
  Sparkles,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Tag,
  Check,
} from "lucide-react";

export default function GroceryPage() {
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSubtracted, setShowSubtracted] = useState<boolean>(false);

  // Add Custom Item State
  const [customName, setCustomName] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<string>("items");
  const [customCategory, setCustomCategory] = useState<string>("pantry");

  useEffect(() => {
    fetchGroceryList();
  }, []);

  const fetchGroceryList = async () => {
    setIsLoading(true);
    try {
      const data = await pantryApi.generateGroceryList();
      setGroceryList(data);
    } catch (err) {
      console.error("Failed to load grocery list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChecked = async (item: GroceryItem) => {
    if (!groceryList) return;
    const newChecked = !item.isChecked;
    try {
      const updatedItem = await pantryApi.toggleGroceryItemChecked(item.id, newChecked);
      const updatedItems = groceryList.items.map((i) => (i.id === item.id ? updatedItem : i));
      const checkedCount = updatedItems.filter((i) => i.isChecked).length;
      setGroceryList({ ...groceryList, items: updatedItems, checkedCount });
    } catch (err) {
      console.error("Failed to update item check status:", err);
    }
  };

  const handleAddCustomItem = async () => {
    if (!customName.trim() || !groceryList) return;
    try {
      const newItem = await pantryApi.addCustomGroceryItem({
        name: customName.trim(),
        amount: customAmount,
        unit: customUnit,
        category: customCategory,
      });
      setGroceryList({
        ...groceryList,
        items: [newItem, ...groceryList.items],
        totalItemsCount: groceryList.totalItemsCount + 1,
      });
      setCustomName("");
    } catch (err) {
      console.error("Failed to add custom item:", err);
    }
  };

  if (isLoading || !groceryList) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Compiling smart grocery list from 7-day meal plan & subtracting pantry inventory...</p>
      </div>
    );
  }

  const itemsToBuy = groceryList.items.filter((i) => i.amountNeeded > 0);
  const itemsSubtracted = groceryList.items.filter((i) => i.subtractedFromPantry && i.amountSubtracted > 0);
  const progressPct = Math.round((groceryList.checkedCount / (groceryList.totalItemsCount || 1)) * 100);

  // Group items to buy by category
  const categories = ["produce", "protein", "dairy", "pantry", "bakery", "spices", "other"] as const;
  const categorizedToBuy: Record<string, GroceryItem[]> = {};
  categories.forEach((cat) => {
    categorizedToBuy[cat] = itemsToBuy.filter((i) => i.category === cat);
  });

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <ShoppingCart className="h-3.5 w-3.5" /> Smart Grocery List
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Consolidated Shopping List</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compiled from your 7-day meal plan with automated pantry stock subtraction.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button variant="secondary" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print Shopping List
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between">
              <span>Shopping Progress</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {groceryList.checkedCount} <span className="text-xs font-normal text-muted-foreground">/ {groceryList.totalItemsCount} checked</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1">
            <Progress value={progressPct} className="h-2" />
            <div className="text-[11px] text-muted-foreground">{progressPct}% complete</div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between">
              <span>Pantry Subtracted</span>
              <PackageCheck className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {groceryList.subtractedPantryCount} <span className="text-xs font-normal text-muted-foreground">items saved</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">Subtracted using existing pantry stock</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs flex justify-between">
              <span>Estimated Cost</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${groceryList.estimatedCost} <span className="text-xs font-normal text-muted-foreground">USD</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-muted-foreground">Approximate store total</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Custom Item */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> Add Custom Grocery Item
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Item name (e.g. Paper Towels, Dark Chocolate)..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomItem())}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-20"
              />
              <Select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                options={[
                  { label: "Pantry", value: "pantry" },
                  { label: "Produce", value: "produce" },
                  { label: "Dairy", value: "dairy" },
                  { label: "Protein", value: "protein" },
                  { label: "Other", value: "other" },
                ]}
                className="w-32"
              />
              <Button onClick={handleAddCustomItem} disabled={!customName.trim()}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pantry Subtracted Banner Toggle */}
      {itemsSubtracted.length > 0 && (
        <div className="border rounded-xl p-4 bg-primary/5 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <PackageCheck className="h-4 w-4" />
              <span>{itemsSubtracted.length} Ingredients Subtracted via Pantry Inventory</span>
            </div>
            <button
              onClick={() => setShowSubtracted(!showSubtracted)}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              {showSubtracted ? "Hide Pantry Subtracted" : "View Saved Ingredients"}
              {showSubtracted ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showSubtracted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t text-xs">
              {itemsSubtracted.map((item) => (
                <div key={item.id} className="p-2 rounded-lg bg-background border flex justify-between items-center">
                  <span className="font-medium flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> {item.name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Subtracted {item.amountSubtracted} {item.unit}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categorized Shopping List */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const list = categorizedToBuy[cat];
          if (!list || list.length === 0) return null;

          return (
            <div key={cat} className="space-y-2">
              <h3 className="font-bold text-base capitalize border-b pb-1 flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4 text-primary" /> {cat} ({list.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {list.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecked(item)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      item.isChecked
                        ? "bg-muted/40 border-muted text-muted-foreground line-through opacity-70"
                        : "bg-card hover:border-muted-foreground/30 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                          item.isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {item.isChecked && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{item.name}</span>
                        {item.isCustom && (
                          <Badge variant="secondary" className="ml-2 text-[9px] py-0">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-bold text-right">
                      {item.amountNeeded} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
