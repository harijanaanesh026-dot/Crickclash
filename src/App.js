import { useState, useEffect } from 'react';
import { db, auth, signInWithGoogle } from './firebase';
import { ref, get, set, update, push, increment } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const DAILY_VOTE_LIMIT = 1;

const initialPlayers = [
  // BATTERS
  { name: 'Virat Kohli', role: 'BATTER', votes: 0 }, { name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
  { name: 'Shubman Gill', role: 'BATTER', votes: 0 }, { name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 },
  // BOWLERS
  { name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 }, { name: 'Mohammed Shami', role: 'BOWLER', votes: 0 },
  { name: 'Shardul Thakur', role: 'BOWLER', votes: 0 }, { name: 'Mohammed Siraj', role: 'BOWLER', votes: 0 },
  // ALL-ROUNDERS
  { name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0 },
  // KEEPERS
  { name: 'MS Dhoni', role: 'KEEPER', votes: 0 }, { name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
  // CAPTAINS
  { name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0 }, { name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 },
]; // nee full 70 list ikkada pettu
function CrickClash() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([]);
  const [votesToday, setVotesToday] = useState(0);
  const [votedIds, setVotedIds] = useState([]);
  const [tab, setTab] = useState('Battle');
  const [filter, setFilter] = useState('Any');
  const [loading, setLoading] = useState(true);

  const totalVotes = players.reduce((sum, p) => sum + (p.votes || 0), 0);
  const topChamp = [...players].sort((a,b) => (b.votes||0) - (a.votes||0))[0]?.name.split(' ')[0] || 'Virat';

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if(user) setIsLoggedIn(true);
      else setIsLoggedIn(false);
    });
    
    const savedVotes = localStorage.getItem('votesToday');
    const savedIds = localStorage.getItem('votedIds');
    if(savedVotes) setVotesToday(parseInt(savedVotes));
    if(savedIds) setVotedIds(JSON.parse(savedIds));
  }, []);

  useEffect(() => { if(isLoggedIn) fetchPlayers(); }, [isLoggedIn]);
  useEffect(() => { if(players.length > 0) generateBattle(); }, [players, votedIds, filter]);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  }
    const fetchPlayers = async () => {
    const playersRef = ref(db, 'players');
    const snapshot = await get(playersRef);
    if(!snapshot.exists()){
      // First time - add all players
      initialPlayers.forEach(async (p) => {
        await push(playersRef, p);
      });
      setPlayers(initialPlayers);
      setLoading(false);
      return;
    }
    const data = snapshot.val();
    const playerList = Object.keys(data).map(key => ({ id: key,...data[key] }));
    setPlayers(playerList);
    setLoading(false);
  };

  const generateBattle = () => {
    let available = players.filter(p =>!votedIds.includes(p.name));
    if(filter!== 'Any') available = available.filter(p => p.role === filter);
    if(available.length < 2) { setBattle([]); return; }
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    setBattle([shuffled[0], shuffled[1]]);
  };

  const handleVote = async (playerId) => {
    if(votesToday >= DAILY_VOTE_LIMIT) return;
    const playerRef = ref(db, `players/${playerId}`);
    await update(playerRef, { votes: (players.find(p=>p.id===playerId)?.votes || 0) + 1 });
    
    const newVotes = votesToday + 1;
    const playerName = players.find(p=>p.id===playerId)?.name;
    const newVotedIds = [...votedIds, playerName];
    
    setVotesToday(newVotes);
    setVotedIds(newVotedIds);
    localStorage.setItem('votesToday', newVotes);
    localStorage.setItem('votedIds', JSON.stringify(newVotedIds));
    setTimeout(() => generateBattle(), 500);
  };
    // LOGIN PAGE - EXACT SCREENSHOT
  if(!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-2">⚡</div>
        <h1 className="text-4xl font-bold mb-2">
          Crick<span className="text-orange-500">Clash</span>
        </h1>
        <p className="text-gray-400 mb-10">ANESH Innovation</p>

        <button
          onClick={handleGoogleLogin}
          className="bg-white text-black font-semibold py-3 px-8 rounded-full flex items-center gap-3 text-base w-full max-w-sm justify-center shadow-lg"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          Sign In with Google
        </button>

        <footer className="text-center text-gray-500 text-sm py-6 mt-auto">
          © 2026 CrickClash A Production By ANESH
        </footer>
      </div>
    )
      }
    // LOGGED IN PAGE
  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Crick<span className="text-orange-500">Clash</span></h1>
            <p className="text-gray-400 text-xs">ANESH Innovation</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#a8ff00] flex items-center justify-center text-black font-bold text-lg">T</div>
        </div>

        <div className="bg-[#1a1d29] p-4 rounded-xl mb-3">
          <p className="text-gray-400 text-sm mb-2">Your Badges</p>
          {votesToday > 0 && <span className="bg-[#a8ff00] text-black font-bold px-4 py-1.5 rounded-full text-sm">🏏 First Vote</span>}
        </div>

        <div className="bg-[#1a1d29] p-4 rounded-xl text-center mb-4">
          <p className="text-gray-400 text-sm">Today's Votes Left</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday} / {DAILY_VOTE_LIMIT}</p>
        </div>

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold flex items-center gap-1 ${tab==='Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold flex items-center gap-1 ${tab==='Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
        </div>

        {tab === 'Battle' &&!loading && battle.length === 2 && (
          <div>
            <div className="flex justify-around text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-500">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL VOTES</p></div>
              <div><p className="text-2xl font-bold text-orange-500">{topChamp}</p><p className="text-xs text-gray-400">TOP CHAMP</p></div>
              <div><p className="text-2xl font-bold text-orange-500">🔥1</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>

            <p className="text-center text-gray-400 text-sm">WHO DO YOU LIKE?</p>
            <h2 className="text-4xl font-bold text-center mb-4">Battle <span className="text-[#a8ff00]">1</span></h2>

            <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
              {['Any','BATTER','BOWLER','ALL-ROUNDER','KEEPER','CAPTAIN'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap text-sm ${filter===f? 'bg-[#a8ff00] text-black' : 'bg-[#1a1d29]'}`}>{f}</button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-b from-[#1e3a8a] to-[#1a1d29] p-4 rounded-2xl text-center w-[45%]">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">{battle[0].role}</span>
                <h3 className="text-lg font-bold mt-2">{battle[0].name}</h3>
                <p className="text-[#a8ff00] font-bold text-sm">{battle[0].votes || 0} votes</p>
                <button onClick={() => handleVote(battle[0].id)} disabled={votesToday >= DAILY_VOTE_LIMIT} className="w-full py-2 rounded-xl font-bold mt-2 bg-[#2a2d39] disabled:text-gray-500">
                  {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT REACHED' : 'VOTE'}
                </button>
              </div>
              <span className="text-2xl font-bold text-orange-500">VS</span>
              <div className="bg-gradient-to-b from-[#581c87] to-[#1a1d29] p-4 rounded-2xl text-center w-[45%]">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{battle[1].role}</span>
                <h3 className="text-lg font-bold mt-2">{battle[1].name}</h3>
                <p className="text-[#a8ff00] font-bold text-sm">{battle[1].votes || 0} votes</p>
                <button onClick={() => handleVote(battle[1].id)} disabled={votesToday >= DAILY_VOTE_LIMIT} className="w-full py-2 rounded-xl font-bold mt-2 bg-[#2a2d39] disabled:text-gray-500">
                  {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT REACHED' : 'VOTE'}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={generateBattle} className="bg-[#1a1d29] w-1/2 py-3 rounded-xl font-bold">Skip →</button>
              <button onClick={() => navigator.share({ title: 'CrickClash', text: `${battle[0]?.name} vs ${battle[1]?.name}`, url: window.location.href })} className="bg-[#1a1d29] w-1/2 py-3 rounded-xl font-bold">Share 📤</button>
            </div>
          </div>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-center text-[#a8ff00] mb-4">🏆 Top 10 Players</h2>
            {[...players].sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
              <div key={p.id} className="bg-[#1a1d29] p-3 rounded-lg mb-2 flex justify-between">
                <span>{i+1}. {p.name}</span>
                <span className="text-[#a8ff00]">{p.votes || 0} votes</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CrickClash;
