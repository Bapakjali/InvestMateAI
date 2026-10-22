/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  deleteDoc,
  getDocFromServer,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Test connection to Firestore on initialization as requested by guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
    }
    // Expected permission-denied or offline on initial test document is handled gracefully
    return false;
  }
}

// User Profile Firestore Helpers
export async function saveUserFinancialProfile(userId: string, profileData: any) {
  const profileRef = doc(db, 'users', userId, 'financial_profiles', 'current');
  await setDoc(profileRef, {
    ...profileData,
    userId,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function getUserFinancialProfile(userId: string) {
  const profileRef = doc(db, 'users', userId, 'financial_profiles', 'current');
  const snap = await getDoc(profileRef);
  return snap.exists() ? snap.data() : null;
}

// User Transactions Firestore Helpers
export async function saveTransaction(userId: string, transaction: any) {
  const txRef = doc(db, 'users', userId, 'transactions', transaction.id);
  await setDoc(txRef, {
    ...transaction,
    userId,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTransactionDoc(userId: string, transactionId: string) {
  const txRef = doc(db, 'users', userId, 'transactions', transactionId);
  await deleteDoc(txRef);
}

export async function getUserTransactions(userId: string) {
  const txCol = collection(db, 'users', userId, 'transactions');
  const snap = await getDocs(query(txCol));
  return snap.docs.map((d) => d.data());
}

// User Watchlist Firestore Helpers
export async function saveWatchlistItem(userId: string, item: any) {
  const itemRef = doc(db, 'users', userId, 'watchlists', item.id);
  await setDoc(itemRef, {
    ...item,
    userId,
    addedAt: item.addedAt || new Date().toISOString(),
  });
}

export async function deleteWatchlistItem(userId: string, itemId: string) {
  const itemRef = doc(db, 'users', userId, 'watchlists', itemId);
  await deleteDoc(itemRef);
}

export async function getUserWatchlist(userId: string) {
  const col = collection(db, 'users', userId, 'watchlists');
  const snap = await getDocs(query(col));
  return snap.docs.map((d) => d.data());
}

// User AI Analyses Archive Helpers
export async function saveAiAnalysis(userId: string, analysis: any) {
  const ref = doc(db, 'users', userId, 'ai_analyses', analysis.id);
  await setDoc(ref, {
    ...analysis,
    userId,
    createdAt: analysis.createdAt || new Date().toISOString(),
  });
}

export async function getUserAiAnalyses(userId: string) {
  const col = collection(db, 'users', userId, 'ai_analyses');
  const snap = await getDocs(query(col));
  return snap.docs.map((d) => d.data());
}

// User Price Alerts Helpers
export async function savePriceAlert(userId: string, alert: any) {
  const ref = doc(db, 'users', userId, 'price_alerts', alert.id);
  await setDoc(ref, {
    ...alert,
    userId,
    createdAt: alert.createdAt || new Date().toISOString(),
  });
}

export async function deletePriceAlertDoc(userId: string, alertId: string) {
  const ref = doc(db, 'users', userId, 'price_alerts', alertId);
  await deleteDoc(ref);
}

export async function getUserPriceAlerts(userId: string) {
  const col = collection(db, 'users', userId, 'price_alerts');
  const snap = await getDocs(query(col));
  return snap.docs.map((d) => d.data());
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
};
export type { FirebaseUser };
