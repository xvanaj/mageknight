// src/components/game/ManaDiceComponent.js
import React from 'react';
import PropTypes from 'prop-types';
import manaDiceImage from '../../assets/red_dice.png';
import '../../HexGridComponent.css';

function ManaDiceComponent({ manaDices }) {
  const getManaDiceFilter = (manaDice) => {
    switch (manaDice.toLowerCase()) {
      case 'red':
        return 'hue-rotate(0deg) saturate(3) brightness(1.2)';
      case 'blue':
        return 'hue-rotate(200deg) saturate(3) brightness(1.2)';
      case 'green':
        return 'hue-rotate(100deg) saturate(3) brightness(1.2)';
      case 'white':
        return 'saturate(0) brightness(2)';
      default:
        return '';
    }
  };

  return (
    <div className="mana-dice-container">
      {manaDices.map((manaDice, index) => {
        const filter = getManaDiceFilter(manaDice);
        return (
          <img
            key={index}
            src={manaDiceImage}
            alt={`${manaDice} mana dice`}
            className="mana-dice"
            style={{ filter }}
          />
        );
      })}
    </div>
  );
}

ManaDiceComponent.propTypes = {
  manaDices: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ManaDiceComponent;