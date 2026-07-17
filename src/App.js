import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get } from 'firebase/database';

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

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: 'Arial' },
  container: { maxWidth: '420px', margin: '0 auto', padding: '16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  card: { background: '#13131a', padding: '16px', borderRadius: '16px', marginBottom: '16px' },
  button: { padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  voteBtn: { background: '#a8ff00', color: 'black', width: '100%' },
  disabledBtn: { background: '#555', color: 'gray', width: '100%' },
  tab: { paddingBottom: '8px', fontWeight: 'bold', cursor: 'pointer' },
  activeTab: { color: '#a8ff00', borderBottom: '2px solid #a8ff00' }
}

const ALL_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313114.6.jpg' },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg' },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
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

  const generateBattle = useCallback((playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) p2 = filtered[Math.floor(Math.random() * filtered.length)];
    setBattle([p1, p2]);
  }, []);

  const checkDailyReset = async () => {
    const lastResetRef = ref(db, 'system/lastReset');
    const snap = await get(lastResetRef);
    const today = new Date().toISOString().split('T')[0];
    if(snap.val()!== today){
      const updates = {};
      ALL_PLAYERS.forEach(p => { updates[`players/${p.id}/votes`] = 0; });
      await update(ref(db), updates);
      await set(lastResetRef, today);
    }
  }

  useEffect(() => {
    checkDailyReset();
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const today = new Date().toISOString().split('T')[0];
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val() || {};
          if(userData.lastVoteDate!== today){ update(userRef, {votesToday: 0, lastVoteDate: today}); }
          setVotesToday(userData.votesToday || 0);
          setStreak(userData.streak || 0);
          setBadges(userData.badges || []);
          setBattleHistory(userData.history || []);
        });
      }
    });
    onValue(ref(db, 'players'), (snapshot) => {
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
        set(ref(db, 'players'), initialPlayers);
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle]);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { await signOut(auth); };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };

  const handleVote = async (votedPlayerId) => {
    if(!user) return handleGoogleLogin();
    if(votesToday >= DAILY_VOTE_LIMIT) return alert(`Daily limit done`);
    await update(ref(db, `users/${user.uid}`), { votesToday: votesToday + 1 });
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const snap = await get(playerRef);
    await update(playerRef, { votes: (snap.val()?.votes || 0) + 1 });
    setVotesToday(votesToday + 1);
    setBattleNo(battleNo + 1); setTimeout(() => generateBattle(players, filter), 500);
  };

  if(loading) return <div style={styles.page}><div style={{textAlign:'center', paddingTop: '50vh'}}>Loading CrickClash...</div></div>;

  return ( // PART 2 STARTS
        <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1>Crick<span style={{color:'#FF7A00'}}>Clash</span></h1>
          {user? <img src={user.photoURL} onClick={handleLogout} style={{width:40, height:40, borderRadius: '50%'}}/> : <button onClick={handleGoogleLogin} style={{...styles.button, background:'blue'}}>Login</button>}
        </header>

        <div style={{display:'flex', justifyContent:'space-around', borderBottom:'1px solid #333', marginBottom:16}}>
          <div onClick={() => setTab('Battle')} style={{...styles.tab,...(tab==='Battle'?styles.activeTab:{})}}>Battle</div>
          <div onClick={() => setTab('Rankings')} style={{...styles.tab,...(tab==='Rankings'?styles.activeTab:{})}}>Rankings</div>
        </div>

        {tab==='Battle' && battle[0] && battle[1] && (
          <div>
            <h2 style={{textAlign:'center'}}>Battle #{battleNo}</h2>
            <div style={{display:'flex', gap: '12px'}}>
              {battle.map(p => {
                const battleTotal = (battle[0].votes || 0) + (battle[1].votes || 0);
                const percentage = battleTotal > 0? ((p.votes || 0) / battleTotal * 100).toFixed(1) : 50;
                return (
                  <div key={p.id} style={{...styles.card, width:'50%', textAlign:'center'}}>
                    <img src={p.image} style={{width:80, height:80, borderRadius:'50%'}}/>
                    <p>{p.name}</p>
                    <div style={{background:'#333', height:8, borderRadius:4, marginTop:8}}>
                      <div style={{background:'#a8ff00', height:8, borderRadius:4, width: `${percentage}%`}}></div>
                    </div>
                    <p style={{color:'#a8ff00'}}>{percentage}%</p>
                    <button onClick={() => handleVote(p.id)} disabled={votesToday >= DAILY_VOTE_LIMIT} style={votesToday >= DAILY_VOTE_LIMIT? styles.disabledBtn : styles.voteBtn}>
                      {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
                    </button>
                  </div>
                )
              })}
            </div>
            <button onClick={handleSkip} style={{...styles.button, width:'100%', marginTop:12, background:'#333'}}>Skip</button>
          </div>
        )}

        {tab==='Rankings' && <div>
          <h2>Top Players</h2>
          {players.sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => 
            <div key={p.id} style={styles.card}>#{i+1} {p.name} - {p.votes} votes</div>
          )}
        </div>}

        <footer style={{textAlign:'center', marginTop:40, color:'gray'}}>
          <p>© 2026 CrickClash | A Production By ANESH</p>
        </footer>
      </div>
    </div>
  );
            }
