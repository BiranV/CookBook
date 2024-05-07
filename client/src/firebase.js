// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAclwO_fMUaY8CQRqgPD__f2q_DOoBOL6M",
    authDomain: "email-auth-8c66e.firebaseapp.com",
    projectId: "email-auth-8c66e",
    storageBucket: "email-auth-8c66e.appspot.com",
    messagingSenderId: "480554317833",
    appId: "1:480554317833:web:f174f1cd7546c6b9f360d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);