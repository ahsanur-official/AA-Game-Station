/**
 * AA GAME STATION — 100+ Arcade Games Collection
 * Master Arcade Controller, Audio Synthesizer, & Game Launcher
 */

import { MASTER_GAMES_CATALOG } from './games/game-catalog.js';
import { achievementManager, ACHIEVEMENTS } from './achievements.js';
import { gameStatsTracker } from './game-stats-tracker.js';

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

  playAchievementFanfare() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // High-energy, triumphant arpeggio fanfare for achievement unlocks
      const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      fanfareNotes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx >= fanfareNotes.length - 2 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);
        gain.gain.setValueAtTime(0.12, now + idx * 0.065);
        const duration = idx === fanfareNotes.length - 1 ? 0.5 : 0.22;
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.065);
        osc.stop(now + idx * 0.065 + duration);
      });
    } catch (_) {}
  }
}

const soundManager = new SoundEngine();
achievementManager.setSoundEngine(soundManager);

// Track achievements unlocked during current gameplay run
let runUnlockedAchievements = [];
achievementManager.subscribe((achievement, unlockedCount, totalCount) => {
  runUnlockedAchievements.push(achievement);
  updateAchievementsNavBadge(unlockedCount, totalCount);
});

// ==========================================
// 2. GAME CATALOG (101 ARCADE GAMES)
// ==========================================
const GAMES = MASTER_GAMES_CATALOG;

// ==========================================
// 2.1 GAME LEVEL DEFINITIONS & PRESETS
// ==========================================
export const GAME_LEVELS = [
  {
    level: 1,
    id: 'cadet',
    name: 'Cadet (Easy)',
    title: 'LEVEL 1 · CADET',
    shortName: 'CADET',
    tag: 'EASY',
    stars: '★☆☆☆☆',
    speedMultiplier: 0.8,
    scoreMultiplier: 1.0,
    healthBonus: 30,
    color: '#00ff88',
    glowColor: 'rgba(0, 255, 136, 0.4)',
    badgeClass: 'lvl-badge-cadet',
    icon: '🛡️',
    description: 'Relaxed speed, slower hazards & forgiving reaction times.',
    perkText: '+25% Extra Shield · Relaxed Pace'
  },
  {
    level: 2,
    id: 'veteran',
    name: 'Veteran (Normal)',
    title: 'LEVEL 2 · VETERAN',
    shortName: 'VETERAN',
    tag: 'NORMAL',
    recommended: true,
    stars: '★★★☆☆',
    speedMultiplier: 1.0,
    scoreMultiplier: 1.5,
    healthBonus: 0,
    color: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    badgeClass: 'lvl-badge-veteran',
    icon: '⚡',
    description: 'Authentic arcade challenge with balanced hazards.',
    perkText: 'Balanced Arcade Combat · 1.5x Multiplier'
  },
  {
    level: 3,
    id: 'master',
    name: 'Master (Hard)',
    title: 'LEVEL 3 · MASTER',
    shortName: 'MASTER',
    tag: 'HARD',
    stars: '★★★★☆',
    speedMultiplier: 1.28,
    scoreMultiplier: 2.0,
    healthBonus: -15,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    badgeClass: 'lvl-badge-master',
    icon: '🔥',
    description: 'Accelerated pace, dense hazards & double score multiplier.',
    perkText: '+30% Hazard Density · 2.0x Double Points'
  },
  {
    level: 4,
    id: 'nightmare',
    name: 'Nightmare (Insane)',
    title: 'LEVEL 4 · NIGHTMARE',
    shortName: 'NIGHTMARE',
    tag: 'INSANE',
    stars: '★★★★★',
    speedMultiplier: 1.6,
    scoreMultiplier: 3.0,
    healthBonus: -30,
    color: '#ff0055',
    glowColor: 'rgba(255, 0, 85, 0.4)',
    badgeClass: 'lvl-badge-nightmare',
    icon: '💀',
    description: 'Hyper overdrive! Relentless blitz for supreme masters.',
    perkText: 'Relentless Blitz · 3.0x Triple Points'
  }
];

// Level Selection State
let pendingGameId = null;
let currentSelectedLevel = 2; // Default to Veteran
let activeLevelConfig = GAME_LEVELS[1];

// ==========================================
// 3. ARCADE HUB STATE & DOM
// ==========================================
let activeGame = null;
let activeGameId = null;
let isPaused = false;
let currentCategory = 'ALL';
let searchQuery = '';
let sortMode = 'default';

// Favorites persisted in localStorage
let favorites = new Set();
try {
  const savedFavs = localStorage.getItem('aa_station_favs');
  if (savedFavs) {
    favorites = new Set(JSON.parse(savedFavs));
  }
} catch (_) {}

