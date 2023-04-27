import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD66cd1_hT2hG8IHRJL_ixydUq9vXF9fpo",
    authDomain: "musicify-2d090.firebaseapp.com",
    projectId: "musicify-2d090",
    storageBucket: "musicify-2d090.appspot.com",
    messagingSenderId: "324170047090",
    appId: "1:324170047090:web:05e4ab6fc07fbb584faceb",
    measurementId: "G-NKWYP11LQ1"
}

const app = initializeApp(firebaseConfig); 

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;