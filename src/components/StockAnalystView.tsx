/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  Sparkles,
  BookmarkPlus,
  BookmarkCheck,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Bell,
} from 'lucide-react';
import { StockQuote, UserFinancialProfile } from '../types';
import { formatRupiah, formatPercent, formatDateIndo, formatNumber } from '../utils/financialCalculations';
import { PullToRefresh } from './PullToRefresh';
import { motion } from 'framer-motion';

interface StockAnalystViewProps {
  stocks: StockQuote[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  financialProfile: UserFinancialProfile | null;
  onOpenAddTxForAsset: (symbol: string, type: 'saham') => void;
  onToggleWatchlist: (symbol: string, assetName: string, type: 'saham') => void;
  isWatchlisted: boolean;
  onAskAiAboutStock: (stock: StockQuote) => void;
  onRefresh?: () => Promise<void> | void;
  onOpenAlertModal?: (symbol: string) => void;
}

export const StockAnalystView: React.FC<StockAnalystViewProps> = ({
  stocks,
  selectedSymbol,
  onSelectSymbol,
  financialProfile,
  onOpenAddTxForAsset,
  onToggleWatchlist,
  isWatchlisted,
  onAskAiAboutStock,
  onRefresh,
  onOpenAlertModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'ringkasan' | 'fundamental' | 'teknikal' | 'berita'>('ringkasan');

  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const isUp = currentStock ? currentStock.change >= 0 : true;

  // Determine educational evaluation status based on user profile and fundamental data
  let statusBadge: {
    label: string;
    style: string;
    description: string;
  } = {
    label: 'Menarik untuk dipelajari',
    style: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    description: 'Fundamental solid dengan profitabilitas stabil, cocok dikaji lebih dalam.',
  };

  if (currentStock) {
    if (currentStock.per > 25 || currentStock.pbv > 4.5) {
      statusBadge = {
        label: 'Perlu analisis lebih lanjut',
        style: 'text-amber-800 bg-amber-50 border-amber-200',
        description: 'Valuasi relatif tinggi di atas rata-rata sektor; perhatikan ruang pertumbuhan masa depan.',
      };
    }
    if (financialProfile?.riskTolerance === 'konservatif' && currentStock.technical.rsi14 > 65) {
      statusBadge = {
        label: 'Risiko tinggi untuk profil Anda',
        style: 'text-rose-800 bg-rose-50 border-rose-200',
        description: 'Indikator teknikal mengindikasikan jenuh beli (overbought) bagi investor konservatif.',
      };
    }
  }

  // Simple clean SVG line chart for price history
  const priceHistory = currentStock?.technical?.priceHistory || [];
  const minPrice = priceHistory.length ? Math.min(...priceHistory.map((p) => p.close)) : 0;
  const maxPrice = priceHistory.length ? Math.max(...priceHistory.map((p) => p.close)) : 100;
  const priceRange = maxPrice - minPrice || 1;

  return (
    <PullToRefresh onRefresh={onRefresh || (() => {})}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {/* Search and Stock Selector Bar */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode saham BEI (e.g. BBCA, BBRI, TLKM, ASII)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        {/* Quick stock symbols chip row */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          {filteredStocks.slice(0, 7).map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => onSelectSymbol(stock.symbol)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedSymbol === stock.symbol
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {stock.symbol}
            </button>
          ))}
        </div>
      </div>

      {currentStock ? (
        <div className="space-y-6">
          {/* Stock Header Card */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{currentStock.symbol}</h2>
                  <span className="text-xs text-slate-500 font-medium">{currentStock.name}</span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    BEI: {currentStock.sector}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span>Sumber: {currentStock.dataSource}</span>
                  <span aria-hidden="true">·</span>
                  <span>Periode Data: {currentStock.financialReportPeriod}</span>
                  <span aria-hidden="true">·</span>
                  <span>Diperbarui: {formatDateIndo(currentStock.dataTimestamp, true)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleWatchlist(currentStock.symbol, currentStock.name, 'saham')}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border transition-colors cursor-pointer ${
                    isWatchlisted
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isWatchlisted ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      <span>Dipantau</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 text-slate-400" />
                      <span>Pantau</span>
                    </>
                  )}
                </button>

                {onOpenAlertModal && (
                  <button
                    onClick={() => onOpenAlertModal(currentStock.symbol)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    title={`Pasang Target Alert untuk ${currentStock.symbol}`}
                  >
                    <Bell className="w-4 h-4 text-emerald-700" />
                    <span>Target Alert</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenAddTxForAsset(currentStock.symbol, 'saham')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Catat Kepemilikan</span>
                </button>

                <button
                  onClick={() => onAskAiAboutStock(currentStock)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Tanya AI Saham Ini</span>
                </button>
              </div>
            </div>

            {/* Price & Primary Status Banner */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatRupiah(currentStock.price)}
                </span>
                <span className="text-xs text-slate-500">/ lembar</span>
                <div
                  className={`flex items-center gap-1 text-sm font-bold ${
                    isUp ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{formatRupiah(currentStock.change)} ({formatPercent(currentStock.changePercent)})</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`p-2.5 rounded-md border text-xs ${statusBadge.style} max-w-md`}>
                <div className="font-bold tracking-wide uppercase text-[11px] mb-0.5">
                  Status Analisis: {statusBadge.label}
                </div>
                <div className="text-[11px]">{statusBadge.description}</div>
              </div>
            </div>

            {/* Notice Rule Disclosure */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Status analisis ini bukan instruksi beli atau jual. Transaksi saham di BEI dilakukan per lot (1 lot = 100 lembar) secara manual melalui aplikasi sekuritas pilihan Anda (seperti Stockbit).
              </span>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveSubTab('ringkasan')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                activeSubTab === 'ringkasan'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Ringkasan Analisis AI
            </button>
            <button
              onClick={() => setActiveSubTab('fundamental')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                activeSubTab === 'fundamental'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Data Fundamental & Rasio
            </button>
            <button
              onClick={() => setActiveSubTab('teknikal')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                activeSubTab === 'teknikal'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Grafik & Indikator Teknikal
            </button>
            <button
              onClick={() => setActiveSubTab('berita')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                activeSubTab === 'berita'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Keterbukaan Informasi BEI
            </button>
          </div>

          {/* SubTab Content */}
          {activeSubTab === 'ringkasan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profil & Faktor Positif/Negatif */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Profil Bisnis Perusahaan</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{currentStock.businessSummary}</p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Faktor Positif (Kekuatan)</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {currentStock.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Faktor Risiko & Pelemahan</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {currentStock.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skenario Edukatif */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Skenario Analisis AI untuk Pemula</h3>
                <p className="text-xs text-slate-500">
                  Simulasi skenario berdasarkan tren bisnis historis, bukan jaminan target harga masa depan.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50/60 rounded border border-emerald-100">
                    <div className="font-bold text-emerald-900 mb-1">Skenario Optimistis</div>
                    <p className="text-emerald-800">
                      Ekspansi kredit dan efisiensi digital berlanjut, pertumbuhan laba double-digit, valuasi bertahan di atas rata-rata historis.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="font-bold text-slate-800 mb-1">Skenario Moderat (Paling Mungkin)</div>
                    <p className="text-slate-600">
                      Pertumbuhan sejalan dengan PDB nasional (5%), dividend yield stabil, apresiasi harga bertahap mengikuti kenaikan laba operasional.
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50/60 rounded border border-rose-100">
                    <div className="font-bold text-rose-900 mb-1">Skenario Pesimistis</div>
                    <p className="text-rose-800">
                      Suku bunga tinggi memicu pemburukan rasio kredit macet, kompresi margin bunga bersih (NIM), atau rotasi modal keluar dari pasar negara berkembang.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Kondisi Pembatal Tesis: </span>
                  Kenaikan drastis rasio NPL/kredit macet atau penurunan tajam pendapatan bunga/operasi selama dua kuartal berturut-turut.
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'fundamental' && (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rasio Keuangan & Fundamental</h3>
                  <p className="text-xs text-slate-500">
                    Berdasarkan laporan keuangan {currentStock.financialReportPeriod} (Audited)
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  Status Data: {currentStock.dataStatus}
                </span>
              </div>

              {/* Grid Rasio */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Price to Earnings (PER)</div>
                  <div className="text-base font-bold text-slate-900">{currentStock.per}x</div>
                  <div className="text-[11px] text-slate-400 mt-1">Valuasi laba tahunan</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Price to Book Value (PBV)</div>
                  <div className="text-base font-bold text-slate-900">{currentStock.pbv}x</div>
                  <div className="text-[11px] text-slate-400 mt-1">Harga vs nilai buku</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Return on Equity (ROE)</div>
                  <div className="text-base font-bold text-emerald-700">{currentStock.roe}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">Efisiensi cetak laba modal</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Debt to Equity (DER)</div>
                  <div className="text-base font-bold text-slate-900">{currentStock.der}x</div>
                  <div className="text-[11px] text-slate-400 mt-1">Tingkat utang terhadap modal</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Dividend Yield</div>
                  <div className="text-base font-bold text-emerald-700">{currentStock.dividendYield}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">Imbal hasil dividen tunai</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Laba Per Lembar (EPS)</div>
                  <div className="text-base font-bold text-slate-900">Rp {currentStock.eps}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Per lembar saham beredar</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Margin Laba Bersih</div>
                  <div className="text-base font-bold text-slate-900">{currentStock.netMargin}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">Net profit margin</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Pertumbuhan Pendapatan</div>
                  <div className="text-base font-bold text-emerald-700">+{currentStock.revenueGrowthYoY}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">Year on Year (YoY)</div>
                </div>
              </div>

              {/* Nilai Finansial Skala Besar */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Pendapatan (Revenue):</span>
                  <span className="font-bold text-slate-800 text-sm">{formatRupiah(currentStock.revenue)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Laba Bersih Konsolidasi:</span>
                  <span className="font-bold text-slate-800 text-sm">{formatRupiah(currentStock.netProfit)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Arus Kas Operasional:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatRupiah(currentStock.operatingCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'teknikal' && (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Grafik Harga Historis & Indikator Teknikal</h3>
                  <p className="text-xs text-slate-500">Harga penutupan harian 8 periode terakhir di BEI</p>
                </div>
                <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  Tren: {currentStock.technical.trend}
                </div>
              </div>

              {/* Interactive SVG Price Chart */}
              <div className="p-4 bg-slate-950 text-white rounded-lg">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span>Grafik Harga Penutupan ({currentStock.symbol})</span>
                  <span>Tertinggi: Rp {maxPrice.toLocaleString('id-ID')} | Terendah: Rp {minPrice.toLocaleString('id-ID')}</span>
                </div>

                <div className="h-44 w-full flex items-end relative pt-4 pb-2">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                    {/* Polyline chart */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      points={priceHistory
                        .map((p, idx) => {
                          const x = (idx / (priceHistory.length - 1)) * 100;
                          const y = 48 - ((p.close - minPrice) / priceRange) * 44;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                    {priceHistory.map((p, idx) => {
                      const x = (idx / (priceHistory.length - 1)) * 100;
                      const y = 48 - ((p.close - minPrice) / priceRange) * 44;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="2"
                          fill="#34d399"
                          stroke="#064e3b"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Dates row */}
                <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  {priceHistory.map((p, idx) => (
                    <span key={idx}>{p.date.slice(5)}</span>
                  ))}
                </div>
              </div>

              {/* Indikator Teknikal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">RSI (14 Hari)</div>
                  <div className="text-base font-bold text-slate-900">{currentStock.technical.rsi14}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {currentStock.technical.rsi14 > 70
                      ? 'Overbought (Jenuh Beli)'
                      : currentStock.technical.rsi14 < 30
                      ? 'Oversold (Jenuh Jual)'
                      : 'Zona Netral'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Moving Average 20</div>
                  <div className="text-base font-bold text-slate-900">
                    {formatRupiah(currentStock.technical.ma20)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Rata-rata 20 hari bursa</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Support Terdekat</div>
                  <div className="text-base font-bold text-emerald-700">
                    {formatRupiah(currentStock.technical.support)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Batas penahan penurunan</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-slate-500 mb-1">Resistance Terdekat</div>
                  <div className="text-base font-bold text-rose-700">
                    {formatRupiah(currentStock.technical.resistance)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Batas potensi tekanan jual</div>
                </div>
              </div>

              <div className="text-xs text-slate-500 p-3 bg-amber-50 rounded border border-amber-200">
                <span className="font-semibold text-amber-900">Peringatan: </span>
                Indikator teknikal (RSI, MA, MACD) merefleksikan pergerakan harga masa lampau dan bukan kepastian arah harga ke depan.
              </div>
            </div>
          )}

          {activeSubTab === 'berita' && (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Keterbukaan Informasi & Pengumuman BEI</h3>
                <p className="text-xs text-slate-500">
                  Dokumen dan rilis resmi keterbukaan informasi yang dilaporkan emiten kepada regulator.
                </p>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {currentStock.disclosures.map((d, idx) => (
                  <div key={idx} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">{d.title}</div>
                      <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                        <span>Sumber: {d.source}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDateIndo(d.date)}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded shrink-0">
                      Terverifikasi IDX
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
          Saham tidak ditemukan. Silakan gunakan kata kunci pencarian yang lain.
        </div>
      )}
      </motion.div>
    </PullToRefresh>
  );
};
