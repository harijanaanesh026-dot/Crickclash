import React, { useState, useEffect } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, signInWithGoogle } from "./firebase"
import "./App.css"

// INDIAN PLAYERS DATABASE
const INDIAN_PLAYERS = {
  sachin: { name: "Sachin Tendulkar", role: "BATTER", icon: "👑", category: "batters" },
  dhoni: { name: "MS Dhoni", role: "WK BAT", icon: "🏆", category: "keepers", isCaptain: true },
  kohli: { name: "Virat Kohli", role: "BATTER", icon: "🦁", category: "batters", isCaptain: true },
  yuvraj: { name: "Yuvraj Singh", role: "ALL-ROUNDER", icon: "☀️", category: "all-rounders" },
  dravid: { name: "Rahul Dravid", role: "BATTER", icon: "🧱", category: "batters" },
  ganguly: { name: "Sourav Ganguly", role: "BATTER", icon: "🐯", category: "batters", isCaptain: true },
  sehwag: { name: "Virender Sehwag", role: "BATTER", icon: "💥", category: "batters" },
  zaheer: { name: "Zaheer Khan", role: "BOWLER", icon: "🎯", category: "bowlers" },
  harbhajan: { name: "Harbhajan Singh", role: "BOWLER", icon: "🌀", category: "bowlers" },
  kumble: { name: "Anil Kumble", role: "BOWLER", icon: "⚡", category: "bowlers" },
  rohit: { name: "Rohit Sharma", role: "BATTER", icon: "🎩", category: "batters", isCaptain: true },
  bumrah: { name: "Jasprit Bumrah", role: "BOWLER", icon: "🐍", category: "bowlers" },
  rahul: { name: "KL Rahul", role: "WK BAT", icon: "⚔️", category: "keepers" },
  pant: { name: "Rishabh Pant", role: "WK BAT", icon: "🧤", category: "keepers" },
  hardik: { name: "Hardik Pandya", role: "ALL-ROUNDER", icon: "⚡", category: "all-rounders" },
  jadeja: { name: "Ravindra Jadeja", role: "ALL-ROUNDER", icon: "🗡️", category: "all-rounders" },
  shami: { name: "Mohammed Shami", role: "BOWLER", icon: "🏹", category: "bowlers" },
  siraj: { name: "Mohammed Siraj", role: "BOWLER", icon: "💨", category: "bowlers" },
  gill: { name: "Shubman Gill", role: "BATTER", icon: "💎", category: "batters" },
  surya: { name: "Suryakumar Yadav", role: "BATTER", icon: "🎪", category: "batters" },
  kuldeep: { name: "Kuldeep Yadav", role: "BOWLER", icon: "🌀", category: "bowlers" },
  chahal: { name: "Yuzvendra Chahal", role: "BOWLER", icon: "🎲", category: "bowlers" },
  axar: { name: "Axar Patel", role: "ALL-ROUNDER", icon: "🛡️", category: "all-rounders" },
  ashwin: { name: "R Ashwin", role: "ALL-ROUNDER", icon: "🧠", category: "all-rounders" },
  ishan: { name: "Ishan Kishan", role: "WK BAT", icon: "💣", category: "keepers" },
  samson: { name: "Sanju Samson", role: "WK BAT", icon: "🔥", category: "keepers" },
  jaiswal: { name: "Yashasvi Jaiswal", role: "BATTER", icon: "🌟", category: "batters" },
  gaikwad: { name: "Ruturaj Gaikwad", role: "BATTER", icon: "⭐", category: "batters" },
  tilak: { name: "Tilak Varma", role: "BATTER", icon: "✨", category: "batters" },
  rinku: { name: "Rinku Singh", role: "BATTER", icon: "💪", category: "batters" },
  abhishek: { name: "Abhishek Sharma", role: "ALL-ROUNDER", icon: "🎯", category: "all-rounders" },
  sundar: { name: "Washington Sundar", role: "ALL-ROUNDER", icon: "🎩", category: "all-rounders" },
  arshdeep: { name: "Arshdeep Singh", role: "BOWLER", icon: "🦅", category: "bowlers" },
  mukesh: { name: "Mukesh Kumar", role: "BOWLER", icon: "🚀", category: "bowlers" },
  prasidh: { name: "Prasidh Krishna", role: "BOWLER", icon: "🎯", category: "bowlers" },
  umran: { name: "Umran Malik", role: "BOWLER", icon: "⚡", category: "bowlers" },
  vaibhav: { name: "Vaibhav Suryavanshi", role: "BATTER", icon: "👶", category: "batters" },
  nitish: { name: "Nitish Kumar Reddy", role: "ALL-ROUNDER", icon: "🦚", category: "all-rounders" },
  riyan: { name: "Riyan Parag", role: "ALL-ROUNDER", icon: "🦋", category: "all-rounders" },
  dhruv: { name: "Dhruv Jurel", role: "WK BAT", icon: "🥊", category: "keepers" },
  kapil: { name: "Kapil Dev", role: "ALL-ROUNDER", icon: "🏅", category: "all-rounders", isCaptain: true },
  laxman: { name: "VVS Laxman", role: "BATTER", icon: "🎨", category: "batters" },
  gambhir: { name: "Gautam Gambhir", role: "BATTER", icon: "🛡️", category: "batters", isCaptain: true },
  raina: { name: "Suresh Raina", role: "BATTER", icon: "⚡", category: "batters" },
  irfan: { name: "Irfan Pathan", role: "ALL-ROUNDER", icon: "🦅", category: "all-rounders" },
  agarkar: { name: "Ajit Agarkar", role: "BOWLER", icon: "🎯", category: "bowlers" },
  nehra: { name: "Ashish Nehra", role: "BOWLER", icon: "💨", category: "bowlers" },
  sreesanth: { name: "S Sreesanth", role: "BOWLER", icon: "🌀", category: "bowlers" },
  shreyas: { name: "Shreyas Iyer", role: "BATTER", icon: "🎭", category: "batters" },
  venkatesh: { name: "Venkatesh Iyer", role: "ALL-ROUNDER", icon: "🦚", category: "all-rounders" },
  deepak: { name: "Deepak Chahar", role: "BOWLER", icon: "⚡", category: "bowlers" },
  shardul: { name: "Shardul Thakur", role: "ALL-ROUNDER", icon: "🦁", category: "all-rounders" },
  umesh: { name: "Umesh Yadav", role: "BOWLER", icon: "💨", category: "bowlers" },
  karthik: { name: "Dinesh Karthik", role: "WK BAT", icon: "⭐", category: "keepers" }
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("battle")
  const [battleNumber, setBattleNumber] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("any")
  const [userVotes, setUserVotes] = useState({})
  const [showShareModal, setShowShareModal] = useState(false)

  const generateBattle = (battleNum, category = selectedCategory) => {
    let playerKeys = Object.keys(INDIAN_PLAYERS)
    
    if (category!== "any") {
      if (category === "captain") {
        playerKeys = playerKeys.filter(key => INDIAN_PLAYERS[key].isCaptain === true)
      } else {
        playerKeys = playerKeys.filter(key => INDIAN_PLAYERS[key].category === category)
      }
    }
    
    if (playerKeys.length < 2) {
      playerKeys = Object.keys(INDIAN_PLAYERS)
    }
    
    const p1Key = playerKeys[Math.floor(Math.random() * playerKeys.length)]
    let p2Key = playerKeys[Math.floor(Math.random() * playerKeys.length)]
    while(p2Key === p1Key && playerKeys.length > 1) {
      p2Key = playerKeys[Math.floor(Math.random() * playerKeys.length)]
    }
    
    return {
      player1: {...INDIAN_PLAYERS[p1Key], id: p1Key, votes: Math.floor(Math.random() * 50) + 10 },
      player2: {...INDIAN_PLAYERS[p2Key], id: p2Key, votes: Math.floor(Math.random() * 50) + 10 }
    }
  }

  const [currentBattle, setCurrentBattle] = useState(generateBattle(1))

  const calculateRankings = () => {
    const players = Object.entries(INDIAN_PLAYERS).map(([id, player]) => ({
      id,
    ...player,
      percent: Math.floor(Math.random() * 30) + 60,
      votes: Math.floor(Math.random() * 500) + 100
    }))
    return players.sort((a, b) => b.percent - a.percent).slice(0, 20)
  }

  const [rankings, setRankings] = useState(calculateRankings())

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleLogin = () => {
    signInWithGoogle().catch((error) => {
      console.error("Login Error:", error)
      alert("Login failed: " + error.message)
    })
  }

  const handleLogout = () => {
    signOut(auth)
  }

  const handleVote = (playerId) => {
    if (userVotes[battleNumber]) {
      alert("Ee battle lo already vote chesav!")
      return
    }
    
    setUserVotes({...userVotes, [battleNumber]: playerId })
    
    setTimeout(() => {
      setBattleNumber(battleNumber + 1)
      setCurrentBattle(generateBattle(battleNumber + 1))
    }, 500)
  }

  const handleSkip = () => {
    setBattleNumber(battleNumber + 1)
    setCurrentBattle(generateBattle(battleNumber + 1))
  }

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setBattleNumber(battleNumber + 1)
    setCurrentBattle(generateBattle(battleNumber + 1, cat))
  }

  // SOCIAL SHARE FUNCTION
  const handleShare = (platform) => {
    const shareUrl = window.location.href
    const shareText = `⚡ CrickClash lo ${currentBattle.player1.name} vs ${currentBattle.player2.name} battle! Nuvvu evariki vote vestav? 🇮🇳 Vote chey: ${shareUrl}`
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }
    
    if (platform === 'instagram') {
      alert("Instagram: Screenshot teesi story lo share chey! 📸")
      return
    }
    
    window.open(urls[platform], '_blank', 'width=600,height=400')
    setShowShareModal(false)
  }

  const handleNativeShare = async () => {
    const shareData = {
      title: 'CrickClash - Team India Battles',
      text: `⚡ ${currentBattle.player1.name} vs ${currentBattle.player2.name}! Nuvvu evariki vote vestav?`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        setShowShareModal(true)
      }
    } else {
      setShowShareModal(true)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <h1>⚡ CrickClash 🇮🇳</h1>
        <p>Loading Team India...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="login-screen">
        <h1>⚡ CrickClash 🇮🇳</h1>
        <h2>INDIA'S Fantasy Sport!</h2>
        <p style={{ marginBottom: 20, color: '#aaa' }}>
          Vote for your favorite Indian Cricketers
        </p>
        <button onClick={handleLogin} className="google-btn">
          Continue with Google
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="bolt">⚡</span> Cricket Clash
        </div>
        <div className="user-info">
          <button onClick={handleNativeShare} className="share-btn" style={{ padding: '6px 12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '0.85rem' }}>
            📤 Share
          </button>
          <span>Hi, {user.displayName?.split(' ')[0]}</span>
          <button onClick={handleLogout} className="sign-out">Sign out</button>
        </div>
      </header>

      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowShareModal(false)}>
          <div style={{ background: '#1a1f3a', padding: '30px', borderRadius: '16px', maxWidth: '320px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Share Battle 📤</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={() => handleShare('whatsapp')} style={{ padding: '12px', background: '#25D366', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>📱 WhatsApp</button>
              <button onClick={() => handleShare('twitter')} style={{ padding: '12px', background: '#1DA1F2', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>🐦 Twitter</button>
              <button onClick={() => handleShare('facebook')} style={{ padding: '12px', background: '#4267B2', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>📘 Facebook</button>
              <button onClick={() => handleShare('linkedin')} style={{ padding: '12px', background: '#0077B5', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>💼 LinkedIn</button>
              <button onClick={() => handleShare('telegram')} style={{ padding: '12px', background: '#0088cc', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>✈️ Telegram</button>
              <button onClick={() => handleShare('instagram')} style={{ padding: '12px', background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>📸 Instagram</button>
            </div>
            <button onClick={() => setShowShareModal(false)} style={{ width: '100%', marginTop: '15px', padding: '10px', background: '#333', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      <div className="stats-bar">
        <div className="stat">
          <span className="num">1.2k</span>
          <span className="label">TOTAL VOTES</span>
        </div>
        <div className="stat">
          <span className="num">{Object.keys(userVotes).length}</span>
          <span className="label">BATTLES</span>
        </div>
        <div className="stat">
          <span className="num">{rankings[0]?.name.split(' ')[0]}</span>
          <span className="label">TOP CHAMP</span>
        </div>
        <div className="stat">
          <span className="num">{Object.keys(userVotes).length}</span>
          <span className="label">STREAK</span>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === "battle"? "tab active" : "tab"}
          onClick={() => setActiveTab("battle")}
        >
          ⚔️ Battle
        </button>
        <button 
          className={activeTab === "rankings"? "tab active" : "tab"}
          onClick={() => setActiveTab("rankings")}
        >
          🏆 Rankings
        </button>
        <button 
          className={activeTab === "history"? "tab active" : "tab"}
          onClick={() => setActiveTab("history")}
        >
          📜 History
        </button>
      </div>

      {activeTab === "battle" && (
        <div className="battle-screen">
          <h2>WHO DO YOU LIKE?</h2>
          <h3>Battle {battleNumber}</h3>
          
          <div className="categories">
            {["any", "batters", "bowlers", "all-rounders", "keepers", "captain"].map(cat => (
              <button 
                key={cat}
                className={selectedCategory === cat? "cat-btn active" : "cat-btn"}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat === "any"? "Any" : cat === "all-rounders"? "AR" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="battle-cards">
            <div className="player-card left" onClick={() => handleVote(currentBattle.player1.id)}>
              <div className="player-icon">{currentBattle.player1.icon}</div>
              <div className="player-info">
                <span className="role">{currentBattle.player1.role}</span>
                <h3>{currentBattle.player1.name}</h3>
                <span className="votes">{currentBattle.player1.votes} votes</span>
              </div>
            </div>

            <div className="vs">VS</div>

            <div className="player-card right" onClick={() => handleVote(currentBattle.player2.id)}>
              <div className="player-icon">{currentBattle.player2.icon}</div>
              <div className="player-info">
                <span className="role">{currentBattle.player2.role}</span>
                <h3>{currentBattle.player2.name}</h3>
                <span className="votes">{currentBattle.player2.votes} votes</span>
              </div>
            </div>
          </div>

          <button className="skip-btn" onClick={handleSkip}>
            Skip →
          </button>
          
          {userVotes[battleNumber] && (
            <p style={{ textAlign: 'center', marginTop: 20, color: '#4caf50' }}>
              ✓ You voted for {INDIAN_PLAYERS[userVotes[battleNumber]].name}
            </p>
          )}
        </div>
      )}

      {activeTab === "rankings" && (
        <div className="rankings-screen">
          <h2>India's Kings 👑</h2>
          <p className="subtitle">Ranked by fan votes • Updated live</p>
          
          <div className="categories">
            {["all", "batters", "bowlers", "all-rounders", "keepers"].map(cat => (
              <button key={cat} className="cat-btn">
                {cat}
              </button>
            ))}
          </div>

          <div className="rankings-list">
            {rankings.map((player, idx) => (
              <div key={player.id} className="ranking-item">
                <span className="rank-num">#{idx + 1}</span>
                <span className="player-icon-small">{player.icon}</span>
                <div className="player-details">
                  <span className="player-name">{player.name}</span>
                  <span className="player-role">{player.role}</span>
                </div>
                <span className="percent">{player.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="history-screen">
          <h2>Your Votes</h2>
          {Object.keys(userVotes).length === 0? (
            <p>No battles yet. Start voting!</p>
          ) : (
            <div style={{ textAlign: 'left', padding: 20 }}>
              {Object.entries(userVotes).map(([battle, playerId]) => (
                <p key={battle} style={{ marginBottom: 10 }}>
                  Battle {battle}: Voted for {INDIAN_PLAYERS[playerId].name} {INDIAN_PLAYERS[playerId].icon}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="version">Version 16 of 16</div>
    </div>
  )
}

export default App
