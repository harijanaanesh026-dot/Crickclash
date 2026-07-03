import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, set, runTransaction } from 'firebase/database';

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

const INDIAN_PLAYERS = [
  { name: 'Virat Kohli', role: 'BATTER', country: 'INDIA', icon: '👑', isCaptain: true },
  { name: 'Rohit Sharma', role: 'BATTER', country: 'INDIA', icon: '🎯', isCaptain: true },
  { name: 'Jasprit Bumrah', role: 'BOWLER', country: 'INDIA', icon: '💣' },
  { name: 'Hardik Pandya', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡', isCaptain: true },
  { name: 'KL Rahul', role: 'KEEPER', country: 'INDIA', icon: '🧤' },
  { name: 'Shubman Gill', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Suryakumar Yadav', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Mohammed Shami', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Rishabh Pant', role: 'KEEPER', country: 'INDIA', icon: '🧤', isCaptain: true },
  { name: 'Shreyas Iyer', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Axar Patel', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Mohammed Siraj', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Yuzvendra Chahal', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Kuldeep Yadav', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Ishan Kishan', role: 'KEEPER', country: 'INDIA', icon: '🧤' },
  { name: 'Sanju Samson', role: 'KEEPER', country: 'INDIA', icon: '🧤' },
  { name: 'Arshdeep Singh', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Washington Sundar', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Shardul Thakur', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Deepak Chahar', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Prithvi Shaw', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Ruturaj Gaikwad', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Tilak Varma', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Rinku Singh', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Yashasvi Jaiswal', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Jitesh Sharma', role: 'KEEPER', country: 'INDIA', icon: '🧤' },
  { name: 'Rahul Tewatia', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Harshal Patel', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Umran Malik', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Avesh Khan', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Ravi Bishnoi', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Deepak Hooda', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Shivam Dube', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Mukesh Kumar', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Shahbaz Ahmed', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Rahul Tripathi', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Venkatesh Iyer', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'T Natarajan', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Bhuvneshwar Kumar', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'Dinesh Karthik', role: 'KEEPER', country: 'INDIA', icon: '🧤' },
  { name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', country: 'INDIA', icon: '⚡' },
  { name: 'Mayank Agarwal', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Manish Pandey', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Shikhar Dhawan', role: 'BATTER', country: 'INDIA', icon: '🏏', isCaptain: true },
  { name: 'Ajinkya Rahane', role: 'BATTER', country: 'INDIA', icon: '🏏', isCaptain: true },
  { name: 'Cheteshwar Pujara', role: 'BATTER', country: 'INDIA', icon: '🏏' },
  { name: 'Umesh Yadav', role: 'BOWLER', country: 'INDIA', icon: '🎯' },
  { name: 'MS Dhoni', role: 'KEEPER', country: 'INDIA', icon: '👑', isCaptain: true },
  { name: 'Vaibhav Sooryavanshi', role: 'BATTER', country: 'INDIA', icon: '⭐' }
];

const GLOBAL_PLAYERS = [
  { name: 'Babar Azam', role: 'BATTER', country: 'PAKISTAN', icon: '🏏', isCaptain: true },
  { name: 'Shaheen Afridi', role: 'BOWLER', country: 'PAKISTAN', icon: '🎯' },
  { name: 'Mohammad Rizwan', role: 'KEEPER', country: 'PAKISTAN', icon: '🧤', isCaptain: true },
  { name: 'Shadab Khan', role: 'ALL-ROUNDER', country: 'PAKISTAN', icon: '⚡' },
  { name: 'Mohammad Amir', role: 'BOWLER', country: 'PAKISTAN', icon: '🌪️' },
  { name: 'Fakhar Zaman', role: 'BATTER', country: 'PAKISTAN', icon: '🏏' },
  { name: 'Haris Rauf', role: 'BOWLER', country: 'PAKISTAN', icon: '🎯' },
  { name: 'Steve Smith', role: 'BATTER', country: 'AUSTRALIA', icon: '🏏', isCaptain: true },
  { name: 'Pat Cummins', role: 'BOWLER', country: 'AUSTRALIA', icon: '🎯', isCaptain: true },
  { name: 'Mitchell Starc', role: 'BOWLER', country: 'AUSTRALIA', icon: '🎯' },
  { name: 'Glenn Maxwell', role: 'ALL-ROUNDER', country: 'AUSTRALIA', icon: '⚡' },
  { name: 'David Warner', role: 'BATTER', country: 'AUSTRALIA', icon: '🏏' },
  { name: 'Josh Hazlewood', role: 'BOWLER', country: 'AUSTRALIA', icon: '🎯' },
  { name: 'Travis Head', role: 'BATTER', country: 'AUSTRALIA', icon: '🏏' },
  { name: 'Marcus Stoinis', role: 'ALL-ROUNDER', country: 'AUSTRALIA', icon: '⚡' },
  { name: 'Adam Zampa', role: 'BOWLER', country: 'AUSTRALIA', icon: '🎯' },
  { name: 'Cameron Green', role: 'ALL-ROUNDER', country: 'AUSTRALIA', icon: '⚡' },
  { name: 'Alex Carey', role: 'KEEPER', country: 'AUSTRALIA', icon: '🧤' },
  { name: 'Kane Williamson', role: 'BATTER', country: 'NEW ZEALAND', icon: '🏏', isCaptain: true },
  { name: 'Trent Boult', role: 'BOWLER', country: 'NEW ZEALAND', icon: '🎯' },
  { name: 'Tim Southee', role: 'BOWLER', country: 'NEW ZEALAND', icon: '🎯' },
  { name: 'Devon Conway', role: 'KEEPER', country: 'NEW ZEALAND', icon: '🧤' },
  { name: 'Mitchell Santner', role: 'ALL-ROUNDER', country: 'NEW ZEALAND', icon: '⚡' },
  { name: 'Lockie Ferguson', role: 'BOWLER', country: 'NEW ZEALAND', icon: '🎯' },
  { name: 'Joe Root', role: 'BATTER', country: 'ENGLAND', icon: '🏏', isCaptain: true },
  { name: 'Ben Stokes', role: 'ALL-ROUNDER', country: 'ENGLAND', icon: '⚡', isCaptain: true },
  { name: 'Jos Buttler', role: 'KEEPER', country: 'ENGLAND', icon: '🧤', isCaptain: true },
  { name: 'Jofra Archer', role: 'BOWLER', country: 'ENGLAND', icon: '🎯' },
  { name: 'Jonny Bairstow', role: 'KEEPER', country: 'ENGLAND', icon: '🧤' },
  { name: 'Moeen Ali', role: 'ALL-ROUNDER', country: 'ENGLAND', icon: '⚡' },
  { name: 'Sam Curran', role: 'ALL-ROUNDER', country: 'ENGLAND', icon: '⚡' },
  { name: 'Mark Wood', role: 'BOWLER', country: 'ENGLAND', icon: '🎯' },
  { name: 'Harry Brook', role: 'BATTER', country: 'ENGLAND', icon: '🏏' },
  { name: 'Liam Livingstone', role: 'ALL-ROUNDER', country: 'ENGLAND', icon: '⚡' },
  { name: 'Quinton de Kock', role: 'KEEPER', country: 'SOUTH AFRICA', icon: '🧤', isCaptain: true },
  { name: 'Kagiso Rabada', role: 'BOWLER', country: 'SOUTH AFRICA', icon: '🎯' },
  { name: 'David Miller', role: 'BATTER', country: 'SOUTH AFRICA', icon: '🏏' },
  { name: 'Anrich Nortje', role: 'BOWLER', country: 'SOUTH AFRICA', icon: '🎯' },
  { name: 'Aiden Markram', role: 'BATTER', country: 'SOUTH AFRICA', icon: '🏏', isCaptain: true },
  { name: 'Heinrich Klaasen', role: 'KEEPER', country: 'SOUTH AFRICA', icon: '🧤' },
  { name: 'Marco Jansen', role: 'ALL-ROUNDER', country: 'SOUTH AFRICA', icon: '⚡' },
  { name: 'Tabraiz Shamsi', role: 'BOWLER', country: 'SOUTH AFRICA', icon: '🎯' },
  { name: 'Rashid Khan', role: 'BOWLER', country: 'AFGHANISTAN', icon: '🎯', isCaptain: true },
  { name: 'Mohammad Nabi', role: 'ALL-ROUNDER', country: 'AFGHANISTAN', icon: '⚡' },
  { name: 'Shakib Al Hasan', role: 'ALL-ROUNDER', country: 'BANGLADESH', icon: '⚡', isCaptain: true },
  { name: 'Mustafizur Rahman', role: 'BOWLER', country: 'BANGLADESH', icon: '🎯' },
  { name: 'Wanindu Hasaranga', role: 'ALL-ROUNDER', country: 'SRI LANKA', icon: '⚡' },
  { name: 'Maheesh Theekshana', role: 'BOWLER', country: 'SRI LANKA', icon: '🎯' },
  { name: 'Nicholas Pooran', role: 'KEEPER', country: 'WEST INDIES', icon: '🧤', isCaptain: true },
  { name: 'Andre Russell', role: 'ALL-ROUNDER', country: 'WEST INDIES', icon: '⚡' }
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [battleCount, setBattleCount] = useState(0);
  const [mode, setMode] = useState('INDIA');
  const [roleFilter, setRoleFilter] = useState('Any');
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [activeTab, setActiveTab] = useState('battle');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getRedirectResult(auth).catch((e) => {
      console.error('Redirect Error:', e);
    });
  }, );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    onValue(ref(db, 'votes'), (snap) => setVotes(snap.val() || {}));
  }, []);

  useEffect(() => {
    onValue(ref(db, 'history'), (snap) => {
      const data = snap.val() || {};
      setBattleCount(Object.keys(data).length);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    onValue(ref(db, `userStreak/${user.uid}`), (snap) => {
      setStreak(snap.val() || 0);
    });
  }, );

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (e) {
      console.error('Login Error:', e);
      alert(`Login failed: ${e.message}`);
    }
  };

  const getFilteredPlayers = useCallback(() => {
    const players = mode === 'INDIA'? INDIAN_PLAYERS : GLOBAL_PLAYERS;
    if (roleFilter === 'Any') return players;
    if (roleFilter === 'Captain') return players.filter(p => p.isCaptain);
    const filter = roleFilter === 'Batters'? 'BATTER' : roleFilter === 'Bowlers'? 'BOWLER' : roleFilter === 'Keepers'? 'KEEPER' : 'ALL-ROUNDER';
    return players.filter(p => p.role === filter);
  }, [mode, roleFilter]);

  const loadNewBattle = useCallback(() => {
    const players = getFilteredPlayers();
    if (players.length < 2) return;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setPlayer1(shuffled[0]);
    setPlayer2(shuffled[1]);
  }, [getFilteredPlayers]);

  useEffect(() => {
    loadNewBattle();
  }, [loadNewBattle]);

  const handleVote = (name) => {
    runTransaction(ref(db, `votes/${name}`), (v) => (v || 0) + 1);
    runTransaction(ref(db, `userStreak/${user.uid}`), (v) => (v || 0) + 1);
    set(ref(db, `history/${Date.now()}`), {
      winner: name,
      loser: player1.name === name? player2.name : player1.name,
      timestamp: Date.now()
    });
    loadNewBattle();
  };

  const getTotalVotes = () => {
    const total = Object.values(votes).reduce((s, v) => s + v, 0);
    return (total / 1000).toFixed(1);
  };

  const getVotes = (name) => votes[name] || 0;

  const getTopChamp = () => {
    const entries = Object.entries(votes);
    if (entries.length === 0) return 'Kohli';
    return entries.sort((a, b) => b[1] - a[1])[0][0].split(' ')[0];
  };

  const shareBattle = () => {
    const text = `Cricket Clash Battle ${battleCount + 1}: ${player1.name} vs ${player2.name}! Who wins?`;
    if (navigator.share) {
      navigator.share({ title: 'Cricket Clash', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
      alert('Link copied!');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!user) {
    return (
      <div className="login-screen">
        <h1>⚡ Cricket Clash</h1>
        <button onClick={handleLogin}>Continue with Google</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div className="logo">
          <span className="bolt">⚡</span>
          <h1>Cricket <span className="clash">Clash</span></h1>
        </div>
        <button className="signout" onClick={() => auth.signOut()}>Sign Out</button>
      </header>

      <div className="tabs">
        <button className={activeTab === 'battle'? 'tab active' : 'tab'} onClick={() => setActiveTab('battle')}>
          ⚔️ Battle
        </button>
        <button className="tab">🏆 Rankings</button>
        <button className="tab">📜 History</button>
      </div>

      <div className="stats">
        <div className="stat">
          <h2>{getTotalVotes()}k</h2>
          <p>TOTAL VOTES</p>
        </div>
        <div className="stat">
          <h2>{battleCount}</h2>
          <p>BATTLES</p>
        </div>
        <div className="stat">
          <h2>{getTopChamp()}</h2>
          <p>TOP CHAMP</p>
        </div>
        <div className="stat">
          <h2>{streak}</h2>
          <p>🔥 STREAK</p>
        </div>
      </div>

      <div className="battle-section">
        <p className="subtitle">WHO DO YOU LIKE?</p>
        <h2 className="battle-title">Battle <span className="num">{battleCount + 1}</span></h2>

        <div className="mode-toggle">
          <button className={mode === 'INDIA'? 'active' : ''} onClick={() => setMode('INDIA')}>
            INDIA
          </button>
          <button className={mode === 'WORLD'? 'active' : ''} onClick={() => setMode('WORLD')}>
            WORLD
          </button>
        </div>

        <div className="role-filters">
          <button className={roleFilter === 'Any'? 'active' : ''} onClick={() => setRoleFilter('Any')}>
            🎲 Any
          </button>
          <button className={roleFilter === 'Batters'? 'active' : ''} onClick={() => setRoleFilter('Batters')}>
            🏏 Batters
          </button>
          <button className={roleFilter === 'Bowlers'? 'active' : ''} onClick={() => setRoleFilter('Bowlers')}>
            🎯 Bowlers
          </button>
          <button className={roleFilter === 'All-Rounders'? 'active' : ''} onClick={() => setRoleFilter('All-Rounders')}>
            ⚡ All-Rounders
          </button>
          <button className={roleFilter === 'Keepers'? 'active' : ''} onClick={() => setRoleFilter('Keepers')}>
            🧤 Keepers
          </button>
          <button className={roleFilter === 'Captain'? 'active' : ''} onClick={() => setRoleFilter('Captain')}>
            👑 Captain
          </button>
        </div>

        {player1 && player2 && (
          <div className="arena">
            <div className="card blue" onClick={() => handleVote(player1.name)}>
              <div className="icon">{player1.icon}</div>
              <div className="role-badge">{player1.role}</div>
              {player1.isCaptain && <div className="captain-badge">C</div>}
              <h3>{player1.name}</h3>
              <p className="votes">{getVotes(player1.name)} votes</p>
            </div>
            <div className="vs">VS</div>
            <div className="card purple" onClick={() => handleVote(player2.name)}>
              <div className="icon">{player2.icon}</div>
              <div className="role-badge">{player2.role}</div>
              {player2.isCaptain && <div className="captain-badge">C</div>}
              <h3>{player2.name}</h3>
              <p className="votes">{getVotes(player2.name)} votes</p>
            </div>
          </div>
        )}

        <button className="skip-btn" onClick={loadNewBattle}>Skip →</button>

        <div className="share-row">
          <button className="share-btn" onClick={shareBattle}>📤 Share Battle</button>
        </div>
      </div>

      <footer>©️ 2026 crickclash production by ANESH</footer>
    </div>
  );
}

export default App;
