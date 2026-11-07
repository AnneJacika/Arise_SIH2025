
import React from "react";

export default function FoodCard({ item, onClick, className, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl shadow-md font-semibold
                  text-lg transition-all duration-300 ease-in-out
                  hover:scale-105 hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${className}`}
    >
      <span className="text-3xl">{item.emoji}</span>
      <span className="text-gray-800">{item.food}</span>
    </button>
  );
}
