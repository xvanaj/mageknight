import React, { useMemo, useState } from 'react';
import { createGame, legalMoves, reduceGame, rulesSummary, SITES, TOVAK_SKILLS } from '../../gameEngine';
import '../../App.css';

const siteNames = Object.fromEntries(Object.entries(SITES).map(([id,site])=>[id,site.name]));
const terrainGlyph = { plains:'·', forest:'♣', hills:'⌁', desert:'☀', wasteland:'◇', swamp:'≈', lake:'≋', mountain:'▲' };
const effectText = effect => Object.entries(effect).map(([k,v]) => {
  if (k === 'mana') return v === 'crystal' ? 'gain a crystal' : 'gain mana';
  if (k === 'discardRequired') return null;
  return `${k[0].toUpperCase()+k.slice(1)} ${typeof v === 'number' && v > 0 ? '+' : ''}${v}`;
}).filter(Boolean).join(' · ');

function GameComponent() {
  const [game, setGame] = useState(() => {
    try { const saved=localStorage.getItem('mage-knight-save');const parsed=saved&&JSON.parse(saved);return parsed?.version===2?parsed:createGame(); } catch { return createGame(); }
  });
  const [rulesOpen,setRulesOpen]=useState(false);
  const [sideways,setSideways]=useState(null);
  const dispatch = action => setGame(old => reduceGame(old, action));
  const moves = useMemo(() => new Map(legalMoves(game).map(h=>[`${h.q},${h.r}`,h])),[game]);
  const here=game.map.find(h=>h.q===game.player.q&&h.r===game.player.r);
  const save=()=>{localStorage.setItem('mage-knight-save',JSON.stringify(game)); setGame(g=>({...g,error:null,log:[{turn:g.turn,round:g.round,message:'Game saved in this browser.'},...g.log]}));};
  const fresh=()=>{if(window.confirm('Start a new Solo Conquest? Your current position will be replaced.')){localStorage.removeItem('mage-knight-save');setGame(createGame(Date.now()));}};
  const play=(uid,mode,as)=>{dispatch({type:'PLAY_CARD',uid,mode,as});setSideways(null);};
  const hexClick=hex=>{const move=moves.get(`${hex.q},${hex.r}`);if(move?.legal)dispatch({type:'MOVE',q:hex.q,r:hex.r});};
  const combat=game.combat?.enemy;

  return <div className="game-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">MK</span><div><h1>Mage Knight</h1><span>Solo Conquest rules engine</span></div></div>
      <div className="round-indicator"><span className={`orb ${game.time}`}>{game.time==='day'?'☀':'☾'}</span><div><b>{game.time} {Math.ceil(game.round/2)}</b><small>Round {game.round} of 6 · Turn {game.turn}</small></div></div>
      <div className="top-actions"><button onClick={save}>Save</button><button onClick={()=>setRulesOpen(true)}>Rules</button><button onClick={fresh}>New game</button></div>
    </header>

    <main className="game-grid">
      <aside className="hero-panel panel">
        <div className="hero-name"><div className="portrait">T</div><div><h2>{game.player.name}</h2><span>Level {game.player.level} Mage Knight</span></div></div>
        <div className="track-grid"><Stat label="Fame" value={game.player.fame}/><Stat label="Reputation" value={game.player.reputation}/><Stat label="Armor" value={game.player.armor}/><Stat label="Command" value={`${game.player.units.length}/${game.player.command}`}/></div>
        <div className="fame-track"><i style={{width:`${Math.min(100,game.player.fame/99*100)}%`}}/><span>Next level: {game.player.level===10?'—':[3,8,15,24,35,48,63,80,99][game.player.level-1]}</span></div>
        <Section title="Action power"><div className="power-grid">{Object.entries(game.points).map(([k,v])=><div className={v?'lit':''} key={k}><span>{k}</span><b>{v}</b></div>)}</div></Section>
        <Section title="Mana inventory"><div className="mana-row">{Object.entries(game.player.crystals).map(([c,n])=><span className={`mana ${c}`} title={`${c} crystals`} key={c}>{n}</span>)}{game.mana.map((c,i)=><span className={`mana token ${c}`} key={`${c}${i}`}>•</span>)}</div></Section>
        <Section title={`Tovak skills (${game.player.skills.length}/10)`}>{game.player.skills.length===0?<p className="muted">Skills are offered at levels 2, 4, and 6.</p>:game.player.skills.map(skill=><SkillControl key={skill.id} skill={skill} dispatch={dispatch}/>)}</Section>
        <Section title={`Units (${game.player.units.length}/${game.player.command})`}>{game.player.units.length===0?<p className="muted">No units recruited.</p>:game.player.units.map(u=><button className="unit-chip" disabled={u.spent} onClick={()=>dispatch({type:'USE_UNIT',id:u.id})} key={u.id}><b>{u.name}</b><span>{effectText(u.ability)} · Armor {u.armor}</span></button>)}</Section>
        <Section title="Deed deck"><div className="deck-counts"><span><b>{game.player.deck.length}</b> deck</span><span><b>{game.player.discard.length}</b> discard</span><span><b>{game.player.wounds}</b> wounds</span></div></Section>
      </aside>

      <section className="board-panel panel">
        <div className="board-heading"><div><span className="eyebrow">Atlantean Empire</span><h2>{here ? `${siteNames[here.site]||here.terrain} · ${here.q}, ${here.r}`:'Wilderness'}</h2></div><div className="legend"><span><i className="dot legal"/>reachable</span><span><i className="dot hostile"/>hostile</span></div></div>
        <HexMap game={game} moves={moves} onHex={hexClick} onCombat={(h)=>dispatch({type:'START_COMBAT',q:h.q,r:h.r})}/>
        {game.error&&<div className="toast error"><b>Illegal action</b>{game.error}<button onClick={()=>setGame(g=>({...g,error:null}))}>×</button></div>}
        {game.status!=='playing'&&<div className={`end-banner ${game.status}`}><h2>{game.status==='won'?'City conquered':'Time has run out'}</h2><p>{game.status==='won'?`Victory with ${game.player.fame} Fame.`:'The city remains unconquered after Night 3.'}</p><button onClick={fresh}>Play again</button></div>}
      </section>

      <aside className="turn-panel panel">
        <span className="eyebrow">Current phase</span><h2>{phaseName(game.phase)}</h2>
        {combat?<Combat game={game} dispatch={dispatch}/>:game.pendingRewards.length?<RewardPanel game={game} dispatch={dispatch}/>:<ActionPanel game={game} here={here} dispatch={dispatch}/>}
        <Section title="Mana source"><div className="source">{game.source.map(d=><button disabled={game.sourceTaken||(d.color==='black'&&game.time==='day')} className={`source-die ${d.color}`} onClick={()=>dispatch({type:'TAKE_SOURCE',id:d.id})} key={d.id}><span>◆</span><small>{d.color}</small></button>)}</div><p className="hint">One die per turn. Gold is wild by day; black powers spells at night.</p></Section>
        <Section title="Turn log"><div className="log">{game.log.map((l,i)=><p key={i}><span>R{l.round} T{l.turn}</span>{l.message}</p>)}</div></Section>
      </aside>
    </main>

    <section className="hand-panel"><div className="hand-heading"><div><span className="eyebrow">Your hand</span><h2>{game.player.hand.length} cards</h2></div><span>Click an action to commit a card. Strong actions consume matching mana.</span></div><div className="hand-scroll">{game.player.hand.map(card=><DeedCard card={card} key={card.uid} onPlay={play} sideways={sideways} setSideways={setSideways}/>)}</div></section>
    {rulesOpen&&<div className="modal-backdrop" onClick={()=>setRulesOpen(false)}><div className="rules-modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setRulesOpen(false)}>×</button><span className="eyebrow">Rules reference</span><h2>Core turn rules</h2>{rulesSummary.map(([title,text])=><div className="rule" key={title}><b>{title}</b><p>{text}</p></div>)}<h2>All base sites</h2>{Object.entries(SITES).map(([id,site])=><div className="rule" key={id}><b>{site.name}</b><p>{site.rule}</p></div>)}<h2>Tovak skills</h2>{TOVAK_SKILLS.map(skill=><div className="rule" key={skill.id}><b>{skill.name}</b><p>{skill.description} ({skill.cadence==='round'?'Once per round':'Once per turn'})</p></div>)}<p className="rule-note">This screen is a concise play aid. Site and combat prompts enforce the corresponding legality checks.</p></div></div>}
    {game.skillChoices.length>0&&<div className="modal-backdrop"><div className="rules-modal skill-choice"><span className="eyebrow">Level {game.player.level}</span><h2>Choose a Tovak Skill</h2><p className="rule-note">Choose one. The other enters the Common Skills area; you also gain the lowest Advanced Action.</p>{game.skillChoices.map(skill=><button className="skill-option" key={skill.id} onClick={()=>dispatch({type:'SELECT_SKILL',id:skill.id})}><b>{skill.name}</b><span>{skill.description}</span></button>)}</div></div>}
  </div>;
}

function Stat({label,value}){return <div className="stat"><span>{label}</span><b>{value}</b></div>}
function Section({title,children}){return <section className="side-section"><h3>{title}</h3>{children}</section>}
function phaseName(p){return ({action:'Action phase','combat-ranged':'Ranged / Siege','combat-block':'Block','combat-attack':'Attack'})[p]||p}

function HexMap({game,moves,onHex,onCombat}){
  const size=40, ox=365, oy=215;
  const pos=h=>({x:ox+size*1.5*h.q,y:oy+size*Math.sqrt(3)*(h.r+h.q/2)});
  const points=(x,y)=>Array.from({length:6},(_,i)=>{const a=Math.PI/180*(60*i);return `${x+size*Math.cos(a)},${y+size*Math.sin(a)}`}).join(' ');
  return <svg className="hex-map" viewBox="0 0 740 470" role="img" aria-label="Mage Knight map"><defs><filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity=".35"/></filter></defs>{game.map.map(h=>{const {x,y}=pos(h), move=moves.get(`${h.q},${h.r}`), player=h.q===game.player.q&&h.r===game.player.r;return <g key={`${h.q},${h.r}`} className={`hex ${h.terrain} ${move?.legal?'reachable':''} ${h.enemy?'has-enemy':''}`} onClick={()=>onHex(h)}><polygon points={points(x,y)} filter="url(#shadow)"/><text className="terrain-icon" x={x} y={y+4}>{terrainGlyph[h.terrain]}</text>{h.site&&<g><rect className="site-label-bg" x={x-34} y={y+18} width="68" height="15" rx="7"/><text className="site-label" x={x} y={y+29}>{h.site==='city'?`${h.cityColor} city`:siteNames[h.site]}</text></g>}{move&&<text className="cost" x={x+24} y={y-22}>{move.cost}</text>}{h.enemy&&<g className="enemy" onClick={e=>{e.stopPropagation();onCombat(h)}}><circle cx={x} cy={y-9} r="12"/><text x={x} y={y-5}>⚔</text></g>}{h.conquered&&<text className="shield" x={x-24} y={y-20}>◆</text>}{player&&<g className="hero-token"><circle cx={x} cy={y-7} r="17"/><text x={x} y={y-1}>T</text></g>}</g>})}</svg>
}

function DeedCard({card,onPlay,sideways,setSideways}){
  if(card.id==='wound')return <article className="deed wound"><div className="card-band"><span>Injury</span></div><h3>Wound</h3><div className="wound-mark">✦</div><p>Cannot be played. Heal it or discard it during a rest.</p></article>;
  return <article className={`deed ${card.color}`}><div className="card-band"><span>{card.color}</span><i/></div><h3>{card.name}</h3><button onClick={()=>onPlay(card.uid,'basic')}><span>Basic</span><b>{effectText(card.basic)}</b></button><button className="strong" onClick={()=>onPlay(card.uid,'strong')}><span>Strong · {card.color} mana</span><b>{effectText(card.strong)}</b></button><button className="sideways" onClick={()=>setSideways(sideways===card.uid?null:card.uid)}>Play sideways · +1</button>{sideways===card.uid&&<div className="sideways-menu">{['move','influence','attack','block'].map(as=><button onClick={()=>onPlay(card.uid,'sideways',as)} key={as}>{as}</button>)}</div>}</article>
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

function Combat({game,dispatch}){const e=game.combat.enemy;return <div className="combat-card"><div className="enemy-title"><span>⚔</span><div><h3>{e.name}</h3><p>{e.traits.join(' · ')||'No abilities'}</p></div></div><div className="enemy-stats"><span>Armor <b>{e.armor}</b></span><span>Attack <b>{e.attack}</b></span><span>Fame <b>{e.fame}</b></span></div>{game.phase==='combat-ranged'&&<><p>Spend Ranged or Siege Attack. Fortified enemies can only be targeted with Siege.</p><button className="primary wide" onClick={()=>dispatch({type:'RESOLVE_RANGED'})}>Resolve ranged phase</button></>}{game.phase==='combat-block'&&<><p>Generate enough Block to stop the entire attack, or take Wounds.</p><button className="primary wide" onClick={()=>dispatch({type:'RESOLVE_BLOCK'})}>Resolve block phase</button></>}{game.phase==='combat-attack'&&<><p>Generate Attack equal to its armor. Physical resistance doubles the requirement.</p><button className="primary wide" onClick={()=>dispatch({type:'RESOLVE_ATTACK'})}>Defeat enemy</button></>}</div>}

function ActionPanel({game,here,dispatch}){
  const canEndRound=!game.player.deck.length&&!game.player.hand.some(c=>c.id!=='wound');const city=here?.site==='city'&&here.conquered;
  const recruits=game.offer.units.filter(u=>(city&&here.cityColor==='white')||u.sites.includes(here?.site)||(city&&u.sites.includes('city')));
  return <div className="actions"><p className="phase-help">{here?.site?<><b>{siteNames[here.site]}</b> — {SITES[here.site].rule}</>:'Play cards, move, interact, or end your turn.'}</p>
    {SITES[here?.site]?.kind==='adventure'&&here.enemy&&<button className="danger-action" onClick={()=>dispatch({type:'START_COMBAT',q:here.q,r:here.r})}>Explore {siteNames[here.site]}<span>Fight {here.enemy.name}</span></button>}
    {here?.site==='monastery'&&!here.burned&&<button className="danger-action" onClick={()=>dispatch({type:'BURN_MONASTERY'})}>Burn monastery<span>Combat · Reputation −3 · gain Artifact</span></button>}
    {here&&['village','monastery'].includes(here.site)&&<button onClick={()=>dispatch({type:'INTERACT',kind:'heal',count:1})}>Heal 1 Wound <span>{here.site==='monastery'?2:3} Influence</span></button>}
    {here?.site==='village'&&<button onClick={()=>dispatch({type:'INTERACT',kind:'plunder'})}>Plunder village <span>End turn · Reputation −1</span></button>}
    {(here?.site==='monastery'||(city&&here.cityColor==='green'))&&game.offer.advanced.map(card=><button key={card.id} onClick={()=>dispatch({type:'INTERACT',kind:'learn-advanced',id:card.id})}>Learn {card.name}<span>Advanced Action · 6 Influence</span></button>)}
    {((here?.site==='mage-tower'&&here.conquered)||(city&&here.cityColor==='blue'))&&game.offer.spells.map(card=><button key={card.id} onClick={()=>dispatch({type:'INTERACT',kind:'learn-spell',id:card.id})}>Learn {card.name}<span>7 Influence + {card.color} mana</span></button>)}
    {city&&here.cityColor==='red'&&<button onClick={()=>dispatch({type:'INTERACT',kind:'buy-artifact'})}>Buy Artifact<span>12 Influence</span></button>}
    {city&&here.cityColor==='white'&&<button onClick={()=>dispatch({type:'INTERACT',kind:'add-elite'})}>Add Elite Unit to offer<span>2 Influence</span></button>}
    {recruits.map(u=><button key={u.id} onClick={()=>dispatch({type:'INTERACT',kind:'recruit',id:u.id})}>Recruit {u.name}<span>{u.cost} Influence · armor {u.armor}</span></button>)}
    <button onClick={()=>dispatch({type:'REST'})}>Rest <span>Discard a Wound + card</span></button><button className="primary" onClick={()=>dispatch({type:canEndRound?'END_ROUND':'END_TURN'})}>{canEndRound?'End round':'End turn'}<span>{canEndRound?'Begin next day/night':'Discard played · draw up'}</span></button></div>
}

export default GameComponent;
