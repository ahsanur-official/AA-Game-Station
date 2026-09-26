/**
 * NEON ARCADE — 10 Game Collection
 * Master Arcade Controller, Audio Synthesizer, & Game Launcher
 */

import { createRacingGame } from './games/racing.js';
import { createFightingGame } from './games/fighting.js';
import { createSpaceGame } from './games/space.js';
import { createZombieGame } from './games/zombie.js';
import { createKnightGame } from './games/knight.js';
import { createArcheryGame } from './games/archery.js';
import { createColorMatchGame } from './games/color-match.js';
import { createSkyDashGame } from './games/sky-dash.js';
import { createBombEscapeGame } from './games/bomb-escape.js';
import { createMotoStuntGame } from './games/moto-stunt.js';

// ==========================================
// 1. PROCEDURAL WEB AUDIO SYNTHESIZER
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.bgmOsc = null;
    this.bgmGain = null;
    this.bgmStep = 0;
    this.bgmTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.musicEnabled;
  }

  startBGM() {
    this.init();
    if (!this.ctx || !this.musicEnabled) return;
    this.stopBGM();

    const bassNotes = [110, 110, 130.8, 130.8, 146.8, 146.8, 123.5, 123.5]; // A2, C3, D3, B2
    const bpm = 128;
    const stepDuration = 60 / bpm / 2;

    this.bgmTimer = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      const freq = bassNotes[this.bgmStep % bassNotes.length];
      this.playSynthNote(freq, stepDuration * 0.7, 'triangle', 0.05);

      if (this.bgmStep % 4 === 2) {
        // High melody accent
        const melody = [440, 523, 587, 659];
        const mFreq = melody[Math.floor(this.bgmStep / 4) % melody.length];
        this.playSynthNote(mFreq, stepDuration * 0.4, 'sine', 0.03);
      }
      this.bgmStep++;
    }, stepDuration * 1000);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playSynthNote(freq, duration, type = 'sine', volume = 0.05) {
    if (!this.soundEnabled && !this.musicEnabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  playLaser() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (_) {}
  }

  playHit() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (_) {}
  }

  playExplosion() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // White noise buffer for explosion
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start();
    } catch (_) {}
  }

  playCoin() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.28);
    } catch (_) {}
  }

  playJump() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (_) {}
  }

  playPowerup() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.1);
      });
    } catch (_) {}
  }

  playDash() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (_) {}
  }

  playGameOver() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [392, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.09, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.22);
      });
    } catch (_) {}
  }

  playVictory() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.16);
      });
    } catch (_) {}
  }
}

const soundManager = new SoundEngine();

