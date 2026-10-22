/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PieChart,
  TrendingUp,
  Layers,
  Bot,
  Menu,
  Plus,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddTx: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddTx,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: PieChart },
    { id: 'saham', label: 'Saham', icon: TrendingUp },
    { id: 'reksadana', label: 'Reksa Dana', icon: Layers },
    { id: 'assistant', label: 'Tanya AI', icon: Bot },
    { id: 'menu', label: 'Lainnya', icon: Menu },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-area-bottom shadow-lg transition-transform">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'menu' &&
              ['perencana', 'simulator', 'riwayat', 'pengaturan', 'portofolio'].includes(activeTab));

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] min-h-[48px] rounded-lg transition-colors cursor-pointer select-none active:scale-95 ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 stroke-[2.2]' : 'text-slate-400'}`} />
                {tab.id === 'assistant' && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
