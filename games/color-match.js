/**
 * Color Match — Arcade / Reflex Mini-Game
 * Neon Arcade Collection
 */

export function createColorMatchGame(canvas, sound, callbacks) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isRunning = false;
  let isPaused = false;

  const V_WIDTH = 800;
  const V_HEIGHT = 600;

  // Color palette definitions
  const PALETTE = [
    { id: 'red', name: 'NEON RED', hex: '#ef4444', key: '1' },
    { id: 'blue', name: 'ELECTRIC BLUE', hex: '#3b82f6', key: '2' },
    { id: 'green', name: 'ACID GREEN', hex: '#10b981', key: '3' },
    { id: 'yellow', name: 'CYBER YELLOW', hex: '#facc15', key: '4' },
    { id: 'purple', name: 'HYPER PURPLE', hex: '#a855f7', key: '5' },
    { id: 'cyan', name: 'PLASMA CYAN', hex: '#00f0ff', key: '6' }
  ];

  // Game state
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let lives = 3;
  let level = 1;
  let totalSolved = 0;
  let isFrenzy = false;
  let frenzyTimer = 0;

  // Round / Question state
  let currentTargetColor = null;
  let currentWord = null;
  let currentWordColor = null;
  let currentOptions = [];
  let roundTimer = 1.0; // 0 to 1
  let maxRoundTime = 2200; // ms
  let roundStartTime = 0;
  let screenShake = 0;

  // Particles & floating popups
  let particles = [];
  let floatingTexts = [];

  function nextQuestion() {
    // Pick 4 colors (or 6 on higher levels)
    const count = level >= 3 ? 6 : 4;
    const shuffled = [...PALETTE].sort(() => Math.random() - 0.5);
    currentOptions = shuffled.slice(0, count);

    // Pick target from options
    currentTargetColor = currentOptions[Math.floor(Math.random() * currentOptions.length)];

    // Stroop effect on higher levels: text might name another color!
    if (level >= 2 && Math.random() < 0.6) {
      const otherColor = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      currentWord = otherColor.name;
    } else {
      currentWord = currentTargetColor.name;
    }
    currentWordColor = currentTargetColor.hex;

    // Timer calculation: gets faster with level
    maxRoundTime = Math.max(900, 2400 - (level * 180));
    roundStartTime = Date.now();
    roundTimer = 1.0;
  }

  function handleSelect(option) {
    if (!isRunning || isPaused || lives <= 0) return;

    if (option.id === currentTargetColor.id) {
      // Correct!
      sound.playCoin();
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      totalSolved++;

      const pts = (100 + Math.round(roundTimer * 100)) * (combo > 1 ? combo : 1) * (isFrenzy ? 2 : 1);
      score += pts;

      addSparks(V_WIDTH / 2, 260, 25, option.hex);
      addFloatingText(V_WIDTH / 2, 220, `+${pts} PTS!`, '#facc15');

      if (combo % 8 === 0 && !isFrenzy) {
        // Trigger Frenzy!
        isFrenzy = true;
        frenzyTimer = 300;
        sound.playPowerup();
        addFloatingText(V_WIDTH / 2, 160, '🔥 FRENZY MODE (2X POINTS)!', '#ff007a');
      }

      if (totalSolved % 6 === 0) {
        level++;
        sound.playPowerup();
      }

      nextQuestion();
    } else {
      // Wrong!
      sound.playHit();
      lives--;
      combo = 0;
      screenShake = 10;
      addSparks(V_WIDTH / 2, 260, 20, '#ef4444');
      addFloatingText(V_WIDTH / 2, 220, 'MISS!', '#ef4444');

      if (lives <= 0) {
        gameOver();
      } else {
        nextQuestion();
      }
    }
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

  function addSparks(x, y, count = 16, color = '#00f0ff') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3,
        color,
        alpha: 1,
        decay: 0.035
      });
    }
  }

  function onKeyDown(e) {
    if (e.key >= '1' && e.key <= '6') {
      const index = parseInt(e.key) - 1;
      if (index < currentOptions.length) {
        handleSelect(currentOptions[index]);
      }
    }
  }

  function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = V_WIDTH / rect.width;
    const scaleY = V_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check button click
    const btnW = 150;
    const btnH = 64;
    const gap = 20;
    const cols = currentOptions.length === 6 ? 3 : 2;
    const rows = Math.ceil(currentOptions.length / cols);
    const totalW = cols * btnW + (cols - 1) * gap;
    const startX = (V_WIDTH - totalW) / 2;
    const startY = 380;

    for (let i = 0; i < currentOptions.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnW + gap);
      const by = startY + row * (btnH + gap);

      if (clickX >= bx && clickX <= bx + btnW && clickY >= by && clickY <= by + btnH) {
        handleSelect(currentOptions[i]);
        break;
      }
    }
  }

  function update() {
    if (!isRunning || isPaused) return;

    if (screenShake > 0) screenShake *= 0.85;

    // Frenzy timer
    if (isFrenzy) {
      frenzyTimer--;
      if (frenzyTimer <= 0) isFrenzy = false;
    }

    // Time elapsed for current round
    const elapsed = Date.now() - roundStartTime;
    roundTimer = Math.max(0, 1 - (elapsed / maxRoundTime));

    if (roundTimer <= 0) {
      // Time over for this question!
      sound.playHit();
      lives--;
      combo = 0;
      screenShake = 10;
      addFloatingText(V_WIDTH / 2, 220, 'TIME OUT!', '#ef4444');

      if (lives <= 0) {
        gameOver();
      } else {
        nextQuestion();
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
    sound.playGameOver();
    callbacks.onGameOver({
      score: score,
      stats: {
        'Colors Matched': totalSolved,
        'Highest Combo': `${maxCombo}x`,
        'Level Reached': `Level ${level}`
      }
    });
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Modern neon dark background
    const bg = ctx.createRadialGradient(V_WIDTH / 2, 260, 20, V_WIDTH / 2, 260, 420);
    bg.addColorStop(0, '#111827');
    bg.addColorStop(1, '#070a13');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

    // Header HUD
    drawColorHUD();

    // Central Glowing Color Target Orb
    if (currentTargetColor) {
      ctx.save();
      ctx.translate(V_WIDTH / 2, 240);

      // Glowing outer ring
      ctx.strokeStyle = currentTargetColor.hex;
      ctx.shadowColor = currentTargetColor.hex;
      ctx.shadowBlur = 24;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.stroke();

      // Inner fill
      ctx.fillStyle = currentTargetColor.hex;
      ctx.beginPath();
      ctx.arc(0, 0, 65, 0, Math.PI * 2);
      ctx.fill();

      // Stroop word inside orb
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText('MATCH!', 0, 0);

      ctx.restore();
    }

    // Countdown Timer Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(V_WIDTH / 2 - 200, 335, 400, 12);
    const timerW = roundTimer * 400;
    ctx.fillStyle = roundTimer > 0.3 ? '#00f0ff' : '#ef4444';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fillRect(V_WIDTH / 2 - 200, 335, timerW, 12);
    ctx.shadowBlur = 0;

    // Interactive Option Buttons
    drawOptionButtons();

    // Floating text
    for (let ft of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // Particles
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

    ctx.restore();
  }

  function drawOptionButtons() {
    const btnW = 150;
    const btnH = 64;
    const gap = 20;
    const cols = currentOptions.length === 6 ? 3 : 2;
    const totalW = cols * btnW + (cols - 1) * gap;
    const startX = (V_WIDTH - totalW) / 2;
    const startY = 380;

    for (let i = 0; i < currentOptions.length; i++) {
      const opt = currentOptions[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnW + gap);
      const by = startY + row * (btnH + gap);

      // Button background
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = opt.hex;
      ctx.lineWidth = 3;
      ctx.shadowColor = opt.hex;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(bx, by, btnW, btnH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Color swatch square
      ctx.fillStyle = opt.hex;
      ctx.beginPath();
      ctx.roundRect(bx + 12, by + 16, 32, 32, 4);
      ctx.fill();

      // Label & Number shortcut
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(opt.name.split(' ')[1] || opt.name, bx + 52, by + 34);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`[${i + 1}]`, bx + 52, by + 50);
    }
  }

  function drawColorHUD() {
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(10, 10, V_WIDTH - 20, 52);

    // Score
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SCORE', 25, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), 25, 46);

    // Combo
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('STREAK', 160, 26);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${combo}x COMBO`, 160, 46);

    // Lives
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('LIVES', 320, 26);
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '❤️ ';
    ctx.fillStyle = '#ef4444';
    ctx.font = '16px sans-serif';
    ctx.fillText(hearts, 320, 46);

    // Level
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`LEVEL ${level}`, V_WIDTH - 140, 42);
  }

  function loop() {
    update();
    draw();
    if (isRunning) {
      animationId = requestAnimationFrame(loop);
    }
  }

  const onTouchStart = (e) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      onCanvasClick(e.touches[0]);
    }
  };

  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });

  return {
    start() {
      isRunning = true;
      isPaused = false;
      nextQuestion();
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
      maxCombo = 0;
      lives = 3;
      level = 1;
      totalSolved = 0;
      isFrenzy = false;
      particles = [];
      floatingTexts = [];
      nextQuestion();
      isRunning = true;
      isPaused = false;
      loop();
    },
    destroy() {
      isRunning = false;
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('click', onCanvasClick);
      canvas.removeEventListener('touchstart', onTouchStart);
    },
    setVirtualKey(code, isPressed) {
      if (isPressed) {
        const idx = parseInt(code.replace('Color', '')) - 1;
        if (idx >= 0 && idx < currentOptions.length) {
          handleSelect(currentOptions[idx]);
        }
      }
    },
    getInstructions() {
      return 'Click the button matching the target color orb before the timer runs out! Press 1-6 keys.';
    },
    getControlsConfig() {
      return {
        dpad: false,
        buttons: [
          { id: 'c1', label: '1', code: 'Color1' },
          { id: 'c2', label: '2', code: 'Color2' },
          { id: 'c3', label: '3', code: 'Color3' },
          { id: 'c4', label: '4', code: 'Color4' },
          { id: 'c5', label: '5', code: 'Color5' },
          { id: 'c6', label: '6', code: 'Color6' }
        ]
      };
    }
  };
}
