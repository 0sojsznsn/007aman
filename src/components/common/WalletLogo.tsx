import React from 'react';
import { ShieldCheck, Crosshair, Sparkles } from 'lucide-react';

interface WalletLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const WalletLogo: React.FC<WalletLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-sm', num: 'text-xs', icon: 'w-3.5 h-3.5' },
    md: { box: 'w-9 h-9', text: 'text-base', num: 'text-sm', icon: 'w-4 h-4' },
    lg: { box: 'w-14 h-14', text: 'text-xl', num: 'text-lg', icon: 'w-7 h-7' },
    xl: { box: 'w-20 h-20', text: 'text-3xl', num: 'text-2xl', icon: 'w-10 h-10' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 007 Icon Badge */}
      <div className={`relative ${current.box} rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-400 p-[2px] shadow-lg shadow-amber-500/20 group`}>
        <div className="w-full h-full bg-[#080d1a] rounded-2xl flex items-center justify-center relative overflow-hidden">
          {/* Subtle circuit overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-300 font-mono">
            <span className={current.num}>007</span>
          </div>

          {/* Micro crosshair corner accent */}
          <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-white font-mono ${current.text}`}>
              007<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400">wallet</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
              PRO
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight">
            Encrypted Multi-Chain Vault
          </span>
        </div>
      )}
    </div>
  );
};
