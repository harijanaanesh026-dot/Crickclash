import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, update, onValue, get, increment } from 'firebase/database';
import { Heart, X, Zap, Flame } from 'lucide-react';

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

const DAILY_VOTE_LIMIT = 6;
const CRICKET_PLAYERS = [
  { id: "virat", name: 'Virat Kohli', role: 'BATTER', votes: 0, img: 'https://i.imgur.com/8Km9tLL.jpg', color: '#1e40af' },
  { id: "sachin", name: 'Sachin Tendulkar', role: 'BATTER', votes: 0, img: 'https://i.imgur.com/8Km9tLL.jpg', color: '#dc2626' },
  { id: "rohit", name: 'Rohit Sharma', role: 'BATTER', votes: 0, img: 'https://i.imgur.com/8Km9tLL.jpg', color: '#059669' },
  { id: "dhoni", name: 'MS Dhoni', role: 'KEEPER', votes: 0, img: 'https://i.imgur.com/8Km9tLL.jpg', color: '#f59e0b' },
  { id: "bumrah", name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0, img: 'https://i.imgur.com/8Km9tLL.jpg', color: '#7c3aed' },
];
const ALL_DATA = { Cricket: CRICKET_PLAYERS };

export default function TinderVoting() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState(CRICKET_PLAYERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votesToday, setVotesToday] = useState(0);
  const [superVotes, setSuperVotes] = useState(1);
  const [swipeAnim, setSwipeAnim] = useState('');
  const cardRef = useRef(null);
  const touchStartX = useRef(0);
    const currentPlayer = players[currentIndex];

  const handleSwipe = (direction) => {
    if(!user) { signInWithPopup(auth, googleProvider); return; }
    if(votesToday >= DAILY_VOTE_LIMIT) { alert("Daily 6 votes ayipoyayi!"); return; }

    if(direction === 'right') { // VOTE
      setSwipeAnim('swipe-right');
      let votePower = 1;
      update(ref(db, `players/Cricket/${currentPlayer.id}`), { votes: increment(votePower) });
      update(ref(db, `users/${user.uid}/Cricket`), { votesToday: increment(1) });
      setVotesToday(prev => prev + 1);
    }
    if(direction === 'up' && superVotes > 0) { // SUPER VOTE
      setSwipeAnim('swipe-up');
      update(ref(db, `players/Cricket/${currentPlayer.id}`), { votes: increment(3) });
      update(ref(db, `users/${user.uid}/Cricket`), { votesToday: increment(1) });
      setVotesToday(prev => prev + 1);
      setSuperVotes(0);
    }
    if(direction === 'left') { // SKIP
      setSwipeAnim('swipe-left');
    }

    setTimeout(() => {
      setSwipeAnim('');
      setCurrentIndex(prev => prev + 1 >= players.length? 0 : prev + 1); // loop
    }, 300);
  }

  // TOUCH EVENTS FOR SWIPE
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; }
  const onTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if(Math.abs(diff) > 100) {
      if(diff > 0) handleSwipe('right');
      else handleSwipe('left');
    }
  }

  useEffect(() => {
    const unsub = onValue(ref(db, `players/Cricket`), (snap) => {
      const data = snap.val();
      if(data) setPlayers(Object.values(data));
    })
    return () => unsub();
  }, [])
    return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] text-white flex-col">
      <style>{`
        @keyframes swipeRight { to { transform: translateX(500px) rotate(30deg); opacity: 0; } }
        @keyframes swipeLeft { to { transform: translateX(-500px) rotate(-30deg); opacity: 0; } }
        @keyframes swipeUp { to { transform: translateY(-500px); opacity: 0; } }
      .swipe-right { animation: swipeRight 0.3s forwards; }
      .swipe-left { animation: swipeLeft 0.3s forwards; }
      .swipe-up { animation: swipeUp 0.3s forwards; }
      `}</style>

      {/* TOP BAR */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">Votes Left</p>
          <p className="font-bold text-lg">{DAILY_VOTE_LIMIT - votesToday}/6</p>
        </div>
        <div className="flex items-center gap-2 bg-[#2a2a3e] px-3 py-1 rounded-full">
          <Zap className="text-yellow-400" size={16}/>
          <span className="font-bold">{superVotes} Super</span>
        </div>
        {user? <img src={user.photoURL} className="w-9 h-9 rounded-full"/> : <button onClick={() => signInWithPopup(auth, googleProvider)} className="bg-pink-600 px-3 py-1 rounded-lg">Login</button>}
      </div>

      {/* CARD STACK */}
      <div className="flex-1 flex items-center justify-center p-4">
        {currentPlayer && (
          <div
            ref={cardRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className={`w-full max-w-sm h-[500px] rounded-3xl overflow-hidden relative shadow-2xl ${swipeAnim}`}
            style={{backgroundColor: currentPlayer.color}}
          >
            <img src={currentPlayer.img} className="w-full h-full object-cover opacity-80"/>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
              <h2 className="text-3xl font-bold">{currentPlayer.name}</h2>
              <p className="text-lg text-gray-300">{currentPlayer.role}</p>
              <p className="text-sm mt-2">{currentPlayer.votes} votes</p>
            </div>

            {/* SWIPE INDICATORS */}
            <div className="absolute top-10 left-10 border-4 border-green-500 text-green-500 px-4 py-2 rounded-xl text-2xl font-bold rotate-[-20deg]">VOTE</div>
            <div className="absolute top-10 right-10 border-4 border-red-500 text-red-500 px-4 py-2 rounded-xl text-2xl font-bold rotate-[20deg]">SKIP</div>
          </div>
        )}
      </div>
      {/* ACTION BUTTONS */}
      <div className="p-6 flex justify-center items-center gap-8">
        <button onClick={() => handleSwipe('left')} className="w-16 h-16 bg-[#2a2a3e] rounded-full flex items-center justify-center">
          <X size={32} className="text-red-500" />
        </button>
        <button onClick={() => handleSwipe('up')} className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Zap size={36} className="text-black" />
        </button>
        <button onClick={() => handleSwipe('right')} className="w-16 h-16 bg-[#2a2a3e] rounded-full flex items-center justify-center">
          <Heart size={32} className="text-green-500" />
        </button>
      </div>

      {/* INSTRUCTIONS */}
      <p className="text-center text-gray-400 text-sm pb-4">
        ← Skip | Vote → | Super Vote ↑
      </p>
    </div>
  );
        }
