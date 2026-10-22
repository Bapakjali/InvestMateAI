/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Clock,
  Sparkles,
  PieChart as PieIcon,
  Layers,
  Target,
  ExternalLink,
  Bell,
  BellRing,
  Coins,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  PortfolioSummary,
  UserFinancialProfile,
  FinancialHealthEvaluation,
  WatchlistRecord,
  AiAnalysisRecord,
  InvestmentGoalItem,
  PriceAlertItem,
  StockQuote,
} from '../types';
import { formatRupiah, formatPercent, formatDateIndo } from '../utils/financialCalculations';
import { PullToRefresh } from './PullToRefresh';
import { PortfolioRiskGauge } from './PortfolioRiskGauge';
import { SectorPerformanceAnalysis } from './SectorPerformanceAnalysis';
import { calculatePortfolioDividends } from '../data/dividendData';

interface DashboardViewProps {
  portfolio: PortfolioSummary;
  financialProfile: UserFinancialProfile | null;
  healthEval: FinancialHealthEvaluation;
  watchlist: WatchlistRecord[];
  recentAnalyses: AiAnalysisRecord[];
  goals: InvestmentGoalItem[];
  isDemoMode: boolean;
  onNavigate: (tab: string) => void;
  onOpenAddTx: () => void;
  onOpenAssetDetail: (symbol: string, type: 'saham' | 'reksadana') => void;
  onAskAiWithContext: (prompt: string) => void;
  onLoadDemoData: () => void;
  onRefresh?: () => Promise<void> | void;
  alerts?: PriceAlertItem[];
  onOpenAlerts?: (symbol?: string) => void;
  onDismissAlert?: (alertId: string) => void;
  stocks?: StockQuote[];
  onOpenDividends?: () => void;
}

