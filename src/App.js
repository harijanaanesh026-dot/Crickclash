import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue } from 'firebase/database';

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

// 100 PLAYERS LIST
const ALL_PLAYERS = [
  { name: 'Virat Kohli', role: 'BATTER', votes: 0 }, { name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
  { name: 'KL Rahul', role: 'BATTER', votes: 0 }, { name: 'Shubman Gill', role: 'BATTER', votes: 0 },
  { name: 'Suryakumar Yadav', role: 'BATTER', votes: 0 }, { name: 'Shreyas Iyer', role: 'BATTER', votes: 0 },
  { name: 'Rishabh Pant', role: 'BATTER', votes: 0 }, { name: 'Ishan Kishan', role: 'BATTER', votes: 0 },
  { name: 'Sanju Samson', role: 'BATTER', votes: 0 }, { name: 'Tilak Varma', role: 'BATTER', votes: 0 },
  { name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0 }, { name: 'Prithvi Shaw', role: 'BATTER', votes: 0 },
  { name: 'Devdutt Padikkal', role: 'BATTER', votes: 0 }, { name: 'Ruturaj Gaikwad', role: 'BATTER', votes: 0 },
  { name: 'Abhishek Sharma', role: 'BATTER', votes: 0 }, { name: 'Nitish Rana', role: 'BATTER', votes: 0 },
  { name: 'Manish Pandey', role: 'BATTER', votes: 0 }, { name: 'Ambati Rayudu', role: 'BATTER', votes: 0 },
  { name: 'Suresh Raina', role: 'BATTER', votes: 0 }, { name: 'Ajinkya Rahane', role: 'BATTER', votes: 0 },
  { name: 'Mayank Agarwal', role: 'BATTER', votes: 0 }, { name: 'Venkatesh Iyer', role: 'BATTER', votes: 0 },
  { name: 'Rinku Singh', role: 'BATTER', votes: 0 }, { name: 'Jitesh Sharma', role: 'BATTER', votes: 0 },
  { name: 'Rahul Tripathi', role: 'BATTER', votes: 0 }, { name: 'Shivam Dube', role: 'BATTER', votes: 0 },
  { name: 'Dhruv Jurel', role: 'BATTER', votes: 0 }, { name: 'Sai Sudharsan', role: 'BATTER', votes: 0 },
  { name: 'Prabhsimran Singh', role: 'BATTER', votes: 0 }, { name: 'Anuj Rawat', role: 'BATTER', votes: 0 },
  { name: 'Sakib Hussain', role: 'BATTER', votes: 0 }, { name: 'Baba Indrajith', role: 'BATTER', votes: 0 },
  { name: 'Rajat Patidar', role: 'BATTER', votes: 0 }, { name: 'N Jagadeesan', role: 'BATTER', votes: 0 },
  { name: 'Vijay Shankar', role: 'BATTER', votes: 0 },
  { name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 }, { name: 'Mohammed Shami', role: 'BOWLER', votes: 0 },
  { name: 'Mohammed Siraj', role: 'BOWLER', votes: 0 }, { name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0 },
  { name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0 }, { name: 'Arshdeep Singh', role: 'BOWLER', votes: 0 },
  { name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0 }, { name: 'Deepak Chahar', role: 'BOWLER', votes: 0 },
  { name: 'T Natarajan', role: 'BOWLER', votes: 0 }, { name: 'Umran Malik', role: 'BOWLER', votes: 0 },
  { name: 'Avesh Khan', role: 'BOWLER', votes: 0 }, { name: 'Ravi Bishnoi', role: 'BOWLER', votes: 0 },
  { name: 'Varun Chakravarthy', role: 'BOWLER', votes: 0 }, { name: 'Khaleel Ahmed', role: 'BOWLER', votes: 0 },
  { name: 'Shardul Thakur', role: 'BOWLER', votes: 0 }, { name: 'Prasidh Krishna', role: 'BOWLER', votes: 0 },
  { name: 'Harshal Patel', role: 'BOWLER', votes: 0 }, { name: 'Jaydev Unadkat', role: 'BOWLER', votes: 0 },
  { name: 'Chetan Sakariya', role: 'BOWLER', votes: 0 }, { name: 'Mukesh Kumar', role: 'BOWLER', votes: 0 },
  { name: 'Akash Deep', role: 'BOWLER', votes: 0 }, { name: 'Kartik Tyagi', role: 'BOWLER', votes: 0 },
  { name: 'Sandeep Sharma', role: 'BOWLER', votes: 0 }, { name: 'Mohit Sharma', role: 'BOWLER', votes: 0 },
  { name: 'Tushar Deshpande', role: 'BOWLER', votes: 0 }, { name: 'Shivam Mavi', role: 'BOWLER', votes: 0 },
  { name: 'Ansh Patel', role: 'BOWLER', votes: 0 }, { name: 'Rahul Chahar', role: 'BOWLER', votes: 0 },
  { name: 'R Sai Kishore', role: 'BOWLER', votes: 0 }, { name: 'Fazalhaq Farooqi', role: 'BOWLER', votes: 0 },
  { name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Washington Sundar', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Krunal Pandya', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Deepak Hooda', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Shahbaz Ahmed', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Rajat Patidar', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Piyush Chawla', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Amit Mishra', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Jayant Yadav', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Gowtham', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'Kedar Jadhav', role: 'ALL-ROUNDER', votes: 0 },
  { name: 'MS Dhoni', role: 'KEEPER', votes: 0 }, { name: 'Dinesh Karthik', role: 'KEEPER', votes: 0 },
  { name: 'KL Rahul', role: 'KEEPER', votes: 0 }, { name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
  { name: 'Ishan Kishan', role: 'KEEPER', votes: 0 }, { name: 'Sanju Samson', role: 'KEEPER', votes: 0 },
  { name: 'Jitesh Sharma', role: 'KEEPER', votes: 0 }, { name: 'Dhruv Jurel', role: 'KEEPER', votes: 0 },
  { name: 'Prabhsimran Singh', role: 'KEEPER', votes: 0 }, { name: 'Anuj Rawat', role: 'KEEPER', votes: 0 },
  { name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0 }, { name: 'MS Dhoni', role: 'CAPTAIN', votes: 0 },
  { name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 }, { name: 'KL Rahul', role: 'CAPTAIN', votes: 0 },
  { name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0 }, { name: 'Shreyas Iyer', role: 'CAPTAIN', votes: 0 },
  { name: 'Rishabh Pant', role: 'CAPTAIN', votes: 0 }, { name: 'Sanju Samson', role: 'CAPTAIN', votes: 0 },
  { name: 'Ravindra Jadeja', role: 'CAPTAIN', votes: 0 }, { name: 'Shubman Gill', role: 'CAPTAIN', votes: 0 },
];

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Battle');
  const [stats, setStats] = useState({totalVotes: 0, battles: 0, topChamp: 'None', streak: 0});

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    const playersRef = ref(db, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 90) {
        const playersArray = Object.keys(data).map(key => ({ id: Number(key),...data[key] }));
        setPlayers(playersArray);
        generateBattle(playersArray, 'Any');

        const totalVotes = playersArray.reduce((sum, p) => sum + (p.votes || 0), 0);
        const topPlayer = playersArray.sort((a,b) => (b.votes||0) - (a.votes||0))[0];

        setStats({
          totalVotes: totalVotes,
          battles: Math.floor(totalVotes / 2),
          topChamp: topPlayer? topPlayer.name.split(' ')[0] : 'None',
          streak: 0
        });

      } else {
        const initialPlayers = {};
        ALL_PLAYERS.forEach((p, idx) => {
          initialPlayers[idx] = {...p, id: idx };
        });
        set(playersRef, initialPlayers);
      }
    });
  }, []);

  const generateBattle = (playerList, role) => {
    if(playerList.length < 2) return;
    let filtered = role === 'Any'? playerList : playerList.filter(p => p.role === role);
    if(filtered.length < 2) {
      setBattle([null, null]);
      return;
    }
    const p1 = filtered[Math.floor(Math.random() * filtered.length)];
    let p2 = filtered[Math.floor(Math.random() * filtered.length)];
    while(p1.id === p2.id) p2 = filtered[Math.floor(Math.random() * filtered.length)];
    setBattle([p1, p2]);
  }

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  const handleVote = async (playerId) => {
    const player = players.find(p => p.id === playerId);
    await update(ref(db, `players/${playerId}`), { votes: (player.votes || 0) + 1 });
    setBattleNo(prev => prev + 1);
    generateBattle([...players], filter);
  }

  const handleSkip = () => {
    setBattleNo(prev => prev + 1);
    generateBattle([...players], filter);
  }

  const formatVotes = (num) => {
    if(num >= 1000) return (num/1000).toFixed(1) + 'k';
    return num;
  }

  if(loading) return <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-white">Loading...</div>

  if(!user){
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] to-[#1a1f2e] text-white flex-col items-center justify-center p-4">
        <div className="text-5xl mb-2"></div>
        <h1 className="text-5xl font-bold mb-1"><span className="text-white">Crick</span><span className="text-orange-400"> Clash</span></h1>
        <p className="text-sm text-gray-400 mb-2">ANESH Innovations</p>
        <p className="text-gray-400 mb-8">The Ultimate Cricket Voting Plotform</p>
        <button onClick={handleGoogleLogin} className="bg-white text-black w-full max-w-sm px-10 py-4 rounded-full font-bold text-lg">Sign In with Google</button>
        <p className="text-xs text-gray-500 mt-10">© 2026 CrickClash A Production by ANESH</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] to-[#1a1f2e] text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-1">
          <div>
            <div className="flex items-center gap-2"><div className="text-3xl"></div><h1 className="text-2xl font-bold"><span className="text-white">Crick</span><span className="text-orange-400">Clash</span></h1></div>
            <p className="text-xs text-gray-400 ml-10">ANESH Innovations</p>
          </div>

          {/* USER EMAIL + PIC + LOGOUT */}
          <div onClick={handleLogout} className="flex items-center gap-2 cursor-pointer bg-gray-800 px-3 py-2 rounded-full">
            <img src={user.photoURL} alt="profile" className="w-8 h-8 rounded-full"/>
            <div className="text-right">
              <p className="text-xs text-gray-300">{user.email}</p>
              <p className="text-[10px] text-red-400">Logout</p>
            </div>
          </div>
        </div>

        <div className="flex justify-around mb-6 border-b border-gray-700">
          <button onClick={() => setTab('Battle')} className={`${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>🏆 Rankings</button>
          <button onClick={() => setTab('History')} className={`${tab === 'History'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'} font-bold pb-2`}>📜 History</button>
        </div>

        {tab === 'Battle' && (
          <>
            <div className="grid grid-cols-4 text-center mb-6">
              <div><p className="text-2xl font-bold text-orange-400">{formatVotes(stats.totalVotes)}</p><p className="text-xs text-gray-400">TOTAL VOTES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{stats.battles}</p><p className="text-xs text-gray-400">BATTLES</p></div>
              <div><p className="text-2xl font-bold text-orange-400">{stats.topChamp}</p><p className="text-xs text-gray-400">TOP CHAMP</p></div>
              <div><p className="text-2xl font-bold text-orange-400">🔥{stats.streak}</p><p className="text-xs text-gray-400">STREAK</p></div>
            </div>

            <p className="text-center text-gray-400 mb-2">WHO DO YOU LIKE?</p>
            <h2 className="text-center text-4xl font-bold mb-4">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Any', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
                <button
                  key={role}
                  onClick={() => {setFilter(role); generateBattle([...players], role)}}
                  className={`px-4 py-2 rounded-full font-bold whitespace-nowrap ${filter === role? 'bg-[#a8ff00] text-black' : 'bg-gray-800'}`}
                >
                  {role}
                </button>
              ))}
            </div>

            {battle[0] && battle[1]? (
              <div className="flex items-center justify-center gap-3">
                <div className="bg-gradient-to-b from-[#1e3a5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                  <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-xs font-bold">{battle[0].role}</span>
                  <h3 className="text-xl font-bold mt-3">{battle[0].name}</h3>
                  <p className="text-[#a8ff00] font-bold">{battle[0].votes || 0} votes</p>
                  <button onClick={() => handleVote(battle[0].id)} className="bg-[#a8ff00] w-full py-3 rounded-xl font-bold mt-2 text-black">VOTE</button>
                </div>
                <span className="text-3xl font-bold text-orange-400">VS</span>
                <div className="bg-gradient-to-b from-[#4a1e5f] to-[#0a0e1a] p-4 rounded-2xl w-1/2 text-center">
                  <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{battle[1].role}</span>
                  <h3 className="text-xl font-bold mt-3">{battle[1].name}</h3>
                  <p className="text-[#a8ff00] font-bold">{battle[1].votes || 0} votes</p>
                  <button onClick={() => handleVote(battle[1].id)} className="bg-[#a8ff00] w-full py-3 rounded-xl font-bold mt-2 text-black">VOTE</button>
                </div>
              </div>
            ) : <p className="text-center">Loading Players...</p>}

            <div className="flex gap-4 mt-6">
              <button onClick={handleSkip} className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Skip →</button>
              <button onClick={() => navigator.share({title: 'CrickClash', text: 'Vote for your favorite player!'})} className="bg-gray-800 w-1/2 py-3 rounded-xl font-bold">Share 📤</button>
            </div>
          </>
        )}

        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4 text-center">🏆 Top 10 Players</h2>
            {players.sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
              <div key={p.id} className="bg-gray-800 p-3 rounded-lg mb-2 flex justify-between">
                <span>{i+1}. {p.name}</span>
                <span className="text-[#a8ff00]">{p.votes||0} votes</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'History' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4">📜 Battle History</h2>
            <p className="text-gray-400">Total Battles: {stats.battles}</p>
            <p className="text-gray-400">Total Votes: {stats.totalVotes}</p>
          </div>
        )}

        <p className="text-center mt-10 text-gray-500 text-sm">© 2026 CrickClash A Production by ANESH</p>
      </div>
    </div>
  );
  }
