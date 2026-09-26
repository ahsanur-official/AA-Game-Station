# NEON ARCADE — 10 GAME COLLECTION

A modern, responsive, browser-based HTML5 Game Hub featuring 10 animated mini-games built with vanilla web technologies, Canvas 2D vector graphics, and procedural Web Audio synthesis.

---

## 🎮 Game Collection Overview

1. **🏎️ Turbo Rush** — *Racing / Endless Runner*
   - Dodge high-speed highway cyber traffic, collect gold coins, and hold Nitro boost for blazing speeds and double score multipliers.
   - **Controls**: `A` / `D` or `Left` / `Right` arrows to steer; `Space` or `Shift` for Nitro.

2. **🥊 Street Fighter Arena** — *1v1 Fighting*
   - Best-of-3 rounds cyber martial arts duel against an adaptive AI opponent.
   - **Controls**: `A` / `D` to move; `W` to jump; `S` to block; `J` punch; `K` kick; `L` special energy fireball.

3. **🚀 Space Defender** — *Vertical Space Shooter*
   - Vertical arcade space shooter. Defeat waves of scouts, cruisers, and asteroids, collect powerups (Triple Shot, Rapid Fire, Shields), and vanquish stage bosses.
   - **Controls**: `WASD` or Arrow keys to navigate; `Space` to shoot lasers; `B` or `X` to detonate an EMP screen-clearing bomb.

4. **🧟 Zombie Survival** — *Top-Down Survival Shooter*
   - 360-degree aiming arena combat against waves of normal, runner, tank, and elite mutant zombies.
   - **Controls**: `WASD` / Arrows to move; Mouse / Touch to aim and shoot; `R` to reload weapon.

5. **⚔️ Knight Duel** — *Medieval Sword Combat*
   - Precision melee combat featuring timed parrying, heavy guard breaks, dash rolls, and multi-stage boss encounters.
   - **Controls**: `A` / `D` to step; `W` to jump; `J` light slash; `K` heavy strike; `L` or `S` shield/parry; `Space` dash roll.

6. **🏹 Archery Master** — *Skill / Target Shooting*
   - Realistic arrow trajectory physics with draw tension and dynamic crosswinds across 4 rounds of stationary, moving, and golden bonus targets.
   - **Controls**: Click / touch & pull back bowstring to aim and charge power gauge; release to shoot.

7. **🧩 Color Match** — *Arcade / Fast Reflex*
   - Rapidly match the glowing central color orb before the countdown timer expires. Trigger Frenzy Mode for double points!
   - **Controls**: Click the matching color card or press keys `1` through `6`.

8. **🐦 Sky Dash** — *Endless Flying Runner*
   - Gravity impulse flying through neon laser gates and hovering sentry drones with dynamic cityscape parallax.
   - **Controls**: `Space`, `Up Arrow`, or Click / Tap to boost glider upward.

9. **💣 Bomb Escape** — *Hazard Arena Survival*
   - Dodge expanding explosive detonation zones and chain reactions, using concrete arena pillars for cover.
   - **Controls**: `WASD` / Arrow keys to run; `Space` or `Shift` to dash through hazards.

10. **🏁 Moto Stunt Challenge** — *Physics Trials Motorbike*
    - Physics-driven trial motorcycle. Launch off steep jumps, pull off 360° backflips and frontflips, collect air coins, and stick clean landings.
    - **Controls**: `Up` / `W` Accelerate; `Down` / `S` Brake; `Left` / `A` Lean Back (Backflip); `Right` / `D` Lean Forward (Frontflip).

---

## 🛠️ Technology Stack

- **HTML5 & CSS3**: Responsive glassmorphic layout with neon cyber accents and smooth animations.
- **Vanilla ES6+ JavaScript**: Clean, decoupled, modular architecture without external game engines.
- **HTML5 Canvas 2D API**: High-performance 60 FPS vector rendering with particle systems and screen-shake feedback.
- **Web Audio API**: Procedural sound effects (explosions, lasers, coin chimes, jump whooshes) and synthesizer background music loop with zero audio file downloads.
- **Client-Side Persistence**: Browser `localStorage` for high score tracking and leaderboard records.

---

## 📂 Project Structure

```
/
├── index.html           # Main arcade hub interface & game viewport modal
├── style.css            # Responsive arcade theme, layout, & mobile controls
├── script.js            # Core arcade controller, sound synthesizer, and router
├── games/
│   ├── racing.js        # Turbo Rush
│   ├── fighting.js      # Street Fighter Arena
│   ├── space.js         # Space Defender
│   ├── zombie.js        # Zombie Survival
│   ├── knight.js        # Knight Duel
│   ├── archery.js       # Archery Master
│   ├── color-match.js   # Color Match
│   ├── sky-dash.js      # Sky Dash
│   ├── bomb-escape.js   # Bomb Escape
│   └── moto-stunt.js    # Moto Stunt Challenge
└── README.md            # Documentation & deployment guide
```

---

## 🚀 How to Run Locally

Because the project is 100% client-side with native ES Modules:

### Option 1: Any Local HTTP Server
Using Python (pre-installed on macOS/Linux/Windows):
```bash
python3 -m http.server 3000
```
Then open `http://localhost:3000` in your web browser.

### Option 2: Using Node / Vite (if using npm)
```bash
npm install
npm run dev
```

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🌐 How to Deploy for Free using GitHub Pages

1. Push this repository to GitHub.
2. Go to your repository on GitHub.
3. Click on **Settings** > **Pages** (in the left sidebar).
4. Under **Build and deployment** > **Branch**:
   - Select `main` (or `master`) branch.
   - Select `/ (root)` folder.
   - Click **Save**.
5. In a few seconds, GitHub Pages will deploy your game collection at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 📱 Mobile & Touch Support

The hub includes dynamic on-screen virtual touch controls (virtual D-pad and responsive action buttons) tailored for each specific game when played on touch-screen devices.
