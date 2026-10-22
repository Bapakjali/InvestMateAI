/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  calculatePortfolio,
  evaluateFinancialHealth,
  runInvestmentSimulation,
  formatRupiah,
  formatPercent,
} from '../financialCalculations';
import { PortfolioTransaction, UserFinancialProfile } from '../../types';
import { INITIAL_STOCK_QUOTES, INITIAL_MUTUAL_FUNDS } from '../../data/marketData';

export function runAllUnitTests() {
  const results: { testName: string; passed: boolean; message?: string }[] = [];

  function assert(condition: boolean, testName: string, errorMsg?: string) {
    if (condition) {
      results.push({ testName, passed: true });
    } else {
      results.push({ testName, passed: false, message: errorMsg || 'Assertion failed' });
    }
  }

  // Test 1: Indonesian Formatting
  try {
    assert(formatRupiah(1500000) === 'Rp 1.500.000', 'formatRupiah positive number');
    assert(formatRupiah(-50000) === '-Rp 50.000', 'formatRupiah negative number');
    assert(formatPercent(12.5) === '+12,50%', 'formatPercent positive with comma');
  } catch (err: any) {
    results.push({ testName: 'Indonesian Formatting', passed: false, message: err.message });
  }

  // Test 2: Stock Lot Size & Average Price & Realized PnL Calculation
  try {
    // Buy 2 lots (200 shares) BBCA at Rp 10.000 with Rp 3.000 fee = total Rp 2.003.000
    // Buy 1 lot (100 shares) BBCA at Rp 11.000 with Rp 1.500 fee = total Rp 1.101.500
    // Total 300 shares, total cost = Rp 3.104.500, average cost per share = Rp 10.348,33
    const txs: PortfolioTransaction[] = [
      {
        id: 'tx-1',
        userId: 'u1',
        assetType: 'saham',
        symbol: 'BBCA',
        assetName: 'Bank Central Asia Tbk',
        type: 'beli',
        date: '2026-08-01',
        unitsOrLots: 2,
        sharesOrUnitsCount: 200,
        pricePerUnit: 10000,
        fee: 3000,
        totalAmount: 2003000,
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'tx-2',
        userId: 'u1',
        assetType: 'saham',
        symbol: 'BBCA',
        assetName: 'Bank Central Asia Tbk',
        type: 'beli',
        date: '2026-08-15',
        unitsOrLots: 1,
        sharesOrUnitsCount: 100,
        pricePerUnit: 11000,
        fee: 1500,
        totalAmount: 1101500,
        createdAt: '2026-08-15T10:00:00Z',
      },
    ];

    const summaryBeforeSell = calculatePortfolio(txs, INITIAL_STOCK_QUOTES, INITIAL_MUTUAL_FUNDS);
    assert(summaryBeforeSell.holdings.length === 1, 'Holdings count is 1');
    assert(summaryBeforeSell.holdings[0].totalSharesOrUnits === 300, 'Total shares held is 300');
    assert(summaryBeforeSell.holdings[0].totalLotsOrUnits === 3, 'Total lots held is 3');

    // Sell 1 lot (100 shares) at Rp 12.000, fee Rp 2.000 -> net proceeds Rp 1.198.000
    const sellTx: PortfolioTransaction = {
      id: 'tx-3',
      userId: 'u1',
      assetType: 'saham',
      symbol: 'BBCA',
      assetName: 'Bank Central Asia Tbk',
      type: 'jual',
      date: '2026-09-01',
      unitsOrLots: 1,
      sharesOrUnitsCount: 100,
      pricePerUnit: 12000,
      fee: 2000,
      totalAmount: 1198000,
      createdAt: '2026-09-01T10:00:00Z',
    };

    const summaryAfterSell = calculatePortfolio([...txs, sellTx], INITIAL_STOCK_QUOTES, INITIAL_MUTUAL_FUNDS);
    assert(summaryAfterSell.holdings[0].totalSharesOrUnits === 200, 'Remaining shares after partial sale is 200');
    assert(summaryAfterSell.realizedPnL > 0, 'Realized gain is positive on profitable sale');
  } catch (err: any) {
    results.push({ testName: 'Portfolio Math and Average Price', passed: false, message: err.message });
  }

  // Test 3: Financial Health Check Evaluation
  try {
    const deficitProfile: UserFinancialProfile = {
      userId: 'u-def',
      monthlyIncome: 8000000,
      monthlyExpenses: 7000000,
      familyDependents: 1,
      debtInstallments: 3500000, // debt ratio = 43.7% (> 35%)
      emergencyFund: 5000000, // < 1 month
      availableCapital: 1000000,
      monthlyInvestCapacity: 0,
      investmentGoal: 'Pensiun',
      timeHorizonYears: 10,
      riskTolerance: 'konservatif',
      experienceLevel: 'pemula',
      liquidityNeeds: 'tinggi',
      updatedAt: '2026-10-18',
    };

    const healthEval = evaluateFinancialHealth(deficitProfile);
    assert(
      healthEval.status === 'Prioritas Kebutuhan Pokok' || healthEval.status === 'Selesaikan Kewajiban Mendesak',
      'High debt and deficit triggers urgent debt / living priority'
    );
    assert(healthEval.safeMonthlyInvestmentAmount <= 0, 'Safe monthly investment is zero or restrained when cash flow is negative');

    // Healthy profile
    const healthyProfile: UserFinancialProfile = {
      userId: 'u-health',
      monthlyIncome: 20000000,
      monthlyExpenses: 8000000,
      familyDependents: 0,
      debtInstallments: 1000000, // 5% debt ratio
      emergencyFund: 50000000, // 6.25 months
      availableCapital: 20000000,
      monthlyInvestCapacity: 5000000,
      investmentGoal: 'Bebas Finansial',
      timeHorizonYears: 10,
      riskTolerance: 'moderat',
      experienceLevel: 'pemula',
      liquidityNeeds: 'sedang',
      updatedAt: '2026-10-18',
    };

    const healthyEval = evaluateFinancialHealth(healthyProfile);
    assert(
      healthyEval.status === 'Tingkatkan Investasi' || healthyEval.status === 'Mulai Berinvestasi Bertahap',
      'Solid emergency fund and low debt enables regular investing'
    );
    assert(healthyEval.safeMonthlyInvestmentAmount > 0, 'Safe investment amount is strictly positive');
  } catch (err: any) {
    results.push({ testName: 'Financial Health Check Evaluation', passed: false, message: err.message });
  }

  // Test 4: Investment Simulator
  try {
    const sim = runInvestmentSimulation(
      10000000, // initial Rp 10jt
      1000000, // monthly Rp 1jt
      5, // 5 years
      3, // pessimistic
      7, // moderate
      12 // optimistic
    );

    assert(sim.totalPrincipalInvested === 70000000, 'Total principal is 10jt + 60*1jt = 70jt');
    assert(sim.pessimistic < sim.moderate, 'Pessimistic value is less than moderate');
    assert(sim.moderate < sim.optimistic, 'Moderate value is less than optimistic');
    assert(sim.yearlyBreakdown.length === 5, 'Yearly breakdown contains 5 entries');
  } catch (err: any) {
    results.push({ testName: 'Investment Simulator Calculation', passed: false, message: err.message });
  }

  return results;
}
