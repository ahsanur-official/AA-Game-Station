/**
 * AA GAME STATION — IN-GAME ACHIEVEMENT & MILESTONE SYSTEM
 * Tracks gameplay milestones (1000+ points, no damage run, combos, levels, etc.),
 * persists unlocks in localStorage, and triggers audio-visual notification toasts.
 */

export const ACHIEVEMENTS = [
  {
    id: 'first_game',
    title: 'Insert Coin',
    desc: 'Launch and play your very first arcade game.',
    icon: '🪙',
    tier: 'bronze',
    badge: 'BRONZE',
    color: '#cd7f32',
    xp: 50,
    category: 'General'
  },
  {
    id: 'score_500',
    title: 'High Scorer',
    desc: 'Reach 500+ points in any arcade game.',
    icon: '🎯',
    tier: 'bronze',
    badge: 'BRONZE',
    color: '#cd7f32',
    xp: 75,
    category: 'Score'
  },
  {
    id: 'score_1000',
    title: 'Centurion',
    desc: 'Score 1,000+ points reached in a single game session.',
    icon: '⚡',
    tier: 'silver',
    badge: 'SILVER',
    color: '#94a3b8',
    xp: 150,
    category: 'Score'
  },
  {
    id: 'score_2500',
    title: 'Score Master',
    desc: 'Score 2,500+ points reached in a single game run.',
    icon: '🌟',
    tier: 'silver',
    badge: 'SILVER',
    color: '#94a3b8',
    xp: 250,
    category: 'Score'
  },
  {
    id: 'score_5000',
    title: 'Arcade Overlord',
    desc: 'Accumulate 5,000+ points in a single epic session.',
    icon: '👑',
    tier: 'gold',
    badge: 'GOLD',
    color: '#ffd700',
    xp: 500,
    category: 'Score'
  },
  {
    id: 'score_10000',
    title: 'Godlike Ascendant',
    desc: 'Surpass 10,000+ points in an unbelievable arcade run!',
    icon: '💎',
    tier: 'platinum',
    badge: 'PLATINUM',
    color: '#00f0ff',
    xp: 1000,
    category: 'Score'
  },
  {
    id: 'no_damage',
    title: 'Untouchable',
    desc: 'Complete or finish a round taking zero damage (No damage run).',
    icon: '🛡️',
    tier: 'gold',
    badge: 'GOLD',
    color: '#ffd700',
    xp: 400,
    category: 'Skill'
  },
  {
    id: 'combo_3',
    title: 'Combo Initiator',
    desc: 'Chain a 3x combo streak in fast-paced arcade action.',
    icon: '🔥',
    tier: 'bronze',
    badge: 'BRONZE',
    color: '#cd7f32',
    xp: 80,
    category: 'Combat'
  },
  {
    id: 'combo_5',
    title: 'Combo Master',
    desc: 'Chain an intense 5x combo streak without breaking cadence.',
    icon: '💥',
    tier: 'silver',
    badge: 'SILVER',
    color: '#94a3b8',
    xp: 200,
    category: 'Combat'
  },
  {
    id: 'combo_10',
    title: 'Combo God',
    desc: 'Reach an unbelievable 10x combo multiplier streak!',
    icon: '⚡',
    tier: 'platinum',
    badge: 'PLATINUM',
    color: '#00f0ff',
    xp: 750,
    category: 'Combat'
  },
  {
    id: 'survive_60',
    title: 'Survivor',
    desc: 'Stay alive and survive for over 60 seconds in a game.',
    icon: '⏱️',
    tier: 'bronze',
    badge: 'BRONZE',
    color: '#cd7f32',
    xp: 100,
    category: 'Survival'
  },
  {
    id: 'survive_120',
    title: 'Iron Will',
    desc: 'Survive in the arena for more than 120 seconds.',
    icon: '⏳',
    tier: 'gold',
    badge: 'GOLD',
    color: '#ffd700',
    xp: 350,
    category: 'Survival'
  },
  {
    id: 'play_cadet',
    title: 'Cadet Graduate',
    desc: 'Finish a mission played on Level 1 (Cadet).',
    icon: '🟢',
    tier: 'bronze',
    badge: 'BRONZE',
    color: '#00ff88',
    xp: 60,
    category: 'Levels'
  },
  {
    id: 'play_veteran',
    title: 'Veteran Hero',
    desc: 'Score 500+ points on standard Level 2 (Veteran).',
    icon: '🔵',
    tier: 'silver',
    badge: 'SILVER',
    color: '#00f0ff',
    xp: 150,
    category: 'Levels'
  },
  {
    id: 'play_master',
    title: 'Master Slayer',
    desc: 'Score 1,000+ points on challenging Level 3 (Master).',
    icon: '🟣',
    tier: 'gold',
    badge: 'GOLD',
    color: '#a855f7',
    xp: 350,
    category: 'Levels'
  },
  {
    id: 'play_nightmare',
    title: 'Nightmare Conqueror',
    desc: 'Score 1,500+ points on extreme Level 4 (Nightmare)!',
    icon: '💀',
    tier: 'platinum',
    badge: 'PLATINUM',
    color: '#ff0055',
    xp: 800,
    category: 'Levels'
  },
  {
    id: 'favorite_3',
    title: 'Arcade Collector',
    desc: 'Add at least 3 favorite arcade games to your bookmarks.',
    icon: '⭐',
    tier: 'bronze',
    badge: 'BRONZE',
    color: '#cd7f32',
    xp: 75,
    category: 'Collection'
  },
  {
    id: 'play_5_games',
    title: 'Arcade Hopper',
    desc: 'Sample and play 5 distinct games across the 100+ catalog.',
    icon: '🕹️',
    tier: 'silver',
    badge: 'SILVER',
    color: '#94a3b8',
    xp: 200,
    category: 'Collection'
  },
  {
    id: 'play_15_games',
    title: 'Arcade Enthusiast',
    desc: 'Explore and play 15 distinct games in AA Game Station.',
    icon: '🚀',
    tier: 'gold',
    badge: 'GOLD',
    color: '#ffd700',
    xp: 500,
    category: 'Collection'
  },
  {
    id: 'retro_crt',
    title: 'Retro Purist',
    desc: 'Activate the classic CRT scanline filter in the game arena.',
    icon: '📺',
    tier: 'bronze',
    badge: 'BRONZE',
    color: '#00ff88',
    xp: 50,
    category: 'Features'
  },
  {
    id: 'fullscreen_hero',
    title: 'Full Immersion',
    desc: 'Switch to Fullscreen Arena mode for a true arcade cabinet experience.',
    icon: '⛶',
    tier: 'bronze',
    badge: 'BRONZE',
    color: '#00f0ff',
    xp: 50,
    category: 'Features'
  }
];

