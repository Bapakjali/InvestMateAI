/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Info,
  Flame,
  Landmark,
  ShieldAlert,
  BarChart3,
  Layers,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StockQuote } from '../types';
import { formatRupiah, formatPercent } from '../utils/financialCalculations';
import { IDX_SECTORS, BANKING_VS_ENERGY_COMPARISON, IdxSectorInfo } from '../data/sectorData';

interface SectorPerformanceAnalysisProps {
  stocks: StockQuote[];
  onOpenAssetDetail?: (symbol: string, type: 'saham' | 'reksadana') => void;
  onAskAiWithContext?: (prompt: string) => void;
  onOpenAlerts?: (symbol?: string) => void;
}

export const SectorPerformanceAnalysis: React.FC<SectorPerformanceAnalysisProps> = ({
  stocks,
  onOpenAssetDetail,
  onAskAiWithContext,
  onOpenAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<'compare' | 'all' | 'stocks'>('compare');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('Financials');

  // Compute live sector statistics from available stocks
  const sectorLiveStats = useMemo(() => {
    const stats: Record<
      string,
      {
        totalMarketCap: number;
        avgDailyChange: number;
        avgPer: number;
        avgDividendYield: number;
        stockCount: number;
        topGainer: StockQuote | null;
        topLoser: StockQuote | null;
        stocks: StockQuote[];
      }
    > = {};

    Object.keys(IDX_SECTORS).forEach((sectorKey) => {
      const sectorStocks = stocks.filter((s) => s.sector === sectorKey);
      if (sectorStocks.length === 0) {
        stats[sectorKey] = {
          totalMarketCap: 0,
          avgDailyChange: 0,
          avgPer: 0,
          avgDividendYield: 0,
          stockCount: 0,
          topGainer: null,
          topLoser: null,
          stocks: [],
        };
        return;
      }

      const totalCap = sectorStocks.reduce((acc, s) => acc + (s.marketCap || 0), 0);
      const avgChange = sectorStocks.reduce((acc, s) => acc + s.changePercent, 0) / sectorStocks.length;
      const validPer = sectorStocks.filter((s) => s.per > 0);
      const avgPer = validPer.length > 0 ? validPer.reduce((acc, s) => acc + s.per, 0) / validPer.length : 0;
      const avgDiv = sectorStocks.reduce((acc, s) => acc + (s.dividendYield || 0), 0) / sectorStocks.length;

      const sortedByChange = [...sectorStocks].sort((a, b) => b.changePercent - a.changePercent);

      stats[sectorKey] = {
        totalMarketCap: totalCap,
        avgDailyChange: avgChange,
        avgPer: avgPer,
        avgDividendYield: avgDiv,
        stockCount: sectorStocks.length,
        topGainer: sortedByChange[0] || null,
        topLoser: sortedByChange[sortedByChange.length - 1] || null,
        stocks: sortedByChange,
      };
    });

    return stats;
  }, [stocks]);

  const bankingStats = sectorLiveStats['Financials'];
  const energyStats = sectorLiveStats['Energy'];

  const bankingSector = IDX_SECTORS['Financials'];
  const energySector = IDX_SECTORS['Energy'];

  const handleAskAiSectorComparison = () => {
    if (!onAskAiWithContext) return;
    const prompt = `Sebagai investor pemula di Bursa Efek Indonesia, bagaimana perbandingan komprehensif antara Sektor Perbankan (seperti BBCA, BBRI, BMRI, BBNI) vs Sektor Energi (seperti ADRO, PTBA, PGAS, MEDC)? Kapan waktu terbaik mengakumulasi masing-masing sektor dan bagaimana membagi alokasi portofolio secara rasional?`;
    onAskAiWithContext(prompt);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight">Analisis Sektor Saham BEI</h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                IDX Real-Time
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Rotasi pasar, komparasi Perbankan vs Energi, dan valuasi sektoral
            </p>
          </div>
        </div>

        {/* AI Quick Query Button */}
        {onAskAiWithContext && (
          <button
            onClick={handleAskAiSectorComparison}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Tanya AI Sektor</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-3 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'compare'
              ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          <span>Perbankan vs Energi</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Semua Sektor BEI</span>
        </button>

        <button
          onClick={() => setActiveTab('stocks')}
          className={`px-3 py-2 border-b-2 rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stocks'
              ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
          <span>Saham Penggerak</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 space-y-5">
        {/* TAB 1: HEAD-TO-HEAD COMPARISON (PERBANKAN VS ENERGI) */}
        {activeTab === 'compare' && (
          <div className="space-y-5">
            {/* Quick Summary Cards (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Sektor Perbankan */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Sektor Perbankan</h4>
                      <span className="text-[10px] text-slate-500">IDXFINANCE · Defensif Tumbuh</span>
                    </div>
                  </div>
                  <div
                    className={`text-right text-xs font-extrabold flex items-center gap-0.5 ${
                      bankingStats.avgDailyChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {bankingStats.avgDailyChange >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{formatPercent(bankingStats.avgDailyChange)} hari ini</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Rata-Rata PER</span>
                    <span className="text-xs font-bold text-slate-800">{bankingStats.avgPer.toFixed(1)}x</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Div. Yield</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {bankingStats.avgDividendYield.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">YTD Return</span>
                    <span className="text-xs font-bold text-emerald-700">+{bankingSector.ytdReturnApprox}%</span>
                  </div>
                </div>

                {/* Key Emittens */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wide">
                    Emiten Penopang Utama (The Big 4)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bankingStats.stocks.map((s) => (
                      <button
                        key={s.symbol}
                        onClick={() => onOpenAssetDetail?.(s.symbol, 'saham')}
                        className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                        title={`${s.name} - ${formatRupiah(s.price)} (${formatPercent(s.changePercent)})`}
                      >
                        <span>{s.symbol}</span>
                        <span
                          className={`text-[10px] ${
                            s.changePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatPercent(s.changePercent)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Sektor Energi */}
              <div className="bg-amber-50/40 rounded-xl p-4 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Sektor Energi & Batubara</h4>
                      <span className="text-[10px] text-slate-500">IDXENERGY · Siklikal Komoditas</span>
                    </div>
                  </div>
                  <div
                    className={`text-right text-xs font-extrabold flex items-center gap-0.5 ${
                      energyStats.avgDailyChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {energyStats.avgDailyChange >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>{formatPercent(energyStats.avgDailyChange)} hari ini</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-amber-200/60">
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-400 block">Rata-Rata PER</span>
                    <span className="text-xs font-bold text-slate-800">{energyStats.avgPer.toFixed(1)}x</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-400 block">Div. Yield</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {energyStats.avgDividendYield.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-400 block">YTD Return</span>
                    <span className="text-xs font-bold text-emerald-700">+{energySector.ytdReturnApprox}%</span>
                  </div>
                </div>

                {/* Key Emittens */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wide">
                    Emiten Penopang Utama (Batubara & Migas)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {energyStats.stocks.map((s) => (
                      <button
                        key={s.symbol}
                        onClick={() => onOpenAssetDetail?.(s.symbol, 'saham')}
                        className="px-2 py-1 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                        title={`${s.name} - ${formatRupiah(s.price)} (${formatPercent(s.changePercent)})`}
                      >
                        <span>{s.symbol}</span>
                        <span
                          className={`text-[10px] ${
                            s.changePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {formatPercent(s.changePercent)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* In-Depth Comparison Matrix Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Matriks Perbandingan Strategis: Perbankan vs Energi
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  Panduan Investor Pemula BEI
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {BANKING_VS_ENERGY_COMPARISON.map((row, idx) => (
                  <div
                    key={row.metric}
                    className={`p-3.5 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    {/* Metric Name */}
                    <div className="md:col-span-3">
                      <span className="font-bold text-slate-900 block">{row.metric}</span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {row.verdict}
                      </span>
                    </div>

                    {/* Banking Column */}
                    <div className="md:col-span-4 bg-blue-50/30 p-2 rounded-lg border border-blue-100/50">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900">
                        <Landmark className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Perbankan: {row.bankingValue}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {row.bankingNote}
                      </p>
                    </div>

                    {/* Energy Column */}
                    <div className="md:col-span-5 bg-amber-50/30 p-2 rounded-lg border border-amber-100/50">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
                        <Flame className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Energi: {row.energyValue}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {row.energyNote}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rational Advice for Beginners */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Rekomendasi Portofolio Berimbang InvestMate AI</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Investor pemula disarankan <strong>tidak mempertentangkan atau memilih salah satu saja</strong>, melainkan mengombinasikan keduanya dengan pendekatan <em>Core-Satellite</em>:
              </p>
              <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                <li>
                  <strong>Perbankan sebagai Core (35-50%):</strong> Karena labanya tahan banting, konsisten mencetak rekor laba bersih tiap tahun, dan sangat likuid.
                </li>
                <li>
                  <strong>Energi sebagai Satellite (10-20%):</strong> Sebagai pemantik dividen tunai tinggi saat siklus harga batubara/minyak melonjak, namun batasi porsinya agar tidak tertekan saat siklus komoditas menurun.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: SEMUA SEKTOR BEI (OVERVIEW ALL SECTORS) */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(IDX_SECTORS).map(([secKey, secInfo]) => {
                const stat = sectorLiveStats[secKey];
                const isSelected = selectedSectorId === secKey;
                const isGain = (stat?.avgDailyChange || 0) >= 0;

                return (
                  <div
                    key={secKey}
                    onClick={() => setSelectedSectorId(secKey)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/40 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900">{secInfo.shortName}</span>
                          <span className="text-[10px] text-slate-400">· {secInfo.idxCode}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{secInfo.characteristic}</span>
                      </div>
                      <div
                        className={`text-xs font-bold flex items-center gap-0.5 ${
                          isGain ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isGain ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{formatPercent(stat?.avgDailyChange || 0)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Avg PER</span>
                        <span className="font-bold text-slate-800">{stat?.avgPer ? `${stat.avgPer.toFixed(1)}x` : '-'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Avg Div Yield</span>
                        <span className="font-bold text-emerald-700">{stat?.avgDividendYield ? `${stat.avgDividendYield.toFixed(1)}%` : '-'}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {secInfo.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{stat?.stockCount || 0} emiten terpantau</span>
                      <span className="font-bold text-emerald-700">YTD ~+{secInfo.ytdReturnApprox}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Sector Details Box */}
            {selectedSectorId && IDX_SECTORS[selectedSectorId] && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Detail Sektor: {IDX_SECTORS[selectedSectorId].name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                      {IDX_SECTORS[selectedSectorId].characteristic}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Acuan: {IDX_SECTORS[selectedSectorId].benchmarkSymbol}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-800 block">Pendorong Kinerja (Katalis):</span>
                    <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                      {IDX_SECTORS[selectedSectorId].keyDrivers.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-800 block">Risiko Utama Sektor:</span>
                    <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                      {IDX_SECTORS[selectedSectorId].keyRisks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAHAM PENGGERAK SEKTOR (INDIVIDUAL STOCKS TABLE) */}
        {activeTab === 'stocks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Menampilkan emiten BEI yang dikelompokkan berdasarkan sektor</span>
              <span className="font-semibold text-slate-700">{stocks.length} Saham Terdata</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {stocks.map((stock) => {
                const isUp = stock.changePercent >= 0;
                return (
                  <div
                    key={stock.symbol}
                    className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{stock.symbol}</span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {stock.sector}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          · {stock.subSector}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-md mt-0.5">
                        {stock.name}
                      </div>
                    </div>

                    {/* Stock Price & Multiples */}
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-slate-900">{formatRupiah(stock.price)}</div>
                      <div className={`text-xs font-semibold ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatPercent(stock.changePercent)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        PER {stock.per.toFixed(1)}x · Div {stock.dividendYield}%
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onOpenAlerts && (
                        <button
                          onClick={() => onOpenAlerts(stock.symbol)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                          title={`Pasang Target Alert untuk ${stock.symbol}`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onOpenAssetDetail?.(stock.symbol, 'saham')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Analisis</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
