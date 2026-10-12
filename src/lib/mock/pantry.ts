import { PantryItem, GroceryList, GroceryItem } from "@/lib/api/pantry";
import { getMockWeeklyPlan } from "./planner";

// Pre-seeded Pantry Items
let mockPantryStore: PantryItem[] = [
  {
    id: "pan-1",
    name: "Non-Fat Greek Yogurt",
    amount: 500,
    unit: "g",
    category: "dairy",
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "fridge",
  },
  {
    id: "pan-2",
    name: "Sourdough Bread",
    amount: 1,
    unit: "loaf",
    category: "bakery",
    expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Expiring soon
    location: "pantry",
  },
  {
    id: "pan-3",
    name: "Eggs",
    amount: 12,
    unit: "large",
    category: "dairy",
    expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "fridge",
  },
  {
    id: "pan-4",
    name: "Quinoa",
    amount: 500,
    unit: "g",
    category: "pantry",
    expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "pantry",
  },
  {
    id: "pan-5",
    name: "Olive Oil",
    amount: 1,
    unit: "bottle",
    category: "pantry",
    expirationDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "pantry",
  },
  {
    id: "pan-6",
    name: "Baby Spinach",
    amount: 100,
    unit: "g",
    category: "produce",
    expirationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Expired
    location: "fridge",
  },
];

let activeGroceryList: GroceryList | null = null;

export const getMockPantryItems = (): PantryItem[] => {
  return mockPantryStore;
};

export const addMockPantryItem = (item: Omit<PantryItem, "id">): PantryItem => {
  const newItem: PantryItem = {
    ...item,
    id: `pan-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  };
  mockPantryStore.push(newItem);
  return newItem;
};

export const updateMockPantryItem = (id: string, updates: Partial<PantryItem>): PantryItem => {
  const index = mockPantryStore.findIndex((i) => i.id === id);
  if (index === -1) throw new Error("Pantry item not found");
  mockPantryStore[index] = { ...mockPantryStore[index], ...updates };
  return mockPantryStore[index];
};

export const deleteMockPantryItem = (id: string): boolean => {
  const initialLen = mockPantryStore.length;
  mockPantryStore = mockPantryStore.filter((i) => i.id !== id);
  return mockPantryStore.length < initialLen;
};

// Grocery List Compiler with Pantry Subtraction Logic
export const generateMockGroceryList = (): GroceryList => {
  const weeklyPlan = getMockWeeklyPlan();
  const pantry = getMockPantryItems();

  // Aggregate required ingredients from all days and meals
  const requiredMap: Record<string, { name: string; amount: number; unit: string; category: any }> = {};

  weeklyPlan.days.forEach((day) => {
    day.meals.forEach((meal) => {
      meal.recipe.ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase().trim();
        const needed = ing.amount * meal.servings;
        if (requiredMap[key]) {
          requiredMap[key].amount += needed;
        } else {
          requiredMap[key] = {
            name: ing.name,
            amount: needed,
            unit: ing.unit,
            category: ing.category,
          };
        }
      });
    });
  });

  const groceryItems: GroceryItem[] = [];
  let subtractedCount = 0;

  Object.entries(requiredMap).forEach(([key, req], idx) => {
    // Check if ingredient exists in pantry stock
    const matchingPantry = pantry.find(
      (p) => p.name.toLowerCase().includes(key) || key.includes(p.name.toLowerCase())
    );

    let amountSubtracted = 0;
    let subtractedFromPantry = false;

    if (matchingPantry && matchingPantry.amount > 0) {
      amountSubtracted = Math.min(req.amount, matchingPantry.amount);
      subtractedFromPantry = true;
      subtractedCount++;
    }

    const netAmountNeeded = Math.max(0, req.amount - amountSubtracted);

    groceryItems.push({
      id: `groc-${idx + 1}`,
      name: req.name,
      amountNeeded: Math.round(netAmountNeeded * 10) / 10,
      amountSubtracted: Math.round(amountSubtracted * 10) / 10,
      unit: req.unit,
      category: req.category,
      isChecked: netAmountNeeded === 0, // Auto check if fully available in pantry
      subtractedFromPantry,
    });
  });

  const checkedCount = groceryItems.filter((g) => g.isChecked).length;
  // Estimate ~ $3.50 average per unique non-subtracted ingredient
  const estimatedCost = Math.round(groceryItems.filter((g) => !g.isChecked).length * 3.5);

  activeGroceryList = {
    id: "groc-list-active",
    items: groceryItems,
    totalItemsCount: groceryItems.length,
    checkedCount,
    subtractedPantryCount: subtractedCount,
    estimatedCost,
    updatedAt: new Date().toISOString(),
  };

  return activeGroceryList;
};

export const updateMockGroceryItem = (itemId: string, isChecked: boolean): GroceryItem => {
  if (!activeGroceryList) generateMockGroceryList();
  const item = activeGroceryList!.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Grocery item not found");
  item.isChecked = isChecked;
  activeGroceryList!.checkedCount = activeGroceryList!.items.filter((i) => i.isChecked).length;
  return item;
};

export const addMockCustomGroceryItem = (custom: {
  name: string;
  amount: number;
  unit: string;
  category: string;
}): GroceryItem => {
  if (!activeGroceryList) generateMockGroceryList();
  const newItem: GroceryItem = {
    id: `groc-custom-${Date.now()}`,
    name: custom.name,
    amountNeeded: custom.amount,
    amountSubtracted: 0,
    unit: custom.unit,
    category: (custom.category as any) || "other",
    isChecked: false,
    isCustom: true,
  };
  activeGroceryList!.items.unshift(newItem);
  activeGroceryList!.totalItemsCount = activeGroceryList!.items.length;
  return newItem;
};
