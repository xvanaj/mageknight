package org.example.domain

import HexGroup
import HexGroup.Companion.copyWithOffset
import HexGroup.Companion.createStartingTile
import com.fasterxml.jackson.annotation.JsonProperty

data class Monster(val name: String, val power: Int)

enum class SiteType {
    CITY,
    VILLAGE,
    FOREST,
    MONASTERY,
    TOWER,
    CASTLE,
    TOWN,
    MINE,
    DUNGEON,
    KEEP,
    MAZE,
    SPAWNING_GROUNDS,
    ANCIENT_RUINS,
    DRACONUM_LAIR,
    MAGICAL_GLADE,
    PORTAL,
    ORC,
}

data class Tile(
    val q: Int,
    val r: Int,
    val s: Int,
    val terrain: Terrain,
    val monsters: MutableList<Monster>,
    var site: SiteType? = null
) {
    val movementCost: Int = terrain.movementCost

    fun addMonster(monster: Monster) {
        monsters.add(monster)
    }

    override fun toString(): String {
        return "Hex(x=$q, y=$r, z=$s, terrain=$terrain, movementCost=$movementCost, " +
                "monsters=${monsters.map { it.name }}, site=${site}}})"
    }
}


enum class Terrain(val movementCost: Int, val nigthMovementCost: Int) {
    PLAINS(2, 2),
    HILLS(3, 3),
    FOREST(3, 5),
    MOUNTAIN(4, 4),
    DESERT(5, 3),
    SWAMP(5, 5),
    WATER(999, 999),
    LAKE(999, 999),
    ROCKS(999, 999),
}

class Board {

    private val playersCount: Int = 1
    @JsonProperty("hexes")
    private val hexes: MutableMap<String, Tile> = mutableMapOf()
    @JsonProperty("manaDices")
    private val manaDices: MutableList<MKColor> = mutableListOf(MKColor.GREEN, MKColor.RED, MKColor.WHITE, MKColor.BLUE)

    private var advancedActionDeck: MutableList<DeedCard>
    private var spellDeck: MutableList<DeedCard>
    private var artifactsDeck: MutableList<DeedCard>
    private var unitsDeck: MutableList<UnitCard>
    private var advancedUnitsDeck: MutableList<UnitCard>
    private val baseTilesDeck: MutableList<HexGroup>
    @JsonProperty("players")
    private var players: MutableList<Player>

    @JsonProperty("advancedActionOffer")
    private val advancedActionOffer: MutableList<DeedCard>
    @JsonProperty("spellOffer")
    private val spellOffer: MutableList<DeedCard>
    @JsonProperty("unitOffer")
    private val unitsOffer: MutableList<UnitCard>

    private val gameData = GameData

    init {
        players = mutableListOf(Player())
        //create and shuffle decks
        spellDeck = GameData.createAllSpellCardsShuffled().toMutableList()
        advancedActionDeck = GameData.createAdvancedDeedCardsShuffled().toMutableList()
        unitsDeck = GameData.createUnitCardsShuffled().toMutableList()
        advancedUnitsDeck = GameData.createUnitCardsShuffled().toMutableList()
        artifactsDeck = GameData.createArtifactCardsShuffled().toMutableList()
        baseTilesDeck = GameData.createBaseTilesShuffled().toMutableList()
        // create board
        generateBoard()

        //create offers
        val offerSize = playersCount + 2
        advancedActionOffer = advancedActionDeck.take(offerSize).toMutableList()
        advancedActionDeck.subList(0, offerSize).clear()
        spellOffer = spellDeck.take(offerSize).toMutableList()
        spellDeck.subList(0, offerSize).clear()
        unitsOffer = unitsDeck.take(offerSize).toMutableList()
        spellDeck.subList(0, offerSize).clear()

        //draw starting hand
        players.forEach { player ->
            player.basicCards.addAll(GameData.createBasicActionCards())
            player.hand.addAll(player.basicCards.take(5))
            player.basicCards.subList(0, 5).clear()
        }

    }


    // generate tilegroup with portal and 3 tilegroups around it
    private fun generateBoard() {

        val hexGroup = createStartingTile()
        hexes.putAll(hexGroup.hexes.associateBy { "${it.q},${it.r},${it.s}" })

        val topLeft = baseTilesDeck.take(1)[0]
        baseTilesDeck.subList(0, 1).clear()
        val topLeftWithOffset = copyWithOffset(topLeft, HexPosition(-1, -2, 3))
        hexes.putAll(topLeftWithOffset.hexes.associateBy { "${it.q},${it.r},${it.s}" })

        val top = baseTilesDeck.take(1)[0]
        baseTilesDeck.subList(0, 1).clear()
        val topWithOffset = copyWithOffset(top, HexPosition(2, -3, 0))
        hexes.putAll(topWithOffset.hexes.associateBy { "${it.q},${it.r},${it.s}" })

        val topRight = baseTilesDeck.take(1)[0]
        baseTilesDeck.subList(0, 1).clear()
        val topRightWithOffset = copyWithOffset(topRight, HexPosition(3, -2, -2))
        hexes.putAll(topRightWithOffset.hexes.associateBy { "${it.q},${it.r},${it.s}" })
    }

