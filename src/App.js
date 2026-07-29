import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment } from 'firebase/database';
import html2canvas from 'html2canvas';

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
const WEEKLY_VOTE_LIMIT = 3;
const REFERRAL_BONUS_VOTE = 1;

// ============= 70 CRICKET PLAYERS =============
const CRICKET_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Virat_Kohli_during_the_India_vs_AUS_2020_ODI_series.jpg' },
  { id: "sachin-tendulkar", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Sachin_Tendulkar_at_MRF_Promotion_Event.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Rohit_Sharma_%2848579477202%29.jpg' },
  { id: "kl-rahul-bat", name: 'KL Rahul', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/KL_Rahul_2019.jpg' },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Shubman_Gill.jpg' },
  { id: "ms-dhoni-bat", name: 'MS Dhoni', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/MS_Dhoni_2019.jpg' },
  { id: "shreyas-iyer", name: 'Shreyas Iyer', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Shreyas_Iyer_2022.jpg' },
  { id: "yashasvi-jaiswal", name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0, image: 'https://ui-avatars.com/api/?name=Yashasvi+Jaiswal&background=a8ff00&color=000' },
  { id: "suresh-raina", name: 'Suresh Raina', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Suresh_Raina_2019.jpg' },
  { id: "yuvraj-singh-bat", name: 'Yuvraj Singh', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Yuvraj_Singh_2011.jpg' },
  { id: "sanju-samson-bat", name: 'Sanju Samson', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Sanju_Samson_2022.jpg' },
  { id: "rishabh-pant-bat", name: 'Rishabh Pant', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Rishabh_Pant_2022.jpg' },
  { id: "ishan-kishan-bat", name: 'Ishan Kishan', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Ishan_Kishan_2022.jpg' },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Rahul_Dravid_2011.jpg' },
  { id: "virendra-sehwag", name: 'Virendra Sehwag', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Virender_Sehwag_2011.jpg' },
  { id: "shikhar-dhawan", name: 'Shikhar Dhawan', role: 'BATTER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Shikhar_Dhawan_2019.jpg' },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Jasprit_Bumrah_2022.jpg' },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mohammed_Shami_2019.jpg' },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0, image: 'https://ui-avatars.com/api/?name=Mohammed+Siraj&background=a8ff00&color=000' },
  { id: "bhuvaneswar-kumar", name: 'Bhuvaneswar Kumar', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Bhuvneshwar_Kumar_2019.jpg' },
  { id: "yuzvendra-chahal", name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Yuzvendra_Chahal_2019.jpg' },
  { id: "ravindra-jadeja-bowl", name: 'Ravindra Jadeja', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Ravindra_Jadeja_2019.jpg' },
  { id: "ravichandran-ashwin-bowl", name: 'Ravichandran Ashwin', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Ravichandran_Ashwin_2019.jpg' },
  { id: "kuldeep-yadav", name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0, image: 'https://ui-avatars.com/api/?name=Kuldeep+Yadav&background=a8ff00&color=000' },
  { id: "arshdeep-singh", name: 'Arshdeep Singh', role: 'BOWLER', votes: 0, image: 'https://ui-avatars.com/api/?name=Arshdeep+Singh&background=a8ff00&color=000' },
  { id: "anil-kumble", name: 'Anil Kumble', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Anil_Kumble_2011.jpg' },
  { id: "harbhajan-singh", name: 'Harbhajan Singh', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Harbhajan_Singh_2011.jpg' },
  { id: "kapil-dev-bowl", name: 'Kapil Dev', role: 'BOWLER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Kapil_Dev_1983.jpg' },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Hardik_Pandya_2022.jpg' },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Ravindra_Jadeja_2019.jpg' },
  { id: "ravichandran-ashwin-ar", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Ravichandran_Ashwin_2019.jpg' },
  { id: "yuvraj-singh-ar", name: 'Yuvraj Singh', role: 'ALL-ROUNDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Yuvraj_Singh_2011.jpg' },
  { id: "axar-patel-ar", name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Axar+Patel&background=a8ff00&color=000' },
  { id: "washington-sundar-ar", name: 'Washington Sundar', role: 'ALL-ROUNDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Washington+Sundar&background=a8ff00&color=000' },
  { id: "shivam-dube-ar", name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Shivam+Dube&background=a8ff00&color=000' },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/MS_Dhoni_2019.jpg' },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Rishabh_Pant_2022.jpg' },
  { id: "kl-rahul-kp", name: 'KL Rahul', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/KL_Rahul_2019.jpg' },
  { id: "sanju-samson-kp", name: 'Sanju Samson', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Sanju_Samson_2022.jpg' },
  { id: "ishan-kishan-kp", name: 'Ishan Kishan', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Ishan_Kishan_2022.jpg' },
  { id: "dinesh-karthik-kp", name: 'Dinesh Karthik', role: 'KEEPER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Dinesh_Karthik_2019.jpg' },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Virat_Kohli_during_the_India_vs_AUS_2020_ODI_series.jpg' },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/MS_Dhoni_2019.jpg' },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Rohit_Sharma_%2848579477202%29.jpg' },
  { id: "hardik-pandya-cap", name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Hardik_Pandya_2022.jpg' },
  { id: "kapil-dev-cap", name: 'Kapil Dev', role: 'CAPTAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Kapil_Dev_1983.jpg' },
];

// ============= 40 FOOTBALL PLAYERS =============
const FOOTBALL_PLAYERS = [
  { id: "messi", name: 'Lionel Messi', role: 'FORWARD', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg' },
  { id: "ronaldo", name: 'Cristiano Ronaldo', role: 'FORWARD', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg' },
  { id: "mbappe", name: 'Kylian Mbappe', role: 'FORWARD', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Kylian_Mbapp%C3%A9_2019.jpg' },
  { id: "neymar", name: 'Neymar Jr', role: 'FORWARD', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Neymar_Jr_2018.jpg' },
  { id: "haaland", name: 'Erling Haaland', role: 'FORWARD', votes: 0, image: 'https://ui-avatars.com/api/?name=Erling+Haaland&background=a8ff00&color=000' },
  { id: "salah", name: 'Mohamed Salah', role: 'FORWARD', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Mohamed_Salah_2018.jpg' },
  { id: "lewandowski", name: 'Robert Lewandowski', role: 'FORWARD', votes: 0, image: 'https://ui-avatars.com/api/?name=Robert+Lewandowski&background=a8ff00&color=000' },
  { id: "vinicius", name: 'Vinicius Jr', role: 'FORWARD', votes: 0, image: 'https://ui-avatars.com/api/?name=Vinicius+Jr&background=a8ff00&color=000' },
  { id: "de-bruyne", name: 'Kevin De Bruyne', role: 'MIDFIELDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Kevin+De+Bruyne&background=a8ff00&color=000' },
  { id: "modric", name: 'Luka Modric', role: 'MIDFIELDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Luka_Modri%C4%87_2018.jpg' },
  { id: "bellingham", name: 'Jude Bellingham', role: 'MIDFIELDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Jude+Bellingham&background=a8ff00&color=000' },
  { id: "pedri", name: 'Pedri', role: 'MIDFIELDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Pedri&background=a8ff00&color=000' },
  { id: "kroos", name: 'Toni Kroos', role: 'MIDFIELDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Toni+Kroos&background=a8ff00&color=000' },
  { id: "rodri", name: 'Rodri', role: 'MIDFIELDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Rodri&background=a8ff00&color=000' },
  { id: "fernandez", name: 'Bruno Fernandes', role: 'MIDFIELDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Bruno+Fernandes&background=a8ff00&color=000' },
  { id: "ramos", name: 'Sergio Ramos', role: 'DEFENDER', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Sergio_Ramos_2018.jpg' },
  { id: "vvd", name: 'Virgil van Dijk', role: 'DEFENDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Virgil+van+Dijk&background=a8ff00&color=000' },
  { id: "dias", name: 'Ruben Dias', role: 'DEFENDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Ruben+Dias&background=a8ff00&color=000' },
  { id: "hakimi", name: 'Achraf Hakimi', role: 'DEFENDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Achraf+Hakimi&background=a8ff00&color=000' },
  { id: "trent", name: 'Trent Alexander-Arnold', role: 'DEFENDER', votes: 0, image: 'https://ui-avatars.com/api/?name=Trent+Arnold&background=a8ff00&color=000' },
  { id: "courtois", name: 'Thibaut Courtois', role: 'GOALKEEPER', votes: 0, image: 'https://ui-avatars.com/api/?name=Thibaut+Courtois&background=a8ff00&color=000' },
  { id: "ter-stegen", name: 'Marc-Andre ter Stegen', role: 'GOALKEEPER', votes: 0, image: 'https://ui-avatars.com/api/?name=Ter+Stegen&background=a8ff00&color=000' },
  { id: "alisson", name: 'Alisson Becker', role: 'GOALKEEPER', votes: 0, image: 'https://ui-avatars.com/api/?name=Alisson+Becker&background=a8ff00&color=000' },
  { id: "ederson", name: 'Ederson', role: 'GOALKEEPER', votes: 0, image: 'https://ui-avatars.com/api/?name=Ederson&background=a8ff00&color=000' },
];

// ============= 28 MOVIES PLAYERS =============
const MOVIES_PLAYERS = [
  { id: "prabhas", name: 'Prabhas', role: 'HERO', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Prabhas_2019.jpg' },
  { id: "jr-ntr", name: 'Jr NTR', role: 'HERO', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Jr_NTR_2022.jpg' },
  { id: "allu-arjun", name: 'Allu Arjun', role: 'HERO', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Allu_Arjun_2022.jpg' },
  { id: "ram-charan", name: 'Ram Charan', role: 'HERO', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Ram_Charan_2022.jpg' },
  { id: "pawan-kalyan", name: 'Pawan Kalyan', role: 'HERO', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Pawan_Kalyan_2019.jpg' },
  { id: "mahesh-babu", name: 'Mahesh Babu', role: 'HERO', votes: 0, image: 'https://ui-avatars.com/api/?name=Mahesh+Babu&background=a8ff00&color=000' },
  { id: "nani", name: 'Nani', role: 'HERO', votes: 0, image: 'https://ui-avatars.com/api/?name=Nani&background=a8ff00&color=000' },
  { id: "vijay", name: 'Thalapathy Vijay', role: 'HERO', votes: 0, image: 'https://ui-avatars.com/api/?name=Thalapathy+Vijay&background=a8ff00&color=000' },
  { id: "srk", name: 'Shah Rukh Khan', role: 'HERO', votes: 0, image: 'https://ui-avatars.com/api/?name=Shah+Rukh+Khan&background=a8ff00&color=000' },
  { id: "chiranjeevi", name: 'Chiranjeevi', role: 'HERO', votes: 0, image: 'https://ui-avatars.com/api/?name=Chiranjeevi&background=a8ff00&color=000' },
  { id: "prakash-raj", name: 'Prakash Raj', role: 'VILLAIN', votes: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Prakash_Raj_2019.jpg' },
  { id: "sonu-sood", name: 'Sonu Sood', role: 'VILLAIN', votes: 0, image: 'https://ui-avatars.com/api/?name=Sonu+Sood&background=a8ff00&color=000' },
  { id: "rana", name: 'Rana Daggubati', role: 'VILLAIN', votes: 0, image: 'https://ui-avatars.com/api/?name=Rana+Daggubati&background=a8ff00&color=000' },
  { id: "sudeep", name: 'Sudeep', role: 'VILLAIN', votes: 0, image: 'https://ui-avatars.com/api/?name=Sudeep&background=a8ff00&color=000' },
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
  const getWeekStart = () => { const now = new Date(); const day = now.getDay(); const diff = now.getDate() - day + (day === 0? -6 : 1); return new Date(now.setDate(diff)).toISOString().split('T')[0]; }
  const getWeekNumber = () => { const d = new Date(); d.setHours(0,0,0); d.setDate(d.getDate() + 4 - (d.getDay()||7)); return d.getFullYear() + '-W' + String(Math.ceil(((d - new Date(d.getFullYear(),0,1))/86400000 + 1)/7)).padStart(2,'0'); };

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
    await set(ref(db, `comments/${battleKey}/${commentKey}/replies/${time}`), { text: newReply, user: user.displayName, photo: user.photoURL, time: time });
    setNewReply(""); setReplyTo(null);
  };

  const handleVote = async (votedPlayerId) => {
    const weekStart = getWeekStart();
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    if(votesThisWeek[category] >= WEEKLY_VOTE_LIMIT || isVoting) return alert(`Ee week ${WEEKLY_VOTE_LIMIT} votes maatrame!`);
    setIsVoting(true); setVoteAnim(votedPlayerId); setTimeout(() => setVoteAnim(null), 500);
    const votedPlayer = ALL_DATA[category].find(p => p.id === votedPlayerId);
    const historyEntry = {battleNo, category, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: getToday()};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);
    const newBattleNo = battleNo + 1;

    await update(ref(db, `users/${user.uid}/${category}`), { votesThisWeek: increment(1), lastVoteWeek: weekStart, history: newHistory });
    await update(ref(db, `players/${category}/${votedPlayerId}`), { votes: increment(1) });
    await update(ref(db, `meta/${category}`), { totalVotes: increment(1), battleNo: newBattleNo });

    setTimeout(() => { setIsVoting(false); setBattleNo(newBattleNo); generateBattle(players, filter); }, 1000);
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
    } catch { alert("Screenshot fail"); }
  };

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout?")) { await signOut(auth); setShowProfile(false); } };
  useEffect(() => {
    checkAndResetWeekly();
    onValue(ref(db, `players/${category}`), (snapshot) => {
      const data = snapshot.val();
      const currentPlayers = ALL_DATA[category];
      if (data) {
        const playersArray = currentPlayers.map(p => ({...p, votes: data[p.id]?.votes || 0 }));
        setPlayers(playersArray);
        generateBattle(playersArray, filter);
        const sorted = [...playersArray].sort((a,b) => b.votes - a.votes);
        setTopPlayer(sorted[0]);
      } else {
        const initialPlayers = {};
        currentPlayers.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(ref(db, `players/${category}`), initialPlayers);
        set(ref(db, `meta/${category}`), { lastResetWeek: getWeekStart(), totalVotes: 0, battleNo: 1 });
      }
    });

    onValue(ref(db, `meta/${category}`), (snapshot) => {
      const metaData = snapshot.val();
      if (metaData) { setBattleNo(metaData.battleNo || 1); setTotalVotes(metaData.totalVotes || 0); }
    });

    const week = getWeekNumber();
    onValue(ref(db, `winners/${category}/${week}`), (snap) => {
      setWeeklyWinner(snap.exists()? snap.val() : null);
    });

    onAuthStateChanged(auth, (currentUser) => {
      const weekStart = getWeekStart();
      setUser(currentUser); setLoading(false);
      if(currentUser) {
        onValue(ref(db, `users/${currentUser.uid}/${category}`), (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            setVotesThisWeek(prev => ({...prev, [category]: userData.lastVoteWeek === weekStart? userData.votesThisWeek || 0 : 0}))
            setStreak(userData.streak || 0); setBadges(userData.badges || []); setBattleHistory(userData.history || []);
          }
        });
      } else { setVotesThisWeek({Cricket: 0, Football: 0, Movies: 0}); setStreak(0); setBadges([]); setBattleHistory([]); }
    });

    if(battle[0] && battle[1]) {
      const battleKey = getBattleKey();
      const unsubscribe = onValue(ref(db, `comments/${battleKey}`), (snap) => {
        const data = snap.val();
        if(data) {
          const arr = Object.entries(data).map(([key, val]) => ({key,...val}));
          setComments(arr.sort((a,b) => b.time - a.time));
        } else setComments([]);
      });
      return () => unsubscribe();
    }
  }, [category, battle, battleNo, checkAndResetWeekly, filter, generateBattle]);
  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
      <style>{`.vote-pop { animation: pop 0.5s ease; } @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }`}</style>

      {/* PLAYER DETAIL MODAL WITH PHOTO */}
      {selectedPlayer && (
        <div onClick={() => setSelectedPlayer(null)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm">
            <img src={selectedPlayer.image} className="w-24 h-24 rounded-full mx-auto border-4 border-[#a8ff00] object-cover" alt={selectedPlayer.name}/>
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
        {/* HEADER */}
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">FanClash</h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="relative">
            {user?
              <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" />
              :
              <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-full font-bold text-sm">Login</button>
            }
            {showProfile && user && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] rounded-xl shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName}</p></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Logout</button>
              </div>
            )}
          </div>
        </header>

        {/* CATEGORY TABS */}
        <div className="flex justify-center gap-2 mb-4 bg-[#13131a] p-1 rounded-2xl">
          {Object.keys(ALL_DATA).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${category === cat? 'bg-[#a8ff00] text-black' : 'text-gray-400'}`}>
              {cat === 'Cricket' && '🏏 '}{cat === 'Football' && '⚽ '}{cat === 'Movies' && '🎬 '}{cat}
            </button>
          ))}
        </div>

        {/* WEEKLY HEADER */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-2xl mb-3 text-center">
          <p className="text-sm font-bold">🔥 Weekly Fan Battle</p>
          <p className="text-lg font-bold">
            {category === 'Cricket' && 'Best Cricketer?'}
            {category === 'Football' && 'GOAT Football?'}
            {category === 'Movies' && 'King of Cinema?'}
          </p>
          <p className="text-xs">Reset in: {timeLeft}</p>
        </div>

        {/* WEEKLY WINNER */}
        {weeklyWinner && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-2xl mb-3 text-center">
            <p className="text-sm font-bold text-black">👑 {category} WEEKLY CHAMPION</p>
            <div className="flex items-center justify-center gap-2">
              <img src={weeklyWinner.image} className="w-8 h-8 rounded-full object-cover" alt={weeklyWinner.name}/>
              <p className="text-lg font-bold text-black">{weeklyWinner.name} - {weeklyWinner.votes} Votes</p>
            </div>
          </div>
        )}

        {/* VOTES CARD */}
        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm mb-2">This Week's Votes Left</p>
          <div className="grid grid-cols-3 gap-2">
            <div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesThisWeek.Cricket >= WEEKLY_VOTE_LIMIT? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{WEEKLY_VOTE_LIMIT - votesThisWeek.Cricket}</p><p className="text-xs">🏏</p></div>
            <div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesThisWeek.Football >= WEEKLY_VOTE_LIMIT? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{WEEKLY_VOTE_LIMIT - votesThisWeek.Football}</p><p className="text-xs">⚽</p></div>
            <div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesThisWeek.Movies >= WEEKLY_VOTE_LIMIT? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{WEEKLY_VOTE_LIMIT - votesThisWeek.Movies}</p><p className="text-xs">🎬</p></div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {/* BATTLE TAB */}
        {tab === 'Battle' && battle[0] && battle[1] && (
          <div>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            {/* ROLE FILTERS */}
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

            {/* BATTLE CARDS */}
            <div className="flex items-center justify-center gap-2">
              {[battle[0], battle[1]].map(p => (
                <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center cursor-pointer ${voteAnim === p.id? 'vote-pop' : ''}`}>
                  <img src={p.image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-[#a8ff00]" alt={p.name} />
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800">{p.role}</span>
                  <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                  <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                  <button onClick={(e) => {e.stopPropagation(); handleVote(p.id)}} disabled={isVoting || votesThisWeek[category] >= WEEKLY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesThisWeek[category] >= WEEKLY_VOTE_LIMIT? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>
                    {isVoting? 'VOTING...' : votesThisWeek[category] >= WEEKLY_VOTE_LIMIT? 'VOTED' : 'VOTE'}
                  </button>
                </div>
              ))}
            </div>

            {/* DEBATE ZONE WITH REPLY */}
            <div className="bg-[#13131a] p-4 rounded-2xl mt-4">
              <h3 className="font-bold mb-3">💬 Debate Zone</h3>
              <div className="flex gap-2 mb-3">
                <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Who will win?" className="w-full bg-[#0a0a0f] p-2 rounded-lg outline-none" />
                <button onClick={handlePostComment} className="bg-[#a8ff00] text-black px-4 rounded-lg font-bold">Post</button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet</p>}
                {comments.map((c) => {
                  const likeCount = c.likes? Object.keys(c.likes).length : 0;
                  return (
                    <div key={c.key} className="bg-[#0a0a0f] p-3 rounded-lg">
                      <div className="flex gap-2">
                        <img src={c.photo} className="w-8 h-8 rounded-full" alt="user"/>
                        <div className="flex-1">
                          <p className="font-bold text-xs">{c.user}</p>
                          <p className="text-sm">{c.text}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400">
                            <button onClick={() => handleLikeComment(c.key)}>🤍 {likeCount}</button>
                            <button onClick={() => setReplyTo(c.key)}>↩️ Reply</button>
                          </div>
                        </div>
                      </div>
                      {c.replies && Object.entries(c.replies).map(([rk, r]) => (
                        <div key={rk} className="flex gap-2 ml-6 mt-2">
                          <img src={r.photo} className="w-6 h-6 rounded-full" alt="user"/>
                          <div><p className="font-bold text-xs">{r.user}</p><p className="text-sm">{r.text}</p></div>
                        </div>
                      ))}
                      {replyTo === c.key && (
                        <div className="flex gap-2 mt-2 ml-6">
                          <input value={newReply} onChange={e => setNewReply(e.target.value)} placeholder="Reply..." className="w-full bg-[#13131a] p-2 rounded-lg text-sm" />
                          <button onClick={() => handlePostReply(c.key)} className="bg-[#a8ff00] text-black px-3 rounded-lg text-sm">Send</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowResultCard(true)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-bold">📸 Result</button>
            </div>
          </div>
        )}

        {/* RANKINGS TAB */}
        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 {category}</h2>
            {players.sort((a,b) => b.votes - a.votes).slice(0,10).map((p,i) => (
              <div key={p.id} onClick={() => setSelectedPlayer(p)} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3 cursor-pointer">
                <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                <img src={p.image} className="w-12 h-12 rounded-full object-cover" alt={p.name} />
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.votes||0} votes • {p.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'History' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4">📜 Your {category} History</h2>
            {!user? <p className="text-gray-500 text-center">Login required</p> : battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (
              <div key={i} className="bg-[#13131a] p-3 rounded-xl">
                <p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p>
                <p className="font-bold">{h.players[0]} vs {h.players[1]}</p>
                <p className="text-sm text-[#a8ff00]">Voted: {h.votedFor}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESULT CARD MODAL */}
      {showResultCard && battle[0] && battle[1] && (
        <div onClick={() => setShowResultCard(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} id="result-card" className="bg-gradient-to-br from-[#1e3a5f] to-[#0a0e1a] p-6 rounded-3xl w-full max-w-sm border-2 border-[#a8ff00]">
            <h2 className="text-center text-2xl font-bold mb-1">FanClash {category}</h2>
            <p className="text-center text-gray-400 text-sm mb-4">Battle #{battleNo-1}</p>
            <div className="flex gap-3 items-center mb-4">
              {[battle[0], battle[1]].map(p => (
                <div key={p.id} className="flex-1 text-center p-3 rounded-2xl bg-[#13131a]">
                  <img src={p.image} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" alt={p.name} />
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-2xl font-bold text-[#a8ff00]">{p.votes}</p>
                </div>
              ))}
            </div>
            <button onClick={downloadResultCard} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-bold">📸 Download Image</button>
            <button onClick={() => setShowResultCard(false)} className="w-full bg-[#23232b] py-2 rounded-xl font-bold mt-2">Close</button>
          </div>
        </div>
      )}

      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-white font-bold">FanClash™</span> | By <span className="text-white font-bold">ANESH</span></p>
      </footer>
    </div>
  );
        }
