<template>
    <div>
      <h1>Login via Gmail</h1>
      <button v-if="!user" @click="loginWithGoogle">Login with Google</button>
      <button v-else @click="logout">Logout</button>
    </div>
  </template>
  
  <script>
  import { signInWithGoogle, getCurrentUser } from '../firebase';
  import { getAuth, signOut } from 'firebase/auth';
  
  export default {
    name: 'GmailLogin',
    data() {
      return {
        user: null
      };
    },
    created() {
      // Vérifier si un utilisateur est connecté au chargement du composant
      this.user = getCurrentUser();
    },
    methods: {
      async loginWithGoogle() {
        try {
          await signInWithGoogle();
          this.user = getCurrentUser(); // Mettre à jour l'utilisateur après la connexion
          this.$router.push('/profile');
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
      async logout() {
        try {
          const auth = getAuth();
          await signOut(auth);
          this.user = null; // Mettre à jour l'état de l'utilisateur après la déconnexion
        } catch (error) {
          console.error('Logout failed:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  