/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PieChart,
  HeartPulse,
  Calculator,
  History,
  Settings,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  Download,
  AlertTriangle,
  Bell,
  Coins,
} from 'lucide-react';
import { FirebaseUser } from '../lib/firebase';
import { UserFinancialProfile, FinancialHealthEvaluation } from '../types';
import { formatRupiah } from '../utils/financialCalculations';

interface MobileMenuViewProps {
  currentUser: FirebaseUser | null;
  financialProfile: UserFinancialProfile | null;
  healthEval: FinancialHealthEvaluation;
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenAddTx: () => void;
  onOpenAlerts?: () => void;
  activeAlertsCount?: number;
  onOpenDividends?: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badge?: string;
  onClick?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const MobileMenuView: React.FC<MobileMenuViewProps> = ({
  currentUser,
  financialProfile,
  healthEval,
  onNavigate,
  onOpenAuth,
  onLogout,
  isDemoMode,
  onToggleDemoMode,
  onOpenAddTx,
  onOpenAlerts,
  activeAlertsCount = 0,
  onOpenDividends,
}) => {
  const menuSections: MenuSection[] = [
    {
      title: 'Portofolio & Pantauan Pasar',
      items: [
        {
          id: 'portofolio',
          title: 'Buku Catatan Transaksi',
          subtitle: 'Riwayat beli/jual, harga rata-rata, dan PnL',
          icon: PieChart,
          iconColor: 'text-blue-600 bg-blue-50',
          onClick: () => onNavigate('portofolio'),
        },
        {
          id: 'dividends',
          title: 'Pelacak Dividen & Kalender BEI',
          subtitle: 'Estimasi yield, passive income, & jadwal cum/ex date',
          icon: Coins,
          iconColor: 'text-amber-600 bg-amber-50',
          onClick: onOpenDividends || (() => onNavigate('portofolio')),
        },
        {
          id: 'alerts',
          title: 'Target Price Alert & Notifikasi',
          subtitle: `${activeAlertsCount > 0 ? `${activeAlertsCount} alert aktif` : 'Belum ada alert'} · Push notifikasi web`,
          icon: Bell,
          iconColor: 'text-emerald-700 bg-emerald-50',
          badge: activeAlertsCount > 0 ? `${activeAlertsCount} Aktif` : undefined,
          onClick: () => (onOpenAlerts ? onOpenAlerts() : onNavigate('dashboard')),
        },
      ],
    },
    {
      title: 'Perencanaan & Simulasi',
      items: [
        {
          id: 'perencana',
          title: 'Kesehatan Finansial',
          subtitle: `Status: ${healthEval.status}`,
          icon: HeartPulse,
          iconColor: 'text-emerald-600 bg-emerald-50',
        },
        {
          id: 'simulator',
          title: 'Simulator Investasi & DCA',
          subtitle: 'Proyeksi modal, pengaruh inflasi, dan fee',
          icon: Calculator,
          iconColor: 'text-indigo-600 bg-indigo-50',
        },
      ],
    },
    {
      title: 'Arsip & Pengaturan',
      items: [
        {
          id: 'riwayat',
          title: 'Riwayat Analisis AI',
          subtitle: 'Kumpulan rekomendasi & evaluasi tersimpan',
          icon: History,
          iconColor: 'text-amber-600 bg-amber-50',
        },
        {
          id: 'pengaturan',
          title: 'Pengaturan & Backup Data',
          subtitle: 'Ekspor JSON, reset data, dan unit test runner',
          icon: Settings,
          iconColor: 'text-slate-600 bg-slate-100',
        },
      ],
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* User Profile Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {currentUser?.email ? currentUser.email[0].toUpperCase() : 'IM'}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {currentUser?.email || 'Mode Tamu (Lokal)'}
              </div>
              <div className="text-xs text-slate-500">
                {currentUser ? 'Akun Terhubung Firebase' : 'Penyimpanan Lokal'}
              </div>
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Masuk / Daftar
            </button>
          )}
        </div>

        {/* Demo Mode Switcher Banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-800">Mode Simulasi DEMO:</span>
            <span className="text-slate-500 block text-[11px]">
              {isDemoMode ? 'Menggunakan data contoh' : 'Menggunakan data asli pengguna'}
            </span>
          </div>
          <button
            onClick={onToggleDemoMode}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              isDemoMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isDemoMode ? 'Aktif (DEMO)' : 'Nonaktif'}
          </button>
        </div>
      </div>

      {/* Quick Transaction Action */}
      <button
        onClick={onOpenAddTx}
        className="w-full p-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Catat Transaksi Saham atau Reksa Dana</span>
      </button>

      {/* Menu Categories */}
      {menuSections.map((section, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {section.title}
          </div>
          <div className="divide-y divide-slate-100">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.onClick || (() => onNavigate(item.id))}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        {'badge' in item && item.badge && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Disclaimer Card */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kepatuhan & Penafian Risiko</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600">
          InvestMate AI bukan penasihat investasi berlisensi OJK. Transaksi saham (BEI) dan reksa dana dilakukan mandiri di Stockbit / Bibit.
        </p>
      </div>
    </div>
  );
};
