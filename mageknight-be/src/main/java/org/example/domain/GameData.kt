package org.example.domain


object GameData {


    fun createBasicDeedCardsShuffled(): List<DeedCard> {
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
            UnitCard("Regular", listOf("Basic unit"), false, 2, 4, listOf(SiteType.CITY, SiteType.VILLAGE)),
            UnitCard("Foresters", listOf("Move through forests"), false, 3, 5, listOf(SiteType.FOREST)),
            UnitCard("Guardsmen", listOf("Defensive unit"), false, 4, 6, listOf(SiteType.CITY)),
            UnitCard("Scouts", listOf("Move quickly"), false, 2, 3, listOf(SiteType.VILLAGE)),
            UnitCard("Thugs", listOf("Cheap and weak"), false, 1, 2, listOf(SiteType.VILLAGE)),
            UnitCard("Utem Crossbowmen", listOf("Ranged attack"), false, 3, 4, listOf(SiteType.CITY)),
            UnitCard("Utem Guardsmen", listOf("Strong defense"), false, 4, 5, listOf(SiteType.CITY)),
            UnitCard("Peasants", listOf("Weak but numerous"), false, 1, 1, listOf(SiteType.VILLAGE)),
            UnitCard("Savage Monks", listOf("Strong attack"), false, 5, 7, listOf(SiteType.MONASTERY)),
            UnitCard("Illusionists", listOf("Special abilities"), false, 4, 6, listOf(SiteType.TOWER))
        ).shuffled()
    }

}