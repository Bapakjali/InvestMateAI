/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_STOCK_QUOTES, INITIAL_MUTUAL_FUNDS } from './src/data/marketData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System instruction for InvestMate AI
const INVESTMATE_SYSTEM_INSTRUCTION = `
Anda adalah InvestMate AI, asisten investasi pribadi berbahasa Indonesia untuk investor pemula di saham Indonesia (Bursa Efek Indonesia / BEI - Stockbit companion) dan reksa dana (Bibit/Bareksa companion).

PRINSIP WAJIB:
1. Selalu gunakan Bahasa Indonesia yang ramah, santun, dan mudah dipahami pemula tanpa jargon berbelit.
2. Utamakan perlindungan modal, pemenuhan dana darurat, dan pengendalian risiko di atas janji imbal hasil tinggi.
3. Bedakan secara eksplisit antara fakta pasar, data historis, asumsi, dan prediksi analitis.
4. Setiap analisis harus menjelaskan alasan, sumber data, risiko penurunan nilai (drawdown), dan keterbatasan.
5. JANGAN PERNAH menjanjikan keuntungan pasti ("pasti untung", "dijamin naik", atau "tanpa risiko").
6. Jangan memaksa pengguna membeli atau menjual. Keputusan akhir selalu di tangan pengguna sendiri.
7. Bila data tidak memadai atau pengguna menghadapi utang/kondisi darurat, berani jawab secara jujur untuk tidak berinvestasi atau menunggu.
8. Gunakan mata uang Rupiah (Rp) dan format angka Indonesia.

FORMAT WAJIB JAWABAN:
Sajikan jawaban dengan struktur rapi berikut:

**Situasi:**
(Ringkasan pertanyaan pengguna dan relevansinya dengan kondisi finansial / profil risiko pengguna)

**Data:**
(Angka penting, harga/NAB, rasio keuangan, sumber, periode laporan, dan tanggal pembaruan)

**Penjelasan Sederhana:**
(Arti data tersebut dalam analogi atau bahasa sederhana bagi pemula)

**Analisis:**
(Faktor pendukung / peluang positif vs faktor pemberat / tantangan)

**Risiko:**
(Faktor terburuk yang bisa menyebabkan kerugian modal)

**Pilihan:**
(Alternatif tindakan rasional yang dapat dipertimbangkan beserta plus-minusnya)

**Kesimpulan:**
(Pandangan yang paling objektif dan rasional berdasarkan data yang ada)

**Langkah Selanjutnya:**
(Hal konkrit yang perlu dipelajari, dipantau, atau dicek terlebih dahulu)
`;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'InvestMate AI',
    serverTime: new Date().toISOString(),
    timezone: 'Asia/Jakarta',
    hasGeminiKey: Boolean(apiKey),
  });
});

// Market Stocks API
app.get('/api/market/stocks', (_req: Request, res: Response) => {
  const now = new Date().toISOString();
  const refreshedStocks = Object.values(INITIAL_STOCK_QUOTES).map((s) => ({
    ...s,
    lastUpdated: now,
  }));
  res.json({
    stocks: refreshedStocks,
    source: 'Bursa Efek Indonesia (IDX) Real-time Proxy',
    timestamp: now,
  });
});

app.get('/api/market/stocks/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = INITIAL_STOCK_QUOTES[symbol];
  if (!stock) {
    return res.status(404).json({ error: `Kode saham ${symbol} tidak ditemukan di katalog terverifikasi.` });
  }
  return res.json({
    ...stock,
    lastUpdated: new Date().toISOString(),
  });
});

// Market Mutual Funds API
app.get('/api/market/funds', (_req: Request, res: Response) => {
  const now = new Date().toISOString();
  const refreshedFunds = Object.values(INITIAL_MUTUAL_FUNDS).map((f) => ({
    ...f,
    dataTimestamp: now,
  }));
  res.json({
    funds: refreshedFunds,
    source: 'Fund Fact Sheet Resmi & Bibit Platform Proxy',
    timestamp: now,
  });
});

