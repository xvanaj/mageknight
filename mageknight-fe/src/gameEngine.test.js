import { createGame, legalMoves, reduceGame, TERRAIN_COST, SITES, TOVAK_SKILLS } from './gameEngine';

const act = (state, type, extra={}) => reduceGame(state,{type,...extra});
const cardToHand = (state,id) => {
  const source=state.player.hand.find(c=>c.id===id)?state.player.hand:state.player.deck;
  const i=source.findIndex(c=>c.id===id); const card=source.splice(i,1)[0];
  if(!state.player.hand.includes(card))state.player.hand.push(card); return card;
};

describe('setup and deterministic state',()=>{
  test('starts a six-round solo conquest with five cards',()=>{const s=createGame(4);expect(s.round).toBe(1);expect(s.time).toBe('day');expect(s.player.hand).toHaveLength(5);expect(s.source).toHaveLength(3);});
  test('same seed creates same deck',()=>expect(createGame(9).player.hand.map(c=>c.id)).toEqual(createGame(9).player.hand.map(c=>c.id)));
  test('terrain table applies day and night inversions',()=>{expect(TERRAIN_COST.day.forest).toBe(3);expect(TERRAIN_COST.night.forest).toBe(5);expect(TERRAIN_COST.day.desert).toBe(5);expect(TERRAIN_COST.night.desert).toBe(3);});
});
describe('deed cards and mana',()=>{
  test('basic action adds points and commits the card',()=>{let s=createGame();const c=cardToHand(s,'march');s=act(s,'PLAY_CARD',{uid:c.uid,mode:'basic'});expect(s.points.move).toBe(2);expect(s.player.played[0].id).toBe('march');});
  test('strong action is rejected without matching mana',()=>{let s=createGame();const c=cardToHand(s,'rage');s=act(s,'PLAY_CARD',{uid:c.uid,mode:'strong'});expect(s.error).toMatch(/requires red/i);expect(s.player.hand.some(x=>x.uid===c.uid)).toBe(true);});
  test('matching crystal powers and is spent',()=>{let s=createGame();const c=cardToHand(s,'rage');s.player.crystals.red=1;s=act(s,'PLAY_CARD',{uid:c.uid,mode:'strong'});expect(s.points.attack).toBe(4);expect(s.player.crystals.red).toBe(0);});
  test('a card may be played sideways',()=>{let s=createGame();const c=s.player.hand[0];s=act(s,'PLAY_CARD',{uid:c.uid,mode:'sideways',as:'influence'});expect(s.points.influence).toBe(1);});
  test('only one Source die per turn',()=>{let s=createGame();s.source[0].color='blue';s.source[1].color='red';s=act(s,'TAKE_SOURCE',{id:s.source[0].id});s=act(s,'TAKE_SOURCE',{id:s.source[1].id});expect(s.error).toMatch(/only one/i);expect(s.mana).toHaveLength(1);});
  test('black Source mana is unusable by day',()=>{let s=createGame();s.source[0].color='black';s=act(s,'TAKE_SOURCE',{id:s.source[0].id});expect(s.error).toMatch(/cannot be used during the Day/i);});
});
describe('movement legality',()=>{
  test('adjacent traversable destination includes cost',()=>{const s=createGame();s.points.move=3;const forest=legalMoves(s).find(h=>h.q===1&&h.r===-1);expect(forest.cost).toBe(3);expect(forest.legal).toBe(true);});
  test('moving pays destination cost',()=>{let s=createGame();s.points.move=2;s=act(s,'MOVE',{q:1,r:0});expect([s.player.q,s.player.r]).toEqual([1,0]);expect(s.points.move).toBe(0);});
  test('non-adjacent movement is rejected',()=>{let s=createGame();s.points.move=99;s=act(s,'MOVE',{q:3,r:-3});expect(s.error).toMatch(/adjacent/i);});
  test('enemy space blocks ordinary movement',()=>{let s=createGame();s.player.q=1;s.player.r=0;s.points.move=9;s=act(s,'MOVE',{q:2,r:0});expect(s.error).toMatch(/enemy blocks/i);});
});
describe('combat sequence',()=>{
  const startProwlers=()=>{let s=createGame();s.player.q=1;s.player.r=0;s.points.move=3;return act(s,'START_COMBAT',{q:2,r:-1});};
  test('rampaging enemies are challenged without spending Move',()=>{const s=startProwlers();expect(s.phase).toBe('combat-ranged');expect(s.points.move).toBe(3);});
  test('irrelevant effects cannot be committed during combat',()=>{let s=startProwlers();const c=cardToHand(s,'march');s=act(s,'PLAY_CARD',{uid:c.uid,mode:'basic'});expect(s.error).toMatch(/ranged or siege/i);});
  test('ranged victory leaves hero outside the rampaging enemy hex',()=>{let s=startProwlers();s.points.ranged=3;s=act(s,'RESOLVE_RANGED');expect(s.phase).toBe('action');expect(s.player.fame).toBe(2);expect([s.player.q,s.player.r]).toEqual([1,0]);expect(s.player.reputation).toBe(1);});
  test('fortification ignores ordinary ranged attack',()=>{let s=createGame();s.player.q=1;s.player.r=0;s.points.move=3;s=act(s,'START_COMBAT',{q:2,r:0});s.points.ranged=99;s=act(s,'RESOLVE_RANGED');expect(s.phase).toBe('combat-block');});
  test('swift doubles block requirement',()=>{let s=startProwlers();s=act(s,'RESOLVE_RANGED');s.points.block=4;s=act(s,'RESOLVE_BLOCK');expect(s.combat.blocked).toBe(false);});
  test('unblocked attack deals wounds by armor',()=>{let s=startProwlers();s=act(s,'RESOLVE_RANGED');s=act(s,'RESOLVE_BLOCK');expect(s.player.wounds).toBe(2);});
  test('attack must meet armor',()=>{let s=startProwlers();s=act(s,'RESOLVE_RANGED');s.points.block=8;s=act(s,'RESOLVE_BLOCK');s.points.attack=2;s=act(s,'RESOLVE_ATTACK');expect(s.error).toMatch(/need 3 effective Attack/i);s.points.attack=3;s=act(s,'RESOLVE_ATTACK');expect(s.phase).toBe('action');});
});
describe('sites, turns, and rounds',()=>{
  test('reputation modifies recruiting cost',()=>{let s=createGame();s.player.q=0;s.player.r=-1;s.player.reputation=2;s.points.influence=2;s=act(s,'INTERACT',{kind:'recruit',id:'peasants'});expect(s.player.units[0].id).toBe('peasants');});
  test('village plunder costs reputation and ends turn',()=>{let s=createGame();s.player.q=0;s.player.r=-1;s=act(s,'INTERACT',{kind:'plunder'});expect(s.player.reputation).toBe(-1);expect(s.turn).toBe(2);});
  test('rest discards a wound and ends turn',()=>{let s=createGame();s.player.wounds=1;s.player.hand.push({id:'wound',uid:'w1',name:'Wound'});s=act(s,'REST');expect(s.player.hand.some(c=>c.uid==='w1')).toBe(false);expect(s.turn).toBe(2);});
  test('end turn clears temporary power and draws',()=>{let s=createGame();s.points.move=7;s.player.hand=s.player.hand.slice(0,2);s=act(s,'END_TURN');expect(s.points.move).toBe(0);expect(s.player.hand.length).toBe(5);});
  test('round cannot end while cards remain',()=>{let s=createGame();s.player.deck=[];s=act(s,'END_ROUND');expect(s.error).toMatch(/no playable cards/i);});
  test('valid round end flips day to night',()=>{let s=createGame();s.player.discard.push(...s.player.deck,...s.player.hand);s.player.deck=[];s.player.hand=[];s=act(s,'END_ROUND');expect(s.round).toBe(2);expect(s.time).toBe('night');expect(s.player.hand).toHaveLength(5);});
});

