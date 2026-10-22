/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuView } from './components/MobileMenuView';
import { DashboardView } from './components/DashboardView';
import { StockAnalystView } from './components/StockAnalystView';
import { MutualFundView } from './components/MutualFundView';
import { PortfolioView } from './components/PortfolioView';
import { FinancialPlannerView } from './components/FinancialPlannerView';
import { SimulatorView } from './components/SimulatorView';
import { AiAssistantView } from './components/AiAssistantView';
import { AnalysisHistoryView } from './components/AnalysisHistoryView';
import { SettingsView } from './components/SettingsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { CompareFundsModal } from './components/CompareFundsModal';
import { AuthModal } from './components/AuthModal';
import { NotificationManagementModal } from './components/NotificationManagementModal';
import { PriceAlertToast, ToastAlertNotification } from './components/PriceAlertToast';
import { ArrowLeft, Plus, Smartphone, Maximize2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  PortfolioTransaction,
  UserFinancialProfile,
  WatchlistRecord,
  AiAnalysisRecord,
  InvestmentGoalItem,
  StockQuote,
  MutualFund,
  AssetType,
  PriceAlertItem,
} from './types';
import { INITIAL_STOCK_QUOTES, INITIAL_MUTUAL_FUNDS } from './data/marketData';
import {
  calculatePortfolio,
  evaluateFinancialHealth,
  formatRupiah,
} from './utils/financialCalculations';
import {
  auth,
  onAuthStateChanged,
  signOut,
  FirebaseUser,
  testFirestoreConnection,
  saveUserFinancialProfile,
  getUserFinancialProfile,
  saveTransaction,
  deleteTransactionDoc,
  getUserTransactions,
  saveWatchlistItem,
  deleteWatchlistItem,
  getUserWatchlist,
  saveAiAnalysis,
  getUserAiAnalyses,
  savePriceAlert,
  deletePriceAlertDoc,
  getUserPriceAlerts,
} from './lib/firebase';

const DEMO_TRANSACTIONS: PortfolioTransaction[] = [
  {
    id: 'demo-tx-1',
    userId: 'demo',
    assetType: 'saham',
    symbol: 'BBCA',
    assetName: 'Bank Central Asia Tbk',
    type: 'beli',
    date: '2026-08-10',
    unitsOrLots: 2,
    sharesOrUnitsCount: 200,
    pricePerUnit: 10150,
    fee: 3045,
    totalAmount: 2033045,
    notes: 'Akumulasi saham perbankan Tier 1',
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'demo-tx-2',
    userId: 'demo',
    assetType: 'saham',
    symbol: 'BBRI',
    assetName: 'Bank Rakyat Indonesia Tbk',
    type: 'beli',
    date: '2026-08-25',
    unitsOrLots: 4,
    sharesOrUnitsCount: 400,
    pricePerUnit: 5050,
    fee: 3030,
    totalAmount: 2023030,
    notes: 'Target dividen yield di atas 6%',
    createdAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'demo-tx-3',
    userId: 'demo',
    assetType: 'reksadana',
    symbol: 'sucor-money-market',
    assetName: 'Sucorinvest Money Market Fund',
    type: 'beli',
    date: '2026-09-01',
    unitsOrLots: 2200,
    sharesOrUnitsCount: 2200,
    pricePerUnit: 2235,
    fee: 0,
    totalAmount: 4917000,
    notes: 'Alokasi dana darurat likuid di Bibit',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'demo-tx-4',
    userId: 'demo',
    assetType: 'reksadana',
    symbol: 'majoris-sukuk-negara',
    assetName: 'Majoris Sukuk Negara Indonesia',
    type: 'beli',
    date: '2026-09-15',
    unitsOrLots: 2000,
    sharesOrUnitsCount: 2000,
    pricePerUnit: 1450,
    fee: 0,
    totalAmount: 2900000,
    notes: 'RD Pendapatan Tetap jangka 3 tahun',
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'demo-tx-5',
    userId: 'demo',
    assetType: 'saham',
    symbol: 'ADRO',
    assetName: 'Alamtri Resources Indonesia Tbk (Adaro)',
    type: 'beli',
    date: '2026-09-20',
    unitsOrLots: 5,
    sharesOrUnitsCount: 500,
    pricePerUnit: 3500,
    fee: 2625,
    totalAmount: 1752625,
    notes: 'Incaran dividen yield tinggi komoditas energi batubara',
    createdAt: '2026-09-20T10:00:00Z',
  },
];

