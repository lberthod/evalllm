// Importation des fonctions Firebase nécessaires
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,  signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut } from "firebase/auth";
import { getDatabase, ref, set, push, update, onValue, query, limitToLast  } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA80Gp1J30gD2cTOMfVe0BD7j9xaxJxZ0M",
  authDomain: "vrgptt.firebaseapp.com",
  databaseURL: "https://vrgptt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vrgptt",
  storageBucket: "vrgptt.appspot.com",
  messagingSenderId: "747866018411",
  appId: "1:747866018411:web:b8bf59759eb9abdd24572e",
  measurementId: "G-LMC0P3ZQQ0"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// Fournisseurs d'authentification
const googleProvider = new GoogleAuthProvider();


// --- Authentification Firebase ---
// 1. Connexion avec adresse email et mot de passe
export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// 2. Inscription avec adresse email et mot de passe
export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// 3. Connexion anonyme
export function signInAnonymouslyFirebase() {
  return signInAnonymously(auth);
}

// 4. Connexion avec Google
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}


// 5. Déconnexion
export function logout() {
  return signOut(auth);
}

// --- Firebase Realtime Database ---
// 1. Référencer une donnée dans la base de données
export function writeData(path, data) {
  const dbRef = ref(database, path);
  return set(dbRef, data);
}

// Fonction pour obtenir l'utilisateur actuel
export function getCurrentUser() {
  return auth.currentUser;
}

// 2. Pousser une nouvelle donnée dans une liste
export function pushData(path, data) {
  const db = getDatabase();
  const dbRef = ref(db, path);
  return push(dbRef, data); // Retourne la promesse contenant la nouvelle référence
}

// 3. Mettre à jour une donnée existante
export function updateData(path, data) {
  const dbRef = ref(database, path);
  return update(dbRef, data);
}

// 4. Récupérer une donnée en temps réel
export function readData(path, callback) {
  const dbRef = ref(database, path);
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
}

export function getData(path) {
  const db = getDatabase();
  const dbRef = ref(db, path);
  return new Promise((resolve, reject) => {
    onValue(dbRef, (snapshot) => {
      resolve(snapshot);
    }, (error) => {
      reject(error);
    });
  });
}


// Fonction pour écouter les changements dans le champ feedback
export function listenForFeedback(path, callback) {
  const db = getDatabase();
  const feedbackRef = ref(db, path);

  onValue(feedbackRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val()); // Appeler le callback avec la nouvelle valeur
    } else {
      callback(null); // Si aucun feedback, renvoyer null
    }
  }, (error) => {
    console.error("Erreur lors de l'écoute du feedback :", error);
  });
}



// Fonction pour obtenir la clé du dernier answer ajouté
export function getLastAnswerKey(path) {
  const db = getDatabase();
  const dbRef = query(ref(db, path), limitToLast(1)); // Limiter la requête au dernier élément

  return new Promise((resolve, reject) => {
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const lastKey = Object.keys(data)[0]; // Récupérer la clé du dernier élément
        resolve(lastKey); // Résoudre la promesse avec la clé du dernier élément
      } else {
        resolve(null); // Aucun élément trouvé
      }
    }, (error) => {
      reject(error); // Rejeter en cas d'erreur
    });
  });
}

// Fonction pour sauvegarder le quiz dans Firebase
export function saveQuizToFirebase(userId, quizData) {
  const db = getDatabase();

  const quizRef = push(ref(db, `quizzs2/${userId}`)); // Crée un nouvel ID pour le quiz
  set(quizRef, quizData);  // Sauvegarde les données du quiz
}

// Export des modules Firebase
export { auth, database, analytics ,googleProvider };
