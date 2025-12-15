import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// REPLACE with your actual keys from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCH2NpZ3ACWhX9dSQ4I2NfLfxrKjbHNtIA",
  authDomain: "aiqmatetube.firebaseapp.com",
  projectId: "aiqmatetube",
  storageBucket: "aiqmatetube.firebasestorage.app",
  messagingSenderId: "876147046626",
  appId: "1:876147046626:web:8d5aa996c91ba480eb06bb",
  measurementId: "G-0P6Y8X92WP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();