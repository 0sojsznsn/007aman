import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, X, AlertTriangle, ExternalLink, Fuel, Check } from 'lucide-react';
import { Web3Request } from '../../types/wallet';
import { BiometricService } from '../../services/biometric';
import { POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../../data/constants';

interface Web3SignModalProps {
  request: Web3Request | null;
  onApprove: () => void;
  onReject: () => void;
}

export const Web3SignModal: React.FC<Web3SignModalProps> = ({
  request,
  onApprove,
  onReject,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!request) return null;

  const handleApproveWithBiometric = async () => {
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const auth = await BiometricService.authenticateBiometric(`Sign dApp request from ${request.dappName}`);
      if (auth.success) {
        setIsVerifying(false);
        onApprove();
      } else {
        setIsVerifying(false);
        setErrorMsg('Biometric authentication failed');
      }
    } catch {
      setIsVerifying(false);
      setErrorMsg('Authentication error');
    }
  };

  const currentAddress = request.networkId === 'bitcoin' ? BITCOIN_ADDRESS : POLYGON_USDT_ADDRESS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#0c1527] border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100">
        <button
          type="button"
          onClick={onReject}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* dApp Info Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 p-2 flex items-center justify-center mb-2 shadow-lg">
            <img
              src={request.dappIcon}
              alt={request.dappName}
              className="w-10 h-10 object-contain"
            />
          </div>
          <h3 className="text-base font-bold text-white">{request.dappName}</h3>
          <span className="text-[11px] text-slate-400 font-mono">{request.dappUrl}</span>
        </div>

        {/* Request Type Badge */}
        <div className="mb-4 text-center">
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold px-3 py-1 rounded-full">
            {request.method === 'eth_sendTransaction' ? 'Contract Interaction' : 'Sign Message'}
          </span>
        </div>

        {/* Transaction Details Card */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs mb-4">
          <div className="flex justify-between text-slate-400">
            <span>Account:</span>
            <span className="font-mono text-slate-200">
              {currentAddress.substring(0, 6)}...{currentAddress.substring(currentAddress.length - 4)}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Network:</span>
            <span className="font-semibold text-white capitalize">{request.networkId}</span>
          </div>

          {request.payload.value && (
            <div className="flex justify-between text-slate-400">
              <span>Amount:</span>
              <span className="font-bold text-white">{request.payload.value}</span>
            </div>
          )}

          {request.payload.estimatedGasUsd && (
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <Fuel className="w-3 h-3 text-blue-400" />
                Est. Gas Fee:
              </span>
              <span className="font-mono text-slate-200">~${request.payload.estimatedGasUsd.toFixed(3)}</span>
            </div>
          )}

          {request.payload.message && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block mb-1">Message to Sign:</span>
              <div className="bg-black/50 p-2 rounded-lg font-mono text-[11px] text-slate-300 break-all border border-slate-800 max-h-20 overflow-y-auto">
                {request.payload.message}
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>TrustVault verified smart contract address and security audit.</span>
        </div>

        {errorMsg && (
          <div className="mb-3 text-xs text-rose-400 text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onReject}
            className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
          >
            Reject
          </button>

          <button
            type="button"
            onClick={handleApproveWithBiometric}
            disabled={isVerifying}
            className="py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <Fingerprint className="w-4 h-4 text-cyan-300 animate-spin" />
            ) : (
              <Fingerprint className="w-4 h-4 text-white" />
            )}
            <span>{isVerifying ? 'Scanning...' : 'Sign with FaceID'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
