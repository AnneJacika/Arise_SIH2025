import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

// Sprites
import foxCenter from "/foxCenter.png";
import foxLeft from "/foxLeft.png";
import foxRight from "/foxRight.png";
import blueEgg from "/blue.png";
import pinkEgg from "/pink.png";
import greenEgg from "/green.png";
import yellowEgg from "/yellow.png";
import background from "/background.png";

export function Game() {
  const [playerPos, setPlayerPos] = useState(50);
  const [direction, setDirection] = useState("center");
  const [eggs, setEggs] = useState([]);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [questions, setQuestions] = useState([]);

  const gameAreaRef = useRef(null);
  const eggSprites = [blueEgg, pinkEgg, greenEgg, yellowEgg];

  // Load questions from JSON
  useEffect(() => {
    fetch("/quiz.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Error loading questions:", err));
  }, []);

  // Egg falling + collision
  useEffect(() => {
    if (!showModal && !gameOver && questions.length > 0) {
      const timer = setInterval(() => {
        setEggs((prev) =>
          prev.map((egg) => {
            if (egg.vanished) return egg;

            const newY = egg.y + 3;

            // Collision with fox
            if (newY > 75 && Math.abs(egg.x - playerPos) < 12) {
              if (egg.option === questions[questionIndex].correct_answer) {
                // ✅ increment score here
                setScore((s) => s + 1);
              }
              return { ...egg, y: newY, vanished: true };
            }

            // Missed egg
            if (newY > 100) {
              return { ...egg, y: newY, vanished: true };
            }

            return { ...egg, y: newY };
          })
        );
      }, 100);

      return () => clearInterval(timer);
    }
  }, [showModal, gameOver, playerPos, questionIndex, questions]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") {
        setPlayerPos((p) => Math.max(5, p - 10));
        setDirection("left");
        setTimeout(() => setDirection("center"), 200);
      } else if (e.key === "ArrowRight") {
        setPlayerPos((p) => Math.min(95, p + 10));
        setDirection("right");
        setTimeout(() => setDirection("center"), 200);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Spawn eggs for a question
  useEffect(() => {
    if (!showModal && eggs.length === 0 && !gameOver && questions.length > 0) {
      const q = questions[questionIndex];
      const newEggs = q.options.map((opt, idx) => ({
        x: 15 + idx * 20,
        y: 0,
        option: opt,
        idx,
        vanished: false,
      }));
      setEggs(newEggs);
    }
  }, [showModal, questionIndex, gameOver, questions]);

  // Progress to next question
  useEffect(() => {
    if (eggs.length > 0 && eggs.every((e) => e.vanished)) {
      if (questionIndex + 1 < questions.length) {
        setEggs([]);
        setShowModal(true);
        setQuestionIndex((i) => i + 1);
        setTimeLeft(10);
      } else {
        setGameOver(true);
      }
    }
  }, [eggs, questionIndex, questions.length]);

  // Modal timer
  useEffect(() => {
    if (showModal && !gameOver) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setShowModal(false);
      }
    }
  }, [showModal, timeLeft, gameOver]);

  const foxSprite =
    direction === "left" ? foxLeft : direction === "right" ? foxRight : foxCenter;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
      <div
        ref={gameAreaRef}
        className="relative w-[800px] h-[600px] overflow-hidden rounded-xl shadow-xl"
        style={{ backgroundImage: `url(${background})`, backgroundSize: "cover" }}
      >
        {gameOver && (
          <>
            <Confetti width={800} height={600} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-3xl font-bold">
              Game Over! Your Score: {score / 2}
            </div>
          </>
        )}

        {!gameOver && questions.length > 0 && (
          <>
            {/* Options Header */}
            <div className="absolute top-0 left-0 right-0 flex justify-around p-4">
              {questions[questionIndex].options.map((opt, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-xl text-white font-bold"
                  style={{
                    backgroundColor: ["#3b82f6", "#ec4899", "#22c55e", "#eab308"][idx],
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>

            {/* Eggs */}
            {eggs.map(
              (egg, i) =>
                !egg.vanished && (
                  <motion.img
                    key={i}
                    src={eggSprites[egg.idx]}
                    alt="egg"
                    className="absolute w-10 h-14"
                    style={{ left: `${egg.x}%`, top: `${egg.y}%` }}
                  />
                )
            )}

            {/* Player (Fox) */}
            <img
              src={foxSprite}
              alt="fox"
              className="absolute bottom-0 w-28 h-28"
              style={{ left: `${playerPos}%`, transform: "translateX(-50%)" }}
            />

            {/* Modal */}
            {showModal && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {questions[questionIndex].question}
                </h2>
                <p className="text-lg">Time left: {timeLeft}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


export const metadata = {
  name: "Egg Catcher",
  gradeLevel: "3-8",
  category: "science",
  icon: "🏎️"
};
