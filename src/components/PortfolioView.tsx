/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PlusCircle,
  Download,
  Upload,
  Trash2,
  Edit2,
  Layers,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Search,
  Scale,
  Sparkles,
  Coins,
  Calendar,
} from 'lucide-react';
import { PortfolioTransaction, PortfolioSummary, StockQuote, MutualFund, UserFinancialProfile, AssetType } from '../types';
import { formatRupiah, formatPercent, formatDateIndo } from '../utils/financialCalculations';
import { PullToRefresh } from './PullToRefresh';
import { RebalanceSuggestionTool } from './RebalanceSuggestionTool';
import { DividendTrackerView } from './DividendTrackerView';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioViewProps {
  portfolio: PortfolioSummary;
  transactions: PortfolioTransaction[];
  financialProfile?: UserFinancialProfile;
  stocks?: Record<string, StockQuote>;
  mutualFunds?: Record<string, MutualFund>;
  onOpenAddTx: (symbol?: string, type?: AssetType) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCsv: () => void;
  onImportCsv: (importedTxs: PortfolioTransaction[]) => void;
  isDemoMode: boolean;
  onClearDemoData: () => void;
  onLoadDemoData: () => void;
  onRefresh?: () => Promise<void> | void;
  initialSubTab?: 'transactions' | 'rebalance' | 'dividends';
  onOpenAssetDetail?: (symbol: string, type: 'saham' | 'reksadana') => void;
  onOpenAlerts?: (symbol?: string) => void;
  onAskAi?: (prompt: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  transactions,
  financialProfile,
  stocks = {},
  mutualFunds = {},
  onOpenAddTx,
  onDeleteTransaction,
  onExportCsv,
  onImportCsv,
  isDemoMode,
  onClearDemoData,
  onLoadDemoData,
  onRefresh,
  initialSubTab = 'transactions',
  onOpenAssetDetail,
  onOpenAlerts,
  onAskAi,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'rebalance' | 'dividends'>(initialSubTab);
  const [filterType, setFilterType] = useState<'all' | 'saham' | 'reksadana'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.assetType === filterType;
    const matchesSearch =
      tx.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.assetName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setImportFeedback('Format CSV kosong atau tidak memiliki baris data.');
          return;
        }

        // Expected header: symbol,assetName,assetType,type,date,unitsOrLots,pricePerUnit,fee,totalAmount,notes
        const imported: PortfolioTransaction[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 7) {
            const symbol = cols[0].toUpperCase();
            const assetName = cols[1] || symbol;
            const assetType = cols[2]?.toLowerCase() === 'saham' ? 'saham' : 'reksadana';
            const type = cols[3]?.toLowerCase() === 'jual' ? 'jual' : 'beli';
            const date = cols[4] || new Date().toISOString().slice(0, 10);
            const unitsOrLots = parseFloat(cols[5]) || 1;
            const pricePerUnit = parseFloat(cols[6]) || 0;
            const fee = parseFloat(cols[7]) || 0;
            const totalAmount = parseFloat(cols[8]) || (assetType === 'saham' ? unitsOrLots * 100 * pricePerUnit + fee : unitsOrLots * pricePerUnit + fee);
            const notes = cols[9] || 'Impor CSV';

            imported.push({
              id: `tx-imp-${Date.now()}-${i}`,
              userId: 'current',
              symbol,
              assetName,
              assetType,
              type,
              date,
              unitsOrLots,
              sharesOrUnitsCount: assetType === 'saham' ? unitsOrLots * 100 : unitsOrLots,
              pricePerUnit,
              fee,
              totalAmount,
              notes,
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (imported.length > 0) {
          onImportCsv(imported);
          setImportFeedback(`Berhasil mengimpor ${imported.length} transaksi dari file CSV.`);
        } else {
          setImportFeedback('Tidak ada baris data valid yang dapat diimpor.');
        }
      } catch (err: any) {
        setImportFeedback(`Gagal memproses file CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <PullToRefresh onRefresh={onRefresh || (() => {})}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {/* Portfolio Top Bar */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Portofolio & Riwayat Transaksi Manual</h2>
            {isDemoMode && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                DEMO
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Pencatatan manual aset Anda dari Stockbit (saham BEI) dan Bibit (reksa dana).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <button
              onClick={onClearDemoData}
              className="text-xs font-medium text-slate-600 hover:text-rose-600 border border-slate-300 hover:border-rose-300 px-3 py-2 rounded-md transition-colors cursor-pointer"
            >
              Hapus Data Demo
            </button>
          ) : (
            <button
              onClick={onLoadDemoData}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-md transition-colors cursor-pointer"
            >
              Muat Data Demo
            </button>
          )}

          <label className="text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Impor CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={onExportCsv}
            disabled={transactions.length === 0}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => setActiveSubTab(activeSubTab === 'rebalance' ? 'transactions' : 'rebalance')}
            className={`text-xs font-semibold px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${
              activeSubTab === 'rebalance'
                ? 'bg-emerald-800 text-white'
                : 'text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>{activeSubTab === 'rebalance' ? 'Buku Transaksi' : 'Saran Rebalancing'}</span>
          </button>

          <button
            onClick={() => onOpenAddTx()}
            className="text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {importFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center justify-between">
          <span>{importFeedback}</span>
          <button onClick={() => setImportFeedback(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-xs block mb-1">Total Nilai Pasar Saat Ini</span>
          <span className="text-xl font-bold text-slate-900">{formatRupiah(portfolio.totalMarketValue)}</span>
          <div className="text-[11px] text-slate-500 mt-1">
            Modal diinvestasikan: {formatRupiah(portfolio.totalNetInvested)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-xs block mb-1">Imbal Hasil Belum Terealisasi</span>
          <span
            className={`text-xl font-bold ${
              portfolio.unrealizedPnL >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatRupiah(portfolio.unrealizedPnL)} ({formatPercent(portfolio.unrealizedPnLPercent)})
          </span>
          <div className="text-[11px] text-slate-500 mt-1">Estimasi keuntungan bila dijual saat ini</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-xs block mb-1">Keuntungan Bersih Terealisasi</span>
          <span
            className={`text-xl font-bold ${
              portfolio.realizedPnL >= 0 ? 'text-slate-900' : 'text-rose-700'
            }`}
          >
            {formatRupiah(portfolio.realizedPnL)}
          </span>
          <div className="text-[11px] text-slate-500 mt-1">
            Akumulasi laba/rugi transaksi jual yang telah ditutup
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar for Portfolio */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'transactions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Buku Catatan Transaksi ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rebalance')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'rebalance'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Alat Rekomendasi Rebalancing</span>
          {financialProfile && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                activeSubTab === 'rebalance'
                  ? 'bg-emerald-900 text-emerald-200'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {financialProfile.riskTolerance}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('dividends')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'dividends'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Pelacak Dividen & Kalender</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              activeSubTab === 'dividends'
                ? 'bg-emerald-950 text-emerald-200'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            BEI
          </span>
        </button>
      </div>

      {activeSubTab === 'dividends' ? (
        <DividendTrackerView
          holdings={portfolio.holdings}
          stocksMap={stocks}
          onOpenAssetDetail={onOpenAssetDetail}
          onOpenAddTx={(sym, type) => onOpenAddTx(sym, type)}
          onOpenAlerts={onOpenAlerts}
          onAskAi={onAskAi}
        />
      ) : activeSubTab === 'rebalance' ? (
        <RebalanceSuggestionTool
          portfolio={portfolio}
          financialProfile={
            financialProfile || {
              userId: 'guest',
              monthlyIncome: 15000000,
              monthlyExpenses: 8000000,
              familyDependents: 1,
              debtInstallments: 0,
              emergencyFund: 35000000,
              availableCapital: 10000000,
              monthlyInvestCapacity: 2500000,
              investmentGoal: 'Pertumbuhan & Kebebasan Finansial',
              timeHorizonYears: 10,
              riskTolerance: 'moderat',
              experienceLevel: 'menengah',
              liquidityNeeds: 'Sedang',
              updatedAt: new Date().toISOString(),
            }
          }
          stocks={stocks}
          mutualFunds={mutualFunds}
          onOpenAddTx={onOpenAddTx}
          onRefresh={onRefresh}
        />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Aset ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('saham')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'saham'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Saham BEI
          </button>
          <button
            onClick={() => setFilterType('reksadana')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'reksadana'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Reksa Dana
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Buku Catatan Transaksi</h3>
          <span className="text-xs text-slate-500">
            Total {filteredTransactions.length} baris riwayat
          </span>
        </div>

        {filteredTransactions.length > 0 ? (
          <div>
            {/* Mobile Card List View (< sm screens) */}
            <div className="divide-y divide-slate-100 sm:hidden">
              {filteredTransactions.map((tx) => {
                const isBuy = tx.type === 'beli';
                return (
                  <div key={tx.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                            isBuy
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-slate-900">{tx.symbol}</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">{tx.assetName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-slate-900">{formatRupiah(tx.totalAmount)}</div>
                        <div className="text-[10px] text-slate-400">{formatDateIndo(tx.date)}</div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div>
                        <span>
                          {tx.unitsOrLots.toLocaleString('id-ID')} {tx.assetType === 'saham' ? 'Lot' : 'Unit'}
                        </span>
                        <span className="mx-1">@</span>
                        <span>{formatRupiah(tx.pricePerUnit)}</span>
                        {tx.fee > 0 && <span className="text-slate-400"> (Fee: {formatRupiah(tx.fee)})</span>}
                      </div>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= sm screens) */}
            <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-4 font-semibold">Jenis</th>
                  <th className="py-2.5 px-4 font-semibold">Aset</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Kuantitas</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Harga Satuan</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Biaya (Fee)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total Transaksi</th>
                  <th className="py-2.5 px-4 font-semibold">Catatan</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isBuy = tx.type === 'beli';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                        {formatDateIndo(tx.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                            isBuy
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tx.symbol}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{tx.assetName}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-slate-800">
                          {tx.unitsOrLots.toLocaleString('id-ID')}{' '}
                          {tx.assetType === 'saham' ? 'Lot' : 'Unit'}
                        </div>
                        {tx.assetType === 'saham' && (
                          <div className="text-[10px] text-slate-400">
                            {(tx.unitsOrLots * 100).toLocaleString('id-ID')} lbr
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {formatRupiah(tx.pricePerUnit)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {formatRupiah(tx.fee)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(tx.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[160px] truncate">
                        {tx.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Hapus transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="p-8 text-center text-xs text-slate-500 space-y-3">
            <p>Belum ada catatan transaksi pada filter ini.</p>
            <button
              onClick={() => onOpenAddTx()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-3 py-1.5 rounded text-xs cursor-pointer"
            >
              Catat Transaksi Sekarang
            </button>
          </div>
        )}
      </div>
      </>
      )}
      </motion.div>
    </PullToRefresh>
  );
};
