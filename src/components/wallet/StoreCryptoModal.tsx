import React, { useState } from 'react';
import { 
  X, 
  ArrowDownCircle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  QrCode, 
  ExternalLink,
  Coins,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWallet } from '../../context/WalletContext';
import { POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../../data/constants';

interface StoreCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTokenId?: string;
}

export const StoreCryptoModal: React.FC<StoreCryptoModalProps> = ({
  isOpen,
  onClose,
  defaultTokenId = 'usdt-polygon',
}) => {
  const { tokens, storeCrypto, walletMode, syncBlockchainData, isSyncingBlockchain } = useWallet();

  const [selectedTokenId, setSelectedTokenId] = useState<string>(defaultTokenId);
  const [storeAmount, setStoreAmount] = useState<string>('500');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{ amount: number; txHash: string; tokenSymbol: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentToken = tokens.find((t) => t.id === selectedTokenId) || tokens[0];
  const targetAddress = currentToken.networkId === 'bitcoin' ? BITCOIN_ADDRESS : POLYGON_USDT_ADDRESS;

  const handleExecuteStore = async () => {
    const parsed = parseFloat(storeAmount);
    if (!parsed || parsed <= 0) {
      setErrorMsg('Please enter an amount greater than 0');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const res = await storeCrypto({
        tokenId: currentToken.id,
        amount: parsed,
      });

      setIsProcessing(false);
      setSuccessReceipt({
        amount: parsed,
        txHash: res.txHash,
        tokenSymbol: currentToken.symbol,
      });
      confetti({ particleCount: 70, spread: 60 });
    } catch (err: unknown) {
      setIsProcessing(false);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to store crypto');
    }
  };

  const handleReset = () => {
    setSuccessReceipt(null);
    setStoreAmount('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0c1527] border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {successReceipt ? (
          <div className="flex flex-col items-center text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Crypto Stored in Vault!</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Successfully credited and permanently stored {successReceipt.amount} {successReceipt.tokenSymbol} to your wallet.
            </p>

            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Vault Target:</span>
                <span className="font-mono text-slate-200">{targetAddress.substring(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">Confirmed On-Chain</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Receipt Hash:</span>
                <div className="font-mono text-[11px] text-blue-400 break-all bg-black/40 p-2 rounded-lg border border-slate-800">
                  {successReceipt.txHash}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Done & Return to Wallet
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                <ArrowDownCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Store & Deposit Crypto</h3>
              <p className="text-xs text-slate-400">Credit assets directly to your persistent vault</p>
            </div>

            {/* Token Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Crypto to Store
              </label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                {tokens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.symbol}) — Current Vault: {t.balance}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount to Store */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Amount to Store
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={storeAmount}
                  onChange={(e) => {
                    setStoreAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-4 pr-16 text-xl font-bold text-white focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {currentToken.symbol}
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1.5 mt-2">
                {[100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStoreAmount(preset.toString())}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Address Card */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Receiving Vault Address:</span>
                <span className="text-emerald-400 font-semibold">{currentToken.networkName}</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 bg-black/40 p-2 rounded-xl break-all border border-slate-800 select-all">
                {targetAddress}
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 text-center font-medium mb-3">
                {errorMsg}
              </div>
            )}

            {/* Store Action Button */}
            <button
              type="button"
              onClick={handleExecuteStore}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Storing into Vault...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Store {storeAmount || '0'} {currentToken.symbol}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
