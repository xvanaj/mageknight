/* Data used by the deterministic base-game rules mode.  Names and values are
 * kept separate from the reducer so new sets can be added without networking
 * changes. */

const skill = (id, name, effect, value, cadence = 'turn') => ({ id, name, effect, value, cadence, description: `${name}: ${effect} ${value}.` });

export const CHARACTER_PROFILES = {
  tovak: {
    name: 'Tovak', armor: 2,
    replacements: [],
    skills: [skill('tovak-attack','Cold Swordsmanship','iceAttack',2),skill('tovak-block','Shield Mastery','block',3),skill('tovak-move','Double Time','move',2),skill('tovak-range','Night Sharpshooting','ranged',2),skill('tovak-heal','I Feel No Pain','heal',1),skill('tovak-influence','Who Needs Magic?','influence',3),skill('tovak-resist','Resistance Break','armorBreak',1),skill('tovak-motivation','Motivation','draw',2,'round'),skill('tovak-mana','Mana Overload','mana',1,'round'),skill('tovak-versatile','Battle Mastery','anyCombat',2)],
  },
  arythea: {
    name: 'Arythea', armor: 2,
    replacements: [['rage','blood-ritual','Blood Ritual','red',{attack:3},{attack:6,woundCost:1}],['tranquility','dark-paths','Dark Paths','green',{move:2},{move:5,reputation:-1}]],
    skills: [skill('arythea-blood','Blood Rage','attack',3),skill('arythea-fire','Fire Mastery','fireAttack',2),skill('arythea-dark','Dark Paths','move',3),skill('arythea-pain','Power of Pain','anyCombat',2),skill('arythea-charm','Dark Negotiation','influence',3),skill('arythea-heal','Regeneration','heal',1),skill('arythea-ritual','Blood Ritual','draw',2,'round'),skill('arythea-mana','Red Crystal Craft','redCrystal',1,'round'),skill('arythea-resist','Fire Resistance','fireBlock',3),skill('arythea-fury','Fury','siege',2)],
  },
  goldyx: {
    name: 'Goldyx', armor: 2,
    replacements: [['crystallize','crystal-joy','Crystal Joy','blue',{mana:'crystal'},{mana:'crystal',draw:2}],['rage','will-focus','Will Focus','red',{any:1},{any:4}]],
    skills: [skill('goldyx-blue','Blue Crystal Craft','blueCrystal',1),skill('goldyx-green','Green Crystal Craft','greenCrystal',1),skill('goldyx-flight','Freezing Flight','move',3),skill('goldyx-breath','Draconum Breath','fireAttack',3),skill('goldyx-focus','Will Focus','any',2),skill('goldyx-source','Source Opening','mana',1),skill('goldyx-rest','Meditation','draw',2,'round'),skill('goldyx-block','Scaled Armor','block',3),skill('goldyx-range','Arcane Bolt','ranged',2),skill('goldyx-hoard','Crystal Hoard','influence',3)],
  },
  norowas: {
    name: 'Norowas', armor: 2,
    replacements: [['promise','noble-manners-norowas','Noble Manners','white',{influence:3},{influence:5,fame:1}],['rage','refreshing-walk','Refreshing Walk','green',{move:2},{move:4,heal:1}]],
    skills: [skill('norowas-lead','Leadership','unitReady',1),skill('norowas-recruit','Recruiting','influence',3),skill('norowas-forest','Forest Paths','move',3),skill('norowas-bond','Unit Bond','anyCombat',3),skill('norowas-heal','Herbal Lore','heal',2),skill('norowas-range','Elven Archery','ranged',2),skill('norowas-command','Command','command',1,'round'),skill('norowas-mana','Nature Mana','greenCrystal',1),skill('norowas-fame','Inspiration','fame',1),skill('norowas-block','Woodland Guard','block',3)],
  },
  wolfhawk: {
    name: 'Wolfhawk', armor: 2,
    replacements: [['swiftness','swift-reflexes','Swift Reflexes','white',{move:3},{ranged:4}],['determination','combat-training','Combat Training','blue',{block:3},{attack:3,block:3}]],
    skills: [skill('wolfhawk-hunt','Hunting','move',3),skill('wolfhawk-duel','Dueling','attack',3),skill('wolfhawk-reflex','Reflexes','block',3),skill('wolfhawk-bow','Bow Training','ranged',3),skill('wolfhawk-lone','Lone Wolf','anyCombat',2),skill('wolfhawk-stalk','Stalking','siege',2),skill('wolfhawk-pace','Swift','draw',1),skill('wolfhawk-resist','Endurance','heal',1),skill('wolfhawk-fame','Renown','fame',1),skill('wolfhawk-focus','Combat Focus','iceAttack',2)],
  },
  krang: {
    name: 'Krang', armor: 2,
    replacements: [['mana-draw','spirit-guides','Spirit Guides','white',{mana:'token'},{mana:'token',any:2}],['threaten','savage-harvest','Savage Harvest','red',{influence:2},{attack:5,reputation:-1}]],
    skills: [skill('krang-spirit','Spirit Guides','mana',1),skill('krang-savage','Savage Strength','attack',3),skill('krang-shaman','Shamanic Heal','heal',2),skill('krang-storm','Storm Call','siege',2),skill('krang-ward','Spirit Ward','block',3),skill('krang-path','Wild Paths','move',3),skill('krang-voice','Spirit Voice','influence',3),skill('krang-trance','Trance','draw',2,'round'),skill('krang-chaos','Chaos Magic','any',2),skill('krang-bond','Totem Bond','anyCombat',3)],
  },
  braevalar: {
    name: 'Braevalar', armor: 2,
    replacements: [['march','druidic-paths','Druidic Paths','green',{move:3},{move:5}],['determination','elemental-bulwark','Elemental Bulwark','blue',{block:3},{iceBlock:5}]],
    skills: [skill('braevalar-earth','Earth Mastery','block',3),skill('braevalar-air','Air Mastery','move',3),skill('braevalar-water','Water Mastery','iceAttack',2),skill('braevalar-fire','Fire Mastery','fireAttack',2),skill('braevalar-druid','Druidic Paths','move',3),skill('braevalar-storm','Storm','siege',2),skill('braevalar-calm','Calm','heal',2),skill('braevalar-cycle','Cycle of Nature','draw',2,'round'),skill('braevalar-mana','Elemental Bond','mana',1),skill('braevalar-ward','Elemental Ward','fireBlock',3)],
  },
};

