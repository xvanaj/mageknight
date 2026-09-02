import { applyCharacterDeck, CHARACTER_PROFILES, EXTENDED_ACTIONS, EXTENDED_ARTIFACTS, EXTENDED_ENEMIES, EXTENDED_SPELLS, EXTENDED_UNITS, MAP_TILES } from './gameContent';

/*
 * A deterministic, UI-independent Mage Knight inspired rules engine.
 * Card and enemy definitions are intentionally data driven: the reducer owns
 * legality, so a different UI (or a remote server) cannot bypass the rules.
 */

export const COLORS = ['blue', 'red', 'green', 'white'];
export const TACTICS = {
  day: [
    { id:'early-bird', number:1, name:'Early Bird', effect:'choice', description:'Once on your first turn: Move 2 or Influence 1.' },
    { id:'rethink', number:2, name:'Rethink', effect:'cycle', description:'Once this round: discard up to two non-Wound cards and draw the same number.' },
    { id:'mana-steal', number:3, name:'Mana Steal', effect:'mana', description:'Once this round: gain a gold mana token during Day.' },
    { id:'planning', number:4, name:'Planning', effect:'hand', description:'Hand limit +1 while no earlier player is adjacent.' },
    { id:'great-start', number:5, name:'Great Start', effect:'draw', description:'When chosen, draw two cards.' },
    { id:'the-right-moment', number:6, name:'The Right Moment', effect:'extra-turn', description:'Once this round: take another turn immediately after this one.' },
  ],
  night: [
    { id:'from-the-dusk', number:1, name:'From the Dusk', effect:'choice', description:'Once on your first turn: Move 2 or Influence 1.' },
    { id:'long-night', number:2, name:'Long Night', effect:'long-night', description:'Once this round: return up to three discard cards to the Deed deck and shuffle.' },
    { id:'mana-search', number:3, name:'Mana Search', effect:'mana', description:'Once this round: gain a basic mana token of your choice.' },
    { id:'midnight-meditation', number:4, name:'Midnight Meditation', effect:'cycle', description:'Once this round: discard up to two non-Wound cards and draw that many plus one.' },
    { id:'preparation', number:5, name:'Preparation', effect:'prepare', description:'When chosen, put one selected card from the Deed deck into your hand.' },
    { id:'sparing-power', number:6, name:'Sparing Power', effect:'spare', description:'Once this round: carry up to 3 unused Move, Influence, Attack, or Block into your next turn.' },
  ],
};
export const TERRAIN_COST = {
  day: { plains: 2, hills: 3, forest: 3, desert: 5, wasteland: 4, swamp: 5, lake: Infinity, mountain: Infinity },
  night: { plains: 2, hills: 3, forest: 5, desert: 3, wasteland: 4, swamp: 5, lake: Infinity, mountain: Infinity },
};

export const SITES = {
  portal: { name:'Portal', kind:'safe', rule:'Safe starting space. No interaction or combat.' },
  village: { name:'Village', kind:'inhabited', rule:'Recruit village units; buy Healing for 3 Influence per point; or plunder for two cards and Reputation -1.' },
  glade: { name:'Magical Glade', kind:'passive', rule:'At the end of your turn, throw away one Wound from hand or discard. Start a turn here with a gold mana token by Day or black by Night.' },
  mine: { name:'Crystal Mine', kind:'passive', rule:'At the end of your turn, gain one crystal of the mine color, up to three.' },
  keep: { name:'Keep', kind:'fortified', rule:'Assault the gray defender. Once conquered, recruit keep units here and increase hand limit while on or adjacent to an owned keep.' },
  'mage-tower': { name:'Mage Tower', kind:'fortified', rule:'Assault the violet defender and gain a Spell. Once conquered, recruit tower units or buy a Spell for 7 Influence plus matching mana.' },
  monastery: { name:'Monastery', kind:'inhabited', rule:'Recruit monastery units, buy Healing for 2 Influence, or learn an Advanced Action for 6 Influence. It may be burned for Reputation -3 and an Artifact.' },
  rampaging: { name:'Orc Marauders', kind:'rampaging', rule:'Challenge from an adjacent space. Victory grants Reputation +1 in addition to Fame.' },
  draconum: { name:'Draconum', kind:'rampaging', rule:'Challenge from an adjacent space. Victory grants Reputation +2 in addition to Fame.' },
  dungeon: { name:'Dungeon', kind:'adventure', underground:true, rule:'Enter, then fight a brown enemy under Night rules without Units. Victory grants an Artifact.' },
  tomb: { name:'Tomb', kind:'adventure', underground:true, rule:'Enter, then fight a red enemy under Night rules without Units. Victory grants a Spell and an Artifact.' },
  'monster-den': { name:'Monster Den', kind:'adventure', rule:'Enter, then fight its brown enemy. Victory grants two random crystal rolls.' },
  'spawning-grounds': { name:'Spawning Grounds', kind:'adventure', rule:'Enter, then fight two brown enemies. Victory grants an Artifact and three random crystal rolls.' },
  ruins: { name:'Ancient Ruins', kind:'adventure', rule:'The revealed ruins token specifies an altar or enemies and its reward. This scenario uses the four-crystal cache.' },
  city: { name:'City', kind:'fortified', rule:'Assault the city garrison. Conquered cities provide color-specific interactions and a hand-limit bonus.' },
};

export const TOVAK_SKILLS = [
  { id:'cold-swordsmanship', name:'Cold Swordsmanship', cadence:'turn', modes:['physical','ice'], description:'Once a turn: Attack 2 or Ice Attack 2.' },
  { id:'double-time', name:'Double Time', cadence:'turn', description:'Once a turn: Move 2 by Day or Move 1 by Night.' },
  { id:'i-dont-give-a-damn', name:"I Don't Give a Damn!", cadence:'turn', description:'Once a turn, a sideways basic card gives 2 instead of 1 (advanced, spell, or artifact: 3).' },
  { id:'i-feel-no-pain', name:'I Feel No Pain', cadence:'turn', description:'Once a turn outside combat: discard a Wound from hand, then draw a card.' },
  { id:'night-sharpshooting', name:'Night Sharpshooting', cadence:'turn', description:'Once a turn: Ranged Attack 1 by Day or 2 by Night/underground.' },
  { id:'resistance-break', name:'Resistance Break', cadence:'turn', description:'Once a combat: one enemy gets Armor -1 for each Physical, Fire, or Ice Resistance it has.' },
  { id:'shield-mastery', name:'Shield Mastery', cadence:'turn', modes:['physical','fire','ice'], description:'Once a turn: Block 3, Fire Block 2, or Ice Block 2.' },
  { id:'who-needs-magic', name:'Who Needs Magic?', cadence:'turn', description:'Once a turn, a sideways card gives 2; it gives 3 if no Source die is used this turn.' },
  { id:'motivation', name:'Motivation', cadence:'round', description:'Once a round: draw two cards and gain a blue mana token.' },
  { id:'mana-overload', name:'Mana Overload', cadence:'round', description:'Once a round: gain a basic mana token; the next card powered with that color gets +4 to one Move, Influence, Attack, or Block effect.' },
];

export { CHARACTER_PROFILES };

const CARDS = [
  ['march', 'March', 'green', { move: 2 }, { move: 4 }],
  ['stamina', 'Stamina', 'blue', { move: 2 }, { move: 4 }],
  ['swiftness', 'Swiftness', 'white', { move: 2 }, { ranged: 3 }],
  ['rage', 'Rage', 'red', { attack: 2 }, { attack: 4 }],
  ['determination', 'Determination', 'blue', { block: 2 }, { block: 5 }],
  ['promise', 'Promise', 'white', { influence: 2 }, { influence: 4 }],
  ['threaten', 'Threaten', 'red', { influence: 2, reputation: -1 }, { influence: 5, reputation: -2 }],
  ['tranquility', 'Tranquility', 'green', { heal: 1 }, { heal: 2 }],
  ['crystallize', 'Crystallize', 'blue', { mana: 'crystal' }, { mana: 'crystal', draw: 1 }],
  ['mana-draw', 'Mana Draw', 'white', { mana: 'token' }, { mana: 'token', draw: 1 }],
  ['concentration', 'Concentration', 'green', { any: 1 }, { any: 2 }],
  ['improvisation', 'Improvisation', 'red', { any: 1 }, { any: 3, discardRequired: true }],
  ['battle-versatility', 'Battle Versatility', 'red', { attack: 2 }, { attack: 4 }],
  ['cold-toughness', 'Cold Toughness', 'blue', { block: 2 }, { block: 5 }],
  ['noble-manners', 'Noble Manners', 'white', { influence: 2 }, { influence: 4, fame: 1 }],
  ['instinct', 'Instinct', 'green', { move: 2 }, { move: 4 }],
].map(([id, name, color, basic, strong]) => ({ id, name, color, basic, strong }));

export const ENEMIES = {
  prowlers: { id: 'prowlers', name: 'Orc Prowlers', armor: 3, attack: 4, fame: 2, traits: ['swift'] },
  diggers: { id: 'diggers', name: 'Orc Diggers', armor: 4, attack: 3, fame: 2, traits: ['fortified'] },
  golem: { id: 'golem', name: 'Iron Golem', armor: 4, attack: 5, fame: 3, traits: ['physical-resistant'] },
  mage: { id: 'mage', name: 'Fire Mage', armor: 4, attack: 5, fame: 4, traits: ['fire', 'fortified'] },
  guards: { id: 'guards', name: 'Keep Guards', armor: 5, attack: 4, fame: 4, traits: ['fortified'] },
  dragon: { id: 'dragon', name: 'Fire Dragon', armor: 7, attack: 7, fame: 8, traits: ['fire', 'brutal'] },
  city: { id: 'city', name: 'City Garrison', armor: 8, attack: 7, fame: 10, traits: ['fortified', 'brutal'] },
  tomb: { id:'tomb', name:'Crypt Guardian', armor:6, attack:6, fame:5, traits:['fire','physical-resistant'] },
  den: { id:'den', name:'Cave Monster', armor:5, attack:5, fame:4, traits:[] },
  spawn: { id:'spawn', name:'Spawn Pair', armor:8, attack:8, fame:7, traits:['brutal'] },
  ...EXTENDED_ENEMIES,
};

const ENEMY_POOLS={
  orc:['prowlers','prowlers','diggers','diggers','orcTrackers','orcTrackers','orcSummoners','orcSummoners'],grey:['guards','guards','guards','golem','golem','gargoyles','gargoyles','gargoyles'],violet:['mage','mage','mage','medusa','medusa','iceGolems','iceGolems','iceGolems'],brown:['golem','golem','den','den','cryptWorm','cryptWorm','medusa','medusa'],red:['tomb','tomb','tomb','iceDragon','iceDragon','highDragon','highDragon','highDragon'],dragon:['dragon','dragon','dragon','iceDragon','iceDragon','iceDragon','highDragon','highDragon'],white:['guards','guards','mage','mage','gargoyles','gargoyles','golem','golem','city','city','guards','mage','gargoyles','golem','city','city'],
};

export const UNITS = [
  { id: 'peasants', name: 'Peasants', level: 1, cost: 4, armor: 3, sites: ['village'], ability: { influence: 2 } },
  { id: 'herbalists', name: 'Herbalists', level: 1, cost: 5, armor: 3, sites: ['village', 'monastery'], ability: { heal: 2 } },
  { id: 'utem-guardsmen', name: 'Utem Guardsmen', level: 1, cost: 5, armor: 4, sites: ['village', 'keep'], ability: { block: 4 } },
  { id: 'utem-crossbowmen', name: 'Utem Crossbowmen', level: 1, cost: 6, armor: 4, sites: ['village', 'keep'], ability: { ranged: 3 } },
  { id: 'red-cape-monks', name: 'Red Cape Monks', level: 2, cost: 7, armor: 4, sites: ['monastery'], ability: { attack: 5 } },
  { id:'illusionists',name:'Illusionists',level:2,cost:7,armor:4,sites:['mage-tower'],ability:{block:5} },
  { id:'fire-mages',name:'Fire Mages',level:3,cost:9,armor:5,sites:['city'],elite:true,ability:{siege:5} },
  ...EXTENDED_UNITS,
];

const ADVANCED_CARDS = [
  {id:'path-finding',name:'Path Finding',color:'green',type:'advanced',basic:{move:3},strong:{move:5}},
  {id:'blood-rage',name:'Blood Rage',color:'red',type:'advanced',basic:{attack:3},strong:{attack:6}},
  {id:'diplomacy',name:'Diplomacy',color:'white',type:'advanced',basic:{influence:3},strong:{influence:6}},
  ...EXTENDED_ACTIONS,
];
const SPELL_CARDS = [
  {id:'fireball',name:'Fireball',color:'red',type:'spell',basic:{siege:5},strong:{siege:8}},
  {id:'restoration',name:'Restoration',color:'green',type:'spell',basic:{heal:3},strong:{heal:5}},
  {id:'meditation',name:'Meditation',color:'blue',type:'spell',basic:{draw:2},strong:{draw:3}},
  ...EXTENDED_SPELLS,
];
const ARTIFACT_CARDS = [
  {id:'banner-of-glory',name:'Banner of Glory',color:'white',type:'artifact',basic:{influence:4},strong:{influence:7}},
  {id:'sword-of-justice',name:'Sword of Justice',color:'red',type:'artifact',basic:{attack:5},strong:{attack:8}},
  {id:'endless-gem-pouch',name:'Endless Gem Pouch',color:'blue',type:'artifact',basic:{mana:'crystal'},strong:{draw:2}},
  ...EXTENDED_ARTIFACTS,
];

export const CONTENT_COUNTS={advancedActions:ADVANCED_CARDS.length,spells:SPELL_CARDS.length,artifacts:ARTIFACT_CARDS.length,units:UNITS.length,characters:Object.keys(CHARACTER_PROFILES).length};
export const SCENARIO_TILE_COUNTS={
  'full-conquest':{1:{countryside:7,city:2,nonCity:2},2:{countryside:8,city:2,nonCity:1},3:{countryside:9,city:3,nonCity:2},4:{countryside:11,city:4,nonCity:3}},
  'blitz-conquest':{1:{countryside:6,city:2,nonCity:1},2:{countryside:6,city:2,nonCity:1},3:{countryside:7,city:3,nonCity:2},4:{countryside:9,city:4,nonCity:3}},
  'cooperative-conquest':{1:{countryside:7,city:2,nonCity:2},2:{countryside:8,city:3,nonCity:2},3:{countryside:10,city:4,nonCity:3}},
};

