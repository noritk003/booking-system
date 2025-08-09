/**
 * k6負荷テストスクリプト
 * 
 * インストール: https://k6.io/docs/getting-started/installation/
 * 実行方法: k6 run scripts/k6-load-test.js
 * 
 * オプション付き実行例:
 * k6 run --vus 10 --duration 10s scripts/k6-load-test.js
 * k6 run --env BASE_URL=https://your-domain.com scripts/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// カスタムメトリクス
const bookingCreated = new Counter('booking_created');
const bookingConflicts = new Counter('booking_conflicts');
const bookingErrors = new Counter('booking_errors');
const conflictRate = new Rate('conflict_rate');
const bookingDuration = new Trend('booking_duration');

// テスト設定
export const options = {
  // 同時実行設定
  scenarios: {
    // 同一スロット競合テスト
    concurrent_booking: {
      executor: 'shared-iterations',
      vus: 10, // 10並列
      iterations: 10, // 合計10回実行
      maxDuration: '30s',
    },
    // 通常の負荷テスト
    normal_load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      startTime: '35s', // 競合テスト後に実行
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95%のリクエストが2秒以内
    http_req_failed: ['rate<0.1'], // 失敗率10%以下
    conflict_rate: ['rate>=0.8'], // 80%以上が競合エラーになることを期待
  },
};

// 環境変数
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// テストデータ生成
function generateTestData(uniqueId) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(13, 30, 0, 0); // 明日13:30
  
  const startAtLocal = tomorrow.toISOString().slice(0, -1) + '+09:00';
  const endDateTime = new Date(tomorrow.getTime() + 15 * 60 * 1000);
  const endAtLocal = endDateTime.toISOString().slice(0, -1) + '+09:00';
  
  return {
    resourceId: '11111111-1111-1111-1111-111111111111',
    startAtLocal,
    endAtLocal,
    email: `k6-test-${uniqueId}-${Date.now()}@example.com`,
    name: `K6テストユーザー${uniqueId}`
  };
}

// メイン実行関数
export default function () {
  const vuId = __VU; // Virtual User ID
  const iterationId = __ITER; // Iteration ID
  const uniqueId = `${vuId}-${iterationId}`;
  
  group('同一スロット予約競合テスト', function () {
    const testData = generateTestData(uniqueId);
    
    const response = http.post(`${BASE_URL}/api/bookings`, JSON.stringify(testData), {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '30s',
    });
    
    // レスポンス時間を記録
    bookingDuration.add(response.timings.duration);
    
    // レスポンスの検証
    const isValidResponse = check(response, {
      'HTTPステータスが200系または409': (r) => r.status === 201 || r.status === 409 || r.status >= 200 && r.status < 300,
      'レスポンス時間が3秒以内': (r) => r.timings.duration < 3000,
      'レスポンスボディが存在': (r) => r.body && r.body.length > 0,
    });
    
    if (!isValidResponse) {
      console.error(`❌ 予期しないレスポンス: ${response.status} - ${response.body}`);
      bookingErrors.add(1);
      return;
    }
    
    let responseData = {};
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error(`❌ JSON解析エラー: ${e.message}`);
      bookingErrors.add(1);
      return;
    }
    
    // 結果に応じてメトリクスを更新
    switch (response.status) {
      case 201:
        // 予約成功
        bookingCreated.add(1);
        conflictRate.add(false);
        
        check(responseData, {
          '予約IDが存在': (data) => data.data && data.data.id,
          'メールアドレスが一致': (data) => data.data && data.data.email === testData.email,
          '予約ステータスが確定': (data) => data.data && data.data.status === 'confirmed',
        });
        
        console.log(`✅ VU${vuId}: 予約成功 - ID: ${responseData.data?.id}`);
        break;
        
      case 409:
        // 競合エラー（期待される結果）
        bookingConflicts.add(1);
        conflictRate.add(true);
        
        check(responseData, {
          'エラーコードがTIME_SLOT_CONFLICT': (data) => data.error && data.error.code === 'TIME_SLOT_CONFLICT',
          'エラーメッセージが存在': (data) => data.error && data.error.message,
        });
        
        console.log(`⚠️ VU${vuId}: 予約競合 - ${responseData.error?.message}`);
        break;
        
      default:
        // その他のエラー
        bookingErrors.add(1);
        console.error(`❌ VU${vuId}: 予期しないステータス ${response.status} - ${responseData.error?.message || response.body}`);
    }
    
    // 少し待機（実際のユーザー行動をシミュレート）
    sleep(0.1);
  });
  
  // 通常負荷テスト用（concurrent_booking以外のシナリオ）
  if (__ENV.SCENARIO === 'normal_load') {
    group('通常予約テスト', function () {
      // 異なる時間スロットでテスト
      const normalTestData = generateTestData(`normal-${uniqueId}`);
      normalTestData.startAtLocal = new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toISOString().slice(0, -1) + '+09:00';
      
      const response = http.post(`${BASE_URL}/api/bookings`, JSON.stringify(normalTestData), {
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s',
      });
      
      check(response, {
        '正常レスポンス': (r) => r.status >= 200 && r.status < 500,
        'レスポンス時間が適切': (r) => r.timings.duration < 5000,
      });
    });
  }
}

// テスト終了後の処理
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    test_duration: data.state.testRunDurationMs,
    scenarios: Object.keys(data.metrics).filter(key => key.includes('scenario')),
    results: {
      booking_created: data.metrics.booking_created?.values?.count || 0,
      booking_conflicts: data.metrics.booking_conflicts?.values?.count || 0,
      booking_errors: data.metrics.booking_errors?.values?.count || 0,
      conflict_rate: data.metrics.conflict_rate?.values?.rate || 0,
      avg_duration: data.metrics.booking_duration?.values?.avg || 0,
      http_requests: data.metrics.http_reqs?.values?.count || 0,
      http_failures: data.metrics.http_req_failed?.values?.rate || 0,
    }
  };
  
  console.log('\n🎯 K6負荷テスト結果サマリー:');
  console.log('='.repeat(50));
  console.log(`📊 総実行時間: ${summary.test_duration}ms`);
  console.log(`📈 HTTPリクエスト数: ${summary.results.http_requests}`);
  console.log(`✅ 予約成功: ${summary.results.booking_created}件`);
  console.log(`⚠️ 予約競合: ${summary.results.booking_conflicts}件`);
  console.log(`❌ エラー: ${summary.results.booking_errors}件`);
  console.log(`📊 競合率: ${(summary.results.conflict_rate * 100).toFixed(1)}%`);
  console.log(`⏱️ 平均レスポンス時間: ${summary.results.avg_duration.toFixed(1)}ms`);
  console.log(`❌ HTTP失敗率: ${(summary.results.http_failures * 100).toFixed(1)}%`);
  
  // 期待結果の評価
  const expectedSuccessCount = 1;
  const expectedConflictCount = 9;
  const actualSuccessCount = summary.results.booking_created;
  const actualConflictCount = summary.results.booking_conflicts;
  
  const isExpectedResult = actualSuccessCount >= 1 && actualConflictCount >= 8;
  console.log(`\n🎯 期待vs実績:`);
  console.log(`予約成功 - 期待: ${expectedSuccessCount}件, 実績: ${actualSuccessCount}件`);
  console.log(`予約競合 - 期待: ${expectedConflictCount}件, 実績: ${actualConflictCount}件`);
  console.log(`総合判定: ${isExpectedResult ? '✅ 期待通り' : '❌ 期待と異なる'}`);
  
  return {
    'stdout': JSON.stringify(summary, null, 2),
    'summary.json': JSON.stringify(summary, null, 2),
  };
}