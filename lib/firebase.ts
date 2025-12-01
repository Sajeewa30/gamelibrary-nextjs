// Import the functions you need from the SDKs you need
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
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
  measurementId: "G-4CR0C18NB0",
};

const isBrowser = typeof window !== "undefined";

function createFirebaseApp(): FirebaseApp | null {
  if (!isBrowser) return null;
  const existing = getApps();
  return existing.length ? existing[0] : initializeApp(firebaseConfig);
}

const app = createFirebaseApp();

export const auth: Auth | null = app ? getAuth(app) : null;
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;
// Analytics removed on server to avoid window reference; add back client-only if needed.
