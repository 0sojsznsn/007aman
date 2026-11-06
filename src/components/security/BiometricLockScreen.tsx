import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, Scan, Delete, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { BiometricService } from '../../services/biometric';
import { useWallet } from '../../context/WalletContext';

interface BiometricLockScreenProps {
  onUnlocked?: () => void;
  reason?: string;
  isModal?: boolean;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  onUnlocked,
  reason = 'Unlock TrustVault Wallet',
  isModal = false,
}) => {
  const { unlockWallet } = useWallet();
  const [pin, setPin] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  // Trigger quick biometric scan on load if biometrics enabled
  useEffect(() => {
    if (BiometricService.isBiometricEnabled() && !isScanning && !scanSuccess) {
      handleBiometricAuth();
    }
  }, []);

  const handleBiometricAuth = async () => {
    setIsScanning(true);
    setErrorMessage('');
    try {
      const res = await BiometricService.authenticateBiometric(reason);
      if (res.success) {
        setScanSuccess(true);
        setTimeout(() => {
          if (onUnlocked) {
            onUnlocked();
          } else {
            unlockWallet();
          }
        }, 500);
      } else {
        setErrorMessage(res.error || 'Biometric authentication failed. Enter PIN.');
      }
    } catch {
      setErrorMessage('Biometrics unavailable. Enter PIN.');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMessage('');

      if (newPin.length === 6) {
        // Validate PIN
        if (BiometricService.verifyPin(newPin)) {
          setScanSuccess(true);
          setTimeout(() => {
            if (onUnlocked) {
              onUnlocked();
            } else {
              unlockWallet();
            }
          }, 300);
        } else {
          setErrorMessage('Incorrect PIN. Please try again.');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleDeleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const content = (
    <div className="flex flex-col items-center justify-between min-h-[580px] max-w-sm mx-auto w-full px-6 py-8 text-center select-none">
      {/* Header & Logo */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-400 p-[2px] shadow-xl shadow-amber-500/25">
            <div className="w-full h-full bg-[#080d1a] rounded-3xl flex items-center justify-center relative overflow-hidden">
              <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-300">
                007
              </span>
              {isScanning && (
                <div className="absolute inset-0 bg-amber-500/15 animate-pulse flex items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />
                </div>
              )}
            </div>
          </div>
          {scanSuccess && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-[#080d1a]">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <h2 className="text-xl font-black tracking-tight text-white font-mono mb-1">
          {scanSuccess ? '007 Vault Unlocked' : '007 Classified Enclave'}
        </h2>
        <p className="text-xs text-slate-400 max-w-[260px]">
          {scanSuccess ? 'Decrypting multi-chain private keys...' : reason}
        </p>
      </div>

      {/* PIN Indicator Dots */}
      <div className="my-6">
        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  scanSuccess
                    ? 'bg-emerald-400 scale-110 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                    : errorMessage
                    ? 'bg-red-500 animate-shake'
                    : isFilled
                    ? 'bg-blue-400 scale-110 shadow-[0_0_10px_rgba(96,165,250,0.6)]'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>
        {errorMessage && (
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-rose-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-[280px]">
        <div className="grid grid-cols-3 gap-3.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handlePinInput(num)}
              className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 border border-slate-700/60 text-xl font-semibold text-white transition-all flex items-center justify-center cursor-pointer shadow-sm hover:border-blue-500/40"
            >
              {num}
            </button>
          ))}

          {/* Biometrics trigger button */}
          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={isScanning}
            title="Biometric Face ID / Fingerprint Scan"
            className="h-14 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 active:scale-95 border border-blue-600/40 text-blue-400 transition-all flex flex-col items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <Scan className="w-6 h-6 text-cyan-400 animate-spin" />
            ) : (
              <Fingerprint className="w-6 h-6 text-blue-400 hover:text-cyan-300" />
            )}
          </button>

          {/* 0 digit */}
          <button
            type="button"
            onClick={() => handlePinInput('0')}
            className="h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 border border-slate-700/60 text-xl font-semibold text-white transition-all flex items-center justify-center cursor-pointer shadow-sm hover:border-blue-500/40"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDeleteDigit}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 border border-slate-700/50 text-slate-300 transition-all flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Quick Helper */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <KeyRound className="w-3 h-3 text-slate-400" />
          <span>Default PIN: <strong className="text-slate-300 font-mono">123456</strong> or click fingerprint icon</span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
        <div className="relative bg-[#0b1324] border border-slate-800/80 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050b14] p-4">
      {/* Background radial glow */}
      <div className="absolute top-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm bg-[#0c1527]/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
        {content}
      </div>
    </div>
  );
};
