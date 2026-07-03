import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
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

// 🇮🇳 INDIAN PLAYERS - 50
const INDIAN_PLAYERS = [
  { name: 'Virat Kohli', role: 'Run Machine', country: 'INDIA', flag: '🇮🇳', icon: '👑' },
  { name: 'Rohit Sharma', role: 'Hitman', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Jasprit Bumrah', role: 'Yorker King', country: 'INDIA', flag: '🇮🇳', icon: '💣' },
  { name: 'Hardik Pandya', role: 'Kung Fu Pandya', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'KL Rahul', role: 'Classic Batter', country: 'INDIA', flag: '🇮🇳', icon: '🧤' },
  { name: 'Shubman Gill', role: 'Prince', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Suryakumar Yadav', role: 'Mr. 360', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Ravindra Jadeja', role: 'Sir Jadeja', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Mohammed Shami', role: 'Seam Master', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Rishabh Pant', role: 'Spidey', country: 'INDIA', flag: '🇮🇳', icon: '🧤' },
  { name: 'Shreyas Iyer', role: 'Crisis Man', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Axar Patel', role: 'Bapu', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Mohammed Siraj', role: 'Miyan Magic', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Yuzvendra Chahal', role: 'Yuzi', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Kuldeep Yadav', role: 'Chinaman', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Ishan Kishan', role: 'Pocket Dynamo', country: 'INDIA', flag: '🇮🇳', icon: '🧤' },
  { name: 'Sanju Samson', role: 'Kerala Express', country: 'INDIA', flag: '🇮🇳', icon: '🧤' },
  { name: 'Arshdeep Singh', role: 'Left-arm Sling', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Washington Sundar', role: 'Washi', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Shardul Thakur', role: 'Lord', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Deepak Chahar', role: 'Swing King', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Prithvi Shaw', role: 'Little Master', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Ruturaj Gaikwad', role: 'Run Machine', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Tilak Varma', role: 'Young Gun', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Rinku Singh', role: 'Finisher', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Yashasvi Jaiswal', role: 'Fearless', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Jitesh Sharma', role: 'Finisher', country: 'INDIA', flag: '🇮🇳', icon: '🧤' },
  { name: 'Rahul Tewatia', role: 'Iceman', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Harshal Patel', role: 'Slower One', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Umran Malik', role: 'Speed Gun', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Avesh Khan', role: 'Express Pacer', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Ravi Bishnoi', role: 'Googly Master', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Deepak Hooda', role: 'Hurricane', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Shivam Dube', role: 'Sixer King', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Mukesh Kumar', role: 'Line Length', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Shahbaz Ahmed', role: 'All Rounder', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Rahul Tripathi', role: 'Innovator', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Venkatesh Iyer', role: 'Power Hitter', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'T Natarajan', role: 'Yorker Nattu', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Bhuvneshwar Kumar', role: 'Swing Master', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Dinesh Karthik', role: 'Finisher DK', country: 'INDIA', flag: '🇮🇳', icon: '🧤' },
  { name: 'Ravichandran Ashwin', role: 'Scientist', country: 'INDIA', flag: '🇮🇳', icon: '⚡' },
  { name: 'Mayank Agarwal', role: 'Opener', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Manish Pandey', role: 'Gun Fielder', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Shikhar Dhawan', role: 'Gabbar', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Ajinkya Rahane', role: 'Jinx', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Cheteshwar Pujara', role: 'Wall', country: 'INDIA', flag: '🇮🇳', icon: '🏏' },
  { name: 'Umesh Yadav', role: 'Vidarbha Express', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'Jaydev Unadkat', role: 'Left-arm Swing', country: 'INDIA', flag: '🇮🇳', icon: '🎯' },
  { name: 'MS Dhoni', role: 'Captain Cool', country: 'INDIA', flag: '🇮🇳', icon: '👑' }
];

// 🌍 GLOBAL PLAYERS - 50
const GLOBAL_PLAYERS = [
  { name: 'Babar Azam', role: 'Cover Drive King', country: 'PAKISTAN', flag: '🇵🇰', icon: '🏏' },
  { name: 'Shaheen Afridi', role: 'Eagle', country: 'PAKISTAN', flag: '🇵🇰', icon: '🎯' },
  { name: 'Mohammad Rizwan', role: 'Mr. Consistent', country: 'PAKISTAN', flag: '🇵🇰', icon: '🧤' },
  { name: 'Shadab Khan', role: 'Vice Captain', country: 'PAKISTAN', flag: '🇵🇰', icon: '⚡' },
  { name: 'Steve Smith', role: 'Run Machine', country: 'AUSTRALIA', flag: '🇦🇺', icon: '🏏' },
  { name: 'Pat Cummins', role: 'Captain', country: 'AUSTRALIA', flag: '🇦🇺', icon: '🎯' },
  { name: 'Mitchell Starc', role: 'Starc Attack', country: 'AUSTRALIA', flag: '🇦🇺', icon: '🎯' },
  { name: 'Glenn Maxwell', role: 'Big Show', country: 'AUSTRALIA', flag: '🇦🇺', icon: '⚡' },
  { name: 'David Warner', role: 'Bull', country: 'AUSTRALIA', flag: '🇦🇺', icon: '🏏' },
  { name: 'Josh Hazlewood', role: 'Hoff', country: 'AUSTRALIA', flag: '🇦🇺', icon: '🎯' },
  { name: 'Kane Williamson', role: 'Captain Calm', country: 'NEW ZEALAND', flag: '🇳🇿', icon: '🏏' },
  { name: 'Trent Boult', role: 'Boulty', country: 'NEW ZEALAND', flag: '🇳🇿', icon: '🎯' },
  { name: 'Tim Southee', role: 'Veteran', country: 'NEW ZEALAND', flag: '🇳🇿', icon: '🎯' },
  { name: 'Devon Conway', role: 'Opener', country: 'NEW ZEALAND', flag: '🇳🇿', icon: '🧤' },
  { name: 'Joe Root', role: 'Root of England', country: 'ENGLAND', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', icon: '🏏' },
  { name: 'Ben Stokes', role: 'Stokesy', country: 'ENGLAND', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', icon: '⚡' },
  { name: 'Jos Buttler', role: 'Boss', country: 'ENGLAND', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', icon: '🧤' },
  { name: 'Jofra Archer', role: 'Express', country: 'ENGLAND', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', icon: '🎯' },
  { name: 'Jonny Bairstow', role: 'Bluey', country: 'ENGLAND', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', icon: '🧤' },
  { name: 'Moeen Ali', role: 'Mo', country: 'ENGLAND', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', icon: '⚡' },
  { name: 'Quinton de Kock', role: 'Quinny', country: 'SOUTH AFRICA', flag: '🇿🇦', icon: '🧤' },
  { name: 'Kagiso Rabada', role: 'KG', country: 'SOUTH AFRICA', flag: '🇿🇦', icon: '🎯' },
  { name: 'David Miller', role: 'Killer Miller', country: 'SOUTH AFRICA', flag: '🇿🇦', icon: '🏏' },
  { name: 'Anrich Nortje', role: 'Express', country: 'SOUTH AFRICA', flag: '🇿🇦', icon: '🎯' },
  { name: 'Aiden Markram', role: 'Captain', country: 'SOUTH AFRICA', flag: '🇿🇦', icon: '🏏' },
  { name: 'Heinrich Klaasen', role: 'Finisher', country: 'SOUTH AFRICA', flag: '🇿🇦', icon: '🧤' },
  { name: 'Rashid Khan', role: 'Wizard', country: 'AFGHANISTAN', flag: '🇦🇫', icon: '🎯' },
  { name: 'Mohammad Nabi', role: 'President', country: 'AFGHANISTAN', flag: '🇦🇫', icon: '⚡' },
  { name: 'Shakib Al Hasan', role: 'Legend', country: 'BANGLADESH', flag: '🇧🇩', icon: '⚡' },
  { name: 'Mustafizur Rahman', role: 'Fizz', country: 'BANGLADESH', flag: '🇧🇩', icon: '🎯' },
  { name: 'Litton Das', role: 'Opener', country: 'BANGLADESH', flag: '🇧🇩', icon: '🧤' },
  { name: 'Taskin Ahmed', role: 'Pacer', country: 'BANGLADESH', flag: '🇧🇩', icon: '🎯' },
  { name: 'Wanindu Hasaranga', role: 'Spin King', country: 'SRI LANKA', flag: '🇱🇰', icon: '⚡' },
  { name: 'Maheesh Theekshana', role: 'Mystery', country: 'SRI LANKA', flag: '🇱🇰', icon: '🎯' },
  { name: 'Kusal Mendis', role: 'Keeper', country: 'SRI LANKA', flag: '🇱🇰', icon: '🧤' },
  { name: 'Dushmantha Chameera', role: 'Express', country: 'SRI LANKA', flag: '🇱🇰', icon: '🎯' },
  { name: 'Nicholas Pooran', role: 'Nicky P', country: 'WEST INDIES', flag: '🏝️', icon: '🧤' },
  { name: 'Jason Holder', role: 'Big Jason', country: 'WEST INDIES', flag: '🏝️', icon: '⚡' },
  { name: 'Andre Russell', role: 'Dre Russ', country: 'WEST INDIES', flag: '🏝️', icon: '⚡' },
  { name: 'Alzarri Joseph', role: 'Express', country: 'WEST INDIES', flag: '🏝️', icon: '🎯' },
  { name: 'Shai Hope', role: 'Captain', country: 'WEST INDIES', flag: '🏝️', icon: '🧤' },
  { name: 'Brandon King', role: 'King', country: 'WEST INDIES', flag: '🏝️', icon: '🏏' },
  { name: 'Sikandar Raza', role: 'Captain', country: 'ZIMBABWE', flag: '🇿🇼', icon: '⚡' },
  { name: 'Blessing Muzarabani', role: 'Tall One', country: 'ZIMBABWE', flag: '🇿🇼', icon: '🎯' },
  { name: 'Gerhard Erasmus', role: 'Captain', country: 'NAMIBIA', flag: '🇳🇦', icon: '⚡' },
  { name: 'David Wiese', role: 'Finisher', country: 'NAMIBIA', flag: '🇳🇦', icon: '⚡' },
  { name: 'Paul Stirling', role: 'Captain', country: 'IRELAND', flag: '🇮🇪', icon: '🏏' },
  { name: 'Josh Little', role: 'Express', country: 'IRELAND', flag: '🇮🇪', icon: '🎯' },
  { name: 'Kieron Pollard', role: 'Power Hitter', country: 'WEST INDIES', flag: '🏝️', icon: '🌴' },
  { name: 'Mohammad Amir', role: 'Left-arm Pacer', country: 'PAKISTAN', flag: '🇵🇰', icon: '🌪️' }
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [battleCount, setBattleCount] = useState(0);
  const [filter, setFilter] = useState('Any');
  const [mode, setMode] = useState('INDIA');
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [activeTab, setActiveTab] = useState('battle');
  const [todayVotes, setTodayVotes] = useState(0);
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
    const today = new Date().toDateString();
    onValue(ref(db, `userVotes/${user.uid}/${today}`), (snap) => {
      const data = snap.val() || {};
      setTodayVotes(Object.values(data).reduce((s, v) => s + v, 0));
    });
    onValue(ref(db, `userStreak/${user.uid}`), (snap) => {
      setStreak(snap.val() || 0);
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
    return mode === 'INDIA'? INDIAN_PLAYERS : GLOBAL_PLAYERS;
  }, [mode]);

  const loadNewBattle = useCallback(() => {
    const players = getPlayers();
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
    runTransaction(ref(db, `userStreak/${user.uid}`), (v) => (v || 0) + 1);
    set(ref(db, `history/${Date.now()}`), {
      winner: name,
      loser: player1.name === name? player2.name : player1.name,
      timestamp: Date.now()
    });
    loadNewBattle();
  };

  const getTotalVotes = () => (Object.values(votes).reduce((s, v) => s + v, 0) / 1000).toFixed(1);
  const getVotes = (name) => votes[name] || 0;
  const getTopChamp = () => {
    const e = Object.entries(votes);
    return e.length? e.sort((a, b) => b[1] - a[1])[0][0].split(' ')[0] : 'Kohli';
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
        <div className="streak-badge">
          🔥 {streak} streak
        </div>
      </header>

      <div className="tabs">
        <button className={activeTab === 'battle'? 'tab active' : 'tab'}>
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
        <h2 className="battle-title">Battle <span className="num">{battleCount}</span></h2>

        <div className="mode-toggle">
          <button className={mode === 'INDIA'? 'active' : ''} onClick={() => setMode('INDIA')}>
            🇮🇳 INDIA
          </button>
          <button className={mode === 'WORLD'? 'active' : ''} onClick={() => setMode('WORLD')}>
            🌍 WORLD
          </button>
        </div>

        {player1 && player2 && (
          <div className="arena">
            <div className="card blue" onClick={() => handleVote(player1.name)}>
              <div className="icon">{player1.icon}</div>
              <div className="country">
                {player1.flag} {player1.country}
              </div>
              <h3>{player1.name}</h3>
              <p className="role">{player1.role}</p>
              <p className="votes">{getVotes(player1.name)} votes</p>
            </div>
            <div className="vs">VS</div>
            <div className="card purple" onClick={() => handleVote(player2.name)}>
              <div className="icon">{player2.icon}</div>
              <div className="country">
                {player2.flag} {player2.country}
              </div>
              <h3>{player2.name}</h3>
              <p className="role">{player2.role}</p>
              <p className="votes">{getVotes(player2.name)} votes</p>
            </div>
          </div>
        )}

        <button className="skip-btn" onClick={loadNewBattle}>Skip →</button>
      </div>

      <footer>©️ 2026 crickclash production by ANESH</footer>
    </div>
  );
}

export default App;
