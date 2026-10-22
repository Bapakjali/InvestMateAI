/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Scale,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  DollarSign,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PortfolioSummary,
  UserFinancialProfile,
  RiskProfile,
  AssetType,
  StockQuote,
  MutualFund,
} from '../types';
import { formatRupiah, formatPercent } from '../utils/financialCalculations';

interface RebalanceSuggestionToolProps {
  portfolio: PortfolioSummary;
  financialProfile: UserFinancialProfile;
  stocks?: Record<string, StockQuote>;
  mutualFunds?: Record<string, MutualFund>;
  onOpenAddTx?: (symbol?: string, type?: AssetType) => void;
  onRefresh?: () => Promise<void> | void;
}

// Indonesian Standard Asset Allocation Models based on Risk Tolerance
export const TARGET_ALLOCATION_MODELS: Record<
  RiskProfile,
  {
    name: string;
    description: string;
    expectedReturn: string;
    volatility: string;
    targets: {
      saham: number; // Saham BEI langsung
      reksadana_pasar_uang: number; // Pasar Uang
      reksadana_pendapatan_tetap: number; // Pendapatan Tetap / Obligasi
      reksadana_ekuitas: number; // RD Saham & Campuran
    };
  }
> = {
  konservatif: {
    name: 'Konservatif (Prioritas Pengamanan Pokok & Likuiditas)',
    description: 'Fokus menjaga keutuhan modal dan likuiditas tinggi dengan fluktuasi minimal.',
    expectedReturn: '4.5% - 6.5% / tahun',
    volatility: 'Sangat Rendah',
    targets: {
      reksadana_pasar_uang: 50,
      reksadana_pendapatan_tetap: 35,
      saham: 10,
      reksadana_ekuitas: 5,
    },
  },
  moderat: {
    name: 'Moderat (Pertumbuhan Seimbang & Risiko Terukur)',
    description: 'Keseimbangan antara perlindungan modal dan pertumbuhan nilai investasi jangka menengah.',
    expectedReturn: '7.0% - 10.0% / tahun',
    volatility: 'Sedang',
    targets: {
      reksadana_pasar_uang: 20,
      reksadana_pendapatan_tetap: 40,
      saham: 25,
      reksadana_ekuitas: 15,
    },
  },
  agresif: {
    name: 'Agresif (Pertumbuhan Maksimal Jangka Panjang)',
    description: 'Orientasi imbal hasil tinggi jangka panjang dengan toleransi penurunan berkala.',
    expectedReturn: '11.0% - 16.0% / tahun',
    volatility: 'Tinggi',
    targets: {
      reksadana_pasar_uang: 10,
      reksadana_pendapatan_tetap: 20,
      saham: 50,
      reksadana_ekuitas: 20,
    },
  },
};

interface AssetClassAnalysis {
  id: string;
  name: string;
  assetType: AssetType;
  categoryLabel: string;
  currentValue: number;
  currentPercent: number;
  targetPercent: number;
  targetValue: number;
  driftPercent: number; // currentPercent - targetPercent
  deltaValue: number; // targetValue - currentValue (>0: buy needed, <0: sell needed)
  status: 'overweight' | 'underweight' | 'balanced';
  color: string;
  bgColor: string;
  borderColor: string;
  recommendedInstruments: { symbol: string; name: string }[];
}

