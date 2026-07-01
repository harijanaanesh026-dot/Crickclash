import { initializeApp } from "firebase/app"
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult 
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyD8vIrNAOqVF1dV7JkEWNEoBvC",
  authDomain: "crickclash-d50fe.firebaseapp.com",
  databaseURL: "https://crickclash-d50fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crickclash-d50fe",
  storageBucket: "crickclash-d50fe.firebasestorage.app",
  messagingSenderId: "999138800615",
  appId: "1:999138800615:web:d68150904231b0b7a5e1c"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// LOGIN FUNCTION - IDHI BUTTON KI VADU
export const signInWithGoogle = () => {
  signInWithRedirect(auth, googleProvider)
}
// RESULT CHECK FUNCTION - APP.JS LO VADU
export const handleRedirectResult = () => {
  return getRedirectResult(auth)
}
