import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment, push } from 'firebase/database';

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
const GUEST_FREE_VOTES = 3;
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
  const [guestVotesUsed, setGuestVotesUsed] = useState(0); // NEW

  // PART 1: PROFILE STATES
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [followers, setFollowers] = useState({});
  const [following, setFollowing] = useState({});
  const [isVerified, setIsVerified] = useState(false);

  const getToday = () => new Date().toISOString().split('T')[0];
  const getWeekNumber = () => { const d = new Date(); d.setHours(0,0,0); d.setDate(d.getDate() + 4 - (d.getDay()||7)); return d.getFullYear() + '-W' + String(Math.ceil(((d - new Date(d.getFullYear(),0,1))/86400000 + 1)/7)).padStart(2,'0'); };

  const getTimeUntilNextVote = (lastVoteTime) => {
    if (!lastVoteTime) return 0;
    const nextVoteTime = new Date(lastVoteTime).getTime() + VOTE_COOLDOWN_HOURS * 60 * 60 * 1000;
    const diff = nextVoteTime - Date.now();
    return diff > 0? diff : 0;
  };

  // PART 1: UPDATED
  const canVoteNow = () => {
    const timeLeft = getTimeUntilNextVote(user?.lastVoteTime);
    if(!user) return guestVotesUsed < GUEST_FREE_VOTES && timeLeft === 0;
    const votesUsed = votesToday[category];
    return votesUsed < DAILY_VOTE_LIMIT && timeLeft === 0;
  }
  const getVotesLeftText = () => { if(!user) return `${GUEST_FREE_VOTES - guestVotesUsed}/${GUEST_FREE_VOTES}`; return `${DAILY_VOTE_LIMIT - votesToday[category]}/6`; }
  const getBattleKey = () => battle[0] && battle[1]? `${category}-${battle[0].id}-${battle[1].id}-B${battleNo}` : null;

  // PART 1: FOLLOW FUNCTION
  const handleFollow = async (targetUid) => {
    if(!user) return alert("Login required");
    const myRef = ref(db, `users/${user.uid}/following/${targetUid}`);
    const theirRef = ref(db, `users/${targetUid}/followers/${user.uid}`);
    if(following[targetUid]) { await remove(myRef); await remove(theirRef); }
    else {
      await set(myRef, true);
      await set(theirRef, true);
      await push(ref(db, `notifications/${targetUid}`), {type: 'follow', from: user.uid, fromName: username, time: Date.now(), read: false});
    }
    }
    // PART 2: CHAT STATES
  const [chatTab, setChatTab] = useState('DM');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [activeChat, setActiveChat] = useState(null);

  // PART 2: CHAT FUNCTIONS
  const sendMessage = async () => { if(!user ||!chatInput.trim() ||!activeChat) return; const msgRef = push(ref(db, `chats/${activeChat.id}/messages`)); await set(msgRef, {from: user.uid, fromName: username, text: chatInput, time: Date.now(), type: 'text'}); setChatInput(""); }

  useEffect(() => { if(!activeChat) return; const unsub = onValue(ref(db, `chats/${activeChat.id}/messages`), (snap) => { const data = snap.val(); setMessages(data? Object.values(data).sort((a,b) => a.time - b.time) : []); }); return () => unsub(); }, [activeChat]);
    // PART 3: VOICE STATES
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  // PART 3: VOICE + CALL FUNCTIONS
  const startRecording = async () => { const stream = await navigator.mediaDevices.getUserMedia({audio: true}); const recorder = new MediaRecorder(stream); recorder.onstop = async () => { await set(push(ref(db, `chats/${activeChat.id}/messages`)), {from: user.uid, fromName: username, text: '🎤 Voice message', time: Date.now(), type: 'voice'}); }; recorder.start(); mediaRecorderRef.current = recorder; setIsRecording(true); }
  const stopRecording = () => { mediaRecorderRef.current.stop(); setIsRecording(false); }
  const startCall = () => alert("Add Agora SDK for real 1-1 / Group Voice & Video Calls");
    // PART 4A: NOTIFICATION STATES
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // PART 4A: LOAD NOTIFICATIONS
  useEffect(() => { if(!user) return; const unsub = onValue(ref(db, `notifications/${user.uid}`), (snap) => { const data = snap.val(); setNotifications(data? Object.values(data).reverse() : []); }); return () => unsub(); }, [user]);

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

  // PART 1 UPDATED: HANDLE VOTE WITH GUEST
  const handleVote = async (votedPlayerId) => {
    if(!user) {
      if(guestVotesUsed >= GUEST_FREE_VOTES) { alert("3 free votes ayipoyayi! Login chey bro 👑"); await signInWithPopup(auth, googleProvider); return; }
      setGuestVotesUsed(prev => prev + 1); setVoteAnim(votedPlayerId); setTimeout(() => setVoteAnim(null), 500);
      const updatedPlayers = players.map(p => p.id === votedPlayerId? {...p, votes: p.votes + 1} : p);
      setPlayers(updatedPlayers); setTotalVotes(prev => prev + 1); generateBattle(updatedPlayers, filter);
      return;
    }
    const timeLeftMs = getTimeUntilNextVote(user?.lastVoteTime);
    if(votesToday[category] >= DAILY_VOTE_LIMIT || timeLeftMs > 0 || isVoting) {
      const mins = Math.ceil(timeLeftMs / 1000 / 60);
      return alert(`6 votes ayipoyayi! Next vote in ${Math.floor(mins/60)}h ${mins%60}m`);
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
    const text = `Who's your pick ${battle[0]?.name} vs ${battle[1]?.name} on FanClash ${category}! ⚔️`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'FanClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Copied!"); }
  };

  const handleRefer = async () => {
    if(!user) return alert("Login required");
    const refLink = `${window.location.origin}?ref=${user.uid}`;
    navigator.clipboard.writeText(`FanClash lo vote chey! ${refLink}`);
    alert("Referral link copied! Extra vote vastundi 🔥");
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
      setStreak(0);
      setBadges([]);
      setBattleHistory([]);
      setGuestVotesUsed(0);
    }
  };

  useEffect(() => {
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

    // PART 1 UPDATED: AUTH WITH PROFILE CREATE
    const authUnsub = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(false);
      if(currentUser) {
        setUser(currentUser); setGuestVotesUsed(0);
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snap = await get(userRef);
        if(!snap.exists()){
          await set(userRef, {uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName, photoURL: currentUser.photoURL, username: currentUser.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random()*1000), bio: "", followers: {}, following: {}, isVerified: false, createdAt: Date.now()});
        }
        const userData = snap.val(); setUsername(userData?.username || ""); setBio(userData?.bio || ""); setFollowers(userData?.followers || {}); setFollowing(userData?.following || {}); setIsVerified(userData?.isVerified || false);
        const userUnsub = onValue(ref(db, `users/${currentUser.uid}/${category}`), (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            setVotesToday(prev => ({...prev, [category]: userData.lastVoteDate === getToday()? userData.votesToday || 0 : 0}))
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
            setUser({...currentUser, lastVoteTime: userData.lastVoteTime});
          }
        });
        return () => userUnsub();
      } else {
        setVotesToday({Cricket: 0, Football: 0, Movies: 0});
        setStreak(0);
        setBadges([]);
        setBattleHistory([]);
        setUser(null);
      }
    });

    return () => { metaUnsub(); playersUnsub(); authUnsub(); }
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

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor(diff / 1000 / 60) % 60;
      const s = Math.floor(diff / 1000) % 60;
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const days = ['Cricket', 'Football', 'Movies'];
    const todayIndex = new Date().getDay() % 3;
    setCategory(days[todayIndex]);
  }, []);

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

      {/* PLAYER DETAIL MODAL */}
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

      {/* PART 1: UPDATED PROFILE MODAL */}
      {showProfile && user && (
        <div onClick={() => setShowProfile(false)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-6 rounded-2xl w-full max-w-sm">
            <div className="relative">
              <img src={user.photoURL} className="w-20 h-20 rounded-full mx-auto border-4 border-[#a8ff00]"/>
              {isVerified && <span className="absolute top-2 right-[35%] bg-blue-500 text-white text-xs px-1 rounded-full">✓</span>}
            </div>
            <h2 className="text-xl font-bold text-center mt-2">@{username}</h2>
            <p className="text-center text-gray-400 text-sm">{bio || user.email}</p>
            <p className="text-center text-sm mt-1">{Object.keys(followers).length} Followers • {Object.keys(following).length} Following</p>
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
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">FanClash</h1><p className="text-xs text-gray-400">ANESH Innovation</p></div>
          <div className="flex gap-3 items-center">
            {/* PART 4A: NOTIFICATION BELL */}
            {user && <button onClick={() => setShowNotif(!showNotif)} className="relative text-xl">🔔{notifications.filter(n=>!n.read).length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-4 h-4 rounded-full">{notifications.filter(n=>!n.read).length}</span>}</button>}
            {user? <img src={user.photoURL} onClick={() => setShowProfile(!showProfile)} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" /> : <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-full font-bold text-sm">Login</button>}
          </div>
        </header>

        <div className="flex justify-center gap-2 mb-4 bg-[#13131a] p-1 rounded-2xl">{Object.keys(ALL_DATA).map(cat => (<button key={cat} onClick={() => setCategory(cat)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${category === cat? 'bg-[#a8ff00] text-black' : 'text-gray-400'}`}>{cat === 'Cricket' && '🏏 '}{cat === 'Football' && '⚽ '}{cat === 'Movies' && '🎬 '}{cat}</button>))}</div>

        {/* PART 1 UPDATED: VOTES LEFT */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-2xl mb-3 text-center">
          <p className="text-sm font-bold">🔥 Daily Fan Battle</p>
          <p className="text-lg font-bold">{category === 'Cricket' && 'Best Cricketer of All Time?'}{category === 'Football' && 'GOAT Football Debate'}{category === 'Movies' && 'King of Indian Cinema?'}</p>
          <p className="text-xs">Votes Left: {getVotesLeftText()}</p>
          {!user && <p className="text-xs text-yellow-300">3 FREE votes for guests!</p>}
          {getTimeUntilNextVote(user?.lastVoteTime) > 0 && (<p className="text-xs text-yellow-300">Next vote in: {Math.floor(getTimeUntilNextVote(user?.lastVoteTime)/1000/60/60)}h {Math.floor(getTimeUntilNextVote(user?.lastVoteTime)/1000/60%60)}m</p>)}
        </div>

        {/* PART 2: TABS WITH CHAT */}
        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Chat')} className={`pb-2 font-bold ${tab === 'Chat'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>💬 Chat</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`pb-2 font-bold ${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>📜 History</button>
        </div>

        {/* PART 2: CHAT TAB */}
        {tab === 'Chat' && (
          <div>
            <div className="flex gap-2 mb-3"><button onClick={() => setChatTab('DM')} className={`flex-1 py-2 rounded-xl ${chatTab==='DM'?'bg-[#a8ff00] text-black':'bg-[#13131a]'}`}>DM</button><button onClick={() => setChatTab('Groups')} className={`flex-1 py-2 rounded-xl ${chatTab==='Groups'?'bg-[#a8ff00] text-black':'bg-[#13131a]'}`}>Fan Clubs</button></div>
            {!activeChat? <p className="text-center text-gray-500">Select a chat</p> : (
              <div>
                <div className="bg-[#13131a] p-2 rounded-xl mb-2 flex justify-between"><p className="font-bold">{activeChat.name}</p><button onClick={startCall}>📞</button></div>
                <div className="bg-[#13131a] p-3 rounded-xl h-80 overflow-y-auto mb-2">{messages.map(m => <p key={m.time} className={`mb-1 ${m.from===user.uid?'text-right text-[#a8ff00]':''}`}>{m.text}</p>)}</div>
                <div className="flex gap-2"><button onClick={isRecording? stopRecording : startRecording} className="bg-[#23232b] px-3 rounded-lg">{isRecording?'⏹️':'🎤'}</button><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Message..." className="flex-1 bg-[#0a0a0f] p-2 rounded-lg"/><button onClick={sendMessage} className="bg-[#a8ff00] text-black px-4 rounded-lg font-bold">Send</button></div>
              </div>
            )}
          </div>
        )}

        {/* PART 4A: NOTIFICATION DROPDOWN */}
        {showNotif && <div className="fixed right-4 top-14 bg-[#13131a] p-3 rounded-xl w-72 z-50"><h3 className="font-bold mb-2">Notifications</h3>{notifications.length === 0? <p className="text-sm text-gray-500">No new</p> : notifications.slice(0,10).map((n,i) => <p key={i} className="text-sm py-1">{n.type === 'follow' && `${n.fromName} followed you`}</p>)}</div>}

        {/* REST OF YOUR UI CODE - BATTLE, RANKINGS, HISTORY TABS */}
        {tab === 'Battle' && battle[0] && battle[1] && (
          <div>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>
            <div className="flex gap-2">
              {[battle[0], battle[1]].map(p => (
                <div key={p.id} onClick={() => setSelectedPlayer(p)} className={`bg-[#13131a] p-4 rounded-2xl w-1/2 text-center ${voteAnim === p.id? 'vote-pop' : ''}`}>
                  <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-3xl font-bold">{p.name[0]}</div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-800">{p.role}</span>
                  <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                  <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                  <button onClick={(e) => {e.stopPropagation(); handleVote(p.id)}} disabled={isVoting ||!canVoteNow()} className={`w-full py-3 rounded-xl font-bold mt-2 ${!canVoteNow()? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>
                    {isVoting? 'VOTING...' :!canVoteNow()? `WAIT ${Math.floor(getTimeUntilNextVote(user?.lastVoteTime)/1000/60/60)}h` : 'VOTE'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
        }
