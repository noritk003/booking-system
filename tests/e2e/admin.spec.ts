import { test, expect } from '@playwright/test';

test.describe('管理画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('管理画面が正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('予約管理');
    await expect(page.locator('button:has-text("更新")')).toBeVisible();
    await expect(page.locator('button:has-text("すべて")')).toBeVisible();
    await expect(page.locator('button:has-text("確定")')).toBeVisible();
    await expect(page.locator('button:has-text("キャンセル")')).toBeVisible();
  });

  test('フィルターが正しく動作する', async ({ page }) => {
    // 確定フィルターをクリック
    await page.click('button:has-text("確定")');
    await expect(page.locator('button:has-text("確定")')).toHaveClass(/bg-primary-100/);
    
    // キャンセルフィルターをクリック
    await page.click('button:has-text("キャンセル")');
    await expect(page.locator('button:has-text("キャンセル")')).toHaveClass(/bg-primary-100/);
    
    // すべてフィルターをクリック
    await page.click('button:has-text("すべて")');
    await expect(page.locator('button:has-text("すべて")')).toHaveClass(/bg-primary-100/);
  });

  test('予約データがテーブル形式で表示される', async ({ page }) => {
    // テーブルヘッダーが表示されるかチェック
    const tableExists = await page.locator('table').isVisible();
    const emptyMessageExists = await page.locator('text=予約がありません').isVisible();
    
    // テーブルまたは空メッセージのいずれかが表示されている
    expect(tableExists || emptyMessageExists).toBeTruthy();
    
    if (tableExists) {
      // テーブルヘッダーが正しく表示される
      await expect(page.locator('th:has-text("予約ID")')).toBeVisible();
      await expect(page.locator('th:has-text("顧客情報")')).toBeVisible();
      await expect(page.locator('th:has-text("リソース")')).toBeVisible();
      await expect(page.locator('th:has-text("日時")')).toBeVisible();
      await expect(page.locator('th:has-text("ステータス")')).toBeVisible();
      await expect(page.locator('th:has-text("操作")')).toBeVisible();
    }
  });

  test('更新ボタンが機能する', async ({ page }) => {
    // ページが読み込まれるまで待つ
    await page.waitForLoadState('networkidle');
    
    // 更新ボタンをクリック
    await page.click('button:has-text("更新")');
    
    // ネットワークリクエストが発生することを確認
    await page.waitForLoadState('networkidle');
    
    // ページが正常に表示されたままであることを確認
    await expect(page.locator('h1')).toContainText('予約管理');
  });
});