import { useState } from "react";
import cardsData from "./cards.json";

export function Flashcards() {
  const [stage, setStage] = useState("start");
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Shuffle cards when starting
  const startLearning = () => {
    const shuffled = [...cardsData].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setStage("flashcards");
    setFlipped(false);
    setFeedback("");
  };

  // ================== START PAGE ==================
  if (stage === "start") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative bg-start-pattern">
        {/* Medium transparent bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(15)].map((_, i) => (
            <span
              key={i}
              className="bubble"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 12}s`,
                animationDuration: `${12 + Math.random() * 10}s`,
                width: `${50 + Math.random() * 50}px`,
                height: `${50 + Math.random() * 50}px`,
              }}
            ></span>
          ))}
        </div>

        <h1 className="text-6xl font-extrabold text-purple-900 mb-6 drop-shadow-lg animate-slide-down relative z-10">
          🚀 Fun Flashcards
        </h1>
        <p className="text-xl text-gray-800 mb-8 animate-fade-in relative z-10">
          Train your memory in a calm and fun way ✨
        </p>
        <button
          onClick={startLearning}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl shadow-lg hover:scale-105 transform transition animate-slide-up relative z-10"
        >
          Start Learning ▶️
        </button>
        <PatternStyles />
      </div>
    );
  }

  // ================== FINISH PAGE ==================
  if (stage === "finish") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-end-pattern">
        {/* Confetti */}
        <div className="absolute w-full h-full pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <span
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
                fontSize: `${16 + Math.random() * 24}px`,
              }}
            >
              {["🎉", "✨", "💜", "🔺", "⬜", "⭐"][Math.floor(Math.random() * 5)]}
            </span>
          ))}
        </div>

        <div className="bg-white/80 rounded-3xl shadow-2xl p-10 text-center backdrop-blur-md relative z-10 animate-zoom-in">
          <h1 className="text-5xl font-bold text-purple-800 mb-6 animate-slide-down">
            🎉 Well Done! 🎉
          </h1>
          <p className="text-xl text-gray-700 mb-6 animate-fade-in">
            You went through all the flashcards 🌟
          </p>
          <button
            onClick={() => setStage("start")}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl shadow-lg hover:scale-105 transition animate-slide-up"
          >
            🔄 Back to Start
          </button>
        </div>
        <PatternStyles />
      </div>
    );
  }

  // ================== FLASHCARD PAGE ==================
  const card = cards[currentIndex];

  const handleFlip = () => {
    setFlipped(!flipped);
    if (!flipped) {
      setTimeout(() => setFeedback("✨ Remember this!"), 600);
    } else {
      setFeedback("");
    }
  };

  const handleNext = () => {
    setFlipped(false);
    setFeedback("");
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStage("finish");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative bg-flash-pattern">
      {/* Medium transparent bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${12 + Math.random() * 10}s`,
              width: `${50 + Math.random() * 50}px`,
              height: `${50 + Math.random() * 50}px`,
            }}
          ></span>
        ))}
      </div>

      {/* Stars and circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute star-shape"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              fontSize: `${24 + Math.random() * 20}px`,
            }}
          >
            ⭐
          </span>
        ))}
        {[...Array(6)].map((_, i) => (
          <span
            key={`circle-${i}`}
            className="absolute circle-shape"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              fontSize: `${20 + Math.random() * 30}px`,
            }}
          >
            🔵
          </span>
        ))}
      </div>

      <h1 className="text-4xl font-extrabold mb-6 text-purple-900 drop-shadow animate-slide-down relative z-10">
        🎯 Flashcards
      </h1>

      {/* Card */}
      <Card
        question={card.question}
        answer={card.answer}
        flipped={flipped}
        onFlip={handleFlip}
      />

      {/* Feedback */}
      {feedback && (
        <p className="mt-4 text-xl font-bold text-purple-900 animate-fade-in relative z-10">
          {feedback}
        </p>
      )}

      {/* Controls */}
      <div className="flex gap-4 mt-6 relative z-10">
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transform transition"
        >
          Next ➡️
        </button>
      </div>

      <PatternStyles />
    </div>
  );
}

