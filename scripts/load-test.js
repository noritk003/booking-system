#!/usr/bin/env node

/**
 * 負荷テストスクリプト - 同一スロットに対して10並列POSTを投げるテスト
 * 
 * 実行方法:
 * node scripts/load-test.js
 * 
 * または環境変数付きで実行:
 * BASE_URL=http://localhost:3000 node scripts/load-test.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 10;

console.log('🚀 予約システム負荷テスト開始');
console.log(`📍 対象URL: ${BASE_URL}`);
console.log(`🔢 並列リクエスト数: ${CONCURRENT_REQUESTS}`);

// 明日の12:00のテスト時刻を生成
function generateTestDateTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  
  const startAtLocal = tomorrow.toISOString().slice(0, -1) + '+09:00';
  const endDateTime = new Date(tomorrow.getTime() + 15 * 60 * 1000);
  const endAtLocal = endDateTime.toISOString().slice(0, -1) + '+09:00';
  
  return { startAtLocal, endAtLocal };
}

// HTTP/HTTPSリクエストを送信する関数
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    req.setTimeout(30000); // 30秒のタイムアウト
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// 予約リクエストを作成する関数
async function createBookingRequest(requestId) {
  const { startAtLocal, endAtLocal } = generateTestDateTime();
  
  const bookingData = {
    resourceId: '11111111-1111-1111-1111-111111111111', // テスト用ダミーリソースID
    startAtLocal,
    endAtLocal,
    email: `load-test-${requestId}-${Date.now()}@example.com`,
    name: `負荷テストユーザー${requestId}`
  };
  
  const url = new URL(`${BASE_URL}/api/bookings`);
  const postData = JSON.stringify(bookingData);
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': `LoadTest-${requestId}/1.0`
    },
    protocol: url.protocol
  };
  
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(options, postData);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      requestId,
      success: true,
      status: response.status,
      responseTime,
      data: response.data,
      error: null
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      requestId,
      success: false,
      status: 0,
      responseTime,
      data: null,
      error: error.message
    };
  }
}

// メイン実行関数
async function runLoadTest() {
  const { startAtLocal, endAtLocal } = generateTestDateTime();
  
  console.log(`📅 テスト対象時刻: ${startAtLocal} - ${endAtLocal}`);
  console.log('⏳ 並列リクエスト送信中...\n');
  
  // 並列で複数のリクエストを送信
  const promises = [];
  for (let i = 1; i <= CONCURRENT_REQUESTS; i++) {
    promises.push(createBookingRequest(i));
  }
  
  const startTime = Date.now();
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // 結果分析
  const successful = results.filter(r => r.success && r.status === 201);
  const conflicts = results.filter(r => r.success && r.status === 409);
  const errors = results.filter(r => !r.success || (r.status !== 201 && r.status !== 409));
  
  // 詳細結果表示
  console.log('📊 詳細結果:');
  console.log('='.repeat(80));
  
  results.forEach(result => {
    const status = result.success ? 
      (result.status === 201 ? '✅ 成功' : 
       result.status === 409 ? '⚠️ 競合' : 
       `❌ エラー(${result.status})`) : 
      '❌ 失敗';
    
    const message = result.error || 
      (result.data?.error?.message) || 
      (result.data?.data?.id ? `予約ID: ${result.data.data.id}` : '') ||
      'OK';
    
    console.log(`リクエスト${result.requestId.toString().padStart(2)}: ${status} (${result.responseTime}ms) - ${message}`);
  });
  
  // サマリー表示
  console.log('\n🎯 テスト結果サマリー:');
  console.log('='.repeat(50));
  console.log(`総実行時間: ${totalTime}ms`);
  console.log(`総リクエスト数: ${CONCURRENT_REQUESTS}`);
  console.log(`✅ 成功 (201): ${successful.length} 件`);
  console.log(`⚠️  競合 (409): ${conflicts.length} 件`);
  console.log(`❌ エラー: ${errors.length} 件`);
  
  // 期待される結果: 成功1件、競合9件
  console.log('\n📈 期待vs実績:');
  console.log(`成功数 - 期待: 1件, 実績: ${successful.length}件`);
  console.log(`競合数 - 期待: 9件, 実績: ${conflicts.length}件`);
  
  // 平均レスポンス時間
  const responseTimes = results.filter(r => r.success).map(r => r.responseTime);
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    
    console.log('\n⏱️  レスポンス時間:');
    console.log(`平均: ${avgResponseTime.toFixed(1)}ms`);
    console.log(`最小: ${minResponseTime}ms`);
    console.log(`最大: ${maxResponseTime}ms`);
  }
  
  // 判定
  const isExpectedResult = successful.length === 1 && conflicts.length === (CONCURRENT_REQUESTS - 1);
  
  console.log(`\n🎯 テスト結果: ${isExpectedResult ? '✅ 期待通り' : '❌ 期待と異なる'}`);
  
  if (successful.length > 0) {
    console.log('\n🧹 クリーンアップ情報:');
    successful.forEach(result => {
      if (result.data?.data?.id) {
        console.log(`削除用URL: DELETE ${BASE_URL}/api/bookings/${result.data.data.id}`);
      }
    });
  }
  
  // エラー詳細
  if (errors.length > 0) {
    console.log('\n❌ エラー詳細:');
    errors.forEach(error => {
      console.log(`リクエスト${error.requestId}: ${error.error || 'Unknown error'}`);
    });
  }
  
  console.log('\n🏁 負荷テスト完了');
  process.exit(isExpectedResult ? 0 : 1);
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未処理のPromise拒否:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕捉の例外:', error);
  process.exit(1);
});

// 実行
if (require.main === module) {
  runLoadTest().catch(error => {
    console.error('❌ 負荷テスト実行エラー:', error);
    process.exit(1);
  });
}

module.exports = { runLoadTest, createBookingRequest };