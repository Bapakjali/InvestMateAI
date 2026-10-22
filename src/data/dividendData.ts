/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DividendScheduleItem, HoldingDividendEstimate, PortfolioDividendSummary, PositionHolding, StockQuote } from '../types';

export interface StockDividendProfile {
  symbol: string;
  annualDividendPerShare: number; // in IDR (Rp per lembar)
  payoutRatioPercent: number; // DPR
  frequency: string;
  historicalConsecutiveYears: number; // Dividend Aristocrat index in BEI
  lastPaymentDate: string;
}

export const STOCK_DIVIDEND_PROFILES: Record<string, StockDividendProfile> = {
  BBCA: {
    symbol: 'BBCA',
    annualDividendPerShare: 270,
    payoutRatioPercent: 60.5,
    frequency: '2x per tahun (Interim + Final)',
    historicalConsecutiveYears: 20,
    lastPaymentDate: '2026-04-12',
  },
  BBRI: {
    symbol: 'BBRI',
    annualDividendPerShare: 310,
    payoutRatioPercent: 73.5,
    frequency: '2x per tahun (Interim + Final)',
    historicalConsecutiveYears: 18,
    lastPaymentDate: '2026-03-28',
  },
  BMRI: {
    symbol: 'BMRI',
    annualDividendPerShare: 356,
    payoutRatioPercent: 60.0,
    frequency: '1x per tahun (Final)',
    historicalConsecutiveYears: 17,
    lastPaymentDate: '2026-04-05',
  },
  BBNI: {
    symbol: 'BBNI',
    annualDividendPerShare: 280,
    payoutRatioPercent: 50.0,
    frequency: '1x per tahun (Final)',
    historicalConsecutiveYears: 15,
    lastPaymentDate: '2026-04-02',
  },
  ADRO: {
    symbol: 'ADRO',
    annualDividendPerShare: 425,
    payoutRatioPercent: 55.0,
    frequency: '2x per tahun (Interim + Final)',
    historicalConsecutiveYears: 16,
    lastPaymentDate: '2026-06-08',
  },
  PTBA: {
    symbol: 'PTBA',
    annualDividendPerShare: 375,
    payoutRatioPercent: 82.0,
    frequency: '1x per tahun (Final)',
    historicalConsecutiveYears: 22,
    lastPaymentDate: '2026-06-05',
  },
  PGAS: {
    symbol: 'PGAS',
    annualDividendPerShare: 135,
    payoutRatioPercent: 69.2,
    frequency: '1x per tahun (Final)',
    historicalConsecutiveYears: 14,
    lastPaymentDate: '2026-06-25',
  },
  MEDC: {
    symbol: 'MEDC',
    annualDividendPerShare: 74,
    payoutRatioPercent: 34.1,
    frequency: '2x per tahun (Interim + Final)',
    historicalConsecutiveYears: 6,
    lastPaymentDate: '2026-06-30',
  },
  ASII: {
    symbol: 'ASII',
    annualDividendPerShare: 400,
    payoutRatioPercent: 53.0,
    frequency: '2x per tahun (Interim + Final)',
    historicalConsecutiveYears: 24,
    lastPaymentDate: '2026-05-27',
  },
  TLKM: {
    symbol: 'TLKM',
    annualDividendPerShare: 168,
    payoutRatioPercent: 70.6,
    frequency: '1x per tahun (Final)',
    historicalConsecutiveYears: 25,
    lastPaymentDate: '2026-06-18',
  },
  ICBP: {
    symbol: 'ICBP',
    annualDividendPerShare: 378,
    payoutRatioPercent: 50.0,
    frequency: '1x per tahun (Final)',
    historicalConsecutiveYears: 14,
    lastPaymentDate: '2026-08-07',
  },
};

