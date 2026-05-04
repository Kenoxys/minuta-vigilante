import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Reemplaza estos valores con los de tu consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDukF0Hkxa1hFQp9mFkIg5tDQaHcEvoFSI",
  authDomain: "minutavigilante.firebaseapp.com",
  projectId: "minutavigilante",
  storageBucket: "minutavigilante.firebasestorage.app",
  messagingSenderId: "764983749895",
  appId: "1:764983749895:web:b34373a987533aa25029a2",
  measurementId: "G-N2XV80BXJX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
