/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  BookmarkPlus,
  BookmarkCheck,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import {
  UserFinancialProfile,
  PortfolioSummary,
  StockQuote,
  MutualFund,
  AiAnalysisRecord,
} from '../types';
import { formatRupiah } from '../utils/financialCalculations';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  saved?: boolean;
}

interface AiAssistantViewProps {
  financialProfile: UserFinancialProfile | null;
  portfolio: PortfolioSummary;
  stocks: StockQuote[];
  funds: MutualFund[];
  onSaveAnalysis: (analysis: AiAnalysisRecord) => void;
  presetPrompt?: string;
  onClearPreset?: () => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  financialProfile,
  portfolio,
  stocks,
  funds,
  onSaveAnalysis,
  presetPrompt,
  onClearPreset,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `**Situasi:**
Selamat datang di **InvestMate AI Decision Engine**. Saya adalah asisten pendamping investasi independen untuk saham Indonesia (Stockbit) dan reksa dana (Bibit).

**Data:**
Profil keuangan Anda telah diintegrasikan:
- Status Finansial: ${financialProfile ? `${formatRupiah(financialProfile.monthlyIncome)}/bln income` : 'Mode Tamu (Standar)'}
- Kepemilikan Portofolio: ${portfolio.holdings.length} aset tercatat

**Penjelasan Sederhana:**
Saya bertugas membantu Anda berpikir kritis, menakar risiko penurunan modal, dan membedakan fakta fundamental dari hype pasar.

**Analisis:**
Investor pemula sering terjebak membeli saham karena FOMO atau mengejar return masa lalu yang tinggi tanpa memahami risiko bisnis dan likuiditas pribadi.

**Risiko:**
Seluruh instrumen pasar modal memiliki potensi kerugian. Saya tidak pernah menjanjikan keuntungan pasti atau memberikan instruksi beli/jual otomatis.

**Pilihan:**
Anda dapat bertanya tentang evaluasi saham BEI, perbandingan reksa dana Bibit, atau strategi alokasi dana darurat vs investasi.

**Kesimpulan:**
Silakan pilih topik cepat di bawah atau ajukan pertanyaan spesifik Anda.

**Langkah Selanjutnya:**
Tanyakan apa pun seputar rencana investasi atau instrumen yang ingin Anda pelajari!`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState(presetPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'Saya pemula, harus belajar investasi dari mana?',
    'Apakah saham BBCA layak masuk daftar pantauan?',
    'Apa risiko terbesar saham yang saya miliki?',
    'Apa perbedaan reksa dana pasar uang dan saham?',
    'Saya punya Rp100.000, apa yang perlu saya pertimbangkan?',
    'Lebih baik menambah investasi atau melunasi utang?',
    'Bagaimana jika portofolio saya turun 10%?',
    'Apakah investasi saham cocok untuk tujuan 2 tahun?',
  ];

  useEffect(() => {
    if (presetPrompt) {
      setInputPrompt(presetPrompt);
      if (onClearPreset) onClearPreset();
    }
  }, [presetPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Find if query mentions any stock or fund
      const mentionedStock = stocks.find(
        (s) =>
          query.toUpperCase().includes(s.symbol) ||
          query.toLowerCase().includes(s.name.toLowerCase())
      );
      const mentionedFund = funds.find(
        (f) =>
          query.toLowerCase().includes(f.name.toLowerCase()) ||
          query.toLowerCase().includes(f.fundManager.toLowerCase())
      );

      const assetContext = mentionedStock
        ? {
            type: 'saham',
            symbol: mentionedStock.symbol,
            name: mentionedStock.name,
            price: mentionedStock.price,
            per: mentionedStock.per,
            pbv: mentionedStock.pbv,
            roe: mentionedStock.roe,
            dividendYield: mentionedStock.dividendYield,
            trend: mentionedStock.technical.trend,
            rsi14: mentionedStock.technical.rsi14,
            keyRisks: mentionedStock.keyRisks,
          }
        : mentionedFund
        ? {
            type: 'reksadana',
            name: mentionedFund.name,
            category: mentionedFund.categoryLabel,
            navPerUnit: mentionedFund.navPerUnit,
            return1Y: mentionedFund.returns.y1,
            drawdown1Y: mentionedFund.drawdown1Y,
            expenseRatio: mentionedFund.expenseRatio,
            suitableFor: mentionedFund.suitableFor,
          }
        : null;

      const conversationHistory = messages.slice(-4).map((m) => ({
        role: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query.trim(),
          userProfile: financialProfile,
          assetContext,
          conversationHistory,
        }),
      });

      const data = await res.json();
      const replyText = data.text || 'Maaf, InvestMate AI tidak dapat merespons saat ini.';

      const botMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `**Situasi:**
Gagal menghubungi server AI.

**Penjelasan Sederhana:**
Koneksi API sedang mengalami kendala teknis atau timeout.

**Langkah Selanjutnya:**
Silakan periksa koneksi internet Anda atau coba ajukan kembali pertanyaan Anda dalam beberapa saat.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToHistory = (msg: Message) => {
    const record: AiAnalysisRecord = {
      id: `analysis-${Date.now()}`,
      userId: 'current',
      topic: msg.text.slice(0, 60) + '...',
      prompt: 'Konsultasi Interaktif AI Assistant',
      response: msg.text,
      statusBadge: 'Menarik untuk dipelajari',
      createdAt: msg.timestamp,
    };
    onSaveAnalysis(record);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, saved: true } : m))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-lg">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Decision Engine Assistant</h2>
            <p className="text-xs text-slate-500">
              Konsultasi keputusan finansial rasional dengan format standar analisis risiko OJK & BEI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemini 3.8 Flash Aktif</span>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold shrink-0 text-[11px]">Topik Cepat:</span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 rounded-md whitespace-nowrap transition-colors cursor-pointer text-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-lg p-4 leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {/* Render message with bold headers highlighting */}
                    {m.text.split('\n').map((line, idx) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <div
                            key={idx}
                            className="font-bold text-slate-900 text-xs mt-3 mb-1 uppercase tracking-wide text-emerald-700"
                          >
                            {line.replace(/\*\*/g, '')}
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="mb-1 text-xs">
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {!isUser && m.id !== 'welcome-msg' && (
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Analisis InvestMate AI</span>
                      <button
                        onClick={() => handleSaveToHistory(m)}
                        disabled={m.saved}
                        className={`flex items-center gap-1 font-semibold cursor-pointer ${
                          m.saved ? 'text-emerald-700' : 'text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        {m.saved ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersimpan di Riwayat</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            <span>Simpan ke Riwayat</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <span>Menganalisis data pasar dan profil risiko Anda...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan analisis saham, reksa dana, alokasi dana darurat, atau strategi investasi..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Kirim</span>
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-1.5">
            InvestMate AI memberikan analisis edukatif berbasis data. Transaksi tetap dilakukan manual melalui Stockbit/Bibit.
          </div>
        </div>
      </div>
    </div>
  );
};
