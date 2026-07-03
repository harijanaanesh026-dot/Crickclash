import React, { useState, useEffect } from 'react';
import './App.css';

// 50 INDIAN PLAYERS - ICONS ONLY
const INDIAN_PLAYERS = [
  { name: "Abhishek Sharma", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Umesh Yadav", role: "Bowler", icon: "⚡", votes: 0 },
  { name: "Virat Kohli", role: "Batter", icon: "🔥", votes: 0 },
  { name: "Rohit Sharma", role: "Batter", icon: "🎯", votes: 0 },
  { name: "MS Dhoni", role: "Keeper", icon: "🏆", votes: 0 },
  { name: "Jasprit Bumrah", role: "Bowler", icon: "💣", votes: 0 },
  { name: "Hardik Pandya", role: "AR", icon: "⚡", votes: 0 },
  { name: "KL Rahul", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Ravindra Jadeja", role: "AR", icon: "⚔️", votes: 0 },
  { name: "Shubman Gill", role: "Batter", icon: "⭐", votes: 0 },
  { name: "Rishabh Pant", role: "Keeper", icon: "💥", votes: 0 },
  { name: "Mohammed Shami", role: "Bowler", icon: "🚀", votes: 0 },
  { name: "Suryakumar Yadav", role: "Batter", icon: "🎪", votes: 0 },
  { name: "Kuldeep Yadav", role: "Bowler", icon: "🌀", votes: 0 },
  { name: "Mohammed Siraj", role: "Bowler", icon: "💨", votes: 0 },
  { name: "Yuzvendra Chahal", role: "Bowler", icon: "🎩", votes: 0 },
  { name: "Axar Patel", role: "AR", icon: "🎯", votes: 0 },
  { name: "Shreyas Iyer", role: "Batter", icon: "🦁", votes: 0 },
  { name: "Ishan Kishan", role: "Keeper", icon: "⚡", votes: 0 },
  { name: "Ravichandran Ashwin", role: "Bowler", icon: "🧠", votes: 0 },
  { name: "Bhuvneshwar Kumar", role: "Bowler", icon: "🌊", votes: 0 },
  { name: "Sanju Samson", role: "Keeper", icon: "🦅", votes: 0 },
  { name: "Yashasvi Jaiswal", role: "Batter", icon: "🌟", votes: 0 },
  { name: "Rinku Singh", role: "Batter", icon: "💪", votes: 0 },
  { name: "Tilak Varma", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Arshdeep Singh", role: "Bowler", icon: "🏹", votes: 0 },
  { name: "Mukesh Kumar", role: "Bowler", icon: "🔨", votes: 0 },
  { name: "Washington Sundar", role: "AR", icon: "🎲", votes: 0 },
  { name: "Deepak Chahar", role: "Bowler", icon: "💨", votes: 0 },
  { name: "Shardul Thakur", role: "AR", icon: "⚔️", votes: 0 },
  { name: "Prasidh Krishna", role: "Bowler", icon: "🚀", votes: 0 },
  { name: "Avesh Khan", role: "Bowler", icon: "⚡", votes: 0 },
  { name: "Umran Malik", role: "Bowler", icon: "🔥", votes: 0 },
  { name: "Ruturaj Gaikwad", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Shivam Dube", role: "AR", icon: "💪", votes: 0 },
  { name: "Rahul Chahar", role: "Bowler", icon: "🌀", votes: 0 },
  { name: "Varun Chakravarthy", role: "Bowler", icon: "🎭", votes: 0 },
  { name: "Ravi Bishnoi", role: "Bowler", icon: "🎯", votes: 0 },
  { name: "Nitish Rana", role: "Batter", icon: "⚡", votes: 0 },
  { name: "Venkatesh Iyer", role: "AR", icon: "🦅", votes: 0 },
  { name: "Harshal Patel", role: "Bowler", icon: "🎩", votes: 0 },
  { name: "Krunal Pandya", role: "AR", icon: "⚔️", votes: 0 },
  { name: "Deepak Hooda", role: "AR", icon: "🎯", votes: 0 },
  { name: "Rahul Tewatia", role: "AR", icon: "💥", votes: 0 },
  { name: "T Natarajan", role: "Bowler", icon: "🎯", votes: 0 },
  { name: "Navdeep Saini", role: "Bowler", icon: "🚀", votes: 0 },
  { name: "Chetan Sakariya", role: "Bowler", icon: "⚡", votes: 0 },
  { name: "Devdutt Padikkal", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Prithvi Shaw", role: "Batter", icon: "⚡", votes: 0 },
  { name: "Mayank Agarwal", role: "Batter", icon: "🎯", votes: 0 }
];

// 50 GLOBAL PLAYERS
const GLOBAL_PLAYERS = [
  { name: "Babar Azam", role: "Batter", icon: "👑", votes: 0 },
  { name: "Pat Cummins", role: "Bowler", icon: "🔥", votes: 0 },
  { name: "Kane Williamson", role: "Batter", icon: "🧊", votes: 0 },
  { name: "Ben Stokes", role: "AR", icon: "⚡", votes: 0 },
  { name: "Steve Smith", role: "Batter", icon: "🧠", votes: 0 },
  { name: "Joe Root", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Mitchell Starc", role: "Bowler", icon: "🚀", votes: 0 },
  { name: "Jos Buttler", role: "Keeper", icon: "💥", votes: 0 },
  { name: "David Warner", role: "Batter", icon: "⚡", votes: 0 },
  { name: "Kagiso Rabada", role: "Bowler", icon: "💣", votes: 0 },
  { name: "Trent Boult", role: "Bowler", icon: "🌊", votes: 0 },
  { name: "Shaheen Afridi", role: "Bowler", icon: "🦅", votes: 0 },
  { name: "Rashid Khan", role: "Bowler", icon: "🌀", votes: 0 },
  { name: "Glenn Maxwell", role: "AR", icon: "🎪", votes: 0 },
  { name: "Quinton de Kock", role: "Keeper", icon: "🧤", votes: 0 },
  { name: "Mohammad Rizwan", role: "Keeper", icon: "⭐", votes: 0 },
  { name: "Shakib Al Hasan", role: "AR", icon: "⚔️", votes: 0 },
  { name: "Andre Russell", role: "AR", icon: "💪", votes: 0 },
  { name: "Kieron Pollard", role: "AR", icon: "🔥", votes: 0 },
  { name: "Chris Gayle", role: "Batter", icon: "👑", votes: 0 },
  { name: "AB de Villiers", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Faf du Plessis", role: "Batter", icon: "🦁", votes: 0 },
  { name: "Aiden Markram", role: "Batter", icon: "⭐", votes: 0 },
  { name: "Marnus Labuschagne", role: "Batter", icon: "🧠", votes: 0 },
  { name: "Travis Head", role: "Batter", icon: "⚡", votes: 0 },
  { name: "Josh Hazlewood", role: "Bowler", icon: "🎯", votes: 0 },
  { name: "Nathan Lyon", role: "Bowler", icon: "🌀", votes: 0 },
  { name: "Adam Zampa", role: "Bowler", icon: "🎩", votes: 0 },
  { name: "Mitchell Marsh", role: "AR", icon: "💪", votes: 0 },
  { name: "Marcus Stoinis", role: "AR", icon: "⚔️", votes: 0 },
  { name: "Cameron Green", role: "AR", icon: "🌟", votes: 0 },
  { name: "Alex Carey", role: "Keeper", icon: "🧤", votes: 0 },
  { name: "Tim David", role: "Batter", icon: "💥", votes: 0 },
  { name: "Liam Livingstone", role: "AR", icon: "⚡", votes: 0 },
  { name: "Jonny Bairstow", role: "Keeper", icon: "🔥", votes: 0 },
  { name: "Harry Brook", role: "Batter", icon: "🌟", votes: 0 },
  { name: "Jofra Archer", role: "Bowler", icon: "🚀", votes: 0 },
  { name: "Mark Wood", role: "Bowler", icon: "💨", votes: 0 },
  { name: "Adil Rashid", role: "Bowler", icon: "🌀", votes: 0 },
  { name: "Sam Curran", role: "AR", icon: "⚔️", votes: 0 },
  { name: "Moeen Ali", role: "AR", icon: "🎯", votes: 0 },
  { name: "Dawid Malan", role: "Batter", icon: "⭐", votes: 0 },
  { name: "Devon Conway", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Daryl Mitchell", role: "AR", icon: "💪", votes: 0 },
  { name: "Lockie Ferguson", role: "Bowler", icon: "🚀", votes: 0 },
  { name: "Matt Henry", role: "Bowler", icon: "🎯", votes: 0 },
  { name: "Ish Sodhi", role: "Bowler", icon: "🌀", votes: 0 },
  { name: "Fakhar Zaman", role: "Batter", icon: "⚡", votes: 0 },
  { name: "Imam-ul-Haq", role: "Batter", icon: "🎯", votes: 0 },
  { name: "Haris Rauf", role: "Bowler", icon: "💨", votes: 0 }
];

function App() {
  const [mode, setMode] = useState('INDIA');
  const [filter, setFilter] = useState('Any');
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [battleNum, setBattleNum] = useState(1);
  const [totalVotes, setTotalVotes] = useState(1200);
  const [totalBattles, setTotalBattles] = useState(1);
  const [activeTab, setActiveTab] = useState('Battle');

  const getPlayers = () => {
    const players = mode === 'INDIA'? INDIAN_PLAYERS : [...INDIAN_PLAYERS,...GLOBAL_PLAYERS];
    if (filter === 'Any') return players;
    const filterMap = { 'Batters': 'Batter', 'Bowlers': 'Bowler', 'All-Rounders': 'AR', 'Keepers': 'Keeper' };
    return players.filter(p => p.role === filterMap[filter]);
  };

  const loadBattle = () => {
    const players = getPlayers();
    if (players.length < 2) return;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setPlayer1(shuffled[0]);
    setPlayer2(shuffled[1]);
  };

  useEffect(() => {
    loadBattle();
  }, [mode, filter]);

  const vote = (player) => {
    setTotalVotes(totalVotes + 1);
    setTotalBattles(totalBattles + 1);
    setBattleNum(battleNum + 1);
    loadBattle();
  };

  const skip = () => {
    setBattleNum(battleNum + 1);
    loadBattle();
  };

  if (!player1 ||!player2) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <div className="header">
        <h1><span className="logo-zap">⚡</span> Cricket <span className="clash-text">Clash</span></h1>
        <button className="sign-in-btn">Sign In</button>
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
          <div className="stat-value">{(totalVotes/1000).toFixed(1)}k</div>
          <div className="stat-label">TOTAL VOTES</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{totalBattles}</div>
          <div className="stat-label">BATTLES</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">Krishna</div>
          <div className="stat-label">TOP CHAMP</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">0</div>
          <div className="stat-label">🔥 STREAK</div>
        </div>
      </div>

      <div className="battle-section">
        <div className="battle-title">WHO DO YOU LIKE?</div>
        <div className="battle-number-main">Battle {battleNum}</div>

        <div className="filter-tabs">
          {['Any', 'Batters', 'Bowlers', 'All-Rounders'].map(f => (
            <button key={f} className={filter === f? 'active' : ''} onClick={() => setFilter(f)}>
              {f === 'Any' && '🎲'} {f === 'Batters' && '🏏'} {f === 'Bowlers' && '🎯'} {f === 'All-Rounders' && '⚡'} {f}
            </button>
          ))}
        </div>

        <div className="battle-cards-side">
          <div className="player-card-icon left" onClick={() => vote(player1)}>
            <div className="icon-display">{player1.icon}</div>
            <div className="player-info-bottom">
              <div className="player-role-tag">{player1.role.toUpperCase()}</div>
              <div className="player-name-side">{player1.name}</div>
              <div className="player-votes-side">{player1.votes} votes</div>
            </div>
          </div>

          <div className="vs-center">VS</div>

          <div className="player-card-icon right" onClick={() => vote(player2)}>
            <div className="icon-display">{player2.icon}</div>
            <div className="player-info-bottom">
              <div className="player-role-tag">{player2.role.toUpperCase()}</div>
              <div className="player-name-side">{player2.name}</div>
              <div className="player-votes-side">{player2.votes} votes</div>
            </div>
          </div>
        </div>

        <button className="skip-btn-full" onClick={skip}>Skip →</button>
      </div>
    </div>
  );
}

export default App;
