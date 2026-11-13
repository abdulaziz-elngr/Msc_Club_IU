import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subtitleColor?: string;
}

/** Official Microsoft Student Clubs emblem + wordmark. */
export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-slate-900 dark:text-white',
  subtitleColor = 'text-[#0078d4]',
}) => {
  const px = { sm: 28, md: 38, lg: 52, xl: 72 }[size];
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img src="/brand/msc-emblem.png" width={px} height={px} alt="Microsoft Student Clubs" className="shrink-0 rounded-[3px]" style={{ width: px, height: px }} />
      {showText && (
        <div className="flex flex-col text-start">
          <span className={`font-bold tracking-tight leading-tight ${textColor} ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
            Microsoft Student Clubs
          </span>
          <span className={`font-medium tracking-wide leading-tight ${subtitleColor} ${size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-[11px]' : 'text-xs'}`}>
            Innovation University
          </span>
        </div>
      )}
    </div>
  );
};

/** Theme-aware partner logos (Innovation University / Microsoft). */
export const PartnerLogo: React.FC<{ which: 'iu' | 'ms'; className?: string; forceLight?: boolean }> = ({ which, className = 'h-8', forceLight }) => {
  const base = which === 'iu' ? '/brand/iu-logo' : '/brand/microsoft-logo';
  const alt = which === 'iu' ? 'Innovation University' : 'Microsoft';
  return (
    <>
      <img src={`${base}.png`} alt={alt} className={`${className} w-auto object-contain ${forceLight ? 'hidden' : 'dark:hidden'}`} />
      <img src={`${base}-light.png`} alt={alt} className={`${className} w-auto object-contain ${forceLight ? '' : 'hidden dark:block'}`} />
    </>
  );
};
