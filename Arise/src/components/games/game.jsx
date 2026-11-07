import { useState, useEffect } from "react";
import quizData from "./quiz.json";

import playerSprite from "/player.png";
import monsterImg from "/Monster.png";
import doorClosedImg from "/door-closed.png";
import doorOpenImg from "/door-open.png";
import treasureClosedImg from "/treasure-closed.png";
import treasureOpenImg from "/treasure-open.png";
import floorImg from "/floor.png";
import wallImg from "/wall.png";

const TILE_SIZE = 64;

const mazeLayoutInitial = [
  ["wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall"],
  ["wall","path","path","door","path","wall","path","door","path","path","path","wall"],
  ["wall","path","wall","wall","path","wall","wall","path","wall","wall","path","wall"],
  ["wall","path","path","path","path","path","wall","path","path","door","path","wall"],
  ["wall","door","wall","door","wall","path","wall","door","wall","path","path","wall"],
  ["wall","path","wall","path","wall","path","wall","path","wall","wall","door","wall"],
  ["wall","door","path","door","path","door","path","treasure","path","path","path","wall"],
  ["wall","path","wall","wall","wall","wall","wall","wall","wall","wall","path","wall"],
  ["wall","path","path","path","path","door","path","path","path","door","path","wall"],
  ["wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall","wall"],
];




