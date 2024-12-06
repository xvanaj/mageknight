import React from 'react';

function SpellOffer({ spells }) {
  return (
    <div className="spell-offer">
      <h2>Spell Offer</h2>
      <ul>
        {spells.map((spell, index) => (
          <li key={index}>
            <h3>{spell.name}</h3>
            <img src={spell.imageUrl} alt={spell.name} className="spell-image" />
            <p>{spell.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpellOffer;