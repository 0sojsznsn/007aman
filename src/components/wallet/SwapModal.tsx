import React, { useState } from 'react';
import { X, ArrowDownUp, RefreshCw, Zap, Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWallet } from '../../context/WalletContext';
import { BiometricService } from '../../services/biometric';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromId?: string;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  defaultFromId = 'usdt-polygon',
}) => {
  const { tokens, swapCrypto } = useWallet();

  const [fromTokenId, setFromTokenId] = useState<string>(defaultFromId);
  const [toTokenId, setToTokenId] = useState<string>('btc-bitcoin');
  const [fromAmount, setFromAmount] = useState<string>('250');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapSuccess, setSwapSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const fromToken = tokens.find((t) => t.id === fromTokenId) || tokens[0];
  const toToken = tokens.find((t) => t.id === toTokenId) || tokens[1];

  const parsedFromAmount = parseFloat(fromAmount) || 0;
  
  // Calculate exchange rate based on priceUsd
  const rate = toToken.priceUsd > 0 ? fromToken.priceUsd / toToken.priceUsd : 0;
  const toAmount = (parsedFromAmount * rate * (1 - slippage / 100)).toFixed(
    toToken.symbol === 'BTC' ? 6 : 4
  );

  const handleInvert = () => {
    const temp = fromTokenId;
    setFromTokenId(toTokenId);
    setToTokenId(temp);
    setFromAmount('');
    setErrorMsg('');
  };

  const handleExecuteSwap = async () => {
    if (parsedFromAmount <= 0) {
      setErrorMsg('Enter an amount greater than 0');
      return;
    }
    if (parsedFromAmount > fromToken.balance) {
      setErrorMsg(`Insufficient ${fromToken.symbol} balance`);
      return;
    }

    setErrorMsg('');
    setIsSwapping(true);

    try {
      // Biometric authorization
      const auth = await BiometricService.authenticateBiometric(`Swap ${parsedFromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
      if (!auth.success) {
        setErrorMsg('Biometric authentication cancelled');
        setIsSwapping(false);
        return;
      }

      await swapCrypto({
        fromTokenId,
        toTokenId,
        fromAmount: parsedFromAmount,
        toAmount: parseFloat(toAmount),
        slippage,
      });

      setIsSwapping(false);
      setSwapSuccess(true);
      confetti({ particleCount: 75, spread: 70 });
    } catch (err: unknown) {
      setIsSwapping(false);
      setErrorMsg(err instanceof Error ? err.message : 'Swap execution failed');
    }
  };

  const handleClose = () => {
    setSwapSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0c1527] border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {swapSuccess ? (
          <div className="flex flex-col items-center text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Swap Completed!</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Successfully exchanged {parsedFromAmount} {fromToken.symbol} for {toAmount} {toToken.symbol} with optimal routing.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5 pr-8">
              <div>
                <h3 className="text-lg font-bold text-white">TrustSwap & Bridge</h3>
                <p className="text-xs text-slate-400">Zero-gas slippage protected routing</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Swap Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {showSettings && (
              <div className="mb-4 p-3 bg-slate-900 border border-slate-800 rounded-2xl animate-fadeIn">
                <div className="text-xs font-semibold text-slate-300 mb-2">Slippage Tolerance</div>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSlippage(val)}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all ${
                        slippage === val
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* From Token Card */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl mb-2">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                <span>You Pay</span>
                <span>
                  Balance: <strong className="text-slate-200">{fromToken.balance} {fromToken.symbol}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => {
                    setFromAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-transparent text-xl font-bold text-white focus:outline-none placeholder:text-slate-600"
                />
                <select
                  value={fromTokenId}
                  onChange={(e) => setFromTokenId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {tokens.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.symbol} ({t.networkName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-1 flex justify-between items-center text-[11px] text-slate-500">
                <span>≈ ${(parsedFromAmount * fromToken.priceUsd).toFixed(2)} USD</span>
                <button
                  type="button"
                  onClick={() => setFromAmount(fromToken.balance.toString())}
                  className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Invert Button */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                type="button"
                onClick={handleInvert}
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 border-2 border-[#0c1527] transition-transform active:rotate-180 cursor-pointer"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* To Token Card */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl mt-2 mb-4">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                <span>You Receive</span>
                <span>
                  Balance: <strong className="text-slate-200">{toToken.balance} {toToken.symbol}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-full text-xl font-bold text-emerald-400 py-1">
                  {toAmount}
                </div>
                <select
                  value={toTokenId}
                  onChange={(e) => setToTokenId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {tokens.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.symbol} ({t.networkName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                ≈ ${(parseFloat(toAmount) * toToken.priceUsd).toFixed(2)} USD
              </div>
            </div>

            {/* Route & Rate Info */}
            <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-2xl mb-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Rate:</span>
                <span className="font-mono text-slate-200">
                  1 {fromToken.symbol} ≈ {rate.toFixed(rate < 0.001 ? 7 : 4)} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Routing:</span>
                <span className="text-blue-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  {fromToken.networkName} ➔ TrustRouter ➔ {toToken.networkName}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Max Slippage:</span>
                <span className="text-slate-200 font-semibold">{slippage}%</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 text-xs text-rose-400 text-center font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleExecuteSwap}
              disabled={isSwapping}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSwapping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Authorizing Swap with Biometrics...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Swap Now</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
