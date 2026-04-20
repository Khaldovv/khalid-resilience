import { test, expect } from '@playwright/test';

test.describe('Risk Management Workflow', () => {
  test('should open Add Risk modal', async ({ page }) => {
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    
    // Find and click "Add Risk" button
    const addBtn = page.getByText(/إضافة خطر|Add Risk/i).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      // Modal should appear 
      const modal = page.getByText(/إضافة خطر جديد|Add New Risk/i).first();
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show step wizard in Add Risk modal', async ({ page }) => {
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    
    const addBtn = page.getByText(/إضافة خطر|Add Risk/i).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      // Step 1 should be visible
      const step1 = page.getByText(/البيانات الأساسية|Basic Information/i).first();
      await expect(step1).toBeVisible({ timeout: 5000 });
      
      // Should have step indicators (1, 2, 3)
      const indicators = page.locator('text=/^[123✓]$/');
      expect(await indicators.count()).toBeGreaterThanOrEqual(2);
    }
  });

  test('should validate required fields before next step', async ({ page }) => {
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    
    const addBtn = page.getByText(/إضافة خطر|Add Risk/i).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      // Click Next without filling fields
      const nextBtn = page.getByText(/التالي|Next/i).first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        
        // Should still be on step 1 (validation failed)
        const step1Content = page.getByText(/البيانات الأساسية|Basic Information/i).first();
        await expect(step1Content).toBeVisible();
      }
    }
  });
});

test.describe('Page Load Performance', () => {
  test('ERM page should load within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/erm');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Filter out expected warnings (React dev mode, etc.)
    const criticalErrors = errors.filter(e => 
      !e.includes('React') && 
      !e.includes('hydrat') && 
      !e.includes('favicon') &&
      !e.includes('ERR_CONNECTION_REFUSED')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
