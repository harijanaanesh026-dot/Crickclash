import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get } from 'firebase/database';
import * as htmlToImage from 'html-to-image';

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
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313114.6.jpg' },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313116.6.jpg' },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg' },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313126.6.jpg' },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313131.6.jpg' },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
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
  const [showVotePopup, setShowVotePopup] = useState(false);
  const battleCardRef = useRef(null);

  const generateBattle = useCallback((playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) { p2 = filtered[Math.floor(Math.random() * filtered.length)]; }
    setBattle([p1, p2]);
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
          } else { set(userRef, {votesToday: 0, lastVoteDate: today, streak: 0}); }
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
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(playersRef, initialPlayers);
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle]);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { await signOut(auth); };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };

  const downloadBattleCard = () => {
    if (!battleCardRef.current) return;
    htmlToImage.toPng(battleCardRef.current, { quality: 0.95 })
     .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `crickclash-battle-${battleNo}.png`;
        link.href = dataUrl;
        link.click();
      })
     .catch((err) => console.log(err));
  };

  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Google login required to vote"); return; }
    if(votesToday >= DAILY_VOTE_LIMIT) return alert(`Roju ${DAILY_VOTE_LIMIT} vote maatrame!`);

    const votedPlayer = players.find(p => p.id === votedPlayerId);
    const today = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);

    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today });
    const playerSnap = await get(playerRef);
    await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });

    setVotesToday(votesToday + 1);
    setShowVotePopup(votedPlayer.name);
    setTimeout(() => {
      setShowVotePopup(false);
      downloadBattleCard(); // Vote chesina ventane image download
    }, 1500);

    setBattleNo(battleNo + 1);
    setTimeout(() => generateBattle(players, filter), 2000);
  };

  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  const totalBattleVotes = (battle[0]?.votes || 0) + (battle[1]?.votes || 0);
  const p1Per = totalBattleVotes > 0? Math.round(((battle[0]?.votes || 0) / totalBattleVotes) * 100) : 50;
  const p2Per = 100 - p1Per;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {showVotePopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#a8ff00] text-black px-6 py-3 rounded-full font-bold z-50">
          🔥 You voted for {showVotePopup}! Downloading Card...
        </div>
      )}

      <div className="max-w-md mx-auto p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          {user? <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg text-sm font-bold">Logout</button> : <button onClick={handleGoogleLogin} className="bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold">Login</button>}
        </header>

        {user && (
          <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
            <p className="text-gray-400 text-sm">Today's Votes Left</p>
            <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday} / {DAILY_VOTE_LIMIT}</p>
          </div>
        )}

        {tab === 'Battle' && (
          <>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
            </div>

            {battle[0] && battle[1]? (
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[battle[0], battle[1]].map(p => (
                    <div key={p.id} className="bg-[#13131a] p-4 rounded-2xl w-1/2 text-center">
                      <img src={p.image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" alt={p.name}/>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-700">{p.role}</span>
                      <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                      <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                      <button onClick={() => handleVote(p.id)} disabled={votesToday >= DAILY_VOTE_LIMIT} className="w-full py-3 rounded-xl font-bold mt-2 bg-[#a8ff00] text-black disabled:bg-gray-700">
                        {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleSkip} className="w-full bg-[#23232b] py-3 rounded-xl font-bold">⏭️ Skip</button>
              </div>
            ) : <p className="text-center">Loading Players...</p>}
          </>
        )}

        {/* HIDDEN BATTLE CARD FOR IMAGE GENERATION */}
        <div style={{ position: 'absolute', left: '-9999px' }}>
          <div ref={battleCardRef} id="battle-card" style={{ width: '400px', background: 'linear-gradient(135deg, #0a0a0f 0%, #13131a 100%)', padding: '20px', fontFamily: 'Arial', color: 'white' }}>
            <h2 style={{ textAlign: 'center', color: '#a8ff00', fontSize: '24px', margin: '0 0 10px 0' }}>⚔️ CRICKCLASH BATTLE #{battleNo}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <img src={battle[0]?.image} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #a8ff00' }} alt=""/>
                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{battle[0]?.name}</p>
                <p style={{ color: '#a8ff00', fontSize: '20px', fontWeight: 'bold' }}>{p1Per}%</p>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>VS</p>
              <div style={{ textAlign: 'center' }}>
                <img src={battle[1]?.image} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #a8ff00' }} alt=""/>
                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>{battle[1]?.name}</p>
                <p style={{ color: '#a8ff00', fontSize: '20px', fontWeight: 'bold' }}>{p2Per}%</p>
              </div>
            </div>
            <div style={{ background: '#23232b', padding: '10px', borderRadius: '10px', textAlign: 'center', margin: '10px 0' }}>
              <p style={{ margin: 0 }}>I voted on CrickClash 🔥</p>
            </div>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', margin: '10px 0 0 0' }}>crickclash.vercel.app | © ANESH</p>
          </div>
        </div>

        <footer className="text-center mt-10 pb-6 text-gray-500 text-sm">
          <p>© 2026 <span className="text-[#a8ff00] font-bold">CrickClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
        </footer>
      </div>
    </div>
  );
                                                      }
