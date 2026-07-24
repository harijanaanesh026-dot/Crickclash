import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, get, remove, increment, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = { /* nee config same */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const DAILY_VOTE_LIMIT = 1;

const CRICKET_PLAYERS = [ /* nee 70 players ikkada paste cheyi */ ];
const FOOTBALL_PLAYERS = [ /* nee football */ ];
const MOVIES_PLAYERS = [ /* nee movies */ ];
const ALL_DATA = { Cricket: CRICKET_PLAYERS, Football: FOOTBALL_PLAYERS, Movies: MOVIES_PLAYERS };

export default function CrickClash() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Cricket');
  const [players, setPlayers] = useState(CRICKET_PLAYERS);
  const [battle, setBattle] = useState([null, null]);
  const [battleNo, setBattleNo] = useState(1);
  const [filter, setFilter] = useState('Any');
  const [tab, setTab] = useState('Feed'); // Default Feed
  const [streak, setStreak] = useState(0);
  const [votesToday, setVotesToday] = useState({Cricket: 0, Football: 0, Movies: 0});
  const [totalVotes, setTotalVotes] = useState(0);
  const [topPlayer, setTopPlayer] = useState(null);
  const [badges, setBadges] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [voteAnim, setVoteAnim] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [weeklyWinner, setWeeklyWinner] = useState(null);

  // NEW SOCIAL STATES
  const [feedPosts, setFeedPosts] = useState([]);
  const [showBattleResult, setShowBattleResult] = useState(false);
  const [currentBadge, setCurrentBadge] = useState('Rookie');
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [pollOption1, setPollOption1] = useState("");
  const [pollOption2, setPollOption2] = useState("");
  const [postType, setPostType] = useState('text');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const getToday = () => new Date().toISOString().split('T')[0];
  const timeAgo = (timestamp) => { const s = Math.floor((Date.now() - timestamp)/1000); if(s<60) return `${s}s ago`; const m=Math.floor(s/60); if(m<60) return `${m}m ago`; return `${Math.floor(m/60)}h ago`; }
  const getBadgeFromStreak = (s) => s >= 30? 'Gold Crown 👑' : s >= 7? 'Silver 🔥' : s >= 3? 'Bronze ⚡' : 'Rookie';

  useEffect(() => { /* nee timer code same */ }, []);

  const createFeedPost = async (type, text, imageUrl = "") => {
    if(!user) return;
    const postRef = push(ref(db, `feed/global`));
    await set(postRef, {
      id: postRef.key, type, userId: user.uid, userName: user.displayName,
      userPhoto: user.photoURL, text, image: imageUrl, time: Date.now(), likes: 0, likedBy: {}
    });
  };

  const handleVote = async (votedPlayerId) => {
    if(!user){ await signInWithPopup(auth, googleProvider); return; }
    if(votesToday[category] >= DAILY_VOTE_LIMIT || isVoting) return alert(`Roju ${category} lo ${DAILY_VOTE_LIMIT} vote maatrame!`);
    setIsVoting(true); setVoteAnim(votedPlayerId); setTimeout(() => setVoteAnim(null), 500);
    setShowBattleResult(true); setTimeout(() => setShowBattleResult(false), 2000);
    const votedPlayer = ALL_DATA[category].find(p => p.id === votedPlayerId);
    await update(ref(db, `users/${user.uid}/${category}`), { votesToday: increment(1), lastVoteDate: getToday() });
    await update(ref(db, `players/${category}/${votedPlayerId}`), { votes: increment(1) });
    await update(ref(db, `meta/${category}`), { totalVotes: increment(1), battleNo: battleNo + 1 });
    await createFeedPost('VOTE', `voted for ${votedPlayer.name} in ${category} Battle ${battleNo} ⚔️`);
    setTimeout(() => { setIsVoting(false); setBattleNo(battleNo + 1); /* generateBattle call */ }, 1000);
  };

  const handleCreatePost = async () => {
    if(!user ||!newPostText.trim()) return;
    let imageUrl = "";
    if(newPostImage){
      const imgRef = storageRef(storage, `posts/${user.uid}/${Date.now()}`);
      await uploadBytes(imgRef, newPostImage);
      imageUrl = await getDownloadURL(imgRef);
    }
    let text = postType === 'poll'? `POLL: ${newPostText} |A|${pollOption1}|B|${pollOption2}` : newPostText;
    await createFeedPost(postType.toUpperCase(), text, imageUrl);
    setNewPostText(""); setNewPostImage(null); setShowCreatePost(false);
  };

  const handleLikePost = async (postId) => { /* like logic */ };
  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = async () => { await signOut(auth); };

  useEffect(() => {
    onValue(ref(db, `feed/global`), (snap) => {
      const data = snap.val();
      setFeedPosts(data? Object.values(data).sort((a,b) => b.time - a.time) : []);
    });
    onAuthStateChanged(auth, setUser);
    // nee old players + meta logic kuda ikkada
    setLoading(false);
  }, [category]);

  if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }.vote-pop { animation: pop 0.5s ease; }`}</style>

      {showBattleResult && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div className="bg-[#a8ff00] text-black px-8 py-6 rounded-2xl text-center animate-bounce"><p className="text-3xl">🎉 +10 POINTS!</p></div></div>}

      <div className="max-w-md mx-auto w-full p-4">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#a8ff00]">AI FanVerse</h1>
          {user? <img src={user.photoURL} className="w-10 h-10 rounded-full"/> : <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-xl">Login</button>}
        </header>

        {/* 4 TABS */}
        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Feed')} className={`pb-2 font-bold ${tab === 'Feed'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏠 Feed</button>
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rank</button>
          <button onClick={() => setTab('Profile')} className={`pb-2 font-bold ${tab === 'Profile'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>👤 Me</button>
        </div>

        {/* FEED TAB */}
        {tab === 'Feed' && (
          <div className="space-y-4">
            <div className="bg-[#13131a] p-3 rounded-2xl flex gap-3">
              <img src={user?.photoURL} className="w-10 h-10 rounded-full"/>
              <button onClick={() => setShowCreatePost(true)} className="flex-1 bg-[#0a0a0f] text-left text-gray-400 p-2 rounded-xl">What's your opinion?</button>
            </div>
            {feedPosts.map(post => (
              <div key={post.id} className="bg-[#13131a] p-4 rounded-2xl">
                <div className="flex gap-3 items-center"><img src={post.userPhoto} className="w-10 h-10 rounded-full"/><div><p className="font-bold">{post.userName}</p><p className="text-xs text-gray-400">{timeAgo(post.time)}</p></div></div>
                {post.type === 'TEXT' && <p className="mt-3">{post.text}</p>}
                {post.type === 'IMAGE' && <><p className="mt-3">{post.text}</p><img src={post.image} className="w-full rounded-xl mt-2"/></>}
                {post.type === 'VOTE' && <p className="mt-3">{post.text}</p>}
                <button onClick={() => handleLikePost(post.id)} className="mt-3 text-gray-400">❤️ {post.likes}</button>
              </div>
            ))}
          </div>
        )}

        {/* BATTLE TAB - nee old battle UI paste cheyi */}
        {tab === 'Battle' && ( /* nee battle code */ )}

        {/* PROFILE TAB */}
        {tab === 'Profile' && user && (
          <div className="bg-[#13131a] p-4 rounded-2xl text-center">
            <img src={user.photoURL} className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-[#a8ff00]"/>
            <h2 className="text-xl font-bold">{user.displayName}</h2>
            <p className="text-[#a8ff00]">Badge: {currentBadge}</p>
            <button onClick={handleLogout} className="w-full mt-4 bg-red-600 py-2 rounded-xl">Logout</button>
          </div>
        )}
      </div>
{/* CREATE POST POPUP */}
      {showCreatePost && (
        <div onClick={() => setShowCreatePost(false)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-4 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-3">Create Post</h2>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setPostType('text')} className={`flex-1 py-1 rounded-lg ${postType==='text'? 'bg-[#a8ff00] text-black':'bg-[#222]'}`}>Text</button>
              <button onClick={() => setPostType('image')} className={`flex-1 py-1 rounded-lg ${postType==='image'? 'bg-[#a8ff00] text-black':'bg-[#222]'}`}>Image</button>
              <button onClick={() => setPostType('poll')} className={`flex-1 py-1 rounded-lg ${postType==='poll'? 'bg-[#a8ff00] text-black':'bg-[#222]'}`}>Poll</button>
            </div>
            <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="What's happening?" className="w-full bg-[#0a0a0f] p-3 rounded-xl h-24 outline-none"/>
            {postType === 'image' && <input type="file" accept="image/*" onChange={e => setNewPostImage(e.target.files[0])} className="mt-2"/>}
            {postType === 'poll' && <div className="space-y-2 mt-2"><input value={pollOption1} onChange={e => setPollOption1(e.target.value)} placeholder="Option 1" className="w-full bg-[#0a0a0f] p-2 rounded-lg"/><input value={pollOption2} onChange={e => setPollOption2(e.target.value)} placeholder="Option 2" className="w-full bg-[#0a0a0f] p-2 rounded-lg"/></div>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowCreatePost(false)} className="flex-1 bg-[#222] py-2 rounded-xl">Cancel</button>
              <button onClick={handleCreatePost} className="flex-1 bg-[#a8ff00] text-black font-bold py-2 rounded-xl">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                                                    }
