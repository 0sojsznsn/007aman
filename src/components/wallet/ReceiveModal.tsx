import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Share2, AlertTriangle, ArrowUpDown, ShieldCheck } from 'lucide-react';
import { Token } from '../../types/wallet';
import { useWallet } from '../../context/WalletContext';
import { POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../../data/constants';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTokenId?: string;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  isOpen,
  onClose,
  defaultTokenId = 'usdt-polygon',
}) => {
  const { tokens } = useWallet();
  const [selectedTokenId, setSelectedTokenId] = useState<string>(defaultTokenId);
  const [copied, setCopied] = useState(false);
  const [requestAmount, setRequestAmount] = useState<string>('');
  const [showAmountInput, setShowAmountInput] = useState(false);

  if (!isOpen) return null;

  const currentToken = tokens.find((t) => t.id === selectedTokenId) || tokens[0];

  // Specific address logic:
  // USDT Polygon => 0x32DC2972DB7c6d510BbA926DdDC77FaF5e229759
  // BTC => bc1qpu7meyw303j0dgyndcxuxec5wnn9kguwfke4me
  const rawAddress = currentToken.networkId === 'bitcoin' ? BITCOIN_ADDRESS : currentToken.address;

  // QR value can optionally include amount URI
  let qrCodeValue = rawAddress;
  if (requestAmount && parseFloat(requestAmount) > 0) {
    if (currentToken.networkId === 'bitcoin') {
      qrCodeValue = `bitcoin:${rawAddress}?amount=${requestAmount}`;
    } else {
      qrCodeValue = `ethereum:${rawAddress}?value=${requestAmount}`;
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rawAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${currentToken.symbol} (${currentToken.networkName}) Address`,
          text: `My ${currentToken.symbol} address: ${rawAddress}`,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0c1527] border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-white">Receive Crypto</h3>
          <p className="text-xs text-slate-400">Select token and scan QR code or copy address</p>
        </div>

        {/* Token Selector Row */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Receiving Asset
          </label>
          <div className="relative">
            <select
              value={selectedTokenId}
              onChange={(e) => setSelectedTokenId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
            >
              {tokens.map((token) => (
                <option key={token.id} value={token.id} className="bg-[#0c1527] text-white">
                  {token.name} ({token.symbol}) — {token.networkName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-xs bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-lg">
                {currentToken.networkName}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 bg-white rounded-3xl shadow-lg my-2 mx-auto w-fit">
          <QRCodeSVG
            value={qrCodeValue}
            size={195}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#050b14"
            includeMargin={false}
          />
        </div>

        {/* Address Card */}
        <div className="mt-5 p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Your {currentToken.symbol} Address ({currentToken.networkName})
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Verified Active</span>
          </div>

          <p className="text-xs font-mono text-slate-200 break-all bg-black/40 p-2.5 rounded-xl border border-slate-800 select-all leading-relaxed">
            {rawAddress}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Share Address"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowAmountInput(!showAmountInput)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer text-xs font-medium"
              title="Set Amount"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {showAmountInput && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="number"
                placeholder={`Request specific ${currentToken.symbol} amount`}
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setRequestAmount('')}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Network Safeguard Warning */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-snug">
            {currentToken.id === 'usdt-polygon' ? (
              <span>
                <strong>Important:</strong> Only send <strong>USDT via the Polygon PoS network</strong> to this address. Sending USDT via Ethereum (ERC-20) or Tron (TRC-20) to this address without cross-chain bridge will cause loss.
              </span>
            ) : currentToken.networkId === 'bitcoin' ? (
              <span>
                <strong>Important:</strong> Only send <strong>Bitcoin (BTC)</strong> directly to this Native SegWit (bc1) address. Do not send BCH, BSV, or wrapped tokens.
              </span>
            ) : (
              <span>
                Send only <strong>{currentToken.symbol}</strong> via <strong>{currentToken.networkName}</strong>. All deposits are automatically credited after blockchain confirmations.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
