<template>
  <div class="hero-container">
    <!-- Hero Section -->
    <header class="hero">
      <h1>Bienvenue sur QuizApp!</h1>
      <p>Testez vos connaissances sur divers sujets et recevez un feedback instantané. Améliorez vos compétences tout en vous amusant !</p>
      <button @click="startQuiz">Commencez à jouer</button>
    </header>

    <!-- Feature Section -->
    <section class="features">
      <div class="feature">
        <h2>Large choix de sujets</h2>
        <p>Explorez des questions variées allant de la culture générale à la science et bien plus encore !</p>
      </div>
      <div class="feature">
        <h2>Retour instantané</h2>
        <p>Recevez des commentaires détaillés après chaque réponse pour mieux comprendre vos erreurs et progresser rapidement.</p>
      </div>
      <div class="feature">
        <h2>Accédez partout</h2>
        <p>Jouez et apprenez depuis n'importe quel appareil, que vous soyez sur un ordinateur, une tablette ou un smartphone.</p>
      </div>
    </section>

    <!-- Example Question Section -->
    <section class="example-quiz">
      <h2>Essayez une question exemple</h2>
      <p class="question-text">{{ question }}</p>

      <form @submit.prevent="submitAnswer">
        <input v-model="userAnswer" type="text" placeholder="Entrez votre réponse..." required />
        <button type="submit">Envoyer la réponse</button>
      </form>

      <p v-if="submitted && successMessage" class="success">{{ successMessage }}</p>
      <p v-if="submitted && feedbackMessage" class="feedback">{{ feedbackMessage }}</p>
    </section>
  </div>
</template>

<script>
import { getAuth, signInAnonymously } from "firebase/auth";
import { pushData, listenForFeedback } from "@/firebase";

export default {
  data() {
    return {
      question: "Quelle est la capitale du Valais ?", // Static example question
      userAnswer: "",
      successMessage: "",
      feedbackMessage: "",
      submitted: false, // Track if the user has submitted the answer
    };
  },
  mounted() {
    this.checkAuthStatus();
  },
  methods: {
    checkAuthStatus() {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        // If no user is logged in, sign in anonymously
        signInAnonymously(auth)
          .then((result) => {
            console.log("Utilisateur connecté anonymement:", result.user);
          })
          .catch((error) => {
            console.error("Erreur lors de la connexion anonyme:", error.message);
          });
      } else {
        console.log("Utilisateur déjà connecté :", currentUser);
      }
    },
    startQuiz() {
      this.$router.push("/study"); // Navigate to the study/quiz page
    },
    async submitAnswer() {
      const answerData = {
        question: this.question,
        answer: this.userAnswer,
        timestamp: new Date().toISOString(),
      };

      try {
        const newRef = await pushData("/answers", answerData);
        if (newRef && newRef.key) {
          this.successMessage = "Votre réponse a été envoyée avec succès !";
          this.userAnswer = ""; // Clear the input after submission
          this.listenForFeedback(newRef.key);
          this.submitted = true; // Set submitted to true to show feedback
        } else {
          console.error("Aucune clé générée pour la nouvelle réponse.");
        }
      } catch (error) {
        console.error("Erreur lors de l'envoi de la réponse:", error.message);
      }
    },
    listenForFeedback(answerKey) {
      const feedbackPath = `/answers/${answerKey}/feedback`;
      listenForFeedback(feedbackPath, (feedback) => {
        if (feedback) {
          this.feedbackMessage = feedback;
          console.log("Feedback mis à jour :", feedback);
        } else {
          this.feedbackMessage = "Aucun feedback disponible pour le moment.";
        }
      });
    },
  },
};
</script>

<style scoped>
/* Main Container */
.hero-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* Hero Section */
.hero {
  padding: 60px 20px;
  background-color: #f0f4f8;
  border-radius: 12px;
  margin-bottom: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero h1 {
  font-size: 42px;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
}

.hero p {
  font-size: 20px;
  color: #555;
  margin-bottom: 30px;
}

.hero button {
  padding: 15px 35px;
  font-size: 18px;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.hero button:hover {
  background-color: #0056b3;
  box-shadow: 0px 8px 16px rgba(0, 123, 255, 0.2);
}

/* Features Section */
.features {
  display: flex;
  justify-content: space-around;
  margin-bottom: 50px;
}

.feature {
  flex: 1;
  margin: 0 15px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.feature:hover {
  transform: translateY(-5px); /* Slight lift on hover */
}

.feature h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}

.feature p {
  font-size: 16px;
  color: #666;
}

/* Example Quiz Section */
.example-quiz {
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.example-quiz h2 {
  font-size: 28px;
  margin-bottom: 20px;
}

.question-text {
  font-size: 18px;
  margin-bottom: 20px;
  color: #444;
}

input[type="text"] {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 16px;
  background-color: #fafafa;
}

button {
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.success {
  color: green;
  margin-top: 10px;
  font-size: 16px;
}

.feedback {
  color: #1a73e8;
  font-size: 16px;
  margin-top: 10px;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .features {
    flex-direction: column;
  }

  .feature {
    margin-bottom: 20px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .hero button {
    font-size: 16px;
    padding: 12px 30px;
  }

  .example-quiz h2 {
    font-size: 24px;
  }
}
</style>
