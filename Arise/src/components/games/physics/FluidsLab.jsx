import React, { useRef, useEffect, useState, useCallback } from 'react';

export function FluidsLab() {
  // DESIGN PARAMETERS
  const [outerWidth, setOuterWidth] = useState(2.5);
  const [outerHeight, setOuterHeight] = useState(0.8);
  const [thickness, setThickness] = useState(0.1);
  const [cargoMass, setCargoMass] = useState(100);

  // WATER PARAMETERS
  const [waterDensity, setWaterDensity] = useState(1000);
  const [flowSpeed, setFlowSpeed] = useState(1.0);

  // SIMULATION STATE
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [boatX, setBoatX] = useState(2);
  const [boatY, setBoatY] = useState(0);
  const [boatVX, setBoatVX] = useState(0);
  const [boatVY, setBoatVY] = useState(0);
  const [submergedDepth, setSubmergedDepth] = useState(0);
  const [sunk, setSunk] = useState(false);
  const [won, setWon] = useState(false);
  const [trialData, setTrialData] = useState([]);
  const [showVectors, setShowVectors] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);

  // MODAL STATE
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // GAME STATE
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [achievements, setAchievements] = useState([]);
  const [bestDistance, setBestDistance] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);
  const [energy, setEnergy] = useState(100);

  // Constants
  const g = 9.81;
  const length = 1.0;
  const Cd = 1.1;
  const finishDistance = 15;

  // Materials library
  const materials = {
    wood: { density: 600, name: '🌳 Wood', color: '#8B4513' },
    aluminum: { density: 2700, name: '⚡ Aluminum', color: '#C0C0C0' },
    steel: { density: 7800, name: '🔩 Steel', color: '#4F4F4F' },
    plastic: { density: 950, name: '♻️ Plastic', color: '#FF6B6B' },
    carbon: { density: 1600, name: '💎 Carbon Fiber', color: '#2C2C2C' }
  };

  const [selectedMaterial, setSelectedMaterial] = useState('wood');

  // Achievement definitions
  const achievementList = {
    speed_demon: { name: "Speed Demon", desc: "Reach finish line in under 20s", icon: "⚡", points: 100 },
    cargo_master: { name: "Cargo Master", desc: "Complete run with 200kg+ cargo", icon: "📦", points: 200 },
    perfect_balance: { name: "Perfect Balance", desc: "Achieve 50% submerged depth", icon: "⚖️", points: 150 },
    storm_survivor: { name: "Storm Survivor", desc: "Survive 4+ m/s flow speed", icon: "🌊", points: 300 },
    efficiency_expert: { name: "Efficiency Expert", desc: "95%+ stability rating", icon: "🎯", points: 250 },
    distance_king: { name: "Distance King", desc: "Travel over 20m", icon: "🏆", points: 180 },
    level_master: { name: "Level Master", desc: "Complete 5 levels", icon: "📈", points: 500 }
  };

  // Parameter Effects Table Data
  const parameterEffects = [
    {
      parameter: 'Width (outerWidth)',
      submerged: 'Decreases (wider base displaces more water per depth)',
      buoyancy: 'Improves (wider = more stable, supports more cargo)',
      drag: 'Increases slightly (larger frontal area)',
      gameplay: 'Easier for heavy loads; harder to accelerate'
    },
    {
      parameter: 'Height (outerHeight)',
      submerged: 'No direct change (but more room before sinking)',
      buoyancy: 'Improves (more reserve buoyancy for waves)',
      drag: 'Increases if submerged more',
      gameplay: 'Prevents sinking in high-flow; pair with low thickness'
    },
    {
      parameter: 'Cavity/Thickness',
      submerged: 'Increases (thicker = more hull mass)',
      buoyancy: 'Decreases (heavier hull sinks easier)',
      drag: 'Increases (more submersion)',
      gameplay: 'Thicker = durable but heavy; thinner = lighter/faster'
    },
    {
      parameter: 'Weight (cargoMass + material)',
      submerged: 'Increases (heavier = deeper submersion)',
      buoyancy: 'Decreases (risk of sinking)',
      drag: 'Increases (deeper = more drag)',
      gameplay: 'Heavy for bonuses; tune width/height to compensate'
    },
    {
      parameter: 'Water Density (ρ_w)',
      submerged: 'Decreases (denser water = more buoyancy)',
      buoyancy: 'Improves (easier to float heavy boats)',
      drag: 'Decreases (shallower submersion)',
      gameplay: 'High for tough levels; low ramps up sinking risk'
    }
  ];

  // Physics calculations (moved above challenges to fix initialization error)
  const cavityVolume = useCallback(() => {
    const innerW = Math.max(0, outerWidth - 2 * thickness);
    const innerH = Math.max(0, outerHeight - thickness);
    return innerW * innerH * length;
  }, [outerWidth, outerHeight, thickness]);

  const hullMaterialVolume = useCallback(() => {
    const outerVol = outerWidth * outerHeight * length;
    const innerVol = Math.max(0, (outerWidth - 2 * thickness) * Math.max(0, outerHeight - thickness) * length);
    return Math.max(0, outerVol - innerVol);
  }, [outerWidth, outerHeight, thickness]);

  const boatMass = useCallback(() => {
    const material = materials[selectedMaterial];
    const hullMass = hullMaterialVolume() * material.density;
    return hullMass + cargoMass;
  }, [hullMaterialVolume, selectedMaterial, cargoMass]);

  const computeSubmergedDepth = useCallback(() => {
    const totalMass = boatMass();
    const weight = totalMass * g;
    const d = weight / (waterDensity * g * outerWidth * length);
    return Math.min(d, outerHeight);
  }, [boatMass, waterDensity, outerWidth, outerHeight]);

  const computeForces = useCallback((vx, vy, submergedDepthLocal) => {
    const relVelX = flowSpeed - vx;
    const relVelY = -vy;
    const relSpeed = Math.sqrt(relVelX * relVelX + relVelY * relVelY);
    const A = Math.max(0.01, Math.min(outerHeight, submergedDepthLocal) * length);
    const dragMagnitude = 0.5 * waterDensity * Cd * A * relSpeed * relSpeed;
    const dragX = relSpeed > 0 ? (dragMagnitude * relVelX / relSpeed) : 0;
    const dragY = relSpeed > 0 ? (dragMagnitude * relVelY / relSpeed) : 0;
    const displacedVolume = outerWidth * submergedDepthLocal * length;
    const buoyantForce = waterDensity * g * displacedVolume;
    const weight = boatMass() * g;
    const netVerticalForce = buoyantForce - weight;
    return { dragX, dragY, netVerticalForce, buoyantForce, weight };
  }, [flowSpeed, waterDensity, outerHeight, outerWidth, boatMass]);

  // Performance metrics (moved above challenges due to dependency on computeSubmergedDepth)
  const metrics = {
    efficiency: Math.max(0, 100 - Math.abs(computeSubmergedDepth() - outerHeight/2) * 100),
    stability: sunk ? 0 : Math.max(0, 100 - Math.abs(boatVY) * 100),
    speed: Math.abs(boatVX),
    distance: boatX
  };

  // Expanded Challenges (understanding-based, requiring physics knowledge)
  const challenges = [
    { id: 1, name: "Beginner's Luck", goal: "Travel 10m without sinking", reward: 50, completed: boatX >= 10 && !sunk, hint: "Use a wide, light boat (e.g., wood, width >2m) to maximize buoyancy." },
    { id: 2, name: "Speed Run", goal: `Complete Level ${currentLevel} in <15s`, reward: 100, completed: boatX >= finishDistance && time <= 15 && !sunk, hint: "Minimize drag with low submersion (<40%) and use thrust strategically." },
    { id: 3, name: "Heavy Hauler", goal: "Carry 300kg cargo to finish", reward: 200, completed: cargoMass >= 300 && boatX >= finishDistance && !sunk, hint: "Increase width (>4m) and water density (>1000kg/m³) to support heavy cargo." },
    { id: 4, name: "Perfect Float", goal: "Maintain exactly 50% submersion", reward: 150, completed: Math.abs((submergedDepth/outerHeight) - 0.5) < 0.02 && boatX >= 5, hint: "Calculate total mass / (width * length * water density) = 0.5 * height." },
    { id: 5, name: "Buoyancy Basics", goal: "Float with wood & 0 cargo", reward: 75, completed: selectedMaterial === 'wood' && cargoMass === 0 && submergedDepth < outerHeight * 0.6 && boatX >= 5, hint: "Wood’s low density (600kg/m³) ensures flotation with minimal submersion." },
    { id: 6, name: "Steel Survivor", goal: "Complete with steel without sinking", reward: 150, completed: selectedMaterial === 'steel' && !sunk && boatX >= finishDistance, hint: "Steel’s high density (7800kg/m³) requires wide width (>4.5m) and high water density." },
    { id: 7, name: "Wide Load", goal: "Width >4m, 400kg cargo, no sink", reward: 100, completed: outerWidth > 4 && cargoMass >= 400 && !sunk && boatX >= finishDistance, hint: "Wider boats displace more water, reducing submersion for heavy loads." },
    { id: 8, name: "Shallow Draft", goal: "<30% submersion with 200kg cargo", reward: 120, completed: (submergedDepth / outerHeight < 0.3) && cargoMass >= 200 && !sunk && boatX >= finishDistance, hint: "Use high water density and wide hull to minimize submersion depth." },
    { id: 9, name: "Density Defender", goal: "Complete with water density 900kg/m³", reward: 130, completed: waterDensity <= 900 && !sunk && boatX >= finishDistance, hint: "Low water density reduces buoyancy; increase width or use light material (e.g., wood)." },
    { id: 10, name: "Thin Hull Triumph", goal: "Thickness <0.05m, complete", reward: 80, completed: thickness < 0.05 && !sunk && boatX >= finishDistance, hint: "Thin hulls reduce mass but limit cargo space; balance with low cargo." },
    { id: 11, name: "Cargo Calculator", goal: "500kg cargo, width >3m, plastic", reward: 180, completed: cargoMass >= 500 && outerWidth > 3 && selectedMaterial === 'plastic' && !sunk && boatX >= finishDistance, hint: "Plastic (950kg/m³) needs careful width adjustment to float 500kg." },
    { id: 12, name: "Drag Dodger", goal: ">3m/s speed, <40% submersion", reward: 140, completed: boatVX > 3 && (submergedDepth / outerHeight < 0.4) && boatX >= 10, hint: "Low submersion reduces drag area; use light materials and thrust." },
    { id: 13, name: "Reserve Buoyancy", goal: "Height >1.5m, level 3+", reward: 110, completed: outerHeight > 1.5 && currentLevel >= 3 && !sunk && boatX >= finishDistance, hint: "Tall hulls prevent sinking in high-flow conditions." },
    { id: 14, name: "Eco Floater", goal: "Carbon fiber, <50kg cargo, >90% efficiency", reward: 160, completed: selectedMaterial === 'carbon' && cargoMass < 50 && metrics.efficiency > 90 && boatX >= finishDistance, hint: "Carbon fiber (1600kg/m³) is light; optimize for minimal submersion." },
    { id: 15, name: "Physics Puzzle", goal: "50% submersion, wood, 100kg, width=2m", reward: 200, completed: Math.abs((submergedDepth/outerHeight) - 0.5) < 0.05 && selectedMaterial === 'wood' && cargoMass === 100 && outerWidth === 2 && !sunk && boatX >= finishDistance, hint: "Solve for height using mass / (width * length * water density) = 0.5 * height." },
    { id: 16, name: "Extreme Conditions", goal: "Complete with 5m/s flow, aluminum", reward: 250, completed: flowSpeed >= 5 && selectedMaterial === 'aluminum' && !sunk && boatX >= finishDistance, hint: "High flow increases drag; use wide, tall hull to counter aluminum’s density (2700kg/m³)." },
    { id: 17, name: "Minimalist Design", goal: "Complete with <0.5m height, no cargo", reward: 170, completed: outerHeight < 0.5 && cargoMass === 0 && !sunk && boatX >= finishDistance, hint: "Low height requires precise mass balance to avoid sinking; use light material." },
    { id: 18, name: "Heavy Duty", goal: "Carry 450kg with thickness >0.2m", reward: 220, completed: cargoMass >= 450 && thickness > 0.2 && !sunk && boatX >= finishDistance, hint: "Thick hulls add mass; compensate with very wide hull (>5m)." },
    { id: 19, name: "Low Energy Master", goal: "Complete with <50% energy used", reward: 190, completed: energy > 50 && boatX >= finishDistance && !sunk, hint: "Rely on flow speed, not thrust, with low-drag design (shallow submersion)." },
    { id: 20, name: "Precision Engineer", goal: "40-60% submersion, steel, level 4+", reward: 300, completed: (submergedDepth / outerHeight >= 0.4 && submergedDepth / outerHeight <= 0.6) && selectedMaterial === 'steel' && currentLevel >= 4 && !sunk && boatX >= finishDistance, hint: "Steel’s high density requires precise width and height tuning for 40-60% submersion." },
    { id: 21, name: "Ultra-Light Challenge", goal: "Complete with total mass <200kg, flow >4m/s", reward: 280, completed: boatMass() < 200 && flowSpeed > 4 && !sunk && boatX >= finishDistance, hint: "Use minimal thickness (<0.03m) and wood to keep mass low while countering high flow with wide hull." },
    { id: 22, name: "Narrow Navigator", goal: "Width <1.5m, 250kg cargo, level 3+", reward: 260, completed: outerWidth < 1.5 && cargoMass >= 250 && currentLevel >= 3 && !sunk && boatX >= finishDistance, hint: "Narrow width increases submersion; use high water density (>1050kg/m³) and light material like plastic." },
    { id: 23, name: "High Drag Defier", goal: ">2.5m/s speed with thickness >0.3m", reward: 240, completed: boatVX > 2.5 && thickness > 0.3 && !sunk && boatX >= finishDistance, hint: "Thick hulls increase mass and drag; use multiple thrusts and wide hull to maintain speed." },
    { id: 24, name: "Density Dilemma", goal: "Complete with water density <850kg/m³, steel", reward: 320, completed: waterDensity < 850 && selectedMaterial === 'steel' && !sunk && boatX >= finishDistance, hint: "Extremely low water density requires very wide hull (>5m) to float steel’s high density (7800kg/m³)." },
    { id: 25, name: "Perfect Efficiency", goal: "Complete with >95% efficiency, <30% energy, level 5+", reward: 350, completed: metrics.efficiency > 95 && energy > 70 && currentLevel >= 5 && !sunk && boatX >= finishDistance, hint: "Maximize efficiency by keeping submersion near 50% with precise mass and width calculations; minimize thrust." }
  ];

  // Particle system for water effects
  const createWaterParticles = useCallback((x, y, count = 10) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + Math.random() * 50 - 25,
        y: y + Math.random() * 20 - 10,
        vx: (Math.random() - 0.5) * 100 + flowSpeed * 20,
        vy: (Math.random() - 0.5) * 50,
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        size: Math.random() * 3 + 1,
        color: `rgba(0, 150, 255, ${0.3 + Math.random() * 0.4})`
      });
    }
    return particles;
  }, [flowSpeed]);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setTime(0);
    setBoatX(2);
    setBoatY(0);
    setBoatVX(0);
    setBoatVY(0);
    setTrialData([]);
    setSunk(false);
    setWon(false);
    setEnergy(100);
    particlesRef.current = [];
    setTotalRuns(prev => prev + 1);
  }, []);

  // Start/Stop simulation
  const toggleSimulation = useCallback(() => {
    if (running) {
      setRunning(false);
    } else {
      resetSimulation();
      setRunning(true);
    }
  }, [running, resetSimulation]);

  // Thrust function
  const thrust = useCallback(() => {
    if (energy > 0 && running && !sunk && !won) {
      setBoatVX(v => v + 2);
      setEnergy(e => Math.max(0, e - 5));
      particlesRef.current.push(...createWaterParticles(boatX * 40 + 400, 200 - boatY * 40 + 20, 8));
    }
  }, [energy, running, sunk, won, boatX, boatY, createWaterParticles]);

  // Check achievements
  const checkAchievements = useCallback(() => {
    const newAchievements = [];
    if (boatX >= 15 && time < 20 && !achievements.includes('speed_demon')) {
      newAchievements.push('speed_demon');
      setScore(prev => prev + 100);
    }
    if (cargoMass >= 200 && boatX >= 15 && !sunk && !achievements.includes('cargo_master')) {
      newAchievements.push('cargo_master');
      setScore(prev => prev + 200);
    }
    if (Math.abs(submergedDepth / outerHeight - 0.5) < 0.05 && !achievements.includes('perfect_balance')) {
      newAchievements.push('perfect_balance');
      setScore(prev => prev + 150);
    }
    if (flowSpeed >= 4 && boatX >= 10 && !sunk && !achievements.includes('storm_survivor')) {
      newAchievements.push('storm_survivor');
      setScore(prev => prev + 300);
    }
    if (boatX >= 20 && !achievements.includes('distance_king')) {
      newAchievements.push('distance_king');
      setScore(prev => prev + 180);
    }
    const stability = sunk ? 0 : Math.max(0, 100 - Math.abs(boatVY) * 100);
    if (stability >= 95 && boatX >= 10 && !achievements.includes('efficiency_expert')) {
      newAchievements.push('efficiency_expert');
      setScore(prev => prev + 250);
    }
    if (currentLevel >= 5 && !achievements.includes('level_master')) {
      newAchievements.push('level_master');
      setScore(prev => prev + 500);
    }
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
    if (boatX > bestDistance) {
      setBestDistance(boatX);
    }
  }, [boatX, time, achievements, cargoMass, sunk, submergedDepth, outerHeight, flowSpeed, boatVY, bestDistance, currentLevel]);

  // Simulation step
  const step = useCallback((dt) => {
    if (won || sunk) return;
    const dRequired = computeSubmergedDepth();
    const submergedLocal = sunk ? outerHeight : dRequired;
    setSubmergedDepth(submergedLocal);
    const forces = computeForces(boatVX, boatVY, submergedLocal);
    const mass = boatMass();
    const accX = forces.dragX / mass;
    setBoatVX(v => v + accX * dt);
    setBoatX(x => x + boatVX * dt);
    const acc_up = (forces.netVerticalForce + forces.dragY) / mass;
    let newVY = boatVY - acc_up * dt;
    if (!sunk) {
      newVY *= 0.9;
    } else {
      newVY = Math.min(newVY, 2);
    }
    setBoatVY(newVY);
    let newY = boatY + newVY * dt;
    if (sunk) {
      newY = Math.min(newY, 5);
    }
    setBoatY(newY);
    setEnergy(e => Math.min(100, e + 0.1));
    if (Math.random() < 0.01) {
      setFlowSpeed(fs => fs + (Math.random() - 0.5) * 0.5);
    }
    const particleY = 200 + boatY * 40;
    if (sunk && Math.random() < 0.3) {
      particlesRef.current.push(...createWaterParticles(boatX * 40 + 400, particleY, 5));
    } else if (Math.abs(boatVX) > 0.1 && Math.random() < 0.4) {
      particlesRef.current.push(...createWaterParticles(boatX * 40 + 400, particleY - 20, 3));
    }
    setTime(t => t + dt);
    setTrialData(prev => [...prev, {
      t: time,
      x: boatX,
      y: boatY,
      vx: boatVX,
      vy: boatVY,
      submerged: submergedLocal,
      sunk
    }].slice(-500));
    checkAchievements();
    if (boatX >= finishDistance && !sunk) {
      setWon(true);
      const levelBonus = currentLevel * 50;
      const timeBonus = Math.max(0, 100 - time * 2);
      const balanceBonus = Math.max(0, 100 - Math.abs((submergedDepth / outerHeight - 0.5) * 200));
      const totalBonus = levelBonus + timeBonus + balanceBonus;
      setScore(prev => prev + totalBonus);
      setCurrentLevel(l => l + 1);
      setFlowSpeed(fs => fs + 0.3);
    }
  }, [computeSubmergedDepth, computeForces, boatVX, boatVY, boatMass, time, boatX, boatY, sunk, createWaterParticles, checkAchievements, outerHeight, won, finishDistance, currentLevel, submergedDepth]);

  // Drawing function
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 900;
    const H = canvas.height = 400;
    const scale = 40;

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
    bgGradient.addColorStop(0, '#87CEEB');
    bgGradient.addColorStop(0.6, '#4682B4');
    bgGradient.addColorStop(1, '#191970');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Water surface
    const waterLevel = 200;
    const waterGradient = ctx.createLinearGradient(0, waterLevel, 0, H);
    waterGradient.addColorStop(0, 'rgba(0, 191, 255, 0.3)');
    waterGradient.addColorStop(1, 'rgba(0, 100, 200, 0.6)');
    ctx.fillStyle = waterGradient;
    ctx.fillRect(0, waterLevel, W, H - waterLevel);

    // Animated water surface
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const waveTime = Date.now() / 1000;
    for (let x = 0; x <= W; x += 5) {
      const waveHeight = Math.sin((x / 50) + waveTime * 2) * 3 + Math.sin((x / 30) + waveTime * 3) * 2;
      const y = waterLevel + waveHeight;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Flow indicators
    for (let i = 0; i < 15; i++) {
      const y = waterLevel + 20 + (i * 12);
      const x = ((i * 60 + waveTime * flowSpeed * 100) % W);
      const arrowLength = Math.min(30, Math.abs(flowSpeed) * 20);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.abs(flowSpeed) * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + arrowLength, y - 3);
      ctx.lineTo(x + arrowLength, y + 3);
      ctx.closePath();
      ctx.fill();
    }

    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Boat drawing
    const boatWidth = outerWidth * scale;
    const boatHeight = outerHeight * scale;
    const submergedPx = sunk ? boatHeight : submergedDepth * scale;
    const equilibriumTopY = waterLevel - (boatHeight - submergedPx);
    const boatPxY = equilibriumTopY + boatY * scale;
    const boatPxX = boatX * scale + 50;
    const bowLength = boatWidth * 0.2;
    const material = materials[selectedMaterial];

    // Hull shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(boatPxX + 3, boatPxY + 3, boatWidth, boatHeight);

    // Main hull
    ctx.fillStyle = material.color;
    ctx.fillRect(boatPxX, boatPxY, boatWidth - bowLength, boatHeight);

    // Bow
    ctx.beginPath();
    ctx.moveTo(boatPxX + boatWidth - bowLength, boatPxY + boatHeight * 0.2);
    ctx.lineTo(boatPxX + boatWidth, boatPxY + boatHeight * 0.5);
    ctx.lineTo(boatPxX + boatWidth - bowLength, boatPxY + boatHeight * 0.8);
    ctx.closePath();
    ctx.fill();

    // Hull outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(boatPxX, boatPxY, boatWidth - bowLength, boatHeight);
    ctx.beginPath();
    ctx.moveTo(boatPxX + boatWidth - bowLength, boatPxY + boatHeight * 0.2);
    ctx.lineTo(boatPxX + boatWidth, boatPxY + boatHeight * 0.5);
    ctx.lineTo(boatPxX + boatWidth - bowLength, boatPxY + boatHeight * 0.8);
    ctx.stroke();

    // Cavity
    const innerW = Math.max(0, outerWidth - 2 * thickness);
    const innerH = Math.max(0, outerHeight - thickness);
    if (innerW > 0 && innerH > 0) {
      ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
      const cavityX = boatPxX + thickness * scale;
      const cavityY = boatPxY + thickness * scale;
      const cavityWidth = innerW * scale;
      const cavityHeight = innerH * scale;
      ctx.fillRect(cavityX, cavityY, cavityWidth - bowLength, cavityHeight);
      if (cargoMass > 0) {
        const cargoSize = Math.min(cavityWidth * 0.5, cargoMass / 10);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(cavityX + 5, cavityY + cavityHeight * 0.7, cargoSize, 10);
      }
    }

    // Submerged area highlight
    if (!sunk) {
      ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
      const subBottomMain = boatPxY + boatHeight;
      const subTopMain = subBottomMain - submergedPx;
      ctx.fillRect(boatPxX, subTopMain, boatWidth - bowLength, submergedPx);
      ctx.beginPath();
      const bowSubTop = subBottomMain - submergedPx;
      ctx.moveTo(boatPxX + boatWidth - bowLength, bowSubTop);
      ctx.lineTo(boatPxX + boatWidth, boatPxY + boatHeight * 0.5);
      ctx.lineTo(boatPxX + boatWidth - bowLength, subBottomMain);
      ctx.closePath();
      ctx.fill();
    }

    // Water line
    ctx.strokeStyle = sunk ? '#FF4444' : '#00FF00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(boatPxX - 20, waterLevel);
    ctx.lineTo(boatPxX + boatWidth + 20, waterLevel);
    ctx.stroke();
    ctx.setLineDash([]);

    // Force vectors
    if (showVectors && !sunk && !won) {
      const forces = computeForces(boatVX, boatVY, submergedDepth);
      const centerX = boatPxX + boatWidth / 2;
      const centerY = boatPxY + boatHeight / 2;
      const dragScale = 0.5;
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + forces.dragX * dragScale, centerY + (-forces.dragY) * dragScale);
      ctx.stroke();
      const buoyancyScale = 0.01;
      ctx.strokeStyle = '#00FF00';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, centerY - forces.buoyantForce * buoyancyScale);
      ctx.stroke();
      ctx.strokeStyle = '#0000FF';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, centerY + forces.weight * buoyancyScale);
      ctx.stroke();
    }

    // Finish line
    const finishX = finishDistance * scale + 50;
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(finishX, 0);
    ctx.lineTo(finishX, H);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('🏁 FINISH', finishX - 40, 30);

    // Status indicators
    if (sunk) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fillRect(W/2 - 100, H/2 - 30, 200, 60);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🚨 SUNK! 🚨', W/2, H/2 + 8);
      ctx.textAlign = 'left';
    }
    if (won) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.fillRect(W/2 - 100, H/2 - 30, 200, 60);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 WON! 🎉', W/2, H/2 + 8);
      ctx.textAlign = 'left';
    }

    // Distance marker
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(10, 10, 200, 30);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Distance: ${boatX.toFixed(1)}m`, 15, 30);

    // Score display
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(W - 160, 10, 150, 30);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Score: ${score}`, W - 155, 30);

    // Energy bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(10, 50, 200, 20);
    ctx.fillStyle = energy > 20 ? '#4CAF50' : '#FF9800';
    ctx.fillRect(10, 50, (energy / 100) * 200, 20);
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('Energy', 10, 48);

    // Level
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(W - 160, 50, 150, 20);
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText(`Level: ${currentLevel}`, W - 155, 65);
  }, [boatX, boatY, outerWidth, outerHeight, thickness, selectedMaterial, cargoMass, submergedDepth, sunk, showVectors, computeForces, boatVX, boatVY, flowSpeed, score, won, currentLevel, energy, finishDistance]);

  // Animation loop
  useEffect(() => {
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.02, (now - last) / 1000);
      last = now;
      if (running) step(dt);
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 50 * dt;
        particle.life -= particle.decay;
        return particle.life > 0;
      });
      drawScene();
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, step, drawScene]);

  // Export CSV
  const exportCSV = useCallback(() => {
    if (!trialData.length) return;
    const header = 'time,position_x,position_y,velocity_x,velocity_y,submerged_depth,is_sunk,boat_mass,buoyant_force,drag_force\n';
    const rows = trialData.map(row => {
      const mass = boatMass();
      const forces = computeForces(row.vx, row.vy, row.submerged);
      return `${row.t.toFixed(3)},${row.x.toFixed(3)},${row.y.toFixed(3)},${row.vx.toFixed(3)},${row.vy.toFixed(3)},${row.submerged.toFixed(3)},${row.sunk ? 1 : 0},${mass.toFixed(2)},${forces.buoyantForce.toFixed(2)},${Math.sqrt(forces.dragX*forces.dragX + forces.dragY*forces.dragY).toFixed(2)}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluids_lab_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [trialData, boatMass, computeForces]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌊 Advanced Fluids Laboratory</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Design your boat, thrust to accelerate, reach the finish without sinking! Levels get harder.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-700">
            <span>🏆 Score: {score}</span>
            <span>🎯 Best: {bestDistance.toFixed(1)}m</span>
            <span>🔄 Runs: {totalRuns}</span>
            <span>🏅 Achievements: {achievements.length}/{Object.keys(achievementList).length}</span>
            <span>📊 Level: {currentLevel}</span>
          </div>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            ❓ How to Play?
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🚤 Boat Design</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Width: {outerWidth.toFixed(2)}m</label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={outerWidth}
                    onChange={(e) => setOuterWidth(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Height: {outerHeight.toFixed(2)}m</label>
                  <input
                    type="range"
                    min="0.2"
                    max="2"
                    step="0.1"
                    value={outerHeight}
                    onChange={(e) => setOuterHeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Hull Thickness: {thickness.toFixed(2)}m</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Material</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg p-2 text-sm"
                  >
                    {Object.entries(materials).map(([key, material]) => (
                      <option key={key} value={key}>{material.name} ({material.density} kg/m³)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Cargo: {cargoMass}kg</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={cargoMass}
                    onChange={(e) => setCargoMass(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🌊 Water Conditions</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Water Density: {waterDensity} kg/m³</label>
                  <input
                    type="range"
                    min="800"
                    max="1100"
                    step="10"
                    value={waterDensity}
                    onChange={(e) => setWaterDensity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Flow Speed: {flowSpeed.toFixed(1)} m/s</label>
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.1"
                    value={flowSpeed}
                    onChange={(e) => setFlowSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">⚙️ Simulation</h3>
              <div className="space-y-3 text-sm">
                <button
                  onClick={toggleSimulation}
                  disabled={won || sunk}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm ${running ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'} ${won || sunk ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {running ? '⏸️ Pause' : '▶️ Start'}
                </button>
                <button
                  onClick={thrust}
                  disabled={energy <= 0 || !running || sunk || won}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Thrust ({energy.toFixed(0)}%)
                </button>
                <button
                  onClick={resetSimulation}
                  className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg font-medium text-sm hover:bg-gray-600"
                >
                  🔄 Reset
                </button>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showVectors}
                    onChange={(e) => setShowVectors(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Show Vectors</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showMeasurements}
                    onChange={(e) => setShowMeasurements(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Show Measurements</span>
                </label>
                <button
                  onClick={exportCSV}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600"
                  disabled={!trialData.length}
                >
                  📊 Export CSV
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="font-medium">{metrics.efficiency.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Stability:</span>
                  <span className="font-medium">{metrics.stability.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="font-medium">{metrics.speed.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{time.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Submerged:</span>
                  <span className="font-medium">{(submergedDepth / outerHeight * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-2 col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">🛥️ Simulation View</h3>
              <canvas ref={canvasRef} className="w-full border border-gray-300 rounded" />
            </div>
          </div>
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🎯 Challenges</h3>
              <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
                {challenges.map(challenge => (
                  <div
                    key={challenge.id}
                    className={`p-2 rounded border ${challenge.completed ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{challenge.name}</span>
                      <span className={`text-xs ${challenge.completed ? 'text-green-600' : 'text-gray-500'}`}>
                        {challenge.completed ? '✅' : '⏳'} {challenge.reward}pts
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{challenge.goal}</div>
                    <div className="text-xs text-blue-600 mt-1">Hint: {challenge.hint}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🏅 Achievements</h3>
              <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                {Object.entries(achievementList).map(([key, ach]) => {
                  const unlocked = achievements.includes(key);
                  return (
                    <div
                      key={key}
                      className={`p-2 rounded flex items-center space-x-2 ${unlocked ? 'bg-yellow-100 border-yellow-300' : 'bg-gray-100 border-gray-300 opacity-50'}`}
                    >
                      <span className="text-lg">{ach.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{ach.name}</div>
                        <div className="text-xs text-gray-600">{ach.desc}</div>
                      </div>
                      {unlocked && <span className="text-xs text-yellow-600">+{ach.points}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {showHowToPlay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl shadow-2xl max-w-2xl mx-auto max-h-[90vh] overflow-y-auto border border-blue-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">❓ How to Play</h2>
                  <button
                    onClick={() => setShowHowToPlay(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-6 text-sm">
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-2">About the Game:</p>
                    <p className="text-gray-600">Welcome to Fluids Lab! Design a boat that navigates a river current using real physics of buoyancy and drag. Balance your boat's weight and shape to stay afloat while using limited energy to thrust forward. As levels progress, the current strengthens—adapt your design to survive!</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-2">How to Win:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Design your boat: Adjust width, height, thickness, material, and cargo to optimize buoyancy (aim for ~50% submerged).</li>
                      <li>Start the simulation and use the <strong className="text-blue-600">🚀 Thrust</strong> button to boost speed (uses energy, recharges slowly).</li>
                      <li>Reach the green finish line without sinking (submerged depth &lt; 100%).</li>
                      <li>Earn bonuses for time, balance, and level. Complete challenges and unlock achievements for extra points!</li>
                      <li>Reset and redesign if you sink. Use hints in challenges to apply physics!</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-3">🛠️ Parameter Effects</p>
                    <p className="text-gray-600 text-xs mb-3">See how adjustments impact buoyancy, drag, and gameplay:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 text-left">Parameter</th>
                            <th className="border border-gray-300 p-2 text-left">Submerged Depth</th>
                            <th className="border border-gray-300 p-2 text-left">Buoyancy/Stability</th>
                            <th className="border border-gray-300 p-2 text-left">Drag/Speed</th>
                            <th className="border border-gray-300 p-2 text-left">Gameplay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parameterEffects.map((effect, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                              <td className="border border-gray-300 p-2 font-medium">{effect.parameter}</td>
                              <td className="border border-gray-300 p-2">{effect.submerged}</td>
                              <td className="border border-gray-300 p-2">{effect.buoyancy}</td>
                              <td className="border border-gray-300 p-2">{effect.drag}</td>
                              <td className="border border-gray-300 p-2">{effect.gameplay}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="mt-6 w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm"
                >
                  Got it! Let's Sail! ⛵
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  name: 'Fluids Lab — Buoyancy & Drag',
  gradeLevel: '9-12',
  category: 'Physics',
  icon: '🌊'
};
