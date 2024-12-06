package org.example.domain

import HexGroup
import HexGroup.Companion.createTileGroup
import org.yaml.snakeyaml.util.Tuple


object GameData {

    fun createAdvancedDeedCardsShuffled(): List<DeedCard> {
        return listOf(
            DeedCard(
                "Movement",
                "Gives +3 move.",
                "Gives +6 move",
                MKColor.GREEN,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Attack",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 3",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.GREEN,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 4",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 5",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.BLUE,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 6",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 7",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 8",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 9",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 10",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 11",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 12",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
            DeedCard(
                "Advanced Deed 13",
                "This deed gives you an extra action card.",
                "Advanced Deed effect",
                MKColor.RED,
                DeedCardType.ADVANCED
            ),
        ).shuffled()
    }

    fun createAllSpellCardsShuffled(): List<DeedCard> {
        return listOf(
            DeedCard(
                "Spell 1",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.BLUE,
                DeedCardType.SPELL
            ),
            DeedCard(
                "Spell 2",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.BLUE,
                DeedCardType.SPELL
            ),
            DeedCard(
                "Spell 3",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.RED,
                DeedCardType.SPELL
            ),
            DeedCard(
                "Spell 4",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.BLUE,
                DeedCardType.SPELL
            ),
            DeedCard(
                "Spell 5",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.BLUE,
                DeedCardType.SPELL
            ),
            DeedCard(
                "Spell 6",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.GREEN,
                DeedCardType.SPELL
            ),
            DeedCard(
                "Spell 7",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.BLUE,
                DeedCardType.SPELL
            ),
            DeedCard(
                "Spell 8",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.WHITE,
                DeedCardType.SPELL
            ),
            DeedCard(
                "Spell 9",
                "This spell gives you an extra action card.",
                "Spell effect",
                MKColor.BLUE,
                DeedCardType.SPELL
            ),
        ).shuffled()
    }

    fun createArtifactCardsShuffled(): List<DeedCard> {
        return listOf(
            DeedCard("Artifact 1", "Artifact base effect.", "Artifact effect", MKColor.NONE, DeedCardType.ARTIFACT),
            DeedCard("Artifact 2", "Artifact base effect.", "Artifact effect", MKColor.NONE, DeedCardType.ARTIFACT),
            DeedCard("Artifact 3", "Artifact base effect.", "Artifact effect", MKColor.NONE, DeedCardType.ARTIFACT),
            DeedCard("Artifact 4", "Artifact base effect.", "Artifact effect", MKColor.NONE, DeedCardType.ARTIFACT),
            DeedCard("Artifact 5", "Artifact base effect.", "Artifact effect", MKColor.NONE, DeedCardType.ARTIFACT),
        ).shuffled()
    }

    fun createUnitCardsShuffled(): List<UnitCard> {
        return listOf(
            UnitCard("Regular", DeedCardType.UNIT, imageUrl = "https://cf.geekdo-images.com/08fFVf_v-SyF1tshTCrc4A__imagepage/img/xqfD3j43E2xY2lSUkRAORWiyGK0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1101373.jpg",effects = listOf("Basic unit"), armor = 2, influenceRequired = 4, sites = listOf(SiteType.CITY, SiteType.VILLAGE)),
            UnitCard("Foresters", DeedCardType.UNIT, effects = listOf("Move through forests"), armor = 3, influenceRequired = 5, sites = listOf(SiteType.FOREST)),
            UnitCard("Guardsmen", DeedCardType.UNIT, effects = listOf("Defensive unit"), armor = 4, influenceRequired = 6, sites = listOf(SiteType.CITY)),
            UnitCard("Scouts", DeedCardType.UNIT, effects = listOf("Move quickly"), armor = 2, influenceRequired = 3, sites = listOf(SiteType.VILLAGE)),
            UnitCard("Thugs", DeedCardType.UNIT, effects = listOf("Cheap and weak"), armor = 1, influenceRequired = 2, sites = listOf(SiteType.VILLAGE)),
            UnitCard("Utem Crossbowmen", DeedCardType.UNIT, imageUrl = "https://cf.geekdo-images.com/tK0e_M049k04Nn_pSWqifA__imagepage/img/6WGg4guv7VtNfyDoqQ6kadQ6eX8=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1101374.jpg", effects = listOf("Ranged attack"), armor = 3, influenceRequired = 4, sites = listOf(SiteType.CITY)),
            UnitCard("Utem Guardsmen", DeedCardType.UNIT, effects = listOf("Strong defense"), armor = 4, influenceRequired = 5, sites = listOf(SiteType.CITY)),
            UnitCard("Peasants", DeedCardType.UNIT, effects = listOf("Weak but numerous"), armor = 1, influenceRequired = 1, sites = listOf(SiteType.VILLAGE)),
            UnitCard("Savage Monks", DeedCardType.UNIT, effects = listOf("Strong attack"), armor = 5, influenceRequired = 7, sites = listOf(SiteType.MONASTERY)),
            UnitCard("Illusionists", DeedCardType.UNIT, imageUrl = "https://cf.geekdo-images.com/pEtyVlRLKjnA3kUOcRChKw__imagepage/img/J_87Hqjku0RKuysclkx58JxGpTw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1102566.jpg", effects = listOf("Special abilities"), armor = 4, influenceRequired = 6, sites = listOf(SiteType.TOWER)),
            UnitCard("Amotep Gunners", DeedCardType.UNIT, imageUrl = "https://cf.geekdo-images.com/U-WuoJVWj43h5mBGr4jtuQ__imagepage/img/0-ES2GWTPiWSyC2EMRsFoOnfFs4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1103557.jpg", effects = listOf("Powerful ranged attack"), armor = 5, influenceRequired = 8, sites = listOf(SiteType.CITY)),
            UnitCard("Guardian Golems", DeedCardType.UNIT, imageUrl = "https://cf.geekdo-images.com/3cw2TC81Vxa6dwCgJiVBoQ__imagepage/img/rAZSEN8LPksG9oEl0mWzz62rbNU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1102565.jpg", effects = listOf("Strong defense and attack"), armor = 6, influenceRequired = 9, sites = listOf(SiteType.TOWER))
        ).shuffled()
    }

    fun createBasicActionCards(): List<DeedCard> {
        return listOf(
            DeedCard("March", "Move 2", "Move 4", MKColor.GREEN, DeedCardType.BASIC),
            DeedCard("Swiftness", "Move 2", "Move 4", MKColor.BLUE, DeedCardType.BASIC),
            DeedCard("Stamina", "Move 2", "Move 4", MKColor.BLUE, DeedCardType.BASIC),
            DeedCard("Tranquility", "Heal 1", "Heal 2", MKColor.GREEN, DeedCardType.BASIC),
            DeedCard("Rage", "Attack 2", "Attack 4", MKColor.RED, DeedCardType.BASIC),
            DeedCard("Determination", "Block 2", "Block 4", MKColor.RED, DeedCardType.BASIC),
            DeedCard("Threaten", "Influence 2", "Influence 5", MKColor.RED, DeedCardType.BASIC),
            DeedCard("Promise", "Influence 2", "Influence 4", MKColor.WHITE, DeedCardType.BASIC),
            DeedCard("Crystallize", "Gain 1 crystal", "Gain 1 crystal", MKColor.WHITE, DeedCardType.BASIC),
            DeedCard("Mana Draw", "Gain 2 mana", "Gain 3 mana", MKColor.WHITE, DeedCardType.BASIC),
            DeedCard("Concentration", "Add 2 to a basic action", "Add 3 to a basic action", MKColor.GREEN, DeedCardType.BASIC),
            DeedCard("Improvisation", "Use any card as a basic action", "Use any card as a stronger basic action", MKColor.RED, DeedCardType.BASIC)
        ).shuffled()
    }

    fun createBaseTilesShuffled(): List<HexGroup> {
        return mutableListOf(
            createTileGroup(//1
                listOf(
                    Tuple(Terrain.FOREST, SiteType.ORC),
                    Tuple(Terrain.LAKE, null),
                    Tuple(Terrain.FOREST, null),
                    Tuple(Terrain.FOREST, SiteType.MAGICAL_GLADE),
                    Tuple(Terrain.PLAINS, SiteType.VILLAGE),
                    Tuple(Terrain.PLAINS, null),
                    Tuple(Terrain.PLAINS, null)
                )
            ),
            createTileGroup(//2
                listOf(
                    Tuple(Terrain.HILLS, SiteType.ORC),
                    Tuple(Terrain.FOREST, SiteType.MAGICAL_GLADE),
                    Tuple(Terrain.PLAINS, null),
                    Tuple(Terrain.HILLS, null),
                    Tuple(Terrain.PLAINS, SiteType.VILLAGE),
                    Tuple(Terrain.HILLS, SiteType.MINE),
                    Tuple(Terrain.PLAINS, null)
                )
            ),
            createTileGroup(//3
                listOf(
                    Tuple(Terrain.PLAINS, null),
                    Tuple(Terrain.HILLS, SiteType.KEEP),
                    Tuple(Terrain.PLAINS, null),
                    Tuple(Terrain.FOREST, SiteType.VILLAGE),
                    Tuple(Terrain.HILLS, null),
                    Tuple(Terrain.PLAINS, SiteType.VILLAGE),
                    Tuple(Terrain.HILLS, SiteType.MINE)
                )
            ),
            createTileGroup(//4
                listOf(
                    Tuple(Terrain.DESERT, null),
                    Tuple(Terrain.DESERT, null),
                    Tuple(Terrain.HILLS, SiteType.ORC),
                    Tuple(Terrain.DESERT, SiteType.TOWER),
                    Tuple(Terrain.ROCKS, null),
                    Tuple(Terrain.PLAINS, null),
                    Tuple(Terrain.PLAINS, SiteType.VILLAGE),
                )
            ),
            createTileGroup( //5
                listOf(
                    Tuple(Terrain.FOREST, null),
                    Tuple(Terrain.PLAINS, SiteType.MONASTERY),
                    Tuple(Terrain.FOREST, SiteType.MAGICAL_GLADE),
                    Tuple(Terrain.LAKE, null),
                    Tuple(Terrain.PLAINS, SiteType.ORC),
                    Tuple(Terrain.FOREST, null),
                    Tuple(Terrain.HILLS, SiteType.MINE)
                )
            ),
        ).shuffled()
    }

}