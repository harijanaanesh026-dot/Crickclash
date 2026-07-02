import React, { useState, useEffect } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { getDatabase, ref, onValue, set, increment, update } from "firebase/database"
import { auth, signInWithGoogle } from "./firebase"
import "./App.css"

// 50 INDIAN PLAYERS 🇮🇳
const INDIAN_PLAYERS = {
  sachin: { name: "Sachin Tendulkar", role: "BATTER", icon: "👑", category: "batters", country: "IN" },
  dhoni: { name: "MS Dhoni", role: "WK BAT", icon: "🏆", category: "keepers", isCaptain: true, country: "IN" },
  kohli: { name: "Virat Kohli", role: "BATTER", icon: "🦁", category: "batters", isCaptain: true, country: "IN" },
  rohit: { name: "Rohit Sharma", role: "BATTER", icon: "🎩", category: "batters", isCaptain: true, country: "IN" },
  yuvraj: { name: "Yuvraj Singh", role: "ALL-ROUNDER", icon: "☀️", category: "all-rounders", country: "IN" },
  dravid: { name: "Rahul Dravid", role: "BATTER", icon: "🧱", category: "batters", country: "IN" },
  ganguly: { name: "Sourav Ganguly", role: "BATTER", icon: "🐯", category: "batters", isCaptain: true, country: "IN" },
  sehwag: { name: "Virender Sehwag", role: "BATTER", icon: "💥", category: "batters", country: "IN" },
  zaheer: { name: "Zaheer Khan", role: "BOWLER", icon: "🎯", category: "bowlers", country: "IN" },
  harbhajan: { name: "Harbhajan Singh", role: "BOWLER", icon: "🌀", category: "bowlers", country: "IN" },
  kumble: { name: "Anil Kumble", role: "BOWLER", icon: "⚡", category: "bowlers", country: "IN" },
  bumrah: { name: "Jasprit Bumrah", role: "BOWLER", icon: "🐍", category: "bowlers", country: "IN" },
  rahul: { name: "KL Rahul", role: "WK BAT", icon: "⚔️", category: "keepers", country: "IN" },
  pant: { name: "Rishabh Pant", role: "WK BAT", icon: "🧤", category: "keepers", country: "IN" },
  hardik: { name: "Hardik Pandya", role: "ALL-ROUNDER", icon: "⚡", category: "all-rounders", country: "IN" },
  jadeja: { name: "Ravindra Jadeja", role: "ALL-ROUNDER", icon: "🗡️", category: "all-rounders", country: "IN" },
  shami: { name: "Mohammed Shami", role: "BOWLER", icon: "🏹", category: "bowlers", country: "IN" },
  siraj: { name: "Mohammed Siraj", role: "BOWLER", icon: "💨", category: "bowlers", country: "IN" },
  gill: { name: "Shubman Gill", role: "BATTER", icon: "💎", category: "batters", country: "IN" },
  surya: { name: "Suryakumar Yadav", role: "BATTER", icon: "🎪", category: "batters", country: "IN" },
  kuldeep: { name: "Kuldeep Yadav", role: "BOWLER", icon: "🌀", category: "bowlers", country: "IN" },
  chahal: { name: "Yuzvendra Chahal", role: "BOWLER", icon: "🎲", category: "bowlers", country: "IN" },
  axar: { name: "Axar Patel", role: "ALL-ROUNDER", icon: "🛡️", category: "all-rounders", country: "IN" },
  ashwin: { name: "R Ashwin", role: "ALL-ROUNDER", icon: "🧠", category: "all-rounders", country: "IN" },
  ishan: { name: "Ishan Kishan", role: "WK BAT", icon: "💣", category: "keepers", country: "IN" },
  samson: { name: "Sanju Samson", role: "WK BAT", icon: "🔥", category: "keepers", country: "IN" },
  jaiswal: { name: "Yashasvi Jaiswal", role: "BATTER", icon: "🌟", category: "batters", country: "IN" },
  gaikwad: { name: "Ruturaj Gaikwad", role: "BATTER", icon: "⭐", category: "batters", country: "IN" },
  tilak: { name: "Tilak Varma", role: "BATTER", icon: "✨", category: "batters", country: "IN" },
  rinku: { name: "Rinku Singh", role: "BATTER", icon: "💪", category: "batters", country: "IN" },
  abhishek: { name: "Abhishek Sharma", role: "ALL-ROUNDER", icon: "🎯", category: "all-rounders", country: "IN" },
  sundar: { name: "Washington Sundar", role: "ALL-ROUNDER", icon: "🎩", category: "all-rounders", country: "IN" },
  arshdeep: { name: "Arshdeep Singh", role: "BOWLER", icon: "🦅", category: "bowlers", country: "IN" },
  mukesh: { name: "Mukesh Kumar", role: "BOWLER", icon: "🚀", category: "bowlers", country: "IN" },
  prasidh: { name: "Prasidh Krishna", role: "BOWLER", icon: "🎯", category: "bowlers", country: "IN" },
  umran: { name: "Umran Malik", role: "BOWLER", icon: "⚡", category: "bowlers", country: "IN" },
  vaibhav: { name: "Vaibhav Suryavanshi", role: "BATTER", icon: "👶", category: "batters", country: "IN" },
  nitish: { name: "Nitish Kumar Reddy", role: "ALL-ROUNDER", icon: "🦚", category: "all-rounders", country: "IN" },
  riyan: { name: "Riyan Parag", role: "ALL-ROUNDER", icon: "🦋", category: "all-rounders", country: "IN" },
  dhruv: { name: "Dhruv Jurel", role: "WK BAT", icon: "🥊", category: "keepers", country: "IN" },
  kapil: { name: "Kapil Dev", role: "ALL-ROUNDER", icon: "🏅", category: "all-rounders", isCaptain: true, country: "IN" },
  laxman: { name: "VVS Laxman", role: "BATTER", icon: "🎨", category: "batters", country: "IN" },
  gambhir: { name: "Gautam Gambhir", role: "BATTER", icon: "🛡️", category: "batters", isCaptain: true, country: "IN" },
  raina: { name: "Suresh Raina", role: "BATTER", icon: "⚡", category: "batters", country: "IN" },
  irfan: { name: "Irfan Pathan", role: "ALL-ROUNDER", icon: "🦅", category: "all-rounders", country: "IN" },
  agarkar: { name: "Ajit Agarkar", role: "BOWLER", icon: "🎯", category: "bowlers", country: "IN" },
  nehra: { name: "Ashish Nehra", role: "BOWLER", icon: "💨", category: "bowlers", country: "IN" },
  sreesanth: { name: "S Sreesanth", role: "BOWLER", icon: "🌀", category: "bowlers", country: "IN" },
  shreyas: { name: "Shreyas Iyer", role: "BATTER", icon: "🎭", category: "batters", country: "IN" },
  shardul: { name: "Shardul Thakur", role: "ALL-ROUNDER", icon: "🦁", category: "all-rounders", country: "IN" }
}

