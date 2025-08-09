import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || '予約システム';
    const description = searchParams.get('description') || 'Next.js 14 + Supabaseで構築された企業級予約管理システム';
    const type = searchParams.get('type') || 'website';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
          }}
        >
          {/* 背景装飾 */}
          <div
            style={{
              position: 'absolute',
              top: -200,
              right: -200,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -150,
              left: -150,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          />

          {/* メインコンテンツ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              maxWidth: '80%',
            }}
          >
            {/* ロゴ・アイコン */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 40,
              }}
            >
              {/* カレンダーアイコン */}
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: 'white',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 20,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
              >
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 40 40"
                  fill="#4f46e5"
                >
                  <rect x="4" y="8" width="32" height="28" rx="4" fill="#4f46e5" fillOpacity="0.1"/>
                  <rect x="4" y="8" width="32" height="8" rx="4" fill="#4f46e5"/>
                  <circle cx="12" cy="6" r="1.5" fill="#4f46e5"/>
                  <circle cx="20" cy="6" r="1.5" fill="#4f46e5"/>
                  <circle cx="28" cy="6" r="1.5" fill="#4f46e5"/>
                  <g transform="translate(20, 24)">
                    <circle r="8" fill="white" stroke="#4f46e5" strokeWidth="1.5"/>
                    <line x1="0" y1="0" x2="0" y2="-4" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="0" x2="3" y2="0" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle r="1" fill="#4f46e5"/>
                  </g>
                  <circle cx="10" cy="20" r="1" fill="#4f46e5" fillOpacity="0.6"/>
                  <circle cx="14" cy="20" r="1" fill="#4f46e5" fillOpacity="0.6"/>
                  <circle cx="10" cy="24" r="1" fill="#4f46e5"/>
                  <circle cx="30" cy="20" r="1" fill="#4f46e5" fillOpacity="0.6"/>
                  <circle cx="30" cy="28" r="1" fill="#4f46e5" fillOpacity="0.6"/>
                </svg>
              </div>
            </div>

            {/* タイトル */}
            <h1
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: 'white',
                marginBottom: 20,
                textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>

            {/* 説明文 */}
            <p
              style={{
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 40,
                lineHeight: 1.4,
                maxWidth: '90%',
              }}
            >
              {description}
            </p>

            {/* 技術スタック */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: '20px 40px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 50,
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>
                Next.js 14
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 24 }}>•</div>
              <div style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>
                TypeScript
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 24 }}>•</div>
              <div style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>
                Supabase
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 24 }}>•</div>
              <div style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>
                Tailwind CSS
              </div>
            </div>
          </div>

          {/* ウォーターマーク */}
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              right: 40,
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            booking-system.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.error('OG Image generation failed:', e);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}