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
| Deed cards, mana, Source, crystals | Implemented | Implemented | Covered | Card-by-card audit remains |
| Movement, exploration, Day/Night terrain | Implemented | Implemented | Covered | Audit map-shape placement restrictions |
| Sites and interaction | Implemented | Implemented | Covered | Recheck every Site Description card |
| Enemy combat and abilities | Implemented | Implemented | Covered | Token-by-token audit remains |
| Units, recruitment, banners | Implemented | Implemented | Covered | Unit-by-unit audit remains |
| Leveling and skills | Implemented | Implemented | Covered | Skill-by-skill audit remains |
| PvP | Implemented | Implemented | Covered | Full rulebook sequence audit remains |
| Cooperative city assault | Implemented | Implemented | Covered | Full rulebook sequence audit remains |
| Undo to the last new-information boundary | Implemented | Implemented | Covered | Continue auditing information-reveal triggers |
| Standard achievements and conquest scoring | Implemented | Implemented | Covered | Verify all ties and scenario overrides |

## Base scenarios

| Scenario | Status | Remaining work |
| --- | --- | --- |
| First Reconnaissance | Implemented | Verify delayed offer reveal and numbered countryside order |
| Full Conquest | Implemented | Final rule-by-rule audit |
| Solo Conquest | Implemented through one-player Full Conquest | Final rule-by-rule audit |
| Blitz Conquest | Implemented | Final rule-by-rule audit |
| Full Cooperation | Implemented | Final rule-by-rule audit |
| Blitz Cooperation | Implemented | Verify city levels follow reveal order during the final scenario audit |
| Mines Liberation | Missing | Controlled mines, liberation battles, production and scoring |
| Dungeon Lords | Missing | Secret entrances, repeated conquests, end and scoring |
| Druid Nights | Missing | Glade claims, incantations, rewards, end and scoring |
| One to Return | Missing | Closed portal, elimination, final occupation victory |

## Content inventory

The runtime currently exposes 31 Advanced Actions, 24 Spells, 21 Artifacts, 40 Unit cards, seven Heroes, 12 base Ruin tokens, 19 map tiles plus the portal, and all enemy-token categories. Some content comes from expansions and remains available while the original base-game subset is audited. Exact base/expansion provenance must be recorded before this section can be marked complete.

## Completion gate

Completion requires all rows above to be implemented and verified, every data-defined card/unit/enemy to have at least one behavior test, all official scenarios to complete end-to-end, a successful production build, and a clean comparison between the implementation inventory and the official component inventory.
