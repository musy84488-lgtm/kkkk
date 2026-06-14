// ============================================
// خطوة وشفاء - Firebase Initialization
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyBTnF0rn5xiZcKXIVP7iC80iimXbxaRIo8",
    authDomain: "khatwa-wa-shifa.firebaseapp.com",
    projectId: "khatwa-wa-shifa",
    storageBucket: "khatwa-wa-shifa.firebasestorage.app",
    messagingSenderId: "218945129155",
    appId: "1:218945129155:web:51fc783386202983323076"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