    private fun generateRandomBoard() {
        for (x in -2..2) {
            for (y in -2..2) {
                val z = -x - y
                if (x + y + z == 0) { // Valid cube coordinate
                    val terrain = randomTerrain()
                    hexes[coordinateKey(x, y, z)] = Tile(
                        x, y, z, terrain, mutableListOf(), SiteType.entries.toTypedArray()
                            .random()
                    )
                }
            }
        }
    }

    private fun randomTerrain(): Terrain {
        return Terrain.entries.toTypedArray().random()
    }

    private fun coordinateKey(x: Int, y: Int, z: Int): String {
        return "$x,$y,$z"
    }

    fun getHex(x: Int, y: Int, z: Int): Tile? {
        return hexes[coordinateKey(x, y, z)]
    }

    fun getNeighbors(tile: Tile): List<Tile> {
        val directions = listOf(
            Triple(1, -1, 0), Triple(-1, 1, 0),
            Triple(1, 0, -1), Triple(0, 1, -1),
            Triple(-1, 0, 1), Triple(0, -1, 1)
        )

        return directions.mapNotNull { (dx, dy, dz) ->
            getHex(tile.q + dx, tile.r + dy, tile.s + dz)
        }
    }

    fun printBoard2() {
        for (hex in hexes.values) {
            println("Hex(${hex.q}, ${hex.r}, ${hex.s}) -> Terrain: ${hex.terrain}, Cost: ${hex.movementCost}")
        }
    }

    fun printBoard() {
        val size = 5
        val offset = size / 2

        for (y in -offset..offset) {
            for (x in -offset..offset) {
                val z = -x - y
                if (x + y + z == 0) {
                    val hex = getHex(x, y, z)
                    if (hex != null) {
                        print(terrainSymbol(hex.terrain) + " ")
                    } else {
                        print(". ")
                    }
                } else {
                    print("  ")
                }
            }
            println()
        }
    }

    fun displayHexGrid(radius: Int) {
        val tiles = mutableListOf<Tile>()

        // Generate hexes in a hexagonal shape
        for (x in -radius..radius) {
            for (y in maxOf(-radius, -x - radius)..minOf(radius, -x + radius)) {
                val z = -x - y
                tiles.add(Tile(x, y, z, randomTerrain(), mutableListOf(), SiteType.values().random()))
            }
        }

        // Display the hex grid
        val grid = buildString {
            val minY = tiles.minOf { it.r }
            val maxY = tiles.maxOf { it.r }

            for (y in minY..maxY) {
                append(" ".repeat(radius - y)) // Indentation for hex grid alignment
                for (x in -radius..radius) {
                    val hex = tiles.find { it.q == x && it.r == y }
                    if (hex != null) {
                        append(" ${terrainSymbol(hex.terrain)} ")
                    } else {
                        append("   ")
                    }
                }
                append("\n")
            }
        }

        println(grid)
    }

    private fun terrainSymbol(terrain: Terrain): Char {
        return when (terrain) {
            Terrain.PLAINS -> 'P'
            Terrain.FOREST -> 'F'
            Terrain.MOUNTAIN -> 'M'
            Terrain.WATER -> 'W'
            Terrain.DESERT -> 'D'
            Terrain.HILLS -> 'H'
            Terrain.SWAMP -> 'S'
            Terrain.ROCKS -> 'R'
            Terrain.LAKE -> 'L'
        }
    }

    override fun toString(): String {
        return "Board(playersCount=$playersCount, " + "\n" +
                //"hexes=$hexes, " + "\n" +
                "manaDices=$manaDices, " + "\n" +
                "advancedActionDeck=$advancedActionDeck, " + "\n" +
                "spellDeck=$spellDeck, " + "\n" +
                "artifactsDeck=$artifactsDeck, " + "\n" +
                "unitsDeck=$unitsDeck, " + "\n" +
                "advancedUnitsDeck=$advancedUnitsDeck, " + "\n" +
                "players=$players, " + "\n" +
                "advancedActionOffer=$advancedActionOffer, " + "\n" +
                "spellOffer=$spellOffer, " + "\n" +
                "unitsOffer=$unitsOffer)"
    }
}

fun main() {
    val board = Board()
    board.displayHexGrid(3)
    println("Board: $board")

    val startHex = board.getHex(0, 0, 0)
    if (startHex != null) {
        println("Start Hex: $startHex")
        val neighbors = board.getNeighbors(startHex)
        println("Neighbors: ${neighbors.joinToString { "(${it.q}, ${it.r}, ${it.s}) - ${it.terrain}" }}")
    } else {
        println("Start Hex not found!")
    }
}