/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Maximize2,
  Wifi,
  Battery,
  ShieldAlert,
  User as UserIcon,
  HelpCircle,
  Bell,
  Sparkles,
  Bot,
} from 'lucide-react';
import { FirebaseUser } from '../lib/firebase';

interface MobileTopBarProps {
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
  isDemoMode: boolean;
  onQuickAskAi: (promptText?: string) => void;
  onOpenAlerts?: () => void;
  activeAlertsCount?: number;
  hasTriggeredAlerts?: boolean;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentUser,
  onOpenAuth,
  isPhoneFrame,
  setIsPhoneFrame,
  isDemoMode,
  onQuickAskAi,
  onOpenAlerts,
  activeAlertsCount = 0,
  hasTriggeredAlerts = false,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Device Status Bar (Simulated Mobile OS Status Bar) */}
      <div className="bg-slate-900 text-white px-4 py-1 flex items-center justify-between text-[11px] select-none font-medium">
        <div className="flex items-center gap-1.5">
          <span>{currentTime || '09:41'}</span>
          <span className="text-[10px] text-emerald-400 font-bold">WIB</span>
        </div>

        {/* Dynamic Island / Speaker Pill */}
        <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto hidden sm:block" />

        <div className="flex items-center gap-2 text-slate-300">
          <Wifi className="w-3 h-3 text-slate-200" />
          <span className="text-[10px]">5G</span>
          <Battery className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>

      {/* Main App Top Navigation Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-sm shadow-xs">
            IM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">InvestMate AI</span>
              {isDemoMode && (
                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1 rounded">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 leading-none">Saham BEI & Reksa Dana Bibit</p>
          </div>
        </div>

        {/* Right Action Icons & Frame Switcher */}
        <div className="flex items-center gap-1.5">
          {/* Notification Bell with Badge */}
          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              title="Target Price Alerts & Notifikasi"
              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              {hasTriggeredAlerts ? (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              ) : activeAlertsCount > 0 ? (
                <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center px-0.5">
                  {activeAlertsCount}
                </span>
              ) : null}
            </button>
          )}

          {/* Toggle Phone Frame (Desktop Preview Mode) */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            title={isPhoneFrame ? 'Ubah ke Layar Penuh' : 'Ubah ke Bingkai HP'}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 border border-slate-200"
          >
            {isPhoneFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px] font-medium">Layar Penuh</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-[10px] font-medium">Mode HP</span>
              </>
            )}
          </button>

          {/* User Icon */}
          <button
            onClick={onOpenAuth}
            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={currentUser ? currentUser.email || 'Akun' : 'Masuk'}
          >
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advisory Ticker Ribbon */}
      <div className="bg-emerald-50 px-3 py-1 border-t border-emerald-100 text-[10px] text-emerald-950 flex items-center justify-between">
        <div className="flex items-center gap-1 truncate">
          <ShieldAlert className="w-3 h-3 text-emerald-700 shrink-0" />
          <span className="truncate">Pendamping mandiri Stockbit & Bibit · Format Rupiah (IDR)</span>
        </div>
        <button
          onClick={() => onQuickAskAi('Apa prinsip investasi terpenting bagi pemula di Indonesia?')}
          className="text-emerald-700 font-bold shrink-0 hover:underline cursor-pointer ml-2 flex items-center gap-0.5"
        >
          <Sparkles className="w-2.5 h-2.5" />
          Tips
        </button>
      </div>
    </div>
  );
};
