import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8GsU_ihOm03fvLStaJhkP0XtJN1W8X4U",
  authDomain: "ai-webapp-6b850.firebaseapp.com",
  projectId: "ai-webapp-6b850",
  storageBucket: "ai-webapp-6b850.firebasestorage.app",
  messagingSenderId: "960708617262",
  appId: "1:960708617262:web:57ca8770fec32e4c0f2bbf",
  measurementId: "G-52M792YFLQ"
};

// Use singleton pattern to prevent multiple instances during hot reloads
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
