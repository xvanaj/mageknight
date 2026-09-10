# Base game completeness audit

This file tracks implementation against the official Mage Knight rulebook and scenario book. A feature is complete only when its rules are represented in the engine, exposed in the UI, and covered by a behavioral test.

Primary references:

- WizKids, *Mage Knight Ultimate Edition Rulebook and Scenario Book*, pages 1–24.
- WizKids, *Mage Knight Game Walkthrough*.
- Official FAQ plus rules clarifications where the rulebook or a card is ambiguous.

## Rules systems

| Area | Engine | UI | Tests | Remaining audit |
| --- | --- | --- | --- | --- |
| Round setup, tactics, turn order, end-of-round announcement | Implemented | Implemented | Covered | Check every tie and final-turn interaction |
| Deed cards, mana, Source, crystals | Implemented | Implemented | Covered | Individual printed effects remain under card-by-card regression coverage |
| Movement, exploration, Day/Night terrain | Implemented | Implemented | Covered | Audit map-shape placement restrictions |
| Sites and interaction | Implemented | Implemented | Covered | Recheck every Site Description card |
| Enemy combat and abilities | Implemented | Implemented | Covered | Token-by-token audit remains |
| Units, recruitment, banners | Implemented | Implemented | Covered | Unit-by-unit audit remains |
| Leveling and skills | Implemented | Implemented | Covered | Tovak's, Arythea's, and Goldyx's original competitive/solo sets are verified; Norowas still requires a printed-effect audit |
| PvP | Implemented | Implemented | Covered | Full rulebook sequence audit remains |
| Cooperative city assault | Implemented | Implemented | Covered | Full rulebook sequence audit remains |
| Undo to the last new-information boundary | Implemented | Implemented | Covered | Continue auditing information-reveal triggers |
| Standard achievements and conquest scoring | Implemented | Implemented | Covered | Verify all ties and scenario overrides |

## Base scenarios

| Scenario | Status | Remaining work |
| --- | --- | --- |
| First Reconnaissance | Implemented | Complete: numbered countryside order, cards 1–16, delayed offers, regular Units, final turns, and scoring are covered |
| Full Conquest | Implemented | Final rule-by-rule audit |
| Solo Conquest | Implemented through one-player Full Conquest | Final rule-by-rule audit |
| Blitz Conquest | Implemented | Final rule-by-rule audit |
| Full Cooperation | Implemented | Final rule-by-rule audit |
| Blitz Cooperation | Implemented | Verify city levels follow reveal order during the final scenario audit |
| Mines Liberation | Implemented | Final end-to-end and map-shape audit |
| Dungeon Lords | Implemented | Final end-to-end and map-shape audit |
| Druid Nights | Implemented | Final end-to-end and map-shape audit |
| Conquer and Hold | Implemented | Verify the generated connected layout against every coordinate in the illustrated predefined map |
| One to Return | Implemented | Final end-to-end and map-shape audit |

## Content inventory

The implementation catalog exposes 31 Advanced Actions, 24 Spells, 21 Artifacts, 40 Unit cards, seven Hero definitions, 12 base Ruin tokens, 19 map tiles plus the portal, and all enemy-token categories. Original scenarios now use explicit numbered base-game manifests: 28 Advanced Actions, 20 Spells, 16 Artifacts, 20 Regular Units, 20 Elite Units, and the four original Heroes. The lobby offers only Tovak, Arythea, Goldyx, and Norowas and rejects stale or forged expansion-Hero selections. Expansion definitions remain in the internal catalog for their behavior tests but are excluded from original scenario supplies. First Reconnaissance further limits its Advanced Action deck to original cards 1–16.

## Completion gate

Completion requires all rows above to be implemented and verified, every data-defined card/unit/enemy to have at least one behavior test, all official scenarios to complete end-to-end, a successful production build, and a clean comparison between the implementation inventory and the official component inventory.
