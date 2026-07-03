import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, set, runTransaction } from 'firebase/database';

// 🔥 FIREBASE CONFIG - NEE REAL KEYS
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
  { name: 'Virat Kohli', role: 'Batter' }, { name: 'Rohit Sharma', role: 'Batter' },
  { name: 'Jasprit Bumrah', role: 'Bowler' }, { name: 'Hardik Pandya', role: 'AR' },
  { name: 'KL Rahul', role: 'Keeper' }, { name: 'Shubman Gill', role: 'Batter' },
  { name: 'Suryakumar Yadav', role: 'Batter' }, { name: 'Ravindra Jadeja', role: 'AR' },
  { name: 'Mohammed Shami', role: 'Bowler' }, { name: 'Rishabh Pant', role: 'Keeper' },
  { name: 'Shreyas Iyer', role: 'Batter' }, { name: 'Axar Patel', role: 'AR' },
  { name: 'Mohammed Siraj', role: 'Bowler' }, { name: 'Yuzvendra Chahal', role: 'Bowler' },
  { name: 'Kuldeep Yadav', role: 'Bowler' }, { name: 'Ishan Kishan', role: 'Keeper' },
  { name: 'Sanju Samson', role: 'Keeper' }, { name: 'Arshdeep Singh', role: 'Bowler' },
  { name: 'Washington Sundar', role: 'AR' }, { name: 'Shardul Thakur', role: 'AR' },
  { name: 'Deepak Chahar', role: 'Bowler' }, { name: 'Prithvi Shaw', role: 'Batter' },
  { name: 'Ruturaj Gaikwad', role: 'Batter' }, { name: 'Tilak Varma', role: 'Batter' },
  { name: 'Rinku Singh', role: 'Batter' }, { name: 'Yashasvi Jaiswal', role: 'Batter' },
  { name: 'Jitesh Sharma', role: 'Keeper' }, { name: 'Rahul Tewatia', role: 'AR' },
  { name: 'Harshal Patel', role: 'Bowler' }, { name: 'Umran Malik', role: 'Bowler' },
  { name: 'Avesh Khan', role: 'Bowler' }, { name: 'Ravi Bishnoi', role: 'Bowler' },
  { name: 'Deepak Hooda', role: 'AR' }, { name: 'Shivam Dube', role: 'AR' },
  { name: 'Mukesh Kumar', role: 'Bowler' }, { name: 'Shahbaz Ahmed', role: 'AR' },
  { name: 'Rahul Tripathi', role: 'Batter' }, { name: 'Venkatesh Iyer', role: 'AR' },
  { name: 'T Natarajan', role: 'Bowler' }, { name: 'Bhuvneshwar Kumar', role: 'Bowler' },
  { name: 'Dinesh Karthik', role: 'Keeper' }, { name: 'Ravichandran Ashwin', role: 'AR' },
  { name: 'Mayank Agarwal', role: 'Batter' }, { name: 'Manish Pandey', role: 'Batter' },
  { name: 'Shikhar Dhawan', role: 'Batter' }, { name: 'Ajinkya Rahane', role: 'Batter' },
  { name: 'Cheteshwar Pujara', role: 'Batter' }, { name: 'Umesh Yadav', role: 'Bowler' },
  { name: 'Jaydev Unadkat', role: 'Bowler' }, { name: 'MS Dhoni', role: 'Captain' }
];