const clone = value => JSON.parse(JSON.stringify(value));
const isBanner=card=>card?.type==='artifact'&&card.id?.startsWith('banner-');
const migrateState=state=>{
  const players=state.players||[state.player];players.filter(Boolean).forEach(player=>{player.removed=player.removed||[];player.defeated=player.defeated||[];player.tacticUsed=Boolean(player.tacticUsed);player.skipNextTurn=Boolean(player.skipNextTurn);player.roundOrderFaceDown=Boolean(player.roundOrderFaceDown);player.cardsPlayedThisTurn=player.cardsPlayedThisTurn??player.played?.length??0;player.atTurnStart=Boolean(player.atTurnStart);player.emptyHandPassAllowed=Boolean(player.emptyHandPassAllowed);player.movedThisTurn=Boolean(player.movedThisTurn);player.moveHistory=player.moveHistory||[];player.turnAction=player.turnAction||null;player.cityInfluenceApplied=Boolean(player.cityInfluenceApplied);player.units=(player.units||[]).map(unit=>({...unit,wounded:Boolean(unit.wounded),woundCount:unit.woundCount||0,banner:unit.banner?{...unit.banner,used:Boolean(unit.banner.used)}:null}));});
  state.scenarioFinalTurnsStarted=Boolean(state.scenarioFinalTurnsStarted);
  state.enemyDiscards=state.enemyDiscards||{};Object.keys(ENEMY_POOLS).forEach(category=>{state.enemyDiscards[category]=state.enemyDiscards[category]||[];});
  state.decks=state.decks||{};state.offer.monastery=state.offer.monastery||[];const offeredIds=new Set((state.offer?.units||[]).map(unit=>unit.id));state.decks.regularUnits=state.decks.regularUnits||clone(UNITS.filter(unit=>!unit.elite&&!offeredIds.has(unit.id)));state.decks.eliteUnits=state.decks.eliteUnits||clone(UNITS.filter(unit=>unit.elite&&!offeredIds.has(unit.id)));state.enemyDecks=state.enemyDecks||createEnemyDecks(state.seed||1);state.enemyDiscards=state.enemyDiscards||{};state.enemyDiscards.brown=state.enemyDiscards.brown||[];state.scenarioEndTurnsRemaining=state.scenarioEndTurnsRemaining??null;state.roundWasAnnounced=Boolean(state.roundWasAnnounced);state.undoBlockedReason=state.undoBlockedReason||null;state.removedTactics=state.removedTactics||{day:[],night:[]};state.removedTactics.day=state.removedTactics.day||[];state.removedTactics.night=state.removedTactics.night||[];state.pendingTacticRemoval=state.pendingTacticRemoval||null;state.commonSkills=state.commonSkills||[];if(state.combat){state.combat.damageUnits=state.combat.damageUnits||[];state.combat.damageAssignedUnitIds=state.combat.damageAssignedUnitIds||[];state.combat.enemies=state.combat.enemies||clone(state.combat.enemy?.members||[state.combat.enemy].filter(Boolean));state.combat.defeatedIds=state.combat.defeatedIds||[];state.combat.blockedIds=state.combat.blockedIds||[];}state.version=5;return state;
};
const enemyGroup=members=>{const list=members.map(clone);return {id:list.map(enemy=>enemy.id).join('+'),uid:list.map(enemy=>enemy.uid||enemy.id).join('|'),name:list.length>1?`${list.length} defenders`:list[0].name,armor:list.reduce((sum,enemy)=>sum+enemy.armor,0),attack:list.reduce((sum,enemy)=>sum+enemy.attack,0),fame:list.reduce((sum,enemy)=>sum+enemy.fame,0),traits:[...new Set(list.flatMap(enemy=>enemy.traits||[]))],members:list};};
const enemyKey=enemy=>enemy.uid||enemy.id;
const withCityBonus=(enemy,color)=>{const result=clone(enemy),traits=new Set(result.traits||[]),elemental=['fire','ice','coldfire'].find(type=>traits.has(type));if(color==='white')result.armor++;if(color==='blue'&&elemental)result.attack+=elemental==='coldfire'?1:2;if(color==='red'&&!elemental)traits.add('brutal');if(color==='green'&&!elemental)traits.add('poison');result.traits=[...traits];return result;};
const livingCombatEnemies=state=>(state.combat?.enemies||[state.combat?.enemy].filter(Boolean)).filter(enemy=>!(state.combat?.defeatedIds||[]).includes(enemyKey(enemy)));
const chosenCombatEnemies=(state,ids)=>{const living=livingCombatEnemies(state);if(!ids?.length)return living;const chosen=new Set(ids);return living.filter(enemy=>chosen.has(enemyKey(enemy)));};
const markCombatDefeated=(state,enemies)=>{state.combat.defeatedIds=state.combat.defeatedIds||[];const site=state.map.find(hex=>hex.q===state.combat.q&&hex.r===state.combat.r),identity=state.player.id||state.player.character;for(const enemy of enemies){const id=enemyKey(enemy);if(state.combat.defeatedIds.includes(id))continue;state.combat.defeatedIds.push(id);if(site?.site==='city'&&state.combat.enemySources?.[id]?.siteDefender){site.cityShields=site.cityShields||{};site.cityShieldOrder=site.cityShieldOrder||[];site.cityShields[identity]=(site.cityShields[identity]||0)+1;site.cityShieldOrder.push(identity);}}};
const spendCombatPoints=(state,keys)=>keys.forEach(key=>{state.points[key]=0;});
const effectiveBlock=(state,enemy)=>{const traits=enemy.traits||[];const physical=state.points.block,ice=state.points.iceBlock,fire=state.points.fireBlock;if(traits.includes('coldfire'))return Math.floor((physical+ice+fire)/2);if(traits.includes('fire'))return ice+Math.floor((physical+fire)/2);if(traits.includes('ice'))return fire+Math.floor((physical+ice)/2);return physical+ice+fire;};
const resistedAttack=(enemy,type,amount)=>Math.floor(amount/((enemy.traits||[]).includes(`${type}-resistant`)?2:1));
const canDefeatWithAttack=(enemies,power)=>{
  const memo=new Map(),search=(index,physical,ice,fire)=>{
    if(index>=enemies.length)return true;const key=`${index}:${physical}:${ice}:${fire}`;if(memo.has(key))return memo.get(key);const enemy=enemies[index],limit=Math.max(0,enemy.armor||0)*2;
    for(let usedPhysical=0;usedPhysical<=Math.min(physical,limit);usedPhysical++)for(let usedIce=0;usedIce<=Math.min(ice,limit);usedIce++){
      const remaining=Math.max(0,enemy.armor-resistedAttack(enemy,'physical',usedPhysical)-resistedAttack(enemy,'ice',usedIce)),usedFire=(enemy.traits||[]).includes('fire-resistant')?remaining*2:remaining;
      if(usedFire<=fire&&search(index+1,physical-usedPhysical,ice-usedIce,fire-usedFire)){memo.set(key,true);return true;}
    }
    memo.set(key,false);return false;
  };
  return search(0,power.physical,power.ice,power.fire);
};
const rangedRequirements=enemies=>enemies.reduce((totals,enemy)=>{const fortifications=Number(Boolean(enemy.siteFortified))+Number((enemy.traits||[]).includes('fortified')),raw=enemy.armor*((enemy.traits||[]).includes('physical-resistant')?2:1);if(fortifications>1)totals.impossible=true;else totals[fortifications?'siege':'open']+=raw;return totals;},{siege:0,open:0,impossible:false});
const blockEnemyKey=enemy=>enemy.summonerId||enemyKey(enemy);
const attackingCombatEnemies=state=>state.combat?.blockEnemies||livingCombatEnemies(state);
const distance = (a, b) => (Math.abs(a.q-b.q) + Math.abs(a.r-b.r) + Math.abs((-a.q-a.r)-(-b.q-b.r))) / 2;
const playerById=(state,id)=>state.players.find(player=>player.id===id);
const shuffled = (items, seed) => {
  const result = [...items]; let x = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) { x = (1664525*x + 1013904223) >>> 0; const j = x % (i+1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
};
const tileRowDistance=(a,b)=>(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs((-a[0]-a[1])-(-b[0]-b[1])))/2;
const connectedTileOrder=(tiles,revealedRows,seed)=>{
  const remaining=shuffled(tiles,seed),ordered=[];
  while(remaining.length){const index=remaining.findIndex(tile=>tile.hexes.some(row=>revealedRows.some(revealed=>tileRowDistance(row,revealed)===1)));if(index<0){ordered.push(...remaining.splice(0));break;}const [tile]=remaining.splice(index,1);ordered.push(tile);revealedRows.push(...tile.hexes);}
  return ordered;
};
const buildTileDeck=(seed,startingTileIds=[],selectedTileIds=MAP_TILES.map(tile=>tile.id))=>{
  const selected=new Set(selectedTileIds),starting=new Set(startingTileIds),revealedRows=[[0,0],...MAP_TILES.filter(tile=>selected.has(tile.id)&&starting.has(tile.id)).flatMap(tile=>tile.hexes)],countryside=connectedTileOrder(MAP_TILES.filter(tile=>selected.has(tile.id)&&!tile.core&&!starting.has(tile.id)),revealedRows,seed+23),core=connectedTileOrder(MAP_TILES.filter(tile=>selected.has(tile.id)&&tile.core&&!starting.has(tile.id)),revealedRows,seed+29);
  return [...countryside,...core].map(tile=>tile.id);
};
const scenarioTileIds=(scenario,playerCount)=>{const setup=SCENARIO_TILE_COUNTS[scenario]?.[playerCount]||SCENARIO_TILE_COUNTS['full-conquest'][Math.min(4,Math.max(1,playerCount))],countryside=MAP_TILES.filter(tile=>!tile.core).slice(0,setup.countryside),cities=MAP_TILES.filter(tile=>tile.core&&tile.cityCore).slice(0,setup.city),nonCities=MAP_TILES.filter(tile=>tile.core&&!tile.cityCore).slice(0,setup.nonCity);return [...countryside,...cities,...nonCities].map(tile=>tile.id);};
const rollSource=(count,time,seed)=>{const faces=[...COLORS,'gold','black',...COLORS],colors=shuffled(faces,seed+(time==='night'?97:0)).slice(0,count),required=Math.ceil(count/2);let basics=colors.filter(color=>COLORS.includes(color)).length;for(let index=0;index<colors.length&&basics<required;index++)if(!COLORS.includes(colors[index])){colors[index]=COLORS[(seed+index*17)%COLORS.length];basics++;}return colors.map((color,index)=>({id:`die-${index}`,color,used:false}));};
const log = (state, message) => { state.log.unshift({ turn: state.turn, round: state.round, message }); state.log = state.log.slice(0, 80); };
const fail = (state, error) => ({ ...state, error });
const checkpointTurn=state=>{const snapshot=clone({...state,undoCheckpoint:null});delete snapshot.undoCheckpoint;snapshot.undoBlockedReason=null;state.undoCheckpoint=snapshot;state.undoBlockedReason=null;};
const lockUndo=(state,reason)=>{if(state.undoCheckpoint){state.undoCheckpoint=null;state.undoBlockedReason=reason;}};
const FAME_LEVELS=[0,3,8,15,24,35,48,63,80,99];
const levelFor = fame => Math.min(10,FAME_LEVELS.filter(value=>fame>=value).length);
const reputationInfluence=reputation=>({5:3,4:2,3:2,2:1,1:1,0:0,'-1':-1,'-2':-1,'-3':-2,'-4':-2,'-5':-3,'-6':-5}[reputation]??-99);
const baseHandLimit=player=>5+Math.floor((player.level-1)/4);
const handLimit = state => {
  const identity=state.player.id||state.player.character;
  const nearOwnedKeep=state.map.some(h=>h.site==='keep'&&h.conquered&&h.ownerId===identity&&distance(state.player,h)<=1);
  const cityBonus=state.map.reduce((bonus,h)=>h.site==='city'&&h.conquered&&distance(state.player,h)<=1&&(h.ownerId===identity||(h.conquerors||[]).includes(identity))?Math.max(bonus,h.ownerId===identity?2:1):bonus,0);
  const printedLimit=baseHandLimit(state.player);
  const planning=state.player.tactic?.id==='planning'&&!state.player.tacticUsed?1:0;
  return printedLimit+Math.max(nearOwnedKeep?(state.player.keeps||0):0,cityBonus)+planning;
};

const prepareMap=(exploration,selectedTileIds=MAP_TILES.map(tile=>tile.id))=>{
  const selected=new Set(selectedTileIds);
  const portal={q:0,r:0,s:0,terrain:'plains',site:'portal',enemy:null,enemies:[],tileId:'portal',core:false,enemyCategory:null,enemyFaceDown:false,revealed:true};
  const hexes=MAP_TILES.filter(tile=>selected.has(tile.id)).flatMap(tile=>tile.hexes.map(row=>{const [q,r,terrain,site=null,enemyId=null,cityColor=null]=row,category=site==='rampaging'?'orc':site==='draconum'?'dragon':site==='keep'?'grey':site==='mage-tower'?'violet':['dungeon','monster-den','spawning-grounds'].includes(site)?'brown':site==='tomb'?'red':null,baseEnemy=enemyId?clone(ENEMIES[enemyId]):null,enemy=baseEnemy?{...baseEnemy,category,uid:`${q}:${r}:${enemyId}`}:null;return {q,r,s:-q-r,terrain,site,mineColor:site==='mine'?COLORS[(Math.abs(q)+Math.abs(r))%4]:undefined,enemy,enemies:enemy?[clone(enemy)]:[],cityColor,tileId:tile.id,core:Boolean(tile.core),enemyCategory:category,enemyFaceDown:['keep','mage-tower','city'].includes(site)&&Boolean(enemy),conquered:false,burned:false,used:false,revealed:!exploration};}));
  return [portal,...hexes];
};

const createEnemyDecks=seed=>Object.fromEntries(Object.entries(ENEMY_POOLS).map(([category,ids],index)=>[category,shuffled(ids.map((id,copy)=>({...clone(ENEMIES[id]),category,uid:`${category}-${id}-${copy}`})),seed+101+index*19)]));
function drawEnemyToken(state,category){if(!state.enemyDecks[category]?.length&&state.enemyDiscards[category]?.length)state.enemyDecks[category]=shuffled(state.enemyDiscards[category].splice(0),state.seed+state.turn*83+category.length*19);return state.enemyDecks[category]?.shift()||null;}
function discardEnemyTokens(state,enemies){for(const enemy of enemies){if(!enemy.category||enemy.uid?.startsWith('rival-keep-'))continue;const token=clone(enemy);delete token.summonerId;state.enemyDiscards[enemy.category]=state.enemyDiscards[enemy.category]||[];state.enemyDiscards[enemy.category].push(token);}}
function revealEnemyTokens(state,tileId){state.map.filter(hex=>hex.tileId===tileId&&hex.enemyCategory&&hex.site!=='spawning-grounds').forEach(hex=>{const token=drawEnemyToken(state,hex.enemyCategory);if(token){hex.enemy={...token,uid:`${hex.q}:${hex.r}:${token.uid}`};hex.enemies=[clone(hex.enemy)];hex.enemyFaceDown=['keep','mage-tower'].includes(hex.site);}});}
function revealVisibleGarrisons(state){const players=state.players||[state.player];state.map.filter(hex=>hex.revealed!==false&&hex.enemyFaceDown&&hex.enemy&&['keep','mage-tower','city'].includes(hex.site)).forEach(hex=>{const adjacent=players.some(player=>distance(player,hex)<=1);if(adjacent&&(hex.site==='city'||state.time==='day'))hex.enemyFaceDown=false;});}
function setupRuins(state){state.map.filter(hex=>hex.site==='ruins').forEach((ruins,index)=>{const roll=(state.seed+index)%3;if(roll===0){ruins.enemy=null;ruins.ruinsToken={type:'altar',color:COLORS[(state.seed+index)%COLORS.length],fame:7,faceDown:false};}else if(roll===1)ruins.ruinsToken={type:'enemies',reward:'artifact',faceDown:false};else ruins.ruinsToken={type:'enemies',reward:'crystals',count:4,faceDown:false};});}

const makePlayer=(seed,character='tovak',name)=>{
  const profile=CHARACTER_PROFILES[character]||CHARACTER_PROFILES.tovak;
  const cards=applyCharacterDeck(CARDS,character);
  const deck=shuffled(cards.map((card,index)=>({...clone(card),uid:`${card.id}-${index}`})),seed);
  return {name:profile.name||name||'Mage Knight',character,q:0,r:0,fame:0,reputation:0,level:1,armor:profile.armor||2,command:1,deck:deck.slice(5),hand:deck.slice(0,5),discard:[],played:[],removed:[],wounds:0,crystals:{blue:0,red:0,green:0,white:0},units:[],keeps:0,cities:0,skills:[],defeated:[],assaults:0,pvpWins:0,tactic:null,tacticUsed:false,extraTurn:false,carry:null,skipNextTurn:false,roundOrderFaceDown:false,cardsPlayedThisTurn:0,atTurnStart:false,emptyHandPassAllowed:false,movedThisTurn:false,moveHistory:[],turnAction:null,cityInfluenceApplied:false};
};

export function createGame(seed = 20260901, options = {}) {
  const source = rollSource(3,'day',seed+9);
  const character=options.character||'tovak';const profile=CHARACTER_PROFILES[character]||CHARACTER_PROFILES.tovak;
  const advancedPool=shuffled(clone(ADVANCED_CARDS),seed+41),spellPool=shuffled(clone(SPELL_CARDS.filter(card=>!options.removeCompetitive||!card.competitive)),seed+51),regularUnits=shuffled(clone(UNITS.filter(unit=>!unit.elite)),seed+61),eliteUnits=shuffled(clone(UNITS.filter(unit=>unit.elite)),seed+62);
  const state = {
    version:5, seed, scenario: 'Solo Conquest', status: 'playing', round: 1, maxRounds:6, time: 'day', turn: 1, phase: options.tactics ? 'tactic' : 'action', tacticsEnabled:Boolean(options.tactics), tactic:null,
    map:prepareMap(Boolean(options.exploration),options.tileIds), tileDeck:buildTileDeck(seed,[],options.tileIds), exploredTiles:[], enemyDecks:createEnemyDecks(seed),enemyDiscards:Object.fromEntries(Object.keys(ENEMY_POOLS).map(category=>[category,[]])),explorationEnabled:Boolean(options.exploration), source,
    offer: { units:regularUnits.splice(0,3),advanced:advancedPool.splice(0,3),spells:spellPool.splice(0,3),monastery:[] },
    decks: { artifacts:shuffled(clone(ARTIFACT_CARDS),seed+31),advanced:advancedPool,spells:spellPool,regularUnits,eliteUnits },
    player:makePlayer(seed,character),
    skillDeck:shuffled(clone(profile.skills||TOVAK_SKILLS),seed+71), skillChoices:[], commonSkills:[],
    points: freshPoints(), mana: [], sourceTaken: false, combat: null, pendingRewards:[], bonuses:{sideways:null,manaOverload:null}, log: [], error: null,
    scoring:null,pvp:null,cooperativeAssault:null,scenarioEndTurnsRemaining:null,scenarioFinalTurnsStarted:false,roundWasAnnounced:false,removedTactics:{day:[],night:[]},pendingTacticRemoval:null,
  };
  state.player.atTurnStart=!options.tactics;
  setupRuins(state);
  revealVisibleGarrisons(state);
  if(!options.exploration&&state.map.some(hex=>hex.site==='monastery'&&!hex.burned)&&state.decks.advanced.length)state.offer.monastery.push(state.decks.advanced.shift());
  log(state, 'Solo Conquest begins. It is Day. Your first hand is ready.');
  if(state.phase==='action')checkpointTurn(state);
  return state;
}

export function createMultiplayerGame(lobby, seed = 20260901) {
  const playerCount=lobby.players.length,peaceful=playerCount===1||lobby.scenario==='cooperative-conquest',selectedTileIds=scenarioTileIds(lobby.scenario,playerCount);
  const state = createGame(seed, { tactics:true,exploration:true,removeCompetitive:peaceful,tileIds:selectedTileIds });
  const characterNames = {tovak:'Tovak',arythea:'Arythea',goldyx:'Goldyx',norowas:'Norowas',wolfhawk:'Wolfhawk',krang:'Krang',braevalar:'Braevalar'};
  const individualGames = lobby.players.map((member,index)=>createGame(seed+index*997,{character:member.character}));
  state.version=5;state.multiplayer=true;state.scenario=lobby.scenario;state.maxRounds=lobby.scenario==='blitz-conquest'?4:6;state.phase='tactic';state.tacticSelections={};state.turnOrder=[];state.activePlayerId=null;state.roundEndTurnsRemaining=null;state.tacticPickOrder=[...lobby.players].reverse().map(player=>player.id);state.tacticPickerId=state.tacticPickOrder[0];
  state.players=lobby.players.map((member,index)=>({...individualGames[index].player,id:member.id,playerName:member.name,character:member.character,name:characterNames[member.character]||member.name,connected:true,tactic:null}));
  if(lobby.scenario==='blitz-conquest')state.players.forEach(player=>{player.fame=1;player.reputation=2;});
  const extra=lobby.scenario==='blitz-conquest'?1:0;state.source=rollSource(lobby.players.length+2+extra,'day',seed+9);
  const cityLevels=lobby.scenario==='cooperative-conquest'?(playerCount===1?[5,8]:playerCount===2?[5,5,8]:[5,5,5,11]):lobby.scenario==='blitz-conquest'?Array.from({length:Math.max(2,playerCount)},()=>3):playerCount===1?[5,8]:Array.from({length:playerCount},()=>4),allCities=shuffled(state.map.filter(hex=>hex.site==='city'),seed+211),activeCities=allCities.slice(0,cityLevels.length),activeSet=new Set(activeCities.map(hex=>`${hex.q}:${hex.r}`));allCities.filter(hex=>!activeSet.has(`${hex.q}:${hex.r}`)).forEach(hex=>{hex.site=null;hex.cityColor=null;hex.enemy=null;hex.enemies=[];hex.enemyFaceDown=false;});
  activeCities.forEach((hex,index)=>{hex.level=cityLevels[index];hex.finalCity=index===cityLevels.length-1&&new Set(cityLevels).size>1;const count=Math.ceil(hex.level/3)+1;hex.enemies=Array.from({length:count},(_,slot)=>{const token=drawEnemyToken(state,'white')||{...clone(ENEMIES.city),category:'white'};return {...token,uid:`city-${index}-${slot}:${token.uid||token.id}`};});hex.enemy=enemyGroup(hex.enemies);hex.enemyFaceDown=true;});const spawning=state.map.find(hex=>hex.site==='spawning-grounds');if(spawning){spawning.enemies=[{...clone(ENEMIES.den),uid:'spawn-den'},{...clone(ENEMIES.golem),uid:'spawn-golem'}];spawning.enemy=enemyGroup(spawning.enemies);}
  const startingTileIds=['countryside-a','countryside-b',...(lobby.scenario==='cooperative-conquest'||playerCount>=4?['countryside-c']:[])];for(const tileId of startingTileIds){state.map.filter(hex=>hex.tileId===tileId).forEach(hex=>{hex.revealed=true;});revealEnemyTokens(state,tileId);}state.exploredTiles.push(...startingTileIds);state.tileDeck=buildTileDeck(seed,startingTileIds,selectedTileIds);revealVisibleGarrisons(state);const visibleMonasteries=state.map.filter(hex=>hex.revealed!==false&&hex.site==='monastery'&&!hex.burned).length;while(state.offer.monastery.length<visibleMonasteries&&state.decks.advanced.length)state.offer.monastery.push(state.decks.advanced.shift());
  while(state.offer.units.length<lobby.players.length+2+extra&&state.decks.regularUnits.length)state.offer.units.push(state.decks.regularUnits.shift());
  state.playerResources=Object.fromEntries(lobby.players.map((member,index)=>[member.id,{skillDeck:individualGames[index].skillDeck,skillChoices:[],bonuses:{sideways:null,manaOverload:null},pendingRewards:[]}]))
  if(peaceful){const unused=Object.keys(CHARACTER_PROFILES).filter(id=>!lobby.players.some(player=>player.character===id)),character=unused[seed%unused.length]||'goldyx',dummyPlayer=makePlayer(seed+7001,character),crystalRows={tovak:['blue','blue','white'],arythea:['red','red','green'],goldyx:['green','green','blue'],norowas:['white','white','green'],wolfhawk:['white','red','green'],krang:['red','blue','green'],braevalar:['green','blue','white']};state.dummy={id:'dummy',character,name:`${CHARACTER_PROFILES[character]?.name||character} dummy`,deck:shuffled([...dummyPlayer.hand,...dummyPlayer.deck],seed+7002),discard:[],crystals:Object.fromEntries(COLORS.map(color=>[color,(crystalRows[character]||[]).filter(item=>item===color).length])),skillDeck:shuffled(clone(CHARACTER_PROFILES[character]?.skills||[]),seed+7003),tactic:null};if(lobby.players.length>1)selectDummyTactic(state);}
  bindPlayerState(state,state.players[0].id);state.log=[];log(state,`${state.players.length}-player ${lobby.scenario.replaceAll('-',' ')} begins. Choose Day tactics.`);return state;
}

function bindPlayerState(state,playerId){
  if(!state.multiplayer)return state.player;
  const player=state.players.find(item=>item.id===playerId);if(!player)return null;
  state.player=player;const resources=state.playerResources[playerId];
  state.skillDeck=resources.skillDeck;state.skillChoices=resources.skillChoices;state.bonuses=resources.bonuses;state.pendingRewards=resources.pendingRewards;return player;
}

const availableTactics=state=>TACTICS[state.time].filter(tactic=>!(state.removedTactics?.[state.time]||[]).includes(tactic.id));

function selectDummyTactic(state){if(!state.dummy)return;const taken=new Set(Object.values(state.tacticSelections||{}).map(tactic=>tactic.id)),available=availableTactics(state).filter(tactic=>!taken.has(tactic.id));if(!available.length)return;const tactic=available[(state.seed+state.round*43+state.dummy.deck.length)%available.length];state.dummy.tactic=clone(tactic);state.tacticSelections.dummy=clone(tactic);log(state,`The dummy player took tactic ${tactic.number}.`);}

function takeDummyTurn(state){const dummy=state.dummy;if(!dummy)return false;if(!dummy.deck.length){if(state.roundEndTurnsRemaining===null){state.roundEndTurnsRemaining=state.players.length;state.roundWasAnnounced=true;log(state,'The dummy player announced the end of the round; every real player has one final turn.');}return true;}const flipped=dummy.deck.splice(0,Math.min(3,dummy.deck.length));dummy.discard.push(...flipped);const color=flipped[flipped.length-1]?.color,extra=Math.min(dummy.crystals[color]||0,dummy.deck.length);if(extra)dummy.discard.push(...dummy.deck.splice(0,extra));log(state,`The dummy player discarded ${flipped.length+extra} cards${color?` after revealing ${color}`:''}; ${dummy.deck.length} remain.`);return false;}

export function gameViewForPlayer(input,playerId){
  if(!input)return null;const state=migrateState(clone(input));if(!state.multiplayer)return state;
  const own=bindPlayerState(state,playerId);if(!own)return null;
  state.viewerPlayerId=playerId;state.players=state.players.map(player=>player.id===playerId?player:{...player,handCount:player.hand.length,deckCount:player.deck.length,discardCount:player.discard.length,hand:[],deck:[]});
  state.player=state.players.find(player=>player.id===playerId);if(playerId!==state.activePlayerId)state.points=freshPoints();if(state.pvp?.defenderId===playerId){state.mana=[...(state.pvp.defenderMana||[])];state.sourceTaken=Boolean(state.pvp.defenderSourceTaken);}state.publicExplorations=legalExplorations(state).map(({q,r,cost})=>({q,r,cost}));state.map=state.map.map(hex=>{if(hex.revealed===false)return {q:hex.q,r:hex.r,s:hex.s,core:hex.core,revealed:false};if(hex.enemyFaceDown&&hex.enemy&&!(state.combat?.q===hex.q&&state.combat?.r===hex.r))return {...hex,enemy:{id:'hidden-garrison',uid:`hidden-${hex.q}:${hex.r}`,name:'Hidden garrison',hidden:true},enemies:[]};if(hex.site==='ruins'&&hex.ruinsToken?.faceDown)return {...hex,ruinsToken:{type:'hidden',faceDown:true},enemy:hex.enemy?{id:'hidden-ruins',uid:`hidden-${hex.q}:${hex.r}`,name:'Hidden ruins',hidden:true}:null,enemies:[]};if(SITES[hex.site]?.underground&&hex.enemy&&!(state.combat?.q===hex.q&&state.combat?.r===hex.r))return {...hex,enemy:{id:'hidden-underground',uid:`hidden-${hex.q}:${hex.r}`,name:'Hidden defender',hidden:true},enemies:[]};return hex;});if(state.cooperativeAssault?.enemyAssignments)state.cooperativeAssault.enemyAssignments=Object.fromEntries(Object.entries(state.cooperativeAssault.enemyAssignments).map(([id,enemies])=>[id,id===playerId?enemies:enemies.map(()=>null)]));if(state.dummy)state.dummy={...state.dummy,deckCount:state.dummy.deck.length,discardCount:state.dummy.discard.length,deck:[],discard:[]};state.hiddenDeckCounts=Object.fromEntries(Object.entries(state.decks||{}).map(([name,cards])=>[name,cards.length]));state.hiddenEnemyCounts=Object.fromEntries(Object.entries(state.enemyDecks||{}).map(([name,cards])=>[name,cards.length]));state.tileDeckCount=state.tileDeck?.length||0;state.skillDeckCount=state.skillDeck?.length||0;state.canUndoTurn=Boolean(state.undoCheckpoint)&&playerId===state.activePlayerId;state.decks={};state.enemyDecks={};state.tileDeck=[];state.skillDeck=[];delete state.playerResources;delete state.undoCheckpoint;return state;
}

function freshPoints() { return { move: 0, influence: 0, heal: 0, attack: 0, block: 0, ranged: 0, siege: 0, iceAttack:0, fireAttack:0, iceBlock:0, fireBlock:0 }; }
function currentHex(state) { return state.map.find(h => h.q === state.player.q && h.r === state.player.r); }
const movementCost=(state,hex)=>hex?.site==='city'?2:TERRAIN_COST[state.time][hex?.terrain];
const isSafeSpace=(state,player,hex)=>{if(!hex||!Number.isFinite(TERRAIN_COST[state.time][hex.terrain]))return false;const identity=player.id||player.character,fortified=SITES[hex.site]?.kind==='fortified';if((fortified&&!hex.conquered)||(hex.site==='keep'&&hex.conquered&&hex.ownerId!==identity))return false;const sharedAllowed=hex.site==='portal'||(hex.site==='city'&&hex.conquered);return sharedAllowed||!(state.players||[]).some(other=>other.id!==player.id&&other.q===hex.q&&other.r===hex.r);};
const cardWithUid = (card,state) => ({...clone(card),uid:`${card.id}-${state.turn}-${state.player.deck.length}-${state.player.discard.length}`});
const resistanceCount = enemy => ['physical-resistant','fire-resistant','ice-resistant'].filter(t=>enemy.traits.includes(t)).length;
const isUnderground = state => Boolean(SITES[currentHex(state)?.site]?.underground);
function addEffect(state, effect, sidewaysAs, choices={}) {
  if (sidewaysAs) {
    const boosted=state.bonuses.sideways;
    state.points[sidewaysAs] += boosted?.value || 1;
    if(boosted)state.bonuses.sideways=null;
  }
  else Object.entries(effect).forEach(([type, amount]) => {
    if (type in state.points) state.points[type] += amount;
    else if (type === 'reputation') state.player.reputation += amount;
    else if (type === 'fame') gainFame(state, amount);
    else if (type === 'draw') draw(state, amount);
    else if(type==='any'||type==='anyCombat')state.points[choices.effectAs]+=amount;
    else if(type==='command')state.player.command+=amount;
    else if(type==='unitReady'){const unit=state.player.units.find(item=>item.id===choices.unitId);if(unit)unit.spent=false;}
    else if(type==='woundCost'&&amount>0)wound(state,amount);
    else if(type==='discardRequired'){}
    else if(type.endsWith('Crystal')){const color=type.replace('Crystal','');if(state.player.crystals[color]<3)state.player.crystals[color]++;}
    else if (type === 'mana') {
      const color = choices.manaColor;
      if (amount === 'crystal' && state.player.crystals[color] < 3) state.player.crystals[color]++;
      else state.mana.push(color);
    }
  });
}
function draw(state, count = 1) { if(count>0&&state.player.deck.length)lockUndo(state,'A card was drawn from a hidden deck.');while (count-- > 0 && state.player.deck.length) state.player.hand.push(state.player.deck.shift()); }
function spendMana(state, color) {
  let i = state.mana.indexOf(color);
  if (i >= 0) { state.mana.splice(i, 1); return true; }
  i = state.mana.indexOf('gold');
  if (state.time === 'day' && i >= 0) { state.mana.splice(i, 1); return true; }
  if (state.player.crystals[color] > 0) { state.player.crystals[color]--; return true; }
  return false;
}
const canSpendMana=(state,color)=>state.mana.includes(color)||(state.time==='day'&&state.mana.includes('gold'))||(state.player.crystals[color]||0)>0;
function gainFame(state, amount) {
  const old = state.player.level; state.player.fame += amount;if(state.scenario==='blitz-conquest'){let previous=old,current=levelFor(state.player.fame);while(current>previous){state.player.fame+=current-previous;previous=current;current=levelFor(state.player.fame);}}state.player.level = levelFor(state.player.fame);
  for(let level=old+1;level<=state.player.level;level++) {
    if(level%2===1){state.player.command++;state.player.armor++;}
    else if(state.skillDeck.length){lockUndo(state,'New Skill choices were revealed.');state.skillChoices.splice(0,state.skillChoices.length,...state.skillDeck.splice(0,Math.min(2,state.skillDeck.length)));if(state.multiplayer&&state.players.length===1&&state.dummy?.skillDeck?.length){const dummySkill=state.dummy.skillDeck.shift();state.commonSkills.push(dummySkill);log(state,`${state.dummy.name} added ${dummySkill.name} to the Common Skills offer.`);}}
    log(state, `Level up! You reached level ${level}${level%2===0?' and may choose a Skill.':'.'}`);
  }
}
function wound(state, count) { state.player.wounds += count; for (let i=0;i<count;i++) state.player.hand.push({ id:'wound', uid:`wound-${state.turn}-${i}-${state.player.wounds}`, name:'Wound', color:'wound', basic:{}, strong:{} }); }

export function legalMoves(state) {
  if(state.multiplayer&&state.viewerPlayerId&&state.viewerPlayerId!==state.activePlayerId)return [];
  if (state.phase !== 'action'||state.player.turnAction) return [];
  return state.map.filter(h => h.revealed!==false&&distance(state.player, h) === 1 && (!h.enemy || SITES[h.site]?.kind==='adventure')&&Number.isFinite(movementCost(state,h)))
    .map(h => ({ ...h, cost: movementCost(state,h), legal: state.points.move >= movementCost(state,h) }));
}
const isOccupiedByOpponent=(state,hex)=>Boolean(state.multiplayer&&hex.site!=='portal'&&state.players.some(player=>player.id!==state.player.id&&player.q===hex.q&&player.r===hex.r));
const provokingEnemies=(state,destination)=>state.map.filter(hex=>hex.revealed!==false&&hex.enemy&&['rampaging','draconum'].includes(hex.site)&&distance(state.player,hex)===1&&distance(destination,hex)===1);

export function legalExplorations(state){
  if(!state.explorationEnabled||state.phase!=='action'||state.player.turnAction)return [];
  if(state.publicExplorations)return state.publicExplorations.map(option=>({...option,legal:state.points.move>=2}));
  const nextTileId=state.tileDeck?.[0],ids=new Set();return state.map.filter(hex=>hex.revealed===false&&hex.tileId===nextTileId&&distance(state.player,hex)===1&&(!ids.has(hex.tileId)&&ids.add(hex.tileId))).map(hex=>({tileId:hex.tileId,q:hex.q,r:hex.r,cost:2,legal:state.points.move>=2}));
}

export function calculateScore(state){
  const players=state.multiplayer?state.players:[state.player];
  const cooperative=state.multiplayer&&state.scenario==='cooperative-conquest',solo=state.multiplayer&&players.length===1&&Boolean(state.dummy),mission=cooperative||solo;
  const rows=players.map(player=>{
    const cards=[...player.deck,...player.hand,...player.discard,...player.played,...player.units.map(unit=>unit.banner).filter(Boolean)],identity=player.id||player.character,owned=state.map.filter(hex=>hex.ownerId===identity),cityScore=state.map.filter(hex=>hex.site==='city'&&hex.conquered).reduce((sum,hex)=>sum+(hex.ownerId===identity?7:(hex.conquerors||[]).includes(identity)?4:0),0);
    const categories={knowledge:cards.filter(card=>card.type==='spell').length*2+cards.filter(card=>card.type==='advanced').length,loot:cards.filter(card=>card.type==='artifact').length*2+Math.floor(Object.values(player.crystals||{}).reduce((sum,value)=>sum+value,0)/2),leadership:player.units.reduce((sum,unit)=>sum+Math.floor((unit.level||0)*(unit.wounded?.5:1)),0),conquest:owned.filter(hex=>['keep','mage-tower','monastery'].includes(hex.site)).length*2,adventure:owned.filter(hex=>SITES[hex.site]?.kind==='adventure').length*2,wounds:-cards.filter(card=>card.id==='wound').length*2,city:mission?0:cityScore,achievements:0};
    return {playerId:player.id,name:player.playerName||player.name,fame:player.fame,categories,total:0};
  });
  if(state.multiplayer&&state.scenario!=='cooperative-conquest'&&rows.length>1){for(const category of ['knowledge','loot','leadership','conquest','adventure']){const best=Math.max(...rows.map(row=>row.categories[category]));if(best>0){const leaders=rows.filter(row=>row.categories[category]===best);leaders.forEach(row=>{row.categories.achievements+=leaders.length===1?3:1;});}}const worst=Math.min(...rows.map(row=>row.categories.wounds));if(worst<0){const beaten=rows.filter(row=>row.categories.wounds===worst);beaten.forEach(row=>{row.categories.achievements-=beaten.length===1?3:1;});}const bestCity=Math.max(...rows.map(row=>row.categories.city));if(bestCity>0){const cityLeaders=rows.filter(row=>row.categories.city===bestCity);cityLeaders.forEach(row=>{row.categories.achievements+=cityLeaders.length===1?5:2;});}}
  rows.forEach(row=>{row.total=row.fame+Object.values(row.categories).reduce((sum,value)=>sum+value,0);});rows.sort((a,b)=>b.total-a.total);
  const cities=state.map.filter(hex=>hex.site==='city'),conqueredCities=cities.filter(hex=>hex.conquered),allCities=Boolean(cities.length)&&conqueredCities.length===cities.length,roundsEarly=allCities?Math.max(0,(state.maxRounds||6)-state.round):0,dummyCards=state.dummy?.deck?.length||0,noAnnouncementBonus=mission&&!state.roundWasAnnounced?5:0,leaderBonus=cooperative&&players.every(player=>conqueredCities.some(hex=>hex.ownerId===player.id))?10:0,scenarioBonus=mission?{cities:conqueredCities.length*10,allCities:allCities?15:0,leaders:leaderBonus,early:roundsEarly*30,dummy:dummyCards,noAnnouncement:noAnnouncementBonus}:null,missionBonus=scenarioBonus?Object.values(scenarioBonus).reduce((sum,value)=>sum+value,0):0;
  if(solo)rows[0].total+=missionBonus;
  const teamTotal=cooperative?Math.min(...rows.map(row=>row.fame))+['knowledge','loot','leadership','conquest','adventure'].reduce((sum,category)=>sum+Math.max(...rows.map(row=>row.categories[category])),0)+Math.min(...rows.map(row=>row.categories.wounds))+missionBonus:solo?rows[0].total:rows.reduce((sum,row)=>sum+row.total,0);
  return {players:rows,teamTotal,winner:cooperative?null:rows[0]?.playerId||null,scenarioBonus,missionSuccess:mission?allCities:null};
}

export function reduceGame(input, action) {
  const state = migrateState(clone(input)); state.error = null;
  if(action.type==='CLEAR_ERROR')return state;
  if (state.status !== 'playing' && action.type !== 'NEW_GAME') return fail(state, 'This game has ended.');
  if (action.type === 'NEW_GAME') return createGame(action.seed || Date.now());
  if(state.multiplayer){
    const actorId=action.playerId;
    if(!actorId||!state.players.some(player=>player.id===actorId))return fail(state,'Unknown multiplayer actor.');
    if(action.type.startsWith('TEAM_')||(action.type!=='INITIATE_PVP'&&action.type.startsWith('PVP_')))return contributeRemote(state,action);
    if(state.phase==='tactic'&&!['SELECT_TACTIC','UNASSIGN_BANNER'].includes(action.type))return fail(state,'Every player must choose a tactic first.');
    if(state.phase!=='tactic'&&actorId!==state.activePlayerId)return fail(state,'It is not your turn.');
    bindPlayerState(state,actorId);
  }
  switch (action.type) {
    case 'UNDO_TURN': {if(!state.undoCheckpoint)return fail(state,state.undoBlockedReason||'There is no turn checkpoint to restore.');const restored=migrateState(clone(state.undoCheckpoint));if(restored.multiplayer)bindPlayerState(restored,restored.activePlayerId);log(restored,`${restored.player.name} reset the current turn to its last safe checkpoint.`);return restored;}
    case 'UNASSIGN_BANNER': {
      if(state.multiplayer)bindPlayerState(state,action.playerId);if(state.phase!=='tactic'&&!(state.phase==='action'&&state.player.atTurnStart))return fail(state,'A Banner may be detached only while preparing a round or at the start of your turn.');const unit=state.player.units.find(item=>item.id===action.unitId);if(!unit?.banner)return fail(state,'That Unit has no Banner.');state.player.discard.push(unit.banner);log(state,`${unit.banner.name} was detached from ${unit.name}.`);unit.banner=null;return state;
    }
    case 'REMOVE_TACTIC': {
      if(state.phase!=='tactic-removal'||!state.pendingTacticRemoval?.includes(action.id))return fail(state,'Choose one of the real players’ used tactics.');state.removedTactics[state.time].push(action.id);state.pendingTacticRemoval=null;log(state,`Tactic ${action.id} was removed from future ${state.time} rounds.`);return advanceRound(state);
    }
    case 'SELECT_TACTIC': {
      if(state.phase!=='tactic'||!state.tacticsEnabled)return fail(state,'Tactics are chosen only at the start of a round.');
      const tactic=TACTICS[state.time].find(item=>item.id===action.id);if(!tactic)return fail(state,`That is not a ${state.time} tactic.`);if(!availableTactics(state).some(item=>item.id===action.id))return fail(state,`That ${state.time} tactic is unavailable.`);
      if(state.multiplayer){
        if(action.playerId!==state.tacticPickerId)return fail(state,'Players choose tactics from lowest Fame upward. Wait for your pick.');
        if(state.tacticSelections[action.playerId])return fail(state,'You already chose a tactic this round.');
        if(Object.values(state.tacticSelections).some(selection=>selection.id===tactic.id))return fail(state,'Another player already chose that tactic.');
        if(tactic.effect==='prepare'&&!state.player.deck.some(card=>card.uid===action.cardUid))return fail(state,'Choose a card from your Deed deck for Preparation.');state.tacticSelections[action.playerId]=clone(tactic);state.player.tactic=clone(tactic);state.player.tacticUsed=false;applyTacticOnTake(state,tactic,action);log(state,`${state.player.name} chose ${tactic.name} (initiative ${tactic.number}).`);
        const realSelections=state.players.filter(player=>state.tacticSelections[player.id]).length;if(realSelections===state.players.length){if(state.dummy&&!state.tacticSelections.dummy)selectDummyTactic(state);state.turnOrder=[...state.players.map(player=>player.id),...(state.dummy?['dummy']:[])].sort((a,b)=>state.tacticSelections[a].number-state.tacticSelections[b].number);state.tacticPickerId=null;let firstIndex=0;if(state.turnOrder[firstIndex]==='dummy'){takeDummyTurn(state);firstIndex=(firstIndex+1)%state.turnOrder.length;}state.activePlayerId=state.turnOrder[firstIndex];bindPlayerState(state,state.activePlayerId);state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);state.phase='action';log(state,`${state.player.name} has the first real turn.`);checkpointTurn(state);}else state.tacticPickerId=state.tacticPickOrder.find(id=>!state.tacticSelections[id]);return state;
      }
      if(tactic.effect==='prepare'&&!state.player.deck.some(card=>card.uid===action.cardUid))return fail(state,'Choose a card from your Deed deck for Preparation.');state.tactic=clone(tactic);state.player.tactic=clone(tactic);state.player.tacticUsed=false;applyTacticOnTake(state,tactic,action);state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);state.phase='action';log(state,`${state.player.name} chose ${tactic.name} (initiative ${tactic.number}).`);checkpointTurn(state);return state;
    }
    case 'USE_TACTIC': {const result=activateTactic(state,action);if(!result.error)result.player.atTurnStart=false;return result;}
    case 'SELECT_SKILL': {
      const ownSkill=state.skillChoices.find(s=>s.id===action.id),commonSkill=state.commonSkills.find(s=>s.id===action.id),skill=ownSkill||commonSkill;if(!skill)return fail(state,'That Skill is not currently offered.');
      const advanced=commonSkill?state.offer.advanced[0]:state.offer.advanced.find(card=>card.id===action.advancedId);if(!advanced)return fail(state,commonSkill?'No Advanced Action is available.':'Choose an Advanced Action from the offer.');
      state.player.skills.push({...skill,used:false});if(commonSkill){state.commonSkills=state.commonSkills.filter(s=>s.id!==action.id);state.commonSkills.push(...state.skillChoices);}else state.commonSkills.push(...state.skillChoices.filter(s=>s.id!==action.id));state.skillChoices.splice(0);
      state.offer.advanced=state.offer.advanced.filter(card=>card.id!==advanced.id);state.player.deck.unshift(cardWithUid(advanced,state));
      if(state.decks.advanced.length)state.offer.advanced.push(state.decks.advanced.shift());
      log(state,`Learned ${skill.name}${advanced?` and gained ${advanced.name}`:''}.`); return state;
    }
    case 'USE_SKILL': {const result=activateSkill(state,action);if(!result.error)result.player.atTurnStart=false;return result;}
    case 'PREPARE_REWARD': return prepareReward(state);
    case 'CLAIM_REWARD': return claimReward(state,action);
    case 'TAKE_SOURCE': {
      if (state.sourceTaken) return fail(state, 'Only one Source die may be used per turn.');
      const die = state.source.find(d => d.id === action.id); if (!die) return fail(state, 'Unknown Source die.');
      if (die.color === 'black' && state.time === 'day') return fail(state, 'Black mana cannot be used during the Day.');
      if (die.color === 'gold' && state.time === 'night') return fail(state, 'Gold mana cannot be used during the Night.');
      lockUndo(state,'A Source die was rerolled.');state.mana.push(die.color); state.sourceTaken = true;state.player.atTurnStart=false;
      const faces = [...COLORS,'gold','black']; die.color = faces[(state.seed + state.turn * 7 + Number(die.id.slice(-1))) % faces.length];
      log(state, `Took ${state.mana[state.mana.length-1]} mana from the Source.`); return state;
    }
    case 'PLAY_CARD': {
      if (!['action','cooperative-entry','combat-ranged','combat-block','combat-attack'].includes(state.phase)) return fail(state, 'Cards cannot be played in this phase.');
      const index = state.player.hand.findIndex(c => c.uid === action.uid); if (index < 0) return fail(state, 'That card is not in your hand.');
      const card = state.player.hand[index]; if (card.id === 'wound') return fail(state, 'Wounds cannot be played.');
      const effect=card[action.mode]||{};
      if(effect.any&&!['move','influence','attack','block'].includes(action.effectAs))return fail(state,'Choose Move, Influence, Attack, or Block for this flexible effect.');
      if(effect.anyCombat&&!['ranged','siege','attack','block'].includes(action.effectAs))return fail(state,'Choose a combat power for this flexible effect.');
      if(effect.mana&&!COLORS.includes(action.manaColor))return fail(state,'Choose a basic mana color to gain.');
      if(effect.unitReady&&!state.player.units.some(unit=>unit.id===action.unitId&&unit.spent))return fail(state,'Choose a spent Unit to ready.');
      if(effect.discardRequired&&!state.player.hand.some(item=>item.uid===action.discardUid&&item.uid!==card.uid&&item.id!=='wound'))return fail(state,'Choose another non-Wound card to discard as the cost.');
      const combatStat = {'combat-ranged':['ranged','siege'],'combat-block':['block','iceBlock','fireBlock','coldfireBlock'],'combat-attack':['attack','iceAttack','fireAttack','ranged','siege']}[state.phase];
      if (combatStat) {
        const offered = action.mode === 'sideways' ? action.as : [action.effectAs,...Object.keys(effect).filter(k => effect[k])].filter(Boolean);
        const offeredStats = Array.isArray(offered) ? offered : [offered];
        if (!offeredStats.some(k => combatStat.includes(k))) return fail(state, `Only ${combatStat.join(' or ')} effects may be committed in this combat phase.`);
      }
      if(card.type==='spell'){
        if(action.mode==='sideways'){}else if(action.mode==='basic'){if(!canSpendMana(state,card.color))return fail(state,`Casting this Spell requires ${card.color} mana.`);spendMana(state,card.color);}else if(action.mode==='strong'){if(state.time!=='night')return fail(state,'The strong Spell effect can only be cast at Night.');if(!canSpendMana(state,card.color)||!state.mana.includes('black'))return fail(state,`The strong Spell requires ${card.color} and black mana.`);spendMana(state,card.color);state.mana.splice(state.mana.indexOf('black'),1);}else return fail(state,'Choose a Spell effect.');
      } else if(card.type!=='artifact'&&action.mode==='strong'&&!spendMana(state,card.color))return fail(state,`The strong action requires ${card.color} mana.`);
      if (action.mode === 'sideways' && !['move','influence','attack','block'].includes(action.as)) return fail(state, 'A sideways card provides Move, Influence, Attack, or Block 1.');
      if(action.mode==='sideways'&&state.bonuses.sideways?.advancedValue&&['advanced','spell','artifact'].includes(card.type))state.bonuses.sideways.value=state.bonuses.sideways.advancedValue;
      addEffect(state, effect, action.mode === 'sideways' ? action.as : null,action);
      if(action.mode==='strong'&&state.bonuses.manaOverload?.color===card.color){const stat=['move','influence','attack','block'].find(k=>(card.strong||{})[k]);if(stat){state.points[stat]+=4;log(state,`Mana Overload adds ${stat} 4.`);}state.bonuses.manaOverload=null;}
      const committedIndex=state.player.hand.findIndex(item=>item.uid===card.uid),committed=state.player.hand.splice(committedIndex,1)[0];if(effect.discardRequired){const discardIndex=state.player.hand.findIndex(item=>item.uid===action.discardUid);state.player.discard.push(state.player.hand.splice(discardIndex,1)[0]);}if(card.type==='artifact'&&action.mode==='strong')state.player.removed.push(committed);else state.player.played.push(committed);state.player.cardsPlayedThisTurn++;state.player.atTurnStart=false;log(state, `${card.name}: ${action.mode}${action.as||action.effectAs ? ` as ${action.as||action.effectAs}` : ''}.`); return state;
    }
    case 'DISCARD_CARD': return fail(state,'Cards are selected for discard only while ending the turn.');
    case 'USE_UNIT': {
      const unit = state.player.units.find(u => u.id === action.id); if (!unit || unit.spent||unit.wounded) return fail(state, 'That unit is unavailable or wounded.');
      if(state.combat && SITES[state.map.find(h=>h.q===state.combat.q&&h.r===state.combat.r)?.site]?.underground)return fail(state,'Units cannot be used in a Dungeon or Tomb.');
      const unitCombatStats={'combat-ranged':['ranged','siege'],'combat-block':['block','iceBlock','fireBlock'],'combat-attack':['attack','iceAttack','fireAttack','ranged','siege'],'cooperative-entry':['move']}[state.phase];if(unitCombatStats&&!unitCombatStats.some(stat=>unit.ability?.[stat]))return fail(state,`That Unit has no ability usable in the ${state.phase.replace('combat-','')} phase.`);if(!['action','cooperative-entry','combat-ranged','combat-block','combat-attack'].includes(state.phase))return fail(state,'That Unit cannot be activated in this phase.');
      addEffect(state, unit.ability); unit.spent = true;state.player.atTurnStart=false; log(state, `${unit.name} activated.`); return state;
    }
    case 'ASSIGN_BANNER': {
      if(state.phase!=='action')return fail(state,'Assign Banners during your turn.');const index=state.player.hand.findIndex(card=>card.uid===action.uid&&isBanner(card)),unit=state.player.units.find(item=>item.id===action.unitId);if(index<0)return fail(state,'That Banner is not in your hand.');if(!unit)return fail(state,'Choose one of your Units.');if(unit.banner)state.player.discard.push(unit.banner);unit.banner={...state.player.hand.splice(index,1)[0],used:false};state.player.atTurnStart=false;log(state,`${unit.banner.name} was assigned to ${unit.name}.`);return state;
    }
    case 'USE_BANNER': {
      if(!['action','combat-ranged','combat-block','combat-attack'].includes(state.phase))return fail(state,'That Banner cannot be used in this phase.');const unit=state.player.units.find(item=>item.id===action.unitId);if(!unit?.banner||unit.banner.used||unit.wounded)return fail(state,'That Unit’s Banner is unavailable.');addEffect(state,unit.banner.basic||{},null,action);unit.banner.used=true;state.player.atTurnStart=false;log(state,`${unit.name} used ${unit.banner.name}.`);return state;
    }
    case 'MOVE': {
      if (state.phase !== 'action') return fail(state, 'Finish combat before moving.');if(state.player.turnAction)return fail(state,'Movement must happen before your turn action.');
      const hex = state.map.find(h => h.q === action.q && h.r === action.r); if (!hex || distance(state.player,hex)!==1) return fail(state, 'You may only move to an adjacent revealed space.');
      if(hex.revealed===false)return fail(state,'Explore that map tile before moving onto it.');
      if (hex.enemy && SITES[hex.site]?.kind!=='adventure') return fail(state, 'An enemy blocks that space. Start combat to enter it.');
      const provoked=provokingEnemies(state,hex);
      if(isOccupiedByOpponent(state,hex)&&provoked.length)return fail(state,'You cannot enter an occupied space while provoking a rampaging enemy.');
      const cost = movementCost(state,hex); if (!Number.isFinite(cost)) return fail(state, 'That terrain is impassable.');
      if (state.points.move < cost) return fail(state, `You need ${cost} Move.`);
      const origin={q:state.player.q,r:state.player.r};state.player.moveHistory.push(origin);state.points.move -= cost; state.player.q=hex.q; state.player.r=hex.r;state.player.atTurnStart=false;state.player.movedThisTurn=true;if(hex.site==='ruins'&&hex.ruinsToken?.faceDown){lockUndo(state,'A face-down ruins token was revealed.');hex.ruinsToken.faceDown=false;log(state,'The ruins token was revealed after entering its space; you may now choose whether to enter the site.');}revealVisibleGarrisons(state);log(state, `Moved to ${hex.terrain}${hex.site ? ` / ${hex.site}`:''}.`);
      if(provoked.length){const enemies=provoked.flatMap(source=>(source.enemy.members||source.enemies||[source.enemy]).map(enemy=>clone(enemy))),enemySources=Object.fromEntries(provoked.flatMap(source=>(source.enemy.members||source.enemies||[source.enemy]).map(enemy=>[enemyKey(enemy),{q:source.q,r:source.r,site:source.site}])));state.points.heal=0;state.player.turnAction='combat';state.phase='combat-ranged';state.combat={q:null,r:null,origin,kind:'provoked',enemy:enemyGroup(enemies),enemies,enemySources,defeatedIds:[],blockedIds:[],blocked:false,woundsTaken:0,damageUnits:[]};log(state,`${provoked.map(item=>item.enemy.name).join(' and ')} attacked during movement.`);}
      return state;
    }
    case 'EXPLORE': {
      if(!state.explorationEnabled||state.phase!=='action')return fail(state,'Exploration is not available now.');if(state.player.turnAction)return fail(state,'Exploration must happen before your turn action.');
      const target=state.map.find(hex=>(action.tileId?hex.tileId===action.tileId:(hex.q===action.q&&hex.r===action.r))&&hex.revealed===false&&distance(state.player,hex)===1);if(!target)return fail(state,'That tile is not adjacent to your position.');
      if(target.tileId!==state.tileDeck?.[0])return fail(state,'Only the top map tile may be explored.');
      if(state.points.move<2)return fail(state,'Exploration requires 2 Move.');
      const tile=MAP_TILES.find(item=>item.id===target.tileId);const wildernessRemaining=state.map.some(hex=>hex.revealed===false&&!hex.core);
      if(tile?.core&&wildernessRemaining)return fail(state,'Reveal all countryside tiles before a core tile.');
      lockUndo(state,'A new map tile and its tokens were revealed.');state.points.move-=2;state.player.atTurnStart=false;state.player.movedThisTurn=true;state.map.filter(hex=>hex.tileId===target.tileId).forEach(hex=>{hex.revealed=true;if(hex.site==='ruins'&&state.time==='night'&&hex.ruinsToken)hex.ruinsToken.faceDown=true;});revealEnemyTokens(state,target.tileId);revealVisibleGarrisons(state);state.exploredTiles.push(target.tileId);state.tileDeck.shift();log(state,`${state.player.name} explored ${target.tileId}.`);return state;
    }
    case 'START_COOPERATIVE_ASSAULT': {
      if(state.player.turnAction)return fail(state,'Only one action may be taken each turn.');
      if(!state.multiplayer||state.scenario!=='cooperative-conquest')return fail(state,'Joint assaults are available in Cooperative Conquest.');
      if(state.roundEndTurnsRemaining!==null||state.scenarioEndTurnsRemaining!==null)return fail(state,'A joint assault cannot begin after the round or scenario ending was announced.');
      const hex=state.map.find(item=>item.q===action.q&&item.r===action.r);if(!hex?.enemy||hex.site!=='city')return fail(state,'Choose an unconquered city.');
      if(distance(state.player,hex)!==1)return fail(state,'The assault leader must be adjacent to the city.');
      if(state.players.some(player=>player.id!==state.player.id&&player.q===state.player.q&&player.r===state.player.r))return fail(state,'The assault leader must occupy an adjacent space alone.');
      const eligible=state.players.filter(player=>distance(player,hex)===1&&!player.roundOrderFaceDown&&player.hand.some(card=>card.id!=='wound')).map(player=>player.id);if(!eligible.includes(state.player.id)||eligible.length<2)return fail(state,'At least two suitable Mage Knights must be adjacent with a non-Wound card and an available next turn.');
      const defenders=clone(hex.enemy.members||hex.enemies||[hex.enemy]),requested=action.assignments||Object.fromEntries(eligible.map((id,index)=>[id,index<defenders.length?1:0])),assignments=Object.fromEntries(Object.entries(requested).filter(([,count])=>Number(count)>0).map(([id,count])=>[id,Number(count)])),invited=Object.keys(assignments);
      if(!invited.includes(state.player.id)||invited.length<2||invited.some(id=>!eligible.includes(id)))return fail(state,'Invite at least one suitable adjacent player and include the assault leader.');
      if(Object.values(assignments).some(count=>!Number.isInteger(count)||count<1)||Object.values(assignments).reduce((sum,count)=>sum+count,0)!==defenders.length)return fail(state,`Assign all ${defenders.length} city defenders, at least one to every invited player.`);
      const cost=movementCost(state,hex);if(state.points.move<cost)return fail(state,`The leader needs ${cost} Move to enter the city.`);
      const order=state.turnOrder.filter(id=>invited.includes(id)),leaderIndex=order.indexOf(state.player.id),participantOrder=[...order.slice(leaderIndex),...order.slice(0,leaderIndex)];state.cooperativeAssault={q:hex.q,r:hex.r,leaderId:state.player.id,eligible,invited,assignments,participantOrder,accepted:[state.player.id],stage:'proposal',enemyAssignments:null,origins:Object.fromEntries(invited.map(id=>{const player=playerById(state,id);return [id,{q:player.q,r:player.r}];}))};state.phase='team-assault';log(state,`The leader proposed a joint assault on the ${hex.cityColor} city.`);return state;
    }
    case 'INITIATE_PVP': {
      if(state.player.turnAction)return fail(state,'Only one action may be taken each turn.');
      if(!state.multiplayer||state.scenario==='cooperative-conquest')return fail(state,'PvP is disabled in Cooperative Conquest.');
      const defender=state.players.find(player=>player.id===action.targetId);if(!defender||defender.id===state.player.id)return fail(state,'Choose another player.');
      if(state.roundEndTurnsRemaining!==null||state.scenarioEndTurnsRemaining!==null)return fail(state,'PvP cannot begin after an end-of-round or end-game announcement.');if(defender.roundOrderFaceDown)return fail(state,'That player is protected until their skipped turn.');
      const targetHex=state.map.find(hex=>hex.q===defender.q&&hex.r===defender.r);if(!targetHex||targetHex.revealed===false)return fail(state,'The defender’s space must be revealed.');if(['portal','city'].includes(targetHex.site))return fail(state,'PvP is not allowed on a portal or city space.');const range=distance(state.player,defender);if(range>1)return fail(state,'You must enter the defender’s space to initiate PvP.');
      if(range===1){if(targetHex.enemy)return fail(state,'A hostile enemy prevents entry into that space.');const provoked=provokingEnemies(state,targetHex);if(provoked.length)return fail(state,'You cannot enter for PvP while provoking a rampaging enemy.');const cost=movementCost(state,targetHex);if(!Number.isFinite(cost)||state.points.move<cost)return fail(state,`Entering the defender’s space requires ${Number.isFinite(cost)?cost:'legal'} Move.`);state.player.moveHistory.push({q:state.player.q,r:state.player.r});state.points.move-=cost;state.player.q=defender.q;state.player.r=defender.r;if(targetHex.site==='keep'&&targetHex.ownerId===defender.id)state.player.reputation=Math.max(-7,state.player.reputation-1);}
      state.points.heal=0;state.player.turnAction='combat';state.pvp={attackerId:state.player.id,defenderId:defender.id,phase:'attend',attendance:null,currentAttackerId:null,stage:'attend',passes:0,attackPower:0,attackElements:[],blockPower:0,blockTypes:{physical:0,fire:0,ice:0,coldfire:0},damageRemaining:0,prepared:{[state.player.id]:{ranged:state.points.ranged,siege:state.points.siege,attack:state.points.attack,iceAttack:state.points.iceAttack,fireAttack:state.points.fireAttack,block:state.points.block,iceBlock:state.points.iceBlock,fireBlock:state.points.fireBlock},[defender.id]:freshPoints()}};spendCombatPoints(state,['ranged','siege','attack','iceAttack','fireAttack','block','iceBlock','fireBlock']);state.phase='pvp-attend';log(state,`${state.player.name} entered ${defender.name}'s space and initiated PvP.`);return state;
    }
    case 'START_COMBAT': {
      if (state.phase !== 'action') return fail(state, 'Already resolving an action.');if(state.player.turnAction)return fail(state,'Only one action may be taken each turn.');
      const hex=state.map.find(h=>h.q===action.q&&h.r===action.r),identity=state.player.id||state.player.character,rivalKeep=hex?.site==='keep'&&hex.conquered&&hex.ownerId!==identity;
      if(rivalKeep&&state.players?.some(player=>player.id===hex.ownerId&&player.q===hex.q&&player.r===hex.r))return fail(state,'The keep owner is present; initiate PvP instead.');
      let rivalKeepToken=null,combatEnemy=hex?.enemy;if(rivalKeep&&!combatEnemy){const token=state.enemyDecks.grey.shift();if(!token)return fail(state,'No gray garrison token is available.');lockUndo(state,'A hidden keep garrison was revealed.');rivalKeepToken=clone(token);combatEnemy={...clone(token),uid:`rival-keep-${state.turn}-${token.uid||token.id}`,fame:Math.ceil(token.fame/2)};}
      if(!hex||!combatEnemy) return fail(state,'There is no enemy there.');
      if(hex.revealed===false)return fail(state,'That enemy has not been revealed yet.');
      const kind=SITES[hex.site]?.kind;
      if(kind==='adventure' && distance(state.player,hex)!==0)return fail(state,'You must enter an adventure site before exploring it.');
      if(kind!=='adventure' && distance(state.player,hex)!==1)return fail(state,'You must be adjacent to that enemy.');
      if(SITES[hex.site]?.underground)lockUndo(state,'A hidden underground defender was revealed.');if(hex.enemyFaceDown){lockUndo(state,'A hidden fortified-site garrison was revealed.');hex.enemyFaceDown=false;}
      let origin={q:state.player.q,r:state.player.r};
      if(kind==='fortified'){
        const entryCost=movementCost(state,hex); if(state.points.move<entryCost)return fail(state,`The assault requires ${entryCost} Move to enter that terrain.`);
        state.points.move-=entryCost;state.player.reputation=Math.max(-7,state.player.reputation-1);
      }
      const defenders=clone(combatEnemy.members||(!rivalKeep&&hex.enemies)||[combatEnemy]).map(enemy=>({...((hex.site==='city')?withCityBonus(enemy,hex.cityColor):enemy),siteFortified:kind==='fortified'}));let enemies=defenders,enemySources=Object.fromEntries(defenders.map(enemy=>[enemyKey(enemy),{q:hex.q,r:hex.r,site:hex.site,siteDefender:true}]));
      if(kind==='fortified'){const mandatory=provokingEnemies(state,hex),eligible=state.map.filter(source=>source.revealed!==false&&source.enemy&&['rampaging','draconum'].includes(source.site)&&distance(source,hex)===1),challengeIds=new Set(action.challengeIds||[]),joined=[...new Map([...mandatory,...eligible.filter(source=>challengeIds.has(enemyKey(source.enemy)))].map(source=>[`${source.q}:${source.r}`,source])).values()];for(const source of joined){const members=clone(source.enemy.members||source.enemies||[source.enemy]).map(enemy=>({...enemy,siteFortified:false}));enemies.push(...members);members.forEach(enemy=>{enemySources[enemyKey(enemy)]={q:source.q,r:source.r,site:source.site,siteDefender:false};});}}
      state.points.heal=0;state.player.turnAction='combat';state.phase='combat-ranged'; state.combat={q:hex.q,r:hex.r,origin,kind,enemy:enemyGroup(enemies),enemies,enemySources,siteDefenderIds:defenders.map(enemy=>enemyKey(enemy)),rivalKeepOwnerId:rivalKeep?hex.ownerId:null,rivalKeepToken,defeatedIds:[],blockedIds:[],blocked:false,woundsTaken:0,damageUnits:[]}; log(state,`Combat begins against ${state.combat.enemy.name}. Ranged/Siege phase.`); return state;
    }
    case 'BURN_MONASTERY': {
      const hex=currentHex(state); if(state.phase!=='action'||hex?.site!=='monastery'||hex.burned)return fail(state,'You must be at an unburned monastery.');if(state.player.turnAction)return fail(state,'Only one action may be taken each turn.');
      const monasteryCard=state.offer.monastery?.shift();if(monasteryCard)state.decks.advanced.push(monasteryCard);
      state.player.reputation=Math.max(-7,state.player.reputation-3);state.points.heal=0;hex.enemy={...clone(ENEMIES.mage),id:'monastery-defender',name:'Monastery Defender',uid:`burn-${state.turn}`};
      state.player.turnAction='combat';state.phase='combat-ranged';state.combat={q:hex.q,r:hex.r,origin:{q:hex.q,r:hex.r},kind:'burn',enemy:clone(hex.enemy),enemies:[clone(hex.enemy)],defeatedIds:[],blockedIds:[],blocked:false,woundsTaken:0,damageUnits:[]};log(state,'You attempt to burn the monastery: Reputation -3.');return state;
    }
    case 'RESOLVE_RANGED': {
      if(state.phase!=='combat-ranged')return fail(state,'Not in the Ranged/Siege phase.');const targets=chosenCombatEnemies(state,action.targetIds);if(!targets.length)return fail(state,'Choose at least one living enemy.');
      const required=rangedRequirements(targets),available=state.points.siege+state.points.ranged,canDefeat=!required.impossible&&state.points.siege>=required.siege&&available>=required.siege+required.open;
      if(!canDefeat){if(action.targetIds?.length)return fail(state,required.impossible?'A twice-fortified enemy cannot be targeted in this phase.':`That group needs ${required.siege} Siege and ${required.open} additional Ranged/Siege Attack (currently ${state.points.siege} Siege and ${available} total).`);return finishRangedPhase(state);}
      markCombatDefeated(state,targets);spendCombatPoints(state,['ranged','siege']);log(state,`${targets.map(enemy=>enemy.name).join(', ')} defeated with Ranged/Siege Attack.`);if(!livingCombatEnemies(state).length)return winCombat(state,'ranged');return state;
    }
    case 'FINISH_RANGED': if(state.phase!=='combat-ranged')return fail(state,'Not in the Ranged/Siege phase.');return finishRangedPhase(state);
    case 'BLOCK_ENEMY': {
      if(state.phase!=='combat-block')return fail(state,'Not in the Block phase.');const enemy=attackingCombatEnemies(state).find(item=>enemyKey(item)===action.targetId);if(!enemy)return fail(state,'Choose one living enemy attack.');if((state.combat.blockedIds||[]).includes(blockEnemyKey(enemy)))return fail(state,'That attack is already blocked.');
      const required=enemy.attack*((enemy.traits||[]).includes('swift')?2:1),power=effectiveBlock(state,enemy);spendCombatPoints(state,['block','iceBlock','fireBlock']);if(power<required)return fail(state,`That block failed: ${required} was required, but only ${power} was committed.`);state.combat.blockedIds.push(blockEnemyKey(enemy));log(state,`${enemy.name}'s attack was blocked separately.`);return state;
    }
    case 'RESOLVE_BLOCK': {
      if(state.phase!=='combat-block')return fail(state,'Not in the Block phase.');const enemies=attackingCombatEnemies(state);if(enemies.length!==1)return fail(state,'Multiple enemy attacks must be blocked separately.');const enemy=enemies[0],required=enemy.attack*((enemy.traits||[]).includes('swift')?2:1),power=effectiveBlock(state,enemy);spendCombatPoints(state,['block','iceBlock','fireBlock']);state.combat.blocked=power>=required;if(state.combat.blocked){state.combat.blockedIds.push(blockEnemyKey(enemy));log(state,'Attack fully blocked.');}return finishBlockPhase(state);
    }
    case 'FINISH_BLOCK': if(state.phase!=='combat-block')return fail(state,'Not in the Block phase.');return finishBlockPhase(state);
    case 'ASSIGN_DAMAGE_UNIT': {
      if(state.phase!=='combat-damage'||!state.combat)return fail(state,'Choose Units while assigning one enemy attack.');const unit=state.player.units.find(item=>item.id===action.id);if(!unit||unit.wounded||(state.combat.damageAssignedUnitIds||[]).includes(action.id))return fail(state,'Only an unwounded unit not already assigned in this combat can receive damage.');state.combat.damageUnits=state.combat.damageUnits||[];const index=state.combat.damageUnits.indexOf(unit.id);if(index>=0)state.combat.damageUnits.splice(index,1);else state.combat.damageUnits.push(unit.id);return state;
    }
    case 'RESOLVE_DAMAGE': {
      if(state.phase!=='combat-damage'||!state.combat?.damageQueue?.length)return fail(state,'There is no enemy attack awaiting damage assignment.');const enemy=state.combat.damageQueue.shift();assignCombatDamage(state,enemy);state.combat.damageUnits=[];if(!state.combat.damageQueue.length){discardCombatSummons(state);state.phase='combat-attack';log(state,'All unblocked attacks have been assigned. Melee Attack phase.');}return state;
    }
    case 'SPEND_HEAL': {
      if(state.phase!=='action')return fail(state,'Healing power is spent outside combat.');if(action.unitId){const unit=state.player.units.find(item=>item.id===action.unitId);if(!unit?.wounded)return fail(state,'That unit is not wounded.');const cost=unit.level||1;if(state.points.heal<cost)return fail(state,`Healing that unit requires ${cost} Heal.`);state.points.heal-=cost;unit.woundCount=Math.max(0,(unit.woundCount||1)-1);unit.wounded=unit.woundCount>0;log(state,unit.wounded?`${unit.name} still has ${unit.woundCount} Wound remaining.`:`${unit.name} was healed.`);return state;}if(state.player.wounds<1)return fail(state,'You have no Wound to heal.');if(state.points.heal<1)return fail(state,'You need 1 Heal.');state.points.heal--;state.player.wounds--;removeWounds(state,1);log(state,'Healed one Hero Wound.');return state;
    }
    case 'RESOLVE_ATTACK': {
      if(state.phase!=='combat-attack')return fail(state,'Not in the Attack phase.');const targets=chosenCombatEnemies(state,action.targetIds);if(!targets.length)return fail(state,'Choose at least one living enemy.');
      const adjusted=targets.map(enemy=>enemy.traits.includes('elusive')&&!state.combat.blockedIds.includes(enemyKey(enemy))?{...enemy,armor:Math.ceil(enemy.armor*1.5)}:enemy),power={physical:state.points.attack+state.points.ranged+state.points.siege,ice:state.points.iceAttack,fire:state.points.fireAttack},required=adjusted.reduce((sum,enemy)=>sum+enemy.armor,0);if(!canDefeatWithAttack(adjusted,power))return fail(state,`You cannot allocate the available Attack to defeat this group (${required} total Armor; ${power.physical} physical, ${power.ice} ice, ${power.fire} fire available).`);
      markCombatDefeated(state,targets);spendCombatPoints(state,['attack','iceAttack','fireAttack','ranged','siege']);log(state,`${targets.map(enemy=>enemy.name).join(', ')} defeated in melee.`);if(!livingCombatEnemies(state).length)return winCombat(state,'attack');return state;
    }
    case 'END_COMBAT': if(state.phase!=='combat-attack')return fail(state,'Combat may be ended after damage is assigned.');return leaveCombatWithSurvivors(state);
    case 'INTERACT': {if(action.kind!=='plunder'&&state.player.turnAction&&state.player.turnAction!=='interact')return fail(state,'Only one action may be taken each turn.');const result=interact(state,action);if(!result.error&&action.kind!=='plunder')result.player.turnAction='interact';return result;}
    case 'REST': {
      if(state.phase!=='action')return fail(state,'You cannot rest during combat.');if(state.player.movedThisTurn||state.player.turnAction)return fail(state,'Resting replaces movement and the turn action.');const nonWounds=state.player.hand.filter(card=>card.id!=='wound'),wounds=state.player.hand.filter(card=>card.id==='wound');if(!nonWounds.length&&!wounds.length)return fail(state,'There are no cards in hand to recover with.');
      if(nonWounds.length){const chosen=nonWounds.find(card=>card.uid===action.cardUid)||nonWounds[0],woundIds=new Set(action.woundUids||wounds.map(card=>card.uid));state.player.hand=state.player.hand.filter(card=>{if(card.uid===chosen.uid||(card.id==='wound'&&woundIds.has(card.uid))){state.player.discard.push(card);return false;}return true;});log(state,`Standard rest: discarded ${chosen.name} and ${woundIds.size} Wound${woundIds.size===1?'':'s'}.`);}else{const chosen=wounds.find(card=>card.uid===action.woundUid)||wounds[0];state.player.hand=state.player.hand.filter(card=>{if(card.uid===chosen.uid){state.player.discard.push(card);return false;}return true;});log(state,'Slow recovery: discarded one Wound.');}return endTurn(state);
    }
    case 'END_TURN': {
      if(state.phase!=='action')return fail(state,'Combat must be completed first.');if(state.pendingRewards.length)return fail(state,'Claim your pending site rewards before ending the turn.');const requested=[...new Set(action.discardUids||[])],cards=requested.map(uid=>state.player.hand.find(card=>card.uid===uid&&card.id!=='wound'));if(cards.some(card=>!card)||cards.length!==requested.length)return fail(state,'Only non-Wound cards from your hand may be discarded at end of turn.');if(!state.player.cardsPlayedThisTurn&&!cards.length&&!state.player.emptyHandPassAllowed)return fail(state,'Discard at least one non-Wound card when no card was played this turn.');for(const card of cards){state.player.hand.splice(state.player.hand.findIndex(item=>item.uid===card.uid),1);state.player.discard.push(card);}return endTurn(state);
    }
    case 'END_ROUND': {
      if(state.player.deck.length||!state.player.atTurnStart) return fail(state,'You may announce end of round only when your Deed deck was empty at the start of your turn.');
      if(state.multiplayer){if(state.players.length===1){state.roundWasAnnounced=true;return nextRound(state);}const announcing=state.roundEndTurnsRemaining===null;if(!announcing&&state.player.hand.length)return fail(state,'The round was already announced; play your final turn.');if(announcing){state.roundEndTurnsRemaining=state.players.length-1;state.roundWasAnnounced=true;}return endTurn(state,announcing);}
      return nextRound(state);
    }
    default: return fail(state, 'Unknown action.');
  }
}

