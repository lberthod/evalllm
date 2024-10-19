<template>
    <div class="leaderboard-container">
      <h1>Classement des Utilisateurs</h1>
      <div v-if="loading" class="loading-message">Chargement...</div>
      <div v-else>
        <div v-if="users.length === 0">
          <p>Aucun utilisateur n'a encore de résultats enregistrés.</p>
        </div>
        <div v-else>
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Nom d'utilisateur</th>
                <th>Résultats Corrects</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in users" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ user.displayName || 'Utilisateur Anonyme' }}</td>
                <td>{{ user.results || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onValue, getDatabase } from "firebase/database";
  
  export default {
    data() {
      return {
        users: [],
        loading: true
      };
    },
    created() {
      this.fetchUsers();
    },
    methods: {
      fetchUsers() {
        const db = getDatabase();
        const usersRef = ref(db, "users");
  
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const usersArray = Object.keys(data).map((key) => ({
              ...data[key],
              uid: key,
            }));
  
            // Trier les utilisateurs par nombre de résultats corrects décroissant
            this.users = usersArray.sort((a, b) => (b.results || 0) - (a.results || 0));
          }
          this.loading = false;
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .leaderboard-container {
    max-width: 1200px;
    margin: 50px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .loading-message {
    text-align: center;
    font-size: 18px;
    color: #777;
  }
  
  .leaderboard-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  .leaderboard-table th,
  .leaderboard-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .leaderboard-table th {
    background-color: #FF7043;
    color: white;
    text-align: center;
  }
  
  .leaderboard-table td {
    text-align: center;
  }
  
  .leaderboard-table tr:hover {
    background-color: #f1f1f1;
  }
  
  </style>
  