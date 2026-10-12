"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PantryItem, pantryApi } from "@/lib/api/pantry";
import {
  PackageCheck,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Minus,
  Apple,
} from "lucide-react";

const CATEGORIES = ["all", "produce", "protein", "dairy", "pantry", "bakery", "spices", "other"] as const;

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add Item Dialog State
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<{
    name: string;
    amount: number;
    unit: string;
    category: PantryItem["category"];
    expirationDate: string;
    location: PantryItem["location"];
  }>({
    name: "",
    amount: 1,
    unit: "g",
    category: "produce",
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "fridge",
  });

  useEffect(() => {
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    setIsLoading(true);
    try {
      const data = await pantryApi.getPantryItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load pantry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    try {
      const created = await pantryApi.addPantryItem(newItem);
      setItems([...items, created]);
      setIsAddOpen(false);
      setNewItem({
        name: "",
        amount: 1,
        unit: "g",
        category: "produce",
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        location: "fridge",
      });
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await pantryApi.deletePantryItem(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleQuantityChange = async (item: PantryItem, delta: number) => {
    const newAmount = Math.max(0, Math.round((item.amount + delta) * 10) / 10);
    if (newAmount === 0) {
      handleDeleteItem(item.id);
      return;
    }
    try {
      const updated = await pantryApi.updatePantryItem(item.id, { amount: newAmount });
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      console.error("Failed to update item quantity:", err);
    }
  };

  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return { status: "fresh", label: "Fresh", variant: "outline" as const };
    const expTime = new Date(dateStr).getTime();
    const nowTime = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", label: "Expired", variant: "destructive" as const, days: diffDays };
    } else if (diffDays <= 3) {
      return { status: "expiring", label: `Expires in ${diffDays}d`, variant: "secondary" as const, days: diffDays };
    }
    return { status: "fresh", label: `Fresh (${diffDays}d)`, variant: "outline" as const, days: diffDays };
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const expiringCount = items.filter((i) => {
    const st = getExpiryStatus(i.expirationDate);
    return st.status === "expiring" || st.status === "expired";
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading pantry inventory...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-muted p-6 rounded-2xl border">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
            <PackageCheck className="h-3.5 w-3.5" /> Household Stock Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Pantry & Fridge Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ingredients stored here are automatically subtracted from generated grocery shopping lists.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Ingredient
          </Button>
        </div>
      </div>

      {expiringCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold">{expiringCount} item(s)</span> are expiring soon or expired! Consider incorporating them into your upcoming meals.
          </div>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted text-foreground border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-muted/20 border rounded-2xl">
          <Apple className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-semibold text-lg">No Pantry Items Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || activeCategory !== "all"
              ? "No items match your filter criteria."
              : "Your pantry is empty. Add ingredients to enable smart grocery list subtraction!"}
          </p>
          <Button onClick={() => setIsAddOpen(true)} variant="outline" size="sm">
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const exp = getExpiryStatus(item.expirationDate);
            return (
              <Card key={item.id} className="border shadow-sm hover:shadow-md transition-all">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <Badge variant="outline" className="text-[10px] capitalize mb-1">
                      {item.category} • {item.location || "pantry"}
                    </Badge>
                    <CardTitle className="text-base font-bold">{item.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </CardHeader>

                <CardContent className="p-4 pt-1 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg">
                      <Button variant="ghost" size="icon-xs" onClick={() => handleQuantityChange(item, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-sm">
                        {item.amount} {item.unit}
                      </span>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleQuantityChange(item, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Badge variant={exp.variant} className="text-[10px]">
                      {exp.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Item Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Pantry Ingredient</DialogTitle>
            <DialogDescription>Add items currently in your kitchen for smart grocery subtraction.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Ingredient Name</Label>
              <Input
                id="name"
                placeholder="e.g. Olive Oil, Baby Spinach"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Quantity</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0.1}
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  id="unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  options={[
                    { label: "grams (g)", value: "g" },
                    { label: "kilograms (kg)", value: "kg" },
                    { label: "pieces/items", value: "items" },
                    { label: "loaf", value: "loaf" },
                    { label: "bottle", value: "bottle" },
                    { label: "tbsp / tsp", value: "tbsp" },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  options={[
                    { label: "Produce", value: "produce" },
                    { label: "Protein", value: "protein" },
                    { label: "Dairy", value: "dairy" },
                    { label: "Pantry Staples", value: "pantry" },
                    { label: "Bakery", value: "bakery" },
                    { label: "Spices", value: "spices" },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Select
                  id="location"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value as any })}
                  options={[
                    { label: "Refrigerator", value: "fridge" },
                    { label: "Pantry Cabinet", value: "pantry" },
                    { label: "Freezer", value: "freezer" },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expDate">Expiration Date</Label>
              <Input
                id="expDate"
                type="date"
                value={newItem.expirationDate}
                onChange={(e) => setNewItem({ ...newItem, expirationDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!newItem.name.trim()}>
              Save Ingredient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