function toggleFavorite(gameId) {
  if (favorites.has(gameId)) {
    favorites.delete(gameId);
  } else {
    favorites.add(gameId);
  }
  try {
    localStorage.setItem('aa_station_favs', JSON.stringify([...favorites]));
  } catch (_) {}
  soundManager.init();
  soundManager.playBlip();
  achievementManager.recordFavoriteCount(favorites.size);
  renderGameCards();
}

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const gameCardsGrid = document.getElementById('gamesSection') || document.getElementById('gameCardsGrid');
const gameSearchInput = document.getElementById('gameSearchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const gameSortSelect = document.getElementById('gameSortSelect');
const gameCountBadge = document.getElementById('gameCountBadge');
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

// Level Select Modal Elements
const levelSelectModal = document.getElementById('levelSelectModal');
const lvlCloseBtn = document.getElementById('lvlCloseBtn');
const lvlGameIcon = document.getElementById('lvlGameIcon');
const lvlGameCategory = document.getElementById('lvlGameCategory');
const lvlBestScore = document.getElementById('lvlBestScore');
const lvlGameTitle = document.getElementById('lvlGameTitle');
const lvlGameDesc = document.getElementById('lvlGameDesc');
const lvlLaunchBtn = document.getElementById('lvlLaunchBtn');
const lvlLaunchBtnText = document.getElementById('lvlLaunchBtnText');
const lvlCancelBtn = document.getElementById('lvlCancelBtn');
const briefingLevelTitle = document.getElementById('briefingLevelTitle');
const briefingMult = document.getElementById('briefingMult');
const briefingSpeed = document.getElementById('briefingSpeed');
const briefingStars = document.getElementById('briefingStars');
const briefingPerk = document.getElementById('briefingPerk');
const modalLevelBtn = document.getElementById('modalLevelBtn');
const modalLevelIcon = document.getElementById('modalLevelIcon');
const modalLevelName = document.getElementById('modalLevelName');
const modalLevelMultiplier = document.getElementById('modalLevelMultiplier');
const goChangeLevelBtn = document.getElementById('goChangeLevelBtn');

// Achievement System DOM Elements
const achievementsNavBtn = document.getElementById('achievementsNavBtn');
const achievementsNavLink = document.getElementById('achievementsNavLink');
const achievementsNavCount = document.getElementById('achievementsNavCount');
const achievementsModal = document.getElementById('achievementsModal');
const achievementsCloseBtn = document.getElementById('achievementsCloseBtn');
const achievementsGrid = document.getElementById('achievementsGrid');
const achPercentText = document.getElementById('achPercentText');
const achCountText = document.getElementById('achCountText');
const goUnlockedAchievements = document.getElementById('goUnlockedAchievements');
const goAchList = document.getElementById('goAchList');

// Game Stats Tracker Telemetry DOM Elements
const telemetryGradeBadge = document.getElementById('telemetryGradeBadge');
const telemetryGradeTitle = document.getElementById('telemetryGradeTitle');
const telemetryTime = document.getElementById('telemetryTime');
const telemetryMoves = document.getElementById('telemetryMoves');
const telemetryAccuracy = document.getElementById('telemetryAccuracy');
const telemetryApm = document.getElementById('telemetryApm');

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
// 5. RENDER GAME CARDS (100+ GAMES SUPPORT)
// ==========================================
function renderGameCards() {
  if (!gameCardsGrid) return;
  gameCardsGrid.innerHTML = '';

  let filtered = [...GAMES];

  // Category filter
  if (currentCategory === 'FAVORITES') {
    filtered = filtered.filter(g => favorites.has(g.id));
  } else if (currentCategory !== 'ALL') {
    filtered = filtered.filter(g => g.category.toUpperCase() === currentCategory.toUpperCase());
  }

  // Live search query filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(g => 
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortMode === 'name') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortMode === 'score') {
    filtered.sort((a, b) => getHighScore(b.id) - getHighScore(a.id));
  } else if (sortMode === 'difficulty') {
    const diffScore = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Expert': 4 };
    filtered.sort((a, b) => (diffScore[b.difficulty] || 2) - (diffScore[a.difficulty] || 2));
  }

  // Update Game Count Badge
  if (gameCountBadge) {
    const numEl = gameCountBadge.querySelector('.count-num');
    if (numEl) {
      numEl.textContent = filtered.length;
    } else {
      gameCountBadge.innerHTML = `<span class="count-num">${filtered.length}</span> / ${GAMES.length} GAMES`;
    }
  }

  // Empty state when no games match search
  if (filtered.length === 0) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'empty-search-state col-span-full';
    emptyBox.innerHTML = `
      <div class="empty-icon">🎮</div>
      <h3>NO GAMES FOUND</h3>
      <p>No games matched "${searchQuery}". Try a different keyword or category.</p>
      <button id="resetSearchBtn" class="hero-secondary-btn reset-search-btn">SHOW ALL 101 GAMES</button>
    `;
    emptyBox.querySelector('#resetSearchBtn')?.addEventListener('click', () => {
      if (gameSearchInput) gameSearchInput.value = '';
      searchQuery = '';
      if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
      currentCategory = 'ALL';
      document.querySelectorAll('.category-filter-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-category') === 'ALL');
      });
      renderGameCards();
    });
    gameCardsGrid.appendChild(emptyBox);
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card group';
    card.setAttribute('role', 'article');
    card.setAttribute('data-id', game.id);
    card.setAttribute('data-category', game.category);

    const highScore = getHighScore(game.id);
    const isFav = favorites.has(game.id);
    const catClass = `pill-${game.category.toLowerCase()}`;

    card.innerHTML = `
      <div class="card-glow-overlay"></div>
      <div class="card-shimmer"></div>
      <div class="card-inner">
        <div class="card-header">
          <div class="game-icon-badge" role="button" title="Launch ${game.title}">
            ${game.icon}
          </div>
          <div class="card-header-right">
            <span class="category-pill ${catClass}">${game.category}</span>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-id="${game.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite">
              ${isFav ? '★' : '☆'}
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="card-meta" style="margin-bottom: 0.35rem;">
            <span class="difficulty-tag">${game.difficulty}</span>
            <span class="meta-dot">·</span>
            <span class="category-tag">100% Client-Side</span>
          </div>
          <h3 class="game-title clickable-title" data-game="${game.id}" role="button" tabindex="0" title="Click to Play ${game.title}">
            ${game.title}
          </h3>
          <p class="game-description">${game.description}</p>
        </div>
        <div class="card-footer">
          <div class="best-score-display">
            <span class="best-label">RECORD</span>
            <span class="best-value font-mono tabular-nums">${highScore.toLocaleString()}</span>
          </div>
          <button class="play-card-btn big-play-btn" data-game="${game.id}" aria-label="Play ${game.title}">
            <span class="play-txt">PLAY GAME</span>
            <svg class="play-arrow-svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    `;

    // 1. Click on Title launches level selector for this game
    const titleEl = card.querySelector('.game-title');
    titleEl?.addEventListener('click', (e) => {
      e.stopPropagation();
      openLevelSelectModal(game.id);
    });

    // 2. Click on Play Button launches level selector for this game
    const playBtn = card.querySelector('.play-card-btn');
    playBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      openLevelSelectModal(game.id);
    });

    // 3. Click on Icon Badge launches level selector for this game
    const iconBadge = card.querySelector('.game-icon-badge');
    iconBadge?.addEventListener('click', (e) => {
      e.stopPropagation();
      openLevelSelectModal(game.id);
    });

    // 4. Click on Favorite Star toggles favorite
    const favBtn = card.querySelector('.card-fav-btn');
    favBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(game.id);
    });

    // 5. Click anywhere else on the card also launches level selector
    card.addEventListener('click', () => {
      openLevelSelectModal(game.id);
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
        openLevelSelectModal(game.id);
      }
    });

    const btn = tr.querySelector('.leaderboard-play-btn');
    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.init();
      soundManager.playBlip();
      openLevelSelectModal(game.id);
    });

    leaderboardTableBody.appendChild(tr);
  });
}

