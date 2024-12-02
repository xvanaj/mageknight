import org.example.domain.Tile
import org.example.domain.Monster
import org.example.domain.Site
import org.example.domain.Terrain

class HexGroup(
    val centerTile: Tile,
    val surroundingTiles: List<Tile>
) {
    var isDiscovered: Boolean = false
        private set

    fun discover(searchPoints: Int): Boolean {
        if (isDiscovered) {
            println("HexGroup is already discovered!")
            return false
        }

        return if (searchPoints >= 2) {
            isDiscovered = true
            println("HexGroup discovered! Center: (${centerTile.x}, ${centerTile.y}, ${centerTile.z})")
            true
        } else {
            println("Not enough search points to discover this HexGroup!")
            false
        }
    }

    companion object {
        fun create(center: Tile): HexGroup {
            val directions = listOf(
                Triple(1, -1, 0), Triple(1, 0, -1),
                Triple(0, 1, -1), Triple(-1, 1, 0),
                Triple(-1, 0, 1), Triple(0, -1, 1)
            )

            val surroundingHexes = directions.map { (dx, dy, dz) ->
                val tile = Tile(center.x + dx, center.y + dy, center.z + dz, randomTerrain(), mutableListOf(), Site("Site", "Description"))
                tile.addMonster(randomMonster())
                tile.site = randomSite()
                tile
            }

            return HexGroup(center, surroundingHexes)
        }

        private fun randomTerrain(): Terrain {
            return Terrain.entries.toTypedArray().random()
        }

        private fun randomMonster(): Monster {
            val monsters = listOf(
                Monster("Goblin", 3),
                Monster("Troll", 6),
                Monster("Dragon", 10)
            )
            return monsters.random()
        }

        private fun randomSite(): Site {
            val sites = listOf(
                Site("Ancient Ruins", "Explore for treasures and artifacts."),
                Site("Mystic Spring", "Restore health and mana."),
                Site("Abandoned Village", "Discover resources and stories.")
            )
            return sites.random()
        }
    }
}

