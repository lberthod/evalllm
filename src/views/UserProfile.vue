<template>
  <div class="profile-container" v-if="user">
    <h1>Profil Utilisateur</h1>
    <div class="profile-info">
      <!-- Profile picture with upload functionality -->
      <label class="profile-picture-label" for="fileInput">
        <img :src="profilePhotoURL" alt="User Photo" />
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
          <label><input type="checkbox" v-model="updatedUser.newsletter" /> Accepter de recevoir la newsletter</label>
        </p>
      </div>
    </div>

    <!-- Save button to update profile in database -->
    <div class="actions">
      <button @click="saveProfile">Enregistrer les modifications</button>
    </div>

    <!-- Profile settings -->
    <div class="settings">
      <h2>Paramètres de profil</h2>
      <button @click="showDeleteConfirmation">Supprimer mon compte</button>
    </div>

    <!-- Delete confirmation overlay -->
    <div v-if="showOverlay" class="overlay">
      <div class="overlay-content">
        <h3>Confirmer la suppression du compte</h3>
        <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
        <button @click="deleteAccount">Oui, supprimer</button>
        <button @click="showOverlay = false">Annuler</button>
      </div>
    </div>
  </div>

  <div v-else class="no-user">
    <p>Aucun utilisateur connecté.</p>
  </div>
</template>

<script>
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get, remove } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

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
        profilePhotoURL: "", // Firebase storage URL for profile picture
      },
      lastLoginTime: "",
      showOverlay: false, // State for delete confirmation overlay
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
      const db = getDatabase();
      const userRef = ref(db, `users/${uid}`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          this.updatedUser.displayName = data.displayName || this.user.displayName;
          this.updatedUser.school = data.school || "";
          this.updatedUser.biography = data.biography || "";
          this.updatedUser.theme = data.theme || "light";
          this.updatedUser.newsletter = data.newsletter || false;
          this.updatedUser.profilePhotoURL = data.profilePhotoURL || this.user.photoURL;
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    },
    async saveProfile() {
      const db = getDatabase();
      const userRef = ref(db, `users/${this.user.uid}`);

      try {
        await set(userRef, {
          displayName: this.updatedUser.displayName,
          school: this.updatedUser.school,
          biography: this.updatedUser.biography,
          theme: this.updatedUser.theme,
          newsletter: this.updatedUser.newsletter,
          profilePhotoURL: this.updatedUser.profilePhotoURL,
        });
        alert("Profil mis à jour avec succès !");
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil :", error);
      }
    },
    async uploadProfilePicture(event) {
      const file = event.target.files[0];
      if (!file) return;

      const storage = getStorage();
      const storageReference = storageRef(storage, `profile-pictures/${this.user.uid}`);

      try {
        await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(storageReference);
        this.updatedUser.profilePhotoURL = downloadURL;
        this.saveProfile(); // Save the new photo URL to the database
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
          // Delete user data from Firebase Database
          const db = getDatabase();
          const userRef = ref(db, `users/${user.uid}`);
          await remove(userRef);

          // Delete user from Firebase Authentication
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
.profile-container {
  max-width: 600px;
  margin: 50px auto;
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-picture-label {
  cursor: pointer;
  text-align: center;
}

img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.details {
  text-align: left;
  width: 100%;
}

textarea,
input,
select {
  padding: 8px;
  margin-top: 5px;
  margin-bottom: 10px;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.actions {
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.settings {
  margin-top: 30px;
}

.settings h2 {
  font-size: 22px;
  margin-bottom: 10px;
}

.settings button {
  background-color: red;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.overlay-content h3 {
  margin-bottom: 15px;
}

.overlay-content button {
  margin: 10px;
  padding: 10px 20px;
}
</style>
