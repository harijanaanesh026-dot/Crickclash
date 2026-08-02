import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment } from 'firebase/database';
import { Home, Search, PlusSquare, Heart, User, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

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
const DAILY_VOTE_LIMIT = 6; // rojuki 6 votes 
const VOTE_COOLDOWN_HOURS = 4; // 4 hours ki 1 vote
const REFERRAL_BONUS_VOTE = 1; // NEW
// ============= CRICKET PLAYERS - 70 =============
// ============= CRICKET PLAYERS - 70 =============
const CRICKET_PLAYERS = [
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
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0 },
  { id: "jitesh-sharma-kp", name: 'Jitesh Sharma', role: 'KEEPER', votes: 0 },
  { id: "dhruv-jurel-kp", name: 'Dhruv Jurel', role: 'KEEPER', votes: 0 },
  { id: "sanju-samson-kp", name: 'Sanju Samson', role: 'KEEPER', votes: 0 },
  { id: "kl-rahul-kp", name: 'KL Rahul', role: 'KEEPER', votes: 0 },
  { id: "ishan-kishan-kp", name: 'Ishan Kishan', role: 'KEEPER', votes: 0 },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
  { id: "dinesh-karthik-kp", name: 'Dinesh Karthik', role: 'KEEPER', votes: 0 },
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0 },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0 },
  { id: "rajat-patidar-cap", name: 'Rajat Patidar', role: 'CAPTAIN', votes: 0 },
  { id: "hardik-pandya-cap", name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0 },
  { id: "shubman-gill-cap", name: 'Shubman Gill', role: 'CAPTAIN', votes: 0 },
  { id: "ruturaj-gaikwad-cap", name: 'Ruturaj Gaikwad', role: 'CAPTAIN', votes: 0 },
  { id: "kapil-dev-cap", name: 'Kapil Dev', role: 'CAPTAIN', votes: 0 },
];

