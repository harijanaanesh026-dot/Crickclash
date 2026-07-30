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

// ============= HELPERS =============
const getToday = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  return ist.toISOString().split('T')[0];
};
const getWeekNumber = () => { const d = new Date(); d.setHours(0,0,0); d.setDate(d.getDate() + 4 - (d.getDay()||7)); return d.getFullYear() + '-W' + String(Math.ceil(((d - new Date(d.getFullYear(),0,1))/86400000 + 1)/7)).padStart(2,'0'); };
const getTimeUntilNextVote = (lastVoteTime) => {
  if (!lastVoteTime) return 0;
  const nextVoteTime = new Date(lastVoteTime).getTime() + VOTE_COOLDOWN_HOURS * 60 * 60 * 1000;
  const diff = nextVoteTime - Date.now();
  return diff > 0? diff : 0;
};

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
  const [votesToday, setVotesToday] = useState({Cricket: 0, Football: 0, Movies: 0});
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
  const [yesterdayWinners, setYesterdayWinners] = useState({Cricket: null, Football: null, Movies: null});

  // NEW STATES
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [topFans, setTopFans] = useState([]);

  const getBattleKey = () => battle[0] && battle[1]? `${category}-${battle[0].id}-${battle[1].id}-B${battleNo}` : null;

  // 12AM IST TIMER
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const tomorrow = new Date(istNow);
      tomorrow.setDate(istNow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - istNow;
      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor(diff / 1000 / 60) % 60;
      const s = Math.floor(diff / 1000) % 60;
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // GLOBAL 12AM RESET
  useEffect(() => {
    const checkGlobalReset = async () => {
      const today = getToday();
      const snap = await get(ref(db, `meta/lastGlobalReset`));
      if (snap.val()!== today) {
        for(const cat of ['Cricket', 'Football', 'Movies']) {
          const resetPlayers = {};
          ALL_DATA[cat].forEach(p => { resetPlayers[p.id] = {...p, votes: 0}; });
          await set(ref(db, `players/${cat}`), resetPlayers);
          await set(ref(db, `meta/${cat}`), { lastResetDate: today, totalVotes: 0, battleNo: 1 });
        }
        await set(ref(db, `meta/lastGlobalReset`), today);
      }
    };
    checkGlobalReset();
    const interval = setInterval(checkGlobalReset, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const canVoteNow = () => {
    const timeLeft = getTimeUntilNextVote(user?.[`${category}LastVoteTime`]);
    const votesUsed = votesToday[category];
    return votesUsed < DAILY_VOTE_LIMIT && timeLeft === 0;
  }

  // FIX: +1 BONUS VOTE
  const claimDailyReward = async () => {
    if(!user || dailyRewardClaimed) return;
    await update(ref(db, `users/${user.uid}/${category}`), {
      votesToday: increment(1), // +1 bonus
      [`${category}LastRewardDate`]: getToday()
    });
    setDailyRewardClaimed(true);
    setVotesToday(prev => ({...prev, [category]: prev[category] + 1}));
    alert("🎁 +1 Bonus Vote Claimed!");
  }

  const checkAndResetDaily = useCallback(async () => {
    const today = getToday();
    const metaRef = ref(db, `meta/${category}`);
    const snap = await get(metaRef);
    const metaData = snap.val();
    if (!metaData || metaData.lastResetDate!== today) {
      const playersRef = ref(db, `players/${category}`);
      const pSnap = await get(playersRef);
      const pData = pSnap.val();
      if(pData) {
        const sorted = Object.values(pData).sort((a,b) => b.votes - a.votes);
        if(sorted[0]) await set(ref(db, `yesterdayWinners/${category}`), { name: sorted[0].name, votes: sorted[0].votes });
      }
      const resetPlayers = {};
      ALL_DATA[category].forEach(p => { resetPlayers[p.id] = {...p, votes: 0}; });
      await set(ref(db, `players/${category}`), resetPlayers);
      await set(metaRef, { lastResetDate: today, totalVotes: 0, battleNo: 1 });
    }
  }, [category]);

  const checkWeeklyWinner = useCallback(async (playerList) => {
    const week = getWeekNumber();
    const winnerRef = ref(db, `winners/${category}/${week}`);
    const sorted = [...playerList].sort((a,b) => b.votes - a.votes);
    if(sorted[0]) {
      await set(winnerRef, { name: sorted[0].name, votes: sorted[0].votes, role: sorted[0].role });
      setWeeklyWinner({ name: sorted[0].name, votes: sorted[0].votes });
    }
  }, [category]);

  const loadWeeklyWinner = useCallback(async () => {
    const week = getWeekNumber();
    const snap = await get(ref(db, `winners/${category}/${week}`));
    setWeeklyWinner(snap.exists()? snap.val() : null);
  }, [category]);

  const loadYesterdayWinners = useCallback(async () => {
    const winners = {};
    for(const cat of ['Cricket', 'Football', 'Movies']) {
      const snap = await get(ref(db, `yesterdayWinners/${cat}`));
      winners[cat] = snap.exists()? snap.val() : null;
    }
    setYesterdayWinners(winners);
  }, []);

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

  // AUTH + ANONYMOUS FIX
  useEffect(() => {
    setLoading(true);
    const authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(false);
      if(currentUser) {
        const today = getToday();

        // FIX: SAVE USER PROFILE TO FIREBASE
        await set(ref(db, `users/${currentUser.uid}/profile`), {
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          email: currentUser.email,
          lastLogin: Date.now()
        })

        const userSnap = await get(ref(db, `users/${currentUser.uid}`));
        const userData = userSnap.val() || {};

        if(userData.lastGlobalReset!== today) {
          await update(ref(db, `users/${currentUser.uid}`), {
            Cricket: { votesToday: 0, lastVoteTime: 0 },
            Football: { votesToday: 0, lastVoteTime: 0 },
            Movies: { votesToday: 0, lastVoteTime: 0 },
            lastGlobalReset: today
          })
        }

        setUser(currentUser);
        setVotesToday({
          Cricket: userData.Cricket?.votesToday || 0,
          Football: userData.Football?.votesToday || 0,
          Movies: userData.Movies?.votesToday || 0
        });
        setUser(prev => ({...currentUser, CricketLastVoteTime: userData.Cricket?.lastVoteTime, FootballLastVoteTime: userData.Football?.lastVoteTime, MoviesLastVoteTime: userData.Movies?.lastVoteTime}));
        setDailyRewardClaimed(userData[`${category}LastRewardDate`] === today);

        const userUnsub = onValue(ref(db, `users/${currentUser.uid}/${category}`), (snapshot) => {
          const catData = snapshot.val();
          if(catData){
            setStreak(catData.streak || 0);
            setBadges(catData.badges || []);
            setBattleHistory(catData.history || []);
            setUser(prev => ({...prev, [`${category}LastVoteTime`]: catData.lastVoteTime}));
          }
        });
        return () => userUnsub();
      } else {
        setVotesToday({Cricket: 0, Football: 0, Movies: 0});
        setStreak(0); setBadges([]); setBattleHistory([]); setUser(null); setDailyRewardClaimed(false);
      }
    });
    return () => authUnsub();
  }, [category]);

  const updateStreak = async () => {
    if(!user) return {newStreak: 0, newBadges: []};
    const userRef = ref(db, `users/${user.uid}/${category}`);
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const snap = await get(userRef);
    const data = snap.val() || {};
    let newStreak = 1;
    if(data.lastVoteDate === yesterday) newStreak = (data.streak || 0) + 1;
    let newBadges = [...(data.badges || [])];
    if([3,7,30].includes(newStreak) &&!newBadges.includes(`${newStreak} Day Streak`)){ newBadges.push(`${newStreak} Day Streak`); }
    if(votesToday[category] === 0 &&!newBadges.includes(`First ${category} Vote`)) newBadges.push(`First ${category} Vote`);
    if(!newBadges.includes(`${category} Fan`)) newBadges.push(`${category} Fan`);
    return {newStreak, newBadges};
  };

  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    const userLastVoteTime = user[`${category}LastVoteTime`];
    const timeLeftMs = getTimeUntilNextVote(userLastVoteTime);
    if(votesToday[category] >= DAILY_VOTE_LIMIT || timeLeftMs > 0 || isVoting) {
      const mins = Math.ceil(timeLeftMs / 1000 / 60);
      return alert(`${category} lo ${DAILY_VOTE_LIMIT} votes is over! Next vote in ${Math.floor(mins/60)}h ${mins%60}m`);
    }
    setIsVoting(true); setVoteAnim(votedPlayerId); setTimeout(() => setVoteAnim(null), 500);
    const {newStreak, newBadges} = await updateStreak();
    const today = getToday();
    const votedPlayer = ALL_DATA[category].find(p => p.id === votedPlayerId);
    const historyEntry = {battleNo, category, players: [battle[0]?.name, battle[1]?.name], votedFor: votedPlayer.name, date: today};
    const newHistory = [historyEntry,...battleHistory].slice(0, 50);
    const newBattleNo = battleNo + 1;
    await update(ref(db, `users/${user.uid}/${category}`), { votesToday: increment(1), lastVoteDate: today, lastVoteTime: Date.now(), streak: newStreak, badges: newBadges, history: newHistory });
    await update(ref(db, `players/${category}/${votedPlayerId}`), { votes: increment(1) });
    await update(ref(db, `meta/${category}`), { totalVotes: increment(1), battleNo: newBattleNo });
    setTimeout(() => { setIsVoting(false); setBattleNo(newBattleNo); generateBattle(players, filter); }, 1000);
  };

  const handleSkip = async () => {
    const newBattleNo = battleNo + 1;
    setBattleNo(newBattleNo);
    await update(ref(db, `meta/${category}`), { battleNo: newBattleNo });
    generateBattle(players, filter);
  };

  const handleDeleteHistory = async () => {
    if(!user) return alert("Login required");
    if(window.confirm("Are you sure?")){ await remove(ref(db, `users/${user.uid}/${category}/history`)); setBattleHistory([]); }
  };

  const handleShareResult = () => {
    const text = `Who's your favourite ${battle[0]?.name} vs ${battle[1]?.name} Vote on FanClash ${category}! ⚔️`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'FanClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Copied!"); }
  };

  const handleRefer = async () => {
    if(!user) return alert("Login required");
    const refLink = `${window.location.origin}?ref=${user.uid}`;
    navigator.clipboard.writeText(`Vote now on FanClash! ${refLink}`);
    alert("Refer your friend! you can get an extra vote");
    await update(ref(db, `users/${user.uid}/${category}`), { votesToday: increment(-REFERRAL_BONUS_VOTE) });
    setVotesToday(prev => ({...prev, [category]: Math.max(0, prev[category] - 1)}));
  }

  const startTournament = () => {
    const shuffled = [...players].sort(() => 0.5 - Math.random()).slice(0, 8);
    if(shuffled.length < 8) return alert("8 players ledu");
    setTournament({ round: 1, matches: [[shuffled[0], shuffled[1]], [shuffled[2], shuffled[3]], [shuffled[4], shuffled[5]], [shuffled[6], shuffled[7]]], winner: null });
  }

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => {
    if(window.confirm("Logout?")) {
      await signOut(auth);
      setShowProfile(false);
      setUser(null);
      setVotesToday({Cricket: 0, Football: 0, Movies: 0});
      setStreak(0); setBadges([]); setBattleHistory([]);
    }
  };

  useEffect(() => {
    if(user) {
      get(ref(db, `users/${user.uid}`)).then(snap => {
        const d = snap.val() || {};
        setVotesToday({
          Cricket: d.Cricket?.lastVoteDate === getToday()? d.Cricket?.votesToday || 0 : 0,
          Football: d.Football?.lastVoteDate === getToday()? d.Football?.votesToday || 0 : 0,
          Movies: d.Movies?.lastVoteDate === getToday()? d.Movies?.votesToday || 0 : 0
        });
        setDailyRewardClaimed(d[`${category}LastRewardDate`] === getToday());
      })
    }
    checkAndResetDaily();
    loadWeeklyWinner();
    loadYesterdayWinners();

    const metaUnsub = onValue(ref(db, `meta/${category}`), (snapshot) => {
      const metaData = snapshot.val();
      if (metaData) { setBattleNo(metaData.battleNo || 1); setTotalVotes(metaData.totalVotes || 0); }
    });

    const playersUnsub = onValue(ref(db, `players/${category}`), (snapshot) => {
      const data = snapshot.val();
      const currentPlayers = ALL_DATA[category];
      if (data) {
        const playersArray = currentPlayers.map(p => ({...p, votes: data[p.id]?.votes || 0 }));
        setPlayers(playersArray);
        generateBattle(playersArray, filter);
        const sorted = [...playersArray].sort((a,b) => b.votes - a.votes);
        setTopPlayer(sorted[0]);
        checkWeeklyWinner(sorted);
      } else {
        const initialPlayers = {};
        currentPlayers.forEach((p) => { initialPlayers[p.id] = {...p}; });
        set(ref(db, `players/${category}`), initialPlayers);
        set(ref(db, `meta/${category}`), { lastResetDate: getToday(), totalVotes: 0, battleNo: 1 });
      }
    });

    // FIX: TOP 10 FANS WITH REAL NAME
    const fansRef = ref(db, `users`);
    const fansUnsub = onValue(fansRef, (snap) => {
      const allUsers = snap.val() || {};
      let fansList = [];
      Object.keys(allUsers).forEach(uid => {
        const u = allUsers[uid];
        const catData = u[category];
        const profile = u.profile; // profile nunchi name teeskuntunnam
        if(catData?.votesToday > 0) {
          fansList.push({
            name: profile?.displayName || "Anonymous",
            photo: profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || 'A'}`,
            votes: catData.votesToday
          })
        }
      });
      fansList.sort((a,b) => b.votes - a.votes);
      setTopFans(fansList.slice(0,10));
    })

    return () => { metaUnsub(); playersUnsub(); fansUnsub(); }
  }, [category, checkAndResetDaily, checkWeeklyWinner, filter, generateBattle, loadWeeklyWinner, loadYesterdayWinners]);

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

  const handlePostComment = async () => {
    if(!user){ alert("Login required"); await signInWithPopup(auth, googleProvider); return; }
    if(!newComment.trim() ||!battle[0] ||!battle[1]) return;
    const time = Date.now();
    const battleKey = getBattleKey();
    await set(ref(db, `comments/${battleKey}/${time}`), { text: newComment, user: user.displayName, photo: user.photoURL, time: time, key: time, likes: {}, replies: {} });
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
    await set(ref(db, `comments/${battleKey}/${commentKey}/replies/${time}`), { text: newReply, user: user.displayName, photo: user.photoURL, time: time, key: time });
    setNewReply(""); setReplyTo(null);
  };

  const CommentItem = ({comment, commentKey, depth = 0}) => {
    const commentId = comment.key || comment.time;
    return (
      <div style={{marginLeft: depth * 16}}>
        <div className="bg-[#1A1A1A] p-3 rounded-xl mb-2">
          <div className="flex items-center gap-2"><img src={comment.photo || '/default-avatar.png'} className="w-8 h-8 rounded-full"/><b className="text-sm">{comment.user}</b></div>
          <p className="text-sm mt-1">{comment.text}</p>
          <div className="flex gap-3 mt-2"><button onClick={() => handleLikeComment(commentId)} className="text-xs text-gray-400">🤍 {Object.keys(comment.likes || {}).length}</button><button onClick={() => setReplyTo(replyTo === commentId? null : commentId)} className="text-xs text-[#a8ff00]">Reply</button></div>
          {replyTo === commentId && (<div className="flex gap-2 mt-2"><input value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="Reply..." className="flex-1 bg-[#0a0a0f] p-2 rounded-lg text-sm"/><button onClick={() => handlePostReply(commentId)} className="bg-[#a8ff00] text-black px-3 rounded-lg text-sm">Send</button></div>)}
        </div>
        {comment.replies && Object.values(comment.replies).sort((a,b) => a.time - b.time).map((reply) => (<CommentItem key={reply.key} comment={reply} commentKey={reply.key} depth={depth + 1}/>))}
      </div>
    );
            }

              if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
      <style>{`@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }.vote-pop { animation: pop 0.5s ease; }`}</style>

      {selectedPlayer && (
        <div onClick={() => setSelectedPlayer(null)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm">
            <div className="w-24 h-24 rounded-full mx-auto border-4 border-[#a8ff00] bg-[#a8ff00] text-black flex items-center justify-center text-4xl font-bold">{selectedPlayer.name[0]}</div>
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

      {showProfile && user && (
        <div onClick={() => setShowProfile(false)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm">
            <img src={user.photoURL} className="w-20 h-20 rounded-full mx-auto border-4 border-[#a8ff00]"/>
            <h2 className="text-xl font-bold text-center mt-3">{user.displayName}</h2>
            <p className="text-center text-gray-400 text-sm">{user.email}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between bg-[#0a0a0f] p-2 rounded-lg"><span>🔥 Current Streak</span><span className="font-bold text-[#a8ff00]">{streak} days</span></div>
              <div className="flex justify-between bg-[#0a0a0f] p-2 rounded-lg"><span>🗳️ Votes Today</span><span className="font-bold">{votesToday[category]}/{DAILY_VOTE_LIMIT}</span></div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Badges:</p>
              <div className="flex flex-wrap gap-1">
                {badges.length === 0? <p className="text-xs">No badges yet</p> : badges.map(b => <span key={b} className="text-xs bg-[#a8ff00] text-black px-2 py-1 rounded-full">{b}</span>)}
              </div>
            </div>
            <button onClick={handleLogout} className="w-full bg-red-600 mt-4 py-2 rounded-xl font-bold">Logout</button>
            <button onClick={() => setShowProfile(false)} className="w-full bg-[#23232b] py-2 rounded-xl font-bold mt-2">Close</button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4"><div><h1 className="text-2xl font-bold">FanClash</h1><p className="text-xs text-gray-400">🏏 ⚽ 🎬</p></div><div>{user? <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" /> : <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-full font-bold text-sm">Login</button>}</div></header>

        <div className="flex justify-center gap-2 mb-4 bg-[#13131a] p-1 rounded-2xl">{Object.keys(ALL_DATA).map(cat => (<button key={cat} onClick={() => setCategory(cat)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${category === cat? 'bg-[#a8ff00] text-black' : 'text-gray-400'}`}>{cat === 'Cricket' && '🏏 '}{cat === 'Football' && '⚽ '}{cat === 'Movies' && '🎬 '}{cat}</button>))}</div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl mb-3"><p className="text-sm font-bold text-center mb-2">👑 Yesterday's Winners</p><div className="grid grid-cols-3 gap-2">{Object.entries(yesterdayWinners).map(([cat, winner]) => (<div key={cat} className="bg-black/20 p-2 rounded-xl text-center"><p className="text-xs">{cat === 'Cricket' && '🏏'}{cat === 'Football' && '⚽'}{cat === 'Movies' && '🎬'} {cat}</p>{winner? (<><div className="w-10 h-10 rounded-full mx-auto my-1 bg-[#a8ff00] text-black flex items-center justify-center text-lg font-bold">{winner.name[0]}</div><p className="text-xs font-bold truncate">{winner.name}</p><p className="text-xs text-[#a8ff00]">{winner.votes} votes</p></>) : (<p className="text-xs text-gray-300">No data</p>)}</div>))}</div></div>

        {/* DAILY REWARD + STREAK */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl mb-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold">🔥 {streak} Day Streak</p>
              <p className="text-xs">Come back tomorrow for +1 Bonus</p>
            </div>
            <button
              onClick={claimDailyReward}
              disabled={dailyRewardClaimed}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${dailyRewardClaimed? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}
            >
              {dailyRewardClaimed? 'Claimed' : 'Claim +1 Vote'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-2xl mb-3 text-center">
          <p className="text-sm font-bold">🔥 Daily Fan Battle</p>
          <p className="text-lg font-bold">{category === 'Cricket' && 'Best Cricketer of All Time?'}{category === 'Football' && 'GOAT Football Debate'}{category === 'Movies' && 'King of Indian Cinema?'}</p>
          <p className="text-xs">Votes Left: {DAILY_VOTE_LIMIT - votesToday[category]}/6</p>
          {getTimeUntilNextVote(user?.[`${category}LastVoteTime`]) > 0 && (<p className="text-xs text-yellow-300">Next vote in: {Math.floor(getTimeUntilNextVote(user?.[`${category}LastVoteTime`])/1000/60/60)}h {Math.floor(getTimeUntilNextVote(user?.[`${category}LastVoteTime`])/1000/60%60)}m</p>)}
        </div>

        {weeklyWinner && (<div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-2xl mb-3 text-center"><p className="text-sm font-bold text-black">👑 {category} WEEKLY CHAMPION</p><p className="text-lg font-bold text-black">{weeklyWinner.name} - {weeklyWinner.votes} Vote{weeklyWinner.votes > 1? 's' : ''}</p></div>)}

        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center"><p className="text-gray-400 text-sm mb-2">Today's Votes Left</p><div className="grid grid-cols-3 gap-2"><div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesToday.Cricket >= DAILY_VOTE_LIMIT? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday.Cricket}</p><p className="text-xs">🏏 Cricket</p></div><div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesToday.Football >= DAILY_VOTE_LIMIT? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday.Football}</p><p className="text-xs">⚽ Football</p></div><div className={`bg-[#0a0a0f] p-2 rounded-xl ${votesToday.Movies >= DAILY_VOTE_LIMIT? 'opacity-50' : ''}`}><p className="text-2xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday.Movies}</p><p className="text-xs">🎬 Movies</p></div></div><p className="text-xs text-gray-500 mt-2">Daily Reset in: {timeLeft}</p></div>

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('Fans')} className={`pb-2 font-bold ${tab === 'Fans'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>👑 Top Fans</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {tab === 'Battle' && battle[0] && battle[1] && (
          <div>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {category === 'Cricket' && ['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (<button key={role} onClick={() => {setFilter(role); generateBattle(players, role)}} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>))}
              {category === 'Football' && ['Any', 'FORWARD', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER'].map(role => (<button key={role} onClick={() => {setFilter(role); generateBattle(players, role)}} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>))}
              {category === 'Movies' && ['Any', 'HERO', 'VILLAIN'].map(role => (<button key={role} onClick={() => {setFilter(role); generateBattle(players, role)}} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>))}
            </div>

            <div className="flex gap-2">
              {[battle[0], battle[1]].map(p => {
                const total = battle[0].votes + battle[1].votes;
                const percent = total > 0? ((p.votes / total) * 100).toFixed(0) : 50;
                return (
                  <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`bg-[#13131a] p-4 rounded-2xl w-1/2 text-center ${voteAnim === p.id? 'vote-pop' : ''}`}>
                    <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-3xl font-bold">{p.name[0]}</div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800">{p.role}</span>
                    <h3 className="text-xl font-bold mt-3">{p.name}</h3>

                    {/* LIVE VOTE BAR */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-[#a8ff00] h-2 rounded-full transition-all duration-500" style={{width: `${percent}%`}}></div>
                    </div>
                    <p className="text-[#a8ff00] font-bold text-sm">{p.votes || 0} votes - {percent}%</p>

                    <button onClick={(e) => {e.stopPropagation(); handleVote(p.id)}} disabled={isVoting ||!canVoteNow()} className={`w-full py-3 rounded-xl font-bold mt-2 ${!canVoteNow()? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>
                      {isVoting? 'VOTING...' :!canVoteNow()? `WAIT ${Math.floor(getTimeUntilNextVote(user?.[`${category}LastVoteTime`])/1000/60/60)}h` : 'VOTE'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* DEBATE ZONE */}
            <div className="bg-[#13131a] p-4 rounded-2xl mt-4">
              <h3 className="font-bold mb-3">💬 Debate Zone</h3>
              <div className="flex gap-2 mb-3"><input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Who will win?" className="w-full bg-[#0a0a0f] p-2 rounded-lg" /><button onClick={handlePostComment} className="bg-[#a8ff00] text-black px-4 rounded-lg font-bold">Post</button></div>
              <div className="space-y-3 max-h-60 overflow-y-auto">{comments.map((c) => (<CommentItem key={c.key} comment={c} commentKey={c.key} />))}</div>
            </div>

            {/* 5 BUTTONS */}
            <div className="flex gap-2 mt-4"><button onClick={handleShareResult} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">📤 Share</button><button onClick={() => setShowResultCard(true)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-bold">📸 Result</button><button onClick={handleSkip} className="flex-1 bg-[#23232b] py-3 rounded-xl font-bold">⏭️ Skip</button></div>
            <div className="flex gap-2 mt-3"><button onClick={handleRefer} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 py-3 rounded-xl font-bold">👥 Refer</button><button onClick={startTournament} className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 py-3 rounded-xl font-bold">🏆 Tournament</button></div>
          </div>
        )}

        {/* RANKINGS TAB */}
        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 {category} Players</h2>
            {players.sort((a,b) => b.votes - a.votes).slice(0,10).map((p,i) => {
                const percentage = totalVotes > 0? ((p.votes || 0) / totalVotes * 100).toFixed(1) : 0;
                return (
                  <div key={p.id} onClick={() => setSelectedPlayer(p)} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3 cursor-pointer">
                    <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                    <div className="w-12 h-12 rounded-full bg-[#a8ff00] text-black flex items-center justify-center text-lg font-bold">{p.name[0]}</div>
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

        {/* TOP FANS TAB - REAL NAMES */}
        {tab === 'Fans' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">👑 Top Fans - {category}</h2>
            {topFans.length === 0? <p className="text-center text-gray-500">No votes today</p> :
              topFans.map((fan, i) => (
                <div key={i} className="bg-[#13131a] p-3 rounded-xl mb-3 flex items-center gap-3">
                  <span className="text-xl font-bold text-[#a8ff00]">#{i+1}</span>
                  <img src={fan.photo} className="w-12 h-12 rounded-full"/>
                  <div className="flex-1">
                    <p className="font-bold">{fan.name}</p>
                    <p className="text-xs text-gray-400">{fan.votes} votes today</p>
                  </div>
                  {i === 0 && <span className="text-2xl">👑</span>}
                  {i === 1 && <span className="text-2xl">🥈</span>}
                  {i === 2 && <span className="text-2xl">🥉</span>}
                </div>
              ))
            }
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'History' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-[#a8ff00]">📜 Your {category} Battle History</h2>{user && battleHistory.length > 0 && <button onClick={handleDeleteHistory} className="bg-red-600 px-3 py-1 rounded-lg text-sm font-bold">🗑️ Clear</button>}</div>
            {!user? <p className="text-gray-500 text-center">Login required</p> : battleHistory.length === 0? <p className="text-gray-500 text-center">No battles yet</p> : battleHistory.map((h,i) => (<div key={i} className="bg-[#13131a] p-3 rounded-xl"><p className="text-sm text-gray-400">Battle {h.battleNo} • {h.date}</p><p className="font-bold">{h.players[0]} vs {h.players[1]}</p><p className="text-sm text-[#a8ff00]">You voted: {h.votedFor}</p></div>))}
          </div>
        )}
      </div>

      {/* RESULT CARD MODAL */}
      {showResultCard && battle[0] && battle[1] && (
        <div onClick={() => setShowResultCard(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-gradient-to-br from-[#1e3a5f] to-[#0a0e1a] p-6 rounded-3xl w-full max-w-sm border-2 border-[#a8ff00]">
            <h2 className="text-center text-2xl font-bold mb-1">FanClash {category}</h2><p className="text-center text-gray-400 text-sm mb-4">Battle #{battleNo-1} Result</p>
            <div className="flex gap-3 items-center mb-4">{[battle[0], battle[1]].map(p => {const total = battle[0].votes + battle[1].votes; const percent = total > 0? ((p.votes / total) * 100).toFixed(0) : 50; return (<div key={p.id} className="flex-1 text-center p-3 rounded-2xl bg-[#13131a]"><div className="w-16 h-16 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-2xl font-bold">{p.name[0]}</div><p className="font-bold text-sm">{p.name}</p><p className="text-2xl font-bold text-[#a8ff00]">{percent}%</p></div>)})}</div>
            <button onClick={() => alert("Take screenshot and share it! 📸")} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-bold">📸 Screenshot</button>
            <button onClick={() => setShowResultCard(false)} className="w-full bg-[#23232b] py-2 rounded-xl font-bold mt-2">Close</button>
          </div>
        </div>
      )}

      {/* TOURNAMENT MODAL */}
      {tournament && (
        <div onClick={() => setTournament(null)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-4">🏆 Round {tournament.round}</h2>
            <div className="space-y-2">{tournament.matches.map((match, i) => (<div key={i} className="bg-[#0a0a0f] p-3 rounded-xl flex justify-between items-center"><span>{match[0].name}</span> <span className="text-[#a8ff00]">VS</span> <span>{match[1].name}</span></div>))}</div>
            <button onClick={() => setTournament(null)} className="w-full bg-[#23232b] py-2 rounded-xl mt-3 font-bold">Close</button>
          </div>
        </div>
      )}

      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4"><p>© 2026 <span className="text-white font-bold">FanClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p></footer>
    </div>
  );
}
