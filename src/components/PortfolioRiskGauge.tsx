/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Scale,
  Sparkles,
  Info,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioSummary, UserFinancialProfile, RiskProfile } from '../types';
import { formatPercent } from '../utils/financialCalculations';

interface PortfolioRiskGaugeProps {
  portfolio: PortfolioSummary;
  financialProfile: UserFinancialProfile | null;
  onNavigate?: (tab: string) => void;
}

// Inherent Risk Weights per asset type (0 to 100)
// Grounded on IDX equity volatility, OJK mutual fund risk classifications
const ASSET_RISK_WEIGHTS = {
  reksadana_pasar_uang: 12, // Sangat Rendah - instrumen pasar uang < 1 tahun, deposito
  reksadana_pendapatan_tetap: 32, // Rendah ke Sedang - obligasi korporasi & SBN
  reksadana_campuran: 58, // Sedang - alokasi kombinasi obligasi & ekuitas
  reksadana_saham: 78, // Tinggi - saham terkelola manajer investasi
  saham: 88, // Tinggi ke Sangat Tinggi - saham individu Bursa Efek Indonesia (IDX)
};

// Target Risk Scores by Profile
const TARGET_PROFILE_SCORES: Record<
  RiskProfile,
  {
    targetScore: number;
    minSafeScore: number;
    maxSafeScore: number;
    label: string;
    description: string;
  }
> = {
  konservatif: {
    targetScore: 28,
    minSafeScore: 10,
    maxSafeScore: 38,
    label: 'Konservatif',
    description: 'Fokus keamanan modal & likuiditas instan, toleransi fluktuasi minimal.',
  },
  moderat: {
    targetScore: 50,
    minSafeScore: 40,
    maxSafeScore: 62,
    label: 'Moderat',
    description: 'Keseimbangan pertumbuhan bertahap dan daya tahan terhadap koreksi pasar.',
  },
  agresif: {
    targetScore: 72,
    minSafeScore: 60,
    maxSafeScore: 88,
    label: 'Agresif',
    description: 'Pertumbuhan modal jangka panjang maksimal, siap menghadapi fluktuasi IHSG.',
  },
};

