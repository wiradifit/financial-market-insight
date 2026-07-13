import { test, expect } from '@playwright/test';

test.describe('Financial Market Insight — E2E', () => {

  test('dashboard loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Live Signal Feed')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Live Price Feed')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Market Overview')).toBeVisible({ timeout: 10000 });
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Market Insight')).toBeVisible();

    await page.click('text=Network Monitor');
    await expect(page).toHaveURL(/\/network/);
    await expect(page.locator('h1')).toContainText('Network Health');
  });

  test('crypto page loads with chart', async ({ page }) => {
    await page.goto('/crypto');
    await expect(page.locator('h1')).toContainText('Crypto Signals');
    await expect(page.locator('#tv-chart-BTC_USD')).toBeAttached({ timeout: 15000 });
  });

  test('symbol search works on crypto page', async ({ page }) => {
    await page.goto('/crypto');
    const search = page.getByPlaceholder('BTC-USD');
    await search.fill('ETH-USD');
    await page.getByText('ETH-USD').first().click();
    await expect(page.locator('text=Signals for ETH-USD')).toBeVisible({ timeout: 10000 });
  });

  test('stocks page loads', async ({ page }) => {
    await page.goto('/stocks');
    await expect(page.locator('h1')).toContainText('Stock Analysis');
    await expect(page.locator('text=Live TradingView')).toBeVisible();
  });

  test('forex page loads', async ({ page }) => {
    await page.goto('/forex');
    await expect(page.locator('h1')).toContainText('Forex Market');
    await expect(page.locator('text=Live TradingView')).toBeVisible();
  });

  test('network monitor page loads', async ({ page }) => {
    await page.goto('/network');
    await expect(page.locator('h1')).toContainText('Network Health');
    await expect(page.locator('text=Live Network Monitor')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Next.js Frontend API')).toBeVisible();
    await expect(page.locator('text=Python Signal Engine')).toBeVisible();
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText('Notifications');
    await expect(page.locator('text=Telegram Configuration')).toBeVisible();
    await expect(page.locator('text=Pending Alerts')).toBeVisible();
    await expect(page.locator('text=How to set up')).toBeVisible();
  });

  test('header navigation works', async ({ page }) => {
    await page.goto('/');
    const bell = page.locator('[aria-label="Notifications"]');
    await bell.click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('mobile menu toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menuBtn = page.locator('[aria-label="Open navigation"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await expect(page.locator('text=Market Insight')).toBeVisible();
  });
});