// ==========================================
// 2. GAME CATALOG
// ==========================================
const GAMES = [
  {
    id: 'racing',
    title: 'Turbo Rush',
    category: 'RACING',
    difficulty: 'Medium',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.3V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
    description: 'High-speed sci-fi highway racer. Dodge cyber traffic, grab coins and ignite nitro boosters.',
    createFn: createRacingGame
  },
  {
    id: 'fighting',
    title: 'Street Fighter Arena',
    category: 'FIGHTING',
    difficulty: 'Hard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M18 11l-4-4"/><path d="m21.5 4.5-7 7"/><path d="m14.5 12.5 2 2"/></svg>`,
    description: '1v1 cyber martial arts combat. Chain punch and kick combos, block incoming blows and unleash specials.',
    createFn: createFightingGame
  },
  {
    id: 'space',
    title: 'Space Defender',
    category: 'ACTION',
    difficulty: 'Medium',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.5 7h-7z"/><path d="M12 9v13"/><path d="m5 16 7-3 7 3-7 6z"/></svg>`,
    description: 'Vertical starfighter shooter. Blast alien swarms, dodge asteroid belts and annihilate dreadnought bosses.',
    createFn: createSpaceGame
  },
  {
    id: 'zombie',
    title: 'Zombie Survival',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/><circle cx="12" cy="12" r="3"/></svg>`,
    description: 'Top-down twin-stick arena shooter. 360° aiming, tactical reloads, health drops, and relentless mutant hordes.',
    createFn: createZombieGame
  },
  {
    id: 'knight',
    title: 'Knight Duel',
    category: 'FIGHTING',
    difficulty: 'Hard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 5 5"/><path d="m19 21 2-2"/></svg>`,
    description: 'Medieval swordplay with timed parries, guard-breaking strikes, dash rolls, and multi-stage boss duels.',
    createFn: createKnightGame
  },
  {
    id: 'archery',
    title: 'Archery Master',
    category: 'SKILL',
    difficulty: 'Medium',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M22 2 12 12"/></svg>`,
    description: 'Precision target shooting. Calculate bow tension, parabolic gravity arc, and changing crosswinds for bullseyes.',
    createFn: createArcheryGame
  },
  {
    id: 'color-match',
    title: 'Color Match',
    category: 'ARCADE',
    difficulty: 'Easy',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12 2 12"/></svg>`,
    description: 'Rapid-fire reflex color challenge. Beat the shrinking countdown timer, trigger Frenzy Mode, and build combos.',
    createFn: createColorMatchGame
  },
  {
    id: 'sky-dash',
    title: 'Sky Dash',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
    description: 'Endless flying impulse runner. Boost through narrow laser gates, weave past sentry drones, and collect gold rings.',
    createFn: createSkyDashGame
  },
  {
    id: 'bomb-escape',
    title: 'Bomb Escape',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="9"/><path d="m19.5 4.5 2-2"/><path d="m15.5 8.5 2-2"/><path d="M17 2h4v4"/></svg>`,
    description: 'Containment grid survival. Evade ticking explosive blast radii, use pillars for blast cover, and trigger freeze perks.',
    createFn: createBombEscapeGame
  },
  {
    id: 'moto-stunt',
    title: 'Moto Stunt Challenge',
    category: 'RACING',
    difficulty: 'Medium',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M9 17h6"/><path d="M12 17V8l4-4h4"/><path d="M7 14l5-6"/></svg>`,
    description: 'Physics trials motorbike. Launch off steep ramps, pull 360° backflips in mid-air, and stick safe wheel landings.',
    createFn: createMotoStuntGame
  }
];

// ==========================================
// 3. ARCADE HUB STATE & DOM
// ==========================================
let activeGame = null;
let activeGameId = null;
let isPaused = false;
let currentCategory = 'ALL';

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const gameCardsGrid = document.getElementById('gameCardsGrid');
const gameModal = document.getElementById('gameModal');
const gameCanvas = document.getElementById('gameCanvas');
const modalGameTitle = document.getElementById('modalGameTitle');
const modalGameCategory = document.getElementById('modalGameCategory');
const modalInstructions = document.getElementById('modalInstructions');
const virtualControls = document.getElementById('virtualControls');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const goScore = document.getElementById('goScore');
const goBest = document.getElementById('goBest');
const goStats = document.getElementById('goStats');
const leaderboardTableBody = document.getElementById('leaderboardTableBody');

// Controls & Audio toggles
const soundToggleBtn = document.getElementById('soundToggleBtn');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const modalTouchBtn = document.getElementById('modalTouchBtn');
const touchStatusLed = document.getElementById('touchStatusLed');
const modalSoundBtn = document.getElementById('modalSoundBtn');
const modalMusicBtn = document.getElementById('modalMusicBtn');
const modalPauseBtn = document.getElementById('modalPauseBtn');
const modalRestartBtn = document.getElementById('modalRestartBtn');
const modalBackBtn = document.getElementById('modalBackBtn');
const quickPlayBtn = document.getElementById('quickPlayBtn');
const heroPlayBtn = document.getElementById('heroPlayBtn');

// Device input detection & virtual controls persistence
let isTouchDeviceDetected = (typeof window !== 'undefined') && (
  ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
);

