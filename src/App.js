import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, set, runTransaction } from 'firebase/database';

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyD08fB-AbbdqKoJf0Bu6FL6ofz7X1ONCd6g",
  authDomain: "crickclash-d30fe.firebaseapp.com",
  databaseURL: "https://crickclash-d30fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crickclash-d30fe",
  storageBucket: "crickclash-d30fe.firebasestorage.app",
  messagingSenderId: "1092212958816",
  appId: "1:1092212958816:web:a9c4cb4d2b5c3c1b4a8c4d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🇮🇳 INDIAN PLAYERS - 50
const INDIAN_PLAYERS = [
  { name: 'Virat Kohli', role: 'Captain', icon: '👑' }, { name: 'Rohit Sharma', role: 'Captain', icon: '🎯' },
  { name: 'Jasprit Bumrah', role: 'Bowler', icon: '🎯' }, { name: 'Hardik Pandya', role: 'AR', icon: '⚡' },
  { name: 'KL Rahul', role: 'Keeper', icon: '🧤' }, { name: 'Shubman Gill', role: 'Batter', icon: '🏏' },
  { name: 'Suryakumar Yadav', role: 'Batter', icon: '🏏' }, { name: 'Ravindra Jadeja', role: 'AR', icon: '⚡' },
  { name: 'Mohammed Shami', role: 'Bowler', icon: '🎯' }, { name: 'Rishabh Pant', role: 'Keeper', icon: '🧤' },
  { name: 'Shreyas Iyer', role: 'Batter', icon: '🏏' }, { name: 'Axar Patel', role: 'AR', icon: '⚡' },
  { name: 'Mohammed Siraj', role: 'Bowler', icon: '🎯' }, { name: 'Yuzvendra Chahal', role: 'Bowler', icon: '🎯' },
  { name: 'Kuldeep Yadav', role: 'Bowler', icon: '🎯' }, { name: 'Ishan Kishan', role: 'Keeper', icon: '🧤' },
  { name: 'Sanju Samson', role: 'Keeper', icon: '🧤' }, { name: 'Arshdeep Singh', role: 'Bowler', icon: '🎯' },
  { name: 'Washington Sundar', role: 'AR', icon: '⚡' }, { name: 'Shardul Thakur', role: 'AR', icon: '⚡' },
  { name: 'Deepak Chahar', role: 'Bowler', icon: '🎯' }, { name: 'Prithvi Shaw', role: 'Batter', icon: '🏏' },
  { name: 'Ruturaj Gaikwad', role: 'Batter', icon: '🏏' }, { name: 'Tilak Varma', role: 'Batter', icon: '🏏' },
  { name: 'Rinku Singh', role: 'Batter', icon: '🏏' }, { name: 'Yashasvi Jaiswal', role: 'Batter', icon: '🏏' },
  { name: 'Jitesh Sharma', role: 'Keeper', icon: '🧤' }, { name: 'Rahul Tewatia', role: 'AR', icon: '⚡' },
  { name: 'Harshal Patel', role: 'Bowler', icon: '🎯' }, { name: 'Umran Malik', role: 'Bowler', icon: '🎯' },
  { name: 'Avesh Khan', role: 'Bowler', icon: '🎯' }, { name: 'Ravi Bishnoi', role: 'Bowler', icon: '🎯' },
  { name: 'Deepak Hooda', role: 'AR', icon: '⚡' }, { name: 'Shivam Dube', role: 'AR', icon: '⚡' },
  { name: 'Mukesh Kumar', role: 'Bowler', icon: '🎯' }, { name: 'Shahbaz Ahmed', role: 'AR', icon: '⚡' },
  { name: 'Rahul Tripathi', role: 'Batter', icon: '🏏' }, { name: 'Venkatesh Iyer', role: 'AR', icon: '⚡' },
  { name: 'T Natarajan', role: 'Bowler', icon: '🎯' }, { name: 'Bhuvneshwar Kumar', role: 'Bowler', icon: '🎯' },
  { name: 'Dinesh Karthik', role: 'Keeper', icon: '🧤' }, { name: 'Ravichandran Ashwin', role: 'AR', icon: '⚡' },
  { name: 'Mayank Agarwal', role: 'Batter', icon: '🏏' }, { name: 'Manish Pandey', role: 'Batter', icon: '🏏' },
  { name: 'Shikhar Dhawan', role: 'Batter', icon: '🏏' }, { name: 'Ajinkya Rahane', role: 'Batter', icon: '🏏' },
  { name: 'Cheteshwar Pujara', role: 'Batter', icon: '🏏' }, { name: 'Umesh Yadav', role: 'Bowler', icon: '🎯' },
  { name: 'Jaydev Unadkat', role: 'Bowler', icon: '🎯' }, { name: 'MS Dhoni', role: 'Captain', icon: '👑' }
];