export const PortfolioRiskGauge: React.FC<PortfolioRiskGaugeProps> = ({
  portfolio,
  financialProfile,
  onNavigate,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const totalValue = portfolio?.totalMarketValue || 0;
  const userRiskTolerance: RiskProfile = financialProfile?.riskTolerance || 'moderat';
  const targetConfig = TARGET_PROFILE_SCORES[userRiskTolerance];

  // Calculate actual weighted risk score
  const {
    actualRiskScore,
    pctSaham,
    pctRDSaham,
    pctCampuran,
    pctPendapatanTetap,
    pctPasarUang,
    pctAggressiveTotal,
    pctDefensiveTotal,
  } = useMemo(() => {
    if (totalValue <= 0) {
      return {
        actualRiskScore: targetConfig.targetScore, // Default to profile target when 0
        pctSaham: 0,
        pctRDSaham: 0,
        pctCampuran: 0,
        pctPendapatanTetap: 0,
        pctPasarUang: 0,
        pctAggressiveTotal: 0,
        pctDefensiveTotal: 0,
      };
    }

    const sVal = portfolio.assetAllocation.saham || 0;
    const rdSVal = portfolio.assetAllocation.reksadana_saham || 0;
    const rdCVal = portfolio.assetAllocation.reksadana_campuran || 0;
    const ptVal = portfolio.assetAllocation.reksadana_pendapatan_tetap || 0;
    const puVal = portfolio.assetAllocation.reksadana_pasar_uang || 0;

    const pSaham = (sVal / totalValue) * 100;
    const pRDS = (rdSVal / totalValue) * 100;
    const pRDC = (rdCVal / totalValue) * 100;
    const pPT = (ptVal / totalValue) * 100;
    const pPU = (puVal / totalValue) * 100;

    const weightedScore =
      (pPU * ASSET_RISK_WEIGHTS.reksadana_pasar_uang +
        pPT * ASSET_RISK_WEIGHTS.reksadana_pendapatan_tetap +
        pRDC * ASSET_RISK_WEIGHTS.reksadana_campuran +
        pRDS * ASSET_RISK_WEIGHTS.reksadana_saham +
        pSaham * ASSET_RISK_WEIGHTS.saham) /
      100;

    const roundedScore = Math.max(5, Math.min(98, Math.round(weightedScore)));

    return {
      actualRiskScore: roundedScore,
      pctSaham: pSaham,
      pctRDSaham: pRDS,
      pctCampuran: pRDC,
      pctPendapatanTetap: pPT,
      pctPasarUang: pPU,
      pctAggressiveTotal: pSaham + pRDS + pRDC * 0.5,
      pctDefensiveTotal: pPU + pPT + pRDC * 0.5,
    };
  }, [portfolio, totalValue, targetConfig]);

  // Status analysis: Aligned, Over-risk, or Under-risk
  const { status, statusLabel, statusColor, advice, statusTheme } = useMemo(() => {
    if (totalValue <= 0) {
      return {
        status: 'empty',
        statusLabel: 'Belum Ada Aset Tercatat',
        statusColor: 'text-slate-600 bg-slate-100 border-slate-200',
        statusTheme: 'slate',
        advice:
          'Catat transaksi pertama Anda atau muat data demo untuk melihat kalkulasi risiko dinamis.',
      };
    }

    const diff = actualRiskScore - targetConfig.targetScore;

    if (diff > 8) {
      // Over-risk
      return {
        status: 'over_risk',
        statusLabel: 'Lebih Berisiko (Over-Risk)',
        statusColor: 'text-rose-800 bg-rose-50 border-rose-200',
        statusTheme: 'rose',
        advice: `Porsi aset berisiko tinggi (${(pctSaham + pctRDSaham).toFixed(0)}%) melampaui toleransi profil ${targetConfig.label}. Disarankan melakukan rebalancing dengan menambah instrumen berisiko rendah seperti Reksa Dana Pasar Uang atau Pendapatan Tetap.`,
      };
    } else if (diff < -8) {
      // Under-risk (too defensive)
      return {
        status: 'under_risk',
        statusLabel: 'Terlalu Defensif (Under-Risk)',
        statusColor: 'text-sky-800 bg-sky-50 border-sky-200',
        statusTheme: 'sky',
        advice: `Portofolio sangat didominasi aset defensif (${pctDefensiveTotal.toFixed(0)}%). Potensi imbal hasil jangka panjang Anda mungkin kurang optimal terhadap target pertumbuhan profil ${targetConfig.label}.`,
      };
    } else {
      // Aligned
      return {
        status: 'aligned',
        statusLabel: 'Sangat Selaras (Ideal)',
        statusColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        statusTheme: 'emerald',
        advice: `Distribusi risiko aset portofolio Anda selaras dengan profil risiko ${targetConfig.label}. Pertahankan disiplin alokasi ini saat melakukan investasi rutin bulanan.`,
      };
    }
  }, [actualRiskScore, targetConfig, totalValue, pctSaham, pctRDSaham, pctDefensiveTotal]);

  // Risk Level Category for the actual score
  const scoreCategory = useMemo(() => {
    if (actualRiskScore <= 35) return { name: 'Konservatif / Rendah', color: '#10b981' };
    if (actualRiskScore <= 60) return { name: 'Moderat / Berimbang', color: '#f59e0b' };
    if (actualRiskScore <= 80) return { name: 'Agresif / Pertumbuhan', color: '#f97316' };
    return { name: 'Sangat Agresif / Spekulatif', color: '#e11d48' };
  }, [actualRiskScore]);

  // Needle angle for SVG: 0 to 100 maps to -90deg to +90deg
  const needleRotation = (actualRiskScore - 50) * 1.8;

  // Target Pin coordinate on arc (radius 78, center 120, 115)
  const targetAngleRad = Math.PI - (targetConfig.targetScore / 100) * Math.PI;
  const targetPinX = 120 + 78 * Math.cos(targetAngleRad);
  const targetPinY = 115 - 78 * Math.sin(targetAngleRad);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Portfolio Risk Gauge
            </h3>
            <p className="text-[11px] text-slate-500">
              Skor risiko dinamis vs toleransi profil investor
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetailModal(!showDetailModal)}
          className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
          title="Metodologi Kalkulasi"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Metodologi</span>
        </button>
      </div>

      {/* Explanatory Collapsible */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="my-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Cara InvestMate Menghitung Skor Risiko
              </span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Skor risiko dihitung berdasarkan bobot risiko terukur masing-masing kelas aset:
              <strong> Pasar Uang (12/100)</strong>,
              <strong> Pendapatan Tetap (32/100)</strong>,
              <strong> Reksa Dana Saham (78/100)</strong>, dan
              <strong> Saham BEI (88/100)</strong>. Skor akhir merefleksikan volatilitas riil
              portofolio Anda saat ini dibandingkan target profil risiko Anda (
              <strong className="capitalize">{userRiskTolerance}</strong>).
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Semi-Circular Gauge */}
      <div className="pt-2 pb-1 flex flex-col items-center">
        <div className="relative w-[240px] h-[130px] flex items-center justify-center">
          <svg viewBox="0 0 240 135" className="w-full h-full overflow-visible">
            <defs>
              {/* Radial Multi-stop Gradient along Gauge Arc */}
              <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" /> {/* Konservatif (Emerald) */}
                <stop offset="35%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#f59e0b" /> {/* Moderat (Amber) */}
                <stop offset="75%" stopColor="#f97316" /> {/* Agresif (Orange) */}
                <stop offset="100%" stopColor="#e11d48" /> {/* Spekulatif (Rose) */}
              </linearGradient>

              {/* Needle Glow Shadow */}
              <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Background Arc Track */}
            <path
              d="M 35 115 A 85 85 0 0 1 205 115"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Active Colored Arc */}
            <path
              d="M 35 115 A 85 85 0 0 1 205 115"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Gauge Segment Tick Marks */}
            {[
              { score: 0, label: '0' },
              { score: 35, label: '35' },
              { score: 65, label: '65' },
              { score: 100, label: '100' },
            ].map((tick) => {
              const rad = Math.PI - (tick.score / 100) * Math.PI;
              const x1 = 120 + 94 * Math.cos(rad);
              const y1 = 115 - 94 * Math.sin(rad);
              const x2 = 120 + 100 * Math.cos(rad);
              const y2 = 115 - 100 * Math.sin(rad);
              return (
                <line
                  key={tick.score}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Target Profile Indicator Pin on Arc */}
            <g>
              <circle
                cx={targetPinX}
                cy={targetPinY}
                r="6.5"
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth="2.5"
              >
                <title>{`Target Profil: ${targetConfig.label} (${targetConfig.targetScore})`}</title>
              </circle>
              <circle cx={targetPinX} cy={targetPinY} r="2" fill="#38bdf8" />
            </g>

            {/* Needle Dial (Animated with spring) */}
            <motion.g
              initial={{ rotate: -90 }}
              animate={{ rotate: needleRotation }}
              transition={{
                type: 'spring',
                stiffness: 70,
                damping: 14,
              }}
              style={{ originX: '120px', originY: '115px' }}
              filter="url(#needleShadow)"
            >
              {/* Pointer Needle */}
              <polygon points="117,115 120,40 123,115" fill="#0f172a" />
              <polygon points="118.5,115 120,40 121.5,115" fill="#e11d48" />
            </motion.g>

            {/* Center Hub Nut */}
            <circle cx="120" cy="115" r="10" fill="#0f172a" />
            <circle cx="120" cy="115" r="6" fill="#334155" />
            <circle cx="120" cy="115" r="2.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Big Score Readout & Subtext */}
        <div className="text-center -mt-2">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-3xl font-black tracking-tight text-slate-900">
              {totalValue > 0 ? actualRiskScore : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>

          <div
            className="text-xs font-bold tracking-tight inline-block px-2 py-0.5 rounded-full mt-0.5"
            style={{
              color: scoreCategory.color,
              backgroundColor: `${scoreCategory.color}15`,
            }}
          >
            {totalValue > 0 ? scoreCategory.name : 'Data Portofolio Kosong'}
          </div>
        </div>
      </div>

      {/* Comparison Callout: Actual vs Target Profile */}
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Profil Risiko Anda:{' '}
            <strong className="text-slate-800 capitalize">{targetConfig.label}</strong>
          </span>
          <span className="text-[11px] text-slate-500">
            Target Skor: <strong>{targetConfig.targetScore}</strong> (Rentang:{' '}
            {targetConfig.minSafeScore}–{targetConfig.maxSafeScore})
          </span>
        </div>

        {/* Alignment Status Banner */}
        <div className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${statusColor}`}>
          {status === 'aligned' ? (
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : status === 'over_risk' ? (
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          )}

          <div className="space-y-0.5">
            <div className="font-bold tracking-tight">{statusLabel}</div>
            <p className="text-[11px] leading-relaxed opacity-90">{advice}</p>
          </div>
        </div>

        {/* Asset Class Risk Distribution Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] text-slate-500">Porsi Aset Agresif</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {formatPercent(pctAggressiveTotal)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">Saham BEI & RD Saham</div>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] text-slate-500">Porsi Aset Penyangga</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">
              {formatPercent(pctDefensiveTotal)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">Pasar Uang & Obligasi</div>
          </div>
        </div>

        {/* Action Button to Rebalance Tool */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('portofolio')}
            className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>Buka Saran Rebalancing Portofolio</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
};
