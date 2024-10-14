<template>
  <div class="profile-container" v-if="user">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <h1>Profil Utilisateur</h1>
        <p>Gérez vos informations personnelles et personnalisez votre expérience.</p>
        <div class="rope"></div> <!-- Corde pour l'effet -->
      </div>
    </header>

    <!-- Profile Information Section -->
    <section class="profile-info">
      <!-- Profile picture with upload functionality -->
      <label class="profile-picture-label" for="fileInput">
        <img :src="profilePhotoURL" alt="Photo de l'utilisateur" />
        <input type="file" id="fileInput" @change="uploadProfilePicture" hidden />
        <p>Cliquez pour changer la photo</p>
      </label>
      <div class="details">
        <p><strong>Nom:</strong> <input v-model="updatedUser.displayName" placeholder="Nom" /></p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>École:</strong> <input v-model="updatedUser.school" placeholder="Votre école" /></p>
        <p><strong>Biographie:</strong> <textarea v-model="updatedUser.biography" placeholder="Votre biographie"></textarea></p>
        <p><strong>Date de connexion:</strong> {{ lastLoginTime }}</p>

        <!-- Theme Selection -->
        <p>
          <strong>Thème:</strong>
          <select v-model="updatedUser.theme">
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </p>

        <!-- Newsletter opt-in -->
        <p>
          <label><input type="checkbox" v-model="updatedUser.newsletter" /> Recevoir la newsletter</label>
        </p>
      </div>
    </section>

    <!-- Save Button -->
    <div class="actions">
      <button @click="saveProfile" class="cta-button with-rope">Enregistrer les modifications</button>
      <div class="rope"></div> <!-- Corde pour l'effet -->
    </div>

    <!-- Profile Settings -->
    <section class="settings">
      <h2>Paramètres de profil</h2>
      <button @click="showDeleteConfirmation" class="delete-button">Supprimer mon compte</button>
    </section>

    <!-- Delete Confirmation Overlay -->
    <div v-if="showOverlay" class="overlay">
      <div class="overlay-content">
        <h3>Confirmer la suppression du compte</h3>
        <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
        <button @click="deleteAccount" class="confirm-button">Oui, supprimer</button>
        <button @click="showOverlay = false" class="cancel-button">Annuler</button>
      </div>
    </div>
  </div>

  <div v-else class="no-user">
    <p>Aucun utilisateur connecté.</p>
  </div>
</template>

<script>
import { getAuth } from "firebase/auth";
import { ref as dbRef, set, get, remove } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from '../firebase'; // Assurez-vous d'importer correctement

export default {
  name: "UserProfile",
  data() {
    return {
      user: null,
      updatedUser: {
        displayName: "",
        school: "",
        biography: "",
        theme: "light",
        newsletter: false,
        profilePhotoURL: "",
      },
      lastLoginTime: "",
      showOverlay: false,
    };
  },
  computed: {
    profilePhotoURL() {
      return this.updatedUser.profilePhotoURL || this.user.photoURL || "/default-avatar.png";
    },
  },
  created() {
    this.fetchUserProfile();
  },
  methods: {
    fetchUserProfile() {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        this.user = currentUser;
        this.lastLoginTime = currentUser.metadata.lastSignInTime;
        this.loadUserProfileFromDB(currentUser.uid);
      } else {
        this.user = null;
      }
    },
    async loadUserProfileFromDB(uid) {
      const userRef = dbRef(database, `users/${uid}`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          this.updatedUser = {
            ...this.updatedUser,
            ...data,
          };
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    },
    async saveProfile() {
      const userRef = dbRef(database, `users/${this.user.uid}`);

      try {
        await set(userRef, this.updatedUser);
        alert("Profil mis à jour avec succès !");
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
      }
    },
    async uploadProfilePicture(event) {
      const file = event.target.files[0];
      if (!file) return;

      const storageReference = storageRef(storage, `profile-pictures/${this.user.uid}`);

      try {
        await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(storageReference);
        this.updatedUser.profilePhotoURL = downloadURL;
        this.saveProfile();
      } catch (error) {
        console.error("Erreur lors du téléchargement de l'image:", error);
      }
    },
    showDeleteConfirmation() {
      this.showOverlay = true;
    },
    async deleteAccount() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = dbRef(database, `users/${user.uid}`);
          await remove(userRef);
          await user.delete();
          alert("Votre compte a été supprimé.");
          this.$router.push("/");
        } catch (error) {
          console.error("Erreur lors de la suppression du compte :", error);
        }
      }
    },
  },
  watch: {
    "$route": "fetchUserProfile",
  },
};
</script>

<style scoped>
/* Main Container */
.profile-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* Hero Section */
.hero {
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  padding: 100px 20px;
  color: white;
  position: relative;
  z-index: 1;
  border-radius: 12px;
  margin-bottom: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.hero p {
  font-size: 20px;
  margin-bottom: 30px;
}

/* Profile Information Section */
.profile-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 40px;
}

.profile-picture-label {
  cursor: pointer;
  text-align: center;
  margin-bottom: 20px;
}

.profile-picture-label img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-picture-label p {
  margin-top: 10px;
  color: #555;
}

.details {
  max-width: 600px;
  width: 100%;
  margin-left: 20px;
  text-align: left;
}

.details p {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}

.details input,
.details textarea,
.details select {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  background-color: #fff;
  margin-top: 5px;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
}

.details textarea {
  resize: vertical;
}

/* Actions Section */
.actions {
  margin-top: 20px;
}

.cta-button {
  padding: 15px 35px;
  font-size: 18px;
  background-color: #FF7043;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.cta-button:hover {
  background-color: #E64A19;
  box-shadow: 0px 8px 16px rgba(255, 112, 67, 0.3);
}

.with-rope {
  position: relative;
}

/* Rope Animation */
.rope {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 4px;
  background-color: #FF7043;
  width: 0;
  transition: width 0.4s ease-in-out, transform 0.2s ease;
  transform-origin: left;
}

.cta-button:active ~ .rope {
  width: 100%;
  transform: translateX(-50%) rotate(10deg);
  animation: wiggle 0.5s ease infinite;
}

@keyframes wiggle {
  0%, 100% {
    transform: translateX(-50%) rotate(10deg);
  }
  50% {
    transform: translateX(-50%) rotate(-10deg);
  }
}

/* Settings Section */
.settings {
  margin-top: 50px;
  text-align: center;
}

.settings h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
}

.delete-button {
  padding: 12px 30px;
  background-color: #e74c3c;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #c0392b;
}

/* Overlay Styles */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  max-width: 500px;
}

.overlay-content h3 {
  font-size: 24px;
  margin-bottom: 15px;
}

.overlay-content p {
  font-size: 18px;
  margin-bottom: 25px;
}

.confirm-button {
  padding: 12px 30px;
  background-color: #e74c3c;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  margin-right: 10px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #c0392b;
}

.cancel-button {
  padding: 12px 30px;
  background-color: #7f8c8d;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #95a5a6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 36px;
  }

  .hero p {
    font-size: 18px;
  }

  .details p {
    font-size: 14px;
  }

  .cta-button {
    font-size: 16px;
    padding: 12px 30px;
  }

  .profile-info {
    flex-direction: column;
    align-items: center;
  }

  .details {
    margin-left: 0;
    margin-top: 20px;
  }
}
</style>