// 🌍 GLOBAL PLAYERS - 50
const GLOBAL_PLAYERS = [
  { name: 'Babar Azam', role: 'Batter', icon: '🏏' }, { name: 'Shaheen Afridi', role: 'Bowler', icon: '🎯' },
  { name: 'Mohammad Rizwan', role: 'Keeper', icon: '🧤' }, { name: 'Shadab Khan', role: 'AR', icon: '⚡' },
  { name: 'Steve Smith', role: 'Batter', icon: '🏏' }, { name: 'Pat Cummins', role: 'Bowler', icon: '🎯' },
  { name: 'Mitchell Starc', role: 'Bowler', icon: '🎯' }, { name: 'Glenn Maxwell', role: 'AR', icon: '⚡' },
  { name: 'David Warner', role: 'Batter', icon: '🏏' }, { name: 'Josh Hazlewood', role: 'Bowler', icon: '🎯' },
  { name: 'Kane Williamson', role: 'Batter', icon: '🏏' }, { name: 'Trent Boult', role: 'Bowler', icon: '🎯' },
  { name: 'Tim Southee', role: 'Bowler', icon: '🎯' }, { name: 'Devon Conway', role: 'Keeper', icon: '🧤' },
  { name: 'Joe Root', role: 'Batter', icon: '🏏' }, { name: 'Ben Stokes', role: 'AR', icon: '⚡' },
  { name: 'Jos Buttler', role: 'Keeper', icon: '🧤' }, { name: 'Jofra Archer', role: 'Bowler', icon: '🎯' },
  { name: 'Jonny Bairstow', role: 'Keeper', icon: '🧤' }, { name: 'Moeen Ali', role: 'AR', icon: '⚡' },
  { name: 'Quinton de Kock', role: 'Keeper', icon: '🧤' }, { name: 'Kagiso Rabada', role: 'Bowler', icon: '🎯' },
  { name: 'David Miller', role: 'Batter', icon: '🏏' }, { name: 'Anrich Nortje', role: 'Bowler', icon: '🎯' },
  { name: 'Aiden Markram', role: 'Batter', icon: '🏏' }, { name: 'Heinrich Klaasen', role: 'Keeper', icon: '🧤' },
  { name: 'Rashid Khan', role: 'Bowler', icon: '🎯' }, { name: 'Mohammad Nabi', role: 'AR', icon: '⚡' },
  { name: 'Shakib Al Hasan', role: 'AR', icon: '⚡' }, { name: 'Mustafizur Rahman', role: 'Bowler', icon: '🎯' },
  { name: 'Litton Das', role: 'Keeper', icon: '🧤' }, { name: 'Taskin Ahmed', role: 'Bowler', icon: '🎯' },
  { name: 'Wanindu Hasaranga', role: 'AR', icon: '⚡' }, { name: 'Maheesh Theekshana', role: 'Bowler', icon: '🎯' },
  { name: 'Kusal Mendis', role: 'Keeper', icon: '🧤' }, { name: 'Dushmantha Chameera', role: 'Bowler', icon: '🎯' },
  { name: 'Nicholas Pooran', role: 'Keeper', icon: '🧤' }, { name: 'Jason Holder', role: 'AR', icon: '⚡' },
  { name: 'Andre Russell', role: 'AR', icon: '⚡' }, { name: 'Alzarri Joseph', role: 'Bowler', icon: '🎯' },
  { name: 'Shai Hope', role: 'Keeper', icon: '🧤' }, { name: 'Brandon King', role: 'Batter', icon: '🏏' },
  { name: 'Sikandar Raza', role: 'AR', icon: '⚡' }, { name: 'Blessing Muzarabani', role: 'Bowler', icon: '🎯' },
  { name: 'Gerhard Erasmus', role: 'AR', icon: '⚡' }, { name: 'David Wiese', role: 'AR', icon: '⚡' },
  { name: 'Paul Stirling', role: 'Batter', icon: '🏏' }, { name: 'Josh Little', role: 'Bowler', icon: '🎯' },
  { name: 'AB de Villiers', role: 'Batter', icon: '🏏' }, { name: 'Chris Gayle', role: 'Batter', icon: '🏏' }
];

