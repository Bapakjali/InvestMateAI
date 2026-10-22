/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Coins,
  Calendar,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Landmark,
  PlusCircle,
  HelpCircle,
  BarChart2,
  DollarSign,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PositionHolding, StockQuote, DividendScheduleItem } from '../types';
import { formatRupiah, formatPercent, formatDateIndo } from '../utils/financialCalculations';
import { calculatePortfolioDividends, IDX_DIVIDEND_CALENDAR, STOCK_DIVIDEND_PROFILES } from '../data/dividendData';

interface DividendTrackerViewProps {
  holdings: PositionHolding[];
  stocksMap?: Record<string, StockQuote>;
  onOpenAssetDetail?: (symbol: string, type: 'saham' | 'reksadana') => void;
  onOpenAddTx?: (symbol?: string, type?: 'saham') => void;
  onOpenAlerts?: (symbol?: string) => void;
  onAskAi?: (prompt: string) => void;
}

export const DividendTrackerView: React.FC<DividendTrackerViewProps> = ({
  holdings,
  stocksMap = {},
  onOpenAssetDetail,
  onOpenAddTx,
  onOpenAlerts,
  onAskAi,
}) => {
  const [activeTab, setActiveTab] = useState<'holdings' | 'calendar' | 'compounding'>('holdings');
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'portfolio'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM'

  // Calculate dynamic dividend metrics across user holdings
  const dividendSummary = useMemo(() => {
    return calculatePortfolioDividends(holdings, stocksMap);
  }, [holdings, stocksMap]);

  // Extract unique months from calendar
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    IDX_DIVIDEND_CALENDAR.forEach((d) => {
      const ym = d.cumDate.slice(0, 7);
      monthsSet.add(ym);
    });
    return Array.from(monthsSet).sort();
  }, []);

  // Filtered calendar items
  const filteredCalendarSchedules = useMemo(() => {
    return dividendSummary.upcomingSchedules.filter((item) => {
      const matchesPortfolio = calendarFilter === 'all' || item.userShares > 0;
      const matchesMonth = selectedMonth === 'all' || item.cumDate.startsWith(selectedMonth) || item.paymentDate.startsWith(selectedMonth);
      return matchesPortfolio && matchesMonth;
    });
  }, [dividendSummary.upcomingSchedules, calendarFilter, selectedMonth]);

  // Top dividend contributor
  const topContributor = dividendSummary.holdings[0] || null;

  const handleAskAiAboutDividends = () => {
    if (!onAskAi) return;
    const stockList = dividendSummary.holdings.map((h) => `${h.symbol} (${h.totalLots} lot)`).join(', ');
    const prompt = `Saya memiliki portofolio saham BEI: ${
      stockList || 'BBCA dan BBRI'
    } dengan estimasi dividen tahunan ${formatRupiah(
      dividendSummary.totalEstimatedAnnualDividend
    )} dan rata-rata Yield on Cost ${
      dividendSummary.averageYieldOnCost
    }%. Bagaimana strategi mengoptimalkan passive income dividen ini dan apa risiko dividen trap yang harus saya waspadai?`;
    onAskAi(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Portfolio Dividend Metrics */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                Pelacak Dividen Portofolio
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-300">Passive Income Saham BEI</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {formatRupiah(dividendSummary.totalEstimatedAnnualDividend)}
              <span className="text-xs sm:text-sm font-normal text-slate-300 ml-2">/ tahun</span>
            </div>
            <div className="mt-1 text-xs text-slate-300 flex items-center gap-1.5">
              <span>Setara <strong className="text-emerald-300 font-bold">{formatRupiah(dividendSummary.totalEstimatedMonthlyDividend)}</strong> per bulan</span>
              {topContributor && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 hidden sm:inline">Penyumbang Terbesar: <strong>{topContributor.symbol}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onAskAi && (
              <button
                onClick={handleAskAiAboutDividends}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tanya AI Dividen</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Cards inside Header */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] sm:text-xs text-slate-300 block mb-0.5">Yield on Cost (YoC)</span>
            <div className="text-sm sm:text-lg font-bold text-emerald-400">
              {dividendSummary.averageYieldOnCost > 0 ? `${dividendSummary.averageYieldOnCost}%` : '0.0%'}
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5 truncate">
              Yield riil atas modal beli
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] sm:text-xs text-slate-300 block mb-0.5">Market Div. Yield</span>
            <div className="text-sm sm:text-lg font-bold text-white">
              {dividendSummary.averageMarketYield > 0 ? `${dividendSummary.averageMarketYield}%` : '0.0%'}
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5 truncate">
              Yield atas harga pasar kini
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[10px] sm:text-xs text-slate-300 block mb-0.5">Saham Penghasil</span>
            <div className="text-sm sm:text-lg font-bold text-white">
              {dividendSummary.holdings.length}
              <span className="text-[10px] font-normal text-slate-400 ml-1">Emiten</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5 truncate">
              {formatRupiah(dividendSummary.totalStockPortfolioValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'holdings'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Estimasi per Saham Portofolio ({dividendSummary.holdings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'calendar'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Kalender Pembagian Dividen</span>
          {dividendSummary.upcomingSchedules.some((s) => s.userShares > 0) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('compounding')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'compounding'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Proyeksi Reinvestasi (DRIP)</span>
        </button>
      </div>

      {/* TAB 1: ESTIMASI PER SAHAM PORTOFOLIO */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
          {dividendSummary.holdings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dividendSummary.holdings.map((h) => {
                const isYoCHigher = h.yieldOnCost > h.marketDividendYield;
                return (
                  <div
                    key={h.symbol}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">{h.symbol}</span>
                          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                            {h.totalLots} Lot ({h.totalShares.toLocaleString('id-ID')} lembar)
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[220px] sm:max-w-xs mt-0.5">
                          {h.assetName}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Estimasi Dividen / Thn</span>
                        <div className="text-base font-extrabold text-emerald-700">
                          {formatRupiah(h.estimatedAnnualDividend)}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {formatRupiah(h.estimatedMonthlyDividend)} / bln
                        </span>
                      </div>
                    </div>

                    {/* Yield Comparison Bar */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Yield on Cost (Modal Beli)</span>
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <span className={isYoCHigher ? 'text-emerald-700' : 'text-slate-800'}>
                            {h.yieldOnCost}%
                          </span>
                          {isYoCHigher && (
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">
                              +{(h.yieldOnCost - h.marketDividendYield).toFixed(1)}% vs pasar
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">Beli di {formatRupiah(h.averagePrice)}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Market Div. Yield (Kini)</span>
                        <div className="font-bold text-slate-800">{h.marketDividendYield}%</div>
                        <span className="text-[10px] text-slate-400">Harga {formatRupiah(h.currentPrice)}</span>
                      </div>
                    </div>

                    {/* Next Upcoming Dividend Event for this stock */}
                    {h.nextUpcomingDividend ? (
                      <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200/80 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-950 block">
                              {h.nextUpcomingDividend.dividendType} {formatRupiah(h.nextUpcomingDividend.amountPerShare)}/lbr
                            </span>
                            <span className="text-[10px] text-slate-600">
                              Cum Date: {formatDateIndo(h.nextUpcomingDividend.cumDate)} · Bayar: {formatDateIndo(h.nextUpcomingDividend.paymentDate)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Est. Masuk RDN</span>
                          <span className="font-bold text-emerald-800">
                            {formatRupiah(h.totalShares * h.nextUpcomingDividend.amountPerShare)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Jadwal dividen periode berikutnya belum diumumkan di keterbukaan IDX.
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">
                        {STOCK_DIVIDEND_PROFILES[h.symbol]?.frequency || 'Dividen Tahunan'}
                      </span>
                      <div className="flex items-center gap-2">
                        {onOpenAlerts && (
                          <button
                            onClick={() => onOpenAlerts(h.symbol)}
                            className="text-slate-500 hover:text-emerald-700 p-1 cursor-pointer"
                            title="Pasang alert target dividen/harga"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onOpenAssetDetail && (
                          <button
                            onClick={() => onOpenAssetDetail(h.symbol, 'saham')}
                            className="font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-0.5"
                          >
                            <span>Analisis Fundamental</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Belum Ada Kepemilikan Saham di Portofolio</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Catat transaksi pembelian saham pertama Anda untuk melacak estimasi dividen tunai dan Yield on Cost secara otomatis.
                </p>
              </div>
              {onOpenAddTx && (
                <button
                  onClick={() => onOpenAddTx(undefined, 'saham')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  + Catat Kepemilikan Saham
                </button>
              )}
            </div>
          )}

          {/* Educational Note on Yield on Cost */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Memahami Yield on Cost (YoC) vs Market Dividend Yield</span>
            </div>
            <p className="leading-relaxed">
              <strong>Yield on Cost</strong> mengukur hasil dividen riil yang Anda nikmati berdasarkan <em>harga modal pembelian awal Anda</em>. Jika Anda membeli saham unggulan bertumbuh (seperti BBCA atau BBRI) beberapa tahun lalu di harga murah dan emiten terus menaikkan dividennya, maka Yield on Cost riil Anda bisa mencapai 10-20% per tahun, jauh melampaui bunga deposito atau inflasi!
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: KALENDER PEMBAGIAN DIVIDEN BEI */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Controls & Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            {/* Filter Owned vs All */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setCalendarFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  calendarFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Emiten BEI
              </button>
              <button
                onClick={() => setCalendarFilter('portfolio')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  calendarFilter === 'portfolio'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Khusus Portofolio Saya</span>
              </button>
            </div>

            {/* Month Filter Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">Semua Bulan Jadwal</option>
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {new Date(`${ym}-01`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule Timeline Cards */}
          <div className="space-y-3">
            {filteredCalendarSchedules.length > 0 ? (
              filteredCalendarSchedules.map((item) => {
                const isOwned = item.userShares > 0;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border transition-all p-4 ${
                      isOwned
                        ? 'border-emerald-300 ring-1 ring-emerald-500/30 shadow-xs bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">{item.symbol}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.dividendType === 'Interim'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            Dividen {item.dividendType}
                          </span>
                          {isOwned && (
                            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Dimiliki: {item.userShares.toLocaleString('id-ID')} lbr
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.name}</div>
                      </div>

                      {/* Cash Info */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Nilai Dividen</span>
                        <div className="text-base font-extrabold text-slate-900">
                          {formatRupiah(item.amountPerShare)}
                          <span className="text-xs font-normal text-slate-500 ml-1">/ lembar</span>
                        </div>
                        {isOwned && (
                          <div className="text-xs font-bold text-emerald-700 mt-0.5">
                            Est. Masuk RDN: {formatRupiah(item.userEstimatedCash)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline 4-Key Dates Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                      {/* Cum Date */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide">
                          Cum Dividend
                        </span>
                        <div className="font-extrabold text-slate-900 mt-0.5">
                          {formatDateIndo(item.cumDate)}
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Batas beli berhak dividen
                        </span>
                      </div>

                      {/* Ex Date */}
                      <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-800 block uppercase tracking-wide">
                          Ex Dividend
                        </span>
                        <div className="font-extrabold text-amber-950 mt-0.5">
                          {formatDateIndo(item.exDate)}
                        </div>
                        <span className="text-[9px] text-amber-700 block mt-0.5">
                          Tanpa hak dividen
                        </span>
                      </div>

                      {/* Recording Date */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide">
                          Recording Date
                        </span>
                        <div className="font-extrabold text-slate-900 mt-0.5">
                          {formatDateIndo(item.recordingDate)}
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Pencatatan DPS (16:00 WIB)
                        </span>
                      </div>

                      {/* Payment Date */}
                      <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-800 block uppercase tracking-wide">
                          Payment Date (RDN)
                        </span>
                        <div className="font-extrabold text-emerald-950 mt-0.5">
                          {formatDateIndo(item.paymentDate)}
                        </div>
                        <span className="text-[9px] text-emerald-700 block mt-0.5">
                          Uang cair masuk rekening
                        </span>
                      </div>
                    </div>

                    {/* Notes & Actions */}
                    <div className="mt-3 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {item.notes && (
                        <p className="text-[11px] text-slate-500 italic max-w-lg">
                          "{item.notes}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        {onOpenAlerts && (
                          <button
                            onClick={() => onOpenAlerts(item.symbol)}
                            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            <span>Pasang Alert</span>
                          </button>
                        )}
                        {onOpenAssetDetail && (
                          <button
                            onClick={() => onOpenAssetDetail(item.symbol, 'saham')}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Detail Saham</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-8 text-center rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                Tidak ada jadwal dividen yang cocok dengan kriteria filter saat ini.
              </div>
            )}
          </div>

          {/* Dividend Trap Warning Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Edukasi Pemula: Waspada Fenomena "Dividend Trap"</span>
            </div>
            <p className="leading-relaxed text-amber-800">
              Pada tanggal <strong>Ex-Date</strong>, harga saham di BEI biasanya akan terkoreksi otomatis kira-kira sebesar nilai dividen per lembar karena hak dividen telah terlepas. Jangan membeli saham hanya 1 hari sebelum Cum-Date demi mengejar dividen jika Anda tidak siap memegang saham tersebut dalam jangka menengah-panjang. Pilihlah emiten berfundamental kokoh dengan laba bertumbuh!
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: PROYEKSI REINVESTASI (DRIP - DIVIDEND REINVESTMENT) */}
      {activeTab === 'compounding' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Kekuatan Compounding Reinvestasi Dividen</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulasi proyeksi jika dividen tunai yang Anda terima dibelikan kembali ke lot saham (Dividend Reinvestment Plan) selama beberapa tahun ke depan.
            </p>
          </div>

          {dividendSummary.totalEstimatedAnnualDividend > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* 3 Years */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Horison 3 Tahun</span>
                  <div className="text-base font-extrabold text-slate-900">
                    +{formatRupiah(dividendSummary.totalEstimatedAnnualDividend * 3 * 1.12)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Akumulasi dividen + estimasi pertumbuhan modal berulang ~12%
                  </p>
                </div>

                {/* 5 Years */}
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Horison 5 Tahun</span>
                  <div className="text-base font-extrabold text-emerald-950">
                    +{formatRupiah(dividendSummary.totalEstimatedAnnualDividend * 5 * 1.25)}
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Efek bola salju mulai melipatgandakan jumlah lot kepemilikan Anda
                  </p>
                </div>

                {/* 10 Years */}
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Horison 10 Tahun</span>
                  <div className="text-base font-extrabold text-white">
                    +{formatRupiah(dividendSummary.totalEstimatedAnnualDividend * 10 * 1.65)}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Dividen tahunan masa depan dapat menutupi modal pembelian awal Anda (Free Carry)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <span className="font-bold text-slate-800 block">Tips Sukses Dividend Investing:</span>
                <ul className="space-y-1 list-disc list-inside text-[11px]">
                  <li>
                    Pilihlah emiten dengan rekam jejak dividen tanpa putus (minimal 10 tahun berturut-turut seperti BBCA, BBRI, ASII, TLKM).
                  </li>
                  <li>
                    Perhatikan <em>Dividend Payout Ratio (DPR)</em>: Rentang sehat adalah 40% - 70%. DPR &gt; 100% berisiko tidak berkelanjutan jika laba emiten turun.
                  </li>
                  <li>
                    Gunakan dividen yang masuk RDN untuk membeli kembali saham yang sedang terdiskon saat koreksi pasar.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              Tambahkan saham ke portofolio Anda untuk melihat proyeksi compounding dividen.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
