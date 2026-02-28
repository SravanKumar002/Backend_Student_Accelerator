import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuDIcxPh5vPij8afyUPXCDxRJtF-igB1g",
    authDomain: "student-accerator.firebaseapp.com",
    projectId: "student-accerator",
    storageBucket: "student-accerator.firebasestorage.app",
    messagingSenderId: "1091377115228",
    appId: "1:1091377115228:web:d57b811a96ddf3bf2b7699",
    measurementId: "G-H078JEWZF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