const FILTER_MAP = {
  'Batters': 'Batter', 'Bowlers': 'Bowler', 'All-Rounders': 'AR'
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [history, setHistory] = useState([]);
  const [battleCount, setBattleCount] = useState(0);
  const [filter, setFilter] = useState('Any');
  const [mode, setMode] = useState('INDIA');
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [activeTab, setActiveTab] = useState('battle');
  const [todayVotes, setTodayVotes] = useState(0);

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
      const arr = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
      setHistory(arr.slice(0, 50));
      setBattleCount(arr.length);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toDateString();
    onValue(ref(db, `userVotes/${user.uid}/${today}`), (snap) => {
      const data = snap.val() || {};
      setTodayVotes(Object.values(data).reduce((s, v) => s + v, 0));
    });
  }, );

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => await signOut(auth);

  const getPlayers = useCallback(() => {
    const players = mode === 'INDIA'? INDIAN_PLAYERS : GLOBAL_PLAYERS;
    return filter === 'Any'? players : players.filter(p => p.role === FILTER_MAP[filter]);
  }, [mode, filter]);

  const loadNewBattle = useCallback(() => {
    const players = getPlayers();
    if (players.length < 2) return;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setPlayer1(shuffled[0]);
    setPlayer2(shuffled[1]);
  }, [getPlayers]);

  useEffect(() => { loadNewBattle(); }, [loadNewBattle]);

  const handleVote = (name) => {
    if (todayVotes >= 10) {
      alert('ANESH RULE: Roju ki 10 votes matrame! Repu malli ra 🏏');
      return;
    }
    const today = new Date().toDateString();
    runTransaction(ref(db, `votes/${name}`), (v) => (v || 0) + 1);
    runTransaction(ref(db, `userVotes/${user.uid}/${today}/${name}`), (v) => (v || 0) + 1);
    set(ref(db, `history/${Date.now()}`), {
      winner: name,
      loser: player1.name === name? player2.name : player1.name,
      timestamp: Date.now(),
      userId: user.uid
    });
    loadNewBattle();
  };

  const getTotalVotes = () => (Object.values(votes).reduce((s, v) => s + v, 0) / 1000).toFixed(1);
  const getVotes = (name) => votes[name] || 0;
  const getTopChamp = () => {
    const e = Object.entries(votes);
    return e.length? e.sort((a, b) => b[1] - a[1])[0][0].split(' ')[0] : 'None';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CrickClash Battle',
        text: `${player1.name} VS ${player2.name} - Who do you like?`,
        url: window.location.href
      });
    }
  };

  if (loading) return <div className="loading">Loading CrickClash...</div>;

  if (!user) {
    return (
      <div className="login-screen">
        <h1>CrickClash 🏏</h1>
        <p>The Ultimate Cricket Battle</p>
        <button onClick={handleLogin}>Continue with Google</button>
        <p className="footer-text">©️ 2026 crickclash. a production by ANESH</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <div>
            <h1>Cricket <span className="clash">Clash</span></h1>
            <p>⚡ by Anesh</p>
          </div>
        </div>
        <div className="user-section">
          <div className="avatar">{user.displayName?.charAt(0) || 'H'}</div>
          <button onClick={handleLogout} className="signout">Sign Out</button>
        </div>
      </header>

      <div className="tabs">
        <button className={activeTab === 'battle'? 'tab active' : 'tab'} onClick={() => setActiveTab('battle')}>
          ⚔️ Battle
        </button>
        <button className={activeTab === 'rankings'? 'tab active' : 'tab'} onClick={() => setActiveTab('rankings')}>
          🏆 Rankings
        </button>
        <button className={activeTab === 'history'? 'tab active' : 'tab'} onClick={() => setActiveTab('history')}>
          📜 History
        </button>
      </div>

      <div className="stats">
        <div className="stat-box">
          <h2>{getTotalVotes()}k</h2>
          <p>TOTAL VOTES</p>
        </div>
        <div className="stat-box">
          <h2>{battleCount}</h2>
          <p>BATTLES</p>
        </div>
        <div className="stat-box">
          <h2>{getTopChamp()}</h2>
          <p>TOP CHAMP</p>
        </div>
        <div className="stat-box">
          <h2>{10 - todayVotes}</h2>
          <p>🔥 VOTES LEFT</p>
        </div>
      </div>

      {activeTab === 'battle' && player1 && player2 && (
        <div className="battle">
          <h2 className="battle-title">WHO DO YOU LIKE?</h2>
          <p className="battle-num">Battle {battleCount + 1}</p>

          <div className="mode-switch">
            <button className={mode === 'INDIA'? 'active' : ''} onClick={() => setMode('INDIA')}>
              🇮🇳 INDIA
            </button>
            <button className={mode === 'WORLD'? 'active' : ''} onClick={() => setMode('WORLD')}>
              🌍 WORLD
            </button>
          </div>

          <div className="filters">
            <button className={filter === 'Any'? 'active' : ''} onClick={() => setFilter('Any')}>
              🎲 Any
            </button>
            <button className={filter === 'Batters'? 'active' : ''} onClick={() => setFilter('Batters')}>
              🏏 Batters
            </button>
            <button className={filter === 'Bowlers'? 'active' : ''} onClick={() => setFilter('Bowlers')}>
              🎯 Bowlers
            </button>
            <button className={filter === 'All-Rounders'? 'active' : ''} onClick={() => setFilter('All-Rounders')}>
              ⚡ All-Rounders
            </button>
          </div>

          <div className="arena">
            <div className="card blue" onClick={() => handleVote(player1.name)}>
              <div className="icon">{player1.icon}</div>
              <div className="badge">CAPTAIN</div>
              <h3>{player1.name}</h3>
              <p>{getVotes(player1.name)} votes</p>
            </div>
            <div className="vs">VS</div>
            <div className="card purple" onClick={() => handleVote(player2.name)}>
              <div className="icon">{player2.icon}</div>
              <div className="badge">CAPTAIN</div>
              <h3>{player2.name}</h3>
              <p>{getVotes(player2.name)} votes</p>
            </div>
          </div>

          <button className="skip" onClick={loadNewBattle}>Skip →</button>
          <button className="share" onClick={handleShare}>🏮 Share this battle</button>
        </div>
      )}

      <footer>©️ 2026 crickclash production by ANESH</footer>
    </div>
  );
}

export default App;