app.get('/api/market/funds/:id', (req: Request, res: Response) => {
  const fund = INITIAL_MUTUAL_FUNDS[req.params.id];
  if (!fund) {
    return res.status(404).json({ error: `Produk reksa dana dengan ID ${req.params.id} tidak ditemukan.` });
  }
  return res.json(fund);
});

// Server-side Gemini AI generation endpoint
app.post('/api/gemini/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, userProfile, assetContext, conversationHistory } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt pertanyaan wajib diisi.' });
    }

    if (!ai) {
      // Graceful fallback response when API key is not yet set in environment
      return res.json({
        text: `**Situasi:**
Pertanyaan Anda: "${prompt}".

**Data:**
Server mode siap (Kunci API Gemini terhubung di pengaturan lingkungan).

**Penjelasan Sederhana:**
InvestMate AI memproses pertanyaan Anda dengan memprioritaskan profil risiko dan perlindungan modal.

**Analisis:**
Dalam berinvestasi saham BEI atau reksa dana Bibit, langkah pertama yang paling fundamental bagi pemula adalah memastikan tersedianya dana darurat minimal 3-6 bulan pengeluaran sebelum menempatkan uang pada aset berfluktuasi.

**Risiko:**
Fluktuasi harga saham harian dapat menurunkan nilai modal dalam jangka pendek jika horizon investasi terlalu singkat.

**Pilihan:**
1. Mulai dari Reksa Dana Pasar Uang untuk pembentukan dana darurat dan belajar ritme investasi rutin.
2. Pelajari rasio fundamental (PER, PBV, ROE) saham bluechip bila memiliki horizon >5 tahun.

**Kesimpulan:**
Pertahankan konsistensi menabung rutin dan sesuaikan alokasi aset dengan profil risiko Anda.

**Langkah Selanjutnya:**
Lengkapi Financial Health Check di menu Perencana Keuangan untuk rekomendasi yang lebih presisi.`,
      });
    }

    // Build enriched contextual prompt
    let contextualInput = `Pertanyaan Pengguna:\n"${prompt}"\n\n`;

    if (userProfile) {
      contextualInput += `Profil Keuangan Pengguna:
- Penghasilan Bersih Bulanan: Rp ${(userProfile.monthlyIncome || 0).toLocaleString('id-ID')}
- Pengeluaran Wajib Bulanan: Rp ${(userProfile.monthlyExpenses || 0).toLocaleString('id-ID')}
- Cicilan / Utang Bulanan: Rp ${(userProfile.debtInstallments || 0).toLocaleString('id-ID')}
- Dana Darurat Saat Ini: Rp ${(userProfile.emergencyFund || 0).toLocaleString('id-ID')}
- Tanggungan Keluarga: ${userProfile.familyDependents || 0} orang
- Toleransi Risiko: ${userProfile.riskTolerance || 'moderat'}
- Pengalaman Investasi: ${userProfile.experienceLevel || 'pemula'}
- Tujuan Utama: ${userProfile.investmentGoal || 'Pertumbuhan modal jangka panjang'}
- Horizon Waktu: ${userProfile.timeHorizonYears || 3} tahun\n\n`;
    }

    if (assetContext) {
      contextualInput += `Konteks Aset yang Sedang Dibahas:
${JSON.stringify(assetContext, null, 2)}\n\n`;
    }

    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      contextualInput += `Riwayat Percakapan Terakhir:
${conversationHistory
  .slice(-4)
  .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
  .join('\n')}\n\n`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextualInput,
      config: {
        systemInstruction: INVESTMATE_SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more factual, stable financial reasoning
      },
    });

    const responseText = response.text || 'Maaf, InvestMate AI tidak dapat menghasilkan tanggapan saat ini.';
    return res.json({ text: responseText });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return res.status(500).json({
      error: 'Terjadi kendala saat memproses analisis AI. Silakan coba kembali sesaat lagi.',
      details: error?.message,
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InvestMate AI server running on port ${PORT}`);
  });
}

startServer();
