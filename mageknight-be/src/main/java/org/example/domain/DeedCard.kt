package org.example.domain

interface Card {
    val name: String
    val deedCardType: DeedCardType
    val imageUrl: String
}
data class DeedCard(
    override val name: String,
    val basicEffect: String,
    val advancedEffect: String,
    val manaColor: MKColor,
    override val deedCardType: DeedCardType,
    override val imageUrl: String = "https://cf.geekdo-images.com/ECOY2rkJotq5TQ8w8IsjWw__original/img/iR_CUvXUkEeuDd6X-mXfADwPPz4=/0x0/filters:format(jpeg)/pic1086164.jpg"
) : Card {

    override fun toString(): String {
        return name
    }
}

enum class DeedCardType {
    BASIC,
    ADVANCED,
    SPELL,
    ARTIFACT,
    UNIT,
    WOUND,
}

enum class MKColor {
    GREEN,
    RED,
    WHITE,
    BLUE,
    NONE
}

data class UnitCard (
    override val name: String,
    override val deedCardType: DeedCardType = DeedCardType.UNIT,
    override val imageUrl: String = "https://cf.geekdo-images.com/3cw2TC81Vxa6dwCgJiVBoQ__imagepage/img/rAZSEN8LPksG9oEl0mWzz62rbNU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1102565.jpg",
    val effects: List<String>,
    val advanced: Boolean = false,
    val armor: Int,
    val influenceRequired: Int,
    val sites: List<SiteType>,
) : Card {
    override fun toString(): String {
        return name
    }
}