import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCSPA6P_pAelsHbt75S5Mi1jdGPiIZbjcI",
    authDomain: "careerpilot-exe.firebaseapp.com",
    projectId: "careerpilot-exe",
    storageBucket: "careerpilot-exe.firebasestorage.app",
    messagingSenderId: "494165168074",
    appId: "1:494165168074:web:52636ddc08f1c5e897c933"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);