export const EXTENDED_ENEMIES = {
  orcTrackers:{id:'orcTrackers',name:'Orc Trackers',armor:4,attack:4,fame:3,traits:['swift']},
  orcSummoners:{id:'orcSummoners',name:'Orc Summoners',armor:4,attack:5,fame:4,traits:['summon']},
  iceGolems:{id:'iceGolems',name:'Ice Golems',armor:5,attack:5,fame:4,traits:['ice','physical-resistant']},
  gargoyles:{id:'gargoyles',name:'Gargoyles',armor:5,attack:4,fame:4,traits:['fortified','physical-resistant']},
  medusa:{id:'medusa',name:'Medusa',armor:5,attack:6,fame:5,traits:['paralyze']},
  cryptWorm:{id:'cryptWorm',name:'Crypt Worm',armor:6,attack:5,fame:5,traits:['poison']},
  iceDragon:{id:'iceDragon',name:'Ice Dragon',armor:7,attack:7,fame:8,traits:['ice','brutal']},
  highDragon:{id:'highDragon',name:'High Dragon',armor:9,attack:8,fame:11,traits:['coldfire','brutal','physical-resistant']},
};

export const EXTENDED_UNITS = [
  {id:'foresters',name:'Foresters',level:1,cost:5,armor:3,sites:['village'],ability:{move:3}},
  {id:'guardian-golems',name:'Guardian Golems',level:2,cost:7,armor:5,sites:['keep'],ability:{block:6}},
  {id:'ice-mages',name:'Ice Mages',level:3,cost:9,armor:5,sites:['mage-tower','city'],elite:true,ability:{iceAttack:5}},
  {id:'altem-guardians',name:'Altem Guardians',level:4,cost:11,armor:7,sites:['city'],elite:true,ability:{block:8}},
  {id:'catapults',name:'Catapults',level:3,cost:9,armor:4,sites:['keep','city'],elite:true,ability:{siege:6}},
  {id:'amulet-mages',name:'Amulet Mages',level:3,cost:10,armor:5,sites:['mage-tower','city'],elite:true,ability:{fireAttack:3,iceAttack:3}},
  {id:'northern-monks',name:'Northern Monks',level:2,cost:7,armor:4,sites:['monastery'],ability:{iceBlock:5}},
  {id:'savage-monks',name:'Savage Monks',level:2,cost:7,armor:4,sites:['monastery'],ability:{attack:5}},
  {id:'thugs',name:'Thugs',level:1,cost:4,armor:3,sites:['village','keep'],ability:{influence:3}},
  {id:'shocktroops',name:'Shocktroops',level:3,cost:9,armor:5,sites:['keep','city'],elite:true,ability:{attack:7}},
  {id:'heroes',name:'Heroes',level:4,cost:12,armor:7,sites:['city'],elite:true,ability:{attack:5,influence:5}},
  {id:'ice-golems-unit',name:'Ice Golems',level:3,cost:10,armor:6,sites:['mage-tower','city'],elite:true,resistances:['ice'],ability:{iceBlock:7}},
  {id:'fire-golems-unit',name:'Fire Golems',level:3,cost:10,armor:6,sites:['mage-tower','city'],elite:true,resistances:['fire'],ability:{fireBlock:7}},
];

