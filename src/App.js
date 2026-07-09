import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider,
  RecaptchaVerifier, signInWithPhoneNumber
} from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, push, get, increment, query, orderByChild, equalTo } from 'firebase/database';

// ===== FIREBASE CONFIG =====
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
const REFERRAL_BONUS = 3; // NEW

// ===== ALL PLAYERS DATA - 57 PLAYERS =====
const ALL_PLAYERS = [
  // BATTERS
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313101.6.jpg' },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313102.6.jpg' },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0, image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/313100/313103.6.jpg' },
  //... MIGATA 54 PLAYERS SAME AS BEFORE... COPY FROM PREVIOUS MESSAGE
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
  const [debates, setDebates] = useState([]);
  const [debateText, setDebateText] = useState('');
  const [referrals, setReferrals] = useState(0); // NEW

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
    }
  }, []);

  const sendOtp = async () => {
    if(phoneNumber.length!== 10) return alert("Enter valid 10 digit number")
    const appVerifier = window.recaptchaVerifier;
    try {
      const result = await signInWithPhoneNumber(auth, "+91" + phoneNumber, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
      alert("OTP sent!")
    } catch (error) {
      alert("Error: " + error.message)
    }
  };

  const verifyOtp = async () => {
    try{ await confirmationResult.confirm(otp); }
    catch{ alert("Invalid OTP") }
  };

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => {
    if(window.confirm("Logout?")){ await signOut(auth); setShowProfile(false); }
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
  }, [])

  const getPercentage = (p1, p2) => {
    const total = (p1?.votes || 0) + (p2?.votes || 0);
    if(total === 0) return 50;
    return ((p1?.votes || 0) / total) * 100;
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref'); // NEW: Check referral link

    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); setLoading(false);
      if(currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const statsRef = ref(db, `stats`);
        const today = new Date().toISOString().split('T')[0];

        // NEW: Handle Referral on first login
        get(userRef).then((snapshot) => {
          if(!snapshot.exists() && refId && refId!== currentUser.uid){
            update(ref(db, `users/${refId}`), { referrals: increment(1), votesToday: increment(REFERRAL_BONUS) });
            update(userRef, { referredBy: refId, votesToday: REFERRAL_BONUS });
          }
        })

        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === today){
              setVotesToday(userData.votesToday || 0);
            } else {
              setVotesToday(0);
              update(userRef, {votesToday: 0, lastVoteDate: today});
            }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setReferrals(userData.referrals || 0); // NEW
          } else {
            set(userRef, {votesToday: 0, lastVoteDate: today, streak: 0, badges: [], referrals: 0});
          }
        });
        onValue(statsRef, (snapshot) => { setTotalVotes(snapshot.val()?.totalVotes || 0); });
      }
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.keys(data).map(key => ({ id: Number(key),...data[key] }));
        setPlayers(playersArray);
        const sorted = [...playersArray].sort((a,b) => (b.votes||0) - (a.votes||0));
        setTopPlayer(sorted[0]);
      } else {
        const initialPlayers = {}; ALL_PLAYERS.forEach((p, index) => { initialPlayers[index] = {...p, id: index}; });
        set(playersRef, initialPlayers);
      }
    });

    const debatesRef = ref(db, 'debates');
    onValue(debatesRef, (snapshot) => {
      const data = snapshot.val();
      if(data) {
        const debatesArray = Object.keys(data).map(key => ({ id: key,...data[key] }));
        setDebates(debatesArray.sort((a,b) => b.likes - a.likes));
      }
    });
  }, []);

  useEffect(() => { if(players.length > 0) generateBattle(players, filter); }, [players, filter, generateBattle])
  useEffect(() => { const close = () => setShowProfile(false); document.addEventListener('click', close); return () => document.removeEventListener('click', close); }, []);

  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); }
  const handleShare = () => {
    const text = `Who's Your Favourite? ${battle[0]?.name} vs ${battle[1]?.name} Vote on CrickClash!`;
    const url = window.location.href;
    if (navigator.share) { navigator.share({title: 'CrickClash', text: text, url: url}); }
    else { navigator.clipboard.writeText(`${text} ${url}`); alert("Link Copied!"); }
  }

  const handleReferralShare = () => { // NEW
    const refLink = `${window.location.origin}?ref=${user.uid}`;
    navigator.clipboard.writeText(`Join CrickClash & Get +3 Free Votes! ${refLink}`);
    alert("Referral Link Copied!");
  }

  const handleVote = async (votedPlayerId) => {
    if(!user || votesToday <= 0) return; // CHANGED: <=0
    const today = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${user.uid}`);
    const playerRef = ref(db, `players/${votedPlayerId}`);
    const statsRef = ref(db, `stats`);
    const newBadges = [...badges];
    if(votesToday <= REFERRAL_BONUS &&!badges.includes('First Vote')) newBadges.push('First Vote');
    if(referrals >= 5 &&!badges.includes('Referral King')) newBadges.push('Referral King'); // NEW

    await update(userRef, { votesToday: votesToday - 1, lastVoteDate: today, streak: streak + 1, badges: newBadges });
    await update(playerRef, { votes: increment(1) });
    await update(statsRef, { totalVotes: increment(1) });
    setVotesToday(votesToday - 1); setBadges(newBadges);
    setTimeout(() => handleSkip(), 800);
  }

  const handlePostDebate = async () => {
    if(!debateText ||!user ||!battle[0]) return;
    const debateRef = push(ref(db, 'debates'));
    await set(debateRef, {
      text: debateText,
      userName: user.displayName || user.phoneNumber,
      player1: battle[0].name,
      player2: battle[1].name,
      likes: 0,
      createdAt: Date.now()
    });
    setDebateText('');
  }

  const handleLikeDebate = async (debateId) => {
    const debateRef = ref(db, `debates/${debateId}`);
    await update(debateRef, { likes: increment(1) });
    }
    if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>

  if(!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white p-4">
        <div className="text-center w-full max-w-sm">
          <h1 className="text-4xl font-bold">Crick<span className="text-orange-400">Clash</span></h1>
          <p className="text-gray-400 mt-2 mb-10">The Ultimate Cricket Voting Platform</p>
          <button onClick={handleGoogleLogin} className="bg-white text-black w-full px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition mb-4">
            Continue with Google
          </button>
          <p className="text-gray-500 mb-4">OR</p>
          <input type="tel" placeholder="Enter 10 digit Mobile" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-4 rounded-full bg-[#13131a] mb-3 text-center" maxLength={10} />
          {!showOtpInput? (
            <button onClick={sendOtp} className="w-full bg-[#a8ff00] text-black font-bold py-4 rounded-full">Send OTP</button>
          ) : (
            <>
              <input type="text" placeholder="Enter 6 digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-4 rounded-full bg-[#13131a] mb-3 text-center" maxLength={6} />
              <button onClick={verifyOtp} className="w-full bg-[#a8ff00] text-black font-bold py-4 rounded-full">Verify & Login</button>
            </>
          )}
        </div>
        <div id="recaptcha-container"></div>
        <footer className="text-center mt-10 text-gray-500 text-sm"> © 2026 CrickClash™ | A Production By ANESH </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-orange-400">Clash</span></h1></div>
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile)}} className="w-10 h-10 rounded-full bg-[#a8ff00] flex items-center justify-center text-black font-bold">
              {user.displayName?.[0] || user.phoneNumber?.slice(-2) || 'U'}
            </button>
            {showProfile && (
              <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-44 bg-[#1A1A1A] rounded-xl shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-[#333]"><p className="text-white text-sm font-semibold">{user.displayName || user.phoneNumber}</p></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#222] rounded-b-xl">Logout</button>
              </div>
            )}
          </div>
        </header>

        {/* NEW: REFERRAL CARD */}
        <div className="bg-gradient-to-r from-[#a8ff00] to-[#7ed321] p-4 rounded-2xl mb-4 text-black">
          <p className="font-bold">Invite Friends & Earn +3 Votes</p>
          <p className="text-sm">Referrals: {referrals}</p>
          <button onClick={handleReferralShare} className="w-full mt-2 bg-black text-[#a8ff00] font-bold py-2 rounded-xl">📤 Invite Now</button>
        </div>

        <div className="bg-[#13131a] p-3 rounded-2xl mb-3">
          <p className="text-sm text-gray-400 mb-2">Your Badges</p>
          <div className="flex gap-2 flex-wrap">
            {badges.map(b => <span key={b} className="bg-[#a8ff00] text-black px-3 py-1 rounded-full text-sm font-bold">{b}</span>)}
            {badges.length === 0 && <span className="text-gray-500 text-sm">No badges yet</span>}
          </div>
        </div>

        <div className="bg-[#13131a] p-4 rounded-2xl mb-4 text-center">
          <p className="text-gray-400 text-sm">Votes Left Today</p>
          <p className="text-4xl font-bold text-[#a8ff00]">{votesToday}</p>
        </div>

        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rankings</button>
          <button onClick={() => setTab('Debate')} className={`pb-2 font-bold ${tab === 'Debate'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>💬 Debate</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{totalVotes}</p><p className="text-xs text-gray-400">TOTAL VOTES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{battleNo-1}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400 truncate">{topPlayer?.name.split(' ')[0] || 'None'}</p><p className="text-xs text-gray-400">TOP CHAMP</p></div>
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
                    <img src={battle[0].image} alt={battle[0].name} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"/>
                    <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs font-bold">{battle[0].role}</span>
                    <h3 className="text-xl font-bold mt-3">{battle[0].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[0].votes || 0} votes</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2"><div className="bg-[#a8ff00] h-2 rounded-full" style={{width: `${getPercentage(battle[0], battle[1])}%`}}></div></div>
                    <button onClick={() => handleVote(battle[0].id)} disabled={votesToday <= 0} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday <= 0? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black hover:scale-105 transition'}`}>
                      {votesToday <= 0? 'NO VOTES LEFT' : 'VOTE'}
                    </button>
                  </div>
                  <span className="text-3xl font-bold text-orange-400">VS</span>
                  <div className="bg-gradient-to-b from-[#4a1e5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                    <img src={battle[1].image} alt={battle[1].name} className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"/>
                    <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{battle[1].role}</span>
                    <h3 className="text-xl font-bold mt-3">{battle[1].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[1].votes || 0} votes</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2"><div className="bg-[#a8ff00] h-2 rounded-full" style={{width: `${100 - getPercentage(battle[0], battle[1])}%`}}></div></div>
                    <button onClick={() => handleVote(battle[1].id)} disabled={votesToday <= 0} className={`w-full py-3 rounded-xl font-bold mt-2 ${votesToday <= 0? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black hover:scale-105 transition'}`}>
                      {votesToday <= 0? 'NO VOTES LEFT' : 'VOTE'}
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSkip} className="bg-[#23232b] w-1/2 py-3 rounded-xl font-bold border-[#333] hover:bg-[#2a2a33] flex items-center justify-center gap-2">⏭️ Skip</button>
                  <button onClick={handleShare} className="bg-[#23232b] w-1/2 py-3 rounded-xl font-bold border-[#333] hover:bg-[#2a2a33] flex items-center justify-center gap-2">📤 Share</button>
                </div>
              </div>
            ) : <p className="text-center">Loading...</p>}
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {Object.values(players.reduce((acc, player) => {
                if (acc[player.name]) { acc[player.name].votes += player.votes || 0; }
                else { acc[player.name] = {...player }; }
                return acc;
              }, {})).sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
                <div key={p.name} className="bg-[#13131a] p-3 rounded-lg mb-2 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-[#a8ff00] font-bold">{i+1}</span>
                    <img src={p.image} className="w-8 h-8 rounded-full"/>
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
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">💬 Live Debate</h2>
            {battle[0] && (
              <div className="bg-[#13131a] p-4 rounded-2xl mb-4">
                <p className="text-gray-400 text-sm mb-2">Current Battle:</p>
                <p className="text-lg font-bold">{battle[0].name} <span className="text-orange-400">VS</span> {battle[1].name}</p>
                <textarea value={debateText} onChange={(e) => setDebateText(e.target.value)} placeholder={`Why is ${battle[0].name} better?`} className="w-full mt-3 p-3 rounded-lg bg-[#0a0a0f] border-[#333] h-20" maxLength={200} />
                <button onClick={handlePostDebate} className="w-full mt-2 bg-[#a8ff00] text-black font-bold py-3 rounded-xl">Post Your Opinion 🔥</button>
              </div>
            )}
            <div>
              {debates.map(d => (
                <div key={d.id} className="bg-[#13131a] p-3 rounded-lg mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">{d.userName}</span>
                    <span className="text-xs text-[#a8ff00]">{d.player1} vs {d.player2}</span>
                  </div>
                  <p className="text-white mb-3">{d.text}</p>
                  <button onClick={() => handleLikeDebate(d.id)} className="text-sm bg-[#23232b] px-3 py-1 rounded-full">❤️ {d.likes} Likes</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="text-center mt-10 text-gray-500 text-sm"> © 2026 CrickClash™ | A Production By ANESH </footer>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
      }
