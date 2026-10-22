/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Search,
  Sparkles,
  PlusCircle,
  HelpCircle,
  Scale,
  ShieldAlert,
  Info,
  Calendar,
  ChevronRight,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { MutualFund, UserFinancialProfile, FundCategory } from '../types';
import { formatRupiah, formatPercent, formatDateIndo } from '../utils/financialCalculations';
import { PullToRefresh } from './PullToRefresh';
import { motion } from 'framer-motion';

interface MutualFundViewProps {
  funds: MutualFund[];
  financialProfile: UserFinancialProfile | null;
  onOpenAddTxForFund: (fundId: string) => void;
  onOpenCompare: (initialFundId?: string) => void;
  onAskAiAboutFund: (fund: MutualFund) => void;
  onRefresh?: () => Promise<void> | void;
  onOpenAlertModal?: (fundId: string) => void;
}

export const MutualFundView: React.FC<MutualFundViewProps> = ({
  funds,
  financialProfile,
  onOpenAddTxForFund,
  onOpenCompare,
  onAskAiAboutFund,
  onRefresh,
  onOpenAlertModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFundId, setSelectedFundId] = useState<string>(funds[0]?.id || '');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'pasar_uang', label: 'Pasar Uang (RDPU)' },
    { id: 'pendapatan_tetap', label: 'Pendapatan Tetap (RDPT)' },
    { id: 'campuran', label: 'Campuran (RDC)' },
    { id: 'saham', label: 'Saham (RDS)' },
  ];

  const filteredFunds = funds.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesQuery =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.fundManager.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const currentFund = funds.find((f) => f.id === selectedFundId) || filteredFunds[0] || funds[0];

  return (
    <PullToRefresh onRefresh={onRefresh || (() => {})}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {/* Top Banner and Comparison Callout */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Analisis Reksa Dana (Bibit Companion)</h2>
          <p className="text-xs text-slate-500">
            Analisis risiko, biaya (expense ratio), drawdown, dan historis return produk terdaftar OJK.
          </p>
        </div>
        <button
          onClick={() => onOpenCompare(currentFund?.id)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors cursor-pointer shadow-xs"
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Bandingkan Hingga 4 Produk</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari produk atau MI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Main Grid: Fund List (Left) & Fund Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Daftar Reksa Dana */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            Daftar Produk ({filteredFunds.length})
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredFunds.map((fund) => {
              const isSelected = fund.id === currentFund?.id;
              return (
                <div
                  key={fund.id}
                  onClick={() => setSelectedFundId(fund.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/60 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{fund.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{fund.fundManager}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      {fund.riskLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">NAB / Unit</span>
                      <span className="font-semibold text-slate-800">{formatRupiah(fund.navPerUnit)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Return 1 Tahun</span>
                      <span className="font-bold text-emerald-700">{formatPercent(fund.returns.y1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolom Detail Reksa Dana Terpilih (2 Kolom) */}
        {currentFund && (
          <div className="lg:col-span-2 space-y-6">
            {/* Header Detail */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {currentFund.categoryLabel}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Tingkat Risiko: {currentFund.riskLevel}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{currentFund.name}</h3>
                  <p className="text-xs text-slate-600">{currentFund.fundManager}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {onOpenAlertModal && (
                    <button
                      onClick={() => onOpenAlertModal(currentFund.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      title={`Pasang Target Alert untuk ${currentFund.name}`}
                    >
                      <Bell className="w-4 h-4 text-emerald-700" />
                      <span>Target Alert</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenAddTxForFund(currentFund.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md transition-colors cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Catat Beli</span>
                  </button>

                  <button
                    onClick={() => onAskAiAboutFund(currentFund)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Tanya AI Produk Ini</span>
                  </button>
                </div>
              </div>

              {/* NAB Stats */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide block">
                    Nilai Aktiva Bersih (NAB) per Unit
                  </span>
                  <div className="text-2xl font-bold text-slate-900">{formatRupiah(currentFund.navPerUnit)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Minimal Pembelian Awal: {formatRupiah(currentFund.minBuyAmount)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Dana Kelolaan (AUM)</span>
                  <div className="text-sm font-bold text-slate-800">{formatRupiah(currentFund.aum)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Biaya Pengelolaan (Expense Ratio): {currentFund.expenseRatio}% / tahun
                  </div>
                </div>
              </div>
            </div>

            {/* Historis Return & Drawdown Grid */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Kinerja Historis Return</h4>
                <span className="text-xs text-slate-400">Benchmark: {currentFund.benchmark}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-slate-500 mb-1">1 Bulan</div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatPercent(currentFund.returns.m1)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-slate-500 mb-1">6 Bulan</div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatPercent(currentFund.returns.m6)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-slate-500 mb-1">1 Tahun</div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatPercent(currentFund.returns.y1)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-slate-500 mb-1">3 Tahun</div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatPercent(currentFund.returns.y3)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                  <div className="text-slate-500 mb-1">Max Drawdown 1T</div>
                  <div className="text-sm font-bold text-rose-700">
                    {currentFund.drawdown1Y.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  Kinerja masa lalu bukan merupakan jaminan kinerja di masa depan. Reksa dana pasar uang tetap memiliki risiko kredit atau gagal bayar instrumen obligasi dalam portofolionya.
                </span>
              </div>
            </div>

            {/* Isi Portofolio (Top Holdings) & Kesesuaian Profil */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Aset Terbesar dalam Portofolio (Top Holdings)</h4>
                {currentFund.topHoldings && currentFund.topHoldings.length > 0 ? (
                  <ul className="space-y-2 text-xs text-slate-700">
                    {currentFund.topHoldings.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-500">Data top holdings tidak tersedia pada ringkasan ini.</div>
                )}
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Kesesuaian dengan Tujuan</h4>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                  <p>
                    <span className="font-semibold text-slate-900">Cocok Untuk: </span>
                    {currentFund.suitableFor}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Bank Kustodian: </span>
                    {currentFund.custodianBank}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Sumber Data: </span>
                    {currentFund.dataSource} ({formatDateIndo(currentFund.dataTimestamp)})
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </motion.div>
    </PullToRefresh>
  );
};
