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
  // BATTERS
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/352400/352496.6.jpg' },
  { id: "suryakumar-yadav", name: 'Suryakumar Yadav', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313105.6.jpg' },
  { id: "tilak-varma", name: 'Tilak Varma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369451.6.jpg' },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313106.6.jpg' },
  { id: "virendra-sehwag", name: 'Virender Sehwag', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313107.6.jpg' },
  { id: "abhishek-sharma", name: 'Abhishek Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/380100/380121.6.jpg' },
  { id: "vaibhav-suryavanshi", name: 'Vaibhav Suryavanshi', role: 'BATTER', votes: 0, image: 'https://assets.iplt20.com/ipl/IPLHeadshot2025/28406.png' },
  { id: "yashasvi-jaiswal", name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/352400/352497.6.jpg' },
  { id: "kl-rahul-bat", name: 'KL Rahul', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313108.6.jpg' },
  { id: "sunil-gavaskar", name: 'Sunil Gavaskar', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313109.6.jpg' },
  { id: "vvs-laxman", name: 'VVS Laxman', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313110.6.jpg' },
  { id: "yuvraj-singh", name: 'Yuvraj Singh', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313111.6.jpg' },
  { id: "priyansh-arya", name: 'Priyansh Arya', role: 'BATTER', votes: 0, image: 'https://assets.iplt20.com/ipl/IPLHeadshot2025/21514.png' },
  { id: "sai-sudarshan", name: 'Sai Sudharsan', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/370600/370640.6.jpg' },
  { id: "devdutt-padikkal", name: 'Devdutt Padikkal', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313112.6.jpg' },
  { id: "rinku-singh", name: 'Rinku Singh', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369452.6.jpg' },
  { id: "ruturaj-gaikwad", name: 'Ruturaj Gaikwad', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313113.6.jpg' },
  // BOWLERS
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313114.6.jpg' },
  { id: "bhuvneshwar-kumar", name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313115.6.jpg' },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313116.6.jpg' },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313117.6.jpg' },
  { id: "prasidh-krishna", name: 'Prasidh Krishna', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369453.6.jpg' },
  { id: "kuldeep-yadav", name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313118.6.jpg' },
  { id: "ishant-sharma", name: 'Ishant Sharma', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313119.6.jpg' },
  { id: "umesh-yadav", name: 'Umesh Yadav', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313120.6.jpg' },
  { id: "harbhajan-singh", name: 'Harbhajan Singh', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313121.6.jpg' },
  { id: "yuzvendra-chahal", name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313122.6.jpg' },
  { id: "harshal-patel", name: 'Harshal Patel', role: 'BOWLER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369454.6.jpg' },
  // ALL-ROUNDERS
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg' },
  { id: "krunal-pandya", name: 'Krunal Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313124.6.jpg' },
  { id: "nitish-reddy", name: 'Nitish Reddy', role: 'ALL-ROUNDER', votes: 0, image: 'https://assets.iplt20.com/ipl/IPLHeadshot2025/28406.png' },
  { id: "kapil-dev", name: 'Kapil Dev', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313125.6.jpg' },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313126.6.jpg' },
  { id: "ravichandran-ashwin", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313127.6.jpg' },
  { id: "anil-kumble", name: 'Anil Kumble', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313128.6.jpg' },
  { id: "shivam-dube", name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369455.6.jpg' },
  { id: "axar-patel", name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313129.6.jpg' },
  // KEEPERS
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313131.6.jpg' },
  { id: "ishan-kishan", name: 'Ishan Kishan', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313132.6.jpg' },
  { id: "dinesh-karthik", name: 'Dinesh Karthik', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313133.6.jpg' },
  { id: "prabhsimran-singh", name: 'Prabhsimran Singh', role: 'KEEPER', votes: 0, image: 'https://assets.iplt20.com/ipl/IPLHeadshot2025/28406.png' },
  { id: "sanju-samson", name: 'Sanju Samson', role: 'KEEPER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313134.6.jpg' },
  // CAPTAINS
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg' },
  { id: "sachin-tendulkar-cap", name: 'Sachin Tendulkar', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg' },
  { id: "rahul-dravid-cap", name: 'Rahul Dravid', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313106.6.jpg' },
  { id: "kapil-dev-cap", name: 'Kapil Dev', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313125.6.jpg' },
  { id: "hardik-pandya-cap", name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg' },
  { id: "kl-rahul-cap", name: 'KL Rahul', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313108.6.jpg' },
  { id: "rishabh-pant-cap", name: 'Rishabh Pant', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313131.6.jpg' },
  { id: "shubman-gill-cap", name: 'Shubman Gill', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/352400/352496.6.jpg' },
  { id: "ravindra-jadeja-cap", name: 'Ravindra Jadeja', role: 'CAPTAIN', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313126.6.jpg' }
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
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
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
        const statsRef = ref(db, `stats`);
        const today = new Date().toISOString().split('T')[0];
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === today){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); update(userRef, {votesToday: 0, lastVoteDate: today}); }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
          } else { set(userRef, {votesToday: 0, lastVoteDate: today, streak: 0, badges: []}); }
        });
        onValue(statsRef, (snapshot) => { setTotalVotes(snapshot.val()?.totalVotes || 0); });
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
  const handleLogout = async () => { if(window.confirm("Are you sure you want logout?")) { await signOut(auth); setShowProfile(false); } };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };
  const handleShare = () => {
    const text = `Who's Your Favourite? ${battle[0]?.name} vs ${battle[1]?.name} Vote on CrickClash!`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'CrickClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Link Copied!"); }
  };

  const submitDebate = async () => {
    if(!user){ alert("Login required"); handleGoogleLogin(); return; }
    if(!selectedPlayer || reason.trim().length < 3) { alert("Select a player write a reason"); return; }
    const debateRef = push(ref(db, 'debates'));
    await set(debateRef, {
      id: debateRef.key, battleId: `battle-${battleNo}`, battlePlayers: `${battle[0]?.name} vs ${battle[1]?.name}`,
      player: selectedPlayer, reason: reason, user: user.displayName || "Anonymous", userId: user.uid,
      likes: 0, likedBy: [], comments: [], timestamp: Date.now()
    });
    setShowDebate(false); setReason(""); setSelectedPlayer("");
  };

  const submitComment = async (debateId) => {
    if(!user){ handleGoogleLogin(); return; }
    if(replyText.trim().length < 2) return;
    const debateRef = ref(db, `debates/${debateId}`);
    const snap = await get(debateRef); const debate = snap.val();
    const newComment = { id: Date.now(), user: user.displayName, text: replyText, timestamp: Date.now() };
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

  const handleVote = async (votedPlayerId) => {
    if(!user){
      alert("Google login required to vote");
      await signInWithPopup(auth, googleProvider);
      return;
    }
    if(votesToday >= DAILY_VOTE_LIMIT) return alert(`Roju ${DAILY_VOTE_LIMIT} vote maatrame!`);

    const votedPlayer = players.find(p => p.id === votedPlayerId);
    if(!votedPlayer) return;

    const today = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const statsRef = ref(db, `stats`);

    const newBadges = [...badges];
    if(votesToday === 0 && !badges.includes('First Vote')) newBadges.push('First Vote');

    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today, streak: streak + 1, badges: newBadges });
    const playerSnap = await get(playerRef);
    await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });
    const statsSnap = await get(statsRef);
    await update(statsRef, { totalVotes: (statsSnap.val()?.totalVotes || 0) + 1 });

    setVotesToday(votesToday + 1);
    setBadges(newBadges);
    setBattleNo(battleNo + 1);
    generateBattle(players, filter);
  };
    if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-orange-400">Clash</span></h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="relative">
            {user? (
              <button onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile)}} className="w-10 h-10 rounded-full bg-[#a8ff00] flex items-center justify-center text-black font-bold text-xl">
                {user.displayName?.[0] || 'U'}
              </button>
            ) : (
              <button onClick={handleGoogleLogin} className="bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold">Login</button>
            )}
            {user && showProfile && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl z-50">
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
              <div className="flex gap-2">
                {badges.includes('First Vote') && <span className="bg-[#a8ff00] text-black px-3 py-1 rounded-full text-sm font-bold">🏏 First Vote</span>}
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
                  <div className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                    <img src={battle[0].image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" alt={battle[0].name}/>
                    <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs font-bold">{battle[0].role}</span>
                    <h3 className="text-xl font-bold mt-3">{battle[0].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[0].votes || 0} votes</p>
                    <button onClick={() => handleVote(battle[0].id)} disabled={user && votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${!user? 'bg-blue-500' : votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
                      {!user? 'VOTE' : votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
                    </button>
                  </div>
                  <span className="text-3xl font-bold text-orange-400">VS</span>
                  <div className="bg-gradient-to-b from-[#4a1e5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                    <img src={battle[1].image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" alt={battle[1].name}/>
                    <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{battle[1].role}</span>
                    <h3 className="text-xl font-bold mt-3">{battle[1].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[1].votes || 0} votes</p>
                    <button onClick={() => handleVote(battle[1].id)} disabled={user && votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${!user? 'bg-blue-500' : votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
                      {!user? 'VOTE' : votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => user? setShowDebate(true) : handleGoogleLogin()} className="flex-1 bg-orange-500 text-black font-bold py-3 rounded-xl">
                    {user? '🔥 Debate' : '🔒 Login to Debate'}
                  </button>
                  <button onClick={handleShare} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">📤 Share</button>
                </div>
                <button onClick={handleSkip} className="bg-[#23232b] w-full py-3 rounded-xl font-bold mt-3">⏭️ Skip Battle</button>
              </div>
            ) : <p className="text-center">Loading Players...</p>}
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {Object.values(players.reduce((acc, player) => {
                if (acc[player.name]) { acc[player.name].votes += player.votes || 0; }
                else { acc[player.name] = {...player }; }
                return acc;
              }, {})).sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => {
                const percentage = totalVotes > 0? ((p.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                return (
                  <div key={p.name} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3">
                    <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                    <img src={p.image} className="w-12 h-12 rounded-full object-cover" alt={p.name}/>
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

        {/* DEBATE POPUP */}
        {showDebate && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#13131a] p-6 rounded-2xl w-full max-w-md border border-[#333] max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-white">Battle {battleNo} Debate 🔥</h3>

              {!user? (
                <div className="text-center">
                  <p className="mb-4 text-gray-400">Debate cheyadaniki login avvali</p>
                  <button onClick={handleGoogleLogin} className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg">LOGIN WITH GOOGLE</button>
                  <button onClick={()=>setShowDebate(false)} className="w-full mt-2 bg-[#23232b] py-2 rounded-xl font-bold">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="bg-[#0a0a0f] p-3 rounded-xl mb-4">
                    <p className="text-sm text-gray-400 mb-2">I support:</p>
                    <div className="flex gap-2 mb-2">
                      <button onClick={()=>setSelectedPlayer(battle[0]?.name)} className={`flex-1 p-2 rounded-lg text-sm font-bold ${selectedPlayer===battle[0]?.name? "bg-[#a8ff00] text-black" : "bg-[#23232b]"}`}>{battle[0]?.name}</button>
                      <button onClick={()=>setSelectedPlayer(battle[1]?.name)} className={`flex-1 p-2 rounded-lg text-sm font-bold ${selectedPlayer===battle[1]?.name? "bg-[#a8ff00] text-black" : "bg-[#23232b]"}`}>{battle[1]?.name}</button>
                    </div>
                    <textarea placeholder="Write your reason..." value={reason} onChange={(e)=>setReason(e.target.value)} className="w-full h-20 bg-[#13131a] text-white p-2 rounded-lg border-[#333] text-sm"/>
                    <button onClick={submitDebate} className="w-full mt-2 bg-[#a8ff00] text-black font-bold py-2 rounded-lg">Post Debate</button>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Community Debates:</p>
                  {debates.filter(d => d.battleId === `battle-${battleNo}`).map((d) => (
                    <div key={d.id} className="bg-[#0a0a0f] p-3 rounded-xl mb-3 border border-[#23232b]">
                      <div className="flex justify-between items-start"><b className="text-[#a8ff00] text-sm">{d.user}</b><span className="bg-orange-900 text-orange-300 px-2 py-0.5 rounded text-xs">{d.player}</span></div>
                      <p className="text-sm mt-1">{d.reason}</p>
                      <div className="flex gap-4 mt-2">
                        <button onClick={() => likeDebate(d.id)} className="text-xs text-gray-400">👍 {d.likes || 0}</button>
                        <button onClick={() => setReplyingTo(d.id)} className="text-xs text-gray-400">💬 Reply</button>
                      </div>
                      <div className="ml-3 mt-2 border-l-2 border-[#333] pl-2">
                        {(d.comments || []).map(c => (<div key={c.id} className="text-xs mb-1"><b className="text-[#a8ff00]">{c.user}:</b> {c.text}</div>))}
                        {replyingTo === d.id && (
                          <div className="flex gap-1 mt-2">
                            <input value={replyText} onChange={(e)=>setReplyText(e.target.value)} placeholder="Write reply..." className="flex-1 bg-[#13131a] text-xs p-1 rounded border border-[#333]"/>
                            <button onClick={()=>submitComment(d.id)} className="bg-[#a8ff00] text-black px-3 rounded text-xs font-bold">Send</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setShowDebate(false)} className="w-full mt-3 bg-[#23232b] py-2 rounded-xl font-bold">Close</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 CrickClash™ | A Production By ANESH</p>
      </footer>
    </div>
  );
                      }