let virtualControlsEnabled = true;
try {
  const savedState = localStorage.getItem('neon_arcade_virtual_controls');
  if (savedState !== null) {
    virtualControlsEnabled = savedState === 'true';
  } else {
    virtualControlsEnabled = isTouchDeviceDetected;
  }
} catch (_) {
  virtualControlsEnabled = isTouchDeviceDetected;
}

function setVirtualControlsVisibility(visible, persist = true) {
  virtualControlsEnabled = visible;
  if (virtualControls) {
    if (visible) {
      virtualControls.classList.remove('hidden-controls');
    } else {
      virtualControls.classList.add('hidden-controls');
    }
  }
  if (touchStatusLed) {
    if (visible) {
      touchStatusLed.classList.add('active');
    } else {
      touchStatusLed.classList.remove('active');
    }
  }
  if (persist) {
    try {
      localStorage.setItem('neon_arcade_virtual_controls', visible ? 'true' : 'false');
    } catch (_) {}
  }
}

function initDeviceInputDetection() {
  const onTouchInputDetected = () => {
    isTouchDeviceDetected = true;
    if (!virtualControlsEnabled) {
      setVirtualControlsVisibility(true, true);
    }
  };

  window.addEventListener('touchstart', onTouchInputDetected, { passive: true });
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      onTouchInputDetected();
    }
  }, { passive: true });
}

// ==========================================
// 4. STORAGE HELPERS
// ==========================================
function getHighScore(gameId) {
  try {
    return parseInt(localStorage.getItem(`neon_arcade_hs_${gameId}`) || '0', 10);
  } catch (_) {
    return 0;
  }
}

function saveHighScore(gameId, score) {
  try {
    const current = getHighScore(gameId);
    if (score > current) {
      localStorage.setItem(`neon_arcade_hs_${gameId}`, score.toString());
      localStorage.setItem(`neon_arcade_date_${gameId}`, new Date().toISOString().split('T')[0]);
      return true;
    }
  } catch (_) {}
  return false;
}

function getScoreDate(gameId) {
  try {
    return localStorage.getItem(`neon_arcade_date_${gameId}`) || '—';
  } catch (_) {
    return '—';
  }
}

