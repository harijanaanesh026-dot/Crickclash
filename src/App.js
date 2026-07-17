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
const DAILY_VOTE_LIMIT = 1;

const ALL_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: '/players/virat-kohli.png' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: '/players/sachin-tendulkar.png' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: '/players/rohit-sharma.png' },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0, image: '/players/shubman-gill.png' },
  { id: "suryakumar-yadav", name: 'Suryakumar Yadav', role: 'BATTER', votes: 0, image: '/players/suryakumar-yadav.png' },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0, image: '/players/rahul-dravid.png' },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: '/players/jasprit-bumrah.png' },
  { id: "bhuvneshwar-kumar", name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0, image: '/players/bhuvneshwar-kumar.png' },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: '/players/mohammed-shami.png' },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0, image: '/players/mohammed-siraj.png' },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: '/players/hardik-pandya.png' },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: '/players/ravindra-jadeja.png' },
  { id: "ravichandran-ashwin", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0, image: '/players/ravichandran-ashwin.png' },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: '/players/ms-dhoni.png' },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: '/players/rishabh-pant.png' },
  { id: "sanju-samson", name: 'Sanju Samson', role: 'KEEPER', votes: 0, image: '/players/sanju-samson.png' },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: '/players/virat-kohli.png' },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0, image: '/players/rohit-sharma.png' },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: '/players/ms-dhoni.png' },
  { id: "rahul-dravid-cap", name: 'Rahul Dravid', role: 'CAPTAIN', votes: 0, image: '/players/rahul-dravid.png' },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState(ALL_PLAYERS);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  // NEW STATES
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
    let attempts = 0;
    while(p1.id === p2.id && attempts < 20) {
      p2 = filtered[Math.floor(Math.random() * filtered.length)];
      attempts++;
    }
    setBattle([p1, p2]);
  }, []);

  // NEW: 12AM KI AUTO RESET CHECK
  const checkDailyReset = async () => {
    const lastResetRef = ref(db, 'system/lastReset');
    const snap = await get(lastResetRef);
    const today = new Date().toISOString().split('T')[0];

    if(snap.val()!== today){
      console.log("Resetting all player votes for new day");
      const updates = {};
      ALL_PLAYERS.forEach(p => {
        updates[`players/${p.id}/votes`] = 0;
      });
      await update(ref(db), updates);
      await set(lastResetRef, today);
    }
  }

  useEffect(() => {
    checkDailyReset(); // App open ayyagane 1 sari check

    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const today = new Date().toISOString().split('T')[0];
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === today){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); update(userRef, {votesToday: 0, lastVoteDate: today}); }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
            setCoins(userData.coins || 100);
            setXp(userData.xp || 0);
            setLevel(userData.level || 1);
            setCollectedCards(userData.cards || []);
            setCanSpin(userData.lastSpin!== today);
          } else {
            set(userRef, {votesToday: 0, lastVoteDate: today, streak: 0, badges:['Welcome'], history:[], coins: 100, xp: 0, level: 1, cards: [], lastSpin: ''});
          }
        });

        const usersRef = ref(db, 'users');
        onValue(usersRef, (snap) => {
          const data = snap.val() || {};
          const sorted = Object.entries(data).map(([uid, d]) => ({uid, name: d.name || 'Player',...d})).sort((a,b) => (b.xp||0) - (a.xp||0)).slice(0, 10);
          setLeaderboard(sorted);
        })
      }
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 10) {
        const playersArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setPlayers(playersArray);
        const sorted = [...playersArray].sort((a,b) => (b.votes||0) - (a.votes||0));
        setTopPlayer(sorted[0]);
        setTotalVotes(sorted.reduce((sum, p) => sum + (p.votes||0), 0));
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(playersRef, initialPlayers);
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle]);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout cheyala?")) { await signOut(auth); setShowProfile(false); } };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };
  const handleShare = () => {
    const text = `Who's Your Favourite? ${battle[0]?.name} vs ${battle[1]?.name} Vote on CrickClash!`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'CrickClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Link Copied!"); }
  };

  const addXpAndCoins = async () => {
    if(!user) return;
    const newXp = xp + 10;
    const newLevel = Math.floor(newXp / 100) + 1;
    const newCoins = coins + 5;
    setXp(newXp); setLevel(newLevel); setCoins(newCoins);
    await update(ref(db, `users/${user.uid}`), {xp: newXp, level: newLevel, coins: newCoins});
    if(newLevel > level) alert(`🎉 Level Up! You are now Level ${newLevel}`);
  }

  const handleSpin = async () => {
    if(!canSpin) return alert("Tomorrow malli spin cheyochu 🎡");
    const rewards = [50, 100, 200, 'card', 'card'];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const today = new Date().toISOString().split('T')[0];
    if(reward!== 'card'){
      setCoins(coins + reward);
      await update(ref(db, `users/${user.uid}`), {coins: coins + reward, lastSpin: today});
      alert(`🪙 ${reward} Coins Won!`);
    } else {
      const randomCard = players[Math.floor(Math.random() * players.length)];
      const newCards = [...new Set([...collectedCards, randomCard.id])];
      setCollectedCards(newCards);
      await update(ref(db, `users/${user.uid}`), {cards: newCards, lastSpin: today});
      alert(`🎴 ${randomCard.name} Card Won!`);
    }
    setCanSpin(false);
  }

  const updateStreak = async () => {
    if(!user) return {newStreak: 0, newBadges: []};
    const userRef = ref(db, `users/${user.uid}`);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const snap = await get(userRef);
    const data = snap.val() || {};
    let newStreak = 1;
    if(data.lastVoteDate === yesterday) newStreak = (data.streak || 0) + 1;
    let newBadges = [...(data.badges || [])];
    if([3,7,30].includes(newStreak) &&!newBadges.includes(`${newStreak} Day Streak`)){ newBadges.push(`${newStreak} Day Streak`); }
    return {newStreak, newBadges};
  };

  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Google login required to vote"); await signInWithPopup(auth, googleProvider); return; }
    if(votesToday >= DAILY_VOTE_LIMIT) return alert(`Roju ${DAILY_VOTE_LIMIT} vote maatrame!`);
    const votedPlayer = players.find(p => p.id === votedPlayerId);
    if(!votedPlayer) return;

    const {newStreak, newBadges} = await updateStreak();
    const today = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);

    const finalBadges = [...newBadges];
    if(votesToday === 0 &&!finalBadges.includes('First Vote')) finalBadges.push('First Vote');

    const historyEntry = {battleNo, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);

    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today, streak: newStreak, badges: finalBadges, history: newHistory });
    await addXpAndCoins();
    const playerSnap = await get(playerRef);
    await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });

    setVotesToday(votesToday + 1); setBadges(finalBadges); setStreak(newStreak);
    setBattleNo(battleNo + 1); setTimeout(() => generateBattle(players, filter), 500);
  };

  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-md mx-auto w-full p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="flex gap-2 items-center">
            {user && <button onClick={() => setShowSpin(true)} className="text-2xl">🎡</button>}
            <div className="relative">
              {user? <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" /> : <button onClick={handleGoogleLogin} className="bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold">Login</button>}
              {user && showProfile && (
                <div className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] border-[#333] rounded-xl shadow-2xl z-50">
                  <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName}</p><p className="text-[#a8ff00] text-xs">Lv.{level} | 🪙{coins}</p></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {user && (
          <div className="bg-[#13131a] p-3 rounded-2xl mb-3 flex justify-between">
            <div>XP: {xp}/100 <div className="w-24 h-2 bg-gray-700 rounded mt-1"><div className="h-2 bg-[#a8ff00]" style={{width: `${xp}%`}}></div></div></div>
            <div>🪙 {coins}</div>
          </div>
        )}

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Cards')} className={`pb-2 font-bold ${tab === 'Cards'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🎴 Cards</button>
          <button onClick={() => setTab('Leaderboard')} className={`pb-2 font-bold ${tab === 'Leaderboard'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Top</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {tab === 'Battle' && battle[0] && battle[1] && (
          <div>
            <div className="grid grid-cols-4 text-center mb-6"><div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TODAY</p></div><div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div><div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">LEADING</p></div><div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs text-gray-400">STREAK</p></div></div>
            <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p><h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">{['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>)}</div>

            {/* PART 2 LO PERCENTAGE UI VASTUNDI */}
          </div>
        )}

        {/* PART 2 LO MIGATA TABS VASTAYI */}
      </div>

      {showSpin && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><div className="bg-[#13131a] p-6 rounded-2xl text-center"><h2 className="text-2xl mb-4">Daily Spin 🎡</h2><button onClick={handleSpin} disabled={!canSpin} className="bg-[#a8ff00] text-black px-8 py-4 rounded-full font-bold text-xl disabled:bg-gray-500">{canSpin? 'SPIN NOW' : 'Come Back Tomorrow'}</button><button onClick={() => setShowSpin(false)} className="block mt-4 w-full">Close</button></div></div>}
    </div>
  );
      }
{tab === 'Battle' && battle[0] && battle[1] && (
  <div>
    <div className="flex items-center justify-center gap-2">
      {[battle[0], battle[1]].map(p => {
        // NEW: PERCENTAGE CALCULATE CHEYADAM
        const battleTotal = (battle[0].votes || 0) + (battle[1].votes || 0);
        const percentage = battleTotal > 0? ((p.votes || 0) / battleTotal * 100).toFixed(1) : 50;

        return (
          <div key={p.id} className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
            <img src={p.image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" alt={p.name}/>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.role==='KEEPER'?'bg-red-900':p.role==='CAPTAIN'?'bg-blue-900':p.role==='BATTER'?'bg-red-800':'bg-blue-800'}`}>{p.role}</span>
            <h3 className="text-xl font-bold mt-3">{p.name}</h3>

            {/* NEW: PERCENTAGE BAR */}
            <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
              <div className="bg-[#a8ff00] h-3 rounded-full transition-all duration-500" style={{width: `${percentage}%`}}></div>
            </div>
            <p className="text-[#a8ff00] font-bold text-lg mt-1">{percentage}%</p>
            <p className="text-gray-400 text-xs">{p.votes || 0} votes today</p>

            <button onClick={() => handleVote(p.id)} disabled={user && votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${!user? 'bg-blue-500' : votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
              {!user? 'VOTE' : votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE +10XP'}
            </button>
          </div>
        )
      })}
    </div>
    <div className="flex gap-2 mt-4"><button onClick={handleShare} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">📤 Share</button><button onClick={handleSkip} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">⏭️ Skip</button></div>
  </div>
)}

