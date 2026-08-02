import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, increment } from 'firebase/database';
import { Zap, Flame, Trophy, Users, Crown } from 'lucide-react';

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
const googleProvider = new GoogleAuthProvider();

const DAILY_VOTE_LIMIT = 6;
const CRICKET_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, color: '#1e40af' },
  { id: "sachin-tendulkar", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, color: '#dc2626' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, color: '#059669' },
  { id: "ms-dhoni-bat", name: 'MS Dhoni', role: 'BATTER', votes: 0, color: '#f59e0b' },
];
const FOOTBALL_PLAYERS = [
  { id: "messi", name: 'Lionel Messi', role: 'FORWARD', votes: 0, color: '#1e40af' },
  { id: "ronaldo", name: 'Cristiano Ronaldo', role: 'FORWARD', votes: 0, color: '#dc2626' },
];
const MOVIES_PLAYERS = [
  { id: "prabhas", name: 'Prabhas', role: 'HERO', votes: 0, color: '#7c3aed' },
  { id: "jr-ntr", name: 'Jr NTR', role: 'HERO', votes: 0, color: '#dc2626' },
];
const ALL_DATA = { Cricket: CRICKET_PLAYERS, Football: FOOTBALL_PLAYERS, Movies: MOVIES_PLAYERS };

const getToday = () => new Date().toISOString().split('T')[0];

