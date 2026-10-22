/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  auth,
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi tidak cocok.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar. Silakan pilih Masuk.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Kata sandi terlalu pendek. Gunakan minimal 6 karakter.');
      } else {
        setErrorMsg(err.message || 'Gagal melakukan autentikasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInAnonymously(auth);
      onSuccess();
      onClose();
    } catch (err: any) {
      // If anonymous auth is disabled on project, allow guest local session
      console.warn('Anonymous auth failed, continuing with guest session');
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isRegister ? 'Buat Akun InvestMate' : 'Masuk ke Akun Anda'}
            </h3>
            <p className="text-xs text-slate-500">Sinkronisasi data aman di Firebase</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded text-xs transition-colors cursor-pointer shadow-xs"
          >
            {loading ? 'Memproses...' : isRegister ? 'Daftar Akun Baru' : 'Masuk Sekarang'}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase">atau</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs transition-colors cursor-pointer"
          >
            Lanjut Tanpa Akun (Mode Tamu)
          </button>

          <div className="text-center pt-2 text-slate-500">
            {isRegister ? (
              <span>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Masuk di sini
                </button>
              </span>
            ) : (
              <span>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Daftar sekarang
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
