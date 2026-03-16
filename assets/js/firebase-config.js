import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAsJIJ9txVU4EAaudlBniXOPbj0ZUfH9M0",
  authDomain: "unisex-60590.firebaseapp.com",
  projectId: "unisex-60590",
  storageBucket: "unisex-60590.firebasestorage.app",
  messagingSenderId: "73987498084",
  appId: "1:73987498084:web:a4c498f2b558b7b1aa7f71",
  measurementId: "G-6SJ2J4MSRB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app, "https://unisex-60590-default-rtdb.firebaseio.com");

export { app, auth, db };
