import { fireEvent, render, screen } from '@testing-library/react';
import { createGame, legalCardEffectOptions } from '../../gameEngine';
import { EXTENDED_SPELLS } from '../../gameContent';
import { DeedCard } from './GameComponent';

const propsFor=(card,phase,onPlay=jest.fn(),extra={})=>({
  card,
  hand:[card],
  units:[],
  unitOffer:[],
  mana:[],
  source:[],
  map:[],
  player:{crystals:{blue:0,red:0,green:0,white:0},discard:[],command:1},
  phase,
  bonuses:{},
  enemies:[],
  advancedOffer:[],
  spellOffer:[],
  allowedModes:['basic'],
  onPlay,
  ...extra,
});

test('Cold Toughness shows every choice and enables it in the matching combat phase',()=>{
  const game=createGame(41,{character:'tovak'}),card=[...game.player.hand,...game.player.deck].find(item=>item.id==='cold-toughness'),onPlay=jest.fn();
  const {rerender}=render(<DeedCard {...propsFor(card,'action',onPlay)}/>);

  expect(screen.getByRole('button',{name:/attack 2/i})).toBeDisabled();
  expect(screen.getByRole('button',{name:/block 2/i})).toBeDisabled();
  expect(screen.getByText(/wait for the matching phase/i)).toBeInTheDocument();

  rerender(<DeedCard {...propsFor(card,'combat-block',onPlay)}/>);
  expect(screen.getByRole('button',{name:/attack 2/i})).toBeDisabled();
  const block=screen.getByRole('button',{name:/block 2/i});
  expect(block).toBeEnabled();
  fireEvent.click(block);
  expect(onPlay).toHaveBeenCalledWith(card.uid,'basic',null,{optionId:'block'});
});

test('a targeted option offers every eligible enemy as a concrete choice',()=>{
  const card={...EXTENDED_SPELLS.find(item=>item.id==='tremor'),uid:'tremor-test'},onPlay=jest.fn(),enemy={id:'golem',uid:'golem-test',name:'Golem',armor:5,attack:2,fame:4,traits:[]};
  render(<DeedCard {...propsFor(card,'combat-ranged',onPlay,{enemies:[enemy]})}/>);

  fireEvent.click(screen.getByRole('button',{name:/one enemy.*golem/i}));
  expect(onPlay).toHaveBeenCalledWith(card.uid,'basic',null,{optionId:'target',targetId:enemy.uid});
  expect(screen.getByRole('button',{name:/all enemies/i})).toBeEnabled();
});

test('every printed choice on every card is usable in at least one game phase',()=>{
  const game=createGame(83),characters=['tovak','arythea','goldyx','norowas','wolfhawk','krang','braevalar'],cards=[...game.offer.advanced,...game.decks.advanced,...game.offer.spells,...game.decks.spells,...game.decks.artifacts];
  characters.forEach(character=>{const state=createGame(83,{character});cards.push(...state.player.hand,...state.player.deck)});
  const choiceSides=cards.flatMap(card=>['basic','strong'].map(mode=>({card,mode,effect:card[mode]}))).filter(item=>item.effect?.options),phases=['action','combat-ranged','combat-block','combat-attack'];

  expect(choiceSides.length).toBeGreaterThan(10);
  choiceSides.forEach(({card,mode,effect})=>effect.options.forEach(option=>{
    expect(option.label).toBeTruthy();
    expect(option.effect).toBeTruthy();
    expect(phases.some(phase=>legalCardEffectOptions(effect,phase).some(item=>item.id===option.id))).toBe(true);
  }));
});
