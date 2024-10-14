<template>
  <div class="contact-container">
    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <h1>Contactez-nous</h1>
        <p>Pour toute question, n'hésitez pas à nous contacter via le formulaire ci-dessous.</p>
        <div class="rope"></div> <!-- Corde pour l'effet -->
      </div>
    </header>

    <!-- Contact Form Section -->
    <section class="form-section">
      <form @submit.prevent="submitContactForm" class="contact-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="formData.email" type="email" id="email" placeholder="Votre email" required />
        </div>

        <div class="form-group">
          <label for="title">Sujet:</label>
          <input v-model="formData.title" type="text" id="title" placeholder="Sujet de votre message" required />
        </div>

        <div class="form-group">
          <label for="message">Message:</label>
          <textarea v-model="formData.message" id="message" rows="6" placeholder="Votre message" required></textarea>
        </div>

        <button type="submit" class="cta-button with-rope">Envoyer</button>
        <div class="rope"></div> <!-- Corde pour l'effet -->

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
      </form>
    </section>
  </div>
</template>

<script>
import { ref, push } from 'firebase/database';
import { database } from '../firebase';  // Assurez-vous d'importer Firebase correctement

export default {
  name: "ContactView",
  data() {
    return {
      formData: {
        email: '',
        title: '',
        message: ''
      },
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async submitContactForm() {
      // Check if all fields are filled
      if (!this.formData.email || !this.formData.title || !this.formData.message) {
        this.errorMessage = "Veuillez remplir tous les champs avant de soumettre le formulaire.";
        return;
      }

      const db = database;
      const contactRef = ref(db, 'contacts_form');

      // Prepare contact data
      const contactData = {
        email: this.formData.email,
        title: this.formData.title,
        message: this.formData.message,
        timestamp: new Date().toISOString()
      };

      try {
        await push(contactRef, contactData);
        this.successMessage = "Votre message a été envoyé avec succès!";
        this.errorMessage = ""; // Clear any previous error messages
        this.formData.email = ''; // Clear the form fields
        this.formData.title = '';
        this.formData.message = '';
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error.message);
        this.errorMessage = "Une erreur s'est produite lors de l'envoi de votre message.";
      }
    }
  }
};
</script>

<style scoped>
/* Main Container */
.contact-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* Hero Section */
.hero {
  background-image: url('@/assets/back.png'); /* Image de fond personnalisée */
  background-size: cover;
  background-position: center;
  padding: 100px 20px;
  color: white;
  text-align: center;
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

/* Form Section */
.form-section {
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 700px;
}

/* Contact Form Styles */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

/* Form Group Styles */
.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.form-group label {
  font-size: 16px;
  color: #555;
  margin-bottom: 5px;
}

/* Input and Textarea Styles */
input, textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  background-color: #f0f0f0;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus, textarea:focus {
  border-color: #007bff;
  box-shadow: inset 0 2px 8px rgba(0, 123, 255, 0.2);
}

/* CTA Button Styles */
.cta-button {
  padding: 15px 35px;
  font-size: 18px;
  background-color: #FF7043;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
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

/* Rope animation */
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

/* Wiggle animation for the rope */
@keyframes wiggle {
  0%, 100% {
    transform: translateX(-50%) rotate(10deg);
  }
  50% {
    transform: translateX(-50%) rotate(-10deg);
  }
}

/* Success and Error Message Styles */
.success {
  color: green;
  margin-top: 20px;
  font-size: 16px;
}

.error {
  color: red;
  margin-top: 20px;
  font-size: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 36px;
  }

  .hero p {
    font-size: 18px;
  }

  .cta-button {
    font-size: 16px;
    padding: 12px 30px;
  }

  .form-section {
    padding: 20px;
  }

  input, textarea {
    font-size: 14px;
  }
}
</style>
