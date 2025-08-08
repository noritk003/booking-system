import { test, expect } from '@playwright/test';

test.describe('予約システム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('トップページが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('予約システム');
    await expect(page.locator('text=ご希望の日時を選択して予約を行ってください')).toBeVisible();
  });

  test('予約フローが完了できる', async ({ page }) => {
    // リソース選択を待つ
    await page.waitForSelector('select');
    
    // 日付選択
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayButton = page.locator(`button[name="day"][aria-label*="${tomorrow.getDate()}"]`);
    await dayButton.click();
    
    // 時間スロット選択を待つ
    await page.waitForSelector('text=の空き時間');
    
    // 利用可能な時間スロットをクリック
    const availableSlot = page.locator('button:has-text("09:00 - 09:15")').first();
    await availableSlot.click();
    
    // 予約フォームに入力
    await page.fill('input[name="customer_name"]', 'テスト太郎');
    await page.fill('input[name="customer_email"]', 'test@example.com');
    await page.fill('input[name="customer_phone"]', '090-1234-5678');
    await page.fill('textarea[name="notes"]', 'テスト予約です');
    
    // 予約を確定
    await page.click('button:has-text("予約を確定する")');
    
    // 成功ページに遷移することを確認
    await expect(page).toHaveURL(/\/book-success/);
    await expect(page.locator('text=予約が完了しました！')).toBeVisible();
    await expect(page.locator('text=テスト太郎')).toBeVisible();
  });

  test('管理画面で予約一覧が表示される', async ({ page }) => {
    await page.goto('/admin');
    
    // 管理画面のタイトルが表示される
    await expect(page.locator('h1')).toContainText('予約管理');
    
    // フィルターボタンが表示される
    await expect(page.locator('text=すべて')).toBeVisible();
    await expect(page.locator('text=確定')).toBeVisible();
    await expect(page.locator('text=キャンセル')).toBeVisible();
    
    // テーブルまたは空メッセージが表示される
    const hasBookings = await page.locator('table').isVisible();
    const hasEmptyMessage = await page.locator('text=予約がありません').isVisible();
    
    expect(hasBookings || hasEmptyMessage).toBeTruthy();
  });
});