// Official Schedule of Upcoming & Notable Dividends in BEI
export const IDX_DIVIDEND_CALENDAR: DividendScheduleItem[] = [
  {
    id: 'div-medc-int-2026',
    symbol: 'MEDC',
    name: 'Medco Energi Internasional Tbk',
    dividendType: 'Interim',
    amountPerShare: 28,
    cumDate: '2026-10-24',
    exDate: '2026-10-27',
    recordingDate: '2026-10-28',
    paymentDate: '2026-11-12',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Interim)',
    notes: 'Dividen interim migas dari arus kas kuat Blok Corridor.',
  },
  {
    id: 'div-asii-int-2026',
    symbol: 'ASII',
    name: 'Astra International Tbk',
    dividendType: 'Interim',
    amountPerShare: 98,
    cumDate: '2026-10-09',
    exDate: '2026-10-10',
    recordingDate: '2026-10-13',
    paymentDate: '2026-10-31',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Interim)',
    notes: 'Pencairan dividen tunai interim konsolidasi Astra.',
  },
  {
    id: 'div-bbca-int-2026',
    symbol: 'BBCA',
    name: 'Bank Central Asia Tbk',
    dividendType: 'Interim',
    amountPerShare: 45,
    cumDate: '2026-11-20',
    exDate: '2026-11-23',
    recordingDate: '2026-11-24',
    paymentDate: '2026-12-10',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Interim)',
    notes: 'Dividen tunai interim rutin bank swasta terbesar.',
  },
  {
    id: 'div-bbri-int-2026',
    symbol: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    dividendType: 'Interim',
    amountPerShare: 90,
    cumDate: '2026-12-15',
    exDate: '2026-12-16',
    recordingDate: '2026-12-17',
    paymentDate: '2027-01-08',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Interim)',
    notes: 'Dividen interim mikro dengan yield menarik di atas bunga deposito.',
  },
  {
    id: 'div-adro-int-2026',
    symbol: 'ADRO',
    name: 'Alamtri Resources Indonesia Tbk (Adaro)',
    dividendType: 'Interim',
    amountPerShare: 180,
    cumDate: '2026-12-28',
    exDate: '2026-12-29',
    recordingDate: '2026-12-30',
    paymentDate: '2027-01-14',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Interim)',
    notes: 'Dividen tunai interim batubara jumbo dari kas internal berlimpah.',
  },
  {
    id: 'div-bbri-fin-2027',
    symbol: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    dividendType: 'Final',
    amountPerShare: 220,
    cumDate: '2027-03-12',
    exDate: '2027-03-13',
    recordingDate: '2027-03-14',
    paymentDate: '2027-03-28',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Final RUPS)',
    notes: 'Musim dividen perbankan BUMN pasca RUPS Tahunan.',
  },
  {
    id: 'div-bmri-fin-2027',
    symbol: 'BMRI',
    name: 'Bank Mandiri Tbk',
    dividendType: 'Final',
    amountPerShare: 356,
    cumDate: '2027-03-18',
    exDate: '2027-03-19',
    recordingDate: '2027-03-20',
    paymentDate: '2027-04-05',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Final RUPS)',
    notes: 'Dividen tunai tahunan penuh dari rekor laba bersih Mandiri.',
  },
  {
    id: 'div-bbca-fin-2027',
    symbol: 'BBCA',
    name: 'Bank Central Asia Tbk',
    dividendType: 'Final',
    amountPerShare: 225,
    cumDate: '2027-03-22',
    exDate: '2027-03-25',
    recordingDate: '2027-03-26',
    paymentDate: '2027-04-12',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Final RUPS)',
    notes: 'Dividen final tahunan BCA pasca persetujuan RUPS.',
  },
  {
    id: 'div-bbni-fin-2027',
    symbol: 'BBNI',
    name: 'Bank Negara Indonesia Tbk',
    dividendType: 'Final',
    amountPerShare: 280,
    cumDate: '2027-03-14',
    exDate: '2027-03-17',
    recordingDate: '2027-03-18',
    paymentDate: '2027-04-02',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Final RUPS)',
    notes: 'Dividen tahunan BNI dengan payout ratio 50%.',
  },
  {
    id: 'div-ptba-fin-2027',
    symbol: 'PTBA',
    name: 'Bukit Asam Tbk',
    dividendType: 'Final',
    amountPerShare: 375,
    cumDate: '2027-05-18',
    exDate: '2027-05-19',
    recordingDate: '2027-05-20',
    paymentDate: '2027-06-05',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Final RUPS)',
    notes: 'Dividen payout ratio historis super-tinggi (80-100%).',
  },
  {
    id: 'div-adro-fin-2027',
    symbol: 'ADRO',
    name: 'Alamtri Resources Indonesia Tbk (Adaro)',
    dividendType: 'Final',
    amountPerShare: 245,
    cumDate: '2027-05-20',
    exDate: '2027-05-21',
    recordingDate: '2027-05-22',
    paymentDate: '2027-06-08',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Final RUPS)',
    notes: 'Dividen pelengkap tahunan Adaro Energy.',
  },
  {
    id: 'div-tlkm-fin-2027',
    symbol: 'TLKM',
    name: 'Telkom Indonesia Tbk',
    dividendType: 'Final',
    amountPerShare: 168,
    cumDate: '2027-05-28',
    exDate: '2027-05-29',
    recordingDate: '2027-06-02',
    paymentDate: '2027-06-18',
    status: 'Upcoming',
    payoutPeriod: 'Tahun Buku 2026 (Final RUPS)',
    notes: 'Dividen defensif telekomunikasi dan fixed broadband.',
  },
];

/**
 * Calculate dynamic dividend metrics across the user's actual stock holdings
 */
