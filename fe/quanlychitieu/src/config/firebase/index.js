// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCVTTdSV4j7Zbg4ixd0AzfNa8nMjoYy2qE",
    authDomain: "asmreactjs-c0ddc.firebaseapp.com",
    projectId: "asmreactjs-c0ddc",
    storageBucket: "asmreactjs-c0ddc.appspot.com",
    messagingSenderId: "185120760492",
    appId: "1:185120760492:web:c1f9b31f331d2a891cb509"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, getDownloadURL };
