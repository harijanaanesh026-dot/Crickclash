import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,  // <-- REDIRECT KADU, POPUP
  getRedirectResult
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// FIREBASE CONFIG - MALLI COPY CHEY
const firebaseConfig = {
  apiKey: "AIzaSyD9BfrAh8djKof1Bu6FLG0Fz7X10NCdm6g",
  authDomain: "crickclash-d30fe.firebaseapp.com",
  databaseURL: "https://crickclash-d30fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crickclash-d30fe",
  storageBucket: "crickclash-d30fe.firebasestorage.app",
  messagingSenderId: "595133866613",
  appId: "1:595133866613:web:dda3f0509462310cb74e3c"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// POPUP METHOD - MOBILE LO 100% PANI CHESTADI
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider)
}

export const handleRedirectResult = () => {
  return getRedirectResult(auth)
}
