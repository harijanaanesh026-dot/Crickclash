import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment, push } from 'firebase/database';
import html2canvas from 'html2canvas';

// ============= FIREBASE CONFIG =============
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
const WEEKLY_VOTE_LIMIT = 3; // Week ki 3 votes
const REFERRAL_BONUS_VOTE = 1;

// ============= 3 CATEGORIES DATA =============
const CRICKET_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0 },
  { id: "sachin-tendulkar", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
  { id: "ms-dhoni-bat", name: 'MS Dhoni', role: 'BATTER', votes: 0 },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0 },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 },
];

const FOOTBALL_PLAYERS = [
  { id: "messi", name: 'Lionel Messi', role: 'FORWARD', votes: 0 },
  { id: "ronaldo", name: 'Cristiano Ronaldo', role: 'FORWARD', votes: 0 },
  { id: "mbappe", name: 'Kylian Mbappe', role: 'FORWARD', votes: 0 },
  { id: "haaland", name: 'Erling Haaland', role: 'FORWARD', votes: 0 },
  { id: "neymar", name: 'Neymar Jr', role: 'FORWARD', votes: 0 },
  { id: "modric", name: 'Luka Modric', role: 'MIDFIELDER', votes: 0 },
  { id: "de-bruyne", name: 'Kevin De Bruyne', role: 'MIDFIELDER', votes: 0 },
  { id: "ramos", name: 'Sergio Ramos', role: 'DEFENDER', votes: 0 },
  { id: "courtois", name: 'Thibaut Courtois', role: 'GOALKEEPER', votes: 0 },
];

const MOVIES_PLAYERS = [
  { id: "prabhas", name: 'Prabhas', role: 'HERO', votes: 0 },
  { id: "jr-ntr", name: 'Jr NTR', role: 'HERO', votes: 0 },
  { id: "allu-arjun", name: 'Allu Arjun', role: 'HERO', votes: 0 },
  { id: "ram-charan", name: 'Ram Charan', role: 'HERO', votes: 0 },
  { id: "pawan-kalyan", name: 'Pawan Kalyan', role: 'HERO', votes: 0 },
  { id: "mahesh-babu", name: 'Mahesh Babu', role: 'HERO', votes: 0 },
  { id: "vijay", name: 'Thalapathy Vijay', role: 'HERO', votes: 0 },
  { id: "srk", name: 'Shah Rukh Khan', role: 'HERO', votes: 0 },
  { id: "prakash-raj", name: 'Prakash Raj', role: 'VILLAIN', votes: 0 },
  { id: "sonu-sood", name: 'Sonu Sood', role: 'VILLAIN', votes: 0 },
];

