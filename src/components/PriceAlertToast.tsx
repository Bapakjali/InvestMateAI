/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BellRing, X, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRupiah } from '../utils/financialCalculations';

export interface ToastAlertNotification {
  id: string;
  symbol: string;
  assetName: string;
  targetPrice: number;
  currentPrice: number;
  condition: 'above_or_equal' | 'below_or_equal';
  time: string;
  assetType?: 'saham' | 'reksadana';
}

interface PriceAlertToastProps {
  notifications: ToastAlertNotification[];
  onDismiss: (id: string) => void;
  onOpenAssetDetail?: (symbol: string, type: 'saham' | 'reksadana') => void;
  onOpenAlertManager?: () => void;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
  notifications,
  onDismiss,
  onOpenAssetDetail,
  onOpenAlertManager,
}) => {
  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px] px-3 pointer-events-none space-y-2">
      <AnimatePresence>
        {notifications.map((n) => {
          const isAbove = n.condition === 'above_or_equal';
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <BellRing className="w-4 h-4 animate-bounce" />
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-sm">{n.symbol}</span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-1.5 py-0.2 rounded">
                      TARGET HARGA TERCAPAI
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                    {n.symbol} menyentuh target{' '}
                    <strong className="text-emerald-400">{formatRupiah(n.targetPrice)}</strong> (Kini:{' '}
                    {formatRupiah(n.currentPrice)})
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px]">
                    {onOpenAssetDetail && (
                      <button
                        onClick={() => {
                          onOpenAssetDetail(n.symbol, n.assetType || 'saham');
                          onDismiss(n.id);
                        }}
                        className="text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>Lihat Aset</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {onOpenAlertManager && (
                      <button
                        onClick={() => {
                          onOpenAlertManager();
                          onDismiss(n.id);
                        }}
                        className="text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        Kelola Alert
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDismiss(n.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
