// ---------------------------------------
// FIREBASE SETUP (Shared For All Pages)
// ---------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

import {
  getFirestore,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

// Your real config
const firebaseConfig = {
    apiKey: "AIzaSyBTobbi0JhusMib54iIm8fnVxDd65L3SnQ",
    authDomain: "your-pet-companion.firebaseapp.com",
    projectId: "your-pet-companion",
    storageBucket: "your-pet-companion.appspot.com",
    messagingSenderId: "590584534262",
    appId: "1:590584534262:web:cdc8dd5dbaf938ef2a48d7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT EVERYTHING CORRECTLY (ONLY ONCE)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { app };
