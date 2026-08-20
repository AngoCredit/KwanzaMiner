import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'color';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  variant = 'color',
  showSubtitle = true 
}) => {
  const imgSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl'
  };

  const isDarkVariant = variant === 'dark';
  const mainTextColor = isDarkVariant ? 'text-slate-900' : 'text-white';
  const subtitleTextColor = isDarkVariant ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="flex items-center gap-3 select-none cursor-pointer group">
      {/* Official Brand Emblem */}
      <img
        src="/logo.png"
        alt="KwanzaCoin Logo"
        className={`${imgSizes[size]} object-contain rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 shadow-md`}
      />

      <div className="flex flex-col leading-none justify-center">
        <div className={`font-black tracking-tight flex items-center gap-1.5 ${titleSizes[size]}`}>
          <span className={mainTextColor}>KWANZA</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
            COIN
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-950/80 text-amber-300 font-mono font-bold border border-amber-700/60 shadow-xs">
            KC
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase mt-1 ${subtitleTextColor}`}>
            MINERAÇÃO DEFI & ATIVOS • ANGOLA
          </span>
        )}
      </div>
    </div>
  );
};
