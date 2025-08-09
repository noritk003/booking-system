interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg 
        className={`${sizeClasses[size]} text-primary-600`}
        viewBox="0 0 40 40" 
        fill="currentColor"
        aria-label="予約システムロゴ"
      >
        {/* カレンダーベース */}
        <rect x="4" y="8" width="32" height="28" rx="4" fill="currentColor" opacity="0.1"/>
        <rect x="4" y="8" width="32" height="8" rx="4" fill="currentColor"/>
        
        {/* カレンダーリング穴 */}
        <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
        <circle cx="20" cy="6" r="1.5" fill="currentColor"/>
        <circle cx="28" cy="6" r="1.5" fill="currentColor"/>
        
        {/* 時計の針（予約時間を表現） */}
        <g transform="translate(20, 24)">
          <circle r="8" fill="white" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="0" y1="0" x2="0" y2="-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="0" y1="0" x2="3" y2="0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle r="1" fill="currentColor"/>
        </g>
        
        {/* 予約ドット */}
        <circle cx="10" cy="20" r="1" fill="currentColor" opacity="0.6"/>
        <circle cx="14" cy="20" r="1" fill="currentColor" opacity="0.6"/>
        <circle cx="10" cy="24" r="1" fill="currentColor"/>
        <circle cx="30" cy="20" r="1" fill="currentColor" opacity="0.6"/>
        <circle cx="30" cy="28" r="1" fill="currentColor" opacity="0.6"/>
      </svg>
      
      {size !== 'sm' && (
        <span className={`ml-2 font-bold text-gray-900 ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
          予約システム
        </span>
      )}
    </div>
  );
}