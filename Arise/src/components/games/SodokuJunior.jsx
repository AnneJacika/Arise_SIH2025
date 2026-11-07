import React, { useState, useEffect } from 'react';

// Pre-made 4x4 puzzles (0 = empty)
const PUZZLES_4X4 = [
  {
    puzzle: [[1, 0, 0, 4], [0, 3, 1, 0], [0, 2, 4, 0], [4, 0, 0, 1]],
    solution: [[1, 2, 3, 4], [2, 3, 1, 4], [3, 2, 4, 1], [4, 1, 2, 1]]
  },
  {
    puzzle: [[0, 2, 0, 0], [3, 0, 0, 1], [0, 0, 0, 4], [0, 0, 3, 0]],
    solution: [[1, 2, 4, 3], [3, 4, 2, 1], [2, 1, 3, 4], [4, 3, 1, 2]]
  },
  {
    puzzle: [[2, 0, 0, 1], [0, 0, 2, 0], [0, 1, 0, 0], [4, 0, 0, 3]],
    solution: [[2, 3, 4, 1], [1, 4, 2, 3], [3, 1, 4, 2], [4, 2, 1, 3]]
  },
  {
    puzzle: [[0, 4, 0, 0], [0, 0, 0, 2], [3, 0, 0, 0], [0, 0, 1, 0]],
    solution: [[1, 4, 3, 2], [4, 1, 2, 3], [3, 2, 4, 1], [2, 3, 1, 4]]
  },
  {
    puzzle: [[0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 1], [0, 4, 0, 0]],
    solution: [[3, 2, 1, 4], [1, 4, 3, 2], [2, 3, 4, 1], [4, 1, 2, 3]]
  }
];

// Pre-made 6x6 puzzles
const PUZZLES_6X6 = [
  {
    puzzle: [
      [1, 0, 0, 0, 5, 0],
      [0, 5, 0, 0, 0, 1],
      [0, 0, 1, 6, 0, 0],
      [0, 0, 6, 1, 0, 0],
      [6, 0, 0, 0, 3, 0],
      [0, 3, 0, 0, 0, 6]
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 2, 1, 3],
      [2, 3, 1, 6, 4, 5],
      [3, 4, 6, 1, 2, 5],
      [6, 1, 2, 5, 3, 4],
      [5, 3, 4, 3, 6, 1]
    ]
  },
  {
    puzzle: [
      [0, 1, 0, 0, 0, 3],
      [0, 0, 3, 1, 0, 0],
      [1, 0, 0, 0, 2, 0],
      [0, 5, 0, 0, 0, 4],
      [0, 0, 6, 5, 0, 0],
      [4, 0, 0, 0, 1, 0]
    ],
    solution: [
      [2, 1, 4, 6, 5, 3],
      [5, 6, 3, 1, 4, 2],
      [1, 3, 5, 4, 2, 6],
      [3, 5, 1, 2, 6, 4],
      [6, 2, 6, 5, 3, 1],
      [4, 4, 2, 3, 1, 5]
    ]
  }
];

