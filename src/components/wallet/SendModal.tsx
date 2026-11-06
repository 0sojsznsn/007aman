import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  Fuel, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Fingerprint,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWallet } from '../../context/WalletContext';
import { Token } from '../../types/wallet';
import { BiometricService } from '../../services/biometric';
import { POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../../data/constants';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTokenId?: string;
}

export const SendModal: React.FC<SendModalProps> = ({
  isOpen,
  onClose,
  defaultTokenId = 'usdt-polygon',
}) => {
  const { tokens, sendCrypto } = useWallet();

  const [selectedTokenId, setSelectedTokenId] = useState<string>(defaultTokenId);
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [gasTier, setGasTier] = useState<'slow' | 'average' | 'fast'>('average');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [txResult, setTxResult] = useState<{ txHash: string; feeUsd: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentToken = tokens.find((t) => t.id === selectedTokenId) || tokens[0];

  const gasFeeLookup = {
    polygon: { slow: 0.005, average: 0.015, fast: 0.035 },
    bitcoin: { slow: 0.85, average: 1.65, fast: 3.20 },
    ethereum: { slow: 1.50, average: 2.80, fast: 5.50 },
    solana: { slow: 0.0005, average: 0.001, fast: 0.002 },
    bsc: { slow: 0.02, average: 0.05, fast: 0.10 },
    arbitrum: { slow: 0.01, average: 0.03, fast: 0.06 },
    avalanche: { slow: 0.02, average: 0.04, fast: 0.08 },
    all: { slow: 0.01, average: 0.02, fast: 0.05 },
  };

  const netGas = gasFeeLookup[currentToken.networkId] || gasFeeLookup.polygon;
  const currentGasFee = netGas[gasTier];

  const parsedAmount = parseFloat(amount) || 0;
  const amountUsd = parsedAmount * currentToken.priceUsd;

  const handleMaxAmount = () => {
    // Leave tiny buffer for gas if native token
    if (currentToken.symbol === 'POL' || currentToken.symbol === 'ETH' || currentToken.symbol === 'BTC') {
      const maxVal = Math.max(0, currentToken.balance - 0.002);
      setAmount(maxVal.toString());
    } else {
      setAmount(currentToken.balance.toString());
    }
    setErrorMsg('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRecipient(text.trim());
        setErrorMsg('');
      }
    } catch {
      setErrorMsg('Clipboard permission denied. Please paste manually.');
    }
  };

  const handleSend = async () => {
    if (!recipient.trim()) {
      setErrorMsg('Please enter a valid recipient address');
      return;
    }
    if (parsedAmount <= 0) {
      setErrorMsg('Please specify an amount greater than 0');
      return;
    }
    if (parsedAmount > currentToken.balance) {
      setErrorMsg(`Insufficient ${currentToken.symbol} balance`);
      return;
    }

    setErrorMsg('');
    setIsAuthorizing(true);

    try {
      // Biometric authentication gate
      const auth = await BiometricService.authenticateBiometric(`Confirm Send ${parsedAmount} ${currentToken.symbol}`);
      if (!auth.success) {
        setErrorMsg('Biometric authentication failed. Transaction cancelled.');
        setIsAuthorizing(false);
        return;
      }

      setIsAuthorizing(false);
      setIsBroadcasting(true);

      // Execute transfer in state
      const res = await sendCrypto({
        tokenId: currentToken.id,
        toAddress: recipient.trim(),
        amount: parsedAmount,
        feeUsd: currentGasFee,
      });

      setIsBroadcasting(false);
      setTxResult({
        txHash: res.txHash,
        feeUsd: currentGasFee,
      });

      // Confetti celebration
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      setIsAuthorizing(false);
      setIsBroadcasting(false);
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  const handleReset = () => {
    setTxResult(null);
    setAmount('');
    setRecipient('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0c1527] border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {txResult ? (
          /* Transaction Sent Success View */
          <div className="flex flex-col items-center text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Transaction Broadcasted!</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              Successfully sent {parsedAmount} {currentToken.symbol} to the blockchain network.
            </p>

            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Network:</span>
                <span className="font-semibold text-slate-200">{currentToken.networkName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Amount:</span>
                <span className="font-semibold text-white">
                  {parsedAmount} {currentToken.symbol} (~${amountUsd.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Network Fee:</span>
                <span className="font-semibold text-slate-300">${txResult.feeUsd.toFixed(4)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">Transaction Hash:</span>
                <div className="flex items-center justify-between bg-black/40 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-blue-400">
                  <span className="truncate max-w-[260px]">{txResult.txHash}</span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(txResult.txHash);
                    }}
                    title="Copy Hash"
                    className="hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Back to Wallet
            </button>
          </div>
        ) : (
          /* Transfer Form */
          <div>
            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-white">Send Crypto</h3>
              <p className="text-xs text-slate-400">Instant cross-network biometric transfers</p>
            </div>

            {/* Select Asset */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Asset
              </label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-2.5 px-3.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {tokens.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.name} ({token.symbol}) — Bal: {token.balance} (~${(token.balance * token.priceUsd).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Address */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Recipient Address
                </label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  Paste
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    currentToken.networkId === 'bitcoin'
                      ? 'bc1q... or 1...'
                      : '0x... EVM address'
                  }
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-3.5 pr-10 text-xs font-mono text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>

              {/* Sample Addresses Quick Select */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500">Quick Test:</span>
                <button
                  type="button"
                  onClick={() =>
                    setRecipient(
                      currentToken.networkId === 'bitcoin'
                        ? BITCOIN_ADDRESS
                        : POLYGON_USDT_ADDRESS
                    )
                  }
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md cursor-pointer border border-slate-700"
                >
                  My Address
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRecipient(
                      currentToken.networkId === 'bitcoin'
                        ? 'bc1q9d83h65p2a80693x3m6s4j4y25n8z908w5z0w4'
                        : '0x71C8fb866A3703550f5473950b719Ec3F65330aF'
                    )
                  }
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md cursor-pointer border border-slate-700"
                >
                  External Whale
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Amount
                </label>
                <span className="text-xs text-slate-400">
                  Available: <strong className="text-slate-200">{currentToken.balance} {currentToken.symbol}</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-3.5 pr-20 text-lg font-bold text-white focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    MAX
                  </button>
                  <span className="text-xs text-slate-400 font-semibold">{currentToken.symbol}</span>
                </div>
              </div>
              {parsedAmount > 0 && (
                <div className="mt-1 text-right text-xs text-slate-400">
                  ≈ ${amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </div>
              )}
            </div>

            {/* Gas Speed Selector */}
            <div className="mb-5 p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-blue-400" />
                  Network Fee
                </span>
                <span className="text-xs font-bold text-slate-200">${currentGasFee.toFixed(3)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'average', 'fast'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setGasTier(tier)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all capitalize cursor-pointer border ${
                      gasTier === tier
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={isAuthorizing || isBroadcasting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isAuthorizing ? (
                <>
                  <Fingerprint className="w-5 h-5 text-cyan-300 animate-pulse" />
                  <span>Verifying Biometric Security...</span>
                </>
              ) : isBroadcasting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Broadcasting to {currentToken.networkName}...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Transfer</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