// ==========================================
// 5. RENDER GAME CARDS
// ==========================================
function renderGameCards() {
  if (!gameCardsGrid) return;
  gameCardsGrid.innerHTML = '';

  const filtered = currentCategory === 'ALL'
    ? GAMES
    : GAMES.filter(g => g.category === currentCategory);

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card group';
    card.setAttribute('role', 'article');
    card.setAttribute('data-id', game.id);

    const highScore = getHighScore(game.id);

    card.innerHTML = `
      <div class="card-glow-overlay"></div>
      <div class="card-inner">
        <div class="card-header">
          <div class="game-icon-badge">
            ${game.icon}
          </div>
          <div class="card-meta text-xs">
            <span class="difficulty-tag">${game.difficulty}</span>
            <span class="text-slate-500">·</span>
            <span class="category-tag">${game.category}</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="game-title">${game.title}</h3>
          <p class="game-description">${game.description}</p>
        </div>
        <div class="card-footer">
          <div class="best-score-display">
            <span class="best-label">BEST SCORE</span>
            <span class="best-value font-mono tabular-nums">${highScore.toLocaleString()}</span>
          </div>
          <button class="play-card-btn" data-game="${game.id}">
            <span>PLAY</span>
            <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    const playBtn = card.querySelector('.play-card-btn');
    playBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      launchGame(game.id);
    });

    card.addEventListener('click', () => {
      launchGame(game.id);
    });

    gameCardsGrid.appendChild(card);
  });
}

// ==========================================
// 6. RENDER LEADERBOARD
// ==========================================
function renderLeaderboard() {
  if (!leaderboardTableBody) return;
  leaderboardTableBody.innerHTML = '';

  // Sort games by their high scores
  const sorted = [...GAMES].sort((a, b) => getHighScore(b.id) - getHighScore(a.id));

  sorted.forEach((game, index) => {
    const tr = document.createElement('tr');
    tr.className = 'leaderboard-row';
    tr.setAttribute('role', 'button');
    tr.setAttribute('tabindex', '0');
    tr.setAttribute('aria-label', `Play ${game.title}`);

    // Premium rank badge
    let rankBadgeHtml = '';
    if (index === 0) {
      rankBadgeHtml = `<div class="rank-badge rank-1"><span class="rank-trophy">🥇</span><span class="rank-num">#1</span></div>`;
    } else if (index === 1) {
      rankBadgeHtml = `<div class="rank-badge rank-2"><span class="rank-trophy">🥈</span><span class="rank-num">#2</span></div>`;
    } else if (index === 2) {
      rankBadgeHtml = `<div class="rank-badge rank-3"><span class="rank-trophy">🥉</span><span class="rank-num">#3</span></div>`;
    } else {
      rankBadgeHtml = `<div class="rank-badge rank-other"><span class="rank-num">#${(index + 1).toString().padStart(2, '0')}</span></div>`;
    }

    const hs = getHighScore(game.id);
    const date = getScoreDate(game.id);

    tr.innerHTML = `
      <td>${rankBadgeHtml}</td>
      <td>
        <div class="leaderboard-game-cell">
          <div class="leaderboard-icon-box">
            ${game.icon}
          </div>
          <div class="leaderboard-title-group">
            <span class="leaderboard-title">${game.title}</span>
            <span class="leaderboard-tap-hint">Click to play</span>
          </div>
        </div>
      </td>
      <td class="hidden sm:table-cell">
        <span class="leaderboard-cat-tag">${game.category}</span>
      </td>
      <td>
        <span class="leaderboard-score-val">${hs > 0 ? hs.toLocaleString() : '—'}</span>
      </td>
      <td class="hidden md:table-cell">
        <span class="leaderboard-date-val">${date}</span>
      </td>
      <td class="text-right">
        <button class="leaderboard-play-btn" data-play-id="${game.id}">
          <span>PLAY</span>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </td>
    `;

    // Clicking ANYWHERE on the row or the game name launches the game!
    tr.addEventListener('click', () => {
      soundManager.init();
      soundManager.playBlip();
      launchGame(game.id);
    });

    tr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        soundManager.init();
        soundManager.playBlip();
        launchGame(game.id);
      }
    });

    const btn = tr.querySelector('.leaderboard-play-btn');
    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.init();
      soundManager.playBlip();
      launchGame(game.id);
    });

    leaderboardTableBody.appendChild(tr);
  });
}

// ==========================================
// 7. GAME LAUNCH & TEARDOWN
// ==========================================
function launchGame(gameId) {
  const meta = GAMES.find(g => g.id === gameId);
  if (!meta) return;

  // Cleanup existing active game
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
  }

  soundManager.init();
  activeGameId = gameId;
  isPaused = false;

  // Update Modal Header
  if (modalGameTitle) modalGameTitle.textContent = meta.title;
  if (modalGameCategory) modalGameCategory.textContent = `${meta.category} · ${meta.difficulty}`;
  if (modalPauseBtn) modalPauseBtn.innerHTML = '⏸️';

  // Show Modal
  gameModal.classList.remove('hidden');
  gameOverOverlay.classList.add('hidden');
  document.body.style.overflow = 'hidden';

  // Ensure canvas dimensions
  gameCanvas.width = 800;
  gameCanvas.height = 600;

  // Callbacks
  const callbacks = {
    onScoreUpdate(score) {
      // realtime score handled by game canvas HUD
    },
    onGameOver(result) {
      handleGameOver(meta, result);
    }
  };

  // Instantiate Game
  activeGame = meta.createFn(gameCanvas, soundManager, callbacks);

  // Setup instructions & virtual mobile buttons
  if (modalInstructions) {
    modalInstructions.textContent = activeGame.getInstructions();
  }

  setupVirtualControls(activeGame.getControlsConfig());

  // Start game
  activeGame.start();
}