// ==========================================
// 6.5 LEVEL SELECTION MODAL CONTROLLER
// ==========================================
function openLevelSelectModal(gameId, preferredLevel = null) {
  const meta = GAMES.find(g => g.id === gameId);
  if (!meta) return;

  pendingGameId = gameId;

  // Retrieve saved preference or default to 2 (Veteran)
  let savedLevel = preferredLevel;
  if (!savedLevel) {
    try {
      const saved = localStorage.getItem(`neon_arcade_lvl_${gameId}`);
      if (saved) savedLevel = parseInt(saved, 10);
    } catch (_) {}
  }
  if (!savedLevel || savedLevel < 1 || savedLevel > 4) {
    savedLevel = 2;
  }

  // Populate game preview
  if (lvlGameIcon) lvlGameIcon.innerHTML = meta.icon;
  if (lvlGameTitle) lvlGameTitle.textContent = meta.title;
  if (lvlGameCategory) lvlGameCategory.textContent = meta.category;
  if (lvlGameDesc) lvlGameDesc.textContent = meta.description;
  if (lvlBestScore) lvlBestScore.textContent = getHighScore(meta.id).toLocaleString();

  selectLevel(savedLevel, false);

  if (levelSelectModal) {
    levelSelectModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  soundManager.init();
  soundManager.playBlip();
}

function closeLevelSelectModal() {
  if (levelSelectModal) {
    levelSelectModal.classList.add('hidden');
    if (!activeGame) {
      document.body.style.overflow = '';
    }
  }
}

function selectLevel(levelNum, playFeedback = true) {
  const lvlIdx = Math.max(1, Math.min(4, levelNum)) - 1;
  const lvlConfig = GAME_LEVELS[lvlIdx];
  currentSelectedLevel = lvlConfig.level;

  // Update card selections
  document.querySelectorAll('.level-card').forEach(card => {
    const cardLvl = parseInt(card.getAttribute('data-level') || '1', 10);
    const isSelected = cardLvl === lvlConfig.level;
    card.classList.toggle('selected', isSelected);
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  // Update briefing box
  if (briefingLevelTitle) {
    briefingLevelTitle.textContent = lvlConfig.title;
    briefingLevelTitle.style.color = lvlConfig.color;
    briefingLevelTitle.style.textShadow = `0 0 12px ${lvlConfig.glowColor}`;
  }
  if (briefingMult) briefingMult.textContent = `${lvlConfig.scoreMultiplier}x Multiplier`;
  if (briefingSpeed) briefingSpeed.textContent = `${lvlConfig.speedMultiplier}x Velocity`;
  if (briefingStars) briefingStars.textContent = `${lvlConfig.stars} ${lvlConfig.tag}`;
  if (briefingPerk) briefingPerk.textContent = lvlConfig.perkText;

  // Update Launch button text
  if (lvlLaunchBtnText) {
    lvlLaunchBtnText.textContent = `START MISSION (${lvlConfig.shortName})`;
  }

  // Update modal dialog border glow color
  const dialog = document.querySelector('.level-select-dialog');
  if (dialog) {
    dialog.style.borderColor = `${lvlConfig.color}66`;
    dialog.style.boxShadow = `0 0 50px rgba(0, 0, 0, 0.8), 0 0 35px ${lvlConfig.glowColor}, inset 0 0 20px ${lvlConfig.glowColor}`;
  }

  if (playFeedback) {
    soundManager.init();
    const notes = [392, 523, 659, 784];
    soundManager.playSynthNote(notes[lvlIdx] || 523, 0.08, 'triangle', 0.05);
  }
}

function confirmAndLaunchGame() {
  if (!pendingGameId) return;
  const lvlIdx = currentSelectedLevel - 1;
  const levelConfig = GAME_LEVELS[lvlIdx] || GAME_LEVELS[1];

  try {
    localStorage.setItem(`neon_arcade_lvl_${pendingGameId}`, currentSelectedLevel.toString());
  } catch (_) {}

  closeLevelSelectModal();
  soundManager.playPowerup();
  launchGame(pendingGameId, levelConfig);
}

// ==========================================
// 7. GAME LAUNCH & TEARDOWN
// ==========================================
function launchGame(gameId, levelConfig = null) {
  const meta = GAMES.find(g => g.id === gameId);
  if (!meta) return;

  // Cleanup existing active game
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
  }

  const chosenLevel = levelConfig || GAME_LEVELS[currentSelectedLevel - 1] || GAME_LEVELS[1];
  activeLevelConfig = chosenLevel;

  soundManager.init();
  activeGameId = gameId;
  isPaused = false;

  // Update Modal Header
  if (modalGameTitle) modalGameTitle.textContent = meta.title;
  if (modalGameCategory) modalGameCategory.textContent = `${meta.category} · LVL ${chosenLevel.level}: ${chosenLevel.shortName}`;
  if (modalPauseBtn) modalPauseBtn.innerHTML = '⏸️';

  // Update In-Game Level Pill
  if (modalLevelBtn) {
    modalLevelBtn.style.borderColor = chosenLevel.color;
    modalLevelBtn.style.color = chosenLevel.color;
    modalLevelBtn.style.boxShadow = `0 0 14px ${chosenLevel.glowColor}`;
  }
  if (modalLevelIcon) modalLevelIcon.textContent = chosenLevel.icon;
  if (modalLevelName) modalLevelName.textContent = `LVL ${chosenLevel.level} · ${chosenLevel.shortName}`;
  if (modalLevelMultiplier) {
    modalLevelMultiplier.textContent = `${chosenLevel.scoreMultiplier}x`;
    modalLevelMultiplier.style.backgroundColor = `${chosenLevel.color}33`;
  }

  // Dynamic ambient halo matching game genre
  const themeColors = {
    RACING: '#00f0ff',
    FIGHTING: '#ff007a',
    ACTION: '#f43f5e',
    ARCADE: '#a855f7',
    RETRO: '#00ff88',
    PUZZLE: '#0ea5e9',
    SKILL: '#ec4899',
    SPORTS: '#22c55e',
    BRAIN: '#eab308'
  };
  const ambientCol = themeColors[meta.category] || chosenLevel.color || '#00f0ff';
  const canvasWrap = document.querySelector('.canvas-wrapper');
  if (canvasWrap) {
    canvasWrap.style.boxShadow = `0 0 60px rgba(0, 0, 0, 0.95), 0 0 45px ${ambientCol}44, inset 0 0 25px ${ambientCol}22`;
    canvasWrap.style.borderColor = `${ambientCol}88`;
  }

  // Update modal record badge
  const hs = getHighScore(meta.id);
  const modalRecordVal = document.getElementById('modalBestScore');
  if (modalRecordVal) {
    modalRecordVal.textContent = hs > 0 ? hs.toLocaleString() : '0';
  }

  // Show Modal
  gameModal.classList.remove('hidden');
  gameOverOverlay.classList.add('hidden');
  document.body.style.overflow = 'hidden';

  // Ensure canvas dimensions
  gameCanvas.width = 800;
  gameCanvas.height = 600;

  // Reset run-specific achievements and record game launched
  runUnlockedAchievements = [];
  achievementManager.recordGameLaunched(gameId);

  // Initialize session stats tracker for this game instance
  gameStatsTracker.startSession(gameId, chosenLevel);

  // Callbacks
  const callbacks = {
    onScoreUpdate(score, extra = {}) {
      // Realtime milestone checks during gameplay (e.g. 1000 points reached)
      achievementManager.checkRealtimeScore(score, chosenLevel);
      if (extra && extra.combo) {
        achievementManager.checkCombo(extra.combo);
        gameStatsTracker.recordCombo(extra.combo);
      }
      if (extra && extra.hit) {
        gameStatsTracker.recordHit(extra.hit);
      }
      if (extra && extra.miss) {
        gameStatsTracker.recordMiss(extra.miss);
      }
    },
    onGameOver(result) {
      handleGameOver(meta, result);
    }
  };

  // Instantiate Game with chosen level
  activeGame = meta.createFn(gameCanvas, soundManager, callbacks, chosenLevel);

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

  // Conclude game stats tracker session
  const sessionStats = gameStatsTracker.endSession({
    finalScore: result.score,
    stats: result.stats,
    extra: result.extra || {}
  });

  // Populate Session Telemetry in Post-Game Summary
  if (telemetryTime) telemetryTime.textContent = sessionStats.timePlayedFormatted;
  if (telemetryMoves) telemetryMoves.textContent = sessionStats.totalMoves.toLocaleString();
  if (telemetryAccuracy) telemetryAccuracy.textContent = `${sessionStats.accuracyPercentage}%`;
  if (telemetryApm) telemetryApm.textContent = `${sessionStats.apm} APM`;
  if (telemetryGradeBadge && sessionStats.performanceGrade) {
    telemetryGradeBadge.textContent = sessionStats.performanceGrade.letter;
    telemetryGradeBadge.style.color = sessionStats.performanceGrade.color;
    telemetryGradeBadge.style.borderColor = sessionStats.performanceGrade.color;
    telemetryGradeBadge.style.boxShadow = `0 0 16px ${sessionStats.performanceGrade.glow}`;
  }
  if (telemetryGradeTitle && sessionStats.performanceGrade) {
    telemetryGradeTitle.textContent = sessionStats.performanceGrade.title;
    telemetryGradeTitle.style.color = sessionStats.performanceGrade.color;
  }

  // Populate Game Over Overlay
  goScore.textContent = result.score.toLocaleString();
  goBest.textContent = getHighScore(gameMeta.id).toLocaleString();
  if (isNewHigh) {
    goBest.innerHTML += ' <span class="text-amber-400 text-xs ml-2 font-bold animate-pulse">★ NEW RECORD!</span>';
  }

  // Populate stats list with level info
  goStats.innerHTML = '';

  if (activeLevelConfig) {
    const lvlRow = document.createElement('div');
    lvlRow.className = 'flex justify-between py-1 border-b border-slate-800 text-xs';
    lvlRow.innerHTML = `
      <span class="text-slate-400">Mission Level:</span>
      <span class="font-mono font-bold" style="color: ${activeLevelConfig.color}">Level ${activeLevelConfig.level} (${activeLevelConfig.shortName}) · ${activeLevelConfig.scoreMultiplier}x</span>
    `;
    goStats.appendChild(lvlRow);
  }

  if (result.stats) {
    if (Array.isArray(result.stats)) {
      result.stats.forEach(item => {
        if (item.label === 'Mission Level' || item.label === 'Score Multiplier') return;
        const row = document.createElement('div');
        row.className = 'flex justify-between py-1 border-b border-slate-800 text-xs';
        row.innerHTML = `
          <span class="text-slate-400">${item.label}:</span>
          <span class="font-mono text-cyan-300 font-medium">${item.value}</span>
        `;
        goStats.appendChild(row);
      });
    } else {
      Object.entries(result.stats).forEach(([k, v]) => {
        if (k === 'Mission Level' || k === 'Score Multiplier') return;
        const row = document.createElement('div');
        row.className = 'flex justify-between py-1 border-b border-slate-800 text-xs';
        row.innerHTML = `
          <span class="text-slate-400">${k}:</span>
          <span class="font-mono text-cyan-300 font-medium">${v}</span>
        `;
        goStats.appendChild(row);
      });
    }
  }

  // Check game over milestones (no damage, combos, survival time, levels, etc.)
  achievementManager.checkGameOverMilestones({
    score: result.score,
    stats: result.stats,
    extra: result.extra || {},
    levelConfig: activeLevelConfig
  });

  // Render any new milestones unlocked in this run
  if (goUnlockedAchievements && goAchList) {
    if (runUnlockedAchievements.length > 0) {
      goAchList.innerHTML = '';
      runUnlockedAchievements.forEach(ach => {
        const item = document.createElement('div');
        item.className = 'go-ach-item';
        item.innerHTML = `
          <span class="go-ach-icon">${ach.icon}</span>
          <div class="go-ach-info">
            <div class="go-ach-title">${ach.title} (+${ach.xp} XP)</div>
            <div class="go-ach-desc">${ach.desc}</div>
          </div>
          <span class="ach-badge-pill" style="color: ${ach.color}; border-color: ${ach.color}66; background: ${ach.color}15">
            ${ach.badge}
          </span>
        `;
        goAchList.appendChild(item);
      });
      goUnlockedAchievements.classList.remove('hidden');
    } else {
      goUnlockedAchievements.classList.add('hidden');
    }
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

    gameStatsTracker.recordMove('dpad');

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
    gameStatsTracker.recordMove('actions');
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
  closeLevelSelectModal();
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

  // Live Search input
  gameSearchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    if (clearSearchBtn) {
      if (searchQuery.trim().length > 0) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }
    }
    renderGameCards();
  });

  clearSearchBtn?.addEventListener('click', () => {
    if (gameSearchInput) gameSearchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderGameCards();
  });

  // Sort dropdown
  gameSortSelect?.addEventListener('change', (e) => {
    sortMode = e.target.value;
    renderGameCards();
  });

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

  // Modal CRT scanline toggle
  const modalCrtBtn = document.getElementById('modalCrtBtn');
  modalCrtBtn?.addEventListener('click', () => {
    soundManager.init();
    soundManager.playBlip();
    const crt = document.getElementById('crtOverlay');
    if (crt) {
      const isHidden = crt.classList.toggle('hidden');
      modalCrtBtn.classList.toggle('active', !isHidden);
      if (!isHidden) {
        achievementManager.recordCrtToggled();
      }
    }
  });

  // Modal Fullscreen Arena toggle
  const modalFullscreenBtn = document.getElementById('modalFullscreenBtn');
  modalFullscreenBtn?.addEventListener('click', () => {
    soundManager.init();
    soundManager.playBlip();
    const isFull = gameModal.classList.toggle('fullscreen-arena');
    modalFullscreenBtn.classList.toggle('active', isFull);
    if (isFull) {
      achievementManager.recordFullscreenToggled();
      if (!document.fullscreenElement) {
        gameModal.requestFullscreen?.().catch(() => {});
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  });

  // Global Keyboard Shortcut: Press '/' to jump into search box, track game moves
  window.addEventListener('keydown', (e) => {
    if (activeGame && !isPaused) {
      gameStatsTracker.recordMove('keys');
    }
    if (e.key === '/' && document.activeElement !== gameSearchInput && !activeGame) {
      e.preventDefault();
      gameSearchInput?.focus();
      gameSearchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  gameCanvas?.addEventListener('pointerdown', () => {
    if (activeGame && !isPaused) {
      gameStatsTracker.recordMove('pointer');
    }
  });

  // Modal Pause / Resume
  modalPauseBtn?.addEventListener('click', () => {
    if (!activeGame) return;
    isPaused = !isPaused;
    if (isPaused) {
      gameStatsTracker.pauseSession();
      activeGame.pause();
      modalPauseBtn.innerHTML = '▶️';
    } else {
      gameStatsTracker.resumeSession();
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
    gameStatsTracker.startSession(activeGameId, activeLevelConfig);
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
    gameStatsTracker.startSession(activeGameId, activeLevelConfig);
    activeGame.restart();
  });

  document.getElementById('goChangeLevelBtn')?.addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    if (activeGameId) {
      openLevelSelectModal(activeGameId, activeLevelConfig ? activeLevelConfig.level : 2);
    }
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

  // Quick Play / Hero Play (now prompts Level Selector first!)
  quickPlayBtn?.addEventListener('click', () => {
    const rand = GAMES[Math.floor(Math.random() * GAMES.length)];
    openLevelSelectModal(rand.id);
  });

  heroPlayBtn?.addEventListener('click', () => {
    const rand = GAMES[Math.floor(Math.random() * GAMES.length)];
    openLevelSelectModal(rand.id);
  });

  document.getElementById('heroExploreBtn')?.addEventListener('click', () => {
    document.getElementById('gamesSection')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Initialize Game Level Select Modal handlers
  initLevelSelectModal();

  // Initialize Achievements & Trophy Room System
  initAchievementsSystem();

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

  // Initialize Featured Spotlight Carousel & Live Screen Preview
  initSpotlightFeature();

  // Ambient Starfield & Constellation Canvas in Background
  initAmbientBackground();
});

// ==========================================
// 8.5 LEVEL SELECT MODAL EVENT BINDINGS
// ==========================================
function initLevelSelectModal() {
  // Level card clicks & keyboard focus
  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
      const lvl = parseInt(card.getAttribute('data-level') || '1', 10);
      selectLevel(lvl, true);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const lvl = parseInt(card.getAttribute('data-level') || '1', 10);
        selectLevel(lvl, true);
      }
    });
  });

  // Launch button
  lvlLaunchBtn?.addEventListener('click', () => {
    confirmAndLaunchGame();
  });

  // Cancel button
  lvlCancelBtn?.addEventListener('click', () => {
    soundManager.init();
    soundManager.playBlip();
    closeLevelSelectModal();
  });

  // Close X button
  lvlCloseBtn?.addEventListener('click', () => {
    soundManager.init();
    soundManager.playBlip();
    closeLevelSelectModal();
  });

  // Backdrop click to close
  levelSelectModal?.addEventListener('click', (e) => {
    if (e.target === levelSelectModal) {
      closeLevelSelectModal();
    }
  });

  // In-Game Level pill in arena header
  modalLevelBtn?.addEventListener('click', () => {
    if (activeGameId) {
      openLevelSelectModal(activeGameId, activeLevelConfig ? activeLevelConfig.level : 2);
    }
  });

  // Global keyboard shortcuts for Level Select Modal
  window.addEventListener('keydown', (e) => {
    if (levelSelectModal && !levelSelectModal.classList.contains('hidden')) {
      if (e.key === '1') {
        e.preventDefault();
        selectLevel(1, true);
      } else if (e.key === '2') {
        e.preventDefault();
        selectLevel(2, true);
      } else if (e.key === '3') {
        e.preventDefault();
        selectLevel(3, true);
      } else if (e.key === '4') {
        e.preventDefault();
        selectLevel(4, true);
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (document.activeElement !== lvlCancelBtn && document.activeElement !== lvlCloseBtn) {
          e.preventDefault();
          confirmAndLaunchGame();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeLevelSelectModal();
      }
    }
  });
}

// ==========================================
// 8.6 ACHIEVEMENTS & TROPHY ROOM CONTROLLER
// ==========================================
let activeAchievementsFilter = 'all';

function updateAchievementsNavBadge(unlocked = null, total = null) {
  const u = unlocked !== null ? unlocked : achievementManager.getUnlockedCount();
  const t = total !== null ? total : achievementManager.getTotalCount();
  if (achievementsNavCount) {
    achievementsNavCount.textContent = `${u}/${t}`;
  }
}

function openAchievementsModal(filter = 'all') {
  activeAchievementsFilter = filter;
  renderAchievementsModal();
  if (achievementsModal) {
    achievementsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  soundManager.init();
  soundManager.playBlip();
}

function closeAchievementsModal() {
  if (achievementsModal) {
    achievementsModal.classList.add('hidden');
    if (!activeGame && (!levelSelectModal || levelSelectModal.classList.contains('hidden'))) {
      document.body.style.overflow = '';
    }
  }
}

function renderAchievementsModal() {
  if (!achievementsGrid) return;
  achievementsGrid.innerHTML = '';

  const all = achievementManager.getAllAchievements();
  const unlockedCount = achievementManager.getUnlockedCount();
  const totalCount = achievementManager.getTotalCount();
  const percent = achievementManager.getProgressPercentage();

  if (achPercentText) achPercentText.textContent = `${percent}%`;
  if (achCountText) achCountText.textContent = `${unlockedCount} / ${totalCount} UNLOCKED`;

  // Update filter buttons
  document.querySelectorAll('.ach-tab-btn').forEach(btn => {
    const tab = btn.getAttribute('data-tab');
    btn.classList.toggle('active', tab === activeAchievementsFilter);
    if (tab === 'all') btn.textContent = `ALL (${totalCount})`;
    if (tab === 'unlocked') btn.textContent = `UNLOCKED (${unlockedCount})`;
    if (tab === 'locked') btn.textContent = `LOCKED (${totalCount - unlockedCount})`;
  });

  let filtered = all;
  if (activeAchievementsFilter === 'unlocked') {
    filtered = all.filter(a => a.unlocked);
  } else if (activeAchievementsFilter === 'locked') {
    filtered = all.filter(a => !a.unlocked);
  }

  if (filtered.length === 0) {
    achievementsGrid.innerHTML = `
      <div class="col-span-full py-8 text-center text-slate-400">
        <div class="text-3xl mb-2">🏆</div>
        <p class="font-display text-sm font-semibold">NO ACHIEVEMENTS IN THIS FILTER</p>
      </div>
    `;
    return;
  }

  filtered.forEach(ach => {
    const card = document.createElement('div');
    card.className = `ach-card ${ach.unlocked ? 'unlocked' : 'locked'}`;

    const dateStr = ach.unlockedAt ? new Date(ach.unlockedAt).toLocaleDateString() : '';

    card.innerHTML = `
      <div class="ach-card-icon" style="border-color: ${ach.color}; color: ${ach.color}; box-shadow: ${ach.unlocked ? `0 0 14px ${ach.color}44` : 'none'}">
        ${ach.unlocked ? ach.icon : '🔒'}
      </div>
      <div class="ach-card-body">
        <div class="ach-card-top">
          <h4 class="ach-card-title">${ach.title}</h4>
          <span class="ach-badge-pill" style="color: ${ach.color}; border-color: ${ach.color}66; background: ${ach.color}15">
            ${ach.badge}
          </span>
        </div>
        <p class="ach-card-desc">${ach.desc}</p>
        <div class="ach-card-footer">
          ${ach.unlocked 
            ? `<span class="ach-status-unlocked">✓ UNLOCKED ${dateStr ? `· ${dateStr}` : ''}</span>`
            : `<span class="ach-status-locked">🔒 LOCKED</span>`
          }
          <span class="ach-xp-tag">+${ach.xp} XP</span>
        </div>
      </div>
    `;

    achievementsGrid.appendChild(card);
  });
}

function initAchievementsSystem() {
  updateAchievementsNavBadge();

  // Navigation Trophy Buttons
  achievementsNavBtn?.addEventListener('click', () => {
    openAchievementsModal('all');
  });

  achievementsNavLink?.addEventListener('click', () => {
    openAchievementsModal('all');
  });

  // Modal Close Button
  achievementsCloseBtn?.addEventListener('click', () => {
    soundManager.init();
    soundManager.playBlip();
    closeAchievementsModal();
  });

  // Backdrop click
  achievementsModal?.addEventListener('click', (e) => {
    if (e.target === achievementsModal) {
      closeAchievementsModal();
    }
  });

  // Filter tabs
  document.querySelectorAll('.ach-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundManager.init();
      soundManager.playBlip();
      const tab = btn.getAttribute('data-tab') || 'all';
      activeAchievementsFilter = tab;
      renderAchievementsModal();
    });
  });

  // Global keydown: Escape closes achievements modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && achievementsModal && !achievementsModal.classList.contains('hidden')) {
      e.preventDefault();
      closeAchievementsModal();
    }
  });
}

