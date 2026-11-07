// src/utils/dbDexie.js
import Dexie from 'dexie';

const db = new Dexie('AriseDB');
db.version(2).stores({
  quizzes: '++id, title, grade, subject, [title+grade+subject]',
  lessons: '++id, title, grade, subject',
  games: '++id, title, grade, subject'
});

export default db;