// 50 FOREIGN LEGENDS 🌍
const FOREIGN_PLAYERS = {
  babar: { name: "Babar Azam", role: "BATTER", icon: "🇵🇰", category: "batters", country: "PK" },
  shaheen: { name: "Shaheen Afridi", role: "BOWLER", icon: "🇵🇰", category: "bowlers", country: "PK" },
  rizwan: { name: "M Rizwan", role: "WK BAT", icon: "🇵🇰", category: "keepers", country: "PK" },
  fakhar: { name: "Fakhar Zaman", role: "BATTER", icon: "🇵🇰", category: "batters", country: "PK" },
  shadab: { name: "Shadab Khan", role: "ALL-ROUNDER", icon: "🇵🇰", category: "all-rounders", country: "PK" },
  naseem: { name: "Naseem Shah", role: "BOWLER", icon: "🇵🇰", category: "bowlers", country: "PK" },
  smith: { name: "Steve Smith", role: "BATTER", icon: "🇦🇺", category: "batters", country: "AU" },
  cummins: { name: "Pat Cummins", role: "BOWLER", icon: "🇦🇺", category: "bowlers", isCaptain: true, country: "AU" },
  maxwell: { name: "Glenn Maxwell", role: "ALL-ROUNDER", icon: "🇦🇺", category: "all-rounders", country: "AU" },
  warner: { name: "David Warner", role: "BATTER", icon: "🇦🇺", category: "batters", country: "AU" },
  starc: { name: "Mitchell Starc", role: "BOWLER", icon: "🇦🇺", category: "bowlers", country: "AU" },
  hazlewood: { name: "Josh Hazlewood", role: "BOWLER", icon: "🇦🇺", category: "bowlers", country: "AU" },
  marsh: { name: "Mitchell Marsh", role: "ALL-ROUNDER", icon: "🇦🇺", category: "all-rounders", country: "AU" },
  head: { name: "Travis Head", role: "BATTER", icon: "🇦🇺", category: "batters", country: "AU" },
  zampa: { name: "Adam Zampa", role: "BOWLER", icon: "🇦🇺", category: "bowlers", country: "AU" },
  carey: { name: "Alex Carey", role: "WK BAT", icon: "🇦🇺", category: "keepers", country: "AU" },
  root: { name: "Joe Root", role: "BATTER", icon: "🇬🇧", category: "batters", country: "GB" },
  stokes: { name: "Ben Stokes", role: "ALL-ROUNDER", icon: "🇬🇧", category: "all-rounders", isCaptain: true, country: "GB" },
  buttler: { name: "Jos Buttler", role: "WK BAT", icon: "🇬🇧", category: "keepers", isCaptain: true, country: "GB" },
  archer: { name: "Jofra Archer", role: "BOWLER", icon: "🇬🇧", category: "bowlers", country: "GB" },
  wood: { name: "Mark Wood", role: "BOWLER", icon: "🇬🇧", category: "bowlers", country: "GB" },
  bairstow: { name: "Jonny Bairstow", role: "WK BAT", icon: "🇬🇧", category: "keepers", country: "GB" },
  brook: { name: "Harry Brook", role: "BATTER", icon: "🇬🇧", category: "batters", country: "GB" },
  livingstone: { name: "Liam Livingstone", role: "ALL-ROUNDER", icon: "🇬🇧", category: "all-rounders", country: "GB" },
  rashid: { name: "Adil Rashid", role: "BOWLER", icon: "🇬🇧", category: "bowlers", country: "GB" },
  kane: { name: "Kane Williamson", role: "BATTER", icon: "🇳🇿", category: "batters", isCaptain: true, country: "NZ" },
  boult: { name: "Trent Boult", role: "BOWLER", icon: "🇳🇿", category: "bowlers", country: "NZ" },
  conway: { name: "Devon Conway", role: "WK BAT", icon: "🇳🇿", category: "keepers", country: "NZ" },
  santner: { name: "Mitchell Santner", role: "ALL-ROUNDER", icon: "🇳🇿", category: "all-rounders", country: "NZ" },
  ferguson: { name: "Lockie Ferguson", role: "BOWLER", icon: "🇳🇿", category: "bowlers", country: "NZ" },
  dekock: { name: "Quinton de Kock", role: "WK BAT", icon: "🇿🇦", category: "keepers", country: "ZA" },
  rabada: { name: "Kagiso Rabada", role: "BOWLER", icon: "🇿🇦", category: "bowlers", country: "ZA" },
  klaasen: { name: "Heinrich Klaasen", role: "WK BAT", icon: "🇿🇦", category: "keepers", country: "ZA" },
  miller: { name: "David Miller", role: "BATTER", icon: "🇿🇦", category: "batters", country: "ZA" },
  nortje: { name: "Anrich Nortje", role: "BOWLER", icon: "🇿🇦", category: "bowlers", country: "ZA" },
  markram: { name: "Aiden Markram", role: "BATTER", icon: "🇿🇦", category: "batters", isCaptain: true, country: "ZA" },
  rashidk: { name: "Rashid Khan", role: "BOWLER", icon: "🇦🇫", category: "bowlers", country: "AF" },
  nabi: { name: "Mohammad Nabi", role: "ALL-ROUNDER", icon: "🇦🇫", category: "all-rounders", country: "AF" },
  gurbaz: { name: "Rahmanullah Gurbaz", role: "WK BAT", icon: "🇦🇫", category: "keepers", country: "AF" },
  farooqi: { name: "Fazalhaq Farooqi", role: "BOWLER", icon: "🇦🇫", category: "bowlers", country: "AF" },
  pollard: { name: "Kieron Pollard", role: "ALL-ROUNDER", icon: "🇹🇹", category: "all-rounders", country: "WI" },
  russell: { name: "Andre Russell", role: "ALL-ROUNDER", icon: "🇯🇲", category: "all-rounders", country: "WI" },
  pooran: { name: "Nicholas Pooran", role: "WK BAT", icon: "🇹🇹", category: "keepers", country: "WI" },
  hetmyer: { name: "Shimron Hetmyer", role: "BATTER", icon: "🇬🇾", category: "batters", country: "WI" },
  holder: { name: "Jason Holder", role: "ALL-ROUNDER", icon: "🇧🇧", category: "all-rounders", country: "WI" },
  joseph: { name: "Alzarri Joseph", role: "BOWLER", icon: "🇦🇬", category: "bowlers", country: "WI" },
  shakib: { name: "Shakib Al Hasan", role: "ALL-ROUNDER", icon: "🇧🇩", category: "all-rounders", country: "BD" },
  mustafizur: { name: "Mustafizur Rahman", role: "BOWLER", icon: "🇧🇩", category: "bowlers", country: "BD" },
  hasaranga: { name: "Wanindu Hasaranga", role: "ALL-ROUNDER", icon: "🇱🇰", category: "all-rounders", country: "LK" },
  pathirana: { name: "Matheesha Pathirana", role: "BOWLER", icon: "🇱🇰", category: "bowlers", country: "LK" }
}