// Animation variants for smooth mobile stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const cardHover = {
  whileHover: { y: -2, transition: { duration: 0.15 } },
  whileTap: { scale: 0.98 },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  portfolio,
  financialProfile,
  healthEval,
  watchlist,
  recentAnalyses,
  goals,
  isDemoMode,
  onNavigate,
  onOpenAddTx,
  onOpenAssetDetail,
  onAskAiWithContext,
  onLoadDemoData,
  onRefresh,
  alerts = [],
  onOpenAlerts,
  onDismissAlert,
  stocks = [],
  onOpenDividends,
}) => {
  const isPositiveUnrealized = portfolio.unrealizedPnL >= 0;
  const isPositiveRealized = portfolio.realizedPnL >= 0;

  const triggeredAlerts = alerts.filter((a) => a.status === 'triggered');
  const activeAlertsCount = alerts.filter((a) => a.isEnabled && a.status === 'active').length;

  const stocksMap = useMemo(() => {
    const map: Record<string, StockQuote> = {};
    stocks.forEach((s) => {
      map[s.symbol] = s;
    });
    return map;
  }, [stocks]);

  const dividendSummary = useMemo(() => {
    return calculatePortfolioDividends(portfolio.holdings, stocksMap);
  }, [portfolio.holdings, stocksMap]);

  return (
    <PullToRefresh onRefresh={onRefresh || (() => {})}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
      {/* Triggered Price Alerts Notification Banner */}
      {triggeredAlerts.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-3.5 rounded-xl shadow-md border border-rose-500/50 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/30 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-200">
                🎯 Target Harga Tercapai ({triggeredAlerts.length} aset):
              </p>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {triggeredAlerts.map((ta) => (
                  <span
                    key={ta.id}
                    className="text-[11px] font-extrabold text-white bg-rose-950/70 border border-rose-400/40 px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    <span>{ta.symbol}</span>
                    <span className="text-rose-300 font-normal">
                      {ta.condition === 'above_or_equal' ? '≥' : '≤'} {formatRupiah(ta.targetPrice)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          {onOpenAlerts && (
            <button
              onClick={() => onOpenAlerts()}
              className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span>Kelola Alert</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}

      {/* Banner Mode Demo / Status Data */}
      {isDemoMode && (
        <motion.div
          variants={itemVariants}
          className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex flex-wrap items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 tracking-wide uppercase">
                Perhatian: Menampilkan Data Simulasi (DEMO)
              </p>
              <p className="text-xs text-amber-800">
                Angka portofolio di bawah adalah contoh demonstrasi untuk mempelajari fitur aplikasi. Anda dapat menghapus data ini dan mencatat transaksi manual Anda kapan saja.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('portofolio')}
            className="text-xs font-semibold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Kelola Portofolio Asli
          </button>
        </motion.div>
      )}

      {/* Main Stats Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Nilai Portofolio */}
        <motion.div
          {...cardHover}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
            <span>Nilai Pasar</span>
            <span className="text-[10px] text-slate-400">Terkini</span>
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(portfolio.totalMarketValue)}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 truncate">
            Modal: <span className="font-semibold text-slate-700">{formatRupiah(portfolio.totalNetInvested)}</span>
          </div>
        </motion.div>

        {/* Keuntungan Belum Terealisasi (Floating PnL) */}
        <motion.div
          {...cardHover}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
            <span>Imbal Hasil</span>
            {isPositiveUnrealized ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            )}
          </div>
          <div className={`text-lg sm:text-2xl font-extrabold tracking-tight ${isPositiveUnrealized ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatRupiah(portfolio.unrealizedPnL)}
          </div>
          <div className="mt-1.5 text-[11px] flex items-center gap-1">
            <span className={`font-bold ${isPositiveUnrealized ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatPercent(portfolio.unrealizedPnLPercent)}
            </span>
            <span className="text-slate-400">· Floating</span>
          </div>
        </motion.div>

        {/* Keuntungan Terealisasi */}
        <motion.div
          {...cardHover}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
            <span>Realisasi Laba</span>
            <span className="text-[10px] text-slate-400">Jual</span>
          </div>
          <div className={`text-lg sm:text-2xl font-extrabold tracking-tight ${isPositiveRealized ? 'text-slate-900' : 'text-rose-700'}`}>
            {formatRupiah(portfolio.realizedPnL)}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 truncate">
            {portfolio.transactionsCount} catatan transaksi
          </div>
        </motion.div>

        {/* Kapasitas Investasi Bulanan */}
        <motion.div
          {...cardHover}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
            <span>Kapasitas Rutin</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(healthEval.safeMonthlyInvestmentAmount)}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-600 truncate font-medium">
            {healthEval.status}
          </div>
        </motion.div>
      </motion.div>

      {/* Financial Health & Prioritas Recommendation Box */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pemeriksaan Fondasi Keuangan Pribadi</h3>
              <p className="text-[11px] text-slate-500">Evaluasi kecukupan sebelum mengambil risiko investasi di Stockbit & Bibit</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('perencana')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            Sesuaikan Profil
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 text-[11px] mb-1">Rasio Pengeluaran Bulanan</div>
            <div className="text-base font-bold text-slate-800">{healthEval.expenseRatio.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Surplus: {formatRupiah(healthEval.monthlySurplus)} / bulan
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 text-[11px] mb-1">Rasio Beban Cicilan (DSR)</div>
            <div className={`text-base font-bold ${healthEval.debtServiceRatio > 35 ? 'text-rose-600' : 'text-slate-800'}`}>
              {healthEval.debtServiceRatio.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Batas aman rekomendasi: &lt; 30-35%
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-slate-500 text-[11px] mb-1">Kecukupan Dana Darurat</div>
            <div className="text-base font-bold text-slate-800">
              {healthEval.emergencyFundMonths.toFixed(1)} / {healthEval.targetEmergencyFundMonths} bulan
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Tercatat: {formatRupiah(financialProfile?.emergencyFund || 0)}
            </div>
          </div>
        </div>

        <div className="mt-3.5 p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-start gap-2 text-xs text-emerald-950">
          <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Rekomendasi InvestMate: </span>
            {healthEval.summary}
          </div>
        </div>
      </motion.div>

      {/* 2-Columns: Alokasi Aset & Portofolio vs Watchlist */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom Kiri: Alokasi Aset & Daftar Kepemilikan (2 Kolom) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Asset Allocation Breakdown */}
          <motion.div variants={itemVariants} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Alokasi Aset Tercatat</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {formatDateIndo(portfolio.lastUpdated, true)}
              </span>
            </div>

            {portfolio.totalMarketValue > 0 ? (
              <div className="space-y-3">
                {/* Visual Bar Allocation with smooth motion */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  {portfolio.assetAllocation.saham > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(portfolio.assetAllocation.saham / portfolio.totalMarketValue) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-blue-600 h-full"
                      title="Saham BEI"
                    />
                  )}
                  {portfolio.assetAllocation.reksadana_pasar_uang > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(portfolio.assetAllocation.reksadana_pasar_uang / portfolio.totalMarketValue) * 100}%`,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-emerald-500 h-full"
                      title="Reksa Dana Pasar Uang"
                    />
                  )}
                  {portfolio.assetAllocation.reksadana_pendapatan_tetap > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(portfolio.assetAllocation.reksadana_pendapatan_tetap / portfolio.totalMarketValue) * 100}%`,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-indigo-500 h-full"
                      title="Reksa Dana Pendapatan Tetap"
                    />
                  )}
                  {portfolio.assetAllocation.reksadana_campuran > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(portfolio.assetAllocation.reksadana_campuran / portfolio.totalMarketValue) * 100}%`,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-amber-500 h-full"
                      title="Reksa Dana Campuran"
                    />
                  )}
                  {portfolio.assetAllocation.reksadana_saham > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(portfolio.assetAllocation.reksadana_saham / portfolio.totalMarketValue) * 100}%`,
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-rose-500 h-full"
                      title="Reksa Dana Saham"
                    />
                  )}
                </div>

                {/* Legend Items */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="text-slate-600 text-[11px]">Saham BEI:</span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {formatRupiah(portfolio.assetAllocation.saham)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-600 text-[11px]">RD Pasar Uang:</span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {formatRupiah(portfolio.assetAllocation.reksadana_pasar_uang)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="text-slate-600 text-[11px]">RD Pend. Tetap:</span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {formatRupiah(portfolio.assetAllocation.reksadana_pendapatan_tetap)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-600 text-[11px]">RD Campuran:</span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {formatRupiah(portfolio.assetAllocation.reksadana_campuran)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-slate-600 text-[11px]">RD Saham:</span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {formatRupiah(portfolio.assetAllocation.reksadana_saham)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                Belum ada aset investasi yang tercatat dalam portofolio Anda.
              </div>
            )}
          </motion.div>

          {/* Daftar Kepemilikan Aset Saat Ini */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Aset yang Dimiliki</h3>
                <p className="text-[11px] text-slate-500">Pencatatan manual untuk kepemilikan di Stockbit & Bibit</p>
              </div>
              <button
                onClick={onOpenAddTx}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Catat Transaksi
              </button>
            </div>

            {/* Ribbon Estimasi Dividen Portofolio */}
            {dividendSummary.totalEstimatedAnnualDividend > 0 && (
              <div className="bg-emerald-50/80 border-b border-emerald-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-950">
                      Est. Dividen Saham: {formatRupiah(dividendSummary.totalEstimatedAnnualDividend)}/thn
                    </span>
                    <span className="text-[11px] text-emerald-800 ml-1.5 hidden sm:inline">
                      · Rata-Rata Yield on Cost: {dividendSummary.averageYieldOnCost}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={onOpenDividends || (() => onNavigate('portofolio'))}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Kalender Dividen BEI</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {portfolio.holdings.length > 0 ? (
              <div>
                {/* Mobile Card List View (< sm screens) */}
                <div className="divide-y divide-slate-100 sm:hidden">
                  {portfolio.holdings.map((h, idx) => {
                    const isProfit = h.unrealizedPnL >= 0;
                    const stockDiv = dividendSummary.holdings.find((d) => d.symbol === h.symbol);
                    return (
                      <motion.div
                        key={h.symbol}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => onOpenAssetDetail(h.symbol, h.assetType)}
                        className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{h.symbol}</span>
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {h.assetType === 'saham'
                                  ? `${h.totalLotsOrUnits} Lot`
                                  : `${h.totalSharesOrUnits.toFixed(1)} Unit`}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">
                              {h.assetName}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-slate-900">
                              {formatRupiah(h.currentMarketValue)}
                            </div>
                            <div className={`text-xs font-semibold ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {formatPercent(h.unrealizedPnLPercent)}
                            </div>
                          </div>
                        </div>

                        {h.assetType === 'saham' && stockDiv && (
                          <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <span className="text-slate-500">Estimasi Dividen:</span>
                            <span className="font-semibold text-emerald-800">
                              {formatRupiah(stockDiv.estimatedAnnualDividend)}/thn (YoC {stockDiv.yieldOnCost}%)
                            </span>
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div>
                            <span>Avg: {formatRupiah(h.averagePrice)}</span>
                            <span className="mx-1.5">·</span>
                            <span>Kini: {formatRupiah(h.currentPrice)}</span>
                          </div>
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            Analisis <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Desktop Table View (>= sm screens) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Aset</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Unit / Lot</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Harga Rata-Rata</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Harga Terkini</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Nilai Pasar</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Imbal Hasil</th>
                        <th className="py-2.5 px-4 font-center text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portfolio.holdings.map((h) => {
                        const isProfit = h.unrealizedPnL >= 0;
                        const stockDiv = dividendSummary.holdings.find((d) => d.symbol === h.symbol);
                        return (
                          <tr key={h.symbol} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{h.symbol}</div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                                {h.assetName}
                              </div>
                              {h.assetType === 'saham' && stockDiv && (
                                <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                                  Est. Div: {formatRupiah(stockDiv.estimatedAnnualDividend)}/thn (YoC {stockDiv.yieldOnCost}%)
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-medium text-slate-800">
                                {h.assetType === 'saham'
                                  ? `${h.totalLotsOrUnits.toLocaleString('id-ID')} Lot`
                                  : `${h.totalSharesOrUnits.toFixed(2)} Unit`}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {h.assetType === 'saham' ? `${h.totalSharesOrUnits} lbr` : 'Reksa Dana'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-700">
                              {formatRupiah(h.averagePrice)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-800">
                              {formatRupiah(h.currentPrice)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900">
                              {formatRupiah(h.currentMarketValue)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className={`font-semibold ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {formatPercent(h.unrealizedPnLPercent)}
                              </div>
                              <div className="text-[10px] text-slate-400">{formatRupiah(h.unrealizedPnL)}</div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => onOpenAssetDetail(h.symbol, h.assetType)}
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                              >
                                Analisis
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs space-y-3">
                <p>Belum ada catatan aset investasi yang dimiliki.</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={onOpenAddTx}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-xs"
                  >
                    Catat Transaksi Pertama
                  </button>
                  <button
                    onClick={onLoadDemoData}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  >
                    Muat Data Demo
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Analisis Performa Sektor Saham BEI (Perbankan vs Energi & Overview) */}
          <motion.div variants={itemVariants}>
            <SectorPerformanceAnalysis
              stocks={stocks}
              onOpenAssetDetail={onOpenAssetDetail}
              onAskAiWithContext={onAskAiWithContext}
              onOpenAlerts={onOpenAlerts}
            />
          </motion.div>
        </div>

        {/* Kolom Kanan: Portfolio Risk Gauge, Watchlist & Analisis AI Terkini */}
        <div className="space-y-5">
          {/* Portfolio Risk Gauge (Visual Risk Score vs Risk Tolerance Profile) */}
          <motion.div variants={itemVariants}>
            <PortfolioRiskGauge
              portfolio={portfolio}
              financialProfile={financialProfile}
              onNavigate={onNavigate}
            />
          </motion.div>

          {/* Target Finansial */}
          <motion.div variants={itemVariants} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Target Finansial</h3>
              </div>
              <button
                onClick={() => onNavigate('perencana')}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Ubah
              </button>
            </div>
            {goals.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {goals.map((g) => {
                  const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
                  return (
                    <motion.div
                      key={g.id}
                      {...cardHover}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-800">{g.title}</span>
                        <span className="text-[10px] text-slate-500">Tahun {g.targetYear}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden my-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-emerald-600 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{formatRupiah(g.currentAmount)}</span>
                        <span>{formatRupiah(g.targetAmount)} ({pct.toFixed(0)}%)</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center">
                Belum ada target keuangan yang ditentukan.
              </div>
            )}
          </motion.div>

          {/* Daftar Pantauan (Watchlist) */}
          <motion.div variants={itemVariants} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Daftar Pantauan (Watchlist)</h3>
                {activeAlertsCount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                    {activeAlertsCount} Alert
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onOpenAlerts && (
                  <button
                    onClick={() => onOpenAlerts()}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1"
                    title="Buka Pusat Alert & Push Notifikasi"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Target Alert</span>
                  </button>
                )}
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onNavigate('saham')}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cari Aset
                </button>
              </div>
            </div>

            {watchlist.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {watchlist.map((item) => {
                  const itemAlert = alerts.find((a) => a.symbol === item.symbol && a.isEnabled);
                  const isTriggered = itemAlert?.status === 'triggered';
                  return (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenAssetDetail(item.symbol, item.assetType)}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{item.symbol}</span>
                          <span className="text-[10px] text-slate-400 capitalize">· {item.assetType}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{item.assetName}</div>
                      </div>

                      {/* Right: Price & Alert trigger button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          {item.currentPrice && (
                            <div className="font-semibold text-slate-800">{formatRupiah(item.currentPrice)}</div>
                          )}
                        </div>

                        {onOpenAlerts && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAlerts(item.symbol);
                            }}
                            className={`p-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              isTriggered
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                : itemAlert
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100 opacity-80 group-hover:opacity-100'
                            }`}
                            title={
                              itemAlert
                                ? `Target Alert: ${itemAlert.condition === 'above_or_equal' ? '≥' : '≤'} ${formatRupiah(
                                    itemAlert.targetPrice
                                  )}`
                                : `Pasang target alert untuk ${item.symbol}`
                            }
                          >
                            <Bell className={`w-3.5 h-3.5 ${itemAlert ? 'text-emerald-700' : ''}`} />
                            {itemAlert ? (
                              <span className="hidden sm:inline">
                                {isTriggered
                                  ? 'Tercapai 🎯'
                                  : `${itemAlert.condition === 'above_or_equal' ? '≥' : '≤'} ${formatRupiah(
                                      itemAlert.targetPrice
                                    )}`}
                              </span>
                            ) : (
                              <span className="hidden sm:inline text-slate-500">+ Alert</span>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">
                Belum ada aset dalam daftar pantauan. Tandai saham atau reksa dana untuk memantau.
              </div>
            )}
          </motion.div>

          {/* Analisis AI Terakhir */}
          <motion.div variants={itemVariants} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Analisis AI Terakhir</h3>
              </div>
              <button
                onClick={() => onNavigate('riwayat')}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Lihat Semua
              </button>
            </div>

            {recentAnalyses.length > 0 ? (
              <div className="space-y-3 text-xs">
                {recentAnalyses.slice(0, 2).map((a) => (
                  <motion.div
                    key={a.id}
                    {...cardHover}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{a.topic}</span>
                      <span className="text-[10px] text-slate-400">{formatDateIndo(a.createdAt)}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-3 leading-relaxed text-[11px]">
                      {a.response.replace(/\*\*/g, '')}
                    </p>
                    <button
                      onClick={() => onNavigate('riwayat')}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Baca Analisis Lengkap
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center space-y-2">
                <p>Belum ada riwayat analisis AI.</p>
                <button
                  onClick={() => onAskAiWithContext('Bagaimana cara memulai investasi reksa dana di Bibit untuk pemula?')}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Tanya AI Sekarang
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
    </PullToRefresh>
  );
};
