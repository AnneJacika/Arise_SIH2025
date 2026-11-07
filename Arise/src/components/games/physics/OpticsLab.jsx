import React, { useRef, useEffect, useState, useCallback } from 'react';

// Utility: download CSV
function downloadCSV(name, rows) {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]).join(',') + '\n';
  const body = rows.map(r => Object.values(r).map(v => Number.isFinite(v) ? v.toFixed(3) : v).join(',')).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OpticsLab() {
  // State for geometric optics
  const [objectX, setObjectX] = useState(-250);
  const [objectHeight, setObjectHeight] = useState(100);
  const [focalLength, setFocalLength] = useState(180);
  const [lensX, setLensX] = useState(0);
  const [targetX, setTargetX] = useState(350); // Fixed per level
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [mirrorMode, setMirrorMode] = useState('none');
  const [showRays, setShowRays] = useState(true);
  const [numRays, setNumRays] = useState(12);
  const [animatedRays, setAnimatedRays] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(80);

  // Wave optics
  const [doubleSlitOn, setDoubleSlitOn] = useState(false);
  const [wavelength, setWavelength] = useState(550);
  const [slitSep, setSlitSep] = useState(0.5);
  const [slitWidth, setSlitWidth] = useState(0.1);
  const [screenDist, setScreenDist] = useState(1000);
  const [animateWaves, setAnimateWaves] = useState(false);

  // Game state
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [difficulty, setDifficulty] = useState('easy');
  const [achievements, setAchievements] = useState([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [timer, setTimer] = useState(45); // Reduced initial timer
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(true);
  const [combo, setCombo] = useState(0);
  const [streakTimer, setStreakTimer] = useState(0);
  const [particles, setParticles] = useState([]);
  const [targetVisible, setTargetVisible] = useState(true);
  const [powerUps, setPowerUps] = useState([]);
  const [moveCount, setMoveCount] = useState(0); // Track moves for penalties
  const [targetY, setTargetY] = useState(0); // Add vertical target position for wave optics
  const [targetMoving, setTargetMoving] = useState(false); // Moving target flag

  // Canvas and animation
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [rayLog, setRayLog] = useState([]);
  const [interferenceLog, setInterferenceLog] = useState([]);
  const [rayAnimationPhase, setRayAnimationPhase] = useState(0);
  const [pulseEffect, setPulseEffect] = useState(0);

  // Constants
  const pixelToMm = 0.264583;
  const canvasWidth = 950;
  const canvasHeight = 450;

  // Particle system for visual effects
  const createParticles = useCallback((x, y, count = 15, type = 'success') => {
    const newParticles = [];
    const colors = {
      success: ['#10b981', '#34d399', '#6ee7b7'],
      focus: ['#3b82f6', '#60a5fa', '#93c5fd'],
      achievement: ['#f59e0b', '#fbbf24', '#fcd34d'],
      error: ['#ef4444', '#f87171', '#fca5a5']
    };
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200 - 50,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        size: 2 + Math.random() * 4,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        type
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Achievements with visual feedback
  const achievementList = {
    first_focus: { name: "First Focus", desc: "Create your first focused image", icon: "🎯", points: 100, rarity: "common" },
    speed_demon: { name: "Speed Demon", desc: "Complete challenge in under 20s", icon: "⚡", points: 250, rarity: "rare" },
    precision_master: { name: "Precision Master", desc: "Achieve 99%+ focus accuracy", icon: "🔬", points: 400, rarity: "epic" },
    combo_king: { name: "Combo King", desc: "Maintain 7x combo streak", icon: "🔥", points: 300, rarity: "rare" },
    light_bender: { name: "Light Bender", desc: "Use all mirror types successfully", icon: "🌈", points: 500, rarity: "legendary" },
    wave_master: { name: "Wave Master", desc: "Create perfect interference pattern", icon: "🌊", points: 450, rarity: "epic" },
    lens_lord: { name: "Lens Lord", desc: "Complete 15 levels", icon: "👑", points: 600, rarity: "legendary" },
    rainbow_maker: { name: "Rainbow Maker", desc: "Use all wavelengths", icon: "🌈", points: 200, rarity: "uncommon" },
    virtual_virtuoso: { name: "Virtual Virtuoso", desc: "Master virtual images", icon: "✨", points: 300, rarity: "rare" },
    moving_target: { name: "Moving Target", desc: "Hit a moving target with 95%+ accuracy", icon: "🏃", points: 500, rarity: "epic" }
  };

  // Dynamic challenges with increased complexity
  const getDynamicChallenges = useCallback(() => {
    const baseTime = difficulty === 'easy' ? 45 : difficulty === 'medium' ? 30 : 20; // Stricter timers
    const levelBonus = Math.floor(currentLevel / 3) * 100; // Higher rewards
    const maxMoves = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10; // Move limits
    
    const challenges = [
      {
        id: `focus_${currentLevel}`,
        name: `Focus Challenge ${currentLevel}`,
        goal: `Achieve ${95 + currentLevel}% focus accuracy on the target`,
        reward: 100 + levelBonus,
        timeLimit: baseTime,
        maxMoves: maxMoves,
        type: 'focus',
        completed: () => {
          const doRel = Math.abs(lensX - objectX);
          const di = thinLensImageDistance(doRel, focalLength);
          const imageX = lensX + di;
          const error = Math.abs(imageX - targetX);
          const accuracy = Math.max(0, 100 - error / 2); // Tighter error margin
          return accuracy >= 95 + currentLevel && moveCount <= maxMoves;
        }
      },
      {
        id: `precision_${currentLevel}`,
        name: `Precision ${currentLevel}`,
        goal: `Maintain a 5x combo hitting the target rapidly`,
        reward: 150 + levelBonus,
        timeLimit: baseTime - 5,
        maxMoves: maxMoves,
        type: 'speed',
        completed: () => combo >= 5 && moveCount <= maxMoves
      },
      {
        id: `exploration_${currentLevel}`,
        name: `Explorer ${currentLevel}`,
        goal: difficulty === 'easy' ? "Adjust object to hit target with |M| > 1" : 
               difficulty === 'medium' ? "Use mirrors to hit target" : 
               "Maximize interference intensity at target",
        reward: 200 + levelBonus,
        timeLimit: baseTime + 5,
        maxMoves: maxMoves,
        type: 'exploration',
        completed: () => {
          const doRel = Math.abs(lensX - objectX);
          const di = thinLensImageDistance(doRel, focalLength);
          const magnification = isFinite(di) && doRel !== 0 ? -di / doRel : 1;
          if (difficulty === 'easy') return Math.abs(magnification) > 1 && moveCount <= maxMoves;
          if (difficulty === 'medium') return mirrorMode !== 'none' && moveCount <= maxMoves;
          return doubleSlitOn && interferenceLog.find(entry => Math.abs(entry.y - targetY) < 1e-3)?.intensity >= 0.95 && moveCount <= maxMoves;
        }
      },
      {
        id: `virtual_image_${currentLevel}`,
        name: `Virtual Image Challenge`,
        goal: "Create a virtual image with |M| > 1.5 and hit target",
        reward: 250 + levelBonus,
        timeLimit: baseTime,
        maxMoves: maxMoves,
        type: 'advanced',
        completed: () => {
          const doRel = Math.abs(lensX - objectX);
          const di = thinLensImageDistance(doRel, focalLength);
          const magnification = isFinite(di) && doRel !== 0 ? -di / doRel : 1;
          const imageX = lensX + di;
          const error = Math.abs(imageX - targetX);
          const accuracy = Math.max(0, 100 - error / 2);
          return di < 0 && Math.abs(magnification) > 1.5 && accuracy >= 95 && moveCount <= maxMoves;
        }
      },
      {
        id: `inverted_real_${currentLevel}`,
        name: `Inverted Real Image`,
        goal: "Form an inverted real image with |M| < 0.5 and hit target",
        reward: 300 + levelBonus,
        timeLimit: baseTime - 5,
        maxMoves: maxMoves,
        type: 'advanced',
        completed: () => {
          const doRel = Math.abs(lensX - objectX);
          const di = thinLensImageDistance(doRel, focalLength);
          const magnification = isFinite(di) && doRel !== 0 ? -di / doRel : 1;
          const imageX = lensX + di;
          const error = Math.abs(imageX - targetX);
          const accuracy = Math.max(0, 100 - error / 2);
          return di > 0 && magnification < -0.5 && accuracy >= 95 && moveCount <= maxMoves;
        }
      },
      {
        id: `mirror_master_${currentLevel}`,
        name: `Mirror Master`,
        goal: "Use concave mirror for real image to hit moving target",
        reward: 400 + levelBonus,
        timeLimit: baseTime,
        maxMoves: maxMoves,
        type: 'mirror',
        completed: () => {
          if (mirrorMode !== 'concave') return false;
          const doRel = Math.abs(lensX - objectX);
          const di = thinLensImageDistance(doRel, focalLength);
          const imageX = lensX - di; // Mirror image on same side
          const error = Math.abs(imageX - targetX);
          const accuracy = Math.max(0, 100 - error / 2);
          return di > 0 && accuracy >= 95 && targetMoving && moveCount <= maxMoves;
        }
      },
      {
        id: `multi_config_${currentLevel}`,
        name: `Multi-Config Challenge`,
        goal: "Hit target in lens and concave mirror modes in one level",
        reward: 500 + levelBonus,
        timeLimit: baseTime * 1.5,
        maxMoves: maxMoves + 5,
        type: 'complex',
        completed: () => {
          const doRel = Math.abs(lensX - objectX);
          const di = thinLensImageDistance(doRel, focalLength);
          const imageX = mirrorMode === 'concave' ? lensX - di : lensX + di;
          const error = Math.abs(imageX - targetX);
          const accuracy = Math.max(0, 100 - error / 2);
          return accuracy >= 95 && (mirrorMode === 'concave' || mirrorMode === 'none') && moveCount <= maxMoves + 5;
        }
      },
      {
        id: `wave_precision_${currentLevel}`,
        name: `Wave Precision`,
        goal: "Hit target with interference maximum at specific y-position",
        reward: 350 + levelBonus,
        timeLimit: baseTime - 5,
        maxMoves: maxMoves,
        type: 'wave',
        completed: () => doubleSlitOn && interferenceLog.find(entry => Math.abs(entry.y - targetY) < 1e-3)?.intensity >= 0.95 && moveCount <= maxMoves
      }
    ];
    
    return challenges.slice(0, difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : challenges.length);
  }, [difficulty, currentLevel, lensX, objectX, focalLength, targetX, targetY, combo, mirrorMode, doubleSlitOn, interferenceLog, moveCount, targetMoving]);

  // Thin lens calculations
  const thinLensImageDistance = useCallback((doPx, fPx) => {
    if (Math.abs(doPx) < 1e-6 || Math.abs(fPx) < 1e-6) return Infinity;
    try {
      const di = (doPx * fPx) / (doPx - fPx);
      return isFinite(di) && Math.abs(di) < 1e6 ? di : Infinity;
    } catch (e) {
      return Infinity;
    }
  }, []);

  const canvasCoords = useCallback(() => {
    return { W: canvasWidth, H: canvasHeight, cx: canvasWidth / 2, cy: canvasHeight / 2 };
  }, []);

  // Draw glowing arrow
  const drawGlowingArrow = useCallback((ctx, x, yBase, height, color = '#3b82f6', intensity = 1) => {
    const tipX = x;
    const tipY = yBase + height;
    
    if (intensity > 0.5) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15 * intensity;
    }
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - 8, tipY - Math.sign(height) * 16);
    ctx.lineTo(tipX + 8, tipY - Math.sign(height) * 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - 3, Math.min(yBase, tipY), 6, Math.abs(height));
    
    ctx.shadowBlur = 0;
  }, []);

  // Animated double-slit pattern
  const drawAnimatedInterference = useCallback((ctx, targetXCanvas, cy, wavelengthNm, slitSeparationMm, slitWidthMm, screenDistMm) => {
    const lambda = wavelengthNm * 1e-9;
    const d = slitSeparationMm * 1e-3;
    const a = slitWidthMm * 1e-3;
    const D = screenDistMm * 1e-3;
    const sensorLengthPx = 300;
    const top = cy - sensorLengthPx / 2;
    const bottom = cy + sensorLengthPx / 2;
    const steps = 500;
    const time = Date.now() / 1000;
    const newLog = [];

    for (let i = 0; i < steps; i++) {
      const frac = i / (steps - 1);
      const y = top + frac * (bottom - top);
      const yMm = (y - cy) * pixelToMm * 1e-3;
      const theta = Math.atan2(yMm, D);
      
      const pathDiff = d * Math.sin(theta);
      const phase = 2 * Math.PI * pathDiff / lambda + (animateWaves ? time * 2 : 0);
      const doubleSlitIntensity = Math.pow(Math.cos(phase / 2), 2);
      
      const singleSlitPhase = Math.PI * a * Math.sin(theta) / lambda;
      const singleSlitIntensity = singleSlitPhase !== 0 ? Math.pow(Math.sin(singleSlitPhase) / singleSlitPhase, 2) : 1;
      
      const intensity = doubleSlitIntensity * singleSlitIntensity;
      
      let hue;
      if (wavelengthNm >= 380 && wavelengthNm < 450) {
        hue = 240 + (wavelengthNm - 380) / 70 * 30;
      } else if (wavelengthNm >= 450 && wavelengthNm < 495) {
        hue = 210 + (wavelengthNm - 450) / 45 * 30;
      } else if (wavelengthNm >= 495 && wavelengthNm < 570) {
        hue = 180 - (wavelengthNm - 495) / 75 * 60;
      } else if (wavelengthNm >= 570 && wavelengthNm < 590) {
        hue = 60 + (wavelengthNm - 570) / 20 * 0;
      } else if (wavelengthNm >= 590 && wavelengthNm < 620) {
        hue = 30 + (wavelengthNm - 590) / 30 * 30;
      } else if (wavelengthNm >= 620 && wavelengthNm <= 750) {
        hue = 0;
      } else {
        hue = 300;
      }
      
      const brightness = Math.min(1, Math.max(0, intensity)) * (lightIntensity / 100);
      const saturation = Math.min(100, 70 + brightness * 30);
      
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${30 + 20 * brightness}%)`;
      ctx.fillRect(targetXCanvas, y, 80, 1);
      
      newLog.push({ y: yMm * 1e3, intensity, wavelength: wavelengthNm });
    }

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 13px Inter';
    ctx.fillText(`λ=${wavelengthNm}nm`, targetXCanvas + 85, top - 15);
    ctx.fillText(`d=${slitSeparationMm}mm`, targetXCanvas + 85, top);
    ctx.font = '10px Inter';
    ctx.fillText(`D=${screenDistMm}mm`, targetXCanvas + 85, top + 15);
    
    setInterferenceLog(newLog);
  }, [lightIntensity, animateWaves]);

  // Enhanced ray tracing with animations
  const drawEnhancedScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { W, H, cx, cy } = canvasCoords();
    
    // Dynamic background
    const bgGradient = ctx.createLinearGradient(0, 0, W, H);
    bgGradient.addColorStop(0, '#f8fafc');
    bgGradient.addColorStop(0.5, '#e2e8f0');
    bgGradient.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Animated optical axis
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();

    const time = Date.now() / 1000;
    for (let i = 0; i < 20; i++) {
      const x = (i * 40 + time * 100) % W;
      const alpha = 0.3 + 0.2 * Math.sin(time * 3 + i);
      ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, cy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lens/mirror
    const lensCenterX = cx + lensX;
    const doRel = Math.abs(lensX - objectX);
    const di = thinLensImageDistance(doRel, focalLength);
    
    if (mirrorMode === 'none') {
      const lensGradient = ctx.createRadialGradient(lensCenterX, cy, 0, lensCenterX, cy, 120);
      lensGradient.addColorStop(0, 'rgba(147, 197, 253, 0.8)');
      lensGradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.6)');
      lensGradient.addColorStop(1, 'rgba(30, 64, 175, 0.4)');
      
      ctx.fillStyle = lensGradient;
      ctx.fillRect(lensCenterX - 6, cy - 140, 12, 280);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(lensCenterX - 2, cy - 120, 4, 240);
      
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(lensCenterX, cy - 140);
      ctx.lineTo(lensCenterX, cy + 140);
      ctx.stroke();
      
    } else {
      const mirrorGradient = ctx.createLinearGradient(lensCenterX - 10, cy, lensCenterX + 10, cy);
      mirrorGradient.addColorStop(0, '#f3f4f6');
      mirrorGradient.addColorStop(0.5, '#e5e7eb');
      mirrorGradient.addColorStop(1, '#d1d5db');
      
      if (mirrorMode === 'plane') {
        ctx.fillStyle = mirrorGradient;
        ctx.fillRect(lensCenterX - 6, cy - 140, 12, 280);
      } else {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 8;
        ctx.beginPath();
        const radius = Math.abs(focalLength * 2);
        if (mirrorMode === 'concave') {
          ctx.arc(lensCenterX - radius, cy, radius, -Math.PI / 2, Math.PI / 2);
        } else {
          ctx.arc(lensCenterX + radius, cy, radius, Math.PI / 2, -Math.PI / 2);
        }
        ctx.stroke();
      }
    }

    // Focal points
    if (mirrorMode === 'none' || mirrorMode === 'concave') {
      const pulse = 1 + 0.3 * Math.sin(time * 4);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10 * pulse;
      ctx.beginPath();
      ctx.arc(lensCenterX + focalLength, cy, 5 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      if (mirrorMode === 'none') {
        ctx.beginPath();
        ctx.arc(lensCenterX - focalLength, cy, 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // Target with dynamic position
    const targetPositionX = cx + targetX;
    const targetPositionY = cy + targetY;
    const targetGradient = ctx.createLinearGradient(targetPositionX, targetPositionY - 160, targetPositionX + 10, targetPositionY + 160);
    targetGradient.addColorStop(0, '#1f2937');
    targetGradient.addColorStop(0.5, '#374151');
    targetGradient.addColorStop(1, '#4b5563');
    ctx.fillStyle = targetGradient;
    ctx.fillRect(targetPositionX, targetPositionY - 160, 10, 320);
    
    const imageX = mirrorMode === 'concave' ? lensX - di : lensX + di;
    const error = Math.abs(imageX - targetX);
    const accuracy = Math.max(0, 100 - error / 2);
    
    for (let i = 0; i < 5; i++) {
      const lightY = targetPositionY - 140 + i * 70;
      ctx.fillStyle = accuracy > i * 20 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(targetPositionX + 15, lightY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#f9fafb';
    ctx.font = 'bold 14px Inter';
    ctx.fillText('TARGET', targetPositionX + 20, targetPositionY - 170);
    ctx.font = '12px Inter';
    ctx.fillText(`${accuracy.toFixed(0)}%`, targetPositionX + 20, targetPositionY - 155);

    // Object
    const objXCanvas = cx + objectX;
    const objectIntensity = (lightIntensity / 100) * (0.8 + 0.2 * Math.sin(time * 2));
    drawGlowingArrow(ctx, objXCanvas, cy, -objectHeight, '#1f2937', objectIntensity);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px Inter';
    ctx.fillText('OBJECT', objXCanvas - 25, cy - objectHeight - 20);

    // Ray tracing
    const magnification = isFinite(di) && doRel !== 0 ? -di / doRel : 1;
    const imagePosition = cx + (mirrorMode === 'concave' ? lensX - di : lensX + di);
    const imageHeight = objectHeight * magnification;
    
    if (mirrorMode === 'none' && isFinite(di) && Math.abs(di) < 1e6) {
      const imageIntensity = Math.min(1, accuracy / 100);
      const imageColor = di > 0 ? '#f97316' : '#8b5cf6';
      drawGlowingArrow(ctx, imagePosition, cy, imageHeight, imageColor, imageIntensity);
      
      ctx.fillStyle = imageColor;
      ctx.font = 'bold 12px Inter';
      const imageType = di > 0 ? 'REAL IMAGE' : 'VIRTUAL IMAGE';
      ctx.fillText(imageType, imagePosition - 30, cy + (imageHeight > 0 ? imageHeight + 25 : -25));
      ctx.font = '10px Inter';
      ctx.fillText(`M=${magnification.toFixed(2)}`, imagePosition - 20, cy + (imageHeight > 0 ? imageHeight + 40 : -10));
      ctx.fillText(`di=${di.toFixed(1)}px`, imagePosition - 20, cy + (imageHeight > 0 ? imageHeight + 55 : 5));
    } else if (mirrorMode === 'plane') {
      const virtualImageX = 2 * lensCenterX - objXCanvas;
      drawGlowingArrow(ctx, virtualImageX, cy, objectHeight, '#8b5cf6', 0.7);
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 10px Inter';
      ctx.fillText('VIRTUAL', virtualImageX - 20, cy + objectHeight + 25);
    }

    setRayLog([]);
    if (showRays) {
      const rayColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
      
      for (let i = 0; i < numRays; i++) {
        const t = i / Math.max(1, numRays - 1);
        const startY = cy - objectHeight * (0.1 + 0.8 * t);
        const color = rayColors[i % rayColors.length];
        
        const rayPhase = animatedRays ? (time * 2 + i * 0.2) % (2 * Math.PI) : 0;
        const rayIntensity = animatedRays ? (0.5 + 0.5 * Math.sin(rayPhase)) : 1;
        
        let rayPath = [];
        if (mirrorMode === 'none') {
          const rayHeight = startY - cy;
          const imagePointY = isFinite(di) ? cy + rayHeight * (di / doRel) : startY;
          rayPath = [
            { x: objXCanvas, y: startY },
            { x: lensCenterX, y: cy },
            { x: imagePosition, y: imagePointY }
          ];
        } else if (mirrorMode === 'plane') {
          const intersectY = startY;
          const imagePointY = 2 * cy - startY;
          rayPath = [
            { x: objXCanvas, y: startY },
            { x: lensCenterX, y: intersectY },
            { x: objXCanvas, y: imagePointY }
          ];
        } else if (mirrorMode === 'concave' || mirrorMode === 'convex') {
          const mirrorFocal = mirrorMode === 'concave' ? focalLength : -focalLength;
          const mirrorImageDist = (doRel * mirrorFocal) / (doRel - mirrorFocal);
          const mirrorImageX = lensCenterX - mirrorImageDist;
          const rayHeight = startY - cy;
          const mirrorImageY = cy + rayHeight * (mirrorImageDist / doRel);
          
          rayPath = [
            { x: objXCanvas, y: startY },
            { x: lensCenterX, y: startY },
            { x: mirrorImageX, y: mirrorImageY }
          ];
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 2 + rayIntensity;
        ctx.shadowColor = color;
        ctx.shadowBlur = animatedRays ? 8 * rayIntensity : 0;
        
        ctx.beginPath();
        rayPath.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        rayPath.forEach(p => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 + rayIntensity, 0, Math.PI * 2);
          ctx.fill();
        });
        
        setRayLog(prev => [...prev, {
          rayIndex: i,
          startX: rayPath[0].x,
          startY: rayPath[0].y,
          endX: rayPath[rayPath.length - 1].x,
          endY: rayPath[rayPath.length - 1].y,
          intensity: rayIntensity,
          color
        }]);
      }
    }

    // Double-slit interference
    if (doubleSlitOn) {
      drawAnimatedInterference(ctx, cx + targetX + 20, cy, wavelength, slitSep, slitWidth, screenDist);
      
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(cx - 100, cy - 50, 20, 15);
      ctx.fillRect(cx - 100, cy + 35, 20, 15);
      ctx.font = '12px Inter';
      ctx.fillText('Double Slit', cx - 95, cy - 60);
    }

    // Particle effects
    particles.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Performance metrics
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Inter';
    const metrics = [
      `f = ${focalLength.toFixed(0)}px`,
      `do = ${doRel.toFixed(1)}px`,  
      `di = ${di.toFixed(1)}px`,
      `Accuracy: ${accuracy.toFixed(0)}%`,
      `Moves: ${moveCount}`
    ];
    
    metrics.forEach((metric, idx) => {
      ctx.fillText(metric, 15, 25 + idx * 20);
    });

    // Combo counter
    if (combo > 1) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px Inter';
      ctx.fillText(`${combo}x COMBO!`, cx - 60, 40);
    }

    // Target zone
    if (targetVisible) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(targetPositionX - 15, targetPositionY - 20, 30, 40);
      ctx.setLineDash([]);
    }

  }, [objectX, objectHeight, focalLength, lensX, targetX, targetY, mirrorMode, showRays, numRays, doubleSlitOn, wavelength, slitSep, slitWidth, screenDist, lightIntensity, animatedRays, animateWaves, particles, combo, targetVisible, drawGlowingArrow, drawAnimatedInterference, thinLensImageDistance]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.02, (now - last) / 1000);
      last = now;
      
      setRayAnimationPhase(prev => (prev + dt * 2) % (2 * Math.PI));
      setPulseEffect(prev => (prev + dt * 4) % (2 * Math.PI));
      
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx * dt,
        y: particle.y + particle.vy * dt,
        vy: particle.vy + 200 * dt,
        life: particle.life - particle.decay
      })).filter(particle => particle.life > 0));
      
      // Update moving target
      if (targetMoving) {
        setTargetX(prev => prev + Math.sin(Date.now() / 1000) * 50 * dt); // Oscillate ±50px
      }

      drawEnhancedScene();
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawEnhancedScene, targetMoving]);

  // Timer and combo system
  useEffect(() => {
    if (running && !gameOver) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 0) {
            setGameOver(true);
            setRunning(false);
            return 0;
          }
          return prev - 1;
        });
        
        setStreakTimer(prev => prev > 0 ? prev - 1 : 0);
        if (streakTimer <= 0) {
          setCombo(0);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [running, gameOver, streakTimer]);

  // Achievement checking
  const checkAchievements = useCallback(() => {
    const doRel = Math.abs(lensX - objectX);
    const di = thinLensImageDistance(doRel, focalLength);
    const imageX = mirrorMode === 'concave' ? lensX - di : lensX + di;
    const error = Math.abs(imageX - targetX);
    const accuracy = Math.max(0, 100 - error / 2);
    const newAchievements = [];

    if (accuracy > 50 && !achievements.includes('first_focus')) {
      newAchievements.push('first_focus');
      createParticles(canvasWidth/2, canvasHeight/2, 20, 'success');
    }
    
    if (accuracy > 99 && !achievements.includes('precision_master')) {
      newAchievements.push('precision_master');
      createParticles(canvasWidth/2, canvasHeight/2, 30, 'achievement');
    }
    
    if (combo >= 7 && !achievements.includes('combo_king')) {
      newAchievements.push('combo_king');
      createParticles(canvasWidth/2, canvasHeight/2, 25, 'focus');
    }
    
    if (timer > baseTime - 5 && accuracy > 95 && !achievements.includes('speed_demon')) {
      newAchievements.push('speed_demon');
      createParticles(canvasWidth/2, canvasHeight/2, 35, 'achievement');
    }

    if (mirrorMode !== 'none' && accuracy > 90 && !achievements.includes('light_bender')) {
      newAchievements.push('light_bender');
    }

    if (doubleSlitOn && Math.abs(wavelength - 550) > 100 && !achievements.includes('rainbow_maker')) {
      newAchievements.push('rainbow_maker');
    }

    if (currentLevel >= 15 && !achievements.includes('lens_lord')) {
      newAchievements.push('lens_lord');
    }

    if (targetMoving && accuracy > 95 && !achievements.includes('moving_target')) {
      newAchievements.push('moving_target');
      createParticles(canvasWidth/2, canvasHeight/2, 40, 'achievement');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      newAchievements.forEach(ach => {
        const points = achievementList[ach]?.points || 100;
        setScore(prev => prev + points);
      });
    }

    // Combo system with penalties
    if (accuracy > 95) {
      setCombo(prev => prev + 1);
      setStreakTimer(8); // Shorter combo window
      if (combo > 0) {
        setScore(prev => prev + combo * 15);
      }
    } else if (moveCount > 0) {
      setScore(prev => Math.max(0, prev - 10)); // Penalty for incorrect moves
    }

  }, [lensX, objectX, focalLength, targetX, combo, timer, achievements, achievementList, createParticles, currentLevel, mirrorMode, doubleSlitOn, wavelength, moveCount, targetMoving, thinLensImageDistance]);

  // Track moves
  useEffect(() => {
    const handleMove = () => {
      setMoveCount(prev => prev + 1);
      const challenges = getDynamicChallenges();
      if (challenges.some(ch => moveCount + 1 > ch.maxMoves)) {
        setScore(prev => Math.max(0, prev - 50)); // Harsh penalty for exceeding moves
      }
    };

    const handlers = {
      objectX: () => setObjectX(prev => { handleMove(); return prev; }),
      focalLength: () => setFocalLength(prev => { handleMove(); return prev; }),
      lensX: () => setLensX(prev => { handleMove(); return prev; }),
      mirrorMode: () => setMirrorMode(prev => { handleMove(); return prev; }),
      doubleSlitOn: () => setDoubleSlitOn(prev => { handleMove(); return prev; }),
      wavelength: () => setWavelength(prev => { handleMove(); return prev; }),
      slitSep: () => setSlitSep(prev => { handleMove(); return prev; }),
      slitWidth: () => setSlitWidth(prev => { handleMove(); return prev; })
    };

    // Simulated event listeners for state changes
    Object.values(handlers).forEach(handler => handler());
  }, [objectX, focalLength, lensX, mirrorMode, doubleSlitOn, wavelength, slitSep, slitWidth, getDynamicChallenges]);

  // Check achievements
  useEffect(() => {
    const interval = setInterval(checkAchievements, 500); // More frequent checks
    return () => clearInterval(interval);
  }, [checkAchievements]);

  // Game controls
  const resetGame = () => {
    setScore(0);
    setCurrentLevel(1);
    setTimer(difficulty === 'easy' ? 45 : difficulty === 'medium' ? 30 : 20);
    setGameOver(false);
    setRunning(true);
    setCombo(0);
    setStreakTimer(0);
    setParticles([]);
    setAchievements([]);
    setObjectX(-250);
    setFocalLength(180);
    setTargetX(350);
    setTargetY(0);
    setMirrorMode('none');
    setDoubleSlitOn(false);
    setMoveCount(0);
    setTargetMoving(false);
  };

  const nextLevel = () => {
    setCurrentLevel(prev => prev + 1);
    const baseTime = difficulty === 'easy' ? 45 : difficulty === 'medium' ? 30 : 20;
    setTimer(baseTime);
    setScore(prev => prev + 300 + currentLevel * 100);
    setMoveCount(0);
    createParticles(canvasWidth/2, 100, 30, 'achievement');
    
    // Randomize parameters
    setObjectX(-350 + Math.random() * 100);
    setFocalLength(difficulty === 'hard' ? 150 : 150 + Math.random() * 100); // Lock focal length in hard mode
    setLensX(-75 + Math.random() * 50);
    setTargetX(250 + Math.random() * 200);
    setTargetY(difficulty === 'hard' ? (Math.random() - 0.5) * 100 : 0); // Vertical offset in hard mode
    setTargetMoving(difficulty === 'hard' && Math.random() > 0.5); // 50% chance of moving target
  };

  const pauseGame = () => {
    setRunning(!running);
  };

  // Auto-level progression
  useEffect(() => {
    const challenges = getDynamicChallenges();
    const completedChallenges = challenges.filter(c => c.completed());
    
    if (completedChallenges.length === challenges.length && running && !gameOver) {
      setTimeout(nextLevel, 1500);
    }
  }, [getDynamicChallenges, running, gameOver]);

  // Export data
  const exportRayData = () => {
    if (rayLog.length > 0) {
      downloadCSV('ray_tracing_data.csv', rayLog);
    }
  };

  const exportInterferenceData = () => {
    if (interferenceLog.length > 0) {
      downloadCSV('interference_pattern.csv', interferenceLog);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-600',
      uncommon: 'text-green-600',
      rare: 'text-blue-600', 
      epic: 'text-purple-600',
      legendary: 'text-yellow-600'
    };
    return colors[rarity] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🔬 Advanced Optics Lab</h1>
              <p className="text-gray-600">Master complex optical challenges to hit the target</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">Score: {score.toLocaleString()}</div>
              <div className="text-lg text-gray-700">Level {currentLevel}</div>
              <div className={`text-lg font-mono ${timer < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                ⏱️ {formatTime(timer)}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={pauseGame}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {running ? '⏸️ Pause' : '▶️ Resume'}
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              🔄 Reset
            </button>
            <button
              onClick={() => setShowHowToPlay(!showHowToPlay)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              ❓ How to Play
            </button>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">🎮 How to Play</h2>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg">🎯 Objective</h3>
                <p>Adjust optical parameters to focus light rays precisely on the fixed or moving target within strict time and move limits. Complete complex challenges to progress.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">🔧 Controls</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Adjust object position, lens focal length (if available), and lens position</li>
                  <li>Switch between lenses and mirrors for different effects</li>
                  <li>Enable wave optics for interference challenges</li>
                  <li>Minimize moves to avoid penalties</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg">🏆 Scoring</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Achieve 95%+ accuracy for points</li>
                  <li>Build combo streaks for multipliers</li>
                  <li>Complete challenges quickly to avoid time penalties</li>
                  <li>Unlock achievements for major rewards</li>
                  <li>Avoid excessive moves to prevent score deductions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg">🌈 Advanced Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Master wave interference with precise slit adjustments</li>
                  <li>Hit moving targets in hard mode</li>
                  <li>Manage complex mirror and lens configurations</li>
                  <li>Export ray and interference data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md p-8 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Complete!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-xl">Final Score: <span className="font-bold text-blue-600">{score.toLocaleString()}</span></p>
              <p className="text-lg">Level Reached: <span className="font-bold">{currentLevel}</span></p>
              <p className="text-lg">Achievements: <span className="font-bold">{achievements.length}</span></p>
            </div>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Optical Bench</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportRayData}
                  className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  📊 Export Rays
                </button>
                {doubleSlitOn && (
                  <button
                    onClick={exportInterferenceData}
                    className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
                  >
                    🌊 Export Waves
                  </button>
                )}
              </div>
            </div>
            <canvas 
              ref={canvasRef} 
              className="w-full border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50"
              style={{ aspectRatio: `${canvasWidth}/${canvasHeight}` }}
            />
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-6">
          {/* Current Challenges */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 Current Challenges</h3>
            <div className="space-y-3">
              {getDynamicChallenges().map((challenge, idx) => (
                <div key={challenge.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-gray-800">{challenge.name}</h4>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      +{challenge.reward}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{challenge.goal}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">⏱️ {challenge.timeLimit}s | Moves: {challenge.maxMoves}</span>
                    {challenge.completed() && (
                      <span className="text-xs text-green-600 font-semibold">✅ Complete</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geometric Optics Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🔍 Geometric Optics</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Object Position</label>
                <input
                  type="range"
                  min={difficulty === 'hard' ? -300 : -400}
                  max={-50}
                  value={objectX}
                  onChange={(e) => setObjectX(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{objectX}px</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Object Height</label>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={objectHeight}
                  onChange={(e) => setObjectHeight(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{objectHeight}px</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focal Length</label>
                <input
                  type="range"
                  min={50}
                  max={300}
                  value={focalLength}
                  onChange={(e) => difficulty !== 'hard' ? setFocalLength(Number(e.target.value)) : null}
                  disabled={difficulty === 'hard'}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{focalLength}px {difficulty === 'hard' ? '(Locked)' : ''}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lens Position</label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={lensX}
                  onChange={(e) => setLensX(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{lensX}px</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Position (Fixed)</label>
                <span className="text-sm text-gray-500">{targetX}px, {targetY}px {targetMoving ? '(Moving)' : ''}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Optical Element</label>
                <select
                  value={mirrorMode}
                  onChange={(e) => setMirrorMode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="none">Thin Lens</option>
                  <option value="plane">Plane Mirror</option>
                  <option value="concave">Concave Mirror</option>
                  <option value="convex">Convex Mirror</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ray Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🌈 Ray Visualization</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showRays"
                  checked={showRays}
                  onChange={(e) => setShowRays(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showRays" className="text-sm text-gray-700">Show Rays</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="animatedRays"
                  checked={animatedRays}
                  onChange={(e) => setAnimatedRays(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="animatedRays" className="text-sm text-gray-700">Animated Rays</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rays</label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={numRays}
                  onChange={(e) => setNumRays(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{numRays} rays</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Light Intensity</label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{lightIntensity}%</span>
              </div>
            </div>
          </div>

          {/* Wave Optics Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🌊 Wave Optics</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="doubleSlitOn"
                  checked={doubleSlitOn}
                  onChange={(e) => setDoubleSlitOn(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="doubleSlitOn" className="text-sm text-gray-700">Double Slit</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="animateWaves"
                  checked={animateWaves}
                  onChange={(e) => setAnimateWaves(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="animateWaves" className="text-sm text-gray-700">Animate Waves</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wavelength (nm)</label>
                <input
                  type="range"
                  min={400}
                  max={700}
                  value={wavelength}
                  onChange={(e) => setWavelength(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{wavelength}nm</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slit Separation (mm)</label>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={slitSep}
                  onChange={(e) => setSlitSep(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{slitSep}mm</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slit Width (mm)</label>
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  value={slitWidth}
                  onChange={(e) => setSlitWidth(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{slitWidth}mm</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🏆 Achievements</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(achievementList).map(([key, achievement]) => (
                <div
                  key={key}
                  className={`p-2 rounded-lg border ${
                    achievements.includes(key)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-medium ${getRarityColor(achievement.rarity)}`}>
                          {achievement.name}
                        </h4>
                        <span className="text-xs text-gray-500">+{achievement.points}</span>
                      </div>
                      <p className="text-xs text-gray-600">{achievement.desc}</p>
                    </div>
                    {achievements.includes(key) && (
                      <span className="text-green-600 text-sm">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  name: 'Optics Lab — Geometric & Wave Optics Game',
  gradeLevel: '6-12',
  category: 'Physics',
  icon: '🔬'
};