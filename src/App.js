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
  const [filter, setFilter] = useState('Any');
  const [showChampion, setShowChampion] = useState(false);
  const [championData, setChampionData] = useState({ name: '', icon: '', percent: 0 });
  const [voteAnimation, setVoteAnimation] = useState('');

  // WORKING PHOTO URLS - WIKIPEDIA CDN
  const INDIAN_PLAYERS = [
    { id: 1, name: 'Virat Kohli', icon: '👑', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Virat_Kohli.jpg/400px-Virat_Kohli.jpg' },
    { id: 2, name: 'MS Dhoni', icon: '🦁', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/MS_Dhoni.jpg/400px-MS_Dhoni.jpg' },
    { id: 3, name: 'Rohit Sharma', icon: '💙', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg/400px-Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg' },
    { id: 4, name: 'Sachin Tendulkar', icon: '🏏', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Sachin_Tendulkar_at_MRF_Promotion_Event.jpg/400px-Sachin_Tendulkar_at_MRF_Promotion_Event.jpg' },
    { id: 5, name: 'Jasprit Bumrah', icon: '🔥', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Jasprit_Bumrah.jpg/400px-Jasprit_Bumrah.jpg' },
    { id: 6, name: 'Hardik Pandya', icon: '⚡', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Hardik_Pandya.jpg/400px-Hardik_Pandya.jpg' },
    { id: 7, name: 'KL Rahul', icon: '🎯', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/KL_Rahul.jpg/400px-KL_Rahul.jpg' },
    { id: 8, name: 'Rishabh Pant', icon: '💥', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Rishabh_Pant.jpg/400px-Rishabh_Pant.jpg' },
    { id: 9, name: 'Shubman Gill', icon: '🌟', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Shubman_Gill.jpg/400px-Shubman_Gill.jpg' },
    { id: 10, name: 'Yuvraj Singh', icon: '🚀', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Yuvraj_Singh.jpg/400px-Yuvraj_Singh.jpg' },
    { id: 11, name: 'Ravindra Jadeja', icon: '⚔️', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ravindra_Jadeja.jpg/400px-Ravindra_Jadeja.jpg' },
    { id: 12, name: 'Mohammed Shami', icon: '💨', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Mohammed_Shami.jpg/400px-Mohammed_Shami.jpg' },
    { id: 13, name: 'R Ashwin', icon: '🌀', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Ravichandran_Ashwin.jpg/400px-Ravichandran_Ashwin.jpg' },
    { id: 14, name: 'Suryakumar Yadav', icon: '☄️', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Suryakumar_Yadav.jpg/400px-Suryakumar_Yadav.jpg' },
    { id: 15, name: 'Mohammed Siraj', icon: '🎯', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Mohammed_Siraj.jpg/400px-Mohammed_Siraj.jpg' },
    { id: 16, name: 'Shikhar Dhawan', icon: '💫', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Shikhar_Dhawan.jpg/400px-Shikhar_Dhawan.jpg' },
    { id: 17, name: 'Axar Patel', icon: '🎪', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Axar_Patel.jpg/400px-Axar_Patel.jpg' },
    { id: 18, name: 'Kuldeep Yadav', icon: '🎭', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kuldeep_Yadav.jpg/400px-Kuldeep_Yadav.jpg' },
    { id: 19, name: 'Bhuvneshwar Kumar', icon: '🌊', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Bhuvneshwar_Kumar.jpg/400px-Bhuvneshwar_Kumar.jpg' },
    { id: 20, name: 'Dinesh Karthik', icon: '🎨', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Dinesh_Karthik.jpg/400px-Dinesh_Karthik.jpg' },
    { id: 21, name: 'Rahul Dravid', icon: '🧱', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Rahul_Dravid.jpg/400px-Rahul_Dravid.jpg' },
    { id: 22, name: 'Sourav Ganguly', icon: '👑', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Sourav_Ganguly.jpg/400px-Sourav_Ganguly.jpg' },
    { id: 23, name: 'VVS Laxman', icon: '🎯', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/VVS_Laxman.jpg/400px-VVS_Laxman.jpg' },
    { id: 24, name: 'Anil Kumble', icon: '🌀', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Anil_Kumble.jpg/400px-Anil_Kumble.jpg' },
    { id: 25, name: 'Kapil Dev', icon: '🏆', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Kapil_Dev.jpg/400px-Kapil_Dev.jpg' },
    { id: 26, name: 'Sunil Gavaskar', icon: '☀️', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Sunil_Gavaskar.jpg/400px-Sunil_Gavaskar.jpg' },
    { id: 27, name: 'Zaheer Khan', icon: '⚡', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Zaheer_Khan.jpg/400px-Zaheer_Khan.jpg' },
    { id: 28, name: 'Harbhajan Singh', icon: '🌀', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Harbhajan_Singh.jpg/400px-Harbhajan_Singh.jpg' },
    { id: 29, name: 'Virender Sehwag', icon: '💣', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Virender_Sehwag.jpg/400px-Virender_Sehwag.jpg' },
    { id: 30, name: 'Gautam Gambhir', icon: '🗡️', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Gautam_Gambhir.jpg/400px-Gautam_Gambhir.jpg' },
    { id: 31, name: 'Ishant Sharma', icon: '🗼', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Ishant_Sharma.jpg/400px-Ishant_Sharma.jpg' },
    { id: 32, name: 'Cheteshwar Pujara', icon: '🛡️', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Cheteshwar_Pujara.jpg/400px-Cheteshwar_Pujara.jpg' },
    { id: 33, name: 'Ajinkya Rahane', icon: '🎓', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ajinkya_Rahane.jpg/400px-Ajinkya_Rahane.jpg' },
    { id: 34, name: 'Umesh Yadav', icon: '🚂', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Umesh_Yadav.jpg/400px-Umesh_Yadav.jpg' },
    { id: 35, name: 'Wriddhiman Saha', icon: '🧤', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Wriddhiman_Saha.jpg/400px-Wriddhiman_Saha.jpg' },
    { id: 36, name: 'Shardul Thakur', icon: '🦁', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Shardul_Thakur.jpg/400px-Shardul_Thakur.jpg' },
    { id: 37, name: 'Washington Sundar', icon: '🔱', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Washington_Sundar.jpg/400px-Washington_Sundar.jpg' },
    { id: 38, name: 'Prasidh Krishna', icon: '🎯', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Prasidh_Krishna.jpg/400px-Prasidh_Krishna.jpg' },
    { id: 39, name: 'Deepak Chahar', icon: '🌪️', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Deepak_Chahar.jpg/400px-Deepak_Chahar.jpg' },
    { id: 40, name: 'Yuzvendra Chahal', icon: '♟️', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Yuzvendra_Chahal.jpg/400px-Yuzvendra_Chahal.jpg' },
    { id: 41, name: 'Ruturaj Gaikwad', icon: '⚡', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ruturaj_Gaikwad.jpg/400px-Ruturaj_Gaikwad.jpg' },
    { id: 42, name: 'Ishan Kishan', icon: '💥', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ishan_Kishan.jpg/400px-Ishan_Kishan.jpg' },
    { id: 43, name: 'Sanju Samson', icon: '🌊', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sanju_Samson.jpg/400px-Sanju_Samson.jpg' },
    { id: 44, name: 'Shreyas Iyer', icon: '🎭', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Shreyas_Iyer.jpg/400px-Shreyas_Iyer.jpg' },
    { id: 45, name: 'Arshdeep Singh', icon: '🏹', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Arshdeep_Singh.jpg/400px-Arshdeep_Singh.jpg' },
    { id: 46, name: 'Ravi Bishnoi', icon: '🕸️', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ravi_Bishnoi.jpg/400px-Ravi_Bishnoi.jpg' },
    { id: 47, name: 'Tilak Varma', icon: '🌟', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tilak_Varma.jpg/400px-Tilak_Varma.jpg' },
    { id: 48, name: 'Mukesh Kumar', icon: '🎯', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mukesh_Kumar.jpg/400px-Mukesh_Kumar.jpg' },
    { id: 49, name: 'Rinku Singh', icon: '💫', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Rinku_Singh.jpg/400px-Rinku_Singh.jpg' },
    { id: 50, name: 'Vaibhav Suryavanshi', icon: '🌟', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Vaibhav_Suryavanshi_2024.jpg/400px-Vaibhav_Suryavanshi_2024.jpg' },
  ];
    const FOREIGN_PLAYERS = [
    { id: 51, name: 'AB de Villiers', icon: '🦸', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/AB_de_Villiers.jpg/400px-AB_de_Villiers.jpg' },
    { id: 52, name: 'Chris Gayle', icon: '💀', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Chris_Gayle.jpg/400px-Chris_Gayle.jpg' },
    { id: 53, name: 'Steve Smith', icon: '🎩', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Steve_Smith.jpg/400px-Steve_Smith.jpg' },
    { id: 54, name: 'Kane Williamson', icon: '😇', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kane_Williamson.jpg/400px-Kane_Williamson.jpg' },
    { id: 55, name: 'Pat Cummins', icon: '🏹', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Pat_Cummins.jpg/400px-Pat_Cummins.jpg' },
    { id: 56, name: 'Ben Stokes', icon: '💪', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ben_Stokes.jpg/400px-Ben_Stokes.jpg' },
    { id: 57, name: 'Jos Buttler', icon: '⚡', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Jos_Buttler.jpg/400px-Jos_Buttler.jpg' },
    { id: 58, name: 'Rashid Khan', icon: '🕷️', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Rashid_Khan.jpg/400px-Rashid_Khan.jpg' },
    { id: 59, name: 'Babar Azam', icon: '👑', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Babar_Azam.jpg/400px-Babar_Azam.jpg' },
    { id: 60, name: 'Shaheen Afridi', icon: '🦅', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Shaheen_Afridi.jpg/400px-Shaheen_Afridi.jpg' },
    { id: 61, name: 'David Warner', icon: '💣', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/David_Warner.jpg/400px-David_Warner.jpg' },
    { id: 62, name: 'Mitchell Starc', icon: '🚀', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mitchell_Starc.jpg/400px-Mitchell_Starc.jpg' },
    { id: 63, name: 'Glenn Maxwell', icon: '🎪', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Glenn_Maxwell.jpg/400px-Glenn_Maxwell.jpg' },
    { id: 64, name: 'Joe Root', icon: '🎓', role: 'Batter', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Joe_Root.jpg/400px-Joe_Root.jpg' },
    { id: 65, name: 'Jofra Archer', icon: '🎯', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Jofra_Archer.jpg/400px-Jofra_Archer.jpg' },
    { id: 66, name: 'Quinton de Kock', icon: '🧤', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Quinton_de_Kock.jpg/400px-Quinton_de_Kock.jpg' },
    { id: 67, name: 'Kagiso Rabada', icon: '💨', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kagiso_Rabada.jpg/400px-Kagiso_Rabada.jpg' },
    { id: 68, name: 'Trent Boult', icon: '🌪️', role: 'Bowler', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Trent_Boult.jpg/400px-Trent_Boult.jpg' },
    { id: 69, name: 'Jonny Bairstow', icon: '⚡', role: 'Keeper', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Jonny_Bairstow.jpg/400px-Jonny_Bairstow.jpg' },
    { id: 70, name: 'Andre Russell', icon: '💥', role: 'AR', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Andre_Russell.jpg/400px-Andre_Russell.jpg' },
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
    const totalRef = ref(db, 'totalVotes');
    onValue(totalRef, (snap) => setTotalVotes(snap.val() || 0));
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => alert("Login failed: " + error.message));
  };

  const handleLogout = () => signOut(auth);

  const handleVote = async (playerId) => {
    const battleKey = `battle_${battleNumber}_${gameMode}`;
    if (userVotes[battleKey]) {
      alert('Ee battle lo already vote chesav!');
      return;
    }

    setVoteAnimation(playerId);
    setTimeout(() => setVoteAnimation(''), 600);
    setUserVotes({...userVotes, [battleKey]: playerId });

    const updatedBattle = {...currentBattle };
    if (playerId === currentBattle.player1.id) {
      updatedBattle.player1.votes += 1;
    } else {
      updatedBattle.player2.votes += 1;
    }

    const totalVotes = updatedBattle.player1.votes + updatedBattle.player2.votes;
    const winner = updatedBattle.player1.votes > updatedBattle.player2.votes? updatedBattle.player1 : updatedBattle.player2;
    const winnerPercent = totalVotes > 0? Math.round((winner.votes / totalVotes) * 100) : 100;

    setTimeout(() => {
      setChampionData({ name: winner.name, icon: winner.icon, percent: winnerPercent });
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

  const handleShare = () => {
    const text = `Battle #${battleNumber}: ${currentBattle.player1.name} vs ${currentBattle.player2.name} - Who do you pick? 🤔\n\nVote on Cricket Clash: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'Cricket Clash', text: text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied! Share with friends');
    }
  };

  const handleNextBattle = () => {
    setShowChampion(false);
    setBattleNumber(battleNumber + 1);
  };

  const getTopChamp = () => {
    const sorted = Object.entries(playerVotes).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return 'None';
    const topId = parseInt(sorted[0][0]);
    const allPlayers = [...INDIAN_PLAYERS,...FOREIGN_PLAYERS];
    const player = allPlayers.find(p => p.id === topId);
    return player? player.name.split(' ').pop() : 'None';
  };
    if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
      <div className="header">
        <h1><span className="logo-zap">⚡</span> Cricket <span className="clash-text">Clash</span></h1>
        {user? (
          <button onClick={handleLogout} className="sign-in-btn">Logout</button>
        ) : (
          <button onClick={handleLogin} className="sign-in-btn">Sign In</button>
        )}
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{totalVotes}</div>
          <div className="stat-label">TOTAL VOTES</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{battleNumber}</div>
          <div className="stat-label">BATTLES</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{getTopChamp()}</div>
          <div className="stat-label">TOP CHAMP</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">0</div>
          <div className="stat-label">🔥 STREAK</div>
        </div>
      </div>

      <div className="mode-selector">
        <button className={gameMode === 'india'? 'active' : ''} onClick={() => setGameMode('india')}>
          🇮🇳 INDIA MODE (50)
        </button>
        <button className={gameMode === 'global'? 'active' : ''} onClick={() => setGameMode('global')}>
          🌍 GLOBAL MODE (70)
        </button>
      </div>

      <div className="filter-tabs">
        {['Any', 'Batter', 'Bowler', 'AR', 'Keeper'].map(f => (
          <button key={f} className={filter === f? 'active' : ''} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="battle-section">
        <div className="battle-title">WHO WINS THIS CLASH?</div>
        <div className="battle-number-main">Battle {battleNumber}</div>

        <div className="battle-cards-side">
          <div className={`player-card-side left ${voteAnimation === currentBattle.player1.id? 'vote-jump' : ''}`} onClick={() => handleVote(currentBattle.player1.id)}>
            <div className="player-photo-side">
              <img src={currentBattle.player1.photo} alt={currentBattle.player1.name} onError={(e) => {e.target.src = 'https://via.placeholder.com/400x500/0f172a/00ff88?text=' + currentBattle.player1.name.charAt(0)}} />
              <div className="player-icon-badge-side">{currentBattle.player1.icon}</div>
            </div>
            <div className="player-info-side">
              <div className="player-role-tag">{currentBattle.player1.role.toUpperCase()}</div>
              <div className="player-name-side">{currentBattle.player1.name}</div>
              <div className="player-votes-side">{currentBattle.player1.votes} votes</div>
            </div>
          </div>

          <div className="vs-center">VS</div>

          <div className={`player-card-side right ${voteAnimation === currentBattle.player2.id? 'vote-jump' : ''}`} onClick={() => handleVote(currentBattle.player2.id)}>
            <div className="player-photo-side">
              <img src={currentBattle.player2.photo} alt={currentBattle.player2.name} onError={(e) => {e.target.src = 'https://via.placeholder.com/400x500/0f172a/00ff88?text=' + currentBattle.player2.name.charAt(0)}} />
              <div className="player-icon-badge-side">{currentBattle.player2.icon}</div>
            </div>
            <div className="player-info-side">
              <div className="player-role-tag">{currentBattle.player2.role.toUpperCase()}</div>
              <div className="player-name-side">{currentBattle.player2.name}</div>
              <div className="player-votes-side">{currentBattle.player2.votes} votes</div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="skip-btn" onClick={handleSkip}>Skip →</button>
          <button className="share-btn" onClick={handleShare}>Share a friend: who do they pick?</button>
        </div>
      </div>

      {showChampion && (
        <div className="modal-overlay" onClick={() => setShowChampion(false)}>
          <div className="champion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crown">👑</div>
            <div className="champion-label">YOUR CHAMPION</div>
            <div className="champion-name">{championData.name}</div>
            <div className="champion-icon">{championData.icon}</div>
            <div className="champion-percent">{championData.percent}% of fans chose {championData.name.split(' ')[0]}</div>
            <button className="next-battle-btn" onClick={handleNextBattle}>⚡ Next Battle</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