function handleGameOver(gameMeta, result) {
  const isNewHigh = saveHighScore(gameMeta.id, result.score);
  renderGameCards();
  renderLeaderboard();

  // Populate Game Over Overlay
  goScore.textContent = result.score.toLocaleString();
  goBest.textContent = getHighScore(gameMeta.id).toLocaleString();
  if (isNewHigh) {
    goBest.innerHTML += ' <span class="text-amber-400 text-xs ml-2 font-bold animate-pulse">★ NEW RECORD!</span>';
  }

  // Populate stats list
  goStats.innerHTML = '';
  if (result.stats) {
    Object.entries(result.stats).forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'flex justify-between py-1 border-b border-slate-800 text-xs';
      row.innerHTML = `
        <span class="text-slate-400">${k}:</span>
        <span class="font-mono text-cyan-300 font-medium">${v}</span>
      `;
      goStats.appendChild(row);
    });
  }

  gameOverOverlay.classList.remove('hidden');
}

function setupVirtualControls(config) {
  if (!virtualControls) return;
  virtualControls.innerHTML = '';

  if (!config) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'virtual-controller-wrapper';

  // 1. LEFT WING: Standardized 4-Way Virtual D-Pad (only when required)
  if (config.dpad) {
    wrapper.classList.add('v-dual-pad');
    const dpadModule = document.createElement('div');
    dpadModule.className = 'v-dpad-module';
    dpadModule.innerHTML = `
      <div class="v-dpad-disc" id="vDpadDisc">
        <div class="v-dpad-cross">
          <button class="v-dpad-btn v-up" data-key="Up" aria-label="Up">
            <span class="v-arrow">▲</span>
            <span class="v-key-hint">W</span>
          </button>
          <button class="v-dpad-btn v-left" data-key="Left" aria-label="Left">
            <span class="v-arrow">◀</span>
            <span class="v-key-hint">A</span>
          </button>
          <button class="v-dpad-btn v-right" data-key="Right" aria-label="Right">
            <span class="v-arrow">▶</span>
            <span class="v-key-hint">D</span>
          </button>
          <button class="v-dpad-btn v-down" data-key="Down" aria-label="Down">
            <span class="v-arrow">▼</span>
            <span class="v-key-hint">S</span>
          </button>
        </div>
        <div class="v-dpad-center"></div>
      </div>
    `;

    setupDpadTouchInteraction(dpadModule);
    wrapper.appendChild(dpadModule);

    // 2. CENTER STATUS HUD (only for dual pad)
    const centerHud = document.createElement('div');
    centerHud.className = 'v-center-status';
    centerHud.innerHTML = `<span class="v-status-badge">TOUCH PAD</span>`;
    wrapper.appendChild(centerHud);
  } else {
    wrapper.classList.add('v-actions-only');
  }

  // 3. RIGHT WING: Action Buttons Cluster
  const actionsModule = document.createElement('div');
  actionsModule.className = 'v-actions-module';

  // Check if this is the Color Match game (6 colored pads)
  if (activeGameId === 'color-match') {
    const colorGrid = document.createElement('div');
    colorGrid.className = 'v-color-grid';
    const colorOptions = [
      { name: 'Red', hex: '#ef4444', key: '1' },
      { name: 'Blue', hex: '#3b82f6', key: '2' },
      { name: 'Green', hex: '#10b981', key: '3' },
      { name: 'Yellow', hex: '#f59e0b', key: '4' },
      { name: 'Purple', hex: '#8b5cf6', key: '5' },
      { name: 'Orange', hex: '#f97316', key: '6' }
    ];

    colorOptions.forEach((col, idx) => {
      const pad = document.createElement('button');
      pad.className = 'v-color-pad';
      pad.style.backgroundColor = col.hex;
      pad.style.borderColor = col.hex;
      pad.setAttribute('data-color-idx', idx);
      pad.innerHTML = `<span>${col.key}</span>`;
      bindActionButtonEvents(pad, `Color${idx + 1}`);
      colorGrid.appendChild(pad);
    });
    actionsModule.appendChild(colorGrid);
  } else if (config.buttons && config.buttons.length > 0) {
    config.buttons.forEach((btn) => {
      const b = document.createElement('button');
      
      let colorClass = 'v-btn-cyan';
      let keyHint = '[SPACE]';
      const codeLower = (btn.code || '').toLowerCase();

      if (codeLower.includes('kick') || codeLower.includes('heavy') || codeLower.includes('brake') || codeLower.includes('reload')) {
        colorClass = 'v-btn-magenta';
        keyHint = codeLower.includes('reload') ? '[R]' : (codeLower.includes('brake') ? '[S]' : '[K]');
      } else if (codeLower.includes('special') || codeLower.includes('bomb') || codeLower.includes('dash') || codeLower.includes('flip')) {
        colorClass = 'v-btn-amber';
        keyHint = codeLower.includes('bomb') ? '[B]' : (codeLower.includes('dash') ? '[SPACE]' : '[L]');
      } else if (codeLower.includes('block') || codeLower.includes('parry')) {
        colorClass = 'v-btn-emerald';
        keyHint = '[S]';
      } else {
        colorClass = 'v-btn-cyan';
        keyHint = codeLower.includes('punch') ? '[J]' : (codeLower.includes('slash') ? '[J]' : (codeLower.includes('gas') ? '[W]' : '[SPACE]'));
      }

      b.className = `v-action-btn ${colorClass}`;
      b.setAttribute('data-key', btn.code);
      b.innerHTML = `
        <span class="v-btn-label">${btn.label}</span>
        <span class="v-key-hint">${keyHint}</span>
      `;

      bindActionButtonEvents(b, btn.code);
      actionsModule.appendChild(b);
    });
  }

  wrapper.appendChild(actionsModule);
  virtualControls.appendChild(wrapper);

  // Apply current visibility state
  setVirtualControlsVisibility(virtualControlsEnabled, false);
}

