import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCZsW5f9mqdKVSbtWw3mivJQQ0CEJ5ht_Q",
  authDomain: "grievance-207d4.firebaseapp.com",
  projectId: "grievance-207d4",
  storageBucket: "grievance-207d4.firebasestorage.app",
  messagingSenderId: "786037617186",
  appId: "1:786037617186:web:5fb4ae9f82f4fc4bded07b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
