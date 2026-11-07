import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// QACorner page: students can post questions, teachers can reply as comments
export default function QACorner() {
  const { currentUser, userProfile } = useAuth();
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [reply, setReply] = useState({});
  const [loading, setLoading] = useState(true);

  // Listen for all questions (optionally filter by schoolId)
  useEffect(() => {
    if (!userProfile?.schoolId) return;
    const q = query(
      collection(db, 'qacorner'),
      where('schoolId', '==', userProfile.schoolId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setQuestions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [userProfile?.schoolId]);

  // Student: post a question
  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    await addDoc(collection(db, 'qacorner'), {
      question: question.trim(),
      authorId: currentUser.uid,
      authorName: userProfile?.name || userProfile?.displayName || 'Student',
      schoolId: userProfile.schoolId,
      createdAt: serverTimestamp(),
      comments: [],
      notified: false
    });
    setQuestion('');
  }

  // Teacher: reply to a question
  async function handleReply(qid) {
    if (!reply[qid]?.trim()) return;
    const qRef = doc(db, 'qacorner', qid);
    const qDoc = questions.find(q => q.id === qid);
    const newComment = {
      text: reply[qid],
      authorId: currentUser.uid,
      authorName: userProfile?.name || userProfile?.displayName || 'Teacher',
      createdAt: new Date().toISOString()
    };
    await updateDoc(qRef, {
      comments: [...(qDoc.comments || []), newComment],
      notified: false // trigger notification logic
    });
    setReply(r => ({ ...r, [qid]: '' }));
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Q/A Corner</h1>
      {userProfile?.role === 'student' && (
        <form onSubmit={handleAsk} className="mb-8 flex gap-2">
          <input
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Ask a question..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            maxLength={300}
            required
          />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" type="submit">Post</button>
        </form>
      )}
      {loading ? <div>Loading...</div> : (
        <div className="space-y-6">
          {questions.length === 0 && <div className="text-slate-500 text-center">No questions yet.</div>}
          {questions.map(q => (
            <div key={q.id} className="bg-white rounded-xl shadow p-4 border">
              <div className="mb-2">
                <span className="font-semibold text-indigo-700">{q.authorName}</span>:
                <span className="ml-2">{q.question}</span>
                <span className="ml-4 text-xs text-slate-400">{q.createdAt?.toDate?.().toLocaleString?.() || ''}</span>
              </div>
              <div className="ml-4 space-y-2">
                {(q.comments || []).map((c, i) => (
                  <div key={i} className="text-sm text-slate-700">
                    <span className="font-semibold text-green-700">{c.authorName}</span>: {c.text}
                    <span className="ml-2 text-xs text-slate-400">{c.createdAt && (new Date(c.createdAt)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {userProfile?.role === 'staff' && (
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 border rounded-lg px-2 py-1 text-sm"
                    placeholder="Reply..."
                    value={reply[q.id] || ''}
                    onChange={e => setReply(r => ({ ...r, [q.id]: e.target.value }))}
                  />
                  <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm" onClick={() => handleReply(q.id)}>Reply</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
