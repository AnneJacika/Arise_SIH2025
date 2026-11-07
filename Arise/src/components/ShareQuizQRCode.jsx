// src/components/ShareQuizQRCode.jsx
import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { getQuiz } from '../utils/db';

export default function ShareQuizQRCode({ quizId }) {
  const [quizData, setQuizData] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const handleShowQR = async () => {
    const quiz = await getQuiz(quizId);
    if (quiz) {
      // Only include essential fields to keep QR small
      const minimalQuiz = {
        title: quiz.title,
        subject: quiz.subject,
        grade: quiz.grade,
        questions: quiz.questions
      };
      setQuizData(minimalQuiz);
      setShowQR(true);
    }
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
        onClick={handleShowQR}
      >
        Share via QR Code
      </button>
      {showQR && quizData && (
        <div className="mt-4 flex flex-col items-center">
          <QRCode value={JSON.stringify(quizData)} size={256} />
          <div className="mt-2 text-xs text-gray-600">Scan this QR on another device to import this quiz.</div>
        </div>
      )}
    </div>
  );
}
