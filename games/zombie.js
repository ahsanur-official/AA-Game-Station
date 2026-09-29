/**
 * Zombie Survival — Top-Down Survival Shooter Mini-Game
 * Neon Arcade Collection
 */

export function createZombieGame(canvas, sound, callbacks, levelConfig = null) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = false;
  let isPaused = false;

  const activeLevel = levelConfig || {
    level: 2,
    id: 'veteran',
    name: 'Veteran',
    shortName: 'VETERAN',
    speedMultiplier: 1.0,
    scoreMultiplier: 1.5,
    color: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.4)'
  };

  const V_WIDTH = 800;
  const V_HEIGHT = 600;

  // Player
  const player = {
    x: V_WIDTH / 2,
    y: V_HEIGHT / 2,
    radius: 18,
    speed: 4.2,
    health: 100,
    maxHealth: 100,
    angle: 0,
    ammo: 30,
    maxMag: 30,
    reserveAmmo: 120,
    isReloading: false,
    reloadTimer: 0,
    shootCooldown: 0,
    weapon: 'rifle', // rifle, shotgun
    shotgunTimer: 0,
    invincibleTimer: 0
  };

  // Game state
  let score = 0;
  let wave = 1;
  let waveEnemiesLeft = 12;
  let waveEnemiesSpawned = 0;
  let kills = 0;
  let combo = 0;
  let comboTimer = 0;
  let waveBanner = 'WAVE 1';
  let bannerTimer = 90;
  let screenShake = 0;

  // Entities
  let bullets = [];
  let zombies = [];
  let drops = [];
  let bloodDecals = [];
  let particles = [];

  // Mouse / aim coordinates
  let aimX = V_WIDTH / 2 + 100;
  let aimY = V_HEIGHT / 2;
  let isMouseDown = false;

  // Input keys
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false
  };

  function spawnZombie() {
    if (waveEnemiesSpawned >= waveEnemiesLeft) return;
    waveEnemiesSpawned++;

    // Spawn on screen edges
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? -30 : V_WIDTH + 30;
      y = Math.random() * V_HEIGHT;
    } else {
      x = Math.random() * V_WIDTH;
      y = Math.random() < 0.5 ? -30 : V_HEIGHT + 30;
    }

    const isEliteWave = wave % 5 === 0;
    const rand = Math.random();
    let type = 'normal';
    let hp = 30 + wave * 5;
    let speed = 2.0 + Math.min(wave * 0.1, 1.5);
    let radius = 16;
    let color = '#22c55e';

    if (isEliteWave && waveEnemiesSpawned === 1) {
      type = 'elite';
      hp = 250 + wave * 30;
      speed = 1.6;
      radius = 28;
      color = '#a855f7';
    } else if (rand < 0.3) {
      type = 'runner';
      hp = 20 + wave * 3;
      speed = 3.6;
      radius = 14;
      color = '#ef4444';
    } else if (rand < 0.55) {
      type = 'tank';
      hp = 80 + wave * 10;
      speed = 1.4;
      radius = 22;
      color = '#7c3aed';
    }

    zombies.push({
      x,
      y,
      radius,
      hp,
      maxHp: hp,
      speed,
      type,
      color,
      points: type === 'elite' ? 1000 : (type === 'tank' ? 250 : 100)
    });
  }

  function spawnDrop(x, y) {
    const types = ['ammo', 'medkit', 'shotgun'];
    const type = types[Math.floor(Math.random() * types.length)];
    drops.push({
      x,
      y,
      type,
      radius: 14,
      timer: 600 // despawn after 10s
    });
  }

  function addBlood(x, y, color = '#15803d') {
    bloodDecals.push({
      x,
      y,
      radius: 8 + Math.random() * 14,
      color: color,
      alpha: 0.6
    });
    if (bloodDecals.length > 50) bloodDecals.shift();
  }

  function shoot() {
    if (player.isReloading) return;
    if (player.ammo <= 0) {
      reload();
      return;
    }
    if (player.shootCooldown > 0) return;

    player.ammo--;
    sound.playLaser();
    screenShake = 3;

    const angle = player.angle;
    const barrelX = player.x + Math.cos(angle) * 26;
    const barrelY = player.y + Math.sin(angle) * 26;

    // Muzzle flash particle
    particles.push({
      x: barrelX,
      y: barrelY,
      vx: 0,
      vy: 0,
      size: 10,
      color: '#fef08a',
      alpha: 1,
      decay: 0.2
    });

    if (player.weapon === 'shotgun') {
      player.shootCooldown = 22;
      for (let i = -2; i <= 2; i++) {
        const spread = angle + (i * 0.12);
        bullets.push({
          x: barrelX,
          y: barrelY,
          vx: Math.cos(spread) * 14,
          vy: Math.sin(spread) * 14,
          damage: 24,
          range: 350
        });
      }
    } else {
      player.shootCooldown = 9;
      bullets.push({
        x: barrelX,
        y: barrelY,
        vx: Math.cos(angle) * 16,
        vy: Math.sin(angle) * 16,
        damage: 28,
        range: 650
      });
    }

    if (player.ammo === 0) reload();
  }

  function reload() {
    if (player.isReloading || player.ammo === player.maxMag || player.reserveAmmo <= 0) return;
    player.isReloading = true;
    player.reloadTimer = 80;
    sound.playPowerup();
  }

  function onKeyDown(e) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space') keys.fire = true;
    if (e.code === 'KeyR') reload();
  }

  function onKeyUp(e) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'Space') keys.fire = false;
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = V_WIDTH / rect.width;
    const scaleY = V_HEIGHT / rect.height;
    aimX = (e.clientX - rect.left) * scaleX;
    aimY = (e.clientY - rect.top) * scaleY;
  }

  function onMouseDown() {
    isMouseDown = true;
  }

  function onMouseUp() {
    isMouseDown = false;
  }

  function update() {
    if (!isRunning || isPaused) return;

    if (screenShake > 0) screenShake *= 0.85;
    if (bannerTimer > 0) bannerTimer--;

    // Weapon timer
    if (player.shotgunTimer > 0) {
      player.shotgunTimer--;
      if (player.shotgunTimer <= 0) player.weapon = 'rifle';
    }

    // Reload timer
    if (player.isReloading) {
      player.reloadTimer--;
      if (player.reloadTimer <= 0) {
        player.isReloading = false;
        const needed = player.maxMag - player.ammo;
        const take = Math.min(needed, player.reserveAmmo);
        player.ammo += take;
        player.reserveAmmo -= take;
      }
    }

    if (player.shootCooldown > 0) player.shootCooldown--;
    if (player.invincibleTimer > 0) player.invincibleTimer--;

    // Movement
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

    player.x += dx * player.speed;
    player.y += dy * player.speed;

    // Bounds
    player.x = Math.max(30, Math.min(V_WIDTH - 30, player.x));
    player.y = Math.max(30, Math.min(V_HEIGHT - 30, player.y));

    // Player aim angle
    player.angle = Math.atan2(aimY - player.y, aimX - player.x);

    // Shooting
    if (isMouseDown || keys.fire) {
      shoot();
    }

    // Combo timer
    if (comboTimer > 0) {
      comboTimer--;
      if (comboTimer <= 0) combo = 0;
    }

    // Spawn wave zombies
    if (waveEnemiesSpawned < waveEnemiesLeft && Math.random() < 0.05) {
      spawnZombie();
    }

    // Check wave complete
    if (waveEnemiesSpawned >= waveEnemiesLeft && zombies.length === 0) {
      wave++;
      waveEnemiesLeft = 12 + wave * 4;
      waveEnemiesSpawned = 0;
      waveBanner = `WAVE ${wave} INCOMING!`;
      bannerTimer = 90;
      sound.playPowerup();
      score += 500 * wave;
      player.reserveAmmo += 40;
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.range -= Math.hypot(b.vx, b.vy);

      // Bullet vs zombies
      let hit = false;
      for (let j = zombies.length - 1; j >= 0; j--) {
        const z = zombies[j];
        if (Math.hypot(b.x - z.x, b.y - z.y) < z.radius + 4) {
          z.hp -= b.damage;
          hit = true;
          sound.playHit();
          addBlood(z.x, z.y, z.color);

          if (z.hp <= 0) {
            kills++;
            combo++;
            comboTimer = 120;
            score += z.points * Math.min(combo, 5);
            addBlood(z.x, z.y, z.color);
            if (Math.random() < 0.28) spawnDrop(z.x, z.y);
            zombies.splice(j, 1);
          }
          break;
        }
      }

      if (hit || b.range <= 0 || b.x < 0 || b.x > V_WIDTH || b.y < 0 || b.y > V_HEIGHT) {
        bullets.splice(i, 1);
      }
    }

    // Update zombies
    for (let i = zombies.length - 1; i >= 0; i--) {
      const z = zombies[i];
      const angle = Math.atan2(player.y - z.y, player.x - z.x);
      z.x += Math.cos(angle) * z.speed;
      z.y += Math.sin(angle) * z.speed;

      // Zombie hit player
      const dist = Math.hypot(player.x - z.x, player.y - z.y);
      if (dist < player.radius + z.radius && player.invincibleTimer === 0) {
        player.health -= z.type === 'elite' ? 30 : (z.type === 'tank' ? 20 : 12);
        player.invincibleTimer = 40;
        screenShake = 8;
        sound.playHit();
        addBlood(player.x, player.y, '#dc2626');

        if (player.health <= 0) {
          gameOver();
          return;
        }
      }
    }

    // Update Drops
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.timer--;

      if (Math.hypot(player.x - d.x, player.y - d.y) < player.radius + d.radius) {
        sound.playPowerup();
        if (d.type === 'ammo') {
          player.reserveAmmo += 60;
          score += 50;
        } else if (d.type === 'medkit') {
          player.health = Math.min(player.maxHealth, player.health + 35);
          score += 50;
        } else if (d.type === 'shotgun') {
          player.weapon = 'shotgun';
          player.shotgunTimer = 400;
          score += 100;
        }
        drops.splice(i, 1);
        continue;
      }

      if (d.timer <= 0) drops.splice(i, 1);
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    callbacks.onScoreUpdate(score);
  }

  function gameOver() {
    isRunning = false;
    sound.playGameOver();
    callbacks.onGameOver({
      score: Math.round(score * (activeLevel.scoreMultiplier || 1)),
      stats: {
        'Mission Level': `Level ${activeLevel.level} (${activeLevel.shortName})`,
        'Waves Survived': wave - 1,
        'Zombies Eliminated': kills,
        'Max Combo': `${combo}x`
      }
    });
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Dark bunker arena floor
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Grid tiles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < V_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, V_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < V_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(V_WIDTH, y);
      ctx.stroke();
    }

    // Blood splatters
    for (let b of bloodDecals) {
      ctx.fillStyle = b.color;
      ctx.globalAlpha = b.alpha;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Flashlight cone from player
    ctx.save();
    const coneGrad = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, 350);
    coneGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    coneGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.06)');
    coneGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.arc(player.x, player.y, 350, player.angle - 0.55, player.angle + 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Drops
    for (let d of drops) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.fillStyle = d.type === 'medkit' ? '#22c55e' : (d.type === 'shotgun' ? '#eab308' : '#38bdf8');
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-12, -12, 24, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.type === 'medkit' ? '+' : (d.type === 'shotgun' ? 'SG' : 'AM'), 0, 0);
      ctx.restore();
    }

    // Bullets
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 6;
    for (let b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Zombies
    for (let z of zombies) {
      drawZombie(z);
    }

    // Player
    if (player.invincibleTimer % 4 < 2) {
      drawPlayer();
    }

    // Crosshair at aim location
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(aimX, aimY, 8, 0, Math.PI * 2);
    ctx.moveTo(aimX - 12, aimY);
    ctx.lineTo(aimX + 12, aimY);
    ctx.moveTo(aimX, aimY - 12);
    ctx.lineTo(aimX, aimY + 12);
    ctx.stroke();

    // HUD
    drawZombieHUD();

    // Wave Banner
    if (bannerTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 19, 0.8)';
      ctx.fillRect(0, V_HEIGHT / 2 - 35, V_WIDTH, 70);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.fillText(waveBanner, V_WIDTH / 2, V_HEIGHT / 2);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Body
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Head / Helmet
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Gun hands
    ctx.fillStyle = '#475569';
    ctx.fillRect(10, 3, 16, 6);

    ctx.restore();
  }

  function drawZombie(z) {
    ctx.save();
    ctx.translate(z.x, z.y);
    const angle = Math.atan2(player.y - z.y, player.x - z.x);
    ctx.rotate(angle);

    // Zombie body
    ctx.fillStyle = z.color;
    ctx.beginPath();
    ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
    ctx.fill();

    // Claw hands reach
    ctx.fillStyle = '#15803d';
    ctx.fillRect(z.radius - 4, -8, 12, 4);
    ctx.fillRect(z.radius - 4, 4, 12, 4);

    ctx.restore();
  }

  function drawZombieHUD() {
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 10, V_WIDTH - 20, 50);

    // Score
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SCORE', 25, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), 25, 46);

    // Health
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SURVIVOR HP', 160, 26);
    ctx.fillStyle = '#334155';
    ctx.fillRect(160, 32, 130, 14);
    ctx.fillStyle = player.health > 25 ? '#10b981' : '#ef4444';
    ctx.fillRect(160, 32, (player.health / player.maxHealth) * 130, 14);

    // Ammo / Reloading
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('AMMO (R TO RELOAD)', 320, 26);
    ctx.fillStyle = player.isReloading ? '#eab308' : '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(player.isReloading ? 'RELOADING...' : `${player.ammo} / ${player.reserveAmmo}`, 320, 46);

    // Wave & Kills
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`WAVE ${wave}`, 520, 42);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`KILLS: ${kills}`, V_WIDTH - 130, 42);
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
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  const onTouchStart = (e) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      onMouseMove(e.touches[0]);
      onMouseDown(e.touches[0]);
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      onMouseMove(e.touches[0]);
    }
  };
  const onTouchEnd = (e) => {
    e.preventDefault();
    onMouseUp();
  };

  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('touchcancel', onTouchEnd, { passive: false });

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
      wave = 1;
      waveEnemiesLeft = 12;
      waveEnemiesSpawned = 0;
      kills = 0;
      combo = 0;
      bullets = [];
      zombies = [];
      drops = [];
      bloodDecals = [];
      particles = [];
      player.x = V_WIDTH / 2;
      player.y = V_HEIGHT / 2;
      player.health = 100;
      player.ammo = 30;
      player.reserveAmmo = 120;
      player.isReloading = false;
      player.weapon = 'rifle';
      isRunning = true;
      isPaused = false;
      loop();
    },
    destroy() {
      isRunning = false;
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    },
    setVirtualKey(code, isPressed) {
      if (code === 'Left') keys.left = isPressed;
      if (code === 'Right') keys.right = isPressed;
      if (code === 'Up') keys.up = isPressed;
      if (code === 'Down') keys.down = isPressed;
      if (code === 'Fire') keys.fire = isPressed;
      if (code === 'Reload' && isPressed) reload();
    },
    getInstructions() {
      return 'WASD to move · Mouse/Touch to aim & shoot · R to reload weapon · Collect crates!';
    },
    getControlsConfig() {
      return {
        dpad: true,
        buttons: [
          { id: 'fire', label: '🔥 SHOOT', code: 'Fire', primary: true },
          { id: 'reload', label: '🔄 RELOAD', code: 'Reload' }
        ]
      };
    }
  };
}
