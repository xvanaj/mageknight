import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Peer } from 'peerjs';
import GameComponent from '../game/GameComponent';
import { createMultiplayerGame, gameViewForPlayer, reduceGame } from '../../gameEngine';
import { canStartLobby, CHARACTERS, createLobby, makeGameId, SCENARIOS, updateLobby } from './lobbyState';

const playerId = () => {
  const saved = sessionStorage.getItem('mk-player-id');
  if (saved) return saved;
  const id = `player-${makeGameId()}-${Date.now().toString(36)}`;
  sessionStorage.setItem('mk-player-id', id);
  return id;
};

const inviteFor = gameId => {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('game', gameId);
  return url.toString();
};

const loadHostSession=gameId=>{try{return JSON.parse(localStorage.getItem(`mk-host-session-${gameId}`))}catch{return null}};

export default function LobbyScreen({ route, onCreate, onExit }) {
  const restored=useMemo(()=>route.isHost&&route.gameId?loadHostSession(route.gameId):null,[route.isHost,route.gameId]);
  const [name, setName] = useState(() => localStorage.getItem('mk-player-name') || '');
  const [joined, setJoined] = useState(route.isHost);
  const [copied, setCopied] = useState(false);
  const [connection, setConnection] = useState(route.isHost ? 'Opening lobby…' : 'Enter your name to join');
  const [reconnectAttempt,setReconnectAttempt]=useState(0);
  const localId = useMemo(()=>{const id=restored?.lobby?.players?.find(player=>player.isHost)?.id||playerId();sessionStorage.setItem('mk-player-id',id);return id}, [restored]);
  const [lobby, setLobby] = useState(() => restored?.lobby||(route.isHost ? createLobby(route.gameId, { id: localId, name: name.trim() || 'Host' }) : null));
  const [gameState,setGameState]=useState(()=>restored?.game||null);
  const peerRef = useRef(null);
  const hostConnectionRef = useRef(null);
  const connectionsRef = useRef(new Map());
  const channelRef = useRef(null);
  const gameRef=useRef(null);

  const applyHostAction = useCallback(action => setLobby(current => updateLobby(current, action)), []);
  const leave=()=>{if(route.isHost&&route.gameId)localStorage.removeItem(`mk-host-session-${route.gameId}`);onExit?.()};

  useEffect(()=>{if(route.isHost&&route.gameId&&lobby)localStorage.setItem(`mk-host-session-${route.gameId}`,JSON.stringify({lobby,game:gameState}));},[route.isHost,route.gameId,lobby,gameState]);

  useEffect(() => {
    if (!route.gameId) return undefined;
    const channel = process.env.NODE_ENV !== 'test' && typeof BroadcastChannel === 'function' ? new BroadcastChannel(`mk-lobby-${route.gameId}`) : null;
    channelRef.current = channel;
    if (channel) channel.onmessage = event => {
      if (route.isHost && event.data?.kind === 'action') applyHostAction(event.data.action);
      if (!route.isHost && event.data?.kind === 'state') setLobby(event.data.lobby);
      if(route.isHost&&event.data?.kind==='game-action')setGameState(current=>reduceGame(current,{...event.data.action,playerId:event.data.playerId}));
      if(!route.isHost&&event.data?.kind==='game-state'&&event.data.targetId===localId)setGameState(event.data.game);
    };
    return () => channel?.close();
  }, [route.gameId, route.isHost, localId, applyHostAction]);

  useEffect(() => {
    if (!route.gameId || process.env.NODE_ENV === 'test') {
      setConnection(route.isHost ? 'Lobby open · local-tab mode' : joined ? 'Searching for host on this device…' : 'Enter your name to join');
      return undefined;
    }
    const peer = route.isHost ? new Peer(`mage-knight-${route.gameId.toLowerCase()}`) : new Peer();
    let disposed=false;let reconnectTimer;
    peerRef.current = peer;
    const connections = connectionsRef.current;
    const bindHostConnection = dataConnection => {
      dataConnection.on('data', message => {
        if(message?.kind==='action'){
          if (message.action?.type === 'JOIN') {dataConnection.playerId = message.action.player.id;if(gameRef.current)dataConnection.send({kind:'game-state',game:gameViewForPlayer(gameRef.current,dataConnection.playerId)});}
          applyHostAction(message.action);return;
        }
        if(message?.kind==='game-action'&&dataConnection.playerId===message.playerId)setGameState(current=>reduceGame(current,{...message.action,playerId:message.playerId}));
      });
      dataConnection.on('open', () => connections.set(dataConnection.peer, dataConnection));
      dataConnection.on('close', () => {
        connections.delete(dataConnection.peer);
        if (dataConnection.playerId) applyHostAction({ type: 'DISCONNECT', playerId: dataConnection.playerId });
      });
    };
    if (route.isHost) {
      peer.on('open', () => setConnection('Lobby online · waiting for players'));
      peer.on('connection', bindHostConnection);
    } else {
      peer.on('open', () => {
        const dataConnection = peer.connect(`mage-knight-${route.gameId.toLowerCase()}`, { reliable: true });
        hostConnectionRef.current = dataConnection;
        dataConnection.on('open', () => {
          setConnection('Connected to host');
          if (joined) dataConnection.send({ kind: 'action', action: { type: 'JOIN', player: { id: localId, name: name.trim() || 'Player' } } });
        });
        dataConnection.on('data', message => { if (message?.kind === 'state') setLobby(message.lobby);if(message?.kind==='game-state')setGameState(message.game); });
        dataConnection.on('close', () => {setConnection('Host disconnected · reconnecting…');if(!disposed)reconnectTimer=setTimeout(()=>setReconnectAttempt(value=>value+1),2000)});
        dataConnection.on('error', () => setConnection('Could not connect to host'));
      });
    }
    peer.on('error', error => setConnection(error.type === 'unavailable-id' ? 'This lobby is already open in another host window' : 'Peer connection unavailable'));
    return () => { disposed=true;clearTimeout(reconnectTimer);peer.destroy(); peerRef.current = null; connections.clear(); };
  }, [route.gameId, route.isHost, joined, localId, name, reconnectAttempt, applyHostAction]);

  useEffect(() => {
    if (!route.isHost || !lobby) return;
    const message = { kind: 'state', lobby };
    channelRef.current?.postMessage(message);
    connectionsRef.current.forEach(dataConnection => { if (dataConnection.open) dataConnection.send(message); });
  }, [lobby, route.isHost]);

  useEffect(() => {
    if(route.isHost&&lobby?.status==='playing'&&!gameRef.current)setGameState(createMultiplayerGame(lobby,parseInt(lobby.id,36)||Date.now()));
  },[lobby,route.isHost]);

  useEffect(()=>{
    gameRef.current=gameState;if(!route.isHost||!gameState)return;
    connectionsRef.current.forEach(dataConnection=>{if(dataConnection.open&&dataConnection.playerId)dataConnection.send({kind:'game-state',game:gameViewForPlayer(gameState,dataConnection.playerId)});});
    gameState.players.forEach(player=>channelRef.current?.postMessage({kind:'game-state',targetId:player.id,game:gameViewForPlayer(gameState,player.id)}));
  },[gameState,route.isHost]);

  const sendAction = action => {
    if (route.isHost) applyHostAction(action);
    else {
      if(hostConnectionRef.current?.open)hostConnectionRef.current.send({ kind: 'action', action });
      else channelRef.current?.postMessage({ kind: 'action', action });
    }
  };

  const sendGameAction=action=>{
    if(route.isHost)setGameState(current=>reduceGame(current,{...action,playerId:localId}));
    else {if(hostConnectionRef.current?.open)hostConnectionRef.current.send({kind:'game-action',playerId:localId,action});else channelRef.current?.postMessage({kind:'game-action',playerId:localId,action});}
  };

  const join = event => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    localStorage.setItem('mk-player-name', cleanName);
    setJoined(true);
    setConnection('Connecting to host…');
    const action = { type: 'JOIN', player: { id: localId, name: cleanName } };
    if(hostConnectionRef.current?.open)hostConnectionRef.current.send({ kind: 'action', action });
    else channelRef.current?.postMessage({ kind: 'action', action });
  };

  if (!route.gameId) return <NewGamePanel name={name} setName={setName} onCreate={onCreate} />;
  if (!route.isHost && !joined) return <JoinPanel gameId={route.gameId} name={name} setName={setName} join={join} onExit={leave} />;

  if(lobby?.status==='playing'){
    const view=route.isHost?gameViewForPlayer(gameState,localId):gameState;
    if(!view)return <div className="entry-shell"><LobbyHeader onExit={leave}/><main className="entry-card"><span className="entry-rune">MK</span><span className="eyebrow">Synchronizing</span><h1>Preparing the shared game</h1><p>{connection}</p></main></div>;
    return <GameComponent session={{...lobby,currentPlayerId:localId}} multiplayerGame={view} onGameAction={sendGameAction} onLeaveGame={leave} networkStatus={connection}/>;
  }

  const me = lobby?.players.find(player => player.id === localId);
  const selectedCharacters = new Set(lobby?.players.map(player => player.character).filter(Boolean) || []);
  const invite = inviteFor(route.gameId);
  const scenario = SCENARIOS.find(item => item.id === lobby?.scenario);

  return <div className="lobby-shell">
    <LobbyHeader onExit={leave} />
    <main className="lobby-layout">
      <section className="lobby-main">
        <div className="lobby-title-row"><div><span className="eyebrow">Game lobby · {route.gameId}</span><h1>Gather your Mage Knights</h1><p>{connection}</p></div><span className={`connection-light ${connection.includes('unavailable') || connection.includes('disconnected') ? 'offline' : ''}`} /></div>
        {route.isHost && <section className="invite-card"><div><span className="step-number">1</span><div><b>Invite your party</b><p>Send this link to the other players. Keep this tab open while they connect.</p></div></div><div className="invite-field"><input readOnly value={invite}/><button onClick={async()=>{await navigator.clipboard?.writeText(invite);setCopied(true);setTimeout(()=>setCopied(false),1800)}}>{copied?'Copied':'Copy link'}</button></div></section>}
        <section className="lobby-section"><div className="section-heading"><div><span className="step-number">{route.isHost?'2':'1'}</span><div><h2>Choose your character</h2><p>Each Mage Knight can be claimed by one player.</p></div></div><span>{selectedCharacters.size}/{CHARACTERS.length} claimed</span></div><div className="character-grid">{CHARACTERS.map(character=>{const owner=lobby?.players.find(player=>player.character===character.id);const mine=owner?.id===localId;return <button key={character.id} disabled={Boolean(owner&&!mine)||me?.ready} className={`character-card ${character.color} ${mine?'selected':''}`} onClick={()=>sendAction({type:'SELECT_CHARACTER',playerId:localId,character:character.id})}><span className="character-sigil">{character.name[0]}</span><b>{character.name}</b><small>{character.title}</small>{owner&&<i>{mine?'Your character':`Claimed by ${owner.name}`}</i>}</button>})}</div></section>
      </section>
      <aside className="lobby-sidebar">
        <section className="lobby-side-card"><span className="eyebrow">Scenario</span>{route.isHost?<select value={lobby?.scenario||SCENARIOS[0].id} onChange={event=>sendAction({type:'SET_SCENARIO',scenario:event.target.value})}>{SCENARIOS.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>:<h2>{scenario?.name}</h2>}<p>{scenario?.detail}</p>{!route.isHost&&<small>Only the host can change the scenario.</small>}</section>
        <section className="lobby-side-card party-card"><div className="party-heading"><span className="eyebrow">Party</span><b>{lobby?.players.length||0}/4</b></div>{lobby?.players.map(player=>{const character=CHARACTERS.find(item=>item.id===player.character);return <div className={`party-member ${player.ready?'ready':''}`} key={player.id}><span className={`member-avatar ${character?.color||''}`}>{character?.name[0]||player.name[0]?.toUpperCase()}</span><div><b>{player.name}{player.isHost&&<em>Host</em>}</b><small>{character?.name||'Choosing a character…'}</small></div><i>{player.ready?'Ready':player.connected?'Not ready':'Offline'}</i></div>})}</section>
        <button className={`ready-button ${me?.ready?'is-ready':''}`} disabled={!me?.character} onClick={()=>sendAction({type:'SET_READY',playerId:localId,ready:!me?.ready})}>{me?.ready?'Ready ✓':'I’m ready'}<span>{me?.character?'Lock in your selection':'Choose a character first'}</span></button>
        {route.isHost&&<button className="start-button" disabled={!canStartLobby(lobby)} onClick={()=>sendAction({type:'START'})}>Start game<span>{canStartLobby(lobby)?'Begin the conquest':lobby?.players.length===1?'Choose a character and ready up':'Waiting for everyone to be ready'}</span></button>}
      </aside>
    </main>
  </div>;
}

