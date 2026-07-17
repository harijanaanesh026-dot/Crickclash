import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD9BfrAh8djKof1Bu6FLG0Fz7X10NCdm6g",
  authDomain: "crickclash-d30fe.firebaseapp.com",
  databaseURL: "https://crickclash-d30fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crickclash-d30fe",
  storageBucket: "crickclash-d30fe.firebasestorage.app",
  messagingSenderId: "595133866613",
  appId: "1:595133866613:web:dda3f0509462310cb74e3c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();
const DAILY_VOTE_LIMIT = 5;

const ALL_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=VK' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=RS' },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://via.placeholder.com/150/008000/FFFFFF?text=JB' },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://via.placeholder.com/150/800080/FFFFFF?text=HP' },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://via.placeholder.com/150/FFA500/FFFFFF?text=MSD' },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState(ALL_PLAYERS);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle'); // IMPORTANT
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const [coins, setCoins] = useState(100);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showSpin, setShowSpin] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [collectedCards, setCollectedCards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const generateBattle = useCallback((playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) p2 = filtered[Math.floor(Math.random() * filtered.length)];
    setBattle([p1, p2]);
  }, []);

  const checkDailyReset = async () => {
    const lastResetRef = ref(db, 'system/lastReset');
    const snap = await get(lastResetRef);
    const today = new Date().toISOString().split('T')[0];
    if(snap.val()!== today){
      const updates = {};
      ALL_PLAYERS.forEach(p => { updates[`players/${p.id}/votes`] = 0; });
      await update(ref(db), updates);
      await set(lastResetRef, today);
    }
  }

  useEffect(() => {
    checkDailyReset();
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const today = new Date().toISOString().split('T')[0];
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val() || {};
          if(userData.lastVoteDate!== today){ update(userRef, {votesToday: 0, lastVoteDate: today}); }
          setVotesToday(userData.votesToday || 0);
          setStreak(userData.streak || 0);
          setBadges(userData.badges || []);
          setBattleHistory(userData.history || []);
          setCoins(userData.coins || 100);
          setXp(userData.xp || 0);
          setLevel(userData.level || 1);
          setCollectedCards(userData.cards || []);
          setCanSpin(userData.lastSpin!== today);
        });
        onValue(ref(db, 'users'), (snap) => {
          const data = snap.val() || {};
          setLeaderboard(Object.entries(data).map(([uid, d]) => ({uid, name: d.name || 'Player',...d})).sort((a,b) => (b.xp||0) - (a.xp||0)).slice(0, 10));
        })
      }
    });
    onValue(ref(db, 'players'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setPlayers(playersArray);
        const sorted = [...playersArray].sort((a,b) => (b.votes||0) - (a.votes||0));
        setTopPlayer(sorted[0]);
        setTotalVotes(sorted.reduce((sum, p) => sum + (p.votes||0), 0));
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(ref(db, 'players'), initialPlayers);
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle]);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { await signOut(auth); setShowProfile(false); };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert("Link Copied!"); };

  const addXpAndCoins = async () => {
    if(!user) return;
    const newXp = xp + 10;
    const newLevel = Math.floor(newXp / 100) + 1;
    const newCoins = coins + 5;
    setXp(newXp); setLevel(newLevel); setCoins(newCoins);
    await update(ref(db, `users/${user.uid}`), {xp: newXp, level: newLevel, coins: newCoins});
  }

  const handleSpin = async () => {
    if(!canSpin) return alert("Tomorrow 🎡");
    const reward = 100;
    const today = new Date().toISOString().split('T')[0];
    setCoins(coins + reward);
    await update(ref(db, `users/${user.uid}`), {coins: coins + reward, lastSpin: today});
    setCanSpin(false);
  }

  const handleVote = async (votedPlayerId) => {
    if(!user) return handleGoogleLogin();
    if(votesToday >= DAILY_VOTE_LIMIT) return alert(`Limit done`);
    await update(ref(db, `users/${user.uid}`), { votesToday: votesToday + 1 });
    await addXpAndCoins();
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const snap = await get(playerRef);
    await update(playerRef, { votes: (snap.val()?.votes || 0) + 1 });
    setVotesToday(votesToday + 1);
    setBattleNo(battleNo + 1); setTimeout(() => generateBattle(players, filter), 500);
  };

  if(loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return ( // PART 2 STARTS HERE
        <div className="min-h-screen bg-[#0a0a0f] text-white p-4 max-w-md mx-auto">
      <header className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1>
        <div className="flex gap-2">{user && <button onClick={() => setShowSpin(true)}>🎡</button>}{user? <img src={user.photoURL} onClick={handleLogout} className="w-10 h-10 rounded-full"/> : <button onClick={handleGoogleLogin} className="bg-blue-500 px-3 py-1 rounded">Login</button>}</div>
      </header>

      {user && (
        <div className="bg-[#13131a] p-3 rounded-2xl mb-3 flex justify-between">
          <div>XP: {xp}/100 <div className="w-24 h-2 bg-gray-700 rounded mt-1"><div className="h-2 bg-[#a8ff00]" style={{width: `${xp}%`}}></div></div></div>
          <div>🪙 {coins}</div>
        </div>
      )}

      <div className="flex gap-2 mb-4 border-b border-gray-800">{['Battle','Cards','Leaderboard','History'].map(t => <button key={t} onClick={() => setTab(t)} className={`pb-2 ${tab===t?'text-[#a8ff00] border-b-2 border-[#a8ff00]':'text-gray-500'}`}>{t}</button>)}</div>

      {tab==='Battle' && battle[0] && battle[1] && (
        <div>
          <h2 className="text-center text-3xl font-bold mb-4">Battle #{battleNo}</h2>
          <div className="flex gap-3">
            {battle.map(p => {
              const battleTotal = (battle[0].votes || 0) + (battle[1].votes || 0);
              const percentage = battleTotal > 0? ((p.votes || 0) / battleTotal * 100).toFixed(1) : 50;
              return (
                <div key={p.id} className="bg-[#13131a] p-3 rounded-xl text-center w-1/2">
                  <img src={p.image} className="w-20 h-20 rounded-full mx-auto"/>
                  <p>{p.name}</p>
                  <div className="w-full bg-gray-700 rounded h-2 mt-1"><div className="bg-[#a8ff00] h-2" style={{width: `${percentage}%`}}></div></div>
                  <p className="text-[#a8ff00]">{percentage}%</p>
                  <button onClick={() => handleVote(p.id)} className="bg-[#a8ff00] text-black w-full py-2 rounded mt-2">VOTE</button>
                </div>
              )
            })}
          </div>
          <button onClick={handleSkip} className="w-full mt-3 bg-gray-700 py-2 rounded">Skip</button>
        </div>
      )}

      {tab==='Cards' && <div className="grid grid-cols-3 gap-2">{players.map(p => <div key={p.id} className={`p-2 rounded ${collectedCards.includes(p.id)?'bg-green-900':'bg-gray-800 opacity-30'}`}><img src={p.image}/><p className="text-xs text-center">{p.name}</p></div>)}</div>}

      {tab==='Leaderboard' && leaderboard.map((u,i) => <div key={u.uid} className="bg-[#13131a] p-2 rounded mb-2 flex justify-between"><span>#{i+1} {u.name}</span><span>Lv.{u.level}</span></div>)}

      {tab==='History' && <div>{battleHistory.length===0? <p>No history</p> : battleHistory.map((h,i) => <div key={i} className="bg-[#13131a] p-2 rounded mb-2">{h.votedFor}</div>)}</div>}

      {showSpin && <div className="fixed inset-0 bg-black/80 flex items-center justify-center"><div className="bg-[#13131a] p-6 rounded-xl text-center"><h2>Daily Spin</h2><button onClick={handleSpin} disabled={!canSpin} className="bg-[#a8ff00] text-black px-6 py-3 rounded-full mt-3 disabled:bg-gray-500">{canSpin?'SPIN':'Tomorrow'}</button><button onClick={() => setShowSpin(false)} className="block mt-3">Close</button></div></div>}
    </div>
  );
                                                                                               }