export const RebalanceSuggestionTool: React.FC<RebalanceSuggestionToolProps> = ({
  portfolio,
  financialProfile,
  stocks = {},
  mutualFunds = {},
  onOpenAddTx,
  onRefresh,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile>(
    financialProfile?.riskTolerance || 'moderat'
  );
  const [rebalanceMode, setRebalanceMode] = useState<'cashflow' | 'full'>('cashflow');
  const [customMonthlyInflow, setCustomMonthlyInflow] = useState<number>(
    financialProfile?.monthlyInvestCapacity || 1500000
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(2.5); // 2.5% tolerance band

  const totalValue = portfolio?.totalMarketValue || 0;
  const targetConfig = TARGET_ALLOCATION_MODELS[selectedProfile];

  // Asset class breakdown
  const assetClasses: AssetClassAnalysis[] = useMemo(() => {
    const sahamVal = portfolio.assetAllocation.saham || 0;
    const puVal = portfolio.assetAllocation.reksadana_pasar_uang || 0;
    const ptVal = portfolio.assetAllocation.reksadana_pendapatan_tetap || 0;
    const ekuitasVal =
      (portfolio.assetAllocation.reksadana_saham || 0) +
      (portfolio.assetAllocation.reksadana_campuran || 0);

    const calcClass = (
      id: string,
      name: string,
      assetType: AssetType,
      categoryLabel: string,
      currentVal: number,
      targetPct: number,
      color: string,
      bgColor: string,
      borderColor: string,
      recommended: { symbol: string; name: string }[]
    ): AssetClassAnalysis => {
      const currentPct = totalValue > 0 ? (currentVal / totalValue) * 100 : 0;
      const targetVal = totalValue * (targetPct / 100);
      const driftPct = currentPct - targetPct;
      const deltaVal = targetVal - currentVal;

      let status: 'overweight' | 'underweight' | 'balanced' = 'balanced';
      if (driftPct > toleranceThreshold) {
        status = 'overweight';
      } else if (driftPct < -toleranceThreshold) {
        status = 'underweight';
      }

      return {
        id,
        name,
        assetType,
        categoryLabel,
        currentValue: currentVal,
        currentPercent: currentPct,
        targetPercent: targetPct,
        targetValue: targetVal,
        driftPercent: driftPct,
        deltaValue: deltaVal,
        status,
        color,
        bgColor,
        borderColor,
        recommendedInstruments: recommended,
      };
    };

    return [
      calcClass(
        'saham',
        'Saham BEI Langsung',
        'saham',
        'Ekuitas Individu',
        sahamVal,
        targetConfig.targets.saham,
        '#0284c7', // sky-600
        'bg-sky-50 text-sky-700',
        'border-sky-200',
        [
          { symbol: 'BBCA', name: 'Bank Central Asia Tbk' },
          { symbol: 'BBRI', name: 'Bank Rakyat Indonesia Tbk' },
          { symbol: 'TLKM', name: 'Telkom Indonesia Tbk' },
        ]
      ),
      calcClass(
        'reksadana_pasar_uang',
        'Reksa Dana Pasar Uang',
        'reksadana',
        'Likuiditas & Kas Rendah Risiko',
        puVal,
        targetConfig.targets.reksadana_pasar_uang,
        '#10b981', // emerald-600
        'bg-emerald-50 text-emerald-700',
        'border-emerald-200',
        [
          { symbol: 'sucor-money-market', name: 'Sucorinvest Money Market Fund' },
          { symbol: 'batavia-kas-maxima', name: 'Batavia Dana Kas Maxima' },
        ]
      ),
      calcClass(
        'reksadana_pendapatan_tetap',
        'Reksa Dana Pendapatan Tetap',
        'reksadana',
        'Obligasi & Surat Berharga Negara',
        ptVal,
        targetConfig.targets.reksadana_pendapatan_tetap,
        '#8b5cf6', // violet-600
        'bg-violet-50 text-violet-700',
        'border-violet-200',
        [
          { symbol: 'danamas-stabil', name: 'Danamas Stabil' },
          { symbol: 'manulife-obligasi-unggulan', name: 'Manulife Obligasi Unggulan Kelas A' },
        ]
      ),
      calcClass(
        'reksadana_ekuitas',
        'Reksa Dana Saham & Campuran',
        'reksadana',
        'Ekuitas Terdiversifikasi',
        ekuitasVal,
        targetConfig.targets.reksadana_ekuitas,
        '#f59e0b', // amber-600
        'bg-amber-50 text-amber-700',
        'border-amber-200',
        [
          { symbol: 'sucorinvest-equity-fund', name: 'Sucorinvest Equity Fund' },
          { symbol: 'panin-dana-maksima', name: 'Panin Dana Maksima' },
        ]
      ),
    ];
  }, [portfolio, targetConfig, totalValue, toleranceThreshold]);

  // Overall Portfolio Drift Metric (Absolute Mean Deviation)
  const totalAbsoluteDrift = useMemo(() => {
    return assetClasses.reduce((acc, curr) => acc + Math.abs(curr.driftPercent), 0) / 2;
  }, [assetClasses]);

  const alignmentScore = Math.max(0, Math.round(100 - totalAbsoluteDrift * 2.5));

  // Cashflow Rebalancing Allocation Calculation (New Capital Injection)
  const cashflowAllocation = useMemo(() => {
    const underweightClasses = assetClasses.filter((c) => c.status === 'underweight');
    const totalDeficit = underweightClasses.reduce((acc, c) => acc + Math.max(0, c.deltaValue), 0);

    if (totalDeficit <= 0 || underweightClasses.length === 0) {
      // If already balanced, allocate according to original target percentages
      return assetClasses.map((c) => ({
        ...c,
        allocatedInflow: customMonthlyInflow * (c.targetPercent / 100),
      }));
    }

    return assetClasses.map((c) => {
      let allocated = 0;
      if (c.status === 'underweight') {
        const shareOfDeficit = c.deltaValue / totalDeficit;
        allocated = customMonthlyInflow * shareOfDeficit;
      }
      return {
        ...c,
        allocatedInflow: allocated,
      };
    });
  }, [assetClasses, customMonthlyInflow]);

  // Full Rebalancing Execution Summary (Sell overweight, Buy underweight)
  const fullRebalanceActions = useMemo(() => {
    const toSell = assetClasses
      .filter((c) => c.status === 'overweight')
      .map((c) => ({
        ...c,
        amountToSell: Math.abs(c.deltaValue),
      }));

    const toBuy = assetClasses
      .filter((c) => c.status === 'underweight')
      .map((c) => ({
        ...c,
        amountToBuy: c.deltaValue,
      }));

    // Estimated sell fees on BEI: 0.1% PPh Final + 0.15% Broker Fee = 0.25%
    const totalSellAmount = toSell.reduce((acc, c) => acc + c.amountToSell, 0);
    const estimatedSellTaxAndFee = totalSellAmount * 0.0025;

    return {
      toSell,
      toBuy,
      totalSellAmount,
      estimatedSellTaxAndFee,
    };
  }, [assetClasses]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Alat Rekomendasi Rebalancing Portofolio
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OJK & CFP
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Menyelaraskan proporsi aset nyata Anda dengan toleransi risiko finansial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showExplanation ? 'Tutup Panduan' : 'Apa itu Rebalancing?'}</span>
            </button>
          </div>
        </div>

        {/* Educational Accordion */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-200 space-y-2 overflow-hidden"
            >
              <p>
                <strong>Rebalancing Portofolio</strong> adalah proses menata ulang porsi aset
                investasi kembali ke alokasi target awal. Seiring waktu, pergerakan harga saham yang
                naik pesat atau anjlok dapat membuat portofolio menjadi terlalu berisiko (jika porsi
                saham membengkak) atau terlalu lambat berkembang (jika porsi pasar uang mendominasi).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <div>
                  <span className="font-semibold text-emerald-400 block mb-0.5">
                    💡 Cara 1: Cash Flow Rebalancing (Disarankan)
                  </span>
                  Mengalirkan modal nabung bulanan baru hanya ke aset yang masih kurang (underweight)
                  tanpa menjual aset yang ada, sehingga 100% bebas pajak penjualan 0.1% dan fee
                  broker.
                </div>
                <div>
                  <span className="font-semibold text-amber-400 block mb-0.5">
                    ⚖️ Cara 2: Full Rebalancing (Beli & Jual)
                  </span>
                  Menjual sebagian aset berlebih (overweight) untuk membeli aset yang kurang
                  (underweight). Cocok jika deviasi sudah sangat ekstrem (&gt;10-15%).
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Selector & Alignment Health Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Profil Risiko Dasar (Berdasarkan Profil Finansial):
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['konservatif', 'moderat', 'agresif'] as RiskProfile[]).map((prof) => {
                const isSelected = selectedProfile === prof;
                const isUserDefault = financialProfile?.riskTolerance === prof;
                return (
                  <button
                    key={prof}
                    onClick={() => setSelectedProfile(prof)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs font-semibold ring-2 ring-slate-900/10'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="capitalize">{prof}</span>
                    {isUserDefault && (
                      <span
                        className={`text-[9px] px-1 rounded uppercase tracking-wider font-bold ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Aktif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Score Pill */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3 shadow-xs">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                alignmentScore >= 85
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : alignmentScore >= 70
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {alignmentScore}
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">
                Skor Keselarasan Portofolio
              </div>
              <div className="text-xs font-bold text-slate-800">
                {alignmentScore >= 85
                  ? 'Sangat Seimbang & Selaras'
                  : alignmentScore >= 70
                  ? 'Penyimpangan Moderat (Perlu Pantauan)'
                  : 'Deviasi Signifikan (Perlu Tindakan)'}
              </div>
              <div className="text-[10px] text-slate-400">
                Deviasi rata-rata: {totalAbsoluteDrift.toFixed(1)}% (Batas wajar: ±
                {toleranceThreshold}%)
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-white p-3 rounded-md border border-slate-200/90 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">{targetConfig.name}</span>: Target return
            historis ~{targetConfig.expectedReturn} dengan profil risiko {targetConfig.volatility}.{' '}
            {targetConfig.description}
          </div>
        </div>
      </div>

      {/* Comparison Grid: Real vs Target */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Perbandingan Alokasi Saat Ini vs Target Model
          </h4>
          <span className="text-xs text-slate-500">
            Total Portofolio: <strong className="text-slate-900">{formatRupiah(totalValue)}</strong>
          </span>
        </div>

        {totalValue === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            Portofolio belum memiliki aset atau nilai pasar masih Rp 0. Silakan catat transaksi
            pertama Anda atau gunakan tombol &ldquo;Muat Data Demo&rdquo; di atas untuk melihat
            simulasi rebalancing.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assetClasses.map((item) => {
              const isOver = item.status === 'overweight';
              const isUnder = item.status === 'underweight';
              const isBalanced = item.status === 'balanced';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isOver
                      ? 'border-amber-300 bg-amber-50/30'
                      : isUnder
                      ? 'border-sky-300 bg-sky-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: item.color }}
                        />
                        <h5 className="font-bold text-sm text-slate-900">{item.name}</h5>
                      </div>
                      <span className="text-[11px] text-slate-500">{item.categoryLabel}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isOver
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : isUnder
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isOver ? 'Overweight (Berlebih)' : isUnder ? 'Underweight (Kurang)' : 'Ideal'}
                    </span>
                  </div>

                  {/* Dual Bar Progress */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Aktual: <strong>{formatPercent(item.currentPercent)}</strong> (
                        {formatRupiah(item.currentValue)})
                      </span>
                      <span className="text-slate-500">
                        Target: <strong>{item.targetPercent}%</strong> (
                        {formatRupiah(item.targetValue)})
                      </span>
                    </div>

                    <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      {/* Current actual bar */}
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, item.currentPercent)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                      {/* Target marker line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                        style={{ left: `${Math.min(100, item.targetPercent)}%` }}
                        title={`Target: ${item.targetPercent}%`}
                      />
                    </div>
                  </div>

                  {/* Delta Insight */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">
                      Deviasi:
                      <strong
                        className={`ml-1 ${
                          item.driftPercent > 0
                            ? 'text-amber-700'
                            : item.driftPercent < 0
                            ? 'text-sky-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.driftPercent > 0 ? '+' : ''}
                        {formatPercent(item.driftPercent)}
                      </strong>
                    </span>

                    <span className="text-right">
                      {isOver && (
                        <span className="text-amber-800 font-medium">
                          Kelebihan {formatRupiah(Math.abs(item.deltaValue))}
                        </span>
                      )}
                      {isUnder && (
                        <span className="text-sky-800 font-semibold">
                          Kekurangan {formatRupiah(item.deltaValue)}
                        </span>
                      )}
                      {isBalanced && (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sesuai Toleransi
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Quick Action Button for Underweight */}
                  {isUnder && onOpenAddTx && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 truncate">
                        Saran instrumen: {item.recommendedInstruments[0]?.symbol}
                      </span>
                      <button
                        onClick={() =>
                          onOpenAddTx(
                            item.recommendedInstruments[0]?.symbol,
                            item.assetType
                          )
                        }
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Catat Beli</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Plan Tabs: Mode A (Cash Flow) vs Mode B (Full Sell/Buy) */}
      <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Rekomendasi Rencana Aksi Eksekusi
            </h4>
            <p className="text-xs text-slate-500">
              Pilih metode rebalancing yang paling sesuai dengan ketersediaan dana dan strategi Anda.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg">
            <button
              onClick={() => setRebalanceMode('cashflow')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                rebalanceMode === 'cashflow'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arus Kas Baru (Tanpa Jual)</span>
            </button>
            <button
              onClick={() => setRebalanceMode('full')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                rebalanceMode === 'full'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-violet-600" />
              <span>Rebalancing Penuh (Beli & Jual)</span>
            </button>
          </div>
        </div>

        {/* Mode 1: Cash Flow Rebalancing (Preferred / Recommended) */}
        {rebalanceMode === 'cashflow' && (
          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Strategi Cerdas: Inflow Nabung Bulanan (Zero Selling Tax)
                </span>
              </div>

              {/* Monthly Inflow Input */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Simulasi Modal Baru:</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="100000"
                    step="500000"
                    value={customMonthlyInflow}
                    onChange={(e) => setCustomMonthlyInflow(Math.max(0, Number(e.target.value)))}
                    className="w-36 pl-8 pr-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Dengan mengalirkan modal baru sebesar{' '}
              <strong className="text-slate-900">{formatRupiah(customMonthlyInflow)}</strong> ini,
              arahkan dana ke pos aset berikut untuk menutup defisit alokasi secara bertahap tanpa
              perlu menjual aset lain:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cashflowAllocation.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border flex flex-col justify-between ${
                    item.allocatedInflow > 0
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {item.allocatedInflow > 0
                          ? `${formatPercent(
                              (item.allocatedInflow / customMonthlyInflow) * 100
                            )}`
                          : '0%'}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-emerald-800">
                      {formatRupiah(item.allocatedInflow)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {item.allocatedInflow > 0
                        ? `Alokasikan ke ${item.recommendedInstruments[0]?.symbol || item.name}`
                        : 'Sudah cukup / tidak perlu top up'}
                    </div>
                  </div>

                  {item.allocatedInflow > 0 && onOpenAddTx && (
                    <button
                      onClick={() =>
                        onOpenAddTx(
                          item.recommendedInstruments[0]?.symbol,
                          item.assetType
                        )
                      }
                      className="mt-3 w-full py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Catat Beli {item.recommendedInstruments[0]?.symbol}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode 2: Full Sell & Buy Rebalancing */}
        {rebalanceMode === 'full' && (
          <div className="bg-white p-4 rounded-xl border border-violet-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-950 uppercase tracking-wide">
                Rencana Eksekusi Jual & Beli Instan
              </span>
              <span className="text-xs text-slate-500">
                Estimasi PPh & Fee Jual: ~
                <strong className="text-rose-600">
                  {formatRupiah(fullRebalanceActions.estimatedSellTaxAndFee)}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* To Sell */}
              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>Langkah 1: Jual Aset Berlebih (Overweight)</span>
                </div>
                {fullRebalanceActions.toSell.length > 0 ? (
                  <div className="space-y-2">
                    {fullRebalanceActions.toSell.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white rounded border border-rose-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[11px] text-slate-500">
                            Porsi saat ini: {formatPercent(item.currentPercent)} (Target:{' '}
                            {item.targetPercent}%)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-700 block">
                            Jual {formatRupiah(item.amountToSell)}
                          </span>
                          <span className="text-[10px] text-slate-400">Pangkas kelebihan</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-2 bg-white rounded">
                    Tidak ada aset yang melebihi batas toleransi atas (overweight).
                  </div>
                )}
              </div>

              {/* To Buy */}
              <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Langkah 2: Beli Aset Kurang (Underweight)</span>
                </div>
                {fullRebalanceActions.toBuy.length > 0 ? (
                  <div className="space-y-2">
                    {fullRebalanceActions.toBuy.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white rounded border border-emerald-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[11px] text-slate-500">
                            Porsi saat ini: {formatPercent(item.currentPercent)} (Target:{' '}
                            {item.targetPercent}%)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700 block">
                            Beli {formatRupiah(item.amountToBuy)}
                          </span>
                          {onOpenAddTx && (
                            <button
                              onClick={() =>
                                onOpenAddTx(
                                  item.recommendedInstruments[0]?.symbol,
                                  item.assetType
                                )
                              }
                              className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                            >
                              + Catat Transaksi
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-2 bg-white rounded">
                    Tidak ada aset yang berada di bawah target toleransi (underweight).
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
