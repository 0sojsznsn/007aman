import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Send, 
  QrCode, 
  ArrowLeftRight, 
  Bell, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Token } from '../../types/wallet';
import { POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../../data/constants';

interface TokenDetailModalProps {
  token: Token | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (tokenId: string) => void;
  onReceive: (tokenId: string) => void;
  onSwap: (tokenId: string) => void;
  onSetAlert: (tokenSymbol: string) => void;
}

export const TokenDetailModal: React.FC<TokenDetailModalProps> = ({
  token,
  isOpen,
  onClose,
  onSend,
  onReceive,
  onSwap,
  onSetAlert,
}) => {
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '1M' | '1Y'>('24H');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !token) return null;

  const isPositive = token.change24h >= 0;
  const holdingUsd = token.balance * token.priceUsd;

  const currentAddress = token.networkId === 'bitcoin' ? BITCOIN_ADDRESS : (token.id === 'usdt-polygon' ? POLYGON_USDT_ADDRESS : token.address);

  // Generate chart coordinates based on history
  const points = token.history24h || [token.priceUsd * 0.98, token.priceUsd * 0.99, token.priceUsd, token.priceUsd * 1.01];
  const minVal = Math.min(...points) * 0.995;
  const maxVal = Math.max(...points) * 1.005;
  const range = maxVal - minVal || 1;

  const svgWidth = 320;
  const svgHeight = 120;
  const pathD = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * svgWidth;
      const y = svgHeight - ((val - minVal) / range) * (svgHeight - 15) - 8;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const areaD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0c1527] border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Token Header */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={token.icon}
            alt={token.name}
            className="w-12 h-12 rounded-full bg-slate-800 p-1 object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{token.name}</h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                {token.symbol}
              </span>
            </div>
            <span className="text-xs text-blue-400">{token.networkName}</span>
          </div>
        </div>

        {/* Price & 24h Change */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ${token.priceUsd.toLocaleString(undefined, {
                minimumFractionDigits: token.priceUsd > 10 ? 2 : 4,
                maximumFractionDigits: token.priceUsd > 10 ? 2 : 4,
              })}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Real-time Spot Index</div>
          </div>
          <div
            className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-xl ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>
              {isPositive ? '+' : ''}
              {token.change24h}%
            </span>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-3">
          {(['1H', '24H', '7D', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative w-full h-[130px] bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden p-2 flex items-center justify-center mb-5">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${token.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.4" />
                <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#grad-${token.id})`} />
            <path
              d={pathD}
              fill="none"
              stroke={isPositive ? '#10B981' : '#F43F5E'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* User Balance in this Token */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-blue-950/30 border border-slate-800 rounded-2xl mb-5">
          <div className="text-xs text-slate-400 mb-1">Your Portfolio Balance</div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-bold text-white">
              {token.balance.toLocaleString()} {token.symbol}
            </div>
            <div className="text-sm font-semibold text-slate-300">
              ≈ ${holdingUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSend(token.id);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Send</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onReceive(token.id);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Receive</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSwap(token.id);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Swap</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSetAlert(token.symbol);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center mb-1.5">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Alert</span>
          </button>
        </div>

        {/* Address / Contract Details */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Network:</span>
            <span className="font-semibold text-slate-200">{token.networkName}</span>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center mb-1 text-slate-400">
              <span>{token.networkId === 'bitcoin' ? 'BTC Native Address' : 'Contract / Address'}:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-300 bg-black/40 p-2 rounded-lg break-all select-all border border-slate-800">
              {currentAddress}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
