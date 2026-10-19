import React from 'react';
import godysellEmblem from '../assets/images/godysell_logo_emblem.png';
import godysellEmblemInverted from '../assets/images/godysell_logo_emblem_inverted.png';
import godysellFullLogo from '../assets/images/godysell_logo.png';
import godysellFullLogoInverted from '../assets/images/godysell_logo_inverted.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
  variant?: 'composite' | 'full-graphic';
}

export const GodySellLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  inverted = false,
  variant = 'composite'
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  if (variant === 'full-graphic') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <img
          src={inverted ? godysellFullLogoInverted : godysellFullLogo}
          alt="GodySell Ghana"
          className="h-10 sm:h-12 w-auto object-contain"
        />
        {showSubtitle && (
          <span className={`text-[10px] font-semibold tracking-wider ${inverted ? 'text-slate-400' : 'text-slate-500'} uppercase mt-1`}>
            Ghana&apos;s verified marketplace
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Transparent PNG Emblem Icon */}
      <div className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center`}>
        <img
          src={inverted ? godysellEmblemInverted : godysellEmblem}
          alt="GodySell Emblem"
          className="w-full h-full object-contain filter drop-shadow-2xs"
        />
      </div>

      {/* Styled Wordmark matching official new brand identity */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className={`${textSizes[size]} font-black tracking-tight ${inverted ? 'text-white' : 'text-[#07132B]'} font-sans`}>
            Gody<span className="text-[#0066FF] font-black">Sell</span>
          </span>
          <span className={`text-[10px] font-bold tracking-wider ${inverted ? 'text-slate-300' : 'text-slate-500'} uppercase`}>
            Ghana
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-[11px] ${inverted ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
            Ghana&apos;s verified marketplace
          </span>
        )}
      </div>
    </div>
  );
};