describe('complete base site catalog',()=>{
  test('every declared site is present on the scenario map',()=>{const s=createGame();const present=new Set(s.map.map(h=>h.site).filter(Boolean));expect(Object.keys(SITES).filter(id=>!present.has(id))).toEqual([]);});
  test('adventure sites are entered before combat',()=>{let s=createGame();s.player.q=-2;s.player.r=0;s.points.move=3;s=act(s,'MOVE',{q:-3,r:1});expect([s.player.q,s.player.r]).toEqual([-3,1]);s=act(s,'START_COMBAT',{q:-3,r:1});expect(s.phase).toBe('combat-ranged');expect(s.combat.kind).toBe('adventure');});
  test('a fortified assault pays normal terrain cost and reputation',()=>{let s=createGame();s.player.q=1;s.player.r=0;s.points.move=3;s=act(s,'START_COMBAT',{q:2,r:0});expect(s.points.move).toBe(0);expect(s.player.reputation).toBe(-1);expect(s.combat.kind).toBe('fortified');});
  test('monastery healing costs two Influence',()=>{let s=createGame();s.player.q=2;s.player.r=-2;s.points.influence=2;s.player.wounds=1;s.player.hand.push({id:'wound',uid:'mw'});s=act(s,'INTERACT',{kind:'heal',count:1});expect(s.player.wounds).toBe(0);expect(s.points.influence).toBe(0);});
  test('burning a monastery costs three reputation and starts combat',()=>{let s=createGame();s.player.q=2;s.player.r=-2;s=act(s,'BURN_MONASTERY');expect(s.player.reputation).toBe(-3);expect(s.combat.kind).toBe('burn');});
  test('a conquered mage tower sells a spell for influence and mana',()=>{let s=createGame();const h=s.map.find(x=>x.site==='mage-tower');h.conquered=true;h.enemy=null;s.player.q=h.q;s.player.r=h.r;s.points.influence=7;s.mana=['red'];s=act(s,'INTERACT',{kind:'learn-spell',id:'fireball'});expect(s.player.deck[0].id).toBe('fireball');expect(s.points.influence).toBe(0);});
  test('green city teaches advanced actions',()=>{let s=createGame();const h=s.map.find(x=>x.site==='city'&&x.cityColor==='green');h.conquered=true;h.enemy=null;s.player.q=h.q;s.player.r=h.r;s.points.influence=6;s=act(s,'INTERACT',{kind:'learn-advanced',id:'path-finding'});expect(s.player.deck[0].id).toBe('path-finding');});
  test('red city sells an artifact reward',()=>{let s=createGame();const h=s.map.find(x=>x.site==='city'&&x.cityColor==='red');h.conquered=true;h.enemy=null;s.player.q=h.q;s.player.r=h.r;s.points.influence=12;s=act(s,'INTERACT',{kind:'buy-artifact'});expect(s.pendingRewards[0].type).toBe('artifact');});
  test('white city can add an elite unit',()=>{let s=createGame();const h=s.map.find(x=>x.site==='city'&&x.cityColor==='white');h.conquered=true;h.enemy=null;s.player.q=h.q;s.player.r=h.r;s.points.influence=2;s=act(s,'INTERACT',{kind:'add-elite'});expect(s.offer.units.some(u=>u.elite)).toBe(true);});
  test('mine produces its crystal at end of turn',()=>{let s=createGame();const h=s.map.find(x=>x.site==='mine');s.player.q=h.q;s.player.r=h.r;const before=s.player.crystals[h.mineColor];s=act(s,'END_TURN');expect(s.player.crystals[h.mineColor]).toBe(before+1);});
  test('glade throws away a wound at end of turn',()=>{let s=createGame();const h=s.map.find(x=>x.site==='glade');s.player.q=h.q;s.player.r=h.r;s.player.wounds=1;s.player.discard.push({id:'wound',uid:'gw'});s=act(s,'END_TURN');expect(s.player.wounds).toBe(0);expect(s.mana).toContain('gold');});
  test('adventure rewards must be claimed before turn end',()=>{let s=createGame();s.pendingRewards=[{type:'crystals',count:2,source:'Monster Den'}];s=act(s,'END_TURN');expect(s.error).toMatch(/claim/i);s=act(s,'CLAIM_REWARD',{colors:['red','blue']});expect(s.player.crystals.red).toBe(1);expect(s.player.crystals.blue).toBe(1);});
});

