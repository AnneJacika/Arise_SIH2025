
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const http = require('http');

// Firebase setup
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, doc, updateDoc, getDoc, setDoc } = require('firebase/firestore');

let db;
try {
  const firebaseConfig = require('./firebase-config.json');
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1);
}


// Express setup
const app = express();
// TODO: Set your production frontend domain below
// Example: const allowedOrigin = 'https://your-frontend-domain.com';
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
// Health check endpoint for production
app.get('/health', (req, res) => res.send('OK'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Quiz questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What is the capital of France?',
    options: ['Berlin', 'London', 'Paris', 'Madrid'],
    answer: 2
  },
  {
    id: 2,
    question: '2 + 2 = ?',
    options: ['3', '4', '5', '6'],
    answer: 1
  }
];

// In-memory sessions
const sessions = new Map();

// Utility functions
const safeFirestoreOp = async (operation, fallback = null) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Firestore error:', error);
    return fallback;
  }
};

const generateUniqueName = (baseName, existingNames) => {
  if (!baseName?.trim()) baseName = 'Student';
  
  let uniqueName = baseName;
  let counter = 1;
  
  while (existingNames.has(uniqueName)) {
    uniqueName = `${baseName}_${counter++}`;
  }
  
  return uniqueName;
};

const calculateScore = (answers) => {
  return QUIZ_QUESTIONS.reduce((score, q, idx) => 
    score + (answers[idx] === q.answer ? 1 : 0), 0
  );
};

// Session management
const getSession = (sectionId) => {
  if (!sessions.has(sectionId)) {
    sessions.set(sectionId, {
      started: false,
      participants: new Map(), // socketId -> participant data
      allParticipants: new Set(), // Track all participants who ever joined
      submissions: new Map(), // participantName -> {score, answers, submittedAt}
      quizDocId: null,
      scheduledAt: null,
      startedAt: null,
      endedAt: null,
      schoolId: null,
      gradeId: null
    });
  }
  return sessions.get(sectionId);
};

// Get current leaderboard from session
const getLeaderboard = (session) => {
  return Array.from(session.submissions.entries())
    .map(([name, data]) => ({ name, score: data.score }))
    .sort((a, b) => b.score - a.score);
};

// End quiz endpoint
app.post('/end-quiz', async (req, res) => {
  const { sectionId, gradeId, schoolId } = req.body;
  console.log('[POST /end-quiz] Request:', { sectionId, gradeId, schoolId });
  if (!sectionId || !gradeId || !schoolId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  let session = sessions.get(sectionId);
  // If session or quizDocId is missing, try to fetch from Firestore
  if (!session || !session.quizDocId) {
    const quiz = await safeFirestoreOp(async () => {
      const quizzesCol = collection(db, `schools/${schoolId}/grades/${gradeId}/sections/${sectionId}/quizzes`);
      const snapshot = await getDocs(quizzesCol);
      let latestQuiz = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!latestQuiz || data.scheduledAt > latestQuiz.scheduledAt) {
          latestQuiz = { id: doc.id, ...data };
        }
      });
      return latestQuiz;
    });
    if (!quiz) {
      return res.status(400).json({ error: 'No active quiz for this section' });
    }
    // Recreate session in memory if needed
    if (!session) {
      session = getSession(sectionId);
      session.schoolId = schoolId;
      session.gradeId = gradeId;
    }
    session.quizDocId = quiz.id;
    if (!session.endedAt) session.endedAt = Date.now();
    session.started = false;
  } else {
    session.endedAt = Date.now();
    session.started = false;
  }
  // Update Firestore quiz doc
  await safeFirestoreOp(async () => {
    const quizDocRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId, 'quizzes', session.quizDocId);
    await updateDoc(quizDocRef, {
      status: 'ended',
      endedAt: session.endedAt,
      results: getLeaderboard(session),
      participants: Array.from(session.allParticipants),
      lastUpdated: new Date().toISOString()
    });
    console.log('[POST /end-quiz] Quiz ended and Firestore updated:', quizDocRef.path);
  });
  io.to(sectionId).emit('quiz-ended', { sectionId });
  res.json({ success: true });
});