// ================== CARD COMPONENT ==================
function Card({ question, answer, flipped, onFlip }) {
  return (
    <div
      className="w-80 h-56 mb-4 cursor-pointer"
      onClick={onFlip}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div className="absolute w-full h-full bg-white/80 backdrop-blur-md border border-purple-200 rounded-2xl shadow-xl flex items-center justify-center p-6 [backface-visibility:hidden]">
          <p className="text-xl font-bold text-blue-800">{question}</p>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full bg-green-200/90 backdrop-blur-md border border-green-300 rounded-2xl shadow-xl flex items-center justify-center p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-xl font-semibold text-purple-900">{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ================== PATTERN STYLES ==================
function PatternStyles() {
  return (
    <style>{`
      /* Start page gradient */
      .bg-start-pattern {
        background: linear-gradient(-45deg, #fbc2eb, #a6c1ee, #fad0c4, #fbc2eb);
        background-size: 400% 400%;
        animation: gradientShift 12s ease infinite;
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* Flashcard page background */
      .bg-flash-pattern {
        background: radial-gradient(circle at 20% 20%, #fbc2eb, transparent 60%),
                    radial-gradient(circle at 80% 80%, #a6c1ee, transparent 60%);
        animation: floatBG 8s ease-in-out infinite alternate;
      }
      @keyframes floatBG {
        0% { background-position: 0% 0%, 100% 100%; }
        50% { background-position: 10% 5%, 90% 95%; }
        100% { background-position: 0% 0%, 100% 100%; }
      }

      /* Finish page background */
      .bg-end-pattern {
        background: radial-gradient(circle at 30% 30%, #fad0c4, transparent 60%),
                    radial-gradient(circle at 70% 70%, #fbc2eb, transparent 60%);
        animation: floatFinishBG 10s ease-in-out infinite alternate;
      }
      @keyframes floatFinishBG {
        0% { background-position: 0% 0%, 100% 100%; }
        50% { background-position: 5% 5%, 95% 95%; }
        100% { background-position: 0% 0%, 100% 100%; }
      }

      /* Transparent medium bubbles */
      .bubble {
        position: absolute;
        bottom: -100px;
        background: rgba(255, 255, 255, 0.25);
        border-radius: 50%;
        animation: rise 18s linear infinite;
      }
      @keyframes rise {
        0% { transform: translateY(0) scale(1); opacity: 0; }
        20% { opacity: 0.6; }
        100% { transform: translateY(-120vh) scale(1.2); opacity: 0; }
      }

      /* Stars and circles */
      .star-shape {
        animation: twinkle 4s infinite alternate;
      }
      .circle-shape {
        animation: floatCircle 6s infinite alternate;
      }
      @keyframes twinkle {
        0% { opacity: 0.2; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1.2); }
      }
      @keyframes floatCircle {
        0% { transform: translateY(0px); opacity: 0.5; }
        100% { transform: translateY(-20px); opacity: 1; }
      }

      /* Confetti fall */
      @keyframes fall {
        0% { transform: translateY(-50px) rotate(0deg) scale(1); opacity:1; }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: translateY(100vh) rotate(360deg) scale(1); opacity:0; }
      }
      .animate-fall { animation: fall 3s linear infinite; }

      /* Entrance animations */
      @keyframes slideDown { 0%{opacity:0; transform:translateY(-40px);} 100%{opacity:1; transform:translateY(0);} }
      @keyframes slideUp { 0%{opacity:0; transform:translateY(40px);} 100%{opacity:1; transform:translateY(0);} }
      @keyframes fadeIn { 0%{opacity:0;} 100%{opacity:1;} }
      @keyframes zoomIn { 0%{opacity:0; transform:scale(0.7);} 100%{opacity:1; transform:scale(1);} }

      .animate-slide-down { animation: slideDown 0.8s ease forwards; }
      .animate-slide-up { animation: slideUp 0.8s ease forwards; }
      .animate-fade-in { animation: fadeIn 1s ease forwards; }
      .animate-zoom-in { animation: zoomIn 0.8s ease forwards; }
    `}</style>
  );
}

export const metadata = {
  name: "Flashcards",
  gradeLevel: "6-12",
  category: "Science",
  icon: "📚📝"
};
