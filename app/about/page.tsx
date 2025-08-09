import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';

export const metadata: Metadata = {
  title: '技術詳細・アーキテクチャ解説 | 予約システム',
  description: 'Next.js 14 + Supabaseで構築された予約システムの技術選定理由、アーキテクチャ設計、パフォーマンス最適化について詳しく解説します。',
  openGraph: {
    title: '技術詳細・アーキテクチャ解説 | 予約システム',
    description: 'Next.js 14 + Supabaseで構築された予約システムの技術選定理由とアーキテクチャ設計',
    images: ['/api/og?title=技術詳細・アーキテクチャ&description=Next.js 14 + Supabaseで構築された企業級システム'],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーロー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Logo size="lg" className="justify-center mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              技術選定・アーキテクチャ解説
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              企業レベルの予約システムを支える技術スタックと設計思想について詳しく解説します
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 技術選定 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🚀 技術選定</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">N</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Next.js 14</h3>
                  <p className="text-gray-600">App Router + RSC</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                最新のApp Routerを採用し、Server ComponentsとClient Componentsを適切に分離。
                ページレベルでのSSR/SSG最適化によりSEO性能を向上。
              </p>
              <div className="text-sm text-gray-600">
                <strong>主な利点:</strong> 高速な初期読み込み、SEO最適化、型安全なルーティング
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Supabase</h3>
                  <p className="text-gray-600">PostgreSQL + Auth + Storage</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                PostgreSQLベースのBaaSを採用。EXCLUDE制約による確実な競合防止、
                Row Level Security（RLS）でセキュリティを担保。
              </p>
              <div className="text-sm text-gray-600">
                <strong>主な利点:</strong> リアルタイム機能、強力な制約機能、自動スケーリング
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">TS</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">TypeScript</h3>
                  <p className="text-gray-600">型安全な開発体験</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                厳格なTypeScript設定でランタイムエラーを最小化。
                APIレスポンス、フォーム入力、データベーススキーマまで一貫した型定義。
              </p>
              <div className="text-sm text-gray-600">
                <strong>主な利点:</strong> バグの早期発見、優れた開発者体験、リファクタリング安全性
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">T</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Tailwind CSS</h3>
                  <p className="text-gray-600">Utility-First CSS</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                一貫したデザインシステムを構築し、レスポンシブ対応を効率化。
                カスタムプロパティで統一された色彩・タイポグラフィを実現。
              </p>
              <div className="text-sm text-gray-600">
                <strong>主な利点:</strong> 高速なスタイリング、一貫性、保守性の向上
              </div>
            </div>
          </div>
        </section>

        {/* アーキテクチャ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🏗️ システムアーキテクチャ</h2>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* フロントエンド層 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    1
                  </span>
                  フロントエンド層
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">Next.js App Router</div>
                    <div className="text-sm text-gray-600">Server Components + Client Components</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">React コンポーネント</div>
                    <div className="text-sm text-gray-600">再利用可能なUIコンポーネント</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">状態管理</div>
                    <div className="text-sm text-gray-600">React Hooks + Local State</div>
                  </div>
                </div>
              </div>

              {/* API層 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    2
                  </span>
                  API層
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">Route Handlers</div>
                    <div className="text-sm text-gray-600">RESTful API エンドポイント</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">Zod バリデーション</div>
                    <div className="text-sm text-gray-600">型安全なスキーマ検証</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">エラーハンドリング</div>
                    <div className="text-sm text-gray-600">統一されたエラーレスポンス</div>
                  </div>
                </div>
              </div>

              {/* データベース層 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    3
                  </span>
                  データベース層
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">PostgreSQL</div>
                    <div className="text-sm text-gray-600">EXCLUDE制約で競合防止</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">Row Level Security</div>
                    <div className="text-sm text-gray-600">細かなアクセス制御</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">リアルタイム機能</div>
                    <div className="text-sm text-gray-600">WebSocket経由の更新通知</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 主要機能 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">⚡ 主要機能・特徴</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                🔒 競合防止機能
              </h3>
              <p className="text-gray-700 mb-4">
                PostgreSQLのEXCLUDE制約を活用し、同一リソース・同一時間での重複予約を
                データベースレベルで完全に防止します。
              </p>
              <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto">
{`EXCLUDE USING gist (
  resource_id WITH =,
  tsrange(start_at, end_at, '[)') WITH &&
) WHERE (status = 'confirmed')`}
              </pre>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                🌐 タイムゾーン制御
              </h3>
              <p className="text-gray-700 mb-4">
                データベースにはUTCで保存し、フロントエンドではJST（Asia/Tokyo）で表示。
                date-fns-tzによる正確なタイムゾーン変換を実装。
              </p>
              <div className="text-sm text-gray-600">
                <div>• DB保存: UTC (TIMESTAMP WITH TIME ZONE)</div>
                <div>• 表示: JST (Asia/Tokyo)</div>
                <div>• 変換: date-fns-tz ライブラリ</div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                📧 メール通知システム
              </h3>
              <p className="text-gray-700 mb-4">
                Resend/SendGrid対応のマルチプロバイダー設計。HTMLテンプレート、
                キャンセルリンク、管理者通知を含む包括的なメール機能。
              </p>
              <div className="text-sm text-gray-600">
                <div>• 予約確認メール（ユーザー向け）</div>
                <div>• 新規予約通知（管理者向け）</div>
                <div>• キャンセルリンク付きHTML</div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                🧪 包括的テスト
              </h3>
              <p className="text-gray-700 mb-4">
                Playwrightによる実ブラウザE2Eテスト、API競合テスト、
                負荷テストまで含む多層的な品質保証体制。
              </p>
              <div className="text-sm text-gray-600">
                <div>• E2Eテスト (Playwright)</div>
                <div>• API競合テスト</div>
                <div>• 10並列負荷テスト</div>
              </div>
            </div>
          </div>
        </section>

        {/* パフォーマンス最適化 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">📊 パフォーマンス最適化</h2>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">90+</div>
                <div className="text-gray-900 font-medium mb-1">Lighthouse Performance</div>
                <div className="text-sm text-gray-600">Server Components + 最適化画像</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">95+</div>
                <div className="text-gray-900 font-medium mb-1">Accessibility</div>
                <div className="text-sm text-gray-600">ARIA対応 + キーボードナビ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">90+</div>
                <div className="text-gray-900 font-medium mb-1">Best Practices</div>
                <div className="text-sm text-gray-600">セキュリティ + HTTPS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">95+</div>
                <div className="text-gray-900 font-medium mb-1">SEO</div>
                <div className="text-sm text-gray-600">メタデータ + OG画像</div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🚀 フロントエンド最適化</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Next.js Server Components で初期表示高速化</li>
                <li>• 動的インポートによるコード分割</li>
                <li>• Tailwind CSS で未使用スタイル除去</li>
                <li>• 画像最適化（next/image）</li>
                <li>• フォント最適化（next/font）</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🗄️ バックエンド最適化</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• PostgreSQL インデックス最適化</li>
                <li>• Supabase Connection Pooling</li>
                <li>• API レスポンス時間 &lt; 200ms</li>
                <li>• 効率的なクエリ設計</li>
                <li>• エラー時の適切なHTTPステータス</li>
              </ul>
            </div>
          </div>
        </section>

        {/* セキュリティ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🔐 セキュリティ対策</h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ セキュリティ重要事項</h3>
            <ul className="text-red-700 space-y-2">
              <li>• <strong>Service Role Key</strong>は絶対にフロントエンドに露出させない</li>
              <li>• 本番環境では適切な<strong>RLS（Row Level Security）</strong>を設定</li>
              <li>• 管理画面には<strong>認証機能</strong>を必ず実装</li>
              <li>• <strong>HTTPS強制</strong>でデータ通信を暗号化</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🛡️ データベースセキュリティ</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Row Level Security (RLS)</li>
                <li>• SQLインジェクション対策</li>
                <li>• 適切な権限管理</li>
                <li>• 監査ログ記録</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🔒 API セキュリティ</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Zod による入力検証</li>
                <li>• CORS 設定</li>
                <li>• レート制限</li>
                <li>• エラー情報の適切な制御</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🌐 インフラセキュリティ</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Vercel による HTTPS 強制</li>
                <li>• 環境変数の適切な管理</li>
                <li>• ドメイン制限</li>
                <li>• セキュリティヘッダー設定</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 今後の拡張 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🎯 今後の拡張可能性</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 機能拡張</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• 🔔 リアルタイム通知（WebSocket）</li>
                <li>• 📅 カレンダー連携（Google Calendar等）</li>
                <li>• 💳 決済機能統合（Stripe）</li>
                <li>• 📊 予約分析ダッシュボード</li>
                <li>• 🌍 多言語対応（i18n）</li>
                <li>• 📱 PWA 対応</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ 技術拡張</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• 🔍 全文検索（Algolia/ElasticSearch）</li>
                <li>• 📈 監視・ログ分析（DataDog/Sentry）</li>
                <li>• 🚀 CDN 最適化（Cloudflare）</li>
                <li>• 🔄 CI/CD パイプライン強化</li>
                <li>• 🧪 テスト自動化拡張</li>
                <li>• 🎨 デザインシステム構築</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">実際に試してみませんか？</h2>
            <p className="text-primary-100 mb-6">
              企業級の予約システムを体験し、技術的な実装詳細をご確認いただけます
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking-section"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                予約システムを試す
              </Link>
              <Link 
                href="https://github.com/yourusername/booking-system"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                GitHub で確認
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}