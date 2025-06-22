// Import the functions you need from the SDKs you need
import { getApps, getApp, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCCquWWyGhxwE9PT_7mgjEsVcW1vNiYJ0g",
    authDomain: "huishoudboekje-c0702.firebaseapp.com",
    projectId: "huishoudboekje-c0702",
    storageBucket: "huishoudboekje-c0702.firebasestorage.app",
    messagingSenderId: "645748182840",
    appId: "1:645748182840:web:8e42e3ff3a39a17fe63bcd",
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
