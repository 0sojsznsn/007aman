import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { PriceAlert } from '../../types/wallet';

interface PriceAlertsManagerProps {
  initialTokenSymbol?: string;
}

export const PriceAlertsManager: React.FC<PriceAlertsManagerProps> = ({
  initialTokenSymbol = 'BTC',
}) => {
  const {
    tokens,
    priceAlerts,
    addPriceAlert,
    togglePriceAlert,
    deletePriceAlert,
    liveNotifications,
    dismissNotification,
    priceFlashMap,
  } = useWallet();

  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialTokenSymbol);
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [recurring, setRecurring] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  const currentToken = tokens.find((t) => t.symbol === selectedSymbol) || tokens[1]; // default BTC

  const handleSetQuickTarget = (percent: number) => {
    if (!currentToken) return;
    const computed = currentToken.priceUsd * (1 + percent / 100);
    setTargetPrice(computed.toFixed(computed > 10 ? 2 : 4));
    setDirection(percent >= 0 ? 'above' : 'below');
    setFormError('');
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetPrice);
    if (!parsedTarget || parsedTarget <= 0) {
      setFormError('Please enter a valid target price');
      return;
    }

    addPriceAlert({
      tokenSymbol: currentToken.symbol,
      tokenName: currentToken.name,
      targetPrice: parsedTarget,
      currentPriceAtCreation: currentToken.priceUsd,
      direction,
      enabled: true,
      recurring,
      networkId: currentToken.networkId,
    });

    setTargetPrice('');
    setFormError('');
    setIsFormOpen(false);
  };

  // Test simulation helper
  const handleTestTrigger = (alert: PriceAlert) => {
    // Temporarily trigger this alert
    const notifMessage = `🔔 Test Trigger: ${alert.tokenSymbol} reached $${alert.targetPrice.toLocaleString()}!`;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    if (soundEnabled) {
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-xl mx-auto space-y-5">
      {/* Real-time Ticker Ribbon */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Crypto Market Rates
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            title={soundEnabled ? 'Sound alert enabled' : 'Sound alert muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>
        </div>

        {/* Horizontal Mini Ticker Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tokens.slice(0, 4).map((t) => {
            const flash = priceFlashMap[t.id];
            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedSymbol(t.symbol);
                  setIsFormOpen(true);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                  flash === 'up'
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : flash === 'down'
                    ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 font-mono">
                  <span>{t.symbol}</span>
                  <span className={t.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {flash === 'up' ? '▲ ' : flash === 'down' ? '▼ ' : ''}
                    {t.change24h >= 0 ? '+' : ''}{t.change24h}%
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 truncate font-mono">
                  ${t.priceUsd > 10 ? t.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : t.priceUsd.toFixed(4)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Triggered Notifications Alert Banner (if any) */}
      {liveNotifications.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Recent Triggered Alerts</span>
          </div>
          {liveNotifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 flex items-center justify-between shadow-lg animate-fadeIn"
            >
              <div className="flex items-center gap-2.5 text-xs font-medium">
                <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{n.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissNotification(n.id)}
                className="text-xs font-bold text-amber-400 hover:text-white px-2 py-1 rounded bg-amber-500/20 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Alert Creator Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0c1527] to-[#080e1b] border border-blue-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Price Alert</h3>
              <p className="text-[11px] text-slate-400">Get notified the second a target is reached</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isFormOpen ? 'Collapse' : 'New Alert'}</span>
          </button>
        </div>

        {isFormOpen && (
          <form onSubmit={handleCreateAlert} className="space-y-4 pt-2 border-t border-slate-800 animate-fadeIn">
            {/* Token Selector */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Token
              </label>
              <div className="grid grid-cols-4 gap-2">
                {tokens.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedSymbol(t.symbol);
                      setTargetPrice('');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center ${
                      selectedSymbol === t.symbol
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{t.symbol}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      ${t.priceUsd > 10 ? t.priceUsd.toFixed(0) : t.priceUsd.toFixed(3)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition: Rises Above vs Drops Below */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Trigger When Price
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('above')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    direction === 'above'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Rises Above (≥)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('below')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    direction === 'below'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Drops Below (≤)</span>
                </button>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-slate-400">Target Price (USD)</span>
                <span className="text-slate-400 font-mono">
                  Current: ${currentToken?.priceUsd.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 95000"
                  value={targetPrice}
                  onChange={(e) => {
                    setTargetPrice(e.target.value);
                    setFormError('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-8 pr-4 text-base font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Percentage Chips */}
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                {[5, 10, 20, -5, -10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSetQuickTarget(pct)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-300 font-medium">Keep alert recurring</span>
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {formError && (
              <div className="text-xs text-rose-400 font-medium">{formError}</div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Set Active Price Alert
            </button>
          </form>
        )}
      </div>

      {/* Active Alerts List */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Active Alerts ({priceAlerts.length})</span>
          <span className="text-[10px] text-slate-500 font-normal">Real-time surveillance</span>
        </div>

        <div className="space-y-2.5">
          {priceAlerts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No price alerts set. Create one above to receive instant notifications!
            </div>
          ) : (
            priceAlerts.map((alert) => {
              const tok = tokens.find((t) => t.symbol === alert.tokenSymbol);
              const currentPrice = tok?.priceUsd || alert.currentPriceAtCreation;
              const isAbove = alert.direction === 'above';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    alert.isTriggered
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : alert.enabled
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-slate-950/60 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        isAbove
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isAbove ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{alert.tokenSymbol}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {isAbove ? '≥' : '≤'} ${alert.targetPrice.toLocaleString()}
                        </span>
                        {alert.isTriggered && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.2 rounded">
                            Triggered
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Current: <strong className="text-slate-200">${currentPrice.toLocaleString()}</strong>
                        {alert.recurring && <span className="ml-1 text-blue-400 font-medium">(Recurring)</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Enabled */}
                    <button
                      type="button"
                      onClick={() => togglePriceAlert(alert.id)}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                        alert.enabled ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                      title={alert.enabled ? 'Enabled' : 'Disabled'}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          alert.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Delete Alert */}
                    <button
                      type="button"
                      onClick={() => deletePriceAlert(alert.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
