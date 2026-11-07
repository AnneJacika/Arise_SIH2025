import React from 'react';
import { Link } from 'react-router-dom';

export default function Lab() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <h1 className="text-4xl font-bold mb-8 text-slate-800">Science Lab</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
        <Link to="/lab/physics" className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:bg-blue-100 transition">
          <span className="text-5xl mb-4">🧲</span>
          <span className="font-bold text-xl text-blue-700">Physics Lab</span>
        </Link>
        <Link to="/lab/chemistry" className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:bg-green-100 transition">
          <span className="text-5xl mb-4">⚗️</span>
          <span className="font-bold text-xl text-green-700">Chemistry Lab</span>
        </Link>
        <Link to="/lab/biology" className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center hover:bg-pink-100 transition">
          <span className="text-5xl mb-4">🧬</span>
          <span className="font-bold text-xl text-pink-700">Biology Lab</span>
        </Link>
      </div>
    </div>
  );
}
