import { client } from "./client";

export interface PantryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: "produce" | "protein" | "dairy" | "pantry" | "bakery" | "spices" | "other";
  expirationDate?: string; // ISO date string
  location?: "fridge" | "freezer" | "pantry";
}

export interface GroceryItem {
  id: string;
  name: string;
  amountNeeded: number;
  amountSubtracted: number;
  unit: string;
  category: "produce" | "protein" | "dairy" | "pantry" | "bakery" | "spices" | "other";
  isChecked: boolean;
  isCustom?: boolean;
  subtractedFromPantry?: boolean;
}

export interface GroceryList {
  id: string;
  items: GroceryItem[];
  totalItemsCount: number;
  checkedCount: number;
  subtractedPantryCount: number;
  estimatedCost: number; // in USD
  updatedAt: string;
}

export const pantryApi = {
  getPantryItems: async (): Promise<PantryItem[]> => {
    return client.get<PantryItem[]>("/api/pantry/items");
  },

  addPantryItem: async (item: Omit<PantryItem, "id">): Promise<PantryItem> => {
    return client.post<PantryItem>("/api/pantry/items", item);
  },

  updatePantryItem: async (id: string, updates: Partial<PantryItem>): Promise<PantryItem> => {
    return client.put<PantryItem>(`/api/pantry/items?id=${id}`, updates);
  },

  deletePantryItem: async (id: string): Promise<{ success: boolean }> => {
    return client.delete<{ success: boolean }>(`/api/pantry/items?id=${id}`);
  },

  generateGroceryList: async (): Promise<GroceryList> => {
    return client.get<GroceryList>("/api/grocery-lists/generate");
  },

  toggleGroceryItemChecked: async (itemId: string, isChecked: boolean): Promise<GroceryItem> => {
    return client.put<GroceryItem>(`/api/grocery-lists/generate`, { itemId, isChecked });
  },

  addCustomGroceryItem: async (item: { name: string; amount: number; unit: string; category: string }): Promise<GroceryItem> => {
    return client.post<GroceryItem>(`/api/grocery-lists/generate`, item);
  },
};
