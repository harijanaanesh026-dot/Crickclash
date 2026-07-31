import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment, } from 'firebase/database';

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

const getToday = () => { const now = new Date(); const ist = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"})); return ist.toISOString().split('T')[0]; };
const getTimeUntilNextVote = (lastVoteTime) => { if (!lastVoteTime) return 0; const nextVoteTime = new Date(lastVoteTime).getTime() + VOTE_COOLDOWN_HOURS * 60 * 60 * 1000; const diff = nextVoteTime - Date.now(); return diff > 0? diff : 0; };
const getChatRoomId = (uid1, uid2) => [uid1, uid2].sort().join('_');
export default function CrickClash() {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); const [category, setCategory] = useState('Cricket');
  const [players, setPlayers] = useState(CRICKET_PLAYERS); const [battle, setBattle] = useState([null, null]); const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any'); const [tab, setTab] = useState('Battle'); const [votesToday, setVotesToday] = useState({Cricket: 0, Football: 0, Movies: 0});
  const [totalVotes, setTotalVotes] = useState(0); const [badges, setBadges] = useState([]); const [battleHistory, setBattleHistory] = useState([]); const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); const [editName, setEditName] = useState(""); const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState(""); const [usernameError, setUsernameError] = useState(""); const [voteAnim, setVoteAnim] = useState(null);
  const [timeLeft, setTimeLeft] = useState(""); const [isVoting, setIsVoting] = useState(false); const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(""); const [selectedPlayer, setSelectedPlayer] = useState(null); const [replyTo, setReplyTo] = useState(null);
  const [newReply, setNewReply] = useState(""); const [showResultCard, setShowResultCard] = useState(false); const [tournament, setTournament] = useState(null);
  const [yesterdayWinners, setYesterdayWinners] = useState({Cricket: null, Football: null, Movies: null}); const [streak, setStreak] = useState(0);
  const [topFans, setTopFans] = useState([]); const [globalChat, setGlobalChat] = useState([]); const [newGlobalMsg, setNewGlobalMsg] = useState("");
  const [followers, setFollowers] = useState([]); const [following, setFollowing] = useState([]); const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendChat, setFriendChat] = useState([]); const [newFriendMsg, setNewFriendMsg] = useState(""); const [showChatModal, setShowChatModal] = useState(false);

  // NEW FOR INSTAGRAM FEATURES
  const [searchUsername, setSearchUsername] = useState(""); const [searchResult, setSearchResult] = useState(null); const [chatList, setChatList] = useState([]);
  const [showDmDrawer, setShowDmDrawer] = useState(false); const [viewFollowersList, setViewFollowersList] = useState(null); const [viewFollowingList, setViewFollowingList] = useState(null);
  const [listUsers, setListUsers] = useState([]); const touchStartX = useRef(0); const touchEndX = useRef(0);
    const getBattleKey = () => battle[0] && battle[1]? `${category}-${battle[0].id}-${battle[1].id}-B${battleNo}` : null;

  // LEFT SWIPE
  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; }
  const handleTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX; }
  const handleTouchEnd = () => { if (touchStartX.current - touchEndX.current > 75) { if(user) setShowDmDrawer(true); } }

  useEffect(() => { const updateTimer = () => { const now = new Date(); const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"})); const tomorrow = new Date(istNow); tomorrow.setDate(istNow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0); const diff = tomorrow - istNow; const h = Math.floor(diff / 1000 / 60 / 60); const m = Math.floor(diff / 1000 / 60) % 60; const s = Math.floor(diff / 1000) % 60; setTimeLeft(`${h}h ${m}m ${s}s`); }; updateTimer(); const interval = setInterval(updateTimer, 1000); return () => clearInterval(interval); }, []);
  useEffect(() => { const checkGlobalReset = async () => { const today = getToday(); const snap = await get(ref(db, `meta/lastGlobalReset`)); if (snap.val()!== today) { for(const cat of ['Cricket', 'Football', 'Movies']) { const playersRef = ref(db, `players/${cat}`); const pSnap = await get(playersRef); const pData = pSnap.val(); if(pData) { const sorted = Object.values(pData).sort((a,b) => b.votes - a.votes); if(sorted[0]) { await set(ref(db, `yesterdayWinners/${cat}`), { name: sorted[0].name, votes: sorted[0].votes }); } const resetPlayers = {}; ALL_DATA[cat].forEach(p => { resetPlayers[p.id] = {...p, votes: 0}; }); await set(ref(db, `players/${cat}`), resetPlayers); await set(ref(db, `meta/${cat}`), { lastResetDate: today, totalVotes: 0, battleNo: 1 }); } await set(ref(db, `meta/lastGlobalReset`), today); } }; checkGlobalReset(); const interval = setInterval(checkGlobalReset, 60 * 1000); return () => clearInterval(interval); }, []);
  useEffect(() => { const unsub = onAuthStateChanged(auth, (currentUser) => { if(currentUser){ get(ref(db, `users/${currentUser.uid}`)).then(snap => { const data = snap.val(); setUser({...currentUser, profile: data?.profile || {}}); setVotesToday(data?.votesToday || {Cricket: 0, Football: 0, Movies: 0}); setBattleHistory(data?.battleHistory || []); }); } else { setUser(null); setVotesToday({Cricket: 0, Football: 0, Movies: 0}); setBattleHistory([]); } setLoading(false); }); return () => unsub(); }, []);
  useEffect(() => { if(!user) return; const unsub1 = onValue(ref(db, `users/${user.uid}/chats`), (snap) => { const data = snap.val(); setChatList(data? Object.keys(data).map(uid => ({uid,...data[uid]})).sort((a,b) => b.lastTime - a.lastTime) : []); }); const unsub2 = onValue(ref(db, `users/${user.uid}/followers`), (snap) => { setFollowers(snap.exists()? Object.keys(snap.val()) : []); }); const unsub3 = onValue(ref(db, `users/${user.uid}/following`), (snap) => { setFollowing(snap.exists()? Object.keys(snap.val()) : []); }); return () => { unsub1(); unsub2(); unsub3(); } }, [user]);
  useEffect(() => { const loadList = async (uid, type) => { if(!uid) return; const snap = await get(ref(db, `users/${uid}/${type}`)); if(snap.exists()){ const uids = Object.keys(snap.val()); const usersData = await Promise.all(uids.map(id => get(ref(db, `users/${id}/profile`)).then(s => ({uid: id,...s.val()})))); setListUsers(usersData); } else { setListUsers([]); } }; if(viewFollowersList) loadList(viewFollowersList, 'followers'); if(viewFollowingList) loadList(viewFollowingList, 'following'); }, [viewFollowersList, viewFollowingList]);
  useEffect(() => { if(!battle[0] ||!battle[1]) return; const battleKey = getBattleKey(); if(!battleKey) return; const unsubscribe = onValue(ref(db, `comments/${battleKey}`), (snap) => { const data = snap.val(); setComments(data? Object.values(data).sort((a,b) => b.time - a.time) : []); }); return () => unsubscribe(); }, [battle, battleNo, category]);
  useEffect(() => { const unsub = onValue(ref(db, `globalChat`), (snap) => { const data = snap.val(); setGlobalChat(data? Object.values(data).sort((a,b) => a.time - b.time).slice(-50) : []); }); return () => unsub(); }, []);

  const canVoteNow = () => { const timeLeft = getTimeUntilNextVote(user?.[`${category}LastVoteTime`]); const votesUsed = votesToday[category]; return votesUsed < DAILY_VOTE_LIMIT && timeLeft === 0; }
  const loadYesterdayWinners = useCallback(async () => { const winners = {}; for(const cat of ['Cricket', 'Football', 'Movies']) { const snap = await get(ref(db, `yesterdayWinners/${cat}`)); winners[cat] = snap.exists()? snap.val() : null; } setYesterdayWinners(winners); }, []);
  const generateBattle = useCallback((playerList, role) => { if(playerList.length < 2) return; let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role); if(filtered.length < 2) { setBattle([null, null]); return; } let p1 = filtered[Math.floor(Math.random() * filtered.length)]; let p2 = filtered[Math.floor(Math.random() * filtered.length)]; let attempts = 0; while(p1.id === p2.id && attempts < 20) { p2 = filtered[Math.floor(Math.random() * filtered.length)]; attempts++; } setBattle([p1, p2]); }, []);
  const handleUpdateProfile = async () => { if(!user ||!editName.trim()) return; const username = editUsername.toLowerCase().trim(); if(username.length < 3) return setUsernameError("Username min 3 characters"); if(!/^[a-z0-9_]+$/.test(username)) return setUsernameError("Only a-z, 0-9, _ allowed"); const usernameSnap = await get(ref(db, `usernames/${username}`)); if(usernameSnap.exists() && usernameSnap.val()!== user.uid) { return setUsernameError("Username already taken"); } if(user.profile?.username) await remove(ref(db, `usernames/${user.profile.username}`)); await set(ref(db, `usernames/${username}`), user.uid); await update(ref(db, `users/${user.uid}/profile`), { displayName: editName, username: username, bio: editBio, photoURL: user.photoURL, email: user.email, followersCount: followers.length, followingCount: following.length }); await update(ref(db, `users/${user.uid}`), { displayName: editName, username: username, bio: editBio }); alert("Profile Updated ✅"); setShowEditProfile(false); setUsernameError(""); }
  const handleFollow = async (targetUid) => { if(!user) return alert("Login required"); await set(ref(db, `users/${user.uid}/following/${targetUid}`), true); await set(ref(db, `users/${targetUid}/followers/${user.uid}`), true); await update(ref(db, `users/${user.uid}/profile/followingCount`), increment(1)); await update(ref(db, `users/${targetUid}/profile/followersCount`), increment(1)); }
  const handleUnfollow = async (targetUid) => { if(!user) return alert("Login required"); await remove(ref(db, `users/${user.uid}/following/${targetUid}`)); await remove(ref(db, `users/${targetUid}/followers/${user.uid}`)); await update(ref(db, `users/${user.uid}/profile/followingCount`), increment(-1)); await update(ref(db, `users/${targetUid}/profile/followersCount`), increment(-1)); }
  const openFriendChat = (friend) => { setSelectedFriend(friend); setShowDmDrawer(false); setShowChatModal(true); const roomId = getChatRoomId(user.uid, friend.uid); onValue(ref(db, `chats/${roomId}`), (snap) => { const data = snap.val(); setFriendChat(data? Object.values(data).sort((a,b) => a.time - b.time) : []); }); }
  const handleSendFriendMsg = async () => { if(!user ||!selectedFriend ||!newFriendMsg.trim()) return; const roomId = getChatRoomId(user.uid, selectedFriend.uid); const time = Date.now(); await set(ref(db, `chats/${roomId}/${time}`), { text: newFriendMsg, from: user.uid, time: time }); await update(ref(db, `users/${user.uid}/chats/${selectedFriend.uid}`), { name: selectedFriend.name, username: selectedFriend.username, photo: selectedFriend.photo, lastMsg: newFriendMsg, lastTime: time }); await update(ref(db, `users/${selectedFriend.uid}/chats/${user.uid}`), { name: user.displayName, username: user.profile?.username, photo: user.photoURL, lastMsg: newFriendMsg, lastTime: time }); setNewFriendMsg(""); };
  const handlePostGlobalChat = async () => { if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; } if(!newGlobalMsg.trim()) return; const time = Date.now(); await set(ref(db, `globalChat/${time}`), { text: newGlobalMsg, user: user.displayName, username: user.profile?.username || "", photo: user.photoURL, time: time }); setNewGlobalMsg(""); };
  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout?")) { await signOut(auth); setShowProfile(false); setUser(null); setVotesToday({Cricket: 0, Football: 0, Movies: 0}); setBadges([]); setBattleHistory([]); setStreak(0); setFollowers([]); setFollowing([]); } };
  const handleSearchUser = async () => { if(!searchUsername.trim()) return; const username = searchUsername.toLowerCase().trim(); const snap = await get(ref(db, `usernames/${username}`)); if(snap.exists()){ const uid = snap.val(); const userSnap = await get(ref(db, `users/${uid}/profile`)); if(userSnap.exists()){ setSearchResult({uid: uid,...userSnap.val()}); } else { alert("User not found"); } } else { alert("Username not found"); } };
  const handlePostComment = async () => { /* NEE CODE SAME */ }
  const handleLikeComment = async (commentKey) => { /* NEE CODE SAME */ }
  const handlePostReply = async (commentKey) => { /* NEE CODE SAME */ }
  const handleVote = async (playerId) => { /* NEE CODE SAME */ }
  const handleDeleteHistory = async () => { /* NEE CODE SAME */ }
  const handleShareResult = () => { /* NEE CODE SAME */ }
  const handleRefer = () => { /* NEE CODE SAME */ }
  const startTournament = () => { /* NEE CODE SAME */ }
  const handleSkip = () => { generateBattle(players, filter); setBattleNo(battleNo + 1); }
                     if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <style>{`@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }.vote-pop { animation: pop 0.5s ease; }.dm-drawer { transition: transform 0.3s ease; }`}</style>

      {/* LEFT SWIPE DM DRAWER */}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-[#13131a] z-50 dm-drawer ${showDmDrawer? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center"><h2 className="text-xl font-bold">Messages</h2><button onClick={() => setShowDmDrawer(false)} className="text-2xl">X</button></div>
        <div className="p-3"><div className="flex gap-2 mb-3"><div className="relative flex-1"><span className="absolute left-3 top-3 text-gray-500">@</span><input value={searchUsername} onChange={e => setSearchUsername(e.target.value)} placeholder="Search @username" className="w-full bg-[#0a0a0f] p-2 pl-8 rounded-xl text-sm" /></div><button onClick={handleSearchUser} className="bg-[#a8ff00] text-black px-3 rounded-xl text-sm font-bold">Search</button></div>{searchResult && <div onClick={() => openFriendChat(searchResult)} className="bg-[#0a0a0f] p-2 rounded-xl mb-2 flex gap-2 cursor-pointer"><img src={searchResult.photoURL} className="w-10 h-10 rounded-full"/><div><p className="font-bold text-sm">{searchResult.displayName}</p><p className="text-xs text-gray-400">@{searchResult.username}</p></div></div>}</div>
        <div className="flex-1 overflow-y-auto px-3 space-y-2">{chatList.map(chat => <div key={chat.uid} onClick={() => openFriendChat(chat)} className="bg-[#0a0a0f] p-3 rounded-xl flex gap-3 cursor-pointer"><img src={chat.photo} className="w-12 h-12 rounded-full"/><div className="flex-1"><p className="font-bold">{chat.name}</p><p className="text-xs text-gray-400 truncate">{chat.lastMsg}</p></div></div>)}</div>
      </div>
      {showDmDrawer && <div onClick={() => setShowDmDrawer(false)} className="fixed inset-0 bg-black/70 z-40"></div>}

      <div className="w-full max-w-2xl mx-auto flex-1 p-3">
        <header className="flex justify-between items-center mb-4"><div><h1 className="text-2xl font-bold">FanClash</h1><p className="text-xs text-gray-400">Swipe Left for DM</p></div><div>{user? <img src={user.photoURL} onClick={() => {setShowProfile(true); setEditName(user.displayName); setEditUsername(user.profile?.username || ""); setEditBio(user.profile?.bio || "")}} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" /> : <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-full font-bold text-sm">Login</button>}</div></header>

        {/* NEE ALL STATS CARDS + CATEGORY TABS + MAIN TABS CODE IKKADA */}
        {/* BATTLE TAB + RANKINGS TAB + FANS TAB + HISTORY TAB + GLOBAL CHAT TAB CODE IKKADA */}
               {/* GLOBAL CHAT TAB */}
        {tab === 'Chat' && ( <div><h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">💬 Global Chat</h2><div className="bg-[#13131a] p-4 rounded-2xl h-[400px] flex-col"><div className="flex-1 overflow-y-auto space-y-3 mb-3">{globalChat.length === 0? <p className="text-center text-gray-500">Start the conversation!</p> : globalChat.map((msg) => (<div key={msg.time} className="flex gap-2"><img src={msg.photo} className="w-8 h-8 rounded-full"/><div className="bg-[#0a0a0f] p-2 rounded-xl flex-1"><p className="text-xs font-bold text-[#a8ff00]">{msg.user} <span className="text-gray-500">@{msg.username}</span></p><p className="text-sm">{msg.text}</p></div></div>))}</div><div className="flex gap-2"><input value={newGlobalMsg} onChange={e => setNewGlobalMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && handlePostGlobalChat()} placeholder="Message..." className="flex-1 bg-[#0a0a0f] p-3 rounded-xl" /><button onClick={handlePostGlobalChat} className="bg-[#a8ff00] text-black px-4 rounded-xl font-bold">Send</button></div></div></div> )}
      </div>

      {/* FRIEND CHAT MODAL */}
      {showChatModal && selectedFriend && ( <div onClick={() => setShowChatModal(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"><div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-4 rounded-2xl w-full max-w-md h-[500px] flex-col flex"><div className="flex items-center gap-3 mb-3 border-b border-gray-800 pb-2"><img src={selectedFriend.photo} className="w-10 h-10 rounded-full"/><div><p className="font-bold">{selectedFriend.name}</p><p className="text-xs text-gray-400">@{selectedFriend.username}</p></div><button onClick={() => setShowChatModal(false)} className="ml-auto text-xl">X</button></div><div className="flex-1 overflow-y-auto space-y-2 mb-3">{friendChat.map(msg => (<div key={msg.time} className={`flex ${msg.from === user.uid? 'justify-end' : 'justify-start'}`}><div className={`p-2 rounded-xl max-w-[70%] ${msg.from === user.uid? 'bg-[#a8ff00] text-black' : 'bg-[#0a0a0f]'}`}><p className="text-sm">{msg.text}</p></div></div>))}</div><div className="flex gap-2"><input value={newFriendMsg} onChange={e => setNewFriendMsg(e.target.value)} placeholder="Message..." className="flex-1 bg-[#0a0a0f] p-3 rounded-xl"/><button onClick={handleSendFriendMsg} className="bg-[#a8ff00] text-black px-4 rounded-xl font-bold">Send</button></div></div></div> )}

      {/* PROFILE MODAL WITH BIO + FOLLOWERS */}
      {showProfile && user && ( <div onClick={() => setShowProfile(false)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"><div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm"><img src={user.photoURL} className="w-20 h-20 rounded-full mx-auto border-4 border-[#a8ff00]"/><h2 className="text-xl font-bold text-center mt-3">{user.displayName}</h2><p className="text-center text-[#a8ff00] text-sm">@{user.profile?.username || "no_username"}</p><p className="text-center text-gray-400 text-sm mt-1">{user.profile?.bio || "No bio yet"}</p><div className="flex justify-around mt-4 text-center"><div onClick={() => {setShowProfile(false); setViewFollowersList(user.uid)}} className="cursor-pointer"><p className="font-bold text-lg">{followers.length}</p><p className="text-xs text-gray-400">Followers</p></div><div onClick={() => {setShowProfile(false); setViewFollowingList(user.uid)}} className="cursor-pointer"><p className="font-bold text-lg">{following.length}</p><p className="text-xs text-gray-400">Following</p></div><div><p className="font-bold text-lg">{streak}</p><p className="text-xs text-gray-400">Streak</p></div></div><button onClick={() => {setEditName(user.displayName); setEditUsername(user.profile?.username || ""); setEditBio(user.profile?.bio || ""); setShowEditProfile(true)}} className="w-full bg-[#a8ff00] text-black py-2 rounded-xl font-bold mt-3">✏️ Edit Profile</button><button onClick={handleLogout} className="w-full bg-red-600 mt-2 py-2 rounded-xl font-bold">Logout</button></div></div> )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && ( <div onClick={() => setShowEditProfile(false)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"><div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm"><h2 className="text-xl font-bold text-center mb-4">Edit Profile</h2><img src={user.photoURL} className="w-20 h-20 rounded-full mx-auto border-4 border-[#a8ff00] mb-3"/><input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full Name" className="w-full bg-[#0a0a0f] p-3 rounded-xl mb-3 text-white"/><div className="relative mb-3"><span className="absolute left-3 top-3 text-gray-500">@</span><input value={editUsername} onChange={e => {setEditUsername(e.target.value); setUsernameError("")}} placeholder="username" className="w-full bg-[#0a0a0f] p-3 pl-8 rounded-xl text-white"/></div>{usernameError && <p className="text-red-500 text-xs mb-2">{usernameError}</p>}<textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Write your bio..." maxLength={150} className="w-full bg-[#0a0a0f] p-3 rounded-xl mb-3 text-white h-20"/><button onClick={handleUpdateProfile} className="w-full bg-[#a8ff00] text-black py-2 rounded-xl font-bold">Save</button></div></div> )}

      {/* FOLLOWERS/FOLLOWING LIST MODAL */}
      {(viewFollowersList || viewFollowingList) && ( <div onClick={() => {setViewFollowersList(null); setViewFollowingList(null)}} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"><div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-4 rounded-2xl w-full max-w-sm h-[500px] flex-col flex"><h2 className="text-xl font-bold text-center mb-3">{viewFollowersList? 'Followers' : 'Following'}</h2><div className="flex-1 overflow-y-auto space-y-2">{listUsers.map(u => (<div key={u.uid} className="bg-[#0a0a0f] p-3 rounded-xl flex items-center gap-3"><img src={u.photoURL} className="w-10 h-10 rounded-full"/><div className="flex-1"><p className="font-bold">{u.displayName}</p><p className="text-xs text-gray-400">@{u.username}</p></div>{viewFollowingList? <button onClick={() => handleUnfollow(u.uid)} className="bg-[#23232b] px-3 py-1 rounded-full text-xs">Unfollow</button> : <button onClick={() => openFriendChat(u)} className="bg-blue-600 px-3 py-1 rounded-full text-xs">Message</button>}</div>))}</div></div></div> )}

      {/* NEE RESULT CARD + TOURNAMENT MODAL + PLAYER MODAL CODE IKKADA */}
      {showResultCard && battle[0] && battle[1] && ( <div onClick={() => setShowResultCard(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"><div onClick={e => e.stopPropagation()} className="bg-gradient-to-br from-[#1e3a5f] to-[#0a0e1a] p-6 rounded-3xl w-full max-w-sm border-2 border-[#a8ff00]"><h2 className="text-center text-2xl font-bold mb-1">FanClash {category}</h2><p className="text-center text-gray-400 text-sm mb-4">Battle #{battleNo-1} Result</p><div className="flex gap-3 items-center mb-4">{[battle[0], battle[1]].map(p => {const total = battle[0].votes + battle[1].votes; const percent = total > 0? ((p.votes / total) * 100).toFixed(0) : 50; return (<div key={p.id} className="flex-1 text-center p-3 rounded-2xl bg-[#13131a]"><div className="w-16 h-16 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-2xl font-bold">{p.name[0]}</div><p className="font-bold text-sm">{p.name}</p><p className="

        {/* GLOBAL CHAT TAB */}
        {tab === 'Chat' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">💬 Global Chat</h2>
            <div className="bg-[#13131a] p-4 rounded-2xl h-[400px] flex-col flex">
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {globalChat.length === 0? <p className="text-center text-gray-500">Start the conversation!</p> :
                  globalChat.map((msg) => (
                    <div key={msg.time} className="flex gap-2">
                      <img src={msg.photo} className="w-8 h-8 rounded-full"/>
                      <div className="bg-[#0a0a0f] p-2 rounded-xl flex-1">
                        <p className="text-xs font-bold text-[#a8ff00]">{msg.user} <span className="text-gray-500">@{msg.username}</span></p>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className="flex gap-2">
                <input value={newGlobalMsg} onChange={e => setNewGlobalMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && handlePostGlobalChat()} placeholder="Message..." className="flex-1 bg-[#0a0a0f] p-3 rounded-xl" />
                <button onClick={handlePostGlobalChat} className="bg-[#a8ff00] text-black px-4 rounded-xl font-bold">Send</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1-TO-1 FRIEND CHAT MODAL */}
      {showChatModal && selectedFriend && (
        <div onClick={() => setShowChatModal(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-4 rounded-2xl w-full max-w-md h-[500px] flex-col flex">
            <div className="flex items-center gap-3 mb-3 border-b border-gray-800 pb-2">
              <img src={selectedFriend.photo} className="w-10 h-10 rounded-full"/>
              <div><p className="font-bold">{selectedFriend.name}</p><p className="text-xs text-gray-400">@{selectedFriend.username}</p></div>
              <button onClick={() => setShowChatModal(false)} className="ml-auto text-xl">X</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {friendChat.map(msg => (
                <div key={msg.time} className={`flex ${msg.from === user.uid? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2 rounded-xl max-w-[70%] ${msg.from === user.uid? 'bg-[#a8ff00] text-black' : 'bg-[#0a0a0f]'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newFriendMsg} onChange={e => setNewFriendMsg(e.target.value)} placeholder="Message..." className="flex-1 bg-[#0a0a0f] p-3 rounded-xl"/>
              <button onClick={handleSendFriendMsg} className="bg-[#a8ff00] text-black px-4 rounded-xl font-bold">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL WITH BIO + FOLLOWERS */}
      {showProfile && user && (
        <div onClick={() => setShowProfile(false)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm">
            <img src={user.photoURL} className="w-20 h-20 rounded-full mx-auto border-4 border-[#a8ff00]"/>
            <h2 className="text-xl font-bold text-center mt-3">{user.displayName}</h2>
            <p className="text-center text-[#a8ff00] text-sm">@{user.profile?.username || "no_username"}</p>
            <p className="text-center text-gray-400 text-sm mt-1">{user.profile?.bio || "No bio yet"}</p>
            <div className="flex justify-around mt-4 text-center">
              <div onClick={() => {setShowProfile(false); setViewFollowersList(user.uid)}} className="cursor-pointer"><p className="font-bold text-lg">{followers.length}</p><p className="text-xs text-gray-400">Followers</p></div>
              <div onClick={() => {setShowProfile(false); setViewFollowingList(user.uid)}} className="cursor-pointer"><p className="font-bold text-lg">{following.length}</p><p className="text-xs text-gray-400">Following</p></div>
              <div><p className="font-bold text-lg">{streak}</p><p className="text-xs text-gray-400">Streak</p></div>
            </div>
            <button onClick={() => {setEditName(user.displayName); setEditUsername(user.profile?.username || ""); setEditBio(user.profile?.bio || ""); setShowEditProfile(true)}} className="w-full bg-[#a8ff00] text-black py-2 rounded-xl font-bold mt-3">✏️ Edit Profile</button>
            <button onClick={handleLogout} className="w-full bg-red-600 mt-2 py-2 rounded-xl font-bold">Logout</button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div onClick={() => setShowEditProfile(false)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm">
            <h2 className="text-xl font-bold text-center mb-4">Edit Profile</h2>
            <img src={user.photoURL} className="w-20 h-20 rounded-full mx-auto border-4 border-[#a8ff00] mb-3"/>
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full Name" className="w-full bg-[#0a0a0f] p-3 rounded-xl mb-3 text-white"/>
            <div className="relative mb-3"><span className="absolute left-3 top-3 text-gray-500">@</span><input value={editUsername} onChange={e => {setEditUsername(e.target.value); setUsernameError("")}} placeholder="username" className="w-full bg-[#0a0a0f] p-3 pl-8 rounded-xl text-white"/></div>
            {usernameError && <p className="text-red-500 text-xs mb-2">{usernameError}</p>}
            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Write your bio..." maxLength={150} className="w-full bg-[#0a0a0f] p-3 rounded-xl mb-3 text-white h-20"/>
            <button onClick={handleUpdateProfile} className="w-full bg-[#a8ff00] text-black py-2 rounded-xl font-bold">Save</button>
          </div>
        </div>
      )}
             {/* FOLLOWERS/FOLLOWING LIST MODAL */}
      {(viewFollowersList || viewFollowingList) && (
        <div onClick={() => {setViewFollowersList(null); setViewFollowingList(null)}} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-4 rounded-2xl w-full max-w-sm h-[500px] flex-col flex">
            <h2 className="text-xl font-bold text-center mb-3">{viewFollowersList? 'Followers' : 'Following'}</h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {listUsers.map(u => (
                <div key={u.uid} className="bg-[#0a0a0f] p-3 rounded-xl flex items-center gap-3">
                  <img src={u.photoURL} className="w-10 h-10 rounded-full"/>
                  <div className="flex-1"><p className="font-bold">{u.displayName}</p><p className="text-xs text-gray-400">@{u.username}</p></div>
                  {viewFollowingList?
                    <button onClick={() => handleUnfollow(u.uid)} className="bg-[#23232b] px-3 py-1 rounded-full text-xs">Unfollow</button> :
                    <button onClick={() => openFriendChat(u)} className="bg-blue-600 px-3 py-1 rounded-full text-xs">Message</button>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RESULT CARD MODAL */}
      {showResultCard && battle[0] && battle[1] && (
        <div onClick={() => setShowResultCard(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-gradient-to-br from-[#1e3a5f] to-[#0a0e1a] p-6 rounded-3xl w-full max-w-sm border-2 border-[#a8ff00]">
            <h2 className="text-center text-2xl font-bold mb-1">FanClash {category}</h2>
            <p className="text-center text-gray-400 text-sm mb-4">Battle #{battleNo-1} Result</p>
            <div className="flex gap-3 items-center mb-4">
              {[battle[0], battle[1]].map(p => {
                const total = battle[0].votes + battle[1].votes;
                const percent = total > 0? ((p.votes / total) * 100).toFixed(0) : 50;
                return (
                  <div key={p.id} className="flex-1 text-center p-3 rounded-2xl bg-[#13131a]">
                    <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-2xl font-bold">{p.name[0]}</div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-xl font-bold text-[#a8ff00]">{percent}%</p>
                  </div>
                )
              })}
            </div>
            <button onClick={handleShareResult} className="w-full bg-[#a8ff00] text-black py-3 rounded-xl font-bold mb-2">Share Result</button>
            <button onClick={() => setShowResultCard(false)} className="w-full bg-[#23232b] py-3 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}

      {/* TOURNAMENT MODAL */}
      {tournament && (
        <div onClick={() => setTournament(null)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-4 text-[#a8ff00]">🏆 {category} Tournament</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {tournament.map((round, i) => (
                <div key={i} className="bg-[#0a0a0f] p-3 rounded-xl">
                  <p className="font-bold text-sm text-gray-400 mb-2">Round {i+1}</p>
                  {round.map((match, j) => (
                    <p key={j} className="text-sm">{match[0]?.name || 'TBD'} vs {match[1]?.name || 'TBD'}</p>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={() => setTournament(null)} className="w-full bg-[#a8ff00] text-black py-3 rounded-xl font-bold mt-4">Close</button>
          </div>
        </div>
      )}

      {/* SELECTED PLAYER MODAL */}
      {selectedPlayer && (
        <div onClick={() => setSelectedPlayer(null)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-[#a8ff00] text-black flex items-center justify-center text-4xl font-bold">{selectedPlayer.name[0]}</div>
            <h2 className="text-2xl font-bold">{selectedPlayer.name}</h2>
            <p className="text-gray-400 mb-3">{selectedPlayer.role}</p>
            <p className="text-3xl font-bold text-[#a8ff00]">{selectedPlayer.votes || 0} Votes</p>
            <button onClick={() => setSelectedPlayer(null)} className="w-full bg-[#23232b] py-3 rounded-xl font-bold mt-4">Close</button>
          </div>
        </div>
      )}

      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-white font-bold">FanClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
      </footer>
    </div>
  );
                             }
            
