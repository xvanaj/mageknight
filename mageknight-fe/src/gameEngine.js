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
  orc:['prowlers','diggers','orcTrackers','orcSummoners'],grey:['guards','golem','gargoyles'],violet:['mage','medusa','iceGolems'],brown:['golem','den','cryptWorm','medusa'],red:['tomb','iceDragon','highDragon'],dragon:['dragon','iceDragon','highDragon'],
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

const HEXES = [
  [0, 0, 'plains', 'portal'], [1, 0, 'plains', null], [1, -1, 'forest', 'glade'],
  [0, -1, 'plains', 'village'], [-1, 0, 'hills', 'mine'], [-1, 1, 'forest', null], [0, 1, 'lake', null],
  [2, 0, 'hills', 'keep', 'guards'], [2, -1, 'plains', 'rampaging', 'prowlers'], [2, -2, 'forest', 'monastery'],
  [1, -2, 'hills', 'mage-tower', 'mage'], [0, -2, 'lake', null], [-1, -1, 'desert', 'ruins', 'golem'],
  [-2, 0, 'wasteland', 'dungeon', 'golem'], [-2, 1, 'plains', 'village'], [-2, 2, 'forest', 'glade'],
  [-1, 2, 'swamp', 'rampaging', 'diggers'], [0, 2, 'mountain', null], [1, 1, 'desert', 'draconum', 'dragon'],
  [3, -1, 'plains', null], [3, -2, 'wasteland', 'city', 'city', 'red'], [3, -3, 'desert', null], [2, -3, 'forest', 'mine'],
  [-3, 0, 'plains', null], [-3, 1, 'hills', 'tomb', 'tomb'], [-3, 2, 'forest', 'monster-den', 'den'],
  [-3, 3, 'swamp', 'spawning-grounds', 'spawn'], [-2, 3, 'plains', 'city', 'city', 'blue'],
  [-1, 3, 'hills', 'city', 'city', 'white'], [0, 3, 'forest', 'city', 'city', 'green'],[1,3,'desert','draconum','highDragon'],
  [4,-1,'plains','village'],[4,-2,'forest','glade'],[4,-3,'hills','keep','guards'],[4,-4,'desert','ruins','golem'],[3,-4,'wasteland','rampaging','prowlers'],[2,-4,'lake',null],
  [1,-4,'forest','monster-den','den'],[0,-4,'desert','draconum','dragon'],[-1,-3,'hills','keep','guards'],[-2,-2,'plains','village'],[-3,-1,'wasteland','dungeon','golem'],[-4,0,'forest','mage-tower','mage'],
  [-4,1,'plains','monastery'],[-4,2,'swamp','ruins','golem'],[-4,3,'forest','glade'],[-4,4,'desert','draconum','iceDragon'],[-3,4,'hills','keep','guards'],[-2,4,'plains','mine'],
].map(([q, r, terrain, site, enemy, cityColor]) => ({ q, r, s: -q-r, terrain, site, cityColor, mineColor: site==='mine' ? COLORS[(Math.abs(q)+Math.abs(r))%4] : undefined, enemy: enemy ? { ...ENEMIES[enemy], uid: `${q}:${r}:${enemy}` } : null, conquered: false, burned:false, used: false }));

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

const clone = value => JSON.parse(JSON.stringify(value));
const isBanner=card=>card?.type==='artifact'&&card.id?.startsWith('banner-');
const migrateState=state=>{
  const players=state.players||[state.player];players.filter(Boolean).forEach(player=>{player.removed=player.removed||[];player.defeated=player.defeated||[];player.tacticUsed=Boolean(player.tacticUsed);player.skipNextTurn=Boolean(player.skipNextTurn);player.roundOrderFaceDown=Boolean(player.roundOrderFaceDown);player.cardsPlayedThisTurn=player.cardsPlayedThisTurn??player.played?.length??0;player.atTurnStart=Boolean(player.atTurnStart);player.emptyHandPassAllowed=Boolean(player.emptyHandPassAllowed);player.movedThisTurn=Boolean(player.movedThisTurn);player.moveHistory=player.moveHistory||[];player.turnAction=player.turnAction||null;player.units=(player.units||[]).map(unit=>({...unit,wounded:Boolean(unit.wounded),woundCount:unit.woundCount||0,banner:unit.banner?{...unit.banner,used:Boolean(unit.banner.used)}:null}));});
  state.decks=state.decks||{};state.offer.monastery=state.offer.monastery||[];const offeredIds=new Set((state.offer?.units||[]).map(unit=>unit.id));state.decks.regularUnits=state.decks.regularUnits||clone(UNITS.filter(unit=>!unit.elite&&!offeredIds.has(unit.id)));state.decks.eliteUnits=state.decks.eliteUnits||clone(UNITS.filter(unit=>unit.elite&&!offeredIds.has(unit.id)));state.enemyDecks=state.enemyDecks||createEnemyDecks(state.seed||1);state.enemyDiscards=state.enemyDiscards||{};state.enemyDiscards.brown=state.enemyDiscards.brown||[];state.scenarioEndTurnsRemaining=state.scenarioEndTurnsRemaining??null;if(state.combat){state.combat.damageUnits=state.combat.damageUnits||[];state.combat.enemies=state.combat.enemies||clone(state.combat.enemy?.members||[state.combat.enemy].filter(Boolean));state.combat.defeatedIds=state.combat.defeatedIds||[];state.combat.blockedIds=state.combat.blockedIds||[];}state.version=5;return state;
};
const enemyGroup=members=>{const list=members.map(clone);return {id:list.map(enemy=>enemy.id).join('+'),uid:list.map(enemy=>enemy.uid||enemy.id).join('|'),name:list.length>1?`${list.length} defenders`:list[0].name,armor:list.reduce((sum,enemy)=>sum+enemy.armor,0),attack:list.reduce((sum,enemy)=>sum+enemy.attack,0),fame:list.reduce((sum,enemy)=>sum+enemy.fame,0),traits:[...new Set(list.flatMap(enemy=>enemy.traits||[]))],members:list};};
const enemyKey=enemy=>enemy.uid||enemy.id;
const withCityBonus=(enemy,color)=>{const result=clone(enemy),traits=new Set(result.traits||[]),elemental=['fire','ice','coldfire'].find(type=>traits.has(type));if(color==='white')result.armor++;if(color==='blue'&&elemental)result.attack+=elemental==='coldfire'?1:2;if(color==='red'&&!elemental)traits.add('brutal');if(color==='green'&&!elemental)traits.add('poison');result.traits=[...traits];return result;};
const livingCombatEnemies=state=>(state.combat?.enemies||[state.combat?.enemy].filter(Boolean)).filter(enemy=>!(state.combat?.defeatedIds||[]).includes(enemyKey(enemy)));
const chosenCombatEnemies=(state,ids)=>{const living=livingCombatEnemies(state);if(!ids?.length)return living;const chosen=new Set(ids);return living.filter(enemy=>chosen.has(enemyKey(enemy)));};
const markCombatDefeated=(state,enemies)=>{state.combat.defeatedIds=state.combat.defeatedIds||[];const site=state.map.find(hex=>hex.q===state.combat.q&&hex.r===state.combat.r),identity=state.player.id||state.player.character;for(const enemy of enemies){const id=enemyKey(enemy);if(state.combat.defeatedIds.includes(id))continue;state.combat.defeatedIds.push(id);if(site?.site==='city'&&state.combat.enemySources?.[id]?.siteDefender){site.cityShields=site.cityShields||{};site.cityShieldOrder=site.cityShieldOrder||[];site.cityShields[identity]=(site.cityShields[identity]||0)+1;site.cityShieldOrder.push(identity);}}};
const spendCombatPoints=(state,keys)=>keys.forEach(key=>{state.points[key]=0;});
const effectiveBlock=(state,enemy)=>{const traits=enemy.traits||[];const physical=state.points.block,ice=state.points.iceBlock,fire=state.points.fireBlock;if(traits.includes('coldfire'))return Math.floor((physical+ice+fire)/2);if(traits.includes('fire'))return ice+Math.floor((physical+fire)/2);if(traits.includes('ice'))return fire+Math.floor((physical+ice)/2);return physical+ice+fire;};
const blockEnemyKey=enemy=>enemy.summonerId||enemyKey(enemy);
const attackingCombatEnemies=state=>state.combat?.blockEnemies||livingCombatEnemies(state);
const distance = (a, b) => (Math.abs(a.q-b.q) + Math.abs(a.r-b.r) + Math.abs((-a.q-a.r)-(-b.q-b.r))) / 2;
const playerById=(state,id)=>state.players.find(player=>player.id===id);
const shuffled = (items, seed) => {
  const result = [...items]; let x = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) { x = (1664525*x + 1013904223) >>> 0; const j = x % (i+1); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
};
const log = (state, message) => { state.log.unshift({ turn: state.turn, round: state.round, message }); state.log = state.log.slice(0, 80); };
const fail = (state, error) => ({ ...state, error });
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

const tileForHex=(q,r)=>MAP_TILES.find(tile=>tile.hexes.some(hex=>hex[0]===q&&hex[1]===r));
const prepareMap=exploration=>clone(HEXES).map(hex=>{
  const tile=tileForHex(hex.q,hex.r);
  const category=hex.site==='rampaging'?'orc':hex.site==='draconum'?'dragon':hex.site==='keep'?'grey':hex.site==='mage-tower'?'violet':['dungeon','monster-den','spawning-grounds'].includes(hex.site)?'brown':hex.site==='tomb'?'red':null;
  return {...hex,tileId:tile?.id||'portal',core:Boolean(tile?.core),enemyCategory:category,revealed:!exploration||!tile};
});

