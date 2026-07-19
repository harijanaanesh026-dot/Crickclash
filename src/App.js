import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment } from 'firebase/database'; // increment important

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
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313114.6.jpg' },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg' },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  //... migatha players kuda same ga pettu. Nuvvu unna motham 20 players
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
  const [voteAnim, setVoteAnim] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const getToday = () => new Date().toISOString().split('T')[0];

  // Timer
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

  const checkAndResetDaily = useCallback(async () => {
    const today = getToday();
    const metaRef = ref(db, 'meta');
    const snap = await get(metaRef);
    const metaData = snap.val();
    if (!metaData || metaData.lastResetDate!== today) {
      const resetPlayers = {};
      ALL_PLAYERS.forEach(p => { resetPlayers[p.id] = {...p, votes: 0}; });
      await set(ref(db, 'players'), resetPlayers);
      await set(metaRef, { lastResetDate: today, totalVotes: 0 });
    }
  }, []);

  const generateBattle = useCallback((playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) { p2 = filtered[Math.floor(Math.random() * filtered.length)]; }
    setBattle([p1, p2]);
  }, []);

  // MAIN VOTE FUNCTION - IDHE FIX
  const handleVote = async (votedPlayerId) => {
    if(!user || votesToday >= DAILY_VOTE_LIMIT || isVoting) return;
    setIsVoting(true);
    setVoteAnim(votedPlayerId);
    setTimeout(() => setVoteAnim(null), 500);

    const today = getToday();
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const votedPlayer = players.find(p => p.id === votedPlayerId);

    await update(userRef, { votesToday: increment(1), lastVoteDate: today });
    await update(playerRef, { votes: increment(1) });
    await update(ref(db, 'meta'), { totalVotes: increment(1) });

    setTimeout(() => {
      setIsVoting(false);
      setBattleNo(b => b + 1);
      generateBattle(players, filter);
    }, 1000);
  };

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };

  useEffect(() => {
    checkAndResetDaily();
    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = ALL_PLAYERS.map(p => ({...p, votes: data[p.id]?.votes || 0 }));
        setPlayers(playersArray);
        generateBattle(playersArray, filter);
        const sorted = [...playersArray].sort((a,b) => b.votes - a.votes);
        setTopPlayer(sorted[0]);
        setTotalVotes(sorted.reduce((sum, p) => sum + p.votes, 0));
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(playersRef, initialPlayers);
      }
    });

    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData && userData.lastVoteDate === getToday()){
            setVotesToday(userData.votesToday || 0);
          } else {
            setVotesToday(0);
          }
        });
      }
    })
  }, [checkAndResetDaily, generateBattle, filter]);
    if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;
  if(!user) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><button onClick={handleGoogleLogin} className="bg-blue-500 px-6 py-3 rounded-lg text-white font-bold">Login with Google</button></div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1></div>
          {user && <img src={user.photoURL} onClick={handleLogout} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" />}
        </header>

        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm">Today's Votes Left</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday} / {DAILY_VOTE_LIMIT}</p>
          <p className="text-xs text-gray-500 mt-1">Reset in: {timeLeft}</p>
        </div>

        <div className="grid grid-cols-3 text-center mb-6">
          <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL</p></div>
          <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
          <div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP</p></div>
        </div>

        <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

        {battle[0] && battle[1]? (
          <div className="flex items-center justify-center gap-2">
            {[battle[0], battle[1]].map(p => (
              <div key={p.id} className="bg-[#13131a] p-4 rounded-2xl w-1/2 text-center">
                <img src={p.image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-[#a8ff00]" />
                <h3 className="text-xl font-bold mt-2">{p.name}</h3>
                <p className="text-[#a8ff00] font-bold">{p.votes} votes</p>
                <button onClick={() => handleVote(p.id)} disabled={isVoting || votesToday >= DAILY_VOTE_LIMIT}
                  className="w-full bg-[#a8ff00] text-black py-3 rounded-xl font-bold mt-2 disabled:bg-gray-600">
                  {isVoting? 'VOTING...' : 'VOTE'}
                </button>
              </div>
            ))}
          </div>
        ) : <p className="text-center">Loading...</p>}
      </div>
    </div>
  );
  }
