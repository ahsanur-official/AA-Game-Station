/**
 * Sky Dash — Endless Flying Runner Mini-Game
 * Neon Arcade Collection
 */

export function createSkyDashGame(canvas, sound, callbacks) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = false;
  let isPaused = false;

  const V_WIDTH = 800;
  const V_HEIGHT = 600;

  // Player Glider
  const player = {
    x: 140,
    y: 280,
    radius: 18,
    vy: 0,
    gravity: 0.45,
    jumpImpulse: -8.2,
    rotation: 0,
    shield: false,
    trail: []
  };

  // Parallax clouds & buildings
  let buildings = [];
  for (let i = 0; i < 12; i++) {
    buildings.push({
      x: i * 80,
      width: 60 + Math.random() * 30,
      height: 120 + Math.random() * 180,
      color: Math.random() < 0.5 ? '#0f172a' : '#1e1b4b'
    });
  }

  // World state
  let score = 0;
  let distance = 0;
  let speed = 4.2;
  let ringsCleared = 0;
  let coinsCount = 0;
  let screenShake = 0;

  // Entities
  let obstacles = [];
  let coins = [];
  let particles = [];

  function spawnObstacle() {
    const gap = Math.max(130, 190 - Math.min(distance * 0.05, 50));
    const topHeight = 80 + Math.random() * (V_HEIGHT - gap - 160);
    const bottomY = topHeight + gap;

    obstacles.push({
      x: V_WIDTH + 40,
      width: 54,
      topHeight,
      bottomY,
      cleared: false,
      droneY: topHeight + gap / 2,
      droneVy: (Math.random() - 0.5) * 2
    });

    // Spawn coin in gap
    coins.push({
      x: V_WIDTH + 67,
      y: topHeight + gap / 2,
      radius: 12,
      spin: 0
    });
  }

  function flap() {
    if (!isRunning || isPaused) return;
    player.vy = player.jumpImpulse;
    sound.playJump();

    // Jet burst particles
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: player.x - 14,
        y: player.y + 4,
        vx: -3 - Math.random() * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 3,
        color: '#00f0ff',
        alpha: 1,
        decay: 0.05
      });
    }
  }

  function onKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      flap();
    }
  }

  function onMouseDown() {
    flap();
  }

  function update() {
    if (!isRunning || isPaused) return;

    if (screenShake > 0) screenShake *= 0.85;

    // Physics
    player.vy += player.gravity;
    player.y += player.vy;
    player.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, player.vy * 0.06));

    // Jet trail
    player.trail.push({ x: player.x - 12, y: player.y, alpha: 0.8 });
    if (player.trail.length > 14) player.trail.shift();

    // Floor and Ceiling collision
    if (player.y >= V_HEIGHT - 30 || player.y <= 20) {
      if (player.shield) {
        player.shield = false;
        player.vy = -6;
        sound.playHit();
      } else {
        crash();
        return;
      }
    }

    // Progression
    distance += speed * 0.08;
    score += Math.round(speed * 0.5);
    speed = 4.2 + Math.min(distance * 0.015, 4.0);

    // Parallax buildings
    for (let b of buildings) {
      b.x -= speed * 0.4;
      if (b.x + b.width < 0) {
        b.x = V_WIDTH + Math.random() * 40;
      }
    }

    // Spawn obstacles
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < V_WIDTH - 240) {
      spawnObstacle();
    }

    // Update Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.x -= speed;

      // Check clearance
      if (!ob.cleared && ob.x + ob.width < player.x) {
        ob.cleared = true;
        ringsCleared++;
        score += 200;
        sound.playCoin();
      }

      // Check collision
      const pLeft = player.x - player.radius + 4;
      const pRight = player.x + player.radius - 4;
      const pTop = player.y - player.radius + 4;
      const pBottom = player.y + player.radius - 4;

      if (pRight > ob.x && pLeft < ob.x + ob.width) {
        // Hit top pipe or bottom pipe
        if (pTop < ob.topHeight || pBottom > ob.bottomY) {
          if (player.shield) {
            player.shield = false;
            sound.playHit();
            screenShake = 10;
            obstacles.splice(i, 1);
            continue;
          } else {
            crash();
            return;
          }
        }
      }

      if (ob.x < -100) obstacles.splice(i, 1);
    }

    // Update Coins
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.x -= speed;
      c.spin += 0.08;

      if (Math.hypot(player.x - c.x, player.y - c.y) < player.radius + c.radius) {
        coinsCount++;
        score += 150;
        sound.playCoin();
        for (let j = 0; j < 8; j++) {
          particles.push({
            x: c.x,
            y: c.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: 2,
            color: '#facc15',
            alpha: 1,
            decay: 0.05
          });
        }
        coins.splice(i, 1);
        continue;
      }

      if (c.x < -30) coins.splice(i, 1);
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    callbacks.onScoreUpdate(score);
  }

  function crash() {
    isRunning = false;
    sound.playExplosion();
    screenShake = 15;

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: player.x,
        y: player.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: 3.5,
        color: Math.random() < 0.5 ? '#00f0ff' : '#ff007a',
        alpha: 1,
        decay: 0.03
      });
    }

    callbacks.onGameOver({
      score: score,
      stats: {
        Distance: `${Math.floor(distance)} m`,
        'Gates Cleared': ringsCleared,
        Coins: coinsCount
      }
    });
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Cyber sunset / dusk gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.6, '#1e1b4b');
    skyGrad.addColorStop(1, '#3b0764');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Parallax Buildings in background
    for (let b of buildings) {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, V_HEIGHT - b.height, b.width, b.height);
      // Windows
      ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
      for (let wy = V_HEIGHT - b.height + 15; wy < V_HEIGHT - 20; wy += 25) {
        ctx.fillRect(b.x + 8, wy, 8, 12);
        ctx.fillRect(b.x + b.width - 16, wy, 8, 12);
      }
    }

    // Draw Obstacles (Neon Laser Gates)
    for (let ob of obstacles) {
      drawGate(ob);
    }

    // Draw Coins
    for (let c of coins) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(Math.cos(c.spin), 1);
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Player Jet Trail
    for (let t of player.trail) {
      ctx.fillStyle = `rgba(0, 240, 255, ${t.alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      ctx.fill();
      t.alpha -= 0.05;
    }

    // Draw Player Glider
    drawGlider();

    // Draw Particles
    for (let p of particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // HUD
    drawSkyHUD();

    ctx.restore();
  }

  function drawGlider() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);

    // Glider Wings
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-14, -12);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-14, 12);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(2, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawGate(ob) {
    ctx.save();
    // Top Column
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ob.x, 0, ob.width, ob.topHeight);
    ctx.strokeStyle = '#ff007a';
    ctx.lineWidth = 3;
    ctx.strokeRect(ob.x, 0, ob.width, ob.topHeight);

    // Bottom Column
    ctx.fillRect(ob.x, ob.bottomY, ob.width, V_HEIGHT - ob.bottomY);
    ctx.strokeRect(ob.x, ob.bottomY, ob.width, V_HEIGHT - ob.bottomY);

    // Glowing Neon Laser Emitters
    ctx.fillStyle = '#ff007a';
    ctx.shadowColor = '#ff007a';
    ctx.shadowBlur = 12;
    ctx.fillRect(ob.x + 4, ob.topHeight - 12, ob.width - 8, 12);
    ctx.fillRect(ob.x + 4, ob.bottomY, ob.width - 8, 12);

    ctx.restore();
  }

  function drawSkyHUD() {
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
    ctx.fillText('DISTANCE', 160, 26);
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${Math.floor(distance)} m`, 160, 46);

    // Gates Cleared
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('GATES CLEARED', 310, 26);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${ringsCleared}`, 310, 46);

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

  const onTouchStart = (e) => {
    e.preventDefault();
    flap();
  };

  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });

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
      speed = 4.2;
      ringsCleared = 0;
      coinsCount = 0;
      obstacles = [];
      coins = [];
      particles = [];
      player.y = 280;
      player.vy = 0;
      player.trail = [];
      isRunning = true;
      isPaused = false;
      loop();
    },
    destroy() {
      isRunning = false;
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
    },
    setVirtualKey(code, isPressed) {
      if ((code === 'Flap' || code === 'Up' || code === 'Jump' || code === 'Boost') && isPressed) flap();
    },
    getInstructions() {
      return 'Press Space / Click / Tap to boost glider upward · Dodge neon laser gates and collect coins!';
    },
    getControlsConfig() {
      return {
        dpad: false,
        buttons: [
          { id: 'flap', label: '🚀 BOOST / FLAP', code: 'Flap', primary: true }
        ]
      };
    }
  };
}
