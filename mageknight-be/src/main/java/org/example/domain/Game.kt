package org.example.domain

class Game {
    var board: Board = Board()
    var previousBoard: Board? = null

}

data class HexPosition(val q: Int, val r: Int, val s: Int)

class Player {
    var character: String = "Tovak"
    var name: String = "Tovak"
    var position: HexPosition = HexPosition(0, 0, 0)
    var fame: Int = 0
    var reputation: Int = 0
    var level: Int = 1
    var armor: Int = 2
    var cardsMax: Int = 5
    var maxUnits: Int = 1
    var traits: MutableList<String> = mutableListOf()
    var basicCards: MutableList<DeedCard> = mutableListOf()
    var hand: MutableList<DeedCard> = mutableListOf()
    var units: MutableList<UnitCard> = mutableListOf()
    var crystals: MutableList<MKColor> = mutableListOf()
    //temp stuff
    var movement: Int = 0
    var influence: Int = 0
    var block: Int = 0
    var attack: Int = 0
    var rangedAttack: Int = 0
    var siegeAttack: Int = 0
    override fun toString(): String {
        return "Player(character='$character', name='$name', fame=$fame, reputation=$reputation, level=$level, traits=$traits, hand=$hand, units=$units, crystals=$crystals, movement=$movement, influence=$influence, block=$block, attack=$attack, rangedAttack=$rangedAttack, siegeAttack=$siegeAttack)"
    }


}
