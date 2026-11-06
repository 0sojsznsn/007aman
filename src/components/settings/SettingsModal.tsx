import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Fingerprint, 
  KeyRound, 
  Copy, 
  Check, 
  Wallet, 
  ExternalLink, 
  HardDrive, 
  Plus, 
  Clock, 
  ChevronRight,
  Globe,
  X
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { BiometricService } from '../../services/biometric';
import { POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../../data/constants';
import { SeedPhraseModal } from '../security/SeedPhraseModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    wallets, 
    activeWallet, 
    setActiveWalletId, 
    lockWallet, 
    currency, 
    setCurrency 
  } = useWallet();

  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(() =>
    BiometricService.isBiometricEnabled()
  );
  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() =>
    BiometricService.getAutoLockMinutes()
  );
  const [seedModalOpen, setSeedModalOpen] = useState<boolean>(false);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  // PIN change state
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleBiometrics = () => {
    const nextVal = !biometricEnabled;
    setBiometricEnabled(nextVal);
    BiometricService.setBiometricEnabled(nextVal);
  };

  const handleSetAutoLock = (mins: number) => {
    setAutoLockMinutesState(mins);
    BiometricService.setAutoLockMinutes(mins);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(key);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setPinChangeMsg('PIN must be exactly 6 digits');
      return;
    }
    BiometricService.setPin(newPin);
    setPinChangeMsg('PIN updated successfully!');
    setTimeout(() => {
      setIsChangingPin(false);
      setPinChangeMsg('');
      setNewPin('');
    }, 1200);
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

        <div className="text-center mb-5">
          <h3 className="text-lg font-black text-white font-mono">007 Crypto Wallet Center</h3>
          <p className="text-xs text-slate-400">Classified multi-chain credentials and biometric controls</p>
        </div>

        {/* Section 1: Security & Biometrics */}
        <div className="mb-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Biometric Security</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3">
            {/* Toggle Biometrics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs font-bold text-white">Face ID / Touch ID</div>
                  <div className="text-[10px] text-slate-400">
                    Require biometric scan for transfers & unlocking
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  biometricEnabled ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    biometricEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto-Lock Settings */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-300 font-medium">Auto-Lock Inactivity</span>
              </div>
              <select
                value={autoLockMinutes}
                onChange={(e) => handleSetAutoLock(parseInt(e.target.value, 10))}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value={0}>Never</option>
                <option value={1}>1 Minute</option>
                <option value={5}>5 Minutes</option>
                <option value={15}>15 Minutes</option>
              </select>
            </div>

            {/* Change PIN Code */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsChangingPin(!isChangingPin)}
                className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>Change 6-Digit PIN</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {isChangingPin && (
                <form onSubmit={handleSavePin} className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter new 6-digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-blue-500"
                  />
                  {pinChangeMsg && (
                    <div className="text-[11px] text-center font-semibold text-emerald-400">
                      {pinChangeMsg}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Save New PIN
                  </button>
                </form>
              )}
            </div>

            {/* Recovery Phrase Reveal */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSeedModalOpen(true)}
                className="w-full flex items-center justify-between text-xs text-amber-300 hover:text-amber-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Backup Secret Recovery Phrase (12 Words)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Configured Multi-Chain Addresses */}
        <div className="mb-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Target Blockchain Addresses
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3 text-xs">
            {/* USDT Polygon */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-purple-300">Polygon USDT & EVM Address:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(POLYGON_USDT_ADDRESS, 'polygon')}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedAddr === 'polygon' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAddr === 'polygon' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 bg-black/50 p-2 rounded-xl break-all border border-slate-800 select-all">
                {POLYGON_USDT_ADDRESS}
              </div>
            </div>

            {/* Bitcoin */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-amber-300">Bitcoin Native SegWit Address:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(BITCOIN_ADDRESS, 'btc')}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedAddr === 'btc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAddr === 'btc' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 bg-black/50 p-2 rounded-xl break-all border border-slate-800 select-all">
                {BITCOIN_ADDRESS}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Wallets Enclave */}
        <div className="mb-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Wallets & Vaults
          </div>

          <div className="space-y-1.5">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                onClick={() => setActiveWalletId(wallet.id)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  wallet.id === activeWallet.id
                    ? 'bg-blue-600/15 border-blue-500/50 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs">
                    {wallet.isHardware ? <HardDrive className="w-3.5 h-3.5" /> : <Wallet className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-bold">{wallet.name}</span>
                </div>
                {wallet.id === activeWallet.id && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Lock Wallet Now Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              lockWallet();
            }}
            className="w-full py-3.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Wallet Now (Require Biometrics)</span>
          </button>
        </div>

        {/* Seed Phrase Modal */}
        <SeedPhraseModal
          isOpen={seedModalOpen}
          onClose={() => setSeedModalOpen(false)}
        />
      </div>
    </div>
  );
};
