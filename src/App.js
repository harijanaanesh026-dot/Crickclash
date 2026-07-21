import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment } from 'firebase/database';

// ============= FIREBASE CONFIG =============
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

// ============= 3 CATEGORIES DATA =============
const ALL_DATA = {
  Cricket: [
    { id: "virat-kohli", name: 'Virat Kohli', role: 'BATTER', votes: 0 },
    { id: "rohit-sharma", name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
    { id: "ms-dhoni", name: 'MS Dhoni', role: 'KEEPER', votes: 0 },
    { id: "sachin-tendulkar", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 },
    { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 },
    { id: "hardik-pandya", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 },
    { id: "kapil-dev", name: 'Kapil Dev', role: 'CAPTAIN', votes: 0 },
  ],
  Football: [
    { id: "messi", name: 'Lionel Messi', role: 'FORWARD', votes: 0 },
    { id: "ronaldo", name: 'Cristiano Ronaldo', role: 'FORWARD', votes: 0 },
    { id: "mbappe", name: 'Kylian Mbappe', role: 'FORWARD', votes: 0 },
    { id: "haaland", name: 'Erling Haaland', role: 'FORWARD', votes: 0 },
    { id: "neymar", name: 'Neymar Jr', role: 'FORWARD', votes: 0 },
    { id: "modric", name: 'Luka Modric', role: 'MIDFIELDER', votes: 0 },
  ],
  Movies: [
    { id: "iron-man", name: 'Iron Man', role: 'HERO', votes: 0 },
    { id: "batman", name: 'Batman', role: 'HERO', votes: 0 },
    { id: "thor", name: 'Thor', role: 'HERO', votes: 0 },
    { id: "spiderman", name: 'Spider-Man', role: 'HERO', votes: 0 },
    { id: "joker", name: 'Joker', role: 'VILLAIN', votes: 0 },
    { id: "deadpool", name: 'Deadpool', role: 'HERO', votes: 0 },
  ]
};

export default function AIFanVerse() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Cricket');
  const [players, setPlayers] = useState(ALL_DATA.Cricket);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [tab, setTab] = useState('Battle');
  const [filter, setFilter] = useState('Any');
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [weeklyWinner, setWeeklyWinner] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [voteAnim, setVoteAnim] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const getToday = () => new Date().toISOString().split('T')[0];
  const getWeekNumber = () => { const d = new Date(); d.setHours(0,0,0); d.setDate(d.getDate() + 4 - (d.getDay()||7)); return d.getFullYear() + '-W' + String(Math.ceil(((d - new Date(d.getFullYear(),0,1))/86400000 + 1)/7)).padStart(2,'0'); };
  // ============= LOGIC PART =============

  const checkAndResetDaily = useCallback(async () => {
    const today = getToday();
    const metaRef = ref(db, `meta/${category}`);
    const snap = await get(metaRef);
    const metaData = snap.val();
    if (!metaData || metaData.lastResetDate!== today) {
      const resetPlayers = {};
      ALL_DATA[category].forEach(p => { resetPlayers[p.id] = {...p, votes: 0}; });
      await set(ref(db, `players/${category}`), resetPlayers);
      await set(metaRef, { lastResetDate: today, totalVotes: 0, battleNo: 1 });
    }
  }, [category]);

  const checkWeeklyWinner = useCallback(async (playerList) => {
    const week = getWeekNumber();
    const winnerRef = ref(db, `winners/${category}/${week}`);
    const sorted = [...playerList].sort((a,b) => b.votes - a.votes);
    if(sorted[0]) {
      await set(winnerRef, { name: sorted[0].name, votes: sorted[0].votes });
      setWeeklyWinner({ name: sorted[0].name, votes: sorted[0].votes });
    }
  }, [category]);

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

  const getBattleKey = () => battle[0] && battle[1]? `${category}-${battle[0].id}-${battle[1].id}-B${battleNo}` : null;

  const updateStreak = async () => {
    if(!user) return {newStreak: 0, newBadges: []};
    const userRef = ref(db, `users/${user.uid}/${category}`);
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const snap = await get(userRef);
    const data = snap.val() || {};
    let newStreak = 1;
    if(data.lastVoteDate === yesterday) newStreak = (data.streak || 0) + 1;
    let newBadges = [...(data.badges || [])];
    if([3,7,30].includes(newStreak) &&!newBadges.includes(`${newStreak} Day Streak`)){ newBadges.push(`${newStreak} Day Streak`); }
    if(votesToday === 0 &&!newBadges.includes('First Vote')) newBadges.push('First Vote');
    if(!newBadges.includes(`${category} Fan`)) newBadges.push(`${category} Fan`);
    return {newStreak, newBadges};
  };

  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Google login required"); await signInWithPopup(auth, googleProvider); return; }
    if(votesToday >= DAILY_VOTE_LIMIT || isVoting) return alert(`Roju ${DAILY_VOTE_LIMIT} vote maatrame!`);
    setIsVoting(true);
    setVoteAnim(votedPlayerId);
    setTimeout(() => setVoteAnim(null), 500);
    const {newStreak, newBadges} = await updateStreak();
    const today = getToday();
    const userRef = ref(db, `users/${user.uid}/${category}`);
    const playerRef = ref(db, `players/${category}/${votedPlayerId}`);
    const votedPlayer = ALL_DATA[category].find(p => p.id === votedPlayerId);
    const historyEntry = {battleNo, category, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);
    const newBattleNo = battleNo + 1;

    await update(userRef, { votesToday: increment(1), lastVoteDate: today, streak: newStreak, badges: newBadges, history: newHistory });
    await update(playerRef, { votes: increment(1) });
    await update(ref(db, `meta/${category}`), { totalVotes: increment(1), battleNo: newBattleNo });

    setTimeout(() => {
      setIsVoting(false);
      setBattleNo(newBattleNo);
      generateBattle(players, filter);
    }, 1000);
  };

  const handleSkip = async () => {
    const newBattleNo = battleNo + 1;
    setBattleNo(newBattleNo);
    await update(ref(db, `meta/${category}`), { battleNo: newBattleNo });
    generateBattle(players, filter);
  };

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout?")) { await signOut(auth); setShowProfile(false); } };

  useEffect(() => {
    checkAndResetDaily();
    const metaRef = ref(db, `meta/${category}`);
    onValue(metaRef, (snapshot) => {
      const metaData = snapshot.val();
      if (metaData) { setBattleNo(metaData.battleNo || 1); setTotalVotes(metaData.totalVotes || 0); }
    });

    const playersRef = ref(db, `players/${category}`);
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      const currentPlayers = ALL_DATA[category];
      if (data) {
        const playersArray = currentPlayers.map(p => ({...p, votes: data[p.id]?.votes || 0 }));
        setPlayers(playersArray);
        generateBattle(playersArray, filter);
        const sorted = [...playersArray].sort((a,b) => b.votes - a.votes);
        setTopPlayer(sorted[0]);
        checkWeeklyWinner(sorted);
      } else {
        const initialPlayers = {};
        currentPlayers.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(playersRef, initialPlayers);
        set(metaRef, { lastResetDate: getToday(), totalVotes: 0, battleNo: 1 });
      }
    });

    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        onValue(ref(db, `users/${currentUser.uid}/${category}`), (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === getToday()){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
          }
        });
      }
    })
  }, [category, checkAndResetDaily, generateBattle, filter, checkWeeklyWinner]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor(diff / 1000 / 60) % 60;
      const s = Math.floor(diff / 1000) % 60;
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  // ============= UI PART =============

  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading AI FanVerse...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
      <style>{`@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }.vote-pop { animation: pop 0.5s ease; }`}</style>

      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">AI <span className="text-[#FF7A00]">FanVerse</span></h1><p className="text-xs text-gray-400">Cricket • Football • Movies</p></div>
          <div className="relative">
            {user? <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" />
              : <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-full font-bold text-sm">Login</button>}
            {showProfile && user && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] border-[#333] rounded-xl shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName}</p></div>
                <div className="px-4 py-2 text-xs text-gray-400">🔥 {streak} Day Streak</div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Logout</button>
              </div>
            )}
          </div>
        </header>

        {/* CATEGORY TABS */}
        <div className="flex justify-center gap-2 mb-4 bg-[#13131a] p-1 rounded-2xl">
          {Object.keys(ALL_DATA).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${category === cat? 'bg-[#a8ff00] text-black' : 'text-gray-400'}`}>
              {cat === 'Cricket' && '🏏 '}{cat === 'Football' && '⚽ '}{cat === 'Movies' && '🎬 '}{cat}
            </button>
          ))}
        </div>

        {/* PAGE TABS */}
        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 text-center mb-6">
          <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL</p></div>
          <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
          <div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP</p></div>
          <div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
        </div>

        {tab === 'Battle' && (
          <>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>
            <p className="text-center text-gray-400 mb-2">Resets in: {timeLeft}</p>

            {/* ROLE FILTERS */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {category === 'Cricket' && ['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
              {category === 'Football' && ['Any', 'FORWARD', 'MIDFIELDER'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
              {category === 'Movies' && ['Any', 'HERO', 'VILLAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
            </div>

            {/* BATTLE CARD */}
            {battle[0] && battle[1]? (
              <div className="flex items-center justify-center gap-2">
                {[battle[0], battle[1]].map(p => (
                  <div key={p.id} className={`bg-[#13131a] p-4 rounded-2xl w-1/2 text-center ${voteAnim === p.id? 'vote-pop' : ''}`}>
                    <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-3xl font-bold">{p.name[0]}</div>
                    <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                    <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                    <button onClick={() => handleVote(p.id)} disabled={isVoting || votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>
                      {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
                    </button>
                  </div>
                ))}
              </div>
            ) : <p className="text-center">Loading Players...</p>}

            <button onClick={handleSkip} className="w-full bg-[#23232b] py-3 rounded-xl font-bold mt-4">⏭️ Skip Battle</button>
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 {category}</h2>
            {players.sort((a,b) => b.votes - a.votes).slice(0,10).map((p,i) => (
              <div key={p.id} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3">
                <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                <div className="w-12 h-12 rounded-full bg-[#a8ff00] text-black flex items-center justify-center text-lg font-bold">{p.name[0]}</div>
                <div className="flex-1"><p className="font-bold">{p.name}</p><p className="text-sm text-gray-400">{p.votes} votes</p></div>
              </div>
            ))}
          </div>
        )}

        {tab === 'History' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#a8ff00]">📜 Your {category} History</h2>
            {!user? <p className="text-gray-500 text-center">Login required</p> : battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (<div key={i} className="bg-[#13131a] p-3 rounded-xl"><p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p><p className="font-bold">{h.players[0]} vs {h.players[1]}</p><p className="text-sm text-[#a8ff00]">You voted: {h.votedFor}</p></div>))}
          </div>
        )}
      </div>
    </div>
  );
  }
