import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// NEE FIREBASE CONFIG IKKADA PASTE CHEY
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
const provider = new GoogleAuthProvider();

const INDIAN_PLAYERS = [
  { name: "Virat Kohli", role: "Captain", icon: "👑" },
  { name: "Rohit Sharma", role: "Captain", icon: "🎯" },
  { name: "MS Dhoni", role: "Keeper", icon: "🏆" },
  { name: "Hardik Pandya", role: "AR", icon: "⚡" },
  { name: "KL Rahul", role: "Keeper", icon: "🎯" },
  { name: "Jasprit Bumrah", role: "Bowler", icon: "💣" },
  { name: "Ravindra Jadeja", role: "AR", icon: "⚔️" },
  { name: "Shubman Gill", role: "Batter", icon: "⭐" },
  { name: "Rishabh Pant", role: "Keeper", icon: "💥" },
  { name: "Mohammed Shami", role: "Bowler", icon: "🚀" },
  { name: "Suryakumar Yadav", role: "Batter", icon: "🎪" },
  { name: "Kuldeep Yadav", role: "Bowler", icon: "🌀" },
  { name: "Mohammed Siraj", role: "Bowler", icon: "💨" },
  { name: "Yuzvendra Chahal", role: "Bowler", icon: "🎩" },
  { name: "Axar Patel", role: "AR", icon: "🎯" },
  { name: "Shreyas Iyer", role: "Batter", icon: "🦁" },
  { name: "Ishan Kishan", role: "Keeper", icon: "⚡" },
  { name: "Ravichandran Ashwin", role: "AR", icon: "🧠" },
  { name: "Bhuvneshwar Kumar", role: "Bowler", icon: "🌊" },
  { name: "Sanju Samson", role: "Keeper", icon: "🦅" },
  { name: "Yashasvi Jaiswal", role: "Batter", icon: "🌟" },
  { name: "Rinku Singh", role: "Batter", icon: "💪" },
  { name: "Tilak Varma", role: "Batter", icon: "🎯" },
  { name: "Arshdeep Singh", role: "Bowler", icon: "🏹" },
  { name: "Mukesh Kumar", role: "Bowler", icon: "🔨" },
  { name: "Washington Sundar", role: "AR", icon: "🎲" },
  { name: "Deepak Chahar", role: "Bowler", icon: "💨" },
  { name: "Shardul Thakur", role: "AR", icon: "⚔️" },
  { name: "Prasidh Krishna", role: "Bowler", icon: "🚀" },
  { name: "Avesh Khan", role: "Bowler", icon: "⚡" },
  { name: "Umran Malik", role: "Bowler", icon: "🔥" },
  { name: "Ruturaj Gaikwad", role: "Batter", icon: "🎯" },
  { name: "Shivam Dube", role: "AR", icon: "💪" },
  { name: "Rahul Chahar", role: "Bowler", icon: "🌀" },
  { name: "Varun Chakravarthy", role: "Bowler", icon: "🎭" },
  { name: "Ravi Bishnoi", role: "Bowler", icon: "🎯" },
  { name: "Nitish Rana", role: "Batter", icon: "⚡" },
  { name: "Venkatesh Iyer", role: "AR", icon: "🦅" },
  { name: "Harshal Patel", role: "Bowler", icon: "🎩" },
  { name: "Krunal Pandya", role: "AR", icon: "⚔️" },
  { name: "Deepak Hooda", role: "AR", icon: "🎯" },
  { name: "Rahul Tewatia", role: "AR", icon: "💥" },
  { name: "T Natarajan", role: "Bowler", icon: "🎯" },
  { name: "Navdeep Saini", role: "Bowler", icon: "🚀" },
  { name: "Chetan Sakariya", role: "Bowler", icon: "⚡" },
  { name: "Devdutt Padikkal", role: "Batter", icon: "🎯" },
  { name: "Prithvi Shaw", role: "Batter", icon: "⚡" },
  { name: "Mayank Agarwal", role: "Batter", icon: "🎯" },
  { name: "Abhishek Sharma", role: "Batter", icon: "🌟" },
  { name: "Umesh Yadav", role: "Bowler", icon: "💪" }
];

