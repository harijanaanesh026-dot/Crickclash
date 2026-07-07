import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, push, get } from 'firebase/database';

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
  { name: 'Virat Kohli', role: 'BATTER', votes: 0 }, { name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
  { name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 }, { name: 'Shubman Gill', role: 'BATTER', votes: 0 },
  { name: 'Suryakumar Yadav', role: 'BATTER', votes: 0 }, { name: 'KL Rahul', role: 'BATTER', votes: 0 },
  { name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 }, { name: 'Mohammed Shami', role: 'BOWLER', votes: 0 },
  { name: 'Mohammed Siraj', role: 'BOWLER', votes: 0 }, { name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0 },
  { name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Washington Sundar', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'MS Dhoni', role: 'KEEPER', votes: 0 }, { name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
  { name: 'Sanju Samson', role: 'KEEPER', votes: 0 }, { name: 'MS Dhoni', role: 'CAPTAIN', votes: 0 },
  { name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 }, { name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0 },
];
export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [totalVotes, setTotalVotes] = useState(24);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);

  // BUG FIX: DUPLICATE PLAYER RAKUNDA
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
  }, [])

  const getPercentage = (p1, p2) => {
    const total = (p1?.votes || 0) + (p2?.votes || 0);
    if(total === 0) return 50;
    return ((p1?.votes || 0) / total) * 100;
  }
    useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          const today = new Date().toDateString();
          if(userData){
            if(userData.lastVoteDate === today){
              setVotesToday(userData.votesToday || 0);
              setStreak(userData.streak || 0);
              setBadges(userData.badges || []);
            } else {
              setVotesToday(0);
              update(userRef, {votesToday: 0, lastVoteDate: today});
            }
          }
        });
      }
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 10) {
        const playersArray = Object.keys(data).map(key => ({ id: Number(key),...data[key] }));
        setPlayers(playersArray);
        const sorted = [...playersArray].sort((a,b) => (b.votes||0) - (a.votes||0));
        setTopPlayer(sorted[0]);
        setTotalVotes(playersArray.reduce((sum, p) => sum + (p.votes||0), 0));
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p, idx) => { initialPlayers[idx] = {...p, id: idx }; });
        set(playersRef, initialPlayers);
      }
    });
  }, []);

  // BUG FIX: AUTO CALL TEESAM. Filter change aythe matrame kotha battle
  useEffect(() => {
    if(players.length > 0) generateBattle(players, filter);
  }, [players, filter, generateBattle])

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => { if(window.confirm("Logout?")) signOut(auth); }

  const handleSkip = () => {
    setBattleNo(b => b + 1);
    generateBattle(players, filter);
  }

  const handleVote = async (votedPlayerId) => {
    if(!user || votesToday >= DAILY_VOTE_LIMIT) return;
    const votedPlayer = players.find(p => p.id === votedPlayerId);
    if(!votedPlayer) return;

    const today = new Date().toDateString();
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);

    const newBadges = [...badges];
    if(votesToday === 0 &&!badges.includes('First Vote')) newBadges.push('First Vote');

    await update(userRef, {
      votesToday: votesToday + 1,
      lastVoteDate: today,
      streak: streak + 1,
      badges: newBadges
    });

    const playerSnap = await get(playerRef);
    const currentVotes = playerSnap.val()?.votes || 0;
    await update(playerRef, { votes: currentVotes + 1 });

    setVotesToday(votesToday + 1);
    setBadges(newBadges);
    setTimeout(() => handleSkip(), 800);
                            }
    if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>

  if(!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white p-4 relative">
        <div className="text-center">
          <p className="text-400 mb-2 mb-10">The Ultimate Cricket Voting Platform</p>
          <h1 className="text-4xl font-bold">Crick<span className="text-orange-400">Clash</span></h1>
          <p className="text-gray-400 mt-2 mb-10">ANESH Innovation</p>

          <button onClick={handleGoogleLogin}
            className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg hover:scale-105 transition mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.9 7.5-11.3 7.5-6.6 0-12-5.4-12-12s5.4-12 12-12c2.6 0 5 1 6.9 2.7l6.1-6.1C29.6 4.1 27 3 24 3c-9.4 0-17 7.6-17 17s7.6 17 17 17c9.4 0 17-7.6 17-17 0-1.2-.1-2.3-.4-3.5z"/>
            </svg>
            Sign In with Google
          </button>
       <footer className="text-center text-gray-500 text-sm mt-8 py-4">
        © 2026 CrickClash™ | A Production By ANESH
      </footer>
     </div>
   )
  }
    return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4">
      <div className="max-w-md mx-auto">

        <header className="flex justify-between items-center mb-4">
  <div>
    <h1 className="text-2xl font-bold">Crick<span className="text-orange-400">Clash</span></h1>
    <p className="text-xs text-gray-400">ANESH Innovation</p>
  </div>
  <div className="flex items-center gap-2">
    <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-[#a8ff00]"/>
    <button onClick={handleLogout} className="bg-red-600 px-3 py-2 rounded-lg font-bold text-sm">
      Logout
    </button>
  </div>
</header>
        <div className="bg-[#13131a] p-3 rounded-2xl mb-3">
          <p className="text-sm text-gray-400 mb-2">Your Badges</p>
          <div className="flex gap-2">
            {badges.includes('First Vote') && <span className="bg-[#a8ff00] text-black px-3 py-1 rounded-full text-sm font-bold">🏏 First Vote</span>}
            {badges.length === 0 && <span className="text-gray-500 text-sm">No badges yet</span>}
          </div>
        </div>

        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm">Today's Votes Left</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday} / {DAILY_VOTE_LIMIT}</p>
        </div>

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL VOTES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP CHAMP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>

            <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)}
                  className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
            </div>

            {battle[0] && battle[1]? (
              <div>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                    <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs font-bold">{battle[0].role}</span>
                    <h3 className="text-xl font-bold mt-3">{battle[0].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[0].votes || 0} votes</p>
                    <button onClick={() => handleVote(battle[0].id)} disabled={votesToday >= DAILY_VOTE_LIMIT}
                      className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
                      {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT REACHED' : 'VOTE'}
                    </button>
                  </div>
                  <span className="text-3xl font-bold text-orange-400">VS</span>
                  <div className="bg-gradient-to-b from-[#4a1e5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                    <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{battle[1].role}</span>
                    <h3 className="text-xl font-bold mt-3">{battle[1].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[1].votes || 0} votes</p>
                    <button onClick={() => handleVote(battle[1].id)} disabled={votesToday >= DAILY_VOTE_LIMIT}
                      className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
                      {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT REACHED' : 'VOTE'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={handleSkip} className="bg-[#13131a] w-1/2 py-3 rounded-xl font-bold">Skip →</button>
                  <button onClick={() => navigator.share({
  title: 'CrickClash', 
  text: `Want Your Favourite to Win? Cast Your Vote Now.${battle[0]?.name} vs ${battle[1]?.name}`,
  url: window.location.href
})}
className="bg-[#13131a] w-1/2 py-3 rounded-xl font-bold">Share 📤</button>
                </div>
              </div>
            ) : <p className="text-center">Loading...</p>}
          </>
               )}
      </div>

      {tab === 'Rankings' && (
        <div>
          <h2 className="text-2xl font-bold text-center text-[#a8ff00] mb-4">🏆 Top 10 Players</h2>
          {[...players].sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
            <div key={p.id} className="bg-[#f1313a] p-3 rounded-lg mb-2 flex justify-between">
              <span>{i+1}. {p.name}</span>
              <span className="text-[#a8ff00]">{p.votes || 0} votes</span>
            </div>
          ))}
        </div>
      )}

      <footer className="text-center text-gray-500 text-sm mt-8 py-4">
        © 2026 CrickClash™ | A Production By ANESH
      </footer>
    </div>
  </div>
  )
}

export default CrickClash;     
        

