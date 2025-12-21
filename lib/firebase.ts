import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase project configuration
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyBuGQSNQ_IEiRTHh9E5gu_5D4S9iYhepsc",
    authDomain: "poker-pnl-tracker.firebaseapp.com",
    projectId: "poker-pnl-tracker",
    storageBucket: "poker-pnl-tracker.firebasestorage.app",
    messagingSenderId: "1061697537484",
    appId: "1:1061697537484:web:0af215d1ba6c3695ce4969",
    measurementId: "G-Q18CFPSPXT"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

