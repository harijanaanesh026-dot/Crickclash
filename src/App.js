import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, push } from 'firebase/database';

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
  { name: 'Virat Kohli', role: 'BATTER', votes: 0 }, { name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
  { name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 }, { name: 'Shubman Gill', role: 'BATTER', votes: 0 },
  { name: 'Suryakumar Yadav', role: 'BATTER', votes: 0 }, { name: 'Shreyas Iyer', role: 'BATTER', votes: 0 },
  { name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0 }, { name: 'Ruturaj Gaikwad', role: 'BATTER', votes: 0 },
  { name: 'Abhishek Sharma', role: 'BATTER', votes: 0 }, { name: 'Tilak Varma', role: 'BATTER', votes: 0 },
  { name: 'Rinku Singh', role: 'BATTER', votes: 0 }, { name: 'Sai Sudharsan', role: 'BATTER', votes: 0 },
  { name: 'KL Rahul', role: 'BATTER', votes: 0 }, { name: 'Manish Pandey', role: 'BATTER', votes: 0 },
  { name: 'Ajinkya Rahane', role: 'BATTER', votes: 0 }, { name: 'Prithvi Shaw', role: 'BATTER', votes: 0 },
  { name: 'Suresh Raina', role: 'BATTER', votes: 0 }, { name: 'Yuvraj Singh', role: 'BATTER', votes: 0 },
  { name: 'Gautam Gambhir', role: 'BATTER', votes: 0 }, { name: 'Virender Sehwag', role: 'BATTER', votes: 0 },
  { name: 'Cheteshwar Pujara', role: 'BATTER', votes: 0 }, { name: 'Sarfaraz Khan', role: 'BATTER', votes: 0 },
  { name: 'Rahul Dravid', role: 'BATTER', votes: 0 }, { name: 'VVS Laxman', role: 'BATTER', votes: 0 },
  { name: 'Sourav Ganguly', role: 'BATTER', votes: 0 }, { name: 'Ambati Rayudu', role: 'BATTER', votes: 0 },
  { name: 'Mayank Agarwal', role: 'BATTER', votes: 0 }, { name: 'Devdutt Padikkal', role: 'BATTER', votes: 0 },
  { name: 'Rahul Tripathi', role: 'BATTER', votes: 0 }, { name: 'Karun Nair', role: 'BATTER', votes: 0 },
  { name: 'Hanuma Vihari', role: 'BATTER', votes: 0 }, { name: 'Nitish Rana', role: 'BATTER', votes: 0 },
  { name: 'Vaibhav Suryavanshi', role: 'BATTER', votes: 0 }, { name: 'Mandeep Singh', role: 'BATTER', votes: 0 },
  { name: 'Baba Indrajith', role: 'BATTER', votes: 0 },
  { name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 }, { name: 'Mohammed Shami', role: 'BOWLER', votes: 0 },
  { name: 'Mohammed Siraj', role: 'BOWLER', votes: 0 }, { name: 'Arshdeep Singh', role: 'BOWLER', votes: 0 },
  { name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0 }, { name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0 },
  { name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0 }, { name: 'Deepak Chahar', role: 'BOWLER', votes: 0 },
  { name: 'Umran Malik', role: 'BOWLER', votes: 0 }, { name: 'Avesh Khan', role: 'BOWLER', votes: 0 },
  { name: 'Ravi Bishnoi', role: 'BOWLER', votes: 0 }, { name: 'Varun Chakravarthy', role: 'BOWLER', votes: 0 },
  { name: 'Prasidh Krishna', role: 'BOWLER', votes: 0 }, { name: 'Harshal Patel', role: 'BOWLER', votes: 0 },
  { name: 'T Natarajan', role: 'BOWLER', votes: 0 }, { name: 'Mukesh Kumar', role: 'BOWLER', votes: 0 },
  { name: 'Zaheer Khan', role: 'BOWLER', votes: 0 }, { name: 'Irfan Pathan', role: 'BOWLER', votes: 0 },
  { name: 'Ashish Nehra', role: 'BOWLER', votes: 0 }, { name: 'Anil Kumble', role: 'BOWLER', votes: 0 },
  { name: 'Harbhajan Singh', role: 'BOWLER', votes: 0 }, { name: 'Javagal Srinath', role: 'BOWLER', votes: 0 },
  { name: 'Munaf Patel', role: 'BOWLER', votes: 0 }, { name: 'RP Singh', role: 'BOWLER', votes: 0 },
  { name: 'R Sai Kishore', role: 'BOWLER', votes: 0 },
  { name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Washington Sundar', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Krunal Pandya', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Deepak Hooda', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Shahbaz Ahmed', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Venkatesh Iyer', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Kapil Dev', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Ravi Shastri', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Stuart Binny', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Piyush Chawla', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Amit Mishra', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'MS Dhoni', role: 'KEEPER', votes: 0 }, { name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
  { name: 'Dinesh Karthik', role: 'KEEPER', votes: 0 }, { name: 'Ishan Kishan', role: 'KEEPER', votes: 0 },
  { name: 'Sanju Samson', role: 'KEEPER', votes: 0 }, { name: 'Jitesh Sharma', role: 'KEEPER', votes: 0 },
  { name: 'Dhruv Jurel', role: 'KEEPER', votes: 0 }, { name: 'Prabhsimran Singh', role: 'KEEPER', votes: 0 },
  { name: 'Anuj Rawat', role: 'KEEPER', votes: 0 }, { name: 'N Jagadeesan', role: 'KEEPER', votes: 0 },
  { name: 'Kiran More', role: 'KEEPER', votes: 0 }, { name: 'Nayan Mongia', role: 'KEEPER', votes: 0 },
  { name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0 }, { name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 },
  { name: 'MS Dhoni', role: 'CAPTAIN', votes: 0 }, { name: 'Sachin Tendulkar', role: 'CAPTAIN', votes: 0 },
  { name: 'Sourav Ganguly', role: 'CAPTAIN', votes: 0 }, { name: 'KL Rahul', role: 'CAPTAIN', votes: 0 },
  { name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0 }, { name: 'Shreyas Iyer', role: 'CAPTAIN', votes: 0 },
  { name: 'Shubman Gill', role: 'CAPTAIN', votes: 0 }, { name: 'Rishabh Pant', role: 'CAPTAIN', votes: 0 },
  { name: 'Ravindra Jadeja', role: 'CAPTAIN', votes: 0 }, { name: 'Ajinkya Rahane', role: 'CAPTAIN', votes: 0 },
  { name: 'Kapil Dev', role: 'CAPTAIN', votes: 0 },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [badges, setBadges] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const checkDailyReset = useCallback(() => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('lastVoteDate');
    if (lastDate!== today) {
      localStorage.setItem('votesToday', 0);
      localStorage.setItem('lastVoteDate', today);
      setVotesToday(0);
      if(user) {
        const userRef = ref(db, `users/${user.uid}`);
        update(userRef, { votesToday: 0, lastVoteDate: today });
      }
    }
  }, );

  const loadBadges = useCallback(() => {
    const totalVotes = Number(localStorage.getItem('totalVotes') || 0);
    let userBadges = [];
    if(totalVotes >= 1) userBadges.push('🏏 First Vote');
    if(totalVotes >= 50) userBadges.push('🔥 Cricket Expert');
    if(streak >= 7) userBadges.push('👑 Legend Streak');
    if(totalVotes >= 200) userBadges.push('⚡ GOAT Maker');
    setBadges(userBadges);
  }, [streak]);

  useEffect(() => {
    if('Notification' in window) Notification.requestPermission();
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        checkDailyReset();
        const userRef = ref(db, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          const today = new Date().toDateString();
          if(userData){
            if(userData.lastVoteDate === today){
              setVotesToday(userData.votesToday || 0);
              setStreak(userData.streak || 0);
            } else {
              setVotesToday(0);
              setStreak(userData.streak || 0);
              set(userRef, {...userData, votesToday: 0, lastVoteDate: today});
            }
          }
        });
        loadBadges();
      }
    });
    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 90) {
        const playersArray = Object.keys(data).map(key => ({ id: Number(key),...data[key] }));
        setPlayers(playersArray);
        generateBattle(playersArray, 'Any');
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p, idx) => { initialPlayers[idx] = {...p, id: idx }; });
        set(playersRef, initialPlayers);
      }
    });
    const commentsRef = ref(db, 'comments');
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if(data) setComments(Object.values(data).reverse().slice(0, 20));
    });
  }, [loadBadges, checkDailyReset, user]);
    const generateBattle = (playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    const p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) p2 = filtered[Math.floor(Math.random() * filtered.length)];
    setBattle([p1, p2]);
  }

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => { if(window.confirm("Logout?")) signOut(auth); }

  const handleVote = async (playerId) => {
    checkDailyReset();
    if(votesToday >= DAILY_VOTE_LIMIT) {
      alert("Daily vote limit reached! Come back tomorrow 12AM 🔥");
      return;
    }
    new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3").play();
    const player = players.find(p => p.id === playerId);
    await update(ref(db, `players/${playerId}`), { votes: (player.votes || 0) + 1 });
    const today = new Date().toDateString();
    const userRef = ref(db, `users/${user.uid}`);
    let newStreak = streak;
    const lastVoteDate = localStorage.getItem('lastVoteDate');
    if(lastVoteDate!== today){
      newStreak = Number(localStorage.getItem('streak') || 0) + 1;
      localStorage.setItem('streak', newStreak);
    }
    const newVotesToday = votesToday + 1;
    const newTotal = Number(localStorage.getItem('totalVotes') || 0) + 1;
    await set(userRef, {
      name: user.displayName, email: user.email,
      votesToday: newVotesToday, lastVoteDate: today,
      totalVotes: newTotal, streak: newStreak
    });
    setVotesToday(newVotesToday);
    localStorage.setItem('votesToday', newVotesToday);
    localStorage.setItem('totalVotes', newTotal);
    localStorage.setItem('lastVoteDate', today);
    loadBadges();
    if('Notification' in window && Notification.permission === 'granted'){
      new Notification('Vote Cast! ⚡', { body: `You voted for ${player.name}` });
    }
    setBattleNo(prev => prev + 1);
    generateBattle([...players], filter);
  }
    const handleComment = async () => {
    if(!newComment.trim() ||!user) return;
    const commentRef = ref(db, 'comments');
    await push(commentRef, {
      user: user.displayName, text: newComment,
      battle: `${battle[0]?.name} vs ${battle[1]?.name}`, time: Date.now()
    });
    setNewComment('');
  }

  const handleSkip = () => { setBattleNo(prev => prev + 1); generateBattle([...players], filter); }
  const getPercentage = (p1, p2) => {
    const total = (p1?.votes || 0) + (p2?.votes || 0);
    if(total === 0) return 50;
    return ((p1?.votes || 0) / total) * 100;
  }

  if(loading) return <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-white">Loading...</div>
  if(!user){
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] to-[#1a1f2e] text-white flex-col items-center justify-center p-6">
        <div className="text-center mb-10 mt-20">
          <div className="text-5xl mb-3">🏏</div>
          <h1 className="text-4xl font-bold mb-2"><span className="text-white">Crick</span><span className="text-orange-400">Clash</span></h1>
          <p className="text-sm text-gray-400">ANESH Innovation</p>
        </div>
        <button onClick={handleGoogleLogin} className="bg-white text-black w-[85%] max-w-xs px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 mb-16">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="w-5 h-5"/>Sign In with Google
        </button>
        <footer className="text-center text-gray-500 text-xs">©️ 2026 CrickClash A Production By ANESH</footer>
      </div>
    )
  }

  const totalVotes = players.reduce((sum, p) => sum + (p.votes || 0), 0);
  const topPlayer = [...players].sort((a,b) => (b.votes||0) - (a.votes||0))[0];
  const votesLeft = DAILY_VOTE_LIMIT - votesToday;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] to-[#1a1f2e] text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-1">
          <div><div className="flex items-center gap-2"><div className="text-3xl">🏏</div><h1 className="text-2xl font-bold"><span className="text-white">Crick</span><span className="text-orange-400">Clash</span></h1></div><p className="text-xs text-gray-400 ml-10">ANESH Innovation</p></div>
          <div onClick={handleLogout} className="w-9 h-9 rounded-full bg-[#a8ff00] text-black font-bold flex items-center justify-center text-lg cursor-pointer">{user.displayName?.charAt(0).toUpperCase()}</div>
        </div>

        {badges.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-400 mb-2">Your Badges</p>
            <div className="flex gap-2 flex-wrap">{badges.map(b => <span key={b} className="bg-[#a8ff00] text-black px-3 py-1 rounded-full text-xs font-bold">{b}</span>)}</div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-3 mb-4 text-center">
          <p className="text-sm text-gray-400">Today's Votes Left</p>
          <p className="text-2xl font-bold text-[#a8ff00]">{votesLeft} / {DAILY_VOTE_LIMIT}</p>
          {votesLeft === 0 && <p className="text-xs text-red-400 mt-1">Resets at 12AM</p>}
        </div>

        <div className="flex justify-around mb-6 border-b border-gray-700">
          <button onClick={() => setTab('Battle')} className={`${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>🏆 Rankings</button>
          <button onClick={() => setTab('Debate')} className={`${tab === 'Debate'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>💬 Debate</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL VOTES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP CHAMP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>
            <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => {setFilter(role); generateBattle([...players], role)}}
                  className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-gray-800'}`}>{role}</button>
              ))}
            </div>
            {battle[0] && battle[1]? (
              <div>
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                    <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs font-bold">{battle[0].role}</span>
                    <h3 className="text-xl font-bold mt-3">{battle[0].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[0].votes || 0} votes</p>
                    <button onClick={() => handleVote(battle[0].id)} disabled={votesToday >= DAILY_VOTE_LIMIT}
                      className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-600 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
                      {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT REACHED' : 'VOTE'}
                    </button>
                  </div>
                  <span className="text-3xl font-bold text-orange-400">VS</span>
                  <div className="bg-gradient-to-b from-[#4a1e5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                    <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{battle[1].role}</span>
                    <h3 className="text-xl font-bold mt-3">{battle[1].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[1].votes || 0} votes</p>
                    <button onClick={() => handleVote(battle[1].id)} disabled={votesToday >= DAILY_VOTE_LIMIT}
                      className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-600 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
                      {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT REACHED' : 'VOTE'}
                    </button>
                  </div>
                </div>
                <div className="my-4">
                  <div className="flex justify-between text-xs mb-1 text-gray-400">
                    <span>{getPercentage(battle[0], battle[1]).toFixed(0)}%</span>
                    <span>{(100 - getPercentage(battle[0], battle[1])).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-red-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(battle[0], battle[1])}%` }}></div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSkip} className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Skip →</button>
                  <button onClick={() => navigator.share({title: 'CrickClash', text: `Who will win? ${battle[0]?.name} vs ${battle[1]?.name}`})}
                    className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Share 📤</button>
                </div>
              </div>
            ) : <p className="text-center">Loading...</p>}
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {[...players].sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
              <div key={p.id} className="bg-gray-800 p-3 rounded-lg mb-2 flex justify-between">
                <span>{i+1}. {p.name}</span><span className="text-[#a8ff00]">{p.votes||0} votes</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Debate' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">💬 Comments & Debates</h2>
            <div className="bg-gray-800 p-3 rounded-xl mb-4">
              <p className="text-xs text-gray-400 mb-2">Current Battle: {battle[0]?.name} vs {battle[1]?.name}</p>
              <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Why is your player better? 🔥"
                className="w-full bg-gray-700 p-3 rounded-lg mb-2 text-white outline-none" maxLength={100}/>
              <button onClick={handleComment} disabled={!newComment.trim() || votesToday >= DAILY_VOTE_LIMIT}
                className="bg-[#a8ff00] text-black w-full py-2 rounded-lg font-bold disabled:bg-gray-600 disabled:cursor-not-allowed">Post Comment</button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {comments.length === 0? (<p className="text-center text-gray-500 mt-10">No debates yet. Be the first! 👇</p>) : (
                comments.map((c,i) => (
                  <div key={i} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm text-[#a8ff00]">{c.user}</p>
                      <p className="text-xs text-gray-500">{new Date(c.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">on {c.battle}</p>
                    <p className="text-sm">{c.text}</p>
                    <div className="flex gap-4 mt-2">
                      <button className="text-xs text-gray-400">🔥 {Math.floor(Math.random()*50)} Hype</button>
                      <button className="text-xs text-gray-400">💬 Reply</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        <footer className="text-center mt-10 text-gray-500 text-sm">©️ 2026 CrickClash A Production By ANESH</footer>
      </div>
    </div>
  );
}
    
