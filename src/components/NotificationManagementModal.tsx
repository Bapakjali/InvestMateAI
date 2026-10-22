/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Volume2,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PriceAlertItem, WatchlistRecord, StockQuote, MutualFund, AlertCondition } from '../types';
import { formatRupiah, formatPercent } from '../utils/financialCalculations';

interface NotificationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlertItem[];
  watchlist: WatchlistRecord[];
  stocks: StockQuote[];
  funds: MutualFund[];
  onSaveAlert: (alert: PriceAlertItem) => void;
  onDeleteAlert: (alertId: string) => void;
  onToggleAlertEnabled: (alertId: string, isEnabled: boolean) => void;
  onDismissTriggeredAlert: (alertId: string) => void;
  isPushEnabled: boolean;
  onTogglePushEnabled: (enabled: boolean) => void;
  pushPermission: NotificationPermission;
  onRequestPushPermission: () => Promise<boolean>;
  onSendTestNotification: () => void;
  initialSymbol?: string;
}

export const NotificationManagementModal: React.FC<NotificationManagementModalProps> = ({
  isOpen,
  onClose,
  alerts,
  watchlist,
  stocks,
  funds,
  onSaveAlert,
  onDeleteAlert,
  onToggleAlertEnabled,
  onDismissTriggeredAlert,
  isPushEnabled,
  onTogglePushEnabled,
  pushPermission,
  onRequestPushPermission,
  onSendTestNotification,
  initialSymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'create' | 'settings'>('alerts');
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>(initialSymbol || '');
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [condition, setCondition] = useState<AlertCondition>('above_or_equal');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map of stock quotes and funds for quick price lookups
  const assetMap = useMemo(() => {
    const map = new Map<string, { symbol: string; name: string; type: 'saham' | 'reksadana'; price: number }>();
    stocks.forEach((s) => {
      map.set(s.symbol, {
        symbol: s.symbol,
        name: s.name,
        type: 'saham',
        price: s.price,
      });
    });
    funds.forEach((f) => {
      map.set(f.id, {
        symbol: f.id,
        name: f.name,
        type: 'reksadana',
        price: f.navPerUnit,
      });
    });
    return map;
  }, [stocks, funds]);

  // Combined list of assets for dropdown (Watchlist first, then others)
  const selectableAssets = useMemo(() => {
    const items: { symbol: string; name: string; type: 'saham' | 'reksadana'; price: number; inWatchlist: boolean }[] = [];
    
    // First add from watchlist
    watchlist.forEach((w) => {
      const match = assetMap.get(w.symbol);
      items.push({
        symbol: w.symbol,
        name: w.assetName,
        type: w.assetType,
        price: match ? match.price : (w.currentPrice || 0),
        inWatchlist: true,
      });
    });

    // Then add other stocks not in watchlist
    stocks.forEach((s) => {
      if (!items.some((i) => i.symbol === s.symbol)) {
        items.push({
          symbol: s.symbol,
          name: s.name,
          type: 'saham',
          price: s.price,
          inWatchlist: false,
        });
      }
    });

    // Then add other funds not in watchlist
    funds.forEach((f) => {
      if (!items.some((i) => i.symbol === f.id)) {
        items.push({
          symbol: f.id,
          name: f.name,
          type: 'reksadana',
          price: f.navPerUnit,
          inWatchlist: false,
        });
      }
    });

    return items;
  }, [watchlist, stocks, funds, assetMap]);

  // Setup initial asset selection when modal opens or initialSymbol changes
  React.useEffect(() => {
    if (!isOpen) return;

    if (initialSymbol) {
      setSelectedAssetSymbol(initialSymbol);
      const asset = assetMap.get(initialSymbol);
      if (asset) {
        setTargetPriceInput(Math.round(asset.price * 1.05).toString());
      }
      setActiveTab('create');
      setErrorMsg(null);
    } else {
      if (!selectedAssetSymbol && selectableAssets.length > 0) {
        const first = selectableAssets[0];
        setSelectedAssetSymbol(first.symbol);
        setTargetPriceInput(Math.round(first.price * 1.05).toString());
      }
      setActiveTab('alerts');
      setErrorMsg(null);
    }
  }, [isOpen, initialSymbol]);

  const selectedAsset = assetMap.get(selectedAssetSymbol);
  const currentAssetPrice = selectedAsset?.price || 0;
  const numTargetPrice = parseFloat(targetPriceInput) || 0;

  // Percentage diff from current price
  const priceDiffPercent = useMemo(() => {
    if (currentAssetPrice <= 0 || numTargetPrice <= 0) return 0;
    return ((numTargetPrice - currentAssetPrice) / currentAssetPrice) * 100;
  }, [currentAssetPrice, numTargetPrice]);

  const handleApplyPreset = (percent: number) => {
    if (currentAssetPrice <= 0) return;
    const newPrice = Math.round(currentAssetPrice * (1 + percent / 100));
    setTargetPriceInput(newPrice.toString());
    if (percent > 0) {
      setCondition('above_or_equal');
    } else {
      setCondition('below_or_equal');
    }
  };

  const handleAssetChange = (newSymbol: string) => {
    setSelectedAssetSymbol(newSymbol);
    const asset = assetMap.get(newSymbol);
    if (asset) {
      const defaultMultiplier = condition === 'above_or_equal' ? 1.05 : 0.95;
      setTargetPriceInput(Math.round(asset.price * defaultMultiplier).toString());
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetSymbol || !selectedAsset) {
      setErrorMsg('Pilih aset terlebih dahulu.');
      return;
    }
    if (numTargetPrice <= 0) {
      setErrorMsg('Target harga harus lebih besar dari Rp 0.');
      return;
    }

    const newAlert: PriceAlertItem = {
      id: `alert-${Date.now()}`,
      userId: 'current',
      symbol: selectedAsset.symbol,
      assetName: selectedAsset.name,
      assetType: selectedAsset.type,
      targetPrice: numTargetPrice,
      condition,
      initialPrice: currentAssetPrice,
      currentPrice: currentAssetPrice,
      isEnabled: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      note: note.trim() || undefined,
    };

    onSaveAlert(newAlert);
    setErrorMsg(null);
    setNote('');
    setActiveTab('alerts');
  };

  const activeAlertsCount = alerts.filter((a) => a.isEnabled && a.status === 'active').length;
  const triggeredAlerts = alerts.filter((a) => a.status === 'triggered');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Pemberitahuan & Target Alert</h2>
                {activeAlertsCount > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                    {activeAlertsCount} Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">Pantau pergerakan harga saham IDX & NAV Reksa Dana</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Daftar Alert ({alerts.length})</span>
            {triggeredAlerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pasang Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Push Notifikasi</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: LIST ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {/* Triggered Alerts Notification Banner */}
              {triggeredAlerts.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{triggeredAlerts.length} Target Harga Telah Tercapai!</span>
                  </div>
                  <div className="space-y-1.5">
                    {triggeredAlerts.map((ta) => (
                      <div
                        key={ta.id}
                        className="bg-white p-2.5 rounded-lg border border-rose-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-slate-900">{ta.symbol}</span>
                          <span className="text-slate-500 ml-1.5">
                            menyentuh {formatRupiah(ta.targetPrice)} ({ta.condition === 'above_or_equal' ? '≥ target naik' : '≤ target turun'})
                          </span>
                        </div>
                        <button
                          onClick={() => onDismissTriggeredAlert(ta.id)}
                          className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
                        >
                          Tandai Selesai
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Push Status Brief Banner */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  {isPushEnabled && pushPermission === 'granted' ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Push Browser Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <BellOff className="w-3.5 h-3.5 text-amber-600" />
                      Push Browser Belum Aktif
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  Atur
                </button>
              </div>

              {/* List of Alerts */}
              {alerts.length > 0 ? (
                <div className="space-y-2.5">
                  {alerts.map((alert) => {
                    const match = assetMap.get(alert.symbol);
                    const currentPrice = match ? match.price : (alert.currentPrice || alert.initialPrice);
                    const diffPercent = ((alert.targetPrice - currentPrice) / currentPrice) * 100;
                    const isTriggered = alert.status === 'triggered';
                    const isAbove = alert.condition === 'above_or_equal';

                    return (
                      <div
                        key={alert.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isTriggered
                            ? 'bg-amber-50/60 border-amber-300'
                            : alert.isEnabled
                            ? 'bg-white border-slate-200 shadow-xs'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">{alert.symbol}</span>
                              <span className="text-[10px] text-slate-500 capitalize">{alert.assetType}</span>
                              {isTriggered && (
                                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-full">
                                  Tercapai 🎯
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[210px] sm:max-w-xs">
                              {alert.assetName}
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alert.isEnabled}
                                onChange={(e) => onToggleAlertEnabled(alert.id, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>

                            <button
                              onClick={() => onDeleteAlert(alert.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                              title="Hapus alert"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Price Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2">
                          <div>
                            <div className="text-[10px] text-slate-500">Target Harga</div>
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              {isAbove ? (
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-rose-600" />
                              )}
                              <span>{formatRupiah(alert.targetPrice)}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {isAbove ? '≥ Batas Naik' : '≤ Batas Turun'}
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-slate-500">Harga Sekarang</div>
                            <div className="font-bold text-slate-900">{formatRupiah(currentPrice)}</div>
                            <span
                              className={`text-[10px] font-semibold ${
                                diffPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              Jarak: {diffPercent > 0 ? '+' : ''}{diffPercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {alert.note && (
                          <div className="text-[11px] text-slate-500 italic bg-white px-2 py-1 rounded border border-slate-100">
                            "{alert.note}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Belum Ada Target Alert</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      Pasang target harga untuk aset di daftar pantauan agar Anda mendapat notifikasi otomatis saat harga tercapai.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    + Buat Alert Pertama
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE ALERT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAlert} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Asset Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Aset Investasi</label>
                <select
                  value={selectedAssetSymbol}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <optgroup label="Daftar Pantauan (Watchlist)">
                    {selectableAssets
                      .filter((a) => a.inWatchlist)
                      .map((a) => (
                        <option key={a.symbol} value={a.symbol}>
                          {a.symbol} - {a.name} ({formatRupiah(a.price)})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Saham & Reksa Dana Lainnya">
                    {selectableAssets
                      .filter((a) => !a.inWatchlist)
                      .map((a) => (
                        <option key={a.symbol} value={a.symbol}>
                          {a.symbol} - {a.name} ({formatRupiah(a.price)})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Current Price Banner */}
              {selectedAsset && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-semibold block">Harga Pasar Saat Ini</span>
                    <span className="text-base font-extrabold text-slate-900">{formatRupiah(currentAssetPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase">{selectedAsset.type}</span>
                    <div className="text-[11px] font-semibold text-slate-700">{selectedAsset.symbol}</div>
                  </div>
                </div>
              )}

              {/* Alert Trigger Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kondisi Pemicu Alert</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCondition('above_or_equal')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      condition === 'above_or_equal'
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Naik Melampaui (≥)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Take profit / sinyal breakout</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCondition('below_or_equal')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      condition === 'below_or_equal'
                        ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500 text-rose-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                      <span>Turun Menyentuh (≤)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Buy on weakness / antisipasi</p>
                  </button>
                </div>
              </div>

              {/* Target Price Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Harga (IDR)</label>
                  {numTargetPrice > 0 && currentAssetPrice > 0 && (
                    <span
                      className={`text-[11px] font-semibold ${
                        priceDiffPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {priceDiffPercent > 0 ? '+' : ''}{priceDiffPercent.toFixed(1)}% dari harga kini
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={targetPriceInput}
                    onChange={(e) => setTargetPriceInput(e.target.value)}
                    placeholder="Contoh: 10500"
                    className="w-full text-xs font-bold pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-[10px] text-slate-400 font-medium">Preset:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(2)}
                    className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded font-semibold cursor-pointer"
                  >
                    +2%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(5)}
                    className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded font-semibold cursor-pointer"
                  >
                    +5%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(10)}
                    className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded font-semibold cursor-pointer"
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(-2)}
                    className="px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded font-semibold cursor-pointer"
                  >
                    -2%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(-5)}
                    className="px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded font-semibold cursor-pointer"
                  >
                    -5%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(-10)}
                    className="px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded font-semibold cursor-pointer"
                  >
                    -10%
                  </button>
                </div>
              </div>

              {/* Note / Catatan Strategi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Strategi (Opsional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: Titik profit taking 50% lot atau averaging down"
                  maxLength={100}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('alerts')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Pasang Target Alert</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PUSH SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Push Notifikasi Browser</h4>
                    <p className="text-[11px] text-slate-500">
                      Terima pemberitahuan pop-up langsung di perangkat Anda saat target harga tercapai.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isPushEnabled}
                      onChange={(e) => onTogglePushEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Status Izin Browser:</span>
                  {pushPermission === 'granted' ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Diizinkan (Aktif)
                    </span>
                  ) : pushPermission === 'denied' ? (
                    <span className="font-bold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Diblokir oleh Browser
                    </span>
                  ) : (
                    <button
                      onClick={onRequestPushPermission}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                    >
                      Minta Izin Notifikasi
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons for Testing */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onSendTestNotification}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>Kirim Notifikasi Uji Coba Sekarang</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  Menguji integrasi Web Notifications API dan pemberitahuan pop-up in-app InvestMate AI.
                </p>
              </div>

              {/* Information Cards */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Privasi & Keamanan Notifikasi</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Target harga diproses secara lokal di browser Anda dan tersinkronisasi aman ke database Firestore. Tidak ada data pihak ketiga yang dijual atau dibagikan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[11px]">
            <span>InvestMate AI Alerts</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">Real-time IDX</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