function setupDpadTouchInteraction(dpadModule) {
  const disc = dpadModule.querySelector('#vDpadDisc');
  if (!disc) return;

  const btnUp = disc.querySelector('.v-up');
  const btnDown = disc.querySelector('.v-down');
  const btnLeft = disc.querySelector('.v-left');
  const btnRight = disc.querySelector('.v-right');

  let activeDirection = null;
  let activeTouchId = null;

  const setDirection = (newDir) => {
    if (newDir === activeDirection) return;

    if (activeDirection) {
      if (activeGame) activeGame.setVirtualKey(activeDirection, false);
      if (activeDirection === 'Up') btnUp?.classList.remove('active');
      if (activeDirection === 'Down') btnDown?.classList.remove('active');
      if (activeDirection === 'Left') btnLeft?.classList.remove('active');
      if (activeDirection === 'Right') btnRight?.classList.remove('active');
    }

    activeDirection = newDir;

    if (activeDirection) {
      if (navigator.vibrate) {
        try { navigator.vibrate(10); } catch (_) {}
      }
      if (activeGame) activeGame.setVirtualKey(activeDirection, true);
      if (activeDirection === 'Up') btnUp?.classList.add('active');
      if (activeDirection === 'Down') btnDown?.classList.add('active');
      if (activeDirection === 'Left') btnLeft?.classList.add('active');
      if (activeDirection === 'Right') btnRight?.classList.add('active');
    }
  };

  const handlePointerCoord = (clientX, clientY) => {
    const rect = disc.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      setDirection(null);
      return;
    }

    const angle = Math.atan2(dy, dx);
    const pi = Math.PI;

    if (angle >= -pi / 4 && angle <= pi / 4) {
      setDirection('Right');
    } else if (angle > pi / 4 && angle < (3 * pi) / 4) {
      setDirection('Down');
    } else if (angle >= (3 * pi) / 4 || angle <= -(3 * pi) / 4) {
      setDirection('Left');
    } else {
      setDirection('Up');
    }
  };

  disc.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    activeTouchId = touch.identifier;
    handlePointerCoord(touch.clientX, touch.clientY);
  }, { passive: false });

  disc.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        handlePointerCoord(touch.clientX, touch.clientY);
        break;
      }
    }
  }, { passive: false });

  const onTouchEnd = (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        activeTouchId = null;
        setDirection(null);
        break;
      }
    }
  };

  disc.addEventListener('touchend', onTouchEnd, { passive: false });
  disc.addEventListener('touchcancel', onTouchEnd, { passive: false });

  // Direct mouse clicks/taps for desktop testing
  [
    { el: btnUp, key: 'Up' },
    { el: btnDown, key: 'Down' },
    { el: btnLeft, key: 'Left' },
    { el: btnRight, key: 'Right' }
  ].forEach(({ el, key }) => {
    if (!el) return;
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      setDirection(key);
    });
    el.addEventListener('mouseup', (e) => {
      e.preventDefault();
      setDirection(null);
    });
    el.addEventListener('mouseleave', () => {
      if (activeDirection === key) setDirection(null);
    });
  });
}

