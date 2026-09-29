/**
 * Archery Master — Skill / Target Shooting Mini-Game
 * Neon Arcade Collection
 */

export function createArcheryGame(canvas, sound, callbacks, levelConfig = null) {
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

  // Bow position
  const archerX = 90;
  const archerY = 380;

  // Arrow & Bow state
  let isAiming = false;
  let aimStartX = 0;
  let aimStartY = 0;
  let currentAimX = 0;
  let currentAimY = 0;
  let power = 0;
  let angle = 0;

  // Arrows left
  let arrowsLeft = 10;
  let totalArrowsShot = 0;
  let totalHits = 0;
  let bullseyeCount = 0;

  // Game round & score
  let score = 0;
  let combo = 0;
  let round = 1;
  let wind = 0; // -3 to +3

  // Entities
  let activeArrows = [];
  let stuckArrows = [];
  let targets = [];
  let balloons = [];
  let floatingTexts = [];
  let particles = [];

  function resetWind() {
    wind = (Math.random() - 0.5) * 4;
  }

  function spawnRoundTargets() {
    targets = [];
    balloons = [];
    resetWind();

    if (round === 1) {
      // 1 Static target
      targets.push(createTarget(620, 320, 0, 0));
    } else if (round === 2) {
      // 1 Moving vertical target
      targets.push(createTarget(640, 280, 0, 1.8));
    } else if (round === 3) {
      // 1 Fast vertical target + golden bonus balloon
      targets.push(createTarget(660, 260, 0, 2.5));
      balloons.push({ x: 520, y: 460, vy: -1.4, radius: 18, color: '#facc15' });
    } else {
      // Multi-targets
      targets.push(createTarget(560, 240, 0, 1.5));
      targets.push(createTarget(690, 340, 0, -2.0));
      balloons.push({ x: 480, y: 480, vy: -1.6, radius: 18, color: '#facc15' });
    }
  }

  function createTarget(x, y, vx, vy) {
    return {
      x,
      y,
      vx,
      vy,
      width: 24,
      height: 90,
      minY: 160,
      maxY: 460
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
      const speed = 1.5 + Math.random() * 4;
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

  function shootArrow() {
    if (arrowsLeft <= 0 || power < 4) return;
    arrowsLeft--;
    totalArrowsShot++;
    sound.playLaser();

    const speed = power * 0.28;
    activeArrows.push({
      x: archerX + Math.cos(angle) * 35,
      y: archerY + Math.sin(angle) * 35,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle: angle,
      length: 42,
      stuck: false
    });

    power = 0;
  }

  function onMouseDown(e) {
    if (arrowsLeft <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = V_WIDTH / rect.width;
    const scaleY = V_HEIGHT / rect.height;
    isAiming = true;
    aimStartX = (e.clientX - rect.left) * scaleX;
    aimStartY = (e.clientY - rect.top) * scaleY;
    currentAimX = aimStartX;
    currentAimY = aimStartY;
  }

  function onMouseMove(e) {
    if (!isAiming) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = V_WIDTH / rect.width;
    const scaleY = V_HEIGHT / rect.height;
    currentAimX = (e.clientX - rect.left) * scaleX;
    currentAimY = (e.clientY - rect.top) * scaleY;

    const dx = aimStartX - currentAimX;
    const dy = aimStartY - currentAimY;
    const pullDist = Math.hypot(dx, dy);

    power = Math.min(100, pullDist * 0.9);
    angle = Math.atan2(dy, dx);
  }

  function onMouseUp() {
    if (!isAiming) return;
    isAiming = false;
    shootArrow();
  }

  const onTouchStart = (e) => {
    if (e.touches.length > 0) {
      e.preventDefault();
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

  function update() {
    if (!isRunning || isPaused) return;

    // Update Targets
    for (let t of targets) {
      t.y += t.vy;
      if (t.y < t.minY || t.y > t.maxY) t.vy *= -1;
    }

    // Update Balloons
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      b.y += b.vy;
      if (b.y < -30) balloons.splice(i, 1);
    }

    // Update Flying Arrows
    for (let i = activeArrows.length - 1; i >= 0; i--) {
      const a = activeArrows[i];

      // Physics
      a.vx += wind * 0.015;
      a.vy += 0.28; // Gravity
      a.x += a.vx;
      a.y += a.vy;
      a.angle = Math.atan2(a.vy, a.vx);

      // Check Balloon Hit
      let hitBalloon = false;
      for (let j = balloons.length - 1; j >= 0; j--) {
        const b = balloons[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < b.radius + 6) {
          hitBalloon = true;
          sound.playPowerup();
          addSparks(b.x, b.y, 25, '#facc15');
          addFloatingText(b.x, b.y, 'BONUS +300!', '#facc15');
          score += 300;
          balloons.splice(j, 1);
          break;
        }
      }

      // Check Target Hit
      let hitTarget = false;
      for (let t of targets) {
        if (a.x >= t.x - 10 && a.x <= t.x + t.width &&
            a.y >= t.y - t.height / 2 && a.y <= t.y + t.height / 2) {
          hitTarget = true;
          totalHits++;
          sound.playHit();

          // Calculate ring accuracy
          const distFromCenter = Math.abs(a.y - t.y);
          let points = 25;
          let label = 'HIT! +25';
          let textColor = '#ffffff';

          if (distFromCenter < 8) {
            points = 100;
            label = '🎯 BULLSEYE! +100';
            textColor = '#facc15';
            bullseyeCount++;
            combo++;
            sound.playVictory();
          } else if (distFromCenter < 20) {
            points = 50;
            label = 'GREAT! +50';
            textColor = '#00f0ff';
            combo++;
          } else {
            combo = 0;
          }

          const finalPts = points * (combo > 1 ? combo : 1);
          score += finalPts;
          addFloatingText(t.x, a.y, label, textColor);
          addSparks(a.x, a.y, 14, textColor);

          // Stick arrow into target
          stuckArrows.push({
            x: a.x,
            y: a.y,
            target: t,
            offsetY: a.y - t.y,
            angle: a.angle
          });
          break;
        }
      }

      if (hitTarget || hitBalloon || a.x > V_WIDTH + 50 || a.y > 520) {
        if (!hitTarget && !hitBalloon && a.y >= 520) {
          combo = 0;
          sound.playHit();
        }
        activeArrows.splice(i, 1);
      }
    }

    // Check next round or game over
    if (arrowsLeft === 0 && activeArrows.length === 0) {
      if (round < 4) {
        round++;
        arrowsLeft = 10;
        stuckArrows = [];
        spawnRoundTargets();
        sound.playPowerup();
        addFloatingText(V_WIDTH / 2, 200, `ROUND ${round}!`, '#00f0ff');
      } else {
        gameOver();
      }
    }

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

    callbacks.onScoreUpdate(score);
  }

  function gameOver() {
    isRunning = false;
    sound.playVictory();
    const accuracy = totalArrowsShot > 0 ? Math.round((totalHits / totalArrowsShot) * 100) : 0;
    callbacks.onGameOver({
      score: Math.round(score * (activeLevel.scoreMultiplier || 1)),
      stats: {
        'Mission Level': `Level ${activeLevel.level} (${activeLevel.shortName})`,
        Accuracy: `${accuracy}%`,
        Bullseyes: bullseyeCount,
        'Final Round': `Round ${round}`
      }
    });
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    // Neon archery range background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
    bgGrad.addColorStop(0, '#0a0d16');
    bgGrad.addColorStop(1, '#111827');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Range grass / floor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 500, V_WIDTH, 100);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(V_WIDTH, 500);
    ctx.stroke();

    // Draw Targets
    for (let t of targets) {
      drawTarget(t);
    }

    // Draw Stuck Arrows
    for (let sa of stuckArrows) {
      const curY = sa.target.y + sa.offsetY;
      drawArrow(sa.x, curY, sa.angle);
    }

    // Draw Balloons
    for (let b of balloons) {
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // String
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.radius);
      ctx.lineTo(b.x, b.y + b.radius + 15);
      ctx.stroke();
    }

    // Draw Flying Arrows
    for (let a of activeArrows) {
      drawArrow(a.x, a.y, a.angle);
    }

    // Draw Archer figure & Bow
    drawArcher();

    // Aim trajectory guide
    if (isAiming && power > 5) {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      let simX = archerX;
      let simY = archerY;
      let simVx = Math.cos(angle) * power * 0.28;
      let simVy = Math.sin(angle) * power * 0.28;

      ctx.moveTo(simX, simY);
      for (let s = 0; s < 18; s++) {
        simVx += wind * 0.015;
        simVy += 0.28;
        simX += simVx;
        simY += simVy;
        ctx.lineTo(simX, simY);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

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

    // Particles
    for (let pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // HUD
    drawArcheryHUD();

    ctx.restore();
  }

  function drawArcher() {
    ctx.save();
    ctx.translate(archerX, archerY);

    // Body
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(0, -35, 12, 0, Math.PI * 2); // Head
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, -22, 20, 36); // Torso

    // Bow
    ctx.save();
    ctx.rotate(angle);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(20, 0, 34, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.stroke();

    // Bow string
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20 + Math.cos(-Math.PI / 2.2) * 34, Math.sin(-Math.PI / 2.2) * 34);
    if (isAiming) {
      ctx.lineTo(20 - (power * 0.2), 0);
    } else {
      ctx.lineTo(20, 0);
    }
    ctx.lineTo(20 + Math.cos(Math.PI / 2.2) * 34, Math.sin(Math.PI / 2.2) * 34);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function drawArrow(x, y, aAngle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(aAngle);

    // Shaft
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-36, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(0, -4);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();

    // Feathers
    ctx.fillStyle = '#ff007a';
    ctx.fillRect(-36, -3, 8, 2);
    ctx.fillRect(-36, 1, 8, 2);

    ctx.restore();
  }

  function drawTarget(t) {
    ctx.save();
    ctx.translate(t.x, t.y);

    // Stand
    ctx.fillStyle = '#475569';
    ctx.fillRect(-4, 0, 8, 140);

    // Outer Ring (White/Blue)
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, t.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mid Ring (Red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, t.height * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bullseye (Gold)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawArcheryHUD() {
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 10, V_WIDTH - 20, 52);

    // Score
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SCORE', 25, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), 25, 46);

    // Arrows Remaining
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('ARROWS', 160, 26);
    ctx.fillStyle = arrowsLeft > 3 ? '#38bdf8' : '#ef4444';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${arrowsLeft} LEFT`, 160, 46);

    // Wind Indicator
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('WIND INDICATOR', 300, 26);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 16px monospace';
    const windDir = wind > 0.2 ? '▶ EAST' : (wind < -0.2 ? '◀ WEST' : '● CALM');
    ctx.fillText(`${windDir} (${Math.abs(wind).toFixed(1)} m/s)`, 300, 46);

    // Power gauge (if aiming)
    if (isAiming) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('BOW TENSION', 480, 26);
      ctx.fillStyle = '#334155';
      ctx.fillRect(480, 32, 100, 12);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(480, 32, (power / 100) * 100, 12);
    }

    // Round
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`ROUND ${round} / 4`, V_WIDTH - 140, 42);
  }

  function loop() {
    update();
    draw();
    if (isRunning) {
      animationId = requestAnimationFrame(loop);
    }
  }

  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('touchcancel', onTouchEnd, { passive: false });

  return {
    start() {
      isRunning = true;
      isPaused = false;
      spawnRoundTargets();
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
      combo = 0;
      round = 1;
      arrowsLeft = 10;
      totalArrowsShot = 0;
      totalHits = 0;
      bullseyeCount = 0;
      activeArrows = [];
      stuckArrows = [];
      particles = [];
      floatingTexts = [];
      spawnRoundTargets();
      isRunning = true;
      isPaused = false;
      loop();
    },
    destroy() {
      isRunning = false;
      if (animationId) cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    },
    setVirtualKey(code, isPressed) {
      if (code === 'QuickShoot' && isPressed) {
        power = 75;
        angle = -0.3;
        shootArrow();
      }
    },
    getInstructions() {
      return 'Click & drag back to aim and draw bowstring · Release to loose arrow · Account for wind!';
    },
    getControlsConfig() {
      return {
        dpad: false,
        buttons: [
          { id: 'quickShoot', label: '🏹 QUICK SHOT', code: 'QuickShoot', primary: true }
        ]
      };
    }
  };
}
