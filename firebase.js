import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9BfrAh8djKof1Bu6FLG0Fz7X1ONCdm6g",
    authDomain: "crickclash-d30fe.firebaseapp.com",
      databaseURL: "https://crickclash-d30fe-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "crickclash-d30fe",
          storageBucket: "crickclash-d30fe.firebasestorage.app",
            messagingSenderId: "595133866613",
              appId: "1:595133866613:web:dda3f0509462310cb74e3c"
              };

              const app = initializeApp(firebaseConfig);
              export const auth = getAuth(app);
              export const db = getFirestore(app);