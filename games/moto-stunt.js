/**
 * Moto Stunt Challenge — Physics Motorbike & Stunt Mini-Game
 * Neon Arcade Collection
 */

export function createMotoStuntGame(canvas, sound, callbacks) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = false;
  let isPaused = false;

  const V_WIDTH = 800;
  const V_HEIGHT = 600;

  // Level & Course configuration
  let currentLevel = 1;
  const maxLevels = 3;
  const finishLineX = 3800;

  // Terrain generation function
  function getGroundHeight(worldX) {
    if (worldX < 200) return 460;
    // Rolling hills, launch ramps, and valleys
    let h = 460;
    h -= Math.sin(worldX * 0.005) * 45;
    h -= Math.sin(worldX * 0.012) * 35;

    // Specific ramps
    if (worldX > 700 && worldX < 950) {
      h -= (worldX - 700) * 0.45; // Steep jump ramp!
    } else if (worldX >= 950 && worldX < 1100) {
      h += 60; // Gap pit!
    }

    if (worldX > 1600 && worldX < 1850) {
      h -= (worldX - 1600) * 0.55; // Big air ramp!
    }

    if (worldX > 2500 && worldX < 2800) {
      h -= (worldX - 2500) * 0.4;
    }

    return Math.min(540, Math.max(220, h));
  }

  // Bike & Rider
  const bike = {
    x: 100,
    y: 400,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    wheelRadius: 14,
    wheelbase: 46,
    isGrounded: false,
    airRotationAccumulator: 0,
    stuntText: '',
    stuntTextTimer: 0
  };

  // Game state
  let score = 0;
  let stuntScore = 0;
  let coinsCount = 0;
  let totalFlips = 0;
  let isCrashed = false;
  let isFinished = false;
  let finishTimer = 0;
  let screenShake = 0;

  // Collectibles along course
  let coins = [];
  function populateCoins() {
    coins = [];
    for (let x = 400; x < finishLineX - 200; x += 180) {
      coins.push({
        x,
        y: getGroundHeight(x) - 70 - (Math.random() < 0.4 ? 60 : 0),
        radius: 12,
        collected: false
      });
    }
  }

  // Particles
  let particles = [];
  let floatingTexts = [];

  // Keys
  const keys = {
    gas: false,
    brake: false,
    leanBack: false,
    leanForward: false
  };

  function addFloatingText(x, y, text, color = '#facc15') {
    floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.5
    });
  }

  function addSparks(x, y, count = 12, color = '#00f0ff') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5,
        color,
        alpha: 1,
        decay: 0.04
      });
    }
  }

  function onKeyDown(e) {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.gas = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.brake = true;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.leanBack = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.leanForward = true;
  }

  function onKeyUp(e) {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.gas = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.brake = false;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.leanBack = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.leanForward = false;
  }

  function update() {
    if (!isRunning || isPaused) return;

    if (screenShake > 0) screenShake *= 0.85;

    if (isCrashed) {
      bike.angularVelocity *= 0.95;
      bike.angle += bike.angularVelocity;
      bike.vy += 0.5;
      bike.x += bike.vx;
      bike.y += bike.vy;
      const gh = getGroundHeight(bike.x);
      if (bike.y > gh) {
        bike.y = gh;
        bike.vx *= 0.8;
      }
      return;
    }

    if (isFinished) {
      finishTimer++;
      bike.vx *= 0.96;
      bike.x += bike.vx;
      if (finishTimer > 100) {
        levelComplete();
      }
      return;
    }

    // Engine acceleration
    if (keys.gas) {
      bike.vx += Math.cos(bike.angle) * 0.35;
      bike.vy += Math.sin(bike.angle) * 0.35;
      bike.vx = Math.min(15, bike.vx);
    } else if (keys.brake) {
      bike.vx *= 0.92;
    } else {
      bike.vx *= 0.99; // Air/rolling drag
    }

    // Leaning / Rotation
    if (keys.leanBack) {
      bike.angularVelocity -= 0.008;
    } else if (keys.leanForward) {
      bike.angularVelocity += 0.008;
    } else {
      bike.angularVelocity *= 0.92;
    }

    // Apply rotation
    bike.angle += bike.angularVelocity;

    // Track air rotation for stunts
    if (!bike.isGrounded) {
      bike.airRotationAccumulator += bike.angularVelocity;

      // Backflip check (accumulated ~2*PI backwards)
      if (bike.airRotationAccumulator <= -Math.PI * 1.85) {
        bike.airRotationAccumulator = 0;
        totalFlips++;
        stuntScore += 500;
        sound.playPowerup();
        addFloatingText(bike.x, bike.y - 60, '🔄 BACKFLIP! +500 PTS', '#00f0ff');
      } else if (bike.airRotationAccumulator >= Math.PI * 1.85) {
        bike.airRotationAccumulator = 0;
        totalFlips++;
        stuntScore += 750;
        sound.playPowerup();
        addFloatingText(bike.x, bike.y - 60, '⚡ FRONTFLIP! +750 PTS', '#ff007a');
      }
    } else {
      bike.airRotationAccumulator = 0;
    }

    // Gravity
    bike.vy += 0.42;

    // Move bike
    bike.x += bike.vx;
    bike.y += bike.vy;

    // Calculate wheels position
    const cosA = Math.cos(bike.angle);
    const sinA = Math.sin(bike.angle);
    const rearWheelX = bike.x - cosA * (bike.wheelbase / 2);
    const rearWheelY = bike.y - sinA * (bike.wheelbase / 2) + 12;
    const frontWheelX = bike.x + cosA * (bike.wheelbase / 2);
    const frontWheelY = bike.y + sinA * (bike.wheelbase / 2) + 12;

    const groundRear = getGroundHeight(rearWheelX);
    const groundFront = getGroundHeight(frontWheelX);

    // Collision check
    let hitRear = rearWheelY >= groundRear;
    let hitFront = frontWheelY >= groundFront;

    if (hitRear || hitFront) {
      bike.isGrounded = true;

      // Normal ground slope angle
      const slopeAngle = Math.atan2(groundFront - groundRear, bike.wheelbase);

      // Crash angle check: if bike angle diverges drastically from slope angle
      const angleDiff = Math.abs(normalizeAngle(bike.angle - slopeAngle));
      if (angleDiff > Math.PI * 0.42 && Math.hypot(bike.vx, bike.vy) > 4) {
        crash();
        return;
      }

      // Smooth ground alignment
      bike.angle += (slopeAngle - bike.angle) * 0.18;
      bike.angularVelocity *= 0.5;

      // Normal support
      const avgGround = (groundRear + groundFront) / 2;
      bike.y = avgGround - 12;
      bike.vy = 0;

      // Smoke particles from tire
      if (keys.gas && Math.random() < 0.3) {
        particles.push({
          x: rearWheelX,
          y: rearWheelY,
          vx: -bike.vx * 0.3 + (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          size: 3,
          color: '#64748b',
          alpha: 0.8,
          decay: 0.04
        });
      }
    } else {
      bike.isGrounded = false;
    }

    // Check Coins
    for (let c of coins) {
      if (!c.collected && Math.hypot(bike.x - c.x, bike.y - c.y) < 32) {
        c.collected = true;
        coinsCount++;
        score += 150;
        sound.playCoin();
        addSparks(c.x, c.y, 14, '#facc15');
      }
    }

    // Check Finish Line
    if (bike.x >= finishLineX && !isFinished) {
      isFinished = true;
      finishTimer = 0;
      sound.playVictory();
      addFloatingText(bike.x, bike.y - 70, '🏁 FINISH LINE REACHED!', '#facc15');
    }

    // Score update
    score = Math.floor(bike.x * 0.2) + stuntScore + coinsCount * 150;
    callbacks.onScoreUpdate(score);

    // Floating text update
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    // Particles update
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    }
  }

  function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function crash() {
    isCrashed = true;
    sound.playExplosion();
    screenShake = 16;
    addFloatingText(bike.x, bike.y - 60, '💥 CRASHED!', '#ef4444');

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: bike.x,
        y: bike.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: 3.5,
        color: '#ff0055',
        alpha: 1,
        decay: 0.025
      });
    }

    setTimeout(() => {
      isRunning = false;
      sound.playGameOver();
      callbacks.onGameOver({
        score: score,
        stats: {
          Distance: `${Math.floor(bike.x / 10)} m`,
          Flips: totalFlips,
          Coins: coinsCount
        }
      });
    }, 1200);
  }

  function levelComplete() {
    isRunning = false;
    sound.playVictory();
    callbacks.onGameOver({
      score: score + 2500,
      stats: {
        Course: `Course ${currentLevel} Cleared!`,
        'Total Flips': totalFlips,
        'Stunt Bonus': `${stuntScore} pts`
      }
    });
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Camera follow player horizontally
    const cameraX = bike.x - 220;

    // Cyber Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    skyGrad.addColorStop(0, '#060814');
    skyGrad.addColorStop(0.7, '#0f172a');
    skyGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw Rolling Terrain
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(cameraX - 50, V_HEIGHT);
    for (let x = cameraX - 50; x < cameraX + V_WIDTH + 80; x += 25) {
      ctx.lineTo(x, getGroundHeight(x));
    }
    ctx.lineTo(cameraX + V_WIDTH + 80, V_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Finish Line
    drawFinishLine();

    // Draw Coins
    for (let c of coins) {
      if (!c.collected && c.x > cameraX - 50 && c.x < cameraX + V_WIDTH + 50) {
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Draw Bike & Rider
    drawBike();

    // Draw Particles
    for (let pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw Floating Text
    for (let ft of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();

    // Draw HUD
    drawMotoHUD();

    ctx.restore();
  }

  function drawBike() {
    ctx.save();
    ctx.translate(bike.x, bike.y);
    ctx.rotate(bike.angle);

    // Wheels
    const wHalf = bike.wheelbase / 2;
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;

    // Rear Wheel
    ctx.beginPath();
    ctx.arc(-wHalf, 12, bike.wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front Wheel
    ctx.beginPath();
    ctx.arc(wHalf, 12, bike.wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Chassis Frame (Neon Vector Triangles)
    ctx.strokeStyle = '#ff007a';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff007a';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-wHalf, 12);
    ctx.lineTo(0, -4);
    ctx.lineTo(wHalf, 12);
    ctx.lineTo(wHalf - 12, -8);
    ctx.lineTo(0, -4);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rider Figure
    ctx.fillStyle = '#0284c7';
    // Torso leaning forward
    ctx.fillRect(-8, -26, 16, 22);

    // Helmet
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(4, -36, 10, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    ctx.fillStyle = '#facc15';
    ctx.fillRect(8, -38, 8, 4);

    ctx.restore();
  }

  function drawFinishLine() {
    const fx = finishLineX;
    const fy = getGroundHeight(fx);

    // Poles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx, fy - 140, 6, 140);

    // Checkered banner
    const bw = 60;
    const bh = 36;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(fx + 6 + c * 12, fy - 135 + r * 12, 12, 12);
      }
    }
  }

  function drawMotoHUD() {
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 10, V_WIDTH - 20, 52);

    // Score
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SCORE', 25, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), 25, 46);

    // Distance
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('PROGRESS', 160, 26);
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px monospace';
    const percent = Math.min(100, Math.round((bike.x / finishLineX) * 100));
    ctx.fillText(`${percent}% (${Math.floor(bike.x / 10)}m)`, 160, 46);

    // Flips & Stunts
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('STUNT FLIPS', 320, 26);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${totalFlips} FLIPS`, 320, 46);

    // Speed
    const displaySpeed = Math.round(bike.vx * 12);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SPEED', 460, 26);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${displaySpeed} km/h`, 460, 46);

    // Coins
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`$ ${coinsCount}`, V_WIDTH - 120, 42);
  }

  function loop() {
    update();
    draw();
    if (isRunning) {
      animationId = requestAnimationFrame(loop);
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    start() {
      isRunning = true;
      isPaused = false;
      populateCoins();
      loop();
    },
    pause() {
      isPaused = true;
    },
    resume() {
      isPaused = false;
    },
    restart() {
      score = 0;
      stuntScore = 0;
      coinsCount = 0;
      totalFlips = 0;
      isCrashed = false;
      isFinished = false;
      finishTimer = 0;
      bike.x = 100;
      bike.y = 400;
      bike.vx = 0;
      bike.vy = 0;
      bike.angle = 0;
      bike.angularVelocity = 0;
      particles = [];
      floatingTexts = [];
      populateCoins();
      isRunning = true;
      isPaused = false;
      loop();
    },
    destroy() {
      isRunning = false;
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
    setVirtualKey(code, isPressed) {
      if (code === 'Gas' || code === 'Up') keys.gas = isPressed;
      if (code === 'Brake' || code === 'Down') keys.brake = isPressed;
      if (code === 'LeanBack' || code === 'Left') keys.leanBack = isPressed;
      if (code === 'LeanForward' || code === 'Right') keys.leanForward = isPressed;
    },
    getInstructions() {
      return 'Up/W Gas · Down/S Brake · Left/Right A/D to Lean & perform Flips! Land safely on wheels.';
    },
    getControlsConfig() {
      return {
        dpad: true,
        buttons: [
          { id: 'gas', label: '⚡ ACCEL', code: 'Gas', primary: true },
          { id: 'brake', label: '🛑 BRAKE', code: 'Brake' },
          { id: 'flip', label: '↺ BACKFLIP', code: 'LeanBack' }
        ]
      };
    }
  };
}
