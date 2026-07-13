export default function BattleCard({ battle, onVote, onSkip, onShare, user, votesToday, DAILY_VOTE_LIMIT }) {
  const [player1, player2] = battle;

  if (!player1 ||!player2) return <p className="text-center py-10">Loading Players...</p>;

  return (
    <div>
      <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p>
      <h2 className="text-center text-4xl font-bold mb-4">Battle</h2>

      <div className="flex items-center justify-center gap-3">
        {[player1, player2].map(p => (
          <div key={p.id} className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center border border-[#23232b]">
            <img src={p.image} className="w-24 h-24 rounded-full mx-auto mb-2 object-cover border-4 border-[#a8ff00]" alt={p.name}/>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.role==='KEEPER'?'bg-red-900':p.role==='CAPTAIN'?'bg-blue-900':p.role==='BATTER'?'bg-red-800':p.role==='BOWLER'?'bg-blue-800':'bg-purple-800'}`}>{p.role}</span>
            <h3 className="text-xl font-bold mt-3">{p.name}</h3>
            <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
            <button
              onClick={() => onVote(p.id)}
              disabled={user && votesToday >= DAILY_VOTE_LIMIT}
              className={`w-full py-3 rounded-xl font-bold mt-3 ${!user? 'bg-blue-500' : votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black hover:opacity-90'}`}>
              {!user? 'LOGIN TO VOTE' : votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={onShare} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold hover:bg-[#2e2e38]">📤 Share</button>
      </div>
      <button onClick={onSkip} className="bg-[#23232b] w-full py-3 rounded-xl font-bold mt-3 hover:bg-[#2e2e38]">⏭️ Skip Battle</button>
    </div>
  );
                }
export default function UserStats({ user, badges, votesToday, DAILY_VOTE_LIMIT, tab, setTab, totalVotes, battleNo, topPlayer, streak, filter, setFilter }) {
  const roles = ['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'];

  return (
    <>
      {user && (
        <>
          <div className="bg-[#13131a] p-3 rounded-2xl mb-3">
            <p className="text-sm text-gray-400 mb-2">Your Badges</p>
            <div className="flex gap-2 flex-wrap">
              {badges.map(b => <span key={b} className="bg-[#a8ff00] text-black px-3 py-1 rounded-full text-sm font-bold">🏏 {b}</span>)}
              {badges.length === 0 && <span className="text-gray-500 text-sm">No badges yet</span>}
            </div>
          </div>
          <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
            <p className="text-gray-400 text-sm">Today's Votes Left</p>
            <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday} / {DAILY_VOTE_LIMIT}</p>
          </div>
        </>
      )}

      <div className="flex justify-around border-b border-gray-800 mb-4">
        {['Battle', 'Rankings', 'History'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-2 font-bold ${tab === t? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>
            {t === 'Battle' && '⚔️ '}{t === 'Rankings' && '🏆 '}{t === 'History' && '📜 '}{t}
          </button>
        ))}
      </div>

      {tab === 'Battle' && (
        <>
          <div className="grid grid-cols-4 text-center mb-6">
            <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL</p></div>
            <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
            <div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP</p></div>
            <div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {roles.map(role => (
              <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
            ))}
          </div>
        </>
      )}
    </>
  );
                                                                  }
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get } from 'firebase/database';
import BattleCard from './BattleCard';
import UserStats from './UserStats';

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
export const DAILY_VOTE_LIMIT = 1;

const ALL_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Virat_Kohli_after_his_century_at_Trent_Bridge_%28cropped%29.jpg' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313114.6.jpg' },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg' },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Virat_Kohli_after_his_century_at_Trent_Bridge_%28cropped%29.jpg' },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState(ALL_PLAYERS);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const generateBattle = useCallback((playerList, role) => {
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) { p2 = filtered[Math.floor(Math.random() * filtered.length)]; }
    setBattle([p1, p2]);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const today = new Date().toISOString().split('T')[0];
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === today){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); update(userRef, {votesToday: 0, lastVoteDate: today}); }
            setStreak(userData.streak || 0); setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
          } else { set(userRef, {votesToday: 0, lastVoteDate: today, streak: 0, badges:[], history:[]}); }
        });
      }
    });
    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setPlayers(playersArray);
        const sorted = [...playersArray].sort((a,b) => (b.votes||0) - (a.votes||0));
        setTopPlayer(sorted[0]);
        setTotalVotes(sorted.reduce((sum, p) => sum + (p.votes||0), 0));
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle]);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout avvadaaniki sure na?")) { await signOut(auth); setShowProfile(false); } };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert("Link Copied!"); };

  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Google login required to vote"); await signInWithPopup(auth, googleProvider); return; }
    if(votesToday >= DAILY_VOTE_LIMIT) return alert(`Roju ${DAILY_VOTE_LIMIT} vote maatrame!`);
    const votedPlayer = players.find(p => p.id === votedPlayerId);
    if(!votedPlayer) return;

    const today = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const historyEntry = {battleNo, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);

    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today, history: newHistory });
    const playerSnap = await get(playerRef);
    await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });

    setVotesToday(votesToday + 1);
    setBattleNo(battleNo + 1); setTimeout(() => generateBattle(players, filter), 500);
  };

  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="relative">
            {user? (
              <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" />
            ) : (
              <button onClick={handleGoogleLogin} className="bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold">Login</button>
            )}
            {user && showProfile && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] border-[#333] rounded-xl shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName}</p></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Logout</button>
              </div>
            )}
          </div>
        </header>

        <UserStats {...{user, badges, votesToday, DAILY_VOTE_LIMIT, tab, setTab, totalVotes, battleNo, topPlayer, streak, filter, setFilter}} />

        {tab === 'Battle' && (
          <BattleCard
            battle={battle} onVote={handleVote} onSkip={handleSkip} onShare={handleShare}
            user={user} votesToday={votesToday} DAILY_VOTE_LIMIT={DAILY_VOTE_LIMIT}
          />
        )}

        {tab === 'Rankings' && (
          <div><h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {players.sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
              <div key={p.id} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3">
                <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                <img src={p.image} className="w-12 h-12 rounded-full object-cover" alt={p.name}/>
                <div className="flex-1"><span className="font-bold">{p.name}</span><p className="text-xs text-gray-400">{p.votes||0} votes • {p.role}</p></div>
              </div>
            ))}
          </div>
        )}

        {tab === 'History' && (
          <div className="space-y-3"><h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">📜 Your Battle History</h2>
            {battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (<div key={i} className="bg-[#13131a] p-3 rounded-xl"><p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p><p className="font-bold">{h.players[0]} vs {h.players[1]}</p><p className="text-sm text-[#a8ff00]">You voted: {h.votedFor}</p></div>))}
          </div>
        )}
      </div>

      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-[#a8ff00] font-bold">CrickClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
      </footer>
    </div>
  );
  }