function applyTacticOnTake(state,tactic,action={}){
  if(tactic.effect==='draw')draw(state,2);
  if(tactic.effect==='prepare'&&state.player.deck.length){const index=state.player.deck.findIndex(card=>card.uid===action.cardUid),prepared=state.player.deck.splice(index,1)[0];state.player.hand.push(prepared);state.player.deck=shuffled(state.player.deck,state.seed+state.round*131+state.turn);log(state,`${prepared.name} was prepared and the Deed deck was shuffled.`);}
}

function activateTactic(state,action){
  const tactic=state.player.tactic||state.tactic;if(!tactic)return fail(state,'You have no tactic this round.');if(state.player.tacticUsed)return fail(state,`${tactic.name} has already been used.`);if(state.phase!=='action'&&!(state.phase==='cooperative-entry'&&tactic.effect==='choice'&&action.mode==='move'))return fail(state,'Use this tactic during your action phase.');
  if(tactic.effect==='choice')state.points[action.mode==='influence'?'influence':'move']+=action.mode==='influence'?1:2;
  else if(tactic.effect==='mana'){const color=state.time==='day'?'gold':action.color;if(state.time==='night'&&!COLORS.includes(color))return fail(state,'Choose a basic mana color.');state.mana.push(color);}
  else if(tactic.effect==='cycle'){
    const ids=(action.uids||[]).slice(0,2);let count=0;ids.forEach(uid=>{const index=state.player.hand.findIndex(card=>card.uid===uid&&card.id!=='wound');if(index>=0){state.player.discard.push(state.player.hand.splice(index,1)[0]);count++;}});if(!count)return fail(state,'Choose at least one non-Wound card to cycle.');draw(state,count+(tactic.id==='midnight-meditation'?1:0));
  } else if(tactic.effect==='long-night'){
    const cards=state.player.discard.splice(Math.max(0,state.player.discard.length-3));if(!cards.length)return fail(state,'Your discard pile is empty.');state.player.deck=shuffled([...state.player.deck,...cards],state.seed+state.turn*37);
  } else if(tactic.effect==='extra-turn')state.player.extraTurn=true;
  else if(tactic.effect==='spare'){state.player.carry={move:Math.min(3,state.points.move),influence:Math.min(3,state.points.influence),attack:Math.min(3,state.points.attack),block:Math.min(3,state.points.block)};}
  else return fail(state,'This tactic has no activatable effect.');
  state.player.tacticUsed=true;log(state,`${tactic.name} activated.`);return state;
}

