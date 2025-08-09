import { test, expect } from '@playwright/test';

test.describe('スクリーンショット撮影', () => {
  test('ヒーローセクション（デスクトップ）', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // ページ読み込み完了を待つ
    await page.waitForLoadState('networkidle');
    
    // ヒーローセクションのスクリーンショット
    await page.screenshot({
      path: 'public/screenshots/hero-desktop.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1920, height: 800 }
    });
  });

  test('予約フォーム（デスクトップ）', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // 予約フローを開始
    await page.waitForLoadState('networkidle');
    
    // リソース選択
    const resourceSelect = page.locator('select').first();
    if (await resourceSelect.isVisible()) {
      await resourceSelect.selectOption({ index: 1 });
    }
    
    // 予約セクションのスクリーンショット
    await page.screenshot({
      path: 'public/screenshots/booking-form-desktop.png',
      fullPage: true
    });
  });

  test('技術詳細ページ（デスクトップ）', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/about');
    
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({
      path: 'public/screenshots/about-page-desktop.png',
      fullPage: true
    });
  });

  test('管理画面（デスクトップ）', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/admin');
    
    await page.waitForLoadState('networkidle');
    
    // 認証画面のスクリーンショット
    if (await page.locator('input[type="password"]').isVisible()) {
      await page.screenshot({
        path: 'public/screenshots/admin-login-desktop.png',
        fullPage: false
      });
      
      // ログイン
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button:has-text("ログイン")');
      await page.waitForURL('/admin');
    }
    
    // 管理画面のスクリーンショット
    await page.screenshot({
      path: 'public/screenshots/admin-dashboard-desktop.png',
      fullPage: true
    });
  });

  test('ヒーローセクション（モバイル）', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({
      path: 'public/screenshots/hero-mobile.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 812 }
    });
  });

  test('予約フォーム（モバイル）', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // リソース選択
    const resourceSelect = page.locator('select').first();
    if (await resourceSelect.isVisible()) {
      await resourceSelect.selectOption({ index: 1 });
    }
    
    await page.screenshot({
      path: 'public/screenshots/booking-form-mobile.png',
      fullPage: true
    });
  });

  test('管理画面（モバイル）', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/admin');
    
    await page.waitForLoadState('networkidle');
    
    // ログイン処理
    if (await page.locator('input[type="password"]').isVisible()) {
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button:has-text("ログイン")');
      await page.waitForURL('/admin');
    }
    
    await page.screenshot({
      path: 'public/screenshots/admin-dashboard-mobile.png',
      fullPage: true
    });
  });

  test('予約完了画面', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/complete');
    
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({
      path: 'public/screenshots/booking-success.png',
      fullPage: false
    });
  });

  test('キャンセル画面', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/cancel/sample-booking-id');
    
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({
      path: 'public/screenshots/cancel-page.png',
      fullPage: false
    });
  });
});