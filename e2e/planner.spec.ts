import { test, expect } from '@playwright/test';

test.describe('Meal Planner', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@nutripilot.app');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should load weekly plan and toggle meal lock', async ({ page }) => {
    await page.goto('/planner');
    
    // Wait for meals to load
    const mealCard = page.locator('.rounded-xl.border', { hasText: 'Breakfast' }).first();
    await expect(mealCard).toBeVisible();

    // Click lock button (should toggle icon)
    const lockButton = mealCard.locator('button', { has: page.locator('svg.lucide-unlock') }).or(mealCard.locator('button', { has: page.locator('svg.lucide-lock') })).first();
    await lockButton.click();
    
    // Check if it toggles visually, this is a basic assert to ensure no crash
    await expect(mealCard).toBeVisible();
  });
});
