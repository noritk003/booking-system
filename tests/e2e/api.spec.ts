import { test, expect } from '@playwright/test';

test.describe('API テスト', () => {
  test('空き状況APIが正しく動作する', async ({ request }) => {
    // リソース一覧を取得
    const resourcesResponse = await request.get('/api/resources');
    expect(resourcesResponse.ok()).toBeTruthy();
    
    const resourcesData = await resourcesResponse.json();
    expect(resourcesData.success).toBe(true);
    expect(Array.isArray(resourcesData.data)).toBe(true);
    
    if (resourcesData.data.length > 0) {
      const resourceId = resourcesData.data[0].id;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      // 空き状況を取得
      const availabilityResponse = await request.get(
        `/api/availability?resource_id=${resourceId}&date=${dateString}`
      );
      expect(availabilityResponse.ok()).toBeTruthy();
      
      const availabilityData = await availabilityResponse.json();
      expect(availabilityData.success).toBe(true);
      expect(availabilityData.data).toBeDefined();
      expect(Array.isArray(availabilityData.data.slots)).toBe(true);
    }
  });

  test('無効なパラメータでAPIエラーが返される', async ({ request }) => {
    // 無効なリソースIDで空き状況を取得
    const response = await request.get('/api/availability?resource_id=invalid&date=2024-01-01');
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test('予約作成APIが正しく動作する', async ({ request }) => {
    // リソース一覧を取得
    const resourcesResponse = await request.get('/api/resources');
    const resourcesData = await resourcesResponse.json();
    
    if (resourcesData.data && resourcesData.data.length > 0) {
      const resourceId = resourcesData.data[0].id;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const startTime = tomorrow.toISOString();
      const endTime = new Date(tomorrow.getTime() + 15 * 60000).toISOString(); // +15分
      
      // 予約作成
      const bookingResponse = await request.post('/api/bookings', {
        data: {
          resource_id: resourceId,
          customer_name: 'API Test User',
          customer_email: 'apitest@example.com',
          start_time: startTime,
          end_time: endTime,
          notes: 'API test booking'
        }
      });
      
      if (bookingResponse.ok()) {
        const bookingData = await bookingResponse.json();
        expect(bookingData.success).toBe(true);
        expect(bookingData.data).toBeDefined();
        expect(bookingData.data.id).toBeDefined();
        
        // 作成した予約をキャンセル
        const cancelResponse = await request.delete(
          `/api/bookings?booking_id=${bookingData.data.id}`
        );
        expect(cancelResponse.ok()).toBeTruthy();
      }
    }
  });
});