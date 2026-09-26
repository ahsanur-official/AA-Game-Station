/**
 * Bomb Escape — Arena Survival Mini-Game
 * Neon Arcade Collection
 */

export function createBombEscapeGame(canvas, sound, callbacks) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = false;
  let isPaused = false;

  const V_WIDTH = 800;
  const V_HEIGHT = 600;

  // Player
  const player = {
    x: V_WIDTH / 2,
    y: V_HEIGHT / 2,
    radius: 16,
    speed: 4.8,
    dashCooldown: 0,
    isDashing: false,
    dashTimer: 0,
    shield: false,
    invincibleTimer: 0
  };

  // Arena Pillars (Cover obstacles)
  const pillars = [
    { x: 220, y: 180, radius: 28 },
    { x: 580, y: 180, radius: 28 },
    { x: 220, y: 420, radius: 28 },
    { x: 580, y: 420, radius: 28 },
    { x: 400, y: 300, radius: 34 }
  ];

  // Game state
  let score = 0;
  let survivalSeconds = 0;
  let timerTicker = 0;
  let difficulty = 1;
  let isFrozen = false;
  let freezeTimer = 0;
  let screenShake = 0;

  // Entities
  let bombs = [];
  let explosions = [];
  let powerups = [];
  let particles = [];

  // Keys
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    dash: false
  };

  function spawnBomb() {
    if (bombs.length >= 7 + difficulty * 2) return;

    // Pick random location away from player initial spawn
    const x = 70 + Math.random() * (V_WIDTH - 140);
    const y = 80 + Math.random() * (V_HEIGHT - 150);

    const isCluster = difficulty >= 3 && Math.random() < 0.25;
    bombs.push({
      x,
      y,
      radius: isCluster ? 18 : 14,
      explosionRadius: isCluster ? 130 : 95,
      timer: 180 - Math.min(difficulty * 15, 70), // frames until detonation
      maxTimer: 180 - Math.min(difficulty * 15, 70),
      isCluster
    });
  }

  function spawnPowerup() {
    if (powerups.length >= 3) return;
    const types = ['shield', 'freeze', 'speed'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({
      x: 90 + Math.random() * (V_WIDTH - 180),
      y: 90 + Math.random() * (V_HEIGHT - 180),
      type,
      radius: 14,
      timer: 600
    });
  }

  function detonateBomb(bomb) {
    sound.playExplosion();
    screenShake = Math.max(screenShake, 10);

    explosions.push({
      x: bomb.x,
      y: bomb.y,
      radius: 10,
      maxRadius: bomb.explosionRadius,
      alpha: 1,
      damageActive: true
    });

    // Particle flash
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: bomb.x,
        y: bomb.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3.5,
        color: Math.random() < 0.5 ? '#ff0055' : '#facc15',
        alpha: 1,
        decay: 0.03
      });
    }

    // Cluster bomb secondary explosions
    if (bomb.isCluster) {
      for (let c = 0; c < 3; c++) {
        const cAngle = (c * Math.PI * 2) / 3;
        bombs.push({
          x: bomb.x + Math.cos(cAngle) * 50,
          y: bomb.y + Math.sin(cAngle) * 50,
          radius: 12,
          explosionRadius: 70,
          timer: 35,
          maxTimer: 35,
          isCluster: false
        });
      }
    }
  }

  function onKeyDown(e) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space' || e.code === 'ShiftLeft') triggerDash();
  }

  function onKeyUp(e) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
  }

  function triggerDash() {
    if (player.dashCooldown > 0) return;
    player.isDashing = true;
    player.dashTimer = 14;
    player.dashCooldown = 60;
    player.invincibleTimer = 18;
    sound.playDash();
  }

  function update() {
    if (!isRunning || isPaused) return;

    if (screenShake > 0) screenShake *= 0.86;

    // Survival timer
    timerTicker++;
    if (timerTicker >= 60) {
      timerTicker = 0;
      survivalSeconds++;
      score += 50 * difficulty;
      if (survivalSeconds % 10 === 0) {
        difficulty++;
        sound.playPowerup();
      }
    }

    // Dash cooldowns
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.dashTimer > 0) {
      player.dashTimer--;
      if (player.dashTimer <= 0) player.isDashing = false;
    }
    if (player.invincibleTimer > 0) player.invincibleTimer--;

    // Freeze timer
    if (isFrozen) {
      freezeTimer--;
      if (freezeTimer <= 0) isFrozen = false;
    }

    // Player movement
    let moveSpeed = player.speed * (player.isDashing ? 2.2 : 1);
    let dx = 0;
    let dy = 0;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;
    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    let nextX = player.x + dx * moveSpeed;
    let nextY = player.y + dy * moveSpeed;

    // Pillar collision
    for (let p of pillars) {
      const dist = Math.hypot(nextX - p.x, nextY - p.y);
      if (dist < player.radius + p.radius) {
        const overlap = (player.radius + p.radius) - dist;
        const angle = Math.atan2(nextY - p.y, nextX - p.x);
        nextX += Math.cos(angle) * overlap;
        nextY += Math.sin(angle) * overlap;
      }
    }

    player.x = Math.max(player.radius + 20, Math.min(V_WIDTH - player.radius - 20, nextX));
    player.y = Math.max(player.radius + 60, Math.min(V_HEIGHT - player.radius - 20, nextY));

    // Spawning bombs
    if (!isFrozen && Math.random() < 0.04 + difficulty * 0.01) {
      spawnBomb();
    }
    if (Math.random() < 0.012) {
      spawnPowerup();
    }

    // Update Bombs
    for (let i = bombs.length - 1; i >= 0; i--) {
      const b = bombs[i];
      if (!isFrozen) {
        b.timer--;
      }

      if (b.timer <= 0) {
        detonateBomb(b);
        bombs.splice(i, 1);
      }
    }

    // Update Explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
      const ex = explosions[i];
      ex.radius += (ex.maxRadius - ex.radius) * 0.15;
      ex.alpha -= 0.025;

      // Check hit with player
      if (ex.damageActive && player.invincibleTimer === 0) {
        const pDist = Math.hypot(player.x - ex.x, player.y - ex.y);
        if (pDist < ex.radius) {
          // Check line of sight cover by pillars
          let isCovered = false;
          for (let p of pillars) {
            const pDistToCenter = Math.hypot(p.x - ex.x, p.y - ex.y);
            if (pDistToCenter < ex.maxRadius) {
              const crossProduct = Math.abs((player.y - ex.y) * p.x - (player.x - ex.x) * p.y + player.x * ex.y - player.y * ex.x);
              if (crossProduct < p.radius * pDist && pDistToCenter < pDist) {
                isCovered = true;
                break;
              }
            }
          }

          if (!isCovered) {
            if (player.shield) {
              player.shield = false;
              player.invincibleTimer = 60;
              sound.playHit();
              screenShake = 12;
            } else {
              gameOver();
              return;
            }
          }
        }
      }

      // Chain reaction with other bombs
      if (ex.damageActive) {
        for (let j = bombs.length - 1; j >= 0; j--) {
          const b = bombs[j];
          if (b.timer > 10 && Math.hypot(b.x - ex.x, b.y - ex.y) < ex.radius) {
            b.timer = 6; // Quick detonate
          }
        }
      }

      if (ex.alpha <= 0) {
        explosions.splice(i, 1);
      }
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.timer--;

      if (Math.hypot(player.x - p.x, player.y - p.y) < player.radius + p.radius) {
        sound.playPowerup();
        if (p.type === 'shield') player.shield = true;
        if (p.type === 'freeze') {
          isFrozen = true;
          freezeTimer = 240; // 4 seconds freeze
        }
        if (p.type === 'speed') {
          player.speed = 6.2;
          setTimeout(() => { player.speed = 4.8; }, 6000);
        }
        score += 150;
        powerups.splice(i, 1);
        continue;
      }

      if (p.timer <= 0) powerups.splice(i, 1);
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= pt.decay;
      if (pt.alpha <= 0) particles.splice(i, 1);
    }

    callbacks.onScoreUpdate(score);
  }

  function gameOver() {
    isRunning = false;
    sound.playExplosion();
    sound.playGameOver();

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: player.x,
        y: player.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: 4,
        color: '#ff0055',
        alpha: 1,
        decay: 0.02
      });
    }

    callbacks.onGameOver({
      score: score,
      stats: {
        'Survived Time': `${survivalSeconds}s`,
        'Danger Level': `Threat Lv ${difficulty}`,
        'Final Score': score
      }
    });
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Arena Floor
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Hazard Grid
    ctx.strokeStyle = 'rgba(255, 0, 122, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 20; x < V_WIDTH - 20; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x, V_HEIGHT - 20);
      ctx.stroke();
    }
    for (let y = 60; y < V_HEIGHT - 20; y += 35) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(V_WIDTH - 20, y);
      ctx.stroke();
    }

    // Arena Border
    ctx.strokeStyle = '#ff007a';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 60, V_WIDTH - 40, V_HEIGHT - 80);

    // Draw Bomb Warning Rings
    for (let b of bombs) {
      ctx.save();
      const progress = 1 - (b.timer / b.maxTimer);

      // Warning circle on floor
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + progress * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.explosionRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Expanding pulse
      ctx.fillStyle = `rgba(239, 68, 68, ${progress * 0.2})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.explosionRadius * progress, 0, Math.PI * 2);
      ctx.fill();

      // Bomb icon
      ctx.fillStyle = b.isCluster ? '#a855f7' : '#ef4444';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.ceil(b.timer / 60).toString(), b.x, b.y);

      ctx.restore();
    }

    // Draw Explosions
    for (let ex of explosions) {
      ctx.save();
      ctx.globalAlpha = ex.alpha;
      const grad = ctx.createRadialGradient(ex.x, ex.y, 5, ex.x, ex.y, ex.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#facc15');
      grad.addColorStop(0.7, '#ff0055');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Pillars
    for (let p of pillars) {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Top shield plate
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius - 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Powerups
    for (let pw of powerups) {
      ctx.save();
      ctx.translate(pw.x, pw.y);
      ctx.fillStyle = pw.type === 'shield' ? '#38bdf8' : (pw.type === 'freeze' ? '#00f0ff' : '#facc15');
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pw.type === 'shield' ? 'SH' : (pw.type === 'freeze' ? 'FR' : 'SP'), 0, 0);
      ctx.restore();
    }

    // Draw Player
    if (player.invincibleTimer % 4 < 2) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Eye / Visor
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(4, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Shield Bubble
      if (player.shield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw Particles
    for (let pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // HUD
    drawBombHUD();

    ctx.restore();
  }

  function drawBombHUD() {
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 8, V_WIDTH - 20, 48);

    // Score
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SCORE', 25, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), 25, 44);

    // Survival Time
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('TIME SURVIVED', 160, 24);
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${survivalSeconds}s`, 160, 44);

    // Danger level
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('THREAT LEVEL', 310, 24);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`LVL ${difficulty}`, 310, 44);

    // Dash indicator
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('DASH (SPACE)', 460, 24);
    ctx.fillStyle = player.dashCooldown === 0 ? '#10b981' : '#64748b';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(player.dashCooldown === 0 ? 'READY' : 'CHARGING...', 460, 44);

    // Status
    if (isFrozen) {
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('❄️ BOMBS FROZEN!', V_WIDTH - 160, 36);
    }
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
      survivalSeconds = 0;
      timerTicker = 0;
      difficulty = 1;
      isFrozen = false;
      bombs = [];
      explosions = [];
      powerups = [];
      particles = [];
      player.x = V_WIDTH / 2;
      player.y = V_HEIGHT / 2;
      player.shield = false;
      player.dashCooldown = 0;
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
      if (code === 'Up') keys.up = isPressed;
      if (code === 'Down') keys.down = isPressed;
      if (code === 'Dash' && isPressed) triggerDash();
    },
    getInstructions() {
      return 'Arrows/WASD to move · Space to dash · Avoid bomb blast zones and hide behind pillars!';
    },
    getControlsConfig() {
      return {
        dpad: true,
        buttons: [
          { id: 'dash', label: '💨 DASH', code: 'Dash', primary: true }
        ]
      };
    }
  };
}
