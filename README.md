# Mage Knight rules engine

A playable, deterministic browser implementation of a **base-game Solo Conquest** rules core. The React client is self-contained; the older Kotlin prototype remains in `mageknight-be` but is not required to play.

## Play

```powershell
cd mageknight-fe
npm install
npm start
```

Then open `http://localhost:3000`.

## Implemented

- Six alternating Day/Night rounds and end-of-round legality
- Deed deck, hand, discard, basic/strong/sideways card use
- Mana Source, mana tokens, crystals, and Day/Night restrictions
- Hex movement with Day/Night terrain costs and impassable terrain
- Rampaging enemies and fortified site assaults
- Ranged/Siege, Block, and Attack combat phases
- Fortified, Swift, Brutal, and Physical Resistance enemy traits
- Wounds, rests, healing, fame, levels, armor, and command progression
- All 15 base site types: portal, village, magical glade, mine, keep, mage tower, monastery, Orc Marauders, Draconum, dungeon, tomb, monster den, spawning grounds, ancient ruins, and all four city colors
- The complete ten-skill Tovak catalog, randomized two-skill level-up choices, Advanced Action rewards, skill readiness, timing restrictions, and elemental modes
- Recruiting, reputation-adjusted influence, plundering, units, save/load, action history, and an in-game rules aid
- Responsive desktop/mobile UI and deterministic seeded setup

## Verification

```powershell
cd mageknight-fe
npm test -- --watchAll=false
npm run build
```

The suite covers setup, mana restrictions, card modes, movement costs, illegal actions, combat sequencing and traits, every base site family, all ten Tovak skills, wounds, recruiting, rests, turns, and round transitions.

## Scope note

This repository does **not** contain the complete commercial game's copyrighted card text/art, expansion sites, the other characters' skills, PvP, or cooperative dummy-player rules. Ancient Ruins use one deterministic enemy/reward token and multi-enemy sites currently resolve through combined enemy profiles. The engine is deliberately data-driven so licensed definitions and further scenarios can be added without weakening legality checks.

Rules were checked against WizKids' *Mage Knight Board Game: Ultimate Edition Rulebook* and official walkthrough. The in-game summary is a play aid, not a replacement for the published rules.