function activateSkill(state,action){
  const skill=state.player.skills.find(s=>s.id===action.id);if(!skill)return fail(state,'You have not learned that Skill.');
  if(skill.used||skill.roundUsed)return fail(state,`${skill.name} has already been used ${skill.cadence==='round'?'this round':'this turn'}.`);
  const mark=()=>{if(skill.cadence==='round')skill.roundUsed=true;else skill.used=true;log(state,`${skill.name} activated.`);return state;};
  if(skill.id==='double-time'){if(!['action','cooperative-entry'].includes(state.phase))return fail(state,'Double Time is used outside combat.');state.points.move+=state.time==='day'?2:1;return mark();}
  if(skill.id==='night-sharpshooting'){if(!['combat-ranged','combat-attack'].includes(state.phase))return fail(state,'Night Sharpshooting is a combat Skill.');state.points.ranged+=(state.time==='night'||isUnderground(state))?2:1;return mark();}
  if(skill.id==='cold-swordsmanship'){if(state.phase!=='combat-attack')return fail(state,'Cold Swordsmanship is used in the Attack phase.');if(action.mode==='ice')state.points.iceAttack+=2;else state.points.attack+=2;return mark();}
  if(skill.id==='shield-mastery'){if(state.phase!=='combat-block')return fail(state,'Shield Mastery is used in the Block phase.');if(action.mode==='ice')state.points.iceBlock+=2;else if(action.mode==='fire')state.points.fireBlock+=2;else state.points.block+=3;return mark();}
  if(skill.id==='resistance-break'){if(!state.combat)return fail(state,'Resistance Break requires an enemy in combat.');const reduction=resistanceCount(state.combat.enemy);if(!reduction)return fail(state,'That enemy has no resistance to break.');state.combat.enemy.armor=Math.max(1,state.combat.enemy.armor-reduction);return mark();}
  if(skill.id==='i-feel-no-pain'){if(state.combat)return fail(state,'I Feel No Pain cannot be used during combat.');const i=state.player.hand.findIndex(c=>c.id==='wound');if(i<0)return fail(state,'You need a Wound in hand.');state.player.discard.push(state.player.hand.splice(i,1)[0]);draw(state,1);return mark();}
  if(skill.id==='i-dont-give-a-damn'){state.bonuses.sideways={value:2,advancedValue:3,skill:skill.id};return mark();}
  if(skill.id==='who-needs-magic'){state.bonuses.sideways={value:state.sourceTaken?2:3,skill:skill.id};return mark();}
  if(skill.id==='motivation'){if(state.combat)return fail(state,'Motivation cannot be used during combat.');draw(state,2);state.mana.push('blue');return mark();}
  if(skill.id==='mana-overload'){const color=action.color;if(!COLORS.includes(color))return fail(state,'Choose a basic mana color.');state.mana.push(color);state.bonuses.manaOverload={color};return mark();}
  if(skill.effect){if((skill.effect==='any'||skill.effect==='anyCombat')&&!['move','influence','attack','block','ranged','siege'].includes(action.mode))return fail(state,'Choose the power this Skill should provide.');if(skill.effect==='mana'&&!COLORS.includes(action.color))return fail(state,'Choose a basic mana color.');if(skill.effect==='unitReady'&&!state.player.units.some(unit=>unit.id===action.unitId&&unit.spent))return fail(state,'Choose a spent Unit to ready.');addEffect(state,{[skill.effect]:skill.value},null,{effectAs:action.mode,manaColor:action.color,unitId:action.unitId});return mark();}
  return fail(state,'This Skill has no implemented effect.');
}

