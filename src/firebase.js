import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// NEE CORRECT FIREBASE CONFIG - d30fc
const firebaseConfig = {
  apiKey: "AIzaSyD9BfRh8djKqf1bu6FLq0Fx7k1KWCm6g",
  authDomain: "crickclash-d30fc.firebaseapp.com",
  databaseURL: "https://crickclash-d30fc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crickclash-d30fc",
  storageBucket: "crickclash-d30fc.firebasestorage.app",
  messagingSenderId: "595133866613",
  appId: "1:595133866613:web:d0a509462310bb74e3c"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// LOGIN FUNCTION - IDHI BUTTON KI VADU
export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider)
}

// RESULT CHECK FUNCTION - APP.JS LO VADU
export const handleRedirectResult = () => {
  return getRedirectResult(auth)
}