const createEnemyDecks=seed=>Object.fromEntries(Object.entries(ENEMY_POOLS).map(([category,ids],index)=>[category,shuffled(ids.flatMap((id,copy)=>[{...clone(ENEMIES[id]),uid:`${category}-${id}-${copy}`}]),seed+101+index*19)]));
function revealEnemyTokens(state,tileId){state.map.filter(hex=>hex.tileId===tileId&&hex.enemyCategory&&hex.site!=='spawning-grounds').forEach(hex=>{const deck=state.enemyDecks[hex.enemyCategory];if(deck?.length){const token=deck.shift();hex.enemy={...token,uid:`${hex.q}:${hex.r}:${token.uid}`};hex.enemies=[clone(hex.enemy)];}});}
function setupRuins(state){state.map.filter(hex=>hex.site==='ruins').forEach((ruins,index)=>{const roll=(state.seed+index)%3;if(roll===0){ruins.enemy=null;ruins.ruinsToken={type:'altar',color:COLORS[(state.seed+index)%COLORS.length],fame:7};}else if(roll===1)ruins.ruinsToken={type:'enemies',reward:'artifact'};else ruins.ruinsToken={type:'enemies',reward:'crystals',count:4};});}

const makePlayer=(seed,character='tovak',name)=>{
  const profile=CHARACTER_PROFILES[character]||CHARACTER_PROFILES.tovak;
  const cards=applyCharacterDeck(CARDS,character);
  const deck=shuffled(cards.map((card,index)=>({...clone(card),uid:`${card.id}-${index}`})),seed);
  return {name:profile.name||name||'Mage Knight',character,q:0,r:0,fame:0,reputation:0,level:1,armor:profile.armor||2,command:1,deck:deck.slice(5),hand:deck.slice(0,5),discard:[],played:[],removed:[],wounds:0,crystals:{blue:0,red:0,green:0,white:0},units:[],keeps:0,cities:0,skills:[],defeated:[],assaults:0,pvpWins:0,tactic:null,tacticUsed:false,extraTurn:false,carry:null,skipNextTurn:false,roundOrderFaceDown:false,cardsPlayedThisTurn:0,atTurnStart:false,emptyHandPassAllowed:false,movedThisTurn:false,moveHistory:[],turnAction:null};
};

export function createGame(seed = 20260901, options = {}) {
  const source = shuffled([...COLORS, 'gold', 'black', ...COLORS], seed + 9).slice(0, 3).map((color, i) => ({ id: `die-${i}`, color, used: false }));
  const character=options.character||'tovak';const profile=CHARACTER_PROFILES[character]||CHARACTER_PROFILES.tovak;
  const advancedPool=shuffled(clone(ADVANCED_CARDS),seed+41),spellPool=shuffled(clone(SPELL_CARDS),seed+51),regularUnits=shuffled(clone(UNITS.filter(unit=>!unit.elite)),seed+61),eliteUnits=shuffled(clone(UNITS.filter(unit=>unit.elite)),seed+62);
  const state = {
    version:5, seed, scenario: 'Solo Conquest', status: 'playing', round: 1, maxRounds:6, time: 'day', turn: 1, phase: options.tactics ? 'tactic' : 'action', tacticsEnabled:Boolean(options.tactics), tactic:null,
    map:prepareMap(Boolean(options.exploration)), tileDeck:shuffled(MAP_TILES.map(tile=>tile.id),seed+23), exploredTiles:[], enemyDecks:createEnemyDecks(seed),enemyDiscards:{brown:[]},explorationEnabled:Boolean(options.exploration), source,
    offer: { units:regularUnits.splice(0,3),advanced:advancedPool.splice(0,3),spells:spellPool.splice(0,3),monastery:[] },
    decks: { artifacts:shuffled(clone(ARTIFACT_CARDS),seed+31),advanced:advancedPool,spells:spellPool,regularUnits,eliteUnits },
    player:makePlayer(seed,character),
    skillDeck:shuffled(clone(profile.skills||TOVAK_SKILLS),seed+71), skillChoices:[], commonSkills:[],
    points: freshPoints(), mana: [], sourceTaken: false, combat: null, pendingRewards:[], bonuses:{sideways:null,manaOverload:null}, log: [], error: null,
    scoring:null,pvp:null,cooperativeAssault:null,scenarioEndTurnsRemaining:null,
  };
  state.player.atTurnStart=!options.tactics;
  setupRuins(state);
  if(!options.exploration&&state.map.some(hex=>hex.site==='monastery'&&!hex.burned)&&state.decks.advanced.length)state.offer.monastery.push(state.decks.advanced.shift());
  log(state, 'Solo Conquest begins. It is Day. Your first hand is ready.');
  return state;
}

export function createMultiplayerGame(lobby, seed = 20260901) {
  const state = createGame(seed, { tactics:true,exploration:true });
  const characterNames = {tovak:'Tovak',arythea:'Arythea',goldyx:'Goldyx',norowas:'Norowas',wolfhawk:'Wolfhawk',krang:'Krang',braevalar:'Braevalar'};
  const individualGames = lobby.players.map((member,index)=>createGame(seed+index*997,{character:member.character}));
  state.version=5;state.multiplayer=true;state.scenario=lobby.scenario;state.maxRounds=lobby.scenario==='blitz-conquest'?4:6;state.phase='tactic';state.tacticSelections={};state.turnOrder=[];state.activePlayerId=null;state.roundEndTurnsRemaining=null;state.tacticPickOrder=lobby.players.map(player=>player.id);state.tacticPickerId=state.tacticPickOrder[0];
  state.players=lobby.players.map((member,index)=>({...individualGames[index].player,id:member.id,playerName:member.name,character:member.character,name:characterNames[member.character]||member.name,connected:true,tactic:null}));
  state.source=shuffled([...COLORS,'gold',...COLORS],seed+9).slice(0,lobby.players.length+2).map((color,index)=>({id:`die-${index}`,color,used:false}));
  const garrisonPool=[ENEMIES.city,ENEMIES.guards,ENEMIES.mage,ENEMIES.gargoyles,ENEMIES.dragon];state.map.filter(hex=>hex.site==='city').forEach((hex,index)=>{hex.level=Math.min(11,4+lobby.players.length);const count=Math.max(2,Math.min(4,Math.ceil(hex.level/3)));hex.enemies=Array.from({length:count},(_,slot)=>({...clone(garrisonPool[(index+slot)%garrisonPool.length]),uid:`city-${index}-${slot}`}));hex.enemy=enemyGroup(hex.enemies);});const spawning=state.map.find(hex=>hex.site==='spawning-grounds');if(spawning){spawning.enemies=[{...clone(ENEMIES.den),uid:'spawn-den'},{...clone(ENEMIES.golem),uid:'spawn-golem'}];spawning.enemy=enemyGroup(spawning.enemies);}
  while(state.offer.units.length<lobby.players.length+2&&state.decks.regularUnits.length)state.offer.units.push(state.decks.regularUnits.shift());
  state.playerResources=Object.fromEntries(lobby.players.map((member,index)=>[member.id,{skillDeck:individualGames[index].skillDeck,skillChoices:[],commonSkills:[],bonuses:{sideways:null,manaOverload:null},pendingRewards:[]}]))
  bindPlayerState(state,state.players[0].id);state.log=[];log(state,`${state.players.length}-player ${lobby.scenario.replaceAll('-',' ')} begins. Choose Day tactics.`);return state;
}

function bindPlayerState(state,playerId){
  if(!state.multiplayer)return state.player;
  const player=state.players.find(item=>item.id===playerId);if(!player)return null;
  state.player=player;const resources=state.playerResources[playerId];
  state.skillDeck=resources.skillDeck;state.skillChoices=resources.skillChoices;state.commonSkills=resources.commonSkills;state.bonuses=resources.bonuses;state.pendingRewards=resources.pendingRewards;return player;
}

export function gameViewForPlayer(input,playerId){
  if(!input)return null;const state=migrateState(clone(input));if(!state.multiplayer)return state;
  const own=bindPlayerState(state,playerId);if(!own)return null;
  state.viewerPlayerId=playerId;state.players=state.players.map(player=>player.id===playerId?player:{...player,handCount:player.hand.length,deckCount:player.deck.length,discardCount:player.discard.length,hand:[],deck:[]});
  state.player=state.players.find(player=>player.id===playerId);if(playerId!==state.activePlayerId)state.points=freshPoints();state.map=state.map.map(hex=>hex.revealed===false?{q:hex.q,r:hex.r,s:hex.s,core:hex.core,revealed:false}:hex);if(state.cooperativeAssault?.enemyAssignments)state.cooperativeAssault.enemyAssignments=Object.fromEntries(Object.entries(state.cooperativeAssault.enemyAssignments).map(([id,enemies])=>[id,id===playerId?enemies:enemies.map(()=>null)]));state.hiddenDeckCounts=Object.fromEntries(Object.entries(state.decks||{}).map(([name,cards])=>[name,cards.length]));state.hiddenEnemyCounts=Object.fromEntries(Object.entries(state.enemyDecks||{}).map(([name,cards])=>[name,cards.length]));state.tileDeckCount=state.tileDeck?.length||0;state.skillDeckCount=state.skillDeck?.length||0;state.decks={};state.enemyDecks={};state.tileDeck=[];state.skillDeck=[];delete state.playerResources;return state;
}

function freshPoints() { return { move: 0, influence: 0, heal: 0, attack: 0, block: 0, ranged: 0, siege: 0, iceAttack:0, fireAttack:0, iceBlock:0, fireBlock:0 }; }
function currentHex(state) { return state.map.find(h => h.q === state.player.q && h.r === state.player.r); }
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
function draw(state, count = 1) { while (count-- > 0 && state.player.deck.length) state.player.hand.push(state.player.deck.shift()); }
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
  const old = state.player.level; state.player.fame += amount; state.player.level = levelFor(state.player.fame);
  for(let level=old+1;level<=state.player.level;level++) {
    if(level%2===1){state.player.command++;state.player.armor++;}
    else if(state.skillDeck.length){state.skillChoices.splice(0,state.skillChoices.length,...state.skillDeck.splice(0,Math.min(2,state.skillDeck.length)));}
    log(state, `Level up! You reached level ${level}${level%2===0?' and may choose a Skill.':'.'}`);
  }
}
function wound(state, count) { state.player.wounds += count; for (let i=0;i<count;i++) state.player.hand.push({ id:'wound', uid:`wound-${state.turn}-${i}-${state.player.wounds}`, name:'Wound', color:'wound', basic:{}, strong:{} }); }

