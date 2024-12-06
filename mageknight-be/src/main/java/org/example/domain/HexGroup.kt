import org.example.domain.*
import org.yaml.snakeyaml.util.Tuple

class HexGroup(
    val hexes: List<Tile>
) {

    companion object {
                fun copyWithOffset(
            hexGroup: HexGroup,
            middleTileCoords: HexPosition
        ): HexGroup {
            val q = middleTileCoords.q
            val r = middleTileCoords.r
            val s = middleTileCoords.s

            val directions = listOf(
                Triple(-1, 0, 1), Triple(0, -1, 1),
                Triple(1, -1, 0), Triple(0, 0, 0),Triple(-1, 1, 0),
                Triple(1, 0, -1), Triple(0, 1, -1),
            )
            val hexes = mutableListOf<Tile>()
            for (i in 0 until hexGroup.hexes.size) {
                val newTile = Tile(
                    q + directions[i].first,
                    r + directions[i].second,
                    s + directions[i].third,
                    hexGroup.hexes[i].terrain,
                    mutableListOf(),
                    hexGroup.hexes[i].site
                )
                hexes.add(newTile)
            }

            return HexGroup(hexes)
        }

        fun createTileGroup(
            tiles: List<Tuple<Terrain, SiteType>>,
            middleTileCoords: Triple<Int, Int, Int> = Triple(0, 0, 0)
        ): HexGroup {
            val q = middleTileCoords.first
            val r = middleTileCoords.second
            val s = middleTileCoords.third

            val directions = listOf(
                Triple(0, -1, 1), Triple(1, -1, 0),
                Triple(-1, 0, 1), Triple(0, 0, 0), Triple(1, 0, -1),
                Triple(-1, 1, 0), Triple(0, 1, -1),
            )
            val hexes = mutableListOf<Tile>()
            for (i in tiles.indices) {
                val newTile = Tile(
                    q + directions[i].first,
                    r + directions[i].second,
                    s + directions[i].third,
                    tiles[i]._1(),
                    mutableListOf(),
                    tiles[i]._2()
                )
                hexes.add(newTile)
            }

            return HexGroup(hexes)
        }

        fun createStartingTile(): HexGroup {
            return createTileGroup(
                listOf(
                    Tuple(Terrain.PLAINS, null),
                    Tuple(Terrain.FOREST, null),
                    Tuple(Terrain.WATER, null),
                    Tuple(Terrain.PLAINS, SiteType.PORTAL),
                    Tuple(Terrain.PLAINS, null),
                    Tuple(Terrain.WATER, null),
                    Tuple(Terrain.PLAINS, null)
                )
            )
        }

        private fun randomMonster(): Monster {
            val monsters = listOf(
                Monster("Goblin", 3),
                Monster("Troll", 6),
                Monster("Dragon", 10)
            )
            return monsters.random()
        }
    }
}