class AchievementSystem {
  constructor() {
    this.storageKey = 'aa_station_achievements';
    this.playedGamesKey = 'aa_station_played_games';
    this.unlocked = this.loadUnlocked();
    this.playedGames = this.loadPlayedGames();
    this.toastQueue = [];
    this.isShowingToast = false;
    this.soundEngine = null;
    this.listeners = [];
  }

  setSoundEngine(soundEngine) {
    this.soundEngine = soundEngine;
  }

  loadUnlocked() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (_) {
      return {};
    }
  }

  saveUnlocked() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.unlocked));
    } catch (_) {}
  }

  loadPlayedGames() {
    try {
      const data = localStorage.getItem(this.playedGamesKey);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch (_) {
      return new Set();
    }
  }

  savePlayedGames() {
    try {
      localStorage.setItem(this.playedGamesKey, JSON.stringify([...this.playedGames]));
    } catch (_) {}
  }

  isUnlocked(id) {
    return !!this.unlocked[id];
  }

  getUnlockedCount() {
    return Object.keys(this.unlocked).length;
  }

  getTotalCount() {
    return ACHIEVEMENTS.length;
  }

  getProgressPercentage() {
    return Math.round((this.getUnlockedCount() / this.getTotalCount()) * 100);
  }

  getAllAchievements() {
    return ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: this.isUnlocked(ach.id),
      unlockedAt: this.unlocked[ach.id]?.unlockedAt || null
    }));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(achievement) {
    this.listeners.forEach(fn => {
      try { fn(achievement, this.getUnlockedCount(), this.getTotalCount()); } catch (_) {}
    });
  }

  unlock(id) {
    if (this.isUnlocked(id)) return false;

    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return false;

    const now = new Date().toISOString();
    this.unlocked[id] = { unlockedAt: now };
    this.saveUnlocked();

    // Play fanfare
    if (this.soundEngine) {
      this.soundEngine.init();
      if (typeof this.soundEngine.playAchievementFanfare === 'function') {
        this.soundEngine.playAchievementFanfare();
      } else {
        this.soundEngine.playVictory?.();
      }
    }

    // Queue notification toast
    this.queueToast(ach);

    // Notify UI listeners
    this.notifyListeners(ach);

    return true;
  }

  queueToast(achievement) {
    this.toastQueue.push(achievement);
    if (!this.isShowingToast) {
      this.processToastQueue();
    }
  }

  processToastQueue() {
    if (this.toastQueue.length === 0) {
      this.isShowingToast = false;
      return;
    }

    this.isShowingToast = true;
    const ach = this.toastQueue.shift();
    this.displayToast(ach, () => {
      // Small delay between multiple queued toasts
      setTimeout(() => {
        this.processToastQueue();
      }, 300);
    });
  }

  displayToast(ach, onComplete) {
    let container = document.getElementById('achievementToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'achievementToastContainer';
      container.className = 'achievement-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `achievement-toast tier-${ach.tier}`;
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
      <div class="toast-shimmer"></div>
      <div class="toast-inner">
        <div class="toast-icon-wrap" style="border-color: ${ach.color}; box-shadow: 0 0 16px ${ach.color}66">
          <span class="toast-icon">${ach.icon}</span>
        </div>
        <div class="toast-content">
          <div class="toast-tag-row">
            <span class="toast-header-tag">🏆 ACHIEVEMENT UNLOCKED</span>
            <span class="toast-tier-tag tier-badge-${ach.tier}" style="color: ${ach.color}; border-color: ${ach.color}66">
              ${ach.badge} · +${ach.xp} XP
            </span>
          </div>
          <h4 class="toast-title">${ach.title}</h4>
          <p class="toast-desc">${ach.desc}</p>
        </div>
        <button class="toast-dismiss-btn" title="Dismiss" aria-label="Dismiss">✕</button>
      </div>
      <div class="toast-progress-bar">
        <div class="toast-progress-fill" style="background: ${ach.color}"></div>
      </div>
    `;

    const dismiss = () => {
      if (toast.classList.contains('dismissing')) return;
      toast.classList.add('dismissing');
      setTimeout(() => {
        toast.remove();
        if (onComplete) onComplete();
      }, 350);
    };

    toast.querySelector('.toast-dismiss-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss();
    });

    toast.addEventListener('click', dismiss);

    container.appendChild(toast);

    // Auto dismiss after 4.2 seconds
    setTimeout(dismiss, 4200);
  }

  // Real-time gameplay checks
  checkRealtimeScore(score, levelConfig = null) {
    if (score >= 500) this.unlock('score_500');
    if (score >= 1000) this.unlock('score_1000');
    if (score >= 2500) this.unlock('score_2500');
    if (score >= 5000) this.unlock('score_5000');
    if (score >= 10000) this.unlock('score_10000');

    // Level-specific score milestones
    if (levelConfig) {
      if (levelConfig.level === 2 && score >= 500) this.unlock('play_veteran');
      if (levelConfig.level === 3 && score >= 1000) this.unlock('play_master');
      if (levelConfig.level === 4 && score >= 1500) this.unlock('play_nightmare');
    }
  }

  checkCombo(combo) {
    if (combo >= 3) this.unlock('combo_3');
    if (combo >= 5) this.unlock('combo_5');
    if (combo >= 10) this.unlock('combo_10');
  }

  checkGameOverMilestones({ score, stats, extra = {}, levelConfig = null }) {
    this.checkRealtimeScore(score, levelConfig);

    // Check no damage run
    if (extra.noDamage || extra.damageTaken === 0) {
      // Must have played a meaningful round
      if (score >= 150 || (extra.survivalSeconds && extra.survivalSeconds >= 8)) {
        this.unlock('no_damage');
      }
    }

    if (extra.combo) {
      this.checkCombo(extra.combo);
    }

    if (extra.survivalSeconds) {
      if (extra.survivalSeconds >= 60) this.unlock('survive_60');
      if (extra.survivalSeconds >= 120) this.unlock('survive_120');
    }

    if (levelConfig && levelConfig.level === 1) {
      this.unlock('play_cadet');
    }
  }

  recordGameLaunched(gameId) {
    this.unlock('first_game');
    this.playedGames.add(gameId);
    this.savePlayedGames();

    if (this.playedGames.size >= 5) {
      this.unlock('play_5_games');
    }
    if (this.playedGames.size >= 15) {
      this.unlock('play_15_games');
    }
  }

  recordFavoriteCount(count) {
    if (count >= 3) {
      this.unlock('favorite_3');
    }
  }

  recordCrtToggled() {
    this.unlock('retro_crt');
  }

  recordFullscreenToggled() {
    this.unlock('fullscreen_hero');
  }
}

export const achievementManager = new AchievementSystem();
