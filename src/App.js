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

// PART 1
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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [totalVotes, setTotalVotes] = useState(24);
  const [topPlayer, setTopPlayer] = useState(null);

  // BUG FIX 1: DUPLICATE PLAYER RAKUNDA STRONG LOOP
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
  }, [])

  const getPercentage = (p1, p2) => {
    const total = (p1?.votes || 0) + (p2?.votes || 0);
    if(total === 0) return 50;
    return ((p1?.votes || 0) / total) * 100;
  }

  useEffect(() => {
    if('Notification' in window) Notification.requestPermission();
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
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
              update(userRef, {votesToday: 0, lastVoteDate: today});
            }
          }
        });
      }
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 90) {
        const playersArray = Object.keys(data).map(key => ({ id: Number(key),...data[key] }));
        setPlayers(playersArray);
        const sorted = [...playersArray].sort((a,b) => (b.votes||0) - (a.votes||0));
        setTopPlayer(sorted[0]);
        setTotalVotes(playersArray.reduce((sum, p) => sum + (p.votes||0), 24));
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

  }, []);

  // BUG FIX 2: AUTO CALL TEESANU. Filter marchite matrame kotha battle
  useEffect(() => {
    if(players.length > 0) generateBattle(players, filter);
  }, [players, filter, generateBattle])

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => { if(window.confirm("Logout?")) signOut(auth); }

  // BUG FIX 3: SKIP BUTTON ONLY
  const handleSkip = () => {
    setBattleNo(b => b + 1);
    generateBattle(players, filter);
  }

  const handleVote = async (votedPlayerId) => {
    if(!user || votesToday >= DAILY_VOTE_LIMIT) return;
    const votedPlayer = players.find(p => p.id === votedPlayerId);
    if(!votedPlayer) return;

    const today = new Date().toDateString();
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);

    await update(userRef, {
      votesToday: votesToday + 1,
      lastVoteDate: today,
      streak: streak + 1
    });

    const playerSnap = await get(playerRef);
    const currentVotes = playerSnap.val()?.votes || 0;
    await update(playerRef, { votes: currentVotes + 1 });

    setVotesToday(votesToday + 1);
    setTimeout(() => handleSkip(), 800);
  }

  const handleComment = async () => {
    if(!newComment.trim() ||!user) return;
    const commentsRef = ref(db, 'comments');
    const newCommentRef = push(commentsRef);
    await set(newCommentRef, {
      user: user.displayName,
      text: newComment,
      battle: `${battle[0]?.name} vs ${battle[1]?.name}`,
      time: Date.now()
    });
    setNewComment('');
  }

  if(loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#a8ff00]">CrickClash</h1>
          {!user? (
            <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-lg font-bold">Login</button>
          ) : (
            <button onClick={handleLogout} className="bg-gray-800 px-4 py-2 rounded-lg font-bold">Logout</button>
          )}
        </header>

        <div className="flex gap-6 border-b border-gray-800 mb-6">
          <button onClick={() => setTab('Battle')} className={`${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>🏆 Rankings</button>
          <button onClick={() => setTab('Debate')} className={`${tab === 'Debate'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>💬 Debate</button>
        </div>

        {/* PART 2 + 3 */}
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
                <button key={role} onClick={() => setFilter(role)}
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
              </div>
            ) : <p className="text-center">Loading...</p>}
            <div className="flex gap-4 mt-6">
              <button onClick={handleSkip} className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Skip →</button>
              <button onClick={() => navigator.share({title: 'CrickClash', text: `Who will win? ${battle[0]?.name} vs ${battle[1]?.name}`})}
                className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Share 📤</button>
            </div>
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
