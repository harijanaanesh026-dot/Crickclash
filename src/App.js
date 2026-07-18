import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, push } from 'firebase/database';

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

const QUIZ_QUESTIONS = [
  {q: "Who scored first 200 in ODIs?", options: ["Sachin", "Rohit", "Sehwag"], ans: "Sachin"},
  {q: "Which country won 2023 WC?", options: ["India", "Australia", "England"], ans: "Australia"},
  {q: "Fastest 50 in IPL?", options: ["KL Rahul", "Sunil Narine", "Yusuf Pathan"], ans: "KL Rahul"}
];

const ALL_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg', stats: "8183 ODI Runs, 46 Centuries" },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.4.jpg', stats: "18426 ODI Runs, 49 Centuries" },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg', stats: "10709 ODI Runs, 31 Centuries" },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/352400/352496.6.jpg', stats: "2271 ODI Runs, 5 Centuries" },
  { id: "suryakumar-yadav", name: 'Suryakumar Yadav', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313105.6.jpg', stats: "T20I Strike Rate: 171" },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313118.6.jpg', stats: "10889 ODI Runs, 12 Centuries" },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313114.6.jpg', stats: "146 ODI Wickets, Eco: 4.62" },
  { id: "bhuvneshwar-kumar", name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313115.6.jpg', stats: "141 ODI Wickets" },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313116.6.jpg', stats: "195 ODI Wickets" },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/333400/333469.6.jpg', stats: "71 ODI Wickets" },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg', stats: "1704 ODI Runs, 84 Wickets" },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313126.6.jpg', stats: "2756 ODI Runs, 220 Wickets" },
  { id: "ravichandran-ashwin", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313127.6.jpg', stats: "156 ODI Wickets" },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg', stats: "10773 ODI Runs, 829 Dismissals" },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313131.6.jpg', stats: "1590 ODI Runs" },
  { id: "sanju-samson", name: 'Sanju Samson', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313134.6.jpg', stats: "510 ODI Runs" },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg', stats: "Captain: 95 ODI Wins" },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg', stats: "Captain: 2023 WC Finalist" },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg', stats: "Captain: 2x WC Winner" },
  { id: "rahul-dravid-cap", name: 'Rahul Dravid', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313118.6.jpg', stats: "Coach: 2024 T20 WC Winner" },
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
  const [extraVotes, setExtraVotes] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [voteAnim, setVoteAnim] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQ, setQuizQ] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [seasonWinner, setSeasonWinner] = useState(null);

  const getToday = () => new Date().toISOString().split('T')[0];
  const getSeason = () => { const d = new Date(); const start = new Date(d); start.setDate(d.getDate() - d.getDay()); return start.toISOString().split('T')[0]; }

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
      setTotalVotes(0);
    }
  }, []);

  const handleDeleteHistory = async () => {
    if(!user) return;
    if(window.confirm("Delete all history?")){
      await remove(ref(db, `users/${user.uid}/history`));
      setBattleHistory([]);
    }
  };

  // NEW: REFERRAL SYSTEM
  const handleReferral = async () => {
    const refCode = prompt("Enter Friend's Referral Code:");
    if(refCode && refCode!== user.uid){
      const refRef = ref(db, `referrals/${refCode}/${user.uid}`);
      const snap = await get(refRef);
      if(!snap.exists()){
        await set(refRef, true);
        await update(ref(db, `users/${user.uid}`), {extraVotes: extraVotes + 1});
        setExtraVotes(extraVotes + 1);
        alert("+1 Extra Vote Unlocked!");
      } else { alert("Already used this code"); }
    }
  };

  // NEW: QUIZ SYSTEM
  const startQuiz = () => {
    const randomQ = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    setQuizQ(randomQ);
    setShowQuiz(true);
  };

  const submitQuiz = async (answer) => {
    if(answer === quizQ.ans){
      const newBadges = [...badges, "Cricket Gyaani"];
      await update(ref(db, `users/${user.uid}`), {badges: newBadges});
      setBadges(newBadges);
      alert("Correct! + Cricket Gyaani Badge");
    } else { alert("Wrong Answer!"); }
    setShowQuiz(false);
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

  useEffect(() => {
    checkAndResetDaily();
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const today = getToday();
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === today){
              setVotesToday(userData.votesToday || 0);
              setExtraVotes(userData.extraVotes || 0);
            }
            else {
              setVotesToday(0); setExtraVotes(0);
              update(userRef, {votesToday: 0, extraVotes: 0, lastVoteDate: today, history: []});
            }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
          } else {
            set(userRef, {votesToday: 0, extraVotes: 0, lastVoteDate: today, streak: 0, badges:[], history:[]});
          }
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

    // SEASON WINNER CHECK
    const seasonRef = ref(db, `seasons/${getSeason()}`);
    onValue(seasonRef, (snap) => setSeasonWinner(snap.val()));

  }, [checkAndResetDaily]);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle]);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout?")) { await signOut(auth); setShowProfile(false); } };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };

  const handleShareResult = () => {
    const text = `I voted for ${battle[0]?.name} vs ${battle[1]?.name} on CrickClash! ⚔️`;
    navigator.share? navigator.share({text}) : navigator.clipboard.writeText(text);
  };

  const updateStreak = async () => {
    if(!user) return {newStreak: 0, newBadges: []};
    const snap = await get(ref(db, `users/${user.uid}`));
    const data = snap.val() || {};
    let newStreak = 1;
    if(data.lastVoteDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]) newStreak = (data.streak || 0) + 1;
    let newBadges = [...(data.badges || [])];
    if([3,7,30].includes(newStreak) &&!newBadges.includes(`${newStreak} Day Streak`)){ newBadges.push(`${newStreak} Day Streak`); }
    return {newStreak, newBadges};
  };

  const handleVote = async (votedPlayerId) => {
    if(!user){ await signInWithPopup(auth, googleProvider); return; }
    const voteLimit = DAILY_VOTE_LIMIT + extraVotes;
    if(votesToday >= voteLimit) return alert(`Daily limit reached!`);

    setVoteAnim(votedPlayerId);
    setTimeout(() => setVoteAnim(null), 500);

    const {newStreak, newBadges} = await updateStreak();
    const today = getToday();
    const votedPlayer = players.find(p => p.id === votedPlayerId);
    const historyEntry = {battleNo, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};

    await update(ref(db, `users/${user.uid}`), {
      votesToday: votesToday + 1,
      lastVoteDate: today,
      streak: newStreak,
      badges: newBadges,
      history: [historyEntry,...battleHistory].slice(0, 50)
    });

    await update(ref(db, `players/${votedPlayerId}`), { votes: (votedPlayer.votes || 0) + 1 });
    await update(ref(db, 'meta/totalVotes'), {'.sv': { 'increment': 1 }});

    setVotesToday(votesToday + 1); setBadges(newBadges); setStreak(newStreak);
    setBattleNo(battleNo + 1); setTimeout(() => generateBattle(players, filter), 500);

    // Quiz after vote
    setTimeout(() => startQuiz(), 1000);
  };

  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;
    return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(-10px)} 100%{transform:translateY(0)} }
      .vote-pop { animation: pop 0.5s ease; }
      .float { animation: float 2s ease-in-out infinite; }
      `}</style>

      {showQuiz && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#13131a] p-6 rounded-2xl w-80">
            <h3 className="font-bold mb-4">🏏 Daily Quiz</h3>
            <p className="mb-4">{quizQ?.q}</p>
            {quizQ?.options.map(opt => (
              <button key={opt} onClick={() => submitQuiz(opt)} className="w-full bg-[#a8ff00] text-black py-2 rounded-lg mb-2 font-bold">{opt}</button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto w-full p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="relative">
            {user? <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" />
            : <button onClick={handleGoogleLogin} className="bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold">Login</button>}
          </div>
        </header>

        {user && (
          <>
            {seasonWinner && <div className="bg-yellow-900 p-2 rounded-xl mb-3 text-center text-sm">👑 Season King: {seasonWinner}</div>}
            <button onClick={handleReferral} className="w-full bg-purple-600 py-2 rounded-xl mb-3 font-bold">🎁 Invite Friend = +1 Vote</button>
            <div className="bg-[#13131a] p-3 rounded-2xl mb-3">
              <p className="text-sm text-gray-400 mb-2">Your Badges</p>
              <div className="flex gap-2 flex-wrap">{badges.map(b => <span key={b} className="bg-[#a8ff00] text-black px-3 py-1 rounded-full text-sm font-bold float">🏏 {b}</span>)}</div>
            </div>
            <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
              <p className="text-gray-400 text-sm">Today's Votes Left</p>
              <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT + extraVotes - votesToday} / {DAILY_VOTE_LIMIT + extraVotes}</p>
              <p className="text-xs text-gray-500 mt-1">Reset in: {timeLeft}</p>
            </div>
          </>
        )}

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold ${tab === 'History'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {tab === 'Battle' && battle[0] && (
          <div>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs">TOTAL</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{topPlayer?.name.split(' ')[0]}</p><p className="text-xs">TOP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs">STREAK</p></div>
            </div>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {[battle[0], battle[1]].map(p => (
                <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center cursor-pointer ${voteAnim === p.id? 'vote-pop' : ''}`}>
                  <img src={p.image} className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-[#a8ff00]" />
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-800">{p.role}</span>
                  <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                  <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                  <button onClick={(e) => {e.stopPropagation(); handleVote(p.id)}} disabled={votesToday >= DAILY_VOTE_LIMIT + extraVotes} className="w-full bg-[#a8ff00] text-black py-3 rounded-xl font-bold mt-2">VOTE</button>
                </div>
              ))}
            </div>
            {selectedPlayer && (
              <div onClick={() => setSelectedPlayer(null)} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-[#13131a] p-6 rounded-2xl"><h3 className="text-2xl font-bold">{selectedPlayer.name}</h3><p className="text-gray-400">{selectedPlayer.stats}</p></div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={handleShareResult} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">📤 Share</button>
              <button onClick={handleSkip} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">⏭️ Skip</button>
            </div>
          </div>
        )}

        {tab === 'Rankings' && <div>{/* Same Rankings code */}</div>}
        {tab === 'History' && <div>{/* Same History code with Clear button */}</div>}

        <footer className="text-center mt-10 pb-6 text-gray-500 text-sm">© 2026 <span className="text-white font-bold">CrickClash™</span> | A Production By ANESH</footer>
      </div>
    </div>
  );
        }
