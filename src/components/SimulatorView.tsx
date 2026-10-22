/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  Info,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { runInvestmentSimulation, formatRupiah, formatPercent } from '../utils/financialCalculations';

export const SimulatorView: React.FC = () => {
  // Plan A Parameters
  const [initialCapital, setInitialCapital] = useState<number>(10000000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1500000);
  const [years, setYears] = useState<number>(5);
  const [pessimisticRate, setPessimisticRate] = useState<number>(3.0);
  const [moderateRate, setModerateRate] = useState<number>(7.5);
  const [optimisticRate, setOptimisticRate] = useState<number>(12.0);
  const [inflationRate, setInflationRate] = useState<number>(3.5);
  const [feeRate, setFeeRate] = useState<number>(0.8);

  // Compare Tab State
  const [showComparison, setShowComparison] = useState(false);
  // Plan B Parameters (e.g. Pure Stock DCA vs Conservative RDPU)
  const [planBMonthly, setPlanBMonthly] = useState<number>(1500000);
  const [planBRate, setPlanBRate] = useState<number>(5.5); // Reksa Dana Pasar Uang konsisten
  const [planBName, setPlanBName] = useState('Reksa Dana Pasar Uang (Konservatif)');
  const [planAName, setPlanAName] = useState('Portofolio Campuran & Saham (DCA Dinamis)');

  // Run simulation
  const resultA = runInvestmentSimulation(
    initialCapital,
    monthlyContribution,
    years,
    pessimisticRate,
    moderateRate,
    optimisticRate,
    inflationRate,
    feeRate
  );

  const resultB = runInvestmentSimulation(
    initialCapital,
    planBMonthly,
    years,
    planBRate * 0.8,
    planBRate,
    planBRate * 1.15,
    inflationRate,
    0.2
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">Simulator Investasi & Dollar-Cost Averaging (DCA)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulasi perkiraan nilai akumulasi modal berdasarkan asumsi eksplisit, biaya, dan rentang skenario.
          </p>
        </div>

        <button
          onClick={() => setShowComparison(!showComparison)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
        >
          <Scale className="w-4 h-4 text-emerald-600" />
          <span>{showComparison ? 'Tutup Perbandingan Dua Rencana' : 'Bandingkan Dua Strategi'}</span>
        </button>
      </div>

      {/* Simulator Inputs & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Input Parameter */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Parameter Simulasi (Rencana Utama)
          </h3>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Investasi Awal (Lump-Sum)</label>
            <input
              type="number"
              min="0"
              step="1000000"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">{formatRupiah(initialCapital)}</span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Setoran Rutin Bulanan (DCA)</label>
            <input
              type="number"
              min="0"
              step="250000"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {formatRupiah(monthlyContribution)} / bulan
            </span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Jangka Waktu Investasi: {years} Tahun</label>
            <input
              type="range"
              min="1"
              max="30"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value) || 1)}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 Tahun</span>
              <span>15 Tahun</span>
              <span>30 Tahun</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="font-semibold text-slate-800 block">Asumsi Imbal Hasil Tahunan (% per tahun)</span>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-rose-700 font-medium">Pesimistis (Pasar Bear / Fluktuasi)</span>
                <span className="font-bold">{pessimisticRate}%</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={pessimisticRate}
                onChange={(e) => setPessimisticRate(parseFloat(e.target.value) || 0)}
                className="w-full p-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-800 font-medium">Moderat (Rata-rata Historis)</span>
                <span className="font-bold">{moderateRate}%</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={moderateRate}
                onChange={(e) => setModerateRate(parseFloat(e.target.value) || 0)}
                className="w-full p-1.5 border border-slate-300 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-emerald-700 font-medium">Optimistis (Pasar Bullish)</span>
                <span className="font-bold">{optimisticRate}%</span>
              </div>
              <input
                type="number"
                step="0.5"
                value={optimisticRate}
                onChange={(e) => setOptimisticRate(parseFloat(e.target.value) || 0)}
                className="w-full p-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Estimasi Biaya / Fee Tahunan:</span>
              <input
                type="number"
                step="0.1"
                value={feeRate}
                onChange={(e) => setFeeRate(parseFloat(e.target.value) || 0)}
                className="w-16 p-1 border border-slate-300 rounded text-right font-medium"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Asumsi Inflasi Tahunan:</span>
              <input
                type="number"
                step="0.1"
                value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                className="w-16 p-1 border border-slate-300 rounded text-right font-medium"
              />
            </div>
          </div>
        </div>

        {/* Kolom Hasil & Proyeksi Skenario (2 Kolom) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 3 Skenario */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Proyeksi Nilai Akhir dalam {years} Tahun
              </h3>
              <p className="text-xs text-slate-500">
                Total modal pokok yang Anda tabung/setor:{' '}
                <span className="font-bold text-slate-800">
                  {formatRupiah(resultA.totalPrincipalInvested)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Pesimistis */}
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg">
                <span className="text-rose-900 font-semibold block text-[11px] mb-1">
                  Skenario Pesimistis ({pessimisticRate}%)
                </span>
                <div className="text-lg font-bold text-rose-950">{formatRupiah(resultA.pessimistic)}</div>
                <div className="text-[11px] text-rose-800 mt-2">
                  Imbal hasil kotor: {formatRupiah(resultA.pessimistic - resultA.totalPrincipalInvested)}
                </div>
              </div>

              {/* Moderat */}
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg shadow-xs">
                <span className="text-emerald-900 font-bold block text-[11px] mb-1">
                  Skenario Moderat ({moderateRate}%)
                </span>
                <div className="text-xl font-extrabold text-emerald-950">{formatRupiah(resultA.moderate)}</div>
                <div className="text-[11px] text-emerald-800 mt-2 font-medium">
                  Imbal hasil kotor: +{formatRupiah(resultA.moderate - resultA.totalPrincipalInvested)}
                </div>
              </div>

              {/* Optimistis */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="text-blue-900 font-semibold block text-[11px] mb-1">
                  Skenario Optimistis ({optimisticRate}%)
                </span>
                <div className="text-lg font-bold text-blue-950">{formatRupiah(resultA.optimistic)}</div>
                <div className="text-[11px] text-blue-800 mt-2">
                  Imbal hasil kotor: +{formatRupiah(resultA.optimistic - resultA.totalPrincipalInvested)}
                </div>
              </div>
            </div>

            {/* Disclaimer Penting */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Simulasi ini bersifat edukatif dan bukan ramalan pasti. Pasar saham dan reksa dana bergerak secara fluktuatif (ada bulan positif dan ada bulan negatif), sehingga nilai portofolio riil dapat lebih rendah dari skenario pesimistis jika terjadi krisis ekonomi.
              </span>
            </div>
          </div>

          {/* Tabel Pertumbuhan per Tahun */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 text-xs font-bold text-slate-900">
              Rincian Akumulasi Modal per Tahun
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Tahun Ke</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Modal Pokok Disetor</th>
                    <th className="py-2.5 px-4 font-semibold text-right text-rose-700">Pesimistis</th>
                    <th className="py-2.5 px-4 font-semibold text-right text-emerald-700">Moderat</th>
                    <th className="py-2.5 px-4 font-semibold text-right text-blue-700">Optimistis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultA.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-medium text-slate-800">Tahun {row.year}</td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-700">
                        {formatRupiah(row.principal)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {formatRupiah(row.pessimisticVal)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-800">
                        {formatRupiah(row.moderateVal)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {formatRupiah(row.optimisticVal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Perbandingan Dua Strategi (Bila aktif) */}
          {showComparison && (
            <div className="bg-white p-5 rounded-lg border-2 border-emerald-500 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Perbandingan Dua Rencana Investasi</h4>
                  <p className="text-xs text-slate-500">
                    Bandingkan strategi alokasi aset dengan tingkat risiko dan return berbeda.
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                  Komparasi Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Rencana A */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-sm">{planAName}</div>
                  <div className="text-slate-600">
                    Setoran: {formatRupiah(monthlyContribution)} / bulan ({moderateRate}% per tahun)
                  </div>
                  <div className="text-base font-extrabold text-emerald-700 mt-2">
                    Hasil Moderat: {formatRupiah(resultA.moderate)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Cocok bagi investor yang siap menerima fluktuasi pasar demi potensi return lebih tinggi.
                  </div>
                </div>

                {/* Rencana B */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-sm">{planBName}</div>
                  <div className="text-slate-600">
                    Setoran: {formatRupiah(planBMonthly)} / bulan ({planBRate}% per tahun)
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-2">
                    Hasil Moderat: {formatRupiah(resultB.moderate)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Cocok untuk dana darurat atau penempatan modal berisiko sangat rendah tanpa drawdown besar.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