const db = getDatabase()

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("battle")
  const [battleNumber, setBattleNumber] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("any")
  const [gameMode, setGameMode] = useState("india")
  const [userVotes, setUserVotes] = useState({})
  const [showShareModal, setShowShareModal] = useState(false)
  const [playerVotes, setPlayerVotes] = useState({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  const ALL_PLAYERS = gameMode === "global"? {...INDIAN_PLAYERS,...FOREIGN_PLAYERS } : INDIAN_PLAYERS

  useEffect(() => {
    const votesRef = ref(db, 'playerVotes')
    const unsubscribe = onValue(votesRef, (snapshot) => setPlayerVotes(snapshot.val() || {}))

    const totalRef = ref(db, 'totalVotes')
    const unsubTotal = onValue(totalRef, (snapshot) => setTotalVotes(snapshot.val() || 0))

    const usersRef = ref(db, 'users')
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      setTotalUsers(Object.keys(data).length)
    })

    return () => {
      unsubscribe()
      unsubTotal()
      unsubUsers()
    }
  }, [])

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`)
      set(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: Date.now(),
        country: "IN"
      })

      const userVotesRef = ref(db, `userVotes/${user.uid}`)
      const unsubscribe = onValue(userVotesRef, (snapshot) => setUserVotes(snapshot.val() || {}))
      return unsubscribe
    }
  }, )

  const generateBattle = (battleNum, category = selectedCategory) => {
    let playerKeys = Object.keys(ALL_PLAYERS)

    if (category!== "any") {
      if (category === "captain") {
        playerKeys = playerKeys.filter(key => ALL_PLAYERS[key].isCaptain === true)
      } else {
        playerKeys = playerKeys.filter(key => ALL_PLAYERS[key].category === category)
      }
    }

    if (playerKeys.length < 2) playerKeys = Object.keys(ALL_PLAYERS)

    const p1Key = playerKeys[Math.floor(Math.random() * playerKeys.length)]
    let p2Key = playerKeys[Math.floor(Math.random() * playerKeys.length)]
    while(p2Key === p1Key && playerKeys.length > 1) {
      p2Key = playerKeys[Math.floor(Math.random() * playerKeys.length)]
    }

    return {
      player1: {...ALL_PLAYERS[p1Key], id: p1Key, votes: playerVotes[p1Key] || 0 },
      player2: {...ALL_PLAYERS[p2Key], id: p2Key, votes: playerVotes[p2Key] || 0 }
    }
  }

  const [currentBattle, setCurrentBattle] = useState(generateBattle(1))

  useEffect(() => {
    setCurrentBattle(generateBattle(battleNumber, selectedCategory))
  }, [playerVotes, battleNumber, selectedCategory, gameMode])

  const calculateRankings = () => {
    const players = Object.entries(ALL_PLAYERS).map(([id, player]) => {
      const votes = playerVotes[id] || 0
      const total = totalVotes || 1
      const percent = Math.round((votes / total) * 100)
      return { id,...player, votes, percent }
    })
    return players.sort((a, b) => b.votes - a.votes).slice(0, 20)
  }

  const [rankings, setRankings] = useState(calculateRankings())

  useEffect(() => {
    setRankings(calculateRankings())
  }, [playerVotes, totalVotes, gameMode])

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

  const handleLogout = () => signOut(auth)

  const handleVote = async (playerId) => {
    if (!user) return

    const battleKey = `battle_${battleNumber}_${gameMode}`
    if (userVotes[battleKey]) {
      alert("Ee battle lo already vote chesav!")
      return
    }

    const updates = {}
    updates[`playerVotes/${playerId}`] = increment(1)
    updates[`userVotes/${user.uid}/${battleKey}`] = playerId
    updates[`totalVotes`] = increment(1)

    await update(ref(db), updates)
    setTimeout(() => setBattleNumber(battleNumber + 1), 500)
  }

  const handleSkip = () => setBattleNumber(battleNumber + 1)

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setBattleNumber(battleNumber + 1)
  }

  const handleShare = (platform) => {
    const shareUrl = window.location.href
    const shareText = `⚡ CrickClash ${gameMode === "global"? "Global" : "India"} Battle: ${currentBattle.player1.name} vs ${currentBattle.player2.name}! Vote now: ${shareUrl}`

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
      title: `CrickClash ${gameMode === "global"? "Global" : "India"}`,
      text: `⚡ ${currentBattle.player1.name} vs ${currentBattle.player2.name}!`,
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
        <h1>CrickClash 🌍</h1>
        <p>WORLD'S Fantasy Sport!</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="login-screen">
        <h1>CrickClash 🌍</h1>
        <h2>WORLD'S Biggest Cricket Battles!</h2>
        <p style={{ marginBottom: 20, color: '#aaa' }}>
          50 Indian + 50 Global Cricket Stars
        </p>
        <button onClick={handleLogin} className="google-btn">
          Continue with Google
        </button>
        <p style={{ marginTop: 30, fontSize: '0.85rem', color: '#666' }}>
          Join {totalUsers > 0? totalUsers + '+' : 'thousands of'} fans worldwide 🔥
        </p>
      </div>
    )
  }

  const userBattles = Object.keys(userVotes).length

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
              <button onClick={() => handleShare('telegram')} style={{ padding: '12px', background: '#0088cc', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
