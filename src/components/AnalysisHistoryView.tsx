/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { AiAnalysisRecord } from '../types';
import { formatDateIndo } from '../utils/financialCalculations';

interface AnalysisHistoryViewProps {
  analyses: AiAnalysisRecord[];
  onDeleteAnalysis: (id: string) => void;
  onAskNewQuestion: () => void;
}

export const AnalysisHistoryView: React.FC<AnalysisHistoryViewProps> = ({
  analyses,
  onDeleteAnalysis,
  onAskNewQuestion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AiAnalysisRecord | null>(analyses[0] || null);

  const filtered = analyses.filter(
    (a) =>
      a.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analyses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `investmate-ai-analisis-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">Arsip Riwayat Analisis AI</h2>
          </div>
          <p className="text-xs text-slate-500">
            Daftar konsultasi dan evaluasi rasional yang tersimpan untuk melacak perkembangan pemikiran investasi Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            disabled={analyses.length === 0}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Arsip JSON</span>
          </button>

          <button
            onClick={onAskNewQuestion}
            className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Konsultasi AI Baru</span>
          </button>
        </div>
      </div>

      {/* Main Grid: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Daftar Riwayat */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Daftar Arsip ({filtered.length})</span>
          </div>

          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari topik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const isSelected = selectedRecord?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900 text-xs line-clamp-1">{item.topic}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAnalysis(item.id);
                          if (selectedRecord?.id === item.id) setSelectedRecord(null);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateIndo(item.createdAt, true)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada riwayat analisis yang tersimpan.
              </div>
            )}
          </div>
        </div>

        {/* Kolom Detail Arsip (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs p-6">
          {selectedRecord ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedRecord.topic}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Disimpan: {formatDateIndo(selectedRecord.createdAt, true)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteAnalysis(selectedRecord.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>

              {/* Response Text with formatting */}
              <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 text-xs leading-relaxed text-slate-800 space-y-2 whitespace-pre-wrap font-sans">
                {selectedRecord.response}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs space-y-3">
              <History className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Pilih salah satu arsip analisis di sebelah kiri untuk membaca rincian evaluasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
