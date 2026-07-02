import React, { useState, useEffect } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, signInWithGoogle } from "./firebase"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleLogin = () => {
    alert("1. Button click ayyindi") // Idi vastunda check chey
    
    signInWithGoogle()
      .then((result) => {
        alert("2. Google popup success: " + result.user.displayName)
      })
      .catch((error) => {
        alert("3. ERROR: " + error.code + " | " + error.message) // Asal error idi
        console.error("Firebase Error:", error)
      })
  }

  const handleLogout = () => {
    signOut(auth)
  }

  if (loading) {
    return <div style={{ padding: 20, fontSize: 20 }}>Loading CrickClash...</div>
  }

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>CrickClash🇮🇳</h1>
      <h2>INDIA'S Fantasy Sport!</h2>
      {user ? (
        <div>
          <h3>Welcome {user.displayName}! 🏆</h3>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout} style={{ padding: 10 }}>
            Logout
          </button>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          style={{ padding: 15, fontSize: 16, cursor: 'pointer' }}
        >
          Continue with Google
        </button>
      )}
    </div>
  )
}

export default App
