import React, { useState, useEffect } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db, signInWithGoogle, handleRedirectResult } from "./firebase";
import "./style.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleRedirectResult()
      .then((result) => {
        if (result) {
          console.log("Welcome:", result.user.displayName)
        }
      })
      .catch((error) => {
        console.log("Error:", error)
      })

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => signOut(auth);

  if (loading) {
    return <div className="container"><h1>Loading CrickClash...</h1></div>
  }

  if (!user) {
    return (
      <div className="container">
        <h1>CrickClash 🇮🇳</h1>
        <h2>IPL Fantasy Game</h2>
        <p>Sign in to create your dream team</p>
        <button onClick={signInWithGoogle}>
          Continue with Google
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Welcome {user.displayName}! 🎉</h1>
      <img src={user.photoURL} alt="profile" width="50" style={{borderRadius: "50%"}} />
      <p>{user.email}</p>
      <button onClick={handleSignOut}>Sign Out</button>
      <h2>Dashboard Coming Soon...</h2>
    </div>
  );
    }
