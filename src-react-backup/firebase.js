import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // 🔥 PEGA TU CONFIG AQUÍ
  apiKey: "AIza...",
  authDomain: "minuta...",
  projectId: "minuta...",
  // ...
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export default app
