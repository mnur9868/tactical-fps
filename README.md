# Tactical Strike

A round-based tactical first-person shooter in the style of Counter-Strike, built with three.js.

## Features

- **Two teams**: Counter-Terrorists vs Terrorists with distinct spawns, weapons, and objectives
- **Round-based gameplay**: 24 rounds max, half-time at round 13 with team swap
- **Economy system**: Earn money from kills and round outcomes, buy weapons and equipment
- **Buy menu**: Full weapon shop with pistols, SMGs, rifles, snipers, shotguns, LMGs, armor, and grenades
- **Bomb defusal**: Terrorists plant the bomb at sites A or B, Counter-Terrorists defuse it
- **Tactical bots**: AI opponents with roles (entry, awper, support, anchor, lurker) and personalities (aggressive, balanced, defensive)
- **Weapon variety**: 27 weapons across 6 categories with realistic stats (damage, spread, fire rate, reload time)
- **HUD**: Health, armor, ammo, money, round timer, bomb status, kill feed, scoreboard, spectator mode
- **Maps**: Custom tactical layout with two bomb sites, mid control, long corridors, and distinct lanes

## How to Play

1. Run `node serve.ts` to start the local server
2. Open http://localhost:8080 in Chrome
3. Select your team (CT or T)
4. During buy phase (20 seconds), press **B** to open the buy menu
5. When round starts, use **WASD** to move, **Mouse** to look, **Click** to fire, **R** to reload, **Ctrl** to crouch, **Space** to jump
6. **E** to plant bomb (T) or defuse (CT with defuse kit)
7. **Tab** for scoreboard

## Winning

- **CTs win**: Eliminate all Ts, defuse the bomb, or time expires
- **Ts win**: Eliminate all CTs, or bomb explodes

## Development

```bash
# Serve locally
node serve.ts

# Build dossier for submission
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT License - see LICENSE file for details.