export function legalMoves(state) {
  if(state.multiplayer&&state.viewerPlayerId&&state.viewerPlayerId!==state.activePlayerId)return [];
  if (state.phase !== 'action'||state.player.turnAction) return [];
  return state.map.filter(h => h.revealed!==false&&distance(state.player, h) === 1 && (!h.enemy || SITES[h.site]?.kind==='adventure')&&Number.isFinite(TERRAIN_COST[state.time][h.terrain]))
    .map(h => ({ ...h, cost: TERRAIN_COST[state.time][h.terrain], legal: state.points.move >= TERRAIN_COST[state.time][h.terrain] }));
}
const isOccupiedByOpponent=(state,hex)=>Boolean(state.multiplayer&&hex.site!=='portal'&&state.players.some(player=>player.id!==state.player.id&&player.q===hex.q&&player.r===hex.r));
const provokingEnemies=(state,destination)=>state.map.filter(hex=>hex.revealed!==false&&hex.enemy&&['rampaging','draconum'].includes(hex.site)&&distance(state.player,hex)===1&&distance(destination,hex)===1);

export function legalExplorations(state){
  if(!state.explorationEnabled||state.phase!=='action'||state.player.turnAction)return [];
  const ids=new Set();return state.map.filter(hex=>hex.revealed===false&&distance(state.player,hex)===1&&(!hex.tileId||(!ids.has(hex.tileId)&&ids.add(hex.tileId)))).map(hex=>({...hex.tileId&&{tileId:hex.tileId},q:hex.q,r:hex.r,cost:2,legal:state.points.move>=2}));
}