export const EXTENDED_ACTIONS = [
  {id:'crushing-bolt',name:'Crushing Bolt',color:'red',type:'advanced',basic:{attack:4},strong:{siege:6}},
  {id:'ice-shield',name:'Ice Shield',color:'blue',type:'advanced',basic:{block:4},strong:{iceBlock:7}},
  {id:'ambush',name:'Ambush',color:'green',type:'advanced',basic:{move:2,attack:2},strong:{move:4,attack:4}},
  {id:'heroic-tale',name:'Heroic Tale',color:'white',type:'advanced',basic:{influence:4},strong:{influence:6,fame:1}},
  {id:'refreshing-walk-aa',name:'Refreshing Walk',color:'green',type:'advanced',basic:{move:3},strong:{move:5,heal:1}},
  {id:'blood-of-ancients',name:'Blood of Ancients',color:'red',type:'advanced',basic:{attack:3,draw:1},strong:{attack:7,woundCost:1}},
  {id:'agility',name:'Agility',color:'green',type:'advanced',basic:{move:4},strong:{move:7}},
  {id:'frost-bridge',name:'Frost Bridge',color:'blue',type:'advanced',basic:{move:3},strong:{move:6}},
  {id:'ice-bolt',name:'Ice Bolt',color:'blue',type:'advanced',basic:{ranged:3},strong:{iceAttack:5}},
  {id:'intimidate',name:'Intimidate',color:'red',type:'advanced',basic:{influence:4,reputation:-1},strong:{influence:7,reputation:-2}},
  {id:'into-the-heat',name:'Into the Heat',color:'red',type:'advanced',basic:{attack:4},strong:{attack:7}},
  {id:'learning',name:'Learning',color:'blue',type:'advanced',basic:{draw:1},strong:{draw:3}},
  {id:'mana-storm',name:'Mana Storm',color:'white',type:'advanced',basic:{mana:'token'},strong:{mana:'crystal'}},
  {id:'maximal-effect',name:'Maximal Effect',color:'red',type:'advanced',basic:{any:2},strong:{any:5}},
  {id:'regeneration',name:'Regeneration',color:'green',type:'advanced',basic:{heal:2},strong:{heal:4}},
  {id:'song-of-wind',name:'Song of Wind',color:'green',type:'advanced',basic:{move:4},strong:{move:6}},
  {id:'swift-bolt',name:'Swift Bolt',color:'white',type:'advanced',basic:{ranged:3},strong:{ranged:5}},
  {id:'training',name:'Training',color:'white',type:'advanced',basic:{draw:1},strong:{draw:2,fame:1}},
  {id:'steady-tempo',name:'Steady Tempo',color:'blue',type:'advanced',basic:{move:3},strong:{move:5}},
  {id:'pure-magic',name:'Pure Magic',color:'white',type:'advanced',basic:{any:2},strong:{any:4}},
  {id:'crystal-mastery',name:'Crystal Mastery',color:'blue',type:'advanced',basic:{mana:'crystal'},strong:{mana:'crystal',draw:1}},
  {id:'decompose',name:'Decompose',color:'green',type:'advanced',basic:{heal:2},strong:{heal:3,mana:'crystal'}},
  {id:'temporal-portal',name:'Temporal Portal',color:'blue',type:'advanced',basic:{move:4},strong:{move:7}},
  {id:'in-need',name:'In Need',color:'white',type:'advanced',basic:{influence:3,heal:1},strong:{influence:5,heal:2}},
  {id:'counterattack',name:'Counterattack',color:'red',type:'advanced',basic:{block:3,attack:2},strong:{block:6,attack:4}},
];

