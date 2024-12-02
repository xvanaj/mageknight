package org.example.domain

class Game {
    var board: Board = Board()
    var previousBoard: Board? = null

}

class Player {
    var character: String = ""
    var name: String = ""
    var fame: Int = 0
    var reputation: Int = 0
    var level: Int = 0
    var traits: List<String> = listOf()
    var hand: List<DeedCard> = listOf()
    var units: List<UnitCard> = listOf()
    var crystals: List<MKColor> = listOf()
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
