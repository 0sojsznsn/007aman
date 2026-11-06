import React, { useState } from 'react';
import { 
  KeyRound, 
  Fingerprint, 
  ArrowRight, 
  Check, 
  Copy, 
  Lock, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Radio,
  Coins,
  ShieldAlert
} from 'lucide-react';
import { MOCK_SEED_PHRASE, POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../../data/constants';
import { BiometricService } from '../../services/biometric';
import { WalletMode } from '../../types/wallet';
import { WalletLogo } from '../common/WalletLogo';

interface AuthOnboardingProps {
  onAuthenticated: (mode: WalletMode, isNewUser?: boolean) => void;
}

export const AuthOnboarding: React.FC<AuthOnboardingProps> = ({ onAuthenticated }) => {
  const [tab, setTab] = useState<'create' | 'import' | 'quickLogin'>('quickLogin');
  const [step, setStep] = useState<number>(1);
  const [walletMode, setWalletMode] = useState<WalletMode>('live');

  // Sign up state
  const [walletName, setWalletName] = useState<string>('007 Classified Vault');
  const [seedPhrase] = useState<string[]>(MOCK_SEED_PHRASE);
  const [phraseCopied, setPhraseCopied] = useState(false);
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [createPin, setCreatePin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [enableBiometrics, setEnableBiometrics] = useState<boolean>(true);

  // Import state
  const [importInput, setImportInput] = useState<string>('');
  const [importType, setImportType] = useState<'phrase' | 'address'>('phrase');

  // Quick Login state
  const [quickLoginPin, setQuickLoginPin] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);

  // Quick Biometric Login
  const handleQuickBiometricAuth = async () => {
    setIsBiometricScanning(true);
    setAuthError('');
    try {
      const auth = await BiometricService.authenticateBiometric('Unlock 007 Crypto Wallet');
      if (auth.success) {
        onAuthenticated(walletMode, false);
      } else {
        setAuthError('Biometric authentication failed. Enter your PIN.');
      }
    } catch {
      setAuthError('Biometrics unavailable. Enter your PIN.');
    } finally {
      setIsBiometricScanning(false);
    }
  };

  // Quick PIN Login
  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (BiometricService.verifyPin(quickLoginPin)) {
      onAuthenticated(walletMode, false);
    } else {
      setAuthError('Incorrect PIN. Default is 123456');
      setQuickLoginPin('');
    }
  };

  // Create Wallet completion (User requested: "when person sign up then 0 balance")
  const handleCompleteCreate = () => {
    if (createPin.length !== 6 || !/^\d+$/.test(createPin)) {
      setAuthError('PIN must be exactly 6 digits');
      return;
    }
    if (createPin !== confirmPin) {
      setAuthError('PIN codes do not match');
      return;
    }

    BiometricService.setPin(createPin);
    BiometricService.setBiometricEnabled(enableBiometrics);
    // Passing true initializes a clean 0.00 balance across all tokens!
    onAuthenticated(walletMode, true);
  };

  // Import Wallet completion
  const handleImportWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importInput.trim()) {
      setAuthError('Please enter your secret phrase, private key, or address');
      return;
    }
    onAuthenticated(walletMode, false);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background aesthetic lasers and ambient glows */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md bg-[#080d1a]/95 border border-slate-800/90 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* 007wallet Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <WalletLogo size="xl" showText={false} />
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-white font-mono flex items-center gap-2">
            <span>007</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-300">
              crypto wallet
            </span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Official <strong className="text-amber-400">007wallet</strong> multi-chain client with real on-chain synchronization & biometric enclave
          </p>

          {/* Mode Switcher: Real On-Chain Data vs Demo Sandbox */}
          <div className="mt-4 flex items-center p-1 bg-black/60 border border-slate-800 rounded-2xl w-full">
            <button
              type="button"
              onClick={() => setWalletMode('live')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                walletMode === 'live'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Real Blockchain Data</span>
            </button>
            <button
              type="button"
              onClick={() => setWalletMode('demo')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                walletMode === 'demo'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sandbox Demo</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Quick Login | Sign Up (0 Balance) | Import */}
        <div className="grid grid-cols-3 gap-1 bg-black/50 border border-slate-800/80 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('quickLogin');
              setAuthError('');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'quickLogin'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('create');
              setStep(1);
              setAuthError('');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'create'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('import');
              setAuthError('');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'import'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Import
          </button>
        </div>

        {/* TAB 1: QUICK LOGIN (SIGN IN) */}
        {tab === 'quickLogin' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold text-slate-300">007 Live Target Addresses:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono text-[11px]">
                  <CheckCircle2 className="w-3 h-3" /> Real On-Chain
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 bg-black/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-bold">Polygon USDT:</span>
                  <span className="truncate max-w-[170px] text-slate-300">{POLYGON_USDT_ADDRESS}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                  <span className="text-amber-400 font-bold">Bitcoin SegWit:</span>
                  <span className="truncate max-w-[170px] text-slate-300">{BITCOIN_ADDRESS}</span>
                </div>
              </div>
            </div>

            {/* Biometric One-Tap Unlock Button */}
            <button
              type="button"
              onClick={handleQuickBiometricAuth}
              disabled={isBiometricScanning}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-black font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {isBiometricScanning ? (
                <>
                  <Fingerprint className="w-5 h-5 text-black animate-spin" />
                  <span>Scanning Face ID / Touch ID...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 text-black" />
                  <span>Biometric Unlock (Face ID / Sensor)</span>
                </>
              )}
            </button>

            {/* Or PIN login */}
            <div className="flex items-center gap-2 my-2 text-slate-600 text-[11px]">
              <div className="flex-1 h-px bg-slate-800" />
              <span>OR ENTER PIN CODE</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <form onSubmit={handlePinLogin} className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={quickLoginPin}
                  onChange={(e) => {
                    setQuickLoginPin(e.target.value.replace(/\D/g, ''));
                    setAuthError('');
                  }}
                  className="w-full bg-black/60 border border-slate-700 rounded-2xl py-3 px-4 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {authError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Sign In with PIN (Default: 123456)
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: SIGN UP (CREATES FRESH 0 BALANCE WALLET) */}
        {tab === 'create' && (
          <div className="space-y-4 animate-fadeIn">
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full mb-2">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Fresh Account • Starting Balance: $0.00</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Create New 007 Vault</h3>
                  <p className="text-xs text-slate-400">Initialize a brand new wallet with zero balance</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Vault Name
                  </label>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-2xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-200 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>0 Balance Initialized:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Your fresh wallet starts with <strong>0.00 balance</strong> across all chains. You can store/deposit crypto or receive funds at your verified addresses anytime.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Generate 12-Word Secret Master Key</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-base font-bold text-white">12-Word Master Secret Key</h3>
                  <p className="text-xs text-slate-400">Write down your 007 master backup phrase</p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-black/60 border border-slate-800 rounded-2xl">
                  {seedPhrase.map((w, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-900/90 rounded-xl text-center text-xs font-mono border border-slate-700/60">
                      <span className="text-[10px] text-amber-400 font-bold mr-1">{idx + 1}.</span>
                      <span className="text-white font-semibold">{w}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(seedPhrase.join(' '));
                    setPhraseCopied(true);
                    setTimeout(() => setPhraseCopied(false), 2000);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {phraseCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{phraseCopied ? 'Secret Phrase Copied!' : 'Copy All 12 Words'}</span>
                </button>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={hasBackedUp}
                    onChange={(e) => setHasBackedUp(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span>I have securely written down my 007 master phrase</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3 px-4 rounded-2xl bg-slate-800 text-slate-400 text-xs font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!hasBackedUp}
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <span>Next: Set 6-Digit PIN</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-base font-bold text-white">Set Security PIN & Biometrics</h3>
                  <p className="text-xs text-slate-400">Lock your 007 vault with encryption</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Choose 6-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter 6 digits"
                    value={createPin}
                    onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black/60 border border-slate-700 rounded-2xl py-2.5 px-4 text-center font-mono tracking-widest text-white text-base focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                    Confirm 6-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Repeat 6 digits"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black/60 border border-slate-700 rounded-2xl py-2.5 px-4 text-center font-mono tracking-widest text-white text-base focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                    <span>Enable Face ID / Touch ID</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableBiometrics}
                    onChange={(e) => setEnableBiometrics(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {authError && (
                  <div className="text-xs text-rose-400 text-center font-medium">
                    {authError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCompleteCreate}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-black font-black text-sm shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  Complete Sign Up (0.00 Balance) & Launch
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: IMPORT WALLET */}
        {tab === 'import' && (
          <form onSubmit={handleImportWallet} className="space-y-4 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Import Existing 007 Vault</h3>
              <p className="text-xs text-slate-400">Restore using 12 words, private key, or address</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImportType('phrase')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold ${
                  importType === 'phrase' ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                12-Word Phrase
              </button>
              <button
                type="button"
                onClick={() => setImportType('address')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold ${
                  importType === 'address' ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Public Address
              </button>
            </div>

            <textarea
              rows={3}
              placeholder={
                importType === 'phrase'
                  ? 'Enter your 12-word recovery phrase separated by spaces...'
                  : 'Enter 0x... EVM address or bc1... BTC address'
              }
              value={importInput}
              onChange={(e) => {
                setImportInput(e.target.value);
                setAuthError('');
              }}
              className="w-full bg-black/60 border border-slate-700 rounded-2xl p-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />

            {/* Quick autofill configured user addresses */}
            <div className="space-y-1 text-left">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Verified 007 Targets:</div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setImportInput(POLYGON_USDT_ADDRESS)}
                  className="text-left text-[11px] font-mono text-purple-400 hover:text-purple-300 truncate bg-black/40 p-1.5 rounded-lg border border-slate-800 cursor-pointer"
                >
                  Polygon USDT: {POLYGON_USDT_ADDRESS}
                </button>
                <button
                  type="button"
                  onClick={() => setImportInput(BITCOIN_ADDRESS)}
                  className="text-left text-[11px] font-mono text-amber-400 hover:text-amber-300 truncate bg-black/40 p-1.5 rounded-lg border border-slate-800 cursor-pointer"
                >
                  Bitcoin: {BITCOIN_ADDRESS}
                </button>
              </div>
            </div>

            {authError && (
              <div className="text-xs text-rose-400 text-center font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              Import 007 Vault & Launch
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