export const EXTENDED_SPELLS = [
  {id:'snowstorm',name:'Snowstorm',color:'blue',type:'spell',basic:{iceAttack:5},strong:{iceAttack:8}},
  {id:'flame-wall',name:'Flame Wall',color:'red',type:'spell',basic:{fireBlock:5},strong:{fireAttack:7}},
  {id:'call-to-arms',name:'Call to Arms',color:'white',type:'spell',basic:{influence:5},strong:{anyCombat:6}},
  {id:'tremor',name:'Tremor',color:'green',type:'spell',basic:{siege:5},strong:{siege:8}},
  {id:'space-bending',name:'Space Bending',color:'blue',type:'spell',competitive:true,basic:{move:5},strong:{move:8}},
  {id:'demolish',name:'Demolish',color:'red',type:'spell',basic:{siege:5},strong:{siege:9}},
  {id:'burning-shield',name:'Burning Shield',color:'red',type:'spell',basic:{fireBlock:6},strong:{fireAttack:8}},
  {id:'chill',name:'Chill',color:'blue',type:'spell',basic:{iceAttack:5},strong:{iceAttack:9}},
  {id:'mana-bolt',name:'Mana Bolt',color:'blue',type:'spell',basic:{ranged:5},strong:{siege:8}},
  {id:'earthquake',name:'Earthquake',color:'green',type:'spell',basic:{siege:5},strong:{attack:9}},
  {id:'underground-travel',name:'Underground Travel',color:'green',type:'spell',competitive:true,basic:{move:5},strong:{move:9}},
  {id:'wings-of-wind',name:'Wings of Wind',color:'white',type:'spell',basic:{move:5},strong:{move:8}},
  {id:'mana-claim',name:'Mana Claim',color:'white',type:'spell',competitive:true,basic:{mana:'crystal'},strong:{mana:'crystal',draw:3}},
  {id:'energy-flow',name:'Energy Flow',color:'green',type:'spell',basic:{unitReady:1},strong:{anyCombat:7}},
  {id:'mind-read',name:'Mind Read',color:'white',type:'spell',competitive:true,basic:{influence:5},strong:{influence:9}},
  {id:'whirlwind',name:'Whirlwind',color:'green',type:'spell',basic:{ranged:5},strong:{siege:8}},
  {id:'cure',name:'Cure',color:'green',type:'spell',basic:{heal:4},strong:{heal:7}},
];

