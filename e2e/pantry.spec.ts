import { test, expect } from '@playwright/test';

test.describe('Pantry Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@nutripilot.app');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should add a pantry item and see it in list', async ({ page }) => {
    await page.goto('/pantry');
    
    await expect(page.locator('h1')).toContainText('Pantry Inventory');
    
    // Click Add Item
    await page.click('button:has-text("Add Item")');
    
    // Fill dialog
    await page.fill('input[placeholder="e.g., Olive Oil"]', 'E2E Test Apple');
    await page.fill('input[type="number"]', '5');
    await page.click('button:has-text("Save Item")');
    
    // Verify it appears
    await expect(page.locator('text=E2E Test Apple')).toBeVisible();
  });
});
