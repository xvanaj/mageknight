import React from 'react';

function UnitsOffer({ unitCards }) {
  return (
    <div className="units-offer">
      <h2>Units Offer</h2>
      <ul className="units-list">
        {unitCards.map((card, index) => (
          <li key={index} className="unit-card">
            <h3>{card.name}</h3>
            <img src={card.imageUrl} alt={card.name} className="unit-card-image" />
            <p>{card.effects.join(', ')}</p>
            <p>Armor: {card.armor} Influence Cost: {card.influenceRequired}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UnitsOffer;