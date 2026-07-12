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

// Images lekunda short list
const ALL_PLAYERS = [
  { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0 },
  { id: "rohit-sharma-bat", name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
  { id: "sachin-tendulkar-bat", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 },
  { id: "jasprit-bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 },
  { id: "hardik-pandya-ar", name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 },
  { id: "ms-dhoni-kp", name: 'MS Dhoni', role: 'KEEPER', votes: 0 },
  { id: "ms-dhoni-cap", name: 'MS Dhoni', role: 'CAPTAIN', votes: 0 },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState(ALL_PLAYERS);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [following, setFollowing] = useState([]);
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
        const today = new Date().toISOString().split('T')[0];
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if(userData){
            if(userData.lastVoteDate === today){ setVotesToday(userData.votesToday || 0); }
            else { setVotesToday(0); update(userRef, {votesToday: 0, lastVoteDate: today}); }
            setStreak(userData.streak || 0);
            setBadges(userData.badges || []);
            setBattleHistory(userData.history || []);
            setFollowing(userData.following || []);
          }
        });
      }
    });

    const debatesRef = ref(db, 'debates');
    onValue(debatesRef, (snapshot) => {
      if(snapshot.val()){
        setDebates(Object.values(snapshot.val()).reverse());
      }
    });
  }, []);

  useEffect(() => {
    if(players.length > 0) generateBattle(players, filter);
  }, [players, filter, generateBattle]);

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { if(window.confirm("Are you sure you want logout?")) { await signOut(auth); setShowProfile(false); } };
  const handleSkip = () => { setBattleNo(b => b + 1); generateBattle(players, filter); };

  const handleVote = async (votedPlayerId) => {
    if(!user){ alert("Google login required to vote"); await signInWithPopup(auth, googleProvider); return; }
    if(votesToday >= DAILY_VOTE_LIMIT) return alert(`Roju ${DAILY_VOTE_LIMIT} vote maatrame!`);

    const playerRef = ref(db, `players/${votedPlayerId}`);
    const playerSnap = await get(playerRef);
    await update(playerRef, { votes: (playerSnap.val()?.votes || 0) + 1 });

    const userRef = ref(db, `users/${user.uid}`);
    await update(userRef, { votesToday: votesToday + 1, lastVoteDate: new Date().toISOString().split('T')[0] });
    setVotesToday(votesToday + 1);
    setBattleNo(battleNo + 1);
    setTimeout(() => generateBattle(players, filter), 500);
  };

  const submitDebate = async () => {
    if(!user){ alert("Login required"); handleGoogleLogin(); return; }
    if(!selectedPlayer || reason.trim().length < 3) { alert("Select a player and write a reason"); return; }
    const debateRef = push(ref(db, 'debates'));
    await set(debateRef, {
      id: debateRef.key, battleId: `battle-${battleNo}`,
      player: selectedPlayer, playerName: players.find(p=>p.id===selectedPlayer)?.name, reason: reason,
      user: user.displayName || "Anonymous", userId: user.uid, userPhoto: user.photoURL,
      likes: 0, likedBy:[], comments:[], timestamp: Date.now()
    });
    setShowDebate(false); setReason(""); setSelectedPlayer("");
  };

  const submitComment = async (debateId) => {
    if(!user){ handleGoogleLogin(); return; }
    if(replyText.trim().length < 2) return;
    const debateRef = ref(db, `debates/${debateId}`);
    const snap = await get(debateRef); const debate = snap.val();
    const newComment = { id: Date.now(), user: user.displayName, userPhoto: user.photoURL, text: replyText, timestamp: Date.now() };
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
    if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">Crick<span className="text-[#FF7A00]">Clash</span></h1></div>
          {user? (
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-lg text-sm font-bold">Logout</button>
          ) : (
            <button onClick={handleGoogleLogin} className="bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold">Login</button>
          )}
        </header>

        {tab === 'Battle' && (
          <>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button key={role} onClick={() => setFilter(role)} className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-[#13131a]'}`}>{role}</button>
              ))}
            </div>

            {battle[0] && battle[1]? (
              <div>
                <div className="flex items-center justify-center gap-2">
                  {[battle[0], battle[1]].map(p => (
                    <div key={p.id} className="bg-[#13131a] p-4 rounded-2xl w-1/2 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#a8ff00] text-black">{p.role}</span>
                      <h3 className="text-xl font-bold mt-3">{p.name}</h3>
                      <p className="text-[#a8ff00] font-bold">{p.votes || 0} votes</p>
                      <button onClick={() => handleVote(p.id)} disabled={user && votesToday >= DAILY_VOTE_LIMIT} className={`w-full py-3 rounded-xl font-bold mt-2 ${!user? 'bg-blue-500' : votesToday >= DAILY_VOTE_LIMIT? 'bg-gray-700 cursor-not-allowed' : 'bg-[#a8ff00] text-black'}`}>
                        {!user? 'VOTE' : votesToday >= DAILY_VOTE_LIMIT? 'LIMIT DONE' : 'VOTE'}
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => user? setShowDebate(true) : handleGoogleLogin()} className="w-full bg-orange-500 text-black font-bold py-3 rounded-xl mt-4">🔥 Debate</button>
                <button onClick={handleSkip} className="bg-[#23232b] w-full py-3 rounded-xl font-bold mt-3">⏭️ Skip Battle</button>

                <div className="mt-6 space-y-3">
                  <h3 className="font-bold text-lg">🔥 Recent Debates</h3>
                  {debates.slice(0,5).map(d => (
                    <div key={d.id} className="bg-[#13131a] p-3 rounded-xl">
                      <p className="font-bold text-sm text-[#a8ff00]">{d.user}</p>
                      <p className="text-sm mt-1"><b>{d.playerName}:</b> {d.reason}</p>
                      <div className="flex gap-4 mt-2"><button onClick={()=>likeDebate(d.id)} className="text-sm">👍 {d.likes || 0}</button><button onClick={()=>setReplyingTo(d.id)} className="text-sm">💬 Reply</button></div>

                      {replyingTo === d.id && (
                        <div className="mt-2 flex gap-2">
                          <input value={replyText} onChange={e=>setReplyText(e.target.value)} className="flex-1 bg-black p-2 rounded text-sm" placeholder="Reply..." />
                          <button onClick={()=>submitComment(d.id)} className="bg-[#a8ff00] text-black px-4 py-2 rounded-lg font-bold">Send</button>
                        </div>
                      )}
                      {d.comments?.map((c,i) => <p key={i} className="text-xs text-gray-400 mt-1">↳ {c.user}: {c.text}</p>)}
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-center">Loading Players...</p>}
          </>
        )}
      </div>

      {/* DEBATE POPUP */}
      {showDebate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13131a] p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Battle {battleNo} Debate 🔥</h3>
            <div className="flex gap-2 mb-2">
              <button onClick={()=>setSelectedPlayer(battle[0]?.id)} className={`flex-1 p-2 rounded-lg text-sm font-bold ${selectedPlayer===battle[0]?.id? "bg-[#a8ff00] text-black" : "bg-[#23232b]"}`}>{battle[0]?.name}</button>
              <button onClick={()=>setSelectedPlayer(battle[1]?.id)} className={`flex-1 p-2 rounded-lg text-sm font-bold ${selectedPlayer===battle[1]?.id? "bg-[#a8ff00] text-black" : "bg-[#23232b]"}`}>{battle[1]?.name}</button>
            </div>
            <textarea placeholder="Write your reason..." value={reason} onChange={(e)=>setReason(e.target.value)} className="w-full h-20 bg-[#0a0a0f] text-white p-2 rounded-lg text-sm"/>
            <button onClick={submitDebate} className="w-full mt-2 bg-[#a8ff00] text-black font-bold py-2 rounded-lg">Post Debate</button>
            <button onClick={()=>setShowDebate(false)} className="w-full mt-2 bg-[#23232b] py-2 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-[#a8ff00] font-bold">CrickClash™</span> | A Production By <span className="text-white font-bold">ANESH</span></p>
      </footer>
    </div>
  );
          }
