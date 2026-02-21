/*
 * AI SEO PageScore - Brand Assets
 * © 2025 McDougall Interactive. All rights reserved.
 */

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      
      {/* Main circle */}
      <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
      
      {/* AI letters flowing into ascending chart bars */}
      <g fill="white">
        {/* Letter "A" */}
        <path d="M12 28L16 14L20 28M14 24H18" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Letter "I" as smallest bar, growing to show success */}
        <rect x="22" y="24" width="2.5" height="4" rx="0.5" />
        <rect x="25.5" y="20" width="2.5" height="8" rx="0.5" />
        <rect x="29" y="16" width="2.5" height="12" rx="0.5" />
      </g>
    </svg>
  );
}

export function LogoText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-lg font-bold text-gray-900 dark:text-white">AI SEO PageScore</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Competitive Analysis</span>
    </div>
  );
}