// ============= FOOTBALL =============
const FOOTBALL_PLAYERS = [
  // ===== FORWARDS - 12 =====
  { id: "ronaldo", name: 'Cristiano Ronaldo', role: 'FORWARD', votes: 0 },
  { id: "messi", name: 'Lionel Messi', role: 'FORWARD', votes: 0 },
  { id: "mbappe", name: 'Kylian Mbappe', role: 'FORWARD', votes: 0 },
  { id: "neymar", name: 'Neymar Jr', role: 'FORWARD', votes: 0 },
  { id: "haaland", name: 'Erling Haaland', role: 'FORWARD', votes: 0 },
  { id: "vinicius", name: 'Vinicius Jr', role: 'FORWARD', votes: 0 },
  { id: "salah", name: 'Mohamed Salah', role: 'FORWARD', votes: 0 },
  { id: "lewandowski", name: 'Robert Lewandowski', role: 'FORWARD', votes: 0 },
  { id: "kane", name: 'Harry Kane', role: 'FORWARD', votes: 0 },
  { id: "benzema", name: 'Karim Benzema', role: 'FORWARD', votes: 0 },
  { id: "mane", name: 'Sadio Mane', role: 'FORWARD', votes: 0 },
  { id: "rashford", name: 'Marcus Rashford', role: 'FORWARD', votes: 0 },

  // ===== MIDFIELDERS - 14 =====
  { id: "de-bruyne", name: 'Kevin De Bruyne', role: 'MIDFIELDER', votes: 0 },
  { id: "modric", name: 'Luka Modric', role: 'MIDFIELDER', votes: 0 },
  { id: "bellingham", name: 'Jude Bellingham', role: 'MIDFIELDER', votes: 0 },
  { id: "pedri", name: 'Pedri', role: 'MIDFIELDER', votes: 0 },
  { id: "kroos", name: 'Toni Kroos', role: 'MIDFIELDER', votes: 0 },
  { id: "rodri", name: 'Rodri', role: 'MIDFIELDER', votes: 0 },
  { id: "valverde", name: 'Federico Valverde', role: 'MIDFIELDER', votes: 0 },
  { id: "fernandez", name: 'Bruno Fernandes', role: 'MIDFIELDER', votes: 0 },
  { id: "griezmann", name: 'Antoine Griezmann', role: 'MIDFIELDER', votes: 0 },
  { id: "casemiro", name: 'Casemiro', role: 'MIDFIELDER', votes: 0 },
  { id: "kamavinga", name: 'Eduardo Camavinga', role: 'MIDFIELDER', votes: 0 },
  { id: "musiala", name: 'Jamal Musiala', role: 'MIDFIELDER', votes: 0 },
  { id: "foden", name: 'Phil Foden', role: 'MIDFIELDER', votes: 0 },
  { id: "palmer", name: 'Cole Palmer', role: 'MIDFIELDER', votes: 0 },

  // ===== DEFENDERS - 10 =====
  { id: "ramos", name: 'Sergio Ramos', role: 'DEFENDER', votes: 0 },
  { id: "vvd", name: 'Virgil van Dijk', role: 'DEFENDER', votes: 0 },
  { id: "dias", name: 'Ruben Dias', role: 'DEFENDER', votes: 0 },
  { id: "hakimi", name: 'Achraf Hakimi', role: 'DEFENDER', votes: 0 },
  { id: "trent", name: 'Trent Alexander-Arnold', role: 'DEFENDER', votes: 0 },
  { id: "robertson", name: 'Andrew Robertson', role: 'DEFENDER', votes: 0 },
  { id: "alaba", name: 'David Alaba', role: 'DEFENDER', votes: 0 },
  { id: "rudiger", name: 'Antonio Rudiger', role: 'DEFENDER', votes: 0 },
  { id: "marquinhos", name: 'Marquinhos', role: 'DEFENDER', votes: 0 },
  { id: "araujo", name: 'Ronald Araujo', role: 'DEFENDER', votes: 0 },

  // ===== GOALKEEPERS - 4 =====
  { id: "courtois", name: 'Thibaut Courtois', role: 'GOALKEEPER', votes: 0 },
  { id: "ter-stegen", name: 'Marc-Andre ter Stegen', role: 'GOALKEEPER', votes: 0 },
  { id: "alisson", name: 'Alisson Becker', role: 'GOALKEEPER', votes: 0 },
  { id: "ederson", name: 'Ederson', role: 'GOALKEEPER', votes: 0 },
];

// ============= MOVIES =============
const MOVIES_PLAYERS = [
  { id: "jr ntr", name: 'Jr NTR', role: 'HERO', votes: 0 },
  { id: "prabhas", name: 'Prabhas', role: 'HERO', votes: 0 },
  { id: "allu-arjun", name: 'Allu Arjun', role: 'HERO', votes: 0 },
  { id: "ram-charan", name: 'Ram Charan', role: 'HERO', votes: 0 },
  { id: "pawan-kalyan", name: 'Pawan Kalyan', role: 'HERO', votes: 0 },
  { id: "mahesh-babu", name: 'Mahesh Babu', role: 'HERO', votes: 0 },
  { id: "nani", name: 'Nani', role: 'HERO', votes: 0 },
  { id: "ravi-teja", name: 'Ravi Teja', role: 'HERO', votes: 0 },
  { id: "ram", name: 'Ram', role: 'HERO', votes: 0 },
  { id: "chiranjeevi", name: 'Chiranjeevi', role: 'HERO', votes: 0 },
  { id: "nagarjuna", name: 'Nagarjuna', role: 'HERO', votes: 0 },
  { id: "balakrishna", name: 'Balakrishna', role: 'HERO', votes: 0 },
  { id: "venkatesh", name: 'Venkatesh', role: 'HERO', votes: 0 },
  { id: "vijay-devarakonda", name: 'Vijay Devarakonda', role: 'HERO', votes: 0 },
  { id: "sai-dharam-tej", name: 'Sai Dharam Tej', role: 'HERO', votes: 0 },
  { id: "siddu", name: 'Siddu', role: 'HERO', votes: 0 },
  { id: "naga-chaitanya", name: 'Naga Chaitanya', role: 'HERO', votes: 0 },
  { id: "akhil", name: 'Akhil', role: 'HERO', votes: 0 },
  { id: "prakash-raj", name: 'Prakash Raj', role: 'VILLAIN', votes: 0 },
  { id: "sonu-sood", name: 'Sonu Sood', role: 'VILLAIN', votes: 0 },
  { id: "rana", name: 'Rana Daggubati', role: 'VILLAIN', votes: 0 },
  { id: "Gopichand", name: 'Gopichand', role: 'VILLAIN', votes: 0 },
  { id: "sudeep", name: 'Sudeep', role: 'VILLAIN', votes: 0 },
  { id: "vijay-sethupathi", name: 'Vijay Sethupathi', role: 'VILLAIN', votes: 0 },
  { id: "fahadh-faasl", name: 'Fahadh Faasil', role: 'VILLAIN', votes: 0 },
  { id: "jagapathi-babu", name: 'Jagapathi Babu', role: 'VILLAIN', votes: 0 },
  { id: "srikanth", name: 'SriKanth', role: 'VILLAIN', votes: 0 },
  { id: "Sunil", name: 'Sunil', role: 'VILLAIN', votes: 0 },
];

