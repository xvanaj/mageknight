import React from 'react';
import { HexGrid, Layout, Hexagon, Text, Pattern } from 'react-hexgrid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import '../../HexGridComponent.css';

function HexGridComponent({ hexes, players }) {
  const getTerrainClass = (terrain) => {
    switch (terrain.toLowerCase()) {
      case 'plains':
        return 'hex-tile plains';
      case 'forest':
        return 'hex-tile forest';
      case 'mountain':
        return 'hex-tile mountain';
      case 'water':
        return 'hex-tile water';
      case 'desert':
        return 'hex-tile desert';
      case 'hills':
        return 'hex-tile hills';
      case 'swamp':
        return 'hex-tile swamp';
      case 'rocks':
        return 'hex-tile rocks';
      default:
        return 'hex-tile';
    }
  };

  const handleHexClick = (hex) => {
    console.log(`Hex clicked: ${hex.q}, ${hex.r}, ${hex.s} - Terrain: ${hex.terrain} - Site: ${hex.site || 'None'}`);
  };

  return (
    <TransformWrapper>
      <TransformComponent>
        <div className="scrollable-container">
          <HexGrid width={800} height={600} viewBox="-50 -50 100 100">
            <Layout size={{ x: 7, y: 7 }} flat={true} spacing={1.1} origin={{ x: 0, y: 0 }}>
              {hexes.map((hex, index) => (
                <Hexagon
                  key={index}
                  q={hex.q}
                  r={hex.r}
                  s={hex.s}
                  className={`${getTerrainClass(hex.terrain)} ${hex.q === players[0].position.q && hex.r === players[0].position.r && hex.s === players[0].position.s ? 'player' : ''}`}
                  onClick={() => handleHexClick(hex)}
                >
                  {hex.q === players[0].position.q && hex.r === players[0].position.r && hex.s === players[0].position.s && (
                    <image href="https://static.wikia.nocookie.net/mage-knight/images/4/44/TovakMiniature.jpg" x= "-2" y = "-6" width="5" height="5" alt="Player" />
                  )}
                  <Text style={{ fontSize: '0.1em', fill: 'white' }}>{hex.terrain}</Text>
                  <Text style={{ fontSize: '0.1em', fill: 'white' }} y={2}>{`[${hex.q}, ${hex.r}, ${hex.s}]`}</Text>
                  {hex.site && <Text style={{ fontSize: '0.1em', fill: 'yellow' }} y={4}>{hex.site}</Text>}
                </Hexagon>
              ))}
            </Layout>
            <Pattern id="pattern1" link="https://static.wikia.nocookie.net/mage-knight/images/4/44/TovakMiniature.jpg/revision/latest?cb=20230718180004" size={1} />
          </HexGrid>

        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}

export default HexGridComponent;