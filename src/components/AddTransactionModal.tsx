/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Info, Check } from 'lucide-react';
import { PortfolioTransaction, AssetType, TransactionType, StockQuote, MutualFund } from '../types';
import { formatRupiah } from '../utils/financialCalculations';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: PortfolioTransaction) => void;
  stocks: StockQuote[];
  funds: MutualFund[];
  initialAsset?: { symbol: string; type: AssetType } | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  stocks,
  funds,
  initialAsset,
}) => {
  const [assetType, setAssetType] = useState<AssetType>('saham');
  const [txType, setTxType] = useState<TransactionType>('beli');
  const [symbol, setSymbol] = useState('BBCA');
  const [assetName, setAssetName] = useState('Bank Central Asia Tbk');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [unitsOrLots, setUnitsOrLots] = useState<number>(1);
  const [pricePerUnit, setPricePerUnit] = useState<number>(10450);
  const [fee, setFee] = useState<number>(1500);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle initial asset pre-selection
  useEffect(() => {
    if (initialAsset) {
      setAssetType(initialAsset.type);
      if (initialAsset.type === 'saham') {
        const found = stocks.find((s) => s.symbol === initialAsset.symbol);
        if (found) {
          setSymbol(found.symbol);
          setAssetName(found.name);
          setPricePerUnit(found.price);
          setFee(Math.round(found.price * 100 * 0.0015)); // 0.15% broker fee
        }
      } else {
        const found = funds.find((f) => f.id === initialAsset.symbol);
        if (found) {
          setSymbol(found.id);
          setAssetName(found.name);
          setPricePerUnit(found.navPerUnit);
          setFee(0); // Bibit mutual funds are typically 0% fee
        }
      }
    }
  }, [initialAsset, stocks, funds]);

  // When asset type changes, reset symbol and price defaults
  const handleTypeChange = (newType: AssetType) => {
    setAssetType(newType);
    if (newType === 'saham') {
      const defaultStock = stocks[0] || { symbol: 'BBCA', name: 'Bank Central Asia Tbk', price: 10450 };
      setSymbol(defaultStock.symbol);
      setAssetName(defaultStock.name);
      setPricePerUnit(defaultStock.price);
      setFee(Math.round(defaultStock.price * 100 * 0.0015));
    } else {
      const defaultFund = funds[0] || {
        id: 'sucor-money-market',
        name: 'Sucorinvest Money Market Fund',
        navPerUnit: 2280,
      };
      setSymbol(defaultFund.id);
      setAssetName(defaultFund.name);
      setPricePerUnit(defaultFund.navPerUnit);
      setFee(0);
    }
  };

  const handleSymbolSelect = (sym: string) => {
    setSymbol(sym);
    if (assetType === 'saham') {
      const found = stocks.find((s) => s.symbol === sym);
      if (found) {
        setAssetName(found.name);
        setPricePerUnit(found.price);
        setFee(Math.round(found.price * (unitsOrLots || 1) * 100 * (txType === 'beli' ? 0.0015 : 0.0025)));
      }
    } else {
      const found = funds.find((f) => f.id === sym);
      if (found) {
        setAssetName(found.name);
        setPricePerUnit(found.navPerUnit);
        setFee(0);
      }
    }
  };

  // Calculate total amount
  const sharesCount = assetType === 'saham' ? unitsOrLots * 100 : unitsOrLots;
  const rawSubtotal = sharesCount * pricePerUnit;
  const calculatedTotal = txType === 'beli' ? rawSubtotal + fee : Math.max(0, rawSubtotal - fee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) {
      setErrorMessage('Kode atau nama aset wajib dipilih.');
      return;
    }
    if (unitsOrLots <= 0) {
      setErrorMessage('Jumlah unit atau lot harus lebih dari 0.');
      return;
    }
    if (pricePerUnit <= 0) {
      setErrorMessage('Harga per lembar atau NAB per unit harus lebih dari 0.');
      return;
    }

    const tx: PortfolioTransaction = {
      id: `tx-${Date.now()}`,
      userId: 'current',
      assetType,
      symbol: symbol.toUpperCase(),
      assetName,
      type: txType,
      date,
      unitsOrLots,
      sharesOrUnitsCount: sharesCount,
      pricePerUnit,
      fee,
      totalAmount: calculatedTotal,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave(tx);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Catat Transaksi Investasi Manual</h3>
            <p className="text-xs text-slate-500">Salin catatan pembelian dari aplikasi Stockbit atau Bibit</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Toggle Jenis Aset: Saham BEI vs Reksa Dana */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Instrumen Investasi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('saham')}
                className={`py-2 px-3 rounded-md border font-semibold transition-colors cursor-pointer text-center ${
                  assetType === 'saham'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Saham BEI (Stockbit)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('reksadana')}
                className={`py-2 px-3 rounded-md border font-semibold transition-colors cursor-pointer text-center ${
                  assetType === 'reksadana'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Reksa Dana (Bibit)
              </button>
            </div>
          </div>

          {/* Toggle Jenis Transaksi: Beli vs Jual */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Arah Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTxType('beli')}
                className={`py-2 px-3 rounded-md border font-semibold transition-colors cursor-pointer text-center ${
                  txType === 'beli'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Beli (Akumulasi)
              </button>
              <button
                type="button"
                onClick={() => setTxType('jual')}
                className={`py-2 px-3 rounded-md border font-semibold transition-colors cursor-pointer text-center ${
                  txType === 'jual'
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Jual (Realisasi)
              </button>
            </div>
          </div>

          {/* Pilih Aset atau Masukkan Manual */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {assetType === 'saham' ? 'Kode Saham BEI' : 'Produk Reksa Dana'}
            </label>
            {assetType === 'saham' ? (
              <select
                value={symbol}
                onChange={(e) => handleSymbolSelect(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} (Rp {s.price.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={symbol}
                onChange={(e) => handleSymbolSelect(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (NAB: Rp {f.navPerUnit.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tanggal Eksekusi</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Kuantitas (Lot untuk Saham, Unit untuk Reksa Dana) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {assetType === 'saham' ? 'Kuantitas (Lot)' : 'Jumlah Unit'}
              </label>
              <input
                type="number"
                min="0.0001"
                step={assetType === 'saham' ? '1' : '0.01'}
                value={unitsOrLots || ''}
                onChange={(e) => setUnitsOrLots(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
              />
              {assetType === 'saham' && (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  = {(unitsOrLots * 100).toLocaleString('id-ID')} lembar saham
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {assetType === 'saham' ? 'Harga per Lembar' : 'NAB per Unit'}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={pricePerUnit || ''}
                onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Biaya Transaksi (Broker Fee) */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Biaya Transaksi / Broker Fee (Rp)</label>
            <input
              type="number"
              min="0"
              value={fee}
              onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {assetType === 'saham' ? 'Umumnya 0,15% beli & 0,25% jual di sekuritas' : '0% biaya pembelian di Bibit'}
            </span>
          </div>

          {/* Total Transaksi Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
              <span>Subtotal Nilai Aset:</span>
              <span className="font-semibold text-slate-800">{formatRupiah(rawSubtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
              <span>Biaya Fee:</span>
              <span>{formatRupiah(fee)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Uang {txType === 'beli' ? 'Dikeluarkan' : 'Diterima'}:</span>
              <span className="text-emerald-700 text-base">{formatRupiah(calculatedTotal)}</span>
            </div>
          </div>

          {/* Catatan Transaksi */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Catatan / Rencana (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Pembelian rutin awal bulan, strategi DCA jangka panjang"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-semibold cursor-pointer shadow-xs"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