const GLOBAL_PLAYERS = [
  { name: "Babar Azam", role: "Captain", icon: "👑" },
  { name: "Pat Cummins", role: "Captain", icon: "🔥" },
  { name: "Kane Williamson", role: "Captain", icon: "🧊" },
  { name: "Ben Stokes", role: "AR", icon: "⚡" },
  { name: "Steve Smith", role: "Batter", icon: "🧠" },
  { name: "Joe Root", role: "Batter", icon: "🎯" },
  { name: "Mitchell Starc", role: "Bowler", icon: "🚀" },
  { name: "Jos Buttler", role: "Keeper", icon: "💥" },
  { name: "David Warner", role: "Batter", icon: "⚡" },
  { name: "Kagiso Rabada", role: "Bowler", icon: "💣" },
  { name: "Trent Boult", role: "Bowler", icon: "🌊" },
  { name: "Shaheen Afridi", role: "Bowler", icon: "🦅" },
  { name: "Rashid Khan", role: "Bowler", icon: "🌀" },
  { name: "Glenn Maxwell", role: "AR", icon: "🎪" },
  { name: "Quinton de Kock", role: "Keeper", icon: "🧤" },
  { name: "Mohammad Rizwan", role: "Keeper", icon: "⭐" },
  { name: "Shakib Al Hasan", role: "AR", icon: "⚔️" },
  { name: "Andre Russell", role: "AR", icon: "💪" },
  { name: "Kieron Pollard", role: "Captain", icon: "🔥" },
  { name: "Chris Gayle", role: "Batter", icon: "👑" },
  { name: "AB de Villiers", role: "Batter", icon: "🎯" },
  { name: "Faf du Plessis", role: "Captain", icon: "🦁" },
  { name: "Aiden Markram", role: "Batter", icon: "⭐" },
  { name: "Marnus Labuschagne", role: "Batter", icon: "🧠" },
  { name: "Travis Head", role: "Batter", icon: "⚡" },
  { name: "Josh Hazlewood", role: "Bowler", icon: "🎯" },
  { name: "Nathan Lyon", role: "Bowler", icon: "🌀" },
  { name: "Adam Zampa", role: "Bowler", icon: "🎩" },
  { name: "Mitchell Marsh", role: "AR", icon: "💪" },
  { name: "Marcus Stoinis", role: "AR", icon: "⚔️" },
  { name: "Cameron Green", role: "AR", icon: "🌟" },
  { name: "Alex Carey", role: "Keeper", icon: "🧤" },
  { name: "Tim David", role: "Batter", icon: "💥" },
  { name: "Liam Livingstone", role: "AR", icon: "⚡" },
  { name: "Jonny Bairstow", role: "Keeper", icon: "🔥" },
  { name: "Harry Brook", role: "Batter", icon: "🌟" },
  { name: "Jofra Archer", role: "Bowler", icon: "🚀" },
  { name: "Mark Wood", role: "Bowler", icon: "💨" },
  { name: "Adil Rashid", role: "Bowler", icon: "🌀" },
  { name: "Sam Curran", role: "AR", icon: "⚔️" },
  { name: "Moeen Ali", role: "AR", icon: "🎯" },
  { name: "Dawid Malan", role: "Batter", icon: "⭐" },
  { name: "Devon Conway", role: "Batter", icon: "🎯" },
  { name: "Daryl Mitchell", role: "AR", icon: "💪" },
  { name: "Lockie Ferguson", role: "Bowler", icon: "🚀" },
  { name: "Matt Henry", role: "Bowler", icon: "🎯" },
  { name: "Ish Sodhi", role: "Bowler", icon: "🌀" },
  { name: "Fakhar Zaman", role: "Batter", icon: "⚡" },
  { name: "Imam-ul-Haq", role: "Batter", icon: "🎯" },
  { name: "Haris Rauf", role: "Bowler", icon: "💨" }
];

