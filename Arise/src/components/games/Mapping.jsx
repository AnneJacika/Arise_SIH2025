import React, { useState, useEffect, useCallback } from "react";
import FoodCard from "./FoodCard";
import NutrientCard from "./NutrientCard";
import GameOverMessage from "./GameOverMessage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export function Mapping() {
  const [allGameData, setAllGameData] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [nutrientItems, setNutrientItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const shuffle = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const initializeGame = useCallback((data) => {
    if (!data || data.length === 0) return;

    const shuffledFoods = shuffle(
      data.map((item) => ({ food: item.food, emoji: item.emoji, id: item.food }))
    );
    const shuffledNutrients = shuffle(
      data.map((item) => ({ nutrient: item.nutrient, id: item.food }))
    );

    setFoodItems(shuffledFoods);
    setNutrientItems(shuffledNutrients);
    setSelectedFood(null);
    setSelectedNutrient(null);
    setMatches([]);
    setMessage("");
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    const fetchGameMaterials = async () => {
      try {
        const docRef = doc(
          db,
          "Classes",
          "6",
          "Team",
          "A",
          "GameMaterials",
          "6AG001"
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data().materials;
          setAllGameData(data);
          initializeGame(data);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGameMaterials();
  }, [initializeGame]);

  useEffect(() => {
    if (selectedFood && selectedNutrient) {
      if (selectedNutrient === selectedFood) {
        setMatches((prev) => [
          ...prev,
          { food: selectedFood, nutrientId: selectedFood },
        ]);
        setMessage("Correct!");
        setSelectedFood(null);
        setSelectedNutrient(null);
      } else {
        setMessage("Incorrect, try again.");
        setTimeout(() => {
          setMessage("");
          setSelectedFood(null);
          setSelectedNutrient(null);
        }, 1000);
      }
    }
  }, [selectedFood, selectedNutrient]);

  useEffect(() => {
    if (allGameData.length > 0 && matches.length === allGameData.length) {
      setIsGameOver(true);
    }
  }, [matches, allGameData]);

  const handleFoodClick = (foodId) => {
    if (!matches.some((m) => m.food === foodId)) {
      setSelectedFood(foodId);
      setMessage("");
    }
  };

  const handleNutrientClick = (nutrientId) => {
    if (!matches.some((m) => m.nutrientId === nutrientId)) {
      setSelectedNutrient(nutrientId);
      setMessage("");
    }
  };

  const getCardStyle = (item, isFood) => {
    const isMatched = isFood
      ? matches.some((m) => m.food === item.id)
      : matches.some((m) => m.nutrientId === item.id);
    const isSelected = isFood
      ? selectedFood === item.id
      : selectedNutrient === item.id;

    if (isMatched)
      return "bg-gradient-to-r from-purple-500 to-pink-500 text-white opacity-60 pointer-events-none";
    if (isSelected)
      return "bg-yellow-400 text-white ring-4 ring-yellow-200 scale-105";
    return "bg-white/70 backdrop-blur-md hover:scale-105";
  };

  const addGameMaterial = async (classId, teamId, materialId, title, materials) => {
    try {
      const docRef = doc(
        db,
        "Classes",
        classId,
        "Team",
        teamId,
        "GameMaterials",
        materialId
      );
      await setDoc(docRef, { title, materials, createdAt: new Date() });
      console.log("Game material added successfully!");
    } catch (error) {
      console.error("Error adding game material:", error);
    }
  };

  if (loading)
    return (
      <div className="text-center text-lg p-12">Loading game data...</div>
    );

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 font-sans">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-[90%] max-w-5xl border border-white/40">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 drop-shadow-md">
            Nutrient Match
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Match each food item with its nutrient partner!
          </p>
        </header>

        <div className="text-center font-bold text-lg mb-6 text-purple-700">
          Score: {matches.length} / {allGameData.length}
        </div>

        {isGameOver ? (
          <GameOverMessage onPlayAgain={() => initializeGame(allGameData)} />
        ) : (
          <div className="flex flex-wrap gap-10">
            <div className="flex-1 min-w-[40%]">
              <h2 className="text-center text-2xl font-semibold text-purple-700 mb-5">
                🍎 Food Items
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {foodItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onClick={() => handleFoodClick(item.id)}
                    className={`p-5 rounded-2xl text-center font-bold cursor-pointer shadow-lg transition-all duration-300 ${getCardStyle(
                      item,
                      true
                    )}`}
                    disabled={matches.some((m) => m.food === item.id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-[40%]">
              <h2 className="text-center text-2xl font-semibold text-pink-600 mb-5">
                🌟 Nutrients
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {nutrientItems.map((item) => (
                  <NutrientCard
                    key={item.id}
                    item={item}
                    onClick={() => handleNutrientClick(item.id)}
                    className={`p-5 rounded-2xl text-center font-bold cursor-pointer shadow-lg transition-all duration-300 ${getCardStyle(
                      item,
                      false
                    )}`}
                    disabled={matches.some((m) => m.nutrientId === item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`text-center mt-8 text-2xl font-extrabold drop-shadow-md ${
              message === "Correct!" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
export const metadata = {
  name: "Mapping",
  gradeLevel: "6-12",
  category: "Science",
  icon: "🥷"
};