function contributeRemote(state,action){
  const actor=state.players.find(player=>player.id===action.playerId);if(!actor)return fail(state,'Unknown contributor.');
  if(action.type.startsWith('TEAM_')){
    const assault=state.cooperativeAssault;if(!['team-assault','cooperative-entry'].includes(state.phase)||!assault?.invited.includes(actor.id))return fail(state,'You are not invited to this assault.');
    if(action.type==='TEAM_DECLINE'){if(assault.stage!=='proposal'||actor.id===assault.leaderId)return fail(state,'Only an invited player may decline the proposal.');state.cooperativeAssault=null;state.phase='action';bindPlayerState(state,state.activePlayerId);log(state,`${actor.name} declined the joint assault; no costs were paid.`);return state;}
    if(action.type==='TEAM_ACCEPT'){
      if(assault.stage!=='proposal'||assault.accepted.includes(actor.id))return fail(state,'That assault invitation is not awaiting acceptance.');lockUndo(state,'Another player accepted a joint-assault proposal.');assault.accepted.push(actor.id);
      if(assault.accepted.length===assault.invited.length){const hex=state.map.find(item=>item.q===assault.q&&item.r===assault.r),defenders=shuffled(clone(hex.enemy.members||hex.enemies||[hex.enemy]),state.seed+state.turn*101+hex.q*17+hex.r*31);let cursor=0;assault.enemyAssignments={};for(const id of assault.participantOrder){assault.enemyAssignments[id]=defenders.slice(cursor,cursor+assault.assignments[id]);cursor+=assault.assignments[id];}for(const id of assault.invited){const participant=playerById(state,id);participant.reputation=Math.max(-7,participant.reputation-1);if(id!==assault.leaderId){participant.skipNextTurn=true;participant.roundOrderFaceDown=true;}}assault.stage='entry';assault.currentIndex=0;assault.results={};assault.resources={};state.activePlayerId=assault.participantOrder[0];bindPlayerState(state,state.activePlayerId);state.phase='cooperative-entry';log(state,'Every invited player accepted. Defenders were assigned secretly; the leader must now pay Move and enter the city.');}
      bindPlayerState(state,state.activePlayerId);return state;
    }
    if(action.type==='TEAM_ENTER'){
      if(assault.stage!=='entry'||actor.id!==assault.participantOrder[assault.currentIndex])return fail(state,'It is not your assigned city entry.');bindPlayerState(state,actor.id);const hex=state.map.find(item=>item.q===assault.q&&item.r===assault.r),cost=movementCost(state,hex);if(state.points.move<cost)return fail(state,`You need ${cost} Move to enter the city.`);state.points.move-=cost;state.points.heal=0;actor.q=hex.q;actor.r=hex.r;actor.turnAction='combat';const enemies=(assault.enemyAssignments[actor.id]||[]).map(enemy=>({...withCityBonus(enemy,hex.cityColor),siteFortified:true}));state.combat={q:hex.q,r:hex.r,origin:assault.origins[actor.id],kind:'cooperative-city',enemy:enemyGroup(enemies),enemies,siteDefenderIds:enemies.map(enemy=>enemyKey(enemy)),defeatedIds:[],blockedIds:[],blocked:false,woundsTaken:0,damageUnits:[]};assault.stage='combat';state.phase='combat-ranged';log(state,`${actor.name} entered the city and began an individual battle against ${enemies.length} assigned defender${enemies.length===1?'':'s'}.`);return state;
    }
    return fail(state,'That joint-assault action is not available now.');
  }
  const pvp=state.pvp;if(!pvp||![pvp.attackerId,pvp.defenderId].includes(actor.id))return fail(state,'You are not a participant in this PvP combat.');
  if(action.type==='PVP_ATTEND'){
    if(actor.id!==pvp.defenderId)return fail(state,'Only the defender chooses attendance.');if(state.phase!=='pvp-attend'||pvp.attendance)return fail(state,'The defender has already chosen how to attend.');if(!['full','partial'].includes(action.mode))return fail(state,'Choose full or partial attendance.');if(action.mode==='full'&&!actor.hand.some(card=>card.id!=='wound'))return fail(state,'Full attendance requires at least one non-Wound card in hand.');lockUndo(state,'Another player revealed a PvP attendance decision.');
    pvp.attendance=action.mode;if(action.mode==='full'){actor.skipNextTurn=true;actor.roundOrderFaceDown=true;const hex=state.map.find(item=>item.q===actor.q&&item.r===actor.r);pvp.defenderMana=hex?.site==='glade'?[state.time==='day'?'gold':'black']:[];pvp.defenderSourceTaken=false;}pvp.phase='ranged';pvp.stage='attack';pvp.currentAttackerId=pvp.defenderId;state.phase='pvp-ranged';bindPlayerState(state,state.activePlayerId);log(state,`${actor.name} will ${action.mode==='full'?'fully attend and skip their next turn':'partially attend without skipping a turn'}. Ranged combat starts with the defender.`);return state;
  }
  if(!pvp.attendance)return fail(state,'The defender must choose full or partial attendance first.');
  return resolvePvpAction(state,action,actor);
}

