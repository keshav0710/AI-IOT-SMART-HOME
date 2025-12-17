import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 
const firebaseConfig = {
  apiKey: "AIzaSyC44s2jxX1h_-fv3j_kmLvXwTeD9WpelBQ",
  authDomain: "smart-home-esp32-1406c.firebaseapp.com",
  databaseURL:
    "https://smart-home-esp32-1406c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-home-esp32-1406c",
  storageBucket: "smart-home-esp32-1406c.appspot.com",
  messagingSenderId: "543779307127",
  appId: "1:543779307127:web:d22bba92c6499112021072",
};

// ✅ Prevent multiple Firebase instances
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Initialize services
const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Firestore instance added

// ✅ Export all
export {
  db, // <-- this fixes the chatbot import
  database,
  auth,
  ref,
  set,
  onValue,
  signInWithEmailAndPassword,
  signOut,
};
