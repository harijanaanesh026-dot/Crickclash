import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  getRedirectResult
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  runTransaction,
  onValue
} from 'firebase/database';
import {
  LogOut,
  Flame
} from 'lucide-react';

// ⚠️ NEE REAL FIREBASE CONFIG IKKADA PASTE CHEY
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

// 50 INDIAN PLAYERS
const INDIA_PLAYERS = [
  { name: 'Virat Kohli', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Rohit Sharma', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Jasprit Bumrah', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Hardik Pandya', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Ravindra Jadeja', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'KL Rahul', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Shubman Gill', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Suryakumar Yadav', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Shreyas Iyer', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Rishabh Pant', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Mohammed Shami', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Mohammed Siraj', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Kuldeep Yadav', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Yuzvendra Chahal', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Axar Patel', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Washington Sundar', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Arshdeep Singh', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Ishan Kishan', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Sanju Samson', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Tilak Varma', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Rinku Singh', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Shivam Dube', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Ravi Bishnoi', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Prasidh Krishna', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Avesh Khan', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Deepak Chahar', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Shardul Thakur', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Bhuvneshwar Kumar', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Rahul Tripathi', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Prithvi Shaw', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Devdutt Padikkal', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Ruturaj Gaikwad', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Krunal Pandya', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Venkatesh Iyer', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Umran Malik', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'T Natarajan', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Mayank Agarwal', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Ajinkya Rahane', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Cheteshwar Pujara', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'R Ashwin', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Yashasvi Jaiswal', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Nitish Rana', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Jitesh Sharma', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Harshal Patel', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Rahul Chahar', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Dinesh Karthik', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Manish Pandey', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Varun Chakravarthy', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Khaleel Ahmed', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
];

// 50 WORLD PLAYERS
const WORLD_PLAYERS = [
  { name: 'Babar Azam', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Pat Cummins', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Ben Stokes', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Jos Buttler', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Kane Williamson', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Rashid Khan', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'David Warner', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Steve Smith', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Glenn Maxwell', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Mitchell Starc', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Joe Root', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Jofra Archer', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Jonny Bairstow', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Shaheen Afridi', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Mohammad Rizwan', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Shadab Khan', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Quinton de Kock', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Kagiso Rabada', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Anrich Nortje', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Trent Boult', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Devon Conway', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Glenn Phillips', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Angelo Mathews', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Wanindu Hasaranga', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Shakib Al Hasan', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Litton Das', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Taskin Ahmed', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Nicholas Pooran', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Andre Russell', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Sunil Narine', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Travis Head', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Marcus Stoinis', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Adam Zampa', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Josh Hazlewood', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Heinrich Klaasen', role: 'Wicket-keeper', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Aiden Markram', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Tabraiz Shamsi', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Harry Brook', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Mark Wood', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Sam Curran', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Fakhar Zaman', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Haris Rauf', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Naseem Shah', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Martin Guptill', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Tim Southee', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Daryl Mitchell', role: 'All-rounder', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Pathum Nissanka', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Maheesh Theekshana', role: 'Bowler', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Towhid Hridoy', role: 'Batsman', img: 'https://i.imgur.com/8Km9tLL.png' },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [battleCount, setBattleCount] = useState(0);
  const [mode, setMode] = useState('INDIA');
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [streak, setStreak] = useState(0);

  // LOGIN FIX - SINGLE USEEFFECT
  useEffect(() => {
    setLoading(true);
    getRedirectResult(auth)
   .then((result) => { if (result) setUser(result.user); })
   .catch((error) => { console.error('Redirect Error:', error); });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, );

  useEffect(() => {
    const votesRef = ref(db, 'votes');
    const countRef = ref(db, 'battleCount');
    const unsubVotes = onValue(votesRef, (snapshot) => setVotes(snapshot.val() || {}));
    const unsubCount = onValue(countRef, (snapshot) => setBattleCount(snapshot.val() || 0));
    return () => { unsubVotes(); unsubCount(); };
  }, );

  const players = mode === 'INDIA'? INDIA_PLAYERS : WORLD_PLAYERS;

  useEffect(() => {
    if (players.length >= 2) {
      const shuffled = [...players].sort(() => 0.5 - Math.random());
      setPlayer1(shuffled[0]);
      setPlayer2(shuffled[1]);
    }
  }, [players, battleCount]);

  const handleLogin = () => signInWithRedirect(auth, provider);
  const handleLogout = () => signOut(auth);

  const handleVote = async (playerName) => {
    if (!user) return;
    await runTransaction(ref(db, `votes/${playerName}`), (current) => (current || 0) + 1);
    await runTransaction(ref(db, 'battleCount'), (current) => (current || 0) + 1);
    setStreak(s => s + 1);
  };

  const getVoteCount = (playerName) => votes[playerName] || 0;

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-2xl">Loading CrickClash...</div>;

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-2">🏏 CrickClash</h1>
        <p className="text-gray-300 mb-2">Built by ANESH • 100 Legends. 1 Platform.</p>
        <p className="text-sm text-gray-400 mb-8">The Mark Zuckerberg of Cricket</p>
        <button onClick={handleLogin} className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200">Continue with Google</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* ZUCKERBERG HEADER */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">🏏 CrickClash</h1>
            <p className="text-xs text-gray-400">Created by ANESH • Like Mark Zuckerberg</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Flame className="text-orange-500" /><span className="font-bold">{streak}</span></div>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded hover:bg-red-700"><LogOut size={18} />Logout</button>
          </div>
        </header>

        <div className="flex gap-4 mb-6 justify-center">
          <button onClick={() => setMode('INDIA')} className={`px-6 py-2 rounded font-bold ${mode === 'INDIA'? 'bg-blue-600' : 'bg-gray-700'}`}>🇮🇳 India - 50</button>
          <button onClick={() => setMode('WORLD')} className={`px-6 py-2 rounded font-bold ${mode === 'WORLD'? 'bg-blue-600' : 'bg-gray-700'}`}>🌍 World - 50</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[player1, player2].map((player, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-6 text-center border-gray-700">
              <img src={player?.img} alt={player?.name} className="w-32 h-32 mx-auto rounded-full mb-3 border-4 border-blue-500" />
              <h3 className="text-2xl font-bold">{player?.name}</h3>
              <p className="text-gray-400 mb-3">{player?.role}</p>
              <p className="text-3xl font-bold text-green-400 mb-4">{getVoteCount(player?.name)} Votes</p>
              <button onClick={() => handleVote(player?.name)} className="w-full bg-green-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-700">VOTE</button>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 text-gray-400">Total Battles: {battleCount}</div>

        {/* ZUCKERBERG FOOTER */}
        <div className="text-center mt-8 text-gray-500 text-sm border-t border-gray-800 pt-4">
          Made with 🔥 by ANESH | The Mark Zuckerberg of Cricket
        </div>
      </div>
    </div>
  );
    }
