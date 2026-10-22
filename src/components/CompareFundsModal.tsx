/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { MutualFund } from '../types';
import { formatRupiah, formatPercent } from '../utils/financialCalculations';

interface CompareFundsModalProps {
  funds: MutualFund[];
  isOpen: boolean;
  onClose: () => void;
  initialFundId?: string;
}

export const CompareFundsModal: React.FC<CompareFundsModalProps> = ({
  funds,
  isOpen,
  onClose,
  initialFundId,
}) => {
  const [selectedFundIds, setSelectedFundIds] = useState<string[]>(() => {
    const defaultIds = [
      'sucor-money-market',
      'majoris-sukuk-negara',
      'batavia-dana-saham',
    ];
    if (initialFundId && !defaultIds.includes(initialFundId)) {
      return [initialFundId, ...defaultIds.slice(0, 2)];
    }
    return defaultIds;
  });

  if (!isOpen) return null;

  const selectedFunds = selectedFundIds
    .map((id) => funds.find((f) => f.id === id))
    .filter(Boolean) as MutualFund[];

  const handleAddFund = (id: string) => {
    if (selectedFundIds.length < 4 && !selectedFundIds.includes(id)) {
      setSelectedFundIds([...selectedFundIds, id]);
    }
  };

  const handleRemoveFund = (id: string) => {
    if (selectedFundIds.length > 1) {
      setSelectedFundIds(selectedFundIds.filter((fId) => fId !== id));
    }
  };

  const remainingFunds = funds.filter((f) => !selectedFundIds.includes(f.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Perbandingan Produk Reksa Dana (Maksimal 4)</h3>
            <p className="text-xs text-slate-500">
              Bandingkan risiko, biaya, dan performa berbagai jenis reksa dana di Bibit secara berdampingan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add more funds selector if < 4 */}
        {selectedFundIds.length < 4 && remainingFunds.length > 0 && (
          <div className="px-5 py-2.5 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-3 text-xs">
            <span className="font-semibold text-emerald-900 shrink-0">Tambah produk untuk dibandingkan:</span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {remainingFunds.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleAddFund(f.id)}
                  className="inline-flex items-center gap-1 bg-white border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table Content */}
        <div className="p-5 overflow-x-auto flex-1 text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-left font-semibold text-slate-400 w-44">Parameter</th>
                {selectedFunds.map((f) => (
                  <th key={f.id} className="py-3 px-4 text-left font-bold text-slate-900 min-w-[200px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{f.name}</div>
                        <div className="text-[11px] font-normal text-slate-500">{f.fundManager}</div>
                      </div>
                      {selectedFunds.length > 1 && (
                        <button
                          onClick={() => handleRemoveFund(f.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="Hapus dari perbandingan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Kategori</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-medium text-slate-800">
                    {f.categoryLabel}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Tingkat Risiko</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-bold text-slate-900">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        f.riskLevel === 'Rendah'
                          ? 'bg-emerald-50 text-emerald-800'
                          : f.riskLevel === 'Sedang'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {f.riskLevel}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">NAB Terkini</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-bold text-slate-900">
                    {formatRupiah(f.navPerUnit)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Dana Kelolaan (AUM)</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-medium text-slate-800">
                    {formatRupiah(f.aum)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Expense Ratio</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-medium text-slate-800">
                    {f.expenseRatio}% / tahun
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Return 1 Tahun</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-bold text-emerald-700">
                    {formatPercent(f.returns.y1)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Return 3 Tahun</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-bold text-emerald-700">
                    {formatPercent(f.returns.y3)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Max Drawdown 1T</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-semibold text-rose-700">
                    {f.drawdown1Y.toFixed(1)}%
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Min. Pembelian</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 font-medium text-slate-800">
                    {formatRupiah(f.minBuyAmount)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Kesesuaian Pengguna</td>
                {selectedFunds.map((f) => (
                  <td key={f.id} className="py-3 px-4 text-slate-600 leading-relaxed text-[11px]">
                    {f.suitableFor}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Catatan: Jangan memilih produk semata-mata karena return historis 1 tahun tertinggi.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md cursor-pointer"
          >
            Tutup Perbandingan
          </button>
        </div>
      </div>
    </div>
  );
};
