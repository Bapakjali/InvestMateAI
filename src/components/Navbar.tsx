/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  PieChart,
  Layers,
  HeartPulse,
  Calculator,
  Bot,
  History,
  Settings,
  PlusCircle,
  HelpCircle,
  User as UserIcon,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { FirebaseUser } from '../lib/firebase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAddTx: () => void;
  onQuickAskAi: (promptText?: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAddTx,
  onQuickAskAi,
  isDemoMode,
  setIsDemoMode,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'saham', label: 'Analisis Saham', icon: TrendingUp },
    { id: 'reksadana', label: 'Reksa Dana', icon: Layers },
    { id: 'portofolio', label: 'Portofolio', icon: PieChart },
    { id: 'perencana', label: 'Kesehatan Finansial', icon: HeartPulse },
    { id: 'simulator', label: 'Simulasi', icon: Calculator },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'riwayat', label: 'Riwayat Analisis', icon: History },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      {/* Top Advisory Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            InvestMate AI adalah aplikasi pendamping edukasi terpisah untuk Stockbit & Bibit. Bukan penasihat investasi berlisensi OJK.
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>Format: Rupiah (IDR)</span>
          <span aria-hidden="true">·</span>
          <span>WIB (Asia/Jakarta)</span>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => onQuickAskAi('Apa prinsip utama berinvestasi yang aman bagi pemula?')}
            className="text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1 font-medium"
          >
            <HelpCircle className="w-3 h-3" />
            Panduan Pemula
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            IM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">InvestMate AI</span>
              {isDemoMode && (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                  MODE DEMO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Pendamping Saham BEI & Reksa Dana Bibit</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddTx}
            className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Catat Transaksi
          </button>

          <button
            onClick={() => onQuickAskAi()}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-md transition-colors cursor-pointer shadow-sm"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Tanya AI</span>
          </button>

          {/* User Auth Info */}
          <div className="border-l border-slate-200 pl-2 sm:pl-3 ml-1 sm:ml-2 flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {currentUser.displayName || currentUser.email || 'Pengguna'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">Terhubung Firebase</div>
                </div>
                <button
                  onClick={onLogout}
                  title="Keluar"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-md transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 border-t border-slate-100 scrollbar-none py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