export function calculateScore(state){
  const players=state.multiplayer?state.players:[state.player];
  const rows=players.map(player=>{
    const cards=[...player.deck,...player.hand,...player.discard,...player.played,...player.units.map(unit=>unit.banner).filter(Boolean)],identity=player.id||player.character,owned=state.map.filter(hex=>hex.ownerId===identity),cityScore=state.map.filter(hex=>hex.site==='city'&&hex.conquered).reduce((sum,hex)=>sum+(hex.ownerId===identity?7:(hex.conquerors||[]).includes(identity)?4:0),0);
    const categories={knowledge:cards.filter(card=>card.type==='spell').length*2+cards.filter(card=>card.type==='advanced').length,loot:cards.filter(card=>card.type==='artifact').length*2+Math.floor(Object.values(player.crystals||{}).reduce((sum,value)=>sum+value,0)/2),leadership:player.units.reduce((sum,unit)=>sum+Math.floor((unit.level||0)*(unit.wounded?.5:1)),0),conquest:owned.filter(hex=>['keep','mage-tower','monastery'].includes(hex.site)).length*2,adventure:owned.filter(hex=>SITES[hex.site]?.kind==='adventure').length*2,wounds:-cards.filter(card=>card.id==='wound').length*2,city:cityScore,achievements:0};
    return {playerId:player.id,name:player.playerName||player.name,fame:player.fame,categories,total:0};
  });
  if(state.multiplayer&&state.scenario!=='cooperative-conquest'&&rows.length>1){for(const category of ['knowledge','loot','leadership','conquest','adventure']){const best=Math.max(...rows.map(row=>row.categories[category]));if(best>0){const leaders=rows.filter(row=>row.categories[category]===best);leaders.forEach(row=>{row.categories.achievements+=leaders.length===1?3:1;});}}const worst=Math.min(...rows.map(row=>row.categories.wounds));if(worst<0){const beaten=rows.filter(row=>row.categories.wounds===worst);beaten.forEach(row=>{row.categories.achievements-=beaten.length===1?3:1;});}const bestCity=Math.max(...rows.map(row=>row.categories.city));if(bestCity>0){const cityLeaders=rows.filter(row=>row.categories.city===bestCity);cityLeaders.forEach(row=>{row.categories.achievements+=cityLeaders.length===1?5:2;});}}
  rows.forEach(row=>{row.total=row.fame+Object.values(row.categories).reduce((sum,value)=>sum+value,0);});rows.sort((a,b)=>b.total-a.total);
  const cooperative=state.multiplayer&&state.scenario==='cooperative-conquest',teamTotal=cooperative?Math.min(...rows.map(row=>row.fame))+['knowledge','loot','leadership','conquest','adventure','city'].reduce((sum,category)=>sum+Math.max(...rows.map(row=>row.categories[category])),0)+Math.min(...rows.map(row=>row.categories.wounds)):rows.reduce((sum,row)=>sum+row.total,0);
  return {players:rows,teamTotal,winner:cooperative?null:rows[0]?.playerId||null};
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
    case 'UNASSIGN_BANNER': {
      if(state.multiplayer)bindPlayerState(state,action.playerId);if(state.phase!=='tactic'&&!(state.phase==='action'&&state.player.atTurnStart))return fail(state,'A Banner may be detached only while preparing a round or at the start of your turn.');const unit=state.player.units.find(item=>item.id===action.unitId);if(!unit?.banner)return fail(state,'That Unit has no Banner.');state.player.discard.push(unit.banner);log(state,`${unit.banner.name} was detached from ${unit.name}.`);unit.banner=null;return state;
    }
    case 'SELECT_TACTIC': {
      if(state.phase!=='tactic'||!state.tacticsEnabled)return fail(state,'Tactics are chosen only at the start of a round.');
      const tactic=TACTICS[state.time].find(item=>item.id===action.id);if(!tactic)return fail(state,`That is not a ${state.time} tactic.`);
      if(state.multiplayer){
        if(action.playerId!==state.tacticPickerId)return fail(state,'Players choose tactics from lowest Fame upward. Wait for your pick.');
        if(state.tacticSelections[action.playerId])return fail(state,'You already chose a tactic this round.');
        if(Object.values(state.tacticSelections).some(selection=>selection.id===tactic.id))return fail(state,'Another player already chose that tactic.');
        state.tacticSelections[action.playerId]=clone(tactic);state.player.tactic=clone(tactic);state.player.tacticUsed=false;applyTacticOnTake(state,tactic);log(state,`${state.player.name} chose ${tactic.name} (initiative ${tactic.number}).`);
        if(Object.keys(state.tacticSelections).length===state.players.length){state.turnOrder=state.players.map(player=>player.id).sort((a,b)=>state.tacticSelections[a].number-state.tacticSelections[b].number);state.activePlayerId=state.turnOrder[0];state.tacticPickerId=null;bindPlayerState(state,state.activePlayerId);state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);state.phase='action';log(state,`${state.player.name} has the first turn.`);}else state.tacticPickerId=state.tacticPickOrder.find(id=>!state.tacticSelections[id]);return state;
      }
      state.tactic=clone(tactic);state.player.tactic=clone(tactic);state.player.tacticUsed=false;applyTacticOnTake(state,tactic);state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);state.phase='action';log(state,`${state.player.name} chose ${tactic.name} (initiative ${tactic.number}).`);return state;
    }
    case 'USE_TACTIC': {const result=activateTactic(state,action);if(!result.error)result.player.atTurnStart=false;return result;}
    case 'SELECT_SKILL': {
      const skill=state.skillChoices.find(s=>s.id===action.id); if(!skill)return fail(state,'That Skill is not currently offered.');
      state.player.skills.push({...skill,used:false}); state.commonSkills.push(...state.skillChoices.filter(s=>s.id!==action.id)); state.skillChoices.splice(0);
      const advanced=state.offer.advanced.shift(); if(advanced)state.player.deck.unshift(cardWithUid(advanced,state));
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
      state.mana.push(die.color); state.sourceTaken = true;state.player.atTurnStart=false;
      const faces = [...COLORS, state.time === 'day' ? 'gold' : 'black']; die.color = faces[(state.seed + state.turn * 7 + Number(die.id.slice(-1))) % faces.length];
      log(state, `Took ${state.mana[state.mana.length-1]} mana from the Source.`); return state;
    }
    case 'PLAY_CARD': {
      if (!['action','combat-ranged','combat-block','combat-attack'].includes(state.phase)) return fail(state, 'Cards cannot be played in this phase.');
      const index = state.player.hand.findIndex(c => c.uid === action.uid); if (index < 0) return fail(state, 'That card is not in your hand.');
      const card = state.player.hand[index]; if (card.id === 'wound') return fail(state, 'Wounds cannot be played.');
      const effect=card[action.mode]||{};
      if(effect.any&&!['move','influence','attack','block'].includes(action.effectAs))return fail(state,'Choose Move, Influence, Attack, or Block for this flexible effect.');
      if(effect.anyCombat&&!['ranged','siege','attack','block'].includes(action.effectAs))return fail(state,'Choose a combat power for this flexible effect.');
      if(effect.mana&&!COLORS.includes(action.manaColor))return fail(state,'Choose a basic mana color to gain.');
      if(effect.unitReady&&!state.player.units.some(unit=>unit.id===action.unitId&&unit.spent))return fail(state,'Choose a spent Unit to ready.');
      if(effect.discardRequired&&!state.player.hand.some(item=>item.uid===action.discardUid&&item.uid!==card.uid&&item.id!=='wound'))return fail(state,'Choose another non-Wound card to discard as the cost.');
      const combatStat = {'combat-ranged':['ranged','siege'],'combat-block':['block'],'combat-attack':['attack']}[state.phase];
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
      const unitCombatStats={'combat-ranged':['ranged','siege'],'combat-block':['block','iceBlock','fireBlock'],'combat-attack':['attack','iceAttack','fireAttack','ranged','siege']}[state.phase];if(unitCombatStats&&!unitCombatStats.some(stat=>unit.ability?.[stat]))return fail(state,`That Unit has no ability usable in the ${state.phase.replace('combat-','')} phase.`);if(!['action','combat-ranged','combat-block','combat-attack'].includes(state.phase))return fail(state,'That Unit cannot be activated in this phase.');
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
      const cost = TERRAIN_COST[state.time][hex.terrain]; if (!Number.isFinite(cost)) return fail(state, 'That terrain is impassable.');
      if (state.points.move < cost) return fail(state, `You need ${cost} Move.`);
      const origin={q:state.player.q,r:state.player.r};state.player.moveHistory.push(origin);state.points.move -= cost; state.player.q=hex.q; state.player.r=hex.r;state.player.atTurnStart=false;state.player.movedThisTurn=true; log(state, `Moved to ${hex.terrain}${hex.site ? ` / ${hex.site}`:''}.`);
      if(provoked.length){const enemies=provoked.flatMap(source=>(source.enemy.members||source.enemies||[source.enemy]).map(enemy=>clone(enemy))),enemySources=Object.fromEntries(provoked.flatMap(source=>(source.enemy.members||source.enemies||[source.enemy]).map(enemy=>[enemyKey(enemy),{q:source.q,r:source.r,site:source.site}])));state.player.turnAction='combat';state.phase='combat-ranged';state.combat={q:null,r:null,origin,kind:'provoked',enemy:enemyGroup(enemies),enemies,enemySources,defeatedIds:[],blockedIds:[],blocked:false,woundsTaken:0,damageUnits:[]};log(state,`${provoked.map(item=>item.enemy.name).join(' and ')} attacked during movement.`);}
      return state;
    }
    case 'EXPLORE': {
      if(!state.explorationEnabled||state.phase!=='action')return fail(state,'Exploration is not available now.');if(state.player.turnAction)return fail(state,'Exploration must happen before your turn action.');
      const target=state.map.find(hex=>(action.tileId?hex.tileId===action.tileId:(hex.q===action.q&&hex.r===action.r))&&hex.revealed===false&&distance(state.player,hex)===1);if(!target)return fail(state,'That tile is not adjacent to your position.');
      if(state.points.move<2)return fail(state,'Exploration requires 2 Move.');
      const tile=MAP_TILES.find(item=>item.id===target.tileId);const wildernessRemaining=state.map.some(hex=>hex.revealed===false&&!hex.core);
      if(tile?.core&&wildernessRemaining)return fail(state,'Reveal all countryside tiles before a core tile.');
      state.points.move-=2;state.player.atTurnStart=false;state.player.movedThisTurn=true;state.map.filter(hex=>hex.tileId===target.tileId).forEach(hex=>hex.revealed=true);revealEnemyTokens(state,target.tileId);state.exploredTiles.push(target.tileId);state.tileDeck=state.tileDeck.filter(id=>id!==target.tileId);log(state,`${state.player.name} explored ${target.tileId}.`);return state;
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
      const cost=TERRAIN_COST[state.time][hex.terrain];if(state.points.move<cost)return fail(state,`The leader needs ${cost} Move to enter the city.`);
      const order=state.turnOrder.filter(id=>invited.includes(id)),leaderIndex=order.indexOf(state.player.id),participantOrder=[...order.slice(leaderIndex),...order.slice(0,leaderIndex)];state.cooperativeAssault={q:hex.q,r:hex.r,leaderId:state.player.id,eligible,invited,assignments,participantOrder,accepted:[state.player.id],stage:'proposal',contributors:{},ready:[],enemyAssignments:null,origins:Object.fromEntries(invited.map(id=>{const player=playerById(state,id);return [id,{q:player.q,r:player.r}];}))};state.phase='team-assault';log(state,`The leader proposed a joint assault on the ${hex.cityColor} city.`);return state;
    }
    case 'RESOLVE_COOPERATIVE_ASSAULT': return resolveCooperativeAssault(state);
    case 'INITIATE_PVP': {
      if(state.player.turnAction)return fail(state,'Only one action may be taken each turn.');
      if(!state.multiplayer||state.scenario==='cooperative-conquest')return fail(state,'PvP is disabled in Cooperative Conquest.');
      const defender=state.players.find(player=>player.id===action.targetId);if(!defender||defender.id===state.player.id)return fail(state,'Choose another player.');
      if(state.roundEndTurnsRemaining!==null||state.scenarioEndTurnsRemaining!==null)return fail(state,'PvP cannot begin after an end-of-round or end-game announcement.');if(defender.roundOrderFaceDown)return fail(state,'That player is protected until their skipped turn.');
      const targetHex=state.map.find(hex=>hex.q===defender.q&&hex.r===defender.r);if(!targetHex||targetHex.revealed===false)return fail(state,'The defender’s space must be revealed.');if(['portal','city'].includes(targetHex.site))return fail(state,'PvP is not allowed on a portal or city space.');const range=distance(state.player,defender);if(range>1)return fail(state,'You must enter the defender’s space to initiate PvP.');
      if(range===1){if(targetHex.enemy)return fail(state,'A hostile enemy prevents entry into that space.');const provoked=provokingEnemies(state,targetHex);if(provoked.length)return fail(state,'You cannot enter for PvP while provoking a rampaging enemy.');const cost=TERRAIN_COST[state.time][targetHex.terrain];if(!Number.isFinite(cost)||state.points.move<cost)return fail(state,`Entering the defender’s space requires ${Number.isFinite(cost)?cost:'legal'} Move.`);state.player.moveHistory.push({q:state.player.q,r:state.player.r});state.points.move-=cost;state.player.q=defender.q;state.player.r=defender.r;if(targetHex.site==='keep'&&targetHex.ownerId===defender.id)state.player.reputation=Math.max(-7,state.player.reputation-1);}
      state.player.turnAction='combat';state.pvp={attackerId:state.player.id,defenderId:defender.id,phase:'attend',attendance:null,currentAttackerId:null,stage:'attend',passes:0,attackPower:0,attackElements:[],blockPower:0,blockTypes:{physical:0,fire:0,ice:0,coldfire:0},damageRemaining:0,prepared:{[state.player.id]:{ranged:state.points.ranged,siege:state.points.siege,attack:state.points.attack,iceAttack:state.points.iceAttack,fireAttack:state.points.fireAttack,block:state.points.block,iceBlock:state.points.iceBlock,fireBlock:state.points.fireBlock},[defender.id]:freshPoints()}};spendCombatPoints(state,['ranged','siege','attack','iceAttack','fireAttack','block','iceBlock','fireBlock']);state.phase='pvp-attend';log(state,`${state.player.name} entered ${defender.name}'s space and initiated PvP.`);return state;
    }
    case 'START_COMBAT': {
      if (state.phase !== 'action') return fail(state, 'Already resolving an action.');if(state.player.turnAction)return fail(state,'Only one action may be taken each turn.');
      const hex=state.map.find(h=>h.q===action.q&&h.r===action.r),identity=state.player.id||state.player.character,rivalKeep=hex?.site==='keep'&&hex.conquered&&hex.ownerId!==identity;
      if(rivalKeep&&state.players?.some(player=>player.id===hex.ownerId&&player.q===hex.q&&player.r===hex.r))return fail(state,'The keep owner is present; initiate PvP instead.');
      let rivalKeepToken=null,combatEnemy=hex?.enemy;if(rivalKeep&&!combatEnemy){const token=state.enemyDecks.grey.shift();if(!token)return fail(state,'No gray garrison token is available.');rivalKeepToken=clone(token);combatEnemy={...clone(token),uid:`rival-keep-${state.turn}-${token.uid||token.id}`,fame:Math.ceil(token.fame/2)};}
      if(!hex||!combatEnemy) return fail(state,'There is no enemy there.');
      if(hex.revealed===false)return fail(state,'That enemy has not been revealed yet.');
      const kind=SITES[hex.site]?.kind;
      if(kind==='adventure' && distance(state.player,hex)!==0)return fail(state,'You must enter an adventure site before exploring it.');
      if(kind!=='adventure' && distance(state.player,hex)!==1)return fail(state,'You must be adjacent to that enemy.');
      let origin={q:state.player.q,r:state.player.r};
      if(kind==='fortified'){
        const entryCost=TERRAIN_COST[state.time][hex.terrain]; if(state.points.move<entryCost)return fail(state,`The assault requires ${entryCost} Move to enter that terrain.`);
        state.points.move-=entryCost;state.player.reputation=Math.max(-7,state.player.reputation-1);
      }
      const defenders=clone(combatEnemy.members||(!rivalKeep&&hex.enemies)||[combatEnemy]).map(enemy=>({...((hex.site==='city')?withCityBonus(enemy,hex.cityColor):enemy),siteFortified:kind==='fortified'}));let enemies=defenders,enemySources=Object.fromEntries(defenders.map(enemy=>[enemyKey(enemy),{q:hex.q,r:hex.r,site:hex.site,siteDefender:true}]));
      if(kind==='fortified'){const mandatory=provokingEnemies(state,hex),eligible=state.map.filter(source=>source.revealed!==false&&source.enemy&&['rampaging','draconum'].includes(source.site)&&distance(source,hex)===1),challengeIds=new Set(action.challengeIds||[]),joined=[...new Map([...mandatory,...eligible.filter(source=>challengeIds.has(enemyKey(source.enemy)))].map(source=>[`${source.q}:${source.r}`,source])).values()];for(const source of joined){const members=clone(source.enemy.members||source.enemies||[source.enemy]).map(enemy=>({...enemy,siteFortified:false}));enemies.push(...members);members.forEach(enemy=>{enemySources[enemyKey(enemy)]={q:source.q,r:source.r,site:source.site,siteDefender:false};});}}
      state.player.turnAction='combat';state.phase='combat-ranged'; state.combat={q:hex.q,r:hex.r,origin,kind,enemy:enemyGroup(enemies),enemies,enemySources,siteDefenderIds:defenders.map(enemy=>enemyKey(enemy)),rivalKeepOwnerId:rivalKeep?hex.ownerId:null,rivalKeepToken,defeatedIds:[],blockedIds:[],blocked:false,woundsTaken:0,damageUnits:[]}; log(state,`Combat begins against ${state.combat.enemy.name}. Ranged/Siege phase.`); return state;
    }
    case 'BURN_MONASTERY': {
      const hex=currentHex(state); if(state.phase!=='action'||hex?.site!=='monastery'||hex.burned)return fail(state,'You must be at an unburned monastery.');if(state.player.turnAction)return fail(state,'Only one action may be taken each turn.');
      const monasteryCard=state.offer.monastery?.shift();if(monasteryCard)state.decks.advanced.push(monasteryCard);
      state.player.reputation=Math.max(-7,state.player.reputation-3); hex.enemy={...clone(ENEMIES.mage),id:'monastery-defender',name:'Monastery Defender',uid:`burn-${state.turn}`};
      state.player.turnAction='combat';state.phase='combat-ranged';state.combat={q:hex.q,r:hex.r,origin:{q:hex.q,r:hex.r},kind:'burn',enemy:clone(hex.enemy),enemies:[clone(hex.enemy)],defeatedIds:[],blockedIds:[],blocked:false,woundsTaken:0,damageUnits:[]};log(state,'You attempt to burn the monastery: Reputation -3.');return state;
    }
    case 'RESOLVE_RANGED': {
      if(state.phase!=='combat-ranged')return fail(state,'Not in the Ranged/Siege phase.');const targets=chosenCombatEnemies(state,action.targetIds);if(!targets.length)return fail(state,'Choose at least one living enemy.');
      const siteFortified=targets.some(enemy=>enemy.siteFortified),tokenFortified=targets.some(enemy=>(enemy.traits||[]).includes('fortified'));
      if(siteFortified&&tokenFortified){if(action.targetIds?.length)return fail(state,'A twice-fortified enemy cannot be targeted in this phase.');return finishRangedPhase(state);}
      let power=siteFortified||tokenFortified?state.points.siege:state.points.siege+state.points.ranged;if(targets.some(enemy=>(enemy.traits||[]).includes('physical-resistant')))power=Math.floor(power/2);
      const required=targets.reduce((sum,enemy)=>sum+enemy.armor,0);if(power<required){if(action.targetIds?.length)return fail(state,`You need ${required} effective Ranged/Siege Attack for that group (currently ${power}).`);return finishRangedPhase(state);}
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
      if(state.phase!=='combat-damage'||!state.combat)return fail(state,'Choose Units while assigning one enemy attack.');const unit=state.player.units.find(item=>item.id===action.id);if(!unit||unit.wounded)return fail(state,'Only an unwounded unit can receive damage.');state.combat.damageUnits=state.combat.damageUnits||[];const index=state.combat.damageUnits.indexOf(unit.id);if(index>=0)state.combat.damageUnits.splice(index,1);else state.combat.damageUnits.push(unit.id);return state;
    }
    case 'RESOLVE_DAMAGE': {
      if(state.phase!=='combat-damage'||!state.combat?.damageQueue?.length)return fail(state,'There is no enemy attack awaiting damage assignment.');const enemy=state.combat.damageQueue.shift();assignCombatDamage(state,enemy);state.combat.damageUnits=[];if(!state.combat.damageQueue.length){discardCombatSummons(state);state.phase='combat-attack';log(state,'All unblocked attacks have been assigned. Melee Attack phase.');}return state;
    }
    case 'SPEND_HEAL': {
      if(state.phase!=='action')return fail(state,'Healing power is spent outside combat.');if(action.unitId){const unit=state.player.units.find(item=>item.id===action.unitId);if(!unit?.wounded)return fail(state,'That unit is not wounded.');const cost=unit.level||1;if(state.points.heal<cost)return fail(state,`Healing that unit requires ${cost} Heal.`);state.points.heal-=cost;unit.wounded=false;unit.woundCount=0;log(state,`${unit.name} was healed.`);return state;}if(state.player.wounds<1)return fail(state,'You have no Wound to heal.');if(state.points.heal<1)return fail(state,'You need 1 Heal.');state.points.heal--;state.player.wounds--;removeWounds(state,1);log(state,'Healed one Hero Wound.');return state;
    }
    case 'RESOLVE_ATTACK': {
      if(state.phase!=='combat-attack')return fail(state,'Not in the Attack phase.');const targets=chosenCombatEnemies(state,action.targetIds);if(!targets.length)return fail(state,'Choose at least one living enemy.');const traits=new Set(targets.flatMap(enemy=>enemy.traits||[]));
      const physical=traits.has('physical-resistant')?Math.floor((state.points.attack+state.points.ranged+state.points.siege)/2):state.points.attack+state.points.ranged+state.points.siege;const ice=traits.has('ice-resistant')?Math.floor(state.points.iceAttack/2):state.points.iceAttack;const fire=traits.has('fire-resistant')?Math.floor(state.points.fireAttack/2):state.points.fireAttack;const effective=physical+ice+fire;const required=targets.reduce((sum,enemy)=>sum+(enemy.traits.includes('elusive')&&!state.combat.blockedIds.includes(enemyKey(enemy))?Math.ceil(enemy.armor*1.5):enemy.armor),0);if(effective<required)return fail(state,`You need ${required} effective Attack to defeat this enemy group (currently ${effective}).`);
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
      if(state.multiplayer){if(state.players.length===1)return nextRound(state);const announcing=state.roundEndTurnsRemaining===null;if(!announcing&&state.player.hand.length)return fail(state,'The round was already announced; play your final turn.');if(announcing)state.roundEndTurnsRemaining=state.players.length-1;return endTurn(state,announcing);}
      return nextRound(state);
    }
    default: return fail(state, 'Unknown action.');
  }
}