export default function ArenaBattle() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Cricket');
  const [players, setPlayers] = useState(CRICKET_PLAYERS);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [votesToday, setVotesToday] = useState({Cricket: 0, Football: 0, Movies: 0});
  const [totalVotes, setTotalVotes] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [combo, setCombo] = useState(0);
  const [liveVoters, setLiveVoters] = useState(12453);
    const generateBattle = useCallback((playerList) => {
    if(playerList.length < 2) return;
    let p1 = playerList[Math.floor(Math.random() * playerList.length)];
    let p2 = playerList[Math.floor(Math.random() * playerList.length)];
    let attempts = 0;
    while(p1.id === p2.id && attempts < 20) { p2 = playerList[Math.floor(Math.random() * playerList.length)]; attempts++; }
    setBattle([p1, p2]);
  }, []);

  const handleVote = async (votedPlayerId) => {
    if(!user){ await signInWithPopup(auth, googleProvider); return; }
    if(votesToday[category] >= DAILY_VOTE_LIMIT || isVoting) return;

    setIsVoting(true);
    const newCombo = combo + 1;
    setCombo(newCombo);

    const votedPlayer = ALL_DATA[category].find(p => p.id === votedPlayerId);
    const votePower = newCombo >= 3? 3 : 1; // Triple vote combo

    await update(ref(db, `players/${category}/${votedPlayerId}`), { votes: increment(votePower) });
    await update(ref(db, `meta/${category}`), { totalVotes: increment(votePower) });
    await update(ref(db, `users/${user.uid}/${category}`), { votesToday: increment(1) });

    setTimeout(() => {
      setIsVoting(false);
      setBattleNo(prev => prev + 1);
      generateBattle(players);
      if(newCombo >= 5) setCombo(0); // reset after 5
    }, 800);
  };

  const handleSkip = () => {
    setCombo(0);
    setBattleNo(prev => prev + 1);
    generateBattle(players);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setLoading(false);
      if(currentUser) {
        setUser(currentUser);
        get(ref(db, `users/${currentUser.uid}/${category}`)).then(snap => {
          setVotesToday(prev => ({...prev, [category]: snap.val()?.votesToday || 0}))
        })
      } else { setUser(null); }
    });
    return () => unsub();
  }, [category]);

  useEffect(() => {
    const playersUnsub = onValue(ref(db, `players/${category}`), (snapshot) => {
      const data = snapshot.val();
      const currentPlayers = ALL_DATA[category];
      if (data) {
        setPlayers(currentPlayers.map(p => ({...p, votes: data[p.id]?.votes || 0 })));
        const total = Object.values(data).reduce((sum, p) => sum + (p.votes || 0), 0);
        setTotalVotes(total);
      } else {
        const initialPlayers = {};
        currentPlayers.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(ref(db, `players/${category}`), initialPlayers);
      }
    });
    if(!battle[0]) generateBattle(ALL_DATA[category]);
    return () => playersUnsub();
  }, [category, generateBattle]);

    if(loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading Arena...</div>;

  const p1Percent = totalVotes > 0? ((battle[0]?.votes || 0) / totalVotes * 100).toFixed(1) : 50;
  const p2Percent = totalVotes > 0? ((battle[1]?.votes || 0) / totalVotes * 100).toFixed(1) : 50;

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <style>{`
        @keyframes glow { 0%,100%{box-shadow:0 0 20px currentColor} 50%{box-shadow:0 0 40px currentColor} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
       .glow { animation: glow 2s infinite; }
       .float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* TOP BAR */}
      <div className="w-full max-w-2xl mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Flame className="text-orange-500" />
          <span className="font-bold">{combo}x COMBO</span>
        </div>
        <div className="flex items-center gap-2 bg-[#121212] px-3 py-1 rounded-full">
          <Users size={16} className="text-green-400"/>
          <span className="text-sm">{liveVoters.toLocaleString()} Live</span>
        </div>
        {user? <img src={user.photoURL} className="w-9 h-9 rounded-full"/> : <button onClick={() => signInWithPopup(auth, googleProvider)} className="bg-blue-600 px-3 py-1 rounded-lg text-sm">Login</button>}
      </div>

      {/* CATEGORY SELECTOR */}
      <div className="w-full max-w-2xl mx-auto flex justify-center gap-3 mb-4">
        {Object.keys(ALL_DATA).map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl font-bold ${category === cat? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-[#121212]'}`}>
            {cat === 'Cricket' && '🏏'}{cat === 'Football' && '⚽'}{cat === 'Movies' && '🎬'} {cat}
          </button>
        ))}
      </div>

      {/* BATTLE NO */}
      <h2 className="text-center text-2xl font-bold mb-2">BATTLE <span className="text-purple-400">#{battleNo}</span></h2>
      <p className="text-center text-gray-400 text-sm mb-6">Votes Left: {DAILY_VOTE_LIMIT - votesToday[category]}/6</p>

      {/* ARENA */}
      {battle[0] && battle[1] && (
        <div className="w-full max-w-2xl mx-auto relative">

          {/* VS IN MIDDLE */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-2xl font-bold glow">VS</div>
          </div>

          <div className="flex gap-4 px-4">
            {/* PLAYER 1 */}
            <div className="w-1/2">
              <div className="bg-[#121212] p-4 rounded-3xl border-2" style={{borderColor: battle[0].color}}>
                <div className="w-24 h-24 rounded-full mx-auto mb-3 float" style={{backgroundColor: battle[0].color}}>
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold">{battle[0].name[0]}</div>
                </div>
                <h3 className="text-xl font-bold text-center">{battle[0].name}</h3>
                <p className="text-center text-xs text-gray-400 mb-3">{battle[0].role}</p>

                {/* HEALTH BAR */}
                <div className="w-full bg-black rounded-full h-3 mb-2">
                  <div className="h-3 rounded-full transition-all duration-500" style={{width: `${p1Percent}%`, backgroundColor: battle[0].color}}></div>
                </div>
                <p className="text-center text-sm font-bold mb-4" style={{color: battle[0].color}}>{p1Percent}% • {battle[0].votes} votes</p>

                <button onClick={() => handleVote(battle[0].id)} disabled={isVoting} className="w-full py-4 rounded-2xl font-bold text-lg glow" style={{backgroundColor: battle[0].color}}>
                  {isVoting? 'VOTING...' : 'VOTE'}
                </button>
              </div>
            </div>

            {/* PLAYER 2 */}
            <div className="w-1/2">
              <div className="bg-[#121212] p-4 rounded-3xl border-2" style={{borderColor: battle[1].color}}>
                <div className="w-24 h-24 rounded-full mx-auto mb-3 float" style={{backgroundColor: battle[1].color, animationDelay: '0.5s'}}>
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold">{battle[1].name[0]}</div>
                </div>
                <h3 className="text-xl font-bold text-center">{battle[1].name}</h3>
                <p className="text-center text-xs text-gray-400 mb-3">{battle[1].role}</p>

                {/* HEALTH BAR */}
                <div className="w-full bg-black rounded-full h-3 mb-2">
                  <div className="h-3 rounded-full transition-all duration-500" style={{width: `${p2Percent}%`, backgroundColor: battle[1].color}}></div>
                </div>
                <p className="text-center text-sm font-bold mb-4" style={{color: battle[1].color}}>{p2Percent}% • {battle[1].votes} votes</p>

                <button onClick={() => handleVote(battle[1].id)} disabled={isVoting} className="w-full py-4 rounded-2xl font-bold text-lg glow" style={{backgroundColor: battle[1].color}}>
                  {isVoting? 'VOTING...' : 'VOTE'}
                </button>
              </div>
            </div>
          </div>
          {/* SKIP BUTTON */}
          <div className="text-center mt-6">
            <button onClick={handleSkip} className="bg-[#121212] px-6 py-3 rounded-xl font-bold">⏭️ SKIP BATTLE</button>
          </div>

          {/* LEADERBOARD */}
          <div className="bg-[#121212] p-4 rounded-3xl mt-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Crown className="text-yellow-400" /> Top Players</h3>
            {players.sort((a,b) => b.votes - a.votes).slice(0,5).map((p,i) => (
              <div key={p.id} className="flex items-center gap-3 mb-2">
                <span className="font-bold text-yellow-400">#{i+1}</span>
                <div className="w-8 h-8 rounded-full" style={{backgroundColor: p.color}}></div>
                <span className="flex-1">{p.name}</span>
                <span className="font-bold">{p.votes}</span>
              </div>
            ))}
          </div>

          {/* COMBO ALERT */}
          {combo >= 3 && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 rounded-full font-bold text-lg glow">
              🔥 {combo}x COMBO! Triple Vote Active!
            </div>
          )}
        </div>
      )}
    </div>
  );
                }
