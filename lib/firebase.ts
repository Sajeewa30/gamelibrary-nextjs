// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDi4rZtKdo6ho4iWkYx6JxRicZAsAz2_8g",
  authDomain: "game-library-tracker.firebaseapp.com",
  projectId: "game-library-tracker",
  storageBucket: "game-library-tracker.firebasestorage.app",
  messagingSenderId: "117726613276",
  appId: "1:117726613276:web:30f55d8289c79a077cb4d9",
  measurementId: "G-4CR0C18NB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
// Analytics removed on server to avoid window reference; add back client-only if needed.
