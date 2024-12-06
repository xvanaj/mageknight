import React from 'react';

function ActionCardOffer({ actionCards }) {
  return (
    <div className="action-card-offer">
      <h2>Action Card Offer</h2>
      <ul>
        {actionCards.map((card, index) => (
          <li key={index}>
            <h3>{card.name}</h3>
            <img src={card.imageUrl} alt={card.name} className="action-card-image" />
            {/* <p>{card.basicEffect}</p> */}
            {/* <p>{card.advancedEffect}</p>*/}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActionCardOffer;