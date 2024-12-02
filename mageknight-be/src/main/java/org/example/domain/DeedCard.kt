package org.example.domain

data class DeedCard(
    val name: String,
    val basicEffect: String,
    val advancedEffect: String,
    val manaColor: MKColor,
    val deedCardType: DeedCardType,
) {

    fun play() {
        println("Playing card: $name")
    }

    override fun toString(): String {
        return "$name"
    }
}

enum class DeedCardType {
    BASIC,
    ADVANCED,
    SPELL,
    ARTIFACT,
    WOUND,
}

enum class MKColor {
    GREEN,
    RED,
    WHITE,
    BLUE,
    NONE
}

data class UnitCard(
    val name: String,
    val effects: List<String>,
    val advanced: Boolean = false,
    val armor: Int,
    val influenceRequired: Int,
    val sites: List<SiteType>,
) {
    override fun toString(): String {
        return "$name"
    }
}