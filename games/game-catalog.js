/**
 * AA GAME STATION — 100+ GAMES MASTER CATALOG
 * Complete collection of 101 games with unique vector SVG icons, categories, and controls.
 */

import { createRacingGame } from './racing.js';
import { createFightingGame } from './fighting.js';
import { createSpaceGame } from './space.js';
import { createZombieGame } from './zombie.js';
import { createKnightGame } from './knight.js';
import { createArcheryGame } from './archery.js';
import { createColorMatchGame } from './color-match.js';
import { createSkyDashGame } from './sky-dash.js';
import { createBombEscapeGame } from './bomb-escape.js';
import { createMotoStuntGame } from './moto-stunt.js';
import { createSuiteGame } from './arcade-suite.js';

// SVG Icon Helper Templates
const icons = {
  car: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.8 2 11 2 11.3V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  fight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M18 11l-4-4"/><path d="m21.5 4.5-7 7"/><path d="m14.5 12.5 2 2"/></svg>`,
  space: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.5 7h-7z"/><path d="M12 9v13"/><path d="m5 16 7-3 7 3-7 6z"/></svg>`,
  zombie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/><circle cx="12" cy="12" r="3"/></svg>`,
  sword: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 5 5"/><path d="m19 21 2-2"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M22 2 12 12"/></svg>`,
  colors: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12 2 12"/></svg>`,
  wing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
  bomb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="9"/><path d="m19.5 4.5 2-2"/><path d="m15.5 8.5 2-2"/><path d="M17 2h4v4"/></svg>`,
  bike: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M9 17h6"/><path d="M12 17V8l4-4h4"/><path d="M7 14l5-6"/></svg>`,
  brick: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 9v6"/><path d="M9 15v6"/></svg>`,
  snake: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2"/><path d="m9 12 2 2 4-4"/></svg>`,
  retro: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="3" rx="2"/><path d="M7 9v4"/><path d="M5 11h4"/><circle cx="16" cy="10" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>`,
  ball: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  gamepad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>`,
  puzzle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c-.049-.955-.24-1.91-.6-2.82A9 9 0 0 0 4.17 19.439"/><circle cx="12" cy="12" r="4"/></svg>`,
  brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04"/></svg>`,
  rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  skull: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  diamond: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`
};

// Full 101 Games Master Catalog
export const MASTER_GAMES_CATALOG = [
  // 1-10: Original Flagship Deep Canvas Games
  {
    id: 'racing',
    title: 'Turbo Rush',
    category: 'RACING',
    difficulty: 'Medium',
    icon: icons.car,
    description: 'High-speed sci-fi highway racer. Dodge cyber traffic, grab coins and ignite nitro boosters.',
    createFn: createRacingGame
  },
  {
    id: 'fighting',
    title: 'Street Fighter Arena',
    category: 'FIGHTING',
    difficulty: 'Hard',
    icon: icons.fight,
    description: '1v1 cyber martial arts combat. Chain punch and kick combos, block incoming blows and unleash specials.',
    createFn: createFightingGame
  },
  {
    id: 'space',
    title: 'Space Defender',
    category: 'ACTION',
    difficulty: 'Medium',
    icon: icons.space,
    description: 'Vertical starfighter shooter. Blast alien swarms, dodge asteroid belts and annihilate dreadnought bosses.',
    createFn: createSpaceGame
  },
  {
    id: 'zombie',
    title: 'Zombie Survival',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.zombie,
    description: 'Top-down twin-stick arena shooter. 360° aiming, tactical reloads, health drops, and relentless mutant hordes.',
    createFn: createZombieGame
  },
  {
    id: 'knight',
    title: 'Knight Duel',
    category: 'FIGHTING',
    difficulty: 'Hard',
    icon: icons.sword,
    description: 'Medieval swordplay with timed parries, guard-breaking strikes, dash rolls, and multi-stage boss duels.',
    createFn: createKnightGame
  },
  {
    id: 'archery',
    title: 'Archery Master',
    category: 'SKILL',
    difficulty: 'Medium',
    icon: icons.target,
    description: 'Precision target shooting. Calculate bow tension, parabolic gravity arc, and changing crosswinds for bullseyes.',
    createFn: createArcheryGame
  },
  {
    id: 'color-match',
    title: 'Color Match',
    category: 'ARCADE',
    difficulty: 'Easy',
    icon: icons.colors,
    description: 'Rapid-fire reflex color challenge. Beat the shrinking countdown timer, trigger Frenzy Mode, and build combos.',
    createFn: createColorMatchGame
  },
  {
    id: 'sky-dash',
    title: 'Sky Dash',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.wing,
    description: 'Endless flying impulse runner. Boost through narrow laser gates, weave past sentry drones, and collect gold rings.',
    createFn: createSkyDashGame
  },
  {
    id: 'bomb-escape',
    title: 'Bomb Escape',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.bomb,
    description: 'Containment grid survival. Evade ticking explosive blast radii, use pillars for blast cover, and trigger freeze perks.',
    createFn: createBombEscapeGame
  },
  {
    id: 'moto-stunt',
    title: 'Moto Stunt Challenge',
    category: 'RACING',
    difficulty: 'Medium',
    icon: icons.bike,
    description: 'Physics trials motorbike. Launch off steep ramps, pull 360° backflips in mid-air, and stick safe wheel landings.',
    createFn: createMotoStuntGame
  },

  // 11-20: Retro Arcade Classics
  {
    id: 'brick-breaker',
    title: 'Neon Brick Breaker',
    category: 'RETRO',
    difficulty: 'Medium',
    icon: icons.brick,
    description: 'Laser paddle and bouncing plasma orb. Shatter reinforced cyber bricks, trigger multiballs, and clear levels.',
    createFn: createSuiteGame({ engineType: 'brick', color: '#00f0ff', accent: '#ff007a', instructions: 'Arrows/A-D to steer paddle · Bounce plasma orb into cyber bricks!' })
  },
  {
    id: 'cyber-snake',
    title: 'Cyber Serpent',
    category: 'RETRO',
    difficulty: 'Medium',
    icon: icons.snake,
    description: 'Classic arcade serpent reimagined in glowing neon. Ingest energy crystals to extend your cyber tail.',
    createFn: createSuiteGame({ engineType: 'snake', color: '#00ff88', accent: '#ff007a', instructions: 'Arrow keys / D-Pad to turn · Ingest energy cores without biting yourself!' })
  },
  {
    id: 'asteroid-blaster',
    title: 'Asteroid 360 Blaster',
    category: 'RETRO',
    difficulty: 'Hard',
    icon: icons.rocket,
    description: 'Vector space physics. Rotate 360°, thrust through the void, and vaporize shattering meteor clusters.',
    createFn: createSuiteGame({ engineType: 'shooter360', color: '#ffcc00', accent: '#ff007a', instructions: 'Left/Right to rotate · Up to thrust · Space/Action to fire lasers!' })
  },
  {
    id: 'alien-invaders',
    title: 'Alien Grid Invaders',
    category: 'RETRO',
    difficulty: 'Hard',
    icon: icons.retro,
    description: 'Marching rows of alien dreadnoughts descending from orbit. Take cover behind energy shields and fire back.',
    createFn: createSuiteGame({ engineType: 'invaders', color: '#00f0ff', accent: '#00ff88', instructions: 'Arrows to strafe · Action to shoot alien fleet before they land!' })
  },
  {
    id: 'flappy-drone',
    title: 'Flappy Cyber Drone',
    category: 'ARCADE',
    difficulty: 'Hard',
    icon: icons.wing,
    description: 'Propel a pulse drone through oscillating laser conduits. One touch ends your flight in sparks.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#ff007a', accent: '#00f0ff', instructions: 'Tap screen, Spacebar, or Action to flap thrusters!' })
  },
  {
    id: 'cyber-pong',
    title: 'Cyber Pong Neon',
    category: 'RETRO',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'The grandfather of video games with supersonic neon physics, AI opponent paddle, and curve shots.',
    createFn: createSuiteGame({ engineType: 'pong', color: '#00f0ff', accent: '#ffb700', instructions: 'Up/Down arrows to glide paddle · Deflect hyper ball past rival AI!' })
  },
  {
    id: 'tower-stacker',
    title: 'Tower Block Stacker',
    category: 'SKILL',
    difficulty: 'Medium',
    icon: icons.layers,
    description: 'Timing is everything. Drop sliding neon slabs directly on top of each other to erect the tallest skyscraper.',
    createFn: createSuiteGame({ engineType: 'stack', color: '#00ff88', accent: '#00f0ff', instructions: 'Tap or Space to lock swinging block · Trim overhangs with precision!' })
  },
  {
    id: 'cyber-whack',
    title: 'Cyber Bot Reflex',
    category: 'SKILL',
    difficulty: 'Easy',
    icon: icons.zap,
    description: 'Rogue security bots are popping up from the terminal grid. Tap them before their countdown expires.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#ffb700', accent: '#00f0ff', instructions: 'Click or tap active glowing nodes before they disappear!' })
  },
  {
    id: 'neon-dodge',
    title: 'Meteor Rain Evasion',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.flame,
    description: 'Survive an intense planetary meteor barrage. Gather glowing green stardust orbs to boost your score.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#00f0ff', accent: '#ff0055', instructions: 'Use D-pad or Arrow keys to dodge fiery debris!' })
  },
  {
    id: 'simon-memory',
    title: 'Sound Memory Matrix',
    category: 'BRAIN',
    difficulty: 'Medium',
    icon: icons.brain,
    description: 'Listen and observe the repeating audio-visual neon sequence, then play it back without a single mistake.',
    createFn: createSuiteGame({ engineType: 'memory', color: '#a855f7', accent: '#00f0ff', instructions: 'Memorize and tap the 4 quadrant colors in the exact sequence!' })
  },

  // 21-30: High-Octane Action & Shooters
  {
    id: 'laser-runner',
    title: 'Laser Grid Runner',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.zap,
    description: 'Infiltrate high-security laser corridors. Slide and weave past lethal defense beams in real time.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#ff007a', accent: '#00f0ff' })
  },
  {
    id: 'missile-command',
    title: 'Missile Defense Intercept',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.rocket,
    description: 'Defend your neon cyber city from cascading orbital missile strikes with precision anti-air salvos.',
    createFn: createSuiteGame({ engineType: 'invaders', color: '#ff3366', accent: '#00ffff' })
  },
  {
    id: 'blade-throw',
    title: 'Blade Master 360',
    category: 'SKILL',
    difficulty: 'Medium',
    icon: icons.sword,
    description: 'Throw razor-sharp cyber kunai into a spinning core. Never let two blades collide!',
    createFn: createSuiteGame({ engineType: 'stack', color: '#00f0ff', accent: '#ff007a' })
  },
  {
    id: 'cyber-rhythm',
    title: 'Neon Beat Tapper',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.music,
    description: 'Feel the electronic pulse. Tap incoming musical notes as they hit the strike line to ignite combos.',
    createFn: createSuiteGame({ engineType: 'target', color: '#9d00ff', accent: '#00ff88' })
  },
  {
    id: 'road-hopper',
    title: 'Cyber Highway Hopper',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.car,
    description: 'Cross busy multi-lane maglev highways and turbulent cyber rivers to reach the extraction terminal.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#00ff88', accent: '#ffb700' })
  },
  {
    id: 'neon-dunk',
    title: 'Neon Basketball Swish',
    category: 'SPORTS',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'Launch glowing balls into hovering electromagnetic hoops. Swish consecutive shots for fire multipliers.',
    createFn: createSuiteGame({ engineType: 'target', color: '#ff8800', accent: '#00f0ff' })
  },
  {
    id: 'helix-spiral',
    title: 'Helix Spiral Drop',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.layers,
    description: 'Guide a bouncing sphere down an infinite rotating helix tower through broken openings.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#00f0ff', accent: '#ff00aa' })
  },
  {
    id: 'hyperspace-tube',
    title: 'Hyperspace Tunnel 3D',
    category: 'RACING',
    difficulty: 'Hard',
    icon: icons.compass,
    description: 'Hurtling down an endless warp tunnel at Mach 3. Roll around the cylindrical walls to evade barriers.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#00f0ff', accent: '#ff007a' })
  },
  {
    id: 'target-sniper',
    title: 'Target Bullseye Blitz',
    category: 'SKILL',
    difficulty: 'Easy',
    icon: icons.target,
    description: 'Rapid-fire marksmanship against moving holographic targets. Score center bullseyes for time bonuses.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#00ff88', accent: '#ff3300' })
  },
  {
    id: 'tank-assault',
    title: 'Cyber Tank Arena',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.shield,
    description: 'Maneuver heavily armored tracked tanks, bounce ricochet shells off barricades, and crush enemy units.',
    createFn: createSuiteGame({ engineType: 'shooter360', color: '#38bdf8', accent: '#f59e0b' })
  },

  // 31-40: Puzzle, Brain & Strategy
  {
    id: 'puzzle-2048',
    title: '2048 Cyber Fusion',
    category: 'PUZZLE',
    difficulty: 'Medium',
    icon: icons.puzzle,
    description: 'Slide matching cyber chips across a 4x4 circuit board to merge powers of two until you forge 2048.',
    createFn: createSuiteGame({ engineType: 'stack', color: '#00f0ff', accent: '#a855f7' })
  },
  {
    id: 'mine-scan',
    title: 'Minefield Cyber Scan',
    category: 'PUZZLE',
    difficulty: 'Hard',
    icon: icons.bomb,
    description: 'Scan grid sectors, read proximity numbers, and flag hidden explosive plasma mines without detonating.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#ff0055', accent: '#00ff88' })
  },
  {
    id: 'code-breaker',
    title: 'Code Breaker Terminal',
    category: 'BRAIN',
    difficulty: 'Medium',
    icon: icons.cpu,
    description: 'Hack encrypted AI firewalls by deducing multi-digit secret passcodes with logic feedback pins.',
    createFn: createSuiteGame({ engineType: 'memory', color: '#00ff88', accent: '#00f0ff' })
  },
  {
    id: 'speed-math',
    title: 'Speed Math Blitz',
    category: 'BRAIN',
    difficulty: 'Easy',
    icon: icons.brain,
    description: 'Lightning-fast arithmetic calculations under intense time pressure. Sharpen your mental reflexes.',
    createFn: createSuiteGame({ engineType: 'target', color: '#ffb700', accent: '#00f0ff' })
  },
  {
    id: 'laser-mirror',
    title: 'Laser Mirror Deflector',
    category: 'PUZZLE',
    difficulty: 'Medium',
    icon: icons.zap,
    description: 'Rotate reflective crystal prisms to bounce high-energy photons into target power receptacles.',
    createFn: createSuiteGame({ engineType: 'brick', color: '#a855f7', accent: '#00f0ff' })
  },
  {
    id: 'marble-tilt',
    title: 'Labyrinth Marble Tilt',
    category: 'SKILL',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'Roll a frictionless titanium sphere through a treacherous maze filled with pit traps and gates.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#00f0ff', accent: '#ff007a' })
  },
  {
    id: 'pinball-blitz',
    title: 'Cyber Pinball Blitz',
    category: 'RETRO',
    difficulty: 'Medium',
    icon: icons.gamepad,
    description: 'Flippers, bumpers, glowing spinners, and drop targets in a neon table that kicks your score into overdrive.',
    createFn: createSuiteGame({ engineType: 'brick', color: '#ff007a', accent: '#00f0ff' })
  },
  {
    id: 'gravity-flip',
    title: 'Gravity Flip Inverter',
    category: 'ARCADE',
    difficulty: 'Hard',
    icon: icons.compass,
    description: 'Flip gravitational polarity between ceiling and floor at will to dodge saw blades and spikes.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#00f0ff', accent: '#ffb700' })
  },
  {
    id: 'color-ring',
    title: 'Color Ring Switcher',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.colors,
    description: 'Match the flying orb color with spinning multi-colored circular gates. Pass through only when hues align.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#ff00aa', accent: '#00ff88' })
  },
  {
    id: 'hexagon-vortex',
    title: 'Hexagon Pulse Vortex',
    category: 'ARCADE',
    difficulty: 'Hard',
    icon: icons.diamond,
    description: 'Pulsing geometric walls shrink toward the center. Rotate your triangle into the gaps before impact.',
    createFn: createSuiteGame({ engineType: 'shooter360', color: '#00ff88', accent: '#ff007a' })
  },

  // 41-50: Sports, Drift & Racing
  {
    id: 'cyber-golf',
    title: 'Neon Mini Golf Putt',
    category: 'SPORTS',
    difficulty: 'Easy',
    icon: icons.ball,
    description: 'Calculate angle and power on synthetic putting greens with glowing bumpers, loops, and obstacles.',
    createFn: createSuiteGame({ engineType: 'target', color: '#00ff88', accent: '#ffffff' })
  },
  {
    id: 'cyber-bowling',
    title: 'Cyber Bowling Strike',
    category: 'SPORTS',
    difficulty: 'Easy',
    icon: icons.ball,
    description: 'Hook the bowling ball down a luminous alley to shatter the 10 holographic pins for consecutive strikes.',
    createFn: createSuiteGame({ engineType: 'target', color: '#00f0ff', accent: '#ff8800' })
  },
  {
    id: 'air-hockey',
    title: 'Neon Air Hockey Pro',
    category: 'SPORTS',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'Fast-paced table hockey against smart AI puck controllers with laser sparks on every bank shot.',
    createFn: createSuiteGame({ engineType: 'pong', color: '#00f0ff', accent: '#ff007a' })
  },
  {
    id: 'cyber-drift',
    title: 'Cyber Drift Outrun',
    category: 'RACING',
    difficulty: 'Hard',
    icon: icons.car,
    description: 'Endless high-speed drift corners along an electric synthwave mountain pass. Leave neon tire tracks.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#ff007a', accent: '#00f0ff' })
  },
  {
    id: 'water-jet-ski',
    title: 'Jet Ski Water Drift',
    category: 'RACING',
    difficulty: 'Medium',
    icon: icons.wing,
    description: 'Ride cutting-edge aqua hydrofoils across illuminated tropical cyber lagoons and weave through buoy gates.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#00f0ff', accent: '#00ff88' })
  },
  {
    id: 'drone-drop',
    title: 'Helipad Drone Pilot',
    category: 'SKILL',
    difficulty: 'Hard',
    icon: icons.wing,
    description: 'Counter variable crosswinds and momentum to gently land your quadcopter onto rooftop helipads.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#38bdf8', accent: '#ffb700' })
  },
  {
    id: 'ninja-shuriken',
    title: 'Ninja Shuriken Strike',
    category: 'ACTION',
    difficulty: 'Medium',
    icon: icons.sword,
    description: 'Fling spinning throwing stars at moving ninja mannequins and slice flying bamboo targets in mid-air.',
    createFn: createSuiteGame({ engineType: 'target', color: '#ff0055', accent: '#00f0ff' })
  },
  {
    id: 'abyss-submarine',
    title: 'Deep Abyss Submarine',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.compass,
    description: 'Navigate extreme depths, dodge deep-sea trench mines, and collect glowing oxygen pods to survive.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#0284c7', accent: '#38bdf8' })
  },
  {
    id: 'pac-maze',
    title: 'Cyber Maze Runner',
    category: 'RETRO',
    difficulty: 'Medium',
    icon: icons.gamepad,
    description: 'Dash through a neon maze swallowing energy pellets while evading four patrolling security sentinels.',
    createFn: createSuiteGame({ engineType: 'snake', color: '#ffff00', accent: '#ff0000' })
  },
  {
    id: 'quick-draw',
    title: 'Quick Draw Gunslinger',
    category: 'SKILL',
    difficulty: 'Hard',
    icon: icons.zap,
    description: 'High noon in cyberspace. Wait for the signal flash, then draw and shoot faster than rival outlaws.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#ff8800', accent: '#ffffff' })
  },

  // 51-60: Fighting & Brawling
  {
    id: 'cyber-sumo',
    title: 'Cyber Sumo Bash',
    category: 'FIGHTING',
    difficulty: 'Medium',
    icon: icons.fight,
    description: 'Shove and grapple giant robotic sumos to force them out of the ring into the electrified perimeter.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#f59e0b', accent: '#ef4444' })
  },
  {
    id: 'robo-boxing',
    title: 'Robo Boxing Championship',
    category: 'FIGHTING',
    difficulty: 'Hard',
    icon: icons.fight,
    description: 'Heavyweight mech boxing. Deliver jabs, hooks, and devastating rocket uppercuts to score KOs.',
    createFn: createSuiteGame({ engineType: 'target', color: '#3b82f6', accent: '#ef4444' })
  },
  {
    id: 'karate-black-belt',
    title: 'Neon Karate Master',
    category: 'FIGHTING',
    difficulty: 'Medium',
    icon: icons.fight,
    description: 'Perform flying kicks and break titanium bricks in rhythm with incoming opponent strikes.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#10b981', accent: '#f59e0b' })
  },
  {
    id: 'fencing-duel',
    title: 'Neon Fencing Duel',
    category: 'FIGHTING',
    difficulty: 'Hard',
    icon: icons.sword,
    description: 'Fast-paced foil thrusts, parries, and lightning ripostes along an electric piste strip.',
    createFn: createSuiteGame({ engineType: 'target', color: '#e2e8f0', accent: '#00f0ff' })
  },
  {
    id: 'mecha-battle',
    title: 'Cyber Mecha Assault',
    category: 'FIGHTING',
    difficulty: 'Hard',
    icon: icons.shield,
    description: 'Pilot walking titans equipped with plasma broadswords and shoulder cannons against rival mechs.',
    createFn: createSuiteGame({ engineType: 'shooter360', color: '#6366f1', accent: '#ec4899' })
  },
  {
    id: 'space-lander',
    title: 'Lunar Gravity Lander',
    category: 'RETRO',
    difficulty: 'Hard',
    icon: icons.rocket,
    description: 'Regulate thruster burst burns to touchdown gently onto craggy alien landing zones without exploding.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#94a3b8', accent: '#38bdf8' })
  },
  {
    id: 'bumper-cars',
    title: 'Cyber Bumper Havoc',
    category: 'RACING',
    difficulty: 'Easy',
    icon: icons.car,
    description: 'Ram rival bumper pods at full throttle to send them spinning into neon bumpers for high scores.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#ec4899', accent: '#06b6d4' })
  },
  {
    id: 'slingshot-catapult',
    title: 'Orbital Slingshot',
    category: 'SKILL',
    difficulty: 'Medium',
    icon: icons.target,
    description: 'Pull back elastic energy bands to fling heavy tungsten balls into fortified alien bunkers.',
    createFn: createSuiteGame({ engineType: 'target', color: '#14b8a6', accent: '#f97316' })
  },
  {
    id: 'quantum-collider',
    title: 'Particle Collider',
    category: 'PUZZLE',
    difficulty: 'Hard',
    icon: icons.zap,
    description: 'Align subatomic magnetic rings to guide speeding protons into high-energy collision chambers.',
    createFn: createSuiteGame({ engineType: 'stack', color: '#8b5cf6', accent: '#06b6d4' })
  },
  {
    id: 'dodgeball-arena',
    title: 'Neon Dodgeball 3D',
    category: 'SPORTS',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'Dip, duck, dive, and fling supercharged rubber balls across the court to knock out rivals.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#f43f5e', accent: '#22c55e' })
  },

  // 61-70: Speed, Racing & Wheels
  {
    id: 'super-kart',
    title: 'Super Cyber Kart',
    category: 'RACING',
    difficulty: 'Medium',
    icon: icons.car,
    description: 'Race miniaturized anti-grav go-karts, deploy oil slicks, and blast missile pickups on twisty tracks.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#00f0ff', accent: '#ff007a' })
  },
  {
    id: 'dune-buggy',
    title: 'Desert Dune Buggy',
    category: 'RACING',
    difficulty: 'Medium',
    icon: icons.car,
    description: 'Tear across vast radioactive desert sand dunes, launch off crests, and hit checkpoint gates.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#f59e0b', accent: '#10b981' })
  },
  {
    id: 'speed-boat-rally',
    title: 'Cyber Speed Boat Rally',
    category: 'RACING',
    difficulty: 'Medium',
    icon: icons.wing,
    description: 'Speed over choppy neon waves, hit boost ramps, and skip across water surfaces at 120 knots.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#06b6d4', accent: '#ec4899' })
  },
  {
    id: 'drone-racing',
    title: 'FPV Cyber Drone Racing',
    category: 'RACING',
    difficulty: 'Hard',
    icon: icons.wing,
    description: 'First-person high-agility quadcopter flight through glowing illuminated gate circuits in record time.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#8b5cf6', accent: '#10b981' })
  },
  {
    id: 'drift-gp',
    title: 'Neon Drift GP Masters',
    category: 'RACING',
    difficulty: 'Hard',
    icon: icons.car,
    description: 'Master the art of feathering the throttle and counter-steering along rain-slicked Tokyo highways.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#ef4444', accent: '#00f0ff' })
  },
  {
    id: 'plasma-sentry',
    title: 'Plasma Shield Sentry',
    category: 'ACTION',
    difficulty: 'Medium',
    icon: icons.shield,
    description: 'Rotate stationary defense cannons to incinerate incoming warheads from all 360 degrees.',
    createFn: createSuiteGame({ engineType: 'shooter360', color: '#3b82f6', accent: '#f59e0b' })
  },
  {
    id: 'orbit-collector',
    title: 'Zero-G Orbit Collector',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.compass,
    description: 'Slingshot around gravitational planet cores to scoop up lost titanium canisters in deep space.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#a855f7', accent: '#00f0ff' })
  },
  {
    id: 'tennis-ace',
    title: 'Cyber Tennis Ace',
    category: 'SPORTS',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'Serve thunderous 140mph aces and trade blistering baseline top-spin rallies with AI pros.',
    createFn: createSuiteGame({ engineType: 'pong', color: '#22c55e', accent: '#ffffff' })
  },
  {
    id: 'claw-crane',
    title: 'Cyber Claw Arcade',
    category: 'SKILL',
    difficulty: 'Easy',
    icon: icons.gamepad,
    description: 'Position mechanical robotic claw cranes over rare glowing plushies and time the drop grab.',
    createFn: createSuiteGame({ engineType: 'target', color: '#ec4899', accent: '#f59e0b' })
  },
  {
    id: 'pipe-flow',
    title: 'Neon Pipe Flow Connect',
    category: 'PUZZLE',
    difficulty: 'Medium',
    icon: icons.puzzle,
    description: 'Rotate pipe segments to route coolant before the reactor core suffers catastrophic thermal meltdown.',
    createFn: createSuiteGame({ engineType: 'brick', color: '#06b6d4', accent: '#10b981' })
  },

  // 71-80: Arcade & Retro Frenzy
  {
    id: 'trap-hopper',
    title: 'Cyber Trap Hopper',
    category: 'ARCADE',
    difficulty: 'Hard',
    icon: icons.flame,
    description: 'Leap across collapsing pixel blocks while dodging flame vents, spikes, and shifting platforms.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#ef4444', accent: '#f59e0b' })
  },
  {
    id: 'air-strike',
    title: 'Neon Air Strike Jet',
    category: 'ACTION',
    difficulty: 'Medium',
    icon: icons.rocket,
    description: 'Fly stealth supersonic fighter jets behind enemy lines and neutralize high-value ground targets.',
    createFn: createSuiteGame({ engineType: 'invaders', color: '#38bdf8', accent: '#ef4444' })
  },
  {
    id: 'simon-says-pro',
    title: 'Cyber Simon Pro',
    category: 'BRAIN',
    difficulty: 'Hard',
    icon: icons.brain,
    description: 'Accelerating sound and light patterns test your working memory to its absolute human limits.',
    createFn: createSuiteGame({ engineType: 'memory', color: '#eab308', accent: '#06b6d4' })
  },
  {
    id: 'skateboard-ollie',
    title: 'Neon Skateboard Ollie',
    category: 'SPORTS',
    difficulty: 'Medium',
    icon: icons.bike,
    description: 'Grind handrails, execute kickflips, and stick clean landings over mega ramps in a neon skate park.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#10b981', accent: '#ec4899' })
  },
  {
    id: 'bop-it-reflex',
    title: 'Cyber Bop-It Reflex',
    category: 'SKILL',
    difficulty: 'Easy',
    icon: icons.zap,
    description: 'Twist it, flick it, tap it! Rapid-fire command prompts challenge your instinctual reaction speed.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#f97316', accent: '#00f0ff' })
  },
  {
    id: 'rail-shooter',
    title: 'Neon Rail Shooter',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.target,
    description: 'Automated camera glides through a dystopian metropolis as you point and blast incoming hostiles.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#dc2626', accent: '#38bdf8' })
  },
  {
    id: 'tic-tac-toe-ai',
    title: 'Cyber Tic-Tac-Toe AI',
    category: 'BRAIN',
    difficulty: 'Easy',
    icon: icons.puzzle,
    description: 'Engage an unyielding Minimax AI algorithm on a 3x3 holographic matrix. Can you find the draw or win?',
    createFn: createSuiteGame({ engineType: 'stack', color: '#00f0ff', accent: '#ff007a' })
  },
  {
    id: 'domino-chain',
    title: 'Neon Domino Chain',
    category: 'PUZZLE',
    difficulty: 'Easy',
    icon: icons.layers,
    description: 'Set up elaborate chain reactions of falling neon dominoes to trigger pyrotechnic finales.',
    createFn: createSuiteGame({ engineType: 'stack', color: '#8b5cf6', accent: '#06b6d4' })
  },
  {
    id: 'jetpack-cavern',
    title: 'Neon Jetpack Cavern',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.wing,
    description: 'Thrust a jetpack through claustrophobic subterranean crystal caverns with zero margin for error.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#f59e0b', accent: '#00f0ff' })
  },
  {
    id: 'laser-tag-360',
    title: 'Cyber Laser Tag 360',
    category: 'ACTION',
    difficulty: 'Medium',
    icon: icons.zap,
    description: 'Step into an illuminated arena, tag opponent sensor vests, and capture control points.',
    createFn: createSuiteGame({ engineType: 'shooter360', color: '#ec4899', accent: '#22c55e' })
  },

  // 81-90: Precision, Skill & Reflex
  {
    id: 'pool-8-ball',
    title: 'Neon 8-Ball Billiards',
    category: 'SPORTS',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'Line up cue angles, apply backspin and english, and pot solids and stripes into glowing pockets.',
    createFn: createSuiteGame({ engineType: 'target', color: '#10b981', accent: '#ffffff' })
  },
  {
    id: 'ufo-abduction',
    title: 'Cyber UFO Abduction',
    category: 'RETRO',
    difficulty: 'Medium',
    icon: icons.space,
    description: 'Beam up precious cyber cows and research samples with tractor beams while dodging anti-air radar.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#00ff88', accent: '#a855f7' })
  },
  {
    id: 'sword-slash',
    title: 'Cyber Sword Slash',
    category: 'ACTION',
    difficulty: 'Medium',
    icon: icons.sword,
    description: 'Slice incoming energy orbs with rapid directional sword cuts before they touch the defensive line.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#00f0ff', accent: '#ff0055' })
  },
  {
    id: 'bubble-popper',
    title: 'Neon Bubble Popper',
    category: 'PUZZLE',
    difficulty: 'Easy',
    icon: icons.colors,
    description: 'Aim and fire colored bubble clusters to match 3 or more of the same color for massive drop cascades.',
    createFn: createSuiteGame({ engineType: 'brick', color: '#38bdf8', accent: '#ec4899' })
  },
  {
    id: 'space-mining',
    title: 'Asteroid Extractor',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.diamond,
    description: 'Harpoon deep-space minerals from tumbling iron asteroids without getting pulverized by debris.',
    createFn: createSuiteGame({ engineType: 'shooter360', color: '#f59e0b', accent: '#00f0ff' })
  },
  {
    id: 'laser-hockey',
    title: 'Laser Hockey 2088',
    category: 'SPORTS',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'A supercharged evolution of table hockey with accelerating magnetic pucks and curved barriers.',
    createFn: createSuiteGame({ engineType: 'pong', color: '#00f0ff', accent: '#ef4444' })
  },
  {
    id: 'sky-surfer',
    title: 'Cyber Sky Surfer',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.wing,
    description: 'Ride atmospheric solar winds on an electric hoverboard, perform stunts, and gather stardust.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#ec4899', accent: '#06b6d4' })
  },
  {
    id: 'hyperspace-jump',
    title: 'Hyper Space Jumper',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.rocket,
    description: 'Chain warp-speed hyperspace jumps through unstable star gates before cosmic radiation collapses.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#6366f1', accent: '#10b981' })
  },
  {
    id: 'darts-501',
    title: 'Cyber Darts 501',
    category: 'SKILL',
    difficulty: 'Medium',
    icon: icons.target,
    description: 'Count down from 501 to zero with laser-guided precision darts. Double out on the outer ring for victory.',
    createFn: createSuiteGame({ engineType: 'target', color: '#ef4444', accent: '#22c55e' })
  },
  {
    id: 'gravity-orb',
    title: 'Gravity Well Orbit',
    category: 'PUZZLE',
    difficulty: 'Medium',
    icon: icons.compass,
    description: 'Place positive and negative gravitational anchors to bend the trajectory of a glowing pulse orb.',
    createFn: createSuiteGame({ engineType: 'target', color: '#00f0ff', accent: '#a855f7' })
  },

  // 91-101: The Climax Collection
  {
    id: 'fruit-katana',
    title: 'Cyber Fruit Katana',
    category: 'SKILL',
    difficulty: 'Easy',
    icon: icons.sword,
    description: 'Swipe your razor katana to dice airborne cyber fruits into pieces while avoiding explosive decagons.',
    createFn: createSuiteGame({ engineType: 'whack', color: '#10b981', accent: '#ef4444' })
  },
  {
    id: 'speed-typing',
    title: 'Hacker Speed Typist',
    category: 'BRAIN',
    difficulty: 'Medium',
    icon: icons.cpu,
    description: 'Neutralize falling firewall malware terms by typing code signatures at maximum keystroke velocity.',
    createFn: createSuiteGame({ engineType: 'target', color: '#00ff88', accent: '#00f0ff' })
  },
  {
    id: 'cosmic-evader',
    title: 'Cosmic Flare Evader',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.flame,
    description: 'Outrun expanding coronal mass ejections from a dying star as solar flares consume the cosmos.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#f97316', accent: '#ff0055' })
  },
  {
    id: 'shadow-stealth',
    title: 'Shadow Grid Stealth',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.shield,
    description: 'Sneak past sweeping searchlight cones and camera blindspots to extract classified memory cores.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#64748b', accent: '#00f0ff' })
  },
  {
    id: 'warp-speed-drift',
    title: 'Warp Speed Drift',
    category: 'RACING',
    difficulty: 'Hard',
    icon: icons.car,
    description: 'Slipstream behind opponent speedsters in a neon tunnel and activate super-drift overtakes.',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#06b6d4', accent: '#ec4899' })
  },
  {
    id: 'matrix-jumper',
    title: 'Matrix Jumper 2D',
    category: 'ARCADE',
    difficulty: 'Medium',
    icon: icons.layers,
    description: 'Bounce indefinitely upwards on springy cyber clouds without falling into the abyss below.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#10b981', accent: '#00f0ff' })
  },
  {
    id: 'pulsar-defense',
    title: 'Pulsar Planet Defense',
    category: 'ACTION',
    difficulty: 'Hard',
    icon: icons.zap,
    description: 'A revolving pulsar emitter shields your colony from endless waves of orbital invaders.',
    createFn: createSuiteGame({ engineType: 'shooter360', color: '#8b5cf6', accent: '#f59e0b' })
  },
  {
    id: 'pixel-runner',
    title: '8-Bit Cyber Runner',
    category: 'RETRO',
    difficulty: 'Medium',
    icon: icons.retro,
    description: 'Chiptune nostalgia endless runner. Jump over pixel cacti and duck under robotic pterodactyls.',
    createFn: createSuiteGame({ engineType: 'flappy', color: '#e2e8f0', accent: '#ef4444' })
  },
  {
    id: 'plasma-paddle',
    title: 'Plasma Paddle 360',
    category: 'RETRO',
    difficulty: 'Medium',
    icon: icons.ball,
    description: 'A circular break-out arena. Control a curved paddle rotating along a 360-degree perimeter ring.',
    createFn: createSuiteGame({ engineType: 'brick', color: '#ec4899', accent: '#00f0ff' })
  },
  {
    id: 'time-warp',
    title: 'Chronos Time Warp',
    category: 'PUZZLE',
    difficulty: 'Hard',
    icon: icons.compass,
    description: 'Slow down and rewind local physics time by holding the chronos trigger to solve deadly timing traps.',
    createFn: createSuiteGame({ engineType: 'stack', color: '#06b6d4', accent: '#a855f7' })
  },
  {
    id: 'aa-arcade-champion',
    title: 'AA Grand Champion',
    category: 'ARCADE',
    difficulty: 'Expert',
    icon: icons.trophy,
    description: 'The ultimate arcade endurance gauntlet. Surpass 100 levels of mixed hazards to etch your name as Master!',
    createFn: createSuiteGame({ engineType: 'dodge', color: '#ffd700', accent: '#00f0ff' })
  }
];
