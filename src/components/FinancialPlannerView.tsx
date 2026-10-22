/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HeartPulse,
  Save,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Target,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  UserFinancialProfile,
  FinancialHealthEvaluation,
  InvestmentGoalItem,
  RiskProfile,
  ExperienceLevel,
} from '../types';
import { formatRupiah, formatPercent } from '../utils/financialCalculations';

interface FinancialPlannerViewProps {
  profile: UserFinancialProfile | null;
  onSaveProfile: (profile: UserFinancialProfile) => void;
  healthEval: FinancialHealthEvaluation;
  goals: InvestmentGoalItem[];
  onAddGoal: (goal: InvestmentGoalItem) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const FinancialPlannerView: React.FC<FinancialPlannerViewProps> = ({
  profile,
  onSaveProfile,
  healthEval,
  goals,
  onAddGoal,
  onDeleteGoal,
}) => {
  const [formData, setFormData] = useState<UserFinancialProfile>(() => {
    return (
      profile || {
        userId: 'current',
        monthlyIncome: 12000000,
        monthlyExpenses: 6500000,
        familyDependents: 0,
        debtInstallments: 1200000,
        debtNotes: 'Cicilan kendaraan',
        emergencyFund: 25000000,
        availableCapital: 10000000,
        monthlyInvestCapacity: 2000000,
        investmentGoal: 'Pertumbuhan modal jangka panjang & persiapan dana pensiun',
        timeHorizonYears: 5,
        riskTolerance: 'moderat',
        experienceLevel: 'pemula',
        liquidityNeeds: 'sedang',
        updatedAt: new Date().toISOString(),
      }
    );
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Goal State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(50000000);
  const [newGoalCurrent, setNewGoalCurrent] = useState(10000000);
  const [newGoalYear, setNewGoalYear] = useState(2028);

  const handleInputChange = (field: keyof UserFinancialProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSavedSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const goal: InvestmentGoalItem = {
      id: `goal-${Date.now()}`,
      userId: 'current',
      title: newGoalTitle.trim(),
      targetAmount: newGoalTarget,
      currentAmount: newGoalCurrent,
      targetYear: newGoalYear,
      category: 'Umum',
      createdAt: new Date().toISOString(),
    };
    onAddGoal(goal);
    setNewGoalTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Assessment Summary */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Financial Health Check</h2>
              <p className="text-xs text-slate-500">
                Fondasi perlindungan modal dan kesiapan sebelum menyetor dana ke Stockbit atau Bibit.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Status Evaluasi</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">{healthEval.status}</div>
          </div>
        </div>

        {/* Highlighted Warning / Guidance Box */}
        <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Rekomendasi Kapasitas: {healthEval.summary}</span>
          </div>
          <div className="text-emerald-900 text-xs">
            Estimasi alokasi investasi bulanan yang aman bagi kondisi Anda saat ini:{' '}
            <span className="font-bold">{formatRupiah(healthEval.safeMonthlyInvestmentAmount)}</span> per bulan.
          </div>
          {healthEval.warnings.length > 0 && (
            <div className="pt-2 border-t border-emerald-200/60 text-amber-900 font-medium">
              ⚠️ {healthEval.warnings.join(' ')}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Pertanyaan Finansial (2 Kolom) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Profil Keuangan & Preferensi Risiko</h3>
              <p className="text-xs text-slate-500">
                12 indikator keuangan untuk memastikan analisis AI sesuai kebutuhan nyata Anda.
              </p>
            </div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                Profil Tersimpan!
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* 1 & 2: Penghasilan & Pengeluaran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  1. Penghasilan Bersih Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.monthlyIncome || ''}
                  onChange={(e) => handleInputChange('monthlyIncome', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  2. Pengeluaran Wajib Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.monthlyExpenses || ''}
                  onChange={(e) => handleInputChange('monthlyExpenses', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Kebutuhan pokok, makan, sewa, listrik, transportasi
                </span>
              </div>
            </div>

            {/* 3 & 4: Tanggungan & Cicilan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  3. Tanggungan Keluarga (Orang)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={formData.familyDependents || 0}
                  onChange={(e) => handleInputChange('familyDependents', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Anak, orang tua, atau anggota yang rutin dibantu
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  4. Cicilan & Utang Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={formData.debtInstallments || ''}
                  onChange={(e) => handleInputChange('debtInstallments', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  KPR, kendaraan, pinjaman bank, kartu kredit
                </span>
              </div>
            </div>

            {/* 5 & 6: Dana Darurat & Modal Tersedia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  5. Saldo Tabungan & Dana Darurat (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={formData.emergencyFund || ''}
                  onChange={(e) => handleInputChange('emergencyFund', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Uang di rekening tabungan / deposito / RDPU
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  6. Modal Awal yang Tersedia (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={formData.availableCapital || ''}
                  onChange={(e) => handleInputChange('availableCapital', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Uang dingin di luar kebutuhan pokok & darurat
                </span>
              </div>
            </div>

            {/* 7 & 8: Kemampuan Rutin & Tujuan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  7. Kemampuan Investasi Rutin Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.monthlyInvestCapacity || ''}
                  onChange={(e) => handleInputChange('monthlyInvestCapacity', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  8. Tujuan Investasi Utama
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dana pensiun, uang pangkal sekolah, beli rumah"
                  value={formData.investmentGoal}
                  onChange={(e) => handleInputChange('investmentGoal', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* 9 & 10: Horizon Waktu & Pengalaman */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  9. Jangka Waktu Tujuan (Tahun)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.timeHorizonYears || 3}
                  onChange={(e) => handleInputChange('timeHorizonYears', parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  10. Pengalaman Investasi
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value as ExperienceLevel)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="pemula">Pemula (Baru mulai / belum pernah beli saham)</option>
                  <option value="menengah">Menengah (Paham reksa dana & dasar saham)</option>
                  <option value="berpengalaman">Berpengalaman (Aktif analisis fundamental/teknikal)</option>
                </select>
              </div>
            </div>

            {/* 11 & 12: Toleransi Risiko & Likuiditas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  11. Toleransi Terhadap Kerugian (Profil Risiko)
                </label>
                <select
                  value={formData.riskTolerance}
                  onChange={(e) => handleInputChange('riskTolerance', e.target.value as RiskProfile)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="konservatif">Konservatif (Takut kehilangan modal, prioritas keamanan)</option>
                  <option value="moderat">Moderat (Bisa menerima fluktuasi wajar untuk return seimbang)</option>
                  <option value="agresif">Agresif (Siap fluktuasi tajam demi pertumbuhan jangka panjang)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  12. Kebutuhan Likuiditas & Rencana Besar
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rencana biaya menikah tahun depan, butuh dana cair cepat"
                  value={formData.liquidityNeeds}
                  onChange={(e) => handleInputChange('liquidityNeeds', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Perbarui Evaluasi</span>
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Target Keuangan (Goals) Tracker */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Target Keuangan Anda</h3>
              </div>
              <span className="text-xs text-slate-500">{goals.length} Target</span>
            </div>

            {/* List Goals */}
            <div className="space-y-3 text-xs mb-5">
              {goals.map((g) => {
                const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
                return (
                  <div key={g.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{g.title}</span>
                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Hapus Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden my-1">
                      <div style={{ width: `${pct}%` }} className="h-full bg-emerald-600 rounded-full" />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Terkumpul: {formatRupiah(g.currentAmount)}</span>
                      <span>Target: {formatRupiah(g.targetAmount)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Target Tercapai: Tahun {g.targetYear}</div>
                  </div>
                );
              })}
            </div>

            {/* Form Tambah Target Baru */}
            <form onSubmit={handleCreateGoal} className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="font-semibold text-slate-800">Tambah Target Finansial Baru</div>
              <input
                type="text"
                placeholder="Nama target (misal: DP Rumah 2028)"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Target Nominal (Rp)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(parseFloat(e.target.value) || 0)}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Terkumpul Saat Ini</label>
                  <input
                    type="number"
                    step="500000"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(parseFloat(e.target.value) || 0)}
                    className="w-full p-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Target Tahun</label>
                <input
                  type="number"
                  min="2026"
                  max="2060"
                  value={newGoalYear}
                  onChange={(e) => setNewGoalYear(parseInt(e.target.value) || 2026)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={!newGoalTitle.trim()}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded text-xs cursor-pointer"
              >
                + Simpan Target Baru
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
