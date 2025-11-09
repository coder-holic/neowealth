import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDFTdiGj9lwm6te-BrAjblKxue7b7AxIJE",
  authDomain: "login-60ced.firebaseapp.com",
  projectId: "login-60ced",
  storageBucket: "login-60ced.firebasestorage.app",
  messagingSenderId: "883667275503",
  appId: "1:883667275503:web:a1c8479daa2dea4278551a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);