function bindActionButtonEvents(element, code) {
  if (!element) return;

  const press = (e) => {
    e.preventDefault();
    element.classList.add('active');
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch (_) {}
    }
    if (activeGame) activeGame.setVirtualKey(code, true);
  };

  const release = (e) => {
    e.preventDefault();
    element.classList.remove('active');
    if (activeGame) activeGame.setVirtualKey(code, false);
  };

  element.addEventListener('mousedown', press);
  element.addEventListener('mouseup', release);
  element.addEventListener('mouseleave', release);

  element.addEventListener('touchstart', press, { passive: false });
  element.addEventListener('touchend', release, { passive: false });
  element.addEventListener('touchcancel', release, { passive: false });
}

function closeGameModal() {
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
  }
  activeGameId = null;
  gameModal.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

// ==========================================
// 8. EVENT LISTENERS & FILTER CONTROLS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize device input detection (auto-activates virtual gamepad on touch)
  initDeviceInputDetection();

  // Hide loading screen smoothly
  setTimeout(() => {
    if (loadingOverlay) {
      loadingOverlay.classList.add('opacity-0');
      setTimeout(() => loadingOverlay.remove(), 400);
    }
  }, 350);

  // Initial renders
  renderGameCards();
  renderLeaderboard();

  // Setup category filter buttons
  const filterBtns = document.querySelectorAll('.category-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      soundManager.init();
      soundManager.playBlip();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category') || 'ALL';
      renderGameCards();
    });
  });

  // Top header sound toggle
  soundToggleBtn?.addEventListener('click', () => {
    const isEnabled = soundManager.toggleSound();
    soundToggleBtn.innerHTML = `
      <span class="btn-icon">${isEnabled ? '🔊' : '🔇'}</span>
      <span class="btn-txt">${isEnabled ? 'SFX ON' : 'SFX MUTED'}</span>
    `;
    if (modalSoundBtn) modalSoundBtn.innerHTML = isEnabled ? '🔊' : '🔇';
  });

  // Top header music toggle
  musicToggleBtn?.addEventListener('click', () => {
    const isEnabled = soundManager.toggleMusic();
    musicToggleBtn.innerHTML = `
      <span class="btn-icon">${isEnabled ? '🎵' : '🎶'}</span>
      <span class="btn-txt">${isEnabled ? 'MUSIC ON' : 'MUSIC OFF'}</span>
    `;
    if (modalMusicBtn) modalMusicBtn.innerHTML = isEnabled ? '🎵' : '🎶';
  });

  // Modal Touch Controls toggle button
  modalTouchBtn?.addEventListener('click', () => {
    soundManager.init();
    soundManager.playBlip();
    setVirtualControlsVisibility(!virtualControlsEnabled, true);
  });

  // Modal Sound & Music buttons
  modalSoundBtn?.addEventListener('click', () => {
    const isEnabled = soundManager.toggleSound();
    modalSoundBtn.innerHTML = isEnabled ? '🔊' : '🔇';
    if (soundToggleBtn) {
      soundToggleBtn.innerHTML = `
        <span class="btn-icon">${isEnabled ? '🔊' : '🔇'}</span>
        <span class="btn-txt">${isEnabled ? 'SFX ON' : 'SFX MUTED'}</span>
      `;
    }
  });

  modalMusicBtn?.addEventListener('click', () => {
    const isEnabled = soundManager.toggleMusic();
    modalMusicBtn.innerHTML = isEnabled ? '🎵' : '🎶';
    if (musicToggleBtn) {
      musicToggleBtn.innerHTML = `
        <span class="btn-icon">${isEnabled ? '🎵' : '🎶'}</span>
        <span class="btn-txt">${isEnabled ? 'MUSIC ON' : 'MUSIC OFF'}</span>
      `;
    }
  });

  // Modal Pause / Resume
  modalPauseBtn?.addEventListener('click', () => {
    if (!activeGame) return;
    isPaused = !isPaused;
    if (isPaused) {
      activeGame.pause();
      modalPauseBtn.innerHTML = '▶️';
    } else {
      activeGame.resume();
      modalPauseBtn.innerHTML = '⏸️';
    }
  });

  // Modal Restart
  modalRestartBtn?.addEventListener('click', () => {
    if (!activeGame) return;
    gameOverOverlay.classList.add('hidden');
    isPaused = false;
    if (modalPauseBtn) modalPauseBtn.innerHTML = '⏸️';
    activeGame.restart();
  });

  // Modal Back to Arcade
  modalBackBtn?.addEventListener('click', () => {
    closeGameModal();
  });

  // Game Over Action Buttons
  document.getElementById('goPlayAgainBtn')?.addEventListener('click', () => {
    if (!activeGame) return;
    gameOverOverlay.classList.add('hidden');
    isPaused = false;
    activeGame.restart();
  });

  document.getElementById('goChangeGameBtn')?.addEventListener('click', () => {
    closeGameModal();
    const gamesSection = document.getElementById('gamesSection');
    gamesSection?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('goHomeBtn')?.addEventListener('click', () => {
    closeGameModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Quick Play / Hero Play
  quickPlayBtn?.addEventListener('click', () => {
    const rand = GAMES[Math.floor(Math.random() * GAMES.length)];
    launchGame(rand.id);
  });

  heroPlayBtn?.addEventListener('click', () => {
    launchGame(GAMES[0].id); // Turbo Rush
  });

  document.getElementById('heroExploreBtn')?.addEventListener('click', () => {
    document.getElementById('gamesSection')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Clear Leaderboard data option
  document.getElementById('clearLeaderboardBtn')?.addEventListener('click', () => {
    if (confirm('Reset all high scores to 0?')) {
      GAMES.forEach(g => {
        try {
          localStorage.removeItem(`neon_arcade_hs_${g.id}`);
          localStorage.removeItem(`neon_arcade_date_${g.id}`);
        } catch (_) {}
      });
      renderGameCards();
      renderLeaderboard();
    }
  });

  // Ambient Starfield Canvas in Background
  initAmbientBackground();
});

// Ambient subtle background canvas
function initAmbientBackground() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 1,
      color: Math.random() < 0.5 ? '#00f0ff' : '#ff007a',
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(loop);
  }
  loop();
}
