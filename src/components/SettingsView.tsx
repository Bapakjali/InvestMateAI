/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  FileText,
  User as UserIcon,
  RefreshCw,
} from 'lucide-react';
import { runAllUnitTests } from '../utils/__tests__/financialCalculations.test';
import { FirebaseUser } from '../lib/firebase';

interface SettingsViewProps {
  currentUser: FirebaseUser | null;
  onLogout: () => void;
  onExportAllData: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onLogout,
  onExportAllData,
  onClearAllData,
}) => {
  const [testResults, setTestResults] = useState<{ testName: string; passed: boolean; message?: string }[] | null>(null);

  const handleRunTests = () => {
    const results = runAllUnitTests();
    setTestResults(results);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-800 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pengaturan & Verifikasi Sistem</h2>
            <p className="text-xs text-slate-500">
              Preferensi aplikasi, manajemen data, uji algoritma finansial, dan keterbukaan etika.
            </p>
          </div>
        </div>
      </div>

      {/* Akun Pengguna & Keamanan Cloud */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Akun & Status Penyimpanan
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Status Pengguna:</span>
            <span className="font-bold text-slate-900 text-sm">
              {currentUser ? currentUser.email || 'Pengguna Terautentikasi' : 'Mode Tamu (Penyimpanan Lokal)'}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
              Terkoneksi Firebase Firestore & Auth
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium cursor-pointer"
              >
                Keluar Akun
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ekspor & Pencadangan Data */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Cadangan & Portabilitas Data
        </h3>

        <p className="text-xs text-slate-600">
          Unduh salinan penuh seluruh data portofolio, profil keuangan, target, dan riwayat analisis AI Anda ke komputer dalam format JSON standar.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportAllData}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Seluruh Data (JSON Backup)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menghapus seluruh data lokal dan mereset portofolio?')) {
                onClearAllData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus & Reset Semua Data</span>
          </button>
        </div>
      </div>

      {/* Algoritma & Unit Test Suite Runner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Uji Mandiri Algoritma Finansial (Unit Testing)</h3>
            <p className="text-xs text-slate-500">
              Verifikasi integritas matematika: harga rata-rata, realized PnL, lot-size BEI, dan compound interest.
            </p>
          </div>
          <button
            onClick={handleRunTests}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Jalankan Pengujian Unit</span>
          </button>
        </div>

        {testResults ? (
          <div className="space-y-2 text-xs">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border flex items-center justify-between ${
                  t.passed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-semibold">{t.testName}</span>
                </div>
                <span className="font-bold text-[11px] uppercase tracking-wide">
                  {t.passed ? 'BERHASIL (PASS)' : `GAGAL: ${t.message}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Belum ada pengujian yang dijalankan pada sesi ini.</span>
            <span className="text-[11px] text-slate-400">Tekan tombol di atas untuk memvalidasi algoritma</span>
          </div>
        )}
      </div>

      {/* Kepatuhan Etika & Batasan Hukum */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3 text-xs text-slate-600">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Prinsip Etika, Batasan, & Penafian Risiko (Disclaimer)</span>
        </h3>

        <ul className="space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
            <span>
              <strong>Bukan Penasihat Keuangan Berlisensi:</strong> InvestMate AI adalah alat bantu edukasi dan simulasi keputusan, bukan penasihat investasi atau wakil perantara perdagangan efek resmi OJK.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
            <span>
              <strong>Tanpa Jaminan Keuntungan:</strong> Seluruh instrumen pasar modal (saham dan reksa dana) memiliki risiko fluktuasi nilai. InvestMate AI tidak pernah menjanjikan keuntungan pasti atau mengklaim suatu aset pasti naik.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
            <span>
              <strong>Pemisahan Transaksi:</strong> InvestMate AI tidak terafiliasi resmi dengan Stockbit atau Bibit. Seluruh transaksi saham dan reksa dana dilakukan secara manual oleh pengguna sendiri di aplikasi sekuritas pilihannya. InvestMate AI tidak pernah meminta PIN, OTP, atau kata sandi akun sekuritas Anda.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
            <span>
              <strong>Perlindungan Modal:</strong> Sangat dilarang menggunakan dana kebutuhan pokok, uang sewa, dana darurat primer, atau pinjaman online (pinjol) untuk berinvestasi.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
