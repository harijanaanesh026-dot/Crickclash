import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, set, runTransaction } from 'firebase/database';

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

const INDIAN_PLAYERS = [
  { name: 'Virat Kohli', role: 'Run Machine', country: 'INDIA', icon: '👑' },
  { name: 'Rohit Sharma', role: 'Hitman', country: 'INDIA', icon: '🎯' },
  { name: 'Jasprit Bumrah', role: 'Yorker King', country: 'INDIA', icon: '💣' },
  { name: 'Hardik Pandya', role: 'Kung Fu Pandya', country: 'INDIA', icon: '⚡' },
  { name: 'KL Rahul', role: 'Classic Batter', country: 'INDIA', icon: '🧤' },
  { name: 'Shubman Gill', role: 'Prince', country: 'INDIA', icon: '🏏' },
  { name: 'Suryakumar Yadav', role: 'Mr 360', country: 'INDIA', icon: '🏏' },
  { name: 'Ravindra Jadeja', role: 'Sir Jadeja', country: 'INDIA', icon: '⚡' },
  { name: 'Mohammed Shami', role: 'Seam Master', country: 'INDIA', icon: '🎯' },
  { name: 'Rishabh Pant', role: 'Spidey', country: 'INDIA', icon: '🧤' },
  { name: 'Shreyas Iyer', role: 'Crisis Man', country: 'INDIA', icon: '🏏' },
  { name: 'Axar Patel', role: 'Bapu', country: 'INDIA', icon: '⚡' },
  { name: 'Mohammed Siraj', role: 'Miyan Magic', country: 'INDIA', icon: '🎯' },
  { name: 'Yuzvendra Chahal', role: 'Yuzi', country: 'INDIA', icon: '🎯' },
  { name: 'Kuldeep Yadav', role: 'Chinaman', country: 'INDIA', icon: '🎯' },
  { name: 'Ishan Kishan', role: 'Pocket Dynamo', country: 'INDIA', icon: '🧤' },
  { name: 'Sanju Samson', role: 'Kerala Express', country: 'INDIA', icon: '🧤' },
  { name: 'Arshdeep Singh', role: 'Left-arm Sling', country: 'INDIA', icon: '🎯' },
  { name: 'Washington Sundar', role: 'Washi', country: 'INDIA', icon: '⚡' },
  { name: 'Shardul Thakur', role: 'Lord', country: 'INDIA', icon: '⚡' },
  { name: 'Deepak Chahar', role: 'Swing King', country: 'INDIA', icon: '🎯' },
  { name: 'Prithvi Shaw', role: 'Little Master', country: 'INDIA', icon: '🏏' },
  { name: 'Ruturaj Gaikwad', role: 'Run Machine', country: 'INDIA', icon: '🏏' },
  { name: 'Tilak Varma', role: 'Young Gun', country: 'INDIA', icon: '🏏' },
  { name: 'Rinku Singh', role: 'Finisher', country: 'INDIA', icon: '🏏' },
  { name: 'Yashasvi Jaiswal', role: 'Fearless', country: 'INDIA', icon: '🏏' },
  { name: 'Jitesh Sharma', role: 'Finisher', country: 'INDIA', icon: '🧤' },
  { name: 'Rahul Tewatia', role: 'Iceman', country: 'INDIA', icon: '⚡' },
  { name: 'Harshal Patel', role: 'Slower One', country: 'INDIA', icon: '🎯' },
  { name: 'Umran Malik', role: 'Speed Gun', country: 'INDIA', icon: '🎯' },
  { name: 'Avesh Khan', role: 'Express Pacer', country: 'INDIA', icon: '🎯' },
  { name: 'Ravi Bishnoi', role: 'Googly Master', country: 'INDIA', icon: '🎯' },
  { name: 'Deepak Hooda', role: 'Hurricane', country: 'INDIA', icon: '⚡' },
  { name: 'Shivam Dube', role: 'Sixer King', country: 'INDIA', icon: '⚡' },
  { name: 'Mukesh Kumar', role: 'Line Length', country: 'INDIA', icon: '🎯' },
  { name: 'Shahbaz Ahmed', role: 'All Rounder', country: 'INDIA', icon: '⚡' },
  { name: 'Rahul Tripathi', role: 'Innovator', country: 'INDIA', icon: '🏏' },
  { name: 'Venkatesh Iyer', role: 'Power Hitter', country: 'INDIA', icon: '⚡' },
  { name: 'T Natarajan', role: 'Yorker Nattu', country: 'INDIA', icon: '🎯' },
  { name: 'Bhuvneshwar Kumar', role: 'Swing Master', country: 'INDIA', icon: '🎯' },
  { name: 'Dinesh Karthik', role: 'Finisher DK', country: 'INDIA', icon: '🧤' },
  { name: 'Ravichandran Ashwin', role: 'Scientist', country: 'INDIA', icon: '⚡' },
  { name: 'Mayank Agarwal', role: 'Opener', country: 'INDIA', icon: '🏏' },
  { name: 'Manish Pandey', role: 'Gun Fielder', country: 'INDIA', icon: '🏏' },
  { name: 'Shikhar Dhawan', role: 'Gabbar', country: 'INDIA', icon: '🏏' },
  { name: 'Ajinkya Rahane', role: 'Jinx', country: 'INDIA', icon: '🏏' },
  { name: 'Cheteshwar Pujara', role: 'Wall', country: 'INDIA', icon: '🏏' },
  { name: 'Umesh Yadav', role: 'Vidarbha Express', country: 'INDIA', icon: '🎯' },
  { name: 'Jaydev Unadkat', role: 'Left-arm Swing', country: 'INDIA', icon: '🎯' },
  { name: 'MS Dhoni', role: 'Captain Cool', country: 'INDIA', icon: '👑' },
  { name: 'Vaibhav Sooryavanshi', role: 'U19 Prodigy', country: 'INDIA', icon: '⭐' }
];