const pvpOpponentId=(pvp,id)=>id===pvp.attackerId?pvp.defenderId:pvp.attackerId;
const pvpCardPower=(effect,phase,role,effectAs)=>{const flexible=effectAs?{[effectAs]:Number(effect.any||effect.anyCombat||0)}:{};const value={...effect,...flexible};if(role==='block'){const blocks={physical:Number(value.block||0),fire:Number(value.fireBlock||0),ice:Number(value.iceBlock||0),coldfire:Number(value.coldfireBlock||0)};return {power:Object.values(blocks).reduce((sum,amount)=>sum+amount,0),elements:[],blocks};}if(phase==='ranged')return {power:Number(value.ranged||0)+Number(value.siege||0),elements:['physical']};const elements=[];if(value.attack||value.ranged||value.siege)elements.push('physical');if(value.fireAttack)elements.push('fire');if(value.iceAttack)elements.push('ice');return {power:Number(value.attack||0)+Number(value.ranged||0)+Number(value.siege||0)+Number(value.fireAttack||0)+Number(value.iceAttack||0),elements};};
const pvpManaPool=(state,actor)=>actor.id===state.pvp.defenderId?(state.pvp.defenderMana=state.pvp.defenderMana||[]):state.mana;
const canSpendPvpMana=(state,actor,color)=>{const pool=pvpManaPool(state,actor);return pool.includes(color)||(state.time==='day'&&pool.includes('gold'))||(actor.crystals[color]||0)>0;};
const spendPvpMana=(state,actor,color)=>{const pool=pvpManaPool(state,actor);let index=pool.indexOf(color);if(index>=0){pool.splice(index,1);return true;}index=pool.indexOf('gold');if(state.time==='day'&&index>=0){pool.splice(index,1);return true;}if((actor.crystals[color]||0)>0){actor.crystals[color]--;return true;}return false;};
const addPvpWounds=(state,actor,count)=>{actor.wounds+=count;for(let index=0;index<count;index++)actor.hand.push({id:'wound',uid:`pvp-wound-${state.turn}-${actor.id}-${index}-${actor.wounds}`,name:'Wound',color:'wound',basic:{},strong:{}});};
const pvpRetreatHexes=(state,playerId)=>{const player=playerById(state,playerId);return state.map.filter(hex=>hex.revealed!==false&&distance(player,hex)===1&&!hex.enemy&&isSafeSpace(state,player,hex));};

function resetPvpExchange(state,nextAttackerId){const pvp=state.pvp;pvp.currentAttackerId=nextAttackerId;pvp.stage='attack';pvp.attackPower=0;pvp.attackElements=[];pvp.blockPower=0;pvp.blockTypes={physical:0,fire:0,ice:0,coldfire:0};pvp.damageRemaining=0;pvp.passes=0;}
function finishPvpAttack(state){const pvp=state.pvp,previous=pvp.currentAttackerId;resetPvpExchange(state,pvpOpponentId(pvp,previous));log(state,`${playerById(state,previous).name}'s PvP attack is complete; roles switch.`);return state;}

function finishPvpCombat(state,retreatingId,winnerId=null){
  const pvp=state.pvp,retreating=playerById(state,retreatingId),winner=winnerId&&playerById(state,winnerId);if(winner){const levelGap=Math.max(0,retreating.level-winner.level),fame=levelGap?1+levelGap*2:(retreating.fame>winner.fame?1:0);bindPlayerState(state,winner.id);if(fame)gainFame(state,fame);winner.pvpWins=(winner.pvpWins||0)+1;}
  finishPvpReaction(state,pvp);bindPlayerState(state,pvp.attackerId);state.pvp=null;state.phase='action';log(state,winner?`${winner.name} forced ${retreating.name} to withdraw from PvP.`:`${retreating.name} withdrew after both players passed.`);return state;
}

function resolvePvpAction(state,action,actor){
  const pvp=state.pvp,opponentId=pvpOpponentId(pvp,actor.id),role=actor.id===pvp.currentAttackerId?'attack':'block';
  if(action.type==='PVP_TAKE_SOURCE'){
    if(actor.id!==pvp.defenderId||pvp.attendance!=='full')return fail(state,'Only a fully attending defender may use the Source.');if(pvp.defenderSourceTaken)return fail(state,'The defender has already used a Source die.');const die=state.source.find(item=>item.id===action.id);if(!die)return fail(state,'Unknown Source die.');if(die.color==='black'&&state.time==='day')return fail(state,'Black mana cannot be used during the Day.');if(die.color==='gold'&&state.time==='night')return fail(state,'Gold mana cannot be used during the Night.');lockUndo(state,'A Source die was rerolled during PvP.');pvp.defenderMana=pvp.defenderMana||[];pvp.defenderMana.push(die.color);pvp.defenderSourceTaken=true;const faces=[...COLORS,'gold','black'];die.color=faces[(state.seed+state.turn*11+Number(die.id.slice(-1)))%faces.length];log(state,`${actor.name} used a Source die while fully attending PvP.`);return state;
  }
  if(action.type==='PVP_PLAY_CARD'){
    if(pvp.stage!==role)return fail(state,`It is not your turn to ${role}.`);const index=actor.hand.findIndex(card=>card.uid===action.uid&&card.id!=='wound');if(index<0)return fail(state,'That PvP card is unavailable.');const card=actor.hand[index];if(!['basic','strong','sideways'].includes(action.mode))return fail(state,'Choose a basic, strong, or sideways PvP effect.');const effect=action.mode==='sideways'?{[role==='attack'?'attack':'block']:1}:card[action.mode]||{};if(effect.any&&!['attack','block'].includes(action.effectAs))return fail(state,'Choose ordinary Attack or Block for this flexible effect.');const part=pvpCardPower(effect,pvp.phase,role,action.effectAs);if(part.power<=0)return fail(state,`That card provides no usable ${role} power in this phase.`);if(role==='attack'&&pvp.phase==='ranged'&&action.mode==='sideways')return fail(state,'Cards cannot be played sideways for a ranged PvP attack.');if(effect.discardRequired&&!actor.hand.some(item=>item.uid===action.discardUid&&item.uid!==card.uid&&item.id!=='wound'))return fail(state,'Choose another non-Wound card to discard as the cost.');
    if(card.type==='spell'){if(action.mode==='basic'){if(!canSpendPvpMana(state,actor,card.color))return fail(state,`Casting this Spell requires ${card.color} mana.`);}else if(action.mode==='strong'){const pool=pvpManaPool(state,actor);if(state.time!=='night')return fail(state,'The strong Spell effect can only be cast at Night.');if(!canSpendPvpMana(state,actor,card.color)||!pool.includes('black'))return fail(state,`The strong Spell requires ${card.color} and black mana.`);}}else if(card.type!=='artifact'&&action.mode==='strong'&&!canSpendPvpMana(state,actor,card.color))return fail(state,`The strong action requires ${card.color} mana.`);
    if(card.type==='spell'&&action.mode==='basic')spendPvpMana(state,actor,card.color);else if(card.type==='spell'&&action.mode==='strong'){spendPvpMana(state,actor,card.color);const pool=pvpManaPool(state,actor);pool.splice(pool.indexOf('black'),1);}else if(card.type!=='artifact'&&action.mode==='strong')spendPvpMana(state,actor,card.color);
    if(role==='attack'){pvp.attackPower+=part.power;pvp.attackElements=[...new Set([...pvp.attackElements,...part.elements])];}else{pvp.blockPower+=part.power;Object.entries(part.blocks).forEach(([element,amount])=>{pvp.blockTypes[element]+=amount;});}const committed=actor.hand.splice(index,1)[0];if(effect.discardRequired){const discardIndex=actor.hand.findIndex(item=>item.uid===action.discardUid);actor.discard.push(actor.hand.splice(discardIndex,1)[0]);}if(effect.woundCost)addPvpWounds(state,actor,effect.woundCost);if(effect.reputation)actor.reputation=Math.max(-7,Math.min(5,actor.reputation+effect.reputation));if(card.type==='artifact'&&action.mode==='strong')actor.removed.push(committed);else actor.played.push(committed);actor.cardsPlayedThisTurn++;log(state,`${actor.name} committed a hidden ${action.mode} card to the PvP ${role}.`);return state;
  }
  if(action.type==='PVP_USE_PREPARED'){
    if(pvp.stage!==role)return fail(state,`It is not your turn to ${role}.`);const pool=pvp.prepared[actor.id];let part;if(role==='block'){part=pvpCardPower({block:pool.block,iceBlock:pool.iceBlock,fireBlock:pool.fireBlock},pvp.phase,role);pool.block=pool.iceBlock=pool.fireBlock=0;}else if(pvp.phase==='ranged'){const blocker=playerById(state,opponentId),hex=state.map.find(item=>item.q===blocker.q&&item.r===blocker.r),siegeOnly=opponentId===pvp.defenderId&&['keep','mage-tower'].includes(hex?.site);part={power:pool.siege+(siegeOnly?0:pool.ranged),elements:['physical']};pool.siege=0;if(!siegeOnly)pool.ranged=0;}else{part={power:pool.attack+pool.iceAttack+pool.fireAttack+pool.ranged+pool.siege,elements:[...(pool.attack||pool.ranged||pool.siege?['physical']:[]),...(pool.fireAttack?['fire']:[]),...(pool.iceAttack?['ice']:[])]};pool.attack=pool.iceAttack=pool.fireAttack=pool.ranged=pool.siege=0;}if(part.power<=0)return fail(state,'There is no prepared power of that type.');if(role==='attack'){pvp.attackPower+=part.power;pvp.attackElements=[...new Set([...pvp.attackElements,...part.elements])];}else{pvp.blockPower+=part.power;Object.entries(part.blocks).forEach(([element,amount])=>{pvp.blockTypes[element]+=amount;});}return state;
  }
  if(action.type==='PVP_DECLARE_ATTACK'){if(role!=='attack'||pvp.stage!=='attack')return fail(state,'Only the current attacker may declare an attack.');if(pvp.attackPower<=0)return fail(state,'Commit attack power or pass.');pvp.stage='block';log(state,`${actor.name} declares PvP Attack ${pvp.attackPower}.`);return state;}
  if(action.type==='PVP_PASS'){
    if(role!=='attack'||pvp.stage!=='attack'||pvp.attackPower>0)return fail(state,'Only the current attacker may pass before committing power.');pvp.passes++;if(pvp.passes<2){pvp.currentAttackerId=opponentId;log(state,`${actor.name} passes; ${playerById(state,opponentId).name} may attack.`);return state;}if(pvp.phase==='ranged'){pvp.phase='melee';state.phase='pvp-melee';resetPvpExchange(state,pvp.attackerId);log(state,'Both players passed consecutively. Melee begins with the aggressor.');return state;}pvp.stage='withdraw';pvp.currentAttackerId=pvp.attackerId;state.phase='pvp-withdraw';log(state,'Both players passed in melee. The aggressor must withdraw.');return state;
  }
  if(action.type==='PVP_RESOLVE_BLOCK'){if(role!=='attack'||pvp.stage!=='block')return fail(state,'Only the attacker resolves the opponent’s block.');const efficient=element=>pvp.attackElements.includes('physical')||(element==='ice'&&pvp.attackElements.includes('fire'))||(element==='fire'&&pvp.attackElements.includes('ice'))||(element==='coldfire'&&pvp.attackElements.some(item=>['fire','ice','coldfire'].includes(item))),efficientBlock=Object.entries(pvp.blockTypes).reduce((sum,[element,amount])=>sum+(efficient(element)?amount:0),0),inefficientBlock=pvp.blockPower-efficientBlock,totalBlock=efficientBlock+Math.floor(inefficientBlock/2),reduction=Math.floor(totalBlock/(pvp.phase==='ranged'?2:1));pvp.damageRemaining=Math.max(0,pvp.attackPower-reduction);if(!pvp.damageRemaining)return finishPvpAttack(state);pvp.stage='damage';log(state,`${pvp.damageRemaining} PvP damage remains after blocking.`);return state;}
  if(action.type==='PVP_DAMAGE_HERO'){if(role!=='attack'||pvp.stage!=='damage')return fail(state,'Only the attacker assigns remaining damage.');const target=playerById(state,opponentId),cost=target.armor;if(pvp.damageRemaining<cost)return fail(state,`${cost} damage is required to wound that Hero.`);bindPlayerState(state,target.id);wound(state,1);pvp.damageRemaining-=cost;pvp.heroWounds=pvp.heroWounds||{};pvp.heroWounds[target.id]=(pvp.heroWounds[target.id]||0)+1;if(pvp.heroWounds[target.id]>=baseHandLimit(target)){target.hand.filter(card=>card.id!=='wound').forEach(card=>target.discard.push(card));target.hand=target.hand.filter(card=>card.id==='wound');}bindPlayerState(state,state.activePlayerId);return state;}
  if(action.type==='PVP_DAMAGE_UNIT'){if(role!=='attack'||pvp.stage!=='damage')return fail(state,'Only the attacker assigns remaining damage.');const target=playerById(state,opponentId),unit=target.units.find(item=>item.id===action.unitId&&!item.wounded);if(!unit)return fail(state,'Choose an unwounded opposing Unit.');const resistant=(unit.resistances||[]).some(element=>pvp.attackElements.includes(element)),cost=unit.armor*(resistant?2:1);if(pvp.damageRemaining<cost)return fail(state,`${cost} damage is required to wound that Unit.`);unit.wounded=true;unit.woundCount=1;pvp.damageRemaining-=cost;return state;}
  if(action.type==='PVP_STEAL_ARTIFACT'){if(role!=='attack'||pvp.stage!=='damage'||pvp.phase!=='melee')return fail(state,'Artifacts may be stolen only by the current melee attacker.');if(pvp.damageRemaining<5)return fail(state,'Stealing an Artifact requires 5 damage.');const target=playerById(state,opponentId),piles=[target.discard,target.played];let artifact=null;for(const pile of piles){const index=pile.findIndex(card=>card.type==='artifact'&&(card.uid===action.uid||card.id===action.id));if(index>=0){artifact=pile.splice(index,1)[0];break;}}if(!artifact){const unit=target.units.find(item=>item.wounded&&item.banner&&(item.banner.uid===action.uid||item.banner.id===action.id));if(unit){artifact=unit.banner;unit.banner=null;}}if(!artifact)return fail(state,'Choose an Artifact from the blocker’s discard pile, play area, or a Wounded Unit.');actor.discard.push(artifact);pvp.damageRemaining-=5;log(state,`${actor.name} stole ${artifact.name} with 5 PvP damage.`);return state;}
  if(action.type==='PVP_FORCE_RETREAT'){if(role!=='attack'||pvp.stage!=='damage'||pvp.phase!=='melee')return fail(state,'Retreat may be forced only with remaining melee damage.');const target=playerById(state,opponentId),hex=pvpRetreatHexes(state,target.id).find(item=>item.q===action.q&&item.r===action.r);if(!hex)return fail(state,'Choose a safe adjacent withdrawal space.');const cost=movementCost(state,hex);if(pvp.damageRemaining<cost)return fail(state,`${cost} melee damage is needed to force that withdrawal.`);target.q=hex.q;target.r=hex.r;return finishPvpCombat(state,target.id,actor.id);}
  if(action.type==='PVP_FINISH_ATTACK'){if(role!=='attack'||pvp.stage!=='damage')return fail(state,'There is no attack to finish.');return finishPvpAttack(state);}
  if(action.type==='PVP_WITHDRAW'){if(pvp.stage!=='withdraw'||actor.id!==pvp.attackerId)return fail(state,'Only the aggressor must withdraw now.');const hex=pvpRetreatHexes(state,actor.id).find(item=>item.q===action.q&&item.r===action.r);if(!hex)return fail(state,'Choose a safe adjacent withdrawal space.');actor.q=hex.q;actor.r=hex.r;return finishPvpCombat(state,actor.id);}
  return fail(state,'That PvP action is not available now.');
}

