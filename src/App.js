import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
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

// IMAGE PROXY: phone lo block avvakunda undataniki
const getImg = (url) => `https://images.weserv.nl/?url=${url.replace('https://', '')}&w=200&h=200&fit=cover`;

const ALL_PLAYERS = [
  // BATTERS - 20
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg') },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg') },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg') },
  { id: "shubman-gill-bat", name: 'Shubman Gill', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/352400/352496.6.jpg') },
  { id: "suryakumar-yadav", name: 'Suryakumar Yadav', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313105.6.jpg') },
  { id: "tilak-varma", name: 'Tilak Varma', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369451.6.jpg') },
  { id: "rahul-dravid-bat", name: 'Rahul Dravid', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313106.6.jpg') },
  { id: "virendra-sehwag", name: 'Virender Sehwag', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313107.6.jpg') },
  { id: "abhishek-sharma", name: 'Abhishek Sharma', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/380100/380121.6.jpg') },
  { id: "vaibhav-suryavanshi", name: 'Vaibhav Suryavanshi', role: 'BATTER', votes: 0, image: getImg('https://assets.iplt20.com/ipl/IPLHeadshot2025/28406.png') },
  { id: "yashasvi-jaiswal", name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/352400/352497.6.jpg') },
  { id: "kl-rahul-bat", name: 'KL Rahul', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313108.6.jpg') },
  { id: "sunil-gavaskar", name: 'Sunil Gavaskar', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313109.6.jpg') },
  { id: "vvs-laxman", name: 'VVS Laxman', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313110.6.jpg') },
  { id: "yuvraj-singh", name: 'Yuvraj Singh', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313111.6.jpg') },
  { id: "priyansh-arya", name: 'Priyansh Arya', role: 'BATTER', votes: 0, image: getImg('https://assets.iplt20.com/ipl/IPLHeadshot2025/21514.png') },
  { id: "sai-sudarshan", name: 'Sai Sudharsan', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/370600/370640.6.jpg') },
  { id: "devdutt-padikkal", name: 'Devdutt Padikkal', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313112.6.jpg') },
  { id: "rinku-singh", name: 'Rinku Singh', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369452.6.jpg') },
  { id: "ruturaj-gaikwad", name: 'Ruturaj Gaikwad', role: 'BATTER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313113.6.jpg') },

  // BOWLERS - 11
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313114.6.jpg') },
  { id: "bhuvneshwar-kumar", name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313115.6.jpg') },
  { id: "mohammed-shami", name: 'Mohammed Shami', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313116.6.jpg') },
  { id: "mohammed-siraj", name: 'Mohammed Siraj', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313117.6.jpg') },
  { id: "prasidh-krishna", name: 'Prasidh Krishna', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369453.6.jpg') },
  { id: "kuldeep-yadav", name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313118.6.jpg') },
  { id: "ishant-sharma", name: 'Ishant Sharma', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313119.6.jpg') },
  { id: "umesh-yadav", name: 'Umesh Yadav', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313120.6.jpg') },
  { id: "harbhajan-singh", name: 'Harbhajan Singh', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313121.6.jpg') },
  { id: "yuzvendra-chahal", name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313122.6.jpg') },
  { id: "harshal-patel", name: 'Harshal Patel', role: 'BOWLER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369454.6.jpg') },

  // ALL-ROUNDERS - 10
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg') },
  { id: "krunal-pandya", name: 'Krunal Pandya', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313124.6.jpg') },
  { id: "nitish-reddy", name: 'Nitish Reddy', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://assets.iplt20.com/ipl/IPLHeadshot2025/28406.png') },
  { id: "kapil-dev", name: 'Kapil Dev', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313125.6.jpg') },
  { id: "ravindra-jadeja-ar", name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313126.6.jpg') },
  { id: "ravichandran-ashwin", name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313127.6.jpg') },
  { id: "anil-kumble", name: 'Anil Kumble', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313128.6.jpg') },
  { id: "shivam-dube", name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/369400/369455.6.jpg') },
  { id: "axar-patel", name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313129.6.jpg') },

  // KEEPERS - 6
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg') },
  { id: "rishabh-pant-kp", name: 'Rishabh Pant', role: 'KEEPER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313131.6.jpg') },
  { id: "ishan-kishan", name: 'Ishan Kishan', role: 'KEEPER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313132.6.jpg') },
  { id: "dinesh-karthik", name: 'Dinesh Karthik', role: 'KEEPER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313133.6.jpg') },
  { id: "prabhsimran-singh", name: 'Prabhsimran Singh', role: 'KEEPER', votes: 0, image: getImg('https://assets.iplt20.com/ipl/IPLHeadshot2025/28406.png') },
  { id: "sanju-samson", name: 'Sanju Samson', role: 'KEEPER', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313134.6.jpg') },

  // CAPTAINS - 11
  { id: "virat-kohli-cap", name: 'Virat Kohli', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg') },
  { id: "rohit-sharma-cap", name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg') },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313130.6.jpg') },
  { id: "sachin-tendulkar-cap", name: 'Sachin Tendulkar', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg') },
  { id: "rahul-dravid-cap", name: 'Rahul Dravid', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313106.6.jpg') },
  { id: "kapil-dev-cap", name: 'Kapil Dev', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313125.6.jpg') },
  { id: "hardik-pandya-cap", name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313123.6.jpg') },
  { id: "kl-rahul-cap", name: 'KL Rahul', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313108.6.jpg') },
  { id: "rishabh-pant-cap", name: 'Rishabh Pant', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313131.6.jpg') },
  { id: "shubman-gill-cap", name: 'Shubman Gill', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/352400/352496.6.jpg') },
  { id: "ravindra-jadeja-cap", name: 'Ravindra Jadeja', role: 'CAPTAIN', votes: 0, image: getImg('https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313126.6.jpg') }
]
export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([null, null]);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle'); // Battle, Rankings, Debate, Profile
  const [votesToday, setVotesToday] = useState(0);
  const [todayTotalVotes, setTodayTotalVotes] = useState(0);
  const [badges, setBadges] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [phone, setPhone] = useState(""); const [otp, setOtp] = useState(""); const [showOTP, setShowOTP] = useState(false); const [authLoading, setAuthLoading] = useState(false);

  // NEW STATES
  const [debates, setDebates] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const generateBattle = useCallback((playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) { setBattle([null, null]); return; }
    let p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) { p2 = filtered[Math.floor(Math.random() * filtered.length)]; }
    setBattle([p1, p2]);
  }, [])

  const setupRecaptcha = () => { if(!window.recaptchaVerifier) { window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' }); } }
  const sendOTP = async () => { if(phone.length!== 10) return alert("Enter 10 digit"); setAuthLoading(true); setupRecaptcha(); const confirmation = await signInWithPhoneNumber(auth, "+91" + phone, window.recaptchaVerifier); window.confirmationResult = confirmation; setShowOTP(true); setAuthLoading(false); }
  const verifyOTP = async () => { if(otp.length!== 6) return alert("Enter 6 digit"); setAuthLoading(true); await window.confirmationResult.confirm(otp); setAuthLoading(false); }
  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Logout?")) { await signOut(auth); setShowProfile(false); } }
  const handleSkip = () => { generateBattle(players, filter); }

  const handleVote = async (votedPlayerId) => {
    if(!user || votesToday >= DAILY_VOTE_LIMIT) return;
    const today = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const statsRef = ref(db, `stats`);
    const newBadges = [...badges]; if(votesToday === 0 &&!badges.includes('First Vote')) newBadges.push('First Vote');
    const statsSnap = await get(statsRef);
    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today, badges: newBadges });
    const playerSnap = await get(playerRef); await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });
    await update(statsRef, { todayTotalVotes: (statsSnap.val()?.todayTotalVotes || 0) + 1, lastResetDate: today });
    setVotesToday(votesToday + 1); setBadges(newBadges); setTimeout(() => handleSkip(), 800);
  }

  // NEW: DEBATE FUNCTION
  const postComment = async () => {
    if(!newComment.trim() ||!user) return;
    const debateRef = ref(db, 'debates');
    await push(debateRef, {
      text: newComment,
      userId: user.uid,
      userName: user.displayName || user.phoneNumber,
      timestamp: serverTimestamp()
    });
    setNewComment("");
  }

  // NEW: DM FUNCTION
  const sendMessage = async () => {
    if(!newMessage.trim() ||!activeChat) return;
    const chatId = [user.uid, activeChat.uid].sort().join('_');
    const messageRef = ref(db, `chats/${chatId}`);
    await push(messageRef, {
      text: newMessage,
      sender: user.uid,
      timestamp: serverTimestamp()
    });
    setNewMessage("");
    }
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); setLoading(false);
      if(currentUser) {
        // Update user info in DB
        set(ref(db, `users/${currentUser.uid}/info`), {
          name: currentUser.displayName || currentUser.phoneNumber,
          photo: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}`
        })

        const userRef = ref(db, `users/${currentUser.uid}`);
        const statsRef = ref(db, `stats`);
        const debateRef = ref(db, 'debates');
        const usersRef = ref(db, 'users');

        onValue(userRef, (snapshot) => {
          const userData = snapshot.val(); const today = new Date().toISOString().split('T')[0];
          if(userData){
            if(userData.lastVoteDate === today){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); update(userRef, {votesToday: 0, lastVoteDate: today}); }
            setBadges(userData.badges || []);
          } else { set(userRef, {votesToday: 0, lastVoteDate: today, badges: []}); }
        });

        // DAILY RESET FOR TOTAL VOTES
        onValue(statsRef, (snapshot) => {
          const statsData = snapshot.val() || {};
          const today = new Date().toISOString().split('T')[0];
          if(statsData.lastResetDate!== today) {
            update(statsRef, { todayTotalVotes: 0, lastResetDate: today });
            setTodayTotalVotes(0);
          } else { setTodayTotalVotes(statsData.todayTotalVotes || 0); }
        });

        // GET ALL DEBATES
        onValue(debateRef, (snapshot) => {
          const data = snapshot.val();
          setDebates(data? Object.keys(data).map(key => ({id: key,...data[key]})).reverse() : []);
        });

        // GET ALL USERS FOR DM
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          setAllUsers(data? Object.keys(data).map(key => ({uid: key,...data[key].info})).filter(u => u.uid!== currentUser.uid) : []);
        });
      }
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 5) {
        const playersArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setPlayers(playersArray);
      } else {
        const initialPlayers = {}; ALL_PLAYERS.forEach((p, index) => { initialPlayers[index] = {...p, id: index}; });
        set(playersRef, initialPlayers);
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle])

  // LISTEN TO ACTIVE CHAT MESSAGES
  useEffect(() => {
    if(!activeChat ||!user) return;
    const chatId = [user.uid, activeChat.uid].sort().join('_');
    const messageRef = ref(db, `chats/${chatId}`);
    onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      setChats(data? Object.keys(data).map(key => ({id: key,...data[key]})) : []);
    });
  }, [activeChat, user])
  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>

  if(!user) { /* Login UI same as before */ }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Crick<span className="text-orange-400">Clash</span></h1>
          <button onClick={() => setTab('Profile')} className="w-10 h-10 rounded-full bg-[#a8ff00] overflow-hidden">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-full h-full object-cover"/>
          </button>
        </header>

        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm">Today's Total Votes - Resets 12AM</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{todayTotalVotes}</p>
        </div>

        <div className="flex justify-around border-b border-gray-800 mb-4 text-sm">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Debate')} className={`pb-2 font-bold ${tab === 'Debate'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>💬 Debate</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>🏆 Top</button>
        </div>

        {/* BATTLE TAB */}
        {tab === 'Battle' && battle[0] && (
          <div>{/* Battle UI same as before with images */}</div>
        )}

        {/* DEBATE TAB */}
        {tab === 'Debate' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Kohli vs Dhoni - Who is GOAT? 🔥</h2>
            <div className="h-96 overflow-y-auto mb-4 space-y-3">
              {debates.map(d => (
                <div key={d.id} className="bg-[#1A1A1A] p-3 rounded-xl">
                  <p className="font-bold text-sm text-[#a8ff00]">{d.userName}</p>
                  <p>{d.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Your opinion..." className="w-full bg-[#1A1A1A] rounded-full px-4 py-2"/>
              <button onClick={postComment} className="bg-[#a8ff00] text-black px-4 rounded-full font-bold">Post</button>
            </div>
          </div>
        )}

        {/* PROFILE / DM TAB - Instagram Style */}
        {tab === 'Profile' && (
          <div>
            {!activeChat? (
              <div>
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                {allUsers.map(u => (
                  <div key={u.uid} onClick={() => setActiveChat(u)} className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded-xl mb-2 cursor-pointer">
                    <img src={u.photo} className="w-12 h-12 rounded-full"/>
                    <p className="font-bold">{u.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => setActiveChat(null)} className="mb-2">← Back</button>
                <h2 className="text-xl font-bold mb-4">Chat with {activeChat.name}</h2>
                <div className="h-80 overflow-y-auto mb-4 space-y-2">
                  {chats.map(c => (
                    <div key={c.id} className={`p-2 rounded-lg max-w-[80%] ${c.sender === user.uid? 'bg-[#a8ff00] text-black ml-auto' : 'bg-[#1A1A1A]'}`}>{c.text}</div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Message..." className="w-full bg-[#1A1A1A] rounded-full px-4 py-2"/>
                  <button onClick={sendMessage} className="bg-[#a8ff00] text-black px-4 rounded-full font-bold">Send</button>
                </div>
              </div>
            )}
          </div>
        )}
        <footer className="text-center mt-10 text-gray-500 text-sm"> © 2026 CrickClash™  A Production By ANESH </footer>
      </div>
    </div>
  );
  }
