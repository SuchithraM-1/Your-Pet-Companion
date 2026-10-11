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


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT EVERYTHING CORRECTLY (ONLY ONCE)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { app };
