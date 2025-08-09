import Link from 'next/link';
import Logo from './Logo';
import Button from './ui/Button';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 sm:py-24">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* ロゴ */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          {/* メインキャッチコピー */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="block">かんたん予約</span>
            <span className="block text-primary-600">プロフェッショナル管理</span>
          </h1>
          
          {/* サブキャッチコピー */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Next.js 14 + Supabaseで構築された
            <br className="hidden sm:block" />
            <span className="text-primary-700 font-semibold">企業級予約管理システム</span>
          </p>
          
          {/* 特徴 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-primary-100">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-semibold text-gray-900 mb-2">15分刻み予約</h3>
              <p className="text-gray-600 text-sm">営業時間内での柔軟な時間選択</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-primary-100">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-2">競合防止</h3>
              <p className="text-gray-600 text-sm">PostgreSQL制約による確実な重複回避</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-primary-100">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold text-gray-900 mb-2">自動通知</h3>
              <p className="text-gray-600 text-sm">予約確認・キャンセルメール</p>
            </div>
          </div>
          
          {/* CTA ボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="#booking-section">
                今すぐ予約する
              </Link>
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold"
            >
              <Link href="/about">
                技術詳細を見る
              </Link>
            </Button>
          </div>
          
          {/* 技術スタック */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">技術スタック</p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-.120-.951-.143-.05-.023-2.11.154-2.11.154-.207-.106-.207-.106-.207-.106s.329-.1.758-.235c.27-.084.76-.25 1.08-.367l.287-.104.033-.013c.016-.008.016-.008.016-.008s-.329.1-.758.235c-.27.084-.76.25-1.08.367-.287.104-.33.122-.33.122l-.254.088z"/>
                </svg>
                <span className="text-sm font-medium">Next.js 14</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 9.027 19.2 12.001 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
                </svg>
                <span className="text-sm font-medium">Tailwind CSS</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 16.171c-.063.103-.16.174-.274.196-.114.021-.234-.006-.33-.075-2.745-1.968-6.11-2.111-10.696-1.548-.175.021-.341-.078-.391-.242-.05-.164.02-.335.173-.402 5.011-.601 8.786-.369 11.796 1.785.1.072.157.189.149.309-.008.12-.08.226-.177.291-.097.065-.214.081-.327.05-.113-.031-.209-.115-.246-.226zm.49-1.096c-.077.126-.196.214-.328.243-.132.029-.271-.007-.382-.099-3.161-2.246-7.977-2.454-11.725-1.78-.21.038-.42-.063-.499-.239-.08-.176.01-.379.209-.475 4.216-.758 9.597-.392 13.31 2.041.123.081.193.226.18.374-.013.148-.104.275-.234.341-.13.066-.287.069-.423.014-.136-.055-.244-.166-.285-.296zm.044-1.142c-3.794-2.686-10.045-2.936-13.66-1.626-.252.09-.526-.04-.614-.292-.089-.252.04-.526.293-.615 4.181-1.518 11.044-1.225 15.335 1.879.205.148.247.432.099.638-.148.205-.431.247-.637.099-.206-.148-.247-.432-.099-.638-.148-.205-.431-.247-.637-.099z"/>
                </svg>
                <span className="text-sm font-medium">Supabase</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zM12 7.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5z"/>
                </svg>
                <span className="text-sm font-medium">TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}