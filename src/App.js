import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, push, get } from 'firebase/database';

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
const DAILY_VOTE_LIMIT = 1;

const ALL_PLAYERS = [
  // BATTER
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/352400/352496.6.jpg' },
  { id: "suryakumar-yadav", name: 'Suryakumar Yadav', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313105.6.jpg' },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313118.6.jpg' },

  // BOWLER
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313114.6.jpg' },
  { id: "bhuvneshwar-kumar", name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313115.6.jpg' },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313116.6.jpg' },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/333400/333469.6.jpg' },

  // ALL-ROUNDER
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg' },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313126.6.jpg' },
  { id: "ravichandran-ashwin", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313127.6.jpg' },

  // KEEPER
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313131.6.jpg' },
  { id: "sanju-samson", name: 'Sanju Samson', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313134.6.jpg' },

  // CAPTAIN
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
  { id: "rahul-dravid-cap", name: 'Rahul Dravid', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313118.6.jpg' },
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
  const [following, setFollowing] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showDebate, setShowDebate] = useState(false);
  const [debates, setDebates] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [reason, setReason] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const generateBattle = useCallback((playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    let attempts = 0;
    while(p1.id === p2.id && attempts < 20) {
      p2 = filtered[Math.floor(Math.random() * filtered.length)];
      attempts++;
    }
    setBattle([p1, p2]);
    setSelectedPlayer("");
    setReason("");
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const today = new Date().toISOString().split('T')[0];
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === today){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); update(userRef, {votesToday: 0, lastVoteDate: today}); }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
            setFollowing(userData.following || []);
          } else { set(userRef, {votesToday: 0, lastVoteDate: today, streak: 0, badges:[], history:[], following: []}); }
        });
      }
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 10) {
        const playersArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setPlayers(playersArray);
        const sorted = [...playersArray].sort((a,b) => (b.votes||0) - (a.votes||0));
        setTopPlayer(sorted[0]);
        setTotalVotes(sorted.reduce((sum, p) => sum + (p.votes||0), 0));
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(playersRef, initialPlayers);
      }
    });

    const debatesRef = ref(db, 'debates');
    onValue(debatesRef, (snapshot) => { if(snapshot.val()){ setDebates(Object.values(snapshot.val()).reverse()); } });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle]);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout avvadaaniki sure na?")) { await signOut(auth); setShowProfile(false); } };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };
  const handleShare = () => {
    const text = `Who's Your Favourite? ${battle[0]?.name} vs ${battle[1]?.name} Vote on CrickClash!`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'CrickClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Link Copied!"); }
  };

  const updateStreak = async () => {
    if(!user) return {newStreak: 0, newBadges: []};
    const userRef = ref(db, `users/${user.uid}`);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const snap = await get(userRef);
    const data = snap.val() || {};
    let newStreak = 1;
    if(data.lastVoteDate === yesterday) newStreak = (data.streak || 0) + 1;
    let newBadges = [...(data.badges || [])];
    if([3,7,30].includes(newStreak) &&!newBadges.includes(`${newStreak} Day Streak`)){ newBadges.push(`${newStreak} Day Streak`); }
    return {newStreak, newBadges};
  };
  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Google login required to vote"); await signInWithPopup(auth, googleProvider); return; }
    if(votesToday >= DAILY_VOTE_LIMIT) return alert(`Roju ${DAILY_VOTE_LIMIT} vote maatrame!`);
    const votedPlayer = players.find(p => p.id === votedPlayerId);
    if(!votedPlayer) return;

    const {newStreak, newBadges} = await updateStreak();
    const today = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);

    const finalBadges = [...newBadges];
    if(votesToday === 0 &&!finalBadges.includes('First Vote')) finalBadges.push('First Vote');

    const historyEntry = {battleNo, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);

    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today, streak: newStreak, badges: finalBadges, history: newHistory });
    const playerSnap = await get(playerRef);
    await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });

    setVotesToday(votesToday + 1); setBadges(finalBadges); setStreak(newStreak);
    setBattleNo(battleNo + 1); setTimeout(() => generateBattle(players, filter), 500);
  };

  const submitDebate = async () => {
    if(!user){ alert("Login required"); handleGoogleLogin(); return; }
    if(!selectedPlayer || reason.trim().length < 3) { alert("Select a player and write a reason"); return; }
    const debateRef = push(ref(db, 'debates'));
    await set(debateRef, {
      id: debateRef.key, battleId: `battle-${battleNo}`, battlePlayers: `${battle[0]?.name} vs ${battle[1]?.name}`,
      player: selectedPlayer, playerName: players.find(p=>p.id===selectedPlayer)?.name, reason: reason,
      user: user.displayName || "Anonymous", userId: user.uid, userPhoto: user.photoURL,
      likes: 0, likedBy:[], comments:[], timestamp: Date.now()
    });
    setShowDebate(false); setReason(""); setSelectedPlayer("");
  };

  const submitComment = async (debateId) => {
    if(!user){ handleGoogleLogin(); return; }
    if(replyText.trim().length < 2) return;
    const debateRef = ref(db, `debates/${debateId}`);
    const snap = await get(debateRef); const debate = snap.val();
    const newComment = { id: Date.now(), user: user.displayName, userPhoto: user.photoURL, text: replyText, timestamp: Date.now() };
    await update(debateRef, { comments: [...(debate.comments || []), newComment] });
    setReplyText(""); setReplyingTo(null);
  };

  const likeDebate = async (debateId) => {
    if(!user){ handleGoogleLogin(); return; }
    const debateRef = ref(db, `debates/${debateId}`);
    const snap = await get(debateRef); const debate = snap.val();
    const likedBy = debate.likedBy || [];
    if(likedBy.includes(user.uid)) return;
    await update(debateRef, { likes: (debate.likes || 0) + 1, likedBy: [...likedBy, user.uid] });
  };

  const handleFollow = async (targetUserId) => {
    if(!user || targetUserId === user.uid) return;
    const userRef = ref(db, `users/${user.uid}`);
    const isFollowing = following.includes(targetUserId);
    const newFollowing = isFollowing? following.filter(id => id!== targetUserId) : [...following, targetUserId];
    await update(userRef, {following: newFollowing});
  };
  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
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
                <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName}</p><p className="text-gray-400 text-xs truncate">{user.email}</p></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Logout</button>
              </div>
            )}
          </div>
        </header>
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
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
          <button onClick={() => setTab('Following')} className={`pb-2 font-bold ${tab === 'Following'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>👥 Following</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>
            <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
            </div>

            {battle[0] && battle[1]? (
              <div>
                <div className="flex items-center justify-center gap-2">
                  {[battle[0], battle[1]].map(p => (
                    <div key={p.id} className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                      <img src={p.image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" alt={p.name}/>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.role==='KEEPER'?'bg-red-900':p.role==='CAPTAIN'?'bg-blue-900':p.role==='BATTER'?'bg-red-800':'bg-blue-800'}`}>{p.role}</span>
                      <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                      <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                      <button onClick={() => handleVote(p.id)} disabled={user && votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${!user? 'bg-blue-500' : votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
                        {!user? 'VOTE' : votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => user? setShowDebate(true) : handleGoogleLogin()} className="flex-1 bg-orange-500 text-black font-bold py-3 rounded-xl">{user? '🔥 Debate' : '🔒 Login to Debate'}</button>
                  <button onClick={handleShare} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">📤 Share</button>
                </div>
                <button onClick={handleSkip} className="bg-[#23232b] w-full py-3 rounded-xl font-bold mt-3">⏭️ Skip Battle</button>

                <div className="mt-6 space-y-3">
                  <h3 className="font-bold text-lg">🔥 Recent Debates</h3>
                  {debates.slice(0,5).map(d => (
                    <div key={d.id} className="bg-[#13131a] p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><img src={d.userPhoto} className="w-8 h-8 rounded-full" /><p className="font-bold text-sm">{d.user}</p></div>
                        {user && d.userId!== user.uid && (<button onClick={()=>handleFollow(d.userId)} className={`text-xs px-3 py-1 rounded-full ${following.includes(d.userId)?'bg-gray-700':'bg-[#a8ff00] text-black'}`}>{following.includes(d.userId)?'Following':'Follow'}</button>)}
                      </div>
                      <p className="text-sm"><span className="text-[#a8ff00]">{d.playerName}:</span> {d.reason}</p>
                      <div className="flex gap-4 mt-2"><button onClick={()=>likeDebate(d.id)} className="text-sm">👍 {d.likes || 0}</button><button onClick={()=>setReplyingTo(d.id)} className="text-sm">💬 Reply</button></div>
                      {replyingTo === d.id && (<div className="mt-2 flex gap-2"><input value={replyText} onChange={e=>setReplyText(e.target.value)} className="flex-1 bg-black p-2 rounded text-sm" placeholder="Reply..." /><button onClick={()=>submitComment(d.id)} className="bg-[#a8ff00] text-black px-3 rounded">Send</button></div>)}
                      {d.comments?.map((c,i) => <p key={i} className="text-xs text-gray-400 mt-1">↳ {c.user}: {c.text}</p>)}
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-center">Loading Players...</p>}
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {Object.values(players.reduce((acc, player) => { if (acc[player.name]) { acc[player.name].votes += player.votes || 0; } else { acc[player.name] = {...player }; } return acc; }, {})).sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => {
                const percentage = totalVotes > 0? ((p.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                return (
                  <div key={p.name} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3">
                    <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                    <img src={p.image} className="w-12 h-12 rounded-full object-cover" alt={p.name}/>
                    <div className="flex-1"><div className="flex justify-between"><span className="font-bold">{p.name}</span><span className="text-[#a8ff00] font-bold text-sm">{percentage}%</span></div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>{p.votes||0} votes</span><span>{p.role}</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-[#a8ff00] h-2 rounded-full" style={{width: `${percentage}%`}}></div></div></div>
                  </div>
                )
              })}
          </div>
        )}

        {tab === 'History' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">📜 Your Battle History</h2>
            {battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (<div key={i} className="bg-[#13131a] p-3 rounded-xl"><p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p><p className="font-bold">{h.players[0]} vs {h.players[1]}</p><p className="text-sm text-[#a8ff00]">You voted: {h.votedFor}</p></div>))}
          </div>
        )}

        {tab === 'Following' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">👥 Following Debates</h2>
            {debates.filter(d => following.includes(d.userId)).length === 0? <p className="text-gray-500 text-center">Follow users to see their debates</p> : debates.filter(d => following.includes(d.userId)).map(d => (<div key={d.id} className="bg-[#13131a] p-3 rounded-xl"><p className="font-bold text-sm">{d.user}</p><p className="text-sm"><span className="text-[#a8ff00]">{d.playerName}:</span> {d.reason}</p></div>))}
          </div>
        )}
      </div>

      {/* DEBATE POPUP */}
      {showDebate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13131a] p-6 rounded-2xl w-full max-w-md border-[#333] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-white">Battle {battleNo} Debate 🔥</h3>
            {!user? (
              <div className="text-center"><p className="mb-4 text-gray-400">Debate cheyadaniki login avvali</p><button onClick={handleGoogleLogin} className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg">LOGIN WITH GOOGLE</button><button onClick={()=>setShowDebate(false)} className="w-full mt-2 bg-[#23232b] py-2 rounded-xl font-bold">Cancel</button></div>
            ) : (
              <>
                <div className="bg-[#0a0a0f] p-3 rounded-xl mb-4">
                  <p className="text-sm text-gray-400 mb-2">I support:</p>
                  <div className="flex gap-2 mb-2">
                    <button onClick={()=>setSelectedPlayer(battle[0]?.id)} className={`flex-1 p-2 rounded-lg text-sm font-bold ${selectedPlayer===battle[0]?.id? "bg-[#a8ff00] text-black" : "bg-[#23232b]"}`}>{battle[0]?.name}</button>
                    <button onClick={()=>setSelectedPlayer(battle[1]?.id)} className={`flex-1 p-2 rounded-lg text-sm font-bold ${selectedPlayer===battle[1]?.id? "bg-[#a8ff00] text-black" : "bg-[#23232b]"}`}>{battle[1]?.name}</button>
                  </div>
<textarea placeholder="Write your reason..." value={reason} onChange={(e)=>setReason(e.target.value)} className="w-full h-20 bg-[#13131a] text-white p-2 rounded-lg border border-[#333] text-sm"/>
                  <button onClick={submitDebate} className="w-full mt-2 bg-[#a8ff00] text-black font-bold py-2 rounded-lg">Post Debate</button>
                </div>
                <p className="text-sm text-gray-400 mb-2">Community Debates:</p>
                {debates.filter(d => d.battleId === `battle-${battleNo}`).length === 0 && <p className="text-center text-gray-500 text-sm">Inka debates levu. Nuvve first cheyi 🔥</p>}
                {debates.filter(d => d.battleId === `battle-${battleNo}`).map((d) => (
                  <div key={d.id} className="bg-[#0a0a0f] p-3 rounded-xl mb-3 border border-[#23232b]">
                    <div className="flex justify-between items-start mb-1"><div className="flex items-center gap-2"><img src={d.userPhoto} className="w-6 h-6 rounded-full" /><b className="text-[#a8ff00] text-sm">{d.user}</b></div><div className="flex gap-2 items-center"><span className="bg-orange-900 text-orange-300 px-2 py-0.5 rounded text-xs">{d.playerName}</span>{user && d.userId!== user.uid && (<button onClick={()=>handleFollow(d.userId)} className={`text-xs px-2 py-0.5 rounded-full ${following.includes(d.userId)?'bg-gray-700':'bg-[#a8ff00] text-black'}`}>{following.includes(d.userId)?'Following':'Follow'}</button>)}</div></div>
                    <p className="text-sm mt-1">{d.reason}</p>
                    <div className="flex gap-4 mt-2"><button onClick={() => likeDebate(d.id)} className="text-xs text-gray-400 hover:text-[#a8ff00]">👍 {d.likes || 0}</button><button onClick={() => setReplyingTo(d.id)} className="text-xs text-gray-400 hover:text-[#a8ff00]">💬 Reply</button></div>
                    <div className="ml-3 mt-2 border-l-2 border-[#333] pl-2">
                      {(d.comments || []).map(c => (<div key={c.id} className="flex items-center gap-1 text-xs mb-1"><img src={c.userPhoto} className="w-4 h-4 rounded-full" /><b className="text-[#a8ff00]">{c.user}:</b><span className="text-gray-300">{c.text}</span></div>))}
                      {replyingTo === d.id && (<div className="flex gap-1 mt-2"><input value={replyText} onChange={(e)=>setReplyText(e.target.value)} placeholder="Write reply..." className="flex-1 bg-[#13131a] text-xs p-1 rounded border border-[#333] focus:outline-none focus:border-[#a8ff00]"/><button onClick={()=>submitComment(d.id)} className="bg-[#a8ff00] text-black px-3 rounded text-xs font-bold">Send</button></div>)}
                    </div>
                  </div>
                ))}
                <button onClick={()=>setShowDebate(false)} className="w-full mt-3 bg-[#23232b] py-2 rounded-xl font-bold">Close</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-[#a8ff00] font-bold">CrickClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
        <p className="text-xs mt-1">Made with ❤️ for Cricket Fans</p>
      </footer>
    </div>
  );
                  }
