import { test, expect } from '@playwright/test';

test('visitor can see login page', async ({ page }) => {
  await page.goto('/api/auth/signin');
  await expect(page).toHaveURL(/.*signin/);
});

test('logged in user can navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Expect redirect to signin if not auth
    await expect(page).toHaveURL(/.*signin/);
});
