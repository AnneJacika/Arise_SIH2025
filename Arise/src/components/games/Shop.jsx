import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, DollarSign, Calculator, 
  Trophy, Clock, Target, Award, Crown
} from 'lucide-react';

export function MathMarketplace() {
  const [gameState, setGameState] = useState({
    money: 100.00,
    cart: [],
    totalSpent: 0,
    score: 0,
    achievements: [],
    timeLeft: 300, // 5 minutes
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [calculatorAnswer, setCalculatorAnswer] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState([]);

  // Store inventory with dynamic pricing
  const [storeItems, setStoreItems] = useState([
    {
      id: 1, name: 'Gaming Laptop', category: 'Electronics', basePrice: 75.00,
      discount: 20, stock: 2, image: '💻', description: 'High-performance laptop'
    },
    {
      id: 2, name: 'Wireless Headphones', category: 'Electronics', basePrice: 30.00,
      discount: 10, stock: 3, image: '🎧', description: 'Premium sound quality'
    },
    {
      id: 3, name: 'Designer Sneakers', category: 'Fashion', basePrice: 40.00,
      discount: 25, stock: 2, image: '👟', description: 'Limited edition style'
    },
    {
      id: 4, name: 'Smart Watch', category: 'Electronics', basePrice: 50.00,
      discount: 15, stock: 2, image: '⌚', description: 'Fitness tracking'
    },
    {
      id: 5, name: 'Coffee Beans', category: 'Food', basePrice: 15.00,
      discount: 0, stock: 5, image: '☕', description: 'Premium roasted'
    },
    {
      id: 6, name: 'Board Game', category: 'Games', basePrice: 25.00,
      discount: 20, stock: 3, image: '🎲', description: 'Family fun pack'
    }
  ]);

  // Achievable shopping challenges
  const challenges = [
    {
      id: 'first_purchase',
      title: 'First Purchase',
      description: 'Buy any item successfully',
      reward: 10,
      type: 'simple'
    },
    {
      id: 'budget_shopper',
      title: 'Budget Shopper',
      description: 'Buy 2 items for under Rs.50 total',
      reward: 15,
      type: 'budget',
      target: { items: 2, budget: 50 }
    },
    {
      id: 'discount_finder',
      title: 'Discount Hunter',
      description: 'Buy an item with 20% or more discount',
      reward: 20,
      type: 'discount',
      target: { minDiscount: 20 }
    },
    {
      id: 'big_spender',
      title: 'Big Spender',
      description: 'Spend Rs.80 or more in total',
      reward: 25,
      type: 'spending',
      target: { totalSpend: 80 }
    }
  ];

  // Timer countdown
  useEffect(() => {
    if (gameState.timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0) {
      setGameOver(true);
    }
  }, [gameState.timeLeft, gameOver]);

  const calculateDiscountedPrice = (item) => {
    const discountedPrice = item.basePrice * (1 - item.discount / 100);
    return { price: discountedPrice, totalDiscount: item.discount };
  };

  const addToCart = (item) => {
    if (gameState.cart.find(cartItem => cartItem.id === item.id)) {
      alert('Item already in cart!');
      return;
    }

    const { price, totalDiscount } = calculateDiscountedPrice(item);
    const cartItem = { ...item, finalPrice: price, appliedDiscount: totalDiscount };
    
    setGameState(prev => ({
      ...prev,
      cart: [...prev.cart, cartItem]
    }));
  };

  const removeFromCart = (itemId) => {
    setGameState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotal = () => {
    return gameState.cart.reduce((total, item) => total + item.finalPrice, 0);
  };

  const startNegotiation = (item) => {
    setSelectedItem(item);
    setShowCalculator(true);
  };

  const submitNegotiation = () => {
    if (!selectedItem || !calculatorAnswer) return;

    const { price } = calculateDiscountedPrice(selectedItem);
    const userAnswer = parseFloat(calculatorAnswer);
    const correctAnswer = parseFloat(price.toFixed(2));
    const tolerance = 0.01;

    if (Math.abs(userAnswer - correctAnswer) <= tolerance) {
      // Correct calculation - add to cart, update stock, and add score
      addToCart(selectedItem);
      
      // Decrease stock
      setStoreItems(prev => 
        prev.map(item => 
          item.id === selectedItem.id 
            ? { ...item, stock: item.stock - 1 }
            : item
        )
      );

      setGameState(prev => ({
        ...prev,
        score: prev.score + 10
      }));
      alert('🎉 Excellent calculation! Item added to cart. (+10 points)');
    } else {
      // Incorrect calculation - deduct score (minimum 0)
      setGameState(prev => ({
        ...prev,
        score: Math.max(0, prev.score - 5)
      }));
      alert(`❌ Incorrect Answer! The correct price was Rs.${correctAnswer.toFixed(2)}. Try again! (-5 points)`);
    }

    setShowCalculator(false);
    setSelectedItem(null);
    setCalculatorAnswer('');
  };
  const checkout = () => {
    const total = calculateTotal();
    
    if (total > gameState.money) {
      alert('💳 Insufficient funds! Remove some items.');
      return;
    }

    if (gameState.cart.length === 0) {
      alert('🛒 Your cart is empty! Add some items first.');
      return;
    }

    // Process payment
    const cartItems = [...gameState.cart];
    const purchaseTotal = total;
    
    setGameState(prev => ({
      ...prev,
      money: prev.money - purchaseTotal,
      totalSpent: prev.totalSpent + purchaseTotal,
      cart: []
    }));

    setPurchasedItems(cartItems);
    setShowReceipt(true);
    checkChallenges(cartItems, purchaseTotal);
  };

const checkChallenges = (cartItems, total, newTotalSpent) => {    
    challenges.forEach(challenge => {
      if (gameState.achievements.includes(challenge.id)) return;

      let completed = false;

      switch (challenge.type) {
        case 'simple':
          completed = cartItems.length > 0;
          break;
        case 'budget':
          // Check if this specific purchase meets the budget criteria
          completed = cartItems.length >= challenge.target.items && total <= challenge.target.budget;
          break;
        case 'discount':
          completed = cartItems.some(item => item.appliedDiscount >= challenge.target.minDiscount);
          break;
        case 'spending':
          // Use the passed newTotalSpent parameter
          completed = newTotalSpent >= challenge.target.totalSpend;
          break;
      }

      if (completed) {
        setGameState(prev => ({
          ...prev,
          achievements: [...prev.achievements, challenge.id],
          money: prev.money + challenge.reward // Only money reward, no score
        }));
        alert(`🏆 Challenge Complete: ${challenge.title}! +Rs.${challenge.reward} bonus money!`);
      }
    });
  };
  const restartGame = () => {
    setGameState({
      money: 100.00,
      cart: [],
      totalSpent: 0,
      score: 0,
      achievements: [],
      timeLeft: 300
    });
    
    // Reset stock
    setStoreItems([
      { id: 1, name: 'Gaming Laptop', category: 'Electronics', basePrice: 75.00, discount: 20, stock: 2, image: '💻', description: 'High-performance laptop' },
      { id: 2, name: 'Wireless Headphones', category: 'Electronics', basePrice: 30.00, discount: 10, stock: 3, image: '🎧', description: 'Premium sound quality' },
      { id: 3, name: 'Designer Sneakers', category: 'Fashion', basePrice: 40.00, discount: 25, stock: 2, image: '👟', description: 'Limited edition style' },
      { id: 4, name: 'Smart Watch', category: 'Electronics', basePrice: 50.00, discount: 15, stock: 2, image: '⌚', description: 'Fitness tracking' },
      { id: 5, name: 'Coffee Beans', category: 'Food', basePrice: 15.00, discount: 0, stock: 5, image: '☕', description: 'Premium roasted' },
      { id: 6, name: 'Board Game', category: 'Games', basePrice: 25.00, discount: 20, stock: 3, image: '🎲', description: 'Family fun pack' }
    ]);
    
    setPurchasedItems([]);
    setGameOver(false);
    setShowReceipt(false);
    setShowCalculator(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = () => {
    if (gameState.score >= 100) return { rating: 'Math Expert! 🧙‍♂️', color: 'text-purple-600' };
    if (gameState.score >= 75) return { rating: 'Great Calculator! 🎯', color: 'text-blue-600' };
    if (gameState.score >= 50) return { rating: 'Good Shopper! 🛍️', color: 'text-green-600' };
    return { rating: 'Keep Learning! 📚', color: 'text-yellow-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600">
      <div className="container mx-auto px-4 py-6">
        
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white bg-opacity-95 rounded-lg p-3 text-center backdrop-blur-sm">
            <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <div className="text-sm text-gray-600">Money</div>
            <div className="text-lg font-bold text-green-600">Rs.{gameState.money.toFixed(2)}</div>
          </div>
          
          <div className="bg-white bg-opacity-95 rounded-lg p-3 text-center backdrop-blur-sm">
            <ShoppingCart className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
            <div className="text-sm text-gray-600">Cart</div>
            <div className="text-lg font-bold text-cyan-600">{gameState.cart.length} items</div>
          </div>
          
          <div className="bg-white bg-opacity-95 rounded-lg p-3 text-center backdrop-blur-sm">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-lg font-bold text-yellow-600">{gameState.score}</div>
          </div>
          
          <div className="bg-white bg-opacity-95 rounded-lg p-3 text-center backdrop-blur-sm">
            <Clock className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <div className="text-sm text-gray-600">Time Left</div>
            <div className="text-lg font-bold text-purple-600">{formatTime(gameState.timeLeft)}</div>
          </div>
        </div>

        {/* Manual Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowManual(true)}
            className="bg-white bg-opacity-90 text-cyan-700 px-6 py-2 rounded-lg font-semibold hover:bg-opacity-100"
          >
            📖 How to Play
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Store Items */}
          <div className="lg:col-span-3">
            <div className="bg-white bg-opacity-95 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                🛒 Math Marketplace - Calculate & Shop!
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {storeItems.map(item => {
                  const { price, totalDiscount } = calculateDiscountedPrice(item);
                  const isInCart = gameState.cart.find(cartItem => cartItem.id === item.id);
                  
                  return (
                    <div key={item.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
                      <div className="text-center mb-3">
                        <div className="text-4xl mb-2">{item.image}</div>
                        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Stock: {item.stock}</p>
                      </div>

                      <div className="text-center mb-4">
                        <div className="text-lg font-bold text-cyan-600 mb-2">
                          Calculate the price!
                        </div>
                        <div className="text-sm text-gray-600">
                          Original: Rs.{item.basePrice.toFixed(2)}
                          {totalDiscount > 0 && (
                            <span className="text-red-600"> | {totalDiscount}% OFF</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => startNegotiation(item)}
                        disabled={isInCart || item.stock === 0 || gameOver}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                          isInCart ? 'bg-green-200 text-green-700 cursor-not-allowed' :
                          item.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                          gameOver ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                          'bg-cyan-500 hover:bg-cyan-600 text-white'
                        }`}
                      >
                        {isInCart ? '✓ In Cart' : item.stock === 0 ? 'Out of Stock' : '🧮 Calculate Price'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Shopping Cart & Challenges */}
          <div className="space-y-4">
            
            {/* Shopping Cart */}
            <div className="bg-white bg-opacity-95 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Shopping Cart
              </h3>
              
              {gameState.cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameState.cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.image}</span>
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-cyan-600 font-bold">
                            Rs.{item.finalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={gameOver}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {gameState.cart.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-xl font-bold text-cyan-600">
                    <span>Total:</span>
                    <span>Rs.{calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <button
                    onClick={checkout}
                    disabled={gameOver}
                    className="w-full mt-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold"
                  >
                    💳 Checkout
                  </button>
                </div>
              )}
            </div>

            {/* Challenges */}
            <div className="bg-white bg-opacity-95 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Challenges
              </h3>
              
              <div className="space-y-3">
                {challenges.map(challenge => {
                  const isCompleted = gameState.achievements.includes(challenge.id);
                  return (
                    <div key={challenge.id} className={`p-3 rounded-lg border-2 ${
                      isCompleted ? 'bg-green-100 border-green-400 ring-2 ring-green-300' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <h4 className={`font-medium text-sm ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>
                        {challenge.title} {isCompleted && '✓'}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">{challenge.description}</p>
                      <p className={`text-xs font-bold mt-1 ${isCompleted ? 'text-green-600' : 'text-cyan-600'}`}>
                        Reward: Rs.{challenge.reward}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white bg-opacity-95 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Progress
              </h3>
              <div className="text-center">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{gameState.achievements.length}/4</p>
                <p className="text-sm text-gray-600">Challenges Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Manual Modal */}
        {showManual && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4 text-center text-cyan-700">📖 How to Play Math Marketplace</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-cyan-600">🎯 Objective</h4>
                  <p className="text-sm text-gray-700">Calculate discounted prices correctly to buy items and complete challenges within 5 minutes.</p>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-cyan-600">🧮 How to Shop</h4>
                  <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                    <li>Click "Calculate Price" on any item</li>
                    <li>See the original price and discount percentage</li>
                    <li>Calculate: Final Price = Original Price × (1 - Discount%/100)</li>
                    <li>Enter your answer and submit</li>
                    <li>If correct, item goes to your cart and stock decreases</li>
                    <li>Click "Checkout" to buy your cart items</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-cyan-600">🏆 Challenges</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>First Purchase:</strong> Buy any item (+Rs.10)</li>
                    <li><strong>Budget Shopper:</strong> Buy 2 items under Rs.50 total (+Rs.15)</li>
                    <li><strong>Discount Hunter:</strong> Buy item with 20%+ discount (+Rs.20)</li>
                    <li><strong>Big Spender:</strong> Spend Rs.80+ total (+Rs.25)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-cyan-600">💡 Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Stock is limited - items may run out</li>
                    <li>• Challenge rewards add bonus money</li>
                    <li>• Score increases with correct calculations and challenges</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-cyan-600">🔢 Example Calculation</h4>
                  <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                    Gaming Laptop: Rs.75.00 with 20% discount<br/>
                    Final Price = 75.00 × (1 - 20/100) = 75.00 × 0.8 = Rs.60.00
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowManual(false)}
                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold"
              >
                Start Playing!
              </button>
            </div>
          </div>
        )}

        {/* Calculator Modal */}
        {showCalculator && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-center text-cyan-700">
                🧮 Calculate the Price
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{selectedItem.image}</div>
                <h4 className="text-xl font-bold">{selectedItem.name}</h4>
              </div>

              <div className="bg-cyan-50 p-4 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-lg">Original Price: <span className="font-bold">Rs.{selectedItem.basePrice.toFixed(2)}</span></p>
                  {selectedItem.discount > 0 && (
                    <p className="text-lg text-red-600">
                      Discount: <span className="font-bold">{selectedItem.discount}%</span>
                    </p>
                  )}
                  <p className="text-xl font-bold text-cyan-600 mt-2">
                    What's the final price?
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="number"
                  step="0.01"
                  value={calculatorAnswer}
                  onChange={(e) => setCalculatorAnswer(e.target.value)}
                  placeholder="Enter final price..."
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-center text-xl font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCalculator(false);
                    setSelectedItem(null);
                    setCalculatorAnswer('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={submitNegotiation}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-center text-cyan-700">🧾 Purchase Receipt</h3>
              
              <div className="space-y-2 mb-4">
                <h4 className="font-semibold">Items Purchased:</h4>
                {purchasedItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.image} {item.name}</span>
                    <span>Rs.{item.finalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold text-cyan-600">
                  <span>Total Paid:</span>
                  <span>Rs.{purchasedItems.reduce((sum, item) => sum + item.finalPrice, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Remaining Money:</span>
                  <span className="font-bold text-green-600">Rs.{gameState.money.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowReceipt(false)}
                className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-cyan-500" />
              <h2 className="text-3xl font-bold mb-4 text-cyan-700">Time's Up!</h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-cyan-100 to-teal-100 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800">Final Score</h3>
                  <p className="text-3xl font-bold text-cyan-600">{gameState.score} points</p>
                  <p className={`text-lg font-semibold ${getPerformanceRating().color}`}>
                    {getPerformanceRating().rating}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-bold text-green-700">Money Spent</div>
                    <div className="text-xl font-bold text-green-600">Rs.{gameState.totalSpent.toFixed(2)}</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="font-bold text-yellow-700">Challenges</div>
                    <div className="text-xl font-bold text-yellow-600">{gameState.achievements.length}/4</div>
                  </div>
                </div>
              </div>

              <button
                onClick={restartGame}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold"
              >
                Restart Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  name: "Math Marketplace",
  gradeLevel: "6-12",
  category: "Math",
  icon: "🥷"
};