describe('all ten Tovak skills',()=>{
  const withSkills=()=>{const s=createGame();s.player.skills=TOVAK_SKILLS.map(x=>({...x,used:false,roundUsed:false}));return s;};
  test('catalog contains all ten unique skills',()=>{expect(TOVAK_SKILLS).toHaveLength(10);expect(new Set(TOVAK_SKILLS.map(s=>s.id)).size).toBe(10);});
  test('Double Time follows Day and Night values',()=>{let s=withSkills();s=act(s,'USE_SKILL',{id:'double-time'});expect(s.points.move).toBe(2);s=act(s,'END_TURN');s.time='night';s=act(s,'USE_SKILL',{id:'double-time'});expect(s.points.move).toBe(1);});
  test("I Don't Give a Damn boosts one sideways card to two",()=>{let s=withSkills();s=act(s,'USE_SKILL',{id:'i-dont-give-a-damn'});const c=s.player.hand[0];s=act(s,'PLAY_CARD',{uid:c.uid,mode:'sideways',as:'move'});expect(s.points.move).toBe(2);expect(s.bonuses.sideways).toBeNull();});
  test('Who Needs Magic gives three without taking a Source die',()=>{let s=withSkills();s=act(s,'USE_SKILL',{id:'who-needs-magic'});const c=s.player.hand[0];s=act(s,'PLAY_CARD',{uid:c.uid,mode:'sideways',as:'influence'});expect(s.points.influence).toBe(3);});
  test('I Feel No Pain discards a wound and draws',()=>{let s=withSkills();s.player.hand=[{id:'wound',uid:'pain'}];const before=s.player.deck.length;s=act(s,'USE_SKILL',{id:'i-feel-no-pain'});expect(s.player.discard[0].id).toBe('wound');expect(s.player.hand).toHaveLength(1);expect(s.player.deck).toHaveLength(before-1);});
  test('Motivation draws two and grants blue mana once a round',()=>{let s=withSkills();const before=s.player.hand.length;s=act(s,'USE_SKILL',{id:'motivation'});expect(s.player.hand.length).toBe(before+2);expect(s.mana).toContain('blue');s=act(s,'USE_SKILL',{id:'motivation'});expect(s.error).toMatch(/already been used this round/i);});
  test('Mana Overload grants mana and adds four to the powered action',()=>{let s=withSkills();const c=cardToHand(s,'rage');s=act(s,'USE_SKILL',{id:'mana-overload',color:'red'});s=act(s,'PLAY_CARD',{uid:c.uid,mode:'strong'});expect(s.points.attack).toBe(8);});
  test('Night Sharpshooting gives two underground even by Day',()=>{let s=withSkills();const h=s.map.find(x=>x.site==='dungeon');s.player.q=h.q;s.player.r=h.r;s.phase='combat-ranged';s.combat={q:h.q,r:h.r,enemy:h.enemy,kind:'adventure'};s=act(s,'USE_SKILL',{id:'night-sharpshooting'});expect(s.points.ranged).toBe(2);});
  test('Cold Swordsmanship can create Ice Attack',()=>{let s=withSkills();s.phase='combat-attack';s.combat={enemy:{armor:4,traits:[]}};s=act(s,'USE_SKILL',{id:'cold-swordsmanship',mode:'ice'});expect(s.points.iceAttack).toBe(2);});
  test('Shield Mastery supports physical, fire, and ice modes',()=>{for(const mode of ['physical','fire','ice']){let s=withSkills();s.phase='combat-block';s.combat={enemy:{armor:4,traits:[]}};s=act(s,'USE_SKILL',{id:'shield-mastery',mode});expect(s.points[mode==='physical'?'block':`${mode}Block`]).toBe(mode==='physical'?3:2);}});
  test('Resistance Break lowers armor once per resistance',()=>{let s=withSkills();s.phase='combat-ranged';s.combat={enemy:{armor:7,traits:['physical-resistant','fire-resistant']}};s=act(s,'USE_SKILL',{id:'resistance-break'});expect(s.combat.enemy.armor).toBe(5);});
  test('skill level presents two choices and selecting one adds an Advanced Action',()=>{let s=withSkills();s.player.skills=[];s.player.fame=1;s.player.q=1;s.player.r=0;s.points.move=3;s=act(s,'START_COMBAT',{q:2,r:-1});s.points.ranged=3;s=act(s,'RESOLVE_RANGED');expect(s.player.level).toBe(2);expect(s.skillChoices).toHaveLength(2);const chosen=s.skillChoices[0];s=act(s,'SELECT_SKILL',{id:chosen.id});expect(s.player.skills[0].id).toBe(chosen.id);expect(s.player.deck[0].type).toBe('advanced');});
});
