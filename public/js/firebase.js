// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGvhBsmkCoLW0_B8ogCKIFkK5CrdPsfmA",
  authDomain: "cs110final-c676b.firebaseapp.com",
  projectId: "cs110final-c676b",
  storageBucket: "cs110final-c676b.appspot.com",
  messagingSenderId: "8974360960",
  appId: "1:8974360960:web:7e803fe7fad6be7de8a165",
  measurementId: "G-MHLHCRXXBJ"
};

const provider = new GoogleAuthProvider();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('google').addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      document.cookie = `__session=${result.user.email};path=/`;
      window.location.href = '/';
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    
      console.log(errorCode, errorMessage)
    });
});

export { auth, provider };