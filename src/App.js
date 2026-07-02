import React, { useState, useEffect } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { getDatabase, ref, onValue, set, increment, update } from "firebase/database"
import { auth, signInWithGoogle } from "./firebase"
import "./App.css"

// 50 INDIAN PLAYERS 🇮🇳
const INDIAN_PLAYERS = {
  const INDIAN_PLAYERS = {
  "kohli": { name: "Virat Kohli", role: "BATTER", icon: "👑", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Virat_Kohli_in_PMO_New_Delhi.jpg/240px-Virat_Kohli_in_PMO_New_Delhi.jpg" },
  "rohit": { name: "Rohit Sharma", role: "BATTER", icon: "🎯", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg/240px-Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg" },
  "dhoni": { name: "MS Dhoni", role: "WK BAT", icon: "🦁", category: "keepers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/MS_Dhoni_%28P.B._K._Kadam_Award%29.jpg/240px-MS_Dhoni_%28P.B._K._Kadam_Award%29.jpg" },
  "bumrah": { name: "Jasprit Bumrah", role: "BOWLER", icon: "💥", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Jasprit_Bumrah_in_PMO_New_Delhi.jpg/240px-Jasprit_Bumrah_in_PMO_New_Delhi.jpg" },
  "shami": { name: "Mohammed Shami", role: "BOWLER", icon: "🔥", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Mohammed_Shami_in_PMO_New_Delhi.jpg/240px-Mohammed_Shami_in_PMO_New_Delhi.jpg" },
  "siraj": { name: "Mohammed Siraj", role: "BOWLER", icon: "⚡", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Mohammed_Siraj_in_PMO_New_Delhi.jpg/240px-Mohammed_Siraj_in_PMO_New_Delhi.jpg" },
  "jadeja": { name: "Ravindra Jadeja", role: "ALL-ROUNDER", icon: "🗡️", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ravindra_Jadeja_in_PMO_New_Delhi.jpg/240px-Ravindra_Jadeja_in_PMO_New_Delhi.jpg" },
  "hardik": { name: "Hardik Pandya", role: "ALL-ROUNDER", icon: "⚡", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Hardik_Pandya_in_PMO_New_Delhi.jpg/240px-Hardik_Pandya_in_PMO_New_Delhi.jpg" },
  "rahul": { name: "KL Rahul", role: "WK BAT", icon: "🎯", category: "keepers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/KL_Rahul_in_PMO_New_Delhi.jpg/240px-KL_Rahul_in_PMO_New_Delhi.jpg" },
  "pant": { name: "Rishabh Pant", role: "WK BAT", icon: "💪", category: "keepers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Rishabh_Pant_in_PMO_New_Delhi.jpg/240px-Rishabh_Pant_in_PMO_New_Delhi.jpg" },
  "gill": { name: "Shubman Gill", role: "BATTER", icon: "⭐", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Shubman_Gill_in_PMO_New_Delhi.jpg/240px-Shubman_Gill_in_PMO_New_Delhi.jpg" },
  "ashwin": { name: "R Ashwin", role: "ALL-ROUNDER", icon: "🎓", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/R_Ashwin_in_PMO_New_Delhi.jpg/240px-R_Ashwin_in_PMO_New_Delhi.jpg" },
  "surya": { name: "Suryakumar Yadav", role: "BATTER", icon: "💫", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Suryakumar_Yadav_in_PMO_New_Delhi.jpg/240px-Suryakumar_Yadav_in_PMO_New_Delhi.jpg" },
  "kuldeep": { name: "Kuldeep Yadav", role: "BOWLER", icon: "🌀", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Kuldeep_Yadav_in_PMO_New_Delhi.jpg/240px-Kuldeep_Yadav_in_PMO_New_Delhi.jpg" },
  "axar": { name: "Axar Patel", role: "ALL-ROUNDER", icon: "🛡️", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Axar_Patel_in_PMO_New_Delhi.jpg/240px-Axar_Patel_in_PMO_New_Delhi.jpg" },
  "sehwag": { name: "Virender Sehwag", role: "BATTER", icon: "💥", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Virender_Sehwag.jpg/240px-Virender_Sehwag.jpg" },
  "ganguly": { name: "Sourav Ganguly", role: "BATTER", icon: "🐅", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Sourav_Ganguly_ICC.jpg/240px-Sourav_Ganguly_ICC.jpg" },
  "dravid": { name: "Rahul Dravid", role: "BATTER", icon: "🧱", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Rahul_Dravid_in_PMO_New_Delhi.jpg/240px-Rahul_Dravid_in_PMO_New_Delhi.jpg" },
  "sachin": { name: "Sachin Tendulkar", role: "BATTER", icon: "🐐", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Sachin_Tendulkar_at_MRF_Promotion_Event.jpg/240px-Sachin_Tendulkar_at_MRF_Promotion_Event.jpg" },
  "zaheer": { name: "Zaheer Khan", role: "BOWLER", icon: "🔥", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Zaheer_Khan_ICC.jpg/240px-Zaheer_Khan_ICC.jpg" },
  "yuvraj": { name: "Yuvraj Singh", role: "ALL-ROUNDER", icon: "💪", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Yuvraj_Singh_in_PMO_New_Delhi.jpg/240px-Yuvraj_Singh_in_PMO_New_Delhi.jpg" },
  "harbhajan": { name: "Harbhajan Singh", role: "BOWLER", icon: "🌀", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Harbhajan_Singh_ICC.jpg/240px-Harbhajan_Singh_ICC.jpg" },
  "kaif": { name: "Mohammad Kaif", role: "BATTER", icon: "⚡", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mohammad_Kaif.jpg/240px-Mohammad_Kaif.jpg" },
  "nehra": { name: "Ashish Nehra", role: "BOWLER", icon: "🔥", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Ashish_Nehra.jpg/240px-Ashish_Nehra.jpg" },
  "iyer": { name: "Shreyas Iyer", role: "BATTER", icon: "🎯", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Shreyas_Iyer_in_PMO_New_Delhi.jpg/240px-Shreyas_Iyer_in_PMO_New_Delhi.jpg" },
  "jaiswal": { name: "Yashasvi Jaiswal", role: "BATTER", icon: "🌟", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Yashasvi_Jaiswal_in_PMO_New_Delhi.jpg/240px-Yashasvi_Jaiswal_in_PMO_New_Delhi.jpg" },
  "arshdeep": { name: "Arshdeep Singh", role: "BOWLER", icon: "⚡", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Arshdeep_Singh_in_PMO_New_Delhi.jpg/240px-Arshdeep_Singh_in_PMO_New_Delhi.jpg" },
  "sundar": { name: "Washington Sundar", role: "ALL-ROUNDER", icon: "🎯", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Washington_Sundar_in_PMO_New_Delhi.jpg/240px-Washington_Sundar_in_PMO_New_Delhi.jpg" },
  "tilak": { name: "Tilak Varma", role: "BATTER", icon: "💫", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Tilak_Varma.jpg/240px-Tilak_Varma.jpg" },
  "rinku": { name: "Rinku Singh", role: "BATTER", icon: "💥", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Rinku_Singh_in_PMO_New_Delhi.jpg/240px-Rinku_Singh_in_PMO_New_Delhi.jpg" },
  "ishan": { name: "Ishan Kishan", role: "WK BAT", icon: "⚡", category: "keepers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ishan_Kishan_in_PMO_New_Delhi.jpg/240px-Ishan_Kishan_in_PMO_New_Delhi.jpg" },
  "chahal": { name: "Yuzvendra Chahal", role: "BOWLER", icon: "🌀", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Yuzvendra_Chahal_in_PMO_New_Delhi.jpg/240px-Yuzvendra_Chahal_in_PMO_New_Delhi.jpg" },
  "mukesh": { name: "Mukesh Kumar", role: "BOWLER", icon: "🎯", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Mukesh_Kumar_cricketer.jpg/240px-Mukesh_Kumar_cricketer.jpg" },
  "deepak": { name: "Deepak Chahar", role: "BOWLER", icon: "🔥", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Deepak_Chahar.jpg/240px-Deepak_Chahar.jpg" },
  "prasidh": { name: "Prasidh Krishna", role: "BOWLER", icon: "⚡", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prasidh_Krishna.jpg/240px-Prasidh_Krishna.jpg" },
  "bhuvi": { name: "Bhuvneshwar Kumar", role: "BOWLER", icon: "🎯", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bhuvneshwar_Kumar_in_PMO_New_Delhi.jpg/240px-Bhuvneshwar_Kumar_in_PMO_New_Delhi.jpg" },
  "dube": { name: "Shivam Dube", role: "ALL-ROUNDER", icon: "💪", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Shivam_Dube_in_PMO_New_Delhi.jpg/240px-Shivam_Dube_in_PMO_New_Delhi.jpg" },
  "gaikwad": { name: "Ruturaj Gaikwad", role: "BATTER", icon: "⭐", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Ruturaj_Gaikwad.jpg/240px-Ruturaj_Gaikwad.jpg" },
  "paddikal": { name: "Devdutt Padikkal", role: "BATTER", icon: "🎯", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Devdutt_Padikkal.jpg/240px-Devdutt_Padikkal.jpg" },
  "jurel": { name: "Dhruv Jurel", role: "WK BAT", icon: "⚡", category: "keepers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Dhruv_Jurel.jpg/240px-Dhruv_Jurel.jpg" },
  "bishnoi": { name: "Ravi Bishnoi", role: "BOWLER", icon: "🌀", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Ravi_Bishnoi.jpg/240px-Ravi_Bishnoi.jpg" },
  "umran": { name: "Umran Malik", role: "BOWLER", icon: "🚀", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Umran_Malik.jpg/240px-Umran_Malik.jpg" },
  "riyan": { name: "Riyan Parag", role: "ALL-ROUNDER", icon: "💫", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Riyan_Parag.jpg/240px-Riyan_Parag.jpg" },
  "samson": { name: "Sanju Samson", role: "WK BAT", icon: "⚡", category: "keepers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Sanju_Samson_in_PMO_New_Delhi.jpg/240px-Sanju_Samson_in_PMO_New_Delhi.jpg" },
  "shardul": { name: "Shardul Thakur", role: "ALL-ROUNDER", icon: "💪", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Shardul_Thakur_in_PMO_New_Delhi.jpg/240px-Shardul_Thakur_in_PMO_New_Delhi.jpg" },
  "gavaskar": { name: "Sunil Gavaskar", role: "BATTER", icon: "🧱", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Sunil_Gavaskar.jpg/240px-Sunil_Gavaskar.jpg" },
  "kapil": { name: "Kapil Dev", role: "ALL-ROUNDER", icon: "🏆", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Kapil_Dev.jpg/240px-Kapil_Dev.jpg" },
  "kumble": { name: "Anil Kumble", role: "BOWLER", icon: "🌀", category: "bowlers", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Anil_Kumble_ICC.jpg/240px-Anil_Kumble_ICC.jpg" },
  "vvs": { name: "VVS Laxman", role: "BATTER", icon: "🎨", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/VVS_Laxman_ICC.jpg/240px-VVS_Laxman_ICC.jpg" },
  "irfan": { name: "Irfan Pathan", role: "ALL-ROUNDER", icon: "⚡", category: "all-rounders", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Irfan_Pathan_ICC.jpg/240px-Irfan_Pathan_ICC.jpg" },
  "vaibhav": { name: "Vaibhav Suryavanshi", role: "BATTER", icon: "🌟", category: "batters", country: "India", photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Vaibhav_Suryavanshi_2024.jpg/240px-Vaibhav_Suryavanshi_2024.jpg" }
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
        <h1>⚡ CrickClash 🌍</h1>
        <p>Loading 100 World Cricketers...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="login-screen">
        <h1>⚡ CrickClash 🌍</h1>
        <h2>WORLD'S Biggest Cricket Battles!</h2>
        <p style={{ marginBottom: 10, color: '#aaa' }}>
          50 Indian + 50 Global Cricket Stars
        </p>

        {/* ZUCKERBERG STYLE NAME TAG - ANESH */}
        <p style={{
          marginBottom: 20,
          color: '#FFD700',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          a ANESH production
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
          <span style={{
            fontSize: '0.55rem',
            color: '#FFD700',
            marginLeft: '6px',
            opacity: 0.7,
            fontWeight: 'normal',
            verticalAlign: 'super'
          }}>
            by ANESH
          </span>
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
          <span className="num">{totalVotes > 1000? (totalVotes/1000).toFixed(1) + 'k' : totalVotes}</span>
          <span className="label">TOTAL VOTES</span>
        </div>
        <div className="stat">
          <span className="num">{userBattles}</span>
          <span className="label">BATTLES</span>
        </div>
        <div className="stat">
          <span className="num">{rankings[0]?.name.split(' ')[0] || '-'}</span>
          <span className="label">TOP CHAMP</span>
        </div>
        <div className="stat">
          <span className="num">100</span>
          <span className="label">PLAYERS</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 0' }}>
        <button
          onClick={() => {setGameMode("india"); setBattleNumber(battleNumber + 1)}}
          style={{ padding: '8px 20px', background: gameMode === "india"? '#FF671F' : '#333', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🇮🇳 INDIA MODE (50)
        </button>
        <button
          onClick={() => {setGameMode("global"); setBattleNumber(battleNumber + 1)}}
          style={{ padding: '8px 20px', background: gameMode === "global"? '#138808' : '#333', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🌍 GLOBAL MODE (100)
        </button>
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
          <h3>Battle {battleNumber} • {gameMode === "global"? "🌍 Global 100" : "🇮🇳 India 50"}</h3>

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
            <div className="player-card">
              <div className="player-icon">{currentBattle.player1.icon}</div>
              <h3>{currentBattle.player1.name}</h3>
              <div className="role">{currentBattle.player1.role}</div>
              <button
                className="vote-btn"
                onClick={() => handleVote(currentBattle.player1.id)}
                disabled={userVotes[`battle_${battleNumber}_${gameMode}`]}
              >
                VOTE
              </button>
              <div className="vote-percent">
                {currentBattle.player1.votes} votes
              </div>
            </div>

            <div className="vs">VS</div>

            <div className="player-card">
              <div className="player-icon">{currentBattle.player2.icon}</div>
              <h3>{currentBattle.player2.name}</h3>
              <div className="role">{currentBattle.player2.role}</div>
              <button
                className="vote-btn"
                onClick={() => handleVote(currentBattle.player2.id)}
                disabled={userVotes[`battle_${battleNumber}_${gameMode}`]}
              >
                VOTE
              </button>
              <div className="vote-percent">
                {currentBattle.player2.votes} votes
              </div>
            </div>
          </div>

          <button className="skip-btn" onClick={handleSkip}>
            Skip Battle →
          </button>
        </div>
      )}

      {activeTab === "rankings" && (
        <div className="rankings-screen">
          <h2>🏆 TOP 20 RANKINGS</h2>
          <p style={{ textAlign: 'center', color: '#aaa', marginBottom: 20 }}>
            {gameMode === "global"? "🌍 Global 100 Players" : "🇮🇳 India 50 Players"}
          </p>
          <div className="rankings-list">
            {rankings.map((player, index) => (
              <div key={player.id} className="ranking-item">
                <div className="rank">#{index + 1}</div>
                <div className="player-info">
                  <span className="icon">{player.icon}</span>
                  <div>
                    <div className="name">{player.name}</div>
                    <div className="role-small">{player.role}</div>
                  </div>
                </div>
                <div className="votes">
                  <div className="percent">{player.percent}%</div>
                  <div className="count">{player.votes} votes</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="history-screen">
          <h2>📜 YOUR BATTLE HISTORY</h2>
          <p style={{ textAlign: 'center', color: '#aaa', marginBottom: 20 }}>
            Total Battles: {userBattles}
          </p>
          <div className="history-list">
            {Object.entries(userVotes).length === 0? (
              <p style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>
                No battles yet. Start voting! ⚔️
              </p>
            ) : (
              Object.entries(userVotes).reverse().slice(0, 20).map(([battleKey, playerId]) => {
                const player = ALL_PLAYERS[playerId]
                if (!player) return null
                return (
                  <div key={battleKey} className="history-item">
                    <span className="icon">{player.icon}</span>
                    <span className="name">You voted for {player.name}</span>
                    <span className="role-small">{player.role}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ZUCKERBERG STYLE FOOTER - ANESH */}
      <div className="version">
        <span style={{ color: '#888' }}>
          Version 21 - Global Edition | {totalUsers}+ Fans Worldwide
        </span>
        <br/>
        <span style={{ fontSize: '0.7rem', color: '#FFD700', fontWeight: '600' }}>
          © 2026 CrickClash — a ANESH production
        </span>
      </div>
    </div>
  )
}

export default App