function NewGamePanel({name,setName,onCreate}) {
  const submit=event=>{event.preventDefault();const clean=name.trim();if(!clean)return;localStorage.setItem('mk-player-name',clean);onCreate(clean)};
  return <div className="entry-shell"><LobbyHeader/><main className="entry-card"><span className="entry-rune">MK</span><span className="eyebrow">Online conquest</span><h1>Create a new game</h1><p>Play solo or host a private lobby for up to four players. Choose characters and begin when everyone is ready.</p><form onSubmit={submit}><label>Your name<input autoFocus maxLength="24" value={name} onChange={event=>setName(event.target.value)} placeholder="Enter your name"/></label><button type="submit" disabled={!name.trim()}>Create game<span>Generate an invite link</span></button></form></main></div>;
}

function JoinPanel({gameId,name,setName,join,onExit}) { return <div className="entry-shell"><LobbyHeader onExit={onExit}/><main className="entry-card"><span className="entry-rune">{gameId.slice(0,2)}</span><span className="eyebrow">Invitation · {gameId}</span><h1>Join the game</h1><p>The host is waiting. Enter the name the party will see, then choose your Mage Knight.</p><form onSubmit={join}><label>Your name<input autoFocus maxLength="24" value={name} onChange={event=>setName(event.target.value)} placeholder="Enter your name"/></label><button type="submit" disabled={!name.trim()}>Join lobby<span>Connect to the host</span></button></form></main></div> }

function LobbyHeader({onExit}) { return <header className="lobby-header"><div className="brand"><span className="brand-mark">MK</span><div><h1>Mage Knight</h1><span>Multiplayer Conquest</span></div></div>{onExit&&<button onClick={onExit}>Leave lobby</button>}</header> }
