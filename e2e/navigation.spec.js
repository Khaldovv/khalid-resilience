import { test, expect } from '@playwright/test';

test.describe('Core Navigation', () => {
  test('should load the ERM dashboard', async ({ page }) => {
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    
    // Should render the main platform
    await expect(page).toHaveTitle(/Khalid|خالد|Resilience/i);
    
    // Sidebar should be visible
    const sidebar = page.locator('[class*="sidebar"], nav, aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('should navigate to Risk Register', async ({ page }) => {
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    
    // Look for risk register tab/link
    const riskTab = page.getByText(/سجل المخاطر|Risk Register/i).first();
    if (await riskTab.isVisible()) {
      await riskTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to BIA module', async ({ page }) => {
    await page.goto('/erm#bia');
    await page.waitForLoadState('networkidle');
    
    // BIA content should load
    const biaContent = page.getByText(/تحليل تأثير|Business Impact|BIA/i).first();
    await expect(biaContent).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to vendors page', async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('should navigate to incidents page', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('should navigate to quantification page', async ({ page }) => {
    await page.goto('/quantification');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Language Support', () => {
  test('should display Arabic content on ERM', async ({ page }) => {
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    
    // Should have Arabic text somewhere
    const arabicText = page.getByText(/لوحة التحكم|المخاطر|إدارة/i).first();
    await expect(arabicText).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Responsive Layout', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('should render correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
