import React from 'react';


export function MathQuizGame() {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Math Quiz Game</h2>
      <p className="mb-4 text-slate-700">Test your math skills with fun questions!</p>
      <div className="text-5xl mb-4">➗</div>
      <p className="text-slate-500">(Game UI coming soon...)</p>
    </div>
  );
}

export const metadata = {
  name: "Math Quiz",
  gradeLevel: "6-10",
  category: "Math",
  icon: "➗"
};
