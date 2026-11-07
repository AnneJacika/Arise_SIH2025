import { db as firebaseDb } from '../firebase';
import db from './dbDexie';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

// --- Import content from JSON file ---
export async function importContentFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Import quizzes
        if (Array.isArray(data.quizzes)) {
          for (const quiz of data.quizzes) {
            const exists = await db.quizzes.where({
              title: quiz.title,
              grade: quiz.grade,
              subject: quiz.subject
            }).first();
            if (!exists) await db.quizzes.add(quiz);

            try {
              const grade = quiz.grade || 'grade6';
              const quizId = quiz.id || `${quiz.subject}_${quiz.title.replace(/\s+/g, '_')}`;
              const quizRef = doc(collection(firebaseDb, 'quizzes', grade, 'items'), quizId);
              await setDoc(quizRef, quiz);
            } catch (err) {
              console.warn('[Import] Failed to write quiz to Firestore:', err);
            }
          }
        }

        // Import lessons
        if (Array.isArray(data.lessons)) {
          for (const lesson of data.lessons) {
            const exists = await db.lessons.where({
              title: lesson.title,
              grade: lesson.grade,
              subject: lesson.subject
            }).first();
            if (!exists) await db.lessons.add(lesson);

            try {
              const grade = lesson.grade || 'grade6';
              const lessonId = lesson.id || `${lesson.subject}_${lesson.title.replace(/\s+/g, '_')}`;
              const lessonRef = doc(collection(firebaseDb, 'lessons', grade, 'items'), lessonId);
              await setDoc(lessonRef, lesson);
            } catch (err) {
              console.warn('[Import] Failed to write lesson to Firestore:', err);
            }
          }
        }

        // Import games
        if (Array.isArray(data.games)) {
          for (const game of data.games) {
            const exists = await db.games.where({
              title: game.title,
              grade: game.grade,
              subject: game.subject
            }).first();
            if (!exists) await db.games.add(game);

            try {
              const grade = game.grade || 'grade6';
              const gameId = game.id || `${game.subject}_${game.title.replace(/\s+/g, '_')}`;
              const gameRef = doc(collection(firebaseDb, 'games', grade, 'items'), gameId);
              await setDoc(gameRef, game);
            } catch (err) {
              console.warn('[Import] Failed to write game to Firestore:', err);
            }
          }
        }

        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// --- Export all or selected content as JSON file ---

// Offline-first: get all quizzes from IndexedDB, fallback to Firestore if empty
export async function getAllQuizzes() {
  // Try IndexedDB first
  let quizzes = [];
  if (typeof db !== 'undefined' && db.quizzes) {
    quizzes = await db.quizzes.toArray();
  }
  if ((!quizzes || quizzes.length === 0) && typeof window !== 'undefined' && window.navigator.onLine) {
    // Fallback to Firestore
    try {
      const { db: firebaseDb } = await import('../firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      const gradesSnap = await getDocs(collection(firebaseDb, 'quizzes'));
      let all = [];
      for (const gradeDoc of gradesSnap.docs) {
        const grade = gradeDoc.id;
        const itemsSnap = await getDocs(collection(firebaseDb, 'quizzes', grade, 'items'));
        const items = [];
        itemsSnap.forEach(doc => {
          const data = doc.data();
          items.push({ id: doc.id, ...data, grade });
        });
        all.push(...items);
      }
      quizzes = all;
    } catch (e) {
      console.warn('[getAllQuizzes] Firestore fetch failed', e);
    }
  }
  return quizzes;
}
export async function exportContent({ quizzes = null, lessons = null, games = null } = {}) {
  console.log('[Export] Starting exportContent...');

  // Helper to fetch all items from Firestore for a given collection root (quizzes, lessons, games)
  async function fetchAllFromFirestore(root) {
    console.log(`[Export] Fetching all from Firestore: ${root}`);
    const gradesSnap = await getDocs(collection(firebaseDb, root));
    if (gradesSnap.docs.length === 0) {
      console.warn(`[Export] No documents found under Firestore collection '${root}'.`);
    } else {
      console.log(`[Export] Firestore ${root} grades found:`, gradesSnap.docs.map(doc => doc.id));
    }
    let all = [];
    for (const gradeDoc of gradesSnap.docs) {
      const grade = gradeDoc.id;
      console.log(`[Export] Fetching items for ${root}/${grade}/items`);
      const itemsSnap = await getDocs(collection(firebaseDb, root, grade, 'items'));
      const items = [];
      itemsSnap.forEach(doc => {
        const data = doc.data();
        items.push({ id: doc.id, ...data, grade });
      });
      all.push(...items);
    }
    console.log(`[Export] Fetched ${all.length} items from Firestore/${root}`);
    return all;
  }

  // Try IndexedDB first
  let [allQuizzes, allLessons, allGames] = await Promise.all([
    quizzes ? Promise.resolve(quizzes) : db.quizzes.toArray(),
    lessons ? Promise.resolve(lessons) : db.lessons.toArray(),
    games ? Promise.resolve(games) : db.games.toArray()
  ]);

  // Fallback to Firestore if empty
  if ((!allQuizzes || allQuizzes.length === 0) && typeof window !== 'undefined' && window.navigator.onLine) {
    try { allQuizzes = await fetchAllFromFirestore('quizzes'); } catch (e) { console.warn('[Export] Firestore quizzes fetch failed', e); }
  }
  if ((!allLessons || allLessons.length === 0) && typeof window !== 'undefined' && window.navigator.onLine) {
    try { allLessons = await fetchAllFromFirestore('lessons'); } catch (e) { console.warn('[Export] Firestore lessons fetch failed', e); }
  }
  if ((!allGames || allGames.length === 0) && typeof window !== 'undefined' && window.navigator.onLine) {
    try { allGames = await fetchAllFromFirestore('games'); } catch (e) { console.warn('[Export] Firestore games fetch failed', e); }
  }

  // Group by grade for nested export
  function groupByGrade(items) {
    const grouped = {};
    for (const item of items) {
      const grade = item.grade || 'unknown';
      if (!grouped[grade]) grouped[grade] = [];
      grouped[grade].push(item);
    }
    return grouped;
  }

  const exportObj = {
    quizzes: groupByGrade(allQuizzes),
    lessons: groupByGrade(allLessons),
    games: groupByGrade(allGames),
    exportedAt: Date.now()
  };

  const json = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arise-content-export-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}