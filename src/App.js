import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { ref, update, increment, onValue } from 'firebase/database';
import { auth, db } from './firebase';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [gameMode, setGameMode] = useState('india');
  const [battleNumber, setBattleNumber] = useState(1);
  const [userVotes, setUserVotes] = useState({});
  const [playerVotes, setPlayerVotes] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [showChampion, setShowChampion] = useState(false);
  const [championData, setChampionData] = useState({ name: '', icon: '', percent: 0 });
  const [voteAnimation, setVoteAnimation] = useState('');
  const [filter, setFilter] = useState('Any');

  const INDIAN_PLAYERS = [
    { id: 1, name: 'Virat Kohli', icon: '👑', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/164.png' },
    { id: 2, name: 'MS Dhoni', icon: '🦁', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/11.png' },
    { id: 3, name: 'Rohit Sharma', icon: '💙', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/107.png' },
    { id: 4, name: 'Sachin Tendulkar', icon: '🏏', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/6.png' },
    { id: 5, name: 'Jasprit Bumrah', icon: '🔥', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/1124.png' },
    { id: 6, name: 'Hardik Pandya', icon: '⚡', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/2740.png' },
    { id: 7, name: 'KL Rahul', icon: '🎯', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/1125.png' },
    { id: 8, name: 'Rishabh Pant', icon: '💥', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/2972.png' },
    { id: 9, name: 'Shubman Gill', icon: '🌟', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/9170.png' },
    { id: 10, name: 'Yuvraj Singh', icon: '🚀', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/25.png' },
    { id: 11, name: 'Ravindra Jadeja', icon: '⚔️', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/587.png' },
    { id: 12, name: 'Mohammed Shami', icon: '💨', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/94.png' },
    { id: 13, name: 'R Ashwin', icon: '🌀', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/8.png' },
    { id: 14, name: 'Suryakumar Yadav', icon: '☄️', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/108.png' },
    { id: 15, name: 'Mohammed Siraj', icon: '🎯', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/3840.png' },
    { id: 16, name: 'Shikhar Dhawan', icon: '💫', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/95.png' },
    { id: 17, name: 'Axar Patel', icon: '🎪', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/1113.png' },
    { id: 18, name: 'Kuldeep Yadav', icon: '🎭', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/1842.png' },
    { id: 19, name: 'Bhuvneshwar Kumar', icon: '🌊', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/796.png' },
    { id: 20, name: 'Dinesh Karthik', icon: '🎨', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/10.png' },
    { id: 21, name: 'Rahul Dravid', icon: '🧱', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/1.png' },
    { id: 22, name: 'Sourav Ganguly', icon: '👑', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/5.png' },
    { id: 23, name: 'VVS Laxman', icon: '🎯', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/2.png' },
    { id: 24, name: 'Anil Kumble', icon: '🌀', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/4.png' },
    { id: 25, name: 'Kapil Dev', icon: '🏆', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/12.png' },
    { id: 26, name: 'Sunil Gavaskar', icon: '☀️', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/13.png' },
    { id: 27, name: 'Zaheer Khan', icon: '⚡', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/3.png' },
    { id: 28, name: 'Harbhajan Singh', icon: '🌀', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/7.png' },
    { id: 29, name: 'Virender Sehwag', icon: '💣', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/24.png' },
    { id: 30, name: 'Gautam Gambhir', icon: '🗡️', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/90.png' },
    { id: 31, name: 'Ishant Sharma', icon: '🗼', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/89.png' },
    { id: 32, name: 'Cheteshwar Pujara', icon: '🛡️', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/91.png' },
    { id: 33, name: 'Ajinkya Rahane', icon: '🎓', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/201.png' },
    { id: 34, name: 'Umesh Yadav', icon: '🚂', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/93.png' },
    { id: 35, name: 'Wriddhiman Saha', icon: '🧤', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/588.png' },
    { id: 36, name: 'Shardul Thakur', icon: '🦁', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/1567.png' },
    { id: 37, name: 'Washington Sundar', icon: '🔱', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/3793.png' },
    { id: 38, name: 'Prasidh Krishna', icon: '🎯', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/6853.png' },
    { id: 39, name: 'Deepak Chahar', icon: '🌪️', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/2045.png' },
    { id: 40, name: 'Yuzvendra Chahal', icon: '♟️', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/1118.png' },
    { id: 41, name: 'Ruturaj Gaikwad', icon: '⚡', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/6893.png' },
    { id: 42, name: 'Ishan Kishan', icon: '💥', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/3792.png' },
    { id: 43, name: 'Sanju Samson', icon: '🌊', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/1117.png' },
    { id: 44, name: 'Shreyas Iyer', icon: '🎭', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/3042.png' },
    { id: 45, name: 'Arshdeep Singh', icon: '🏹', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/9012.png' },
    { id: 46, name: 'Ravi Bishnoi', icon: '🕸️', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/8203.png' },
    { id: 47, name: 'Tilak Varma', icon: '🌟', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/10792.png' },
    { id: 48, name: 'Mukesh Kumar', icon: '🎯', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/11412.png' },
    { id: 49, name: 'Rinku Singh', icon: '💫', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/6850.png' },
    { id: 50, name: 'Jitesh Sharma', icon: '⚡', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/8229.png' },
  ];

  const FOREIGN_PLAYERS = [
    { id: 51, name: 'AB de Villiers', icon: '🦸', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/310.png' },
    { id: 52, name: 'Chris Gayle', icon: '💀', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/236.png' },
    { id: 53, name: 'Steve Smith', icon: '🎩', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/271.png' },
    { id: 54, name: 'Kane Williamson', icon: '😇', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/440.png' },
    { id: 55, name: 'Pat Cummins', icon: '🏹', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/488.png' },
    { id: 56, name: 'Ben Stokes', icon: '💪', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/611.png' },
    { id: 57, name: 'Jos Buttler', icon: '⚡', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/275.png' },
    { id: 58, name: 'Rashid Khan', icon: '🕷️', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/2885.png' },
    { id: 59, name: 'Babar Azam', icon: '👑', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/2751.png' },
    { id: 60, name: 'Shaheen Afridi', icon: '🦅', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/4530.png' },
    { id: 61, name: 'David Warner', icon: '💣', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/170.png' },
    { id: 62, name: 'Mitchell Starc', icon: '🚀', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/276.png' },
    { id: 63, name: 'Glenn Maxwell', icon: '🎪', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/282.png' },
    { id: 64, name: 'Joe Root', icon: '🎓', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/309.png' },
    { id: 65, name: 'Jofra Archer', icon: '🎯', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/3607.png' },
    { id: 66, name: 'Quinton de Kock', icon: '🧤', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/834.png' },
    { id: 67, name: 'Kagiso Rabada', icon: '💨', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/1520.png' },
    { id: 68, name: 'Trent Boult', icon: '🌪️', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/969.png' },
    { id: 69, name: 'Jonny Bairstow', icon: '⚡', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/506.png' },
    { id: 70, name: 'Andre Russell', icon: '💥', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/273.png' },
    { id: 71, name: 'Kieron Pollard', icon: '🎆', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/229.png' },
    { id: 72, name: 'Dwayne Bravo', icon: '💃', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/64.png' },
    { id: 73, name: 'Shakib Al Hasan', icon: '🎭', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/75.png' },
    { id: 74, name: 'Mohammad Rizwan', icon: '🧱', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/1879.png' },
    { id: 75, name: 'Faf du Plessis', icon: '🎩', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/337.png' },
    { id: 76, name: 'Josh Hazlewood', icon: '🎯', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/857.png' },
    { id: 77, name: 'Marnus Labuschagne', icon: '🧠', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/3798.png' },
    { id: 78, name: 'Travis Head', icon: '🔥', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/3799.png' },
    { id: 79, name: 'Adam Zampa', icon: '🌀', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/1842.png' },
    { id: 80, name: 'Lockie Ferguson', icon: '⚡', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/2557.png' },
    { id: 81, name: 'Devon Conway', icon: '🎯', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/8206.png' },
    { id: 82, name: 'Heinrich Klaasen', icon: '💥', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/3787.png' },
    { id: 83, name: 'Aiden Markram', icon: '🎓', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/3828.png' },
    { id: 84, name: 'Anrich Nortje', icon: '🚀', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/5788.png' },
    { id: 85, name: 'Liam Livingstone', icon: '💣', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/3722.png' },
    { id: 86, name: 'Harry Brook', icon: '🌟', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/8345.png' },
    { id: 87, name: 'Sam Curran', icon: '⚔️', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/3911.png' },
    { id: 88, name: 'Mark Wood', icon: '💨', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/1815.png' },
    { id: 89, name: 'Mitchell Marsh', icon: '🔨', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/166.png' },
    { id: 90, name: 'Cameron Green', icon: '🌲', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/8269.png' },
    { id: 91, name: 'Nicholas Pooran', icon: '💫', role: 'Keeper', photo: 'https://resources.pulse.icc-cricket.com/players/284/3769.png' },
    { id: 92, name: 'Shimron Hetmyer', icon: '🎆', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/3796.png' },
    { id: 93, name: 'Jason Holder', icon: '🗼', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/1135.png' },
    { id: 94, name: 'Tim David', icon: '💥', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/10815.png' },
    { id: 95, name: 'Marco Jansen', icon: '🦒', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/10524.png' },
    { id: 96, name: 'Fakhar Zaman', icon: '⚡', role: 'Batter', photo: 'https://resources.pulse.icc-cricket.com/players/284/3081.png' },
    { id: 97, name: 'Haris Rauf', icon: '🚀', role: 'Bowler', photo: 'https://resources.pulse.icc-cricket.com/players/284/8180.png' },
    { id: 98, name: 'Shadab Khan', icon: '🌀', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/3802.png' },
    { id: 99, name: 'Dasun Shanaka', icon: '⚔️', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/2067.png' },
    { id: 100, name: 'Wanindu Hasaranga', icon: '🕷️', role: 'AR', photo: 'https://resources.pulse.icc-cricket.com/players/284/7269.png' },
  ];

  const getAllPlayers = () => {
    return gameMode === 'india'? INDIAN_PLAYERS : [...INDIAN_PLAYERS,...FOREIGN_PLAYERS];
  };

  const getFilteredPlayers = () => {
    const players = getAllPlayers();
    if (filter === 'Any') return players;
    return players.filter(p => p.role === filter);
  };

  const getCurrentBattle = () => {
    const players = getFilteredPlayers();
    const p1Index = (battleNumber - 1) % players.length;
    const p2Index = battleNumber % players.length;
    const player1 = players[p1Index];
    const player2 = players[p2Index];

    return {
      player1: {...player1, votes: playerVotes[player1.id] || 0 },
      player2: {...player2, votes: playerVotes[player2.id] || 0 }
    };
  };

  const currentBattle = getCurrentBattle();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const votesRef = ref(db, 'playerVotes');
    const unsubscribe = onValue(votesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setPlayerVotes(data);
    });
    return () => unsubscribe();
  }, []);
    const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Login Error:", error);
      alert("Login failed: " + error.message);
    });
  };

  const handleLogout = () => signOut(auth);

  const handleVote = async (playerId) => {
    const battleKey = `battle_${battleNumber}_${gameMode}`;
    if (userVotes[battleKey]) {
      alert('Ee battle lo already vote chesav! Next battle ki vellu');
      return;
    }

    setVoteAnimation(playerId);
    setTimeout(() => setVoteAnimation(''), 600);

    const updatedBattle = {...currentBattle};
    if (playerId === currentBattle.player1.id) {
      updatedBattle.player1.votes += 1;
    } else {
      updatedBattle.player2.votes += 1;
    }

    setUserVotes({...userVotes, [battleKey]: playerId});

    const totalVotes = updatedBattle.player1.votes + updatedBattle.player2.votes;
    const winner = updatedBattle.player1.votes > updatedBattle.player2.votes
? updatedBattle.player1
      : updatedBattle.player2;
    const winnerPercent = totalVotes > 0? Math.round((winner.votes / totalVotes) * 100) : 100;

    setTimeout(() => {
      setChampionData({
        name: winner.name,
        icon: winner.icon,
        percent: winnerPercent
      });
      setShowChampion(true);
    }, 800);

    if (user) {
      try {
        const updates = {};
        updates[`playerVotes/${playerId}`] = increment(1);
        updates[`userVotes/${user.uid}/${battleKey}`] = playerId;
        updates['totalVotes'] = increment(1);
        await update(ref(db), updates);
      } catch (error) {
        console.error('Firebase error:', error);
      }
    }
  };

  const handleSkip = () => setBattleNumber(battleNumber + 1);

  const handleNextBattle = () => {
    setShowChampion(false);
    setBattleNumber(battleNumber + 1);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <div className="header">
        <h1>crickclash</h1>
        {user? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <button onClick={handleLogin}>Sign in with Google</button>
        )}
      </div>

      <div className="mode-selector">
        <button
          className={gameMode === 'india'? 'active' : ''}
          onClick={() => setGameMode('india')}>
          🇮🇳 INDIA MODE (50)
        </button>
        <button
          className={gameMode === 'global'? 'active' : ''}
          onClick={() => setGameMode('global')}>
          🌍 GLOBAL MODE (100)
        </button>
      </div>

      <div className="filter-tabs">
        {['Any', 'Batter', 'Bowler', 'AR', 'Keeper'].map(f => (
          <button
            key={f}
            className={filter === f? 'active' : ''}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="battle-screen">
        <div className="battle-number">Battle #{battleNumber}</div>

        <div className="battle-cards">
          <div className={`player-card ${voteAnimation === currentBattle.player1.id? 'vote-jump' : ''}`}>
            <div className="player-photo-wrapper" onClick={() => handleVote(currentBattle.player1.id)}>
              <img
                src={currentBattle.player1.photo}
                alt={currentBattle.player1.name}
                onError={(e) => {e.target.src = 'https://via.placeholder.com/400x400/1e293b/94a3b8?text=' + currentBattle.player1.name.charAt(0)}}
              />
              <div className="player-icon-badge">{currentBattle.player1.icon}</div>
            </div>
            <div className="player-info">
              <div className="player-name">{currentBattle.player1.name}</div>
              <div className="player-role">{currentBattle.player1.role}</div>
              <div className="vote-count-big">{currentBattle.player1.votes}</div>
              <button
                className="vote-btn-main"
                onClick={() => handleVote(currentBattle.player1.id)}
                disabled={userVotes[`battle_${battleNumber}_${gameMode}`]}>
                {userVotes[`battle_${battleNumber}_${gameMode}`] === currentBattle.player1.id? '✓ VOTED' : 'VOTE'}
              </button>
            </div>
          </div>

          <div className="vs-divider">
            <div className="vs-circle">VS</div>
          </div>

          <div className={`player-card ${voteAnimation === currentBattle.player2.id? 'vote-jump' : ''}`}>
            <div className="player-photo-wrapper" onClick={() => handleVote(currentBattle.player2.id)}>
              <img
                src={currentBattle.player2.photo}
                alt={currentBattle.player2.name}
                onError={(e) => {e.target.src = 'https://via.placeholder.com/400x400/1e293b/94a3b8?text=' + currentBattle.player2.name.charAt(0)}}
              />
              <div className="player-icon-badge">{currentBattle.player2.icon}</div>
            </div>
            <div className="player-info">
              <div className="player-name">{currentBattle.player2.name}</div>
              <div className="player-role">{currentBattle.player2.role}</div>
              <div className="vote-count-big">{currentBattle.player2.votes}</div>
              <button
                className="vote-btn-main"
                onClick={() => handleVote(currentBattle.player2.id)}
                disabled={userVotes[`battle_${battleNumber}_${gameMode}`]}>
                {userVotes[`battle_${battleNumber}_${gameMode}`] === currentBattle.player2.id? '✓ VOTED' : 'VOTE'}
              </button>
            </div>
          </div>
        </div>

        <button className="skip-btn" onClick={handleSkip}>
          Skip Battle →
        </button>
      </div>

      {showChampion && (
        <div className="modal-overlay" onClick={() => setShowChampion(false)}>
          <div className="champion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crown">👑</div>
            <div className="champion-label">YOUR CHAMPION</div>
            <div className="champion-name">{championData.name}</div>
            <div className="champion-icon">{championData.icon}</div>
            <div className="champion-percent">
              {championData.percent}% of fans chose {championData.name.split(' ')[0]}
            </div>
            <button className="next-battle-btn" onClick={handleNextBattle}>
              ⚡ Next Battle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
