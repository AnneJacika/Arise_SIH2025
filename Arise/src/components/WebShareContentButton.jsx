// src/components/WebShareContentButton.jsx

import React, { useState, useEffect } from 'react';
import db from '../utils/dbDexie';
import { collection, getDocs } from 'firebase/firestore';
import { db as firebaseDb } from '../firebase';

export default function WebShareContentButton() {
  const [loading, setLoading] = useState(false);

  // Helper: fetch all items from Firestore for a given collection root (quizzes, lessons, games)
  async function fetchAllFromFirestore(root) {
    const gradesSnap = await getDocs(collection(firebaseDb, root));
    let all = [];
    for (const gradeDoc of gradesSnap.docs) {
      const grade = gradeDoc.id;
      const itemsSnap = await getDocs(collection(firebaseDb, root, grade, 'items'));
      const items = [];
      itemsSnap.forEach(doc => {
        const data = doc.data();
        items.push({ id: doc.id, ...data, grade });
      });
      all.push(...items);
    }
    return all;
  }

  const handleShare = async () => {
    setLoading(true);
    try {
      // 1. Try IndexedDB first
      let [allQuizzes, allLessons, allGames] = await Promise.all([
        db.quizzes.toArray(),
        db.lessons.toArray(),
        db.games.toArray()
      ]);
      // 2. Fallback to Firestore if empty and online
      if ((!allQuizzes || allQuizzes.length === 0) && typeof window !== 'undefined' && window.navigator.onLine) {
        try { allQuizzes = await fetchAllFromFirestore('quizzes'); } catch (e) { console.warn('[WebShare] Firestore quizzes fetch failed', e); }
      }
      if ((!allLessons || allLessons.length === 0) && typeof window !== 'undefined' && window.navigator.onLine) {
        try { allLessons = await fetchAllFromFirestore('lessons'); } catch (e) { console.warn('[WebShare] Firestore lessons fetch failed', e); }
      }
      if ((!allGames || allGames.length === 0) && typeof window !== 'undefined' && window.navigator.onLine) {
        try { allGames = await fetchAllFromFirestore('games'); } catch (e) { console.warn('[WebShare] Firestore games fetch failed', e); }
      }
      // 3. Share/export as .txt file for compatibility
      const exportObj = {
        quizzes: allQuizzes,
        lessons: allLessons,
        games: allGames,
        exportedAt: Date.now()
      };
      const json = JSON.stringify(exportObj, null, 2);
      const blob = new Blob([json], { type: 'text/plain' });
      const file = new File([blob], `arise-content-export-${new Date().toISOString().slice(0,10)}.txt`, { type: 'text/plain' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Arise Content',
          text: 'Share lessons, quizzes, and games with a friend!'
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Arise Content',
          text: `Arise Content Export:\n\n${json}`
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(json);
        alert('Content copied to clipboard!');
      } else {
        alert('Web Share API is not available on this device. Use Export instead.');
      }
    } catch (error) {
      alert('Sharing failed. Please try the Export button instead.');
      console.error('[WebShare] Share failed:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <button
      className={`px-4 py-2 bg-pink-600 text-white rounded-lg shadow hover:bg-pink-700 transition flex items-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={handleShare}
      disabled={loading}
      title={loading ? 'Preparing to share...' : 'Ready to share!'}
    >
      {loading ? (
        <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
      ) : (
        <span className="inline-block w-5 h-5">📤</span>
      )}
      {loading ? 'Preparing...' : 'Share All Content'}
    </button>
  );
}