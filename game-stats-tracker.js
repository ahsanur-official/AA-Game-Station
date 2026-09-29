/**
 * AA GAME STATION — GAME STATS TRACKER MODULE
 * Records and analyzes session-specific metrics:
 * - Time Played (formatted duration)
 * - Total Moves / Inputs (keystrokes, directional changes, taps, actions)
 * - Average Accuracy / Precision Rate (hit/miss ratio & clean evasion rate)
 * - Agility (Actions Per Minute - APM)
 * - Performance Grade (S+, S, A, B, C)
 * - Persistent Lifetime Stats & Historical Bests
 */

export class GameStatsTracker {
  constructor() {
    this.storageKey = 'aa_station_lifetime_stats';
    this.historyKey = 'aa_station_session_history';

    // Active session state
    this.activeSession = null;
    this.lifetimeStats = this.loadLifetimeStats();
  }

  loadLifetimeStats() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {
        totalTimeSeconds: 0,
        totalMoves: 0,
        totalSessions: 0,
        accuracySum: 0,
        accuracyCount: 0,
        bestApm: 0,
        gameRecords: {}
      };
    } catch (_) {
      return {
        totalTimeSeconds: 0,
        totalMoves: 0,
        totalSessions: 0,
        accuracySum: 0,
        accuracyCount: 0,
        bestApm: 0,
        gameRecords: {}
      };
    }
  }

  saveLifetimeStats() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.lifetimeStats));
    } catch (_) {}
  }

  /**
   * Start a new gameplay session
   */
  startSession(gameId, levelConfig = null) {
    const now = performance.now();
    this.activeSession = {
      gameId,
      levelConfig: levelConfig || { level: 2, shortName: 'VETERAN', scoreMultiplier: 1.5 },
      startTime: now,
      pausedTimeTotal: 0,
      pauseStart: null,
      totalMoves: 0,
      moveTypes: {
        keys: 0,
        dpad: 0,
        actions: 0,
        pointer: 0
      },
      hits: 0,
      misses: 0,
      targetsTotal: 0,
      damageTaken: 0,
      highestCombo: 0,
      finalScore: 0,
      isPaused: false
    };
  }

  /**
   * Pause session timer during game pause
   */
  pauseSession() {
    if (this.activeSession && !this.activeSession.isPaused) {
      this.activeSession.isPaused = true;
      this.activeSession.pauseStart = performance.now();
    }
  }

  /**
   * Resume session timer
   */
  resumeSession() {
    if (this.activeSession && this.activeSession.isPaused && this.activeSession.pauseStart) {
      this.activeSession.pausedTimeTotal += (performance.now() - this.activeSession.pauseStart);
      this.activeSession.pauseStart = null;
      this.activeSession.isPaused = false;
    }
  }

  /**
   * Record player move / input action
   */
  recordMove(type = 'keys') {
    if (!this.activeSession || this.activeSession.isPaused) return;
    this.activeSession.totalMoves++;
    if (this.activeSession.moveTypes[type] !== undefined) {
      this.activeSession.moveTypes[type]++;
    } else {
      this.activeSession.moveTypes.keys++;
    }
  }

  /**
   * Record a successful hit, target match, or pickup
   */
  recordHit(count = 1) {
    if (!this.activeSession) return;
    this.activeSession.hits += count;
    this.activeSession.targetsTotal += count;
  }

  /**
   * Record a missed shot or lost chance
   */
  recordMiss(count = 1) {
    if (!this.activeSession) return;
    this.activeSession.misses += count;
    this.activeSession.targetsTotal += count;
  }

  /**
   * Record damage taken during session
   */
  recordDamage(amount = 1) {
    if (!this.activeSession) return;
    this.activeSession.damageTaken += amount;
  }

  /**
   * Record highest combo reached
   */
  recordCombo(combo) {
    if (!this.activeSession) return;
    if (combo > this.activeSession.highestCombo) {
      this.activeSession.highestCombo = combo;
    }
  }

  /**
   * End session and calculate all telemetry analytics
   */
  endSession(result = {}) {
    if (!this.activeSession) {
      return this.getFallbackSummary();
    }

    const s = this.activeSession;
    const now = performance.now();
    let totalElapsedMs = now - s.startTime - s.pausedTimeTotal;
    if (s.isPaused && s.pauseStart) {
      totalElapsedMs -= (now - s.pauseStart);
    }
    const elapsedSeconds = Math.max(1, Math.round(totalElapsedMs / 1000));

    // Incorporate final results from game engine
    const finalScore = result.finalScore || 0;
    const extra = result.extra || {};
    if (extra.damageTaken !== undefined) s.damageTaken = extra.damageTaken;
    if (extra.combo !== undefined && extra.combo > s.highestCombo) s.highestCombo = extra.combo;

    // Accuracy Calculation across all game categories
    let accuracy = 100;
    if (s.targetsTotal > 0) {
      // Explicit hit / miss tracking
      accuracy = Math.round((s.hits / Math.max(1, s.targetsTotal)) * 100);
    } else if (s.totalMoves > 0) {
      // Derived from movement efficiency and damage penalties
      const penalty = Math.min(65, (s.damageTaken || 0) * 1.5);
      const scoreBonus = Math.min(25, Math.floor(finalScore / 300));
      const comboBonus = Math.min(15, s.highestCombo * 2.5);
      accuracy = Math.min(100, Math.max(25, Math.round(85 - penalty + scoreBonus + comboBonus)));
    } else {
      accuracy = finalScore > 0 ? 88 : 50;
    }

    // Ensure within 0 - 100%
    accuracy = Math.max(10, Math.min(100, accuracy));

    // Calculate Actions Per Minute (APM)
    const apm = Math.round((s.totalMoves / elapsedSeconds) * 60);

    // Calculate Performance Grade
    const grade = this.calculateGrade(accuracy, finalScore, s.levelConfig.level, s.damageTaken);

    // Time formatted nicely (e.g. "1m 24s" or "45s")
    const timeFormatted = this.formatDuration(elapsedSeconds);

    const summary = {
      gameId: s.gameId,
      timePlayedSeconds: elapsedSeconds,
      timePlayedFormatted: timeFormatted,
      totalMoves: s.totalMoves,
      accuracyPercentage: accuracy,
      apm: apm,
      highestCombo: s.highestCombo,
      damageTaken: s.damageTaken,
      performanceGrade: grade,
      level: s.levelConfig,
      date: new Date().toISOString()
    };

    // Update Lifetime Aggregates
    this.updateLifetimeRecords(summary);

    // Reset active session
    this.activeSession = null;

    return summary;
  }

  calculateGrade(accuracy, score, level, damageTaken) {
    if (accuracy >= 94 && (damageTaken === 0 || score >= 2000)) {
      return { letter: 'S+', title: 'SUPREME MASTER', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.6)' };
    }
    if (accuracy >= 88 && (damageTaken === 0 || score >= 1200)) {
      return { letter: 'S', title: 'EXCELLENT', color: '#ffd700', glow: 'rgba(255, 215, 0, 0.6)' };
    }
    if (accuracy >= 76 || score >= 800) {
      return { letter: 'A', title: 'GREAT RUN', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' };
    }
    if (accuracy >= 60 || score >= 400) {
      return { letter: 'B', title: 'SOLID EFFORT', color: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' };
    }
    return { letter: 'C', title: 'ROOKIE RUN', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)' };
  }

  formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const remSecs = seconds % 60;
    return `${mins}m ${remSecs.toString().padStart(2, '0')}s`;
  }

  updateLifetimeRecords(session) {
    this.lifetimeStats.totalTimeSeconds += session.timePlayedSeconds;
    this.lifetimeStats.totalMoves += session.totalMoves;
    this.lifetimeStats.totalSessions++;
    this.lifetimeStats.accuracySum += session.accuracyPercentage;
    this.lifetimeStats.accuracyCount++;

    if (session.apm > this.lifetimeStats.bestApm) {
      this.lifetimeStats.bestApm = session.apm;
    }

    if (!this.lifetimeStats.gameRecords[session.gameId]) {
      this.lifetimeStats.gameRecords[session.gameId] = {
        sessions: 0,
        bestAccuracy: session.accuracyPercentage,
        totalTime: session.timePlayedSeconds,
        bestMoves: session.totalMoves
      };
    }

    const rec = this.lifetimeStats.gameRecords[session.gameId];
    rec.sessions++;
    rec.totalTime += session.timePlayedSeconds;
    if (session.accuracyPercentage > rec.bestAccuracy) {
      rec.bestAccuracy = session.accuracyPercentage;
    }
    if (session.totalMoves > rec.bestMoves) {
      rec.bestMoves = session.totalMoves;
    }

    this.saveLifetimeStats();
  }

  getLifetimeSummary() {
    const avgAcc = this.lifetimeStats.accuracyCount > 0
      ? Math.round(this.lifetimeStats.accuracySum / this.lifetimeStats.accuracyCount)
      : 0;

    return {
      totalTimeFormatted: this.formatDuration(this.lifetimeStats.totalTimeSeconds),
      totalMovesFormatted: this.lifetimeStats.totalMoves.toLocaleString(),
      totalSessions: this.lifetimeStats.totalSessions,
      averageAccuracy: `${avgAcc}%`,
      bestApm: this.lifetimeStats.bestApm
    };
  }

  getGameRecord(gameId) {
    return this.lifetimeStats.gameRecords[gameId] || null;
  }

  getFallbackSummary() {
    return {
      gameId: 'unknown',
      timePlayedSeconds: 15,
      timePlayedFormatted: '15s',
      totalMoves: 25,
      accuracyPercentage: 85,
      apm: 60,
      highestCombo: 1,
      damageTaken: 0,
      performanceGrade: { letter: 'A', title: 'GREAT RUN', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' },
      level: { level: 2, shortName: 'VETERAN' },
      date: new Date().toISOString()
    };
  }
}

export const gameStatsTracker = new GameStatsTracker();
