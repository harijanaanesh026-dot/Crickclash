import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import "./style.css";

export default function App() {
  const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

      useEffect(() => {
          const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                      setLoading(false);
                          });
                              return () => unsubscribe();
                                }, []);

                                  const signInWithGoogle = async () => {
                                      const provider = new GoogleAuthProvider();
                                          try {
                                                await signInWithPopup(auth, provider);
                                                    } catch (error) {
                                                          console.error("Login Error:", error);
                                                              }
                                                                };

                                                                  const handleSignOut = () => signOut(auth);

                                                                    if (loading) {
                                                                        return <div className="container"><h1>Loading CrickClash... 🇮🇳</h1></div>;
                                                                          }

                                                                            if (!user) {
                                                                                return (
                                                                                      <div className="container">
                                                                                              <h1>CrickClash 🇮🇳</h1>
                                                                                                      <h2>IPL Fantasy Game</h2>
                                                                                                              <p>Sign in to build your dream team!</p>
                                                                                                                      <button onClick={signInWithGoogle}>Sign in with Google</button>
                                                                                                                            </div>
                                                                                                                                );
                                                                                                                                  }

                                                                                                                                    return (
                                                                                                                                        <div className="container">
                                                                                                                                              <h1>CrickClash 🇮🇳</h1>
                                                                                                                                                    <p>Welcome, {user.displayName}!</p>
                                                                                                                                                          <img src={user.photoURL} alt="profile" className="profile-pic" />
                                                                                                                                                                <button onClick={handleSignOut}>Sign Out</button>
                                                                                                                                                                      <h2>App Ready! </h2>
                                                                                                                                                                            <p>8 hours 50 mins taruvata gelicham ra mava!</p>
                                                                                                                                                                                </div>
                                                                                                                                                                                  );
                                                                                                                                                                                  }
