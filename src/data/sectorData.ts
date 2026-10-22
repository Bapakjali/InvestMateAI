/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IdxSectorInfo {
  id: string;
  idxCode: string;
  name: string;
  shortName: string;
  badgeName: string;
  description: string;
  characteristic: 'Defensif' | 'Siklikal' | 'Pertumbuhan' | 'Komoditas';
  keyDrivers: string[];
  keyRisks: string[];
  typicalDividendYield: string;
  valuationMetric: string;
  roleInPortfolio: string;
  benchmarkSymbol: string;
  ytdReturnApprox: number; // percentage
  m1ReturnApprox: number;
  sampleSymbols: string[];
}

export const IDX_SECTORS: Record<string, IdxSectorInfo> = {
  Financials: {
    id: 'Financials',
    idxCode: 'IDXFINANCE',
    name: 'Sektor Keuangan & Perbankan',
    shortName: 'Perbankan',
    badgeName: 'Keuangan (Banks)',
    description:
      'Tulang punggung IHSG dengan bobot kapitalisasi pasar >33%. Didominasi bank-bank papan atas (BBCA, BBRI, BMRI, BBNI) dengan laba puluhan triliun Rupiah.',
    characteristic: 'Defensif',
    keyDrivers: [
      'Tingkat suku bunga acuan Bank Indonesia (BI Rate)',
      'Pertumbuhan kredit konsumsi & korporasi nasional (target 10-12% YoY)',
      'Rasio dana murah (CASA) & Margin Bunga Bersih (NIM)',
      'Perbaikan kualitas aset kredit & penurunan NPL/LAR',
    ],
    keyRisks: [
      'Pelemahan daya beli masyarakat memicu kenaikan kredit bermasalah (NPL)',
      'Pengetatan likuiditas perbankan dan persaingan suku bunga deposito',
    ],
    typicalDividendYield: '4.5% - 6.2% (Konsisten & Tumbuh)',
    valuationMetric: 'PBV (Price to Book Value) & ROE',
    roleInPortfolio: 'Fondasi Utama (Core Portfolio 30-50%) untuk pertumbuhan jangka panjang stabil.',
    benchmarkSymbol: 'BBCA',
    ytdReturnApprox: 12.8,
    m1ReturnApprox: 2.1,
    sampleSymbols: ['BBCA', 'BBRI', 'BMRI', 'BBNI'],
  },

  Energy: {
    id: 'Energy',
    idxCode: 'IDXENERGY',
    name: 'Sektor Energi & Komoditas',
    shortName: 'Energi',
    badgeName: 'Energi (Oil & Coal)',
    description:
      'Sektor komoditas andalan ekspor Indonesia (batubara termal, migas, energi terbarukan). Dikenal dengan dividen yield jumbo dan volatilitas tinggi mengikuti harga dunia.',
    characteristic: 'Komoditas',
    keyDrivers: [
      'Harga batubara Newcastle & ICI (Indonesia Coal Index)',
      'Harga minyak mentah global (Brent / WTI) & gas bumi',
      'Permintaan impor industri pembangkit listrik Tiongkok & India',
      'Proyek transisi energi hijau & smelter hilirisasi',
    ],
    keyRisks: [
      'Normalisasi harga komoditas global pasca masa puncaknya (supercycle)',
      'Kenaikan tarif royalti PNBP pertambangan & sentimen ESG global',
    ],
    typicalDividendYield: '8.0% - 13.5% (Super Jumbo saat laba puncak)',
    valuationMetric: 'PER (Price to Earnings) & EV/EBITDA',
    roleInPortfolio: 'Satelit / Taktikal (10-20%) untuk memaksimalkan passive income dividen tunai.',
    benchmarkSymbol: 'ADRO',
    ytdReturnApprox: 18.4,
    m1ReturnApprox: 3.8,
    sampleSymbols: ['ADRO', 'PTBA', 'PGAS', 'MEDC'],
  },

  'Consumer Non-Cyclicals': {
    id: 'Consumer Non-Cyclicals',
    idxCode: 'IDXNONCYC',
    name: 'Barang Konsumen Primer',
    shortName: 'Konsumer Primer',
    badgeName: 'Konsumer (F&B)',
    description:
      'Perusahaan produsen makanan, minuman, dan kebutuhan harian pokok. Tahan banting terhadap resesi ekonomi karena produk selalu dibeli masyarakat.',
    characteristic: 'Defensif',
    keyDrivers: [
      'Pertumbuhan konsumsi rumah tangga dan bansos pemerintah',
      'Kekuatan merek (brand pricing power) saat inflasi',
      'Harga bahan baku komoditas (gandum, CPO, gula)',
    ],
    keyRisks: [
      'Pelemahan kurs Rupiah terhadap USD untuk impor bahan baku',
      'Penurunan daya beli masyarakat akar rumput',
    ],
    typicalDividendYield: '2.5% - 4.0%',
    valuationMetric: 'PER & Gross Profit Margin',
    roleInPortfolio: 'Jangkar penyeimbang defensif saat IHSG volatil.',
    benchmarkSymbol: 'ICBP',
    ytdReturnApprox: 6.2,
    m1ReturnApprox: 1.4,
    sampleSymbols: ['ICBP'],
  },

  'Communication Services': {
    id: 'Communication Services',
    idxCode: 'IDXINFRA',
    name: 'Infrastruktur & Telekomunikasi',
    shortName: 'Telekomunikasi',
    badgeName: 'Telko & Data Center',
    description:
      'Penyedia jaringan internet, seluler, fiber optik, dan ekosistem data center AI yang esensial bagi ekonomi digital Indonesia.',
    characteristic: 'Pertumbuhan',
    keyDrivers: [
      'Pertumbuhan konsumsi kuota data seluler & penetrasi fixed broadband',
      'Permintaan data center untuk komputasi AI & perbankan',
      'Efisiensi belanja modal capex menara dan spektrum 5G',
    ],
    keyRisks: [
      'Perang tarif paket data seluler antar operator',
      'Tingginya beban depresiasi infrastruktur jaringan',
    ],
    typicalDividendYield: '4.8% - 5.8%',
    valuationMetric: 'EV/EBITDA & Free Cash Flow',
    roleInPortfolio: 'Penyumbang dividen tunai stabil dengan eksposur teknologi.',
    benchmarkSymbol: 'TLKM',
    ytdReturnApprox: 3.5,
    m1ReturnApprox: 0.9,
    sampleSymbols: ['TLKM'],
  },

  'Consumer Cyclicals': {
    id: 'Consumer Cyclicals',
    idxCode: 'IDXCYCLIC',
    name: 'Barang Konsumen Non-Primer',
    shortName: 'Otomotif & Siklikal',
    badgeName: 'Otomotif & Konglomerasi',
    description:
      'Penjualan barang bernilai tinggi (mobil, motor, alat berat). Bergerak selaras dengan siklus pertumbuhan ekonomi dan daya beli kelas menengah.',
    characteristic: 'Siklikal',
    keyDrivers: [
      'Angka penjualan mobil (Gaikindo) & sepeda motor (AISI)',
      'Tingkat suku bunga kredit kendaraan bermotor leasing',
      'Aktivitas pertambangan komoditas pengguna alat berat',
    ],
    keyRisks: [
      'Serbuan mobil listrik brand baru dengan harga kompetitif',
      'Kenaikan suku bunga pembiayaan kredit otomotif',
    ],
    typicalDividendYield: '6.5% - 8.0%',
    valuationMetric: 'PER, PBV & Volume Penjualan Unit',
    roleInPortfolio: 'Pilihan value investing dengan dividen menarik.',
    benchmarkSymbol: 'ASII',
    ytdReturnApprox: 4.8,
    m1ReturnApprox: 1.2,
    sampleSymbols: ['ASII'],
  },
};

