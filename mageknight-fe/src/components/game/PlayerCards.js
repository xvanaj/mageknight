import React from 'react';
import '../../PlayerCards.css';

function PlayerCards({ playerCards }) {
  return (
    <div className="player-cards">
      <h2>Player Cards</h2>
      <ul className="cards-list">
        {playerCards.map((card, index) => (
          <li key={index} className="card-item">
            <h3>{card.name}</h3>
            <img src={card.imageUrl} alt={card.name} className="player-card-image" />
            {card.effects ? (
              <p>{card.effects.join(', ')}</p>
            ) : (
              <p>{card.basicEffect}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerCards;