import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBfUsp2qsV7B0ptEVsIlKH8OESU89Iz-Og",
  authDomain: "gym-tracker-fa0b1.firebaseapp.com",
  projectId: "gym-tracker-fa0b1",
  storageBucket: "gym-tracker-fa0b1.firebasestorage.app",
  messagingSenderId: "134363406213",
  appId: "1:134363406213:web:ddbd5c9e15accc9b30aeec"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