export interface HeadToHeadComparisonItem {
  metric: string;
  bankingValue: string;
  bankingNote: string;
  energyValue: string;
  energyNote: string;
  verdict: 'Perbankan Unggul' | 'Energi Unggul' | 'Saling Melengkapi';
}

export const BANKING_VS_ENERGY_COMPARISON: HeadToHeadComparisonItem[] = [
  {
    metric: 'Karakteristik & Siklus Pasar',
    bankingValue: 'Defensif Bertumbuh',
    bankingNote: 'Laba mengikuti pertumbuhan ekonomi domestik & kredit nasional.',
    energyValue: 'Siklikal Komoditas',
    energyNote: 'Laba sangat fluktuatif mengikuti siklus harga energi dunia.',
    verdict: 'Saling Melengkapi',
  },
  {
    metric: 'Rata-Rata Dividend Yield',
    bankingValue: '~4.8% - 6.2%',
    bankingNote: 'Pembagian dividen stabil tiap tahun, aman untuk cash flow rutin.',
    energyValue: '~8.5% - 12.6%',
    energyNote: 'Hasil dividen luar biasa tinggi saat laba emiten mencapai puncak.',
    verdict: 'Energi Unggul',
  },
  {
    metric: 'Valuasi & Multiple Harga (PER)',
    bankingValue: 'PER 9.4x - 23.4x',
    bankingNote: 'Valuasi premium mencerminkan moat CASA & kualitas aset terjaga.',
    energyValue: 'PER 4.8x - 7.9x',
    energyNote: 'Tampak murah (single digit) karena pasar memperhitungkan siklus normal.',
    verdict: 'Energi Unggul',
  },
  {
    metric: 'Kekuatan Arus Kas & Stabilitas',
    bankingValue: 'Sangat Tinggi (Aset Rp 1.000T+)',
    bankingNote: 'Resistensi kuat terhadap inflasi, dilindungi cadangan modal BI/OJK.',
    energyValue: 'Tergantung Harga Minyak/Batubara',
    energyNote: 'Arus kas melimpah saat harga tinggi, menurun tajam saat koreksi.',
    verdict: 'Perbankan Unggul',
  },
  {
    metric: 'Sentimen Katalis 2026',
    bankingValue: 'Pelonggaran BI Rate & Kredit UMKM',
    bankingNote: 'Penyaluran kredit diproyeksikan tumbuh 10-12% YoY.',
    energyValue: 'Permintaan Listrik AI & Geopolitik Migas',
    energyNote: 'Kebutuhan listrik data center & kuota ekspor India/Tiongkok.',
    verdict: 'Saling Melengkapi',
  },
  {
    metric: 'Rekomendasi Alokasi Investor Pemula',
    bankingValue: 'Porsi Inti (35% - 50%)',
    bankingNote: 'Jadikan fondasi portofolio saham karena risiko delisting hampir nihil.',
    energyValue: 'Porsi Taktis (10% - 20%)',
    energyNote: 'Pemanis imbal hasil & mesin dividen, batasi agar tidak panik saat koreksi.',
    verdict: 'Perbankan Unggul',
  },
];
