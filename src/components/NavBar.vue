<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/">Quiz App</router-link>
    </div>
    <ul class="nav-menu">
      <li><router-link to="/">Home</router-link></li>
      <li v-if="isAuthenticated"><router-link to="/study">Study</router-link></li>
      <li><router-link to="/about">About</router-link></li>
      <li><router-link to="/contact">Contact</router-link></li>
      
      <!-- Show 'Profile', 'Quiz Management' only if the user is logged in -->
      <li v-if="isAuthenticated"><router-link to="/profile">Profile</router-link></li>
      <li v-if="isAuthenticated"><router-link to="/quiz-manage">Create Quiz</router-link></li>

      <!-- Conditional Login/Logout button -->
      <li v-if="isAuthenticated">
        <a @click="logout">Logout</a>
      </li>
      <li v-else>
        <router-link to="/login">Login</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";

export default {
  name: "NavBar",
  data() {
    return {
      isAuthenticated: false, // Track if the user is logged in
    };
  },
  mounted() {
    // Check Firebase authentication state
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.isAuthenticated = true; // User is logged in
      } else {
        this.isAuthenticated = false; // User is not logged in
      }
    });
  },
  methods: {
    logout() {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          this.isAuthenticated = false; // Set to false on logout
          this.$router.push("/"); // Redirect to home
        })
        .catch((error) => {
          console.error("Logout error:", error);
        });
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: #333;
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand a {
  color: white;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
}

.nav-menu {
  list-style-type: none;
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
}

.nav-menu li a {
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: color 0.3s ease;
}

.nav-menu li a:hover {
  color: #00bcd4;
}

.nav-menu li a.active {
  color: #00bcd4; /* Highlight active link */
  font-weight: bold;
}

.nav-menu li a {
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
}

.nav-menu li a:hover {
  background-color: #444;
}

.nav-menu li a.active:hover {
  background-color: #333;
}
</style>