const FILTER_MAP = {
  'Batters': 'Batter',
  'Bowlers': 'Bowler',
  'All-Rounders': 'AR',
  'Keepers': 'Keeper',
  'Captains': 'Captain'
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('INDIA');
  const [filter, setFilter] = useState('Any');
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [battleNum, setBattleNum] = useState(1);
  const [activeTab, setActiveTab] = useState('Battle');
  const [showShareModal, setShowShareModal] = useState(false);

  const [votes, setVotes] = useState(() => {
    const saved = localStorage.getItem('cricketClashVotes');
    return saved? JSON.parse(saved) : {};
  });

  const [totalBattles, setTotalBattles] = useState(() => {
    const saved = localStorage.getItem('cricketClashBattles');
    return saved? parseInt(saved) : 0;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('cricketClashHistory');
    return saved? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('cricketClashVotes', JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem('cricketClashBattles', totalBattles.toString());
  }, [totalBattles]);

  useEffect(() => {
    localStorage.setItem('cricketClashHistory', JSON.stringify(history));
  }, [history]);

  const getPlayers = useCallback(() => {
    const players = mode === 'INDIA'? INDIAN_PLAYERS : [...INDIAN_PLAYERS,...GLOBAL_PLAYERS];
    if (filter === 'Any') return players;
    return players.filter(p => p.role === FILTER_MAP[filter]);
  }, [mode, filter]);

  const loadBattle = useCallback(() => {
    const players = getPlayers();
    if (players.length < 2) return;
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayer1(shuffled[0]);
    setPlayer2(shuffled[1]);
  }, [getPlayers]);

  useEffect(() => {
    if (user) loadBattle();
  }, [loadBattle, user]);

  const vote = (player) => {
    if (!user) {
      alert('Please sign in with Google to vote!');
      return;
    }
    setVotes(prev => ({
     ...prev,
      [player.name]: (prev[player.name] || 0) + 1
    }));

    setHistory(prev => [{
      winner: player.name,
      loser: player === player1? player2.name : player1.name,
      timestamp: Date.now()
    },...prev].slice(0, 50));

    setTotalBattles(prev => prev + 1);
    setBattleNum(prev => prev + 1);
    loadBattle();
  };

  const skip = () => {
    setBattleNum(prev => prev + 1);
    loadBattle();
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const shareToSocial = (platform) => {
    const text = `Who wins: ${player1?.name} vs ${player2?.name}? Vote on Cricket Clash!`;
    const url = window.location.href;
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    };
    if (platform === 'instagram') {
      navigator.clipboard.writeText(text + ' ' + url);
      alert('Link copied! Paste in Instagram Story or DM 📸');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareModal(false);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Clash',
        text: `Who wins: ${player1?.name} vs ${player2?.name}?`,
        url: window.location.href
      });
    } else {
      setShowShareModal(true);
    }
  };

  const getVotes = (playerName) => votes[playerName] || 0;
  const getTotalVotes = () => Object.values(votes).reduce((sum, v) => sum + v, 0);

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

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-logo">
            <span className="logo-zap-big">⚡</span>
            <h1>Cricket <span className="clash-text">Clash</span></h1>
            <p className="tagline">Vote for your favorite cricketers</p>
          </div>
          <button className="google-login-btn" onClick={handleGoogleLogin}>
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            Continue with Google
          </button>
          <div className="footer-copyright-login">
            ©️ 2026 crickclash production by ANESH
          </div>
        </div>
      </div>
    );
  }

  if (!player1 ||!player2) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <div className="header">
        <h1><span className="logo-zap">⚡</span> Cricket <span className="clash-text">Clash</span></h1>
        <div className="header-right">
          <div className="made-by">by Anesh</div>
          <div className="user-profile">
            <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
            <button className="sign-out-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </div>

      <div className="nav-tabs">
        <button className={activeTab === 'Battle'? 'active' : ''} onClick={() => setActiveTab('Battle')}>
          ⚔️ Battle
        </button>
        <button className={activeTab === 'Rankings'? 'active' : ''} onClick={() => setActiveTab('Rankings')}>
          🏆 Rankings
        </button>
        <button className={activeTab === 'History'? 'active' : ''} onClick={() => setActiveTab('History')}>
          📜 History
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{(getTotalVotes()/1000).toFixed(1)}k</div>
          <div className="stat-label">TOTAL VOTES</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalBattles}</div>
          <div className="stat-label">BATTLES</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{getTopChamp()}</div>
          <div className="stat-label">TOP CHAMP</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{history.length}</div>
          <div className="stat-label">🔥 VOTED</div>
        </div>
      </div>

      {activeTab === 'Battle' && (
        <div className="battle-section">
          <div className="battle-title">WHO DO YOU LIKE?</div>
          <div className="battle-number-main">Battle {battleNum}</div>

          <div className="filter-tabs">
            {['Any', 'Batters', 'Bowlers', 'All-Rounders', 'Keepers', 'Captains'].map(f => (
              <button key={f} className={filter === f? 'active' : ''} onClick={() => setFilter(f)}>
                {f === 'Any' && '🎲'} {f === 'Batters' && '🏏'} {f === 'Bowlers' && '🎯'} {f === 'All-Rounders' && '⚡'} {f === 'Keepers' && '🧤'} {f === 'Captains' && '👑'} {f}
              </button>
            ))}
          </div>

          <div className="battle-cards-side">
            <div className="player-card-icon left" onClick={() => vote(player1)}>
              <div className="icon-display">{player1.icon}</div>
              <div className="player-info-bottom">
                <div className="player-role-tag">{player1.role.toUpperCase()}</div>
                <div className="player-name-side">{player1.name}</div>
                <div className="player-votes-side">{getVotes(player1.name)} votes</div>
              </div>
            </div>

            <div className="vs-center">VS</div>

            <div className="player-card-icon right" onClick={() => vote(player2)}>
              <div className="icon-display">{player2.icon}</div>
              <div className="player-info-bottom">
                <div className="player-role-tag">{player2.role.toUpperCase()}</div>
                <div className="player-name-side">{player2.name}</div>
                <div className="player-votes-side">{getVotes(player2.name)} votes</div>
              </div>
            </div>
          </div>

          <button className="skip-btn-full" onClick={skip}>Skip →</button>

          <button className="share-btn-main" onClick={share}>
            📤 Share this battle
          </button>

          <div className="footer-copyright">
            ©️ 2026 crickclash production by ANESH
          </div>
        </div>
      )}

      {activeTab === 'Rankings' && (
        <div className="rankings-section">
          <div className="section-title">🏆 Top 20 Players</div>
          {getRankings().map((player, idx) => (
            <div key={player.name} className="ranking-item">
              <div className="rank-number">{idx + 1}</div>
              <div className="rank-name">{player.name}</div>
              <div className="rank-votes">{player.votes} votes</div>
            </div>
          ))}
          {getRankings().length === 0 && <div className="empty-state">No votes yet. Start battling!</div>}
        </div>
      )}

      {activeTab === 'History' && (
        <div className="history-section">
          <div className="section-title">📜 Your Recent Battles</div>
          {history.map((battle, idx) => (
            <div key={idx} className="history-item">
              <div className="history-winner">✅ {battle.winner}</div>
              <div className="history-vs">beat</div>
              <div className="history-loser">❌ {battle.loser}</div>
            </div>
          ))}
          {history.length === 0 && <div className="empty-state">No battles yet. Start voting!</div>}
        </div>
      )}

      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share to</h3>
              <button onClick={() => setShowShareModal(false)}>✕</button>
            </div>
            <div className="share-buttons-grid">
              <button className="share-social-btn whatsapp" onClick={() => shareToSocial('whatsapp')}>
                <span className="share-icon">💬</span>
                <span>WhatsApp</span>
              </button>
              <button className="share-social-btn instagram" onClick={() => shareToSocial('instagram')}>
                <span className="share-icon">📸</span>
                <span>Instagram</span>
              </button>
              <button className="share-social-btn twitter" onClick={() => shareToSocial('twitter')}>
                <span className="share-icon">🐦</span>
                <span>Twitter</span>
              </button>
              <button className="share-social-btn facebook" onClick={() => shareToSocial('facebook')}>
                <span className="share-icon">👥</span>
                <span>Facebook</span>
              </button>
              <button className="share-social-btn linkedin" onClick={() => shareToSocial('linkedin')}>
                <span className="share-icon">💼</span>
                <span>LinkedIn</span>
              </button>
              <button className="share-social-btn telegram" onClick={() => shareToSocial('telegram')}>
                <span className="share-icon">✈️</span>
                <span>Telegram</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