// REST endpoints
app.get('/quiz-status', async (req, res) => {
  const { schoolId, gradeId, sectionId } = req.query;
  console.log('[GET /quiz-status] Request:', { schoolId, gradeId, sectionId });
  
  if (!schoolId || !gradeId || !sectionId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const quiz = await safeFirestoreOp(async () => {
    const quizzesCol = collection(db, `schools/${schoolId}/grades/${gradeId}/sections/${sectionId}/quizzes`);
    const snapshot = await getDocs(quizzesCol);
    
    let latestQuiz = null;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!latestQuiz || data.scheduledAt > latestQuiz.scheduledAt) {
        latestQuiz = { id: doc.id, ...data };
      }
    });
    return latestQuiz;
  });

  if (!quiz) {
    console.log('[GET /quiz-status] No quiz found');
    return res.json({ quiz: null, scheduled: false });
  }

  const scheduled = quiz.status !== 'ended';
  const response = { quiz, scheduled };
  
  if (quiz.status === 'started') {
    response.quiz.questions = QUIZ_QUESTIONS;
  }
  
  console.log('[GET /quiz-status] Response:', { status: quiz.status, scheduled });
  res.json(response);
});

app.post('/schedule-quiz', async (req, res) => {
  const { sectionId, hostName, gradeId, schoolId } = req.body;
  console.log('[POST /schedule-quiz] Request:', { sectionId, hostName, gradeId, schoolId });
  
  if (!sectionId || !gradeId || !schoolId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const result = await safeFirestoreOp(async () => {
    const quizzesCol = collection(db, `schools/${schoolId}/grades/${gradeId}/sections/${sectionId}/quizzes`);
    const snapshot = await getDocs(quizzesCol);
    
    // Check for active quiz
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.status !== 'ended') {
        throw new Error('An active quiz already exists for this section');
      }
    }

    const quizData = {
      scheduledAt: Date.now(),
      host: hostName || 'Teacher',
      status: 'scheduled',
      participants: [],
      results: []
    };

    console.log('[POST /schedule-quiz] Creating quiz doc with data:', quizData);
    return await addDoc(quizzesCol, quizData);
  });

  if (result instanceof Error) {
    console.log('[POST /schedule-quiz] Error:', result.message);
    return res.status(400).json({ error: result.message });
  }
  
  if (!result) {
    return res.status(500).json({ error: 'Failed to schedule quiz' });
  }

  // Initialize session
  const session = getSession(sectionId);
  session.quizDocId = result.id;
  session.scheduledAt = Date.now();
  session.schoolId = schoolId;
  session.gradeId = gradeId;

  console.log('[POST /schedule-quiz] Quiz scheduled with ID:', result.id);
  io.to(sectionId).emit('quiz-scheduled', { sectionId });
  res.json({ success: true, quizId: result.id });
});

app.post('/start-quiz', async (req, res) => {
  const { sectionId, gradeId, schoolId } = req.body;
  console.log('[POST /start-quiz] Request:', { sectionId, gradeId, schoolId });
  
  const session = sessions.get(sectionId);
  if (!session) {
    return res.status(400).json({ error: 'Quiz not scheduled' });
  }

  session.started = true;
  session.startedAt = Date.now();

  // Update Firestore
  await safeFirestoreOp(async () => {
    if (session.quizDocId) {
      const quizDocRef = doc(db, 'schools', schoolId, 'grades', gradeId, 'sections', sectionId, 'quizzes', session.quizDocId);
      await updateDoc(quizDocRef, {
        startedAt: Date.now(),
        status: 'started'
      });
      console.log('[POST /start-quiz] Updated quiz status to started in Firestore');
    }
  });

  console.log(`[POST /start-quiz] Broadcasting to ${session.participants.size} participants`);
  io.to(sectionId).emit('quiz-started', { sectionId, questions: QUIZ_QUESTIONS });
  res.json({ success: true });
});