export function SudokuJunior() {
  const [gridSize, setGridSize] = useState(4);
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isTimerActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeGame = (size) => {
    const puzzles = size === 4 ? PUZZLES_4X4 : PUZZLES_6X6;
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    
    setBoard(randomPuzzle.puzzle.map(row => [...row]));
    setSolution(randomPuzzle.solution);
    setInitialBoard(randomPuzzle.puzzle.map(row => [...row]));
    setSelectedCell(null);
    setGameStatus('playing');
    setMistakes(0);
    setTimer(0);
    setIsTimerActive(true);
  };

  useEffect(() => {
    initializeGame(gridSize);
  }, [gridSize]);

  const isValidMove = (row, col, num) => {
    // Check row
    for (let i = 0; i < gridSize; i++) {
      if (i !== col && board[row][i] === num) return false;
    }

    // Check column
    for (let i = 0; i < gridSize; i++) {
      if (i !== row && board[i][col] === num) return false;
    }

    // Check box (2x3 for 4x4, 2x3 for 6x6)
    const boxRows = gridSize === 4 ? 2 : 2;
    const boxCols = gridSize === 4 ? 2 : 3;
    const boxStartRow = Math.floor(row / boxRows) * boxRows;
    const boxStartCol = Math.floor(col / boxCols) * boxCols;

    for (let i = boxStartRow; i < boxStartRow + boxRows; i++) {
      for (let j = boxStartCol; j < boxStartCol + boxCols; j++) {
        if (i !== row && j !== col && board[i][j] === num) return false;
      }
    }

    return true;
  };

  const handleCellClick = (row, col) => {
    if (initialBoard[row][col] !== 0 || gameStatus !== 'playing') return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = (num) => {
    if (!selectedCell || gameStatus !== 'playing') return;
    
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== 0) return;

    const newBoard = board.map(r => [...r]);
    
    if (newBoard[row][col] === num) {
      newBoard[row][col] = 0; // Remove number if clicking same one
    } else {
      newBoard[row][col] = num;
      
      // Check if move is correct
      if (solution[row][col] !== num) {
        setMistakes(prev => prev + 1);
      }
    }

    setBoard(newBoard);

    // Check if puzzle is solved
    const isSolved = newBoard.every((row, i) => 
      row.every((cell, j) => cell === solution[i][j])
    );

    if (isSolved) {
      setGameStatus('won');
      setIsTimerActive(false);
    }
  };

  const getCellColor = (row, col, value) => {
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    const isInitial = initialBoard[row][col] !== 0;
    const isCorrect = value === solution[row][col];
    const isEmpty = value === 0;

    if (isSelected) return 'bg-blue-200 border-blue-400';
    if (isInitial) return 'bg-gray-100 border-gray-300';
    if (isEmpty) return 'bg-white border-gray-300';
    if (!isCorrect && value !== 0) return 'bg-red-100 border-red-300';
    return 'bg-green-50 border-green-300';
  };

  const getBoxBorder = (row, col) => {
    const boxRows = gridSize === 4 ? 2 : 2;
    const boxCols = gridSize === 4 ? 2 : 3;
    
    let classes = 'border-2';
    
    if (row % boxRows === boxRows - 1) classes += ' border-b-4';
    if (col % boxCols === boxCols - 1) classes += ' border-r-4';
    if (row % boxRows === 0) classes += ' border-t-4';
    if (col % boxCols === 0) classes += ' border-l-4';
    
    return classes;
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Sudoku Junior</h1>
        <p className="text-gray-600">Fill the grid with numbers!</p>
      </div>

      {/* Game Controls */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-2">
          <button
            onClick={() => setGridSize(4)}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              gridSize === 4 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            4×4
          </button>
          <button
            onClick={() => setGridSize(6)}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              gridSize === 6 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            6×6
          </button>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Time: {formatTime(timer)}</div>
          <div className="text-sm text-gray-600">Mistakes: {mistakes}</div>
        </div>
      </div>

      {/* Victory Message */}
      {gameStatus === 'won' && (
        <div className="text-center mb-6 p-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">🎉 Congratulations!</h2>
          <p className="mb-2">Puzzle solved in {formatTime(timer)}!</p>
          <p className="text-sm">Mistakes: {mistakes}</p>
          <button
            onClick={() => initializeGame(gridSize)}
            className="mt-4 px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            New Puzzle
          </button>
        </div>
      )}

      {/* Game Board */}
      <div className="flex justify-center mb-6">
        <div className="inline-block bg-white p-4 rounded-lg shadow-lg border-4 border-gray-800">
          <div className={`grid gap-1 ${gridSize === 4 ? 'grid-cols-4' : 'grid-cols-6'}`}>
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`
                    w-12 h-12 flex items-center justify-center cursor-pointer font-bold text-lg
                    transition-all duration-200 hover:scale-105
                    ${getCellColor(rowIndex, colIndex, cell)}
                    ${getBoxBorder(rowIndex, colIndex)}
                    ${initialBoard[rowIndex][colIndex] !== 0 ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Number Input */}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-center text-gray-600 mb-3">
            {selectedCell ? 'Select a number:' : 'Tap a cell first'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: gridSize }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                disabled={!selectedCell || gameStatus !== 'playing'}
                className="w-12 h-12 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleNumberInput(0)}
              disabled={!selectedCell || gameStatus !== 'playing'}
              className="w-12 h-12 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold rounded-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => initializeGame(gridSize)}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md"
        >
          New Puzzle
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-2">How to Play:</h3>
        <p>Fill each row, column, and box with numbers 1-{gridSize}.</p>
        <p>Each number can appear only once in each row, column, and box!</p>
      </div>
    </div>
  );
}

export const metadata = {
  name: "Sudoku Junior",
  gradeLevel: "4-10",
  category: "Logic",
  icon: "🔢"
};