// 🌍 GLOBAL PLAYERS - 50
const GLOBAL_PLAYERS = [
  { name: 'Babar Azam', role: 'Batter' }, { name: 'Shaheen Afridi', role: 'Bowler' },
  { name: 'Mohammad Rizwan', role: 'Keeper' }, { name: 'Shadab Khan', role: 'AR' },
  { name: 'Steve Smith', role: 'Batter' }, { name: 'Pat Cummins', role: 'Bowler' },
  { name: 'Mitchell Starc', role: 'Bowler' }, { name: 'Glenn Maxwell', role: 'AR' },
  { name: 'David Warner', role: 'Batter' }, { name: 'Josh Hazlewood', role: 'Bowler' },
  { name: 'Kane Williamson', role: 'Batter' }, { name: 'Trent Boult', role: 'Bowler' },
  { name: 'Tim Southee', role: 'Bowler' }, { name: 'Devon Conway', role: 'Keeper' },
  { name: 'Joe Root', role: 'Batter' }, { name: 'Ben Stokes', role: 'AR' },
  { name: 'Jos Buttler', role: 'Keeper' }, { name: 'Jofra Archer', role: 'Bowler' },
  { name: 'Jonny Bairstow', role: 'Keeper' }, { name: 'Moeen Ali', role: 'AR' },
  { name: 'Quinton de Kock', role: 'Keeper' }, { name: 'Kagiso Rabada', role: 'Bowler' },
  { name: 'David Miller', role: 'Batter' }, { name: 'Anrich Nortje', role: 'Bowler' },
  { name: 'Aiden Markram', role: 'Batter' }, { name: 'Heinrich Klaasen', role: 'Keeper' },
  { name: 'Rashid Khan', role: 'Bowler' }, { name: 'Mohammad Nabi', role: 'AR' },
  { name: 'Shakib Al Hasan', role: 'AR' }, { name: 'Mustafizur Rahman', role: 'Bowler' },
  { name: 'Litton Das', role: 'Keeper' }, { name: 'Taskin Ahmed', role: 'Bowler' },
  { name: 'Wanindu Hasaranga', role: 'AR' }, { name: 'Maheesh Theekshana', role: 'Bowler' },
  { name: 'Kusal Mendis', role: 'Keeper' }, { name: 'Dushmantha Chameera', role: 'Bowler' },
  { name: 'Nicholas Pooran', role: 'Keeper' }, { name: 'Jason Holder', role: 'AR' },
  { name: 'Andre Russell', role: 'AR' }, { name: 'Alzarri Joseph', role: 'Bowler' },
  { name: 'Shai Hope', role: 'Keeper' }, { name: 'Brandon King', role: 'Batter' },
  { name: 'Sikandar Raza', role: 'AR' }, { name: 'Blessing Muzarabani', role: 'Bowler' },
  { name: 'Gerhard Erasmus', role: 'AR' }, { name: 'David Wiese', role: 'AR' },
  { name: 'Paul Stirling', role: 'Batter' }, { name: 'Josh Little', role: 'Bowler' },
  { name: 'AB de Villiers', role: 'Batter' }, { name: 'Chris Gayle', role: 'Batter' }
];

