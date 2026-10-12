import { describe, it, expect, beforeEach } from "vitest";
import {
  getMockPantryItems,
  addMockPantryItem,
  deleteMockPantryItem,
  generateMockGroceryList,
} from "../pantry";

// Helper to derive expiry status inline (mirrors pantry page logic)
const getExpiryStatus = (dateStr?: string) => {
  if (!dateStr) return "fresh";
  const expTime = new Date(dateStr).getTime();
  const nowTime = new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "expiring";
  return "fresh";
};

describe("Pantry Inventory Mock Store", () => {
  describe("Add / Delete pantry items", () => {
    it("adds a new pantry item and increases count", () => {
      const before = getMockPantryItems().length;
      addMockPantryItem({
        name: "Test Avocado",
        amount: 2,
        unit: "items",
        category: "produce",
        expirationDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        location: "fridge",
      });
      const after = getMockPantryItems().length;
      expect(after).toBe(before + 1);
    });

    it("stores the correct name and amount on the new item", () => {
      addMockPantryItem({
        name: "__vitest_item__",
        amount: 999,
        unit: "g",
        category: "pantry",
        location: "pantry",
      });
      const items = getMockPantryItems();
      const found = items.find((i) => i.name === "__vitest_item__");
      expect(found).toBeDefined();
      expect(found?.amount).toBe(999);
    });

    it("deletes a pantry item by ID", () => {
      const item = addMockPantryItem({
        name: "__to_delete__",
        amount: 1,
        unit: "items",
        category: "other",
        location: "pantry",
      });
      const before = getMockPantryItems().length;
      const result = deleteMockPantryItem(item.id);
      const after = getMockPantryItems().length;
      expect(result).toBe(true);
      expect(after).toBe(before - 1);
      expect(getMockPantryItems().find((i) => i.id === item.id)).toBeUndefined();
    });
  });

  describe("Expiry date classification", () => {
    it("classifies future date > 3 days as fresh", () => {
      const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
      expect(getExpiryStatus(futureDate)).toBe("fresh");
    });

    it("classifies date within 3 days as expiring", () => {
      const soonDate = new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0];
      expect(getExpiryStatus(soonDate)).toBe("expiring");
    });

    it("classifies past date as expired", () => {
      const pastDate = new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0];
      expect(getExpiryStatus(pastDate)).toBe("expired");
    });

    it("returns fresh when no expiration date is set", () => {
      expect(getExpiryStatus(undefined)).toBe("fresh");
    });
  });

  describe("Grocery List Pantry Subtraction Engine", () => {
    it("generates a grocery list with items", () => {
      const list = generateMockGroceryList();
      expect(list.items.length).toBeGreaterThan(0);
    });

    it("returns a list with totalItemsCount matching items array length", () => {
      const list = generateMockGroceryList();
      expect(list.totalItemsCount).toBe(list.items.length);
    });

    it("marks pantry-subtracted items correctly", () => {
      const list = generateMockGroceryList();
      const subtractedItems = list.items.filter((i) => i.subtractedFromPantry);
      // subtractedPantryCount should match the number of items with the flag
      expect(list.subtractedPantryCount).toBe(subtractedItems.length);
    });

    it("auto-checks grocery items that are fully covered by pantry stock", () => {
      const list = generateMockGroceryList();
      const fullySubtracted = list.items.filter(
        (i) => i.amountNeeded === 0 && i.subtractedFromPantry
      );
      fullySubtracted.forEach((item) => {
        expect(item.isChecked).toBe(true);
      });
    });
  });
});
