/**
 * Knight Duel — Medieval Sword Fighting Mini-Game
 * Neon Arcade Collection
 */

export function createKnightGame(canvas, sound, callbacks, levelConfig = null) {
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
  const FLOOR_Y = 480;

  // Stages
  let stage = 1;
  const maxStages = 4;
  const stageNames = [
    'STAGE 1: FOREST OUTPOST',
    'STAGE 2: CASTLE COURTYARD',
    'STAGE 3: SHADOW ARENA',
    'FINAL: THE IRON OVERLORD'
  ];
  let stageBanner = stageNames[0];
  let bannerTimer = 90;
  let screenShake = 0;

  // Player Knight
  const player = {
    x: 150,
    y: FLOOR_Y,
    vx: 0,
    vy: 0,
    facing: 1, // 1 = right, -1 = left
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    state: 'idle', // idle, walk, jump, slash1, slash2, slash3, heavy, block, parry, dash, hurt
    stateTimer: 0,
    comboCounter: 0,
    isGrounded: true,
    invincibleTimer: 0
  };

  // Enemies in stage
  let enemies = [];
  let particles = [];
  let floatingTexts = [];
  let score = 0;

  // Keys
  const keys = {
    left: false,
    right: false,
    jump: false,
    block: false
  };

  function spawnStageEnemies() {
    enemies = [];
    if (stage === 1) {
      // 3 Bandits
      enemies.push(createEnemy(500, 'bandit', 50, 1.8, '#22c55e'));
      enemies.push(createEnemy(650, 'bandit', 50, 2.0, '#22c55e'));
      enemies.push(createEnemy(750, 'bandit', 55, 1.9, '#22c55e'));
    } else if (stage === 2) {
      // 3 Royal Guards (shielded)
      enemies.push(createEnemy(450, 'guard', 80, 1.5, '#3b82f6', true));
      enemies.push(createEnemy(600, 'guard', 80, 1.5, '#3b82f6', true));
      enemies.push(createEnemy(720, 'guard', 90, 1.6, '#3b82f6', true));
    } else if (stage === 3) {
      // 2 Shadow Assassins (fast)
      enemies.push(createEnemy(450, 'assassin', 70, 3.2, '#a855f7'));
      enemies.push(createEnemy(650, 'assassin', 75, 3.5, '#a855f7'));
    } else if (stage === 4) {
      // Boss: The Iron Overlord
      enemies.push(createBoss(600));
    }
  }

  function createEnemy(x, type, hp, speed, color, hasShield = false) {
    return {
      x,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      width: 44,
      height: 90,
      facing: -1,
      type,
      health: hp,
      maxHp: hp,
      speed,
      color,
      hasShield,
      isBlocking: false,
      state: 'idle',
      stateTimer: 0,
      actionCooldown: Math.floor(Math.random() * 40)
    };
  }

  function createBoss(x) {
    return {
      x,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      width: 68,
      height: 120,
      facing: -1,
      type: 'boss',
      health: 350,
      maxHp: 350,
      speed: 2.2,
      color: '#ef4444',
      isBlocking: false,
      state: 'idle',
      stateTimer: 0,
      actionCooldown: 30,
      isBoss: true
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

  function addSparks(x, y, count = 12, color = '#facc15') {
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
    if (e.code === 'KeyW' || e.code === 'ArrowUp') jumpPlayer();
    if (e.code === 'KeyS' || e.code === 'KeyL') blockPlayer(true);
    if (e.code === 'KeyJ') lightAttack();
    if (e.code === 'KeyK') heavyAttack();
    if (e.code === 'Space') dashRoll();
  }

  function onKeyUp(e) {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'KeyS' || e.code === 'KeyL') blockPlayer(false);
  }

  function jumpPlayer() {
    if (player.isGrounded && player.state !== 'dash' && player.state !== 'hurt') {
      player.vy = -13.5;
      player.isGrounded = false;
      player.state = 'jump';
      sound.playJump();
    }
  }

  function blockPlayer(isDown) {
    if (isDown) {
      if (player.isGrounded && player.state !== 'slash' && player.state !== 'dash') {
        player.state = 'block';
        player.stateTimer = 10; // First 8 frames trigger Parry!
      }
    } else {
      if (player.state === 'block') {
        player.state = 'idle';
      }
    }
  }

  function lightAttack() {
    if (player.state === 'dash' || player.state === 'hurt') return;
    if (player.stamina < 15) return;

    player.stamina -= 15;
    player.state = 'slash';
    player.stateTimer = 16;
    sound.playJump();
  }

  function heavyAttack() {
    if (player.state === 'dash' || player.state === 'hurt') return;
    if (player.stamina < 30) return;

    player.stamina -= 30;
    player.state = 'heavy';
    player.stateTimer = 26;
    sound.playJump();
  }

  function dashRoll() {
    if (player.state === 'dash' || player.stamina < 20) return;
    player.stamina -= 20;
    player.state = 'dash';
    player.stateTimer = 20;
    player.invincibleTimer = 22;
    player.vx = player.facing * 9;
    sound.playDash();
  }

  function update() {
    if (!isRunning || isPaused) return;

    if (screenShake > 0) screenShake *= 0.85;
    if (bannerTimer > 0) bannerTimer--;

    // Stamina regen
    player.stamina = Math.min(player.maxStamina, player.stamina + 0.45);
    if (player.invincibleTimer > 0) player.invincibleTimer--;

    // Player inputs & physics
    updatePlayer();

    // Enemies logic
    updateEnemies();

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

    // Check stage cleared
    if (enemies.length === 0 && bannerTimer <= 0) {
      if (stage < maxStages) {
        stage++;
        score += 1000 * stage;
        player.health = Math.min(player.maxHealth, player.health + 40);
        stageBanner = stageNames[stage - 1];
        bannerTimer = 90;
        sound.playVictory();
        player.x = 100;
        spawnStageEnemies();
      } else {
        // Victory!
        isRunning = false;
        sound.playVictory();
        callbacks.onGameOver({
          score: Math.round((score + 5000) * (activeLevel.scoreMultiplier || 1)),
          stats: {
            'Mission Level': `Level ${activeLevel.level} (${activeLevel.shortName})`,
            Title: 'CHAMPION OF THE REALM',
            'Boss Slain': 'Iron Overlord Defeated',
            'Remaining HP': `${player.health}%`
          }
        });
      }
    }

    callbacks.onScoreUpdate(score);
  }

  function updatePlayer() {
    // Movement
    if (player.state === 'idle' || player.state === 'walk' || player.state === 'jump') {
      if (keys.left) {
        player.vx = -4.5;
        player.facing = -1;
        if (player.isGrounded) player.state = 'walk';
      } else if (keys.right) {
        player.vx = 4.5;
        player.facing = 1;
        if (player.isGrounded) player.state = 'walk';
      } else {
        player.vx = 0;
        if (player.isGrounded && player.state === 'walk') player.state = 'idle';
      }
    }

    // Gravity
    player.vy += 0.8;
    player.x += player.vx;
    player.y += player.vy;

    // Floor
    if (player.y >= FLOOR_Y) {
      player.y = FLOOR_Y;
      player.vy = 0;
      player.isGrounded = true;
      if (player.state === 'jump') player.state = 'idle';
    }

    // Bounds
    player.x = Math.max(30, Math.min(V_WIDTH - 30, player.x));

    // Attack state timer & Hit checks
    if (player.stateTimer > 0) {
      player.stateTimer--;

      // Check hit on active frames
      if ((player.state === 'slash' && player.stateTimer === 8) ||
          (player.state === 'heavy' && player.stateTimer === 12)) {
        checkPlayerSwordHit(player.state === 'heavy');
      }

      if (player.stateTimer <= 0 && player.state !== 'block') {
        player.state = 'idle';
      }
    }
  }

  function checkPlayerSwordHit(isHeavy) {
    const reach = isHeavy ? 80 : 64;
    const hitBoxX = player.x + player.facing * (reach / 2);

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (Math.abs(hitBoxX - e.x) < reach && Math.abs(player.y - e.y) < 50) {
        let damage = isHeavy ? 45 : 24;
        sound.playHit();
        screenShake = isHeavy ? 8 : 4;

        if (e.isBlocking && !isHeavy) {
          damage = 5;
          addFloatingText(e.x, e.y - 70, 'BLOCKED!', '#38bdf8');
          addSparks(e.x, e.y - 40, 8, '#38bdf8');
        } else {
          e.health -= damage;
          e.x += player.facing * (isHeavy ? 30 : 15);
          e.state = 'hurt';
          e.stateTimer = 16;
          addFloatingText(e.x, e.y - 80, `-${damage}`, isHeavy ? '#facc15' : '#ffffff');
          addSparks(e.x, e.y - 40, 16, '#facc15');

          if (e.health <= 0) {
            score += e.isBoss ? 3000 : 250;
            addSparks(e.x, e.y - 40, 24, e.color);
            enemies.splice(i, 1);
          }
        }
      }
    }
  }

  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.facing = e.x > player.x ? -1 : 1;

      // Enemy gravity
      e.vy += 0.8;
      e.x += e.vx;
      e.y += e.vy;
      if (e.y >= FLOOR_Y) {
        e.y = FLOOR_Y;
        e.vy = 0;
      }

      if (e.state === 'hurt') {
        e.stateTimer--;
        if (e.stateTimer <= 0) e.state = 'idle';
        continue;
      }

      const dist = Math.abs(e.x - player.x);
      e.actionCooldown--;

      if (e.actionCooldown <= 0) {
        e.actionCooldown = Math.floor(30 + Math.random() * 40);

        if (dist > 75) {
          // Approach
          e.vx = e.facing * e.speed;
        } else {
          // Melee strike
          e.vx = 0;
          e.state = 'attack';
          e.stateTimer = 20;
        }
      }

      // Enemy attack execution
      if (e.state === 'attack') {
        e.stateTimer--;
        if (e.stateTimer === 8 && dist < 85 && Math.abs(e.y - player.y) < 40) {
          executeEnemyHit(e);
        }
        if (e.stateTimer <= 0) {
          e.state = 'idle';
        }
      }
    }
  }

  function executeEnemyHit(e) {
    if (player.invincibleTimer > 0) return;

    // Check Parry window (if block just started)
    if (player.state === 'block' && player.stateTimer > 4) {
      sound.playPowerup();
      screenShake = 10;
      addFloatingText(player.x, player.y - 80, 'PARRIED!', '#00f0ff');
      addSparks(player.x + player.facing * 20, player.y - 40, 20, '#00f0ff');
      // Stun attacker
      e.state = 'hurt';
      e.stateTimer = 45;
      e.x += -e.facing * 35;
      return;
    }

    if (player.state === 'block') {
      sound.playHit();
      player.health -= 4;
      player.stamina = Math.max(0, player.stamina - 15);
      addFloatingText(player.x, player.y - 70, 'BLOCKED', '#38bdf8');
      addSparks(player.x, player.y - 40, 6, '#38bdf8');
      return;
    }

    // Normal damage
    const damage = e.isBoss ? 28 : (e.type === 'assassin' ? 18 : 14);
    player.health -= damage;
    player.invincibleTimer = 35;
    player.state = 'hurt';
    player.stateTimer = 16;
    player.vx = -player.facing * 6;
    sound.playHit();
    screenShake = 8;
    addFloatingText(player.x, player.y - 80, `-${damage}`, '#ef4444');
    addSparks(player.x, player.y - 40, 16, '#ef4444');

    if (player.health <= 0) {
      isRunning = false;
      sound.playGameOver();
      callbacks.onGameOver({
        score: Math.round(score * (activeLevel.scoreMultiplier || 1)),
        stats: {
          'Mission Level': `Level ${activeLevel.level} (${activeLevel.shortName})`,
          'Fallen In': stageNames[stage - 1],
          'Knight Score': Math.round(score * (activeLevel.scoreMultiplier || 1))
        }
      });
    }
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Medieval Backdrop
    drawMedievalBackdrop();

    // Floor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, FLOOR_Y, V_WIDTH, V_HEIGHT - FLOOR_Y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_Y);
    ctx.lineTo(V_WIDTH, FLOOR_Y);
    ctx.stroke();

    // Enemies
    for (let e of enemies) {
      drawKnightFigure(e, false);
    }

    // Player
    if (player.invincibleTimer % 4 < 2) {
      drawKnightFigure(player, true);
    }

    // Particles
    for (let pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floating text
    for (let ft of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // HUD
    drawKnightHUD();

    // Stage banner
    if (bannerTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 19, 0.8)';
      ctx.fillRect(0, V_HEIGHT / 2 - 40, V_WIDTH, 80);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 26px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.fillText(stageBanner, V_WIDTH / 2, V_HEIGHT / 2);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawKnightFigure(k, isPlayer) {
    ctx.save();
    ctx.translate(k.x, k.y);
    ctx.scale(k.facing, 1);

    const mainColor = isPlayer ? '#00f0ff' : k.color;
    const armorColor = isPlayer ? '#1e293b' : '#334155';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Knight Helmet
    ctx.fillStyle = armorColor;
    ctx.fillRect(-12, -88, 24, 22);
    // Glowing visor slit
    ctx.fillStyle = mainColor;
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 6;
    ctx.fillRect(0, -80, 12, 4);
    ctx.shadowBlur = 0;

    // Torso Plate
    ctx.fillStyle = armorColor;
    ctx.fillRect(-14, -66, 28, 36);

    // Shield (if blocking or has shield)
    if (k.state === 'block' || (k.hasShield && k.state !== 'hurt')) {
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, -65);
      ctx.lineTo(24, -65);
      ctx.lineTo(20, -30);
      ctx.lineTo(12, -20);
      ctx.lineTo(4, -30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Sword & Blade swing
    if (k.state === 'slash' || k.state === 'heavy' || k.state === 'attack') {
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = k.state === 'heavy' ? 6 : 4;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(10, -50);
      ctx.lineTo(48, -40);
      ctx.stroke();

      // Blade arc glow
      ctx.strokeStyle = `rgba(0, 240, 255, 0.4)`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(10, -50, 42, -0.4, 0.6);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      // Sheathed / resting blade
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, -50);
      ctx.lineTo(26, -75);
      ctx.stroke();
    }

    // Legs
    ctx.strokeStyle = armorColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-6, -30);
    ctx.lineTo(-6, 0);
    ctx.moveTo(6, -30);
    ctx.lineTo(6, 0);
    ctx.stroke();

    ctx.restore();
  }

  function drawMedievalBackdrop() {
    const grad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(1, '#111827');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Castle battlements silhouette
    ctx.fillStyle = '#0f172a';
    for (let x = 0; x < V_WIDTH; x += 60) {
      ctx.fillRect(x, FLOOR_Y - 140, 36, 140);
      ctx.fillRect(x, FLOOR_Y - 160, 20, 20);
    }
  }

  function drawKnightHUD() {
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 10, V_WIDTH - 20, 52);

    // Score
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SCORE', 25, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), 25, 46);

    // HP Bar
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('HEALTH', 160, 26);
    ctx.fillStyle = '#334155';
    ctx.fillRect(160, 32, 130, 12);
    ctx.fillStyle = player.health > 25 ? '#10b981' : '#ef4444';
    ctx.fillRect(160, 32, (player.health / player.maxHealth) * 130, 12);

    // Stamina Bar
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('STAMINA', 310, 26);
    ctx.fillStyle = '#334155';
    ctx.fillRect(310, 32, 130, 12);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(310, 32, (player.stamina / player.maxStamina) * 130, 12);

    // Current Stage
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`STAGE ${stage} / 4`, V_WIDTH - 140, 42);
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
      stageBanner = stageNames[0];
      bannerTimer = 90;
      player.x = 150;
      player.health = 100;
      player.stamina = 100;
      player.state = 'idle';
      particles = [];
      floatingTexts = [];
      spawnStageEnemies();
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
      if ((code === 'Jump' || code === 'Up') && isPressed) jumpPlayer();
      if (code === 'Block' || code === 'Down') blockPlayer(isPressed);
      if (code === 'Slash' && isPressed) lightAttack();
      if (code === 'Heavy' && isPressed) heavyAttack();
      if (code === 'Dash' && isPressed) dashRoll();
    },
    getInstructions() {
      return 'A/D Move · W Jump · J Light Slash · K Heavy Strike · L Block/Parry · Space Dash Roll';
    },
    getControlsConfig() {
      return {
        dpad: true,
        buttons: [
          { id: 'slash', label: '⚔️ SLASH', code: 'Slash', primary: true },
          { id: 'heavy', label: '💥 HEAVY', code: 'Heavy' },
          { id: 'block', label: '🛡️ PARRY', code: 'Block' },
          { id: 'dash', label: '💨 DASH', code: 'Dash' }
        ]
      };
    }
  };
}
