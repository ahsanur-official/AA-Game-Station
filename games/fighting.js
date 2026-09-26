/**
 * Street Fighter Arena — 1v1 Fighting Mini-Game
 * Neon Arcade Collection
 */

export function createFightingGame(canvas, sound, callbacks) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = false;
  let isPaused = false;

  const V_WIDTH = 800;
  const V_HEIGHT = 600;
  const FLOOR_Y = 490;

  // Rounds state
  let currentRound = 1;
  const maxRounds = 3;
  let playerWins = 0;
  let aiWins = 0;
  let roundTimer = 60;
  let timerTicker = 0;
  let roundBanner = 'ROUND 1';
  let bannerTimer = 90;
  let isRoundOver = false;
  let roundOverTimer = 0;

  // Screen shake
  let screenShake = 0;

  // Score
  let score = 0;
  let combo = 0;
  let comboResetTimer = 0;

  // Fighters
  const player = createFighter(200, true, '#00f0ff', '#38bdf8');
  const ai = createFighter(600, false, '#ff007a', '#f43f5e');

  // Projectiles
  let projectiles = [];
  // Particles
  let particles = [];
  // Floating texts
  let floatingTexts = [];

  // Keys
  const keys = {
    left: false,
    right: false,
    jump: false,
    block: false,
    punch: false,
    kick: false,
    special: false
  };

  function createFighter(x, isPlayer, mainColor, accentColor) {
    return {
      x,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      width: 48,
      height: 110,
      isPlayer,
      facing: isPlayer ? 1 : -1,
      health: 100,
      maxHealth: 100,
      energy: 30,
      maxEnergy: 100,
      isGrounded: true,
      state: 'idle', // idle, walk, jump, punch, kick, block, special, hurt, ko
      stateTimer: 0,
      mainColor,
      accentColor,
      hitboxActive: false,
      aiTimer: 0,
      aiAction: 'idle'
    };
  }

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

  function addSparks(x, y, color = '#facc15', count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.04
      });
    }
  }

  function onKeyDown(e) {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.jump = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.block = true;
    if (e.code === 'KeyJ') triggerAction(player, 'punch');
    if (e.code === 'KeyK') triggerAction(player, 'kick');
    if (e.code === 'KeyL') triggerAction(player, 'special');
  }

  function onKeyUp(e) {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.jump = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.block = false;
  }

  function triggerAction(fighter, action) {
    if (fighter.state === 'hurt' || fighter.state === 'ko' || isRoundOver) return;

    if (action === 'punch' && (fighter.state === 'idle' || fighter.state === 'walk')) {
      fighter.state = 'punch';
      fighter.stateTimer = 16;
      fighter.hitboxActive = true;
      sound.playJump();
    } else if (action === 'kick' && (fighter.state === 'idle' || fighter.state === 'walk')) {
      fighter.state = 'kick';
      fighter.stateTimer = 22;
      fighter.hitboxActive = true;
      sound.playJump();
    } else if (action === 'special' && fighter.energy >= 35 && (fighter.state === 'idle' || fighter.state === 'walk')) {
      fighter.energy -= 35;
      fighter.state = 'special';
      fighter.stateTimer = 26;
      sound.playLaser();
      // Spawn Hadouken energy wave
      projectiles.push({
        x: fighter.x + (fighter.facing > 0 ? 50 : -20),
        y: fighter.y - 65,
        vx: fighter.facing * 9,
        radius: 18,
        color: fighter.mainColor,
        isPlayer: fighter.isPlayer,
        damage: 22
      });
    }
  }

  function update() {
    if (!isRunning || isPaused) return;

    // Shake dampening
    if (screenShake > 0) screenShake *= 0.85;

    // Round intro banner
    if (bannerTimer > 0) {
      bannerTimer--;
      return;
    }

    // Timer countdown
    if (!isRoundOver) {
      timerTicker++;
      if (timerTicker >= 60) {
        timerTicker = 0;
        roundTimer--;
        if (roundTimer <= 0) {
          endRound(player.health > ai.health ? 'player' : 'ai', 'TIME OVER');
        }
      }
    }

    // Combo reset check
    if (comboResetTimer > 0) {
      comboResetTimer--;
      if (comboResetTimer <= 0) combo = 0;
    }

    // Facing direction
    if (player.state !== 'ko' && ai.state !== 'ko') {
      player.facing = player.x < ai.x ? 1 : -1;
      ai.facing = ai.x > player.x ? -1 : 1;
    }

    // Player inputs
    updatePlayerFighter();

    // AI logic
    updateAIFighter();

    // Update Projectiles
    updateProjectiles();

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // Update Floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    // Post-round transition
    if (isRoundOver) {
      roundOverTimer++;
      if (roundOverTimer > 120) {
        if (playerWins >= 2 || aiWins >= 2 || currentRound >= maxRounds) {
          matchOver();
        } else {
          nextRound();
        }
      }
    }
  }

  function updatePlayerFighter() {
    // Jump
    if (keys.jump && player.isGrounded && player.state !== 'block' && player.state !== 'hurt' && player.state !== 'ko') {
      player.vy = -14;
      player.isGrounded = false;
      player.state = 'jump';
    }

    // Block
    if (keys.block && player.isGrounded && player.state !== 'punch' && player.state !== 'kick' && player.state !== 'special') {
      player.state = 'block';
    } else if (player.state === 'block' && !keys.block) {
      player.state = 'idle';
    }

    // Movement
    if (player.state === 'idle' || player.state === 'walk' || player.state === 'jump') {
      if (keys.left) {
        player.vx = -4.5;
        if (player.isGrounded && player.state !== 'jump') player.state = 'walk';
      } else if (keys.right) {
        player.vx = 4.5;
        if (player.isGrounded && player.state !== 'jump') player.state = 'walk';
      } else {
        player.vx = 0;
        if (player.isGrounded && player.state === 'walk') player.state = 'idle';
      }
    }

    applyPhysicsAndCombat(player, ai);
  }

  function updateAIFighter() {
    if (ai.state === 'ko') {
      applyPhysicsAndCombat(ai, player);
      return;
    }

    ai.aiTimer++;
    const dist = Math.abs(ai.x - player.x);

    // AI decision making loop every 20-30 frames
    if (ai.aiTimer > 24) {
      ai.aiTimer = 0;
      const rand = Math.random();

      // If player is attacking nearby, chance to block
      if (dist < 110 && (player.state === 'punch' || player.state === 'kick') && rand < 0.6) {
        ai.aiAction = 'block';
      } else if (dist > 120) {
        // Close the gap or throw special
        if (rand < 0.25 && ai.energy >= 35) {
          ai.aiAction = 'special';
        } else {
          ai.aiAction = 'approach';
        }
      } else {
        // In melee range
        if (rand < 0.4) {
          ai.aiAction = 'punch';
        } else if (rand < 0.75) {
          ai.aiAction = 'kick';
        } else if (rand < 0.9) {
          ai.aiAction = 'retreat';
        } else {
          ai.aiAction = 'block';
        }
      }
    }

    // Execute AI action
    if (ai.aiAction === 'approach') {
      ai.vx = ai.facing * 3.5;
      if (ai.isGrounded) ai.state = 'walk';
    } else if (ai.aiAction === 'retreat') {
      ai.vx = -ai.facing * 3;
      if (ai.isGrounded) ai.state = 'walk';
    } else if (ai.aiAction === 'punch') {
      ai.vx = 0;
      triggerAction(ai, 'punch');
    } else if (ai.aiAction === 'kick') {
      ai.vx = 0;
      triggerAction(ai, 'kick');
    } else if (ai.aiAction === 'special') {
      ai.vx = 0;
      triggerAction(ai, 'special');
    } else if (ai.aiAction === 'block') {
      ai.vx = 0;
      if (ai.isGrounded) ai.state = 'block';
    } else {
      ai.vx = 0;
      if (ai.isGrounded && ai.state !== 'punch' && ai.state !== 'kick' && ai.state !== 'special') {
        ai.state = 'idle';
      }
    }

    applyPhysicsAndCombat(ai, player);
  }

  function applyPhysicsAndCombat(fighter, opponent) {
    // Gravity
    fighter.vy += 0.75;
    fighter.x += fighter.vx;
    fighter.y += fighter.vy;

    // Floor collision
    if (fighter.y >= FLOOR_Y) {
      fighter.y = FLOOR_Y;
      fighter.vy = 0;
      fighter.isGrounded = true;
      if (fighter.state === 'jump') fighter.state = 'idle';
    }

    // Screen bounds
    if (fighter.x < 40) fighter.x = 40;
    if (fighter.x > V_WIDTH - 40) fighter.x = V_WIDTH - 40;

    // State timer countdown
    if (fighter.stateTimer > 0) {
      fighter.stateTimer--;

      // Hitbox trigger frame (middle of punch/kick)
      if (fighter.hitboxActive && fighter.stateTimer > 4 && fighter.stateTimer < 14) {
        checkMeleeHit(fighter, opponent);
      }

      if (fighter.stateTimer <= 0) {
        fighter.hitboxActive = false;
        if (fighter.state !== 'ko') {
          fighter.state = 'idle';
        }
      }
    }
  }

  function checkMeleeHit(attacker, defender) {
    const range = attacker.state === 'punch' ? 70 : 88;
    const hitX = attacker.x + (attacker.facing > 0 ? 30 : -30);
    const dist = Math.abs(hitX - defender.x);

    if (dist < range && Math.abs(attacker.y - defender.y) < 60) {
      attacker.hitboxActive = false;
      const baseDamage = attacker.state === 'punch' ? 8 : 14;
      applyDamage(defender, baseDamage, attacker);
    }
  }

  function applyDamage(target, damage, attacker) {
    if (target.state === 'ko') return;

    sound.playHit();
    screenShake = 6;

    let finalDamage = damage;
    if (target.state === 'block') {
      finalDamage = Math.max(1, Math.round(damage * 0.15));
      addFloatingText(target.x, target.y - 70, 'BLOCKED!', '#38bdf8');
      addSparks(target.x, target.y - 50, '#38bdf8', 8);
    } else {
      target.state = 'hurt';
      target.stateTimer = 14;
      target.vx = attacker ? attacker.facing * 5 : 0;
      addSparks(target.x, target.y - 50, '#f43f5e', 18);
      addFloatingText(target.x, target.y - 80, `-${finalDamage}`, '#ff0055');

      // Combo system for player
      if (attacker && attacker.isPlayer) {
        combo++;
        comboResetTimer = 75;
        score += finalDamage * 25 * combo;
        callbacks.onScoreUpdate(score);
        if (combo >= 2) {
          addFloatingText(V_WIDTH / 2, 200, `${combo} HITS COMBO!`, '#facc15');
        }
      }
    }

    target.health = Math.max(0, target.health - finalDamage);

    // Energy gain
    if (attacker) attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + 8);
    target.energy = Math.min(target.maxEnergy, target.energy + 5);

    // Check KO
    if (target.health <= 0) {
      target.state = 'ko';
      target.stateTimer = 999;
      target.vx = (attacker ? attacker.facing : 1) * 7;
      target.vy = -6;
      endRound(target.isPlayer ? 'ai' : 'player', 'K.O.!');
    }
  }

  function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx;

      // Projectile particles
      if (Math.random() < 0.6) {
        particles.push({
          x: p.x,
          y: p.y + (Math.random() - 0.5) * 10,
          vx: -p.vx * 0.2,
          vy: (Math.random() - 0.5) * 2,
          size: 3,
          color: p.color,
          alpha: 0.8,
          decay: 0.05
        });
      }

      // Check collision with opponent
      const target = p.isPlayer ? ai : player;
      const dist = Math.hypot(p.x - target.x, p.y - (target.y - 55));
      if (dist < p.radius + 35) {
        applyDamage(target, p.damage, null);
        addSparks(p.x, p.y, p.color, 20);
        projectiles.splice(i, 1);
        continue;
      }

      // Screen boundary
      if (p.x < 0 || p.x > V_WIDTH) {
        projectiles.splice(i, 1);
      }
    }
  }

  function endRound(winner, reason) {
    if (isRoundOver) return;
    isRoundOver = true;
    roundOverTimer = 0;
    roundBanner = `${reason}\n${winner === 'player' ? 'PLAYER WINS ROUND' : 'AI WINS ROUND'}`;
    sound.playVictory();

    if (winner === 'player') playerWins++;
    else aiWins++;
  }

  function nextRound() {
    currentRound++;
    roundTimer = 60;
    timerTicker = 0;
    isRoundOver = false;
    roundBanner = `ROUND ${currentRound}`;
    bannerTimer = 90;
    projectiles = [];

    // Reset fighters
    player.x = 200;
    player.y = FLOOR_Y;
    player.vx = 0;
    player.vy = 0;
    player.health = 100;
    player.state = 'idle';

    ai.x = 600;
    ai.y = FLOOR_Y;
    ai.vx = 0;
    ai.vy = 0;
    ai.health = 100;
    ai.state = 'idle';
  }

  function matchOver() {
    isRunning = false;
    const playerWon = playerWins > aiWins;
    if (playerWon) {
      score += 2500;
      sound.playVictory();
    } else {
      sound.playGameOver();
    }

    callbacks.onGameOver({
      score: score,
      stats: {
        Result: playerWon ? 'VICTORY' : 'DEFEAT',
        'Rounds Won': `${playerWins} - ${aiWins}`,
        'Max Combo': `${combo} Hits`
      }
    });
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    // Apply screen shake
    if (screenShake > 0.5) {
      const sx = (Math.random() - 0.5) * screenShake;
      const sy = (Math.random() - 0.5) * screenShake;
      ctx.translate(sx, sy);
    }

    // Cyber Arena Background
    drawArenaBackground();

    // Draw Floor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, FLOOR_Y, V_WIDTH, V_HEIGHT - FLOOR_Y);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(V_WIDTH, FLOOR_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Projectiles
    for (let p of projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Fighters
    drawFighter(player);
    drawFighter(ai);

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

    // Draw Floating Texts
    for (let ft of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // Draw Top Fighting HUD
    drawFightingHUD();

    // Draw Banner overlay
    if (bannerTimer > 0 || isRoundOver) {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 19, 0.75)';
      ctx.fillRect(0, V_HEIGHT / 2 - 60, V_WIDTH, 120);

      const lines = roundBanner.split('\n');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 36px monospace';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 15;
      ctx.fillText(lines[0], V_WIDTH / 2, lines.length > 1 ? V_HEIGHT / 2 - 18 : V_HEIGHT / 2);

      if (lines.length > 1) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.fillText(lines[1], V_WIDTH / 2, V_HEIGHT / 2 + 25);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  function drawFighter(f) {
    ctx.save();
    ctx.translate(f.x, f.y);

    // Shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(f.facing, 1);

    // Color theme
    const primary = f.mainColor;
    const accent = f.accentColor;

    // Draw Vector Martial Artist
    if (f.state === 'ko') {
      // Fallen KO pose
      ctx.rotate(-Math.PI / 2.3);
    }

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -96, 12, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Cyber Headband / Visor
    ctx.fillStyle = primary;
    ctx.shadowColor = primary;
    ctx.shadowBlur = 8;
    ctx.fillRect(-2, -98, 14, 5);
    ctx.shadowBlur = 0;

    // Torso (Gi / Armor)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-14, -82, 28, 44, 4);
    ctx.fill();

    // Belt & trim
    ctx.fillStyle = primary;
    ctx.fillRect(-14, -50, 28, 6);

    // Limbs logic
    if (f.state === 'punch') {
      // Punch jab pose
      // Back Arm
      ctx.strokeStyle = accent;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-6, -72);
      ctx.lineTo(-14, -60);
      ctx.stroke();

      // Front Arm extended
      ctx.strokeStyle = primary;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(8, -72);
      ctx.lineTo(46, -72);
      ctx.stroke();

      // Fist glow
      ctx.fillStyle = primary;
      ctx.shadowColor = primary;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(48, -72, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Legs
      drawLegs(ctx, accent, -10, 16);
    } else if (f.state === 'kick') {
      // Roundhouse kick pose
      // Front Leg extended high
      ctx.strokeStyle = primary;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(6, -42);
      ctx.lineTo(48, -60);
      ctx.stroke();

      // Foot glow
      ctx.fillStyle = primary;
      ctx.shadowColor = primary;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(52, -60, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Standing Leg
      ctx.strokeStyle = accent;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-6, -42);
      ctx.lineTo(-4, 0);
      ctx.stroke();

      // Guarding arms
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(12, -80);
      ctx.stroke();
    } else if (f.state === 'block') {
      // Defensive stance
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-4, -70);
      ctx.lineTo(16, -82);
      ctx.lineTo(14, -62);
      ctx.stroke();

      // Energy shield barrier
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(20, -50, 40, -Math.PI / 2.5, Math.PI / 2.5);
      ctx.stroke();
      ctx.shadowBlur = 0;

      drawLegs(ctx, accent, -12, 12);
    } else {
      // Idle / Walking stance
      const bob = Math.sin(Date.now() * 0.008) * 3;

      // Arms in guard
      ctx.strokeStyle = accent;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-8, -72 + bob);
      ctx.lineTo(10, -64 + bob);
      ctx.stroke();

      ctx.strokeStyle = primary;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(6, -72 + bob);
      ctx.lineTo(20, -68 + bob);
      ctx.stroke();

      drawLegs(ctx, accent, -8, 8);
    }

    ctx.restore();
  }

  function drawLegs(ctx, color, offset1, offset2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-6, -44);
    ctx.lineTo(offset1, 0);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(6, -44);
    ctx.lineTo(offset2, 0);
    ctx.stroke();
  }

  function drawArenaBackground() {
    // Backdrop gradient
    const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    grad.addColorStop(0, '#0a0d18');
    grad.addColorStop(0.7, '#111827');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Distant neon skyscrapers
    ctx.fillStyle = '#0c1220';
    for (let i = 0; i < 9; i++) {
      const bx = i * 95 - 20;
      const bh = 140 + (i % 4) * 60;
      ctx.fillRect(bx, FLOOR_Y - bh, 80, bh);
      // Windows
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      for (let wy = FLOOR_Y - bh + 20; wy < FLOOR_Y - 20; wy += 22) {
        ctx.fillRect(bx + 15, wy, 12, 8);
        ctx.fillRect(bx + 45, wy, 12, 8);
      }
      ctx.fillStyle = '#0c1220';
    }

    // Overhead neon lights
    ctx.strokeStyle = 'rgba(255, 0, 122, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 90);
    ctx.lineTo(V_WIDTH, 90);
    ctx.stroke();
  }

  function drawFightingHUD() {
    // Top Bar
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 10, V_WIDTH - 20, 65);

    // Player 1 Name & Health
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('P1: CYBER BLADE', 25, 30);

    // Health Bar P1
    ctx.fillStyle = '#334155';
    ctx.fillRect(25, 36, 280, 16);
    const p1HpW = (player.health / player.maxHealth) * 280;
    ctx.fillStyle = player.health > 25 ? '#00f0ff' : '#ef4444';
    ctx.fillRect(25, 36, p1HpW, 16);

    // Energy Bar P1
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(25, 56, 280, 8);
    const p1EnW = (player.energy / player.maxEnergy) * 280;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(25, 56, p1EnW, 8);

    // Round indicators P1
    for (let r = 0; r < 2; r++) {
      ctx.strokeStyle = '#00f0ff';
      ctx.fillStyle = r < playerWins ? '#00f0ff' : 'transparent';
      ctx.beginPath();
      ctx.arc(315 + r * 14, 44, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Timer in Center
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(roundTimer.toString().padStart(2, '0'), V_WIDTH / 2, 48);

    // AI Name & Health
    ctx.fillStyle = '#ff007a';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SHADOW VIPER', V_WIDTH - 25, 30);

    // Health Bar AI (Right to Left)
    ctx.fillStyle = '#334155';
    ctx.fillRect(V_WIDTH - 305, 36, 280, 16);
    const aiHpW = (ai.health / ai.maxHealth) * 280;
    ctx.fillStyle = ai.health > 25 ? '#ff007a' : '#ef4444';
    ctx.fillRect(V_WIDTH - 25 - aiHpW, 36, aiHpW, 16);

    // Energy Bar AI
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(V_WIDTH - 305, 56, 280, 8);
    const aiEnW = (ai.energy / ai.maxEnergy) * 280;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(V_WIDTH - 25 - aiEnW, 56, aiEnW, 8);

    // Round indicators AI
    for (let r = 0; r < 2; r++) {
      ctx.strokeStyle = '#ff007a';
      ctx.fillStyle = r < aiWins ? '#ff007a' : 'transparent';
      ctx.beginPath();
      ctx.arc(V_WIDTH - 315 - r * 14, 44, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
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
      currentRound = 1;
      playerWins = 0;
      aiWins = 0;
      roundTimer = 60;
      timerTicker = 0;
      score = 0;
      combo = 0;
      isRoundOver = false;
      roundBanner = 'ROUND 1';
      bannerTimer = 90;
      projectiles = [];
      particles = [];
      floatingTexts = [];
      player.x = 200;
      player.health = 100;
      player.energy = 30;
      player.state = 'idle';
      ai.x = 600;
      ai.health = 100;
      ai.energy = 30;
      ai.state = 'idle';
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
      if (code === 'Jump' || code === 'Up') keys.jump = isPressed;
      if (code === 'Block' || code === 'Down') keys.block = isPressed;
      if (isPressed) {
        if (code === 'Punch') triggerAction(player, 'punch');
        if (code === 'Kick') triggerAction(player, 'kick');
        if (code === 'Special') triggerAction(player, 'special');
      }
    },
    getInstructions() {
      return 'A/D Move · W Jump · S Block · J Punch · K Kick · L Special Blast (Needs 35 Energy)';
    },
    getControlsConfig() {
      return {
        dpad: true,
        buttons: [
          { id: 'punch', label: '🥊 PUNCH', code: 'Punch', primary: true },
          { id: 'kick', label: '🦵 KICK', code: 'Kick', primary: true },
          { id: 'special', label: '⚡ SPECIAL', code: 'Special' },
          { id: 'block', label: '🛡️ BLOCK', code: 'Block' }
        ]
      };
    }
  };
}
