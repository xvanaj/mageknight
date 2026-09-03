/* Data used by the deterministic base-game rules mode.  Names and values are
 * kept separate from the reducer so new sets can be added without networking
 * changes. */

const skill = (id, name, effect, value, cadence = 'turn') => ({ id, name, effect, value, cadence, description: `${name}: ${effect} ${value}.` });
const option = (id, label, effect) => ({ id, label, effect });
const choose = (...options) => ({ options });

export const CHARACTER_PROFILES = {
  tovak: {
    name: 'Tovak', armor: 2,
    replacements: [
      ['determination','cold-toughness','Cold Toughness','blue',choose(option('attack','Attack 2',{attack:2}),option('block','Block 2',{block:2})),{block:5,iceBlock:3}],
      ['improvisation','instinct','Instinct','red',choose(option('move','Move 2',{move:2}),option('influence','Influence 2',{influence:2}),option('attack','Attack 2',{attack:2}),option('block','Block 2',{block:2})),choose(option('move','Move 4',{move:4}),option('influence','Influence 4',{influence:4}),option('attack','Attack 4',{attack:4}),option('block','Block 4',{block:4}))],
    ],
    skills: [skill('tovak-attack','Cold Swordsmanship','iceAttack',2),skill('tovak-block','Shield Mastery','block',3),skill('tovak-move','Double Time','move',2),skill('tovak-range','Night Sharpshooting','ranged',2),skill('tovak-heal','I Feel No Pain','heal',1),skill('tovak-influence','Who Needs Magic?','influence',3),skill('tovak-resist','Resistance Break','armorBreak',1),skill('tovak-motivation','Motivation','draw',2,'round'),skill('tovak-mana','Mana Overload','mana',1,'round'),skill('tovak-versatile','Battle Mastery','anyCombat',2)],
  },
  arythea: {
    name: 'Arythea', armor: 2,
    replacements: [
      ['rage','battle-versatility','Battle Versatility','red',choose(option('attack','Attack 2',{attack:2}),option('block','Block 2',{block:2}),option('ranged','Ranged Attack 1',{ranged:1})),choose(option('attack','Attack 4',{attack:4}),option('block','Block 4',{block:4}),option('fire-attack','Fire Attack 3',{fireAttack:3}),option('fire-block','Fire Block 3',{fireBlock:3}),option('ranged','Ranged Attack 3',{ranged:3}),option('siege','Siege Attack 2',{siege:2}))],
      ['mana-draw','mana-pull','Mana Pull','white',{extraSource:1,blackAsBasic:true},{manaDraw:{dice:2,tokensPerDie:1}}],
    ],
    skills: [skill('arythea-blood','Blood Rage','attack',3),skill('arythea-fire','Fire Mastery','fireAttack',2),skill('arythea-dark','Dark Paths','move',3),skill('arythea-pain','Power of Pain','anyCombat',2),skill('arythea-charm','Dark Negotiation','influence',3),skill('arythea-heal','Regeneration','heal',1),skill('arythea-ritual','Blood Ritual','draw',2,'round'),skill('arythea-mana','Red Crystal Craft','redCrystal',1,'round'),skill('arythea-resist','Fire Resistance','fireBlock',3),skill('arythea-fury','Fury','siege',2)],
  },
  goldyx: {
    name: 'Goldyx', armor: 2,
    replacements: [
      ['concentration','will-focus','Will Focus','green',choose(option('blue','Gain blue mana',{mana:'token',allowedMana:['blue']}),option('red','Gain red mana',{mana:'token',allowedMana:['red']}),option('white','Gain white mana',{mana:'token',allowedMana:['white']})),choose(option('blue','Gain blue mana',{mana:'token',allowedMana:['blue']}),option('red','Gain red mana',{mana:'token',allowedMana:['red']}),option('white','Gain white mana',{mana:'token',allowedMana:['white']}),option('gold','Gain gold mana',{gainManaColor:'gold'}))],
      ['crystallize','crystal-joy','Crystal Joy','blue',{crystallize:true},{gainCrystalChoice:true,poweredByAny:true}],
    ],
    skills: [skill('goldyx-blue','Blue Crystal Craft','blueCrystal',1),skill('goldyx-green','Green Crystal Craft','greenCrystal',1),skill('goldyx-flight','Freezing Flight','move',3),skill('goldyx-breath','Draconum Breath','fireAttack',3),skill('goldyx-focus','Will Focus','any',2),skill('goldyx-source','Source Opening','mana',1),skill('goldyx-rest','Meditation','draw',2,'round'),skill('goldyx-block','Scaled Armor','block',3),skill('goldyx-range','Arcane Bolt','ranged',2),skill('goldyx-hoard','Crystal Hoard','influence',3)],
  },
  norowas: {
    name: 'Norowas', armor: 2,
    replacements: [
      ['promise','noble-manners-norowas','Noble Manners','white',{influence:2},{influence:4,reputation:1}],
      ['tranquility','rejuvenate','Rejuvenate','green',choose(option('heal','Heal 1',{heal:1}),option('draw','Draw 1',{draw:1}),option('mana','Gain green mana',{mana:'token',allowedMana:['green']}),option('ready','Ready a level 1–2 Unit',{unitReady:1,maxUnitLevel:2})),choose(option('heal','Heal 2',{heal:2}),option('draw','Draw 2',{draw:2}),option('crystal','Gain a green crystal',{gainCrystalColor:'green'}),option('ready','Ready a level 1–3 Unit',{unitReady:1,maxUnitLevel:3}))],
    ],
    skills: [skill('norowas-lead','Leadership','unitReady',1),skill('norowas-recruit','Recruiting','influence',3),skill('norowas-forest','Forest Paths','move',3),skill('norowas-bond','Unit Bond','anyCombat',3),skill('norowas-heal','Herbal Lore','heal',2),skill('norowas-range','Elven Archery','ranged',2),skill('norowas-command','Command','command',1,'round'),skill('norowas-mana','Nature Mana','greenCrystal',1),skill('norowas-fame','Inspiration','fame',1),skill('norowas-block','Woodland Guard','block',3)],
  },
  wolfhawk: {
    name: 'Wolfhawk', armor: 2,
    replacements: [
      ['swiftness','swift-reflexes','Swift Reflexes','white',{move:2},choose(option('ranged','Ranged Attack 3',{ranged:3}),option('block','Block 3',{block:3}))],
      ['stamina','tirelessness','Tirelessness','blue',{move:2},{move:4,draw:1}],
      ['concentration','axe-throw','Axe Throw','white',choose(option('move','Move 2',{move:2}),option('ranged','Ranged Attack 1',{ranged:1})),{ranged:3,famePerDefeat:1}],
    ],
    skills: [skill('wolfhawk-hunt','Hunting','move',3),skill('wolfhawk-duel','Dueling','attack',3),skill('wolfhawk-reflex','Reflexes','block',3),skill('wolfhawk-bow','Bow Training','ranged',3),skill('wolfhawk-lone','Lone Wolf','anyCombat',2),skill('wolfhawk-stalk','Stalking','siege',2),skill('wolfhawk-pace','Swift','draw',1),skill('wolfhawk-resist','Endurance','heal',1),skill('wolfhawk-fame','Renown','fame',1),skill('wolfhawk-focus','Combat Focus','iceAttack',2)],
  },
  krang: {
    name: 'Krang', armor: 2,
    replacements: [
      ['march','savage-harvesting','Savage Harvesting','green',{move:2},{move:4,reputation:-1}],
      ['threaten','ruthless-coercion','Ruthless Coercion','red',{influence:2},{influence:7,reputation:-2}],
      ['rage','battle-rage','Battle Rage','red',choose(option('attack','Attack 2',{attack:2}),option('block','Block 2',{block:2})),{attack:5,woundCost:1}],
    ],
    skills: [skill('krang-spirit','Spirit Guides','mana',1),skill('krang-savage','Savage Strength','attack',3),skill('krang-shaman','Shamanic Heal','heal',2),skill('krang-storm','Storm Call','siege',2),skill('krang-ward','Spirit Ward','block',3),skill('krang-path','Wild Paths','move',3),skill('krang-voice','Spirit Voice','influence',3),skill('krang-trance','Trance','draw',2,'round'),skill('krang-chaos','Chaos Magic','any',2),skill('krang-bond','Totem Bond','anyCombat',3)],
  },
  braevalar: {
    name: 'Braevalar', armor: 2,
    replacements: [
      ['march','one-with-the-land','One With The Land','green',choose(option('move','Move 2',{move:2}),option('heal','Heal 1',{heal:1}),option('block','Block 2',{block:2})),choose(option('move','Move 4',{move:4}),option('heal','Heal 2',{heal:2}),option('terrain-block','Block from your terrain',{terrainBlock:true}))],
      ['stamina','druidic-paths','Druidic Paths','blue',{move:2,reduceHexCost:{reduction:2,minimum:2}},{move:4,reduceTerrainCost:{reduction:2,minimum:2}}],
    ],
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
  {id:'fire-bolt',name:'Fire Bolt',color:'red',type:'advanced',basic:{gainCrystalColor:'red'},strong:{fireRanged:3}},
  {id:'blood-ritual',name:'Blood Ritual',color:'red',type:'advanced',basic:{bloodRitual:{tokens:1,redCrystal:true}},strong:{bloodRitual:{tokens:3,mayCrystallize:true}}},
  {id:'magic-talent',name:'Magic Talent',color:'blue',type:'advanced',basic:{magicTalent:'cast'},strong:{magicTalent:'gain'}},
  {id:'crushing-bolt',name:'Crushing Bolt',color:'green',type:'advanced',basic:{gainCrystalColor:'green'},strong:{siege:3}},
  {id:'ice-shield',name:'Ice Shield',color:'blue',type:'advanced',basic:{iceBlock:3},strong:{iceBlock:3,armorChange:{amount:-3,minimum:1,exclude:'ice-resistant'}}},
  {id:'ambush',name:'Ambush',color:'green',type:'advanced',basic:{move:2,attackBlockCardBonus:{attack:1,block:2}},strong:{move:4,attackBlockCardBonus:{attack:2,block:4}}},
  {id:'heroic-tale',name:'Heroic Tale',color:'white',type:'advanced',basic:{influence:3,recruitmentBonus:{reputation:1,fame:0}},strong:{influence:6,recruitmentBonus:{reputation:1,fame:1}}},
  {id:'refreshing-walk-aa',name:'Refreshing Walk',color:'green',type:'advanced',basic:{move:2,healOutsideCombat:1},strong:{move:4,healOutsideCombat:2}},
  {id:'blood-of-ancients',name:'Blood of Ancients',color:'red',type:'advanced',basic:{bloodAncients:'basic'},strong:{bloodAncients:'powered'}},
  {id:'agility',name:'Agility',color:'white',type:'advanced',basic:{move:2,moveConversion:{attack:1},moveCardsInCombat:true},strong:{move:4,moveConversion:{attack:1,ranged:2},moveCardsInCombat:true}},
  {id:'frost-bridge',name:'Frost Bridge',color:'blue',type:'advanced',basic:{move:2,movementRule:{replace:{swamp:1}}},strong:{move:4,movementRule:{replace:{swamp:1,lake:1}}}},
  {id:'ice-bolt',name:'Ice Bolt',color:'blue',type:'advanced',basic:{gainCrystalColor:'blue'},strong:{iceRanged:3}},
  {id:'intimidate',name:'Intimidate',color:'red',type:'advanced',basic:{options:[{id:'influence',label:'Influence 4; Reputation -1',effect:{influence:4,reputation:-1}},{id:'attack',label:'Attack 3; Reputation -1',effect:{attack:3,reputation:-1}}]},strong:{options:[{id:'influence',label:'Influence 8; Reputation -2',effect:{influence:8,reputation:-2}},{id:'attack',label:'Attack 7; Reputation -2',effect:{attack:7,reputation:-2}}]}},
  {id:'into-the-heat',name:'Into the Heat',color:'red',type:'advanced',basic:{unitCombatBonus:{attack:2,block:2},unitsCannotAbsorbDamage:true},strong:{unitCombatBonus:{attack:3,block:3},unitsCannotAbsorbDamage:true}},
  {id:'learning',name:'Learning',color:'white',type:'advanced',basic:{influence:2,learning:{cost:6,destination:'discard'}},strong:{influence:4,learning:{cost:9,destination:'hand'}}},
  {id:'mana-storm',name:'Mana Storm',color:'white',type:'advanced',basic:{manaStorm:'crystal-and-reroll'},strong:{manaStorm:'reroll-and-use-three'}},
  {id:'maximal-effect',name:'Maximal Effect',color:'red',type:'advanced',basic:{maximalEffect:'basic'},strong:{maximalEffect:'strong'}},
  {id:'regeneration',name:'Regeneration',color:'green',type:'advanced',basic:{heal:1,unitReady:1,maxUnitLevel:2},strong:{heal:2,unitReady:1,maxUnitLevel:3}},
  {id:'song-of-wind',name:'Song of Wind',color:'white',type:'advanced',basic:{move:2,movementRule:{reduction:{plains:1,desert:1,wasteland:1}}},strong:{options:[{id:'wind',label:'Move 2; plains, desert, and wasteland cost 2 less',effect:{move:2,movementRule:{reduction:{plains:2,desert:2,wasteland:2}}}},{id:'lake',label:'Also pay blue: lakes cost 0',effect:{move:2,additionalMana:'blue',movementRule:{reduction:{plains:2,desert:2,wasteland:2},replace:{lake:0}}}}]}},
  {id:'swift-bolt',name:'Swift Bolt',color:'white',type:'advanced',basic:{gainCrystalColor:'white'},strong:{ranged:4}},
  {id:'training',name:'Training',color:'green',type:'advanced',basic:{training:'discard',removeRequired:true},strong:{training:'hand',removeRequired:true}},
  {id:'steady-tempo',name:'Steady Tempo',color:'blue',type:'advanced',basic:{move:2,endTurnPlacement:'deck-bottom'},strong:{move:4,endTurnPlacement:'deck-top'}},
  {id:'pure-magic',name:'Pure Magic',color:'blue',type:'advanced',basic:{pureMagic:4},strong:{pureMagic:7}},
  {id:'crystal-mastery',name:'Crystal Mastery',color:'blue',type:'advanced',basic:{crystalMastery:'duplicate'},strong:{crystalMastery:'preserve'}},
  {id:'decompose',name:'Decompose',color:'red',type:'advanced',basic:{decompose:'matching',removeRequired:true},strong:{decompose:'other-colors',removeRequired:true}},
  {id:'temporal-portal',name:'Temporal Portal',color:'blue',type:'advanced',basic:{move:1,movementRule:{all:{replace:1}},ignoreRampagers:true,handLimitBonus:1},strong:{options:[{id:'distance',label:'Move 2 and hand limit +1',effect:{move:2,movementRule:{all:{replace:1}},ignoreRampagers:true,handLimitBonus:1}},{id:'preparation',label:'Move 1 and hand limit +2',effect:{move:1,movementRule:{all:{replace:1}},ignoreRampagers:true,handLimitBonus:2}}]}},
  {id:'in-need',name:'In Need',color:'green',type:'advanced',basic:{influenceScaling:{base:3,per:1}},strong:{influenceScaling:{base:5,per:2}}},
  {id:'counterattack',name:'Counterattack',color:'red',type:'advanced',basic:{attackPerBlocked:{base:2,per:2}},strong:{attackPerBlocked:{base:4,per:3}}},
];

export const EXTENDED_SPELLS = [
  {id:'offering',name:'Offering',color:'red',type:'spell',basic:{offering:{maxDiscards:3}},strong:{sacrifice:true}},
  {id:'snowstorm',name:'Snowstorm',color:'blue',type:'spell',basic:{iceRanged:5},strong:{iceSiege:8,woundCost:1}},
  {id:'flame-wall',name:'Flame Wall',color:'red',type:'spell',basic:{options:[{id:'attack',label:'Fire Attack 5',effect:{fireAttack:5}},{id:'block',label:'Fire Block 7',effect:{fireBlock:7}}]},strong:{options:[{id:'attack',label:'Fire Attack 7',effect:{fireAttack:7}},{id:'block',label:'Fire Block 9',effect:{fireBlock:9}}]}},
  {id:'call-to-arms',name:'Call to Arms',color:'white',type:'spell',basic:{callToArms:'borrow'},strong:{callToArms:'recruit'}},
  {id:'tremor',name:'Tremor',color:'red',type:'spell',basic:{options:[{id:'target',label:'One enemy: Armor -3',effect:{armorChange:{amount:-3,minimum:1}}},{id:'all',label:'All enemies: Armor -2',effect:{allArmorChange:{amount:-2,minimum:1}}}]},strong:{options:[{id:'target',label:'One enemy: Armor -3, or -6 if fortified',effect:{armorChange:{amount:-3,fortifiedAmount:-6,minimum:1}}},{id:'all',label:'All enemies: Armor -2, or -4 if fortified',effect:{allArmorChange:{amount:-2,fortifiedAmount:-4,minimum:1}}}]}},
  {id:'space-bending',name:'Space Bending',color:'blue',type:'spell',basic:{spaceBending:true,ignoreRampagers:true},strong:{timeBending:true}},
  {id:'demolish',name:'Demolish',color:'red',type:'spell',basic:{allArmorChange:{amount:-1,minimum:1,exclude:'fire-resistant'},exposeAll:'fortification'},strong:{defeatTarget:{exclude:'fire-resistant',excludeArcane:true},allArmorChange:{amount:-1,minimum:1,exclude:'fire-resistant'}}},
  {id:'burning-shield',name:'Burning Shield',color:'red',type:'spell',basic:{fireBlock:4,burningShield:'attack'},strong:{fireBlock:4,burningShield:'destroy'}},
  {id:'chill',name:'Chill',color:'blue',type:'spell',basic:{enemyControl:{skipAttack:true,removeFireResistance:true,exclude:'ice-resistant',excludeArcane:true}},strong:{enemyControl:{skipAttack:true,armorChange:-4,minimum:1,exclude:'ice-resistant',excludeArcane:true}}},
  {id:'mana-bolt',name:'Mana Bolt',color:'blue',type:'spell',basic:{manaBolt:8},strong:{manaBolt:11}},
  {id:'expose',name:'Expose',color:'white',type:'spell',basic:{ranged:2,exposeTarget:'both'},strong:{options:[{id:'fortification',label:'All enemies lose fortification; Ranged Attack 3',effect:{ranged:3,exposeAll:'fortification'}},{id:'resistances',label:'All enemies lose resistances; Ranged Attack 3',effect:{ranged:3,exposeAll:'resistances'}}]}},
  {id:'underground-travel',name:'Underground Travel',color:'green',type:'spell',basic:{move:3,movementRule:{all:{replace:1}},terrainProhibition:['swamp','lake'],ignoreRampagers:true},strong:{move:3,movementRule:{all:{replace:1}},terrainProhibition:['swamp','lake'],ignoreRampagers:true,ignoreFortifications:true}},
  {id:'mist-form',name:'Mist Form',color:'blue',type:'spell',basic:{move:4,movementRule:{all:{replace:2}},terrainProhibition:['hills','mountain']},strong:{mistVeil:true}},
  {id:'wings-of-wind',name:'Wings of Wind',color:'white',type:'spell',basic:{options:[{id:'flight-1',label:'Flight 1',effect:{move:1,movementRule:{all:{replace:1}},ignoreRampagers:true,noExploration:true}},{id:'flight-2',label:'Flight 2',effect:{move:2,movementRule:{all:{replace:1}},ignoreRampagers:true,noExploration:true}},{id:'flight-3',label:'Flight 3',effect:{move:3,movementRule:{all:{replace:1}},ignoreRampagers:true,noExploration:true}},{id:'flight-4',label:'Flight 4',effect:{move:4,movementRule:{all:{replace:1}},ignoreRampagers:true,noExploration:true}},{id:'flight-5',label:'Flight 5',effect:{move:5,movementRule:{all:{replace:1}},ignoreRampagers:true,noExploration:true}}]},strong:{wingsOfNight:true}},
  {id:'mana-claim',name:'Mana Claim',color:'blue',type:'spell',competitive:true,basic:{manaClaim:{curse:false}},strong:{manaClaim:{curse:true}}},
  {id:'energy-flow',name:'Energy Flow',color:'green',type:'spell',competitive:true,basic:{energyFlow:{heal:false,opponentMaxLevel:2}},strong:{energyFlow:{heal:true,opponentMaxLevel:3}}},
  {id:'mind-read',name:'Mind Read',color:'white',type:'spell',competitive:true,basic:{mindRead:{steal:false}},strong:{mindRead:{steal:true}}},
  {id:'cure',name:'Cure',color:'white',type:'spell',basic:{cure:2},strong:{disease:true}},
  {id:'charm',name:'Charm',color:'white',type:'spell',basic:{charm:{influence:4,discount:3}},strong:{possessEnemy:true}},
  {id:'whirlwind',name:'Whirlwind',color:'white',type:'spell',basic:{enemyControl:{skipAttack:true}},strong:{defeatTarget:{attackPhaseOnly:true}}},
  {id:'mana-meltdown',name:'Mana Meltdown',color:'red',type:'spell',competitive:true,basic:{manaMeltdown:'basic'},strong:{manaMeltdown:'strong'}},
];

export const EXTENDED_ARTIFACTS = [
  {id:'horn-of-wrath',name:'Horn of Wrath',color:'red',type:'artifact',basic:{siege:5,hornRisk:'single'},strong:{siege:5,hornRisk:'repeat'}},
  {id:'golden-grail',name:'Golden Grail',color:'white',type:'artifact',basic:{heal:2,goldenGrail:'fame'},strong:{heal:6,goldenGrail:'draw'}},
  {id:'book-of-wisdom',name:'Book of Wisdom',color:'blue',type:'artifact',basic:{bookWisdom:'advanced'},strong:{bookWisdom:'spell'}},
  {id:'banner-of-courage',name:'Banner of Courage',color:'white',type:'artifact',basic:{bannerCourage:true},strong:{readyAllUnits:true}},
  {id:'druidic-staff',name:'Druidic Staff',color:'green',type:'artifact',basic:{druidicStaff:'basic'},strong:{druidicStaff:'strong'}},
  {id:'banner-of-fear',name:'Banner of Fear',color:'red',type:'artifact',basic:{bannerFear:true},strong:{enemyControl:{skipAttack:true,excludeArcane:true}}},
  {id:'banner-of-protection',name:'Banner of Protection',color:'blue',type:'artifact',basic:{bannerProtection:{armor:1,resistances:['fire','ice']}},strong:{bannerProtectionWounds:true}},
  {id:'bow-of-stars',name:'Bow of Starsdawn',color:'white',type:'artifact',basic:{bowDiscard:true},strong:{bowTransform:true}},
  {id:'ring-of-proficiency',name:'Circlet of Proficiency',color:'white',type:'artifact',basic:{circlet:'basic'},strong:{circlet:'strong'}},
  {id:'ruby-ring',name:'Ruby Ring',color:'red',type:'artifact',basic:{manaRing:{color:'red',mode:'basic'}},strong:{manaRing:{color:'red',mode:'strong'}}},
  {id:'sapphire-ring',name:'Sapphire Ring',color:'blue',type:'artifact',basic:{manaRing:{color:'blue',mode:'basic'}},strong:{manaRing:{color:'blue',mode:'strong'}}},
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
  const cards=baseCards.map(card=>({...card}));
  for(const row of profile.replacements){const index=cards.findIndex(card=>card.id===row[0]);if(index>=0)cards[index]={id:row[1],name:row[2],color:row[3],basic:row[4],strong:row[5]};}
  return cards;
}