app.get('/debug/sessions', (req, res) => {
  const debug = {};
  sessions.forEach((session, sectionId) => {
    debug[sectionId] = {
      started: session.started,
      participantCount: session.participants.size,
      participants: Array.from(session.participants.values()).map(p => ({
        name: p.displayName,
        ready: p.ready
      })),
      allParticipants: Array.from(session.allParticipants || []),
      submissions: Array.from(session.submissions.entries()).map(([name, data]) => ({
        name,
        score: data.score,
        submittedAt: data.submittedAt
      })),
      quizDocId: session.quizDocId,
      schoolId: session.schoolId,
      gradeId: session.gradeId
    };
  });
  res.json(debug);
});

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('[SOCKET] User connected:', socket.id);

  socket.on('join-section', ({ sectionId, studentName, teacher }) => {
    socket.join(sectionId);
    console.log(`[SOCKET] ${teacher ? 'Teacher' : 'Student'} joining:`, sectionId, studentName);
    
    if (teacher) {
      const session = sessions.get(sectionId);
      if (session) {
        const participants = Array.from(session.participants.values()).map(p => ({
          name: p.displayName,
          ready: p.ready
        }));
        socket.emit('lobby-update', { participants });
        
        // Send current leaderboard to teacher
        const leaderboard = getLeaderboard(session);
        if (leaderboard.length > 0) {
          socket.emit('leaderboard-update', { leaderboard, quizId: session.quizDocId });
        }
      }
      return;
    }

    // Student join
    const session = getSession(sectionId);
    const existingNames = new Set(Array.from(session.participants.values()).map(p => p.displayName));
    const displayName = generateUniqueName(studentName, existingNames);
    
    const participant = {
      name: studentName,
      displayName,
      socketId: socket.id,
      ready: false
    };
    
    session.participants.set(socket.id, participant);
    session.allParticipants.add(displayName);
    
    console.log(`[SOCKET] Student joined: ${studentName} -> ${displayName} (${socket.id})`);
    
    // Update Firebase immediately with participant list
    if (session.quizDocId && session.schoolId && session.gradeId) {
      safeFirestoreOp(async () => {
        const quizDocRef = doc(db, 'schools', session.schoolId, 'grades', session.gradeId, 'sections', sectionId, 'quizzes', session.quizDocId);
        const allParticipants = Array.from(session.allParticipants);
        
        console.log(`[SOCKET] Updating Firebase with participants:`, allParticipants);
        console.log(`[SOCKET] Firebase path: schools/${session.schoolId}/grades/${session.gradeId}/sections/${sectionId}/quizzes/${session.quizDocId}`);
        
        await updateDoc(quizDocRef, {
          participants: allParticipants,
          lastUpdated: new Date().toISOString()
        });
        
        console.log(`[SOCKET] Firebase updated with ${allParticipants.length} participants`);
      });
    } else {
      console.log('[SOCKET] Cannot update Firebase - missing session data:', {
        quizDocId: session.quizDocId,
        schoolId: session.schoolId,
        gradeId: session.gradeId
      });
    }
    
    // Broadcast updates
    const participants = Array.from(session.participants.values()).map(p => ({
      name: p.displayName,
      ready: p.ready,
      isMe: p.socketId === socket.id
    }));
    
    socket.to(sectionId).emit('user-joined', { name: displayName });
    io.to(sectionId).emit('lobby-update', { participants });
    
    // Send current leaderboard to new joiner if quiz is active
    if (session.started) {
      const leaderboard = getLeaderboard(session);
      socket.emit('leaderboard-update', { leaderboard, quizId: session.quizDocId });
    }
  });

  socket.on('set-ready', ({ sectionId, studentName, ready }) => {
    console.log(`[SOCKET] Set ready: ${studentName} -> ${ready}`);
    const session = sessions.get(sectionId);
    const participant = session?.participants.get(socket.id);
    
    if (participant) {
      participant.ready = ready;
      
      const participants = Array.from(session.participants.values()).map(p => ({
        name: p.displayName,
        ready: p.ready,
        isMe: p.socketId === socket.id
      }));
      
      io.to(sectionId).emit('lobby-update', { participants });
    }
  });

  socket.on('submit-answers', async ({ sectionId, studentName, answers, schoolId, gradeId }) => {
    console.log(`[SOCKET] ===== ANSWER SUBMISSION START =====`);
    console.log(`[SOCKET] From: ${studentName} (${socket.id})`);
    console.log(`[SOCKET] Section: ${sectionId}`);
    console.log(`[SOCKET] Answers: ${JSON.stringify(answers)}`);
    console.log(`[SOCKET] School/Grade: ${schoolId}/${gradeId}`);
    
    const session = getSession(sectionId);
    let participant = session.participants.get(socket.id);

    // Handle late joiners
    if (!participant) {
      const existingNames = new Set(Array.from(session.participants.values()).map(p => p.displayName));
      const displayName = generateUniqueName(studentName, existingNames);
      participant = {
        name: studentName,
        displayName,
        socketId: socket.id,
        ready: false
      };
      session.participants.set(socket.id, participant);
      session.allParticipants.add(displayName);
      console.log(`[SOCKET] Created participant for late joiner: ${displayName}`);
    }

    // Always try to restore quizDocId if missing
    if (!session.quizDocId) {
      const quiz = await safeFirestoreOp(async () => {
        const quizzesCol = collection(db, `schools/${schoolId}/grades/${gradeId}/sections/${sectionId}/quizzes`);
        const snapshot = await getDocs(quizzesCol);
        let latestQuiz = null;
        snapshot.forEach(doc => {
          const data = doc.data();
          if (!latestQuiz || data.scheduledAt > latestQuiz.scheduledAt) {
            latestQuiz = { id: doc.id, ...data };
          }
        });
        return latestQuiz;
      });
      if (quiz) {
        session.quizDocId = quiz.id;
        session.schoolId = schoolId;
        session.gradeId = gradeId;
        console.log(`[SOCKET] quizDocId restored from Firestore: ${quiz.id}`);
      }
    }

    const score = calculateScore(answers);
    const participantKey = participant.displayName;

    console.log(`[SOCKET] ${participantKey} scored ${score}/${QUIZ_QUESTIONS.length}`);

    // Store submission in session
    session.submissions.set(participantKey, {
      score,
      answers,
      submittedAt: new Date().toISOString()
    });

    // Use session data for Firebase operations
    const finalSchoolId = schoolId || session.schoolId;
    const finalGradeId = gradeId || session.gradeId;

    console.log(`[SOCKET] Firebase operation data:`, {
      schoolId: finalSchoolId,
      gradeId: finalGradeId,
      sectionId,
      quizDocId: session.quizDocId,
      participantKey
    });

    if (!finalSchoolId || !finalGradeId || !session.quizDocId) {
      console.error('[SOCKET] ❌ Missing required Firebase data - cannot save to database');
      return;
    }

    // Save to Firebase results subcollection
    const firebaseSuccess = await safeFirestoreOp(async () => {
      const resultDocRef = doc(db, 'schools', finalSchoolId, 'grades', finalGradeId, 'sections', sectionId, 'quizzes', session.quizDocId, 'results', participantKey);
      
      console.log(`[SOCKET] Firebase result path: ${resultDocRef.path}`);
      
      // Check existing score
      const existingDoc = await getDoc(resultDocRef);
      const shouldUpdate = !existingDoc.exists() || score > (existingDoc.data()?.score || 0);
      
      if (shouldUpdate) {
        const resultData = {
          name: participantKey,
          score,
          answers,
          submittedAt: new Date().toISOString()
        };
        
        console.log(`[SOCKET] Saving result data:`, resultData);
        await setDoc(resultDocRef, resultData);
        console.log(`[SOCKET] ✅ Result saved to Firebase: ${participantKey} -> ${score}/${QUIZ_QUESTIONS.length}`);
        return true;
      } else {
        console.log(`[SOCKET] ⚠️ Previous score was better for ${participantKey}`);
        return false;
      }
    }, false);

    // Update main quiz document with all current data
    await safeFirestoreOp(async () => {
      const quizDocRef = doc(db, 'schools', finalSchoolId, 'grades', finalGradeId, 'sections', sectionId, 'quizzes', session.quizDocId);
      const allParticipants = Array.from(session.allParticipants);
      const currentResults = getLeaderboard(session);
      
      console.log(`[SOCKET] Updating main quiz doc with:`, {
        participants: allParticipants.length,
        results: currentResults.length
      });
      
      await updateDoc(quizDocRef, {
        participants: allParticipants,
        results: currentResults,
        lastUpdated: new Date().toISOString()
      });
      
      console.log(`[SOCKET] ✅ Main quiz doc updated`);
    });

    // Send real-time leaderboard update to all participants
    const currentLeaderboard = getLeaderboard(session);
    console.log(`[SOCKET] Broadcasting leaderboard:`, currentLeaderboard);
    
    io.to(sectionId).emit('leaderboard-update', { 
      leaderboard: currentLeaderboard,
      quizId: session.quizDocId,
      newSubmission: {
        name: participantKey,
        score
      }
    });
    
    console.log(`[SOCKET] ===== ANSWER SUBMISSION END =====`);
  });

  socket.on('disconnect', () => {
    console.log('[SOCKET] User disconnected:', socket.id);
    
    sessions.forEach((session, sectionId) => {
      const participant = session.participants.get(socket.id);
      if (participant) {
        session.participants.delete(socket.id);
        
        socket.to(sectionId).emit('user-left', { name: participant.displayName });
        
        const participants = Array.from(session.participants.values()).map(p => ({
          name: p.displayName,
          ready: p.ready
        }));
        
        io.to(sectionId).emit('lobby-update', { participants });
        console.log(`[SOCKET] Cleaned up ${participant.displayName} from ${sectionId}`);
      }
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Quiz server running on port ${PORT}`);
  console.log(`🔍 Debug: http://localhost:${PORT}/debug/sessions`);
});