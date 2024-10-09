<template>
  <div class="container">
    <h1>Contactez-nous</h1>
    <p>Pour toute question, n'hésitez pas à nous contacter à <a href="mailto:contact@quizapp.com">contact@quizapp.com</a>.</p>

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

      <button type="submit">Envoyer</button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </form>
  </div>
</template>

<script>
import { getDatabase, ref, push } from 'firebase/database';

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

      const db = getDatabase();
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
/* Main container for the contact page */
.container {
  max-width: 700px;
  margin: 50px auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Page title */
h1 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #333;
}

/* Paragraph and link styles */
p {
  font-size: 18px;
  color: #555;
  margin-bottom: 30px;
}

p a {
  color: #007bff;
  text-decoration: none;
}

p a:hover {
  text-decoration: underline;
}

/* Contact form styles */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

/* Form group container */
.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 10px;
}

.form-group label {
  font-size: 16px;
  color: #555;
  margin-bottom: 5px;
}

/* Input and textarea styles */
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

/* Button styles */
button {
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

button:hover {
  background-color: #0056b3;
  box-shadow: 0 6px 12px rgba(0, 123, 255, 0.2);
}

/* Success and error message styles */
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

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }

  h1 {
    font-size: 28px;
  }

  input, textarea {
    font-size: 14px;
  }

  button {
    font-size: 14px;
    padding: 10px 25px;
  }
}
</style>