const DEFAULT_PROFILE: UserFinancialProfile = {
  userId: 'current',
  monthlyIncome: 12000000,
  monthlyExpenses: 6000000,
  familyDependents: 0,
  debtInstallments: 1000000,
  debtNotes: 'Cicilan kendaraan ringan',
  emergencyFund: 24000000, // 4 bulan
  availableCapital: 10000000,
  monthlyInvestCapacity: 2500000,
  investmentGoal: 'Pertumbuhan modal jangka panjang & persiapan dana pensiun',
  timeHorizonYears: 5,
  riskTolerance: 'moderat',
  experienceLevel: 'pemula',
  liquidityNeeds: 'sedang',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_GOALS: InvestmentGoalItem[] = [
  {
    id: 'goal-1',
    userId: 'current',
    title: 'Dana Darurat 6 Bulan Pengeluaran',
    targetAmount: 36000000,
    currentAmount: 24000000,
    targetYear: 2027,
    category: 'Dana Darurat',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    userId: 'current',
    title: 'Uang Muka (DP) Rumah',
    targetAmount: 120000000,
    currentAmount: 28000000,
    targetYear: 2030,
    category: 'Properti',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_ALERTS: PriceAlertItem[] = [
  {
    id: 'alert-init-1',
    userId: 'current',
    symbol: 'BBCA',
    assetName: 'Bank Central Asia Tbk',
    assetType: 'saham',
    targetPrice: 10800,
    condition: 'above_or_equal',
    initialPrice: 10450,
    currentPrice: 10450,
    isEnabled: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    note: 'Area target resistance & profit taking bertahap',
  },
  {
    id: 'alert-init-2',
    userId: 'current',
    symbol: 'sucor-money-market',
    assetName: 'Sucorinvest Money Market Fund',
    assetType: 'reksadana',
    targetPrice: 2300,
    condition: 'above_or_equal',
    initialPrice: 2280,
    currentPrice: 2280,
    isEnabled: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    note: 'Target akumulasi dana darurat',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Phone Frame Simulation State (Default true for previewing native mobile handset)
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Market Data (IDX Stocks & Bibit Mutual Funds)
  const [stocks, setStocks] = useState<StockQuote[]>(Object.values(INITIAL_STOCK_QUOTES));
  const [funds, setFunds] = useState<MutualFund[]>(Object.values(INITIAL_MUTUAL_FUNDS));
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('BBCA');

  // App Data & Mode
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('investmate_is_demo');
    return saved !== null ? saved === 'true' : true;
  });

  const [transactions, setTransactions] = useState<PortfolioTransaction[]>(() => {
    const saved = localStorage.getItem('investmate_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_TRANSACTIONS;
      }
    }
    return DEMO_TRANSACTIONS;
  });

  const [financialProfile, setFinancialProfile] = useState<UserFinancialProfile>(() => {
    const saved = localStorage.getItem('investmate_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const [watchlist, setWatchlist] = useState<WatchlistRecord[]>(() => {
    const saved = localStorage.getItem('investmate_watchlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'wl-1',
        userId: 'current',
        symbol: 'BBCA',
        assetName: 'Bank Central Asia Tbk',
        assetType: 'saham',
        addedAt: new Date().toISOString(),
        currentPrice: 10450,
      },
      {
        id: 'wl-2',
        userId: 'current',
        symbol: 'sucor-money-market',
        assetName: 'Sucorinvest Money Market Fund',
        assetType: 'reksadana',
        addedAt: new Date().toISOString(),
        currentPrice: 2280,
      },
    ];
  });

  const [aiAnalyses, setAiAnalyses] = useState<AiAnalysisRecord[]>(() => {
    const saved = localStorage.getItem('investmate_analyses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'init-analysis-1',
        userId: 'current',
        topic: 'Evaluasi Pemula: Alokasi Dana Darurat vs Saham BEI',
        prompt: 'Saya baru memiliki tabungan Rp 15 juta, apakah boleh langsung beli saham?',
        response: `**Situasi:**
Pengguna memiliki modal awal Rp 15 juta dan ingin mengetahui apakah boleh langsung membeli saham.

**Data:**
Pengeluaran bulanan Rp 6 juta. Dana darurat ideal 3-6 bulan pengeluaran = Rp 18 - 36 juta.

**Penjelasan Sederhana:**
Investasi saham memiliki fluktuasi harga yang tinggi. Jika uang yang diinvestasikan adalah uang yang dibutuhkan dalam waktu dekat, ada risiko terpaksa menjual dalam kondisi rugi (cut loss).

**Analisis:**
Modal Rp 15 juta saat ini baru mencukupi sekitar 2,5 bulan pengeluaran. Fondasi keamanan finansial belum berada di zona aman minimum.

**Risiko:**
Penurunan IHSG sebesar 5-10% dapat membuat saldo berkurang, menimbulkan kepanikan mental bagi investor baru.

**Pilihan:**
1. Alokasikan Rp 12 juta ke Reksa Dana Pasar Uang (Bibit) untuk memperkuat dana darurat yang likuid.
2. Gunakan sisa Rp 3 juta untuk belajar 1-2 lot saham bluechip (seperti BBCA atau BBRI) sambil membiasakan diri dengan aplikasi Stockbit.

**Kesimpulan:**
Prioritaskan penguatan dana darurat terlebih dahulu sebelum memperbesar porsi saham.

**Langkah Selanjutnya:**
Lengkapi Financial Health Check di InvestMate AI dan pasang auto-debit rutin di Bibit.`,
        statusBadge: 'Perlu analisis lebih lanjut',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [goals, setGoals] = useState<InvestmentGoalItem[]>(() => {
    const saved = localStorage.getItem('investmate_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_GOALS;
      }
    }
    return DEFAULT_GOALS;
  });

  // Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlertItem[]>(() => {
    const saved = localStorage.getItem('investmate_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ALERTS;
      }
    }
    return DEFAULT_ALERTS;
  });

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalInitialSymbol, setAlertModalInitialSymbol] = useState<string | undefined>();
  const [toastAlerts, setToastAlerts] = useState<ToastAlertNotification[]>([]);

  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('investmate_push_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isCompareFundsModalOpen, setIsCompareFundsModalOpen] = useState(false);
  const [compareInitialFundId, setCompareInitialFundId] = useState<string | undefined>();
  const [initialAssetForModal, setInitialAssetForModal] = useState<{ symbol: string; type: AssetType } | null>(null);
  const [presetPromptForAi, setPresetPromptForAi] = useState<string | undefined>();
  const [portfolioInitialSubTab, setPortfolioInitialSubTab] = useState<'transactions' | 'rebalance' | 'dividends'>('transactions');

  const handleOpenDividends = () => {
    setPortfolioInitialSubTab('dividends');
    setActiveTab('portofolio');
  };

  // Map stocks and funds for fast lookups
  const stockQuotesMap = useMemo(() => {
    const map: Record<string, StockQuote> = {};
    stocks.forEach((s) => {
      map[s.symbol] = s;
    });
    return map;
  }, [stocks]);

  const mutualFundsMap = useMemo(() => {
    const map: Record<string, MutualFund> = {};
    funds.forEach((f) => {
      map[f.id] = f;
    });
    return map;
  }, [funds]);

  // Derived calculations
  const portfolio = useMemo(() => {
    return calculatePortfolio(transactions, stockQuotesMap, mutualFundsMap);
  }, [transactions, stockQuotesMap, mutualFundsMap]);

  const healthEval = useMemo(() => {
    return evaluateFinancialHealth(financialProfile);
  }, [financialProfile]);

  // Initial boot: Test Firestore connection & Listen for Firebase Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const cloudProfile = await getUserFinancialProfile(user.uid);
          if (cloudProfile) setFinancialProfile(cloudProfile as UserFinancialProfile);

          const cloudTxs = await getUserTransactions(user.uid);
          if (cloudTxs && cloudTxs.length > 0) {
            setTransactions(cloudTxs as PortfolioTransaction[]);
            setIsDemoMode(false);
          }

          const cloudWl = await getUserWatchlist(user.uid);
          if (cloudWl && cloudWl.length > 0) setWatchlist(cloudWl as WatchlistRecord[]);

          const cloudAi = await getUserAiAnalyses(user.uid);
          if (cloudAi && cloudAi.length > 0) setAiAnalyses(cloudAi as AiAnalysisRecord[]);

          const cloudAlerts = await getUserPriceAlerts(user.uid);
          if (cloudAlerts && cloudAlerts.length > 0) setPriceAlerts(cloudAlerts as PriceAlertItem[]);
        } catch (e) {
          console.warn('Error fetching user cloud data:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch and refresh live market data from server API
  const handleRefreshMarketData = async () => {
    try {
      const [stocksRes, fundsRes] = await Promise.all([
        fetch('/api/market/stocks'),
        fetch('/api/market/funds'),
      ]);
      if (stocksRes.ok) {
        const data = await stocksRes.json();
        if (data.stocks && Array.isArray(data.stocks)) {
          setStocks(data.stocks);
        }
      }
      if (fundsRes.ok) {
        const data = await fundsRes.json();
        if (data.funds && Array.isArray(data.funds)) {
          setFunds(data.funds);
        }
      }
    } catch (err) {
      console.warn('Error fetching live market data:', err);
    }
  };

  useEffect(() => {
    handleRefreshMarketData();
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('investmate_is_demo', String(isDemoMode));
    localStorage.setItem('investmate_transactions', JSON.stringify(transactions));
    localStorage.setItem('investmate_profile', JSON.stringify(financialProfile));
    localStorage.setItem('investmate_watchlist', JSON.stringify(watchlist));
    localStorage.setItem('investmate_analyses', JSON.stringify(aiAnalyses));
    localStorage.setItem('investmate_goals', JSON.stringify(goals));
    localStorage.setItem('investmate_alerts', JSON.stringify(priceAlerts));
    localStorage.setItem('investmate_push_enabled', String(isPushEnabled));
  }, [isDemoMode, transactions, financialProfile, watchlist, aiAnalyses, goals, priceAlerts, isPushEnabled]);

  // Handlers
  const handleSaveTransaction = async (tx: PortfolioTransaction) => {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    if (isDemoMode) setIsDemoMode(false);

    if (currentUser) {
      try {
        await saveTransaction(currentUser.uid, tx);
      } catch (err) {
        console.warn('Failed to save to Firestore:', err);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);

    if (currentUser) {
      try {
        await deleteTransactionDoc(currentUser.uid, id);
      } catch (err) {
        console.warn('Failed to delete doc:', err);
      }
    }
  };

  const handleSaveProfile = async (profileData: UserFinancialProfile) => {
    setFinancialProfile(profileData);
    if (currentUser) {
      try {
        await saveUserFinancialProfile(currentUser.uid, profileData);
      } catch (err) {
        console.warn('Failed to save profile to Firestore:', err);
      }
    }
  };

  const handleToggleWatchlist = async (symbol: string, assetName: string, type: AssetType) => {
    const exists = watchlist.some((w) => w.symbol === symbol);
    if (exists) {
      const itemToDelete = watchlist.find((w) => w.symbol === symbol);
      setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
      if (currentUser && itemToDelete) {
        deleteWatchlistItem(currentUser.uid, itemToDelete.id).catch(console.warn);
      }
    } else {
      const newItem: WatchlistRecord = {
        id: `wl-${Date.now()}`,
        userId: currentUser?.uid || 'guest',
        symbol,
        assetName,
        assetType: type,
        addedAt: new Date().toISOString(),
        currentPrice: type === 'saham' ? stockQuotesMap[symbol]?.price : mutualFundsMap[symbol]?.navPerUnit,
      };
      setWatchlist((prev) => [newItem, ...prev]);
      if (currentUser) {
        saveWatchlistItem(currentUser.uid, newItem).catch(console.warn);
      }
    }
  };

  const handleSaveAiAnalysis = async (record: AiAnalysisRecord) => {
    setAiAnalyses((prev) => [record, ...prev]);
    if (currentUser) {
      saveAiAnalysis(currentUser.uid, record).catch(console.warn);
    }
  };

  const handleDeleteAiAnalysis = (id: string) => {
    setAiAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddGoal = (goal: InvestmentGoalItem) => {
    setGoals((prev) => [...prev, goal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleOpenAddTxModal = (symbol?: string, type?: AssetType) => {
    if (symbol && type) {
      setInitialAssetForModal({ symbol, type });
    } else {
      setInitialAssetForModal(null);
    }
    setIsAddTxModalOpen(true);
  };

  const handleOpenAssetDetail = (symbol: string, type: 'saham' | 'reksadana') => {
    if (type === 'saham') {
      setSelectedStockSymbol(symbol);
      setActiveTab('saham');
    } else {
      setActiveTab('reksadana');
    }
  };

  const handleQuickAskAi = (promptText?: string) => {
    if (promptText) {
      setPresetPromptForAi(promptText);
    }
    setActiveTab('assistant');
  };

  const handleOpenCompareFunds = (initialFundId?: string) => {
    setCompareInitialFundId(initialFundId);
    setIsCompareFundsModalOpen(true);
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) return;
    const headers = 'symbol,assetName,assetType,type,date,unitsOrLots,pricePerUnit,fee,totalAmount,notes\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.symbol}","${t.assetName}","${t.assetType}","${t.type}","${t.date}",${t.unitsOrLots},${t.pricePerUnit},${t.fee},${t.totalAmount},"${t.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investmate-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (importedTxs: PortfolioTransaction[]) => {
    setTransactions((prev) => [...importedTxs, ...prev]);
    setIsDemoMode(false);
  };

  const handleExportAllData = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      appName: 'InvestMate AI',
      financialProfile,
      portfolioSummary: portfolio,
      transactions,
      watchlist,
      aiAnalyses,
      goals,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investmate-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setTransactions([]);
    setFinancialProfile(DEFAULT_PROFILE);
    setWatchlist([]);
    setAiAnalyses([]);
    setGoals([]);
    setIsDemoMode(false);
  };

  const handleLoadDemoData = () => {
    setTransactions(DEMO_TRANSACTIONS);
    setIsDemoMode(true);
  };

  // Push Notification & Sound Chime Helpers
  const playAlertSound = () => {
    try {
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      }
    } catch {
      // Audio autoplay may be constrained
    }
  };

  const sendPushNotification = (title: string, body: string) => {
    playAlertSound();
    if (
      isPushEnabled &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Native push notification error:', err);
      }
    }
  };

  const handleRequestPushPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === 'granted') {
          setIsPushEnabled(true);
          return true;
        }
      } catch (err) {
        console.warn('Notification permission request error:', err);
      }
    }
    return false;
  };

  const handleSendTestNotification = () => {
    sendPushNotification(
      'Uji Coba Notifikasi InvestMate AI 🔔',
      'Target alert dan Web Push Notification di browser Anda aktif dan berjalan normal.'
    );
    setToastAlerts((prev) => [
      {
        id: `toast-test-${Date.now()}`,
        symbol: 'BBCA',
        assetName: 'Bank Central Asia Tbk',
        targetPrice: 10800,
        currentPrice: 10450,
        condition: 'above_or_equal',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        assetType: 'saham',
      },
      ...prev,
    ]);
  };

  const handleSavePriceAlert = async (alert: PriceAlertItem) => {
    // Check if newly created or edited alert immediately hits target
    const livePrice =
      alert.assetType === 'saham'
        ? stockQuotesMap[alert.symbol]?.price
        : mutualFundsMap[alert.symbol]?.navPerUnit;

    let alertToSave = alert;
    if (livePrice && alert.isEnabled && alert.status === 'active') {
      let hitTarget = false;
      if (alert.condition === 'above_or_equal' && livePrice >= alert.targetPrice) {
        hitTarget = true;
      } else if (alert.condition === 'below_or_equal' && livePrice <= alert.targetPrice) {
        hitTarget = true;
      }

      if (hitTarget) {
        alertToSave = {
          ...alert,
          currentPrice: livePrice,
          status: 'triggered' as const,
          triggeredAt: new Date().toISOString(),
          lastNotifiedPrice: livePrice,
        };
        const condLabel = alert.condition === 'above_or_equal' ? 'naik melampaui' : 'turun menyentuh';
        sendPushNotification(
          `Target Harga Tercapai: ${alert.symbol} 🎯`,
          `${alert.symbol} telah ${condLabel} target ${formatRupiah(alert.targetPrice)} (Harga kini: ${formatRupiah(livePrice)})`
        );
        setToastAlerts((prev) => [
          {
            id: `toast-${Date.now()}-${alert.id}`,
            symbol: alert.symbol,
            assetName: alert.assetName,
            targetPrice: alert.targetPrice,
            currentPrice: livePrice,
            condition: alert.condition,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            assetType: alert.assetType,
          },
          ...prev.slice(0, 4),
        ]);
      }
    }

    setPriceAlerts((prev) => {
      const idx = prev.findIndex((a) => a.id === alertToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = alertToSave;
        return copy;
      }
      return [alertToSave, ...prev];
    });

    if (currentUser) {
      savePriceAlert(currentUser.uid, alertToSave).catch(console.warn);
    }
  };

  const handleDeletePriceAlert = async (alertId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
    if (currentUser) {
      deletePriceAlertDoc(currentUser.uid, alertId).catch(console.warn);
    }
  };

  const handleToggleAlertEnabled = async (alertId: string, isEnabled: boolean) => {
    setPriceAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              isEnabled,
              status: isEnabled && a.status === 'triggered' ? 'active' : a.status,
            }
          : a
      )
    );
    const item = priceAlerts.find((a) => a.id === alertId);
    if (currentUser && item) {
      savePriceAlert(currentUser.uid, { ...item, isEnabled }).catch(console.warn);
    }
  };

  const handleDismissTriggeredAlert = (alertId: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'dismissed' } : a))
    );
  };

  const handleOpenAlertModal = (symbol?: string) => {
    setAlertModalInitialSymbol(symbol);
    setIsAlertModalOpen(true);
  };

  const handleDismissToast = (id: string) => {
    setToastAlerts((prev) => prev.filter((t) => t.id !== id));
  };

  // Monitor price changes against active price alerts
  useEffect(() => {
    if (priceAlerts.length === 0) return;

    let hasTriggered = false;
    const nextAlerts = priceAlerts.map((alert) => {
      if (!alert.isEnabled || alert.status !== 'active') return alert;

      const livePrice =
        alert.assetType === 'saham'
          ? stockQuotesMap[alert.symbol]?.price
          : mutualFundsMap[alert.symbol]?.navPerUnit;

      if (!livePrice) return alert;

      let hitTarget = false;
      if (alert.condition === 'above_or_equal' && livePrice >= alert.targetPrice) {
        hitTarget = true;
      } else if (alert.condition === 'below_or_equal' && livePrice <= alert.targetPrice) {
        hitTarget = true;
      }

      if (hitTarget) {
        hasTriggered = true;
        const condLabel = alert.condition === 'above_or_equal' ? 'naik melampaui' : 'turun menyentuh';
        const msg = `${alert.symbol} telah ${condLabel} target ${formatRupiah(alert.targetPrice)} (Harga kini: ${formatRupiah(livePrice)})`;

        sendPushNotification(`Target Harga Tercapai: ${alert.symbol} 🎯`, msg);

        setToastAlerts((prev) => [
          {
            id: `toast-${Date.now()}-${alert.id}`,
            symbol: alert.symbol,
            assetName: alert.assetName,
            targetPrice: alert.targetPrice,
            currentPrice: livePrice,
            condition: alert.condition,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            assetType: alert.assetType,
          },
          ...prev.slice(0, 4),
        ]);

        return {
          ...alert,
          currentPrice: livePrice,
          status: 'triggered' as const,
          triggeredAt: new Date().toISOString(),
          lastNotifiedPrice: livePrice,
        };
      }

      if (alert.currentPrice !== livePrice) {
        return {
          ...alert,
          currentPrice: livePrice,
        };
      }

      return alert;
    });

    if (hasTriggered) {
      setPriceAlerts(nextAlerts);
      if (currentUser) {
        nextAlerts
          .filter((a) => a.status === 'triggered')
          .forEach((triggeredAlert) => {
            savePriceAlert(currentUser.uid, triggeredAlert).catch(console.warn);
          });
      }
    }
  }, [stocks, funds, stockQuotesMap, mutualFundsMap, currentUser]);

  // Is current view a sub-view accessed from Mobile Menu?
  const isSubViewFromMenu = ['portofolio', 'perencana', 'simulator', 'riwayat', 'pengaturan'].includes(activeTab);

  // App Content Body with Framer Motion transitions
  const pageVariants = {
    initial: { opacity: 0, y: 12, scale: 0.99 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.99,
      transition: { duration: 0.16, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  const renderViewContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="pb-24"
        >
          {/* Back Button for secondary sub-views on Mobile */}
          {isSubViewFromMenu && (
            <div className="mb-4">
              <button
                onClick={() => setActiveTab('menu')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Menu Utama</span>
              </button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              portfolio={portfolio}
              financialProfile={financialProfile}
              healthEval={healthEval}
              watchlist={watchlist}
              recentAnalyses={aiAnalyses}
              goals={goals}
              isDemoMode={isDemoMode}
              onNavigate={setActiveTab}
              onOpenAddTx={() => handleOpenAddTxModal()}
              onOpenAssetDetail={handleOpenAssetDetail}
              onAskAiWithContext={handleQuickAskAi}
              onLoadDemoData={handleLoadDemoData}
              onRefresh={handleRefreshMarketData}
              alerts={priceAlerts}
              onOpenAlerts={handleOpenAlertModal}
              onDismissAlert={handleDismissTriggeredAlert}
              stocks={stocks}
              onOpenDividends={handleOpenDividends}
            />
          )}

          {activeTab === 'saham' && (
            <StockAnalystView
              stocks={stocks}
              selectedSymbol={selectedStockSymbol}
              onSelectSymbol={setSelectedStockSymbol}
              financialProfile={financialProfile}
              onOpenAddTxForAsset={(sym, type) => handleOpenAddTxModal(sym, type)}
              onToggleWatchlist={handleToggleWatchlist}
              isWatchlisted={watchlist.some((w) => w.symbol === selectedStockSymbol)}
              onAskAiAboutStock={(s) =>
                handleQuickAskAi(
                  `Saya pemula, bagaimana analisis fundamental, valuasi, dan risiko saham ${s.symbol} (${s.name}) jika profil saya ${financialProfile.riskTolerance}?`
                )
              }
              onRefresh={handleRefreshMarketData}
              onOpenAlertModal={handleOpenAlertModal}
            />
          )}

          {activeTab === 'reksadana' && (
            <MutualFundView
              funds={funds}
              financialProfile={financialProfile}
              onOpenAddTxForFund={(fundId) => handleOpenAddTxModal(fundId, 'reksadana')}
              onOpenCompare={handleOpenCompareFunds}
              onAskAiAboutFund={(f) =>
                handleQuickAskAi(
                  `Apakah produk reksa dana ${f.name} (${f.categoryLabel}) sesuai dengan profil risiko saya dan apa risiko terbesarnya?`
                )
              }
              onRefresh={handleRefreshMarketData}
              onOpenAlertModal={handleOpenAlertModal}
            />
          )}

          {activeTab === 'assistant' && (
            <AiAssistantView
              financialProfile={financialProfile}
              portfolio={portfolio}
              stocks={stocks}
              funds={funds}
              onSaveAnalysis={handleSaveAiAnalysis}
              presetPrompt={presetPromptForAi}
              onClearPreset={() => setPresetPromptForAi(undefined)}
            />
          )}

          {activeTab === 'menu' && (
            <MobileMenuView
              currentUser={currentUser}
              financialProfile={financialProfile}
              healthEval={healthEval}
              onNavigate={setActiveTab}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onLogout={() => signOut(auth)}
              isDemoMode={isDemoMode}
              onToggleDemoMode={() => {
                if (isDemoMode) {
                  setIsDemoMode(false);
                } else {
                  handleLoadDemoData();
                }
              }}
              onOpenAddTx={() => handleOpenAddTxModal()}
              onOpenAlerts={() => handleOpenAlertModal()}
              activeAlertsCount={priceAlerts.filter((a) => a.isEnabled && a.status === 'active').length}
              onOpenDividends={handleOpenDividends}
            />
          )}

          {activeTab === 'portofolio' && (
            <PortfolioView
              portfolio={portfolio}
              transactions={transactions}
              financialProfile={financialProfile}
              stocks={stockQuotesMap}
              mutualFunds={mutualFundsMap}
              onOpenAddTx={(symbol, type) => handleOpenAddTxModal(symbol, type)}
              onDeleteTransaction={handleDeleteTransaction}
              onExportCsv={handleExportCsv}
              onImportCsv={handleImportCsv}
              isDemoMode={isDemoMode}
              onClearDemoData={() => {
                setTransactions([]);
                setIsDemoMode(false);
              }}
              onLoadDemoData={handleLoadDemoData}
              onRefresh={handleRefreshMarketData}
              initialSubTab={portfolioInitialSubTab}
              onOpenAssetDetail={handleOpenAssetDetail}
              onOpenAlerts={handleOpenAlertModal}
              onAskAi={handleQuickAskAi}
            />
          )}

          {activeTab === 'perencana' && (
            <FinancialPlannerView
              profile={financialProfile}
              onSaveProfile={handleSaveProfile}
              healthEval={healthEval}
              goals={goals}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeTab === 'simulator' && <SimulatorView />}

          {activeTab === 'riwayat' && (
            <AnalysisHistoryView
              analyses={aiAnalyses}
              onDeleteAnalysis={handleDeleteAiAnalysis}
              onAskNewQuestion={() => setActiveTab('assistant')}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsView
              currentUser={currentUser}
              onLogout={() => signOut(auth)}
              onExportAllData={handleExportAllData}
              onClearAllData={handleClearAllData}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start font-sans text-slate-800 antialiased selection:bg-emerald-200">
      {/* Smartphone Chassis Frame on Desktop / Tablet Preview */}
      {isPhoneFrame ? (
        <div className="w-full flex flex-col items-center py-6 px-3 min-h-screen justify-center">
          {/* Top Switcher Bar */}
          <div className="mb-4 flex items-center justify-between w-full max-w-[420px] px-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Simulasi Aplikasi HP (Mobile Shell)</span>
            </div>
            <button
              onClick={() => setIsPhoneFrame(false)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Layar Penuh</span>
            </button>
          </div>

          {/* Smartphone Frame Outer Shell */}
          <div className="w-full max-w-[420px] h-[860px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden ring-1 ring-white/10">
            {/* Speaker & Mic hardware cutout */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 ml-2" />
            </div>

            {/* Smartphone Inner Screen */}
            <div className="w-full h-full bg-slate-100 rounded-[38px] overflow-hidden flex flex-col relative">
              <MobileTopBar
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                isPhoneFrame={isPhoneFrame}
                setIsPhoneFrame={setIsPhoneFrame}
                isDemoMode={isDemoMode}
                onQuickAskAi={handleQuickAskAi}
                onOpenAlerts={() => handleOpenAlertModal()}
                activeAlertsCount={priceAlerts.filter((a) => a.isEnabled && a.status === 'active').length}
                hasTriggeredAlerts={priceAlerts.some((a) => a.status === 'triggered')}
              />

              {/* Scrollable View Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
                {renderViewContent()}
              </div>

              {/* Mobile Bottom Navigation Dock */}
              <MobileBottomNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenAddTx={() => handleOpenAddTxModal()}
              />

              {/* Home Indicator Bar (iOS / Android style) */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-50 pointer-events-none" />
            </div>
          </div>
        </div>
      ) : (
        /* Full-Width Mobile View (For native mobile screens or responsive test) */
        <div className="w-full min-h-screen bg-slate-100 flex flex-col max-w-lg mx-auto relative shadow-xl">
          <MobileTopBar
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isPhoneFrame={isPhoneFrame}
            setIsPhoneFrame={setIsPhoneFrame}
            isDemoMode={isDemoMode}
            onQuickAskAi={handleQuickAskAi}
            onOpenAlerts={() => handleOpenAlertModal()}
            activeAlertsCount={priceAlerts.filter((a) => a.isEnabled && a.status === 'active').length}
            hasTriggeredAlerts={priceAlerts.some((a) => a.status === 'triggered')}
          />

          <main className="flex-1 px-4 py-4">
            {renderViewContent()}
          </main>

          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenAddTx={() => handleOpenAddTxModal()}
          />
        </div>
      )}

      {/* Global Modals */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onSave={handleSaveTransaction}
        stocks={stocks}
        funds={funds}
        initialAsset={initialAssetForModal}
      />

      <CompareFundsModal
        isOpen={isCompareFundsModalOpen}
        onClose={() => setIsCompareFundsModalOpen(false)}
        funds={funds}
        initialFundId={compareInitialFundId}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Notification & Price Alert Management Modal */}
      <NotificationManagementModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setAlertModalInitialSymbol(undefined);
        }}
        alerts={priceAlerts}
        watchlist={watchlist}
        stocks={stocks}
        funds={funds}
        onSaveAlert={handleSavePriceAlert}
        onDeleteAlert={handleDeletePriceAlert}
        onToggleAlertEnabled={handleToggleAlertEnabled}
        onDismissTriggeredAlert={handleDismissTriggeredAlert}
        isPushEnabled={isPushEnabled}
        onTogglePushEnabled={setIsPushEnabled}
        pushPermission={pushPermission}
        onRequestPushPermission={handleRequestPushPermission}
        onSendTestNotification={handleSendTestNotification}
        initialSymbol={alertModalInitialSymbol}
      />

      {/* Floating In-App Price Alert Toast Banner */}
      <PriceAlertToast
        notifications={toastAlerts}
        onDismiss={handleDismissToast}
        onOpenAssetDetail={handleOpenAssetDetail}
        onOpenAlertManager={() => handleOpenAlertModal()}
      />
    </div>
  );
}
