/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskProfile = 'konservatif' | 'moderat' | 'agresif';
export type ExperienceLevel = 'pemula' | 'menengah' | 'berpengalaman';
export type AssetType = 'saham' | 'reksadana';
export type FundCategory = 'pasar_uang' | 'pendapatan_tetap' | 'campuran' | 'saham';
export type TransactionType = 'beli' | 'jual';

export interface UserFinancialProfile {
  id?: string;
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  familyDependents: number;
  debtInstallments: number;
  debtNotes?: string;
  emergencyFund: number;
  availableCapital: number;
  monthlyInvestCapacity: number;
  investmentGoal: string;
  timeHorizonYears: number;
  riskTolerance: RiskProfile;
  experienceLevel: ExperienceLevel;
  liquidityNeeds: string;
  updatedAt: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  sector: string;
  subSector: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  lotSize: number; // 100 lembar per lot di BEI
  marketCap: number; // in IDR
  per: number;
  pbv: number;
  roe: number;
  der: number;
  dividendYield: number;
  eps: number;
  revenue: number;
  netProfit: number;
  operatingCashFlow: number;
  revenueGrowthYoY: number;
  netMargin: number;
  financialReportPeriod: string;
  dataTimestamp: string;
  dataSource: string;
  dataStatus: 'Aktual' | 'Tertunda' | 'Historis' | 'Input Manual' | 'Demo';
  technical: {
    rsi14: number;
    ma20: number;
    ma50: number;
    macd: {
      macdLine: number;
      signalLine: number;
      histogram: number;
    };
    support: number;
    resistance: number;
    volume: number;
    trend: 'Uptrend' | 'Downtrend' | 'Sideways';
    priceHistory: { date: string; close: number; volume: number }[];
  };
  businessSummary: string;
  strengths: string[];
  weaknesses: string[];
  keyRisks: string[];
  disclosures: {
    date: string;
    title: string;
    source: string;
  }[];
}

export interface MutualFund {
  id: string;
  name: string;
  fundManager: string;
  category: FundCategory;
  categoryLabel: string;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi';
  navPerUnit: number;
  aum: number; // in IDR
  minBuyAmount: number;
  expenseRatio: number;
  drawdown1Y: number;
  returns: {
    m1: number;
    m6: number;
    y1: number;
    y3: number;
    y5: number;
  };
  benchmark: string;
  custodianBank: string;
  launchDate: string;
  dataTimestamp: string;
  dataSource: string;
  dataStatus: 'Aktual' | 'Tertunda' | 'Historis' | 'Input Manual' | 'Demo';
  topHoldings?: string[];
  description: string;
  suitableFor: string;
  navHistory: { date: string; nav: number }[];
}

export interface PortfolioTransaction {
  id: string;
  userId: string;
  assetType: AssetType;
  symbol: string; // Stock symbol (e.g. BBCA) or Fund ID
  assetName: string;
  category?: string;
  type: TransactionType;
  date: string;
  unitsOrLots: number; // Lots for stocks, Units for mutual funds
  sharesOrUnitsCount: number; // Actual units/shares (lots * 100 for stocks)
  pricePerUnit: number; // Price per share or NAV per unit
  fee: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

export interface PositionHolding {
  symbol: string;
  assetName: string;
  assetType: AssetType;
  category: string;
  totalLotsOrUnits: number;
  totalSharesOrUnits: number;
  averagePrice: number;
  totalInvestedCost: number;
  currentPrice: number;
  currentMarketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocationPercent: number;
  dataStatus: string;
}

export interface PortfolioSummary {
  totalMarketValue: number;
  totalNetInvested: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  assetAllocation: {
    saham: number;
    reksadana_pasar_uang: number;
    reksadana_pendapatan_tetap: number;
    reksadana_campuran: number;
    reksadana_saham: number;
  };
  holdings: PositionHolding[];
  transactionsCount: number;
  lastUpdated: string;
}

export interface FinancialHealthEvaluation {
  monthlySurplus: number;
  expenseRatio: number; // expenses / income
  debtServiceRatio: number; // debt / income
  emergencyFundMonths: number;
  targetEmergencyFundMonths: number;
  status: 'Prioritas Kebutuhan Pokok' | 'Selesaikan Kewajiban Mendesak' | 'Bangun Dana Darurat' | 'Mulai Berinvestasi Bertahap' | 'Tingkatkan Investasi';
  summary: string;
  actionItems: string[];
  safeMonthlyInvestmentAmount: number;
  warnings: string[];
}

export interface WatchlistRecord {
  id: string;
  userId: string;
  symbol: string;
  assetName: string;
  assetType: AssetType;
  category?: string;
  addedAt: string;
  notes?: string;
  currentPrice?: number;
  priceChange?: number;
}

export interface AiAnalysisRecord {
  id: string;
  userId: string;
  topic: string;
  assetSymbol?: string;
  prompt: string;
  response: string;
  statusBadge?: 'Menarik untuk dipelajari' | 'Masuk daftar pantauan' | 'Perlu analisis lebih lanjut' | 'Risiko tinggi untuk profil' | 'Data belum mencukupi';
  createdAt: string;
}

export interface InvestmentGoalItem {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetYear: number;
  category: string;
  createdAt: string;
}

export type AlertCondition = 'above_or_equal' | 'below_or_equal';
export type AlertStatus = 'active' | 'triggered' | 'dismissed';

export interface PriceAlertItem {
  id: string;
  userId: string;
  symbol: string;
  assetName: string;
  assetType: AssetType;
  targetPrice: number;
  condition: AlertCondition;
  initialPrice: number;
  currentPrice?: number;
  isEnabled: boolean;
  status: AlertStatus;
  createdAt: string;
  triggeredAt?: string;
  lastNotifiedPrice?: number;
  note?: string;
}

export type DividendType = 'Interim' | 'Final';

export interface DividendScheduleItem {
  id: string;
  symbol: string;
  name: string;
  dividendType: DividendType;
  amountPerShare: number; // in IDR (Rp per lembar)
  cumDate: string; // YYYY-MM-DD
  exDate: string; // YYYY-MM-DD
  recordingDate: string; // YYYY-MM-DD
  paymentDate: string; // YYYY-MM-DD
  status: 'Upcoming' | 'Past';
  payoutPeriod: string; // e.g. "Tahun Buku 2026"
  notes?: string;
}

export interface HoldingDividendEstimate {
  symbol: string;
  assetName: string;
  totalLots: number;
  totalShares: number; // lots * 100
  averagePrice: number;
  currentPrice: number;
  currentMarketValue: number;
  totalInvestedCost: number;
  annualDividendPerShare: number;
  marketDividendYield: number; // % based on current price
  yieldOnCost: number; // % based on average purchase price
  estimatedAnnualDividend: number; // in IDR
  estimatedMonthlyDividend: number; // annual / 12
  nextUpcomingDividend?: DividendScheduleItem;
  portfolioWeightPercent: number;
}

export interface PortfolioDividendSummary {
  totalEstimatedAnnualDividend: number;
  totalEstimatedMonthlyDividend: number;
  averageMarketYield: number;
  averageYieldOnCost: number;
  totalStockPortfolioValue: number;
  holdings: HoldingDividendEstimate[];
  upcomingSchedules: (DividendScheduleItem & { userEstimatedCash: number; userShares: number })[];
}