{tab === 'Cards' && (
  <div>
    <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🎴 My Collection: {collectedCards.length}/{players.length}</h2>
    <div className="grid grid-cols-3 gap-2">
      {players.map(p => (
        <div key={p.id} className={`p-2 rounded-xl ${collectedCards.includes(p.id)? 'bg-green-900' : 'bg-gray-800 opacity-30'}`}>
          <img src={p.image} className="w-full rounded"/>
          <p className="text-xs text-center mt-1">{p.name}</p>
        </div>
      ))}
    </div>
  </div>
)}

{tab === 'Leaderboard' && (
  <div>
    <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
    {leaderboard.map((u,i) => (
      <div key={u.uid} className="bg-[#13131a] p-3 rounded-xl mb-2 flex justify-between">
        <span>#{i+1} {u.name}</span>
        <span>Lv.{u.level} | {u.xp} XP</span>
      </div>
    ))}
  </div>
)}

{tab === 'History' && (
  <div className="space-y-3">
    <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">📜 Your Battle History</h2>
    {battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (<div key={i} className="bg-[#13131a] p-3 rounded-xl"><p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p><p className="font-bold">{h.players[0]} vs {h.players[1]}</p><p className="text-sm text-[#a8ff00]">You voted: {h.votedFor}</p></div>))}
  </div>
)}

<footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
  <p>© 2026 <span className="text-[#a8ff00] font-bold">CrickClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
  <p className="text-xs mt-1">Resets Daily at 12:00 AM</p>
</footer>