function finishPvpReaction(state,pvp){
  if(pvp.attendance!=='full')return;const defender=state.players.find(player=>player.id===pvp.defenderId);bindPlayerState(state,defender.id);defender.discard.push(...defender.played);defender.played=[];defender.cardsPlayedThisTurn=0;defender.skills.forEach(skill=>{skill.used=false;});const target=handLimit(state);if(defender.hand.length<target)draw(state,target-defender.hand.length);pvp.defenderMana=[];
}

function finishRangedPhase(state){
  spendCombatPoints(state,['ranged','siege']);state.combat.blockEnemies=livingCombatEnemies(state).map(enemy=>{
    if(!(enemy.traits||[]).includes('summon'))return clone(enemy);
    lockUndo(state,'A summoned enemy token was revealed.');
    const summoned=drawEnemyToken(state,'brown')||{...clone(ENEMIES.den),category:'brown'};const token={...clone(summoned),uid:`summon-${state.turn}-${enemyKey(enemy)}-${summoned.uid||summoned.id}`,summonerId:enemyKey(enemy)};log(state,`${enemy.name} summoned ${token.name} for the Block and Damage phases.`);return token;
  });state.phase='combat-block';log(state,'Ranged/Siege attacks are complete. Surviving enemies attack separately.');return state;
}

function finishBlockPhase(state){
  const blocked=new Set(state.combat.blockedIds||[]),attackers=attackingCombatEnemies(state),unblocked=attackers.filter(enemy=>!blocked.has(blockEnemyKey(enemy)));spendCombatPoints(state,['block','iceBlock','fireBlock']);state.combat.blocked=unblocked.length===0;
  if(unblocked.length){state.combat.damageQueue=clone(unblocked);state.combat.damageUnits=[];state.phase='combat-damage';log(state,`${unblocked.length} unblocked attack${unblocked.length===1?'':'s'} must be assigned one at a time.`);return state;}
  discardCombatSummons(state);log(state,'Every surviving enemy attack was blocked.');state.phase='combat-attack';return state;
}

function discardCombatSummons(state){
  for(const enemy of (state.combat.blockEnemies||[]).filter(item=>item.summonerId)){const discarded={...clone(enemy)};delete discarded.summonerId;state.enemyDiscards.brown.push(discarded);}delete state.combat.blockEnemies;delete state.combat.damageQueue;
}

function returnRivalKeepToken(state){if(state.combat?.rivalKeepToken)state.enemyDecks.grey.push(clone(state.combat.rivalKeepToken));}

function conquerFortifiedSite(state,hex,previousOwnerId=null){
  if(!hex||(hex.conquered&&!previousOwnerId))return;const newOwnerId=state.player.id||state.player.character;if(previousOwnerId&&previousOwnerId!==newOwnerId){const previous=state.multiplayer&&playerById(state,previousOwnerId);if(previous)previous.keeps=Math.max(0,(previous.keeps||0)-1);}state.player.q=hex.q;state.player.r=hex.r;hex.conquered=true;hex.ownerId=newOwnerId;hex.enemy=null;hex.enemies=[];
  if(hex.site==='keep')state.player.keeps++;
  if(hex.site==='mage-tower')state.pendingRewards.push({type:'spell',source:'Mage Tower'});
  if(hex.site==='city'){const shields=hex.cityShields||{[state.player.id||state.player.character]:1},best=Math.max(...Object.values(shields)),leaders=Object.keys(shields).filter(id=>shields[id]===best);hex.ownerId=(hex.cityShieldOrder||[]).find(id=>leaders.includes(id))||leaders[0];hex.conquerors=Object.keys(shields);const leader=state.multiplayer?playerById(state,hex.ownerId):state.player;if(leader)leader.cities=(leader.cities||0)+1;checkVictory(state);}
}

function finishCooperativeBattle(state){
  const assault=state.cooperativeAssault,combat=state.combat,id=state.player.id,hex=state.map.find(item=>item.q===assault.q&&item.r===assault.r),defeated=(combat.enemies||[]).filter(enemy=>(combat.defeatedIds||[]).includes(enemyKey(enemy))),won=defeated.length===(combat.enemies||[]).length;
  if(defeated.length){const fame=defeated.reduce((sum,enemy)=>sum+enemy.fame,0);gainFame(state,fame);discardEnemyTokens(state,defeated);state.player.defeated=(state.player.defeated||[]).concat(defeated.map(enemy=>({id:enemy.id,name:enemy.name,fame:enemy.fame})));hex.cityShields=hex.cityShields||{};hex.cityShieldOrder=hex.cityShieldOrder||[];hex.cityShields[id]=(hex.cityShields[id]||0)+defeated.length;hex.cityShieldOrder.push(...defeated.map(()=>id));}
  assault.results[id]={won,defeatedIds:defeated.map(enemy=>enemyKey(enemy))};assault.resources[id]={points:clone(state.points),mana:[...state.mana],sourceTaken:state.sourceTaken};state.combat=null;
  if(assault.currentIndex<assault.participantOrder.length-1){assault.currentIndex++;const nextId=assault.participantOrder[assault.currentIndex];state.activePlayerId=nextId;bindPlayerState(state,nextId);state.points=freshPoints();state.mana=[];state.sourceTaken=false;state.player.atTurnStart=true;state.player.turnAction=null;assault.stage='entry';state.phase='cooperative-entry';log(state,`${state.player.name} now prepares to enter the city for the next assigned battle.`);return state;}
  const allDefeated=Object.values(assault.results).every(result=>result.won),defeatedIds=new Set(Object.values(assault.results).flatMap(result=>result.defeatedIds)),participants=assault.invited.map(playerId=>playerById(state,playerId));
  for(const participant of participants.filter(player=>player.id!==assault.leaderId)){bindPlayerState(state,participant.id);participant.discard.push(...participant.played);participant.played=[];participant.cardsPlayedThisTurn=0;participant.atTurnStart=false;participant.turnAction=null;participant.skills.forEach(skill=>{skill.used=false;});const target=handLimit(state);if(participant.hand.length<target)draw(state,target-participant.hand.length);}
  if(allDefeated){hex.enemy=null;hex.enemies=[];hex.conquered=true;const best=Math.max(...Object.values(hex.cityShields)),leaders=Object.keys(hex.cityShields).filter(playerId=>hex.cityShields[playerId]===best);hex.ownerId=hex.cityShieldOrder.find(playerId=>leaders.includes(playerId))||leaders[0];hex.conquerors=Object.keys(hex.cityShields);participants.forEach(player=>{player.assaults=(player.assaults||0)+1;player.q=hex.q;player.r=hex.r;});const cityLeader=playerById(state,hex.ownerId);if(cityLeader)cityLeader.cities=(cityLeader.cities||0)+1;log(state,`Every assigned battle was won; ${cityLeader?.name||'the leading conqueror'} controls the ${hex.cityColor} city.`);}
  else {const survivors=(hex.enemies||hex.enemy.members||[hex.enemy]).filter(enemy=>!defeatedIds.has(enemyKey(enemy)));hex.enemies=clone(survivors);hex.enemy=survivors.length?enemyGroup(survivors):null;participants.forEach(player=>Object.assign(player,assault.origins[player.id]));log(state,'At least one assigned battle was lost; all participants withdrew and surviving defenders remain.');}
  const leaderResources=assault.resources[assault.leaderId];state.activePlayerId=assault.leaderId;bindPlayerState(state,assault.leaderId);state.points=leaderResources?.points||freshPoints();state.mana=leaderResources?.mana||[];state.sourceTaken=Boolean(leaderResources?.sourceTaken);state.player.turnAction='combat';state.player.atTurnStart=false;state.phase='action';state.cooperativeAssault=null;if(allDefeated)checkVictory(state);return state;
}

function leaveCombatWithSurvivors(state){
  const combat=state.combat,hex=state.map.find(item=>item.q===combat.q&&item.r===combat.r),survivors=livingCombatEnemies(state),defeated=(combat.enemies||[]).filter(enemy=>(combat.defeatedIds||[]).includes(enemyKey(enemy)));
  if(combat.kind==='cooperative-city')return finishCooperativeBattle(state);
  if(defeated.length){const group=enemyGroup(defeated);gainFame(state,group.fame);discardEnemyTokens(state,defeated);state.player.defeated=(state.player.defeated||[]).concat(defeated.map(enemy=>({id:enemy.id,name:enemy.name,fame:enemy.fame})));}
  if(combat.kind==='provoked'){const coordinates=new Set(Object.values(combat.enemySources||{}).map(source=>`${source.q}:${source.r}`));for(const coordinate of coordinates){const [q,r]=coordinate.split(':').map(Number),sourceHex=state.map.find(item=>item.q===q&&item.r===r),remaining=survivors.filter(enemy=>{const source=combat.enemySources[enemyKey(enemy)];return source?.q===q&&source?.r===r;});if(sourceHex){sourceHex.enemies=clone(remaining);sourceHex.enemy=remaining.length?enemyGroup(remaining):null;}}for(const enemy of defeated){const site=combat.enemySources?.[enemyKey(enemy)]?.site;if(site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);if(site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);}}
  else if(combat.kind==='fortified'&&combat.enemySources){const coordinates=new Set(Object.values(combat.enemySources).map(source=>`${source.q}:${source.r}`));for(const coordinate of coordinates){const [q,r]=coordinate.split(':').map(Number),sourceHex=state.map.find(item=>item.q===q&&item.r===r),remaining=survivors.filter(enemy=>{const source=combat.enemySources[enemyKey(enemy)];return source?.q===q&&source?.r===r;});if(sourceHex){sourceHex.enemies=clone(remaining);sourceHex.enemy=remaining.length?enemyGroup(remaining):null;}}for(const enemy of defeated){const source=combat.enemySources[enemyKey(enemy)];if(!source?.siteDefender&&source?.site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);if(!source?.siteDefender&&source?.site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);}const livingSiteDefenders=survivors.filter(enemy=>combat.enemySources[enemyKey(enemy)]?.siteDefender);if(!livingSiteDefenders.length)conquerFortifiedSite(state,hex,combat.rivalKeepOwnerId);if(combat.rivalKeepOwnerId){hex.enemy=null;hex.enemies=[];returnRivalKeepToken(state);}}
  else if(hex){const discardSurvivors=combat.kind==='burn'||['dungeon','tomb'].includes(hex.site);hex.enemies=discardSurvivors?[]:clone(survivors);hex.enemy=discardSurvivors||!survivors.length?null:enemyGroup(survivors);if(combat.kind==='burn'){hex.burned=true;hex.conquered=false;}}
  state.phase='action';state.combat=null;log(state,defeated.length?`${defeated.length} defender${defeated.length===1?'':'s'} defeated; the site was not conquered.`:'Combat ended without defeating a defender.');return state;
}

function assignCombatDamage(state,enemy){
  const attackers=enemy.members||[enemy];let damage=attackers.reduce((sum,item)=>sum+item.attack*(item.traits.includes('brutal')?2:1),0);const attackType=enemy.traits.includes('coldfire')?'coldfire':enemy.traits.includes('fire')?'fire':enemy.traits.includes('ice')?'ice':'physical';
  for(const id of state.combat.damageUnits||[]){const unit=state.player.units.find(item=>item.id===id);if(!unit||unit.wounded||damage<=0)continue;const resistant=(unit.resistances||[]).includes(attackType);if(resistant){damage=Math.max(0,damage-unit.armor);if(damage<=0){state.combat.damageAssignedUnitIds=state.combat.damageAssignedUnitIds||[];state.combat.damageAssignedUnitIds.push(unit.id);continue;}}if(enemy.traits.includes('paralyze')){if(unit.banner)state.player.discard.push(unit.banner);state.player.units=state.player.units.filter(item=>item.id!==unit.id);log(state,`${unit.name} was destroyed by Paralyze.`);}else{unit.wounded=true;unit.woundCount=enemy.traits.includes('poison')?2:1;log(state,`${unit.name} received ${unit.woundCount} Wound${unit.woundCount===1?'':'s'}.`);}damage=Math.max(0,damage-unit.armor);}
  let wounds=damage>0?Math.ceil(damage/state.player.armor):0;if(enemy.traits.includes('poison')&&wounds){for(let i=0;i<wounds;i++)state.player.discard.push({id:'wound',uid:`poison-${state.turn}-${i}`,name:'Wound',color:'wound',basic:{},strong:{}});state.player.wounds+=wounds;}if(wounds)wound(state,wounds);state.combat.woundsTaken=(state.combat.woundsTaken||0)+wounds;if(enemy.traits.includes('paralyze')&&wounds){state.player.hand.filter(card=>card.id!=='wound').forEach(card=>state.player.discard.push(card));state.player.hand=state.player.hand.filter(card=>card.id==='wound');}if(state.combat.woundsTaken>=baseHandLimit(state.player)){state.player.hand.filter(card=>card.id!=='wound').forEach(card=>state.player.discard.push(card));state.player.hand=state.player.hand.filter(card=>card.id==='wound');log(state,'The Mage Knight was knocked out.');}log(state,damage>0?`Unblocked attack assigned ${damage} remaining damage to the Hero.`:'Units absorbed all damage.');
}

function checkVictory(state){
  const cities=state.map.filter(item=>item.site==='city'),conquered=cities.filter(item=>item.conquered).length;const needed=state.scenario==='cooperative-conquest'?cities.length:Math.min(cities.length,state.multiplayer?Math.max(2,state.players.length):2);
  if(cities.length&&conquered>=needed){if(state.multiplayer){if(state.scenarioEndTurnsRemaining===null){state.scenarioEndTurnsRemaining=state.players.length;state.scenarioFinalTurnsStarted=false;log(state,`${conquered} cities have fallen. Every player receives a final turn.`);}}else{state.status='won';state.scoring=calculateScore(state);log(state,`${conquered} cities have fallen. The conquest is complete!`);}return true;}return false;
}

function winCombat(state, phase) {
  const {q,r,enemy,kind}=state.combat;if(kind==='cooperative-city')return finishCooperativeBattle(state);if(kind==='provoked'){for(const source of Object.values(state.combat.enemySources||{})){const sourceHex=state.map.find(h=>h.q===source.q&&h.r===source.r);if(sourceHex){sourceHex.enemy=null;sourceHex.enemies=[];}}for(const member of enemy.members||[enemy]){const site=state.combat.enemySources?.[enemyKey(member)]?.site;if(site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);if(site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);}gainFame(state,enemy.fame);discardEnemyTokens(state,enemy.members||[enemy]);state.player.defeated=(state.player.defeated||[]).concat((enemy.members||[enemy]).map(item=>({id:item.id,name:item.name,fame:item.fame})));state.phase='action';state.combat=null;log(state,`${enemy.name} defeated in the ${phase} phase for ${enemy.fame} Fame.`);return state;}const hex=state.map.find(h=>h.q===q&&h.r===r);if(kind==='fortified'&&state.combat.enemySources){for(const source of Object.values(state.combat.enemySources)){const sourceHex=state.map.find(h=>h.q===source.q&&h.r===source.r);if(sourceHex){sourceHex.enemy=null;sourceHex.enemies=[];}}for(const member of enemy.members||[enemy]){const source=state.combat.enemySources[enemyKey(member)];if(!source?.siteDefender&&source?.site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);if(!source?.siteDefender&&source?.site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);}gainFame(state,enemy.fame);discardEnemyTokens(state,enemy.members||[enemy]);state.player.defeated=(state.player.defeated||[]).concat((enemy.members||[enemy]).map(item=>({id:item.id,name:item.name,fame:item.fame})));conquerFortifiedSite(state,hex,state.combat.rivalKeepOwnerId);returnRivalKeepToken(state);state.phase='action';state.combat=null;log(state,`${enemy.name} defeated in the ${phase} phase for ${enemy.fame} Fame.`);return state;}hex.enemy=null;
  hex.enemies=[];gainFame(state,enemy.fame);discardEnemyTokens(state,enemy.members||[enemy]);state.player.defeated=(state.player.defeated||[]).concat((enemy.members||[enemy]).map(item=>({id:item.id,name:item.name,fame:item.fame}))); state.phase='action'; state.combat=null;
  if(kind==='fortified'){state.player.q=q;state.player.r=r;hex.conquered=true;hex.ownerId=state.player.id||state.player.character;}
  if(kind==='adventure'||kind==='burn'){hex.conquered=true;hex.ownerId=state.player.id||state.player.character;}
  if(kind==='burn'){hex.burned=true;state.pendingRewards.push({type:'artifact',source:'Burned monastery'});}
  if(hex.site==='keep')state.player.keeps++;
  if(hex.site==='mage-tower')state.pendingRewards.push({type:'spell',source:'Mage Tower'});
  if(hex.site==='dungeon')state.pendingRewards.push({type:(state.seed+state.turn)%3===0?'spell':'artifact',source:'Dungeon'});
  if(hex.site==='tomb')state.pendingRewards.push({type:'spell',source:'Tomb'},{type:'artifact',source:'Tomb'});
  if(hex.site==='monster-den')state.pendingRewards.push({type:'crystals',count:2,source:'Monster Den'});
  if(hex.site==='spawning-grounds')state.pendingRewards.push({type:'artifact',source:'Spawning Grounds'},{type:'crystals',count:3,source:'Spawning Grounds'});
  if(hex.site==='ruins')state.pendingRewards.push(hex.ruinsToken?.reward==='artifact'?{type:'artifact',source:'Ancient Ruins'}:{type:'crystals',count:hex.ruinsToken?.count||4,source:'Ancient Ruins'});
  if(hex.site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);
  if(hex.site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);
  if(hex.site==='city'){state.player.cities++;checkVictory(state);}
  log(state,`${enemy.name} defeated in the ${phase} phase for ${enemy.fame} Fame.`); return state;
}

function prepareReward(state){
  const reward=state.pendingRewards[0];if(!reward)return fail(state,'There is no pending reward.');if(reward.type==='artifact'&&!reward.options){lockUndo(state,'Artifact choices were revealed.');const count=reward.count||1;reward.options=state.decks.artifacts.splice(0,Math.min(state.decks.artifacts.length,count+1));log(state,`Revealed ${reward.options.length} Artifact choices.`);}if(reward.type==='crystals'&&!reward.rolls){lockUndo(state,'Reward dice were rolled.');const faces=[...COLORS,'gold','black'];reward.rolls=Array.from({length:reward.count||1},(_,index)=>faces[(state.seed+state.turn*17+state.round*31+index*7)%faces.length]);log(state,`Rolled crystal rewards: ${reward.rolls.join(', ')}.`);}return state;
}

function claimReward(state,action){
  const reward=state.pendingRewards[0];if(!reward)return fail(state,'There is no pending reward.');
  if(reward.type==='crystals'){
    if(!reward.rolls)return fail(state,'Roll the crystal rewards first.');const goldCount=reward.rolls.filter(color=>color==='gold').length,colors=(action.colors||[]).filter(color=>COLORS.includes(color));if(colors.length!==goldCount)return fail(state,`Choose ${goldCount} basic color${goldCount===1?'':'s'} for the gold result${goldCount===1?'':'s'}.`);let goldIndex=0;reward.rolls.forEach(result=>{if(result==='black')gainFame(state,1);else{const color=result==='gold'?colors[goldIndex++]:result;if(state.player.crystals[color]<3)state.player.crystals[color]++;}});
  } else if(reward.type==='artifact'){
    if(!reward.options)return fail(state,'Reveal the Artifact choices first.');const count=Math.min(reward.count||1,reward.options.length),ids=[...new Set(action.ids||[action.id].filter(Boolean))];if(ids.length!==count||ids.some(id=>!reward.options.some(card=>card.id===id)))return fail(state,`Choose exactly ${count} revealed Artifact${count===1?'':'s'}.`);const chosen=ids.map(id=>reward.options.find(card=>card.id===id));state.player.deck.unshift(...chosen.map(card=>cardWithUid(card,state)));state.decks.artifacts.push(...reward.options.filter(card=>!ids.includes(card.id)));
  } else {
    const offer=state.offer.spells;const card=offer.find(c=>c.id===action.id);if(!card)return fail(state,`No ${reward.type} is available.`);
    state.player.deck.unshift(cardWithUid(card,state));state.offer.spells=state.offer.spells.filter(c=>c.id!==card.id);if(state.decks.spells.length)state.offer.spells.push(state.decks.spells.shift());
  }
  state.pendingRewards.shift();log(state,`Claimed ${reward.type} reward from ${reward.source}.`);return state;
}

