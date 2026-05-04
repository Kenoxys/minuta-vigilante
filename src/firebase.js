import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Reemplaza estos valores con los de tu consola de Firebase
const firebaseConfig = {
  apiKey: "AIza...", 
  authDomain: "minuta-vigilante.firebaseapp.com",
  projectId: "minuta-vigilante",
  storageBucket: "minuta-vigilante.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
