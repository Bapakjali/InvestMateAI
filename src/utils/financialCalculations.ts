/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PortfolioTransaction,
  PositionHolding,
  PortfolioSummary,
  UserFinancialProfile,
  FinancialHealthEvaluation,
  StockQuote,
  MutualFund,
} from '../types';

/**
 * Format number into Indonesian Rupiah format (e.g., Rp 1.500.000)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  const formatted = absAmount.toLocaleString('id-ID');
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Format percentage into Indonesian format with comma decimal (e.g., +12,50%)
 */
export function formatPercent(value: number, showSign = true): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0,00%';
  }
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2).replace('.', ',')}%`;
}

/**
 * Format general numbers with Indonesian separators
 */
export function formatNumber(val: number, maxDecimals = 2): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return val.toLocaleString('id-ID', { maximumFractionDigits: maxDecimals });
}

/**
 * Format Date to Asia/Jakarta local date string (e.g., 18 Okt 2026, 14:30 WIB)
 */
export function formatDateIndo(dateStr: string, includeTime = false): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };
    const formatted = new Intl.DateTimeFormat('id-ID', options).format(d);
    return includeTime ? `${formatted} WIB` : formatted;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate portfolio summary and per-asset holdings from raw transactions
 */
export function calculatePortfolio(
  transactions: PortfolioTransaction[],
  currentStockQuotes: Record<string, StockQuote>,
  currentMutualFunds: Record<string, MutualFund>
): PortfolioSummary {
  // Sort transactions chronologically
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  interface AssetLedger {
    symbol: string;
    assetName: string;
    assetType: 'saham' | 'reksadana';
    category: string;
    currentSharesOrUnits: number; // raw units (e.g. shares or fund units)
    totalCostBasis: number; // IDR invested for currently held units
    realizedPnL: number;
  }

  const ledgers: Record<string, AssetLedger> = {};
  let totalRealizedPnL = 0;

  for (const tx of sortedTx) {
    if (!ledgers[tx.symbol]) {
      ledgers[tx.symbol] = {
        symbol: tx.symbol,
        assetName: tx.assetName,
        assetType: tx.assetType,
        category: tx.category || (tx.assetType === 'saham' ? 'Saham BEI' : 'Reksa Dana'),
        currentSharesOrUnits: 0,
        totalCostBasis: 0,
        realizedPnL: 0,
      };
    }

    const ledger = ledgers[tx.symbol];
    const sharesCount = tx.sharesOrUnitsCount || (tx.assetType === 'saham' ? tx.unitsOrLots * 100 : tx.unitsOrLots);

    if (tx.type === 'beli') {
      // Add purchase cost basis including fee
      ledger.totalCostBasis += tx.totalAmount;
      ledger.currentSharesOrUnits += sharesCount;
    } else if (tx.type === 'jual') {
      if (ledger.currentSharesOrUnits > 0) {
        // Average cost of units sold
        const avgCostPerUnit = ledger.totalCostBasis / ledger.currentSharesOrUnits;
        const soldCost = avgCostPerUnit * Math.min(sharesCount, ledger.currentSharesOrUnits);
        const netProceeds = tx.totalAmount; // revenue minus fee
        const tradeRealizedPnL = netProceeds - soldCost;

        ledger.realizedPnL += tradeRealizedPnL;
        totalRealizedPnL += tradeRealizedPnL;

        ledger.currentSharesOrUnits = Math.max(0, ledger.currentSharesOrUnits - sharesCount);
        ledger.totalCostBasis = Math.max(0, ledger.totalCostBasis - soldCost);
      }
    }
  }

  const holdings: PositionHolding[] = [];
  let totalMarketValue = 0;
  let totalNetInvested = 0;

  for (const symbol in ledgers) {
    const item = ledgers[symbol];
    if (item.currentSharesOrUnits <= 0.0001) continue;

    let currentPrice = 0;
    let category = item.category;
    let dataStatus = 'Aktual (IDX/MI)';

    if (item.assetType === 'saham') {
      const stock = currentStockQuotes[symbol];
      if (stock) {
        currentPrice = stock.price;
        category = `Saham (${stock.sector})`;
        dataStatus = stock.dataStatus;
      } else {
        currentPrice = item.totalCostBasis / item.currentSharesOrUnits; // fallback to cost
        dataStatus = 'Estimasi (Harga Beli)';
      }
    } else {
      const fund = currentMutualFunds[symbol];
      if (fund) {
        currentPrice = fund.navPerUnit;
        category = fund.categoryLabel;
        dataStatus = fund.dataStatus;
      } else {
        currentPrice = item.totalCostBasis / item.currentSharesOrUnits;
        dataStatus = 'Estimasi (Harga Beli)';
      }
    }

    const currentMarketVal = item.currentSharesOrUnits * currentPrice;
    const avgPrice = item.currentSharesOrUnits > 0 ? item.totalCostBasis / item.currentSharesOrUnits : 0;
    const unrealized = currentMarketVal - item.totalCostBasis;
    const unrealizedPct = item.totalCostBasis > 0 ? (unrealized / item.totalCostBasis) * 100 : 0;

    totalMarketValue += currentMarketVal;
    totalNetInvested += item.totalCostBasis;

    holdings.push({
      symbol: item.symbol,
      assetName: item.assetName,
      assetType: item.assetType,
      category,
      totalLotsOrUnits: item.assetType === 'saham' ? item.currentSharesOrUnits / 100 : item.currentSharesOrUnits,
      totalSharesOrUnits: item.currentSharesOrUnits,
      averagePrice: avgPrice,
      totalInvestedCost: item.totalCostBasis,
      currentPrice,
      currentMarketValue: currentMarketVal,
      unrealizedPnL: unrealized,
      unrealizedPnLPercent: unrealizedPct,
      allocationPercent: 0, // computed below
      dataStatus,
    });
  }

  // Calculate allocation percentages
  holdings.forEach((h) => {
    h.allocationPercent = totalMarketValue > 0 ? (h.currentMarketValue / totalMarketValue) * 100 : 0;
  });

  // Calculate asset allocations by macro category
  const assetAllocation = {
    saham: 0,
    reksadana_pasar_uang: 0,
    reksadana_pendapatan_tetap: 0,
    reksadana_campuran: 0,
    reksadana_saham: 0,
  };

  holdings.forEach((h) => {
    if (h.assetType === 'saham') {
      assetAllocation.saham += h.currentMarketValue;
    } else {
      const fund = currentMutualFunds[h.symbol];
      if (fund) {
        if (fund.category === 'pasar_uang') assetAllocation.reksadana_pasar_uang += h.currentMarketValue;
        else if (fund.category === 'pendapatan_tetap') assetAllocation.reksadana_pendapatan_tetap += h.currentMarketValue;
        else if (fund.category === 'campuran') assetAllocation.reksadana_campuran += h.currentMarketValue;
        else assetAllocation.reksadana_saham += h.currentMarketValue;
      } else {
        assetAllocation.reksadana_pasar_uang += h.currentMarketValue;
      }
    }
  });

  const unrealizedPnL = totalMarketValue - totalNetInvested;
  const unrealizedPnLPercent = totalNetInvested > 0 ? (unrealizedPnL / totalNetInvested) * 100 : 0;

  return {
    totalMarketValue,
    totalNetInvested,
    unrealizedPnL,
    unrealizedPnLPercent,
    realizedPnL: totalRealizedPnL,
    assetAllocation,
    holdings,
    transactionsCount: sortedTx.length,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Evaluate financial health based on user's profile
 */
export function evaluateFinancialHealth(profile: UserFinancialProfile): FinancialHealthEvaluation {
  const income = profile.monthlyIncome || 0;
  const expenses = profile.monthlyExpenses || 0;
  const debts = profile.debtInstallments || 0;
  const emergencyFund = profile.emergencyFund || 0;
  const dependents = profile.familyDependents || 0;

  const totalOutflow = expenses + debts;
  const monthlySurplus = income - totalOutflow;

  const expenseRatio = income > 0 ? (expenses / income) * 100 : 100;
  const debtServiceRatio = income > 0 ? (debts / income) * 100 : 0;

  // Recommended emergency fund:
  // Single/no dependents: 3-6 months expenses
  // With dependents: 6-12 months expenses
  const targetEmergencyFundMonths = dependents > 0 ? 6 + dependents * 2 : 6;
  const monthlyBaseNeed = expenses > 0 ? expenses : 1;
  const emergencyFundMonths = emergencyFund / monthlyBaseNeed;

  let status: FinancialHealthEvaluation['status'] = 'Mulai Berinvestasi Bertahap';
  let summary = '';
  const actionItems: string[] = [];
  const warnings: string[] = [];
  let safeMonthlyInvestmentAmount = 0;

  if (monthlySurplus <= 0) {
    status = 'Prioritas Kebutuhan Pokok';
    summary = 'Arus kas bulanan defisit atau seimbang tipis. Tidak disarankan berinvestasi saat ini.';
    warnings.push('Hindari memaksakan investasi saat pengeluaran melebihi penghasilan bersih.');
    actionItems.push('Evaluasi dan pangkas pengeluaran non-primer.');
    actionItems.push('Cari peluang pendapatan tambahan sebelum memulai investasi.');
    safeMonthlyInvestmentAmount = 0;
  } else if (debtServiceRatio > 35) {
    status = 'Selesaikan Kewajiban Mendesak';
    summary = `Rasio cicilan utang (${debtServiceRatio.toFixed(1)}%) sudah di atas batas aman ideal (<30-35%). Prioritaskan melunasi cicilan berbunga tinggi.`;
    warnings.push('Bunga utang konsumtif atau pinjaman umumnya jauh lebih tinggi daripada rata-rata return investasi.');
    actionItems.push('Alokasikan sebagian besar surplus bulanan untuk mempercepat pelunasan pokok utang.');
    actionItems.push('Hindari menambah utang baru selama masa penyehatan keuangan.');
    safeMonthlyInvestmentAmount = Math.max(0, monthlySurplus * 0.15); // Maksimal 15% surplus jika tetap ingin belajar
  } else if (emergencyFundMonths < (dependents > 0 ? 4 : 3)) {
    status = 'Bangun Dana Darurat';
    summary = `Dana darurat saat ini baru mencukupi ${emergencyFundMonths.toFixed(1)} bulan pengeluaran (target aman: ${targetEmergencyFundMonths} bulan).`;
    warnings.push('Tanpa dana darurat cukup, Anda berisiko terpaksa menjual aset investasi saat pasar anjlok.');
    actionItems.push(`Simpan dana darurat di instrumen likuid & aman seperti Reksa Dana Pasar Uang atau rekening terpisah.`);
    actionItems.push('Alokasikan 70% surplus bulanan untuk dana darurat, dan maksimal 30% untuk mulai investasi pemula.');
    safeMonthlyInvestmentAmount = Math.max(0, monthlySurplus * 0.3);
  } else if (emergencyFundMonths >= targetEmergencyFundMonths && debtServiceRatio <= 20) {
    status = 'Tingkatkan Investasi';
    summary = 'Kondisi keuangan sangat sehat! Dana darurat ideal dan cicilan rendah. Siap mengoptimalkan alokasi aset.';
    actionItems.push('Rancang alokasi aset terstruktur antara Saham BEI dan Reksa Dana sesuai tujuan jangka panjang.');
    actionItems.push('Lakukan Dollar-Cost Averaging (DCA) secara disiplin setiap bulan setelah gajian.');
    safeMonthlyInvestmentAmount = Math.max(0, monthlySurplus * 0.7);
  } else {
    status = 'Mulai Berinvestasi Bertahap';
    summary = 'Fondasi keuangan cukup baik untuk mulai berinvestasi secara terukur dan disiplin.';
    actionItems.push('Mulai dari instrumen berisiko rendah seperti Reksa Dana Pasar Uang atau Pendapatan Tetap.');
    actionItems.push('Sisihkan nominal rutin yang tidak mengganggu likuiditas harian.');
    safeMonthlyInvestmentAmount = Math.max(0, monthlySurplus * 0.5);
  }

  return {
    monthlySurplus,
    expenseRatio,
    debtServiceRatio,
    emergencyFundMonths,
    targetEmergencyFundMonths,
    status,
    summary,
    actionItems,
    safeMonthlyInvestmentAmount,
    warnings,
  };
}

/**
 * Investment Simulator Calculation
 */
export interface SimulationScenarioResult {
  pessimistic: number;
  moderate: number;
  optimistic: number;
  totalPrincipalInvested: number;
  yearlyBreakdown: {
    year: number;
    principal: number;
    pessimisticVal: number;
    moderateVal: number;
    optimisticVal: number;
  }[];
}

export function runInvestmentSimulation(
  initialCapital: number,
  monthlyContribution: number,
  years: number,
  annualPessimisticRate: number, // e.g. 3% (pasar uang rendah / bear market)
  annualModerateRate: number, // e.g. 7% (balanced / pendapatan tetap)
  annualOptimisticRate: number, // e.g. 12% (saham bertumbuh)
  annualInflation = 3.5,
  annualFee = 0.5
): SimulationScenarioResult {
  const yearlyBreakdown: SimulationScenarioResult['yearlyBreakdown'] = [];

  // Effective net rates after fee
  const netPessimistic = (annualPessimisticRate - annualFee) / 100;
  const netModerate = (annualModerateRate - annualFee) / 100;
  const netOptimistic = (annualOptimisticRate - annualFee) / 100;

  const monthlyPessimisticRate = Math.pow(1 + Math.max(-0.5, netPessimistic), 1 / 12) - 1;
  const monthlyModerateRate = Math.pow(1 + Math.max(-0.5, netModerate), 1 / 12) - 1;
  const monthlyOptimisticRate = Math.pow(1 + Math.max(-0.5, netOptimistic), 1 / 12) - 1;

  let pVal = initialCapital;
  let mVal = initialCapital;
  let oVal = initialCapital;
  let principal = initialCapital;

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      principal += monthlyContribution;
      pVal = (pVal + monthlyContribution) * (1 + monthlyPessimisticRate);
      mVal = (mVal + monthlyContribution) * (1 + monthlyModerateRate);
      oVal = (oVal + monthlyContribution) * (1 + monthlyOptimisticRate);
    }
    yearlyBreakdown.push({
      year,
      principal: Math.round(principal),
      pessimisticVal: Math.round(pVal),
      moderateVal: Math.round(mVal),
      optimisticVal: Math.round(oVal),
    });
  }

  return {
    pessimistic: Math.round(pVal),
    moderate: Math.round(mVal),
    optimistic: Math.round(oVal),
    totalPrincipalInvested: Math.round(principal),
    yearlyBreakdown,
  };
}