// ==========================================
// 9. FEATURED ARCADE SPOTLIGHT & LIVE PREVIEW
// ==========================================
function initSpotlightFeature() {
  const SPOTLIGHT_GAMES = [
    {
      id: 'racing',
      title: 'TURBO RUSH — 2088 NEON RACER',
      genre: 'RACING · HIGH OCTANE',
      desc: 'High-speed sci-fi highway racer. Weave through dynamic cyber traffic, collect score tokens, and ignite nitro afterburners.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.3V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
      theme: '#00f0ff'
    },
    {
      id: 'fighting',
      title: 'STREET FIGHTER ARENA',
      genre: 'FIGHTING · MARTIAL COMBAT',
      desc: '1v1 cybernetic martial arts clash. Execute explosive combos, power uppercuts, fireballs, and defensive parries.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M18 11l-4-4"/><path d="m21.5 4.5-7 7"/><path d="m14.5 12.5 2 2"/></svg>`,
      theme: '#ff007a'
    },
    {
      id: 'space',
      title: 'SPACE DEFENDER — GALAXY STRIKE',
      genre: 'ACTION · RETRO SHMUP',
      desc: 'Intergalactic vertical shooter. Dodge dense asteroid clusters, blast enemy squadrons, and defeat dreadnought bosses.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.5 7h-7z"/><path d="M12 9v13"/><path d="m5 16 7-3 7 3-7 6z"/></svg>`,
      theme: '#38bdf8'
    },
    {
      id: 'zombie',
      title: 'ZOMBIE BIO-LAB DEFENSE',
      genre: 'ACTION · SURVIVAL SHOOTER',
      desc: 'Top-down survival battle. Eliminate mutating pathogen swarms with rapid-fire assault rifles and plasma traps.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/><circle cx="12" cy="12" r="3"/></svg>`,
      theme: '#22c55e'
    },
    {
      id: 'knight',
      title: 'CYBER KNIGHT: SHADOW DUNGEON',
      genre: 'ARCADE · DUNGEON CRAWLER',
      desc: 'Hack-and-slash rogue platformer. Slay dungeon minions, discover enchanted chests, and battle skeleton bosses.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 5 5"/><path d="m19 21 2-2"/></svg>`,
      theme: '#a855f7'
    }
  ];

  let activeIndex = 0;
  let autoTimer = null;

  const iconBox = document.getElementById('spotlightIconBox');
  const titleEl = document.getElementById('spotlightTitle');
  const genreEl = document.getElementById('spotlightGenreTag');
  const descEl = document.getElementById('spotlightDesc');
  const playBtn = document.getElementById('spotlightPlayBtn');
  const dots = document.querySelectorAll('.spotlight-dot');
  const prevBtn = document.getElementById('spotlightPrevBtn');
  const nextBtn = document.getElementById('spotlightNextBtn');
  const spotCard = document.getElementById('heroSpotlight');

  function updateSpotlight(index) {
    activeIndex = (index + SPOTLIGHT_GAMES.length) % SPOTLIGHT_GAMES.length;
    const item = SPOTLIGHT_GAMES[activeIndex];

    if (iconBox) {
      iconBox.innerHTML = item.icon;
      iconBox.style.color = item.theme;
      iconBox.style.borderColor = `${item.theme}66`;
      iconBox.style.boxShadow = `0 0 20px ${item.theme}44`;
    }
    if (titleEl) titleEl.textContent = item.title;
    if (genreEl) {
      genreEl.textContent = item.genre;
      genreEl.style.color = item.theme;
    }
    if (descEl) descEl.textContent = item.desc;
    if (playBtn) playBtn.setAttribute('data-game', item.id);

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activeIndex);
    });
  }

  // Navigation handlers
  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    soundManager.init();
    soundManager.playBlip();
    updateSpotlight(activeIndex - 1);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    soundManager.init();
    soundManager.playBlip();
    updateSpotlight(activeIndex + 1);
  });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      updateSpotlight(idx);
    });
  });

  playBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const gameId = playBtn.getAttribute('data-game') || 'racing';
    openLevelSelectModal(gameId);
  });

  // Auto-advance spotlight every 6.5s
  function startAutoAdvance() {
    stopAutoAdvance();
    autoTimer = setInterval(() => {
      updateSpotlight(activeIndex + 1);
    }, 6500);
  }

  function stopAutoAdvance() {
    if (autoTimer) clearInterval(autoTimer);
  }

  spotCard?.addEventListener('mouseenter', stopAutoAdvance);
  spotCard?.addEventListener('mouseleave', startAutoAdvance);
  startAutoAdvance();

  // Run live animated preview canvas
  initSpotlightPreviewCanvas(() => activeIndex);
}

