import React from "react";

export default function NutrientCard({ item, onClick, className, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-5 rounded-xl shadow-md font-semibold text-lg text-gray-800
                  transition-all duration-300 ease-in-out
                  hover:scale-105 hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${className}`}
    >
      {item.nutrient}
    </button>
  );
}


