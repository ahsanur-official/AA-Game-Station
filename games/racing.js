/**
 * Turbo Rush — Racing / Endless Runner Mini-Game
 * Neon Arcade Collection
 */

export function createRacingGame(canvas, sound, callbacks) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = false;
  let isPaused = false;

  // Virtual resolution
  const V_WIDTH = 800;
  const V_HEIGHT = 600;

  // Road configuration
  const roadLeft = 160;
  const roadWidth = 480;
  const roadRight = roadLeft + roadWidth;
  const laneCount = 4;
  const laneWidth = roadWidth / laneCount;

  // Player state
  const player = {
    x: roadLeft + roadWidth / 2 - 22,
    y: V_HEIGHT - 130,
    width: 44,
    height: 76,
    speedX: 0,
    maxSpeedX: 7,
    accelX: 0.8,
    friction: 0.88,
    nitro: 80,
    maxNitro: 100,
    isBoosting: false,
    shield: false,
    invincibleTimer: 0,
    tilt: 0
  };

  // Game world state
  let score = 0;
  let distance = 0;
  let baseSpeed = 8;
  let currentSpeed = 8;
  let coinsCount = 0;
  let roadOffset = 0;
  let difficultyTimer = 0;

  // Entities
  let traffic = [];
  let pickups = [];
  let particles = [];
  let speedLines = [];

  // Input states
  const keys = {
    left: false,
    right: false,
    boost: false
  };

  function spawnTraffic() {
    if (traffic.length >= 7) return;
    const lane = Math.floor(Math.random() * laneCount);
    const laneX = roadLeft + lane * laneWidth + (laneWidth - 44) / 2;

    // Check if lane is clear at the top
    for (let t of traffic) {
      if (Math.abs(t.x - laneX) < 40 && t.y < 180) {
        return;
      }
    }

    const types = [
      { name: 'sedan', color: '#00f0ff', width: 44, height: 74, speedOffset: 0.8 },
      { name: 'truck', color: '#3b82f6', width: 52, height: 105, speedOffset: 0.5 },
      { name: 'sport', color: '#ff0055', width: 42, height: 72, speedOffset: 1.2 },
      { name: 'racer', color: '#eab308', width: 40, height: 70, speedOffset: 1.4 }
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    traffic.push({
      x: laneX - (type.width - 44) / 2,
      y: -120,
      width: type.width,
      height: type.height,
      color: type.color,
      speed: currentSpeed * 0.45 * type.speedOffset,
      lane: lane,
      isChangingLane: Math.random() < 0.25,
      targetLane: lane,
      blinkerTimer: 0
    });
  }

  function spawnPickup() {
    if (pickups.length >= 4) return;
    const lane = Math.floor(Math.random() * laneCount);
    const laneX = roadLeft + lane * laneWidth + laneWidth / 2;

    const isCoin = Math.random() < 0.75;
    pickups.push({
      x: laneX,
      y: -50,
      radius: isCoin ? 14 : 16,
      type: isCoin ? 'coin' : 'nitro',
      spin: Math.random() * Math.PI
    });
  }

  function createExplosion(x, y, count = 25, color = '#ff0055') {
    sound.playExplosion();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 6;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.5 ? color : '#facc15',
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  }

  function createSparks(x, y, color = '#38bdf8') {
    for (let i = 0; i < 4; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 3,
        size: 2,
        color,
        alpha: 1,
        decay: 0.05
      });
    }
  }

  function onKeyDown(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      keys.boost = true;
    }
  }

  function onKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      keys.boost = false;
    }
  }

  function update() {
    if (!isRunning || isPaused) return;

    difficultyTimer += 1 / 60;
    baseSpeed = 8 + Math.min(difficultyTimer * 0.15, 12);

    // Nitro handling
    if (keys.boost && player.nitro > 0) {
      player.isBoosting = true;
      player.nitro = Math.max(0, player.nitro - 0.4);
      currentSpeed = baseSpeed * 1.65;
      if (Math.random() < 0.4) {
        sound.playDash();
      }
    } else {
      player.isBoosting = false;
      currentSpeed = baseSpeed;
      player.nitro = Math.min(player.maxNitro, player.nitro + 0.04);
    }

    // Steering
    if (keys.left) {
      player.speedX -= player.accelX;
      player.tilt = Math.max(-0.15, player.tilt - 0.03);
    } else if (keys.right) {
      player.speedX += player.accelX;
      player.tilt = Math.min(0.15, player.tilt + 0.03);
    } else {
      player.speedX *= player.friction;
      player.tilt *= 0.85;
    }

    // Clamp speedX
    player.speedX = Math.max(-player.maxSpeedX, Math.min(player.maxSpeedX, player.speedX));
    player.x += player.speedX;

    // Road boundary constraint
    if (player.x < roadLeft + 6) {
      player.x = roadLeft + 6;
      player.speedX = 0;
      createSparks(player.x, player.y + player.height / 2);
    } else if (player.x + player.width > roadRight - 6) {
      player.x = roadRight - 6 - player.width;
      player.speedX = 0;
      createSparks(player.x + player.width, player.y + player.height / 2);
    }

    // Invincibility after hit
    if (player.invincibleTimer > 0) {
      player.invincibleTimer--;
    }

    // Road scroll
    roadOffset = (roadOffset + currentSpeed) % 80;
    distance += currentSpeed * 0.08;
    score += Math.round((currentSpeed / 8) * (player.isBoosting ? 2 : 1));

    // Spawn management
    if (Math.random() < 0.035) spawnTraffic();
    if (Math.random() < 0.02) spawnPickup();

    // Speed lines for boost effect
    if (player.isBoosting && Math.random() < 0.7) {
      speedLines.push({
        x: roadLeft + Math.random() * roadWidth,
        y: 0,
        length: 30 + Math.random() * 50,
        speed: currentSpeed * 1.8,
        alpha: 0.8
      });
    }

    // Update speed lines
    for (let i = speedLines.length - 1; i >= 0; i--) {
      const sl = speedLines[i];
      sl.y += sl.speed;
      sl.alpha -= 0.02;
      if (sl.y > V_HEIGHT || sl.alpha <= 0) {
        speedLines.splice(i, 1);
      }
    }

    // Update traffic
    for (let i = traffic.length - 1; i >= 0; i--) {
      const t = traffic[i];
      t.y += currentSpeed - t.speed;

      // AI lane change logic
      if (t.isChangingLane) {
        t.blinkerTimer++;
        const targetX = roadLeft + t.targetLane * laneWidth + (laneWidth - t.width) / 2;
        if (Math.abs(t.x - targetX) > 2) {
          t.x += (targetX - t.x) * 0.05;
        } else {
          t.isChangingLane = false;
        }
      }

      // Check collision with player
      if (player.invincibleTimer === 0 && checkAABB(player, t)) {
        if (player.shield) {
          player.shield = false;
          player.invincibleTimer = 90;
          createExplosion(t.x + t.width / 2, t.y + t.height / 2, 15, '#38bdf8');
          traffic.splice(i, 1);
          continue;
        } else {
          createExplosion(player.x + player.width / 2, player.y + player.height / 2, 40, '#ff0055');
          gameOver();
          return;
        }
      }

      // Remove off-screen traffic
      if (t.y > V_HEIGHT + 150 || t.y < -300) {
        traffic.splice(i, 1);
      }
    }

    // Update pickups
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.y += currentSpeed;
      p.spin += 0.08;

      // Pickup collision
      const pDist = Math.hypot(
        (player.x + player.width / 2) - p.x,
        (player.y + player.height / 2) - p.y
      );

      if (pDist < p.radius + 24) {
        if (p.type === 'coin') {
          score += 150;
          coinsCount++;
          sound.playCoin();
          createSparks(p.x, p.y, '#facc15');
        } else if (p.type === 'nitro') {
          player.nitro = Math.min(player.maxNitro, player.nitro + 35);
          sound.playPowerup();
          createSparks(p.x, p.y, '#00f0ff');
        }
        pickups.splice(i, 1);
        continue;
      }

      if (p.y > V_HEIGHT + 50) {
        pickups.splice(i, 1);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= pt.decay;
      if (pt.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    // Continuous score callback
    callbacks.onScoreUpdate(score);
  }

  function checkAABB(r1, r2) {
    const pad = 6;
    return (
      r1.x + pad < r2.x + r2.width - pad &&
      r1.x + r1.width - pad > r2.x + pad &&
      r1.y + pad < r2.y + r2.height - pad &&
      r1.y + r1.height - pad > r2.y + pad
    );
  }

  function gameOver() {
    isRunning = false;
    sound.playGameOver();
    callbacks.onGameOver({
      score: score,
      stats: {
        Distance: `${Math.floor(distance)} m`,
        Coins: coinsCount,
        'Top Speed': `${Math.round((baseSpeed + 10) * 12)} km/h`
      }
    });
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    // Dark cyberpunk background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    bgGrad.addColorStop(0, '#070a13');
    bgGrad.addColorStop(1, '#0e1626');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // City silhouettes on road sides
    drawCityBackground();

    // Road asphalt
    ctx.fillStyle = '#111420';
    ctx.fillRect(roadLeft, 0, roadWidth, V_HEIGHT);

    // Neon edge guard rails
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(roadLeft, 0);
    ctx.lineTo(roadLeft, V_HEIGHT);
    ctx.moveTo(roadRight, 0);
    ctx.lineTo(roadRight, V_HEIGHT);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Moving lane dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([30, 35]);
    ctx.lineDashOffset = -roadOffset;

    for (let i = 1; i < laneCount; i++) {
      const lx = roadLeft + i * laneWidth;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, V_HEIGHT);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw speed lines
    for (let sl of speedLines) {
      ctx.strokeStyle = `rgba(0, 240, 255, ${sl.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y);
      ctx.lineTo(sl.x, sl.y + sl.length);
      ctx.stroke();
    }

    // Draw Pickups
    for (let p of pickups) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.type === 'coin') {
        ctx.scale(Math.cos(p.spin), 1);
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
      } else {
        // Nitro canister
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(-p.radius + 4, -p.radius, p.radius * 2 - 8, p.radius * 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N₂O', 0, 0);
      }
      ctx.restore();
    }

    // Draw Traffic
    for (let t of traffic) {
      drawVehicle(t.x, t.y, t.width, t.height, t.color, false);
      if (t.isChangingLane && Math.floor(t.blinkerTimer / 10) % 2 === 0) {
        ctx.fillStyle = '#f59e0b';
        const blinkX = t.targetLane > t.lane ? t.x + t.width - 4 : t.x + 4;
        ctx.beginPath();
        ctx.arc(blinkX, t.y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Player Car
    if (player.invincibleTimer % 6 < 3) {
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.rotate(player.tilt);
      drawVehicle(-player.width / 2, -player.height / 2, player.width, player.height, '#ff007a', true);

      // Nitro booster exhaust flame
      if (player.isBoosting) {
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(-10, player.height / 2);
        ctx.lineTo(0, player.height / 2 + 25 + Math.random() * 15);
        ctx.lineTo(10, player.height / 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Particles
    for (let pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Draw HUD
    drawHUD();

    ctx.restore();
  }

  function drawVehicle(x, y, w, h, bodyColor, isPlayer) {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(x - 2, y + 4, w + 4, h, 8);
    ctx.fill();

    // Body
    ctx.fillStyle = bodyColor;
    if (isPlayer) {
      ctx.shadowColor = bodyColor;
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Windshield & roof
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 5, y + 16, w - 10, h * 0.42);

    // Front headlights
    ctx.fillStyle = isPlayer ? '#ffffff' : '#fef08a';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fillRect(x + 4, y + 2, 8, 4);
    ctx.fillRect(x + w - 12, y + 2, 8, 4);

    // Rear taillights
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.fillRect(x + 4, y + h - 6, 8, 4);
    ctx.fillRect(x + w - 12, y + h - 6, 8, 4);
    ctx.shadowBlur = 0;

    // Wheels
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x - 3, y + 10, 4, 14);
    ctx.fillRect(x + w - 1, y + 10, 4, 14);
    ctx.fillRect(x - 3, y + h - 24, 4, 14);
    ctx.fillRect(x + w - 1, y + h - 24, 4, 14);

    ctx.restore();
  }

  function drawCityBackground() {
    ctx.fillStyle = '#080d19';
    // Left side buildings
    ctx.fillRect(0, 0, roadLeft - 10, V_HEIGHT);
    // Right side buildings
    ctx.fillRect(roadRight + 10, 0, V_WIDTH - (roadRight + 10), V_HEIGHT);

    // Grid lines for futuristic vibe
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y < V_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(roadLeft - 10, y);
      ctx.moveTo(roadRight + 10, y);
      ctx.lineTo(V_WIDTH, y);
      ctx.stroke();
    }
  }

  function drawHUD() {
    // HUD Bar at top
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 10, V_WIDTH - 20, 48);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, V_WIDTH - 20, 48);

    // Score
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('SCORE', 26, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), 26, 48);

    // Distance
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('DISTANCE', 180, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${Math.floor(distance)} m`, 180, 48);

    // Speed
    const displaySpeed = Math.round((currentSpeed * 14));
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('SPEED', 330, 28);
    ctx.fillStyle = player.isBoosting ? '#ff007a' : '#10b981';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${displaySpeed} km/h`, 330, 48);

    // Nitro Meter Bar
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('NITRO (SPACE)', 480, 28);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(480, 34, 160, 14);
    const nitroGrad = ctx.createLinearGradient(480, 0, 640, 0);
    nitroGrad.addColorStop(0, '#00f0ff');
    nitroGrad.addColorStop(1, '#ff007a');
    ctx.fillStyle = nitroGrad;
    ctx.fillRect(480, 34, (player.nitro / player.maxNitro) * 160, 14);

    // Coins
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`$ ${coinsCount}`, V_WIDTH - 110, 40);
  }

  function loop() {
    update();
    draw();
    if (isRunning) {
      animationId = requestAnimationFrame(loop);
    }
  }

  // Setup keyboard
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    start() {
      isRunning = true;
      isPaused = false;
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
      distance = 0;
      coinsCount = 0;
      difficultyTimer = 0;
      traffic = [];
      pickups = [];
      particles = [];
      speedLines = [];
      player.x = roadLeft + roadWidth / 2 - 22;
      player.speedX = 0;
      player.nitro = 80;
      player.invincibleTimer = 0;
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
      if (code === 'Left') keys.left = isPressed;
      if (code === 'Right') keys.right = isPressed;
      if (code === 'Nitro' || code === 'Up') keys.boost = isPressed;
      if (code === 'Down') keys.brake = isPressed;
    },
    getInstructions() {
      return 'Dodge traffic, collect coins & nitro. Hold Space or Nitro for super-speed!';
    },
    getControlsConfig() {
      return {
        dpad: true,
        buttons: [
          { id: 'nitro', label: '⚡ NITRO', code: 'Nitro', primary: true }
        ]
      };
    }
  };
}
