import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  runTransaction,
  onValue
} from 'firebase/database';

// ⚠️ NEE REAL FIREBASE CONFIG IKKADA PETTU
const firebaseConfig = {
  apiKey: "NEE REAL API KEY",
  authDomain: "crickclash-d30fe.firebaseapp.com",
  databaseURL: "https://crickclash-d30fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crickclash-d30fe",
  storageBucket: "crickclash-d30fe.firebasestorage.app",
  messagingSenderId: "NEE REAL SENDER ID",
  appId: "NEE REAL APP ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

const INDIA_PLAYERS = [
  { name: 'Virat Kohli', role: 'BATTER', img: '👑' }, { name: 'Rohit Sharma', role: 'BATTER', img: '💥' },
  { name: 'Jasprit Bumrah', role: 'BOWLER', img: '🎯' }, { name: 'Hardik Pandya', role: 'ALL-ROUNDER', img: '⚡' },
  { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', img: '🗡️' }, { name: 'KL Rahul', role: 'BATTER', img: '🔥' },
  { name: 'Shubman Gill', role: 'BATTER', img: '🌟' }, { name: 'Suryakumar Yadav', role: 'BATTER', img: '🚀' },
  { name: 'Shreyas Iyer', role: 'BATTER', img: '🏏' }, { name: 'Rishabh Pant', role: 'BATTER', img: '💣' },
  { name: 'Mohammed Shami', role: 'BOWLER', img: '🔫' }, { name: 'Mohammed Siraj', role: 'BOWLER', img: '⚔️' },
  { name: 'Kuldeep Yadav', role: 'BOWLER', img: '🌀' }, { name: 'Yuzvendra Chahal', role: 'BOWLER', img: '🕸️' },
  { name: 'Axar Patel', role: 'ALL-ROUNDER', img: '🛡️' }, { name: 'Washington Sundar', role: 'ALL-ROUNDER', img: '✨' },
  { name: 'Arshdeep Singh', role: 'BOWLER', img: '🏹' }, { name: 'Ishan Kishan', role: 'BATTER', img: '💨' },
  { name: 'Sanju Samson', role: 'BATTER', img: '👊' }, { name: 'Tilak Varma', role: 'BATTER', img: '🌱' },
  { name: 'Rinku Singh', role: 'BATTER', img: '💪' }, { name: 'Shivam Dube', role: 'ALL-ROUNDER', img: '🏋️' },
  { name: 'Ravi Bishnoi', role: 'BOWLER', img: '🐝' }, { name: 'Prasidh Krishna', role: 'BOWLER', img: '🚄' },
  { name: 'Avesh Khan', role: 'BOWLER', img: '🦂' }, { name: 'Deepak Chahar', role: 'ALL-ROUNDER', img: '🌪️' },
  { name: 'Shardul Thakur', role: 'ALL-ROUNDER', img: '🦁' }, { name: 'Bhuvneshwar Kumar', role: 'BOWLER', img: '🎭' },
  { name: 'Rahul Tripathi', role: 'BATTER', img: '⚡' }, { name: 'Prithvi Shaw', role: 'BATTER', img: '💫' },
  { name: 'Devdutt Padikkal', role: 'BATTER', img: '🌸' }, { name: 'Ruturaj Gaikwad', role: 'BATTER', img: '👨‍✈️' },
  { name: 'Krunal Pandya', role: 'ALL-ROUNDER', img: '🔨' }, { name: 'Venkatesh Iyer', role: 'ALL-ROUNDER', img: '🏇' },
  { name: 'Umran Malik', role: 'BOWLER', img: '🚀' }, { name: 'T Natarajan', role: 'BOWLER', img: '🌙' },
  { name: 'Mayank Agarwal', role: 'BATTER', img: '🛡️' }, { name: 'Ajinkya Rahane', role: 'BATTER', img: '🧠' },
  { name: 'Cheteshwar Pujara', role: 'BATTER', img: '🏰' }, { name: 'R Ashwin', role: 'ALL-ROUNDER', img: '🎓' },
  { name: 'Yashasvi Jaiswal', role: 'BATTER', img: '🌅' }, { name: 'Nitish Rana', role: 'BATTER', img: '🐯' },
  { name: 'Jitesh Sharma', role: 'BATTER', img: '⚡' }, { name: 'Harshal Patel', role: 'BOWLER', img: '🪄' },
  { name: 'Rahul Chahar', role: 'BOWLER', img: '🎩' }, { name: 'Dinesh Karthik', role: 'BATTER', img: '👴' },
  { name: 'Manish Pandey', role: 'BATTER', img: '🎯' }, { name: 'Varun Chakravarthy', role: 'BOWLER', img: '🌀' },
  { name: 'Khaleel Ahmed', role: 'BOWLER', img: '🌊' },
];

const WORLD_PLAYERS = [
  { name: 'Babar Azam', role: 'BATTER', img: '👑' }, { name: 'Pat Cummins', role: 'BOWLER', img: '🎯' },
  { name: 'Ben Stokes', role: 'ALL-ROUNDER', img: '⚡' }, { name: 'Jos Buttler', role: 'BATTER', img: '💥' },
  { name: 'Kane Williamson', role: 'BATTER', img: '🧠' }, { name: 'Rashid Khan', role: 'BOWLER', img: '🌀' },
  { name: 'David Warner', role: 'BATTER', img: '💣' }, { name: 'Steve Smith', role: 'BATTER', img: '📚' },
  { name: 'Glenn Maxwell', role: 'ALL-ROUNDER', img: '🎪' }, { name: 'Mitchell Starc', role: 'BOWLER', img: '🏹' },
  { name: 'Joe Root', role: 'BATTER', img: '🌳' }, { name: 'Jofra Archer', role: 'BOWLER', img: '🏹' },
  { name: 'Jonny Bairstow', role: 'BATTER', img: '🔥' }, { name: 'Shaheen Afridi', role: 'BOWLER', img: '🦅' },
  { name: 'Mohammad Rizwan', role: 'BATTER', img: '🧤' }, { name: 'Shadab Khan', role: 'ALL-ROUNDER', img: '⭐' },
  { name: 'Quinton de Kock', role: 'BATTER', img: '🧤' }, { name: 'Kagiso Rabada', role: 'BOWLER', img: '🦁' },
  { name: 'Anrich Nortje', role: 'BOWLER', img: '🚄' }, { name: 'Trent Boult', role: 'BOWLER', img: '🌊' },
  { name: 'Devon Conway', role: 'BATTER', img: '🏗️' }, { name: 'Glenn Phillips', role: 'ALL-ROUNDER', img: '⚡' },
  { name: 'Angelo Mathews', role: 'ALL-ROUNDER', img: '🛡️' }, { name: 'Wanindu Hasaranga', role: 'ALL-ROUNDER', img: '🌀' },
  { name: 'Shakib Al Hasan', role: 'ALL-ROUNDER', img: '👑' }, { name: 'Litton Das', role: 'BATTER', img: '📖' },
  { name: 'Taskin Ahmed', role: 'BOWLER', img: '💪' }, { name: 'Nicholas Pooran', role: 'BATTER', img: '💣' },
  { name: 'Andre Russell', role: 'ALL-ROUNDER', img: '🏋️' }, { name: 'Sunil Narine', role: 'ALL-ROUNDER', img: '🎭' },
  { name: 'Travis Head', role: 'BATTER', img: '🎯' }, { name: 'Marcus Stoinis', role: 'ALL-ROUNDER', img: '🔨' },
  { name: 'Adam Zampa', role: 'BOWLER', img: '🕸️' }, { name: 'Josh Hazlewood', role: 'BOWLER', img: '🧱' },
  { name: 'Heinrich Klaasen', role: 'BATTER', img: '💥' }, { name: 'Aiden Markram', role: 'BATTER', img: '⭐' },
  { name: 'Tabraiz Shamsi', role: 'BOWLER', img: '🎩' }, { name: 'Harry Brook', role: 'BATTER', img: '🌟' },
  { name: 'Mark Wood', role: 'BOWLER', img: '🪓' }, { name: 'Sam Curran', role: 'ALL-ROUNDER', img: '⚡' },
  { name: 'Fakhar Zaman', role: 'BATTER', img: '🌪️' }, { name: 'Haris Rauf', role: 'BOWLER', img: '🚀' },
  { name: 'Naseem Shah', role: 'BOWLER', img: '🌟' }, { name: 'Martin Guptill', role: 'BATTER', img: '🏹' },
  { name: 'Tim Southee', role: 'BOWLER', img: '👴' }, { name: 'Daryl Mitchell', role: 'ALL-ROUNDER', img: '🛠️' },
  { name: 'Pathum Nissanka', role: 'BATTER', img: '🌸' }, { name: 'Maheesh Theekshana', role: 'BOWLER', img: '🌀' },
  { name: 'Towhid Hridoy', role: 'BATTER', img: '❤️' },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [battleCount, setBattleCount] = useState(0);
  const = useState('INDIA'); // setMode teesesam
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [streak, setStreak] = useState(0);
  const [filter, setFilter] = useState('Any');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const votesRef = ref(db, 'votes');
    const countRef = ref(db, 'battleCount');
    const unsubVotes = onValue(votesRef, (snapshot) => setVotes(snapshot.val() || {}));
    const unsubCount = onValue(countRef, (snapshot) => setBattleCount(snapshot.val() || 0));
    return () => { unsubVotes(); unsubCount(); };
  }, []);

  const players = INDIA_PLAYERS; // Direct INDIA pettesam

  useEffect(() => {
    if (players.length >= 2) {
      let filtered = players;
      if(filter!== 'Any') filtered = players.filter(p => p.role === filter);
      if(filtered.length < 2) filtered = players;
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      setPlayer1(shuffled[0]);
      setPlayer2(shuffled[1]);
    }
  }, [players, battleCount, filter]); // mode teesesam

  const handleLogin = async () => {
    try { const result = await signInWithPopup(auth, provider); setUser(result.user); }
    catch (error) { console.error("Login Error:", error); }
  };

  const handleLogout = () => signOut(auth);

  const handleVote = async (playerName) => {
    if (!user) return;
    await runTransaction(ref(db, `votes/${playerName}`), (current) => (current || 0) + 1);
    await runTransaction(ref(db, 'battleCount'), (current) => (current || 0) + 1);
    setStreak(s => s + 1);
  };

  const handleSkip = () => {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setPlayer1(shuffled[0]); setPlayer2(shuffled[1]);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'CrickClash Battle', text: `Who will win? ${player1?.name} vs ${player2?.name}`, url: window.location.href });
    } else { alert("Share link: " + window.location.href); }
  };

  const getVoteCount = (playerName) => votes[playerName] || 0;
  const totalVotes = Object.values(votes).reduce((a,b)=>a+b,0);
  const topChamp = Object.keys(votes).length > 0? Object.keys(votes).reduce((a, b) => votes[a] > votes[b]? a : b) : 'None';

  if (loading) return <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white text-2xl">Loading...</div>;

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-2">⚡ Cricket <span className="text-orange-400">Clash</span></h1>
        <p className="text-gray-400 mb-2">Built by ANESH</p>
        <p className="text-sm text-gray-500 mb-8">The ANESH of Cricket</p>
        <button onClick={handleLogin} className="bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg">Sign In</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">⚡ Cricket <span className="text-orange-400">Clash</span></h1>
          <button onClick={handleLogout} className="bg-green-500 text-black px-6 py-2 rounded-full font-bold">Logout</button>
        </header>

        <div className="flex justify-around mb-4 border-b border-gray-800">
          <button className="text-green-400 font-bold border-b-2 border-green-400 pb-2">⚔️ Battle</button>
          <button className="text-gray-500 pb-2">🏆 Rankings</button>
          <button className="text-gray-500 pb-2">📜 History</button>
        </div>

        <div className="grid grid-cols-4 text-center mb-6">
          <div><p className="text-2xl font-bold text-orange-400">{(totalVotes/1000).toFixed(1)}k</p><p className="text-xs text-gray-400">TOTAL VOTES</p></div>
          <div><p className="text-2xl font-bold text-orange-400">{battleCount}</p><p className="text-xs text-gray-400">BATTLES</p></div>
          <div><p className="text-lg font-bold text-orange-400 truncate">{topChamp.split(' ')[0]}</p><p className="text-xs text-gray-400">TOP CHAMP</p></div>
          <div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
        </div>

        <h2 className="text-center text-gray-400 tracking-widest">WHO DO YOU LIKE?</h2>
        <h1 className="text-center text-4xl font-bold mb-4">Battle <span className="text-green-400">{battleCount + 1}</span></h1>

        <div className="flex gap-2 mb-6">
          {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 px-4 py-2 rounded-full font-bold ${filter===f?'bg-green-500 text-black':'bg-gray-800'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-7xl mb-3">{player1?.img}</div>
            <span className="bg-orange-500 text-xs px-3 py-1 rounded-full font-bold">{player1?.role}</span>
            <h3 className="text-xl font-bold mt-2">{player1?.name}</h3>
            <p className="text-green-400 font-bold">{getVoteCount(player1?.name)} votes</p>
            <button onClick={() => handleVote(player1?.name)} className="w-full bg-green-500 text-black mt-3 py-3 rounded-lg font-bold text-lg">VOTE</button>
          </div>

          <span className="text-4xl font-bold text-orange-400">VS</span>

          <div className="flex-1 bg-gradient-to-br from-purple-900 to-purple-950 rounded-2xl p-4 text-center shadow-lg">
            <div className="text-7xl mb-3">{player2?.img}</div>
            <span className="bg-green-500 text-xs px-3 py-1 rounded-full font-bold">{player2?.role}</span>
            <h3 className="text-xl font-bold mt-2">{player2?.name}</h3>
            <p className="text-green-400 font-bold">{getVoteCount(player2?.name)} votes</p>
            <button onClick={() => handleVote(player2?.name)} className="w-full bg-green-500 text-black mt-3 py-3 rounded-lg font-bold text-lg">VOTE</button>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={handleSkip} className="flex-1 bg-gray-800 py-3 rounded-lg font-bold text-lg">Skip →</button>
          <button onClick={handleShare} className="flex-1 bg-gray-800 py-3 rounded-lg font-bold text-lg">Share 📤</button>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm border-t border-gray-800 pt-4">
          © 2026 CrickClash Created by ANESH. Founder & CEO
        </div>
      </div>
    </div>
  );
    }
