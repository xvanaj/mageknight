# Original base-game completeness audit

This implementation targets the original *Mage Knight Board Game* and its eleven scenarios. Expansion heroes and content may remain in internal catalogs for isolated tests, but original scenarios expose only original components.

The audit uses the official March 2012 rulebook, scenario book, walkthrough, component manifests, and printed card text. A row is complete only when the rule exists in the engine, has a usable UI path, and is covered by a behavioral or inventory test.

## Rules coverage

| Rule area | Status | Verified behavior |
| --- | --- | --- |
| Setup and rounds | Complete | Scenario setup, Day/Night rounds, tactic selection and order, the Dummy player's complete ten-Skill supply, solo player's nine-Skill supply, end-of-round announcement, final turns, and round refresh |
| Deed cards and mana | Complete | Basic, powered, and sideways cards; crystals and tokens; Source use, held-die timing, rerolls, and Day/Night gold and black restrictions |
| Movement and map | Complete | Terrain costs, exploration, fixed tile orientation, open and wedge map shapes, countryside/core placement, fallback tiles, and rampager provocation |
| Sites | Complete | Villages, monasteries, keeps, mage towers, mines, magical glades, ruins, dungeons, tombs, spawning grounds, cities, and scenario-specific sites |
| Combat | Complete | Ranged/Siege, Block, damage assignment, resistances, fortification, multiple enemies, summons, poison, brutal, swift, elusive, assassinate, paralyze, cumbersome, and Arcane Immunity |
| Interaction and Units | Complete | Reputation, influence, recruitment restrictions, command limits, Unit activation, wounds, healing, resistances, and banners |
| Heroes and Skills | Complete | The original Tovak, Arythea, Goldyx, and Norowas decks and Skill sets, including competitive interactive Skills |
| Advanced cards | Complete | All original Advanced Actions, Spells, and Artifacts have their printed supplies and executable effects |
| Cooperative assaults | Complete | Suitability, consent, defender assignment, individual entry costs, Source timing, rampagers, sequential combats, shared failure, recovery, and city shields |
| Player versus player | Complete | Entry, pre-turn effects, full and partial attendance, ranged and melee exchanges, fortification, damage, Artifact theft, withdrawal, Fame, and attended-turn cleanup |
| Undo and hidden information | Complete | Turn reset is available until new information is revealed; private decks, hands, facedown sites, and unexplored map content remain redacted |
| End of game and scoring | Complete | Standard achievements, ties, wound penalties, cities, competitive victory, solo and cooperative mission scoring, and scenario overrides |

## Scenario coverage

| Original scenario | Status | Scenario-specific verification |
| --- | --- | --- |
| First Reconnaissance | Complete | Training length, ordered countryside tiles, cards 1-16, regular Units, delayed offers, friendly capital, exploration Fame, and ending |
| Full Conquest | Complete | Standard competitive setup, city levels, final turns, victory, and scoring |
| Solo Conquest | Complete | Dummy timer, solo tactics, city objective, round limit, and mission scoring |
| Blitz Conquest | Complete | Short round structure, Blitz bonuses, city objective, and scoring |
| Full Cooperation | Complete | Team rules, joint city assaults, cooperative objective, dummy timer, and team scoring |
| Blitz Cooperation | Complete | Blitz team setup, joint city assaults, city reveal order, objective, and team scoring |
| Mines Liberation | Complete | Friendly red city, mine distribution, liberation battles, remote production, reputation, ending, and Greatest Liberator scoring |
| Dungeon Lords | Complete | Blue city, regular tomb, secret entrances, replacement defenders, connected sites, objective, and crawler scoring |
| Druid Nights | Complete | Glade layout, friendly green city, incantations, doubled Fame, summon disposal, and final-turn timing |
| Conquer and Hold | Complete | Illustrated fixed map, tower defenders, team control, mage-tower mana, Elite Unit timing, ending, and control scoring |
| One to Return | Complete | Portal closure, occupant elimination, portal PvP, waiting, ending, and winner selection |

## Original component inventory

The original scenario manifests contain:

- four Heroes with their 16-card starting decks and Skill tokens;
- 28 Advanced Actions, 20 Spells, and 16 Artifacts;
- 20 Regular and 20 Elite Unit cards with their physical supply counts;
- all 60 original enemy tokens with printed statistics and abilities;
- 12 base Ruin tokens;
- 11 countryside tiles, 8 core tiles, and the portal tile;
- the original city cards, tactics, site descriptions, scoring cards, and scenario definitions.

Automated inventory tests reject duplicate physical identities, missing copies, incorrect original-scenario supplies, and expansion content leaking into the original lobby or decks.

## Validation gate

The completion gate is a clean production build plus the full automated test suite. The suite covers rules behavior, all eleven scenario configurations, original component inventories, multiplayer privacy, lobby restrictions, and representative application rendering. The current verified baseline is 528 passing tests in four suites and a successful optimized production build.
