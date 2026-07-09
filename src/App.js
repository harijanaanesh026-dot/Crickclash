import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, push, get, serverTimestamp } from 'firebase/database';

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

// IMAGE PROXY - mobile lo block avvakunda
const getImg = (url) => `https://images.weserv.nl/?url=${url.replace('https://', '')}&w=200&h=200&fit=cover`;

const ALL_PLAYERS = [
  // BATTERS - 20
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Virat_Kohli_2023.jpg/320px-Virat_Kohli_2023.jpg' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/bc/Sachin_Tendulkar_at_MRF_Promotion_event.jpg/320px-Sachin_Tendulkar_at_MRF_Promotion_event.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Rohit_Sharma_2022.jpg/320px-Rohit_Sharma_2022.jpg' },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Shubman_Gill_2023.jpg/320px-Shubman_Gill_2023.jpg' },
  { id: "suryakumar-yadav", name: 'Suryakumar Yadav', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Suryakumar_Yadav_2022.jpg/320px-Suryakumar_Yadav_2022.jpg' },
  { id: "tilak-varma", name: 'Tilak Varma', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tilak_Varma_2023.jpg/320px-Tilak_Varma_2023.jpg' },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Rahul_Dravid_2022.jpg/320px-Rahul_Dravid_2022.jpg' },
  { id: "virendra-sehwag", name: 'Virender Sehwag', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Virender_Sehwag_2012.jpg/320px-Virender_Sehwag_2012.jpg' },
  { id: "abhishek-sharma", name: 'Abhishek Sharma', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Abhishek_Sharma_2024.jpg/320px-Abhishek_Sharma_2024.jpg' },
  { id: "vaibhav-suryavanshi", name: 'Vaibhav Suryavanshi', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "yashasvi-jaiswal", name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Yashasvi_Jaiswal_2023.jpg/320px-Yashasvi_Jaiswal_2023.jpg' },
  { id: "kl-rahul-bat", name: 'KL Rahul', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/KL_Rahul_2022.jpg/320px-KL_Rahul_2022.jpg' },
  { id: "sunil-gavaskar", name: 'Sunil Gavaskar', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sunil_Gavaskar_2013.jpg/320px-Sunil_Gavaskar_2013.jpg' },
  { id: "vvs-laxman", name: 'VVS Laxman', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/VVS_Laxman_2012.jpg/320px-VVS_Laxman_2012.jpg' },
  { id: "yuvraj-singh", name: 'Yuvraj Singh', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Yuvraj_Singh_2011.jpg/320px-Yuvraj_Singh_2011.jpg' },
  { id: "priyansh-arya", name: 'Priyansh Arya', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "sai-sudarshan", name: 'Sai Sudharsan', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "devdutt-padikkal", name: 'Devdutt Padikkal', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "rinku-singh", name: 'Rinku Singh', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "ruturaj-gaikwad", name: 'Ruturaj Gaikwad', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },

  // BOWLERS - 11
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Jasprit_Bumrah_2023.jpg/320px-Jasprit_Bumrah_2023.jpg' },
  { id: "bhuvneshwar-kumar", name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Bhuvneshwar_Kumar_2017.jpg/320px-Bhuvneshwar_Kumar_2017.jpg' },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Mohammed_Shami_2023.jpg/320px-Mohammed_Shami_2023.jpg' },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mohammed_Siraj_2023.jpg/320px-Mohammed_Siraj_2023.jpg' },
  { id: "prasidh-krishna", name: 'Prasidh Krishna', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "kuldeep-yadav", name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Kuldeep_Yadav_2019.jpg/320px-Kuldeep_Yadav_2019.jpg' },
  { id: "ishant-sharma", name: 'Ishant Sharma', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Ishant_Sharma_2018.jpg/320px-Ishant_Sharma_2018.jpg' },
  { id: "umesh-yadav", name: 'Umesh Yadav', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Umesh_Yadav_2018.jpg/320px-Umesh_Yadav_2018.jpg' },
  { id: "harbhajan-singh", name: 'Harbhajan Singh', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Harbhajan_Singh_2013.jpg/320px-Harbhajan_Singh_2013.jpg' },
  { id: "yuzvendra-chahal", name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4g/Yuzvendra_Chahal_2019.jpg/320px-Yuzvendra_Chahal_2019.jpg' },
  { id: "harshal-patel", name: 'Harshal Patel', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },

  // ALL-ROUNDERS - 9
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hardik_Pandya_2022.jpg/320px-Hardik_Pandya_2022.jpg' },
  { id: "krunal-pandya", name: 'Krunal Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Krunal_Pandya_2019.jpg/320px-Krunal_Pandya_2019.jpg' },
  { id: "nitish-reddy", name: 'Nitish Reddy', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "kapil-dev", name: 'Kapil Dev', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5h/Kapil_Dev_2018.jpg/320px-Kapil_Dev_2018.jpg' },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Ravindra_Jadeja_2022.jpg/320px-Ravindra_Jadeja_2022.jpg' },
  { id: "ravichandran-ashwin", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1h/Ravichandran_Ashwin_2023.jpg/320px-Ravichandran_Ashwin_2023.jpg' },
  { id: "anil-kumble", name: 'Anil Kumble', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2i/Anil_Kumble_2012.jpg/320px-Anil_Kumble_2012.jpg' },
  { id: "shivam-dube", name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "axar-patel", name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3j/Axar_Patel_2023.jpg/320px-Axar_Patel_2023.jpg' },

  // KEEPERS - 6
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/MS_Dhoni_2022.jpg/320px-MS_Dhoni_2022.jpg' },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Rishabh_Pant_2022.jpg/320px-Rishabh_Pant_2022.jpg' },
  { id: "ishan-kishan", name: 'Ishan Kishan', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8k/Ishan_Kishan_2023.jpg/320px-Ishan_Kishan_2023.jpg' },
  { id: "dinesh-karthik", name: 'Dinesh Karthik', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9l/Dinesh_Karthik_2019.jpg/320px-Dinesh_Karthik_2019.jpg' },
  { id: "prabhsimran-singh", name: 'Prabhsimran Singh', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cricket_generic.jpg/320px-Cricket_generic.jpg' },
  { id: "sanju-samson", name: 'Sanju Samson', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1m/Sanju_Samson_2023.jpg/320px-Sanju_Samson_2023.jpg' },

  // CAPTAINS - 11
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Virat_Kohli_2023.jpg/320px-Virat_Kohli_2023.jpg' },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Rohit_Sharma_2022.jpg/320px-Rohit_Sharma_2022.jpg' },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/MS_Dhoni_2022.jpg/320px-MS_Dhoni_2022.jpg' },
  { id: "sachin-tendulkar-cap", name: 'Sachin Tendulkar', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/bc/Sachin_Tendulkar_at_MRF_Promotion_event.jpg/320px-Sachin_Tendulkar_at_MRF_Promotion_event.jpg' },
  { id: "rahul-dravid-cap", name: 'Rahul Dravid', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Rahul_Dravid_2022.jpg/320px-Rahul_Dravid_2022.jpg' },
  { id: "kapil-dev-cap", name: 'Kapil Dev', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5h/Kapil_Dev_2018.jpg/320px-Kapil_Dev_2018.jpg' },
  { id: "hardik-pandya-cap", name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hardik_Pandya_2022.jpg/320px-Hardik_Pandya_2022.jpg' },
  { id: "kl-rahul-cap", name: 'KL Rahul', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/KL_Rahul_2022.jpg/320px-KL_Rahul_2022.jpg' },
  { id: "rishabh-pant-cap", name: 'Rishabh Pant', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Rishabh_Pant_2022.jpg/320px-Rishabh_Pant_2022.jpg' },
  { id: "shubman-gill-cap", name: 'Shubman Gill', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Shubman_Gill_2023.jpg/320px-Shubman_Gill_2023.jpg' },
  { id: "ravindra-jadeja-cap", name: 'Ravindra Jadeja', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Ravindra_Jadeja_2022.jpg/320px-Ravindra_Jadeja_2022.jpg' }
]
export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle'); // Battle, Rankings, Debate, Profile
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [todayTotalVotes, setTodayTotalVotes] = useState(0);
  const [badges, setBadges] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [debates, setDebates] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const generateBattle = useCallback((playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) { p2 = filtered[Math.floor(Math.random() * filtered.length)]; }
    setBattle([p1, p2]);
  }, [])

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout?")) { await signOut(auth); setShowProfile(false); } }
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); }
  const handleShare = () => { navigator.clipboard.writeText(`Vote: ${battle[0]?.name} vs ${battle[1]?.name} on CrickClash! ${window.location.href}`); alert("Link Copied!"); }

  const handleVote = async (votedPlayerId) => {
    if(!user || votesToday >= DAILY_VOTE_LIMIT) return;
    const today = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const statsRef = ref(db, `stats`);
    const newBadges = [...badges]; if(votesToday === 0 &&!badges.includes('First Vote')) newBadges.push('First Vote');
    const statsSnap = await get(statsRef);
    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today, streak: streak + 1, badges: newBadges });
    const playerSnap = await get(playerRef); await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });
    await update(statsRef, { todayTotalVotes: (statsSnap.val()?.todayTotalVotes || 0) + 1, lastResetDate: today });
    setVotesToday(votesToday + 1); setBadges(newBadges); setTimeout(() => handleSkip(), 800);
  }

  const postComment = async () => {
    if(!newComment.trim() ||!user) return;
    await push(ref(db, 'debates'), { text: newComment, userId: user.uid, userName: user.displayName, timestamp: serverTimestamp() });
    setNewComment("");
  }

  const sendMessage = async () => {
    if(!newMessage.trim() ||!activeChat) return;
    const chatId = [user.uid, activeChat.uid].sort().join('_');
    await push(ref(db, `chats/${chatId}`), { text: newMessage, sender: user.uid, timestamp: serverTimestamp() });
    setNewMessage("");
                                    }
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); setLoading(false);
      if(currentUser) {
        set(ref(db, `users/${currentUser.uid}/info`), { name: currentUser.displayName, photo: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}` })
        const userRef = ref(db, `users/${currentUser.uid}`);
        const statsRef = ref(db, `stats`);
        const debateRef = ref(db, 'debates');
        const usersRef = ref(db, 'users');

        onValue(userRef, (snapshot) => {
          const userData = snapshot.val(); const today = new Date().toISOString().split('T')[0];
          if(userData){
            if(userData.lastVoteDate === today){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); update(userRef, {votesToday: 0, lastVoteDate: today}); }
            setStreak(userData.streak || 0); setBadges(userData.badges || []);
          } else { set(userRef, {votesToday: 0, lastVoteDate: today, streak: 0, badges: []}); }
        });

        // DAILY RESET LOGIC
        onValue(statsRef, (snapshot) => {
          const statsData = snapshot.val() || {};
          const today = new Date().toISOString().split('T')[0];
          if(statsData.lastResetDate!== today) {
            update(statsRef, { todayTotalVotes: 0, lastResetDate: today });
            setTodayTotalVotes(0);
          } else { setTodayTotalVotes(statsData.todayTotalVotes || 0); }
        });

        onValue(debateRef, (snapshot) => { const data = snapshot.val(); setDebates(data? Object.keys(data).map(key => ({id: key,...data[key]})).reverse() : []); });
        onValue(usersRef, (snapshot) => { const data = snapshot.val(); setAllUsers(data? Object.keys(data).map(key => ({uid: key,...data[key].info})).filter(u => u.uid!== currentUser.uid) : []); });
      }
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 10) {
        const playersArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setPlayers(playersArray);
      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(playersRef, initialPlayers);
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle])

  useEffect(() => {
    if(!activeChat ||!user) return;
    const chatId = [user.uid, activeChat.uid].sort().join('_');
    onValue(ref(db, `chats/${chatId}`), (snapshot) => { const data = snapshot.val(); setChats(data? Object.keys(data).map(key => ({id: key,...data[key]})) : []); });
  }, [activeChat, user])
  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>

  if(!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl font-bold">Crick<span className="text-orange-400">Clash</span></h1>
        <p className="text-gray-400 mt-2 mb-10">The Ultimate Cricket Voting Platform</p>
        <button onClick={handleGoogleLogin} className="bg-white text-black px-8 py-4 rounded-full font-bold">Sign In with Google</button>
        <footer className="text-center mt-10 text-gray-500 text-sm"> © 2026 CrickClash™ | A Production By ANESH </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-orange-400">Clash</span></h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <button onClick={() => setTab('Profile')} className="w-10 h-10 rounded-full bg-[#a8ff00] overflow-hidden">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-full h-full object-cover"/>
          </button>
        </header>

        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm">Today's Total Votes - Resets 12AM</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{todayTotalVotes}</p>
        </div>
        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm">Your Votes Left</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday} / {DAILY_VOTE_LIMIT}</p>
        </div>

        <div className="flex justify-around border-b border-gray-800 mb-4 text-sm">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>🏆 Top</button>
          <button onClick={() => setTab('Debate')} className={`pb-2 font-bold ${tab === 'Debate'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>💬 Debate</button>
          <button onClick={() => setTab('Profile')} className={`pb-2 font-bold ${tab === 'Profile'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>👤 DM</button>
        </div>

        {tab === 'Battle' && battle[0] && battle[1] && (
          <div>
            <p className="text-center text-gray-400 mb-4">WHO DO YOU LIKE? <span className="text-[#a8ff00]">Battle {battleNo}</span></p>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                <img src={battle[0].image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-[#a8ff00]"/>
                <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs">{battle[0].role}</span>
                <h3 className="text-xl font-bold mt-3">{battle[0].name}</h3>
                <p className="text-green-400 text-sm">{battle[0].votes || 0} votes</p>
                <button onClick={() => handleVote(battle[0].id)} disabled={votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>VOTE</button>
              </div>
              <span className="text-3xl font-bold text-orange-400">VS</span>
              <div className="bg-gradient-to-b from-[#4a1e5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                <img src={battle[1].image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-[#a8ff00]"/>
                <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs">{battle[1].role}</span>
                <h3 className="text-xl font-bold mt-3">{battle[1].name}</h3>
                <p className="text-green-400 text-sm">{battle[1].votes || 0} votes</p>
                <button onClick={() => handleVote(battle[1].id)} disabled={votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>VOTE</button>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSkip} className="bg-[#23232b] w-1/2 py-3 rounded-xl font-bold">⏭️ Skip</button>
              <button onClick={handleShare} className="bg-[#23232b] w-1/2 py-3 rounded-xl font-bold">📤 Share</button>
            </div>
          </div>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {
              Object.values(
                players.reduce((acc, player) => {
                  if (acc[player.name]) {
                    acc[player.name].votes += player.votes || 0;
                  } else {
                    acc[player.name] = {...player };
                  }
                  return acc;
                }, {})
              )
             .sort((a,b) => (b.votes||0) - (a.votes||0))
             .slice(0,10)
             .map((p,i) => (
                <div key={p.name} className="bg-[#13131a] p-3 rounded-lg mb-2 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-orange-400">{i+1}</span>
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-full object-cover"/>
                    <span>{p.name}</span>
                  </div>
                  <span className="text-[#a8ff00] font-bold">{p.votes||0} votes</span>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'Debate' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">🔥 Hot Debate: Kohli vs Dhoni</h2>
            <div className="h-80 overflow-y-auto mb-4 space-y-3 bg-[#13131a] p-3 rounded-xl">
              {debates.length === 0 && <p className="text-gray-500 text-center">No comments yet. Be first!</p>}
              {debates.map(d => (
                <div key={d.id} className="bg-[#1A1A1A] p-3 rounded-xl">
                  <p className="font-bold text-sm text-[#a8ff00]">{d.userName}</p>
                  <p className="text-sm">{d.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Your opinion..." className="w-full bg-[#1A1A1A] rounded-full px-4 py-3"/>
              <button onClick={postComment} className="bg-[#a8ff00] text-black px-5 rounded-full font-bold">Post</button>
            </div>
          </div>
        )}

        {tab === 'Profile' && (
          <div>
            {!activeChat ? (
              <div>
                <h2 className="text-xl font-bold mb-4 text-center">👤 Users to DM</h2>
                {allUsers.map(u => (
                  <div key={u.uid} onClick={() => setActiveChat(u)} className="bg-[#13131a] p-3 rounded-lg mb-2 flex items-center gap-3 cursor-pointer hover:bg-[#222]">
                    <img src={u.photo} className="w-10 h-10 rounded-full"/>
                    <span>{u.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => setActiveChat(null)} className="text-sm mb-2">← Back</button>
                <h2 className="text-xl font-bold mb-4 text-center">Chat with {activeChat.name}</h2>
                <div className="h-80 overflow-y-auto mb-4 space-y-2 bg-[#13131a] p-3 rounded-xl">
                  {chats.map(c => (
                    <div key={c.id} className={`p-2 rounded-lg w-fit ${c.sender === user.uid ? 'bg-[#a8ff00] text-black ml-auto' : 'bg-[#1A1A1A]'}`}>
                      {c.text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Message..." className="w-full bg-[#1A1A1A] rounded-full px-4 py-3"/>
                  <button onClick={sendMessage} className="bg-[#a8ff00] text-black px-5 rounded-full font-bold">Send</button>
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="w-full mt-6 bg-red-600 py-3 rounded-xl font-bold">Logout</button>
          </div>
        )}

        <footer className="text-center mt-10 text-gray-500 text-sm"> © 2026 CrickClash™ | A Production By ANESH </footer>
      </div>
    </div>
  );
          }
