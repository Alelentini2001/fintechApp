"use client";
import { useAuth } from "@clerk/nextjs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"
import { doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0mrd4KW5l6wfLKbzGSpZXLpKFwEPsUZk",
  authDomain: "quply-2023.firebaseapp.com",
  projectId: "quply-2023",
  storageBucket: "quply-2023.appspot.com",
  messagingSenderId: "493865552783",
  appId: "1:493865552783:web:a5fbee48a73b2cff3399fa",
};

// Connect to your Firebase app
const app = initializeApp(firebaseConfig);
// Connect to your Firestore database
const db = getFirestore(app);
// Connect to Firebase auth
const auth = getAuth(app);

const storage = getStorage(app)

export { app, db, auth, storage };
