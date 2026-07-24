import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, set, update, onValue, push, increment } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = { /* nee config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

const CRICKET_PLAYERS = [ { id: "virat-kohli-bat", name: 'Virat Kohli', role: 'BATTER', votes: 0 } ]; // test kosam 1 player
const ALL_DATA = { Cricket: CRICKET_PLAYERS };

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('Feed');
  const [feedPosts, setFeedPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostText, setNewPostText] = useState("");

  useEffect(() => {
    onValue(ref(db, `feed/global`), (snap) => {
      const data = snap.val();
      setFeedPosts(data? Object.values(data).sort((a,b) => b.time - a.time) : []);
    });
    onAuthStateChanged(auth, setUser);
  }, []);

  const handleCreatePost = async () => {
    if(!user || !newPostText.trim()) return;
    const postRef = push(ref(db, `feed/global`));
    await set(postRef, {
      id: postRef.key, type: 'TEXT', userId: user.uid, userName: user.displayName,
      userPhoto: user.photoURL, text: newPostText, time: Date.now(), likes: 0
    });
    setNewPostText(""); setShowCreatePost(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4">
      {/* 4 TABS */}
      <div className="flex justify-around border-b border-gray-800 mb-4">
        <button onClick={() => setTab('Feed')} className={`pb-2 ${tab === 'Feed'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>🏠 Feed</button>
        <button onClick={() => setTab('Battle')} className={`pb-2 ${tab === 'Battle'? 'text-[#a8ff00] border-b-2' : 'text-gray-500'}`}>⚔️ Battle</button>
      </div>

      {/* FEED */}
      {tab === 'Feed' && (
        <div>
          <button onClick={() => setShowCreatePost(true)} className="w-full bg-[#13131a] p-3 rounded-xl">Create Post</button>
          {feedPosts.map(post => <div key={post.id} className="bg-[#13131a] p-4 mt-3 rounded-xl">{post.text}</div>)}
        </div>
      )}

      {/* CREATE POST POPUP */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-[#13131a] p-4 rounded-2xl w-96">
            <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} className="w-full bg-[#0a0a0f] p-2 rounded-lg"/>
            <button onClick={handleCreatePost} className="w-full bg-[#a8ff00] text-black mt-2 p-2 rounded-xl">Post</button>
          </div>
        </div>
      )}
    </div>
  ); // <- idi miss aithe ee error vastadi
  }
if(loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex-col">
      <style>{`@keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }.vote-pop { animation: pop 0.5s ease; }`}</style>

      {/* BATTLE RESULT POPUP */}
      {showBattleResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#a8ff00] text-black px-8 py-6 rounded-2xl text-center animate-bounce">
            <p className="text-3xl font-bold">🎉 +10 POINTS!</p>
            <p>Voted for {ALL_DATA[category].find(p => p.id === lastVotedPlayer)?.name}</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto w-full flex-1 p-4">
        <header className="flex justify-between items-center mb-4">
          <div><h1 className="text-2xl font-bold">AI <span className="text-[#a8ff00]">FanVerse</span></h1></div>
          <div>
            {user? <img src={user.photoURL} onClick={handleLogout} className="w-10 h-10 rounded-full border-2 border-[#a8ff00] cursor-pointer" />
            : <button onClick={handleGoogleLogin} className="bg-[#a8ff00] text-black px-4 py-2 rounded-full font-bold text-sm">Login</button>}
          </div>
        </header>

        {/* CATEGORY TABS */}
        <div className="flex justify-center gap-2 mb-4 bg-[#13131a] p-1 rounded-2xl">
          {Object.keys(ALL_DATA).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${category === cat? 'bg-[#a8ff00] text-black' : 'text-gray-400'}`}>
              {cat === 'Cricket' && '🏏 '}{cat === 'Football' && '⚽ '}{cat === 'Movies' && '🎬 '}{cat}
            </button>
          ))}
        </div>

        {/* ======= 4 TABS ======= */}
        <div className="flex justify-around border-b border-gray-800 mb-4">
          <button onClick={() => setTab('Feed')} className={`pb-2 font-bold ${tab === 'Feed'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏠 Feed</button>
          <button onClick={() => setTab('Battle')} className={`pb-2 font-bold ${tab === 'Battle'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>⚔️ Battle</button>
          <button onClick={() => setTab('Rankings')} className={`pb-2 font-bold ${tab === 'Rankings'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>🏆 Rank</button>
          <button onClick={() => setTab('Profile')} className={`pb-2 font-bold ${tab === 'Profile'? 'text-[#a8ff00] border-b-2 border-[#a8ff00]' : 'text-gray-500'}`}>👤 Me</button>
        </div>

        {/* ======= FEED TAB ======= */}
        {tab === 'Feed' && (
          <div className="space-y-4">
            {/* CREATE POST BOX */}
            <div className="bg-[#13131a] p-3 rounded-2xl">
              <div className="flex gap-3">
                <img src={user?.photoURL} className="w-10 h-10 rounded-full"/>
                <button onClick={() => setShowCreatePost(true)} className="flex-1 bg-[#0a0a0f] text-left text-gray-400 p-2 rounded-xl">
                  What's your opinion?
                </button>
              </div>
            </div>

            {/* FEED POSTS */}
            {feedPosts.length === 0 && <p className="text-center text-gray-500">No posts yet. Be first!</p>}
            {feedPosts.map(post => (
              <div key={post.id} className="bg-[#13131a] p-4 rounded-2xl">
                <div className="flex gap-3 items-center">
                  <img src={post.userPhoto} className="w-10 h-10 rounded-full"/>
                  <div><p className="font-bold">{post.userName}</p><p className="text-xs text-gray-400">{timeAgo(post.time)}</p></div>
                </div>

                {post.type === 'TEXT' && <p className="mt-3">{post.text}</p>}
                {post.type === 'IMAGE' && <><p className="mt-3">{post.text}</p><img src={post.image} className="w-full rounded-xl mt-2"/></>}
                {post.type === 'POLL' && (
                  <>
                    <p className="mt-3 font-bold">{post.text.split('|A|')[0]}</p>
                    <button className="w-full bg-[#222] p-2 rounded-lg mt-2 text-left">{post.text.split('|A|')[1].split('|B|')[0]}</button>
                    <button className="w-full bg-[#222] p-2 rounded-lg mt-2 text-left">{post.text.split('|B|')[1]}</button>
                  </>
                )}
                {post.type === 'VOTE' && <p className="mt-3 text-[#a8ff00]">⚔️ {post.text}</p>}

                <button onClick={() => handleLikePost(post.id)} className="mt-3 text-gray-400">❤️ {post.likes}</button>
              </div>
            ))}
          </div>
        )}

        {/* ======= BATTLE TAB ======= */}
        {tab === 'Battle' && battle[0] && battle[1] && (
          <div className="space-y-4">
            <h2 className="text-center text-3xl font-bold">Battle <span className="text-[#a8ff00]">{battleNo}</span></h2>
            <div className="flex items-center justify-center gap-2">
              {[battle[0], battle[1]].map(p => (
                <div key={p.id} className={`bg-[#13131a] p-4 rounded-2xl w-1/2 text-center ${voteAnim === p.id? 'vote-pop' : ''}`}>
                  <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-[#a8ff00] text-black flex items-center justify-center text-3xl font-bold">{p.name[0]}</div>
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className="text-gray-400">{p.role}</p>
                  <button
                    onClick={() => handleVote(p.id)}
                    disabled={isVoting}
                    className="w-full bg-[#a8ff00] text-black py-3 rounded-xl font-bold mt-2"
                  >
                    VOTE
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======= RANKINGS TAB ======= */}
        {tab === 'Rankings' && (
          <div>
            <h2 className="text-2xl font-bold text-[#a8ff00] mb-4">🏆 Top Players</h2>
            {players.sort((a,b) => b.votes - a.votes).slice(0,10).map((p,i) => (
              <div key={p.id} className="bg-[#13131a] p-3 rounded-xl mb-2">
                #{i+1} {p.name} - {p.votes} votes
              </div>
            ))}
          </div>
        )}

        {/* ======= PROFILE TAB ======= */}
        {tab === 'Profile' && user && (
          <div className="bg-[#13131a] p-4 rounded-2xl text-center">
            <img src={user.photoURL} className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-[#a8ff00]"/>
            <h2 className="text-xl font-bold">{user.displayName}</h2>
            <p className="text-[#a8ff00]">Badge: {currentBadge}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div><p className="text-2xl font-bold">{streak}</p><p className="text-xs">Streak</p></div>
              <div><p className="text-2xl font-bold">{totalVotes}</p><p className="text-xs">Total Votes</p></div>
            </div>
          </div>
        )}
      </div>
{/* ======= CREATE POST POPUP ======= */}
      {showCreatePost && (
        <div onClick={() => setShowCreatePost(false)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-[#13131a] p-4 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-3">Create Post</h2>

            <div className="flex gap-2 mb-3">
              <button onClick={() => setPostType('text')} className={`flex-1 py-1 rounded-lg ${postType==='text'? 'bg-[#a8ff00] text-black':'bg-[#222]'}`}>Text</button>
              <button onClick={() => setPostType('image')} className={`flex-1 py-1 rounded-lg ${postType==='image'? 'bg-[#a8ff00] text-black':'bg-[#222]'}`}>Image</button>
              <button onClick={() => setPostType('poll')} className={`flex-1 py-1 rounded-lg ${postType==='poll'? 'bg-[#a8ff00] text-black':'bg-[#222]'}`}>Poll</button>
            </div>

            <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="What's happening?" className="w-full bg-[#0a0a0f] p-3 rounded-xl h-24 outline-none resize-none"/>

            {postType === 'image' && <input type="file" accept="image/*" onChange={e => setNewPostImage(e.target.files[0])} className="mt-2 w-full text-sm"/>}
            {postType === 'poll' && (
              <div className="space-y-2 mt-2">
                <input value={pollOption1} onChange={e => setPollOption1(e.target.value)} placeholder="Option 1" className="w-full bg-[#0a0a0f] p-2 rounded-lg"/>
                <input value={pollOption2} onChange={e => setPollOption2(e.target.value)} placeholder="Option 2" className="w-full bg-[#0a0a0f] p-2 rounded-lg"/>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowCreatePost(false)} className="flex-1 bg-[#222] py-2 rounded-xl">Cancel</button>
              <button onClick={handleCreatePost} className="flex-1 bg-[#a8ff00] text-black font-bold py-2 rounded-xl">Post</button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center mt-10 pb-6 text-gray-500 text-sm border-t border-gray-800 pt-4">
        <p>© 2026 <span className="text-white font-bold">AI FanVerse™</span> | By <span className="text-white font-bold">ANESH</span></p>
      </footer>
    </div>
  );
        }
