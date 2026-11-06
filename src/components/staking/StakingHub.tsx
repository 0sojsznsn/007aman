import React, { useState } from 'react';
import { 
  Landmark, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Calculator,
  Lock,
  Unlock,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWallet } from '../../context/WalletContext';
import { STAKING_POOLS } from '../../data/constants';
import { StakingPool } from '../../types/wallet';
import { BiometricService } from '../../services/biometric';

export const StakingHub: React.FC = () => {
  const { 
    tokens, 
    stakingPositions, 
    stakeCrypto, 
    claimRewards, 
    unstakePosition 
  } = useWallet();

  const [selectedPool, setSelectedPool] = useState<StakingPool>(STAKING_POOLS[0]);
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<string>(STAKING_POOLS[0].validators[0].name);
  const [stakeAmount, setStakeAmount] = useState<string>('100');
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [calcAmount, setCalcAmount] = useState<number>(500);

  // Compute active staking metrics
  const totalStakedUsd = stakingPositions.reduce((acc, pos) => acc + pos.stakedAmountUsd, 0);
  const totalRewardsUsd = stakingPositions.reduce((acc, pos) => acc + pos.rewardsPendingUsd, 0);

  const matchedToken = tokens.find((t) => t.symbol === selectedPool.tokenSymbol);
  const tokenPrice = matchedToken?.priceUsd || 1;
  const userBalance = matchedToken?.balance || 0;

  // Calculator calculations
  const dailyReturnTokens = (calcAmount * (selectedPool.apy / 100)) / 365;
  const monthlyReturnTokens = dailyReturnTokens * 30;
  const yearlyReturnTokens = calcAmount * (selectedPool.apy / 100);

  const handleOpenStake = (pool: StakingPool) => {
    setSelectedPool(pool);
    setSelectedValidator(pool.validators[0].name);
    setStakeAmount(pool.minStake.toString());
    setErrorMsg('');
    setStakeModalOpen(true);
  };

  const handleExecuteStake = async () => {
    const parsedAmount = parseFloat(stakeAmount);
    if (!parsedAmount || parsedAmount < selectedPool.minStake) {
      setErrorMsg(`Minimum stake is ${selectedPool.minStake} ${selectedPool.tokenSymbol}`);
      return;
    }
    if (parsedAmount > userBalance) {
      setErrorMsg(`Insufficient ${selectedPool.tokenSymbol} balance`);
      return;
    }

    setErrorMsg('');
    setIsStaking(true);

    try {
      const auth = await BiometricService.authenticateBiometric(
        `Stake ${parsedAmount} ${selectedPool.tokenSymbol} with ${selectedValidator}`
      );
      if (!auth.success) {
        setErrorMsg('Biometric authorization cancelled');
        setIsStaking(false);
        return;
      }

      await stakeCrypto({
        poolId: selectedPool.id,
        amount: parsedAmount,
        validatorName: selectedValidator,
      });

      setIsStaking(false);
      setStakeModalOpen(false);
      confetti({ particleCount: 80, spread: 65 });
    } catch (err: unknown) {
      setIsStaking(false);
      setErrorMsg(err instanceof Error ? err.message : 'Staking failed');
    }
  };

  const handleClaim = async (posId: string) => {
    setIsClaiming(posId);
    try {
      await claimRewards(posId);
      confetti({ particleCount: 50, spread: 50 });
    } finally {
      setIsClaiming(null);
    }
  };

  const handleUnstake = async (posId: string) => {
    const confirm = window.confirm('Unstake your tokens and claim all accrued rewards?');
    if (confirm) {
      await unstakePosition(posId);
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-xl mx-auto space-y-5">
      {/* Overview Stats Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/40 via-[#130f2c] to-[#070e1c] border border-purple-500/20 p-6 shadow-2xl glow-purple">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-purple-400" />
              Secure Staking Enclave
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              Non-Custodial
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            <div>
              <div className="text-xs text-slate-400">Total Value Staked</div>
              <div className="text-2xl font-black text-white">
                ${totalStakedUsd.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Accrued Rewards</div>
              <div className="text-2xl font-black text-emerald-400">
                +${totalRewardsUsd.toFixed(2)}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight mt-1">
            Rewards compound automatically or can be claimed on-demand with zero protocol penalty.
          </p>
        </div>
      </div>

      {/* Active Staking Positions */}
      {stakingPositions.length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Your Active Stakes ({stakingPositions.length})
          </div>
          <div className="space-y-2.5">
            {stakingPositions.map((pos) => (
              <div
                key={pos.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      {pos.tokenSymbol}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{pos.stakedAmount} {pos.tokenSymbol}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                          {pos.apy}% APY
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Validator: <strong className="text-slate-300">{pos.validatorName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">
                      +{pos.rewardsPending.toFixed(4)} {pos.tokenSymbol}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ≈ +${pos.rewardsPendingUsd.toFixed(2)} USD
                    </div>
                  </div>
                </div>

                {/* Position Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleClaim(pos.id)}
                    disabled={isClaiming === pos.id || pos.rewardsPending <= 0}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{isClaiming === pos.id ? 'Claiming...' : 'Claim Rewards'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUnstake(pos.id)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    Unstake
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APY Rewards Calculator */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">APY Reward Calculator</h3>
          </div>
          <span className="text-xs font-bold text-emerald-400">
            {selectedPool.apy}% APY
          </span>
        </div>

        {/* Pool Selector Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {STAKING_POOLS.map((pool) => (
            <button
              key={pool.id}
              type="button"
              onClick={() => setSelectedPool(pool)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedPool.id === pool.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {pool.tokenSymbol} ({pool.apy}%)
            </button>
          ))}
        </div>

        {/* Amount Slider */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Simulate Staked Amount</span>
            <span className="font-bold text-white font-mono">
              {calcAmount.toLocaleString()} {selectedPool.tokenSymbol} (~${(calcAmount * tokenPrice).toFixed(2)})
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={5000}
            step={10}
            value={calcAmount}
            onChange={(e) => setCalcAmount(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Calculated Earnings Breakdown */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Daily</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">
              +{dailyReturnTokens.toFixed(3)}
            </div>
            <div className="text-[10px] text-slate-500">
              ${(dailyReturnTokens * tokenPrice).toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">Monthly</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">
              +{monthlyReturnTokens.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500">
              ${(monthlyReturnTokens * tokenPrice).toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">Yearly</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">
              +{yearlyReturnTokens.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-500">
              ${(yearlyReturnTokens * tokenPrice).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Available Staking Pools List */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Available Staking Pools
        </div>
        <div className="space-y-2.5">
          {STAKING_POOLS.map((pool) => {
            const tok = tokens.find((t) => t.symbol === pool.tokenSymbol);
            const bal = tok?.balance || 0;

            return (
              <div
                key={pool.id}
                className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={pool.icon}
                    alt={pool.tokenSymbol}
                    className="w-10 h-10 rounded-full bg-slate-800 p-1 object-contain"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{pool.tokenName}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-emerald-400">{pool.apy}% APY</span>
                      <span>•</span>
                      <span>Min: {pool.minStake} {pool.tokenSymbol}</span>
                      <span>•</span>
                      <span>{pool.lockPeriod}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenStake(pool)}
                  className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Stake</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stake Modal */}
      {stakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0c1527] border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100">
            <button
              type="button"
              onClick={() => setStakeModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-white">
                Stake {selectedPool.tokenSymbol}
              </h3>
              <p className="text-xs text-slate-400">
                Earn {selectedPool.apy}% APY with audited validators
              </p>
            </div>

            {/* Validator Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Choose Validator
              </label>
              <select
                value={selectedValidator}
                onChange={(e) => setSelectedValidator(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-2.5 px-3.5 text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {selectedPool.validators.map((val) => (
                  <option key={val.name} value={val.name}>
                    {val.name} (Uptime: {val.uptime}, Fee: {val.commission}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Stake Amount Input */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                <span>Amount to Delegate</span>
                <span>
                  Available: <strong className="text-slate-200">{userBalance} {selectedPool.tokenSymbol}</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => {
                    setStakeAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-3.5 pr-20 text-lg font-bold text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setStakeAmount(userBalance.toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 font-bold px-2 py-1 rounded-lg"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Reward Summary */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl mb-4 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Annual Percentage Yield:</span>
                <span className="font-bold text-emerald-400">{selectedPool.apy}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Yearly Rewards:</span>
                <span className="font-bold text-white font-mono">
                  +{(parseFloat(stakeAmount || '0') * (selectedPool.apy / 100)).toFixed(2)} {selectedPool.tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Lockup Period:</span>
                <span className="text-slate-200">{selectedPool.lockPeriod}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-3 text-xs text-rose-400 text-center font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleExecuteStake}
              disabled={isStaking}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isStaking ? (
                <>
                  <Fingerprint className="w-4 h-4 text-cyan-300 animate-pulse" />
                  <span>Authorizing with Biometrics...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Delegation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
