package org.example.domain

data class Monster(val name: String, val power: Int)

data class Site(val name: String, val description: String)

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
    DRACONUM_LAIR
}

data class Tile(
    val x: Int,
    val y: Int,
    val z: Int,
    val terrain: Terrain,
    val monsters: MutableList<Monster>,
    var site: Site
) {
    val movementCost: Int = terrain.movementCost

    fun addMonster(monster: Monster) {
        monsters.add(monster)
    }

    override fun toString(): String {
        return "Hex(x=$x, y=$y, z=$z, terrain=$terrain, movementCost=$movementCost, " +
                "monsters=${monsters.map { it.name }}, site=${site.name}}})"
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
    ROCKS(999, 999)
}

class Board {

    private val playersCount: Int = 1
    private val hexes: MutableMap<String, Tile> = mutableMapOf()
    private val manaDices: MutableList<MKColor> = mutableListOf(MKColor.GREEN, MKColor.RED, MKColor.WHITE, MKColor.BLUE)

    private var advancedActionDeck: MutableList<DeedCard>
    private var spellDeck: MutableList<DeedCard>
    private var artifactsDeck: MutableList<DeedCard>
    private var unitsDeck: MutableList<UnitCard>
    private var advancedUnitsDeck: MutableList<UnitCard>
    private var players: MutableList<Player>

    private val advancedActionOffer: MutableList<DeedCard>
    private val spellOffer: MutableList<DeedCard>
    private val unitsOffer: MutableList<UnitCard>

    init {
        generateBoard()
        players = mutableListOf(Player())
        //create and shuffle decks
        spellDeck = GameData.createAllSpellCardsShuffled().toMutableList()
        advancedActionDeck = GameData.createAdvancedDeedCardsShuffled().toMutableList()
        unitsDeck = GameData.createUnitCardsShuffled().toMutableList()
        advancedUnitsDeck = GameData.createUnitCardsShuffled().toMutableList()
        artifactsDeck = GameData.createArtifactCardsShuffled().toMutableList()

        //create offers
        val offerSize = playersCount + 2
        advancedActionOffer = advancedActionDeck.take(offerSize).toMutableList()
        advancedActionDeck.subList(0, offerSize).clear()
        spellOffer = spellDeck.take(offerSize).toMutableList()
        spellDeck.subList(0, offerSize).clear()
        unitsOffer = unitsDeck.take(offerSize).toMutableList()
        spellDeck.subList(0, offerSize).clear()


    }


    // Generate a 5x5 board with random terrain
    private fun generateBoard() {

        for (x in -2..2) {
            for (y in -2..2) {
                val z = -x - y
                if (x + y + z == 0) { // Valid cube coordinate
                    val terrain = randomTerrain()
                    hexes[coordinateKey(x, y, z)] = Tile(x, y, z, terrain, mutableListOf(), Site("Site", "Description"))
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
            getHex(tile.x + dx, tile.y + dy, tile.z + dz)
        }
    }

    fun printBoard2() {
        for (hex in hexes.values) {
            println("Hex(${hex.x}, ${hex.y}, ${hex.z}) -> Terrain: ${hex.terrain}, Cost: ${hex.movementCost}")
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
                tiles.add(Tile(x, y, z, randomTerrain(), mutableListOf(), Site("Site", "Description")))
            }
        }

        // Display the hex grid
        val grid = buildString {
            val minY = tiles.minOf { it.y }
            val maxY = tiles.maxOf { it.y }

            for (y in minY..maxY) {
                append(" ".repeat(radius - y)) // Indentation for hex grid alignment
                for (x in -radius..radius) {
                    val hex = tiles.find { it.x == x && it.y == y }
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
        println("Neighbors: ${neighbors.joinToString { "(${it.x}, ${it.y}, ${it.z}) - ${it.terrain}" }}")
    } else {
        println("Start Hex not found!")
    }
}