const FILTER_MAP = {
  'Batters': 'Batter', 'Bowlers': 'Bowler', 'All-Rounders': 'AR',
  'Keepers': 'Keeper', 'Captains': 'Captain'
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [history, setHistory] = useState([]);
  const [battleCount, setBattleCount] = useState(0);
  const [filter, setFilter] = useState('Any');
  const [mode, setMode] = useState('INDIA'); // V61: INDIA vs WORLD
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [activeTab, setActiveTab] = useState('battle');
  const [todayVotes, setTodayVotes] = useState(0); // V61: Daily vote limit

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // VOTES LISTENER
  useEffect(() => {
    const votesRef = ref(db, 'votes');
    onValue(votesRef, (snapshot) => {
      setVotes(snapshot.val() || {});
    });
  }, []);

  // HISTORY LISTENER
  useEffect(() => {
    const historyRef = ref(db, 'history');
    onValue(historyRef, (snapshot) => {
      const data = snapshot.val() || {};
      const historyArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
      setHistory(historyArray.slice(0, 50));
      setBattleCount(historyArray.length);
    });
  }, []);

  // V61: DAILY VOTE COUNT LISTENER
  useEffect(() => {
    if (!user) return;
    const today = new Date().toDateString();
    const userVoteRef = ref(db, `userVotes/${user.uid}/${today}`);
    onValue(userVoteRef, (snapshot) => {
      const data = snapshot.val() || {};
      const count = Object.values(data).reduce((sum, v) => sum + v, 0);
      setTodayVotes(count);
    });
  }, );

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // V61: UPDATED getPlayers - INDIA vs WORLD
  const getPlayers = useCallback(() => {
    const players = mode === 'INDIA'? INDIAN_PLAYERS : GLOBAL_PLAYERS;
    if (filter === 'Any') return players;
    return players.filter(p => p.role === FILTER_MAP[filter]);
  }, [mode, filter]);

  const loadNewBattle = useCallback(() => {
    const availablePlayers = getPlayers();
    if (availablePlayers.length < 2) {
      setPlayer1(null);
      setPlayer2(null);
      return;
    }
    const shuffled = [...availablePlayers].sort(() => 0.5 - Math.random());
    setPlayer1(shuffled[0]);
    setPlayer2(shuffled[1]);
  }, [getPlayers]);

  useEffect(() => {
    loadNewBattle();
  }, [loadNewBattle]);

  // V61: UPDATED handleVote - 10 VOTE LIMIT
  const handleVote = (playerName) => {
    if (todayVotes >= 10) {
      alert('ANESH RULE: Roju ki 10 votes matrame! Repu malli ra 🏏');
      return;
    }

    const today = new Date().toDateString();
    const voteRef = ref(db, `votes/${playerName}`);
    const userVoteRef = ref(db, `userVotes/${user.uid}/${today}/${playerName}`);

    runTransaction(voteRef, (currentVotes) => (currentVotes || 0) + 1);
    runTransaction(userVoteRef, (currentVotes) => (currentVotes || 0) + 1);

    const historyRef = ref(db, `history/${Date.now()}`);
    set(historyRef, {
      winner: playerName,
      loser: player1.name === playerName? player2.name : player1.name,
      timestamp: Date.now(),
      userId: user.uid
    });

    setBattleCount(prev => prev + 1);
    loadNewBattle();
  };

  const getTotalVotes = () => {
    const total = Object.values(votes).reduce((sum, v) => sum + v, 0);
    return (total / 1000).toFixed(1);
  };

  const getVotes = (playerName) => votes[playerName] || 0;

  const getTopChamp = () => {
    const entries = Object.entries(votes);
    if (entries.length === 0) return 'None';
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0][0].split(' ')[0];
  };

  const getRankings = () => {
    return Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, votes: count }));
  };

  if (loading) {
    return <div className="loading">Loading CrickClash...</div>;
  }

  if (!user) {
    return (
      <div className="login-gate">
        <h1>CrickClash 🏏</h1>
        <p>The Ultimate Cricket Battle</p>
        <button className="login-btn" onClick={handleLogin}>Continue with Google</button>
        <p className="footer">©️ 2026 crickclash. a production by ANESH</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div className="logo">
          <h1>CrickClash</h1>
          <p>THE ULTIMATE BATTLE</p>
        </div>
        <div className="user-info">
          <img src={user.photoURL} alt="user" className="avatar" />
          <button onClick={handleLogout} className="logout-btn">Sign Out</button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{getTotalVotes()}k</h3>
          <p>TOTAL VOTES</p>
        </div>
        <div className="stat-card">
          <h3>{battleCount}</h3>
          <p>BATTLES</p>
        </div>
        <div className="stat-card">
          <h3>{getTopChamp()}</h3>
          <p>TOP CHAMP</p>
        </div>
        <div className="stat-card">
          <h3>{10 - todayVotes}</h3>
          <p>VOTES LEFT TODAY</p>
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'battle'? 'tab active' : 'tab'} onClick={() => setActiveTab('battle')}>BATTLE</button>
        <button className={activeTab === 'rankings'? 'tab active' : 'tab'} onClick={() => setActiveTab('rankings')}>RANKINGS</button>
        <button className={activeTab === 'history'? 'tab active' : 'tab'} onClick={() => setActiveTab('history')}>HISTORY</button>
      </div>

      {activeTab === 'battle' && player1 && player2 && (
        <div className="battle-section">
          <h2>WHO DO YOU LIKE?</h2>
          <p>Battle {battleCount + 1}</p>

          <div className="mode-toggle">
            <button
              className={mode === 'INDIA'? 'mode-btn active' : 'mode-btn'}
              onClick={() => setMode('INDIA')}
            >
              🇮🇳 INDIA
            </button>
            <button
              className={mode === 'WORLD'? 'mode-btn active' : 'mode-btn'}
              onClick={() => setMode('WORLD')}
            >
              🌍 WORLD
            </button>
          </div>

          <div className="filters">
            {['Any', 'Batters', 'Bowlers', 'All-Rounders', 'Keepers', 'Captains'].map(f => (
              <button key={f} className={filter === f? 'filter-btn active' : 'filter-btn'} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          <div className="battle-arena">
            <div className="player-card" onClick={() => handleVote(player1.name)}>
              <div className="player-avatar">{player1.name.charAt(0)}</div>
              <h3>{player1.name}</h3>
              <p>{player1.role}</p>
              <div className="votes">{getVotes(player1.name)} votes</div>
            </div>
            <div className="vs">VS</div>
            <div className="player-card" onClick={() => handleVote(player2.name)}>
              <div className="player-avatar">{player2.name.charAt(0)}</div>
              <h3>{player2.name}</h3>
              <p>{player2.role}</p>
              <div className="votes">{getVotes(player2.name)} votes</div>
            </div>
          </div>

          <div className="battle-actions">
            <button className="skip-btn" onClick={loadNewBattle}>SKIP</button>
            <button className="share-btn" onClick={() => navigator.share({ title: 'CrickClash', url: window.location.href })}>SHARE</button>
          </div>
        </div>
      )}

      {activeTab === 'rankings' && (
        <div className="rankings-section">
          <h2>TOP 20 RANKINGS</h2>
          {getRankings().map((player, index) => (
            <div key={player.name} className="ranking-item">
              <span className="rank">{index + 1}</span>
              <span className="name">{player.name}</span>
              <span className="votes">{player.votes} votes</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          <h2>LAST 50 BATTLES</h2>
          {history.map((battle, index) => (
            <div key={index} className="history-item">
              <span className="winner">{battle.winner}</span> beat <span className="loser">{battle.loser}</span>
              <span className="time">{new Date(battle.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      <footer>
        <p> © 2026 CrickClash | Founded & Built by ANESH </p>
      </footer>
    </div>
  );
}

export default App;