const ALL_DATA = { Cricket: CRICKET_PLAYERS, Football: FOOTBALL_PLAYERS, Movies: MOVIES_PLAYERS };

// ============= HELPERS =============
const getToday = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  return ist.toISOString().split('T')[0];
};
const getTimeUntilNextVote = (lastVoteTime) => {
  if (!lastVoteTime) return 0;
  const nextVoteTime = new Date(lastVoteTime).getTime() + VOTE_COOLDOWN_HOURS * 60 * 60 * 1000;
  const diff = nextVoteTime - Date.now();
  return diff > 0? diff : 0;
};

export default function FanClashIG() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Cricket');
  const [players, setPlayers] = useState(CRICKET_PLAYERS);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Home'); // Instagram tabs
  const [votesToday, setVotesToday] = useState({Cricket: 0, Football: 0, Movies: 0});
  const [totalVotes, setTotalVotes] = useState(0);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [voteAnim, setVoteAnim] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [streak, setStreak] = useState(0);
  const [topFans, setTopFans] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showStory, setShowStory] = useState(false);
  const touchStartX = useRef(0);

  const getBattleKey = () => battle[0] && battle[1]? `${category}-${battle[0].id}-${battle[1].id}-B${battleNo}` : null;
  const canVoteNow = () => {
    const timeLeft = getTimeUntilNextVote(user?.[`${category}LastVoteTime`]);
    const votesUsed = votesToday[category];
    return votesUsed < DAILY_VOTE_LIMIT && timeLeft === 0;
  }

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

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => {
    if(window.confirm("Logout?")) {
      await signOut(auth);
      setUser(null);
      setVotesToday({Cricket: 0, Football: 0, Movies: 0});
    }
  };

  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    const timeLeftMs = getTimeUntilNextVote(user?.[`${category}LastVoteTime`]);
    if(votesToday[category] >= DAILY_VOTE_LIMIT || timeLeftMs > 0 || isVoting) {
      const mins = Math.ceil(timeLeftMs / 1000 / 60);
      return alert(`Next vote in ${Math.floor(mins/60)}h ${mins%60}m`);
    }
    setIsVoting(true); setVoteAnim(votedPlayerId); setTimeout(() => setVoteAnim(null), 500);
    const today = getToday();
    const votedPlayer = ALL_DATA[category].find(p => p.id === votedPlayerId);
    const historyEntry = {battleNo, category, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 20);
    const newBattleNo = battleNo + 1;
    let newBadges = [...badges];
    if(votesToday[category] === 0 &&!newBadges.includes(`First ${category} Vote`)) newBadges.push(`First ${category} Vote`);

    await update(ref(db, `users/${user.uid}/${category}`), { votesToday: increment(1), lastVoteTime: Date.now(), badges: newBadges, history: newHistory });
    await update(ref(db, `players/${category}/${votedPlayerId}`), { votes: increment(1) });
    await update(ref(db, `meta/${category}`), { totalVotes: increment(1) });
    setBattleNo(newBattleNo);
    setTimeout(() => { setIsVoting(false); }, 500);
  };

  const handleSkip = async () => {
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    const newBattleNo = battleNo + 1;
    setBattleNo(newBattleNo);
    generateBattle(players, filter);
  };

  const handlePostComment = async () => {
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    if(!newComment.trim() ||!battle[0] ||!battle[1]) return;
    const time = Date.now();
    const battleKey = getBattleKey();
    await set(ref(db, `comments/${battleKey}/${time}`), { text: newComment, user: user.displayName, photo: user.photoURL, time: time, key: time, likes: {} });
    setNewComment("");
  };

  const handleLikeComment = async (commentKey) => {
    if(!user) return alert("Login required");
    const battleKey = getBattleKey();
    const likeRef = ref(db, `comments/${battleKey}/${commentKey}/likes/${user.uid}`);
    const snap = await get(likeRef);
    if(snap.exists()){ await remove(likeRef); } else { await set(likeRef, true); }
  };

  // ====== USEEFFECTS ======
  useEffect(() => {
    loadData();
    const metaUnsub = onValue(ref(db, `meta/${category}`), (snapshot) => {
      const metaData = snapshot.val();
      if (metaData) { setTotalVotes(metaData.totalVotes || 0); }
    });

    // FIRST TIME MATRAM BATTLE SET
    if(!battle[0] ||!battle[1]) { generateBattle(players, filter); }

    const playersUnsub = onValue(ref(db, `players/${category}`), (snapshot) => {
      const data = snapshot.val();
      const currentPlayers = ALL_DATA[category];
      if (data) {
        // Votes matrame update chey, battle maaradu
        setPlayers(prev => currentPlayers.map(p => ({...p, votes: data[p.id]?.votes || prev.find(x => x.id === p.id)?.votes || 0 })));
      } else {
        const initialPlayers = {};
        currentPlayers.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(ref(db, `players/${category}`), initialPlayers);
        set(ref(db, `meta/${category}`), { totalVotes: 0 });
      }
    });
    return () => { metaUnsub(); playersUnsub(); }
  }, [category, user]);

  useEffect(() => {
    generateBattle(players, filter);
  }, [filter, category, generateBattle]);

  useEffect(() => {
    setLoading(true);
    const authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(false);
      if(currentUser) {
        const today = getToday();
        const userSnap = await get(ref(db, `users/${currentUser.uid}`));
        const userData = userSnap.val() || {};
        if(userData.lastReset!== today) {
          await update(ref(db, `users/${currentUser.uid}`), {
            Cricket: { votesToday: 0, lastVoteTime: 0 },
            Football: { votesToday: 0, lastVoteTime: 0 },
            Movies: { votesToday: 0, lastVoteTime: 0 },
            lastReset: today
          })
        }
        setUser(currentUser);
        setStreak(userData.streak || 0);
        setVotesToday({ Cricket: userData.Cricket?.votesToday || 0, Football: userData.Football?.votesToday || 0, Movies: userData.Movies?.votesToday || 0 });
        setUser(prev => ({...prev, CricketLastVoteTime: userData.Cricket?.lastVoteTime, FootballLastVoteTime: userData.Football?.lastVoteTime, MoviesLastVoteTime: userData.Movies?.lastVoteTime}));
      } else {
        setUser(null);
        setVotesToday({Cricket: 0, Football: 0, Movies: 0});
      }
    });
    return () => authUnsub();
  }, [category]);

  useEffect(() => {
    if(!battle[0] ||!battle[1]) return;
    const battleKey = getBattleKey();
    if(!battleKey) return;
    const unsubscribe = onValue(ref(db, `comments/${battleKey}`), (snap) => {
      const data = snap.val();
      setComments(data? Object.values(data).sort((a,b) => b.time - a.time) : []);
    });
    return () => unsubscribe();
  }, [battle, battleNo, category]);

  const loadData = async () => {}

  if(loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <style>{`@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }.vote-pop { animation: pop 0.3s ease; } body{background:#000}`}</style>

      {/* INSTAGRAM HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-40">
        <div className="w-full max-w-2xl mx-auto flex justify-between items-center p-3">
          <h1 className="text-2xl font-bold font-serif">FanClash</h1>
          <div className="flex gap-4">
            <MessageCircle size={24} onClick={() => alert("DM coming soon")} />
            {user? <img src={user.photoURL} onClick={() => setShowProfile(true)} className="w-7 h-7 rounded-full border-white" /> : <button onClick={handleGoogleLogin} className="bg-blue-500 px-3 py-1 rounded-lg text-sm font-bold">Login</button>}
          </div>
        </div>
      </div>

      {/* CATEGORY STORIES */}
      <div className="w-full max-w-2xl mx-auto pt-16 pb-2 px-2 border-b border-gray-800">
        <div className="flex gap-4 overflow-x-auto">
          {Object.keys(ALL_DATA).map(cat => (
            <div key={cat} onClick={() => setCategory(cat)} className="flex flex-col items-center gap-1 cursor-pointer">
              <div className={`w-16 h-16 rounded-full p-[2px] ${category === cat? 'bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500' : 'bg-gray-700'}`}>
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl">
                  {cat === 'Cricket' && '🏏'}{cat === 'Football' && '⚽'}{cat === 'Movies' && '🎬'}
                </div>
              </div>
              <p className="text-xs">{cat}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-2xl mx-auto">

        {/* BATTLE POST - INSTAGRAM STYLE */}
        {tab === 'Home' && battle[0] && battle[1] && (
          <div className="bg-black border-b border-gray-800 mb-4">
            {/* POST HEADER */}
            <div className="flex items-center p-3 gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 p-[2px]">
                <img src="https://i.pravatar.cc/40" className="w-full h-full rounded-full"/>
              </div>
              <div>
                <p className="font-bold text-sm">FanClash_Official</p>
                <p className="text-xs text-gray-400">Battle #{battleNo} • {category}</p>
              </div>
              <MoreHorizontal size={20} className="ml-auto" />
            </div>

            {/* BATTLE CARD */}
            <div className="px-2">
              <div className="flex gap-2">
                {[battle[0], battle[1]].map(p => {
                  const total = battle[0].votes + battle[1].votes;
                  const percent = total > 0? ((p.votes / total) * 100).toFixed(0) : 50;
                  return (
                    <div key={p.id} className={`bg-[#121212] rounded-xl w-1/2 p-3 text-center ${voteAnim === p.id? 'vote-pop' : ''}`}>
                      <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-gradient-to-r from-yellow-400 to-pink-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl font-bold">{p.name[0]}</div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-800">{p.role}</span>
                      <h3 className="text-lg font-bold mt-2">{p.name}</h3>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-pink-500 h-1.5 rounded-full" style={{width: `${percent}%`}}></div>
                      </div>
                      <p className="text-yellow-400 font-bold text-xs mt-1">{p.votes || 0} votes</p>
                      <button
                        onClick={() => handleVote(p.id)}
                        disabled={isVoting || (user &&!canVoteNow())}
                        className={`w-full py-2 rounded-lg font-bold mt-2 text-sm ${isVoting || (user &&!canVoteNow())? 'bg-gray-700' : 'bg-blue-500'}`}
                      >
                        {isVoting? 'VOTING...' : user &&!canVoteNow()? `WAIT` : 'VOTE'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* POST ACTIONS */}
            <div className="flex items-center p-3 gap-4">
              <Heart size={24} />
              <MessageCircle size={24} />
              <Send size={24} />
              <Bookmark size={24} className="ml-auto" />
            </div>

            {/* LIKES + CAPTION */}
            <div className="px-3">
              <p className="font-bold text-sm">{totalVotes} votes</p>
              <p className="text-sm mt-1"><span className="font-bold">FanClash_Official</span> Who will win? {battle[0].name} vs {battle[1].name} ⚔️</p>
              <p onClick={() => setTab('Comments')} className="text-gray-400 text-sm mt-1">View all {comments.length} comments</p>
            </div>

            {/* COMMENT INPUT */}
            <div className="flex items-center gap-2 p-3">
              <img src={user?.photoURL || "https://i.pravatar.cc/30"} className="w-7 h-7 rounded-full"/>
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-transparent text-sm outline-none"/>
              <button onClick={handlePostComment} className="text-blue-500 font-bold text-sm">Post</button>
            </div>

            <div className="flex gap-2 px-3 pb-3">
              <button onClick={handleSkip} className="flex-1 bg-gray-800 py-2 rounded-lg font-bold text-sm">⏭️ Skip</button>
              <button onClick={() => setShowResultCard(true)} className="flex-1 bg-gradient-to-r from-yellow-400 to-pink-500 text-black py-2 rounded-lg font-bold text-sm">📸 Result</button>
            </div>
          </div>
        )}

                      {/* RANKINGS TAB */}
        {tab === 'Rankings' && (
          <div className="p-3">
            <h2 className="text-xl font-bold mb-4">🏆 Top {category} Players</h2>
            {players.sort((a,b) => b.votes - a.votes).slice(0,10).map((p,i) => {
                const percentage = totalVotes > 0? ((p.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2">
                    <span className="font-bold text-gray-400 w-6">#{i+1}</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold">{p.name[0]}</div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.votes||0} votes • {percentage}%</p>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'Profile' && user && (
          <div className="p-3">
            <div className="flex items-center gap-4 mb-4">
              <img src={user.photoURL} className="w-20 h-20 rounded-full"/>
              <div>
                <p className="font-bold text-lg">{user.displayName}</p>
                <p className="text-gray-400 text-sm">@{user.displayName.toLowerCase().replace(' ','')}</p>
              </div>
            </div>
            <div className="flex justify-around text-center mb-4">
              <div><p className="font-bold">{followers.length}</p><p className="text-xs text-gray-400">Followers</p></div>
              <div><p className="font-bold">{following.length}</p><p className="text-xs text-gray-400">Following</p></div>
              <div><p className="font-bold">{streak}</p><p className="text-xs text-gray-400">Streak</p></div>
            </div>
            <button onClick={handleLogout} className="w-full bg-red-600 py-2 rounded-lg font-bold">Logout</button>
          </div>
        )}

      </div>

      {/* RESULT CARD MODAL */}
      {showResultCard && battle[0] && battle[1] && (
        <div onClick={() => setShowResultCard(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#121212] p-6 rounded-3xl w-full max-w-sm border-gray-800">
            <h2 className="text-center text-xl font-bold mb-4">Battle #{battleNo-1} Result</h2>
            <div className="flex gap-3 items-center mb-4">{[battle[0], battle[1]].map(p => {const total = battle[0].votes + battle[1].votes; const percent = total > 0? ((p.votes / total) * 100).toFixed(0) : 50; return (<div key={p.id} className="flex-1 text-center p-3 rounded-2xl bg-black"><div className="w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center text-2xl font-bold">{p.name[0]}</div><p className="font-bold text-sm">{p.name}</p><p className="text-2xl font-bold text-yellow-400">{percent}%</p></div>)})}</div>
            <button onClick={() => setShowResultCard(false)} className="w-full bg-gray-800 py-2 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}

      {/* INSTAGRAM BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40">
        <div className="w-full max-w-2xl mx-auto flex justify-around items-center h-14">
          <Home size={26} onClick={() => setTab('Home')} className={tab === 'Home'? 'text-white' : 'text-gray-500'} />
          <Search size={26} onClick={() => setTab('Rankings')} className={tab === 'Rankings'? 'text-white' : 'text-gray-500'} />
          <PlusSquare size={26} onClick={() => setShowStory(true)} className="text-gray-500" />
          <Heart size={26} className="text-gray-500" />
          <User size={26} onClick={() => setTab('Profile')} className={tab === 'Profile'? 'text-white' : 'text-gray-500'} />
        </div>
      </div>
    </div>
  );
}
