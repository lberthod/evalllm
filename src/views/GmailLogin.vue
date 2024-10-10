<template>
  <div class="login-container">
    <h1>Login</h1>

    <!-- Display current login status -->
    <p v-if="user">
      You are logged in as: 
      <strong v-if="isAnonymous">Anonymous User</strong>
      <strong v-else>{{ user.displayName }}</strong>
    </p>
    <p v-else>You are not logged in</p>

    <!-- Login buttons -->
    <div class="login-options">
      <button v-if="!user" @click="loginAnonymously" class="btn anonymous">Login Anonymously</button>
      <button v-if="!user || isAnonymous" @click="loginWithGoogle" class="btn google">
        Login with Google
      </button>
      <button v-else @click="logout" class="btn logout">Logout</button>
    </div>
  </div>
</template>

<script>
import {  signOut, signInAnonymously } from 'firebase/auth';
import { signInWithGoogle, getCurrentUser ,auth} from '../firebase';

export default {
  name: 'GmailLogin',
  data() {
    return {
      user: null,
      isAnonymous: false
    };
  },
  created() {
    // Vérifier si un utilisateur est connecté au chargement du composant
    this.user = getCurrentUser();

    // Update isAnonymous flag
    if (this.user) {
      this.isAnonymous = auth.currentUser.isAnonymous;
    }

    // Set up a listener to monitor auth state changes
    auth.onAuthStateChanged((user) => {
      this.user = user;
      this.isAnonymous = user ? user.isAnonymous : false;
    });
  },
  methods: {
    async loginWithGoogle() {
      try {
        await signInWithGoogle();
        this.user = getCurrentUser(); // Mettre à jour l'utilisateur après la connexion
        this.isAnonymous = false; // Once logged in with Google, it's not anonymous anymore
        this.$router.push('/profile');
      } catch (error) {
        console.error('Login failed:', error);
      }
    },
    async loginAnonymously() {
      try {
        await signInAnonymously(auth);
        this.user = getCurrentUser();
        this.isAnonymous = true; // Mark as anonymous login
      } catch (error) {
        console.error('Anonymous login failed:', error);
      }
    },
    async logout() {
      try {
        await signOut(auth);
        this.user = null; // Mettre à jour l'état de l'utilisateur après la déconnexion
        this.isAnonymous = false;
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  text-align: center;
  padding: 50px;
  background-color: #f9f9f9;
  border-radius: 10px;
  max-width: 400px;
  margin: 50px auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 20px;
  font-size: 2em;
  color: #333;
}

p {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 30px;
}

.login-options {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.btn.google {
  background-color: #4285f4;
  color: white;
}

.btn.google:hover {
  background-color: #357ae8;
}

.btn.anonymous {
  background-color: #555;
  color: white;
}

.btn.anonymous:hover {
  background-color: #444;
}

.btn.logout {
  background-color: #e74c3c;
  color: white;
}

.btn.logout:hover {
  background-color: #c0392b;
}
</style>
