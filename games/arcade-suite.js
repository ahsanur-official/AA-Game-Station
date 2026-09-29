/**
 * AA GAME STATION — ARCADE SUITE ENGINE (PRO VISUALS EDITION)
 * High-definition procedural canvas games with dynamic lighting, particle systems,
 * floating score popups, starfield depth, glow trails, and responsive controls.
 */

export function createSuiteGame(gameDef) {
  return function(canvas, sound, callbacks, levelConfig = null) {
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
      healthBonus: 0,
      color: '#00f0ff'
    };

    const V_WIDTH = 800;
    const V_HEIGHT = 600;

    // Keys state
    const keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      actionA: false,
      actionB: false,
      space: false
    };

    let score = 0;
    let gameOver = false;
    let particles = [];
    let floatingTexts = [];
    let gameTick = 0;
    let combo = 0;
    let screenShake = 0;
    let flashVignette = 0;

    // Game Theme & Palette
    const gType = gameDef.engineType || 'dodge';
    const primaryColor = gameDef.color || '#00f0ff';
    const accentColor = gameDef.accent || '#ff007a';

    // Ambient Starfield background layers
    const bgStars = [];
    for (let i = 0; i < 65; i++) {
      bgStars.push({
        x: Math.random() * V_WIDTH,
        y: Math.random() * V_HEIGHT,
        size: Math.random() * 2 + 0.8,
        speed: 0.2 + Math.random() * 0.8,
        alpha: 0.2 + Math.random() * 0.6,
        color: Math.random() < 0.3 ? primaryColor : (Math.random() < 0.5 ? accentColor : '#ffffff')
      });
    }

    // Player State
    let p = {
      x: V_WIDTH / 2,
      y: V_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: 18,
      width: 44,
      height: 44,
      angle: 0,
      speed: 6.5,
      health: 100,
      trail: []
    };

    let entities = [];
    let projectiles = [];
    let targets = [];
    let customTimer = 0;
    let level = 1;

    // Helper: spawn explosion particles with spark trails
    function spawnParticles(x, y, color, count = 16, speed = 5) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (Math.random() * 0.8 + 0.2) * speed;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 1,
          decay: 0.02 + Math.random() * 0.025,
          size: Math.random() * 4.5 + 2,
          color,
          spark: Math.random() < 0.4
        });
      }
    }

    // Helper: floating floating score text
    function addFloatingText(text, x, y, color = primaryColor, size = 18) {
      floatingTexts.push({
        text,
        x,
        y,
        vy: -1.6,
        alpha: 1,
        color,
        size
      });
    }

    // Initialize Game Based on Engine Type
    function initGame() {
      score = 0;
      gameOver = false;
      particles = [];
      floatingTexts = [];
      entities = [];
      projectiles = [];
      targets = [];
      gameTick = 0;
      combo = 0;
      level = activeLevel.level || 1;
      flashVignette = 0;
      p.trail = [];
      p.health = Math.max(30, 100 + (activeLevel.healthBonus || 0));

      addFloatingText(`MISSION START: ${activeLevel.shortName || 'LEVEL ' + activeLevel.level} (${activeLevel.scoreMultiplier}x SCORE)`, V_WIDTH / 2, V_HEIGHT / 2 - 30, activeLevel.color || primaryColor, 20);

      if (gType === 'brick') {
        p.x = V_WIDTH / 2 - 55;
        p.y = V_HEIGHT - 48;
        p.width = 110;
        p.height = 15;
        entities = [{
          x: V_WIDTH / 2,
          y: V_HEIGHT - 70,
          vx: 4.5 * (activeLevel.speedMultiplier || 1),
          vy: -5.5 * (activeLevel.speedMultiplier || 1),
          radius: 7.5,
          trail: []
        }];
        targets = [];
        const rows = 5;
        const cols = 10;
        const bW = 68;
        const bH = 22;
        const startX = (V_WIDTH - (cols * (bW + 8))) / 2;
        const brickHues = [190, 280, 330, 45, 140];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            targets.push({
              x: startX + c * (bW + 8),
              y: 75 + r * (bH + 8),
              w: bW,
              h: bH,
              color: `hsl(${brickHues[r % brickHues.length]}, 90%, 60%)`,
              glow: `hsl(${brickHues[r % brickHues.length]}, 100%, 75%)`,
              hp: 1,
              val: (rows - r) * 20
            });
          }
        }
      } else if (gType === 'snake') {
        p.body = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }, { x: 9, y: 12 }];
        p.dir = { x: 1, y: 0 };
        p.nextDir = { x: 1, y: 0 };
        targets = [{ x: 20, y: 12, pulse: 0 }]; // Food orb
      } else if (gType === 'invaders') {
        p.x = V_WIDTH / 2;
        p.y = V_HEIGHT - 55;
        p.width = 40;
        p.height = 26;
        targets = [];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 8; c++) {
            targets.push({
              x: 120 + c * 70,
              y: 70 + r * 46,
              w: 38,
              h: 26,
              vx: 1.6,
              color: `hsl(${c * 35 + 160}, 95%, 65%)`,
              eyeColor: `hsl(${c * 35 + 160}, 100%, 90%)`,
              alive: true,
              animOffset: c * 0.4 + r
            });
          }
        }
      } else if (gType === 'flappy') {
        p.x = 140;
        p.y = V_HEIGHT / 2;
        p.vy = 0;
        p.radius = 18;
        p.rot = 0;
        entities = [];
      } else if (gType === 'pong') {
        p.y = V_HEIGHT / 2 - 50;
        p.x = 35;
        p.width = 16;
        p.height = 100;
        entities = [{
          x: V_WIDTH / 2,
          y: V_HEIGHT / 2,
          vx: 6.5,
          vy: (Math.random() - 0.5) * 6,
          radius: 9,
          trail: []
        }];
        p.aiY = V_HEIGHT / 2 - 50;
      } else if (gType === 'stack') {
        targets = [{ x: V_WIDTH / 2 - 75, y: V_HEIGHT - 45, w: 150, h: 28, color: primaryColor }];
        p.currentBlock = { x: 40, y: V_HEIGHT - 73, w: 150, h: 28, vx: 4.5, color: accentColor };
      } else if (gType === 'whack' || gType === 'target') {
        targets = [];
        for (let i = 0; i < 9; i++) {
          const rx = 180 + (i % 3) * 180;
          const ry = 140 + Math.floor(i / 3) * 140;
          targets.push({ x: rx, y: ry, radius: 46, active: false, timer: 0, scale: 0 });
        }
      } else if (gType === 'runner' || gType === 'dodge') {
        p.x = V_WIDTH / 2;
        p.y = V_HEIGHT - 85;
        p.radius = 20;
        entities = [];
      } else if (gType === 'shooter360') {
        p.x = V_WIDTH / 2;
        p.y = V_HEIGHT / 2;
        p.angle = 0;
        entities = [];
        for (let i = 0; i < 7; i++) {
          spawnAsteroid();
        }
      } else if (gType === 'memory') {
        p.sequence = [];
        p.playerStep = 0;
        p.showing = true;
        p.showTimer = 0;
        p.activePad = -1;
        addToSequence();
      } else {
        p.x = V_WIDTH / 2;
        p.y = V_HEIGHT / 2;
        entities = [];
      }
    }

    function spawnAsteroid() {
      const edge = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (edge === 0) { x = Math.random() * V_WIDTH; y = -30; }
      else if (edge === 1) { x = V_WIDTH + 30; y = Math.random() * V_HEIGHT; }
      else if (edge === 2) { x = Math.random() * V_WIDTH; y = V_HEIGHT + 30; }
      else { x = -30; y = Math.random() * V_HEIGHT; }

      const angle = Math.atan2(p.y - y, p.x - x) + (Math.random() - 0.5) * 0.9;
      const speed = 1.2 + Math.random() * 2.2;
      const rad = 22 + Math.random() * 16;
      const pts = [];
      const numPts = 7;
      for (let i = 0; i < numPts; i++) {
        const a = (i / numPts) * Math.PI * 2;
        const r = rad * (0.8 + Math.random() * 0.4);
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }

      entities.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: rad,
        pts,
        hp: 2,
        rot: 0,
        rotSpeed: (Math.random() - 0.5) * 0.04
      });
    }

    function addToSequence() {
      p.sequence.push(Math.floor(Math.random() * 4));
      p.playerStep = 0;
      p.showing = true;
      p.showTimer = 0;
    }

    function triggerGameOver() {
      if (gameOver) return;
      gameOver = true;
      screenShake = 16;
      flashVignette = 1;
      sound?.playGameOver?.();
      callbacks.onGameOver({
        score: Math.round(score),
        stats: [
          { label: 'Mission Level', value: `Level ${activeLevel.level} (${activeLevel.shortName})` },
          { label: 'Score Multiplier', value: `${activeLevel.scoreMultiplier}x` },
          { label: 'Highest Combo', value: combo || level },
          { label: 'Time Survived', value: `${Math.floor(gameTick / 60)}s` },
          { label: 'Genre', value: gameDef.category || 'Arcade' }
        ],
        extra: {
          combo,
          survivalSeconds: Math.floor(gameTick / 60),
          level: activeLevel,
          noDamage: (p.health >= (100 + (activeLevel.healthBonus || 0)) && score >= 200)
        }
      });
    }

    // Input handlers
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        keys.space = true;
        handleActionPrimary();
      }
      if (e.key === 'z' || e.key === 'Z' || e.key === 'j' || e.key === 'J') {
        keys.actionA = true;
        handleActionPrimary();
      }
      if (e.key === 'x' || e.key === 'X' || e.key === 'k' || e.key === 'K') {
        keys.actionB = true;
        handleActionSecondary();
      }
    }

    function onKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
      if (e.key === ' ' || e.key === 'Spacebar') keys.space = false;
      if (e.key === 'z' || e.key === 'Z' || e.key === 'j' || e.key === 'J') keys.actionA = false;
      if (e.key === 'x' || e.key === 'X' || e.key === 'k' || e.key === 'K') keys.actionB = false;
    }

    function handleActionPrimary() {
      if (gameOver) return;
      sound?.playLaser?.();

      if (gType === 'flappy') {
        p.vy = -7.8;
        spawnParticles(p.x, p.y + 12, primaryColor, 8, 2.5);
      } else if (gType === 'invaders') {
        if (projectiles.length < 5) {
          projectiles.push({ x: p.x - 12, y: p.y - 12, vy: -11, radius: 3.5 });
          projectiles.push({ x: p.x + 12, y: p.y - 12, vy: -11, radius: 3.5 });
          spawnParticles(p.x, p.y - 8, primaryColor, 4, 2);
        }
      } else if (gType === 'shooter360') {
        projectiles.push({
          x: p.x + Math.cos(p.angle) * 18,
          y: p.y + Math.sin(p.angle) * 18,
          vx: Math.cos(p.angle) * 12,
          vy: Math.sin(p.angle) * 12,
          life: 52
        });
        screenShake = 3;
      } else if (gType === 'stack') {
        const curr = p.currentBlock;
        const last = targets[targets.length - 1];
        const diff = curr.x - last.x;
        if (Math.abs(diff) > last.w) {
          triggerGameOver();
          return;
        }
        const newW = last.w - Math.abs(diff);
        const newX = diff > 0 ? curr.x : last.x;
        targets.push({ x: newX, y: curr.y, w: newW, h: curr.h, color: accentColor });
        score += 100;
        combo++;
        addFloatingText(`+100 COMBO x${combo}`, newX + newW / 2, curr.y - 10, primaryColor);
        sound?.playHit?.();
        spawnParticles(newX + newW / 2, curr.y, primaryColor, 14);
        if (targets.length > 13) {
          targets.forEach(t => t.y += 28);
        }
        p.currentBlock = {
          x: 40,
          y: curr.y - (targets.length > 13 ? 0 : 28),
          w: newW,
          h: 28,
          vx: (3.8 + combo * 0.22) * (combo % 2 === 0 ? 1 : -1),
          color: `hsl(${(combo * 28) % 360}, 92%, 62%)`
        };
      } else if (gType === 'target' || gType === 'whack') {
        const act = targets.find(t => t.active);
        if (act) {
          act.active = false;
          score += 100;
          combo++;
          addFloatingText('+100 HIT!', act.x, act.y - 20, '#00ff88');
          sound?.playPowerup?.();
          spawnParticles(act.x, act.y, primaryColor, 18);
        }
      } else {
        projectiles.push({
          x: p.x,
          y: p.y - 14,
          vx: 0,
          vy: -10,
          radius: 5
        });
      }
    }

    function handleActionSecondary() {
      if (gameOver) return;
      sound?.playDash?.();
      if (gType === 'shooter360') {
        p.vx += Math.cos(p.angle) * 4.5;
        p.vy += Math.sin(p.angle) * 4.5;
        spawnParticles(p.x, p.y, accentColor, 8, 3);
      }
    }

    // Touch handling directly on canvas
    function onCanvasTouch(e) {
      if (gameOver) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = V_WIDTH / rect.width;
      const scaleY = V_HEIGHT / rect.height;
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
      const tx = (touch.clientX - rect.left) * scaleX;
      const ty = (touch.clientY - rect.top) * scaleY;

      if (gType === 'flappy' || gType === 'stack') {
        handleActionPrimary();
      } else if (gType === 'whack' || gType === 'target') {
        targets.forEach(t => {
          if (t.active && Math.hypot(t.x - tx, t.y - ty) < t.radius * 1.35) {
            t.active = false;
            score += 100;
            combo++;
            addFloatingText('+100!', t.x, t.y - 20, '#00ff88');
            sound?.playPowerup?.();
            spawnParticles(t.x, t.y, primaryColor, 18);
          }
        });
      } else if (gType === 'memory') {
        const padIdx = (tx > V_WIDTH / 2 ? 1 : 0) + (ty > V_HEIGHT / 2 ? 2 : 0);
        handleMemoryInput(padIdx);
      } else {
        p.x = tx;
        if (gType !== 'brick') p.y = ty;
        handleActionPrimary();
      }
    }

    function handleMemoryInput(padIdx) {
      if (p.showing) return;
      sound?.playSynthNote?.(240 + padIdx * 120, 0.16);
      p.activePad = padIdx;
      setTimeout(() => { p.activePad = -1; }, 200);

      if (padIdx === p.sequence[p.playerStep]) {
        p.playerStep++;
        score += 30;
        if (p.playerStep >= p.sequence.length) {
          score += 150;
          combo++;
          addFloatingText('PERFECT!', V_WIDTH / 2, V_HEIGHT / 2, '#00ff88', 24);
          sound?.playVictory?.();
          setTimeout(addToSequence, 550);
        }
      } else {
        triggerGameOver();
      }
    }

    // Main Update Loop
    function update() {
      if (gameOver || isPaused) return;
      gameTick++;

      // Screen shake decay
      if (screenShake > 0) screenShake *= 0.88;
      if (flashVignette > 0) flashVignette *= 0.94;

      // Update background stars
      bgStars.forEach(st => {
        st.y += st.speed;
        if (st.y > V_HEIGHT) {
          st.y = 0;
          st.x = Math.random() * V_WIDTH;
        }
      });

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= pt.decay;
        if (pt.life <= 0) particles.splice(i, 1);
      }

      // Update floating texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.022;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
      }

      // Player motion trail
      if (gameTick % 2 === 0) {
        p.trail.unshift({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.pop();
      }

      // ENGINE: BRICK BREAKER
      if (gType === 'brick') {
        if (keys.left) p.x = Math.max(0, p.x - 8);
        if (keys.right) p.x = Math.min(V_WIDTH - p.width, p.x + 8);

        entities.forEach(ball => {
          ball.x += ball.vx;
          ball.y += ball.vy;

          if (gameTick % 2 === 0) {
            ball.trail.unshift({ x: ball.x, y: ball.y });
            if (ball.trail.length > 6) ball.trail.pop();
          }

          if (ball.x - ball.radius < 0 || ball.x + ball.radius > V_WIDTH) {
            ball.vx *= -1;
            sound?.playHit?.();
            screenShake = 2;
          }
          if (ball.y - ball.radius < 0) {
            ball.vy *= -1;
            sound?.playHit?.();
            screenShake = 2;
          }
          if (ball.y + ball.radius > V_HEIGHT) {
            triggerGameOver();
          }

          // Paddle collision
          if (
            ball.y + ball.radius >= p.y &&
            ball.y - ball.radius <= p.y + p.height &&
            ball.x >= p.x &&
            ball.x <= p.x + p.width
          ) {
            ball.vy = -Math.abs(ball.vy);
            const offset = (ball.x - (p.x + p.width / 2)) / (p.width / 2);
            ball.vx = offset * 7;
            sound?.playHit?.();
            spawnParticles(ball.x, ball.y, primaryColor, 8);
            screenShake = 3;
          }

          // Targets collision
          for (let i = targets.length - 1; i >= 0; i--) {
            const b = targets[i];
            if (
              ball.x >= b.x &&
              ball.x <= b.x + b.w &&
              ball.y >= b.y &&
              ball.y <= b.y + b.h
            ) {
              ball.vy *= -1;
              score += b.val;
              combo++;
              addFloatingText(`+${b.val}`, b.x + b.w / 2, b.y, b.color);
              sound?.playPowerup?.();
              spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.color, 14);
              targets.splice(i, 1);
              screenShake = 4;
              if (targets.length === 0) {
                level++;
                addFloatingText(`STAGE ${level} CLEARED!`, V_WIDTH / 2, V_HEIGHT / 2, '#ffd700', 24);
                initGame();
              }
              break;
            }
          }
        });
      }

      // ENGINE: SNAKE
      else if (gType === 'snake') {
        if (keys.left && p.dir.x === 0) p.nextDir = { x: -1, y: 0 };
        if (keys.right && p.dir.x === 0) p.nextDir = { x: 1, y: 0 };
        if (keys.up && p.dir.y === 0) p.nextDir = { x: 0, y: -1 };
        if (keys.down && p.dir.y === 0) p.nextDir = { x: 0, y: 1 };

        if (targets[0]) targets[0].pulse = (targets[0].pulse + 0.1) % (Math.PI * 2);

        if (gameTick % 5 === 0) {
          p.dir = p.nextDir;
          const head = { x: p.body[0].x + p.dir.x, y: p.body[0].y + p.dir.y };

          if (head.x < 0 || head.x >= 32 || head.y < 0 || head.y >= 24) {
            triggerGameOver();
            return;
          }
          for (let i = 1; i < p.body.length; i++) {
            if (p.body[i].x === head.x && p.body[i].y === head.y) {
              triggerGameOver();
              return;
            }
          }

          p.body.unshift(head);

          const food = targets[0];
          if (food && head.x === food.x && head.y === food.y) {
            score += 150;
            combo++;
            addFloatingText('+150 ENERGY!', head.x * 24, head.y * 24, '#00ff88');
            sound?.playPowerup?.();
            spawnParticles(head.x * 24 + 12, head.y * 24 + 12, '#00ff88', 15);
            targets[0] = {
              x: Math.floor(Math.random() * 30) + 1,
              y: Math.floor(Math.random() * 22) + 1,
              pulse: 0
            };
          } else {
            p.body.pop();
          }
        }
      }

      // ENGINE: FLAPPY RUNNER
      else if (gType === 'flappy') {
        p.vy += 0.42;
        p.y += p.vy;
        p.rot = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, p.vy * 0.08));

        if (p.y - p.radius < 0 || p.y + p.radius > V_HEIGHT) {
          triggerGameOver();
        }

        if (gameTick % 85 === 0) {
          const gap = 165;
          const topH = 75 + Math.random() * (V_HEIGHT - gap - 150);
          entities.push({
            x: V_WIDTH,
            topH,
            bottomY: topH + gap,
            w: 60,
            passed: false,
            color: accentColor
          });
        }

        for (let i = entities.length - 1; i >= 0; i--) {
          const pipe = entities[i];
          pipe.x -= 3.6;

          if (!pipe.passed && pipe.x < p.x) {
            pipe.passed = true;
            score += 50;
            combo++;
            addFloatingText('+50 GATE', p.x, p.y - 25, primaryColor);
            sound?.playPowerup?.();
          }

          if (
            p.x + p.radius > pipe.x &&
            p.x - p.radius < pipe.x + pipe.w
          ) {
            if (p.y - p.radius < pipe.topH || p.y + p.radius > pipe.bottomY) {
              triggerGameOver();
            }
          }

          if (pipe.x < -70) entities.splice(i, 1);
        }
      }

      // ENGINE: SPACE INVADERS
      else if (gType === 'invaders') {
        if (keys.left) p.x = Math.max(25, p.x - 6.5);
        if (keys.right) p.x = Math.min(V_WIDTH - 25, p.x + 6.5);

        for (let i = projectiles.length - 1; i >= 0; i--) {
          const pr = projectiles[i];
          pr.y += pr.vy;

          targets.forEach(inv => {
            if (
              inv.alive &&
              pr.x >= inv.x &&
              pr.x <= inv.x + inv.w &&
              pr.y >= inv.y &&
              pr.y <= inv.y + inv.h
            ) {
              inv.alive = false;
              pr.y = -100;
              score += 60;
              combo++;
              addFloatingText('+60', inv.x + inv.w / 2, inv.y, inv.color);
              sound?.playHit?.();
              spawnParticles(inv.x + inv.w / 2, inv.y + inv.h / 2, inv.color, 12);
              screenShake = 3;
            }
          });

          if (pr.y < 0) projectiles.splice(i, 1);
        }

        let hitWall = false;
        targets.forEach(inv => {
          if (!inv.alive) return;
          inv.x += inv.vx;
          if (inv.x < 20 || inv.x + inv.w > V_WIDTH - 20) hitWall = true;
          if (inv.y + inv.h > p.y - 10) triggerGameOver();
        });

        if (hitWall) {
          targets.forEach(inv => {
            inv.vx *= -1;
            inv.y += 18;
          });
        }

        if (targets.every(t => !t.alive)) {
          level++;
          score += 600;
          addFloatingText('SECTOR SECURED!', V_WIDTH / 2, V_HEIGHT / 2, '#00ff88', 24);
          initGame();
        }
      }

      // ENGINE: PONG / HOCKEY
      else if (gType === 'pong') {
        if (keys.up) p.y = Math.max(12, p.y - 7.5);
        if (keys.down) p.y = Math.min(V_HEIGHT - p.height - 12, p.y + 7.5);

        const ball = entities[0];
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (gameTick % 2 === 0) {
          ball.trail.unshift({ x: ball.x, y: ball.y });
          if (ball.trail.length > 7) ball.trail.pop();
        }

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > V_HEIGHT) {
          ball.vy *= -1;
          sound?.playHit?.();
          screenShake = 2;
        }

        // Player paddle
        if (
          ball.x - ball.radius <= p.x + p.width &&
          ball.y >= p.y &&
          ball.y <= p.y + p.height &&
          ball.vx < 0
        ) {
          ball.vx = Math.abs(ball.vx) * 1.05;
          ball.vy += (ball.y - (p.y + p.height / 2)) * 0.12;
          score += 30;
          combo++;
          addFloatingText('+30 DEFLECT', ball.x, ball.y - 15, primaryColor);
          sound?.playHit?.();
          spawnParticles(ball.x, ball.y, primaryColor, 10);
          screenShake = 3;
        }

        // AI Paddle
        const aiX = V_WIDTH - 55;
        p.aiY += (ball.y - (p.aiY + 50)) * 0.09;
        p.aiY = Math.max(10, Math.min(V_HEIGHT - 110, p.aiY));

        if (
          ball.x + ball.radius >= aiX &&
          ball.y >= p.aiY &&
          ball.y <= p.aiY + 100 &&
          ball.vx > 0
        ) {
          ball.vx = -Math.abs(ball.vx);
          sound?.playHit?.();
          spawnParticles(ball.x, ball.y, accentColor, 8);
        }

        if (ball.x < 0) {
          triggerGameOver();
        } else if (ball.x > V_WIDTH) {
          score += 200;
          combo++;
          addFloatingText('GOAL! +200', V_WIDTH / 2, V_HEIGHT / 2, '#ffd700', 24);
          sound?.playVictory?.();
          ball.x = V_WIDTH / 2;
          ball.y = V_HEIGHT / 2;
          ball.vx = -6;
        }
      }

      // ENGINE: 360 SHOOTER / ASTEROIDS
      else if (gType === 'shooter360') {
        if (keys.left) p.angle -= 0.08;
        if (keys.right) p.angle += 0.08;
        if (keys.up) {
          p.vx += Math.cos(p.angle) * 0.28;
          p.vy += Math.sin(p.angle) * 0.28;
          spawnParticles(
            p.x - Math.cos(p.angle) * 16,
            p.y - Math.sin(p.angle) * 16,
            '#ff8800',
            2,
            1.8
          );
        }

        p.vx *= 0.982;
        p.vy *= 0.982;
        p.x = (p.x + p.vx + V_WIDTH) % V_WIDTH;
        p.y = (p.y + p.vy + V_HEIGHT) % V_HEIGHT;

        for (let i = projectiles.length - 1; i >= 0; i--) {
          const pr = projectiles[i];
          pr.x = (pr.x + pr.vx + V_WIDTH) % V_WIDTH;
          pr.y = (pr.y + pr.vy + V_HEIGHT) % V_HEIGHT;
          pr.life--;

          entities.forEach(ast => {
            if (Math.hypot(pr.x - ast.x, pr.y - ast.y) < ast.radius) {
              ast.hp--;
              pr.life = 0;
              score += 40;
              sound?.playHit?.();
              spawnParticles(ast.x, ast.y, accentColor, 8);
              if (ast.hp <= 0) {
                ast.dead = true;
                score += 120;
                combo++;
                addFloatingText('+120 BLAST', ast.x, ast.y - 15, primaryColor);
                sound?.playExplosion?.();
                spawnParticles(ast.x, ast.y, primaryColor, 20);
                screenShake = 5;
              }
            }
          });

          if (pr.life <= 0) projectiles.splice(i, 1);
        }

        for (let i = entities.length - 1; i >= 0; i--) {
          const ast = entities[i];
          ast.x = (ast.x + ast.vx + V_WIDTH) % V_WIDTH;
          ast.y = (ast.y + ast.vy + V_HEIGHT) % V_HEIGHT;
          ast.rot += ast.rotSpeed;

          if (Math.hypot(p.x - ast.x, p.y - ast.y) < ast.radius + 14) {
            triggerGameOver();
          }

          if (ast.dead) entities.splice(i, 1);
        }

        if (entities.length < 5) {
          spawnAsteroid();
        }
      }

      // ENGINE: DODGE / METEOR RUNNER
      else if (gType === 'dodge' || gType === 'runner') {
        const spd = 7;
        if (keys.left) p.x = Math.max(p.radius, p.x - spd);
        if (keys.right) p.x = Math.min(V_WIDTH - p.radius, p.x + spd);
        if (keys.up) p.y = Math.max(p.radius, p.y - spd);
        if (keys.down) p.y = Math.min(V_HEIGHT - p.radius, p.y + spd);

        // Spawn falling hazard meteorites with flame tails
        if (gameTick % 20 === 0) {
          entities.push({
            x: Math.random() * (V_WIDTH - 60) + 30,
            y: -30,
            vy: 4.5 + Math.random() * 4 + level * 0.45,
            radius: 15 + Math.random() * 14,
            rot: Math.random() * Math.PI,
            color: Math.random() < 0.35 ? accentColor : '#ff2255'
          });
        }

        // Spawn bonus energy orbs
        if (gameTick % 80 === 0) {
          targets.push({
            x: Math.random() * (V_WIDTH - 60) + 30,
            y: -25,
            vy: 3.2,
            radius: 13,
            pulse: 0,
            color: '#00ff88'
          });
        }

        score += 1;

        for (let i = entities.length - 1; i >= 0; i--) {
          const obs = entities[i];
          obs.y += obs.vy;

          if (Math.hypot(p.x - obs.x, p.y - obs.y) < p.radius + obs.radius) {
            triggerGameOver();
          }

          if (obs.y > V_HEIGHT + 40) entities.splice(i, 1);
        }

        for (let i = targets.length - 1; i >= 0; i--) {
          const orb = targets[i];
          orb.y += orb.vy;

          if (Math.hypot(p.x - orb.x, p.y - orb.y) < p.radius + orb.radius) {
            score += 180;
            combo++;
            addFloatingText('+180 ORB', orb.x, orb.y - 15, '#00ff88');
            sound?.playPowerup?.();
            spawnParticles(orb.x, orb.y, '#00ff88', 16);
            targets.splice(i, 1);
          } else if (orb.y > V_HEIGHT + 30) {
            targets.splice(i, 1);
          }
        }
      }

      // ENGINE: TARGET / WHACK REFLEX
      else if (gType === 'whack' || gType === 'target') {
        if (gameTick % 45 === 0) {
          const inactive = targets.filter(t => !t.active);
          if (inactive.length > 0) {
            const chosen = inactive[Math.floor(Math.random() * inactive.length)];
            chosen.active = true;
            chosen.timer = 80;
            chosen.scale = 0;
          }
        }

        targets.forEach(t => {
          if (t.active) {
            t.timer--;
            if (t.scale < 1) t.scale += 0.15;
            if (t.timer <= 0) {
              t.active = false;
            }
          }
        });
      }
    }

    // ==========================================
    // RENDER: GORGEOUS CYBERPUNK CANVAS VISUALS
    // ==========================================
    function render() {
      ctx.save();

      // Screen shake translation
      if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
      }

      // 1. DEEP SPACE / CYBER ARENA BACKGROUND
      const bgGrad = ctx.createRadialGradient(
        V_WIDTH / 2, V_HEIGHT / 2, 50,
        V_WIDTH / 2, V_HEIGHT / 2, 550
      );
      bgGrad.addColorStop(0, '#0a1024');
      bgGrad.addColorStop(0.6, '#060914');
      bgGrad.addColorStop(1, '#020409');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      // 2. PARALLAX STARFIELD & NEBULA BLOOM
      bgStars.forEach(st => {
        ctx.fillStyle = st.color;
        ctx.globalAlpha = st.alpha;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 3. CYBER GRID WITH SCANNING HORIZON
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < V_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, V_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < V_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(V_WIDTH, y);
        ctx.stroke();
      }

      // 4. PARTICLES SYSTEM (With bloom)
      particles.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();

        if (pt.spark) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pt.x - pt.vx * 2, pt.y - pt.vy * 2);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      // 5. ENGINE-SPECIFIC POLISHED VISUALS
      // ------------------------------------
      if (gType === 'brick') {
        // Paddle with dual-tone gradient & neon rim
        const paddleGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        paddleGrad.addColorStop(0, '#ffffff');
        paddleGrad.addColorStop(0.3, primaryColor);
        paddleGrad.addColorStop(1, '#0369a1');

        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 16;
        ctx.fillStyle = paddleGrad;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Glowing center core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x + p.width / 2 - 8, p.y + 4, 16, 4);

        // Ball with speed trails
        entities.forEach(ball => {
          ball.trail.forEach((t, idx) => {
            const alpha = 1 - (idx / ball.trail.length);
            ctx.fillStyle = primaryColor;
            ctx.globalAlpha = alpha * 0.45;
            ctx.beginPath();
            ctx.arc(t.x, t.y, ball.radius * alpha, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalAlpha = 1;

          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Bricks with bevels & ambient glow
        targets.forEach(b => {
          ctx.fillStyle = b.color;
          ctx.shadowColor = b.glow;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, b.w, b.h, 4);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Glassmorphic top specular line
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(b.x + 3, b.y + 2, b.w - 6, 2.5);
        });
      }

      else if (gType === 'snake') {
        const sz = 24;
        // Food Orb: Atomic pulsing core with orbital rings
        const f = targets[0];
        if (f) {
          const pulseR = (sz / 2 - 2) + Math.sin(f.pulse) * 3;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 20;
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(f.x * sz + sz / 2, f.y * sz + sz / 2, pulseR, 0, Math.PI * 2);
          ctx.fill();

          // Core bright center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(f.x * sz + sz / 2, f.y * sz + sz / 2, pulseR * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Outer rotating ring
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(f.x * sz + sz / 2, f.y * sz + sz / 2, pulseR + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Snake Body: High-tech cyber dragon segments
        p.body.forEach((seg, idx) => {
          const isHead = idx === 0;
          ctx.fillStyle = isHead ? primaryColor : 'rgba(0, 240, 255, 0.78)';
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = isHead ? 16 : 8;

          ctx.beginPath();
          ctx.roundRect(seg.x * sz + 1.5, seg.y * sz + 1.5, sz - 3, sz - 3, isHead ? 6 : 4);
          ctx.fill();
          ctx.shadowBlur = 0;

          if (isHead) {
            // Glowing eyes
            ctx.fillStyle = '#ffffff';
            const eyeX1 = seg.x * sz + (p.dir.x !== 0 ? (p.dir.x > 0 ? 16 : 6) : 6);
            const eyeX2 = seg.x * sz + (p.dir.x !== 0 ? (p.dir.x > 0 ? 16 : 6) : 16);
            const eyeY1 = seg.y * sz + (p.dir.y !== 0 ? (p.dir.y > 0 ? 16 : 6) : 6);
            const eyeY2 = seg.y * sz + (p.dir.y !== 0 ? (p.dir.y > 0 ? 16 : 6) : 16);
            ctx.fillRect(eyeX1, eyeY1, 3, 3);
            ctx.fillRect(eyeX2, eyeY2, 3, 3);
          }
        });
      }

      else if (gType === 'flappy') {
        // Laser Energy Gates (Top & Bottom Pylons)
        entities.forEach(pipe => {
          const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.w, 0);
          pipeGrad.addColorStop(0, '#0f172a');
          pipeGrad.addColorStop(0.5, '#1e293b');
          pipeGrad.addColorStop(1, '#0f172a');

          ctx.fillStyle = pipeGrad;
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 2;

          // Top pylon
          ctx.fillRect(pipe.x, 0, pipe.w, pipe.topH);
          ctx.strokeRect(pipe.x, 0, pipe.w, pipe.topH);

          // Top hazard cap
          ctx.fillStyle = accentColor;
          ctx.fillRect(pipe.x - 4, pipe.topH - 12, pipe.w + 8, 12);

          // Bottom pylon
          ctx.fillStyle = pipeGrad;
          ctx.fillRect(pipe.x, pipe.bottomY, pipe.w, V_HEIGHT - pipe.bottomY);
          ctx.strokeRect(pipe.x, pipe.bottomY, pipe.w, V_HEIGHT - pipe.bottomY);

          // Bottom hazard cap
          ctx.fillStyle = accentColor;
          ctx.fillRect(pipe.x - 4, pipe.bottomY, pipe.w + 8, 12);

          // Electric arcing laser barrier
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pipe.x + pipe.w / 2, pipe.topH);
          ctx.lineTo(pipe.x + pipe.w / 2, pipe.bottomY);
          ctx.stroke();
        });

        // Player Drone (With tilt and thruster engine exhaust)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        // Engine flame
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(-16, -4);
        ctx.lineTo(-24 - Math.random() * 8, 0);
        ctx.lineTo(-16, 4);
        ctx.fill();

        // Hull
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius, p.radius * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cockpit visor
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(5, -2, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      else if (gType === 'invaders') {
        // Player Starship with dual laser pods
        ctx.save();
        ctx.translate(p.x, p.y);

        // Afterburner
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(-8, 12);
        ctx.lineTo(0, 20 + Math.random() * 6);
        ctx.lineTo(8, 12);
        ctx.fill();

        // Ship hull
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(20, 12);
        ctx.lineTo(8, 8);
        ctx.lineTo(-8, 8);
        ctx.lineTo(-20, 12);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Visor
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -8, 6, 8);

        ctx.restore();

        // Lasers
        projectiles.forEach(pr => {
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(pr.x - 2, pr.y - 12, 4, 18);
          ctx.shadowBlur = 0;
        });

        // Invader Alien Sprites
        targets.forEach(inv => {
          if (!inv.alive) return;
          const wobble = Math.sin(gameTick * 0.1 + inv.animOffset) * 2;

          ctx.fillStyle = inv.color;
          ctx.shadowColor = inv.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(inv.x, inv.y + wobble, inv.w, inv.h, 6);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Glowing Alien Visor/Eyes
          ctx.fillStyle = inv.eyeColor;
          ctx.fillRect(inv.x + 8, inv.y + 6 + wobble, 6, 6);
          ctx.fillRect(inv.x + inv.w - 14, inv.y + 6 + wobble, 6, 6);

          // Antennae
          ctx.strokeStyle = inv.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(inv.x + 6, inv.y + wobble);
          ctx.lineTo(inv.x + 2, inv.y - 4 + wobble);
          ctx.moveTo(inv.x + inv.w - 6, inv.y + wobble);
          ctx.lineTo(inv.x + inv.w - 2, inv.y - 4 + wobble);
          ctx.stroke();
        });
      }

      else if (gType === 'pong') {
        // Center divider line
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.moveTo(V_WIDTH / 2, 0);
        ctx.lineTo(V_WIDTH / 2, V_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        // Center arena halo
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(V_WIDTH / 2, V_HEIGHT / 2, 80, 0, Math.PI * 2);
        ctx.stroke();

        // Player Paddle
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.width, p.height, 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        // AI Paddle
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.roundRect(V_WIDTH - 55, p.aiY, p.width, 100, 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Ball with neon trail
        const ball = entities[0];
        ball.trail.forEach((t, idx) => {
          const alpha = 1 - (idx / ball.trail.length);
          ctx.fillStyle = primaryColor;
          ctx.globalAlpha = alpha * 0.5;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ball.radius * alpha, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      else if (gType === 'stack') {
        // Distant Cyber City Skyline in background
        ctx.fillStyle = 'rgba(10, 18, 38, 0.4)';
        for (let i = 0; i < 12; i++) {
          const bW = 60;
          const bH = 120 + ((i * 37) % 180);
          ctx.fillRect(i * 70, V_HEIGHT - bH, bW, bH);
        }

        // Tower slabs with illuminated neon rims
        targets.forEach(t => {
          ctx.fillStyle = t.color;
          ctx.shadowColor = t.color;
          ctx.shadowBlur = 12;
          ctx.fillRect(t.x, t.y, t.w, t.h);
          ctx.shadowBlur = 0;

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(t.x, t.y, t.w, t.h);

          // Floor windows
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          for (let w = 8; w < t.w - 8; w += 16) {
            ctx.fillRect(t.x + w, t.y + 6, 8, 5);
          }
        });

        // Moving block
        const c = p.currentBlock;
        c.x += c.vx;
        if (c.x < 15 || c.x + c.w > V_WIDTH - 15) c.vx *= -1;

        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 18;
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.shadowBlur = 0;
      }

      else if (gType === 'shooter360') {
        // Player Triangle Starfighter
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-16, -12);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-16, 12);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cockpit
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(2, 0, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Projectiles (High-energy plasma laser beams)
        projectiles.forEach(pr => {
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#ffff55';
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Asteroids with faceted geometric surfaces
        entities.forEach(ast => {
          ctx.save();
          ctx.translate(ast.x, ast.y);
          ctx.rotate(ast.rot);

          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ast.pts.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.restore();
        });
      }

      else if (gType === 'whack' || gType === 'target') {
        // 9 Node holographic arenas
        targets.forEach(t => {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Target active popup
          if (t.active) {
            const sc = t.scale || 1;
            ctx.shadowColor = primaryColor;
            ctx.shadowBlur = 24;

            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.arc(t.x, t.y, (t.radius * 0.75) * sc, 0, Math.PI * 2);
            ctx.fill();

            // Reticle crosshair
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(t.x - 20, t.y);
            ctx.lineTo(t.x + 20, t.y);
            ctx.moveTo(t.x, t.y - 20);
            ctx.lineTo(t.x, t.y + 20);
            ctx.stroke();

            ctx.shadowBlur = 0;
          }
        });
      }

      else {
        // Generic Action / Dodge Runner
        // Player Ship / Orb
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Falling Meteorites / Obstacles
        entities.forEach(obs => {
          ctx.shadowColor = obs.color;
          ctx.shadowBlur = 14;
          ctx.fillStyle = obs.color;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Collectible Power Orbs
        targets.forEach(orb => {
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 18;
          ctx.fillStyle = '#00ff88';
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 6. FLOATING DAMAGE / SCORE TEXTS (+100, COMBO x2!)
      floatingTexts.forEach(ft => {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `bold ${ft.size}px Orbitron, sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x, ft.y);
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // 7. DAMAGE / VICTORY SCREEN FLASH VIGNETTE
      if (flashVignette > 0) {
        ctx.fillStyle = `rgba(255, 0, 80, ${flashVignette * 0.35})`;
        ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);
      }

      // 8. HIGH-TECH HUD HEADER (Clean unboxed style)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 8;
      ctx.fillText(`SCORE  ${Math.round(score).toLocaleString()}`, 24, 38);
      ctx.shadowBlur = 0;

      // Active Mission Level HUD pill on canvas
      ctx.fillStyle = activeLevel.color || '#00f0ff';
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.fillText(`LVL ${activeLevel.level} · ${activeLevel.shortName} (${activeLevel.scoreMultiplier}x)`, 24, 58);

      if (combo > 1) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 15px Orbitron, sans-serif';
        ctx.fillText(`🔥 COMBO x${combo}`, 24, 80);
      }

      ctx.restore();
    }

    function loop() {
      if (!isRunning) return;
      update();
      render();
      if (gameTick % 8 === 0 && callbacks?.onScoreUpdate) {
        callbacks.onScoreUpdate(Math.round(score), { combo, gameTick, level: activeLevel });
      }
      animationId = requestAnimationFrame(loop);
    }

    // Attach listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('touchstart', onCanvasTouch, { passive: true });
    canvas.addEventListener('mousedown', onCanvasTouch);

    return {
      start() {
        isRunning = true;
        isPaused = false;
        initGame();
        loop();
      },
      pause() {
        isPaused = true;
      },
      resume() {
        isPaused = false;
      },
      restart() {
        isRunning = true;
        isPaused = false;
        initGame();
      },
      destroy() {
        isRunning = false;
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        canvas.removeEventListener('touchstart', onCanvasTouch);
        canvas.removeEventListener('mousedown', onCanvasTouch);
      },
      setVirtualKey(code, isPressed) {
        if (code === 'Left') keys.left = isPressed;
        if (code === 'Right') keys.right = isPressed;
        if (code === 'Up') keys.up = isPressed;
        if (code === 'Down') keys.down = isPressed;
        if (code === 'Action' && isPressed) handleActionPrimary();
        if (code === 'Jump' && isPressed) handleActionPrimary();
        if (code === 'Shoot' && isPressed) handleActionPrimary();
        if (code === 'Special' && isPressed) handleActionSecondary();
      },
      getInstructions() {
        return gameDef.instructions || 'Arrow Keys / Touch D-Pad to move · Tap or Action button to interact!';
      },
      getLevel() {
        return activeLevel;
      },
      getControlsConfig() {
        return {
          dpad: gameDef.dpad !== false,
          buttons: gameDef.buttons || [
            { id: 'act', label: '⚡ ACTION', code: 'Action', primary: true }
          ]
        };
      }
    };
  };
}