export function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [mazeLayout,setMazeLayout] = useState(JSON.parse(JSON.stringify(mazeLayoutInitial)));
  const [playerPos,setPlayerPos] = useState({x:1,y:1});
  const [playerDirection,setPlayerDirection] = useState("down"); 
  const [lives,setLives] = useState(3);
  const [doorQuiz,setDoorQuiz] = useState(null);
  const [monsterPos,setMonsterPos] = useState(null);
  const [doorAnimation,setDoorAnimation] = useState({});
  const [treasureOpen,setTreasureOpen] = useState(false);
  const [message,setMessage] = useState("");
  const [win,setWin] = useState(false);
  const [gameOver,setGameOver] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e) => {
      if (gameOver || win || doorQuiz) return;
      let dx = 0, dy = 0;
      let dir = playerDirection;

      if (e.key === "ArrowUp") { dy = -1; dir = "up"; }
      if (e.key === "ArrowDown") { dy = 1; dir = "down"; }
      if (e.key === "ArrowLeft") { dx = -1; dir = "left"; }
      if (e.key === "ArrowRight") { dx = 1; dir = "right"; }

      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;
      const cell = mazeLayout[newY][newX];

      if (cell === "wall") return;

      setPlayerDirection(dir);
      setIsMoving(true);

      if (cell === "path") setPlayerPos({ x: newX, y: newY });
      if (cell === "door") triggerDoor(newX, newY);
      if (cell === "treasure") openTreasure();
    };

    const handleKeyUp = () => setIsMoving(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playerPos, doorQuiz, win, gameOver, mazeLayout, gameStarted]);

  const triggerDoor = (x,y)=>{
    const question = quizData[Math.floor(Math.random()*quizData.length)];
    setDoorQuiz({...question, doorPos:{x,y}});
  }

  const handleAnswer = (option) => {
    if (!doorQuiz) return;
    const { doorPos } = doorQuiz;

    setDoorQuiz(null);

    if (option === doorQuiz.correct_answer) {
      setMessage("✅ Correct! Door opened!");
      setDoorAnimation({ [`${doorPos.x}-${doorPos.y}`]: true });
      setTimeout(() => {
        setMazeLayout((prev) => {
          const newMaze = JSON.parse(JSON.stringify(prev));
          newMaze[doorPos.y][doorPos.x] = "path";
          return newMaze;
        });
        setPlayerPos(doorPos);
        setDoorAnimation({});
        setMessage("");
      }, 800);
    } else {
      setMessage("💀 Wrong! Monster attacks!");
      setMonsterPos(doorPos);
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setTimeout(() => {
        setMonsterPos(null);
        setMessage("");
        if (remainingLives <= 0) setGameOver(true);
      }, 1500);
    }
  };

  const openTreasure = ()=>{
    setTreasureOpen(true);
    setTimeout(()=> setWin(true),500);
  }

  // Reset Game
  const resetGame = () => {
    setGameStarted(false);
    setMazeLayout(JSON.parse(JSON.stringify(mazeLayoutInitial)));
    setPlayerPos({ x: 1, y: 1 });
    setPlayerDirection("down");
    setLives(3);
    setDoorQuiz(null);
    setMonsterPos(null);
    setDoorAnimation({});
    setTreasureOpen(false);
    setMessage("");
    setWin(false);
    setGameOver(false);
    setIsMoving(false);
  };

  if (!gameStarted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-6">🎮 Treasure Hunting</h1>
          <button
            onClick={() => setGameStarted(true)}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg shadow-lg"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  //<div className="relative w-[456px] h-[456px] border border-yellow-500 bg-gray-900 ">
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
            <div
        className="relative border border-yellow-500 bg-gray-900"
        style={{
                width: mazeLayout[0].length * TILE_SIZE,
                height: mazeLayout.length * TILE_SIZE,
              }}
      >


      {/* Maze Tiles */}
      {mazeLayout.flatMap((row,y)=>row.map((cell,x)=>{
        let img = floorImg;
        if(cell==="wall") img = wallImg;
        return <img key={`${x}-${y}`} src={img} className="absolute w-16 h-16" style={{left:x*TILE_SIZE, top:y*TILE_SIZE}} />
      }))}

      {/* Doors */}
      {mazeLayout.flatMap((row,y)=>row.map((cell,x)=>{
        if(cell==="door")
          return <img key={`door-${x}-${y}`} src={doorAnimation[`${x}-${y}`]?doorOpenImg:doorClosedImg} 
          className="absolute w-16 h-16 transition-transform duration-300" 
          style={{left:x*TILE_SIZE, top:y*TILE_SIZE, transform:doorAnimation[`${x}-${y}`]?"translateY(-16px)":"translateY(0)"}} />
      }))}

      {/* Monster */}
      {monsterPos && <div className="absolute w-16 h-16 overflow-hidden" style={{left:monsterPos.x*TILE_SIZE, top:monsterPos.y*TILE_SIZE}}>
        <img src={monsterImg} className="w-64 h-16 animate-[monsterAttack_1.5s_steps(4)_1]" />
      </div>}

      {/* Treasure */}
      {mazeLayout.flatMap((row,y)=>row.map((cell,x)=>{
        if(cell==="treasure")
          return <img key={`treasure-${x}-${y}`} src={treasureOpen?treasureOpenImg:treasureClosedImg} 
          className="absolute w-16 h-16 animate-pulse" 
          style={{left:x*TILE_SIZE, top:y*TILE_SIZE}} />
      }))}

      {/* Player (sprite sheet) */}
      <div
        className="absolute"
        style={{
          left: playerPos.x * TILE_SIZE,
          top: playerPos.y * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          backgroundImage: `url(${playerSprite})`,
          backgroundSize: "256px 256px", // full sheet size
          animation: isMoving
            ? playerDirection === "down"
              ? "walk-down 0.4s steps(4) infinite"
              : playerDirection === "left"
              ? "walk-left 0.4s steps(4) infinite"
              : playerDirection === "right"
              ? "walk-right 0.4s steps(4) infinite"
              : "walk-up 0.4s steps(4) infinite"
            : "none",
        }}
      />

      {/* Quiz Modal */}
      {doorQuiz && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-80">
            <p className="font-semibold mb-2">{doorQuiz.question}</p>
            <div className="grid grid-cols-1 gap-2">
              {doorQuiz.options.map((option,idx)=>(
                <button key={idx} className="bg-purple-300 hover:bg-purple-400 p-2 rounded font-semibold" onClick={()=>handleAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages & Lives */}
      {message && <p className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 font-bold text-red-600 z-50">{message}</p>}
      
      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center z-50">
          <p className="text-3xl font-bold text-red-700 mb-4">☠️ Game Over!</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg shadow-lg"
          >
            Exit Game
          </button>
        </div>
      )}

      {/* Win Overlay */}
      {win && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center z-50">
          <p className="text-3xl font-bold text-green-700 mb-4">🎉 You found the treasure!</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg shadow-lg"
          >
            Exit Game
          </button>
        </div>
      )}

      <p className="absolute top-0 left-2 font-bold text-white z-50">Lives: {lives}</p>

      {/* Inline CSS keyframes */}
      <style>
      {`
        html, body, #root {
          height: 100%;
          margin: 0;
        }

        @keyframes walk-down {
          from { background-position: 0px 0px; }
          to   { background-position: -256px 0px; }
        }
        @keyframes walk-left {
          from { background-position: 0px -64px; }
          to   { background-position: -256px -64px; }
        }
        @keyframes walk-right {
          from { background-position: 0px -128px; }
          to   { background-position: -256px -128px; }
        }
        @keyframes walk-up {
          from { background-position: 0px -192px; }
          to   { background-position: -256px -192px; }
        }
      `}
      </style>
      </div>
    </div>
  )
}

// Export metadata for Playground listing
export const metadata = {
  name: "Treasure Hunting",
  gradeLevel: "6-12",
  category: "Science",
  icon: "💰"
};
