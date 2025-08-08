import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '予約システム | オンライン予約管理',
  description: 'リソース予約システム - 店舗やサービスの予約をオンラインで簡単管理。15分刻みの時間予約、リアルタイム空き状況確認対応。',
  keywords: ['予約システム', 'オンライン予約', '時間管理', 'リソース管理'],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary-600 text-white px-3 py-2 rounded-md z-50"
          >
            メインコンテンツにスキップ
          </a>
          
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex justify-between h-16" aria-label="メインナビゲーション">
                <div className="flex items-center">
                  <Link 
                    href="/"
                    className="text-xl font-bold text-gray-900 hover:text-primary-700 transition-colors"
                  >
                    <h1>予約システム</h1>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="予約ページに移動"
                  >
                    予約
                  </Link>
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="管理画面に移動"
                  >
                    管理
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          
          <main id="main-content" className="flex-1">
            {children}
          </main>
          
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-sm text-gray-600">
                <p>&copy; 2024 予約システム. Built with Next.js 14 & Tailwind CSS.</p>
                <p className="mt-1">営業時間: 9:00-18:00 (JST) | 15分単位での予約が可能です</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}