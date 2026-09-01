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
];

export const EXTENDED_ACTIONS = [
  {id:'crushing-bolt',name:'Crushing Bolt',color:'red',type:'advanced',basic:{attack:4},strong:{siege:6}},
  {id:'ice-shield',name:'Ice Shield',color:'blue',type:'advanced',basic:{block:4},strong:{iceBlock:7}},
  {id:'ambush',name:'Ambush',color:'green',type:'advanced',basic:{move:2,attack:2},strong:{move:4,attack:4}},
  {id:'heroic-tale',name:'Heroic Tale',color:'white',type:'advanced',basic:{influence:4},strong:{influence:6,fame:1}},
  {id:'refreshing-walk-aa',name:'Refreshing Walk',color:'green',type:'advanced',basic:{move:3},strong:{move:5,heal:1}},
  {id:'blood-of-ancients',name:'Blood of Ancients',color:'red',type:'advanced',basic:{attack:3,draw:1},strong:{attack:7,woundCost:1}},
];

export const EXTENDED_SPELLS = [
  {id:'snowstorm',name:'Snowstorm',color:'blue',type:'spell',basic:{iceAttack:5},strong:{iceAttack:8}},
  {id:'flame-wall',name:'Flame Wall',color:'red',type:'spell',basic:{fireBlock:5},strong:{fireAttack:7}},
  {id:'call-to-arms',name:'Call to Arms',color:'white',type:'spell',basic:{influence:5},strong:{anyCombat:6}},
  {id:'tremor',name:'Tremor',color:'green',type:'spell',basic:{siege:5},strong:{siege:8}},
  {id:'space-bending',name:'Space Bending',color:'blue',type:'spell',basic:{move:5},strong:{move:8}},
];

export const EXTENDED_ARTIFACTS = [
  {id:'horn-of-wrath',name:'Horn of Wrath',color:'red',type:'artifact',basic:{attack:6},strong:{siege:9}},
  {id:'golden-grail',name:'Golden Grail',color:'white',type:'artifact',basic:{heal:3},strong:{heal:6,fame:2}},
  {id:'book-of-wisdom',name:'Book of Wisdom',color:'blue',type:'artifact',basic:{draw:2},strong:{draw:4}},
  {id:'banner-of-courage',name:'Banner of Courage',color:'white',type:'artifact',basic:{block:6},strong:{block:9}},
  {id:'druidic-staff',name:'Druidic Staff',color:'green',type:'artifact',basic:{move:5},strong:{move:8}},
];

// Seven-hex clusters. Only the portal tile starts revealed; exploration reveals
// the other clusters in deterministic shuffled order.
export const MAP_TILES = [
  {id:'countryside-a',core:false,hexes:[[1,0,'plains'],[1,-1,'forest','glade'],[0,-1,'plains','village'],[-1,0,'hills','mine'],[-1,1,'forest'],[0,1,'lake']]},
  {id:'countryside-b',core:false,hexes:[[2,0,'hills','keep','guards'],[2,-1,'plains','rampaging','prowlers'],[2,-2,'forest','monastery'],[1,-2,'hills','mage-tower','mage'],[0,-2,'lake'],[-1,-1,'desert','ruins','golem']]},
  {id:'countryside-c',core:false,hexes:[[-2,0,'wasteland','dungeon','golem'],[-2,1,'plains','village'],[-2,2,'forest','glade'],[-1,2,'swamp','rampaging','diggers'],[0,2,'mountain'],[1,1,'desert','draconum','dragon']]},
  {id:'core-a',core:true,hexes:[[3,-1,'plains'],[3,-2,'wasteland','city','city','red'],[3,-3,'desert'],[2,-3,'forest','mine'],[-3,0,'plains'],[-3,1,'hills','tomb','tomb']]},
  {id:'core-b',core:true,hexes:[[-3,2,'forest','monster-den','den'],[-3,3,'swamp','spawning-grounds','spawn'],[-2,3,'plains','city','city','blue'],[-1,3,'hills','city','city','white'],[0,3,'forest','city','city','green'],[4,-2,'desert','draconum','highDragon']]},
];

export function applyCharacterDeck(baseCards, characterId) {
  const profile=CHARACTER_PROFILES[characterId]||CHARACTER_PROFILES.tovak;
  const replacements=new Map(profile.replacements.map(item=>[item[0],item]));
  return baseCards.map(card=>{const row=replacements.get(card.id);return row?{id:row[1],name:row[2],color:row[3],basic:row[4],strong:row[5]}:{...card};});
}