export function calculatePortfolioDividends(
  holdings: PositionHolding[],
  stocksMap: Record<string, StockQuote> = {}
): PortfolioDividendSummary {
  const stockHoldings = holdings.filter((h) => h.assetType === 'saham' && h.totalSharesOrUnits > 0);
  const totalStockValue = stockHoldings.reduce((sum, h) => sum + h.currentMarketValue, 0);

  const calculatedHoldings: HoldingDividendEstimate[] = stockHoldings.map((h) => {
    const quote = stocksMap[h.symbol];
    const profile = STOCK_DIVIDEND_PROFILES[h.symbol];

    // Determine annual dividend per share
    let annualDps = 0;
    if (profile?.annualDividendPerShare) {
      annualDps = profile.annualDividendPerShare;
    } else if (quote?.dividendYield && quote.price > 0) {
      annualDps = Math.round((quote.dividendYield / 100) * quote.price);
    }

    const currentPrice = quote?.price || h.currentPrice || h.averagePrice;
    const marketYield = currentPrice > 0 ? (annualDps / currentPrice) * 100 : quote?.dividendYield || 0;
    const yieldOnCost = h.averagePrice > 0 ? (annualDps / h.averagePrice) * 100 : marketYield;

    const totalShares = h.totalSharesOrUnits; // 1 lot = 100 shares
    const estimatedAnnual = totalShares * annualDps;
    const estimatedMonthly = estimatedAnnual / 12;

    // Find next upcoming dividend for this specific stock
    const nextDiv = IDX_DIVIDEND_CALENDAR.find((d) => d.symbol === h.symbol && d.status === 'Upcoming');

    const weightPercent = totalStockValue > 0 ? (h.currentMarketValue / totalStockValue) * 100 : 0;

    return {
      symbol: h.symbol,
      assetName: h.assetName,
      totalLots: h.totalLotsOrUnits,
      totalShares,
      averagePrice: h.averagePrice,
      currentPrice,
      currentMarketValue: h.currentMarketValue,
      totalInvestedCost: h.totalInvestedCost,
      annualDividendPerShare: annualDps,
      marketDividendYield: parseFloat(marketYield.toFixed(2)),
      yieldOnCost: parseFloat(yieldOnCost.toFixed(2)),
      estimatedAnnualDividend: Math.round(estimatedAnnual),
      estimatedMonthlyDividend: Math.round(estimatedMonthly),
      nextUpcomingDividend: nextDiv,
      portfolioWeightPercent: parseFloat(weightPercent.toFixed(1)),
    };
  });

  const totalEstimatedAnnual = calculatedHoldings.reduce((sum, h) => sum + h.estimatedAnnualDividend, 0);
  const totalEstimatedMonthly = Math.round(totalEstimatedAnnual / 12);

  // Weighted average dividend yield
  let weightedMarketYield = 0;
  let weightedYieldOnCost = 0;

  if (totalStockValue > 0) {
    weightedMarketYield = calculatedHoldings.reduce(
      (sum, h) => sum + (h.currentMarketValue / totalStockValue) * h.marketDividendYield,
      0
    );
    const totalInvestedCost = calculatedHoldings.reduce((sum, h) => sum + h.totalInvestedCost, 0);
    if (totalInvestedCost > 0) {
      weightedYieldOnCost = calculatedHoldings.reduce(
        (sum, h) => sum + (h.totalInvestedCost / totalInvestedCost) * h.yieldOnCost,
        0
      );
    } else {
      weightedYieldOnCost = weightedMarketYield;
    }
  }

  // Map user shares and cash to calendar schedules
  const mappedSchedules = IDX_DIVIDEND_CALENDAR.map((item) => {
    const userHolding = calculatedHoldings.find((h) => h.symbol === item.symbol);
    const userShares = userHolding ? userHolding.totalShares : 0;
    const userEstimatedCash = userShares * item.amountPerShare;
    return {
      ...item,
      userShares,
      userEstimatedCash: Math.round(userEstimatedCash),
    };
  }).sort((a, b) => new Date(a.cumDate).getTime() - new Date(b.cumDate).getTime());

  return {
    totalEstimatedAnnualDividend: Math.round(totalEstimatedAnnual),
    totalEstimatedMonthlyDividend: totalEstimatedMonthly,
    averageMarketYield: parseFloat(weightedMarketYield.toFixed(2)),
    averageYieldOnCost: parseFloat(weightedYieldOnCost.toFixed(2)),
    totalStockPortfolioValue: totalStockValue,
    holdings: calculatedHoldings.sort((a, b) => b.estimatedAnnualDividend - a.estimatedAnnualDividend),
    upcomingSchedules: mappedSchedules,
  };
}