function interact(state, action) {
  if(state.phase!=='action')return fail(state,'Finish combat before interacting.'); const hex=currentHex(state);
  if(!hex?.site)return fail(state,'There is nothing to interact with here.');
  if(state.multiplayer&&state.players.some(player=>player.id!==state.player.id&&player.q===state.player.q&&player.r===state.player.r)&&!(hex.site==='city'&&hex.conquered))return fail(state,'You cannot take another action while sharing a space with another Mage Knight.');
  if(state.player.reputation<=-7)return fail(state,'Your Reputation is at X; locals refuse to interact.');
  const identity=state.player.id||state.player.character,city=hex.site==='city'&&hex.conquered,cityBonus=city&&!state.player.cityInfluenceApplied?(hex.cityShields?.[identity]||0):0,influenceAvailable=()=>state.points.influence+cityBonus,spendInfluence=amount=>{state.points.influence=influenceAvailable()-amount;if(city)state.player.cityInfluenceApplied=true;};const ownedSite=(hex.site==='mage-tower'&&hex.conquered)||(hex.site==='keep'&&hex.conquered&&hex.ownerId===identity);
  if(['keep','mage-tower','city'].includes(hex.site)&&!ownedSite&&!city)return fail(state,'This fortified site must be conquered before interaction.');
  if(action.kind==='heal') { const count=action.count||1; if(!['village','monastery'].includes(hex.site))return fail(state,'Healing is not offered here.');const each=hex.site==='monastery'?2:3;const price=count*each;if(influenceAvailable()<price)return fail(state,`You need ${price} Influence.`); if(state.player.wounds<count)return fail(state,'Not enough Wounds to heal.');spendInfluence(price);state.player.wounds-=count;removeWounds(state,count);log(state,`Healed ${count} Wound${count===1?'':'s'}.`); return state; }
  if(action.kind==='recruit') { const unit=state.offer.units.find(u=>u.id===action.id); if(!unit)return fail(state,'That unit is not in the offer.');const allowed=(city&&hex.cityColor==='white')||unit.sites.includes(hex.site)||(city&&unit.sites.includes('city'));if(!allowed)return fail(state,`${unit.name} cannot be recruited here.`);const full=state.player.units.length>=state.player.command,disband=full?state.player.units.find(item=>item.id===action.disbandUnitId):null;if(full&&!disband)return fail(state,'All command slots are full; choose one Unit to disband.');const modifier=reputationInfluence(state.player.reputation),cost=Math.max(0,unit.cost-modifier);if(influenceAvailable()<cost)return fail(state,`You need ${cost} Influence after reputation.`);spendInfluence(cost);if(disband){state.player.units=state.player.units.filter(item=>item.id!==disband.id);if(disband.banner)state.player.discard.push(disband.banner);log(state,`${disband.name} was disbanded${disband.banner?`; ${disband.banner.name} returned to the discard pile`:''}.`);}state.player.units.push({...unit,spent:false,wounded:false,woundCount:0});state.offer.units=state.offer.units.filter(u=>u.id!==unit.id);log(state,`Recruited ${unit.name}.`);return state; }
  if(action.kind==='plunder') { if(hex.site!=='village')return fail(state,'Only villages may be plundered.');if(!state.player.atTurnStart)return fail(state,'A village may be plundered only before starting your turn.');state.player.reputation=Math.max(-7,state.player.reputation-1);draw(state,2);state.player.atTurnStart=false;log(state,'Plundered the village before the turn: drew two cards and lost 1 Reputation.');return state; }
  if(action.kind==='altar'){if(hex.site!=='ruins'||hex.ruinsToken?.type!=='altar'||hex.used)return fail(state,'There is no unused altar here.');if(!spendMana(state,hex.ruinsToken.color))return fail(state,`The altar requires ${hex.ruinsToken.color} mana.`);gainFame(state,hex.ruinsToken.fame);hex.used=true;log(state,`The ${hex.ruinsToken.color} altar granted ${hex.ruinsToken.fame} Fame.`);return state;}
  if(action.kind==='learn-advanced') {if(!(hex.site==='monastery'||(city&&hex.cityColor==='green')))return fail(state,'Advanced Actions are not taught here.');if(influenceAvailable()<6)return fail(state,'You need 6 Influence.');const source=hex.site==='monastery'?state.offer.monastery:state.offer.advanced;const card=source.find(c=>c.id===action.id)||source[0];if(!card)return fail(state,'No Advanced Action is available.');spendInfluence(6);state.player.deck.unshift(cardWithUid(card,state));if(hex.site==='monastery')state.offer.monastery=state.offer.monastery.filter(c=>c.id!==card.id);else{state.offer.advanced=state.offer.advanced.filter(c=>c.id!==card.id);if(state.decks.advanced.length)state.offer.advanced.push(state.decks.advanced.shift());}log(state,`Learned ${card.name}.`);return state;}
  if(action.kind==='learn-advanced-top') {if(!(city&&hex.cityColor==='green'))return fail(state,'The hidden Advanced Action deck is available only in a conquered Green city.');if(influenceAvailable()<6)return fail(state,'You need 6 Influence.');if(!state.decks.advanced.length)return fail(state,'The Advanced Action deck is empty.');lockUndo(state,'A hidden Advanced Action was drawn.');spendInfluence(6);const card=state.decks.advanced.shift();state.player.deck.unshift(cardWithUid(card,state));log(state,`Learned ${card.name} from the hidden Advanced Action deck.`);return state;}
  if(action.kind==='learn-spell') {if(!(hex.site==='mage-tower'||(city&&hex.cityColor==='blue')))return fail(state,'Spells are not taught here.');const card=state.offer.spells.find(c=>c.id===action.id);if(!card)return fail(state,'That Spell is not available.');if(influenceAvailable()<7)return fail(state,'You need 7 Influence.');if(!spendMana(state,card.color))return fail(state,`You also need ${card.color} mana.`);spendInfluence(7);state.player.deck.unshift(cardWithUid(card,state));state.offer.spells=state.offer.spells.filter(c=>c.id!==card.id);if(state.decks.spells.length)state.offer.spells.push(state.decks.spells.shift());log(state,`Learned ${card.name}.`);return state;}
  if(action.kind==='buy-artifact') {if(!(city&&hex.cityColor==='red'))return fail(state,'Artifacts are sold only in a conquered Red city.');if(influenceAvailable()<12)return fail(state,'You need 12 Influence.');spendInfluence(12);state.pendingRewards.push({type:'artifact',source:'Red City'});log(state,'Purchased an Artifact reward.');return state;}
  if(action.kind==='add-elite') {if(!(city&&hex.cityColor==='white'))return fail(state,'Elite Units are added only in a conquered White city.');if(influenceAvailable()<2)return fail(state,'You need 2 Influence.');spendInfluence(2);const elite=UNITS.find(u=>u.elite&&!state.offer.units.some(x=>x.id===u.id));if(elite)state.offer.units.push(clone(elite));log(state,'Added an Elite Unit to the offer.');return state;}
  return fail(state,'That interaction is not available here.');
}

function removeWounds(state,count){
  for(const pile of [state.player.hand,state.player.discard])for(let i=pile.length-1;i>=0&&count>0;i--)if(pile[i].id==='wound'){pile.splice(i,1);count--;}
}

function applyForcedWithdrawal(state){
  let hex=currentHex(state),steps=0;
  while(!isSafeSpace(state,state.player,hex)&&state.player.moveHistory.length){const previous=state.player.moveHistory.pop();state.player.q=previous.q;state.player.r=previous.r;wound(state,1);steps++;hex=currentHex(state);}
  if(steps)log(state,`Forced withdrawal backtracked ${steps} space${steps===1?'':'s'} and caused ${steps} Wound${steps===1?'':'s'}.`);
  return hex;
}

function endTurn(state,roundAnnouncement=false) {
  const hex=applyForcedWithdrawal(state);
  const immediateExtraTurn=Boolean(state.player.extraTurn);state.player.extraTurn=false;
  const carry=state.player.carry;state.player.carry=null;
  if(!roundAnnouncement&&hex?.site==='mine'){const color=hex.mineColor;if(state.player.crystals[color]<3){state.player.crystals[color]++;log(state,`The mine produced a ${color} crystal.`);}}
  if(!roundAnnouncement&&hex?.site==='glade'&&state.player.wounds>0){const before=state.player.hand.length+state.player.discard.length;removeWounds(state,1);if(state.player.hand.length+state.player.discard.length<before){state.player.wounds--;log(state,'The magical glade removed one Wound.');}}
  state.player.discard.push(...state.player.played); state.player.played=[];state.player.cardsPlayedThisTurn=0;state.player.atTurnStart=false;state.player.emptyHandPassAllowed=false;state.player.movedThisTurn=false;state.player.moveHistory=[];state.player.turnAction=null;state.player.cityInfluenceApplied=false;state.points=freshPoints();if(carry)Object.entries(carry).forEach(([key,value])=>state.points[key]+=value); state.mana=[]; state.sourceTaken=false;state.bonuses.sideways=null;state.bonuses.manaOverload=null;
  state.player.skills.forEach(s=>s.used=false); const target=handLimit(state); if(!roundAnnouncement&&state.player.hand.length<target)draw(state,target-state.player.hand.length);
  if(!roundAnnouncement&&hex?.site==='glade')state.mana.push(state.time==='day'?'gold':'black');
  state.turn++;
  if(state.multiplayer){
    if(state.scenarioEndTurnsRemaining!==null){if(!state.scenarioFinalTurnsStarted)state.scenarioFinalTurnsStarted=true;else{state.scenarioEndTurnsRemaining--;if(state.scenarioEndTurnsRemaining<=0){state.status='won';state.scoring=calculateScore(state);log(state,'Final turns are complete. The conquest has ended.');return state;}}}
    if(immediateExtraTurn){state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);log(state,`${state.player.name} takes the extra turn granted by ${state.player.tactic?.name}.`);checkpointTurn(state);return state;}
    if(state.roundEndTurnsRemaining!==null&&!roundAnnouncement){state.roundEndTurnsRemaining--;if(state.roundEndTurnsRemaining<=0)return nextRound(state);}
    const currentIndex=state.turnOrder.indexOf(state.activePlayerId);let nextIndex=(currentIndex+1)%state.turnOrder.length,nextPlayer=null,guard=0;while(guard<=state.turnOrder.length){const candidateId=state.turnOrder[nextIndex];if(candidateId==='dummy'){if(state.roundEndTurnsRemaining===null)takeDummyTurn(state);nextIndex=(nextIndex+1)%state.turnOrder.length;guard++;continue;}nextPlayer=playerById(state,candidateId);if(nextPlayer?.skipNextTurn){nextPlayer.skipNextTurn=false;nextPlayer.roundOrderFaceDown=false;log(state,`${nextPlayer.name} skips the turn already spent fully attending PvP or a joint assault.`);if(state.scenarioEndTurnsRemaining!==null){state.scenarioEndTurnsRemaining--;if(state.scenarioEndTurnsRemaining<=0){state.status='won';state.scoring=calculateScore(state);log(state,'Final turns are complete. The conquest has ended.');return state;}}if(state.roundEndTurnsRemaining!==null){state.roundEndTurnsRemaining--;if(state.roundEndTurnsRemaining<=0)return nextRound(state);}nextIndex=(nextIndex+1)%state.turnOrder.length;guard++;continue;}break;}state.activePlayerId=state.turnOrder[nextIndex];bindPlayerState(state,state.activePlayerId);state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);state.points=freshPoints();state.mana=[];state.sourceTaken=false;state.bonuses.sideways=null;state.bonuses.manaOverload=null;log(state,`${state.player.name}'s turn begins.`);checkpointTurn(state);return state;
  }
  state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);log(state,`Turn ${state.turn} begins.`);checkpointTurn(state); return state;
}

function refreshOffers(state){
  if(state.offer.advanced.length){const retired=state.offer.advanced.shift();if(state.dummy)state.dummy.deck.push(retired);else state.decks.advanced.push(retired);}if(state.decks.advanced.length)state.offer.advanced.push(state.decks.advanced.shift());if(state.offer.spells.length){const retired=state.offer.spells.shift();if(state.dummy)state.dummy.crystals[retired.color]=Math.min(3,(state.dummy.crystals[retired.color]||0)+1);state.decks.spells.push(retired);}if(state.decks.spells.length)state.offer.spells.push(state.decks.spells.shift());
  state.offer.units.forEach(unit=>state.decks[unit.elite?'eliteUnits':'regularUnits'].push(unit));state.offer.units=[];const count=(state.multiplayer?state.players.length:1)+2+(state.scenario==='blitz-conquest'?1:0),coreRevealed=state.map.some(hex=>hex.core&&hex.revealed!==false);for(let index=0;index<count;index++){const primary=coreRevealed&&index%2===0?'eliteUnits':'regularUnits',secondary=primary==='eliteUnits'?'regularUnits':'eliteUnits';const unit=state.decks[primary].shift()||state.decks[secondary].shift();if(unit)state.offer.units.push(unit);}
  (state.offer.monastery||[]).forEach(card=>state.decks.advanced.push(card));state.offer.monastery=[];const monasteries=state.map.filter(hex=>hex.revealed!==false&&hex.site==='monastery'&&!hex.burned).length;for(let index=0;index<monasteries&&state.decks.advanced.length;index++)state.offer.monastery.push(state.decks.advanced.shift());
}

function nextRound(state){
  if(state.multiplayer&&state.dummy&&state.round<(state.maxRounds||6)){
    const used=state.players.map(player=>player.tactic?.id).filter(Boolean),dummyId=state.dummy.tactic?.id;
    if(state.players.length===1){state.removedTactics[state.time]=[...new Set([...(state.removedTactics[state.time]||[]),...used,...(dummyId?[dummyId]:[])])];}
    else if(state.scenario==='cooperative-conquest'&&used.length){state.pendingTacticRemoval=[...new Set(used)];state.phase='tactic-removal';state.activePlayerId=state.players[0].id;bindPlayerState(state,state.activePlayerId);state.undoCheckpoint=null;state.undoBlockedReason='The round has ended.';log(state,'The host must remove one tactic used by a real player before the next round.');return state;}
  }
  return advanceRound(state);
}

function advanceRound(state) {
  if(state.round>=(state.maxRounds||6)){state.status='lost';state.scoring=calculateScore(state);log(state,'The final Night ends before the cities are conquered. Final scoring is complete.');return state;}
  const previousRoundOrder=(state.turnOrder||[]).filter(id=>id!=='dummy');
  state.undoCheckpoint=null;state.undoBlockedReason=null;state.roundWasAnnounced=false;state.round++; state.time=state.time==='day'?'night':'day';if(state.time==='day')state.map.filter(hex=>hex.site==='ruins'&&hex.ruinsToken).forEach(hex=>{hex.ruinsToken.faceDown=false;});revealVisibleGarrisons(state);refreshOffers(state);
  if(state.multiplayer){
    state.players.forEach((player,index)=>{bindPlayerState(state,player.id);player.deck=shuffled([...player.discard,...player.hand],state.seed+state.round+index*997);player.hand=[];player.discard=[];player.tactic=null;player.tacticUsed=false;player.skipNextTurn=false;player.roundOrderFaceDown=false;player.cardsPlayedThisTurn=0;player.atTurnStart=false;player.emptyHandPassAllowed=false;player.movedThisTurn=false;player.moveHistory=[];player.turnAction=null;player.cityInfluenceApplied=false;draw(state,handLimit(state));player.units.forEach(unit=>{unit.spent=false;if(unit.banner)unit.banner.used=false;});player.skills.forEach(skill=>{skill.used=false;skill.roundUsed=false;});});
    if(state.dummy){state.dummy.deck=shuffled([...state.dummy.deck,...state.dummy.discard],state.seed+state.round*701);state.dummy.discard=[];state.dummy.tactic=null;}
    state.tacticSelections={};state.turnOrder=[];state.activePlayerId=null;state.roundEndTurnsRemaining=null;state.tacticPickOrder=[...state.players].sort((a,b)=>a.fame-b.fame||(previousRoundOrder.indexOf(b.id)-previousRoundOrder.indexOf(a.id))).map(player=>player.id);state.tacticPickerId=state.tacticPickOrder[0];if(state.dummy&&state.players.length>1)selectDummyTactic(state);bindPlayerState(state,state.players[0].id);
  } else {state.player.deck=shuffled([...state.player.discard,...state.player.hand],state.seed+state.round);state.player.hand=[];state.player.discard=[];state.player.tactic=null;state.player.tacticUsed=false;state.player.cardsPlayedThisTurn=0;state.player.atTurnStart=!state.tacticsEnabled;state.player.emptyHandPassAllowed=false;state.player.movedThisTurn=false;state.player.moveHistory=[];state.player.turnAction=null;state.player.cityInfluenceApplied=false;draw(state,handLimit(state));state.player.units.forEach(unit=>{unit.spent=false;if(unit.banner)unit.banner.used=false;});state.player.skills.forEach(s=>{s.used=false;s.roundUsed=false;});}
  state.map.forEach(h=>h.used=false);const sourceCount=(state.multiplayer?state.players.length:1)+2+(state.scenario==='blitz-conquest'?1:0);state.source=rollSource(sourceCount,state.time,state.seed+state.round); state.points=freshPoints();state.turn++;state.mana=[];state.sourceTaken=false;state.tactic=null;if(state.tacticsEnabled)state.phase='tactic';
  log(state,`${state.time==='day'?'Day':'Night'} ${Math.ceil(state.round/2)} begins.`);if(!state.tacticsEnabled)checkpointTurn(state); return state;
}

export const rulesSummary = [
  ['Turn', 'Play cards for their basic action, power one with matching mana, or play any non-Wound card sideways for Move, Influence, Attack, or Block 1. Use at most one Source die.'],
  ['Movement', 'Pay the destination terrain cost. Forest costs 3 by day/5 by night; desert 5 by day/3 by night. Lakes and mountains are impassable.'],
  ['Combat', 'Resolve Ranged/Siege, Block, then Attack. Fortified enemies require Siege in the first phase. Swift doubles block needed; Brutal doubles unblocked damage; physical resistance doubles physical armor.'],
  ['Sites', 'Recruit and heal at inhabited sites, gain crystals at mines, heal at glades, and assault fortified sites for Move 2 and Reputation −1.'],
  ['Rounds', 'At the start of each multiplayer round, every player takes a unique Day or Night tactic; its number sets turn order. When a deck is exhausted, the round may be announced and every other player receives one last turn.'],
  ['Exploration', 'Spend 2 Move while adjacent to an unrevealed tile. Countryside tiles must be revealed before core tiles. Revealed enemies and sites immediately become part of the shared map.'],
  ['Cooperation', 'In Cooperative Conquest, the leader assigns at least one city defender to every invited adjacent player. Everyone must consent, pay their own Move, and resolve a separate combat in round order.'],
  ['PvP', 'Outside Cooperative Conquest, adjacent players may fight through ranged and melee phases. The defender commits cards privately, then marks ready for each phase.'],
  ['Scoring', 'Final score combines Fame with knowledge, artifacts, unit leadership, conquest, adventures and PvP; two points are deducted per Wound.'],
];
