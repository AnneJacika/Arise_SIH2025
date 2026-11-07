import React, { useState, useRef, useEffect, useCallback } from "react";

export function KinematicsLab() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const trajectoryRef = useRef([]);
  const particleSystemRef = useRef([]);
  
  // Core physics state
  const [speed, setSpeed] = useState(50);
  const [angle, setAngle] = useState(45);
  const [launched, setLaunched] = useState(false);
  const [projectile, setProjectile] = useState({ x: 50, y: 50, vx: 0, vy: 0, time: 0 });
  
  // Advanced features
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [airResistance, setAirResistance] = useState(0);
  const [environment, setEnvironment] = useState('earth');
  
  // Game state
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hitTarget, setHitTarget] = useState(false);
  const [showStats, setShowStats] = useState(true);
  
  // Dynamic targets
  const [targets, setTargets] = useState([
    { x: 400, y: 50, width: 30, height: 30, hit: false, points: 100 },
    { x: 300, y: 100, width: 25, height: 25, hit: false, points: 150 },
    { x: 500, y: 80, width: 20, height: 20, hit: false, points: 200 }
  ]);

  // Environment presets
  const environments = {
    earth: { gravity: 9.81, airDensity: 1.225, name: '🌍 Earth' },
    moon: { gravity: 1.62, airDensity: 0, name: '🌙 Moon' },
    mars: { gravity: 3.71, airDensity: 0.02, name: '🔴 Mars' },
    jupiter: { gravity: 24.79, airDensity: 0.16, name: '🪐 Jupiter' }
  };

  // Particle system for effects
  const createParticles = useCallback((x, y, color = '#FFD700', count = 20) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + Math.random() * 20 - 10,
        y: y + Math.random() * 20 - 10,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200 - 50,
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        color: color,
        size: Math.random() * 4 + 2
      });
    }
    return particles;
  }, []);

  // Calculate theoretical trajectory
  const calculateTrajectory = useCallback(() => {
    const points = [];
    const rad = (angle * Math.PI) / 180;
    const v0x = speed * Math.cos(rad);
    const v0y = speed * Math.sin(rad);
    const g = environments[environment].gravity;
    
    for (let t = 0; t < 10; t += 0.1) {
      const x = 50 + v0x * t;
      const y = 50 + v0y * t - 0.5 * g * t * t;
      
      if (y <= 20) break;
      points.push({ x, y });
    }
    return points;
  }, [speed, angle, environment]);

  // Advanced physics calculation
  const updatePhysics = useCallback((dt, currentState) => {
    const g = environments[environment].gravity;
    const airDensity = environments[environment].airDensity * (airResistance / 100);
    const dragCoeff = 0.47;
    const radius = 0.05;
    const area = Math.PI * radius * radius;
    const mass = 0.145;
    
    let { x, y, vx, vy, time } = currentState;
    
    // Air resistance force
    const speed = Math.sqrt(vx * vx + vy * vy);
    const dragForce = 0.5 * airDensity * speed * speed * dragCoeff * area;
    const dragAccelX = speed > 0 ? -(dragForce * vx / speed) / mass : 0;
    const dragAccelY = speed > 0 ? -(dragForce * vy / speed) / mass : 0;
    
    // Update velocity
    const newVx = vx + dragAccelX * dt;
    const newVy = vy - (g + dragAccelY) * dt;
    
    // Update position
    const newX = x + newVx * dt;
    const newY = y + newVy * dt;
    const newTime = time + dt;
    
    return { x: newX, y: newY, vx: newVx, vy: newVy, time: newTime };
  }, [environment, airResistance]);

  // Main animation loop
  useEffect(() => {
    if (!launched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();
    trajectoryRef.current = [];
    particleSystemRef.current = [];

    function animate(currentTime) {
      const dt = Math.min((currentTime - lastTime) / 1000, 1/30);
      lastTime = currentTime;

      // Clear canvas with clean background
      ctx.fillStyle = '#f0f8ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid if enabled
      if (showGrid) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(canvas.width, i);
          ctx.stroke();
        }
      }

      // Update projectile physics
      setProjectile(prevState => {
        const newState = updatePhysics(dt, prevState);
        
        trajectoryRef.current.push({ x: newState.x, y: newState.y });
        if (trajectoryRef.current.length > 50) {
          trajectoryRef.current.shift();
        }
        
        return newState;
      });

      // Draw theoretical trajectory
      if (showTrajectory && !launched) {
        const trajectory = calculateTrajectory();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        trajectory.forEach((point, i) => {
          const screenY = canvas.height - point.y - 20;
          if (i === 0) ctx.moveTo(point.x, screenY);
          else ctx.lineTo(point.x, screenY);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw ground
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      
      ctx.fillStyle = '#90EE90';
      ctx.fillRect(0, canvas.height - 44, canvas.width, 4);

      // Draw targets
      targets.forEach((target) => {
        if (!target.hit) {
          const screenY = canvas.height - target.y - target.height - 20;
          
          ctx.fillStyle = target.points > 150 ? '#ff4444' : '#ff8800';
          ctx.fillRect(target.x, screenY, target.width, target.height);
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            target.points.toString(),
            target.x + target.width / 2,
            screenY + target.height / 2 + 4
          );
        }
      });

      // Update and draw particles
      particleSystemRef.current = particleSystemRef.current.filter(particle => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 200 * dt;
        particle.life -= particle.decay;
        
        if (particle.life > 0) {
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, canvas.height - particle.y - 20, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          return true;
        }
        return false;
      });

      // Draw projectile trail
      if (trajectoryRef.current.length > 1) {
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        trajectoryRef.current.forEach((point, i) => {
          const screenY = canvas.height - point.y - 20;
          if (i === 0) ctx.moveTo(point.x, screenY);
          else ctx.lineTo(point.x, screenY);
        });
        ctx.stroke();
      }

      // Draw projectile
      const screenY = canvas.height - projectile.y - 20;
      
      ctx.fillStyle = '#0066ff';
      ctx.beginPath();
      ctx.arc(projectile.x, screenY, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(projectile.x - 3, screenY - 3, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw velocity vectors
      if (showVectors) {
        const scale = 2;
        const vx = projectile.vx * scale;
        const vy = -projectile.vy * scale;
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(projectile.x, screenY);
        ctx.lineTo(projectile.x + vx, screenY + vy);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(vy, vx);
        ctx.beginPath();
        ctx.moveTo(projectile.x + vx, screenY + vy);
        ctx.lineTo(
          projectile.x + vx - 8 * Math.cos(angle - Math.PI / 6),
          screenY + vy - 8 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          projectile.x + vx - 8 * Math.cos(angle + Math.PI / 6),
          screenY + vy - 8 * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = '#ff0000';
        ctx.fill();
      }

      // Collision detection
      targets.forEach((target) => {
        if (!target.hit &&
            projectile.x >= target.x - 10 &&
            projectile.x <= target.x + target.width + 10 &&
            projectile.y >= target.y &&
            projectile.y <= target.y + target.height + 20) {
          
          target.hit = true;
          setScore(prev => prev + target.points);
          setHitTarget(true);
          
          particleSystemRef.current.push(
            ...createParticles(target.x + target.width/2, target.y + target.height/2, '#FFD700', 25)
          );
          
          setTimeout(() => setHitTarget(false), 1500);
        }
      });

      // Ground collision
      if (projectile.y <= 30) {
        setLaunched(false);
        particleSystemRef.current.push(
          ...createParticles(projectile.x, 30, '#8B7355', 10)
        );
      }

      if (projectile.x > canvas.width + 50) {
        setLaunched(false);
      }

      // Draw UI
      drawUI(ctx, canvas);

      if (launched) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [launched, projectile, showVectors, showTrajectory, showGrid, targets, createParticles, updatePhysics, calculateTrajectory]);

  // Draw UI overlays
  const drawUI = (ctx, canvas) => {
    ctx.textAlign = 'left';
    
    // Stats panel
    if (showStats) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(10, 10, 180, 110);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 180, 110);
      
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.fillText(`Speed: ${speed} m/s`, 20, 30);
      ctx.fillText(`Angle: ${angle}°`, 20, 50);
      ctx.fillText(`Time: ${projectile.time.toFixed(2)}s`, 20, 70);
      ctx.fillText(`Height: ${(projectile.y - 50).toFixed(1)}m`, 20, 90);
      ctx.fillText(`Distance: ${(projectile.x - 50).toFixed(1)}m`, 20, 110);
    }

    // Score display
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(canvas.width - 150, 10, 140, 60);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width - 150, 10, 140, 60);
    
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`Score: ${score}`, canvas.width - 140, 30);
    ctx.fillText(`Attempts: ${attempts}`, canvas.width - 140, 50);

    // Hit feedback
    if (hitTarget) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#00AA00';
      ctx.fillText('🎯 HIT!', canvas.width / 2, 80);
    }

    // Environment indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(10, canvas.height - 40, 120, 30);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(10, canvas.height - 40, 120, 30);
    
    ctx.textAlign = 'left';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(environments[environment].name, 15, canvas.height - 20);
  };

  const launch = () => {
    const rad = (angle * Math.PI) / 180;
    const vx = speed * Math.cos(rad);
    const vy = speed * Math.sin(rad);
    
    setProjectile({ x: 50, y: 50, vx, vy, time: 0 });
    setLaunched(true);
    setAttempts(prev => prev + 1);
    
    setTargets(prev => prev.map(t => ({ ...t, hit: false })));
  };

  const resetGame = () => {
    setScore(0);
    setAttempts(0);
    setLaunched(false);
    setTargets(prev => prev.map(t => ({ ...t, hit: false })));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🚀 Physics Kinematics Lab
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master projectile motion with realistic physics simulation
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Control Panel */}
          <div className="xl:col-span-1 space-y-4">
            {/* Launch Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                🎯 Launch Controls
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Speed: {speed} m/s
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Angle: {angle}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <button
                  onClick={launch}
                  disabled={launched}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm text-sm"
                >
                  {launched ? '🔥 Launching...' : '🚀 LAUNCH'}
                </button>
              </div>
            </div>

            {/* Environment & Display - Combined */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🌍 Settings</h3>
              
              <div className="space-y-3">
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(environments).map(([key, env]) => (
                    <option key={key} value={key}>
                      {env.name}
                    </option>
                  ))}
                </select>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Air Resistance: {airResistance}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={airResistance}
                    onChange={(e) => setAirResistance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { key: 'trajectory', label: '📈 Path', state: showTrajectory, setter: setShowTrajectory },
                    { key: 'vectors', label: '➡️ Vectors', state: showVectors, setter: setShowVectors },
                    { key: 'grid', label: '📋 Grid', state: showGrid, setter: setShowGrid },
                    { key: 'stats', label: '📊 Stats', state: showStats, setter: setShowStats }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.state}
                        onChange={(e) => option.setter(e.target.checked)}
                        className="mr-1 w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Game Stats</h3>
              
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-gray-600 text-xs">Score</div>
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-700">{attempts}</div>
                  <div className="text-gray-600 text-xs">Attempts</div>
                </div>
                <div>
                  <div className="text-lg font-medium text-gray-700">
                    {attempts > 0 ? ((score > 0 ? 1 : 0) / attempts * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-gray-600 text-xs">Accuracy</div>
                </div>
              </div>
              
              <button
                onClick={resetGame}
                className="w-full mt-3 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-auto border border-gray-300 rounded-lg"
              />
              
              {/* Physics Data - Compact */}
              <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                <div className="bg-blue-50 rounded p-2 text-center border border-blue-200">
                  <div className="text-blue-600 font-medium">Gravity</div>
                  <div className="text-gray-800 font-bold">{environments[environment].gravity.toFixed(1)}</div>
                </div>
                <div className="bg-green-50 rounded p-2 text-center border border-green-200">
                  <div className="text-green-600 font-medium">Range</div>
                  <div className="text-gray-800 font-bold">{(speed * speed / environments[environment].gravity).toFixed(0)}m</div>
                </div>
                <div className="bg-yellow-50 rounded p-2 text-center border border-yellow-200">
                  <div className="text-yellow-600 font-medium">Time</div>
                  <div className="text-gray-800 font-bold">{(2 * speed * Math.sin(angle * Math.PI / 180) / environments[environment].gravity).toFixed(1)}s</div>
                </div>
                <div className="bg-purple-50 rounded p-2 text-center border border-purple-200">
                  <div className="text-purple-600 font-medium">Height</div>
                  <div className="text-gray-800 font-bold">{(speed * speed * Math.sin(angle * Math.PI / 180) ** 2 / (2 * environments[environment].gravity)).toFixed(0)}m</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Section - Compact */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🎓 Physics Reference</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-bold text-blue-600 mb-2">Equations</h4>
              <div className="text-gray-700 space-y-1 font-mono text-xs">
                <div>x = v₀cos(θ)t</div>
                <div>y = v₀sin(θ)t - ½gt²</div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-bold text-green-600 mb-2">Key Factors</h4>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Initial velocity</li>
                <li>• Launch angle</li>
                <li>• Gravity & air resistance</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-bold text-purple-600 mb-2">Tips</h4>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• 45° = max range</li>
                <li>• Higher angles for obstacles</li>
                <li>• Try different planets!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  name: "Advanced Kinematics Laboratory",
  gradeLevel: "9-12", 
  category: "Physics",
  icon: "🚀"
};