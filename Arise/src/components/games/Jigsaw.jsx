// import React, { useState, useEffect, useCallback } from "react";

// export const Jigsaw = ({ photo, gridSize = 3 }) => {
//   const [pieces, setPieces] = useState([]);
//   const [solved, setSolved] = useState(false);
//   const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

//   // Memoize the puzzle initialization function
//   const initializePuzzle = useCallback(() => {
//     if (!imageSize.width) return;

//     const pieceWidth = imageSize.width / gridSize;
//     const pieceHeight = imageSize.height / gridSize;
//     const newPieces = [];

//     // Create the pieces in order
//     for (let i = 0; i < gridSize * gridSize; i++) {
//       const row = Math.floor(i / gridSize);
//       const col = i % gridSize;
//       newPieces.push({
//         correctIndex: i,
//         style: {
//           backgroundImage: url(${photo}),
//           backgroundPosition: -${col * pieceWidth}px -${row * pieceHeight}px,
//           width: ${pieceWidth}px,
//           height: ${pieceHeight}px,
//         },
//       });
//     }

//     // Shuffle the pieces
//     for (let i = newPieces.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
//     }

//     setPieces(newPieces);
//     setSolved(false);
//   }, [photo, gridSize, imageSize]);

//   // Effect to load the image and get its dimensions
//   useEffect(() => {
//     const img = new Image();
//     img.src = photo;
//     img.onload = () => {
//       setImageSize({ width: img.width, height: img.height });
//     };
//   }, [photo]);

//   // Effect to initialize the puzzle once the image is loaded
//   useEffect(() => {
//     initializePuzzle();
//   }, [imageSize, initializePuzzle]);

//   // Effect to check if the puzzle is solved after every move
//   useEffect(() => {
//     if (pieces.length === 0) return;
//     const isSolved = pieces.every(
//       (piece, index) => piece.correctIndex === index,
//     );
//     if (isSolved) {
//       setSolved(true);
//     }
//   }, [pieces]);

//   // Drag and drop handlers
//   const handleDragStart = (e, index) => {
//     e.dataTransfer.setData("text/plain", index);
//   };

//   const handleDrop = (e, toIndex) => {
//     const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
//     if (fromIndex !== toIndex) {
//       const newPieces = [...pieces];
//       [newPieces[fromIndex], newPieces[toIndex]] = [
//         newPieces[toIndex],
//         newPieces[fromIndex],
//       ];
//       setPieces(newPieces);
//     }
//   };

//   if (!imageSize.width) {
//     return <div className="text-center p-5 font-sans">Loading Puzzle...</div>;
//   }

//   return (
//     <div className="flex flex-col items-center p-5 font-sans">
//       <div
//         className="grid border-2 border-gray-800 shadow-lg"
//         style={{
//           gridTemplateColumns: repeat(${gridSize}, 1fr),
//           width: ${imageSize.width}px,
//         }}
//       >
//         {pieces.map((piece, index) => (
//           <div
//             key={piece.correctIndex}
//             className={`
//               transition-all duration-200 ease-in-out cursor-grab z-0
//               ${solved 
//                 ? 'border-none cursor-default' 
//                 : 'border border-white active:cursor-grabbing active:scale-105 active:shadow-xl active:z-10'
//               }
//             `}
//             draggable={!solved}
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={(e) => e.preventDefault()}
//             onDrop={(e) => handleDrop(e, index)}
//             style={piece.style}
//           />
//         ))}
//       </div>
//       {solved && (
//         <div className="mt-5 text-3xl text-green-600 font-bold">
//           Solved! 🎉
//         </div>
//       )}
//       <button 
//         onClick={initializePuzzle} 
//         className="mt-5 px-5 py-2 text-base cursor-pointer border-none bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//       >
//         Reset Puzzle
//       </button>
//     </div>
//   );
// };

// // Demo component to show the jigsaw puzzle in action
// const JigsawDemo = () => {
//   const [selectedImage, setSelectedImage] = useState("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop");
//   const [gridSize, setGridSize] = useState(3);

//   const sampleImages = [
//     { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", name: "Mountain Lake" },
//     { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop", name: "Forest Path" },
//     { url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=300&fit=crop", name: "Ocean Sunset" },
//     { url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop", name: "City Skyline" }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
//           Jigsaw Puzzle Game
//         </h1>
        
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//           <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
//             <div className="flex flex-col items-center">
//               <label className="text-sm font-medium text-gray-700 mb-2">
//                 Choose Image:
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {sampleImages.map((img, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setSelectedImage(img.url)}
//                     className={`px-3 py-1 text-xs rounded transition-colors ${
//                       selectedImage === img.url
//                         ? 'bg-blue-500 text-white'
//                         : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                     }`}
//                   >
//                     {img.name}
//                   </button>
//                 ))}
//               </div>
//             </div>
            
//             <div className="flex flex-col items-center">
//               <label className="text-sm font-medium text-gray-700 mb-2">
//                 Grid Size:
//               </label>
//               <div className="flex gap-2">
//                 {[3, 4, 5].map((size) => (
//                   <button
//                     key={size}
//                     onClick={() => setGridSize(size)}
//                     className={`px-3 py-1 text-sm rounded transition-colors ${
//                       gridSize === size
//                         ? 'bg-green-500 text-white'
//                         : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                     }`}
//                   >
//                     {size}×{size}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-center">
//           <Jigsaw photo={selectedImage} gridSize={gridSize} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JigsawDemo;

// export const metadata = {
//   name: "Jigsaw",
//   gradeLevel: "6-12",
//   category: "Science",
//   icon: "🥷"
// };