export const EXTENDED_ARTIFACTS = [
  {id:'horn-of-wrath',name:'Horn of Wrath',color:'red',type:'artifact',basic:{attack:6},strong:{siege:9}},
  {id:'golden-grail',name:'Golden Grail',color:'white',type:'artifact',basic:{heal:3},strong:{heal:6,fame:2}},
  {id:'book-of-wisdom',name:'Book of Wisdom',color:'blue',type:'artifact',basic:{draw:2},strong:{draw:4}},
  {id:'banner-of-courage',name:'Banner of Courage',color:'white',type:'artifact',basic:{block:6},strong:{block:9}},
  {id:'druidic-staff',name:'Druidic Staff',color:'green',type:'artifact',basic:{move:5},strong:{move:8}},
  {id:'banner-of-fear',name:'Banner of Fear',color:'red',type:'artifact',basic:{influence:5},strong:{attack:8}},
  {id:'banner-of-protection',name:'Banner of Protection',color:'blue',type:'artifact',basic:{block:6},strong:{iceBlock:9}},
  {id:'bow-of-stars',name:'Bow of Stars',color:'white',type:'artifact',basic:{ranged:6},strong:{siege:9}},
  {id:'ring-of-proficiency',name:'Ring of Proficiency',color:'white',type:'artifact',basic:{any:4},strong:{any:8}},
  {id:'ruby-ring',name:'Ruby Ring',color:'red',type:'artifact',basic:{fireAttack:5},strong:{fireAttack:9}},
  {id:'sapphire-ring',name:'Sapphire Ring',color:'blue',type:'artifact',basic:{iceAttack:5},strong:{iceAttack:9}},
  {id:'shield-of-fallen-kings',name:'Shield of Fallen Kings',color:'blue',type:'artifact',basic:{block:7},strong:{block:11}},
  {id:'emerald-ring',name:'Emerald Ring',color:'green',type:'artifact',basic:{heal:3,move:3},strong:{heal:6,move:6}},
];