// Live Mini Canvas Preview inside Spotlight
function initSpotlightPreviewCanvas(getActiveIndex) {
  const canvas = document.getElementById('spotlightCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  let tick = 0;

  function previewLoop() {
    tick++;
    ctx.fillStyle = '#050813';
    ctx.fillRect(0, 0, w, h);

    const mode = getActiveIndex();

    if (mode === 0) {
      // Racing preview: scrolling road & player car
      ctx.strokeStyle = '#00f0ff33';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.25, 0); ctx.lineTo(w * 0.25, h);
      ctx.moveTo(w * 0.75, 0); ctx.lineTo(w * 0.75, h);
      ctx.stroke();

      // Road dash
      ctx.strokeStyle = '#ffffff55';
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -tick * 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, 0); ctx.lineTo(w * 0.5, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Car
      const carX = w * 0.5 + Math.sin(tick * 0.05) * 22;
      const carY = h * 0.65;
      ctx.fillStyle = '#ff007a';
      ctx.shadowColor = '#ff007a';
      ctx.shadowBlur = 8;
      ctx.fillRect(carX - 6, carY - 12, 12, 24);
      // Flame
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(carX - 3, carY + 12, 6, 6 + Math.random() * 5);
      ctx.shadowBlur = 0;
    } else if (mode === 1) {
      // Fighting preview: 2 fighters and sparks
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, h - 14, w, 14);

      // Fighter Left
      const p1Punch = Math.sin(tick * 0.1) > 0.4 ? 6 : 0;
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(w * 0.3 - 6, h - 45, 12, 30);
      if (p1Punch) {
        ctx.fillRect(w * 0.3 + 6, h - 38, 12, 5);
      }

      // Fighter Right
      ctx.fillStyle = '#ff007a';
      ctx.shadowColor = '#ff007a';
      ctx.fillRect(w * 0.7 - 6, h - 45, 12, 30);

      // Spark impact
      if (Math.sin(tick * 0.1) > 0.7) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(w * 0.5, h - 35, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    } else if (mode === 2) {
      // Space shooter preview: stars, lasers, ship
      for (let i = 0; i < 15; i++) {
        const sy = (tick * 1.5 + i * 20) % h;
        const sx = (i * 37) % w;
        ctx.fillStyle = '#ffffff88';
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      const shipX = w * 0.5 + Math.sin(tick * 0.04) * 25;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(shipX, h - 35);
      ctx.lineTo(shipX - 10, h - 12);
      ctx.lineTo(shipX + 10, h - 12);
      ctx.closePath();
      ctx.fill();

      // Laser beams
      const laserY = (h - 35 - (tick * 4) % (h - 20));
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(shipX - 2, laserY, 4, 10);
      ctx.shadowBlur = 0;
    } else if (mode === 3) {
      // Zombie survivor preview
      const cx = w * 0.5;
      const cy = h * 0.5;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rotating bullets
      const ang = tick * 0.08;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * 24, cy + Math.sin(ang) * 24, 3, 0, Math.PI * 2);
      ctx.fill();

      // Enemy dots
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx - 35 + Math.sin(tick * 0.03) * 5, cy - 15, 4, 0, Math.PI * 2);
      ctx.arc(cx + 35 - Math.sin(tick * 0.03) * 5, cy + 18, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Knight slash preview
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, h - 12, w, 12);

      const kx = w * 0.45;
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 6;
      ctx.fillRect(kx - 6, h - 38, 12, 26);

      // Sword slash arc
      const swing = (tick % 40) / 40;
      if (swing < 0.4) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(kx + 12, h - 25, 16, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(previewLoop);
  }
  previewLoop();
}

// ==========================================
// 10. AMBIENT CYBER CONSTELLATION BACKGROUND
// ==========================================
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

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const particles = [];
  const count = Math.min(65, Math.floor((width * height) / 25000));
  const palette = ['#00f0ff', '#ff007a', '#a855f7', '#00ff88', '#38bdf8'];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: palette[Math.floor(Math.random() * palette.length)],
      alpha: Math.random() * 0.45 + 0.15
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse gentle repulsion / illumination
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let curAlpha = p.alpha;
      if (dist < 140) {
        curAlpha = Math.min(0.9, p.alpha + (1 - dist / 140) * 0.5);
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = curAlpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Connect nearby particles with subtle cyber constellation lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dxx = p.x - p2.x;
        const dyy = p.y - p2.y;
        const d = Math.sqrt(dxx * dxx + dyy * dyy);
        if (d < 95) {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (1 - d / 95) * 0.12;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  loop();
}