function applyTacticOnTake(state,tactic){
  if(tactic.effect==='draw')draw(state,2);
  if(tactic.effect==='prepare'&&state.player.deck.length){state.player.hand.push(state.player.deck.shift());}
}

function activateTactic(state,action){
  const tactic=state.player.tactic||state.tactic;if(!tactic)return fail(state,'You have no tactic this round.');if(state.player.tacticUsed)return fail(state,`${tactic.name} has already been used.`);if(state.phase!=='action')return fail(state,'Use this tactic during your action phase.');
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
  if(skill.id==='double-time'){if(state.phase!=='action')return fail(state,'Double Time is used outside combat.');state.points.move+=state.time==='day'?2:1;return mark();}
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

const combatContribution=effect=>({
  ranged:Number(effect?.ranged||0),siege:Number(effect?.siege||0),
  attack:Number(effect?.attack||0)+Number(effect?.iceAttack||0)+Number(effect?.fireAttack||0)+Number(effect?.anyCombat||0),
  block:Number(effect?.block||0)+Number(effect?.iceBlock||0)+Number(effect?.fireBlock||0),
});

function contributeRemote(state,action){
  const actor=state.players.find(player=>player.id===action.playerId);if(!actor)return fail(state,'Unknown contributor.');
  if(action.type.startsWith('TEAM_')){
    const assault=state.cooperativeAssault;if(state.phase!=='team-assault'||!assault?.invited.includes(actor.id))return fail(state,'You are not invited to this assault.');
    if(action.type==='TEAM_DECLINE'){if(assault.stage!=='proposal'||actor.id===assault.leaderId)return fail(state,'Only an invited player may decline the proposal.');state.cooperativeAssault=null;state.phase='action';bindPlayerState(state,state.activePlayerId);log(state,`${actor.name} declined the joint assault; no costs were paid.`);return state;}
    if(action.type==='TEAM_ACCEPT'){
      if(assault.stage!=='proposal'||assault.accepted.includes(actor.id))return fail(state,'That assault invitation is not awaiting acceptance.');assault.accepted.push(actor.id);
      if(assault.accepted.length===assault.invited.length){const hex=state.map.find(item=>item.q===assault.q&&item.r===assault.r),cost=TERRAIN_COST[state.time][hex.terrain];bindPlayerState(state,assault.leaderId);if(state.points.move<cost){state.cooperativeAssault=null;state.phase='action';return fail(state,`The leader no longer has the ${cost} Move required to enter the city.`);}state.points.move-=cost;const defenders=shuffled(clone(hex.enemy.members||hex.enemies||[hex.enemy]),state.seed+state.turn*101+hex.q*17+hex.r*31);let cursor=0;assault.enemyAssignments={};for(const id of assault.participantOrder){assault.enemyAssignments[id]=defenders.slice(cursor,cursor+assault.assignments[id]);cursor+=assault.assignments[id];}for(const id of assault.invited){const participant=playerById(state,id);participant.reputation=Math.max(-7,participant.reputation-1);if(id!==assault.leaderId){participant.skipNextTurn=true;participant.roundOrderFaceDown=true;}}assault.contributors={[assault.leaderId]:{attack:state.points.attack+state.points.iceAttack+state.points.fireAttack,ranged:state.points.ranged,siege:state.points.siege,block:state.points.block+state.points.iceBlock+state.points.fireBlock}};assault.stage='contribute';state.player.turnAction='combat';log(state,'Every invited player accepted. Defenders were assigned secretly and the assault begins.');}
      bindPlayerState(state,state.activePlayerId);return state;
    }
    if(action.type!=='TEAM_CONTRIBUTE'||assault.stage!=='contribute')return fail(state,'Wait until every invited player accepts the proposal.');
    if(action.ready){if(!assault.ready.includes(actor.id))assault.ready.push(actor.id);bindPlayerState(state,state.activePlayerId);return state;}
    if(assault.ready.includes(actor.id))return fail(state,'Your contribution is already locked.');bindPlayerState(state,actor.id);const index=actor.hand.findIndex(card=>card.uid===action.uid);if(index<0||actor.hand[index].id==='wound')return fail(state,'That support card is unavailable.');
    const card=actor.hand[index],effect=action.mode==='sideways'?{attack:1}:card.basic;const contribution=combatContribution(effect);assault.contributors[actor.id]=Object.fromEntries(Object.entries(assault.contributors[actor.id]||combatContribution({})).map(([key,value])=>[key,value+contribution[key]]));actor.played.push(actor.hand.splice(index,1)[0]);actor.cardsPlayedThisTurn++;log(state,`${actor.name} contributed ${card.name} to the city assault.`);bindPlayerState(state,state.activePlayerId);return state;
  }
  const pvp=state.pvp;if(!pvp||![pvp.attackerId,pvp.defenderId].includes(actor.id))return fail(state,'You are not a participant in this PvP combat.');
  if(action.type==='PVP_ATTEND'){
    if(actor.id!==pvp.defenderId)return fail(state,'Only the defender chooses attendance.');if(state.phase!=='pvp-attend'||pvp.attendance)return fail(state,'The defender has already chosen how to attend.');if(!['full','partial'].includes(action.mode))return fail(state,'Choose full or partial attendance.');if(action.mode==='full'&&!actor.hand.some(card=>card.id!=='wound'))return fail(state,'Full attendance requires at least one non-Wound card in hand.');
    pvp.attendance=action.mode;if(action.mode==='full'){actor.skipNextTurn=true;actor.roundOrderFaceDown=true;const hex=state.map.find(item=>item.q===actor.q&&item.r===actor.r);pvp.defenderMana=hex?.site==='glade'?[state.time==='day'?'gold':'black']:[];}pvp.phase='ranged';pvp.stage='attack';pvp.currentAttackerId=pvp.defenderId;state.phase='pvp-ranged';bindPlayerState(state,state.activePlayerId);log(state,`${actor.name} will ${action.mode==='full'?'fully attend and skip their next turn':'partially attend without skipping a turn'}. Ranged combat starts with the defender.`);return state;
  }
  if(!pvp.attendance)return fail(state,'The defender must choose full or partial attendance first.');
  return resolvePvpAction(state,action,actor);
}

function resolveCooperativeAssault(state){
  const assault=state.cooperativeAssault;if(state.phase!=='team-assault'||!assault)return fail(state,'No joint assault is in progress.');
  if(assault.leaderId!==state.player.id)return fail(state,'Only the assault leader resolves the battle.');
  if(assault.stage!=='contribute'||assault.ready.length<assault.invited.length)return fail(state,'Every invited player must accept, contribute, and mark ready.');
  const hex=state.map.find(item=>item.q===assault.q&&item.r===assault.r),victories={};hex.cityShields=hex.cityShields||{};hex.cityShieldOrder=hex.cityShieldOrder||[];
  for(const id of assault.participantOrder){const player=playerById(state,id),pool=assault.contributors[id]||combatContribution({}),members=(assault.enemyAssignments[id]||[]).map(member=>withCityBonus(member,hex.cityColor)),enemy=enemyGroup(members),ranged=pool.siege+(!enemy.traits.includes('fortified')?pool.ranged:0);let won=ranged>=enemy.armor;if(!won){if(pool.block<enemy.attack){bindPlayerState(state,id);wound(state,Math.max(1,Math.ceil(enemy.attack/player.armor)));}won=pool.attack>=enemy.armor;}victories[id]=won;if(won){for(const member of members){hex.cityShields[id]=(hex.cityShields[id]||0)+1;hex.cityShieldOrder.push(id);bindPlayerState(state,id);gainFame(state,member.fame);}}}
  const participants=assault.invited.map(id=>playerById(state,id)),won=Object.values(victories).every(Boolean);if(!won){for(const player of participants)Object.assign(player,assault.origins[player.id]);bindPlayerState(state,assault.leaderId);state.phase='action';state.cooperativeAssault=null;log(state,'At least one assigned battle was lost; every participant withdrew from the city.');return state;}
  const best=Math.max(...Object.values(hex.cityShields)),leaders=Object.keys(hex.cityShields).filter(id=>hex.cityShields[id]===best);hex.enemy=null;hex.enemies=[];hex.conquered=true;hex.ownerId=hex.cityShieldOrder.find(id=>leaders.includes(id))||leaders[0];hex.conquerors=Object.keys(hex.cityShields);participants.forEach(player=>{player.assaults=(player.assaults||0)+1;player.q=hex.q;player.r=hex.r;});const cityLeader=playerById(state,hex.ownerId);if(cityLeader)cityLeader.cities=(cityLeader.cities||0)+1;bindPlayerState(state,assault.leaderId);state.phase='action';state.cooperativeAssault=null;log(state,`Every assigned battle was won; ${cityLeader?.name||'the leading conqueror'} controls the ${hex.cityColor} city.`);checkVictory(state);return state;
}

const pvpOpponentId=(pvp,id)=>id===pvp.attackerId?pvp.defenderId:pvp.attackerId;
const pvpCardPower=(effect,phase,role,effectAs)=>{const flexible=effectAs?{[effectAs]:Number(effect.any||effect.anyCombat||0)}:{};const value={...effect,...flexible};if(role==='block'){const blocks={physical:Number(value.block||0),fire:Number(value.fireBlock||0),ice:Number(value.iceBlock||0),coldfire:Number(value.coldfireBlock||0)};return {power:Object.values(blocks).reduce((sum,amount)=>sum+amount,0),elements:[],blocks};}if(phase==='ranged')return {power:Number(value.ranged||0)+Number(value.siege||0),elements:['physical']};const elements=[];if(value.attack||value.ranged||value.siege)elements.push('physical');if(value.fireAttack)elements.push('fire');if(value.iceAttack)elements.push('ice');return {power:Number(value.attack||0)+Number(value.ranged||0)+Number(value.siege||0)+Number(value.fireAttack||0)+Number(value.iceAttack||0),elements};};
const pvpRetreatHexes=(state,playerId)=>{const player=playerById(state,playerId);return state.map.filter(hex=>hex.revealed!==false&&distance(player,hex)===1&&!hex.enemy&&Number.isFinite(TERRAIN_COST[state.time][hex.terrain])&&!state.players.some(other=>other.id!==playerId&&other.q===hex.q&&other.r===hex.r));};

function resetPvpExchange(state,nextAttackerId){const pvp=state.pvp;pvp.currentAttackerId=nextAttackerId;pvp.stage='attack';pvp.attackPower=0;pvp.attackElements=[];pvp.blockPower=0;pvp.blockTypes={physical:0,fire:0,ice:0,coldfire:0};pvp.damageRemaining=0;pvp.passes=0;}
function finishPvpAttack(state){const pvp=state.pvp,previous=pvp.currentAttackerId;resetPvpExchange(state,pvpOpponentId(pvp,previous));log(state,`${playerById(state,previous).name}'s PvP attack is complete; roles switch.`);return state;}

function finishPvpCombat(state,retreatingId,winnerId=null){
  const pvp=state.pvp,retreating=playerById(state,retreatingId),winner=winnerId&&playerById(state,winnerId);if(winner){const fame=(retreating.fame>winner.fame?1:0)+Math.max(0,retreating.level-winner.level)*2;bindPlayerState(state,winner.id);if(fame)gainFame(state,fame);winner.pvpWins=(winner.pvpWins||0)+1;}
  finishPvpReaction(state,pvp);bindPlayerState(state,pvp.attackerId);state.pvp=null;state.phase='action';log(state,winner?`${winner.name} forced ${retreating.name} to withdraw from PvP.`:`${retreating.name} withdrew after both players passed.`);return state;
}

function resolvePvpAction(state,action,actor){
  const pvp=state.pvp,opponentId=pvpOpponentId(pvp,actor.id),role=actor.id===pvp.currentAttackerId?'attack':'block';
  if(action.type==='PVP_PLAY_CARD'){
    if(pvp.stage!==role)return fail(state,`It is not your turn to ${role}.`);bindPlayerState(state,actor.id);const index=actor.hand.findIndex(card=>card.uid===action.uid&&card.id!=='wound');if(index<0)return fail(state,'That PvP card is unavailable.');const card=actor.hand[index],effect=action.mode==='sideways'?{[role==='attack'?'attack':'block']:1}:card.basic||{},part=pvpCardPower(effect,pvp.phase,role,action.effectAs);if(part.power<=0)return fail(state,`That card provides no usable ${role} power in this phase.`);if(role==='attack'&&pvp.phase==='ranged'&&action.mode==='sideways')return fail(state,'Cards cannot be played sideways for a ranged PvP attack.');if(role==='attack'){pvp.attackPower+=part.power;pvp.attackElements=[...new Set([...pvp.attackElements,...part.elements])];}else{pvp.blockPower+=part.power;Object.entries(part.blocks).forEach(([element,amount])=>{pvp.blockTypes[element]+=amount;});}actor.played.push(actor.hand.splice(index,1)[0]);actor.cardsPlayedThisTurn++;bindPlayerState(state,state.activePlayerId);log(state,`${actor.name} committed a hidden card to the PvP ${role}.`);return state;
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
  if(action.type==='PVP_FORCE_RETREAT'){if(role!=='attack'||pvp.stage!=='damage'||pvp.phase!=='melee')return fail(state,'Retreat may be forced only with remaining melee damage.');const target=playerById(state,opponentId),hex=pvpRetreatHexes(state,target.id).find(item=>item.q===action.q&&item.r===action.r);if(!hex)return fail(state,'Choose a safe adjacent withdrawal space.');const cost=TERRAIN_COST[state.time][hex.terrain];if(pvp.damageRemaining<cost)return fail(state,`${cost} melee damage is needed to force that withdrawal.`);target.q=hex.q;target.r=hex.r;return finishPvpCombat(state,target.id,actor.id);}
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
    if(!state.enemyDecks.brown.length&&state.enemyDiscards.brown.length){state.enemyDecks.brown=shuffled(state.enemyDiscards.brown.splice(0),state.seed+state.turn*83);}
    const summoned=state.enemyDecks.brown.shift()||clone(ENEMIES.den);const token={...clone(summoned),uid:`summon-${state.turn}-${enemyKey(enemy)}-${summoned.uid||summoned.id}`,summonerId:enemyKey(enemy)};log(state,`${enemy.name} summoned ${token.name} for the Block and Damage phases.`);return token;
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

function leaveCombatWithSurvivors(state){
  const combat=state.combat,hex=state.map.find(item=>item.q===combat.q&&item.r===combat.r),survivors=livingCombatEnemies(state),defeated=(combat.enemies||[]).filter(enemy=>(combat.defeatedIds||[]).includes(enemyKey(enemy)));
  if(defeated.length){const group=enemyGroup(defeated);gainFame(state,group.fame);state.player.defeated=(state.player.defeated||[]).concat(defeated.map(enemy=>({id:enemy.id,name:enemy.name,fame:enemy.fame})));}
  if(combat.kind==='provoked'){const coordinates=new Set(Object.values(combat.enemySources||{}).map(source=>`${source.q}:${source.r}`));for(const coordinate of coordinates){const [q,r]=coordinate.split(':').map(Number),sourceHex=state.map.find(item=>item.q===q&&item.r===r),remaining=survivors.filter(enemy=>{const source=combat.enemySources[enemyKey(enemy)];return source?.q===q&&source?.r===r;});if(sourceHex){sourceHex.enemies=clone(remaining);sourceHex.enemy=remaining.length?enemyGroup(remaining):null;}}for(const enemy of defeated){const site=combat.enemySources?.[enemyKey(enemy)]?.site;if(site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);if(site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);}}
  else if(combat.kind==='fortified'&&combat.enemySources){const coordinates=new Set(Object.values(combat.enemySources).map(source=>`${source.q}:${source.r}`));for(const coordinate of coordinates){const [q,r]=coordinate.split(':').map(Number),sourceHex=state.map.find(item=>item.q===q&&item.r===r),remaining=survivors.filter(enemy=>{const source=combat.enemySources[enemyKey(enemy)];return source?.q===q&&source?.r===r;});if(sourceHex){sourceHex.enemies=clone(remaining);sourceHex.enemy=remaining.length?enemyGroup(remaining):null;}}for(const enemy of defeated){const source=combat.enemySources[enemyKey(enemy)];if(!source?.siteDefender&&source?.site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);if(!source?.siteDefender&&source?.site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);}const livingSiteDefenders=survivors.filter(enemy=>combat.enemySources[enemyKey(enemy)]?.siteDefender);if(!livingSiteDefenders.length)conquerFortifiedSite(state,hex,combat.rivalKeepOwnerId);if(combat.rivalKeepOwnerId){hex.enemy=null;hex.enemies=[];returnRivalKeepToken(state);}}
  else if(hex){const discardSurvivors=combat.kind==='burn'||['dungeon','tomb'].includes(hex.site);hex.enemies=discardSurvivors?[]:clone(survivors);hex.enemy=discardSurvivors||!survivors.length?null:enemyGroup(survivors);if(combat.kind==='burn'){hex.burned=true;hex.conquered=false;}}
  state.phase='action';state.combat=null;log(state,defeated.length?`${defeated.length} defender${defeated.length===1?'':'s'} defeated; the site was not conquered.`:'Combat ended without defeating a defender.');return state;
}

function assignCombatDamage(state,enemy){
  const attackers=enemy.members||[enemy];let damage=attackers.reduce((sum,item)=>sum+item.attack*(item.traits.includes('brutal')?2:1),0);const attackType=enemy.traits.includes('coldfire')?'coldfire':enemy.traits.includes('fire')?'fire':enemy.traits.includes('ice')?'ice':'physical';
  for(const id of state.combat.damageUnits||[]){const unit=state.player.units.find(item=>item.id===id);if(!unit||unit.wounded||damage<=0)continue;const resistant=(unit.resistances||[]).includes(attackType);if(resistant){damage=Math.max(0,damage-unit.armor);if(damage<=0)continue;}if(enemy.traits.includes('paralyze')){if(unit.banner)state.player.discard.push(unit.banner);state.player.units=state.player.units.filter(item=>item.id!==unit.id);log(state,`${unit.name} was destroyed by Paralyze.`);}else{unit.wounded=true;unit.woundCount=enemy.traits.includes('poison')?2:1;log(state,`${unit.name} received ${unit.woundCount} Wound${unit.woundCount===1?'':'s'}.`);}damage=Math.max(0,damage-unit.armor);}
  let wounds=damage>0?Math.ceil(damage/state.player.armor):0;if(enemy.traits.includes('poison')&&wounds){for(let i=0;i<wounds;i++)state.player.discard.push({id:'wound',uid:`poison-${state.turn}-${i}`,name:'Wound',color:'wound',basic:{},strong:{}});state.player.wounds+=wounds;}if(wounds)wound(state,wounds);state.combat.woundsTaken=(state.combat.woundsTaken||0)+wounds;if(enemy.traits.includes('paralyze')&&wounds){state.player.hand.filter(card=>card.id!=='wound').forEach(card=>state.player.discard.push(card));state.player.hand=state.player.hand.filter(card=>card.id==='wound');}if(state.combat.woundsTaken>=baseHandLimit(state.player)){state.player.hand.filter(card=>card.id!=='wound').forEach(card=>state.player.discard.push(card));state.player.hand=state.player.hand.filter(card=>card.id==='wound');log(state,'The Mage Knight was knocked out.');}log(state,damage>0?`Unblocked attack assigned ${damage} remaining damage to the Hero.`:'Units absorbed all damage.');
}

function checkVictory(state){
  const cities=state.map.filter(item=>item.site==='city'),conquered=cities.filter(item=>item.conquered).length;const needed=state.scenario==='cooperative-conquest'?cities.length:Math.min(cities.length,state.multiplayer?Math.max(2,state.players.length):2);
  if(cities.length&&conquered>=needed){if(state.multiplayer){if(state.scenarioEndTurnsRemaining===null){state.scenarioEndTurnsRemaining=state.players.length;log(state,`${conquered} cities have fallen. Every player receives a final turn.`);}}else{state.status='won';state.scoring=calculateScore(state);log(state,`${conquered} cities have fallen. The conquest is complete!`);}return true;}return false;
}

function winCombat(state, phase) {
  const {q,r,enemy,kind}=state.combat;if(kind==='provoked'){for(const source of Object.values(state.combat.enemySources||{})){const sourceHex=state.map.find(h=>h.q===source.q&&h.r===source.r);if(sourceHex){sourceHex.enemy=null;sourceHex.enemies=[];}}for(const member of enemy.members||[enemy]){const site=state.combat.enemySources?.[enemyKey(member)]?.site;if(site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);if(site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);}gainFame(state,enemy.fame);state.player.defeated=(state.player.defeated||[]).concat((enemy.members||[enemy]).map(item=>({id:item.id,name:item.name,fame:item.fame})));state.phase='action';state.combat=null;log(state,`${enemy.name} defeated in the ${phase} phase for ${enemy.fame} Fame.`);return state;}const hex=state.map.find(h=>h.q===q&&h.r===r);if(kind==='fortified'&&state.combat.enemySources){for(const source of Object.values(state.combat.enemySources)){const sourceHex=state.map.find(h=>h.q===source.q&&h.r===source.r);if(sourceHex){sourceHex.enemy=null;sourceHex.enemies=[];}}for(const member of enemy.members||[enemy]){const source=state.combat.enemySources[enemyKey(member)];if(!source?.siteDefender&&source?.site==='rampaging')state.player.reputation=Math.min(5,state.player.reputation+1);if(!source?.siteDefender&&source?.site==='draconum')state.player.reputation=Math.min(5,state.player.reputation+2);}gainFame(state,enemy.fame);state.player.defeated=(state.player.defeated||[]).concat((enemy.members||[enemy]).map(item=>({id:item.id,name:item.name,fame:item.fame})));conquerFortifiedSite(state,hex,state.combat.rivalKeepOwnerId);returnRivalKeepToken(state);state.phase='action';state.combat=null;log(state,`${enemy.name} defeated in the ${phase} phase for ${enemy.fame} Fame.`);return state;}hex.enemy=null;
  hex.enemies=[];gainFame(state,enemy.fame);state.player.defeated=(state.player.defeated||[]).concat((enemy.members||[enemy]).map(item=>({id:item.id,name:item.name,fame:item.fame}))); state.phase='action'; state.combat=null;
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
  const reward=state.pendingRewards[0];if(!reward)return fail(state,'There is no pending reward.');if(reward.type==='artifact'&&!reward.options){const count=reward.count||1;reward.options=state.decks.artifacts.splice(0,Math.min(state.decks.artifacts.length,count+1));log(state,`Revealed ${reward.options.length} Artifact choices.`);}if(reward.type==='crystals'&&!reward.rolls){const faces=[...COLORS,'gold','black'];reward.rolls=Array.from({length:reward.count||1},(_,index)=>faces[(state.seed+state.turn*17+state.round*31+index*7)%faces.length]);log(state,`Rolled crystal rewards: ${reward.rolls.join(', ')}.`);}return state;
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
  const identity=state.player.id||state.player.character,city=hex.site==='city'&&hex.conquered;const ownedSite=(hex.site==='mage-tower'&&hex.conquered)||(hex.site==='keep'&&hex.conquered&&hex.ownerId===identity);
  if(['keep','mage-tower','city'].includes(hex.site)&&!ownedSite&&!city)return fail(state,'This fortified site must be conquered before interaction.');
  if(action.kind==='heal') { const count=action.count||1; if(!['village','monastery'].includes(hex.site))return fail(state,'Healing is not offered here.');const each=hex.site==='monastery'?2:3;const price=count*each;if(state.points.influence<price)return fail(state,`You need ${price} Influence.`); if(state.player.wounds<count)return fail(state,'Not enough Wounds to heal.'); state.points.influence-=price; state.player.wounds-=count;removeWounds(state,count);log(state,`Healed ${count} Wound${count===1?'':'s'}.`); return state; }
  if(action.kind==='recruit') { const unit=state.offer.units.find(u=>u.id===action.id); if(!unit)return fail(state,'That unit is not in the offer.');const allowed=(city&&hex.cityColor==='white')||unit.sites.includes(hex.site)||(city&&unit.sites.includes('city'));if(!allowed)return fail(state,`${unit.name} cannot be recruited here.`); if(state.player.units.length>=state.player.command)return fail(state,'All command slots are full.'); const modifier=reputationInfluence(state.player.reputation); const cost=Math.max(0,unit.cost-modifier); if(state.points.influence<cost)return fail(state,`You need ${cost} Influence after reputation.`); state.points.influence-=cost; state.player.units.push({...unit,spent:false,wounded:false,woundCount:0}); state.offer.units=state.offer.units.filter(u=>u.id!==unit.id); log(state,`Recruited ${unit.name}.`); return state; }
  if(action.kind==='plunder') { if(hex.site!=='village')return fail(state,'Only villages may be plundered.');if(!state.player.atTurnStart)return fail(state,'A village may be plundered only before starting your turn.');state.player.reputation=Math.max(-7,state.player.reputation-1);draw(state,2);state.player.atTurnStart=false;log(state,'Plundered the village before the turn: drew two cards and lost 1 Reputation.');return state; }
  if(action.kind==='altar'){if(hex.site!=='ruins'||hex.ruinsToken?.type!=='altar'||hex.used)return fail(state,'There is no unused altar here.');if(!spendMana(state,hex.ruinsToken.color))return fail(state,`The altar requires ${hex.ruinsToken.color} mana.`);gainFame(state,hex.ruinsToken.fame);hex.used=true;log(state,`The ${hex.ruinsToken.color} altar granted ${hex.ruinsToken.fame} Fame.`);return state;}
  if(action.kind==='learn-advanced') {if(!(hex.site==='monastery'||(city&&hex.cityColor==='green')))return fail(state,'Advanced Actions are not taught here.');if(state.points.influence<6)return fail(state,'You need 6 Influence.');const source=hex.site==='monastery'?state.offer.monastery:state.offer.advanced;const card=source.find(c=>c.id===action.id)||source[0];if(!card)return fail(state,'No Advanced Action is available.');state.points.influence-=6;state.player.deck.unshift(cardWithUid(card,state));if(hex.site==='monastery')state.offer.monastery=state.offer.monastery.filter(c=>c.id!==card.id);else{state.offer.advanced=state.offer.advanced.filter(c=>c.id!==card.id);if(state.decks.advanced.length)state.offer.advanced.push(state.decks.advanced.shift());}log(state,`Learned ${card.name}.`);return state;}
  if(action.kind==='learn-spell') {if(!(hex.site==='mage-tower'||(city&&hex.cityColor==='blue')))return fail(state,'Spells are not taught here.');const card=state.offer.spells.find(c=>c.id===action.id);if(!card)return fail(state,'That Spell is not available.');if(state.points.influence<7)return fail(state,'You need 7 Influence.');if(!spendMana(state,card.color))return fail(state,`You also need ${card.color} mana.`);state.points.influence-=7;state.player.deck.unshift(cardWithUid(card,state));state.offer.spells=state.offer.spells.filter(c=>c.id!==card.id);if(state.decks.spells.length)state.offer.spells.push(state.decks.spells.shift());log(state,`Learned ${card.name}.`);return state;}
  if(action.kind==='buy-artifact') {if(!(city&&hex.cityColor==='red'))return fail(state,'Artifacts are sold only in a conquered Red city.');if(state.points.influence<12)return fail(state,'You need 12 Influence.');state.points.influence-=12;state.pendingRewards.push({type:'artifact',source:'Red City'});log(state,'Purchased an Artifact reward.');return state;}
  if(action.kind==='add-elite') {if(!(city&&hex.cityColor==='white'))return fail(state,'Elite Units are added only in a conquered White city.');if(state.points.influence<2)return fail(state,'You need 2 Influence.');state.points.influence-=2;const elite=UNITS.find(u=>u.elite&&!state.offer.units.some(x=>x.id===u.id));if(elite)state.offer.units.push(clone(elite));log(state,'Added an Elite Unit to the offer.');return state;}
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
  state.player.discard.push(...state.player.played); state.player.played=[];state.player.cardsPlayedThisTurn=0;state.player.atTurnStart=false;state.player.emptyHandPassAllowed=false;state.player.movedThisTurn=false;state.player.moveHistory=[];state.player.turnAction=null; state.points=freshPoints();if(carry)Object.entries(carry).forEach(([key,value])=>state.points[key]+=value); state.mana=[]; state.sourceTaken=false;state.bonuses.sideways=null;state.bonuses.manaOverload=null;
  state.player.skills.forEach(s=>s.used=false); const target=handLimit(state); if(!roundAnnouncement&&state.player.hand.length<target)draw(state,target-state.player.hand.length);
  if(!roundAnnouncement&&hex?.site==='glade')state.mana.push(state.time==='day'?'gold':'black');
  state.turn++;
  if(state.multiplayer){
    if(state.scenarioEndTurnsRemaining!==null){state.scenarioEndTurnsRemaining--;if(state.scenarioEndTurnsRemaining<=0){state.status='won';state.scoring=calculateScore(state);log(state,'Final turns are complete. The conquest has ended.');return state;}}
    if(immediateExtraTurn){state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);log(state,`${state.player.name} takes the extra turn granted by ${state.player.tactic?.name}.`);return state;}
    if(state.roundEndTurnsRemaining!==null&&!roundAnnouncement){state.roundEndTurnsRemaining--;if(state.roundEndTurnsRemaining<=0)return nextRound(state);}
    const currentIndex=state.turnOrder.indexOf(state.activePlayerId);let nextIndex=(currentIndex+1)%state.turnOrder.length,nextPlayer=playerById(state,state.turnOrder[nextIndex]),guard=0;while(nextPlayer?.skipNextTurn&&guard<state.players.length){nextPlayer.skipNextTurn=false;nextPlayer.roundOrderFaceDown=false;log(state,`${nextPlayer.name} skips the turn already spent fully attending PvP.`);nextIndex=(nextIndex+1)%state.turnOrder.length;nextPlayer=playerById(state,state.turnOrder[nextIndex]);guard++;}state.activePlayerId=state.turnOrder[nextIndex];bindPlayerState(state,state.activePlayerId);state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);state.points=freshPoints();state.mana=[];state.sourceTaken=false;state.bonuses.sideways=null;state.bonuses.manaOverload=null;log(state,`${state.player.name}'s turn begins.`);return state;
  }
  state.player.atTurnStart=true;state.player.emptyHandPassAllowed=!state.player.hand.length&&Boolean(state.player.deck.length);log(state,`Turn ${state.turn} begins.`); return state;
}

function refreshOffers(state){
  if(state.offer.advanced.length)state.decks.advanced.push(state.offer.advanced.shift());if(state.decks.advanced.length)state.offer.advanced.push(state.decks.advanced.shift());if(state.offer.spells.length)state.decks.spells.push(state.offer.spells.shift());if(state.decks.spells.length)state.offer.spells.push(state.decks.spells.shift());
  state.offer.units.forEach(unit=>state.decks[unit.elite?'eliteUnits':'regularUnits'].push(unit));state.offer.units=[];const count=(state.multiplayer?state.players.length:1)+2,coreRevealed=state.map.some(hex=>hex.core&&hex.revealed!==false);for(let index=0;index<count;index++){const primary=coreRevealed&&index%2===0?'eliteUnits':'regularUnits',secondary=primary==='eliteUnits'?'regularUnits':'eliteUnits';const unit=state.decks[primary].shift()||state.decks[secondary].shift();if(unit)state.offer.units.push(unit);}
  (state.offer.monastery||[]).forEach(card=>state.decks.advanced.push(card));state.offer.monastery=[];const monasteries=state.map.filter(hex=>hex.revealed!==false&&hex.site==='monastery'&&!hex.burned).length;for(let index=0;index<monasteries&&state.decks.advanced.length;index++)state.offer.monastery.push(state.decks.advanced.shift());
}

function nextRound(state) {
  if(state.round>=(state.maxRounds||6)){state.status='lost';state.scoring=calculateScore(state);log(state,'The final Night ends before the cities are conquered. Final scoring is complete.');return state;}
  state.round++; state.time=state.time==='day'?'night':'day';refreshOffers(state);
  if(state.multiplayer){
    state.players.forEach((player,index)=>{bindPlayerState(state,player.id);player.deck=shuffled([...player.discard,...player.hand],state.seed+state.round+index*997);player.hand=[];player.discard=[];player.tactic=null;player.tacticUsed=false;player.cardsPlayedThisTurn=0;player.atTurnStart=false;player.emptyHandPassAllowed=false;player.movedThisTurn=false;player.moveHistory=[];player.turnAction=null;draw(state,handLimit(state));player.units.forEach(unit=>{unit.spent=false;if(unit.banner)unit.banner.used=false;});player.skills.forEach(skill=>{skill.used=false;skill.roundUsed=false;});});
    state.tacticSelections={};state.turnOrder=[];state.activePlayerId=null;state.roundEndTurnsRemaining=null;state.tacticPickOrder=[...state.players].sort((a,b)=>a.fame-b.fame||state.players.indexOf(a)-state.players.indexOf(b)).map(player=>player.id);state.tacticPickerId=state.tacticPickOrder[0];bindPlayerState(state,state.players[0].id);
  } else {state.player.deck=shuffled([...state.player.discard,...state.player.hand],state.seed+state.round);state.player.hand=[];state.player.discard=[];state.player.tactic=null;state.player.tacticUsed=false;state.player.cardsPlayedThisTurn=0;state.player.atTurnStart=!state.tacticsEnabled;state.player.emptyHandPassAllowed=false;state.player.movedThisTurn=false;state.player.moveHistory=[];state.player.turnAction=null;draw(state,handLimit(state));state.player.units.forEach(unit=>{unit.spent=false;if(unit.banner)unit.banner.used=false;});state.player.skills.forEach(s=>{s.used=false;s.roundUsed=false;});}
  state.map.forEach(h=>h.used=false);const sourceCount=(state.multiplayer?state.players.length:1)+2;state.source=shuffled([...COLORS,state.time==='day'?'gold':'black',...COLORS],state.seed+state.round).slice(0,sourceCount).map((color,i)=>({id:`die-${i}`,color})); state.points=freshPoints();state.turn++;state.mana=[];state.sourceTaken=false;state.tactic=null;if(state.tacticsEnabled)state.phase='tactic';
  log(state,`${state.time==='day'?'Day':'Night'} ${Math.ceil(state.round/2)} begins.`); return state;
}

export const rulesSummary = [
  ['Turn', 'Play cards for their basic action, power one with matching mana, or play any non-Wound card sideways for Move, Influence, Attack, or Block 1. Use at most one Source die.'],
  ['Movement', 'Pay the destination terrain cost. Forest costs 3 by day/5 by night; desert 5 by day/3 by night. Lakes and mountains are impassable.'],
  ['Combat', 'Resolve Ranged/Siege, Block, then Attack. Fortified enemies require Siege in the first phase. Swift doubles block needed; Brutal doubles unblocked damage; physical resistance doubles physical armor.'],
  ['Sites', 'Recruit and heal at inhabited sites, gain crystals at mines, heal at glades, and assault fortified sites for Move 2 and Reputation −1.'],
  ['Rounds', 'At the start of each multiplayer round, every player takes a unique Day or Night tactic; its number sets turn order. When a deck is exhausted, the round may be announced and every other player receives one last turn.'],
  ['Exploration', 'Spend 2 Move while adjacent to an unrevealed tile. Countryside tiles must be revealed before core tiles. Revealed enemies and sites immediately become part of the shared map.'],
  ['Cooperation', 'In Cooperative Conquest, adjacent Mage Knights can contribute cards to one joint city assault. Every participant must mark ready before the leader resolves it.'],
  ['PvP', 'Outside Cooperative Conquest, adjacent players may fight through ranged and melee phases. The defender commits cards privately, then marks ready for each phase.'],
  ['Scoring', 'Final score combines Fame with knowledge, artifacts, unit leadership, conquest, adventures and PvP; two points are deducted per Wound.'],
];
