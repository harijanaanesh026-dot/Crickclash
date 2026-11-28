import React, { useState } from 'react';
import './App.css';

const initialUser = {
  id: 'me', name: 'You', username: 'your_wall',
  photo: 'https://i.pravatar.cc/150?img=68',
  bio: 'My life on my Wall 🧱',
  interests: ['Music', 'Trips', 'Memories']
};

export default function App() {
  // 👤 Profile
  const [profile, setProfile] = useState(initialUser);
  const [privacy, setPrivacy] = useState('friends');

  // 🧱 My Wall
  const [wallPosts, setWallPosts] = useState([]);
  const [newPost, setNewPost] = useState({ type: 'text', content: '' });

  // 🎁 Leave Something
  const [wallAdditions, setWallAdditions] = useState([]);

  // 👥 Friends
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([
    { id: 1, name: 'Aarav', username: 'aarav_23', photo: 'https://i.pravatar.cc/150?img=12' }
  ]);
  const [discoverUsers] = useState([
    { id: 101, name: 'Sneha', username: 'sneha.wall', interests: ['Music'], photo: 'https://i.pravatar.cc/150?img=5' },
    { id: 102, name: 'Vikram', username: 'vikram', interests: ['Trips'], photo: 'https://i.pravatar.cc/150?img=8' },
  ]);

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Aarav sent you a friend request', type: 'request' }
  ]);

  // 👥 Shared Wall
  const [sharedWalls, setSharedWalls] = useState([
    { id: 'sw1', title: 'Goa Trip 2025', members: ['You', 'Aarav'], posts: [] }
  ]);

  // 🎨 Customization
  const [customization, setCustomization] = useState({ background: '#fffbe6', theme: 'light', layout: 'grid' });
  const [comments, setComments] = useState({});
  const [blockedUsers, setBlockedUsers] = useState([]);

  const myWallLink = `https://padosi.app/wall/${profile.username}`;

  const addToMyWall = () => {
    if (!newPost.content.trim()) return;
    const post = { id: Date.now(), ...newPost, author: 'me', date: new Date().toISOString(), pinned: false, reactions: [] };
    setWallPosts([post, ...wallPosts]);
    setNewPost({ type: 'text', content: '' });
    setNotifications([{ id: Date.now(), text: 'You added new content to your Wall' }, ...notifications]);
  };

  const acceptRequest = (id) => {
    const req = requests.find(r => r.id === id);
    setFriends([...friends, req]);
    setRequests(requests.filter(r => r.id !== id));
  };

  const addComment = (postId, text) => {
    const c = { ...comments }; if (!c[postId]) c[postId] = [];
    c[postId].push({ id: Date.now(), text, user: 'You' }); setComments(c);
  };

  const addReaction = (postId, emoji) => {
    setWallPosts(wallPosts.map(p => p.id === postId ? { ...p, reactions: [...(p.reactions||[]), emoji] } : p));
  };

  const togglePin = (id) => setWallPosts(wallPosts.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p));
  const blockUser = (userId) => { setBlockedUsers([...blockedUsers, userId]); setFriends(friends.filter(f => f.id !== userId)); };
  const reportContent = (postId) => alert(`Post ${postId} reported. Safety team will review.`);

   // Continued from Part 1...
  return (
    <div style={{ background: customization.background, minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: '#fff', borderBottom: '1px solid #eee' }}>
        <h2>🧱 Padosi Wall</h2>
        <div>
          <button onClick={() => navigator.clipboard.writeText(myWallLink)}>🔗 Share My Wall: {myWallLink}</button>
          <span style={{ marginLeft: 8 }}>🔔 {notifications.length}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: 16, padding: 16 }}>
        <aside>
          <div className="card">
            <img src={profile.photo} width={80} style={{ borderRadius: '50%' }} alt="profile" />
            <h3>{profile.name}</h3><p>@{profile.username}</p><p>{profile.bio}</p>
            <p><b>Interests:</b> {profile.interests.join(', ')}</p>
            <select value={privacy} onChange={e => setPrivacy(e.target.value)}>
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends Only</option>
              <option value="selected">🔒 Selected People</option>
            </select>
          </div>

          <div className="card">
            <h4>🎨 Wall Customization</h4>
            <select value={customization.theme} onChange={e => setCustomization({...customization, theme: e.target.value})}>
              <option value="light">Light</option><option value="dark">Dark</option><option value="retro">Retro</option>
            </select>
            <select value={customization.layout} onChange={e => setCustomization({...customization, layout: e.target.value})}>
              <option value="grid">Grid</option><option value="list">List</option><option value="masonry">Masonry</option>
            </select>
          </div>

          <div className="card">
            <h4>👥 Friends ({friends.length})</h4>
            {friends.map(f => <div key={f.id}>{f.name} <button onClick={() => blockUser(f.id)}>Block</button></div>)}
            <h5>Requests</h5>
            {requests.map(r => <div key={r.id}>{r.name} <button onClick={() => acceptRequest(r.id)}>Accept</button></div>)}
          </div>
        </aside>

        <main>
          <div className="card">
            <h3>🧱 My Wall + ✨ Daily Drop</h3>
            <select value={newPost.type} onChange={e => setNewPost({...newPost, type: e.target.value})}>
              <option value="text">Text</option><option value="photo">Photo</option><option value="video">Video</option>
              <option value="music">Song</option><option value="question">Question</option><option value="poll">Poll</option>
            </select>
            <textarea placeholder={`What's on your Wall? (${newPost.type})`} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} style={{ width: '100%', height: 80 }} />
            <button onClick={addToMyWall}>Add to Wall</button>
          </div>

          <div className="card" style={{ border: '2px dashed #ff6b6b' }}>
            <h3>🎁 Leave Something on Wall (Main Unique Feature)</h3>
            <p>Friends can leave:</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setWallAdditions([{id: Date.now(), from: 'Aarav', type: 'message', content: 'Bro amazing wall! 🔥', anonymous: false}, ...wallAdditions])}>Test Message</button>
              <button onClick={() => setWallAdditions([{id: Date.now(), from: 'Anonymous', type: 'message', content: 'Your vibe is great!', anonymous: true}, ...wallAdditions])}>Test Anonymous Drop</button>
            </div>
            {wallAdditions.map(a => (
              <div key={a.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <small>{a.anonymous ? 'Anonymous' : a.from} left {a.type}: </small><p>{a.content}</p>
                <button onClick={() => reportContent(a.id)}>Report</button>
              </div>
            ))}
          </div>

          <div className={customization.layout}>
            {wallPosts.length === 0 ? <p>Your Wall is empty. Start posting!</p> : wallPosts.map(post => (
              <div key={post.id} className="card" style={{ border: post.pinned ? '2px solid gold' : '1px solid #eee' }}>
                <small>{post.type} • {new Date(post.date).toLocaleDateString()} {post.pinned && '📌 Pinned'}</small>
                <p>{post.content}</p>
                <div>
                  <button onClick={() => addReaction(post.id, '❤️')}>❤️ {post.reactions?.length || 0}</button>
                  <button onClick={() => togglePin(post.id)}>{post.pinned ? 'Unpin' : '📌 Pin'}</button>
                  <button onClick={() => reportContent(post.id)}>🛡️ Report</button>
                </div>
                <div>{(comments[post.id] || []).map(c => <div key={c.id}><b>{c.user}:</b> {c.text}</div>)}
                  <input placeholder="Add comment..." onKeyDown={e => { if(e.key === 'Enter') { addComment(post.id, e.target.value); e.target.value=''; } }} />
                </div>
              </div>
            ))}
          </div>
        </main> 

                      <aside>
          <div className="card">
            <h4>🔎 Discover</h4>
            <input placeholder="Search Walls, interests..." style={{ width: '100%' }} />
            {discoverUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span>{u.name} @{u.username}</span><button onClick={() => setRequests([...requests, u])}>Connect</button>
              </div>
            ))}
            <h5 style={{ marginTop: 12 }}>🏆 Weekly Highlights</h5>
            <p style={{ fontSize: 12 }}>No appearance-based ranking. Only interesting Walls & best memories.</p>
          </div>

          <div className="card">
            <h4>👥 Shared Wall - Multiple people → one Wall</h4>
            {sharedWalls.map(sw => (
              <div key={sw.id} style={{ padding: 6, background: '#f5f5f5', marginBottom: 6 }}>
                <b>{sw.title}</b><br/><small>{sw.members.join(', ')}</small><p>{sw.posts.length} memories</p>
              </div>
            ))}
            <button onClick={() => { const t = prompt('Shared Wall name? Ex: Birthday, Trip, Event'); if(t) setSharedWalls([...sharedWalls, { id: Date.now().toString(), title: t, members: ['You'], posts: [] }]); }}>+ Create Shared Wall</button>
          </div>

          <div className="card">
            <h4>🔗 Share My Wall</h4>
            <p style={{ fontSize: 12, wordBreak: 'break-all' }}>{myWallLink}</p>
            <button onClick={() => alert('Shared to WhatsApp! ' + myWallLink)}>WhatsApp</button>
            <button onClick={() => alert('Shared to Instagram! ' + myWallLink)} style={{ marginLeft: 4 }}>Instagram</button>
          </div>

          <div className="card">
            <h4>🎁 Anonymous Drop + 🛡️ Safety</h4>
            <label><input type="checkbox" defaultChecked /> Allow Anonymous Drops</label>
            <p style={{ fontSize: 11 }}>Recipient doesn't initially see who sent it. Report/block controls available.</p>
            <h4>🔒 Privacy</h4>
            <ul style={{ fontSize: 12 }}><li>Public Wall</li><li>Friends only</li><li>Selected people</li><li>Block user</li><li>Report user</li></ul>
            <h4>🛡️ Safety</h4>
            <ul style={{ fontSize: 12 }}><li>Report content</li><li>Block users</li><li>Content moderation</li><li>Spam protection</li><li>Abuse prevention</li></ul>
          </div>

          <div className="card">
            <h4>🔔 Live Activity / Notifications</h4>
            {notifications.map(n => <div key={n.id} style={{ fontSize: 12, padding: 4, borderBottom: '1px solid #eee' }}>{n.text}</div>)}
          </div>

          <div className="card">
            <h4>📸 Memories / Wall History</h4>
            <p style={{ fontSize: 12 }}>Old posts, past memories, previous Wall activity, "On this day"</p>
            <button>View Wall History</button>
          </div>
        </aside>
      </div>
    </div>
  );
              }
