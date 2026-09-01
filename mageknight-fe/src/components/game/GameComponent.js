import React, { useMemo, useState } from 'react';
import { CHARACTER_PROFILES, createGame, legalExplorations, legalMoves, reduceGame, rulesSummary, SITES, TACTICS, TOVAK_SKILLS } from '../../gameEngine';
import '../../App.css';

const siteNames = Object.fromEntries(Object.entries(SITES).map(([id,site])=>[id,site.name]));
const terrainGlyph = { plains:'·', forest:'♣', hills:'⌁', desert:'☀', wasteland:'◇', swamp:'≈', lake:'≋', mountain:'▲' };
const effectText = effect => Object.entries(effect).map(([k,v]) => {
  if (k === 'mana') return v === 'crystal' ? 'gain a crystal' : 'gain mana';
  if (k === 'discardRequired') return null;
  return `${k[0].toUpperCase()+k.slice(1)} ${typeof v === 'number' && v > 0 ? '+' : ''}${v}`;
}).filter(Boolean).join(' · ');

function GameComponent({session,onLeaveGame,multiplayerGame,onGameAction,networkStatus}) {
  const [localGame, setLocalGame] = useState(() => {
    if(session){const fresh=createGame(20260901,{tactics:true});const me=session.players.find(p=>p.id===session.currentPlayerId);fresh.scenario=session.scenario;fresh.player.name=me?.character?me.character[0].toUpperCase()+me.character.slice(1):me?.name||'Mage Knight';fresh.player.playerName=me?.name;return fresh;}
    try { const saved=localStorage.getItem('mage-knight-save');const parsed=saved&&JSON.parse(saved);return parsed?.version>=2?parsed:createGame(); } catch { return createGame(); }
  });
  const game=multiplayerGame||localGame;
  const [rulesOpen,setRulesOpen]=useState(false);
  const [sideways,setSideways]=useState(null);
  const dispatch = action => onGameAction?onGameAction(action):setLocalGame(old => reduceGame(old, action));
  const moves = useMemo(() => new Map(legalMoves(game).map(h=>[`${h.q},${h.r}`,h])),[game]);
  const explorations=useMemo(()=>new Map(legalExplorations(game).map(item=>[item.tileId,item])),[game]);
  const here=game.map.find(h=>h.q===game.player.q&&h.r===game.player.r);
  const save=()=>{if(game.multiplayer)return;localStorage.setItem('mage-knight-save',JSON.stringify(game)); setLocalGame(g=>({...g,error:null,log:[{turn:g.turn,round:g.round,message:'Game saved in this browser.'},...g.log]}));};
  const fresh=()=>{if(session){onLeaveGame?.();return}if(window.confirm('Start a new Solo Conquest? Your current position will be replaced.')){localStorage.removeItem('mage-knight-save');setLocalGame(createGame(Date.now()));}};
  const play=(uid,mode,as)=>{dispatch({type:'PLAY_CARD',uid,mode,as});setSideways(null);};
  const discard=uid=>dispatch({type:'DISCARD_CARD',uid});
  const hexClick=hex=>{if(hex.revealed===false){const explore=explorations.get(hex.tileId);if(explore?.legal)dispatch({type:'EXPLORE',tileId:hex.tileId});return;}const move=moves.get(`${hex.q},${hex.r}`);if(move?.legal)dispatch({type:'MOVE',q:hex.q,r:hex.r});};
  const combat=game.combat?.enemy;

  const interactiveRemote=['team-assault','pvp-ranged','pvp-melee'].includes(game.phase);
  const waitingForTurn=game.multiplayer&&game.phase!=='tactic'&&!interactiveRemote&&game.viewerPlayerId!==game.activePlayerId;

  return <div className={`game-shell ${waitingForTurn?'not-my-turn':''}`}>
    <header className="topbar">
      <div className="brand"><span className="brand-mark">MK</span><div><h1>Mage Knight</h1><span>{session?`${session.scenario.replaceAll('-',' ')} · ${session.players.length} ${session.players.length===1?'player':'players'}`:'Solo Conquest rules engine'}</span></div></div>
      <div className="round-indicator"><span className={`orb ${game.time}`}>{game.time==='day'?'☀':'☾'}</span><div><b>{game.time} {Math.ceil(game.round/2)}</b><small>Round {game.round} of {game.maxRounds||6} · Turn {game.turn}{game.multiplayer&&game.activePlayerId?` · ${game.players.find(p=>p.id===game.activePlayerId)?.name}`:''}</small></div></div>
      <div className="top-actions">{!game.multiplayer&&<button onClick={save}>Save</button>}<button onClick={()=>setRulesOpen(true)}>Rules</button><button onClick={fresh}>{game.multiplayer?'Leave game':'New game'}</button></div>
    </header>

    <main className="game-grid">
      <aside className="hero-panel panel">
        <div className="hero-name"><div className="portrait">{game.player.name[0]}</div><div><h2>{game.player.name}</h2><span>{game.player.playerName?`${game.player.playerName} · `:''}Level {game.player.level} Mage Knight</span></div></div>
        <div className="track-grid"><Stat label="Fame" value={game.player.fame}/><Stat label="Reputation" value={game.player.reputation}/><Stat label="Armor" value={game.player.armor}/><Stat label="Command" value={`${game.player.units.length}/${game.player.command}`}/></div>
        <div className="fame-track"><i style={{width:`${Math.min(100,game.player.fame/99*100)}%`}}/><span>Next level: {game.player.level===10?'—':[3,8,15,24,35,48,63,80,99][game.player.level-1]}</span></div>
        <Section title="Action power"><div className="power-grid">{Object.entries(game.points).map(([k,v])=><div className={v?'lit':''} key={k}><span>{k}</span><b>{v}</b></div>)}</div></Section>
        <Section title="Mana inventory"><div className="mana-row">{Object.entries(game.player.crystals).map(([c,n])=><span className={`mana ${c}`} title={`${c} crystals`} key={c}>{n}</span>)}{game.mana.map((c,i)=><span className={`mana token ${c}`} key={`${c}${i}`}>•</span>)}</div></Section>
        <Section title={`${game.player.name} skills (${game.player.skills.length}/10)`}>{game.player.skills.length===0?<p className="muted">Character skills are offered on even levels.</p>:game.player.skills.map(skill=><SkillControl key={skill.id} skill={skill} dispatch={dispatch}/>)}</Section>
        <Section title={`Units (${game.player.units.length}/${game.player.command})`}>{game.player.units.length===0?<p className="muted">No units recruited.</p>:game.player.units.map(u=><button className="unit-chip" disabled={u.spent||u.wounded} onClick={()=>dispatch({type:'USE_UNIT',id:u.id})} key={u.id}><b>{u.name}{u.wounded?' · Wounded':''}</b><span>{effectText(u.ability)} · Armor {u.armor}</span></button>)}</Section>
        <Section title="Deed deck"><div className="deck-counts"><span><b>{game.player.deck.length}</b> deck</span><span><b>{game.player.discard.length}</b> discard</span><span><b>{game.player.wounds}</b> wounds</span></div></Section>
      </aside>

      <section className="board-panel panel">
        <div className="board-heading"><div><span className="eyebrow">Atlantean Empire</span><h2>{here ? `${siteNames[here.site]||here.terrain} · ${here.q}, ${here.r}`:'Wilderness'}</h2></div><div className="legend"><span><i className="dot legal"/>reachable</span><span><i className="dot hostile"/>hostile</span></div></div>
        <HexMap game={game} moves={moves} onHex={hexClick} onCombat={(h)=>dispatch({type:'START_COMBAT',q:h.q,r:h.r})}/>
        {game.error&&<div className="toast error"><b>Illegal action</b>{game.error}<button onClick={()=>dispatch({type:'CLEAR_ERROR'})}>×</button></div>}
        {game.status!=='playing'&&<div className={`end-banner ${game.status}`}><h2>{game.status==='won'?'Conquest complete':'Time has run out'}</h2><p>{game.scoring?`Final party score: ${game.scoring.teamTotal}`:'Final scoring is ready.'}</p>{game.scoring?.players.map(row=><p key={row.playerId||row.name}><b>{row.name}: {row.total}</b> · Fame {row.fame} · Wound penalty {row.categories.wounds}</p>)}<button onClick={fresh}>Play again</button></div>}
        {game.multiplayer&&game.phase!=='tactic'&&game.viewerPlayerId!==game.activePlayerId&&<div className="turn-wait"><span className="eyebrow">Waiting for player</span><h2>{game.players.find(player=>player.id===game.activePlayerId)?.name}'s turn</h2><p>You see every shared action live. Your hand remains private until your turn.</p><small>{networkStatus}</small></div>}
      </section>

      <aside className="turn-panel panel">
        <span className="eyebrow">Current phase</span><h2>{phaseName(game.phase)}</h2>
        {game.phase==='team-assault'?<TeamAssault game={game} dispatch={dispatch}/>:game.phase?.startsWith('pvp-')?<PvpPanel game={game} dispatch={dispatch}/>:combat?<Combat game={game} dispatch={dispatch}/>:game.pendingRewards.length?<RewardPanel game={game} dispatch={dispatch}/>:<ActionPanel game={game} here={here} dispatch={dispatch}/>}
        <Section title="Mana source"><div className="source">{game.source.map(d=><button disabled={game.sourceTaken||(d.color==='black'&&game.time==='day')} className={`source-die ${d.color}`} onClick={()=>dispatch({type:'TAKE_SOURCE',id:d.id})} key={d.id}><span>◆</span><small>{d.color}</small></button>)}</div><p className="hint">One die per turn. Gold is wild by day; black powers spells at night.</p></Section>
        <Section title="Turn log"><div className="log">{game.log.map((l,i)=><p key={i}><span>R{l.round} T{l.turn}</span>{l.message}</p>)}</div></Section>
      </aside>
    </main>

    <section className="hand-panel"><div className="hand-heading"><div><span className="eyebrow">Your hand</span><h2>{game.player.hand.length} cards</h2></div><span>Click an action to commit a card. Strong actions consume matching mana.</span></div><div className="hand-scroll">{game.player.hand.map(card=><DeedCard card={card} key={card.uid} onPlay={play} onDiscard={discard} sideways={sideways} setSideways={setSideways}/>)}</div></section>
    {rulesOpen&&<div className="modal-backdrop" onClick={()=>setRulesOpen(false)}><div className="rules-modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setRulesOpen(false)}>×</button><span className="eyebrow">Rules reference</span><h2>Core turn rules</h2>{rulesSummary.map(([title,text])=><div className="rule" key={title}><b>{title}</b><p>{text}</p></div>)}<h2>All base sites</h2>{Object.entries(SITES).map(([id,site])=><div className="rule" key={id}><b>{site.name}</b><p>{site.rule}</p></div>)}<h2>{game.player.name} skills</h2>{(CHARACTER_PROFILES[game.player.character]?.skills||TOVAK_SKILLS).map(skill=><div className="rule" key={skill.id}><b>{skill.name}</b><p>{skill.description} ({skill.cadence==='round'?'Once per round':'Once per turn'})</p></div>)}</div></div>}
    {game.skillChoices.length>0&&<div className="modal-backdrop"><div className="rules-modal skill-choice"><span className="eyebrow">Level {game.player.level}</span><h2>Choose a {game.player.name} Skill</h2><p className="rule-note">Choose one. The other enters the Common Skills area; you also gain the lowest Advanced Action.</p>{game.skillChoices.map(skill=><button className="skill-option" key={skill.id} onClick={()=>dispatch({type:'SELECT_SKILL',id:skill.id})}><b>{skill.name}</b><span>{skill.description}</span></button>)}</div></div>}
    {game.phase==='tactic'&&<TacticPicker game={game} dispatch={dispatch}/>}
  </div>;
}

function Stat({label,value}){return <div className="stat"><span>{label}</span><b>{value}</b></div>}
function Section({title,children}){return <section className="side-section"><h3>{title}</h3>{children}</section>}
function phaseName(p){return ({tactic:'Choose tactic',action:'Action phase','combat-ranged':'Ranged / Siege','combat-block':'Block','combat-attack':'Attack','team-assault':'Joint city assault','pvp-ranged':'PvP ranged','pvp-melee':'PvP melee'})[p]||p}

function HexMap({game,moves,onHex,onCombat}){
  const size=40, ox=365, oy=215;
  const pos=h=>({x:ox+size*1.5*h.q,y:oy+size*Math.sqrt(3)*(h.r+h.q/2)});
  const points=(x,y)=>Array.from({length:6},(_,i)=>{const a=Math.PI/180*(60*i);return `${x+size*Math.cos(a)},${y+size*Math.sin(a)}`}).join(' ');
  return <svg className="hex-map" viewBox="0 0 740 470" role="img" aria-label="Mage Knight map"><defs><filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity=".35"/></filter></defs>{game.map.map(h=>{const hidden=h.revealed===false,{x,y}=pos(h),move=moves.get(`${h.q},${h.r}`),players=(game.players||[game.player]).filter(player=>h.q===player.q&&h.r===player.r);return <g key={`${h.q},${h.r}`} className={`hex ${hidden?'unrevealed':h.terrain} ${move?.legal?'reachable':''} ${!hidden&&h.enemy?'has-enemy':''}`} onClick={()=>onHex(h)}><polygon points={points(x,y)} filter="url(#shadow)"/><text className="terrain-icon" x={x} y={y+4}>{hidden?'?':terrainGlyph[h.terrain]}</text>{!hidden&&h.site&&<g><rect className="site-label-bg" x={x-34} y={y+18} width="68" height="15" rx="7"/><text className="site-label" x={x} y={y+29}>{h.site==='city'?`${h.cityColor} city`:siteNames[h.site]}</text></g>}{hidden&&<text className="cost" x={x+24} y={y-22}>2</text>}{!hidden&&h.enemy&&<g className="enemy" onClick={e=>{e.stopPropagation();onCombat(h)}}><circle cx={x} cy={y-9} r="12"/><text x={x} y={y-5}>⚔</text></g>}{h.conquered&&<text className="shield" x={x-24} y={y-20}>◆</text>}{players.map((player,index)=><g className={`hero-token ${player.id===game.viewerPlayerId?'mine':''}`} key={player.id||'solo'} transform={`translate(${(index-(players.length-1)/2)*18} 0)`}><circle cx={x} cy={y-7} r={players.length>1?12:17}/><text x={x} y={y-2}>{player.name?.[0]||'M'}</text></g>)}</g>})}</svg>
}

function DeedCard({card,onPlay,onDiscard,sideways,setSideways}){
  if(card.id==='wound')return <article className="deed wound"><div className="card-band"><span>Injury</span></div><h3>Wound</h3><div className="wound-mark">✦</div><p>Cannot be played. Heal it or discard it during a rest.</p></article>;
  const basicLabel=card.type==='spell'?`Cast · ${card.color} mana`:'Basic',strongLabel=card.type==='spell'?`Night · ${card.color} + black mana`:card.type==='artifact'?'Strong · throw away':`Strong · ${card.color} mana`;
  return <article className={`deed ${card.color}`}><div className="card-band"><span>{card.type||card.color}</span><i/></div><h3>{card.name}</h3><button onClick={()=>onPlay(card.uid,'basic')}><span>{basicLabel}</span><b>{effectText(card.basic)}</b></button><button className="strong" onClick={()=>onPlay(card.uid,'strong')}><span>{strongLabel}</span><b>{effectText(card.strong)}</b></button><button className="sideways" onClick={()=>setSideways(sideways===card.uid?null:card.uid)}>Play sideways · +1</button>{sideways===card.uid&&<div className="sideways-menu">{['move','influence','attack','block'].map(as=><button onClick={()=>onPlay(card.uid,'sideways',as)} key={as}>{as}</button>)}</div>}<button className="sideways" onClick={()=>onDiscard(card.uid)}>Discard</button></article>
}

function SkillControl({skill,dispatch}){
  const disabled=skill.used||skill.roundUsed;
  if(skill.id==='mana-overload')return <div className="skill-chip"><b>{skill.name}</b><span>{skill.description}</span><div>{['blue','red','green','white'].map(color=><button disabled={disabled} className={color} key={color} title={color} onClick={()=>dispatch({type:'USE_SKILL',id:skill.id,color})}>◆</button>)}</div></div>;
  if(skill.modes)return <div className="skill-chip"><b>{skill.name}</b><span>{skill.description}</span><div>{skill.modes.map(mode=><button disabled={disabled} key={mode} onClick={()=>dispatch({type:'USE_SKILL',id:skill.id,mode})}>{mode}</button>)}</div></div>;
  return <button className="unit-chip skill" disabled={disabled} onClick={()=>dispatch({type:'USE_SKILL',id:skill.id})}><b>{skill.name}</b><span>{skill.description}</span></button>;
}

function RewardPanel({game,dispatch}){
  const reward=game.pendingRewards[0];
  return <div className="reward-panel"><p className="phase-help"><b>{reward.source}</b> reward must be claimed.</p>{reward.type==='spell'&&game.offer.spells.map(card=><button key={card.id} onClick={()=>dispatch({type:'CLAIM_REWARD',id:card.id})}>Take {card.name}<span>{card.color} Spell</span></button>)}{reward.type==='artifact'&&game.decks.artifacts.map(card=><button key={card.id} onClick={()=>dispatch({type:'CLAIM_REWARD',id:card.id})}>Take {card.name}<span>Artifact</span></button>)}{reward.type==='crystals'&&<button className="primary" onClick={()=>dispatch({type:'CLAIM_REWARD',colors:['blue','red','green','white'].slice(0,reward.count)})}>Resolve {reward.count} crystal rolls<span>Deterministic basic-color result for this scenario</span></button>}</div>;
}

function Combat({game,dispatch}){const e=game.combat.enemy,assigned=new Set(game.combat.damageUnits||[]);return <div className="combat-card"><div className="enemy-title"><span>⚔</span><div><h3>{e.name}</h3><p>{e.traits.join(' · ')||'No abilities'}</p></div></div>{e.members?.map(member=><p className="hint" key={member.uid||member.id}>{member.name}: armor {member.armor}, attack {member.attack}, fame {member.fame}</p>)}<div className="enemy-stats"><span>Armor <b>{e.armor}</b></span><span>Attack <b>{e.attack}</b></span><span>Fame <b>{e.fame}</b></span></div>{game.phase==='combat-ranged'&&<><p>Spend Ranged or Siege Attack. Fortified enemies can only be targeted with Siege.</p><button className="primary wide" onClick={()=>dispatch({type:'RESOLVE_RANGED'})}>Resolve ranged phase</button></>}{game.phase==='combat-block'&&<><p>Generate enough Block or select unwounded Units that should absorb damage.</p>{game.player.units.filter(unit=>!unit.wounded).map(unit=><button key={unit.id} onClick={()=>dispatch({type:'ASSIGN_DAMAGE_UNIT',id:unit.id})}>{assigned.has(unit.id)?'✓ ':''}Assign damage to {unit.name}<span>Armor {unit.armor}</span></button>)}<button className="primary wide" onClick={()=>dispatch({type:'RESOLVE_BLOCK'})}>Resolve block and damage</button></>}{game.phase==='combat-attack'&&<><p>Generate Attack equal to total armor. Resistances halve matching attack types.</p><button className="primary wide" onClick={()=>dispatch({type:'RESOLVE_ATTACK'})}>Defeat defenders</button></>}</div>}

function TeamAssault({game,dispatch}){const assault=game.cooperativeAssault,mine=game.viewerPlayerId||game.player.id,eligible=assault.eligible.includes(mine),ready=assault.ready.includes(mine),leader=assault.leaderId===mine;return <div className="actions"><p className="phase-help"><b>Joint city assault</b> — each adjacent player may commit basic combat cards, then marks ready.</p>{eligible&&!ready&&game.player.hand.filter(card=>card.id!=='wound').map(card=><button key={card.uid} onClick={()=>dispatch({type:'TEAM_CONTRIBUTE',uid:card.uid})}>Contribute {card.name}<span>{effectText(card.basic)||'Attack +1 sideways'}</span></button>)}{eligible&&!ready&&<button className="primary" onClick={()=>dispatch({type:'TEAM_CONTRIBUTE',ready:true})}>Ready<span>No more contributions</span></button>}{ready&&<p className="hint">Contribution locked. Waiting for the party.</p>}{leader&&<button className="primary" onClick={()=>dispatch({type:'RESOLVE_COOPERATIVE_ASSAULT'})}>Resolve assault<span>{assault.ready.length}/{assault.eligible.length} players ready</span></button>}</div>}

function PvpPanel({game,dispatch}){const duel=game.pvp,mine=game.viewerPlayerId||game.player.id,isDefender=duel.defenderId===mine,isAttacker=duel.attackerId===mine,attacker=game.players.find(player=>player.id===duel.attackerId),retreats=isDefender?game.map.filter(hex=>hex.revealed!==false&&hexDistance(game.player,hex)===1&&hexDistance(attacker,hex)>1&&!['lake','mountain'].includes(hex.terrain)&&!game.players.some(player=>player.id!==mine&&player.q===hex.q&&player.r===hex.r)):[];return <div className="actions"><p className="phase-help"><b>{game.phase==='pvp-ranged'?'PvP ranged phase':'PvP melee phase'}</b> — the defender commits cards privately, retreats, or marks ready.</p>{isDefender&&!duel.defenderReady&&game.player.hand.filter(card=>card.id!=='wound').map(card=><button key={card.uid} onClick={()=>dispatch({type:'PVP_DEFEND',uid:card.uid})}>Commit {card.name}<span>{effectText(card.basic)||'Block +1 sideways'}</span></button>)}{isDefender&&!duel.defenderReady&&retreats.map(hex=><button key={`retreat-${hex.q}-${hex.r}`} onClick={()=>dispatch({type:'PVP_RETREAT',q:hex.q,r:hex.r})}>Retreat to {hex.q}, {hex.r}<span>Leave combat · Fame −1</span></button>)}{isDefender&&!duel.defenderReady&&<button className="primary" onClick={()=>dispatch({type:'PVP_DEFEND',ready:true})}>Ready<span>Lock defense for this phase</span></button>}{isDefender&&duel.defenderReady&&<p className="hint">Defense locked. Waiting for the attacker.</p>}{isAttacker&&<button className="primary" disabled={!duel.defenderReady} onClick={()=>dispatch({type:'RESOLVE_PVP'})}>Resolve phase<span>{duel.defenderReady?'Defender ready':'Waiting for defender'}</span></button>}</div>}

function ActionPanel({game,here,dispatch}){
  const canEndRound=!game.player.deck.length&&!game.player.hand.some(c=>c.id!=='wound');const city=here?.site==='city'&&here.conquered;
  const recruits=game.offer.units.filter(u=>(city&&here.cityColor==='white')||u.sites.includes(here?.site)||(city&&u.sites.includes('city')));
  return <div className="actions"><p className="phase-help">{here?.site?<><b>{siteNames[here.site]}</b> — {SITES[here.site].rule}</>:'Play cards, move, interact, or end your turn.'}</p>
    {game.player.tactic&&!game.player.tacticUsed&&<TacticAction game={game} dispatch={dispatch}/>}
    {SITES[here?.site]?.kind==='adventure'&&here.enemy&&<button className="danger-action" onClick={()=>dispatch({type:'START_COMBAT',q:here.q,r:here.r})}>Explore {siteNames[here.site]}<span>Fight {here.enemy.name}</span></button>}
    {here?.site==='ruins'&&here.ruinsToken?.type==='altar'&&!here.used&&<button onClick={()=>dispatch({type:'INTERACT',kind:'altar'})}>Invoke {here.ruinsToken.color} altar<span>{here.ruinsToken.color} mana · Fame +{here.ruinsToken.fame}</span></button>}
    {here?.site==='monastery'&&!here.burned&&<button className="danger-action" onClick={()=>dispatch({type:'BURN_MONASTERY'})}>Burn monastery<span>Combat · Reputation −3 · gain Artifact</span></button>}
    {here&&['village','monastery'].includes(here.site)&&<button onClick={()=>dispatch({type:'INTERACT',kind:'heal',count:1})}>Heal 1 Wound <span>{here.site==='monastery'?2:3} Influence</span></button>}
    {here?.site==='village'&&<button onClick={()=>dispatch({type:'INTERACT',kind:'plunder'})}>Plunder village <span>End turn · Reputation −1</span></button>}
    {(here?.site==='monastery'||(city&&here.cityColor==='green'))&&(here?.site==='monastery'?game.offer.monastery||[]:game.offer.advanced).map(card=><button key={card.id} onClick={()=>dispatch({type:'INTERACT',kind:'learn-advanced',id:card.id})}>Learn {card.name}<span>Advanced Action · 6 Influence</span></button>)}
    {((here?.site==='mage-tower'&&here.conquered)||(city&&here.cityColor==='blue'))&&game.offer.spells.map(card=><button key={card.id} onClick={()=>dispatch({type:'INTERACT',kind:'learn-spell',id:card.id})}>Learn {card.name}<span>7 Influence + {card.color} mana</span></button>)}
    {city&&here.cityColor==='red'&&<button onClick={()=>dispatch({type:'INTERACT',kind:'buy-artifact'})}>Buy Artifact<span>12 Influence</span></button>}
    {city&&here.cityColor==='white'&&<button onClick={()=>dispatch({type:'INTERACT',kind:'add-elite'})}>Add Elite Unit to offer<span>2 Influence</span></button>}
    {recruits.map(u=><button key={u.id} onClick={()=>dispatch({type:'INTERACT',kind:'recruit',id:u.id})}>Recruit {u.name}<span>{u.cost} Influence · armor {u.armor}</span></button>)}
    {game.player.wounds>0&&game.points.heal>0&&<button onClick={()=>dispatch({type:'SPEND_HEAL'})}>Heal Hero Wound<span>1 Heal</span></button>}{game.player.units.filter(unit=>unit.wounded&&game.points.heal>=(unit.level||1)).map(unit=><button key={`heal-${unit.id}`} onClick={()=>dispatch({type:'SPEND_HEAL',unitId:unit.id})}>Heal {unit.name}<span>{unit.level||1} Heal</span></button>)}
    {game.multiplayer&&game.scenario==='cooperative-conquest'&&game.map.filter(hex=>hex.revealed!==false&&hex.site==='city'&&hex.enemy&&hexDistance(game.player,hex)===1).map(hex=><button className="danger-action" key={`${hex.q}:${hex.r}`} onClick={()=>dispatch({type:'START_COOPERATIVE_ASSAULT',q:hex.q,r:hex.r})}>Joint assault: {hex.cityColor} city<span>Adjacent allies may contribute</span></button>)}
    {game.multiplayer&&game.scenario!=='cooperative-conquest'&&game.players.filter(player=>player.id!==game.player.id&&hexDistance(game.player,player)===1).map(player=><button className="danger-action" key={player.id} onClick={()=>dispatch({type:'INITIATE_PVP',targetId:player.id})}>Challenge {player.name}<span>Start player-versus-player combat</span></button>)}
    <button onClick={()=>dispatch({type:'REST'})}>Rest <span>Discard a Wound + card</span></button><button className="primary" onClick={()=>dispatch({type:canEndRound?'END_ROUND':'END_TURN'})}>{canEndRound?'End round':'End turn'}<span>{canEndRound?'Begin next day/night':'Discard played · draw up'}</span></button></div>
}

function TacticAction({game,dispatch}){const tactic=game.player.tactic;if(tactic.effect==='choice')return <><button onClick={()=>dispatch({type:'USE_TACTIC',mode:'move'})}>{tactic.name}: Move +2</button><button onClick={()=>dispatch({type:'USE_TACTIC',mode:'influence'})}>{tactic.name}: Influence +1</button></>;if(tactic.effect==='cycle')return <button onClick={()=>dispatch({type:'USE_TACTIC',uids:game.player.hand.filter(card=>card.id!=='wound').slice(0,2).map(card=>card.uid)})}>Use {tactic.name}<span>Cycle up to two cards</span></button>;if(tactic.effect==='mana'&&game.time==='night')return <div>{['blue','red','green','white'].map(color=><button key={color} onClick={()=>dispatch({type:'USE_TACTIC',color})}>{tactic.name}: {color} mana</button>)}</div>;if(['hand','draw','prepare'].includes(tactic.effect))return null;return <button onClick={()=>dispatch({type:'USE_TACTIC'})}>Use {tactic.name}<span>{tactic.description}</span></button>}

const hexDistance=(a,b)=>(Math.abs(a.q-b.q)+Math.abs(a.r-b.r)+Math.abs((-a.q-a.r)-(-b.q-b.r)))/2;

function TacticPicker({game,dispatch}){const mine=game.multiplayer&&game.tacticSelections?.[game.viewerPlayerId],myPick=!game.multiplayer||game.tacticPickerId===game.viewerPlayerId;const taken=new Set(Object.values(game.tacticSelections||{}).map(tactic=>tactic.id)),picker=game.players?.find(player=>player.id===game.tacticPickerId);return <div className="modal-backdrop tactic-backdrop"><div className="tactic-modal"><span className={`orb ${game.time}`}>{game.time==='day'?'☀':'☾'}</span><span className="eyebrow">{game.time} {Math.ceil(game.round/2)} · Round {game.round}</span><h2>{mine?'Tactic locked in':myPick?'Choose your tactic':`Waiting for ${picker?.name||'player'}`}</h2><p>{mine?`You chose ${mine.name}. Waiting for the other players.`:myPick?'Lowest Fame chooses first; the number sets initiative.':'Tactics are selected in Fame order.'}</p><div className="tactic-grid">{TACTICS[game.time].map(tactic=><button disabled={!myPick||Boolean(mine)||taken.has(tactic.id)} key={tactic.id} onClick={()=>dispatch({type:'SELECT_TACTIC',id:tactic.id})}><i>{tactic.number}</i><b>{tactic.name}</b><span>{taken.has(tactic.id)?'Already chosen':tactic.description}</span></button>)}</div></div></div>}

export default GameComponent;
