/**
 * Space Defender — Vertical Space Shooter Mini-Game
 * Neon Arcade Collection
 */

export function createSpaceGame(canvas, sound, callbacks) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = false;
  let isPaused = false;

  const V_WIDTH = 800;
  const V_HEIGHT = 600;

  // Starfield parallax layers
  const stars = [];
  for (let i = 0; i < 90; i++) {
    stars.push({
      x: Math.random() * V_WIDTH,
      y: Math.random() * V_HEIGHT,
      size: Math.random() < 0.2 ? 2.5 : 1.2,
      speed: 0.5 + Math.random() * 2,
      color: Math.random() < 0.3 ? '#38bdf8' : (Math.random() < 0.5 ? '#f472b6' : '#ffffff')
    });
  }

  // Player ship
  const player = {
    x: V_WIDTH / 2,
    y: V_HEIGHT - 90,
    width: 38,
    height: 44,
    speed: 6.5,
    health: 100,
    maxHealth: 100,
    shield: 0,
    tripleShotTimer: 0,
    rapidFireTimer: 0,
    shootCooldown: 0,
    invincibleTimer: 0,
    bombs: 1
  };

  // Game progression
  let score = 0;
  let stage = 1;
  const maxStages = 3;
  let stageKills = 0;
  const killsToBoss = 18;
  let boss = null;
  let stageBanner = 'STAGE 1: SECTOR ALPHA';
  let bannerTimer = 90;
  let screenShake = 0;

  // Entities
  let playerLasers = [];
  let enemyLasers = [];
  let enemies = [];
  let asteroids = [];
  let powerups = [];
  let particles = [];

  // Keys
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false
  };

  function spawnEnemy() {
    if (boss || enemies.length >= 6 + stage * 2) return;

    const types = [
      { type: 'scout', hp: 20, speedY: 2.8, points: 100, color: '#38bdf8' },
      { type: 'cruiser', hp: 55, speedY: 1.4, points: 250, color: '#ff007a', canShoot: true },
      { type: 'interceptor', hp: 35, speedY: 3.2, points: 180, color: '#eab308' }
    ];

    const pick = types[Math.floor(Math.random() * (stage === 1 ? 2 : 3))];
    enemies.push({
      x: 60 + Math.random() * (V_WIDTH - 120),
      y: -50,
      width: pick.type === 'cruiser' ? 48 : 34,
      height: pick.type === 'cruiser' ? 44 : 32,
      hp: pick.hp,
      maxHp: pick.hp,
      speedY: pick.speedY + (stage - 1) * 0.4,
      speedX: (Math.random() - 0.5) * 2,
      points: pick.points,
      color: pick.color,
      type: pick.type,
      shootTimer: Math.floor(Math.random() * 60)
    });
  }

  function spawnAsteroid() {
    if (asteroids.length >= 4) return;
    const size = 18 + Math.random() * 22;
    asteroids.push({
      x: 40 + Math.random() * (V_WIDTH - 80),
      y: -60,
      radius: size,
      hp: Math.round(size * 1.5),
      maxHp: Math.round(size * 1.5),
      speedY: 1.5 + Math.random() * 2,
      speedX: (Math.random() - 0.5) * 1.5,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }

  function spawnBoss() {
    sound.playPowerup();
    stageBanner = `WARNING: STAGE ${stage} BOSS ARRIVAL!`;
    bannerTimer = 110;
    boss = {
      x: V_WIDTH / 2,
      y: -120,
      targetY: 140,
      width: 140,
      height: 90,
      hp: 400 + stage * 250,
      maxHp: 400 + stage * 250,
      speedX: 2.4,
      phase: 0,
      timer: 0
    };
  }

  function spawnPowerup(x, y) {
    const types = ['triple', 'rapid', 'shield', 'health', 'bomb'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({
      x,
      y,
      type,
      radius: 14,
      vy: 1.8
    });
  }

  function createExplosion(x, y, count = 20, color = '#ff007a') {
    sound.playExplosion();
    screenShake = Math.max(screenShake, 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color: Math.random() < 0.6 ? color : '#facc15',
        alpha: 1,
        decay: 0.025 + Math.random() * 0.02
      });
    }
  }

  function firePlayerLasers() {
    const cooldown = player.rapidFireTimer > 0 ? 7 : 14;
    if (player.shootCooldown > 0) return;
    player.shootCooldown = cooldown;
    sound.playLaser();

    if (player.tripleShotTimer > 0) {
      playerLasers.push({ x: player.x, y: player.y - 20, vx: 0, vy: -12 });
      playerLasers.push({ x: player.x - 14, y: player.y - 12, vx: -2.5, vy: -11 });
      playerLasers.push({ x: player.x + 14, y: player.y - 12, vx: 2.5, vy: -11 });
    } else {
      playerLasers.push({ x: player.x - 10, y: player.y - 16, vx: 0, vy: -12 });
      playerLasers.push({ x: player.x + 10, y: player.y - 16, vx: 0, vy: -12 });
    }
  }

  function useBomb() {
    if (player.bombs <= 0) return;
    player.bombs--;
    sound.playExplosion();
    screenShake = 14;

    // Flash particles & eliminate enemies
    for (let e of enemies) {
      createExplosion(e.x, e.y, 15, e.color);
      score += e.points;
    }
    enemies = [];

    for (let a of asteroids) {
      createExplosion(a.x, a.y, 12, '#94a3b8');
      score += 50;
    }
    asteroids = [];
    enemyLasers = [];

    if (boss) {
      boss.hp -= 150;
      createExplosion(boss.x, boss.y, 35, '#facc15');
      if (boss.hp <= 0) bossDefeated();
    }
  }

  function onKeyDown(e) {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = true;
    if (e.code === 'Space') keys.shoot = true;
    if (e.code === 'KeyB' || e.code === 'KeyX') useBomb();
  }

  function onKeyUp(e) {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = false;
    if (e.code === 'Space') keys.shoot = false;
  }

  function update() {
    if (!isRunning || isPaused) return;

    if (screenShake > 0) screenShake *= 0.88;
    if (bannerTimer > 0) bannerTimer--;

    // Starfield animation
    for (let s of stars) {
      s.y += s.speed;
      if (s.y > V_HEIGHT) {
        s.y = 0;
        s.x = Math.random() * V_WIDTH;
      }
    }

    // Power-up timers
    if (player.rapidFireTimer > 0) player.rapidFireTimer--;
    if (player.tripleShotTimer > 0) player.tripleShotTimer--;
    if (player.invincibleTimer > 0) player.invincibleTimer--;
    if (player.shootCooldown > 0) player.shootCooldown--;

    // Player movement
    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;
    if (keys.up) player.y -= player.speed;
    if (keys.down) player.y += player.speed;

    // Clamp player boundaries
    player.x = Math.max(30, Math.min(V_WIDTH - 30, player.x));
    player.y = Math.max(80, Math.min(V_HEIGHT - 40, player.y));

    // Player shooting
    if (keys.shoot) firePlayerLasers();

    // Spawning logic
    if (!boss) {
      if (Math.random() < 0.04) spawnEnemy();
      if (Math.random() < 0.02) spawnAsteroid();

      if (stageKills >= killsToBoss && !boss) {
        spawnBoss();
      }
    }

    // Update Boss
    if (boss) {
      updateBoss();
    }

    // Update Player Lasers
    for (let i = playerLasers.length - 1; i >= 0; i--) {
      const l = playerLasers[i];
      l.x += l.vx;
      l.y += l.vy;

      // Laser vs Boss
      if (boss && Math.hypot(l.x - boss.x, l.y - boss.y) < boss.width * 0.45) {
        boss.hp -= 12;
        sound.playHit();
        createSpark(l.x, l.y, '#00f0ff');
        playerLasers.splice(i, 1);
        if (boss.hp <= 0) bossDefeated();
        continue;
      }

      // Laser vs Enemies
      let hitEnemy = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.abs(l.x - e.x) < e.width / 2 && Math.abs(l.y - e.y) < e.height / 2) {
          e.hp -= 20;
          sound.playHit();
          createSpark(l.x, l.y, '#00f0ff');
          hitEnemy = true;
          if (e.hp <= 0) {
            createExplosion(e.x, e.y, 18, e.color);
            score += e.points;
            stageKills++;
            if (Math.random() < 0.22) spawnPowerup(e.x, e.y);
            enemies.splice(j, 1);
          }
          break;
        }
      }
      if (hitEnemy) {
        playerLasers.splice(i, 1);
        continue;
      }

      // Laser vs Asteroids
      let hitAst = false;
      for (let j = asteroids.length - 1; j >= 0; j--) {
        const a = asteroids[j];
        if (Math.hypot(l.x - a.x, l.y - a.y) < a.radius) {
          a.hp -= 15;
          sound.playHit();
          createSpark(l.x, l.y, '#f59e0b');
          hitAst = true;
          if (a.hp <= 0) {
            createExplosion(a.x, a.y, 14, '#94a3b8');
            score += 75;
            asteroids.splice(j, 1);
          }
          break;
        }
      }
      if (hitAst) {
        playerLasers.splice(i, 1);
        continue;
      }

      if (l.y < -20) playerLasers.splice(i, 1);
    }

    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.speedY;
      e.x += e.speedX;
      if (e.x < 40 || e.x > V_WIDTH - 40) e.speedX *= -1;

      // Enemy shooting
      if (e.type === 'cruiser') {
        e.shootTimer++;
        if (e.shootTimer > 75) {
          e.shootTimer = 0;
          enemyLasers.push({ x: e.x, y: e.y + 20, vy: 5, color: '#ff007a' });
        }
      }

      // Check collision with player
      if (player.invincibleTimer === 0 && Math.hypot(e.x - player.x, e.y - player.y) < 32) {
        damagePlayer(25);
        createExplosion(e.x, e.y, 16, e.color);
        enemies.splice(i, 1);
        continue;
      }

      if (e.y > V_HEIGHT + 60) enemies.splice(i, 1);
    }

    // Update Asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const a = asteroids[i];
      a.y += a.speedY;
      a.x += a.speedX;
      a.rotation += a.rotSpeed;

      if (player.invincibleTimer === 0 && Math.hypot(a.x - player.x, a.y - player.y) < a.radius + 18) {
        damagePlayer(30);
        createExplosion(a.x, a.y, 16, '#94a3b8');
        asteroids.splice(i, 1);
        continue;
      }

      if (a.y > V_HEIGHT + 70) asteroids.splice(i, 1);
    }

    // Update Enemy Lasers
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
      const el = enemyLasers[i];
      el.y += el.vy;

      if (player.invincibleTimer === 0 && Math.hypot(el.x - player.x, el.y - player.y) < 22) {
        damagePlayer(15);
        createSpark(el.x, el.y, el.color);
        enemyLasers.splice(i, 1);
        continue;
      }

      if (el.y > V_HEIGHT + 20) enemyLasers.splice(i, 1);
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.vy;

      if (Math.hypot(p.x - player.x, p.y - player.y) < p.radius + 22) {
        sound.playPowerup();
        if (p.type === 'triple') player.tripleShotTimer = 450;
        if (p.type === 'rapid') player.rapidFireTimer = 450;
        if (p.type === 'shield') player.shield = Math.min(3, player.shield + 1);
        if (p.type === 'health') player.health = Math.min(player.maxHealth, player.health + 35);
        if (p.type === 'bomb') player.bombs = Math.min(3, player.bombs + 1);
        score += 200;
        powerups.splice(i, 1);
        continue;
      }

      if (p.y > V_HEIGHT + 30) powerups.splice(i, 1);
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

  function updateBoss() {
    // Boss entrance
    if (boss.y < boss.targetY) {
      boss.y += 1.5;
      return;
    }

    boss.x += boss.speedX;
    if (boss.x < 150 || boss.x > V_WIDTH - 150) {
      boss.speedX *= -1;
    }

    boss.timer++;
    // Boss attack patterns
    if (boss.timer % 40 === 0) {
      enemyLasers.push({ x: boss.x - 40, y: boss.y + 40, vy: 5.5, color: '#ff0055' });
      enemyLasers.push({ x: boss.x + 40, y: boss.y + 40, vy: 5.5, color: '#ff0055' });
    }
    if (boss.timer % 110 === 0) {
      // Aimed blast towards player
      const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
      enemyLasers.push({
        x: boss.x,
        y: boss.y + 40,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6,
        color: '#eab308'
      });
    }
  }

  function bossDefeated() {
    createExplosion(boss.x, boss.y, 60, '#facc15');
    sound.playVictory();
    score += 5000 * stage;
    boss = null;
    stageKills = 0;

    if (stage < maxStages) {
      stage++;
      stageBanner = `STAGE ${stage}: ASTEROID BELT CLEARED`;
      bannerTimer = 110;
    } else {
      // Victory game over
      isRunning = false;
      callbacks.onGameOver({
        score: score,
        stats: {
          Status: 'GALAXY SAVED',
          'Final Stage': 'Sector 3 Cleared',
          'Hull Integrity': `${player.health}%`
        }
      });
    }
  }

  function damagePlayer(amount) {
    if (player.shield > 0) {
      player.shield--;
      sound.playHit();
      createSpark(player.x, player.y, '#38bdf8');
      player.invincibleTimer = 30;
      return;
    }

    player.health = Math.max(0, player.health - amount);
    sound.playHit();
    screenShake = 10;
    player.invincibleTimer = 45;
    createExplosion(player.x, player.y, 10, '#ff0055');

    if (player.health <= 0) {
      createExplosion(player.x, player.y, 40, '#ff0055');
      isRunning = false;
      sound.playGameOver();
      callbacks.onGameOver({
        score: score,
        stats: {
          'Stage Reached': `Stage ${stage}`,
          'Aliens Defeated': stageKills + (stage - 1) * killsToBoss
        }
      });
    }
  }

  function createSpark(x, y, color) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 2,
        color,
        alpha: 1,
        decay: 0.06
      });
    }
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Space Deep Canvas
    ctx.fillStyle = '#050711';
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Stars
    for (let s of stars) {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // Asteroids
    for (let a of asteroids) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const r = a.radius * (0.8 + Math.sin(angle * 3) * 0.2);
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Powerups
    for (let p of powerups) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#050711';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = p.type === 'triple' ? '3X' : (p.type === 'rapid' ? 'RF' : (p.type === 'shield' ? 'SH' : (p.type === 'bomb' ? 'B' : '+')));
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    // Player Lasers
    for (let l of playerLasers) {
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(l.x - 3, l.y - 12, 6, 24);
    }
    ctx.shadowBlur = 0;

    // Enemy Lasers
    for (let el of enemyLasers) {
      ctx.fillStyle = el.color;
      ctx.shadowColor = el.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(el.x, el.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Enemies
    for (let e of enemies) {
      drawEnemyShip(e);
    }

    // Boss
    if (boss) {
      drawBossShip(boss);
    }

    // Player Ship
    if (player.invincibleTimer % 4 < 2) {
      drawPlayerShip();
    }

    // Particles
    for (let pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Space HUD
    drawSpaceHUD();

    // Banner message
    if (bannerTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 19, 0.75)';
      ctx.fillRect(0, V_HEIGHT / 2 - 40, V_WIDTH, 80);
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillText(stageBanner, V_WIDTH / 2, V_HEIGHT / 2);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPlayerShip() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Thruster flame
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(-6, 20);
    ctx.lineTo(0, 36 + Math.random() * 10);
    ctx.lineTo(6, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Wings
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(-24, 18);
    ctx.lineTo(-8, 12);
    ctx.lineTo(0, 16);
    ctx.lineTo(8, 12);
    ctx.lineTo(24, 18);
    ctx.closePath();
    ctx.fill();

    // Fuselage
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(-10, 14);
    ctx.lineTo(10, 14);
    ctx.closePath();
    ctx.fill();

    // Cockpit glow
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, -4, 4, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Shield bubble
    if (player.shield > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawEnemyShip(e) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.fillStyle = e.color;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(-e.width / 2, -e.height / 2);
    ctx.lineTo(0, -e.height / 4);
    ctx.lineTo(e.width / 2, -e.height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawBossShip(b) {
    ctx.save();
    ctx.translate(b.x, b.y);

    // Boss Body
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(-70, -30);
    ctx.lineTo(-30, -50);
    ctx.lineTo(30, -50);
    ctx.lineTo(70, -30);
    ctx.closePath();
    ctx.fill();

    // Glowing core
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Boss HP bar above
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-60, -70, 120, 8);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-60, -70, (b.hp / b.maxHp) * 120, 8);

    ctx.restore();
  }

  function drawSpaceHUD() {
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 10, V_WIDTH - 20, 48);

    // Score
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SCORE', 25, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), 25, 46);

    // Stage
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('STAGE', 160, 26);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${stage} / ${maxStages}`, 160, 46);

    // Shield & Health
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('HULL INTEGRITY', 280, 26);
    ctx.fillStyle = '#334155';
    ctx.fillRect(280, 32, 140, 14);
    ctx.fillStyle = player.health > 30 ? '#10b981' : '#ef4444';
    ctx.fillRect(280, 32, (player.health / player.maxHealth) * 140, 14);

    // Bombs
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`EMP BOMBS (B): ${player.bombs}`, 460, 40);

    // Shields remaining
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`SHIELDS: ${player.shield}`, V_WIDTH - 140, 40);
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
      stage = 1;
      stageKills = 0;
      boss = null;
      stageBanner = 'STAGE 1: SECTOR ALPHA';
      bannerTimer = 90;
      playerLasers = [];
      enemyLasers = [];
      enemies = [];
      asteroids = [];
      powerups = [];
      particles = [];
      player.x = V_WIDTH / 2;
      player.y = V_HEIGHT - 90;
      player.health = 100;
      player.shield = 0;
      player.bombs = 1;
      player.tripleShotTimer = 0;
      player.rapidFireTimer = 0;
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
      if (code === 'Shoot') keys.shoot = isPressed;
      if (code === 'Bomb' && isPressed) useBomb();
    },
    getInstructions() {
      return 'Arrows/WASD to fly · Space to shoot · B to trigger screen-clearing EMP bomb!';
    },
    getControlsConfig() {
      return {
        dpad: true,
        buttons: [
          { id: 'shoot', label: '🔥 SHOOT', code: 'Shoot', primary: true },
          { id: 'bomb', label: '💣 EMP BOMB', code: 'Bomb' }
        ]
      };
    }
  };
}
