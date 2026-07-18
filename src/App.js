import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment } from 'firebase/database';

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
const DAILY_VOTE_LIMIT = 10;

const ALL_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://static.iplt20.com/players/284/164.png' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/IPLHeadshot2023/1.png' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://static.iplt20.com/players/107/107.png' },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0, image: 'https://static.iplt20.com/players/154/3763.png' },
  { id: "suryakumar-yadav", name: 'Suryakumar Yadav', role: 'BATTER', votes: 0, image: 'https://static.iplt20.com/players/130/108.png' },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0, image: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/IPLHeadshot2023/1.png' },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://static.iplt20.com/players/130/1124.png' },
  { id: "bhuvneshwar-kumar", name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0, image: 'https://static.iplt20.com/players/130/140.png' },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: 'https://static.iplt20.com/players/130/91.png' },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0, image: 'https://static.iplt20.com/players/130/3840.png' },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://static.iplt20.com/players/130/2972.png' },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: 'https://static.iplt20.com/players/130/9.png' },
  { id: "ravichandran-ashwin", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0, image: 'https://static.iplt20.com/players/130/8.png' },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://static.iplt20.com/players/130/1.png' },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: 'https://static.iplt20.com/players/130/2975.png' },
  { id: "sanju-samson", name: 'Sanju Samson', role: 'KEEPER', votes: 0, image: 'https://static.iplt20.com/players/130/3764.png' },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://static.iplt20.com/players/284/164.png' },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0, image: 'https://static.iplt20.com/players/107/107.png' },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: 'https://static.iplt20.com/players/130/1.png' },
  { id: "rahul-dravid-cap", name: 'Rahul Dravid', role: 'CAPTAIN', votes: 0, image: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/IPLHeadshot2023/1.png' },
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
  const [extraVotes, setExtraVotes] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [voteAnim, setVoteAnim] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [userPrediction, setUserPrediction] = useState(null);
  const [reactions, setReactions] = useState({fire:0, goat:0, shock:0, fire100:0});
  const [votedReaction, setVotedReaction] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [showNextButton, setShowNextButton] = useState(false);

  const getToday = () => new Date().toISOString().split('T')[0];

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

  const updateCalendar = async () => {
    const today = getToday();
    const snap = await get(ref(db, `users/${user.uid}/calendar`));
    let cal = snap.val() || [];
    if(!cal.includes(today)){ cal.push(today); }
    setCalendar(cal.slice(-7));
    await set(ref(db, `users/${user.uid}/calendar`), cal);
    setStreak(cal.length);
  };

  const setPrediction = (name) => { setUserPrediction(name); };

  const addReaction = async (type) => {
    if(votedReaction) return;
    const newReactions = {...reactions, [type]: reactions[type] + 1};
    setReactions(newReactions); setVotedReaction(type);
    await set(ref(db, `battles/${battleNo}/reactions`), newReactions);
  };

  const buyExtraVote = async () => {
    if(userCoins >= 50){
      await update(ref(db, `users/${user.uid}`), {coins: userCoins - 50, extraVotes: extraVotes + 1});
      setUserCoins(userCoins - 50); setExtraVotes(extraVotes + 1);
      alert("✅ +1 Extra Vote Added");
    } else { alert("Not enough coins! Win by correct prediction"); }
  };

  const checkAndResetDaily = useCallback(async () => {
    const today = getToday();
    const metaRef = ref(db, 'meta');
    const snap = await get(metaRef);
    const metaData = snap.val();
    if (!metaData || metaData.lastResetDate!== today) {
      const resetPlayers = {};
      ALL_PLAYERS.forEach(p => { resetPlayers[p.id] = {...p, votes: 0}; });
      await set(ref(db, 'players'), resetPlayers);
      await set(metaRef, { lastResetDate: today });
      await set(ref(db, 'totalVotes'), 0);
    }
  }, []);

  const handleDeleteHistory = async () => {
    if(!user) return;
    if(window.confirm("Are you sure? Your entire battle history will be deleted.")){
      await remove(ref(db, `users/${user.uid}/history`));
      setBattleHistory([]);
      alert("History Deleted!");
    }
  };

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
    setShowNextButton(false);
  }, []);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Are you sure you want logout?")) { await signOut(auth); setShowProfile(false); } };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };

  const handleShareResult = () => {
    const text = `I voted for ${battle[0]?.name} vs ${battle[1]?.name} on CrickClash! ⚔️\nWho's your pick?`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'CrickClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Copied to Clipboard!"); }
  };

  const updateStreak = async () => {
    if(!user) return {newStreak: 0, newBadges: []};
    const userRef = ref(db, `users/${user.uid}`);
    const today = getToday();
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
    if(!user){ alert("Google login required to vote!"); await signInWithPopup(auth, googleProvider); return; }
    const voteLimit = DAILY_VOTE_LIMIT + extraVotes;
    if(votesToday >= voteLimit) return alert(`Roju ${voteLimit} vote maatrame! Reset in ${timeLeft}`);

    setVoteAnim(votedPlayerId);
    setTimeout(() => setVoteAnim(null), 500);
    await updateCalendar();

    const votedPlayer = players.find(p => p.id === votedPlayerId);
    const today = getToday();
    const userRef = ref(db, `users/${user.uid}`);

    setPlayers(prev => prev.map(p => p.id === votedPlayerId? {...p, votes: (p.votes || 0) + 1} : p));
    setTotalVotes(prev => prev + 1);
    setBattle(prevBattle => prevBattle.map(p => p && p.id === votedPlayerId? {...p, votes: (p.votes || 0) + 1} : p));

    const {newStreak, newBadges} = await updateStreak();
    const finalBadges = [...newBadges];
    if(votesToday === 0 &&!finalBadges.includes('First Vote')) finalBadges.push('First Vote');

    const historyEntry = {battleNo, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);

    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today, streak: newStreak, badges: finalBadges, history: newHistory });
    await update(ref(db, `players/${votedPlayerId}/votes`), increment(1));
    await update(ref(db, 'totalVotes'), increment(1));

    setVotesToday(votesToday + 1); setBadges(finalBadges); setStreak(newStreak);
    setShowNextButton(true);

    const winner = ((battle[0].votes || 0) > (battle[1].votes || 0))? battle[0].name : battle[1].name;
    if(userPrediction === winner){
      const newCoins = userCoins + 10;
      await update(ref(db, `users/${user.uid}`), {coins: newCoins});
      setUserCoins(newCoins); alert("🎉 Correct Prediction! +10 Coins");
    }
    setUserPrediction(null); setVotedReaction(null);
  };

  useEffect(() => {
    checkAndResetDaily();
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const today = getToday();
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === today){
              setVotesToday(userData.votesToday || 0);
              setExtraVotes(userData.extraVotes || 0);
            }
            else {
              setVotesToday(0); setExtraVotes(0);
              update(userRef, {votesToday: 0, extraVotes: 0, lastVoteDate: today, history: []});
            }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
            setUserCoins(userData.coins || 0);
            setCalendar(userData.calendar || []);
          } else {
            setVotesToday(0);
            setExtraVotes(0);
            set(userRef, {votesToday: 0, extraVotes: 0, lastVoteDate: today, streak: 0, badges:[], history:[], coins: 0, calendar: []});
          }
        });
      }
    });

    const playersRef = ref(db, 'players');
    const totalVotesRef = ref(db, 'totalVotes');

    get(playersRef).then((snapshot) => {
      if (!snapshot.exists()) {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(playersRef, initialPlayers);
        set(ref(db, 'totalVotes'), 0);
      }
    });

    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setPlayers(playersArray);
        const sorted = [...playersArray].filter(p => p.votes > 0).sort((a,b) => (b.votes||0) - (a.votes||0));
        setTopPlayer(sorted[0] || null);
      }
    });

    onValue(totalVotesRef, (snapshot) => {
      const tv = snapshot.val();
      if(tv!== null) setTotalVotes(tv || 0);
    });

  }, [checkAndResetDaily]);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle]);
    if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;
    return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
      <style>{`
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes glow { 0%{box-shadow:0 0 5px #a8ff00} 50%{box-shadow:0 0 20px #a8ff00} 100%{box-shadow:0 0 5px #a8ff00} }
     .vote-pop { animation: pop 0.5s ease; }
     .glow { animation: glow 1.5s infinite; }
      `}</style>

      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="relative flex gap-2 items-center">
            {user && <div className="text-sm bg-[#222] px-3 py-1 rounded-full">🪙 {userCoins}</div>}
            {user? (
              <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer hover:scale-110 transition" />
            ) : (
              <button onClick={handleGoogleLogin} className="bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition">Login</button>
            )}
            {user && showProfile && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] border-[#333] rounded-xl shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName}</p><p className="text-gray-400 text-xs truncate">{user.email}</p></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Logout</button>
              </div>
            )}
          </div>
        </header>

        {user && (
          <>
            <div className="bg-[#13131a] p-3 rounded-2xl mb-3 border-[#222]">
              <div className="flex justify-between text-sm mb-2"><span>🔥 {streak} Day Streak</span><span className="text-gray-400">Resets in {timeLeft}</span></div>
              <div className="flex gap-1 justify-between">
                {[...Array(7)].map((_,i) => (
                  <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs ${calendar[i]? 'bg-[#a8ff00] text-black' : 'bg-[#222] text-gray-500'}`}>{i+1}</div>
                ))}
              </div>
            </div>

            <button onClick={buyExtraVote} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-2 rounded-xl mb-3 font-bold">🪙 50 Coins = +1 Extra Vote</button>

            <div className="bg-[#13131a] p-3 rounded-2xl mb-3">
              <p className="text-sm text-gray-400 mb-2">Your Badges</p>
              <div className="flex gap-2 flex-wrap">
                {badges.map(b => <span key={b} className="bg-[#a8ff00] text-black px-3 py-1 rounded-full text-sm font-bold">🏏 {b}</span>)}
                {badges.length === 0 && <span className="text-gray-500 text-sm">No badges yet</span>}
              </div>
            </div>
            <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
              <p className="text-gray-400 text-sm">Today's Votes Left</p>
              <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT + extraVotes - votesToday} / {DAILY_VOTE_LIMIT + extraVotes}</p>
              <p className="text-xs text-gray-500 mt-1">Reset in: {timeLeft}</p>
            </div>
          </>
        )}

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold transition ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold transition ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold transition ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || '-'}</p><p className="text-xs text-gray-400">TOP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>
            <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a] hover:bg-[#222]'}`}>{role}</button>
              ))}
            </div>

            {battle[0] && battle[1]? (
              <div>
                <div className="bg-[#1A1A1A] p-3 rounded-xl mb-3">
                  <p className="text-xs text-gray-400 mb-2">Who will win?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPrediction(battle[0].name)} className={`flex-1 py-2 rounded-lg text-sm font-bold ${userPrediction === battle[0].name? 'bg-[#a8ff00] text-black' : 'bg-[#222]'}`}>{battle[0].name.split(' ')[0]}</button>
                    <button onClick={() => setPrediction(battle[1].name)} className={`flex-1 py-2 rounded-lg text-sm font-bold ${userPrediction === battle[1].name? 'bg-[#a8ff00] text-black' : 'bg-[#222]'}`}>{battle[1].name.split(' ')[0]}</button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {[battle[0], battle[1]].map(p => {
                    const battleTotalVotes = (battle[0]?.votes || 0) + (battle[1]?.votes || 0);
                    const percentage = battleTotalVotes > 0? ((p.votes || 0) / battleTotalVotes * 100).toFixed(1) : 0;
                    return (
                    <div key={p.id} className={`bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center transition hover:scale-105 ${voteAnim === p.id? 'vote-pop' : ''}`}>
                      <img
                        src={p.image}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=Player'}
                        className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-[#a8ff00]"
                        alt={p.name}
                      />
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.role==='KEEPER'?'bg-red-900':p.role==='CAPTAIN'?'bg-blue-900':p.role==='BATTER'?'bg-red-800':'bg-blue-800'}`}>{p.role}</span>
                      <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                      <p className="text-[#a8ff00] font-bold text-lg">{percentage}%</p>
                      <p className="text-xs text-gray-400">{p.votes || 0} votes</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1 mb-2">
                        <div className="bg-[#a8ff00] h-2 rounded-full transition-all duration-500" style={{width: `${percentage}%`}}></div>
                      </div>
                      <button onClick={() => handleVote(p.id)} disabled={user && votesToday >= DAILY_VOTE_LIMIT + extraVotes} className={`w-full py-3 rounded-xl font-bold mt-1 transition ${!user? 'bg-blue-500 hover:bg-blue-600' : votesToday >= DAILY_VOTE_LIMIT + extraVotes? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black hover:bg-[#9ae600]'}`}>
                        {!user? 'VOTE' : votesToday >= DAILY_VOTE_LIMIT + extraVotes? 'LIMIT DONE' : 'VOTE'}
                      </button>
                    </div>
                  )})}
                </div>

                <div className="flex justify-around bg-[#13131a] p-2 rounded-xl my-4">
                  <button onClick={() => addReaction('fire')} className={`text-xl ${votedReaction==='fire'?'glow':''}`}>🔥 {reactions.fire}</button>
                  <button onClick={() => addReaction('goat')} className={`text-xl ${votedReaction==='goat'?'glow':''}`}>👑 {reactions.goat}</button>
                  <button onClick={() => addReaction('shock')} className={`text-xl ${votedReaction==='shock'?'glow':''}`}>😱 {reactions.shock}</button>
                  <button onClick={() => addReaction('fire100')} className={`text-xl ${votedReaction==='fire100'?'glow':''}`}>💯 {reactions.fire100}</button>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleShareResult} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold hover:bg-[#2e2e38] transition">📤 Share Battle</button>
                  <button onClick={handleSkip} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold hover:bg-[#2e2e38] transition">⏭️ Skip</button>
                </div>

                {showNextButton && (
                  <button
                    onClick={() => {
                      setBattleNo(b => b + 1);
                      generateBattle(players, filter);
                    }}
                    className="w-full bg-[#a8ff00] text-black py-4 rounded-xl font-bold text-lg mt-4 hover:bg-[#9ae600] transition"
                  >
                    NEXT BATTLE →
                  </button>
                )}
              </div>
            ) : <p className="text-center">Loading Players...</p>}
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {Object.values(players.reduce((acc, player) => { if (acc[player.name]) { acc[player.name].votes += player.votes || 0; } else { acc[player.name] = {...player }; } return acc; }, {})).sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => {
                const percentage = totalVotes > 0? ((p.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                return (
                  <div key={p.name} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3 hover:bg-[#1a1a24] transition">
                    <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                    <img src={p.image} onError={(e) => e.target.src = 'https://via.placeholder.com/48?text=P'} className="w-12 h-12 rounded-full object-cover" alt={p.name}/>
                    <div className="flex-1"><div className="flex justify-between"><span className="font-bold">{p.name}</span><span className="text-[#a8ff00] font-bold text-sm">{percentage}%</span></div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>{p.votes||0} votes</span><span>{p.role}</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-[#a8ff00] h-2 rounded-full transition-all duration-500" style={{width: `${percentage}%`}}></div></div></div>
                  </div>
                )
              })}
          </div>
        )}

        {tab === 'History' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#a8ff00]">📜 Your Battle History</h2>
              {battleHistory.length > 0 && (
                <button onClick={handleDeleteHistory} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm font-bold transition">
                  🗑️ Clear
                </button>
              )}
            </div>
            {battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (<div key={i} className="bg-[#13131a] p-3 rounded-xl hover:bg-[#1a1a24] transition"><p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p><p className="font-bold">{h.players[0]} vs {h.players[1]}</p><p className="text-sm text-[#a8ff00]">You voted: {h.votedFor}</p></div>))}
          </div>
        )}
      </div>

      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-white font-bold">CrickClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
        <p className="text-xs mt-1">Made with ❤️ for Cricket Fans</p>
      </footer>
    </div>
  );
              }