const GLOBAL_PLAYERS = [
  { name: 'Babar Azam', role: 'Cover Drive King', country: 'PAKISTAN', icon: '🏏' },
  { name: 'Shaheen Afridi', role: 'Eagle', country: 'PAKISTAN', icon: '🎯' },
  { name: 'Mohammad Rizwan', role: 'Mr Consistent', country: 'PAKISTAN', icon: '🧤' },
  { name: 'Shadab Khan', role: 'Vice Captain', country: 'PAKISTAN', icon: '⚡' },
  { name: 'Steve Smith', role: 'Run Machine', country: 'AUSTRALIA', icon: '🏏' },
  { name: 'Pat Cummins', role: 'Captain', country: 'AUSTRALIA', icon: '🎯' },
  { name: 'Mitchell Starc', role: 'Starc Attack', country: 'AUSTRALIA', icon: '🎯' },
  { name: 'Glenn Maxwell', role: 'Big Show', country: 'AUSTRALIA', icon: '⚡' },
  { name: 'David Warner', role: 'Bull', country: 'AUSTRALIA', icon: '🏏' },
  { name: 'Josh Hazlewood', role: 'Hoff', country: 'AUSTRALIA', icon: '🎯' },
  { name: 'Kane Williamson', role: 'Captain Calm', country: 'NEW ZEALAND', icon: '🏏' },
  { name: 'Trent Boult', role: 'Boulty', country: 'NEW ZEALAND', icon: '🎯' },
  { name: 'Tim Southee', role: 'Veteran', country: 'NEW ZEALAND', icon: '🎯' },
  { name: 'Devon Conway', role: 'Opener', country: 'NEW ZEALAND', icon: '🧤' },
  { name: 'Joe Root', role: 'Root of England', country: 'ENGLAND', icon: '🏏' },
  { name: 'Ben Stokes', role: 'Stokesy', country: 'ENGLAND', icon: '⚡' },
  { name: 'Jos Buttler', role: 'Boss', country: 'ENGLAND', icon: '🧤' },
  { name: 'Jofra Archer', role: 'Express', country: 'ENGLAND', icon: '🎯' },
  { name: 'Jonny Bairstow', role: 'Bluey', country: 'ENGLAND', icon: '🧤' },
  { name: 'Moeen Ali', role: 'Mo', country: 'ENGLAND', icon: '⚡' },
  { name: 'Quinton de Kock', role: 'Quinny', country: 'SOUTH AFRICA', icon: '🧤' },
  { name: 'Kagiso Rabada', role: 'KG', country: 'SOUTH AFRICA', icon: '🎯' },
  { name: 'David Miller', role: 'Killer Miller', country: 'SOUTH AFRICA', icon: '🏏' },
  { name: 'Anrich Nortje', role: 'Express', country: 'SOUTH AFRICA', icon: '🎯' },
  { name: 'Aiden Markram', role: 'Captain', country: 'SOUTH AFRICA', icon: '🏏' },
  { name: 'Heinrich Klaasen', role: 'Finisher', country: 'SOUTH AFRICA', icon: '🧤' },
  { name: 'Rashid Khan', role: 'Wizard', country: 'AFGHANISTAN', icon: '🎯' },
  { name: 'Mohammad Nabi', role: 'President', country: 'AFGHANISTAN', icon: '⚡' },
  { name: 'Shakib Al Hasan', role: 'Legend', country: 'BANGLADESH', icon: '⚡' },
  { name: 'Mustafizur Rahman', role: 'Fizz', country: 'BANGLADESH', icon: '🎯' },
  { name: 'Litton Das', role: 'Opener', country: 'BANGLADESH', icon: '🧤' },
  { name: 'Taskin Ahmed', role: 'Pacer', country: 'BANGLADESH', icon: '🎯' },
  { name: 'Wanindu Hasaranga', role: 'Spin King', country: 'SRI LANKA', icon: '⚡' },
  { name: 'Maheesh Theekshana', role: 'Mystery', country: 'SRI LANKA', icon: '🎯' },
  { name: 'Kusal Mendis', role: 'Keeper', country: 'SRI LANKA', icon: '🧤' },
  { name: 'Dushmantha Chameera', role: 'Express', country: 'SRI LANKA', icon: '🎯' },
  { name: 'Nicholas Pooran', role: 'Nicky P', country: 'WEST INDIES', icon: '🧤' },
  { name: 'Jason Holder', role: 'Big Jason', country: 'WEST INDIES', icon: '⚡' },
  { name: 'Andre Russell', role: 'Dre Russ', country: 'WEST INDIES', icon: '⚡' },
  { name: 'Alzarri Joseph', role: 'Express', country: 'WEST INDIES', icon: '🎯' },
  { name: 'Shai Hope', role: 'Captain', country: 'WEST INDIES', icon: '🧤' },
  { name: 'Brandon King', role: 'King', country: 'WEST INDIES', icon: '🏏' },
  { name: 'Sikandar Raza', role: 'Captain', country: 'ZIMBABWE', icon: '⚡' },
  { name: 'Blessing Muzarabani', role: 'Tall One', country: 'ZIMBABWE', icon: '🎯' },
  { name: 'Gerhard Erasmus', role: 'Captain', country: 'NAMIBIA', icon: '⚡' },
  { name: 'David Wiese', role: 'Finisher', country: 'NAMIBIA', icon: '⚡' },
  { name: 'Paul Stirling', role: 'Captain', country: 'IRELAND', icon: '🏏' },
  { name: 'Josh Little', role: 'Express', country: 'IRELAND', icon: '🎯' },
  { name: 'Kieron Pollard', role: 'Power Hitter', country: 'WEST INDIES', icon: '🌴' },
  { name: 'Mohammad Amir', role: 'Left-arm Pacer', country: 'PAKISTAN', icon: '🌪️' }
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [battleCount, setBattleCount] = useState(0);
  const [mode, setMode] = useState('INDIA');
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [activeTab, setActiveTab] = useState('battle');
  const [streak, setStreak] = useState(0);

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
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Login Error:', e);
      alert(`Login failed: ${e.message}`);
    }
  };

  const getPlayers = useCallback(() => {
    return mode === 'INDIA'? INDIAN_PLAYERS : GLOBAL_PLAYERS;
  }, );

  const loadNewBattle = useCallback(() => {
    const players = getPlayers();
    if (players.length < 2) return;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setPlayer1(shuffled[0]);
    setPlayer2(shuffled[1]);
  }, [getPlayers]);

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

  if (loading) return <div className="loading">Loading...</div>;

  if (!user) {
    return (
      <div className="login-screen">
        <h1>WORLD'S Fantasy Sport!</h1>
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
        <div className="streak-badge">
          🔥 {streak} streak
        </div>
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
          <p>BEST STREAK</p>
        </div>
      </div>

      <div className="battle-section">
        <p className="subtitle">WHO WINS THIS CLASH?</p>
        <h2 className="battle-title">Battle <span className="num">{battleCount + 1}</span></h2>

        <div className="mode-toggle">
          <button className={mode === 'INDIA'? 'active' : ''} onClick={() => setMode('INDIA')}>
            INDIA
          </button>
          <button className={mode === 'WORLD'? 'active' : ''} onClick={() => setMode('WORLD')}>
            WORLD
          </button>
        </div>

        {player1 && player2 && (
          <div className="arena">
            <div className="card blue" onClick={() => handleVote(player1.name)}>
              <div className="icon">{player1.icon}</div>
              <div className="country">{player1.country}</div>
              <h3>{player1.name}</h3>
              <p className="role">{player1.role}</p>
              <p className="votes">{getVotes(player1.name)} votes</p>
            </div>
            <div className="vs">VS</div>
            <div className="card purple" onClick={() => handleVote(player2.name)}>
              <div className="icon">{player2.icon}</div>
              <div className="country">{player2.country}</div>
              <h3>{player2.name}</h3>
              <p className="role">{player2.role}</p>
              <p className="votes">{getVotes(player2.name)} votes</p>
            </div>
          </div>
        )}

        <button className="skip-btn" onClick={loadNewBattle}>Skip →</button>
      </div>

      <footer>©️ 2026 crickclash. a production by ANESH</footer>
    </div>
  );
}

export default App;
