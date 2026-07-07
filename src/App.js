import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, increment, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const firebaseConfig = {
  apiKey: "AIzaSyD9BfrAh8djKof1Bu6FLG0Fz7X10NCdm6g",
  authDomain: "crickclash-d30fe.firebaseapp.com",
  databaseURL: "https://crickclash-d30fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crickclash-d30fe",
  storageBucket: "crickclash-d30fe.firebasestorage.app",
  messagingSenderId: "595133866613",
  appId: "1:595133866613:web:dda3f0509462310cb74e3c"
};

const DAILY_VOTE_LIMIT = 1;

const initialPlayers = [
{ name: 'Virat Kohli', role: 'BATTER', votes: 0 }, { name: 'Rohit Sharma', role: 'BATTER', votes: 0 },
{ name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 }, { name: 'Shubman Gill', role: 'BATTER', votes: 0 },
{ name: 'Suryakumar Yadav', role: 'BATTER', votes: 0 }, { name: 'Shreyas Iyer', role: 'BATTER', votes: 0 },
{ name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0 }, { name: 'Ruturaj Gaikwad', role: 'BATTER', votes: 0 },
{ name: 'Abhishek Sharma', role: 'BATTER', votes: 0 }, { name: 'Tilak Varma', role: 'BATTER', votes: 0 },
{ name: 'Rinku Singh', role: 'BATTER', votes: 0 }, { name: 'Sai Sudharsan', role: 'BATTER', votes: 0 },
{ name: 'KL Rahul', role: 'BATTER', votes: 0 }, { name: 'Manish Pandey', role: 'BATTER', votes: 0 },
{ name: 'Ajinkya Rahane', role: 'BATTER', votes: 0 }, { name: 'Prithvi Shaw', role: 'BATTER', votes: 0 },
{ name: 'Suresh Raina', role: 'BATTER', votes: 0 }, { name: 'Yuvraj Singh', role: 'BATTER', votes: 0 },
{ name: 'Gautam Gambhir', role: 'BATTER', votes: 0 }, { name: 'Virender Sehwag', role: 'BATTER', votes: 0 },
{ name: 'Cheteshwar Pujara', role: 'BATTER', votes: 0 }, { name: 'Sarfaraz Khan', role: 'BATTER', votes: 0 },
{ name: 'Rahul Dravid', role: 'BATTER', votes: 0 }, { name: 'VVS Laxman', role: 'BATTER', votes: 0 },
{ name: 'Sourav Ganguly', role: 'BATTER', votes: 0 }, { name: 'Ambati Rayudu', role: 'BATTER', votes: 0 },
{ name: 'Mayank Agarwal', role: 'BATTER', votes: 0 }, { name: 'Devdutt Padikkal', role: 'BATTER', votes: 0 },
{ name: 'Rahul Tripathi', role: 'BATTER', votes: 0 }, { name: 'Karun Nair', role: 'BATTER', votes: 0 },
{ name: 'Hanuma Vihari', role: 'BATTER', votes: 0 }, { name: 'Nitish Rana', role: 'BATTER', votes: 0 },
{ name: 'Vaibhav Suryavanshi', role: 'BATTER', votes: 0 }, { name: 'Mandeep Singh', role: 'BATTER', votes: 0 },
{ name: 'Baba Indrajith', role: 'BATTER', votes: 0 },
{ name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 }, { name: 'Mohammed Shami', role: 'BOWLER', votes: 0 },
{ name: 'Mohammed Siraj', role: 'BOWLER', votes: 0 }, { name: 'Arshdeep Singh', role: 'BOWLER', votes: 0 },
{ name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0 }, { name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0 },
{ name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0 }, { name: 'Deepak Chahar', role: 'BOWLER', votes: 0 },
{ name: 'Umran Malik', role: 'BOWLER', votes: 0 }, { name: 'Avesh Khan', role: 'BOWLER', votes: 0 },
{ name: 'Ravi Bishnoi', role: 'BOWLER', votes: 0 }, { name: 'Varun Chakravarthy', role: 'BOWLER', votes: 0 },
{ name: 'Prasidh Krishna', role: 'BOWLER', votes: 0 }, { name: 'Harshal Patel', role: 'BOWLER', votes: 0 },
{ name: 'T Natarajan', role: 'BOWLER', votes: 0 }, { name: 'Mukesh Kumar', role: 'BOWLER', votes: 0 },
{ name: 'Zaheer Khan', role: 'BOWLER', votes: 0 }, { name: 'Irfan Pathan', role: 'BOWLER', votes: 0 },
{ name: 'Ashish Nehra', role: 'BOWLER', votes: 0 }, { name: 'Anil Kumble', role: 'BOWLER', votes: 0 },
{ name: 'Harbhajan Singh', role: 'BOWLER', votes: 0 }, { name: 'Javagal Srinath', role: 'BOWLER', votes: 0 },
{ name: 'Munaf Patel', role: 'BOWLER', votes: 0 }, { name: 'RP Singh', role: 'BOWLER', votes: 0 },
{ name: 'R Sai Kishore', role: 'BOWLER', votes: 0 },
{ name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0 },
{ name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Washington Sundar', role: 'ALL-ROUNDER', votes: 0 },
{ name: 'Ravichandran Ashwin', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Krunal Pandya', role: 'ALL-ROUNDER', votes: 0 },
{ name: 'Deepak Hooda', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Shahbaz Ahmed', role: 'ALL-ROUNDER', votes: 0 },
{ name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Venkatesh Iyer', role: 'ALL-ROUNDER', votes: 0 },
{ name: 'Kapil Dev', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Ravi Shastri', role: 'ALL-ROUNDER', votes: 0 },
{ name: 'Stuart Binny', role: 'ALL-ROUNDER', votes: 0 }, { name: 'Piyush Chawla', role: 'ALL-ROUNDER', votes: 0 },
{ name: 'Amit Mishra', role: 'ALL-ROUNDER', votes: 0 },
{ name: 'MS Dhoni', role: 'KEEPER', votes: 0 }, { name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
{ name: 'Dinesh Karthik', role: 'KEEPER', votes: 0 }, { name: 'Ishan Kishan', role: 'KEEPER', votes: 0 },
{ name: 'Sanju Samson', role: 'KEEPER', votes: 0 }, { name: 'Jitesh Sharma', role: 'KEEPER', votes: 0 },
{ name: 'Dhruv Jurel', role: 'KEEPER', votes: 0 }, { name: 'Prabhsimran Singh', role: 'KEEPER', votes: 0 },
{ name: 'Anuj Rawat', role: 'KEEPER', votes: 0 }, { name: 'N Jagadeesan', role: 'KEEPER', votes: 0 },
{ name: 'Kiran More', role: 'KEEPER', votes: 0 }, { name: 'Nayan Mongia', role: 'KEEPER', votes: 0 },
{ name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0 }, { name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 },
{ name: 'MS Dhoni', role: 'CAPTAIN', votes: 0 }, { name: 'Sachin Tendulkar', role: 'CAPTAIN', votes: 0 },
{ name: 'Sourav Ganguly', role: 'CAPTAIN', votes: 0 }, { name: 'KL Rahul', role: 'CAPTAIN', votes: 0 },
{ name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0 }, { name: 'Shreyas Iyer', role: 'CAPTAIN', votes: 0 },
{ name: 'Shubman Gill', role: 'CAPTAIN', votes: 0 }, { name: 'Rishabh Pant', role: 'CAPTAIN', votes: 0 },
{ name: 'Ravindra Jadeja', role: 'CAPTAIN', votes: 0 }, { name: 'Ajinkya Rahane', role: 'CAPTAIN', votes: 0 },
{ name: 'Kapil Dev', role: 'CAPTAIN', votes: 0 },
];
function CrickClash() {
  const [players, setPlayers] = useState([]);
  const [battle, setBattle] = useState([]);
  const [votesToday, setVotesToday] = useState(0);
  const [votedIds, setVotedIds] = useState([]);
  const [tab, setTab] = useState('Battle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
    const savedVotes = localStorage.getItem('votesToday');
    const savedIds = localStorage.getItem('votedIds');
    if(savedVotes) setVotesToday(parseInt(savedVotes));
    if(savedIds) setVotedIds(JSON.parse(savedIds));
  }, []);

  useEffect(() => {
    if(players.length > 0) generateBattle();
  }, [players, votedIds]);

  const fetchPlayers = async () => {
    const q = query(collection(db, "players"));
    const snapshot = await getDocs(q);
    if(snapshot.empty){
      setPlayers(initialPlayers);
      setLoading(false);
      return;
    }
    const playerList = snapshot.docs.map(doc => ({ id: doc.id,...doc.data() }));
    setPlayers(playerList);
    setLoading(false);
  };
    const generateBattle = () => {
    const available = players.filter(p =>!votedIds.includes(p.name));
    if(available.length < 2) {
      setBattle([]);
      return;
    }
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    setBattle([shuffled[0], shuffled[1]]);
  };

  const handleVote = async (playerName) => {
    if(votesToday >= DAILY_VOTE_LIMIT) return;
    
    const playerRef = doc(db, "players", playerName);
    await updateDoc(playerRef, {
      votes: increment(1)
    }).catch(async () => {
      await addDoc(collection(db, "players"), { name: playerName, votes: 1, role: players.find(p=>p.name===playerName)?.role });
    });

    await addDoc(collection(db, "votes"), {
      playerName,
      timestamp: serverTimestamp()
    });

    const newVotes = votesToday + 1;
    const newVotedIds = [...votedIds, playerName];
    
    setVotesToday(newVotes);
    setVotedIds(newVotedIds);
    localStorage.setItem('votesToday', newVotes);
    localStorage.setItem('votedIds', JSON.stringify(newVotedIds));
    
    setTimeout(() => generateBattle(), 500);
  };

  const handleSkip = () => {
    generateBattle();
  };
    return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-[#a8ff00]">CRICKCLASH</h1>
        <p className="text-center text-gray-400 mb-4">Vote for your favorite player!</p>
        
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setTab('Battle')} 
            className={`px-4 py-2 rounded-lg font-bold ${tab === 'Battle'? 'bg-[#f1313a]' : 'bg-gray-800'}`}
          >
            Battle
          </button>
          <button 
            onClick={() => setTab('Rankings')} 
            className={`px-4 py-2 rounded-lg font-bold ${tab === 'Rankings'? 'bg-[#f1313a]' : 'bg-gray-800'}`}
          >
            Rankings
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">Votes Today: {votesToday}/{DAILY_VOTE_LIMIT}</p>
        </div>

        {tab === 'Battle' && (
          <div>
            {!loading && battle.length === 2? (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#f1313a] p-4 rounded-xl text-center">
                    <h3 className="text-xl font-bold mb-2">{battle[0].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[0].votes || 0} votes</p>
                    <button 
                      onClick={() => handleVote(battle[0].name)} 
                      disabled={votesToday >= DAILY_VOTE_LIMIT}
                      className="w-full py-3 rounded-xl font-bold mt-2 bg-[#a8ff00] text-black disabled:bg-gray-600"
                    >
                      {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT REACHED' : 'VOTE'}
                    </button>
                  </div>
                  
                  <span className="text-3xl font-bold text-orange-400 self-center text-center">VS</span>

                  <div className="bg-gradient-to-b from-[#4a15ef] to-[#0a0e1f] p-4 rounded-xl text-center">
                    <h3 className="text-xl font-bold mb-2">{battle[1].name}</h3>
                    <p className="text-[#a8ff00] font-bold">{battle[1].votes || 0} votes</p>
                    <button 
                      onClick={() => handleVote(battle[1].name)} 
                      disabled={votesToday >= DAILY_VOTE_LIMIT}
                      className="w-full py-3 rounded-xl font-bold mt-2 bg-[#a8ff00] text-black disabled:bg-gray-600"
                    >
                      {votesToday >= DAILY_VOTE_LIMIT? 'LIMIT REACHED' : 'VOTE'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={handleSkip} 
                    className="bg-[#f1313a] w-1/2 py-3 rounded-xl font-bold"
                  >
                    Skip
                  </button>
                  <button 
                    onClick={() => navigator.share({
                      title: 'CrickClash',
                      text: `Want Your Favourite to Win? Cast Your Vote Now. ${battle[0]?.name} vs ${battle[1]?.name}`,
                      url: window.location.href
                    })}
                    className="bg-[#f1313a] w-1/2 py-3 rounded-xl font-bold"
                  >
                    Share 🔥
                  </button>
                </div>
              </div>
            ) : <p className="text-center">Loading...</p>}
          </div>
        )}
                      {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-center text-[#a8ff00] mb-4">🏆 Top 10 Players</h2>
            {[...players].sort((a,b) => (b.votes||0) - (a.votes||0)).slice(0,10).map((p,i) => (
              <div key={p.name} className="bg-[#f1313a] p-3 rounded-lg mb-2 flex justify-between">
                <span>{i+1}. {p.name}</span>
                <span className="text-[#a8ff00]">{p.votes || 0} votes</span>
              </div>
            ))}
          </div>
        )}

        <footer className="text-center text-gray-500 text-sm mt-8 py-4">
          © 2026 CrickClash™ | A Production By ANESH
        </footer>
      </div>
    </div>
  )
}

export default CrickClash;
