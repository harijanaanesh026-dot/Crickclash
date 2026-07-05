import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, update, onValue } from 'firebase/database';

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

// TOTAL 100 PLAYERS
const ALL_PLAYERS = [
  // BATTER 35
  { name: 'Virat Kohli', role: 'BATTER', img: '👑', color: 'from-orange-600 to-red-600' }, { name: 'Rohit Sharma', role: 'BATTER', img: '💥', color: 'from-orange-600 to-red-600' },
  { name: 'KL Rahul', role: 'BATTER', img: '🔥', color: 'from-orange-600 to-red-600' }, { name: 'Shubman Gill', role: 'BATTER', img: '⭐', color: 'from-orange-600 to-red-600' },
  { name: 'Suryakumar Yadav', role: 'BATTER', img: '360', color: 'from-orange-600 to-red-600' }, { name: 'Shreyas Iyer', role: 'BATTER', img: '💪', color: 'from-orange-600 to-red-600' },
  { name: 'Rishabh Pant', role: 'BATTER', img: '⚡', color: 'from-orange-600 to-red-600' }, { name: 'Ishan Kishan', role: 'BATTER', img: '🚀', color: 'from-orange-600 to-red-600' },
  { name: 'Sanju Samson', role: 'BATTER', img: '🎯', color: 'from-orange-600 to-red-600' }, { name: 'Tilak Varma', role: 'BATTER', img: '🌱', color: 'from-orange-600 to-red-600' },
  { name: 'Rinku Singh', role: 'BATTER', img: '🔨', color: 'from-orange-600 to-red-600' }, { name: 'Prithvi Shaw', role: 'BATTER', img: '⚡', color: 'from-orange-600 to-red-600' },
  { name: 'Devdutt Padikkal', role: 'BATTER', img: '🌟', color: 'from-orange-600 to-red-600' }, { name: 'Ruturaj Gaikwad', role: 'BATTER', img: '👑', color: 'from-orange-600 to-red-600' },
  { name: 'Rahul Dravid', role: 'BATTER', img: '🧱', color: 'from-orange-600 to-red-600' }, { name: 'Ajinkya Rahane', role: 'BATTER', img: '🎩', color: 'from-orange-600 to-red-600' },
  { name: 'Sachin Tendulkar', role: 'BATTER', img: '🐐', color: 'from-orange-600 to-red-600' }, { name: 'Yashasvi Jaiswal', role: 'BATTER', img: '💎', color: 'from-orange-600 to-red-600' },
  { name: 'Vaibhav Sooryavanshi', role: 'BATTER', img: '🌟', color: 'from-orange-600 to-red-600' }, { name: 'Abhishek Sharma', role: 'BATTER', img: '💥', color: 'from-orange-600 to-red-600' },
  { name: 'Mayank Agarwal', role: 'BATTER', img: '🔥', color: 'from-orange-600 to-red-600' }, { name: 'Nitish Rana', role: 'BATTER', img: '💪', color: 'from-orange-600 to-red-600' },
  { name: 'Manish Pandey', role: 'BATTER', img: '⭐', color: 'from-orange-600 to-red-600' }, { name: 'Karthik Nair', role: 'BATTER', img: '🎯', color: 'from-orange-600 to-red-600' },
  { name: 'Sarfaraz Khan', role: 'BATTER', img: '🔨', color: 'from-orange-600 to-red-600' }, { name: 'Raj Bawa', role: 'BATTER', img: '🚀', color: 'from-orange-600 to-red-600' },
  { name: 'Riyan Parag', role: 'BATTER', img: '⚡', color: 'from-orange-600 to-red-600' }, { name: 'Anmolpreet Singh', role: 'BATTER', img: '🌱', color: 'from-orange-600 to-red-600' },
  { name: 'Rajat Patidar', role: 'BATTER', img: '💎', color: 'from-orange-600 to-red-600' }, { name: 'Priyank Panchal', role: 'BATTER', img: '🧱', color: 'from-orange-600 to-red-600' },
  { name: 'Cheteshwar Pujara', role: 'BATTER', img: '🎩', color: 'from-orange-600 to-red-600' }, { name: 'Hanuma Vihari', role: 'BATTER', img: '👑', color: 'from-orange-600 to-red-600' },
  { name: 'Shikhar Dhawan', role: 'BATTER', img: '💥', color: 'from-orange-600 to-red-600' }, { name: 'Gautam Gambhir', role: 'BATTER', img: '🔥', color: 'from-orange-600 to-red-600' },
  { name: 'Robin Uthappa', role: 'BATTER', img: '⭐', color: 'from-orange-600 to-red-600' },

  // BOWLER 30
  { name: 'Jasprit Bumrah', role: 'BOWLER', img: '💀', color: 'from-blue-600 to-indigo-700' }, { name: 'Mohammed Shami', role: 'BOWLER', img: '🔥', color: 'from-blue-600 to-indigo-700' },
  { name: 'Mohammed Siraj', role: 'BOWLER', img: '🌪️', color: 'from-blue-600 to-indigo-700' }, { name: 'Kuldeep Yadav', role: 'BOWLER', img: '🌀', color: 'from-blue-600 to-indigo-700' },
  { name: 'Yuzvendra Chahal', role: 'BOWLER', img: '🎯', color: 'from-blue-600 to-indigo-700' }, { name: 'Arshdeep Singh', role: 'BOWLER', img: '⚡', color: 'from-blue-600 to-indigo-700' },
  { name: 'Ravi Bishnoi', role: 'BOWLER', img: '🕸️', color: 'from-blue-600 to-indigo-700' }, { name: 'Prasidh Krishna', role: 'BOWLER', img: '💪', color: 'from-blue-600 to-indigo-700' },
  { name: 'Avesh Khan', role: 'BOWLER', img: '🚀', color: 'from-blue-600 to-indigo-700' }, { name: 'Bhuvneshwar Kumar', role: 'BOWLER', img: '🎯', color: 'from-blue-600 to-indigo-700' },
  { name: 'Umran Malik', role: 'BOWLER', img: '💨', color: 'from-blue-600 to-indigo-700' }, { name: 'T Natarajan', role: 'BOWLER', img: '🌙', color: 'from-blue-600 to-indigo-700' },
  { name: 'Harshal Patel', role: 'BOWLER', img: '🔥', color: 'from-blue-600 to-indigo-700' }, { name: 'Rahul Chahar', role: 'BOWLER', img: '🌀', color: 'from-blue-600 to-indigo-700' },
  { name: 'Varun Chakaravarthy', role: 'BOWLER', img: '🕶️', color: 'from-blue-600 to-indigo-700' }, { name: 'Khaleel Ahmed', role: 'BOWLER', img: '⚡', color: 'from-blue-600 to-indigo-700' },
  { name: 'Deepak Chahar', role: 'BOWLER', img: '🎯', color: 'from-blue-600 to-indigo-700' }, { name: 'Shardul Thakur', role: 'BOWLER', img: '💪', color: 'from-blue-600 to-indigo-700' },
  { name: 'Navdeep Saini', role: 'BOWLER', img: '💨', color: 'from-blue-600 to-indigo-700' }, { name: 'Jaydev Unadkat', role: 'BOWLER', img: '🌪️', color: 'from-blue-600 to-indigo-700' },
  { name: 'Chetan Sakariya', role: 'BOWLER', img: '🌀', color: 'from-blue-600 to-indigo-700' }, { name: 'Lukman Meriwala', role: 'BOWLER', img: '🔥', color: 'from-blue-600 to-indigo-700' },
  { name: 'Aniket Choudhary', role: 'BOWLER', img: '💀', color: 'from-blue-600 to-indigo-700' }, { name: 'Sandeep Sharma', role: 'BOWLER', img: '🎯', color: 'from-blue-600 to-indigo-700' },
  { name: 'Umesh Yadav', role: 'BOWLER', img: '⚡', color: 'from-blue-600 to-indigo-700' }, { name: 'Ishant Sharma', role: 'BOWLER', img: '🌙', color: 'from-blue-600 to-indigo-700' },
  { name: 'Mohit Sharma', role: 'BOWLER', img: '🕸️', color: 'from-blue-600 to-indigo-700' }, { name: 'Praveen Kumar', role: 'BOWLER', img: '💪', color: 'from-blue-600 to-indigo-700' },
  { name: 'Munaf Patel', role: 'BOWLER', img: '🚀', color: 'from-blue-600 to-indigo-700' }, { name: 'Zaheer Khan', role: 'BOWLER', img: '👑', color: 'from-blue-600 to-indigo-700' },

  // ALL-ROUNDER 15
  { name: 'Hardik Pandya', role: 'ALL-ROUNDER', img: '💥', color: 'from-green-600 to-emerald-700' }, { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', img: '⚡', color: 'from-green-600 to-emerald-700' },
  { name: 'Axar Patel', role: 'ALL-ROUNDER', img: '🎯', color: 'from-green-600 to-emerald-700' }, { name: 'Washington Sundar', role: 'ALL-ROUNDER', img: '🧠', color: 'from-green-600 to-emerald-700' },
  { name: 'Shivam Dube', role: 'ALL-ROUNDER', img: '💪', color: 'from-green-600 to-emerald-700' }, { name: 'Krunal Pandya', role: 'ALL-ROUNDER', img: '🔥', color: 'from-green-600 to-emerald-700' },
  { name: 'Venkatesh Iyer', role: 'ALL-ROUNDER', img: '🚀', color: 'from-green-600 to-emerald-700' }, { name: 'R Ashwin', role: 'ALL-ROUNDER', img: '🧠', color: 'from-green-600 to-emerald-700' },
  { name: 'Deepak Hooda', role: 'ALL-ROUNDER', img: '🔨', color: 'from-green-600 to-emerald-700' }, { name: 'Nitish Reddy', role: 'ALL-ROUNDER', img: '🌟', color: 'from-green-600 to-emerald-700' },
  { name: 'Shahbaz Ahmed', role: 'ALL-ROUNDER', img: '⚡', color: 'from-green-600 to-emerald-700' }, { name: 'Rahul Tewatia', role: 'ALL-ROUNDER', img: '💥', color: 'from-green-600 to-emerald-700' },
  { name: 'Yusuf Pathan', role: 'ALL-ROUNDER', img: '💥', color: 'from-green-600 to-emerald-700' }, { name: 'Irfan Pathan', role: 'ALL-ROUNDER', img: '🌪️', color: 'from-green-600 to-emerald-700' },
  { name: 'Stuart Binny', role: 'ALL-ROUNDER', img: '💪', color: 'from-green-600 to-emerald-700' },

  // KEEPER 10
  { name: 'MS Dhoni', role: 'KEEPER', img: '🐐', color: 'from-yellow-600 to-orange-700' }, { name: 'Rishabh Pant', role: 'KEEPER', img: '⚡', color: 'from-yellow-600 to-orange-700' },
  { name: 'KL Rahul', role: 'KEEPER', img: '🔥', color: 'from-yellow-600 to-orange-700' }, { name: 'Ishan Kishan', role: 'KEEPER', img: '🚀', color: 'from-yellow-600 to-orange-700' },
  { name: 'Sanju Samson', role: 'KEEPER', img: '🎯', color: 'from-yellow-600 to-orange-700' }, { name: 'Dinesh Karthik', role: 'KEEPER', img: '🧠', color: 'from-yellow-600 to-orange-700' },
  { name: 'Jitesh Sharma', role: 'KEEPER', img: '💥', color: 'from-yellow-600 to-orange-700' }, { name: 'KS Bharat', role: 'KEEPER', img: '💪', color: 'from-yellow-600 to-orange-700' },
  { name: 'Wriddhiman Saha', role: 'KEEPER', img: '🧤', color: 'from-yellow-600 to-orange-700' }, { name: 'Dhruv Jurel', role: 'KEEPER', img: '🌟', color: 'from-yellow-600 to-orange-700' },

  // CAPTAIN 10
  { name: 'Virat Kohli', role: 'CAPTAIN', img: '👑', color: 'from-purple-600 to-pink-700' }, { name: 'Rohit Sharma', role: 'CAPTAIN', img: '💥', color: 'from-purple-600 to-pink-700' },
  { name: 'MS Dhoni', role: 'CAPTAIN', img: '🐐', color: 'from-purple-600 to-pink-700' }, { name: 'Hardik Pandya', role: 'CAPTAIN', img: '⚡', color: 'from-purple-600 to-pink-700' },
  { name: 'KL Rahul', role: 'CAPTAIN', img: '🎯', color: 'from-purple-600 to-pink-700' }, { name: 'Shubman Gill', role: 'CAPTAIN', img: '⭐', color: 'from-purple-600 to-pink-700' },
  { name: 'Rishabh Pant', role: 'CAPTAIN', img: '🔥', color: 'from-purple-600 to-pink-700' }, { name: 'Shreyas Iyer', role: 'CAPTAIN', img: '💪', color: 'from-purple-600 to-pink-700' },
  { name: 'Ajinkya Rahane', role: 'CAPTAIN', img: '🎩', color: 'from-purple-600 to-pink-700' }, { name: 'Ravindra Jadeja', role: 'CAPTAIN', img: '⚡', color: 'from-purple-600 to-pink-700' },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(5);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [stats, setStats] = useState({totalVotes: 0, battles: 4, topChamp: 'Virat', streak: 0});

  const saveInitialPlayers = async (playerList) => {
    const updates = {};
    playerList.forEach((p) => {
      updates[`players/${p.id}`] = p;
    });
    await update(ref(db), updates);
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setPlayers(playersArray);
        generateBattle(playersArray, 'Any');
      } else {
        const initialPlayers = ALL_PLAYERS.map((p, idx) => ({...p, id: idx, votes: 0 }));
        setPlayers(initialPlayers);
        saveInitialPlayers(initialPlayers); // Firebase ki save cheyadam
        generateBattle(initialPlayers, 'Any');
      }
    });
  }, []);

  const generateBattle = (playerList, role) => {
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
    const btn = document.getElementById(`vote-${playerId}`);
    if(btn) {
      btn.innerHTML = "⚡ +1";
      setTimeout(() => { btn.innerHTML = "VOTE"; }, 800);
    }
    const player = players.find(p => p.id == playerId);
    await update(ref(db, `players/${playerId}`), { votes: (player.votes || 0) + 1 });
    setStats(prev => ({...prev, totalVotes: prev.totalVotes + 1, battles: prev.battles + 1}));
    setBattleNo(prev => prev + 1);
    generateBattle(players, filter);
    setTimeout(() => {
      if(window.confirm("Share cheddama?")){
        navigator.share({title: "CrickClash by Anesh", text: "Nenu " + player.name + " ki vote chesanu! Nu kuda chey 🔥", url: "https://crickclash.vercel.app"}).catch(()=>{});
      }
    }, 1000);
  }

  const handleSkip = () => {
    setBattleNo(prev => prev + 1);
    generateBattle(players, filter);
  }

  if(loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>

  if(!user){
    return (
      <div className="min-h-screen bg-gray-950 text-white flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-bold mb-2"><span className="text-white">Crick</span><span className="text-orange-500">Clash</span></h1>
        <p className="text-gray-400 mb-8">Created by Anesh 🔥</p>
        <p className="text-xl mb-6">WHO DO YOU LIKE?</p>
        <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-full font-bold text-xl">
          🔵 Continue with Google
        </button>
        <p className="text-xs text-gray-500 mt-10">© 2026 CrickClash A Production by ANESH</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold"><span className="text-white">Crick</span><span className="text-orange-500">Clash</span></h1>
            <p className="text-xs text-gray-400">Hi {user.displayName} 🔥</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 px-6 py-2 rounded-full font-bold text-black">Logout</button>
        </div>

        <div className="flex justify-around mb-6 border-b border-gray-700">
          <button onClick={() => setTab('Battle')} className={`${tab === 'Battle'? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'} font-bold pb-2`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`${tab === 'Rankings'? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'} font-bold pb-2`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`${tab === 'History'? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'} font-bold pb-2`}>📜 History</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{(stats.totalVotes/1000).toFixed(1)}k</p><p className="text-xs text-gray-400">TOTAL VOTES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{stats.battles}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{stats.topChamp}</p><p className="text-xs text-gray-400">TOP CHAMP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{stats.streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>

            <p className="text-center text-gray-400">WHO DO YOU LIKE?</p>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-green-400">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => {setFilter(role); generateBattle(players, role)}} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-green-500 text-black' : 'bg-gray-800'}`}>{role}</button>
              ))}
            </div>

            {battle[0] && battle[1] && (
              <div className="flex items-center justify-center gap-4">
                <div className={`bg-gradient-to-br ${battle[0].color} p-4 rounded-2xl w-1/2 text-center`}>
                  <div className="text-6xl mb-2">{battle[0].img}</div>
                  <span className="bg-orange-500 px-3 py-1 rounded-full text-xs font-bold">{battle[0].role}</span>
                  <h3 className="text-xl font-bold mt-2">{battle[0].name}</h3>
                  <p className="text-green-300">{battle[0].votes || 0} votes</p>
                  <button id={`vote-${battle[0].id}`} onClick={() => handleVote(battle[0].id)} className="bg-green-500 w-full py-3 rounded-xl font-bold mt-2 text-black">VOTE</button>
                </div>
                <span className="text-3xl font-bold text-orange-400">VS</span>
                <div className={`bg-gradient-to-br ${battle[1].color} p-4 rounded-2xl w-1/2 text-center`}>
                  <div className="text-6xl mb-2">{battle[1].img}</div>
                  <span className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold">{battle[1].role}</span>
                  <h3 className="text-xl font-bold mt-2">{battle[1].name}</h3>
                  <p className="text-green-300">{battle[1].votes || 0} votes</p>
                  <button id={`vote-${battle[1].id}`} onClick={() => handleVote(battle[1].id)} className="bg-green-500 w-full py-3 rounded-xl font-bold mt-2 text-black">VOTE</button>
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <button onClick={handleSkip} className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Skip →</button>
              <button onClick={() => navigator.share({title: "CrickClash by Anesh", url: "https://crickclash.vercel.app"})} className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Share 📤</button>
            </div>
          </>
        )}

        {tab === 'Rankings' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-4">🏆 Top 10 Players</h2>
            {players.sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
              <div key={p.id} className="bg-gray-800 p-3 rounded-lg mb-2 flex justify-between">
                <span>{i+1}. {p.img} {p.name}</span>
                <span className="text-green-400">{p.votes||0} votes</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'History' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-4">📜 Battle History</h2>
            <p className="text-gray-400">Total Battles: {stats.battles}</p>
            <p className="text-gray-400">Total Votes: {stats.totalVotes}</p>
          </div>
        )}

        <p className="text-center mt-10 text-gray-500 text-sm">© 2026 CrickClash A Production by ANESH. Founder & CEO</p>
      </div>
    </div>
  );
   }
