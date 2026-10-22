/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, ReactNode, TouchEvent, MouseEvent } from 'react';
import { RefreshCw, ArrowDown, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  refreshText?: string;
  successText?: string;
}

const PULL_THRESHOLD = 60;
const MAX_PULL = 90;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  refreshText = 'Memperbarui data pasar BEI & Bibit...',
  successText = 'Data pasar berhasil diperbarui',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Check if all scrollable ancestors and window are at the very top
  const isScrolledToTop = (): boolean => {
    if (!containerRef.current) return true;
    let el: HTMLElement | null = containerRef.current;
    while (el) {
      if (el.scrollTop > 0) return false;
      el = el.parentElement;
    }
    return (window.scrollY || document.documentElement.scrollTop || 0) === 0;
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    if (isScrolledToTop()) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && isScrolledToTop()) {
      // Damped exponential resistance
      const distance = Math.min(MAX_PULL, diff * 0.45);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    setPullDistance(PULL_THRESHOLD * 0.75);
    try {
      await onRefresh();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1400);
    } catch (err) {
      console.error('Error during pull-to-refresh:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // Mouse drag support for desktop preview
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    if (!isScrolledToTop()) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a, [role="button"]')) return;
    startYRef.current = e.clientY;
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing) return;
    const currentY = e.clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && isScrolledToTop()) {
      const distance = Math.min(MAX_PULL, diff * 0.45);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      handleTouchEnd();
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative overflow-visible select-none"
    >
      {/* Pull Gesture Indicator Ribbon */}
      <motion.div
        animate={{ height: pullDistance }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="overflow-hidden flex items-center justify-center pointer-events-none"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-emerald-50/95 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
          {showSuccess ? (
            <span className="flex items-center gap-1.5 text-emerald-700 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span>{successText}</span>
            </span>
          ) : isRefreshing ? (
            <span className="flex items-center gap-1.5 text-emerald-800">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>{refreshText}</span>
            </span>
          ) : pullDistance >= PULL_THRESHOLD ? (
            <span className="flex items-center gap-1.5 text-emerald-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Lepaskan untuk memuat ulang pasar</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-600">
              <ArrowDown
                style={{
                  transform: `rotate(${Math.min(180, (pullDistance / PULL_THRESHOLD) * 180)}deg)`,
                }}
                className="w-3.5 h-3.5 text-emerald-600 transition-transform duration-100"
              />
              <span>Tarik ke bawah untuk segarkan</span>
            </span>
          )}
        </div>
      </motion.div>

      {/* Manual Refresh Bar on Top of View */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tarik layar ke bawah untuk segarkan data pasar</span>
        </div>
        <button
          onClick={triggerRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-md transition-all cursor-pointer active:scale-95 shadow-2xs"
          title="Segarkan data pasar terkini dari server"
        >
          <RefreshCw className={`w-3 h-3 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan'}</span>
        </button>
      </div>

      <div className="select-text">
        {children}
      </div>
    </div>
  );
};
