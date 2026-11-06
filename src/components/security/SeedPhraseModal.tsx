import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Copy, Check, AlertTriangle, X, Lock, KeyRound } from 'lucide-react';
import { MOCK_SEED_PHRASE } from '../../data/constants';
import { BiometricService } from '../../services/biometric';

interface SeedPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeedPhraseModal: React.FC<SeedPhraseModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleUnlockPhrase = async () => {
    setIsVerifying(true);
    setErrorMsg('');
    try {
      const auth = await BiometricService.authenticateBiometric('Reveal Secret Recovery Phrase');
      if (auth.success) {
        setIsAuthenticated(true);
        setIsRevealed(true);
      } else {
        setErrorMsg('Biometric authentication failed');
      }
    } catch {
      setErrorMsg('Authentication error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(MOCK_SEED_PHRASE.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0c1527] border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Secret Recovery Phrase</h3>
          <p className="text-xs text-slate-400">12-word master seed for wallet restoration</p>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              Your recovery phrase gives complete access to all multi-chain funds (Polygon, Bitcoin, Ethereum, Solana). To protect your assets, biometric verification is required before viewing.
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 font-semibold">{errorMsg}</div>
            )}

            <button
              type="button"
              onClick={handleUnlockPhrase}
              disabled={isVerifying}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? 'Authenticating...' : 'Unlock with Face ID / Biometrics'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Write these 12 words down in order:</span>
              <button
                type="button"
                onClick={() => setIsRevealed(!isRevealed)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>

            {/* 12-Word Grid */}
            <div
              className={`grid grid-cols-3 gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl transition-all ${
                !isRevealed ? 'filter blur-sm select-none' : ''
              }`}
            >
              {MOCK_SEED_PHRASE.map((word, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-xl text-xs font-mono border border-slate-700/60"
                >
                  <span className="text-[10px] text-slate-500 font-bold w-4">{idx + 1}.</span>
                  <span className="text-white font-semibold">{word}</span>
                </div>
              ))}
            </div>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopyPhrase}
              className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Secret Phrase'}</span>
            </button>

            {/* Warning Box */}
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                <strong>Warning:</strong> Never share this recovery phrase with anyone, including TrustVault support. Anyone with these words can permanently take your crypto.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
