import React, { useState, useEffect } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, signInWithGoogle, handleRedirectResult } from "./firebase"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // 1. FIRST: Check if we came back from Google
    handleRedirectResult()
      .then((result) => {
        if (result) {
          console.log("Login success:", result.user.displayName)
        }
      })
      .catch((err) => {
        console.error("Redirect Error:", err)
        setError(err.message)
      })
      .finally(() => {
        // 2. THEN: Start listening for login state
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser)
          setLoading(false) // IMPORTANT: Stop loading here
        })
        return unsubscribe
      })
  }, [])

  const handleLogout = () => {
    signOut(auth)
  }

  if (loading) {
    return <div style={{ padding: 20, fontSize: 20 }}>Loading CrickClash...</div>
  }

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>
  }

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>CrickClash🇮🇳</h1>
      {user ? (
        <div>
          <h2>Welcome {user.displayName}! 🏆</h2>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout} style={{ padding: 10 }}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <h3>INDIA'S Fantasy Game!</h3>
          <button 
            onClick={signInWithGoogle}
            style={{ padding: 15, fontSize: 16, cursor: 'pointer' }}
          >
            Continue with Google
          </button>
        </div>
      )}
    </div>
  )
}

export default App