// Seven-hex clusters. Only the portal tile starts revealed; exploration reveals
// the other clusters in deterministic shuffled order.
export const MAP_TILES = [
  {id:'countryside-a',core:false,hexes:[[1,0,'plains'],[1,-1,'forest','glade'],[0,-1,'plains','village'],[-1,0,'hills','mine'],[-1,1,'forest'],[0,1,'lake']]},
  {id:'countryside-b',core:false,hexes:[[2,0,'hills','keep','guards'],[2,-1,'plains','rampaging','prowlers'],[2,-2,'forest','monastery'],[1,-2,'hills','mage-tower','mage'],[0,-2,'lake'],[-1,-1,'desert','ruins','golem'],[-1,-2,'plains']]},
  {id:'countryside-c',core:false,hexes:[[-2,0,'wasteland','dungeon','golem'],[-2,1,'plains','village'],[-2,2,'forest','glade'],[-1,2,'swamp','rampaging','diggers'],[0,2,'mountain'],[1,1,'desert','draconum','dragon'],[1,2,'plains']]},
  {id:'countryside-d',core:false,hexes:[[3,0,'plains','village'],[4,0,'forest','glade'],[4,-1,'hills','keep','guards'],[5,-1,'desert','ruins','golem'],[5,-2,'wasteland','rampaging','prowlers'],[4,-2,'lake'],[3,1,'plains']]},
  {id:'countryside-e',core:false,hexes:[[6,-2,'plains'],[6,-3,'forest','mine'],[5,-3,'hills','keep','guards'],[4,-3,'swamp'],[3,-4,'desert','ruins','golem'],[2,-4,'lake'],[3,-5,'plains']]},
  {id:'countryside-f',core:false,hexes:[[7,-2,'plains','village'],[7,-3,'forest','glade'],[7,-4,'hills','mage-tower','mage'],[6,-4,'wasteland','rampaging','diggers'],[5,-4,'desert'],[4,-4,'lake'],[5,-5,'plains']]},
  {id:'countryside-g',core:false,hexes:[[8,-2,'plains'],[8,-3,'forest','monastery'],[8,-4,'hills','mine'],[8,-5,'swamp','monster-den','den'],[7,-5,'wasteland'],[6,-5,'mountain'],[7,-1,'plains']]},
  {id:'countryside-h',core:false,hexes:[[9,-2,'plains','village'],[9,-3,'forest'],[9,-4,'hills','rampaging','prowlers'],[9,-5,'desert','ruins','golem'],[9,-6,'wasteland'],[8,-6,'lake'],[8,-1,'plains']]},
  {id:'countryside-i',core:false,hexes:[[10,-2,'plains'],[10,-3,'forest','glade'],[10,-4,'hills','keep','guards'],[10,-5,'swamp'],[10,-6,'desert','draconum','dragon'],[10,-7,'mountain'],[10,-1,'plains']]},
  {id:'countryside-j',core:false,hexes:[[11,-2,'plains','village'],[11,-3,'forest','mine'],[11,-4,'hills'],[11,-5,'wasteland','mage-tower','mage'],[11,-6,'desert','rampaging','diggers'],[11,-7,'lake'],[11,-1,'plains']]},
  {id:'countryside-k',core:false,hexes:[[12,-2,'plains'],[12,-3,'forest','monastery'],[12,-4,'hills','glade'],[12,-5,'swamp','dungeon','golem'],[12,-6,'wasteland'],[12,-7,'mountain'],[13,-3,'plains']]},
  {id:'core-a',core:true,cityCore:true,hexes:[[3,-1,'plains'],[3,-2,'wasteland','city','city','red'],[3,-3,'desert'],[2,-3,'forest','mine'],[-3,0,'plains'],[-3,1,'hills','tomb','tomb'],[-2,-1,'plains']]},
  {id:'core-b',core:true,cityCore:true,hexes:[[-3,2,'forest','monster-den','den'],[-3,3,'swamp','spawning-grounds','spawn'],[-2,3,'plains','city','city','blue'],[-1,3,'hills','keep','guards'],[0,3,'forest','mage-tower','mage'],[1,3,'desert','draconum','highDragon'],[-1,4,'plains']]},
  {id:'core-c',core:true,cityCore:false,hexes:[[1,-4,'forest','monster-den','den'],[0,-4,'desert','draconum','dragon'],[-1,-3,'hills','keep','guards'],[-2,-2,'plains','village'],[-3,-1,'wasteland','dungeon','golem'],[-4,0,'forest','mage-tower','mage'],[0,-3,'plains']]},
  {id:'core-d',core:true,cityCore:false,hexes:[[-4,1,'plains','monastery'],[-4,2,'swamp','ruins','golem'],[-4,3,'forest','glade'],[-4,4,'desert','draconum','iceDragon'],[-3,4,'hills','keep','guards'],[-2,4,'plains','mine'],[-3,5,'plains']]},
  {id:'core-e',core:true,cityCore:true,hexes:[[7,-6,'forest'],[8,-7,'hills','city','city','white'],[9,-7,'desert','draconum','highDragon'],[9,-8,'wasteland','tomb','tomb'],[8,-8,'plains','mine'],[7,-7,'forest','keep','guards'],[10,-8,'plains']]},
  {id:'core-f',core:true,cityCore:true,hexes:[[6,-6,'plains'],[6,-7,'forest','city','city','green'],[6,-8,'hills','spawning-grounds','spawn'],[7,-8,'desert','draconum','highDragon'],[7,-9,'wasteland','mage-tower','mage'],[6,-9,'swamp','ruins','golem'],[5,-6,'plains']]},
  {id:'core-g',core:true,cityCore:false,hexes:[[-5,0,'forest','monster-den','den'],[-5,1,'hills','keep','guards'],[-5,2,'desert','draconum','iceDragon'],[-5,3,'wasteland','dungeon','golem'],[-5,4,'plains','monastery'],[-4,5,'forest','mine'],[-5,5,'plains']]},
  {id:'core-h',core:true,cityCore:false,hexes:[[-6,0,'plains','village'],[-6,1,'forest','glade'],[-6,2,'hills','tomb','tomb'],[-6,3,'swamp','spawning-grounds','spawn'],[-6,4,'desert','draconum','highDragon'],[-6,5,'wasteland','ruins','golem'],[-7,1,'plains']]},
];

export function applyCharacterDeck(baseCards, characterId) {
  const profile=CHARACTER_PROFILES[characterId]||CHARACTER_PROFILES.tovak;
  const replacements=new Map(profile.replacements.map(item=>[item[0],item]));
  return baseCards.map(card=>{const row=replacements.get(card.id);return row?{id:row[1],name:row[2],color:row[3],basic:row[4],strong:row[5]}:{...card};});
}
