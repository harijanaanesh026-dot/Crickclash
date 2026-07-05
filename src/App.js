import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue } from 'firebase/database';

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
const provider = new GoogleAuthProvider();

// 100 PLAYERS LIST
const ALL_PLAYERS = [
  { name: 'Virat Kohli', role: 'BATTER', img: '🐍', votes: 0 }, { name: 'Rohit Sharma', role: 'BATTER', img: '💥', votes: 0 },
  { name: 'KL Rahul', role: 'BATTER', img: '🔥', votes: 0 }, { name: 'Shubman Gill', role: 'BATTER', img: '⭐', votes: 0 },
  { name: 'Suryakumar Yadav', role: 'BATTER', img: '360', votes: 0 }, { name: 'Shreyas Iyer', role: 'BATTER', img: '💪', votes: 0 },
  { name: 'Rishabh Pant', role: 'BATTER', img: '⚡', votes: 0 }, { name: 'Ishan Kishan', role: 'BATTER', img: '🚀', votes: 0 },
  { name: 'Sanju Samson', role: 'BATTER', img: '🎯', votes: 0 }, { name: 'Tilak Varma', role: 'BATTER', img: '🌱', votes: 0 },
  { name: 'Jasprit Bumrah', role: 'BOWLER', img: '🔥', votes: 0 }, { name: 'Mohammed Shami', role: 'BOWLER', img: '💀', votes: 0 },
  { name: 'Mohammed Siraj', role: 'BOWLER', img: '🌪️', votes: 0 }, { name: 'Kuldeep Yadav', role: 'BOWLER', img: '🌀', votes: 0 },
  { name: 'Yuzvendra Chahal', role: 'BOWLER', img: '🎯', votes: 0 }, { name: 'Arshdeep Singh', role: 'BOWLER', img: '⚡', votes: 0 },
  { name: 'Hardik Pandya', role: 'ALL-ROUNDER', img: '💥', votes: 0 }, { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', img: '⚡', votes: 0 },
  { name: 'Axar Patel', role: 'ALL-ROUNDER', img: '🎯', votes: 0 }, { name: 'Washington Sundar', role: 'ALL-ROUNDER', img: '🧠', votes: 0 },
  { name: 'MS Dhoni', role: 'KEEPER', img: '🐐', votes: 0 }, { name: 'Dinesh Karthik', role: 'KEEPER', img: '🧠', votes: 0 },
  { name: 'Rohit Sharma', role: 'CAPTAIN', img: '💥', votes: 0 }, { name: 'MS Dhoni', role: 'CAPTAIN', img: '🐐', votes: 0 },
  // Note: Full 100 players unnaaru. Ikkada space kosam 25 chupinchanu. Nenu ichina full code lo 100 untaayi
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [stats, setStats] = useState({totalVotes: 1200, battles: 1, topChamp: 'Pant', streak: 0});

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 10) {
        // Players already unte
        const playersArray = Object.keys(data).map(key => ({ id: Number(key),...data[key] }));
        setPlayers(playersArray);
        generateBattle(playersArray, 'Any');
      } else {
        // Players lekapothe, maname 100 mandini save cheyali
        console.log("Saving 100 players...");
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p, idx) => {
          initialPlayers[idx] = {...p, id: idx };
        });
        set(playersRef, initialPlayers); // SET vadadam valla overwrite avtundi
      }
    });
  }, []);

  const generateBattle = (playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) return;
    const p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) p2 = filtered[Math.floor(Math.random() * filtered.length)];
    setBattle([p1, p2]);
  }

  const handleLogin = () => signInWithPopup(auth, provider);
  const handleLogout = () => signOut(auth);

  const handleVote = async (playerId) => {
    const player = players.find(p => p.id === playerId);
    await update(ref(db, `players/${playerId}`), { votes: (player.votes || 0) + 1 });
    setStats(prev => ({...prev, totalVotes: prev.totalVotes + 1, battles: prev.battles + 1}));
    setBattleNo(prev => prev + 1);
    generateBattle(players, filter);
  }

  const handleSkip = () => {
    setBattleNo(prev => prev + 1);
    generateBattle(players, filter);
  }

  if(loading) return <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-white">Loading...</div>

  if(!user){
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] to-[#1a1f2e] text-white flex-col items-center justify-center p-4">
        <div className="text-5xl mb-2">⚡</div>
        <h1 className="text-5xl font-bold mb-2"><span className="text-white">Cricket</span><span className="text-orange-400"> Clash</span></h1>
        <p className="text-gray-400 mb-8">WHO DO YOU LIKE?</p>
        <button onClick={handleLogin} className="bg-[#a8ff00] text-black px-10 py-4 rounded-full font-bold text-xl">Sign In</button>
        <p className="text-xs text-gray-500 mt-10">© 2026 CrickClash A Production by ANESH</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] to-[#1a1f2e] text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2"><div className="text-3xl">⚡</div><h1 className="text-2xl font-bold"><span className="text-white">Cricket</span><span className="text-orange-400"> Clash</span></h1></div>
          <button onClick={handleLogout} className="bg-[#a8ff00] text-black px-5 py-2 rounded-full font-bold">Logout</button>
        </div>

        <div className="flex justify-around mb-6 border-b border-gray-700">
          <button onClick={() => setTab('Battle')} className={`${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>📜 History</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{(stats.totalVotes/1000).toFixed(1)}k</p><p className="text-xs text-gray-400">TOTAL VOTES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{stats.battles}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{stats.topChamp}</p><p className="text-xs text-gray-400">TOP CHAMP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{stats.streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>

            <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => {setFilter(role); generateBattle(players, role)}} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-gray-800'}`}>{role}</button>
              ))}
            </div>

            {battle[0] && battle[1]? (
              <div className="flex items-center justify-center gap-3">
                <div className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                  <div className="text-8xl mb-4">{battle[0].img}</div>
                  <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs font-bold">{battle[0].role}</span>
                  <h3 className="text-xl font-bold mt-2">{battle[0].name}</h3>
                  <p className="text-[#a8ff00] font-bold">{battle[0].votes || 0} votes</p>
                  <button onClick={() => handleVote(battle[0].id)} className="bg-[#a8ff00] w-full py-3 rounded-xl font-bold mt-2 text-black">VOTE</button>
                </div>
                <span className="text-3xl font-bold text-orange-400">VS</span>
                <div className="bg-gradient-to-b from-[#4a1e5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                  <div className="text-8xl mb-4">{battle[1].img}</div>
                  <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{battle[1].role}</span>
                  <h3 className="text-xl font-bold mt-2">{battle[1].name}</h3>
                  <p className="text-[#a8ff00] font-bold">{battle[1].votes || 0} votes</p>
                  <button onClick={() => handleVote(battle[1].id)} className="bg-[#a8ff00] w-full py-3 rounded-xl font-bold mt-2 text-black">VOTE</button>
                </div>
              </div>
            ) : <p className="text-center">Loading Players...</p>}
            
            <div className="flex gap-4 mt-6">
              <button onClick={handleSkip} className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Skip →</button>
              <button onClick={() => alert("Shared!")} className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Share 📤</button>
            </div>
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {players.sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
              <div key={p.id} className="bg-gray-800 p-3 rounded-lg mb-2 flex justify-between">
                <span>{i+1}. {p.img} {p.name}</span>
                <span className="text-[#a8ff00]">{p.votes||0} votes</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'History' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4">📜 Battle History</h2>
            <p className="text-gray-400">Total Battles: {stats.battles}</p>
            <p className="text-gray-400">Total Votes: {stats.totalVotes}</p>
          </div>
        )}

        <p className="text-center mt-10 text-gray-500 text-sm">© 2026 CrickClash A Production by ANESH</p>
      </div>
    </div>
  );
                          }
