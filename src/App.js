import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

// FIREBASE CONFIG - NEE KEYS IKKADA PETTU
const firebaseConfig = {
  apiKey: "NEE_API_KEY",
  authDomain: "NEE_AUTH_DOMAIN",
  projectId: "NEE_PROJECT_ID",
  storageBucket: "NEE_STORAGE_BUCKET",
  messagingSenderId: "NEE_MESSAGING_SENDER_ID",
  appId: "NEE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const DAILY_VOTE_LIMIT = 1;

const ALL_PLAYERS = [
  // BATTERS - 35
  { id: 1, name: 'Virat Kohli', role: 'BATTER', votes: 0 },
  { id: 2, name: 'Sachin Tendulkar', role: 'BATTER', votes: 0 },
  { id: 3, name: 'Suryakumar Yadav', role: 'BATTER', votes: 0 },
  { id: 4, name: 'Yashasvi Jaiswal', role: 'BATTER', votes: 0 },
  { id: 5, name: 'Abhishek Sharma', role: 'BATTER', votes: 0 },
  { id: 6, name: 'Rinku Singh', role: 'BATTER', votes: 0 },
  { id: 7, name: 'KL Rahul', role: 'BATTER', votes: 0 },
  { id: 8, name: 'Ajinkya Rahane', role: 'BATTER', votes: 0 },
  { id: 9, name: 'Suresh Raina', role: 'BATTER', votes: 0 },
  { id: 10, name: 'Gautam Gambhir', role: 'BATTER', votes: 0 },
  { id: 11, name: 'Cheteshwar Pujara', role: 'BATTER', votes: 0 },
  { id: 12, name: 'Rahul Dravid', role: 'BATTER', votes: 0 },
  { id: 13, name: 'Sourav Ganguly', role: 'BATTER', votes: 0 },
  { id: 14, name: 'Mayank Agarwal', role: 'BATTER', votes: 0 },
  { id: 15, name: 'Rahul Tripathi', role: 'BATTER', votes: 0 },
  { id: 16, name: 'Hanuma Vihari', role: 'BATTER', votes: 0 },
  { id: 17, name: 'Shubman Gill', role: 'BATTER', votes: 0 },
  { id: 18, name: 'Shreyas Iyer', role: 'BATTER', votes: 0 },
  { id: 19, name: 'Ruturaj Gaikwad', role: 'BATTER', votes: 0 },
  { id: 20, name: 'Tilak Varma', role: 'BATTER', votes: 0 },
  { id: 21, name: 'Sai Sudharsan', role: 'BATTER', votes: 0 },
  { id: 22, name: 'Manish Pandey', role: 'BATTER', votes: 0 },
  { id: 23, name: 'Vaibhav Suryavanshi', role: 'BATTER', votes: 0 },
  { id: 24, name: 'Baba Indrajith', role: 'BATTER', votes: 0 },
  { id: 25, name: 'Prithvi Shaw', role: 'BATTER', votes: 0 },
  { id: 26, name: 'Devdutt Padikkal', role: 'BATTER', votes: 0 },
  { id: 27, name: 'Sarfaraz Khan', role: 'BATTER', votes: 0 },
  { id: 28, name: 'Priyank Panchal', role: 'BATTER', votes: 0 },
  { id: 29, name: 'Abhimanyu Easwaran', role: 'BATTER', votes: 0 },
  { id: 30, name: 'Ravi Teja', role: 'BATTER', votes: 0 },
  { id: 31, name: 'Anmolpreet Singh', role: 'BATTER', votes: 0 },
  { id: 32, name: 'Venkatesh Iyer', role: 'BATTER', votes: 0 },
  { id: 33, name: 'Nitish Rana', role: 'BATTER', votes: 0 },
  { id: 34, name: 'Rajat Patidar', role: 'BATTER', votes: 0 },
  { id: 35, name: 'Shashank Singh', role: 'BATTER', votes: 0 },

  // BOWLERS - 25
  { id: 36, name: 'Jasprit Bumrah', role: 'BOWLER', votes: 0 },
  { id: 37, name: 'Mohammed Shami', role: 'BOWLER', votes: 0 },
  { id: 38, name: 'Arshdeep Singh', role: 'BOWLER', votes: 0 },
  { id: 39, name: 'Mohammed Siraj', role: 'BOWLER', votes: 0 },
  { id: 40, name: 'Bhuvneshwar Kumar', role: 'BOWLER', votes: 0 },
  { id: 41, name: 'Yuzvendra Chahal', role: 'BOWLER', votes: 0 },
  { id: 42, name: 'Kuldeep Yadav', role: 'BOWLER', votes: 0 },
  { id: 43, name: 'Ravichandran Ashwin', role: 'BOWLER', votes: 0 },
  { id: 44, name: 'Umesh Yadav', role: 'BOWLER', votes: 0 },
  { id: 45, name: 'Shardul Thakur', role: 'BOWLER', votes: 0 },
  { id: 46, name: 'Deepak Chahar', role: 'BOWLER', votes: 0 },
  { id: 47, name: 'T Natarajan', role: 'BOWLER', votes: 0 },
  { id: 48, name: 'Avesh Khan', role: 'BOWLER', votes: 0 },
  { id: 49, name: 'Harshal Patel', role: 'BOWLER', votes: 0 },
  { id: 50, name: 'Prasidh Krishna', role: 'BOWLER', votes: 0 },
  { id: 51, name: 'Khaleel Ahmed', role: 'BOWLER', votes: 0 },
  { id: 52, name: 'Jaydev Unadkat', role: 'BOWLER', votes: 0 },
  { id: 53, name: 'Ankit Rajpoot', role: 'BOWLER', votes: 0 },
  { id: 54, name: 'Sandeep Sharma', role: 'BOWLER', votes: 0 },
  { id: 55, name: 'Varun Chakravarthy', role: 'BOWLER', votes: 0 },
  { id: 56, name: 'Ravi Bishnoi', role: 'BOWLER', votes: 0 },
  { id: 57, name: 'Mukesh Kumar', role: 'BOWLER', votes: 0 },
  { id: 58, name: 'Umran Malik', role: 'BOWLER', votes: 0 },
  { id: 59, name: 'Akash Deep', role: 'BOWLER', votes: 0 },
  { id: 60, name: 'Chetan Sakariya', role: 'BOWLER', votes: 0 },

  // ALL-ROUNDERS - 15
  { id: 61, name: 'Hardik Pandya', role: 'ALL-ROUNDER', votes: 0 },
  { id: 62, name: 'Ravindra Jadeja', role: 'ALL-ROUNDER', votes: 0 },
  { id: 63, name: 'Washington Sundar', role: 'ALL-ROUNDER', votes: 0 },
  { id: 64, name: 'Axar Patel', role: 'ALL-ROUNDER', votes: 0 },
  { id: 65, name: 'Krunal Pandya', role: 'ALL-ROUNDER', votes: 0 },
  { id: 66, name: 'Shahbaz Ahmed', role: 'ALL-ROUNDER', votes: 0 },
  { id: 67, name: 'Irfan Pathan', role: 'ALL-ROUNDER', votes: 0 },
  { id: 68, name: 'Yusuf Pathan', role: 'ALL-ROUNDER', votes: 0 },
  { id: 69, name: 'Deepak Hooda', role: 'ALL-ROUNDER', votes: 0 },
  { id: 70, name: 'Shivam Dube', role: 'ALL-ROUNDER', votes: 0 },
  { id: 71, name: 'Lalit Yadav', role: 'ALL-ROUNDER', votes: 0 },
  { id: 72, name: 'Abhinav Manohar', role: 'ALL-ROUNDER', votes: 0 },
  { id: 73, name: 'Anukul Roy', role: 'ALL-ROUNDER', votes: 0 },
  { id: 74, name: 'Kedar Jadhav', role: 'ALL-ROUNDER', votes: 0 },
  { id: 75, name: 'Vijay Shankar', role: 'ALL-ROUNDER', votes: 0 },

  // WICKET KEEPERS - 15
  { id: 76, name: 'MS Dhoni', role: 'KEEPER', votes: 0 },
  { id: 77, name: 'Rishabh Pant', role: 'KEEPER', votes: 0 },
  { id: 78, name: 'Ishan Kishan', role: 'KEEPER', votes: 0 },
  { id: 79, name: 'Jitesh Sharma', role: 'KEEPER', votes: 0 },
  { id: 80, name: 'Prabhsimran Singh', role: 'KEEPER', votes: 0 },
  { id: 81, name: 'N Jagadeesan', role: 'KEEPER', votes: 0 },
  { id: 82, name: 'Wriddhiman Saha', role: 'KEEPER', votes: 0 },
  { id: 83, name: 'Sanju Samson', role: 'KEEPER', votes: 0 },
  { id: 84, name: 'Dinesh Karthik', role: 'KEEPER', votes: 0 },
  { id: 85, name: 'Parthiv Patel', role: 'KEEPER', votes: 0 },
  { id: 86, name: 'Robin Uthappa', role: 'KEEPER', votes: 0 },
  { id: 87, name: 'Upendra Yadav', role: 'KEEPER', votes: 0 },
  { id: 88, name: 'Vishnu Vinod', role: 'KEEPER', votes: 0 },
  { id: 89, name: 'Anuj Rawat', role: 'KEEPER', votes: 0 },
  { id: 90, name: 'Kona Bharat', role: 'KEEPER', votes: 0 },

  // CAPTAINS - 10
  { id: 91, name: 'Rohit Sharma', role: 'CAPTAIN', votes: 0 },
  { id: 92, name: 'MS Dhoni', role: 'CAPTAIN', votes: 0 },
  { id: 93, name: 'Virat Kohli', role: 'CAPTAIN', votes: 0 },
  { id: 94, name: 'Hardik Pandya', role: 'CAPTAIN', votes: 0 },
  { id: 95, name: 'KL Rahul', role: 'CAPTAIN', votes: 0 },
  { id: 96, name: 'Shreyas Iyer', role: 'CAPTAIN', votes: 0 },
  { id: 97, name: 'Rishabh Pant', role: 'CAPTAIN', votes: 0 },
  { id: 98, name: 'Sanju Samson', role: 'CAPTAIN', votes: 0 },
  { id: 99, name: 'Shubman Gill', role: 'CAPTAIN', votes: 0 },
  { id: 100, name: 'Ravindra Jadeja', role: 'CAPTAIN', votes: 0 }
];
function App() {
  const [players, setPlayers] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedPlayers = localStorage.getItem('players');
    const savedVotes = localStorage.getItem('userVotes');
    setPlayers(savedPlayers? JSON.parse(savedPlayers) : ALL_PLAYERS);
    setUserVotes(savedVotes? JSON.parse(savedVotes) : []);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const userVotesToday = userVotes.filter(v => v.date === today).length;
  const votesLeft = Math.max(0, DAILY_VOTE_LIMIT - userVotesToday);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleVote = (playerId) => {
    if (!user) {
      alert("Please login first!");
      return;
    }
    if (votesLeft <= 0) {
      alert("Daily vote limit reached! Come back tomorrow.");
      return;
    }

    const newVote = { playerId: playerId, date: today, userId: user.uid };
    const updatedVotes = [...userVotes, newVote];
    setUserVotes(updatedVotes);
    localStorage.setItem('userVotes', JSON.stringify(updatedVotes));

    const updatedPlayers = players.map(p =>
      p.id === playerId? {...p, votes: p.votes + 1 } : p
    );
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
  };

  const filteredPlayers = selectedRole === 'ALL'
? players
    : players.filter(p => p.role === selectedRole);

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-2">⚡</div>
        <h1 className="text-4xl font-bold">Crick<span className="text-orange-500">Clash</span></h1>
        <p className="text-gray-400 mb-8">ANESH Innovation</p>

        <button
          onClick={handleGoogleSignIn}
          className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5"/>
          Sign In with Google
        </button>

        <footer className="text-gray-500 text-sm mt-8">
          ©️ 2026 Crickclash A Production By ANESH
        </footer>
      </div>
    );
  }

  // MAIN APP SCREEN
  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">CrickClash</h1>
        <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">Logout</button>
      </div>

      <div className="flex justify-between items-center mb-4 p-3 bg-gray-800 rounded">
        <p className="text-lg">Today's Votes Left: {votesLeft} / {DAILY_VOTE_LIMIT}</p>
        {votesLeft === 0 && <button disabled className="bg-red-600 px-4 py-2 rounded">LIMIT REACHED</button>}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['ALL', 'BATTER', 'BOWLER', 'ALL-ROUNDER', 'KEEPER', 'CAPTAIN'].map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded ${selectedRole === role? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {filteredPlayers.map(player => (
          <div key={player.id} className="bg-gray-800 p-4 rounded">
            <h3 className="font-bold">{player.name}</h3>
            <p className="text-sm text-gray-400">{player.role}</p>
            <p>Votes: {player.votes}</p>
            <button
              onClick={() => handleVote(player.id)}
              disabled={votesLeft === 0}
              className="mt-2 bg-green-600 px-4 py-2 rounded disabled:bg-gray-600 w-full"
            >
              Vote
            </button>
          </div>
        ))}
      </div>

      <footer className="text-center text-gray-500 text-sm mt-8 pb-4">
        ©️ 2026 Crickclash A Production By ANESH
      </footer>
    </div>
  );
}

export default App;