const ALL_DATA = { Cricket: CRICKET_PLAYERS, Football: FOOTBALL_PLAYERS, Movies: MOVIES_PLAYERS };
export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Cricket');
  const [players, setPlayers] = useState(CRICKET_PLAYERS);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [streak, setStreak] = useState(0);
  const [votesThisWeek, setVotesThisWeek] = useState({Cricket: 0, Football: 0, Movies: 0});
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [voteAnim, setVoteAnim] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [weeklyWinner, setWeeklyWinner] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [showResultCard, setShowResultCard] = useState(false);
  const [tournament, setTournament] = useState(null);

  const getToday = () => new Date().toISOString().split('T')[0];
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  }
  const getWeekNumber = () => {
    const d = new Date();
    d.setHours(0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    return d.getFullYear() + '-W' + String(Math.ceil(((d - new Date(d.getFullYear(),0,1))/86400000 + 1)/7)).padStart(2,'0');
  };

  // WEEKLY TIMER
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextMonday = new Date();
      const day = now.getDay();
      const daysUntilMonday = day === 0? 1 : 8 - day;
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      const diff = nextMonday - now;
      const d = Math.floor(diff / 1000 / 60 / 60 / 24);
      const h = Math.floor(diff / 1000 / 60 / 60) % 24;
      const m = Math.floor(diff / 1000 / 60) % 60;
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const days = ['Cricket', 'Football', 'Movies'];
    const todayIndex = new Date().getDay() % 3;
    setCategory(days[todayIndex]);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`battleNo_${category}`);
    if(saved) setBattleNo(Number(saved));
    const battleNoRef = ref(db, `meta/${category}/battleNo`);
    onValue(battleNoRef, (snap) => { if(snap.exists()) setBattleNo(snap.val()); });
  }, [category]);

  useEffect(() => {
    localStorage.setItem(`battleNo_${category}`, battleNo);
    update(ref(db, `meta/${category}`), { battleNo });
  }, [battleNo, category]);

  // WEEKLY RESET FUNCTION
  const checkAndResetWeekly = useCallback(async () => {
    const weekStart = getWeekStart();
    const metaRef = ref(db, `meta/${category}`);
    const snap = await get(metaRef);
    const metaData = snap.val();
    if (!metaData || metaData.lastResetWeek!== weekStart) {
      const resetPlayers = {};
      ALL_DATA[category].forEach(p => { resetPlayers[p.id] = {...p, votes: 0}; });
      await set(ref(db, `players/${category}`), resetPlayers);
      await set(metaRef, { lastResetWeek: weekStart, totalVotes: 0, battleNo: 1 });
    }
  }, [category]);

  const checkWeeklyWinner = useCallback(async (playerList) => {
    const week = getWeekNumber();
    const winnerRef = ref(db, `winners/${category}/${week}`);
    const sorted = [...playerList].sort((a,b) => b.votes - a.votes);
    if(sorted[0]) {
      await set(winnerRef, { name: sorted[0].name, votes: sorted[0].votes, role: sorted[0].role });
      setWeeklyWinner({ name: sorted[0].name, votes: sorted[0].votes });
    }
  }, [category]);

  const loadWeeklyWinner = useCallback(async () => {
    const week = getWeekNumber();
    const snap = await get(ref(db, `winners/${category}/${week}`));
    setWeeklyWinner(snap.exists()? snap.val() : null);
  }, [category]);

  useEffect(() => { loadWeeklyWinner(); }, [category, loadWeeklyWinner]);
  const handleDeleteHistory = async () => {
    if(!user) return alert("Login required");
    if(window.confirm("Are you sure?")){ await remove(ref(db, `users/${user.uid}/${category}/history`)); setBattleHistory([]); }
  };

  const generateBattle = useCallback((playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    let attempts = 0;
    while(p1.id === p2.id && attempts < 20) { p2 = filtered[Math.floor(Math.random() * filtered.length)]; attempts++; }
    setBattle([p1, p2]);
  }, []);

  const getBattleKey = () => battle[0] && battle[1]? `${category}-${battle[0].id}-${battle[1].id}-B${battleNo}` : null;

  const handlePostComment = async () => {
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    if(!newComment.trim() ||!battle[0] ||!battle[1]) return;
    const time = Date.now();
    const battleKey = getBattleKey();
    await set(ref(db, `comments/${battleKey}/${time}`), { text: newComment, user: user.displayName, photo: user.photoURL, time: time, likes: {}, replies: {} });
    setNewComment("");
  };

  const handleLikeComment = async (commentKey) => {
    if(!user) return alert("Login required");
    const battleKey = getBattleKey();
    const likeRef = ref(db, `comments/${battleKey}/${commentKey}/likes/${user.uid}`);
    const snap = await get(likeRef);
    if(snap.exists()){ await remove(likeRef); } else { await set(likeRef, true); }
  };

  const handlePostReply = async (commentKey) => {
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    if(!newReply.trim()) return;
    const time = Date.now();
    const battleKey = getBattleKey();
    await set(ref(db, `comments/${battleKey}/${commentKey}/replies/${time}`), { text: newReply, user: user.displayName, photo: user.photoURL, time: time, likes: {} });
    setNewReply(""); setReplyTo(null);
  };

  const handleLikeReply = async (commentKey, replyKey) => {
    if(!user) return alert("Login required");
    const battleKey = getBattleKey();
    const likeRef = ref(db, `comments/${battleKey}/${commentKey}/replies/${replyKey}/likes/${user.uid}`);
    const snap = await get(likeRef);
    if(snap.exists()){ await remove(likeRef); } else { await set(likeRef, true); }
  };

  useEffect(() => {
    if(!battle[0] ||!battle[1]) return;
    const battleKey = getBattleKey();
    const unsubscribe = onValue(ref(db, `comments/${battleKey}`), (snap) => {
      const data = snap.val();
      if(data) {
        const arr = Object.entries(data).map(([key, val]) => ({key,...val, replies: val.replies || {}}));
        setComments(arr.sort((a,b) => b.time - a.time));
      } else setComments([]);
    });
    return () => unsubscribe();
  }, [battle, battleNo, category]);

  const updateStreak = async () => {
    if(!user) return {newStreak: 0, newBadges: []};
    const userRef = ref(db, `users/${user.uid}/${category}`);
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const snap = await get(userRef);
    const data = snap.val() || {};
    let newStreak = 1;
    if(data.lastVoteDate === yesterday) newStreak = (data.streak || 0) + 1;
    let newBadges = [...(data.badges || [])];
    if([3,7,30].includes(newStreak) &&!newBadges.includes(`${newStreak} Day Streak`)){ newBadges.push(`${newStreak} Day Streak`); }
    if(votesThisWeek[category] === 0 &&!newBadges.includes(`First ${category} Vote`)) newBadges.push(`First ${category} Vote`);
    if(!newBadges.includes(`${category} Fan`)) newBadges.push(`${category} Fan`);
    return {newStreak, newBadges};
  };

  const handleSkip = async () => {
    const newBattleNo = battleNo + 1;
    setBattleNo(newBattleNo);
    await update(ref(db, `meta/${category}`), { battleNo: newBattleNo });
    generateBattle(players, filter);
  };

  const handleShareResult = () => {
    const text = `Who's your pick ${battle[0]?.name} vs ${battle[1]?.name} on FanClash ${category}! ⚔️`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'FanClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Copied!"); }
  };

  const downloadResultCard = async () => {
    const element = document.getElementById('result-card');
    if(!element) return alert("Card dorakaledu");
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#0a0a0f', scale: 2 });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `FanClash-${category}-Battle${battleNo-1}.png`;
      link.href = image; link.click();
    } catch { alert("Screenshot fail. Manual ga tey bro"); }
  };

  const handleRefer = async () => {
    if(!user) return alert("Login required");
    const refLink = `${window.location.origin}?ref=${user.uid}`;
    navigator.clipboard.writeText(`FanClash lo vote chey! ${refLink}`);
    alert("Referral link copied! Extra vote vastundi 🔥");
    await update(ref(db, `users/${user.uid}/${category}`), { votesThisWeek: increment(-REFERRAL_BONUS_VOTE) });
    setVotesThisWeek(prev => ({...prev, [category]: Math.max(0, prev[category] - 1)}));
  };

  const startTournament = () => {
    const shuffled = [...players].sort(() => 0.5 - Math.random()).slice(0, 8);
    if(shuffled.length < 8) return alert("8 players ledu");
    setTournament({ round: 1, matches: [[shuffled[0], shuffled[1]], [shuffled[2], shuffled[3]], [shuffled[4], shuffled[5]], [shuffled[6], shuffled[7]]], winner: null });
  };

  // WEEKLY VOTE LOGIC
  const handleVote = async (votedPlayerId) => {
    const weekStart = getWeekStart();
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    if(votesThisWeek[category] >= WEEKLY_VOTE_LIMIT || isVoting) return alert(`Ee week ${WEEKLY_VOTE_LIMIT} votes maatrame!`);
    setIsVoting(true); setVoteAnim(votedPlayerId); setTimeout(() => setVoteAnim(null), 500);
    const {newStreak, newBadges} = await updateStreak();
    const today = getToday();
    const votedPlayer = ALL_DATA[category].find(p => p.id === votedPlayerId);
    const historyEntry = {battleNo, category, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);
    const newBattleNo = battleNo + 1;

    await update(ref(db, `users/${user.uid}/${category}`), {
      votesThisWeek: increment(1),
      lastVoteWeek: weekStart,
      lastVoteDate: today,
      streak: newStreak,
      badges: newBadges,
      history: newHistory
    });
    await update(ref(db, `players/${category}/${votedPlayerId}`), { votes: increment(1) });
    await update(ref(db, `meta/${category}`), { totalVotes: increment(1), battleNo: newBattleNo });

    setTimeout(() => { setIsVoting(false); setBattleNo(newBattleNo); generateBattle(players, filter); }, 1000);
  };

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout?")) { await signOut(auth); setShowProfile(false); } };

  useEffect(() => {
    checkAndResetWeekly();
    onValue(ref(db, `meta/${category}`), (snapshot) => {
      const metaData = snapshot.val();
      if (metaData) { setBattleNo(metaData.battleNo || 1); setTotalVotes(metaData.totalVotes || 0); }
    });
    onValue(ref(db, `players/${category}`), (snapshot) => {
      const data = snapshot.val();
      const currentPlayers = ALL_DATA[category];
      if (data) {
        const playersArray = currentPlayers.map(p => ({...p, votes: data[p.id]?.votes || 0 }));
        setPlayers(playersArray);
        generateBattle(playersArray, filter);
        const sorted = [...playersArray].sort((a,b) => b.votes - a.votes);
        setTopPlayer(sorted[0]);
        checkWeeklyWinner(sorted);
      } else {
        const initialPlayers = {};
        currentPlayers.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(ref(db, `players/${category}`), initialPlayers);
        set(ref(db, `meta/${category}`), { lastResetWeek: getWeekStart(), totalVotes: 0, battleNo: 1 });
      }
    });
    onAuthStateChanged(auth, (currentUser) => {
      const weekStart = getWeekStart();
      setUser(currentUser); setLoading(false);
      if(currentUser) {
        onValue(ref(db, `users/${currentUser.uid}/${category}`), (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            setVotesThisWeek(prev => ({...prev, [category]: userData.lastVoteWeek === weekStart? userData.votesThisWeek || 0 : 0}));
            setStreak(userData.streak || 0); setBadges(userData.badges || []); setBattleHistory(userData.history || []);
          }
        });
      } else { setVotesThisWeek({Cricket: 0, Football: 0, Movies: 0}); setStreak(0); setBadges([]); setBattleHistory([]); }
    });
  }, [category, checkAndResetWeekly, checkWeeklyWinner, filter, generateBattle, loadWeeklyWinner]);
  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} } @keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(-10px)} 100%{transform:translateY(0)} }.vote-pop { animation: pop 0.5s ease; }.float { animation: float 2s ease-in-out infinite; }`}</style>

      {selectedPlayer && (
        <div onClick={() => setSelectedPlayer(null)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm">
            <div className="w-24 h-24 rounded-full mx-auto border-4 border-[#a8ff00] bg-[#a8ff00] text-black flex items-center justify-center text-4xl font-bold">{selectedPlayer.name[0]}</div>
            <h2 className="text-2xl font-bold text-center mt-3">{selectedPlayer.name}</h2>
            <p className="text-center text-[#a8ff00]">{selectedPlayer.role}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between"><span>Total Votes</span><span className="font-bold">{selectedPlayer.votes}</span></div>
              <div className="flex justify-between"><span>Win Rate</span><span className="font-bold">{totalVotes > 0? ((selectedPlayer.votes/totalVotes)*100).toFixed(1) : 0}%</span></div>
            </div>
            <button onClick={() => setSelectedPlayer(null)} className="w-full bg-[#a8ff00] text-black mt-4 py-2 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}

      {showResultCard && battle[0] && battle[1] && (
        <div onClick={() => setShowResultCard(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} id="result-card" className="bg-gradient-to-br from-[#1e3a5f] to-[#0a0a0f] p-6 rounded-3xl w-full max-w-sm border-2 border-[#a8ff00]">
            <h2 className="text-center text-2xl font-bold mb-1">FanClash {category}</h2>
            <p className="text-center text-gray-400 text-sm mb-4">Battle #{battleNo-1} Result</p>
            <div className="flex gap-3 items-center mb-4">
              {[battle[0], battle[1]].map(p => {
                const total = (battle[0]?.votes || 0) + (battle[1]?.votes || 0);
                const percent = total > 0? ((p.votes / total) * 100).toFixed(0) : 50;
                return (
                  <div key={p.id} className="flex-1 text-center p-3 rounded-2xl bg-[#13131a]">
                    <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-2xl font-bold">{p.name[0]}</div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-2xl font-bold text-[#a8ff00]">{percent}%</p>
                  </div>
                )
              })}
            </div>
            <button onClick={downloadResultCard} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-bold">📸 Download Image</button>
            <button onClick={() => setShowResultCard(false)} className="w-full bg-[#23232b] py-2 rounded-xl font-bold mt-2">Close</button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto w-full p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">FanClash</h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="relative">
            {user?
              <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer hover:scale-110 transition" alt="user" />
              :
              <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-full font-bold text-sm">Login</button>
            }
            {showProfile && user && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName}</p><p className="text-gray-400 text-xs truncate">{user.email}</p></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Logout</button>
              </div>
            )}
          </div>
        </header>

        <div className="flex justify-center gap-2 mb-4 bg-[#13131a] p-1 rounded-2xl">
          {Object.keys(ALL_DATA).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${category === cat? 'bg-[#a8ff00] text-black' : 'text-gray-400 hover:bg-[#222]'}`}>
              {cat === 'Cricket' && '🏏 '}{cat === 'Football' && '⚽ '}{cat === 'Movies' && '🎬 '}{cat}
            </button>
          ))}
        </div>

        {!user && <div className="bg-[#a8ff00]/10 border-[#a8ff00] p-3 rounded-2xl mb-3 text-center text-sm">Login to get 3 votes per week</div>}

        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-2xl mb-3 text-center">
          <p className="text-sm font-bold">🔥 Weekly Fan Battle</p>
          <p className="text-lg font-bold">
            {category === 'Cricket' && 'Best Cricketer of All Time?'}
            {category === 'Football' && 'GOAT Football Debate'}
            {category === 'Movies' && 'King of Indian Cinema?'}
          </p>
          <p className="text-xs">Reset in: {timeLeft}</p>
        </div>

        {weeklyWinner && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-2xl mb-3 text-center">
            <p className="text-sm font-bold text-black">👑 {category} WEEKLY CHAMPION</p>
            <p className="text-lg font-bold text-black">{weeklyWinner.name} - {weeklyWinner.votes} Votes</p>
          </div>
        )}

        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm mb-2">This Week's Votes Left</p>
          <div className="grid grid-cols-3 gap-2">
            <div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesThisWeek.Cricket >= 3? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{WEEKLY_VOTE_LIMIT - votesThisWeek.Cricket}</p><p className="text-xs">🏏 Cricket</p></div>
            <div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesThisWeek.Football >= 3? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{WEEKLY_VOTE_LIMIT - votesThisWeek.Football}</p><p className="text-xs">⚽ Football</p></div>
            <div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesThisWeek.Movies >= 3? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{WEEKLY_VOTE_LIMIT - votesThisWeek.Movies}</p><p className="text-xs">🎬 Movies</p></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Reset in: {timeLeft}</p>
        </div>

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold transition ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold transition ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold transition ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {tab === 'Battle' && battle[0] && battle[1] && (
          <div>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{user? streak : 0}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {category === 'Cricket' && ['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => {setFilter(role); generateBattle(players, role)}} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
              {category === 'Football' && ['Any', 'FORWARD', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER'].map(role => (
                <button key={role} onClick={() => {setFilter(role); generateBattle(players, role)}} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
              {category === 'Movies' && ['Any', 'HERO', 'VILLAIN'].map(role => (
                <button key={role} onClick={() => {setFilter(role); generateBattle(players, role)}} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
            </div>

            <div className="flex gap-4 mb-4">
              {[battle[0], battle[1]].map(p => (
                <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`flex-1 bg-[#13131a] p-4 rounded-2xl text-center cursor-pointer ${voteAnim === p.id? 'vote-pop' : ''}`}>
                  <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-3xl font-bold">{p.name[0]}</div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800">{p.role}</span>
                  <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                  <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                  <button onClick={(e) => {e.stopPropagation(); handleVote(p.id)}} disabled={isVoting || votesThisWeek[category] >= WEEKLY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesThisWeek[category] >= WEEKLY_VOTE_LIMIT? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>
                    {isVoting? 'VOTING...' : votesThisWeek[category] >= WEEKLY_VOTE_LIMIT? 'VOTED THIS WEEK' : 'VOTE'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleSkip} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">⏭️ Skip</button>
              <button onClick={() => setShowResultCard(true)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-bold">📸 Result</button>
            </div>

            {/* DEBATE ZONE */}
            <div className="bg-[#13131a] p-4 rounded-2xl mt-4">
              <h3 className="font-bold mb-3">💬 Debate Zone</h3>
              <div className="flex gap-2 mb-3">
                <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Who will win?" className="w-full bg-[#0a0a0f] p-2 rounded-lg outline-none" />
                <button onClick={handlePostComment} className="bg-[#a8ff00] text-black px-4 rounded-lg font-bold">Post</button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet. Be first!</p>}
                {comments.map((c) => {
                  const likeCount = c.likes? Object.keys(c.likes).length : 0;
                  return (
                    <div key={c.key} className="bg-[#0a0a0f] p-3 rounded-lg">
                      <div className="flex gap-2">
                        <img src={c.photo} className="w-8 h-8 rounded-full" alt="user" />
                        <div className="flex-1">
                          <p className="font-bold text-xs">{c.user}</p>
                          <p className="text-sm">{c.text}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            <button onClick={() => handleLikeComment(c.key)}>🤍 {likeCount}</button>
                            <button onClick={() => setReplyTo(c.key)}>↩️ Reply</button>
                          </div>
                        </div>
                      </div>

                      {c.replies && Object.entries(c.replies).length > 0 && (
                        <div className="ml-6 mt-2 space-y-2 border-l-2 border-[#23232b] pl-3">
                          {Object.entries(c.replies).map(([rk, r]) => (
                            <div key={rk} className="flex gap-2">
                              <img src={r.photo} className="w-6 h-6 rounded-full" alt="user" />
                              <div className="flex-1">
                                <p className="font-bold text-xs">{r.user}</p>
                                <p className="text-sm">{r.text}</p>
                                <button onClick={() => handleLikeReply(c.key, rk)} className="text-xs text-gray-400 mt-1">🤍 {r.likes? Object.keys(r.likes).length : 0}</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyTo === c.key && (
                        <div className="flex gap-2 mt-2 ml-6">
                          <input value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Write reply..." className="w-full bg-[#13131a] p-2 rounded-lg outline-none text-sm" />
                          <button onClick={() => handlePostReply(c.key)} className="bg-[#a8ff00] text-black px-3 rounded-lg font-bold text-sm">Send</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleShareResult} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">📤 Share</button>
              <button onClick={handleRefer} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 py-3 rounded-xl font-bold">👥 Refer</button>
            </div>
            <button onClick={startTournament} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 py-3 rounded-xl font-bold mt-3">🏆 Tournament</button>
          </div>
        )}

        {/* RANKINGS TAB */}
        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 {category} Players</h2>
            {players.sort((a,b) => b.votes - a.votes).slice(0,10).map((p,i) => {
                const percentage = totalVotes > 0? ((p.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                return (
                  <div key={p.id} onClick={() => setSelectedPlayer(p)} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3 cursor-pointer">
                    <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                    <div className="w-12 h-12 rounded-full bg-[#a8ff00] text-black flex items-center justify-center text-lg font-bold">{p.name[0]}</div>
                    <div className="flex-1">
                      <div className="flex justify-between"><span className="font-bold">{p.name}</span><span className="text-[#a8ff00] font-bold text-sm">{percentage}%</span></div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{p.votes||0} votes</span><span>{p.role}</span></div>
                      <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-[#a8ff00] h-2 rounded-full" style={{width: `${percentage}%`}}></div></div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'History' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#a8ff00]">📜 Your {category} Battle History</h2>
              {user && battleHistory.length > 0 && <button onClick={handleDeleteHistory} className="bg-red-600 px-3 py-1 rounded-lg text-sm font-bold">🗑️ Clear</button>}
            </div>
            {!user? <p className="text-gray-500 text-center">Login required</p> : battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (
              <div key={i} className="bg-[#13131a] p-3 rounded-xl">
                <p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p>
                <p className="font-bold">{h.players[0]} vs {h.players[1]}</p>
                <p className="text-sm text-[#a8ff00]">You voted: {h.votedFor}</p>
              </div>
            ))}
          </div>
        )}
      </div>
{tournament && (
        <div onClick={() => setTournament(null)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-4">🏆 Round {tournament.round}</h2>
            <div className="space-y-2">
              {tournament.matches.map((match, i) => (
                <div key={i} className="bg-[#0a0a0f] p-3 rounded-xl flex justify-between items-center">
                  <span>{match[0].name}</span> <span className="text-[#a8ff00]">VS</span> <span>{match[1].name}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setTournament(null)} className="w-full bg-[#23232b] py-2 rounded-xl mt-3 font-bold">Close</button>
          </div>
        </div>
      )}

      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-white font-bold">FanClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
      </footer>
    </div>
  );
                                      }
