import React, { useState, useEffect, useCallback } from 'react';
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
]
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

  // PHONE OTP STATES
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

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
  }, [])

  const getPercentage = (p1, p2) => {
    const total = (p1?.votes || 0) + (p2?.votes || 0);
    if(total === 0) return 50;
    return ((p1?.votes || 0) / total) * 100;
  }

  // PHONE LOGIN
  const setupRecaptcha = () => {
    if(!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
    }
  }
  const sendOTP = async () => {
    if(phone.length!== 10) return alert("Enter 10 digit number");
    setAuthLoading(true); setupRecaptcha();
    const confirmation = await signInWithPhoneNumber(auth, "+91" + phone, window.recaptchaVerifier);
    window.confirmationResult = confirmation; setShowOTP(true); setAuthLoading(false);
  }
  const verifyOTP = async () => {
    if(otp.length!== 6) return alert("Enter 6 digit OTP");
    setAuthLoading(true); await window.confirmationResult.confirm(otp); setAuthLoading(false);
  }

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
    const newBadges = [...badges];
    if(votesToday === 0 &&!badges.includes('First Vote')) newBadges.push('First Vote');
    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: today, streak: streak + 1, badges: newBadges });
    const playerSnap = await get(playerRef); await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });
    const statsSnap = await get(statsRef); await update(statsRef, { totalVotes: (statsSnap.val()?.totalVotes || 0) + 1 });
    setVotesToday(votesToday + 1); setBadges(newBadges); setTimeout(() => handleSkip(), 800);
  }
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const statsRef = ref(db, `stats`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val(); const today = new Date().toISOString().split('T')[0];
          if(userData){
            if(userData.lastVoteDate === today){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); update(userRef, {votesToday: 0, lastVoteDate: today}); }
            setStreak(userData.streak || 0); setBadges(userData.badges || []);
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
        setPlayers(playersArray); setTopPlayer([...playersArray].sort((a,b) => (b.votes||0) - (a.votes||0))[0]);
      } else {
        const initialPlayers = {}; ALL_PLAYERS.forEach((p, index) => { initialPlayers[index] = {...p, id: index}; });
        set(playersRef, initialPlayers);
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle])
  useEffect(() => { const close = () => setShowProfile(false); document.addEventListener('click', close); return () => document.removeEventListener('click', close); }, []);
  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>

  if(!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white p-4">
        <div className="text-center w-full max-w-sm">
          <h1 className="text-4xl font-bold">Crick<span className="text-orange-400">Clash</span></h1>
          <p className="text-gray-400 mt-2 mb-10">The Ultimate Cricket Voting Platform</p>
          <button onClick={handleGoogleLogin} disabled={authLoading} className="w-full bg-white text-black px-8 py-4 rounded-full font-bold mb-4">Sign In with Google</button>
          <p className="text-gray-500 mb-4">OR</p>
          {!showOTP? (
            <div><input type="number" placeholder="Enter 10 Digit Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-full px-6 py-4 mb-3 text-white"/>
            <button onClick={sendOTP} disabled={authLoading} className="w-full bg-[#34A853] text-white px-8 py-4 rounded-full font-bold">GET OTP</button></div>
          ) : (
            <div><input type="number" placeholder="Enter 6 Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-full px-6 py-4 mb-3 text-white"/>
            <button onClick={verifyOTP} disabled={authLoading} className="w-full bg-[#34A853] text-white px-8 py-4 rounded-full font-bold">VERIFY & LOGIN</button></div>
          )}
        </div><div id="recaptcha-container"></div>
        <footer className="text-center mt-10 text-gray-500 text-sm"> © 2026 CrickClash™ | A Production By ANESH </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-orange-400">Clash</span></h1></div>
          <button onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile)}} className="w-10 h-10 rounded-full bg-[#a8ff00] text-black font-bold">{user.displayName?.[0] || user.phoneNumber?.[3] || 'U'}</button>
          {showProfile && (<div className="absolute right-4 mt-12 w-44 bg-[#1A1A1A] rounded-xl shadow-2xl z-50"><button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400">Logout</button></div>)}
        </header>

        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm">Today's Votes Left - Resets at 12 AM</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{DAILY_VOTE_LIMIT - votesToday} / {DAILY_VOTE_LIMIT}</p>
        </div>

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
        </div>

        {tab === 'Battle' && battle[0] && battle[1] && (
          <div>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                <img src={battle[0].image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" />
                <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs">{battle[0].role}</span>
                <h3 className="text-xl font-bold mt-3">{battle[0].name}</h3>
                <button onClick={() => handleVote(battle[0].id)} disabled={votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>VOTE</button>
              </div>
              <span className="text-3xl font-bold text-orange-400">VS</span>
              <div className="bg-gradient-to-b from-[#4a1e5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                <img src={battle[1].image} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover" />
                <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs">{battle[1].role}</span>
                <h3 className="text-xl font-bold mt-3">{battle[1].name}</h3>
                <button onClick={() => handleVote(battle[1].id)} disabled={votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700' : 'bg-[#a8ff00] text-black'}`}>VOTE</button>
              </div>
            </div>
            <button onClick={handleSkip} className="bg-[#23232b] w-full py-3 rounded-xl font-bold mt-6">⏭️ Skip</button>
          </div>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {Object.values(players.reduce((acc, player) => { if (acc[player.name]) { acc[player.name].votes += player.votes || 0; } else { acc[player.name] = {...player }; } return acc; }, {})).sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
              <div key={p.name} className="bg-[#13131a] p-3 rounded-lg mb-2 flex justify-between items-center">
                <div className="flex items-center gap-2"><img src={p.image} className="w-10 h-10 rounded-full object-cover"/><span>{i+1}. {p.name}</span></div>
                <span className="text-[#a8ff00] font-bold">{p.votes||0} votes</span>
              </div>
            ))}
          </div>
        )}
        <footer className="text-center mt-10 text-gray-500 text-sm"> © 2026 CrickClash™ </footer>
      </div>
    </div>
  );
            }
