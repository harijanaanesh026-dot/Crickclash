import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment } from 'firebase/database';

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
const DAILY_VOTE_LIMIT = 10;

const ALL_PLAYERS = [
  // BATTERS
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0 },
  { id: "sachin-tendulkar", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
  { id: "vaibhav-sooryavanshi", name: 'Vaibhav Sooryavanshi', role: 'BATTER', votes: 0 },
  { id: "rajat-patidar-bat", name: 'Rajat Patidar', role: 'BATTER', votes: 0 },
  { id: "abhishek-sharma", name: 'Abhishek Sharma', role: 'BATTER', votes: 0 },
  { id: "shreyas-iyer", name: 'Shreyas Iyer', role: 'BATTER', votes: 0 },
  { id: "kl-rahul-bat", name: 'KL Rahul', role: 'BATTER', votes: 0 },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0 },
  { id: "sai-sudarshan", name: 'Sai Sudarshan', role: 'BATTER', votes: 0 },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0 },
  { id: "virendra-sehwag", name: 'Virendra Sehwag', role: 'BATTER', votes: 0 },
  { id: "shikhar-dhawan", name: 'Shikhar Dhawan', role: 'BATTER', votes: 0 },
  { id: "suresh-raina", name: 'Suresh Raina', role: 'BATTER', votes: 0 },
  { id: "yashasvi-jaiswal", name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0 },
  { id: "ms-dhoni-bat", name: 'MS Dhoni', role: 'BATTER', votes: 0 },
  { id: "dinesh-karthik-bat", name: 'Dinesh Karthik', role: 'BATTER', votes: 0 },
  { id: "priyansh-arya", name: 'Priyansh Arya', role: 'BATTER', votes: 0 },
  { id: "tilak-varma", name: 'Tilak Varma', role: 'BATTER', votes: 0 },
  { id: "ishan-kishan-bat", name: 'Ishan Kishan', role: 'BATTER', votes: 0 },
  { id: "yuvraj-singh-bat", name: 'Yuvraj Singh', role: 'BATTER', votes: 0 },
  { id: "sanju-samson-bat", name: 'Sanju Samson', role: 'BATTER', votes: 0 },
  { id: "ruturaj-gaikwad-bat", name: 'Ruturaj Gaikwad', role: 'BATTER', votes: 0 },
  { id: "rishabh-pant-bat", name: 'Rishabh Pant', role: 'BATTER', votes: 0 },
  { id: "dhruv-jurel-bat", name: 'Dhruv Jurel', role: 'BATTER', votes: 0 },
  { id: "jitesh-sharma-bat", name: 'Jitesh Sharma', role: 'BATTER', votes: 0 },
  { id: "washington-sundar-bat", name: 'Washington Sundar', role: 'BATTER', votes: 0 },
  { id: "shivam-dube-bat", name: 'Shivam Dube', role: 'BATTER', votes: 0 },
  { id: "nitish-kumar-reddy-bat", name: 'Nitish Kumar Reddy', role: 'BATTER', votes: 0 },
  { id: "krunal-pandya-bat", name: 'Krunal Pandya', role: 'BATTER', votes: 0 },

  // BOWLERS
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 },
  { id: "bhuvaneswar-kumar", name: 'Bhuvaneswar Kumar', role: 'BOWLER', votes: 0 },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0 },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0 },
  { id: "prasidh-krishna", name: 'Prasidh Krishna', role: 'BOWLER', votes: 0 },
  { id: "harshit-rana", name: 'Harshit Rana', role: 'BOWLER', votes: 0 },
  { id: "ishant-sharma", name: 'Ishant Sharma', role: 'BOWLER', votes: 0 },
  { id: "umesh-yadav", name: 'Umesh Yadav', role: 'BOWLER', votes: 0 },
  { id: "axar-patel-bowl", name: 'Axar Patel', role: 'BOWLER', votes: 0 },
  { id: "yuzvendra-chahal", name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0 },
  { id: "deepak-chahar", name: 'Deepak Chahar', role: 'BOWLER', votes: 0 },
  { id: "arshdeep-singh", name: 'Arshdeep Singh', role: 'BOWLER', votes: 0 },
  { id: "ravindra-jadeja-bowl", name: 'Ravindra Jadeja', role: 'BOWLER', votes: 0 },
  { id: "anil-kumble", name: 'Anil Kumble', role: 'BOWLER', votes: 0 },
  { id: "kapil-dev-bowl", name: 'Kapil Dev', role: 'BOWLER', votes: 0 },
  { id: "harbhajan-singh", name: 'Harbhajan Singh', role: 'BOWLER', votes: 0 },
  { id: "ravichandran-ashwin-bowl", name: 'Ravichandran Ashwin', role: 'BOWLER', votes: 0 },
  { id: "kuldeep-yadav", name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0 },

  // ALL-ROUNDER
  { id: "kapil-dev-ar", name: 'Kapil Dev', role: 'ALL-ROUNDER', votes: 0 },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0 },
  { id: "yuvraj-singh-ar", name: 'Yuvraj Singh', role: 'ALL-ROUNDER', votes: 0 },
  { id: "ravichandran-ashwin-ar", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0 },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 },
  { id: "krunal-pandya-ar", name: 'Krunal Pandya', role: 'ALL-ROUNDER', votes: 0 },
  { id: "axar-patel-ar", name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0 },
  { id: "washington-sundar-ar", name: 'Washington Sundar', role: 'ALL-ROUNDER', votes: 0 },
  { id: "shivam-dube-ar", name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0 },
  { id: "nitish-kumar-reddy-ar", name: 'Nitish Kumar Reddy', role: 'ALL-ROUNDER', votes: 0 },
  { id: "shardul-thakur", name: 'Shardul Thakur', role: 'ALL-ROUNDER', votes: 0 },

  // KEEPER
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0 },
  { id: "jitesh-sharma-kp", name: 'Jitesh Sharma', role: 'KEEPER', votes: 0 },
  { id: "dhruv-jurel-kp", name: 'Dhruv Jurel', role: 'KEEPER', votes: 0 },
  { id: "sanju-samson-kp", name: 'Sanju Samson', role: 'KEEPER', votes: 0 },
  { id: "kl-rahul-kp", name: 'KL Rahul', role: 'KEEPER', votes: 0 },
  { id: "ishan-kishan-kp", name: 'Ishan Kishan', role: 'KEEPER', votes: 0 },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
  { id: "dinesh-karthik-kp", name: 'Dinesh Karthik', role: 'KEEPER', votes: 0 },

  // CAPTAIN
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0 },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0 },
  { id: "rajat-patidar-cap", name: 'Rajat Patidar', role: 'CAPTAIN', votes: 0 },
  { id: "hardik-pandya-cap", name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0 },
  { id: "shubman-gill-cap", name: 'Shubman Gill', role: 'CAPTAIN', votes: 0 },
  { id: "ruturaj-gaikwad-cap", name: 'Ruturaj Gaikwad', role: 'CAPTAIN', votes: 0 },
  { id: "kapil-dev-cap", name: 'Kapil Dev', role: 'CAPTAIN', votes: 0 },
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
  const [voteAnim, setVoteAnim] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [weeklyWinner, setWeeklyWinner] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [newReply, setNewReply] = useState("");

  const getToday = () => new Date().toISOString().split('T')[0];
  const getWeekNumber = () => { const d = new Date(); d.setHours(0,0,0); d.setDate(d.getDate() + 4 - (d.getDay()||7)); return d.getFullYear() + '-W' + String(Math.ceil(((d - new Date(d.getFullYear(),0,1))/86400000 + 1)/7)).padStart(2,'0'); };
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor(diff / 1000 / 60) % 60;
      const s = Math.floor(diff / 1000) % 60;
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAndResetDaily = useCallback(async () => {
    const today = getToday();
    const metaRef = ref(db, 'meta');
    const snap = await get(metaRef);
    const metaData = snap.val();
    if (!metaData || metaData.lastResetDate!== today) {
      const resetPlayers = {};
      ALL_PLAYERS.forEach(p => { resetPlayers[p.id] = {...p, votes: 0}; });
      await set(ref(db, 'players'), resetPlayers);
      await set(metaRef, { lastResetDate: today, totalVotes: 0 });
    }
  }, []);

  const checkWeeklyWinner = useCallback(async (playerList) => {
    const week = getWeekNumber();
    const winnerRef = ref(db, `winners/${week}`);
    const snap = await get(winnerRef);
    if(!snap.exists()){
      const sorted = [...playerList].sort((a,b) => b.votes - a.votes);
      if(sorted[0]) await set(winnerRef, { name: sorted[0].name, votes: sorted[0].votes });
    }
    setWeeklyWinner(snap.val());
  }, []);

  const handleDeleteHistory = async () => {
    if(!user) return alert("Google login required to vote!");
    if(window.confirm("Are you sure? Your entire battle history will be deleted.")){
      await remove(ref(db, `users/${user.uid}/history`));
      setBattleHistory([]);
    }
  };

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
  }, []);

  const getBattleKey = () => battle[0] && battle[1]? `${battle[0].id}-${battle[1].id}-B${battleNo}` : null;

  const handlePostComment = async () => {
    if(!user){ alert("Google login required to Debate!"); await signInWithPopup(auth, googleProvider); return; }
    if(!newComment.trim() ||!battle[0] ||!battle[1]) return;
    const time = Date.now();
    const battleKey = getBattleKey();
    const commentRef = ref(db, `comments/${battleKey}/${time}`);
    await set(commentRef, { text: newComment, user: user.displayName, photo: user.photoURL, time: time, likes: {}, replies: {} });
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
    if(!user){ alert("Google login required to vote!"); await signInWithPopup(auth, googleProvider); return; }
    if(!newReply.trim()) return;
    const time = Date.now();
    const battleKey = getBattleKey();
    const replyRef = ref(db, `comments/${battleKey}/${commentKey}/replies/${time}`);
    await set(replyRef, { text: newReply, user: user.displayName, photo: user.photoURL, time: time });
    setNewReply("");
    setReplyTo(null);
  };

  useEffect(() => {
    if(!battle[0] ||!battle[1]) return;
    const battleKey = getBattleKey();
    const commentsRef = ref(db, `comments/${battleKey}`);
    const unsubscribe = onValue(commentsRef, (snap) => {
      const data = snap.val();
      setComments(data? Object.values(data).sort((a,b) => b.time - a.time) : []);
    });
    return () => unsubscribe();
  }, [battle, battleNo]);

  const updateStreak = async () => {
    if(!user) return {newStreak: 0, newBadges: []};
    const userRef = ref(db, `users/${user.uid}`);
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const snap = await get(userRef);
    const data = snap.val() || {};
    let newStreak = 1;
    if(data.lastVoteDate === yesterday) newStreak = (data.streak || 0) + 1;
    let newBadges = [...(data.badges || [])];
    if([3,7,30].includes(newStreak) &&!newBadges.includes(`${newStreak} Day Streak`)){ newBadges.push(`${newStreak} Day Streak`); }
    if(votesToday === 0 &&!newBadges.includes('First Vote')) newBadges.push('First Vote');
    return {newStreak, newBadges};
  };

  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Google login required vote!"); await signInWithPopup(auth, googleProvider); return; }
    if(votesToday >= DAILY_VOTE_LIMIT || isVoting) return alert(`Roju ${DAILY_VOTE_LIMIT} vote maatrame!`);
    setIsVoting(true);
    setVoteAnim(votedPlayerId);
    setTimeout(() => setVoteAnim(null), 500);
    const {newStreak, newBadges} = await updateStreak();
    const today = getToday();
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const votedPlayer = players.find(p => p.id === votedPlayerId);
    const historyEntry = {battleNo, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);
    await update(userRef, { votesToday: increment(1), lastVoteDate: today, streak: newStreak, badges: newBadges, history: newHistory });
    await update(playerRef, { votes: increment(1) });
    await update(ref(db, 'meta'), { totalVotes: increment(1) });
    setTimeout(() => {
      setIsVoting(false);
      setBattleNo(b => b + 1);
      generateBattle(players, filter);
    }, 1000);
  };

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout?")) { await signOut(auth); setShowProfile(false); } };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };
  const handleShareResult = () => {
    const text = `I voted for ${battle[0]?.name} vs ${battle[1]?.name} on CrickClash! ⚔️\nWho's your pick?`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'CrickClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Copied to Clipboard!"); }
  };

  useEffect(() => {
    checkAndResetDaily();
    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = ALL_PLAYERS.map(p => ({...p, votes: data[p.id]?.votes || 0 }));
        setPlayers(playersArray);
        generateBattle(playersArray, filter);
        const sorted = [...playersArray].sort((a,b) => b.votes - a.votes);
        setTopPlayer(sorted[0]);
        setTotalVotes(sorted.reduce((sum, p) => sum + p.votes, 0));
        checkWeeklyWinner(sorted);
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(playersRef, initialPlayers);
        set(ref(db, 'meta'), { lastResetDate: getToday(), totalVotes: 0 });
      }
    });

    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        onValue(ref(db, `users/${currentUser.uid}`), (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === getToday()){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
          }
        });
      } else {
        setVotesToday(0); setStreak(0); setBadges([]); setBattleHistory([]);
      }
    })
  }, [checkAndResetDaily, generateBattle, filter, checkWeeklyWinner]);
  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
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

      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="relative">
            {user?
              <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer hover:scale-110 transition" />
              :
              <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-full font-bold text-sm">Login</button>
            }
            {showProfile && user && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] border-[#333] rounded-xl shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName}</p><p className="text-gray-400 text-xs truncate">{user.email}</p></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Are you sure you want logout?</button>
              </div>
            )}
          </div>
        </header>

        {!user && <div className="bg-[#a8ff00]/10 border border-[#a8ff00] p-3 rounded-2xl mb-3 text-center text-sm">Login to save your votes and battle history 🔥</div>}

        {weeklyWinner && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-2xl mb-3 text-center">
            <p className="text-sm font-bold text-black">TODAY'S CHAMPION🏆</p>
            <p className="text-lg font-bold text-black">{weeklyWinner.name} - {weeklyWinner.votes} Votes</p>
          </div>
        )}

        <div className="bg-[#13131a] p-3 rounded-2xl mb-3">
          <p className="text-sm text-gray-400 mb-2">Your Badges</p>
          <div className="flex gap-2 flex-wrap">
            {user? badges.map(b => <span key={b} className="bg-[#a8ff00] text-black px-3 py-1 rounded-full text-sm font-bold float">🏏 {b}</span>) : <span className="text-gray-500 text-sm">Login to see badges</span>}
            {user && badges.length === 0 && <span className="text-gray-500 text-sm">No badges yet</span>}
          </div>
        </div>
        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm">Today's Votes Left</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{user? DAILY_VOTE_LIMIT - votesToday : DAILY_VOTE_LIMIT} / {DAILY_VOTE_LIMIT}</p>
          <p className="text-xs text-gray-500 mt-1">Reset in: {timeLeft}</p>
        </div>

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold transition ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold transition ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold transition ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{user? streak : 0}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>
            <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a] hover:bg-[#222]'}`}>{role}</button>
              ))}
            </div>

            {battle[0] && battle[1]? (
              <div>
                <div className="flex items-center justify-center gap-2">
                  {[battle[0], battle[1]].map(p => (
                    <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center transition hover:scale-105 cursor-pointer ${voteAnim === p.id? 'vote-pop' : ''}`}>
                      <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-3xl font-bold">{p.name[0]}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.role==='KEEPER'?'bg-red-900':p.role==='CAPTAIN'?'bg-blue-900':p.role==='BATTER'?'bg-red-800':'bg-blue-800'}`}>{p.role}</span>
                      <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                      <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                      <button onClick={(e) => {e.stopPropagation(); handleVote(p.id)}} disabled={isVoting || (user && votesToday >= DAILY_VOTE_LIMIT)} className={`w-full py-3 rounded-xl font-bold mt-2 transition ${user && votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black hover:bg-[#9ae600]'}`}>
                        {isVoting? 'VOTING...' : user && votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
                      </button>
                    </div>
                  ))}
                </div>

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
                      const isLiked = user && c.likes && c.likes[user.uid];
                      const replies = c.replies? Object.values(c.replies).sort((a,b) => a.time - b.time) : [];
                      return (
                        <div key={c.time} className="bg-[#0a0a0f] p-3 rounded-lg">
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#a8ff00] text-black flex items-center justify-center text-xs font-bold">{c.user[0]}</div>
                            <div className="flex-1">
                              <p className="font-bold text-xs">{c.user}</p>
                              <p className="text-sm">{c.text}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2 ml-10">
                            <button onClick={() => handleLikeComment(c.time)} className={`flex items-center gap-1 text-xs ${isLiked? 'text-[#a8ff00]' : 'text-gray-400'}`}>
                              {isLiked? '❤️' : '🤍'} {likeCount}
                            </button>
                            <button onClick={() => setReplyTo(replyTo === c.time? null : c.time)} className="text-xs text-gray-400">Reply</button>
                          </div>

                          {replies.length > 0 && (
                            <div className="ml-10 mt-2 space-y-2 border-l-2 border-gray-700 pl-3">
                              {replies.map(r => (
                                <div key={r.time} className="flex gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#a8ff00] text-black flex items-center justify-center text- font-bold">{r.user[0]}</div>
                                  <div><p className="font-bold text-xs">{r.user}</p><p className="text-xs">{r.text}</p></div>
                                </div>
                              ))}
                            </div>
                          )}

                          {replyTo === c.time && (
                            <div className="flex gap-2 mt-2 ml-10">
                              <input value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Write a reply..." className="w-full bg-[#13131a] p-1.5 rounded-lg text-sm outline-none" />
                              <button onClick={() => handlePostReply(c.time)} className="bg-[#a8ff00] text-black px-3 rounded-lg text-sm font-bold">Send</button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={handleShareResult} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold hover:bg-[#2e2e38] transition">📤 Share Battle</button>
                  <button onClick={handleSkip} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold hover:bg-[#2e2e38] transition">⏭️ Skip</button>
                </div>
              </div>
            ) : <p className="text-center">Loading Players...</p>}
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {Object.values(players.reduce((acc, player) => { if (acc[player.name]) { acc[player.name].votes += player.votes || 0; } else { acc[player.name] = {...player }; } return acc; }, {})).sort((a,b) => b.votes - a.votes).slice(0,10).map((p,i) => {
                const percentage = totalVotes > 0? ((p.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                return (
                  <div key={p.name} onClick={() => setSelectedPlayer(p)} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3 hover:bg-[#1a1a24] transition cursor-pointer">
                    <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                    <div className="w-12 h-12 rounded-full bg-[#a8ff00] text-black flex items-center justify-center text-lg font-bold">{p.name[0]}</div>
                    <div className="flex-1"><div className="flex justify-between"><span className="font-bold">{p.name}</span><span className="text-[#a8ff00] font-bold text-sm">{percentage}%</span></div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>{p.votes||0} votes</span><span>{p.role}</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-[#a8ff00] h-2 rounded-full transition-all duration-500" style={{width: `${percentage}%`}}></div></div></div>
                  </div>
                )
              })}
          </div>
        )}

        {tab === 'History' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#a8ff00]">📜 Your Battle History</h2>
              {user && battleHistory.length > 0 && <button onClick={handleDeleteHistory} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm font-bold transition">🗑️ Clear</button>}
            </div>
            {!user? <p className="text-gray-500 text-center">Login to vote and view your battle history</p> : battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (<div key={i} className="bg-[#13131a] p-3 rounded-xl hover:bg-[#1a1a24] transition"><p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p><p className="font-bold">{h.players[0]} vs {h.players[1]}</p><p className="text-sm text-[#a8ff00]">You voted: {h.votedFor}</p></div>))}
          </div>
        )}
      </div>

      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-white font-bold">CrickClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
        <p className="text-xs mt-1">Made with ❤️ for Cricket Fans</p>
      </footer>
    </div>
  );
}
